-- Le parcours e-mail des abonnés (24 octobre 2026, Thomas : « un funnel
-- complètement automatique [...] Réfléchi bien à tout, il ne faut pas que
-- les mails qui s'envoient ne soient pas les bons, ou que le tracking n'est
-- pas bon »). Conception dans docs/emailing/CONCEPTION.md.
--
-- Deux campagnes Brevo pour chaque adresse laissée à la fin d'un test
-- (table abonnes) : « e1 » le lendemain vers 19 h (heure de Paris), « e2 »
-- trois jours plus tard si Brevo a confirmé la remise de « e1 », et rien
-- dès que l'adresse est dans une évaluation (donnée par l'une des deux
-- personnes, ou au paiement) : à partir de là, ce sont les e-mails de
-- l'évaluation qui prennent le relais. L'envoi du soir (emails/parcours.mjs,
-- workflow emails-parcours.yml) lit emails_du_jour, écrit une ligne par
-- envoi dans emails_envois (une seule par adresse et par e-mail : la
-- contrainte d'unicité empêche tout doublon, même si deux passages se
-- croisent), et le webhook de Brevo (fonction brevo-webhook, qui appelle
-- emails_evenement) y note la remise, les rebonds, les plaintes et les
-- désinscriptions. Aucun suivi des ouvertures ni des clics par personne :
-- la recommandation de la CNIL sur les pixels de suivi (2026) demande un
-- consentement à part, qu'on n'a pas demandé.
--
-- Tables et fonctions fermées à la clé publique. Idempotente ; appliquée
-- par emails-base.yml.

CREATE TABLE IF NOT EXISTS public.emails_envois (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  abonne_id uuid NOT NULL REFERENCES public.abonnes(id) ON DELETE CASCADE,
  type text NOT NULL,                       -- e1, e2
  angle text NOT NULL DEFAULT 'general',    -- la famille du test : score, projet, doute ; general sinon
  lang text NOT NULL,
  jour date NOT NULL,                       -- le soir d'envoi, heure de Paris
  statut text NOT NULL DEFAULT 'prepare',   -- prepare (en cours d'envoi), envoye (campagne partie)
  campagne_id bigint,
  liste_id bigint,
  cree_le timestamptz NOT NULL DEFAULT now(),
  envoye_le timestamptz,
  -- Ce que Brevo dit ensuite, chaque événement à sa colonne : l'ordre
  -- d'arrivée ne change rien et un événement reçu deux fois ne compte qu'une.
  remis_le timestamptz,
  rebond_doux_le timestamptz,
  plainte_le timestamptz,
  desinscrit_le timestamptz,
  CONSTRAINT emails_envois_unique UNIQUE (abonne_id, type),
  CONSTRAINT emails_envois_bornes CHECK (
    type IN ('e1', 'e2')
    AND angle IN ('score', 'projet', 'doute', 'general')
    AND lang IN ('fr', 'en', 'es', 'de', 'it', 'nl')
    AND statut IN ('prepare', 'envoye')
  )
);
CREATE INDEX IF NOT EXISTS emails_envois_jour_idx ON public.emails_envois (jour, type, lang);
CREATE INDEX IF NOT EXISTS emails_envois_campagne_idx ON public.emails_envois (campagne_id);
CREATE INDEX IF NOT EXISTS emails_envois_envoye_idx ON public.emails_envois (envoye_le);

REVOKE ALL ON TABLE public.emails_envois FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.emails_envois TO service_role;
ALTER TABLE public.emails_envois ENABLE ROW LEVEL SECURITY;

-- Les comptes du parcours, sans aucune adresse : ce qui reste quand une
-- adresse est supprimée (rebond) ou purgée. Un jour (heure de Paris), un
-- e-mail (e1, e2, ou « autre » pour une campagne envoyée à la main depuis
-- Brevo), un événement (envoye, remis, rebond_doux, rebond_dur, plainte,
-- desinscription).
CREATE TABLE IF NOT EXISTS public.emails_compteurs (
  jour date NOT NULL,
  type text NOT NULL,
  evenement text NOT NULL,
  n integer NOT NULL DEFAULT 0,
  PRIMARY KEY (jour, type, evenement),
  CONSTRAINT emails_compteurs_bornes CHECK (
    type ~ '^[a-z0-9_]{1,20}$' AND evenement ~ '^[a-z0-9_]{1,30}$' AND n >= 0
  )
);
REVOKE ALL ON TABLE public.emails_compteurs FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.emails_compteurs TO service_role;
ALTER TABLE public.emails_compteurs ENABLE ROW LEVEL SECURITY;

-- Le passage du soir : une ligne par jour d'envoi, écrite au début. Un
-- second passage le même soir la trouve et s'arrête. `bilan` garde ce qui
-- est parti (comptes par e-mail et par langue), jamais une adresse.
CREATE TABLE IF NOT EXISTS public.emails_passages (
  jour date PRIMARY KEY,
  debut timestamptz NOT NULL DEFAULT now(),
  fin timestamptz,
  bilan jsonb NOT NULL DEFAULT '{}'::jsonb
);
REVOKE ALL ON TABLE public.emails_passages FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.emails_passages TO service_role;
ALTER TABLE public.emails_passages ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.emails_compter(p_type text, p_evenement text, p_n integer DEFAULT 1)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.emails_compteurs (jour, type, evenement, n)
  SELECT (now() AT TIME ZONE 'Europe/Paris')::date, p_type, p_evenement, GREATEST(0, COALESCE(p_n, 1))
   WHERE GREATEST(0, COALESCE(p_n, 1)) > 0
  ON CONFLICT (jour, type, evenement) DO UPDATE SET n = emails_compteurs.n + EXCLUDED.n;
$$;
REVOKE EXECUTE ON FUNCTION public.emails_compter(text, text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.emails_compter(text, text, integer) TO service_role;

-- Qui reçoit quoi ce soir, dans l'ordre où on enverra si le plafond du
-- jour coupe la liste :
--   1. « e1 » des adresses laissées depuis moins de 48 heures (le moment
--      où la personne se souvient le mieux du test) ;
--   2. « e2 », trois jours après « e1 » ;
--   3. « e1 » des adresses plus anciennes, les plus récentes d'abord.
-- Personne ne reçoit « e1 » moins de 18 heures après avoir laissé son
-- adresse (le lendemain soir, ou le surlendemain pour une adresse laissée
-- après 1 h du matin), ni plus de 60 jours après. « e2 » ne part que si
-- Brevo a dit que « e1 » était remis, sans rebond, plainte ni
-- désinscription, au moins 66 heures et au plus 30 jours après. Personne ne
-- reçoit rien si son adresse est dans une évaluation, ni moins de 44 heures
-- après un e-mail du parcours. `consent_at` est la date du dernier accord :
-- une adresse désinscrite qui redit oui à la fin d'un autre test repart de
-- là, sans jamais recevoir deux fois le même e-mail. La source est la
-- dernière page où l'adresse a été laissée. Les adresses de l'e-book
-- (source « ebook ») n'entrent pas dans le parcours : leur case disait
-- « me contacte occasionnellement à des fins informationnelles », pas des
-- offres ; celle des tests dit « les conseils et nouveautés de Quiz Couple ».
CREATE OR REPLACE FUNCTION public.emails_du_jour(p_limite integer DEFAULT 300, p_maintenant timestamptz DEFAULT now())
RETURNS TABLE (abonne_id uuid, email text, lang text, source text, prenom text, type text, priorite integer, depuis timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH evaluations AS (
    SELECT lower(x.e) AS email FROM (
      SELECT a_email AS e FROM public.bilans WHERE a_email IS NOT NULL
      UNION SELECT b_email FROM public.bilans WHERE b_email IS NOT NULL
      UNION SELECT paiement_email FROM public.bilans WHERE paiement_email IS NOT NULL
    ) x
  ),
  candidats AS (
    SELECT ab.id, ab.email, ab.lang, COALESCE(ab.derniere_source, ab.source) AS source, ab.prenom,
           'e1'::text AS type,
           CASE WHEN ab.consent_at >= p_maintenant - interval '48 hours' THEN 1 ELSE 3 END AS priorite,
           ab.consent_at AS depuis
      FROM public.abonnes ab
     WHERE ab.statut = 'actif'
       AND COALESCE(ab.derniere_source, ab.source) <> 'ebook'
       AND ab.consent_at <= p_maintenant - interval '18 hours'
       AND ab.consent_at >= p_maintenant - interval '60 days'
       AND NOT EXISTS (SELECT 1 FROM public.emails_envois ev WHERE ev.abonne_id = ab.id AND ev.type = 'e1')
    UNION ALL
    SELECT ab.id, ab.email, ab.lang, COALESCE(ab.derniere_source, ab.source), ab.prenom,
           'e2'::text, 2, ev1.envoye_le
      FROM public.abonnes ab
      JOIN public.emails_envois ev1 ON ev1.abonne_id = ab.id AND ev1.type = 'e1'
     WHERE ab.statut = 'actif'
       AND COALESCE(ab.derniere_source, ab.source) <> 'ebook'
       AND ev1.statut = 'envoye'
       AND ev1.remis_le IS NOT NULL
       AND ev1.rebond_doux_le IS NULL AND ev1.plainte_le IS NULL AND ev1.desinscrit_le IS NULL
       AND ev1.envoye_le <= p_maintenant - interval '66 hours'
       AND ev1.envoye_le >= p_maintenant - interval '30 days'
       AND NOT EXISTS (SELECT 1 FROM public.emails_envois ev WHERE ev.abonne_id = ab.id AND ev.type = 'e2')
  )
  SELECT c.id, c.email, c.lang, c.source, c.prenom, c.type, c.priorite, c.depuis
    FROM candidats c
   WHERE NOT EXISTS (SELECT 1 FROM evaluations v WHERE v.email = c.email)
     AND NOT EXISTS (SELECT 1 FROM public.emails_envois ev
                      WHERE ev.abonne_id = c.id
                        AND COALESCE(ev.envoye_le, ev.cree_le) > p_maintenant - interval '44 hours')
   ORDER BY c.priorite, c.depuis DESC, c.id
   LIMIT GREATEST(0, LEAST(COALESCE(p_limite, 0), 5000));
$$;
REVOKE EXECUTE ON FUNCTION public.emails_du_jour(integer, timestamptz) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.emails_du_jour(integer, timestamptz) TO service_role;

-- Combien attendent, par e-mail : la file que l'admin affiche. Quand elle
-- grossit de soir en soir, le plafond de Brevo (300 par jour sur l'offre
-- gratuite) est trop bas pour le volume, et il faut l'offre supérieure.
CREATE OR REPLACE FUNCTION public.emails_file(p_maintenant timestamptz DEFAULT now())
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'e1', count(*) FILTER (WHERE type = 'e1'),
    'e1_recents', count(*) FILTER (WHERE type = 'e1' AND priorite = 1),
    'e2', count(*) FILTER (WHERE type = 'e2'))
  FROM public.emails_du_jour(5000, p_maintenant);
$$;
REVOKE EXECUTE ON FUNCTION public.emails_file(timestamptz) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.emails_file(timestamptz) TO service_role;

-- Un événement de Brevo (fonction brevo-webhook). `p_evenement` est déjà
-- traduit : remis, rebond_doux, rebond_dur, plainte, desinscription.
-- Rend ce qui a été fait, pour le journal de la fonction :
--   remis, rebond_doux, rebond_dur, plainte, desinscription : l'état a changé ;
--   deja : rien de neuf (événement reçu deux fois, ou adresse déjà sortie) ;
--   inconnu : l'adresse n'est pas (ou plus) dans abonnes ;
--   ignore : rien à faire (remise d'une campagne qui n'est pas du parcours).
-- Un rebond dur supprime l'adresse (Thomas : « on supprime le mail de la
-- BDD et ça s'arrête là ») ; une plainte ou une désinscription la passe en
-- « desinscrit » (rgpd_menage l'efface trois mois après) ; un rebond doux
-- arrête le parcours sans supprimer l'adresse (boîte pleine, serveur
-- indisponible ce soir-là). Une remise confirme l'adresse (abonnes.verifie).
-- Les comptes ne bougent que sur un changement d'état : un événement reçu
-- deux fois ne compte qu'une fois.
CREATE OR REPLACE FUNCTION public.emails_evenement(p_email text, p_campagne bigint, p_evenement text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  adr text := lower(btrim(COALESCE(p_email, '')));
  ab_id uuid;
  ev_id uuid;
  t text := 'autre';
  n integer := 0;
BEGIN
  IF adr = '' OR char_length(adr) > 254
     OR p_evenement IS NULL
     OR p_evenement NOT IN ('remis', 'rebond_doux', 'rebond_dur', 'plainte', 'desinscription') THEN
    RETURN 'ignore';
  END IF;
  SELECT id INTO ab_id FROM public.abonnes WHERE email = adr;
  IF ab_id IS NULL THEN
    RETURN 'inconnu';
  END IF;
  IF p_campagne IS NOT NULL THEN
    SELECT ev.id, ev.type INTO ev_id, t FROM public.emails_envois ev
     WHERE ev.abonne_id = ab_id AND ev.campagne_id = p_campagne;
    t := COALESCE(t, 'autre');
  END IF;

  IF p_evenement = 'remis' THEN
    IF ev_id IS NULL THEN
      RETURN 'ignore';
    END IF;
    UPDATE public.emails_envois SET remis_le = now() WHERE id = ev_id AND remis_le IS NULL;
    GET DIAGNOSTICS n = ROW_COUNT;
    UPDATE public.abonnes SET verifie = true WHERE id = ab_id AND verifie IS NOT TRUE;
    IF n > 0 THEN
      PERFORM public.emails_compter(t, 'remis');
      RETURN 'remis';
    END IF;
    RETURN 'deja';
  END IF;

  IF p_evenement = 'rebond_dur' THEN
    DELETE FROM public.abonnes WHERE id = ab_id;
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n > 0 THEN
      PERFORM public.emails_compter(t, 'rebond_dur');
      RETURN 'rebond_dur';
    END IF;
    RETURN 'deja';
  END IF;

  IF p_evenement = 'rebond_doux' THEN
    IF ev_id IS NULL THEN
      RETURN 'ignore';
    END IF;
    UPDATE public.emails_envois SET rebond_doux_le = now() WHERE id = ev_id AND rebond_doux_le IS NULL;
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n > 0 THEN
      PERFORM public.emails_compter(t, 'rebond_doux');
      RETURN 'rebond_doux';
    END IF;
    RETURN 'deja';
  END IF;

  -- plainte, desinscription
  IF ev_id IS NOT NULL THEN
    IF p_evenement = 'plainte' THEN
      UPDATE public.emails_envois SET plainte_le = now() WHERE id = ev_id AND plainte_le IS NULL;
    ELSE
      UPDATE public.emails_envois SET desinscrit_le = now() WHERE id = ev_id AND desinscrit_le IS NULL;
    END IF;
  END IF;
  UPDATE public.abonnes SET statut = 'desinscrit', desinscrit_le = now(), maj_le = now()
   WHERE id = ab_id AND statut <> 'desinscrit';
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n > 0 THEN
    PERFORM public.emails_compter(t, p_evenement);
    RETURN p_evenement;
  END IF;
  RETURN 'deja';
END
$$;
REVOKE EXECUTE ON FUNCTION public.emails_evenement(text, bigint, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.emails_evenement(text, bigint, text) TO service_role;

-- Parmi ces adresses, celles qui sont abonnées et actives : la
-- réconciliation du soir efface chez Brevo tout contact du parcours que
-- notre base n'a plus (rebond, désinscription, purge de rgpd_menage).
CREATE OR REPLACE FUNCTION public.emails_actifs(p_emails text[])
RETURNS SETOF text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ab.email FROM public.abonnes ab
   WHERE ab.statut = 'actif'
     AND ab.email = ANY (SELECT lower(btrim(e)) FROM unnest(COALESCE(p_emails, '{}'::text[])) e);
$$;
REVOKE EXECUTE ON FUNCTION public.emails_actifs(text[]) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.emails_actifs(text[]) TO service_role;

-- Le déclenchement par pg_cron : lance emails-parcours.yml entre 18 h 30
-- et 19 h 30 à Paris, une fois par jour, s'il y a quelque chose à envoyer.
-- Deux horaires en UTC (16 h 55 et 17 h 55) couvrent l'heure d'été et
-- l'heure d'hiver ; le script revérifie l'heure et le passage du jour.
CREATE OR REPLACE FUNCTION public.emails_lancer()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  heure time := (now() AT TIME ZONE 'Europe/Paris')::time;
BEGIN
  IF heure < time '18:30' OR heure > time '19:30' THEN
    RETURN false;
  END IF;
  IF EXISTS (SELECT 1 FROM public.emails_passages WHERE jour = (now() AT TIME ZONE 'Europe/Paris')::date) THEN
    RETURN false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.emails_du_jour(1, now())) THEN
    RETURN false;
  END IF;
  IF to_regprocedure('public.social_declencher_workflow(text)') IS NULL THEN
    RETURN false;
  END IF;
  EXECUTE 'SELECT public.social_declencher_workflow($1)' USING 'emails-parcours.yml';
  RETURN true;
EXCEPTION WHEN OTHERS THEN
  RETURN false;
END
$$;
REVOKE EXECUTE ON FUNCTION public.emails_lancer() FROM PUBLIC, anon, authenticated;

-- Le ménage : les lignes d'envoi de plus de 13 mois (elles partent aussi
-- avec l'adresse, par la clé étrangère), les passages de plus d'un an, les
-- comptes de plus de deux ans.
CREATE OR REPLACE FUNCTION public.emails_menage()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  n1 integer; n2 integer; n3 integer;
BEGIN
  DELETE FROM public.emails_envois WHERE cree_le < now() - interval '13 months';
  GET DIAGNOSTICS n1 = ROW_COUNT;
  DELETE FROM public.emails_passages WHERE jour < (now() - interval '1 year')::date;
  GET DIAGNOSTICS n2 = ROW_COUNT;
  DELETE FROM public.emails_compteurs WHERE jour < (now() - interval '2 years')::date;
  GET DIAGNOSTICS n3 = ROW_COUNT;
  RETURN jsonb_build_object('envois', n1, 'passages', n2, 'compteurs', n3);
END
$$;
REVOKE EXECUTE ON FUNCTION public.emails_menage() FROM PUBLIC, anon, authenticated;

-- La lecture de l'admin (onglet Leads, par admin-stats) : par e-mail, ce
-- qui est parti, remis, rebondi, désinscrit sur la période ; les envois de
-- la période et leur devenir ; la file ; les derniers passages ; la série
-- des jours. Aucune adresse.
CREATE OR REPLACE FUNCTION public.get_emails_tableau(p_jours integer DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  jours integer := GREATEST(1, LEAST(COALESCE(p_jours, 30), 400));
  debut date;
BEGIN
  debut := (now() AT TIME ZONE 'Europe/Paris')::date - (jours - 1);
  RETURN jsonb_build_object(
    'jours', jours,
    'debut', debut,
    'compteurs', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('type', c.type, 'evenement', c.evenement, 'n', c.n) ORDER BY c.type, c.evenement)
        FROM (SELECT type, evenement, sum(n)::integer AS n FROM public.emails_compteurs
               WHERE jour >= debut GROUP BY type, evenement) c), '[]'::jsonb),
    'envois', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('type', e.type, 'lang', e.lang, 'angle', e.angle, 'envoyes', e.envoyes,
                                          'remis', e.remis, 'rebonds', e.rebonds, 'plaintes', e.plaintes,
                                          'desinscrits', e.desinscrits) ORDER BY e.type, e.lang, e.angle)
        FROM (SELECT type, lang, angle,
                     count(*) FILTER (WHERE statut = 'envoye') AS envoyes,
                     count(*) FILTER (WHERE remis_le IS NOT NULL) AS remis,
                     count(*) FILTER (WHERE rebond_doux_le IS NOT NULL) AS rebonds,
                     count(*) FILTER (WHERE plainte_le IS NOT NULL) AS plaintes,
                     count(*) FILTER (WHERE desinscrit_le IS NOT NULL) AS desinscrits
                FROM public.emails_envois WHERE jour >= debut
               GROUP BY type, lang, angle) e), '[]'::jsonb),
    'serie', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('jour', s.jour, 'type', s.type, 'n', s.n) ORDER BY s.jour, s.type)
        FROM (SELECT jour, type, sum(n)::integer AS n FROM public.emails_compteurs
               WHERE jour >= debut AND evenement = 'envoye' GROUP BY jour, type) s), '[]'::jsonb),
    'file', public.emails_file(now()),
    'passages', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('jour', p.jour, 'debut', p.debut, 'fin', p.fin, 'bilan', p.bilan) ORDER BY p.jour DESC)
        FROM (SELECT * FROM public.emails_passages ORDER BY jour DESC LIMIT 14) p), '[]'::jsonb)
  );
END
$$;
REVOKE EXECUTE ON FUNCTION public.get_emails_tableau(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_emails_tableau(integer) TO service_role;

DO $do$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule(jobid) FROM cron.job WHERE jobname IN ('emails-parcours', 'emails-menage');
    PERFORM cron.schedule('emails-parcours', '55 16,17 * * *', $q$ SELECT public.emails_lancer() $q$);
    PERFORM cron.schedule('emails-menage', '43 2 * * *', $q$ SELECT public.emails_menage() $q$);
  END IF;
END
$do$;

SELECT 'emails_parcours' AS migration,
       (SELECT count(*) FROM public.abonnes WHERE statut = 'actif') AS abonnes_actifs,
       public.emails_file(now()) AS file;
