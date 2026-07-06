-- ============================================================
-- ANNUAIRE REDIRECTS, 301 redirects for deleted professionals
-- When a professional is deleted (account deletion or admin),
-- store their old URL path so the build can generate _redirects.
-- ============================================================

-- 1. Table to store redirect mappings
CREATE TABLE public.annuaire_redirects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_path TEXT NOT NULL,
  to_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_annuaire_redirects_from ON public.annuaire_redirects(from_path);

ALTER TABLE public.annuaire_redirects ENABLE ROW LEVEL SECURITY;

-- Only service_role can read/write (used by build + trigger)
CREATE POLICY "annuaire_redirects_service_only"
ON public.annuaire_redirects FOR ALL
USING (current_setting('role', true) = 'service_role');


-- 2. Trigger: auto-save redirect before a professional row is deleted
CREATE OR REPLACE FUNCTION public.save_annuaire_redirect()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create redirect if the professional was published (had a live page)
  IF OLD.is_published = true THEN
    INSERT INTO public.annuaire_redirects (from_path, to_path)
    VALUES (
      '/' || OLD.specialty || '/' || OLD.city || '/' || OLD.slug || '/',
      '/' || OLD.specialty || '/'
    )
    ON CONFLICT (from_path) DO UPDATE SET to_path = EXCLUDED.to_path;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER save_redirect_before_delete
  BEFORE DELETE ON public.annuaire_professionals
  FOR EACH ROW
  EXECUTE FUNCTION public.save_annuaire_redirect();


-- 3. Trigger: auto-trigger Cloudflare deploy after professional deletion
--    Uses pg_net to call the trigger-deploy edge function
CREATE OR REPLACE FUNCTION public.trigger_deploy_on_delete()
RETURNS TRIGGER AS $$
DECLARE
  supabase_url TEXT;
  service_key TEXT;
BEGIN
  -- Only trigger if the deleted professional was published
  IF OLD.is_published = true THEN
    supabase_url := current_setting('app.settings.supabase_url', true);
    service_key := current_setting('app.settings.service_role_key', true);

    -- If pg_net is available, call the trigger-deploy edge function
    IF supabase_url IS NOT NULL AND service_key IS NOT NULL THEN
      PERFORM net.http_post(
        url := supabase_url || '/functions/v1/trigger-deploy',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || service_key
        ),
        body := '{}'::jsonb
      );
    END IF;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trigger_deploy_after_delete
  AFTER DELETE ON public.annuaire_professionals
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_deploy_on_delete();
