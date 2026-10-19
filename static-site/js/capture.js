/* La porte e-mail des écrans de résultat (19 octobre 2026, Thomas : « à la
   fin des tests les plus propices, on montre une partie des résultats, le
   reste est flouté, et dessus : pour déverrouiller le reste des résultats,
   renseignez votre e-mail »). Chargé seulement sur les pages qui portent
   data-capture (CAPTURE_PAGES, config.js : les tests de couple et les quiz à
   résultat). Dès qu'une carte de résultat apparaît, le score et le titre
   restent visibles, tout ce qui suit est flouté et rendu inerte, et un petit
   formulaire s'insère sous le titre : adresse, case de consentement, bouton.
   L'adresse part à la fonction lead-capture ; au 200, tout se déverrouille
   et l'appareil s'en souvient six mois. Quand le serveur ne répond pas, met
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
  var DUREE = 180 * 24 * 3600 * 1000;
  var FONCTION = 'https://lojvajnnvhatfplevyvy.supabase.co/functions/v1/lead-capture';
  var lang = (document.documentElement.lang || 'fr').slice(0, 2).toLowerCase();
  if (['fr', 'en', 'es', 'de', 'it'].indexOf(lang) < 0) lang = 'fr';
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
  // story et suite. Tout ce qui le suit, à chaque niveau jusqu'à la carte,
  // est flouté.
  function trouveTete(carte) {
    var cands = carte.querySelectorAll('h2, h3');
    for (var i = 0; i < cands.length; i++) {
      if (!cands[i].closest('.qr-zone--avis, form, .story-share, .qr-zone--suite, .qr-zone--produits, .qc-porte')) return cands[i];
    }
    return null;
  }
  function suivants(tete, carte) {
    var liste = [];
    var n = tete;
    while (n && n !== carte) {
      var s = n.nextElementSibling;
      while (s) { if (!s.classList.contains('qc-porte')) liste.push(s); s = s.nextElementSibling; }
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

    function ouvrir(enregistre) {
      if (ouverte) return;
      ouverte = true;
      if (enregistre) retenir();
      porte.classList.add('qc-porte--ok');
      floutes.forEach(function (e) {
        e.classList.add('qc-flou--ouvre');
        e.removeAttribute('aria-hidden');
        if ('inert' in e) e.inert = false;
      });
      window.setTimeout(function () {
        floutes.forEach(function (e) { e.classList.remove('qc-flou', 'qc-flou--ouvre'); });
        if (porte.parentNode) porte.parentNode.removeChild(porte);
        document.querySelectorAll('[data-porte]').forEach(function (c) { c.removeAttribute('data-porte'); });
      }, 450);
      try { window.dispatchEvent(new CustomEvent('qc:abonne', { detail: { source: source, enregistre: !!enregistre } })); } catch (e) { /* rien */ }
    }
    porte.ouvrir = ouvrir;
  }

  function construire() {
    var porte = el('div', 'qc-porte');
    porte.setAttribute('role', 'group');
    porte.setAttribute('aria-labelledby', 'qc-porte-titre');
    porte.innerHTML =
      '<div class="qc-porte-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10" width="16" height="11" rx="2.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><path d="M12 14.5v2.5"/></svg></div>' +
      '<p class="qc-porte-sur">' + esc(tx('sur')) + '</p>' +
      '<h3 class="qc-porte-titre" id="qc-porte-titre">' + esc(tx('titre')) + '</h3>' +
      '<p class="qc-porte-texte">' + esc(tx('texte')) + '</p>' +
      '<form class="qc-porte-form" novalidate>' +
        '<input class="qc-porte-email" type="email" name="email" autocomplete="email" inputmode="email" spellcheck="false" placeholder="' + esc(tx('placeholder')) + '" aria-label="E-mail" required>' +
        '<input class="qc-porte-hp" type="text" name="site" tabindex="-1" autocomplete="off" aria-hidden="true">' +
        '<p class="qc-porte-suggestion" hidden><button type="button" class="qc-porte-suggere"></button></p>' +
        '<label class="qc-porte-consent"><input type="checkbox" name="consent"><span>' + esc(tx('consentement')) +
          (CFG.confidentialite ? ' <a href="' + esc(CFG.confidentialite) + '" target="_blank" rel="noopener">' + esc(tx('confidentialite')) + '</a>' : '') + '</span></label>' +
        '<button type="submit" class="btn btn-cta btn-gradient qc-porte-bouton">' + esc(tx('bouton')) + '</button>' +
        '<p class="qc-porte-erreur" role="alert" hidden></p>' +
      '</form>';
    var form = porte.querySelector('form');
    var email = porte.querySelector('.qc-porte-email');
    var consent = porte.querySelector('input[name="consent"]');
    var hp = porte.querySelector('.qc-porte-hp');
    var erreur = porte.querySelector('.qc-porte-erreur');
    var sugg = porte.querySelector('.qc-porte-suggestion');
    var suggBtn = porte.querySelector('.qc-porte-suggere');
    var bouton = porte.querySelector('.qc-porte-bouton');
    var proposition = null;

    function dire(code) {
      var m = tx('erreurs.' + code) || tx('erreurs.format');
      erreur.textContent = m; erreur.hidden = false;
      porte.classList.remove('qc-porte--secoue'); void porte.offsetWidth; porte.classList.add('qc-porte--secoue');
    }
    function taire() { erreur.hidden = true; erreur.textContent = ''; }
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
      if (!consent.checked) { dire('consentement'); consent.focus(); return; }
      taire();
      bouton.disabled = true; var libelle = bouton.textContent; bouton.textContent = tx('envoi') || libelle;
      var corps = { email: v.toLowerCase(), lang: lang, source: source, page: location.pathname, consent: true, hp: hp.value || '' };
      var fini = false;
      var garde = window.setTimeout(function () { if (!fini) { fini = true; porte.ouvrir(false); } }, 8000);
      fetch(FONCTION, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corps), keepalive: true })
        .then(function (r) { return r.json().then(function (j) { return { status: r.status, j: j || {} }; }, function () { return { status: r.status, j: {} }; }); })
        .then(function (rep) {
          if (fini) return; fini = true; window.clearTimeout(garde);
          if (rep.status === 200) { porte.ouvrir(true); return; }
          if (rep.status === 400 && rep.j && rep.j.code && ['format', 'jetable', 'domaine', 'consentement'].indexOf(rep.j.code) >= 0) {
            dire(rep.j.code); bouton.disabled = false; bouton.textContent = libelle; email.focus(); return;
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
