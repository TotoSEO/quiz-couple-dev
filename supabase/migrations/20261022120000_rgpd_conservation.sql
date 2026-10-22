-- Les durées de conservation promises par la politique de confidentialité,
-- appliquées (22 octobre 2026). Thomas, en formation, demandait si tout était
-- bon côté RGPD ; l'inventaire des données personnelles (étape « Les données
-- personnelles et leur âge » de supabase-inventaire.yml) a montré que la
-- politique promettait des effacements que rien ne faisait : les abonnés
-- n'avaient aucune purge, les leads de l'e-book et les messages de contact
-- aucune durée, et l'adresse IP d'un avis approuvé restait pour toujours.
--
-- rgpd_menage(), chaque nuit à 2 h 35 UTC par pg_cron (`rgpd-menage`) :
--   - abonnés désinscrits ou invalides : supprimés trois mois après la
--     désinscription (ou la dernière mise à jour) ;
--   - abonnés actifs : supprimés trois ans après le dernier contact,
--     `maj_le` (la dernière fois que l'adresse a été laissée ; quand les
--     envois commenceront, l'outil d'envoi devra remonter les ouvertures
--     dans cette colonne) ;
--   - leads de l'e-book : jamais confirmés, supprimés au bout de 30 jours ;
--     les autres, trois ans après la demande ;
--   - messages du formulaire de contact : supprimés un an après l'envoi ;
--   - adresse IP d'un avis : effacée au bout de six mois (l'avis reste).
-- Les évaluations de couple ont déjà leur ménage (bilan_menage), les quiz
-- personnalisés le leur (une semaine), le frein des écritures publiques
-- efface ses compteurs d'une minute sur l'autre, et verify-admin les essais
-- de connexion ratés de la veille.
--
-- Chaque table et chaque colonne est vérifiée avant d'être touchée :
-- `leads` et `messages` n'existent qu'en production, créées à la main.
-- Idempotente ; appliquée par rgpd-base.yml.

CREATE OR REPLACE FUNCTION public.rgpd_menage()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  bilan jsonb := '{}'::jsonb;
  n integer;
  a_colonne boolean;
BEGIN
  IF to_regclass('public.abonnes') IS NOT NULL THEN
    DELETE FROM public.abonnes
    WHERE statut IN ('desinscrit', 'invalide')
      AND COALESCE(desinscrit_le, maj_le) < now() - interval '3 months';
    GET DIAGNOSTICS n = ROW_COUNT;
    bilan := bilan || jsonb_build_object('abonnes_desinscrits', n);

    DELETE FROM public.abonnes
    WHERE statut = 'actif'
      AND GREATEST(maj_le, created_at) < now() - interval '3 years';
    GET DIAGNOSTICS n = ROW_COUNT;
    bilan := bilan || jsonb_build_object('abonnes_sans_contact', n);
  END IF;

  IF to_regclass('public.leads') IS NOT NULL THEN
    SELECT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public' AND table_name = 'leads' AND column_name = 'email_verified')
      INTO a_colonne;
    IF a_colonne THEN
      EXECUTE 'DELETE FROM public.leads WHERE email_verified IS NOT TRUE AND created_at < now() - interval ''30 days''';
      GET DIAGNOSTICS n = ROW_COUNT;
      bilan := bilan || jsonb_build_object('leads_non_confirmes', n);
    END IF;
    EXECUTE 'DELETE FROM public.leads WHERE created_at < now() - interval ''3 years''';
    GET DIAGNOSTICS n = ROW_COUNT;
    bilan := bilan || jsonb_build_object('leads_anciens', n);
  END IF;

  IF to_regclass('public.messages') IS NOT NULL THEN
    EXECUTE 'DELETE FROM public.messages WHERE created_at < now() - interval ''1 year''';
    GET DIAGNOSTICS n = ROW_COUNT;
    bilan := bilan || jsonb_build_object('messages', n);
  END IF;

  IF to_regclass('public.reviews') IS NOT NULL THEN
    SELECT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public' AND table_name = 'reviews' AND column_name = 'ip_address')
      INTO a_colonne;
    IF a_colonne THEN
      EXECUTE 'UPDATE public.reviews SET ip_address = NULL WHERE ip_address IS NOT NULL AND created_at < now() - interval ''6 months''';
      GET DIAGNOSTICS n = ROW_COUNT;
      bilan := bilan || jsonb_build_object('ip_des_avis', n);
    END IF;
  END IF;

  RETURN bilan;
END
$$;
REVOKE EXECUTE ON FUNCTION public.rgpd_menage() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rgpd_menage() TO service_role;

DO $do$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule(jobid) FROM cron.job WHERE jobname = 'rgpd-menage';
    PERFORM cron.schedule('rgpd-menage', '35 2 * * *', $q$ SELECT public.rgpd_menage() $q$);
  END IF;
END
$do$;

-- Un premier passage tout de suite : ce qu'il a effacé s'affiche dans le
-- journal du workflow.
SELECT 'rgpd_conservation' AS migration, public.rgpd_menage() AS efface,
       (SELECT count(*) FROM pg_extension WHERE extname = 'pg_cron') AS pg_cron;
