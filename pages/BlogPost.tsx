import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BlogArticleTemplate } from '@/components/blog/BlogArticle';
import { loadArticleByLocalizedSlug, findArticleBySlug } from '@/data/blog/articles';
import { useLanguage } from '@/hooks/useLanguage';
import type { BlogArticleData } from '@/types/blog';
import NotFound from './NotFound';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { lang } = useLanguage();
  const [article, setArticle] = useState<BlogArticleData | null | undefined>(undefined);
  const [localizedSlugs, setLocalizedSlugs] = useState<Record<string, string> | undefined>();

  useEffect(() => {
    if (slug) {
      loadArticleByLocalizedSlug(slug, lang).then((data) => {
        if (data) {
          // Extract localizedSlugs if from DB
          const { localizedSlugs: dbSlugs, ...articleData } = data as any;
          if (dbSlugs) {
            setLocalizedSlugs(dbSlugs);
          } else {
            // Static fallback: use registry slugs
            const meta = findArticleBySlug(slug);
            if (meta) {
              articleData.slug = meta.slugs[lang] || meta.slug;
              setLocalizedSlugs(meta.slugs);
            }
          }
          setArticle(articleData);
        } else {
          setArticle(null);
        }
      });
    }
  }, [slug, lang]);

  if (article === undefined) {
    return null;
  }

  if (article === null) {
    return <NotFound />;
  }

  return <BlogArticleTemplate article={article} localizedSlugs={localizedSlugs} />;
}
