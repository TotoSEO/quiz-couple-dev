// Format C : « Le grand livre des quiz de couple », les tests et les jeux du
// site en version papier. 6 x 9 pouces, intérieur couleur standard, papier
// blanc, environ 152 pages. Les questions viennent des jeux du site
// (fr/gd.json : points communs, qui connaît le mieux, qui de nous deux, tu
// préfères, je n'ai jamais), réécrites pour se jouer avec deux stylos.
import { t, fr, esc, mascotte, pion, coeur, qr, fleur } from '../commun/outils.mjs';

const R = (o = {}) => pion('rose', o);
const V = (o = {}) => pion('violet', o);
const cases = (taille = 10) => `<span class="cases">${R({ taille })}${V({ taille })}</span>`;
const lignesVides = (n, cls = '') => `<div class="lignes ${cls}">${'<div class="ligne"></div>'.repeat(n)}</div>`;

const css = `
.fmt-quiz { --c-ligne: #c9b8c1; }
.fmt-quiz .zone { gap: 0; }
.entete { display: flex; align-items: flex-start; justify-content: space-between; gap: 10pt; margin-bottom: 8pt; }
.entete .etiquette { color: var(--c-rose-texte); }
.entete h2 { font-family: var(--f-titre); font-weight: 600; font-size: 21pt; line-height: 1.02; margin-top: 3pt; color: var(--c-encre); }
.entete .meta { display: flex; flex-direction: column; align-items: flex-end; gap: 3pt; flex: none; }
.puce { display: inline-flex; align-items: center; gap: 3pt; padding: 2pt 7pt; border-radius: 99pt; font-family: var(--f-titre); font-weight: 600; font-size: 7.5pt; white-space: nowrap; }
.puce--rose { background: var(--c-rose-pale); color: var(--c-rose-texte); }
.puce--violet { background: var(--c-violet-pale); color: var(--c-violet-texte); }
.puce--jaune { background: var(--c-jaune-pale); color: #7a5a00; }
.regle { background: var(--c-papier); border: 0.8pt solid var(--c-trait); border-radius: 8pt; padding: 6pt 9pt; font-size: 8.4pt; line-height: 1.38; margin-bottom: 9pt; display: flex; gap: 8pt; align-items: center; }
.regle b { font-weight: 700; }
.regle .mascotte { flex: none; }
.questions { display: flex; flex-direction: column; gap: 6.5pt; }
.q { display: grid; grid-template-columns: 17pt 1fr; column-gap: 6pt; }
.q-num { width: 17pt; height: 17pt; border-radius: 99pt; background: var(--c-rose); color: #2a1e36; font-family: var(--f-titre); font-weight: 700; font-size: 8pt; display: flex; align-items: center; justify-content: center; }
.q-texte { font-family: var(--f-titre); font-weight: 600; font-size: 10.5pt; line-height: 1.15; padding-top: 2pt; }
.opts { grid-column: 2; display: grid; grid-template-columns: 1fr 1fr; gap: 2.5pt 12pt; margin-top: 3.5pt; }
.opt { display: flex; align-items: center; gap: 5pt; font-size: 8.6pt; line-height: 1.15; }
.opt-l { font-family: var(--f-titre); font-weight: 600; color: var(--c-encre-douce); width: 8pt; }
.opt-t { flex: 1; }
.cases { display: inline-flex; align-items: center; gap: 3pt; flex: none; }
.score { margin-top: auto; border: 1.2pt solid var(--c-rose); border-radius: 10pt; padding: 8pt 11pt; display: flex; align-items: center; justify-content: space-between; gap: 10pt; }
.score .titre { font-size: 12pt; }
.score .total { font-family: var(--f-titre); font-weight: 600; font-size: 20pt; color: var(--c-rose-texte); white-space: nowrap; }
.score .total small { font-size: 11pt; color: var(--c-encre-douce); }
.score p { font-size: 8pt; color: var(--c-encre-douce); margin-top: 2pt; }

/* résultats */
.profils { display: flex; flex-direction: column; gap: 9pt; }
.profil { display: grid; grid-template-columns: 74pt 1fr; gap: 10pt; align-items: center; border-radius: 12pt; padding: 10pt 12pt 10pt 8pt; }
.profil:nth-child(1) { background: var(--c-ciel); }
.profil:nth-child(2) { background: var(--c-vert-pale); }
.profil:nth-child(3) { background: var(--c-jaune-pale); }
.profil:nth-child(4) { background: var(--c-rose-pale); }
.profil-duo { display: flex; align-items: flex-end; justify-content: center; gap: 0; }
.profil .fourchette { font-family: var(--f-titre); font-weight: 700; font-size: 8pt; color: var(--c-violet-texte); }
.profil h3 { font-family: var(--f-titre); font-weight: 600; font-size: 13.5pt; line-height: 1.05; margin: 1pt 0 3pt; }
.profil p { font-size: 8.8pt; line-height: 1.4; }
.plus { margin-top: auto; display: flex; gap: 8pt; align-items: center; font-size: 8.4pt; padding: 7pt 10pt; border: 0.8pt dashed var(--c-violet); border-radius: 9pt; }
.plus b { color: var(--c-violet-texte); }

/* qui connaît le mieux : la colonne pliée */
.pli { display: grid; grid-template-columns: 1fr 1fr 1fr 14pt; column-gap: 0; border-top: 0.8pt solid var(--c-trait); }
.pli > div { padding: 5pt 6pt; border-bottom: 0.8pt solid var(--c-trait); min-height: 0.64in; }
.pli .pq { font-family: var(--f-titre); font-weight: 600; font-size: 9pt; line-height: 1.12; padding-left: 0; }
.pli .pa { border-left: 1.2pt dashed var(--c-encre-douce); background: var(--c-rose-pale); }
.pli .pb { background: var(--c-violet-pale); }
.pli .ok { display: flex; align-items: center; justify-content: center; padding: 0; }
.pli .tete { font-family: var(--f-texte); font-weight: 700; font-size: 6.6pt; letter-spacing: 0.06em; text-transform: uppercase; color: var(--c-encre-douce); min-height: 0; padding-top: 3pt; padding-bottom: 3pt; display: flex; align-items: center; gap: 3pt; background: none; }
.case-ok { width: 9pt; height: 9pt; border: 1.1pt solid var(--c-encre-douce); border-radius: 2pt; }
.ciseaux { font-size: 7pt; color: var(--c-encre-douce); text-align: center; margin: 3pt 0 6pt; }

/* qui de nous deux */
.qdn { width: 100%; border-collapse: collapse; }
.qdn th { font-family: var(--f-texte); font-weight: 700; font-size: 6.4pt; letter-spacing: 0.05em; text-transform: uppercase; color: var(--c-encre-douce); text-align: center; padding: 0 0 4pt; }
.qdn th:first-child { text-align: left; }
.qdn td { border-top: 0.7pt solid var(--c-trait); padding: 3.4pt 0; font-size: 8.7pt; line-height: 1.15; vertical-align: middle; }
.qdn td.c { text-align: center; width: 0.62in; }
.qdn td.c .cases { justify-content: center; }
.qdn tr:nth-child(even) td { background: #fdf8fa; }
.qdn .case-ok { margin: 0 auto; }

/* tu préfères */
.dilemmes { display: flex; flex-direction: column; gap: 5.5pt; }
.dil { border: 0.8pt solid var(--c-trait); border-radius: 9pt; padding: 6pt 9pt 7pt; }
.dil .q-texte { font-size: 9.6pt; padding: 0 0 4pt; }
.dil-choix { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 8pt; }
.dil-choix .opt { background: var(--c-papier); border-radius: 7pt; padding: 4pt 6pt; font-size: 8.4pt; }
.dil-choix .ou { font-family: var(--f-titre); font-weight: 700; font-size: 8pt; color: var(--c-violet-texte); }

/* je n'ai jamais */
.jamais td { font-size: 8.7pt; }

/* grandes questions */
.gq { display: flex; flex-direction: column; gap: 6pt; }
.gq-item { display: grid; grid-template-columns: 20pt 1fr; gap: 7pt; align-items: start; }
.gq-n { font-family: var(--f-plume); font-style: italic; font-size: 17pt; line-height: 1; color: var(--c-rose-texte); text-align: right; }
.gq-t { font-family: var(--f-plume); font-style: italic; font-weight: 500; font-size: 11.2pt; line-height: 1.22; }
.gq-item .ligne { height: 0.25in; }

/* tableau des scores */
.tableau { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 8.4pt; }
.tableau th { font-family: var(--f-titre); font-weight: 600; font-size: 8pt; color: #fff; background: var(--c-violet); padding: 5pt 4pt; text-align: center; }
.tableau th:first-child { text-align: left; border-top-left-radius: 7pt; padding-left: 7pt; }
.tableau th:last-child { border-top-right-radius: 7pt; }
.tableau td { border-bottom: 0.8pt solid var(--c-trait); height: 0.42in; padding: 0 4pt; }
.tableau td:first-child { font-family: var(--f-titre); font-weight: 600; font-size: 9pt; padding-left: 7pt; }
.tableau td + td { border-left: 0.8pt solid var(--c-trait); }
.tableau tr:nth-child(even) td { background: #fdf8fa; }

/* ouverture de partie, pleine page */
.ouverture .zone { color: #fff; justify-content: space-between; }
.ouverture .etiquette { color: #fff; opacity: 0.85; font-size: 8pt; }
.ouverture h2 { font-family: var(--f-titre); font-weight: 700; font-size: 44pt; line-height: 0.95; margin-top: 6pt; }
.ouverture p { font-size: 10pt; line-height: 1.45; max-width: 3.9in; margin-top: 10pt; }
.ouverture ul { margin: 12pt 0 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 4pt; font-family: var(--f-titre); font-weight: 600; font-size: 11pt; }
.ouverture li { display: flex; align-items: center; gap: 6pt; }
.ouverture li span { font-family: var(--f-texte); font-weight: 600; font-size: 8pt; opacity: 0.8; margin-left: auto; }
.duo { display: flex; align-items: flex-end; justify-content: center; gap: 6pt; }

/* pages du début */
.titre-livre { align-items: center; text-align: center; justify-content: center; gap: 14pt; }
.titre-livre h1 { font-family: var(--f-titre); font-weight: 700; font-size: 30pt; line-height: 1; color: var(--c-encre); }
.titre-livre h1 em { font-style: normal; color: var(--c-rose-texte); }
.titre-livre .appartient { margin-top: 18pt; font-family: var(--f-titre); font-weight: 500; font-size: 11pt; color: var(--c-encre-douce); width: 100%; }
.titre-livre .noms { display: grid; grid-template-columns: 1fr auto 1fr; gap: 8pt; align-items: end; margin-top: 6pt; width: 100%; }
.titre-livre .noms .ligne { height: 0.34in; }
.titre-livre .et { font-family: var(--f-plume); font-style: italic; font-size: 16pt; color: var(--c-rose-texte); }
.copyright { justify-content: flex-end; font-size: 7.4pt; line-height: 1.5; color: var(--c-encre-douce); gap: 6pt; }
.copyright b { color: var(--c-encre); }
.sommaire h2, .avant h2, .qui h2 { font-family: var(--f-titre); font-weight: 600; font-size: 24pt; margin-bottom: 10pt; }
.som-partie { margin-top: 7pt; }
.som-partie .etiquette { color: var(--c-violet-texte); margin-bottom: 3pt; display: block; }
.som-ligne { display: flex; align-items: baseline; gap: 4pt; font-size: 9pt; padding: 1.6pt 0; }
.som-ligne .points { flex: 1; border-bottom: 0.8pt dotted #b9a9b1; transform: translateY(-2pt); }
.som-ligne b { font-family: var(--f-titre); font-weight: 600; }
.etapes { display: flex; flex-direction: column; gap: 10pt; }
.etape { display: grid; grid-template-columns: 26pt 1fr; gap: 9pt; align-items: start; }
.etape-n { width: 26pt; height: 26pt; border-radius: 99pt; background: var(--c-violet); color: #fff; font-family: var(--f-titre); font-weight: 700; font-size: 13pt; display: flex; align-items: center; justify-content: center; }
.etape h3 { font-family: var(--f-titre); font-weight: 600; font-size: 12pt; margin-bottom: 2pt; }
.etape p { font-size: 9pt; line-height: 1.42; }
.qui-duo { display: grid; grid-template-columns: 1fr 1fr; gap: 12pt; margin-top: 6pt; }
.qui-carte { border-radius: 12pt; padding: 10pt; display: flex; flex-direction: column; align-items: center; gap: 6pt; text-align: center; }
.qui-carte--rose { background: var(--c-rose-pale); }
.qui-carte--violet { background: var(--c-violet-pale); }
.qui-carte .nom { width: 100%; margin-top: 4pt; }
.qui-carte .nom .ligne { height: 0.3in; border-bottom-style: solid; }
.qui-carte .role { font-family: var(--f-titre); font-weight: 600; font-size: 11pt; display: flex; align-items: center; gap: 5pt; }
.qui-carte .role-desc { font-size: 8pt; color: var(--c-encre-douce); }
.serment { margin-top: 14pt; padding: 10pt 12pt; border-radius: 12pt; background: var(--c-papier); border: 0.8pt solid var(--c-trait); }
.serment h3 { font-family: var(--f-titre); font-weight: 600; font-size: 12pt; margin-bottom: 4pt; }
.serment p { font-family: var(--f-plume); font-style: italic; font-size: 10.4pt; line-height: 1.4; }
.signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 14pt; margin-top: 8pt; font-size: 7.4pt; color: var(--c-encre-douce); }
.signatures .ligne { height: 0.32in; border-bottom-style: solid; }
.fin { align-items: center; text-align: center; justify-content: center; gap: 12pt; }
.fin h2 { font-family: var(--f-titre); font-weight: 700; font-size: 25pt; line-height: 1.02; }
.fin p { font-size: 9.6pt; line-height: 1.45; max-width: 3.9in; }
.fin .qr { width: 1.1in; height: 1.1in; }
.fin .adresse { font-family: var(--f-titre); font-weight: 600; font-size: 13pt; color: var(--c-rose-texte); }
`;

// ── Le test des points communs (fr/gd.json, commonPoints) ───────────────
const POINTS = [
  ['Café ou thé ?', ['Café', 'Thé', 'Les deux', 'Aucun']],
  ['Sucré ou salé ?', ['Sucré', 'Salé', 'Les deux']],
  ['Plutôt mer ou montagne ?', ['Mer', 'Montagne', 'Les deux']],
  ['Plutôt du matin ou du soir ?', ['Matin', 'Soir', 'Ça dépend']],
  ['Les surprises, tu aimes ?', ['Oui', 'Non', 'Ça dépend']],
  ['Planifier ou improviser ?', ['Planifier', 'Improviser', 'Un peu des deux']],
  ['Chiens ou chats ?', ['Chiens', 'Chats', 'Les deux', 'Aucun']],
  ['Ton genre de film ?', ['Comédie', 'Action', 'Romantique', 'Thriller']],
  ['Plutôt introverti(e) ou extraverti(e) ?', ['Introverti(e)', 'Extraverti(e)', 'Un peu des deux']],
  ['Dépensier(e) ou économe ?', ['Dépensier(e)', 'Économe', 'Ça dépend']],
  ['La ville ou la campagne ?', ['La ville', 'La campagne', 'Les deux']],
  ['Couche-tôt ou couche-tard ?', ['Couche-tôt', 'Couche-tard', 'Ça dépend']],
  ['Tu crois au destin ?', ['Oui', 'Non', 'Un peu']],
  ['Ponctuel(le) ou en retard ?', ['Ponctuel(le)', 'En retard', 'Ça dépend']],
  ['Ton voyage de rêve ?', ['Le Japon', 'Les Maldives', 'New York', 'Le tour du monde']],
  ['Ton plat préféré ?', ['Pizza', 'Pâtes', 'Sushi', 'Burger']],
];

function question(n, [texte, options]) {
  const L = 'abcd';
  return `<div class="q"><div class="q-num">${n}</div><div class="q-texte">${t(texte)}</div>
<div class="opts">${options.map((o, i) => `<div class="opt"><span class="opt-l">${L[i]}</span><span class="opt-t">${t(o)}</span>${cases(9.5)}</div>`).join('')}</div></div>`;
}

const QDN = [
  'laisse traîner ses affaires partout ?', 'râle le plus dans les bouchons ?', "pioche dans l'assiette de l'autre ?",
  'laisse la vaisselle « tremper » pendant deux jours ?', 'met la musique le plus fort en voiture ?', 'craque en premier après une dispute ?',
  'a le plus de mal à parler de ses sentiments ?', 'a le plus besoin de câlins ?', 'envoie le plus de messages dans la journée ?',
  "prend le plus de photos de l'autre ?", 'ose parler à des inconnus ?', 'dépense sans compter ?', 'procrastine le plus ?',
  'garde des objets inutiles « au cas où » ?', 'chante le plus faux ?', 'a le pire goût en musique ?',
  'passerait la journée au lit sans culpabiliser ?', 'serait le plus nul dans un escape game ?', 'grignote en cachette ?', 'raconte les pires blagues ?',
];

const DILEMMES = [
  ["Un long message d'amour par jour, ou un câlin de dix minutes chaque soir ?", ["Le message d'amour", 'Le câlin de dix minutes']],
  ['Perdre toutes vos photos de couple, ou tous vos messages ?', ['Perdre les photos', 'Perdre les messages']],
  ['Un couple parfait mais ennuyeux, ou imparfait mais passionné ?', ['Parfait mais ennuyeux', 'Imparfait mais passionné']],
  ['Revivre votre meilleur souvenir, ou effacer votre pire dispute ?', ['Revivre le meilleur', 'Effacer la pire']],
  ["Danser ensemble chaque fois que vous entrez dans un magasin, ou vous chanter une chanson d'amour au restaurant ?", ['Danser dans les magasins', 'Chanter au restaurant']],
  ["Échanger vos corps pendant 24 heures, ou lire dans les pensées de l'autre pendant une heure ?", ['Échanger de corps', 'Lire dans ses pensées']],
  ["Beaucoup d'argent et peu de temps ensemble, ou peu d'argent et tout le temps du monde ?", ["Beaucoup d'argent", 'Tout le temps du monde']],
  ['Ne plus jamais pouvoir offrir de cadeaux, ou ne plus jamais en recevoir ?', ["Ne plus jamais en offrir", 'Ne plus jamais en recevoir']],
];

const JAMAIS = [
  "eu envie de t'embrasser dès le premier regard.", "fait un détour juste pour avoir une chance de te croiser.",
  "su que c'était toi bien avant de te le dire.", 'espionné ce que tu likais sur les réseaux.',
  "vendu la mèche d'une surprise que je te préparais.", "trouvé du charme à quelqu'un de ta bande d'amis.",
  'ri de toi dans ton dos, gentiment.', "fait semblant d'aimer un de tes cadeaux.",
  "goûté dans ton assiette après avoir juré que je n'avais pas faim.", 'fait semblant de ne pas entendre le réveil.',
  'volé toute la couette en pleine nuit.', 'porté un vêtement trois jours de suite en jurant qu\'il était propre.',
  "dit « on arrive » alors qu'aucun de nous deux n'était prêt.", "ri pendant une dispute alors qu'il ne fallait surtout pas.",
  "attendu que tu craques en premier pour qu'on se réconcilie.", "pensé « c'est la bonne personne » en te regardant faire un truc banal.",
  "fait semblant d'écouter une histoire du début à la fin.", 'eu un fou rire avec toi à un moment très mal choisi.',
];

const GRANDES = [
  "Qu'est-ce que tu as pensé de moi la toute première fois ?",
  'Quel moment de notre histoire tu revivrais tel quel ?',
  "Qu'est-ce que je fais qui te donne l'impression d'être aimé(e) ?",
  "Un rêve que tu n'as jamais dit à personne ?",
  "Qu'est-ce que tu aimerais qu'on fasse plus souvent ?",
  "Une chose que tes parents t'ont apprise sur l'amour, en bien ou en mal ?",
  "De quoi tu as peur, quand tu penses à l'avenir ?",
  'Dans dix ans, un dimanche matin idéal, ça ressemble à quoi ?',
];

const duo = (poseR, poseV, h = '0.9in', mode = 'couleur', extraR = {}, extraV = {}) =>
  `<div class="duo">${mascotte('rose', poseR, { mode, hauteur: `calc(${h} * 0.93)`, extra: extraR })}${mascotte('violet', poseV, { mode, hauteur: h, extra: extraV })}</div>`;

const pages = [
  {
    folio: 1, titre: 'Page de titre', sansFolio: true,
    html: `<div class="titre-livre" style="flex:1;display:flex;flex-direction:column">
  ${duo('salut', 'amoureux', '1.45in')}
  <h1>${t('Le grand livre')}<br>${t('des quiz')} <em>${t('de couple')}</em></h1>
  <p class="etiquette" style="color:var(--c-violet-texte)">${t('25 tests et jeux à faire à deux, sans écran')}</p>
  <p class="appartient">${t('Les quiz de')}</p>
  <div class="noms"><div class="ligne"></div><span class="et">&amp;</span><div class="ligne"></div></div>
</div>`,
  },
  {
    folio: 2, titre: 'Mentions', sansFolio: true,
    html: `<div class="copyright" style="flex:1;display:flex;flex-direction:column">
  <p><b>${t('Le grand livre des quiz de couple')}</b><br>${t('Un livre de Quiz Couple, quiz-couple.com')}</p>
  <p>${t('© 2026 Quiz Couple · Visibilitea, entreprise individuelle, Strasbourg. Tous droits réservés. Aucune partie de ce livre ne peut être reproduite sans autorisation, sauf pour y jouer à deux, évidemment.')}</p>
  <p>${t('Les questions des jeux sont celles des tests du site, réécrites pour le papier. Illustrations : les mascottes de Quiz Couple.')}</p>
  <p>${t("ISBN : à venir · Dépôt légal : à venir · Imprimé à la demande par Amazon KDP.")}</p>
  <p>${t("Ce livre est un jeu. Ses scores ne disent rien de l'avenir d'un couple : ils servent à rire et à parler.")}</p>
</div>`,
  },
  {
    folio: 3, titre: 'Sommaire', classe: 'sommaire',
    html: `<h2>${t('Au programme')}</h2>
<div class="som-partie"><span class="etiquette">${t('Partie 1 · Les tests')}</span>
  ${[['Le test des points communs', 7], ["Qui connaît le mieux l'autre ?", 10], ['Le test de compatibilité', 14], ['Quel type de couple êtes-vous ?', 18], ["Les langages de l'amour", 22], ['Le test de la vie à deux', 26], ["Le test de l'âme sœur", 30], ['Le test de jalousie', 34], ['Le test du couple sain', 38], ['Prêts à vivre ensemble ?', 42], ['Le test de pureté du couple', 46], ['Le portrait de votre couple', 50]].map(([n, p]) => `<div class="som-ligne"><b>${t(n)}</b><span class="points"></span><span>${p}</span></div>`).join('')}
</div>
<div class="som-partie"><span class="etiquette">${t('Partie 2 · Les jeux')}</span>
  ${[['Qui de nous deux ?', 53], ['Tu préfères ?', 60], ["Je n'ai jamais", 61], ["C'est un 10, mais...", 66], ['Les questions rapides', 70], ['Qui pourrait... ?', 74], ['Action ou vérité, version douce', 78], ['Les phrases à compléter', 84], ['Oui ou non ?', 88], ['Les dilemmes', 92], ['Qui est le plus... ?', 96], ["Le jeu de l'oie à deux", 100]].map(([n, p]) => `<div class="som-ligne"><b>${t(n)}</b><span class="points"></span><span>${p}</span></div>`).join('')}
</div>
<div class="som-partie"><span class="etiquette">${t('Partie 3 · Pour aller plus loin')}</span>
  ${[['Les 100 grandes questions', 104], ['Les défis de la semaine', 120], ['Le tableau des scores', 147]].map(([n, p]) => `<div class="som-ligne"><b>${t(n)}</b><span class="points"></span><span>${p}</span></div>`).join('')}
</div>`,
  },
  {
    folio: 4, titre: 'Avant de jouer', classe: 'avant',
    html: `<h2>${t('Avant de jouer')}</h2>
<div class="etapes">
  <div class="etape"><div class="etape-n">1</div><div><h3>${t('Prenez deux stylos')}</h3><p>${t("De deux couleurs différentes, si possible. Choisissez qui est la rose et qui est le violet (page d'à côté) : à chaque jeu, la rose coche le rond et le violet coche la gélule.")}</p></div></div>
  <div class="etape"><div class="etape-n">2</div><div><h3>${t("Pas d'espionnage")}</h3><p>${t("Chacun répond sans regarder les réponses de l'autre. Posez une main dessus, ou pliez la page le long des pointillés quand il y en a. On compare à la fin, pas avant !")}</p></div></div>
  <div class="etape"><div class="etape-n">3</div><div><h3>${t('Comptez, puis parlez')}</h3><p>${t("Chaque test se termine par un score et un résultat. Un score bas n'a rien de grave : c'est souvent là qu'on a les meilleures discussions.")}</p></div></div>
  <div class="etape"><div class="etape-n">4</div><div><h3>${t('Rejouez dans un an')}</h3><p>${t('Le tableau des scores, à la fin du livre, a une colonne « dans un an ». Refaites les tests à votre anniversaire de couple et regardez ce qui a changé.')}</p></div></div>
</div>
<div class="regle" style="margin-top:auto">${mascotte('violet', 'surprise', { hauteur: '0.62in' })}<div>${t("Les jeux marchent partout : au restaurant en attendant les plats, en voiture (le passager écrit pour deux), au lit, en week-end. Comptez dix à vingt minutes par jeu.")}</div></div>`,
  },
  {
    folio: 5, titre: 'Qui est qui ?', classe: 'qui',
    html: `<h2>${t('Qui est qui ?')}</h2>
<p style="font-size:9pt;line-height:1.45">${t("Dans tout le livre, il y a deux colonnes : celle du rond et celle de la gélule, les formes de nos deux mascottes. Écrivez vos prénoms, et coloriez votre forme avec votre stylo.")}</p>
<div class="qui-duo">
  <div class="qui-carte qui-carte--rose">${mascotte('rose', 'mignon', { hauteur: '1.05in' })}<div class="role">${R({ taille: 13 })} ${t('La rose')}</div><div class="role-desc">${t('coche toujours le rond')}</div><div class="nom"><div class="ligne"></div></div></div>
  <div class="qui-carte qui-carte--violet">${mascotte('violet', 'salut', { hauteur: '1.13in' })}<div class="role">${V({ taille: 13 })} ${t('Le violet')}</div><div class="role-desc">${t('coche toujours la gélule')}</div><div class="nom"><div class="ligne"></div></div></div>
</div>
<div class="serment"><h3>${t('Le serment des joueurs')}</h3><p>${t("Nous promettons de ne pas tricher, de ne pas bouder quand on perd, et de dire la vérité, même quand elle est un peu gênante.")}</p>
<div class="signatures"><div><div class="ligne"></div>${t('Signature de la rose')}</div><div><div class="ligne"></div>${t('Signature du violet')}</div></div></div>`,
  },
  {
    folio: 6, titre: 'Partie 1 · Les tests', classe: 'ouverture', fond: 'var(--c-violet)', sansFolio: true,
    perdu: `${fleur('#ffffff', 120, -12).replace('class="fleur"', 'class="fleur" style="top:0.3in;right:-0.4in;opacity:.18;width:120pt;height:120pt"')}`,
    html: `<div><p class="etiquette">${t('Partie 1')}</p><h2>${t('Les tests')}</h2>
<p>${t("Sept tests à faire à deux, chacun de son côté. Vous comptez vos points, vous lisez votre résultat, et vous voyez si vous vous connaissez aussi bien que vous le pensez.")}</p>
<ul>${[['Les points communs', '10 min'], ["Qui connaît le mieux l'autre ?", '15 min'], ['La compatibilité', '20 min'], ['Quel type de couple ?', '15 min']].map(([n, d]) => `<li>${coeur(9, { plein: true, couleur: '#ffffff' })} ${t(n)} <span>${t(d)}</span></li>`).join('')}</ul></div>
${duo('joie', 'joie', '1.5in')}`,
  },
  {
    folio: 7, titre: 'Le test des points communs (1/2)',
    html: `<div class="entete"><div><span class="etiquette">${t('Test 1')}</span><h2>${t('Le test des points communs')}</h2></div>
<div class="meta"><span class="puce puce--rose">${t('16 questions')}</span><span class="puce puce--violet">${t('10 minutes')}</span></div></div>
<div class="regle">${mascotte('rose', 'salut', { hauteur: '0.5in' })}<div>${t('Chacun coche')} <b>${t('sa')}</b> ${t("réponse, dans sa forme. Si aucune réponse ne vous va, prenez la plus proche. Le score, c'est le nombre de questions où vous avez coché la même chose.")}</div></div>
<div class="questions">${POINTS.slice(0, 7).map((q, i) => question(i + 1, q)).join('')}</div>`,
  },
  {
    folio: 8, titre: 'Le test des points communs (2/2)',
    html: `<div class="questions">${POINTS.slice(7).map((q, i) => question(i + 8, q)).join('')}</div>
<div class="score"><div><div class="titre">${t('Vos points communs')}</div><p>${t("Une question compte si vous avez coché la même lettre. Résultats page d'à côté.")}</p></div><div class="total">____ <small>/ 16</small></div></div>`,
  },
  {
    folio: 9, titre: 'Les résultats du test',
    html: `<div class="entete"><div><span class="etiquette">${t('Test 1 · Les résultats')}</span><h2>${t('Alors, vous êtes plutôt...')}</h2></div></div>
<div class="profils">
  <div class="profil"><div class="profil-duo">${mascotte('rose', 'rire', { hauteur: '0.74in' })}${mascotte('violet', 'surprise', { hauteur: '0.8in' })}</div><div><span class="fourchette">${t('0 à 4 points communs')}</span><h3>${t('Les opposés qui s\'attirent')}</h3><p>${t("Vous ne pensez presque jamais pareil, et on ne s'ennuie pas chez vous. Le plus simple : que chacun fasse découvrir son monde à l'autre.")}</p></div></div>
  <div class="profil"><div class="profil-duo">${mascotte('rose', 'mignon', { hauteur: '0.74in' })}${mascotte('violet', 'salut', { hauteur: '0.8in' })}</div><div><span class="fourchette">${t('5 à 8 points communs')}</span><h3>${t('Les complices qui se complètent')}</h3><p>${t("Assez de points communs pour se comprendre, assez de différences pour se surprendre. C'est souvent l'équilibre le plus solide.")}</p></div></div>
  <div class="profil"><div class="profil-duo">${mascotte('rose', 'amoureux', { hauteur: '0.74in' })}${mascotte('violet', 'amoureux', { hauteur: '0.8in' })}</div><div><span class="fourchette">${t('9 à 12 points communs')}</span><h3>${t('Le duo bien accordé')}</h3><p>${t("Vous partagez beaucoup de goûts et d'habitudes, et ça se voit au quotidien : on se comprend sans avoir besoin de parler. Gardez quand même quelques surprises.")}</p></div></div>
  <div class="profil"><div class="profil-duo">${mascotte('rose', 'joie', { hauteur: '0.74in' })}${mascotte('violet', 'joie', { hauteur: '0.8in', extra: { yeux: 'clin' } })}</div><div><span class="fourchette">${t('13 à 16 points communs')}</span><h3>${t('Les âmes jumelles')}</h3><p>${t("C'est presque troublant : vous avez répondu pareil sur presque tout. Ou alors l'un de vous a regardé la feuille de l'autre...")}</p></div></div>
</div>
<div class="plus">${coeur(14, { plein: true, couleur: 'var(--c-violet)' })}<div><b>${t('Le petit plus :')}</b> ${t("choisissez la question où vous étiez le plus loin l'un de l'autre, et racontez chacun pourquoi vous avez répondu ça.")}</div></div>`,
  },
  {
    folio: 10, titre: "Qui connaît le mieux l'autre ? (manche 1)",
    html: `<div class="entete"><div><span class="etiquette">${t('Test 2 · Manche 1')}</span><h2>${t("Qui connaît le mieux l'autre ?")}</h2></div>
<div class="meta"><span class="puce puce--rose">${t('2 manches')}</span><span class="puce puce--violet">${t('15 minutes')}</span></div></div>
<div class="regle">${mascotte('violet', 'clin' in {} ? 'repos' : 'repos', { hauteur: '0.5in', extra: { yeux: 'clin', bouche: 'sourire' } })}<div>${t('La')} <b>${t('rose')}</b> ${t('écrit sa vraie réponse dans la colonne rose, puis plie la page sur les pointillés. Le')} <b>${t('violet')}</b> ${t('devine dans la colonne violette. On déplie, et on coche chaque bonne réponse.')}</div></div>
<div class="pli">
  <div class="tete">${t('La question')}</div><div class="tete pa" style="background:none">${R({ taille: 8 })} ${t('Ma vraie réponse')}</div><div class="tete">${V({ taille: 8 })} ${t('Ta devinette')}</div><div class="tete"></div>
  ${['Mon plat préféré', 'Ma plus grande peur', 'Le film que je peux revoir dix fois', 'Ce que je fais en premier le matin', "Mon rêve d'enfant", "La chanson que j'écoute en boucle en ce moment", 'Le truc qui m\'énerve le plus chez les autres', "Ce que je ferais avec un million d'euros"].map((q) => `<div class="pq">${t(q)}</div><div class="pa"></div><div class="pb"></div><div class="ok"><div class="case-ok"></div></div>`).join('')}
</div>
<p class="ciseaux">${t('- - - pliez la page sur les pointillés pour cacher la colonne rose - - -')}</p>`,
  },
  {
    folio: 11, titre: "Qui connaît le mieux l'autre ? (manche 2)",
    html: `<div class="entete"><div><span class="etiquette">${t('Test 2 · Manche 2')}</span><h2>${t('Et maintenant, on inverse')}</h2></div></div>
<div class="pli">
  <div class="tete">${t('La question')}</div><div class="tete pa" style="background:none">${V({ taille: 8 })} ${t('Ma vraie réponse')}</div><div class="tete">${R({ taille: 8 })} ${t('Ta devinette')}</div><div class="tete"></div>
  ${['Mon grignotage préféré', "Le métier que j'aurais aimé faire", "Mon souvenir d'enfance préféré", "L'emoji que j'utilise le plus", 'Ce qui me stresse le plus', 'Mes vacances idéales', 'Le défaut que j\'assume complètement', 'La qualité que je préfère chez toi'].map((q) => `<div class="pq">${t(q)}</div><div class="pa" style="background:var(--c-violet-pale)"></div><div class="pb" style="background:var(--c-rose-pale)"></div><div class="ok"><div class="case-ok"></div></div>`).join('')}
</div>
<div class="score" style="margin-top:auto"><div><div class="titre">${t('Les bonnes devinettes')}</div><p>${t('Celui qui a le meilleur score choisit le film de ce soir. Égalité ? Vous le choisissez à deux, bon courage.')}</p></div>
<div style="display:flex;flex-direction:column;gap:3pt;align-items:flex-end"><div class="total" style="font-size:15pt">${V({ taille: 11 })} ___ <small>/ 8</small></div><div class="total" style="font-size:15pt">${R({ taille: 11 })} ___ <small>/ 8</small></div></div></div>`,
  },
  {
    folio: 52, titre: 'Partie 2 · Les jeux', classe: 'ouverture', fond: 'var(--c-rose)', sansFolio: true,
    perdu: `${fleur('#ffffff', 120, 20).replace('class="fleur"', 'class="fleur" style="top:0.4in;left:-0.35in;opacity:.22;width:120pt;height:120pt"')}`,
    html: `<div style="color:#2a1e36"><p class="etiquette" style="color:#2a1e36">${t('Partie 2')}</p><h2>${t('Les jeux')}</h2>
<p>${t("Ici, pas de résultat qui dit quel couple vous êtes : on joue, on rit, on se raconte des trucs. Il y a des points quand même, pour savoir qui choisit le prochain jeu.")}</p>
<ul>${[['Qui de nous deux ?', '10 min'], ['Tu préfères ?', '10 min'], ["Je n'ai jamais", '15 min'], ["C'est un 10, mais...", '15 min']].map(([n, d]) => `<li>${coeur(9, { plein: true, couleur: '#2a1e36' })} ${t(n)} <span>${t(d)}</span></li>`).join('')}</ul></div>
${duo('rire', 'rire', '1.5in')}`,
  },
  {
    folio: 53, titre: 'Qui de nous deux ?',
    html: `<div class="entete"><div><span class="etiquette">${t('Jeu 1')}</span><h2>${t('Qui de nous deux...')}</h2></div><div class="meta"><span class="puce puce--rose">${t('20 questions')}</span></div></div>
<div class="regle" style="margin-bottom:6pt">${mascotte('violet', 'surprise', { hauteur: '0.48in' })}<div>${t('Chacun vote en secret dans sa colonne : le rond pour la rose, la gélule pour le violet. Puis on compare, et on coche')} <b>${t('accord')}</b> ${t('quand vous avez désigné la même personne.')}</div></div>
<table class="qdn"><thead><tr><th>${t('Qui de nous deux...')}</th><th>${t('Vote de')} ${R({ taille: 7 })}</th><th>${t('Vote de')} ${V({ taille: 7 })}</th><th>${t('Accord')}</th></tr></thead>
<tbody>${QDN.map((q) => `<tr><td>${t(q)}</td><td class="c">${cases(8.5)}</td><td class="c">${cases(8.5)}</td><td class="c"><div class="case-ok"></div></td></tr>`).join('')}</tbody></table>
<div class="score" style="margin-top:7pt;padding:5pt 10pt"><div class="titre" style="font-size:10.5pt">${t('Vos accords')}</div><div class="total" style="font-size:16pt">____ <small>/ 20</small></div></div>`,
  },
  {
    folio: 60, titre: 'Tu préfères ?',
    html: `<div class="entete"><div><span class="etiquette">${t('Jeu 2')}</span><h2>${t('Tu préfères ?')}</h2></div><div class="meta"><span class="puce puce--violet">${t('8 dilemmes')}</span></div></div>
<div class="dilemmes">${DILEMMES.map(([q, [a, b]]) => `<div class="dil"><div class="q-texte">${t(q)}</div><div class="dil-choix"><div class="opt"><span class="opt-t">${t(a)}</span>${cases(9)}</div><span class="ou">${t('ou')}</span><div class="opt"><span class="opt-t">${t(b)}</span>${cases(9)}</div></div></div>`).join('')}</div>
<p style="margin-top:auto;font-size:8pt;color:var(--c-encre-douce)">${t('Pas de score ici : à chaque dilemme où vous n\'êtes pas d\'accord, celui qui convainc l\'autre de changer d\'avis marque un point.')}</p>`,
  },
  {
    folio: 61, titre: "Je n'ai jamais",
    html: `<div class="entete"><div><span class="etiquette">${t('Jeu 3')}</span><h2>${t("Je n'ai jamais...")}</h2></div><div class="meta"><span class="puce puce--jaune">${t('18 phrases')}</span></div></div>
<div class="regle" style="margin-bottom:6pt">${mascotte('rose', 'gene', { hauteur: '0.48in' })}<div>${t("Lisez la phrase à voix haute. Si vous l'avez déjà fait, cochez votre forme. Celui qui a coché doit raconter quand. Oui, même pour le réveil.")}</div></div>
<table class="qdn jamais"><thead><tr><th>${t("Je n'ai jamais...")}</th><th>${t("J'ai déjà !")}</th></tr></thead>
<tbody>${JAMAIS.map((q) => `<tr><td>${t(q)}</td><td class="c">${cases(8.5)}</td></tr>`).join('')}</tbody></table>
<div class="score" style="margin-top:auto;padding:5pt 10pt"><div><div class="titre" style="font-size:10.5pt">${t("Le plus « j'ai déjà »")}</div><p>${t('Il ou elle choisit le prochain jeu. Comptez vos cases :')}</p></div><div style="display:flex;gap:10pt"><div class="total" style="font-size:14pt">${R({ taille: 10 })} __</div><div class="total" style="font-size:14pt">${V({ taille: 10 })} __</div></div></div>`,
  },
  {
    folio: 104, titre: 'Les grandes questions',
    html: `<div class="entete"><div><span class="etiquette">${t('Partie 3')}</span><h2>${t('Les grandes questions')}</h2></div></div>
<p style="font-size:8.8pt;line-height:1.45;margin-bottom:9pt">${t("Pas de score ici : prenez votre temps. Une question par soir, c'est très bien aussi. Notez un mot ou une phrase de la réponse de l'autre, pour vous en souvenir.")}</p>
<div class="gq">${GRANDES.map((q, i) => `<div class="gq-item"><div class="gq-n">${i + 1}</div><div><div class="gq-t">${t(q)}</div><div class="ligne"></div><div class="ligne"></div></div></div>`).join('')}</div>`,
  },
  {
    folio: 147, titre: 'Le tableau des scores',
    html: `<div class="entete"><div><span class="etiquette">${t('À la fin du livre')}</span><h2>${t('Le tableau des scores')}</h2></div></div>
<p style="font-size:8.8pt;line-height:1.45;margin-bottom:10pt">${t("Notez vos scores au fur et à mesure. Et dans un an, refaites les tests et remplissez la dernière colonne : c'est souvent là qu'on rit le plus.")}</p>
<table class="tableau"><thead><tr><th>${t('Le test')}</th><th>${t('Date')}</th><th>${R({ taille: 8, couleur: '#ffffff' })}</th><th>${V({ taille: 8, couleur: '#ffffff' })}</th><th>${t('À deux')}</th><th>${t('Dans un an')}</th></tr></thead>
<tbody>${['Points communs', "Qui connaît l'autre", 'Compatibilité', 'Type de couple', 'Qui de nous deux', 'Tu préfères', "Je n'ai jamais", "C'est un 10, mais", 'Questions rapides', 'Qui pourrait'].map((n) => `<tr><td>${t(n)}</td><td></td><td></td><td></td><td></td><td></td></tr>`).join('')}</tbody></table>
<div style="margin-top:auto;display:flex;justify-content:flex-end">${mascotte('violet', 'joie', { hauteur: '0.75in' })}</div>`,
  },
  {
    folio: 152, titre: 'La suite', sansFolio: true,
    html: `<div class="fin" style="flex:1;display:flex;flex-direction:column">
  ${duo('joie', 'joie', '1.2in')}
  <h2>${t('Vous avez fini le livre ?')}<br>${t('Bravo !')}</h2>
  <p>${t("La suite est sur quiz-couple.com : des dizaines de tests et de jeux à deux, gratuits, à faire sur votre téléphone. Scannez le code pour y aller.")}</p>
  ${qr('https://quiz-couple.com/')}
  <div class="adresse">quiz-couple.com</div>
</div>`,
  },
];

// ── La couverture ────────────────────────────────────────────────────────
const couverture = {
  fond: 'linear-gradient(160deg, #c9557c 0%, #a2508f 45%, #7f4db3 100%)',
  fondDos: '#7f4db3',
  fondTranche: '#6c409d',
  css: `
.cf { position: absolute; inset: 0; color: #fff; }
.cf .marque { position: absolute; top: 0.55in; left: 0.375in; right: 0.5in; display: flex; align-items: center; gap: 6pt; font-family: var(--f-titre); font-weight: 600; font-size: 12pt; }
.cf .marque img { width: 0.36in; height: 0.36in; }
.cf h1 { position: absolute; top: 1.15in; left: 0.375in; right: 0.5in; font-family: var(--f-titre); font-weight: 700; font-size: 41pt; line-height: 0.95; letter-spacing: -0.01em; }
.cf h1 .surligne { display: inline-block; background: #ffffff; color: #b12559; padding: 0 7pt 2pt; border-radius: 10pt; transform: rotate(-2deg); margin-top: 4pt; }
.cf .sous { position: absolute; top: 3.42in; left: 0.375in; right: 0.6in; font-family: var(--f-texte); font-weight: 600; font-size: 12pt; line-height: 1.35; opacity: 0.95; }
.cf .scene { position: absolute; left: 0.2in; right: 0.32in; bottom: 0.45in; height: 4.2in; }
.cf .disque { position: absolute; left: 50%; bottom: 0.25in; width: 3.9in; height: 3.9in; transform: translateX(-50%); border-radius: 50%; background: #fcf6f3; }
.cf .persos { position: absolute; left: 0; right: 0; bottom: 0.55in; display: flex; justify-content: center; align-items: flex-end; gap: 0.2in; }
.cf .carte-q { position: absolute; background: #fff; color: #2b1722; border-radius: 10pt; padding: 6pt 9pt; font-family: var(--f-titre); font-weight: 600; font-size: 9pt; box-shadow: 0 0 0 1.4pt #2b1722; }
.cf .carte-q .rep { display: flex; align-items: center; gap: 5pt; margin-top: 3pt; font-size: 8pt; }
.cf .carte-q .rep i { font-style: normal; width: 12pt; height: 12pt; border-radius: 99pt; background: #e17398; color: #2a1e36; display: inline-flex; align-items: center; justify-content: center; font-size: 7pt; }
.cf .bulle { position: absolute; width: 0.62in; height: 0.62in; border-radius: 50%; background: #f7cf5b; color: #2b1722; font-family: var(--f-titre); font-weight: 700; font-size: 27pt; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 0 1.4pt #2b1722; }
.cf .pastille { position: absolute; top: 3.95in; right: 0.55in; width: 1.05in; height: 1.05in; border-radius: 50%; background: #f7cf5b; color: #2b1722; font-family: var(--f-titre); font-weight: 700; font-size: 10pt; line-height: 1.02; text-align: center; display: flex; align-items: center; justify-content: center; transform: rotate(10deg); box-shadow: 0 0 0 1.4pt #2b1722; }
.cf .pastille b { display: block; font-size: 21pt; }
.cd { position: absolute; inset: 0; color: #fff; }
.cd .col { position: absolute; top: 0.6in; bottom: 0.6in; left: 0.6in; right: 0.5in; display: flex; flex-direction: column; gap: 15pt; }
.cd .accroche { font-family: var(--f-titre); font-weight: 700; font-size: 23pt; line-height: 1.04; text-wrap: balance; }
.cd .texte { font-size: 10.6pt; line-height: 1.55; }
.cd ul { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 7pt; font-size: 10.2pt; line-height: 1.38; }
.cd li { display: flex; gap: 8pt; align-items: flex-start; }
.cd li .coeur { margin-top: 3pt; }
.cd .carte { background: #fff; color: #2b1722; border-radius: 12pt; padding: 10pt 12pt; transform: rotate(-1.5deg); width: 3.9in; box-shadow: 0 0 0 1.4pt #2b1722; }
.cd .carte .carte-q { font-family: var(--f-titre); font-weight: 600; font-size: 11.5pt; margin-bottom: 6pt; }
.cd .carte .rep { display: flex; align-items: center; justify-content: space-between; gap: 8pt; font-size: 9.6pt; padding: 3pt 0; border-top: 0.8pt solid #f0e0e6; }
.cd .carte .rep span { display: inline-flex; gap: 4pt; align-items: center; }
.cd .citation { font-family: var(--f-plume); font-style: italic; font-size: 14pt; }
.cd .bas { margin-top: auto; display: flex; align-items: flex-end; gap: 8pt; }
.cd .site { font-family: var(--f-titre); font-weight: 600; font-size: 12pt; margin-left: 6pt; }
.ct { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
.ct .vertical { transform: rotate(90deg); white-space: nowrap; color: #fff; font-family: var(--f-titre); font-weight: 600; font-size: 11pt; display: flex; align-items: center; gap: 12pt; }
.ct .vertical small { font-size: 8pt; opacity: 0.85; }
`,
  face: `<div class="cf">
  <div class="marque"><img src="../../../reseaux/studio/public/marque/logo-quiz-couple-180.png" alt="">Quiz Couple</div>
  <h1>${t('Le grand livre')}<br>${t('des quiz')}<br><span class="surligne">${t('de couple')}</span></h1>
  <div class="sous">${t('25 tests et jeux à faire à deux, sans écran')}</div>
  <div class="pastille"><div>${t('plus de')}<b>500</b>${t('questions')}</div></div>
  <div class="scene">
    <div class="disque"></div>
    <div class="carte-q" style="left:0.15in;bottom:2.5in;transform:rotate(-6deg)">${t('Café ou thé ?')}<div class="rep"><i>A</i>${t('Café')}</div><div class="rep"><i>B</i>${t('Thé')}</div></div>
    <div class="bulle" style="right:0.35in;bottom:2.95in;transform:rotate(8deg)">?</div>
    <div class="persos">${mascotte('rose', 'salut', { hauteur: '2.05in' })}${mascotte('violet', 'amoureux', { hauteur: '2.25in' })}</div>
  </div>
</div>`,
  dos: `<div class="cd"><div class="col">
  <div class="accroche">${t('Vous vous connaissez si bien que ça ?')}</div>
  <div class="texte">${t("Les tests et les jeux préférés des visiteurs de quiz-couple.com, en version papier. Prenez deux stylos, asseyez-vous l'un en face de l'autre, et jouez : au restaurant, en voiture, au lit, en week-end... sans téléphone.")}</div>
  <div class="carte"><div class="carte-q">${t('Qui de nous deux chante le plus faux ?')}</div>
    <div class="rep">${t('Vote de la rose')}<span>${R({ taille: 10, plein: true })}${V({ taille: 10 })}</span></div>
    <div class="rep">${t('Vote du violet')}<span>${R({ taille: 10 })}${V({ taille: 10, plein: true })}</span></div></div>
  <ul>
    <li>${coeur(9, { plein: true, couleur: '#f7cf5b' })}<span>${t("Points communs, compatibilité, qui connaît le mieux l'autre, qui de nous deux, tu préfères, je n'ai jamais...")}</span></li>
    <li>${coeur(9, { plein: true, couleur: '#f7cf5b' })}<span>${t('Des scores et des résultats à découvrir ensemble')}</span></li>
    <li>${coeur(9, { plein: true, couleur: '#f7cf5b' })}<span>${t('Une colonne « dans un an » pour refaire les tests et voir ce qui a changé')}</span></li>
  </ul>
  <div class="citation">${t('De quoi parler, et rire, toute la soirée !')}</div>
  <div class="bas">${mascotte('rose', 'mignon', { hauteur: '0.8in' })}${mascotte('violet', 'rire', { hauteur: '0.88in' })}<span class="site">quiz-couple.com</span></div></div>
  <div class="code-barres">${t('Code-barres (ajouté par KDP)')}</div>
</div>`,
  tranche: `<div class="ct"><div class="vertical">${t('Le grand livre des quiz de couple')} <small>Quiz Couple</small></div></div>`,
};

export default {
  id: 'quiz',
  titre: 'Le grand livre des quiz de couple',
  sousTitre: '25 tests et jeux à faire à deux, sans écran',
  trim: { l: 6, h: 9 },
  papier: 'standard',
  encre: 'standard',
  pagesFinales: 152,
  fond: '#ffffff',
  css,
  pages,
  couverture,
};
