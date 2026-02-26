
-- Create blog_articles table
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

-- Create blog_article_translations table
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

-- Enable RLS
ALTER TABLE public.blog_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_article_translations ENABLE ROW LEVEL SECURITY;

-- Public read for published articles
CREATE POLICY "Anyone can read published articles"
ON public.blog_articles FOR SELECT
USING (status = 'published');

-- Public read for translations of published articles
CREATE POLICY "Anyone can read translations of published articles"
ON public.blog_article_translations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.blog_articles
    WHERE id = article_id AND status = 'published'
  )
);

-- Create storage bucket for blog images
INSERT INTO storage.buckets (id, name, public) VALUES ('blog-images', 'blog-images', true);

-- Public read for blog images
CREATE POLICY "Blog images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-images');

-- Update trigger for blog_articles
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
