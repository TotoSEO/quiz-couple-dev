import type { BlogAuthor } from '@/types/blog';
import { useLanguage } from '@/hooks/useLanguage';
import { getAuthorBio } from '@/data/blog/authors';

interface BlogAuthorBoxProps {
  author: BlogAuthor;
}

export function BlogAuthorBox({ author }: BlogAuthorBoxProps) {
  const { lang } = useLanguage();
  const bio = getAuthorBio(author, lang);

  return (
    <aside className="blog-author-box" itemScope itemType="https://schema.org/Person">
      {author.avatar && (
        <img
          src={author.avatar}
          alt={author.name}
          className="blog-author-avatar"
          loading="lazy"
          width={64}
          height={64}
          itemProp="image"
        />
      )}
      <div>
        <p className="blog-author-name" itemProp="name">{author.name}</p>
        {bio && <p className="blog-author-bio" itemProp="description">{bio}</p>}
      </div>
    </aside>
  );
}
