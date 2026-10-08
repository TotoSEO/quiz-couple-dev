// Contrôle d'un scénario d'animation (gabarit « pov ») avant tout rendu :
// chaque mot doit exister dans le vocabulaire du studio, chaque temps tenir
// dans son plan. Le contrôle de mise en page (cadre, textes, visages) vient
// ensuite, au rendu. Renvoie la liste des fautes.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ici = path.dirname(fileURLToPath(import.meta.url));
export const VOCABULAIRE = JSON.parse(fs.readFileSync(path.join(ici, '..', '..', 'studio', 'src', 'pov', 'vocabulaire.json'), 'utf8'));

const YEUX = ['ouverts', 'heureux', 'coeur', 'plats', 'fermes', 'clin', 'brillants'];
const SOURCILS = ['tristes', 'faches', 'hauts'];
const BOUCHES = ['sourire', 'o', 'rire', 'plate', 'triste', 'bisou', 'chat', 'grogne'];
const QUI = ['rose', 'violet'];
const EMOJI = /\p{Extended_Pictographic}/u;

// Richesse d'une animation (Thomas, 7 octobre 2026 : des briefs très
// détaillés, avec les zooms, les expressions et les mouvements). Le contrôle
// refuse un scénario où il ne se passe rien : chaque plan est couvert par des
// événements (un geste anime VIE_GESTE secondes puis devient une pose tenue ;
// un effet, une bulle, un mouvement de caméra couvrent leur durée), le
// premier part tout de suite, chaque personnage change de visage
// régulièrement, et la caméra bouge au moins deux fois par reel.
const TENUS = ['tient', 'telephone'];
const EXPRESSIFS = ['visage', 'regarde', 'rit', 'boude', 'pleure', 'fache', 'mignon', 'joie', 'dort', 'bisou', 'parle', 'mange', 'offre'];
const VIE_GESTE = 2.5;
const TROU_MAX = 1.5;
const DEBUT_MAX = 0.6;
const DEBUT_MAX_PREMIER_PLAN = 0.5;
const CAMERA_MIN = 2;
const PLAN_LONG = 4;
const SECONDES_PAR_EXPRESSION = 6;
const EXPRESSIONS_MIN = 2;
const DESCRIPTION_MIN = 100;

const nombre = (v) => typeof v === 'number' && Number.isFinite(v);
const s = (v) => v.toFixed(1).replace('.', ',');

// Les trous d'un plan : la part de [0, duree] qu'aucun événement ne couvre.
function trous(intervalles, duree) {
  const tri = intervalles.filter(([de, a]) => a > de).sort((x, y) => x[0] - y[0]);
  const out = [];
  let fin = 0;
  for (const [de, a] of tri) {
    if (de > fin) out.push([fin, de]);
    fin = Math.max(fin, a);
  }
  if (fin < duree) out.push([fin, duree]);
  return out;
}

function controlerRichesse(plans, f) {
  let cameras = 0;
  const presence = {};
  const expressions = {};
  plans.forEach((p, i) => {
    const ou = `plan ${i + 1}`;
    const d = nombre(p.duree) ? p.duree : 0;
    if (!d) return;
    const couverts = [];
    const evenement = (de, a) => {
      if (!nombre(de)) return;
      couverts.push([Math.max(0, de), Math.min(d, nombre(a) ? a : de + VIE_GESTE)]);
    };
    for (const x of p.persos ?? []) {
      if (!QUI.includes(x.qui)) continue;
      presence[x.qui] = (presence[x.qui] || 0) + d;
      for (const g of x.gestes ?? []) {
        if (TENUS.includes(g.geste) || !nombre(g.de)) continue;
        evenement(g.de, Math.min(nombre(g.a) ? g.a : g.de + VIE_GESTE, g.de + VIE_GESTE));
        if (EXPRESSIFS.includes(g.geste)) expressions[x.qui] = (expressions[x.qui] || 0) + 1;
      }
    }
    for (const e of p.effets ?? []) evenement(e.de, e.a);
    for (const b of p.bulles ?? []) evenement(b.de, b.a);
    for (const o of p.objets ?? []) evenement(o.de ?? 0, (o.de ?? 0) + 1);
    // la caméra : une image clé est un mouvement quand elle change le cadrage
    // depuis la précédente (zoom, x, y) ou secoue l'image
    let avant = { a: 0, zoom: 1, x: undefined, y: undefined };
    let camPlan = 0;
    for (const c of p.camera ?? []) {
      if (!nombre(c.a)) continue;
      if ('secousse' in c) {
        camPlan++;
        evenement(c.a, c.a + 0.5);
      } else {
        const zoom = c.zoom ?? avant.zoom;
        if (c.a > avant.a && (zoom !== avant.zoom || c.x !== avant.x || c.y !== avant.y)) {
          camPlan++;
          evenement(avant.a, c.a);
        }
        avant = { a: c.a, zoom, x: c.x, y: c.y };
      }
    }
    cameras += camPlan;
    if (d > PLAN_LONG && !camPlan) f.push(`${ou} : un plan de plus de ${PLAN_LONG} s a un mouvement de caméra (zoom, secousse ou déplacement)`);
    for (const [de, a] of trous(couverts, d)) {
      const debutMax = i === 0 ? DEBUT_MAX_PREMIER_PLAN : DEBUT_MAX;
      if (de === 0 && a > debutMax) f.push(`${ou} : le premier geste part à ${s(a)} s, il doit partir avant ${s(debutMax)} s${i === 0 ? " (l'accroche est dans la première image)" : ''}`);
      else if (de > 0 && a - de > TROU_MAX) f.push(`${ou} : rien ne se passe de ${s(de)} à ${s(a)} s : ajoute un geste, un changement de visage, un effet, une bulle ou un mouvement de caméra`);
    }
  });
  if (cameras < CAMERA_MIN) f.push(`caméra : ${cameras} mouvement${cameras > 1 ? 's' : ''}, il en faut au moins ${CAMERA_MIN} par reel (zoom, secousse ou déplacement)`);
  for (const [qui, duree] of Object.entries(presence)) {
    const requis = Math.max(EXPRESSIONS_MIN, Math.ceil(duree / SECONDES_PAR_EXPRESSION));
    const n = expressions[qui] || 0;
    if (n < requis) f.push(`${qui} : ${n} changement${n > 1 ? 's' : ''} d'expression pour ${s(duree)} s à l'écran, il en faut au moins ${requis} (gestes visage, regarde, rit, boude, mignon, parle...)`);
  }
}

export function controlerPov(r) {
  const f = [];
  const V = VOCABULAIRE;
  if (typeof r.idee !== 'string' || r.idee.trim().length < 10) f.push("l'idée du scénario manque (champ idee)");
  if (r.titre !== undefined && (typeof r.titre !== 'string' || r.titre.length > 90)) f.push('titre de 90 signes au plus');
  if (!['light', 'dark'].includes(r.theme)) f.push(`thème d'animation inconnu : ${r.theme}`);
  const plans = Array.isArray(r.plans) ? r.plans : [];
  if (plans.length < 1 || plans.length > 8) f.push('une animation a de 1 à 8 plans');
  const total = plans.reduce((s, p) => s + (nombre(p.duree) ? p.duree : 0), 0);
  // un reel de moins de 10 s passe trop vite pour être compris (Thomas)
  if (total < 10 || total > 20) f.push(`durée totale de 10 à 20 s (ici ${total.toFixed(1)} s)`);
  const texte = (t, ou, max) => {
    if (typeof t !== 'string' || !t.trim()) return f.push(`${ou} : texte vide`);
    if (t.length > max) f.push(`${ou} : ${max} signes au plus`);
    if (EMOJI.test(t)) f.push(`${ou} : pas d'emoji à l'écran (la police ne les dessine pas)`);
  };
  if (r.titre) texte(r.titre, 'titre', 90);
  plans.forEach((p, i) => {
    const ou = `plan ${i + 1}`;
    const d = p.duree;
    if (typeof p.description !== 'string' || p.description.trim().length < DESCRIPTION_MIN) f.push(`${ou} : la description doit raconter ce qu'on voit comme à un dessinateur, décor, personnages, gestes, expressions, caméra, textes (${DESCRIPTION_MIN} signes au moins)`);
    if (!nombre(d) || d < 0.8 || d > 14) f.push(`${ou} : durée de 0,8 à 14 s`);
    const decor = V.decors[p.decor];
    if (!decor) {
      f.push(`${ou} : décor inconnu « ${p.decor} »`);
      return;
    }
    if (p.moment !== undefined && !V.moments.includes(p.moment)) f.push(`${ou} : moment inconnu « ${p.moment} »`);
    if (p.ambiance !== undefined && p.ambiance !== 'aucune' && !V.ambiances.includes(p.ambiance)) f.push(`${ou} : ambiance inconnue « ${p.ambiance} » (aucune, ${V.ambiances.join(', ')})`);
    if (p.transition !== undefined && !V.transitions.includes(p.transition)) f.push(`${ou} : transition inconnue « ${p.transition} »`);
    if (p.couette !== undefined && (!['calme', 'bouge'].includes(p.couette) || p.decor !== 'chambre')) f.push(`${ou} : couette « calme » ou « bouge », dans la chambre seulement`);
    if (p.couetteDe !== undefined && (p.couette !== 'bouge' || !nombre(p.couetteDe) || p.couetteDe < 0 || p.couetteDe >= d)) f.push(`${ou} : couetteDe demande une couette qui bouge, et un instant dans le plan`);
    if (p.transition === 'noir' && i === 0) f.push(`${ou} : le premier plan ne commence pas dans le noir (l'accroche est dans la première image)`);
    if (p.legende !== undefined) texte(p.legende, `${ou}, légende`, 20);
    const dansLePlan = (de, a, quoi) => {
      if (!nombre(de) || !nombre(a) || a <= de) return f.push(`${ou}, ${quoi} : temps de/a invalides`);
      if (de < -1.5 || a > d + 0.01) f.push(`${ou}, ${quoi} : en dehors du plan (0 à ${d} s)`);
    };
    const persos = Array.isArray(p.persos) ? p.persos : [];
    if (persos.length > 2) f.push(`${ou} : deux personnages au plus`);
    const presents = persos.map((x) => x.qui);
    if (new Set(presents).size !== presents.length) f.push(`${ou} : un personnage en double`);
    const spotOuX = (a, quoi, horsChamp = false) => {
      if (typeof a === 'string') {
        if (!decor.spots[a]) f.push(`${ou}, ${quoi} : spot « ${a} » absent du décor ${p.decor} (${Object.keys(decor.spots).join(', ')})`);
      } else if (!nombre(a) || a < (horsChamp ? -400 : 60) || a > (horsChamp ? 1480 : 1020)) f.push(`${ou}, ${quoi} : position ${a} hors de l'image`);
    };
    for (const x of persos) {
      const qui = `${x.qui}`;
      if (!QUI.includes(x.qui)) f.push(`${ou} : personnage inconnu « ${x.qui} »`);
      const gestes = Array.isArray(x.gestes) ? x.gestes : [];
      // un personnage peut partir hors de l'image s'il y entre en marchant ou en glissant
      const entre = gestes.some((g) => ['marche', 'court', 'apparait'].includes(g.geste) && g.de <= 0.05);
      spotOuX(x.a, qui, entre);
      if (x.taille !== undefined && (!nombre(x.taille) || x.taille < 1 || x.taille > 2.2)) f.push(`${ou}, ${qui} : taille de 1 à 2,2`);
      if (x.pose !== undefined && !V.poses.includes(x.pose)) f.push(`${ou}, ${qui} : pose inconnue « ${x.pose} »`);
      if (x.porte !== undefined && x.porte !== 'bonnet') f.push(`${ou}, ${qui} : seul le bonnet se porte sur la tête`);
      for (const g of gestes) {
        const quoi = `${qui}, geste ${g.geste}`;
        if (!V.gestes[g.geste]) {
          f.push(`${ou}, ${qui} : geste inconnu « ${g.geste} »`);
          continue;
        }
        dansLePlan(g.de, g.a, quoi);
        if (['marche', 'court'].includes(g.geste)) spotOuX(g.vers, quoi, true);
        if (g.geste === 'plonge') {
          if (decor.spots[g.vers]?.mode !== 'couche') f.push(`${ou}, ${quoi} : « vers » doit nommer une place dans le lit (${Object.keys(decor.spots).filter((k) => decor.spots[k].mode === 'couche').join(', ') || 'aucune dans ce décor'})`);
          if (typeof x.a === 'string' && decor.spots[x.a]?.mode && decor.spots[x.a].mode !== 'debout') f.push(`${ou}, ${quoi} : on plonge depuis le sol (une place debout), pas depuis ${x.a}`);
        }
        if (['calin', 'bisou'].includes(g.geste) && (!presents.includes(g.avec) || g.avec === x.qui)) f.push(`${ou}, ${quoi} : « avec » doit nommer l'autre personnage, présent dans le plan`);
        if (['offre', 'tient', 'mange'].includes(g.geste) && !V.objets[g.objet]) f.push(`${ou}, ${quoi} : objet inconnu « ${g.objet} »`);
        if (g.geste === 'effet' && !V.effets[g.effet]) f.push(`${ou}, ${quoi} : effet inconnu « ${g.effet} »`);
        if (g.geste === 'visage') {
          if (g.yeux !== undefined && !YEUX.includes(g.yeux)) f.push(`${ou}, ${quoi} : yeux inconnus « ${g.yeux} »`);
          if (g.bouche !== undefined && !BOUCHES.includes(g.bouche)) f.push(`${ou}, ${quoi} : bouche inconnue « ${g.bouche} »`);
          if (g.sourcils !== undefined && !SOURCILS.includes(g.sourcils)) f.push(`${ou}, ${quoi} : sourcils inconnus « ${g.sourcils} »`);
          if (g.larmes !== undefined && typeof g.larmes !== 'boolean') f.push(`${ou}, ${quoi} : larmes true ou false`);
        }
        if (g.geste === 'tourne' && g.vue !== undefined && !['face', 'profil', 'dos'].includes(g.vue)) f.push(`${ou}, ${quoi} : vue inconnue`);
        if (g.geste === 'regarde' && g.cible !== undefined && !['camera', 'gauche', 'droite', 'haut', 'bas', ...QUI].includes(g.cible)) f.push(`${ou}, ${quoi} : cible inconnue`);
        if (g.main !== undefined && !['gauche', 'droite'].includes(g.main)) f.push(`${ou}, ${quoi} : main « gauche » ou « droite »`);
        if (g.geste === 'apparait' && g.depuis !== undefined && !['bas', 'gauche', 'droite', 'pop'].includes(g.depuis)) f.push(`${ou}, ${quoi} : depuis inconnu`);
        if (g.geste === 'disparait' && g.vers !== undefined && !['bas', 'gauche', 'droite', 'pop'].includes(g.vers)) f.push(`${ou}, ${quoi} : vers inconnu`);
        if (g.geste === 'saute' && g.fois !== undefined && ![1, 2, 3].includes(g.fois)) f.push(`${ou}, ${quoi} : de 1 à 3 sauts`);
      }
    }
    for (const [k, o] of (p.objets ?? []).entries()) {
      const quoi = `objet ${k + 1}`;
      if (!V.objets[o.objet]) f.push(`${ou}, ${quoi} : objet inconnu « ${o.objet} »`);
      if (!nombre(o.x) || !nombre(o.y) || o.x < -200 || o.x > 1280 || o.y < 0 || o.y > 1920) f.push(`${ou}, ${quoi} : position hors de l'image`);
      if (o.taille !== undefined && (!nombre(o.taille) || o.taille < 0.3 || o.taille > 3)) f.push(`${ou}, ${quoi} : taille de 0,3 à 3`);
      if (o.de !== undefined && (!nombre(o.de) || o.de < 0 || o.de >= d)) f.push(`${ou}, ${quoi} : entrée hors du plan`);
      if (o.entree !== undefined && !['pop', 'glisse-gauche', 'glisse-droite', 'tombe', 'aucune'].includes(o.entree)) f.push(`${ou}, ${quoi} : entrée inconnue`);
      if (o.vol) dansLePlan(o.vol.de, o.vol.a, `${quoi}, vol`);
    }
    for (const [k, e] of (p.effets ?? []).entries()) {
      if (!V.effets[e.effet]) f.push(`${ou}, effet ${k + 1} : inconnu « ${e.effet} »`);
      dansLePlan(e.de, e.a, `effet ${e.effet}`);
    }
    for (const [k, b] of (p.bulles ?? []).entries()) {
      if (!presents.includes(b.qui)) f.push(`${ou}, bulle ${k + 1} : « ${b.qui} » n'est pas dans le plan`);
      dansLePlan(b.de, b.a, `bulle ${k + 1}`);
      texte(b.texte, `${ou}, bulle ${k + 1}`, 60);
    }
    for (const [k, t] of (p.textes ?? []).entries()) {
      dansLePlan(t.de, t.a ?? d, `texte ${k + 1}`);
      texte(t.texte, `${ou}, texte ${k + 1}`, 90);
      if (t.place !== undefined && !['haut', 'milieu'].includes(t.place)) f.push(`${ou}, texte ${k + 1} : place « haut » ou « milieu »`);
      if (t.style !== undefined && !['phrase', 'plume'].includes(t.style)) f.push(`${ou}, texte ${k + 1} : style « phrase » ou « plume »`);
    }
    for (const c of p.camera ?? []) {
      if (!nombre(c.a) || c.a < 0 || c.a > d + 0.01) f.push(`${ou}, caméra : temps ${c.a} hors du plan`);
      if ('secousse' in c) {
        if (!nombre(c.secousse) || c.secousse <= 0 || c.secousse > 30) f.push(`${ou}, caméra : secousse de 1 à 30`);
        continue;
      }
      if (c.zoom !== undefined && (!nombre(c.zoom) || c.zoom < 1 || c.zoom > 3)) f.push(`${ou}, caméra : zoom de 1 à 3`);
      if (c.cible !== undefined && !presents.includes(c.cible)) f.push(`${ou}, caméra : cible « ${c.cible} » absente du plan`);
    }
    for (const s of p.sons ?? []) {
      if (!V.sons.includes(s.son)) f.push(`${ou} : son inconnu « ${s.son} »`);
      if (!nombre(s.a) || s.a < 0 || s.a >= d) f.push(`${ou} : son hors du plan`);
    }
  });
  controlerRichesse(plans, f);
  return f;
}
