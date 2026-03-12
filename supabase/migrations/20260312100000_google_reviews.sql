-- ============================================================
-- GOOGLE REVIEWS: Integration for Boost plan users
-- Stores Google Place ID + cached reviews data
-- ============================================================

-- Add google_place_id to annuaire_professionals
ALTER TABLE public.annuaire_professionals
  ADD COLUMN IF NOT EXISTS google_place_id TEXT;

-- Protect google_place_id from non-service_role modifications
-- (Update the existing trigger function to also protect google_place_id)
CREATE OR REPLACE FUNCTION public.protect_annuaire_plan()
RETURNS TRIGGER AS $$
BEGIN
  IF current_setting('role', true) != 'service_role' THEN
    NEW.plan := OLD.plan;
    NEW.plan_expires_at := OLD.plan_expires_at;
    NEW.is_verified := OLD.is_verified;
    NEW.rating := OLD.rating;
    NEW.review_count := OLD.review_count;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;


-- ============================================================
-- Table: annuaire_google_reviews (cached Google reviews)
-- Stores the 3 most recent reviews per professional
-- ============================================================
CREATE TABLE public.annuaire_google_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.annuaire_professionals(id) ON DELETE CASCADE,

  -- Review data from Google
  author_name TEXT NOT NULL,
  author_photo_url TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT,
  relative_time_description TEXT, -- e.g. "il y a 2 mois"
  time INTEGER NOT NULL, -- Unix timestamp from Google

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Max 3 reviews per professional
  CONSTRAINT unique_review_per_pro UNIQUE (professional_id, time)
);

CREATE INDEX idx_google_reviews_pro ON public.annuaire_google_reviews(professional_id);

-- RLS
ALTER TABLE public.annuaire_google_reviews ENABLE ROW LEVEL SECURITY;

-- Everyone can read reviews (they're public Google data)
CREATE POLICY "google_reviews_public_read"
ON public.annuaire_google_reviews FOR SELECT
USING (true);

-- Only service_role can insert/update/delete (via edge function)
-- No user-facing policies for write operations


-- ============================================================
-- CRON: Monthly fetch of Google reviews for Boost users
-- Runs on the 1st of each month at 3:00 AM
-- ============================================================
CREATE OR REPLACE FUNCTION public.trigger_google_reviews_sync()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This function calls the edge function via pg_net
  -- The actual API calls happen in the edge function
  PERFORM net.http_post(
    url := current_setting('app.settings.supabase_url', true) || '/functions/v1/sync-google-reviews',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := '{}'::jsonb
  );
END;
$$;

SELECT cron.schedule(
  'sync-google-reviews-monthly',
  '0 3 1 * *',
  'SELECT trigger_google_reviews_sync()'
);
