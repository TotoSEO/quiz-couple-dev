-- ============================================================================
-- QUIZ COUPLE — SCRIPT DE RESTAURATION COMPLÈTE DE LA BASE SUPABASE
-- ============================================================================
-- À exécuter UNE SEULE FOIS sur un NOUVEAU projet Supabase vierge :
--   Dashboard > SQL Editor > New Query > coller CE fichier en entier > Run
--
-- Ce fichier reconstruit TOUT le schéma (tables, RLS, storage, triggers, cron)
-- à jour, puis réinjecte les vrais avis clients.
--
-- ORDRE D'EXÉCUTION GLOBAL DE LA RESTAURATION (voir RECOVERY.md) :
--   1. Ce fichier (RESTORE.sql)        → schéma complet + avis
--   2. seed-blog-data.sql (à la racine) → contenu complet des articles de blog
--      (gardé à part car volumineux : ~2,7 Mo)
--
-- Ce script assemble, dans l'ordre correct :
--   • supabase/setup-new-project.sql                         (schéma de base + storage + cron)
--   • supabase/migrations/…_create_messages_table.sql        (formulaire de contact)
--   • supabase/migrations/…_leads_verification.sql           (double opt-in e-book)
--   • seed-reviews-real.sql                                  (11 vrais avis)
-- ============================================================================


-- ####################  PARTIE 1/4 : SCHÉMA DE BASE  #########################
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


-- ####################  PARTIE 2/4 : TABLE MESSAGES (contact)  ###############
-- Create messages table for contact form submissions
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  last_name text NOT NULL,
  first_name text NOT NULL,
  email text NOT NULL,
  phone text,
  company text,
  message text NOT NULL,
  lang text DEFAULT 'fr',
  ip text,
  status text DEFAULT 'new' CHECK (status IN ('new', 'read', 'archived')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Only service role can insert/read/update/delete (edge functions use service role key)
CREATE POLICY "Service role full access" ON public.messages
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Index for admin queries
CREATE INDEX idx_messages_status ON public.messages (status);
CREATE INDEX idx_messages_created_at ON public.messages (created_at DESC);


-- ####################  PARTIE 3/4 : VÉRIFICATION E-MAIL LEADS  ##############
-- ============================================================
-- LEADS: Add email verification + auto ebook delivery
-- ============================================================

-- New columns for double opt-in verification
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS verification_token UUID DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_leads_verification_token ON public.leads(verification_token);


-- ####################  PARTIE 4/4 : RÉINJECTION DES VRAIS AVIS  #############
-- ============================================================
-- RESTORE REAL REVIEWS
-- Paste this in Supabase Dashboard > SQL Editor > New Query
-- ============================================================

BEGIN;

INSERT INTO public.reviews (id, author_name, rating, comment, ip_address, is_approved, created_at) VALUES
('27277bdb-2824-46e8-a31c-a74338574810', 'Louloudu77', 5, 'Trop génial on s''est bien amusé ! Merci <33', '92.184.140.122', true, '2026-01-24 14:16:52.374362+00'),
('2b0f951d-3234-4bfd-9625-07d2237bbfa7', 'Kim _Gabi', 4, 'J''ai beaucoup aimée', '102.244.154.111', true, '2026-01-26 02:39:02.390511+00'),
('8de286f4-c913-4564-b35e-b9c59cae0780', 'Samy.P', 5, 'Trop trop cool comme site, bien joué, ça change des autres ou faut donner son mail haha, force pour la suite !', '217.181.229.169', true, '2026-01-27 13:57:15.953685+00'),
('c211fbe9-7435-49f7-ab1b-a011753d01fb', 'Tom et Léa', 5, 'INCROYABLE, meilleur site pour les couples, on a adoré, et c''est gratuit en plus ! Merci merci merci de faire ça gratos et sans mail ou quoi c''est top, continue !', '92.184.140.221', true, '2026-01-28 12:38:04.681512+00'),
('eeed48de-23a1-4276-8635-0a1ee3a29189', 'Sasha-Ludo', 5, 'Trop chouette comme site :) !', '92.184.136.245', true, '2026-01-31 10:37:49.055559+00'),
('0c89cca6-299f-49f9-9bb6-ba73a8ff5273', 'Marco67', 5, 'Super site', '163.5.3.74', true, '2026-02-03 14:48:57.288957+00'),
('ece01b36-7db7-471d-a5ca-29259f1bbb41', 'Bravo', 5, 'Bravo pour le site c''est cool :)', '92.184.141.104', true, '2026-02-11 08:45:40.505267+00'),
('535c37cb-4a23-4544-8916-815afc9a1a50', 'Lola77', 5, 'Les quiz pour couples sont trop cool on a passé une bonne saint-valentin !', '92.184.141.9', true, '2026-02-16 18:00:17.104895+00'),
('6dddb0a4-a421-4e2b-85df-828b0e83e21c', 'Jonas', 5, 'Ptit avis pour la force on s''est bien amusé', '92.184.136.41', true, '2026-02-17 22:14:14.851549+00'),
('fdbf2e2a-f133-4c50-90db-b581e135e08d', 'Philipg', 5, 'Cool website', '92.184.146.226', true, '2026-02-25 11:03:10.104848+00'),
('6987f0d1-e707-46c9-9cb1-1504672f2373', 'Pierre', 5, 'Trop cool', '90.3.148.120', true, '2026-02-28 17:26:45.109329+00')
ON CONFLICT (id) DO NOTHING;

COMMIT;

-- Vérification :
SELECT COUNT(*) AS total, ROUND(AVG(rating), 1) AS avg_rating FROM reviews WHERE is_approved = true;
