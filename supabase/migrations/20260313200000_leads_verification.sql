-- ============================================================
-- LEADS: Add email verification + auto ebook delivery
-- ============================================================

-- New columns for double opt-in verification
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS verification_token UUID DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_leads_verification_token ON public.leads(verification_token);
