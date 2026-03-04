-- ============================================================
-- TABLE: activity_validations (tracking recherches activités)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.activity_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_validations ENABLE ROW LEVEL SECURITY;

-- Allow counting rows (admin dashboard uses HEAD with Prefer: count=exact)
CREATE POLICY "Allow read activity_validations"
ON public.activity_validations FOR SELECT
USING (true);

CREATE INDEX idx_activity_validations_created_at
ON public.activity_validations(created_at DESC);
