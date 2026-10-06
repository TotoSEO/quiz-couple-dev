// Le temps d'une animation : où est chaque personnage, dans quelle pose,
// où regarde la caméra, à un instant donné. Des fonctions pures, sans
// React : le studio les appelle à chaque image, le contrôle les rejoue.
import type { OptionsMascotte } from '../../../charte/mascottes.js';
import vocabulaire from './vocabulaire.json';
import type { ClePov, Geste, NomEffet, NomObjet, PersoPov, PlanPov, Qui, SecoussePov } from './scenario';

export const TAILLE = 1.6;
const PI2 = Math.PI * 2;

// Dimensions des dessins (mascottes.js) : boîte, ligne du sol, yeux.
export const GABARITS: Record<
  Qui,
  { l: number; h: number; sol: number; centre: number; yeux: [number, number]; haut: number; bas: number; bouche: number; hanches: number; largeur: number; bras: number }
> = {
  rose: { l: 260, h: 280, sol: 270, centre: 130, yeux: [130, 136], haut: 64, bas: 238, bouche: 178, hanches: 214, largeur: 168, bras: 26 },
  violet: { l: 220, h: 300, sol: 290, centre: 110, yeux: [110, 106], haut: 26, bas: 264, bouche: 152, hanches: 237, largeur: 140, bras: 24 },
};

const bornes = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const douce = (p: number) => {
  const q = bornes(p);
  return q < 0.5 ? 4 * q * q * q : 1 - (-2 * q + 2) ** 3 / 2;
};
const sortie = (p: number) => 1 - (1 - bornes(p)) ** 3;
const ressort = (p: number) => {
  const q = bornes(p);
  const c = 1.70158 * 1.3;
  return 1 + (c + 1) * (q - 1) ** 3 + c * (q - 1) ** 2;
};

export type Mode = 'debout' | 'couche' | 'taille' | 'assis' | 'assis-jambes';
type Spot = { x: number; sol?: number; mode?: Mode; ligne?: number };
type Decor = { taille: number; spots: Record<string, Spot> };
const DECORS = vocabulaire.decors as unknown as Record<string, Decor>;

// Un personnage placé : son spot résolu, sa taille, sa couche.
export type Place = { qui: Qui; x: number; sol: number; taille: number; couche: 'derriere' | 'devant'; mode: Mode; ligne: number; sens: 1 | -1; perso: PersoPov };

// Le bord haut de la couette, au repos, là où se tient un personnage couché
// (decors.ts dessine la même courbe).
export const bordCouette = (x: number, t = 0, bouge = false) => {
  const bosses = bouge
    ? [
        { x: 420, a: 46 + 34 * Math.max(0, Math.sin(t * 7.3)) + 16 * Math.sin(t * 13.1) },
        { x: 660, a: 40 + 30 * Math.max(0, Math.sin(t * 6.1 + 1.3)) + 14 * Math.sin(t * 11.7 + 0.5) },
      ]
    : [
        { x: 420, a: 14 },
        { x: 660, a: 14 },
      ];
  let y = 1180 + Math.sin(x / 70) * 4;
  for (const b of bosses) y -= b.a * Math.exp(-((x - b.x) ** 2) / (2 * 95 ** 2));
  return y;
};

export const placer = (plan: PlanPov): Place[] =>
  (plan.persos ?? []).map((p) => {
    const decor = DECORS[plan.decor];
    const spot = typeof p.a === 'string' ? decor.spots[p.a] : undefined;
    if (typeof p.a === 'string' && !spot) throw new Error(`Spot inconnu dans le décor ${plan.decor} : ${p.a}`);
    const x = spot ? spot.x : Number(p.a);
    const k = p.taille ?? decor.taille ?? TAILLE;
    const g = GABARITS[p.qui];
    const mode: Mode = spot?.mode ?? 'debout';
    const ligne = spot?.ligne ?? 0;
    let sol = p.sol ?? spot?.sol ?? 1400;
    // la couette arrive juste sous la bouche ; le plan de travail ou la
    // table à la taille ; assis, le bas du corps repose sur la ligne
    if (mode === 'couche') sol = bordCouette(x) - 26 + (g.sol - g.bouche) * k;
    if (mode === 'taille') sol = ligne + (g.sol - g.hanches) * k;
    if (mode === 'assis' || mode === 'assis-jambes') sol = ligne + (g.sol - g.bas) * k;
    return {
      qui: p.qui,
      x,
      sol,
      taille: k,
      couche: mode === 'couche' || mode === 'taille' || mode === 'assis' ? 'derriere' : 'devant',
      mode,
      ligne,
      sens: p.sens === 'gauche' ? -1 : 1,
      perso: p,
    };
  });

// Position d'arrivée d'une marche : un spot du décor ou une abscisse.
const cibleX = (plan: PlanPov, vers: Geste['vers'], x: number) => {
  if (vers === undefined) return x;
  if (typeof vers === 'number') return vers;
  const spots = DECORS[plan.decor].spots;
  if (spots[vers]) return spots[vers].x;
  const n = Number(vers);
  if (!Number.isNaN(n)) return n;
  throw new Error(`Point d'arrivée inconnu : ${vers}`);
};

// Abscisse d'un personnage à l'instant t, marches et rapprochements compris.
// sansCalin : pour le partenaire d'un câlin (évite de tourner en rond).
export const abscisse = (plan: PlanPov, place: Place, t: number, places: Place[], sansCalin = false): number => {
  let x = place.x;
  const gestes = [...(place.perso.gestes ?? [])].sort((a, b) => a.de - b.de);
  for (const g of gestes) {
    if (t < g.de) break;
    const p = douce((t - g.de) / Math.max(0.01, g.a - g.de));
    if (g.geste === 'marche' || g.geste === 'court') {
      const x1 = cibleX(plan, g.vers, x);
      x = t >= g.a ? x1 : x + (x1 - x) * p;
    } else if ((g.geste === 'calin' || g.geste === 'bisou') && !sansCalin && g.avec && (place.mode === 'debout' || place.mode === 'assis-jambes')) {
      // assis à table, dans le canapé ou au lit, on se penche sans se déplacer
      const autre = places.find((q) => q.qui === g.avec);
      if (!autre) continue;
      const xa = abscisse(plan, autre, g.de, places, true);
      // les deux se rejoignent à mi-chemin si l'autre fait le même geste
      const lui = (autre.perso.gestes ?? []).some((h) => (h.geste === 'calin' || h.geste === 'bisou') && h.avec === place.qui && Math.abs(h.de - g.de) < 0.3);
      const ecart = (GABARITS[place.qui].l * place.taille + GABARITS[autre.qui].l * autre.taille) * (g.geste === 'calin' ? 0.27 : 0.3);
      const cote = Math.sign(xa - x) || 1;
      const but = lui ? (x + xa) / 2 - (cote * ecart) / 2 : xa - cote * ecart;
      const q = douce(bornes((t - g.de) / Math.max(0.01, Math.min(0.6, (g.a - g.de) * 0.35))));
      x = x + (but - x) * q;
    }
  }
  return x;
};

export type Tenu = { objet: NomObjet; main: 0 | 1; rot: number; echelle: number; devant: boolean; dx?: number; dy?: number };
export type EffetActif = { effet: NomEffet; depuis: number };

export type EtatPerso = {
  qui: Qui;
  mode: Mode;
  x: number;
  sol: number;
  taille: number;
  couche: 'derriere' | 'devant';
  premier: boolean;
  dx: number;
  dy: number;
  rot: number;
  sx: number;
  sy: number;
  echelle: number;
  sens: 1 | -1;
  opacite: number;
  options: OptionsMascotte & { devant?: [boolean, boolean]; jambesAngles?: [number, number]; rougit?: boolean };
  tenus: Tenu[];
  porte?: NomObjet;
  effets: EffetActif[];
  horsChamp: boolean;
};

const POSES: Record<string, OptionsMascotte> = {
  repos: { vue: 'face', bras: [10, 10], yeux: 'ouverts', bouche: 'sourire' },
  salut: { vue: 'face', bras: [10, 150], yeux: 'ouverts', regard: [3, 0], bouche: 'sourire' },
  joie: { vue: 'face', bras: [160, 160], yeux: 'heureux', bouche: 'rire' },
  surprise: { vue: 'face', bras: [65, 65], yeux: 'ouverts', regard: [0, -3], bouche: 'o' },
  profil: { vue: 'profil', bras: [16, 0], jambes: 'debout', yeux: 'ouverts', regard: [6, 0], bouche: 'sourire' },
  dos: { vue: 'dos', bras: [14, 14] },
  amoureux: { vue: 'face', bras: [6, 6], yeux: 'coeur', bouche: 'sourire', coeurs: true },
  boude: { vue: 'face', bras: [-4, -4], yeux: 'plats', regard: [-5, 0], bouche: 'triste', penche: -4 },
  dort: { vue: 'face', bras: [4, 4], yeux: 'fermes', bouche: 'plate', penche: 5 },
};

const regardVers = (cible: string | undefined, moi: number, places: Place[], plan: PlanPov, t: number): [number, number] => {
  switch (cible) {
    case 'gauche':
      return [-6, 0];
    case 'droite':
      return [6, 0];
    case 'haut':
      return [0, -6];
    case 'bas':
      return [0, 6];
    case 'rose':
    case 'violet': {
      const autre = places.find((q) => q.qui === cible);
      if (!autre) return [0, 0];
      return [Math.sign(abscisse(plan, autre, t, places) - moi) * 6, 0];
    }
    default:
      return [0, 0];
  }
};

// L'état d'un personnage à l'instant t (secondes depuis le début du plan).
export const etatPerso = (plan: PlanPov, place: Place, t: number, places: Place[]): EtatPerso => {
  const p = place.perso;
  const base = { ...(POSES[p.pose ?? 'repos'] ?? POSES.repos) };
  const x = abscisse(plan, place, t, places);
  const e: EtatPerso = {
    qui: place.qui,
    mode: place.mode,
    x,
    sol: place.sol,
    taille: place.taille,
    couche: place.couche,
    premier: !!p.premier,
    dx: 0,
    dy: 0,
    rot: 0,
    sx: 1,
    sy: 1,
    echelle: 1,
    sens: place.sens,
    opacite: 1,
    options: { ...base, saut: 0 },
    tenus: [],
    porte: p.porte,
    effets: [],
    horsChamp: false,
  };
  const phase = place.qui === 'rose' ? 0 : 1.3;
  // respiration et clignement, toujours (un personnage figé paraît mort)
  const souffle = Math.sin((PI2 * t) / 2.4 + phase);
  e.sy = 1 + 0.014 * souffle;
  e.sx = 1 - 0.008 * souffle;
  const gestes = [...(p.gestes ?? [])].sort((a, b) => a.de - b.de);

  // ce qui reste acquis après un geste : la vue (tourne), la position (marche)
  for (const g of gestes) {
    if (g.geste === 'tourne' && t >= g.de) {
      e.options.vue = g.vue ?? e.options.vue;
      if (g.sens) e.sens = g.sens === 'gauche' ? -1 : 1;
      if (e.options.vue === 'profil') e.options.jambes = 'debout';
    }
  }
  // avant d'entrer ou après être sorti : invisible
  const entree = gestes.find((g) => g.geste === 'apparait');
  if (entree && t < entree.de) e.opacite = 0;
  const sortieG = gestes.find((g) => g.geste === 'disparait');
  if (sortieG && t >= sortieG.a) e.opacite = 0;

  let visage = false;
  for (const g of gestes) {
    if (t < g.de || t >= g.a) continue;
    const u = t - g.de;
    const d = Math.max(0.01, g.a - g.de);
    const q = u / d;
    const o = e.options;
    switch (g.geste) {
      case 'marche':
      case 'court': {
        const vite = g.geste === 'court';
        const w = PI2 * (vite ? 3.2 : 2.2);
        const s = Math.sin(w * u);
        const x1 = cibleX(plan, g.vers, place.x);
        const x0 = abscisse(plan, place, g.de, places);
        if (x1 !== x0) e.sens = x1 > x0 ? 1 : -1;
        o.vue = 'profil';
        o.jambesAngles = [s * (vite ? 32 : 24), -s * (vite ? 32 : 24)];
        o.bras = [18 + s * (vite ? 30 : 18), 0];
        o.regard = [6, 0];
        e.dy -= Math.abs(Math.sin(w * u)) * (vite ? 22 : 10);
        e.horsChamp = x1 < 0 || x1 > 1080 || x0 < 0 || x0 > 1080;
        break;
      }
      case 'saute': {
        const n = Math.max(1, Math.min(3, g.fois ?? 1));
        const k = Math.min(n - 1, Math.floor(q * n));
        const r = q * n - k;
        if (r < 0.18) {
          e.sy *= 1 - 0.14 * Math.sin((Math.PI * r) / 0.18);
          e.sx *= 1 + 0.1 * Math.sin((Math.PI * r) / 0.18);
        } else if (r < 0.82) {
          o.saut = 90 * Math.sin((Math.PI * (r - 0.18)) / 0.64);
          e.sy *= 1.06;
          e.sx *= 0.96;
          o.bras = [70, 70];
        } else {
          e.sy *= 1 - 0.1 * Math.sin((Math.PI * (r - 0.82)) / 0.18);
          e.sx *= 1 + 0.08 * Math.sin((Math.PI * (r - 0.82)) / 0.18);
        }
        break;
      }
      case 'salue': {
        const i = g.main === 'gauche' ? 0 : 1;
        const b: [number, number] = [...(o.bras ?? [10, 10])] as [number, number];
        b[i] = 148 + 20 * Math.sin(PI2 * 2.6 * u);
        o.bras = b;
        o.vue = o.vue === 'dos' ? 'face' : o.vue;
        e.rot += (i ? 3 : -3) * Math.sin(PI2 * 1.3 * u);
        break;
      }
      case 'joie': {
        o.bras = [158 + 8 * Math.sin(PI2 * 3 * u), 158 + 8 * Math.sin(PI2 * 3 * u + 1)];
        o.yeux = 'heureux';
        o.bouche = 'rire';
        o.saut = 22 * Math.abs(Math.sin(PI2 * 1.6 * u));
        visage = true;
        break;
      }
      case 'danse': {
        const s = Math.sin(PI2 * 1.25 * u);
        e.rot += 9 * s;
        o.bras = [125 + 40 * s, 125 - 40 * s];
        o.jambesAngles = [8 * s, 8 * s];
        o.saut = 12 * Math.abs(Math.sin(PI2 * 2.5 * u));
        o.yeux = 'heureux';
        o.bouche = 'rire';
        visage = true;
        break;
      }
      case 'rit': {
        o.yeux = 'heureux';
        o.bouche = 'rire';
        o.bras = [34, 34];
        e.rot += 3 * Math.sin(PI2 * 5 * u);
        e.dy -= 6 * Math.abs(Math.sin(PI2 * 2.5 * u));
        visage = true;
        break;
      }
      case 'parle': {
        o.bouche = Math.sin(PI2 * 4.5 * u) > -0.2 ? 'o' : 'sourire';
        e.rot += 1.5 * Math.sin(PI2 * 1.1 * u);
        break;
      }
      case 'regarde':
        o.regard = regardVers(g.cible, x, places, plan, t);
        break;
      case 'visage':
        if (g.yeux) o.yeux = g.yeux as OptionsMascotte['yeux'];
        if (g.bouche) o.bouche = g.bouche as OptionsMascotte['bouche'];
        if (g.rougit !== undefined) e.options.rougit = g.rougit;
        visage = true;
        break;
      case 'tourne': {
        // un petit écrasement au moment de se tourner
        if (u < 0.16) {
          e.sx *= 1 - 0.12 * Math.sin((Math.PI * u) / 0.16);
        }
        break;
      }
      case 'calin':
      case 'bisou': {
        const autre = places.find((r) => r.qui === g.avec);
        const cote = autre ? Math.sign(abscisse(plan, autre, t, places) - x) || 1 : 1;
        const arrive = douce(bornes(u / Math.min(0.6, d * 0.35)));
        o.vue = 'face';
        if (g.geste === 'calin') {
          e.rot += cote * 9 * arrive;
          const i = cote > 0 ? 1 : 0;
          const b: [number, number] = [12, 12];
          b[i] = 12 + 66 * arrive;
          b[1 - i] = 12 + 20 * arrive;
          o.bras = b;
          const dv: [boolean, boolean] = [false, false];
          dv[i] = true;
          o.devant = dv;
          o.yeux = arrive > 0.6 ? 'heureux' : o.yeux;
          o.bouche = 'sourire';
          e.options.rougit = true;
          if (arrive > 0.6) e.effets.push({ effet: 'coeurs', depuis: g.de + 0.4 });
        } else {
          e.rot += cote * 13 * arrive;
          o.yeux = arrive > 0.5 ? 'fermes' : o.yeux;
          o.bouche = arrive > 0.5 ? 'bisou' : 'sourire';
          e.options.rougit = true;
        }
        visage = true;
        break;
      }
      case 'offre': {
        const pop = ressort(bornes(u / 0.45));
        o.vue = 'face';
        o.bras = [12, 12 + 108 * pop];
        o.devant = [false, true];
        o.yeux = 'heureux';
        o.bouche = 'sourire';
        e.options.rougit = true;
        e.rot -= 4 * pop;
        if (g.objet) e.tenus.push({ objet: g.objet, main: 1, rot: -12, echelle: 0.85 + 0.15 * pop + 0.03 * Math.sin(PI2 * 1.2 * u), devant: true });
        visage = true;
        break;
      }
      case 'tient': {
        const i = g.main === 'gauche' ? 0 : 1;
        const b: [number, number] = [...(o.bras ?? [10, 10])] as [number, number];
        b[i] = 38;
        o.bras = b;
        const dv: [boolean, boolean] = [...(o.devant ?? [false, false])] as [boolean, boolean];
        dv[i] = true;
        o.devant = dv;
        if (g.objet) e.tenus.push({ objet: g.objet, main: i as 0 | 1, rot: i ? 8 : -8, echelle: 0.8, devant: true });
        break;
      }
      case 'mange': {
        o.vue = 'face';
        o.bras = [12, -28];
        o.devant = [false, true];
        const croque = Math.sin(PI2 * 3.2 * u);
        o.bouche = croque > 0 ? 'o' : 'plate';
        o.yeux = 'heureux';
        if (g.objet) e.tenus.push({ objet: g.objet, main: 1, rot: -20, echelle: 0.7, devant: true, dx: -10, dy: -40 + 8 * croque });
        visage = true;
        break;
      }
      case 'vaisselle': {
        const s = Math.sin(PI2 * 2.2 * u);
        o.vue = 'face';
        o.bras = [-18 + 14 * s, -18 - 14 * s];
        o.devant = [true, true];
        o.regard = [0, 6];
        o.bouche = 'plate';
        e.tenus.push({ objet: 'assiette', main: 0, rot: 10 * s, echelle: 0.75, devant: true, dx: 30 });
        e.tenus.push({ objet: 'eponge', main: 1, rot: -10 * s, echelle: 0.6, devant: true, dx: -20, dy: -10 });
        visage = true;
        break;
      }
      case 'telephone': {
        o.vue = 'face';
        o.bras = [12, 34];
        o.devant = [false, true];
        o.regard = [0, 7];
        o.bouche = o.bouche === 'rire' ? 'rire' : 'plate';
        e.tenus.push({ objet: 'telephone', main: 1, rot: -8, echelle: 1, devant: true, dx: -20, dy: -30 });
        break;
      }
      case 'tremble':
        e.dx += 5 * Math.sin(PI2 * 17 * u);
        o.bras = [4, 4];
        break;
      case 'boude':
        Object.assign(o, POSES.boude);
        e.rot += -3 + 2 * Math.sin(PI2 * 0.5 * u);
        visage = true;
        break;
      case 'dort': {
        Object.assign(o, POSES.dort);
        const lent = Math.sin((PI2 * u) / 3.2);
        e.sy = 1 + 0.03 * lent;
        e.effets.push({ effet: 'zzz', depuis: g.de });
        visage = true;
        break;
      }
      case 'apparait': {
        const r = ressort(bornes(q));
        const depuis = g.depuis ?? 'pop';
        const h = GABARITS[place.qui].h * place.taille;
        if (depuis === 'bas') e.dy += (1 - r) * h * 0.9;
        else if (depuis === 'gauche') e.dx -= (1 - sortie(q)) * (x + 400);
        else if (depuis === 'droite') e.dx += (1 - sortie(q)) * (1480 - x);
        else e.echelle *= Math.max(0.001, r);
        e.horsChamp = q < 0.95;
        break;
      }
      case 'disparait': {
        const r = douce(q);
        const vers = g.vers ?? 'pop';
        const h = GABARITS[place.qui].h * place.taille;
        if (vers === 'bas') e.dy += r * h * 0.95;
        else if (vers === 'gauche') e.dx -= r * (x + 400);
        else if (vers === 'droite') e.dx += r * (1480 - x);
        else e.echelle *= Math.max(0.001, 1 - r);
        e.horsChamp = q > 0.05;
        break;
      }
      case 'effet':
        if (g.effet) e.effets.push({ effet: g.effet, depuis: g.de });
        break;
    }
  }
  // de profil, un objet tenu penche vers l'avant : il ne cache pas le visage
  if (e.options.vue === 'profil') {
    for (const x of e.tenus) {
      x.rot = 38;
      x.echelle *= 0.85;
      x.dx = (x.dx ?? 0) + 24;
      x.dy = (x.dy ?? 0) + 18;
    }
  }
  // assis sur un banc : les jambes pendent et se balancent doucement
  if (place.mode === 'assis-jambes' && !e.options.jambesAngles) {
    e.options.jambesAngles = [12 + 7 * Math.sin(PI2 * 0.8 * t + phase), -12 + 7 * Math.sin(PI2 * 0.8 * t + phase + 1.2)];
  }
  // clignement : 4 images toutes les 3,2 s, quand les yeux sont ouverts
  if (!visage && e.options.yeux === 'ouverts' && e.options.vue !== 'dos') {
    const c = (t + (place.qui === 'rose' ? 0.7 : 2.1)) % 3.2;
    if (c < 0.13) e.options.yeux = 'fermes';
  }
  if (e.options.coeurs) {
    e.options.coeurs = false;
    e.effets.push({ effet: 'coeurs', depuis: 0 });
  }
  return e;
};

// ── Caméra ─────────────────────────────────────────────────────────────

// cible : le personnage que la caméra suit (en gros plan, les autres peuvent sortir du cadre)
export type Camera = { zoom: number; x: number; y: number; ox: number; oy: number; cible?: Qui };

// Un point du personnage (ses yeux) dans le canevas, pour viser la caméra
// et placer les bulles.
export const tete = (e: EtatPerso): [number, number] => {
  const g = GABARITS[e.qui];
  const k = e.taille * e.echelle;
  return [e.x + e.dx + (g.yeux[0] - g.centre) * k * e.sens, e.sol + e.dy - (g.sol - g.yeux[1]) * k - (e.options.saut ?? 0) * k];
};
export const hautDeTete = (e: EtatPerso): [number, number] => {
  const g = GABARITS[e.qui];
  const k = e.taille * e.echelle;
  return [e.x + e.dx, e.sol + e.dy - (g.sol - g.haut) * k - (e.options.saut ?? 0) * k];
};

export const camera = (plan: PlanPov, t: number, etats: EtatPerso[]): Camera => {
  const cles = (plan.camera ?? []).filter((c): c is ClePov => !('secousse' in c)).sort((a, b) => a.a - b.a);
  const vise = (c: ClePov) => {
    const e = c.cible ? etats.find((x) => x.qui === c.cible) : undefined;
    if (e) {
      const [hx, hy] = tete(e);
      return { zoom: c.zoom ?? 1, x: c.x ?? hx, y: c.y ?? hy };
    }
    return { zoom: c.zoom ?? 1, x: c.x ?? 540, y: c.y ?? 960 };
  };
  let cam = { zoom: 1, x: 540, y: 960 };
  let avant = { a: 0, ...cam };
  let cible: Qui | undefined;
  for (const c of cles) {
    const v = vise(c);
    if (c.cible === 'rose' || c.cible === 'violet') cible = c.cible;
    if (t >= c.a) {
      avant = { a: c.a, ...v };
      cam = v;
      continue;
    }
    const p = douce((t - avant.a) / Math.max(0.01, c.a - avant.a));
    cam = { zoom: avant.zoom + (v.zoom - avant.zoom) * p, x: avant.x + (v.x - avant.x) * p, y: avant.y + (v.y - avant.y) * p };
    break;
  }
  // on ne montre jamais le bord du décor
  const z = Math.max(1, cam.zoom);
  const x = bornes(cam.x, 540 / z, 1080 - 540 / z);
  const y = bornes(cam.y, 960 / z, 1920 - 960 / z);
  let ox = 0;
  let oy = 0;
  for (const s of (plan.camera ?? []).filter((c): c is SecoussePov => 'secousse' in c)) {
    const u = t - s.a;
    if (u < 0 || u > 0.45) continue;
    const amorti = 1 - u / 0.45;
    ox += s.secousse * amorti * Math.sin(u * 70);
    oy += s.secousse * amorti * Math.cos(u * 53);
  }
  return { zoom: z, x, y, ox, oy, cible };
};

// Un point du décor vu par la caméra, en pixels du canevas.
export const aLEcran = (c: Camera, x: number, y: number): [number, number] => [(x - c.x) * c.zoom + 540 + c.ox, (y - c.y) * c.zoom + 960 + c.oy];
