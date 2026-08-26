-- ============================================================
-- LECTURES RÉELLES D'ARTICLES
--
-- La version précédente comptait les VISITES sur la page et les appelait des
-- lectures. C'est faux : quelqu'un qui arrive, voit le titre et repart en
-- deux secondes comptait exactement comme quelqu'un qui lit mille quatre
-- cents mots. Le compteur affiché au lecteur, « Ce contenu a été lu X fois »,
-- annonçait donc autre chose que ce qu'il mesurait.
--
-- Une ligne dans cette table, c'est une visite qui a rempli DEUX conditions,
-- vérifiées dans le navigateur :
--
--   * du temps passé sur la page, proportionnel à la longueur de l'article
--     (un quart du temps de lecture estimé, jamais moins de vingt secondes,
--     jamais plus de deux minutes), et compté seulement pendant que l'onglet
--     est au premier plan ;
--   * du défilement au-delà de la moitié du corps de l'article.
--
-- Ce n'est pas une preuve qu'on a lu — aucune mesure ne peut l'être — mais
-- c'est le comportement de quelqu'un qui lit, et ça écarte le passage
-- éclair, l'onglet ouvert puis oublié, et le robot qui ne fait pas défiler.
--
-- Mêmes propriétés que le reste de la mesure : identifiant de visite tiré au
-- hasard et mort après trente minutes, rien de nominatif, insertion ouverte,
-- lecture fermée, agrégats seulement.
--
-- Déploiement : coller ce fichier dans Supabase > SQL Editor > New Query,
-- APRÈS 20260826120000_blog_lectures_source_pref.sql.
-- Idempotent, réexécutable sans risque.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.article_lectures (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  visite_id text NOT NULL,
  path text NOT NULL,
  lang text,
  created_at timestamptz DEFAULT now()
);

-- Une visite ne lit un article qu'une fois. L'index unique fait le travail
-- côté base : le navigateur se garde déjà de renvoyer le signal, mais un
-- rechargement au bon moment ou deux onglets sur le même article passeraient
-- au travers.
CREATE UNIQUE INDEX IF NOT EXISTS article_lectures_unique_idx
  ON public.article_lectures (path, visite_id);
CREATE INDEX IF NOT EXISTS article_lectures_created_idx
  ON public.article_lectures (created_at);

ALTER TABLE public.article_lectures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "article_lectures_insert_anon" ON public.article_lectures;
CREATE POLICY "article_lectures_insert_anon" ON public.article_lectures
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- ── Le compteur public d'un article ─────────────────────────────────────
-- Désormais servi par les vraies lectures, plus par les ouvertures.
CREATE OR REPLACE FUNCTION public.get_article_lectures(p_path text)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*)::bigint
  FROM public.article_lectures al
  WHERE al.path = lower(p_path)
    AND public.est_article_blog(lower(p_path));
$$;

-- ── Le classement des articles ──────────────────────────────────────────
-- lectures    : visites qui ont lu, au sens ci-dessus. C'est le chiffre à
--               regarder, et le seul qui distingue un article lu d'un article
--               simplement ouvert.
-- ouvertures  : visites qui ont affiché la page, lecture ou non.
-- vues        : pages affichées, rechargements compris.
-- entrees     : ouvertures dont l'article est la première page de la visite,
--               donc une arrivée depuis un moteur ou un lien externe.
-- rebonds     : ces arrivées reparties sans voir une autre page.
-- total       : lectures depuis toujours, hors fenêtre. C'est le nombre
--               affiché au lecteur sous le titre de l'article.
--
-- Le type de retour change, donc DROP avant CREATE : PostgreSQL refuse de
-- remplacer une fonction dont la signature de sortie bouge.
DROP FUNCTION IF EXISTS public.get_blog_articles(integer, text);
CREATE FUNCTION public.get_blog_articles(
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
  WITH z AS (SELECT public.trafic_fuseau(p_tz) AS nom),
  b AS (SELECT ((now() AT TIME ZONE (SELECT nom FROM z))::date - GREATEST(p_days, 1)) AS jour0),
  f AS (
    SELECT pv.id, pv.visite_id, pv.path, pv.created_at
    FROM public.page_views pv, z, b
    WHERE (pv.created_at AT TIME ZONE z.nom)::date > b.jour0
  ),
  -- La première page de la visite se cherche sur TOUTES les pages, pas
  -- seulement sur les articles : sinon un visiteur arrivé par l'accueil puis
  -- passé sur un article compterait comme une arrivée directe sur l'article.
  prem AS (
    SELECT DISTINCT ON (f.visite_id) f.visite_id, f.path
    FROM f ORDER BY f.visite_id, f.created_at, f.id
  ),
  taille AS (SELECT f.visite_id, count(*) AS n FROM f GROUP BY f.visite_id),
  agg AS (
    SELECT f.path,
           count(DISTINCT f.visite_id) AS ouvertures,
           count(*) AS vues
    FROM f WHERE public.est_article_blog(f.path)
    GROUP BY f.path
  ),
  ent AS (
    SELECT prem.path,
           count(*) AS entrees,
           count(*) FILTER (WHERE taille.n = 1) AS rebonds
    FROM prem JOIN taille ON taille.visite_id = prem.visite_id
    WHERE public.est_article_blog(prem.path)
    GROUP BY prem.path
  ),
  lus AS (
    SELECT al.path, count(*) AS n
    FROM public.article_lectures al, z, b
    WHERE (al.created_at AT TIME ZONE z.nom)::date > b.jour0
    GROUP BY al.path
  ),
  tot AS (
    SELECT al.path, count(*) AS n
    FROM public.article_lectures al GROUP BY al.path
  )
  SELECT agg.path,
         public.langue_du_chemin(agg.path),
         COALESCE(lus.n, 0)::bigint,
         agg.ouvertures::bigint,
         agg.vues::bigint,
         COALESCE(ent.entrees, 0)::bigint,
         COALESCE(ent.rebonds, 0)::bigint,
         COALESCE(tot.n, 0)::bigint
  FROM agg
  LEFT JOIN ent ON ent.path = agg.path
  LEFT JOIN lus ON lus.path = agg.path
  LEFT JOIN tot ON tot.path = agg.path
  ORDER BY COALESCE(lus.n, 0) DESC, agg.ouvertures DESC;
$$;

-- ── Les clics « source préférée », jour par jour ────────────────────────
-- Pour la courbe du tableau de bord. Une ligne par jour et par emplacement ;
-- les jours sans clic n'apparaissent pas, c'est le navigateur qui complète
-- la série, comme pour les autres courbes.
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
  b AS (SELECT ((now() AT TIME ZONE (SELECT nom FROM z))::date - GREATEST(p_days, 1)) AS jour0)
  SELECT (c.created_at AT TIME ZONE z.nom)::date, c.emplacement, count(*)::bigint
  FROM public.source_pref_clics c, z, b
  WHERE (c.created_at AT TIME ZONE z.nom)::date > b.jour0
  GROUP BY 1, 2
  ORDER BY 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_article_lectures(text)             TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_blog_articles(integer, text)       TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_source_pref_daily(integer, text)   TO anon, authenticated;

-- Même conservation que le reste de la mesure d'audience : treize mois.
CREATE OR REPLACE FUNCTION public.purge_article_lectures()
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE n bigint;
BEGIN
  DELETE FROM public.article_lectures WHERE created_at < now() - interval '13 months';
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END;
$$;

REVOKE ALL ON FUNCTION public.purge_article_lectures() FROM anon, authenticated;
