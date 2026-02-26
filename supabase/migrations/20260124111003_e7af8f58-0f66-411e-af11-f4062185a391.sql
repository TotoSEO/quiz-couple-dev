-- Enable RLS on problem_resolver_usage table
-- This table is managed by the edge function using service role key
-- so we don't need policies, but RLS must be enabled for security
ALTER TABLE public.problem_resolver_usage ENABLE ROW LEVEL SECURITY;

-- No public policies needed - only edge function with service role can access