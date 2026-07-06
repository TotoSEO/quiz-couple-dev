-- ============================================================
-- ANNUAIRE QUIZ COUPLE, Schéma complet
-- Tables, RLS, Storage, Triggers, Index
-- ============================================================

-- ============================================================
-- 1. TABLE: annuaire_professionals (fiches professionnels)
--    Contrainte UNIQUE sur user_id → 1 compte = 1 fiche
-- ============================================================
CREATE TABLE public.annuaire_professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Identité
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  slug TEXT NOT NULL,
  photo_url TEXT,

  -- Infos pro
  specialty TEXT NOT NULL,
  city TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  methods TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{Français}',
  years_experience INTEGER NOT NULL DEFAULT 0 CHECK (years_experience >= 0 AND years_experience <= 60),

  -- Contact
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  website TEXT,

  -- Géolocalisation
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,

  -- Tarification
  price_range TEXT,

  -- Avis (dénormalisés pour perf)
  rating NUMERIC(2,1) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER NOT NULL DEFAULT 0 CHECK (review_count >= 0),

  -- Disponibilité
  availability TEXT DEFAULT 'Sur rendez-vous',

  -- Statut
  is_published BOOLEAN NOT NULL DEFAULT false,
  is_verified BOOLEAN NOT NULL DEFAULT false,

  -- Abonnement
  plan TEXT NOT NULL DEFAULT 'gratuit' CHECK (plan IN ('gratuit', 'pro', 'boost')),
  plan_expires_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Contraintes
  CONSTRAINT unique_user_profile UNIQUE (user_id),
  CONSTRAINT unique_slug UNIQUE (slug)
);

-- Index
CREATE INDEX idx_annuaire_pros_specialty ON public.annuaire_professionals(specialty) WHERE is_published = true;
CREATE INDEX idx_annuaire_pros_city ON public.annuaire_professionals(city) WHERE is_published = true;
CREATE INDEX idx_annuaire_pros_plan ON public.annuaire_professionals(plan);
CREATE INDEX idx_annuaire_pros_published ON public.annuaire_professionals(is_published) WHERE is_published = true;
CREATE INDEX idx_annuaire_pros_slug ON public.annuaire_professionals(slug);

-- RLS
ALTER TABLE public.annuaire_professionals ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut voir les fiches publiées
CREATE POLICY "annuaire_pros_public_read"
ON public.annuaire_professionals FOR SELECT
USING (is_published = true);

-- Le propriétaire peut lire sa propre fiche (même non publiée)
CREATE POLICY "annuaire_pros_owner_read"
ON public.annuaire_professionals FOR SELECT
USING (auth.uid() = user_id);

-- Seuls les utilisateurs authentifiés peuvent créer leur fiche (1 seule)
CREATE POLICY "annuaire_pros_insert"
ON public.annuaire_professionals FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Le propriétaire peut modifier sa fiche
CREATE POLICY "annuaire_pros_update"
ON public.annuaire_professionals FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Le propriétaire peut supprimer sa fiche
CREATE POLICY "annuaire_pros_delete"
ON public.annuaire_professionals FOR DELETE
USING (auth.uid() = user_id);


-- ============================================================
-- 2. TABLE: annuaire_profile_views (vues de fiches pour stats)
-- ============================================================
CREATE TABLE public.annuaire_profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.annuaire_professionals(id) ON DELETE CASCADE,
  viewer_ip TEXT,
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Partitionnement mensuel serait idéal en prod, mais index suffit pour l'instant
CREATE INDEX idx_annuaire_views_pro_date ON public.annuaire_profile_views(professional_id, created_at DESC);
CREATE INDEX idx_annuaire_views_created ON public.annuaire_profile_views(created_at DESC);

ALTER TABLE public.annuaire_profile_views ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut enregistrer une vue (via edge function)
CREATE POLICY "annuaire_views_insert"
ON public.annuaire_profile_views FOR INSERT
WITH CHECK (true);

-- Le propriétaire de la fiche peut lire ses propres stats
CREATE POLICY "annuaire_views_owner_read"
ON public.annuaire_profile_views FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.annuaire_professionals
    WHERE id = professional_id AND user_id = auth.uid()
  )
);


-- ============================================================
-- 3. TABLE: annuaire_contact_clicks (clics contact pour stats)
-- ============================================================
CREATE TABLE public.annuaire_contact_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.annuaire_professionals(id) ON DELETE CASCADE,
  click_type TEXT NOT NULL CHECK (click_type IN ('phone', 'email', 'website', 'appointment')),
  clicker_ip TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_annuaire_clicks_pro_date ON public.annuaire_contact_clicks(professional_id, created_at DESC);

ALTER TABLE public.annuaire_contact_clicks ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut enregistrer un clic
CREATE POLICY "annuaire_clicks_insert"
ON public.annuaire_contact_clicks FOR INSERT
WITH CHECK (true);

-- Le propriétaire peut lire ses clics
CREATE POLICY "annuaire_clicks_owner_read"
ON public.annuaire_contact_clicks FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.annuaire_professionals
    WHERE id = professional_id AND user_id = auth.uid()
  )
);


-- ============================================================
-- 4. STORAGE: bucket annuaire-photos (photos de profil)
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'annuaire-photos',
  'annuaire-photos',
  true,
  5242880, -- 5 Mo max
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Tout le monde peut voir les photos (bucket public)
CREATE POLICY "annuaire_photos_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'annuaire-photos');

-- Un utilisateur authentifié peut uploader dans SON dossier (user_id/)
CREATE POLICY "annuaire_photos_owner_upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'annuaire-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Un utilisateur peut mettre à jour ses propres photos
CREATE POLICY "annuaire_photos_owner_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'annuaire-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Un utilisateur peut supprimer ses propres photos
CREATE POLICY "annuaire_photos_owner_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'annuaire-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);


-- ============================================================
-- 5. TRIGGER: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_annuaire_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_annuaire_professionals_updated_at
  BEFORE UPDATE ON public.annuaire_professionals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_annuaire_updated_at();


-- ============================================================
-- 6. FUNCTION: generate_slug (génération de slug unique)
-- ============================================================
CREATE OR REPLACE FUNCTION public.generate_annuaire_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Générer le slug de base: prenom-nom-specialite-ville
  base_slug := regexp_replace(
    lower(unaccent(
      NEW.first_name || '-' || NEW.last_name || '-' || NEW.specialty || '-' || NEW.city
    )),
    '[^a-z0-9-]', '-', 'g'
  );
  -- Nettoyer les tirets multiples
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(both '-' from base_slug);

  final_slug := base_slug;

  -- Vérifier l'unicité
  WHILE EXISTS (
    SELECT 1 FROM public.annuaire_professionals
    WHERE slug = final_slug AND id != COALESCE(NEW.id, gen_random_uuid())
  ) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;

  NEW.slug := final_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER generate_annuaire_slug_trigger
  BEFORE INSERT OR UPDATE OF first_name, last_name, specialty, city
  ON public.annuaire_professionals
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_annuaire_slug();


-- ============================================================
-- 7. FUNCTION: empêcher la modification du plan par le user
--    (seul le service_role peut changer plan/plan_expires_at)
-- ============================================================
CREATE OR REPLACE FUNCTION public.protect_annuaire_plan()
RETURNS TRIGGER AS $$
BEGIN
  -- Si ce n'est pas le service_role, empêcher la modification du plan
  IF current_setting('role', true) != 'service_role' THEN
    NEW.plan := OLD.plan;
    NEW.plan_expires_at := OLD.plan_expires_at;
    NEW.is_verified := OLD.is_verified;
    NEW.rating := OLD.rating;
    NEW.review_count := OLD.review_count;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER protect_annuaire_plan_trigger
  BEFORE UPDATE ON public.annuaire_professionals
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_annuaire_plan();


-- ============================================================
-- 8. CRON: nettoyage des vues > 90 jours (quotidien à 4h)
-- ============================================================
CREATE OR REPLACE FUNCTION public.cleanup_old_annuaire_views()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM annuaire_profile_views WHERE created_at < now() - interval '90 days';
  DELETE FROM annuaire_contact_clicks WHERE created_at < now() - interval '90 days';
END;
$$;

SELECT cron.schedule(
  'cleanup-annuaire-views',
  '0 4 * * *',
  'SELECT cleanup_old_annuaire_views()'
);


-- ============================================================
-- DONE! Schéma annuaire complet.
-- ============================================================
