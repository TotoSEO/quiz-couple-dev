// Le rapport de l'évaluation de couple : un seul gabarit HTML pour l'écran
// (la page du bilan, une fois payé) et pour le PDF (bilan/fabrique.mjs,
// imprimé par Chrome en A4). La feuille de style est à côté : rapport.css.
//
// Le générateur du site sert ce fichier en /js/bilan-rapport.js, sans les
// `import` ni les `export`, sous window.QCBilanRapport (le calcul vient alors
// de window.QCBilanCoeur). Rien ici ne touche au DOM : on rend une chaîne.
//
// La forme (19 octobre 2026, Thomas : « on dirait juste un document Word »,
// « toutes les pages ont la même gueule » ; puis le 20 octobre, devant le
// PDF : « pas assez clair, les informations sont trop mal étalées et
// indiquées, pas assez de séparation entre les questions, les réponses, les
// choix qui ont été faits, pas un truc flat, des parties à cheval entre deux
// pages ») : une couverture pleine couleur ; chaque chapitre commence sur
// une page neuve par un grand bloc de couleur (numéro géant, titre, une
// phrase) suivi tout de suite de son contenu (une page pleine par chapitre
// laissait la suivante à moitié vide) ; chaque carte de question porte un
// bandeau de verdict en couleur pleine (Accord, Réponses proches, Écart, avec
// Point bloquant, Sujet décisif, et le domaine), le sujet, la question en
// citation, les deux réponses dans deux boîtes à en-tête de la couleur de la
// personne, puis le guide dans un encart (pourquoi ça compte, pour en
// parler, à éviter) ; les accords d'un domaine sont des cases cochées sur
// deux colonnes ; des en-têtes de domaine en bandeau de couleur avec l'anneau
// du score ; des graphiques en SVG (radar des domaines, barres empilées,
// haltères du climat, anneau de répartition) ; une synthèse de fin différente
// de celle du début (répartition, forces, chantiers, feuille de route). En
// mode solo, l'autre est « {nom}, selon vous » et un chapitre compte les
// zones d'ombre.
//
// Règles de mise en page, pour qu'aucun mot ne sorte de sa boîte, dans
// aucune langue : jamais de position absolue pour du texte (sauf le chiffre
// au centre d'un anneau, qui a trois signes au plus) ; les colonnes sont des
// grilles à `minmax(0, 1fr)` ; les prénoms (30 signes au plus) ont toujours
// une ligne à eux ; les libellés dans un SVG sont les noms brefs des domaines
// (`bref`, douze signes au plus) ; le PDF reçoit des césures calculées
// d'avance (`couper`), Chrome n'en ayant pas sans dictionnaire.
// bilan/mise-en-page.mjs et bilan/controle-pdf.mjs vérifient tout ça sur
// chaque rapport avant l'envoi.

import * as C from './coeur.mjs';

// 4 depuis le 23 octobre 2026 : la relecture du premier rapport vendu
// (questions sans prénom à deux, accords « c'est surtout l'un des deux » avec
// les accords, carte triée, parts qui font cent, ressenti sous le texte d'un
// domaine, étiquette des sujets décisifs sur les accords).
export const VERSION_RAPPORT = 4;

const LOCALES = { fr: 'fr-FR', en: 'en-GB', es: 'es-ES', de: 'de-DE', it: 'it-IT' };

// La couleur d'ouverture de chaque chapitre (fond sombre, texte blanc).
export const TEINTES = {
  synthese: 'nuit', carte: 'prune', conversations: 'framboise', bloquants: 'brique',
  ombre: 'ardoise', climat: 'marine', signaux: 'ocre', roles: 'foret', domaines: 'violet',
  fin: 'encre', suite: 'nuit',
};

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
    .replace(/ ([?!;])/g, ' $1')
    .replace(/ ([:»])/g, ' $1')
    .replace(/« /g, '« ');
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
  const n = Math.max(String(a).length, String(b || '').length);
  if (n <= 9) return 'xl';
  if (n <= 14) return 'l';
  if (n <= 20) return 'm';
  return 's';
}

const pct = (x) => Math.max(0, Math.min(100, Math.round(x)));
const f1 = (x) => (Math.round(x * 10) / 10).toFixed(1);

// Des parts entières qui font cent à elles toutes (la méthode du plus fort
// reste) : arrondies une à une, 36, 34 et 10 sur 80 donnaient 45, 43 et 13 %,
// soit 101 % (premier rapport vendu, 23 octobre 2026).
export function partsCent(valeurs) {
  const total = valeurs.reduce((s, v) => s + v, 0);
  if (!total) return valeurs.map(() => 0);
  const brutes = valeurs.map((v) => v * 100 / total);
  const parts = brutes.map((b) => Math.floor(b));
  const restes = brutes.map((b, i) => [b - Math.floor(b), i]).sort((x, y) => y[0] - x[0] || x[1] - y[1]);
  let manque = 100 - parts.reduce((s, v) => s + v, 0);
  for (let k = 0; manque > 0 && k < restes.length; k++, manque--) parts[restes[k][1]]++;
  return parts;
}

// ── Les graphiques, en SVG ───────────────────────────────────────────────
// Rien que des formes et des libellés brefs : un libellé long irait dans
// une grille HTML. Les couleurs viennent de la feuille (classes), pas de
// l'attribut, pour que l'écran et le PDF partagent la même palette.

// Un anneau de score : la piste, l'arc, le chiffre au centre.
function anneau(valeur, classe, libelle) {
  const r = 52;
  const tour = 2 * Math.PI * r;
  const plein = pct(valeur) / 100 * tour;
  return '<div class="rap-anneau rap-anneau--' + classe + '" role="img" aria-label="' + esc(libelle) + ' : ' + pct(valeur) + ' %">'
    + '<svg viewBox="0 0 120 120" width="120" height="120" aria-hidden="true">'
    + '<circle cx="60" cy="60" r="' + r + '" class="rap-anneau-fond"/>'
    + '<circle cx="60" cy="60" r="' + r + '" class="rap-anneau-trait" stroke-dasharray="' + plein.toFixed(2) + ' ' + tour.toFixed(2) + '" transform="rotate(-90 60 60)"/>'
    + '</svg><p class="rap-anneau-valeur">' + pct(valeur) + '<span>%</span></p></div>';
}

// Un petit anneau (en-tête de domaine), coloré par la bande.
function petitAnneau(valeur, bandeCle) {
  const r = 26;
  const tour = 2 * Math.PI * r;
  const plein = pct(valeur) / 100 * tour;
  return '<div class="rap-mini-anneau rap-mini-anneau--' + (bandeCle || 'neutre') + '" aria-hidden="true">'
    + '<svg viewBox="0 0 64 64" width="64" height="64"><circle cx="32" cy="32" r="' + r + '" class="rap-mini-fond"/>'
    + '<circle cx="32" cy="32" r="' + r + '" class="rap-mini-trait" stroke-dasharray="' + plein.toFixed(2) + ' ' + tour.toFixed(2) + '" transform="rotate(-90 32 32)"/></svg>'
    + '<p class="rap-mini-valeur">' + pct(valeur) + '</p></div>';
}

// Le radar des domaines : un axe par domaine noté, le polygone des scores,
// les cercles à 25, 50, 75, 100, et le nom bref de chaque domaine autour.
// Exporté : l'écran « rapport prêt » de la page le montre avant le paiement
// (22 octobre 2026), `serre` y retire le blanc du haut et du bas.
export function radar(domaines, brefDe, titre, serre) {
  const n = domaines.length;
  if (n < 3) return '';
  const cx = 230;
  const cy = 200;
  const R = 118;
  const ang = (i) => -Math.PI / 2 + (2 * Math.PI * i) / n;
  const pt = (i, r) => [cx + r * Math.cos(ang(i)), cy + r * Math.sin(ang(i))];
  let grille = '';
  for (const k of [25, 50, 75, 100]) {
    const pts = domaines.map((d, i) => pt(i, R * k / 100).map((v) => v.toFixed(1)).join(',')).join(' ');
    grille += '<polygon points="' + pts + '" class="rap-radar-grille' + (k === 100 ? ' rap-radar-grille--bord' : '') + '"/>';
  }
  let axes = '';
  let libelles = '';
  domaines.forEach((d, i) => {
    const [x, y] = pt(i, R);
    axes += '<line x1="' + cx + '" y1="' + cy + '" x2="' + x.toFixed(1) + '" y2="' + y.toFixed(1) + '" class="rap-radar-axe"/>';
    const [lx, ly] = pt(i, R + 22);
    const c = Math.cos(ang(i));
    const anchor = c > 0.25 ? 'start' : c < -0.25 ? 'end' : 'middle';
    const dy = Math.sin(ang(i)) > 0.6 ? 8 : Math.sin(ang(i)) < -0.6 ? -2 : 3;
    libelles += '<text x="' + lx.toFixed(1) + '" y="' + (ly + dy).toFixed(1) + '" text-anchor="' + anchor + '" class="rap-radar-lib">' + esc(brefDe(d.id)) + '</text>';
  });
  const poly = domaines.map((d, i) => pt(i, R * pct(d.score) / 100).map((v) => v.toFixed(1)).join(',')).join(' ');
  const points = domaines.map((d, i) => {
    const [x, y] = pt(i, R * pct(d.score) / 100);
    return '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="4.5" class="rap-radar-point rap-radar-point--' + d.bande + '"/>';
  }).join('');
  return '<figure class="rap-radar" role="img" aria-label="' + esc(titre) + '">'
    + '<svg viewBox="' + (serre ? '0 36 460 328' : '0 0 460 400') + '" aria-hidden="true">' + grille + axes
    + '<polygon points="' + poly + '" class="rap-radar-forme"/>' + points + libelles + '</svg></figure>';
}

// L'anneau de répartition : accords, proches, écarts, chacun son arc, avec
// un vide de deux pixels entre deux arcs ; au centre, la part d'accords
// (`part`, la même que dans la liste à côté).
function anneauRepartition(compte, libelleCentre, part) {
  const total = compte.accords + compte.proches + compte.ecarts;
  if (!total) return '';
  const r = 54;
  const tour = 2 * Math.PI * r;
  const vide = 2.5;
  let debut = 0;
  let arcs = '';
  for (const [cle, n] of [['accord', compte.accords], ['proche', compte.proches], ['ecart', compte.ecarts]]) {
    if (!n) continue;
    const longueur = Math.max(0, tour * n / total - vide);
    arcs += '<circle cx="70" cy="70" r="' + r + '" class="rap-don-arc rap-don-arc--' + cle + '" stroke-dasharray="' + longueur.toFixed(2) + ' ' + (tour - longueur).toFixed(2) + '" stroke-dashoffset="' + (-debut).toFixed(2) + '" transform="rotate(-90 70 70)"/>';
    debut += tour * n / total;
  }
  return '<div class="rap-don" role="img" aria-label="' + esc(libelleCentre) + ' : ' + part + ' %">'
    + '<svg viewBox="0 0 140 140" width="140" height="140" aria-hidden="true"><circle cx="70" cy="70" r="' + r + '" class="rap-don-fond"/>' + arcs + '</svg>'
    + '<p class="rap-don-valeur">' + part + '<span>%</span></p></div>';
}

// Une barre empilée de trois parts (accords, proches, écarts), gaps de
// deux pixels, sans texte dedans.
function barreEmpilee(accords, proches, ecarts) {
  const total = accords + proches + ecarts;
  if (!total) return '<div class="rap-pile rap-pile--vide"></div>';
  // Les parts se partagent la place par flex-grow : les vides entre elles
  // sont retranchés par la boîte, rien ne déborde.
  const part = (cle, n) => (n ? '<span class="rap-pile-part rap-pile-part--' + cle + '" style="flex-grow:' + n + '"></span>' : '');
  return '<div class="rap-pile" aria-hidden="true">' + part('accord', accords) + part('proche', proches) + part('ecart', ecarts) + '</div>';
}

// d : { lang, mode, situation, a: { prenom, genre, reponses, nn, percu }, b: {...}, finiLe }
// T : l'objet `app` de {lang}/bilan.json
// Q : {lang}/bilan-questions.json
// o : { format: 'pdf' | 'ecran', couper: (texte) => texte, editeur: '...' }
// Renvoie { html, analyse, chapitres }.
export function rapportHtml(d, T, Q, o) {
  o = o || {};
  const lang = d.lang || 'fr';
  const format = o.format === 'pdf' ? 'pdf' : 'ecran';
  const solo = d.mode === 'solo';
  const couper = typeof o.couper === 'function' ? o.couper : (s) => s;
  const analyse = C.analyser(d.situation, d.a, d.b, solo ? 'solo' : 'duo');
  const [coulA, coulB] = couleurs(d.a.genre, d.b.genre);
  const P = {
    a: { cle: 'a', nom: d.a.prenom, genre: d.a.genre || null, couleur: coulA, rep: d.a.reponses || {}, nn: d.a.nn || [] },
    b: { cle: 'b', nom: d.b.prenom, genre: d.b.genre || null, couleur: coulB, rep: solo ? (d.a.percu || {}) : (d.b.reponses || {}), nn: solo ? [] : (d.b.nn || []) },
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
  // En solo, un texte `rapport.solo.<chemin>` l'emporte quand il existe.
  const chemin = (c) => (solo && brut('rapport.solo.' + c.replace(/^rapport\./, '')) ? 'rapport.solo.' + c.replace(/^rapport\./, '') : c);
  // Un texte de l'interface, rempli, coupé, échappé.
  const tx = (c, vars) => esc(couper(insecables(remplir2(brut(chemin(c)), vars), lang)));
  // Un texte venu d'ailleurs (questions, prénoms), coupé et échappé.
  const tl = (s) => esc(couper(insecables(s, lang)));
  // Un prénom : jamais coupé par le dictionnaire, il passe à la ligne où il peut.
  const nomSeul = (p) => '<span class="rap-nom rap-nom--' + p.couleur + '">' + esc(p.nom) + '</span>';
  // Le nom tel qu'il s'écrit en tête d'une colonne : en solo, l'autre est
  // « {nom}, selon vous ».
  const nomH = (p) => (solo && p.cle === 'b'
    ? nomSeul(p) + '<span class="rap-selon">' + tx('rapport.solo.selonSuffixe') + '</span>'
    : nomSeul(p));
  const pastille = (p) => '<span class="rap-pastille rap-pastille--' + p.couleur + '" aria-hidden="true"></span>';

  const textQ = (id) => {
    const r = C.INDEX[id];
    return (r && Q.domaines[r.d.id] && Q.domaines[r.d.id].questions[id]) || {};
  };
  const titreDomaine = (id) => (Q.domaines[id] && Q.domaines[id].titre) || id;
  const brefDomaine = (id) => (Q.domaines[id] && (Q.domaines[id].bref || Q.domaines[id].titre)) || id;
  // La question, accord neutre. En solo, telle que A l'a lue, avec le prénom
  // de l'autre. À deux, chacun a lu la sienne (« Quand Julien sort sans
  // vous » pour l'une, « Quand Camille sort sans vous » pour l'autre) : le
  // rapport, lu par les deux, écrit la version sans prénom (`qNeutre`). Le
  // premier rapport vendu (23 octobre 2026) mettait la réponse de B sous la
  // question de A, qui nommait B : « Quand Camille sort sans vous... Camille :
  // Difficile ».
  const enonce = (id) => {
    const t = textQ(id);
    if (!solo && t.qNeutre) return C.accorder(t.qNeutre, null);
    return C.remplir(C.accorder(t.q || '', null), { autre: P.b.nom });
  };
  const court = (id) => textQ(id).court || enonce(id);
  // La réponse de quelqu'un, écrite pour être lue par les deux (en solo,
  // la réponse de B est ce que A imagine : même texte, accordé au genre de B).
  function reponseLue(id, p) {
    const r = C.INDEX[id];
    const v = p.rep[id];
    if (!Number.isInteger(v) || v < 0) return '';
    if (r.q.type === 'qui') {
      if (v === 2) return Q.quiNeutre[2];
      return C.remplir(Q.quiNeutre[v < 2 ? v : 4 - v], { nom: v < 2 ? p.nom : p.autre.nom });
    }
    return C.remplir(C.accorder((textQ(id).o || [])[v] || '', p.genre), { autre: p.autre.nom });
  }

  // La réponse commune d'un accord, écrite pour les deux. A et B ont choisi
  // la même case, mais chacun l'a lue de son côté :
  //   - une réponse qui nomme l'autre (« Je décide avec Julien ») s'écrit
  //     sans prénom (`oNeutre`) ;
  //   - une question miroir (« Dans ma famille », « Dans la famille de
  //     {autre} ») garde les prénoms, qui disent de quelle famille on parle :
  //     « ma famille » de A s'écrit avec la case jumelle et le prénom de A ;
  //   - un accord au genre prend la forme neutre si les deux genres diffèrent.
  // En solo, la réponse de A telle qu'il l'a lue.
  function reponseCommune(id) {
    const r = C.INDEX[id];
    const v = P.a.rep[id];
    if (solo || r.q.type === 'qui' || !Number.isInteger(v) || v < 0) return reponseLue(id, P.a);
    const t = textQ(id);
    const o = t.o || [];
    const genre = P.a.genre === P.b.genre ? P.a.genre : null;
    if (r.q.miroir) {
      const jumelle = r.q.miroir[v];
      if (jumelle !== undefined && !/\{autre\}/.test(o[v] || '') && /\{autre\}/.test(o[jumelle] || '')) {
        return C.remplir(C.accorder(o[jumelle], genre), { autre: P.a.nom });
      }
      return C.remplir(C.accorder(o[v] || '', genre), { autre: P.b.nom });
    }
    if (Array.isArray(t.oNeutre) && t.oNeutre[v]) return C.accorder(t.oNeutre[v], genre);
    return C.remplir(C.accorder(o[v] || '', genre), { autre: P.b.nom });
  }

  // Le texte d'un domaine, tiré de l'accord des réponses. Quand l'un des deux
  // vit mal ce domaine en ce moment (son ressenti y est sous 50 %), une
  // seconde phrase le dit et renvoie au détail : sans elle, « Vos envies sont
  // proches » précédait « Vous vous sentez désirée : pas du tout » (premier
  // rapport vendu, 23 octobre 2026). Pour les disputes, le ressenti vient des
  // signaux de vigilance, qui ont leur chapitre. `court` : sans le renvoi,
  // pour la synthèse de fin.
  function texteDomaine(x, court) {
    const base = x.bande && Q.domaines[x.id] && Q.domaines[x.id].rapport ? Q.domaines[x.id].rapport[x.bande] : '';
    if (!base) return '';
    let texte = tl(base);
    // En solo, le ressenti prêté à l'autre peut manquer (aucune question
    // d'état imaginée dans le domaine) : celui de A suffit.
    const ressentis = [x.climatA, x.climatB].filter((v) => v !== null);
    if (ressentis.length && Math.min(...ressentis) < 50) {
      const signaux = x.etats.length && x.etats.every((e) => e.signal);
      if (signaux) {
        texte += ' ' + tx(court ? 'rapport.domaines.signauxBasCourt' : 'rapport.domaines.signauxBas', { n: numeroDe('signaux'), titre: brut(chemin('rapport.chapitres.signaux')) });
      } else {
        texte += ' ' + tx(court ? 'rapport.domaines.climatBasCourt' : 'rapport.domaines.climatBas', { titre: brut(chemin('rapport.domaines.etats')) });
      }
    }
    return texte;
  }

  const parId = {};
  analyse.items.forEach((i) => { parId[i.id] = i; });
  const domaineParId = {};
  analyse.domaines.forEach((x) => { domaineParId[x.id] = x; });
  const nbQuestions = analyse.compte.repondues;
  const domainesNotes = analyse.domaines.filter((x) => !x.meteo && x.score !== null);
  const signature = esc(P.a.nom) + (solo ? '' : ' <span class="rap-sig-et">&amp;</span> ' + esc(P.b.nom)) + ' · ' + esc(dateLongue(d.finiLe, lang));

  // ── Petits blocs ──

  // Un chapitre : son bloc d'ouverture (numéro géant, titre, une phrase,
  // sur un aplat de couleur ; en tête de sa première page dans le PDF, en
  // bandeau à l'écran), puis l'intro et le contenu.
  function chapitre(cle, numero, contenu, intro) {
    const teinte = TEINTES[cle] || 'nuit';
    const num = String(numero).padStart(2, '0');
    return '<section class="rap-chap rap-chap--' + cle + '" data-chap="' + cle + '">'
      + '<header class="rap-ouv rap-ouv--' + teinte + '" data-chap="ouv-' + cle + '">'
      + '<div class="rap-ouv-deco" aria-hidden="true"><svg viewBox="0 0 300 300" preserveAspectRatio="xMaxYMax slice"><circle cx="210" cy="190" r="150" class="rap-ouv-cercle"/><circle cx="260" cy="120" r="150" class="rap-ouv-cercle"/><circle cx="235" cy="155" r="70" class="rap-ouv-cercle rap-ouv-cercle--plein"/></svg></div>'
      + '<p class="rap-ouv-num" aria-hidden="true">' + num + '</p>'
      + '<div class="rap-ouv-texte"><h2 class="rap-ouv-titre">' + tx('rapport.chapitres.' + cle) + '</h2>'
      + (brut('rapport.ouvertures.' + cle) ? '<p class="rap-ouv-accroche">' + tx('rapport.ouvertures.' + cle, { a: P.a.nom, b: P.b.nom }) + '</p>' : '')
      + '</div></header>'
      + '<div class="rap-chap-corps">'
      + (intro ? '<p class="rap-chap-intro">' + intro + '</p>' : '')
      + contenu + '</div></section>';
  }

  // Le bandeau de verdict d'une carte : la catégorie en toutes lettres
  // (Accord, Réponses proches, Écart), ses étiquettes (point bloquant, à
  // trancher, chacun plus, sujet décisif), et à droite le domaine ou rien.
  function bandeCarte(item, droite) {
    let chips = '<span class="rap-carte-cat">' + tx('rapport.cat.' + item.cat) + '</span>';
    if (item.statut) chips += '<span class="rap-tag rap-tag--bande">' + tx('rapport.statut.' + item.statut) + '</span>';
    if (item.chacunPlus) chips += '<span class="rap-tag rap-tag--bande">' + tx('rapport.roles.chacunPlus') + '</span>';
    if (item.poids === 3) chips += '<span class="rap-tag rap-tag--bande">' + tx('rapport.poidsFort') + '</span>';
    return '<header class="rap-carte-bande"><p class="rap-carte-verdict">' + chips + '</p>'
      + (droite ? '<p class="rap-carte-dom">' + droite + '</p>' : '') + '</header>';
  }

  // Les deux réponses côte à côte : un en-tête de la couleur de la personne
  // avec son prénom, puis sa réponse en gras.
  function deuxReponses(id, nnA, nnB) {
    const col = (p, nn) => '<div class="rap-rep rap-rep--' + p.couleur + '">'
      + '<p class="rap-rep-tete">' + nomH(p) + '</p>'
      + '<div class="rap-rep-corps"><p class="rap-rep-texte">' + tl(reponseLue(id, p)) + '</p>'
      + (nn ? '<p class="rap-rep-nn">' + tx('rapport.nnDe', { nom: p.nom }) + '</p>' : '')
      + '</div></div>';
    return '<div class="rap-reps">' + col(P.a, nnA) + col(P.b, nnB) + '</div>';
  }

  // Le guide d'une question, dans son encart : pourquoi ça compte, et, en
  // version complète, les questions pour en parler et ce qu'il vaut mieux
  // éviter, sur une seconde colonne.
  function guide(id, complet) {
    const t = textQ(id);
    const blocs = [];
    if (t.pourquoi) blocs.push('<div class="rap-guide-bloc rap-guide-bloc--pourquoi"><p class="rap-guide-titre">' + tx('rapport.pourquoi') + '</p><p>' + tl(t.pourquoi) + '</p></div>');
    if (complet && Array.isArray(t.parler) && t.parler.length) {
      blocs.push('<div class="rap-guide-bloc rap-guide-bloc--parler"><p class="rap-guide-titre">' + tx('rapport.parler') + '</p><ul class="rap-puces rap-puces--parler">'
        + t.parler.map((q) => '<li>' + tl(q) + '</li>').join('') + '</ul></div>');
    }
    if (complet && t.eviter) blocs.push('<div class="rap-guide-bloc rap-guide-bloc--eviter"><p class="rap-guide-titre">' + tx('rapport.eviter') + '</p><p>' + tl(t.eviter) + '</p></div>');
    if (!blocs.length) return '';
    return '<div class="rap-guide' + (blocs.length > 1 ? ' rap-guide--complet' : '') + '">' + blocs.join('') + '</div>';
  }

  // Une carte de question : le bandeau de verdict, le sujet (avec son numéro
  // pour une conversation), la question, les deux réponses, le guide.
  // o.mode : 'complet' (tout le guide), 'court' (pourquoi ça compte), ou
  // 'renvoi' vers la carte complète déjà donnée plus haut (o.renvoi) ;
  // o.droite : ce qui s'écrit à droite du bandeau (le domaine) ; o.sur et
  // o.numero : le surtitre et le numéro d'une conversation.
  function carteEcart(item, o) {
    o = o || {};
    const mode = o.mode || 'complet';
    let note = '';
    if (item.desequilibre) {
      const p = item.desequilibre === 'a' ? P.a : P.b;
      note = '<p class="rap-carte-note">' + tx('rapport.roles.desequilibre', { nom: p.nom }) + '</p>';
    } else if (item.chacunPlus) {
      note = '<p class="rap-carte-note">' + tx('rapport.roles.chacunPlusTexte') + '</p>';
    }
    const titre = (o.sur ? '<p class="rap-carte-sur">' + o.sur + '</p>' : '') + '<h3 class="rap-carte-titre">' + tl(court(item.id)) + '</h3>';
    return '<article class="rap-carte rap-carte--' + item.cat + '">'
      + bandeCarte(item, o.droite)
      + '<div class="rap-carte-corps">'
      + (o.numero
        ? '<div class="rap-carte-tete rap-carte-tete--num"><p class="rap-carte-num" aria-hidden="true">' + o.numero + '</p><div>' + titre + '</div></div>'
        : '<div class="rap-carte-tete">' + titre + '</div>')
      + '<p class="rap-carte-q">' + tl(enonce(item.id)) + '</p>'
      + deuxReponses(item.id, item.nnA, item.nnB)
      + note
      + (mode === 'renvoi' ? '<p class="rap-renvoi">' + o.renvoi + '</p>' : guide(item.id, mode === 'complet'))
      + '</div></article>';
  }

  // Une case cochée : un sujet sur lequel les deux ont répondu pareil (ou,
  // en solo, une question restée sans réponse pour l'autre, variante
  // `inconnu`, ou une question où l'autre n'a pas été imaginé(e), variante
  // `seule`, au point de la couleur de A), avec la réponse commune dessous.
  const COCHE = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const POINT = '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="3.2" fill="#fff"/></svg>';
  // `etiquette` : la ou les étiquettes à poser sous la réponse (non
  // négociable). Un accord sur un sujet décisif porte aussi l'étiquette
  // « Sujet décisif », comme le promet la page « Comment lire ce rapport » ;
  // sans elle, les huit cases de « Ce qui vous rassemble » se lisaient comme
  // les sujets décisifs, et le socle « 7/8 » de la fin semblait les contredire.
  function caseAccord(item, variante, etiquette) {
    const inconnu = variante === 'inconnu';
    const seule = variante === 'seule';
    const decisif = !inconnu && item.poids === 3 ? '<span class="rap-tag rap-tag--poids">' + tx('rapport.poidsFort') + '</span>' : '';
    const tags = decisif + (etiquette || '');
    return '<div class="rap-accord' + (inconnu ? ' rap-accord--inconnu' : '') + (seule ? ' rap-accord--seule rap-accord--' + P.a.couleur : '') + '">'
      + '<span class="rap-accord-coche">' + (inconnu || seule ? POINT : COCHE) + '</span>'
      + '<div><p class="rap-accord-titre">' + tl(court(item.id)) + '</p>'
      + '<p class="rap-accord-rep">' + tl(inconnu || seule ? reponseLue(item.id, P.a) : reponseCommune(item.id)) + '</p>'
      + (tags ? '<p class="rap-accord-tags">' + tags + '</p>' : '') + '</div></div>';
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
  // En solo, une question où l'autre n'a pas été imaginé(e) n'a que la
  // ligne de A.
  function lignesReponses(id) {
    const l = (p) => '<li class="rap-qui-dit">' + pastille(p) + '<span class="rap-qui-dit-texte">' + nomH(p)
      + '<span class="rap-deux-points">' + (lang === 'fr' ? ' : ' : ': ') + '</span>' + tl(reponseLue(id, p)) + '</span></li>';
    return '<ul class="rap-qui-dits">' + l(P.a) + (reponseLue(id, P.b) ? l(P.b) : '') + '</ul>';
  }

  const legendeDuo = '<p class="rap-legende-duo"><span class="rap-legende-item">' + pastille(P.a) + nomH(P.a) + '</span>'
    + '<span class="rap-legende-item">' + pastille(P.b) + nomH(P.b) + '</span></p>';
  const legendeComptes = '<p class="rap-legende-comptes">'
    + '<span class="rap-compte rap-compte--accord">' + tx('rapport.carte.accords') + '</span>'
    + '<span class="rap-compte rap-compte--proche">' + tx('rapport.carte.proches') + '</span>'
    + '<span class="rap-compte rap-compte--ecart">' + tx('rapport.carte.ecarts') + '</span>'
    + (solo ? '<span class="rap-compte rap-compte--inconnu">' + tx('rapport.carte.inconnus') + '</span>' : '') + '</p>';

  // ── Couverture ──

  const taille = tailleCouverture(P.a.nom, solo ? '' : P.b.nom);
  const couverture = '<section class="rap-couv" data-chap="couverture">'
    + '<div class="rap-couv-deco" aria-hidden="true"><svg viewBox="0 0 400 400" preserveAspectRatio="xMaxYMin slice">'
    + '<circle cx="250" cy="170" r="150" class="rap-couv-rond rap-couv-rond--' + P.a.couleur + '"/>'
    + '<circle cx="' + (solo ? 250 : 330) + '" cy="' + (solo ? 170 : 230) + '" r="' + (solo ? 110 : 150) + '" class="rap-couv-rond rap-couv-rond--' + (solo ? 'blanc' : P.b.couleur) + '"/>'
    + '</svg></div>'
    + '<div class="rap-couv-corps">'
    + '<p class="rap-couv-sur">' + tx('rapport.surtitre') + '</p>'
    + '<p class="rap-couv-de">' + tx('rapport.couverture.de') + '</p>'
    + '<h1 class="rap-couv-noms rap-couv-noms--' + taille + '"><span class="rap-couv-nom">' + esc(P.a.nom) + '</span>'
    + (solo ? '' : '<span class="rap-couv-nom"><span class="rap-couv-et">' + tx('rapport.couverture.et') + '</span> ' + esc(P.b.nom) + '</span>') + '</h1>'
    + (solo ? '<p class="rap-couv-solo">' + tx('rapport.solo.couverture.solo', { nom: P.b.nom }) + '</p>' : '')
    + '<p class="rap-couv-date">' + tx('rapport.couverture.date', { date: dateLongue(d.finiLe, lang) }) + '</p>'
    + '<p class="rap-couv-chiffres">' + tx('rapport.couverture.chiffres', { domaines: domainesNotes.length + 1, questions: nombreFormate(nbQuestions, lang) }) + '</p>'
    + '</div>'
    + '<div class="rap-couv-pied"><p class="rap-couv-marque">Quiz Couple</p><p class="rap-couv-conf">' + tx('rapport.couverture.confidentiel') + '</p></div>'
    + '</section>';

  // ── Comment lire ──

  const chapitresListe = ['synthese', 'carte', 'conversations', 'bloquants', ...(solo ? ['ombre'] : []), 'climat', 'signaux', 'roles', 'domaines', 'fin', 'suite'];
  const numeroDe = (cle) => chapitresListe.indexOf(cle) + 1;
  const lire = '<section class="rap-chap rap-chap--lire" data-chap="lire"><div class="rap-chap-corps">'
    + '<div class="rap-chap-tete"><h2 class="rap-chap-titre">' + tx('rapport.lire.titre') + '</h2></div>'
    + '<div class="rap-texte"><p>' + tx('rapport.lire.p1', { a: P.a.nom, b: P.b.nom }) + '</p><p>' + tx('rapport.lire.p2') + '</p><p>' + tx('rapport.lire.p3') + '</p></div>'
    + '<div class="rap-deux-cols">'
    + '<div class="rap-encadre"><p class="rap-encadre-titre">' + tx('rapport.lire.reperes') + '</p>'
    + legendeDuo
    + '<ul class="rap-reperes">'
    + ['accord', 'proche', 'ecart'].map((c) => '<li><span class="rap-tag rap-tag--' + c + '">' + tx('rapport.cat.' + c) + '</span><span>' + tx('rapport.lire.' + c) + '</span></li>').join('')
    + '<li><span class="rap-tag rap-tag--nn">' + tx('rapport.lire.nnTag') + '</span><span>' + tx('rapport.lire.nn') + '</span></li>'
    + '<li><span class="rap-tag rap-tag--poids">' + tx('rapport.poidsFort') + '</span><span>' + tx('rapport.lire.poids') + '</span></li>'
    + (solo ? '<li><span class="rap-tag rap-tag--inconnu">' + tx('rapport.solo.inconnuTag') + '</span><span>' + tx('rapport.solo.inconnuLire') + '</span></li>' : '')
    + '</ul></div>'
    + '<div class="rap-encadre"><p class="rap-encadre-titre">' + tx('rapport.lire.sommaire') + '</p><ol class="rap-sommaire">'
    + chapitresListe.map((c, i) => '<li><span class="rap-sommaire-num">' + String(i + 1).padStart(2, '0') + '</span><span>' + tx('rapport.chapitres.' + c) + '</span></li>').join('')
    + '</ol></div></div></div></section>';

  // ── 1. Synthèse ──

  const verdict = analyse.bandeGlobal || 'creuser';
  const temps = analyse.bandeMeteo || 'variable';
  const tuile = (cle, n) => '<div class="rap-tuile rap-tuile--' + cle + '"><p class="rap-tuile-n">' + n + '</p><p class="rap-tuile-lib">' + tx('rapport.synthese.tuiles.' + cle) + '</p></div>';
  const listeDomaines = (ids) => '<ul class="rap-liste-dom">' + ids.map((id) => {
    const x = domaineParId[id];
    return '<li><span class="rap-liste-dom-nom">' + tl(titreDomaine(id)) + '</span><span class="rap-liste-dom-val">' + x.score + ' %</span></li>';
  }).join('') + '</ul>';
  const rassemble = analyse.rassemble.length
    ? '<div class="rap-bloc"><h3 class="rap-h3">' + tx('rapport.synthese.rassemble') + '</h3><p class="rap-aide">' + tx('rapport.synthese.rassembleIntro') + '</p>'
      + '<div class="rap-accords">' + analyse.rassemble.map((id) => caseAccord(parId[id])).join('') + '</div></div>'
    : '';
  const synthese = chapitre('synthese', numeroDe('synthese'),
    '<div class="rap-anneaux">'
    + '<div class="rap-score">' + (analyse.global === null ? '' : anneau(analyse.global, 'align', brut('rapport.synthese.alignement')))
    + '<div class="rap-score-texte"><p class="rap-score-lib">' + tx('rapport.synthese.alignement') + '</p>'
    + '<p class="rap-score-titre">' + tx('rapport.verdicts.' + verdict + '.titre') + '</p>'
    + '<p class="rap-score-desc">' + tx('rapport.verdicts.' + verdict + '.texte') + '</p>'
    + '<p class="rap-aide">' + tx('rapport.synthese.alignementAide') + '</p></div></div>'
    + '<div class="rap-score">' + (analyse.meteo === null ? '' : anneau(analyse.meteo, 'climat', brut('rapport.synthese.climat')))
    + '<div class="rap-score-texte"><p class="rap-score-lib">' + tx('rapport.synthese.climat') + '</p>'
    + '<p class="rap-score-titre">' + tx('rapport.meteos.' + temps + '.titre') + '</p>'
    + '<p class="rap-score-desc">' + tx('rapport.meteos.' + temps + '.texte') + '</p>'
    + (analyse.meteoA !== null ? '<ul class="rap-climats">'
      + '<li>' + pastille(P.a) + '<span>' + nomH(P.a) + '<span class="rap-climat-n">' + analyse.meteoA + ' %</span></span></li>'
      // En solo, sans question d'état imaginée, pas de climat prêté à l'autre.
      + (analyse.meteoB === null ? '' : '<li>' + pastille(P.b) + '<span>' + nomH(P.b) + '<span class="rap-climat-n">' + analyse.meteoB + ' %</span></span></li>') + '</ul>' : '')
    + '<p class="rap-aide">' + tx('rapport.synthese.climatAide') + '</p></div></div>'
    + '</div>'
    + '<div class="rap-tuiles">' + tuile('accords', analyse.compte.accords) + tuile('proches', analyse.compte.proches)
    + tuile('ecarts', analyse.compte.ecarts) + tuile('bloquants', analyse.compte.bloquants)
    + (solo ? tuile('inconnus', analyse.compte.inconnus) : tuile('vigilance', analyse.compte.vigilance)) + '</div>'
    + '<div class="rap-bloc rap-bloc--radar"><div class="rap-radar-grille-page">'
    + radar(domainesNotes, brefDomaine, brut('rapport.synthese.radar'))
    + '<div><h3 class="rap-h3">' + tx('rapport.synthese.radar') + '</h3><p class="rap-aide">' + tx('rapport.synthese.radarAide') + '</p>'
    + '<div class="rap-encadre rap-encadre--accord"><p class="rap-encadre-titre">' + tx('rapport.synthese.forts') + '</p>' + listeDomaines(analyse.forces) + '</div>'
    + '<div class="rap-encadre rap-encadre--ecart"><p class="rap-encadre-titre">' + tx('rapport.synthese.faibles') + '</p>' + listeDomaines(analyse.chantiers) + '</div>'
    + '</div></div></div>'
    + rassemble,
    tx('rapport.synthese.intro'));

  // ── 2. Carte des domaines ──

  // Du domaine le plus accordé au plus discuté, comme l'annonce l'ouverture
  // du chapitre ; les barres suivaient l'ordre des domaines jusqu'au
  // 23 octobre 2026. À score égal, l'ordre des domaines.
  const rangDomaine = (id) => C.DOMAINES.findIndex((dom) => dom.id === id);
  const domainesTries = domainesNotes.slice().sort((u, v) => v.score - u.score || rangDomaine(u.id) - rangDomaine(v.id));
  const barres = domainesTries.map((x) => '<div class="rap-barre rap-barre--' + x.bande + '">'
    + '<div class="rap-barre-tete"><p class="rap-barre-nom">' + tl(titreDomaine(x.id)) + '</p>'
    + '<p class="rap-barre-val"><span class="rap-barre-bande">' + tx('rapport.carte.bandes.' + x.bande) + '</span><strong>' + x.score + ' %</strong></p></div>'
    + '<div class="rap-barre-piste"><span class="rap-barre-plein" style="width:' + x.score + '%"></span></div>'
    + '<div class="rap-barre-pied">' + barreEmpilee(x.accords, x.proches, x.ecarts)
    + '<p class="rap-barre-compte"><span class="rap-compte rap-compte--accord">' + x.accords + '</span><span class="rap-compte rap-compte--proche">' + x.proches + '</span><span class="rap-compte rap-compte--ecart">' + x.ecarts + '</span>'
    + (solo && x.inconnus ? '<span class="rap-compte rap-compte--inconnu">' + x.inconnus + '</span>' : '') + '</p></div>'
    + '</div>').join('');
  const carte = chapitre('carte', numeroDe('carte'),
    legendeComptes + '<div class="rap-barres">' + barres + '</div>',
    tx('rapport.carte.intro'));

  // ── 3. Les quatre prochaines conversations ──

  const conversations = chapitre('conversations', numeroDe('conversations'),
    analyse.conversations.length
      ? analyse.conversations.map((id, i) => carteEcart(parId[id], { sur: tx('rapport.conversations.titre', { n: i + 1 }), droite: tl(titreDomaine(parId[id].domaine)), numero: i + 1 })).join('')
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
  const bloquants = chapitre('bloquants', numeroDe('bloquants'),
    (analyse.bloquants.length ? analyse.bloquants.map((id) => carteEcart(parId[id], { droite: tl(titreDomaine(parId[id].domaine)) })).join('')
      : '<p class="rap-vide">' + tx('rapport.bloquants.aucun') + '</p>')
    + '<div class="rap-bloc rap-bloc--insecable"><h3 class="rap-h3">' + tx('rapport.bloquants.nnTitre') + '</h3><p class="rap-aide">' + tx('rapport.bloquants.nnIntro') + '</p>'
    + (solo ? listeNn(P.a) : '<div class="rap-deux-cols">' + listeNn(P.a) + listeNn(P.b) + '</div>') + '</div>',
    tx('rapport.bloquants.intro'));

  // ── Solo : les zones d'ombre ──

  let ombre = '';
  if (solo) {
    const parDomaine = C.DOMAINES.map((dom) => ({ id: dom.id, ids: analyse.inconnus.filter((i) => i.domaine === dom.id).map((i) => i.id) })).filter((x) => x.ids.length);
    const bandeO = analyse.bandeOmbre || 'peu';
    ombre = chapitre('ombre', numeroDe('ombre'),
      '<div class="rap-score rap-score--ombre">' + anneau(analyse.ombre || 0, 'ombre', brut('rapport.ombre.part'))
      + '<div class="rap-score-texte"><p class="rap-score-lib">' + tx('rapport.ombre.part') + '</p>'
      + '<p class="rap-score-titre">' + tx('rapport.ombre.bandes.' + bandeO + '.titre') + '</p>'
      + '<p class="rap-score-desc">' + tx('rapport.ombre.bandes.' + bandeO + '.texte', { n: analyse.compte.inconnus, nom: P.b.nom }) + '</p></div></div>'
      + (parDomaine.length
        ? '<h3 class="rap-h3 rap-h3--espace">' + tx('rapport.ombre.listeTitre') + '</h3><p class="rap-aide">' + tx('rapport.ombre.listeAide', { nom: P.b.nom }) + '</p>'
          + parDomaine.map((x) => '<div class="rap-ombre-dom"><p class="rap-h4">' + tl(titreDomaine(x.id)) + '</p><ul class="rap-puces rap-puces--inconnu">'
            + x.ids.map((id) => {
              const inc = analyse.inconnus.filter((i) => i.id === id)[0];
              return '<li><strong>' + tl(court(id)) + '</strong>'
                + (inc && inc.poids === 3 ? ' <span class="rap-tag rap-tag--poids">' + tx('rapport.poidsFort') + '</span>' : '')
                + '<br><span class="rap-puce-rep">' + tl(enonce(id)) + '</span></li>';
            }).join('') + '</ul></div>').join('')
        : '<p class="rap-vide">' + tx('rapport.ombre.aucune', { nom: P.b.nom }) + '</p>'),
      tx('rapport.ombre.intro', { nom: P.b.nom }));
  }

  // ── 5. Le climat ──

  function carteEtat(e) {
    const t = textQ(e.id);
    const n = (t.o || []).length || 4;
    const drapeaux = [];
    if (e.ecart) drapeaux.push('<span class="rap-tag rap-tag--ecart">' + tx('rapport.climat.ecart') + '</span>');
    else if (e.attentionA || e.attentionB) drapeaux.push('<span class="rap-tag rap-tag--proche">' + tx('rapport.climat.attention') + '</span>');
    const etatCls = e.ecart ? 'ecart' : (e.attentionA || e.attentionB) ? 'attention' : 'ok';
    return '<article class="rap-etat rap-etat--' + etatCls + '">'
      + '<div class="rap-etat-tete"><h3 class="rap-etat-titre">' + tl(court(e.id)) + '</h3>'
      + (drapeaux.length ? '<p class="rap-tags">' + drapeaux.join('') + '</p>' : '') + '</div>'
      + echelle(n, e.a, e.b, null, 'bien')
      + lignesReponses(e.id)
      + ((e.attentionA || e.attentionB || e.ecart) ? guide(e.id, true) : '')
      + '</article>';
  }
  // Les haltères du climat : pour chaque domaine qui a des questions d'état,
  // le bien-être de chacun sur une même ligne.
  const domainesClimat = analyse.domaines.filter((x) => x.climatA !== null);
  const halteres = domainesClimat.length
    ? '<div class="rap-bloc rap-bloc--halteres"><h3 class="rap-h3">' + tx('rapport.climat.parDomaine') + '</h3><p class="rap-aide">' + tx('rapport.climat.parDomaineAide') + '</p>'
      + legendeDuo
      + '<div class="rap-halteres">' + domainesClimat.map((x) => {
        // En solo, sans question d'état imaginée dans le domaine, le point
        // de l'autre manque : celui de A reste seul sur la ligne.
        const a = pct(x.climatA);
        const b = x.climatB === null ? null : pct(x.climatB);
        const lo = b === null ? a : Math.min(a, b);
        const hi = b === null ? a : Math.max(a, b);
        return '<div class="rap-haltere">'
          + '<p class="rap-haltere-nom">' + tl(x.meteo ? brut('rapport.chapitres.climat') : titreDomaine(x.id)) + '</p>'
          + '<div class="rap-haltere-piste" aria-hidden="true"><span class="rap-haltere-lien" style="left:' + lo + '%;width:' + (hi - lo) + '%"></span>'
          + '<span class="rap-haltere-point rap-haltere-point--' + P.a.couleur + '" style="left:' + a + '%"></span>'
          + (b === null ? '' : '<span class="rap-haltere-point rap-haltere-point--' + P.b.couleur + '" style="left:' + b + '%"></span>') + '</div>'
          + '<p class="rap-haltere-val"><span class="rap-haltere-n"><span class="rap-pastille rap-pastille--' + P.a.couleur + '"></span>' + a + ' %</span>'
          + (b === null ? '' : '<span class="rap-haltere-n"><span class="rap-pastille rap-pastille--' + P.b.couleur + '"></span>' + b + ' %</span>') + '</p>'
          + '</div>';
      }).join('') + '</div></div>'
    : '';
  // Les cartes d'état : celles qui appellent un guide (écart, ou l'un des
  // deux qui ne va pas bien) d'abord, en pleine largeur, les écarts en tête
  // (« Vous ne le vivez pas pareil » avant « À surveiller ») ; les autres,
  // plus basses, par deux.
  function cartesEtats(etats) {
    const aGuide = (e) => !!(e.ecart || e.attentionA || e.attentionB);
    const fortes = etats.filter(aGuide).sort((u, v) => (v.ecart ? 1 : 0) - (u.ecart ? 1 : 0));
    const simples = etats.filter((e) => !aGuide(e));
    return (fortes.length ? '<div class="rap-etats">' + fortes.map(carteEtat).join('') + '</div>' : '')
      + (simples.length ? '<div class="rap-etats' + (simples.length > 1 ? ' rap-etats--deux' : '') + '">' + simples.map(carteEtat).join('') + '</div>' : '');
  }
  const etatsMeteo = analyse.etats.filter((e) => e.domaine === 'meteo');
  const climat = chapitre('climat', numeroDe('climat'),
    halteres
    + '<h3 class="rap-h3 rap-h3--espace">' + tx('rapport.climat.questions') + '</h3>'
    + legendeDuo + '<p class="rap-aide">' + tx('rapport.climat.sens') + '</p>' + cartesEtats(etatsMeteo),
    tx('rapport.climat.intro'));

  // ── 6. Les signaux de vigilance ──

  function etatSignal(s) {
    const reparation = s.signal === 'reparation';
    if (reparation) return (s.a <= 1 && (s.b === null || s.b <= 1)) ? 'reparationBien' : 'reparationAttention';
    return s.alerte ? 'alerte' : s.attention ? 'attention' : 'rare';
  }
  const classeSignal = { rare: 'accord', reparationBien: 'accord', attention: 'proche', reparationAttention: 'proche', alerte: 'ecart' };
  function carteSignal(s) {
    const t = textQ(s.id);
    const etat = etatSignal(s);
    const classe = classeSignal[etat];
    return '<article class="rap-signal rap-signal--' + classe + '">'
      + '<div class="rap-etat-tete"><h3 class="rap-etat-titre">' + tl(court(s.id)) + '</h3>'
      + '<p class="rap-tags"><span class="rap-tag rap-tag--' + classe + '">' + tx('rapport.signaux.' + etat) + '</span></p></div>'
      + echelle((t.o || []).length || 4, s.a, s.b, (t.o || []).map((x) => C.accorder(x, null)), 'bien')
      + guide(s.id, etat !== 'rare' && etat !== 'reparationBien')
      + '</article>';
  }
  const tableauSignaux = analyse.signaux.length
    ? '<div class="rap-signaux-vue">' + analyse.signaux.map((s) => {
      const etat = etatSignal(s);
      return '<div class="rap-signal-tuile rap-signal-tuile--' + classeSignal[etat] + '"><p class="rap-signal-tuile-nom">' + tl(court(s.id)) + '</p>'
        + '<p class="rap-signal-tuile-etat">' + tx('rapport.signaux.' + etat) + '</p></div>';
    }).join('') + '</div>'
    : '';
  const signaux = chapitre('signaux', numeroDe('signaux'),
    tableauSignaux + legendeDuo + analyse.signaux.map(carteSignal).join('')
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
    return '<article class="rap-role rap-role--' + (item.chacunPlus ? 'chacun' : item.cat) + '">'
      + '<div class="rap-etat-tete"><h3 class="rap-etat-titre">' + tl(court(item.id)) + '</h3><p class="rap-tags">' + note + '</p></div>'
      + echelle(5, posA, posB, null, 'roles')
      + lignesReponses(item.id)
      + '</article>';
  }
  // Seul(e), « qui s'en occupe » sans ce que l'autre répondrait (25 octobre
  // 2026) : le repère de A seul, sans étiquette, après les sujets comparés.
  const quisSeules = solo ? analyse.seules.filter((i) => i.type === 'qui') : [];
  function ligneRoleSeule(item) {
    return '<article class="rap-role">'
      + '<div class="rap-etat-tete"><h3 class="rap-etat-titre">' + tl(court(item.id)) + '</h3></div>'
      + echelle(5, item.a, null, null, 'roles')
      + lignesReponses(item.id)
      + '</article>';
  }
  const nbRoles = quis.length + quisSeules.length;
  const roles = chapitre('roles', numeroDe('roles'),
    (nbRoles
      ? '<div class="rap-role-axe"><p class="rap-role-bout">' + pastille(P.a) + tx('rapport.roles.surtout', { nom: P.a.nom }) + '</p>'
        + '<p class="rap-role-bout rap-role-bout--droite">' + tx('rapport.roles.surtout', { nom: P.b.nom }) + pastille(P.b) + '</p></div>'
        + '<div class="rap-etats' + (nbRoles > 1 ? ' rap-etats--deux' : '') + '">' + quis.map(ligneRole).join('') + quisSeules.map(ligneRoleSeule).join('') + '</div>'
      : '<p class="rap-vide">' + tx('rapport.roles.aucun') + '</p>'),
    tx('rapport.roles.intro', { a: P.a.nom, b: P.b.nom }));

  // ── 8. Domaine par domaine ──

  const domaines = chapitre('domaines', numeroDe('domaines'),
    analyse.domaines.filter((x) => !x.meteo && (x.items.length || x.etats.length || x.inconnus || x.seules.length)).map((x) => {
      const accords = x.items.filter((i) => i.cat === 'accord' && !i.chacunPlus && !i.desequilibre);
      // Les accords sur « qui s'en occupe » où c'est surtout l'un des deux
      // (« Vous êtes d'accord : c'est surtout Camille ») : des accords, avec
      // une question à se poser, donc une carte, posée sous les autres accords.
      // Jusqu'au 23 octobre 2026 ces cartes « Accord » tombaient sous « Vos
      // différences ».
      const accordsPenchent = x.items.filter((i) => i.cat === 'accord' && i.desequilibre)
        .sort((u, v) => v.prio - u.prio);
      const diffs = x.items.filter((i) => i.cat !== 'accord' || i.chacunPlus)
        .sort((u, v) => v.prio - u.prio);
      const texteDom = texteDomaine(x, false);
      const inconnusDom = solo ? analyse.inconnus.filter((i) => i.domaine === x.id) : [];
      const etiquetteNn = (i) => ((i.nnA || i.nnB) ? '<span class="rap-tag rap-tag--nn">' + tx('rapport.nnDe', { nom: i.nnA && i.nnB ? P.a.nom + ' & ' + P.b.nom : (i.nnA ? P.a.nom : P.b.nom) }) + '</span>' : '');
      const casesAccord = accords.length
        ? '<div class="rap-accords">' + accords.map((i) => caseAccord(i, 'accord', etiquetteNn(i))).join('') + '</div>'
        : (accordsPenchent.length ? '' : '<p class="rap-vide">' + tx('rapport.domaines.accordsAucun') + '</p>');
      const cartesPenchent = accordsPenchent.map((i) => carteEcart(i, { mode: 'court' })).join('');
      // Jusqu'à six accords (trois rangées), ils restent dans le bloc
      // insécable de l'en-tête ; au-delà, la grille peut se couper entre
      // deux rangées, et le bloc insécable reste court.
      const accordsDansTete = accords.length <= 6;
      return '<div class="rap-dom">'
        + '<div class="rap-dom-tete">'
        + '<div class="rap-dom-bandeau rap-dom-bandeau--' + (x.bande || 'neutre') + '">'
        + (x.score !== null ? petitAnneau(x.score, x.bande) : '')
        + '<div class="rap-dom-bandeau-texte"><p class="rap-dom-sur">' + tx('rapport.domaines.domaine') + '</p><h3 class="rap-dom-titre">' + tl(titreDomaine(x.id)) + '</h3>'
        + (x.score !== null ? '<p class="rap-dom-bande"><span class="rap-tag rap-tag--' + x.bande + '">' + tx('rapport.carte.bandes.' + x.bande) + '</span></p>' : '')
        + '</div>'
        + '<div class="rap-dom-pile">' + barreEmpilee(x.accords, x.proches, x.ecarts)
        + '<p class="rap-barre-compte rap-barre-compte--clair"><span class="rap-compte rap-compte--accord">' + x.accords + '</span><span class="rap-compte rap-compte--proche">' + x.proches + '</span><span class="rap-compte rap-compte--ecart">' + x.ecarts + '</span></p></div>'
        + '</div>'
        + (texteDom ? '<p class="rap-dom-texte">' + texteDom + '</p>' : '')
        + '<p class="rap-h4 rap-h4--accord">' + tx('rapport.domaines.accords') + '</p>'
        + (accordsDansTete ? casesAccord : '')
        + '</div>'
        + (accordsDansTete ? '' : casesAccord)
        + cartesPenchent
        + '<p class="rap-h4 rap-h4--diff">' + tx('rapport.domaines.differences') + '</p>'
        + (diffs.length ? diffs.map((i) => {
          const conv = analyse.conversations.indexOf(i.id);
          if (conv >= 0) return carteEcart(i, { mode: 'renvoi', renvoi: tx('rapport.domaines.voirConversation', { n: conv + 1 }) });
          if (analyse.bloquants.includes(i.id)) return carteEcart(i, { mode: 'renvoi', renvoi: tx('rapport.domaines.voirBloquants') });
          return carteEcart(i, { mode: i.cat === 'ecart' || i.chacunPlus ? 'complet' : 'court' });
        }).join('') : '<p class="rap-vide">' + tx('rapport.domaines.differencesAucune') + '</p>')
        + (inconnusDom.length
          ? '<p class="rap-h4 rap-h4--inconnu">' + tx('rapport.domaines.inconnus') + '</p><div class="rap-accords">'
            + inconnusDom.map((i) => caseAccord(i, 'inconnu')).join('') + '</div>' : '')
        // Seul(e), les questions où l'autre n'a pas été imaginé(e) (25 octobre
        // 2026) : la réponse de A, sans comparaison.
        + (x.seules.length
          ? '<p class="rap-h4 rap-h4--seule">' + tx('rapport.solo.domaines.seules') + '</p><p class="rap-aide">' + tx('rapport.solo.domaines.seulesAide', { nom: P.b.nom }) + '</p><div class="rap-accords">'
            + x.seules.map((i) => caseAccord(i, 'seule')).join('') + '</div>' : '')
        + (x.etats.filter((e) => !e.signal).length
          ? '<p class="rap-h4 rap-h4--etat">' + tx('rapport.domaines.etats') + '</p>' + cartesEtats(x.etats.filter((e) => !e.signal)) : '')
        + '</div>';
    }).join(''),
    tx('rapport.domaines.intro'));

  // ── 9. Pour finir : la synthèse de fin ──

  const total = analyse.compte.accords + analyse.compte.proches + analyse.compte.ecarts;
  const parts = partsCent([analyse.compte.accords, analyse.compte.proches, analyse.compte.ecarts]);
  const partAccords = parts[0];
  const lignesRepartition = '<ul class="rap-repartition">'
    + [['accord', analyse.compte.accords], ['proche', analyse.compte.proches], ['ecart', analyse.compte.ecarts]].map(([c, n], k) =>
      '<li><span class="rap-compte rap-compte--' + c + '">' + tx('rapport.cat.' + c) + '</span><strong>' + n + '</strong><span class="rap-repartition-part">' + parts[k] + ' %</span></li>').join('')
    + '</ul>';
  // Les accords sur ce qui engage une vie : le socle.
  const socle = analyse.items.filter((i) => i.poids === 3 && i.cat === 'accord').length;
  const lourds = analyse.items.filter((i) => i.poids === 3).length;
  const colonneDomaines = (ids, cle) => '<div class="rap-fin-col rap-fin-col--' + cle + '"><p class="rap-encadre-titre">' + tx('rapport.fin.' + cle) + '</p>'
    + (ids.length ? ids.map((id) => {
      const x = domaineParId[id];
      const texteDom = texteDomaine(x, true);
      return '<div class="rap-fin-dom"><div class="rap-fin-dom-tete"><p class="rap-fin-dom-nom">' + tl(titreDomaine(id)) + '</p><p class="rap-fin-dom-val">' + x.score + ' %</p></div>'
        + '<div class="rap-barre-piste rap-barre-piste--fine"><span class="rap-barre-plein rap-barre-plein--' + x.bande + '" style="width:' + x.score + '%"></span></div>'
        + (texteDom ? '<p class="rap-fin-dom-texte">' + texteDom + '</p>' : '') + '</div>';
    }).join('') : '<p class="rap-vide">' + tx('rapport.fin.aucun') + '</p>') + '</div>';
  // La feuille de route : une conversation par semaine, puis les points
  // bloquants qui n'y sont pas, puis refaire l'évaluation.
  const etapesRoute = [];
  analyse.conversations.forEach((id, i) => etapesRoute.push({ quand: tx('rapport.fin.semaine', { n: i + 1 }), id, sur: tx('rapport.conversations.titre', { n: i + 1 }) }));
  analyse.bloquants.filter((id) => !analyse.conversations.includes(id)).slice(0, 2).forEach((id) => {
    etapesRoute.push({ quand: tx('rapport.fin.semaine', { n: etapesRoute.length + 1 }), id, sur: tx('rapport.statut.bloquant') });
  });
  const feuille = '<ol class="rap-route">'
    + etapesRoute.map((e) => '<li class="rap-route-etape"><span class="rap-route-case" aria-hidden="true"></span>'
      + '<div class="rap-route-corps"><p class="rap-route-quand">' + e.quand + ' · ' + e.sur + '</p><p class="rap-route-sujet">' + tl(court(e.id)) + '</p>'
      + '<p class="rap-route-dom">' + tl(titreDomaine(parId[e.id].domaine)) + '</p></div></li>').join('')
    + (solo && analyse.inconnus.length ? '<li class="rap-route-etape"><span class="rap-route-case" aria-hidden="true"></span><div class="rap-route-corps"><p class="rap-route-quand">' + tx('rapport.fin.ensuite') + '</p><p class="rap-route-sujet">' + tx('rapport.fin.ombreEtape', { n: analyse.compte.inconnus, nom: P.b.nom }) + '</p></div></li>' : '')
    + '<li class="rap-route-etape rap-route-etape--fin"><span class="rap-route-case" aria-hidden="true"></span><div class="rap-route-corps"><p class="rap-route-quand">' + tx('rapport.fin.sixMois') + '</p><p class="rap-route-sujet">' + tx('rapport.fin.refaire') + '</p><p class="rap-route-dom">' + tx('rapport.fin.refaireTexte') + '</p></div></li>'
    + '</ol>';
  const fin = chapitre('fin', numeroDe('fin'),
    '<div class="rap-fin-haut">'
    + '<div class="rap-fin-don">' + anneauRepartition(analyse.compte, brut('rapport.fin.accordsPart'), partAccords)
    + '<div><p class="rap-score-lib">' + tx('rapport.fin.repartition') + '</p>'
    + '<p class="rap-fin-don-texte">' + tx('rapport.fin.accordsTexte', { n: analyse.compte.accords, total, part: partAccords }) + '</p>' + lignesRepartition + '</div></div>'
    + '<div class="rap-fin-socle"><p class="rap-fin-socle-n">' + socle + '<span>/' + lourds + '</span></p><p class="rap-fin-socle-lib">' + tx('rapport.fin.socle') + '</p><p class="rap-aide">' + tx('rapport.fin.socleAide') + '</p></div>'
    + '</div>'
    + '<div class="rap-deux-cols rap-deux-cols--haut">' + colonneDomaines(analyse.forces, 'forces') + colonneDomaines(analyse.chantiers, 'chantiers') + '</div>'
    + '<div class="rap-bloc"><h3 class="rap-h3">' + tx('rapport.fin.feuille') + '</h3><p class="rap-aide">' + tx('rapport.fin.feuilleIntro') + '</p>' + feuille + '</div>',
    tx('rapport.fin.intro'));

  // ── 10. Et maintenant ──

  const conseils = brut(chemin('rapport.suite.conseils'));
  const suite = chapitre('suite', numeroDe('suite'),
    '<ol class="rap-conseils">' + (Array.isArray(conseils) ? conseils : []).map((c) => '<li>' + tl(remplir2(c, { nom: P.b.nom })) + '</li>').join('') + '</ol>'
    + '<div class="rap-texte"><p>' + tx('rapport.suite.refaire', { nom: P.b.nom }) + '</p></div>'
    + '<div class="rap-encadre rap-encadre--doux"><p>' + tx('rapport.suite.aide') + '</p><p>' + tx('rapport.suite.violence') + '</p></div>'
    + (o.editeur ? '<p class="rap-editeur">' + esc(o.editeur) + '</p>' : ''),
    tx('rapport.suite.p1'));

  const corps = couverture + lire + synthese + carte + conversations + bloquants + ombre + climat + signaux + roles + domaines + fin + suite;
  const html = '<div class="rap rap--' + format + (solo ? ' rap--solo' : '') + '" lang="' + esc(lang) + '">' + corps + '</div>';
  return { html, analyse, chapitres: ['couverture', 'lire', ...chapitresListe] };
}

// Le pied de page du PDF (boîtes de marge de Chrome), dans la langue du
// rapport : une règle @page à mettre dans le <style> du document.
export function styleDePage(T) {
  const pied = (T && T.rapport && T.rapport.pied) || '';
  const chaine = '"' + String(pied).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
  return '@page { @bottom-left { content: ' + chaine + '; } }';
}
