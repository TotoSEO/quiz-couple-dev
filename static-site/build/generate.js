#!/usr/bin/env node
/**
 * Main static site generator for quiz-couple.com
 * Reads translation JSON files + EJS templates → generates static HTML pages
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ejs from 'ejs';
import { minify } from 'html-minifier-terser';
import {
  BASE_URL, LANGUAGES, LOCALES, ROUTE_SLUGS, ROUTE_CONFIG, GA_ID,
  SUPABASE_URL, SUPABASE_ANON_KEY,
  getLocalizedPath, getLocalizedUrl, getRouteAlternates, escapeHtml,
} from './config.js';
import { createT, loadTranslations } from './i18n.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.resolve(__dirname, '../templates');
const DIST_DIR = path.resolve(__dirname, '../dist');

// ── Helpers ──────────────────────────────────────────────────────────────

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

async function minifyHtml(html) {
  try {
    return await minify(html, {
      collapseWhitespace: true,
      removeComments: true,
      minifyCSS: true,
      minifyJS: true,
      removeRedundantAttributes: true,
      removeEmptyAttributes: true,
    });
  } catch (e) {
    console.warn(`[minify] Warning: ${e.message}`);
    return html;
  }
}

function renderTemplate(templateName, data) {
  const templatePath = path.join(TEMPLATES_DIR, `${templateName}.ejs`);
  if (!fs.existsSync(templatePath)) {
    console.warn(`[render] Template not found: ${templatePath}`);
    return `<!-- Template ${templateName} not found -->`;
  }
  return ejs.renderFile(templatePath, data, {
    views: [TEMPLATES_DIR],
    async: false,
  });
}

// ── Page generation ─────────────────────────────────────────────────────

async function generatePage(routeKey, lang) {
  const config = ROUTE_CONFIG[routeKey];
  if (!config) {
    console.warn(`[generate] No config for route: ${routeKey}`);
    return;
  }

  const t = createT(lang);
  const translations = loadTranslations(lang);
  const alternates = getRouteAlternates(routeKey);
  const canonical = getLocalizedUrl(routeKey, lang);
  const pagePath = getLocalizedPath(routeKey, lang);

  // Get page title and description
  let title, description;
  if (routeKey === 'home') {
    title = t('home:seo.title', 'Quiz Couple - Quiz gratuits pour couples');
    description = t('home:seo.description', 'Découvrez nos quiz gratuits pour couples !');
  } else if (routeKey === 'legalMentions') {
    const legalMeta = {
      fr: { title: 'Mentions Légales - Quiz Couple', description: 'Mentions légales du site Quiz Couple.' },
      en: { title: 'Legal Notice - Quiz Couple', description: 'Legal notice for Quiz Couple website.' },
      es: { title: 'Aviso Legal - Quiz Couple', description: 'Aviso legal del sitio Quiz Couple.' },
      de: { title: 'Impressum - Quiz Couple', description: 'Impressum der Website Quiz Couple.' },
      it: { title: 'Note Legali - Quiz Couple', description: 'Note legali del sito Quiz Couple.' },
    };
    title = legalMeta[lang]?.title || legalMeta.fr.title;
    description = legalMeta[lang]?.description || legalMeta.fr.description;
  } else if (routeKey === 'privacy') {
    const privacyMeta = {
      fr: { title: 'Politique de Confidentialité - Quiz Couple', description: 'Politique de confidentialité de Quiz Couple.' },
      en: { title: 'Privacy Policy - Quiz Couple', description: 'Quiz Couple privacy policy.' },
      es: { title: 'Política de Privacidad - Quiz Couple', description: 'Política de privacidad de Quiz Couple.' },
      de: { title: 'Datenschutzerklärung - Quiz Couple', description: 'Datenschutzerklärung von Quiz Couple.' },
      it: { title: 'Privacy Policy - Quiz Couple', description: 'Informativa sulla privacy di Quiz Couple.' },
    };
    title = privacyMeta[lang]?.title || privacyMeta.fr.title;
    description = privacyMeta[lang]?.description || privacyMeta.fr.description;
  } else if (routeKey === 'blog') {
    const blogMeta = {
      fr: { title: 'Blog - Conseils et astuces pour couples | Quiz Couple', description: 'Découvrez nos articles et conseils pour renforcer votre relation de couple.' },
      en: { title: 'Blog - Tips & Advice for Couples | Quiz Couple', description: 'Discover our articles and tips to strengthen your relationship.' },
      es: { title: 'Blog - Consejos para parejas | Quiz Couple', description: 'Descubre nuestros artículos y consejos para fortalecer tu relación de pareja.' },
      de: { title: 'Blog - Tipps und Ratschläge für Paare | Quiz Couple', description: 'Entdecke unsere Artikel und Tipps, um deine Beziehung zu stärken.' },
      it: { title: 'Blog - Consigli per coppie | Quiz Couple', description: 'Scopri i nostri articoli e consigli per rafforzare la tua relazione di coppia.' },
    };
    title = blogMeta[lang]?.title || blogMeta.fr.title;
    description = blogMeta[lang]?.description || blogMeta.fr.description;
  } else {
    // Quiz/test pages - get from quizzes.json
    title = t(`quizzes:${routeKey}.title`, 'Quiz Couple');
    description = t(`quizzes:${routeKey}.metaDescription`, '');
  }

  // Template data available to all pages
  const data = {
    // Globals
    lang,
    locale: LOCALES[lang],
    baseUrl: BASE_URL,
    gaId: GA_ID,
    supabaseUrl: SUPABASE_URL,
    supabaseKey: SUPABASE_ANON_KEY,
    // SEO
    title: escapeHtml(title),
    rawTitle: title,
    description: escapeHtml(description),
    rawDescription: description,
    canonical,
    alternates,
    ogImage: `${BASE_URL}/og-image.webp`,
    // Navigation/routing
    routeKey,
    pagePath,
    routeSlugs: ROUTE_SLUGS,
    languages: LANGUAGES,
    // Translation function
    t,
    translations,
    // Helpers
    getLocalizedUrl,
    getLocalizedPath,
    escapeHtml,
    JSON,
  };

  try {
    // First render the page-specific template
    const pageHtml = await renderTemplate(`pages/${config.template}`, data);

    // Then render the base template wrapping the page content
    const fullHtml = await renderTemplate('base', {
      ...data,
      content: pageHtml,
    });

    // Minify
    const minified = await minifyHtml(fullHtml);

    // Write to dist
    const outputPath = pagePath === '/'
      ? path.join(DIST_DIR, 'index.html')
      : path.join(DIST_DIR, pagePath, 'index.html');

    ensureDir(path.dirname(outputPath));
    fs.writeFileSync(outputPath, minified, 'utf-8');

    return { route: pagePath, success: true };
  } catch (e) {
    console.error(`[generate] Error generating ${routeKey} (${lang}): ${e.message}`);
    if (e.stack) console.error(e.stack.split('\n').slice(0, 5).join('\n'));
    return { route: pagePath, success: false, error: e.message };
  }
}

// ── Sitemap generation ──────────────────────────────────────────────────

function generateSitemaps() {
  const publicDir = path.resolve(__dirname, '../../public');

  // Copy existing sitemaps from public/ to dist/
  for (const file of ['sitemap.xml', 'sitemap-fr.xml', 'sitemap-en.xml', 'sitemap-es.xml', 'sitemap-de.xml', 'sitemap-it.xml']) {
    const src = path.join(publicDir, file);
    const dest = path.join(DIST_DIR, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
    }
  }
  console.log('[sitemaps] Copied existing sitemaps to dist/');
}

// ── Static assets ───────────────────────────────────────────────────────

function copyStaticAssets() {
  const publicDir = path.resolve(__dirname, '../../public');
  const assetsDir = path.resolve(__dirname, '../../assets');

  // Copy public/ files
  const publicFiles = ['favicon.ico', 'favicon.png', 'apple-touch-icon.png', 'og-image.webp', 'robots.txt', 'site.webmanifest', 'placeholder.svg'];
  for (const file of publicFiles) {
    const src = path.join(publicDir, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(DIST_DIR, file));
    }
  }

  // Copy public/blog/ and public/authors/ directories
  for (const dir of ['blog', 'authors']) {
    const srcDir = path.join(publicDir, dir);
    const destDir = path.join(DIST_DIR, dir);
    if (fs.existsSync(srcDir)) {
      copyDirRecursive(srcDir, destDir);
    }
  }

  // Copy logo assets
  const logoDestDir = path.join(DIST_DIR, 'assets');
  ensureDir(logoDestDir);
  for (const file of fs.readdirSync(assetsDir)) {
    fs.copyFileSync(path.join(assetsDir, file), path.join(logoDestDir, file));
  }

  console.log('[assets] Static assets copied to dist/');
}

function copyDirRecursive(src, dest) {
  ensureDir(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// ── Translation data for JS runtime ─────────────────────────────────────

function copyTranslationData() {
  const dataDir = path.join(DIST_DIR, 'js', 'data');
  ensureDir(dataDir);

  for (const lang of LANGUAGES) {
    const langDir = path.resolve(__dirname, '../../', lang);
    const gdSrc = path.join(langDir, 'gd.json');
    if (fs.existsSync(gdSrc)) {
      fs.copyFileSync(gdSrc, path.join(dataDir, `gd-${lang}.json`));
    }
    const gamesSrc = path.join(langDir, 'quizGames.json');
    if (fs.existsSync(gamesSrc)) {
      fs.copyFileSync(gamesSrc, path.join(dataDir, `games-${lang}.json`));
    }
  }
  console.log('[data] Translation data files copied to dist/js/data/');
}

// ── CSS copy ────────────────────────────────────────────────────────────

function copyCss() {
  const cssDir = path.resolve(__dirname, '../css');
  const destDir = path.join(DIST_DIR, 'css');
  ensureDir(destDir);

  if (fs.existsSync(cssDir)) {
    for (const file of fs.readdirSync(cssDir)) {
      if (file.endsWith('.css')) {
        fs.copyFileSync(path.join(cssDir, file), path.join(destDir, file));
      }
    }
  }
  console.log('[css] CSS files copied to dist/css/');
}

// ── JS copy ─────────────────────────────────────────────────────────────

function copyJs() {
  const jsDir = path.resolve(__dirname, '../js');
  const destDir = path.join(DIST_DIR, 'js');
  ensureDir(destDir);

  if (fs.existsSync(jsDir)) {
    copyDirRecursive(jsDir, destDir);
  }
  console.log('[js] JS files copied to dist/js/');
}

// ── Main ────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Quiz Couple Static Site Generator ===\n');

  // Clean dist
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true });
  }
  ensureDir(DIST_DIR);

  // Copy static assets, CSS, JS, translation data
  copyStaticAssets();
  copyCss();
  copyJs();
  copyTranslationData();
  generateSitemaps();

  // Generate all pages
  const results = [];
  const routeKeys = Object.keys(ROUTE_SLUGS);

  console.log(`\n[generate] Generating ${routeKeys.length} routes × ${LANGUAGES.length} languages = ${routeKeys.length * LANGUAGES.length} pages...\n`);

  for (const routeKey of routeKeys) {
    for (const lang of LANGUAGES) {
      const result = await generatePage(routeKey, lang);
      if (result) {
        results.push(result);
        const status = result.success ? '✓' : '✗';
        if (!result.success) {
          console.log(`  ${status} ${result.route} — ${result.error}`);
        }
      }
    }
  }

  // Summary
  const success = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  console.log(`\n=== Build complete: ${success} pages generated, ${failed} failed ===`);

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch(e => {
  console.error('Build failed:', e);
  process.exit(1);
});
