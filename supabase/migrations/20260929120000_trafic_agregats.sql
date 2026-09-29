-- ============================================================
-- MESURE D'AUDIENCE : AGRÉGATS QUOTIDIENS ET CONSERVATION COURTE DU BRUT
--
-- page_views reçoit une ligne par page affichée : 10 000 par jour fin
-- septembre 2026, soit 3 Mo par jour avec ses index. Gardée treize mois
-- comme prévu à l'origine, la table dépasserait à elle seule les 500 Mo du
-- plan gratuit en quelques mois. Et les six fonctions de l'onglet Trafic
-- filtraient avec « (created_at AT TIME ZONE tz)::date > jour0 », une
-- expression que Postgres ne sait pas servir par l'index sur created_at :
-- chaque appel relisait toute la table, même pour « Aujourd'hui », et les
-- fenêtres de trente jours dépassaient le délai de trois secondes du rôle
-- anon.
--
-- Ce fichier change la manière de garder et de lire ces données :
--
--   * une tâche nocturne condense chaque journée close dans cinq petites
--     tables trafic_jour* (résumé, pages, sources, profondeur, entonnoir),
--     quelques dizaines de Ko par jour, gardées treize mois ;
--   * les lignes brutes ne sont gardées que trafic_jours_bruts() jours
--     (35), et jamais supprimées avant d'avoir été condensées ;
--   * les fonctions get_trafic_* et get_blog_articles lisent les agrégats
--     pour les jours clos et les lignes brutes pour les jours pas encore
--     condensés (la journée en cours, d'ordinaire). Leurs signatures et
--     leurs colonnes ne changent pas : le tableau de bord ne bouge pas ;
--   * toutes les bornes de dates comparent created_at à un instant calculé
--     une fois, donc par l'index ; les fonctions des clics « sources
--     préférées » et des parties à distance reçoivent la même correction ;
--   * les journées sont découpées dans un fuseau fixe, Europe/Paris
--     (trafic_fuseau_agregats()), le même pour les agrégats et le brut. Le
--     paramètre p_tz des fonctions Trafic est conservé pour ne rien casser
--     côté navigateur, mais il n'est plus lu : un agrégat par jour ne peut
--     pas être redécoupé dans un autre fuseau.
--
-- Ce qui change dans les chiffres : une visite à cheval sur minuit compte
-- une fois par journée où elle a une page, comme dans la série quotidienne
-- depuis toujours. Les totaux de visites sur plusieurs jours (résumé,
-- pages, sources, profondeur, entonnoir) peuvent donc être plus grands
-- d'une fraction de pour cent qu'avant, où une visite n'était comptée
-- qu'une fois par fenêtre. Les pages vues, elles, sont exactes.
--
-- Déploiement : coller ce fichier une fois dans Supabase > SQL Editor. Il
-- crée les tables, réécrit les fonctions, condense tout l'historique brut
-- jusqu'à hier, purge le brut de plus de 35 jours et planifie la tâche
-- nocturne (2 h 20 UTC). Idempotent : réexécutable sans risque, la
-- condensation reprend là où elle s'était arrêtée. La taille affichée par
-- Supabase ne baisse qu'une fois la place rendue au système de fichiers :
-- lancer ensuite, seul dans l'éditeur, VACUUM FULL public.page_views;
-- ============================================================

-- ── Constantes ──────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.trafic_fuseau_agregats()
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$ SELECT 'Europe/Paris'::text $$;

-- Nombre de jours de lignes brutes gardés dans page_views, la journée en
-- cours non comprise. Au-delà, seuls les agrégats quotidiens restent.
CREATE OR REPLACE FUNCTION public.trafic_jours_bruts()
RETURNS integer
LANGUAGE sql
IMMUTABLE
AS $$ SELECT 35 $$;

CREATE OR REPLACE FUNCTION public.trafic_aujourdhui()
RETURNS date
LANGUAGE sql
STABLE
AS $$ SELECT (now() AT TIME ZONE public.trafic_fuseau_agregats())::date $$;

-- Minuit local du jour donné, en instant absolu : c'est la borne que l'on
-- compare à created_at, et elle laisse l'index travailler.
CREATE OR REPLACE FUNCTION public.trafic_debut_jour(p_jour date)
RETURNS timestamptz
LANGUAGE sql
STABLE
AS $$ SELECT p_jour::timestamp AT TIME ZONE public.trafic_fuseau_agregats() $$;

-- Même borne pour les fonctions qui gardent le fuseau de la personne qui
-- regarde (clics « sources préférées ») : « les p_days derniers jours,
-- aujourd'hui compris », comme avant, mais par l'index.
CREATE OR REPLACE FUNCTION public.trafic_debut_fenetre(p_days integer, p_tz text)
RETURNS timestamptz
LANGUAGE sql
STABLE
AS $$
  WITH z AS (SELECT public.trafic_fuseau(p_tz) AS nom)
  SELECT ((now() AT TIME ZONE z.nom)::date - GREATEST(p_days, 1) + 1)::timestamp AT TIME ZONE z.nom
  FROM z;
$$;

-- ── Les cinq tables d'agrégats ──────────────────────────────────────────
-- Une ligne par jour clos (fuseau Europe/Paris). Aucun identifiant de
-- visite n'y figure : ce sont des totaux, rien d'autre.
CREATE TABLE IF NOT EXISTS public.trafic_jour (
  jour date PRIMARY KEY,
  visites integer NOT NULL DEFAULT 0,
  pages_vues integer NOT NULL DEFAULT 0,
  visites_une_page integer NOT NULL DEFAULT 0,
  consolide_le timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.trafic_jour_pages (
  jour date NOT NULL,
  path text NOT NULL,
  route_key text,
  vues integer NOT NULL DEFAULT 0,
  visites integer NOT NULL DEFAULT 0,
  entrees integer NOT NULL DEFAULT 0,
  rebonds integer NOT NULL DEFAULT 0,
  PRIMARY KEY (jour, path)
);

CREATE TABLE IF NOT EXISTS public.trafic_jour_sources (
  jour date NOT NULL,
  source text NOT NULL,
  visites integer NOT NULL DEFAULT 0,
  PRIMARY KEY (jour, source)
);

CREATE TABLE IF NOT EXISTS public.trafic_jour_profondeur (
  jour date NOT NULL,
  pages smallint NOT NULL,
  visites integer NOT NULL DEFAULT 0,
  PRIMARY KEY (jour, pages)
);

CREATE TABLE IF NOT EXISTS public.trafic_jour_entonnoir (
  jour date NOT NULL,
  route_key text NOT NULL,
  visites integer NOT NULL DEFAULT 0,
  lances integer NOT NULL DEFAULT 0,
  finis integer NOT NULL DEFAULT 0,
  PRIMARY KEY (jour, route_key)
);

-- Personne ne lit ces tables directement : pas de politique, seules les
-- fonctions ci-dessous (SECURITY DEFINER) y accèdent.
ALTER TABLE public.trafic_jour            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trafic_jour_pages      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trafic_jour_sources    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trafic_jour_profondeur ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trafic_jour_entonnoir  ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.trafic_dernier_jour_consolide()
RETURNS date
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$ SELECT max(j.jour) FROM public.trafic_jour j $$;

-- ── Le calcul sur les lignes brutes, entre deux instants ────────────────
-- Ces fonctions portent la logique d'avant, à l'identique, mais sur un
-- intervalle [p_debut, p_fin[ au lieu d'une fenêtre en jours. La
-- condensation les appelle jour par jour, les lecteurs les appellent sur
-- les jours pas encore condensés. Une seule écriture du calcul, donc un
-- jour condensé et un jour lu en brut donnent les mêmes nombres.

-- Une ligne par visite : combien de pages, laquelle en premier, venue d'où.
-- L'id départage les ex aequo : deux vues dans la même milliseconde
-- rendraient sinon la « première page » non déterministe.
CREATE OR REPLACE FUNCTION public.trafic_brut_visites(p_debut timestamptz, p_fin timestamptz)
RETURNS TABLE(visite text, pages bigint, premiere_path text, premiere_source text)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  WITH f AS (
    SELECT pv.id, pv.visite_id, pv.path, pv.source, pv.created_at
    FROM public.page_views pv
    WHERE pv.created_at >= p_debut AND pv.created_at < p_fin
  ),
  prem AS (
    SELECT DISTINCT ON (f.visite_id) f.visite_id, f.path, f.source
    FROM f ORDER BY f.visite_id, f.created_at, f.id
  ),
  taille AS (SELECT f.visite_id, count(*) AS n FROM f GROUP BY f.visite_id)
  SELECT taille.visite_id, taille.n, prem.path, prem.source
  FROM taille JOIN prem ON prem.visite_id = taille.visite_id;
$$;

CREATE OR REPLACE FUNCTION public.trafic_brut_resume(p_debut timestamptz, p_fin timestamptz)
RETURNS TABLE(visites bigint, pages_vues bigint, visites_une_page bigint)
LANGUAGE sql
STABLE
SET search_path = public
ROWS 1
AS $$
  SELECT count(*)::bigint,
         COALESCE(sum(v.pages), 0)::bigint,
         count(*) FILTER (WHERE v.pages = 1)::bigint
  FROM public.trafic_brut_visites(p_debut, p_fin) v;
$$;

CREATE OR REPLACE FUNCTION public.trafic_brut_pages(p_debut timestamptz, p_fin timestamptz)
RETURNS TABLE(path text, route_key text, vues bigint, visites bigint, entrees bigint, rebonds bigint)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  WITH agg AS (
    SELECT pv.path AS chemin, max(pv.route_key) AS cle,
           count(*) AS n_vues, count(DISTINCT pv.visite_id) AS n_visites
    FROM public.page_views pv
    WHERE pv.created_at >= p_debut AND pv.created_at < p_fin
    GROUP BY pv.path
  ),
  ent AS (
    SELECT v.premiere_path AS chemin,
           count(*) AS n_entrees,
           count(*) FILTER (WHERE v.pages = 1) AS n_rebonds
    FROM public.trafic_brut_visites(p_debut, p_fin) v
    GROUP BY v.premiere_path
  )
  SELECT agg.chemin, agg.cle, agg.n_vues::bigint, agg.n_visites::bigint,
         COALESCE(ent.n_entrees, 0)::bigint, COALESCE(ent.n_rebonds, 0)::bigint
  FROM agg LEFT JOIN ent ON ent.chemin = agg.chemin;
$$;

-- La source d'une visite est celle de sa première page : les pages
-- suivantes ont toutes le site lui-même pour référent.
CREATE OR REPLACE FUNCTION public.trafic_brut_sources(p_debut timestamptz, p_fin timestamptz)
RETURNS TABLE(source text, visites bigint)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(NULLIF(v.premiere_source, ''), 'direct')::text, count(*)::bigint
  FROM public.trafic_brut_visites(p_debut, p_fin) v
  GROUP BY 1;
$$;

CREATE OR REPLACE FUNCTION public.trafic_brut_profondeur(p_debut timestamptz, p_fin timestamptz)
RETURNS TABLE(pages integer, visites bigint)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT LEAST(v.pages, 6)::integer, count(*)::bigint
  FROM public.trafic_brut_visites(p_debut, p_fin) v
  GROUP BY 1;
$$;

-- Trois nombres qui portent sur les MÊMES visites : celles qui ont vu la
-- page, celles qui ont touché le moteur, celles qui sont allées jusqu'au
-- résultat. Les parties d'avant la mesure ont un visite_id NULL et sont
-- hors entonnoir par construction.
CREATE OR REPLACE FUNCTION public.trafic_brut_entonnoir(p_debut timestamptz, p_fin timestamptz)
RETURNS TABLE(route_key text, visites bigint, lances bigint, finis bigint)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  WITH vues AS (
    SELECT pv.route_key AS rk, count(DISTINCT pv.visite_id) AS n
    FROM public.page_views pv
    WHERE pv.route_key IS NOT NULL
      AND pv.created_at >= p_debut AND pv.created_at < p_fin
    GROUP BY 1
  ),
  l AS (
    SELECT s.quiz_slug AS rk, count(DISTINCT s.visite_id) AS n
    FROM public.quiz_starts s
    WHERE s.visite_id IS NOT NULL
      AND s.created_at >= p_debut AND s.created_at < p_fin
    GROUP BY 1
  ),
  c AS (
    SELECT q.quiz_slug AS rk, count(DISTINCT q.visite_id) AS n
    FROM public.quiz_completions q
    WHERE q.visite_id IS NOT NULL
      AND q.created_at >= p_debut AND q.created_at < p_fin
    GROUP BY 1
  )
  SELECT vues.rk, vues.n::bigint, COALESCE(l.n, 0)::bigint, COALESCE(c.n, 0)::bigint
  FROM vues
  LEFT JOIN l ON l.rk = vues.rk
  LEFT JOIN c ON c.rk = vues.rk;
$$;

REVOKE ALL ON FUNCTION public.trafic_brut_visites(timestamptz, timestamptz)    FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.trafic_brut_resume(timestamptz, timestamptz)     FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.trafic_brut_pages(timestamptz, timestamptz)      FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.trafic_brut_sources(timestamptz, timestamptz)    FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.trafic_brut_profondeur(timestamptz, timestamptz) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.trafic_brut_entonnoir(timestamptz, timestamptz)  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.trafic_dernier_jour_consolide()                  FROM PUBLIC, anon, authenticated;

-- Premier jour dont les lignes brutes existent encore. La purge supprime des
-- journées entières, ce jour-là est donc complet. NULL si la table est vide.
CREATE OR REPLACE FUNCTION public.trafic_premier_jour_brut()
RETURNS date
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (min(pv.created_at) AT TIME ZONE public.trafic_fuseau_agregats())::date
  FROM public.page_views pv;
$$;

REVOKE ALL ON FUNCTION public.trafic_premier_jour_brut() FROM PUBLIC, anon, authenticated;

-- ── Condensation d'une journée close ────────────────────────────────────
-- Rejouable sur n'importe quel jour dont les lignes brutes existent encore :
-- les agrégats du jour sont effacés puis recalculés. Un jour dont le brut
-- est déjà purgé est refusé : le recalculer écraserait ses agrégats avec
-- des zéros.
CREATE OR REPLACE FUNCTION public.consolide_trafic_jour(p_jour date)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  debut timestamptz := public.trafic_debut_jour(p_jour);
  fin   timestamptz := public.trafic_debut_jour(p_jour + 1);
BEGIN
  IF p_jour >= public.trafic_aujourdhui() THEN
    RAISE EXCEPTION 'consolide_trafic_jour : % n''est pas une journée close', p_jour;
  END IF;
  IF p_jour < public.trafic_premier_jour_brut() THEN
    RAISE EXCEPTION 'consolide_trafic_jour : les lignes brutes du % ont déjà été purgées', p_jour;
  END IF;

  DELETE FROM public.trafic_jour            WHERE jour = p_jour;
  DELETE FROM public.trafic_jour_pages      WHERE jour = p_jour;
  DELETE FROM public.trafic_jour_sources    WHERE jour = p_jour;
  DELETE FROM public.trafic_jour_profondeur WHERE jour = p_jour;
  DELETE FROM public.trafic_jour_entonnoir  WHERE jour = p_jour;

  -- Toujours exactement une ligne, même pour un jour sans aucune vue : c'est
  -- elle qui marque la journée comme condensée.
  INSERT INTO public.trafic_jour (jour, visites, pages_vues, visites_une_page)
  SELECT p_jour, r.visites, r.pages_vues, r.visites_une_page
  FROM public.trafic_brut_resume(debut, fin) r;

  INSERT INTO public.trafic_jour_pages (jour, path, route_key, vues, visites, entrees, rebonds)
  SELECT p_jour, b.path, b.route_key, b.vues, b.visites, b.entrees, b.rebonds
  FROM public.trafic_brut_pages(debut, fin) b;

  INSERT INTO public.trafic_jour_sources (jour, source, visites)
  SELECT p_jour, b.source, b.visites
  FROM public.trafic_brut_sources(debut, fin) b;

  INSERT INTO public.trafic_jour_profondeur (jour, pages, visites)
  SELECT p_jour, b.pages, b.visites
  FROM public.trafic_brut_profondeur(debut, fin) b;

  INSERT INTO public.trafic_jour_entonnoir (jour, route_key, visites, lances, finis)
  SELECT p_jour, b.route_key, b.visites, b.lances, b.finis
  FROM public.trafic_brut_entonnoir(debut, fin) b;
END;
$$;

-- Condense toutes les journées closes qui ne le sont pas encore, du
-- lendemain de la dernière condensée (ou du premier jour de la mesure)
-- jusqu'à hier. Ne remonte jamais avant le premier jour dont le brut existe
-- encore. Renvoie le nombre de journées traitées.
CREATE OR REPLACE FUNCTION public.consolide_trafic(p_jusqua date DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  hier   date := public.trafic_aujourdhui() - 1;
  jusqua date := LEAST(COALESCE(p_jusqua, hier), hier);
  brut0  date := public.trafic_premier_jour_brut();
  j      date := GREATEST(public.trafic_dernier_jour_consolide() + 1, brut0);
  n      integer := 0;
BEGIN
  IF j IS NULL THEN
    RETURN 0;
  END IF;
  WHILE j <= jusqua LOOP
    PERFORM public.consolide_trafic_jour(j);
    n := n + 1;
    j := j + 1;
  END LOOP;
  RETURN n;
END;
$$;

-- ── Purge ───────────────────────────────────────────────────────────────
-- Les lignes brutes de plus de trafic_jours_bruts() jours partent, mais
-- jamais une journée qui n'a pas encore été condensée : la borne est la
-- plus ancienne des deux. Les agrégats sont gardés treize mois, ce qui
-- permet la comparaison d'une année sur l'autre, seule raison légitime de
-- remonter aussi loin. Renvoie le nombre de lignes brutes supprimées.
CREATE OR REPLACE FUNCTION public.purge_page_views()
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  dc     date := public.trafic_dernier_jour_consolide();
  garde  date;
  ancien date := (public.trafic_aujourdhui() - interval '13 months')::date;
  n      bigint;
BEGIN
  IF dc IS NULL THEN
    RETURN 0;
  END IF;
  garde := LEAST(public.trafic_aujourdhui() - public.trafic_jours_bruts(), dc + 1);
  DELETE FROM public.page_views WHERE created_at < public.trafic_debut_jour(garde);
  GET DIAGNOSTICS n = ROW_COUNT;

  DELETE FROM public.trafic_jour            WHERE jour < ancien;
  DELETE FROM public.trafic_jour_pages      WHERE jour < ancien;
  DELETE FROM public.trafic_jour_sources    WHERE jour < ancien;
  DELETE FROM public.trafic_jour_profondeur WHERE jour < ancien;
  DELETE FROM public.trafic_jour_entonnoir  WHERE jour < ancien;
  RETURN n;
END;
$$;

-- L'entretien nocturne : condenser, puis purger. Les deux purges des
-- petites tables du blog (treize mois) sont emmenées au passage, si leurs
-- migrations ont été appliquées.
CREATE OR REPLACE FUNCTION public.trafic_entretien()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  jours  integer;
  lignes bigint;
BEGIN
  jours  := public.consolide_trafic();
  lignes := public.purge_page_views();
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace s ON s.oid = p.pronamespace
             WHERE s.nspname = 'public' AND p.proname = 'purge_article_lectures') THEN
    PERFORM public.purge_article_lectures();
  END IF;
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace s ON s.oid = p.pronamespace
             WHERE s.nspname = 'public' AND p.proname = 'purge_source_pref_clics') THEN
    PERFORM public.purge_source_pref_clics();
  END IF;
  RETURN format('%s journée(s) condensée(s), %s ligne(s) brute(s) purgée(s)', jours, lignes);
END;
$$;

REVOKE ALL ON FUNCTION public.consolide_trafic_jour(date) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.consolide_trafic(date)      FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.purge_page_views()          FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.trafic_entretien()          FROM PUBLIC, anon, authenticated;

-- ── Les bornes d'une lecture ────────────────────────────────────────────
-- premier : premier jour de la fenêtre (« les p_days derniers jours,
-- aujourd'hui compris », comme avant). Les agrégats servent de premier à
-- dernier_consolide ; le brut sert à partir de debut_brut, lendemain de la
-- dernière journée condensée (ou premier jour de la fenêtre si la
-- condensation est en retard, ou n'a jamais eu lieu). Ainsi une nuit sans
-- tâche ne fait manquer aucun jour : il est simplement lu en brut.
--
-- ROWS 1 : sans cette indication, le planificateur suppose mille lignes à
-- toute fonction qui renvoie une table, multiplie par mille le coût estimé
-- de chaque lecteur et déclenche la compilation JIT de la requête, soit
-- 200 à 300 ms perdus à chaque appel pour trois lignes lues.
CREATE OR REPLACE FUNCTION public.trafic_bornes(p_days integer)
RETURNS TABLE(premier date, dernier_consolide date, debut_brut timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
ROWS 1
AS $$
  WITH b AS (
    SELECT public.trafic_aujourdhui() - GREATEST(p_days, 1) + 1 AS jour1,
           public.trafic_dernier_jour_consolide() AS dc
  )
  SELECT b.jour1, b.dc,
         public.trafic_debut_jour(GREATEST(b.jour1, COALESCE(b.dc + 1, b.jour1)))
  FROM b;
$$;

REVOKE ALL ON FUNCTION public.trafic_bornes(integer) FROM PUBLIC, anon, authenticated;

-- ── Les lecteurs du tableau de bord ─────────────────────────────────────
-- Mêmes signatures, mêmes colonnes qu'avant. p_tz n'est plus lu (voir
-- l'en-tête) ; il reste pour que admin.js n'ait pas à changer.

CREATE OR REPLACE FUNCTION public.get_trafic_resume(
  p_days integer DEFAULT 30,
  p_tz   text    DEFAULT 'UTC'
)
RETURNS TABLE(visites bigint, pages_vues bigint, pages_par_visite numeric, visites_une_page bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH b AS (SELECT * FROM public.trafic_bornes(p_days)),
  tout AS (
    SELECT j.visites::bigint AS v, j.pages_vues::bigint AS p, j.visites_une_page::bigint AS u
    FROM public.trafic_jour j, b
    WHERE j.jour >= b.premier AND j.jour <= b.dernier_consolide
    UNION ALL
    SELECT r.visites, r.pages_vues, r.visites_une_page
    FROM b, public.trafic_brut_resume(b.debut_brut, 'infinity'::timestamptz) r
  )
  SELECT COALESCE(sum(t.v), 0)::bigint,
         COALESCE(sum(t.p), 0)::bigint,
         CASE WHEN COALESCE(sum(t.v), 0) = 0 THEN 0
              ELSE round(sum(t.p)::numeric / sum(t.v), 2) END,
         COALESCE(sum(t.u), 0)::bigint
  FROM tout t;
$$;

CREATE OR REPLACE FUNCTION public.get_trafic_daily(
  p_days integer DEFAULT 30,
  p_tz   text    DEFAULT 'UTC'
)
RETURNS TABLE(day date, visites bigint, pages_vues bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH b AS (SELECT * FROM public.trafic_bornes(p_days))
  SELECT j.jour, j.visites::bigint, j.pages_vues::bigint
  FROM public.trafic_jour j, b
  WHERE j.jour >= b.premier AND j.jour <= b.dernier_consolide
  UNION ALL
  SELECT (pv.created_at AT TIME ZONE public.trafic_fuseau_agregats())::date,
         count(DISTINCT pv.visite_id)::bigint,
         count(*)::bigint
  FROM public.page_views pv, b
  WHERE pv.created_at >= b.debut_brut
  GROUP BY 1
  ORDER BY 1;
$$;

CREATE OR REPLACE FUNCTION public.get_trafic_pages(
  p_days integer DEFAULT 30,
  p_tz   text    DEFAULT 'UTC'
)
RETURNS TABLE(path text, route_key text, pages_vues bigint, visites bigint, entrees bigint, rebonds bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH b AS (SELECT * FROM public.trafic_bornes(p_days)),
  tout AS (
    SELECT j.path AS chemin, j.route_key AS cle, j.vues::bigint AS n_vues,
           j.visites::bigint AS n_visites, j.entrees::bigint AS n_entrees, j.rebonds::bigint AS n_rebonds
    FROM public.trafic_jour_pages j, b
    WHERE j.jour >= b.premier AND j.jour <= b.dernier_consolide
    UNION ALL
    SELECT r.path, r.route_key, r.vues, r.visites, r.entrees, r.rebonds
    FROM b, public.trafic_brut_pages(b.debut_brut, 'infinity'::timestamptz) r
  )
  SELECT t.chemin, max(t.cle),
         sum(t.n_vues)::bigint, sum(t.n_visites)::bigint,
         sum(t.n_entrees)::bigint, sum(t.n_rebonds)::bigint
  FROM tout t
  GROUP BY t.chemin
  ORDER BY 3 DESC;
$$;

CREATE OR REPLACE FUNCTION public.get_trafic_sources(
  p_days integer DEFAULT 30,
  p_tz   text    DEFAULT 'UTC'
)
RETURNS TABLE(source text, visites bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH b AS (SELECT * FROM public.trafic_bornes(p_days)),
  tout AS (
    SELECT j.source AS src, j.visites::bigint AS n
    FROM public.trafic_jour_sources j, b
    WHERE j.jour >= b.premier AND j.jour <= b.dernier_consolide
    UNION ALL
    SELECT r.source, r.visites
    FROM b, public.trafic_brut_sources(b.debut_brut, 'infinity'::timestamptz) r
  )
  SELECT t.src, sum(t.n)::bigint
  FROM tout t
  GROUP BY t.src
  ORDER BY 2 DESC;
$$;

CREATE OR REPLACE FUNCTION public.get_trafic_profondeur(
  p_days integer DEFAULT 30,
  p_tz   text    DEFAULT 'UTC'
)
RETURNS TABLE(pages integer, visites bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH b AS (SELECT * FROM public.trafic_bornes(p_days)),
  tout AS (
    SELECT j.pages::integer AS n_pages, j.visites::bigint AS n
    FROM public.trafic_jour_profondeur j, b
    WHERE j.jour >= b.premier AND j.jour <= b.dernier_consolide
    UNION ALL
    SELECT r.pages, r.visites
    FROM b, public.trafic_brut_profondeur(b.debut_brut, 'infinity'::timestamptz) r
  )
  SELECT t.n_pages, sum(t.n)::bigint
  FROM tout t
  GROUP BY t.n_pages
  ORDER BY 1;
$$;

CREATE OR REPLACE FUNCTION public.get_trafic_entonnoir(
  p_days integer DEFAULT 30,
  p_tz   text    DEFAULT 'UTC'
)
RETURNS TABLE(route_key text, visites bigint, lances bigint, finis bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH b AS (SELECT * FROM public.trafic_bornes(p_days)),
  tout AS (
    SELECT j.route_key AS rk, j.visites::bigint AS n_visites,
           j.lances::bigint AS n_lances, j.finis::bigint AS n_finis
    FROM public.trafic_jour_entonnoir j, b
    WHERE j.jour >= b.premier AND j.jour <= b.dernier_consolide
    UNION ALL
    SELECT r.route_key, r.visites, r.lances, r.finis
    FROM b, public.trafic_brut_entonnoir(b.debut_brut, 'infinity'::timestamptz) r
  )
  SELECT t.rk, sum(t.n_visites)::bigint, sum(t.n_lances)::bigint, sum(t.n_finis)::bigint
  FROM tout t
  GROUP BY t.rk
  ORDER BY 2 DESC;
$$;

-- Les articles du blog : ouvertures, vues, entrées et rebonds viennent des
-- mêmes agrégats de pages ; les lectures (article_lectures, petite table)
-- restent lues en brut, sur la fenêtre et en tout.
CREATE OR REPLACE FUNCTION public.get_blog_articles(
  p_days integer DEFAULT 30,
  p_tz   text    DEFAULT 'UTC'
)
RETURNS TABLE(path text, lang text, lectures bigint, ouvertures bigint,
              vues bigint, entrees bigint, rebonds bigint, total bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH b AS (SELECT * FROM public.trafic_bornes(p_days)),
  tout AS (
    SELECT j.path AS chemin, j.vues::bigint AS n_vues, j.visites::bigint AS n_visites,
           j.entrees::bigint AS n_entrees, j.rebonds::bigint AS n_rebonds
    FROM public.trafic_jour_pages j, b
    WHERE j.jour >= b.premier AND j.jour <= b.dernier_consolide
    UNION ALL
    SELECT r.path, r.vues, r.visites, r.entrees, r.rebonds
    FROM b, public.trafic_brut_pages(b.debut_brut, 'infinity'::timestamptz) r
  ),
  agg AS (
    SELECT t.chemin, sum(t.n_visites) AS ouvertures, sum(t.n_vues) AS n_vues,
           sum(t.n_entrees) AS n_entrees, sum(t.n_rebonds) AS n_rebonds
    FROM tout t
    WHERE public.est_article_blog(t.chemin)
    GROUP BY t.chemin
  ),
  lus AS (
    SELECT al.path AS chemin, count(*) AS n
    FROM public.article_lectures al, b
    WHERE al.created_at >= public.trafic_debut_jour(b.premier)
    GROUP BY al.path
  ),
  tot AS (
    SELECT al.path AS chemin, count(*) AS n
    FROM public.article_lectures al GROUP BY al.path
  )
  SELECT agg.chemin,
         public.langue_du_chemin(agg.chemin),
         COALESCE(lus.n, 0)::bigint,
         agg.ouvertures::bigint,
         agg.n_vues::bigint,
         agg.n_entrees::bigint,
         agg.n_rebonds::bigint,
         COALESCE(tot.n, 0)::bigint
  FROM agg
  LEFT JOIN lus ON lus.chemin = agg.chemin
  LEFT JOIN tot ON tot.chemin = agg.chemin
  ORDER BY COALESCE(lus.n, 0) DESC, agg.ouvertures DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_trafic_resume(integer, text)     TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_trafic_daily(integer, text)      TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_trafic_pages(integer, text)      TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_trafic_sources(integer, text)    TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_trafic_profondeur(integer, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_trafic_entonnoir(integer, text)  TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_blog_articles(integer, text)     TO anon, authenticated;

-- ── Les mêmes bornes par l'index sur les petites tables ─────────────────
-- Elles gardent le fuseau de la personne qui regarde : pas d'agrégat ici.
CREATE OR REPLACE FUNCTION public.get_source_pref_clics(
  p_days integer DEFAULT 30,
  p_tz   text    DEFAULT 'UTC'
)
RETURNS TABLE(emplacement text, clics bigint, visites bigint, total bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH b AS (SELECT public.trafic_debut_fenetre(p_days, p_tz) AS debut),
  f AS (
    SELECT c.emplacement, c.visite_id
    FROM public.source_pref_clics c, b
    WHERE c.created_at >= b.debut
  ),
  tot AS (
    SELECT c.emplacement AS e, count(*) AS n
    FROM public.source_pref_clics c GROUP BY c.emplacement
  ),
  fen AS (
    SELECT f.emplacement AS e, count(*) AS n_clics,
           count(DISTINCT f.visite_id) AS n_visites
    FROM f GROUP BY f.emplacement
  )
  SELECT fen.e, fen.n_clics::bigint, fen.n_visites::bigint,
         COALESCE(tot.n, 0)::bigint
  FROM fen LEFT JOIN tot ON tot.e = fen.e
  ORDER BY fen.n_clics DESC;
$$;

CREATE OR REPLACE FUNCTION public.get_source_pref_daily(
  p_days integer DEFAULT 30,
  p_tz   text    DEFAULT 'UTC'
)
RETURNS TABLE(day date, emplacement text, clics bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH z AS (SELECT public.trafic_fuseau(p_tz) AS nom),
  b AS (SELECT public.trafic_debut_fenetre(p_days, p_tz) AS debut)
  SELECT (c.created_at AT TIME ZONE z.nom)::date, c.emplacement, count(*)::bigint
  FROM public.source_pref_clics c, z, b
  WHERE c.created_at >= b.debut
  GROUP BY 1, 2
  ORDER BY 1;
$$;

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
  b AS (SELECT (p_depuis::timestamp AT TIME ZONE z.nom) AS debut FROM z)
  SELECT s.quiz_slug,
         count(*) FILTER (WHERE s.etape = 'depart')::bigint AS departs,
         count(*) FILTER (WHERE s.etape = 'fin')::bigint    AS fins
  FROM public.salon_parties s, b
  WHERE p_depuis IS NULL OR s.created_at >= b.debut
  GROUP BY s.quiz_slug
  ORDER BY 2 DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_source_pref_clics(integer, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_source_pref_daily(integer, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_salon_counts_depuis(date, text)  TO anon, authenticated;

-- ── Deux index devenus inutiles ─────────────────────────────────────────
-- Plus aucune lecture ne cherche page_views par chemin ni par visite : tout
-- passe par une plage de created_at. Ces deux index coûtaient un tiers du
-- poids de la table et un travail à chaque insertion.
DROP INDEX IF EXISTS public.page_views_path_idx;
DROP INDEX IF EXISTS public.page_views_visite_idx;

-- ── La tâche nocturne ───────────────────────────────────────────────────
-- 2 h 20 UTC, soit 3 h 20 ou 4 h 20 à Paris : la journée est close depuis
-- plusieurs heures, les dernières requêtes « keepalive » sont arrivées.
-- pg_cron garde une ligne par exécution de chaque tâche dans
-- cron.job_run_details ; le nettoyage des sessions ado tourne toutes les
-- quinze minutes, la table grossit donc de 100 lignes par jour pour rien :
-- on la borne à sept jours, comme Supabase le recommande.
DO $do$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'pg_cron') THEN
    CREATE EXTENSION IF NOT EXISTS pg_cron;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule(jobid) FROM cron.job
      WHERE jobname IN ('trafic-entretien', 'purge-page-views', 'purge-cron-details');
    PERFORM cron.schedule('trafic-entretien', '20 2 * * *',
                          $q$ SELECT public.trafic_entretien() $q$);
    PERFORM cron.schedule('purge-cron-details', '40 2 * * *',
                          $q$ DELETE FROM cron.job_run_details WHERE end_time < now() - interval '7 days' $q$);
  END IF;
END
$do$;

-- ── Premier passage ─────────────────────────────────────────────────────
-- Condense tout l'historique brut jusqu'à hier, puis purge ce qui a plus de
-- trafic_jours_bruts() jours. Rejouer ce fichier ne refait pas le travail :
-- la condensation reprend au lendemain de la dernière journée traitée.
SELECT public.consolide_trafic() AS journees_condensees;
SELECT public.purge_page_views()  AS lignes_brutes_purgees;
