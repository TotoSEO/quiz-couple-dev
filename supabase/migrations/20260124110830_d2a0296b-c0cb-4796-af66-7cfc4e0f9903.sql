-- Table pour le rate limiting (1 utilisation par jour par IP)
CREATE TABLE public.problem_resolver_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour optimiser les recherches par IP et date
CREATE INDEX idx_problem_resolver_usage_ip_date 
ON public.problem_resolver_usage(ip_address, used_at);

-- Pas de RLS car cette table est gérée uniquement par l'edge function
-- et ne contient pas de données sensibles (juste IP + timestamp)