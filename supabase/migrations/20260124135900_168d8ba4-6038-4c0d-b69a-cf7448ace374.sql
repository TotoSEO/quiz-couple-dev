-- Create reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  ip_address TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read approved reviews
CREATE POLICY "Anyone can read approved reviews"
ON public.reviews
FOR SELECT
USING (is_approved = true);

-- Policy: Anyone can insert reviews (they'll be unapproved by default)
CREATE POLICY "Anyone can insert reviews"
ON public.reviews
FOR INSERT
WITH CHECK (true);

-- Policy: Check if IP already submitted (for the hook to verify)
CREATE POLICY "Anyone can check their own IP"
ON public.reviews
FOR SELECT
USING (true);

-- Create index for faster IP lookups
CREATE INDEX idx_reviews_ip_address ON public.reviews(ip_address);

-- Create index for approved reviews
CREATE INDEX idx_reviews_approved ON public.reviews(is_approved) WHERE is_approved = true;