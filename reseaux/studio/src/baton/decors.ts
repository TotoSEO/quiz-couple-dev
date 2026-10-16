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
// La nuit : un croissant de lune à la place du soleil, et des étoiles qui
// scintillent dans le ciel (jamais sous la ligne du titre).
const lune = (x: number, y: number, r: number) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${GRIS2}" ${T(5)}/><circle cx="${n1(x + r * 0.42)}" cy="${n1(y - r * 0.28)}" r="${n1(r * 0.86)}" fill="${COULEURS.fond}"/><path d="M${n1(x - r * 0.08)} ${n1(y + r * 0.95)} A${r} ${r} 0 0 1 ${n1(x - r * 0.75)} ${n1(y - r * 0.66)}" ${T(5)}/>`;
const etoiles = (t: number) => {
  let s = '';
  for (let i = 0; i < 14; i++) {
    const x = 40 + 1000 * hasard(i * 3 + 101);
    const y = 560 + 360 * hasard(i * 5 + 203);
    const k = (6 + 8 * hasard(i + 307)) * (0.85 + 0.15 * Math.sin(t * 3 + i * 1.7));
    s += `<path d="M${n1(x)} ${n1(y - k)} Q${n1(x)} ${n1(y)} ${n1(x + k)} ${n1(y)} Q${n1(x)} ${n1(y)} ${n1(x)} ${n1(y + k)} Q${n1(x)} ${n1(y)} ${n1(x - k)} ${n1(y)} Q${n1(x)} ${n1(y)} ${n1(x)} ${n1(y - k)} Z" fill="${E}" opacity="${n1(0.55 + 0.45 * Math.sin(t * 2.3 + i))}"/>`;
  }
  return s;
};
const astre = (nuit: boolean, t: number, x: number, y: number, r: number) => (nuit ? lune(x, y, r) + etoiles(t) : soleil(x, y, r));

// Des collines douces entre deux abscisses, en bosses.
const collines = (y: number, h: number, bosses: number[], fill: string, w = 4) => {
  let d = `M-60 ${y}`;
  const pas = (W + 120) / bosses.length;
  bosses.forEach((b, i) => {
    const x0 = -60 + i * pas;
    d += ` Q${n1(x0 + pas / 2)} ${n1(y - h * b * 2)} ${n1(x0 + pas)} ${y}`;
  });
  d += ` L${W + 60} ${y} Z`;
  return `<path d="${d}" fill="${fill}" ${T(w)}/>`;
};

// Une fleur des champs : une tige, deux feuilles, cinq pétales au trait.
const fleur = (x: number, y: number, s = 1) =>
  `<path d="M${x} ${y} q${-4 * s} ${-26 * s} ${2 * s} ${-48 * s} M${x} ${n1(y - 20 * s)} q${-14 * s} ${-4 * s} ${-16 * s} ${-16 * s} M${n1(x + 1 * s)} ${n1(y - 30 * s)} q${12 * s} ${-2 * s} ${14 * s} ${-14 * s}" ${T(3)}/>` +
  [0, 1, 2, 3, 4].map((i) => `<circle cx="${n1(x + 2 * s + Math.cos((i * Math.PI * 2) / 5) * 9 * s)}" cy="${n1(y - 50 * s + Math.sin((i * Math.PI * 2) / 5) * 9 * s)}" r="${n1(5.5 * s)}" fill="${COULEURS.fond}" ${T(2.5)}/>`).join('') +
  `<circle cx="${n1(x + 2 * s)}" cy="${n1(y - 50 * s)}" r="${n1(3.5 * s)}" fill="${E}"/>`;

// Un rocher : une masse irrégulière posée sur le sol, deux fêlures.
const rocher = (x: number, l: number) => {
  const h = l * 0.58;
  const y = 1300;
  return (
    `<path d="M${n1(x - l / 2)} ${y} Q${n1(x - l / 2 + 10)} ${n1(y - h * 0.55)} ${n1(x - l * 0.22)} ${n1(y - h * 0.82)} Q${n1(x + l * 0.05)} ${n1(y - h * 1.1)} ${n1(x + l * 0.3)} ${n1(y - h * 0.75)} Q${n1(x + l / 2 + 4)} ${n1(y - h * 0.4)} ${n1(x + l / 2)} ${y} Z" fill="${GRIS}" ${T(6)}/>` +
    `<path d="M${n1(x - l * 0.1)} ${n1(y - h * 0.7)} l${n1(l * 0.08)} ${n1(h * 0.25)} l${n1(-l * 0.04)} ${n1(h * 0.2)} M${n1(x + l * 0.22)} ${n1(y - h * 0.4)} l${n1(l * 0.05)} ${n1(h * 0.22)}" ${T(3)} opacity="0.6"/>`
  );
};

// Un banc de parc : une assise à lattes, un petit dossier, deux pieds.
const banc = (x: number, l: number) => {
  const y = 1300;
  return (
    `<rect x="${n1(x - l / 2)}" y="${y - 82}" width="${n1(l)}" height="26" rx="6" fill="${COULEURS.fond}" ${T(6)}/>` +
    `<path d="M${n1(x - l / 2 + 8)} ${y - 69} L${n1(x + l / 2 - 8)} ${y - 69}" ${T(3)} opacity="0.6"/>` +
    `<rect x="${n1(x - l / 2 + 6)}" y="${y - 150}" width="${n1(l - 12)}" height="24" rx="6" fill="${COULEURS.fond}" ${T(6)}/>` +
    `<path d="M${n1(x - l / 2 + 26)} ${y - 126} L${n1(x - l / 2 + 26)} ${y - 82} M${n1(x + l / 2 - 26)} ${y - 126} L${n1(x + l / 2 - 26)} ${y - 82}" ${T(6)}/>` +
    `<path d="M${n1(x - l / 2 + 22)} ${y - 56} L${n1(x - l / 2 + 22)} ${y} M${n1(x + l / 2 - 22)} ${y - 56} L${n1(x + l / 2 - 22)} ${y}" ${T(7)}/>`
  );
};

// Les obstacles que tout travelling peut poser : un rocher, un banc.
const obstaclesCommuns = (obstacles: ObstacleBaton[], obs: (o: ObstacleBaton) => number) => {
  let s = '';
  for (const o of obstacles) {
    if (o.type === 'rocher') s += rocher(obs(o), o.largeur ?? 150);
    if (o.type === 'banc') s += banc(obs(o), o.largeur ?? 200);
  }
  return s;
};

// Un palmier : un tronc courbe, cinq palmes qui retombent.
const palmier = (x: number, h: number, w: number) => {
  const tx = x + 26;
  const ty = 1300 - h;
  let s = `<path d="M${x} 1300 Q${n1(x - 14)} ${n1(1300 - h * 0.55)} ${n1(tx)} ${n1(ty)}" ${T(w)}/>`;
  for (let i = 0; i < 5; i++) {
    const a = -2.6 + i * 0.95;
    const px = tx + Math.cos(a) * 110;
    const py = ty + Math.sin(a) * 60 + 50;
    s += `<path d="M${n1(tx)} ${n1(ty)} Q${n1((tx + px) / 2 + (i < 2 ? -30 : 30))} ${n1(Math.min(py, ty) - 40)} ${n1(px)} ${n1(py)}" ${T(w * 0.75)}/>`;
  }
  return s;
};

// Un immeuble : une façade et ses fenêtres en grille.
const immeuble = (x: number, l: number, h: number, fill: string, w: number, graine: number) => {
  let s = `<rect x="${n1(x)}" y="${n1(1300 - h)}" width="${n1(l)}" height="${n1(h)}" fill="${fill}" ${T(w)}/>`;
  const cols = Math.max(2, Math.floor(l / 70));
  const rangs = Math.max(2, Math.floor(h / 95));
  for (let r = 0; r < rangs; r++) {
    for (let c = 0; c < cols; c++) {
      if (hasard(graine + r * 7 + c * 3) < 0.2) continue;
      const fx = x + 18 + (c * (l - 36)) / cols + 6;
      const fy = 1300 - h + 40 + (r * (h - 70)) / rangs;
      s += `<rect x="${n1(fx)}" y="${n1(fy)}" width="${n1((l - 36) / cols - 18)}" height="${n1((h - 70) / rangs - 30)}" fill="${COULEURS.fond}" ${T(Math.max(2, w - 2))}/>`;
    }
  }
  return s;
};

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

// Le lit de la chambre : on y dort la tête à droite, sur l'oreiller, le
// corps sous la couette (dessinée devant) ; et le canapé du salon, où l'on
// s'assied (sol : son assise). Le réalisateur lit les mêmes chiffres.
export const LIT = { x: 600, largeur: 440, matelas: 1130 };
export const CANAPE = { x: 620, largeur: 440, assise: 1216 };

// Une fenêtre d'intérieur : le cadre, la croisée, et dehors la lune et deux
// étoiles la nuit ou le soleil et un nuage le jour, deux rideaux.
const fenetre = (x: number, y: number, l: number, h: number, nuit: boolean, t: number) => {
  let s = `<rect x="${x}" y="${y}" width="${l}" height="${h}" rx="10" fill="${COULEURS.fond}" ${T(7)}/>`;
  const cx = x + l / 2;
  const cy = y + h * 0.45;
  if (nuit) {
    s += lune(cx + 20, cy - 10, Math.min(l, h) * 0.15);
    for (let i = 0; i < 3; i++) {
      const sx = x + 30 + ((l - 60) * ((i * 0.37 + 0.1) % 1));
      const sy = y + 30 + (h - 80) * ((i * 0.61 + 0.2) % 1);
      const k = 6 * (0.85 + 0.15 * Math.sin(t * 3 + i));
      s += `<path d="M${n1(sx)} ${n1(sy - k)} Q${n1(sx)} ${n1(sy)} ${n1(sx + k)} ${n1(sy)} Q${n1(sx)} ${n1(sy)} ${n1(sx)} ${n1(sy + k)} Q${n1(sx)} ${n1(sy)} ${n1(sx - k)} ${n1(sy)} Q${n1(sx)} ${n1(sy)} ${n1(sx)} ${n1(sy - k)} Z" fill="${E}"/>`;
    }
  } else s += soleil(cx + 30, cy - 20, Math.min(l, h) * 0.16) + nuage(x + 30, cy + 50, 0.5);
  s += `<path d="M${n1(cx)} ${y} L${n1(cx)} ${y + h} M${x} ${n1(cy + 20)} L${x + l} ${n1(cy + 20)}" ${T(5)}/>`;
  s += `<path d="M${x - 12} ${y - 20} q22 ${h * 0.5} -8 ${h + 40} L${x - 50} ${y + h + 20} L${x - 50} ${y - 20} Z M${x + l + 12} ${y - 20} q-22 ${h * 0.5} 8 ${h + 40} L${x + l + 50} ${y + h + 20} L${x + l + 50} ${y - 20} Z" fill="${GRIS2}" ${T(5)}/>`;
  return s;
};

// La tour du décor « tour » : sa plateforme crénelée est le sol de celle
// qu'on vient délivrer (vocabulaire.json dit la même hauteur).
export const TOUR = { x: 740, largeur: 240, plateforme: 670 };

export const dessinDecor = (nom: NomDecorBaton, t: number, defilement: number, obstacles: ObstacleBaton[], herosX: number, defile: number, id: string, nuit = false): Couches => {
  // la position d'un obstacle : sous le héros à l'instant a, ou fixe (x)
  const obs = (o: ObstacleBaton) => o.x ?? herosX + defile * (o.a - t);
  // un décor qui défile se dessine avec des objets répétés ; immobile, il
  // garde des positions choisies pour laisser la place au couple
  const fixe = !defile;
  switch (nom) {
    case 'montagnes': {
      let f = astre(nuit, t, 190, 610, 64) + nuage(640, 650, 1.2) + nuage(320, 770, 0.8);
      f += montagnes(1300, 520, [0.35, 0.9, 0.5, 0.75, 0.3], GRIS2, 3);
      f += montagnes(1300, 380, [0.6, 0.3, 0.85, 0.45], GRIS, 4);
      // des hachures sur le pic de devant
      f += `<path d="M560 1010 l-30 70 M590 1040 l-40 90 M620 1080 l-30 70" ${T(3)} opacity="0.5"/>`;
      f += sol(1300);
      f += herbe(120, 1300) + herbe(330, 1300, 0.8) + herbe(760, 1300, 1.1) + herbe(980, 1300, 0.9);
      return { fond: f + obstaclesCommuns(obstacles, obs), devant: '' };
    }
    case 'foret': {
      let f = astre(nuit, t, 880, 600, 52);
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
      return { fond: f + devant + obstaclesCommuns(obstacles, obs), devant: '' };
    }
    case 'falaise': {
      let f = astre(nuit, t, 240, 610, 58) + nuage(700, 640, 1);
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
      return { fond: f + obstaclesCommuns(obstacles, obs), devant: '' };
    }
    case 'pont': {
      let f = astre(nuit, t, 160, 600, 54) + nuage(520, 700, 0.9) + nuage(880, 580, 1.1);
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
      return { fond: f + obstaclesCommuns(obstacles, obs), devant: '' };
    }
    case 'prairie': {
      // une prairie : des collines douces, un grand arbre à gauche, des fleurs
      let f = astre(nuit, t, 860, 600, 62) + nuage(430, 660, 0.9) + nuage(680, 760, 0.7);
      f += collines(1300, 170, [0.45, 0.75, 0.4, 0.6], GRIS2, 3);
      f += collines(1300, 110, [0.3, 0.55, 0.35], GRIS, 4);
      f += arbre(150, 1300, 300, 150, COULEURS.fond, 7);
      f += sol(1300);
      f += fleur(300, 1300, 1) + fleur(560, 1300, 0.8) + fleur(760, 1300, 1.1) + fleur(940, 1300, 0.9) + herbe(430, 1300, 0.9) + herbe(860, 1300, 0.8) + herbe(1020, 1300, 1);
      return { fond: f + obstaclesCommuns(obstacles, obs), devant: '' };
    }
    case 'maison': {
      // chez eux : une maison à droite (un toit, une porte, une fenêtre, une
      // cheminée), un chemin, un arbre à gauche, des fleurs devant
      let f = astre(nuit, t, 180, 610, 58) + nuage(440, 660, 0.9);
      f += collines(1300, 120, [0.4, 0.6, 0.35], GRIS2, 3);
      f += arbre(150, 1300, 280, 140, COULEURS.fond, 7);
      // le corps, le toit, la cheminée
      f += `<rect x="620" y="900" width="380" height="400" fill="${COULEURS.fond}" ${T(7)}/>`;
      f += `<path d="M590 900 L810 700 L1030 900 Z" fill="${GRIS2}" ${T(7)}/>`;
      f += `<path d="M920 790 L920 720 L960 720 L960 826" fill="${COULEURS.fond}" ${T(6)}/>`;
      // la porte et sa poignée, la fenêtre et sa croisée
      f += `<rect x="760" y="1120" width="92" height="180" rx="8" fill="${GRIS}" ${T(6)}/><circle cx="836" cy="1215" r="6" fill="${E}"/>`;
      f += `<rect x="880" y="950" width="90" height="90" fill="${COULEURS.fond}" ${T(6)}/><path d="M925 950 L925 1040 M880 995 L970 995" ${T(4)}/>`;
      f += `<path d="M640 950 L640 1040 L730 1040 L730 950 Z M685 950 L685 1040 M640 995 L730 995" fill="${COULEURS.fond}" ${T(5)}/>`;
      f += sol(1300);
      // le chemin qui mène à la porte
      f += `<path d="M-40 1300 C300 1296 600 1304 760 1300 M-40 1330 C320 1322 620 1334 806 1300" ${T(3)} opacity="0.55"/>`;
      f += fleur(380, 1300, 0.9) + fleur(520, 1300, 1.05) + herbe(300, 1300, 0.8) + herbe(1040, 1300, 0.9);
      return { fond: f, devant: '' };
    }
    case 'ville': {
      // travelling en ville : des immeubles gris au loin, d'autres à l'encre
      // plus près, le trottoir, des lampadaires ; obstacle banc
      let f = astre(nuit, t, 900, 590, 54) + nuage(300, 640, 0.9);
      f += repete(defilement, 0.3, 300, 81, (x, i) => immeuble(x, 170 + 90 * hasard(i + 83), 520 + 420 * hasard(i + 85), GRIS2, 4, i));
      f += repete(defilement, 0.6, 430, 91, (x, i) => immeuble(x, 200 + 110 * hasard(i + 93), 360 + 340 * hasard(i + 95), COULEURS.fond, 6, i + 50));
      f += sol(1300);
      f += `<path d="M-60 1346 L${W + 60} 1346" ${T(4)} opacity="0.7"/>`;
      const lampadaire = (x: number) => `<path d="M${n1(x)} 1300 L${n1(x)} 930" ${T(9)}/><rect x="${n1(x - 30)}" y="890" width="60" height="44" rx="10" fill="${COULEURS.fond}" ${T(6)}/>` + (nuit ? `<path d="M${n1(x - 30)} 934 L${n1(x + 30)} 934 L${n1(x + 150)} 1300 L${n1(x - 150)} 1300 Z" fill="${COULEURS.jaune}" opacity="0.1"/>` : '');
      f += fixe ? lampadaire(150) + lampadaire(950) : repete(defilement, 1, 640, 97, (x) => lampadaire(x));
      return { fond: f + obstaclesCommuns(obstacles, obs), devant: '' };
    }
    case 'plage': {
      // travelling sur la plage : la mer et ses vagues au fond, le sable,
      // des palmiers ; obstacle rocher
      let f = astre(nuit, t, 220, 600, 62) + nuage(700, 660, 1);
      f += `<path d="M-60 1120 L${W + 60} 1120" ${T(5)}/>`;
      f += repete(defilement + t * 40, 0.5, 150, 111, (x) => `<path d="M${n1(x)} 1165 q22 -16 44 0 M${n1(x + 60)} 1210 q18 -12 36 0" ${T(4)} opacity="0.7"/>`);
      f += fixe ? palmier(110, 380, 9) + palmier(980, 330, 9) : repete(defilement, 1, 760, 121, (x, i) => palmier(x, 300 + 120 * hasard(i + 123), 9));
      f += sol(1300);
      f += repete(defilement, 1, 170, 131, (x, i) => `<circle cx="${n1(x)}" cy="${n1(1312 + 10 * hasard(i + 133))}" r="3" fill="${E}" opacity="0.5"/>`);
      return { fond: f + obstaclesCommuns(obstacles, obs), devant: '' };
    }
    case 'tour': {
      let f = astre(nuit, t, 170, 610, 60) + nuage(300, 800, 1) + nuage(560, 580, 0.9);
      f += montagnes(1300, 360, [0.5, 0.8, 0.45], GRIS2, 4);
      f += tour(TOUR.x, TOUR.plateforme, TOUR.largeur, 1300);
      f += sol(1300);
      // des gravats au pied de la tour
      f += `<path d="M680 1300 q14 -30 34 0 M1010 1300 q10 -22 26 0 M560 1300 q8 -16 20 0" ${T(4)}/>`;
      f += herbe(110, 1300) + herbe(420, 1300, 0.8);
      return { fond: f, devant: '' };
    }
    case 'sommet': {
      let f = astre(nuit, t, 820, 600, 66) + nuage(240, 660, 1.1) + nuage(900, 800, 0.8);
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
    case 'chambre': {
      // la chambre : le mur et sa plinthe, une fenêtre à gauche (la lune et
      // ses étoiles la nuit, le soleil le jour), un lit à droite (tête de lit
      // à droite, oreiller, matelas, pieds) et sa couette devant, une table
      // de nuit et sa lampe, un tapis
      let f = `<path d="M-60 1300 L${W + 60} 1300" ${T(7)}/><path d="M-60 1284 L${W + 60} 1284" ${T(3)} opacity="0.4"/>`;
      f += fenetre(130, 560, 300, 330, nuit, t);
      f += `<rect x="470" y="1150" width="100" height="150" fill="${COULEURS.fond}" ${T(6)}/><path d="M470 1200 L570 1200 M512 1225 L528 1225" ${T(3)} opacity="0.5"/>`;
      f += `<path d="M520 1150 L520 1080" ${T(6)}/><path d="M478 1080 L562 1080 L548 1010 L492 1010 Z" fill="${GRIS2}" ${T(6)}/>`;
      if (nuit) f += `<path d="M492 1080 L562 1080 L640 1300 L420 1300 Z" fill="${COULEURS.jaune}" opacity="0.12"/>`;
      f += `<ellipse cx="820" cy="1300" rx="280" ry="22" fill="${GRIS2}" ${T(4)}/>`;
      f += `<rect x="1030" y="940" width="40" height="290" rx="10" fill="${COULEURS.fond}" ${T(7)}/>`;
      f += `<rect x="${LIT.x}" y="${LIT.matelas}" width="${LIT.largeur}" height="60" rx="8" fill="${COULEURS.fond}" ${T(7)}/>`;
      f += `<rect x="${LIT.x}" y="${LIT.matelas + 60}" width="${LIT.largeur}" height="40" fill="${GRIS2}" ${T(6)}/>`;
      f += `<path d="M${LIT.x + 20} ${LIT.matelas + 100} L${LIT.x + 20} 1300 M${LIT.x + LIT.largeur - 20} ${LIT.matelas + 100} L${LIT.x + LIT.largeur - 20} 1300" ${T(8)}/>`;
      f += `<rect x="920" y="${LIT.matelas - 44}" width="110" height="48" rx="18" fill="${COULEURS.fond}" ${T(6)}/>`;
      const devant = `<path d="M${LIT.x + 8} ${LIT.matelas - 40} Q700 ${LIT.matelas - 68} 790 ${LIT.matelas - 42} Q860 ${LIT.matelas - 26} 915 ${LIT.matelas - 50} L915 ${LIT.matelas + 62} L${LIT.x + 8} ${LIT.matelas + 62} Z" fill="${GRIS}" ${T(6)}/><path d="M700 ${LIT.matelas - 30} q10 30 0 58 M820 ${LIT.matelas - 32} q-8 30 0 60" ${T(3)} opacity="0.5"/>`;
      return { fond: f, devant };
    }
    case 'cuisine': {
      // la cuisine : la fenêtre à gauche, une étagère et ses bocaux, le plan
      // de travail à droite avec la cuisinière (deux feux), ses placards, un
      // bol au bout
      let f = `<path d="M-60 1300 L${W + 60} 1300" ${T(7)}/><path d="M-60 1284 L${W + 60} 1284" ${T(3)} opacity="0.4"/>`;
      f += fenetre(110, 560, 280, 300, nuit, t);
      f += `<path d="M560 790 L1060 790" ${T(7)}/>`;
      for (let i = 0; i < 4; i++) {
        const bx = 600 + i * 110;
        f += `<rect x="${bx}" y="720" width="58" height="70" rx="8" fill="${GRIS2}" ${T(5)}/><rect x="${bx + 8}" y="708" width="42" height="14" rx="4" fill="${COULEURS.fond}" ${T(4)}/>`;
      }
      f += `<rect x="560" y="1110" width="540" height="190" fill="${GRIS2}" ${T(6)}/>`;
      f += `<rect x="584" y="1134" width="230" height="142" rx="6" fill="${COULEURS.fond}" ${T(4)}/><rect x="834" y="1134" width="230" height="142" rx="6" fill="${COULEURS.fond}" ${T(4)}/>`;
      f += `<path d="M790 1190 L790 1220 M858 1190 L858 1220" ${T(5)}/>`;
      f += `<rect x="560" y="1080" width="540" height="30" fill="${COULEURS.fond}" ${T(7)}/>`;
      f += `<rect x="690" y="1064" width="200" height="16" rx="4" fill="#3a3836"/>`;
      f += `<ellipse cx="750" cy="1066" rx="40" ry="8" fill="${GRIS}" ${T(4)}/><ellipse cx="840" cy="1066" rx="32" ry="7" fill="${GRIS}" ${T(4)}/>`;
      f += `<path d="M980 1080 q0 -50 40 -50 q40 0 40 50 Z" fill="${COULEURS.fond}" ${T(5)}/>`;
      return { fond: f, devant: '' };
    }
    case 'salon': {
      // le salon : une fenêtre, un cadre avec un cœur, un lampadaire à
      // gauche, le canapé à droite (dossier, assise, accoudoirs, pieds), un tapis
      let f = `<path d="M-60 1300 L${W + 60} 1300" ${T(7)}/><path d="M-60 1284 L${W + 60} 1284" ${T(3)} opacity="0.4"/>`;
      f += fenetre(300, 540, 300, 300, nuit, t);
      f += `<rect x="760" y="640" width="150" height="120" rx="6" fill="${COULEURS.fond}" ${T(6)}/>`;
      f += `<path d="M835 730 C805 705 805 665 835 680 C865 665 865 705 835 730 Z" fill="${COULEURS.rose}" ${T(4)}/>`;
      f += `<path d="M160 1300 L160 900" ${T(8)}/><path d="M110 900 L210 900 L190 830 L130 830 Z" fill="${GRIS2}" ${T(6)}/>`;
      if (nuit) f += `<path d="M130 900 L190 900 L300 1300 L20 1300 Z" fill="${COULEURS.jaune}" opacity="0.12"/>`;
      f += `<ellipse cx="840" cy="1300" rx="300" ry="22" fill="${GRIS2}" ${T(4)}/>`;
      f += `<rect x="${CANAPE.x + 20}" y="${CANAPE.assise - 136}" width="${CANAPE.largeur - 40}" height="136" rx="14" fill="${GRIS2}" ${T(6)}/>`;
      f += `<path d="M${CANAPE.x + CANAPE.largeur / 2} ${CANAPE.assise - 120} L${CANAPE.x + CANAPE.largeur / 2} ${CANAPE.assise - 10}" ${T(3)} opacity="0.5"/>`;
      f += `<rect x="${CANAPE.x}" y="${CANAPE.assise}" width="${CANAPE.largeur}" height="46" rx="10" fill="${COULEURS.fond}" ${T(7)}/>`;
      f += `<rect x="${CANAPE.x - 24}" y="${CANAPE.assise - 60}" width="60" height="106" rx="22" fill="${COULEURS.fond}" ${T(6)}/><rect x="${CANAPE.x + CANAPE.largeur - 36}" y="${CANAPE.assise - 60}" width="60" height="106" rx="22" fill="${COULEURS.fond}" ${T(6)}/>`;
      f += `<path d="M${CANAPE.x + 10} ${CANAPE.assise + 46} L${CANAPE.x + 10} 1300 M${CANAPE.x + CANAPE.largeur - 10} ${CANAPE.assise + 46} L${CANAPE.x + CANAPE.largeur - 10} 1300" ${T(8)}/>`;
      return { fond: f, devant: '' };
    }
  }
  void id;
  return { fond: '', devant: '' };
};
