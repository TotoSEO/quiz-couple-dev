// Les planches du canevas « Les mipaps : le Gribouillou » : un artboard
// .dc.html par planche, les dessins en SVG en ligne, les textes en HTML.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mipap, EXPRESSIONS, FAMILLES_EXPRESSIONS, LISTE_POSES, PROPS, prop, defs, document, pose, COULEURS } from './gribouillou.mjs';
import { DUOS, scene } from './scenes.mjs';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const PROJET = path.join(ICI, 'canevas', 'project');
fs.mkdirSync(PROJET, { recursive: true });
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const POLICES = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Shantell+Sans:ital,wght@0,400;0,500;0,700;1,400&amp;family=Nunito:ital,wght@0,400;0,600;0,700;1,400&amp;display=swap" rel="stylesheet">`;
const ENCRE = '#2b2430', GRIS = '#6b6472', FOND = '#ffffff';
const TEXTE = `font-family: 'Nunito', system-ui, sans-serif; color: ${ENCRE}`;
const MAIN = `font-family: 'Shantell Sans', 'Nunito', system-ui, sans-serif`;

let compteur = 0;
const uid = () => `g${(compteur++).toString(36)}`;
// un personnage seul dans un carré svg
function perso(o, taille, viewBox = '0 0 300 300') {
  const id = uid();
  const { svg, defs: d } = mipap({ ...o, id, seed: o.seed ?? 7 + compteur });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${taille}" height="${taille}" style="display: block"><defs>${d}</defs>${svg}</svg>`;
}
function objet(nom, taille) {
  const id = uid();
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${taille}" height="${taille}" style="display: block"><defs>${defs(id, 31 + compteur)}</defs>${prop(nom, 50, 50, 1, id)}</svg>`;
}
function duo(nom, w, h) {
  const sc = scene(nom, { prefix: uid() });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420" width="${w}" height="${h}" style="display: block"><defs>${sc.defs}</defs>${sc.svg}</svg>`;
}
const cellule = (dessin, libelle, sous = '') => `<div style="display: flex; flex-direction: column; align-items: center; gap: 2px">${dessin}<p style="margin: 0; font-size: 15px; font-weight: 700; text-align: center">${esc(libelle)}</p>${sous ? `<p style="margin: 0; font-size: 12px; color: ${GRIS}; text-align: center">${esc(sous)}</p>` : ''}</div>`;
const grille = (cellules, colonnes, gap = 12) => `<div style="display: grid; grid-template-columns: repeat(${colonnes}, minmax(0, 1fr)); gap: ${gap}px">${cellules.join('')}</div>`;
const titre = (t, taille = 44) => `<h1 style="margin: 0; ${MAIN}; font-weight: 700; font-size: ${taille}px; line-height: 1.1">${esc(t)}</h1>`;
const sousTitre = (t) => `<h2 style="margin: 0; ${MAIN}; font-weight: 500; font-size: 26px; line-height: 1.2; color: ${GRIS}">${esc(t)}</h2>`;
const para = (t, taille = 17) => `<p style="margin: 0; font-size: ${taille}px; line-height: 1.45">${t}</p>`;

function artboard(nom, w, h, corps, lang = 'fr') {
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<title>${esc(nom)}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
${POLICES}
<style>
body{margin:0}
</style>
</helmet>
<div style="width: ${w}px; height: ${h}px; box-sizing: border-box; padding: 40px 48px; display: flex; flex-direction: column; gap: 22px; background: ${FOND}; ${TEXTE}; border-radius: 24px; overflow: hidden">
${corps}
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":${w},"height":${h}}}'>
class Component extends DCLogic {
  renderVals() {
    return {};
  }
}
</script>
</body>
</html>
`;
}

const planches = {};
const boards = {};
const order = [];
function planche(fichier, nom, w, h, x, y, corps) {
  planches[fichier] = artboard(nom, w, h, corps);
  boards[fichier] = { x, y, w, h, title: nom };
  order.push(fichier);
}

// ── Main : la couverture ────────────────────────────────────────────────
planche('Main.dc.html', 'Les mipaps', 3600, 620, 0, 0,
  `<div style="display: flex; gap: 48px; align-items: center; height: 100%">
    <div style="display: flex; align-items: flex-end; gap: 0; flex-shrink: 0">${perso({ perso: 'lui', expression: 'content' }, 470)}${perso({ perso: 'elle', expression: 'joie' }, 470)}</div>
    <div style="display: flex; flex-direction: column; gap: 16px; width: 1060px; flex-shrink: 0">
      ${titre('Les mipaps', 96)}
      ${para(`Le Gribouillou et la Gribouillette : deux petites créatures au feutre, un gros trait noir qui tremble, un aplat pâle, des joues, deux points pour les yeux. Tout le compte se dessine avec eux, sur fond blanc, et rien d'autre que ce qu'il faut.`, 24)}
      ${para(`<strong>Elle s'appelle Eli, lui Toh.</strong> Les prénoms servent au lore du compte (la bio, les légendes) ; dans les posts ils restent « mon amoureux » et « ma personne », pour que chacun s'y mette. « Gribouillou » et « Gribouillette » sont les noms de travail du code.`, 19)}
    </div>
    <div style="display: flex; flex-direction: column; gap: 14px; flex-grow: 1; min-width: 0">
      ${sousTitre('Les quatre règles du compte')}
      ${['Fond blanc, toujours. Pas de décor complet : un objet, un meuble, un trait de sol au plus.', 'Tout est dessiné au même trait : les personnages, les objets, les cases, les flèches. Rien de net, rien de vectoriel.', 'Cinq couleurs en tout : l\'encre, le bleu de lui, le rose d\'elle, le rose des joues et des cœurs, le blanc.', 'Une émotion par image, lisible en un quart de seconde. Le texte est court, en minuscules, comme un message.'].map((t, i) => `<div style="display: flex; gap: 14px; align-items: flex-start"><span style="display: block; width: 34px; height: 34px; border-radius: 50%; background: ${ENCRE}; color: #fff; ${MAIN}; font-weight: 700; font-size: 18px; line-height: 34px; text-align: center; flex-shrink: 0">${i + 1}</span>${para(t, 19)}</div>`).join('')}
    </div>
  </div>`);

// ── 01 : les personnages ────────────────────────────────────────────────
const pastille = (c, nom, hex) => `<div style="display: flex; align-items: center; gap: 10px"><span style="display: block; width: 36px; height: 36px; border-radius: 50%; background: ${c}; box-shadow: inset 0 0 0 1px rgba(0,0,0,.14)"></span><div><p style="margin: 0; font-size: 15px; font-weight: 700">${esc(nom)}</p><p style="margin: 0; font-size: 13px; color: ${GRIS}">${hex}</p></div></div>`;
planche('01-personnages.dc.html', 'Les deux personnages', 1800, 1060, 0, 1080,
  `${titre('Le Gribouillou et la Gribouillette')}
  <div style="display: flex; gap: 40px; align-items: flex-start">
    <div style="display: flex; flex-direction: column; align-items: center; gap: 6px">${perso({ perso: 'lui', expression: 'content' }, 420)}<p style="margin: 0; ${MAIN}; font-size: 26px; font-weight: 700">lui</p><p style="margin: 0; font-size: 15px; color: ${GRIS}; text-align: center; max-width: 380px">Bleu pâle. Deux bosses d'oreilles, deux points, une bouche de chat, deux bouts de bras, deux pattes.</p></div>
    <div style="display: flex; flex-direction: column; align-items: center; gap: 6px">${perso({ perso: 'elle', expression: 'content' }, 420)}<p style="margin: 0; ${MAIN}; font-size: 26px; font-weight: 700">elle</p><p style="margin: 0; font-size: 15px; color: ${GRIS}; text-align: center; max-width: 380px">Rose pâle, la même forme. Deux cils à chaque œil et une petite fleur sur l'oreille droite, c'est tout ce qui la distingue.</p></div>
    <div style="display: flex; flex-direction: column; gap: 18px; flex-grow: 1; min-width: 0">
      ${sousTitre('Comment ils sont faits')}
      ${para(`<strong>La forme :</strong> une patate un peu plus large que haute, jamais la même d'un dessin à l'autre : les points de la courbe bougent de 3 %. <strong>Le trait :</strong> une passe épaisse (6,5 px sur 300) et une seconde passe plus fine, décalée par un bruit différent, comme un trait repassé à la main. Tout tremble par un filtre de déplacement, le remplissage compris. <strong>Les joues :</strong> deux ronds roses estompés. <strong>Les yeux :</strong> deux points au repos, plus grands et brillants dès qu'une émotion le demande.`, 16)}
      ${para(`<strong>Les bras :</strong> deux petits bouts au repos. Dès qu'une main se pose quelque part (joue, bouche, yeux, tête, objet), le bras entier se dessine : un tube qui part de l'épaule et une patte ronde au bout. <strong>Les pattes :</strong> deux bouts sous le corps, qui disent s'il est debout, s'il marche, court, saute ou s'assoit.`, 16)}
      <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 24px">
        ${pastille(COULEURS.encre, 'l\'encre', COULEURS.encre)}${pastille(COULEURS.lui, 'lui', COULEURS.lui)}${pastille(COULEURS.elle, 'elle', COULEURS.elle)}${pastille(COULEURS.joue, 'les joues', COULEURS.joue)}${pastille(COULEURS.coeur, 'les cœurs et la fleur', COULEURS.coeur)}${pastille(COULEURS.blanc, 'le fond et le dedans des objets', COULEURS.blanc)}
      </div>
      ${sousTitre('Le marqueur d\'elle : la fleur, retenue')}
      <div style="display: flex; gap: 10px; align-items: flex-end">
        ${['fleur', 'noeud', 'meche'].map((m) => `<div style="display: flex; flex-direction: column; align-items: center">${perso({ perso: 'elle', expression: 'content', marqueur: m }, 170)}<p style="margin: 0; font-size: 14px; font-weight: 700">${m === 'fleur' ? 'la fleur (retenue)' : m === 'noeud' ? 'le nœud (trop proche de nub)' : 'la mèche (moins lisible)'}</p></div>`).join('')}
        ${perso({ perso: 'elle', expression: 'content', dos: true }, 170)}
      </div>
      ${para(`À droite : la vue de dos, la même forme avec une petite queue en pompon.`, 14)}
    </div>
  </div>`);

// ── 07 : la DA ──────────────────────────────────────────────────────────
const exempleTexte = (t, taille, poids = 700, italique = false) => `<p style="margin: 0; ${MAIN}; font-size: ${taille}px; font-weight: ${poids}; line-height: 1.15; ${italique ? 'font-style: italic;' : ''}">${esc(t)}</p>`;
planche('07-da.dc.html', 'La direction artistique', 1700, 1060, 1880, 1080,
  `${titre('La direction artistique du compte')}
  <div style="display: flex; gap: 40px; align-items: flex-start">
    <div style="display: flex; flex-direction: column; gap: 14px; width: 760px; flex-shrink: 0">
      ${sousTitre('Ce qu\'on fait')}
      ${para(`<strong>Fond blanc</strong> sur tous les posts, tous les reels, toutes les cases.`, 16)}
      ${para(`<strong>Le personnage prend la moitié ou les deux tiers de l'image</strong>, centré, et il regarde la personne. À deux, ils se touchent presque.`, 16)}
      ${para(`<strong>Un objet, pas un décor.</strong> Une tasse, un téléphone, un parapluie, un canapé vu de trois quarts, un trait de sol. Tout au même trait tremblé, blanc dedans.`, 16)}
      ${para(`<strong>Le texte en minuscules, court, comme un message</strong> envoyé à l'autre : « j'pense à toi là », « reviens vite stp », « t'as encore oublié ». Deux à huit mots, en haut ou au milieu, jamais sur le personnage. Les majuscules quand on crie : « JE T'AIME !!! ».`, 16)}
      ${para(`<strong>Une émotion par image.</strong> Dans une BD, une case = une émotion = un geste.`, 16)}
      ${sousTitre('Ce qu\'on ne fait pas')}
      ${para(`Pas de dégradé, pas d'ombre portée, pas de couleur en plus (le jaune, le vert, le bleu vif n'existent pas). Pas de décor complet, pas de photo, pas de texture. Pas de bulle de dialogue, ou une seule par planche. Pas d'emoji dans l'image.`, 16)}
    </div>
    <div style="display: flex; flex-direction: column; gap: 16px; flex-grow: 1; min-width: 0">
      ${sousTitre('La typo : Shantell Sans')}
      ${para(`Une écriture au feutre, dessinée pour aller avec des gribouillis, lisible à 34 px sur un téléphone. Graisse 700 pour les textes des posts, 500 pour les cases de BD, l'italique pour une pensée.`, 15)}
      <div style="display: flex; flex-direction: column; gap: 10px; padding: 22px 26px; border: 4px solid ${ENCRE}; border-radius: 22px">
        ${exempleTexte('j\'pense à toi là', 54)}
        ${exempleTexte('t\'as encore oublié le pain...', 40, 500)}
        ${exempleTexte('(mais je dis rien)', 30, 400, true)}
        ${exempleTexte('ENVOIE ÇA À TA PERSONNE !!!', 34)}
      </div>
      ${sousTitre('Les formats')}
      ${para(`<strong>Le post :</strong> 1080 × 1350, un personnage ou les deux, une phrase. <strong>La BD :</strong> quatre cases en 2 × 2, bordées d'un trait, la chute dans la dernière. <strong>Le carrousel :</strong> une case par page, la première accroche, la dernière dit « envoie ça à ta personne ». <strong>Le reel :</strong> les mêmes dessins qui bougent.`, 15)}
      ${sousTitre('Pour l\'animation')}
      ${para(`Le personnage est un rig, pas une pile d'images : angle de rotation continu, poses en trois dimensions (une foulée s'écrit en profondeur), bras et pattes placés par des coordonnées, expressions qui se combinent avec tout. Une animation interpole l'angle, la position et la pose d'une image à l'autre, sans saut ; seul le trait est redessiné (nouvelle graine toutes les quatre images, à 24 images par seconde) pour garder la main qui tremble. Changer d'expression se fait sur une image, comme un clignement, c'est le code du dessin animé.`, 15)}
    </div>
  </div>`);

// ── 02 : toutes les expressions ─────────────────────────────────────────
{
  let corps = `${titre('86 expressions, et toutes se combinent avec les poses et les objets')}`;
  for (const fam of FAMILLES_EXPRESSIONS) {
    const liste = Object.entries(EXPRESSIONS).filter(([, e]) => e.famille === fam);
    corps += `<h2 style="margin: 14px 0 0; ${MAIN}; font-size: 26px; font-weight: 700">${esc(fam)}</h2>`;
    corps += grille(liste.map(([nom, e]) => cellule(perso({ perso: 'lui', expression: nom }, 190, '-30 -40 360 360'), e.libelle, nom)), 9, 8);
  }
  planche('02-expressions.dc.html', 'Les expressions', 1960, 3860, 0, 2580, corps);
}

// ── 03 : elle, avec le même système ─────────────────────────────────────
{
  const choix = ['content', 'joie', 'rire', 'amour', 'transi', 'bisou', 'timide', 'gene', 'surpris', 'choque', 'peur', 'triste', 'pleure', 'boude', 'colere', 'furieux', 'fatigue', 'dodo', 'gourmand', 'pensif', 'idee', 'determine', 'supplie', 'exaspere'];
  const corps = `${titre('Elle, avec les mêmes expressions')}${para(`Le même système, les cils et la fleur en plus. La fleur reste pendant le sommeil et la colère ; elle ne tombe que si une scène le raconte.`, 17)}` +
    grille(choix.map((nom) => cellule(perso({ perso: 'elle', expression: nom }, 200, '-30 -40 360 360'), EXPRESSIONS[nom].libelle)), 8, 8);
  planche('03-elle.dc.html', 'Elle', 1960, 1060, 2040, 2580, corps);
}

// ── 04 : les poses ──────────────────────────────────────────────────────
{
  const EXPR = { debout: 'content', marche: 'content', court: 'determine', sprint: 'effort', saut: 'joie', assis: 'zen', allonge: 'blase', tombe: 'choque', glisse: 'peur', rampe: 'fatigue', boule: 'timide', etire: 'fier', penche_g: 'curieux', penche_d: 'curieux', tremble: 'froid', vole: 'emerveille', pousse: 'effort', tire: 'effort', salue: 'desole', danse: 'chante', roule: 'mort_de_rire', visiere: 'pensif', plante: 'fier', porte_haut: 'triomphe', arrive: 'essouffle' };
  const LIB = { debout: 'debout', marche: 'marche', court: 'court', sprint: 'sprint', saut: 'saute', assis: 'assis', allonge: 'allongé', tombe: 'tombe', glisse: 'glisse', rampe: 'rampe', boule: 'en boule', etire: 'se grandit', penche_g: 'penché à gauche', penche_d: 'penché à droite', tremble: 'tremble', vole: 'vole', pousse: 'pousse', tire: 'tire', salue: 'salue, s\'incline', danse: 'danse', roule: 'roule', visiere: 'main en visière', plante: 'plante un panneau', porte_haut: 'porte à bout de bras', arrive: 'arrive en courant' };
  const corps = `${titre('25 poses : le corps, les pattes et les traits d\'action')}${para(`Une pose, c'est l'inclinaison du corps, la position des pattes et des bras, et les traits autour : lignes de vitesse, poussière, impact, vent. Toute expression se pose sur toute pose, et le personnage va vers la droite ; on le met en miroir pour l'autre sens. Vu de loin, il est simplement plus petit dans la scène.`, 17)}` +
    grille(LISTE_POSES.map((p, i) => cellule(perso({ perso: i % 3 === 2 ? 'elle' : 'lui', expression: EXPR[p] || 'content', pose: p }, 240, '-70 -60 440 380'), LIB[p] || p, EXPR[p])), 7, 8);
  planche('04-poses.dc.html', 'Les poses', 1960, 1400, 2040, 3760, corps);
}

// ── 11 : se tourner ─────────────────────────────────────────────────────
{
  const angles = [0, 30, 60, 90, 120, 150, 180, -150, -120, -90, -60, -30];
  const rang = (o, libelle) => `<div style="display: flex; flex-direction: column; gap: 4px"><p style="margin: 0; font-size: 16px; font-weight: 700">${esc(libelle)}</p>${grille(angles.map((a) => cellule(perso({ ...o, angle: a }, 150, '-40 -40 380 360'), `${a}°`)), 12, 4)}</div>`;
  const corps = `${titre('Se tourner : un angle continu, de face à de dos')}${para(`Chaque trait du personnage (yeux, bouche, joues, oreilles, bras, pattes, fleur, queue) a une place en trois dimensions sur le corps. Un seul nombre, l'angle, les projette : 0° de face, 90° de profil, 180° de dos, et toutes les valeurs entre. Ce qui passe derrière se cache, ce qui s'approche grossit un peu, une foulée s'écrit en profondeur. Pour l'animation, on interpole l'angle et la pose image par image, et le trait est redessiné avec une nouvelle graine toutes les quatre images pour qu'il vive.`, 17)}` +
    rang({ perso: 'lui', expression: 'content' }, 'lui, debout') + rang({ perso: 'elle', expression: 'joie', pose: 'marche' }, 'elle, qui marche') + rang({ perso: 'lui', expression: 'determine', pose: 'court' }, 'lui, qui court') + rang({ perso: 'elle', expression: 'pensif' }, 'elle, pensive');
  planche('11-tour.dc.html', 'Se tourner', 1960, 1080, 2040, 5280, corps);
}

// ── 05 : les duos ───────────────────────────────────────────────────────
{
  const corps = `${titre('À deux : 18 scènes')}${para(`Les scènes du compte se construisent comme ça : deux personnages, une expression chacun, au plus un meuble ou un objet. Le lit et le canapé sont vus de trois quarts, un peu par-dessus, pour la profondeur.`, 17)}` +
    grille(Object.keys(DUOS).map((nom) => cellule(duo(nom, 452, 297), DUOS[nom].titre)), 4, 14);
  planche('05-duos.dc.html', 'Les scènes à deux', 2000, 1900, 0, 6900, corps);
}

// ── 06 : les objets ─────────────────────────────────────────────────────
{
  const corps = `${titre('80 objets gribouillés')}${para(`Blancs dedans, le même trait dehors, les cœurs en rose. Un objet par image, deux pour une scène. Les meubles de scène (lit, canapé) sont dessinés à part, en perspective.`, 17)}` +
    grille(Object.keys(PROPS).map((nom) => cellule(objet(nom, 150), nom.replace(/_/g, ' '))), 10, 10);
  planche('06-objets.dc.html', 'Les objets', 1960, 1900, 2080, 6900, corps);
}

// ── 08 : une BD en quatre cases ─────────────────────────────────────────
const cadre = (contenu, w, h) => `<div style="position: relative; width: ${w}px; height: ${h}px; box-sizing: border-box; border: 5px solid ${ENCRE}; border-radius: 18px; overflow: hidden; background: #fff">${contenu}</div>`;
const legende = (t, taille = 34, haut = true) => `<p style="position: absolute; left: 24px; right: 24px; ${haut ? 'top: 22px' : 'bottom: 22px'}; margin: 0; ${MAIN}; font-weight: 500; font-size: ${taille}px; line-height: 1.15; text-align: center; color: ${ENCRE}">${esc(t)}</p>`;
const dansCase = (svg, x, y, w, h) => `<div style="position: absolute; left: ${x}px; top: ${y}px; width: ${w}px; height: ${h}px">${svg}</div>`;
{
  const w = 1080, h = 1350, cw = 468, ch = 520;
  const cases = [
    cadre(legende('t\'inquiète, je gère le dîner') + dansCase(perso({ perso: 'lui', expression: 'fier' }, 360, '-30 -20 360 340'), 54, 120, 360, 360), cw, ch),
    cadre(legende('...') + dansCase(perso({ perso: 'lui', expression: 'panique', signes: ['vapeur'] }, 360, '-30 -60 360 380'), 54, 110, 360, 360), cw, ch),
    cadre(legende('(elle a rien dit)') + dansCase(perso({ perso: 'elle', expression: 'blase', vers: -1 }, 360, '-30 -20 360 340'), 54, 120, 360, 360), cw, ch),
    cadre(legende('frites. comme d\'hab.') + dansCase(duo('frites', 500, 328), -16, 140, 500, 328), cw, ch),
  ];
  const corps = `<div style="display: flex; flex-direction: column; gap: 18px; height: 100%; justify-content: center">
    <p style="margin: 0 0 6px; ${MAIN}; font-weight: 700; font-size: 54px; line-height: 1.1; text-align: center">quand il dit « je gère »</p>
    <div style="display: grid; grid-template-columns: repeat(2, ${cw}px); gap: 28px; justify-content: center">${cases.join('')}</div>
    <p style="margin: 6px 0 0; ${MAIN}; font-weight: 500; font-size: 26px; text-align: center; color: ${GRIS}">envoie ça à ta personne</p>
  </div>`;
  planches['08-bd.dc.html'] = artboard('Une BD en quatre cases', w, h, corps).replace('padding: 40px 48px;', 'padding: 36px 40px;');
  boards['08-bd.dc.html'] = { x: 0, y: 9220, w, h, title: 'Une BD en quatre cases' };
  order.push('08-bd.dc.html');
}

// ── 09 : un carrousel de trois pages ────────────────────────────────────
{
  const w = 1080, h = 1350;
  const page = (contenu) => `<div style="position: relative; width: ${w}px; height: ${h}px; background: #fff; border-radius: 28px; overflow: hidden; flex-shrink: 0">${contenu}</div>`;
  const texte = (t, taille, top) => `<p style="position: absolute; left: 80px; right: 80px; top: ${top}px; margin: 0; ${MAIN}; font-weight: 700; font-size: ${taille}px; line-height: 1.15; text-align: center; color: ${ENCRE}">${esc(t)}</p>`;
  const petit = (t, bottom) => `<p style="position: absolute; left: 80px; right: 80px; bottom: ${bottom}px; margin: 0; ${MAIN}; font-weight: 500; font-size: 30px; line-height: 1.2; text-align: center; color: ${GRIS}">${esc(t)}</p>`;
  const p1 = page(texte('petit message pour toi', 80, 130) + dansCase(perso({ perso: 'lui', expression: 'timide' }, 760, '-30 -30 360 360'), 160, 360, 760, 760) + petit('(fais défiler)', 90));
  const p2 = page(texte('j\'aime bien quand t\'es là', 72, 120) + texte('même quand tu dis rien', 52, 330) + dansCase(duo('calin', 920, 604), 80, 500, 920, 604));
  const p3 = page(texte('envoie ça à ta personne', 80, 150) + dansCase(duo('main_dans_la_main', 920, 604), 80, 400, 920, 604) + petit('@lesmipaps', 90));
  const corps = `<div style="display: flex; gap: 60px; align-items: center; height: 100%">${p1}${p2}${p3}</div>`;
  planches['09-carrousel.dc.html'] = artboard('Un carrousel de trois pages', 3420, 1430, corps).replace('padding: 40px 48px;', 'padding: 40px 60px;').replace(`background: ${FOND};`, 'background: #efe9e3;');
  boards['09-carrousel.dc.html'] = { x: 1160, y: 9220, w: 3420, h: 1430, title: 'Un carrousel de trois pages' };
  order.push('09-carrousel.dc.html');
}

// ── 10 : un mini, le format sticker ─────────────────────────────────────
{
  const w = 1080, h = 1350;
  const corps = `<div style="position: relative; width: ${w}px; height: ${h}px">
    <p style="position: absolute; left: 80px; right: 80px; top: 150px; margin: 0; ${MAIN}; font-weight: 700; font-size: 84px; line-height: 1.1; text-align: center; color: ${ENCRE}">reviens vite stp</p>
    ${dansCase(perso({ perso: 'elle', expression: 'supplie' }, 820, '-40 -30 380 360'), 130, 380, 820, 820)}
  </div>`;
  planches['10-mini.dc.html'] = artboard('Un mini', w, h, corps).replace('padding: 40px 48px;', 'padding: 0;');
  boards['10-mini.dc.html'] = { x: 4660, y: 9220, w, h, title: 'Un mini, le format sticker' };
  order.push('10-mini.dc.html');
}

// ── l'index et les fichiers ─────────────────────────────────────────────
const index = {
  v: 3,
  createdOnFiles: { v: 1, at: '2026-10-08T09:40:00Z' },
  title: 'Les mipaps : le Gribouillou',
  launch: { view: 'canvas' },
  pages: [],
  boards,
  order,
  notes: {
    'rang-personnages': { x: 0, y: 820, text: 'Les personnages et la direction artistique', kind: 'title1', maxW: 3580 },
    'rang-expressions': { x: 0, y: 2320, text: 'Expressions, poses : tout se combine', kind: 'title1', maxW: 4000 },
    'rang-scenes': { x: 0, y: 6640, text: 'Les scènes à deux et les objets', kind: 'title1', maxW: 4040 },
    'rang-exemples': { x: 0, y: 8960, text: 'Trois exemples de posts, en français', kind: 'title1', maxW: 5740 },
  },
  designSystems: [],
};
fs.writeFileSync(path.join(PROJET, 'canvas.json'), JSON.stringify(index, null, 2));
for (const [nom, html] of Object.entries(planches)) fs.writeFileSync(path.join(PROJET, nom), html);
// un aperçu local : les planches les unes sous les autres
fs.writeFileSync(path.join(ICI, 'canevas', 'apercu.html'), `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Planches</title>${POLICES.replace(/&amp;/g, '&')}</head><body style="margin: 0; padding: 30px; background: #ebe6de; display: flex; flex-direction: column; gap: 40px; align-items: flex-start">${order.map((nom) => { const m = planches[nom].match(/<x-dc>([\s\S]*)<\/x-dc>/); return `<div class="planche" data-nom="${nom}">${m[1].replace(/<helmet>[\s\S]*?<\/helmet>/, '')}</div>`; }).join('')}</body></html>`);
console.log(order.length, 'planches,', Object.keys(planches).reduce((n, k) => n + planches[k].length, 0), 'octets');
