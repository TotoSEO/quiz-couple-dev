import type { BlogArticleData } from '@/types/blog';
import { useLanguage } from '@/hooks/useLanguage';

interface BlogCardProps {
  article: BlogArticleData;
}

export function BlogCard({ article }: BlogCardProps) {
  const { lang, t } = useLanguage();
  const blogBase = lang === 'fr' ? '/blog' : `/${lang}/blog`;
  const articleUrl = `${blogBase}/${article.slug}`;

  const formattedDate = new Date(article.publishedAt).toLocaleDateString(
    lang === 'fr' ? 'fr-FR' : lang === 'en' ? 'en-US' : lang === 'es' ? 'es-ES' : lang === 'de' ? 'de-DE' : 'it-IT',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  return (
    <article className="blog-card">
      <h2 className="blog-card-title">
        <a href={articleUrl}>{article.title}</a>
      </h2>
      <a href={articleUrl} className="blog-card-image-link" tabIndex={-1} aria-hidden="true">
        <div className="blog-card-image-wrapper">
          <img
            src={article.featuredImage}
            alt={article.featuredImageAlt}
            loading="lazy"
            className="blog-card-image"
          />
        </div>
      </a>
      <div className="blog-card-meta">
        <time dateTime={article.publishedAt}>{formattedDate}</time>
        <span>·</span>
        <span>{article.author.name}</span>
      </div>
      <p className="blog-card-excerpt">{article.excerpt}</p>
      <a href={articleUrl} className="blog-card-cta">
        {t('blog.readArticle')}
      </a>
    </article>
  );
}
