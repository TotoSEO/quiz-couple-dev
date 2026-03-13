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
    // Also fetch Google reviews
    liveGoogleReviews = await fetchGoogleReviews(url, key);

    return rows.map(r => ({
      id: r.id,
      firstName: r.first_name,
      lastName: r.last_name,
      slug: r.slug,
      photoUrl: r.photo_url || null,
      specialty: r.specialty,
      city: r.city,
      description: r.description || '',
      methods: r.methods || [],
      languages: r.languages || ['Français'],
      yearsExperience: r.years_experience || 0,
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
      googlePlaceId: r.google_place_id || null,
    }));
  } catch (err) {
    if (isCI) {
      throw new Error(`[annuaire] Supabase fetch FAILED in CI: ${err.message}`);
    }
    console.warn(`[annuaire] Supabase fetch failed: ${err.message} — using mock data`);
    return null;
  }
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
  const data = {
    ...getSharedData(),
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
  };

  const html = renderTemplate('rejoindre', data);
  await writePage(path.join(DIST_DIR, 'rejoindre/index.html'), html);
  console.log('[annuaire] Generated: /rejoindre/');
}

async function generateDashboardPage() {
  const data = {
    ...getSharedData(),
    metaTitle: 'Mon espace professionnel — Annuaire',
    metaDescription: 'Gérez votre fiche professionnelle, modifiez vos informations et suivez vos statistiques de visibilité.',
    canonical: getAnnuaireUrl('/dashboard/'),
    currentPage: 'dashboard',
    noindex: true,
  };

  const html = renderTemplate('dashboard', data);
  await writePage(path.join(DIST_DIR, 'dashboard/index.html'), html);
  console.log('[annuaire] Generated: /dashboard/');
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
    const filteredProfessionals = shared.professionals.filter(p => p.city === city.id);
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
      const filteredProfessionals = shared.professionals.filter(
        p => p.specialty === specialty.id && p.city === city.id
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
        metaTitle: `Annuaire des ${specialty.namePlural || specialty.name + 's'} à ${city.name} : Trouvez un spécialiste`,
        metaDescription: `${specialty.name} à ${city.name} — ${filteredProfessionals.length} professionnel${filteredProfessionals.length > 1 ? 's' : ''} référencé${filteredProfessionals.length > 1 ? 's' : ''}. Consultez les profils et prenez rendez-vous.`,
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
    metaTitle: 'Page introuvable — Annuaire',
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
      metaTitle: `${pro.firstName} ${pro.lastName} — ${proSpec ? proSpec.name : ''} à ${proCity ? proCity.name : ''}`,
      metaDescription: `${pro.firstName} ${pro.lastName}, ${proSpec ? proSpec.name.toLowerCase() : ''} à ${proCity ? proCity.name : ''} | ${pro.yearsExperience} ans d'expérience, ${pro.priceRange}. Prenez rendez-vous en ligne.`,
      canonical: getAnnuaireUrl(`/${proPath}/`),
      currentPage: 'professionnel',
    };

    const html = renderTemplate('professionnel', data);
    await writePage(path.join(DIST_DIR, `${proPath}/index.html`), html);
    console.log(`[annuaire] Generated: /${proPath}/`);
  }
}

// ── Copy static assets ──────────────────────────────────────────────────

function copyAssets() {
  // CSS
  const cssDir = path.join(DIST_DIR, 'css');
  ensureDir(cssDir);
  const cssSrc = path.resolve(__dirname, '../css/annuaire.css');
  if (fs.existsSync(cssSrc)) {
    fs.copyFileSync(cssSrc, path.join(cssDir, 'annuaire.css'));
    console.log('[annuaire] Copied: /css/annuaire.css');
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

  ensureDir(DIST_DIR);
  copyAssets();

  // Try to fetch live data from Supabase
  liveProfessionals = await fetchLiveProfessionals();

  await generateHomePage();
  await generateDecouvrirPage();
  await generateRejoindrePage();
  await generateTarifsPage();
  await generateDashboardPage();
  await generateAdminPage();
  await generate404Page();
  await generateSpecialtyPages();
  await generateCityPages();
  await generateSpecialtyCityPages();
  await generateProfessionalPages();

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
