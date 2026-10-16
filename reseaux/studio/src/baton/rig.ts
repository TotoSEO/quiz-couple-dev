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
import type { Arme, Genre, NomExpression, NomPose, Objet, QuiBaton, Vetement, Vue } from './recette';

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
// Pixels par R selon le genre : un garçon fait 8,2 R, soit 330 px, une fille un peu moins.
export const ECHELLE: Record<Genre, number> = { garcon: 40, fille: 37 };
export const genreDe = (qui: QuiBaton, genre?: Genre): Genre => genre ?? (qui === 'heros' ? 'garcon' : 'fille');

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
  // abattu : la tête tombe, les épaules aussi, les bras pendent
  abattu: pose({ torse: 7, tete: 16, epauleD: -3, coudeD: 4, epauleG: 5, coudeG: 4, hancheG: 4, genouG: 6, hancheD: -4, genouD: 6 }),
  souffle: pose({ torse: 65, tete: 0, epauleD: -27, coudeD: 0, lame: 40, epauleG: -22, coudeG: 0, hancheG: 30, genouG: 40, hancheD: 28, genouD: 38 }),
  'range-epee': pose({ torse: 6, tete: -4, epauleD: 165, coudeD: 125, epauleG: -35, coudeG: 30, hancheG: 12, genouG: 18, hancheD: -12, genouD: 18 }),
  'cache-dos': pose({ torse: -3, tete: 4, epauleD: -45, coudeD: -60, epauleG: 6, coudeG: 10 }),
  offre: pose({ torse: 5, tete: 5, epauleD: 75, coudeD: 15, epauleG: -8, coudeG: 12 }),
  attend: pose({ tete: 3, epauleD: 30, coudeD: 115, epauleG: 35, coudeG: 110, hancheG: 2, genouG: 2, hancheD: -2, genouD: 2 }),
  tend: pose({ torse: 15, tete: -8, epauleD: 85, coudeD: 5, epauleG: 80, coudeG: 8, hancheG: 8, genouG: 4, hancheD: -6, genouD: 4 }),
  portee: pose({ torse: -8, tete: -6, epauleD: 165, coudeD: 5, epauleG: 160, coudeG: 10, hancheG: 15, genouG: 45, hancheD: -10, genouD: 40, piedG: -30, piedD: -30 }),
  joie: pose({ torse: -3, tete: -6, epauleD: 150, coudeD: 15, epauleG: 150, coudeG: 15 }),
  assis: pose({ torse: 5, tete: 2, epauleD: 30, coudeD: 40, epauleG: 30, coudeG: 40, hancheG: 85, genouG: 15, hancheD: 80, genouD: 15 }),
  // frissonne : les bras croisés sur la poitrine, les épaules rentrées, les genoux serrés (l'action tremble fait le reste)
  frissonne: pose({ torse: 9, tete: 7, epauleD: 58, coudeD: 112, epauleG: 62, coudeG: 106, hancheG: 5, genouG: 9, hancheD: -4, genouD: 9 }),
  // montre : le bras proche tendu vers le ciel devant soi, la tête levée
  montre: pose({ torse: -5, tete: -24, epauleD: 142, coudeD: 4, epauleG: 6, coudeG: 10 }),
  // câlin : les deux bras en avant, autour de l'autre
  calin: pose({ torse: 9, tete: 7, epauleD: 68, coudeD: 62, epauleG: 76, coudeG: 54, hancheG: 4, genouG: 3, hancheD: -3, genouD: 3 }),
  // enveloppe : les deux bras levés en avant, une couverture ouverte entre les mains
  enveloppe: pose({ torse: 12, tete: 2, epauleD: 112, coudeD: 18, epauleG: 98, coudeG: 24, hancheG: 10, genouG: 6, hancheD: -8, genouD: 6 }),
  // accroupi : prêt à bondir, les jambes pliées, les bras en arrière
  accroupi: pose({ torse: 28, tete: -18, epauleD: -48, coudeD: 10, epauleG: -42, coudeG: 12, hancheG: 78, genouG: 96, hancheD: -38, genouD: 34, piedD: 14 }),
  // admire : les mains jointes devant, la tête penchée sur ce qu'on tient
  admire: pose({ torse: 6, tete: 16, epauleD: 42, coudeD: 98, epauleG: 46, coudeG: 94, hancheG: 2, genouG: 2, hancheD: -2, genouD: 2 }),
  // ── les poses du quotidien (16 octobre 2026, Thomas : « il faut varier les histoires ») ──
  // bâille : la main proche devant la bouche, la tête en arrière
  baille: pose({ torse: -6, tete: -12, epauleD: 120, coudeD: 120, epauleG: 10, coudeG: 8 }),
  // s'abrite : les deux mains sur la tête (la pluie), les épaules rentrées
  abrite: pose({ torse: 6, tete: 10, epauleD: 155, coudeD: 70, epauleG: 150, coudeG: 72, hancheG: 4, genouG: 8, hancheD: -3, genouD: 8 }),
  // tient le parapluie ouvert au-dessus de lui : le bras proche dressé
  'tient-parapluie': pose({ torse: 2, tete: -4, epauleD: 150, coudeD: 15, epauleG: 6, coudeG: 10 }),
  // le pas de loup : sur la pointe des pieds, un genou haut, les bras écartés (l'allure furtif anime)
  furtif: pose({ torse: 14, tete: -6, epauleD: 70, coudeD: 60, epauleG: -50, coudeG: 20, hancheG: 60, genouG: 90, hancheD: -10, genouD: 5, piedG: -40, piedD: -30 }),
  // porte l'autre sur son dos : penché en avant, les mains derrière les hanches sous ses jambes, les genoux pliés
  porteur: pose({ torse: 24, tete: -14, epauleD: -40, coudeD: -10, epauleG: -36, coudeG: -12, hancheG: 12, genouG: 14, hancheD: -8, genouD: 14 }),
  // portée sur le dos de l'autre : les bras autour de son cou, les genoux repliés autour de ses hanches
  'portee-dos': pose({ torse: 12, tete: 4, epauleD: 95, coudeD: 50, epauleG: 100, coudeG: 45, hancheG: 72, genouG: 100, hancheD: 62, genouD: 95, piedG: -20, piedD: -20 }),
  // invite à danser : une révérence, la main proche tendue paume ouverte
  invite: pose({ torse: 22, tete: -14, epauleD: 70, coudeD: 15, epauleG: -30, coudeG: 10, hancheG: 6, genouG: 4, hancheD: -8, genouD: 4 }),
  // deux temps de danse : la main proche levée qui tient celle de l'autre, le poids d'une jambe sur l'autre
  'danse-1': pose({ torse: 4, tete: -3, epauleD: 120, coudeD: 25, epauleG: 40, coudeG: 70, hancheG: 18, genouG: 14, hancheD: -10, genouD: 6 }),
  'danse-2': pose({ torse: -4, tete: 3, epauleD: 115, coudeD: 30, epauleG: 45, coudeG: 65, hancheG: -8, genouG: 6, hancheD: 20, genouD: 14 }),
  // tournoie : les bras en l'air, un pied levé
  tournoie: pose({ torse: -3, tete: -8, epauleD: 160, coudeD: 10, epauleG: 150, coudeG: 15, hancheG: 10, genouG: 30, hancheD: -4, genouD: 2, piedG: -30 }),
  // penché pour le pas de danse renversé : une fente, le bras proche à l'horizontale qui tient le dos de l'autre, l'autre bras levé
  penche: pose({ torse: 30, tete: -16, epauleD: 88, coudeD: 0, epauleG: 150, coudeG: 10, hancheG: 55, genouG: 50, hancheD: -35, genouD: 8 }),
  // renversée dans les bras de l'autre : le buste en arrière, un bras autour de son cou, l'autre tendu, une jambe levée
  penchee: pose({ torse: -50, tete: -12, epauleD: 125, coudeD: 35, epauleG: -150, coudeG: -10, hancheG: 40, genouG: 8, hancheD: -20, genouD: 55, piedG: -20, piedD: -40 }),
  // rattrape : un genou au sol, le buste en avant, les deux bras tendus bas devant
  rattrape: pose({ torse: 28, tete: -18, epauleD: 68, coudeD: 12, epauleG: 60, coudeG: 18, hancheG: 90, genouG: 120, hancheD: -30, genouD: 60 }),
  // rattrapée : couchée en arrière dans ses bras, un bras à son cou, l'autre pendu, les jambes tendues
  rattrapee: pose({ torse: -62, tete: -10, epauleD: 140, coudeD: 40, epauleG: -165, coudeG: 0, hancheG: 30, genouG: 15, hancheD: 5, genouD: 10, piedG: -30, piedD: -30 }),
  // tombe : le buste part en arrière, les bras battent l'air, une jambe lâche
  tombe: pose({ torse: -28, tete: -12, epauleD: 165, coudeD: 15, epauleG: 150, coudeG: 20, hancheG: 35, genouG: 20, hancheD: -5, genouD: 50, piedG: -20, piedD: -30 }),
  // équilibre : les bras à l'horizontale, un pied devant
  equilibre: pose({ torse: 4, tete: 2, epauleD: 95, coudeD: -5, epauleG: -95, coudeG: 5, hancheG: 25, genouG: 8, hancheD: -6, genouD: 4, piedG: 10 }),
  // dort : allongée (le plan la couche), les bras le long du corps, les genoux un peu pliés
  dort: pose({ torse: 3, tete: 6, epauleD: 15, coudeD: 60, epauleG: 10, coudeG: 20, hancheG: 12, genouG: 20, hancheD: 4, genouD: 15 }),
  // assise au bord du lit ou sur le canapé : les cuisses à l'horizontale, les tibias qui pendent
  'assis-canape': pose({ torse: -4, tete: 4, epauleD: 25, coudeD: 60, epauleG: 25, coudeG: 55, hancheG: 82, genouG: 85, hancheD: 78, genouD: 82 }),
  // cuisine : le bras proche tendu devant sur la poêle, la tête penchée dessus
  cuisine: pose({ torse: 10, tete: 14, epauleD: 75, coudeD: 25, epauleG: 20, coudeG: 80, hancheG: 6, genouG: 4, hancheD: -6, genouD: 4 }),
  // porte le plateau : les deux mains devant, à la même hauteur
  'porte-plateau': pose({ torse: 4, tete: 6, epauleD: 55, coudeD: 55, epauleG: 60, coudeG: 48, hancheG: 5, genouG: 4, hancheD: -5, genouD: 4 }),
  // bisou : les deux mains sur les épaules de l'autre, le front penché vers le sien
  bisou: pose({ torse: 10, tete: 16, epauleD: 60, coudeD: 55, epauleG: 65, coudeG: 50, hancheG: 4, genouG: 3, hancheD: -3, genouD: 3 }),
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

// Le pas de loup (allure « furtif ») : sur la pointe des pieds, un genou qui
// monte haut à chaque pas, le buste penché en avant, les bras écartés pour
// l'équilibre. phase : 0 à 1 par foulée complète.
export const cycleFurtif = (phase: number): Partial<Pose> & { rebond: number } => {
  const th = phase * Math.PI * 2;
  const lift = (t: number) => Math.max(0, Math.sin(t));
  return {
    torse: 16,
    tete: -8,
    hancheD: 2 + 60 * lift(th),
    genouD: 8 + 80 * lift(th),
    hancheG: 2 + 60 * lift(th + Math.PI),
    genouG: 8 + 80 * lift(th + Math.PI),
    piedD: -35 + 15 * lift(th),
    piedG: -35 + 15 * lift(th + Math.PI),
    epauleD: 75 + 8 * Math.sin(th),
    coudeD: 55,
    epauleG: -55 - 8 * Math.sin(th),
    coudeG: 15,
    rebond: 0.06 * Math.abs(Math.sin(th)),
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
type Visage = { yeux: Yeux; sourcils?: Sourcils; bouche: Bouche; joues?: boolean; etincelle?: boolean; larme?: boolean };

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
  // le chagrin : triste, et une larme qui coule de l'œil proche
  chagrin: { yeux: 'point', sourcils: 'tristes', bouche: 'triste', larme: true },
  // l'esprit vengeur : sourcils en biais, yeux plissés, et un sourire en coin
  vengeur: { yeux: 'plisse', sourcils: 'faches', bouche: 'coin' },
  // le froid : yeux plissés, sourcils tristes, la bouche qui claque des dents
  froid: { yeux: 'plisse', sourcils: 'tristes', bouche: 'peur' },
  // la tendresse : sourcils doux, sourire, les joues roses, les yeux ouverts
  tendre: { yeux: 'point', sourcils: 'doux', bouche: 'sourire', joues: true },
  // bâille : les yeux fermés, la bouche grande ouverte en o
  baille: { yeux: 'ferme', sourcils: 'hauts', bouche: 'o' },
  // dort : les yeux fermés, une bouche minuscule
  dort: { yeux: 'ferme', bouche: 'mini' },
  // la fatigue : les yeux mi-clos (en traits), les sourcils doux, la bouche minuscule
  fatigue: { yeux: 'trait', sourcils: 'doux', bouche: 'mini' },
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
  // la couverture (la chaleur) et l'étoile
  orange: '#f0a35e',
  jaune: '#f6c94c',
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
  genre: Genre;
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
  tient: Objet;
  vetement: Vetement;
  t: number;
  graine: number;
  // secondes depuis que l'expression a changé (la larme coule, l'étincelle naît)
  depuis: number;
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
    // une fille : deux cils au coin externe de chaque œil
    if (ap.genre === 'fille' && type !== 'bleu') {
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
  // la larme : une goutte qui perle sous l'œil proche, coule le long de la
  // joue et s'efface, puis une autre
  if (v.larme) {
    const e = yeux[1];
    const cycle = 1.0;
    const u = ((ap.depuis + 0.2) % cycle) / cycle;
    const perle = Math.min(1, ap.depuis / 0.3);
    const y = e[1] + 0.22 + u * 0.7;
    const r = 0.1 * perle * (u < 0.15 ? u / 0.15 : 1);
    const op = perle * (1 - Math.max(0, (u - 0.7) / 0.3));
    s += `<path d="M${n3(e[0] + 0.1)} ${n3(y - r * 1.6)} C${n3(e[0] + 0.1 + r)} ${n3(y - r * 0.4)} ${n3(e[0] + 0.1 + r)} ${n3(y + r)} ${n3(e[0] + 0.1)} ${n3(y + r)} C${n3(e[0] + 0.1 - r)} ${n3(y + r)} ${n3(e[0] + 0.1 - r)} ${n3(y - r * 0.4)} ${n3(e[0] + 0.1)} ${n3(y - r * 1.6)} Z" fill="${accent ? '#8fd3f4' : encre}" stroke="${encre}" stroke-width="0.05" opacity="${n3(op)}"/>`;
  }
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

// L'épée au dos ne se dessine pas (Thomas, 16 octobre 2026 : la poignée
// qui dépassait « apparaît dans son dos comme un stick bug, c'est moche et
// on comprend pas ce que c'est ») : dans ce style, l'épée apparaît dans la
// main quand on la tire et disparaît quand on la range. L'état « dos »
// reste pour le son du fourreau et pour savoir qu'elle est là.

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

// La couverture pliée, qui pend de la main proche : un pan orange, un pli.
const couverture = (s: Squelette, encre: string, accent: boolean): string => {
  const m = s.mainD;
  const c = accent ? COULEURS.orange : COULEURS.fond;
  return (
    `<path d="M${n3(m[0] - 0.46)} ${n3(m[1] + 0.08)} L${n3(m[0] + 0.46)} ${n3(m[1] + 0.08)} L${n3(m[0] + 0.52)} ${n3(m[1] + 1.15)} Q${n3(m[0] + 0.2)} ${n3(m[1] + 1.38)} ${n3(m[0] - 0.05)} ${n3(m[1] + 1.2)} Q${n3(m[0] - 0.3)} ${n3(m[1] + 1.4)} ${n3(m[0] - 0.52)} ${n3(m[1] + 1.15)} Z" fill="${c}" stroke="${encre}" stroke-width="0.09" stroke-linejoin="round"/>` +
    ligne([[m[0] - 0.1, m[1] + 0.12], [m[0] - 0.02, m[1] + 1.1]], encre, 0.05) +
    `<path d="M${n3(m[0] - 0.46)} ${n3(m[1] + 0.08)} q0.46 0.22 0.92 0" fill="none" stroke="${encre}" stroke-width="0.05"/>`
  );
};

// L'étoile décrochée du ciel, dans la main proche : cinq branches jaunes,
// un halo, trois éclats qui tournent.
export const cheminEtoile = (cx: number, cy: number, r: number): string => {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    d += `${i ? 'L' : 'M'}${n3(cx + Math.cos(a) * rr)} ${n3(cy + Math.sin(a) * rr)} `;
  }
  return d + 'Z';
};
const etoile = (s: Squelette, ap: Apparence, encre: string, accent: boolean): string => {
  const m = s.mainD;
  const c: [number, number] = [m[0] + 0.12, m[1] - 0.42];
  const jaune = accent ? COULEURS.jaune : COULEURS.fond;
  let out = '';
  if (accent) out += rond(c, 1.1, COULEURS.jaune, undefined, 0, ' opacity="0.16"') + rond(c, 0.75, COULEURS.jaune, undefined, 0, ' opacity="0.22"');
  out += `<path d="${cheminEtoile(c[0], c[1], 0.52)}" fill="${jaune}" stroke="${encre}" stroke-width="0.08" stroke-linejoin="round"/>`;
  if (accent) {
    for (let i = 0; i < 3; i++) {
      const a = ap.t * 2.2 + (i * Math.PI * 2) / 3;
      const p: [number, number] = [c[0] + Math.cos(a) * 0.9, c[1] + Math.sin(a) * 0.9];
      const k = 0.1 + 0.05 * Math.sin(ap.t * 9 + i);
      out += `<path d="M${n3(p[0])} ${n3(p[1] - k)} L${n3(p[0] + k * 0.4)} ${n3(p[1])} L${n3(p[0])} ${n3(p[1] + k)} L${n3(p[0] - k * 0.4)} ${n3(p[1])} Z" fill="${encre}"/>`;
    }
  }
  return out;
};

// La cape : une couverture sur les épaules, qui tombe dans le dos jusqu'aux
// cuisses, un col roulé, deux plis.
const cape = (s: Squelette, encre: string, accent: boolean): string => {
  const e = s.epaule;
  const c = accent ? COULEURS.orange : COULEURS.fond;
  const d = `M${n3(e[0] - 0.55)} ${n3(e[1] - 0.15)} C${n3(e[0] - 1.2)} ${n3(e[1] + 0.6)} ${n3(e[0] - 1.4)} ${n3(e[1] + 1.8)} ${n3(e[0] - 1.25)} ${n3(e[1] + 2.9)} Q${n3(e[0] - 0.3)} ${n3(e[1] + 3.15)} ${n3(e[0] + 0.75)} ${n3(e[1] + 2.85)} C${n3(e[0] + 0.95)} ${n3(e[1] + 1.8)} ${n3(e[0] + 0.85)} ${n3(e[1] + 0.6)} ${n3(e[0] + 0.6)} ${n3(e[1] - 0.1)} Q${n3(e[0])} ${n3(e[1] - 0.45)} ${n3(e[0] - 0.55)} ${n3(e[1] - 0.15)} Z`;
  return (
    `<path d="${d}" fill="${c}" stroke="${encre}" stroke-width="0.1" stroke-linejoin="round"/>` +
    ligne([[e[0] - 0.7, e[1] + 0.5], [e[0] - 0.85, e[1] + 2.5]], encre, 0.05) +
    ligne([[e[0] + 0.35, e[1] + 0.6], [e[0] + 0.45, e[1] + 2.4]], encre, 0.05) +
    `<path d="M${n3(e[0] - 0.6)} ${n3(e[1] - 0.1)} Q${n3(e[0])} ${n3(e[1] + 0.25)} ${n3(e[0] + 0.62)} ${n3(e[1] - 0.05)}" fill="none" stroke="${encre}" stroke-width="0.08"/>`
  );
};

// Le parapluie fermé : une canne noire dans le prolongement de la main (comme
// la lame), la toile roulée en fuseau rouge.
const parapluieFerme = (s: Squelette, encre: string, accent: boolean): string => {
  const d = membre(s.lame);
  const n: [number, number] = [-d[1], d[0]];
  const m = s.mainD;
  const base = plus(m, d, -0.35);
  const bout = plus(m, d, 2.3);
  const a = plus(m, d, 0.5);
  const b = plus(m, d, 2.1);
  const mid = plus(m, d, 1.3);
  const rouge = accent ? COULEURS.rouge : COULEURS.fond;
  return (
    ligne([base, bout], encre, 0.13) +
    `<path d="M${P(a)} Q${P(plus(mid, n, 0.3))} ${P(b)} Q${P(plus(mid, n, -0.3))} ${P(a)} Z" fill="${rouge}" stroke="${encre}" stroke-width="0.08" stroke-linejoin="round"/>` +
    `<path d="M${P(base)} Q${P(plus(plus(base, d, -0.3), n, 0.1))} ${P(plus(plus(base, d, -0.25), n, 0.35))}" fill="none" stroke="${encre}" stroke-width="0.12" stroke-linecap="round"/>`
  );
};

// Le parapluie ouvert : la canne droite au-dessus de la main, la toile rouge
// en dôme festonné, ses baleines, la pointe, le manche recourbé sous la main.
const parapluieOuvert = (s: Squelette, encre: string, accent: boolean): string => {
  const m = s.mainD;
  const h: [number, number] = [m[0], m[1] - 2.6];
  const r = 3.2;
  const nS = 5;
  const w = (2 * r) / nS;
  const rouge = accent ? COULEURS.rouge : COULEURS.fond;
  let d = `M${n3(h[0] - r)} ${n3(h[1])} Q${n3(h[0] - r * 0.9)} ${n3(h[1] - 1.1)} ${n3(h[0])} ${n3(h[1] - 1.35)} Q${n3(h[0] + r * 0.9)} ${n3(h[1] - 1.1)} ${n3(h[0] + r)} ${n3(h[1])}`;
  for (let i = 0; i < nS; i++) {
    const x0 = h[0] + r - i * w;
    d += ` Q${n3(x0 - w / 2)} ${n3(h[1] + 0.28)} ${n3(x0 - w)} ${n3(h[1])}`;
  }
  let out = `<path d="${d} Z" fill="${rouge}" stroke="${encre}" stroke-width="0.1" stroke-linejoin="round"/>`;
  for (let i = 1; i < nS; i++) out += ligne([[h[0] - r + i * w, h[1]], [h[0], h[1] - 1.3]], encre, 0.05, ' opacity="0.5"');
  out += ligne([[h[0], h[1] - 1.35], [h[0], h[1] - 1.62]], encre, 0.1);
  out += ligne([m, h], encre, 0.12);
  out += `<path d="M${n3(m[0])} ${n3(m[1])} L${n3(m[0])} ${n3(m[1] + 0.45)} Q${n3(m[0])} ${n3(m[1] + 0.8)} ${n3(m[0] - 0.3)} ${n3(m[1] + 0.75)}" fill="none" stroke="${encre}" stroke-width="0.12" stroke-linecap="round"/>`;
  return out;
};

// Le plateau du petit-déjeuner, entre les deux mains : une pile de crêpes
// orangées, une tasse violette, de la vapeur qui ondule.
const plateau = (s: Squelette, ap: Apparence, encre: string, accent: boolean): string => {
  const c: [number, number] = [(s.mainD[0] + s.mainG[0]) / 2 + 0.15, Math.min(s.mainD[1], s.mainG[1]) - 0.12];
  const orange = accent ? COULEURS.orange : COULEURS.fond;
  const violet = accent ? COULEURS.violet : COULEURS.fond;
  let out = `<ellipse cx="${n3(c[0])}" cy="${n3(c[1])}" rx="1.35" ry="0.3" fill="${COULEURS.fond}" stroke="${encre}" stroke-width="0.1"/>`;
  out += `<ellipse cx="${n3(c[0])}" cy="${n3(c[1] - 0.04)}" rx="1.15" ry="0.18" fill="none" stroke="${encre}" stroke-width="0.05" opacity="0.5"/>`;
  const px = c[0] - 0.5;
  for (let i = 0; i < 3; i++) out += `<ellipse cx="${n3(px)}" cy="${n3(c[1] - 0.14 - i * 0.11)}" rx="0.42" ry="0.1" fill="${orange}" stroke="${encre}" stroke-width="0.06"/>`;
  const tx = c[0] + 0.5;
  const ty = c[1] - 0.62;
  out += `<rect x="${n3(tx)}" y="${n3(ty)}" width="0.5" height="0.52" rx="0.08" fill="${violet}" stroke="${encre}" stroke-width="0.07"/>`;
  out += `<path d="M${n3(tx + 0.5)} ${n3(ty + 0.12)} q0.25 0.14 0 0.3" fill="none" stroke="${encre}" stroke-width="0.07" stroke-linecap="round"/>`;
  for (let i = 0; i < 2; i++) {
    const o = Math.sin(ap.t * 3 + i * 2) * 0.06;
    const x0 = tx + 0.12 + i * 0.26 + o;
    out += `<path d="M${n3(x0)} ${n3(ty - 0.08)} q0.1 -0.2 0 -0.4 t0 -0.4" fill="none" stroke="${encre}" stroke-width="0.05" stroke-linecap="round" opacity="${n3(0.35 + 0.15 * Math.sin(ap.t * 4 + i))}"/>`;
  }
  return out;
};

// La poêle dans la main proche : le manche dans le prolongement de l'avant-bras,
// la poêle gris sombre, et la crêpe dedans (sauf « poele-vide », quand elle vole).
const poele = (s: Squelette, ap: Apparence, encre: string, accent: boolean): string => {
  const d = membre(s.avantBrasD);
  const m = s.mainD;
  const c = plus(m, d, 1.6);
  let out = ligne([m, plus(m, d, 0.8)], encre, 0.14);
  out += `<path d="M${n3(c[0] - 0.85)} ${n3(c[1])} L${n3(c[0] - 0.7)} ${n3(c[1] + 0.32)} L${n3(c[0] + 0.7)} ${n3(c[1] + 0.32)} L${n3(c[0] + 0.85)} ${n3(c[1])} Z" fill="#3a3836" stroke="${encre}" stroke-width="0.07" stroke-linejoin="round"/>`;
  out += `<ellipse cx="${n3(c[0])}" cy="${n3(c[1])}" rx="0.85" ry="0.2" fill="#9a9794" stroke="${encre}" stroke-width="0.08"/>`;
  if (ap.tient === 'poele') out += `<ellipse cx="${n3(c[0])}" cy="${n3(c[1] - 0.03)}" rx="0.52" ry="0.1" fill="${accent ? COULEURS.orange : COULEURS.fond}" stroke="${encre}" stroke-width="0.05"/>`;
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
  // Le nœud rose et la queue de cheval vont à la fille, le bandana violet au
  // garçon, que l'un ou l'autre soit le héros (Thomas, 16 octobre 2026 : « tu as
  // utilisé la fille comme perso principal mais tu lui as mis le bandana de
  // ninja et pas le nœud rose »).
  const fille = ap.genre === 'fille';
  let out = '';
  // membres de derrière
  out += ligne([s.epaule, s.coudeG, s.mainG], loin, w * 0.92) + rond(s.mainG, 0.16, loin);
  out += ligne([s.hanche, s.genouG, s.chevilleG, s.orteilG], loin, w * 0.92);
  if (ap.vetement === 'cape') out += cape(s, encre, accent);
  // la queue de cheval, derrière la tête
  const vFlot = Math.min(2.2, ap.vent + Math.abs(ap.vitesse) / 420);
  if (fille) {
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
  if (!fille) {
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
  if (!fille) {
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
  if (ap.tient === 'couverture') out += couverture(s, encre, accent);
  if (ap.tient === 'etoile') out += etoile(s, ap, encre, accent);
  if (ap.tient === 'parapluie-ferme') out += parapluieFerme(s, encre, accent);
  if (ap.tient === 'parapluie') out += parapluieOuvert(s, encre, accent);
  if (ap.tient === 'plateau') out += plateau(s, ap, encre, accent);
  if (ap.tient === 'poele' || ap.tient === 'poele-vide') out += poele(s, ap, encre, accent);
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
