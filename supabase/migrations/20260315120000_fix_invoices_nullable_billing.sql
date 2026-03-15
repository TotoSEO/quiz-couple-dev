-- Fix: billing fields should be nullable since professionals may not have
-- filled in all billing details at the time of their first invoice.
-- The webhook code now defaults to empty strings, but the DB should also
-- tolerate NULLs to avoid silent insert failures.

ALTER TABLE public.annuaire_invoices
  ALTER COLUMN client_company_name SET DEFAULT '',
  ALTER COLUMN client_company_name DROP NOT NULL;

ALTER TABLE public.annuaire_invoices
  ALTER COLUMN client_siret SET DEFAULT '',
  ALTER COLUMN client_siret DROP NOT NULL;

ALTER TABLE public.annuaire_invoices
  ALTER COLUMN client_tva_number SET DEFAULT '',
  ALTER COLUMN client_tva_number DROP NOT NULL;

ALTER TABLE public.annuaire_invoices
  ALTER COLUMN client_address SET DEFAULT '',
  ALTER COLUMN client_address DROP NOT NULL;

ALTER TABLE public.annuaire_invoices
  ALTER COLUMN client_email SET DEFAULT '',
  ALTER COLUMN client_email DROP NOT NULL;
