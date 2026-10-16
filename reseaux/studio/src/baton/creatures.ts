// Les créatures du bonhomme bâton, au trait et en gris : le dragon, avec
// ses yeux et sa gueule rouges (les seules couleurs), le nuage d'orage, avec
// ses éclairs jaunes, la lune qu'on attrape au lasso, et la meute de chiens
// du jardin. Chacune est dessinée tournée vers +x autour du centre de son
// corps, en unités U (60 px à l'échelle 1), et retournée par le caller.
// Quand elle explose, elle se change en éclats (le dragon) ou crève en pluie
// et en étincelles (le nuage).
import { cheminEtoile, COULEURS, hasard } from './rig';
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

// Un éclair en zigzag de (x, y) vers le bas sur « longueur » U, jaune au
// cœur blanc ; la graine fait varier la forme d'une image à l'autre.
const eclairNuage = (x: number, y: number, longueur: number, graine: number, w: number) => {
  const n = 4 + Math.floor(hasard(graine) * 2);
  let d = `M${n2(x)} ${n2(y)}`;
  let px = x;
  let py = y;
  for (let i = 1; i <= n; i++) {
    px = x + (hasard(graine + i * 3) - 0.5) * 0.9 + (i % 2 ? 0.25 : -0.25);
    py = y + (longueur * i) / n;
    d += ` L${n2(px)} ${n2(py)}`;
  }
  return `<path d="${d}" fill="none" stroke="${COULEURS.jaune}" stroke-width="${n2(w)}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#ffffff" stroke-width="${n2(w * 0.35)}" stroke-linecap="round" stroke-linejoin="round"/>`;
};

// Le nuage d'orage : une masse grise à bosses, un visage fâché (deux yeux
// qui luisent, des sourcils en biais, une bouche en zigzag), des éclairs
// qui claquent dessous et, quand il est en colère, de la pluie.
export const dessinNuage = (e: EtatCreature, graine: number): string => {
  const U = 60;
  if (e.eclate >= 0) return pluieEtEtincelles(e, graine);
  const t = e.t;
  const flot = Math.sin(t * Math.PI * 2 * e.vitesseAiles) * 0.18 * e.ailes;
  let s = `<g transform="translate(${n2(e.x)} ${n2(e.y + flot * U * e.echelle)}) scale(${n2(e.echelle * e.sens * U)} ${n2(e.echelle * U)})">`;
  // les éclairs sous le nuage, qui claquent par à-coups
  if (e.cou > 0.1) {
    const nb = 1 + Math.round(e.cou * 2);
    for (let i = 0; i < nb; i++) {
      const g = graine * 7 + i * 13;
      if (hasard(g + 2) > 0.45 + 0.5 * e.cou) continue;
      const x = -1.1 + 2.2 * hasard(g + 1);
      s += eclairNuage(x, 0.6, 1.0 + 1.3 * hasard(g + 3) * e.cou, g, 0.12);
    }
  }
  // la pluie : des traits courts qui tombent, décalés par le temps
  if (e.serres > 0.05) {
    const nb = Math.round(14 * e.serres);
    for (let i = 0; i < nb; i++) {
      const g = i * 11 + 5;
      const x = -1.6 + 3.2 * hasard(g);
      const chute = ((t * 2.6 + hasard(g + 1)) % 1) * 2.4;
      s += `<path d="M${n2(x)} ${n2(0.7 + chute)} l-0.08 0.3" fill="none" stroke="${COULEURS.bleu}" stroke-width="0.07" stroke-linecap="round" opacity="${n2(0.5 + 0.4 * e.serres)}"/>`;
    }
  }
  // la masse : des bosses sur le dessus, un ventre plat
  const d = 'M-1.9 0.45 C-2.5 0.45 -2.6 -0.45 -1.9 -0.55 C-1.9 -1.25 -1.0 -1.5 -0.55 -1.05 C-0.3 -1.75 0.75 -1.8 1.0 -1.05 C1.65 -1.35 2.35 -0.8 2.05 -0.25 C2.65 -0.1 2.6 0.5 2.0 0.5 Z';
  s += `<path d="${d}" fill="#6b6865" ${T(0.1)}/>`;
  s += `<path d="M-1.4 0.1 q0.6 0.3 1.3 0.1 M0.6 -0.2 q0.5 0.2 1.0 0" ${T(0.05)} opacity="0.5"/>`;
  // le visage
  const colere = e.gueule;
  const lueur = e.yeux;
  for (const [ox, proche] of [[-0.55, false], [0.45, true]] as [number, boolean][]) {
    if (lueur > 0) s += `<circle cx="${n2(ox)}" cy="-0.35" r="${n2(0.3 + 0.12 * lueur)}" fill="${COULEURS.jaune}" opacity="${n2(0.16 * lueur)}"/>`;
    s += `<ellipse cx="${n2(ox)}" cy="-0.35" rx="0.24" ry="${n2(0.2 - 0.06 * colere)}" fill="${COULEURS.fond}" ${T(0.06)}/>`;
    s += `<circle cx="${n2(ox + 0.05)}" cy="${n2(-0.33 + 0.02 * colere)}" r="0.1" fill="${E}"/>`;
    // les sourcils, de plus en plus en biais
    const nez = proche ? -1 : 1;
    s += `<path d="M${n2(ox - nez * 0.3)} ${n2(-0.72 - 0.1 * colere)} L${n2(ox + nez * 0.26)} ${n2(-0.62 + 0.12 * colere)}" ${T(0.11)}/>`;
  }
  // la bouche : un trait boudeur, puis un zigzag fâché
  if (colere < 0.5) s += `<path d="M-0.35 0.05 Q-0.05 -0.1 0.3 0.05" ${T(0.08)}/>`;
  else s += `<path d="M-0.5 0.08 L-0.3 -0.08 L-0.1 0.08 L0.1 -0.08 L0.3 0.08 L0.5 -0.08" ${T(0.08)}/>`;
  s += '</g>';
  return s;
};

// Le nuage qui crève : la masse se dissout en gouttes bleues et en
// étincelles jaunes qui partent en étoile, un anneau blanc, et il ne reste
// rien, le ciel est dégagé.
const pluieEtEtincelles = (e: EtatCreature, graine: number): string => {
  const a = e.eclate;
  if (a > 1.1) return '';
  const U = 60 * e.echelle;
  let s = '';
  // la masse qui se dissipe
  if (a < 0.5) {
    const k = 1 + a * 1.6;
    s += `<g transform="translate(${n2(e.x)} ${n2(e.y)}) scale(${n2(k * U * e.sens)} ${n2(k * U)})" opacity="${n2(0.9 * (1 - a / 0.5))}"><path d="M-1.9 0.45 C-2.5 0.45 -2.6 -0.45 -1.9 -0.55 C-1.9 -1.25 -1.0 -1.5 -0.55 -1.05 C-0.3 -1.75 0.75 -1.8 1.0 -1.05 C1.65 -1.35 2.35 -0.8 2.05 -0.25 C2.65 -0.1 2.6 0.5 2.0 0.5 Z" fill="#6b6865" ${T(0.08)}/></g>`;
  }
  const vie = 1 - Math.min(1, a / 0.9);
  for (let i = 0; i < 26; i++) {
    const g = i * 17 + 3 + graine * 0;
    const ang = hasard(g) * Math.PI * 2;
    const v = (500 + 1100 * hasard(g + 1)) * e.echelle;
    const x = e.x + Math.cos(ang) * v * a;
    const y = e.y + Math.sin(ang) * v * a + 900 * a * a;
    if (i % 3 === 0) {
      const r = (14 + 10 * hasard(g + 2)) * e.echelle;
      s += `<path d="${cheminEtoile(x, y, r)}" fill="${COULEURS.jaune}" stroke="${E}" stroke-width="3" opacity="${n2(vie)}" transform="rotate(${n2(a * 400)} ${n2(x)} ${n2(y)})"/>`;
    } else {
      const r = (6 + 7 * hasard(g + 2)) * e.echelle;
      s += `<path d="M${n2(x)} ${n2(y - r * 1.5)} C${n2(x + r)} ${n2(y - r * 0.3)} ${n2(x + r)} ${n2(y + r)} ${n2(x)} ${n2(y + r)} C${n2(x - r)} ${n2(y + r)} ${n2(x - r)} ${n2(y - r * 0.3)} ${n2(x)} ${n2(y - r * 1.5)} Z" fill="${COULEURS.bleu}" stroke="${E}" stroke-width="2.5" opacity="${n2(vie)}"/>`;
    }
  }
  if (a < 0.45) {
    const r = 60 + 800 * a;
    s += `<circle cx="${n2(e.x)}" cy="${n2(e.y)}" r="${n2(r)}" fill="none" stroke="#ffffff" stroke-width="${n2(22 * (1 - a / 0.45))}" opacity="${n2(0.9 * (1 - a / 0.45))}"/>`;
    s += `<circle cx="${n2(e.x)}" cy="${n2(e.y)}" r="${n2(r * 0.7)}" fill="none" stroke="${COULEURS.jaune}" stroke-width="${n2(10 * (1 - a / 0.45))}" opacity="${n2(0.8 * (1 - a / 0.45))}"/>`;
  }
  return s;
};

// La lune : un grand disque pâle à trois cratères et un visage endormi
// (yeux fermés, petit sourire) ; tirée par le lasso, elle s'écrase un peu
// (cou), ouvre des yeux ronds et la bouche (gueule, yeux) et la corde fait
// une boucle autour d'elle (serres) ; posée, elle rayonne (ailes) et sourit
// les yeux fermés, les joues roses.
export const dessinLune = (e: EtatCreature, graine: number): string => {
  void graine;
  const U = 60;
  const R = 2.2;
  const k = e.echelle * U;
  let s = `<g transform="translate(${n2(e.x)} ${n2(e.y)}) scale(${n2(k * e.sens)} ${n2(k)})">`;
  // le halo, qui respire
  const halo = 0.5 + 0.5 * e.ailes;
  const resp = 1 + 0.04 * Math.sin(e.t * 2.1);
  s += `<circle cx="0" cy="0" r="${n2(R * 1.75 * resp)}" fill="${COULEURS.jaune}" opacity="${n2(0.08 * halo)}"/><circle cx="0" cy="0" r="${n2(R * 1.35 * resp)}" fill="${COULEURS.jaune}" opacity="${n2(0.12 * halo)}"/>`;
  s += `<g transform="scale(${n2(1 + 0.1 * e.cou)} ${n2(1 - 0.1 * e.cou)})">`;
  s += `<circle cx="0" cy="0" r="${n2(R)}" fill="#f6f1dc" ${T(0.1)}/>`;
  for (const [cx, cy, r] of [[-1.1, 0.9, 0.34], [0.9, 1.2, 0.26], [1.3, -0.9, 0.22], [-0.3, 1.6, 0.16]] as [number, number, number][]) s += `<circle cx="${n2(cx)}" cy="${n2(cy)}" r="${n2(r)}" fill="#e6dfc4" ${T(0.05)} opacity="0.8"/>`;
  // le visage : les yeux fermés ou ronds, la bouche, les joues
  for (const ox of [-0.62, 0.62]) {
    if (e.yeux < 0.5) s += `<path d="M${n2(ox - 0.26)} -0.35 Q${n2(ox)} ${n2(-0.12)} ${n2(ox + 0.26)} -0.35" ${T(0.1)}/>`;
    else s += `<circle cx="${n2(ox)}" cy="-0.38" r="${n2(0.2 + 0.1 * e.yeux)}" fill="${COULEURS.fond}" ${T(0.07)}/><circle cx="${n2(ox + 0.03)}" cy="${n2(-0.36 + 0.06 * e.cou)}" r="0.09" fill="${E}"/>`;
  }
  if (e.gueule > 0.5) s += `<ellipse cx="0" cy="0.5" rx="${n2(0.18 + 0.1 * e.gueule)}" ry="${n2(0.22 + 0.12 * e.gueule)}" fill="${E}"/>`;
  else s += `<path d="M-0.4 0.45 Q0 ${n2(0.75 + 0.15 * e.ailes)} 0.4 0.45" ${T(0.09)}/>`;
  if (e.ailes > 0.8) s += `<circle cx="-1.0" cy="0.25" r="0.2" fill="${COULEURS.rose}" opacity="0.5"/><circle cx="1.0" cy="0.25" r="0.2" fill="${COULEURS.rose}" opacity="0.5"/>`;
  s += '</g>';
  // la corde du lasso autour d'elle
  if (e.serres > 0.05) s += `<ellipse cx="0" cy="0.35" rx="${n2(R * 1.08)}" ry="${n2(R * 0.32)}" fill="none" stroke="${E}" stroke-width="0.14" opacity="${n2(e.serres)}"/>`;
  s += '</g>';
  return s;
};

// Un chien de la meute : un corps blanc, une tête ronde aux oreilles
// tombantes, quatre pattes, la queue qui bat (cou : la vitesse), la langue
// rose quand il est content (yeux), la gueule ouverte quand il aboie
// (gueule), et le saut (ailes : la hauteur, vitesseAiles : le rythme).
const chien = (x: number, y: number, k: number, sens: number, t: number, phase: number, e: EtatCreature): string => {
  const saut = e.ailes * 1.4 * Math.max(0, Math.sin(t * Math.PI * 2 * e.vitesseAiles + phase * Math.PI * 2));
  const bat = Math.sin(t * 14 * (0.5 + e.cou) + phase * 6) * (18 + 22 * e.cou);
  let s = `<g transform="translate(${n2(x)} ${n2(y - saut * k)}) scale(${n2(k * sens)} ${n2(k)})">`;
  // la queue
  s += `<path d="M-0.72 -0.05 q-0.3 -0.6 0.1 -0.95" fill="none" stroke="${E}" stroke-width="0.11" stroke-linecap="round" transform="rotate(${n2(bat)} -0.72 -0.05)"/>`;
  // les pattes : écartées en l'air, droites au sol
  const ecart = 0.25 * saut;
  s += `<path d="M-0.45 0.3 l${n2(-0.12 - ecart)} 0.55 M-0.25 0.32 l${n2(-0.02 - ecart * 0.5)} 0.55 M0.3 0.32 l${n2(0.02 + ecart * 0.5)} 0.55 M0.5 0.3 l${n2(0.12 + ecart)} 0.55" ${T(0.1)}/>`;
  // le corps
  s += `<ellipse cx="0" cy="0" rx="0.78" ry="0.42" fill="${COULEURS.fond}" ${T(0.1)}/>`;
  // la tête et les oreilles
  const hx = 0.75;
  const hy = -0.38 - 0.1 * saut;
  s += `<path d="M${n2(hx - 0.3)} ${n2(hy - 0.25)} q-0.35 0.1 -0.3 0.6 q0.25 0.1 0.35 -0.2 Z M${n2(hx + 0.3)} ${n2(hy - 0.25)} q0.35 0.1 0.3 0.6 q-0.25 0.1 -0.35 -0.2 Z" fill="#3a3836" ${T(0.07)}/>`;
  s += `<circle cx="${n2(hx)}" cy="${n2(hy)}" r="0.44" fill="${COULEURS.fond}" ${T(0.1)}/>`;
  s += `<circle cx="${n2(hx - 0.12)}" cy="${n2(hy - 0.1)}" r="0.06" fill="${E}"/><circle cx="${n2(hx + 0.16)}" cy="${n2(hy - 0.1)}" r="0.06" fill="${E}"/><circle cx="${n2(hx + 0.08)}" cy="${n2(hy + 0.08)}" r="0.08" fill="${E}"/>`;
  if (e.gueule > 0.5) {
    s += `<ellipse cx="${n2(hx + 0.12)}" cy="${n2(hy + 0.28)}" rx="0.12" ry="0.1" fill="${E}"/>`;
    s += `<path d="M${n2(hx + 0.55)} ${n2(hy + 0.1)} l0.18 -0.1 M${n2(hx + 0.6)} ${n2(hy + 0.3)} l0.2 0.02 M${n2(hx + 0.55)} ${n2(hy + 0.5)} l0.18 0.1" ${T(0.06)} opacity="0.7"/>`;
  } else if (e.yeux > 0.5) s += `<ellipse cx="${n2(hx + 0.14)}" cy="${n2(hy + 0.3)}" rx="0.09" ry="0.13" fill="${COULEURS.rose}" ${T(0.04)}/>`;
  else s += `<path d="M${n2(hx - 0.02)} ${n2(hy + 0.2)} q0.12 0.1 0.24 0" ${T(0.06)}/>`;
  s += '</g>';
  return s;
};

// La meute : « nombre » chiens répartis sur « largeur » px autour de (x, y),
// la ligne du sol de la meute ; une rangée du fond un peu plus petite et
// plus haute, une rangée devant, chacun tourné de son côté, décalé dans le
// temps pour que les sauts ne tombent jamais ensemble.
export const dessinChiens = (e: EtatCreature, graine: number): string => {
  void graine;
  const n = Math.max(1, Math.round(e.nombre ?? 8));
  const largeur = e.largeur ?? 720;
  let fond = '';
  let devant = '';
  for (let i = 0; i < n; i++) {
    const g = i * 13 + 7;
    const derriere = i % 2 === 1;
    const x = e.x - largeur / 2 + ((i + 0.5) * largeur) / n + (hasard(g) - 0.5) * (largeur / n) * 0.5;
    const taille = 60 * e.echelle * (0.82 + 0.3 * hasard(g + 1)) * (derriere ? 0.82 : 1);
    const sens = hasard(g + 2) > 0.5 ? 1 : -1;
    const dessin = chien(x, e.y - (derriere ? 46 : 0), taille, sens, e.t, hasard(g + 3), e);
    if (derriere) fond += dessin;
    else devant += dessin;
  }
  return `<g opacity="0.85">${fond}</g>${devant}`;
};

export const dessinCreature = (e: EtatCreature, graine: number): string =>
  e.qui === 'nuage' ? dessinNuage(e, graine) : e.qui === 'lune' ? dessinLune(e, graine) : e.qui === 'chiens' ? dessinChiens(e, graine) : dessinDragon(e, graine);
