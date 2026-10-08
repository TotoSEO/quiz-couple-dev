// Le minutage des reels des mipaps : la durée, les images à vérifier, la
// couverture et les bruitages, déduits de la recette. Les sons partent des
// expressions et des poses au moment où elles changent, et des pas quand un
// personnage marche ; la recette peut en ajouter (sons du plan).
import { FPS } from '../charte/charte';
import type { EvenementSonore, NomSon } from '../charte/Son';
import type { Plan, Scene } from '../plan';
import { etatPerso } from './mouvement';
import type { PlanMipaps, RecetteMipapsReel, RecetteMipapsStatique } from './recette';

const s = (secondes: number) => Math.round(secondes * FPS);
// un mot toutes les 0,26 s quand un texte s'écrit mot à mot
export const PAS_MOT = 0.26;
const nbMots = (t: string) => t.trim().split(/\s+/).filter(Boolean).length;

const SON_EXPRESSION: Record<string, NomSon> = {
  rire: 'rire',
  mort_de_rire: 'rire',
  ricane: 'rire',
  pleure: 'pleure',
  sanglote: 'pleure',
  triste: 'pleure',
  coeur_brise: 'pleure',
  pleure_de_joie: 'pleure',
  bisou: 'smack',
  surpris: 'sursaut',
  choque: 'sursaut',
  panique: 'cri',
  peur: 'cri',
  furieux: 'grogne',
  colere: 'grogne',
  agace: 'grogne',
  dodo: 'ronfle',
  baille: 'baille',
  blase: 'soupir',
  fatigue: 'soupir',
  essouffle: 'soupir',
  deprime: 'soupir',
  miam: 'miam',
  gourmand: 'miam',
  joie: 'joie',
  triomphe: 'joie',
  amour: 'coeur',
  transi: 'coeur',
  calin: 'coeur',
  ko: 'aie',
  etourdi: 'aie',
  bravo: 'applaudit',
  idee: 'tinte',
};
const SON_POSE: Record<string, NomSon> = { saut: 'saut', tombe: 'splat', plante: 'tape', roule: 'boing', vole: 'glisse' };

// Les sons que le plan déclenche de lui-même, en images depuis le début du
// reel (t0 = première image du plan).
const sonsDuPlan = (p: PlanMipaps, t0: number, duree: number): EvenementSonore[] => {
  const sons: EvenementSonore[] = [];
  for (const perso of p.persos) {
    const etapes = [...perso.etapes].sort((a, b) => a.a - b.a);
    let expression: string | undefined;
    let pose: string | undefined;
    for (const e of etapes) {
      if (e.a > p.duree) break;
      if (e.expression && e.expression !== expression && SON_EXPRESSION[e.expression]) sons.push({ nom: SON_EXPRESSION[e.expression], a: t0 + s(e.a) });
      if (e.pose && e.pose !== pose && SON_POSE[e.pose]) sons.push({ nom: SON_POSE[e.pose], a: t0 + s(e.a) });
      if (e.expression) expression = e.expression;
      if (e.pose) pose = e.pose;
    }
    // les pas : à chaque demi-tour du cycle des pattes
    let phase = -1;
    for (let f = 0; f < duree; f++) {
      const etat = etatPerso(perso, f / FPS);
      const foulee = etat?.o.foulee;
      if (foulee === undefined) {
        phase = -1;
        continue;
      }
      const demi = Math.floor(foulee * 2);
      if (phase >= 0 && demi !== phase) sons.push({ nom: 'pas', a: t0 + f });
      phase = demi;
    }
  }
  for (const ob of p.objets ?? []) {
    if (ob.objet === 'coeur') sons.push({ nom: 'coeur', a: t0 + s(ob.de ?? 0) });
    else if (ob.objet !== 'pluie' && ob.objet !== 'nuage') sons.push({ nom: 'pop', a: t0 + s(ob.de ?? 0), volume: 0.1 });
  }
  for (const x of p.textes ?? []) sons.push({ nom: 'pop', a: t0 + s(x.de) });
  for (const sn of p.sons ?? []) sons.push({ nom: sn.nom as NomSon, a: t0 + s(sn.a) });
  return sons;
};

// Deux fois le même son à moins de six images : on garde le premier.
const epurer = (sons: EvenementSonore[]) => {
  const tri = [...sons].sort((a, b) => a.a - b.a);
  const garde: EvenementSonore[] = [];
  for (const so of tri) {
    const dernier = [...garde].reverse().find((g) => g.nom === so.nom);
    if (dernier && so.a - dernier.a < 6) continue;
    garde.push(so);
  }
  return garde;
};

export const planMipapsReel = (r: RecetteMipapsReel): Plan => {
  const scenes: Scene[] = [];
  const sons: EvenementSonore[] = [];
  const verifs: number[] = [];
  let t = 0;
  let couverture = -1;
  for (const p of r.plans) {
    const d = s(p.duree);
    scenes.push({ type: 'plan', debut: t, duree: d });
    for (const x of p.textes ?? []) {
      const de = t + s(x.de);
      const fin = t + s(x.a ?? p.duree);
      // le texte posé en entier (mot à mot : après le dernier mot), et lu
      const v = Math.min(fin - 1, de + s(0.5 + (x.motAMot ? nbMots(x.texte) * PAS_MOT : 0)));
      verifs.push(v);
      if (couverture < 0) couverture = v;
    }
    verifs.push(t + d - 1);
    sons.push(...sonsDuPlan(p, t, d));
    t += d;
  }
  return {
    duree: t,
    couverture: couverture >= 0 ? couverture : Math.min(t - 1, s(1)),
    verifs: [...new Set(verifs)].sort((a, b) => a - b),
    scenes,
    sons: epurer(sons),
    detail: {},
  };
};

export const planMipapsStatique = (r: RecetteMipapsStatique): Plan => {
  const duree = s(r.duree ?? 11);
  const texte = s(0.5);
  const sons: EvenementSonore[] = [{ nom: 'pop', a: texte }];
  const coeurs = (r.dessin.elements ?? []).some((e) => 'objet' in e && e.objet === 'coeur') || r.dessin.duo === 'calin';
  if (coeurs) sons.push({ nom: 'coeur', a: texte + s(0.8) });
  const pose = Math.min(duree - 2, texte + s(0.5 + nbMots(r.texte) * PAS_MOT));
  return {
    duree,
    couverture: pose,
    verifs: [pose, duree - 2],
    scenes: [{ type: 'plan', debut: 0, duree }],
    sons,
    detail: { texte },
  };
};
