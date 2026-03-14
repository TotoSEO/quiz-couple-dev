-- Add display_city and postal_code fields
-- display_city = actual city from geocoding (e.g. "Saverne")
-- postal_code = postal code from geocoding (e.g. "67700")
-- city remains the zone/category for SEO & URLs (e.g. "strasbourg")

ALTER TABLE public.annuaire_professionals
  ADD COLUMN IF NOT EXISTS display_city TEXT,
  ADD COLUMN IF NOT EXISTS postal_code TEXT;

-- Validate postal code format (5 digits for France)
ALTER TABLE public.annuaire_professionals
  ADD CONSTRAINT chk_postal_code
  CHECK (postal_code IS NULL OR postal_code ~ '^\d{5}$');

COMMENT ON COLUMN public.annuaire_professionals.display_city IS 'Vraie ville du professionnel (ex: Saverne), extraite de l''adresse';
COMMENT ON COLUMN public.annuaire_professionals.postal_code IS 'Code postal (ex: 67700), extrait de l''adresse';
