// Outils communs des maquettes du livre Quiz Couple (7 novembre 2026) :
// la typographie française, les mascottes de la charte en couleur, en gris
// ou au trait (pour un intérieur noir et blanc), les QR codes et quelques
// petits dessins (cases, cœurs, pions des deux joueurs).
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, '..', '..');
const M = require(path.join(RACINE, 'reseaux/charte/mascottes.js'));
// qrcode.js est un script classique ; static-site est en modules ES, un
// require() le lirait comme un module : on l'évalue dans un contexte à part.
import fs from 'node:fs';
import vm from 'node:vm';
const ctxQr = {};
vm.createContext(ctxQr);
vm.runInContext(fs.readFileSync(path.join(RACINE, 'static-site/js/vendor/qrcode.js'), 'utf8') + ';this.qrcode = qrcode;', ctxQr);
const qrcode = ctxQr.qrcode;

export const DOSSIER_COMMUN = ICI;

// Espaces insécables du français : fine avant ? ! ; et dans les guillemets,
// normale avant les deux-points. Appliqué à tout texte français des pages.
export function fr(t) {
  return String(t)
    .replace(/ ([?!;])/g, ' $1')
    .replace(/ :/g, ' :')
    .replace(/« /g, '« ')
    .replace(/ »/g, ' »')
    // un nombre ne se sépare pas de son unité, ni « page » de son numéro
    .replace(/(\d) (€|h\b|km\b|min\b|kg\b|%)/g, '$1 $2')
    .replace(/(\d) h (\d)/g, '$1 h $2')
    .replace(/\b(page|p\.|n°) (\d)/g, '$1 $2');
}

// Échappement HTML (les textes sont écrits ici, mais un prénom ou une
// apostrophe ne doit jamais casser une balise).
export function esc(t) {
  return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
export const t = (s) => esc(fr(s));

// ── Mascottes ────────────────────────────────────────────────────────────
// mode 'couleur' : la charte telle quelle ; 'gris' : des gris clairs qui
// s'impriment proprement en noir et blanc ; 'trait' : le dessin au trait,
// corps blancs, à colorier.
const GRIS = {
  '#e17398': '#ececec', '#c9557c': '#d9d9d9', '#e892af': '#ffffff',
  '#7f4db3': '#d0d0d0', '#6c409d': '#bdbdbd', '#a581c9': '#ffffff',
  '#ffb3d1': '#f6f6f6', '#e46f9f': '#d6d6d6', '#ec9769': '#c9c9c9',
  '#8fc8ff': '#e3e3e3', '#4a3540': '#2b2527', '#2a1e36': '#1f1b1d'
};
const TRAIT = {
  '#e17398': '#ffffff', '#c9557c': '#ffffff', '#e892af': '#ffffff',
  '#7f4db3': '#ffffff', '#6c409d': '#ffffff', '#a581c9': '#ffffff',
  '#ffb3d1': '#ffffff', '#e46f9f': '#ffffff', '#ec9769': '#e2e2e2',
  '#8fc8ff': '#ffffff', '#4a3540': '#262022', '#2a1e36': '#1f1b1d'
};

function recolore(svg, table) {
  // un cœur des yeux « coeur » est un tracé plein, sans contour : au trait,
  // il devient sombre au lieu de disparaître dans le blanc de l'œil
  if (table === TRAIT) {
    svg = svg.replace(/<path d="([^"]+)" fill="#c9557c"\/>/g, (m, d) => /Z$/.test(d.trim()) && d.length < 90 ? `<path d="${d}" fill="#1f1b1d"/>` : m);
  }
  return svg.replace(/#[0-9a-f]{6}\b/gi, (h) => table[h.toLowerCase()] || h);
}

const BOITES = { rose: [260, 280], violet: [220, 300] };

export function mascotte(nom, pose = 'repos', { mode = 'couleur', hauteur = null, classe = '', extra = {} } = {}) {
  const o = { ...(M.POSES[pose] || M.POSES.repos), couleurs: 'hex', ...extra };
  let svg = M.mascotte(nom, o);
  if (mode === 'gris') svg = recolore(svg, GRIS);
  if (mode === 'trait') svg = recolore(svg, TRAIT);
  const [l, h] = BOITES[nom];
  const style = hauteur ? ` style="height:${hauteur};width:auto"` : '';
  return svg
    .replace(/^<svg /, `<svg class="mascotte ${classe}" aria-hidden="true"${style} `)
    .replace(/ width="\d+" height="\d+"/, ` width="${l}" height="${h}"`);
}

export function mains(nom, pose = 'repos', extra = {}) {
  return M.mains(nom, { ...(M.POSES[pose] || M.POSES.repos), ...extra });
}

// ── QR code ──────────────────────────────────────────────────────────────
export function qr(url, couleur = '#231a1f') {
  const q = qrcode(0, 'M');
  q.addData(url);
  q.make();
  return q.createSvgTag({ cellSize: 4, margin: 0, scalable: true })
    .replace('<svg ', '<svg class="qr" aria-hidden="true" ')
    .replace(/fill="black"/g, `fill="${couleur}"`);
}

// ── Petits dessins ───────────────────────────────────────────────────────
// Les deux pions des jeux : le rond (la rose) et la gélule (le violet), les
// formes des deux mascottes. Ils remplacent « lui » et « elle » : chaque
// couple choisit qui est qui.
export function pion(qui, { plein = false, taille = 11, couleur = null } = {}) {
  const c = couleur || (qui === 'rose' ? 'var(--c-rose)' : 'var(--c-violet)');
  const f = plein ? c : 'none';
  if (qui === 'rose') {
    return `<svg class="pion pion--rose" viewBox="0 0 20 20" style="width:${taille}pt;height:${taille}pt" aria-hidden="true"><circle cx="10" cy="10" r="8.2" fill="${f}" stroke="${c}" stroke-width="2"/></svg>`;
  }
  return `<svg class="pion pion--violet" viewBox="0 0 16 22" style="width:${taille * 0.8}pt;height:${taille * 1.1}pt" aria-hidden="true"><rect x="1.5" y="1.5" width="13" height="19" rx="6.5" fill="${f}" stroke="${c}" stroke-width="2"/></svg>`;
}

export function coeur(taille = 9, { plein = false, couleur = 'currentColor' } = {}) {
  return `<svg class="coeur" viewBox="0 0 24 22" style="width:${taille}pt;height:${taille * 0.92}pt" aria-hidden="true"><path d="M12 20.5C5.5 15.6 1.8 12 1.8 7.4 1.8 4.2 4.3 1.8 7.3 1.8c2 0 3.6 1 4.7 2.6 1.1-1.6 2.7-2.6 4.7-2.6 3 0 5.5 2.4 5.5 5.6 0 4.6-3.7 8.2-10.2 13.1z" fill="${plein ? couleur : 'none'}" stroke="${couleur}" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
}

export function etoile(taille = 9, couleur = 'currentColor') {
  return `<svg class="etoile" viewBox="0 0 24 24" style="width:${taille}pt;height:${taille}pt" aria-hidden="true"><path d="M12 2.6l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 16.6l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" fill="none" stroke="${couleur}" stroke-width="1.7" stroke-linejoin="round"/></svg>`;
}

// Une fleur au trait, comme celles des citations de la charte.
export function fleur(couleur = 'var(--c-rose)', taille = 60, rot = 0) {
  return `<svg class="fleur" viewBox="0 0 100 100" style="width:${taille}pt;height:${taille}pt;transform:rotate(${rot}deg)" aria-hidden="true"><g fill="none" stroke="${couleur}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M50 50c-6-14-2-26 0-30 2 4 6 16 0 30z"/><path d="M50 50c14-6 26-2 30 0-4 2-16 6-30 0z"/><path d="M50 50c6 14 2 26 0 30-2-4-6-16 0-30z"/><path d="M50 50c-14 6-26 2-30 0 4-2 16-6 30 0z"/><circle cx="50" cy="50" r="4.5"/><path d="M50 80c2 8 8 13 16 15M58 88c4-4 9-5 13-3"/></g></svg>`;
}
