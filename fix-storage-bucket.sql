-- ============================================================
-- FIX: Create blog-images storage bucket (if missing)
-- Paste this in Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to blog images
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Blog images are publicly accessible' AND tablename = 'objects') THEN
    CREATE POLICY "Blog images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'blog-images');
  END IF;
END $$;

-- Allow anyone to upload blog images (needed for edge function via service role)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow blog image uploads' AND tablename = 'objects') THEN
    CREATE POLICY "Allow blog image uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'blog-images');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow blog image updates' AND tablename = 'objects') THEN
    CREATE POLICY "Allow blog image updates" ON storage.objects FOR UPDATE USING (bucket_id = 'blog-images');
  END IF;
END $$;

-- Verify:
SELECT id, name, public FROM storage.buckets WHERE id = 'blog-images';
