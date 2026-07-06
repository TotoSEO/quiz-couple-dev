#!/usr/bin/env node
/**
 * Seed blog articles from data/blog/ TS files into Supabase.
 *
 * Reads article list directly from data/blog/articles.ts (single source of truth).
 * Sends articles ONE BY ONE to avoid payload/timeout issues.
 *
 * Usage:
 *   ADMIN_PASSWORD=xxx node scripts/seed-blog.js              # sync all articles
 *   ADMIN_PASSWORD=xxx node scripts/seed-blog.js --only dependance-affective  # sync one
 *   ADMIN_PASSWORD=xxx node scripts/seed-blog.js --dry-run    # preview without sending
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ── Config ───────────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://lojvajnnvhatfplevyvy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvanZham5udmhhdGZwbGV2eXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNzk3NDIsImV4cCI6MjA4Nzg1NTc0Mn0.gdd9HRbRvfQr6io9jGN6hUCW6tBOtognhwbsTJtSTng';
const LANGUAGES = ['fr', 'en', 'es', 'de', 'it'];
const DATA_DIR = path.resolve(__dirname, '../data/blog');

// ── Parse articles.ts to get the registry ────────────────────────────────
function loadArticleRegistry() {
  const filePath = path.join(DATA_DIR, 'articles.ts');
  const content = fs.readFileSync(filePath, 'utf-8');

  // Extract the blogArticles array
  const match = content.match(/export const blogArticles[^=]*=\s*(\[[\s\S]*?\n\];)/);
  if (!match) throw new Error('Could not parse blogArticles from articles.ts');

  let arrStr = match[1];
  // Clean TS syntax for eval
  arrStr = arrStr.replace(/as const/g, '');
  // Remove type annotations like `: BlogArticleMeta[]`
  arrStr = arrStr.replace(/:\s*BlogArticleMeta\[\]/g, '');

  const fn = new Function('return ' + arrStr);
  return fn();
}

// ── Author stubs (for parsing TS files) ──────────────────────────────────
const AUTHORS = {
  'mathieu-courtin': { id: 'mathieu-courtin', name: 'Mathieu Courtin', avatar: '/authors/mathieu-courtin.webp', bios: {} },
  'lucie-courtin': { id: 'lucie-courtin', name: 'Lucie Courtin', avatar: '/authors/lucie-courtin.webp', bios: {} },
};

// ── Parse a single TS article file ───────────────────────────────────────
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
    console.warn(`  Failed to parse ${path.basename(filePath)}: ${e.message}`);
    return null;
  }
}

// ── Auth ─────────────────────────────────────────────────────────────────
async function askPassword() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stderr });
  return new Promise((resolve) => {
    rl.question('Admin password: ', (answer) => { rl.close(); resolve(answer.trim()); });
  });
}

async function getAdminToken() {
  if (process.env.ADMIN_TOKEN) return process.env.ADMIN_TOKEN;
  const password = process.env.ADMIN_PASSWORD || await askPassword();

  const res = await fetch(`${SUPABASE_URL}/functions/v1/verify-admin`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });

  const data = await res.json();
  if (!data.success) throw new Error(`Auth failed: ${data.error}`);
  return data.token;
}

// ── Send one article to Supabase ─────────────────────────────────────────
async function seedOneArticle(token, articlePayload) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-blog?action=seed`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'x-admin-token': token,
    },
    body: JSON.stringify({ articles: [articlePayload] }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

// ── Main ─────────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const onlyIdx = args.indexOf('--only');
  const onlySlug = onlyIdx >= 0 ? args[onlyIdx + 1] : null;

  console.log('=== Blog Seed Script ===\n');

  // 1. Load registry from articles.ts (single source of truth)
  const registry = loadArticleRegistry();
  console.log(`Loaded ${registry.length} articles from articles.ts`);

  // Filter if --only
  const toSync = onlySlug
    ? registry.filter(a => a.slug === onlySlug)
    : registry;

  if (onlySlug && toSync.length === 0) {
    console.error(`Article "${onlySlug}" not found in articles.ts`);
    process.exit(1);
  }

  console.log(`Will sync: ${toSync.length} article(s)${dryRun ? ' (DRY RUN)' : ''}\n`);

  // 2. Authenticate
  let token = null;
  if (!dryRun) {
    console.log('Authenticating...');
    token = await getAdminToken();
    console.log('OK\n');
  }

  // 3. Process each article
  let created = 0, updated = 0, errored = 0;

  for (const meta of toSync) {
    const slug = meta.slug;
    process.stdout.write(`[${slug}] `);

    // Parse translations
    const translations = [];
    for (const lang of LANGUAGES) {
      if (meta.locales && meta.locales[lang] === false) continue;

      const filePath = path.join(DATA_DIR, lang, `${slug}.ts`);
      const article = parseArticleTs(filePath);
      if (!article) {
        if (lang === 'fr') process.stdout.write(`(no FR!) `);
        continue;
      }

      const localizedSlug = meta.slugs?.[lang] || slug;
      translations.push({
        lang,
        slug: localizedSlug,
        title: article.title || '',
        meta_title: article.metaTitle || '',
        meta_description: article.metaDescription || '',
        featured_image_alt: article.featuredImageAlt || '',
        excerpt: article.excerpt || '',
        introduction: article.introduction || '',
        quick_summary: article.quickSummary || [],
        sections: (article.sections || []).map(s => ({
          id: s.id || '',
          title: s.title || '',
          content: s.content || '',
          subsections: (s.subsections || []).map(sub => ({
            id: sub.id || '',
            title: sub.title || '',
            content: sub.content || '',
          })),
        })),
        is_complete: true,
      });
    }

    // Get metadata from FR version
    const frArticle = parseArticleTs(path.join(DATA_DIR, 'fr', `${slug}.ts`));
    const featuredImage = frArticle?.featuredImage || '';
    const authorId = frArticle?.author?.id || 'mathieu-courtin';

    const payload = {
      internal_slug: slug,
      featured_image_url: featuredImage,
      author_id: authorId,
      status: 'published',
      published_at: (meta.publishedAt || '2026-01-01') + 'T00:00:00.000Z',
      translations,
    };

    if (dryRun) {
      console.log(`${translations.length} lang(s), would send`);
      continue;
    }

    // Send to Supabase
    try {
      const result = await seedOneArticle(token, payload);
      if (result.success) {
        const status = result.created > 0 ? 'CREATED' : 'UPDATED';
        console.log(`${translations.length} lang(s), ${status}`);
        if (result.created > 0) created++; else updated++;
      } else {
        console.log(`ERROR: ${result.error}`);
        errored++;
      }
    } catch (e) {
      console.log(`ERROR: ${e.message}`);
      errored++;
    }
  }

  // 4. Summary
  console.log(`\n=== Done ===`);
  console.log(`  Created: ${created}`);
  console.log(`  Updated: ${updated}`);
  if (errored) console.log(`  Errors:  ${errored}`);
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
