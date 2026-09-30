/* Compatibilité amoureuse des signes chinois : deux dates de naissance, deux
   animaux avec leur élément, et ce que la tradition dit de leur rencontre.
   Outil autonome, comme la compatibilité par date de naissance dont il reprend
   les tables (nouvel an, animaux, éléments, relations) : les deux fichiers
   doivent rester d'accord sur ces tables. Aucune question, aucun serveur : tout
   se calcule dans le navigateur, rien ne part nulle part. */
(function () {
  'use strict';
  var racine = document.getElementById('sc-outil');
  if (!racine) return;

  var T = window.SC_I18N || {};
  var LANG = racine.getAttribute('data-lang') || 'fr';

  function mod(n, m) { return ((n % m) + m) % m; }
  function el(id) { return document.getElementById(id); }
  function tr(chemin, defaut) {
    var o = T, parts = chemin.split('.');
    for (var i = 0; i < parts.length; i++) {
      if (o == null || typeof o !== 'object' || !(parts[i] in o)) return defaut;
      o = o[parts[i]];
    }
    return (o == null || o === '') ? defaut : o;
  }
  function remplir(texte, vars) {
    return String(texte).replace(/\{\{(\w+)\}\}/g, function (_, k) {
      return vars[k] != null ? vars[k] : '';
    });
  }
  function echapper(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // ── Le zodiaque chinois ───────────────────────────────────
  // Pour chaque année de 1924 à 2043, la date du nouvel an lunaire encodée par
  // une lettre : le décalage en jours après le 21 janvier. Même table que
  // date-naissance.js. Source : table du cycle sexagésimal de Wikipédia.
  var NOUVEL_AN = 'PDXMCUJ\\QFYODVK^SGZPEXMBUI\\QGYNDWK]SHZPEXMATJ\\QGZNCVK]RH[PEXM_TI\\QGZOCUK^RH[PDWLBTI]RFYNCUK^SH[PEWLBUI\\QFXNCVK^SHZODWLBU';
  var ANIMAUX = ['rat', 'buffle', 'tigre', 'lapin', 'dragon', 'serpent',
                 'cheval', 'chevre', 'singe', 'coq', 'chien', 'cochon'];
  var ELEMENTS = ['bois', 'feu', 'terre', 'metal', 'eau'];

  function anLunaire(j, m, a) {
    if (a < 1924 || a > 2043) return a;
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
  //   trine      : les quatre triangles d'affinité (écart de 4)
  //   harmonie   : les six paires « amies secrètes » (六合)
  //   opposition : l'axe opposé (écart de 6)
  //   nuisance   : les six paires de « nuisance » (六害)
  function relationChinoise(a1, a2) {
    var ecart = mod(a2 - a1, 12), somme = a1 + a2;
    if (ecart === 6) return 'opposition';
    if (somme === 7 || somme === 19) return 'nuisance';
    if (ecart === 4 || ecart === 8) return 'trine';
    if (somme === 1 || somme === 13) return 'harmonie';
    if (ecart === 0) return 'meme';
    return 'neutre';
  }

  // Cycle des cinq éléments : bois → feu → terre → métal → eau → bois.
  // Un écart de 1 nourrit (le premier alimente le second), un écart de 2
  // contrôle (le premier tempère le second). On renvoie la relation ET
  // l'ordre, pour que la phrase dise qui nourrit qui.
  function relationElement(e1, e2) {
    if (e1 === e2) return { type: 'meme', de: e1, vers: e2 };
    var d = mod(e2 - e1, 5);
    if (d === 1) return { type: 'nourrit', de: e1, vers: e2 };
    if (d === 4) return { type: 'nourrit', de: e2, vers: e1 };
    if (d === 2) return { type: 'controle', de: e1, vers: e2 };
    return { type: 'controle', de: e2, vers: e1 };
  }

  // La note d'une paire vient des données de la page (78 paires, la même note
  // dans les cinq langues), l'élément la module un peu.
  function clePaire(a1, a2) {
    var i = Math.min(a1, a2), k = Math.max(a1, a2);
    return ANIMAUX[i] + '-' + ANIMAUX[k];
  }
  function compat(c1, c2) {
    var rel = relationChinoise(c1.animal, c2.animal);
    var relEl = relationElement(c1.element, c2.element);
    var paire = tr('paires.' + clePaire(c1.animal, c2.animal), null) || {};
    var note = typeof paire.note === 'number' ? paire.note : { trine: 8.6, harmonie: 8.4, meme: 7, neutre: 6.2, nuisance: 4.6, opposition: 3.8 }[rel];
    if (relEl.type === 'nourrit') note += 0.8;
    else if (relEl.type === 'controle') note -= 0.6;
    else note += 0.3;
    var pct = Math.round(Math.max(1.5, Math.min(9.8, note)) * 10);
    return { pct: pct, relation: rel, element: relEl, texte: paire.texte || '' };
  }

  // ── Le formulaire ─────────────────────────────────────────
  var MOIS_MAX = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  function dateValide(j, m, a) {
    if (!j || !m || !a) return false;
    if (m < 1 || m > 12 || j < 1 || j > MOIS_MAX[m - 1]) return false;
    if (m === 2 && j === 29) {
      var bissextile = (a % 4 === 0 && a % 100 !== 0) || a % 400 === 0;
      if (!bissextile) return false;
    }
    return true;
  }

  function remplirSelects() {
    var mois = tr('form.mois', []);
    var anneeMax = new Date().getFullYear();
    ['1', '2'].forEach(function (n) {
      var sj = el('sc-jour' + n), sm = el('sc-mois' + n), sa = el('sc-annee' + n);
      for (var j = 1; j <= 31; j++) sj.appendChild(new Option(j, j));
      for (var m = 1; m <= 12; m++) sm.appendChild(new Option(mois[m - 1] || m, m));
      for (var a = anneeMax; a >= 1924; a--) sa.appendChild(new Option(a, a));
      sa.value = n === '1' ? anneeMax - 30 : anneeMax - 28;
      sj.value = n === '1' ? 15 : 12;
      sm.value = n === '1' ? 6 : 9;
    });
  }

  function lire(n) {
    return {
      j: parseInt(el('sc-jour' + n).value, 10),
      m: parseInt(el('sc-mois' + n).value, 10),
      a: parseInt(el('sc-annee' + n).value, 10)
    };
  }

  function nomAnimal(i) { return tr('animaux.' + ANIMAUX[i], ANIMAUX[i]); }
  function nomElement(i) { return tr('elements.' + ELEMENTS[i], ELEMENTS[i]); }

  function palier(pct) {
    if (pct >= 85) return 'fusion';
    if (pct >= 70) return 'belle';
    if (pct >= 55) return 'solide';
    if (pct >= 42) return 'travail';
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

  function dateLisible(d) {
    var mois = (tr('form.moisDate', [])[d.m - 1]) || tr('form.mois', [])[d.m - 1] || d.m;
    return remplir(tr('form.dateAffichee', '{{j}} {{mois}} {{a}}'), { j: d.j, mois: mois, a: d.a });
  }

  function calculer() {
    var d1 = lire('1'), d2 = lire('2');
    var erreur = el('sc-erreur');
    if (!dateValide(d1.j, d1.m, d1.a) || !dateValide(d2.j, d2.m, d2.a)) {
      erreur.textContent = tr('form.erreur', 'Vérifiez les deux dates de naissance.');
      erreur.classList.remove('hidden');
      return;
    }
    erreur.classList.add('hidden');
    var c1 = signeChinois(d1.j, d1.m, d1.a), c2 = signeChinois(d2.j, d2.m, d2.a);
    afficher({ d1: d1, d2: d2, c1: c1, c2: c2, r: compat(c1, c2) });
  }

  function afficher(x) {
    var r = x.r, p = palier(r.pct);
    var vars = {
      a1: nomAnimal(x.c1.animal), a2: nomAnimal(x.c2.animal),
      e1: nomElement(x.c1.element), e2: nomElement(x.c2.element),
      de: nomElement(r.element.de), vers: nomElement(r.element.vers)
    };
    var html = '';

    // Le verdict. La classe quiz-result-card n'est pas décorative : c'est elle
    // que guettent le compteur de parties et le module de notation.
    html += '<div class="dn-verdict quiz-result-card">' +
      '<div class="dn-anneau-boite">' + anneau(r.pct) + '</div>' +
      '<h2 class="dn-verdict-titre">' + echapper(remplir(tr('paliers.' + p + '.titre', ''), vars)) + '</h2>' +
      '<p class="dn-verdict-texte">' + echapper(remplir(tr('paliers.' + p + '.texte', ''), vars)) + '</p>' +
      '</div>';

    // Les deux cartes : date, animal, élément, polarité.
    html += '<div class="dn-fiches">';
    [['1', x.d1, x.c1], ['2', x.d2, x.c2]].forEach(function (f) {
      html += '<div class="dn-fiche dn-fiche-' + f[0] + '">' +
        '<p class="dn-fiche-date">' + echapper(dateLisible(f[1])) + '</p>' +
        '<dl class="dn-fiche-liste">' +
        '<dt>' + echapper(tr('resultat.animal', 'Signe')) + '</dt><dd>' + echapper(nomAnimal(f[2].animal)) + '</dd>' +
        '<dt>' + echapper(tr('resultat.element', 'Élément')) + '</dt><dd>' + echapper(nomElement(f[2].element)) + '</dd>' +
        '<dt>' + echapper(tr('resultat.polarite', 'Polarité')) + '</dt><dd>' + echapper(tr(f[2].yang ? 'resultat.yang' : 'resultat.yin', f[2].yang ? 'Yang' : 'Yin')) + '</dd>' +
        '<dt>' + echapper(tr('resultat.anneeLunaire', 'Année chinoise')) + '</dt><dd>' + f[2].an + '</dd>' +
        '</dl></div>';
    });
    html += '</div>';

    // Ce que dit la roue : la relation traditionnelle, puis la paire elle-même.
    html += '<section class="dn-bloc">' +
      '<h3 class="dn-bloc-titre">' + echapper(remplir(tr('resultat.titreRoue', ''), vars)) + '</h3>' +
      '<p>' + echapper(remplir(tr('relations.' + r.relation, ''), vars)) + '</p>' +
      (r.texte ? '<p>' + echapper(remplir(r.texte, vars)) + '</p>' : '') +
      '</section>';

    // Chacun en amour (un seul portrait si les deux ont le même animal).
    var animaux = x.c1.animal === x.c2.animal ? [x.c1.animal] : [x.c1.animal, x.c2.animal];
    animaux.forEach(function (a) {
      html += '<section class="dn-bloc">' +
        '<h3 class="dn-bloc-titre">' + echapper(remplir(tr('resultat.titrePortrait', ''), { a: nomAnimal(a) })) + '</h3>' +
        '<p>' + echapper(tr('portraits.' + ANIMAUX[a], '')) + '</p>' +
        '</section>';
    });

    // Les éléments
    html += '<section class="dn-bloc">' +
      '<h3 class="dn-bloc-titre">' + echapper(remplir(tr('resultat.titreElements', ''), vars)) + '</h3>' +
      '<p>' + echapper(remplir(tr('elementsRelation.' + r.element.type, ''), vars)) + '</p>' +
      '</section>';

    // Le conseil, selon la relation
    html += '<section class="dn-bloc dn-bloc-couple">' +
      '<h3 class="dn-bloc-titre">' + echapper(tr('resultat.titreConseil', '')) + '</h3>' +
      '<p>' + echapper(remplir(tr('conseils.' + r.relation, ''), vars)) + '</p>' +
      '</section>';

    var sortie = el('sc-resultat');
    sortie.innerHTML = html;
    sortie.classList.remove('hidden');
    el('sc-formulaire').classList.add('hidden');
    el('sc-suite').classList.remove('hidden');

    function versLeResultat() {
      var haut = racine.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: haut, behavior: 'smooth' });
    }
    // Pas de moteur commun ici : on signale nous-mêmes que le résultat est là,
    // pour que l'écran prenne son adresse comme sur les autres pages.
    if (window.QCResultat) {
      window.QCResultat.arrivee(sortie, { lang: document.documentElement.lang || LANG, apres: versLeResultat });
    } else {
      versLeResultat();
    }
  }

  function recommencer() {
    if (window.QCResultat) window.QCResultat.retour();
    el('sc-resultat').classList.add('hidden');
    el('sc-suite').classList.add('hidden');
    el('sc-formulaire').classList.remove('hidden');
  }

  remplirSelects();
  el('sc-lancer').addEventListener('click', calculer);
  el('sc-refaire').addEventListener('click', recommencer);

  // Pour les essais : le calcul exposé, sans rien afficher.
  window.QCSignesChinois = { signe: signeChinois, compat: compat, relation: relationChinoise, animaux: ANIMAUX, elements: ELEMENTS };
})();
