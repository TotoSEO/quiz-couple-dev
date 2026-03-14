-- Add photos (cabinet) and video_url columns to annuaire_professionals
ALTER TABLE public.annuaire_professionals
  ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS video_url TEXT;
