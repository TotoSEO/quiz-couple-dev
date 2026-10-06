// Le minutage d'une animation : où commence chaque plan, quelles images
// vérifier, et les bruitages, déduits des gestes (un pas, un saut, un
// objet qui apparaît...) puis complétés par ceux que le scénario ajoute.
import { FPS } from '../charte/charte';
import type { EvenementSonore, NomSon } from '../charte/Son';
import type { Plan, Scene } from '../plan';
import type { RecettePov } from './scenario';
import { PAS_MOT } from './Textes';

const enImages = (s: number) => Math.round(s * FPS);

// Images de transition entre deux plans (fondu, glisse).
export const TRANSITION = 9;

export const planPov = (r: RecettePov): Plan => {
  const scenes: Scene[] = [];
  const sons: EvenementSonore[] = [];
  const verifs: number[] = [];
  let debut = 0;
  r.plans.forEach((p, i) => {
    const duree = enImages(p.duree);
    scenes.push({ type: 'plan', debut, duree, index: i });
    const a = (s: number) => debut + enImages(s);
    const son = (nom: NomSon, s: number, volume?: number) => {
      if (s >= 0 && s < p.duree) sons.push({ nom, a: a(s), ...(volume !== undefined ? { volume } : {}) });
    };
    if (i > 0 && p.transition === 'glisse') son('glisse', 0);
    for (const perso of p.persos ?? []) {
      for (const g of perso.gestes ?? []) {
        const d = g.a - g.de;
        switch (g.geste) {
          case 'marche':
          case 'court': {
            const pas = 1 / (2 * (g.geste === 'court' ? 3.2 : 2.2));
            for (let s = g.de + pas / 2; s < g.a; s += pas) son('pas', s, 0.2);
            break;
          }
          case 'saute': {
            const n = Math.max(1, Math.min(3, g.fois ?? 1));
            for (let k = 0; k < n; k++) son('saut', g.de + (k * d) / n + 0.18 * (d / n));
            break;
          }
          case 'apparait':
            son('pop', g.de);
            break;
          case 'disparait':
            son('glisse', g.de);
            break;
          case 'calin':
            son('coeur', g.de + Math.min(0.6, d * 0.35));
            break;
          case 'bisou':
            son('bisou', g.de + Math.min(0.6, d * 0.35));
            break;
          case 'offre':
            son('pop', g.de);
            break;
          case 'effet':
            if (g.effet === 'coeurs') son('coeur', g.de);
            if (g.effet === 'exclamation' || g.effet === 'question' || g.effet === 'points') son('bulle', g.de);
            break;
          case 'joie':
            son('joie', g.de, 0.25);
            break;
        }
      }
    }
    for (const o of p.objets ?? []) {
      if (o.de && o.de > 0) son(o.entree === 'glisse-gauche' || o.entree === 'glisse-droite' ? 'glisse' : 'pop', o.de);
      if (o.vol) son('glisse', o.vol.de);
    }
    for (const b of p.bulles ?? []) son('bulle', b.de);
    for (const tx of p.textes ?? []) son('apparition', tx.de, 0.18);
    if (p.couette === 'bouge') for (let s = 0.2; s < p.duree; s += 0.75) son('froissement', s, 0.3);
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
    verifs.push(debut + Math.min(duree - 1, Math.max(TRANSITION + 1, Math.round(duree * 0.45))), debut + duree - 2);
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
    musique: r.musique ?? 'ukulele-song.mp3',
    detail: {},
  };
};
