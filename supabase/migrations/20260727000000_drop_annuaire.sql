-- Remove the annuaire (professional directory) feature entirely.
--
-- The annuaire (annuaire.quiz-couple.com) has been retired. This migration drops
-- every database object it created: tables, the invoice sequence, helper/trigger
-- functions and the scheduled cron jobs. Everything uses IF EXISTS so the migration
-- is a no-op on a database where the objects were never created (fresh reset), and
-- fully removes them on the production database where they already exist.
--
-- Shared objects are intentionally left untouched:
--   - the pg_cron / pg_net extensions (used by non-annuaire features),
--   - the trigger-deploy edge function (also used by the main site admin),
--   - the leads / messages tables (main site).

-- 1. Unschedule annuaire cron jobs (guarded: pg_cron may not exist on a fresh DB).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule(jobid)
    FROM cron.job
    WHERE jobname IN (
      'cleanup-annuaire-views',
      'cleanup-unvalidated-annuaire-profiles',
      'process-annuaire-deploy-queue',
      'annuaire-followup-emails',
      'sync-google-reviews-monthly'
    );
  END IF;
END $$;

-- 2. Drop tables (CASCADE removes their policies, triggers, indexes and FKs).
DROP TABLE IF EXISTS public.annuaire_invoices CASCADE;
DROP TABLE IF EXISTS public.annuaire_pro_reviews CASCADE;
DROP TABLE IF EXISTS public.annuaire_google_reviews CASCADE;
DROP TABLE IF EXISTS public.annuaire_contact_clicks CASCADE;
DROP TABLE IF EXISTS public.annuaire_profile_views CASCADE;
DROP TABLE IF EXISTS public.annuaire_deploy_queue CASCADE;
DROP TABLE IF EXISTS public.annuaire_redirects CASCADE;
DROP TABLE IF EXISTS public.annuaire_professionals CASCADE;

-- 3. Drop the invoice number sequence (if not already dropped with its owner table).
DROP SEQUENCE IF EXISTS public.annuaire_invoice_seq CASCADE;

-- 4. Drop annuaire helper / trigger functions (all overloads, by name).
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT 'DROP FUNCTION IF EXISTS ' || quote_ident(n.nspname) || '.' || quote_ident(p.proname)
           || '(' || pg_get_function_identity_arguments(p.oid) || ') CASCADE' AS stmt
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN (
        'generate_invoice_number',
        'cleanup_old_annuaire_views',
        'cleanup_unvalidated_annuaire_profiles',
        'generate_annuaire_slug',
        'process_annuaire_deploy_queue',
        'process_annuaire_followup_emails',
        'protect_annuaire_plan',
        'queue_annuaire_deploy',
        'save_annuaire_redirect',
        'trigger_deploy_on_delete',
        'trigger_google_reviews_sync',
        'update_annuaire_updated_at'
      )
  LOOP
    EXECUTE r.stmt;
  END LOOP;
END $$;
