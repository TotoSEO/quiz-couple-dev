-- Le rapport prêt et le rappel (21 octobre 2026). Thomas devant l'entonnoir
-- de l'évaluation : 24 personnes au bout des cent questions, une seule a
-- ouvert la page de paiement, et personne n'était prévenu quand le partenaire
-- avait fini. La fonction bilan envoie désormais « votre rapport est prêt » au
-- premier qui a fini quand le second finit, et un seul rappel, 24 heures après
-- que le rapport est prêt, s'il n'est toujours pas débloqué (serveur.mjs,
-- RELANCE_APRES_H). Idempotente ; appliquée par bilan-base.yml après
-- 20261020120000_bilan_retrouver.sql.

-- a_rappel, b_rappel : l'adresse a été donnée sous la phrase qui annonce ces
-- deux e-mails (la page l'envoie avec la création et l'acceptation de
-- l'invitation) ; les évaluations d'avant n'en reçoivent aucun.
-- rappels_off : « ne plus recevoir de message sur cette évaluation ».
-- jetons_mail : les liens personnels écrits dans ces e-mails ont leur propre
-- jeton ([{ r: 'a'|'b', h: empreinte }], quatre au plus), pour ne pas toucher
-- au lien gardé sur le téléphone.
ALTER TABLE public.bilans ADD COLUMN IF NOT EXISTS a_rappel boolean NOT NULL DEFAULT false;
ALTER TABLE public.bilans ADD COLUMN IF NOT EXISTS b_rappel boolean NOT NULL DEFAULT false;
ALTER TABLE public.bilans ADD COLUMN IF NOT EXISTS rappels_off boolean NOT NULL DEFAULT false;
ALTER TABLE public.bilans ADD COLUMN IF NOT EXISTS jetons_mail jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.bilans ADD COLUMN IF NOT EXISTS pret_mail_le timestamptz;
ALTER TABLE public.bilans ADD COLUMN IF NOT EXISTS relance_le timestamptz;

-- Les rappels à envoyer : prêts depuis 24 heures (les deux ont fini en duo,
-- la personne seule en solo), pas payés, jamais relancés, une adresse donnée
-- sous l'annonce, et pas d'arrêt demandé. La même règle que
-- stockage.aRelancer, revérifiée ligne par ligne par le serveur.
CREATE OR REPLACE FUNCTION public.bilan_relances_dues()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*)::integer FROM public.bilans
   WHERE paye_le IS NULL AND relance_le IS NULL AND NOT rappels_off
     AND (a_rappel OR b_rappel)
     AND a_fini IS NOT NULL AND a_fini < now() - interval '24 hours'
     AND (mode = 'solo' OR (b_fini IS NOT NULL AND b_fini < now() - interval '24 hours'));
$$;
REVOKE EXECUTE ON FUNCTION public.bilan_relances_dues() FROM PUBLIC, anon, authenticated;

-- Le passage de pg_cron : lance le workflow bilan-relance.yml par l'horloge
-- des réseaux (social_declencher_workflow, jeton github_workflows du Vault),
-- seulement quand un rappel est dû. Sans elle ou sans jeton, rien ne part ;
-- le « schedule » du workflow sert de secours.
CREATE OR REPLACE FUNCTION public.bilan_lancer_relance()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.bilan_relances_dues() = 0 THEN
    RETURN false;
  END IF;
  IF to_regprocedure('public.social_declencher_workflow(text)') IS NULL THEN
    RETURN false;
  END IF;
  EXECUTE 'SELECT public.social_declencher_workflow($1)' USING 'bilan-relance.yml';
  RETURN true;
EXCEPTION WHEN OTHERS THEN
  RETURN false;
END
$$;
REVOKE EXECUTE ON FUNCTION public.bilan_lancer_relance() FROM PUBLIC, anon, authenticated;

DO $do$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule(jobid) FROM cron.job WHERE jobname = 'bilan-relance';
    -- Deux fois par heure : un rappel part au plus une demi-heure après ses
    -- 24 heures, et rien ne se lance quand rien n'est dû.
    PERFORM cron.schedule('bilan-relance', '17,47 * * * *', $q$ SELECT public.bilan_lancer_relance() $q$);
  END IF;
END
$do$;

SELECT 'bilan_rappels' AS migration, count(*) AS bilans, public.bilan_relances_dues() AS relances_dues
FROM public.bilans;
