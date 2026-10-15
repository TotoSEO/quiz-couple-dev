// Les décors du bonhomme bâton, au trait noir sur le papier : des paysages
// de 1080 x 1920, dessinés pour un instant t et, en travelling, pour un
// défilement (en pixels). Les travellings ont deux plans de profondeur : le
// lointain glisse plus lentement. Les obstacles d'un travelling sont posés
// par l'instant où ils passent sous le héros.
import type { NomDecorBaton, ObstacleBaton } from './recette';
import { COULEURS, hasard } from './rig';

const E = COULEURS.encre;
const W = 1080;
const H = 1920;
const n1 = (v: number) => (Math.round(v * 10) / 10).toString();
const T = (w = 6) => `fill="none" stroke="${E}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
const GRIS = '#dcdad6';
const GRIS2 = '#efeeeb';

// Un trait de sol un peu irrégulier, d'un bord à l'autre.
const sol = (y: number, w = 7) => `<path d="M-40 ${y} C200 ${y - 4} 380 ${y + 3} 540 ${y} C700 ${y - 3} 880 ${y + 4} 1120 ${y}" ${T(w)}/>`;

const soleil = (x: number, y: number, r: number) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${GRIS2}" ${T(5)}/>`;

const nuage = (x: number, y: number, s: number) =>
  `<path d="M${x} ${y} c0 ${-26 * s} ${40 * s} ${-30 * s} ${50 * s} ${-12 * s} c${10 * s} ${-24 * s} ${54 * s} ${-20 * s} ${56 * s} ${8 * s} c${22 * s} 0 ${26 * s} ${30 * s} 0 ${32 * s} l${-96 * s} 0 c${-24 * s} 0 ${-26 * s} ${-28 * s} ${-10 * s} ${-28 * s} z" fill="${COULEURS.fond}" ${T(5)}/>`;

const herbe = (x: number, y: number, s = 1) => `<path d="M${x} ${y} l${-8 * s} ${-22 * s} M${x} ${y} l${2 * s} ${-26 * s} M${x} ${y} l${10 * s} ${-20 * s}" ${T(4)}/>`;

// Une chaîne de montagnes : des pics en zigzag entre deux abscisses.
const montagnes = (y: number, h: number, pics: number[], fill: string, w = 6) => {
  let d = `M-60 ${y}`;
  pics.forEach((p, i) => {
    const x = -60 + ((i + 1) / (pics.length + 1)) * (W + 120);
    d += ` L${n1(x)} ${n1(y - h * p)}`;
  });
  d += ` L${W + 60} ${y} Z`;
  return `<path d="${d}" fill="${fill}" ${T(w)}/>`;
};

// Un arbre : un tronc qui s'ouvre en deux branches, un feuillage en
// bosses (cinq arcs), un trait de nervure.
const arbre = (x: number, pied: number, h: number, r: number, fill: string, trait: number, op = 1) => {
  const cy = pied - h - r * 0.55;
  const bosses = [
    [x - r, cy + r * 0.45],
    [x - r * 0.95, cy - r * 0.35],
    [x - r * 0.35, cy - r * 0.95],
    [x + r * 0.45, cy - r * 0.9],
    [x + r, cy - r * 0.2],
    [x + r * 0.9, cy + r * 0.5],
  ];
  let d = `M${n1(bosses[0][0])} ${n1(bosses[0][1])}`;
  for (let i = 1; i < bosses.length; i++) {
    const [ax, ay] = bosses[i - 1];
    const [bx, by] = bosses[i];
    const mx = (ax + bx) / 2;
    const my = (ay + by) / 2;
    const nx = -(by - ay);
    const ny = bx - ax;
    const l = Math.hypot(nx, ny) || 1;
    d += ` Q${n1(mx + (nx / l) * r * 0.42)} ${n1(my + (ny / l) * r * 0.42)} ${n1(bx)} ${n1(by)}`;
  }
  d += ` Q${n1(x)} ${n1(cy + r * 0.95)} ${n1(bosses[0][0])} ${n1(bosses[0][1])} Z`;
  return (
    `<g opacity="${op}"><path d="M${x - 12} ${pied} L${x - 8} ${n1(pied - h * 0.55)} L${x - 26} ${n1(pied - h * 0.9)} M${x - 8} ${n1(pied - h * 0.55)} L${x - 6} ${n1(pied - h)} L${x + 6} ${n1(pied - h)} L${x + 8} ${n1(pied - h * 0.6)} L${x + 24} ${n1(pied - h * 0.95)} M${x + 8} ${n1(pied - h * 0.6)} L${x + 12} ${pied} Z" fill="${fill}" ${T(trait)}/>` +
    `<path d="${d}" fill="${fill}" ${T(trait)}/>` +
    `<path d="M${n1(x - r * 0.4)} ${n1(cy + r * 0.2)} q${n1(r * 0.3)} ${n1(-r * 0.35)} ${n1(r * 0.7)} ${n1(-r * 0.15)}" ${T(3)} opacity="0.5"/></g>`
  );
};

// Un objet répété le long d'un travelling : pour chaque case de largeur
// « pas » dans le monde, un dessin décalé au hasard, de part et d'autre de
// la fenêtre visible. parallaxe : 1 au premier plan, moins loin derrière.
const repete = (defilement: number, parallaxe: number, pas: number, graine: number, dessin: (x: number, i: number) => string) => {
  const d = defilement * parallaxe;
  let out = '';
  const i0 = Math.floor((d - 300) / pas);
  const i1 = Math.ceil((d + W + 300) / pas);
  for (let i = i0; i <= i1; i++) {
    const x = i * pas + hasard(i * 7 + graine) * pas * 0.6 - d;
    out += dessin(x, i);
  }
  return out;
};

// Les pierres et crénelures d'une tour.
const tour = (x: number, haut: number, largeur: number, bas: number) => {
  let s = `<rect x="${x}" y="${haut}" width="${largeur}" height="${bas - haut}" fill="${COULEURS.fond}" ${T(7)}/>`;
  // les assises de pierres : des lignes, et un joint sur deux
  for (let y = haut + 60, r = 0; y < bas - 20; y += 60, r++) {
    s += `<path d="M${x} ${y} L${x + largeur} ${y}" ${T(3)} opacity="0.55"/>`;
    for (let k = r % 2 ? 0 : 1; k < 3; k += 1) {
      const jx = x + largeur * (0.18 + 0.32 * k) + (r % 2 ? 18 : 0);
      if (jx < x + largeur - 10) s += `<path d="M${jx} ${y - 60} L${jx} ${y - 22}" ${T(3)} opacity="0.55"/>`;
    }
  }
  // les créneaux
  const cw = largeur / 7;
  let d = `M${x - 24} ${haut} L${x - 24} ${haut - 34}`;
  for (let k = 0; k < 7; k++) {
    const cx = x - 24 + (k * (largeur + 48)) / 7;
    const cn = (largeur + 48) / 7;
    if (k % 2 === 0) d += ` L${cx} ${haut - 34} L${cx + cn} ${haut - 34} L${cx + cn} ${haut}`;
    else d += ` L${cx} ${haut} L${cx + cn} ${haut} L${cx + cn} ${haut - 34}`;
  }
  void cw;
  d += ` L${x + largeur + 24} ${haut}`;
  s += `<path d="${d} Z" fill="${COULEURS.fond}" ${T(7)}/>`;
  // une meurtrière
  s += `<rect x="${x + largeur / 2 - 10}" y="${haut + 240}" width="20" height="70" rx="8" fill="${E}"/>`;
  return s;
};

export type Couches = { fond: string; devant: string };

// La tour du décor « tour » : sa plateforme crénelée est le sol de celle
// qu'on vient délivrer (vocabulaire.json dit la même hauteur).
export const TOUR = { x: 740, largeur: 240, plateforme: 600 };

export const dessinDecor = (nom: NomDecorBaton, t: number, defilement: number, obstacles: ObstacleBaton[], herosX: number, defile: number, id: string): Couches => {
  // la position d'un obstacle : sous le héros à l'instant a
  const obs = (o: ObstacleBaton) => herosX + defile * (o.a - t);
  switch (nom) {
    case 'montagnes': {
      let f = soleil(190, 520, 64) + nuage(640, 560, 1.2) + nuage(200, 700, 0.8);
      f += montagnes(1300, 520, [0.35, 0.9, 0.5, 0.75, 0.3], GRIS2, 3);
      f += montagnes(1300, 380, [0.6, 0.3, 0.85, 0.45], GRIS, 4);
      // des hachures sur le pic de devant
      f += `<path d="M560 1010 l-30 70 M590 1040 l-40 90 M620 1080 l-30 70" ${T(3)} opacity="0.5"/>`;
      f += sol(1300);
      f += herbe(120, 1300) + herbe(330, 1300, 0.8) + herbe(760, 1300, 1.1) + herbe(980, 1300, 0.9);
      return { fond: f, devant: '' };
    }
    case 'foret': {
      let f = soleil(880, 480, 52);
      f += montagnes(1300, 300, [0.5, 0.8, 0.4], GRIS2, 4);
      // les arbres du fond, gris et lents
      f += repete(defilement, 0.35, 260, 3, (x, i) => arbre(x, 1300, 160 + 80 * hasard(i + 11), 70 + 40 * hasard(i + 13), GRIS2, 4, 0.9));
      f += sol(1300);
      f += repete(defilement, 1, 190, 5, (x, i) => herbe(x, 1300, 0.8 + 0.5 * hasard(i + 21)));
      // les arbres du premier plan, à l'encre
      let devant = repete(defilement, 1, 420, 7, (x, i) => arbre(x, 1300 + 40, 260 + 160 * hasard(i + 31), 90 + 60 * hasard(i + 37), COULEURS.fond, 7));
      // le tronc couché
      for (const o of obstacles.filter((q) => q.type === 'tronc')) {
        const x = obs(o);
        const l = o.largeur ?? 150;
        devant += `<rect x="${n1(x - l / 2)}" y="1218" width="${l}" height="82" rx="30" fill="${COULEURS.fond}" ${T(7)}/>`;
        devant += `<ellipse cx="${n1(x + l / 2)}" cy="1259" rx="22" ry="41" fill="${GRIS}" ${T(6)}/>`;
        devant += `<path d="M${n1(x - l / 2 + 30)} 1245 l40 0 M${n1(x - l / 2 + 20)} 1272 l60 0 M${n1(x + 10)} 1250 l30 0" ${T(3)} opacity="0.55"/>`;
      }
      return { fond: f + devant, devant: '' };
    }
    case 'falaise': {
      let f = soleil(240, 500, 58) + nuage(700, 520, 1);
      f += montagnes(1300, 560, [0.4, 0.95, 0.55, 0.8], GRIS2, 5);
      f += repete(defilement, 0.3, 300, 41, (x, i) => montagnes(1300, 200 + 120 * hasard(i + 43), [0.7], GRIS, 4).replace(/M-60 1300/, `M${n1(x - 160)} 1300`).replace(/L[-\d.]+ ([-\d.]+) L1140 1300/, (m, y) => `L${n1(x)} ${y} L${n1(x + 160)} 1300`));
      // le sol rocheux : des plaques, coupées par le ravin
      const trou = obstacles.find((q) => q.type === 'trou');
      const tx = trou ? obs(trou) : NaN;
      const tl = trou?.largeur ?? 420;
      const avantTrou = trou ? tx - tl / 2 : Infinity;
      const apresTrou = trou ? tx + tl / 2 : -Infinity;
      let s = `M-60 1300`;
      if (trou && avantTrou > -60) s += ` L${n1(avantTrou)} 1300 L${n1(avantTrou + 14)} 1340 L${n1(avantTrou - 10)} 1420 L${n1(avantTrou + 20)} 1520 L${n1(avantTrou)} 1920`;
      else if (trou) s = `M${n1(avantTrou)} 1920`;
      if (trou && apresTrou < W + 60) s += ` M${n1(apresTrou)} 1920 L${n1(apresTrou + 12)} 1500 L${n1(apresTrou - 16)} 1400 L${n1(apresTrou + 8)} 1330 L${n1(apresTrou)} 1300 L${W + 60} 1300`;
      else if (!trou || apresTrou >= W + 60) s += trou ? '' : ` L${W + 60} 1300`;
      if (trou) {
        // le vide : un gris qui s'assombrit vers le fond, des hachures qui descendent
        f += `<defs><linearGradient id="${id}-vide" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3f2ef"/><stop offset="1" stop-color="#b9b6b1"/></linearGradient></defs>`;
        f += `<rect x="${n1(avantTrou)}" y="1300" width="${n1(apresTrou - avantTrou)}" height="640" fill="url(#${id}-vide)"/>`;
        for (let y = 1360; y < 1900; y += 70) f += `<path d="M${n1(avantTrou + 30)} ${y} L${n1(apresTrou - 30)} ${y + 40}" ${T(3)} opacity="${0.5 - (y - 1360) / 1400}"/>`;
      }
      f += `<path d="${s}" ${T(7)}/>`;
      f += repete(defilement, 1, 230, 53, (x, i) => {
        if (trou && x > avantTrou - 60 && x < apresTrou + 60) return '';
        const r = 18 + 30 * hasard(i + 57);
        return `<path d="M${n1(x - r)} 1300 Q${n1(x - r * 0.6)} ${n1(1300 - r * 1.4)} ${n1(x)} ${n1(1300 - r * 1.3)} Q${n1(x + r * 0.7)} ${n1(1300 - r * 1.1)} ${n1(x + r)} 1300 Z" fill="${GRIS}" ${T(5)}/>`;
      });
      return { fond: f, devant: '' };
    }
    case 'pont': {
      let f = soleil(160, 460, 54) + nuage(520, 640, 0.9) + nuage(880, 420, 1.1);
      f += montagnes(1500, 700, [0.5, 0.85, 0.6, 0.9, 0.4], GRIS2, 4);
      // la tour au fond, qui grandit à mesure qu'on approche
      const avance = Math.min(1, (defilement * 0.12) / 400);
      const k = 0.55 + 0.45 * avance;
      const tx = 980 - 120 * avance;
      f += `<g transform="translate(${n1(tx)} 1500) scale(${n1(k)}) translate(-100 -1500)" opacity="${0.55 + 0.45 * avance}">${tour(60, 560, 150, 1500)}</g>`;
      // le vide sous le pont : des nuages plus bas
      f += nuage(300 - ((defilement * 0.5) % 700), 1700, 1.3) + nuage(900 - ((defilement * 0.5) % 700), 1620, 1);
      // les planches, les cordes, les poteaux
      f += `<path d="M-60 1300 L${W + 60} 1300" ${T(5)}/>`;
      f += repete(defilement, 1, 46, 61, (x) => `<path d="M${n1(x)} 1304 L${n1(x + 4)} 1348" ${T(5)}/>`);
      f += `<path d="M-60 1330 C300 1352 780 1352 ${W + 60} 1330" ${T(4)}/>`;
      f += `<path d="M-60 1080 C300 1120 780 1120 ${W + 60} 1080" ${T(5)}/>`;
      f += repete(defilement, 1, 210, 67, (x) => `<path d="M${n1(x)} 1090 L${n1(x)} 1310" ${T(3)} opacity="0.7"/>`);
      f += repete(defilement, 1, 1200, 71, (x) => `<path d="M${n1(x)} 1000 L${n1(x)} 1330 M${n1(x - 22)} 1330 L${n1(x + 22)} 1330" ${T(9)}/>`);
      return { fond: f, devant: '' };
    }
    case 'tour': {
      let f = soleil(170, 420, 60) + nuage(300, 760, 1) + nuage(640, 300, 0.9);
      f += montagnes(1300, 360, [0.5, 0.8, 0.45], GRIS2, 4);
      f += tour(TOUR.x, TOUR.plateforme, TOUR.largeur, 1300);
      f += sol(1300);
      // des gravats au pied de la tour
      f += `<path d="M680 1300 q14 -30 34 0 M1010 1300 q10 -22 26 0 M560 1300 q8 -16 20 0" ${T(4)}/>`;
      f += herbe(110, 1300) + herbe(420, 1300, 0.8);
      return { fond: f, devant: '' };
    }
    case 'sommet': {
      let f = soleil(820, 440, 66) + nuage(240, 560, 1.1) + nuage(900, 760, 0.8);
      // des oiseaux au loin
      for (let i = 0; i < 3; i++) {
        const bx = 180 + i * 90 + ((t * 18) % 60);
        const by = 700 + i * 24 + Math.sin(t * 2 + i) * 6;
        f += `<path d="M${n1(bx)} ${n1(by)} q8 -9 16 0 q8 -9 16 0" ${T(3)}/>`;
      }
      // tout en bas, très loin : des nuages sous la tour, on est haut
      f += nuage(120, 1640, 1.1) + nuage(760, 1720, 0.9) + nuage(460, 1840, 1.3);
      // la plateforme : le sol, un créneau de chaque côté, deux assises de mur dessous
      f += `<rect x="-60" y="1250" width="${W + 120}" height="230" fill="${COULEURS.fond}" ${T(7)}/>`;
      for (let y = 1310, r = 0; y < 1480; y += 60, r++) {
        f += `<path d="M-60 ${y} L${W + 60} ${y}" ${T(3)} opacity="0.5"/>`;
        for (let x = r % 2 ? 60 : 0; x < W + 60; x += 120) f += `<path d="M${x} ${y - 60} L${x} ${y - 22}" ${T(3)} opacity="0.5"/>`;
      }
      f += `<path d="M-20 1250 L-20 1150 L90 1150 L90 1250 M990 1250 L990 1150 L1100 1150 L1100 1250" ${T(7)} fill="${COULEURS.fond}"/>`;
      return { fond: f, devant: '' };
    }
  }
  void id;
  return { fond: '', devant: '' };
};
