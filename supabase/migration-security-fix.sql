-- ============================================================
-- MIGRATION: Security fixes for leads & reviews RLS policies
-- Run in: Dashboard > SQL Editor > New Query
-- ============================================================

-- 1. Remove overly permissive leads policies
DROP POLICY IF EXISTS "Anyone can read leads" ON public.leads;
DROP POLICY IF EXISTS "Anyone can update leads" ON public.leads;

-- 2. Remove overly permissive reviews IP policy
DROP POLICY IF EXISTS "Anyone can check their own IP" ON public.reviews;

-- DONE! Leads are now only accessible via the admin-leads edge function
-- (uses service_role key). Reviews IPs are only visible to admin via
-- the admin-reviews edge function.
