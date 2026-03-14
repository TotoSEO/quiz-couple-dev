-- Add Stripe-related fields to annuaire_professionals
ALTER TABLE public.annuaire_professionals
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT UNIQUE;

COMMENT ON COLUMN public.annuaire_professionals.stripe_customer_id IS 'Stripe Customer ID (cus_xxx)';
COMMENT ON COLUMN public.annuaire_professionals.stripe_subscription_id IS 'Stripe Subscription ID (sub_xxx)';

-- Index for fast webhook lookups
CREATE INDEX IF NOT EXISTS idx_annuaire_stripe_customer
  ON public.annuaire_professionals (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_annuaire_stripe_subscription
  ON public.annuaire_professionals (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;
