// Le Gribouillou et la Gribouillette : les deux mipaps, dessinés en SVG.
//
// Un personnage tient dans une boîte de 300 x 300 (le corps centré en
// 150, 165). Tout est au trait d'encre épais et tremblé (filtre de
// déplacement), fond blanc, un aplat par personnage (bleu pâle pour lui,
// rose pâle pour elle), des joues estompées, et rien d'autre. Les objets du
// décor suivent le même trait, blancs à l'intérieur.
//
//   mipap({ perso, expression, pose, bras, marqueur, angle, foulee, seed }) → { svg, defs }
//   LISTE_POSES, LISTE_BRAS, LISTE_PATTES, LISTE_SIGNES, LISTE_PROPS : les noms admis
//   EXPRESSIONS : le catalogue, par famille
//   PROPS       : les objets gribouillés, prop(nom, x, y, echelle)
//   document(contenu, { w, h, defs }) → un fichier SVG complet

export const COULEURS = {
  encre: '#17171a',
  lui: '#cfe6ff',
  elle: '#ffd9e6',
  joue: '#ffa6c1',
  coeur: '#ff7fa7',
  blanc: '#ffffff',
};

const f = (n) => (Math.round(n * 10) / 10).toString();
function prng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function lisse(points, tension = 0.5) {
  const n = points.length;
  let d = `M${f(points[0][0])},${f(points[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n], p1 = points[i], p2 = points[(i + 1) % n], p3 = points[(i + 2) % n];
    const c1 = [p1[0] + ((p2[0] - p0[0]) * tension) / 3, p1[1] + ((p2[1] - p0[1]) * tension) / 3];
    const c2 = [p2[0] - ((p3[0] - p1[0]) * tension) / 3, p2[1] - ((p3[1] - p1[1]) * tension) / 3];
    d += ` C${f(c1[0])},${f(c1[1])} ${f(c2[0])},${f(c2[1])} ${f(p2[0])},${f(p2[1])}`;
  }
  return d + ' Z';
}
function polaire(cx, cy, n, rayon, bruit = 0, seed = 1) {
  const r = prng(seed);
  const pts = [];
  for (let i = 0; i < n; i++) {
    const t = -Math.PI / 2 + (i / n) * Math.PI * 2;
    const [rx, ry] = rayon(t);
    const b = 1 + (bruit ? (r() - 0.5) * 2 * bruit : 0);
    pts.push([cx + Math.cos(t) * rx * b, cy + Math.sin(t) * ry * b]);
  }
  return lisse(pts);
}
const patate = (cx, cy, rx, ry, seed) => polaire(cx, cy, 12, (t) => { const k = 1 + 0.06 * Math.sin(2 * t + 0.8) + 0.04 * Math.cos(3 * t); return [rx * k, ry * k]; }, 0.035, seed);

// ── repères du personnage ───────────────────────────────────────────────
const CX = 150, CY = 165, RX = 84, RY = 76;
const TOP = CY - RY; // 89
const T = 8.2; // rayon d'un œil « point »
const ECART = 32; // demi-écart des yeux
const EY = 154; // hauteur des yeux
const MY = 182; // hauteur de la bouche
const E = COULEURS.encre;

// un trait d'encre : rond aux bouts, épaisseur w
const trait = (d, w = 4.6, extra = '') => `<path d="${d}" fill="none" stroke="${E}" stroke-width="${f(w)}" stroke-linecap="round" stroke-linejoin="round"${extra}/>`;
const plein = (d, fill, w = 4.6, extra = '') => `<path d="${d}" fill="${fill}" stroke="${E}" stroke-width="${f(w)}" stroke-linejoin="round" stroke-linecap="round"${extra}/>`;
const rond = (x, y, r, fill = E, w = 0) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${fill}"${w ? ` stroke="${E}" stroke-width="${f(w)}"` : ''}/>`;
const arc = (x1, y1, qx, qy, x2, y2, w) => trait(`M${f(x1)},${f(y1)} Q${f(qx)},${f(qy)} ${f(x2)},${f(y2)}`, w);
export const COEUR = (x, y, s) => `M${f(x)},${f(y + s * 0.35)} C${f(x - s * 0.1)},${f(y + s * 0.2)} ${f(x - s * 0.5)},${f(y)} ${f(x - s * 0.5)},${f(y - s * 0.25)} C${f(x - s * 0.5)},${f(y - s * 0.55)} ${f(x - s * 0.1)},${f(y - s * 0.55)} ${f(x)},${f(y - s * 0.3)} C${f(x + s * 0.1)},${f(y - s * 0.55)} ${f(x + s * 0.5)},${f(y - s * 0.55)} ${f(x + s * 0.5)},${f(y - s * 0.25)} C${f(x + s * 0.5)},${f(y)} ${f(x + s * 0.1)},${f(y + s * 0.2)} ${f(x)},${f(y + s * 0.35)} Z`;
function etoile(x, y, r, branches = 5) {
  let d = '';
  for (let i = 0; i < branches * 2; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / branches;
    const rr = i % 2 ? r * 0.45 : r;
    d += `${i ? 'L' : 'M'}${f(x + Math.cos(a) * rr)},${f(y + Math.sin(a) * rr)} `;
  }
  return d + 'Z';
}
const etincelle = (x, y, s) => `M${f(x)},${f(y - s)} Q${f(x)},${f(y)} ${f(x + s)},${f(y)} Q${f(x)},${f(y)} ${f(x)},${f(y + s)} Q${f(x)},${f(y)} ${f(x - s)},${f(y)} Q${f(x)},${f(y)} ${f(x)},${f(y - s)} Z`;
const goutte = (x, y, s) => `M${f(x)},${f(y - s)} C${f(x + s * 0.55)},${f(y - s * 0.3)} ${f(x + s * 0.7)},${f(y + s * 0.2)} ${f(x + s * 0.7)},${f(y + s * 0.4)} A${f(s * 0.7)},${f(s * 0.7)} 0 1 1 ${f(x - s * 0.7)},${f(y + s * 0.4)} C${f(x - s * 0.7)},${f(y + s * 0.2)} ${f(x - s * 0.55)},${f(y - s * 0.3)} ${f(x)},${f(y - s)} Z`;
function spirale(x, y, r, tours = 2.2) {
  let d = '';
  const n = 40;
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * tours * Math.PI * 2;
    const rr = (i / n) * r;
    d += `${i ? 'L' : 'M'}${f(x + Math.cos(a) * rr)},${f(y + Math.sin(a) * rr)} `;
  }
  return d;
}
const zigzag = (x, y, w, h, n) => { let d = `M${f(x)},${f(y)}`; for (let i = 1; i <= n; i++) d += ` L${f(x + (w * i) / n)},${f(y + (i % 2 ? -h : h))}`; return d; };
const vague = (x, y, w, h, n = 3) => { let d = `M${f(x)},${f(y)}`; const pas = w / n; for (let i = 0; i < n; i++) d += ` Q${f(x + pas * (i + 0.5))},${f(y + (i % 2 ? -h : h) * 2)} ${f(x + pas * (i + 1))},${f(y)}`; return d; };

// ── les yeux ────────────────────────────────────────────────────────────
// Chaque dessin reçoit le centre (x, y) et le côté s (-1 à gauche, 1 à droite).
const YEUX = {
  point: (x, y) => rond(x, y, T),
  petit: (x, y) => rond(x, y, T * 0.6),
  bas: (x, y, s) => rond(x - s * T * 0.5, y + T * 0.7, T),
  coin: (x, y, s, o) => rond(x + (o.vers || 1) * T * 0.9, y + T * 0.1, T),
  haut: (x, y) => rond(x, y - T * 0.6, T),
  grand: (x, y) => rond(x, y, T * 2.1, COULEURS.blanc, 3.6) + rond(x, y + T * 0.3, T * 1.15) + rond(x - T * 0.55, y - T * 0.45, T * 0.42, COULEURS.blanc),
  brillant: (x, y) => rond(x, y, T * 2.2, COULEURS.blanc, 3.6) + rond(x, y + T * 0.3, T * 1.3) + rond(x - T * 0.6, y - T * 0.5, T * 0.5, COULEURS.blanc) + rond(x + T * 0.55, y + T * 0.9, T * 0.26, COULEURS.blanc),
  larmoyant: (x, y) => rond(x, y, T * 2.2, COULEURS.blanc, 3.6) + rond(x, y + T * 0.35, T * 1.35) + rond(x - T * 0.6, y - T * 0.5, T * 0.5, COULEURS.blanc) + rond(x + T * 0.5, y + T * 0.9, T * 0.3, COULEURS.blanc) + trait(vague(x - T * 1.6, y + T * 1.55, T * 3.2, T * 0.25, 3), 2.2),
  vide: (x, y) => rond(x, y, T * 1.5, COULEURS.blanc, 3.6) + rond(x, y + T * 0.2, T * 0.38),
  coeur: (x, y) => plein(COEUR(x, y + T * 0.2, T * 3.1), COULEURS.coeur, 2.6),
  etoile: (x, y) => plein(etoile(x, y, T * 1.9), COULEURS.blanc, 3),
  ferme_haut: (x, y) => arc(x - T * 1.2, y + T * 0.4, x, y - T * 1.4, x + T * 1.2, y + T * 0.4, 4.4),
  ferme_bas: (x, y) => arc(x - T * 1.1, y - T * 0.2, x, y + T * 1.1, x + T * 1.1, y - T * 0.2, 4.4),
  ligne: (x, y) => trait(`M${f(x - T * 1.2)},${f(y)} L${f(x + T * 1.2)},${f(y)}`, 4.4),
  demi: (x, y) => `<path d="M${f(x - T)},${f(y)} A${f(T)},${f(T)} 0 0 0 ${f(x + T)},${f(y)} Z" fill="${E}"/>` + trait(`M${f(x - T * 1.25)},${f(y)} L${f(x + T * 1.25)},${f(y)}`, 4),
  fatigue: (x, y) => `<path d="M${f(x - T)},${f(y)} A${f(T)},${f(T)} 0 0 0 ${f(x + T)},${f(y)} Z" fill="${E}"/>` + trait(`M${f(x - T * 1.25)},${f(y)} L${f(x + T * 1.25)},${f(y)}`, 4) + arc(x - T * 0.9, y + T * 1.6, x, y + T * 2.1, x + T * 0.9, y + T * 1.6, 2.4),
  croix: (x, y) => trait(`M${f(x - T)},${f(y - T)} L${f(x + T)},${f(y + T)} M${f(x + T)},${f(y - T)} L${f(x - T)},${f(y + T)}`, 4.4),
  spirale: (x, y) => trait(spirale(x, y, T * 1.6), 3),
  plisse: (x, y, s) => trait(`M${f(x - s * T * 1.1)},${f(y - T * 0.9)} L${f(x + s * T * 0.6)},${f(y)} L${f(x - s * T * 1.1)},${f(y + T * 0.9)}`, 4.4),
  colere: (x, y, s) => rond(x, y + T * 0.2, T) + trait(`M${f(x - s * T * 1.5)},${f(y - T * 2.2)} L${f(x + s * T * 1.2)},${f(y - T * 1.1)}`, 4.6),
  clin: (x, y, s) => (s === 1 ? arc(x - T * 1.2, y + T * 0.3, x, y - T * 1.3, x + T * 1.2, y + T * 0.3, 4.4) : rond(x, y, T)),
  aucun: () => '',
};
// Un œil sur deux peut différer : « clin », ou « vers » pour le regard en coin.
function yeux(spec, o = {}) {
  const [g, d] = Array.isArray(spec) ? spec : [spec, spec];
  return `<g>${YEUX[g](CX - ECART, EY, -1, o)}${YEUX[d](CX + ECART, EY, 1, o)}</g>`;
}

// ── les sourcils (seulement quand l'expression en a besoin) ─────────────
const SY = EY - T * 2.4;
const SOURCILS = {
  haut: () => arc(CX - ECART - T * 1.2, SY - 2, CX - ECART, SY - 9, CX - ECART + T * 1.2, SY - 2, 4) + arc(CX + ECART - T * 1.2, SY - 2, CX + ECART, SY - 9, CX + ECART + T * 1.2, SY - 2, 4),
  colere: () => trait(`M${f(CX - ECART - T * 1.4)},${f(SY - 6)} L${f(CX - ECART + T * 1.1)},${f(SY + 3)} M${f(CX + ECART + T * 1.4)},${f(SY - 6)} L${f(CX + ECART - T * 1.1)},${f(SY + 3)}`, 4.4),
  triste: () => trait(`M${f(CX - ECART - T * 1.4)},${f(SY + 3)} L${f(CX - ECART + T * 1.1)},${f(SY - 5)} M${f(CX + ECART + T * 1.4)},${f(SY + 3)} L${f(CX + ECART - T * 1.1)},${f(SY - 5)}`, 4.4),
  un: () => arc(CX + ECART - T * 1.2, SY - 4, CX + ECART, SY - 11, CX + ECART + T * 1.2, SY - 4, 4) + trait(`M${f(CX - ECART - T * 1.1)},${f(SY + 1)} L${f(CX - ECART + T * 1.1)},${f(SY + 1)}`, 4),
  plat: () => trait(`M${f(CX - ECART - T * 1.1)},${f(SY)} L${f(CX - ECART + T * 1.1)},${f(SY)} M${f(CX + ECART - T * 1.1)},${f(SY)} L${f(CX + ECART + T * 1.1)},${f(SY)}`, 4),
};

// ── les bouches ─────────────────────────────────────────────────────────
const U = T * 1.15;
const BOUCHES = {
  w: (x, y) => trait(`M${f(x - U * 1.1)},${f(y)} Q${f(x - U * 0.55)},${f(y + U * 0.9)} ${f(x)},${f(y + U * 0.15)} Q${f(x + U * 0.55)},${f(y + U * 0.9)} ${f(x + U * 1.1)},${f(y)}`),
  sourire: (x, y) => arc(x - U * 1.3, y, x, y + U * 1.6, x + U * 1.3, y, 4.6),
  grand: (x, y) => plein(`M${f(x - U * 1.7)},${f(y - U * 0.1)} Q${f(x)},${f(y + U * 2.8)} ${f(x + U * 1.7)},${f(y - U * 0.1)} Z`, E, 4.2) + `<path d="M${f(x - U * 0.8)},${f(y + U * 1.1)} Q${f(x)},${f(y + U * 2.3)} ${f(x + U * 0.8)},${f(y + U * 1.1)} Z" fill="${COULEURS.coeur}"/>`,
  o: (x, y) => rond(x, y + U * 0.4, U * 0.7),
  O: (x, y) => `<ellipse cx="${f(x)}" cy="${f(y + U * 0.6)}" rx="${f(U * 1.05)}" ry="${f(U * 1.35)}" fill="${E}"/>`,
  baille: (x, y) => `<ellipse cx="${f(x)}" cy="${f(y + U * 0.7)}" rx="${f(U * 1.3)}" ry="${f(U * 1.6)}" fill="${E}"/>` + `<path d="M${f(x - U * 0.6)},${f(y + U * 1.6)} Q${f(x)},${f(y + U * 2.4)} ${f(x + U * 0.6)},${f(y + U * 1.6)} Z" fill="${COULEURS.coeur}"/>`,
  ligne: (x, y) => trait(`M${f(x - U * 1.1)},${f(y + U * 0.3)} L${f(x + U * 1.1)},${f(y + U * 0.3)}`),
  pince: (x, y) => trait(`M${f(x - U * 1.2)},${f(y + U * 0.3)} L${f(x + U * 1.2)},${f(y + U * 0.3)} M${f(x - U * 1.2)},${f(y - U * 0.2)} L${f(x - U * 1.2)},${f(y + U * 0.8)} M${f(x + U * 1.2)},${f(y - U * 0.2)} L${f(x + U * 1.2)},${f(y + U * 0.8)}`, 4),
  vague: (x, y) => trait(vague(x - U * 1.4, y + U * 0.3, U * 2.8, U * 0.28, 3)),
  triste: (x, y) => arc(x - U * 1.1, y + U * 0.8, x, y - U * 0.5, x + U * 1.1, y + U * 0.8, 4.6),
  boude: (x, y) => trait(`M${f(x + U * 0.2)},${f(y + U * 0.5)} Q${f(x + U * 0.9)},${f(y - U * 0.3)} ${f(x + U * 1.5)},${f(y + U * 0.4)}`) ,
  grogne: (x, y) => trait(zigzag(x - U * 1.5, y + U * 0.4, U * 3, U * 0.45, 6), 4.2),
  langue: (x, y) => arc(x - U * 1.2, y, x, y + U * 1.4, x + U * 1.2, y, 4.6) + plein(`M${f(x - U * 0.5)},${f(y + U * 0.6)} Q${f(x)},${f(y + U * 2.4)} ${f(x + U * 0.5)},${f(y + U * 0.6)} Z`, COULEURS.coeur, 3),
  langue_coin: (x, y) => trait(`M${f(x - U * 1.1)},${f(y)} Q${f(x - U * 0.55)},${f(y + U * 0.9)} ${f(x)},${f(y + U * 0.15)} Q${f(x + U * 0.55)},${f(y + U * 0.9)} ${f(x + U * 1.1)},${f(y)}`) + plein(`M${f(x + U * 0.5)},${f(y + U * 0.4)} Q${f(x + U * 1.1)},${f(y + U * 1.9)} ${f(x + U * 1.5)},${f(y + U * 0.5)} Z`, COULEURS.coeur, 3),
  bisou: (x, y) => trait(`M${f(x + U * 0.6)},${f(y - U * 0.2)} Q${f(x + U * 1.5)},${f(y)} ${f(x + U * 0.9)},${f(y + U * 0.45)} Q${f(x + U * 1.5)},${f(y + U * 0.9)} ${f(x + U * 0.6)},${f(y + U * 1.1)}`, 4.4),
  bave: (x, y) => rond(x, y + U * 0.4, U * 0.75) + plein(goutte(x + U * 0.9, y + U * 1.9, U * 0.75), COULEURS.blanc, 2.6),
  dents: (x, y) => plein(`M${f(x - U * 1.7)},${f(y)} L${f(x + U * 1.7)},${f(y)} Q${f(x + U * 1.5)},${f(y + U * 1.5)} ${f(x)},${f(y + U * 1.5)} Q${f(x - U * 1.5)},${f(y + U * 1.5)} ${f(x - U * 1.7)},${f(y)} Z`, COULEURS.blanc, 4) + trait(`M${f(x - U * 0.6)},${f(y)} L${f(x - U * 0.6)},${f(y + U * 1.3)} M${f(x + U * 0.6)},${f(y)} L${f(x + U * 0.6)},${f(y + U * 1.3)}`, 2.6),
  trois: (x, y) => trait(`M${f(x - U * 0.7)},${f(y)} Q${f(x - U * 0.35)},${f(y + U * 0.9)} ${f(x)},${f(y + U * 0.25)} Q${f(x + U * 0.35)},${f(y + U * 0.9)} ${f(x + U * 0.7)},${f(y)}`),
  tremble: (x, y) => trait(vague(x - U * 1.1, y + U * 0.3, U * 2.2, U * 0.18, 4), 4.2),
  coin: (x, y) => trait(`M${f(x - U * 1.1)},${f(y + U * 0.5)} Q${f(x + U * 0.4)},${f(y + U * 0.9)} ${f(x + U * 1.3)},${f(y - U * 0.3)}`),
  aucune: () => '',
};

// ── les signes autour (les « extras ») ──────────────────────────────────
const SIGNES = {
  joues_hachures: () => [-1, 1].map((s) => trait(`M${f(CX + s * 46 - 7)},${f(MY - 10)} l6,-7 M${f(CX + s * 46 - 1)},${f(MY - 3)} l6,-7 M${f(CX + s * 46 + 5)},${f(MY + 4)} l6,-7`, 2.2)).join(''),
  sueur: () => plein(goutte(CX + RX * 0.86, TOP + 32, 9), COULEURS.blanc, 3.4),
  sueurs: () => plein(goutte(CX + RX * 0.86, TOP + 30, 9), COULEURS.blanc, 3.4) + plein(goutte(CX - RX * 0.92, TOP + 44, 7), COULEURS.blanc, 3) + plein(goutte(CX + RX * 1.02, TOP + 62, 6), COULEURS.blanc, 3),
  larme: () => plein(goutte(CX + ECART + T * 1.6, EY + T * 2.4, 7), COULEURS.blanc, 3),
  larmes: () => [-1, 1].map((s) => trait(vague(CX + s * ECART, EY + T * 1.3, 0.001, 0, 1).replace(/Q.*$/, '') + ` L${f(CX + s * ECART + s * 3)},${f(MY + 32)}`, 4.2) + plein(goutte(CX + s * ECART + s * 4, MY + 44, 6), COULEURS.blanc, 2.8)).join(''),
  fontaines: () => [-1, 1].map((s) => trait(`M${f(CX + s * (ECART + 8))},${f(EY)} Q${f(CX + s * (ECART + 40))},${f(EY - 4)} ${f(CX + s * (ECART + 62))},${f(EY + 30)}`, 4.2) + trait(`M${f(CX + s * (ECART + 8))},${f(EY + 6)} Q${f(CX + s * (ECART + 34))},${f(EY + 18)} ${f(CX + s * (ECART + 48))},${f(EY + 52)}`, 3.6) + plein(goutte(CX + s * (ECART + 70), EY + 44, 6), COULEURS.blanc, 2.6) + plein(goutte(CX + s * (ECART + 52), EY + 66, 5), COULEURS.blanc, 2.6)).join(''),
  veine: () => { const x = CX + RX * 0.62, y = TOP + 6; return trait(`M${f(x - 10)},${f(y - 4)} Q${f(x - 4)},${f(y)} ${f(x - 8)},${f(y + 8)} M${f(x - 4)},${f(y - 10)} Q${f(x)},${f(y - 3)} ${f(x + 8)},${f(y - 6)} M${f(x + 2)},${f(y + 4)} Q${f(x + 4)},${f(y + 10)} ${f(x + 12)},${f(y + 6)} M${f(x - 2)},${f(y + 2)} Q${f(x + 3)},${f(y - 2)} ${f(x + 10)},${f(y - 12)}`, 3.6); },
  vapeur: () => [[-28, -34, 9], [0, -46, 11], [28, -34, 9]].map(([dx, dy, r]) => plein(polaire(CX + dx, TOP + dy, 7, () => [r, r * 0.8], 0.14, 5 + dx), COULEURS.blanc, 3.4)).join(''),
  coeurs: () => [[-74, -58, 16], [66, -74, 13], [84, -22, 10]].map(([dx, dy, s]) => plein(COEUR(CX + dx, CY + dy, s), COULEURS.coeur, 3)).join(''),
  coeur_gros: () => plein(COEUR(CX + 78, TOP + 2, 30), COULEURS.coeur, 4.2),
  coeur_brise: () => plein(COEUR(CX + 78, TOP + 2, 30), COULEURS.coeur, 4.2) + trait(`M${f(CX + 78 - 2)},${f(TOP + 2 - 14)} l5,7 l-7,6 l6,8`, 3.6),
  etincelles: () => [[-78, -46, 9], [70, -66, 11], [86, -10, 7], [-60, -84, 6]].map(([dx, dy, s]) => `<path d="${etincelle(CX + dx, CY + dy, s)}" fill="${E}"/>`).join(''),
  etoiles: () => [[-66, -78, 10], [0, -100, 8], [66, -76, 11]].map(([dx, dy, s]) => plein(etoile(CX + dx, CY + dy, s), COULEURS.blanc, 3)).join(''),
  tourbillon: () => trait(`M${f(CX - 70)},${f(TOP - 6)} Q${f(CX)},${f(TOP - 34)} ${f(CX + 70)},${f(TOP - 6)}`, 3.6) + [[-44, -22, 8], [8, -32, 7], [52, -18, 8]].map(([dx, dy, s]) => plein(etoile(CX + dx, TOP + dy, s), COULEURS.blanc, 2.8)).join(''),
  zzz: () => [0.55, 0.8, 1].map((k, i) => { const s = 12, w = s * k, h = s * k * 0.9, ox = CX + RX * 0.7 + i * s * 0.95, oy = TOP + 8 - i * s * 1.05; return trait(`M${f(ox)},${f(oy)} h${f(w)} l${f(-w)},${f(h)} h${f(w)}`, 3.4); }).join(''),
  bulle_nez: () => rond(CX + 12, MY - 2, 11, COULEURS.blanc, 3) + rond(CX + 8, MY - 6, 3, COULEURS.blanc),
  exclamation: () => trait(`M${f(CX + RX * 0.95)},${f(TOP - 4)} v-26`, 5.2) + rond(CX + RX * 0.95, TOP + 8, 3.6),
  question: () => trait(`M${f(CX + RX * 0.78)},${f(TOP - 22)} Q${f(CX + RX * 0.78)},${f(TOP - 36)} ${f(CX + RX * 0.95)},${f(TOP - 36)} Q${f(CX + RX * 1.12)},${f(TOP - 36)} ${f(CX + RX * 1.12)},${f(TOP - 22)} Q${f(CX + RX * 1.12)},${f(TOP - 12)} ${f(CX + RX * 0.95)},${f(TOP - 8)} V${f(TOP - 2)}`, 4.6) + rond(CX + RX * 0.95, TOP + 8, 3.4),
  points: () => [0, 1, 2].map((i) => rond(CX + RX * 0.84 + i * 11, TOP - 18, 3.4)).join(''),
  notes: () => [[-66, -70], [62, -84], [84, -36]].map(([dx, dy], i) => trait(`M${f(CX + dx)},${f(CY + dy)} v${f(-18 - i * 2)} q6,-3 12,2`, 3.6) + rond(CX + dx - 4, CY + dy + 1, 5)).join(''),
  nuage_noir: () => { let d = ''; const r = prng(17); for (let i = 0; i < 9; i++) d += `M${f(CX - 44 + r() * 10)},${f(TOP - 56 + i * 5)} L${f(CX + 44 + r() * 10)},${f(TOP - 54 + i * 5)} `; return trait(d, 2.6) + plein(polaire(CX, TOP - 34, 10, () => [52, 26], 0.08, 21), 'none', 4.2) + [0, 1, 2].map((i) => trait(`M${f(CX - 20 + i * 20)},${f(TOP - 4 + i * 3)} v${f(14)}`, 3.2)).join(''); },
  ampoule: () => { const x = CX + RX * 0.95, y = TOP - 26; return plein(`M${f(x - 13)},${f(y)} A13,13 0 1 1 ${f(x + 13)},${f(y)} Q${f(x + 10)},${f(y + 12)} ${f(x + 6)},${f(y + 18)} H${f(x - 6)} Q${f(x - 10)},${f(y + 12)} ${f(x - 13)},${f(y)} Z`, COULEURS.blanc, 3.6) + trait(`M${f(x - 6)},${f(y + 24)} H${f(x + 6)} M${f(x - 20)},${f(y - 24)} l5,5 M${f(x + 20)},${f(y - 24)} l-5,5 M${f(x)},${f(y - 30)} v6`, 3.2); },
  flammes: () => [[-70, 10, 1], [70, 6, 1.15]].map(([dx, dy, k]) => plein(`M${f(CX + dx)},${f(CY + dy)} C${f(CX + dx - 16 * k)},${f(CY + dy - 10 * k)} ${f(CX + dx - 10 * k)},${f(CY + dy - 34 * k)} ${f(CX + dx + 2)},${f(CY + dy - 44 * k)} C${f(CX + dx + 4)},${f(CY + dy - 30 * k)} ${f(CX + dx + 14 * k)},${f(CY + dy - 30 * k)} ${f(CX + dx + 12 * k)},${f(CY + dy - 14 * k)} C${f(CX + dx + 14 * k)},${f(CY + dy - 2)} ${f(CX + dx + 6)},${f(CY + dy + 4)} ${f(CX + dx)},${f(CY + dy)} Z`, COULEURS.blanc, 3.6)).join(''),
  tremblement: () => [-1, 1].map((s) => trait(`M${f(CX + s * (RX + 16))},${f(CY - 30)} v18 M${f(CX + s * (RX + 24))},${f(CY - 6)} v18 M${f(CX + s * (RX + 16))},${f(CY + 20)} v18`, 3.6)).join(''),
  frissons: () => [-1, 1].map((s) => trait(vague(CX + s * (RX + 14), CY - 26, 0.001, 0).replace(/Q.*$/, ''), 1) + trait(`M${f(CX + s * (RX + 14))},${f(CY - 28)} q6,8 0,16 t0,16 t0,16`, 3.4) + trait(`M${f(CX + s * (RX + 26))},${f(CY - 14)} q6,8 0,16 t0,16`, 3)).join(''),
  flocons: () => [[-82, -70], [-56, -104], [70, -96], [92, -52], [10, -118]].map(([dx, dy]) => trait(`M${f(CX + dx - 7)},${f(CY + dy)} h14 M${f(CX + dx)},${f(CY + dy - 7)} v14 M${f(CX + dx - 5)},${f(CY + dy - 5)} l10,10 M${f(CX + dx + 5)},${f(CY + dy - 5)} l-10,10`, 2.6)).join(''),
  halo: () => `<ellipse cx="${f(CX)}" cy="${f(TOP - 22)}" rx="38" ry="11" fill="none" stroke="${E}" stroke-width="4.4"/>`,
  cornes: () => [-1, 1].map((s) => plein(`M${f(CX + s * 46)},${f(TOP + 4)} L${f(CX + s * 62)},${f(TOP - 30)} L${f(CX + s * 70)},${f(TOP + 10)} Z`, COULEURS.blanc, 3.8)).join(''),
  lunettes: () => plein(`M${f(CX - ECART - 20)},${f(EY - 8)} h40 v22 q0,8 -8,8 h-24 q-8,0 -8,-8 Z`, E, 3.6) + plein(`M${f(CX + ECART - 20)},${f(EY - 8)} h40 v22 q0,8 -8,8 h-24 q-8,0 -8,-8 Z`, E, 3.6) + trait(`M${f(CX - ECART + 20)},${f(EY - 2)} H${f(CX + ECART - 20)} M${f(CX - ECART - 20)},${f(EY - 4)} H${f(CX - RX + 6)} M${f(CX + ECART + 20)},${f(EY - 4)} H${f(CX + RX - 6)}`, 4) + [-1, 1].map((s) => `<path d="M${f(CX + s * ECART - 14)},${f(EY - 2)} l6,-4" stroke="${COULEURS.blanc}" stroke-width="3" stroke-linecap="round" opacity="0.9"/>`).join(''),
  rayons: () => { let d = ''; for (let i = 0; i < 9; i++) { const a = -Math.PI * 0.95 + (i / 8) * Math.PI * 0.9; const x1 = CX + Math.cos(a) * (RX + 14), y1 = CY - 10 + Math.sin(a) * (RY + 14); d += `M${f(x1)},${f(y1)} L${f(CX + Math.cos(a) * (RX + 34))},${f(CY - 10 + Math.sin(a) * (RY + 34))} `; } return trait(d, 3.6); },
  mouvement_bas: () => trait(`M${f(CX - 46)},${f(CY + RY + 18)} h22 M${f(CX - 10)},${f(CY + RY + 24)} h22 M${f(CX + 26)},${f(CY + RY + 18)} h22`, 4),
  sol: () => trait(`M${f(CX - RX - 10)},${f(CY + RY + 2)} H${f(CX + RX + 10)}`, 4.4),
  rougeur_pleine: () => `<ellipse cx="${f(CX)}" cy="${f(EY + 14)}" rx="${f(RX * 0.78)}" ry="${f(RY * 0.46)}" fill="${COULEURS.joue}" opacity="0.5" filter="url(#fl)"/>`,
  fleurs: () => [[-84, -46], [88, -60]].map(([dx, dy]) => [0, 1, 2, 3, 4].map((i) => rond(CX + dx + Math.cos((i / 5) * Math.PI * 2) * 8, CY + dy + Math.sin((i / 5) * Math.PI * 2) * 8, 5.5, COULEURS.blanc, 2.6)).join('') + rond(CX + dx, CY + dy, 4, COULEURS.coeur)).join(''),
  bulles: () => [[-72, -70, 7], [-54, -94, 5], [-90, -100, 4]].map(([dx, dy, r]) => rond(CX + dx, CY + dy, r, COULEURS.blanc, 2.8)).join(''),
  bandeau: () => plein(`M${f(CX - 36)},${f(TOP + 8)} h72 v16 h-72 Z`, COULEURS.blanc, 3.6) + trait(`M${f(CX - 28)},${f(TOP + 12)} v8 M${f(CX - 12)},${f(TOP + 12)} v8 M${f(CX + 4)},${f(TOP + 12)} v8 M${f(CX + 20)},${f(TOP + 12)} v8`, 2.2),
};

// ── les bras ────────────────────────────────────────────────────────────
// Au repos, deux petits bouts sur les côtés. Dès qu'une main se pose quelque
// part (joue, bouche, yeux, tête, objet), on dessine le bras entier : un tube
// qui part de l'épaule, et une patte ronde au bout. Un ovale posé seul sur la
// bouche ressemblait à une moustache (Thomas, 8 octobre 2026).
// Les positions sont dans le repère du corps : dx vers la droite, dy vers le
// bas, dz vers le spectateur ; la rotation du personnage les projette.
const BY = CY + RY * 0.12;
const nub = (dx, dy, rot) => ({ nub: true, dx, dy, dz: 0, rot });
const bras = (s, dx, dy, dz = 0, courbe = 0.5) => ({ epaule: s, dx, dy, dz, courbe });
const G = -1, D = 1;
const BRAS = {
  bas: () => [nub(-RX * 0.98, BY, -25), nub(RX * 0.98, BY, 25)],
  leves: () => [bras(G, -98, CY - 54, 10), bras(D, 98, CY - 54, 10)],
  croises: () => [bras(G, 12, CY + 44, 62, 0.7), bras(D, -12, CY + 52, 64, 0.7)],
  joue: () => [nub(-RX * 0.98, BY, -25), bras(D, 46, MY - 6, 72, 0.8)],
  joues: () => [bras(G, -46, MY - 6, 72, 0.8), bras(D, 46, MY - 6, 72, 0.8)],
  visage: () => [bras(G, -28, EY + 2, 82, 0.7), bras(D, 28, EY + 2, 82, 0.7)],
  priere: () => [bras(G, -12, CY + 46, 72, 0.5), bras(D, 12, CY + 46, 72, 0.5)],
  pointe: () => [nub(-RX * 0.98, BY, -25), bras(D, 120, CY - 12, 0, 0.2)],
  pointe_devant: () => [nub(-RX * 0.98, BY, -25), bras(D, 30, CY - 10, 118, 0.2)],
  coucou: () => [nub(-RX * 0.98, BY, -25), bras(D, 98, CY - 72, 10, 0.3)],
  bouche: () => [nub(-RX * 0.98, BY, -25), bras(D, 10, MY + 6, 86, 0.9)],
  menton: () => [nub(-RX * 0.98, BY, -25), bras(D, 12, MY + 24, 82, 0.7)],
  tient: () => [bras(G, -34, CY + 48, 74, 0.4), bras(D, 34, CY + 48, 74, 0.4)],
  hanches: () => [bras(G, -80, CY + 44, 0, -0.6), bras(D, 80, CY + 44, 0, -0.6)],
  tete: () => [bras(G, -42, TOP + 8, 20, 0.6), bras(D, 42, TOP + 8, 20, 0.6)],
  oreille: () => [nub(-RX * 0.98, BY, -25), bras(D, 64, EY - 2, 50, 0.9)],
  tend: () => [bras(G, -114, CY + 4, 0, 0), bras(D, 114, CY + 4, 0, 0)],
  tend_d: () => [nub(-RX * 0.98, BY, -25), bras(D, 116, CY + 10, 0, 0)],
  tend_g: () => [bras(G, -116, CY + 10, 0, 0), nub(RX * 0.98, BY, 25)],
  leve_d: () => [nub(-RX * 0.98, BY, -25), bras(D, 98, CY - 54, 10)],
  visiere: () => [nub(-RX * 0.98, BY, -25), bras(D, 36, EY - 24, 84, 0.9)],
  porte_haut: () => [bras(G, -40, TOP - 30, 10, 0.4), bras(D, 40, TOP - 30, 10, 0.4)],
  pancarte: () => [nub(-RX * 0.98, BY, -25), bras(D, 118, CY - 8, 0, 0.2)],
  devant: () => [bras(G, -30, CY + 14, 112, 0.1), bras(D, 30, CY - 16, 112, 0.1)],
  pouce: () => [nub(-RX * 0.98, BY, -25), bras(D, 108, CY - 30, 0, 0.3)],
  oreilles_bouchees: () => [bras(G, -60, EY - 6, 50, 0.9), bras(D, 60, EY - 6, 50, 0.9)],
  applaudit: () => [bras(G, -14, CY + 10, 78, 0.6), bras(D, 14, CY + 10, 78, 0.6)],
  tend_haut_d: () => [nub(-RX * 0.98, BY, -25), bras(D, 112, CY - 40, 0, 0.1)],
  aucun: () => [],
};

// ── les pattes ──────────────────────────────────────────────────────────
// Deux petits bouts sous le corps, dessinés derrière lui ; leur position
// dit si le mipap est debout, marche, court, saute, s'assoit ou danse. Une
// foulée s'écrit en profondeur (dz) : de face les pattes restent proches,
// de profil elles s'écartent.
const patte = (dx, dy, dz, rot = 0, rx = 13, ry = 9) => ({ dx, dy, dz, rot, rx, ry });
const BAS = CY + RY;
const PATTES = {
  aucune: () => [],
  debout: () => [patte(-28, BAS - 3, 0), patte(28, BAS - 3, 0)],
  marche: () => [patte(-26, BAS - 6, -34, -20, 14, 9), patte(28, BAS - 2, 34, 10, 14, 9)],
  court: () => [patte(-22, BAS - 16, -64, -36, 17, 9), patte(24, BAS - 8, 60, 18, 17, 9)],
  sprint: () => [patte(-18, BAS - 28, -84, -42, 19, 9), patte(22, BAS - 6, 76, 26, 19, 9)],
  repli: () => [patte(-16, BAS - 4, 0, 0, 11, 8), patte(16, BAS - 4, 0, 0, 11, 8)],
  assis: () => [patte(-40, BAS + 2, 30, 18, 15, 9), patte(40, BAS + 2, 30, -18, 15, 9)],
  allonge: () => [patte(96, BAS - 22, 0, -10, 15, 8), patte(94, BAS - 6, 10, 6, 15, 8)],
  danse: () => [patte(-30, BAS - 3, 0), patte(52, BAS - 34, 24, -48, 15, 9)],
};
// Les traits d'action autour du personnage, dans le repère de la scène
// (ils ne tournent pas avec le corps). Le personnage va vers la droite ;
// une scène qui le veut vers la gauche le met en miroir.
const bouffee = (x, y, r, seed) => plein(polaire(x, y, 7, () => [r, r * 0.8], 0.14, seed), COULEURS.blanc, 3.4);
const LIGNES = {
  vitesse: () => trait(`M${f(CX - RX - 24)},${f(CY - 22)} h-44 M${f(CX - RX - 18)},${f(CY + 2)} h-58 M${f(CX - RX - 26)},${f(CY + 26)} h-40`, 4.2),
  vitesse_forte: () => trait(`M${f(CX - RX - 20)},${f(CY - 44)} h-52 M${f(CX - RX - 30)},${f(CY - 18)} h-80 M${f(CX - RX - 16)},${f(CY + 6)} h-96 M${f(CX - RX - 34)},${f(CY + 30)} h-62 M${f(CX - RX - 20)},${f(CY + 52)} h-40`, 4.2),
  poussiere: () => bouffee(CX - 72, BAS - 10, 13, 3) + bouffee(CX - 104, BAS - 18, 10, 4) + bouffee(CX - 128, BAS - 8, 7, 5),
  poussiere_petite: () => bouffee(CX - 60, BAS - 8, 9, 6) + bouffee(CX - 82, BAS - 12, 6, 8),
  saut: () => SIGNES.mouvement_bas(),
  sol: () => SIGNES.sol(),
  impact_sol: () => { let d = ''; for (let i = 0; i < 7; i++) { const a = Math.PI + (i / 6) * Math.PI; d += `M${f(CX + 50 + Math.cos(a) * 26)},${f(BAS - 2 + Math.sin(a) * 18)} L${f(CX + 50 + Math.cos(a) * 46)},${f(BAS - 2 + Math.sin(a) * 32)} `; } return trait(d, 3.8) + SIGNES.sol(); },
  impact_pancarte: () => { const x = CX + 122, y = BAS - 2; let d = ''; for (let i = 0; i < 6; i++) { const a = Math.PI + (i / 5) * Math.PI; d += `M${f(x + Math.cos(a) * 20)},${f(y + Math.sin(a) * 12)} L${f(x + Math.cos(a) * 38)},${f(y + Math.sin(a) * 26)} `; } return trait(d, 3.6) + bouffee(x - 30, y - 6, 7, 9) + bouffee(x + 30, y - 6, 7, 10); },
  vent: () => trait(`M${f(CX - RX - 30)},${f(CY - 60)} q20,-10 40,0 M${f(CX - RX - 60)},${f(CY - 30)} q24,-12 50,0 M${f(CX - RX - 40)},${f(CY + 4)} q20,-10 40,0`, 3.8),
  tremblement: () => SIGNES.tremblement(),
  effort: () => trait(`M${f(CX - RX - 14)},${f(TOP + 10)} l-10,-10 M${f(CX - RX - 20)},${f(TOP + 34)} l-14,-4 M${f(CX + RX + 14)},${f(TOP + 10)} l10,-10 M${f(CX + RX + 20)},${f(TOP + 34)} l14,-4`, 3.8),
};
// La pancarte plantée : poteau et planche (vide : le texte vient par-dessus).
const PANCARTE = () => plein(`M${f(CX + 118)},${f(CY - 60)} V${f(BAS - 2)}`, 'none', 7) + plein(`M${f(CX + 62)},${f(CY - 118)} H${f(CX + 176)} V${f(CY - 56)} H${f(CX + 62)} Z`, COULEURS.blanc, 5);

// ── les poses : corps (inclinaison, étirement, hauteur), pattes, traits ──
// rot : positif = penché vers l'avant (vers la droite) ; dy : élévation ;
// echelle : [x, y] autour du bas du personnage.
const POSES = {
  debout: { pattes: 'debout' },
  marche: { pattes: 'marche', rot: 6, lignes: ['poussiere_petite'] },
  court: { pattes: 'court', rot: 16, lignes: ['vitesse', 'poussiere'] },
  sprint: { pattes: 'sprint', rot: 26, dy: -12, lignes: ['vitesse_forte', 'poussiere'], signes: ['sueur'] },
  saut: { pattes: 'repli', dy: -40, lignes: ['saut'] },
  assis: { pattes: 'assis', echelle: [1.06, 0.92], lignes: ['sol'] },
  allonge: { pattes: 'allonge', echelle: [1.16, 0.76], lignes: ['sol'] },
  tombe: { pattes: 'repli', rot: -64, dy: -14, lignes: ['impact_sol'], signes: ['tourbillon'] },
  glisse: { pattes: 'court', rot: -18, lignes: ['vitesse'] },
  rampe: { pattes: 'allonge', echelle: [1.2, 0.7], bras: 'tend', lignes: ['sol', 'poussiere_petite'] },
  boule: { pattes: 'aucune', echelle: [0.9, 0.84] },
  etire: { pattes: 'debout', echelle: [0.9, 1.14] },
  penche_g: { pattes: 'debout', rot: -9 },
  penche_d: { pattes: 'debout', rot: 9 },
  tremble: { pattes: 'debout', lignes: ['tremblement'] },
  vole: { pattes: 'repli', dy: -70, lignes: ['vent'] },
  pousse: { pattes: 'court', rot: 24, bras: 'devant', lignes: ['poussiere', 'effort'] },
  tire: { pattes: 'court', rot: -24, bras: 'devant', lignes: ['effort'] },
  salue: { pattes: 'debout', rot: 32 },
  danse: { pattes: 'danse', rot: -12, dy: -6, signes: ['notes'] },
  roule: { pattes: 'repli', rot: 92, dy: -4, lignes: ['vitesse', 'sol'] },
  visiere: { pattes: 'debout', bras: 'visiere' },
  plante: { pattes: 'marche', rot: 4, bras: 'pancarte', lignes: ['impact_pancarte'], pancarte: true },
  porte_haut: { pattes: 'debout', bras: 'porte_haut', echelle: [0.96, 1.06] },
  arrive: { pattes: 'court', rot: 12, lignes: ['poussiere_petite'] },
};

// ── le catalogue des expressions ────────────────────────────────────────
// yeux, bouche, sourcils (ou rien), signes autour, bras, pose, joues (0 à 1).
export const EXPRESSIONS = {
  // la bonne humeur
  content: { yeux: 'point', bouche: 'w', bras: 'bas', famille: 'bonne humeur', libelle: 'content' },
  joie: { yeux: 'ferme_haut', bouche: 'grand', signes: ['etincelles'], bras: 'leves', famille: 'bonne humeur', libelle: 'joie' },
  rire: { yeux: 'plisse', bouche: 'grand', signes: ['larme'], bras: 'bas', pose: 'penche_d', famille: 'bonne humeur', libelle: 'rire' },
  mort_de_rire: { yeux: 'plisse', bouche: 'grand', signes: ['fontaines'], bras: 'croises', pose: 'allonge', famille: 'bonne humeur', libelle: 'mort de rire' },
  fier: { yeux: 'ferme_bas', bouche: 'sourire', signes: ['etincelles'], bras: 'hanches', pose: 'etire', famille: 'bonne humeur', libelle: 'fier' },
  clin: { yeux: 'clin', bouche: 'langue_coin', signes: ['etincelles'], bras: 'coucou', famille: 'bonne humeur', libelle: "clin d'œil" },
  malicieux: { yeux: 'demi', bouche: 'coin', sourcils: 'un', bras: 'croises', famille: 'bonne humeur', libelle: 'malicieux' },
  moqueur: { yeux: 'clin', bouche: 'langue', bras: 'bas', pose: 'penche_g', famille: 'bonne humeur', libelle: 'moqueur' },
  chante: { yeux: 'ferme_haut', bouche: 'O', signes: ['notes'], bras: 'leves', pose: 'penche_g', famille: 'bonne humeur', libelle: 'chante' },
  coucou: { yeux: 'point', bouche: 'sourire', bras: 'coucou', famille: 'bonne humeur', libelle: 'coucou' },
  emerveille: { yeux: 'etoile', bouche: 'o', signes: ['etincelles'], bras: 'joues', famille: 'bonne humeur', libelle: 'émerveillé' },
  ange: { yeux: 'ferme_bas', bouche: 'w', signes: ['halo', 'etincelles'], bras: 'priere', famille: 'bonne humeur', libelle: 'innocent' },
  cool: { yeux: 'aucun', bouche: 'sourire', signes: ['lunettes'], bras: 'croises', famille: 'bonne humeur', libelle: 'cool' },
  // l'amour
  amour: { yeux: 'coeur', bouche: 'w', signes: ['coeurs'], bras: 'bas', famille: 'amour', libelle: 'amoureux' },
  transi: { yeux: 'ferme_haut', bouche: 'trois', signes: ['coeurs', 'rougeur_pleine'], bras: 'joues', famille: 'amour', libelle: 'fou amoureux' },
  bisou: { yeux: 'clin', bouche: 'bisou', signes: ['coeur_gros'], bras: 'bas', pose: 'penche_d', famille: 'amour', libelle: 'bisou' },
  timide: { yeux: 'bas', bouche: 'trois', signes: ['joues_hachures'], bras: 'priere', joues: 1, famille: 'amour', libelle: 'timide' },
  gene: { yeux: 'coin', bouche: 'vague', signes: ['joues_hachures', 'sueur'], bras: 'bouche', joues: 1, famille: 'amour', libelle: 'gêné' },
  honte: { yeux: 'petit', bouche: 'tremble', signes: ['rougeur_pleine', 'joues_hachures', 'sueurs'], bras: 'visage', pose: 'boule', famille: 'amour', libelle: 'mort de honte' },
  reveur: { yeux: 'ferme_bas', bouche: 'sourire', signes: ['coeurs', 'bulles'], bras: 'joue', pose: 'penche_g', famille: 'amour', libelle: 'rêveur' },
  supplie: { yeux: 'larmoyant', bouche: 'trois', signes: ['tremblement'], bras: 'priere', famille: 'amour', libelle: 'supplie' },
  calin: { yeux: 'ferme_haut', bouche: 'w', signes: ['coeurs'], bras: 'tend', famille: 'amour', libelle: 'veut un câlin' },
  coeur_brise: { yeux: 'point', bouche: 'triste', sourcils: 'triste', signes: ['coeur_brise', 'larme'], bras: 'croises', famille: 'amour', libelle: 'cœur brisé' },
  // la surprise et la peur
  surpris: { yeux: 'grand', bouche: 'o', sourcils: 'haut', signes: ['exclamation'], bras: 'bas', famille: 'surprise et peur', libelle: 'surpris' },
  choque: { yeux: 'vide', bouche: 'O', signes: ['rayons'], bras: 'joues', famille: 'surprise et peur', libelle: 'choqué' },
  peur: { yeux: 'petit', bouche: 'tremble', sourcils: 'triste', signes: ['sueurs', 'tremblement'], bras: 'visage', pose: 'boule', famille: 'surprise et peur', libelle: 'peur' },
  inquiet: { yeux: 'point', bouche: 'vague', sourcils: 'triste', signes: ['sueur'], bras: 'priere', famille: 'surprise et peur', libelle: 'inquiet' },
  nerveux: { yeux: 'point', bouche: 'dents', signes: ['sueurs'], bras: 'bas', famille: 'surprise et peur', libelle: 'nerveux' },
  panique: { yeux: 'vide', bouche: 'O', signes: ['sueurs', 'rayons'], bras: 'tete', pose: 'tremble', famille: 'surprise et peur', libelle: 'panique' },
  curieux: { yeux: 'grand', bouche: 'o', signes: ['question'], bras: 'menton', pose: 'penche_d', famille: 'surprise et peur', libelle: 'curieux' },
  // le chagrin
  triste: { yeux: 'point', bouche: 'triste', sourcils: 'triste', signes: ['larme'], bras: 'bas', famille: 'chagrin', libelle: 'triste' },
  pleure: { yeux: 'point', bouche: 'tremble', sourcils: 'triste', signes: ['larmes'], bras: 'bas', famille: 'chagrin', libelle: 'pleure' },
  sanglote: { yeux: 'ferme_bas', bouche: 'O', signes: ['fontaines'], bras: 'leves', famille: 'chagrin', libelle: 'gros chagrin' },
  boude: { yeux: 'coin', bouche: 'boude', sourcils: 'plat', bras: 'croises', pose: 'penche_g', famille: 'chagrin', libelle: 'boude' },
  deprime: { yeux: 'ligne', bouche: 'ligne', signes: ['nuage_noir'], bras: 'bas', pose: 'boule', famille: 'chagrin', libelle: 'déprimé' },
  blase: { yeux: 'ligne', bouche: 'ligne', bras: 'bas', famille: 'chagrin', libelle: 'blasé' },
  ennui: { yeux: 'demi', bouche: 'ligne', signes: ['points'], bras: 'joue', famille: 'chagrin', libelle: "s'ennuie" },
  decu: { yeux: 'demi', bouche: 'triste', sourcils: 'triste', bras: 'bas', famille: 'chagrin', libelle: 'déçu' },
  // la colère
  colere: { yeux: 'colere', bouche: 'grogne', signes: ['veine', 'vapeur'], bras: 'hanches', famille: 'colère', libelle: 'en colère' },
  furieux: { yeux: 'plisse', bouche: 'O', signes: ['veine', 'flammes'], bras: 'leves', pose: 'tremble', famille: 'colère', libelle: 'furieux' },
  vexe: { yeux: 'coin', bouche: 'pince', sourcils: 'colere', signes: ['veine'], bras: 'croises', pose: 'penche_d', famille: 'colère', libelle: 'vexé' },
  jaloux: { yeux: 'demi', bouche: 'grogne', sourcils: 'colere', signes: ['nuage_noir'], bras: 'croises', famille: 'colère', libelle: 'jaloux' },
  suspicieux: { yeux: 'demi', bouche: 'ligne', sourcils: 'un', bras: 'menton', pose: 'penche_g', famille: 'colère', libelle: 'suspicieux' },
  narquois: { yeux: 'ferme_bas', bouche: 'coin', signes: ['etincelles'], bras: 'hanches', famille: 'colère', libelle: 'narquois' },
  determine: { yeux: 'colere', bouche: 'pince', signes: ['flammes', 'etincelles'], bras: 'leves', famille: 'colère', libelle: 'déterminé' },
  degoute: { yeux: 'demi', bouche: 'langue', sourcils: 'colere', signes: ['sueur'], bras: 'bas', pose: 'penche_g', famille: 'colère', libelle: 'dégoûté' },
  // la fatigue et le corps
  fatigue: { yeux: 'fatigue', bouche: 'vague', bras: 'bas', pose: 'boule', famille: 'fatigue', libelle: 'fatigué' },
  dodo: { yeux: 'ferme_bas', bouche: 'o', signes: ['zzz', 'bulle_nez'], bras: 'bas', pose: 'allonge', famille: 'fatigue', libelle: 'dodo' },
  baille: { yeux: 'ferme_bas', bouche: 'baille', signes: ['larme'], bras: 'bouche', famille: 'fatigue', libelle: 'bâille' },
  ko: { yeux: 'croix', bouche: 'langue', signes: ['tourbillon'], bras: 'tend', pose: 'allonge', famille: 'fatigue', libelle: 'K.-O.' },
  etourdi: { yeux: 'spirale', bouche: 'vague', signes: ['tourbillon'], bras: 'bas', pose: 'penche_d', famille: 'fatigue', libelle: 'étourdi' },
  malade: { yeux: 'fatigue', bouche: 'vague', sourcils: 'triste', signes: ['bandeau', 'sueur'], bras: 'bas', pose: 'boule', famille: 'fatigue', libelle: 'malade' },
  froid: { yeux: 'point', bouche: 'tremble', signes: ['frissons', 'flocons'], bras: 'croises', pose: 'boule', famille: 'fatigue', libelle: 'frigorifié' },
  chaud: { yeux: 'ligne', bouche: 'langue', signes: ['sueurs'], bras: 'bas', pose: 'allonge', famille: 'fatigue', libelle: 'canicule' },
  gourmand: { yeux: 'brillant', bouche: 'bave', bras: 'priere', famille: 'fatigue', libelle: 'gourmand' },
  miam: { yeux: 'ferme_haut', bouche: 'langue_coin', signes: ['coeurs'], bras: 'joues', famille: 'fatigue', libelle: 'miam' },
  // la réflexion
  pensif: { yeux: 'haut', bouche: 'o', signes: ['points'], bras: 'menton', famille: 'réflexion', libelle: 'pensif' },
  perplexe: { yeux: 'point', bouche: 'ligne', sourcils: 'un', signes: ['question'], bras: 'bas', pose: 'penche_g', famille: 'réflexion', libelle: 'perplexe' },
  idee: { yeux: 'grand', bouche: 'grand', signes: ['ampoule'], bras: 'pointe', famille: 'réflexion', libelle: 'une idée' },
  concentre: { yeux: 'colere', bouche: 'langue_coin', bras: 'tient', famille: 'réflexion', libelle: 'concentré' },
  attend: { yeux: 'ligne', bouche: 'ligne', signes: ['points'], bras: 'croises', pose: 'tremble', famille: 'réflexion', libelle: 'attend' },
  hypnotise: { yeux: 'spirale', bouche: 'ligne', bras: 'tend', famille: 'réflexion', libelle: 'hypnotisé' },
  chut: { yeux: 'point', bouche: 'o', bras: 'bouche', famille: 'réflexion', libelle: 'chut' },
  ecoute: { yeux: 'coin', bouche: 'w', bras: 'oreille', pose: 'penche_d', famille: 'réflexion', libelle: 'écoute' },
  diable: { yeux: 'demi', bouche: 'dents', sourcils: 'colere', signes: ['cornes'], bras: 'priere', famille: 'réflexion', libelle: 'une mauvaise idée' },
  // l'effort et l'action
  effort: { yeux: 'plisse', bouche: 'pince', sourcils: 'colere', signes: ['sueurs'], bras: 'bas', famille: 'effort', libelle: 'effort' },
  essouffle: { yeux: 'fatigue', bouche: 'O', signes: ['sueurs'], bras: 'hanches', pose: 'penche_d', famille: 'effort', libelle: 'essoufflé' },
  triomphe: { yeux: 'ferme_haut', bouche: 'grand', signes: ['etincelles', 'etoiles'], bras: 'leves', pose: 'saut', famille: 'effort', libelle: 'triomphe' },
  soulage: { yeux: 'ferme_bas', bouche: 'sourire', signes: ['sueur'], bras: 'bas', pose: 'boule', famille: 'effort', libelle: 'soulagé' },
  energique: { yeux: 'grand', bouche: 'grand', signes: ['flammes'], bras: 'leve_d', pose: 'penche_d', famille: 'effort', libelle: 'plein d\'énergie' },
  bravo: { yeux: 'ferme_haut', bouche: 'sourire', signes: ['etincelles'], bras: 'applaudit', famille: 'effort', libelle: 'bravo' },
  pouce: { yeux: 'clin', bouche: 'sourire', bras: 'pouce', famille: 'effort', libelle: 'pouce levé' },
  // les nuances
  exaspere: { yeux: 'haut', bouche: 'ligne', sourcils: 'plat', signes: ['points'], bras: 'hanches', famille: 'nuances', libelle: 'exaspéré' },
  agace: { yeux: 'demi', bouche: 'grogne', signes: ['veine'], bras: 'croises', famille: 'nuances', libelle: 'agacé' },
  hesite: { yeux: 'coin', bouche: 'vague', signes: ['sueur', 'points'], bras: 'menton', famille: 'nuances', libelle: 'hésite' },
  emu: { yeux: 'larmoyant', bouche: 'sourire', signes: ['etincelles'], bras: 'joues', joues: 1, famille: 'nuances', libelle: 'ému' },
  bouche_bee: { yeux: 'grand', bouche: 'O', bras: 'bas', famille: 'nuances', libelle: 'bouche bée' },
  impressionne: { yeux: 'brillant', bouche: 'o', signes: ['etincelles'], bras: 'bas', famille: 'nuances', libelle: 'impressionné' },
  sarcastique: { yeux: 'demi', bouche: 'coin', sourcils: 'un', bras: 'hanches', famille: 'nuances', libelle: 'sarcastique' },
  ricane: { yeux: 'plisse', bouche: 'dents', bras: 'bouche', pose: 'penche_g', famille: 'nuances', libelle: 'ricane' },
  desole: { yeux: 'point', bouche: 'vague', sourcils: 'triste', signes: ['sueur'], bras: 'priere', pose: 'salue', famille: 'nuances', libelle: 'désolé' },
  nostalgique: { yeux: 'ferme_bas', bouche: 'sourire', signes: ['bulles'], bras: 'menton', famille: 'nuances', libelle: 'nostalgique' },
  confus: { yeux: 'coin', bouche: 'vague', signes: ['question', 'sueur'], bras: 'tete', famille: 'nuances', libelle: 'confus' },
  zen: { yeux: 'ferme_bas', bouche: 'w', signes: ['etincelles'], bras: 'croises', pose: 'assis', famille: 'nuances', libelle: 'zen' },
  n_entend_rien: { yeux: 'ferme_haut', bouche: 'ligne', bras: 'oreilles_bouchees', famille: 'nuances', libelle: 'n\'entend rien' },
  pleure_de_joie: { yeux: 'ferme_haut', bouche: 'grand', signes: ['larmes'], bras: 'joues', famille: 'nuances', libelle: 'pleure de joie' },
};

export const FAMILLES_EXPRESSIONS = ['bonne humeur', 'amour', 'surprise et peur', 'chagrin', 'colère', 'fatigue', 'réflexion', 'effort', 'nuances'];
export const LISTE_POSES = Object.keys(POSES);
export const LISTE_BRAS = Object.keys(BRAS);
export const LISTE_PATTES = Object.keys(PATTES);
export const LISTE_SIGNES = Object.keys(SIGNES);
// les repères du personnage dans sa boîte de 300 x 300, pour placer
// quelque chose sur lui depuis l'extérieur (la tête, le sol)
export const REPERES = { CX, CY, RX, RY, TOP, BAS, EY, MY };

// ── les filtres ─────────────────────────────────────────────────────────
export function defs(id = '', seed = 7) {
  return `<filter id="tr${id}" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="${seed}" result="b"/><feDisplacementMap in="SourceGraphic" in2="b" scale="2.6" xChannelSelector="R" yChannelSelector="G"/></filter>` +
    `<filter id="tr2${id}" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.028" numOctaves="2" seed="${seed + 50}" result="b"/><feDisplacementMap in="SourceGraphic" in2="b" scale="3.4" xChannelSelector="R" yChannelSelector="G"/></filter>` +
    `<filter id="fl${id}" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="4"/></filter>`;
}

// ── le cycle de marche ──────────────────────────────────────────────────
// foulee va de 0 à 1 : à 0 les pattes sont celles de la pose, à 0,5 chacune
// a pris l'avance de l'autre (en gardant son côté), à 1 le tour est fait.
// Interpolé en cosinus pour que rien ne saute d'une image à l'autre : en
// animation, foulee = distance parcourue / longueur d'une foulée.
function cycle(pattes, foulee) {
  if (foulee === undefined || pattes.length !== 2) return pattes;
  const t = (1 - Math.cos(foulee * Math.PI * 2)) / 2;
  const vers = (p, q) => ({ dx: p.dx, dy: p.dy + (q.dy - p.dy) * t, dz: p.dz + (q.dz - p.dz) * t, rot: p.rot + (q.rot - p.rot) * t, rx: p.rx, ry: p.ry });
  return [vers(pattes[0], pattes[1]), vers(pattes[1], pattes[0])];
}

// ── le personnage ───────────────────────────────────────────────────────
// perso : 'lui' (le Gribouillou, bleu) ou 'elle' (la Gribouillette, rose).
// marqueur (elle) : 'fleur' (par défaut), 'noeud', 'meche'.
// La projection : un point du repère du corps (dx à droite, dy en bas, dz
// vers le spectateur), le personnage tourné de « angle » degrés autour de
// son axe vertical. 0 = de face, 90 = de profil vers la droite, 180 = de
// dos, -90 = de profil vers la gauche. « vis » dit à quel point le point
// regarde le spectateur (1 en face, 0 sur le bord, négatif derrière).
function projette(dx, dy, dz, angle) {
  const a = (angle * Math.PI) / 180;
  const c = Math.cos(a), si = Math.sin(a);
  const x = dx * c + dz * si;
  const z = -dx * si + dz * c;
  const r = Math.max(1, Math.hypot(dx, dz));
  return { x: CX + x, y: dy, z, vis: z / r };
}
// un point posé sur la surface avant du corps, à la hauteur dy
const surface = (dx, dy) => [dx, dy, Math.sqrt(Math.max(0, RX * RX - dx * dx))];

export function mipap(o = {}) {
  const { perso = 'lui', expression = 'content', marqueur = 'fleur', seed = 7, id = '' } = o;
  const angle = o.dos ? 180 : o.angle || 0;
  const ex = { ...(EXPRESSIONS[expression] || EXPRESSIONS.content), ...(o.surcharge || {}) };
  const pose = POSES[o.pose || ex.pose || 'debout'] || POSES.debout;
  const brasNom = o.bras || pose.bras || ex.bras || 'bas';
  const corpsCouleur = perso === 'elle' ? COULEURS.elle : COULEURS.lui;
  const d = patate(CX, CY, RX, RY, seed);
  const F = (k) => `url(#${k}${id})`;
  const P = (dx, dy, dz) => projette(dx, dy, dz, angle);
  const avecTrait = (el) => el.replace(/\/>$/, ` fill="${corpsCouleur}" stroke="${E}" stroke-width="6" stroke-linejoin="round"/>`);
  const secondPasse = (el) => el.replace(/\/>$/, ` fill="none" stroke="${E}" stroke-width="3.6" stroke-linejoin="round" opacity="0.85"/>`);
  const taille = (z) => 1 + z / 420; // ce qui est proche est un peu plus grand

  // ─ les oreilles : deux bosses sur la crête, derrière le corps ─
  const oreilles = [-46, 46].map((dx) => { const q = P(dx, TOP + 10, 0); return { z: q.z, el: `<circle cx="${f(q.x)}" cy="${f(q.y)}" r="${f(18 * (1 + q.z / 900))}"/>` }; }).sort((a, b) => a.z - b.z);
  // ─ les pattes, derrière le corps ─
  const pattes = cycle(PATTES[o.pattes || pose.pattes || 'debout'](), o.foulee).map((p) => { const q = P(p.dx, p.dy, p.dz); const k = taille(q.z); const rot = p.rot * (Math.cos((angle * Math.PI) / 180) >= 0 ? 1 : -1); return { z: q.z, el: `<ellipse cx="${f(q.x)}" cy="${f(q.y)}" rx="${f(p.rx * k)}" ry="${f(p.ry * k)}" transform="rotate(${f(rot)} ${f(q.x)} ${f(q.y)})"/>` }; }).sort((a, b) => a.z - b.z);
  // ─ la queue en pompon, au milieu du dos ─
  const queue = (() => { const q = P(6, BAS - 10, -RX + 6); return q.vis > -0.35 ? { z: q.z, el: `<circle cx="${f(q.x)}" cy="${f(q.y)}" r="${f(12 * taille(q.z))}"/>` } : null; })();

  // ─ les bras : derrière ou devant selon leur profondeur ─
  const brasDessines = [];
  for (const b of (o.dos ? [] : BRAS[brasNom]())) {
    if (b.nub) {
      const q = P(b.dx, b.dy, b.dz);
      if (q.vis < -0.6) continue; // un bout caché derrière le corps
      const k = taille(q.z);
      brasDessines.push({ z: q.z, el: avecTrait(`<ellipse cx="${f(q.x)}" cy="${f(q.y)}" rx="${f(13 * k)}" ry="${f(10 * k)}" transform="rotate(${f(b.rot * (Math.cos((angle * Math.PI) / 180) >= 0 ? 1 : -1))} ${f(q.x)} ${f(q.y)})"/>`) });
      continue;
    }
    const ep = P(b.epaule * 72, CY + 4, 0);
    const m = P(b.dx, b.dy, b.dz);
    if (m.z < -40 && ep.z < 0) {
      // bras entier derrière le corps : on ne voit que la patte si elle dépasse
      brasDessines.push({ z: m.z, el: `<circle cx="${f(m.x)}" cy="${f(m.y)}" r="${f(12.5 * taille(m.z))}" fill="${corpsCouleur}" stroke="${E}" stroke-width="5.2"/>` });
      continue;
    }
    const s = b.epaule * (Math.cos((angle * Math.PI) / 180) >= 0 ? 1 : -1);
    const mx = (ep.x + m.x) / 2 + s * (m.y - ep.y) * 0.25 * b.courbe, my = (ep.y + m.y) / 2 - (m.x - ep.x) * s * 0.25 * b.courbe;
    const tube = `M${f(ep.x)},${f(ep.y)} Q${f(mx)},${f(my)} ${f(m.x)},${f(m.y)}`;
    const k = taille(m.z);
    brasDessines.push({ z: Math.max(m.z, ep.z), el: `<path d="${tube}" fill="none" stroke="${E}" stroke-width="${f(21 * k)}" stroke-linecap="round"/>` +
      `<path d="${tube}" fill="none" stroke="${corpsCouleur}" stroke-width="${f(12 * k)}" stroke-linecap="round"/>` +
      `<circle cx="${f(m.x)}" cy="${f(m.y)}" r="${f(12.5 * k)}" fill="${corpsCouleur}" stroke="${E}" stroke-width="5.2"/>` });
  }
  const brasDerriere = brasDessines.filter((b) => b.z < -8).sort((a, b) => a.z - b.z).map((b) => b.el).join('');
  const brasDevant = brasDessines.filter((b) => b.z >= -8).sort((a, b) => a.z - b.z).map((b) => b.el).join('');

  // ─ le visage : chaque trait projeté sur la surface avant, écrasé en largeur quand il tourne ─
  const face = [];
  const visage = P(...surface(0, MY));
  const posee = (dx, dy, dessin, x0, y0, mini = 0.5) => {
    const q = P(...surface(dx, dy));
    if (q.vis <= 0.04) return '';
    // de profil, le trait se tasse en largeur mais reste lisible (mini)
    return `<g transform="translate(${f(q.x)} ${f(q.y)}) scale(${f(Math.max(mini, q.vis))} 1) translate(${f(-x0)} ${f(-y0)})">${dessin}</g>`;
  };
  if (angle > -150 && angle < 150) {
    const [yg, yd] = Array.isArray(ex.yeux) ? ex.yeux : [ex.yeux, ex.yeux];
    face.push(posee(-ECART, EY, YEUX[yg](CX - ECART, EY, -1, { vers: o.vers }), CX - ECART, EY));
    face.push(posee(ECART, EY, YEUX[yd](CX + ECART, EY, 1, { vers: o.vers }), CX + ECART, EY));
    if (ex.sourcils) face.push(posee(0, SY, SOURCILS[ex.sourcils](), CX, SY));
    face.push(posee(0, MY + 4, BOUCHES[ex.bouche](CX, MY + 4), CX, MY + 4, 0.4));
    if (perso === 'elle') {
      face.push(posee(-ECART, EY, trait(`M${f(CX - ECART - T * 1.5)},${f(EY - T * 0.9)} l-6,-5 M${f(CX - ECART - T * 1.1)},${f(EY - T * 1.5)} l-4,-7`, 3.2), CX - ECART, EY));
      face.push(posee(ECART, EY, trait(`M${f(CX + ECART + T * 1.5)},${f(EY - T * 0.9)} l6,-5 M${f(CX + ECART + T * 1.1)},${f(EY - T * 1.5)} l4,-7`, 3.2), CX + ECART, EY));
    }
  }
  // les joues, estompées
  const joues = [-46, 46].map((dx) => { const q = P(...surface(dx, MY - 4)); return q.vis > 0.04 ? `<ellipse cx="${f(q.x)}" cy="${f(q.y)}" rx="${f(13 * Math.max(0.3, q.vis))}" ry="13" fill="${COULEURS.joue}" opacity="${ex.joues === 1 ? 0.95 : 0.8}"/>` : ''; }).join('');
  const jo = ex.joues === 0 || !joues ? '' : `<g filter="${F('fl')}">${joues}</g>`;

  // ─ le marqueur d'elle, sur l'oreille droite ─
  const tete = [];
  if (perso === 'elle') {
    const q = P(58, TOP - 2, 0);
    const k = Math.max(0.55, 0.75 + q.vis * 0.25);
    const g = (dessin) => `<g transform="translate(${f(q.x)} ${f(q.y)}) scale(${f(k)}) translate(${f(-CX - 58)} ${f(-TOP + 2)})">${dessin}</g>`;
    if (marqueur === 'fleur') {
      const x = CX + 58, y = TOP - 2;
      let fl = '';
      for (let i = 0; i < 5; i++) fl += rond(x + Math.cos((i / 5) * Math.PI * 2 - Math.PI / 2) * 11, y + Math.sin((i / 5) * Math.PI * 2 - Math.PI / 2) * 11, 7.5, COULEURS.blanc, 3.4);
      fl += rond(x, y, 5.5, COULEURS.coeur, 2.6);
      tete.push(g(fl));
    }
    if (marqueur === 'noeud') {
      const x = CX + 56, y = TOP - 2;
      tete.push(g(plein(`M${f(x)},${f(y)} L${f(x - 22)},${f(y - 14)} Q${f(x - 28)},${f(y)} ${f(x - 22)},${f(y + 14)} Z M${f(x)},${f(y)} L${f(x + 22)},${f(y - 14)} Q${f(x + 28)},${f(y)} ${f(x + 22)},${f(y + 14)} Z`, COULEURS.coeur, 3.6) + rond(x, y, 6, COULEURS.coeur, 3)));
    }
    if (marqueur === 'meche') tete.push(g(trait(`M${f(CX - 6)},${f(TOP + 2)} q-4,-26 14,-30 q16,-4 10,12`, 4.6)));
  }

  // ─ les signes : ceux du visage suivent le visage, les autres restent autour ─
  const signes = [...(ex.signes || []), ...(pose.signes || []), ...(o.signes || [])];
  const DU_VISAGE = new Set(['joues_hachures', 'larme', 'larmes', 'fontaines', 'rougeur_pleine', 'bulle_nez', 'lunettes']);
  const suitVisage = (dessin) => visage.vis > 0.04 ? `<g transform="translate(${f(visage.x - CX)} 0) translate(${f(CX)} 0) scale(${f(Math.max(0.3, visage.vis))} 1) translate(${f(-CX)} 0)">${dessin}</g>` : '';
  const sousBras = signes.filter((s) => s === 'rougeur_pleine' || s === 'joues_hachures').map((s) => suitVisage(SIGNES[s]())).join('');
  const devant = signes.filter((s) => s !== 'rougeur_pleine' && s !== 'joues_hachures').map((s) => (DU_VISAGE.has(s) ? suitVisage(SIGNES[s]()) : SIGNES[s]())).join('');
  const lignes = (pose.lignes || []).map((l) => LIGNES[l]()).join('');
  const pancarte = pose.pancarte || o.pancarte ? PANCARTE() : '';

  // ─ la transformation de la pose, autour du bas du personnage ─
  const [sx, sy] = pose.echelle || [1, 1];
  const t = `translate(0 ${f(pose.dy || 0)}) translate(${f(CX)} ${f(BAS)}) rotate(${f(pose.rot || 0)}) scale(${f(sx)} ${f(sy)}) translate(${f(-CX)} ${f(-BAS)})`;
  const derriere = [...oreilles.map((e) => e.el), ...pattes.map((e) => e.el), ...(queue && queue.z < 0 ? [queue.el] : [])].map(avecTrait).join('') + brasDerriere;
  const queueDevant = queue && queue.z >= 0 ? avecTrait(queue.el) : '';

  const personnage = `<g transform="${t}">` +
    `<g filter="${F('tr')}">${derriere}<path d="${d}" fill="${corpsCouleur}" stroke="${E}" stroke-width="6.5" stroke-linejoin="round"/></g>` +
    `<g filter="${F('tr2')}">${oreilles.map((e) => secondPasse(e.el)).join('')}${secondPasse(`<path d="${d}"/>`)}</g>` +
    jo +
    `<g filter="${F('tr')}">${sousBras}${face.join('')}${queueDevant}${pancarte}${brasDevant}${tete.join('')}</g>` +
    `<g filter="${F('tr2')}">${devant}</g>` +
    `</g>` +
    `<g filter="${F('tr2')}">${lignes}</g>`;
  return { svg: personnage, defs: defs(id, seed), boite: { x: 0, y: 0, w: 300, h: 300 } };
}

// ── les objets gribouillés ──────────────────────────────────────────────
// Chaque objet tient dans une boîte de 100 x 100 centrée en (50, 50) ; on le
// place avec prop(nom, x, y, echelle). Blanc dedans, trait d'encre dehors ;
// les cœurs sont roses, c'est la seule couleur.
const B = COULEURS.blanc;
// un nuage : des arcs posés sur une base plate, centré en (x, y)
const NUAGE = (x, y, k) => `M${f(x - 36 * k)},${f(y + 18 * k)} A${f(13 * k)},${f(13 * k)} 0 0 1 ${f(x - 28 * k)},${f(y - 6 * k)} A${f(17 * k)},${f(17 * k)} 0 0 1 ${f(x + 2 * k)},${f(y - 16 * k)} A${f(15 * k)},${f(15 * k)} 0 0 1 ${f(x + 30 * k)},${f(y - 2 * k)} A${f(12 * k)},${f(12 * k)} 0 0 1 ${f(x + 36 * k)},${f(y + 18 * k)} Z`;
export const PROPS = {
  coeur: () => plein(COEUR(50, 52, 70), COULEURS.coeur, 4.6),
  coeur_brise: () => plein(COEUR(50, 52, 70), COULEURS.coeur, 4.6) + trait('M48,20 l8,12 l-12,10 l10,14 l-6,10', 4),
  bulle: () => plein('M14,22 Q14,12 24,12 H76 Q86,12 86,22 V56 Q86,66 76,66 H40 L26,82 L30,66 H24 Q14,66 14,56 Z', B, 4.6),
  pensee: () => plein(NUAGE(50, 44, 0.9), B, 4.6) + rond(30, 80, 6, B, 3.6) + rond(18, 92, 3.6, B, 3),
  tasse: () => plein('M22,40 H66 V70 Q66,84 52,84 H36 Q22,84 22,70 Z', B, 4.6) + trait('M66,48 Q84,46 82,60 Q80,72 66,70', 4.6) + trait('M36,30 q4,-6 0,-12 M50,30 q4,-6 0,-12', 3.4),
  telephone: () => plein('M32,10 H68 Q74,10 74,16 V84 Q74,90 68,90 H32 Q26,90 26,84 V16 Q26,10 32,10 Z', B, 4.6) + trait('M44,18 H56 M46,82 H54', 3.6),
  oreiller: () => plein('M14,32 Q50,24 86,32 Q92,52 86,72 Q50,80 14,72 Q8,52 14,32 Z', B, 4.6),
  couverture: () => plein('M8,40 Q50,30 92,40 L92,86 Q50,78 8,86 Z', B, 4.6) + trait('M8,52 Q50,44 92,52', 3.2),
  lit: () => plein('M6,56 H94 V84 H6 Z', B, 4.6) + plein('M12,42 H40 V56 H12 Z', B, 4) + trait('M6,84 V94 M94,84 V94', 4.6),
  canape: () => plein('M8,46 H92 V78 H8 Z', B, 4.6) + plein('M8,36 Q8,26 18,26 H82 Q92,26 92,36 V48 H8 Z', B, 4.6) + trait('M50,26 V48 M8,78 V88 M92,78 V88', 4),
  table: () => trait('M10,46 H90 M20,46 V84 M80,46 V84', 4.6),
  pizza: () => plein('M50,10 L88,80 Q50,96 12,80 Z', B, 4.6) + trait('M12,80 Q50,96 88,80 M14,76 Q50,90 86,76', 3) + rond(50, 50, 6, B, 3.4) + rond(40, 70, 5, B, 3.4) + rond(62, 68, 5, B, 3.4),
  frites: () => plein('M26,44 H74 L68,90 H32 Z', B, 4.6) + trait('M36,44 L38,12 M48,44 L46,8 M60,44 L62,14 M30,44 L22,20 M70,44 L78,22', 5),
  burger: () => plein('M14,40 Q14,14 50,14 Q86,14 86,40 Z', B, 4.6) + plein('M12,40 H88 V52 H12 Z', B, 4.6) + plein('M14,52 H86 V64 H14 Z', B, 4.6) + plein('M14,64 H86 Q86,84 50,84 Q14,84 14,64 Z', B, 4.6) + trait('M30,28 h1 M50,24 h1 M68,30 h1', 4),
  gateau: () => plein('M18,50 H82 V84 H18 Z', B, 4.6) + trait('M18,58 Q30,66 42,58 Q54,50 66,58 Q78,66 82,58', 3.6) + trait('M50,50 V32', 4) + plein(goutte(50, 22, 7), B, 3),
  croissant: () => plein('M12,66 C10,34 34,22 50,22 C66,22 90,34 88,66 C80,50 64,44 50,44 C36,44 20,50 12,66 Z', B, 4.6) + trait('M30,54 L26,32 M50,44 V24 M70,54 L74,32', 3.2),
  bubble_tea: () => plein('M28,26 H72 L66,90 H34 Z', B, 4.6) + trait('M56,26 L70,6', 4.6) + rond(40, 80, 4) + rond(50, 82, 4) + rond(60, 80, 4),
  verre: () => plein('M34,20 H66 Q70,52 50,56 Q30,52 34,20 Z', B, 4.6) + trait('M50,56 V84 M36,84 H64', 4.6),
  livre: () => plein('M14,24 H48 V84 H14 Z M52,24 H86 V84 H52 Z', B, 4.6) + trait('M48,24 Q50,20 52,24 M48,84 Q50,88 52,84', 3.6) + trait('M22,36 H40 M22,46 H40 M60,36 H78 M60,46 H78', 2.6),
  ordinateur: () => plein('M18,20 H82 V64 H18 Z', B, 4.6) + plein('M8,64 H92 L86,78 H14 Z', B, 4.6),
  casque: () => trait('M22,60 V46 Q22,20 50,20 Q78,20 78,46 V60', 5) + plein('M14,54 H28 V80 H14 Z M72,54 H86 V80 H72 Z', B, 4.6),
  parapluie: () => plein('M8,52 Q8,18 50,16 Q92,18 92,52 Q82,44 72,52 Q61,44 50,52 Q39,44 28,52 Q18,44 8,52 Z', B, 4.6) + trait('M50,52 V82 Q50,92 42,90', 4.6),
  nuage: () => plein(NUAGE(50, 54, 1), B, 4.6),
  pluie: () => plein(NUAGE(50, 40, 0.86), B, 4.6) + trait('M30,66 l-4,12 M46,70 l-4,12 M62,66 l-4,12 M78,70 l-4,12', 4),
  soleil: () => rond(50, 50, 20, B, 4.6) + trait('M50,14 V6 M50,86 V94 M14,50 H6 M86,50 H94 M24,24 l-6,-6 M76,24 l6,-6 M24,76 l-6,6 M76,76 l6,6', 4.4),
  lune: () => plein('M62,12 Q30,20 30,52 Q30,84 62,90 Q40,78 40,52 Q40,26 62,12 Z', B, 4.6),
  etoile: () => plein(etoile(50, 52, 38), B, 4.6),
  etoiles: () => plein(etoile(30, 36, 16), B, 3.6) + plein(etoile(66, 30, 10), B, 3.2) + plein(etoile(62, 70, 14), B, 3.6),
  fleur: () => [0, 1, 2, 3, 4].map((i) => rond(50 + Math.cos((i / 5) * Math.PI * 2 - Math.PI / 2) * 18, 42 + Math.sin((i / 5) * Math.PI * 2 - Math.PI / 2) * 18, 12, B, 4)).join('') + rond(50, 42, 9, COULEURS.coeur, 3.6) + trait('M50,62 V92 M50,80 q-14,-2 -16,-14 q14,0 16,14', 4.4),
  bouquet: () => trait('M38,92 L50,60 M50,92 L50,58 M62,92 L50,60', 4.4) + [[30, 34], [50, 22], [70, 34]].map(([x, y]) => [0, 1, 2, 3, 4].map((i) => rond(x + Math.cos((i / 5) * Math.PI * 2 - Math.PI / 2) * 10, y + Math.sin((i / 5) * Math.PI * 2 - Math.PI / 2) * 10, 7, B, 3.4)).join('') + rond(x, y, 5, COULEURS.coeur, 2.6)).join(''),
  plante: () => plein('M30,62 H70 L64,90 H36 Z', B, 4.6) + trait('M50,62 V36 M50,50 q-16,-4 -18,-20 q16,2 18,20 M50,42 q16,-4 18,-20 q-16,2 -18,20', 4.4),
  cadeau: () => plein('M16,44 H84 V84 H16 Z', B, 4.6) + plein('M12,30 H88 V44 H12 Z', B, 4.6) + trait('M50,30 V84 M50,30 q-18,-18 -14,-4 q4,8 14,4 M50,30 q18,-18 14,-4 q-4,8 -14,4', 4),
  ballon: () => plein(polaire(50, 38, 12, () => [26, 30], 0.02, 4), B, 4.6) + trait('M50,68 l-4,6 h8 Z M50,74 q-8,10 2,18', 4),
  lettre: () => plein('M12,28 H88 V74 H12 Z', B, 4.6) + trait('M12,28 L50,56 L88,28', 4.4) + plein(COEUR(50, 46, 14), COULEURS.coeur, 2.6),
  horloge: () => rond(50, 50, 36, B, 4.6) + trait('M50,50 V28 M50,50 L66,58', 4.6) + rond(50, 50, 3.4),
  calendrier: () => plein('M14,24 H86 V84 H14 Z', B, 4.6) + trait('M14,40 H86 M30,14 V30 M70,14 V30', 4) + plein(COEUR(50, 64, 20), COULEURS.coeur, 3),
  sac: () => plein('M18,40 H82 L76,88 H24 Z', B, 4.6) + trait('M36,40 Q36,16 50,16 Q64,16 64,40', 4.6),
  voiture: () => plein('M8,56 L20,36 H70 L90,56 V72 H8 Z', B, 4.6) + rond(26, 74, 9, B, 4.4) + rond(72, 74, 9, B, 4.4) + trait('M30,40 L26,54 H46 V40 M54,40 V54 H76', 3.2),
  banc: () => trait('M8,54 H92 M14,54 V84 M86,54 V84 M8,40 H92 M14,40 V54 M86,40 V54', 4.6),
  arbre: () => plein(polaire(50, 42, 12, () => [32, 32], 0.07, 13), B, 4.6) + trait('M50,74 V92 M50,74 q-8,-2 -10,-10', 5),
  lampe: () => plein('M30,16 H70 L80,46 H20 Z', B, 4.6) + trait('M50,46 V84 M36,88 H64', 4.6),
  fenetre: () => plein('M16,14 H84 V86 H16 Z', B, 4.6) + trait('M50,14 V86 M16,50 H84', 4),
  porte: () => plein('M26,10 H74 V92 H26 Z', B, 4.6) + rond(64, 52, 3.6),
  baignoire: () => plein('M10,46 H90 Q90,80 60,80 H40 Q10,80 10,46 Z', B, 4.6) + trait('M20,80 V90 M80,80 V90 M18,46 V30 q0,-10 10,-10', 4.2) + rond(30, 36, 5, B, 3) + rond(44, 30, 4, B, 3),
  brosse: () => plein('M44,30 H56 V92 H44 Z', B, 4.6) + plein('M40,12 H60 V30 H40 Z', B, 4.4) + trait('M44,18 V24 M50,18 V24 M56,18 V24', 2.6),
  pull: () => plein('M34,16 L14,30 L22,50 L30,46 V88 H70 V46 L78,50 L86,30 L66,16 Q50,26 34,16 Z', B, 4.6),
  echarpe: () => plein('M18,26 Q50,14 82,26 L82,44 Q50,32 18,44 Z', B, 4.6) + plein('M54,40 L64,88 L44,90 L40,42 Z', B, 4.4) + trait('M48,90 V96 M56,90 V96 M30,30 V40 M44,28 V38 M58,28 V38 M72,30 V40', 2.6),
  chaussettes: () => plein('M30,10 H54 V54 Q68,58 74,72 Q70,88 54,84 L30,66 Z', B, 4.6) + trait('M30,22 H54', 3.6),
  lunettes: () => rond(30, 50, 16, B, 4.6) + rond(70, 50, 16, B, 4.6) + trait('M46,50 H54 M14,48 L6,40 M86,48 L94,40', 4.4),
  bonnet: () => plein('M18,70 Q18,20 50,20 Q82,20 82,70 Z', B, 4.6) + plein('M14,64 H86 V80 H14 Z', B, 4.6) + rond(50, 16, 8, B, 4),
  chat: () => plein(polaire(50, 58, 12, () => [30, 24], 0.03, 7), B, 4.6) + plein('M24,44 L28,20 L42,38 Z M76,44 L72,20 L58,38 Z', B, 4) + rond(40, 56, 3.4) + rond(60, 56, 3.4) + trait('M44,66 q6,6 12,0', 3.4) + trait('M80,70 q14,-4 10,-18', 4.4),
  oiseau: () => plein(polaire(48, 54, 12, () => [24, 18], 0.04, 2), B, 4.6) + rond(60, 44, 10, B, 4.2) + trait('M70,44 l10,2 l-10,4', 3.6) + rond(62, 42, 2.6) + trait('M34,54 q-10,-14 -4,-22 M44,72 V84 M52,72 V84', 3.8),
  flocon: () => trait('M50,10 V90 M15,30 L85,70 M85,30 L15,70 M50,22 l-8,-8 M50,22 l8,-8 M50,78 l-8,8 M50,78 l8,8', 4),
  neige: () => [[22, 26], [50, 16], [78, 30], [36, 60], [66, 66], [50, 88]].map(([x, y]) => trait(`M${x - 7},${y} h14 M${x},${y - 7} v14 M${x - 5},${y - 5} l10,10 M${x + 5},${y - 5} l-10,10`, 2.8)).join(''),
  musique: () => trait('M34,70 V26 L74,18 V62', 4.6) + rond(26, 72, 10, B, 4.4) + rond(66, 64, 10, B, 4.4),
  exclamation: () => trait('M50,14 V60', 8) + rond(50, 80, 6),
  question: () => trait('M30,34 Q30,12 50,12 Q70,12 70,34 Q70,48 50,54 V64', 7) + rond(50, 82, 6),
  zzz: () => trait('M20,70 h22 l-22,20 h22 M46,44 h18 l-18,16 h18 M66,16 h16 l-16,14 h16', 4.6),
  etincelles: () => `<path d="${etincelle(30, 36, 16)}" fill="${E}"/><path d="${etincelle(68, 26, 10)}" fill="${E}"/><path d="${etincelle(64, 70, 13)}" fill="${E}"/>`,
  mouchoirs: () => plein('M14,44 H86 V86 H14 Z', B, 4.6) + plein('M38,44 Q50,16 62,44 Z', B, 4) + trait('M30,60 H70', 2.6),
  the: () => plein('M18,40 H70 V62 Q70,80 50,80 H38 Q18,80 18,62 Z', B, 4.6) + trait('M70,46 Q86,46 84,58 Q82,68 70,66 M44,40 V22 q10,0 10,-10', 4.4) + plein('M48,12 H62 V22 H48 Z', B, 3),
  popcorn: () => plein('M22,40 H78 L70,90 H30 Z', B, 4.6) + trait('M36,40 V90 M50,40 V90 M64,40 V90', 2.6) + rond(30, 34, 9, B, 4) + rond(46, 26, 10, B, 4) + rond(62, 32, 9, B, 4) + rond(74, 40, 7, B, 3.6),
  manette: () => plein('M14,40 Q14,26 30,26 H70 Q86,26 86,40 L92,70 Q92,82 80,80 L66,62 H34 L20,80 Q8,82 8,70 Z', B, 4.6) + trait('M28,38 V54 M20,46 H36', 4) + rond(68, 40, 3.2) + rond(78, 48, 3.2),
  cle: () => rond(32, 40, 18, B, 4.6) + trait('M44,52 L80,88 M70,78 l8,-8 M62,70 l8,-8', 5),
  valise: () => plein('M14,36 H86 V84 H14 Z', B, 4.6) + plein('M38,36 V22 H62 V36', B, 4.2) + trait('M14,60 H86', 3.2),
  ticket: () => plein('M12,30 H88 Q80,50 88,70 H12 Q20,50 12,30 Z', B, 4.6) + trait('M60,30 V70', 3, ' stroke-dasharray="6 6"'),
  trophee: () => plein('M30,16 H70 V40 Q70,60 50,62 Q30,60 30,40 Z', B, 4.6) + trait('M30,24 q-16,0 -12,16 q4,10 14,10 M70,24 q16,0 12,16 q-4,10 -14,10 M50,62 V78 M36,86 H64 M36,86 q0,-8 14,-8 q14,0 14,8', 4.2),
  sablier: () => plein('M26,12 H74 L52,50 L74,88 H26 L48,50 Z', B, 4.6),
  tele: () => plein('M12,20 H88 V68 H12 Z', B, 4.6) + trait('M40,68 L34,84 M60,68 L66,84 M30,84 H70', 4.2) + plein(COEUR(50, 46, 22), COULEURS.coeur, 2.6),
  couette: () => plein('M6,46 Q50,30 94,46 L94,90 Q50,80 6,90 Z', B, 4.6) + trait('M6,60 Q50,46 94,60 M6,74 Q50,62 94,74', 3),
  coussin: () => plein('M18,22 Q50,30 82,22 Q74,50 82,78 Q50,70 18,78 Q26,50 18,22 Z', B, 4.6),
  bougie: () => plein('M38,40 H62 V88 H38 Z', B, 4.6) + trait('M50,40 V30', 4) + plein(goutte(50, 20, 8), B, 3),
  bague: () => rond(50, 60, 24, B, 4.6) + plein(COEUR(50, 26, 24), COULEURS.coeur, 3.2),
  pancarte: () => plein('M50,40 V96', 'none', 6) + plein('M14,8 H86 V44 H14 Z', B, 4.6),
  panneau_fleche: () => plein('M50,46 V96', 'none', 6) + plein('M12,14 H70 L88,30 L70,46 H12 Z', B, 4.6),
  drapeau: () => plein('M24,6 V96', 'none', 6) + plein('M24,10 H84 L70,30 L84,50 H24 Z', COULEURS.coeur, 4.4),
  caisse: () => plein('M14,30 H86 V86 H14 Z', B, 4.6) + trait('M14,30 L50,16 L86,30 M50,16 V30 M26,52 H40 M26,62 H40', 3.4),
  rocher: () => plein(polaire(50, 58, 9, () => [38, 30], 0.09, 23), B, 4.6) + trait('M34,50 l10,8 M58,42 l8,10', 3),
  ligne_arrivee: () => plein('M10,12 V96 M90,12 V96', 'none', 5) + plein('M10,20 H90 V40 H10 Z', B, 4) + trait('M30,20 V40 M50,20 V40 M70,20 V40 M10,30 H90', 2.6),
  nuage_pensif: () => [[18, 44, 10], [34, 30, 14], [52, 24, 16], [70, 32, 13], [80, 48, 10], [50, 50, 20]].map(([x, y, r]) => rond(x, y, r, B, 0)).join('') + plein(polaire(50, 40, 14, (t) => [38 + 5 * Math.abs(Math.cos(3.5 * t)), 22 + 4 * Math.abs(Math.cos(3.5 * t))], 0.02, 9), 'none', 4.6) + rond(26, 76, 6, B, 3.6) + rond(16, 90, 3.6, B, 3),
};

export function prop(nom, x, y, echelle = 1, id = '') {
  const dessin = PROPS[nom];
  if (!dessin) throw new Error(`objet inconnu : ${nom}`);
  return `<g transform="translate(${f(x - 50 * echelle)} ${f(y - 50 * echelle)}) scale(${f(echelle)})" filter="url(#tr${id})">${dessin()}</g>`;
}

export const LISTE_PROPS = Object.keys(PROPS);

// ── un fichier SVG complet ──────────────────────────────────────────────
export function document(contenu, { w = 300, h = 300, defs: d = defs(), fond = COULEURS.blanc, viewBox } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox || `0 0 ${w} ${h}`}" width="${w}" height="${h}">` +
    `<defs>${d}</defs>` +
    (fond ? `<rect width="100%" height="100%" fill="${fond}"/>` : '') +
    contenu + `</svg>`;
}

// Un personnage posé dans une scène : (x, y) est le milieu du bas du
// personnage, « taille » sa hauteur en pixels (300 = la boîte d'origine).
export function pose(o, x, y, taille = 300, miroir = false) {
  const k = taille / 300;
  const { svg } = mipap(o);
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(miroir ? -k : k)} ${f(k)}) translate(${f(-CX)} ${f(-(CY + RY))})">${svg}</g>`;
}
