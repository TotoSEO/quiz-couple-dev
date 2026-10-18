// Le rapport du bilan de couple : un seul gabarit HTML pour l'écran (la page
// du bilan, une fois payé) et pour le PDF (bilan/fabrique.mjs, imprimé par
// Chrome en A4). La feuille de style est à côté : rapport.css.
//
// Le générateur du site sert ce fichier en /js/bilan-rapport.js, sans les
// `import` ni les `export`, sous window.QCBilanRapport (le calcul vient alors
// de window.QCBilanCoeur). Rien ici ne touche au DOM : on rend une chaîne.
//
// Règles de mise en page, pour qu'aucun mot ne sorte de sa boîte, dans
// aucune langue : jamais de position absolue pour du texte (sauf le chiffre
// au centre d'un anneau, qui a trois signes au plus) ; les colonnes sont des
// grilles à `minmax(0, 1fr)` ; les prénoms (30 signes au plus) ont toujours
// une ligne à eux ; le PDF reçoit des césures calculées d'avance (`couper`),
// Chrome n'en ayant pas sans dictionnaire. bilan/mise-en-page.mjs vérifie
// tout ça sur chaque rapport avant l'envoi.

import * as C from './coeur.mjs';

export const VERSION_RAPPORT = 1;

const LOCALES = { fr: 'fr-FR', en: 'en-GB', es: 'es-ES', de: 'de-DE', it: 'it-IT' };

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// {{cle}} → valeur (textes de l'interface).
function remplir2(texte, vars) {
  return String(texte == null ? '' : texte).replace(/\{\{(\w+)\}\}/g, (m, k) => (vars && vars[k] != null ? String(vars[k]) : ''));
}

// La ponctuation haute collée à son mot, en français : espace fine
// insécable devant ? ! ; et insécable devant : et dans les guillemets.
function insecables(s, lang) {
  if (lang !== 'fr') return String(s);
  return String(s)
    .replace(/ ([?!;])/g, '\u202f$1')
    .replace(/ ([:»])/g, '\u00a0$1')
    .replace(/« /g, '«\u00a0');
}

// Les deux couleurs : une femme est la rose, un homme le violet ; sinon le
// premier est la rose et le second le violet (la règle des moteurs du site).
export function couleurs(ga, gb) {
  if (ga === gb) return ['rose', 'violet'];
  if (ga === 'h' || gb === 'f') return ['violet', 'rose'];
  return ['rose', 'violet'];
}

function nombreFormate(n, lang) {
  try { return new Intl.NumberFormat(LOCALES[lang] || 'fr-FR').format(n); } catch (e) { return String(n); }
}

function dateLongue(iso, lang) {
  const d = iso ? new Date(iso) : new Date();
  try {
    return d.toLocaleDateString(LOCALES[lang] || 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' });
  } catch (e) {
    return d.toISOString().slice(0, 10);
  }
}

// La taille des prénoms sur la couverture, selon le plus long.
function tailleCouverture(a, b) {
  const n = Math.max(String(a).length, String(b).length);
  if (n <= 9) return 'xl';
  if (n <= 14) return 'l';
  if (n <= 20) return 'm';
  return 's';
}

// d : { lang, situation, a: { prenom, genre, reponses, nn }, b: {...}, finiLe }
// T : l'objet `app` de {lang}/bilan.json
// Q : {lang}/bilan-questions.json
// o : { format: 'pdf' | 'ecran', couper: (texte) => texte, editeur: '...' }
// Renvoie { html, analyse, pages: liste des chapitres }.
export function rapportHtml(d, T, Q, o) {
  o = o || {};
  const lang = d.lang || 'fr';
  const format = o.format === 'pdf' ? 'pdf' : 'ecran';
  const couper = typeof o.couper === 'function' ? o.couper : (s) => s;
  const analyse = C.analyser(d.situation, d.a, d.b);
  const [coulA, coulB] = couleurs(d.a.genre, d.b.genre);
  const P = {
    a: { cle: 'a', nom: d.a.prenom, genre: d.a.genre || null, couleur: coulA, rep: d.a.reponses || {}, nn: d.a.nn || [] },
    b: { cle: 'b', nom: d.b.prenom, genre: d.b.genre || null, couleur: coulB, rep: d.b.reponses || {}, nn: d.b.nn || [] },
  };
  P.a.autre = P.b;
  P.b.autre = P.a;

  // ── Les textes ──
  function brut(chemin) {
    let x = T;
    for (const p of chemin.split('.')) {
      if (x == null || typeof x !== 'object' || !(p in x)) return '';
      x = x[p];
    }
    return x == null ? '' : x;
  }
  // Un texte de l'interface, rempli, coupé, échappé.
  const tx = (chemin, vars) => esc(couper(insecables(remplir2(brut(chemin), vars), lang)));
  // Un texte venu d'ailleurs (questions, prénoms), coupé et échappé.
  const tl = (s) => esc(couper(insecables(s, lang)));
  // Un prénom : jamais coupé par le dictionnaire, il passe à la ligne où il peut.
  const nomH = (p) => '<span class="rap-nom rap-nom--' + p.couleur + '">' + esc(p.nom) + '</span>';
  const pastille = (p) => '<span class="rap-pastille rap-pastille--' + p.couleur + '" aria-hidden="true"></span>';

  const textQ = (id) => {
    const r = C.INDEX[id];
    return (r && Q.domaines[r.d.id] && Q.domaines[r.d.id].questions[id]) || {};
  };
  const titreDomaine = (id) => (Q.domaines[id] && Q.domaines[id].titre) || id;
  // La question telle que A l'a lue (accord neutre).
  const enonce = (id) => C.remplir(C.accorder(textQ(id).q || '', null), { autre: P.b.nom });
  const court = (id) => textQ(id).court || enonce(id);
  // La réponse de quelqu'un, écrite pour être lue par les deux.
  function reponseLue(id, p) {
    const r = C.INDEX[id];
    const v = p.rep[id];
    if (!Number.isInteger(v)) return '';
    if (r.q.type === 'qui') {
      if (v === 2) return Q.quiNeutre[2];
      return C.remplir(Q.quiNeutre[v < 2 ? v : 4 - v], { nom: v < 2 ? p.nom : p.autre.nom });
    }
    return C.remplir(C.accorder((textQ(id).o || [])[v] || '', p.genre), { autre: p.autre.nom });
  }

  const parId = {};
  analyse.items.forEach((i) => { parId[i.id] = i; });
  const etatParId = {};
  analyse.etats.forEach((e) => { etatParId[e.id] = e; });
  const domaineParId = {};
  analyse.domaines.forEach((x) => { domaineParId[x.id] = x; });
  const nbQuestions = analyse.items.length + analyse.etats.length;
  const domainesNotes = analyse.domaines.filter((x) => !x.meteo && x.score !== null);

  // ── Petits blocs ──

  function chapitre(cle, numero, contenu, intro) {
    return '<section class="rap-chap rap-chap--' + cle + '" data-chap="' + cle + '">'
      + '<div class="rap-chap-tete"><p class="rap-chap-num">' + String(numero).padStart(2, '0') + '</p>'
      + '<h2 class="rap-chap-titre">' + tx('rapport.chapitres.' + cle) + '</h2>'
      + (intro ? '<p class="rap-chap-intro">' + intro + '</p>' : '')
      + '</div>' + contenu + '</section>';
  }

  function anneau(valeur, couleur, libelle) {
    const r = 52;
    const tour = 2 * Math.PI * r;
    const plein = Math.max(0, Math.min(100, valeur)) / 100 * tour;
    return '<div class="rap-anneau rap-anneau--' + couleur + '" role="img" aria-label="' + esc(libelle) + ' : ' + valeur + ' %">'
      + '<svg viewBox="0 0 120 120" width="120" height="120" aria-hidden="true">'
      + '<circle cx="60" cy="60" r="' + r + '" class="rap-anneau-fond"/>'
      + '<circle cx="60" cy="60" r="' + r + '" class="rap-anneau-trait" stroke-dasharray="' + plein.toFixed(2) + ' ' + tour.toFixed(2) + '" transform="rotate(-90 60 60)"/>'
      + '</svg><p class="rap-anneau-valeur">' + valeur + '<span>%</span></p></div>';
  }

  function etiquetteCat(item) {
    const morceaux = ['<span class="rap-tag rap-tag--' + item.cat + '">' + tx('rapport.cat.' + item.cat) + '</span>'];
    if (item.statut) morceaux.push('<span class="rap-tag rap-tag--' + item.statut + '">' + tx('rapport.statut.' + item.statut) + '</span>');
    if (item.chacunPlus) morceaux.push('<span class="rap-tag rap-tag--chacun">' + tx('rapport.roles.chacunPlus') + '</span>');
    return '<p class="rap-tags">' + morceaux.join('') + '</p>';
  }

  // Les deux réponses côte à côte, chacune sous le prénom de qui l'a donnée.
  function deuxReponses(id, nnA, nnB) {
    const col = (p, nn) => '<div class="rap-rep rap-rep--' + p.couleur + '">'
      + '<p class="rap-rep-qui">' + pastille(p) + nomH(p) + '</p>'
      + '<p class="rap-rep-texte">' + tl(reponseLue(id, p)) + '</p>'
      + (nn ? '<p class="rap-rep-nn">' + tx('rapport.nnDe', { nom: p.nom }) + '</p>' : '')
      + '</div>';
    return '<div class="rap-reps">' + col(P.a, nnA) + col(P.b, nnB) + '</div>';
  }

  function guide(id, complet) {
    const t = textQ(id);
    let html = '';
    if (t.pourquoi) html += '<div class="rap-guide-bloc"><p class="rap-guide-titre">' + tx('rapport.pourquoi') + '</p><p>' + tl(t.pourquoi) + '</p></div>';
    if (complet && Array.isArray(t.parler) && t.parler.length) {
      html += '<div class="rap-guide-bloc"><p class="rap-guide-titre">' + tx('rapport.parler') + '</p><ul class="rap-puces">'
        + t.parler.map((q) => '<li>' + tl(q) + '</li>').join('') + '</ul></div>';
    }
    if (complet && t.eviter) html += '<div class="rap-guide-bloc"><p class="rap-guide-titre">' + tx('rapport.eviter') + '</p><p>' + tl(t.eviter) + '</p></div>';
    return html ? '<div class="rap-guide">' + html + '</div>' : '';
  }

  // Une carte d'écart : la question, les deux réponses, le guide.
  // mode : 'complet' (tout le guide), 'court' (pourquoi ça compte), ou
  // 'renvoi' vers la carte complète déjà donnée plus haut.
  function carteEcart(item, surtitre, mode, renvoi) {
    mode = mode || 'complet';
    let note = '';
    if (item.desequilibre) {
      const p = item.desequilibre === 'a' ? P.a : P.b;
      note = '<p class="rap-carte-note">' + tx('rapport.roles.desequilibre', { nom: p.nom }) + '</p>';
    } else if (item.chacunPlus) {
      note = '<p class="rap-carte-note">' + tx('rapport.roles.chacunPlusTexte') + '</p>';
    }
    return '<article class="rap-carte rap-carte--' + item.cat + '">'
      + (surtitre ? '<p class="rap-carte-sur">' + surtitre + '</p>' : '')
      + '<h3 class="rap-carte-titre">' + tl(court(item.id)) + '</h3>'
      + '<p class="rap-carte-q">' + tl(enonce(item.id)) + '</p>'
      + etiquetteCat(item)
      + deuxReponses(item.id, item.nnA, item.nnB)
      + note
      + (mode === 'renvoi' ? '<p class="rap-renvoi">' + renvoi + '</p>' : guide(item.id, mode === 'complet'))
      + '</article>';
  }

  // Une échelle à n crans, avec la place de chacun.
  // sens : 'bien' (de ce qui va le mieux à ce qui va le moins bien) ou
  // 'roles' (de « surtout A » à « surtout B ») ; colore la ligne.
  function echelle(n, posA, posB, libelles, sens) {
    let crans = '';
    for (let i = 0; i < n; i++) {
      const ici = [];
      if (posA === i) ici.push('<span class="rap-marque rap-marque--' + P.a.couleur + '" title="' + esc(P.a.nom) + '"></span>');
      if (posB === i) ici.push('<span class="rap-marque rap-marque--' + P.b.couleur + '" title="' + esc(P.b.nom) + '"></span>');
      crans += '<div class="rap-cran"><div class="rap-cran-point">' + ici.join('') + '</div>'
        + (libelles ? '<p class="rap-cran-lib">' + tl(libelles[i] || '') + '</p>' : '') + '</div>';
    }
    const classe = sens === 'roles' ? ' rap-echelle--' + P.a.couleur + '-' + P.b.couleur : sens === 'bien' ? ' rap-echelle--bien' : '';
    return '<div class="rap-echelle' + classe + '" style="--crans:' + n + '">' + crans + '</div>';
  }

  // La ligne de chacun sous une échelle : sa couleur, son prénom, sa réponse.
  function lignesReponses(id) {
    const l = (p) => '<li class="rap-qui-dit">' + pastille(p) + '<span class="rap-qui-dit-texte">' + nomH(p)
      + '<span class="rap-deux-points">' + (lang === 'fr' ? '\u00a0: ' : ': ') + '</span>' + tl(reponseLue(id, p)) + '</span></li>';
    return '<ul class="rap-qui-dits">' + l(P.a) + l(P.b) + '</ul>';
  }

  const legendeDuo = '<p class="rap-legende-duo"><span class="rap-legende-item">' + pastille(P.a) + nomH(P.a) + '</span>'
    + '<span class="rap-legende-item">' + pastille(P.b) + nomH(P.b) + '</span></p>';

  // ── Couverture ──

  const taille = tailleCouverture(P.a.nom, P.b.nom);
  const couverture = '<section class="rap-couv" data-chap="couverture">'
    + '<div class="rap-couv-deco" aria-hidden="true"><span class="rap-rond rap-rond--' + P.a.couleur + '"></span><span class="rap-rond rap-rond--' + P.b.couleur + '"></span></div>'
    + '<div class="rap-couv-corps">'
    + '<p class="rap-couv-sur">' + tx('rapport.surtitre') + '</p>'
    + '<p class="rap-couv-de">' + tx('rapport.couverture.de') + '</p>'
    + '<h1 class="rap-couv-noms rap-couv-noms--' + taille + '"><span class="rap-couv-nom">' + esc(P.a.nom) + '</span>'
    + '<span class="rap-couv-nom"><span class="rap-couv-et">' + tx('rapport.couverture.et') + '</span> ' + esc(P.b.nom) + '</span></h1>'
    + '<p class="rap-couv-date">' + tx('rapport.couverture.date', { date: dateLongue(d.finiLe, lang) }) + '</p>'
    + '<p class="rap-couv-chiffres">' + tx('rapport.couverture.chiffres', { domaines: domainesNotes.length + 1, questions: nombreFormate(nbQuestions, lang) }) + '</p>'
    + '</div>'
    + '<div class="rap-couv-pied"><p class="rap-couv-marque">Quiz Couple</p><p class="rap-couv-conf">' + tx('rapport.couverture.confidentiel') + '</p></div>'
    + '</section>';

  // ── Comment lire ──

  const chapitresListe = ['synthese', 'carte', 'conversations', 'bloquants', 'climat', 'signaux', 'roles', 'domaines', 'suite'];
  const lire = '<section class="rap-chap rap-chap--lire" data-chap="lire">'
    + '<div class="rap-chap-tete"><h2 class="rap-chap-titre">' + tx('rapport.lire.titre') + '</h2></div>'
    + '<div class="rap-texte"><p>' + tx('rapport.lire.p1') + '</p><p>' + tx('rapport.lire.p2') + '</p><p>' + tx('rapport.lire.p3') + '</p></div>'
    + '<div class="rap-deux-cols">'
    + '<div class="rap-encadre"><p class="rap-encadre-titre">' + tx('rapport.lire.reperes') + '</p>'
    + legendeDuo
    + '<ul class="rap-reperes">'
    + ['accord', 'proche', 'ecart'].map((c) => '<li><span class="rap-tag rap-tag--' + c + '">' + tx('rapport.cat.' + c) + '</span><span>' + tx('rapport.lire.' + c) + '</span></li>').join('')
    + '<li><span class="rap-tag rap-tag--nn">' + tx('rapport.lire.nnTag') + '</span><span>' + tx('rapport.lire.nn') + '</span></li>'
    + '</ul></div>'
    + '<div class="rap-encadre"><p class="rap-encadre-titre">' + tx('rapport.lire.sommaire') + '</p><ol class="rap-sommaire">'
    + chapitresListe.map((c, i) => '<li><span class="rap-sommaire-num">' + String(i + 1).padStart(2, '0') + '</span><span>' + tx('rapport.chapitres.' + c) + '</span></li>').join('')
    + '</ol></div></div></section>';

  // ── 1. Synthèse ──

  const verdict = analyse.bandeGlobal || 'creuser';
  const temps = analyse.bandeMeteo || 'variable';
  const tuile = (cle, n) => '<div class="rap-tuile rap-tuile--' + cle + '"><p class="rap-tuile-n">' + n + '</p><p class="rap-tuile-lib">' + tx('rapport.synthese.tuiles.' + cle) + '</p></div>';
  const tries = domainesNotes.slice().sort((x, y) => y.score - x.score || 0);
  const forts = tries.slice(0, 3);
  const faibles = tries.slice(-3).reverse().filter((x) => !forts.includes(x));
  const listeDomaines = (liste) => '<ul class="rap-liste-dom">' + liste.map((x) =>
    '<li><span class="rap-liste-dom-nom">' + tl(titreDomaine(x.id)) + '</span><span class="rap-liste-dom-val">' + x.score + '\u00a0%</span></li>').join('') + '</ul>';
  const rassemble = analyse.rassemble.length
    ? '<div class="rap-bloc"><h3 class="rap-h3">' + tx('rapport.synthese.rassemble') + '</h3><p class="rap-aide">' + tx('rapport.synthese.rassembleIntro') + '</p>'
      + '<ul class="rap-puces rap-puces--accord">' + analyse.rassemble.map((id) => '<li><strong>' + tl(court(id)) + '</strong><span class="rap-puce-rep"> · ' + tl(reponseLue(id, P.a)) + '</span></li>').join('') + '</ul></div>'
    : '';
  const synthese = chapitre('synthese', 1,
    '<div class="rap-anneaux">'
    + '<div class="rap-score">' + (analyse.global === null ? '' : anneau(analyse.global, 'encre', brut('rapport.synthese.alignement')))
    + '<div class="rap-score-texte"><p class="rap-score-lib">' + tx('rapport.synthese.alignement') + '</p>'
    + '<p class="rap-score-titre">' + tx('rapport.verdicts.' + verdict + '.titre') + '</p>'
    + '<p class="rap-score-desc">' + tx('rapport.verdicts.' + verdict + '.texte') + '</p>'
    + '<p class="rap-aide">' + tx('rapport.synthese.alignementAide') + '</p></div></div>'
    + '<div class="rap-score">' + (analyse.meteo === null ? '' : anneau(analyse.meteo, 'climat', brut('rapport.synthese.climat')))
    + '<div class="rap-score-texte"><p class="rap-score-lib">' + tx('rapport.synthese.climat') + '</p>'
    + '<p class="rap-score-titre">' + tx('rapport.meteos.' + temps + '.titre') + '</p>'
    + '<p class="rap-score-desc">' + tx('rapport.meteos.' + temps + '.texte') + '</p>'
    + (analyse.meteoA !== null ? '<ul class="rap-climats">'
      + '<li>' + pastille(P.a) + '<span>' + nomH(P.a) + '<span class="rap-climat-n">' + analyse.meteoA + '\u00a0%</span></span></li>'
      + '<li>' + pastille(P.b) + '<span>' + nomH(P.b) + '<span class="rap-climat-n">' + analyse.meteoB + '\u00a0%</span></span></li></ul>' : '')
    + '<p class="rap-aide">' + tx('rapport.synthese.climatAide') + '</p></div></div>'
    + '</div>'
    + '<div class="rap-tuiles">' + tuile('accords', analyse.compte.accords) + tuile('proches', analyse.compte.proches)
    + tuile('ecarts', analyse.compte.ecarts) + tuile('bloquants', analyse.compte.bloquants) + tuile('vigilance', analyse.compte.vigilance) + '</div>'
    + '<div class="rap-deux-cols">'
    + '<div class="rap-encadre rap-encadre--accord"><p class="rap-encadre-titre">' + tx('rapport.synthese.forts') + '</p>' + listeDomaines(forts) + '</div>'
    + '<div class="rap-encadre rap-encadre--ecart"><p class="rap-encadre-titre">' + tx('rapport.synthese.faibles') + '</p>' + listeDomaines(faibles) + '</div>'
    + '</div>'
    + rassemble,
    tx('rapport.synthese.intro'));

  // ── 2. Carte des domaines ──

  const barres = domainesNotes.map((x) => '<div class="rap-barre rap-barre--' + x.bande + '">'
    + '<div class="rap-barre-tete"><p class="rap-barre-nom">' + tl(titreDomaine(x.id)) + '</p>'
    + '<p class="rap-barre-val"><span class="rap-barre-bande">' + tx('rapport.carte.bandes.' + x.bande) + '</span><strong>' + x.score + '\u00a0%</strong></p></div>'
    + '<div class="rap-barre-piste"><span class="rap-barre-plein" style="width:' + x.score + '%"></span></div>'
    + '<p class="rap-barre-compte"><span class="rap-compte rap-compte--accord">' + x.accords + '</span><span class="rap-compte rap-compte--proche">' + x.proches + '</span><span class="rap-compte rap-compte--ecart">' + x.ecarts + '</span></p>'
    + '</div>').join('');
  const carte = chapitre('carte', 2,
    '<p class="rap-legende-comptes"><span class="rap-compte rap-compte--accord">' + tx('rapport.carte.accords') + '</span><span class="rap-compte rap-compte--proche">' + tx('rapport.carte.proches') + '</span><span class="rap-compte rap-compte--ecart">' + tx('rapport.carte.ecarts') + '</span></p>'
    + '<div class="rap-barres">' + barres + '</div>',
    tx('rapport.carte.intro'));

  // ── 3. Les quatre prochaines conversations ──

  const conversations = chapitre('conversations', 3,
    analyse.conversations.length
      ? analyse.conversations.map((id, i) => carteEcart(parId[id], tx('rapport.conversations.titre', { n: i + 1 }) + ' · ' + tl(titreDomaine(parId[id].domaine)))).join('')
      : '<p class="rap-vide">' + tx('rapport.conversations.aucune') + '</p>',
    tx('rapport.conversations.intro'));

  // ── 4. Points bloquants et non négociables ──

  const listeNn = (p) => {
    const ids = analyse.nonNegociables[p.cle];
    return '<div class="rap-encadre"><p class="rap-encadre-titre">' + pastille(p) + nomH(p) + '</p>'
      + (ids.length ? '<ul class="rap-puces">' + ids.map((id) => '<li><strong>' + tl(court(id)) + '</strong><br>' + tl(reponseLue(id, p)) + '</li>').join('') + '</ul>'
        : '<p class="rap-vide">' + tx('rapport.bloquants.nnAucun') + '</p>')
      + '</div>';
  };
  const bloquants = chapitre('bloquants', 4,
    (analyse.bloquants.length ? analyse.bloquants.map((id) => carteEcart(parId[id])).join('')
      : '<p class="rap-vide">' + tx('rapport.bloquants.aucun') + '</p>')
    + '<div class="rap-bloc"><h3 class="rap-h3">' + tx('rapport.bloquants.nnTitre') + '</h3><p class="rap-aide">' + tx('rapport.bloquants.nnIntro') + '</p>'
    + '<div class="rap-deux-cols">' + listeNn(P.a) + listeNn(P.b) + '</div></div>',
    tx('rapport.bloquants.intro'));

  // ── 5. Le climat ──

  function carteEtat(e) {
    const t = textQ(e.id);
    const n = (t.o || []).length || 4;
    const drapeaux = [];
    if (e.ecart) drapeaux.push('<span class="rap-tag rap-tag--ecart">' + tx('rapport.climat.ecart') + '</span>');
    else if (e.attentionA || e.attentionB) drapeaux.push('<span class="rap-tag rap-tag--proche">' + tx('rapport.climat.attention') + '</span>');
    return '<article class="rap-etat">'
      + '<h3 class="rap-etat-titre">' + tl(court(e.id)) + '</h3>'
      + (drapeaux.length ? '<p class="rap-tags">' + drapeaux.join('') + '</p>' : '')
      + echelle(n, e.a, e.b, null, 'bien')
      + lignesReponses(e.id)
      + ((e.attentionA || e.attentionB || e.ecart) ? guide(e.id, true) : '')
      + '</article>';
  }
  const etatsMeteo = analyse.etats.filter((e) => e.domaine === 'meteo');
  const climat = chapitre('climat', 5,
    legendeDuo + '<p class="rap-aide">' + tx('rapport.climat.sens') + '</p><div class="rap-etats">' + etatsMeteo.map(carteEtat).join('') + '</div>',
    tx('rapport.climat.intro'));

  // ── 6. Les signaux de vigilance ──

  function carteSignal(s) {
    const t = textQ(s.id);
    const reparation = s.signal === 'reparation';
    let etat;
    if (reparation) etat = (s.a <= 1 && s.b <= 1) ? 'reparationBien' : 'reparationAttention';
    else etat = s.alerte ? 'alerte' : s.attention ? 'attention' : 'rare';
    const classe = { rare: 'accord', reparationBien: 'accord', attention: 'proche', reparationAttention: 'proche', alerte: 'ecart' }[etat];
    return '<article class="rap-signal rap-signal--' + classe + '">'
      + '<div class="rap-signal-tete"><h3 class="rap-etat-titre">' + tl(court(s.id)) + '</h3>'
      + '<p class="rap-tags"><span class="rap-tag rap-tag--' + classe + '">' + tx('rapport.signaux.' + etat) + '</span></p></div>'
      + echelle((t.o || []).length || 4, s.a, s.b, (t.o || []).map((x) => C.accorder(x, null)), 'bien')
      + '<div class="rap-guide"><div class="rap-guide-bloc"><p>' + tl(t.pourquoi || '') + '</p></div>'
      + ((etat !== 'rare' && etat !== 'reparationBien' && Array.isArray(t.parler) && t.parler.length)
        ? '<div class="rap-guide-bloc"><p class="rap-guide-titre">' + tx('rapport.parler') + '</p><ul class="rap-puces">' + t.parler.map((q) => '<li>' + tl(q) + '</li>').join('') + '</ul></div>' : '')
      + '</div></article>';
  }
  const signaux = chapitre('signaux', 6,
    legendeDuo + analyse.signaux.map(carteSignal).join('')
    + '<p class="rap-note">' + tx('rapport.signaux.fin') + '</p>',
    tx('rapport.signaux.intro'));

  // ── 7. Qui fait quoi ──

  const quis = analyse.items.filter((i) => i.type === 'qui');
  function ligneRole(item) {
    const posA = item.a;
    const posB = 4 - item.b;
    let note;
    if (item.chacunPlus) note = '<span class="rap-tag rap-tag--chacun">' + tx('rapport.roles.chacunPlus') + '</span>';
    else if (item.cat === 'accord') note = '<span class="rap-tag rap-tag--accord">' + tx('rapport.roles.accord') + '</span>';
    else note = '<span class="rap-tag rap-tag--' + item.cat + '">' + tx('rapport.cat.' + item.cat) + '</span>';
    return '<article class="rap-role">'
      + '<h3 class="rap-etat-titre">' + tl(court(item.id)) + '</h3><p class="rap-tags">' + note + '</p>'
      + echelle(5, posA, posB, null, 'roles')
      + lignesReponses(item.id)
      + '</article>';
  }
  const roles = chapitre('roles', 7,
    (quis.length
      ? '<div class="rap-role-axe"><p class="rap-role-bout">' + pastille(P.a) + tx('rapport.roles.surtout', { nom: P.a.nom }) + '</p>'
        + '<p class="rap-role-bout rap-role-bout--droite">' + tx('rapport.roles.surtout', { nom: P.b.nom }) + pastille(P.b) + '</p></div>'
        + quis.map(ligneRole).join('')
      : '<p class="rap-vide">' + tx('rapport.roles.aucun') + '</p>'),
    tx('rapport.roles.intro', { a: P.a.nom, b: P.b.nom }));

  // ── 8. Domaine par domaine ──

  const domaines = chapitre('domaines', 8,
    analyse.domaines.filter((x) => !x.meteo && (x.items.length || x.etats.length)).map((x) => {
      const accords = x.items.filter((i) => i.cat === 'accord' && !i.chacunPlus && !i.desequilibre);
      const diffs = x.items.filter((i) => i.cat !== 'accord' || i.chacunPlus || i.desequilibre)
        .sort((u, v) => v.prio - u.prio);
      const texteDom = x.bande && Q.domaines[x.id] && Q.domaines[x.id].rapport ? Q.domaines[x.id].rapport[x.bande] : '';
      return '<div class="rap-dom">'
        + '<div class="rap-dom-ouverture"><div class="rap-dom-tete"><h3 class="rap-dom-titre">' + tl(titreDomaine(x.id)) + '</h3>'
        + (x.score !== null ? '<p class="rap-dom-score rap-dom-score--' + x.bande + '"><strong>' + x.score + '\u00a0%</strong><span>' + tx('rapport.carte.bandes.' + x.bande) + '</span></p>' : '')
        + '</div>'
        + (texteDom ? '<p class="rap-dom-texte">' + tl(texteDom) + '</p>' : '') + '</div>'
        + '<p class="rap-h4">' + tx('rapport.domaines.accords') + '</p>'
        + (accords.length ? '<ul class="rap-puces rap-puces--accord">' + accords.map((i) => '<li><strong>' + tl(court(i.id)) + '</strong><span class="rap-puce-rep"> · ' + tl(reponseLue(i.id, P.a)) + '</span>'
          + ((i.nnA || i.nnB) ? ' <span class="rap-tag rap-tag--nn">' + tx('rapport.nnDe', { nom: i.nnA && i.nnB ? P.a.nom + ' & ' + P.b.nom : (i.nnA ? P.a.nom : P.b.nom) }) + '</span>' : '')
          + '</li>').join('') + '</ul>'
          : '<p class="rap-vide">' + tx('rapport.domaines.accordsAucun') + '</p>')
        + '<p class="rap-h4">' + tx('rapport.domaines.differences') + '</p>'
        + (diffs.length ? diffs.map((i) => {
          const conv = analyse.conversations.indexOf(i.id);
          if (conv >= 0) return carteEcart(i, '', 'renvoi', tx('rapport.domaines.voirConversation', { n: conv + 1 }));
          if (analyse.bloquants.includes(i.id)) return carteEcart(i, '', 'renvoi', tx('rapport.domaines.voirBloquants'));
          return carteEcart(i, '', i.cat === 'ecart' || i.chacunPlus ? 'complet' : 'court');
        }).join('') : '<p class="rap-vide">' + tx('rapport.domaines.differencesAucune') + '</p>')
        + (x.etats.filter((e) => !e.signal).length
          ? '<p class="rap-h4">' + tx('rapport.domaines.etats') + '</p><div class="rap-etats">' + x.etats.filter((e) => !e.signal).map(carteEtat).join('') + '</div>' : '')
        + '</div>';
    }).join(''),
    tx('rapport.domaines.intro'));

  // ── 9. Et maintenant ──

  const conseils = brut('rapport.suite.conseils');
  const suite = chapitre('suite', 9,
    '<ol class="rap-conseils">' + (Array.isArray(conseils) ? conseils : []).map((c) => '<li>' + tl(c) + '</li>').join('') + '</ol>'
    + '<div class="rap-texte"><p>' + tx('rapport.suite.refaire') + '</p></div>'
    + '<div class="rap-encadre rap-encadre--doux"><p>' + tx('rapport.suite.aide') + '</p><p>' + tx('rapport.suite.violence') + '</p></div>'
    + (o.editeur ? '<p class="rap-editeur">' + esc(o.editeur) + '</p>' : ''),
    tx('rapport.suite.p1'));

  const corps = couverture + lire + synthese + carte + conversations + bloquants + climat + signaux + roles + domaines + suite;
  const html = '<div class="rap rap--' + format + '" lang="' + esc(lang) + '">' + corps + '</div>';
  return { html, analyse, chapitres: ['couverture', 'lire', ...chapitresListe] };
}

// Le pied de page du PDF (boîtes de marge de Chrome), dans la langue du
// rapport : une règle @page à mettre dans le <style> du document.
export function styleDePage(T) {
  const pied = (T && T.rapport && T.rapport.pied) || '';
  const chaine = '"' + String(pied).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
  return '@page { @bottom-left { content: ' + chaine + '; } }';
}
