-- L'e2 du soir par l'API transactionnelle de Brevo (3 novembre 2026, Thomas :
-- « Ok pour les mails »). Conception dans docs/emailing/CONCEPTION.md,
-- section « 3 novembre 2026 ».
--
-- Pourquoi : le même e1 était ouvert par 44 % des gens quand il partait dans
-- la minute par l'API transactionnelle, et par 2 à 5 % quand il partait le
-- soir en campagne (2 % chez Gmail) ; l'e2 ne partait qu'en campagne
-- (1,4 % d'ouvertures). Depuis ce jour, emails/parcours.mjs envoie l'e2 du
-- soir une requête par personne (REGLAGES.transactionnel), sans liste ni
-- campagne : la ligne d'envoi est écrite « envoye » avant la requête, puis
-- reçoit l'identifiant du message.
--
-- Ce qui change ici : emails_evenement (20261029120000_emails_immediat.sql)
-- retrouvait un événement du webhook transactionnel par l'identifiant du
-- message, et à défaut par l'e1 immédiat de l'adresse. Un e-mail peut être
-- remis avant que l'identifiant de son message soit écrit : le défaut est
-- désormais le dernier envoi hors campagne de l'adresse (l'e1 immédiat ou
-- l'e2 du soir), le plus récent d'abord ; sinon la remise d'un e2 rapide se
-- serait posée sur l'e1.
--
-- Fermée à la clé publique. Idempotente ; appliquée par emails-base.yml
-- après 20261029120000_emails_immediat.sql, qu'elle complète.

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
      -- L'identifiant n'est pas encore écrit (ou Brevo ne l'a pas rendu) :
      -- le dernier e-mail parti hors campagne vers cette adresse.
      SELECT ev.id, ev.type INTO ev_id, t FROM public.emails_envois ev
       WHERE ev.abonne_id = ab_id AND ev.campagne_id IS NULL AND ev.statut = 'envoye'
       ORDER BY ev.envoye_le DESC NULLS LAST, ev.cree_le DESC LIMIT 1;
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
