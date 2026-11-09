/* La carte « le bilan célibataire arrive bientôt » (4 novembre 2026, Thomas,
   sur la refonte de l'évaluation seul(e) : pas encore de produit pour les
   célibataires, mais une carte à la fin des tests célibataires pour mesurer
   l'envie, page par page, avant d'en écrire un). Chargé seulement sur les
   pages de la famille des tests célibataires (FAMILLES_NAV.celib, config.js),
   quand l'évaluation est ouverte dans la langue (carteCelibPour, generate.js).

   Dès qu'une carte de résultat apparaît, la carte se pose sous le verdict
   (après l'encart de l'évaluation s'il y en a un), en petit : un titre, une phrase et la
   situation à choisir (jamais en couple, rupture de moins d'un an, histoires
   qui se répètent, autre). Le choix ouvre la suite : les sujets du sondage
   (les mêmes que celui du départ seul(e) de l'évaluation, C.SUJETS_CELIB),
   une autre idée, et l'adresse si on veut être prévenu le jour où il sort,
   avec sa case. La réponse part à l'action `celib` de la fonction bilan,
   avec la page (`src`) et la situation, rangées dans bilan_celib.

   Mesure : la carte vue (la moitié à l'écran) et le premier choix de
   situation, une fois par page et par onglet, comptés par l'action `vue`
   (celib_carte_vue, celib_carte_clic, clé = la page), en requête simple :
   un corps en texte, donc sans requête de pré-vol, la fonction lisant le
   corps en texte avant le JSON. Comme la mesure d'audience, rien n'est
   compté pour le propriétaire (qc-no-track), les robots et les navigateurs
   pilotés. Une personne qui a répondu ne revoit plus la carte pendant trente
   jours, sur aucune page. Textes : app.celib de {lang}/bilan.json
   (window.__QC_CELIB). */
(function () {
  'use strict';
  var CFG = window.__QC_CELIB;
  if (!CFG || !CFG.t || !CFG.t.carte || !CFG.page || !CFG.fonction) return;
  var T = CFG.t;
  var PAGE = String(CFG.page);
  var SUJETS = Array.isArray(CFG.sujets) ? CFG.sujets : [];
  var SITUATIONS = Array.isArray(CFG.situations) ? CFG.situations : [];
  var GRAVES = Array.isArray(CFG.graves) ? CFG.graves : [];
  if (!SUJETS.length || !SITUATIONS.length) return;
  var lang = (document.documentElement.lang || 'fr').slice(0, 2).toLowerCase();
  var CLE_REPONDU = 'qc-celib-repondu';
  var TRENTE_JOURS = 30 * 24 * 3600 * 1000;

  // ── Mémoire ─────────────────────────────────────────────────────────────
  function lire(stock, cle) { try { return window[stock].getItem(cle); } catch (e) { return null; } }
  function ecrire(stock, cle, v) { try { window[stock].setItem(cle, v); return true; } catch (e) { return false; } }
  function dejaRepondu() {
    var at = Number(lire('localStorage', CLE_REPONDU));
    return at > 0 && Date.now() - at < TRENTE_JOURS;
  }
  if (dejaRepondu()) return;

  // ── Ce qu'on ne compte pas (les mêmes règles qu'audience.js) ────────────
  var ROBOTS = /bot|crawl|spider|slurp|headless|phantom|puppeteer|playwright|lighthouse|pagespeed|preview|scrape/i;
  function sansMesure() {
    if (lire('localStorage', 'qc-no-track') === '1') return true;
    if (navigator.webdriver) return true;
    if (ROBOTS.test(navigator.userAgent || '')) return true;
    try { if (window.top !== window.self) return true; } catch (e) { return true; }
    return false;
  }

  // Une requête simple : text/plain, aucun autre en-tête.
  function envoyer(corps, garder) {
    return fetch(CFG.fonction, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: JSON.stringify(corps),
      keepalive: !!garder,
    });
  }
  function compter(quoi) {
    if (sansMesure()) return;
    var cle = 'qc-celib-' + quoi + '-' + PAGE;
    if (lire('sessionStorage', cle)) return;
    ecrire('sessionStorage', cle, '1');
    envoyer({ action: 'vue', quoi: quoi, cle: PAGE }, true).catch(function () { /* la mesure ne bloque rien */ });
  }

  // ── Textes ──────────────────────────────────────────────────────────────
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  // « ? ! : ; » collés à leur mot par une espace insécable (le français les
  // écrit avec une espace ordinaire, et le « ? » d'une question passait seul
  // à la ligne).
  function insecables(s) { return String(s).replace(/ ([?!:;»])/g, ' $1').replace(/« /g, '« '); }
  function tx(cle, vals) {
    var s = cle.split('.').reduce(function (o, k) { return o && o[k] != null ? o[k] : null; }, T);
    s = s == null ? '' : String(s);
    if (vals) Object.keys(vals).forEach(function (k) { s = s.split('{{' + k + '}}').join(vals[k]); });
    return insecables(s);
  }
  function x(cle, vals) { return esc(tx(cle, vals)); }

  // L'adresse : la même forme que le serveur, en plus simple (il tranche), et
  // les fautes de frappe des grands fournisseurs (la table de capture.js), qu'on
  // propose sans les imposer.
  var EMAIL_RE = /^[^\s@]+@([a-z0-9-]+\.)+[a-z]{2,24}$/i;
  var FAUTES = {
    'gmial.com': 'gmail.com', 'gmal.com': 'gmail.com', 'gamil.com': 'gmail.com', 'gnail.com': 'gmail.com', 'gmail.co': 'gmail.com', 'gmail.cm': 'gmail.com', 'gmail.fr': 'gmail.com', 'gmaill.com': 'gmail.com', 'gmai.com': 'gmail.com', 'gmail.con': 'gmail.com', 'gmail.comm': 'gmail.com', 'googlemail.fr': 'googlemail.com',
    'hotmal.com': 'hotmail.com', 'hotmai.com': 'hotmail.com', 'hotmail.co': 'hotmail.com', 'hotmail.cm': 'hotmail.com', 'hotmail.con': 'hotmail.com', 'hotmial.com': 'hotmail.com', 'hotmail.fe': 'hotmail.fr', 'hotmil.fr': 'hotmail.fr', 'hotmai.fr': 'hotmail.fr',
    'outlok.com': 'outlook.com', 'outloo.com': 'outlook.com', 'outlook.co': 'outlook.com', 'outlook.cm': 'outlook.com', 'outlook.f': 'outlook.fr', 'outllok.fr': 'outlook.fr',
    'yaho.com': 'yahoo.com', 'yahooo.com': 'yahoo.com', 'yahoo.co': 'yahoo.com', 'yaho.fr': 'yahoo.fr', 'yahou.fr': 'yahoo.fr',
    'orang.fr': 'orange.fr', 'oranje.fr': 'orange.fr', 'orange.f': 'orange.fr', 'wanado.fr': 'wanadoo.fr', 'wanadoo.f': 'wanadoo.fr', 'laposte.ne': 'laposte.net', 'laposte.fr': 'laposte.net', 'lapost.net': 'laposte.net', 'free.f': 'free.fr', 'sfr.f': 'sfr.fr', 'icloud.co': 'icloud.com', 'iclou.com': 'icloud.com', 'live.f': 'live.fr', 'live.co': 'live.com',
    'gmx.d': 'gmx.de', 'web.d': 'web.de', 'libero.i': 'libero.it', 'alice.i': 'alice.it', 'virgilio.i': 'virgilio.it'
  };

  // ── La carte ────────────────────────────────────────────────────────────
  var ICONE_BIENTOT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
  var ICONE_OK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  var numero = 0;

  function construire() {
    numero++;
    var id = 'qc-celib-' + numero;
    var carte = document.createElement('section');
    carte.className = 'qr-zone qr-zone--celib qc-celib';
    carte.setAttribute('aria-labelledby', id + '-titre');
    carte.innerHTML =
      '<p class="qc-celib-sur">' + ICONE_BIENTOT + '<span>' + x('carte.etiquette') + '</span></p>' +
      '<h3 class="qc-celib-titre" id="' + id + '-titre">' + x('carte.titre') + '</h3>' +
      '<p class="qc-celib-texte">' + x('carte.texte') + '</p>' +
      '<div class="qc-celib-corps">' +
        '<fieldset class="qc-celib-groupe">' +
          '<legend class="qc-celib-question">' + x('carte.situationQuestion') + '</legend>' +
          '<div class="qc-celib-choix qc-celib-choix--situations">' +
          SITUATIONS.map(function (s) {
            return '<label class="qc-celib-option"><input type="radio" name="' + id + '-situation" value="' + esc(s) + '"><span>' + x('carte.situations.' + s) + '</span></label>';
          }).join('') +
          '</div>' +
        '</fieldset>' +
        '<form class="qc-celib-form" novalidate hidden>' +
          '<fieldset class="qc-celib-groupe">' +
            '<legend class="qc-celib-question">' + x('question') + '</legend>' +
            '<div class="qc-celib-choix">' +
            SUJETS.map(function (s) {
              return '<label class="qc-celib-option"><input type="checkbox" name="sujet" value="' + esc(s) + '"><span>' + x('sujets.' + s) + '</span></label>';
            }).join('') +
            '</div>' +
          '</fieldset>' +
          '<label class="qc-celib-lib" for="' + id + '-autre">' + x('autre') + '</label>' +
          '<input class="qc-celib-champ" id="' + id + '-autre" type="text" name="autre" maxlength="300" autocomplete="off">' +
          '<label class="qc-celib-lib" for="' + id + '-email">' + x('email') + '</label>' +
          '<input class="qc-celib-champ" id="' + id + '-email" type="email" name="email" maxlength="254" autocomplete="email" inputmode="email" spellcheck="false">' +
          '<p class="qc-celib-suggestion" hidden><button type="button" class="qc-celib-suggere"></button></p>' +
          '<div class="qc-celib-accord" hidden>' +
            '<label class="qc-celib-case"><input type="checkbox" name="consentement"><span>' + x('consentement') + '</span></label>' +
            '<p class="qc-celib-note">' + x('emailAide') +
              (CFG.confidentialite ? ' <a href="' + esc(CFG.confidentialite) + '" target="_blank" rel="noopener">' + x('confidentialite') + '</a>' : '') + '</p>' +
          '</div>' +
          '<p class="qc-celib-erreur" role="alert" hidden></p>' +
          '<button type="submit" class="btn btn-cta qc-celib-bouton">' + x('envoyer') + '</button>' +
        '</form>' +
      '</div>';
    brancher(carte, id);
    return carte;
  }

  function brancher(carte, id) {
    var corps = carte.querySelector('.qc-celib-corps');
    var form = carte.querySelector('.qc-celib-form');
    var email = form.querySelector('input[name="email"]');
    var autre = form.querySelector('input[name="autre"]');
    var accord = form.querySelector('.qc-celib-accord');
    var consent = form.querySelector('input[name="consentement"]');
    var caseConsent = form.querySelector('.qc-celib-case');
    var erreur = form.querySelector('.qc-celib-erreur');
    var sugg = form.querySelector('.qc-celib-suggestion');
    var suggBtn = form.querySelector('.qc-celib-suggere');
    var bouton = form.querySelector('.qc-celib-bouton');
    var sujetsGroupe = form.querySelector('.qc-celib-groupe');
    var situation = null;
    var proposition = null;

    carte.querySelectorAll('input[name="' + id + '-situation"]').forEach(function (r) {
      r.addEventListener('change', function () {
        if (!r.checked) return;
        situation = r.value;
        if (form.hidden) {
          form.hidden = false;
          compter('celib_carte_clic');
        }
      });
    });

    function dire(cle) {
      erreur.textContent = tx(cle);
      erreur.hidden = false;
    }
    function taire() {
      erreur.hidden = true; erreur.textContent = '';
      caseConsent.classList.remove('qc-celib-case--manque');
      sujetsGroupe.classList.remove('qc-celib-groupe--manque');
    }
    function suggere() {
      var v = email.value.trim().toLowerCase();
      var at = v.lastIndexOf('@');
      var dom = at > 0 ? v.slice(at + 1) : '';
      proposition = FAUTES[dom] ? v.slice(0, at + 1) + FAUTES[dom] : null;
      if (proposition) { suggBtn.textContent = tx('carte.suggestion', { domaine: FAUTES[dom] }); sugg.hidden = false; } else { sugg.hidden = true; }
    }
    email.addEventListener('input', function () {
      taire(); suggere();
      // La case n'a de sens qu'avec une adresse : elle apparaît avec elle.
      accord.hidden = !email.value.trim();
    });
    email.addEventListener('blur', suggere);
    suggBtn.addEventListener('click', function () { if (proposition) { email.value = proposition; sugg.hidden = true; email.focus(); } });
    consent.addEventListener('change', taire);
    form.addEventListener('change', function (ev) { if (ev.target && ev.target.name === 'sujet') taire(); });

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      taire();
      var interets = [];
      form.querySelectorAll('input[name="sujet"]:checked').forEach(function (c) { interets.push(c.value); });
      if (!interets.length) {
        dire('choixManque'); sujetsGroupe.classList.add('qc-celib-groupe--manque');
        var premier = form.querySelector('input[name="sujet"]');
        if (premier) premier.focus();
        return;
      }
      var adresse = email.value.trim().toLowerCase();
      if (adresse && (adresse.length > 254 || !EMAIL_RE.test(adresse))) { dire('carte.emailFaux'); email.focus(); return; }
      if (adresse && !consent.checked) { dire('consentManque'); caseConsent.classList.add('qc-celib-case--manque'); consent.focus(); return; }
      var envoi = { action: 'celib', lang: lang, interets: interets, src: PAGE };
      if (situation) envoi.situation = situation;
      var idee = autre.value.replace(/\s+/g, ' ').trim();
      if (idee) envoi.autre = idee.slice(0, 300);
      if (adresse) { envoi.email = adresse; envoi.consentement = true; }
      bouton.disabled = true;
      var libelle = bouton.textContent;
      bouton.textContent = tx('carte.envoi') || libelle;
      envoyer(envoi, false)
        .then(function (r) { return r.json().then(function (j) { return { statut: r.status, j: j || {} }; }, function () { return { statut: r.status, j: {} }; }); })
        .then(function (rep) {
          if (rep.statut === 200) { merci(adresse && rep.j.email ? adresse : ''); return; }
          bouton.disabled = false; bouton.textContent = libelle;
          if (rep.statut === 400 && rep.j.erreur === 'email') { dire('carte.emailFaux'); email.focus(); return; }
          if (rep.statut === 400 && rep.j.erreur === 'consentement') { dire('consentManque'); caseConsent.classList.add('qc-celib-case--manque'); consent.focus(); return; }
          if (rep.statut === 400 && rep.j.erreur === 'interets') { dire('choixManque'); return; }
          dire('carte.erreur');
        })
        .catch(function () { bouton.disabled = false; bouton.textContent = libelle; dire('carte.erreur'); });
    });

    function merci(adresseGardee) {
      ecrire('localStorage', CLE_REPONDU, String(Date.now()));
      carte.classList.add('qc-celib--merci');
      corps.innerHTML =
        '<div class="qc-celib-merci" role="status">' +
          '<span class="qc-celib-merci-ic">' + ICONE_OK + '</span>' +
          '<p class="qc-celib-merci-titre" tabindex="-1">' + x('merciTitre') + '</p>' +
          '<p class="qc-celib-merci-texte">' + (adresseGardee ? x('merciEmail', { email: adresseGardee }) : x('merci')) + '</p>' +
        '</div>';
      var titre = corps.querySelector('.qc-celib-merci-titre');
      if (titre) try { titre.focus({ preventScroll: true }); } catch (e) { titre.focus(); }
    }
  }

  // ── Où la poser ─────────────────────────────────────────────────────────
  // Sous le verdict, après l'encart de nos offres s'il y en a un : même rang
  // que lui dans le plan du résultat (styles.css, .qr-zone--celib), donc
  // avant le bloc « à faire ensuite » sur téléphone. Sans plan, juste après
  // la carte de résultat.
  function grave(carte) {
    if (!GRAVES.length) return false;
    var texte = carte.textContent || '';
    return GRAVES.some(function (g) { return g && texte.indexOf(g) >= 0; });
  }
  function poser(resultat) {
    if (!resultat || resultat.getAttribute('data-celib') || dejaRepondu()) return;
    resultat.setAttribute('data-celib', '1');
    if (grave(resultat)) return;
    var carte = construire();
    var apres = resultat.querySelector('.qr-zone--produits') || resultat.querySelector('.qr-zone--resultat');
    if (apres && apres.parentNode) apres.insertAdjacentElement('afterend', carte);
    else resultat.insertAdjacentElement('afterend', carte);
    observerLaVue(carte);
  }
  function observerLaVue(carte) {
    if (!('IntersectionObserver' in window)) { compter('celib_carte_vue'); return; }
    var io = new IntersectionObserver(function (entrees) {
      for (var i = 0; i < entrees.length; i++) {
        if (entrees[i].isIntersecting) { io.disconnect(); compter('celib_carte_vue'); return; }
      }
    }, { threshold: 0.5 });
    io.observe(carte);
  }

  function chercher(noeud) {
    if (!noeud || noeud.nodeType !== 1) return;
    if (noeud.classList && noeud.classList.contains('quiz-result-card')) { poser(noeud); return; }
    var c = noeud.querySelector && noeud.querySelector('.quiz-result-card');
    if (c) poser(c);
  }
  var obs = new MutationObserver(function (muts) {
    for (var i = 0; i < muts.length; i++) {
      var ajoutes = muts[i].addedNodes;
      for (var k = 0; k < ajoutes.length; k++) chercher(ajoutes[k]);
    }
  });
  obs.observe(document.body, { childList: true, subtree: true });
  // Une carte déjà là (retour sur un résultat restauré) ?
  document.querySelectorAll('.quiz-result-card').forEach(poser);
})();
