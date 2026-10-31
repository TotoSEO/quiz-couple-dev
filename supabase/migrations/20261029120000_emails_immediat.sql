-- L'e-mail 1 du parcours envoyé dans la minute, et la file du soir sur
-- sept jours (29 octobre 2026, Thomas, après la lecture des quotas : « Vas-y
-- et non pour brevo payant »). Conception dans docs/emailing/CONCEPTION.md.
--
-- Pourquoi : parti le lendemain soir ou plus tard, l'e1 n'était presque
-- plus ouvert (hors Apple Mail, 10 ouvertures sur 91 le premier soir, puis
-- environ 6 sur 500), et le site ramène environ 200 adresses par jour :
-- l'offre gratuite de Brevo (300 envois par jour) ne suit pas deux e-mails
-- par adresse, et le retard grossissait de soir en soir (1 146 e1 et 236 e2
-- en attente le 29 octobre au matin). Quelqu'un qui vient de laisser son
-- adresse reconnaît l'expéditeur et ouvre l'e-mail, et c'est sur les
-- ouvertures que Gmail juge un domaine d'envoi neuf.
--
-- Ce qui change :
--   1. lead-capture envoie l'e1 par l'API transactionnelle de Brevo une
--      minute après l'adresse (le temps de donner son prénom), ou tout de
--      suite quand le prénom arrive, dans les langues des réglages, et au
--      plus `parJour` e-mails immédiats par jour (heure de Paris), pour
--      laisser au soir la place des e2. emails_immediat_prendre fait tous
--      les contrôles du soir et réserve la ligne d'envoi (une seule par
--      adresse et par e-mail, la même contrainte que le soir) ;
--      emails_immediat_resultat note l'identifiant du message, ou rend la
--      place à la file du soir quand Brevo a refusé.
--   2. Le HTML de l'e1 (par langue et par version du test A/B), les phrases
--      d'accroche par famille de test et la salutation sont écrits à chaque
--      passage du soir par emails/parcours.mjs dans emails_modeles, et les
--      réglages de emails/reglages.mjs dans emails_reglages : la fonction ne
--      fait que remplir trois marqueurs. Un modèle a une date de fin
--      (30 heures) : sans passage pour le refaire, plus rien ne part tout de
--      suite, et la file du soir reprend la main.
--   3. Le webhook transactionnel de Brevo porte l'identifiant du message, pas
--      de campagne : emails_evenement retrouve l'envoi par lui, pour que la
--      remise de l'e1 ouvre l'e2 comme le soir.
--   4. La file du soir ne garde un e1 que sept jours (60 avant) : une adresse
--      laissée il y a plus d'une semaine n'ouvre presque jamais l'e-mail d'un
--      site qu'elle a oublié, et c'est ce genre d'envoi qui fait marquer en
--      spam. Les adresses restent dans abonnes. Un e1 dans une langue sans
--      envoi immédiat (l'espagnol : l'e-mail ne peut pas dire le prix de
--      l'Amérique latine, décision du 27 octobre) passe après les e2.
--
-- Tables et fonctions fermées à la clé publique. Idempotente ; appliquée par
-- emails-base.yml après les quatre migrations du parcours, qu'elle complète
-- (elle réécrit emails_du_jour, emails_file et emails_evenement).

ALTER TABLE public.emails_envois ADD COLUMN IF NOT EXISTS immediat boolean NOT NULL DEFAULT false;
ALTER TABLE public.emails_envois ADD COLUMN IF NOT EXISTS message_id text;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'emails_envois_message_taille') THEN
    ALTER TABLE public.emails_envois
      ADD CONSTRAINT emails_envois_message_taille CHECK (message_id IS NULL OR char_length(message_id) <= 300);
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS emails_envois_message_idx ON public.emails_envois (message_id) WHERE message_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS emails_envois_immediat_idx ON public.emails_envois (jour) WHERE immediat;

-- Un modèle par e-mail, langue et version : le HTML de la campagne avec ses
-- trois marqueurs ({{ contact.SALUTATION }}, {{ contact.INTRO }},
-- {{ unsubscribe }}), la phrase d'accroche de chaque famille de test
-- (`intros`) et la salutation avec et sans prénom (`salutations`, le prénom
-- à la place de [[prenom]]), déjà passées par la typographie de la langue.
CREATE TABLE IF NOT EXISTS public.emails_modeles (
  type text NOT NULL,
  lang text NOT NULL,
  version text NOT NULL,
  sujet text NOT NULL,
  html text NOT NULL,
  expediteur text,                               -- le nom propre à la version ; null : celui des réglages
  promo boolean NOT NULL DEFAULT false,
  intros jsonb NOT NULL DEFAULT '{}'::jsonb,
  salutations jsonb NOT NULL DEFAULT '{}'::jsonb,
  valide_jusqu_a timestamptz NOT NULL,
  maj_le timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (type, lang, version),
  CONSTRAINT emails_modeles_bornes CHECK (
    type IN ('e1', 'e2')
    AND lang IN ('fr', 'en', 'es', 'de', 'it', 'nl')
    AND version IN ('a', 'b')
    AND char_length(sujet) <= 300
    AND char_length(html) <= 300000
    AND (expediteur IS NULL OR char_length(expediteur) <= 100)
  )
);
REVOKE ALL ON TABLE public.emails_modeles FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.emails_modeles TO service_role;
ALTER TABLE public.emails_modeles ENABLE ROW LEVEL SECURITY;

-- Les réglages que lisent la base et les fonctions, recopiés de
-- emails/reglages.mjs : sous la clé « immediat », { actif, parJour, langues,
-- ab, version, expediteur: { name, email }, repondreA, angles: { source:
-- famille } }.
CREATE TABLE IF NOT EXISTS public.emails_reglages (
  cle text PRIMARY KEY,
  valeur jsonb NOT NULL,
  maj_le timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT emails_reglages_cle CHECK (cle ~ '^[a-z0-9_]{1,40}$')
);
REVOKE ALL ON TABLE public.emails_reglages FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.emails_reglages TO service_role;
ALTER TABLE public.emails_reglages ENABLE ROW LEVEL SECURITY;

-- La file du soir (20261028120000_emails_recents.sql), avec deux
-- changements : un e1 n'y reste que sept jours après l'adresse (60 avant),
-- et un e1 dans une langue sans envoi immédiat (réglages « immediat » actifs,
-- `langues`) passe en priorité 4, après les e2 et les e1 plus anciens. Sans
-- réglages, ou envoi immédiat arrêté, toutes les langues gardent leur place.
--   1 : e1 de moins de 48 heures ; 2 : e2 ; 3 : e1 plus ancien ;
--   4 : e1 d'une langue sans envoi immédiat.
CREATE OR REPLACE FUNCTION public.emails_du_jour(p_limite integer DEFAULT 300, p_maintenant timestamptz DEFAULT now())
RETURNS TABLE (abonne_id uuid, email text, lang text, source text, prenom text, type text, priorite integer, depuis timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH reglage AS (
    SELECT COALESCE(
      (SELECT CASE WHEN COALESCE(r.valeur->>'actif', 'false') = 'true' AND jsonb_typeof(r.valeur->'langues') = 'array'
                   THEN r.valeur->'langues' END
         FROM public.emails_reglages r WHERE r.cle = 'immediat'),
      '["fr", "en", "es", "de", "it", "nl"]'::jsonb) AS langues
  ),
  evaluations AS (
    SELECT lower(x.e) AS email FROM (
      SELECT a_email AS e FROM public.bilans WHERE a_email IS NOT NULL
      UNION SELECT b_email FROM public.bilans WHERE b_email IS NOT NULL
      UNION SELECT paiement_email FROM public.bilans WHERE paiement_email IS NOT NULL
    ) x
  ),
  candidats AS (
    SELECT ab.id, ab.email, ab.lang, COALESCE(ab.derniere_source, ab.source) AS source, ab.prenom,
           'e1'::text AS type,
           CASE WHEN NOT ((SELECT langues FROM reglage) ? ab.lang) THEN 4
                WHEN ab.consent_at >= p_maintenant - interval '48 hours' THEN 1
                ELSE 3 END AS priorite,
           ab.consent_at AS depuis
      FROM public.abonnes ab
     WHERE ab.statut = 'actif'
       AND COALESCE(ab.derniere_source, ab.source) <> 'ebook'
       AND ab.consent_at <= p_maintenant - interval '18 hours'
       AND ab.consent_at >= p_maintenant - interval '7 days'
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
   ORDER BY c.priorite,
            -- le néerlandais (31 octobre 2026) avant l'espagnol, qui reste le dernier
            CASE c.lang WHEN 'en' THEN 1 WHEN 'fr' THEN 2 WHEN 'it' THEN 3 WHEN 'de' THEN 4 WHEN 'nl' THEN 5 ELSE 6 END,
            c.depuis DESC, c.id
   LIMIT GREATEST(0, LEAST(COALESCE(p_limite, 0), 5000));
$$;
REVOKE EXECUTE ON FUNCTION public.emails_du_jour(integer, timestamptz) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.emails_du_jour(integer, timestamptz) TO service_role;

-- La file que l'admin et verif affichent : les e1 de moins de 48 heures se
-- comptent sur la date de l'adresse, quelle que soit leur priorité.
CREATE OR REPLACE FUNCTION public.emails_file(p_maintenant timestamptz DEFAULT now())
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'e1', count(*) FILTER (WHERE type = 'e1'),
    'e1_recents', count(*) FILTER (WHERE type = 'e1' AND depuis >= p_maintenant - interval '48 hours'),
    'e2', count(*) FILTER (WHERE type = 'e2'))
  FROM public.emails_du_jour(5000, p_maintenant);
$$;
REVOKE EXECUTE ON FUNCTION public.emails_file(timestamptz) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.emails_file(timestamptz) TO service_role;

-- L'e1 tout de suite pour une adresse qu'on vient de laisser : rend ce qu'il
-- faut pour l'envoyer (et la ligne d'envoi est déjà écrite, réservée), ou
-- { raison } quand rien ne part :
--   arret        : envoi immédiat arrêté, ou réglages absents ;
--   inconnu      : l'adresse n'est pas dans abonnes ;
--   hors_parcours: désinscrite, invalide, ou venue de l'e-book ;
--   ancienne     : l'adresse n'a pas été laissée (ni le prénom donné) depuis
--                  deux heures ;
--   langue       : une langue sans envoi immédiat ;
--   deja         : un e1 est déjà parti (ou part en ce moment) ;
--   evaluation   : l'adresse est dans une évaluation ;
--   plafond      : `parJour` e-mails immédiats déjà partis aujourd'hui ;
--   modele       : pas de modèle valide pour la langue et la version.
-- La ligne est écrite « envoye » d'emblée : si la fonction s'arrête entre
-- l'envoi et la réponse, la personne ne recevra jamais l'e1 une seconde fois
-- le soir. Elle n'est rendue (supprimée) que sur un refus certain de Brevo.
CREATE OR REPLACE FUNCTION public.emails_immediat_prendre(p_email text, p_maintenant timestamptz DEFAULT now())
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  adr text := lower(btrim(COALESCE(p_email, '')));
  r jsonb;
  ab public.abonnes%ROWTYPE;
  src text;
  jour_paris date := (p_maintenant AT TIME ZONE 'Europe/Paris')::date;
  partis integer;
  plafond integer;
  v text;
  m public.emails_modeles%ROWTYPE;
  famille text;
  ev_id uuid;
BEGIN
  SELECT valeur INTO r FROM public.emails_reglages WHERE cle = 'immediat';
  IF r IS NULL OR COALESCE(r->>'actif', 'false') <> 'true' THEN
    RETURN jsonb_build_object('raison', 'arret');
  END IF;
  IF adr = '' OR char_length(adr) > 254 THEN
    RETURN jsonb_build_object('raison', 'inconnu');
  END IF;
  SELECT * INTO ab FROM public.abonnes WHERE email = adr;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('raison', 'inconnu');
  END IF;
  src := COALESCE(ab.derniere_source, ab.source);
  IF ab.statut <> 'actif' OR src = 'ebook' THEN
    RETURN jsonb_build_object('raison', 'hors_parcours');
  END IF;
  IF ab.maj_le < p_maintenant - interval '2 hours' THEN
    RETURN jsonb_build_object('raison', 'ancienne');
  END IF;
  IF jsonb_typeof(r->'langues') IS DISTINCT FROM 'array' OR NOT ((r->'langues') ? ab.lang) THEN
    RETURN jsonb_build_object('raison', 'langue');
  END IF;
  IF EXISTS (SELECT 1 FROM public.emails_envois ev WHERE ev.abonne_id = ab.id AND ev.type = 'e1') THEN
    RETURN jsonb_build_object('raison', 'deja');
  END IF;
  IF EXISTS (SELECT 1 FROM public.bilans b
              WHERE lower(b.a_email) = adr OR lower(b.b_email) = adr OR lower(b.paiement_email) = adr) THEN
    RETURN jsonb_build_object('raison', 'evaluation');
  END IF;
  plafond := CASE WHEN (r->>'parJour') ~ '^[0-9]{1,5}$' THEN (r->>'parJour')::integer ELSE 0 END;
  SELECT count(*) INTO partis FROM public.emails_envois ev WHERE ev.immediat AND ev.jour = jour_paris;
  IF partis >= plafond THEN
    RETURN jsonb_build_object('raison', 'plafond');
  END IF;
  -- La version du test A/B, comme versionDe (emails/contenu.mjs) : la parité
  -- du premier octet de l'empreinte SHA-256 de l'adresse.
  v := CASE WHEN COALESCE(r->>'ab', 'false') = 'true'
            THEN CASE WHEN get_byte(sha256(convert_to(adr, 'UTF8')), 0) % 2 = 0 THEN 'a' ELSE 'b' END
            WHEN r->>'version' = 'b' THEN 'b'
            ELSE 'a' END;
  SELECT * INTO m FROM public.emails_modeles
   WHERE type = 'e1' AND lang = ab.lang AND version = v AND valide_jusqu_a > p_maintenant;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('raison', 'modele');
  END IF;
  famille := COALESCE(r->'angles'->>src, 'general');
  IF famille NOT IN ('score', 'projet', 'doute', 'general') THEN
    famille := 'general';
  END IF;
  INSERT INTO public.emails_envois (abonne_id, type, angle, lang, jour, statut, envoye_le, immediat)
  VALUES (ab.id, 'e1', famille, ab.lang, jour_paris, 'envoye', p_maintenant, true)
  ON CONFLICT ON CONSTRAINT emails_envois_unique DO NOTHING
  RETURNING id INTO ev_id;
  IF ev_id IS NULL THEN
    RETURN jsonb_build_object('raison', 'deja');
  END IF;
  RETURN jsonb_build_object(
    'envoi', ev_id,
    'email', adr,
    'lang', ab.lang,
    'version', v,
    'angle', famille,
    'jeton', ab.jeton,
    'sujet', m.sujet,
    'html', m.html,
    'expediteur', COALESCE(m.expediteur, r->'expediteur'->>'name'),
    'adresse', r->'expediteur'->>'email',
    'repondre_a', r->>'repondreA',
    'intro', COALESCE(m.intros->>famille, m.intros->>'general', ''),
    'salutation', CASE WHEN COALESCE(btrim(ab.prenom), '') <> '' AND m.salutations ? 'prenom'
                       THEN replace(m.salutations->>'prenom', '[[prenom]]', left(btrim(ab.prenom), 40))
                       ELSE COALESCE(m.salutations->>'sans', '') END);
END
$$;
REVOKE EXECUTE ON FUNCTION public.emails_immediat_prendre(text, timestamptz) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.emails_immediat_prendre(text, timestamptz) TO service_role;

-- La réponse de Brevo pour une ligne réservée par emails_immediat_prendre :
-- partie (avec l'identifiant du message quand Brevo l'a rendu), ou refusée,
-- et alors la ligne s'efface et l'adresse revient dans la file du soir.
-- Rend envoye, rendu ou inconnu.
CREATE OR REPLACE FUNCTION public.emails_immediat_resultat(p_envoi uuid, p_ok boolean, p_message text DEFAULT NULL)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  n integer;
BEGIN
  IF COALESCE(p_ok, false) THEN
    UPDATE public.emails_envois
       SET message_id = NULLIF(left(btrim(COALESCE(p_message, '')), 300), '')
     WHERE id = p_envoi AND immediat AND type = 'e1' AND message_id IS NULL;
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n > 0 THEN
      PERFORM public.emails_compter('e1', 'envoye');
      PERFORM public.emails_compter('e1', 'immediat');
      RETURN 'envoye';
    END IF;
    RETURN 'inconnu';
  END IF;
  DELETE FROM public.emails_envois
   WHERE id = p_envoi AND immediat AND remis_le IS NULL AND message_id IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN CASE WHEN n > 0 THEN 'rendu' ELSE 'inconnu' END;
END
$$;
REVOKE EXECUTE ON FUNCTION public.emails_immediat_resultat(uuid, boolean, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.emails_immediat_resultat(uuid, boolean, text) TO service_role;

-- Les événements de Brevo (20261024120000_emails_parcours.sql), avec
-- l'identifiant du message pour ceux du webhook transactionnel : l'envoi se
-- retrouve par lui, et à défaut par l'e1 immédiat de l'adresse (le seul
-- e-mail que le parcours envoie hors campagne). L'ancienne signature à trois
-- arguments disparaît : un appel sans p_message prend la nouvelle.
DROP FUNCTION IF EXISTS public.emails_evenement(text, bigint, text);
CREATE OR REPLACE FUNCTION public.emails_evenement(p_email text, p_campagne bigint, p_evenement text, p_message text DEFAULT NULL)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  adr text := lower(btrim(COALESCE(p_email, '')));
  msg text := NULLIF(left(btrim(COALESCE(p_message, '')), 300), '');
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
  ELSIF msg IS NOT NULL THEN
    SELECT ev.id, ev.type INTO ev_id, t FROM public.emails_envois ev
     WHERE ev.abonne_id = ab_id AND ev.message_id = msg;
    IF ev_id IS NULL THEN
      SELECT ev.id, ev.type INTO ev_id, t FROM public.emails_envois ev
       WHERE ev.abonne_id = ab_id AND ev.immediat
       ORDER BY ev.envoye_le DESC NULLS LAST LIMIT 1;
    END IF;
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
REVOKE EXECUTE ON FUNCTION public.emails_evenement(text, bigint, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.emails_evenement(text, bigint, text, text) TO service_role;
