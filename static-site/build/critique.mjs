#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════
   LA FEUILLE DE STYLE CRITIQUE, PAGE PAR PAGE

   styles.css pese 395 Ko une fois minifie, et une page n'en utilise
   qu'une petite part : l'accueil en lit 7 Ko sur 70 (compresses). Tant que la
   feuille etait le seul chemin vers le premier rendu, chaque page attendait
   qu'elle soit entierement telechargee et analysee avant d'afficher quoi que
   ce soit. Sur une connexion mobile lente, c'etait plusieurs secondes.

   Ce script ouvre chaque page type dans Chromium, releve la couverture CSS
   (les regles qui ont servi a mettre en page ce qui est a l'ecran, menus
   ouverts et mode sombre compris) et ecrit le resultat dans
   css/critique/<cle>.css. Le generateur met ce fichier en ligne dans le
   <head> et charge styles.css en differe : la page s'affiche des que le HTML
   est la, et la feuille complete arrive derriere, pour les etats que la
   couverture n'a pas vus (survol, ecrans suivants du moteur).

   Une feuille critique perimee n'est pas grave : styles.css corrige tout
   dans la seconde. Mais une regle modifiee dans styles.css n'apparait dans
   le premier rendu qu'apres regeneration, d'ou l'empreinte de styles.css
   inscrite en tete de chaque fichier, que le generateur compare.

   Emploi :  cd static-site && npm run build && npm run critique [cle ...]
   Le site construit doit etre servi sur CRITIQUE_SERVEUR (par defaut
   http://127.0.0.1:8099, par exemple « python3 -m http.server 8099
   --directory dist »). Playwright est cherche dans NODE_PATH ou en local.
   ═══════════════════════════════════════════════════════════════════ */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { ROUTE_CONFIG, BLOG_ARTICLES, getLocalizedPath, getArticlePath } from './config.js';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(__dirname, '..');
const SOURCE_CSS = path.join(RACINE, 'css/styles.css');
const DIST_CSS = path.join(RACINE, 'dist/css/styles.css');
const DOSSIER = path.join(RACINE, 'css/critique');
const SERVEUR = process.env.CRITIQUE_SERVEUR || 'http://127.0.0.1:8099';
const PARALLELE = 3;
// L'administration demande une connexion : sa page publique n'est qu'un
// formulaire, et elle porte sa propre feuille.
const HORS_CHAMP = new Set(['admin']);

// Les quatre passes par page : les deux largeurs qui changent la mise en page
// (le menu mobile d'un cote, les onglets et la colonne laterale de l'autre),
// chacune en clair et en sombre.
const PASSES = [
  { nom: 'mobile clair',  viewport: { width: 412, height: 823 },  theme: 'light' },
  { nom: 'mobile sombre', viewport: { width: 412, height: 823 },  theme: 'dark' },
  { nom: 'bureau clair',  viewport: { width: 1440, height: 900 }, theme: 'light' },
  { nom: 'bureau sombre', viewport: { width: 1440, height: 900 }, theme: 'dark' },
];

export function empreinteStyles() {
  return crypto.createHash('md5').update(fs.readFileSync(SOURCE_CSS)).digest('hex').slice(0, 12);
}

function chargePlaywright() {
  for (const nom of ['playwright', 'playwright-core']) {
    try { return require(nom); } catch (e) { /* suivant */ }
  }
  console.error('Playwright introuvable. Installez-le (npm i -D playwright-core) ou donnez NODE_PATH.');
  process.exit(1);
}

// ── Les pages a relever ──────────────────────────────────────────────
function pages(filtre) {
  const liste = [];
  for (const cle of Object.keys(ROUTE_CONFIG)) {
    if (HORS_CHAMP.has(cle)) continue;
    const chemin = getLocalizedPath(cle, 'fr');
    if (chemin === null) continue;
    liste.push({ cle, chemin });
  }
  const maintenant = Date.now();
  const article = BLOG_ARTICLES.find(a => a.slugs && a.slugs.fr &&
    (!a.publishedAt || new Date(a.publishedAt).getTime() <= maintenant));
  if (article) liste.push({ cle: 'blog-article', chemin: getArticlePath(article.slugs.fr, 'fr') });
  return filtre.length ? liste.filter(p => filtre.includes(p.cle)) : liste;
}

// ── L'analyse de la feuille ──────────────────────────────────────────
// Un arbre a deux sortes de noeuds : les blocs conditionnels (@media,
// @supports, @container, @layer), qu'on ouvre pour regarder dedans, et les
// feuilles (regles de style, @keyframes, @font-face, @property), qu'on garde
// ou qu'on ecarte d'un bloc. Les chaines et les parentheses sont respectees :
// une url(...) ou un content:"}" ne doit pas fermer un bloc.
const CONDITIONNEL = /^@(media|supports|container|layer|scope|document)\b/;

function analyse(css) {
  let i = 0;
  const n = css.length;

  function sauteChaine() {
    const q = css[i]; i++;
    while (i < n && css[i] !== q) { if (css[i] === '\\') i++; i++; }
    i++;
  }

  function niveau() {
    const noeuds = [];
    while (i < n) {
      while (i < n && /\s/.test(css[i])) i++;
      if (i >= n) break;
      if (css[i] === '}') { i++; return noeuds; }
      if (css[i] === '/' && css[i + 1] === '*') {
        const j = css.indexOf('*/', i + 2); i = j < 0 ? n : j + 2; continue;
      }
      const debut = i;
      let profondeur = 0;
      while (i < n) {
        const c = css[i];
        if (c === '"' || c === "'") { sauteChaine(); continue; }
        if (c === '(') profondeur++;
        else if (c === ')') profondeur--;
        else if (profondeur <= 0 && (c === '{' || c === '}' || c === ';')) break;
        i++;
      }
      const prelude = css.slice(debut, i).trim();
      if (i >= n) { noeuds.push({ debut, fin: n, prelude, bloc: false }); break; }
      if (css[i] === ';') { i++; noeuds.push({ debut, fin: i, prelude, bloc: false }); continue; }
      if (css[i] === '}') { i++; return noeuds; }
      i++; // '{'
      if (CONDITIONNEL.test(prelude)) {
        const enfants = niveau();
        noeuds.push({ debut, fin: i, prelude, bloc: true, enfants });
      } else {
        let d = 1;
        while (i < n && d > 0) {
          const c = css[i];
          if (c === '"' || c === "'") { sauteChaine(); continue; }
          if (c === '{') d++; else if (c === '}') d--;
          i++;
        }
        noeuds.push({ debut, fin: i, prelude, bloc: true });
      }
    }
    return noeuds;
  }
  return niveau();
}

function fusionne(plages) {
  const tri = plages.slice().sort((a, b) => a.start - b.start);
  const out = [];
  for (const p of tri) {
    const d = out[out.length - 1];
    if (d && p.start <= d.end) d.end = Math.max(d.end, p.end);
    else out.push({ start: p.start, end: p.end });
  }
  return out;
}

function chevauche(plages, debut, fin) {
  let lo = 0, hi = plages.length - 1;
  while (lo <= hi) {
    const m = (lo + hi) >> 1;
    const p = plages[m];
    if (p.end <= debut) lo = m + 1;
    else if (p.start >= fin) hi = m - 1;
    else return true;
  }
  return false;
}

// Ce qu'on garde toujours, couvert ou non : les declarations, les polices,
// les proprietes enregistrees, et les variables de la racine.
const TOUJOURS = /^(@import|@charset|@namespace|@font-face|@property|:root\b|html\b)/;

function selectionne(css, noeuds, plages) {
  const garde = new Set();
  const animations = new Set();
  const keyframes = [];

  function marque(noeud) {
    garde.add(noeud);
    const texte = css.slice(noeud.debut, noeud.fin);
    const re = /animation(?:-name)?\s*:\s*([^;}]+)/g;
    let m;
    while ((m = re.exec(texte))) {
      for (const mot of m[1].split(/[\s,]+/)) {
        if (mot && !/^[\d.]|^(?:ease|linear|infinite|alternate|forwards|backwards|both|none|normal|reverse|paused|running|steps|cubic-bezier|initial|inherit|unset|var)/i.test(mot)) animations.add(mot);
      }
    }
  }

  function passe1(liste) {
    for (const nd of liste) {
      if (nd.enfants) { passe1(nd.enfants); continue; }
      if (/^@(-webkit-)?keyframes\s+/.test(nd.prelude)) { keyframes.push(nd); continue; }
      if (TOUJOURS.test(nd.prelude) || chevauche(plages, nd.debut, nd.fin)) marque(nd);
    }
  }
  passe1(noeuds);
  for (const kf of keyframes) {
    const nom = kf.prelude.replace(/^@(-webkit-)?keyframes\s+/, '').trim();
    if (animations.has(nom)) garde.add(kf);
  }

  function emet(liste) {
    let out = '';
    for (const nd of liste) {
      if (nd.enfants) {
        const dedans = emet(nd.enfants);
        if (dedans) out += nd.prelude + '{' + dedans + '}';
      } else if (garde.has(nd)) {
        out += css.slice(nd.debut, nd.fin);
      }
    }
    return out;
  }
  return emet(noeuds);
}

// ── Le releve dans Chromium ──────────────────────────────────────────
async function releve(browser, chemin) {
  const plages = [];
  let texteVu = null;
  for (const passe of PASSES) {
    const context = await browser.newContext({
      viewport: passe.viewport,
      deviceScaleFactor: 1,
      colorScheme: passe.theme,
      locale: 'fr-FR',
    });
    await context.route(/^https?:\/\/(?!127\.0\.0\.1|localhost)/, r => r.abort());
    await context.addInitScript((theme) => {
      try { localStorage.setItem('theme', theme); } catch (e) {}
    }, passe.theme);
    const page = await context.newPage();
    await page.coverage.startCSSCoverage({ resetOnNavigation: false });
    await page.goto(SERVEUR + chemin, { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(1500);

    const mobile = passe.viewport.width < 1024;
    await page.evaluate(async (mobile) => {
      const pause = (ms) => new Promise(r => setTimeout(r, ms));
      const clic = (el) => { try { el.click(); } catch (e) {} };
      if (mobile) {
        const bouton = document.getElementById('mobile-menu-btn');
        if (bouton) {
          clic(bouton); await pause(250);
          document.querySelectorAll('.mobile-accordion-trigger, .mobile-trigger-fleche').forEach(clic);
          await pause(250);
          clic(bouton); await pause(150);
        }
      }
      // Les onglets du menu de bureau, les etats de defilement, les
      // animations d'apparition : tout ce qui n'existe qu'une fois la page
      // parcourue.
      const pas = Math.max(400, Math.floor(window.innerHeight * 0.8));
      const h = () => document.documentElement.scrollHeight;
      for (let y = 0; y <= h(); y += pas) { window.scrollTo(0, y); await pause(120); }
      window.scrollTo(0, 0); await pause(200);
    }, mobile);
    if (!mobile) {
      const onglets = await page.$$('[data-megamenu], .n2-famille, .n2-onglet');
      for (const o of onglets.slice(0, 6)) {
        try { await o.hover({ timeout: 800 }); await page.waitForTimeout(150); } catch (e) {}
      }
      try { await page.mouse.move(5, 5); } catch (e) {}
    }
    await page.waitForTimeout(300);

    const couverture = await page.coverage.stopCSSCoverage();
    for (const entree of couverture) {
      if (!/\/css\/styles\.css/.test(entree.url)) continue;
      if (texteVu === null) texteVu = entree.text;
      for (const r of entree.ranges) plages.push({ start: r.start, end: r.end });
    }
    await context.close();
  }
  return { plages: fusionne(plages), texte: texteVu };
}

async function main() {
  const filtre = process.argv.slice(2);
  if (!fs.existsSync(DIST_CSS)) {
    console.error('dist/css/styles.css introuvable : lancez d\'abord npm run build.');
    process.exit(1);
  }
  const cssDist = fs.readFileSync(DIST_CSS, 'utf-8');
  const empreinte = empreinteStyles();
  const arbre = analyse(cssDist);
  const liste = pages(filtre);
  if (!liste.length) { console.error('Aucune page ne correspond.'); process.exit(1); }
  fs.mkdirSync(DOSSIER, { recursive: true });

  const { chromium } = chargePlaywright();
  let browser;
  try {
    browser = await chromium.launch({ args: ['--no-sandbox'] });
  } catch (e) {
    browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  }

  const debut = Date.now();
  const resultats = [];
  let index = 0;
  async function ouvrier() {
    while (index < liste.length) {
      const p = liste[index++];
      try {
        const { plages, texte } = await releve(browser, p.chemin);
        if (texte === null) throw new Error('styles.css jamais chargee sur ' + p.chemin);
        if (texte.length !== cssDist.length) throw new Error('la feuille servie ne correspond pas a dist/css/styles.css (' + texte.length + ' vs ' + cssDist.length + ')');
        const css = selectionne(cssDist, arbre, plages);
        // Pas de date dans l'en-tete : deux releves identiques doivent donner le meme fichier.
        const entete = `/*! critique ${p.cle} styles=${empreinte} */\n`;
        fs.writeFileSync(path.join(DOSSIER, `${p.cle}.css`), entete + css, 'utf-8');
        resultats.push({ cle: p.cle, taille: css.length });
        console.log(`  ${p.cle.padEnd(20)} ${(css.length / 1024).toFixed(1).padStart(6)} Ko  ${p.chemin}`);
      } catch (e) {
        resultats.push({ cle: p.cle, erreur: e.message });
        console.error(`  ${p.cle.padEnd(20)} ECHEC  ${e.message}`);
      }
    }
  }
  await Promise.all(Array.from({ length: PARALLELE }, ouvrier));
  await browser.close();

  const ok = resultats.filter(r => !r.erreur);
  const total = ok.reduce((s, r) => s + r.taille, 0);
  console.log(`\n${ok.length}/${resultats.length} feuilles critiques ecrites dans css/critique/ ` +
    `(moyenne ${(total / Math.max(1, ok.length) / 1024).toFixed(1)} Ko, styles.css ${(cssDist.length / 1024).toFixed(0)} Ko) ` +
    `en ${Math.round((Date.now() - debut) / 1000)} s. Empreinte ${empreinte}.`);
  if (ok.length !== resultats.length) process.exit(1);
}

const lance = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (lance) main().catch(e => { console.error(e); process.exit(1); });
