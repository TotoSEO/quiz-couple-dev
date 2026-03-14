-- Migration: Add followup email tracking + cron job
-- Sends a promotional email 21 days after profile validation if user hasn't subscribed

-- Track when the 21-day followup email was sent
ALTER TABLE public.annuaire_professionals
  ADD COLUMN IF NOT EXISTS followup_email_sent_at TIMESTAMPTZ;

-- Function: trigger followup email processing via edge function
CREATE OR REPLACE FUNCTION public.process_annuaire_followup_emails()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  supabase_url TEXT;
  service_key TEXT;
  pending_count INTEGER;
BEGIN
  -- Check if there are profiles to process
  SELECT COUNT(*) INTO pending_count
  FROM annuaire_professionals
  WHERE is_published = true
    AND (plan IS NULL OR plan = 'gratuit')
    AND followup_email_sent_at IS NULL
    AND created_at <= NOW() - INTERVAL '21 days';

  IF pending_count = 0 THEN
    RETURN;
  END IF;

  supabase_url := current_setting('app.settings.supabase_url', true);
  service_key := current_setting('app.settings.service_role_key', true);

  IF supabase_url IS NOT NULL AND service_key IS NOT NULL THEN
    PERFORM net.http_post(
      url := supabase_url || '/functions/v1/annuaire-followup-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_key
      ),
      body := '{}'::jsonb
    );
    RAISE LOG '[annuaire-followup] Triggered for % pending profiles', pending_count;
  ELSE
    RAISE WARNING '[annuaire-followup] Cannot trigger: missing app.settings';
  END IF;
END;
$$;

-- Schedule: run once daily at 10:00 AM Paris time (08:00 UTC)
SELECT cron.schedule(
  'annuaire-followup-emails',
  '0 8 * * *',
  $$SELECT public.process_annuaire_followup_emails()$$
);
