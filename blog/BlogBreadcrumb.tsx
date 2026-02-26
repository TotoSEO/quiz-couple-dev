import { useLanguage } from '@/hooks/useLanguage';
import { getLocalizedUrl } from '@/i18n/routes';

interface BlogBreadcrumbProps {
  articleTitle: string;
  articleUrl: string;
}

export function BlogBreadcrumb({ articleTitle, articleUrl }: BlogBreadcrumbProps) {
  const { lang, t } = useLanguage();
  const homeUrl = getLocalizedUrl('home', lang);
  const blogUrl = `https://quiz-couple.com${lang === 'fr' ? '' : `/${lang}`}/blog`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Quiz Couple', item: homeUrl },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: blogUrl },
      { '@type': 'ListItem', position: 3, name: articleTitle },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Fil d'ariane" className="blog-breadcrumb">
        <ol>
          <li>
            <a href={homeUrl}>Quiz Couple</a>
            <span aria-hidden="true">›</span>
          </li>
          <li>
            <a href={blogUrl}>Blog</a>
            <span aria-hidden="true">›</span>
          </li>
          <li aria-current="page">{articleTitle}</li>
        </ol>
      </nav>
    </>
  );
}
