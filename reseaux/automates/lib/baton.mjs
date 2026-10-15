// Contrôle d'un scénario du bonhomme bâton (gabarit « baton », le format
// « me in my dreams with u ») avant tout rendu : chaque nom vient du
// vocabulaire du studio (studio/src/baton/vocabulaire.json), chaque temps
// tient dans son plan, les ralentis ne se chevauchent pas, et chaque plan
// est décrit comme un découpage technique. Le contrôle de mise en page
// (titre dans la zone utile, visages) vient ensuite, au rendu.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ici = path.dirname(fileURLToPath(import.meta.url));
export const VOCABULAIRE_BATON = JSON.parse(fs.readFileSync(path.join(ici, '..', '..', 'studio', 'src', 'baton', 'vocabulaire.json'), 'utf8'));

const QUI = ['heros', 'elle'];
const CREATURES = Object.keys(VOCABULAIRE_BATON.creatures);
const POSES_DRAGON = ['vole', 'plonge', 'perche', 'rugit', 'eclate'];
const EASES = ['lineaire', 'douce', 'entree', 'sortie', 'ressort'];
const POINTS = ['tete', 'corps', 'pieds'];
const OBSTACLES = ['tronc', 'trou', 'rocher'];
const EMOJI = /\p{Extended_Pictographic}/u;
// Un plan se décrit comme à un dessinateur et à un cadreur : ce qu'on voit,
// les gestes, la caméra, les sons (Thomas, 15 octobre 2026 : « c'est ce
// genre de complexité de brief qu'il faut obtenir »).
const DESCRIPTION_MIN = 120;
const PLANS_MAX = 12;
// La durée réelle à l'écran, ralentis compris.
const DUREE_REELLE_MAX = 25;

const nombre = (v) => typeof v === 'number' && Number.isFinite(v);
const s1 = (v) => v.toFixed(1).replace('.', ',');

// La durée à l'écran d'un plan : le récit plus ce que les ralentis étirent.
export const dureeReelle = (p) => {
  const d = nombre(p.duree) ? p.duree : 0;
  return (p.ralentis ?? []).reduce((t, r) => (nombre(r.de) && nombre(r.a) && nombre(r.facteur) && r.facteur > 0 ? t + (r.a - r.de) * (1 / r.facteur - 1) : t), d);
};

export function controlerBaton(r) {
  const f = [];
  const V = VOCABULAIRE_BATON;
  if (typeof r.idee !== 'string' || r.idee.trim().length < 10) f.push("l'idée du scénario manque (champ idee)");
  if (r.titre !== undefined) {
    if (typeof r.titre !== 'string' || !r.titre.trim() || r.titre.length > 60) f.push('titre de 60 signes au plus');
    else if (EMOJI.test(r.titre)) f.push("titre : pas d'emoji à l'écran");
  }
  if (r.theme !== 'light') f.push('le bonhomme bâton se dessine sur papier blanc : theme light');
  const plans = Array.isArray(r.plans) ? r.plans : [];
  if (plans.length < 1 || plans.length > PLANS_MAX) f.push(`une aventure a de 1 à ${PLANS_MAX} plans`);
  const recit = plans.reduce((t, p) => t + (nombre(p.duree) ? p.duree : 0), 0);
  const ecran = plans.reduce((t, p) => t + dureeReelle(p), 0);
  if (ecran < V.duree.min || ecran > V.duree.max) f.push(`durée à l'écran de ${V.duree.min} à ${V.duree.max} s (ici ${s1(ecran)} s pour ${s1(recit)} s de récit)`);
  if (ecran > DUREE_REELLE_MAX) f.push(`durée à l'écran de ${DUREE_REELLE_MAX} s au plus`);
  let cameras = 0;
  plans.forEach((p, i) => {
    const ou = `plan ${i + 1}`;
    const d = p.duree;
    if (typeof p.description !== 'string' || p.description.trim().length < DESCRIPTION_MIN) f.push(`${ou} : la description est un découpage technique, cadrage, caméra, gestes, expressions, effets, sons (${DESCRIPTION_MIN} signes au moins)`);
    if (!nombre(d) || d < 0.4 || d > 8) f.push(`${ou} : durée de récit de 0,4 à 8 s`);
    const decor = V.decors[p.decor];
    if (!decor) {
      f.push(`${ou} : décor inconnu « ${p.decor} » (${Object.keys(V.decors).join(', ')})`);
      return;
    }
    if (p.defile !== undefined && (!nombre(p.defile) || p.defile < 0 || p.defile > 2000)) f.push(`${ou} : defile de 0 à 2000 px/s`);
    if (p.ambiance !== undefined && !V.ambiances.includes(p.ambiance)) f.push(`${ou} : ambiance inconnue « ${p.ambiance} » (${V.ambiances.join(', ')})`);
    if (p.transition !== undefined && !V.transitions.includes(p.transition)) f.push(`${ou} : transition inconnue « ${p.transition} »`);
    const dans = (t, quoi) => {
      if (!nombre(t)) return void f.push(`${ou}, ${quoi} : instant invalide`);
      if (t < 0 || t > (nombre(d) ? d : 0) + 0.01) f.push(`${ou}, ${quoi} : hors du plan (0 à ${d} s)`);
    };
    const dansDeA = (de, a, quoi) => {
      if (!nombre(de) || !nombre(a) || a <= de) return void f.push(`${ou}, ${quoi} : temps de/a invalides`);
      dans(de, quoi);
      if (a > (nombre(d) ? d : 0) + 0.5) f.push(`${ou}, ${quoi} : déborde du plan`);
    };
    for (const [k, o] of (p.obstacles ?? []).entries()) {
      if (!OBSTACLES.includes(o.type)) f.push(`${ou}, obstacle ${k + 1} : type inconnu « ${o.type} »`);
      if (!p.defile) f.push(`${ou}, obstacle ${k + 1} : un obstacle demande un travelling (defile)`);
      dans(o.a, `obstacle ${k + 1}`);
    }
    const ral = [...(p.ralentis ?? [])].sort((a, b) => a.de - b.de);
    ral.forEach((x, k) => {
      const quoi = `ralenti ${k + 1}`;
      dansDeA(x.de, x.a, quoi);
      if (!nombre(x.facteur) || x.facteur < 0.03 || x.facteur > 0.5) f.push(`${ou}, ${quoi} : facteur de 0,03 (très lent) à 0,5`);
      if (k > 0 && x.de < ral[k - 1].a) f.push(`${ou}, ${quoi} : chevauche le précédent`);
    });
    const persos = Array.isArray(p.persos) ? p.persos : [];
    const presents = persos.map((x) => x.qui);
    if (new Set(presents).size !== presents.length) f.push(`${ou} : un personnage en double`);
    const allure = (x, quoi) => {
      if (x.pose !== undefined && !V.poses[x.pose]) f.push(`${ou}, ${quoi} : pose inconnue « ${x.pose} »`);
      if (x.expression !== undefined && !V.expressions[x.expression]) f.push(`${ou}, ${quoi} : expression inconnue « ${x.expression} »`);
      if (x.vue !== undefined && !V.vues.includes(x.vue)) f.push(`${ou}, ${quoi} : vue inconnue « ${x.vue} »`);
      if (x.arme !== undefined && !V.armes.includes(x.arme)) f.push(`${ou}, ${quoi} : arme « dos », « main » ou « aucune »`);
      if (x.tient !== undefined && !['bouquet', 'aucun'].includes(x.tient)) f.push(`${ou}, ${quoi} : tient « bouquet » ou « aucun »`);
      if (x.sens !== undefined && !['gauche', 'droite'].includes(x.sens)) f.push(`${ou}, ${quoi} : sens « gauche » ou « droite »`);
      if (x.regard !== undefined && (!Array.isArray(x.regard) || x.regard.length !== 2 || !x.regard.every((v) => nombre(v) && v >= -1 && v <= 1))) f.push(`${ou}, ${quoi} : regard = [dx, dy] de -1 à 1`);
      if (x.echelle !== undefined && (!nombre(x.echelle) || x.echelle < 0.4 || x.echelle > 2.5)) f.push(`${ou}, ${quoi} : échelle de 0,4 à 2,5`);
      if (x.ease !== undefined && !EASES.includes(x.ease)) f.push(`${ou}, ${quoi} : courbe inconnue « ${x.ease} »`);
    };
    for (const x of persos) {
      const qui = `${x.qui}`;
      if (!QUI.includes(x.qui)) {
        f.push(`${ou} : personnage inconnu « ${x.qui} » (${QUI.join(', ')})`);
        continue;
      }
      if (!nombre(x.x) || x.x < -500 || x.x > 1600) f.push(`${ou}, ${qui} : position x hors de l'image`);
      if (x.sol !== undefined && (!nombre(x.sol) || x.sol < 100 || x.sol > 1900)) f.push(`${ou}, ${qui} : sol de 100 à 1900`);
      if (x.charge !== undefined && (!nombre(x.charge) || x.charge < 0 || x.charge > 1)) f.push(`${ou}, ${qui} : charge de 0 à 1`);
      allure(x, qui);
      for (const [k, e] of (x.etapes ?? []).entries()) {
        const quoi = `${qui}, étape ${k + 1}`;
        dans(e.a, quoi);
        allure(e, quoi);
        if (e.fondu !== undefined && (!nombre(e.fondu) || e.fondu < 0.05 || e.fondu > 3)) f.push(`${ou}, ${quoi} : fondu de 0,05 à 3 s`);
        if (e.x !== undefined && (!nombre(e.x) || e.x < -500 || e.x > 1600)) f.push(`${ou}, ${quoi} : x hors de l'image`);
        if (e.haut !== undefined && (!nombre(e.haut) || e.haut < -400 || e.haut > 1500)) f.push(`${ou}, ${quoi} : haut de -400 à 1500 px`);
        if (e.rot !== undefined && !nombre(e.rot)) f.push(`${ou}, ${quoi} : rot en degrés`);
        if (e.sol !== undefined && (!nombre(e.sol) || e.sol < 100 || e.sol > 1900)) f.push(`${ou}, ${quoi} : sol de 100 à 1900`);
      }
      for (const [k, a] of (x.actions ?? []).entries()) {
        const quoi = `${qui}, action ${k + 1} (${a.type})`;
        if (!V.actions.includes(a.type)) {
          f.push(`${ou}, ${qui} : action inconnue « ${a.type} » (${V.actions.join(', ')})`);
          continue;
        }
        dansDeA(a.de, a.a, quoi);
        if (a.type === 'court' && a.allure !== undefined && !['marche', 'course', 'sprint'].includes(a.allure)) f.push(`${ou}, ${quoi} : allure marche, course ou sprint`);
        if (a.type === 'court' && a.cadence !== undefined && (!nombre(a.cadence) || a.cadence < 1 || a.cadence > 8)) f.push(`${ou}, ${quoi} : cadence de 1 à 8 pas par seconde`);
        if ((a.type === 'saute' || a.type === 'vaulte') && a.haut !== undefined && (!nombre(a.haut) || a.haut < 0 || a.haut > 800)) f.push(`${ou}, ${quoi} : haut de 0 à 800 px`);
        if (a.type === 'saute' && a.pose !== undefined && !V.poses[a.pose]) f.push(`${ou}, ${quoi} : pose inconnue « ${a.pose} »`);
        if (a.type === 'bond' && (!nombre(a.versX) || !nombre(a.versHaut))) f.push(`${ou}, ${quoi} : versX et versHaut (position des hanches à l'arrivée, en pixels) manquent`);
        if (a.type === 'vent' && (!nombre(a.force) || a.force < 0 || a.force > 2.5)) f.push(`${ou}, ${quoi} : force de 0 à 2,5`);
        if (a.type === 'charge' && (!nombre(a.vers) || a.vers < 0 || a.vers > 1)) f.push(`${ou}, ${quoi} : vers de 0 à 1`);
        if (a.type === 'electrise' && a.intensite !== undefined && (!nombre(a.intensite) || a.intensite < 0 || a.intensite > 1)) f.push(`${ou}, ${quoi} : intensité de 0 à 1`);
        if (a.type === 'tremble' && a.amplitude !== undefined && (!nombre(a.amplitude) || a.amplitude < 0 || a.amplitude > 12)) f.push(`${ou}, ${quoi} : amplitude de 0 à 12 px`);
        if (a.type === 'trainee' && a.nombre !== undefined && (!Number.isInteger(a.nombre) || a.nombre < 1 || a.nombre > 10)) f.push(`${ou}, ${quoi} : de 1 à 10 rémanences`);
      }
    }
    for (const [k, c] of (p.creatures ?? []).entries()) {
      const quoi = `créature ${k + 1}`;
      if (!CREATURES.includes(c.qui)) {
        f.push(`${ou}, ${quoi} : créature inconnue « ${c.qui} » (${CREATURES.join(', ')})`);
        continue;
      }
      if (!nombre(c.x) || !nombre(c.y)) f.push(`${ou}, ${quoi} : position x, y manquante`);
      if (c.pose !== undefined && !POSES_DRAGON.includes(c.pose)) f.push(`${ou}, ${quoi} : pose inconnue « ${c.pose} » (${POSES_DRAGON.join(', ')})`);
      if (c.echelle !== undefined && (!nombre(c.echelle) || c.echelle < 0.3 || c.echelle > 3)) f.push(`${ou}, ${quoi} : échelle de 0,3 à 3`);
      if (c.porte !== undefined) {
        if (!presents.includes(c.porte)) f.push(`${ou}, ${quoi} : « porte » doit nommer un personnage présent dans le plan`);
        dans(c.porteDe ?? -1, `${quoi}, porteDe`);
      }
      for (const [j, e] of (c.etapes ?? []).entries()) {
        dans(e.a, `${quoi}, étape ${j + 1}`);
        if (e.pose !== undefined && !POSES_DRAGON.includes(e.pose)) f.push(`${ou}, ${quoi}, étape ${j + 1} : pose inconnue « ${e.pose} »`);
        if (e.ease !== undefined && !EASES.includes(e.ease)) f.push(`${ou}, ${quoi}, étape ${j + 1} : courbe inconnue « ${e.ease} »`);
      }
    }
    for (const [k, e] of (p.effets ?? []).entries()) {
      const quoi = `effet ${k + 1}`;
      if (!V.effets[e.effet]) {
        f.push(`${ou}, ${quoi} : effet inconnu « ${e.effet} » (${Object.keys(V.effets).join(', ')})`);
        continue;
      }
      dans(e.de, quoi);
      if (e.a !== undefined && (!nombre(e.a) || e.a <= e.de)) f.push(`${ou}, ${quoi} : « a » doit suivre « de »`);
      if (['lignes-vitesse', 'ombre', 'coeurs', 'etincelles'].includes(e.effet) && e.a === undefined) f.push(`${ou}, ${quoi} : cet effet a une fin (a)`);
      if (e.intensite !== undefined && (!nombre(e.intensite) || e.intensite < 0 || e.intensite > 3)) f.push(`${ou}, ${quoi} : intensité de 0 à 3`);
    }
    let cam = 0;
    let avant = { a: -1, zoom: 1, x: undefined, y: undefined, cible: undefined };
    for (const [k, c] of (p.camera ?? []).entries()) {
      const quoi = `caméra ${k + 1}`;
      if (!nombre(c.a)) {
        f.push(`${ou}, ${quoi} : instant manquant`);
        continue;
      }
      dans(c.a, quoi);
      if ('secousse' in c) {
        if (!nombre(c.secousse) || c.secousse < 0 || c.secousse > 60) f.push(`${ou}, ${quoi} : secousse de 0 à 60 px`);
        cam++;
        continue;
      }
      if (c.zoom !== undefined && (!nombre(c.zoom) || c.zoom < 1 || c.zoom > 8)) f.push(`${ou}, ${quoi} : zoom de 1 à 8`);
      if (c.cible !== undefined && ![...QUI, ...CREATURES].includes(c.cible)) f.push(`${ou}, ${quoi} : cible inconnue « ${c.cible} »`);
      if (c.point !== undefined && !POINTS.includes(c.point)) f.push(`${ou}, ${quoi} : point tete, corps ou pieds`);
      if (c.ease !== undefined && !EASES.includes(c.ease)) f.push(`${ou}, ${quoi} : courbe inconnue « ${c.ease} »`);
      const zoom = c.zoom ?? 1;
      if (avant.a >= 0 && (zoom !== avant.zoom || c.x !== avant.x || c.y !== avant.y || c.cible !== avant.cible)) cam++;
      avant = { a: c.a, zoom, x: c.x, y: c.y, cible: c.cible };
    }
    cameras += cam;
    for (const [k, s] of (p.sons ?? []).entries()) {
      if (!V.sons.includes(s.son)) f.push(`${ou}, son ${k + 1} : son inconnu « ${s.son} » (${V.sons.join(', ')})`);
      dans(s.a, `son ${k + 1}`);
      if (s.volume !== undefined && (!nombre(s.volume) || s.volume < 0 || s.volume > 1)) f.push(`${ou}, son ${k + 1} : volume de 0 à 1`);
    }
    // un plan de plus de 2,5 s où rien ne bouge est une image fixe
    if (nombre(d) && d > 2.5) {
      const vivant = persos.some((x) => (x.etapes ?? []).some((e) => e.a > 0.3) || (x.actions ?? []).some((a) => a.type !== 'vent')) || (p.creatures ?? []).some((c) => (c.etapes ?? []).length) || cam > 0;
      if (!vivant) f.push(`${ou} : ${s1(d)} s sans un geste, une étape ou un mouvement de caméra`);
    }
  });
  if (cameras < 2 && plans.length) f.push(`caméra : ${cameras} mouvement${cameras > 1 ? 's' : ''}, il en faut au moins 2 par reel (zoom, secousse, déplacement)`);
  return f;
}
