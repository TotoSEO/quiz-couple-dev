// Les effets du bonhomme bâton, dans le monde (zoomés avec la scène) ou à
// l'écran (lignes de vitesse, flash). Chacun est une fonction de l'instant.
import type { EffetPlanBaton } from './recette';
import { cheminDiamant, cheminEtincelle, cheminEtoile, COULEURS, facettesDiamant, hasard } from './rig';

const E = COULEURS.encre;
const n1 = (v: number) => (Math.round(v * 10) / 10).toString();
const T = (w: number) => `fill="none" stroke="${E}" stroke-width="${n1(w)}" stroke-linecap="round" stroke-linejoin="round"`;
const bornes = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

// Un nuage de poussière : des ronds qui s'écartent, grossissent et pâlissent.
const poussiere = (x: number, y: number, age: number, taille = 1) => {
  if (age < 0 || age > 0.8) return '';
  let s = '';
  for (let i = 0; i < 7; i++) {
    const g = i * 9 + 1;
    const ang = Math.PI + (hasard(g) - 0.5) * 2.4;
    const d = (40 + 90 * hasard(g + 1)) * taille * Math.sqrt(age / 0.8);
    const cx = x + Math.cos(ang) * d * 1.6;
    const cy = y + Math.sin(ang) * d * 0.5 - 10 * taille;
    const r = (10 + 18 * hasard(g + 2)) * taille * (0.5 + age);
    s += `<circle cx="${n1(cx)}" cy="${n1(cy)}" r="${n1(r)}" fill="#e8e6e2" stroke="${E}" stroke-width="4" opacity="${n1(0.9 * (1 - age / 0.8))}"/>`;
  }
  return s;
};

const onde = (x: number, y: number, age: number) => {
  if (age < 0 || age > 0.45) return '';
  const u = age / 0.45;
  const r = 20 + 380 * u;
  return `<ellipse cx="${n1(x)}" cy="${n1(y)}" rx="${n1(r)}" ry="${n1(r * 0.35)}" fill="none" stroke="${E}" stroke-width="${n1(14 * (1 - u))}" opacity="${n1(0.9 * (1 - u))}"/>`;
};

// Des fentes qui s'ouvrent dans le sol, et des cailloux qui sautent.
const fissure = (x: number, y: number, age: number) => {
  if (age < 0) return '';
  const u = bornes(age / 0.15);
  let s = '';
  for (let i = 0; i < 4; i++) {
    const ang = Math.PI * (0.05 + 0.9 * (i / 3)) + (hasard(i + 3) - 0.5) * 0.3;
    const l = (70 + 60 * hasard(i + 5)) * u;
    let d = `M${n1(x)} ${n1(y)}`;
    let px = x;
    let py = y;
    for (let k = 1; k <= 4; k++) {
      px = x + Math.cos(ang) * (l * k) / 4 + (hasard(i * 7 + k) - 0.5) * 18;
      py = y + Math.sin(ang) * (l * k) / 4 * 0.45 + (hasard(i * 11 + k) - 0.5) * 8;
      d += ` L${n1(px)} ${n1(py)}`;
    }
    s += `<path d="${d}" ${T(5 - i * 0.6)}/>`;
  }
  // les cailloux : une petite parabole chacun
  if (age < 0.6) {
    for (let i = 0; i < 3; i++) {
      const vx = (hasard(i + 20) - 0.5) * 220;
      const vy = -(180 + 120 * hasard(i + 21));
      const cx = x + vx * age;
      const cy = y + vy * age + 900 * age * age;
      if (cy > y + 2) continue;
      s += `<circle cx="${n1(cx)}" cy="${n1(cy)}" r="${n1(4 + 3 * hasard(i + 22))}" fill="${E}"/>`;
    }
  }
  return s;
};

const coeurChemin = (x: number, y: number, s: number) =>
  `M${x} ${y + s * 0.42} C${x - s * 0.62} ${y + s * 0.05} ${x - s * 0.5} ${y - s * 0.5} ${x} ${y - s * 0.2} C${x + s * 0.5} ${y - s * 0.5} ${x + s * 0.62} ${y + s * 0.05} ${x} ${y + s * 0.42} Z`;

const coeurs = (x: number, y: number, age: number, fin: number) => {
  if (age < 0) return '';
  let s = '';
  const n = Math.floor(age / 0.32) + 1;
  for (let i = Math.max(0, n - 6); i < n; i++) {
    const a = age - i * 0.32;
    if (a < 0 || a > 1.6) continue;
    const cx = x + (hasard(i) - 0.5) * 120 + 14 * Math.sin(a * 4 + i);
    const cy = y - a * 150;
    const taille = (26 + 22 * hasard(i + 9)) * Math.min(1, a / 0.2);
    const op = (1 - (a / 1.6) ** 2) * Math.min(1, fin);
    s += `<path d="${coeurChemin(cx, cy, taille)}" fill="${COULEURS.rose}" stroke="${E}" stroke-width="4" opacity="${n1(op)}" transform="rotate(${n1(20 * (hasard(i + 3) - 0.5))} ${n1(cx)} ${n1(cy)})"/>`;
  }
  return s;
};

const etincelles = (x: number, y: number, age: number, graine: number) => {
  if (age < 0) return '';
  let s = '';
  for (let i = 0; i < 6; i++) {
    const g = graine * 7 + i * 5;
    const ang = hasard(g) * Math.PI * 2;
    const l = 20 + 50 * hasard(g + 1);
    let d = `M${n1(x + (hasard(g + 2) - 0.5) * 90)} ${n1(y + (hasard(g + 3) - 0.5) * 16)}`;
    let px = x;
    let py = y;
    for (let k = 1; k <= 4; k++) {
      px = x + Math.cos(ang + (hasard(g + k) - 0.5) * 1.4) * (l * k) / 4;
      py = y + Math.sin(ang + (hasard(g + k + 9) - 0.5) * 1.4) * (l * k) / 4 * 0.5;
      d += ` L${n1(px)} ${n1(py)}`;
    }
    s += `<path d="${d}" fill="none" stroke="${COULEURS.bleu}" stroke-width="4" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"/>`;
  }
  return s;
};

const ombre = (ef: EffetPlanBaton, t: number) => {
  const de = ef.de;
  const a = ef.a ?? de + 1;
  if (t < de || t > a) return '';
  const u = (t - de) / Math.max(0.01, a - de);
  const x = (ef.deX ?? 1100) + ((ef.versX ?? 600) - (ef.deX ?? 1100)) * u;
  const l = (ef.largeur ?? 260) * (0.6 + 0.4 * u);
  return `<ellipse cx="${n1(x)}" cy="${n1((ef.y ?? 1300) + 6)}" rx="${n1(l / 2)}" ry="${n1(l / 9)}" fill="${E}" opacity="${n1(0.25 + 0.3 * u)}"/>`;
};

// Un éclair qui frappe : un zigzag de (x, y) vers le bas sur « hauteur »
// px, jaune au cœur blanc, qui claque pendant 0,25 s, et un éclat au sol.
const eclair = (x: number, y: number, age: number, hauteur: number, graine: number) => {
  if (age < 0 || age > 0.25) return '';
  const g = graine * 5 + Math.floor(age * 60);
  if (hasard(g) < 0.25) return '';
  const n = 6;
  let d = `M${n1(x)} ${n1(y)}`;
  for (let i = 1; i <= n; i++) {
    const px = x + (hasard(g + i * 3) - 0.5) * 120 + (i % 2 ? 30 : -30);
    const py = y + (hauteur * i) / n;
    d += ` L${n1(px)} ${n1(py)}`;
  }
  const op = 1 - age / 0.25;
  return (
    `<path d="${d}" fill="none" stroke="${COULEURS.jaune}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" opacity="${n1(op)}"/>` +
    `<path d="${d}" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity="${n1(op)}"/>` +
    `<ellipse cx="${n1(x)}" cy="${n1(y + hauteur)}" rx="${n1(60 + 200 * age)}" ry="${n1(16 + 50 * age)}" fill="none" stroke="${COULEURS.jaune}" stroke-width="${n1(8 * op)}" opacity="${n1(op)}"/>`
  );
};

// La pluie : des traits bleus qui tombent dans une bande de « largeur » px
// autour de x, du haut de l'image au sol ; entre et sort en fondu.
const pluie = (x: number, sol: number, largeur: number, age: number, fin: number, depuis = 140) => {
  if (age < 0) return '';
  let s = '';
  const op = Math.min(1, age / 0.3, fin);
  for (let i = 0; i < 46; i++) {
    const g = i * 7 + 2;
    const px = x - largeur / 2 + largeur * hasard(g);
    const chute = ((age * 1.9 + hasard(g + 1)) % 1) * (sol - depuis);
    const py = depuis + chute;
    s += `<path d="M${n1(px)} ${n1(py)} l-5 26" fill="none" stroke="${COULEURS.bleu}" stroke-width="4" stroke-linecap="round" opacity="${n1(0.55 * op)}"/>`;
  }
  return s;
};

// Une étoile dans le ciel : cinq branches jaunes, un halo qui respire, des
// rayons ; elle s'éteint en fondu avant « a » (quand on la décroche).
const etoileCiel = (x: number, y: number, age: number, fin: number) => {
  if (age < 0) return '';
  const op = Math.min(1, age / 0.4, fin);
  const k = 1 + 0.08 * Math.sin(age * 5);
  let s = `<circle cx="${n1(x)}" cy="${n1(y)}" r="${n1(70 * k)}" fill="${COULEURS.jaune}" opacity="${n1(0.14 * op)}"/><circle cx="${n1(x)}" cy="${n1(y)}" r="${n1(44 * k)}" fill="${COULEURS.jaune}" opacity="${n1(0.22 * op)}"/>`;
  for (let i = 0; i < 4; i++) {
    const a = age * 1.1 + (i * Math.PI) / 2;
    const l = 58 * k + 10 * Math.sin(age * 7 + i);
    s += `<path d="M${n1(x + Math.cos(a) * 34)} ${n1(y + Math.sin(a) * 34)} L${n1(x + Math.cos(a) * l)} ${n1(y + Math.sin(a) * l)}" stroke="${COULEURS.jaune}" stroke-width="4" stroke-linecap="round" opacity="${n1(0.7 * op)}"/>`;
  }
  s += `<path d="${cheminEtoile(x, y, 28 * k)}" fill="${COULEURS.jaune}" stroke="${E}" stroke-width="4" stroke-linejoin="round" opacity="${n1(op)}"/>`;
  return s;
};

// ── Les effets du rêve (16 octobre 2026) ───────────────────────────────

// Des plumes qui tombent de (x, y) : dix plumes qui descendent en se
// balançant et s'effacent, en boucle jusqu'à « a » (les ailes qui se déploient).
const plumes = (x: number, y: number, age: number, fin: number) => {
  if (age < 0) return '';
  let s = '';
  const op0 = Math.min(1, age / 0.3, fin);
  for (let i = 0; i < 10; i++) {
    const g = i * 7 + 2;
    const u = ((age * (0.45 + 0.2 * hasard(g)) + hasard(g + 1)) % 1);
    const px = x + (hasard(g + 2) - 0.5) * 420 + 60 * Math.sin(u * 7 + i);
    const py = y - 120 + u * 620;
    const rot = 30 * Math.sin(u * 7 + i) + 20;
    const op = op0 * (1 - u) * 0.9;
    s += `<path d="M0 -16 C8 -10 8 8 0 16 C-8 8 -8 -10 0 -16 Z M0 -14 L0 14" fill="${COULEURS.fond}" stroke="${E}" stroke-width="2.5" opacity="${n1(op)}" transform="translate(${n1(px)} ${n1(py)}) rotate(${n1(rot)}) scale(${n1(0.8 + 0.5 * hasard(g + 3))})"/>`;
  }
  return s;
};

// Une bulle de pensée au-dessus de (x, y) : trois petites bulles qui
// montent vers un nuage, et dedans l'icône (un chien, une bague, un cœur) ;
// elle naît en 0,3 s et s'efface avant « a ».
const icones: Record<string, string> = {
  chien: `<path d="M-36 6 q-14 -26 4 -34" fill="none" stroke="${E}" stroke-width="4" stroke-linecap="round"/><ellipse cx="-8" cy="8" rx="30" ry="17" fill="${COULEURS.fond}" stroke="${E}" stroke-width="4"/><path d="M-22 22 l-3 16 M-8 24 l0 15 M8 24 l0 15 M18 22 l3 16" fill="none" stroke="${E}" stroke-width="4" stroke-linecap="round"/><path d="M8 -16 q-14 4 -12 24 q10 4 14 -8 Z M34 -16 q14 4 12 24 q-10 4 -14 -8 Z" fill="#3a3836" stroke="${E}" stroke-width="3"/><circle cx="21" cy="-6" r="17" fill="${COULEURS.fond}" stroke="${E}" stroke-width="4"/><circle cx="16" cy="-10" r="2.5" fill="${E}"/><circle cx="27" cy="-10" r="2.5" fill="${E}"/><circle cx="24" cy="-2" r="3" fill="${E}"/><ellipse cx="26" cy="7" rx="4" ry="5" fill="${COULEURS.rose}" stroke="${E}" stroke-width="1.5"/>`,
  bague: `<circle cx="0" cy="10" r="24" fill="none" stroke="${E}" stroke-width="12"/><circle cx="0" cy="10" r="24" fill="none" stroke="${COULEURS.jaune}" stroke-width="7"/><path d="${cheminDiamant(0, -26, 15)}" fill="${COULEURS.bleuClair}" stroke="${E}" stroke-width="3" stroke-linejoin="round"/><path d="${cheminEtincelle(26, -36, 9)}" fill="${E}"/>`,
  coeur: `<path d="M0 26 C-38 2 -30 -30 0 -12 C30 -30 38 2 0 26 Z" fill="${COULEURS.rose}" stroke="${E}" stroke-width="4"/>`,
};
const bulle = (x: number, y: number, age: number, fin: number, icone: string) => {
  if (age < 0) return '';
  const k = Math.min(1, age / 0.3);
  const ks = k < 1 ? 1 + (1.70158 * 1.2 + 1) * (k - 1) ** 3 + 1.70158 * 1.2 * (k - 1) ** 2 : 1;
  const op = Math.min(1, age / 0.2, fin);
  const flot = 6 * Math.sin(age * 2.4);
  let s = `<g opacity="${n1(op)}">`;
  s += `<circle cx="${n1(x + 16)}" cy="${n1(y - 44)}" r="${n1(9 * k)}" fill="${COULEURS.fond}" ${T(4)}/><circle cx="${n1(x + 34)}" cy="${n1(y - 84)}" r="${n1(14 * k)}" fill="${COULEURS.fond}" ${T(4)}/>`;
  s += `<g transform="translate(${n1(x + 70)} ${n1(y - 190 + flot)}) scale(${n1(ks)})">`;
  s += `<path d="M-96 20 C-130 20 -130 -30 -92 -36 C-96 -78 -42 -92 -22 -62 C-6 -100 60 -98 72 -56 C116 -66 136 -20 102 -4 C128 20 100 50 70 36 C50 68 -10 66 -24 40 C-54 60 -102 50 -96 20 Z" fill="${COULEURS.fond}" ${T(5)}/>`;
  s += `<g transform="translate(0 -8)">${icones[icone] ?? icones.coeur}</g>`;
  s += '</g></g>';
  return s;
};

// Un impact de bande dessinée en (x, y) : une étoile à douze pointes qui
// surgit (0,12 s), tient, et s'efface en 0,5 s, avec quatre traits qui en partent.
const impact = (x: number, y: number, age: number, intensite: number) => {
  if (age < 0 || age > 0.5) return '';
  const k = (age < 0.12 ? age / 0.12 : 1) * intensite;
  const op = age < 0.3 ? 1 : 1 - (age - 0.3) / 0.2;
  const r = 95 * k;
  let d = '';
  for (let i = 0; i < 24; i++) {
    const a = (i * Math.PI) / 12 + age * 2;
    const rr = i % 2 ? r * 0.55 : r * (0.9 + 0.2 * hasard(i + 50));
    d += `${i ? 'L' : 'M'}${n1(x + Math.cos(a) * rr)} ${n1(y + Math.sin(a) * rr)} `;
  }
  let s = `<path d="${d}Z" fill="${COULEURS.fond}" ${T(7)} opacity="${n1(op)}"/>`;
  for (let i = 0; i < 4; i++) {
    const a = -0.9 + i * 0.6 + 0.3 * hasard(i + 60);
    const l1 = r * 1.15;
    const l2 = r * (1.5 + 0.4 * hasard(i + 61));
    s += `<path d="M${n1(x + Math.cos(a) * l1)} ${n1(y + Math.sin(a) * l1)} L${n1(x + Math.cos(a) * l2)} ${n1(y + Math.sin(a) * l2)}" ${T(6)} opacity="${n1(op)}"/>`;
  }
  return s;
};

// Les étoiles du K.-O. : trois petites étoiles qui tournent en ellipse autour de (x, y).
const etoilesKo = (x: number, y: number, age: number, fin: number) => {
  if (age < 0) return '';
  const op = Math.min(1, age / 0.3, fin);
  let s = '';
  for (let i = 0; i < 3; i++) {
    const a = age * 5 + (i * Math.PI * 2) / 3;
    const px = x + Math.cos(a) * 64;
    const py = y + Math.sin(a) * 22;
    s += `<path d="${cheminEtoile(px, py, 15)}" fill="${COULEURS.jaune}" stroke="${E}" stroke-width="3" stroke-linejoin="round" opacity="${n1(op * (0.65 + 0.35 * Math.sin(a)))}"/>`;
  }
  return s;
};

// Le diamant géant posé sur son socle en (x, y : la pointe du bas) : la
// pierre, ses facettes, un halo qui respire, des étincelles qui tournent ;
// visible jusqu'à « a », l'instant où il éclate.
const diamantGeant = (x: number, y: number, age: number) => {
  if (age < 0) return '';
  const r = 150;
  const cy = y - r;
  const resp = 1 + 0.05 * Math.sin(age * 2.6);
  let s = `<circle cx="${n1(x)}" cy="${n1(cy)}" r="${n1(r * 2.1 * resp)}" fill="${COULEURS.bleu}" opacity="0.07"/><circle cx="${n1(x)}" cy="${n1(cy)}" r="${n1(r * 1.5 * resp)}" fill="${COULEURS.bleu}" opacity="0.1"/>`;
  s += `<path d="${cheminDiamant(x, cy, r)}" fill="${COULEURS.bleuClair}" ${T(8)}/>`;
  s += facettesDiamant(x, cy, r, '#ffffff', 5);
  for (let i = 0; i < 4; i++) {
    const a = age * 1.6 + (i * Math.PI) / 2;
    const k = 16 + 8 * Math.sin(age * 7 + i);
    s += `<path d="${cheminEtincelle(x + Math.cos(a) * r * 1.25, cy + Math.sin(a) * r * 1.1, k)}" fill="${COULEURS.fond}" stroke="${E}" stroke-width="2.5"/>`;
  }
  return s;
};

// Les éclats du diamant brisé : vingt-huit morceaux bleu pâle qui partent
// en étoile et retombent, et des étincelles blanches.
const eclatsDiamant = (x: number, y: number, age: number) => {
  if (age < 0 || age > 1.3) return '';
  let s = '';
  const vie = 1 - Math.max(0, (age - 0.5) / 0.8);
  for (let i = 0; i < 28; i++) {
    const g = i * 11 + 9;
    const ang = hasard(g) * Math.PI * 2;
    const v = 450 + 1100 * hasard(g + 1);
    const ex = x + Math.cos(ang) * v * age;
    const ey = y + Math.sin(ang) * v * age + 1100 * age * age;
    const r = 8 + 22 * hasard(g + 2);
    const rot = age * 900 * (hasard(g + 3) - 0.5);
    s += `<path d="${cheminDiamant(ex, ey, r)}" fill="${COULEURS.bleuClair}" stroke="${E}" stroke-width="3" stroke-linejoin="round" opacity="${n1(vie)}" transform="rotate(${n1(rot)} ${n1(ex)} ${n1(ey)})"/>`;
  }
  for (let i = 0; i < 12; i++) {
    const g = i * 17 + 5;
    const ang = hasard(g) * Math.PI * 2;
    const v = 300 + 900 * hasard(g + 1);
    const ex = x + Math.cos(ang) * v * age;
    const ey = y + Math.sin(ang) * v * age + 500 * age * age;
    const k = (10 + 10 * hasard(g + 2)) * Math.max(0, 1 - age / 0.7);
    if (k > 0.5) s += `<path d="${cheminEtincelle(ex, ey, k)}" fill="${COULEURS.fond}" stroke="${E}" stroke-width="2"/>`;
  }
  return s;
};

// Le diamant parfait qui flotte en (x, y) après l'éclat : il tourne sur
// lui-même, monte et descend, et scintille, jusqu'à ce qu'on l'attrape (a).
const diamantFlotte = (x: number, y: number, age: number, fin: number) => {
  if (age < 0) return '';
  const op = Math.min(1, age / 0.25, fin);
  const cy = y + 14 * Math.sin(age * 3);
  const sx = Math.max(0.15, Math.abs(Math.cos(age * 2.4)));
  let s = `<circle cx="${n1(x)}" cy="${n1(cy)}" r="${n1(80 + 8 * Math.sin(age * 5))}" fill="${COULEURS.bleu}" opacity="${n1(0.14 * op)}"/>`;
  s += `<g transform="translate(${n1(x)} ${n1(cy)}) scale(${n1(sx)} 1)" opacity="${n1(op)}"><path d="${cheminDiamant(0, 0, 40)}" fill="${COULEURS.bleuClair}" ${T(5)}/>${facettesDiamant(0, 0, 40, '#ffffff', 3)}</g>`;
  for (let i = 0; i < 3; i++) {
    const a = age * 3 + (i * Math.PI * 2) / 3;
    s += `<path d="${cheminEtincelle(x + Math.cos(a) * 70, cy + Math.sin(a) * 60, 10 + 5 * Math.sin(age * 9 + i))}" fill="${E}" opacity="${n1(op)}"/>`;
  }
  return s;
};

// De la fumée partout autour de (x, y) : quatorze grosses volutes grises qui
// gonflent, montent et s'écartent en 2,5 s, en boucle jusqu'à « a ».
const fumee = (x: number, y: number, age: number, fin: number, largeur: number) => {
  if (age < 0) return '';
  let s = '';
  const op0 = Math.min(1, age / 0.25, fin);
  for (let i = 0; i < 14; i++) {
    const g = i * 9 + 4;
    const u = ((age / 2.5 + hasard(g)) % 1);
    const cx = x + (hasard(g + 1) - 0.5) * largeur * (0.5 + u) + 30 * Math.sin(age * 2 + i);
    const cy = y - 20 - u * 420 + 12 * Math.sin(age * 3 + i);
    const r = (50 + 70 * hasard(g + 2)) * (0.5 + 0.9 * u);
    const op = op0 * (1 - u) * 0.9;
    s += `<circle cx="${n1(cx)}" cy="${n1(cy)}" r="${n1(r)}" fill="#dcdad6" stroke="${E}" stroke-width="5" opacity="${n1(op)}"/>`;
  }
  return s;
};

// Les rayons du soleil retrouvé : dix pans de lumière jaune qui tournent
// lentement depuis (x, y), en fondu.
const rayons = (x: number, y: number, age: number, fin: number) => {
  if (age < 0) return '';
  const op = Math.min(1, age / 0.6, fin) * 0.16;
  let s = '';
  for (let i = 0; i < 10; i++) {
    const a = age * 0.25 + (i * Math.PI * 2) / 10;
    const l = 1500;
    const w = 0.09;
    s += `<path d="M${n1(x)} ${n1(y)} L${n1(x + Math.cos(a - w) * l)} ${n1(y + Math.sin(a - w) * l)} L${n1(x + Math.cos(a + w) * l)} ${n1(y + Math.sin(a + w) * l)} Z" fill="${COULEURS.jaune}" opacity="${n1(op)}"/>`;
  }
  return s;
};

// Un vol d'oiseaux de deX à versX à la hauteur y, de « de » à « a » : cinq
// oiseaux en chevron qui battent des ailes.
const oiseaux = (ef: EffetPlanBaton, t: number) => {
  const de = ef.de;
  const a = ef.a ?? de + 3;
  if (t < de - 0.2 || t > a + 0.2) return '';
  const u = (t - de) / Math.max(0.01, a - de);
  const x0 = (ef.deX ?? 1200) + ((ef.versX ?? -200) - (ef.deX ?? 1200)) * u;
  const y0 = ef.y ?? 620;
  let s = '';
  for (let i = 0; i < 5; i++) {
    const bx = x0 + (i - 2) * 56 - Math.abs(i - 2) * 10;
    const by = y0 + Math.abs(i - 2) * 26 + 4 * Math.sin(t * 3 + i);
    const b = 10 * Math.sin(t * 11 + i * 1.3);
    s += `<path d="M${n1(bx - 18)} ${n1(by + 2)} q9 ${n1(-10 + b)} 18 0 q9 ${n1(-10 + b)} 18 0" ${T(4)}/>`;
  }
  return s;
};

// La spirale du vertige au-dessus de (x, y) : elle tourne sur elle-même.
const spirale = (x: number, y: number, age: number, fin: number) => {
  if (age < 0) return '';
  const op = Math.min(1, age / 0.3, fin);
  let d = '';
  for (let k = 0; k <= 40; k++) {
    const a = k * 0.5 + age * 6;
    const r = 4 + 1.6 * k;
    d += `${k ? 'L' : 'M'}${n1(x + Math.cos(a) * r)} ${n1(y + Math.sin(a) * r * 0.6)} `;
  }
  return `<path d="${d}" ${T(5)} opacity="${n1(op)}"/>`;
};

// Le lasso qui vole de (x, y) vers (versX, versY) entre « de » et « a » : la
// boucle file en arc en tournant, le brin se déroule derrière elle.
const lassoVole = (ef: EffetPlanBaton, t: number) => {
  const de = ef.de;
  const a = ef.a ?? de + 0.6;
  if (t < de || t > a) return '';
  const u = 1 - (1 - bornes((t - de) / Math.max(0.01, a - de))) ** 2;
  const x0 = ef.x ?? 540;
  const y0 = ef.y ?? 900;
  const x1 = ef.versX ?? 200;
  const y1 = ef.versY ?? 600;
  const px = x0 + (x1 - x0) * u;
  const py = y0 + (y1 - y0) * u - 160 * Math.sin(Math.PI * u);
  const r = 70 + 60 * u;
  return (
    `<path d="M${n1(x0)} ${n1(y0)} Q${n1((x0 + px) / 2)} ${n1((y0 + py) / 2 + 70 * (1 - u))} ${n1(px)} ${n1(py)}" ${T(8)}/>` +
    `<ellipse cx="${n1(px)}" cy="${n1(py)}" rx="${n1(r)}" ry="${n1(r * 0.42)}" fill="none" ${T(9).replace('fill="none" ', '')} transform="rotate(${n1(-30 + 25 * Math.sin(t * 9))} ${n1(px)} ${n1(py)})"/>`
  );
};

// Les effets du monde, à l'instant t du plan.
export const effetsMonde = (effets: EffetPlanBaton[], t: number, graine: number): string => {
  let s = '';
  for (const ef of effets) {
    const x = ef.x ?? 540;
    const y = ef.y ?? 1300;
    const age = t - ef.de;
    switch (ef.effet) {
      case 'poussiere':
        s += poussiere(x, y, age, ef.intensite ?? 1);
        break;
      case 'onde':
        s += onde(x, y, age);
        break;
      case 'fissure':
        s += fissure(x, y, age);
        break;
      case 'coeurs':
        if (ef.a === undefined || t < ef.a) s += coeurs(x, y, age, ef.a === undefined ? 1 : (ef.a - t) / 0.4);
        break;
      case 'etincelles':
        if (ef.a === undefined || t < ef.a) s += etincelles(x, y, age, graine);
        break;
      case 'ombre':
        s += ombre(ef, t);
        break;
      case 'eclair':
        s += eclair(x, y, age, ef.hauteur ?? 700, graine);
        break;
      case 'pluie':
        if (ef.a === undefined || t < ef.a) s += pluie(x, y, ef.largeur ?? 1300, age, ef.a === undefined ? 1 : (ef.a - t) / 0.4, ef.hauteur ?? 140);
        break;
      case 'etoile-ciel':
        if (ef.a === undefined || t < ef.a) s += etoileCiel(x, y, age, ef.a === undefined ? 1 : (ef.a - t) / 0.3);
        break;
      case 'plumes':
        if (ef.a === undefined || t < ef.a) s += plumes(x, y, age, ef.a === undefined ? 1 : (ef.a - t) / 0.4);
        break;
      case 'bulle':
        if (ef.a === undefined || t < ef.a) s += bulle(x, y, age, ef.a === undefined ? 1 : (ef.a - t) / 0.3, ef.icone ?? 'coeur');
        break;
      case 'impact':
        s += impact(x, y, age, ef.intensite ?? 1);
        break;
      case 'etoiles-ko':
        if (ef.a === undefined || t < ef.a) s += etoilesKo(x, y, age, ef.a === undefined ? 1 : (ef.a - t) / 0.3);
        break;
      case 'diamant-geant':
        if (ef.a === undefined || t < ef.a) s += diamantGeant(x, y, age);
        break;
      case 'eclats-diamant':
        s += eclatsDiamant(x, y, age);
        break;
      case 'diamant-flotte':
        if (ef.a === undefined || t < ef.a) s += diamantFlotte(x, y, age, ef.a === undefined ? 1 : (ef.a - t) / 0.2);
        break;
      case 'rayons':
        if (ef.a === undefined || t < ef.a) s += rayons(x, y, age, ef.a === undefined ? 1 : (ef.a - t) / 0.4);
        break;
      case 'fumee':
        if (ef.a === undefined || t < ef.a) s += fumee(x, y, age, ef.a === undefined ? 1 : (ef.a - t) / 0.5, ef.largeur ?? 500);
        break;
      case 'oiseaux':
        s += oiseaux(ef, t);
        break;
      case 'spirale':
        if (ef.a === undefined || t < ef.a) s += spirale(x, y, age, ef.a === undefined ? 1 : (ef.a - t) / 0.3);
        break;
      case 'lasso-vole':
        s += lassoVole(ef, t);
        break;
      case 'eclats':
        if (age >= 0 && age < 1) {
          for (let i = 0; i < 12; i++) {
            const g = i * 13 + 7;
            const ang = hasard(g) * Math.PI * 2;
            const v = 500 + 800 * hasard(g + 1);
            const ex = x + Math.cos(ang) * v * age;
            const ey = y + Math.sin(ang) * v * age + 700 * age * age;
            const r = 10 + 22 * hasard(g + 2);
            s += `<path d="M${n1(ex - r)} ${n1(ey + r * 0.6)} L${n1(ex + r * 0.2)} ${n1(ey - r)} L${n1(ex + r)} ${n1(ey + r * 0.3)} Z" fill="#3a3836" ${T(4)} opacity="${n1(1 - age)}"/>`;
          }
        }
        break;
      default:
        break;
    }
  }
  return s;
};

// Les lignes de vitesse : des traits fins sur toute l'image, dans la
// direction donnée, qui changent à chaque image. Dessinées à l'écran.
export const lignesVitesse = (angle: number, intensite: number, graine: number): string => {
  let s = '';
  const n = Math.round(14 * intensite);
  const a = (angle * Math.PI) / 180;
  const dx = Math.cos(a);
  const dy = Math.sin(a);
  for (let i = 0; i < n; i++) {
    const g = graine * 3 + i * 7;
    const px = hasard(g) * 1080;
    // jamais sur le titre (236 à 320 px) ni sur la signature (1412 à 1484)
    const py = 340 + hasard(g + 1) * 1060;
    const l = 120 + 420 * hasard(g + 2);
    const w = 2 + 4 * hasard(g + 3);
    s += `<path d="M${n1(px - dx * l / 2)} ${n1(py - dy * l / 2)} L${n1(px + dx * l / 2)} ${n1(py + dy * l / 2)}" stroke="${E}" stroke-width="${n1(w)}" stroke-linecap="round" opacity="${n1(0.25 + 0.5 * hasard(g + 4))}"/>`;
  }
  return s;
};
