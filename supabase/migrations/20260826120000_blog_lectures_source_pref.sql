-- ============================================================
-- LECTURES D'ARTICLES ET CLICS « SOURCE PRÉFÉRÉE GOOGLE »
--
-- Deux besoins qui arrivent ensemble, et une table qui existe déjà.
--
-- 1. Le compteur « Ce contenu a été lu X fois » sous le titre d'un article.
--    Rien de nouveau à collecter : page_views enregistre déjà chaque page
--    affichée avec son chemin. Il manquait seulement une fonction publique
--    capable de rendre le total d'un chemin donné sans ouvrir la table.
--
--    On compte les VISITES distinctes, pas les lignes. Un lecteur qui
--    recharge la page ou qui revient dans la demi-heure a lu l'article une
--    fois, pas trois : afficher les lignes brutes gonflerait le compteur
--    d'une manière que personne ne pourrait vérifier.
--
-- 2. Les clics sur le bouton « Ajouter Quiz Couple à mes sources préférées ».
--    Google ne publie aucun chiffre sur les sources préférées : ni rapport
--    Search Console, ni API, ni retour JavaScript. Le clic ouvre son outil,
--    où il reste une seconde confirmation à donner, hors du site. Ce qu'on
--    mesure ici est donc l'INTENTION, jamais le nombre d'abonnés. C'est
--    écrit ici pour que personne ne relise ces chiffres comme autre chose
--    dans six mois.
--
-- Même posture que les autres tables de mesure : insertion ouverte, lecture
-- fermée, agrégats seulement, aucune donnée nominative.
--
-- Déploiement : coller ce fichier dans Supabase > SQL Editor > New Query.
-- Idempotent, réexécutable sans risque.
-- ============================================================

-- ── Ce qui est un article de blog ───────────────────────────────────────
-- /blog/<slug>/ en français, /<langue>/blog/<slug>/ ailleurs. Le « [^/]+ »
-- écarte la page de listing /blog/ elle-même, qui n'est pas un article et
-- qui écraserait tout le classement.
CREATE OR REPLACE FUNCTION public.est_article_blog(p_path text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT p_path ~ '^(/(en|es|de|it))?/blog/[^/]+/$';
$$;

-- La langue se lit dans le chemin plutôt que dans la colonne lang : le
-- chemin est ce qui a servi à servir la page, il ne peut pas mentir, et les
-- lignes les plus anciennes n'ont pas toujours de lang.
CREATE OR REPLACE FUNCTION public.langue_du_chemin(p_path text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT COALESCE(substring(p_path from '^/(en|es|de|it)/'), 'fr');
$$;

-- ── Le compteur public d'un article ─────────────────────────────────────
-- Appelée par le navigateur sur chaque page d'article. Elle ne rend qu'un
-- nombre, pour un chemin donné, et ne dit rien de qui a lu quoi.
--
-- Depuis toujours, sans fenêtre de dates : le compteur affiché au lecteur
-- parle de l'article, pas des trente derniers jours. La borne réelle est la
-- purge à treize mois de page_views.
CREATE OR REPLACE FUNCTION public.get_article_lectures(p_path text)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(DISTINCT pv.visite_id)::bigint
  FROM public.page_views pv
  WHERE pv.path = lower(p_path)
    AND public.est_article_blog(lower(p_path));
$$;

-- ── Le classement des articles, pour le tableau de bord ─────────────────
-- lectures : visites distinctes sur la période, l'unité du compteur public.
-- vues     : pages affichées, rechargements compris.
-- entrees  : visites dont l'article est la première page, donc une arrivée
--            depuis un moteur ou un lien externe. C'est le chiffre qui dit
--            si l'article travaille pour le référencement.
-- rebonds  : ces arrivées qui sont reparties sans voir une autre page.
-- total    : lectures depuis toujours, hors fenêtre, pour retrouver le
--            nombre affiché au lecteur sur la page.
CREATE OR REPLACE FUNCTION public.get_blog_articles(
  p_days integer DEFAULT 30,
  p_tz   text    DEFAULT 'UTC'
)
RETURNS TABLE(path text, lang text, lectures bigint, vues bigint,
              entrees bigint, rebonds bigint, total bigint)
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
           count(DISTINCT f.visite_id) AS lectures,
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
  -- Le LIKE avant la regex : il ecarte d'un coup toutes les pages qui ne
  -- sont pas des articles, sans payer une expression reguliere par ligne sur
  -- l'integralite de la table.
  tot AS (
    SELECT pv.path, count(DISTINCT pv.visite_id) AS n
    FROM public.page_views pv
    WHERE pv.path LIKE '%/blog/%'
      AND public.est_article_blog(pv.path)
    GROUP BY pv.path
  )
  SELECT agg.path,
         public.langue_du_chemin(agg.path),
         agg.lectures::bigint,
         agg.vues::bigint,
         COALESCE(ent.entrees, 0)::bigint,
         COALESCE(ent.rebonds, 0)::bigint,
         COALESCE(tot.n, 0)::bigint
  FROM agg
  LEFT JOIN ent ON ent.path = agg.path
  LEFT JOIN tot ON tot.path = agg.path
  ORDER BY agg.lectures DESC;
$$;

-- ── Les clics sur le bouton « source préférée » ─────────────────────────
-- emplacement : « pied » ou « blog ». Les deux encarts ne disent pas la même
-- chose : celui du pied de page est vu par tout le monde et cliqué par peu,
-- celui d'un article est vu par quelqu'un qui vient de lire. Les séparer est
-- la seule façon de savoir lequel des deux sert à quelque chose.
CREATE TABLE IF NOT EXISTS public.source_pref_clics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Le même numéro de passage que page_views, avec les mêmes propriétés :
  -- tiré au hasard, mort après trente minutes, jamais reconduit. Il sert à
  -- ne pas compter dix fois la même personne qui hésite.
  visite_id text,
  emplacement text NOT NULL,
  lang text,
  path text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS source_pref_clics_created_idx ON public.source_pref_clics (created_at);

ALTER TABLE public.source_pref_clics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "source_pref_clics_insert_anon" ON public.source_pref_clics;
CREATE POLICY "source_pref_clics_insert_anon" ON public.source_pref_clics
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- clics   : tous les clics, y compris deux clics de la même personne.
-- visites : visites distinctes ayant cliqué. C'est le chiffre à lire.
-- total   : depuis toujours, hors fenêtre.
--
-- Rappel écrit noir sur blanc : aucun de ces trois nombres ne dit combien de
-- personnes ont réellement ajouté le site à leurs sources préférées. La
-- confirmation se donne chez Google et n'est jamais renvoyée à l'éditeur.
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
  WITH z AS (SELECT public.trafic_fuseau(p_tz) AS nom),
  b AS (SELECT ((now() AT TIME ZONE (SELECT nom FROM z))::date - GREATEST(p_days, 1)) AS jour0),
  f AS (
    SELECT c.emplacement, c.visite_id
    FROM public.source_pref_clics c, z, b
    WHERE (c.created_at AT TIME ZONE z.nom)::date > b.jour0
  ),
  tot AS (
    SELECT c.emplacement AS e, count(*) AS n
    FROM public.source_pref_clics c GROUP BY c.emplacement
  ),
  fen AS (
    SELECT f.emplacement AS e, count(*) AS clics,
           count(DISTINCT f.visite_id) AS visites
    FROM f GROUP BY f.emplacement
  )
  SELECT fen.e, fen.clics::bigint, fen.visites::bigint,
         COALESCE(tot.n, 0)::bigint
  FROM fen LEFT JOIN tot ON tot.e = fen.e
  ORDER BY fen.clics DESC;
$$;

GRANT EXECUTE ON FUNCTION public.est_article_blog(text)                 TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.langue_du_chemin(text)                 TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_article_lectures(text)             TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_blog_articles(integer, text)       TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_source_pref_clics(integer, text)   TO anon, authenticated;

-- Même conservation que la mesure d'audience : treize mois, pas plus.
CREATE OR REPLACE FUNCTION public.purge_source_pref_clics()
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE n bigint;
BEGIN
  DELETE FROM public.source_pref_clics WHERE created_at < now() - interval '13 months';
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END;
$$;

REVOKE ALL ON FUNCTION public.purge_source_pref_clics() FROM anon, authenticated;
