/* Le thème astral de couple : la page de vente, l'aperçu du ciel, le
 * paiement et l'arrivée du rapport.
 *
 * - Les prénoms et les signes viennent du test des signes astrologiques
 *   (qc-astro-couple, posé par la carte sous son résultat, 24 heures), les
 *   genres des prénoms gardés du site (qc-joueurs). Sans eux, la page parle
 *   à « Vous » et « Votre moitié ».
 * - La scène (js/astro-scene.js) avance avec le défilement ; ce fichier fait
 *   apparaître ses légendes au bon moment.
 * - Les dates de naissance donnent tout de suite le ciel du couple
 *   (js/astro-ciel.js, le même calcul que la fonction serveur) : la roue, les
 *   planètes de chacun et le profil. Le reste du rapport est payant.
 * - Le paiement : action `creer` puis `payer` de la fonction `astro`, page de
 *   Stripe ; au retour (?paiement=…&r=…), `verifier`, puis le rapport.
 * - Le rapport s'ouvre aussi par son lien (#r=<id>&t=<jeton>), celui de
 *   l'e-mail : js/astro-rapport.js le dessine.
 */
(function () {
  'use strict';
  var CFG = window.QC_ASTRO || {};
  var T = CFG.textes || {};
  var page = document.getElementById('as-page');
  if (!page) return;

  // Le rapport s'ouvre dès l'arrivée (retour de Stripe, lien de l'e-mail) :
  // la page de vente ne s'affiche pas et la scène ne se monte pas.
  var arrivee = (function () {
    var h = new URLSearchParams(location.hash.slice(1)), q = new URLSearchParams(location.search);
    return { id: h.get('r') || q.get('r'), jeton: h.get('t'), paiement: q.get('paiement'), annule: q.get('annule') };
  })();
  var modeRapport = !!(arrivee.id && (arrivee.jeton || arrivee.paiement));
  if (modeRapport) page.classList.add('as-mode-rapport');

  var SIGNES = ['belier', 'taureau', 'gemeaux', 'cancer', 'lion', 'vierge', 'balance', 'scorpion', 'sagittaire', 'capricorne', 'verseau', 'poissons'];
  var GLYPHES = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
  var ELEMENTS = ['feu', 'terre', 'air', 'eau'];
  var CLE_COUPLE = 'qc-astro-couple', CLE_COMMANDES = 'qc-astro-commandes', CLE_SAISIE = 'qc-astro-saisie';

  function lireT(chemin, defaut) {
    var o = T;
    var k = chemin.split('.');
    for (var i = 0; i < k.length; i++) { if (o == null) return defaut; o = o[k[i]]; }
    return o == null ? defaut : o;
  }
  function tpl(s, v) { return String(s || '').replace(/\{\{(\w+)\}\}/g, function (_, k) { return v[k] != null ? v[k] : ''; }); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function majuscule(s) { s = String(s || ''); return s.charAt(0).toUpperCase() + s.slice(1); }
  function lireJSON(cle) { try { return JSON.parse(localStorage.getItem(cle) || 'null'); } catch (e) { return null; } }
  function ecrireJSON(cle, v) { try { localStorage.setItem(cle, JSON.stringify(v)); } catch (e) { /* navigation privée */ } }
  function prixTexte(c) {
    var n = (c / 100).toFixed(2);
    return CFG.lang === 'en' ? '€' + n : n.replace('.', ',') + ' €';
  }

  // ── Qui sont les deux personnes ─────────────────────────────
  function prenomPropre(p) { return String(p || '').replace(/\s+/g, ' ').trim().slice(0, 30); }
  var couple = (function () {
    var c = lireJSON(CLE_COUPLE);
    var frais = c && c.t && Date.now() - c.t < 7 * 86400000;
    var j = lireJSON('qc-joueurs');
    var joueurs = j && j.t && Date.now() - j.t < 86400000 && Array.isArray(j.j) ? j.j : [];
    function personne(i, qui) {
      var src = frais && c[qui] ? c[qui] : {};
      var g = joueurs[i] && joueurs[i].g;
      var nomJ = joueurs[i] && prenomPropre(joueurs[i].n);
      var prenom = prenomPropre(src.prenom) || '';
      return {
        prenom: prenom,
        signe: SIGNES.indexOf(src.signe) >= 0 ? src.signe : (qui === 'a' ? 'poissons' : 'lion'),
        connu: !!(prenom && SIGNES.indexOf(src.signe) >= 0),
        genre: nomJ && prenom && nomJ.toLowerCase() === prenom.toLowerCase() && (g === 'femme' || g === 'homme') ? (g === 'femme' ? 'f' : 'm') : null
      };
    }
    return { a: personne(0, 'a'), b: personne(1, 'b') };
  })();
  var inconnuA = lireT('scene.inconnu.a', ''), inconnuB = lireT('scene.inconnu.b', '');
  function nomDe(qui) { return couple[qui].prenom || (qui === 'a' ? inconnuA : inconnuB); }

  // ── Les textes de la scène ──────────────────────────────────
  function remplir() {
    page.querySelectorAll('[data-nom]').forEach(function (el) { el.textContent = nomDe(el.getAttribute('data-nom')); });
    ['a', 'b'].forEach(function (qui) {
      var s = couple[qui].signe, i = SIGNES.indexOf(s);
      var S = lireT('signes.' + s, {}), E = lireT('elements.' + ELEMENTS[i % 4], {});
      var set = function (cle, v) { var el = page.querySelector('[data-texte="' + cle + '"]'); if (el) el.textContent = v; };
      set('kicker-' + qui, tpl(lireT('scene.personne.kicker', ''), { du: S.du || '' }));
      set('signe-' + qui, (S.nom || '') + ' · ' + tpl(lireT('scene.personne.element', ''), { de: E.de || '' }));
      set('ligne-' + qui, S.ligne || '');
      var g = page.querySelector('[data-glyphe="' + qui + '"]');
      if (g) g.textContent = GLYPHES[i] + '︎';
    });
    var ia = SIGNES.indexOf(couple.a.signe), ib = SIGNES.indexOf(couple.b.signe);
    var ea = ELEMENTS[ia % 4], eb = ELEMENTS[ib % 4];
    var titre, texte;
    if (ea === eb) {
      titre = tpl(lireT('scene.elements.titreMeme', ''), { de: lireT('elements.' + ea + '.de', '') });
      texte = lireT('scene.elements.meme', '');
    } else {
      titre = majuscule(tpl(lireT('scene.elements.titre', ''), { leA: lireT('elements.' + ea + '.le', ''), leB: lireT('elements.' + eb + '.le', '') }));
      var paire = [ea, eb].sort().join('_');
      texte = paire === 'air_feu' ? lireT('scene.elements.allie_feu_air', '') : paire === 'eau_terre' ? lireT('scene.elements.allie_terre_eau', '') : lireT('scene.elements.contraste', '');
    }
    var et = page.querySelector('[data-texte="elements-titre"]'); if (et) et.textContent = titre;
    var ex = page.querySelector('[data-texte="elements-texte"]'); if (ex) ex.textContent = texte;
    if (couple.a.prenom && couple.b.prenom) document.title = couple.a.prenom + ' & ' + couple.b.prenom + ' · ' + lireT('scene.intro.kicker', document.title);
  }
  remplir();

  // ── La scène et ses légendes ────────────────────────────────
  var section = document.getElementById('as-scene');
  var etapes = [].slice.call(page.querySelectorAll('.as-etape'));
  var barre = page.querySelector('.as-progression span');
  var reduit = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var largeur = function () { return window.innerWidth >= 900; };
  function legendes(p) {
    var grand = largeur();
    etapes.forEach(function (el) {
      var de = parseFloat(el.getAttribute('data-de')), a = parseFloat(el.getAttribute('data-a'));
      var entree = Math.min(1, Math.max(0, (p - de) / 0.035));
      var sortie = Math.min(1, Math.max(0, (a - p) / 0.035));
      if (de <= 0) entree = 1;
      var o = Math.min(entree, sortie);
      var dy = (1 - entree) * 18 - (1 - sortie) * 14;
      el.style.opacity = o.toFixed(3);
      var centre = el.classList.contains('as-etape--intro') || el.classList.contains('as-etape--final');
      var base = grand ? (centre ? (el.classList.contains('as-etape--final') ? 'translate3d(-50%,0,0)' : 'translate3d(-50%,-50%,0)') : 'translate3d(0,-50%,0)')
        : (el.classList.contains('as-etape--intro') ? 'translate3d(0,-50%,0)' : '');
      el.style.transform = base + ' translate3d(0,' + dy.toFixed(1) + 'px,0)';
      el.classList.toggle('est-visible', o > 0.5);
    });
    if (barre) barre.parentNode.style.setProperty('--p', p.toFixed(4));
  }

  function monterScene(donnees) {
    if (!window.QCAstroScene || !section) return;
    var html = function (qui) {
      var i = SIGNES.indexOf(couple[qui].signe);
      return esc(nomDe(qui)) + ' <small>' + GLYPHES[i] + '︎ ' + esc(lireT('signes.' + couple[qui].signe + '.nom', '')) + '</small>';
    };
    var scene = window.QCAstroScene.monter(section, {
      donnees: donnees,
      a: { signe: couple.a.signe, signeIndex: SIGNES.indexOf(couple.a.signe), html: html('a') },
      b: { signe: couple.b.signe, signeIndex: SIGNES.indexOf(couple.b.signe), html: html('b') },
      surProgression: legendes
    });
    if (!scene) page.classList.add('as-sans-gl');
  }
  if (reduit) page.classList.add('as-statique');
  legendes(0);
  if (!modeRapport) fetch('/astro/constellations.json').then(function (r) { return r.json(); }).then(monterScene).catch(function () { page.classList.add('as-sans-gl'); });

  // Les liens internes de la page glissent jusqu'à leur section.
  page.addEventListener('click', function (e) {
    var a = e.target.closest('[data-vers]');
    if (!a) return;
    var cible = document.getElementById(a.getAttribute('data-vers'));
    if (!cible) return;
    e.preventDefault();
    cible.scrollIntoView({ behavior: reduit ? 'auto' : 'smooth', block: 'start' });
    var champ = cible.querySelector('input, select');
    if (champ && a.getAttribute('data-vers') === 'as-dates') setTimeout(function () { try { champ.focus({ preventScroll: true }); } catch (x) { /* rien */ } }, 650);
  });

  // ── Le formulaire des dates ─────────────────────────────────
  var form = document.getElementById('as-formulaire');
  var saisie = lireJSON(CLE_SAISIE) || {};
  function champ(nom) { return form.querySelector('[name="' + nom + '"]'); }
  ['a', 'b'].forEach(function (qui) {
    var s = saisie[qui] || {};
    champ('prenom-' + qui).value = couple[qui].prenom || s.prenom || '';
    var g = couple[qui].genre || s.genre || null;
    form.querySelectorAll('.est-' + qui + ' .as-genre-btn').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-genre') === g));
      b.addEventListener('click', function () {
        form.querySelectorAll('.est-' + qui + ' .as-genre-btn').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        b.closest('.as-genre').classList.remove('as-manque');
      });
    });
    if (s.date) {
      var d = s.date.split('-');
      champ('annee-' + qui).value = String(Number(d[0]));
      champ('mois-' + qui).value = String(Number(d[1]));
      champ('jour-' + qui).value = String(Number(d[2]));
    }
    if (s.heure) champ('heure-' + qui).value = s.heure;
  });

  function lirePersonne(qui) {
    var prenom = prenomPropre(champ('prenom-' + qui).value);
    var b = form.querySelector('.est-' + qui + ' .as-genre-btn[aria-pressed="true"]');
    var j = Number(champ('jour-' + qui).value), m = Number(champ('mois-' + qui).value), a = Number(champ('annee-' + qui).value);
    var heure = champ('heure-' + qui).value || '';
    var date = a && m && j ? a + '-' + String(m).padStart(2, '0') + '-' + String(j).padStart(2, '0') : '';
    return { prenom: prenom, genre: b ? b.getAttribute('data-genre') : null, date: date, heure: /^\d{2}:\d{2}$/.test(heure) ? heure : null };
  }
  function erreur(qui, cle, el) {
    var p = form.querySelector('[data-erreur="' + qui + '"]');
    p.textContent = lireT('dates.erreurs.' + cle, '');
    p.hidden = false;
    if (el) { el.classList.add('as-manque'); }
    return false;
  }
  function valider(qui, v) {
    var p = form.querySelector('[data-erreur="' + qui + '"]');
    p.hidden = true;
    form.querySelectorAll('.est-' + qui + ' .as-manque').forEach(function (x) { x.classList.remove('as-manque'); });
    if (!v.prenom) return erreur(qui, 'prenom', champ('prenom-' + qui));
    if (!v.genre) return erreur(qui, 'genre', form.querySelector('.est-' + qui + ' .as-genre'));
    if (!v.date || !window.QCAstroCiel || !window.QCAstroCiel.dateValide(v.date)) return erreur(qui, 'date', champ('jour-' + qui).closest('.as-date'));
    if (new Date(v.date + 'T00:00:00') > new Date()) return erreur(qui, 'futur', champ('annee-' + qui));
    return true;
  }

  var FUSEAU = (function () { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Paris'; } catch (e) { return 'Europe/Paris'; } })();
  var ZONE = (function () {
    var f = FUSEAU;
    if (/^America\/(Mexico_City|Cancun|Merida|Monterrey|Matamoros|Chihuahua|Ciudad_Juarez|Ojinaga|Mazatlan|Bahia_Banderas|Hermosillo|Tijuana|Ensenada|Santa_Isabel|Guatemala|Belize|Tegucigalpa|El_Salvador|Managua|Costa_Rica|Panama|Havana|Santo_Domingo|Port-au-Prince|Bogota|Caracas|Guayaquil|Lima|La_Paz|Santiago|Punta_Arenas|Asuncion|Montevideo|Buenos_Aires|Catamarca|Cordoba|Jujuy|Mendoza|Rosario|Sao_Paulo|Araguaina|Bahia|Belem|Boa_Vista|Campo_Grande|Cuiaba|Eirunepe|Fortaleza|Maceio|Manaus|Noronha|Porto_Velho|Recife|Rio_Branco|Santarem|Porto_Acre)$/.test(f)
      || /^(America\/Argentina|Mexico|Brazil|Chile)\//.test(f) || f === 'Cuba' || f === 'Pacific/Galapagos' || f === 'Pacific/Easter') return 'latam';
    return '';
  })();
  var PRIX = ZONE && CFG.prixRegions && CFG.prixRegions[ZONE] ? CFG.prixRegions[ZONE] : CFG.prix;

  var personnes = null, ciel = null;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var a = lirePersonne('a'), b = lirePersonne('b');
    var okA = valider('a', a), okB = valider('b', b);
    if (!okA || !okB) {
      var premier = form.querySelector('.as-manque');
      if (premier) premier.scrollIntoView({ behavior: reduit ? 'auto' : 'smooth', block: 'center' });
      return;
    }
    ecrireJSON(CLE_SAISIE, { a: a, b: b });
    personnes = [a, b];
    ciel = window.QCAstroCiel.cielDuCouple([
      { date: a.date, heure: a.heure, fuseau: FUSEAU },
      { date: b.date, heure: b.heure, fuseau: FUSEAU }
    ], new Date());
    afficherCiel();
  });

  // ── L'aperçu du ciel ────────────────────────────────────────
  var PLANETES = ['soleil', 'lune', 'mercure', 'venus', 'mars'];
  var GLYPHES_P = { soleil: '☉', lune: '☽', mercure: '☿', venus: '♀', mars: '♂' };
  function nomSigne(i) { return lireT('signes.' + SIGNES[i] + '.nom', SIGNES[i]); }

  function afficherCiel() {
    var sCiel = document.getElementById('as-ciel'), sPrix = document.getElementById('as-prix');
    var roue = document.getElementById('as-roue');
    roue.innerHTML = window.QCAstroRoue ? window.QCAstroRoue.svg(ciel, { lecteur: lireT('ciel.titre', '') }) : '';
    var pl = document.getElementById('as-placements');
    pl.innerHTML = ['a', 'b'].map(function (qui, k) {
      var th = ciel.themes[k], p = personnes[k];
      return '<div class="as-placement est-' + qui + '"><h3>' + esc(p.prenom) + '</h3><ul>' + PLANETES.map(function (n) {
        var x = th.planetes[n];
        var doute = x.doute && x.doute.length > 1;
        var signe = doute ? tpl(lireT('ciel.doute', ''), { x: nomSigne(x.doute[0]), y: nomSigne(x.doute[1]) }) : nomSigne(x.signe);
        return '<li' + (doute ? ' class="est-doute"' : '') + '><b>' + GLYPHES_P[n] + '︎</b>' + esc(lireT('ciel.planetes.' + n, n)) + ' <span>' + esc(signe) + '</span></li>';
      }).join('') + '</ul></div>';
    }).join('');
    var A = lireT('ciel.archetypes.' + ciel.profil.archetype, {});
    document.getElementById('as-profil').innerHTML =
      '<p class="as-kicker">' + esc(lireT('ciel.profilKicker', '')) + '</p>' +
      '<p class="as-profil-nom">' + esc(A.nom || '') + '</p>' +
      '<p class="as-profil-ligne">' + esc(A.ligne || '') + '</p>' +
      '<div class="as-jauges">' +
      jauge(lireT('ciel.douceur', ''), ciel.profil.douceur, '') +
      jauge(lireT('ciel.etincelle', ''), ciel.profil.etincelle, ' as-jauge--etincelle') + '</div>';
    var verrou = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
    var chap = lireT('contenu.chapitres', []);
    document.getElementById('as-verrou').innerHTML = [2, 3, 6].map(function (i) {
      var c = chap[i] || {};
      return '<div class="as-verrou-carte"><span class="as-verrou-badge">' + verrou + esc(lireT('ciel.verrou', '')) + '</span><h3>' + esc(c.t || '') + '</h3>' +
        '<div class="as-verrou-lignes" aria-hidden="true"><p>' + esc(c.d || '') + ' ' + esc(c.d || '') + '</p><p>' + esc(c.d || '') + '</p></div></div>';
    }).join('');
    sCiel.hidden = false; sPrix.hidden = false;
    var montant = prixTexte(PRIX);
    document.getElementById('as-prix-montant').textContent = montant;
    document.getElementById('as-payer-prix').textContent = montant;
    document.getElementById('as-prix-region').hidden = !(ZONE && PRIX !== CFG.prix);
    sCiel.scrollIntoView({ behavior: reduit ? 'auto' : 'smooth', block: 'start' });
    compter('ciel_vu');
  }
  function jauge(nom, v, cl) {
    return '<div><div class="as-jauge-tete"><span>' + esc(nom) + '</span><b>' + v + '</b></div><div class="as-jauge' + cl + '"><span style="width:' + v + '%"></span></div></div>';
  }
  document.getElementById('as-modifier').addEventListener('click', function () {
    document.getElementById('as-dates').scrollIntoView({ behavior: reduit ? 'auto' : 'smooth', block: 'start' });
  });

  // ── Le serveur ──────────────────────────────────────────────
  function appel(action, corps) {
    return fetch(CFG.fonction, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: CFG.cle || '', Authorization: 'Bearer ' + (CFG.cle || '') },
      body: JSON.stringify(Object.assign({ action: action, lang: CFG.lang, zone: ZONE }, corps || {}))
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) { j.__statut = r.status; return j; });
    });
  }
  var compte = {};
  function compter(etape) {
    if (compte[etape]) return;
    compte[etape] = true;
    try {
      if (navigator.webdriver || localStorage.getItem('qc-no-track')) return;
    } catch (e) { /* rien */ }
    appel('vue', { etape: etape }).catch(function () { /* la mesure ne bloque rien */ });
  }
  if (!modeRapport) compter(couple.a.connu ? 'page_vue_test' : 'page_vue');

  // ── Le paiement ─────────────────────────────────────────────
  var bouton = document.getElementById('as-payer');
  var errPrix = document.getElementById('as-erreur-prix');
  bouton.addEventListener('click', function () {
    var majeur = document.getElementById('as-majeur'), ren = document.getElementById('as-renonciation');
    errPrix.hidden = true;
    [majeur, ren].forEach(function (c) { c.closest('.as-case').classList.toggle('as-manque', !c.checked); });
    if (!majeur.checked || !ren.checked) { errPrix.textContent = lireT('prix.erreurCases', ''); errPrix.hidden = false; return; }
    if (!personnes) return;
    bouton.disabled = true;
    compter('paiement_clic');
    appel('creer', {
      personnes: personnes.map(function (p) { return { prenom: p.prenom, genre: p.genre, date: p.date, heure: p.heure, fuseau: FUSEAU }; }),
      source: couple.a.connu ? 'test' : 'direct'
    }).then(function (r) {
      if (!r.id || !r.jeton) throw new Error('creer');
      var commandes = lireJSON(CLE_COMMANDES) || {};
      commandes[r.id] = r.jeton;
      ecrireJSON(CLE_COMMANDES, commandes);
      return appel('payer', { id: r.id, jeton: r.jeton, majeur: true, renonciation: true });
    }).then(function (r) {
      if (!r.url) throw new Error('payer');
      window.location.href = r.url;
    }).catch(function () {
      bouton.disabled = false;
      errPrix.textContent = lireT('prix.erreurServeur', '');
      errPrix.hidden = false;
    });
  });

  // ── Le rapport : retour de Stripe ou lien de l'e-mail ───────
  // La feuille et le script du rapport ne se chargent qu'ici.
  function chargerRapport() {
    var v = CFG.v ? '?v=' + encodeURIComponent(CFG.v) : '';
    var css = new Promise(function (ok) {
      if (document.getElementById('as-rapport-css')) return ok();
      var l = document.createElement('link');
      l.rel = 'stylesheet'; l.id = 'as-rapport-css'; l.href = '/css/astro-rapport.css' + v;
      l.onload = ok; l.onerror = ok;
      document.head.appendChild(l);
    });
    var js = new Promise(function (ok, ko) {
      if (window.QCAstroRapport) return ok();
      var s = document.createElement('script');
      s.src = '/js/astro-rapport.js' + v; s.onload = ok; s.onerror = ko;
      document.head.appendChild(s);
    });
    return Promise.all([css, js]);
  }
  function ouvrirRapport(id, jeton, apresPaiement) {
    page.classList.add('as-mode-rapport');
    var zone = document.getElementById('as-rapport');
    zone.hidden = false;
    zone.innerHTML = '<div class="as-attente" role="status"><span class="as-attente-astre" aria-hidden="true"></span><p>' +
      esc(lireT(apresPaiement ? 'rapport.attente' : 'rapport.chargement', '')) + '</p></div>';
    var essai = 0;
    function lire() {
      return appel('rapport', { id: id, jeton: jeton }).then(function (r) {
        if (r.__statut === 402 && apresPaiement && essai++ < 8) return new Promise(function (ok) { setTimeout(ok, 1500); }).then(lire);
        return r;
      });
    }
    Promise.all([chargerRapport(), lire()]).then(function (res) {
      var r = res[1];
      if (!r || !r.rapport) throw new Error('rapport');
      var P = r.rapport.personnes;
      document.title = P[0].prenom + ' & ' + P[1].prenom + ' · ' + lireT('rapport.kicker', document.title);
      window.QCAstroRapport.afficher(zone, r.rapport, T, {
        supprimer: function () {
          return appel('supprimer', { id: id, jeton: jeton }).then(function (x) {
            if (!x || !x.supprime) throw new Error('supprimer');
            var c = lireJSON(CLE_COMMANDES) || {};
            delete c[id];
            ecrireJSON(CLE_COMMANDES, c);
            history.replaceState(null, '', location.pathname);
          });
        }
      });
      window.scrollTo(0, 0);
      compter('rapport_vu');
    }).catch(function () {
      zone.innerHTML = '<div class="as-attente" role="alert"><p>' + esc(lireT('rapport.erreur', '')) + '</p></div>';
    });
  }
  (function () {
    var id = arrivee.id, jeton = arrivee.jeton;
    if (arrivee.paiement && id) {
      var commandes = lireJSON(CLE_COMMANDES) || {};
      jeton = jeton || commandes[id];
      history.replaceState(null, '', location.pathname + (jeton ? '#r=' + id + '&t=' + jeton : ''));
      if (!jeton) { page.classList.remove('as-mode-rapport'); return; }
      appel('verifier', { id: id, jeton: jeton, session: arrivee.paiement }).then(function () { ouvrirRapport(id, jeton, true); }, function () { ouvrirRapport(id, jeton, true); });
      return;
    }
    if (id && jeton) { ouvrirRapport(id, jeton, false); return; }
    // Retour de Stripe sans payer : on retrouve l'aperçu et le prix.
    if (arrivee.annule) {
      history.replaceState(null, '', location.pathname);
      if (saisie.a && saisie.b) setTimeout(function () {
        if (form.requestSubmit) form.requestSubmit(); else form.dispatchEvent(new Event('submit', { cancelable: true }));
      }, 0);
    }
  })();
})();
