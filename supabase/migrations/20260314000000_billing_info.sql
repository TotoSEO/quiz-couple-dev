-- Add billing information fields to annuaire_professionals
ALTER TABLE public.annuaire_professionals
  ADD COLUMN IF NOT EXISTS billing_company_name TEXT,
  ADD COLUMN IF NOT EXISTS billing_siret TEXT,
  ADD COLUMN IF NOT EXISTS billing_tva_number TEXT,
  ADD COLUMN IF NOT EXISTS billing_email TEXT,
  ADD COLUMN IF NOT EXISTS billing_address TEXT;

-- Validate SIRET format (14 digits)
ALTER TABLE public.annuaire_professionals
  ADD CONSTRAINT chk_billing_siret
  CHECK (billing_siret IS NULL OR billing_siret ~ '^\d{14}$');

-- Validate TVA intracommunautaire format (FR + 11 chars)
ALTER TABLE public.annuaire_professionals
  ADD CONSTRAINT chk_billing_tva
  CHECK (billing_tva_number IS NULL OR billing_tva_number ~ '^FR\d{11}$');

-- Validate billing email format
ALTER TABLE public.annuaire_professionals
  ADD CONSTRAINT chk_billing_email
  CHECK (billing_email IS NULL OR billing_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$');

-- Add billing_complete computed helper (all required fields filled)
-- Used by application layer to check if billing info is complete before subscription
COMMENT ON COLUMN public.annuaire_professionals.billing_company_name IS 'Nom de l''entreprise ou de la société';
COMMENT ON COLUMN public.annuaire_professionals.billing_siret IS 'Numéro SIRET (14 chiffres)';
COMMENT ON COLUMN public.annuaire_professionals.billing_tva_number IS 'Numéro de TVA intracommunautaire (FR + 11 chiffres)';
COMMENT ON COLUMN public.annuaire_professionals.billing_email IS 'Email de facturation (optionnel, sinon email du compte)';
COMMENT ON COLUMN public.annuaire_professionals.billing_address IS 'Adresse complète de facturation';
