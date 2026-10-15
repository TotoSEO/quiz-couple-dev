// Le rig du bonhomme bâton : un squelette articulé (hanches, buste, cou,
// tête ; épaules, coudes, poignets ; hanches, genoux, chevilles, pieds),
// des poses nommées, le fondu d'une pose à l'autre, le cycle de course, et
// le dessin au trait en SVG : traits noirs à bouts ronds, une tête ronde,
// un visage en quelques traits. Tout est en unités R (le rayon de la tête),
// l'origine aux hanches, +x devant le personnage, +y vers le bas ; le
// personnage est dessiné tourné vers +x et retourné par le caller.
//
// Angles en degrés. Un membre mesure son angle depuis la verticale vers le
// bas (0 : pend ; 90 : à l'horizontale devant ; 180 : dressé en l'air ;
// négatif : vers l'arrière). Le coude et le genou sont relatifs : le coude
// plie l'avant-bras vers l'avant (le sens d'une flexion humaine), le genou
// plie le tibia vers l'arrière. Le buste mesure son angle depuis la
// verticale vers le haut, positif penché en avant ; la tête s'ajoute au buste.
import type { Arme, NomExpression, NomPose, QuiBaton, Vue } from './recette';

export type Pose = {
  torse: number;
  tete: number;
  epauleG: number;
  coudeG: number;
  epauleD: number;
  coudeD: number;
  hancheG: number;
  genouG: number;
  hancheD: number;
  genouD: number;
  piedG: number;
  piedD: number;
  // la lame par rapport à l'avant-bras (0 : dans son prolongement)
  lame: number;
};

// Longueurs des segments, en R.
export const L = { cou: 0.5, tete: 1, torse: 2.3, bras: 1.35, avantBras: 1.25, cuisse: 1.7, tibia: 1.65, pied: 0.62 };
export const TRAIT = 0.3;
// Pixels par R selon le personnage : le héros fait 8,2 R, soit 330 px.
export const ECHELLE: Record<QuiBaton, number> = { heros: 40, elle: 37 };

const rad = (d: number) => (d * Math.PI) / 180;
// direction d'un membre : (sin, cos), 0 vers le bas, 90 devant
const membre = (a: number): [number, number] => [Math.sin(rad(a)), Math.cos(rad(a))];
// direction du buste et de la tête : 0 vers le haut, positif penché devant
const dresse = (a: number): [number, number] => [Math.sin(rad(a)), -Math.cos(rad(a))];
const plus = (p: [number, number], d: [number, number], l: number): [number, number] => [p[0] + d[0] * l, p[1] + d[1] * l];

const base: Pose = { torse: 0, tete: 0, epauleG: 8, coudeG: 10, epauleD: -6, coudeD: 10, hancheG: 5, genouG: 4, hancheD: -5, genouD: 4, piedG: 0, piedD: 0, lame: 0 };
const pose = (p: Partial<Pose>): Pose => ({ ...base, ...p });

// G : le côté loin de la caméra (le bras et la jambe de derrière) ; D : le
// côté proche, celui qui tient l'épée et le bouquet. Le pied avant d'une
// garde est le gauche (G), le pied arrière le droit (D), comme dans le
// découpage de Thomas (« son pied arrière droit s'ancre dans le sol »).
export const POSES: Record<NomPose, Pose> = {
  debout: pose({}),
  parle: pose({ torse: 2, tete: 3, epauleD: 50, coudeD: 95, epauleG: 6, coudeG: 14 }),
  ecoute: pose({ tete: 6, epauleD: 4, coudeD: 12 }),
  choc: pose({ torse: -12, tete: -10, epauleG: 25, coudeG: -25, epauleD: -30, coudeD: -20, hancheG: 14, genouG: 10, hancheD: -16, genouD: 6 }),
  determine: pose({ torse: 8, tete: 2, epauleG: -8, coudeG: 25, epauleD: 4, coudeD: 28, hancheG: 10, genouG: 6, hancheD: -10, genouD: 6 }),
  'tire-epee-1': pose({ torse: 6, tete: -4, epauleD: 165, coudeD: 125, epauleG: -35, coudeG: 30, hancheG: 12, genouG: 18, hancheD: -12, genouD: 18 }),
  'tire-epee-2': pose({ torse: 10, tete: -2, epauleD: 35, coudeD: 5, lame: -10, epauleG: -40, coudeG: 20, hancheG: 18, genouG: 26, hancheD: -16, genouD: 26 }),
  'garde-pret': pose({ torse: 12, tete: -6, epauleD: 22, coudeD: 10, lame: 12, epauleG: -25, coudeG: 35, hancheG: 16, genouG: 22, hancheD: -14, genouD: 22 }),
  garde: pose({ torse: 14, tete: -10, epauleD: 95, coudeD: 40, lame: -10, epauleG: 80, coudeG: 55, hancheG: 30, genouG: 28, hancheD: -22, genouD: 12 }),
  'garde-basse': pose({ torse: 26, tete: -18, epauleD: 92, coudeD: 44, lame: -8, epauleG: 76, coudeG: 60, hancheG: 80, genouG: 95, hancheD: -36, genouD: 32 }),
  // le pied arrière reculé et ancré, la pointe enfoncée ; puis le talon qui se lève
  ancre: pose({ torse: 28, tete: -20, epauleD: 92, coudeD: 44, lame: -8, epauleG: 76, coudeG: 60, hancheG: 80, genouG: 95, hancheD: -46, genouD: 34, piedD: 12 }),
  'ancre-tendu': pose({ torse: 30, tete: -22, epauleD: 92, coudeD: 44, lame: -8, epauleG: 76, coudeG: 60, hancheG: 82, genouG: 98, hancheD: -46, genouD: 40, piedD: 32 }),
  bond: pose({ torse: 0, tete: -12, epauleD: 178, coudeD: 0, lame: 0, epauleG: -12, coudeG: 5, hancheG: -6, genouG: 4, hancheD: 8, genouD: 4, piedG: -70, piedD: -70 }),
  'vol-etire': pose({ torse: 12, tete: -8, epauleD: 150, coudeD: 20, epauleG: 125, coudeG: 25, hancheG: 55, genouG: 80, hancheD: -35, genouD: 30, piedG: -20, piedD: -40 }),
  groupe: pose({ torse: 35, tete: 35, epauleD: 70, coudeD: 120, epauleG: 65, coudeG: 120, hancheG: 115, genouG: 135, hancheD: 105, genouD: 135, piedG: -20, piedD: -20 }),
  vaulte: pose({ torse: 80, tete: -25, epauleD: 5, coudeD: 0, epauleG: 12, coudeG: 0, hancheG: 70, genouG: 110, hancheD: 60, genouD: 100, piedG: -30, piedD: -30 }),
  atterrit: pose({ torse: 40, tete: -20, epauleD: 20, coudeD: 0, lame: 30, epauleG: -40, coudeG: -15, hancheG: 85, genouG: 120, hancheD: 45, genouD: 110 }),
  glisse: pose({ torse: -22, tete: 8, epauleD: -45, coudeD: 15, lame: 20, epauleG: 65, coudeG: 10, hancheG: 52, genouG: 6, hancheD: 20, genouD: 70, piedG: 20 }),
  'leve-tete': pose({ torse: -4, tete: -25, epauleD: 12, coudeD: 4, lame: 8, epauleG: 10, coudeG: 8 }),
  souffle: pose({ torse: 65, tete: 0, epauleD: -27, coudeD: 0, lame: 40, epauleG: -22, coudeG: 0, hancheG: 30, genouG: 40, hancheD: 28, genouD: 38 }),
  'range-epee': pose({ torse: 6, tete: -4, epauleD: 165, coudeD: 125, epauleG: -35, coudeG: 30, hancheG: 12, genouG: 18, hancheD: -12, genouD: 18 }),
  'cache-dos': pose({ torse: -3, tete: 4, epauleD: -45, coudeD: -60, epauleG: 6, coudeG: 10 }),
  offre: pose({ torse: 5, tete: 5, epauleD: 75, coudeD: 15, epauleG: -8, coudeG: 12 }),
  attend: pose({ tete: 3, epauleD: 30, coudeD: 115, epauleG: 35, coudeG: 110, hancheG: 2, genouG: 2, hancheD: -2, genouD: 2 }),
  tend: pose({ torse: 15, tete: -8, epauleD: 85, coudeD: 5, epauleG: 80, coudeG: 8, hancheG: 8, genouG: 4, hancheD: -6, genouD: 4 }),
  portee: pose({ torse: -8, tete: -6, epauleD: 165, coudeD: 5, epauleG: 160, coudeG: 10, hancheG: 15, genouG: 45, hancheD: -10, genouD: 40, piedG: -30, piedD: -30 }),
  joie: pose({ torse: -3, tete: -6, epauleD: 150, coudeD: 15, epauleG: 150, coudeG: 15 }),
  assis: pose({ torse: 5, tete: 2, epauleD: 30, coudeD: 40, epauleG: 30, coudeG: 40, hancheG: 85, genouG: 15, hancheD: 80, genouD: 15 }),
};

export const CLES = Object.keys(base) as (keyof Pose)[];

export const melange = (a: Pose, b: Pose, u: number): Pose => {
  const out = { ...a };
  for (const k of CLES) out[k] = a[k] + (b[k] - a[k]) * u;
  return out;
};

// ── Cycle de course ────────────────────────────────────────────────────

// phase : 0 à 1 par foulée complète (deux pas). intensite : 0 marche,
// 1 course, 1,4 sprint. Renvoie les membres et le buste.
export const cycleCourse = (phase: number, intensite: number): Partial<Pose> & { rebond: number } => {
  const th = phase * Math.PI * 2;
  const A = 22 + 20 * intensite;
  const G = 0.55 + 0.45 * intensite;
  const jambe = (t: number) => ({ hanche: A * Math.sin(t), genou: G * (50 + 50 * Math.sin(t + 0.9)) });
  const d = jambe(th);
  const g = jambe(th + Math.PI);
  const B = 18 + 24 * intensite;
  // le sprint est une course de ninja : buste couché en avant, les deux
  // bras tendus en arrière, la lame qui traîne derrière, pointe en l'air
  const ninja = intensite >= 1.3;
  const bras = ninja
    ? { epauleD: -62 + 6 * Math.sin(th), coudeD: 12, epauleG: -56 - 6 * Math.sin(th), coudeG: 12, lame: -60 }
    : { epauleD: -B * Math.sin(th), coudeD: 60 + 30 * intensite, epauleG: B * Math.sin(th), coudeG: 60 + 30 * intensite };
  return {
    torse: ninja ? 30 : 6 + 16 * intensite,
    tete: ninja ? -16 : -(3 + 8 * intensite),
    hancheD: d.hanche,
    genouD: d.genou,
    hancheG: g.hanche,
    genouG: g.genou,
    ...bras,
    piedD: -10 * Math.max(0, Math.sin(th)),
    piedG: -10 * Math.max(0, Math.sin(th + Math.PI)),
    rebond: (0.08 + 0.1 * intensite) * Math.abs(Math.sin(th)),
  };
};

// ── Cinématique directe ────────────────────────────────────────────────

export type Squelette = {
  hanche: [number, number];
  epaule: [number, number];
  tete: [number, number];
  coudeG: [number, number];
  mainG: [number, number];
  coudeD: [number, number];
  mainD: [number, number];
  genouG: [number, number];
  chevilleG: [number, number];
  orteilG: [number, number];
  genouD: [number, number];
  chevilleD: [number, number];
  orteilD: [number, number];
  // direction de l'avant-bras proche et de la lame, en degrés
  avantBrasD: number;
  lame: number;
  angleTete: number;
};

export const squelette = (p: Pose): Squelette => {
  const hanche: [number, number] = [0, 0];
  const epaule = plus(hanche, dresse(p.torse), L.torse);
  const angleTete = p.torse + p.tete;
  const tete = plus(epaule, dresse(angleTete), L.cou + L.tete);
  const coudeG = plus(epaule, membre(p.epauleG), L.bras);
  const mainG = plus(coudeG, membre(p.epauleG + p.coudeG), L.avantBras);
  const coudeD = plus(epaule, membre(p.epauleD), L.bras);
  const avantBrasD = p.epauleD + p.coudeD;
  const mainD = plus(coudeD, membre(avantBrasD), L.avantBras);
  const genouG = plus(hanche, membre(p.hancheG), L.cuisse);
  const tibiaG = p.hancheG - p.genouG;
  const chevilleG = plus(genouG, membre(tibiaG), L.tibia);
  const orteilG = plus(chevilleG, membre(tibiaG + 90 + p.piedG), L.pied);
  const genouD = plus(hanche, membre(p.hancheD), L.cuisse);
  const tibiaD = p.hancheD - p.genouD;
  const chevilleD = plus(genouD, membre(tibiaD), L.tibia);
  const orteilD = plus(chevilleD, membre(tibiaD + 90 + p.piedD), L.pied);
  return { hanche, epaule, tete, coudeG, mainG, coudeD, mainD, genouG, chevilleG, orteilG, genouD, chevilleD, orteilD, avantBrasD, lame: avantBrasD + p.lame, angleTete };
};

// La hauteur des hanches au-dessus du sol pour que le pied le plus bas
// touche le sol, en R (le demi-trait compris).
export const ancrage = (p: Pose): number => {
  const s = squelette(p);
  return Math.max(s.chevilleG[1], s.orteilG[1], s.chevilleD[1], s.orteilD[1]) + TRAIT / 2;
};

// ── Visage ─────────────────────────────────────────────────────────────

type Yeux = 'point' | 'rond' | 'grand' | 'trait' | 'plisse' | 'ferme' | 'heureux' | 'bleu' | 'clin';
type Sourcils = 'hauts' | 'tres-hauts' | 'faches' | 'releve' | 'tristes' | 'peur' | 'doux';
type Bouche = 'trait' | 'sourire' | 'o' | 'petit-o' | 'serre' | 'rire' | 'coin' | 'peur' | 'triste' | 'mini';
type Visage = { yeux: Yeux; sourcils?: Sourcils; bouche: Bouche; joues?: boolean; etincelle?: boolean };

export const VISAGES: Record<NomExpression, Visage> = {
  neutre: { yeux: 'point', bouche: 'trait' },
  sourire: { yeux: 'point', bouche: 'sourire' },
  rire: { yeux: 'heureux', bouche: 'rire' },
  surpris: { yeux: 'rond', sourcils: 'hauts', bouche: 'petit-o' },
  choc: { yeux: 'grand', sourcils: 'tres-hauts', bouche: 'o' },
  determine: { yeux: 'trait', sourcils: 'faches', bouche: 'serre' },
  concentre: { yeux: 'plisse', sourcils: 'faches', bouche: 'mini' },
  electrique: { yeux: 'bleu', sourcils: 'faches', bouche: 'serre' },
  charmeur: { yeux: 'clin', sourcils: 'releve', bouche: 'coin', etincelle: true },
  heureux: { yeux: 'heureux', bouche: 'sourire' },
  amour: { yeux: 'heureux', bouche: 'sourire', joues: true },
  peur: { yeux: 'rond', sourcils: 'peur', bouche: 'peur' },
  soulagee: { yeux: 'point', sourcils: 'doux', bouche: 'sourire' },
  ferme: { yeux: 'ferme', bouche: 'petit-o' },
  triste: { yeux: 'point', sourcils: 'tristes', bouche: 'triste' },
};

export const COULEURS = {
  encre: '#1d1b1a',
  loin: '#5b5856',
  fond: '#ffffff',
  violet: '#7f4db3',
  rose: '#e17398',
  bleu: '#49cdfd',
  bleuClair: '#bfefff',
  rouge: '#e03e3e',
  vert: '#3f9b4a',
};

const n3 = (v: number) => (Math.round(v * 1000) / 1000).toString();
const P = (p: [number, number]) => `${n3(p[0])} ${n3(p[1])}`;
// Pseudo-hasard stable (la même image donne toujours le même dessin).
export const hasard = (i: number) => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

export type Apparence = {
  qui: QuiBaton;
  pose: Pose;
  expression: NomExpression;
  vue: Vue;
  regard: [number, number];
  // ouverture de la bouche quand on parle (0 à 1), -1 sinon
  bouche: number;
  cligne: boolean;
  arme: Arme;
  charge: number;
  electrise: number;
  vent: number;
  // vitesse horizontale dans le sens du personnage (px/s), pour les pans et la queue de cheval
  vitesse: number;
  tient: 'bouquet' | 'aucun';
  t: number;
  graine: number;
  // l'étincelle du sourire charmeur (0 à 1)
  etincelle: number;
  // une rémanence : tout d'une couleur, sans accent
  teinte?: string;
  opacite?: number;
};

const ligne = (pts: [number, number][], couleur: string, largeur: number, extra = '') =>
  `<path d="M${pts.map(P).join(' L')}" fill="none" stroke="${couleur}" stroke-width="${n3(largeur)}" stroke-linecap="round" stroke-linejoin="round"${extra}/>`;
const rond = (c: [number, number], r: number, fill: string, stroke?: string, largeur = 0, extra = '') =>
  `<circle cx="${n3(c[0])}" cy="${n3(c[1])}" r="${n3(r)}" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="${n3(largeur)}"` : ''}${extra}/>`;

// Un éclair : une ligne brisée qui part d'un point vers une direction.
const eclair = (de: [number, number], angle: number, longueur: number, graine: number, couleur: string, largeur: number) => {
  const n = 3 + Math.floor(hasard(graine) * 3);
  const pts: [number, number][] = [de];
  let a = angle;
  let p = de;
  for (let i = 0; i < n; i++) {
    a += (hasard(graine + i * 7 + 1) - 0.5) * 1.6;
    const l = (longueur / n) * (0.6 + 0.8 * hasard(graine + i * 3 + 2));
    p = [p[0] + Math.cos(a) * l, p[1] + Math.sin(a) * l];
    pts.push(p);
  }
  return ligne(pts, couleur, largeur) + ligne(pts, '#ffffff', largeur * 0.35);
};

// Le visage dans le repère de la tête (centre en 0,0, rayon 1, tourné vers +x).
const visage = (ap: Apparence, encre: string, accent: boolean): string => {
  const v = VISAGES[ap.expression];
  const tq = ap.vue !== 'face';
  const yeux: [number, number][] = tq ? [[-0.04, -0.16], [0.46, -0.16]] : [[-0.3, -0.16], [0.3, -0.16]];
  const bouche: [number, number] = tq ? [0.34, 0.36] : [0, 0.4];
  const rx = ap.regard[0] * 0.07;
  const ry = ap.regard[1] * 0.07;
  let s = '';
  const w = 0.12;
  let yeuxType: Yeux = v.yeux;
  if (ap.cligne && (yeuxType === 'point' || yeuxType === 'rond')) yeuxType = 'ferme';
  yeux.forEach((e, i) => {
    const proche = i === 1;
    const type: Yeux = yeuxType === 'clin' ? (proche ? 'clin' : 'point') : yeuxType;
    switch (type) {
      case 'point':
        s += rond([e[0] + rx * 0.5, e[1] + ry * 0.5], 0.1, encre);
        break;
      case 'rond':
      case 'grand': {
        const r = type === 'grand' ? 0.25 : 0.2;
        s += rond(e, r, COULEURS.fond, encre, w) + rond([e[0] + rx, e[1] + ry], 0.08, encre);
        break;
      }
      case 'trait':
        s += ligne([[e[0] - 0.16, e[1]], [e[0] + 0.16, e[1]]], encre, w + 0.02);
        break;
      case 'plisse':
        s += ligne([[e[0] - 0.14, e[1] + 0.02], [e[0] + 0.14, e[1] - 0.02]], encre, w);
        break;
      case 'ferme':
        s += `<path d="M${n3(e[0] - 0.15)} ${n3(e[1])} Q${n3(e[0])} ${n3(e[1] + 0.12)} ${n3(e[0] + 0.15)} ${n3(e[1])}" fill="none" stroke="${encre}" stroke-width="${w}" stroke-linecap="round"/>`;
        break;
      case 'heureux':
        s += `<path d="M${n3(e[0] - 0.16)} ${n3(e[1] + 0.06)} Q${n3(e[0])} ${n3(e[1] - 0.16)} ${n3(e[0] + 0.16)} ${n3(e[1] + 0.06)}" fill="none" stroke="${encre}" stroke-width="${w}" stroke-linecap="round"/>`;
        break;
      case 'clin':
        s += ligne([[e[0] - 0.14, e[1] + 0.02], [e[0] + 0.14, e[1] + 0.02]], encre, w);
        break;
      case 'bleu':
        if (accent) s += rond(e, 0.42, COULEURS.bleu, undefined, 0, ' opacity="0.16"') + rond(e, 0.26, COULEURS.bleu, undefined, 0, ' opacity="0.4"') + rond([e[0] + rx * 0.5, e[1] + ry * 0.5], 0.13, COULEURS.bleuClair) + rond([e[0] + rx * 0.5, e[1] + ry * 0.5], 0.07, '#ffffff');
        else s += rond(e, 0.12, encre);
        break;
    }
    // elle : deux cils au coin externe de chaque œil
    if (ap.qui === 'elle' && type !== 'bleu') {
      const c = proche ? 1 : -1;
      s += ligne([[e[0] + c * 0.14, e[1] - 0.12], [e[0] + c * 0.24, e[1] - 0.22]], encre, 0.07) + ligne([[e[0] + c * 0.06, e[1] - 0.16], [e[0] + c * 0.12, e[1] - 0.28]], encre, 0.07);
    }
    // sourcils
    const sy = e[1] - 0.32;
    const nez = proche ? -1 : 1;
    switch (v.sourcils) {
      case 'hauts':
      case 'tres-hauts': {
        const h = v.sourcils === 'tres-hauts' ? 0.1 : 0.04;
        s += `<path d="M${n3(e[0] - 0.17)} ${n3(sy - h + 0.06)} Q${n3(e[0])} ${n3(sy - h - 0.1)} ${n3(e[0] + 0.17)} ${n3(sy - h + 0.06)}" fill="none" stroke="${encre}" stroke-width="${w}" stroke-linecap="round"/>`;
        break;
      }
      case 'faches':
        s += ligne([[e[0] - nez * 0.18, sy - 0.06], [e[0] + nez * 0.16, sy + 0.08]], encre, w + 0.02);
        break;
      case 'releve':
        if (proche) s += `<path d="M${n3(e[0] - 0.18)} ${n3(sy - 0.02)} Q${n3(e[0])} ${n3(sy - 0.22)} ${n3(e[0] + 0.18)} ${n3(sy - 0.08)}" fill="none" stroke="${encre}" stroke-width="${w}" stroke-linecap="round"/>`;
        else s += ligne([[e[0] - 0.16, sy + 0.08], [e[0] + 0.16, sy + 0.06]], encre, w);
        break;
      case 'tristes':
        s += ligne([[e[0] - nez * 0.16, sy + 0.1], [e[0] + nez * 0.16, sy - 0.02]], encre, w);
        break;
      case 'peur':
        s += ligne([[e[0] - nez * 0.16, sy - 0.1], [e[0] + nez * 0.16, sy + 0.02]], encre, w);
        break;
      case 'doux':
        s += `<path d="M${n3(e[0] - 0.16)} ${n3(sy + 0.04)} Q${n3(e[0])} ${n3(sy - 0.08)} ${n3(e[0] + 0.16)} ${n3(sy + 0.04)}" fill="none" stroke="${encre}" stroke-width="${w}" stroke-linecap="round"/>`;
        break;
    }
  });
  // joues
  if (v.joues && accent) s += rond([yeux[0][0] - 0.1, yeux[0][1] + 0.4], 0.12, COULEURS.rose, undefined, 0, ' opacity="0.55"') + rond([yeux[1][0] + 0.1, yeux[1][1] + 0.4], 0.12, COULEURS.rose, undefined, 0, ' opacity="0.55"');
  // bouche
  const [bx, by] = bouche;
  if (ap.bouche >= 0) {
    const o = 0.03 + 0.12 * ap.bouche;
    s += `<ellipse cx="${n3(bx)}" cy="${n3(by)}" rx="${n3(0.12 + 0.04 * ap.bouche)}" ry="${n3(o)}" fill="${ap.bouche > 0.25 ? encre : 'none'}" stroke="${encre}" stroke-width="${w}"/>`;
  } else {
    switch (v.bouche) {
      case 'trait':
        s += ligne([[bx - 0.15, by], [bx + 0.15, by]], encre, w);
        break;
      case 'serre':
        s += ligne([[bx - 0.2, by], [bx + 0.2, by]], encre, w + 0.03);
        break;
      case 'mini':
        s += ligne([[bx - 0.07, by], [bx + 0.07, by]], encre, w);
        break;
      case 'sourire':
        s += `<path d="M${n3(bx - 0.22)} ${n3(by - 0.04)} Q${n3(bx)} ${n3(by + 0.18)} ${n3(bx + 0.22)} ${n3(by - 0.04)}" fill="none" stroke="${encre}" stroke-width="${w}" stroke-linecap="round"/>`;
        break;
      case 'coin':
        s += `<path d="M${n3(bx - 0.2)} ${n3(by + 0.02)} Q${n3(bx + 0.04)} ${n3(by + 0.2)} ${n3(bx + 0.26)} ${n3(by - 0.08)}" fill="none" stroke="${encre}" stroke-width="${w}" stroke-linecap="round"/>`;
        break;
      case 'o':
        s += `<ellipse cx="${n3(bx)}" cy="${n3(by + 0.02)}" rx="0.13" ry="0.17" fill="${encre}"/>`;
        break;
      case 'petit-o':
        s += rond([bx, by], 0.09, 'none', encre, w);
        break;
      case 'rire':
        s += `<path d="M${n3(bx - 0.24)} ${n3(by - 0.04)} L${n3(bx + 0.24)} ${n3(by - 0.04)} Q${n3(bx)} ${n3(by + 0.34)} ${n3(bx - 0.24)} ${n3(by - 0.04)} Z" fill="${encre}"/>`;
        break;
      case 'peur':
        s += `<path d="M${n3(bx - 0.2)} ${n3(by)} q0.07 -0.09 0.14 0 t0.14 0 t0.14 0" fill="none" stroke="${encre}" stroke-width="${w}" stroke-linecap="round"/>`;
        break;
      case 'triste':
        s += `<path d="M${n3(bx - 0.18)} ${n3(by + 0.08)} Q${n3(bx)} ${n3(by - 0.1)} ${n3(bx + 0.18)} ${n3(by + 0.08)}" fill="none" stroke="${encre}" stroke-width="${w}" stroke-linecap="round"/>`;
        break;
    }
  }
  // l'étincelle du charmeur, près de l'œil proche
  if (v.etincelle && ap.etincelle > 0 && accent) {
    const e = yeux[1];
    const k = 0.22 * Math.min(1, ap.etincelle) * (1 + 0.1 * Math.sin(ap.t * 14));
    const [ex, ey] = [e[0] + 0.5, e[1] - 0.28];
    s += `<path d="M${n3(ex)} ${n3(ey - k)} Q${n3(ex)} ${n3(ey)} ${n3(ex + k)} ${n3(ey)} Q${n3(ex)} ${n3(ey)} ${n3(ex)} ${n3(ey + k)} Q${n3(ex)} ${n3(ey)} ${n3(ex - k)} ${n3(ey)} Q${n3(ex)} ${n3(ey)} ${n3(ex)} ${n3(ey - k)} Z" fill="${encre}" transform="rotate(${n3(ap.t * 40)} ${n3(ex)} ${n3(ey)})"/>`;
  }
  return s;
};

// ── L'épée ─────────────────────────────────────────────────────────────

export const LAME = 2.9;

// La lame tenue : poignée derrière la main, garde, lame effilée bleu pâle
// au cœur blanc, halo bleu et étincelles selon la charge.
const epeeEnMain = (s: Squelette, ap: Apparence, encre: string, accent: boolean): string => {
  const d = membre(s.lame);
  const n: [number, number] = [-d[1], d[0]];
  const m = s.mainD;
  const pointe = plus(m, d, LAME);
  const basLame = plus(m, d, 0.12);
  const poignee = plus(m, d, -0.5);
  let out = '';
  const bleu = accent ? COULEURS.bleu : '#999999';
  const charge = Math.max(0, Math.min(1, ap.charge));
  if (accent && charge > 0.05) {
    out += ligne([basLame, pointe], bleu, 1.1, ` opacity="${n3(0.08 + 0.12 * charge)}"`);
    out += ligne([basLame, pointe], bleu, 0.6, ` opacity="${n3(0.2 + 0.25 * charge)}"`);
  }
  // la poignée et la garde
  out += ligne([poignee, m], encre, 0.22);
  out += ligne([plus(m, n, 0.32), plus(m, n, -0.32)], encre, 0.18);
  // la lame effilée
  const w = 0.14;
  const l1 = plus(basLame, n, w);
  const l2 = plus(basLame, n, -w);
  const l3 = plus(plus(m, d, LAME * 0.82), n, -w * 0.75);
  const l4 = plus(plus(m, d, LAME * 0.82), n, w * 0.75);
  out += `<path d="M${P(l1)} L${P(l4)} L${P(pointe)} L${P(l3)} L${P(l2)} Z" fill="${accent ? COULEURS.bleuClair : COULEURS.fond}" stroke="${encre}" stroke-width="0.09" stroke-linejoin="round"/>`;
  out += ligne([plus(basLame, d, 0.1), plus(m, d, LAME * 0.86)], '#ffffff', 0.06);
  // les étincelles
  if (accent && charge > 0.05) {
    const nb = Math.round(1 + 7 * charge);
    for (let i = 0; i < nb; i++) {
      const g = ap.graine * 31 + i * 17;
      const u = 0.1 + 0.85 * hasard(g);
      const cote = hasard(g + 1) > 0.5 ? 1 : -1;
      const de = plus(plus(m, d, LAME * u), n, cote * w);
      const ang = Math.atan2(d[1], d[0]) + (cote * Math.PI) / 2 + (hasard(g + 2) - 0.5) * 1.2;
      out += eclair(de, ang, 0.3 + 0.6 * hasard(g + 3) * (0.5 + charge), g, bleu, 0.07);
    }
  }
  return out;
};

// La poignée qui dépasse au-dessus de l'épaule, et le fourreau dans le dos.
const epeeAuDos = (s: Squelette, encre: string): string => {
  const e = s.epaule;
  // la poignée dépasse derrière la tête, pas dessous : on la voit
  const haut: [number, number] = [e[0] - 1.55, e[1] - 1.25];
  const garde: [number, number] = [e[0] - 0.95, e[1] - 0.45];
  const fourreau: [number, number] = [-0.55, 0.9];
  return (
    ligne([garde, fourreau], encre, 0.22) +
    ligne([haut, garde], encre, 0.22) +
    ligne([[garde[0] - 0.22, garde[1] - 0.18], [garde[0] + 0.22, garde[1] + 0.18]], encre, 0.16)
  );
};

// Le bouquet : trois roses rouges, des tiges vertes, dans la main proche.
const bouquet = (s: Squelette, ap: Apparence, encre: string, accent: boolean): string => {
  const m = s.mainD;
  const d = membre(s.avantBrasD + 30);
  const up: [number, number] = [-d[1] * 0, -1];
  void up;
  let out = '';
  const rouge = accent ? COULEURS.rouge : encre;
  const vert = accent ? COULEURS.vert : encre;
  const tiges: [number, number][] = [[-0.25, -1.1], [0, -1.25], [0.25, -1.05]];
  for (const t of tiges) {
    const fin: [number, number] = [m[0] + t[0] + d[0] * 0.3, m[1] + t[1]];
    out += ligne([m, fin], vert, 0.1);
    out += `<ellipse cx="${n3(m[0] + t[0] * 0.5 + 0.08)}" cy="${n3(m[1] + t[1] * 0.55)}" rx="0.16" ry="0.08" fill="${vert}" transform="rotate(-30 ${n3(m[0] + t[0] * 0.5)} ${n3(m[1] + t[1] * 0.55)})"/>`;
    out += rond(fin, 0.24, rouge, encre, 0.07);
    out += rond([fin[0] + 0.05, fin[1] - 0.04], 0.09, encre, undefined, 0, ' opacity="0.45"');
  }
  out += `<path d="M${n3(m[0] - 0.22)} ${n3(m[1] - 0.05)} L${n3(m[0] + 0.22)} ${n3(m[1] - 0.05)} L${n3(m[0] + 0.1)} ${n3(m[1] + 0.45)} L${n3(m[0] - 0.1)} ${n3(m[1] + 0.45)} Z" fill="${COULEURS.fond}" stroke="${encre}" stroke-width="0.08" stroke-linejoin="round"/>`;
  return out;
};

// ── Le personnage entier ───────────────────────────────────────────────

export type Dessin = { svg: string; tete: [number, number]; mainD: [number, number]; pointe?: [number, number] };

export const dessinerBaton = (ap: Apparence): Dessin => {
  const s = squelette(ap.pose);
  const accent = !ap.teinte;
  const encre = ap.teinte ?? COULEURS.encre;
  const loin = ap.teinte ?? COULEURS.loin;
  const w = TRAIT;
  const elle = ap.qui === 'elle';
  let out = '';
  // membres de derrière
  out += ligne([s.epaule, s.coudeG, s.mainG], loin, w * 0.92) + rond(s.mainG, 0.16, loin);
  out += ligne([s.hanche, s.genouG, s.chevilleG, s.orteilG], loin, w * 0.92);
  if (ap.arme === 'dos') out += epeeAuDos(s, encre);
  // la queue de cheval, derrière la tête
  const vFlot = Math.min(2.2, ap.vent + Math.abs(ap.vitesse) / 420);
  if (elle) {
    const base: [number, number] = [s.tete[0] - 0.88, s.tete[1] - 0.3];
    const onde = Math.sin(ap.t * 9) * 0.1 * (0.3 + vFlot) + Math.sin(ap.t * 14.3) * 0.05 * vFlot;
    const recul = 0.3 * vFlot;
    out += `<path d="M${P(base)} Q${n3(base[0] - 0.6 - recul)} ${n3(base[1] + 0.05 + onde)} ${n3(base[0] - 0.75 - recul * 1.6)} ${n3(base[1] + 1.15 - 0.6 * vFlot + onde * 2)}" fill="none" stroke="${encre}" stroke-width="0.32" stroke-linecap="round"/>`;
    out += `<path d="M${P(base)} Q${n3(base[0] - 0.75 - recul)} ${n3(base[1] + 0.1 + onde)} ${n3(base[0] - 1.05 - recul * 1.6)} ${n3(base[1] + 1.0 - 0.55 * vFlot + onde * 2)}" fill="none" stroke="${encre}" stroke-width="0.22" stroke-linecap="round"/>`;
  }
  // le buste et la jambe proche
  out += ligne([s.hanche, s.epaule], encre, w);
  out += ligne([s.hanche, s.genouD, s.chevilleD, s.orteilD], encre, w);
  // le cou et la tête
  out += ligne([s.epaule, plus(s.epaule, dresse(s.angleTete), L.cou + 0.05)], encre, w);
  // le halo d'un corps électrisé
  if (ap.electrise > 0 && accent) {
    const c = plus(s.hanche, dresse(ap.pose.torse), L.torse * 0.55);
    out += `<radialGradient id="halo${ap.graine}" r="0.5"><stop offset="0" stop-color="${COULEURS.bleu}" stop-opacity="${n3(0.35 * ap.electrise)}"/><stop offset="1" stop-color="${COULEURS.bleu}" stop-opacity="0"/></radialGradient>`;
    out += `<circle cx="${n3(c[0])}" cy="${n3(c[1])}" r="4.2" fill="url(#halo${ap.graine})"/>`;
  }
  // les pans du bandana, derrière la tête
  if (!elle) {
    const noeud: [number, number] = [s.tete[0] - 0.96, s.tete[1] - 0.46];
    const couleur = accent ? COULEURS.violet : encre;
    for (let i = 0; i < 2; i++) {
      const ph = i * 1.9;
      const o1 = Math.sin(ap.t * 11 + ph) * (0.1 + 0.18 * vFlot);
      const o2 = Math.sin(ap.t * 7.3 + ph + 1) * (0.12 + 0.22 * vFlot);
      const recul = 0.5 + 0.55 * vFlot;
      const chute = 0.55 - 0.3 * Math.min(1.5, vFlot) + i * 0.3;
      const c1: [number, number] = [noeud[0] - recul * 0.7, noeud[1] - 0.1 + o1 + i * 0.15];
      const fin: [number, number] = [noeud[0] - recul * 1.5, noeud[1] + chute + o2];
      out += `<path d="M${P(noeud)} Q${P(c1)} ${P(fin)}" fill="none" stroke="${couleur}" stroke-width="${i ? 0.18 : 0.22}" stroke-linecap="round"/>`;
    }
  }
  // la tête
  out += `<g transform="translate(${P(s.tete)}) rotate(${n3(s.angleTete)})">`;
  out += rond([0, 0], 1, COULEURS.fond, encre, w);
  out += visage(ap, encre, accent);
  if (!elle) {
    const couleur = accent ? COULEURS.violet : encre;
    out += `<path d="M-0.785 -0.62 A1 1 0 0 1 0.785 -0.62 L0.933 -0.36 A1 1 0 0 0 -0.933 -0.36 Z" fill="${couleur}" stroke="${encre}" stroke-width="0.1" stroke-linejoin="round"/>`;
    out += rond([-0.96, -0.46], 0.17, couleur, encre, 0.08);
  } else {
    const couleur = accent ? COULEURS.rose : encre;
    const nx = -0.86;
    const ny = -0.5;
    out += `<path d="M${nx} ${ny} L${nx - 0.42} ${ny - 0.34} L${nx - 0.36} ${ny + 0.16} Z M${nx} ${ny} L${nx + 0.1} ${ny - 0.5} L${nx + 0.4} ${ny - 0.2} Z" fill="${couleur}" stroke="${encre}" stroke-width="0.08" stroke-linejoin="round"/>`;
    out += rond([nx, ny], 0.12, couleur, encre, 0.07);
  }
  out += '</g>';
  // le bras proche, la main, ce qu'elle tient
  out += ligne([s.epaule, s.coudeD, s.mainD], encre, w) + rond(s.mainD, 0.16, encre);
  let pointe: [number, number] | undefined;
  if (ap.arme === 'main') {
    out += epeeEnMain(s, ap, encre, accent);
    pointe = plus(s.mainD, membre(s.lame), LAME);
  }
  if (ap.tient === 'bouquet') out += bouquet(s, ap, encre, accent);
  // les éclairs sur le corps
  if (ap.electrise > 0 && accent) {
    const points: [number, number][] = [s.epaule, s.coudeG, s.mainG, s.coudeD, s.genouG, s.chevilleG, s.genouD, s.chevilleD, s.hanche, s.tete];
    const nb = Math.round(5 + 7 * ap.electrise);
    for (let i = 0; i < nb; i++) {
      const g = ap.graine * 53 + i * 11 + 5;
      const p0 = points[Math.floor(hasard(g) * points.length)];
      out += eclair(p0, hasard(g + 1) * Math.PI * 2, 0.5 + 1.1 * hasard(g + 2) * ap.electrise, g, COULEURS.bleu, 0.09);
    }
  }
  if (ap.opacite !== undefined && ap.opacite < 1) out = `<g opacity="${n3(ap.opacite)}">${out}</g>`;
  return { svg: out, tete: s.tete, mainD: s.mainD, pointe };
};
