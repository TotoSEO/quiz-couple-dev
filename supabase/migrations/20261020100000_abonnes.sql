-- Les abonnés e-mail (19 octobre 2026, Thomas : « si je récolte des emails
-- tous les jours, je vais pouvoir contacter les gens pour leur promouvoir le
-- test payant, avec des codes de réduction »). Une adresse laissée à la fin
-- d'un test pour déverrouiller le reste de ses résultats (capture.js,
-- fonction lead-capture), ou celle d'un lead de l'e-book une fois vérifiée.
-- Chaque ligne garde la LANGUE de la personne (pour lui écrire dans la
-- sienne), la source (la page, ou « ebook »), le consentement et sa date, un
-- jeton de désinscription, et jamais l'adresse IP en clair (empreinte salée).
--
-- Fermée à la clé publique : seules les fonctions serveur (clé de service)
-- écrivent et lisent. Appliquée par abonnes-base.yml. Idempotente.

CREATE TABLE IF NOT EXISTS public.abonnes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  lang text NOT NULL DEFAULT 'fr',
  source text NOT NULL,                       -- 'ebook' ou l'id de la page (tester-couple, toxique...)
  page text,                                   -- le chemin de la page d'où vient l'adresse
  statut text NOT NULL DEFAULT 'actif',        -- actif, desinscrit, invalide (rebond)
  consent_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  maj_le timestamptz NOT NULL DEFAULT now(),
  desinscrit_le timestamptz,
  derniere_source text,                        -- la dernière page où l'adresse a été redonnée
  captures integer NOT NULL DEFAULT 1,         -- combien de fois l'adresse a été laissée
  verifie boolean NOT NULL DEFAULT false,      -- confirmée (e-book) ou un e-mail reçu sans rebond
  ip_hash text,
  jeton text NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  CONSTRAINT abonnes_email_unique UNIQUE (email),
  CONSTRAINT abonnes_jeton_unique UNIQUE (jeton),
  CONSTRAINT abonnes_bornes CHECK (
    char_length(email) BETWEEN 6 AND 254 AND email = lower(email) AND position('@' IN email) > 1
    AND lang IN ('fr', 'en', 'es', 'de', 'it', 'nl')
    AND source ~ '^[a-z0-9-]{1,40}$'
    AND (page IS NULL OR char_length(page) <= 200)
    AND statut IN ('actif', 'desinscrit', 'invalide')
    AND (derniere_source IS NULL OR derniere_source ~ '^[a-z0-9-]{1,40}$')
    AND (ip_hash IS NULL OR char_length(ip_hash) <= 64)
    AND char_length(jeton) BETWEEN 16 AND 64
    AND captures BETWEEN 1 AND 100000
  )
);
CREATE INDEX IF NOT EXISTS abonnes_created_at_idx ON public.abonnes (created_at DESC);
CREATE INDEX IF NOT EXISTS abonnes_source_idx ON public.abonnes (source);
CREATE INDEX IF NOT EXISTS abonnes_statut_lang_idx ON public.abonnes (statut, lang);

ALTER TABLE public.abonnes ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.abonnes FROM PUBLIC, anon, authenticated;

-- ── La reprise des leads de l'e-book déjà vérifiés ──────────────────────
-- Le téléchargement de l'e-book se fait après confirmation de l'adresse :
-- ces personnes ont dit oui à un e-mail de Quiz Couple, en français.
DO $$
BEGIN
  IF to_regclass('public.leads') IS NOT NULL THEN
    INSERT INTO public.abonnes (email, lang, source, statut, consent_at, created_at, maj_le, verifie)
    SELECT lower(trim(l.email)), 'fr', 'ebook', 'actif', l.created_at, l.created_at, l.created_at, true
    FROM public.leads l
    WHERE l.email_verified IS TRUE
      AND l.email IS NOT NULL
      AND lower(trim(l.email)) ~ '^[a-z0-9._%+''-]+@[a-z0-9.-]+\.[a-z]{2,}$'
      AND char_length(trim(l.email)) BETWEEN 6 AND 254
    ON CONFLICT (email) DO NOTHING;
  END IF;
END $$;

-- ── La lecture de l'admin (onglet Leads), par admin-stats ───────────────
-- Un seul appel : les totaux, par source (avec la répartition par langue),
-- par langue, la série des jours de la période (heure de Paris) et les
-- cinquante dernières adresses. Fermée à la clé publique.
CREATE OR REPLACE FUNCTION public.get_abonnes_tableau(p_jours integer DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  jours integer := GREATEST(1, LEAST(COALESCE(p_jours, 30), 400));
  tz text := 'Europe/Paris';
  aujourdhui date := (now() AT TIME ZONE 'Europe/Paris')::date;
  debut date := (now() AT TIME ZONE 'Europe/Paris')::date - (GREATEST(1, LEAST(COALESCE(p_jours, 30), 400)) - 1);
  res jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total', (SELECT count(*) FROM abonnes),
    'actifs', (SELECT count(*) FROM abonnes WHERE statut = 'actif'),
    'desinscrits', (SELECT count(*) FROM abonnes WHERE statut = 'desinscrit'),
    'invalides', (SELECT count(*) FROM abonnes WHERE statut = 'invalide'),
    'aujourd_hui', (SELECT count(*) FROM abonnes WHERE (created_at AT TIME ZONE tz)::date = aujourdhui),
    'sept_jours', (SELECT count(*) FROM abonnes WHERE created_at >= now() - interval '7 days'),
    'periode', (SELECT count(*) FROM abonnes WHERE (created_at AT TIME ZONE tz)::date >= debut),
    'jours', jours,
    'par_source', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('source', s.source, 'n', s.n, 'actifs', s.actifs, 'periode', s.periode,
        'fr', s.fr, 'en', s.en, 'es', s.es, 'de', s.de, 'it', s.it, 'nl', s.nl) ORDER BY s.n DESC, s.source)
      FROM (
        SELECT source, count(*) AS n,
          count(*) FILTER (WHERE statut = 'actif') AS actifs,
          count(*) FILTER (WHERE (created_at AT TIME ZONE tz)::date >= debut) AS periode,
          count(*) FILTER (WHERE lang = 'fr') AS fr, count(*) FILTER (WHERE lang = 'en') AS en,
          count(*) FILTER (WHERE lang = 'es') AS es, count(*) FILTER (WHERE lang = 'de') AS de,
          count(*) FILTER (WHERE lang = 'it') AS it, count(*) FILTER (WHERE lang = 'nl') AS nl
        FROM abonnes GROUP BY source
      ) s), '[]'::jsonb),
    'par_langue', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('lang', l.lang, 'n', l.n, 'actifs', l.actifs, 'periode', l.periode) ORDER BY l.n DESC)
      FROM (
        SELECT lang, count(*) AS n, count(*) FILTER (WHERE statut = 'actif') AS actifs,
          count(*) FILTER (WHERE (created_at AT TIME ZONE tz)::date >= debut) AS periode
        FROM abonnes GROUP BY lang
      ) l), '[]'::jsonb),
    'serie', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('jour', j.jour, 'n', COALESCE(c.n, 0)) ORDER BY j.jour)
      FROM generate_series(debut, aujourdhui, interval '1 day') AS j(jour)
      LEFT JOIN (
        SELECT (created_at AT TIME ZONE tz)::date AS jour, count(*) AS n
        FROM abonnes WHERE (created_at AT TIME ZONE tz)::date >= debut GROUP BY 1
      ) c ON c.jour = j.jour::date), '[]'::jsonb),
    'derniers', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('email', d.email, 'lang', d.lang, 'source', d.source, 'statut', d.statut,
        'created_at', d.created_at, 'captures', d.captures, 'verifie', d.verifie) ORDER BY d.created_at DESC)
      FROM (SELECT email, lang, source, statut, created_at, captures, verifie FROM abonnes ORDER BY created_at DESC LIMIT 50) d), '[]'::jsonb)
  ) INTO res;
  RETURN res;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.get_abonnes_tableau(integer) FROM PUBLIC, anon, authenticated;

-- Un bilan pour le journal du workflow.
SELECT
  (SELECT count(*) FROM public.abonnes) AS abonnes,
  (SELECT count(*) FROM public.abonnes WHERE source = 'ebook') AS repris_ebook,
  (to_regprocedure('public.get_abonnes_tableau(integer)') IS NOT NULL) AS lecture_admin;
