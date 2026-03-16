-- Professional reviews for the annuaire
-- Professionals leave reviews about the annuaire service itself (not about each other)

CREATE TABLE IF NOT EXISTS annuaire_pro_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL REFERENCES annuaire_professionals(id) ON DELETE CASCADE,
  rating smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text DEFAULT '',
  author_name text NOT NULL,
  is_approved boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(professional_id)  -- one review per professional
);

-- Enable RLS
ALTER TABLE annuaire_pro_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read approved reviews
CREATE POLICY "Anyone can read approved reviews"
  ON annuaire_pro_reviews FOR SELECT
  USING (is_approved = true);

-- Authenticated users can insert their own review (via edge function or direct)
CREATE POLICY "Authenticated users can insert reviews"
  ON annuaire_pro_reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    professional_id IN (
      SELECT id FROM annuaire_professionals WHERE user_id = auth.uid()
    )
  );

-- Authenticated users can update their own review
CREATE POLICY "Authenticated users can update own review"
  ON annuaire_pro_reviews FOR UPDATE
  TO authenticated
  USING (
    professional_id IN (
      SELECT id FROM annuaire_professionals WHERE user_id = auth.uid()
    )
  );

-- Index for fast lookups
CREATE INDEX idx_annuaire_pro_reviews_approved ON annuaire_pro_reviews (is_approved, created_at DESC);
