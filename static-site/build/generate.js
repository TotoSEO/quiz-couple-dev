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
import CleanCSS from 'clean-css';
import {
  BASE_URL, LANGUAGES, LOCALES, ROUTE_SLUGS, ROUTE_CONFIG, GA_ID,
  SUPABASE_URL, SUPABASE_ANON_KEY, BLOG_ARTICLES, BLOG_CATEGORIES, AUTHORS,
  getLocalizedPath, getLocalizedUrl, getRouteAlternates, escapeHtml,
  getArticlePath, getArticleUrl, getArticleAlternates,
} from './config.js';
import { createT, createTgd, loadTranslations } from './i18n.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.resolve(__dirname, '../templates');
const DIST_DIR = path.resolve(__dirname, '../dist');

// Review stats fetched from Supabase at build time
let reviewStats = { avg: '0', count: '0' };

// Article SEO overrides fetched from Supabase at build time
// Map: "internalSlug-lang" → { title, metaTitle, metaDescription, featuredImageAlt, excerpt }
let articleOverrides = {};

async function fetchReviewStats() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/reviews?select=rating&is_approved=eq.true`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const reviews = await res.json();
    if (reviews.length === 0) return;
    const sum = reviews.reduce((s, r) => s + (r.rating || 0), 0);
    const avg = (sum / reviews.length).toFixed(1);
    reviewStats = { avg, count: String(reviews.length) };
    console.log(`[reviews] Fetched ${reviews.length} approved reviews (avg: ${avg})`);
  } catch (e) {
    console.warn(`[reviews] Could not fetch review stats: ${e.message} — using defaults`);
  }
}

async function fetchArticleOverrides() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/blog_articles?select=internal_slug,status,featured_image_url,blog_article_translations(lang,slug,title,meta_title,meta_description,featured_image_alt,excerpt)&status=eq.published`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const articles = await res.json();
    let count = 0;
    for (const art of articles) {
      const translations = art.blog_article_translations || [];
      for (const tr of translations) {
        // Only override if there's actual content (not empty defaults)
        if (tr.title || tr.meta_title || tr.meta_description) {
          const key = `${art.internal_slug}-${tr.lang}`;
          articleOverrides[key] = {
            title: tr.title || undefined,
            metaTitle: tr.meta_title || undefined,
            metaDescription: tr.meta_description || undefined,
            featuredImageAlt: tr.featured_image_alt || undefined,
            excerpt: tr.excerpt || undefined,
            slug: tr.slug || undefined,
            featuredImage: art.featured_image_url || undefined,
          };
          count++;
        }
      }
    }
    console.log(`[blog] Fetched ${count} article translation overrides from Supabase (${articles.length} articles)`);
  } catch (e) {
    console.warn(`[blog] Could not fetch article overrides from Supabase: ${e.message} — using TS files only`);
  }
}

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
  const tgd = createTgd(lang);
  const translations = loadTranslations(lang);
  const pagePath = getLocalizedPath(routeKey, lang);
  if (pagePath === null) return; // Route not available in this language

  const noindexRoutes = ['legalMentions', 'privacy', 'admin', 'ebookConfirm'];
  const isNoindex = noindexRoutes.includes(routeKey);
  const alternates = isNoindex ? [] : getRouteAlternates(routeKey).filter(alt => alt.href);
  const canonical = getLocalizedUrl(routeKey, lang);

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
  } else if (routeKey === 'about') {
    const aboutMeta = {
      fr: { title: 'Qui sommes-nous ? L\'équipe derrière Quiz Couple', description: 'Lucie et Mathieu Courtin, co-fondateurs de Quiz Couple. Pourquoi on a créé ce site, ce qu\'on y met, et comment on travaille — sans langue de bois.' },
      en: { title: 'About Us - The Team Behind Quiz Couple', description: 'Lucie and Mathieu Courtin, co-founders of Quiz Couple. Why we created this site, what we put into it, and how we work — no sugarcoating.' },
      es: { title: 'Quiénes somos - El equipo detrás de Quiz Couple', description: 'Lucie y Mathieu Courtin, cofundadores de Quiz Couple. Por qué creamos este sitio, qué ponemos en él y cómo trabajamos — sin rodeos.' },
      de: { title: 'Über uns - Das Team hinter Quiz Couple', description: 'Lucie und Mathieu Courtin, Mitgründer von Quiz Couple. Warum wir diese Seite erstellt haben, was wir hineinlegen und wie wir arbeiten — ohne Beschönigung.' },
      it: { title: 'Chi siamo - Il team dietro Quiz Couple', description: 'Lucie e Mathieu Courtin, co-fondatori di Quiz Couple. Perché abbiamo creato questo sito, cosa ci mettiamo e come lavoriamo — senza giri di parole.' },
    };
    title = aboutMeta[lang]?.title || aboutMeta.fr.title;
    description = aboutMeta[lang]?.description || aboutMeta.fr.description;
  } else if (routeKey === 'sitemap') {
    const sitemapMeta = {
      fr: { title: 'Plan du site | Quiz Couple', description: 'Plan du site Quiz Couple — retrouvez toutes les pages, tests, quiz et articles du blog.' },
      en: { title: 'Sitemap | Quiz Couple', description: 'Quiz Couple sitemap — find all pages, tests, quizzes and blog articles.' },
      es: { title: 'Mapa del sitio | Quiz Couple', description: 'Mapa del sitio Quiz Couple — encuentra todas las páginas, tests, quiz y artículos del blog.' },
      de: { title: 'Seitenverzeichnis | Quiz Couple', description: 'Quiz Couple Seitenverzeichnis — finde alle Seiten, Tests, Quiz und Blog-Artikel.' },
      it: { title: 'Mappa del sito | Quiz Couple', description: 'Mappa del sito Quiz Couple — trova tutte le pagine, test, quiz e articoli del blog.' },
    };
    title = sitemapMeta[lang]?.title || sitemapMeta.fr.title;
    description = sitemapMeta[lang]?.description || sitemapMeta.fr.description;
  } else if (routeKey === 'admin') {
    title = 'Administration - Quiz Couple';
    description = 'Panel d\'administration Quiz Couple';
  } else {
    // Quiz/test pages - get from quizzes.json
    title = t(`quizzes:${routeKey}.title`, 'Quiz Couple');
    description = t(`quizzes:${routeKey}.metaDescription`, '');
  }

  // Build JSON-LD structured data
  const breadcrumbLabels = {
    fr: { home: 'Quiz Couple', tests: 'Tests', quiz: 'Quiz', blog: 'Blog' },
    en: { home: 'Quiz Couple', tests: 'Tests', quiz: 'Quizzes', blog: 'Blog' },
    es: { home: 'Quiz Couple', tests: 'Tests', quiz: 'Quiz', blog: 'Blog' },
    de: { home: 'Quiz Couple', tests: 'Tests', quiz: 'Quiz', blog: 'Blog' },
    it: { home: 'Quiz Couple', tests: 'Test', quiz: 'Quiz', blog: 'Blog' },
  };
  const bl = breadcrumbLabels[lang] || breadcrumbLabels.fr;

  const jsonLdItems = [];

  // BreadcrumbList – all pages except home and admin
  if (routeKey !== 'home' && routeKey !== 'admin') {
    const breadcrumbList = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: bl.home, item: getLocalizedUrl('home', lang) },
      ],
    };
    if (routeKey === 'blog') {
      breadcrumbList.itemListElement.push({ '@type': 'ListItem', position: 2, name: bl.blog, item: canonical });
    } else {
      breadcrumbList.itemListElement.push({ '@type': 'ListItem', position: 2, name: title, item: canonical });
    }
    jsonLdItems.push(breadcrumbList);
  }

  // Organization + WebSite schemas for homepage
  if (routeKey === 'home') {
    jsonLdItems.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Quiz Couple',
      url: BASE_URL,
      description: description,
      publisher: { '@type': 'Organization', '@id': `${BASE_URL}/#organization` },
    });
    jsonLdItems.push({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
      name: 'Quiz Couple',
      url: BASE_URL,
      logo: { '@type': 'ImageObject', url: `${BASE_URL}/apple-touch-icon.png`, width: 180, height: 180 },
      image: `${BASE_URL}/og-image.webp`,
      description: description,
      sameAs: [],
    });
    // AggregateRating — only include if we have real review data
    const webApp = {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Quiz Couple',
      url: BASE_URL,
      applicationCategory: 'LifestyleApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    };
    if (parseInt(reviewStats.count) > 0) {
      webApp.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: reviewStats.avg,
        reviewCount: reviewStats.count,
        bestRating: '5',
        worstRating: '1',
      };
    }
    jsonLdItems.push(webApp);
  }

  const jsonLdHtml = jsonLdItems.map(item =>
    `<script type="application/ld+json">${JSON.stringify(item)}</script>`
  ).join('\n  ');

  // For blog listing and home page, load article summaries
  let blogArticlesList = [];
  if (routeKey === 'blog' || routeKey === 'home' || routeKey === 'sitemap') {
    for (const articleMeta of BLOG_ARTICLES) {
      // Skip frOnly articles for non-FR languages
      if (articleMeta.frOnly && lang !== 'fr') continue;
      const localizedSlug = articleMeta.slugs[lang] || articleMeta.internalSlug;
      const tsPath = path.resolve(__dirname, '../../data/blog', lang, `${articleMeta.internalSlug}.ts`);
      const frPath = path.resolve(__dirname, '../../data/blog/fr', `${articleMeta.internalSlug}.ts`);
      let article = parseArticleTs(tsPath);
      if (!article) article = parseArticleTs(frPath);
      if (article) {
        // Apply Supabase overrides for listing too
        const oKey = `${articleMeta.internalSlug}-${lang}`;
        const oData = articleOverrides[oKey];
        blogArticlesList.push({
          slug: localizedSlug,
          title: (oData && oData.title) || article.title,
          excerpt: (oData && oData.excerpt) || article.excerpt || '',
          featuredImage: (oData && oData.featuredImage) || article.featuredImage || '/placeholder.svg',
          featuredImageAlt: (oData && oData.featuredImageAlt) || article.featuredImageAlt || article.title,
          publishedAt: article.publishedAt || articleMeta.publishedAt,
          url: getArticlePath(localizedSlug, lang),
          category: articleMeta.category || null,
          categoryLabel: articleMeta.category && BLOG_CATEGORIES[articleMeta.category] ? BLOG_CATEGORIES[articleMeta.category][lang] || BLOG_CATEGORIES[articleMeta.category].fr : null,
        });
      }
    }
    // Sort by date descending
    blogArticlesList.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }

  // Build visual breadcrumb items for specific page types
  const breadcrumbs = [];
  if (routeKey.startsWith('test') || routeKey.startsWith('quiz') || routeKey === 'questionsCouple' || routeKey === 'problemResolver' || routeKey === 'activities') {
    breadcrumbs.push({ name: bl.home, url: getLocalizedPath('home', lang) });
    breadcrumbs.push({ name: title });
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
    noindex: isNoindex ? (routeKey === 'admin' ? 'noindex, nofollow' : 'noindex, follow') : false,
    ogImage: `${BASE_URL}/og-image.webp`,
    // Navigation/routing
    routeKey,
    pagePath,
    routeSlugs: ROUTE_SLUGS,
    languages: LANGUAGES,
    // Translation function
    t,
    tgd,
    translations,
    // Helpers
    getLocalizedUrl,
    getLocalizedPath,
    escapeHtml,
    JSON,
    // Structured data
    jsonLdHtml,
    // Breadcrumb items for visual rendering
    breadcrumbs,
    // Blog listing data
    blogArticlesList,
    // Blog categories for filter tabs
    blogCategories: Object.entries(BLOG_CATEGORIES).map(([key, labels]) => ({
      key,
      label: labels[lang] || labels.fr,
    })),
    // Zodiac compatibility data for astro-prenoms page (per-language)
    zodiacDataJson: routeKey === 'testAstroPrenoms' ? (() => {
      const langFile = path.resolve(__dirname, `zodiac-data-${lang}.json`);
      const defaultFile = path.resolve(__dirname, 'zodiac-data.json');
      return fs.existsSync(langFile) ? fs.readFileSync(langFile, 'utf-8') : fs.readFileSync(defaultFile, 'utf-8');
    })() : '{}',
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
  const B = BASE_URL;

  // Build URL helper: returns full URL for a route slug in a given language
  function url(lang, slug) {
    if (lang === 'fr') return slug ? `${B}/${slug}/` : `${B}/`;
    return slug ? `${B}/${lang}/${slug}/` : `${B}/${lang}/`;
  }

  // Build blog URL helper
  function blogUrl(lang, slug) {
    if (lang === 'fr') return `${B}/blog/${slug}/`;
    return `${B}/${lang}/blog/${slug}/`;
  }

  // Generate hreflang links block for a set of localized URLs
  function hreflangs(urlsByLang) {
    let xml = '';
    for (const lang of LANGUAGES) {
      xml += `    <xhtml:link rel="alternate" hreflang="${lang}" href="${urlsByLang[lang]}"/>\n`;
    }
    xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${urlsByLang.fr}"/>\n`;
    return xml;
  }

  // Collect all page entries (routes + blog articles)
  const entries = [];
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // Static routes
  for (const [key, slugs] of Object.entries(ROUTE_SLUGS)) {
    // Skip noindex pages, admin, and frOnly routes without proper multilang support
    if (['admin', 'legalMentions', 'privacy', 'sitemap', 'ebookConfirm'].includes(key)) continue;

    // Build URL map for available languages
    const urlsByLang = {};
    for (const lang of LANGUAGES) {
      if (slugs[lang] !== undefined) {
        urlsByLang[lang] = url(lang, slugs[lang]);
      }
    }
    // Skip routes with no valid URLs
    if (Object.keys(urlsByLang).length === 0) continue;
    // Mark as frOnly if only FR is available
    const isFrOnly = Object.keys(urlsByLang).length === 1 && urlsByLang.fr;

    // Assign priority and changefreq based on page type
    let priority = '0.7';
    let changefreq = 'weekly';
    if (key === 'home') { priority = '1.0'; changefreq = 'daily'; }
    else if (key === 'blog') { priority = '0.8'; changefreq = 'daily'; }
    else if (key === 'contact' || key === 'about') { priority = '0.4'; changefreq = 'monthly'; }
    else if (key === 'activities') { priority = '0.6'; changefreq = 'weekly'; }

    entries.push({ urlsByLang, lastmod: today, priority, changefreq, frOnly: isFrOnly || false });
  }

  // Blog articles
  for (const article of BLOG_ARTICLES) {
    if (article.frOnly) {
      // frOnly articles: only appear in FR sitemap, no hreflang alternates
      entries.push({ urlsByLang: { fr: blogUrl('fr', article.slugs.fr) }, lastmod: article.publishedAt, frOnly: true, priority: '0.6', changefreq: 'monthly' });
    } else {
      const urlsByLang = {};
      for (const lang of LANGUAGES) {
        urlsByLang[lang] = blogUrl(lang, article.slugs[lang]);
      }
      entries.push({ urlsByLang, lastmod: article.publishedAt, priority: '0.6', changefreq: 'monthly' });
    }
  }

  // Generate one sitemap per language
  for (const lang of LANGUAGES) {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
    xml += `        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;

    for (const entry of entries) {
      // Skip frOnly entries for non-FR sitemaps
      if (entry.frOnly && lang !== 'fr') continue;
      // Skip entries that don't have a URL for this language
      if (!entry.urlsByLang[lang]) continue;
      xml += `  <url>\n`;
      xml += `    <loc>${entry.urlsByLang[lang]}</loc>\n`;
      if (!entry.frOnly) {
        xml += hreflangs(entry.urlsByLang);
      }
      if (entry.lastmod) {
        xml += `    <lastmod>${entry.lastmod}</lastmod>\n`;
      }
      if (entry.changefreq) {
        xml += `    <changefreq>${entry.changefreq}</changefreq>\n`;
      }
      if (entry.priority) {
        xml += `    <priority>${entry.priority}</priority>\n`;
      }
      xml += `  </url>\n`;
    }

    xml += `</urlset>`;
    fs.writeFileSync(path.join(DIST_DIR, `sitemap-${lang}.xml`), xml);
  }

  // Sitemap index
  let index = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  index += `<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n`;
  index += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  for (const lang of LANGUAGES) {
    index += `  <sitemap>\n    <loc>${B}/sitemap-${lang}.xml</loc>\n  </sitemap>\n`;
  }
  index += `</sitemapindex>`;
  fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), index);

  console.log(`[sitemaps] Generated sitemap index + ${LANGUAGES.length} language sitemaps (${entries.length} URLs each)`);
}

// ── Static assets ───────────────────────────────────────────────────────

function copyStaticAssets() {
  const publicDir = path.resolve(__dirname, '../../public');
  const assetsDir = path.resolve(__dirname, '../../assets');

  // Copy public/ files
  const publicFiles = ['favicon.ico', 'favicon.png', 'apple-touch-icon.png', 'og-image.webp', 'robots.txt', 'site.webmanifest', 'placeholder.svg', 'sitemap.xsl', 'f4b78b7e6bfeaefe7290b5ce249449a8.txt'];
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

  // Quiz JSON files that contain question data under a 'q' key
  // Map: gd namespace → quiz JSON filename
  const quizQuestionSources = {
    ado: 'quiz-ado.json',
  };

  for (const lang of LANGUAGES) {
    const langDir = path.resolve(__dirname, '../../', lang);

    // Load base gd.json
    const gdSrc = path.join(langDir, 'gd.json');
    let gdData = {};
    if (fs.existsSync(gdSrc)) {
      gdData = JSON.parse(fs.readFileSync(gdSrc, 'utf-8'));
    }

    // Merge quiz question data from quiz-specific JSON files
    for (const [namespace, fileName] of Object.entries(quizQuestionSources)) {
      const quizSrc = path.join(langDir, fileName);
      if (fs.existsSync(quizSrc)) {
        try {
          const quizData = JSON.parse(fs.readFileSync(quizSrc, 'utf-8'));
          if (quizData.q && typeof quizData.q === 'object') {
            // Flatten q.1 → ado.q1, q.1a → ado.q1a, etc.
            const flat = {};
            for (const [key, value] of Object.entries(quizData.q)) {
              flat['q' + key] = value;
            }
            // Map results: r1.title → r1_t, r1.text → r1_d, r1.advice → r1_a
            if (quizData.results) {
              for (const [key, value] of Object.entries(quizData.results)) {
                if (typeof value === 'object' && value !== null && value.title) {
                  flat[key + '_t'] = value.title;
                  flat[key + '_d'] = value.text || '';
                  flat[key + '_a'] = value.advice || '';
                }
              }
            }
            gdData[namespace] = flat;
          }
        } catch (e) {
          console.warn(`[data] Failed to merge ${fileName} for ${lang}: ${e.message}`);
        }
      }
    }

    fs.writeFileSync(path.join(dataDir, `gd-${lang}.json`), JSON.stringify(gdData), 'utf-8');

    const gamesSrc = path.join(langDir, 'quizGames.json');
    if (fs.existsSync(gamesSrc)) {
      fs.copyFileSync(gamesSrc, path.join(dataDir, `games-${lang}.json`));
    }

    const activitiesSrc = path.join(langDir, 'activities.json');
    if (fs.existsSync(activitiesSrc)) {
      fs.copyFileSync(activitiesSrc, path.join(dataDir, `activities-${lang}.json`));
    }
  }
  console.log('[data] Translation data files copied to dist/js/data/');
}

// ── CSS copy ────────────────────────────────────────────────────────────

function copyCss() {
  const cssDir = path.resolve(__dirname, '../css');
  const destDir = path.join(DIST_DIR, 'css');
  ensureDir(destDir);

  const cleanCss = new CleanCSS({ level: 2 });

  if (fs.existsSync(cssDir)) {
    for (const file of fs.readdirSync(cssDir)) {
      if (file.endsWith('.css')) {
        const src = fs.readFileSync(path.join(cssDir, file), 'utf-8');
        const result = cleanCss.minify(src);
        if (result.errors && result.errors.length > 0) {
          console.warn(`[css] Minify errors for ${file}:`, result.errors);
          fs.copyFileSync(path.join(cssDir, file), path.join(destDir, file));
        } else {
          const savings = ((1 - result.styles.length / src.length) * 100).toFixed(0);
          fs.writeFileSync(path.join(destDir, file), result.styles, 'utf-8');
          console.log(`[css] ${file}: ${(src.length / 1024).toFixed(1)}KB → ${(result.styles.length / 1024).toFixed(1)}KB (${savings}% smaller)`);
        }
      }
    }
  }
  console.log('[css] CSS files minified to dist/css/');
}

// ── JS copy ─────────────────────────────────────────────────────────────

function buildSeedArticles() {
  const langs = ['fr', 'en', 'es', 'de', 'it'];
  const seed = [];

  for (const meta of BLOG_ARTICLES) {
    const entry = {
      internal_slug: meta.internalSlug,
      featured_image_url: '',
      author_id: 'mathieu-courtin',
      status: 'published',
      published_at: meta.publishedAt,
      translations: [],
    };

    // Read FR article to get author_id and featured_image_url
    const frData = parseArticleTs(path.resolve(__dirname, '../../data/blog/fr', `${meta.internalSlug}.ts`));
    if (frData) {
      // Only set featured_image_url if the TS file has a real value;
      // empty string would cause the seed to overwrite admin-uploaded images
      if (frData.featuredImage) entry.featured_image_url = frData.featuredImage;
      if (frData.author && frData.author.id) entry.author_id = frData.author.id;
    }

    for (const lang of langs) {
      const tsPath = path.resolve(__dirname, '../../data/blog', lang, `${meta.internalSlug}.ts`);
      const data = parseArticleTs(tsPath);
      if (data) {
        entry.translations.push({
          lang,
          slug: meta.slugs[lang] || meta.internalSlug,
          title: data.title || '',
          meta_title: data.metaTitle || '',
          meta_description: data.metaDescription || '',
          featured_image_alt: data.featuredImageAlt || '',
          excerpt: data.excerpt || '',
        });
      }
    }

    seed.push(entry);
  }

  return JSON.stringify(seed);
}

function copyJs() {
  const jsDir = path.resolve(__dirname, '../js');
  const destDir = path.join(DIST_DIR, 'js');
  ensureDir(destDir);

  if (fs.existsSync(jsDir)) {
    copyDirRecursive(jsDir, destDir);
  }

  // Inject SEED_ARTICLES into admin.js at build time
  const adminJsPath = path.join(destDir, 'admin.js');
  if (fs.existsSync(adminJsPath)) {
    let content = fs.readFileSync(adminJsPath, 'utf-8');
    if (content.includes('/*__SEED_ARTICLES__*/')) {
      const seedJson = buildSeedArticles();
      content = content.replace(/\/\*__SEED_ARTICLES__\*\/\[[\s\S]*?\n  \];/, seedJson + ';');
      fs.writeFileSync(adminJsPath, content, 'utf-8');
      console.log(`[js] Injected ${BLOG_ARTICLES.length} articles into admin.js SEED_ARTICLES`);
    }
  }

  console.log('[js] JS files copied to dist/js/');
}

// ── Blog article parsing ─────────────────────────────────────────────────

function parseArticleTs(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    // Extract the object between "const article... = {" and the final "};"
    const match = content.match(/const article[^=]*=\s*(\{[\s\S]*\});\s*$/m);
    if (!match) return null;

    let objStr = match[1];
    // Replace AUTHORS references with inline objects
    objStr = objStr.replace(/AUTHORS\['mathieu-courtin'\]/g, JSON.stringify(AUTHORS['mathieu-courtin']));
    objStr = objStr.replace(/AUTHORS\['lucie-courtin'\]/g, JSON.stringify(AUTHORS['lucie-courtin']));
    // Remove TypeScript type annotations
    objStr = objStr.replace(/as const/g, '');

    // Use eval to parse (safe here - build-time only, our own files)
    const fn = new Function('return (' + objStr + ')');
    return fn();
  } catch (e) {
    console.warn(`[blog] Failed to parse ${filePath}: ${e.message}`);
    return null;
  }
}

async function generateBlogArticle(articleMeta, lang) {
  const tsPath = path.resolve(__dirname, '../../data/blog', lang, `${articleMeta.internalSlug}.ts`);
  const frPath = path.resolve(__dirname, '../../data/blog/fr', `${articleMeta.internalSlug}.ts`);

  let article = parseArticleTs(tsPath);
  if (!article) article = parseArticleTs(frPath); // fallback to French
  if (!article) {
    console.warn(`[blog] No article data for ${articleMeta.internalSlug} (${lang})`);
    return null;
  }

  // Apply Supabase overrides for SEO fields (admin edits take priority)
  const overrideKey = `${articleMeta.internalSlug}-${lang}`;
  const override = articleOverrides[overrideKey];
  if (override) {
    if (override.title) article.title = override.title;
    if (override.metaTitle) article.metaTitle = override.metaTitle;
    if (override.metaDescription) article.metaDescription = override.metaDescription;
    if (override.featuredImageAlt) article.featuredImageAlt = override.featuredImageAlt;
    if (override.excerpt) article.excerpt = override.excerpt;
    if (override.featuredImage) article.featuredImage = override.featuredImage;
  }

  const localizedSlug = articleMeta.slugs[lang] || articleMeta.internalSlug;
  const t = createT(lang);
  const translations = loadTranslations(lang);
  const articleAlternates = articleMeta.frOnly ? [] : getArticleAlternates(articleMeta);
  const canonical = getArticleUrl(localizedSlug, lang);
  const pagePath = getArticlePath(localizedSlug, lang);

  // Resolve author bio for this language
  const authorData = article.author || {};
  const authorBio = authorData.bios?.[lang] || authorData.bios?.fr || '';

  // JSON-LD for article
  const breadcrumbLabels = {
    fr: { home: 'Quiz Couple', blog: 'Blog' },
    en: { home: 'Quiz Couple', blog: 'Blog' },
    es: { home: 'Quiz Couple', blog: 'Blog' },
    de: { home: 'Quiz Couple', blog: 'Blog' },
    it: { home: 'Quiz Couple', blog: 'Blog' },
  };
  const bl = breadcrumbLabels[lang] || breadcrumbLabels.fr;

  const jsonLdItems = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: bl.home, item: getLocalizedUrl('home', lang) },
        { '@type': 'ListItem', position: 2, name: bl.blog, item: getLocalizedUrl('blog', lang) },
        { '@type': 'ListItem', position: 3, name: article.title, item: canonical },
      ],
    },
    (() => {
      // Compute word count from all article text
      let text = (article.introduction || '') + ' ' + (article.sections || []).map(s =>
        (s.content || '') + ' ' + (s.subsections || []).map(sub => sub.content || '').join(' ')
      ).join(' ');
      const wc = text.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length;
      const schemaType = articleMeta.frOnly ? 'NewsArticle' : 'Article';
      return {
        '@context': 'https://schema.org',
        '@type': schemaType,
        headline: article.metaTitle || article.title,
        description: article.metaDescription || article.excerpt,
        image: article.featuredImage
          ? (article.featuredImage.startsWith('http') ? article.featuredImage : `${BASE_URL}${article.featuredImage}`)
          : `${BASE_URL}/og-image.webp`,
        datePublished: article.publishedAt,
        dateModified: article.modifiedAt || article.publishedAt,
        inLanguage: lang,
        wordCount: wc,
        author: {
          '@type': 'Person',
          name: authorData.name || 'Quiz Couple',
          url: getLocalizedUrl('about', lang) || `${BASE_URL}/qui-sommes-nous/`,
        },
        publisher: {
          '@type': 'Organization',
          name: 'Quiz Couple',
          url: BASE_URL,
          logo: { '@type': 'ImageObject', url: `${BASE_URL}/apple-touch-icon.png`, width: 180, height: 180 },
        },
        mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
      };
    })(),
  ];

  const jsonLdHtml = jsonLdItems.map(item =>
    `<script type="application/ld+json">${JSON.stringify(item)}</script>`
  ).join('\n  ');

  const title = article.metaTitle || article.title;
  const description = article.metaDescription || article.excerpt || '';

  const data = {
    lang,
    locale: LOCALES[lang],
    baseUrl: BASE_URL,
    gaId: GA_ID,
    supabaseUrl: SUPABASE_URL,
    supabaseKey: SUPABASE_ANON_KEY,
    title: escapeHtml(title),
    rawTitle: title,
    description: escapeHtml(description),
    rawDescription: description,
    canonical,
    alternates: articleAlternates,
    ogImage: article.featuredImage
      ? (article.featuredImage.startsWith('http') ? article.featuredImage : `${BASE_URL}${article.featuredImage}`)
      : `${BASE_URL}/og-image.webp`,
    ogType: 'article',
    articlePublishedTime: article.publishedAt,
    articleModifiedTime: article.modifiedAt || article.publishedAt,
    articleAuthor: authorData.name || 'Quiz Couple',
    routeKey: 'blog',
    pagePath,
    routeSlugs: ROUTE_SLUGS,
    languages: LANGUAGES,
    t,
    translations,
    getLocalizedUrl,
    getLocalizedPath,
    escapeHtml,
    JSON,
    jsonLdHtml,
    // Article-specific
    article,
    authorBio,
    articleAlternates,
    // Category
    articleCategory: articleMeta.category || null,
    articleCategoryLabel: articleMeta.category && BLOG_CATEGORIES[articleMeta.category] ? BLOG_CATEGORIES[articleMeta.category][lang] || BLOG_CATEGORIES[articleMeta.category].fr : null,
    // Sidebar data
    sidebarTests: [
      'testCouple', 'testCommonPoints', 'testDistance', 'testToxic',
      'testCoupleSain', 'testMariage', 'testDivorce', 'testParentalite', 'testAstroPrenoms',
      'testJalousie', 'testLangageAmour', 'testAttachement', 'testConfiance',
    ].map(k => ({ label: t(`quizzes:${k}.shortTitle`, t(`quizzes:${k}.title`, k)), url: getLocalizedUrl(k, lang) })).filter(item => item.url),
    sidebarQuizzes: [
      'quizAmoureux', 'quizCoquin', 'quizMarrant', 'quizKnowledge',
      'quizMost', 'quizAdo', 'quizGenant', 'quizTuPreferes',
    ].map(k => ({ label: t(`quizzes:${k}.shortTitle`, t(`quizzes:${k}.title`, k)), url: getLocalizedUrl(k, lang) })),
    sidebarOther: [
      'questionsCouple', 'problemResolver',
    ].map(k => ({ label: t(`quizzes:${k}.shortTitle`, t(`quizzes:${k}.title`, k)), url: getLocalizedUrl(k, lang) })),
    sidebarArticles: BLOG_ARTICLES
      .filter(a => a.internalSlug !== articleMeta.internalSlug && !(a.frOnly && lang !== 'fr'))
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 5)
      .map(a => {
        const slug = a.slugs[lang] || a.internalSlug;
        const aPath = path.resolve(__dirname, '../../data/blog', lang, `${a.internalSlug}.ts`);
        const aFr = path.resolve(__dirname, '../../data/blog/fr', `${a.internalSlug}.ts`);
        const aData = parseArticleTs(aPath) || parseArticleTs(aFr);
        return { title: aData?.title || a.internalSlug, url: getArticleUrl(slug, lang) };
      }),
  };

  try {
    const pageHtml = await renderTemplate('pages/blog-article', data);
    const fullHtml = await renderTemplate('base', { ...data, content: pageHtml });
    const minified = await minifyHtml(fullHtml);
    const outputPath = path.join(DIST_DIR, pagePath, 'index.html');
    ensureDir(path.dirname(outputPath));
    fs.writeFileSync(outputPath, minified, 'utf-8');
    return { route: pagePath, success: true };
  } catch (e) {
    console.error(`[blog] Error generating ${articleMeta.internalSlug} (${lang}): ${e.message}`);
    if (e.stack) console.error(e.stack.split('\n').slice(0, 5).join('\n'));
    return { route: pagePath, success: false, error: e.message };
  }
}

// ── 404 page generation ──────────────────────────────────────────────────

async function generate404Pages() {
  console.log('\n[404] Generating 404 pages...');
  // Generate a 404 page per language; root 404.html uses FR (default)
  for (const lang of LANGUAGES) {
    const t = createT(lang);
    const tgd = createTgd(lang);
    const translations = loadTranslations(lang);

    const title404 = {
      fr: 'Page introuvable - Quiz Couple',
      en: 'Page not found - Quiz Couple',
      es: 'Página no encontrada - Quiz Couple',
      de: 'Seite nicht gefunden - Quiz Couple',
      it: 'Pagina non trovata - Quiz Couple',
    };
    const desc404 = {
      fr: 'La page que vous cherchez n\'existe pas.',
      en: 'The page you\'re looking for doesn\'t exist.',
      es: 'La página que buscas no existe.',
      de: 'Die Seite, die du suchst, existiert nicht.',
      it: 'La pagina che cerchi non esiste.',
    };

    const canonical = lang === 'fr' ? `${BASE_URL}/` : `${BASE_URL}/${lang}/`;
    const alternates = LANGUAGES.map(l => ({
      hreflang: l,
      href: l === 'fr' ? `${BASE_URL}/` : `${BASE_URL}/${l}/`,
    }));
    alternates.push({ hreflang: 'x-default', href: `${BASE_URL}/` });

    const data = {
      lang,
      locale: LOCALES[lang],
      baseUrl: BASE_URL,
      gaId: GA_ID,
      supabaseUrl: SUPABASE_URL,
      supabaseKey: SUPABASE_ANON_KEY,
      title: title404[lang] || title404.fr,
      rawTitle: title404[lang] || title404.fr,
      description: desc404[lang] || desc404.fr,
      rawDescription: desc404[lang] || desc404.fr,
      canonical,
      alternates: [],
      noindex: 'noindex, follow',
      ogImage: `${BASE_URL}/og-image.webp`,
      routeKey: '404',
      pagePath: '/404',
      routeSlugs: ROUTE_SLUGS,
      languages: LANGUAGES,
      t,
      tgd,
      translations,
      getLocalizedUrl,
      getLocalizedPath,
      escapeHtml,
      JSON,
      jsonLdHtml: '',
    };

    try {
      const pageHtml = await renderTemplate('pages/404', data);
      const fullHtml = await renderTemplate('base', { ...data, content: pageHtml });
      const minified = await minifyHtml(fullHtml);

      // Root 404.html (FR) + language-specific ones
      if (lang === 'fr') {
        fs.writeFileSync(path.join(DIST_DIR, '404.html'), minified, 'utf-8');
      }
      const langDir = lang === 'fr' ? DIST_DIR : path.join(DIST_DIR, lang);
      ensureDir(langDir);
      fs.writeFileSync(path.join(langDir, '404.html'), minified, 'utf-8');
    } catch (e) {
      console.error(`[404] Error generating 404 (${lang}): ${e.message}`);
    }
  }
  console.log('[404] 404 pages generated for all languages');
}

// ── Main ────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Quiz Couple Static Site Generator ===\n');

  // Fetch real review stats from Supabase
  await fetchReviewStats();

  // Fetch article SEO overrides from Supabase (admin edits)
  await fetchArticleOverrides();

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

  // Generate blog articles
  console.log(`\n[blog] Generating ${BLOG_ARTICLES.length} articles × ${LANGUAGES.length} languages...\n`);
  for (const articleMeta of BLOG_ARTICLES) {
    const articleLangs = articleMeta.frOnly ? ['fr'] : LANGUAGES;
    for (const lang of articleLangs) {
      const result = await generateBlogArticle(articleMeta, lang);
      if (result) {
        results.push(result);
        const status = result.success ? '✓' : '✗';
        if (!result.success) {
          console.log(`  ${status} ${result.route} — ${result.error}`);
        }
      }
    }
  }

  // Generate 404 pages
  await generate404Pages();

  // Generate redirect pages for old URLs
  const REDIRECTS = [
    { from: 'de/test-gesunde-beziehung', to: '/de/gesunde-beziehung-test/' },
    { from: 'de/quiz-paar-pikant', to: '/de/pikantes-paar-quiz/' },
    { from: 'de/liebes-quiz-paare', to: '/de/liebes-quiz/' },
    { from: 'es/privacidad', to: '/es/politica-privacidad/' },
    { from: 'it/test-cose-in-comune-coppia', to: '/it/test-punti-comuni-coppia/' },
    { from: 'es/test-pareja', to: '/es/test-compatibilidad-pareja/' },
    { from: 'de/gemeinsamkeiten-test-paar', to: '/de/gemeinsamkeiten-test-paare/' },
    { from: 'en/love-quiz-couples', to: '/en/love-quiz/' },
    { from: 'de/beziehungsproblem-loesen', to: '/de/paar-problem-loesen/' },
    { from: 'it/test-coppia', to: '/it/test-compatibilita-coppia/' },
    { from: 'es/test-cosas-en-comun-pareja', to: '/es/test-puntos-comunes-pareja/' },
    { from: 'en/privacy', to: '/en/privacy-policy/' },
    { from: 'de/beziehungstest', to: '/de/paar-kompatibilitaetstest/' },
    { from: 'de/quiz-wer-kennt-partner-besser', to: '/de/wer-kennt-partner-besser-quiz/' },
  ];
  for (const { from, to } of REDIRECTS) {
    const redirectDir = path.join(DIST_DIR, from);
    ensureDir(redirectDir);
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta http-equiv="refresh" content="0;url=${to}"><link rel="canonical" href="${BASE_URL}${to}"><title>Redirecting...</title></head><body><p>Redirecting to <a href="${to}">${to}</a></p></body></html>`;
    fs.writeFileSync(path.join(redirectDir, 'index.html'), html);
    console.log(`[redirect] ${from} → ${to}`);
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
