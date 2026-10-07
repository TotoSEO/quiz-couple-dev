// Le minutage d'une animation : où commence chaque plan, quelles images
// vérifier, et les bruitages, déduits des gestes (un pas, un saut, un
// objet qui apparaît, un rire, des pleurs, un ronflement...) puis complétés
// par ceux que le scénario ajoute ; et le lit sonore de chaque plan (les
// oiseaux dehors, les vagues à la plage, le brouhaha du café), posé par le
// décor ou par le champ ambiance du plan.
import { FPS } from '../charte/charte';
import type { EvenementAmbiance, EvenementSonore, NomSon } from '../charte/Son';
import type { Plan, Scene } from '../plan';
import type { RecettePov } from './scenario';
import { ambianceDecor } from './temps';
import { PAS_MOT } from './Textes';
import vocabulaire from './vocabulaire.json';

const enImages = (s: number) => Math.round(s * FPS);

// Images de transition entre deux plans (fondu, glisse).
export const TRANSITION = 9;
// Transition « noir » : l'image s'éteint sur les dernières images du plan
// d'avant, reste noire trois images, puis se rallume.
export const NOIR_SORTIE = 10;
export const NOIR_ENTREE = 16;

// Les décors où l'on marche dans l'herbe ou le sable, ceux où une entrée par
// le bord passe une porte, et le son de cette porte.
const HERBE = new Set(['dehors', 'foret', 'plage']);
const PORTES: Record<string, NomSon> = { mur: 'porte', chambre: 'porte', salon: 'porte', cuisine: 'porte', table: 'porte', noel: 'porte', cafe: 'clochette', cinema: 'porte', voiture: 'portiere' };
const POSES = new Set(Object.entries(vocabulaire.objets).filter(([, o]) => 'pose' in o && o.pose).map(([k]) => k));

export const planPov = (r: RecettePov): Plan => {
  const scenes: Scene[] = [];
  const sons: EvenementSonore[] = [];
  const ambiances: EvenementAmbiance[] = [];
  const verifs: number[] = [];
  let debut = 0;
  r.plans.forEach((p, i) => {
    const duree = enImages(p.duree);
    scenes.push({ type: 'plan', debut, duree, index: i });
    const a = (s: number) => debut + enImages(s);
    const son = (nom: NomSon, s: number, volume?: number) => {
      if (s >= 0 && s < p.duree) sons.push({ nom, a: a(s), ...(volume !== undefined ? { volume } : {}) });
    };
    // le lit sonore : celui du plan, sinon celui du décor au moment du plan ;
    // deux plans qui se suivent sous le même lit n'en font qu'un (pas de
    // fondu au milieu)
    const lit = p.ambiance === 'aucune' ? undefined : p.ambiance ?? ambianceDecor(p.decor, p.moment);
    if (lit) {
      const dernier = ambiances[ambiances.length - 1];
      if (dernier && dernier.nom === lit && dernier.a + dernier.duree === debut) dernier.duree += duree;
      else ambiances.push({ nom: lit as NomSon, a: debut, duree });
    }
    const porte = PORTES[p.decor];
    if (i > 0 && p.transition === 'glisse') son('glisse', 0);
    for (const perso of p.persos ?? []) {
      const gestes = perso.gestes ?? [];
      const auTelephone = (s: number) => gestes.some((g) => g.geste === 'telephone' && g.de <= s && s < g.a);
      for (const g of gestes) {
        const d = g.a - g.de;
        switch (g.geste) {
          case 'marche':
          case 'court': {
            const pas = 1 / (2 * (g.geste === 'court' ? 3.2 : 2.2));
            const nom: NomSon = HERBE.has(p.decor) ? 'pas-herbe' : 'pas';
            for (let s = g.de + pas / 2; s < g.a; s += pas) son(nom, s, nom === 'pas' ? 0.2 : undefined);
            break;
          }
          case 'saute': {
            const n = Math.max(1, Math.min(3, g.fois ?? 1));
            for (let k = 0; k < n; k++) son('saut', g.de + (k * d) / n + 0.18 * (d / n));
            break;
          }
          case 'apparait':
            if (porte && (g.depuis === 'gauche' || g.depuis === 'droite')) son(porte, g.de);
            else son('pop', g.de);
            break;
          case 'disparait':
            if (porte && (g.vers === 'gauche' || g.vers === 'droite')) son(porte, Math.max(g.de, g.a - 0.15));
            else son('glisse', g.de);
            break;
          case 'calin':
            son('coeur', g.de + Math.min(0.6, d * 0.35));
            break;
          case 'bisou':
            // un vrai petit bisou (Mixkit), plus un cœur
            son('smack', g.de + Math.min(0.6, d * 0.35));
            break;
          case 'offre':
            son('pop', g.de);
            break;
          case 'effet':
            if (g.effet === 'coeurs') son('coeur', g.de);
            // un « ! » au-dessus de quelqu'un qui regarde son téléphone est une notification
            if (g.effet === 'exclamation') son(auTelephone(g.de) ? 'notification' : 'bulle', g.de);
            if (g.effet === 'question' || g.effet === 'points') son('bulle', g.de);
            break;
          case 'joie':
            son('joie', g.de, 0.25);
            break;
          case 'rit':
            son('rire', g.de);
            if (d > 2.4) son('rire', g.de + 2);
            break;
          case 'pleure':
            son('pleure', g.de + 0.1);
            if (d > 2.6) son('pleure', g.de + 2.3);
            break;
          case 'fache':
            son('grogne', g.de + 0.05);
            break;
          case 'boude':
            son('soupir', g.de + 0.1);
            break;
          case 'dort':
            for (let s = g.de + 0.8, k = 0; s < g.a - 0.4 && k < 4; s += 2.6, k++) son('ronfle', s);
            break;
          case 'mange':
            for (let s = g.de + 0.25, k = 0; s < g.a - 0.3 && k < 3; s += 0.9, k++) son('croque', s);
            if (d >= 2) son('miam', g.a - 0.5);
            break;
          case 'plonge':
            son('saut', g.de + 0.2 * d);
            son('froissement', g.a, 0.4);
            break;
        }
      }
    }
    for (const o of p.objets ?? []) {
      if (o.de && o.de > 0) {
        if (o.entree === 'glisse-gauche' || o.entree === 'glisse-droite') son('glisse', o.de);
        else if (o.entree === 'tombe') son('splat', o.de + 0.4);
        else if (o.objet === 'telephone') son('notification', o.de);
        else if (POSES.has(o.objet)) son('pose', o.de);
        else son('pop', o.de);
      }
      if (o.vol) son(o.objet === 'oreiller' ? 'coussin' : 'glisse', o.vol.de);
      // un réveil sonne tant qu'il est là (quatre sonneries au plus)
      if (o.objet === 'reveil') for (let s = (o.de ?? 0) + 0.1, k = 0; s < (o.a ?? p.duree) && k < 4; s += 0.6, k++) son('reveil', s);
    }
    for (const b of p.bulles ?? []) son('bulle', b.de);
    for (const tx of p.textes ?? []) son('apparition', tx.de, 0.18);
    if (p.couette === 'bouge') for (let s = (p.couetteDe ?? 0) + 0.2; s < p.duree; s += 0.75) son('froissement', s, 0.3);
    // un zoom rapide (plus de 30 % en moins d'une seconde) fait « whoosh »
    const cles = (p.camera ?? []).filter((c) => !('secousse' in c)) as { a: number; zoom?: number }[];
    let z = 1;
    let ta = 0;
    for (const c of cles.sort((x, y) => x.a - y.a)) {
      const z2 = c.zoom ?? 1;
      if (Math.abs(z2 - z) > 0.3 && c.a - ta < 1) son('zoom', ta);
      z = z2;
      ta = c.a;
    }
    for (const s of p.sons ?? []) son(s.son as NomSon, s.a, s.volume);
    // contrôle : le plan installé, puis la fin du plan, puis chaque bulle et
    // chaque message une fois écrit en entier
    verifs.push(debut + Math.min(duree - 1, Math.max(p.transition === 'noir' ? NOIR_ENTREE + 1 : TRANSITION + 1, Math.round(duree * 0.45))), debut + duree - 2);
    for (const b of p.bulles ?? []) verifs.push(a(Math.min(b.a - 0.05, b.de + 0.5)));
    for (const tx of p.textes ?? []) {
      const ecrit = tx.de + (tx.motAMot ? tx.texte.trim().split(/\s+/).length * PAS_MOT : 0) + 0.3;
      verifs.push(a(Math.min(tx.a !== undefined ? tx.a - 0.05 : p.duree - 0.05, ecrit)));
    }
    debut += duree;
  });
  const uniques = [...new Set(verifs)].filter((v) => v >= 0 && v < debut).sort((x, y) => x - y);
  return {
    duree: debut,
    couverture: uniques[0] ?? 0,
    verifs: uniques,
    scenes,
    sons: sons.sort((x, y) => x.a - y.a),
    ambiances,
    musique: r.musique,
    detail: {},
  };
};
