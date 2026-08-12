-- ============================================================
-- Scores du test de pureté.
--
-- La page annonce un score moyen et une courbe de répartition « basés sur
-- toutes les personnes qui ont fait le test ». Il faut donc stocker les
-- scores : quiz_completions ne retient que le slug et la langue, elle sait
-- combien de parties ont eu lieu, pas ce qu'elles ont donné.
--
-- On ne stocke rien de nominatif : un mode, un score, le maximum du pool
-- joué et le pourcentage. Aucune réponse individuelle n'est enregistrée.
--
-- Tant que ce fichier n'est pas appliqué, la page reste fonctionnelle : le
-- moteur masque simplement la moyenne et la courbe, et garde le compteur de
-- parties, qui vient de quiz_completions.
--
-- Déploiement : le workflow « Apply DB migrations » l'applique tout seul si
-- le secret SUPABASE_DB_URL existe. Sinon, coller ce fichier une fois dans
-- Supabase > SQL Editor > New Query.
--
-- Idempotent, réexécutable sans risque.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.purete_scores (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  -- 'solo' ou 'couple' ; 'ado' distingue la version tout public, dont le
  -- maximum n'est pas le même et qu'il ne faut donc pas mélanger.
  mode text NOT NULL CHECK (mode IN ('solo', 'couple', 'solo-ado', 'couple-ado')),
  score integer NOT NULL CHECK (score >= 0),
  score_max integer NOT NULL CHECK (score_max > 0),
  pct smallint NOT NULL CHECK (pct BETWEEN 0 AND 100),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS purete_scores_mode_idx ON public.purete_scores (mode);

ALTER TABLE public.purete_scores ENABLE ROW LEVEL SECURITY;

-- N'importe qui peut déposer son score, personne ne peut lire la table ligne
-- à ligne : les chiffres publics passent par la fonction ci-dessous, qui ne
-- rend que des agrégats.
DROP POLICY IF EXISTS "purete_scores_insert_anon" ON public.purete_scores;
CREATE POLICY "purete_scores_insert_anon" ON public.purete_scores
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- ── Agrégats publics ────────────────────────────────────────────────────
-- Un seul aller-retour donne le compteur, la moyenne et la courbe. Les
-- pourcentages sont rangés en vingt tranches de cinq points : assez fin pour
-- dessiner une courbe lisible, trop grossier pour reconstituer un score
-- individuel.
DROP FUNCTION IF EXISTS public.get_purete_stats(text);

CREATE OR REPLACE FUNCTION public.get_purete_stats(p_mode text DEFAULT NULL)
RETURNS TABLE(total bigint, moyenne integer, moyenne_pct integer, tranche smallint, effectif bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH lignes AS (
    SELECT s.score, s.pct
    FROM public.purete_scores s
    WHERE p_mode IS NULL OR s.mode = p_mode
  ),
  socle AS (
    SELECT count(*)::bigint AS total,
           COALESCE(round(avg(score))::integer, 0) AS moyenne,
           COALESCE(round(avg(pct))::integer, 0) AS moyenne_pct
    FROM lignes
  ),
  paquets AS (
    SELECT LEAST(pct / 5, 19)::smallint AS tranche, count(*)::bigint AS effectif
    FROM lignes GROUP BY 1
  )
  SELECT socle.total, socle.moyenne, socle.moyenne_pct,
         paquets.tranche, paquets.effectif
  FROM socle LEFT JOIN paquets ON true
  ORDER BY paquets.tranche;
$$;

GRANT EXECUTE ON FUNCTION public.get_purete_stats(text) TO anon, authenticated;
