/**
 * Compatibilité amoureuse par date de naissance.
 *
 * Deux dates suffisent : tout le reste se déduit. On en tire trois lectures
 * indépendantes, qui ne racontent pas la même chose et c'est justement
 * l'intérêt de les croiser.
 *
 *   1. Le chemin de vie      → somme des chiffres de la date, réduite.
 *   2. Le signe solaire      → jour + mois, découpage tropical classique.
 *   3. Le signe chinois      → année lunaire, donc il faut la vraie date du
 *                              nouvel an chinois, qui se balade entre le
 *                              21 janvier et le 21 février.
 *
 * Les textes traduits arrivent par window.DN_I18N (posé par le gabarit) et,
 * pour les 144 duos de signes, par un fichier chargé à la demande : inutile
 * d'imposer 70 Ko à quelqu'un qui ne fera jamais le test.
 */
(function () {
  'use strict';

  var racine = document.getElementById('dn-outil');
  if (!racine) return;

  var T = window.DN_I18N || {};
  var LANG = racine.getAttribute('data-lang') || 'fr';

  // ── Petites aides ─────────────────────────────────────────
  function mod(n, m) { return ((n % m) + m) % m; }
  function el(id) { return document.getElementById(id); }
  function tr(chemin, defaut) {
    var p = chemin.split('.'), v = T, i;
    for (i = 0; i < p.length; i++) {
      if (v == null || typeof v !== 'object') return defaut || '';
      v = v[p[i]];
    }
    return (v === undefined || v === null) ? (defaut || '') : v;
  }
  function remplir(texte, vars) {
    return String(texte).replace(/\{\{(\w+)\}\}/g, function (_, k) {
      return vars[k] !== undefined ? vars[k] : '';
    });
  }
  function echapper(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  // ── 1. Chemin de vie ──────────────────────────────────────
  // On additionne tous les chiffres de la date puis on réduit, en gardant
  // les nombres maîtres 11, 22 et 33 qui ne se réduisent pas.
  function reduire(n) {
    while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
      var s = 0;
      while (n > 0) { s += n % 10; n = Math.floor(n / 10); }
      n = s;
    }
    return n;
  }

  function cheminDeVie(j, m, a) {
    var total = 0, chaine = String(j) + String(m) + String(a), i;
    for (i = 0; i < chaine.length; i++) total += parseInt(chaine.charAt(i), 10);
    return reduire(total);
  }

  // Compatibilité entre deux chemins de vie, sur 10. La grille reprend celle
  // déjà utilisée pour les prénoms : mêmes archétypes, donc mêmes affinités,
  // et surtout aucun risque que les deux tests du site se contredisent.
  var COMPAT_VIE = {
    '1_1': 7, '1_2': 6, '1_3': 9, '1_4': 4, '1_5': 8, '1_6': 5, '1_7': 5, '1_8': 7, '1_9': 6, '1_11': 8, '1_22': 6, '1_33': 5,
    '2_2': 7, '2_3': 8, '2_4': 7, '2_5': 4, '2_6': 9, '2_7': 4, '2_8': 6, '2_9': 7, '2_11': 9, '2_22': 8, '2_33': 9,
    '3_3': 7, '3_4': 3, '3_5': 8, '3_6': 9, '3_7': 5, '3_8': 4, '3_9': 8, '3_11': 8, '3_22': 5, '3_33': 9,
    '4_4': 6, '4_5': 3, '4_6': 7, '4_7': 6, '4_8': 8, '4_9': 4, '4_11': 5, '4_22': 9, '4_33': 6,
    '5_5': 7, '5_6': 4, '5_7': 7, '5_8': 5, '5_9': 8, '5_11': 7, '5_22': 5, '5_33': 5,
    '6_6': 7, '6_7': 5, '6_8': 5, '6_9': 9, '6_11': 8, '6_22': 8, '6_33': 9,
    '7_7': 7, '7_8': 4, '7_9': 6, '7_11': 9, '7_22': 7, '7_33': 7,
    '8_8': 7, '8_9': 5, '8_11': 6, '8_22': 9, '8_33': 6,
    '9_9': 7, '9_11': 8, '9_22': 7, '9_33': 9,
    '11_11': 8, '11_22': 8, '11_33': 9,
    '22_22': 8, '22_33': 8,
    '33_33': 8
  };

  function compatVie(a, b) {
    var cle = Math.min(a, b) + '_' + Math.max(a, b);
    return COMPAT_VIE[cle] || 6;
  }

  // ── 2. Signe solaire ──────────────────────────────────────
  var SIGNES = ['belier', 'taureau', 'gemeaux', 'cancer', 'lion', 'vierge',
                'balance', 'scorpion', 'sagittaire', 'capricorne', 'verseau', 'poissons'];
  // Premier signe de chaque mois (janvier → décembre) et jour de bascule.
  var PREMIER = [9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8];
  var BASCULE = [20, 19, 21, 20, 21, 21, 23, 23, 23, 23, 22, 22];

  function signeSolaire(j, m) {
    var i = m - 1;
    return SIGNES[j >= BASCULE[i] ? (PREMIER[i] + 1) % 12 : PREMIER[i]];
  }

  // ── 3. Signe chinois ──────────────────────────────────────
  // Date du nouvel an chinois de 1924 à 2043, encodée en un caractère par
  // année : le décalage en jours après le 21 janvier. Source : table du
  // cycle sexagésimal de Wikipédia.
  var NOUVEL_AN = 'PDXMCUJ\\QFYODVK^SGZPEXMBUI\\QGYNDWK]SHZPEXMATJ\\QGZNCVK]RH[PEXM_TI\\QGZOCUK^RH[PDWLBTI]RFYNCUK^SH[PEWLBUI\\QFXNCVK^SHZODWLBU';
  var ANIMAUX = ['rat', 'buffle', 'tigre', 'lapin', 'dragon', 'serpent',
                 'cheval', 'chevre', 'singe', 'coq', 'chien', 'cochon'];
  var ELEMENTS = ['bois', 'feu', 'terre', 'metal', 'eau'];

  function anLunaire(j, m, a) {
    if (a < 1924 || a > 2043) return a;              // hors table, repli neutre
    var decalage = NOUVEL_AN.charCodeAt(a - 1924) - 65;
    var debut = new Date(Date.UTC(a, 0, 21 + decalage));
    var d = new Date(Date.UTC(a, m - 1, j));
    return d < debut ? a - 1 : a;
  }

  function signeChinois(j, m, a) {
    var an = anLunaire(j, m, a);
    return {
      an: an,
      animal: mod(an - 1924, 12),
      element: Math.floor(mod(an - 1924, 10) / 2),
      yang: mod(an - 1924, 2) === 0
    };
  }

  // Relations traditionnelles entre les douze branches terrestres.
  //   trine        : les quatre triangles d'affinité (écart de 4)
  //   harmonie     : les six paires « amies secrètes » (六合)
  //   opposition   : l'axe opposé (écart de 6)
  //   nuisance     : les six paires de « nuisance » (六害)
  function relationChinoise(a1, a2) {
    var ecart = mod(a2 - a1, 12), somme = a1 + a2;
    if (ecart === 6) return 'opposition';
    if (somme === 7 || somme === 19) return 'nuisance';
    if (ecart === 4 || ecart === 8) return 'trine';
    if (somme === 1 || somme === 13) return 'harmonie';
    if (ecart === 0) return 'meme';
    return 'neutre';
  }

  var NOTE_RELATION = { trine: 9, harmonie: 9, meme: 7, neutre: 6, nuisance: 4, opposition: 3 };

  // Cycle des cinq éléments : bois → feu → terre → métal → eau → bois.
  // Un écart de 1 nourrit, un écart de 2 ou 3 contrarie.
  function relationElement(e1, e2) {
    if (e1 === e2) return 'meme';
    var d = mod(e2 - e1, 5);
    return (d === 1 || d === 4) ? 'nourrit' : 'controle';
  }

  function compatChinois(c1, c2) {
    var rel = relationChinoise(c1.animal, c2.animal);
    var relEl = relationElement(c1.element, c2.element);
    var note = NOTE_RELATION[rel];
    if (relEl === 'nourrit') note += 1;
    else if (relEl === 'controle') note -= 1;
    else note += 0.5;
    return { note: Math.max(2, Math.min(10, note)), relation: rel, element: relEl };
  }

  // ── Le nombre du couple ───────────────────────────────────
  function nombreDuCouple(v1, v2) { return reduire(v1 + v2); }

  // ── Chargement des 144 duos de signes ─────────────────────
  var zodiaque = null;
  // Empreinte de la construction, posée par le générateur dans l'en-tête de la
  // page : les données sont demandées avec elle pour qu'aucun cache ne réponde
  // avec celles d'une version antérieure du site.
  function _v(url) {
    var v = (typeof window !== 'undefined' && window.__QCV) || '';
    return v ? url + '?v=' + v : url;
  }

  function chargerZodiaque() {
    if (zodiaque) return Promise.resolve(zodiaque);
    return fetch(_v('/js/data/zodiac-' + LANG + '.json'))
      .then(function (r) { return r.ok ? r.json() : {}; })
      .catch(function () { return {}; })
      .then(function (d) { zodiaque = d; return d; });
  }

  // ── Formulaire ────────────────────────────────────────────
  var MOIS_MAX = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  function dateValide(j, m, a) {
    if (!j || !m || !a) return false;
    if (j > MOIS_MAX[m - 1]) return false;
    if (m === 2 && j === 29) {
      var bissextile = (a % 4 === 0 && a % 100 !== 0) || a % 400 === 0;
      if (!bissextile) return false;
    }
    return true;
  }

  function remplirSelects() {
    var anneeMax = new Date().getFullYear() - 14;
    var personnes = ['1', '2'], p, i;
    for (p = 0; p < 2; p++) {
      var n = personnes[p];
      var sj = el('dn-jour' + n), sm = el('dn-mois' + n), sa = el('dn-annee' + n);
      var noms = tr('form.mois', []);
      for (i = 1; i <= 31; i++) sj.appendChild(new Option(i, i));
      for (i = 1; i <= 12; i++) sm.appendChild(new Option(noms[i - 1] || i, i));
      for (i = anneeMax; i >= 1930; i--) sa.appendChild(new Option(i, i));
    }
  }

  function lire(n) {
    var j = parseInt(el('dn-jour' + n).value, 10);
    var m = parseInt(el('dn-mois' + n).value, 10);
    var a = parseInt(el('dn-annee' + n).value, 10);
    return { j: j, m: m, a: a };
  }

  // ── Rendu ─────────────────────────────────────────────────
  function nomSigne(cle) { return tr('signes.' + cle, cle); }
  function nomAnimal(i) { return tr('animaux.' + ANIMAUX[i], ANIMAUX[i]); }
  function nomElement(i) { return tr('elements.' + ELEMENTS[i], ELEMENTS[i]); }

  function palier(pct) {
    if (pct >= 80) return 'fusion';
    if (pct >= 65) return 'belle';
    if (pct >= 50) return 'travail';
    return 'contraires';
  }

  function anneau(pct) {
    var r = 52, c = 2 * Math.PI * r, off = c * (1 - pct / 100);
    return '<svg class="dn-anneau" viewBox="0 0 120 120" role="img" aria-label="' + pct + '%">' +
      '<circle cx="60" cy="60" r="' + r + '" class="dn-anneau-fond"></circle>' +
      '<circle cx="60" cy="60" r="' + r + '" class="dn-anneau-trait" ' +
      'stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '"></circle>' +
      '</svg><span class="dn-anneau-valeur">' + pct + '<small>%</small></span>';
  }

  function barre(note, libelle, valeur) {
    return '<div class="dn-axe">' +
      '<div class="dn-axe-tete"><span class="dn-axe-nom">' + echapper(libelle) + '</span>' +
      '<span class="dn-axe-note">' + Math.round(note * 10) + '%</span></div>' +
      '<div class="dn-axe-piste"><span class="dn-axe-jauge" style="width:' + Math.round(note * 10) + '%"></span></div>' +
      '<p class="dn-axe-valeur">' + valeur + '</p></div>';
  }

  function calculer() {
    var d1 = lire('1'), d2 = lire('2');
    var erreur = el('dn-erreur');
    if (!dateValide(d1.j, d1.m, d1.a) || !dateValide(d2.j, d2.m, d2.a)) {
      erreur.textContent = tr('form.erreur', 'Vérifiez les deux dates de naissance.');
      erreur.classList.remove('hidden');
      return;
    }
    erreur.classList.add('hidden');

    var s1 = signeSolaire(d1.j, d1.m), s2 = signeSolaire(d2.j, d2.m);
    var v1 = cheminDeVie(d1.j, d1.m, d1.a), v2 = cheminDeVie(d2.j, d2.m, d2.a);
    var c1 = signeChinois(d1.j, d1.m, d1.a), c2 = signeChinois(d2.j, d2.m, d2.a);

    var noteVie = compatVie(v1, v2);
    var chinois = compatChinois(c1, c2);

    chargerZodiaque().then(function (z) {
      var duo = z[s1 + '_' + s2] || z[s2 + '_' + s1] || { score: 6, text: '' };
      var noteAstro = duo.score;
      var global = 0.40 * noteVie + 0.35 * noteAstro + 0.25 * chinois.note;
      var pct = Math.round(global * 10);
      afficher({
        pct: pct, s1: s1, s2: s2, v1: v1, v2: v2, c1: c1, c2: c2, d1: d1, d2: d2,
        noteVie: noteVie, noteAstro: noteAstro, chinois: chinois,
        texteAstro: duo.text, couple: nombreDuCouple(v1, v2)
      });
    });
  }

  function afficher(r) {
    var p = palier(r.pct);
    var vars = {
      s1: nomSigne(r.s1), s2: nomSigne(r.s2),
      a1: nomAnimal(r.c1.animal), a2: nomAnimal(r.c2.animal),
      e1: nomElement(r.c1.element), e2: nomElement(r.c2.element),
      n1: r.v1, n2: r.v2,
      t1: tr('cheminsTraits.' + r.v1, ''), t2: tr('cheminsTraits.' + r.v2, '')
    };

    var bandeVie = r.noteVie >= 8 ? 'haute' : r.noteVie >= 6 ? 'moyenne' : r.noteVie >= 4 ? 'basse' : 'tendue';

    var html = '';

    // Verdict global. La classe quiz-result-card n'est pas décorative : c'est
    // elle que guettent le compteur de parties et le module de notation.
    html += '<div class="dn-verdict quiz-result-card">' +
      '<div class="dn-anneau-boite">' + anneau(r.pct) + '</div>' +
      '<h2 class="dn-verdict-titre">' + echapper(tr('paliers.' + p + '.titre', '')) + '</h2>' +
      '<p class="dn-verdict-texte">' + echapper(tr('paliers.' + p + '.texte', '')) + '</p>' +
      '</div>';

    // Les deux cartes d'identité
    html += '<div class="dn-fiches">';
    [['1', r.s1, r.v1, r.c1, r.d1], ['2', r.s2, r.v2, r.c2, r.d2]].forEach(function (x) {
      // Dans une liste déroulante le mois s'écrit avec une majuscule, dans une
      // date il s'écrit comme la langue l'exige : d'où deux listes distinctes.
      var mois = (tr('form.moisDate', []) [x[4].m - 1]) || tr('form.mois', [])[x[4].m - 1] || x[4].m;
      var date = remplir(tr('form.dateAffichee', '{{j}} {{mois}} {{a}}'),
        { j: x[4].j, mois: mois, a: x[4].a });
      html += '<div class="dn-fiche dn-fiche-' + x[0] + '">' +
        '<p class="dn-fiche-date">' + echapper(date) + '</p>' +
        '<dl class="dn-fiche-liste">' +
        '<dt>' + echapper(tr('resultat.signe', 'Signe')) + '</dt><dd>' + echapper(nomSigne(x[1])) + '</dd>' +
        '<dt>' + echapper(tr('resultat.chemin', 'Chemin de vie')) + '</dt><dd>' + x[2] + '</dd>' +
        '<dt>' + echapper(tr('resultat.chinois', 'Signe chinois')) + '</dt><dd>' +
        echapper(remplir(tr('resultat.chinoisValeur', '{{a}} de {{e}}'),
          { a: nomAnimal(x[3].animal), e: nomElement(x[3].element) })) + '</dd>' +
        '</dl></div>';
    });
    html += '</div>';

    // Les trois axes
    html += '<div class="dn-axes">';
    html += barre(r.noteVie, tr('resultat.axeVie', ''), remplir(tr('resultat.axeVieValeur', ''), vars));
    html += barre(r.noteAstro, tr('resultat.axeAstro', ''), remplir(tr('resultat.axeAstroValeur', ''), vars));
    html += barre(r.chinois.note, tr('resultat.axeChinois', ''), remplir(tr('resultat.axeChinoisValeur', ''), vars));
    html += '</div>';

    // Chemin de vie
    html += '<section class="dn-bloc">' +
      '<h3 class="dn-bloc-titre">' + echapper(tr('resultat.titreVie', '')) + '</h3>' +
      '<p>' + echapper(remplir(tr('resultat.introVie', ''), vars)) + '</p>' +
      '<p>' + echapper(tr('bandesVie.' + bandeVie, '')) + '</p>' +
      '</section>';

    // Signes solaires : le texte des 144 duos
    if (r.texteAstro) {
      html += '<section class="dn-bloc">' +
        '<h3 class="dn-bloc-titre">' + echapper(remplir(tr('resultat.titreAstro', ''), vars)) + '</h3>' +
        '<p>' + echapper(r.texteAstro) + '</p>' +
        '</section>';
    }

    // Astrologie chinoise
    html += '<section class="dn-bloc">' +
      '<h3 class="dn-bloc-titre">' + echapper(tr('resultat.titreChinois', '')) + '</h3>' +
      '<p>' + echapper(remplir(tr('relations.' + r.chinois.relation, ''), vars)) + '</p>' +
      '<p>' + echapper(remplir(tr('elementsRelation.' + r.chinois.element, ''), vars)) + '</p>' +
      '</section>';

    // Le nombre du couple
    html += '<section class="dn-bloc dn-bloc-couple">' +
      '<h3 class="dn-bloc-titre">' + echapper(remplir(tr('resultat.titreCouple', ''), { n: r.couple })) + '</h3>' +
      '<p>' + echapper(tr('nombresCouple.' + r.couple, '')) + '</p>' +
      '</section>';

    var sortie = el('dn-resultat');
    sortie.innerHTML = html;
    sortie.classList.remove('hidden');
    el('dn-formulaire').classList.add('hidden');
    el('dn-suite').classList.remove('hidden');

    function versLeResultat() {
      var haut = racine.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: haut, behavior: 'smooth' });
    }

    // Ce moteur ne passe pas par le moteur commun : on signale nous-memes que
    // le resultat est la, sinon cette page serait la seule dont l'ecran de
    // resultat ne prendrait pas son adresse. Fichier absent ? On remonte
    // simplement sur le resultat, comme avant.
    if (window.QCResultat) {
      window.QCResultat.arrivee(sortie, {
        lang: document.documentElement.lang || 'fr',
        apres: versLeResultat
      });
    } else {
      versLeResultat();
    }
  }

  function recommencer() {
    // Le formulaire revient sur place, sans rechargement : l'adresse
    // annoncerait sinon un resultat devant un formulaire vide.
    if (window.QCResultat) window.QCResultat.retour();
    el('dn-resultat').classList.add('hidden');
    el('dn-suite').classList.add('hidden');
    el('dn-formulaire').classList.remove('hidden');
  }

  remplirSelects();
  el('dn-lancer').addEventListener('click', calculer);
  el('dn-refaire').addEventListener('click', recommencer);
})();
