import type { BlogArticleMeta } from '@/types/blog';
import { supabase } from '@/integrations/supabase/client';
import type { BlogArticleData } from '@/types/blog';
import { AUTHORS, getAuthor } from './authors';

/**
 * Central registry of all blog articles (static fallback).
 */
export const blogArticles: BlogArticleMeta[] = [
  {
    slug: 'les-phases-de-la-rupture-chez-l-homme',
    slugs: {
      fr: 'les-phases-de-la-rupture-chez-l-homme',
      en: 'breakup-stages-for-men',
      es: 'fases-de-la-ruptura-en-el-hombre',
      de: 'trennungsphasen-beim-mann',
      it: 'fasi-della-rottura-nell-uomo',
    },
    publishedAt: '2026-02-21',
    locales: { fr: true, en: true, es: true, de: true, it: true },
  },
  {
    slug: 'choses-pas-accepter-couple',
    slugs: {
      fr: 'choses-pas-accepter-couple',
      en: 'things-not-accept-relationship',
      es: 'cosas-no-aceptar-pareja',
      de: 'grenzen-beziehung-nicht-akzeptieren',
      it: 'cose-non-accettare-coppia',
    },
    publishedAt: '2026-02-21',
    locales: { fr: true, en: true, es: true, de: true, it: true },
  },
];

/**
 * Find article meta by any localized slug (static registry).
 */
export function findArticleBySlug(slug: string): BlogArticleMeta | undefined {
  return blogArticles.find(
    (a) => a.slug === slug || Object.values(a.slugs).includes(slug)
  );
}

/**
 * Dynamically import article content for a given internal slug and language (static files).
 */
async function loadStaticArticle(internalSlug: string, lang: string) {
  try {
    const modules = import.meta.glob<{ default: any }>('./**/*.ts', { eager: false });
    const key = `./${lang}/${internalSlug}.ts`;
    if (modules[key]) {
      const mod = await modules[key]();
      return mod.default;
    }
    const frKey = `./fr/${internalSlug}.ts`;
    if (modules[frKey]) {
      const mod = await modules[frKey]();
      return mod.default;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Convert a database row to BlogArticleData, optionally with localized slugs.
 */
function dbToArticleData(article: any, translation: any, localizedSlugs?: Record<string, string>): BlogArticleData & { localizedSlugs?: Record<string, string> } {
  const author = getAuthor(article.author_id, translation.lang);
  return {
    slug: translation.slug,
    title: translation.title,
    metaTitle: translation.meta_title,
    metaDescription: translation.meta_description,
    featuredImage: article.featured_image_url || '',
    featuredImageAlt: translation.featured_image_alt,
    publishedAt: article.published_at || article.created_at,
    updatedAt: article.updated_at,
    author,
    excerpt: translation.excerpt,
    introduction: translation.introduction,
    quickSummary: translation.quick_summary || [],
    sections: translation.sections || [],
    localizedSlugs,
  };
}

/**
 * Fetch all localized slugs for a given article_id.
 */
async function fetchLocalizedSlugs(articleId: string): Promise<Record<string, string>> {
  try {
    const { data } = await supabase
      .from('blog_article_translations')
      .select('lang, slug')
      .eq('article_id', articleId);
    const slugs: Record<string, string> = {};
    if (data) {
      for (const row of data) {
        slugs[row.lang] = row.slug;
      }
    }
    return slugs;
  } catch {
    return {};
  }
}

/**
 * Load article by any localized slug — tries database first, then static files.
 */
export async function loadArticleByLocalizedSlug(localizedSlug: string, lang: string): Promise<(BlogArticleData & { localizedSlugs?: Record<string, string> }) | null> {
  // 1. Try database
  try {
    const { data: translation } = await supabase
      .from('blog_article_translations')
      .select('*, blog_articles:article_id(*)')
      .eq('slug', localizedSlug)
      .eq('lang', lang)
      .maybeSingle();

    if (translation && (translation as any).blog_articles) {
      const article = (translation as any).blog_articles;
      const localizedSlugs = await fetchLocalizedSlugs(translation.article_id);
      return dbToArticleData(article, translation, localizedSlugs);
    }

    // Try any lang slug match then load correct lang
    const { data: anyLangTr } = await supabase
      .from('blog_article_translations')
      .select('article_id')
      .eq('slug', localizedSlug)
      .limit(1)
      .maybeSingle();

    if (anyLangTr) {
      const { data: correctTr } = await supabase
        .from('blog_article_translations')
        .select('*, blog_articles:article_id(*)')
        .eq('article_id', anyLangTr.article_id)
        .eq('lang', lang)
        .maybeSingle();

      if (correctTr && (correctTr as any).blog_articles) {
        const localizedSlugs = await fetchLocalizedSlugs(anyLangTr.article_id);
        return dbToArticleData((correctTr as any).blog_articles, correctTr, localizedSlugs);
      }
    }
  } catch {
    // DB not available, fall through to static
  }

  // 2. Static fallback
  const meta = findArticleBySlug(localizedSlug);
  if (!meta) return null;
  return loadStaticArticle(meta.slug, lang);
}

/**
 * Load all articles for listing — combines database + static.
 */
export async function loadAllArticles(lang: string): Promise<BlogArticleData[]> {
  const articles: BlogArticleData[] = [];
  const seenSlugs = new Set<string>();

  // 1. Database articles
  try {
    const { data: translations } = await supabase
      .from('blog_article_translations')
      .select('*, blog_articles:article_id(*)')
      .eq('lang', lang);

    if (translations) {
      for (const tr of translations) {
        const article = (tr as any).blog_articles;
        if (article) {
          const data = dbToArticleData(article, tr);
          articles.push(data);
          // Track by internal slug to avoid duplicates with static
          seenSlugs.add(article.internal_slug);
        }
      }
    }
  } catch {
    // DB not available
  }

  // 2. Static fallback for articles not in DB
  for (const meta of blogArticles) {
    if (seenSlugs.has(meta.slug)) continue;
    if (meta.locales[lang] !== false) {
      const data = await loadStaticArticle(meta.slug, lang);
      if (data) {
        data.slug = meta.slugs[lang] || meta.slug;
        articles.push(data);
      }
    }
  }

  // Sort by date descending
  return articles.sort((a, b) =>
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

/**
 * @deprecated Use loadArticleByLocalizedSlug instead
 */
export async function loadArticle(internalSlug: string, lang: string) {
  return loadStaticArticle(internalSlug, lang);
}
