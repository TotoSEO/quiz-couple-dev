-- ============================================================================
-- QUIZ COUPLE — SCRIPT DE RESTAURATION DE LA BASE (nouveau projet Supabase)
-- ============================================================================
-- À exécuter UNE FOIS sur un NOUVEAU projet Supabase vierge :
--   Dashboard > SQL Editor > New Query > coller CE fichier en entier > Run
--
-- Périmètre : toutes les fonctionnalités CONSERVÉES du site :
--   • leads                 → capture e-mail e-book (double opt-in)
--   • messages              → formulaire de contact
--   • reviews               → avis clients (+ note agrégée / étoiles Google)
--   • quiz_ado_sessions     → quiz ado multijoueur (temps réel)
--   • activity_validations  → recherche d'activités
--
-- NE fait PLUS partie de la base (désormais servi depuis le repo) :
--   • articles de blog (blog_articles, blog_article_translations)
--   • images de blog (bucket storage blog-images)
--   → le blog et ses images vivent maintenant dans data/blog/ et public/blog/
--
-- Retiré définitivement (fonctionnalités supprimées) :
--   • problem_resolver_usage (page « résoudre un problème de couple » IA)
--   • tables annuaire (annuaire.quiz-couple.com)
-- ============================================================================


-- ####################  1. AVIS CLIENTS (reviews)  ##########################
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

-- Pas de policy SELECT globale : l'admin lit tous les avis (IP incluses)
-- via la fonction edge admin-reviews (service_role).

CREATE INDEX idx_reviews_ip_address ON public.reviews(ip_address);
CREATE INDEX idx_reviews_approved ON public.reviews(is_approved) WHERE is_approved = true;


-- ####################  2. QUIZ ADO MULTIJOUEUR (temps réel)  ################
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

-- Auto-update de updated_at
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

-- Realtime pour le multijoueur
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_ado_sessions;


-- ####################  3. RECHERCHE D'ACTIVITÉS  ###########################
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


-- ####################  4. LEADS (e-book, double opt-in)  ###################
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT 'Ebook Astro',
  is_closed BOOLEAN DEFAULT false,
  verification_token UUID DEFAULT gen_random_uuid(),
  email_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a lead"
ON public.leads FOR INSERT
WITH CHECK (true);

-- Pas de policy SELECT/UPDATE publique : les leads sont accédés via les
-- fonctions edge admin-leads / ebook-verify (service_role).

CREATE INDEX idx_leads_email ON public.leads(email);
CREATE INDEX idx_leads_subject ON public.leads(subject);
CREATE INDEX idx_leads_verification_token ON public.leads(verification_token);


-- ####################  5. MESSAGES (formulaire de contact)  ################
CREATE TABLE public.messages (
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

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Seul le service_role accède aux messages (via les fonctions edge)
CREATE POLICY "Service role full access" ON public.messages
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE INDEX idx_messages_status ON public.messages (status);
CREATE INDEX idx_messages_created_at ON public.messages (created_at DESC);


-- ####################  6. CRON : nettoyage automatique  ####################
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Sessions ado expirées, toutes les 15 min
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

-- Avis non approuvés de plus de 30 jours, tous les jours à 3h
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


-- ####################  7. RÉINJECTION DES 11 VRAIS AVIS  ###################
-- (les seuls avis récupérables ; ceux postés après le 28/02/2026 sont perdus)
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


-- ####################  VÉRIFICATION  ######################################
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' ORDER BY table_name;
-- attendu : activity_validations, leads, messages, quiz_ado_sessions, reviews

SELECT COUNT(*) AS avis, ROUND(AVG(rating), 1) AS note_moyenne
FROM reviews WHERE is_approved = true;   -- attendu : 11 avis, ~4.9
