#!/usr/bin/env node
/**
 * Injects detailed sign-by-sign compatibility data (score + explanation)
 * into all 60 zodiac blog articles (12 signs × 5 languages).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// French keys used in all JSON files
const SIGNS_FR = ['belier','taureau','gemeaux','cancer','lion','vierge','balance','scorpion','sagittaire','capricorne','verseau','poissons'];

// Localized sign display names
const SIGN_NAMES = {
  fr: { belier:'Bélier', taureau:'Taureau', gemeaux:'Gémeaux', cancer:'Cancer', lion:'Lion', vierge:'Vierge', balance:'Balance', scorpion:'Scorpion', sagittaire:'Sagittaire', capricorne:'Capricorne', verseau:'Verseau', poissons:'Poissons' },
  en: { belier:'Aries', taureau:'Taurus', gemeaux:'Gemini', cancer:'Cancer', lion:'Leo', vierge:'Virgo', balance:'Libra', scorpion:'Scorpio', sagittaire:'Sagittarius', capricorne:'Capricorn', verseau:'Aquarius', poissons:'Pisces' },
  es: { belier:'Aries', taureau:'Tauro', gemeaux:'Géminis', cancer:'Cáncer', lion:'Leo', vierge:'Virgo', balance:'Libra', scorpion:'Escorpio', sagittaire:'Sagitario', capricorne:'Capricornio', verseau:'Acuario', poissons:'Piscis' },
  de: { belier:'Widder', taureau:'Stier', gemeaux:'Zwillinge', cancer:'Krebs', lion:'Löwe', vierge:'Jungfrau', balance:'Waage', scorpion:'Skorpion', sagittaire:'Schütze', capricorne:'Steinbock', verseau:'Wassermann', poissons:'Fische' },
  it: { belier:'Ariete', taureau:'Toro', gemeaux:'Gemelli', cancer:'Cancro', lion:'Leone', vierge:'Vergine', balance:'Bilancia', scorpion:'Scorpione', sagittaire:'Sagittario', capricorne:'Capricorno', verseau:'Acquario', poissons:'Pesci' },
};

// Section titles per language
const SECTION_TITLES = {
  fr: 'Compatibilité signe par signe',
  en: 'Sign-by-sign compatibility',
  es: 'Compatibilidad signo por signo',
  de: 'Kompatibilität Zeichen für Zeichen',
  it: 'Compatibilità segno per segno',
};

// Score color based on value
function getScoreColor(score) {
  if (score >= 8) return { bg: '#ecfdf5', border: '#6ee7b7', text: '#065f46', label: '#059669' };
  if (score >= 6) return { bg: '#fffbeb', border: '#fcd34d', text: '#78350f', label: '#d97706' };
  if (score >= 4) return { bg: '#fff7ed', border: '#fdba74', text: '#7c2d12', label: '#ea580c' };
  return { bg: '#fef2f2', border: '#fca5a5', text: '#7f1d1d', label: '#dc2626' };
}

function generateCompatibilityHTML(signKey, lang, zodiacData) {
  const signName = SIGN_NAMES[lang][signKey];
  let html = '';

  for (const otherSign of SIGNS_FR) {
    const otherName = SIGN_NAMES[lang][otherSign];
    // Try both key orders
    const key1 = `${signKey}_${otherSign}`;
    const key2 = `${otherSign}_${signKey}`;
    const data = zodiacData[key1] || zodiacData[key2];

    if (!data) {
      console.warn(`  Missing data for ${key1} / ${key2} in ${lang}`);
      continue;
    }

    const score = data.score;
    const text = data.text.replace(/`/g, '\\`').replace(/"/g, '&quot;');
    const colors = getScoreColor(score);

    // Build stars
    const fullStars = Math.floor(score / 2);
    const halfStar = score % 2 === 1;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    let starsHtml = '';
    for (let i = 0; i < fullStars; i++) starsHtml += '<svg width="16" height="16" viewBox="0 0 24 24" fill="' + colors.label + '" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
    if (halfStar) starsHtml += '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="' + colors.label + '" stroke-width="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/><clipPath id="half"><rect x="0" y="0" width="12" height="24"/></clipPath><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="' + colors.label + '" clip-path="url(#half)"/></svg>';
    for (let i = 0; i < emptyStars; i++) starsHtml += '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="' + colors.label + '" stroke-width="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';

    html += `
<div style="border:1px solid ${colors.border};border-radius:12px;padding:1.25rem 1.5rem;background:${colors.bg};margin-bottom:1rem;">
<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.5rem;margin-bottom:0.75rem;">
<div style="display:flex;align-items:center;gap:0.75rem;">
<span style="display:inline-flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:50%;background:white;border:2px solid ${colors.border};font-size:1.15rem;font-weight:800;color:${colors.label};">${score}<span style="font-size:0.7rem;font-weight:600;">/10</span></span>
<strong style="font-size:1.1rem;color:${colors.text};">${signName} + ${otherName}</strong>
</div>
<div style="display:flex;align-items:center;gap:2px;">${starsHtml}</div>
</div>
<p style="margin:0;color:#4b5563;font-size:0.95rem;line-height:1.65;">${text}</p>
</div>`;
  }

  return html;
}

function injectIntoArticle(filePath, signKey, lang, zodiacData) {
  let content = fs.readFileSync(filePath, 'utf-8');

  const sectionTitle = SECTION_TITLES[lang];
  const sectionId = 'compatibilite-signe-par-signe';

  // Check if already injected
  if (content.includes(sectionId)) {
    console.log(`  [skip] ${filePath} — already has detailed section`);
    return false;
  }

  const compatHTML = generateCompatibilityHTML(signKey, lang, zodiacData);

  // Build the new section object as a string
  const newSection = `    {
      id: '${sectionId}',
      title: \`${sectionTitle}\`,
      content: \`${compatHTML}\`,
    },`;

  // Insert before the "discover more" section (last section)
  // Find the last section pattern (decouvrez-aussi, discover-more, descubre-mas, mehr-entdecken, scopri-di-piu)
  const discoverPatterns = ['decouvrez-aussi', 'discover-more', 'descubre-mas', 'mehr-entdecken', 'scopri-di-piu'];
  let insertPoint = -1;

  for (const pattern of discoverPatterns) {
    const idx = content.indexOf(`id: '${pattern}'`);
    if (idx !== -1) {
      // Find the opening { of this section object
      const searchArea = content.substring(0, idx);
      const lastBrace = searchArea.lastIndexOf('{');
      // Find the 4-space indent before the brace
      const lineStart = searchArea.lastIndexOf('\n', lastBrace) + 1;
      insertPoint = lineStart;
      break;
    }
  }

  if (insertPoint === -1) {
    console.warn(`  [warn] ${filePath} — could not find discover-more section`);
    return false;
  }

  content = content.substring(0, insertPoint) + newSection + '\n' + content.substring(insertPoint);

  fs.writeFileSync(filePath, content, 'utf-8');
  return true;
}

// Main
const LANGS = ['fr', 'en', 'es', 'de', 'it'];
let totalUpdated = 0;

for (const lang of LANGS) {
  console.log(`\n=== Processing ${lang.toUpperCase()} ===`);

  // Load zodiac data
  const dataFile = path.join(ROOT, 'static-site/build', `zodiac-data-${lang}.json`);
  if (!fs.existsSync(dataFile)) {
    console.warn(`  Missing zodiac data for ${lang}, skipping`);
    continue;
  }
  const zodiacData = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));

  for (const signKey of SIGNS_FR) {
    const filePath = path.join(ROOT, 'data/blog', lang, `compatibilite-amoureuse-${signKey}.ts`);
    if (!fs.existsSync(filePath)) {
      console.warn(`  Missing article file: ${filePath}`);
      continue;
    }

    const updated = injectIntoArticle(filePath, signKey, lang, zodiacData);
    if (updated) {
      console.log(`  [ok] ${lang}/compatibilite-amoureuse-${signKey}.ts`);
      totalUpdated++;
    }
  }
}

console.log(`\n=== Done: ${totalUpdated} files updated ===`);
