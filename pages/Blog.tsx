import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/layout/SEOHead';
import { BlogCard } from '@/components/blog/BlogCard';
import { useLanguage } from '@/hooks/useLanguage';
import { loadAllArticles } from '@/data/blog/articles';
import { BASE_URL } from '@/i18n/routes';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/i18n/config';
import type { BlogArticleData } from '@/types/blog';

export default function Blog() {
  const { lang, t } = useLanguage();
  const [articles, setArticles] = useState<BlogArticleData[]>([]);

  useEffect(() => {
    loadAllArticles(lang).then(setArticles);
  }, [lang]);

  const blogBase = lang === 'fr' ? '' : `/${lang}`;
  const canonical = `${BASE_URL}${blogBase}/blog`;

  const alternates = SUPPORTED_LANGUAGES.map((l) => ({
    lang: l,
    href: `${BASE_URL}${l === 'fr' ? '' : `/${l}`}/blog`,
  }));

  return (
    <Layout>
      <SEOHead
        title={t('blog.pageTitle')}
        description={t('blog.pageDescription')}
        canonical={canonical}
        lang={lang as SupportedLanguage}
        alternates={alternates}
      />

      <div className="container mx-auto px-4 section-padding">
        <header className="mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{t('blog.heading')}</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('blog.subheading')}
          </p>
        </header>

        {articles.length > 0 ? (
          <div className="blog-grid">
            {articles.map((article) => (
              <BlogCard key={article.slug} article={article} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-16">
            {t('blog.noArticles')}
          </p>
        )}
      </div>
    </Layout>
  );
}
