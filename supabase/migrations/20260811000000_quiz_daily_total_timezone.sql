-- ============================================================
-- Découpage quotidien dans le fuseau de la personne qui regarde.
--
-- La version précédente groupait avec created_at::date. Sur Supabase la
-- session tourne en UTC, donc « le jour » était le jour UTC, alors que le
-- tableau de bord construit ses colonnes à partir de la date locale du
-- navigateur. Les deux ne coïncident pas.
--
-- Conséquence concrète : en France l'été (UTC+2), entre minuit et deux
-- heures du matin, toute partie jouée est enregistrée sous la date de la
-- veille en UTC. La colonne « aujourd'hui » affichait donc zéro, et la
-- barre de la veille absorbait la soirée en cours. Rien n'était perdu,
-- mais le graphique mentait pendant deux heures chaque nuit.
--
-- On accepte désormais un fuseau et on caste dedans. Le paramètre a une
-- valeur par défaut, donc les appels existants continuent de fonctionner.
--
-- À coller une fois dans Supabase > SQL Editor > New Query.
-- Idempotent, réexécutable sans risque.
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_quiz_daily_total(
  p_days integer DEFAULT 30,
  p_tz   text    DEFAULT 'UTC'
)
RETURNS TABLE(day date, total bigint)
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
  SELECT (c.created_at AT TIME ZONE tz.nom)::date AS day,
         count(*)::bigint AS total
  FROM public.quiz_completions c, tz
  -- La fenêtre est élargie d'un jour : le décalage de fuseau peut faire
  -- entrer dans la période une partie enregistrée juste avant la borne.
  WHERE c.created_at >= (now() - make_interval(days => GREATEST(p_days, 1) + 1))
  GROUP BY (c.created_at AT TIME ZONE tz.nom)::date
  ORDER BY 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_quiz_daily_total(integer, text) TO anon, authenticated;

-- Même correction pour la courbe d'un quiz en particulier, qui sert de
-- repli quand la fonction ci-dessus n'est pas déployée.
CREATE OR REPLACE FUNCTION public.get_quiz_daily(
  p_slug text,
  p_days integer DEFAULT 30,
  p_tz   text    DEFAULT 'UTC'
)
RETURNS TABLE(day date, total bigint)
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
  SELECT (c.created_at AT TIME ZONE tz.nom)::date AS day,
         count(*)::bigint AS total
  FROM public.quiz_completions c, tz
  WHERE c.quiz_slug = p_slug
    AND c.created_at >= (now() - make_interval(days => GREATEST(p_days, 1) + 1))
  GROUP BY (c.created_at AT TIME ZONE tz.nom)::date
  ORDER BY 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_quiz_daily(text, integer, text) TO anon, authenticated;
