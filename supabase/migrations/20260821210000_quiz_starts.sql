-- ============================================================
-- Parties LANCÉES (et pas seulement terminées).
--
-- quiz_completions ne sait que combien de parties sont allées jusqu'à
-- l'écran de résultat. Elle ne dit rien de celles qui ont été commencées
-- puis abandonnées, alors que c'est justement là que se lit l'engagement :
-- un test que tout le monde ouvre et que personne ne finit est un test trop
-- long, mal cadré ou décevant.
--
-- Cette table est le pendant exact de quiz_completions : même identifiant de
-- page (quiz_slug), même langue, même horodatage. Le tableau de bord peut
-- donc rapprocher les deux et sortir un taux de finition par page.
--
-- Ce qui compte comme un lancement : la première interaction de la personne
-- à l'intérieur du moteur (un clic sur un bouton, un choix, une saisie de
-- prénom). Pas une simple visite : quelqu'un qui arrive et repart sans rien
-- toucher n'a pas lancé le test, il a lu la page. Une seule ligne par page
-- et par session, exactement comme pour les complétions.
--
-- Rien de nominatif n'est stocké : un identifiant de page, une langue, une
-- date. Aucune réponse, aucun score, aucun identifiant de visiteur.
--
-- Déploiement : le workflow « Apply DB migrations » applique ce fichier tout
-- seul si le secret SUPABASE_DB_URL existe. Sinon, coller ce fichier une
-- fois dans Supabase > SQL Editor > New Query.
--
-- Idempotent, réexécutable sans risque.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.quiz_starts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_slug text NOT NULL,
  lang text,
  created_at timestamptz DEFAULT now()
);

-- Les deux index servent les deux agrégats : le total par page, et les
-- séries quotidiennes filtrées sur une fenêtre de dates.
CREATE INDEX IF NOT EXISTS quiz_starts_slug_idx ON public.quiz_starts (quiz_slug);
CREATE INDEX IF NOT EXISTS quiz_starts_created_idx ON public.quiz_starts (created_at);

ALTER TABLE public.quiz_starts ENABLE ROW LEVEL SECURITY;

-- N'importe qui peut signaler un lancement, personne ne peut lire la table
-- ligne à ligne : les chiffres passent par les fonctions ci-dessous, qui ne
-- rendent que des agrégats. Même posture que quiz_completions.
DROP POLICY IF EXISTS "quiz_starts_insert_anon" ON public.quiz_starts;
CREATE POLICY "quiz_starts_insert_anon" ON public.quiz_starts
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- ── Total, toutes pages confondues ──────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_quiz_starts_total()
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*)::bigint FROM public.quiz_starts;
$$;

-- ── Total par page ──────────────────────────────────────────────────────
-- Même forme de retour que get_quiz_counts, pour que le tableau de bord
-- puisse rapprocher les deux jeux de lignes sans traitement particulier.
CREATE OR REPLACE FUNCTION public.get_quiz_starts_counts()
RETURNS TABLE(quiz_slug text, total bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.quiz_slug, count(*)::bigint AS total
  FROM public.quiz_starts s
  GROUP BY s.quiz_slug
  ORDER BY 2 DESC;
$$;

-- ── Lancements par page ET par jour ─────────────────────────────────────
-- Même traitement du fuseau que get_quiz_daily_par_quiz : la base groupe
-- dans le fuseau de la personne qui regarde, sinon les journées UTC et les
-- journées locales divergent en soirée. Un fuseau invalide retombe sur UTC
-- plutôt que de faire échouer la requête.
CREATE OR REPLACE FUNCTION public.get_quiz_starts_daily_par_quiz(
  p_days integer DEFAULT 62,
  p_tz   text    DEFAULT 'UTC'
)
RETURNS TABLE(quiz_slug text, day date, total bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH tz AS (
    SELECT CASE
      WHEN p_tz IS NULL THEN 'UTC'
      WHEN EXISTS (SELECT 1 FROM pg_timezone_names WHERE name = p_tz) THEN p_tz
      ELSE 'UTC'
    END AS nom
  )
  SELECT s.quiz_slug,
         (s.created_at AT TIME ZONE tz.nom)::date AS day,
         count(*)::bigint AS total
  FROM public.quiz_starts s, tz
  -- Fenêtre élargie d'un jour : le décalage de fuseau peut faire entrer dans
  -- la période un lancement enregistré juste avant la borne.
  WHERE s.created_at >= (now() - make_interval(days => GREATEST(p_days, 1) + 1))
  GROUP BY s.quiz_slug, (s.created_at AT TIME ZONE tz.nom)::date
  ORDER BY 1, 2;
$$;

GRANT EXECUTE ON FUNCTION public.get_quiz_starts_total() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_quiz_starts_counts() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_quiz_starts_daily_par_quiz(integer, text) TO anon, authenticated;
