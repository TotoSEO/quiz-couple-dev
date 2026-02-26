import { useState } from 'react';
import { ChevronDown, List } from 'lucide-react';
import type { BlogSection } from '@/types/blog';
import { useLanguage } from '@/hooks/useLanguage';

interface BlogTableOfContentsProps {
  sections: BlogSection[];
}

export function BlogTableOfContents({ sections }: BlogTableOfContentsProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav aria-label="Sommaire" className="blog-toc">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="blog-toc-toggle"
        aria-expanded={isOpen}
      >
        <List className="h-5 w-5" />
        <span className="blog-toc-title">{t('blog.tableOfContents')}</span>
        <ChevronDown
          className={`h-4 w-4 ml-auto transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`blog-toc-content ${isOpen ? 'blog-toc-content--open' : ''}`}
        aria-hidden={!isOpen}
      >
        <ol>
          {sections.map((section) => (
            <li key={section.id}>
              <a href={`#${section.id}`} onClick={() => setIsOpen(false)}>
                {section.title}
              </a>
              {section.subsections && section.subsections.length > 0 && (
                <ol>
                  {section.subsections.map((sub) => (
                    <li key={sub.id}>
                      <a href={`#${sub.id}`} onClick={() => setIsOpen(false)}>
                        {sub.title}
                      </a>
                    </li>
                  ))}
                </ol>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
