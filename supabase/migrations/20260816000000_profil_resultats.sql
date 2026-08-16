-- ============================================================
-- Résultats des tests de typologie (langages de l'amour, attachement,
-- relation karmique...).
--
-- quiz_completions sait combien de fois un test a été joué, pas ce qu'il a
-- donné. Or la page des 5 langages de l'amour promet désormais une
-- répartition réelle : « voici comment se répartissent les langages chez
-- les X personnes qui ont passé le test ». Aucun concurrent francophone ne
-- publie ce chiffre, et c'est précisément ce qui rend la page citable.
--
-- On ne stocke rien de nominatif ni aucune réponse individuelle : le slug du
-- test, le profil dominant obtenu, la langue. Impossible de remonter à une
-- personne ou à une grille de réponses.
--
-- La table est générique : tout test de typologie peut y déposer son
-- résultat, sans nouvelle migration.
--
-- Tant que ce fichier n'est pas appliqué, la page reste fonctionnelle : la
-- section des statistiques se masque simplement, comme le fait déjà la
-- courbe du test de pureté.
--
-- Déploiement : le workflow « Apply DB migrations » l'applique tout seul si
-- le secret SUPABASE_DB_URL existe. Sinon, coller ce fichier une fois dans
-- Supabase > SQL Editor > New Query.
--
-- Idempotent, réexécutable sans risque.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profil_resultats (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Clé de route du test ('testLangageAmour', 'testAttachement'...).
  quiz_slug text NOT NULL CHECK (char_length(quiz_slug) BETWEEN 1 AND 60),
  -- Profil dominant obtenu ('words', 'acts', 'gifts', 'time', 'touch'...).
  profil text NOT NULL CHECK (char_length(profil) BETWEEN 1 AND 40),
  lang text NOT NULL DEFAULT 'fr' CHECK (char_length(lang) BETWEEN 2 AND 5),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS profil_resultats_quiz_idx
  ON public.profil_resultats (quiz_slug, profil);

ALTER TABLE public.profil_resultats ENABLE ROW LEVEL SECURITY;

-- N'importe qui peut déposer son résultat, personne ne peut lire la table
-- ligne à ligne : les chiffres publics passent par la fonction ci-dessous,
-- qui ne rend que des agrégats.
DROP POLICY IF EXISTS "profil_resultats_insert_anon" ON public.profil_resultats;
CREATE POLICY "profil_resultats_insert_anon" ON public.profil_resultats
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- ── Agrégats publics ────────────────────────────────────────────────────
-- Un aller-retour rend la répartition complète : chaque profil, son
-- effectif, et le total du test pour calculer les pourcentages côté page.
DROP FUNCTION IF EXISTS public.get_profil_stats(text);

CREATE OR REPLACE FUNCTION public.get_profil_stats(p_quiz_slug text)
RETURNS TABLE(profil text, effectif bigint, total bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH lignes AS (
    SELECT r.profil FROM public.profil_resultats r WHERE r.quiz_slug = p_quiz_slug
  ),
  socle AS (SELECT count(*)::bigint AS total FROM lignes)
  SELECT lignes.profil,
         count(*)::bigint AS effectif,
         socle.total
  FROM lignes, socle
  GROUP BY lignes.profil, socle.total
  ORDER BY 2 DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_profil_stats(text) TO anon, authenticated;
