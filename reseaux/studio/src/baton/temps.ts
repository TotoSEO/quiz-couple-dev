// Le temps d'une aventure du bonhomme bâton : où est chacun, dans quelle
// pose, où regarde la caméra, à un instant du récit. Des fonctions pures,
// sans React : le studio les appelle à chaque image, les rémanences les
// rappellent sur des instants passés. Les ralentis vivent ici aussi : le
// plan s'écrit en secondes de récit, l'écran a ses propres secondes.
import type { ActionBaton, AttacheBaton, CleCameraBaton, CreatureBaton, Ease, NomCreature, NomPoseDragon, PersoBaton, PlanBaton, QuiBaton, SecousseBaton } from './recette';
import { vocabulaire } from './recette';
import { ancrage, type Apparence, cycleCourse, cycleFurtif, ECHELLE, genreDe, melange, type Pose, POSES, squelette } from './rig';

const PI2 = Math.PI * 2;
export const bornes = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const douce = (p: number) => {
  const q = bornes(p);
  return q < 0.5 ? 4 * q * q * q : 1 - (-2 * q + 2) ** 3 / 2;
};
const entree = (p: number) => bornes(p) ** 2;
const sortie = (p: number) => 1 - (1 - bornes(p)) ** 3;
const ressort = (p: number) => {
  const q = bornes(p);
  const c = 1.70158 * 1.2;
  return 1 + (c + 1) * (q - 1) ** 3 + c * (q - 1) ** 2;
};
export const COURBES: Record<Ease, (p: number) => number> = { lineaire: bornes, douce, entree, sortie, ressort };

// ── Le temps du récit et le temps de l'écran ───────────────────────────

export type Remap = { dureeReelle: number; scene: (tReel: number) => number; reel: (tScene: number) => number; ralenti: (tScene: number) => number };

// Un ralenti étire une tranche du récit : facteur 0,1 montre 0,2 s de
// récit en 2 s d'écran. Les segments sont triés et ne se chevauchent pas.
export const remap = (plan: PlanBaton): Remap => {
  const segs = [...(plan.ralentis ?? [])].filter((r) => r.a > r.de && r.facteur > 0 && r.facteur < 1).sort((a, b) => a.de - b.de);
  // bornes : (début récit, début réel, vitesse récit/réel) par morceau
  const morceaux: { s: number; r: number; v: number }[] = [];
  let s = 0;
  let r = 0;
  for (const seg of segs) {
    if (seg.de > s) {
      morceaux.push({ s, r, v: 1 });
      r += seg.de - s;
      s = seg.de;
    }
    morceaux.push({ s, r, v: seg.facteur });
    r += (seg.a - seg.de) / seg.facteur;
    s = seg.a;
  }
  morceaux.push({ s, r, v: 1 });
  const dureeReelle = r + (plan.duree - s);
  const scene = (t: number) => {
    let m = morceaux[0];
    for (const x of morceaux) if (x.r <= t) m = x;
    return m.s + (t - m.r) * m.v;
  };
  const reel = (t: number) => {
    let m = morceaux[0];
    for (const x of morceaux) if (x.s <= t) m = x;
    return m.r + (t - m.s) / m.v;
  };
  const ralenti = (t: number) => {
    const seg = segs.find((x) => t >= x.de && t < x.a);
    return seg ? 1 - seg.facteur : 0;
  };
  return { dureeReelle, scene, reel, ralenti };
};

// ── Les créatures ──────────────────────────────────────────────────────

export type EtatCreature = {
  qui: NomCreature;
  x: number;
  y: number;
  echelle: number;
  sens: 1 | -1;
  pose: NomPoseDragon;
  // paramètres fondus entre deux poses
  ailes: number; // amplitude du battement (0 replié, 1 plein vol)
  vitesseAiles: number;
  cou: number; // tête relevée (-1) ou plongée (1)
  gueule: number; // 0 fermée, 1 ouverte
  yeux: number; // lueur rouge, 0 à 1
  serres: number; // 0 repliées, 1 tendues
  // temps depuis le début de l'explosion, -1 sinon
  eclate: number;
  t: number;
};

type ParamsDragon = { ailes: number; vitesseAiles: number; cou: number; gueule: number; yeux: number; serres: number };
const DRAGON: Record<NomPoseDragon, ParamsDragon> = {
  vole: { ailes: 1, vitesseAiles: 2.2, cou: 0, gueule: 0.1, yeux: 0.5, serres: 0.3 },
  plonge: { ailes: 0.35, vitesseAiles: 1.2, cou: 1, gueule: 0.5, yeux: 0.8, serres: 1 },
  perche: { ailes: 0, vitesseAiles: 0.5, cou: -0.3, gueule: 0, yeux: 0.4, serres: 0 },
  rugit: { ailes: 0.3, vitesseAiles: 0.8, cou: -0.6, gueule: 1, yeux: 1, serres: 0 },
  eclate: { ailes: 0.3, vitesseAiles: 0, cou: -0.6, gueule: 1, yeux: 1, serres: 0 },
};
// Le nuage d'orage : ailes = l'amplitude de son flottement, cou = la force
// des éclairs sous lui, gueule = la colère du visage, yeux = la lueur des
// yeux, serres = la pluie qui tombe.
const NUAGE: Record<NomPoseDragon, ParamsDragon> = {
  vole: { ailes: 1, vitesseAiles: 0.5, cou: 0.15, gueule: 0.3, yeux: 0.4, serres: 0 },
  plonge: { ailes: 0.6, vitesseAiles: 0.9, cou: 0.5, gueule: 0.7, yeux: 0.8, serres: 0.3 },
  perche: { ailes: 0.5, vitesseAiles: 0.4, cou: 0.25, gueule: 0.5, yeux: 0.6, serres: 0.2 },
  rugit: { ailes: 0.7, vitesseAiles: 1.3, cou: 1, gueule: 1, yeux: 1, serres: 0.6 },
  eclate: { ailes: 0.7, vitesseAiles: 0, cou: 1, gueule: 1, yeux: 1, serres: 1 },
};
const PARAMS: Record<NomCreature, Record<NomPoseDragon, ParamsDragon>> = { dragon: DRAGON, nuage: NUAGE };

const derniere = <T extends { a: number }, K extends keyof T>(etapes: T[], k: K, t: number): { v: T[K]; depuis: number } | undefined => {
  let out: { v: T[K]; depuis: number } | undefined;
  for (const e of etapes) {
    if (e.a > t) break;
    if (e[k] !== undefined) out = { v: e[k], depuis: e.a };
  }
  return out;
};

const continu = <T extends { a: number; ease?: Ease }>(etapes: T[], k: keyof T, t: number, defaut: number, easeDefaut: Ease): number => {
  const def = etapes.filter((e) => typeof e[k] === 'number');
  if (!def.length) return defaut;
  let prev: T | undefined;
  let next: T | undefined;
  for (const e of def) {
    if (e.a <= t) prev = e;
    else {
      next = e;
      break;
    }
  }
  if (!prev) return defaut === undefined ? (next![k] as number) : t < next!.a ? defaut + ((next![k] as number) - defaut) * 0 : defaut;
  if (!next) return prev[k] as number;
  const u = (t - prev.a) / Math.max(0.001, next.a - prev.a);
  return (prev[k] as number) + ((next[k] as number) - (prev[k] as number)) * COURBES[next.ease ?? easeDefaut](u);
};

export const etatCreature = (c: CreatureBaton, t: number): EtatCreature => {
  const etapes = [...(c.etapes ?? [])].sort((a, b) => a.a - b.a);
  const x = continu(etapes, 'x', t, c.x, 'douce');
  const y = continu(etapes, 'y', t, c.y, 'douce');
  const echelle = continu(etapes, 'echelle', t, c.echelle ?? 1, 'douce');
  const sensE = derniere(etapes, 'sens', t);
  const sens = (sensE?.v ?? c.sens ?? 'droite') === 'gauche' ? -1 : 1;
  const poseE = derniere(etapes, 'pose', t);
  const pose = poseE?.v ?? c.pose ?? 'vole';
  // la pose d'avant, pour fondre les paramètres sur 0,25 s
  let avant: NomPoseDragon = c.pose ?? 'vole';
  for (const e of etapes) {
    if (e.a >= (poseE?.depuis ?? -1) || e.a > t) break;
    if (e.pose) avant = e.pose;
  }
  const u = poseE ? douce((t - poseE.depuis) / 0.25) : 1;
  const table = PARAMS[c.qui] ?? DRAGON;
  const pa = table[avant];
  const pb = table[pose];
  const mix = (k: keyof ParamsDragon) => pa[k] + (pb[k] - pa[k]) * u;
  return {
    qui: c.qui,
    x,
    y,
    echelle,
    sens,
    pose,
    ailes: mix('ailes'),
    vitesseAiles: mix('vitesseAiles'),
    cou: mix('cou'),
    gueule: mix('gueule'),
    yeux: mix('yeux'),
    serres: mix('serres'),
    eclate: pose === 'eclate' && poseE ? t - poseE.depuis : -1,
    t,
  };
};

// L'unité du dragon : 60 px à l'échelle 1. Le point des serres, où pend
// celle qu'il emporte.
export const UNITE_DRAGON = 60;
export const serres = (e: EtatCreature): [number, number] =>
  e.qui === 'nuage' ? [e.x, e.y + 1.4 * UNITE_DRAGON * e.echelle] : [e.x + 0.45 * UNITE_DRAGON * e.echelle * e.sens, e.y + 1.35 * UNITE_DRAGON * e.echelle];

// ── Les personnages ────────────────────────────────────────────────────

export type EtatBaton = {
  qui: QuiBaton;
  x: number;
  y: number;
  rot: number;
  k: number;
  sens: 1 | -1;
  apparence: Apparence;
  horsChamp: boolean;
  trainee?: { nombre: number; ecart: number; teinte: string };
  traineeLame: boolean;
  porte: boolean;
};

export type Contexte = {
  sol: number;
  creatures: EtatCreature[];
  plan: PlanBaton;
  // les personnages déjà calculés (ceux qui ne sont accrochés à personne), où
  // un personnage accroché trouve son porteur
  etats?: EtatBaton[];
};

// Le point où s'accroche un personnage porté, dans le repère (en R) de son
// porteur : sur le dos, derrière les hanches et un peu au-dessus ; à la main
// proche, juste sous elle (il la tient par le dos).
const ancre = (porteur: EtatBaton, att: AttacheBaton): [number, number] => {
  const sq = squelette(porteur.apparence.pose);
  const local: [number, number] = att.ancre === 'dos' ? [sq.hanche[0] - 0.95, sq.hanche[1] - 0.75] : [sq.mainD[0] + 0.15, sq.mainD[1] + 0.35];
  return pointEcran(porteur, local);
};

const actives = (actions: ActionBaton[], t: number, marge = 0) => actions.filter((a) => t >= a.de - marge && t < a.a + marge);
// le poids d'une action qui entre et sort en fondu
const poids = (a: { de: number; a: number }, t: number, fondu: number) => Math.min(1, bornes((t - a.de) / fondu), bornes((a.a - t) / fondu));

export const etatPerso = (p: PersoBaton, t: number, ctx: Contexte, graine: number): EtatBaton => {
  const etapes = [...(p.etapes ?? [])].sort((a, b) => a.a - b.a);
  const actions = p.actions ?? [];
  const genre = genreDe(p.qui, p.genre);
  const k = ECHELLE[genre] * continu(etapes, 'echelle', t, p.echelle ?? 1, 'douce');
  const sensE = derniere(etapes, 'sens', t);
  let sens: 1 | -1 = (sensE?.v ?? p.sens ?? 'droite') === 'gauche' ? -1 : 1;

  // la pose : un fondu depuis la précédente à chaque étape qui en écrit une
  let pose: Pose = { ...POSES[p.pose ?? 'debout'] };
  for (const e of etapes) {
    if (!e.pose || e.a > t) continue;
    pose = melange(pose, POSES[e.pose], douce((t - e.a) / (e.fondu ?? 0.3)));
  }
  const expressionE = derniere(etapes, 'expression', t);
  const expression = expressionE?.v ?? p.expression ?? 'neutre';
  const vue = derniere(etapes, 'vue', t)?.v ?? p.vue ?? 'trois-quarts';
  const arme = derniere(etapes, 'arme', t)?.v ?? p.arme ?? 'aucune';
  const tient = derniere(etapes, 'tient', t)?.v ?? p.tient ?? 'aucun';
  const vetement = derniere(etapes, 'vetement', t)?.v ?? p.vetement ?? 'aucun';
  const regard = derniere(etapes, 'regard', t)?.v ?? [0, 0];
  const sol = derniere(etapes, 'sol', t)?.v ?? p.sol ?? ctx.sol;

  // position
  let x = continu(etapes, 'x', t, p.x, 'lineaire');
  let haut = continu(etapes, 'haut', t, p.haut ?? 0, 'douce');
  let rot = continu(etapes, 'rot', t, 0, 'douce');
  let yAbsolu: number | undefined;
  let bouche = -1;
  let electrise = 0;
  let vent = 0.3;
  let charge = p.charge ?? 0.35;
  let trainee: EtatBaton['trainee'];
  let traineeLame = false;
  let dx = 0;
  let dy = 0;
  let horsChamp = false;
  let respire = true;

  // la charge et le vent, interpolés action par action
  for (const a of actions) {
    if (a.type === 'charge') {
      if (t >= a.a) charge = a.vers;
      else if (t >= a.de) charge = charge + (a.vers - charge) * douce((t - a.de) / Math.max(0.01, a.a - a.de));
    }
    if (a.type === 'vent') {
      if (t >= a.a) vent = a.force;
      else if (t >= a.de) vent = vent + (a.force - vent) * douce((t - a.de) / Math.max(0.01, a.a - a.de));
    }
  }

  for (const a of actives(actions, t, 0.35)) {
    const u = bornes((t - a.de) / Math.max(0.01, a.a - a.de));
    const dedans = t >= a.de && t < a.a;
    switch (a.type) {
      case 'court': {
        if (!dedans) break;
        const allure = a.allure ?? 'course';
        const furtif = allure === 'furtif';
        const intensite = allure === 'marche' ? 0 : allure === 'sprint' ? 1.4 : 1;
        const cadence = a.cadence ?? (allure === 'marche' ? 2.2 : allure === 'sprint' ? 4.2 : furtif ? 2.4 : 3.6);
        const cycle = furtif ? cycleFurtif(((t - a.de) * cadence) / 2) : cycleCourse(((t - a.de) * cadence) / 2, intensite);
        const w = poids(a, t, 0.12);
        const { rebond, ...membres } = cycle;
        // les bras restent ceux de la pose quand on porte quelqu'un ou un plateau
        if (a.bras === false) for (const cle of ['epauleD', 'coudeD', 'epauleG', 'coudeG', 'lame'] as const) delete membres[cle];
        pose = melange(pose, { ...pose, ...membres }, w);
        haut += rebond * k * w;
        respire = false;
        break;
      }
      case 'saute': {
        if (!dedans) break;
        const h = a.haut ?? 220;
        haut += h * Math.sin(Math.PI * u);
        const w = Math.min(1, bornes(u / 0.15), bornes((1 - u) / 0.12));
        pose = melange(pose, POSES[a.pose ?? 'vol-etire'], w);
        respire = false;
        break;
      }
      case 'vaulte': {
        if (!dedans) break;
        const h = a.haut ?? 120;
        haut += h * Math.sin(Math.PI * u);
        pose = melange(pose, POSES.vaulte, Math.min(1, bornes(u / 0.2), bornes((1 - u) / 0.2)));
        respire = false;
        break;
      }
      case 'roule': {
        if (!dedans) break;
        rot += 360 * sens * douce(u);
        pose = melange(pose, POSES.groupe, Math.min(1, bornes(u / 0.12), bornes((1 - u) / 0.12)));
        respire = false;
        break;
      }
      case 'glisse': {
        const w = poids(a, t, 0.12);
        if (w <= 0) break;
        pose = melange(pose, POSES.glisse, w);
        break;
      }
      case 'bond': {
        if (t < a.de) break;
        const fin = Math.min(1, u);
        const x0 = continu(etapes, 'x', a.de, p.x, 'lineaire');
        const poseDepart = pose;
        const y0 = sol - ancrage(poseDepart) * k - continu(etapes, 'haut', a.de, p.haut ?? 0, 'douce');
        const px = x0 + (a.versX - x0) * fin;
        const py = y0 + (a.versHaut - y0) * fin - (a.arc ?? 0) * Math.sin(Math.PI * fin);
        if (dedans) {
          x = px;
          yAbsolu = py;
          const vx = a.versX - x0;
          const vy = a.versHaut - y0;
          const phi = (Math.atan2(vy, vx) * 180) / Math.PI;
          sens = vx >= 0 ? 1 : -1;
          rot += douce(u / 0.12) * (phi + 90);
          pose = melange(pose, POSES.bond, bornes(u / 0.12));
          horsChamp = true;
          respire = false;
        }
        break;
      }
      case 'trainee':
        if (dedans) trainee = { nombre: a.nombre ?? 6, ecart: a.ecart ?? 0.028, teinte: '#9a9a9a' };
        break;
      case 'trainee-lame':
        if (dedans) traineeLame = true;
        break;
      case 'electrise': {
        const i = a.intensite ?? 1;
        if (dedans) electrise = i * bornes((t - a.de) / 0.15);
        else if (t >= a.a) electrise = i * (1 - bornes((t - a.a) / 0.3));
        break;
      }
      case 'tremble': {
        if (!dedans) break;
        const amp = a.amplitude ?? 2;
        dx += amp * Math.sin(PI2 * 23 * t);
        dy += amp * 0.6 * Math.cos(PI2 * 19 * t);
        break;
      }
      case 'souffle': {
        if (!dedans) break;
        const s = Math.sin(PI2 * 2.1 * (t - a.de));
        pose = { ...pose, torse: pose.torse + 7 * s, tete: pose.tete - 4 * s };
        bouche = 0.25 + 0.2 * s;
        respire = false;
        break;
      }
      case 'parle': {
        if (!dedans) break;
        const s = Math.sin(PI2 * 5.5 * (t - a.de)) * 0.5 + Math.sin(PI2 * 2.3 * (t - a.de)) * 0.3;
        bouche = bornes(0.45 + s);
        const g = Math.sin(PI2 * 1.7 * (t - a.de));
        pose = { ...pose, epauleD: pose.epauleD + 10 * g, coudeD: pose.coudeD - 14 * g, tete: pose.tete + 2 * g };
        break;
      }
      case 'gigote': {
        if (!dedans) break;
        const s = Math.sin(PI2 * 4.2 * (t - a.de));
        pose = { ...pose, hancheG: pose.hancheG + 22 * s, hancheD: pose.hancheD - 22 * s, genouG: pose.genouG + 15 * Math.abs(s), genouD: pose.genouD + 15 * Math.abs(s) };
        break;
      }
      default:
        break;
    }
  }

  // emportée par une créature : accrochée à ses serres
  let porte = false;
  const porteur = ctx.plan.creatures?.find((c) => c.porte === p.qui && t >= (c.porteDe ?? 0));
  if (porteur) {
    const e = ctx.creatures.find((c) => c.qui === porteur.qui);
    if (e) {
      const [sx, sy] = serres(e);
      const depuis = t - (porteur.porteDe ?? 0);
      const w = douce(depuis / 0.25);
      pose = melange(pose, POSES.portee, w);
      const s = squelette(pose);
      // les mains en haut, aux serres : les hanches en dessous
      const cible: [number, number] = [sx - s.mainD[0] * k * sens, sy - s.mainD[1] * k];
      x = x + (cible[0] - x) * w;
      yAbsolu = (sol - ancrage(pose) * k - haut) * (1 - w) + cible[1] * w;
      porte = true;
      horsChamp = true;
      respire = false;
    }
  }

  // couché (sur un lit) : le corps tourné de 90°, la tête vers +x, les hanches
  // posées sur le « sol » ; le passage couché ↔ assis se fond en 0,5 s
  const coucheE = derniere(etapes, 'couche', t);
  const couche = coucheE ? !!coucheE.v : !!p.couche;
  let wCouche = couche ? 1 : 0;
  if (coucheE) {
    let avant = !!p.couche;
    for (const e of etapes) {
      if (e.a >= coucheE.depuis) break;
      if (e.couche !== undefined) avant = !!e.couche;
    }
    if (avant !== couche) {
      const u = douce((t - coucheE.depuis) / 0.5);
      wCouche = couche ? u : 1 - u;
    }
  }
  if (wCouche > 0) {
    const yLibre = yAbsolu ?? sol - ancrage(pose) * k - haut;
    yAbsolu = yLibre + (sol - 0.55 * k - yLibre) * wCouche;
    rot += 90 * wCouche;
    respire = false;
  }

  // accroché à l'autre : sur son dos ou à sa main, la position est la sienne
  // (fondu de 0,3 s à l'accrochage et au lâcher)
  const attE = derniere(etapes, 'attache', t);
  const att = attE ? attE.v : p.attache ?? null;
  let avantAtt: AttacheBaton | null = p.attache ?? null;
  if (attE) for (const e of etapes) {
    if (e.a >= attE.depuis) break;
    if (e.attache !== undefined) avantAtt = e.attache;
  }
  const attVise = att ?? avantAtt;
  if (attVise && ctx.etats) {
    const porteur = ctx.etats.find((q) => q.qui === attVise.a);
    if (porteur) {
      const u = attE ? douce((t - attE.depuis) / 0.3) : 1;
      const w = att ? u : 1 - u;
      if (w > 0) {
        const [ax, ay] = ancre(porteur, attVise);
        const yLibre = yAbsolu ?? sol - ancrage(pose) * k - haut;
        x = x + (ax - x) * w;
        yAbsolu = yLibre + (ay - yLibre) * w;
        rot += (porteur.rot - rot) * w;
        if (w > 0.5) sens = attVise.ancre === 'main' ? ((-porteur.sens) as 1 | -1) : porteur.sens;
        respire = false;
      }
    }
  }

  // respiration : le buste et la tête bougent à peine
  if (respire) {
    const souffle = Math.sin((PI2 * t) / 2.6 + (p.qui === 'elle' ? 1.3 : 0));
    pose = { ...pose, torse: pose.torse + 0.9 * souffle, tete: pose.tete - 0.6 * souffle };
  }
  // clignement : 4 images toutes les 3,4 s
  const c = (t + (p.qui === 'elle' ? 1.1 : 2.3)) % 3.4;
  const cligne = c < 0.13;

  const y = yAbsolu ?? sol - ancrage(pose) * k - haut;
  // la vitesse, pour les pans du bandana : différence finie sur 40 ms
  const xAvant = continu(etapes, 'x', t - 0.04, p.x, 'lineaire');
  const vitesse = porte ? 0 : ((x - xAvant) / 0.04) * sens;
  const depuis = expressionE ? t - expressionE.depuis : t;
  const etincelle = expression === 'charmeur' ? bornes(depuis / 0.25) : 0;
  const apparence: Apparence = {
    qui: p.qui,
    genre,
    pose,
    expression,
    vue,
    regard: [regard[0] * sens, regard[1]],
    bouche,
    cligne,
    arme,
    charge: arme === 'main' ? charge : 0,
    electrise,
    vent,
    vitesse,
    tient,
    vetement,
    t,
    graine,
    depuis,
    etincelle,
  };
  if (arme === 'main' && (electrise > 0 || actives(actions, t).some((a) => a.type === 'trainee'))) traineeLame = true;
  if (trainee && electrise > 0) trainee.teinte = '#7fd6ff';
  return { qui: p.qui, x: x + dx, y: y + dy, rot, k, sens, apparence, horsChamp, trainee, traineeLame, porte };
};

// Un point du dessin (en R, repère du personnage) ramené à l'écran.
export const pointEcran = (e: EtatBaton, p: [number, number]): [number, number] => {
  const r = (e.rot * Math.PI) / 180;
  const lx = p[0] * e.k * e.sens;
  const ly = p[1] * e.k;
  return [e.x + lx * Math.cos(r) - ly * Math.sin(r), e.y + lx * Math.sin(r) + ly * Math.cos(r)];
};

// La tête et les pieds d'un personnage, à l'écran, pour la caméra.
export const pointsPerso = (e: EtatBaton) => {
  const s = squelette(e.apparence.pose);
  return { tete: pointEcran(e, s.tete), corps: pointEcran(e, [s.epaule[0] * 0.5, s.epaule[1] * 0.5]), pieds: pointEcran(e, [(s.chevilleG[0] + s.chevilleD[0]) / 2, (s.chevilleG[1] + s.chevilleD[1]) / 2 - 0.3]) };
};

// ── Caméra ─────────────────────────────────────────────────────────────

export type Camera = { zoom: number; x: number; y: number; ox: number; oy: number };

export const camera = (plan: PlanBaton, t: number, etats: EtatBaton[], creatures: EtatCreature[], sol = 1300): Camera => {
  const cles = (plan.camera ?? []).filter((c): c is CleCameraBaton => !('secousse' in c)).sort((a, b) => a.a - b.a);
  const vise = (c: CleCameraBaton) => {
    let x = c.x ?? 540;
    let y = c.y ?? 960;
    if (c.cible === 'heros' || c.cible === 'elle') {
      const e = etats.find((q) => q.qui === c.cible);
      if (e) {
        const pts = pointsPerso(e);
        const pt = pts[c.point ?? 'corps'];
        x = c.x ?? pt[0];
        y = c.y ?? pt[1];
      }
    } else if (c.cible) {
      const e = creatures.find((q) => q.qui === c.cible);
      if (e) {
        x = c.x ?? e.x;
        y = c.y ?? e.y;
      }
    }
    return { zoom: c.zoom ?? 1, x, y };
  };
  let cam = { zoom: 1, x: 540, y: 960 };
  let avant = { a: 0, ...cam };
  for (const c of cles) {
    const v = vise(c);
    if (t >= c.a) {
      avant = { a: c.a, ...v };
      cam = v;
      continue;
    }
    const u = COURBES[c.ease ?? 'douce']((t - avant.a) / Math.max(0.01, c.a - avant.a));
    cam = { zoom: avant.zoom + (v.zoom - avant.zoom) * u, x: avant.x + (v.x - avant.x) * u, y: avant.y + (v.y - avant.y) * u };
    break;
  }
  const z = Math.max(1, cam.zoom);
  const x = bornes(cam.x, 540 / z, 1080 - 540 / z);
  let y = bornes(cam.y, 960 / z, 1920 - 960 / z);
  // la signature est en bas de la zone utile : quand le sol est dans l'image
  // et que quelqu'un s'y tient, il reste au-dessus d'elle (à 1340 px d'écran
  // au plus), sinon les pieds et les fleurs passaient dessous (16 octobre
  // 2026). Personne au sol (le couple sur la plateforme de la tour, la
  // caméra qui regarde en l'air) : on laisse la caméra viser haut.
  const auSol = !etats.length || etats.some((e) => e.y > sol - 450);
  if (auSol && sol < y + 960 / z) y = Math.max(y, Math.min(1920 - 960 / z, sol - 380 / z));
  let ox = 0;
  let oy = 0;
  for (const s of (plan.camera ?? []).filter((c): c is SecousseBaton => 'secousse' in c)) {
    const u = t - s.a;
    if (u < 0 || u > 0.45) continue;
    const amorti = (1 - u / 0.45) ** 1.5;
    ox += s.secousse * amorti * Math.sin(u * 74);
    oy += s.secousse * amorti * Math.cos(u * 57);
  }
  return { zoom: z, x, y, ox, oy };
};

export const aLEcran = (c: Camera, x: number, y: number): [number, number] => [(x - c.x) * c.zoom + 540 + c.ox, (y - c.y) * c.zoom + 960 + c.oy];

// ── Une image du plan ──────────────────────────────────────────────────

export type ImageBaton = { etats: EtatBaton[]; creatures: EtatCreature[]; cam: Camera; sol: number; defilement: number; t: number };

export const solDuDecor = (plan: PlanBaton) => (vocabulaire.decors[plan.decor] as { sol: number }).sol;

export const calculer = (plan: PlanBaton, t: number, graine: number): ImageBaton => {
  const sol = solDuDecor(plan);
  const creatures = (plan.creatures ?? []).map((c) => etatCreature(c, t));
  const ctx: Contexte = { sol, creatures, plan };
  // les personnages libres d'abord, puis ceux qui s'accrochent à l'un d'eux
  const persos = plan.persos ?? [];
  const accroche = (p: PersoBaton) => !!p.attache || (p.etapes ?? []).some((e) => e.attache);
  const libres = persos.map((p, i) => (accroche(p) ? null : etatPerso(p, t, ctx, graine + i * 101)));
  const ctx2: Contexte = { ...ctx, etats: libres.filter((e): e is EtatBaton => !!e) };
  const etats = persos.map((p, i) => libres[i] ?? etatPerso(p, t, ctx2, graine + i * 101));
  const cam = camera(plan, t, etats, creatures, sol);
  return { etats, creatures, cam, sol, defilement: (plan.defile ?? 0) * t, t };
};
