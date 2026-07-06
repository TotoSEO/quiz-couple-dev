-- ============================================================
-- DEPLOY QUEUE, Debounced deployment system
-- Instead of triggering a build on every action, we queue
-- deploy requests and process them with a cron job every 2 min.
-- This prevents 50 builds when 50 actions happen simultaneously.
-- ============================================================

-- 1. Table to track pending deploys
CREATE TABLE public.annuaire_deploy_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);

ALTER TABLE public.annuaire_deploy_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "annuaire_deploy_queue_service_only"
ON public.annuaire_deploy_queue FOR ALL
USING (current_setting('role', true) = 'service_role');


-- 2. Function: queue a deploy request (replaces direct triggerDeploy calls)
CREATE OR REPLACE FUNCTION public.queue_annuaire_deploy(deploy_reason TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO annuaire_deploy_queue (reason)
  VALUES (deploy_reason);
END;
$$;


-- 3. Function: process the queue (called by cron every 2 min)
--    If there are pending items, trigger ONE deploy and mark all as processed.
--    NOTE: Supabase managed DB does not allow ALTER DATABASE for app.settings,
--    so we read the service_role_key from Supabase vault (secrets table).
CREATE OR REPLACE FUNCTION public.process_annuaire_deploy_queue()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pending_count INTEGER;
  service_key TEXT;
BEGIN
  -- Count pending deploy requests
  SELECT COUNT(*) INTO pending_count
  FROM annuaire_deploy_queue
  WHERE processed_at IS NULL;

  -- Nothing to do
  IF pending_count = 0 THEN
    RETURN;
  END IF;

  -- Mark all pending as processed FIRST (prevent re-processing)
  UPDATE annuaire_deploy_queue
  SET processed_at = now()
  WHERE processed_at IS NULL;

  -- Read service role key from vault
  SELECT decrypted_secret INTO service_key
  FROM vault.decrypted_secrets
  WHERE name = 'service_role_key'
  LIMIT 1;

  IF service_key IS NOT NULL THEN
    PERFORM net.http_post(
      url := 'https://lojvajnnvhatfplevyvy.supabase.co/functions/v1/trigger-deploy',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_key
      ),
      body := jsonb_build_object('reason', 'batch: ' || pending_count || ' queued changes')
    );
    RAISE LOG '[annuaire-deploy] Triggered 1 deploy for % queued changes', pending_count;
  ELSE
    RAISE WARNING '[annuaire-deploy] Cannot trigger deploy: missing service_role_key in vault. Add it via Supabase Dashboard > Project Settings > Vault.';
  END IF;

  -- Cleanup old processed entries (keep last 7 days)
  DELETE FROM annuaire_deploy_queue
  WHERE processed_at IS NOT NULL
    AND processed_at < now() - interval '7 days';
END;
$$;


-- 4. Cron: process deploy queue every 2 minutes
SELECT cron.schedule(
  'process-annuaire-deploy-queue',
  '*/2 * * * *',
  'SELECT process_annuaire_deploy_queue()'
);


-- 5. Update the delete trigger to queue instead of direct deploy
CREATE OR REPLACE FUNCTION public.trigger_deploy_on_delete()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.is_published = true THEN
    PERFORM queue_annuaire_deploy('professional deleted: ' || OLD.slug);
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SET search_path = public;
