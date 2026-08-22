-- ============================================================
-- MESURE D'AUDIENCE PREMIÈRE PARTIE
--
-- Google Analytics ne voit qu'une fraction du trafic réel : il est bloqué
-- au niveau réseau par les bloqueurs de pistage, il ne compte rien tant que
-- le bandeau cookies n'a pas été accepté, et il se charge trop tard pour
-- attraper les visites courtes. Sur une journée à 600 clics Search Console,
-- il en rapportait 336.
--
-- Cette table est l'inverse exact : elle est servie par le domaine du site
-- lui-même, aucun bloqueur ne la connaît, et elle ne demande aucun
-- consentement parce qu'elle n'en a pas besoin.
--
-- ── Ce qui rend l'exemption de consentement possible ────────────────────
-- La CNIL exempte la mesure d'audience du consentement à des conditions
-- précises, que ce schéma respecte par construction :
--
--   * l'identifiant de visite est tiré au hasard, vit trente minutes, et
--     n'est jamais reconduit d'une visite à l'autre : quelqu'un qui revient
--     demain est une nouvelle visite, et rien ne permet de faire le lien ;
--   * aucune adresse IP, aucune empreinte de navigateur, aucun identifiant
--     de compte, rien de nominatif ;
--   * la donnée ne quitte pas le site et n'est recoupée avec rien ;
--   * les statistiques produites sont agrégées : personne ne peut lire la
--     table ligne à ligne, les fonctions ci-dessous ne rendent que des
--     totaux ;
--   * la conservation est bornée, voir purge_page_views() en fin de fichier.
--
-- L'exemption suppose aussi que ces conditions restent vraies dans la durée
-- et que la politique de confidentialité en parle. Les deux sont faits.
--
-- ── Ce qu'une ligne représente ──────────────────────────────────────────
-- Une page affichée. Le regroupement par visite_id reconstitue le parcours :
-- combien de pages dans la visite, par laquelle elle a commencé, d'où elle
-- venait. C'est tout ce dont le tableau de bord a besoin.
--
-- Déploiement : coller ce fichier dans Supabase > SQL Editor > New Query,
-- AVANT de déployer le site, à cause des colonnes ajoutées plus bas aux
-- deux tables existantes.
--
-- Idempotent, réexécutable sans risque.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.page_views (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  -- 32 caractères hexadécimaux tirés au hasard dans le navigateur. Il ne
  -- survit pas à trente minutes d'inactivité et n'est stocké nulle part
  -- ailleurs : ce n'est pas un identifiant de personne, c'est un numéro de
  -- passage qui sert à recoller les pages d'une même visite.
  visite_id text NOT NULL,
  path text NOT NULL,
  -- Renseigné seulement sur les pages jouables, où il vaut la même chose que
  -- quiz_starts.quiz_slug et quiz_completions.quiz_slug. C'est la clé qui
  -- permet l'entonnoir vue → lancement → partie terminée.
  route_key text,
  lang text,
  -- « direct » (aucun référent), « interne » (une autre page du site), ou
  -- le nom d'hôte du référent. Jamais l'URL complète : elle peut contenir
  -- une requête de recherche, donc potentiellement quelque chose de
  -- personnel.
  source text,
  created_at timestamptz DEFAULT now()
);

-- Trois index pour trois formes de lecture : la fenêtre de dates, le
-- regroupement par visite, et le classement des pages.
CREATE INDEX IF NOT EXISTS page_views_created_idx ON public.page_views (created_at);
CREATE INDEX IF NOT EXISTS page_views_visite_idx  ON public.page_views (visite_id, created_at);
CREATE INDEX IF NOT EXISTS page_views_path_idx    ON public.page_views (path);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- N'importe qui peut signaler une page vue, personne ne peut lire la table.
-- Les chiffres passent par les fonctions plus bas, qui ne rendent que des
-- agrégats. Même posture que quiz_starts et quiz_completions.
DROP POLICY IF EXISTS "page_views_insert_anon" ON public.page_views;
CREATE POLICY "page_views_insert_anon" ON public.page_views
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- ── Rattacher les parties à la visite qui les a produites ───────────────
-- Sans ça, l'entonnoir se contente de rapprocher deux totaux calculés
-- séparément, et peut afficher plus de lancements que de vues. Avec, on
-- compte vraiment les visites qui ont vu la page ET lancé le test.
-- Colonne facultative : les lignes antérieures restent à NULL et sortent
-- simplement de l'entonnoir.
ALTER TABLE public.quiz_starts      ADD COLUMN IF NOT EXISTS visite_id text;
ALTER TABLE public.quiz_completions ADD COLUMN IF NOT EXISTS visite_id text;

CREATE INDEX IF NOT EXISTS quiz_starts_visite_idx      ON public.quiz_starts (visite_id) WHERE visite_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS quiz_completions_visite_idx ON public.quiz_completions (visite_id) WHERE visite_id IS NOT NULL;

-- ── Fenêtre commune à toutes les fonctions ──────────────────────────────
-- Les journées sont découpées dans le fuseau de la personne qui regarde le
-- tableau de bord, sinon une soirée française se retrouve rangée dans la
-- journée UTC suivante et la colonne du jour paraît vide jusqu'à deux
-- heures du matin. Un fuseau inconnu retombe sur UTC plutôt que de faire
-- échouer la requête.
--
-- « Les p_days derniers jours, aujourd'hui compris » : c'est exactement la
-- définition que le tableau de bord applique déjà côté navigateur aux
-- lancements et aux parties terminées. Les deux onglets comptent donc la
-- même chose sur la même période.
CREATE OR REPLACE FUNCTION public.trafic_fuseau(p_tz text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_tz IS NULL THEN 'UTC'
    WHEN EXISTS (SELECT 1 FROM pg_timezone_names WHERE name = p_tz) THEN p_tz
    ELSE 'UTC'
  END;
$$;

-- ── Résumé de la période ────────────────────────────────────────────────
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
  WITH z AS (SELECT public.trafic_fuseau(p_tz) AS nom),
  b AS (SELECT ((now() AT TIME ZONE (SELECT nom FROM z))::date - GREATEST(p_days, 1)) AS jour0),
  v AS (
    SELECT pv.visite_id, count(*) AS n
    FROM public.page_views pv, z, b
    WHERE (pv.created_at AT TIME ZONE z.nom)::date > b.jour0
    GROUP BY pv.visite_id
  )
  SELECT count(*)::bigint,
         COALESCE(sum(v.n), 0)::bigint,
         CASE WHEN count(*) = 0 THEN 0
              ELSE round(sum(v.n)::numeric / count(*), 2) END,
         count(*) FILTER (WHERE v.n = 1)::bigint
  FROM v;
$$;

-- ── Série quotidienne ───────────────────────────────────────────────────
-- Une visite à cheval sur minuit compte dans les deux journées. C'est le
-- comportement de tous les outils de mesure, et le corriger reviendrait à
-- rattacher arbitrairement la visite à l'un des deux jours.
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
  WITH z AS (SELECT public.trafic_fuseau(p_tz) AS nom),
  b AS (SELECT ((now() AT TIME ZONE (SELECT nom FROM z))::date - GREATEST(p_days, 1)) AS jour0)
  SELECT (pv.created_at AT TIME ZONE z.nom)::date,
         count(DISTINCT pv.visite_id)::bigint,
         count(*)::bigint
  FROM public.page_views pv, z, b
  WHERE (pv.created_at AT TIME ZONE z.nom)::date > b.jour0
  GROUP BY 1
  ORDER BY 1;
$$;

-- ── Page par page ───────────────────────────────────────────────────────
-- entrees  : visites dont c'est la PREMIÈRE page, donc une arrivée directe
--            depuis un moteur, un lien externe ou un favori.
-- visites  : visites qui ont vu la page, quel que soit le moment. La
--            différence entre les deux, c'est le trafic amené par le
--            maillage interne.
-- rebonds  : arrivées directes qui n'ont vu que cette page et sont
--            reparties. Le taux de rebond d'une page d'entrée.
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
  WITH z AS (SELECT public.trafic_fuseau(p_tz) AS nom),
  b AS (SELECT ((now() AT TIME ZONE (SELECT nom FROM z))::date - GREATEST(p_days, 1)) AS jour0),
  f AS (
    SELECT pv.id, pv.visite_id, pv.path, pv.route_key, pv.created_at
    FROM public.page_views pv, z, b
    WHERE (pv.created_at AT TIME ZONE z.nom)::date > b.jour0
  ),
  -- L'id départage les ex aequo : deux vues dans la même milliseconde
  -- rendraient sinon la « première page » non déterministe.
  prem AS (
    SELECT DISTINCT ON (f.visite_id) f.visite_id, f.path
    FROM f ORDER BY f.visite_id, f.created_at, f.id
  ),
  taille AS (SELECT f.visite_id, count(*) AS n FROM f GROUP BY f.visite_id),
  agg AS (
    SELECT f.path, max(f.route_key) AS route_key,
           count(*) AS vues, count(DISTINCT f.visite_id) AS visites
    FROM f GROUP BY f.path
  ),
  ent AS (
    SELECT prem.path,
           count(*) AS entrees,
           count(*) FILTER (WHERE taille.n = 1) AS rebonds
    FROM prem JOIN taille ON taille.visite_id = prem.visite_id
    GROUP BY prem.path
  )
  SELECT agg.path, agg.route_key, agg.vues::bigint, agg.visites::bigint,
         COALESCE(ent.entrees, 0)::bigint, COALESCE(ent.rebonds, 0)::bigint
  FROM agg LEFT JOIN ent ON ent.path = agg.path
  ORDER BY agg.vues DESC;
$$;

-- ── D'où viennent les visites ───────────────────────────────────────────
-- La source d'une visite est celle de sa première page : les pages
-- suivantes ont toutes le site lui-même pour référent, les compter dirait
-- seulement que le maillage interne fonctionne.
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
  WITH z AS (SELECT public.trafic_fuseau(p_tz) AS nom),
  b AS (SELECT ((now() AT TIME ZONE (SELECT nom FROM z))::date - GREATEST(p_days, 1)) AS jour0),
  f AS (
    SELECT pv.id, pv.visite_id, pv.source, pv.created_at
    FROM public.page_views pv, z, b
    WHERE (pv.created_at AT TIME ZONE z.nom)::date > b.jour0
  ),
  prem AS (
    SELECT DISTINCT ON (f.visite_id) f.visite_id, f.source
    FROM f ORDER BY f.visite_id, f.created_at, f.id
  )
  SELECT COALESCE(NULLIF(prem.source, ''), 'direct')::text, count(*)::bigint
  FROM prem GROUP BY 1 ORDER BY 2 DESC;
$$;

-- ── Combien de pages par visite ─────────────────────────────────────────
-- Distribution, pas moyenne : une moyenne de 2,4 pages peut cacher aussi
-- bien « tout le monde en voit deux ou trois » que « neuf visiteurs sur dix
-- repartent tout de suite et le dixième en lit quinze ». Regroupé à 6 et
-- plus, au-delà la queue est trop fine pour être lisible.
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
  WITH z AS (SELECT public.trafic_fuseau(p_tz) AS nom),
  b AS (SELECT ((now() AT TIME ZONE (SELECT nom FROM z))::date - GREATEST(p_days, 1)) AS jour0),
  v AS (
    SELECT pv.visite_id, count(*) AS n
    FROM public.page_views pv, z, b
    WHERE (pv.created_at AT TIME ZONE z.nom)::date > b.jour0
    GROUP BY pv.visite_id
  )
  SELECT LEAST(v.n, 6)::integer, count(*)::bigint
  FROM v GROUP BY 1 ORDER BY 1;
$$;

-- ── L'entonnoir, page jouable par page jouable ──────────────────────────
-- Trois nombres qui portent sur les MÊMES visites : celles qui ont vu la
-- page, celles qui ont touché le moteur, celles qui sont allées jusqu'au
-- résultat. Compter par visite et non par ligne évite qu'un rechargement
-- de page gonfle les vues sans gonfler les lancements, ce qui écraserait
-- artificiellement le taux.
--
-- Les visites antérieures à la mise en service de la mesure sont hors
-- fenêtre par construction : leur visite_id est NULL.
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
  WITH z AS (SELECT public.trafic_fuseau(p_tz) AS nom),
  b AS (SELECT ((now() AT TIME ZONE (SELECT nom FROM z))::date - GREATEST(p_days, 1)) AS jour0),
  vues AS (
    SELECT pv.route_key AS rk, count(DISTINCT pv.visite_id) AS n
    FROM public.page_views pv, z, b
    WHERE pv.route_key IS NOT NULL
      AND (pv.created_at AT TIME ZONE z.nom)::date > b.jour0
    GROUP BY 1
  ),
  l AS (
    SELECT s.quiz_slug AS rk, count(DISTINCT s.visite_id) AS n
    FROM public.quiz_starts s, z, b
    WHERE s.visite_id IS NOT NULL
      AND (s.created_at AT TIME ZONE z.nom)::date > b.jour0
    GROUP BY 1
  ),
  c AS (
    SELECT q.quiz_slug AS rk, count(DISTINCT q.visite_id) AS n
    FROM public.quiz_completions q, z, b
    WHERE q.visite_id IS NOT NULL
      AND (q.created_at AT TIME ZONE z.nom)::date > b.jour0
    GROUP BY 1
  )
  SELECT vues.rk, vues.n::bigint,
         COALESCE(l.n, 0)::bigint, COALESCE(c.n, 0)::bigint
  FROM vues
  LEFT JOIN l ON l.rk = vues.rk
  LEFT JOIN c ON c.rk = vues.rk
  ORDER BY vues.n DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_trafic_resume(integer, text)     TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_trafic_daily(integer, text)      TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_trafic_pages(integer, text)      TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_trafic_sources(integer, text)    TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_trafic_profondeur(integer, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_trafic_entonnoir(integer, text)  TO anon, authenticated;

-- ── Conservation bornée ─────────────────────────────────────────────────
-- La CNIL demande que les données de mesure d'audience ne soient pas
-- gardées indéfiniment ; treize mois permettent la comparaison d'une année
-- sur l'autre, ce qui est la seule raison légitime de remonter aussi loin.
--
-- Volontairement PAS accordée à anon : c'est une suppression, elle ne
-- s'appelle que depuis l'éditeur SQL ou depuis pg_cron.
--   SELECT cron.schedule('purge-page-views', '0 4 * * 0',
--                        $q$ SELECT public.purge_page_views() $q$);
CREATE OR REPLACE FUNCTION public.purge_page_views()
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE n bigint;
BEGIN
  DELETE FROM public.page_views WHERE created_at < now() - interval '13 months';
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END;
$$;

REVOKE ALL ON FUNCTION public.purge_page_views() FROM anon, authenticated;
