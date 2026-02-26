import { useLanguage } from '@/hooks/useLanguage';

interface BlogTipBoxProps {
  content: string;
}

export function BlogTipBox({ content }: BlogTipBoxProps) {
  const { t } = useLanguage();

  return (
    <aside className="blog-tip-box" aria-label={t('blog.tip')}>
      <p className="blog-tip-box-title">{t('blog.tip')}</p>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </aside>
  );
}
