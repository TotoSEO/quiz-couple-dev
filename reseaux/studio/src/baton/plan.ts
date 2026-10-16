// Le minutage d'une aventure du bonhomme bâton : la durée à l'écran de
// chaque plan (les ralentis comprises), les images à vérifier, et les
// bruitages déduits des gestes (pas, saut, réception, lame, électricité,
// impacts, souffles d'air, grondement, déflagration...), des créatures, des
// effets, de la caméra, des ralentis et des transitions, puis ceux que le
// scénario ajoute. Tout s'écrit en secondes de récit et se convertit en
// images d'écran. Depuis le 16 octobre 2026 (Thomas : « plusieurs sound
// effects sont pas bons, genre quand il sort son épée »), les sons viennent
// de Mixkit (public/sons/bibliotheque.json) ; les synthétisés restent pour
// les ailes, le bourdon, le drone du ralenti, le flash et les pas de Kenney.
import { FPS } from '../charte/charte';
import type { EvenementAmbiance, EvenementSonore, NomSon } from '../charte/Son';
import type { Plan, Scene } from '../plan';
import type { PlanBaton, RecetteBaton } from './recette';
import { vocabulaire } from './recette';
import { plansDe } from './plans';
import { remap } from './temps';

const enImages = (s: number) => Math.round(s * FPS);
// La transition floue (« flou ») dure une seconde : le plan d'avant continue
// de jouer en se brouillant pendant que le nouveau se précise.
export const FLOU = FPS;

export const planBaton = (r: RecetteBaton): Plan => {
  const scenes: Scene[] = [];
  const sons: EvenementSonore[] = [];
  const ambiances: EvenementAmbiance[] = [];
  const verifs: number[] = [];
  let debut = 0;
  const plans = plansDe(r);
  plans.forEach((p, i) => {
    const rm = remap(p);
    const duree = enImages(rm.dureeReelle);
    scenes.push({ type: 'plan', debut, duree, index: i });
    // un son à un instant du récit
    const son = (nom: NomSon, tScene: number, volume?: number) => {
      if (tScene < 0 || tScene >= p.duree) return;
      sons.push({ nom, a: debut + enImages(rm.reel(tScene)), ...(volume !== undefined ? { volume } : {}) });
    };
    const flou = i > 0 && p.transition === 'flou';
    // la transition floue : un souffle de passage qui part juste avant la coupe
    if (flou) sons.push({ nom: 'passage', a: Math.max(0, debut - 4), volume: 0.16 });
    // le lit sonore du plan, baissé pendant un ralenti
    const lit = p.ambiance === 'aucune' ? undefined : p.ambiance ?? (vocabulaire.decors[p.decor] as { ambiance?: string }).ambiance;
    if (lit) {
      const coupures = [...(p.ralentis ?? [])].sort((a, b) => a.de - b.de);
      let de = 0;
      const pousse = (a: number, b: number, volume?: number) => {
        const fa = debut + enImages(rm.reel(a));
        const fb = debut + enImages(rm.reel(b));
        if (fb <= fa) return;
        const dernier = ambiances[ambiances.length - 1];
        if (dernier && dernier.nom === lit && dernier.a + dernier.duree === fa && dernier.volume === volume) dernier.duree += fb - fa;
        else ambiances.push({ nom: lit as NomSon, a: fa, duree: fb - fa, ...(volume !== undefined ? { volume } : {}) });
      };
      for (const c of coupures) {
        pousse(de, c.de);
        pousse(c.de, c.a, 0.18);
        de = c.a;
      }
      pousse(de, p.duree);
    }
    for (const perso of p.persos ?? []) {
      let arme = perso.arme ?? 'aucune';
      let tient = perso.tient ?? 'aucun';
      let vetement = perso.vetement ?? 'aucun';
      let charge = perso.charge ?? 0;
      let couche = !!perso.couche;
      // quelqu'un qui dort ronfle doucement, une fois par plan
      if (perso.expression === 'dort' && couche) son('ronfle', 0.3, 0.1);
      for (const e of [...(perso.etapes ?? [])].sort((a, b) => a.a - b.a)) {
        if (e.expression === 'baille') son('baille', e.a);
        if (e.pose === 'bisou' && perso.qui === 'heros') son('smack', e.a + 0.6);
        if (e.pose === 'equilibre') son('boing', e.a - 0.3, 0.12);
        if (e.pose === 'tombe') son('sursaut', e.a, 0.16);
        if (e.attache) son(e.attache.ancre === 'dos' ? 'coussin' : 'coussin', e.a, 0.16);
        if (e.couche === false && couche) {
          son('froissement', e.a, 0.14);
          couche = false;
        }
        if (e.arme && e.arme !== arme) {
          // la lame sort du fourreau (glissement métallique) puis siffle ; elle rentre en raclant
          if (e.arme === 'main') {
            son('epee-tire', e.a);
            son('lame', e.a + 0.1, 0.16);
          } else if (arme === 'main') son('epee-range', e.a);
          arme = e.arme;
        }
        if (e.tient && e.tient !== tient) {
          if (e.tient === 'bouquet') {
            son('pop', e.a);
            son('coeur', e.a + 0.35);
          }
          if (e.tient === 'couverture') son('froissement', e.a);
          if (e.tient === 'etoile') son('etincelle-magique', e.a);
          if (e.tient === 'parapluie-ferme') son('pop', e.a, 0.12);
          if (e.tient === 'parapluie') {
            son('air', e.a, 0.16);
            son('froissement', e.a + 0.05, 0.18);
          }
          if (e.tient === 'plateau') son('tinte', e.a);
          if (e.tient === 'poele') son('pose', e.a, 0.14);
          tient = e.tient;
        }
        if (e.vetement && e.vetement !== vetement) {
          if (e.vetement === 'cape') son('froissement', e.a, 0.2);
          vetement = e.vetement;
        }
        if (e.expression === 'charmeur') son('scintille', e.a + 0.1);
      }
      for (const a of perso.actions ?? []) {
        switch (a.type) {
          case 'court': {
            const allure = a.allure ?? 'course';
            const cadence = a.cadence ?? (allure === 'marche' ? 2.2 : allure === 'sprint' ? 4.2 : allure === 'furtif' ? 2.4 : 3.6);
            // le pas de loup s'entend à peine
            for (let s = a.de + 0.5 / cadence; s < a.a; s += 1 / cadence) son('pas', s, allure === 'sprint' ? 0.18 : allure === 'furtif' ? 0.07 : 0.14);
            break;
          }
          case 'saute':
            son('air', a.de);
            son('chute', a.a);
            break;
          case 'vaulte':
            son('air', a.de, 0.14);
            son('tape', a.de + 0.12);
            son('chute', a.a, 0.16);
            break;
          case 'roule':
            son('air', a.de, 0.12);
            son('chute', a.a, 0.14);
            break;
          case 'glisse':
            son('glisse', a.de);
            break;
          case 'bond':
            son('onde-choc', a.de);
            son('fusee', a.de + 0.02);
            break;
          case 'electrise': {
            son('montee-electrique', a.de);
            son('crepite', a.de + 0.15, 0.12);
            const fa = debut + enImages(rm.reel(a.de));
            const fb = debut + enImages(rm.reel(Math.min(p.duree, a.a + 0.3)));
            if (fb > fa) ambiances.push({ nom: 'bourdon', a: fa, duree: fb - fa, volume: 0.1 });
            break;
          }
          case 'charge':
            // la lame qui se charge : un bourdonnement électrique qui monte
            if (a.vers > charge + 0.1) son('charge-electrique', a.de, 0.12);
            charge = a.vers;
            break;
          default:
            break;
        }
      }
    }
    for (const c of p.creatures ?? []) {
      const nuage = c.qui === 'nuage';
      let pose = c.pose ?? 'vole';
      let depuis = 0;
      let bouge = false;
      const vols: [number, number][] = [];
      const ferme = (a: number) => {
        if (pose === 'vole' || pose === 'plonge') vols.push([depuis, a]);
      };
      for (const e of [...(c.etapes ?? [])].sort((a, b) => a.a - b.a)) {
        // la première fois qu'il bouge : un grognement, ou le vent qui tourne à l'orage
        if (!bouge && (e.x !== undefined || e.y !== undefined)) {
          son(nuage ? 'tempete' : 'dragon-grogne', e.a, 0.18);
          bouge = true;
        }
        if (!e.pose || e.pose === pose) continue;
        ferme(e.a);
        if (e.pose === 'plonge') son(nuage ? 'tempete' : 'meteore', e.a, 0.2);
        if (e.pose === 'rugit') {
          if (nuage) {
            son('tonnerre', e.a, 0.22);
            son('eclair-electrique', e.a + 0.05, 0.16);
          } else son('dragon-rugit', e.a);
        }
        if (e.pose === 'eclate') {
          if (nuage) {
            son('onde-choc', e.a, 0.24);
            son('scintille', e.a + 0.1, 0.2);
            son('tonnerre', e.a, 0.08);
          } else {
            son('deflagration', e.a);
            son('debris', e.a + 0.12, 0.2);
            son('tonnerre', e.a, 0.1);
          }
          son('flash', e.a, 0.14);
        }
        pose = e.pose;
        depuis = e.a;
      }
      ferme(p.duree);
      if (!nuage) for (const [de, a] of vols) for (let s = de, k = 0; s < a && k < 6; s += 0.45, k++) son('ailes', s);
      if (c.porteDe !== undefined) son('impact-profond', c.porteDe, 0.22);
    }
    for (const e of p.effets ?? []) {
      if (e.effet === 'fissure') {
        son('craquement', e.de);
        son('cailloux', e.de + 0.1, 0.16);
      }
      if (e.effet === 'flash') son('flash', e.de);
      if (e.effet === 'coeurs') son('coeur', e.de);
      if (e.effet === 'etincelles') son('crepite', e.de, 0.1);
      if (e.effet === 'eclair') {
        son('eclair-electrique', e.de, 0.2);
        son('tonnerre', e.de + 0.05, 0.14);
      }
      if (e.effet === 'etoile-ciel') son('scintille', e.de, 0.12);
      if (e.effet === 'crepe') {
        son('air', e.de, 0.12);
        son('splat', e.de + 0.68, 0.12);
      }
      if (e.effet === 'lumiere') son('tinte', e.de, 0.1);
      if (e.effet === 'notes') son('scintille', e.de, 0.1);
      if (e.effet === 'pluie') {
        const fa = debut + enImages(rm.reel(e.de));
        const fb = debut + enImages(rm.reel(Math.min(p.duree, e.a ?? p.duree)));
        if (fb > fa) ambiances.push({ nom: 'pluie', a: fa, duree: fb - fa, volume: 0.45 });
      }
    }
    // une secousse sans impact déclaré fait un impact sourd ; un zoom rapide, un souffle d'air
    for (const c of p.camera ?? []) {
      if ('secousse' in c) {
        if (c.secousse >= 20 && !(p.persos ?? []).some((q) => (q.actions ?? []).some((a) => a.type === 'bond' && Math.abs(a.de - c.a) < 0.2)) && !(p.creatures ?? []).some((q) => q.porteDe !== undefined && Math.abs(q.porteDe - c.a) < 0.2) && !(p.creatures ?? []).some((q) => (q.etapes ?? []).some((e) => e.pose === 'eclate' && Math.abs(e.a - c.a) < 0.2))) son('impact-profond', c.a, 0.16);
      }
    }
    const cles = (p.camera ?? []).filter((c) => !('secousse' in c)) as { a: number; zoom?: number }[];
    let z = 1;
    let ta = -10;
    for (const c of cles.sort((x, y) => x.a - y.a)) {
      const z2 = c.zoom ?? 1;
      if (Math.abs(z2 - z) > 0.3 && c.a - ta < 1 && ta >= 0) son('air', ta, 0.1);
      z = z2;
      ta = c.a;
    }
    for (const seg of p.ralentis ?? []) {
      son('ralenti', seg.de);
      son('coeur-ambiance', seg.de + 0.001, 0.3);
    }
    for (const s of p.sons ?? []) son(s.son as NomSon, s.a, s.volume);
    // contrôle : le plan installé (après la transition floue, s'il y en a une), puis sa fin
    verifs.push(debut + Math.min(duree - 1, Math.max(flou ? FLOU + 2 : 9, Math.round(duree * 0.45))), debut + duree - 2);
    debut += duree;
  });
  const uniques = [...new Set(verifs)].filter((v) => v >= 0 && v < debut).sort((x, y) => x - y);
  // la couverture : le cœur du ralenti de l'exploit ; sinon le plan où le
  // héros tire l'épée, sinon la fin du premier plan
  const iRal = plans.findIndex((p) => (p.ralentis ?? []).length);
  let couverture: number;
  if (iRal >= 0) {
    const seg = [...plans[iRal].ralentis!].sort((a, b) => a.de - b.de)[0];
    couverture = scenes[iRal].debut + enImages(remap(plans[iRal]).reel((seg.de + seg.a) / 2));
  } else {
    const iCouv = Math.max(0, plans.findIndex((p) => (p.persos ?? []).some((q) => (q.etapes ?? []).some((e) => e.arme === 'main'))));
    couverture = scenes[iCouv].debut + scenes[iCouv].duree - 2;
  }
  return {
    duree: debut,
    couverture,
    verifs: uniques,
    scenes,
    sons: sons.sort((x, y) => x.a - y.a),
    ambiances,
    detail: {},
  };
};
