import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from "url";
import { componentTagger } from "lovable-tagger";
import { minify } from "html-minifier-terser";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Base routes (French)
const baseRoutes = [
  "",
  "tester-son-couple",
  "test-points-communs-couples",
  "quiz-amoureux",
  "quiz-couple-coquin",
  "quiz-couple-marrant",
  "quiz-couple-distance",
  "test-couple-toxique",
  "test-couple-sain",
  "quiz-qui-connait-mieux-partenaire",
  "quiz-qui-est-le-plus",
  "questions-couple",
  "resoudre-probleme-couple",
  "mentions-legales",
  "confidentialite",
  "blog",
  "test-couple-mariage",
  "test-dois-je-divorcer",
  "quiz-couple-ado",
];

// English slugs
const enRoutes = [
  "",
  "couple-compatibility-test",
  "couple-common-points-test",
  "love-quiz",
  "spicy-couple-quiz",
  "funny-couple-quiz",
  "long-distance-relationship-quiz",
  "toxic-relationship-test",
  "healthy-relationship-test",
  "who-knows-partner-best-quiz",
  "who-is-most-likely-quiz",
  "couple-questions",
  "solve-couple-problem",
  "legal-notice",
  "privacy-policy",
  "blog",
  "marriage-compatibility-test",
  "should-i-divorce-test",
  "teen-couple-quiz",
];

// Spanish slugs
const esRoutes = [
  "",
  "test-compatibilidad-pareja",
  "test-puntos-comunes-pareja",
  "quiz-enamorados",
  "quiz-pareja-picante",
  "quiz-pareja-divertido",
  "quiz-pareja-distancia",
  "test-relacion-toxica",
  "test-relacion-sana",
  "quiz-quien-conoce-mejor-pareja",
  "quiz-quien-es-mas",
  "preguntas-pareja",
  "resolver-problema-pareja",
  "aviso-legal",
  "politica-privacidad",
  "blog",
  "test-compatibilidad-matrimonio",
  "test-debo-divorciarme",
  "quiz-pareja-adolescentes",
];

// German slugs
const deRoutes = [
  "",
  "paar-kompatibilitaetstest",
  "gemeinsamkeiten-test-paare",
  "liebes-quiz",
  "pikantes-paar-quiz",
  "lustiges-paar-quiz",
  "fernbeziehung-quiz",
  "toxische-beziehung-test",
  "gesunde-beziehung-test",
  "wer-kennt-partner-besser-quiz",
  "wer-ist-am-meisten-quiz",
  "fragen-fuer-paare",
  "paar-problem-loesen",
  "impressum",
  "datenschutz",
  "blog",
  "ehe-kompatibilitaetstest",
  "scheidungstest",
  "teenager-paar-quiz",
];

// Italian slugs
const itRoutes = [
  "",
  "test-compatibilita-coppia",
  "test-punti-comuni-coppia",
  "quiz-innamorati",
  "quiz-coppia-piccante",
  "quiz-coppia-divertente",
  "quiz-coppia-distanza",
  "test-relazione-tossica",
  "test-relazione-sana",
  "quiz-chi-conosce-meglio-partner",
  "quiz-chi-e-piu",
  "domande-coppia",
  "risolvere-problema-coppia",
  "note-legali",
  "privacy",
  "blog",
  "test-compatibilita-matrimonio",
  "test-devo-divorziare",
  "quiz-coppia-adolescenti",
];

// Build all routes to generate static pages for
const routesToPrerender = [
  ...baseRoutes.map(r => r ? `/${r}` : '/'),
  ...enRoutes.map(r => r ? `/en/${r}` : '/en'),
  ...esRoutes.map(r => r ? `/es/${r}` : '/es'),
  ...deRoutes.map(r => r ? `/de/${r}` : '/de'),
  ...itRoutes.map(r => r ? `/it/${r}` : '/it'),
];

const BASE_URL = 'https://quiz-couple.com';
const LOCALES: Record<string, string> = { fr: 'fr_FR', en: 'en_US', es: 'es_ES', de: 'de_DE', it: 'it_IT' };

function escapeHtmlAttr(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Fetch published blog articles from the database at build time.
 */
async function fetchBlogArticlesForBuild(): Promise<Array<{
  slug: string; lang: string; meta_title: string; meta_description: string;
  featured_image_url: string; published_at: string;
  all_slugs: Record<string, string>;
}>> {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.warn('[seo-static-pages] Missing Supabase env vars, skipping blog articles.');
    return [];
  }

  try {
    const url = `${supabaseUrl}/rest/v1/blog_article_translations?select=slug,lang,meta_title,meta_description,featured_image_alt,article_id,blog_articles(featured_image_url,status,published_at)&blog_articles.status=eq.published`;
    const res = await fetch(url, {
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
    });
    if (!res.ok) {
      console.warn(`[seo-static-pages] DB fetch failed: ${res.status}`);
      return [];
    }
    const rows = (await res.json()) as any[];

    // Group by article_id to build cross-lang slug maps
    const byArticle = new Map<string, any[]>();
    for (const row of rows) {
      if (!row.blog_articles) continue;
      const list = byArticle.get(row.article_id) || [];
      list.push(row);
      byArticle.set(row.article_id, list);
    }

    const result: any[] = [];
    for (const [, translations] of byArticle) {
      const allSlugs: Record<string, string> = {};
      for (const t of translations) allSlugs[t.lang] = t.slug;

      for (const t of translations) {
        result.push({
          slug: t.slug,
          lang: t.lang,
          meta_title: t.meta_title,
          meta_description: t.meta_description,
          featured_image_url: t.blog_articles?.featured_image_url || '',
          published_at: t.blog_articles?.published_at || '',
          all_slugs: allSlugs,
        });
      }
    }
    return result;
  } catch (e) {
    console.warn('[seo-static-pages] Error fetching blog articles:', e);
    return [];
  }
}

function injectMetaIntoHtml(template: string, meta: {
  title: string; description: string; canonical: string;
  lang: string; locale: string; ogImage?: string;
  alternates: { hreflang: string; href: string }[];
}): string {
  let html = template;
  const safeTitle = escapeHtmlAttr(meta.title);
  const safeDesc = escapeHtmlAttr(meta.description);

  html = html.replace(/<html([^>]*)lang="[^"]*"/, `<html$1lang="${meta.lang}"`);
  if (!html.includes('lang=')) html = html.replace('<html', `<html lang="${meta.lang}"`);
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${safeTitle}</title>`);
  html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${safeDesc}">`);
  html = html.replace(/<link rel="canonical" href="[^"]*" ?\/?>/,  `<link rel="canonical" href="${meta.canonical}" />`);

  // Hreflang
  html = html.replace(/<link rel="alternate" hreflang="[^"]*" href="[^"]*" ?\/?>\s*/g, '');
  const hreflangTags = meta.alternates.map(a => `<link rel="alternate" hreflang="${a.hreflang}" href="${a.href}" />`).join('\n    ');
  html = html.replace(/(<link rel="canonical" href="[^"]*" ?\/>)/, `$1\n    ${hreflangTags}`);

  // OG
  html = html.replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${meta.canonical}">`);
  html = html.replace(/<meta property="og:title" content="[^"]*" ?\/?>/,  `<meta property="og:title" content="${safeTitle}" />`);
  html = html.replace(/<meta property="og:description" content="[^"]*" ?\/?>/,  `<meta property="og:description" content="${safeDesc}" />`);
  html = html.replace(/<meta property="og:locale" content="[^"]*" ?\/?>/,  `<meta property="og:locale" content="${meta.locale}" />`);
  if (meta.ogImage) {
    html = html.replace(/<meta property="og:image" content="[^"]*">/, `<meta property="og:image" content="${escapeHtmlAttr(meta.ogImage)}">`);
    html = html.replace(/<meta name="twitter:image" content="[^"]*">/, `<meta name="twitter:image" content="${escapeHtmlAttr(meta.ogImage)}">`);
  }

  // Twitter
  html = html.replace(/<meta name="twitter:url" content="[^"]*">/, `<meta name="twitter:url" content="${meta.canonical}">`);
  html = html.replace(/<meta name="twitter:title" content="[^"]*" ?\/?>/,  `<meta name="twitter:title" content="${safeTitle}" />`);
  html = html.replace(/<meta name="twitter:description" content="[^"]*" ?\/?>/,  `<meta name="twitter:description" content="${safeDesc}" />`);

  return html;
}

function seoStaticPages() {
  return {
    name: 'seo-static-pages',
    async closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      const templatePath = path.join(distDir, 'index.html');

      if (!fs.existsSync(templatePath)) {
        console.warn('[seo-static-pages] dist/index.html not found, skipping.');
        return;
      }

      const template = fs.readFileSync(templatePath, 'utf-8');
      const { getMetadataForRoute } = await import('./src/seo/route-metadata');

      let totalPages = 0;

      // 1. Static routes (quiz pages, legal, etc.)
      console.log(`[seo-static-pages] Generating ${routesToPrerender.length} static pages...`);
      for (const route of routesToPrerender) {
        const meta = getMetadataForRoute(route);
        let html: string;

        if (meta) {
          html = injectMetaIntoHtml(template, meta);
        } else {
          const lang = route.startsWith('/en') ? 'en'
            : route.startsWith('/es') ? 'es'
            : route.startsWith('/de') ? 'de'
            : route.startsWith('/it') ? 'it'
            : 'fr';
          html = template.replace(/<html([^>]*)lang="[^"]*"/, `<html$1lang="${lang}"`);
        }

        html = await minify(html, {
          collapseWhitespace: true, removeComments: true, minifyCSS: true,
          minifyJS: true, removeRedundantAttributes: true, removeEmptyAttributes: true,
        });

        const filePath = route === '/' ? path.join(distDir, 'index.html') : path.join(distDir, route, 'index.html');
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(filePath, html, 'utf-8');
        totalPages++;
      }

      // 2. Blog articles from database
      const blogArticles = await fetchBlogArticlesForBuild();
      console.log(`[seo-static-pages] Generating ${blogArticles.length} blog article pages from DB...`);

      for (const article of blogArticles) {
        const lang = article.lang;
        const blogPath = lang === 'fr' ? `/blog/${article.slug}` : `/${lang}/blog/${article.slug}`;
        const canonical = `${BASE_URL}${blogPath}`;

        const alternates = Object.entries(article.all_slugs).map(([l, s]) => ({
          hreflang: l,
          href: `${BASE_URL}${l === 'fr' ? `/blog/${s}` : `/${l}/blog/${s}`}`,
        }));
        alternates.push({ hreflang: 'x-default', href: `${BASE_URL}/blog/${article.all_slugs['fr'] || article.slug}` });

        let html = injectMetaIntoHtml(template, {
          title: article.meta_title,
          description: article.meta_description,
          canonical,
          lang,
          locale: LOCALES[lang] || 'fr_FR',
          ogImage: article.featured_image_url || undefined,
          alternates,
        });

        html = await minify(html, {
          collapseWhitespace: true, removeComments: true, minifyCSS: true,
          minifyJS: true, removeRedundantAttributes: true, removeEmptyAttributes: true,
        });

        const filePath = path.join(distDir, blogPath, 'index.html');
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(filePath, html, 'utf-8');
      totalPages++;
      }

      // 3. Auto-generate blog sitemap entries and merge into sitemap files
      await generateBlogSitemaps(distDir, blogArticles);

      console.log(`[seo-static-pages] Done! ${totalPages} total pages generated.`);
    },
  };
}

/**
 * Generate blog entries and merge them into the sitemap XML files in dist.
 * Static route entries are preserved from public/sitemap-*.xml.
 * Blog entries from DB are appended automatically.
 */
async function generateBlogSitemaps(distDir: string, blogArticles: Awaited<ReturnType<typeof fetchBlogArticlesForBuild>>) {
  if (blogArticles.length === 0) return;

  const langs = ['fr', 'en', 'es', 'de', 'it'];
  const langPrefixes: Record<string, string> = { fr: '', en: '/en', es: '/es', de: '/de', it: '/it' };

  // Group articles by article (using all_slugs identity)
  const articleGroups = new Map<string, typeof blogArticles>();
  for (const a of blogArticles) {
    const key = a.all_slugs['fr'] || a.slug;
    const group = articleGroups.get(key) || [];
    group.push(a);
    articleGroups.set(key, group);
  }

  for (const lang of langs) {
    const sitemapPath = path.join(distDir, `sitemap-${lang}.xml`);
    if (!fs.existsSync(sitemapPath)) continue;

    let xml = fs.readFileSync(sitemapPath, 'utf-8');

    // For each article group, check if already in sitemap (by slug), skip if so
    for (const [, group] of articleGroups) {
      const thisLang = group.find(a => a.lang === lang);
      if (!thisLang) continue;

      const locUrl = `${BASE_URL}${langPrefixes[lang]}/blog/${thisLang.slug}`;
      if (xml.includes(locUrl)) continue; // Already present

      const today = new Date().toISOString().split('T')[0];
      let entry = `  <url>\n    <loc>${locUrl}</loc>\n`;
      for (const l of langs) {
        const t = group.find(a => a.lang === l);
        if (t) {
          const href = `${BASE_URL}${langPrefixes[l]}/blog/${t.slug}`;
          entry += `    <xhtml:link rel="alternate" hreflang="${l}" href="${href}"/>\n`;
        }
      }
      const frSlug = group.find(a => a.lang === 'fr')?.slug || thisLang.slug;
      entry += `    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}/blog/${frSlug}"/>\n`;
      entry += `    <lastmod>${today}</lastmod>\n`;
      entry += `    <changefreq>monthly</changefreq>\n`;
      entry += `    <priority>0.7</priority>\n`;
      entry += `  </url>`;

      xml = xml.replace('</urlset>', `${entry}\n</urlset>`);
    }

    fs.writeFileSync(sitemapPath, xml, 'utf-8');
  }

  console.log(`[seo-static-pages] Blog sitemap entries merged for ${articleGroups.size} articles.`);
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    mode === "production" && seoStaticPages(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
