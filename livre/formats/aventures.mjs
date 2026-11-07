// Format B : « 100 aventures à deux », le livre souvenir. Carré de
// 8,5 pouces, intérieur couleur, papier blanc, environ 120 pages : la liste
// des 100 aventures, puis une page à remplir par aventure (date, lieu, notes,
// ce qu'on retiendra, une photo au format instantané). Chaque aventure dit
// ce qu'elle coûte, combien de temps elle prend et où elle se passe : les
// livres de rendez-vous qui ne le disent pas sont les plus mal notés.
import { t, mascotte, coeur, qr, fleur } from '../commun/outils.mjs';

// Catégories : couleur, nom, petit dessin au trait.
const CAT = {
  M: { nom: 'À la maison', c: '#e17398', p: '#fbe3ec', ico: '<path d="M4 11l8-7 8 7v9H4z"/><path d="M10 20v-5h4v5"/>' },
  D: { nom: 'Dehors', c: '#5fa058', p: '#e3f1e0', ico: '<path d="M12 3c3 2.6 5 5.6 5 8.6a5 5 0 0 1-10 0C7 8.6 9 5.6 12 3z"/><path d="M12 21v-7"/>' },
  B: { nom: 'Petit budget', c: '#d9a514', p: '#fdf1c9', ico: '<circle cx="12" cy="12" r="8"/><path d="M14.6 9.2a3 3 0 1 0 0 5.6M8.5 11h5M8.5 13.2h5"/>' },
  A: { nom: 'Grand frisson', c: '#7f4db3', p: '#ece2f6', ico: '<path d="M3 19l6-10 4 6 3-4 5 8z"/><path d="M9 9l1.6-2.6"/>' },
  R: { nom: 'Romantique', c: '#c43d6c', p: '#f9dce6', ico: '<path d="M12 19.5C6.4 15.3 3.3 12.2 3.3 8.3 3.3 5.6 5.4 3.6 8 3.6c1.7 0 3.1.9 4 2.2.9-1.3 2.3-2.2 4-2.2 2.6 0 4.7 2 4.7 4.7 0 3.9-3.1 7-8.7 11.2z"/>' },
  F: { nom: 'Fou rire', c: '#3a8fc0', p: '#ddeffa', ico: '<circle cx="12" cy="12" r="8.5"/><path d="M8.2 13.6c1 1.9 2.3 2.8 3.8 2.8s2.8-.9 3.8-2.8"/><path d="M9 9.6h.01M15 9.6h.01"/>' },
};
const icone = (k, taille = 11, couleur = null) => `<svg class="ico" viewBox="0 0 24 24" style="width:${taille}pt;height:${taille}pt" aria-hidden="true"><g fill="none" stroke="${couleur || CAT[k].c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${CAT[k].ico}</g></svg>`;
const COUT = ['Gratuit', '€', '€€', '€€€'];
const DESC = {
  M: 'Pour les soirs de semaine et les dimanches de pluie.',
  D: 'Un parc, une colline, une rue inconnue : il suffit de sortir.',
  B: 'Gratuit ou presque, la preuve que ça ne coûte pas grand-chose.',
  A: "Celles qu'on raconte encore des années après.",
  R: 'Les moments tendres, ceux qui se font à deux et pas autrement.',
  F: 'Pour rire de vous, et un peu des autres aussi.',
};

// [titre, catégorie, coût] : les cent aventures, de la soirée canapé au grand frisson.
const AVENTURES = [
  ['Refaire notre premier rendez\u2011vous', 'R', 2], ["Cuisiner le plat préféré de l'autre", 'M', 1], ['Regarder le lever du soleil ensemble', 'D', 0],
  ['Une soirée entière sans téléphone', 'M', 0], ['Pique-niquer au parc avec un vrai panier', 'D', 1], ['Un karaoké à deux dans le salon', 'F', 0],
  ['Visiter une ville à moins de 100 km', 'A', 2], ['Un dîner aux chandelles un mardi soir', 'R', 1], ['Une cabane de draps pour y regarder un film', 'M', 0],
  ['Prendre un train sans savoir où descendre', 'A', 2], ['Écrire chacun une lettre à ouvrir dans cinq ans', 'R', 0], ["Cuisiner un plat d'un pays où on n'est jamais allés", 'M', 1],
  ['Un concours de grimaces en photo', 'F', 0], ['Un petit-déjeuner dehors, très tôt', 'D', 1], ['Chiner dans un vide-grenier avec 10 € chacun', 'B', 1],
  ['Apprendre une danse avec un tuto vidéo', 'F', 0], ['Dormir à la belle étoile', 'A', 0], ["S'offrir un cadeau à moins de 5 €", 'B', 1],
  ['Planter quelque chose et le garder en vie', 'M', 1], ["Un marathon de films d'une même saga", 'M', 0], ["Le concert d'un groupe qu'on ne connaît pas", 'A', 2],
  ['Regarder les étoiles loin de la ville', 'R', 0], ['Recréer une photo de nous du début', 'F', 0], ['Une balade à vélo', 'D', 0],
  ["Une journée à dire oui à tout ce que l'autre propose", 'F', 1], ['Écrire une chanson ridicule sur nous deux', 'F', 0], ['Prendre un cours ensemble', 'A', 2],
  ['Faire un escape game', 'A', 2], ["Un brunch maison qui dure jusqu'à midi", 'M', 1], ['Se perdre exprès dans un quartier inconnu', 'D', 0],
  ["Masser l'autre sans rien attendre en retour", 'R', 0], ['Partir en week-end avec un seul sac à dos', 'A', 2], ['Une soirée jeux de société', 'M', 0],
  ['Regarder la pluie tomber sous une couverture', 'R', 0], ['Une bataille de boules de neige (ou d\'eau)', 'F', 0], ['Monter un meuble en kit sans se disputer', 'F', 1],
  ['Photographier le même lieu, chacun de son côté', 'B', 0], ["Au musée, choisir l'œuvre préférée de l'autre", 'B', 1], ['Danser un slow dans la cuisine', 'R', 0],
  ['Commander au hasard au restaurant', 'F', 2], ['Une randonnée avec un vrai sommet au bout', 'D', 0], ["Se raconter nos souvenirs d'enfance", 'R', 0],
  ['Dormir dans un endroit insolite', 'A', 3], ['Un tour de manège comme des enfants', 'F', 1], ['Une soirée à thème rien que pour nous deux', 'M', 1],
  ['Le coucher du soleil depuis un toit ou une colline', 'R', 0], ['Des crêpes avec une garniture inventée', 'M', 1], ['Une carte postale à nos futurs nous', 'B', 1],
  ['Une journée entière en pyjama', 'M', 0], ["Écrire nos dix rêves, en réaliser un dans l'année", 'R', 1], ["Apprendre dix mots d'une langue inconnue", 'B', 0],
  ['Une journée de bénévolat ensemble', 'B', 0], ['Se baigner dans un lac ou la mer hors saison', 'A', 0], ['Un road trip avec une playlist faite à deux', 'A', 2],
  ['Un dîner où chacun cuisine un plat en secret', 'M', 1], ["Une nuit à l'hôtel dans notre propre ville", 'R', 3], ['Une course en sac, comme en maternelle', 'F', 0],
  ['Lire le même livre en même temps', 'M', 1], ['Une séance photo déguisés', 'F', 1], ['Assister à un lever de lune', 'D', 0],
  ["Le match d'un sport qu'on ne comprend pas", 'F', 2], ["Cuisiner ce qu'on trouve au marché", 'B', 1], ["Écrire 20 choses qu'on aime chez l'autre", 'R', 0],
  ['Un week-end sans rien prévoir', 'M', 0], ['Des tatouages éphémères assortis', 'F', 1], ['Une soirée « on s\'habille chic » à la maison', 'R', 0],
  ['Monter le plus haut possible dans une ville', 'D', 1], ['Fabriquer quelque chose de nos mains', 'M', 1], ["Le film préféré de l'autre, sans râler", 'M', 0],
  ["Une chasse au trésor l'un pour l'autre", 'F', 0], ['Le test de couple de Quiz Couple, et le refaire dans un an', 'M', 0], ['Du kayak, du canoë ou du paddle', 'A', 2],
  ['Aller à la fête foraine', 'F', 2], ['Le petit-déjeuner au lit', 'R', 1], ["Une journée où l'autre décide de tout", 'F', 1],
  ["Un baptême de l'air (montgolfière, ULM...)", 'A', 3], ["Retourner là où on s'est rencontrés", 'R', 1], ['Chanter au karaoké, en public cette fois', 'F', 1],
  ['Un pique-nique sous la pluie', 'F', 0], ['Cacher des mots doux dans la maison', 'R', 0], ['Visiter une ferme, un verger ou un vignoble', 'D', 1],
  ['Un feu de camp et des chamallows grillés', 'D', 1], ['Une journée sans dépenser un seul euro', 'B', 0], ['Organiser un dîner pour nos amis', 'M', 2],
  ['Une sieste dans un hamac', 'R', 0], ['Tenter une recette ratée d\'avance', 'F', 1], ["Une pièce de théâtre ou un spectacle d'impro", 'A', 2],
  ['Une photo de nous au même endroit à chaque saison', 'D', 0], ['Une balade de nuit à la lampe frontale', 'A', 0], ['Inventer notre cocktail (ou notre mocktail)', 'M', 1],
  ["Une journée sans écran, que du papier", 'B', 0], ['Danser sous la pluie', 'F', 0], ['Visiter une ville la nuit', 'D', 0],
  ['Un album photo papier de notre année', 'M', 2], ["Apprendre à l'autre un truc qu'on sait faire", 'B', 0], ['Un petit-déjeuner surprise un jour de semaine', 'R', 1],
  ["Un pays dont on ne parle pas la langue", 'A', 3], ['Un concert dans le salon avec nos chansons', 'M', 0], ['Écrire ensemble la suite de notre histoire', 'R', 0],
  ['Choisir ensemble nos 100 prochaines aventures', 'R', 0],
];

// Le détail des pages d'exemple.
const DETAILS = {
  1: { duree: '3 h', ou: 'Là où tout a commencé', idee: "Même endroit, même heure si possible, et chacun essaie de remettre une tenue de ce jour-là. Celui qui se souvient le mieux de la conversation gagne le dessert.", bonus: "Racontez chacun ce que vous avez pensé de l'autre ce soir-là, sans rien cacher." },
  2: { duree: '2 h', ou: 'À la maison', idee: "Chacun cuisine le plat préféré de l'autre, en secret et sans demander la recette. Ensuite, on goûte, on compare avec l'original et on se note sur dix.", bonus: "Demandez la recette de famille à un parent de l'autre. Ça marche à tous les coups." },
  27: { duree: '2 h', ou: 'Dehors', idee: "Poterie, cuisine, salsa, escalade, peu importe : choisissez un truc que ni l'un ni l'autre ne sait faire. C'est beaucoup plus drôle quand vous êtes nuls tous les deux.", bonus: "Gardez l'objet raté que vous aurez fabriqué. Dans dix ans, il sera précieux." },
  28: { duree: '1 h 30', ou: 'Dehors', idee: "Soixante minutes pour sortir d'une pièce, à deux. On voit très vite qui panique et qui garde la tête froide !", bonus: 'Notez qui a trouvé le plus d\'indices. Revanche dans six mois ?' },
  70: { duree: '1 h', ou: 'À la maison ou dans le quartier', idee: "Chacun prépare cinq indices pour l'autre, cachés dans la maison ou dans le quartier. Au bout, un petit trésor : un mot, un gâteau, deux places de cinéma...", bonus: "Celui qui a mis le plus de temps à trouver prépare le petit-déjeuner." },
  71: { duree: '15 min', ou: 'Sur votre canapé', idee: "Faites le test de couple sur quiz-couple.com, chacun sur son téléphone ou sur le même, et notez votre score ici. Dans un an, jour pour jour, refaites-le et comparez.", bonus: 'Écrivez la question qui vous a le plus surpris.', test: true },
};

const css = `
.fmt-aventures { --c-ligne: #c8b3bd; }
.fmt-aventures .feuille { background: var(--c-papier); }
.tag { display: inline-flex; align-items: center; gap: 4pt; padding: 2.5pt 8pt; border-radius: 99pt; font-family: var(--f-titre); font-weight: 600; font-size: 8pt; white-space: nowrap; background: #fff; border: 0.8pt solid #ead9e0; }
.tags { display: flex; flex-wrap: wrap; gap: 4pt; }
.av { flex: 1; display: grid; grid-template-columns: 1fr 2.6in; gap: 0.3in; }
.feuille--verso .av { grid-template-columns: 2.6in 1fr; }
.feuille--verso .av .av-photo { order: -1; }
.av-texte { display: flex; flex-direction: column; gap: 9pt; min-width: 0; }
.av-num { font-family: var(--f-titre); font-weight: 700; font-size: 64pt; line-height: 0.8; letter-spacing: -0.02em; }
.av-titre { font-family: var(--f-titre); font-weight: 600; font-size: 23pt; line-height: 1.04; text-wrap: balance; }
.av-idee { font-size: 10.6pt; line-height: 1.52; }
.av-champ { display: grid; grid-template-columns: auto 1fr; gap: 6pt; align-items: end; font-family: var(--f-titre); font-weight: 600; font-size: 9pt; color: var(--c-encre-douce); }
.av-champ .ligne { height: 0.28in; }
.av-retenir h4 { font-family: var(--f-titre); font-weight: 600; font-size: 10pt; margin-bottom: 1pt; display: flex; align-items: center; gap: 5pt; }
.av-retenir .ligne { height: 0.285in; }
.av-retenir + .av-retenir { margin-top: -2pt; }
.souvenir { width: 2.45in; height: 1.55in; border: 1.2pt dashed #cbb4bf; border-radius: 8pt; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3pt; text-align: center; color: #a48d98; font-size: 7.6pt; line-height: 1.3; padding: 8pt; background: rgba(255,255,255,.55); }
.souvenir b { font-family: var(--f-titre); font-weight: 600; font-size: 9pt; color: #8f7783; }
.cats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8pt; margin-top: 12pt; }
.cat { border-radius: 12pt; padding: 9pt 10pt; display: flex; flex-direction: column; gap: 4pt; }
.cat h4 { font-family: var(--f-titre); font-weight: 600; font-size: 11pt; display: flex; align-items: center; gap: 5pt; }
.cat p { font-size: 8.4pt; line-height: 1.38; }
.cat .compte { font-family: var(--f-titre); font-weight: 600; font-size: 8pt; opacity: .75; }
.av-bonus { margin-top: 2pt; border-radius: 10pt; padding: 7pt 10pt; font-size: 8.8pt; line-height: 1.4; display: flex; gap: 7pt; align-items: flex-start; }
.av-bonus b { font-family: var(--f-titre); font-weight: 600; }
.av-photo { display: flex; flex-direction: column; gap: 12pt; align-items: center; }
.cadre { position: relative; width: 2.45in; height: 3.75in; background: #fff; border-radius: 4pt; padding: 0.11in 0.11in 0.42in; transform: rotate(var(--rot, 2deg)); box-shadow: 0 0 0 0.8pt #e6d5dc; }
.cadre-in { width: 100%; height: 100%; border: 1.2pt dashed #cbb4bf; border-radius: 2pt; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4pt; text-align: center; color: #a48d98; font-size: 7.6pt; line-height: 1.3; padding: 8pt; }
.cadre-in b { font-family: var(--f-titre); font-weight: 600; font-size: 9pt; color: #8f7783; }
.cadre .scotch { position: absolute; width: 0.9in; height: 0.26in; opacity: 0.75; }
.cadre .legende { position: absolute; left: 0; right: 0; bottom: 0.1in; text-align: center; font-family: var(--f-plume); font-style: italic; font-size: 9pt; color: #a48d98; }
.notes { width: 100%; display: flex; flex-direction: column; gap: 5pt; background: #fff; border-radius: 10pt; padding: 7pt 9pt; box-shadow: 0 0 0 0.8pt #ead9e0; }
.notes h4 { font-family: var(--f-titre); font-weight: 600; font-size: 9pt; }
.note-ligne { display: flex; align-items: center; justify-content: space-between; gap: 6pt; font-size: 8.4pt; }
.note-ligne .qui { display: flex; align-items: center; gap: 4pt; font-family: var(--f-titre); font-weight: 600; }
.note-ligne .coeurs { display: flex; gap: 2.5pt; }
.liste { display: grid; grid-template-columns: 1fr 1fr; column-gap: 0.25in; }
.liste-item { display: grid; grid-template-columns: 10pt 15pt 1fr auto; gap: 4pt; align-items: center; font-size: 8.5pt; line-height: 1.15; padding: 3.3pt 0; border-bottom: 0.6pt solid #eddde4; }
.liste-item .n { font-family: var(--f-titre); font-weight: 600; color: var(--c-encre-douce); font-size: 7.6pt; text-align: right; }
.liste-item .case { width: 8.5pt; height: 8.5pt; border: 1pt solid #9f8a95; border-radius: 2pt; background: #fff; }
.liste-item .cout { font-family: var(--f-titre); font-weight: 600; font-size: 7pt; color: var(--c-encre-douce); }
.page-tete { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 9pt; }
.page-tete h2 { font-family: var(--f-titre); font-weight: 600; font-size: 22pt; line-height: 1; }
.page-tete .etiquette { color: var(--c-rose-texte); display: block; margin-bottom: 3pt; }
.legende-cats { display: flex; flex-wrap: wrap; gap: 5pt; justify-content: flex-end; max-width: 3.9in; }
.mode { display: grid; grid-template-columns: 1fr 1fr; gap: 12pt 18pt; margin-top: 6pt; }
.mode-bloc { background: #fff; border-radius: 12pt; padding: 10pt 12pt; box-shadow: 0 0 0 0.8pt #ead9e0; }
.mode-bloc h3 { font-family: var(--f-titre); font-weight: 600; font-size: 12pt; margin-bottom: 3pt; display: flex; align-items: center; gap: 6pt; }
.mode-bloc p { font-size: 9.2pt; line-height: 1.45; }
.mode-n { width: 20pt; height: 20pt; border-radius: 99pt; background: var(--c-rose); color: #2a1e36; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; font-size: 10pt; }
.titre-av { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 12pt; }
.titre-av h1 { font-family: var(--f-titre); font-weight: 700; font-size: 40pt; line-height: 0.95; }
.titre-av h1 b { color: var(--c-rose-texte); font-size: 64pt; display: block; }
.titre-av .noms { display: grid; grid-template-columns: 2.2in auto 2.2in; gap: 8pt; align-items: end; margin-top: 10pt; }
.titre-av .noms .ligne { height: 0.36in; }
.titre-av .et { font-family: var(--f-plume); font-style: italic; font-size: 18pt; color: var(--c-rose-texte); }
.chemin { display: flex; align-items: flex-end; justify-content: center; gap: 0.15in; }
.palmares { display: flex; flex-direction: column; gap: 9pt; }
.podium { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8pt; }
.podium .marche { background: #fff; border-radius: 10pt; padding: 8pt; box-shadow: 0 0 0 0.8pt #ead9e0; display: flex; flex-direction: column; gap: 4pt; min-height: 1.15in; }
.podium .rang { font-family: var(--f-titre); font-weight: 700; font-size: 20pt; color: var(--c-rose-texte); line-height: 1; }
.podium .ligne { height: 0.24in; }
.encart { background: #fff; border-radius: 12pt; padding: 9pt 12pt; box-shadow: 0 0 0 0.8pt #ead9e0; }
.encart h3 { font-family: var(--f-titre); font-weight: 600; font-size: 12pt; margin-bottom: 2pt; display: flex; align-items: center; gap: 6pt; }
.encart .ligne { height: 0.26in; }
.vierge-num { font-family: var(--f-titre); font-weight: 700; font-size: 58pt; line-height: 0.8; color: #e8d6de; }
.copy { flex: 1; display: flex; flex-direction: column; justify-content: flex-end; gap: 6pt; font-size: 7.6pt; line-height: 1.5; color: var(--c-encre-douce); max-width: 4.6in; }
.copy b { color: var(--c-encre); }
.score-test { display: grid; grid-template-columns: 1fr 1fr; gap: 8pt; }
.score-test > div { background: #fff; border-radius: 10pt; padding: 7pt 9pt; box-shadow: 0 0 0 0.8pt #ead9e0; font-family: var(--f-titre); font-weight: 600; font-size: 9pt; color: var(--c-encre-douce); }
.score-test .pct { font-size: 22pt; color: var(--c-rose-texte); line-height: 1.1; }
`;

const scotch = (couleur, style) => `<svg class="scotch" viewBox="0 0 90 26" style="${style}" preserveAspectRatio="none" aria-hidden="true"><path d="M3 4 L87 1 L86 22 L4 25 Z" fill="${couleur}"/><path d="M3 4 l3 3 -2 3 3 3 -3 3 3 3 -3 3 M87 1 l-3 3 2 3 -3 3 3 3 -3 3 3 3" fill="none" stroke="${couleur}" stroke-width="2"/></svg>`;

function cadrePhoto(cat, rot = 2) {
  return `<div class="cadre peut-deborder" style="--rot:${rot}deg">${scotch(CAT[cat].p.replace('#', '#') === CAT[cat].p ? CAT[cat].c : CAT[cat].c, `top:-0.12in;left:50%;transform:translateX(-50%) rotate(${-rot * 1.5}deg);opacity:.55`)}
<div class="cadre-in"><b>${t('Collez votre photo ici')}</b>${t('format instantané (mini) ou une photo de téléphone découpée')}</div>
<div class="legende">${t('nous, ce jour-là')}</div></div>`;
}

const notes = () => `<div class="notes"><h4>${t('Votre note')}</h4>
<div class="note-ligne"><span class="qui">${pionMini('rose')} ${t('la rose')}</span><span class="coeurs">${coeur(11, { couleur: '#c9557c' }).repeat(5)}</span></div>
<div class="note-ligne"><span class="qui">${pionMini('violet')} ${t('le violet')}</span><span class="coeurs">${coeur(11, { couleur: '#7f4db3' }).repeat(5)}</span></div></div>`;

function pionMini(qui) {
  return qui === 'rose'
    ? '<svg viewBox="0 0 20 20" style="width:9pt;height:9pt" aria-hidden="true"><circle cx="10" cy="10" r="8" fill="#e17398" stroke="#4a3540" stroke-width="2"/></svg>'
    : '<svg viewBox="0 0 16 22" style="width:7.5pt;height:10pt" aria-hidden="true"><rect x="1.5" y="1.5" width="13" height="19" rx="6.5" fill="#7f4db3" stroke="#4a3540" stroke-width="2"/></svg>';
}

function pageAventure(n, folio) {
  const [titre, cat, cout] = AVENTURES[n - 1];
  const d = DETAILS[n];
  const C = CAT[cat];
  const photo = d.test
    ? `<div class="av-photo"><div class="encart" style="width:100%;text-align:center;display:flex;flex-direction:column;align-items:center;gap:6pt;padding:12pt">${qr('https://quiz-couple.com/tester-son-couple/')}<div style="font-family:var(--f-titre);font-weight:600;font-size:9.5pt">${t('Le test de couple')}</div><div style="font-size:8pt;color:var(--c-encre-douce)">quiz-couple.com</div></div>
<div class="score-test" style="width:100%"><div>${t('Notre score')}<div class="pct">___ %</div>${t('le ___ / ___ / ____')}</div><div>${t('Un an après')}<div class="pct">___ %</div>${t('le ___ / ___ / ____')}</div></div>${notes()}</div>`
    : `<div class="av-photo">${cadrePhoto(cat, folio % 2 ? 2.2 : -2.2)}${notes()}<div class="souvenir"><b>${t('Le petit souvenir')}</b>${t('un ticket, une étiquette, une fleur séchée... à coller ici')}</div></div>`;
  return {
    folio, titre: `Aventure ${n}`,
    html: `<div class="av">
<div class="av-texte">
  <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:8pt"><div class="av-num" style="color:${C.c}">${String(n).padStart(2, '0')}</div>${n === 71 ? mascotte('violet', 'clin' === 'x' ? 'repos' : 'repos', { hauteur: '0.75in', extra: { yeux: 'clin' } }) : ''}</div>
  <div class="tags"><span class="tag" style="background:${C.p};border-color:${C.p}">${icone(cat, 10)} ${t(C.nom)}</span><span class="tag">${t(COUT[cout])}</span><span class="tag">${t(d.duree)}</span><span class="tag">${t(d.ou)}</span></div>
  <div class="av-titre">${t(titre)}</div>
  <div class="av-idee">${t(d.idee)}</div>
  <div class="av-champ"><span>${t('Fait le')}</span><div class="ligne"></div></div>
  <div class="av-champ"><span>${t('Où ?')}</span><div class="ligne"></div></div>
  <div class="av-retenir"><h4>${pionMini('rose')} ${t('Ce que la rose retiendra')}</h4><div class="ligne"></div><div class="ligne"></div><div class="ligne"></div><div class="ligne"></div></div>
  <div class="av-retenir"><h4>${pionMini('violet')} ${t('Ce que le violet retiendra')}</h4><div class="ligne"></div><div class="ligne"></div><div class="ligne"></div><div class="ligne"></div></div>
  <div class="av-bonus" style="background:${C.p}">${icone(cat, 13)}<div><b>${t('Le bonus :')}</b> ${t(d.bonus)}</div></div>
</div>
${photo}
</div>`,
  };
}

function itemListe(n) {
  const [titre, cat, cout] = AVENTURES[n - 1];
  return `<div class="liste-item"><span class="case"></span><span class="n">${n}</span><span>${icone(cat, 8)} ${t(titre)}</span><span class="cout">${t(COUT[cout])}</span></div>`;
}

const legendeCats = `<div class="legende-cats">${Object.keys(CAT).map((k) => `<span class="tag" style="background:${CAT[k].p};border-color:${CAT[k].p}">${icone(k, 9)} ${t(CAT[k].nom)}</span>`).join('')}</div>`;

const pages = [
  {
    folio: 1, titre: 'Page de titre', sansFolio: true,
    html: `<div class="titre-av">
  <div class="chemin">${mascotte('rose', 'joie', { hauteur: '1.35in' })}${mascotte('violet', 'salut', { hauteur: '1.5in' })}</div>
  <h1><b>100</b>${t('aventures à deux')}</h1>
  <p class="etiquette" style="color:var(--c-violet-texte)">${t('Le livre de nos souvenirs')}</p>
  <div class="noms"><div class="ligne"></div><span class="et">&amp;</span><div class="ligne"></div></div>
  <p style="font-family:var(--f-titre);font-weight:500;font-size:10.5pt;color:var(--c-encre-douce);margin-top:6pt">${t('Notre première aventure : le ___ / ___ / ______')}</p>
</div>`,
  },
  {
    folio: 2, titre: 'Mentions', sansFolio: true,
    html: `<div class="copy"><p><b>${t('100 aventures à deux')}</b><br>${t('Un livre de Quiz Couple, quiz-couple.com')}</p>
<p>${t('© 2026 Quiz Couple · Visibilitea, entreprise individuelle, Strasbourg. Tous droits réservés.')}</p>
<p>${t("Les prix et les durées sont indicatifs. Certaines aventures demandent un peu de prudence (baignade, randonnée, nuit dehors) : renseignez-vous sur place, et faites-les quand vous le sentez.")}</p>
<p>${t('ISBN : à venir · Imprimé à la demande par Amazon KDP.')}</p></div>`,
  },
  {
    folio: 3, titre: 'Comment ça marche',
    html: `<div class="page-tete"><div><span class="etiquette">${t('Avant de partir')}</span><h2>${t('Comment ça marche')}</h2></div>${mascotte('rose', 'salut', { hauteur: '0.85in' })}</div>
<div class="mode">
  <div class="mode-bloc"><h3><span class="mode-n">1</span>${t("Il n'y a pas d'ordre")}</h3><p>${t("Ouvrez une page au hasard, ou choisissez ensemble dans la liste. Il y a des aventures pour un soir de semaine, pour un dimanche pluvieux et pour les vacances.")}</p></div>
  <div class="mode-bloc"><h3><span class="mode-n">2</span>${t('Regardez les étiquettes')}</h3><p>${t("Chaque aventure dit ce qu'elle coûte (de « gratuit » à « €€€ »), combien de temps elle prend et où elle se passe. Pratique pour choisir selon la soirée.")}</p></div>
  <div class="mode-bloc"><h3><span class="mode-n">3</span>${t('Vivez-la, puis remplissez')}</h3><p>${t("La date, l'endroit, une note chacun, ce que vous voulez retenir, et une photo. Le cadre fait la taille d'une photo instantanée format mini, mais une photo de téléphone découpée marche aussi.")}</p></div>
  <div class="mode-bloc"><h3><span class="mode-n">4</span>${t('Ajoutez les vôtres')}</h3><p>${t("À la fin du livre, dix pages vierges attendent vos propres idées. Et le palmarès, pour élire vos cinq meilleures aventures de l'année.")}</p></div>
</div>
<div style="margin-top:auto"><span class="etiquette" style="color:var(--c-encre-douce)">${t('Les six familles d\'aventures')}</span>
<div class="cats">${Object.keys(CAT).map((k) => `<div class="cat" style="background:${CAT[k].p}"><h4>${icone(k, 13)} ${t(CAT[k].nom)}</h4><p>${t(DESC[k])}</p><span class="compte" style="color:${CAT[k].c}">${AVENTURES.filter((a) => a[1] === k).length} ${t('aventures')}</span></div>`).join('')}</div></div>`,
  },
  {
    folio: 4, titre: 'La liste (1 à 50)',
    html: `<div class="page-tete"><div><span class="etiquette">${t('Cochez au fur et à mesure')}</span><h2>${t('Nos 100 aventures')}</h2></div></div>
<div class="liste">${Array.from({ length: 50 }, (_, i) => itemListe(i + 1)).join('')}</div>`,
  },
  {
    folio: 5, titre: 'La liste (51 à 100)',
    html: `<div class="page-tete"><div><span class="etiquette">${t('La suite')}</span><h2>${t('Et ce n\'est pas fini...')}</h2></div>${legendeCats}</div>
<div class="liste">${Array.from({ length: 50 }, (_, i) => itemListe(i + 51)).join('')}</div>`,
  },
  pageAventure(1, 6),
  pageAventure(2, 7),
  pageAventure(27, 32),
  pageAventure(28, 33),
  pageAventure(70, 75),
  pageAventure(71, 76),
  {
    folio: 106, titre: 'Une aventure à vous',
    html: `<div class="av">
<div class="av-photo">${cadrePhoto('M', -2.2)}${notes()}</div>
<div class="av-texte">
  <div class="vierge-num">101</div>
  <div class="tags"><span class="tag">${t('Notre idée à nous')}</span><span class="tag">${t('Coût : ____')}</span><span class="tag">${t('Durée : ____')}</span></div>
  <div class="av-champ"><span>${t("L'aventure")}</span><div class="ligne"></div></div>
  <div class="av-champ"><span>${t("L'idée vient de")}</span><div class="ligne"></div></div>
  <div class="av-champ"><span>${t('Fait le')}</span><div class="ligne"></div></div>
  <div class="av-champ"><span>${t('Où ?')}</span><div class="ligne"></div></div>
  <div class="av-retenir"><h4>${t("Ce qu'on retiendra")}</h4><div class="ligne"></div><div class="ligne"></div><div class="ligne"></div><div class="ligne"></div><div class="ligne"></div></div>
</div></div>`,
  },
  {
    folio: 117, titre: 'Le palmarès',
    html: `<div class="page-tete"><div><span class="etiquette">${t('À remplir une fois par an')}</span><h2>${t('Le palmarès')}</h2></div>${mascotte('violet', 'joie', { hauteur: '0.95in' })}</div>
<div class="palmares">
  <div class="podium">${[1, 2, 3, 4, 5].map((r) => `<div class="marche"><div class="rang">${r}</div><div class="ligne"></div><div class="ligne"></div></div>`).join('')}</div>
  <div class="encart"><h3>${icone('R', 12)} ${t("Celle qu'on refera l'an prochain")}</h3><div class="ligne"></div><div class="ligne"></div></div>
  <div class="encart"><h3>${icone('F', 12)} ${t("Celle qu'on ne refera jamais (mais on en rit encore)")}</h3><div class="ligne"></div><div class="ligne"></div></div>
  <div class="encart"><h3>${icone('A', 12)} ${t('Notre compteur')}</h3><p style="font-size:9.4pt;margin-top:3pt">${t('Aventures vécues cette année : ______ / 100 · Photos collées : ______ · Fous rires : beaucoup trop')}</p></div>
  <div class="souvenir" style="width:100%;height:1.6in"><b>${t("La photo de l'année")}</b>${t('celle que vous accrocheriez au frigo')}</div>
</div>`,
  },
  {
    folio: 120, titre: 'La suite', sansFolio: true,
    html: `<div class="titre-av">
  ${mascotte('rose', 'amoureux', { hauteur: '1.1in' })}
  <h1 style="font-size:28pt">${t('Cent aventures plus tard...')}</h1>
  <p style="font-size:10.5pt;line-height:1.5;max-width:4.5in">${t("Il vous faut de nouvelles idées ? Sur quiz-couple.com, des dizaines de tests et de jeux à faire à deux, gratuitement, pour les soirs où vous restez à la maison.")}</p>
  ${qr('https://quiz-couple.com/')}
  <div style="font-family:var(--f-titre);font-weight:600;font-size:13pt;color:var(--c-rose-texte)">quiz-couple.com</div>
</div>`,
  },
];

// ── La couverture ────────────────────────────────────────────────────────
const couverture = {
  fond: '#fcf6f3',
  fondDos: '#fcf6f3',
  fondTranche: '#e17398',
  css: `
.cfa { position: absolute; inset: 0; }
.cfa .marque { position: absolute; top: 0.55in; left: 0.375in; display: flex; align-items: center; gap: 6pt; font-family: var(--f-titre); font-weight: 600; font-size: 12pt; color: #2b1722; }
.cfa .marque img { width: 0.36in; height: 0.36in; }
.cfa h1 { position: absolute; top: 1.05in; left: 0.375in; right: 0.6in; font-family: var(--f-titre); font-weight: 700; line-height: 0.9; color: #2b1722; }
.cfa h1 b { display: block; font-size: 112pt; color: #e17398; letter-spacing: -0.03em; line-height: 0.82; -webkit-text-stroke: 3pt #2b1722; paint-order: stroke fill; }
.cfa h1 span { display: block; font-size: 38pt; margin-top: 4pt; }
.cfa .sous { position: absolute; top: 3.62in; left: 0.375in; width: 3.6in; font-size: 11.5pt; line-height: 1.4; font-weight: 600; color: #6834b2; }
.cfa .route { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.cfa .photo { position: absolute; background: #fff; padding: 6pt 6pt 18pt; box-shadow: 0 0 0 1.2pt #2b1722; border-radius: 3pt; }
.cfa .photo .img { width: 100%; height: 100%; border-radius: 2pt; overflow: hidden; }
.cfa .persos { position: absolute; right: 0.6in; bottom: 0.55in; display: flex; align-items: flex-end; gap: 0.12in; }
.cfa .pastille { position: absolute; right: 0.55in; top: 0.5in; width: 1.05in; height: 1.05in; border-radius: 50%; background: #f7cf5b; color: #2b1722; font-family: var(--f-titre); font-weight: 700; font-size: 9.5pt; line-height: 1.05; text-align: center; display: flex; align-items: center; justify-content: center; transform: rotate(10deg); box-shadow: 0 0 0 1.4pt #2b1722; }
.cda { position: absolute; inset: 0; color: #2b1722; }
.cda .col { position: absolute; top: 0.6in; bottom: 0.6in; left: 0.6in; right: 0.55in; display: flex; flex-direction: column; gap: 16pt; }
.cda .accroche { font-family: var(--f-titre); font-weight: 700; font-size: 25pt; line-height: 1.04; text-wrap: balance; }
.cda .texte { font-size: 11.4pt; line-height: 1.55; }
.cda ul { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 7pt; font-size: 11pt; line-height: 1.38; }
.cda li { display: flex; gap: 8pt; align-items: flex-start; }
.cda li .coeur { margin-top: 3pt; }
.cda .citation { font-family: var(--f-plume); font-style: italic; font-size: 16pt; color: #b12559; }
.cda .checklist { background: #fff; border-radius: 14pt; padding: 12pt 14pt; box-shadow: 0 0 0 1.2pt #2b1722; transform: rotate(-1.5deg); display: flex; flex-direction: column; gap: 7pt; width: 4.4in; }
.cda .checklist div { display: flex; align-items: center; gap: 8pt; font-family: var(--f-titre); font-weight: 600; font-size: 11.5pt; }
.cda .checklist i { width: 12pt; height: 12pt; border: 1.6pt solid #2b1722; border-radius: 3pt; flex: none; display: inline-flex; align-items: center; justify-content: center; font-style: normal; font-size: 10pt; color: #c9557c; }
.cda .checklist s { color: #9d8a94; text-decoration-thickness: 1.4pt; }
.cda .bas { margin-top: auto; display: flex; align-items: flex-end; gap: 10pt; font-family: var(--f-titre); font-weight: 600; font-size: 12pt; }
.cta { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
.cta .vertical { transform: rotate(90deg); white-space: nowrap; color: #2a1e36; font-family: var(--f-titre); font-weight: 600; font-size: 10pt; display: flex; align-items: center; gap: 12pt; }
`,
  face: `<div class="cfa">
  <svg class="route" viewBox="0 0 850 925" preserveAspectRatio="none" aria-hidden="true"><path d="M-10 520 C 120 470, 230 610, 360 560 S 560 420, 640 520 S 760 700, 870 640" fill="none" stroke="#c9557c" stroke-width="5" stroke-dasharray="2 16" stroke-linecap="round"/></svg>
  <div class="marque"><img src="../../../reseaux/studio/public/marque/logo-quiz-couple-180.png" alt="">Quiz Couple</div>
  <div class="pastille"><div>${t('une page')}<br>${t('souvenir')}<br>${t('pour chaque')}<br>${t('aventure')}</div></div>
  <h1><b>100</b><span>${t('aventures')}<br>${t('à deux')}</span></h1>
  <div class="sous">${t('Le livre de nos souvenirs : 100 choses à vivre ensemble, et une page à remplir pour chacune')}</div>
  <div class="photo" style="left:0.45in;bottom:1.15in;width:1.45in;height:1.75in;transform:rotate(-7deg)"><div class="img" style="background:#d4ebf8"><svg viewBox="0 0 100 110" style="width:100%;height:100%" aria-hidden="true"><circle cx="72" cy="30" r="12" fill="#f7cf5b" stroke="#2b1722" stroke-width="2.5"/><path d="M0 110 L0 78 L28 50 L50 72 L66 58 L100 88 L100 110 Z" fill="#94c78e" stroke="#2b1722" stroke-width="2.5" stroke-linejoin="round"/></svg></div></div>
  <div class="photo" style="left:2.05in;bottom:0.62in;width:1.3in;height:1.55in;transform:rotate(5deg)"><div class="img" style="background:#fbe3ec"><svg viewBox="0 0 100 110" style="width:100%;height:100%" aria-hidden="true"><path d="M50 84C26 66 14 54 14 38 14 27 23 19 33 19c7 0 13 4 17 9 4-5 10-9 17-9 10 0 19 8 19 19 0 16-12 28-36 46z" fill="#e17398" stroke="#2b1722" stroke-width="2.5"/></svg></div></div>
  <div class="persos">${mascotte('rose', 'joie', { hauteur: '1.7in' })}${mascotte('violet', 'salut', { hauteur: '1.95in' })}</div>
</div>`,
  dos: `<div class="cda"><div class="col">
  <div class="accroche">${t('Et si on arrêtait de dire « un jour, on fera ça » ?')}</div>
  <div class="texte">${t("Cent idées de choses à vivre à deux, des plus simples (un pique-nique, une soirée sans téléphone) aux plus folles (dormir à la belle étoile, prendre un train sans savoir où descendre). Pour chacune, une page à remplir : la date, l'endroit, vos notes, ce que vous voulez retenir et une photo.")}</div>
  <ul>
    <li>${coeur(10, { plein: true, couleur: '#e17398' })}<span>${t('100 aventures, de la soirée canapé au grand frisson, avec leur coût et leur durée')}</span></li>
    <li>${coeur(10, { plein: true, couleur: '#e17398' })}<span>${t('Une page souvenir par aventure et un cadre photo au format instantané')}</span></li>
    <li>${coeur(10, { plein: true, couleur: '#e17398' })}<span>${t('Dix pages vierges pour vos propres idées, et le palmarès de l\'année')}</span></li>
  </ul>
  <div class="checklist">
    <div><i>✓</i><s>${t('Une soirée entière sans téléphone')}</s></div>
    <div><i>✓</i><s>${t('Refaire notre premier rendez-vous')}</s></div>
    <div><i></i>${t('Dormir à la belle étoile')}</div>
    <div><i></i>${t('Prendre un train sans savoir où descendre')}</div>
  </div>
  <div class="citation">${t('Le livre que vous relirez dans dix ans.')}</div>
  <div class="bas">${mascotte('rose', 'mignon', { hauteur: '0.85in' })}${mascotte('violet', 'amoureux', { hauteur: '0.95in' })}<span style="margin-left:6pt">quiz-couple.com</span></div></div>
  <div class="code-barres">${t('Code-barres (ajouté par KDP)')}</div>
</div>`,
  tranche: `<div class="cta"><div class="vertical">${t('100 aventures à deux')} <span style="font-size:8pt;opacity:.8">Quiz Couple</span></div></div>`,
};

export default {
  id: 'aventures',
  titre: '100 aventures à deux',
  sousTitre: 'Le livre de nos souvenirs : 100 choses à vivre ensemble, et une page à remplir pour chacune',
  trim: { l: 8.5, h: 8.5 },
  papier: 'premium',
  encre: 'premium',
  pagesFinales: 120,
  margeExt: 0.55,
  margeHaut: 0.6,
  margeBas: 0.7,
  fond: '#fcf6f3',
  css,
  pages,
  couverture,
};
