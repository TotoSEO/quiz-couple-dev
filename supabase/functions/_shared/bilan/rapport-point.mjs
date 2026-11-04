// Le rapport du « point sur ma relation » (le seul(e) depuis le 4 novembre
// 2026) : un gabarit HTML pour l'écran (la page, une fois payé) et pour le
// PDF (bilan/fabrique.mjs). Même système que le rapport à deux (rapport.mjs,
// rapport.css) : une couverture pleine couleur, chaque chapitre ouvert par un
// grand bloc de couleur, des cartes, des aplats pleins, rien qui se coupe
// entre deux pages ; les classes propres au point commencent par `rpt-`.
//
// Le générateur du site sert ce fichier en /js/bilan-rapport-point.js, sans
// les `import` ni les `export`, sous window.QCBilanRapportPoint (le calcul
// vient de window.QCBilanCoeur, les outils de window.QCBilanRapport). Rien
// ici ne touche au DOM : on rend une chaîne.
//
// Les textes sont dans {lang}/bilan-point.json (`questions`, `qui`,
// `rapport`) ; `{m|f}` s'accorde au genre de la personne qui a répondu,
// `{{autre}}` est le prénom de son ou sa partenaire, jamais un pronom.
// Conception : docs/bilan/CONCEPTION.md, section du 4 novembre 2026.

import * as C from './coeur.mjs';
import * as R from './rapport.mjs';

// La couleur d'ouverture de chaque chapitre.
export const TEINTES_POINT = {
  securite: 'brique', essentiel: 'nuit', climat: 'marine', besoins: 'prune', disputes: 'ocre',
  equilibre: 'foret', attachement: 'violet', retient: 'ardoise', plan: 'framboise', deux: 'encre', methode: 'nuit',
};

// d : { lang, finiLe, a: { prenom, genre, reponses }, b: { prenom, genre } }
// TP : {lang}/bilan-point.json
// o : { format: 'pdf' | 'ecran', couper: (texte) => texte, editeur: '...' }
// Renvoie { html, analyse, chapitres }.
export function rapportPointHtml(d, TP, o) {
  o = o || {};
  const lang = d.lang || 'fr';
  const format = o.format === 'pdf' ? 'pdf' : 'ecran';
  const couper = typeof o.couper === 'function' ? o.couper : (s) => s;
  const pc = (n) => n + (lang === 'nl' ? '%' : '\u00a0%');
  // Les deux-points après un intitulé : insécable devant en français.
  const deuxPoints = lang === 'fr' ? '\u00a0:' : ':';
  const rep = (d.a && d.a.reponses) || {};
  const analyse = C.analyserPoint(rep);
  const genre = (d.a && d.a.genre) || null;
  const nomA = (d.a && d.a.prenom) || '';
  const nomB = (d.b && d.b.prenom) || '';
  const RT = TP.rapport || {};

  // ── Les textes ──
  function brut(chemin) {
    let x = RT;
    for (const p of chemin.split('.')) {
      if (x == null || typeof x !== 'object' || !(p in x)) return '';
      x = x[p];
    }
    return x == null ? '' : x;
  }
  // Les prénoms passent dans les textes sous une marque (deux caractères à
  // usage privé autour d'une lettre), posée à la place du prénom avant la
  // césure et remplacée après l'échappement : la césure du PDF ne coupe
  // jamais un prénom (« Ostermann » devenait « Oster-mann »), et un prénom
  // n'est jamais lu comme un accord ni comme du HTML.
  const MARQUE_A = '\uE000n\uE001';
  const MARQUE_B = '\uE000a\uE001';
  const noms = (h) => h.split(MARQUE_B).join('<span class="rpt-nom">' + R.esc(nomB) + '</span>')
    .split(MARQUE_A).join('<span class="rpt-nom">' + R.esc(nomA) + '</span>');
  const enClair = (t) => t.split(MARQUE_B).join(nomB).split(MARQUE_A).join(nomA);
  // Un texte du rapport : accordé au genre de la personne, rempli, coupé,
  // échappé. L'accord passe avant le prénom.
  const prepare = (s, vars) => R.remplir2(C.accorder(String(s == null ? '' : s), genre), Object.assign({ autre: MARQUE_B, nom: MARQUE_A }, vars || {}));
  const tx = (chemin, vars) => noms(R.esc(couper(R.insecables(prepare(brut(chemin), vars), lang))));
  const txs = (s, vars) => noms(R.esc(couper(R.insecables(prepare(s, vars), lang))));
  // Une question et ses réponses, telles que la personne les a lues.
  const q = (id) => (TP.questions && TP.questions[id]) || {};
  const lu = (s) => C.remplir(C.accorder(String(s || ''), genre), { autre: MARQUE_B });
  const tl = (s) => noms(R.esc(couper(R.insecables(s, lang))));
  const court = (id) => tl(lu(q(id).court || q(id).q || id));
  function reponseDe(id) {
    const e = C.POINT_INDEX[id];
    const v = rep[id];
    if (!e || !Number.isInteger(v)) return '';
    if (e.q.type === 'qui') return lu((TP.qui || [])[v]);
    if (e.q.refus && v === e.q.n) return lu(TP.refus);
    return lu((q(id).o || [])[v]);
  }

  // Un chapitre : le bloc d'ouverture (numéro, titre, une phrase), puis son
  // intro et son contenu, comme le rapport à deux. Dans le PDF, les chapitres
  // du point se suivent sans page neuve (ils sont courts, et une page neuve
  // par chapitre laissait une page sur deux à moitié vide) : l'ouverture et
  // l'intro forment un seul bloc insécable (`rpt-tete`), qui passe à la page
  // suivante avec ce qui le suit plutôt que de rester seul en bas de page.
  const numeroDe = (cle) => analyse.chapitres.indexOf(cle) + 1;
  function chapitre(cle, contenu, intro) {
    const teinte = TEINTES_POINT[cle] || 'nuit';
    const num = String(numeroDe(cle)).padStart(2, '0');
    return '<section class="rap-chap rap-chap--' + cle + ' rpt-chap" data-chap="' + cle + '">'
      + '<div class="rpt-tete">'
      + '<header class="rap-ouv rap-ouv--' + teinte + '" data-chap="ouv-' + cle + '">'
      + '<div class="rap-ouv-deco" aria-hidden="true"><svg viewBox="0 0 300 300" preserveAspectRatio="xMaxYMax slice"><circle cx="210" cy="190" r="150" class="rap-ouv-cercle"/><circle cx="260" cy="120" r="150" class="rap-ouv-cercle"/><circle cx="235" cy="155" r="70" class="rap-ouv-cercle rap-ouv-cercle--plein"/></svg></div>'
      + '<p class="rap-ouv-num" aria-hidden="true">' + num + '</p>'
      + '<div class="rap-ouv-texte"><h2 class="rap-ouv-titre">' + tx('chapitres.' + cle) + '</h2>'
      + (brut('ouvertures.' + cle) ? '<p class="rap-ouv-accroche">' + tx('ouvertures.' + cle) + '</p>' : '')
      + '</div></header>'
      + (intro ? '<p class="rap-chap-intro rpt-intro">' + intro + '</p>' : '')
      + '</div>'
      + '<div class="rap-chap-corps' + (intro ? ' rpt-corps--suite' : '') + '">'
      + contenu + '</div></section>';
  }
  // Une marque à côté d'une réponse : 0 et 1 vont bien, 2 et 3 sont à
  // regarder (les couleurs de l'accord, du proche et de l'écart).
  const MARQUES = ['fort', 'fort', 'faible', 'faible'];
  const marque = (v) => '<span class="rap-tag rap-tag--' + (MARQUES[v] || 'moyen') + '">' + noms(R.esc(R.insecables(lu((brut('climat.marques') || [])[v] || ''), lang))) + '</span>';
  // Une ligne : la question en bref, la réponse, et sa marque.
  const ligne = (id, avecMarque) => '<li class="rpt-ligne">'
    + '<p class="rpt-ligne-q">' + court(id) + '</p>'
    + '<p class="rpt-ligne-r">' + tl(reponseDe(id)) + '</p>'
    + (avecMarque ? '<p class="rpt-ligne-m">' + marque(rep[id]) + '</p>' : '')
    + '</li>';
  // Les numéros d'aide du pays.
  const numeros = () => {
    const liste = brut('securite.numeros');
    return '<ul class="rpt-numeros">' + (Array.isArray(liste) ? liste : []).map((n) => '<li class="rpt-numero">'
      + '<p class="rpt-numero-n">' + txs(n.nom) + '</p><p class="rpt-numero-d">' + txs(n.detail) + '</p></li>').join('') + '</ul>';
  };
  // Une carte de signal : son titre, sa force, ce qu'il veut dire, ce qui aide.
  const carteSignal = (s) => '<div class="rap-etat rap-etat--' + (s.force === 'fort' ? 'ecart' : 'attention') + '">'
    + '<div class="rap-etat-tete"><p class="rap-etat-titre">' + tx('signaux.' + s.id + '.titre') + '</p>'
    + '<p class="rap-tags"><span class="rap-tag rap-tag--' + (s.force === 'fort' ? 'faible' : 'moyen') + '">' + tx('disputes.' + s.force) + '</span></p></div>'
    + '<p class="rpt-signal-texte">' + tx('signaux.' + s.id + '.texte') + '</p>'
    + (brut('signaux.' + s.id + '.aide') ? '<p class="rpt-signal-aide"><strong>' + tx('disputes.aide') + deuxPoints + '</strong> ' + tx('signaux.' + s.id + '.aide') + '</p>' : '')
    + '</div>';

  const securite = analyse.securite;
  const alerte = securite.niveau === 'alerte';
  const signauxSecu = analyse.signaux.filter((s) => s.famille === 'securite');
  const signauxCouple = analyse.signaux.filter((s) => s.famille !== 'securite');

  // ── La couverture ──
  const taille = R.tailleCouverture(nomA, '');
  const couverture = '<section class="rap-couv rpt-couv" data-chap="couverture">'
    + '<div class="rap-couv-deco" aria-hidden="true"><svg viewBox="0 0 400 400" preserveAspectRatio="xMaxYMin slice">'
    + '<circle cx="250" cy="170" r="150" class="rap-couv-rond rap-couv-rond--violet"/>'
    + '<circle cx="250" cy="170" r="110" class="rap-couv-rond rap-couv-rond--blanc"/>'
    + '</svg></div>'
    + '<div class="rap-couv-corps">'
    + '<p class="rap-couv-sur">' + tx('surtitre') + '</p>'
    + '<h1 class="rap-couv-noms rap-couv-noms--' + taille + '"><span class="rap-couv-nom">' + R.esc(nomA) + '</span></h1>'
    + '<p class="rap-couv-solo">' + tx('couverture.avec') + '</p>'
    + '<div class="rpt-couv-etat rpt-couv-etat--' + analyse.etat + '"><p class="rpt-couv-etat-lib">' + tx('couverture.etat') + '</p>'
    + '<p class="rpt-couv-etat-titre">' + tx('etats.' + analyse.etat + '.titre') + '</p></div>'
    + '<p class="rap-couv-date">' + tx('couverture.date', { date: R.dateLongue(d.finiLe, lang) }) + '</p>'
    + '</div>'
    + '<div class="rap-couv-pied"><p class="rap-couv-marque">Quiz Couple</p><p class="rap-couv-conf">' + tx('couverture.confidentiel') + '</p></div>'
    + '</section>';

  // ── Votre sécurité d'abord (en cas d'alerte) ──
  const chapSecurite = !alerte ? '' : chapitre('securite',
    signauxSecu.map(carteSignal).join('')
    + '<div class="rap-encadre rpt-encadre-secu"><p class="rpt-pas-faute">' + tx('securite.pasFaute') + '</p></div>'
    + '<div class="rap-bloc rap-bloc--insecable"><h3 class="rap-h3">' + tx('securite.numerosTitre') + '</h3>' + numeros()
    + '<p class="rap-aide">' + tx('securite.apres') + '</p></div>',
    tx('securite.intro'));

  // ── L'essentiel ──
  const tuile = (cle, valeur, texte) => '<div class="rap-tuile rpt-tuile rpt-tuile--' + cle + (texte ? ' rpt-tuile--texte' : '') + '">'
    + '<p class="rap-tuile-n">' + valeur + '</p><p class="rap-tuile-lib">' + tx('essentiel.' + cle) + '</p></div>';
  const sujetsPlan = analyse.plan.mode === 'securite'
    ? (brut('plan.securiteActions') || []).map((a) => txs(a.titre))
    : analyse.plan.sujets.map((s) => tx('sujets.' + s.id + '.titre'));
  const essentiel = chapitre('essentiel',
    '<div class="rap-texte"><p>' + tx('motifs.' + analyse.motif) + '</p></div>'
    + '<div class="rap-score rpt-score">' + R.anneau(analyse.climat, 'climat', brut('essentiel.climat'))
    + '<div class="rap-score-texte"><p class="rap-score-lib">' + tx('couverture.etat') + '</p>'
    + '<p class="rap-score-titre">' + tx('etats.' + analyse.etat + '.titre') + '</p>'
    + '<p class="rap-score-desc">' + tx('etats.' + analyse.etat + '.texte') + '</p></div></div>'
    + '<div class="rap-tuiles rpt-tuiles">'
    + tuile('climat', analyse.climat + '<span class="rpt-pc">' + (lang === 'nl' ? '%' : '\u00a0%') + '</span>')
    + tuile('signaux', analyse.signaux.length)
    + tuile('manques', analyse.besoins.manques.length)
    + tuile('attachement', tx('styles.' + analyse.attachement.style + '.titre'), true)
    + tuile('profil', tx('profils.' + analyse.engagement.profil + '.titre'), true)
    + '</div>'
    + (!alerte && securite.niveau === 'vigilance' ? '<div class="rap-encadre rap-encadre--ecart rpt-encadre-secu"><p>' + tx('essentiel.vigilance') + '</p>' + numeros() + '</div>' : '')
    + (!alerte && securite.niveau !== 'vigilance' && securite.refus ? '<div class="rap-encadre rpt-encadre-secu"><p>' + tx(securite.refus > 1 ? 'essentiel.refusN' : 'essentiel.refusUn', { n: securite.refus }) + '</p>' + numeros() + '</div>' : '')
    + '<div class="rap-bloc rap-bloc--insecable"><h3 class="rap-h3">' + tx(analyse.plan.mode === 'securite' ? 'essentiel.planSecurite' : 'essentiel.planTitre') + '</h3>'
    // Le texte d'une ligne numérotée tient dans un seul élément : la ligne est
    // une grille, et un prénom (span.rpt-nom) posé seul y prendrait la
    // colonne étroite du numéro.
    + '<ol class="rap-conseils rpt-conseils">' + sujetsPlan.map((t) => '<li><span>' + t + '</span></li>').join('') + '</ol></div>',
    tx('essentiel.intro'));

  // ── Comment vous allez ──
  const bandeClimat = analyse.climat >= 75 ? 'bon' : analyse.climat >= 55 ? 'mitige' : 'difficile';
  const zoom = (titre, texte) => '<div class="rap-encadre rpt-zoom"><p class="rap-encadre-titre">' + titre + '</p><p>' + texte + '</p></div>';
  const chapClimat = chapitre('climat',
    '<div class="rap-score rpt-score">' + R.anneau(analyse.climat, 'climat', brut('essentiel.climat'))
    + '<div class="rap-score-texte"><p class="rap-score-lib">' + tx('essentiel.climat') + '</p>'
    + '<p class="rap-score-titre">' + tx('bandesClimat.' + bandeClimat) + '</p>'
    + '<p class="rap-score-desc">' + tx('climat.' + bandeClimat) + '</p></div></div>'
    + '<ul class="rpt-lignes">' + ['pc1', 'pc2', 'pc3', 'pc4', 'pc5', 'pc6', 'pc7'].map((id) => ligne(id, true)).join('') + '</ul>'
    + (rep.pc6 >= 2 ? zoom(tx('climat.nouvellesTitre'), tx('climat.nouvelles', { reponse: reponseDe('pc6') })) : '')
    + (rep.pc7 >= 2 ? zoom(tx('climat.admirationTitre'), tx('climat.admiration')) : ''),
    tx('climat.intro'));

  // ── Vos besoins ──
  const besoins = analyse.besoins.liste.slice().sort((x, y) => (y.important - x.important) || (y.niveau - x.niveau));
  const NIVEAU_TAG = ['fort', 'fort', 'faible', 'faible'];
  const chapBesoins = chapitre('besoins',
    '<div class="rap-encadre ' + (analyse.besoins.manques.length ? 'rap-encadre--ecart' : 'rap-encadre--accord') + ' rpt-manques">'
    + '<p class="rap-encadre-titre">' + tx('besoins.manquesTitre') + '</p>'
    + (analyse.besoins.manques.length
      ? '<ul class="rap-puces">' + analyse.besoins.manques.map((id) => '<li><strong>' + tx('besoins.noms.' + id) + '</strong></li>').join('') + '</ul>'
      : '<p>' + tx('besoins.manques0') + '</p>')
    + '</div>'
    + '<div class="rpt-besoins">' + besoins.map((b) => '<div class="rap-etat rpt-besoin rap-etat--' + (b.niveau >= 2 ? 'ecart' : 'ok') + '">'
      + '<div class="rap-etat-tete"><p class="rap-etat-titre">' + tx('besoins.noms.' + b.id) + '</p>'
      + '<p class="rap-tags">' + (b.important ? '<span class="rap-tag rap-tag--poids">' + tx('besoins.important') + '</span>' : '')
      + '<span class="rap-tag rap-tag--' + NIVEAU_TAG[b.niveau] + '">' + txs((brut('besoins.niveaux') || [])[b.niveau]) + '</span></p></div>'
      + '<p class="rpt-besoin-rep">' + tl(reponseDe(b.q)) + '</p>'
      + '<p class="rpt-besoin-texte">' + tx('besoins.textes.' + b.id) + '</p></div>').join('') + '</div>',
    tx('besoins.intro'));

  // ── Vos disputes ──
  const chapDisputes = chapitre('disputes',
    '<div class="rap-score rpt-score">' + R.anneau(analyse.disputes, 'align', brut('disputes.score'))
    + '<div class="rap-score-texte"><p class="rap-score-lib">' + tx('disputes.score') + '</p>'
    + '<ul class="rpt-lignes rpt-lignes--serre">' + ['px1', 'px2', 'px3', 'px4', 'px5', 'px6', 'px7'].map((id) => ligne(id, false)).join('') + '</ul></div></div>'
    + '<h3 class="rap-h3 rap-h3--espace">' + tx('disputes.signauxTitre') + '</h3>'
    + (signauxCouple.length ? signauxCouple.map(carteSignal).join('') : '<p class="rap-vide">' + tx('disputes.aucun') + '</p>')
    + (!alerte && signauxSecu.length
      ? '<h3 class="rap-h3 rap-h3--espace">' + tx('disputes.securiteTitre') + '</h3>' + signauxSecu.map(carteSignal).join('')
        + '<div class="rap-encadre rpt-encadre-secu"><p class="rap-encadre-titre">' + tx('securite.numerosTitre') + '</p>' + numeros() + '</div>'
      : ''),
    tx('disputes.intro'));

  // ── Qui fait quoi ──
  const echelleQui = (id) => {
    const v = rep[id];
    const cases = [0, 1, 2, 3, 4].map((i) => '<span class="rpt-qui-case' + (i === v ? ' rpt-qui-case--on' : '') + '"></span>').join('');
    return '<li class="rpt-qui">'
      + '<p class="rpt-qui-q">' + court(id) + '</p>'
      + '<div class="rpt-qui-piste" aria-hidden="true">' + cases + '</div>'
      + '<div class="rpt-qui-bouts"><span>' + tx('equilibre.bouts.moi') + '</span><span>' + tx('equilibre.bouts.autre') + '</span></div>'
      + '<p class="rpt-qui-r">' + tl(reponseDe(id)) + '</p></li>';
  };
  const premierPas = rep.pe3 < 2 ? 'moi' : rep.pe3 > 2 ? 'autre' : 'egal';
  const chapEquilibre = chapitre('equilibre',
    '<ul class="rpt-quis">' + ['pe1', 'pe2', 'pe3'].map(echelleQui).join('') + '</ul>'
    + '<div class="rap-texte rpt-texte"><p><strong>' + tx('equilibre.penche.' + analyse.equilibre.penche) + '</strong> ' + tx('equilibre.charge') + '</p>'
    + '<p>' + tx(analyse.equilibre.pese ? 'equilibre.pese' : 'equilibre.vaBien') + '</p>'
    + '<p>' + tx('equilibre.premierPas.' + premierPas) + '</p></div>',
    tx('equilibre.intro'));

  // ── Votre façon d'aimer : le plan à deux axes ──
  const ax = analyse.attachement.evitement;
  const ay = analyse.attachement.anxiete;
  const px = 30 + ax * 2.4;
  const py = 270 - ay * 2.4;
  // Le nom d'un quadrant : douze signes par ligne au plus, coupé au trait
  // d'union quand il est plus long (« ängstlich-vermeidend »).
  const quad = (cle, x, y) => {
    const t = enClair(prepare(brut('attachement.quadrants.' + cle)));
    const lignes = t.length > 12 && t.includes('-') ? [t.slice(0, t.indexOf('-') + 1), t.slice(t.indexOf('-') + 1)] : [t];
    return '<text x="' + x + '" y="' + (y - (lignes.length - 1) * 7) + '" text-anchor="middle" class="rpt-plan-quad' + (analyse.attachement.style === cle ? ' rpt-plan-quad--on' : '') + '">'
      + lignes.map((l, i) => '<tspan x="' + x + '" dy="' + (i ? 14 : 0) + '">' + R.esc(l) + '</tspan>').join('') + '</text>';
  };
  const plan2d = '<figure class="rpt-plan2d" role="img" aria-label="' + R.esc(enClair(prepare(brut('styles.' + analyse.attachement.style + '.titre')))) + '">'
    + '<p class="rpt-plan2d-axe rpt-plan2d-axe--y">' + tx('attachement.axes.anxiete') + '</p>'
    + '<svg viewBox="0 0 300 300" aria-hidden="true">'
    + '<rect x="30" y="30" width="120" height="120" class="rpt-plan-zone rpt-plan-zone--anxieux"/>'
    + '<rect x="150" y="30" width="120" height="120" class="rpt-plan-zone rpt-plan-zone--craintif"/>'
    + '<rect x="30" y="150" width="120" height="120" class="rpt-plan-zone rpt-plan-zone--secure"/>'
    + '<rect x="150" y="150" width="120" height="120" class="rpt-plan-zone rpt-plan-zone--evitant"/>'
    + '<line x1="30" y1="150" x2="270" y2="150" class="rpt-plan-milieu"/><line x1="150" y1="30" x2="150" y2="270" class="rpt-plan-milieu"/>'
    // Les deux axes, avec leur pointe : vers le haut le besoin d'être
    // rassuré(e), vers la droite le besoin de distance.
    + '<line x1="30" y1="270" x2="30" y2="20" class="rpt-plan-axe"/><polygon points="24,22 30,10 36,22" class="rpt-plan-pointe"/>'
    + '<line x1="30" y1="270" x2="280" y2="270" class="rpt-plan-axe"/><polygon points="278,264 290,270 278,276" class="rpt-plan-pointe"/>'
    + quad('anxieux', 90, 54) + quad('craintif', 210, 54) + quad('secure', 90, 254) + quad('evitant', 210, 254)
    + '<circle cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" r="11" class="rpt-plan-point"/>'
    + '</svg><p class="rpt-plan2d-axe rpt-plan2d-axe--x">' + tx('attachement.axes.evitement') + '</p></figure>';
  const st = analyse.attachement.style;
  const chapAttachement = chapitre('attachement',
    '<div class="rpt-attachement">' + plan2d
    + '<div><p class="rap-score-lib">' + tx('essentiel.attachement') + '</p>'
    + '<p class="rap-score-titre">' + tx('styles.' + st + '.titre') + '</p>'
    + '<p class="rap-score-desc">' + tx('styles.' + st + '.texte') + '</p>'
    + '<div class="rap-encadre rap-encadre--accord"><p>' + tx('styles.' + st + '.aide') + '</p></div></div></div>'
    + '<div class="rap-texte rpt-texte"><p>' + tx('attachement.pasEtiquette') + '</p><p class="rap-aide">' + tx('attachement.source') + '</p></div>',
    tx('attachement.intro'));

  // ── Ce qui vous retient ──
  const en = analyse.engagement;
  const mesure = (cle, valeur, sens) => '<div class="rap-barre rap-barre--' + sens + ' rpt-mesure">'
    + '<div class="rap-barre-tete"><p class="rap-barre-nom">' + tx('retient.mesures.' + cle) + '</p>'
    + '<p class="rap-barre-val"><strong>' + pc(valeur) + '</strong></p></div>'
    + '<div class="rap-barre-piste"><span class="rap-barre-plein" style="width:' + valeur + '%"></span></div></div>';
  const questions = brut(en.profil === 'epanoui' ? 'retient.questionsBien' : 'retient.questionsDoute');
  // La balance de Rusbult : ce qui retient (le bonheur d'aujourd'hui, ce
  // qu'on a mis dans la relation) face à ce qui éloigne (la vie sans l'autre
  // qui semble meilleure, l'idée de partir), et dessous ce qui en sort,
  // l'envie que ça dure.
  const partir = Number.isInteger(rep.pv2) ? Math.round(rep.pv2 / 3 * 100) : 0;
  const sensEngagement = en.engagement >= 60 ? 'fort' : en.engagement >= 40 ? 'moyen' : 'faible';
  const chapRetient = chapitre('retient',
    '<div class="rap-deux-cols rpt-balance">'
    + '<div class="rap-encadre rap-encadre--accord"><p class="rap-encadre-titre">' + tx('retient.tient') + '</p>'
    + mesure('satisfaction', en.satisfaction, 'fort') + mesure('investissement', en.investissement, 'fort') + '</div>'
    + '<div class="rap-encadre rap-encadre--ecart"><p class="rap-encadre-titre">' + tx('retient.eloigne') + '</p>'
    + mesure('alternatives', en.alternatives, 'faible') + mesure('partir', partir, 'faible') + '</div>'
    + '</div>'
    + '<div class="rap-encadre rpt-resultat"><p class="rap-encadre-titre">' + tx('retient.resultat') + '</p>'
    + mesure('engagement', en.engagement, sensEngagement) + '</div>'
    + '<div class="rap-bloc"><h3 class="rap-h3">' + tx('retient.choisisTitre') + '</h3>'
    + '<ul class="rap-puces rpt-retient">' + en.retient.map((id) => '<li>' + tx('retient.noms.' + id) + '</li>').join('') + '</ul></div>'
    + '<div class="rap-score rpt-profil"><div class="rap-score-texte"><p class="rap-score-lib">' + tx('essentiel.profil') + '</p>'
    + '<p class="rap-score-titre">' + tx('profils.' + en.profil + '.titre') + '</p>'
    + '<p class="rap-score-desc">' + tx('profils.' + en.profil + '.texte') + '</p></div></div>'
    + '<div class="rap-encadre rpt-verdict"><p>' + tx('retient.jamaisVerdict') + '</p></div>'
    + (alerte ? '<div class="rap-encadre rap-encadre--ecart rpt-encadre-secu"><p>' + tx('retient.securite') + '</p></div>' : '')
    + '<div class="rap-bloc rap-bloc--insecable"><h3 class="rap-h3">' + tx('retient.questionsTitre') + '</h3>'
    + '<ol class="rap-conseils">' + (Array.isArray(questions) ? questions : []).map((t) => '<li><span>' + txs(t) + '</span></li>').join('') + '</ol></div>',
    tx('retient.intro'));

  // ── Votre plan ──
  let contenuPlan;
  if (analyse.plan.mode === 'securite') {
    const actions = brut('plan.securiteActions');
    contenuPlan = (Array.isArray(actions) ? actions : []).map((a, i) => '<div class="rap-carte rpt-sujet"><div class="rap-carte-corps">'
      + '<div class="rap-carte-tete--num"><p class="rap-carte-num">' + (i + 1) + '</p><p class="rap-carte-titre">' + txs(a.titre) + '</p></div>'
      + '<p class="rpt-sujet-texte">' + txs(a.texte) + '</p></div></div>').join('')
      + '<div class="rap-bloc rap-bloc--insecable"><h3 class="rap-h3">' + tx('securite.numerosTitre') + '</h3>' + numeros() + '</div>';
  } else {
    contenuPlan = analyse.plan.sujets.map((s, i) => '<div class="rap-carte rpt-sujet"><div class="rap-carte-corps">'
      + '<div class="rap-carte-tete--num"><p class="rap-carte-num">' + (i + 1) + '</p><div>'
      + '<p class="rpt-sujet-sur">' + tx('plan.numero', { n: i + 1 }) + (s.choisi ? ' · ' + tx('plan.choisi') : '') + '</p>'
      + '<p class="rap-carte-titre">' + tx('sujets.' + s.id + '.titre') + '</p></div></div>'
      + '<div class="rap-guide rap-guide--complet">'
      + '<div class="rap-guide-bloc rap-guide-bloc--pourquoi"><p class="rap-guide-titre">' + tx('plan.pourquoi') + '</p><p>' + tx('sujets.' + s.id + '.pourquoi') + '</p></div>'
      + '<div class="rap-guide-bloc rap-guide-bloc--parler"><p class="rap-guide-titre">' + tx('plan.ouvrir') + '</p><p class="rpt-ouvrir">' + tx('sujets.' + s.id + '.ouvrir') + '</p></div>'
      + '<div class="rap-guide-bloc rap-guide-bloc--eviter"><p class="rap-guide-titre">' + tx('plan.eviter') + '</p><p>' + tx('sujets.' + s.id + '.eviter') + '</p></div>'
      + '</div></div></div>').join('')
      + '<div class="rap-encadre rpt-avant"><p class="rap-encadre-titre">' + tx('plan.avantTitre') + '</p>'
      + '<ul class="rap-puces rap-puces--parler"><li>' + tx('plan.moment') + '</li>'
      + '<li>' + txs((brut('plan.reactions') || [])[analyse.plan.reaction]) + '</li>'
      + '<li>' + txs((brut('plan.deja') || [])[analyse.plan.deja]) + '</li></ul></div>';
  }
  const chapPlan = chapitre('plan', contenuPlan, analyse.plan.mode === 'securite' ? tx('plan.securiteTitre') : tx('plan.intro'));

  // ── Et à deux ? ──
  const pointsDeux = brut('deux.points');
  const chapDeux = alerte ? '' : chapitre('deux',
    (brut('deux.motifs.' + analyse.motif) ? '<div class="rap-texte"><p>' + tx('deux.motifs.' + analyse.motif) + '</p></div>' : '')
    + '<ul class="rap-puces rap-puces--accord rpt-deux">' + (Array.isArray(pointsDeux) ? pointsDeux : []).map((t) => '<li>' + txs(t) + '</li>').join('') + '</ul>'
    + '<p class="rpt-lien"><span>' + tx('deux.lienTexte') + '</span> <strong>' + tx('deux.lien') + '</strong></p>',
    tx('deux.texte'));

  // ── Comment ce rapport est fait ──
  const sources = brut('methode.sources');
  const chapMethode = chapitre('methode',
    '<ul class="rap-puces">' + (Array.isArray(sources) ? sources : []).map((t) => '<li>' + txs(t) + '</li>').join('') + '</ul>'
    + '<div class="rap-encadre rap-encadre--doux"><p>' + tx('methode.avertissement') + '</p><p>' + tx('methode.confidentialite') + '</p></div>'
    + (o.editeur ? '<p class="rap-editeur">' + R.esc(o.editeur) + '</p>' : ''),
    tx('methode.intro'));

  const parCle = {
    securite: chapSecurite, essentiel, climat: chapClimat, besoins: chapBesoins, disputes: chapDisputes,
    equilibre: chapEquilibre, attachement: chapAttachement, retient: chapRetient, plan: chapPlan, deux: chapDeux, methode: chapMethode,
  };
  const corps = couverture + analyse.chapitres.map((c) => parCle[c] || '').join('');
  const html = '<div class="rap rap--' + format + ' rap--solo rap--point" lang="' + R.esc(lang) + '">' + corps + '</div>';
  return { html, analyse, chapitres: ['couverture', ...analyse.chapitres] };
}

// Le pied de page du PDF du point : la règle @page, comme styleDePage.
export function styleDePagePoint(TP) {
  return R.styleDePage({ rapport: { pied: (TP && TP.rapport && TP.rapport.pied) || '' } });
}
