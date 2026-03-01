#!/usr/bin/env node
/**
 * Generates SQL INSERT statements to seed blog articles into Supabase.
 * No network needed — reads TS files and outputs SQL.
 *
 * Usage: node scripts/generate-seed-sql.js > seed-blog-data.sql
 * Then paste the SQL into Supabase Dashboard > SQL Editor
 */

const fs = require('fs');
const path = require('path');

const LANGUAGES = ['fr', 'en', 'es', 'de', 'it'];

const AUTHORS = {
  'mathieu-courtin': {
    id: 'mathieu-courtin', name: 'Mathieu Courtin', avatar: '/authors/mathieu-courtin.webp',
    bios: { fr: '', en: '', es: '', de: '', it: '' },
  },
  'lucie-courtin': {
    id: 'lucie-courtin', name: 'Lucie Courtin', avatar: '/authors/lucie-courtin.webp',
    bios: { fr: '', en: '', es: '', de: '', it: '' },
  },
};

const ARTICLE_METAS = [
  { internalSlug: 'les-phases-de-la-rupture-chez-l-homme', slugs: { fr: 'les-phases-de-la-rupture-chez-l-homme', en: 'breakup-stages-for-men', es: 'fases-de-la-ruptura-en-el-hombre', de: 'trennungsphasen-beim-mann', it: 'fasi-della-rottura-nell-uomo' }, publishedAt: '2026-02-21' },
  { internalSlug: 'choses-pas-accepter-couple', slugs: { fr: 'choses-pas-accepter-couple', en: 'things-not-accept-relationship', es: 'cosas-no-aceptar-pareja', de: 'grenzen-beziehung-nicht-akzeptieren', it: 'cose-non-accettare-coppia' }, publishedAt: '2026-02-21' },
  { internalSlug: 'avis-tinder', slugs: { fr: 'avis-tinder', en: 'tinder-review', es: 'tinder-opiniones-vale-la-pena', de: 'tinder-bewertung', it: 'recensione-tinder' }, publishedAt: '2026-02-27' },
  { internalSlug: 'avis-bumble', slugs: { fr: 'avis-bumble', en: 'bumble-app-review', es: 'opiniones-bumble', de: 'bumble-erfahrungen', it: 'recensione-bumble' }, publishedAt: '2026-02-27' },
  { internalSlug: 'avis-hinge', slugs: { fr: 'avis-hinge-rencontre', en: 'hinge-dating-app-review', es: 'opinion-hinge-app-citas', de: 'hinge-erfahrungen-test', it: 'recensione-hinge-app' }, publishedAt: '2026-02-27' },
  { internalSlug: 'avis-badoo', slugs: { fr: 'avis-badoo', en: 'badoo-review', es: 'opinion-badoo', de: 'badoo-erfahrungen', it: 'recensione-badoo' }, publishedAt: '2026-02-28' },
];

function parseArticleTs(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const match = content.match(/const article[^=]*=\s*(\{[\s\S]*\});\s*$/m);
    if (!match) return null;
    let objStr = match[1];
    objStr = objStr.replace(/AUTHORS\['mathieu-courtin'\]/g, JSON.stringify(AUTHORS['mathieu-courtin']));
    objStr = objStr.replace(/AUTHORS\['lucie-courtin'\]/g, JSON.stringify(AUTHORS['lucie-courtin']));
    objStr = objStr.replace(/as const/g, '');
    const fn = new Function('return (' + objStr + ')');
    return fn();
  } catch (e) {
    console.error(`Failed to parse ${filePath}: ${e.message}`);
    return null;
  }
}

function escSql(s) {
  if (s === null || s === undefined) return 'NULL';
  return "'" + String(s).replace(/'/g, "''") + "'";
}

function escJsonb(obj) {
  return "'" + JSON.stringify(obj).replace(/'/g, "''") + "'::jsonb";
}

// Parse all articles and generate SQL
const DATA_DIR = path.resolve(__dirname, '../data/blog');
const sql = [];

sql.push('-- ============================================================');
sql.push('-- SEED BLOG DATA — Generated from data/blog/ TS files');
sql.push('-- Paste this in Supabase Dashboard > SQL Editor > New Query');
sql.push('-- ============================================================');
sql.push('');
sql.push('BEGIN;');
sql.push('');

for (const meta of ARTICLE_METAS) {
  const frPath = path.join(DATA_DIR, 'fr', `${meta.internalSlug}.ts`);
  const frArticle = parseArticleTs(frPath);
  const featuredImage = frArticle?.featuredImage || `/blog/${meta.internalSlug}.webp`;
  const authorId = frArticle?.author?.id || 'mathieu-courtin';

  // Use a CTE with gen_random_uuid() for article_id
  const varName = meta.internalSlug.replace(/-/g, '_');

  sql.push(`-- ── Article: ${meta.internalSlug} ──`);
  sql.push(`DO $$`);
  sql.push(`DECLARE`);
  sql.push(`  art_id UUID;`);
  sql.push(`BEGIN`);
  sql.push(`  -- Insert article`);
  sql.push(`  INSERT INTO public.blog_articles (internal_slug, featured_image_url, author_id, status, published_at)`);
  sql.push(`  VALUES (${escSql(meta.internalSlug)}, ${escSql(featuredImage)}, ${escSql(authorId)}, 'published', ${escSql(meta.publishedAt + 'T00:00:00.000Z')})`);
  sql.push(`  ON CONFLICT (internal_slug) DO UPDATE SET`);
  sql.push(`    featured_image_url = EXCLUDED.featured_image_url,`);
  sql.push(`    author_id = EXCLUDED.author_id,`);
  sql.push(`    status = EXCLUDED.status,`);
  sql.push(`    published_at = EXCLUDED.published_at`);
  sql.push(`  RETURNING id INTO art_id;`);
  sql.push('');

  // Translations
  for (const lang of LANGUAGES) {
    const filePath = path.join(DATA_DIR, lang, `${meta.internalSlug}.ts`);
    const article = parseArticleTs(filePath);
    if (!article) {
      console.error(`  [${lang}] ${meta.internalSlug} — not found, skipping`);
      continue;
    }

    const slug = meta.slugs[lang] || meta.internalSlug;
    const quickSummary = article.quickSummary || [];
    const sections = (article.sections || []).map(s => ({
      id: s.id || '',
      title: s.title || '',
      content: s.content || '',
      subsections: (s.subsections || []).map(sub => ({
        id: sub.id || '',
        title: sub.title || '',
        content: sub.content || '',
      })),
    }));

    sql.push(`  -- Translation: ${lang}`);
    sql.push(`  INSERT INTO public.blog_article_translations (article_id, lang, slug, title, meta_title, meta_description, featured_image_alt, excerpt, introduction, quick_summary, sections, is_complete)`);
    sql.push(`  VALUES (`);
    sql.push(`    art_id,`);
    sql.push(`    ${escSql(lang)},`);
    sql.push(`    ${escSql(slug)},`);
    sql.push(`    ${escSql(article.title || '')},`);
    sql.push(`    ${escSql(article.metaTitle || '')},`);
    sql.push(`    ${escSql(article.metaDescription || '')},`);
    sql.push(`    ${escSql(article.featuredImageAlt || '')},`);
    sql.push(`    ${escSql(article.excerpt || '')},`);
    sql.push(`    ${escSql(article.introduction || '')},`);
    sql.push(`    ${escJsonb(quickSummary)},`);
    sql.push(`    ${escJsonb(sections)},`);
    sql.push(`    true`);
    sql.push(`  )`);
    sql.push(`  ON CONFLICT (article_id, lang) DO UPDATE SET`);
    sql.push(`    slug = EXCLUDED.slug,`);
    sql.push(`    title = EXCLUDED.title,`);
    sql.push(`    meta_title = EXCLUDED.meta_title,`);
    sql.push(`    meta_description = EXCLUDED.meta_description,`);
    sql.push(`    featured_image_alt = EXCLUDED.featured_image_alt,`);
    sql.push(`    excerpt = EXCLUDED.excerpt,`);
    sql.push(`    introduction = EXCLUDED.introduction,`);
    sql.push(`    quick_summary = EXCLUDED.quick_summary,`);
    sql.push(`    sections = EXCLUDED.sections,`);
    sql.push(`    is_complete = EXCLUDED.is_complete;`);
    sql.push('');
  }

  sql.push(`END $$;`);
  sql.push('');
  console.error(`Parsed: ${meta.internalSlug}`);
}

sql.push('COMMIT;');
sql.push('');
sql.push('-- Verify:');
sql.push("SELECT a.internal_slug, a.status, COUNT(t.id) as translations FROM blog_articles a LEFT JOIN blog_article_translations t ON t.article_id = a.id GROUP BY a.id ORDER BY a.published_at;");

process.stdout.write(sql.join('\n'));
console.error('\nSQL generated successfully!');
