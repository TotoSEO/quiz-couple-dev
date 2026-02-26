import { useLanguage } from '@/hooks/useLanguage';

interface BlogQuickSummaryProps {
  items: string[];
}

export function BlogQuickSummary({ items }: BlogQuickSummaryProps) {
  const { t } = useLanguage();

  return (
    <aside className="blog-quick-summary" aria-label={t('blog.quickSummary')}>
      <p className="blog-quick-summary-title">{t('blog.quickSummary')}</p>
      <ul>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </aside>
  );
}
