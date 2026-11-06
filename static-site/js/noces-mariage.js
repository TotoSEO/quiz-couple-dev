/* Noces de mariage : la date du mariage, et les noces qu'elle donne.
   Les noces qu'on fête en ce moment (la dernière date passée de la liste),
   les suivantes avec leur date et le nombre de jours qui restent, et la ligne
   du tableau de la page mise en avant. La liste vient du fichier de la langue
   (noces-mariage.json, clé « liste ») : chaque pays a la sienne, et certaines
   noces tombent entre deux années (la koperen bruiloft néerlandaise à
   12 ans et demi, la Petersilienhochzeit allemande), d'où un compte en mois.
   Outil autonome, hors quiz-loader, sur le gabarit des outils par date
   (classes astro-* et dn-*). Aucun serveur : la date est gardée dans le
   navigateur (localStorage) et peut voyager dans le lien « ?mariage=AAAA-MM-JJ ». */
(function () {
  'use strict';
  var racine = document.getElementById('nm-outil');
  if (!racine) return;

  var T = window.NM_I18N || {};
  var LANG = racine.getAttribute('data-lang') || 'fr';
  var LOCALES = { fr: 'fr-FR', en: 'en-GB', es: 'es-ES', de: 'de-DE', it: 'it-IT', nl: 'nl-NL' };
  var CLE_STOCK = 'qc-noces';
  var JOUR_MS = 86400000;
  var PREMIERE_ANNEE = 1930;
  var ANNEES_AVANT = 3;   // un mariage prévu peut se saisir jusqu'à trois ans à l'avance
  var FRACTIONS = { 3: '¼', 4: '⅓', 6: '½', 9: '¾' };

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
  function majuscule(s) { s = String(s || ''); return s.charAt(0).toUpperCase() + s.slice(1); }

  // ── Les dates ─────────────────────────────────────────────
  // Une date est { a, m, j } en calendrier local ; les écarts se comptent en
  // UTC sur des dates à minuit, jamais un jour en trop à cause de l'heure d'été.
  function utc(d) { return Date.UTC(d.a, d.m - 1, d.j); }
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
  // Le même jour du mois, k mois après le mariage : un mariage du 31 se fête
  // le 30 ou le 28 les mois plus courts, et celui du 29 février le 28.
  function moisVersaire(debut, k) {
    var idx = debut.m - 1 + k;
    var a = debut.a + Math.floor(idx / 12), m = ((idx % 12) + 12) % 12 + 1;
    return { a: a, m: m, j: Math.min(debut.j, joursDansMois(a, m)) };
  }
  function decomposer(debut, ref) {
    var totalMois = (ref.a - debut.a) * 12 + (ref.m - debut.m);
    if (ref.j < Math.min(debut.j, joursDansMois(ref.a, ref.m))) totalMois--;
    if (totalMois < 0) totalMois = 0;
    var etape = moisVersaire(debut, totalMois);
    return { ans: Math.floor(totalMois / 12), mois: totalMois % 12, jours: ecartJours(etape, ref), totalMois: totalMois };
  }

  // ── La liste ──────────────────────────────────────────────
  // Rangée en mois : 12,5 ans font 150 mois, et la date de ces noces est le
  // même jour du mois, 150 mois après le mariage.
  var LISTE = (tr('liste', []) || []).filter(function (x) {
    return x && typeof x.an === 'number' && x.an > 0 && x.nom;
  }).map(function (x) {
    return { an: x.an, mois: Math.round(x.an * 12), nom: String(x.nom), ook: x.ook ? String(x.ook) : '', anglo: !!x.anglo };
  }).sort(function (a, b) { return a.mois - b.mois; });

  // ── Les mots ──────────────────────────────────────────────
  function unite(cle, n) {
    var u = tr('unites.' + cle, [cle, cle]);
    return n === 1 ? u[0] : u[1];
  }
  function avecUnite(cle, n) { return nombre(n) + ' ' + unite(cle, n); }
  // « 12 ans », « 12½ ans » : la fraction s'écrit collée au nombre.
  function annees(entree) {
    var entier = Math.floor(entree.mois / 12), reste = entree.mois % 12;
    if (!reste) return avecUnite('an', entier);
    var f = FRACTIONS[reste];
    if (!f) return avecUnite('mois', entree.mois);
    return (entier ? nombre(entier) : '') + f + ' ' + unite('an', 2);
  }
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

  // ── Le calcul ─────────────────────────────────────────────
  // Tout ce que l'écran affiche sort d'ici (la date du jour se passe en
  // paramètre pour les essais).
  function calcul(debut, ref) {
    ref = ref || aujourdhui();
    var avant = ecartJours(ref, debut);
    var dates = LISTE.map(function (e) { return { e: e, date: moisVersaire(debut, e.mois) }; });
    var passees = dates.filter(function (x) { return ecartJours(x.date, ref) >= 0; });
    var aVenir = dates.filter(function (x) { return ecartJours(ref, x.date) > 0; });
    var actuelle = passees.length ? passees[passees.length - 1] : null;
    return {
      debut: debut, ref: ref,
      avant: avant > 0 ? avant : 0,
      duree: avant > 0 ? null : decomposer(debut, ref),
      actuelle: actuelle,
      aujourdHui: !!(actuelle && ecartJours(actuelle.date, ref) === 0),
      suivantes: aVenir.slice(0, 4).map(function (x) { return { e: x.e, date: x.date, dans: ecartJours(ref, x.date) }; })
    };
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
    var sj = el('nm-jour'), sm = el('nm-mois'), sa = el('nm-annee');
    sj.appendChild(option('', tr('form.jour', 'Jour'), true));
    for (i = 1; i <= 31; i++) sj.appendChild(option(String(i), String(i)));
    sm.appendChild(option('', tr('form.moisLabel', 'Mois'), true));
    for (i = 0; i < 12; i++) sm.appendChild(option(String(i + 1), mois[i] || String(i + 1)));
    sa.appendChild(option('', tr('form.annee', 'Année'), true));
    for (i = an + ANNEES_AVANT; i >= PREMIERE_ANNEE; i--) sa.appendChild(option(String(i), String(i)));
  }
  function lireDate() {
    return { j: parseInt(el('nm-jour').value, 10), m: parseInt(el('nm-mois').value, 10), a: parseInt(el('nm-annee').value, 10) };
  }
  function poserDate(d) {
    el('nm-jour').value = String(d.j); el('nm-mois').value = String(d.m); el('nm-annee').value = String(d.a);
  }

  // ── Mémoire et lien ───────────────────────────────────────
  function memoriser(d) {
    try { localStorage.setItem(CLE_STOCK, JSON.stringify({ d: iso(d) })); } catch (e) {}
  }
  function lireMemoire() {
    try {
      var x = JSON.parse(localStorage.getItem(CLE_STOCK) || 'null');
      return (x && depuisIso(x.d)) || null;
    } catch (e) { return null; }
  }
  function lireLien() {
    var m = /[?&]mariage=(\d{4}-\d{2}-\d{2})/.exec(location.search || '');
    return m ? depuisIso(m[1]) : null;
  }
  function lienDesNoces(d) { return location.origin + location.pathname + '?mariage=' + iso(d); }

  // ── L'affichage ───────────────────────────────────────────
  var courant = null;

  function nomNoces(e) { return majuscule(e.nom); }
  function lignesDetail(e) {
    var html = '';
    if (e.ook) html += '<p class="nm-ook">' + echapper(remplir(tr('resultat.ook', '{{ook}}'), { ook: e.ook })) + '</p>';
    if (e.anglo) html += '<p class="nm-anglo">' + echapper(tr('resultat.anglo', '')) + '</p>';
    return html;
  }
  function marquerLigne(e) {
    var lignes = document.querySelectorAll('[data-nm-mois]');
    for (var i = 0; i < lignes.length; i++) {
      lignes[i].classList.toggle('nm-ligne--vous', !!e && lignes[i].getAttribute('data-nm-mois') === String(e.mois));
    }
  }

  function afficher(r, options) {
    var html = '<div class="dn-verdict quiz-result-card nm-carte">';
    if (r.avant > 0) {
      html += '<p class="nm-depuis">' + echapper(remplir(tr('resultat.avant', ''), { dans: quand(r.avant), date: dateAvecJour(r.debut) })) + '</p>';
    } else {
      // Le jour même du mariage, « 0 jour de mariage » ne veut rien dire.
      var jourJ = r.duree.totalMois === 0 && r.duree.jours === 0;
      html += '<p class="nm-depuis">' + echapper(remplir(tr('resultat.depuis', ''), { date: dateAvecJour(r.debut) })) + '</p>' +
        '<p class="nm-duree">' + echapper(jourJ ? tr('resultat.jourJ', '') : remplir(tr('resultat.duree', '{{duree}}'), { duree: dureeLisible(r.duree) })) + '</p>';
    }
    if (r.actuelle) {
      var a = r.actuelle;
      html += '<p class="nm-etiquette">' + echapper(tr(r.aujourdHui ? 'resultat.aujourdhuiTitre' : 'resultat.actuelleTitre', '')) + '</p>' +
        '<h2 class="nm-nom">' + echapper(nomNoces(a.e)) + '</h2>' +
        '<p class="nm-detail">' + echapper(remplir(tr(r.aujourdHui ? 'resultat.aujourdhuiDetail' : 'resultat.actuelleDetail', ''), {
          ans: annees(a.e), date: dateAvecJour(a.date)
        })) + '</p>' + lignesDetail(a.e);
    } else if (r.suivantes.length) {
      var p = r.suivantes[0];
      html += '<p class="nm-etiquette">' + echapper(tr('resultat.premiereTitre', '')) + '</p>' +
        '<h2 class="nm-nom">' + echapper(nomNoces(p.e)) + '</h2>' +
        '<p class="nm-detail">' + echapper(remplir(tr('resultat.premiereDetail', ''), {
          ans: annees(p.e), date: dateAvecJour(p.date), dans: quand(p.dans)
        })) + '</p>' + lignesDetail(p.e);
    }
    html += '</div>';

    // Les suivantes (la première, si elle vient d'être affichée en grand, n'est pas répétée)
    var suivantes = r.actuelle ? r.suivantes : r.suivantes.slice(1);
    if (suivantes.length) {
      html += '<section class="dn-bloc"><h3 class="dn-bloc-titre">' + echapper(tr('resultat.titreSuivantes', '')) + '</h3><ol class="nm-suivantes">';
      suivantes.forEach(function (s) {
        html += '<li class="nm-suivante"><span class="nm-suivante-quand">' + echapper(quand(s.dans)) + '</span>' +
          '<span class="nm-suivante-corps"><strong class="nm-suivante-nom">' + echapper(nomNoces(s.e)) + '</strong>' +
          '<span class="nm-suivante-ans">' + echapper(annees(s.e)) + '</span>' +
          '<span class="nm-suivante-date">' + echapper(dateAvecJour(s.date)) + '</span></span></li>';
      });
      html += '</ol></section>';
    } else if (r.actuelle) {
      html += '<section class="dn-bloc"><p>' + echapper(tr('resultat.finListe', '')) + '</p></section>';
    }

    var sortie = el('nm-resultat');
    sortie.innerHTML = html;
    sortie.classList.remove('hidden');
    el('nm-formulaire').classList.add('hidden');
    el('nm-suite').classList.remove('hidden');
    marquerLigne(r.actuelle ? r.actuelle.e : null);
    courant = r;

    function versLeResultat() {
      var haut = racine.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: haut, behavior: 'smooth' });
    }
    // Une date rouverte depuis un favori ou un lien n'est pas un résultat
    // qu'on vient d'obtenir : pas d'adresse de résultat, pas de défilement.
    if (options && options.silencieux) return;
    if (window.QCResultat) {
      window.QCResultat.arrivee(sortie, { lang: document.documentElement.lang || LANG, apres: versLeResultat });
    } else {
      versLeResultat();
    }
  }

  function calculer() {
    var d = lireDate(), erreur = el('nm-erreur'), probleme = '';
    if (!d.j || !d.m || !d.a) probleme = tr('form.erreurVide', '');
    else if (!dateValide(d)) probleme = tr('form.erreur', '');
    if (probleme) {
      erreur.textContent = probleme;
      erreur.classList.remove('hidden');
      return;
    }
    erreur.classList.add('hidden');
    memoriser(d);
    afficher(calcul(d));
  }

  function modifier() {
    if (window.QCResultat) window.QCResultat.retour();
    el('nm-resultat').classList.add('hidden');
    el('nm-suite').classList.add('hidden');
    el('nm-formulaire').classList.remove('hidden');
    var haut = racine.getBoundingClientRect().top + window.pageYOffset - 80;
    window.scrollTo({ top: haut, behavior: 'smooth' });
  }

  function confirmer(texte) {
    var c = el('nm-copie');
    if (!c) return;
    c.textContent = texte;
    c.classList.remove('hidden');
    clearTimeout(confirmer.t);
    confirmer.t = setTimeout(function () { c.classList.add('hidden'); }, 2600);
  }
  function copierLeLien() {
    if (!courant) return;
    var url = lienDesNoces(courant.debut), message = tr('resultat.lienCopie', '');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () { confirmer(message); }).catch(function () {});
      return;
    }
    var z = document.createElement('textarea');
    z.value = url; z.setAttribute('readonly', ''); z.style.position = 'absolute'; z.style.left = '-9999px';
    document.body.appendChild(z); z.select();
    try { document.execCommand('copy'); confirmer(message); } catch (e) {}
    document.body.removeChild(z);
  }

  // ── Au chargement ─────────────────────────────────────────
  remplirSelects();
  el('nm-lancer').addEventListener('click', calculer);
  el('nm-refaire').addEventListener('click', modifier);
  el('nm-copier').addEventListener('click', copierLeLien);

  // Le lien l'emporte sur la mémoire du navigateur : c'est lui qu'on a ouvert.
  var connu = lireLien() || lireMemoire();
  if (connu) {
    poserDate(connu);
    memoriser(connu);
    afficher(calcul(connu), { silencieux: true });
  }

  // Pour les essais : le calcul exposé, sans rien afficher.
  window.QCNoces = { calcul: calcul, liste: LISTE, annees: annees };
})();
