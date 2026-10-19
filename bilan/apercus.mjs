// Les aperçus du rapport montrés sur la page de l'évaluation (public/bilan/) :
// de vraies pages du gabarit, pour un couple fictif, dans chaque langue. À
// refaire quand le gabarit, sa feuille ou les textes du rapport changent.
//
//   node bilan/apercus.mjs [langue...]
//
// Il faut sharp pour le WebP (comme build/variantes-images.cjs : installé
// hors du dépôt, chemin dans SHARP, sinon /tmp/node_modules/sharp).

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { lancer } from './navigateur.mjs';
import { couple } from './exemples.mjs';
import { feuilleEnLigne, textes, RACINE } from './document.mjs';
import { rapportHtml } from '../supabase/functions/_shared/bilan/rapport.mjs';
import { couperPour } from './cesure.mjs';

const require = createRequire(import.meta.url);
const sharp = require(process.env.SHARP || '/tmp/node_modules/sharp');

const SORTIE = path.join(RACINE, 'public', 'bilan');
// Le couple fictif de chaque langue, et le tirage qui donne un rapport
// réaliste : bien alignés, quelques vrais écarts, un point bloquant.
const COUPLES = {
  fr: ['Camille', 'Julien'],
  en: ['Emma', 'Daniel'],
  es: ['Lucía', 'Pablo'],
  de: ['Hannah', 'Lukas'],
  it: ['Giulia', 'Marco'],
};
// Les pages montrées dans le curseur de la page de vente, dans l'ordre du
// rapport : la couverture, la synthèse, une page d'ouverture de chapitre, la
// carte, les conversations, le climat, le début du domaine par domaine et la
// synthèse de fin.
const PAGES = ['couverture', 'synthese', 'ouverture', 'carte', 'conversations', 'climat', 'domaines', 'fin'];
const NOMS = { couverture: 'couverture', synthese: 'synthese', ouverture: 'ouverture', carte: 'carte', conversations: 'conversation', climat: 'climat', domaines: 'domaine', fin: 'fin' };
// 240 px de large, exprès (19 octobre 2026, Thomas : « ça doit rester affiché
// en tout petit et illisible volontairement pour éviter toute copie sans
// payer ») : la mise en page se devine, le texte ne se lit pas, même ouvert
// à part. Le curseur les affiche de 110 à 180 px de large.
const LARGEUR = 240;

function documentApercu(lang, html) {
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><style>${feuilleEnLigne()}
html, body { margin: 0; background: #fff; }
.feuille { width: 210mm; height: 297mm; box-sizing: border-box; overflow: hidden; position: relative; background: #fff; }
.feuille--marges { padding: 16mm 16mm 18mm; }
.feuille .rap-chap { break-before: auto; }
</style></head><body>${html}</body></html>`;
}

async function principal() {
  const langues = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(COUPLES);
  fs.mkdirSync(SORTIE, { recursive: true });
  const navigateur = await lancer();
  try {
    for (const lang of langues) {
      const d = couple({ lang, graine: 13, pareil: 0.58, voisin: 0.27, climat: 0.82, prenoms: COUPLES[lang], genres: ['f', 'h'] });
      const { T, Q } = textes(lang);
      const r = rapportHtml(d, T, Q, { format: 'pdf', couper: couperPour(lang) });
      console.log(`${lang} : alignement ${r.analyse.global} %, climat ${r.analyse.meteo} %, ${r.analyse.compte.bloquants} bloquant(s)`);
      const page = await navigateur.newPage({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 1.5 });
      // Une feuille par aperçu : la couverture telle quelle, chaque chapitre
      // dans les marges du PDF, coupé au bas de la page.
      await page.setContent(documentApercu(lang, r.html), { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready);
      for (const cle of PAGES) {
        await page.evaluate(({ cle }) => {
          const rap = document.querySelector('.rap');
          const source = cle === 'couverture' ? rap.querySelector('.rap-couv')
            : cle === 'ouverture' ? rap.querySelector('.rap-ouv--prune')
            : rap.querySelector('.rap-chap--' + cle);
          const feuille = document.createElement('div');
          feuille.className = 'feuille' + (cle === 'couverture' || cle === 'ouverture' ? '' : ' feuille--marges');
          const copie = document.createElement('div');
          copie.className = rap.className;
          copie.setAttribute('lang', rap.getAttribute('lang'));
          copie.appendChild(source.cloneNode(true));
          feuille.appendChild(copie);
          document.body.innerHTML = '';
          document.body.appendChild(feuille);
        }, { cle });
        const png = await page.locator('.feuille').screenshot({ type: 'png' });
        const sortie = path.join(SORTIE, `apercu-${NOMS[cle]}-${lang}.webp`);
        await sharp(png).resize({ width: LARGEUR }).webp({ quality: 80 }).toFile(sortie);
        console.log('  ', path.relative(RACINE, sortie), Math.round(fs.statSync(sortie).size / 1024) + ' Ko');
        // On remet le rapport entier pour la page suivante.
        await page.setContent(documentApercu(lang, r.html), { waitUntil: 'load' });
        await page.evaluate(() => document.fonts.ready);
      }
      await page.close();
    }
  } finally {
    await navigateur.close();
  }
}

principal().catch((e) => { console.error(e); process.exit(1); });
