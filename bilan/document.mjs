// Le document HTML complet d'un rapport à imprimer en PDF : le gabarit
// partagé (supabase/functions/_shared/bilan/rapport.mjs), sa feuille de
// style avec les polices en data: URI (rien à aller chercher pendant
// l'impression), les marges A4 et le pied de page dans la langue du rapport.
// La couverture (première page) et les pages d'ouverture de chapitre (page
// nommée `chapitre`, posée par .rap-ouv) n'ont ni marge ni pied de page.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { rapportHtml, styleDePage } from '../supabase/functions/_shared/bilan/rapport.mjs';
import { couperPour } from './cesure.mjs';

const ici = path.dirname(fileURLToPath(import.meta.url));
export const RACINE = path.resolve(ici, '..');
const BILAN = path.join(RACINE, 'supabase', 'functions', '_shared', 'bilan');
const POLICES = path.join(RACINE, 'public', 'fonts', 'bilan');

// Les mentions de l'éditeur, en bas de la dernière page.
export const EDITEUR = 'Quiz Couple · quiz-couple.com · Visibilitea, entreprise individuelle · 4 rue de Bruges, 67000 Strasbourg · SIRET 940 106 800 00011';

const cache = new Map();
export function textes(lang) {
  if (!cache.has(lang)) {
    const lire = (f) => JSON.parse(fs.readFileSync(path.join(RACINE, lang, f), 'utf8'));
    cache.set(lang, { T: lire('bilan.json').app, Q: lire('bilan-questions.json') });
  }
  return cache.get(lang);
}

let cssCache = null;
export function feuilleEnLigne() {
  if (cssCache) return cssCache;
  const css = fs.readFileSync(path.join(BILAN, 'rapport.css'), 'utf8');
  cssCache = css.replace(/url\(\/fonts\/bilan\/([a-z0-9-]+\.woff2)\)/g, (m, nom) => {
    const octets = fs.readFileSync(path.join(POLICES, nom));
    return 'url(data:font/woff2;base64,' + octets.toString('base64') + ')';
  });
  if (/url\(\/fonts\//.test(cssCache)) throw new Error('rapport.css : police introuvable');
  return cssCache;
}

// Les marges du PDF, en millimètres : reprises par le contrôle du PDF.
export const MARGES = { haut: 16, droite: 16, bas: 18, gauche: 16 };

function regleDePage(T) {
  const m = MARGES;
  const pied = 'font-family: "QC Inter", Helvetica, Arial, sans-serif; font-size: 7.5pt; color: #85798b; vertical-align: top; padding-top: 5mm;';
  return `@page { size: A4; margin: ${m.haut}mm ${m.droite}mm ${m.bas}mm ${m.gauche}mm;
  @bottom-left { ${pied} }
  @bottom-right { content: counter(page) " / " counter(pages); ${pied} text-align: right; } }
@page :first { margin: 0; @bottom-left { content: none; } @bottom-right { content: none; } }
@page chapitre { margin: 0; @bottom-left { content: none; } @bottom-right { content: none; } }
${styleDePage(T)}
html, body { margin: 0; padding: 0; background: #fff; }`;
}

// donnees : ce que rend l'action « resultat » (lang, situation, a, b, finiLe).
export function documentPdf(donnees) {
  const lang = donnees.lang || 'fr';
  const { T, Q } = textes(lang);
  const r = rapportHtml(donnees, T, Q, { format: 'pdf', couper: couperPour(lang), editeur: EDITEUR });
  const titre = (T.rapport && T.rapport.surtitre ? T.rapport.surtitre + ' · ' : '') + donnees.a.prenom
    + (donnees.mode === 'solo' ? '' : ' & ' + donnees.b.prenom);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const html = `<!doctype html>
<html lang="${esc(lang)}"><head><meta charset="utf-8"><title>${esc(titre)}</title>
<style>${feuilleEnLigne()}
${regleDePage(T)}</style></head>
<body>${r.html}</body></html>`;
  return { html, analyse: r.analyse, titre };
}
