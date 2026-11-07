// Fabrique des maquettes du livre Quiz Couple (7 novembre 2026).
//
//   node livre/fabrique.mjs                  les trois maquettes du 7 novembre
//   node livre/fabrique.mjs quiz             une seule (journal, aventures, quiz)
//   node livre/fabrique.mjs aventures:en     le livre complet dans une langue
//   node livre/fabrique.mjs aventures:toutes le livre complet dans les six langues
//
// Pour chaque format, dans livre/sortie/<id>/ (hors du dépôt) :
//   interieur.pdf    les pages d'exemple, à fond perdu, au format KDP
//   couverture.pdf   la couverture entière (dos, tranche, face) à fond perdu
//   apercu/          une image JPEG de chaque page coupée et de la couverture
//   pages.json       la liste des pages (folio, côté, titre) pour l'aperçu
// Chromium vient de Playwright (préinstallé dans les sessions de travail).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const ICI = path.dirname(fileURLToPath(import.meta.url));
const FORMATS = ['journal', 'aventures', 'quiz'];

// Épaisseur d'une page selon le papier (pouces par page, calculateur KDP).
const EPAISSEUR = { blanc: 0.002252, creme: 0.0025, standard: 0.002252, premium: 0.002347 };
const FOND_PERDU = 0.125;

// Marge intérieure minimale de KDP selon le nombre de pages.
function margeInterieure(n) {
  if (n <= 150) return 0.375;
  if (n <= 300) return 0.5;
  if (n <= 500) return 0.625;
  return 0.75;
}

function dimensions(f) {
  const l = f.trim.l, h = f.trim.h;
  const tranche = +(f.pagesFinales * EPAISSEUR[f.papier]).toFixed(6);
  return {
    l, h, tranche,
    page: { l: l + FOND_PERDU, h: h + 2 * FOND_PERDU },
    couv: { l: 2 * l + tranche + 2 * FOND_PERDU, h: h + 2 * FOND_PERDU },
    margeInt: Math.max(margeInterieure(f.pagesFinales), f.margeInt || 0) + 0.1,
  };
}

function document(f, d, corps, { couverture = false } = {}) {
  const base = fs.readFileSync(path.join(ICI, 'commun/base.css'), 'utf8');
  const L = couverture ? d.couv.l : d.page.l;
  const H = couverture ? d.couv.h : d.page.h;
  return `<!doctype html><html lang="${f.lang || 'fr'}"><head><meta charset="utf-8"><title>${f.titre}</title>
<style>${base}
@page { size: ${L}in ${H}in; margin: 0; }
:root { --feuille-l: ${L}in; --feuille-h: ${H}in; --coupe-l: ${d.l}in; --coupe-h: ${d.h}in; --tranche: ${d.tranche}in;
  --marge-int: ${d.margeInt}in; --marge-ext: ${f.margeExt || 0.5}in; --marge-haut: ${f.margeHaut || 0.55}in; --marge-bas: ${f.margeBas || 0.65}in; --fond-page: ${f.fond || '#fff'}; }
${f.css || ''}
${couverture ? (f.couverture.css || '') : ''}
</style></head><body class="fmt-${f.famille || f.id}">${corps}${f.script ? `<script>${f.script}</script>` : ''}</body></html>`;
}

function feuille(p) {
  const cote = p.folio % 2 === 0 ? 'verso' : 'recto';
  const style = p.fond ? ` style="--fond-page:${p.fond}"` : '';
  return `<section class="feuille feuille--${cote} ${p.classe || ''}" data-folio="${p.folio}"${style}>
${p.perdu ? `<div class="perdu">${p.perdu}</div>` : ''}
<div class="coupe">${p.zone === false ? '' : `<div class="zone">${p.html}</div>`}${p.coupe || ''}${p.sansFolio ? '' : `<div class="folio">${p.folio}</div>`}</div>
</section>`;
}

// Un format exporte soit l'objet du livre, soit une fonction de la langue
// (avec LANGUES et charger(langue) pour lire les textes).
async function formatsDe(demande) {
  const [id, langue] = demande.split(':');
  const mod = await import(pathToFileURL(path.join(ICI, 'formats', `${id}.mjs`)).href);
  if (typeof mod.default !== 'function') return [mod.default];
  const langues = langue === 'toutes' ? mod.LANGUES : [langue || 'fr'];
  const liste = [];
  for (const l of langues) {
    await mod.charger(l);
    liste.push({ famille: id, ...mod.default(l) });
  }
  return liste;
}

// Chromium arrondit la largeur de page au 1/300 de pouce (8,625 in devient
// 8,6267 in) : on réécrit la boîte de chaque page à la taille exacte, sans
// changer la longueur du fichier (la table des objets reste juste).
function boiteExacte(fichier, largeurIn, hauteurIn) {
  const brut = fs.readFileSync(fichier).toString('latin1');
  const exact = (pt, modele) => {
    let s = pt.toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
    if (s.length > modele.length) s = s.slice(0, modele.length).replace(/\.$/, '');
    if (s.length < modele.length) s = (s.includes('.') ? s : s + '.') .padEnd(modele.length, '0');
    return s.length === modele.length ? s : null;
  };
  let n = 0;
  const corrige = brut.replace(/\/MediaBox \[0 0 ([\d.]+) ([\d.]+)\]/g, (m, l, h) => {
    const nl = exact(largeurIn * 72, l), nh = exact(hauteurIn * 72, h);
    if (!nl || !nh) return m;
    n++;
    return `/MediaBox [0 0 ${nl} ${nh}]`;
  });
  fs.writeFileSync(fichier, Buffer.from(corrige, 'latin1'));
  return n;
}

async function fabriquer(navigateur, f) {
  const id = f.id;
  const d = dimensions(f);
  const sortie = path.join(ICI, 'sortie', id);
  const apercu = path.join(sortie, 'apercu');
  fs.rmSync(sortie, { recursive: true, force: true });
  fs.mkdirSync(apercu, { recursive: true });

  // L'intérieur
  const pages = f.pages.map((p) => feuille(p)).join('\n');
  const htmlInt = path.join(sortie, 'interieur.html');
  fs.writeFileSync(htmlInt, document(f, d, pages));
  const onglet = await navigateur.newPage({ deviceScaleFactor: 2, viewport: { width: 1400, height: 1000 } });
  await onglet.goto(pathToFileURL(htmlInt).href);
  await onglet.evaluate(() => document.fonts.ready);
  const reduites = await onglet.evaluate(() => (window.__mettreEnPage ? window.__mettreEnPage() : []));
  await onglet.pdf({ path: path.join(sortie, 'interieur.pdf'), width: `${d.page.l}in`, height: `${d.page.h}in`, printBackground: true, preferCSSPageSize: true });
  boiteExacte(path.join(sortie, 'interieur.pdf'), d.page.l, d.page.h);
  const liste = [];
  const coupes = await onglet.$$('.feuille .coupe');
  for (let i = 0; i < coupes.length; i++) {
    const p = f.pages[i];
    const nom = `page-${String(p.folio).padStart(3, '0')}.jpg`;
    await coupes[i].screenshot({ path: path.join(apercu, nom), type: 'jpeg', quality: 86 });
    liste.push({ folio: p.folio, cote: p.folio % 2 === 0 ? 'verso' : 'recto', titre: p.titre || '', image: `apercu/${nom}` });
  }
  // contrôle : un texte qui déborde de sa zone de sécurité
  const debords = await onglet.evaluate(() => {
    const out = [];
    document.querySelectorAll('.feuille').forEach((fe) => {
      const z = fe.querySelector('.zone');
      if (!z) return;
      const r = z.getBoundingClientRect();
      z.querySelectorAll('*').forEach((el) => {
        const b = el.getBoundingClientRect();
        if (b.width === 0 || b.height === 0) return;
        if (el.ownerSVGElement || el.closest('.peut-deborder') || el.closest('.apercu')) return;
        if (b.bottom > r.bottom + 1 || b.right > r.right + 1 || b.left < r.left - 1 || b.top < r.top - 1) {
          out.push(`${fe.dataset.folio}: <${el.tagName.toLowerCase()} class="${el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className}"> déborde de ${Math.round(Math.max(b.bottom - r.bottom, b.right - r.right, r.left - b.left, r.top - b.top))} px`);
        }
      });
    });
    return out.slice(0, 40);
  });
  await onglet.close();

  // La couverture
  const c = f.couverture;
  const couv = `<section class="couv">
<div class="couv-dos" style="background:${c.fondDos || c.fond}">${c.dos}</div>
<div class="couv-tranche" style="background:${c.fondTranche || c.fond}">${c.tranche}</div>
<div class="couv-face" style="background:${c.fond}">${c.face}</div>
</section>`;
  const htmlCouv = path.join(sortie, 'couverture.html');
  fs.writeFileSync(htmlCouv, document(f, d, couv, { couverture: true }));
  const o2 = await navigateur.newPage({ deviceScaleFactor: 2, viewport: { width: 2400, height: 1400 } });
  await o2.goto(pathToFileURL(htmlCouv).href);
  await o2.evaluate(() => document.fonts.ready);
  await o2.evaluate(() => (window.__mettreEnPage ? window.__mettreEnPage() : []));
  await o2.pdf({ path: path.join(sortie, 'couverture.pdf'), width: `${d.couv.l}in`, height: `${d.couv.h}in`, printBackground: true, preferCSSPageSize: true });
  boiteExacte(path.join(sortie, 'couverture.pdf'), d.couv.l, d.couv.h);
  const boite = await (await o2.$('.couv')).boundingBox();
  const px = boite.width / d.couv.l;
  await o2.screenshot({ path: path.join(apercu, 'couverture-entiere.jpg'), type: 'jpeg', quality: 86, clip: { x: boite.x + FOND_PERDU * px, y: boite.y + FOND_PERDU * px, width: (d.couv.l - 2 * FOND_PERDU) * px, height: d.h * px } });
  await o2.screenshot({ path: path.join(apercu, 'couverture-face.jpg'), type: 'jpeg', quality: 88, clip: { x: boite.x + (FOND_PERDU + d.l + d.tranche) * px, y: boite.y + FOND_PERDU * px, width: d.l * px, height: d.h * px } });
  await o2.screenshot({ path: path.join(apercu, 'couverture-dos.jpg'), type: 'jpeg', quality: 86, clip: { x: boite.x + FOND_PERDU * px, y: boite.y + FOND_PERDU * px, width: d.l * px, height: d.h * px } });
  await o2.screenshot({ path: path.join(apercu, 'couverture-tranche.jpg'), type: 'jpeg', quality: 86, clip: { x: boite.x + (FOND_PERDU + d.l) * px, y: boite.y + FOND_PERDU * px, width: d.tranche * px, height: d.h * px } });
  await o2.close();

  fs.writeFileSync(path.join(sortie, 'pages.json'), JSON.stringify({ id, titre: f.titre, sousTitre: f.sousTitre, trim: f.trim, tranche: d.tranche, pagesFinales: f.pagesFinales, papier: f.papier, encre: f.encre, pages: liste }, null, 1));
  console.log(`${id} : ${liste.length} pages, tranche ${d.tranche} in, couverture ${d.couv.l.toFixed(3)} x ${d.couv.h} in`);
  if (reduites.length) console.log(`  textes réduits pour tenir (page:échelle) : ${reduites.join(' ')}`);
  if (debords.length) console.log(`  débordements :\n  ${debords.join('\n  ')}`);
}

const demandes = process.argv.slice(2).filter((a) => FORMATS.includes(a.split(':')[0]));
const navigateur = await chromium.launch();
try {
  for (const demande of (demandes.length ? demandes : FORMATS)) {
    for (const f of await formatsDe(demande)) await fabriquer(navigateur, f);
  }
} finally {
  await navigateur.close();
}
