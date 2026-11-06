/* Différence d'âge en couple : deux dates de naissance, et ce qu'elles disent.
   L'écart exact en années, mois et jours, qui a de plus que l'autre, la
   règle de la moitié plus sept (calculée sur les âges entiers, comme tout le
   monde la fait de tête), le moment de l'année où l'écart affiché change d'un
   an, et la date des 50, 100 ou 150 ans à deux. Quand le plus jeune est
   mineur et l'autre majeur, la règle laisse place à une note de prudence.
   Outil autonome, hors quiz-loader, sur le gabarit des outils par date
   (classes astro-* et dn-*). Aucun serveur : les dates sont gardées dans le
   navigateur (localStorage) et peuvent voyager dans le lien
   « ?a=AAAA-MM-JJ&b=AAAA-MM-JJ ». */
(function () {
  'use strict';
  var racine = document.getElementById('da-outil');
  if (!racine) return;

  var T = window.DA_I18N || {};
  var LANG = racine.getAttribute('data-lang') || 'fr';
  var LOCALES = { fr: 'fr-FR', en: 'en-GB', es: 'es-ES', de: 'de-DE', it: 'it-IT', nl: 'nl-NL' };
  var CLE_STOCK = 'qc-ecart-age';
  var JOUR_MS = 86400000;
  var ANS_MAX = 110;
  var BANDES = [1, 3, 6, 10, 15];       // bornes hautes, en années d'écart
  var CUMULS = [50, 100, 150, 200];      // les âges additionnés qu'on fête
  var NOM_MAX = 30;

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
  function nombre(n, decimales) {
    try {
      return new Intl.NumberFormat(LOCALES[LANG] || 'fr-FR', { maximumFractionDigits: decimales || 0 }).format(n);
    } catch (e) { return String(n); }
  }
  function majuscule(s) { s = String(s || ''); return s.charAt(0).toUpperCase() + s.slice(1); }

  // ── Les dates ─────────────────────────────────────────────
  // Une date est { a, m, j } ; les écarts se comptent en UTC sur des dates
  // à minuit, jamais un jour en trop à cause de l'heure d'été.
  function utc(d) { return Date.UTC(d.a, d.m - 1, d.j); }
  function depuisUtc(ms) { var x = new Date(ms); return { a: x.getUTCFullYear(), m: x.getUTCMonth() + 1, j: x.getUTCDate() }; }
  function joursDansMois(a, m) { return new Date(Date.UTC(a, m, 0)).getUTCDate(); }
  function aujourdhui() { var n = new Date(); return { a: n.getFullYear(), m: n.getMonth() + 1, j: n.getDate() }; }
  function dateValide(d) {
    return d && d.a >= 1900 && d.a <= 2200 && d.m >= 1 && d.m <= 12 && d.j >= 1 && d.j <= joursDansMois(d.a, d.m);
  }
  function ecartJours(d1, d2) { return Math.round((utc(d2) - utc(d1)) / JOUR_MS); }
  function jourSemaine(d) { return new Date(utc(d)).getUTCDay(); }
  function iso(d) { return d.a + '-' + (d.m < 10 ? '0' : '') + d.m + '-' + (d.j < 10 ? '0' : '') + d.j; }
  function depuisIso(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ''));
    if (!m) return null;
    var d = { a: +m[1], m: +m[2], j: +m[3] };
    return dateValide(d) ? d : null;
  }
  // Le même jour du mois, k mois plus tard : le 31 devient le 30 ou le 28,
  // et le 29 février le 28 les années qui n'en ont pas.
  function moisVersaire(debut, k) {
    var idx = debut.m - 1 + k;
    var a = debut.a + Math.floor(idx / 12), m = ((idx % 12) + 12) % 12 + 1;
    return { a: a, m: m, j: Math.min(debut.j, joursDansMois(a, m)) };
  }
  function decomposer(debut, fin) {
    var totalMois = (fin.a - debut.a) * 12 + (fin.m - debut.m);
    if (fin.j < Math.min(debut.j, joursDansMois(fin.a, fin.m))) totalMois--;
    if (totalMois < 0) totalMois = 0;
    var etape = moisVersaire(debut, totalMois);
    return { ans: Math.floor(totalMois / 12), mois: totalMois % 12, jours: ecartJours(etape, fin), totalMois: totalMois };
  }
  function age(naissance, ref) { return decomposer(naissance, ref).ans; }

  // ── Les mots ──────────────────────────────────────────────
  function unite(cle, n) { var u = tr('unites.' + cle, [cle, cle]); return n === 1 ? u[0] : u[1]; }
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
    return remplir(tr('quand.dans', 'dans {{n}} jours'), { n: nombre(n) });
  }
  function nomMois(m) { return (tr('form.moisDate', [])[m - 1]) || tr('form.mois', [])[m - 1] || m; }
  function numJour(j) { return j === 1 ? tr('form.premier', '1') : j; }
  function dateLisible(d) { return remplir(tr('form.dateAffichee', '{{j}} {{mois}} {{a}}'), { j: numJour(d.j), mois: nomMois(d.m), a: d.a }); }
  function dateAvecJour(d) {
    var js = tr('form.joursSemaine', [])[jourSemaine(d)] || '';
    return remplir(tr('form.dateAvecJour', '{{js}} {{date}}'), { js: js, date: dateLisible(d) }).trim();
  }
  function jourMois(j, m) { return remplir(tr('form.jourMois', '{{j}} {{mois}}'), { j: numJour(j), mois: nomMois(m) }); }
  // En italien, « dal », « al » et « il » s'élident devant 8 et 11 (otto,
  // undici) : « dall'8 marzo », « all'11 luglio ».
  function elisions(s) {
    // langues: sans-nl (l'élision devant 8 et 11 n'existe qu'en italien)
    if (LANG !== 'it') return s;
    return String(s)
      .replace(/\b([Dd])al (8|11)(?=\D|$)/g, "$1all'$2")
      .replace(/\b([Aa])l (8|11)(?=\D|$)/g, "$1ll'$2")
      .replace(/\b([Ii])l (8|11)(?=\D|$)/g, function (_, i, n) { return (i === 'I' ? 'L' : 'l') + "'" + n; });
  }
  function nomPropre(s) { return String(s || '').replace(/\s+/g, ' ').trim().slice(0, NOM_MAX); }

  // ── Le calcul ─────────────────────────────────────────────
  // p = { d: date, nom: prénom ou '' } pour « vous » (moi) et l'autre.
  function calcul(moi, autre, ref) {
    ref = ref || aujourdhui();
    var r = { moi: moi, autre: autre, ref: ref };
    var cmp = utc(moi.d) - utc(autre.d);
    if (cmp === 0) { r.meme = true; return r; }
    var aine = cmp < 0 ? moi : autre, cadet = cmp < 0 ? autre : moi;
    r.aineEstMoi = aine === moi;
    r.aine = aine; r.cadet = cadet;
    r.ecart = decomposer(aine.d, cadet.d);
    r.ecartJours = ecartJours(aine.d, cadet.d);
    var annees = r.ecartJours / 365.2425;
    r.bande = 0;
    while (r.bande < BANDES.length && annees >= BANDES[r.bande]) r.bande++;

    // Les âges du jour, et la règle de la moitié plus sept
    r.ageAine = age(aine.d, ref);
    r.ageCadet = age(cadet.d, ref);
    r.mineur = r.ageCadet < 18 && r.ageAine >= 18;
    r.deuxMineurs = r.ageAine < 18;
    if (!r.mineur && !r.deuxMineurs) {
      r.min = r.ageAine / 2 + 7;
      r.regleOk = r.ageCadet >= r.min;
      if (!r.regleOk) {
        // La règle se fait sur les âges entiers, qui ne changent qu'aux
        // anniversaires. On les suit un par un et on garde le jour à partir
        // duquel elle est respectée pour de bon : avant, elle peut l'être
        // quelques mois puis ne plus l'être, entre l'anniversaire de l'aîné
        // et celui de l'autre. Au bout de 130 ans, elle l'est toujours.
        var etat = false;
        for (var k = 1; k <= 130; k++) {
          var ev = [moisVersaire(aine.d, (r.ageAine + k) * 12), moisVersaire(cadet.d, (r.ageCadet + k) * 12)]
            .sort(function (x, y) { return utc(x) - utc(y); });
          for (var e = 0; e < ev.length; e++) {
            var tient = age(cadet.d, ev[e]) >= age(aine.d, ev[e]) / 2 + 7;
            if (tient && !etat) r.dateRegle = ev[e];
            etat = tient;
          }
        }
      }
    }

    // L'écart affiché change d'un an entre l'anniversaire de l'aîné et celui
    // du cadet (tant que l'aîné a déjà eu le sien et pas encore le cadet).
    if (r.ecart.mois || r.ecart.jours) {
      var veille = depuisUtc(Date.UTC(2027, cadet.d.m - 1, cadet.d.j) - JOUR_MS);   // 2027 : année sans 29 février
      r.annee = { du: { j: aine.d.j, m: aine.d.m }, au: { j: veille.j, m: veille.m }, haut: r.ecart.ans + 1, bas: r.ecart.ans };
    }

    // Les âges additionnés : t = milieu des deux naissances + n/2 années
    var milieu = depuisUtc(utc(aine.d) + Math.floor(r.ecartJours / 2) * JOUR_MS);
    for (var c = 0; c < CUMULS.length; c++) {
      var t = moisVersaire(milieu, CUMULS[c] / 2 * 12);
      var dans = ecartJours(ref, t);
      if (dans >= 0) { r.cumul = { n: CUMULS[c], date: t, dans: dans }; break; }
    }
    return r;
  }

  // ── Le formulaire ─────────────────────────────────────────
  function option(valeur, texte, choisi) {
    var o = document.createElement('option');
    o.value = valeur; o.textContent = texte;
    if (choisi) o.selected = true;
    return o;
  }
  function remplirSelects(suffixe) {
    var mois = tr('form.mois', []), an = aujourdhui().a, i;
    var sj = el('da-jour-' + suffixe), sm = el('da-mois-' + suffixe), sa = el('da-annee-' + suffixe);
    sj.appendChild(option('', tr('form.jour', 'Jour'), true));
    for (i = 1; i <= 31; i++) sj.appendChild(option(String(i), String(i)));
    sm.appendChild(option('', tr('form.moisLabel', 'Mois'), true));
    for (i = 0; i < 12; i++) sm.appendChild(option(String(i + 1), mois[i] || String(i + 1)));
    sa.appendChild(option('', tr('form.annee', 'Année'), true));
    for (i = an; i >= an - ANS_MAX; i--) sa.appendChild(option(String(i), String(i)));
  }
  function lirePersonne(s) {
    return {
      d: { j: parseInt(el('da-jour-' + s).value, 10), m: parseInt(el('da-mois-' + s).value, 10), a: parseInt(el('da-annee-' + s).value, 10) },
      nom: nomPropre(el('da-nom-' + s).value)
    };
  }
  function poserPersonne(s, p) {
    el('da-jour-' + s).value = String(p.d.j); el('da-mois-' + s).value = String(p.d.m); el('da-annee-' + s).value = String(p.d.a);
    el('da-nom-' + s).value = p.nom || '';
  }

  // ── Mémoire et lien ───────────────────────────────────────
  function memoriser(moi, autre) {
    try { localStorage.setItem(CLE_STOCK, JSON.stringify({ a: iso(moi.d), b: iso(autre.d), na: moi.nom, nb: autre.nom })); } catch (e) {}
  }
  function lireMemoire() {
    try {
      var x = JSON.parse(localStorage.getItem(CLE_STOCK) || 'null');
      var a = x && depuisIso(x.a), b = x && depuisIso(x.b);
      return a && b ? { moi: { d: a, nom: nomPropre(x.na) }, autre: { d: b, nom: nomPropre(x.nb) } } : null;
    } catch (e) { return null; }
  }
  function lireLien() {
    var p;
    try { p = new URLSearchParams(location.search || ''); } catch (e) { return null; }
    var a = depuisIso(p.get('a')), b = depuisIso(p.get('b'));
    return a && b ? { moi: { d: a, nom: nomPropre(p.get('na')) }, autre: { d: b, nom: nomPropre(p.get('nb')) } } : null;
  }
  function lienDeLEcart(r) {
    var q = '?a=' + iso(r.moi.d) + '&b=' + iso(r.autre.d);
    if (r.moi.nom) q += '&na=' + encodeURIComponent(r.moi.nom);
    if (r.autre.nom) q += '&nb=' + encodeURIComponent(r.autre.nom);
    return location.origin + location.pathname + q;
  }

  // ── L'affichage ───────────────────────────────────────────
  var courant = null;

  // Qui a de plus que qui : « vous », « votre partenaire » ou un prénom.
  function phrasePrincipale(r) {
    var ecart = dureeLisible(r.ecart);
    var objet = function (p, estMoi) {
      if (p.nom) return remplir(tr('resultat.objNom', '{{nom}}'), { nom: p.nom });
      return estMoi ? tr('resultat.objVous', 'vous') : tr('resultat.objPartenaire', 'votre partenaire');
    };
    if (r.aineEstMoi && !r.moi.nom) {
      return remplir(tr('resultat.plusVous', ''), { ecart: ecart, autre: objet(r.autre, false) });
    }
    var sujet = r.aineEstMoi ? r.moi.nom : (r.autre.nom || tr('resultat.sujPartenaire', 'Votre partenaire'));
    var cadet = r.aineEstMoi ? objet(r.autre, false) : objet(r.moi, true);
    return majuscule(remplir(tr('resultat.plusNom', ''), { aine: sujet, ecart: ecart, cadet: cadet }));
  }

  function afficher(r, options) {
    var html = '<div class="dn-verdict quiz-result-card da-carte">';
    if (r.meme) {
      html += '<p class="da-etiquette">' + echapper(tr('resultat.memeTitre', '')) + '</p>' +
        '<p class="da-phrase">' + echapper(tr('resultat.memeJour', '')) + '</p></div>';
    } else {
      var bande = tr('resultat.bandes', [])[r.bande] || {};
      html += '<p class="da-etiquette">' + echapper(bande.titre || '') + '</p>' +
        '<h2 class="da-ecart">' + echapper(dureeLisible(r.ecart)) + '</h2>' +
        '<p class="da-phrase">' + echapper(phrasePrincipale(r)) + '</p>';
      if (!r.mineur && bande.texte) html += '<p class="da-commentaire">' + echapper(bande.texte) + '</p>';
      html += '</div>';

      // La règle de la moitié plus sept, ou la note de prudence
      if (r.mineur) {
        html += '<section class="dn-bloc da-mineur" role="note"><p>' + echapper(tr('resultat.mineur', '')) + '</p></section>';
      } else if (!r.deuxMineurs) {
        html += '<section class="dn-bloc"><h3 class="dn-bloc-titre">' + echapper(tr('resultat.regleTitre', '')) + '</h3>' +
          '<p class="da-formule">' + echapper(remplir(tr('resultat.regleCalcul', '{{age}} ÷ 2 + 7 = {{min}}'), {
            age: nombre(r.ageAine), min: nombre(r.min, 1)
          })) + '</p>' +
          '<p>' + echapper(remplir(tr('resultat.regleExplique', ''), { age: nombre(r.ageAine), min: nombre(r.min, 1) })) + '</p>' +
          '<p class="da-verdict-regle da-verdict-regle--' + (r.regleOk ? 'ok' : 'non') + '">' +
          echapper(elisions(remplir(tr(r.regleOk ? 'resultat.regleOk' : 'resultat.regleNon', ''), {
            jeune: nombre(r.ageCadet), date: r.dateRegle ? dateLisible(r.dateRegle) : ''
          }))) + '</p></section>';
      }

      // Ce que disent les deux dates
      var faits = [];
      faits.push(remplir(tr('resultat.naissance', ''), { ecart: dureeLisible(r.ecart), jours: avecUnite('jour', r.ecartJours) }));
      if (r.annee) {
        // Moins d'un an d'écart : le reste de l'année, vous avez le même âge.
        faits.push(remplir(tr(r.annee.bas === 0 ? 'resultat.anneeMemeAge' : 'resultat.annee', ''), {
          du: jourMois(r.annee.du.j, r.annee.du.m), au: jourMois(r.annee.au.j, r.annee.au.m),
          haut: avecUnite('an', r.annee.haut), bas: avecUnite('an', r.annee.bas)
        }));
      } else {
        faits.push(remplir(tr('resultat.anneeConstante', ''), { n: avecUnite('an', r.ecart.ans) }));
      }
      if (r.cumul) {
        faits.push(r.cumul.dans === 0
          ? remplir(tr('resultat.cumulAujourdhui', ''), { n: nombre(r.cumul.n) })
          : remplir(tr('resultat.cumul', ''), { n: nombre(r.cumul.n), date: dateAvecJour(r.cumul.date), dans: quand(r.cumul.dans) }));
      }
      html += '<section class="dn-bloc"><h3 class="dn-bloc-titre">' + echapper(tr('resultat.faitsTitre', '')) + '</h3><ul class="da-faits">';
      faits.forEach(function (f) { html += '<li>' + echapper(majuscule(elisions(f))) + '</li>'; });
      html += '</ul></section>';
    }

    var sortie = el('da-resultat');
    sortie.innerHTML = html;
    sortie.classList.remove('hidden');
    el('da-formulaire').classList.add('hidden');
    el('da-suite').classList.remove('hidden');
    courant = r;

    function versLeResultat() {
      var haut = racine.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: haut, behavior: 'smooth' });
    }
    // Un écart rouvert depuis un favori ou un lien n'est pas un résultat
    // qu'on vient d'obtenir : pas d'adresse de résultat, pas de défilement.
    if (options && options.silencieux) return;
    if (window.QCResultat) {
      window.QCResultat.arrivee(sortie, { lang: document.documentElement.lang || LANG, apres: versLeResultat });
    } else {
      versLeResultat();
    }
  }

  function calculer() {
    var moi = lirePersonne('1'), autre = lirePersonne('2'), erreur = el('da-erreur'), probleme = '';
    var auj = aujourdhui();
    [moi, autre].forEach(function (p) {
      if (probleme) return;
      if (!p.d.j || !p.d.m || !p.d.a) probleme = tr('form.erreurVide', '');
      else if (!dateValide(p.d)) probleme = tr('form.erreur', '');
      else if (utc(p.d) > utc(auj)) probleme = tr('form.erreurFutur', '');
    });
    if (probleme) {
      erreur.textContent = probleme;
      erreur.classList.remove('hidden');
      return;
    }
    erreur.classList.add('hidden');
    memoriser(moi, autre);
    afficher(calcul(moi, autre));
  }

  function modifier() {
    if (window.QCResultat) window.QCResultat.retour();
    el('da-resultat').classList.add('hidden');
    el('da-suite').classList.add('hidden');
    el('da-formulaire').classList.remove('hidden');
    var haut = racine.getBoundingClientRect().top + window.pageYOffset - 80;
    window.scrollTo({ top: haut, behavior: 'smooth' });
  }

  function confirmer(texte) {
    var c = el('da-copie');
    if (!c) return;
    c.textContent = texte;
    c.classList.remove('hidden');
    clearTimeout(confirmer.t);
    confirmer.t = setTimeout(function () { c.classList.add('hidden'); }, 2600);
  }
  function copierLeLien() {
    if (!courant) return;
    var url = lienDeLEcart(courant), message = tr('resultat.lienCopie', '');
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
  remplirSelects('1');
  remplirSelects('2');
  el('da-lancer').addEventListener('click', calculer);
  el('da-refaire').addEventListener('click', modifier);
  el('da-copier').addEventListener('click', copierLeLien);

  // Le lien l'emporte sur la mémoire du navigateur : c'est lui qu'on a ouvert.
  var connu = lireLien() || lireMemoire();
  if (connu && utc(connu.moi.d) <= utc(aujourdhui()) && utc(connu.autre.d) <= utc(aujourdhui())) {
    poserPersonne('1', connu.moi);
    poserPersonne('2', connu.autre);
    memoriser(connu.moi, connu.autre);
    afficher(calcul(connu.moi, connu.autre), { silencieux: true });
  }

  // Pour les essais : le calcul exposé, sans rien afficher.
  window.QCEcartAge = { calcul: calcul };
})();
