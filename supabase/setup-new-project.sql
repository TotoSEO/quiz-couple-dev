-- ============================================================
-- SETUP COMPLET SUPABASE - Quiz Couple
-- Exécuter ce script dans : Dashboard > SQL Editor > New Query
-- ============================================================

-- ============================================================
-- 1. TABLE: problem_resolver_usage (rate limiting IA)
-- ============================================================
CREATE TABLE public.problem_resolver_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_problem_resolver_usage_ip_date
ON public.problem_resolver_usage(ip_address, used_at);

ALTER TABLE public.problem_resolver_usage ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 1b. TABLE: activity_validations (tracking recherches activités)
-- ============================================================
CREATE TABLE public.activity_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_validations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read activity_validations"
ON public.activity_validations FOR SELECT
USING (true);

CREATE INDEX idx_activity_validations_created_at
ON public.activity_validations(created_at DESC);

-- ============================================================
-- 2. TABLE: reviews (avis utilisateurs avec modération)
-- ============================================================
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  ip_address TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read approved reviews"
ON public.reviews FOR SELECT
USING (is_approved = true);

CREATE POLICY "Anyone can insert reviews"
ON public.reviews FOR INSERT
WITH CHECK (true);

-- NOTE: No blanket SELECT policy, admin reads all reviews (including IPs)
-- via the admin-reviews edge function using service_role key.

CREATE INDEX idx_reviews_ip_address ON public.reviews(ip_address);
CREATE INDEX idx_reviews_approved ON public.reviews(is_approved) WHERE is_approved = true;

-- ============================================================
-- 3. TABLE: quiz_ado_sessions (quiz ado multijoueur)
-- ============================================================
CREATE TABLE public.quiz_ado_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'completed')),
  question_indices INTEGER[] NOT NULL,
  player1_name TEXT NOT NULL,
  player1_answers JSONB DEFAULT '[]'::jsonb,
  player2_name TEXT,
  player2_answers JSONB DEFAULT '[]'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 minutes')
);

ALTER TABLE public.quiz_ado_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read sessions by code"
  ON public.quiz_ado_sessions FOR SELECT USING (true);

CREATE POLICY "Anyone can create sessions"
  ON public.quiz_ado_sessions FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update sessions"
  ON public.quiz_ado_sessions FOR UPDATE USING (true);

CREATE INDEX idx_quiz_ado_sessions_code ON public.quiz_ado_sessions (code);
CREATE INDEX idx_quiz_ado_sessions_expires ON public.quiz_ado_sessions (expires_at);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_quiz_ado_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_quiz_ado_sessions_updated_at
  BEFORE UPDATE ON public.quiz_ado_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_quiz_ado_updated_at();

-- Enable realtime pour le multijoueur
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_ado_sessions;

-- ============================================================
-- 4. TABLE: blog_articles (articles de blog)
-- ============================================================
CREATE TABLE public.blog_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  internal_slug TEXT NOT NULL UNIQUE,
  featured_image_url TEXT,
  author_id TEXT NOT NULL DEFAULT 'mathieu-courtin',
  published_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'draft'
);

ALTER TABLE public.blog_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published articles"
ON public.blog_articles FOR SELECT
USING (status = 'published');

-- ============================================================
-- 5. TABLE: blog_article_translations (traductions)
-- ============================================================
CREATE TABLE public.blog_article_translations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.blog_articles(id) ON DELETE CASCADE,
  lang TEXT NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  meta_title TEXT NOT NULL DEFAULT '',
  meta_description TEXT NOT NULL DEFAULT '',
  featured_image_alt TEXT NOT NULL DEFAULT '',
  excerpt TEXT NOT NULL DEFAULT '',
  introduction TEXT NOT NULL DEFAULT '',
  quick_summary JSONB NOT NULL DEFAULT '[]'::jsonb,
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_complete BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(article_id, lang),
  UNIQUE(lang, slug)
);

ALTER TABLE public.blog_article_translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read translations of published articles"
ON public.blog_article_translations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.blog_articles
    WHERE id = article_id AND status = 'published'
  )
);

-- ============================================================
-- 6. STORAGE: bucket blog-images
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('blog-images', 'blog-images', true);

CREATE POLICY "Blog images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-images');

-- Policy pour permettre l'upload via service role (edge functions)
CREATE POLICY "Service role can upload blog images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'blog-images');

CREATE POLICY "Service role can update blog images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'blog-images');

CREATE POLICY "Service role can delete blog images"
ON storage.objects FOR DELETE
USING (bucket_id = 'blog-images');

-- ============================================================
-- 7. TRIGGERS: auto-update updated_at pour blog
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_blog_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_blog_articles_updated_at
BEFORE UPDATE ON public.blog_articles
FOR EACH ROW
EXECUTE FUNCTION public.update_blog_updated_at();

CREATE TRIGGER update_blog_translations_updated_at
BEFORE UPDATE ON public.blog_article_translations
FOR EACH ROW
EXECUTE FUNCTION public.update_blog_updated_at();

-- ============================================================
-- 8. CRON JOBS: nettoyage automatique
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Nettoyage des sessions expirées toutes les 15 min
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM quiz_ado_sessions WHERE expires_at < now();
END;
$$;

SELECT cron.schedule(
  'cleanup-expired-sessions',
  '*/15 * * * *',
  'SELECT cleanup_expired_sessions()'
);

-- Nettoyage des avis non approuvés > 30 jours (tous les jours à 3h)
CREATE OR REPLACE FUNCTION cleanup_old_unapproved_reviews()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM reviews
  WHERE is_approved = false
  AND created_at < now() - interval '30 days';
END;
$$;

SELECT cron.schedule(
  'cleanup-old-reviews',
  '0 3 * * *',
  'SELECT cleanup_old_unapproved_reviews()'
);

-- ============================================================
-- 9. TABLE: leads (capture e-mail lead magnets)
-- ============================================================
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT 'Ebook Astro',
  is_closed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a lead"
ON public.leads FOR INSERT
WITH CHECK (true);

-- NOTE: No public SELECT/UPDATE policies, leads are accessed via
-- the admin-leads edge function using service_role key.

CREATE INDEX idx_leads_email ON public.leads(email);
CREATE INDEX idx_leads_subject ON public.leads(subject);

-- ============================================================
-- DONE! Toutes les tables, policies, triggers et cron jobs créés.
-- ============================================================
