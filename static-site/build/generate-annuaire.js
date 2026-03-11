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
}

// ── Main ─────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🏗️  Building annuaire.quiz-couple.com...\n');
  const start = Date.now();

  ensureDir(DIST_DIR);
  copyAssets();

  await generateHomePage();
  await generateDecouvrirPage();

  const elapsed = ((Date.now() - start) / 1000).toFixed(2);
  console.log(`\n✅ Annuaire build complete in ${elapsed}s`);
  console.log(`   Output: ${DIST_DIR}`);
}

main().catch(err => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});
