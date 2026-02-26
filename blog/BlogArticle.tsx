import type { BlogArticleData } from '@/types/blog';
import { useLanguage } from '@/hooks/useLanguage';
import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/layout/SEOHead';
import { BlogBreadcrumb } from './BlogBreadcrumb';
import { BlogTableOfContents } from './BlogTableOfContents';
import { BlogQuickSummary } from './BlogQuickSummary';
import { BlogTipBox } from './BlogTipBox';
import { BlogAuthorBox } from './BlogAuthorBox';
import { ShareButtons } from '@/components/shared/ShareButtons';
import { BASE_URL } from '@/i18n/routes';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/i18n/config';
import { findArticleBySlug } from '@/data/blog/articles';
import { getAuthorBio } from '@/data/blog/authors';

interface BlogArticleProps {
  article: BlogArticleData;
  localizedSlugs?: Record<string, string>;
}

export function BlogArticleTemplate({ article, localizedSlugs }: BlogArticleProps) {
  const { lang } = useLanguage();

  // Get localized slugs: prefer DB slugs, fallback to static registry
  const meta = findArticleBySlug(article.slug);
  const slugsMap = localizedSlugs || meta?.slugs;

  const blogBase = lang === 'fr' ? '' : `/${lang}`;
  const canonical = `${BASE_URL}${blogBase}/blog/${article.slug}`;

  const alternates = SUPPORTED_LANGUAGES.map((l) => {
    const localizedSlug = slugsMap?.[l] || article.slug;
    return {
      lang: l,
      href: `${BASE_URL}${l === 'fr' ? '' : `/${l}`}/blog/${localizedSlug}`,
    };
  });

  const formattedDate = new Date(article.publishedAt).toLocaleDateString(
    lang === 'fr' ? 'fr-FR' : lang === 'en' ? 'en-US' : lang === 'es' ? 'es-ES' : lang === 'de' ? 'de-DE' : 'it-IT',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  const authorBio = getAuthorBio(article.author, lang);

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    image: article.featuredImage,
    datePublished: article.publishedAt,
    ...(article.updatedAt && { dateModified: article.updatedAt }),
    author: {
      '@type': 'Person',
      name: article.author.name,
      ...(article.author.avatar && { image: `${BASE_URL}${article.author.avatar}` }),
      ...(authorBio && { description: authorBio }),
    },
    publisher: {
      '@type': 'Organization',
      name: 'Quiz Couple',
      logo: { '@type': 'ImageObject', url: `${BASE_URL}/favicon.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    description: article.metaDescription,
  };

  return (
    <Layout>
      <SEOHead
        title={article.metaTitle}
        description={article.metaDescription}
        canonical={canonical}
        ogImage={article.featuredImage}
        lang={lang as SupportedLanguage}
        alternates={alternates}
        jsonLd={articleJsonLd}
        author={article.author.name}
      />

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <BlogBreadcrumb articleTitle={article.title} articleUrl={canonical} />

        <article className="blog-article">
          <header className="blog-article-header">
            <h1>{article.title}</h1>
            <div className="blog-article-meta">
              <time dateTime={article.publishedAt}>{formattedDate}</time>
              <span>·</span>
              <span>{article.author.name}</span>
            </div>
            <img
              src={article.featuredImage}
              alt={article.featuredImageAlt}
              className="blog-article-featured"
              loading="eager"
              fetchPriority="high"
              width={768}
              height={432}
            />
          </header>

          <div
            className="blog-article-intro"
            dangerouslySetInnerHTML={{ __html: article.introduction }}
          />

          <BlogTableOfContents sections={article.sections} />
          <BlogQuickSummary items={article.quickSummary} />

          {article.sections.map((section) => (
            <section key={section.id} id={section.id}>
              <h2>{section.title}</h2>
              <div dangerouslySetInnerHTML={{ __html: section.content }} />

              {section.subsections?.map((sub) => (
                <div key={sub.id} id={sub.id}>
                  <h3>{sub.title}</h3>
                  <div dangerouslySetInnerHTML={{ __html: sub.content }} />
                </div>
              ))}
            </section>
          ))}

          <div className="my-8 py-6 border-t border-b border-border">
            <ShareButtons
              title={article.title}
              text={article.metaDescription}
              url={`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/blog-og?lang=${lang}&slug=${article.slug}`}
            />
          </div>

          <BlogAuthorBox author={article.author} />
        </article>
      </div>
    </Layout>
  );
}
