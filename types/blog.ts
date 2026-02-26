export interface BlogSubsection {
  id: string;
  title: string;
  content: string;
}

export interface BlogSection {
  id: string;
  title: string;
  content: string;
  subsections?: BlogSubsection[];
  tip?: string;
}

export interface BlogAuthor {
  id: string;
  name: string;
  avatar?: string;
  /** Localized bios keyed by language code */
  bios: Record<string, string>;
  /** @deprecated Use bios[lang] instead */
  bio?: string;
}

export interface BlogArticleData {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  featuredImage: string;
  featuredImageAlt: string;
  publishedAt: string;
  updatedAt?: string;
  author: BlogAuthor;
  excerpt: string;
  introduction: string;
  quickSummary: string[];
  sections: BlogSection[];
  /** Localized slugs from DB, keyed by language code */
  localizedSlugs?: Record<string, string>;
}

export interface BlogArticleMeta {
  slug: string;
  slugs: Record<string, string>;
  publishedAt: string;
  updatedAt?: string;
  locales: Record<string, boolean>;
}
