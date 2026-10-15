// Le minutage d'une aventure du bonhomme bâton : la durée à l'écran de
// chaque plan (les ralentis comprises), les images à vérifier, et les
// bruitages déduits des gestes (pas, saut, réception, lame, zap, boum,
// whoosh, grondement, explosion...), des créatures, des effets, de la
// caméra et des ralentis, puis ceux que le scénario ajoute. Tout s'écrit en
// secondes de récit et se convertit en images d'écran.
import { FPS } from '../charte/charte';
import type { EvenementAmbiance, EvenementSonore, NomSon } from '../charte/Son';
import type { Plan, Scene } from '../plan';
import type { PlanBaton, RecetteBaton } from './recette';
import { vocabulaire } from './recette';
import { remap } from './temps';

const enImages = (s: number) => Math.round(s * FPS);

export const planBaton = (r: RecetteBaton): Plan => {
  const scenes: Scene[] = [];
  const sons: EvenementSonore[] = [];
  const ambiances: EvenementAmbiance[] = [];
  const verifs: number[] = [];
  let debut = 0;
  r.plans.forEach((p, i) => {
    const rm = remap(p);
    const duree = enImages(rm.dureeReelle);
    scenes.push({ type: 'plan', debut, duree, index: i });
    // un son à un instant du récit
    const son = (nom: NomSon, tScene: number, volume?: number) => {
      if (tScene < 0 || tScene >= p.duree) return;
      sons.push({ nom, a: debut + enImages(rm.reel(tScene)), ...(volume !== undefined ? { volume } : {}) });
    };
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
      for (const e of [...(perso.etapes ?? [])].sort((a, b) => a.a - b.a)) {
        if (e.arme && e.arme !== arme) {
          if (e.arme === 'main') son('shing', e.a);
          else if (arme === 'main') son('rentre', e.a);
          arme = e.arme;
        }
        if (e.tient && e.tient !== tient) {
          if (e.tient === 'bouquet') {
            son('pop', e.a);
            son('coeur', e.a + 0.35);
          }
          tient = e.tient;
        }
        if (e.expression === 'charmeur') son('tinte', e.a + 0.1);
      }
      for (const a of perso.actions ?? []) {
        switch (a.type) {
          case 'court': {
            const allure = a.allure ?? 'course';
            const cadence = a.cadence ?? (allure === 'marche' ? 2.2 : allure === 'sprint' ? 4.2 : 3.6);
            for (let s = a.de + 0.5 / cadence; s < a.a; s += 1 / cadence) son('pas', s, allure === 'sprint' ? 0.18 : 0.14);
            break;
          }
          case 'saute':
            son('saut', a.de);
            son('whoosh', a.de + 0.08, 0.14);
            son('atterrit', a.a);
            break;
          case 'vaulte':
            son('saut', a.de, 0.12);
            son('tape', a.de + 0.12);
            son('atterrit', a.a, 0.14);
            break;
          case 'roule':
            son('whoosh', a.de, 0.12);
            son('atterrit', a.a, 0.12);
            break;
          case 'glisse':
            son('glisse', a.de);
            break;
          case 'bond':
            son('boum', a.de);
            son('whoosh-long', a.de + 0.02);
            break;
          case 'electrise': {
            son('zap', a.de);
            const fa = debut + enImages(rm.reel(a.de));
            const fb = debut + enImages(rm.reel(Math.min(p.duree, a.a + 0.3)));
            if (fb > fa) ambiances.push({ nom: 'bourdon', a: fa, duree: fb - fa, volume: 0.1 });
            break;
          }
          default:
            break;
        }
      }
    }
    for (const c of p.creatures ?? []) {
      let pose = c.pose ?? 'vole';
      let depuis = 0;
      const vols: [number, number][] = [];
      const ferme = (a: number) => {
        if (pose === 'vole' || pose === 'plonge') vols.push([depuis, a]);
      };
      for (const e of [...(c.etapes ?? [])].sort((a, b) => a.a - b.a)) {
        if (!e.pose || e.pose === pose) continue;
        ferme(e.a);
        if (e.pose === 'plonge') son('glisse', e.a, 0.16);
        if (e.pose === 'rugit') son('grondement', e.a);
        if (e.pose === 'eclate') {
          son('explosion', e.a);
          son('eclats', e.a + 0.05);
          son('tonnerre', e.a, 0.12);
          son('flash', e.a, 0.14);
        }
        pose = e.pose;
        depuis = e.a;
      }
      ferme(p.duree);
      for (const [de, a] of vols) for (let s = de, k = 0; s < a && k < 4; s += 0.45, k++) son('ailes', s);
      if (c.porteDe !== undefined) son('boum', c.porteDe, 0.2);
    }
    for (const e of p.effets ?? []) {
      if (e.effet === 'fissure') son('craque', e.de);
      if (e.effet === 'flash') son('flash', e.de);
      if (e.effet === 'coeurs') son('coeur', e.de);
      if (e.effet === 'etincelles') son('zap', e.de, 0.08);
    }
    // une secousse sans impact déclaré fait un coup sourd ; un zoom rapide, un whoosh
    for (const c of p.camera ?? []) {
      if ('secousse' in c) {
        if (c.secousse >= 20 && !(p.persos ?? []).some((q) => (q.actions ?? []).some((a) => a.type === 'bond' && Math.abs(a.de - c.a) < 0.2)) && !(p.creatures ?? []).some((q) => q.porteDe !== undefined && Math.abs(q.porteDe - c.a) < 0.2) && !(p.creatures ?? []).some((q) => (q.etapes ?? []).some((e) => e.pose === 'eclate' && Math.abs(e.a - c.a) < 0.2))) son('coup', c.a, 0.14);
      }
    }
    const cles = (p.camera ?? []).filter((c) => !('secousse' in c)) as { a: number; zoom?: number }[];
    let z = 1;
    let ta = -10;
    for (const c of cles.sort((x, y) => x.a - y.a)) {
      const z2 = c.zoom ?? 1;
      if (Math.abs(z2 - z) > 0.3 && c.a - ta < 1 && ta >= 0) son('zoom', ta, 0.11);
      z = z2;
      ta = c.a;
    }
    for (const seg of p.ralentis ?? []) {
      son('ralenti', seg.de);
      son('battement', seg.de + 0.001, 0.26);
    }
    for (const s of p.sons ?? []) son(s.son as NomSon, s.a, s.volume);
    // contrôle : le plan installé, puis sa fin
    verifs.push(debut + Math.min(duree - 1, Math.max(9, Math.round(duree * 0.45))), debut + duree - 2);
    debut += duree;
  });
  const uniques = [...new Set(verifs)].filter((v) => v >= 0 && v < debut).sort((x, y) => x - y);
  // la couverture : le plan où le héros tire l'épée, sinon le premier
  const iCouv = Math.max(0, r.plans.findIndex((p) => (p.persos ?? []).some((q) => (q.etapes ?? []).some((e) => e.arme === 'main'))));
  const scCouv = scenes[iCouv];
  return {
    duree: debut,
    couverture: scCouv.debut + scCouv.duree - 2,
    verifs: uniques,
    scenes,
    sons: sons.sort((x, y) => x.a - y.a),
    ambiances,
    detail: {},
  };
};
