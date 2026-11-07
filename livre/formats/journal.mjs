// Format A : « Notre année en couleurs », le journal de couple d'un an.
// Une question et une couleur par jour, chacun sa ligne et sa demi-case,
// une mosaïque « année en pixels » à colorier, un point chaque mois.
// 6 x 9 pouces, intérieur noir et blanc (on colorie avec ses feutres),
// papier crème, environ 148 pages, pages non datées.
import { t, mascotte, pion, coeur, qr, fleur } from '../commun/outils.mjs';

const R = (o = {}) => pion('rose', { couleur: '#231f20', ...o });
const V = (o = {}) => pion('violet', { couleur: '#231f20', ...o });
const L = (n, h = null) => Array.from({ length: n }, () => `<div class="ligne"${h ? ` style="height:${h}"` : ''}></div>`).join('');
const demiCase = (taille = 0.36) => `<span class="demi" style="width:${taille}in;height:${taille * 0.56}in"><i></i><i></i></span>`;

const css = `
.fmt-journal { --c-ligne: #9a9a9a; color: #231f20; }
@media screen { .fmt-journal .feuille { background: #fbf6ec; } }
@media print { .fmt-journal .feuille { background: #ffffff; } }
.fmt-journal .folio { color: #6d6d6d; }
.jt-titre { font-family: var(--f-titre); font-weight: 600; font-size: 22pt; line-height: 1.02; }
.jt-eti { font-family: var(--f-texte); font-weight: 700; font-size: 7pt; letter-spacing: 0.1em; text-transform: uppercase; color: #6d6d6d; display: block; margin-bottom: 3pt; }
.demi { display: inline-flex; border: 1.1pt solid #231f20; border-radius: 3pt; overflow: hidden; vertical-align: middle; flex: none; }
.demi i { flex: 1; }
.demi i + i { border-left: 1.1pt solid #231f20; }
.jour { display: grid; grid-template-columns: 1fr; gap: 3pt; padding: 7pt 0 6pt; border-top: 1pt solid #231f20; }
.jour:first-of-type { border-top: none; padding-top: 2pt; }
.jour-tete { display: flex; align-items: center; justify-content: space-between; gap: 6pt; }
.jour-n { font-family: var(--f-titre); font-weight: 700; font-size: 11pt; }
.jour-date { font-size: 8pt; color: #6d6d6d; margin-left: 6pt; }
.jour-q { font-family: var(--f-titre); font-weight: 600; font-size: 10.2pt; line-height: 1.18; }
.jour-ligne { display: grid; grid-template-columns: 12pt 1fr; gap: 5pt; align-items: end; }
.jour-ligne .pion { margin-bottom: 3pt; }
.jour-ligne .ligne { height: 0.25in; }
.couleur-jour { display: flex; align-items: center; gap: 5pt; font-size: 7pt; color: #6d6d6d; font-family: var(--f-texte); font-weight: 600; }
.bonus { margin-top: auto; border: 1.2pt dashed #231f20; border-radius: 10pt; padding: 8pt 10pt; display: flex; gap: 8pt; align-items: center; }
.bonus b { font-family: var(--f-titre); font-weight: 600; font-size: 10pt; display: block; margin-bottom: 1pt; }
.bonus p { font-size: 8.6pt; line-height: 1.4; }
/* la mosaïque */
.pixels { display: grid; grid-template-columns: 0.22in repeat(6, 1fr); column-gap: 3pt; row-gap: 1.6pt; }
.pixels .m { font-family: var(--f-titre); font-weight: 600; font-size: 7pt; text-align: center; border-bottom: 0.8pt solid #231f20; padding-bottom: 2pt; height: 0.34in; display: flex; flex-direction: column; justify-content: flex-end; }
.pixels .m small { font-family: var(--f-texte); font-weight: 500; font-size: 5.6pt; color: #6d6d6d; }
.pixels .d { font-family: var(--f-texte); font-weight: 600; font-size: 5.8pt; color: #6d6d6d; text-align: right; padding-right: 2pt; line-height: 0.19in; }
.pixels .c { display: flex; height: 0.19in; border: 0.9pt solid #231f20; border-radius: 2pt; overflow: hidden; }
.pixels .c i { flex: 1; }
.pixels .c i + i { border-left: 0.7pt solid #9a9a9a; }
/* la palette */
.palette { display: flex; flex-direction: column; gap: 9pt; margin-top: 6pt; }
.pal { display: grid; grid-template-columns: 0.42in 1fr; gap: 10pt; align-items: center; }
.pal .rond { width: 0.42in; height: 0.42in; border-radius: 50%; border: 1.4pt solid #231f20; }
.pal b { font-family: var(--f-titre); font-weight: 600; font-size: 11pt; display: block; }
.pal span { font-size: 8.2pt; color: #6d6d6d; }
.pal .ligne { height: 0.22in; margin-top: 1pt; }
.etapes { display: flex; flex-direction: column; gap: 12pt; }
.etape { display: grid; grid-template-columns: 26pt 1fr; gap: 10pt; align-items: start; }
.etape-n { width: 26pt; height: 26pt; border-radius: 50%; border: 1.4pt solid #231f20; font-family: var(--f-titre); font-weight: 700; font-size: 12pt; display: flex; align-items: center; justify-content: center; }
.etape h3 { font-family: var(--f-titre); font-weight: 600; font-size: 12.5pt; margin-bottom: 2pt; }
.etape p { font-size: 9.2pt; line-height: 1.48; }
.cadre-photo { border: 1.2pt dashed #231f20; border-radius: 6pt; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 3pt; color: #6d6d6d; font-size: 7.6pt; padding: 8pt; }
.cadre-photo b { font-family: var(--f-titre); font-weight: 600; font-size: 9.5pt; color: #231f20; }
.duo-j { display: flex; align-items: flex-end; justify-content: center; gap: 4pt; }
.bloc { border: 1.1pt solid #231f20; border-radius: 10pt; padding: 8pt 10pt; }
.bloc h3 { font-family: var(--f-titre); font-weight: 600; font-size: 11pt; margin-bottom: 2pt; display: flex; align-items: center; gap: 5pt; }
.bloc .ligne { height: 0.26in; }
.deux { display: grid; grid-template-columns: 1fr 1fr; gap: 9pt; }
.compte { display: grid; grid-template-columns: repeat(3, 1fr); gap: 7pt; }
.compte div { border: 1.1pt solid #231f20; border-radius: 8pt; padding: 6pt 7pt; display: flex; flex-direction: column; gap: 3pt; }
.compte .rond { width: 14pt; height: 14pt; border-radius: 50%; border: 1.2pt solid #231f20; }
.compte b { font-family: var(--f-titre); font-weight: 600; font-size: 9pt; }
.compte .val { font-family: var(--f-titre); font-weight: 600; font-size: 11pt; display: flex; align-items: center; gap: 4pt; white-space: nowrap; }
.compte .val u { text-decoration: none; display: inline-block; width: 0.32in; border-bottom: 1pt solid #231f20; height: 11pt; }
.quizmois { display: flex; flex-direction: column; gap: 5pt; }
.quizmois div { display: flex; align-items: center; justify-content: space-between; gap: 8pt; font-size: 9pt; border-bottom: 0.8pt dotted #9a9a9a; padding-bottom: 4pt; }
.quizmois span { display: inline-flex; gap: 6pt; }
.lettre { flex: 1; display: grid; grid-template-rows: 1fr 1fr; gap: 10pt; }
.lettre .bloc { display: flex; flex-direction: column; }
.lettre .bloc .ligne { height: 0.27in; }
.titre-j { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 12pt; }
.titre-j h1 { font-family: var(--f-titre); font-weight: 700; font-size: 31pt; line-height: 0.98; }
.titre-j .noms { display: grid; grid-template-columns: 1fr auto 1fr; gap: 8pt; align-items: end; width: 100%; margin-top: 10pt; }
.titre-j .noms .ligne { height: 0.34in; border-bottom-style: solid; border-bottom-color: #231f20; }
.titre-j .et { font-family: var(--f-plume); font-style: italic; font-size: 17pt; }
.copy-j { flex: 1; display: flex; flex-direction: column; justify-content: flex-end; gap: 6pt; font-size: 7.4pt; line-height: 1.5; color: #555; }
.copy-j b { color: #231f20; }
.defis { display: flex; flex-direction: column; gap: 0; }
.defi { display: grid; grid-template-columns: 0.55in 1fr 12pt; gap: 8pt; align-items: center; padding: 6pt 0; border-bottom: 0.8pt solid #c9c9c9; }
.defi .mois { font-family: var(--f-titre); font-weight: 600; font-size: 9pt; color: #6d6d6d; }
.defi .txt { font-size: 9.2pt; line-height: 1.3; }
.defi .case { width: 11pt; height: 11pt; border: 1.2pt solid #231f20; border-radius: 2.5pt; }
`;

// ── les questions de la première semaine ─────────────────────────────────
const SEMAINE1 = [
  "Qu'est-ce qui t'a fait sourire aujourd'hui ?",
  'Ton moment préféré de la journée, c\'était quand ?',
  "Un petit truc que j'ai fait cette semaine et que tu as remarqué ?",
  "Si on avait pu sécher la journée, on aurait fait quoi ?",
  'La chanson que tu as dans la tête en ce moment ?',
  "Qu'est-ce que tu voudrais qu'on fasse ce week-end ?",
  "Un compliment que tu ne m'as jamais fait ?",
];
const DEFIS = [
  "Une soirée sans téléphone, du dîner jusqu'au coucher.", 'Cuisiner ensemble une recette que vous ne connaissez pas.', 'Refaire une photo prise au début de votre histoire.',
  "Une balade sans but, juste pour marcher et parler.", 'Vous écrire un mot doux caché quelque part.', 'Regarder le lever ou le coucher du soleil.',
  "Un pique-nique, même dans le salon s'il pleut.", "Un jeu de quiz-couple.com qu'on n'a jamais fait.", "Une journée où l'autre décide de tout.",
  "Apprendre à l'autre un truc qu'on sait faire.", 'Une soirée souvenirs avec les vieilles photos.', 'Écrire la lettre de la fin du journal.',
];

function jour(n, q) {
  return `<div class="jour">
<div class="jour-tete"><div><span class="jour-n">${t(`Jour ${n}`)}</span><span class="jour-date">${t('le ____ / ____')}</span></div><div class="couleur-jour">${t('notre couleur')} ${demiCase(0.42)}</div></div>
<div class="jour-q">${t(q)}</div>
<div class="jour-ligne">${R({ taille: 9 })}<div class="ligne"></div></div>
<div class="jour-ligne"><span></span><div class="ligne"></div></div>
<div class="jour-ligne">${V({ taille: 9 })}<div class="ligne"></div></div>
<div class="jour-ligne"><span></span><div class="ligne"></div></div>
</div>`;
}

function grillePixels(debut) {
  let h = '<div class="pixels"><div></div>';
  for (let m = debut; m < debut + 6; m++) h += `<div class="m">${t(`Mois ${m}`)}<small>______</small></div>`;
  for (let d = 1; d <= 31; d++) {
    h += `<div class="d">${d}</div>`;
    for (let m = 0; m < 6; m++) h += '<div class="c"><i></i><i></i></div>';
  }
  return h + '</div>';
}

const PALETTE = [
  ['Journée douce', 'Rien de spécial, et c\'était très bien comme ça'],
  ['Fou rire', 'On a ri à en pleurer'],
  ['Câlins', 'Tendresse, bisous, la journée canapé'],
  ['Journée chargée', 'Travail, cours, fatigue : on s\'est peu vus'],
  ['On s\'est pris la tête', 'Une dispute, petite ou grande'],
  ['Loin l\'un de l\'autre', 'Pas ensemble aujourd\'hui, mais on y a pensé'],
];

const pages = [
  {
    folio: 1, titre: 'Page de titre', sansFolio: true,
    html: `<div class="titre-j">
  <div class="duo-j">${mascotte('rose', 'amoureux', { mode: 'trait', hauteur: '1.25in' })}${mascotte('violet', 'amoureux', { mode: 'trait', hauteur: '1.38in' })}</div>
  <h1>${t('Notre année')}<br>${t('en couleurs')}</h1>
  <p class="jt-eti" style="margin:0">${t('Le journal de couple')}</p>
  <div class="noms"><div class="ligne"></div><span class="et">&amp;</span><div class="ligne"></div></div>
  <p style="font-family:var(--f-titre);font-weight:500;font-size:10pt;color:#555">${t('Commencé le ____ / ____ / ________')}</p>
</div>`,
  },
  {
    folio: 2, titre: 'Mentions', sansFolio: true,
    html: `<div class="copy-j"><p><b>${t('Notre année en couleurs')}</b><br>${t('Un journal de Quiz Couple, quiz-couple.com')}</p>
<p>${t('© 2026 Quiz Couple · Visibilitea, entreprise individuelle, Strasbourg. Tous droits réservés.')}</p>
<p>${t("Les pages ne sont pas datées : commencez le jour que vous voulez, un 1er janvier, un anniversaire ou un mardi soir.")}</p>
<p>${t('ISBN : à venir · Imprimé à la demande par Amazon KDP.')}</p></div>`,
  },
  {
    folio: 3, titre: 'Comment ça marche',
    html: `<span class="jt-eti">${t('Avant de commencer')}</span><div class="jt-titre" style="margin-bottom:14pt">${t('Deux minutes par soir')}</div>
<div class="etapes">
  <div class="etape"><div class="etape-n">1</div><div><h3>${t('Une question par jour')}</h3><p>${t("Chaque jour a sa question, légère, drôle ou tendre. Chacun écrit sa réponse sur sa ligne, sans regarder celle de l'autre. Trois mots suffisent, une phrase c'est déjà très bien.")}</p></div></div>
  <div class="etape"><div class="etape-n">2</div><div><h3>${t('Une couleur par jour')}</h3><p>${t("Chacun colorie sa moitié de case avec la couleur de sa journée, ici et dans la grande mosaïque des pages 6 et 7. Au bout d'un an, vous verrez votre année en couleurs.")}</p></div></div>
  <div class="etape"><div class="etape-n">3</div><div><h3>${t('Un jour raté ? Aucun problème')}</h3><p>${t("Les pages ne sont pas datées, il n'y a donc rien à rattraper. On reprend le lendemain, ou la semaine suivante. Ce journal n'est pas un devoir !")}</p></div></div>
  <div class="etape"><div class="etape-n">4</div><div><h3>${t('Un point chaque mois')}</h3><p>${t("À la fin de chaque mois, une page pour compter vos couleurs, choisir le moment du mois et relever un petit défi.")}</p></div></div>
</div>
<div class="bonus">${mascotte('violet', 'clin' in {} ? 'repos' : 'repos', { mode: 'trait', hauteur: '0.62in', extra: { yeux: 'clin' } })}<div><b>${t("L'astuce")}</b><p>${t('Laissez le journal sur la table de nuit avec deux feutres. Le plus dur, c\'est de penser à l\'ouvrir : après une semaine, ça devient un petit rituel.')}</p></div></div>`,
  },
  {
    folio: 4, titre: 'Notre code couleur',
    html: `<span class="jt-eti">${t('À faire une fois')}</span><div class="jt-titre">${t('Notre code couleur')}</div>
<p style="font-size:9pt;line-height:1.45;margin-top:6pt">${t("Prenez six feutres et coloriez chaque rond : ce sera votre code pour toute l'année. Les noms sont des idées, changez-les si vous voulez.")}</p>
<div class="palette">${PALETTE.map(([n, d]) => `<div class="pal"><div class="rond"></div><div><b>${t(n)}</b><span>${t(d)}</span><div class="ligne"></div></div></div>`).join('')}</div>
<div class="deux" style="margin-top:auto">
  <div class="bloc" style="display:flex;align-items:center;gap:8pt">${R({ taille: 16 })}<div style="flex:1"><div style="font-size:7.4pt;color:#6d6d6d">${t('Le rond, c\'est')}</div><div class="ligne" style="height:0.24in"></div></div></div>
  <div class="bloc" style="display:flex;align-items:center;gap:8pt">${V({ taille: 16 })}<div style="flex:1"><div style="font-size:7.4pt;color:#6d6d6d">${t('La gélule, c\'est')}</div><div class="ligne" style="height:0.24in"></div></div></div>
</div>`,
  },
  {
    folio: 5, titre: 'Notre point de départ',
    html: `<span class="jt-eti">${t('Le jour 1')}</span><div class="jt-titre" style="margin-bottom:10pt">${t('Notre point de départ')}</div>
<div style="display:flex;flex-direction:column;gap:9pt;flex:1">
  <div class="bloc"><h3>${t('On est ensemble depuis')}</h3><div class="ligne"></div></div>
  <div class="bloc"><h3>${t('Notre chanson, en ce moment')}</h3><div class="ligne"></div></div>
  <div class="deux">
    <div class="bloc"><h3>${R({ taille: 10 })} ${t("Ce que j'espère de cette année")}</h3>${L(4)}</div>
    <div class="bloc"><h3>${V({ taille: 10 })} ${t("Ce que j'espère de cette année")}</h3>${L(4)}</div>
  </div>
  <div class="cadre-photo" style="flex:1"><b>${t('Une photo de nous, aujourd\'hui')}</b>${t('à coller ici, pour la comparer avec celle de la fin')}</div>
</div>`,
  },
  {
    folio: 6, titre: 'Notre année en pixels (mois 1 à 6)',
    html: `<span class="jt-eti">${t('Un demi-carré chacun, chaque soir')}</span><div class="jt-titre" style="font-size:19pt;margin-bottom:6pt">${t('Notre année en pixels')}</div>
<div style="display:flex;gap:10pt;align-items:center;font-size:7.4pt;color:#555;margin-bottom:6pt">${demiCase(0.3)} ${t('à gauche le rond, à droite la gélule')}</div>
${grillePixels(1)}`,
  },
  {
    folio: 7, titre: 'Notre année en pixels (mois 7 à 12)',
    html: `<div style="height:0.62in;display:flex;align-items:flex-end;justify-content:flex-end;font-size:7.4pt;color:#555;margin-bottom:6pt;gap:5pt">${t('Écrivez le nom du mois en haut de chaque colonne')}</div>
${grillePixels(7)}`,
  },
  {
    folio: 8, titre: 'Les douze défis',
    html: `<span class="jt-eti">${t('Un par mois')}</span><div class="jt-titre" style="margin-bottom:8pt">${t('Les douze défis')}</div>
<p style="font-size:9pt;line-height:1.45;margin-bottom:6pt">${t("Chaque mois commence par un petit défi à relever à deux. Cochez-le quand c'est fait, et racontez-le dans le point du mois.")}</p>
<div class="defis">${DEFIS.map((d, i) => `<div class="defi"><span class="mois">${t(`Mois ${i + 1}`)}</span><span class="txt">${t(d)}</span><span class="case"></span></div>`).join('')}</div>`,
  },
  {
    folio: 9, titre: 'Mois 1',
    perdu: '',
    html: `<div style="display:flex;justify-content:space-between;align-items:flex-start"><div><span class="jt-eti">${t('Jours 1 à 31')}</span><div style="font-family:var(--f-titre);font-weight:700;font-size:44pt;line-height:0.9">${t('Mois 1')}</div><div style="font-family:var(--f-titre);font-weight:500;font-size:11pt;color:#555;margin-top:6pt">${t('le mois de ____________')}</div></div>${mascotte('rose', 'salut', { mode: 'trait', hauteur: '1.05in' })}</div>
<div style="display:flex;flex-direction:column;gap:10pt;margin-top:14pt;flex:1">
  <div class="bloc"><h3>${t('Ce mois-ci, on aimerait...')}</h3>${L(3)}</div>
  <div class="bloc" style="display:flex;gap:9pt;align-items:center"><div style="flex:1"><h3>${t('Le défi du mois')}</h3><p style="font-size:9.6pt;line-height:1.4">${t(DEFIS[0])}</p><p style="font-size:8pt;color:#6d6d6d;margin-top:4pt">${t('Relevé le ____ / ____')}</p></div>${coeur(22, { couleur: '#231f20' })}</div>
  <div class="cadre-photo" style="flex:1"><b>${t('La photo du mois')}</b>${t('à coller à la fin du mois')}</div>
</div>`,
  },
  {
    folio: 10, titre: 'Semaine 1 (jours 1 à 4)',
    html: `<div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:5pt"><div class="jt-titre" style="font-size:17pt">${t('Semaine 1')}</div><span class="jt-eti" style="margin:0">${t('Mois 1')}</span></div>
${SEMAINE1.slice(0, 4).map((q, i) => jour(i + 1, q)).join('')}`,
  },
  {
    folio: 11, titre: 'Semaine 1 (jours 5 à 7)',
    html: `${SEMAINE1.slice(4).map((q, i) => jour(i + 5, q)).join('')}
<div class="bonus">${mascotte('violet', 'joie', { mode: 'trait', hauteur: '0.62in' })}<div><b>${t('Le bonus du week-end')}</b><p>${t('Refaites une photo prise au début de votre histoire : même pose, même endroit si possible. Collez-la page 5, à côté de la première.')}</p></div></div>`,
  },
  {
    folio: 18, titre: 'Le point du mois 1',
    html: `<span class="jt-eti">${t('Fin du mois 1')}</span><div class="jt-titre" style="margin-bottom:8pt">${t('Le point du mois')}</div>
<div class="compte">${PALETTE.map(([n]) => `<div><span class="rond"></span><b>${t(n)}</b><span class="val">${R({ taille: 9 })}<u></u> ${V({ taille: 9 })}<u></u></span></div>`).join('')}</div>
<div class="deux" style="margin-top:9pt">
  <div class="bloc"><h3>${R({ taille: 10 })} ${t('Mon moment du mois')}</h3>${L(3)}</div>
  <div class="bloc"><h3>${V({ taille: 10 })} ${t('Mon moment du mois')}</h3>${L(3)}</div>
</div>
<div class="bloc" style="margin-top:9pt"><h3>${t('Le quiz du mois')}</h3><div class="quizmois">
  ${['Qui a dit « je t\'aime » le plus souvent ?', 'Qui a été le plus en retard ?', 'Qui a fait le meilleur repas ?', 'Qui a eu le plus de fous rires ?'].map((q) => `<div>${t(q)}<span>${R({ taille: 10 })}${V({ taille: 10 })}</span></div>`).join('')}
</div></div>
<div class="bloc" style="margin-top:auto"><h3>${t('Le mois prochain, on refait... et on laisse tomber...')}</h3>${L(2)}</div>`,
  },
  {
    folio: 142, titre: 'Notre année en chiffres',
    html: `<span class="jt-eti">${t('Jour 365')}</span><div class="jt-titre" style="margin-bottom:8pt">${t('Notre année en chiffres')}</div>
<p style="font-size:9pt;line-height:1.45;margin-bottom:8pt">${t('Comptez les demi-cases de la mosaïque, couleur par couleur. Le premier qui triche refait le compte.')}</p>
<div class="compte">${PALETTE.map(([n]) => `<div><span class="rond"></span><b>${t(n)}</b><span class="val">${R({ taille: 9 })}<u></u> ${V({ taille: 9 })}<u></u></span></div>`).join('')}</div>
<div style="display:flex;flex-direction:column;gap:8pt;margin-top:10pt;flex:1">
  ${['Notre couleur de l\'année', 'Le meilleur mois, et pourquoi', 'La question qui nous a le plus fait rire'].map((h) => `<div class="bloc"><h3>${t(h)}</h3><div class="ligne"></div></div>`).join('')}
  <div class="cadre-photo" style="flex:1"><b>${t('Une photo de nous, un an après')}</b>${t('la même pose que celle de la page 5 ?')}</div>
</div>`,
  },
  {
    folio: 143, titre: 'La lettre à relire dans un an',
    html: `<span class="jt-eti">${t('À ouvrir le ____ / ____ / ________')}</span><div class="jt-titre" style="margin-bottom:8pt">${t('La lettre à relire dans un an')}</div>
<div class="lettre">
  <div class="bloc"><h3>${R({ taille: 10 })} ${t('Ce que je veux te dire pour la suite')}</h3>${L(8)}</div>
  <div class="bloc"><h3>${V({ taille: 10 })} ${t('Ce que je veux te dire pour la suite')}</h3>${L(8)}</div>
</div>`,
  },
  {
    folio: 148, titre: 'La suite', sansFolio: true,
    html: `<div class="titre-j">
  <div class="duo-j">${mascotte('rose', 'joie', { mode: 'trait', hauteur: '1.05in' })}${mascotte('violet', 'joie', { mode: 'trait', hauteur: '1.15in' })}</div>
  <h1 style="font-size:24pt">${t('Une année de plus ?')}</h1>
  <p style="font-size:9.6pt;line-height:1.5;max-width:3.9in">${t("Le journal de l'année 2 vous attend sur Amazon, avec 365 nouvelles questions. Et en attendant, des dizaines de tests et de jeux à deux sur quiz-couple.com.")}</p>
  ${qr('https://quiz-couple.com/')}
  <div style="font-family:var(--f-titre);font-weight:600;font-size:12pt">quiz-couple.com</div>
</div>`,
  },
];

// ── La couverture : une mosaïque en cœur, chaque case partagée en deux ────
const COUL = ['#e17398', '#7f4db3', '#f7cf5b', '#8fc8ff', '#94c78e', '#ffb3d1', '#c9557c', '#a581c9', '#ec9769'];
const COEUR = ['..XXX...XXX..', '.XXXXX.XXXXX.', 'XXXXXXXXXXXXX', 'XXXXXXXXXXXXX', 'XXXXXXXXXXXXX', '.XXXXXXXXXXX.', '..XXXXXXXXX..', '...XXXXXXX...', '....XXXXX....', '.....XXX.....', '......X......'];
function mosaique(taille = 0.27) {
  let graine = 7;
  const hasard = () => { graine = (graine * 16807) % 2147483647; return graine / 2147483647; };
  const cote = taille * 72; // en points
  const l = COEUR[0].length * cote, h = COEUR.length * cote;
  let r = `<svg viewBox="0 0 ${l} ${h}" style="width:${COEUR[0].length * taille}in;height:${COEUR.length * taille}in" aria-hidden="true">`;
  COEUR.forEach((ligne, y) => [...ligne].forEach((ch, x) => {
    if (ch !== 'X') return;
    const a = COUL[Math.floor(hasard() * COUL.length)], b = COUL[Math.floor(hasard() * COUL.length)];
    const X = x * cote + 1.2, Y = y * cote + 1.2, c = cote - 2.4;
    r += `<rect x="${X}" y="${Y}" width="${c / 2}" height="${c}" fill="${a}"/><rect x="${X + c / 2}" y="${Y}" width="${c / 2}" height="${c}" fill="${b}"/><rect x="${X}" y="${Y}" width="${c}" height="${c}" rx="2.5" fill="none" stroke="#170f23" stroke-width="1.6"/>`;
  }));
  return r + '</svg>';
}

const couverture = {
  fond: '#170f23',
  fondDos: '#170f23',
  fondTranche: '#2a1d38',
  css: `
.cfj { position: absolute; inset: 0; color: #f4ecf0; }
.cfj .marque { position: absolute; top: 0.55in; left: 0.375in; display: flex; align-items: center; gap: 6pt; font-family: var(--f-titre); font-weight: 600; font-size: 12pt; }
.cfj .marque img { width: 0.36in; height: 0.36in; }
.cfj h1 { position: absolute; top: 1.1in; left: 0.375in; right: 0.5in; font-family: var(--f-titre); font-weight: 700; font-size: 40pt; line-height: 0.98; }
.cfj h1 .arc span { display: inline-block; }
.cfj .sous { position: absolute; top: 2.72in; left: 0.375in; right: 0.7in; font-size: 11.5pt; line-height: 1.4; font-weight: 600; color: #c09df1; }
.cfj .mos { position: absolute; left: calc(50% - 0.06in); top: 3.45in; transform: translateX(-50%); }
.cfj .persos { position: absolute; left: 0; right: 0.125in; bottom: 0.42in; display: flex; justify-content: center; align-items: flex-end; gap: 0.15in; }
.cfj .pastille { position: absolute; top: 0.48in; right: 0.55in; width: 1in; height: 1in; border-radius: 50%; background: #f7cf5b; color: #2b1722; font-family: var(--f-titre); font-weight: 700; font-size: 9pt; line-height: 1.05; text-align: center; display: flex; align-items: center; justify-content: center; transform: rotate(10deg); }
.cfj .pastille b { display: block; font-size: 20pt; }
.cdj { position: absolute; inset: 0; color: #f4ecf0; }
.cdj .col { position: absolute; top: 0.6in; bottom: 0.6in; left: 0.6in; right: 0.5in; display: flex; flex-direction: column; gap: 20pt; }
.cdj .accroche { font-family: var(--f-titre); font-weight: 700; font-size: 24pt; line-height: 1.05; text-wrap: balance; }
.cdj .texte { font-size: 11pt; line-height: 1.58; }
.cdj ul { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 8pt; font-size: 10.8pt; line-height: 1.4; }
.cdj li { display: flex; gap: 8pt; align-items: flex-start; }
.cdj li .coeur { margin-top: 3pt; }
.cdj .exemple { border: 1.2pt solid #54446a; background: #2a1d38; border-radius: 12pt; padding: 10pt 12pt; display: flex; flex-direction: column; gap: 6pt; }
.cdj .exemple .ex-q { font-family: var(--f-titre); font-weight: 600; font-size: 12pt; }
.cdj .exemple .r { display: flex; align-items: center; gap: 8pt; font-family: var(--f-plume); font-style: italic; font-size: 12.5pt; color: #e8d9e1; }
.cdj .exemple .r i { width: 0.34in; height: 0.19in; border-radius: 3pt; display: inline-flex; overflow: hidden; border: 1pt solid #f4ecf0; flex: none; }
.cdj .exemple .r i b { flex: 1; }
.cdj .bas { margin-top: auto; display: flex; align-items: flex-end; gap: 10pt; font-family: var(--f-titre); font-weight: 600; font-size: 12pt; }
.ctj { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
.ctj .vertical { transform: rotate(90deg); white-space: nowrap; color: #f4ecf0; font-family: var(--f-titre); font-weight: 600; font-size: 11pt; display: flex; align-items: center; gap: 12pt; }
`,
  face: `<div class="cfj">
  <div class="marque"><img src="../../../reseaux/studio/public/marque/logo-quiz-couple-180.png" alt="">Quiz Couple</div>
  <div class="pastille"><div><b>365</b>${t('questions')}<br>${t('à deux')}</div></div>
  <h1>${t('Notre année')}<br><span class="arc">${[...'en couleurs'].map((c, i) => c === ' ' ? ' ' : `<span style="color:${['#e17398', '#f7cf5b', '#8fc8ff', '#94c78e', '#ffb3d1', '#c09df1', '#e17398', '#f7cf5b', '#8fc8ff', '#94c78e', '#ffb3d1'][i]}">${c}</span>`).join('')}</span></h1>
  <div class="sous">${t('Le journal de couple : une question et une couleur par jour, pendant un an')}</div>
  <div class="mos">${mosaique(0.27)}</div>
  <div class="persos">${mascotte('rose', 'mignon', { hauteur: '1.5in' })}${mascotte('violet', 'amoureux', { hauteur: '1.68in' })}</div>
</div>`,
  dos: `<div class="cdj"><div class="col">
  <div class="accroche">${t('Deux minutes par soir, pendant un an')}</div>
  <div class="texte">${t("Chaque jour, une question légère, drôle ou tendre, et une couleur pour dire comment s'est passée votre journée. Chacun écrit sur sa ligne et colorie sa moitié de case. Au bout d'un an : 365 petites réponses, et la mosaïque de votre année à deux.")}</div>
  <div class="exemple"><div class="ex-q">${t('Jour 12 · Qu\'est-ce qui t\'a fait sourire aujourd\'hui ?')}</div>
    <div class="r"><i><b style="background:#f7cf5b"></b><b style="background:#e17398"></b></i>${t('Ton message de ce matin.')}</div>
    <div class="r"><i><b style="background:#8fc8ff"></b><b style="background:#94c78e"></b></i>${t('Le chat qui a volé ta tartine.')}</div></div>
  <ul>
    <li>${coeur(10, { plein: true, couleur: '#f7cf5b' })}<span>${t('365 questions, une mosaïque « année en pixels » à colorier, un point chaque mois')}</span></li>
    <li>${coeur(10, { plein: true, couleur: '#f7cf5b' })}<span>${t('Douze petits défis, et une lettre à relire dans un an')}</span></li>
    <li>${coeur(10, { plein: true, couleur: '#f7cf5b' })}<span>${t('Pages non datées : on commence quand on veut')}</span></li>
  </ul>
  <div class="bas">${mascotte('rose', 'dort', { hauteur: '0.8in' })}${mascotte('violet', 'dort', { hauteur: '0.88in' })}<span style="margin-left:6pt">quiz-couple.com</span></div></div>
  <div class="code-barres">${t('Code-barres (ajouté par KDP)')}</div>
</div>`,
  tranche: `<div class="ctj"><div class="vertical">${t('Notre année en couleurs')} <span style="font-size:8pt;opacity:.8">Quiz Couple</span></div></div>`,
};

export default {
  id: 'journal',
  titre: 'Notre année en couleurs',
  sousTitre: 'Le journal de couple : une question et une couleur par jour, pendant un an',
  trim: { l: 6, h: 9 },
  papier: 'creme',
  encre: 'nb',
  pagesFinales: 148,
  fond: '#ffffff',
  css,
  pages,
  couverture,
};
