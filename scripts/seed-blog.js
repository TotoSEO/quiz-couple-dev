#!/usr/bin/env node
/**
 * Seed blog articles from data/blog/ TS files into Supabase.
 *
 * Usage:
 *   node scripts/seed-blog.js
 *
 * Requirements:
 *   - SUPABASE_URL and SUPABASE_ANON_KEY in the script (hardcoded from config)
 *   - An admin token (obtained by calling verify-admin with your ADMIN_PASSWORD)
 *   - Or pass ADMIN_TOKEN env var
 *
 * This script:
 *   1. Authenticates via verify-admin
 *   2. Parses all TS article files
 *   3. Calls admin-blog?action=seed to bulk import
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// From static-site/build/config.js
const SUPABASE_URL = 'https://lojvajnnvhatfplevyvy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvanZham5udmhhdGZwbGV2eXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNzk3NDIsImV4cCI6MjA4Nzg1NTc0Mn0.gdd9HRbRvfQr6io9jGN6hUCW6tBOtognhwbsTJtSTng';

const LANGUAGES = ['fr', 'en', 'es', 'de', 'it'];

// Author data (same as generate.js)
const AUTHORS = {
  'mathieu-courtin': {
    id: 'mathieu-courtin',
    name: 'Mathieu Courtin',
    avatar: '/authors/mathieu-courtin.webp',
    bios: {
      fr: "Mathieu Courtin est rédacteur spécialisé en relations amoureuses et psychologie du couple.",
      en: "Mathieu Courtin is a writer specializing in romantic relationships and couple psychology.",
      es: "Mathieu Courtin es redactor especializado en relaciones sentimentales y psicología de pareja.",
      de: "Mathieu Courtin ist Autor mit Schwerpunkt auf Liebesbeziehungen und Paarpsychologie.",
      it: "Mathieu Courtin è autore specializzato in relazioni sentimentali e psicologia di coppia.",
    },
  },
  'lucie-courtin': {
    id: 'lucie-courtin',
    name: 'Lucie Courtin',
    avatar: '/authors/lucie-courtin.webp',
    bios: {
      fr: "Lucie Courtin est rédactrice spécialisée en relations de couple et bien-être émotionnel.",
      en: "Lucie Courtin is a writer specializing in couple relationships and emotional well-being.",
      es: "Lucie Courtin es redactora especializada en relaciones de pareja y bienestar emocional.",
      de: "Lucie Courtin ist Autorin mit Schwerpunkt auf Paarbeziehungen und emotionalem Wohlbefinden.",
      it: "Lucie Courtin è autrice specializzata in relazioni di coppia e benessere emotivo.",
    },
  },
};

// Articles metadata (from data/blog/articles.ts / config.js)
const ARTICLE_METAS = [
  {
    internalSlug: 'les-phases-de-la-rupture-chez-l-homme',
    slugs: {
      fr: 'les-phases-de-la-rupture-chez-l-homme',
      en: 'breakup-stages-for-men',
      es: 'fases-de-la-ruptura-en-el-hombre',
      de: 'trennungsphasen-beim-mann',
      it: 'fasi-della-rottura-nell-uomo',
    },
    publishedAt: '2026-02-21',
  },
  {
    internalSlug: 'choses-pas-accepter-couple',
    slugs: {
      fr: 'choses-pas-accepter-couple',
      en: 'things-not-accept-relationship',
      es: 'cosas-no-aceptar-pareja',
      de: 'grenzen-beziehung-nicht-akzeptieren',
      it: 'cose-non-accettare-coppia',
    },
    publishedAt: '2026-02-21',
  },
  {
    internalSlug: 'avis-tinder',
    slugs: {
      fr: 'avis-tinder',
      en: 'tinder-review',
      es: 'tinder-opiniones-vale-la-pena',
      de: 'tinder-bewertung',
      it: 'recensione-tinder',
    },
    publishedAt: '2026-02-27',
  },
  {
    internalSlug: 'avis-bumble',
    slugs: {
      fr: 'avis-bumble',
      en: 'bumble-app-review',
      es: 'opiniones-bumble',
      de: 'bumble-erfahrungen',
      it: 'recensione-bumble',
    },
    publishedAt: '2026-02-27',
  },
  {
    internalSlug: 'avis-hinge',
    slugs: {
      fr: 'avis-hinge-rencontre',
      en: 'hinge-dating-app-review',
      es: 'opinion-hinge-app-citas',
      de: 'hinge-erfahrungen-test',
      it: 'recensione-hinge-app',
    },
    publishedAt: '2026-02-27',
  },
  {
    internalSlug: 'avis-badoo',
    slugs: {
      fr: 'avis-badoo',
      en: 'badoo-review',
      es: 'opinion-badoo',
      de: 'badoo-erfahrungen',
      it: 'recensione-badoo',
    },
    publishedAt: '2026-02-28',
  },
];

// Parse a TS article file (same logic as generate.js parseArticleTs)
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
    console.warn(`Failed to parse ${filePath}: ${e.message}`);
    return null;
  }
}

async function askPassword() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stderr });
  return new Promise((resolve) => {
    rl.question('Admin password: ', (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function getAdminToken() {
  // Check env var first
  if (process.env.ADMIN_TOKEN) return process.env.ADMIN_TOKEN;

  const password = process.env.ADMIN_PASSWORD || await askPassword();

  const res = await fetch(`${SUPABASE_URL}/functions/v1/verify-admin`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password }),
  });

  const data = await res.json();
  if (!data.success) {
    throw new Error(`Auth failed: ${data.error}`);
  }
  return data.token;
}

async function main() {
  console.log('=== Blog Seed Script ===\n');

  // 1. Get admin token
  console.log('Authenticating...');
  const token = await getAdminToken();
  console.log('Authenticated OK\n');

  // 2. Parse all articles
  const DATA_DIR = path.resolve(__dirname, '../data/blog');
  const articles = [];

  for (const meta of ARTICLE_METAS) {
    console.log(`Parsing: ${meta.internalSlug}`);
    const translations = [];

    for (const lang of LANGUAGES) {
      const filePath = path.join(DATA_DIR, lang, `${meta.internalSlug}.ts`);
      const article = parseArticleTs(filePath);
      if (!article) {
        console.log(`  [${lang}] Not found, skipping`);
        continue;
      }

      const slug = meta.slugs[lang] || meta.internalSlug;

      translations.push({
        lang,
        slug,
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
      console.log(`  [${lang}] OK`);
    }

    // Determine featured_image_url and author from FR version
    const frPath = path.join(DATA_DIR, 'fr', `${meta.internalSlug}.ts`);
    const frArticle = parseArticleTs(frPath);
    const featuredImage = frArticle?.featuredImage || `/blog/${meta.internalSlug}.webp`;
    const authorId = frArticle?.author?.id || 'mathieu-courtin';

    articles.push({
      internal_slug: meta.internalSlug,
      featured_image_url: featuredImage,
      author_id: authorId,
      status: 'published',
      published_at: meta.publishedAt + 'T00:00:00.000Z',
      translations,
    });
  }

  console.log(`\nParsed ${articles.length} articles with ${articles.reduce((sum, a) => sum + a.translations.length, 0)} translations total\n`);

  // 3. Send to seed endpoint
  console.log('Sending to Supabase seed endpoint...');
  const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-blog?action=seed`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'x-admin-token': token,
    },
    body: JSON.stringify({ articles }),
  });

  const result = await res.json();

  if (!result.success) {
    console.error('Seed failed:', result.error);
    process.exit(1);
  }

  console.log(`\nSeed complete!`);
  console.log(`  Created: ${result.created}`);
  console.log(`  Updated: ${result.skipped}`);
  if (result.errors && result.errors.length > 0) {
    console.log(`  Errors:`);
    for (const err of result.errors) {
      console.log(`    - ${err}`);
    }
  }
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
