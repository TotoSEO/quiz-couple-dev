#!/usr/bin/env node
/**
 * Static site generator for annuaire.quiz-couple.com
 * Generates HTML pages from EJS templates + annuaire config data
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ejs from 'ejs';
import { minify } from 'html-minifier-terser';
import {
  ANNUAIRE_BASE_URL, SPECIALTIES, CITIES, MOCK_PROFESSIONALS,
  getSpecialtyById, getCityById, getAnnuaireUrl,
  getProfessionalsBySpecialty, getProfessionalsByCity,
} from './annuaire-config.js';
import { SPECIALTY_CITY_TEMPLATES } from './annuaire-seo-city-content.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.resolve(__dirname, '../templates/annuaire');
const DIST_DIR = path.resolve(__dirname, '../dist/annuaire');

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
  const templatePath = path.join(TEMPLATES_DIR, `pages/${templateName}.ejs`);
  const basePath = path.join(TEMPLATES_DIR, 'base.ejs');

  // Render the page content
  const pageContent = ejs.render(
    fs.readFileSync(templatePath, 'utf8'),
    { ...data, filename: templatePath },
    { filename: templatePath }
  );

  // Render into base layout
  return ejs.render(
    fs.readFileSync(basePath, 'utf8'),
    { ...data, content: pageContent, filename: basePath },
    { filename: basePath }
  );
}

async function writePage(outputPath, html) {
  ensureDir(path.dirname(outputPath));
  const minified = await minifyHtml(html);
  fs.writeFileSync(outputPath, minified, 'utf8');
}

// ── Shared template data ─────────────────────────────────────────────────

let liveProfessionals = null;
let liveGoogleReviews = null;
let liveProReviews = null;

async function fetchGoogleReviews(url, key) {
  try {
    const res = await fetch(`${url}/rest/v1/annuaire_google_reviews?select=*&order=time.desc`, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rows = await res.json();
    console.log(`[annuaire] Fetched ${rows.length} Google reviews from Supabase`);

    // Group by professional_id
    const byPro = {};
    for (const r of rows) {
      if (!byPro[r.professional_id]) byPro[r.professional_id] = [];
      byPro[r.professional_id].push({
        authorName: r.author_name,
        authorPhotoUrl: r.author_photo_url,
        rating: r.rating,
        text: r.text || '',
        relativeTime: r.relative_time_description || '',
        time: r.time,
      });
    }
    return byPro;
  } catch (err) {
    console.warn(`[annuaire] Google reviews fetch failed: ${err.message}`);
    return null;
  }
}

async function fetchProReviews(url, key) {
  try {
    const res = await fetch(`${url}/rest/v1/annuaire_pro_reviews?select=*,annuaire_professionals(first_name,last_name,specialty,city)&is_approved=eq.true&order=created_at.desc`, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rows = await res.json();
    console.log(`[annuaire] Fetched ${rows.length} professional reviews from Supabase`);
    return rows;
  } catch (err) {
    console.warn(`[annuaire] Pro reviews fetch failed: ${err.message}`);
    return [];
  }
}

async function fetchLiveProfessionals() {
  const isCI = process.env.CI || process.env.GITHUB_ACTIONS;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    if (isCI) {
      throw new Error(
        'SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing! ' +
        'Check that these secrets are configured in GitHub repo settings → Secrets → Actions.'
      );
    }
    console.log('[annuaire] No SUPABASE_URL/SERVICE_ROLE_KEY — using mock data (local dev)');
    return null;
  }

  try {
    const res = await fetch(`${url}/rest/v1/annuaire_professionals?is_published=eq.true&select=*`, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status}: ${body}`);
    }
    const rows = await res.json();
    console.log(`[annuaire] Fetched ${rows.length} published professionals from Supabase`);

    if (rows.length === 0) {
      console.warn('[annuaire] WARNING: 0 published professionals found in Supabase — no professional pages will be generated');
    }

    // Map DB columns to template format
    // Also fetch Google reviews + pro reviews
    liveGoogleReviews = await fetchGoogleReviews(url, key);
    liveProReviews = await fetchProReviews(url, key);

    return rows.map(r => ({
      id: r.id,
      firstName: r.first_name,
      lastName: r.last_name,
      slug: r.slug,
      photoUrl: r.photo_url || null,
      specialty: r.specialty,
      city: r.city,
      displayCity: r.display_city || '',
      postalCode: r.postal_code || '',
      shortDescription: r.short_description || '',
      description: r.description || '',
      methods: r.methods || [],
      languages: r.languages || ['Français'],
      yearsExperience: r.years_experience || 0,
      professionalIdNumber: r.professional_id_number || '',
      email: r.email,
      phone: r.phone || '',
      address: r.address || '',
      website: r.website || '',
      priceRange: r.price_range || '',
      lat: r.lat || 0,
      lng: r.lng || 0,
      rating: parseFloat(r.rating) || 0,
      reviewCount: r.review_count || 0,
      availability: r.availability || 'Sur rendez-vous',
      premium: r.plan === 'pro' || r.plan === 'boost',
      plan: r.plan || 'gratuit',
      photos: (() => {
        const photos = r.photos || [];
        // Auto-add video marker for profiles with video but no marker
        if (r.video_url && r.plan === 'boost' && !photos.includes('video')) {
          return ['video', ...photos];
        }
        return photos;
      })(),
      videoUrl: r.video_url || '',
      googlePlaceId: r.google_place_id || null,
      doctolibUrl: r.doctolib_url || '',
      openingHours: r.opening_hours || null,
    }));
  } catch (err) {
    if (isCI) {
      throw new Error(`[annuaire] Supabase fetch FAILED in CI: ${err.message}`);
    }
    console.warn(`[annuaire] Supabase fetch failed: ${err.message} — using mock data`);
    return null;
  }
}

/**
 * Extract department code from a postal code string.
 * Handles metropolitan (2 digits), Corsica (2A/2B), and overseas (3 digits: 971-976).
 */
function getDepartmentFromPostalCode(postalCode) {
  if (!postalCode || typeof postalCode !== 'string') return '';
  const pc = postalCode.trim();
  // Overseas departments: 971xx, 972xx, 973xx, 974xx, 976xx
  if (/^97[1-6]/.test(pc)) return pc.slice(0, 3);
  // Corsica: 20xxx → 2A (south, 200xx-201xx) or 2B (north, 202xx-206xx)
  if (pc.startsWith('20') && pc.length >= 5) {
    const sub = parseInt(pc.slice(0, 3), 10);
    return sub <= 201 ? '2A' : '2B';
  }
  // Metropolitan: first 2 digits
  return pc.slice(0, 2);
}

// Build lookup: department code → array of city IDs in that department
const DEPT_TO_CITIES = {};
for (const city of CITIES) {
  if (!DEPT_TO_CITIES[city.department]) DEPT_TO_CITIES[city.department] = [];
  DEPT_TO_CITIES[city.department].push(city.id);
}

/**
 * Filter professionals for a given city, matching by department.
 * A professional matches if:
 * 1. Their city field matches exactly, OR
 * 2. Their postal code's department matches the city's department
 *    AND their city field is not another known city in our directory
 */
function filterProfessionalsForCity(professionals, city) {
  const dept = city.department;
  const knownCitiesInDept = new Set(DEPT_TO_CITIES[dept] || []);
  return professionals.filter(p => {
    // Exact city match always wins
    if (p.city === city.id) return true;
    // Department-based match: postal code department matches AND
    // the professional's city is not another known city in our directory for this department
    if (p.postalCode) {
      const proDept = getDepartmentFromPostalCode(p.postalCode);
      if (proDept === dept && !knownCitiesInDept.has(p.city)) return true;
    }
    return false;
  });
}

function getSharedData() {
  const professionals = liveProfessionals || MOCK_PROFESSIONALS;
  return {
    specialties: SPECIALTIES,
    cities: CITIES,
    professionals,
    baseUrl: ANNUAIRE_BASE_URL,
  };
}

// ── Page generators ──────────────────────────────────────────────────────

async function generateHomePage() {
  // Prepare pro reviews for homepage (latest 3)
  const proReviews = (liveProReviews || []).slice(0, 3).map(r => ({
    rating: r.rating,
    comment: r.comment || '',
    authorName: r.author_name,
    specialty: r.annuaire_professionals?.specialty || '',
    city: r.annuaire_professionals?.city || '',
    createdAt: r.created_at,
  }));
  const allReviews = liveProReviews || [];
  const proReviewsAvg = allReviews.length > 0
    ? (allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length).toFixed(1)
    : '0';
  const proReviewsCount = allReviews.length;

  const data = {
    ...getSharedData(),
    proReviews,
    proReviewsAvg,
    proReviewsCount,
    metaTitle: 'Annuaire des professionnels du couple en France',
    metaDescription: 'Thérapeutes de couple, sexologues et médiateurs familiaux en France | Trouvez votre spécialiste et prenez rendez-vous près de chez vous.',
    canonical: getAnnuaireUrl('/'),
    currentPage: 'home',
  };

  const html = renderTemplate('home', data);
  await writePage(path.join(DIST_DIR, 'index.html'), html);
  console.log('[annuaire] Generated: / (home)');
}

async function generateDecouvrirPage() {
  const data = {
    ...getSharedData(),
    metaTitle: 'Professionnels du couple : rejoignez l\'annuaire',
    metaDescription: 'Thérapeute, sexologue, médiateur familial ? Créez votre fiche gratuitement. Visibilité locale, zéro commission, contact direct avec vos patients.',
    canonical: getAnnuaireUrl('/decouvrir/'),
    currentPage: 'decouvrir',
  };

  const html = renderTemplate('decouvrir', data);
  await writePage(path.join(DIST_DIR, 'decouvrir/index.html'), html);
  console.log('[annuaire] Generated: /decouvrir/');
}

async function generateRejoindrePage() {
  const data = {
    ...getSharedData(),
    metaTitle: 'Inscrire mon cabinet gratuitement sur l\'annuaire',
    metaDescription: 'Créez votre fiche professionnelle gratuitement en 5 minutes. Visibilité locale, zéro commission, contact direct avec vos futurs patients.',
    canonical: getAnnuaireUrl('/rejoindre/'),
    currentPage: 'rejoindre',
    noindex: true,
  };

  const html = renderTemplate('rejoindre', data);
  await writePage(path.join(DIST_DIR, 'rejoindre/index.html'), html);
  console.log('[annuaire] Generated: /rejoindre/');
}

async function generateDashboardPage() {
  const data = {
    ...getSharedData(),
    metaTitle: 'Mon espace professionnel | Annuaire',
    metaDescription: 'Gérez votre fiche professionnelle, modifiez vos informations et suivez vos statistiques de visibilité.',
    canonical: getAnnuaireUrl('/dashboard/'),
    currentPage: 'dashboard',
    noindex: true,
  };

  const html = renderTemplate('dashboard', data);
  await writePage(path.join(DIST_DIR, 'dashboard/index.html'), html);
  console.log('[annuaire] Generated: /dashboard/');
}

async function generateRecherchePage() {
  const professionals = liveProfessionals || MOCK_PROFESSIONALS;
  const data = {
    ...getSharedData(),
    metaTitle: 'Rechercher un professionnel du couple',
    metaDescription: 'Recherchez un thérapeute de couple, sexologue, médiateur familial ou conseiller conjugal en France. Filtrez par spécialité, ville et mode de consultation.',
    canonical: getAnnuaireUrl('/recherche/'),
    currentPage: 'recherche',
    noindex: true,
    allProfessionals: professionals,
  };

  const html = renderTemplate('recherche', data);
  await writePage(path.join(DIST_DIR, 'recherche/index.html'), html);
  console.log('[annuaire] Generated: /recherche/');
}

async function generateTarifsPage() {
  const data = {
    ...getSharedData(),
    metaTitle: 'Tarifs annuaire couple | Gratuit, Pro et Boost',
    metaDescription: 'Fiche gratuite à vie, formule Pro dès 5,99€/mois, programme Boost pour une visibilité maximale. Découvrez nos offres pour professionnels.',
    canonical: getAnnuaireUrl('/tarifs/'),
    currentPage: 'tarifs',
  };

  const html = renderTemplate('tarifs', data);
  await writePage(path.join(DIST_DIR, 'tarifs/index.html'), html);
  console.log('[annuaire] Generated: /tarifs/');
}

async function generateMentionsLegalesPage() {
  const data = {
    ...getSharedData(),
    metaTitle: 'Mentions légales | Annuaire Quiz Couple',
    metaDescription: 'Mentions légales du site annuaire.quiz-couple.com : éditeur, hébergeur, propriété intellectuelle, responsabilité.',
    canonical: getAnnuaireUrl('/mentions-legales/'),
    currentPage: 'mentions-legales',
    noindex: true,
  };

  const html = renderTemplate('mentions-legales', data);
  await writePage(path.join(DIST_DIR, 'mentions-legales/index.html'), html);
  console.log('[annuaire] Generated: /mentions-legales/');
}

async function generateConfidentialitePage() {
  const data = {
    ...getSharedData(),
    metaTitle: 'Politique de confidentialité | Annuaire Quiz Couple',
    metaDescription: 'Politique de confidentialité et protection des données personnelles du site annuaire.quiz-couple.com, conforme au RGPD.',
    canonical: getAnnuaireUrl('/confidentialite/'),
    currentPage: 'confidentialite',
    noindex: true,
  };

  const html = renderTemplate('confidentialite', data);
  await writePage(path.join(DIST_DIR, 'confidentialite/index.html'), html);
  console.log('[annuaire] Generated: /confidentialite/');
}

async function generateCgvPage() {
  const data = {
    ...getSharedData(),
    metaTitle: 'Conditions Générales de Vente | Annuaire Quiz Couple',
    metaDescription: 'Conditions générales de vente applicables aux abonnements professionnels sur annuaire.quiz-couple.com.',
    canonical: getAnnuaireUrl('/cgv/'),
    currentPage: 'cgv',
    noindex: true,
  };

  const html = renderTemplate('cgv', data);
  await writePage(path.join(DIST_DIR, 'cgv/index.html'), html);
  console.log('[annuaire] Generated: /cgv/');
}

// ── Dynamic page generators ──────────────────────────────────────────────

async function generateSpecialtyPages() {
  const shared = getSharedData();
  for (const specialty of SPECIALTIES) {
    const filteredProfessionals = shared.professionals.filter(p => p.specialty === specialty.id);
    const data = {
      ...shared,
      specialty,
      filteredProfessionals,
      metaTitle: specialty.metaTitle,
      metaDescription: specialty.metaDescription,
      canonical: getAnnuaireUrl(`/${specialty.id}/`),
      currentPage: 'specialty',
    };

    const html = renderTemplate('specialty', data);
    await writePage(path.join(DIST_DIR, `${specialty.id}/index.html`), html);
    console.log(`[annuaire] Generated: /${specialty.id}/ (${filteredProfessionals.length} pros)`);
  }
}

async function generateCityPages() {
  const shared = getSharedData();
  for (const city of CITIES) {
    const filteredProfessionals = filterProfessionalsForCity(shared.professionals, city);
    const data = {
      ...shared,
      city,
      filteredProfessionals,
      metaTitle: `Professionnels du couple à ${city.name} (${city.department})`,
      metaDescription: `Thérapeutes de couple, sexologues et médiateurs familiaux à ${city.name} | Trouvez votre spécialiste et prenez rendez-vous dès maintenant.`,
      canonical: getAnnuaireUrl(`/${city.id}/`),
      currentPage: 'city',
    };

    const html = renderTemplate('city', data);
    await writePage(path.join(DIST_DIR, `${city.id}/index.html`), html);
    console.log(`[annuaire] Generated: /${city.id}/ (${filteredProfessionals.length} pros)`);
  }
}

async function generateSpecialtyCityPages() {
  const shared = getSharedData();
  let count = 0;
  for (const specialty of SPECIALTIES) {
    const templates = SPECIALTY_CITY_TEMPLATES[specialty.id] || [];
    for (let i = 0; i < CITIES.length; i++) {
      const city = CITIES[i];
      const cityPros = filterProfessionalsForCity(shared.professionals, city);
      const filteredProfessionals = cityPros.filter(
        p => p.specialty === specialty.id
      );

      // Generate unique SEO content using rotating templates
      let seoContent = null;
      if (templates.length > 0) {
        const templateFn = templates[i % templates.length];
        seoContent = templateFn(city);
      }

      const data = {
        ...shared,
        specialty,
        city,
        filteredProfessionals,
        seoContent,
        metaTitle: `${specialty.name} à ${city.name} | Profils vérifiés`,
        metaDescription: filteredProfessionals.length > 0
          ? `${specialty.name} à ${city.name} : ${filteredProfessionals.length} professionnel${filteredProfessionals.length > 1 ? 's' : ''} référencé${filteredProfessionals.length > 1 ? 's' : ''}. Consultez les profils et prenez rendez-vous.`
          : `${specialty.name} à ${city.name} : trouvez un spécialiste qualifié près de chez vous. Tarifs, avis et prise de rendez-vous en ligne.`,
        canonical: getAnnuaireUrl(`/${specialty.id}/${city.id}/`),
        currentPage: 'specialty-city',
      };

      const html = renderTemplate('specialty-city', data);
      await writePage(path.join(DIST_DIR, `${specialty.id}/${city.id}/index.html`), html);
      count++;
    }
  }
  console.log(`[annuaire] Generated: ${count} specialty×city pages`);
}

async function generateAdminPage() {
  const data = {
    ...getSharedData(),
    metaTitle: 'Administration Annuaire',
    metaDescription: 'Espace d\'administration de l\'annuaire des professionnels du couple.',
    canonical: getAnnuaireUrl('/admin/'),
    currentPage: 'admin',
    noindex: true,
  };

  const html = renderTemplate('admin', data);
  await writePage(path.join(DIST_DIR, 'admin/index.html'), html);
  console.log('[annuaire] Generated: /admin/');
}

async function generate404Page() {
  const data = {
    ...getSharedData(),
    metaTitle: 'Page introuvable | Annuaire',
    metaDescription: 'La page que vous cherchez n\'existe pas.',
    canonical: getAnnuaireUrl('/'),
    currentPage: '404',
    noindex: true,
  };

  const html = renderTemplate('404', data);
  await writePage(path.join(DIST_DIR, '404.html'), html);
  console.log('[annuaire] Generated: /404.html');
}

async function generateProfessionalPages() {
  const professionals = liveProfessionals || MOCK_PROFESSIONALS;
  for (const pro of professionals) {
    const proSpec = getSpecialtyById(pro.specialty);
    const proCity = getCityById(pro.city);
    const proPath = `${pro.specialty}/${pro.city}/${pro.slug}`;
    // Get Google reviews for this professional
    const googleReviews = (liveGoogleReviews && liveGoogleReviews[pro.id]) || [];

    const data = {
      ...getSharedData(),
      pro,
      proSpec,
      proCity,
      googleReviews,
      metaTitle: `${pro.firstName} ${pro.lastName}, ${proSpec ? proSpec.name : ''} à ${pro.displayCity || (proCity ? proCity.name : '')}`,
      metaDescription: pro.shortDescription || `${pro.firstName} ${pro.lastName}, ${proSpec ? proSpec.name.toLowerCase() : ''} à ${pro.displayCity || (proCity ? proCity.name : '')} | ${pro.yearsExperience} ans d'expérience, ${pro.priceRange}. Prenez rendez-vous en ligne.`,
      canonical: getAnnuaireUrl(`/${proPath}/`),
      currentPage: 'professionnel',
    };

    const html = renderTemplate('professionnel', data);
    await writePage(path.join(DIST_DIR, `${proPath}/index.html`), html);
    console.log(`[annuaire] Generated: /${proPath}/`);
  }
}

// ── CSS Minification ────────────────────────────────────────────────────

function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')       // Remove comments
    .replace(/\s+/g, ' ')                    // Collapse whitespace
    .replace(/\s*\{\s*/g, '{')               // Remove spaces around {
    .replace(/\s*\}\s*/g, '}')               // Remove spaces around }
    .replace(/\s*:\s*/g, ':')                // Remove spaces around :
    .replace(/\s*;\s*/g, ';')                // Remove spaces around ;
    .replace(/\s*,\s*/g, ',')                // Remove spaces around ,
    .trim();
}

// ── Copy static assets ──────────────────────────────────────────────────

function copyAssets() {
  // CSS — read, minify, then write
  const cssDir = path.join(DIST_DIR, 'css');
  ensureDir(cssDir);
  const cssSrc = path.resolve(__dirname, '../css/annuaire.css');
  if (fs.existsSync(cssSrc)) {
    const rawCss = fs.readFileSync(cssSrc, 'utf8');
    const minified = minifyCss(rawCss);
    fs.writeFileSync(path.join(cssDir, 'annuaire.css'), minified, 'utf8');
    console.log(`[annuaire] Minified & wrote: /css/annuaire.css (${rawCss.length} → ${minified.length} bytes)`);
  }

  // JS
  const jsDir = path.join(DIST_DIR, 'js');
  ensureDir(jsDir);
  const jsSrc = path.resolve(__dirname, '../js/annuaire.js');
  if (fs.existsSync(jsSrc)) {
    fs.copyFileSync(jsSrc, path.join(jsDir, 'annuaire.js'));
    console.log('[annuaire] Copied: /js/annuaire.js');
  }
  const jsRejoindreSrc = path.resolve(__dirname, '../js/annuaire-rejoindre.js');
  if (fs.existsSync(jsRejoindreSrc)) {
    fs.copyFileSync(jsRejoindreSrc, path.join(jsDir, 'annuaire-rejoindre.js'));
    console.log('[annuaire] Copied: /js/annuaire-rejoindre.js');
  }
  const jsDashboardSrc = path.resolve(__dirname, '../js/annuaire-dashboard.js');
  if (fs.existsSync(jsDashboardSrc)) {
    fs.copyFileSync(jsDashboardSrc, path.join(jsDir, 'annuaire-dashboard.js'));
    console.log('[annuaire] Copied: /js/annuaire-dashboard.js');
  }
  const jsAdminSrc = path.resolve(__dirname, '../js/annuaire-admin.js');
  if (fs.existsSync(jsAdminSrc)) {
    fs.copyFileSync(jsAdminSrc, path.join(jsDir, 'annuaire-admin.js'));
    console.log('[annuaire] Copied: /js/annuaire-admin.js');
  }

  // IndexNow key file (needed for annuaire.quiz-couple.com domain verification)
  const indexNowKey = path.resolve(__dirname, '../dist/f4b78b7e6bfeaefe7290b5ce249449a8.txt');
  const indexNowKeySrc = path.resolve(__dirname, '../f4b78b7e6bfeaefe7290b5ce249449a8.txt');
  const keySource = fs.existsSync(indexNowKey) ? indexNowKey : (fs.existsSync(indexNowKeySrc) ? indexNowKeySrc : null);
  if (keySource) {
    fs.copyFileSync(keySource, path.join(DIST_DIR, 'f4b78b7e6bfeaefe7290b5ce249449a8.txt'));
    console.log('[annuaire] Copied: IndexNow key file');
  }

  // Assets (images, logo, etc.)
  const assetsSrcDir = path.resolve(__dirname, '../annuaire/assets');
  if (fs.existsSync(assetsSrcDir)) {
    const assetsDistDir = path.join(DIST_DIR, 'assets');
    ensureDir(assetsDistDir);
    for (const file of fs.readdirSync(assetsSrcDir)) {
      fs.copyFileSync(path.join(assetsSrcDir, file), path.join(assetsDistDir, file));
      console.log(`[annuaire] Copied: /assets/${file}`);
    }
  }
}

// ── Sitemap ──────────────────────────────────────────────────────────────

function generateSitemap() {
  const professionals = liveProfessionals || MOCK_PROFESSIONALS;
  const today = new Date().toISOString().split('T')[0];

  const urls = [];

  // Helper to add a URL entry
  const addUrl = (loc, changefreq, priority) => {
    urls.push(`  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`);
  };

  // Home page
  addUrl(getAnnuaireUrl('/'), 'daily', '1.0');

  // Specialty pages (6)
  for (const specialty of SPECIALTIES) {
    addUrl(getAnnuaireUrl(`/${specialty.id}/`), 'weekly', '0.9');
  }

  // City pages
  for (const city of CITIES) {
    addUrl(getAnnuaireUrl(`/${city.id}/`), 'weekly', '0.8');
  }

  // Specialty x City pages
  for (const specialty of SPECIALTIES) {
    for (const city of CITIES) {
      addUrl(getAnnuaireUrl(`/${specialty.id}/${city.id}/`), 'weekly', '0.7');
    }
  }

  // Professional pages
  for (const pro of professionals) {
    const proPath = `${pro.specialty}/${pro.city}/${pro.slug}`;
    addUrl(getAnnuaireUrl(`/${proPath}/`), 'weekly', '0.6');
  }

  // Static pages (decouvrir, tarifs, rejoindre)
  addUrl(getAnnuaireUrl('/decouvrir/'), 'monthly', '0.5');
  addUrl(getAnnuaireUrl('/tarifs/'), 'monthly', '0.5');
  addUrl(getAnnuaireUrl('/rejoindre/'), 'monthly', '0.5');

  // Search page
  addUrl(getAnnuaireUrl('/recherche/'), 'weekly', '0.5');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;

  fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), xml, 'utf8');
  console.log(`[annuaire] Generated: /sitemap.xml (${urls.length} URLs)`);

  // Generate robots.txt
  const robotsTxt = `User-agent: *\nAllow: /\nDisallow: /dashboard/\nDisallow: /admin/\n\nSitemap: ${ANNUAIRE_BASE_URL}/sitemap.xml\n`;
  fs.writeFileSync(path.join(DIST_DIR, 'robots.txt'), robotsTxt, 'utf8');
  console.log('[annuaire] Generated: /robots.txt');
}

// ── Redirects (301 for deleted professionals) ───────────────────────────

async function fetchRedirects() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return [];

  try {
    const res = await fetch(`${url}/rest/v1/annuaire_redirects?select=from_path,to_path`, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rows = await res.json();
    console.log(`[annuaire] Fetched ${rows.length} redirects from Supabase`);
    return rows;
  } catch (err) {
    console.warn(`[annuaire] Redirects fetch failed: ${err.message} — skipping`);
    return [];
  }
}

function generateRedirectsFile(redirects) {
  if (redirects.length === 0) return;

  const lines = redirects.map(r => `${r.from_path} ${r.to_path} 301`);
  const content = lines.join('\n') + '\n';

  fs.writeFileSync(path.join(DIST_DIR, '_redirects'), content, 'utf8');
  console.log(`[annuaire] Generated: /_redirects (${redirects.length} rules)`);
}

// ── Main ─────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🏗️  Building annuaire.quiz-couple.com...\n');
  const start = Date.now();

  // Clean dist/annuaire/ completely to remove stale pages (deleted profiles, etc.)
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true });
    console.log('[annuaire] Cleaned dist/annuaire/');
  }

  ensureDir(DIST_DIR);
  copyAssets();

  // Try to fetch live data from Supabase
  liveProfessionals = await fetchLiveProfessionals();

  await generateHomePage();
  await generateDecouvrirPage();
  await generateRejoindrePage();
  await generateRecherchePage();
  await generateTarifsPage();
  await generateDashboardPage();
  await generateAdminPage();
  await generateMentionsLegalesPage();
  await generateConfidentialitePage();
  await generateCgvPage();
  await generate404Page();
  await generateSpecialtyPages();
  await generateCityPages();
  await generateSpecialtyCityPages();
  await generateProfessionalPages();

  // Generate sitemap.xml
  generateSitemap();

  // Generate _redirects for Cloudflare Pages (301 for deleted professionals)
  const redirects = await fetchRedirects();
  generateRedirectsFile(redirects);

  const elapsed = ((Date.now() - start) / 1000).toFixed(2);
  console.log(`\n✅ Annuaire build complete in ${elapsed}s`);
  console.log(`   Output: ${DIST_DIR}`);
}

main().catch(err => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});
