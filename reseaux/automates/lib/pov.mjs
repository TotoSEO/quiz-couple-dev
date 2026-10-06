// Contrôle d'un scénario d'animation (gabarit « pov ») avant tout rendu :
// chaque mot doit exister dans le vocabulaire du studio, chaque temps tenir
// dans son plan. Le contrôle de mise en page (cadre, textes, visages) vient
// ensuite, au rendu. Renvoie la liste des fautes.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ici = path.dirname(fileURLToPath(import.meta.url));
export const VOCABULAIRE = JSON.parse(fs.readFileSync(path.join(ici, '..', '..', 'studio', 'src', 'pov', 'vocabulaire.json'), 'utf8'));

const YEUX = ['ouverts', 'heureux', 'coeur', 'plats', 'fermes', 'clin'];
const BOUCHES = ['sourire', 'o', 'rire', 'plate', 'triste', 'bisou'];
const QUI = ['rose', 'violet'];
const EMOJI = /\p{Extended_Pictographic}/u;

const nombre = (v) => typeof v === 'number' && Number.isFinite(v);

export function controlerPov(r) {
  const f = [];
  const V = VOCABULAIRE;
  if (typeof r.idee !== 'string' || r.idee.trim().length < 10) f.push("l'idée du scénario manque (champ idee)");
  if (r.titre !== undefined && (typeof r.titre !== 'string' || r.titre.length > 90)) f.push('titre de 90 signes au plus');
  if (!['light', 'dark'].includes(r.theme)) f.push(`thème d'animation inconnu : ${r.theme}`);
  const plans = Array.isArray(r.plans) ? r.plans : [];
  if (plans.length < 1 || plans.length > 8) f.push('une animation a de 1 à 8 plans');
  const total = plans.reduce((s, p) => s + (nombre(p.duree) ? p.duree : 0), 0);
  if (total < 4 || total > 20) f.push(`durée totale de 4 à 20 s (ici ${total.toFixed(1)} s)`);
  const texte = (t, ou, max) => {
    if (typeof t !== 'string' || !t.trim()) return f.push(`${ou} : texte vide`);
    if (t.length > max) f.push(`${ou} : ${max} signes au plus`);
    if (EMOJI.test(t)) f.push(`${ou} : pas d'emoji à l'écran (la police ne les dessine pas)`);
  };
  if (r.titre) texte(r.titre, 'titre', 90);
  plans.forEach((p, i) => {
    const ou = `plan ${i + 1}`;
    const d = p.duree;
    if (typeof p.description !== 'string' || p.description.trim().length < 30) f.push(`${ou} : la description doit dire ce qu'on voit (30 signes au moins)`);
    if (!nombre(d) || d < 0.8 || d > 8) f.push(`${ou} : durée de 0,8 à 8 s`);
    const decor = V.decors[p.decor];
    if (!decor) {
      f.push(`${ou} : décor inconnu « ${p.decor} »`);
      return;
    }
    if (p.moment !== undefined && !V.moments.includes(p.moment)) f.push(`${ou} : moment inconnu « ${p.moment} »`);
    if (p.transition !== undefined && !V.transitions.includes(p.transition)) f.push(`${ou} : transition inconnue « ${p.transition} »`);
    if (p.couette !== undefined && (!['calme', 'bouge'].includes(p.couette) || p.decor !== 'chambre')) f.push(`${ou} : couette « calme » ou « bouge », dans la chambre seulement`);
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
        if (['calin', 'bisou'].includes(g.geste) && (!presents.includes(g.avec) || g.avec === x.qui)) f.push(`${ou}, ${quoi} : « avec » doit nommer l'autre personnage, présent dans le plan`);
        if (['offre', 'tient', 'mange'].includes(g.geste) && !V.objets[g.objet]) f.push(`${ou}, ${quoi} : objet inconnu « ${g.objet} »`);
        if (g.geste === 'effet' && !V.effets[g.effet]) f.push(`${ou}, ${quoi} : effet inconnu « ${g.effet} »`);
        if (g.geste === 'visage') {
          if (g.yeux !== undefined && !YEUX.includes(g.yeux)) f.push(`${ou}, ${quoi} : yeux inconnus « ${g.yeux} »`);
          if (g.bouche !== undefined && !BOUCHES.includes(g.bouche)) f.push(`${ou}, ${quoi} : bouche inconnue « ${g.bouche} »`);
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
  return f;
}
