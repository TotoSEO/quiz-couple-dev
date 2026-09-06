-- ============================================================
-- Parties à distance : la série quotidienne et les comptes par page à
-- partir d'une date.
--
-- L'onglet « À distance » de l'admin compare les lancements à distance aux
-- lancements de toutes les pages. Le mode n'existe que depuis le 7
-- septembre 2026 : comparer à des lancements plus anciens fausse la part et
-- la courbe. Ces deux fonctions permettent de tout borner à cette date, dans
-- le fuseau de la personne qui regarde, comme les autres séries du tableau.
--
-- Complète 20260906120000_salon_parties.sql. Idempotent.
-- ============================================================

-- ── Départs et fins par jour ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_salon_daily(
  p_days integer DEFAULT 62,
  p_tz   text    DEFAULT 'UTC'
)
RETURNS TABLE(day date, departs bigint, fins bigint)
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
  SELECT (s.created_at AT TIME ZONE tz.nom)::date AS day,
         count(*) FILTER (WHERE s.etape = 'depart')::bigint AS departs,
         count(*) FILTER (WHERE s.etape = 'fin')::bigint    AS fins
  FROM public.salon_parties s, tz
  -- Fenêtre élargie d'un jour : le décalage de fuseau peut faire entrer dans
  -- la période une ligne enregistrée juste avant la borne.
  WHERE s.created_at >= now() - make_interval(days => GREATEST(p_days, 1) + 1)
  GROUP BY 1
  ORDER BY 1;
$$;

-- ── Par page, à partir d'une date locale ────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_salon_counts_depuis(
  p_depuis date,
  p_tz     text DEFAULT 'UTC'
)
RETURNS TABLE(quiz_slug text, departs bigint, fins bigint)
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
         count(*) FILTER (WHERE s.etape = 'depart')::bigint AS departs,
         count(*) FILTER (WHERE s.etape = 'fin')::bigint    AS fins
  FROM public.salon_parties s, tz
  WHERE p_depuis IS NULL OR (s.created_at AT TIME ZONE tz.nom)::date >= p_depuis
  GROUP BY s.quiz_slug
  ORDER BY 2 DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_salon_daily(integer, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_salon_counts_depuis(date, text) TO anon, authenticated;
