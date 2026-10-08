-- ============================================================
-- Parties à distance : les lectures de l'onglet « À distance » en moins de
-- trois secondes.
--
-- Le 7 octobre 2026, l'onglet n'affichait plus rien : get_salon_counts_depuis
-- dépassait le délai de trois secondes du rôle anon (erreur 57014,
-- « canceling statement due to statement timeout ») alors que les trois
-- autres lectures de l'onglet passaient. Deux coûts dans son écriture
-- d'origine (20260906180000_salon_daily.sql) :
--   • la borne « (created_at AT TIME ZONE tz)::date >= p_depuis » interdit
--     l'index sur created_at et relit toute la table à chaque appel ;
--   • le contrôle du fuseau par « EXISTS (SELECT 1 FROM pg_timezone_names) »
--     énumère tous les fichiers de fuseaux du serveur, à chaque appel, et
--     selon la forme du plan il peut être réévalué plus d'une fois.
-- Même remède que pour le trafic le 29 septembre : une borne calculée une
-- fois et comparée à created_at (l'index sert), et un contrôle du fuseau qui
-- tente la conversion au lieu de lister les fuseaux. trafic_fuseau est
-- partagée par toutes les fonctions de trafic : l'alléger ici profite à tout
-- le tableau de bord.
--
-- Côté admin, l'onglet se replie sur get_salon_counts() (les mêmes comptes
-- sans borne de date, la table n'existant que depuis la mise en service du
-- mode) si la fonction bornée ne répond pas : il n'est plus jamais vide.
--
-- À coller dans Supabase > SQL Editor. Idempotent. La dernière requête
-- affiche la taille de la table et ses bornes de dates, pour vérifier.
-- ============================================================

-- ── Le fuseau sans parcourir pg_timezone_names ──────────────────────────
-- Une conversion qui passe vaut validation ; un nom inconnu lève une erreur
-- et on retombe sur UTC, comme avant. Même nom, même signature : les
-- fonctions qui l'appellent ne changent pas.
CREATE OR REPLACE FUNCTION public.trafic_fuseau(p_tz text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF p_tz IS NULL OR p_tz = '' THEN
    RETURN 'UTC';
  END IF;
  PERFORM timestamptz '2000-01-01 00:00:00+00' AT TIME ZONE p_tz;
  RETURN p_tz;
EXCEPTION WHEN OTHERS THEN
  RETURN 'UTC';
END;
$$;

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
  WITH z AS (SELECT public.trafic_fuseau(p_tz) AS nom),
  -- Fenêtre élargie d'un jour : le décalage de fuseau peut faire entrer dans
  -- la période une ligne enregistrée juste avant la borne.
  b AS (SELECT now() - make_interval(days => GREATEST(p_days, 1) + 1) AS debut)
  SELECT (s.created_at AT TIME ZONE z.nom)::date AS day,
         count(*) FILTER (WHERE s.etape = 'depart')::bigint AS departs,
         count(*) FILTER (WHERE s.etape = 'fin')::bigint    AS fins
  FROM public.salon_parties s, z, b
  WHERE s.created_at >= b.debut
  GROUP BY 1
  ORDER BY 1;
$$;

-- ── Par page, à partir d'une date locale ────────────────────────────────
-- La borne est un instant calculé une fois ; COALESCE plutôt que « OR
-- p_depuis IS NULL » pour qu'un plan générique garde l'index.
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
  WITH z AS (SELECT public.trafic_fuseau(p_tz) AS nom),
  b AS (SELECT COALESCE(p_depuis::timestamp AT TIME ZONE z.nom, '-infinity'::timestamptz) AS debut FROM z)
  SELECT s.quiz_slug,
         count(*) FILTER (WHERE s.etape = 'depart')::bigint AS departs,
         count(*) FILTER (WHERE s.etape = 'fin')::bigint    AS fins
  FROM public.salon_parties s, b
  WHERE s.created_at >= b.debut
  GROUP BY s.quiz_slug
  ORDER BY 2 DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_salon_daily(integer, text)        TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_salon_counts_depuis(date, text)   TO anon, authenticated;

-- ── Vérification ────────────────────────────────────────────────────────
-- Le résultat s'affiche sous l'éditeur : nombre de lignes, première et
-- dernière date, poids de la table avec ses index. La table ne contient que
-- des départs et des fins depuis le 7 septembre 2026 ; une première date
-- plus ancienne ou un poids démesuré voudrait dire que quelqu'un y écrit
-- autre chose que le site (la règle d'insertion ne borne pas created_at).
SELECT count(*)                                              AS lignes,
       min(created_at)                                       AS premiere,
       max(created_at)                                       AS derniere,
       pg_size_pretty(pg_total_relation_size('public.salon_parties')) AS poids
FROM public.salon_parties;
