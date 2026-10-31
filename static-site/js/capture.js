/* La porte e-mail des écrans de résultat (19 octobre 2026, Thomas : « à la
   fin des tests les plus propices, on montre une partie des résultats, le
   reste est flouté, et dessus : pour déverrouiller le reste des résultats,
   renseignez votre e-mail »). Chargé seulement sur les pages qui portent
   data-capture (CAPTURE_PAGES, config.js : les tests de couple et les quiz à
   résultat). Dès qu'une carte de résultat apparaît, le score et le titre
   restent visibles, tout ce qui suit est flouté et rendu inerte, et un petit
   formulaire s'insère sous le titre : adresse, case de consentement, bouton.
   L'adresse part à la fonction lead-capture ; au 200, tout se déverrouille
   et l'appareil s'en souvient deux ans. Quand le serveur ne répond pas, met
   plus de huit secondes ou freine l'adresse IP (429), tout se déverrouille
   aussi, sans mémoire : une panne de notre côté ne bloque personne. Seules
   les erreurs que la personne peut corriger (format, adresse jetable,
   domaine inconnu, case) laissent la porte fermée. Les textes viennent du
   gabarit (window.__QC_CAPTURE, common.json `capture`), dans la langue de la
   page ; la langue part avec l'adresse. */
(function () {
  'use strict';
  var body = document.body;
  var source = body.getAttribute('data-capture');
  var CFG = window.__QC_CAPTURE || {};
  var T = CFG.t || {};
  if (!source || !T.titre) return;
  var CLE = 'qc-abonne';
  // Deux ans (Thomas, 19 octobre 2026 : « si une adresse mail est déjà en base,
  // l'utilisateur n'a pas besoin de la ressaisir ») : sur l'appareil qui a
  // donné une adresse, à la fin d'un test ou pour l'e-book, la porte ne se
  // représente plus. Sur un autre appareil, le navigateur remplit l'adresse
  // d'un geste (autocomplete) et une adresse déjà connue est acceptée tout de
  // suite par le serveur, jamais en double.
  var DUREE = 730 * 24 * 3600 * 1000;
  var FONCTION = 'https://lojvajnnvhatfplevyvy.supabase.co/functions/v1/lead-capture';
  var lang = (document.documentElement.lang || 'fr').slice(0, 2).toLowerCase();
  // Le néerlandais, ouvert le 31 octobre 2026, n'a pas encore ses e-mails
  // (lot 8 de docs/langues/CADRAGE-NL.md) ni sa place dans abonnes : une
  // adresse laissée sur une page /nl/ est rangée en anglais, que les
  // Néerlandais et les Flamands lisent bien mieux que le français. On retire
  // cette ligne le jour où le serveur accepte « nl ».
  if (lang === 'nl') lang = 'en';
  if (['fr', 'en', 'es', 'de', 'it'].indexOf(lang) < 0) lang = 'fr'; // langues: sans-nl (le serveur n'accepte que ces cinq-là)
  // La même forme que le serveur, en plus simple : le serveur tranche.
  var EMAIL_RE = /^[^\s@]+@([a-z0-9-]+\.)+[a-z]{2,24}$/i;
  // Les fautes de frappe des grands fournisseurs : on propose, on n'impose pas.
  var FAUTES = {
    'gmial.com': 'gmail.com', 'gmal.com': 'gmail.com', 'gamil.com': 'gmail.com', 'gnail.com': 'gmail.com', 'gmail.co': 'gmail.com', 'gmail.cm': 'gmail.com', 'gmail.fr': 'gmail.com', 'gmaill.com': 'gmail.com', 'gmai.com': 'gmail.com', 'gmail.con': 'gmail.com', 'gmail.comm': 'gmail.com', 'googlemail.fr': 'googlemail.com',
    'hotmal.com': 'hotmail.com', 'hotmai.com': 'hotmail.com', 'hotmail.co': 'hotmail.com', 'hotmail.cm': 'hotmail.com', 'hotmail.con': 'hotmail.com', 'hotmial.com': 'hotmail.com', 'hotmail.fe': 'hotmail.fr', 'hotmil.fr': 'hotmail.fr', 'hotmai.fr': 'hotmail.fr',
    'outlok.com': 'outlook.com', 'outloo.com': 'outlook.com', 'outlook.co': 'outlook.com', 'outlook.cm': 'outlook.com', 'outlook.f': 'outlook.fr', 'outllok.fr': 'outlook.fr',
    'yaho.com': 'yahoo.com', 'yahooo.com': 'yahoo.com', 'yahoo.co': 'yahoo.com', 'yaho.fr': 'yahoo.fr', 'yahou.fr': 'yahoo.fr',
    'orang.fr': 'orange.fr', 'oranje.fr': 'orange.fr', 'orange.f': 'orange.fr', 'wanado.fr': 'wanadoo.fr', 'wanadoo.f': 'wanadoo.fr', 'laposte.ne': 'laposte.net', 'laposte.fr': 'laposte.net', 'lapost.net': 'laposte.net', 'free.f': 'free.fr', 'sfr.f': 'sfr.fr', 'icloud.co': 'icloud.com', 'iclou.com': 'icloud.com', 'live.f': 'live.fr', 'live.co': 'live.com',
    'gmx.d': 'gmx.de', 'web.d': 'web.de', 'libero.i': 'libero.it', 'alice.i': 'alice.it', 'virgilio.i': 'virgilio.it'
  };

  function memoire() {
    try { var m = JSON.parse(localStorage.getItem(CLE) || 'null'); return m && Date.now() - Number(m.at) < DUREE; } catch (e) { return false; }
  }
  function retenir() {
    try { localStorage.setItem(CLE, JSON.stringify({ at: Date.now(), lang: lang })); } catch (e) { /* navigation privée */ }
  }
  if (memoire()) return;

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function tx(cle, vals) {
    var s = cle.split('.').reduce(function (o, k) { return o && o[k] != null ? o[k] : null; }, T);
    s = s == null ? '' : String(s);
    if (vals) Object.keys(vals).forEach(function (k) { s = s.split('{{' + k + '}}').join(vals[k]); });
    return s;
  }

  // La tête du résultat : le premier titre de la carte hors avis, formulaire,
  // story et suite. Tout ce qui le suit, à chaque niveau jusqu'à la zone du
  // résultat (.qr-zone--resultat, posée par dispositionResultat), est flouté.
  // Jamais au-delà : les produits, l'encart de l'évaluation, les actions, les
  // tests à faire ensuite et la story restent nets (20 octobre 2026, Thomas :
  // « ça floute toute la zone même les produits liés, les autres tests »).
  var HORS_PORTE = '.qr-zone--avis, .qr-zone--produits, .qr-zone--actions, .qr-zone--suite, .qr-zone--pub, .story-share, .related-tests-section, .qc-porte';
  function trouveTete(carte) {
    var cands = carte.querySelectorAll('h2, h3');
    for (var i = 0; i < cands.length; i++) {
      if (!cands[i].closest('.qr-zone--avis, form, .story-share, .qr-zone--suite, .qr-zone--produits, .qc-porte')) return cands[i];
    }
    return null;
  }
  function horsPorte(e) {
    return e.classList.contains('qc-porte') || (e.matches && e.matches(HORS_PORTE));
  }
  function suivants(tete, carte) {
    var zone = tete.closest('.qr-zone--resultat') || carte;
    var liste = [];
    var n = tete;
    while (n && n !== zone && zone.contains(n)) {
      var s = n.nextElementSibling;
      while (s) { if (!horsPorte(s)) liste.push(s); s = s.nextElementSibling; }
      n = n.parentElement;
    }
    return liste;
  }

  var ouverte = false;
  function poser(carte) {
    if (ouverte || carte.getAttribute('data-porte')) return;
    var tete = trouveTete(carte);
    if (!tete) return;
    var floutes = suivants(tete, carte);
    if (!floutes.length) return;
    carte.setAttribute('data-porte', '1');
    floutes.forEach(function (e) {
      e.classList.add('qc-flou');
      e.setAttribute('aria-hidden', 'true');
      if ('inert' in e) e.inert = true;
    });
    var porte = construire();
    tete.insertAdjacentElement('afterend', porte);
    // La porte prend la largeur de l'écran et déborde de la carte où elle se
    // glisse : un parent qui coupe ce qui dépasse (la carte rose du résultat
    // des tests à deux, overflow: hidden) la rognerait. Il la laisse dépasser
    // tant qu'elle est là (qc-porte-hote, styles.css).
    var hotes = [];
    for (var a = porte.parentElement; a && a !== carte.parentElement; a = a.parentElement) {
      var cs = window.getComputedStyle(a);
      if (cs.overflowX !== 'visible' || cs.overflowY !== 'visible') hotes.push(a);
    }
    hotes.forEach(function (h) { h.classList.add('qc-porte-hote'); });

    function ouvrir(enregistre, info) {
      if (ouverte) return;
      ouverte = true;
      if (enregistre) retenir();
      // Adresse gardée : la porte devient un mot de merci qui dit ce qu'elle
      // ouvre (Thomas, 20 octobre 2026 : « il faut leur dire que désormais
      // ils ont accès à tous les tests du site et leurs résultats ») et reste
      // affichée ; sans adresse gardée (panne, IP freinée), elle s'efface.
      var merci = !!(enregistre && tx('merci.titre'));
      if (merci) {
        porte.classList.add('qc-porte--merci');
        porte.innerHTML =
          '<div class="qc-porte-ic qc-porte-ic--ok" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>' +
          '<p class="qc-porte-titre" id="qc-porte-titre" role="status">' + esc(tx('merci.titre')) + '</p>' +
          '<p class="qc-porte-texte">' + esc(tx('merci.texte')) + '</p>';
        if (info && info.cle && tx('prenom.label')) champPrenom(porte, info);
      } else {
        porte.classList.add('qc-porte--ok');
      }
      floutes.forEach(function (e) {
        e.classList.add('qc-flou--ouvre');
        e.removeAttribute('aria-hidden');
        if ('inert' in e) e.inert = false;
      });
      window.setTimeout(function () {
        floutes.forEach(function (e) { e.classList.remove('qc-flou', 'qc-flou--ouvre'); });
        if (!merci && porte.parentNode) {
          porte.parentNode.removeChild(porte);
          hotes.forEach(function (h) { h.classList.remove('qc-porte-hote'); });
        }
        document.querySelectorAll('[data-porte]').forEach(function (c) { c.removeAttribute('data-porte'); });
      }, 450);
      try { window.dispatchEvent(new CustomEvent('qc:abonne', { detail: { source: source, enregistre: !!enregistre } })); } catch (e) { /* rien */ }
    }
    porte.ouvrir = ouvrir;
  }

  // Le prénom, facultatif, sur le mot de merci (22 octobre 2026, Thomas :
  // « oui pour le prénom pour personnaliser les e-mails, et ceux qui n'en ont
  // pas on laissera vide ») : demandé après coup, pour ne rien retirer à la
  // porte, et envoyé avec la clé que la réponse de l'adresse vient de rendre
  // (lead-capture, une heure, une fois). Sans réponse du serveur, on n'insiste
  // pas : le champ s'efface.
  var LETTRES = /^[A-Za-zÀ-ÖØ-öø-ÿĀ-žḀ-ỿ\u0370-\u03ff\u0400-\u04ff][A-Za-zÀ-ÖØ-öø-ÿĀ-žḀ-ỿ\u0370-\u03ff\u0400-\u04ff '’.-]{0,39}$/;
  function champPrenom(porte, info) {
    var bloc = el('form', 'qc-porte-prenom');
    bloc.setAttribute('novalidate', '');
    bloc.innerHTML =
      '<label class="qc-porte-prenom-lib" for="qc-porte-prenom">' + esc(tx('prenom.label')) + '</label>' +
      '<div class="qc-porte-prenom-ligne"><input id="qc-porte-prenom" class="qc-porte-email" type="text" name="prenom" maxlength="40" autocomplete="given-name" autocapitalize="words" enterkeyhint="done" spellcheck="false">' +
      '<button type="submit" class="btn btn-outline qc-porte-prenom-bouton">' + esc(tx('prenom.bouton')) + '</button></div>' +
      '<p class="qc-porte-prenom-etat" aria-live="polite">' + esc(tx('prenom.aide')) + '</p>';
    porte.appendChild(bloc);
    var champ = bloc.querySelector('input');
    var etat = bloc.querySelector('.qc-porte-prenom-etat');
    var bouton = bloc.querySelector('button');
    bloc.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var v = champ.value.replace(/\s+/g, ' ').trim();
      if (!v) { champ.focus(); return; }
      if (!LETTRES.test(v)) { etat.textContent = tx('prenom.faux'); etat.classList.add('qc-porte-prenom-etat--faux'); champ.focus(); return; }
      bouton.disabled = true;
      fetch(FONCTION, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'prenom', email: info.email, cle: info.cle, prenom: v }) })
        .then(function (r) { return r.json().then(function (j) { return { status: r.status, j: j || {} }; }, function () { return { status: r.status, j: {} }; }); })
        .then(function (rep) {
          if (rep.status === 200) {
            bloc.innerHTML = '<p class="qc-porte-prenom-merci">' + esc(tx('prenom.merci', { prenom: rep.j.prenom || v })) + '</p>';
            return;
          }
          if (rep.status === 400 && rep.j.code === 'prenom') {
            bouton.disabled = false;
            etat.textContent = tx('prenom.faux'); etat.classList.add('qc-porte-prenom-etat--faux'); champ.focus();
            return;
          }
          if (bloc.parentNode) bloc.parentNode.removeChild(bloc);
        })
        .catch(function () { if (bloc.parentNode) bloc.parentNode.removeChild(bloc); });
    });
  }

  // La porte depuis le 20 octobre 2026 (Thomas : « pour le nombre de visites
  // peu de gens me laissent leur email », « Plus qu'une étape pour découvrir
  // vos résultats complets gratuits ! ») : « vos résultats sont prêts » et une
  // barre presque pleine au lieu du cadenas, le titre de Thomas, le champ, une
  // case courte, le bouton, puis trois choses que l'adresse débloque
  // (`points`) et « pas de spam ». Elle était coincée dans la largeur de la carte (244 px
  // sur un téléphone de 390, 634 px de haut, bouton sur deux lignes, champ
  // sous le pli sur la compatibilité) : la largeur vient maintenant de
  // l'écran (styles.css, --qc-porte-l).
  var COCHE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  function construire() {
    var porte = el('div', 'qc-porte');
    porte.setAttribute('role', 'group');
    porte.setAttribute('aria-labelledby', 'qc-porte-titre');
    var points = Array.isArray(T.points) ? T.points : [];
    porte.innerHTML =
      '<p class="qc-porte-etat">' + COCHE + '<span>' + esc(tx('sur')) + '</span></p>' +
      '<div class="qc-porte-barre" aria-hidden="true"><span></span></div>' +
      '<h3 class="qc-porte-titre" id="qc-porte-titre">' + esc(tx('titre')) + '</h3>' +
      (!points.length && tx('texte') ? '<p class="qc-porte-texte">' + esc(tx('texte')) + '</p>' : '') +
      '<form class="qc-porte-form" novalidate>' +
        '<input class="qc-porte-email" type="email" name="email" autocomplete="email" inputmode="email" enterkeyhint="go" spellcheck="false" placeholder="' + esc(tx('placeholder')) + '" aria-label="' + esc(tx('placeholder') || 'E-mail') + '" required>' +
        '<input class="qc-porte-hp" type="text" name="site" tabindex="-1" autocomplete="off" aria-hidden="true">' +
        '<p class="qc-porte-suggestion" hidden><button type="button" class="qc-porte-suggere"></button></p>' +
        '<label class="qc-porte-consent"><input type="checkbox" name="consent"><span>' + esc(tx('consentement')) +
          (CFG.confidentialite ? ' <a href="' + esc(CFG.confidentialite) + '" target="_blank" rel="noopener">' + esc(tx('confidentialite')) + '</a>' : '') + '</span></label>' +
        '<button type="submit" class="btn btn-cta btn-gradient qc-porte-bouton"><span class="qc-porte-bouton-texte">' + esc(tx('bouton')) + '</span>' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>' +
        '<p class="qc-porte-erreur" role="alert" hidden></p>' +
        // Les trois choses débloquées viennent sous le bouton : au-dessus du
        // champ, elles le poussaient sous le pli d'un téléphone (barre
        // d'adresse comprise, 660 px visibles), alors que le titre promet déjà.
        (points.length ? '<ul class="qc-porte-points">' + points.map(function (p) { return '<li>' + COCHE + '<span>' + esc(p) + '</span></li>'; }).join('') + '</ul>' : '') +
        (tx('note') ? '<p class="qc-porte-note"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg><span>' + esc(tx('note')) + '</span></p>' : '') +
      '</form>';
    var form = porte.querySelector('form');
    var email = porte.querySelector('.qc-porte-email');
    var consent = porte.querySelector('input[name="consent"]');
    var hp = porte.querySelector('.qc-porte-hp');
    var erreur = porte.querySelector('.qc-porte-erreur');
    var sugg = porte.querySelector('.qc-porte-suggestion');
    var suggBtn = porte.querySelector('.qc-porte-suggere');
    var bouton = porte.querySelector('.qc-porte-bouton');
    var boutonTexte = porte.querySelector('.qc-porte-bouton-texte');
    var caseConsent = porte.querySelector('.qc-porte-consent');
    var proposition = null;

    function dire(code) {
      var m = tx('erreurs.' + code) || tx('erreurs.format');
      erreur.textContent = m; erreur.hidden = false;
      porte.classList.remove('qc-porte--secoue'); void porte.offsetWidth; porte.classList.add('qc-porte--secoue');
    }
    function taire() { erreur.hidden = true; erreur.textContent = ''; caseConsent.classList.remove('qc-porte-consent--manque'); }
    function suggere() {
      var v = email.value.trim().toLowerCase();
      var at = v.lastIndexOf('@');
      var dom = at > 0 ? v.slice(at + 1) : '';
      proposition = FAUTES[dom] ? v.slice(0, at + 1) + FAUTES[dom] : null;
      if (proposition) { suggBtn.textContent = tx('suggestion', { domaine: FAUTES[dom] }); sugg.hidden = false; } else { sugg.hidden = true; }
    }
    email.addEventListener('input', function () { taire(); suggere(); });
    email.addEventListener('blur', suggere);
    suggBtn.addEventListener('click', function () { if (proposition) { email.value = proposition; sugg.hidden = true; email.focus(); } });
    consent.addEventListener('change', taire);

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var v = email.value.trim();
      if (!v || v.length > 254 || !EMAIL_RE.test(v) || /\s/.test(v)) { dire('format'); email.focus(); return; }
      if (!consent.checked) { dire('consentement'); caseConsent.classList.add('qc-porte-consent--manque'); consent.focus(); return; }
      taire();
      bouton.disabled = true; var libelle = boutonTexte.textContent; boutonTexte.textContent = tx('envoi') || libelle;
      var corps = { email: v.toLowerCase(), lang: lang, source: source, page: location.pathname, consent: true, hp: hp.value || '' };
      var fini = false;
      var garde = window.setTimeout(function () { if (!fini) { fini = true; porte.ouvrir(false); } }, 8000);
      fetch(FONCTION, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corps), keepalive: true })
        .then(function (r) { return r.json().then(function (j) { return { status: r.status, j: j || {} }; }, function () { return { status: r.status, j: {} }; }); })
        .then(function (rep) {
          if (fini) return; fini = true; window.clearTimeout(garde);
          if (rep.status === 200) { porte.ouvrir(true, { email: corps.email, cle: rep.j && rep.j.cle }); return; }
          if (rep.status === 400 && rep.j && rep.j.code && ['format', 'jetable', 'domaine', 'consentement'].indexOf(rep.j.code) >= 0) {
            dire(rep.j.code); bouton.disabled = false; boutonTexte.textContent = libelle;
            if (rep.j.code === 'consentement') { caseConsent.classList.add('qc-porte-consent--manque'); consent.focus(); } else { email.focus(); }
            return;
          }
          // Autre réponse (IP freinée par la fonction, 429 ; serveur en panne ;
          // fonction absente) : ce n'est pas la faute de la personne, on ouvre,
          // sans mémoire puisque l'adresse n'est pas gardée.
          porte.ouvrir(false);
        })
        .catch(function () { if (fini) return; fini = true; window.clearTimeout(garde); porte.ouvrir(false); });
    });
    return porte;
  }

  function chercher(racine) {
    if (!racine || racine.nodeType !== 1) return;
    if (racine.classList && racine.classList.contains('quiz-result-card')) { poser(racine); return; }
    var carte = racine.querySelector && racine.querySelector('.quiz-result-card');
    if (carte) poser(carte);
  }
  var obs = new MutationObserver(function (muts) {
    if (ouverte) { obs.disconnect(); return; }
    for (var i = 0; i < muts.length; i++) {
      var ajoutes = muts[i].addedNodes;
      for (var k = 0; k < ajoutes.length; k++) chercher(ajoutes[k]);
    }
  });
  obs.observe(document.body, { childList: true, subtree: true });
  // Une carte déjà là (retour sur un résultat restauré) ?
  document.querySelectorAll('.quiz-result-card').forEach(poser);
})();
