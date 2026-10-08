// Le contrôle des recettes des mipaps (reseaux/mipaps), le second compte
// Instagram : quatre gabarits dessinés avec le Gribouillou et la
// Gribouillette. Les noms admis (expressions, poses, bras, pattes, signes,
// objets, meubles, scènes à deux) viennent du rig lui-même : une expression
// qui n'existe pas s'arrête ici, avant le rendu. Appelé par controlerRecette.
import { EXPRESSIONS, LISTE_BRAS, LISTE_PATTES, LISTE_POSES, LISTE_PROPS, LISTE_SIGNES } from '../../mipaps/charte/gribouillou.mjs';
import { DUOS, MEUBLES } from '../../mipaps/charte/scenes.mjs';

// Le format que donne chaque gabarit, et la catégorie de la ligne éditoriale
// des mipaps (reseaux/mipaps/atelier/LIGNE-EDITORIALE.md) qui le fabrique.
export const GABARITS_MIPAPS = { 'mipaps-reel': 'reel', 'mipaps-statique': 'reel', 'mipaps-carrousel': 'carrousel', 'mipaps-post': 'image' };
export const CATEGORIES_MIPAPS = { 'mipaps-anime': 'mipaps-reel', 'mipaps-statique': 'mipaps-statique', 'mipaps-histoire': 'mipaps-carrousel', 'mipaps-post': 'mipaps-post' };
// Les bruitages qu'un plan peut demander (studio/src/charte/Son.tsx).
export const SONS_MIPAPS = ['pop', 'saut', 'pas', 'glisse', 'coeur', 'bisou', 'smack', 'rire', 'pleure', 'cri', 'sursaut', 'ronfle', 'baille', 'soupir', 'grogne', 'croque', 'aspire', 'miam', 'eternue', 'aie', 'applaudit', 'boing', 'splat', 'trombone', 'tambour', 'notification', 'sonne', 'reveil', 'pose', 'tinte', 'portiere', 'clochette', 'sonnette', 'klaxon', 'demarre', 'tonnerre', 'battement', 'coussin', 'tape', 'joie', 'froissement', 'porte', 'tictac'];
const PERSOS = ['lui', 'elle'];
const MARQUEURS = ['fleur', 'noeud', 'meche'];
const STYLES_POST = ['mini', 'declaration', 'schema'];
const SCHEMAS = ['venn', 'barres', 'liste', 'courbe', 'camembert'];
const PLACES = ['haut', 'bas'];
const STYLES_TEXTE = ['message', 'titre'];
const TRANSITIONS = ['coupe', 'fondu'];
// Les longueurs : un texte de post ou de page tient en cinq lignes de
// Shantell Sans sur 868 px, un message de reel en quatre lignes sur 840.
export const LONGUEURS = { post: 110, declaration: 170, schema: 70, page: 110, appel: 50, reel: 100, titre: 60, etiquette: 26, ligne: 40 };
// Un reel des mipaps dure de 10 à 40 secondes (Instagram privilégie les
// reels courts regardés en entier ; sous 10 s, règle de Thomas, jamais).
export const DUREE_REEL = { min: 10, max: 40 };

const nombre = (v, min, max) => typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max;
const emoji = (t) => /\p{Extended_Pictographic}/u.test(t);

const controlerTexte = (t, max, ou, f, { obligatoire = true } = {}) => {
  if (t === undefined) {
    if (obligatoire) f.push(`${ou} : texte manquant`);
    return;
  }
  if (typeof t !== 'string' || !t.trim()) return void f.push(`${ou} : texte vide`);
  if (t.length > max) f.push(`${ou} : ${t.length} signes pour ${max} au plus`);
  if (emoji(t)) f.push(`${ou} : pas d'emoji à l'écran (la police ne les dessine pas ; « <3 » s'écrit en lettres)`);
  if (/#\w/.test(t)) f.push(`${ou} : pas de hashtag dans l'image`);
  if (t !== t.trim()) f.push(`${ou} : espaces en trop aux bouts`);
};

// Ce qu'un personnage ou une étape peut porter.
const controlerAllure = (p, ou, f) => {
  if (p.expression !== undefined && !EXPRESSIONS[p.expression]) f.push(`${ou} : expression inconnue « ${p.expression} »`);
  if (p.pose !== undefined && !LISTE_POSES.includes(p.pose)) f.push(`${ou} : pose inconnue « ${p.pose} »`);
  if (p.bras !== undefined && !LISTE_BRAS.includes(p.bras)) f.push(`${ou} : bras inconnus « ${p.bras} »`);
  if (p.pattes !== undefined && !LISTE_PATTES.includes(p.pattes)) f.push(`${ou} : pattes inconnues « ${p.pattes} »`);
  if (p.signes !== undefined) {
    if (!Array.isArray(p.signes)) f.push(`${ou} : signes doit être une liste`);
    else for (const sg of p.signes) if (!LISTE_SIGNES.includes(sg)) f.push(`${ou} : signe inconnu « ${sg} »`);
  }
  if (p.marqueur !== undefined && !MARQUEURS.includes(p.marqueur)) f.push(`${ou} : marqueur inconnu « ${p.marqueur} » (${MARQUEURS.join(', ')})`);
  if (p.angle !== undefined && !nombre(p.angle, -180, 180)) f.push(`${ou} : angle de -180 à 180`);
  if (p.vers !== undefined && ![-1, 1].includes(p.vers)) f.push(`${ou} : vers vaut -1 ou 1`);
  if (p.x !== undefined && !nombre(p.x, -300, 940)) f.push(`${ou} : x de -300 à 940 (la boîte fait 640 de large)`);
  if (p.y !== undefined && !nombre(p.y, 0, 420)) f.push(`${ou} : y de 0 à 420 (le sol est à 380)`);
  if (p.taille !== undefined && !nombre(p.taille, 60, 360)) f.push(`${ou} : taille de 60 à 360`);
  if (p.miroir !== undefined && typeof p.miroir !== 'boolean') f.push(`${ou} : miroir vaut true ou false`);
  if (p.dos !== undefined && typeof p.dos !== 'boolean') f.push(`${ou} : dos vaut true ou false`);
};

const controlerObjet = (o, ou, f) => {
  if (!LISTE_PROPS.includes(o.objet)) f.push(`${ou} : objet inconnu « ${o.objet} »`);
  if (!nombre(o.x, -200, 840)) f.push(`${ou} : x de -200 à 840`);
  if (!nombre(o.y, -100, 460)) f.push(`${ou} : y de -100 à 460`);
  if (o.echelle !== undefined && !nombre(o.echelle, 0.2, 3)) f.push(`${ou} : echelle de 0,2 à 3`);
};

// Un dessin : une scène à deux du canevas (duo) ou une liste d'éléments.
export function controlerDessin(d, ou, f) {
  if (!d || typeof d !== 'object' || Array.isArray(d)) return void f.push(`${ou} : dessin attendu ({ duo } ou { elements })`);
  if (d.duo !== undefined) {
    if (!DUOS[d.duo]) f.push(`${ou} : scène à deux inconnue « ${d.duo} » (${Object.keys(DUOS).join(', ')})`);
    return;
  }
  if (!Array.isArray(d.elements) || !d.elements.length) return void f.push(`${ou} : au moins un élément (ou une scène duo)`);
  if (d.elements.length > 8) f.push(`${ou} : huit éléments au plus, un dessin reste minimaliste`);
  let persos = 0;
  d.elements.forEach((el, i) => {
    const ouE = `${ou}, élément ${i + 1}`;
    if (!el || typeof el !== 'object') return void f.push(`${ouE} : élément invalide`);
    if (el.meuble !== undefined) {
      if (!MEUBLES[el.meuble]) f.push(`${ouE} : meuble inconnu « ${el.meuble} » (${Object.keys(MEUBLES).join(', ')})`);
    } else if (el.objet !== undefined) controlerObjet(el, ouE, f);
    else if (el.perso !== undefined) {
      persos++;
      if (!PERSOS.includes(el.perso)) f.push(`${ouE} : personnage inconnu « ${el.perso} » (lui, elle)`);
      if (el.x === undefined) f.push(`${ouE} : x manquant`);
      controlerAllure(el, ouE, f);
    } else f.push(`${ouE} : un élément est un perso, un objet ou un meuble`);
  });
  if (persos > 2) f.push(`${ou} : deux personnages au plus`);
}

const controlerSchema = (s, f) => {
  const ou = 'schéma';
  if (!s || typeof s !== 'object') return void f.push(`${ou} : objet attendu`);
  if (!SCHEMAS.includes(s.type)) return void f.push(`${ou} : type inconnu « ${s.type} » (${SCHEMAS.join(', ')})`);
  const L = LONGUEURS.etiquette;
  if (s.type === 'venn') for (const k of ['gauche', 'droite', 'milieu']) controlerTexte(s[k], k === 'milieu' ? 18 : L, `${ou}, ${k}`, f);
  if (s.type === 'barres') {
    if (!Array.isArray(s.barres) || s.barres.length < 2 || s.barres.length > 5) f.push(`${ou} : de 2 à 5 barres`);
    (s.barres || []).forEach((b, i) => {
      controlerTexte(b?.texte, L, `${ou}, barre ${i + 1}`, f);
      if (!nombre(b?.valeur, 0, 100)) f.push(`${ou}, barre ${i + 1} : valeur de 0 à 100`);
    });
  }
  if (s.type === 'liste') {
    if (!Array.isArray(s.lignes) || s.lignes.length < 2 || s.lignes.length > 6) f.push(`${ou} : de 2 à 6 lignes`);
    (s.lignes || []).forEach((l, i) => controlerTexte(l?.texte, LONGUEURS.ligne, `${ou}, ligne ${i + 1}`, f));
  }
  if (s.type === 'courbe') {
    if (!Array.isArray(s.etiquettes) || s.etiquettes.length !== 2) f.push(`${ou} : deux étiquettes (début et fin de l'axe)`);
    (s.etiquettes || []).forEach((e, i) => controlerTexte(e, 20, `${ou}, étiquette ${i + 1}`, f));
    if (!Array.isArray(s.points) || s.points.length < 3 || s.points.length > 12 || !s.points.every((p) => nombre(p, 0, 100))) f.push(`${ou} : de 3 à 12 points entre 0 et 100`);
    controlerTexte(s.repere, L, `${ou}, repère`, f, { obligatoire: false });
  }
  if (s.type === 'camembert') {
    if (!Array.isArray(s.parts) || s.parts.length < 2 || s.parts.length > 4) f.push(`${ou} : de 2 à 4 parts`);
    (s.parts || []).forEach((p, i) => {
      controlerTexte(p?.texte, 30, `${ou}, part ${i + 1}`, f);
      if (!nombre(p?.part, 0.01, 1000)) f.push(`${ou}, part ${i + 1} : part positive`);
    });
  }
};

const controlerPlan = (p, n, f) => {
  const ou = `plan ${n}`;
  if (!p || typeof p !== 'object') return void f.push(`${ou} : plan invalide`);
  if (!nombre(p.duree, 1.5, 15)) f.push(`${ou} : durée de 1,5 à 15 s`);
  if (typeof p.description !== 'string' || p.description.trim().length < 60) f.push(`${ou} : la description raconte le plan comme à un dessinateur (60 signes au moins)`);
  for (const m of p.meubles ?? []) if (!MEUBLES[m]) f.push(`${ou} : meuble inconnu « ${m} »`);
  const persos = Array.isArray(p.persos) ? p.persos : [];
  if (!persos.length) f.push(`${ou} : au moins un personnage`);
  if (persos.length > 2) f.push(`${ou} : deux personnages au plus`);
  if (new Set(persos.map((x) => x?.perso)).size !== persos.length) f.push(`${ou} : chaque personnage une fois`);
  persos.forEach((pe) => {
    const ouP = `${ou}, ${pe?.perso}`;
    if (!PERSOS.includes(pe?.perso)) return void f.push(`${ou} : personnage inconnu « ${pe?.perso} » (lui, elle)`);
    if (pe.marqueur !== undefined && !MARQUEURS.includes(pe.marqueur)) f.push(`${ouP} : marqueur inconnu « ${pe.marqueur} »`);
    const etapes = Array.isArray(pe.etapes) ? pe.etapes : [];
    if (!etapes.length) return void f.push(`${ouP} : au moins une étape`);
    if (etapes[0].x === undefined) f.push(`${ouP} : la première étape dit où il est (x)`);
    let precedent = -1;
    etapes.forEach((e, i) => {
      const ouE = `${ouP}, étape ${i + 1}`;
      if (!nombre(e.a, 0, p.duree ?? 0)) f.push(`${ouE} : instant a de 0 à la durée du plan`);
      if (e.a < precedent) f.push(`${ouE} : les étapes vont dans l'ordre du temps`);
      precedent = e.a;
      if (e.visible !== undefined && typeof e.visible !== 'boolean') f.push(`${ouE} : visible vaut true ou false`);
      controlerAllure(e, ouE, f);
    });
  });
  const objets = p.objets ?? [];
  if (objets.length > 6) f.push(`${ou} : six objets au plus`);
  objets.forEach((o, i) => {
    const ouO = `${ou}, objet ${i + 1}`;
    controlerObjet(o, ouO, f);
    if (o.de !== undefined && !nombre(o.de, 0, p.duree ?? 0)) f.push(`${ouO} : de dans le plan`);
    if (o.a !== undefined && !nombre(o.a, o.de ?? 0, p.duree ?? 0)) f.push(`${ouO} : a après de, dans le plan`);
    (o.etapes ?? []).forEach((e, j) => {
      if (!nombre(e?.a, 0, p.duree ?? 0)) f.push(`${ouO}, étape ${j + 1} : instant a dans le plan`);
    });
  });
  const textes = p.textes ?? [];
  if (textes.length > 3) f.push(`${ou} : trois textes au plus`);
  textes.forEach((x, i) => {
    const ouT = `${ou}, texte ${i + 1}`;
    controlerTexte(x?.texte, x?.style === 'titre' ? LONGUEURS.titre : LONGUEURS.reel, ouT, f);
    if (!nombre(x?.de, 0, p.duree ?? 0)) f.push(`${ouT} : de dans le plan`);
    if (x?.a !== undefined && !(nombre(x.a, 0, p.duree ?? 0) && x.a > x.de)) f.push(`${ouT} : a après de, dans le plan`);
    if (x?.place !== undefined && !PLACES.includes(x.place)) f.push(`${ouT} : place haut ou bas`);
    if (x?.style !== undefined && !STYLES_TEXTE.includes(x.style)) f.push(`${ouT} : style message ou titre`);
  });
  // deux textes à la même place ne se recouvrent jamais dans le temps
  for (let i = 0; i < textes.length; i++) {
    for (let j = i + 1; j < textes.length; j++) {
      const a = textes[i];
      const b = textes[j];
      if ((a.place ?? 'haut') !== (b.place ?? 'haut')) continue;
      const finA = a.a ?? p.duree;
      const finB = b.a ?? p.duree;
      if (a.de < finB && b.de < finA) f.push(`${ou} : les textes ${i + 1} et ${j + 1} sont affichés en même temps au même endroit`);
    }
  }
  for (const [i, sn] of (p.sons ?? []).entries()) {
    if (!SONS_MIPAPS.includes(sn?.nom)) f.push(`${ou}, son ${i + 1} : bruitage inconnu « ${sn?.nom} »`);
    if (!nombre(sn?.a, 0, p.duree ?? 0)) f.push(`${ou}, son ${i + 1} : instant a dans le plan`);
  }
  if (p.zoom !== undefined && !(Array.isArray(p.zoom) && p.zoom.length === 2 && p.zoom.every((z) => nombre(z, 0.7, 1.6)))) f.push(`${ou} : zoom = [début, fin] entre 0,7 et 1,6`);
  if (p.transition !== undefined && !TRANSITIONS.includes(p.transition)) f.push(`${ou} : transition coupe ou fondu`);
};

export function controlerMipaps(r) {
  const f = [];
  if (!r || typeof r !== 'object') return ['recette absente'];
  if (!GABARITS_MIPAPS[r.gabarit]) f.push(`gabarit inconnu : ${r.gabarit}`);
  if (r.langue !== 'fr') f.push('les mipaps parlent français (langue fr)');
  if (r.theme !== 'light') f.push('les mipaps sont sur fond blanc (theme light)');
  if (typeof r.idee !== 'string' || r.idee.trim().length < 10) f.push("l'idée du post manque (champ idee, une phrase)");
  if (r.gabarit === 'mipaps-post') {
    if (!STYLES_POST.includes(r.style)) f.push(`style de post inconnu : ${r.style} (${STYLES_POST.join(', ')})`);
    controlerTexte(r.texte, r.style === 'declaration' ? LONGUEURS.declaration : r.style === 'schema' ? LONGUEURS.schema : LONGUEURS.post, 'texte', f);
    if (r.style === 'mini') {
      if (!r.dessin) f.push('un mini a un dessin');
      else controlerDessin(r.dessin, 'dessin', f);
    }
    if (r.style === 'schema') controlerSchema(r.schema, f);
  }
  if (r.gabarit === 'mipaps-carrousel') {
    const pages = Array.isArray(r.pages) ? r.pages : [];
    if (pages.length < 3 || pages.length > 10) f.push(`un carrousel-histoire a de 3 à 10 pages (ici ${pages.length})`);
    pages.forEach((pg, i) => {
      const ou = `page ${i + 1}`;
      if (!pg || typeof pg !== 'object') return void f.push(`${ou} : page invalide`);
      if (pg.texte === undefined && pg.dessin === undefined) f.push(`${ou} : un texte ou un dessin au moins`);
      controlerTexte(pg.texte, LONGUEURS.page, ou, f, { obligatoire: i === 0 });
      if (pg.dessin !== undefined) controlerDessin(pg.dessin, `${ou}, dessin`, f);
      if (pg.appel !== undefined) {
        if (i !== pages.length - 1) f.push(`${ou} : l'appel va sur la dernière page`);
        controlerTexte(pg.appel, LONGUEURS.appel, `${ou}, appel`, f);
      }
    });
  }
  if (r.gabarit === 'mipaps-statique') {
    controlerTexte(r.texte, LONGUEURS.reel, 'texte', f);
    if (!r.dessin) f.push('un reel statique a un dessin');
    else controlerDessin(r.dessin, 'dessin', f);
    if (r.duree !== undefined && !nombre(r.duree, DUREE_REEL.min, 15)) f.push(`durée de ${DUREE_REEL.min} à 15 s`);
  }
  if (r.gabarit === 'mipaps-reel') {
    const plans = Array.isArray(r.plans) ? r.plans : [];
    if (!plans.length || plans.length > 8) f.push(`un reel animé a de 1 à 8 plans (ici ${plans.length})`);
    const total = plans.reduce((a, p) => a + (typeof p?.duree === 'number' ? p.duree : 0), 0);
    if (!nombre(total, DUREE_REEL.min, DUREE_REEL.max)) f.push(`le reel dure ${total.toFixed(1)} s : de ${DUREE_REEL.min} à ${DUREE_REEL.max} s`);
    if (!plans.some((p) => (p?.textes ?? []).length)) f.push('un reel animé porte au moins un texte (le pov, la chute)');
    plans.forEach((p, i) => controlerPlan(p, i + 1, f));
  }
  return f;
}
