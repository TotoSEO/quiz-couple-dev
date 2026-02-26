import { useEffect, useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { loadAllArticles } from '@/data/blog/articles';
import type { BlogArticleData } from '@/types/blog';
import { BookOpen } from 'lucide-react';

export function LatestArticles() {
  const { lang, t } = useLanguage();
  const [articles, setArticles] = useState<BlogArticleData[]>([]);

  useEffect(() => {
    loadAllArticles(lang).then((all) => setArticles(all.slice(0, 3)));
  }, [lang]);

  if (articles.length === 0) return null;

  const blogBase = lang === 'fr' ? '/blog' : `/${lang}/blog`;

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString(
      lang === 'fr' ? 'fr-FR' : lang === 'en' ? 'en-US' : lang === 'es' ? 'es-ES' : lang === 'de' ? 'de-DE' : 'it-IT',
      { year: 'numeric', month: 'long', day: 'numeric' }
    );

  return (
    <section className="py-16 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Intro paragraph */}
        <p className="text-center text-muted-foreground max-w-3xl mx-auto mb-6 text-base md:text-lg leading-relaxed">
          {t('home:latestArticles.intro')}
        </p>

        {/* Title */}
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-12">
          {t('home:latestArticles.title')}{' '}
          <span className="text-primary">{t('home:latestArticles.titleHighlight')}</span>
        </h2>

        {/* Articles grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map((article) => (
            <article key={article.slug} className="group rounded-2xl overflow-hidden border border-border bg-card shadow-sm hover:shadow-lg transition-shadow duration-300">
              <a href={`${blogBase}/${article.slug}`} className="block" tabIndex={-1} aria-hidden="true">
                <div className="aspect-video overflow-hidden">
                  <img
                    src={article.featuredImage}
                    alt={article.featuredImageAlt}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </a>
              <div className="p-5 space-y-3">
                <time dateTime={article.publishedAt} className="text-xs text-muted-foreground">
                  {formatDate(article.publishedAt)}
                </time>
                <h3 className="font-semibold text-lg leading-snug line-clamp-2">
                  <a href={`${blogBase}/${article.slug}`} className="hover:text-primary transition-colors">
                    {article.title}
                  </a>
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>
                <a
                  href={`${blogBase}/${article.slug}`}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline mt-2"
                >
                  <BookOpen className="h-4 w-4" />
                  {t('common:blog.readArticle')}
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
