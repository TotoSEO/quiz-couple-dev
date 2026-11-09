// « 100 aventures à deux » : le livre complet, au format KDP (broché carré
// de 8,5 pouces, intérieur couleur standard, papier blanc, 136 pages).
// La mise en page est ici ; les textes de chaque langue sont dans
// aventures/<langue>.mjs (mêmes clés partout).
//
// Plan (folio : page) :
//   1 titre · 2 mentions · 3 « ce livre est à nous » · 4 mode d'emploi ·
//   5 les six familles · 6-7 la liste · 8 « nous deux, au début » ·
//   9-108 les 100 aventures · 109-118 dix aventures à vous (101 à 110) ·
//   119 nos voyages · 120-129 dix voyages · 130-131 l'historique des tests ·
//   132 le palmarès · 133 les trophées · 134 « nous deux, à la fin » ·
//   135 le mot de la fin · 136 les photos en plus.
// Toutes les pages sont blanches, aucune adresse de site ni QR code. Les
// lignes à remplir sont posées par __mettreEnPage() une fois la page
// composée : elles prennent toute la place qui reste, et la page réduit un
// peu ses textes (--k, jamais sous 7 pt) quand une langue plus longue ne
// tient pas.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fr, esc, mascotte, coeur } from '../commun/outils.mjs';
import { cent } from '../commun/cent.mjs';

const ICI = path.dirname(fileURLToPath(import.meta.url));
export const LANGUES = ['fr', 'en', 'es', 'de', 'it', 'nl'];
export const PAGES = 136;
const DEBUT_AVENTURES = 9;
const LOGO = '../../../reseaux/studio/public/marque/logo-quiz-couple-180.png';

// Couleur de chaque famille : le trait, le texte (contraste suffisant sur
// blanc) et la teinte pâle des étiquettes.
const COULEURS = {
  M: { c: '#e8892e', t: '#a85a12', p: '#fdebd8' },
  D: { c: '#5fa058', t: '#3d7536', p: '#e3f1e0' },
  S: { c: '#3a8fc0', t: '#246a93', p: '#ddeffa' },
  A: { c: '#7f4db3', t: '#6834b2', p: '#ece2f6' },
  R: { c: '#e17398', t: '#b12559', p: '#fbe3ec' },
  F: { c: '#d9a514', t: '#8f6a00', p: '#fdf1c9' },
};
const ICONES = {
  M: '<path d="M4 11l8-7 8 7v9H4z"/><path d="M10 20v-5h4v5"/>',
  D: '<path d="M12 3c3 2.6 5 5.6 5 8.6a5 5 0 0 1-10 0C7 8.6 9 5.6 12 3z"/><path d="M12 21v-7"/>',
  S: '<path d="M3.5 8.5a2 2 0 0 0 2-2h13a2 2 0 0 0 2 2v1.5a2 2 0 0 0 0 4v1.5a2 2 0 0 0-2 2h-13a2 2 0 0 0-2-2V14a2 2 0 0 0 0-4z"/><path d="M14.5 7v10" stroke-dasharray="1.6 2.2"/>',
  A: '<path d="M13.5 2.5L5 13.5h6l-1.5 8 8.5-11h-6z"/>',
  R: '<path d="M12 19.5C6.4 15.3 3.3 12.2 3.3 8.3 3.3 5.6 5.4 3.6 8 3.6c1.7 0 3.1.9 4 2.2.9-1.3 2.3-2.2 4-2.2 2.6 0 4.7 2 4.7 4.7 0 3.9-3.1 7-8.7 11.2z"/>',
  F: '<circle cx="12" cy="12" r="8.5"/><path d="M8.2 13.6c1 1.9 2.3 2.8 3.8 2.8s2.8-.9 3.8-2.8"/><path d="M9 9.6h.01M15 9.6h.01"/>',
};
const PICTOS = {
  horloge: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  ete: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/>',
  hiver: '<path d="M12 2.5v19M3.8 7.2l16.4 9.6M3.8 16.8l16.4-9.6"/><path d="M9.5 4.5L12 7l2.5-2.5M9.5 19.5L12 17l2.5 2.5"/>',
  crayon: '<path d="M4 20l1-4.5L15.5 5a2 2 0 0 1 2.8 0l.7.7a2 2 0 0 1 0 2.8L8.5 19z"/><path d="M13.5 7l3.5 3.5"/>',
  avion: '<path d="M21 4.5L3 11.5l6.5 2.5L12 20.5l3-5.5"/><path d="M9.5 14L21 4.5"/>',
  coupe: '<path d="M7 4h10v4a5 5 0 0 1-10 0z"/><path d="M7 6H4.5a2.5 2.5 0 0 0 2.6 3.8M17 6h2.5a2.5 2.5 0 0 1-2.6 3.8"/><path d="M12 13v4M8.5 20.5h7M10 17h4"/>',
  etoile: '<path d="M12 2.6l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 16.6l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  photo: '<rect x="3" y="6.5" width="18" height="13" rx="2.5"/><circle cx="12" cy="13" r="3.6"/><path d="M8.5 6.5l1.4-2.5h4.2l1.4 2.5"/>',
  monte: '<path d="M6 18L18 6M9 6h9v9"/>',
  egal: '<path d="M5 9h14M5 15h14"/>',
  descend: '<path d="M6 6l12 12M18 9v9H9"/>',
  coche: '<path d="M4.5 12.5l5 5L19.5 6.5"/>',
};
const svg = (d, taille, couleur, epais = 2.2) => `<svg class="ico" viewBox="0 0 24 24" style="width:${taille}pt;height:${taille}pt" aria-hidden="true"><g fill="none" stroke="${couleur}" stroke-width="${epais}" stroke-linecap="round" stroke-linejoin="round">${d}</g></svg>`;
const icone = (k, taille = 10, couleur = null) => svg(ICONES[k], taille, couleur || COULEURS[k].c);
const picto = (k, taille = 10, couleur = '#785e6c') => svg(PICTOS[k], taille, couleur);

// Les deux pions : le rond de la rose, la gélule du violet.
function pion(qui, taille = 9) {
  return qui === 'rose'
    ? `<svg class="pion" viewBox="0 0 20 20" style="width:${taille}pt;height:${taille}pt" aria-hidden="true"><circle cx="10" cy="10" r="8" fill="#e17398" stroke="#4a3540" stroke-width="2"/></svg>`
    : `<svg class="pion" viewBox="0 0 16 22" style="width:${taille * 0.82}pt;height:${taille * 1.12}pt" aria-hidden="true"><rect x="1.5" y="1.5" width="13" height="19" rx="6.5" fill="#7f4db3" stroke="#4a3540" stroke-width="2"/></svg>`;
}
// Le coût en pièces : de zéro à trois pleines.
function pieces(n, taille = 7) {
  let s = '';
  for (let i = 0; i < 3; i++) {
    const plein = i < n;
    s += `<svg viewBox="0 0 20 20" style="width:${taille}pt;height:${taille}pt" aria-hidden="true"><circle cx="10" cy="10" r="7.6" fill="${plein ? '#f7cf5b' : '#fff'}" stroke="${plein ? '#a8730a' : '#b09ca6'}" stroke-width="2.5"/>${plein ? '<circle cx="10" cy="10" r="3.4" fill="none" stroke="#a8730a" stroke-width="2.2"/>' : ''}</svg>`;
  }
  return `<span class="pieces">${s}</span>`;
}
const caseVide = '<span class="case"></span>';
const scotch = (couleur) => `<svg class="scotch" viewBox="0 0 90 26" preserveAspectRatio="none" aria-hidden="true"><path d="M3 4 L87 1 L86 22 L4 25 Z" fill="${couleur}"/><path d="M3 4 l3 3 -2 3 3 3 -3 3 3 3 -3 3 M87 1 l-3 3 2 3 -3 3 3 3 -3 3 3 3" fill="none" stroke="${couleur}" stroke-width="2"/></svg>`;

let css = `
:root { --k: 1; }
.fmt-aventures { --c-ligne: #c4b2ba; --lh: 0.3in; }
.feuille { --k: 1; }
.ico, .pion { display: inline-block; vertical-align: middle; flex: none; }
.pieces { display: inline-flex; gap: 1pt; vertical-align: middle; flex: none; }
.case { display: inline-block; flex: none; width: 8.2pt; height: 8.2pt; border: 0.9pt solid #8a7480; border-radius: 2pt; background: #fff; vertical-align: middle; }
.trait { flex: 1 1 auto; min-width: 0.45in; border-bottom: 0.8pt solid var(--c-ligne); height: calc(14pt * var(--k)); }
.trait--court { flex: 0 0 0.42in; min-width: 0.42in; }
.trait--moyen { flex: 0 0 0.9in; }
.remplir { flex: 1 1 0; min-height: 0; display: flex; flex-direction: column; }
.remplir--fixe { flex: none; }
.remplir .ligne { flex: none; height: var(--lh); border-bottom: 0.8pt solid var(--c-ligne); }
.remplir { position: relative; }
.trait { position: relative; }
.ecrit { position: absolute; left: 3pt; right: 0; bottom: 1.5pt; font-family: var(--f-plume); font-style: italic; font-weight: 500; font-size: 11.5pt; line-height: 1; color: #2f4f9a; white-space: nowrap; }
.ecrit-bloc { position: absolute; left: 3pt; right: 4pt; top: 0; font-family: var(--f-plume); font-style: italic; font-weight: 500; font-size: 13pt; line-height: var(--lh); padding-top: 2pt; color: #2f4f9a; }
.case--cochee { position: relative; }
.case--cochee svg { position: absolute; left: -1pt; top: -3pt; width: 11pt; height: 11pt; }
.photo-img { position: absolute; inset: 0; overflow: hidden; border-radius: 2pt; box-shadow: 0 0 0 1pt #2b1722; background: #fff; }
.etiquette { font-size: calc(7pt * var(--k)); }
.page-tete { display: flex; align-items: flex-end; justify-content: space-between; gap: 12pt; margin-bottom: calc(10pt * var(--k)); flex: none; }
.page-tete h2 { font-family: var(--f-titre); font-weight: 600; font-size: calc(23pt * var(--k)); line-height: 1.02; text-wrap: balance; }
.page-tete .etiquette { color: var(--c-rose-texte); display: block; margin-bottom: 3pt; }
.page-tete .mascotte { flex: none; }
.bloc-t { font-family: var(--f-titre); font-weight: 600; font-size: calc(10.5pt * var(--k)); display: flex; align-items: center; gap: 5pt; margin-bottom: calc(3pt * var(--k)); flex: none; }
.champ { display: flex; flex-wrap: wrap; align-items: flex-end; column-gap: calc(6pt * var(--k)); row-gap: 2pt; font-family: var(--f-titre); font-weight: 500; font-size: calc(9pt * var(--k)); line-height: 1.2; color: var(--c-encre); }
.champ-l { flex: 0 1 auto; padding-bottom: 1.5pt; }
.champ-r { flex: 1 0 auto; display: flex; align-items: flex-end; gap: calc(9pt * var(--k)); min-width: 1.6in; }
.chacun { flex: 1 1 0; display: flex; align-items: flex-end; gap: 3pt; min-width: 0.7in; }
.chacun .pion { margin-bottom: 2pt; }
.sur10 { flex: none; display: flex; align-items: flex-end; gap: 3pt; }
.sur10 span.n { padding-bottom: 1.5pt; color: var(--c-encre-douce); }
.opts { flex: 1 0 auto; display: flex; flex-wrap: wrap; align-items: center; gap: 3pt calc(10pt * var(--k)); padding-bottom: 1.5pt; }
.opt { display: inline-flex; align-items: center; gap: 3pt; white-space: nowrap; }
.ligne-l { display: flex; align-items: flex-end; gap: 6pt; font-family: var(--f-titre); font-weight: 500; font-size: calc(9.6pt * var(--k)); }
.ligne-l > span:not(.trait) { padding-bottom: 1.5pt; }

/* ── La page d'une aventure ── */
.av { flex: 1; min-height: 0; display: flex; flex-direction: column; gap: calc(7pt * var(--k)); --cat: #e17398; --cat-t: #b12559; --cat-p: #fbe3ec; }
.av-tete { display: flex; align-items: flex-start; gap: calc(12pt * var(--k)); flex: none; }
.av-num { font-family: var(--f-titre); font-weight: 700; font-size: calc(52pt * var(--k)); line-height: 0.82; letter-spacing: -0.03em; color: var(--cat); flex: none; padding-top: 2pt; }
.av-tete-d { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: calc(5pt * var(--k)); }
.tags { display: flex; flex-wrap: wrap; gap: 4pt; }
.tag { display: inline-flex; align-items: center; gap: 3.5pt; padding: 2pt 7pt; border-radius: 99pt; font-family: var(--f-titre); font-weight: 600; font-size: calc(7.8pt * var(--k)); white-space: nowrap; background: #fff; border: 0.8pt solid #e2d2d9; color: var(--c-encre); }
.tag--cat { background: var(--cat-p); border-color: var(--cat-p); color: var(--cat-t); }
.av-titre { font-family: var(--f-titre); font-weight: 600; font-size: calc(22pt * var(--k)); line-height: 1.03; text-wrap: balance; }
.av-idee { font-size: calc(10pt * var(--k)); line-height: 1.46; flex: none; }
.av-corps { flex: 1; min-height: 0; display: grid; grid-template-columns: minmax(0, 1fr) 2.5in; gap: 0.25in; }
.feuille--verso .av-corps { grid-template-columns: 2.5in minmax(0, 1fr); }
.feuille--verso .av-d { order: -1; }
.av-g { min-height: 0; display: flex; flex-direction: column; gap: calc(8pt * var(--k)); }
.av-quand { display: flex; align-items: flex-end; gap: 6pt; font-family: var(--f-titre); font-weight: 600; font-size: calc(9.5pt * var(--k)); color: var(--c-encre-douce); flex: none; }
.av-quand > span:not(.trait) { padding-bottom: 1.5pt; }
.av-quand .trait:first-of-type { flex: 0 0 1.35in; }
.histoire { flex: none; border: 1.1pt solid var(--cat); border-radius: 9pt; padding: calc(6pt * var(--k)) calc(9pt * var(--k)) calc(7pt * var(--k)); display: flex; flex-direction: column; gap: calc(5.5pt * var(--k)); }
.histoire-t { font-family: var(--f-titre); font-weight: 600; font-size: calc(8.6pt * var(--k)); color: var(--cat-t); display: flex; align-items: center; gap: 4pt; }
.retenir { flex: 1 1 0; min-height: 0; display: flex; flex-direction: column; }
.retenir h4 { font-family: var(--f-titre); font-weight: 600; font-size: calc(9.5pt * var(--k)); display: flex; align-items: center; gap: 5pt; flex: none; }
.av-d { min-height: 0; display: flex; flex-direction: column; align-items: center; gap: calc(9pt * var(--k)); }
.photo { position: relative; flex: none; width: 2.35in; height: 3.3in; margin-top: 4pt; transform: rotate(var(--rot, 1.6deg)); }
.photo-in { position: absolute; inset: 0; border: 1.3pt dashed #c3abb7; border-radius: 3pt; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4pt; text-align: center; color: #9b8590; font-size: calc(7.6pt * var(--k)); line-height: 1.3; padding: 10pt; background: #fff; }
.photo-in b { font-family: var(--f-titre); font-weight: 600; font-size: calc(9pt * var(--k)); color: #8a7480; }
.photo .scotch { position: absolute; width: 0.85in; height: 0.25in; top: -0.11in; left: 50%; transform: translateX(-50%) rotate(-3deg); opacity: 0.55; }
.photo-leg { flex: none; margin-top: -3pt; font-family: var(--f-plume); font-style: italic; font-size: calc(9pt * var(--k)); color: #9b8590; text-align: center; }
.notes { flex: none; width: 100%; display: flex; flex-direction: column; gap: 4pt; border: 1pt solid #e2d2d9; border-radius: 9pt; padding: 6pt 9pt; }
.notes h4 { font-family: var(--f-titre); font-weight: 600; font-size: calc(8.8pt * var(--k)); }
.note-l { display: flex; align-items: center; justify-content: space-between; gap: 6pt; font-family: var(--f-titre); font-weight: 600; font-size: calc(8.4pt * var(--k)); }
.note-l .qui { display: flex; align-items: center; gap: 4pt; }
.note-l .coeurs { display: flex; gap: 2.5pt; }
.souvenir { flex: 1 1 0; min-height: 0.7in; width: 100%; border: 1.2pt dashed #c9b4be; border-radius: 9pt; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2pt; text-align: center; color: #9b8590; font-size: calc(7.4pt * var(--k)); line-height: 1.3; padding: 6pt 10pt; }
.souvenir b { font-family: var(--f-titre); font-weight: 600; font-size: calc(8.8pt * var(--k)); color: #8a7480; }

/* ── Pages d'ouverture ── */
.titre-p { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 14pt; }
.titre-p .duo { display: flex; align-items: flex-end; gap: 0.12in; }
.titre-p h1 { font-family: var(--f-titre); font-weight: 700; font-size: 40pt; line-height: 0.95; }
.titre-p h1 .titre-cent { margin: 0 auto 4pt; }
.titre-p h1 b { display: block; color: var(--c-rose); font-size: 96pt; line-height: 0.85; letter-spacing: -0.03em; -webkit-text-stroke: 2.2pt var(--c-encre); paint-order: stroke fill; }
.titre-p .sous { font-family: var(--f-titre); font-weight: 500; font-size: 13pt; color: var(--c-violet-texte); }
.titre-p .marque { margin-top: 18pt; display: flex; align-items: center; gap: 6pt; font-family: var(--f-titre); font-weight: 600; font-size: 11pt; color: var(--c-encre-douce); }
.titre-p .marque img { width: 0.3in; height: 0.3in; }
.copy { flex: 1; display: flex; flex-direction: column; justify-content: flex-end; gap: 7pt; font-size: 7.8pt; line-height: 1.5; color: var(--c-encre-douce); max-width: 4.8in; }
.copy b { color: var(--c-encre); }
.anous { flex: 1; min-height: 0; display: flex; flex-direction: column; gap: calc(14pt * var(--k)); }
.noms { display: grid; grid-template-columns: 1fr 1fr; gap: 0.35in; }
.nom { display: flex; flex-direction: column; gap: 6pt; align-items: center; text-align: center; }
.nom .qui { display: flex; align-items: center; gap: 5pt; font-family: var(--f-titre); font-weight: 600; font-size: 11pt; }
.nom .trait { width: 100%; height: 26pt; flex: none; }
.nom small { font-size: 7pt; color: var(--c-encre-douce); }
.cadeau { flex: 1; min-height: 0; border: 1.2pt dashed #d7b8c6; border-radius: 12pt; padding: 10pt 14pt; display: flex; flex-direction: column; gap: 6pt; }
.etapes { display: grid; grid-template-columns: 1fr 1fr; gap: calc(10pt * var(--k)) calc(14pt * var(--k)); flex: none; }
.etape { border: 1pt solid #e2d2d9; border-radius: 12pt; padding: calc(9pt * var(--k)) calc(11pt * var(--k)); }
.etape h3 { font-family: var(--f-titre); font-weight: 600; font-size: calc(11.5pt * var(--k)); line-height: 1.15; margin-bottom: 3pt; display: flex; align-items: center; gap: 6pt; }
.etape p { font-size: calc(9pt * var(--k)); line-height: 1.45; }
.etape-n { flex: none; width: 18pt; height: 18pt; border-radius: 99pt; background: var(--c-rose); color: #fff; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; font-size: 9.5pt; }
.mode-bas { flex: 1; min-height: 0; display: grid; grid-template-columns: minmax(0, 1fr) 2.55in; gap: 0.3in; margin-top: calc(14pt * var(--k)); align-items: start; }
.feuille--verso .mode-bas { grid-template-columns: 2.55in minmax(0, 1fr); }
.feuille--verso .mode-bas .apercu-bloc { order: -1; }
.legende-tags { display: grid; grid-template-columns: max-content minmax(0, 1fr); gap: calc(7pt * var(--k)) 10pt; align-items: center; font-size: calc(8.8pt * var(--k)); line-height: 1.35; }
.legende-tags > div { display: contents; }
.legende-tags .tag { justify-self: start; }
.conseil { flex: none; display: flex; align-items: center; gap: 10pt; font-size: calc(8.6pt * var(--k)); line-height: 1.45; color: var(--c-encre-douce); border-top: 0.8pt solid #eadbe2; padding-top: 9pt; margin-top: calc(10pt * var(--k)); }
.apercu-bloc { display: flex; flex-direction: column; align-items: center; gap: 6pt; }
.apercu-bloc .photo-leg { margin: 0; }
.apercu { position: relative; background: #fff; box-shadow: 0 0 0 1pt #e2d2d9; border-radius: 3pt; overflow: hidden; }
.apercu-zone { position: absolute; transform-origin: 0 0; }
.familles { display: grid; grid-template-columns: 1fr 1fr; gap: calc(10pt * var(--k)) calc(14pt * var(--k)); flex: none; }
.famille { border: 1.1pt solid var(--cat); border-radius: 12pt; padding: calc(10pt * var(--k)) calc(12pt * var(--k)); display: flex; flex-direction: column; gap: 4pt; }
.famille h3 { font-family: var(--f-titre); font-weight: 600; font-size: calc(13pt * var(--k)); display: flex; align-items: center; gap: 6pt; color: var(--cat-t); }
.famille p { font-size: calc(9pt * var(--k)); line-height: 1.42; }
.famille .ex { margin: 3pt 0 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 2pt; font-size: calc(8.4pt * var(--k)); }
.famille .ex li { display: flex; gap: 5pt; align-items: baseline; }
.famille .ex b { font-family: var(--f-titre); font-weight: 600; color: var(--cat-t); min-width: 16pt; text-align: right; }
.famille .compte { font-family: var(--f-titre); font-weight: 600; font-size: calc(8.4pt * var(--k)); color: var(--c-encre-douce); }
.famille-pref { margin-top: auto; padding-top: 10pt; display: flex; align-items: flex-end; gap: 12pt; flex: none; }
.famille-pref .ligne-l { flex: 1; }

/* ── La liste ── */
.liste { flex: 1; display: grid; grid-template-columns: 1fr 1fr; grid-auto-flow: column; grid-template-rows: repeat(25, auto); column-gap: 0.22in; align-content: start; }
.liste-item { display: grid; grid-template-columns: auto 13pt minmax(0, 1fr) auto auto; gap: 4pt; align-items: center; font-size: calc(8.4pt * var(--k)); line-height: 1.15; padding: calc(3.1pt * var(--k)) 0; border-bottom: 0.75pt solid #eadde3; }
.liste-item .n { font-family: var(--f-titre); font-weight: 600; color: var(--c-encre-douce); font-size: calc(7.6pt * var(--k)); text-align: right; }
.liste-item .t { display: flex; align-items: center; gap: 4pt; min-width: 0; }
.liste-item .pg { font-family: var(--f-titre); font-weight: 500; font-size: 7pt; color: #8f7984; min-width: 19pt; text-align: right; }
.legende-liste { flex: none; margin-top: calc(10pt * var(--k)); display: flex; flex-wrap: wrap; gap: 4pt 6pt; align-items: center; }

/* ── Nous deux (début et fin) ── */
.nd { flex: 1; min-height: 0; display: grid; grid-template-columns: minmax(0, 1fr) 2.3in; gap: 0.25in; }
.feuille--verso .nd { grid-template-columns: 2.3in minmax(0, 1fr); }
.feuille--verso .nd-d { order: -1; }
.nd-g { min-height: 0; display: flex; flex-direction: column; gap: calc(9pt * var(--k)); }
.nd-d { display: flex; flex-direction: column; gap: 12pt; align-items: center; }
.nd-communs { display: grid; grid-template-columns: 1fr 1fr; gap: calc(7pt * var(--k)) 14pt; flex: none; }
.nd-table { display: grid; grid-template-columns: minmax(1.2in, auto) 1fr 1fr; gap: calc(6pt * var(--k)) 10pt; align-items: end; font-family: var(--f-titre); font-weight: 500; font-size: calc(9pt * var(--k)); flex: none; }
.nd-table .th { display: flex; align-items: center; gap: 4pt; font-weight: 600; justify-content: center; }
.nd-table .l { max-width: 1.7in; line-height: 1.15; padding-bottom: 1.5pt; }
.nd-table .trait { min-width: 0; }
.nd-bloc { flex: 1 1 0; min-height: 0; display: flex; flex-direction: column; }
.nd-bloc--fixe { flex: none; }
.nd-bloc h4 { font-family: var(--f-titre); font-weight: 600; font-size: calc(9.5pt * var(--k)); flex: none; display: flex; align-items: center; gap: 5pt; }
.photo--petite { width: 2.15in; height: 2.75in; }

/* ── Aventure à vous ── */
.choix-cats { display: flex; flex-wrap: wrap; gap: 4pt 9pt; align-items: center; font-family: var(--f-titre); font-weight: 600; font-size: calc(8.4pt * var(--k)); flex: none; }
.vierge-num { font-family: var(--f-titre); font-weight: 700; font-size: calc(52pt * var(--k)); line-height: 0.82; color: #e3cfd8; flex: none; }

/* ── Voyages ── */
.voy-num { flex: none; display: flex; flex-direction: column; align-items: flex-start; gap: 1pt; }
.voy-num .etiquette { color: var(--c-violet-texte); display: flex; align-items: center; gap: 4pt; }
.voy-num b { font-family: var(--f-titre); font-weight: 700; font-size: calc(52pt * var(--k)); line-height: 0.82; color: var(--c-violet); letter-spacing: -0.03em; }
.destination { font-family: var(--f-titre); font-weight: 600; font-size: calc(10.5pt * var(--k)); display: flex; align-items: flex-end; gap: 6pt; color: var(--c-encre-douce); }
.destination > span:not(.trait) { padding-bottom: 2pt; }
.destination .trait { height: 30pt; border-bottom-width: 1.1pt; }
.billet { flex: 1 1 0; min-height: 0.8in; width: 100%; border: 1.2pt dashed #c3abb7; border-radius: 6pt; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 2pt; color: #9b8590; font-size: calc(7.4pt * var(--k)); padding: 6pt 10pt; }
.billet b { font-family: var(--f-titre); font-weight: 600; font-size: calc(8.8pt * var(--k)); color: #8a7480; }
.envies { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.envie { flex: 1 1 0; max-height: 0.44in; display: grid; grid-template-columns: auto 1fr auto; align-items: end; gap: 8pt; font-family: var(--f-titre); font-weight: 500; font-size: calc(8pt * var(--k)); color: var(--c-encre-douce); padding-bottom: 3pt; }
.envie .trait { height: 100%; }
.envie .qui { display: flex; align-items: center; gap: 4pt; }

/* ── Historique des tests ── */
.hist { flex: 1; min-height: 0; display: flex; flex-direction: column; justify-content: space-between; gap: calc(8pt * var(--k)); }
.hist-intro { font-size: calc(9.2pt * var(--k)); line-height: 1.45; flex: none; max-width: 6.4in; }
.htest { flex: none; border: 1.1pt solid #e2d2d9; border-radius: 11pt; padding: calc(8pt * var(--k)) calc(12pt * var(--k)) calc(9pt * var(--k)); display: flex; flex-direction: column; gap: calc(6pt * var(--k)); }
.htest-tete { display: flex; align-items: flex-end; gap: 8pt; }
.htest-type { flex: none; font-family: var(--f-titre); font-weight: 600; font-size: calc(8.4pt * var(--k)); color: #fff; background: var(--htype, var(--c-violet)); border-radius: 99pt; padding: 2.5pt 9pt; margin-bottom: 1pt; }
.htest-aide { flex: none; font-size: calc(7.6pt * var(--k)); color: var(--c-encre-douce); padding-bottom: 2.5pt; max-width: 1.7in; line-height: 1.2; }
.hgrille { display: grid; grid-template-columns: 0.95in 1.05in minmax(0, 1fr) auto; column-gap: 10pt; row-gap: calc(5pt * var(--k)); align-items: end; font-family: var(--f-titre); font-weight: 500; font-size: calc(9pt * var(--k)); }
.hth { font-weight: 600; font-size: calc(7.6pt * var(--k)); color: var(--c-encre-douce); text-transform: uppercase; letter-spacing: 0.06em; }
.hrang { font-weight: 600; color: var(--htype-t); padding-bottom: 1.5pt; line-height: 1.1; }
.hcell { display: flex; align-items: flex-end; gap: 4pt; flex: 1 1 0; min-width: 0; }
.hcell .trait { min-width: 0.3in; }
.hcell .pion { margin-bottom: 2pt; }
.hcell--date { display: flex; }
.hcell--gagnant { flex: 0 0 auto; gap: 5pt; align-items: center; padding-bottom: 1.5pt; }
.hres { display: flex; align-items: flex-end; gap: 9pt; min-width: 0; }
.hevo { display: flex; gap: 6pt; align-items: center; padding-bottom: 1.5pt; color: var(--c-encre-douce); }

/* ── Palmarès et trophées ── */
.podium { display: flex; flex-direction: column; gap: calc(6pt * var(--k)); flex: none; }
.marche { display: grid; grid-template-columns: 26pt auto auto 1fr; align-items: end; gap: 7pt; font-family: var(--f-titre); font-weight: 500; font-size: calc(9pt * var(--k)); }
.marche > span:not(.trait):not(.rang) { padding-bottom: 1.5pt; }
.marche .rang { font-weight: 700; font-size: calc(19pt * var(--k)); line-height: 1; color: var(--c-rose-texte); text-align: center; }
.compteurs { display: grid; grid-template-columns: 1fr 1fr; gap: 8pt 18pt; flex: none; }
.trophees { flex: 1; min-height: 0; display: grid; grid-template-columns: 1fr 1fr; grid-auto-rows: 1fr; gap: calc(9pt * var(--k)) calc(14pt * var(--k)); }
.trophee { border: 1pt solid #e2d2d9; border-radius: 11pt; padding: calc(7pt * var(--k)) calc(10pt * var(--k)) calc(8pt * var(--k)); display: flex; flex-direction: column; justify-content: space-between; gap: 6pt; }
.trophee h4 { font-family: var(--f-titre); font-weight: 600; font-size: calc(10pt * var(--k)); line-height: 1.15; display: flex; align-items: center; gap: 6pt; }
.trophee .lignes-t { display: flex; flex-direction: column; gap: calc(5pt * var(--k)); }
.photos4 { flex: 1; min-height: 0; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 0.28in 0.35in; padding: 8pt 6pt 0; }
.photos4 .cellule { display: flex; flex-direction: column; align-items: center; gap: 8pt; min-height: 0; }
.photos4 .photo { width: 100%; height: auto; flex: 1; margin: 0; }
.photos4 .trait { width: 80%; flex: none; }
.mot { flex: 1; min-height: 0; display: flex; flex-direction: column; gap: calc(12pt * var(--k)); }
.mot-tete { display: flex; align-items: center; gap: 0.2in; flex: none; }
.mot-tete h2 { font-family: var(--f-titre); font-weight: 600; font-size: calc(26pt * var(--k)); line-height: 1.05; }
.mot-tete p { font-size: calc(9.6pt * var(--k)); line-height: 1.5; margin-top: 6pt; }
`;
// Aucune taille de texte sous 7 pt, même réduite (règle d'impression de KDP).
css = css.replace(/font-size: calc\(([\d.]+)pt \* var\(--k\)\)/g, (m, x) => (+x * 0.8 < 7 ? `font-size: max(7pt, calc(${x}pt * var(--k)))` : m));

// La photo collée sur la page remplie : les deux personnages en pique-nique.
function scenePiqueNique() {
  const carreaux = Array.from({ length: 9 }, (_, i) => Array.from({ length: 4 }, (_, j) => ((i + j) % 2 ? '' : `<rect x="${10 + i * 9}" y="${104 + j * 7}" width="9" height="7" fill="#fff"/>`)).join('')).join('');
  return `<svg viewBox="0 0 100 140" preserveAspectRatio="xMidYMid slice" style="position:absolute;inset:0;width:100%;height:100%" aria-hidden="true">
<rect width="100" height="140" fill="#cfe9f8"/><circle cx="80" cy="20" r="8" fill="#f7cf5b" stroke="#2b1722" stroke-width="1.6"/>
<rect x="0" y="86" width="100" height="54" fill="#94c78e"/><path d="M0 86 H100" stroke="#2b1722" stroke-width="1.4"/>
<rect x="15" y="44" width="6" height="44" fill="#a8733f" stroke="#2b1722" stroke-width="1.4"/><circle cx="18" cy="38" r="17" fill="#6fb06a" stroke="#2b1722" stroke-width="1.6"/>
<rect x="10" y="104" width="81" height="28" fill="#f2a5bf" stroke="#2b1722" stroke-width="1.4"/>${carreaux}<rect x="10" y="104" width="81" height="28" fill="none" stroke="#2b1722" stroke-width="1.4"/>
<path d="M70 104 l2-11 h17 l2 11z" fill="#c98b4e" stroke="#2b1722" stroke-width="1.4" stroke-linejoin="round"/><path d="M74 93 c0-8 12-8 12 0" fill="none" stroke="#2b1722" stroke-width="1.4"/></svg>
<div style="position:absolute;left:6%;bottom:9%;display:flex;align-items:flex-end;gap:2%">${mascotte('rose', 'joie', { hauteur: '1.15in' })}${mascotte('violet', 'amoureux', { hauteur: '1.35in' })}</div>`;
}

// ── Le texte de chaque langue ─────────────────────────────────────────────
const CACHE = {};
export async function charger(lang) {
  const fichier = path.join(ICI, 'aventures', `${lang}.mjs`);
  if (!fs.existsSync(fichier)) throw new Error(`pas de textes pour ${lang} : ${fichier}`);
  CACHE[lang] = (await import(`./aventures/${lang}.mjs`)).default;
}

// ── Le livre ──────────────────────────────────────────────────────────────
export default function construire(lang = 'fr') {
  const T = CACHE[lang];
  if (!T) throw new Error(`textes non chargés pour ${lang} (appeler charger() avant)`);
  // Le français a ses espaces insécables ; dans toutes les langues, un nombre
  // reste collé à son unité.
  const tx = (s) => (lang === 'fr' ? esc(fr(s)) : esc(String(s).replace(/(\d) (€|£|\$|km\b|mi\b|min\b|hrs?\b|h\b|Std\.|ore\b|uur\b|%)/g, '$1\u00a0$2')));
  const U = T.ui;
  const lbl = (s) => tx(/[?!]$/.test(s.trim()) ? s : s + U.dp);
  if (T.aventures.length !== 100) throw new Error(`${lang} : ${T.aventures.length} aventures au lieu de 100`);

  const tagCat = (k) => `<span class="tag tag--cat">${icone(k, 9.5, COULEURS[k].t)} ${tx(T.cats[k].nom)}</span>`;
  const tagCout = (p) => `<span class="tag">${pieces(p)} ${tx(T.couts[p])}</span>`;
  const tagDuree = (d) => `<span class="tag">${picto('horloge', 9)} ${tx(d)}</span>`;
  const tagSaison = (s) => `<span class="tag">${picto(s, 9, s === 'ete' ? '#d9a514' : '#3a8fc0')} ${tx(T.saisons[s])}</span>`;

  // Un champ « pour la petite histoire » (v : la réponse écrite à la main,
  // pour la page remplie du dos de la couverture).
  const ecrit = (t) => (t === undefined || t === null || t === '' ? '' : `<span class="ecrit">${tx(String(t))}</span>`);
  const trait = (v, classe = '') => `<span class="trait${classe}">${ecrit(v)}</span>`;
  const boite = (coche) => (coche ? '<span class="case case--cochee"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3.5 10.5l4.5 5L17 3.5" fill="none" stroke="#2f4f9a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></span>' : caseVide);
  const chacun = (a, b) => `<span class="chacun">${pion('rose', 8.5)}${trait(a)}</span><span class="chacun">${pion('violet', 8.5)}${trait(b)}</span>`;
  const quiCoche = (autres = [], v) => `<span class="opts"><span class="opt">${pion('rose', 8.5)}${boite(v === 'rose')}</span><span class="opt">${pion('violet', 8.5)}${boite(v === 'violet')}</span>${autres.map((o, i) => `<span class="opt">${boite(v === i)} ${tx(o)}</span>`).join('')}</span>`;
  function champ(code, v) {
    const type = code[0];
    const [libelle, ...choix] = code.slice(2).split('|');
    const l = `<span class="champ-l">${lbl(libelle)}</span>`;
    const deux = Array.isArray(v) ? v : [];
    if (type === 'L') return `<div class="champ">${l}<span class="champ-r">${trait(v)}</span></div>`;
    if (type === 'X') return `<div class="champ">${l}<span class="champ-r">${chacun(deux[0], deux[1])}</span></div>`;
    if (type === 'N') {
      const n = (qui, val) => `<span class="sur10">${pion(qui, 8.5)}${trait(val, ' trait--court')}<span class="n">${tx(U.sur10)}</span></span>`;
      return `<div class="champ">${l}<span class="champ-r">${n('rose', deux[0])}${n('violet', deux[1])}</span></div>`;
    }
    if (type === 'Q') return `<div class="champ">${l}${quiCoche(choix, v)}</div>`;
    if (type === 'C') return `<div class="champ">${l}<span class="opts">${choix.map((o, i) => `<span class="opt">${boite(v === i)} ${tx(o)}</span>`).join('')}</span></div>`;
    throw new Error(`champ inconnu : ${code}`);
  }

  const coeurs = (couleur, plein = 0) => Array.from({ length: 5 }, (_, i) => coeur(11.5, { couleur, plein: i < plein })).join('');
  const notes = (ex = null) => `<div class="notes"><h4>${tx(U.note)}</h4>
<div class="note-l"><span class="qui">${pion('rose')} ${tx(U.rose)}</span><span class="coeurs">${coeurs('#c9557c', ex ? ex[0] : 0)}</span></div>
<div class="note-l"><span class="qui">${pion('violet')} ${tx(U.violet)}</span><span class="coeurs">${coeurs('#7f4db3', ex ? ex[1] : 0)}</span></div></div>`;
  const photo = (rot, couleur = '#e17398', classe = '', image = '') => `<div class="photo peut-deborder ${classe}" style="--rot:${rot}deg">${image ? `<div class="photo-img">${image}</div>` : `<div class="photo-in"><b>${tx(U.photo)}</b>${tx(U.photoAide)}</div>`}${scotch(couleur)}</div>`;
  const remplir = (min, { fixe = 0, max = 0, texte = '' } = {}) => `<div class="remplir${fixe ? ' remplir--fixe' : ''}" data-min="${min}"${max ? ` data-max="${max}"` : ''}${fixe ? ` style="height:calc(var(--lh) * ${fixe})" data-max="${fixe}"` : ''}>${texte ? `<div class="ecrit-bloc">${tx(texte)}</div>` : ''}</div>`;
  const retenir = (ex = null) => `<div class="retenir"><h4>${pion('rose')} ${tx(U.retenirRose)}</h4>${remplir(2, { texte: ex ? ex.rose : '' })}</div>
<div class="retenir"><h4>${pion('violet')} ${tx(U.retenirViolet)}</h4>${remplir(2, { texte: ex ? ex.violet : '' })}</div>`;
  const quand = (a = U.le, b = U.a, v = []) => `<div class="av-quand"><span>${tx(a)}</span>${trait(v[0])}<span>${tx(b)}</span>${trait(v[1])}</div>`;
  const tete = (etiquette, titre, droite = '') => `<div class="page-tete"><div><span class="etiquette">${tx(etiquette)}</span><h2>${tx(titre)}</h2></div>${droite}</div>`;

  function pageAventure(n, ex = null) {
    const a = T.aventures[n - 1];
    const C = COULEURS[a.c];
    const folio = DEBUT_AVENTURES + n - 1;
    const tags = [tagCat(a.c), tagCout(a.p), tagDuree(a.d)].concat(a.s ? [tagSaison(a.s)] : []).join('');
    return {
      folio, titre: `${U.aventure} ${n}`,
      html: `<div class="av${ex ? ' av--rempli' : ''}" style="--cat:${C.c};--cat-t:${C.t};--cat-p:${C.p}">
<div class="av-tete"><div class="av-num">${String(n).padStart(2, '0')}</div><div class="av-tete-d"><div class="tags">${tags}</div><h2 class="av-titre">${tx(a.t)}</h2></div></div>
<p class="av-idee">${tx(a.i)}</p>
<div class="av-corps">
<div class="av-g">${quand(U.le, U.a, ex ? ex.quand : [])}
<div class="histoire"><div class="histoire-t">${picto('crayon', 9, C.t)} ${tx(U.histoire)}</div>${a.f.map((f, i) => champ(f, ex ? ex.champs[i] : undefined)).join('')}</div>
${retenir(ex)}
</div>
<div class="av-d">${photo(folio % 2 ? 1.6 : -1.6, C.c, '', ex ? scenePiqueNique() : '')}<div class="photo-leg">${tx(U.legende)}</div>${notes(ex ? ex.coeurs : null)}<div class="souvenir"><b>${tx(U.souvenir)}</b>${tx(U.souvenirAide)}</div></div>
</div></div>`,
    };
  }
  // Une page d'aventure en réduction (mode d'emploi, quatrième de couverture).
  const ZONE_L = 8.5 - (0.55 + 0.1) - 0.5;
  const ZONE_H = 8.5 - 0.55 - 0.72;
  const apercu = (n, largeur, ex = null) => {
    const s = largeur / 8.5;
    return `<div class="apercu" style="width:${largeur}in;height:${largeur}in"><div class="apercu-zone feuille--recto" style="left:${0.65 * s}in;top:${0.55 * s}in;width:${ZONE_L}in;height:${ZONE_H}in;transform:scale(${s});display:flex;flex-direction:column">${pageAventure(n, ex).html}</div></div>`;
  };

  // ── Les pages ──
  const P = T.pages;
  const pages = [];

  pages.push({
    folio: 1, titre: 'Titre', sansFolio: true,
    html: `<div class="titre-p">
<div class="duo">${mascotte('rose', 'joie', { hauteur: '1.45in' })}${mascotte('violet', 'salut', { hauteur: '1.65in' })}</div>
<h1>${T.couverture.titre1 === '100' ? cent({ taille: 96, epaisseur: 2.2, classe: 'titre-cent' }) : `<b>${tx(T.couverture.titre1)}</b>`}${tx(T.couverture.titre2)} ${tx(T.couverture.titre3)}</h1>
<p class="sous">${tx(P.titre.sous)}</p>
<div class="marque"><img src="${LOGO}" alt="">Quiz Couple</div>
</div>`,
  });

  pages.push({
    folio: 2, titre: 'Mentions', sansFolio: true,
    html: `<div class="copy">${P.mentions.lignes.map((l, i) => `<p>${i === 0 ? `<b>${tx(l)}</b>` : tx(l)}</p>`).join('')}
${T.isbn ? `<p>${tx(P.mentions.isbn)} ${tx(T.isbn)}</p>` : ''}
<p>${tx(P.mentions.impression)}</p>
<p>${tx(P.mentions.prudence)}</p></div>`,
  });

  pages.push({
    folio: 3, titre: P.nous.titre,
    html: `${tete(P.nous.etiquette, P.nous.titre)}
<div class="anous">
<div class="noms">
<div class="nom">${mascotte('rose', 'mignon', { hauteur: '1.35in' })}<div class="qui">${pion('rose', 11)} ${tx(U.roseNom)}</div><span class="trait"></span><small>${tx(P.nous.prenom)}</small></div>
<div class="nom">${mascotte('violet', 'amoureux', { hauteur: '1.35in' })}<div class="qui">${pion('violet', 11)} ${tx(U.violetNom)}</div><span class="trait"></span><small>${tx(P.nous.prenom)}</small></div>
</div>
<div class="ligne-l"><span>${lbl(P.nous.ensemble)}</span><span class="trait"></span></div>
<div class="ligne-l"><span>${lbl(P.nous.premiere)}</span><span class="trait"></span></div>
<div class="cadeau"><div class="ligne-l"><span>${tx(P.nous.offert)}</span><span class="trait"></span><span>${tx(P.nous.offertLe)}</span><span class="trait trait--moyen"></span></div>
<div class="bloc-t" style="margin-top:4pt">${coeur(10, { couleur: '#c9557c' })} ${tx(P.nous.mot)}</div>${remplir(3)}</div>
</div>`,
  });

  const legende = `<div class="legende-tags">
${T.couts.map((c, i) => `<div><span class="tag">${pieces(i)} ${tx(c)}</span><span>${tx(T.coutsAide[i] || '')}</span></div>`).join('')}
<div><span class="tag">${picto('horloge', 9)} ${tx(T.aventures[0].d)}</span><span>${tx(P.mode.duree)}</span></div>
<div><span class="tag">${picto('ete', 9, '#d9a514')} ${tx(T.saisons.ete)}</span><span>${tx(P.mode.saison)}</span></div>
</div>`;
  pages.push({
    folio: 4, titre: P.mode.titre,
    html: `${tete(P.mode.etiquette, P.mode.titre, mascotte('rose', 'salut', { hauteur: '0.85in' }))}
<div class="etapes">${P.mode.etapes.map(([h, p], i) => `<div class="etape"><h3><span class="etape-n">${i + 1}</span>${tx(h)}</h3><p>${tx(p)}</p></div>`).join('')}</div>
<div class="mode-bas tient"><div><div class="bloc-t">${tx(P.mode.legende)}</div>${legende}</div>
<div class="apercu-bloc">${apercu(13, 2.55)}<div class="photo-leg">${tx(P.mode.apercu)}</div></div></div>
<div class="conseil">${picto('etoile', 14, '#d9a514')}<span>${tx(P.mode.colle)}</span></div>`,
  });

  pages.push({
    folio: 5, titre: P.familles.titre,
    html: `${tete(P.familles.etiquette, P.familles.titre, mascotte('violet', 'joie', { hauteur: '0.9in' }))}
<div class="familles">${Object.keys(COULEURS).map((k) => {
      const liste = T.aventures.map((a, i) => ({ ...a, n: i + 1 })).filter((a) => a.c === k);
      return `<div class="famille" style="--cat:${COULEURS[k].c};--cat-t:${COULEURS[k].t}"><h3>${icone(k, 15)} ${tx(T.cats[k].nom)}</h3><p>${tx(T.cats[k].desc)}</p>
<ul class="ex">${liste.slice(0, 3).map((a) => `<li><b>${a.n}</b>${tx(a.t)}</li>`).join('')}</ul>
<span class="compte">${liste.length} ${tx(P.familles.compte)}</span></div>`;
    }).join('')}</div>
<div class="famille-pref"><div class="ligne-l"><span>${lbl(P.familles.bas)}</span><span class="trait"></span></div></div>`,
  });

  const item = (n) => {
    const a = T.aventures[n - 1];
    return `<div class="liste-item">${caseVide}<span class="n">${n}</span><span class="t">${icone(a.c, 8.5)} ${tx(a.t)}</span>${pieces(a.p, 6.5)}<span class="pg">${tx(U.page)} ${DEBUT_AVENTURES + n - 1}</span></div>`;
  };
  const legendeCats = `<div class="legende-liste">${Object.keys(COULEURS).map((k) => `<span class="tag tag--cat" style="--cat-p:${COULEURS[k].p};--cat-t:${COULEURS[k].t}">${icone(k, 9, COULEURS[k].t)} ${tx(T.cats[k].nom)}</span>`).join('')}</div>`;
  pages.push({ folio: 6, titre: P.liste.titre, html: `${tete(P.liste.etiquette, P.liste.titre)}<div class="liste">${Array.from({ length: 50 }, (_, i) => item(i + 1)).join('')}</div>` });
  pages.push({ folio: 7, titre: P.liste.titre2, html: `${tete(P.liste.etiquette2, P.liste.titre2)}<div class="liste">${Array.from({ length: 50 }, (_, i) => item(i + 51)).join('')}</div>${legendeCats}` });

  // Nous deux, au début et à la fin
  function nousDeux(folio, Q, debut) {
    return {
      folio, titre: Q.titre,
      html: `${tete(Q.etiquette, Q.titre)}
<div class="nd"><div class="nd-g">
<div class="ligne-l"><span>${lbl(Q.date)}</span><span class="trait"></span></div>
<div class="ligne-l"><span>${lbl(Q.ensemble)}</span><span class="trait"></span></div>
<div class="nd-bloc nd-bloc--fixe"><h4>${lbl(debut ? Q.rencontre : Q.change)}</h4>${remplir(2, { fixe: debut ? 2 : 3 })}</div>
<div class="nd-communs">${Q.communs.map((c) => `<div class="ligne-l"><span>${lbl(c)}</span><span class="trait"></span></div>`).join('')}</div>
<div class="nd-table"><span></span><span class="th">${pion('rose')} ${tx(U.rose)}</span><span class="th">${pion('violet')} ${tx(U.violet)}</span>
${Q.chacun.map((c) => `<span class="l">${tx(c)}</span><span class="trait"></span><span class="trait"></span>`).join('')}</div>
<div class="nd-bloc"><h4>${tx(debut ? Q.projection : Q.prochaine)}</h4>${remplir(2)}</div>
</div>
<div class="nd-d">${photo(folio % 2 ? 1.5 : -1.5, '#e17398', 'photo--petite')}<div class="photo-leg">${tx(Q.photo)}</div>${debut ? mascotte('rose', 'joie', { hauteur: '1.25in' }) : mascotte('violet', 'amoureux', { hauteur: '1.25in' })}</div>
</div>`,
    };
  }
  pages.push(nousDeux(8, P.debut, true));

  for (let n = 1; n <= 100; n++) pages.push(pageAventure(n));

  // Dix aventures à vous
  const Vg = P.vierge;
  const ligneLibre = `<div class="champ"><span class="champ-r"><span class="trait" style="flex:0 0 1.3in"></span><span style="padding-bottom:1.5pt">${tx(U.dp.trim())}</span><span class="trait"></span></span></div>`;
  for (let i = 0; i < 10; i++) {
    const n = 101 + i;
    const folio = 109 + i;
    pages.push({
      folio, titre: `${U.aventure} ${n}`,
      html: `<div class="av" style="--cat:#c9b4be;--cat-t:#785e6c;--cat-p:#f3ecef">
<div class="av-tete"><div class="vierge-num">${n}</div><div class="av-tete-d"><span class="etiquette" style="color:var(--c-rose-texte)">${tx(Vg.etiquette)}</span>
<div class="ligne-l"><span>${lbl(Vg.titre)}</span><span class="trait" style="height:24pt;border-bottom-width:1.1pt"></span></div></div></div>
<div class="choix-cats"><span>${lbl(Vg.famille)}</span>${Object.keys(COULEURS).map((k) => `<span class="opt">${caseVide} ${icone(k, 9)} ${tx(T.cats[k].nom)}</span>`).join('')}</div>
<div class="choix-cats"><span>${lbl(Vg.cout)}</span>${T.couts.map((c, p) => `<span class="opt">${caseVide} ${pieces(p)} ${tx(c)}</span>`).join('')}<span style="margin-left:6pt">${lbl(Vg.duree)}</span><span class="trait trait--moyen" style="height:10pt"></span></div>
<div class="av-corps">
<div class="av-g">${quand()}
<div class="champ" style="flex:none"><span class="champ-l">${lbl(Vg.idee)}</span>${quiCoche()}</div>
<div class="histoire" style="--cat:#c9b4be"><div class="histoire-t">${picto('crayon', 9)} ${tx(U.histoire)}</div>${ligneLibre.repeat(3)}</div>
${retenir()}
</div>
<div class="av-d">${photo(folio % 2 ? 1.6 : -1.6, '#c9b4be')}<div class="photo-leg">${tx(U.legende)}</div>${notes()}<div class="souvenir"><b>${tx(U.souvenir)}</b>${tx(U.souvenirAide)}</div></div>
</div></div>`,
    });
  }

  // Nos voyages
  const VI = P.voyagesIntro;
  pages.push({
    folio: 119, titre: VI.titre,
    html: `${tete(VI.etiquette, VI.titre, `<div style="display:flex;align-items:flex-end;gap:4pt">${mascotte('rose', 'salut', { hauteur: '0.85in' })}${mascotte('violet', 'joie', { hauteur: '0.95in' })}</div>`)}
<p class="hist-intro" style="margin-bottom:calc(12pt * var(--k))">${tx(VI.texte)}</p>
<div class="bloc-t">${picto('avion', 12, '#7f4db3')} ${tx(VI.envies)}</div>
<div class="envies">${Array.from({ length: 14 }, () => `<div class="envie">${caseVide}<span class="trait"></span><span class="qui">${tx(VI.qui)} ${pion('rose', 8.5)}${caseVide} ${pion('violet', 8.5)}${caseVide}</span></div>`).join('')}</div>`,
  });
  const V = P.voyage;
  for (let i = 0; i < 10; i++) {
    const folio = 120 + i;
    pages.push({
      folio, titre: `${V.titre} ${i + 1}`,
      html: `<div class="av" style="--cat:#7f4db3;--cat-t:#6834b2;--cat-p:#ece2f6">
<div class="av-tete" style="align-items:flex-end"><div class="voy-num"><span class="etiquette">${picto('avion', 9, '#6834b2')} ${tx(V.titre)}</span><b>${String(i + 1).padStart(2, '0')}</b></div>
<div class="destination" style="flex:1"><span>${lbl(V.destination)}</span><span class="trait"></span></div></div>
<div class="av-corps">
<div class="av-g">${quand(V.du, V.au)}
<div class="champ" style="flex:none"><span class="champ-l">${lbl(V.transport)}</span><span class="opts">${V.transports.map((m) => `<span class="opt">${caseVide} ${tx(m)}</span>`).join('')}<span class="opt">${caseVide} <span class="trait" style="flex:0 0 0.5in;min-width:0.5in;height:10pt"></span></span></span></div>
<div class="histoire"><div class="histoire-t">${picto('crayon', 9, '#6834b2')} ${tx(U.histoire)}</div>
${[V.dormi, V.repas, V.galere, V.phrase, V.rapporte].map((l) => `<div class="champ"><span class="champ-l">${lbl(l)}</span><span class="champ-r"><span class="trait"></span></span></div>`).join('')}
<div class="champ"><span class="champ-l">${lbl(V.retour)}</span><span class="opts">${V.retours.map((r) => `<span class="opt">${caseVide} ${tx(r)}</span>`).join('')}</span></div></div>
<div class="retenir"><h4>${picto('etoile', 10, '#d9a514')} ${tx(V.moment)}</h4>${remplir(2)}</div>
${retenir()}
</div>
<div class="av-d">${photo(folio % 2 ? 1.6 : -1.6, '#7f4db3')}<div class="photo-leg">${tx(U.legende)}</div>${notes()}<div class="billet"><b>${tx(V.billet)}</b>${tx(V.billetAide)}</div></div>
</div></div>`,
    });
  }

  // L'historique des tests Quiz Couple : cinq façons de noter un résultat,
  // sans jamais nommer un test (les noms changent, les formats restent).
  const H = P.historique;
  const TYPES = { A: ['#e17398', '#b12559'], B: ['#7f4db3', '#6834b2'], C: ['#3a8fc0', '#246a93'], D: ['#d9a514', '#8f6a00'], E: ['#5fa058', '#3d7536'] };
  // Une boîte = le nom du test, puis deux rangées (la première fois, un an
  // après) : la date, le résultat sous sa forme, et l'évolution.
  const date = '<span class="hcell hcell--date"><span class="trait"></span></span>';
  const resultat = (type) => {
    if (type === 'A') return `<span class="hcell">${tx(H.score)}${tx(U.dp)}<span class="trait"></span></span>`;
    if (type === 'B') return `<span class="hcell">${pion('rose', 8.5)}<span class="trait"></span></span><span class="hcell">${pion('violet', 8.5)}<span class="trait"></span></span><span class="hcell">${tx(H.ensemble)}${tx(U.dp)}<span class="trait"></span></span>`;
    if (type === 'C') return `<span class="hcell">${pion('rose', 8.5)}<span class="trait"></span></span><span class="hcell">${pion('violet', 8.5)}<span class="trait"></span></span>`;
    if (type === 'D') return `<span class="hcell">${pion('rose', 8.5)}<span class="trait"></span></span><span class="hcell">${pion('violet', 8.5)}<span class="trait"></span></span><span class="hcell hcell--gagnant">${tx(H.gagnant)}${tx(U.dp)} <span class="opt">${pion('rose', 8.5)}${caseVide}</span><span class="opt">${pion('violet', 8.5)}${caseVide}</span><span class="opt">${caseVide} ${tx(H.egalite)}</span></span>`;
    return [0, 1, 2].map(() => `<span class="hcell"><span class="trait"></span>${tx(U.dp.trim())}<span class="trait trait--court"></span></span>`).join('');
  };
  const evolution = `<span class="hevo">${['monte', 'egal', 'descend'].map((k) => `<span class="opt">${caseVide}${picto(k, 8.5, '#785e6c')}</span>`).join('')}</span>`;
  const boiteTest = (type) => `<div class="htest" style="--htype:${TYPES[type][0]};--htype-t:${TYPES[type][1]}">
<div class="htest-tete"><span class="htest-type">${tx(H.types[type][0])}</span><span class="htest-aide">${tx(H.types[type][1])}</span><div class="ligne-l" style="flex:1"><span>${lbl(H.test)}</span><span class="trait"></span></div></div>
<div class="hgrille">
<span></span><span class="hth">${tx(H.le)}</span><span class="hth hth--res">${type === 'D' ? tx(H.points) : ''}</span><span class="hth">${tx(H.evolution)}</span>
<span class="hrang">${tx(H.premiere)}</span>${date}<span class="hres hres--${type}">${resultat(type)}</span><span></span>
<span class="hrang">${tx(H.apres)}</span>${date}<span class="hres hres--${type}">${resultat(type)}</span>${evolution}
</div></div>`;
  pages.push({
    folio: 130, titre: H.titre,
    html: `<div class="page-tete"><div><span class="etiquette">${tx(H.etiquette)}</span><h2>${tx(H.titre)}</h2><div class="plume" style="font-size:calc(13pt * var(--k));color:var(--c-violet-texte);margin-top:3pt">${tx(H.sous)}</div></div>${mascotte('violet', 'surprise', { hauteur: '0.9in' })}</div>
<div class="hist"><p class="hist-intro">${tx(H.texte)}</p>${['A', 'A', 'A', 'B'].map(boiteTest).join('')}</div>`,
  });
  pages.push({ folio: 131, titre: `${H.titre} (2)`, html: `<div class="hist">${['B', 'C', 'C', 'D', 'E'].map(boiteTest).join('')}</div>` });

  // Le palmarès, les trophées
  const PA = P.palmares;
  pages.push({
    folio: 132, titre: PA.titre,
    html: `${tete(PA.etiquette, PA.titre, mascotte('violet', 'joie', { hauteur: '0.95in' }))}
<div class="nd" style="grid-template-columns:minmax(0,1fr) 2.4in"><div class="nd-g">
<div class="bloc-t">${picto('coupe', 12, '#d9a514')} ${tx(PA.top)}</div>
<div class="podium">${[1, 2, 3, 4, 5].map((r) => `<div class="marche"><span class="rang">${r}</span><span>${tx(PA.numero)}</span><span class="trait trait--court"></span><span class="trait"></span></div>`).join('')}</div>
<div class="bloc-t" style="margin-top:calc(8pt * var(--k))">${picto('etoile', 12, '#e17398')} ${tx(PA.compteur)}</div>
<div class="compteurs">${PA.compteurs.map((c, i) => `<div class="ligne-l"><span>${lbl(c)}</span>${i === 3 ? `<span style="font-family:var(--f-plume);font-style:italic;color:var(--c-rose-texte)">${tx(PA.fousRires)}</span>` : `<span class="trait"></span>${i === 0 ? '<span>/ 110</span>' : ''}`}</div>`).join('')}</div>
<div class="nd-bloc" style="margin-top:calc(6pt * var(--k))"><h4>${picto('crayon', 10, '#7f4db3')} ${tx(PA.retenu)}</h4>${remplir(3)}</div>
</div>
<div class="nd-d" style="order:0">${photo(1.5, '#d9a514', 'photo--petite')}<div class="photo-leg">${tx(PA.photo)}</div><div class="photo-leg" style="font-family:var(--f-texte);font-style:normal;font-size:7.6pt">${tx(PA.photoAide)}</div></div>
</div>`,
  });
  const TR = P.trophees;
  pages.push({
    folio: 133, titre: TR.titre,
    html: `${tete(TR.etiquette, TR.titre, picto('coupe', 40, '#d9a514'))}
<div class="trophees">${TR.liste.map((l, i) => `<div class="trophee"><h4>${picto(i % 2 ? 'etoile' : 'coupe', 13, ['#e17398', '#7f4db3', '#3a8fc0', '#5fa058', '#d9a514', '#e8892e'][i % 6])} ${tx(l)}</h4><div class="lignes-t"><div class="ligne-l"><span>${tx(PA.numero)}</span><span class="trait trait--court"></span><span class="trait"></span></div><div class="ligne-l"><span>${lbl(TR.pourquoi)}</span><span class="trait"></span></div></div></div>`).join('')}</div>`,
  });

  pages.push(nousDeux(134, P.fin, false));

  const MF = P.motFin;
  pages.push({
    folio: 135, titre: MF.titre,
    html: `<div class="mot"><div class="mot-tete">${mascotte('rose', 'amoureux', { hauteur: '1.35in' })}${mascotte('violet', 'amoureux', { hauteur: '1.5in' })}<div><h2>${tx(MF.titre)}</h2><p>${tx(MF.texte)}</p></div></div>
<div class="nd-bloc"><h4>${pion('rose')} ${tx(MF.rose)}</h4>${remplir(3)}</div>
<div class="nd-bloc"><h4>${pion('violet')} ${tx(MF.violet)}</h4>${remplir(3)}</div>
<div class="ligne-l" style="max-width:3in;flex:none"><span>${tx(MF.date)}</span><span class="trait"></span></div></div>`,
  });

  const PH = P.photos;
  pages.push({
    folio: 136, titre: PH.titre,
    html: `${tete(PH.etiquette, PH.titre, picto('photo', 34, '#e17398'))}
<div class="photos4">${[-1.5, 1.2, 1.4, -1.2].map((r, i) => `<div class="cellule">${photo(r, ['#e17398', '#7f4db3', '#3a8fc0', '#d9a514'][i])}<span class="trait"></span></div>`).join('')}</div>`,
  });

  if (pages.length !== PAGES) throw new Error(`${lang} : ${pages.length} pages au lieu de ${PAGES}`);
  return {
    id: `aventures-${lang}`,
    lang,
    titre: T.livre.titre,
    sousTitre: T.livre.sousTitre,
    trim: { l: 8.5, h: 8.5 },
    papier: 'standard',
    encre: 'standard',
    pagesFinales: PAGES,
    margeInt: 0.55,
    margeExt: 0.5,
    margeHaut: 0.55,
    margeBas: 0.72,
    fond: '#ffffff',
    css,
    script: SCRIPT,
    pages,
    couverture: couverture(T, tx, lang, apercu),
    textes: T,
  };
}

// ── La mise en page dans le navigateur ────────────────────────────────────
// Pour chaque page : on réduit l'échelle des textes (--k) tant que la page
// déborde ou qu'un bloc à remplir n'a pas sa place minimale, puis on pose
// autant de lignes que la place le permet dans chaque bloc (hauteurs de mise
// en page, sans les réductions des aperçus).
const SCRIPT = `
window.__mettreEnPage = function () {
  var essai = document.createElement('div');
  essai.className = 'ligne';
  essai.style.height = 'var(--lh)';
  document.body.appendChild(essai);
  var LH = essai.offsetHeight;
  essai.remove();
  function deborde(zone) {
    var r = zone.getBoundingClientRect();
    var tous = zone.querySelectorAll('*');
    for (var i = 0; i < tous.length; i++) {
      var el = tous[i];
      if (el.ownerSVGElement || el.closest('.peut-deborder') || el.closest('.apercu')) continue;
      var b = el.getBoundingClientRect();
      if (b.width === 0 || b.height === 0) continue;
      if (b.bottom > r.bottom + 0.5 || b.right > r.right + 0.5 || b.left < r.left - 0.5) return true;
    }
    // Un bloc .tient garde tout son contenu au-dessus de son bord bas : sans
    // ça, la légende de l'aperçu du mode d'emploi passait sur le conseil du
    // bas sans sortir de la zone, donc sans être vue.
    var cs = zone.querySelectorAll('.tient');
    for (var j = 0; j < cs.length; j++) {
      var cb = cs[j].getBoundingClientRect();
      var ds = cs[j].querySelectorAll('*');
      for (var m = 0; m < ds.length; m++) {
        var d = ds[m];
        if (d.ownerSVGElement || (d.parentElement && d.parentElement.closest('.apercu'))) continue;
        var db = d.getBoundingClientRect();
        if (db.width === 0 || db.height === 0) continue;
        if (db.bottom > cb.bottom + 0.5) return true;
      }
    }
    return false;
  }
  function manque(zone) {
    var rs = zone.querySelectorAll('.remplir');
    for (var i = 0; i < rs.length; i++) {
      if (rs[i].closest('.apercu')) continue;
      var min = +(rs[i].dataset.min || 0);
      if (rs[i].offsetHeight < min * LH - 0.5) return true;
    }
    return false;
  }
  var rapport = [];
  document.querySelectorAll('.feuille').forEach(function (f) {
    var zone = f.querySelector('.zone');
    if (!zone) return;
    var k = 1;
    f.style.setProperty('--k', k);
    while ((deborde(zone) || manque(zone)) && k > 0.8) {
      k = Math.round((k - 0.02) * 100) / 100;
      f.style.setProperty('--k', k);
    }
    if (k < 1) rapport.push(f.dataset.folio + ':' + k);
  });
  // Couverture : le titre tient dans sa largeur, le sous-titre dans sa
  // hauteur, la colonne du dos dans sa page.
  document.querySelectorAll('.ajuste-l').forEach(function (el) {
    var parent = el.parentElement, fs = parseFloat(getComputedStyle(el).fontSize), min = fs * 0.6;
    while (parent.scrollWidth > parent.clientWidth + 1 && fs > min) { fs *= 0.97; el.style.fontSize = fs + 'px'; }
    if (fs < parseFloat(el.dataset.fs0 || 1e9)) rapport.push('titre:' + Math.round(fs * 0.75) + 'pt');
  });
  document.querySelectorAll('.ajuste-h').forEach(function (el) {
    var t = document.createElement('div'); t.style.height = el.dataset.maxH; document.body.appendChild(t);
    var maxH = t.offsetHeight; t.remove();
    var fs = parseFloat(getComputedStyle(el).fontSize), min = fs * 0.7;
    while (el.offsetHeight > maxH + 1 && fs > min) { fs *= 0.97; el.style.fontSize = fs + 'px'; }
  });
  var col = document.querySelector('.cvd-col');
  if (col) {
    var kc = 1;
    while (col.scrollHeight > col.clientHeight + 1 && kc > 0.74) { kc = Math.round((kc - 0.02) * 100) / 100; col.style.setProperty('--kc', kc); }
    if (kc < 1) rapport.push('dos:' + kc);
  }
  document.querySelectorAll('.remplir').forEach(function (r) {
    var n = Math.floor((r.offsetHeight + 0.5) / LH);
    var max = +(r.dataset.max || 0);
    if (max) n = Math.min(n, max);
    for (var i = 0; i < n; i++) { var l = document.createElement('div'); l.className = 'ligne'; r.appendChild(l); }
  });
  return rapport;
};
`;

// ── La couverture ─────────────────────────────────────────────────────────
// Face : le titre en très grand (lisible en vignette sur Amazon), la
// promesse en une ligne, trois photos instantanées cochées et les deux
// personnages. Dos : la question, le principe, trois points, une vraie page
// du livre en réduction. Tranche, face et dos dans le même jaune, pour
// qu'un léger décalage de la reliure ne se voie pas.
const JAUNE = '#ffd45c';
function couverture(T, tx, lang, apercu) {
  const C = T.couverture;
  const D = C.dos;
  const coche = (fait) => fait
    ? '<svg viewBox="0 0 40 40" class="coche" aria-hidden="true"><circle cx="20" cy="20" r="17" fill="#e17398" stroke="#2b1722" stroke-width="2.6"/><path d="M12 20.5l5.5 5.5L29 14" fill="none" stroke="#fff" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    : '<svg viewBox="0 0 40 40" class="coche" aria-hidden="true"><circle cx="20" cy="20" r="17" fill="#fff" stroke="#2b1722" stroke-width="2.6" stroke-dasharray="4 4"/></svg>';
  const scenes = [
    // la randonnée : soleil, montagnes
    `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="100" height="100" fill="#cfe9f8"/><circle cx="72" cy="28" r="11" fill="#f7cf5b" stroke="#2b1722" stroke-width="2.4"/><path d="M-4 104 L-4 70 L26 38 L46 58 L62 44 L104 82 L104 104 Z" fill="#94c78e" stroke="#2b1722" stroke-width="2.4" stroke-linejoin="round"/><path d="M26 38 L33 46 L28 48 L22 43 Z M62 44 L68 50 L63 52 L58 48 Z" fill="#fff" stroke="#2b1722" stroke-width="1.8" stroke-linejoin="round"/><path d="M40 100 C44 86 52 80 50 70" fill="none" stroke="#e8f4e4" stroke-width="4" stroke-linecap="round" stroke-dasharray="1 7"/></svg>`,
    // le bowling : une quille et la boule
    `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="100" height="100" fill="#ece2f6"/><path d="M0 78 H100 V100 H0Z" fill="#f3d9a7" stroke="#2b1722" stroke-width="2.4"/><path d="M60 22c-4 0-6 4-6 9 0 4 2 7 1 11-2 8-7 13-7 22 0 7 5 13 12 13s12-6 12-13c0-9-5-14-7-22-1-4 1-7 1-11 0-5-2-9-6-9z" fill="#fff" stroke="#2b1722" stroke-width="2.4" stroke-linejoin="round"/><path d="M54.6 38h10.8M53.8 42.5h12.4" stroke="#e17398" stroke-width="3"/><circle cx="31" cy="64" r="15" fill="#7f4db3" stroke="#2b1722" stroke-width="2.4"/><circle cx="27" cy="58" r="2.2" fill="#2b1722"/><circle cx="34" cy="57" r="2.2" fill="#2b1722"/><circle cx="31" cy="63" r="2.2" fill="#2b1722"/></svg>`,
    // la nuit sous la tente : étoiles, lune
    `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="100" height="100" fill="#2a1e36"/><path d="M73 15a10 10 0 1 0 9 14 8 8 0 1 1-9-14z" fill="#f7cf5b"/><g fill="#f7cf5b"><circle cx="20" cy="18" r="1.8"/><circle cx="38" cy="10" r="1.3"/><circle cx="50" cy="26" r="1.6"/><circle cx="12" cy="40" r="1.2"/><circle cx="88" cy="46" r="1.4"/></g><path d="M0 84 H100 V100 H0Z" fill="#3f6b3a"/><path d="M16 84 L48 34 L82 84 Z" fill="#e8892e" stroke="#2b1722" stroke-width="2.4" stroke-linejoin="round"/><path d="M48 34 L48 84 M40 84 L48 60 L56 84" fill="#ffd45c" stroke="#2b1722" stroke-width="2.4" stroke-linejoin="round"/></svg>`,
  ];
  const pola = (i, style, fait) => `<div class="cv-pola" style="${style}"><div class="cv-pola-img">${scenes[i]}</div><div class="cv-pola-leg">${tx(C.polas[i])}</div>${coche(fait)}</div>`;
  const prix = lang === 'fr' && T.prix ? `<div class="cv-prix">${tx(T.prix)}</div>` : '';
  return {
    fond: JAUNE,
    fondDos: JAUNE,
    fondTranche: JAUNE,
    css: `
.cv { position: absolute; inset: 0; color: #2b1722; }
.cv-marque { position: absolute; top: 0.62in; left: 0.5in; display: inline-flex; align-items: center; gap: 7pt; padding: 5pt 12pt 5pt 6pt; background: #fff; border-radius: 99pt; box-shadow: 0 0 0 1.6pt #2b1722; font-family: var(--f-titre); font-weight: 600; font-size: 13pt; }
.cv-marque img { width: 0.34in; height: 0.34in; }
.cv-titre { position: absolute; left: 0.45in; right: 0.55in; top: 1.15in; display: flex; align-items: center; gap: 0.16in; }
.cv-100 { font-family: var(--f-titre); font-weight: 700; font-size: 168pt; line-height: 0.8; letter-spacing: -0.045em; color: #e17398; -webkit-text-stroke: 5pt #2b1722; paint-order: stroke fill; text-shadow: 0.07in 0.07in 0 #2b1722; flex: none; }
.cv-mots { font-family: var(--f-titre); font-weight: 700; font-size: 50pt; line-height: 0.92; letter-spacing: -0.01em; display: flex; flex-direction: column; }
.cv-mots span + span { color: #6834b2; }
.cv-sous { position: absolute; left: 0.5in; right: 0.6in; top: 3.55in; font-family: var(--f-titre); font-weight: 600; font-size: 17pt; line-height: 1.2; color: #2b1722; }
.cv-pola { position: absolute; width: 1.78in; padding: 0.09in 0.09in 0; background: #fff; border-radius: 4pt; box-shadow: 0 0 0 1.6pt #2b1722, 0.05in 0.06in 0 0 rgba(43,23,34,.18); }
.cv-pola-img { width: 100%; height: 1.6in; border-radius: 2pt; overflow: hidden; box-shadow: 0 0 0 1.2pt #2b1722; }
.cv-pola-img svg { width: 100%; height: 100%; display: block; }
.cv-pola-leg { height: 0.4in; display: flex; align-items: center; justify-content: center; font-family: var(--f-plume); font-style: italic; font-size: 13pt; color: #2b1722; }
.cv-pola .coche { position: absolute; width: 0.46in; height: 0.46in; top: -0.17in; right: -0.17in; }
.cv-persos { position: absolute; right: 0.5in; bottom: 0.45in; display: flex; align-items: flex-end; gap: 0.04in; }
.cv-pastille { position: absolute; left: 4.95in; top: 3.35in; width: 1.28in; height: 1.28in; border-radius: 50%; background: #fff; box-shadow: 0 0 0 1.6pt #2b1722; display: flex; align-items: center; justify-content: center; text-align: center; font-family: var(--f-titre); font-weight: 600; font-size: 12.5pt; line-height: 1.05; transform: rotate(9deg); padding: 6pt; }
.cv-pastille b { display: block; color: #b12559; font-size: 15pt; }
.cv-route { position: absolute; inset: 0; }
.cvd { position: absolute; inset: 0; color: #2b1722; }
.cvd-col { position: absolute; top: 0.65in; left: 0.6in; width: 3.85in; bottom: 0.6in; display: flex; flex-direction: column; gap: calc(14pt * var(--kc, 1)); overflow: hidden; }
.cvd-accroche { font-family: var(--f-titre); font-weight: 700; font-size: calc(25pt * var(--kc, 1)); line-height: 1.06; text-wrap: balance; }
.cvd-texte { font-size: calc(11pt * var(--kc, 1)); line-height: 1.55; }
.cvd ul { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 7pt; font-family: var(--f-titre); font-weight: 600; font-size: calc(12pt * var(--kc, 1)); line-height: 1.25; }
.cvd li { display: flex; gap: 8pt; align-items: flex-start; }
.cvd li .coeur { margin-top: 2pt; }
.cvd-liste { margin-top: 4pt; align-self: flex-start; background: #fff; border-radius: 12pt; padding: 11pt 14pt; box-shadow: 0 0 0 1.6pt #2b1722, 0.05in 0.06in 0 0 rgba(43,23,34,.18); transform: rotate(-1.5deg); display: flex; flex-direction: column; gap: 7pt; }
.cvd-liste div { display: flex; align-items: center; gap: 8pt; font-family: var(--f-titre); font-weight: 600; font-size: calc(11.5pt * var(--kc, 1)); }
.cvd-liste i { width: 12pt; height: 12pt; border: 1.6pt solid #2b1722; border-radius: 3pt; flex: none; display: inline-flex; align-items: center; justify-content: center; font-style: normal; font-size: 10pt; font-weight: 700; color: #c9557c; }
.cvd-liste .fait span { text-decoration: line-through; text-decoration-thickness: 1.4pt; color: #8f7984; }
.cvd-fin { margin-top: auto; font-family: var(--f-plume); font-style: italic; font-size: calc(17pt * var(--kc, 1)); color: #b12559; }
.cvd-marque { display: flex; align-items: center; gap: 7pt; font-family: var(--f-titre); font-weight: 600; font-size: 12pt; }
.cvd-marque img { width: 0.32in; height: 0.32in; }
.cvd-apercu { position: absolute; top: 0.8in; right: 0.5in; display: flex; flex-direction: column; align-items: center; gap: 7pt; transform: rotate(3deg); }
.cvd-apercu .apercu { box-shadow: 0 0 0 1.6pt #2b1722, 0.06in 0.07in 0 0 rgba(43,23,34,.2); border-radius: 4pt; }
.cvd-apercu-leg { font-family: var(--f-plume); font-style: italic; font-size: 12pt; }
.cvd-persos { position: absolute; right: 1.25in; top: 5.05in; display: flex; align-items: flex-end; gap: 4pt; }
.cv-prix { position: absolute; right: 0.3in; bottom: calc(var(--fond-perdu) + 1.55in); font-family: var(--f-titre); font-weight: 600; font-size: 10pt; }
@media print { .cv-ecran { display: none !important; } }
.cvt { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
.cvt-v { transform: rotate(90deg); white-space: nowrap; display: flex; align-items: center; gap: 12pt; font-family: var(--f-titre); font-weight: 700; font-size: 9pt; line-height: 1; color: #2b1722; }
.cvt-v span { font-weight: 600; font-size: 7.5pt; color: #6834b2; }
`,
    face: `<div class="cv">
<svg class="cv-route" viewBox="0 0 875 900" preserveAspectRatio="none" aria-hidden="true"><path d="M-10 640 C 90 600, 150 700, 260 690 S 420 560, 520 610 S 660 760, 900 700" fill="none" stroke="#fff" stroke-width="6" stroke-dasharray="1 17" stroke-linecap="round"/></svg>
<div class="cv-marque"><img src="${LOGO}" alt="">Quiz Couple</div>
<div class="cv-titre">${C.titre1 === '100' ? cent({ taille: 168, epaisseur: 5, ombre: 5.04, classe: 'cv-100' }) : `<div class="cv-100">${tx(C.titre1)}</div>`}<div class="cv-mots ajuste-l"><span>${tx(C.titre2)}</span><span>${tx(C.titre3)}</span></div></div>
<div class="cv-sous ajuste-h" data-max-h="0.62in">${tx(C.sous)}</div>
${pola(0, 'left:0.5in;top:4.55in;transform:rotate(-7deg)', true)}
${pola(1, 'left:2.55in;top:4.9in;transform:rotate(4deg)', true)}
${pola(2, 'left:4.55in;top:4.95in;transform:rotate(-3deg)', false)}
<div class="cv-persos">${mascotte('rose', 'joie', { hauteur: '1.55in' })}${mascotte('violet', 'amoureux', { hauteur: '1.8in' })}</div>
</div>`,
    dos: `<div class="cvd"><div class="cvd-col">
<div class="cvd-accroche">${tx(D.accroche)}</div>
<div class="cvd-texte">${tx(D.texte)}</div>
<ul>${D.points.map((p) => `<li>${coeur(11, { plein: true, couleur: '#e17398' })}<span>${tx(p)}</span></li>`).join('')}</ul>
<div class="cvd-liste">${D.coches.map(([n, fait]) => `<div class="${fait ? 'fait' : ''}">${fait ? `<i>${svg(PICTOS.coche, 9, '#c9557c', 3.2)}</i>` : '<i></i>'}<span>${tx(T.aventures[n - 1].t)}</span></div>`).join('')}</div>
<div class="cvd-fin">${tx(D.fin)}</div>
<div class="cvd-marque"><img src="${LOGO}" alt="">Quiz Couple</div>
</div>
<div class="cvd-apercu">${apercu(1, 3.3, C.exemple)}<div class="cvd-apercu-leg">${tx(D.apercu)}</div></div>
<div class="cvd-persos">${mascotte('rose', 'mignon', { hauteur: '1.05in' })}${mascotte('violet', 'amoureux', { hauteur: '1.2in' })}</div>
${prix}
<div class="code-barres cv-ecran">${tx(D.codeBarres)}</div>
</div>`,
    tranche: `<div class="cvt"><div class="cvt-v">${tx(C.tranche)}<span>Quiz Couple</span></div></div>`,
    textes: C,
  };
}
