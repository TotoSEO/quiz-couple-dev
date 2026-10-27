// L'image de partage du site (og:image de l'accueil et des pages sans image
// de tête), une par langue : les deux mascottes de la charte et « Quiz, tests
// et jeux pour les couples » (27 octobre 2026, Thomas : « ça fait 8 mois que
// l'image à la une de la page d'accueil n'a pas changé [...] un truc assez
// graphique qui donne envie de cliquer car cette image apparaîtra à chaque
// partage du lien du site »).
//
// La page est dessinée en HTML et SVG (mascottes de reseaux/charte/mascottes.js,
// sans déguisement de saison : l'image reste des mois), rendue par Chromium à
// deux fois la taille puis réduite à 1200 x 630 par sharp, en JPEG : le format
// que lisent tous les aperçus de lien (Facebook, Messenger, WhatsApp,
// iMessage, X, LinkedIn). Le contenu important reste loin des bords (X coupe
// 15 px en haut et en bas).
//
// Ce script ne fait pas partie de la construction du site ; playwright et
// sharp viennent d'en dehors du dépôt :
//   cd /tmp && npm i sharp@0.33.5 && cd -
//   NODE_PATH=/opt/node22/lib/node_modules:/tmp/node_modules node static-site/build/image-partage.mjs [--apercu <dossier>]
// Il écrit public/og/quiz-couple-<langue>.jpg ; --apercu ajoute une copie PNG
// des cinq images dans le dossier donné. Pour changer l'image, on change le nom
// du fichier (IMAGE_PARTAGE dans config.js) : les réseaux gardent en cache
// l'image d'une adresse déjà vue.

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { IMAGE_PARTAGE } from './config.js';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const sharp = require('sharp');

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, '../..');
const SORTIE = path.join(RACINE, 'public', 'og');

// Le titre, le mot mis en avant et la pastille, dans chaque langue. Le mot est
// la fin du titre : il est posé sur une étiquette rose.
const TEXTES = {
  fr: { avant: 'Quiz, tests et jeux pour les', mot: 'couples', pastille: 'Gratuit, sans inscription' },
  en: { avant: 'Quizzes, tests and games for', mot: 'couples', pastille: 'Free, no sign-up' },
  es: { avant: 'Quiz, tests y juegos para', mot: 'parejas', pastille: 'Gratis, sin registro' },
  de: { avant: 'Quiz, Tests und Spiele für', mot: 'Paare', pastille: 'Kostenlos, ohne Anmeldung' },
  it: { avant: 'Quiz, test e giochi per', mot: 'coppie', pastille: 'Gratis, senza registrazione' },
};

const dataUrl = (fichier, type) => `data:${type};base64,${fs.readFileSync(fichier).toString('base64')}`;
const FREDOKA = dataUrl(path.join(RACINE, 'reseaux/studio/public/fonts/Fredoka-latin-variable.woff2'), 'font/woff2');
const LOGO = dataUrl(path.join(RACINE, 'assets/logo-quiz-couple.png'), 'image/png');
const MASCOTTES = fs.readFileSync(path.join(RACINE, 'reseaux/charte/mascottes.js'), 'utf8');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Les couleurs de la charte (reseaux/charte/tokens.json) : la nuit des
// mascottes, le papier, l'encre, le rose et le violet, plus le jaune des
// pastilles de réduction et le turquoise des tests célibataires.
const C = {
  nuit: '#1d0f2b', nuitClaire: '#2a1640', papier: '#fcf6f3', encre: '#2a1e36',
  rose: '#e17398', roseClair: '#f6a8c4', violet: '#7f4db3', violetClair: '#a581c9',
  jaune: '#ffd166', turquoise: '#5ad1c9', trait: '#f0e0e6',
};

// Des confettis posés à la main (aucun hasard : deux rendus donnent la même image).
const CONFETTIS = [
  [40, 70, 'rond', C.rose], [118, 548, 'rond', C.jaune], [205, 34, 'barre', C.violetClair, 25],
  [330, 590, 'barre', C.rose, -30], [455, 46, 'etoile', C.jaune], [560, 590, 'rond', C.turquoise],
  [598, 300, 'barre', C.jaune, 60], [34, 330, 'etoile', C.violetClair], [500, 160, 'rond', C.violetClair],
  [1170, 590, 'barre', C.jaune, -20], [1175, 250, 'rond', C.rose], [690, 600, 'etoile', C.rose],
];
function confetti([x, y, forme, couleur, angle = 0]) {
  if (forme === 'rond') return `<circle cx="${x}" cy="${y}" r="7" fill="${couleur}"/>`;
  if (forme === 'barre') return `<rect x="${x - 11}" y="${y - 4}" width="22" height="8" rx="4" fill="${couleur}" transform="rotate(${angle} ${x} ${y})"/>`;
  return `<path d="M${x} ${y - 11} L${x + 3.5} ${y - 3.5} L${x + 11} ${y} L${x + 3.5} ${y + 3.5} L${x} ${y + 11} L${x - 3.5} ${y + 3.5} L${x - 11} ${y} L${x - 3.5} ${y - 3.5} Z" fill="${couleur}"/>`;
}

function page(lang) {
  const t = TEXTES[lang];
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><style>
@font-face { font-family: 'Fredoka'; src: url(${FREDOKA}) format('woff2'); font-weight: 300 700; }
* { box-sizing: border-box; }
html, body { margin: 0; background: ${C.nuit}; }
.og { position: relative; width: 1200px; height: 630px; overflow: hidden; background: ${C.nuit}; font-family: 'Fredoka', sans-serif; color: #fff; }
.deco { position: absolute; inset: 0; }
.gauche { position: absolute; left: 66px; top: 40px; bottom: 40px; width: 560px; display: flex; flex-direction: column; justify-content: center; gap: 26px; }
.marque { display: flex; align-items: center; gap: 12px; font-weight: 600; font-size: 29px; letter-spacing: .01em; }
.marque img { width: 44px; height: 46px; }
.titre { margin: 0; font-weight: 700; font-size: 84px; line-height: 1.04; letter-spacing: -.012em; text-wrap: balance; }
.mot { display: inline-block; background: ${C.rose}; color: ${C.encre}; padding: 0 .17em .05em; margin-top: .1em; border-radius: .17em; transform: rotate(-2.5deg); box-shadow: .07em .07em 0 ${C.violet}; }
.bas { display: flex; flex-direction: column; align-items: flex-start; gap: 16px; }
.pastille { display: inline-flex; align-items: center; gap: 10px; background: ${C.jaune}; color: ${C.encre}; font-weight: 600; font-size: 25px; padding: 8px 20px 9px; border-radius: 999px; border: 3px solid ${C.encre}; box-shadow: 5px 5px 0 ${C.rose}; }
.pastille svg { width: 24px; height: 24px; }
.url { font-weight: 600; font-size: 23px; color: rgba(255,255,255,.7); }
.disque { position: absolute; left: 652px; top: 88px; width: 504px; height: 504px; border-radius: 50%; background: ${C.papier}; }
.anneau { position: absolute; left: 630px; top: 66px; width: 548px; height: 548px; border-radius: 50%; border: 3px dashed rgba(246,168,196,.55); }
.sol { position: absolute; left: 712px; top: 556px; width: 396px; height: 30px; border-radius: 50%; background: rgba(42,30,54,.09); }
.perso { position: absolute; }
.perso svg { display: block; overflow: visible; }
.sticker { position: absolute; background: #fff; border: 4px solid ${C.encre}; border-radius: 24px; }
.score { left: 618px; top: 58px; width: 134px; height: 134px; transform: rotate(-8deg); box-shadow: 6px 6px 0 ${C.rose}; display: grid; place-items: center; }
.score svg { position: absolute; inset: 9px; }
.score b { position: relative; font-weight: 700; font-size: 33px; color: ${C.encre}; letter-spacing: -.02em; }
.quiz { left: 1012px; top: 74px; width: 168px; padding: 14px 14px 12px; transform: rotate(7deg); box-shadow: 6px 6px 0 ${C.violet}; display: grid; gap: 10px; }
.ligne { display: flex; align-items: center; gap: 9px; height: 34px; padding: 0 8px; border-radius: 12px; border: 2.5px solid ${C.trait}; }
.ligne i { flex: 0 0 auto; width: 22px; height: 22px; border-radius: 50%; display: grid; place-items: center; font-style: normal; font-weight: 700; font-size: 13px; background: #f7e3ea; color: ${C.encre}; }
.ligne span { flex: 1 1 auto; height: 9px; border-radius: 9px; background: ${C.trait}; }
.ligne--oui { border-color: ${C.rose}; background: #fdeaf1; }
.ligne--oui i { background: ${C.rose}; }
.ligne--oui span { background: ${C.roseClair}; }
.de { left: 1092px; top: 444px; width: 76px; height: 76px; border-radius: 18px; transform: rotate(14deg); box-shadow: 5px 5px 0 ${C.jaune}; }
.de svg { position: absolute; inset: 0; }
.bulle { position: absolute; left: 612px; top: 404px; width: 96px; height: 96px; transform: rotate(-10deg); }
</style></head><body>
<div class="og">
  <svg class="deco" viewBox="0 0 1200 630" width="1200" height="630" aria-hidden="true">
    <circle cx="-30" cy="-60" r="300" fill="${C.nuitClaire}"/>
    <circle cx="420" cy="720" r="250" fill="${C.nuitClaire}"/>
    ${CONFETTIS.map(confetti).join('')}
  </svg>

  <div class="gauche">
    <div class="marque"><img src="${LOGO}" alt=""><span>Quiz Couple</span></div>
    <h1 class="titre">${esc(t.avant)} <span class="mot">${esc(t.mot)}</span></h1>
    <div class="bas">
      <span class="pastille"><svg viewBox="0 0 24 24" fill="none" stroke="${C.encre}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>${esc(t.pastille)}</span>
      <span class="url">quiz-couple.com</span>
    </div>
  </div>

  <div class="anneau"></div>
  <div class="disque"></div>
  <div class="sol"></div>
  <div class="perso" id="violet" style="left: 926px; top: 226px;"></div>
  <div class="perso" id="rose" style="left: 668px; top: 238px;"></div>

  <div class="sticker score">
    <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="none" stroke="${C.trait}" stroke-width="11"/><circle cx="50" cy="50" r="40" fill="none" stroke="${C.rose}" stroke-width="11" stroke-linecap="round" stroke-dasharray="${(2 * Math.PI * 40 * 0.87).toFixed(1)} 999" transform="rotate(-90 50 50)"/></svg>
    <b>87%</b>
  </div>
  <div class="sticker quiz">
    <div class="ligne"><i>A</i><span></span></div>
    <div class="ligne ligne--oui"><i>B</i><span></span></div>
    <div class="ligne"><i>C</i><span></span></div>
  </div>
  <div class="sticker de"><svg viewBox="0 0 76 76"><g fill="${C.encre}"><circle cx="22" cy="22" r="6.5"/><circle cx="50" cy="22" r="6.5"/><circle cx="36" cy="36" r="6.5"/><circle cx="22" cy="50" r="6.5"/><circle cx="50" cy="50" r="6.5"/></g></svg></div>
  <svg class="bulle" viewBox="0 0 96 96"><path d="M48 8c22 0 40 15 40 35S70 78 48 78c-5 0-10-1-14-2L16 88l5-16C13 65 8 55 8 43 8 23 26 8 48 8z" fill="#fff" stroke="${C.encre}" stroke-width="4" stroke-linejoin="round"/><text x="48" y="58" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="44" fill="${C.violet}">?</text></svg>
</div>
<script>${MASCOTTES}</script>
<script>
  var BOITES = { rose: [260, 280], violet: [220, 300] };
  function dessine(nom, pose, hauteur) {
    var o = { couleurs: 'hex' }, base = window.POSES_MASCOTTES[pose], k;
    for (k in base) o[k] = base[k];
    var b = BOITES[nom];
    document.getElementById(nom).innerHTML = window.mascotte(nom, o)
      .replace(/ width="\\d+" height="\\d+"/, ' width="' + Math.round(hauteur * b[0] / b[1]) + '" height="' + hauteur + '"');
  }
  dessine('rose', 'joie', 330);
  dessine('violet', 'amoureux', 336);
  // Le titre prend la plus grande taille qui tient dans sa colonne.
  var titre = document.querySelector('.titre');
  var taille = 84;
  while (taille > 40 && (titre.scrollWidth > titre.clientWidth + 1 || titre.offsetHeight > 330)) {
    taille -= 2;
    titre.style.fontSize = taille + 'px';
  }
  window.__taille = taille;
</script>
</body></html>`;
}

async function main() {
  const iApercu = process.argv.indexOf('--apercu');
  const apercu = iApercu > 0 ? process.argv[iApercu + 1] : null;
  fs.mkdirSync(SORTIE, { recursive: true });
  if (apercu) fs.mkdirSync(apercu, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  for (const lang of Object.keys(TEXTES)) {
    await p.setContent(page(lang), { waitUntil: 'load' });
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(150);
    const taille = await p.evaluate(() => window.__taille);
    const png = await p.screenshot({ type: 'png', clip: { x: 0, y: 0, width: 1200, height: 630 } });
    const fichier = path.join(SORTIE, `${IMAGE_PARTAGE.fichier}-${lang}.jpg`);
    await sharp(png).resize(1200, 630, { kernel: 'lanczos3' })
      .jpeg({ quality: 88, mozjpeg: true, chromaSubsampling: '4:4:4' }).toFile(fichier);
    if (apercu) await sharp(png).resize(1200, 630).png().toFile(path.join(apercu, `${IMAGE_PARTAGE.fichier}-${lang}.png`));
    console.log(`${lang}  titre ${taille} px  ${(fs.statSync(fichier).size / 1024).toFixed(0)} Ko  ${path.relative(RACINE, fichier)}`);
  }
  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
