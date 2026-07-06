#!/usr/bin/env node
/**
 * Generates a self-contained HTML page that seeds blog data into Supabase.
 * No network needed to run this script, it just reads TS files and outputs HTML.
 *
 * Usage: node scripts/generate-seed-html.js > seed-blog.html
 * Then open seed-blog.html in your browser.
 */

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://lojvajnnvhatfplevyvy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvanZham5udmhhdGZwbGV2eXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNzk3NDIsImV4cCI6MjA4Nzg1NTc0Mn0.gdd9HRbRvfQr6io9jGN6hUCW6tBOtognhwbsTJtSTng';
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

// Parse all articles
const DATA_DIR = path.resolve(__dirname, '../data/blog');
const articles = [];

for (const meta of ARTICLE_METAS) {
  const translations = [];
  for (const lang of LANGUAGES) {
    const filePath = path.join(DATA_DIR, lang, `${meta.internalSlug}.ts`);
    const article = parseArticleTs(filePath);
    if (!article) { console.error(`  [${lang}] ${meta.internalSlug}, not found`); continue; }
    const slug = meta.slugs[lang] || meta.internalSlug;
    translations.push({
      lang, slug,
      title: article.title || '',
      meta_title: article.metaTitle || '',
      meta_description: article.metaDescription || '',
      featured_image_alt: article.featuredImageAlt || '',
      excerpt: article.excerpt || '',
      introduction: article.introduction || '',
      quick_summary: article.quickSummary || [],
      sections: (article.sections || []).map(s => ({
        id: s.id || '', title: s.title || '', content: s.content || '',
        subsections: (s.subsections || []).map(sub => ({ id: sub.id || '', title: sub.title || '', content: sub.content || '' })),
      })),
      is_complete: true,
    });
  }
  const frPath = path.join(DATA_DIR, 'fr', `${meta.internalSlug}.ts`);
  const frArticle = parseArticleTs(frPath);
  articles.push({
    internal_slug: meta.internalSlug,
    featured_image_url: frArticle?.featuredImage || `/blog/${meta.internalSlug}.webp`,
    author_id: frArticle?.author?.id || 'mathieu-courtin',
    status: 'published',
    published_at: meta.publishedAt + 'T00:00:00.000Z',
    translations,
  });
  console.error(`Parsed: ${meta.internalSlug} (${translations.length} translations)`);
}

const seedData = JSON.stringify({ articles });
console.error(`\nTotal: ${articles.length} articles, ${articles.reduce((s, a) => s + a.translations.length, 0)} translations`);
console.error(`JSON size: ${(seedData.length / 1024).toFixed(0)} KB`);

// Generate HTML
const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Seed Blog, Quiz Couple</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f172a; color: #e2e8f0; padding: 2rem; }
  h1 { margin-bottom: 1rem; color: #f472b6; }
  .card { background: #1e293b; border-radius: 12px; padding: 1.5rem; margin-bottom: 1rem; }
  label { display: block; margin-bottom: 0.5rem; font-weight: 600; }
  input { width: 100%; padding: 0.75rem; border-radius: 8px; border: 1px solid #334155; background: #0f172a; color: #e2e8f0; font-size: 1rem; }
  button { padding: 0.75rem 2rem; border: none; border-radius: 8px; font-size: 1rem; font-weight: 700; cursor: pointer; margin-top: 1rem; }
  .btn-primary { background: #ec4899; color: white; }
  .btn-primary:hover { background: #db2777; }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  #log { background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 1rem; margin-top: 1rem; max-height: 400px; overflow-y: auto; font-family: monospace; font-size: 0.9rem; white-space: pre-wrap; }
  .ok { color: #4ade80; }
  .err { color: #f87171; }
  .info { color: #60a5fa; }
  .stats { display: flex; gap: 1rem; margin: 1rem 0; }
  .stat { background: #334155; padding: 0.75rem 1.25rem; border-radius: 8px; text-align: center; }
  .stat-val { font-size: 1.5rem; font-weight: 700; color: #f472b6; }
  .stat-label { font-size: 0.8rem; color: #94a3b8; }
</style>
</head>
<body>
<h1>Seed Blog Data</h1>
<div class="stats">
  <div class="stat"><div class="stat-val">${articles.length}</div><div class="stat-label">Articles</div></div>
  <div class="stat"><div class="stat-val">${articles.reduce((s, a) => s + a.translations.length, 0)}</div><div class="stat-label">Translations</div></div>
  <div class="stat"><div class="stat-val">${(seedData.length / 1024).toFixed(0)} KB</div><div class="stat-label">Payload</div></div>
</div>
<div class="card">
  <label for="pw">Mot de passe Admin</label>
  <input type="password" id="pw" placeholder="Ton ADMIN_PASSWORD Supabase" />
  <button class="btn-primary" id="btn" onclick="runSeed()">Lancer le Seed</button>
</div>
<div id="log"></div>

<script>
const SUPABASE_URL = ${JSON.stringify(SUPABASE_URL)};
const SUPABASE_ANON_KEY = ${JSON.stringify(SUPABASE_ANON_KEY)};
const SEED_DATA = ${seedData};

function log(msg, cls) {
  const el = document.getElementById('log');
  const span = document.createElement('span');
  span.className = cls || '';
  span.textContent = msg + '\\n';
  el.appendChild(span);
  el.scrollTop = el.scrollHeight;
}

async function runSeed() {
  const btn = document.getElementById('btn');
  const pw = document.getElementById('pw').value.trim();
  if (!pw) { alert('Mot de passe requis'); return; }

  btn.disabled = true;
  btn.textContent = 'En cours...';

  try {
    // 1. Authenticate
    log('Authentification...', 'info');
    const authRes = await fetch(SUPABASE_URL + '/functions/v1/verify-admin', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    });
    const authData = await authRes.json();
    if (!authData.success) { log('Erreur auth: ' + authData.error, 'err'); btn.disabled = false; btn.textContent = 'Lancer le Seed'; return; }
    log('Authentifie OK', 'ok');
    const token = authData.token;

    // 2. Send seed
    log('Envoi des ' + SEED_DATA.articles.length + ' articles...', 'info');
    const seedRes = await fetch(SUPABASE_URL + '/functions/v1/admin-blog?action=seed', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
        'x-admin-token': token,
      },
      body: JSON.stringify(SEED_DATA),
    });
    const seedResult = await seedRes.json();

    if (!seedResult.success) {
      log('Erreur seed: ' + seedResult.error, 'err');
      btn.disabled = false; btn.textContent = 'Lancer le Seed';
      return;
    }

    log('', '');
    log('=== SEED TERMINE ===', 'ok');
    log('Crees: ' + seedResult.created, 'ok');
    log('Mis a jour: ' + seedResult.skipped, 'info');
    if (seedResult.errors && seedResult.errors.length > 0) {
      log('Erreurs:', 'err');
      seedResult.errors.forEach(e => log('  - ' + e, 'err'));
    } else {
      log('Aucune erreur !', 'ok');
    }

    // 3. Verify
    log('', '');
    log('Verification...', 'info');
    const listRes = await fetch(SUPABASE_URL + '/functions/v1/admin-blog?action=list', {
      headers: { 'Authorization': 'Bearer ' + SUPABASE_ANON_KEY, 'x-admin-token': token },
    });
    const listData = await listRes.json();
    if (listData.success) {
      log('Articles en base: ' + listData.articles.length, 'ok');
      listData.articles.forEach(a => {
        const trCount = (a.blog_article_translations || []).length;
        log('  ' + a.internal_slug + ' (' + a.status + ', ' + trCount + ' traductions)', 'info');
      });
    }

    log('', '');
    log('Tout est bon ! Tu peux fermer cette page.', 'ok');
    btn.textContent = 'Termine !';

  } catch (e) {
    log('Erreur: ' + e.message, 'err');
    btn.disabled = false;
    btn.textContent = 'Lancer le Seed';
  }
}
</script>
</body>
</html>`;

process.stdout.write(html);
