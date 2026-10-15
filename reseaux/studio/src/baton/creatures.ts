// Les créatures du bonhomme bâton : le dragon, au trait et en gris, avec
// ses yeux et sa gueule rouges (les seules couleurs). Dessiné tourné vers
// +x autour du centre de son corps, en unités U (60 px à l'échelle 1), et
// retourné par le caller. Quand il explose, il se change en éclats.
import { COULEURS, hasard } from './rig';
import type { EtatCreature } from './temps';

const E = COULEURS.encre;
const n2 = (v: number) => (Math.round(v * 100) / 100).toString();
const T = (w: number) => `fill="none" stroke="${E}" stroke-width="${n2(w)}" stroke-linecap="round" stroke-linejoin="round"`;
const SOMBRE = '#3a3836';
const GRIS = '#8a8784';

// Une aile : l'épaule en (0,0), trois doigts et la membrane entre eux.
// ouverture : 0 repliée le long du corps, 1 déployée ; battement : l'angle
// du battement en degrés (positif vers le bas).
const aile = (ouverture: number, battement: number, fill: string, w: number) => {
  const o = ouverture;
  const doigts: [number, number][] = [
    [-0.4 - 1.6 * o, -0.3 - 2.6 * o],
    [-1.0 - 2.4 * o, -0.1 - 1.6 * o],
    [-1.3 - 2.6 * o, 0.3 - 0.4 * o],
  ];
  const creux: [number, number][] = [
    [-1.1 - 1.2 * o, -0.1 - 1.2 * o],
    [-1.5 - 1.6 * o, 0.3 - 0.4 * o],
  ];
  let d = `M0 0 L${n2(doigts[0][0])} ${n2(doigts[0][1])}`;
  d += ` Q${n2(creux[0][0])} ${n2(creux[0][1])} ${n2(doigts[1][0])} ${n2(doigts[1][1])}`;
  d += ` Q${n2(creux[1][0])} ${n2(creux[1][1])} ${n2(doigts[2][0])} ${n2(doigts[2][1])}`;
  d += ` L-0.9 0.5 Z`;
  let s = `<g transform="rotate(${n2(battement)})"><path d="${d}" fill="${fill}" ${T(w)}/>`;
  for (const p of doigts) s += `<path d="M0 0 L${n2(p[0])} ${n2(p[1])}" ${T(w * 0.8)}/>`;
  return s + '</g>';
};

export const dessinDragon = (e: EtatCreature, graine: number): string => {
  const U = 60;
  if (e.eclate >= 0) return eclats(e, graine);
  const t = e.t;
  const batt = Math.sin(t * Math.PI * 2 * e.vitesseAiles) * (10 + 32 * e.ailes);
  const ouverture = 0.15 + 0.85 * e.ailes;
  let s = `<g transform="translate(${n2(e.x)} ${n2(e.y)}) scale(${n2(e.echelle * e.sens * U)} ${n2(e.echelle * U)})">`;
  // la queue, derrière
  const q = Math.sin(t * 2.4) * 0.25;
  s += `<path d="M-1.1 0.1 C-2.2 ${n2(0.2 + q)} -2.6 ${n2(1.1 + q)} -3.4 ${n2(1.3 - q)}" ${T(0.16)}/>`;
  s += `<path d="M-3.4 ${n2(1.3 - q)} l-0.35 -0.35 l0.55 -0.05 l-0.05 0.55 Z" fill="${SOMBRE}" ${T(0.08)}/>`;
  // l'aile de derrière, plus claire
  s += `<g transform="translate(-0.1 -0.55)" opacity="0.85">${aile(ouverture, batt * 0.8 + 8, GRIS, 0.08)}</g>`;
  // les pattes et les serres
  const serres = e.serres;
  const py = 0.5 + 0.5 * serres;
  s += `<path d="M0.2 0.5 L0.45 ${n2(py + 0.2)} M0.45 ${n2(py + 0.2)} l-0.25 0.3 M0.45 ${n2(py + 0.2)} l0.05 0.38 M0.45 ${n2(py + 0.2)} l0.3 0.25" ${T(0.1)}/>`;
  s += `<path d="M-0.5 0.6 L-0.3 ${n2(py + 0.1)} M-0.3 ${n2(py + 0.1)} l-0.25 0.28 M-0.3 ${n2(py + 0.1)} l0.02 0.36 M-0.3 ${n2(py + 0.1)} l0.28 0.22" ${T(0.1)}/>`;
  // le corps
  s += `<ellipse cx="0" cy="0" rx="1.3" ry="0.72" fill="${SOMBRE}" ${T(0.1)}/>`;
  s += `<path d="M-0.9 0.45 q0.9 0.45 1.9 0.05" ${T(0.06)} opacity="0.5"/>`;
  // le cou et la tête
  const cou = e.cou;
  const tx = 2.1;
  const ty = -1.5 + 1.4 * cou;
  s += `<path d="M0.9 -0.3 C1.5 ${n2(-0.9 + 0.6 * cou)} ${n2(tx - 0.3)} ${n2(ty + 0.6)} ${n2(tx)} ${n2(ty)}" ${T(0.3)}/>`;
  s += `<g transform="translate(${n2(tx)} ${n2(ty)}) rotate(${n2(cou * 35)})">`;
  // la mâchoire inférieure, qui s'ouvre
  const g = e.gueule;
  s += `<g transform="rotate(${n2(g * 32)})"><path d="M0 0.1 L1.15 0.35 L1.05 0.5 L0.1 0.5 Z" fill="${SOMBRE}" ${T(0.08)}/>`;
  if (g > 0.2) s += `<path d="M0.45 0.36 l0.08 -0.12 l0.08 0.12 M0.75 0.38 l0.08 -0.12 l0.08 0.12" fill="${COULEURS.fond}" ${T(0.04)}/>`;
  s += '</g>';
  // la lueur rouge dans la gueule
  if (g > 0.3) s += `<ellipse cx="0.55" cy="0.28" rx="${n2(0.4 * g)}" ry="${n2(0.18 * g)}" fill="${COULEURS.rouge}" opacity="${n2(0.75 * g)}"/>`;
  // le crâne et le museau
  s += `<path d="M-0.5 -0.15 C-0.4 -0.75 0.5 -0.8 1.0 -0.5 L1.25 0.0 L1.15 0.3 L0 0.2 Z" fill="${SOMBRE}" ${T(0.08)}/>`;
  // les cornes
  s += `<path d="M-0.2 -0.55 l-0.45 -0.75 l0.25 0.05 l0.4 0.6 Z M0.3 -0.65 l-0.2 -0.85 l0.25 0.1 l0.2 0.7 Z" fill="${GRIS}" ${T(0.06)}/>`;
  // l'œil rouge
  const yx = 0.35;
  const yy = -0.32;
  if (e.yeux > 0) s += `<circle cx="${yx}" cy="${yy}" r="${n2(0.3 + 0.15 * e.yeux)}" fill="${COULEURS.rouge}" opacity="${n2(0.18 * e.yeux)}"/>`;
  s += `<ellipse cx="${yx}" cy="${yy}" rx="${n2(0.14 + 0.05 * e.yeux)}" ry="${n2(0.1 + 0.08 * e.yeux)}" fill="${COULEURS.rouge}" ${T(0.05)}/>`;
  s += `<ellipse cx="${yx}" cy="${yy}" rx="0.035" ry="${n2(0.08 + 0.06 * e.yeux)}" fill="${E}"/>`;
  // la narine
  s += `<circle cx="1.05" cy="-0.1" r="0.05" fill="${E}"/>`;
  s += '</g>';
  // l'aile de devant
  s += `<g transform="translate(0.1 -0.6)">${aile(ouverture, batt, SOMBRE, 0.1)}</g>`;
  s += '</g>';
  return s;
};

// L'explosion : quatorze éclats de silhouette, vingt braises rouges, un
// anneau bleu électrique. Tout part en étoile du corps, retombe et s'efface.
const eclats = (e: EtatCreature, graine: number): string => {
  const a = e.eclate;
  if (a > 1.1) return '';
  const U = 60 * e.echelle;
  let s = '';
  const vie = 1 - Math.max(0, (a - 0.45) / 0.65);
  for (let i = 0; i < 14; i++) {
    const g = i * 13 + 7;
    const ang = hasard(g) * Math.PI * 2;
    const v = (520 + 900 * hasard(g + 1)) * e.echelle;
    const x = e.x + Math.cos(ang) * v * a + (hasard(g + 4) - 0.5) * U;
    const y = e.y + Math.sin(ang) * v * a + 1400 * a * a * 0.5 + (hasard(g + 5) - 0.5) * U;
    const r = (0.25 + 0.45 * hasard(g + 2)) * U;
    const rot = a * 720 * (hasard(g + 3) - 0.5);
    const fill = i % 3 === 0 ? '#8a8784' : '#3a3836';
    s += `<path d="M${n2(x - r)} ${n2(y + r * 0.6)} L${n2(x + r * 0.2)} ${n2(y - r)} L${n2(x + r)} ${n2(y + r * 0.3)} Z" fill="${fill}" ${T(5)} opacity="${n2(vie)}" transform="rotate(${n2(rot)} ${n2(x)} ${n2(y)})"/>`;
  }
  const vieBraise = 1 - Math.min(1, a / 0.6);
  for (let i = 0; i < 20; i++) {
    const g = i * 17 + 3 + graine * 0;
    const ang = hasard(g) * Math.PI * 2;
    const v = (700 + 1300 * hasard(g + 1)) * e.echelle;
    const x = e.x + Math.cos(ang) * v * a;
    const y = e.y + Math.sin(ang) * v * a + 600 * a * a;
    const r = (5 + 7 * hasard(g + 2)) * e.echelle * (0.5 + vieBraise);
    s += `<circle cx="${n2(x)}" cy="${n2(y)}" r="${n2(r)}" fill="${i % 2 ? COULEURS.rouge : '#ff8a3d'}" opacity="${n2(vieBraise)}"/>`;
  }
  if (a < 0.45) {
    const r = 60 + 900 * a;
    s += `<circle cx="${n2(e.x)}" cy="${n2(e.y)}" r="${n2(r)}" fill="none" stroke="${COULEURS.bleu}" stroke-width="${n2(28 * (1 - a / 0.45))}" opacity="${n2(0.9 * (1 - a / 0.45))}"/>`;
    s += `<circle cx="${n2(e.x)}" cy="${n2(e.y)}" r="${n2(r * 0.6)}" fill="none" stroke="#ffffff" stroke-width="${n2(10 * (1 - a / 0.45))}" opacity="${n2(0.8 * (1 - a / 0.45))}"/>`;
  }
  return s;
};
