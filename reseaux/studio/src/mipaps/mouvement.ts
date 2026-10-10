// Le mouvement d'un reel animé : l'état d'un personnage ou d'un objet à
// l'instant t (secondes depuis le début du plan), calculé depuis ses étapes.
// La position et la taille s'interpolent d'une écriture à la suivante ;
// l'expression, la pose, les bras changent d'un coup à l'étape qui les écrit.
// L'angle tient sa valeur jusqu'à l'étape qui précède celle qui l'écrit, et
// la rotation se fait dans ce dernier segment ; on ne se tourne jamais en
// courant : après une course, le perso finit sa course, marque un arrêt,
// puis se tourne d'un petit saut (Thomas, 8 octobre 2026 : il se redressait
// en courant et les bras basculaient en pleine rotation). Le cycle des
// pattes suit la distance parcourue, le corps rebondit à chaque pas, et une
// pose de course à l'arrêt se dessine debout.
import { EXPRESSIONS } from '../../../mipaps/charte/gribouillou.mjs';
import { BOITE } from './charte';
import type { RenduObjet, RenduPerso } from './dessin';
import type { Etape, ObjetAnime, PersoAnime } from './recette';

const lisse = (u: number) => u * u * (3 - 2 * u);

// La longueur d'une foulée, en pixels de la boîte, pour les poses qui marchent.
const FOULEE: Record<string, number> = { marche: 64, court: 84, sprint: 100, arrive: 84, pousse: 60, tire: 60 };
// Les poses de course : à l'arrêt, elles se dessinent debout.
const COURSES = new Set(['marche', 'court', 'sprint', 'arrive']);
// Se tourner après une course : le temps d'arrêt, puis le saut qui tourne.
const ARRET = 0.2;
const SAUT_MIN = 0.25;
const SAUT_MAX = 0.4;
const HAUT_SAUT = 30; // en pixels de la boîte, pour un perso de 250

type Continue = 'x' | 'y' | 'angle' | 'taille';

export const etatPerso = (p: PersoAnime, t: number): RenduPerso | null => {
  const etapes = [...p.etapes].sort((a, b) => a.a - b.a);
  if (!etapes.length || t < etapes[0].a) return null;
  // une propriété discrète : la dernière étape qui l'écrit avant t
  const discret = <K extends keyof Etape>(k: K): Etape[K] | undefined => {
    let v: Etape[K] | undefined;
    for (const e of etapes) {
      if (e.a > t) break;
      if (e[k] !== undefined) v = e[k];
    }
    return v;
  };
  // une propriété continue : entre la dernière valeur écrite avant t et la
  // prochaine ; linéaire pour un déplacement, douce pour une rotation
  const continu = (k: Continue, defaut: number, doux: boolean): number => {
    const def = etapes.filter((e) => e[k] !== undefined);
    if (!def.length) return defaut;
    let prev = def[0];
    let next: Etape | undefined;
    for (const e of def) {
      if (e.a <= t) prev = e;
      else {
        next = e;
        break;
      }
    }
    if (!next || next === prev) return prev[k] as number;
    const u = (t - prev.a) / (next.a - prev.a);
    return (prev[k] as number) + ((next[k] as number) - (prev[k] as number)) * (doux ? lisse(u) : u);
  };
  if (discret('visible') === false) return null;

  // le sens de la marche : le dernier déplacement horizontal commencé ;
  // la distance parcourue, pour le cycle des pattes
  const xs = etapes.filter((e) => e.x !== undefined);
  let sens = 0;
  let distance = 0;
  let enMouvement = false;
  for (let i = 1; i < xs.length; i++) {
    const a = xs[i - 1];
    const b = xs[i];
    if (a.a > t) break;
    const d = (b.x as number) - (a.x as number);
    if (d) sens = Math.sign(d);
    const u = b.a > a.a ? Math.min(1, (t - a.a) / (b.a - a.a)) : 1;
    distance += Math.abs(d) * u;
    if (d && t >= a.a && t < b.a) enMouvement = true;
  }
  // les segments où il se déplace, pour savoir s'il bouge entre deux
  // instants et quand une course se termine (plusieurs segments enchaînés)
  const segments = xs
    .slice(1)
    .map((b, i) => ({ de: xs[i].a, a: b.a, d: (b.x as number) - (xs[i].x as number) }))
    .filter((s) => s.d !== 0 && s.a > s.de);
  const bougeEntre = (d: number, f: number) => segments.some((s) => s.de < f && s.a > d);
  const finCourse = (t0: number) => {
    let fin = t0;
    for (let n = 0; n < segments.length; n++) {
      const s = segments.find((s) => s.de <= fin && s.a > fin);
      if (!s) break;
      fin = s.a;
    }
    return fin;
  };

  // L'angle : tenu jusqu'à l'étape qui précède celle qui l'écrit, puis la
  // rotation se fait dans ce dernier segment, en douceur. Si le perso bouge
  // encore dans ce segment, la rotation attend la fin de sa course ; s'il
  // vient de s'arrêter, il marque un temps d'arrêt ; dans les deux cas il se
  // tourne d'un petit saut (« saut » : l'avancement du saut, de 0 à 1).
  const rotation = (): { angle: number; saut?: number } => {
    const def = etapes.filter((e) => e.angle !== undefined);
    if (!def.length) return { angle: 0 };
    let angle = def[0].angle as number;
    for (let i = 1; i < def.length; i++) {
      const w = def[i];
      const avant = etapes[etapes.indexOf(w) - 1];
      const vers = w.angle as number;
      let s = avant.a;
      let e = w.a;
      let saute = false;
      if (bougeEntre(avant.a, w.a)) {
        s = finCourse(avant.a) + ARRET;
        e = s + SAUT_MIN;
        saute = true;
      } else if (bougeEntre(avant.a - 0.001, avant.a)) {
        const duree = w.a - avant.a;
        s = avant.a + Math.min(ARRET, Math.max(0, duree - SAUT_MIN));
        e = s + Math.min(SAUT_MAX, Math.max(SAUT_MIN, w.a - s));
        saute = true;
      }
      if (t < s) break;
      if (t >= e || e <= s) {
        angle = vers;
        continue;
      }
      const u = (t - s) / (e - s);
      return { angle: angle + (vers - angle) * lisse(u), saut: saute ? u : undefined };
    }
    return { angle };
  };

  const poseNom = discret('pose');
  const pose = !enMouvement && poseNom && COURSES.has(poseNom) ? 'debout' : poseNom;
  const foulee = enMouvement && poseNom && FOULEE[poseNom] ? (distance / FOULEE[poseNom]) % 1 : undefined;
  const rebond = foulee !== undefined ? 5 * Math.abs(Math.sin(foulee * Math.PI * 2)) : 0;
  const miroir = discret('miroir') ?? sens < 0;
  const taille = continu('taille', 250, true);
  const rot = rotation();
  const saut = rot.saut !== undefined ? HAUT_SAUT * Math.sin(Math.PI * rot.saut) * (taille / 250) : 0;
  const o = {
    perso: p.perso,
    marqueur: p.marqueur,
    expression: discret('expression') ?? 'content',
    pose,
    bras: discret('bras'),
    pattes: discret('pattes') ?? (rot.saut !== undefined ? 'repli' : undefined),
    angle: rot.angle,
    dos: discret('dos'),
    vers: discret('vers'),
    signes: discret('signes'),
    foulee,
  };
  return {
    type: 'perso',
    qui: p.perso,
    o,
    x: continu('x', BOITE.w / 2, false),
    y: continu('y', BOITE.sol, false) - rebond - saut,
    taille,
    miroir,
    opacite: 1,
  };
};

// Un objet : visible de « de » à « a », grossit en entrant avec un léger
// dépassement, flotte s'il le demande (les cœurs), se déplace par étapes.
export const etatObjet = (ob: ObjetAnime, t: number, i: number): RenduObjet | null => {
  const de = ob.de ?? 0;
  if (t < de || (ob.a !== undefined && t >= ob.a)) return null;
  let x = ob.x;
  let y = ob.y;
  let echelle = ob.echelle ?? 1;
  const etapes = [...(ob.etapes ?? [])].sort((a, b) => a.a - b.a);
  const continu = (k: 'x' | 'y' | 'echelle', defaut: number) => {
    const def = etapes.filter((e) => e[k] !== undefined);
    if (!def.length) return defaut;
    let prev = def[0];
    let next: (typeof def)[number] | undefined;
    for (const e of def) {
      if (e.a <= t) prev = e;
      else {
        next = e;
        break;
      }
    }
    if (!next || next === prev) return prev[k] as number;
    const u = (t - prev.a) / (next.a - prev.a);
    return (prev[k] as number) + ((next[k] as number) - (prev[k] as number)) * lisse(u);
  };
  if (etapes.length) {
    x = continu('x', x);
    y = continu('y', y);
    echelle = continu('echelle', echelle);
  }
  const u = Math.min(1, (t - de) / 0.3);
  const s = 1.4;
  const pop = 1 + (s + 1) * (u - 1) ** 3 + s * (u - 1) ** 2;
  let rot = 0;
  if (ob.flotte) {
    y += 6 * Math.sin((t * 2 * Math.PI) / 2.4 + i * 1.7);
    rot = 5 * Math.sin((t * 2 * Math.PI) / 3.1 + i * 0.9);
  }
  return { type: 'objet', nom: ob.objet, x, y, echelle: echelle * Math.max(0.01, pop), rot, opacite: 1 };
};

// Les yeux qui peuvent cligner : les points et les ronds, pas les cœurs,
// les croix ni les yeux déjà fermés.
const CLIGNE = new Set(['point', 'petit', 'grand', 'haut', 'bas', 'coin', 'brillant', 'colere', 'vide']);
export const peutCligner = (expression?: string) => {
  const ex = EXPRESSIONS[expression ?? 'content'];
  const yeux = ex ? (Array.isArray(ex.yeux) ? ex.yeux : [ex.yeux, ex.yeux]) : [];
  return yeux.every((y) => CLIGNE.has(y));
};

// Le dessin qui vit à peine (reel statique) : le corps respire, les yeux
// clignent, les cœurs flottent. f : l'image, i : le rang de l'élément.
export const vivant = <R extends RenduPerso | RenduObjet | { type: 'meuble' }>(r: R, f: number, i: number, fps: number): R => {
  const t = f / fps;
  if (r.type === 'perso') {
    const souffle = 1 + 0.012 * Math.sin((t * 2 * Math.PI) / 2.6 + i * 1.3);
    const cligne = (f + 41 * i) % 100 < 5 && peutCligner(r.o.expression);
    return { ...r, taille: r.taille * souffle, o: cligne ? { ...r.o, surcharge: { yeux: 'ferme_bas' } } : r.o };
  }
  if (r.type === 'objet' && r.nom === 'coeur') {
    return { ...r, y: r.y + 6 * Math.sin((t * 2 * Math.PI) / 2.4 + i * 1.7), rot: 5 * Math.sin((t * 2 * Math.PI) / 3.1 + i * 0.9) };
  }
  return r;
};
