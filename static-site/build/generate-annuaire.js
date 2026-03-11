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

function getSharedData() {
  return {
    specialties: SPECIALTIES,
    cities: CITIES,
    professionals: MOCK_PROFESSIONALS,
    baseUrl: ANNUAIRE_BASE_URL,
  };
}

// ── Page generators ──────────────────────────────────────────────────────

async function generateHomePage() {
  const data = {
    ...getSharedData(),
    metaTitle: 'Annuaire des professionnels du couple en France | Quiz Couple',
    metaDescription: 'Trouvez un thérapeute de couple, sexologue, médiateur familial ou conseiller conjugal près de chez vous. L\'annuaire spécialisé des professionnels du couple.',
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
    metaTitle: 'Professionnels du couple : rejoignez l\'annuaire gratuitement | Quiz Couple',
    metaDescription: 'Thérapeute de couple, sexologue, médiateur familial ? Créez votre fiche gratuitement sur l\'annuaire Quiz Couple. Visibilité locale, zéro commission, contact direct avec vos futurs patients.',
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
    metaTitle: 'Inscrire mon cabinet gratuitement — Annuaire Quiz Couple',
    metaDescription: 'Créez votre fiche professionnelle gratuitement sur l\'annuaire Quiz Couple. Formulaire simple en 5 minutes. Visibilité locale, zéro commission.',
    canonical: getAnnuaireUrl('/rejoindre/'),
    currentPage: 'rejoindre',
  };

  const html = renderTemplate('rejoindre', data);
  await writePage(path.join(DIST_DIR, 'rejoindre/index.html'), html);
  console.log('[annuaire] Generated: /rejoindre/');
}

async function generateTarifsPage() {
  const data = {
    ...getSharedData(),
    metaTitle: 'Tarifs professionnels — Annuaire Quiz Couple | Gratuit, Pro, Boost',
    metaDescription: 'Découvrez nos formules pour les professionnels du couple. Fiche gratuite à vie, formule Professionnel dès 5,99€/mois, programme Boost pour une visibilité maximale.',
    canonical: getAnnuaireUrl('/tarifs/'),
    currentPage: 'tarifs',
  };

  const html = renderTemplate('tarifs', data);
  await writePage(path.join(DIST_DIR, 'tarifs/index.html'), html);
  console.log('[annuaire] Generated: /tarifs/');
}

// ── Dynamic page generators ──────────────────────────────────────────────

async function generateSpecialtyPages() {
  for (const specialty of SPECIALTIES) {
    const filteredProfessionals = getProfessionalsBySpecialty(specialty.id);
    const data = {
      ...getSharedData(),
      specialty,
      filteredProfessionals,
      metaTitle: `${specialty.metaTitle} | Annuaire Quiz Couple`,
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
  for (const city of CITIES) {
    const filteredProfessionals = getProfessionalsByCity(city.id);
    const data = {
      ...getSharedData(),
      city,
      filteredProfessionals,
      metaTitle: `Professionnels du couple à ${city.name} | Annuaire Quiz Couple`,
      metaDescription: `Trouvez un thérapeute de couple, sexologue ou médiateur familial à ${city.name} (${city.department}). ${filteredProfessionals.length} professionnels référencés.`,
      canonical: getAnnuaireUrl(`/${city.id}/`),
      currentPage: 'city',
    };

    const html = renderTemplate('city', data);
    await writePage(path.join(DIST_DIR, `${city.id}/index.html`), html);
    console.log(`[annuaire] Generated: /${city.id}/ (${filteredProfessionals.length} pros)`);
  }
}

async function generateProfessionalPages() {
  for (const pro of MOCK_PROFESSIONALS) {
    const proSpec = getSpecialtyById(pro.specialty);
    const proCity = getCityById(pro.city);
    const data = {
      ...getSharedData(),
      pro,
      proSpec,
      proCity,
      metaTitle: `${pro.firstName} ${pro.lastName} — ${proSpec ? proSpec.name : ''} à ${proCity ? proCity.name : ''} | Annuaire Quiz Couple`,
      metaDescription: `${pro.firstName} ${pro.lastName}, ${proSpec ? proSpec.name.toLowerCase() : ''} à ${proCity ? proCity.name : ''}. ${pro.yearsExperience} ans d'expérience. ${pro.priceRange}. Prenez rendez-vous en ligne.`,
      canonical: getAnnuaireUrl(`/professionnel/${pro.slug}/`),
      currentPage: 'professionnel',
    };

    const html = renderTemplate('professionnel', data);
    await writePage(path.join(DIST_DIR, `professionnel/${pro.slug}/index.html`), html);
    console.log(`[annuaire] Generated: /professionnel/${pro.slug}/`);
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
}

// ── Main ─────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🏗️  Building annuaire.quiz-couple.com...\n');
  const start = Date.now();

  ensureDir(DIST_DIR);
  copyAssets();

  await generateHomePage();
  await generateDecouvrirPage();
  await generateRejoindrePage();
  await generateTarifsPage();
  await generateSpecialtyPages();
  await generateCityPages();
  await generateProfessionalPages();

  const elapsed = ((Date.now() - start) / 1000).toFixed(2);
  console.log(`\n✅ Annuaire build complete in ${elapsed}s`);
  console.log(`   Output: ${DIST_DIR}`);
}

main().catch(err => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});
