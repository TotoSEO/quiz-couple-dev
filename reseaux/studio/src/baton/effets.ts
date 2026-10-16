// Les effets du bonhomme bâton, dans le monde (zoomés avec la scène) ou à
// l'écran (lignes de vitesse, flash). Chacun est une fonction de l'instant.
import type { EffetPlanBaton } from './recette';
import { cheminEtoile, COULEURS, hasard } from './rig';

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

// Les z du sommeil : trois « z » qui montent en biais depuis (x, y), de plus
// en plus grands, et recommencent toutes les 1,4 s.
const zzz = (x: number, y: number, age: number, fin: number) => {
  if (age < 0) return '';
  let s = '';
  const op0 = Math.min(1, age / 0.3, fin);
  for (let i = 0; i < 3; i++) {
    const u = ((age / 1.4 + 1 - i * 0.33) % 1);
    const k = 14 + 10 * i + 8 * u;
    const px = x + 30 * i + 40 * u + 6 * Math.sin(age * 3 + i);
    const py = y - 40 * i - 70 * u;
    const op = op0 * (1 - u) * 0.9;
    s += `<path d="M${n1(px - k / 2)} ${n1(py - k / 2)} L${n1(px + k / 2)} ${n1(py - k / 2)} L${n1(px - k / 2)} ${n1(py + k / 2)} L${n1(px + k / 2)} ${n1(py + k / 2)}" fill="none" stroke="${E}" stroke-width="${n1(3 + i)}" stroke-linecap="round" stroke-linejoin="round" opacity="${n1(op)}"/>`;
  }
  return s;
};

// Des notes de musique qui montent en ondulant depuis (x, y), roses et
// violettes en alternance, une toutes les 0,45 s.
const notes = (x: number, y: number, age: number, fin: number) => {
  if (age < 0) return '';
  let s = '';
  const n = Math.floor(age / 0.45) + 1;
  for (let i = Math.max(0, n - 5); i < n; i++) {
    const a = age - i * 0.45;
    if (a < 0 || a > 1.8) continue;
    const px = x + (hasard(i + 40) - 0.5) * 160 + 22 * Math.sin(a * 3 + i);
    const py = y - a * 130;
    const k = (0.7 + 0.5 * hasard(i + 41)) * Math.min(1, a / 0.2);
    const op = (1 - (a / 1.8) ** 2) * Math.min(1, fin);
    const c = i % 2 ? COULEURS.violet : COULEURS.rose;
    s += `<g transform="translate(${n1(px)} ${n1(py)}) scale(${n1(k)}) rotate(${n1(12 * Math.sin(a * 2 + i))})" opacity="${n1(op)}"><ellipse cx="0" cy="0" rx="13" ry="9" fill="${c}" stroke="${E}" stroke-width="3" transform="rotate(-20)"/><path d="M11 -3 L11 -46 q18 4 26 16" fill="none" stroke="${E}" stroke-width="4" stroke-linecap="round"/></g>`;
  }
  return s;
};

// De la vapeur : trois volutes grises qui montent de (x, y) en ondulant et
// s'effacent, en boucle.
const fumee = (x: number, y: number, age: number, fin: number) => {
  if (age < 0) return '';
  let s = '';
  for (let i = 0; i < 3; i++) {
    const u = ((age / 1.6 + 1 - i * 0.33) % 1);
    const px = x - 22 + 22 * i + 12 * Math.sin(u * 6 + i);
    const py = y - u * 150;
    const op = Math.min(1, age / 0.3, fin) * (1 - u) * 0.5;
    s += `<path d="M${n1(px)} ${n1(py)} q12 -18 0 -36 t0 -36" fill="none" stroke="#8a8784" stroke-width="${n1(4 + 4 * u)}" stroke-linecap="round" opacity="${n1(op)}"/>`;
  }
  return s;
};

// La crêpe qui saute : une galette orange qui part de (x, y), monte de 260 px
// en se retournant et retombe au même endroit en 0,7 s.
const crepe = (x: number, y: number, age: number) => {
  if (age < 0 || age > 0.7) return '';
  const u = age / 0.7;
  const py = y - 260 * Math.sin(Math.PI * u);
  const ry = Math.max(2, Math.abs(Math.cos(u * Math.PI * 2)) * 10);
  return `<ellipse cx="${n1(x)}" cy="${n1(py)}" rx="22" ry="${n1(ry)}" fill="${COULEURS.orange}" stroke="${E}" stroke-width="3"/>`;
};

// Des gouttes qui tombent de (x, y) (le héros trempé, le bord du parapluie),
// quelques-unes à la fois, en boucle.
const gouttes = (x: number, y: number, age: number, fin: number, largeur: number) => {
  if (age < 0) return '';
  let s = '';
  const op = Math.min(1, age / 0.3, fin);
  for (let i = 0; i < 5; i++) {
    const g = i * 11 + 3;
    const u = (age * (0.9 + 0.3 * hasard(g)) + hasard(g + 1)) % 1;
    const px = x - largeur / 2 + largeur * hasard(g + 2);
    const py = y + u * u * 170;
    s += `<path d="M${n1(px)} ${n1(py - 7)} q5 7 0 12 q-5 -5 0 -12 Z" fill="${COULEURS.bleu}" stroke="${E}" stroke-width="1.5" opacity="${n1(op * (1 - u * 0.6))}"/>`;
  }
  return s;
};

// Une lumière qui s'allume dans une fenêtre : un rectangle jaune de
// « largeur » x « hauteur » autour de (x, y), qui monte en 0,4 s, et un halo.
const lumiere = (x: number, y: number, age: number, largeur: number, hauteur: number) => {
  if (age < 0) return '';
  const op = Math.min(1, age / 0.4);
  return (
    `<rect x="${n1(x - largeur / 2)}" y="${n1(y - hauteur / 2)}" width="${n1(largeur)}" height="${n1(hauteur)}" fill="${COULEURS.jaune}" opacity="${n1(0.45 * op)}"/>` +
    `<rect x="${n1(x - largeur / 2 - 18)}" y="${n1(y - hauteur / 2 - 18)}" width="${n1(largeur + 36)}" height="${n1(hauteur + 36)}" rx="12" fill="${COULEURS.jaune}" opacity="${n1(0.12 * op)}"/>`
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
      case 'zzz':
        if (ef.a === undefined || t < ef.a) s += zzz(x, y, age, ef.a === undefined ? 1 : (ef.a - t) / 0.3);
        break;
      case 'notes':
        if (ef.a === undefined || t < ef.a) s += notes(x, y, age, ef.a === undefined ? 1 : (ef.a - t) / 0.4);
        break;
      case 'fumee':
        if (ef.a === undefined || t < ef.a) s += fumee(x, y, age, ef.a === undefined ? 1 : (ef.a - t) / 0.4);
        break;
      case 'crepe':
        s += crepe(x, y, age);
        break;
      case 'gouttes':
        if (ef.a === undefined || t < ef.a) s += gouttes(x, y, age, ef.a === undefined ? 1 : (ef.a - t) / 0.3, ef.largeur ?? 60);
        break;
      case 'lumiere':
        if (ef.a === undefined || t < ef.a) s += lumiere(x, y, age, ef.largeur ?? 90, ef.hauteur ?? 90);
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
