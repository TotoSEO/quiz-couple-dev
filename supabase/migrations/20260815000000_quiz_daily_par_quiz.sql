-- ============================================================
-- Complétions par quiz ET par jour, en un seul appel.
--
-- Le tableau de bord affiche désormais, à côté de chaque barre, le nombre
-- de parties de la journée en cours, ainsi qu'un comparatif des pages en
-- hausse et en baisse (aujourd'hui contre hier, 7 jours contre les 7
-- précédents, 30 jours contre les 30 précédents). Ces vues ont besoin de
-- la série quotidienne de chaque quiz. Sans cette fonction, le tableau de
-- bord se replie sur un appel get_quiz_daily par quiz : une trentaine de
-- requêtes au lieu d'une seule.
--
-- Même traitement du fuseau que get_quiz_daily_total : la base groupe par
-- jour dans le fuseau de la personne qui regarde, sinon les journées UTC
-- et les journées locales divergent en soirée.
--
-- Déploiement : le workflow « Apply DB migrations » applique ce fichier
-- automatiquement, mais uniquement si le secret SUPABASE_DB_URL existe.
-- Tant qu'il n'est pas renseigné, coller ce fichier une fois dans
-- Supabase > SQL Editor > New Query.
--
-- Idempotent, réexécutable sans risque.
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_quiz_daily_par_quiz(
  p_days integer DEFAULT 62,
  p_tz   text    DEFAULT 'UTC'
)
RETURNS TABLE(quiz_slug text, day date, total bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Un fuseau invalide ferait échouer toute la requête : on retombe sur UTC
  -- plutôt que de renvoyer une erreur au tableau de bord.
  WITH tz AS (
    SELECT CASE
      WHEN p_tz IS NULL THEN 'UTC'
      WHEN EXISTS (SELECT 1 FROM pg_timezone_names WHERE name = p_tz) THEN p_tz
      ELSE 'UTC'
    END AS nom
  )
  SELECT c.quiz_slug,
         (c.created_at AT TIME ZONE tz.nom)::date AS day,
         count(*)::bigint AS total
  FROM public.quiz_completions c, tz
  -- La fenêtre est élargie d'un jour : le décalage de fuseau peut faire
  -- entrer dans la période une partie enregistrée juste avant la borne.
  WHERE c.created_at >= (now() - make_interval(days => GREATEST(p_days, 1) + 1))
  GROUP BY c.quiz_slug, (c.created_at AT TIME ZONE tz.nom)::date
  ORDER BY 1, 2;
$$;

GRANT EXECUTE ON FUNCTION public.get_quiz_daily_par_quiz(integer, text) TO anon, authenticated;
