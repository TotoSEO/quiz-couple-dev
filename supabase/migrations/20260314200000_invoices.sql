-- Invoice tracking table with sequential numbering
CREATE TABLE IF NOT EXISTS public.annuaire_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.annuaire_professionals(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL UNIQUE,
  stripe_invoice_id TEXT UNIQUE,

  -- Amounts in cents
  amount_ht INTEGER NOT NULL,          -- Prix HT en centimes
  amount_tva INTEGER NOT NULL,         -- Montant TVA en centimes
  amount_ttc INTEGER NOT NULL,         -- Prix TTC en centimes
  discount_amount INTEGER DEFAULT 0,   -- Réduction en centimes (HT)
  discount_label TEXT,                 -- Ex: "Réduction de -30%"

  -- Plan info
  plan TEXT NOT NULL,                  -- 'pro' or 'boost'
  period TEXT NOT NULL,                -- 'monthly' or 'annual'
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,

  -- Client billing snapshot (frozen at invoice time)
  client_company_name TEXT NOT NULL,
  client_siret TEXT NOT NULL,
  client_tva_number TEXT NOT NULL,
  client_address TEXT NOT NULL,
  client_email TEXT NOT NULL,          -- billing email or account email

  -- PDF storage
  pdf_storage_path TEXT,              -- Path in Supabase Storage

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  paid_at TIMESTAMPTZ DEFAULT now()
);

-- Sequential invoice number generator
CREATE SEQUENCE IF NOT EXISTS annuaire_invoice_seq START 1;

CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'ANNQUCO-' || nextval('annuaire_invoice_seq');
END;
$$ LANGUAGE plpgsql;

-- Index for fast lookup by professional
CREATE INDEX IF NOT EXISTS idx_annuaire_invoices_professional
  ON public.annuaire_invoices (professional_id);

-- Index for Stripe invoice deduplication
CREATE INDEX IF NOT EXISTS idx_annuaire_invoices_stripe
  ON public.annuaire_invoices (stripe_invoice_id)
  WHERE stripe_invoice_id IS NOT NULL;

-- RLS
ALTER TABLE public.annuaire_invoices ENABLE ROW LEVEL SECURITY;

-- Professionals can read their own invoices
CREATE POLICY "Professionals can view own invoices"
  ON public.annuaire_invoices FOR SELECT
  USING (
    professional_id IN (
      SELECT id FROM public.annuaire_professionals
      WHERE user_id = auth.uid()
    )
  );

-- Only service role can insert/update (from edge functions)
-- No INSERT/UPDATE/DELETE policies for authenticated users

-- Storage bucket for invoices (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('annuaire-invoices', 'annuaire-invoices', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: owner can read their own invoices
CREATE POLICY "Professionals can read own invoices"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'annuaire-invoices'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.annuaire_professionals
      WHERE user_id = auth.uid()
    )
  );
