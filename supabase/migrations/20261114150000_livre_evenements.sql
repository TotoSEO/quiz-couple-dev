-- La mesure de la page du livre « 100 aventures à deux » (14 novembre 2026,
-- Thomas : « rajoute du tracking sur la page du livre. Nombre de clics sur la
-- page, sur le bouton Amazon et d'autres trucs que tu trouves pertinents »).
--
-- Une ligne par geste, écrite par js/livre.js avec la clé publique, en
-- requête simple comme page_views et instagram_clics :
--   vue        la page affichée ; detail = d'où vient la visite (bouton du
--              menu, du menu du téléphone, du pied de page, une page du site,
--              Google, un autre site, direct) ;
--   amazon     un clic vers Amazon ; detail = le bouton (hero, cadeau, fin,
--              barre) ;
--   section    une partie de la page arrivée à l'écran ; detail = la partie ;
--   page       une page du livre ouverte en grand ; detail = la page ;
--   liste      « Voir les 100 aventures » ;
--   avap       la page avant/après touchée ;
--   faq        une question ouverte ; detail = la question ;
--   feuilleter le lien « Feuilleter le livre » du haut ;
--   carrousel  les pages feuilletées de côté ;
--   barre      la barre collée du téléphone apparue.
-- Rien de personnel : le numéro de visite de page_views (tiré au hasard, mort
-- après trente minutes), la langue de la page. Ni adresse IP ni chemin
-- complet d'un autre site, seulement son nom d'hôte.
--
-- La lecture passe par get_livre_stats, réservée à la clé de service (admin,
-- fonction admin-stats). Idempotente : appliquée par livre-base.yml, ou à la
-- main dans Supabase > SQL Editor.

CREATE TABLE IF NOT EXISTS public.livre_evenements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  visite_id text,
  evenement text NOT NULL,
  detail text,
  lang text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS livre_evenements_created_idx ON public.livre_evenements (created_at);

ALTER TABLE public.livre_evenements DROP CONSTRAINT IF EXISTS livre_evenements_evenement_valeur;
ALTER TABLE public.livre_evenements ADD CONSTRAINT livre_evenements_evenement_valeur
  CHECK (evenement IN ('vue', 'amazon', 'section', 'page', 'liste', 'avap', 'faq', 'feuilleter', 'carrousel', 'barre'));
ALTER TABLE public.livre_evenements DROP CONSTRAINT IF EXISTS livre_evenements_taille;
ALTER TABLE public.livre_evenements ADD CONSTRAINT livre_evenements_taille
  CHECK (coalesce(length(visite_id), 0) <= 64 AND coalesce(length(detail), 0) <= 120 AND coalesce(length(lang), 0) <= 8);

-- Les droits, écrits ici depuis que Supabase ne les donne plus d'office
-- (30 octobre 2026) : la clé publique n'écrit que des lignes, n'en lit
-- aucune.
REVOKE ALL ON TABLE public.livre_evenements FROM PUBLIC, anon, authenticated;
GRANT INSERT ON TABLE public.livre_evenements TO anon;
GRANT ALL ON TABLE public.livre_evenements TO service_role;

ALTER TABLE public.livre_evenements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "livre_evenements_insert_anon" ON public.livre_evenements;
CREATE POLICY "livre_evenements_insert_anon" ON public.livre_evenements
  FOR INSERT TO anon WITH CHECK (true);

-- Le frein des écritures publiques (20261020150000) : soixante lignes par
-- minute et par adresse IP, neuf cents en tout. Une visite qui parcourt toute
-- la page en écrit une quinzaine.
DO $$
BEGIN
  IF to_regprocedure('public.frein_anon_insert()') IS NOT NULL THEN
    EXECUTE 'DROP TRIGGER IF EXISTS frein_anon ON public.livre_evenements';
    EXECUTE 'CREATE TRIGGER frein_anon BEFORE INSERT ON public.livre_evenements FOR EACH ROW EXECUTE FUNCTION public.frein_anon_insert(''60'', ''900'', ''60'')';
  ELSE
    RAISE NOTICE 'frein_anon_insert absente : la table n''a pas de frein';
  END IF;
END $$;

-- Ce que lit l'onglet Livre de l'admin, sur les p_jours derniers jours
-- (aujourd'hui compris, heure de Paris). Une visite compte une fois par
-- geste ; sa source est celle de sa première page vue du livre.
CREATE OR REPLACE FUNCTION public.get_livre_stats(p_jours integer DEFAULT 30)
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH b AS (
    SELECT n,
           ((date_trunc('day', now() AT TIME ZONE 'Europe/Paris') - make_interval(days => n - 1)) AT TIME ZONE 'Europe/Paris') AS debut,
           (date_trunc('day', now() AT TIME ZONE 'Europe/Paris') AT TIME ZONE 'Europe/Paris') AS debut_jour
    FROM (SELECT greatest(1, least(coalesce(p_jours, 30), 400)) AS n) x
  ),
  e AS (
    SELECT l.visite_id, l.evenement, l.detail, l.created_at,
           (l.created_at AT TIME ZONE 'Europe/Paris')::date AS jour
    FROM public.livre_evenements l, b
    WHERE l.created_at >= b.debut
  ),
  vues AS (SELECT * FROM e WHERE evenement = 'vue'),
  clics AS (SELECT * FROM e WHERE evenement = 'amazon'),
  arrivees AS (
    SELECT DISTINCT ON (visite_id) visite_id, coalesce(nullif(detail, ''), 'direct') AS source
    FROM vues WHERE visite_id IS NOT NULL
    ORDER BY visite_id, created_at
  ),
  jours AS (
    SELECT d::date AS jour
    FROM b, generate_series((b.debut AT TIME ZONE 'Europe/Paris')::date, (now() AT TIME ZONE 'Europe/Paris')::date, interval '1 day') d
  )
  SELECT json_build_object(
    'jours', (SELECT n FROM b),
    'premiere', (SELECT min(created_at) FROM public.livre_evenements),
    'totaux', json_build_object(
      'vues', (SELECT count(*) FROM vues),
      'visites', (SELECT count(DISTINCT visite_id) FROM vues),
      'clics', (SELECT count(*) FROM clics),
      'visites_clic', (SELECT count(DISTINCT visite_id) FROM clics),
      'visites_jour', (SELECT count(DISTINCT v.visite_id) FROM vues v, b WHERE v.created_at >= b.debut_jour),
      'clics_jour', (SELECT count(*) FROM clics c, b WHERE c.created_at >= b.debut_jour)
    ),
    'serie', (
      SELECT coalesce(json_agg(json_build_object(
        'jour', j.jour,
        'visites', (SELECT count(DISTINCT v.visite_id) FROM vues v WHERE v.jour = j.jour),
        'clics', (SELECT count(*) FROM clics c WHERE c.jour = j.jour),
        'visites_clic', (SELECT count(DISTINCT c.visite_id) FROM clics c WHERE c.jour = j.jour)
      ) ORDER BY j.jour), '[]'::json)
      FROM jours j
    ),
    'emplacements', (
      SELECT coalesce(json_agg(json_build_object('emplacement', x.detail, 'clics', x.clics, 'visites', x.visites) ORDER BY x.clics DESC), '[]'::json)
      FROM (SELECT coalesce(detail, '') AS detail, count(*) AS clics, count(DISTINCT visite_id) AS visites FROM clics GROUP BY 1) x
    ),
    'sources', (
      SELECT coalesce(json_agg(json_build_object('source', x.source, 'visites', x.visites, 'visites_clic', x.visites_clic) ORDER BY x.visites DESC), '[]'::json)
      FROM (
        SELECT a.source, count(*) AS visites,
               count(*) FILTER (WHERE EXISTS (SELECT 1 FROM clics c WHERE c.visite_id = a.visite_id)) AS visites_clic
        FROM arrivees a GROUP BY a.source
      ) x
    ),
    'gestes', (
      SELECT coalesce(json_agg(json_build_object('evenement', x.evenement, 'detail', x.detail, 'fois', x.fois, 'visites', x.visites) ORDER BY x.evenement, x.visites DESC), '[]'::json)
      FROM (
        SELECT evenement, coalesce(detail, '') AS detail, count(*) AS fois, count(DISTINCT visite_id) AS visites
        FROM e WHERE evenement NOT IN ('vue', 'amazon')
        GROUP BY 1, 2
      ) x
    )
  );
$$;

-- Lue par l'admin seulement, par admin-stats et la clé de service.
REVOKE EXECUTE ON FUNCTION public.get_livre_stats(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_livre_stats(integer) TO service_role;

-- Les lignes sont gardées 400 jours (l'admin lit un an au plus), puis
-- effacées chaque nuit à 2 h 40 UTC, après le ménage du RGPD. Une quinzaine
-- de lignes par visite : sans purge, la table grossirait sans fin sur les
-- 500 Mo du plan gratuit.
DO $do$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule(jobid) FROM cron.job WHERE jobname = 'livre-menage';
    PERFORM cron.schedule('livre-menage', '40 2 * * *', $q$ DELETE FROM public.livre_evenements WHERE created_at < now() - interval '400 days' $q$);
  END IF;
END
$do$;
