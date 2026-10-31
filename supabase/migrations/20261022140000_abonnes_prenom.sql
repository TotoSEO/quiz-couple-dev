-- Le prénom des abonnés e-mail (22 octobre 2026, Thomas : « oui pour le
-- prénom pour personnaliser les e-mails, et ceux qui n'en ont pas on
-- laissera vide »). Facultatif, demandé sur le mot de merci de la porte des
-- résultats, une fois l'adresse acceptée (capture.js), et gardé par
-- lead-capture seulement avec la clé que la réponse de l'adresse vient de
-- rendre (`prenom_cle`, empreinte, une heure). Les prénoms déjà donnés pour
-- l'e-book sont repris. get_abonnes_tableau rend le prénom des cinquante
-- dernières adresses et le nombre d'abonnés qui en ont un.
-- Idempotente ; appliquée par abonnes-base.yml après 20261020100000.

ALTER TABLE public.abonnes ADD COLUMN IF NOT EXISTS prenom text;
ALTER TABLE public.abonnes ADD COLUMN IF NOT EXISTS prenom_cle text;
ALTER TABLE public.abonnes ADD COLUMN IF NOT EXISTS prenom_cle_le timestamptz;
ALTER TABLE public.abonnes DROP CONSTRAINT IF EXISTS abonnes_prenom_bornes;
ALTER TABLE public.abonnes ADD CONSTRAINT abonnes_prenom_bornes CHECK (
  (prenom IS NULL OR char_length(prenom) BETWEEN 1 AND 40)
  AND (prenom_cle IS NULL OR char_length(prenom_cle) = 64)
) NOT VALID;

-- Les prénoms de l'e-book : seulement des lettres (la même règle que
-- prenomPropre), 40 signes au plus, et seulement là où rien n'est écrit.
DO $do$
BEGIN
  IF to_regclass('public.leads') IS NOT NULL
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'leads' AND column_name = 'first_name') THEN
    EXECUTE $q$
      UPDATE public.abonnes a
      SET prenom = l.prenom
      FROM (
        SELECT DISTINCT ON (lower(btrim(email))) lower(btrim(email)) AS email, btrim(regexp_replace(first_name, '\s+', ' ', 'g')) AS prenom
        FROM public.leads
        WHERE first_name IS NOT NULL
        ORDER BY lower(btrim(email)), created_at DESC
      ) l
      WHERE a.email = l.email AND a.prenom IS NULL
        AND char_length(l.prenom) BETWEEN 1 AND 40
        AND l.prenom ~ $r$^[[:alpha:]][[:alpha:] '’.-]*$$r$
    $q$;
  END IF;
END
$do$;

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
      SELECT jsonb_agg(jsonb_build_object('email', d.email, 'prenom', d.prenom, 'lang', d.lang, 'source', d.source, 'statut', d.statut,
        'created_at', d.created_at, 'captures', d.captures, 'verifie', d.verifie) ORDER BY d.created_at DESC)
      FROM (SELECT email, prenom, lang, source, statut, created_at, captures, verifie FROM abonnes ORDER BY created_at DESC LIMIT 50) d), '[]'::jsonb),
    'avec_prenom', (SELECT count(*) FROM abonnes WHERE prenom IS NOT NULL)
  ) INTO res;
  RETURN res;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.get_abonnes_tableau(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_abonnes_tableau(integer) TO service_role;

SELECT 'abonnes_prenom' AS migration,
  (SELECT count(*) FROM public.abonnes) AS abonnes,
  (SELECT count(*) FROM public.abonnes WHERE prenom IS NOT NULL) AS avec_prenom;
