/* Compteur de couple : une date de début, et tout ce qu'elle donne aujourd'hui.
   Les jours ensemble, la durée en années, mois et jours, les semaines, les
   mois, les heures, les Saint-Valentin et les dimanches passés à deux, puis
   les prochaines dates à fêter : anniversaire (avec le nom des noces), mois
   ronds, caps de jours (100, 365, 1 000...) et quelques caps insolites (dix
   mille heures, un million de minutes). Outil autonome, hors quiz-loader, sur
   le même gabarit que la compatibilité par date de naissance. Aucun serveur :
   la date est gardée dans le navigateur (localStorage) et peut voyager dans
   le lien « ?depuis=AAAA-MM-JJ&a=Prénom&b=Prénom », pour que la page se mette
   en favori et se partage. */
(function () {
  'use strict';
  var racine = document.getElementById('cc-outil');
  if (!racine) return;

  var T = window.CC_I18N || {};
  var LANG = racine.getAttribute('data-lang') || 'fr';
  var LOCALES = { fr: 'fr-FR', en: 'en-GB', es: 'es-ES', de: 'de-DE', it: 'it-IT' };
  var CLE_STOCK = 'qc-compteur';
  var JOUR_MS = 86400000;
  var PREMIERE_ANNEE = 1940;

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
  function nombre(n) {
    try { return new Intl.NumberFormat(LOCALES[LANG] || 'fr-FR').format(n); }
    catch (e) { return String(n); }
  }

  // ── Les dates ─────────────────────────────────────────────
  // Une date est { a, m, j } en calendrier local ; tous les écarts se comptent
  // en UTC sur des dates à minuit, donc jamais un jour en trop ou en moins à
  // cause d'un changement d'heure.
  function utc(d) { return Date.UTC(d.a, d.m - 1, d.j); }
  function depuisUtc(ms) {
    var x = new Date(ms);
    return { a: x.getUTCFullYear(), m: x.getUTCMonth() + 1, j: x.getUTCDate() };
  }
  function joursDansMois(a, m) { return new Date(Date.UTC(a, m, 0)).getUTCDate(); }
  function dateValide(d) {
    return d && d.a >= PREMIERE_ANNEE && d.a <= 2200 && d.m >= 1 && d.m <= 12 && d.j >= 1 && d.j <= joursDansMois(d.a, d.m);
  }
  function aujourdhui() {
    var n = new Date();
    return { a: n.getFullYear(), m: n.getMonth() + 1, j: n.getDate() };
  }
  function ecartJours(d1, d2) { return Math.round((utc(d2) - utc(d1)) / JOUR_MS); }
  function jourSemaine(d) { return new Date(utc(d)).getUTCDay(); }
  function iso(d) {
    return d.a + '-' + (d.m < 10 ? '0' : '') + d.m + '-' + (d.j < 10 ? '0' : '') + d.j;
  }
  function depuisIso(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ''));
    if (!m) return null;
    var d = { a: +m[1], m: +m[2], j: +m[3] };
    return dateValide(d) ? d : null;
  }

  // Le même jour du mois, k mois après le début : le 31 devient le 30 ou le
  // 28 quand le mois est plus court.
  function moisVersaire(debut, k) {
    var idx = debut.m - 1 + k;
    var a = debut.a + Math.floor(idx / 12), m = ((idx % 12) + 12) % 12 + 1;
    return { a: a, m: m, j: Math.min(debut.j, joursDansMois(a, m)) };
  }

  // Les années, mois et jours écoulés : le nombre de mois entiers d'abord,
  // puis les jours qui restent depuis le dernier mois rond.
  function decomposer(debut, ref) {
    var totalMois = (ref.a - debut.a) * 12 + (ref.m - debut.m);
    if (ref.j < Math.min(debut.j, joursDansMois(ref.a, ref.m))) totalMois--;
    if (totalMois < 0) totalMois = 0;
    var etape = moisVersaire(debut, totalMois);
    return { ans: Math.floor(totalMois / 12), mois: totalMois % 12, jours: ecartJours(etape, ref), totalMois: totalMois };
  }

  // ── Les caps ──────────────────────────────────────────────
  // Les caps de jours ronds, et quatre caps insolites exprimés en heures ou en
  // minutes (le jour où l'on y arrive est arrondi au-dessus).
  var CAPS_JOURS = [100, 200, 300, 365, 400, 500, 600, 700, 800, 900, 1000, 1500, 2000, 2500, 3000,
    3500, 4000, 4500, 5000, 6000, 7000, 7500, 8000, 9000, 10000, 11000, 12000, 12500, 15000, 17500, 20000, 25000, 30000];
  var CAPS_INSOLITES = [
    { jours: Math.ceil(10000 / 24), type: 'heures', valeur: 10000 },
    { jours: Math.ceil(1000000 / 1440), type: 'minutes', valeur: 1000000 },
    { jours: Math.ceil(100000 / 24), type: 'heures', valeur: 100000 },
    { jours: Math.ceil(10000000 / 1440), type: 'minutes', valeur: 10000000 }
  ];
  var CAPS = CAPS_JOURS.map(function (n) { return { jours: n, type: 'jours', valeur: n }; })
    .concat(CAPS_INSOLITES)
    .sort(function (x, y) { return x.jours - y.jours; });

  function nocesPour(n) {
    var liste = tr('noces', []);
    for (var i = 0; i < liste.length; i++) if (liste[i].an === n) return liste[i].nom;
    return '';
  }

  // ── Le calcul complet ─────────────────────────────────────
  // Tout ce que l'écran affiche sort d'ici, à partir de la date de début et
  // de la date du jour (passée en paramètre pour les essais).
  function calcul(debut, ref) {
    ref = ref || aujourdhui();
    var jours = ecartJours(debut, ref);
    var d = decomposer(debut, ref);

    // Les tuiles
    var valentins = 0;
    for (var a = debut.a; a <= ref.a; a++) {
      var v = utc({ a: a, m: 2, j: 14 });
      if (v >= utc(debut) && v <= utc(ref)) valentins++;
    }
    var premierDimanche = (7 - jourSemaine(debut)) % 7;
    var dimanches = premierDimanche > jours ? 0 : Math.floor((jours - premierDimanche) / 7) + 1;

    // Ce qui se fête aujourd'hui
    var fete = null;
    if (d.mois === 0 && d.jours === 0 && d.totalMois > 0) {
      fete = d.totalMois % 12 === 0 ? { type: 'anniversaire', n: d.ans } : { type: 'mois', n: d.totalMois };
    }
    var i;
    if (!fete) {
      for (i = 0; i < CAPS.length; i++) if (CAPS[i].jours === jours) { fete = { type: 'cap', cap: CAPS[i] }; break; }
    }

    // Les prochaines dates
    var etapes = [];
    var nAns = d.ans + 1;
    var anniv = moisVersaire(debut, nAns * 12);
    etapes.push({ type: 'anniversaire', n: nAns, noces: nocesPour(nAns), date: anniv, dans: ecartJours(ref, anniv) });
    var kMois = d.totalMois + 1;
    if (kMois % 12 !== 0) {
      var mv = moisVersaire(debut, kMois);
      etapes.push({ type: 'mois', n: kMois, date: mv, dans: ecartJours(ref, mv) });
    }
    var suivants = 0, dernierCap = null;
    for (i = 0; i < CAPS.length; i++) {
      if (CAPS[i].jours <= jours) { dernierCap = CAPS[i]; continue; }
      if (suivants >= 2) break;
      suivants++;
      etapes.push({ type: 'cap', cap: CAPS[i], date: depuisUtc(utc(debut) + CAPS[i].jours * JOUR_MS), dans: CAPS[i].jours - jours });
    }
    etapes.sort(function (x, y) { return x.dans - y.dans; });

    return {
      debut: debut, ref: ref, jours: jours, duree: d,
      semaines: Math.floor(jours / 7), mois: d.totalMois, heures: jours * 24, minutes: jours * 1440,
      valentins: valentins, dimanches: dimanches,
      fete: fete, etapes: etapes.slice(0, 4),
      dernierCap: dernierCap ? { cap: dernierCap, date: depuisUtc(utc(debut) + dernierCap.jours * JOUR_MS), ilYA: jours - dernierCap.jours } : null
    };
  }

  // ── Les mots ──────────────────────────────────────────────
  function unite(cle, n) {
    var u = tr('unites.' + cle, [cle, cle]);
    return n === 1 ? u[0] : u[1];
  }
  function avecUnite(cle, n) { return nombre(n) + ' ' + unite(cle, n); }
  function liste(parts) {
    if (parts.length <= 1) return parts.join('');
    return parts.slice(0, -1).join(tr('virgule', ', ')) + tr('et', ' et ') + parts[parts.length - 1];
  }
  function dureeLisible(d) {
    var parts = [];
    if (d.ans > 0) parts.push(avecUnite('an', d.ans));
    if (d.mois > 0) parts.push(avecUnite('mois', d.mois));
    if (d.jours > 0 || !parts.length) parts.push(avecUnite('jour', d.jours));
    return liste(parts);
  }
  function quand(n) {
    if (n === 0) return tr('quand.aujourdhui', "aujourd'hui");
    if (n === 1) return tr('quand.demain', 'demain');
    if (n === -1) return tr('quand.hier', 'hier');
    if (n > 1) return remplir(tr('quand.dans', 'dans {{n}} jours'), { n: nombre(n) });
    return remplir(tr('quand.ilya', 'il y a {{n}} jours'), { n: nombre(-n) });
  }
  function dateLisible(d) {
    var mois = (tr('form.moisDate', [])[d.m - 1]) || tr('form.mois', [])[d.m - 1] || d.m;
    return remplir(tr('form.dateAffichee', '{{j}} {{mois}} {{a}}'), { j: d.j, mois: mois, a: d.a });
  }
  function dateAvecJour(d) {
    var js = tr('form.joursSemaine', [])[jourSemaine(d)] || '';
    return remplir(tr('form.dateAvecJour', '{{js}} {{date}}'), { js: js, date: dateLisible(d) }).trim();
  }
  function libelleCap(cap) {
    if (cap.type === 'jours') return remplir(tr('etapes.capJours', 'Le cap des {{n}} jours'), { n: nombre(cap.valeur) });
    return remplir(tr('etapes.cap' + (cap.type === 'heures' ? 'Heures' : 'Minutes'), '{{n}}'), { n: nombre(cap.valeur) });
  }
  function libelleEtape(e) {
    if (e.type === 'anniversaire') return remplir(tr('etapes.anniversaire', '{{n}} {{ans}} ensemble'), { n: nombre(e.n), ans: unite('an', e.n) });
    if (e.type === 'mois') return remplir(tr('etapes.mois', '{{n}} mois ensemble'), { n: nombre(e.n), mois: unite('mois', e.n) });
    return libelleCap(e.cap);
  }
  function detailEtape(e) {
    if (e.type === 'anniversaire' && e.noces) return remplir(tr('etapes.noces', 'les noces de {{noces}}'), { noces: e.noces });
    if (e.type === 'cap' && e.cap.type !== 'jours') return remplir(tr('etapes.capDetail', 'soit {{n}} jours'), { n: nombre(e.cap.jours) });
    return '';
  }
  function libelleFete(f) {
    if (f.type === 'anniversaire') return remplir(tr('fete.anniversaire', ''), { n: nombre(f.n), ans: unite('an', f.n), noces: nocesPour(f.n) }).replace(/\s*\(\s*\)/, '');
    if (f.type === 'mois') return remplir(tr('fete.mois', ''), { n: nombre(f.n), mois: unite('mois', f.n) });
    return remplir(tr('fete.cap', ''), { cap: libelleCap(f.cap) });
  }
  function nomsLisibles(a, b) {
    if (a && b) return remplir(tr('resultat.noms', '{{a}} & {{b}}'), { a: a, b: b });
    if (a || b) return remplir(tr('resultat.noms', '{{a}} & {{b}}'), { a: a || b, b: tr('resultat.vous', 'vous') });
    return tr('resultat.vousDeux', 'Vous deux');
  }

  // ── Le formulaire ─────────────────────────────────────────
  function option(valeur, texte, choisi) {
    var o = document.createElement('option');
    o.value = valeur; o.textContent = texte;
    if (choisi) o.selected = true;
    return o;
  }
  function remplirSelects() {
    var mois = tr('form.mois', []), an = aujourdhui().a, i;
    var sj = el('cc-jour'), sm = el('cc-mois'), sa = el('cc-annee');
    sj.appendChild(option('', tr('form.jour', 'Jour'), true));
    for (i = 1; i <= 31; i++) sj.appendChild(option(String(i), String(i)));
    sm.appendChild(option('', tr('form.moisLabel', 'Mois'), true));
    for (i = 0; i < 12; i++) sm.appendChild(option(String(i + 1), mois[i] || String(i + 1)));
    sa.appendChild(option('', tr('form.annee', 'Année'), true));
    for (i = an; i >= PREMIERE_ANNEE; i--) sa.appendChild(option(String(i), String(i)));
  }
  function lireDate() {
    return { j: parseInt(el('cc-jour').value, 10), m: parseInt(el('cc-mois').value, 10), a: parseInt(el('cc-annee').value, 10) };
  }
  function poserDate(d) {
    el('cc-jour').value = String(d.j); el('cc-mois').value = String(d.m); el('cc-annee').value = String(d.a);
  }
  function propre(s) {
    return String(s == null ? '' : s).replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 24);
  }
  function lirePrenoms() {
    return { a: propre(el('cc-prenom1').value), b: propre(el('cc-prenom2').value) };
  }

  // ── Mémoire et lien ───────────────────────────────────────
  function memoriser(d, noms) {
    try { localStorage.setItem(CLE_STOCK, JSON.stringify({ d: iso(d), a: noms.a, b: noms.b })); } catch (e) {}
  }
  function oublier() {
    try { localStorage.removeItem(CLE_STOCK); } catch (e) {}
  }
  function lireMemoire() {
    try {
      var x = JSON.parse(localStorage.getItem(CLE_STOCK) || 'null');
      var d = x && depuisIso(x.d);
      return d ? { d: d, a: propre(x.a), b: propre(x.b) } : null;
    } catch (e) { return null; }
  }
  function lireLien() {
    var q = location.search || '';
    if (q.indexOf('depuis=') === -1) return null;
    var params = {};
    q.slice(1).split('&').forEach(function (p) {
      var i = p.indexOf('=');
      if (i === -1) return;
      try { params[decodeURIComponent(p.slice(0, i))] = decodeURIComponent(p.slice(i + 1).replace(/\+/g, ' ')); } catch (e) {}
    });
    var d = depuisIso(params.depuis);
    return d ? { d: d, a: propre(params.a), b: propre(params.b) } : null;
  }
  function lienDuCompteur(d, noms) {
    var url = location.origin + location.pathname + '?depuis=' + iso(d);
    if (noms.a) url += '&a=' + encodeURIComponent(noms.a);
    if (noms.b) url += '&b=' + encodeURIComponent(noms.b);
    return url;
  }

  // ── L'affichage ───────────────────────────────────────────
  var courant = null;

  function tuile(n, cle) {
    return '<div class="cc-tuile"><span class="cc-tuile-nombre">' + nombre(n) + '</span>' +
      '<span class="cc-tuile-libelle">' + echapper(unite(cle, n)) + '</span></div>';
  }

  function afficher(r, noms, options) {
    var html = '';
    // La carte de tête. La classe quiz-result-card n'est pas décorative : c'est
    // elle que guettent le compteur de parties et le module de notation.
    html += '<div class="dn-verdict quiz-result-card cc-carte">' +
      '<p class="cc-noms">' + echapper(nomsLisibles(noms.a, noms.b)) + '</p>' +
      '<p class="cc-depuis">' + echapper(remplir(tr('resultat.depuis', 'ensemble depuis le {{date}}'), { date: dateAvecJour(r.debut) })) + '</p>' +
      '<h2 class="cc-grand"><span class="cc-grand-nombre">' + nombre(r.jours) + '</span>' +
      '<span class="cc-grand-unite">' + echapper(remplir(tr('resultat.joursEnsemble', '{{jours}} ensemble'), { jours: unite('jour', r.jours) })) + '</span></h2>' +
      '<p class="cc-duree">' + echapper(remplir(tr('resultat.soit', 'soit {{duree}}'), { duree: dureeLisible(r.duree) })) + '</p>' +
      (r.fete ? '<p class="cc-fete">' + echapper(libelleFete(r.fete)) + '</p>' : '') +
      '</div>';

    // Les tuiles
    html += '<div class="cc-tuiles">' +
      tuile(r.semaines, 'semaine') + tuile(r.mois, 'mois') + tuile(r.heures, 'heure') +
      tuile(r.minutes, 'minute') + tuile(r.valentins, 'valentin') + tuile(r.dimanches, 'dimanche') +
      '</div>';

    // Les prochaines dates
    html += '<section class="dn-bloc"><h3 class="dn-bloc-titre">' + echapper(tr('resultat.titreEtapes', 'Les prochaines dates à fêter')) + '</h3>' +
      '<ol class="cc-etapes">';
    r.etapes.forEach(function (e) {
      var detail = detailEtape(e);
      html += '<li class="cc-etape"><span class="cc-etape-quand">' + echapper(quand(e.dans)) + '</span>' +
        '<span class="cc-etape-corps"><strong class="cc-etape-quoi">' + echapper(libelleEtape(e)) + '</strong>' +
        (detail ? '<span class="cc-etape-detail">' + echapper(detail) + '</span>' : '') +
        '<span class="cc-etape-date">' + echapper(dateAvecJour(e.date)) + '</span></span></li>';
    });
    html += '</ol></section>';

    // Le dernier cap franchi
    if (r.dernierCap) {
      html += '<section class="dn-bloc"><h3 class="dn-bloc-titre">' + echapper(tr('resultat.titreDernierCap', 'Le dernier cap franchi')) + '</h3>' +
        '<p>' + echapper(remplir(tr('resultat.dernierCap', ''), {
          cap: libelleCap(r.dernierCap.cap), date: dateAvecJour(r.dernierCap.date), quand: quand(-r.dernierCap.ilYA)
        })) + '</p></section>';
    }

    // Garder le compteur
    html += '<section class="dn-bloc dn-bloc-couple"><h3 class="dn-bloc-titre">' + echapper(tr('resultat.titreGarder', '')) + '</h3>' +
      '<p>' + echapper(tr('resultat.garder', '')) + '</p></section>';

    var sortie = el('cc-resultat');
    sortie.innerHTML = html;
    sortie.classList.remove('hidden');
    el('cc-formulaire').classList.add('hidden');
    el('cc-suite').classList.remove('hidden');
    courant = { r: r, noms: noms };

    function versLeResultat() {
      var haut = racine.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: haut, behavior: 'smooth' });
    }
    // Un compteur rouvert depuis un favori ou un lien n'est pas un résultat
    // qu'on vient d'obtenir : pas d'adresse de résultat, pas de défilement.
    if (options && options.silencieux) return;
    if (window.QCResultat) {
      window.QCResultat.arrivee(sortie, { lang: document.documentElement.lang || LANG, apres: versLeResultat });
    } else {
      versLeResultat();
    }
  }

  function calculer() {
    var d = lireDate(), erreur = el('cc-erreur');
    var probleme = '';
    if (!d.j || !d.m || !d.a) probleme = tr('form.erreurVide', 'Choisissez le jour, le mois et l’année.');
    else if (!dateValide(d)) probleme = tr('form.erreur', 'Cette date n’existe pas.');
    else if (ecartJours(d, aujourdhui()) < 0) probleme = tr('form.erreurFutur', 'Cette date est encore devant vous.');
    if (probleme) {
      erreur.textContent = probleme;
      erreur.classList.remove('hidden');
      return;
    }
    erreur.classList.add('hidden');
    var noms = lirePrenoms();
    memoriser(d, noms);
    afficher(calcul(d), noms);
  }

  function modifier() {
    if (window.QCResultat) window.QCResultat.retour();
    el('cc-resultat').classList.add('hidden');
    el('cc-suite').classList.add('hidden');
    el('cc-formulaire').classList.remove('hidden');
    var haut = racine.getBoundingClientRect().top + window.pageYOffset - 80;
    window.scrollTo({ top: haut, behavior: 'smooth' });
  }

  // ── Partager, copier ──────────────────────────────────────
  function confirmer(texte) {
    var c = el('cc-copie');
    if (!c) return;
    c.textContent = texte;
    c.classList.remove('hidden');
    clearTimeout(confirmer.t);
    confirmer.t = setTimeout(function () { c.classList.add('hidden'); }, 2600);
  }
  function copier(texte, message) {
    function vu() { confirmer(message); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texte).then(vu).catch(function () {});
      return;
    }
    var z = document.createElement('textarea');
    z.value = texte; z.setAttribute('readonly', ''); z.style.position = 'absolute'; z.style.left = '-9999px';
    document.body.appendChild(z); z.select();
    try { document.execCommand('copy'); vu(); } catch (e) {}
    document.body.removeChild(z);
  }
  function textePartage() {
    var r = courant.r, e = r.etapes[0];
    return remplir(tr('partage.texte', ''), {
      noms: nomsLisibles(courant.noms.a, courant.noms.b),
      jours: nombre(r.jours), unite: unite('jour', r.jours),
      duree: dureeLisible(r.duree),
      etape: libelleEtape(e), date: dateLisible(e.date)
    });
  }
  function partager() {
    if (!courant) return;
    var texte = textePartage(), url = lienDuCompteur(courant.r.debut, courant.noms);
    if (navigator.share) {
      navigator.share({ title: document.title, text: texte, url: url }).catch(function () {});
      return;
    }
    copier(texte + ' ' + url, tr('partage.copieTexte', 'Texte et lien copiés !'));
  }
  function copierLeLien() {
    if (!courant) return;
    copier(lienDuCompteur(courant.r.debut, courant.noms), tr('partage.copieLien', 'Lien copié !'));
  }

  // ── Au chargement ─────────────────────────────────────────
  remplirSelects();
  el('cc-lancer').addEventListener('click', calculer);
  el('cc-formulaire').addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target && e.target.tagName === 'INPUT') { e.preventDefault(); calculer(); }
  });
  el('cc-refaire').addEventListener('click', modifier);
  el('cc-partager').addEventListener('click', partager);
  el('cc-copier').addEventListener('click', copierLeLien);

  // Le lien l'emporte sur la mémoire du navigateur : c'est lui qu'on a ouvert.
  var connu = lireLien() || lireMemoire();
  if (connu) {
    poserDate(connu.d);
    el('cc-prenom1').value = connu.a;
    el('cc-prenom2').value = connu.b;
    memoriser(connu.d, { a: connu.a, b: connu.b });
    afficher(calcul(connu.d), { a: connu.a, b: connu.b }, { silencieux: true });
  }

  // Pour les essais : le calcul exposé, sans rien afficher.
  window.QCCompteur = { calcul: calcul, decomposer: decomposer, moisVersaire: moisVersaire, caps: CAPS, oublier: oublier };
})();
