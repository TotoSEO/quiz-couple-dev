/* L'évaluation de couple : l'application de la page /evaluation-de-couple/.
   La page est d'abord une présentation ; l'application prend toute la place
   (mode focus, body.bilan-focus) dès qu'on commence ou qu'on arrive par un
   lien. Deux façons de la faire (`mode`) : à deux, chacun répond de son
   côté, sur son téléphone, à une centaine de questions ; seul(e), la
   personne répond pour elle puis dit ce que l'autre répondrait, ou « je ne
   sais pas » (percu, C.INCONNU), sans que l'autre soit prévenu(e). La
   fonction serveur `bilan` garde les réponses. Aucun résultat avant le
   paiement : on paie dès qu'on a fini ses propres réponses, le rapport
   s'ouvre quand tout est répondu (les deux à deux, la personne seule en
   solo) et part en PDF par e-mail. Le calcul est celui du serveur
   (window.QCBilanCoeur, depuis supabase/functions/_shared/bilan/coeur.mjs),
   le rapport le même gabarit que le PDF (window.QCBilanRapport, depuis
   rapport.mjs), les questions arrivent de /js/data/bilan-<lang>.json. En
   solo, les textes de l'interface qui existent sous `solo.<chemin>` dans
   {lang}/bilan.json (app.solo) l'emportent sur `<chemin>`.

   Chacun accède au bilan par son lien personnel (#b=<id>&t=<clé>), que la
   page range aussi dans localStorage (qc-bilans) pour reprendre sans lien sur
   le même appareil. La partie # n'est jamais envoyée à un serveur web ; la
   page la retire de la barre d'adresse dès qu'elle l'a lue.
   Conception : docs/bilan/CONCEPTION.md. */
(function () {
  'use strict';
  var racine = document.getElementById('bilan-app');
  if (!racine) return;

  var CFG = window.BILAN_CONFIG || {};
  var T = CFG.textes || {};
  var LANG = CFG.lang || 'fr';
  var CLE_LOCALE = 'qc-bilans';
  var EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var LOCALES = { fr: 'fr-FR', en: 'en-GB', es: 'es-ES', de: 'de-DE', it: 'it-IT' };
  var SECONDES_PAR_QUESTION = 12;
  var C = null;   // le calcul (window.QCBilanCoeur)
  var Q = null;   // les textes des questions
  var minuteur = null;
  var verifAttente = null;  // la vérification de l'écran d'attente, s'il est affiché
  var S = null;   // la session de réponses en cours
  var MODE = 'duo';  // 'duo' ou 'solo' : la façon de faire l'évaluation affichée
  var modeDemande = null;  // le mode demandé par le bouton de la page ou le lien suivi (arrivee)
  var pdfDemande = false;  // le lien de l'e-mail du rapport demande le PDF tout de suite

  // ── Textes ──────────────────────────────────────────────────────────────

  function lireTexte(o, chemin) {
    var parts = chemin.split('.');
    for (var i = 0; i < parts.length; i++) {
      if (o == null || typeof o !== 'object' || !(parts[i] in o)) return undefined;
      o = o[parts[i]];
    }
    return o;
  }
  // En solo, un texte écrit sous `solo.<chemin>` l'emporte.
  function tr(chemin, defaut) {
    var v;
    if (MODE === 'solo') {
      v = lireTexte(T.solo, chemin);
      if (v != null) return v;
    }
    v = lireTexte(T, chemin);
    return v == null ? defaut : v;
  }
  function remplir(texte, vars) {
    return String(texte == null ? '' : texte).replace(/\{\{(\w+)\}\}/g, function (m, k) {
      return vars && vars[k] != null ? vars[k] : '';
    });
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  // La ponctuation haute collée à son mot, en français seulement.
  function ins(s) {
    if (LANG !== 'fr') return String(s);
    return String(s).replace(/ ([?!:;»])/g, ' $1').replace(/« /g, '« ');
  }
  // Un texte de l'interface, rempli, prêt à écrire dans le HTML.
  function x(chemin, vars) { return esc(ins(remplir(tr(chemin, ''), vars))); }
  // La réduction en cours (CFG.promo, écrite par la page à partir de
  // PROMO_* de coeur.mjs) : le prix habituel barré devant le prix réduit,
  // à la place du prix dans un texte déjà échappé. `confirme` vient du
  // serveur (etat.promo) : l'offre ne montre la réduction que si la page de
  // paiement l'appliquera.
  function promoAffichee(confirme) {
    var p = CFG.promo;
    return p && p.html && p.prix && confirme !== false ? p : null;
  }
  function avecPromo(html, confirme) {
    var p = promoAffichee(confirme);
    return p ? String(html).replace(esc(p.prix), p.html) : html;
  }
  function nombre(n) {
    try { return new Intl.NumberFormat(LOCALES[LANG] || 'fr-FR').format(n); } catch (e) { return String(n); }
  }
  // Un prix en centimes, écrit comme le site l'écrit (formatPrix de generate.js).
  function prixEcrit(centimes) {
    try {
      return new Intl.NumberFormat(LOCALES[LANG] || 'fr-FR', { style: 'currency', currency: 'EUR' }).format(centimes / 100).replace(/[  ]/g, ' ');
    } catch (e) { return (centimes / 100).toFixed(2) + ' €'; }
  }


  // ── Les personnages ─────────────────────────────────────────────────────
  // Même règle que les moteurs : une femme est la rose, un homme le violet,
  // sinon le premier est la rose et le second le violet.

  var BOITES = { rose: [260, 280], violet: [220, 300] };
  function perso(genre, rang) {
    if (genre === 'h') return 'violet';
    if (genre === 'f') return 'rose';
    return rang === 1 ? 'violet' : 'rose';
  }
  function mascotte(nom, pose, hauteur) {
    if (typeof window.mascotte !== 'function' || !window.POSES_MASCOTTES) return '';
    var o = { couleurs: 'hex' }, k;
    var base = window.POSES_MASCOTTES[pose] || window.POSES_MASCOTTES.repos || {};
    for (k in base) o[k] = base[k];
    var saison = document.body.getAttribute('data-saison');
    var deg = saison && window.SAISONS_MASCOTTES && window.SAISONS_MASCOTTES[saison] && window.SAISONS_MASCOTTES[saison][nom];
    if (deg) for (k in deg) o[k] = deg[k];
    var svg;
    try { svg = window.mascotte(nom, o); } catch (e) { return ''; }
    var b = BOITES[nom] || BOITES.rose;
    return svg
      .replace(/^<svg /, '<svg class="qc-masc bilan-masc" aria-hidden="true" focusable="false" ')
      .replace(/ width="\d+" height="\d+"/, ' width="' + Math.round(hauteur * b[0] / b[1]) + '" height="' + hauteur + '"');
  }
  function duo(poseA, poseB, hauteur, genreA, genreB) {
    var html = mascotte(perso(genreA, 0), poseA, hauteur) + mascotte(perso(genreB, 1), poseB, hauteur);
    return html ? '<div class="bilan-duo" aria-hidden="true">' + html + '</div>' : '';
  }

  // ── La mémoire de l'appareil ────────────────────────────────────────────

  function lireListe() {
    try {
      var l = JSON.parse(localStorage.getItem(CLE_LOCALE) || '[]');
      return Array.isArray(l) ? l.filter(function (e) { return e && e.id && e.jeton && e.role; }) : [];
    } catch (e) { return []; }
  }
  function ecrireListe(l) {
    try { localStorage.setItem(CLE_LOCALE, JSON.stringify(l.slice(0, 12))); } catch (e) { /* navigation privée */ }
  }
  function garder(entree) {
    entree.maj = Date.now();
    var l = lireListe().filter(function (e) { return !(e.id === entree.id && e.role === entree.role); });
    l.unshift(entree);
    ecrireListe(l);
  }
  function majEntree(id, role, champs) {
    var l = lireListe();
    l.forEach(function (e) {
      if (e.id === id && e.role === role) { for (var k in champs) e[k] = champs[k]; e.maj = Date.now(); }
    });
    ecrireListe(l);
  }
  function oublier(id, role) {
    ecrireListe(lireListe().filter(function (e) { return !(e.id === id && (!role || e.role === role)); }));
  }
  function entreeRole(id, role) {
    return lireListe().filter(function (e) { return e.id === id && e.role === role; })[0] || null;
  }
  function entreeDe(id) {
    var l = lireListe().filter(function (e) { return e.id === id; });
    return l[0] || null;
  }

  function lienPersonnel(id, jeton) {
    return location.origin + CFG.chemin + '#b=' + id + '&t=' + jeton;
  }

  // ── Le serveur ──────────────────────────────────────────────────────────

  function appel(action, donnees, garderVivant) {
    var corps = { action: action };
    for (var k in (donnees || {})) corps[k] = donnees[k];
    return fetch(CFG.fonction, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: CFG.cle || '', Authorization: 'Bearer ' + (CFG.cle || '') },
      body: JSON.stringify(corps),
      keepalive: !!garderVivant,
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) { return { statut: r.status, json: j || {} }; });
    });
  }

  // ── L'affichage ─────────────────────────────────────────────────────────

  function arreterMinuteur() {
    if (minuteur) { clearInterval(minuteur); minuteur = null; }
    verifAttente = null;
  }
  function afficher(html, garderPosition) {
    arreterMinuteur();
    if (obsColle) { obsColle.disconnect(); obsColle = null; }
    racine.innerHTML = html;
    if (garderPosition) return;
    var haut = racine.getBoundingClientRect().top;
    if (haut < 0 || haut > window.innerHeight * 0.6) {
      var y = window.pageYOffset + haut - 90;
      try { window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' }); } catch (e) { window.scrollTo(0, Math.max(0, y)); }
    }
  }
  function carte(contenu, classe) {
    return '<div class="bilan-carte' + (classe ? ' ' + classe : '') + '">' + contenu + '</div>';
  }
  function bouton(action, texte, classe, attrs) {
    return '<button type="button" class="btn ' + (classe || 'btn-cta btn-gradient') + '" data-action="' + action + '"' + (attrs || '') + '>' + texte + '</button>';
  }
  function chargement() {
    afficher(carte('<p class="bilan-centre">' + x('chargement') + '</p>', 'bilan-chargement'), true);
  }
  function messageErreur(code, reprise) {
    var cle = { introuvable: 'introuvable', trop: 'trop', reseau: 'reseau' }[code] || 'serveur';
    afficher(carte('<p class="bilan-alerte">' + x('erreurs.' + cle) + '</p>' +
      '<div class="bilan-actions">' + bouton('reessayer', x('erreurs.reessayer')) + bouton('accueil', x('attente.accueil'), 'btn-outline') + '</div>'));
    ACTIONS.reessayer = reprise || function () { location.reload(); };
  }

  // Les actions de l'écran courant, appelées par data-action.
  var ACTIONS = {};
  racine.addEventListener('click', function (e) {
    var cible = e.target.closest('[data-action]');
    if (!cible || !racine.contains(cible)) return;
    var nom = cible.getAttribute('data-action');
    var f = ACTIONS[nom] || ACTIONS_COMMUNES[nom];
    if (!f) return;
    if (cible.tagName === 'A' && cible.getAttribute('href') === '#') e.preventDefault();
    f(cible, e);
  });
  racine.addEventListener('change', function (e) {
    var cible = e.target.closest('[data-change]');
    if (!cible) return;
    var f = ACTIONS[cible.getAttribute('data-change')];
    if (f) f(cible, e);
  });
  var ACTIONS_COMMUNES = {
    accueil: function () { nettoyerUrl(); if (lireListe().length) accueil(); else quitterFocus(); },
    // « Retrouver mon évaluation » : l'adresse seule ; le serveur renvoie des
    // liens neufs par e-mail, qu'il y ait une évaluation ou non (l'e-mail le dit).
    retrouver: function (b) {
      var input = document.getElementById('bilan-retrouver-email');
      var etat = document.getElementById('bilan-retrouver-etat');
      var e = (input && input.value || '').trim();
      if (!EMAIL_OK.test(e)) { if (etat) etat.textContent = x('lien.faux'); if (input) input.focus(); return; }
      b.disabled = true;
      appel('retrouver', { email: e, lang: LANG }).then(function (r) {
        b.disabled = false;
        if (etat) etat.textContent = r.statut === 200 ? x('retrouver.envoye', { email: e }) : x(r.json.erreur === 'trop' ? 'retrouver.trop' : 'erreurs.serveur');
      }).catch(function () { b.disabled = false; if (etat) etat.textContent = x('erreurs.reseau'); });
    },
  };

  // Les liens perdus (19 octobre 2026, Thomas : « si quelqu'un ferme l'onglet
  // par erreur et qu'il n'a pas eu le temps de copier son lien, on fait
  // comment ? »). Sur le même appareil, la page retient l'évaluation
  // (qc-bilans) ; ailleurs, il faut le lien : « Recevoir mon lien par e-mail »
  // depuis l'évaluation ouverte, et « Retrouver mon évaluation » par l'adresse.
  function blocLien(email) {
    return '<div class="bilan-lien-mail">' +
      '<label class="bilan-label" for="bilan-lien-email">' + x('lien.titre') + '</label>' +
      '<div class="bilan-lien-ligne"><input id="bilan-lien-email" class="bilan-input" type="email" maxlength="254" autocomplete="email" inputmode="email" spellcheck="false" placeholder="' + x('lien.placeholder') + '" value="' + esc(email || '') + '">' +
      bouton('envoyerLien', x('lien.bouton'), 'btn-outline btn-sm') + '</div>' +
      '<p class="bilan-note" id="bilan-lien-etat" aria-live="polite">' + x('lien.aide') + '</p></div>';
  }
  function envoyerLien(b, id, jeton) {
    var input = document.getElementById('bilan-lien-email');
    var etat = document.getElementById('bilan-lien-etat');
    var e = (input && input.value || '').trim();
    if (!EMAIL_OK.test(e)) { if (etat) etat.textContent = x('lien.faux'); if (input) input.focus(); return; }
    b.disabled = true;
    // `reprise` : la phrase sous le champ (lien.aide) annonce un seul rappel
    // si les réponses ne sont pas finies (24 octobre 2026).
    appel('lien', { id: id, jeton: jeton, email: e, reprise: true }).then(function (r) {
      b.disabled = false;
      if (etat) etat.textContent = r.statut === 200 ? x('lien.envoye', { email: e }) : x(r.json.erreur === 'trop' ? 'lien.trop' : 'erreurs.serveur');
    }).catch(function () { b.disabled = false; if (etat) etat.textContent = x('erreurs.reseau'); });
  }
  // Le champ de l'adresse e-mail de la fin des questions : obligatoire,
  // c'est là que le PDF part.
  function champEmailFin(valeur, autre) {
    return '<div class="bilan-champ bilan-champ--email"><label for="bilan-email">' + x('creation.email') + '</label>' +
      '<input id="bilan-email" class="bilan-input" type="email" maxlength="254" autocomplete="email" inputmode="email" spellcheck="false" required value="' + esc(valeur || '') + '">' +
      '<p class="bilan-note">' + x('creation.emailAide', { autre: autre || tr('creation.autreDefaut', '') }) + '</p></div>';
  }
  function blocRetrouver() {
    return '<details class="bilan-retrouver"><summary>' + x('retrouver.titre') + '</summary>' +
      '<p class="bilan-note">' + x('retrouver.texte') + '</p>' +
      '<div class="bilan-lien-ligne"><input id="bilan-retrouver-email" class="bilan-input" type="email" maxlength="254" autocomplete="email" inputmode="email" spellcheck="false" placeholder="' + x('retrouver.placeholder') + '">' +
      bouton('retrouver', x('retrouver.bouton'), 'btn-outline btn-sm') + '</div>' +
      '<p class="bilan-note" id="bilan-retrouver-etat" aria-live="polite"></p></details>';
  }

  function copier(texte, boutonEl, libelleOk) {
    var fait = function () {
      if (!boutonEl) return;
      var avant = boutonEl.innerHTML;
      boutonEl.innerHTML = libelleOk || x('invitation.copie');
      setTimeout(function () { boutonEl.innerHTML = avant; }, 2200);
    };
    var secours = function () {
      var z = document.createElement('textarea');
      z.value = texte; z.setAttribute('readonly', ''); z.style.position = 'fixed'; z.style.opacity = '0';
      document.body.appendChild(z); z.select();
      try { document.execCommand('copy'); } catch (e) { /* rien */ }
      document.body.removeChild(z);
      fait();
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(texte).then(fait, secours);
    else secours();
  }

  function chargerScript(url, cb) {
    var sc = document.createElement('script');
    sc.src = url + (window.__QCV ? '?v=' + window.__QCV : '');
    sc.async = true;
    sc.onload = function () { cb(null); };
    sc.onerror = function () { cb(new Error('script')); };
    document.head.appendChild(sc);
  }

  // ── Les questions ───────────────────────────────────────────────────────

  function texteQ(id) {
    var r = C.INDEX[id];
    return (Q.domaines[r.d.id] && Q.domaines[r.d.id].questions[id]) || {};
  }
  function titreDomaine(id) { return (Q.domaines[id] && Q.domaines[id].titre) || id; }
  // La question telle que la lit celui qui répond.
  function enonce(id, genre, autre) {
    return C.remplir(C.accorder(texteQ(id).q || '', genre), { autre: autre });
  }
  function libellesOptions(id, genre, autre) {
    var r = C.INDEX[id];
    if (r.q.type === 'qui') return Q.qui.map(function (o) { return C.remplir(o, { autre: autre }); });
    return (texteQ(id).o || []).map(function (o) { return C.remplir(C.accorder(o, genre), { autre: autre }); });
  }
  // En solo, les réponses qu'on prête à l'autre : les options telles que
  // l'autre les lirait (accordées à son genre, « {autre} » étant alors la
  // personne qui répond), et pour « qui fait quoi » des libellés tournés
  // vers soi (« Surtout {autre} » ... « Surtout vous »), rangés dans le
  // repère de l'autre, comme sa vraie réponse le serait.
  function libellesPercu(id) {
    var r = C.INDEX[id];
    if (r.q.type === 'qui') return (Q.quiPercu || Q.qui).map(function (o) { return C.remplir(o, { autre: S.autre.prenom }); });
    return (texteQ(id).o || []).map(function (o) { return C.remplir(C.accorder(o, S.autre.genre), { autre: S.moi.prenom }); });
  }
  // ── Démarrage ───────────────────────────────────────────────────────────

  function charger() {
    C = window.QCBilanCoeur;
    if (!C) return Promise.reject(new Error('coeur'));
    return fetch('/js/data/bilan-' + LANG + '.json' + (window.__QCV ? '?v=' + window.__QCV : ''))
      .then(function (r) { if (!r.ok) throw new Error('questions'); return r.json(); })
      .then(function (j) { Q = j; });
  }

  function nettoyerUrl() {
    try { history.replaceState(null, '', location.pathname); } catch (e) { /* rien */ }
  }

  // Les questions et le calcul ne se chargent qu'une fois, quand
  // l'application s'ouvre.
  var pret = null;
  function preparer() {
    return pret || (pret = charger().catch(function (e) { pret = null; throw e; }));
  }

  function demarrer() {
    var hash = new URLSearchParams(location.hash.replace(/^#/, ''));
    var query = new URLSearchParams(location.search);
    var id = hash.get('b'), jeton = hash.get('t');
    var lien = !!(id && jeton);
    // Le lien « ne plus recevoir de message » des e-mails : #b=…&t=…&arret=1.
    var arret = hash.get('arret') === '1';
    // Le bouton de l'e-mail du rapport (22 octobre 2026, plus de pièce
    // jointe) : #b=…&t=…&pdf=1 ouvre le rapport et lance le PDF.
    pdfDemande = hash.get('pdf') === '1';
    var paiement = !!(query.get('paiement') && query.get('b'));
    var annule = !!(query.get('annule') && query.get('b'));
    arrivee(query);
    if (!lien && !paiement && !annule) {
      // La présentation seule : l'application attend le bouton.
      repriseSurLaPage();
      compterVue('page');
      return;
    }
    focus(true, true);
    chargement();
    preparer().then(function () {
      if (lien) {
        nettoyerUrl();
        return ouvrirLien(id, jeton, arret);
      }
      if (paiement) return retourPaiement(query.get('b'), query.get('paiement'));
      var e = entreeDe(query.get('b'));
      nettoyerUrl();
      if (e) return ouvrirResultat(e, x('paiement.annule'));
      accueil();
    }).catch(function () { messageErreur('reseau'); });
  }

  // Un lien (personnel ou d'invitation) : on demande au serveur qui on est.
  function ouvrirLien(id, jeton, arret) {
    chargement();
    appel('etat', { id: id, jeton: jeton }).then(function (r) {
      if (r.statut === 404) {
        afficher(carte('<p class="bilan-alerte">' + x('rejoindre.lienUtilise') + '</p>' + blocRetrouver() +
          '<div class="bilan-actions">' + bouton('accueil', x('attente.accueil'), 'btn-outline') + '</div>'));
        return;
      }
      if (r.statut !== 200) return messageErreur(r.json.erreur, function () { ouvrirLien(id, jeton); });
      var e = r.json;
      if (e.invite) return rejoindre(e, jeton);
      var entree = { id: id, jeton: jeton, role: e.role, mode: e.mode || 'duo', moi: e.moi.prenom, autre: e.autre.prenom };
      var ancienne = lireListe().filter(function (x) { return x.id === id && x.role === e.role; })[0];
      if (ancienne && ancienne.invitation) entree.invitation = ancienne.invitation;
      garder(entree);
      if (arret) return arreterRappels(entree, e);
      suiteEtat(entree, e);
    }).catch(function () { messageErreur('reseau', function () { ouvrirLien(id, jeton, arret); }); });
  }

  // « Ne plus recevoir de message sur cette évaluation » (lien des e-mails
  // « rapport prêt » et du rappel), puis la suite habituelle.
  function arreterRappels(entree, etat) {
    appel('rappels', { id: entree.id, jeton: entree.jeton, off: true }).then(function (r) {
      if (r.statut !== 200) return messageErreur(r.json.erreur, function () { arreterRappels(entree, etat); });
      afficher(carte('<p class="bilan-alerte bilan-alerte--ok">' + x('rappels.arret') + '</p>' +
        '<div class="bilan-actions">' + bouton('continuer', x('rappels.continuer')) + '</div>'));
      ACTIONS = { continuer: function () { suiteEtat(entree, r.json.etat || etat); } };
    }).catch(function () { messageErreur('reseau', function () { arreterRappels(entree, etat); }); });
  }

  // Où mener quelqu'un selon l'état du bilan.
  function suiteEtat(entree, etat) {
    MODE = etat.mode === 'solo' ? 'solo' : 'duo';
    entree.mode = MODE;
    var prog = C.progression(etat.situation, etat.moi.reponses, MODE === 'solo' ? (etat.moi.percu || {}) : undefined);
    majEntree(entree.id, entree.role, {
      mode: MODE, moi: etat.moi.prenom, autre: etat.autre.prenom,
      repondu: prog.repondu,
      total: prog.total,
      statut: etat.verrouille ? (etat.paye ? 'resultat' : 'pret') : etat.moi.fini ? 'fini' : 'encours',
    });
    if (etat.verrouille) return ouvrirResultat(entree);
    if (etat.moi.fini) return attente(entree, etat);
    commencerSession(entree, etat);
  }

  function ouvrir(entree) {
    chargement();
    appel('etat', { id: entree.id, jeton: entree.jeton }).then(function (r) {
      if (r.statut === 404) { oublier(entree.id, entree.role); return messageErreur('introuvable', accueil); }
      if (r.statut !== 200) return messageErreur(r.json.erreur, function () { ouvrir(entree); });
      suiteEtat(entree, r.json);
    }).catch(function () { messageErreur('reseau', function () { ouvrir(entree); }); });
  }

  // ── Accueil ─────────────────────────────────────────────────────────────

  // Dans le mode focus : les bilans de cet appareil, ou directement la
  // création s'il n'y en a pas.
  function accueil() {
    S = null;
    MODE = 'duo';
    if (!C || !Q) {
      chargement();
      return preparer().then(accueil).catch(function () { messageErreur('reseau'); });
    }
    var liste = lireListe();
    if (!liste.length) return creation();
    var cartes = liste.map(function (e) {
      var statut = e.statut === 'resultat' ? x('accueil.resultat')
        : e.statut === 'pret' ? x('accueil.pret')
        : e.statut === 'fini' ? x('accueil.fini')
        : e.total ? x('accueil.progression', { n: nombre(e.repondu || 0), total: nombre(e.total) })
        : '';
      return '<li class="bilan-reprise">' +
        '<div><strong>' + x('accueil.avec', { autre: e.autre || '' }) + '</strong>' +
        (e.mode === 'solo' ? ' <span class="bilan-reprise-mode">' + x('accueil.seul') + '</span>' : '') +
        (statut ? '<span class="bilan-reprise-statut">' + statut + '</span>' : '') + '</div>' +
        '<div class="bilan-reprise-actions">' +
        bouton('reprendre', e.statut === 'resultat' ? x('accueil.voir') : x('accueil.reprendre'), 'btn-cta btn-gradient btn-sm', ' data-id="' + esc(e.id) + '" data-role="' + esc(e.role) + '"') +
        bouton('oublier', x('accueil.oublier'), 'btn-outline btn-sm', ' data-id="' + esc(e.id) + '" data-role="' + esc(e.role) + '"') +
        '</div></li>';
    }).join('');
    afficher(carte('<h2 class="bilan-titre">' + x('accueil.titre') + '</h2><ul class="bilan-reprises">' + cartes + '</ul>' + blocRetrouver() +
      '<p class="bilan-note">' + x('accueil.oublierAide') + '</p>' +
      '<div class="bilan-actions">' + bouton('creer', x('accueil.nouveau'), 'btn-outline') + '</div>', 'bilan-accueil'), true);
    ACTIONS = {
      creer: function () { creation(); },
      reprendre: function (b) { var e = entreeRole(b.getAttribute('data-id'), b.getAttribute('data-role')); if (e) ouvrir(e); },
      oublier: function (b) {
        confirmerDeuxFois(b, x('accueil.oublierConfirmer'), function () {
          oublier(b.getAttribute('data-id'), b.getAttribute('data-role'));
          if (lireListe().length) accueil(); else quitterFocus();
        });
      },
    };
  }

  // Une action irréversible se confirme d'un second clic sur le même bouton
  // (pas de confirm(), que certains navigateurs intégrés n'affichent pas).
  function confirmerDeuxFois(b, libelle, action) {
    var t = Date.now();
    var arme = +b.getAttribute('data-arme') || 0;
    if (arme && t - arme > 400 && t - arme < 5000) { action(); return; }
    if (arme && t - arme <= 400) return;
    var avant = b.innerHTML;
    b.setAttribute('data-arme', String(t));
    b.innerHTML = libelle;
    b.classList.add('bilan-danger');
    setTimeout(function () {
      if (!document.body.contains(b)) return;
      b.removeAttribute('data-arme');
      b.innerHTML = avant;
      b.classList.remove('bilan-danger');
    }, 5000);
  }

  // ── Création ────────────────────────────────────────────────────────────

  var brouillon = null;

  function champGenre(nom, valeur) {
    var choix = [['f', x('creation.femme')], ['h', x('creation.homme')], ['', x('creation.sansGenre')]];
    return '<div class="bilan-genres" role="radiogroup">' + choix.map(function (c) {
      return '<label class="bilan-pastille"><input type="radio" name="' + nom + '" value="' + c[0] + '"' +
        ((valeur || '') === c[0] ? ' checked' : '') + '> <span>' + c[1] + '</span></label>';
    }).join('') + '</div>';
  }

  function lireGenre(nom) {
    var c = racine.querySelector('input[name="' + nom + '"]:checked');
    return c && c.value ? c.value : null;
  }

  // Les deux façons de faire l'évaluation : à deux, chacun sur son
  // téléphone, ou seul(e), en répondant aussi pour l'autre.
  function champMode(valeur) {
    return '<div class="bilan-modes" role="radiogroup" aria-label="' + x('creation.modeTitre') + '">' + ['duo', 'solo'].map(function (m) {
      var persos = m === 'duo' ? duo('salut', 'mignon', 44, 'f', 'h') : (mascotte('rose', 'salut', 44) ? '<div class="bilan-duo" aria-hidden="true">' + mascotte('rose', 'salut', 44) + '</div>' : '');
      return '<label class="bilan-mode' + (valeur === m ? ' choisi' : '') + '"><input type="radio" name="mode" value="' + m + '"' + (valeur === m ? ' checked' : '') + ' data-change="mode">' +
        '<span class="bilan-mode-rond" aria-hidden="true"></span>' +
        '<span class="bilan-mode-texte"><strong>' + x(m === 'duo' ? 'creation.modeDuo' : 'creation.modeSolo') + '</strong>' +
        '<span>' + x(m === 'duo' ? 'creation.modeDuoAide' : 'creation.modeSoloAide') + '</span></span>' +
        (persos ? '<span class="bilan-mode-persos">' + persos + '</span>' : '') + '</label>';
    }).join('') + '</div>';
  }

  // Un texte qui nomme le partenaire, le prénom dans un span que la saisie
  // met à jour (« votre partenaire » tant qu'il n'est pas écrit).
  function avecNomAutre(cle) {
    var nom = brouillon.autre || tr('creation.autreDefaut', '');
    return x(cle, { autre: '\u0001' }).split('\u0001').join('<span class="bilan-nom-autre">' + esc(nom) + '</span>');
  }

  // Le départ tient en un écran depuis le 21 octobre 2026 (Thomas devant
  // l'entonnoir : 240 clics sur « Commencer », 85 évaluations créées) : la
  // façon de faire, les prénoms et la case de l'accord (une seule depuis le
  // 25 octobre 2026 : « 18 ans ou plus » et le consentement, fusionnés, après
  // 103 erreurs sur les deux cases en cinq jours). La situation est posée
  // ensuite comme les premières questions (questionSituation), et l'adresse
  // e-mail à la fin de ses propres questions (ecranEmail).
  function creation() {
    if (!brouillon) brouillon = { mode: modeDemande === 'solo' ? 'solo' : 'duo', statut: null, moi: '', autre: '', genreMoi: null, genreAutre: null, consent: false, celib: null };
    MODE = brouillon.mode;
    var solo = brouillon.mode === 'solo';
    // Seul(e), « Où en êtes-vous ? » d'abord (25 octobre 2026) : le formulaire
    // n'apparaît qu'une fois la réponse donnée, et un célibataire voit à la
    // place ce qu'on lui prépare (panneauCelib).
    var statut = solo ? brouillon.statut : 'couple';
    var aideAutre = tr('creation.autreAide', '');
    var corps = '<h2 class="bilan-titre">' + x('creation.modeTitre') + '</h2>' + champMode(brouillon.mode) +
      (solo ? '<h3 class="bilan-sous-titre bilan-sous-titre--espace">' + x('creation.statutTitre') + '</h3>' + champStatut(statut) : '');
    if (statut === 'celib') {
      corps += panneauCelib();
    } else if (statut) {
      corps += (solo ? apportSolo() : '') +
        '<h3 class="bilan-sous-titre bilan-sous-titre--espace">' + x('creation.prenomsTitre') + '</h3>' +
        '<div class="bilan-champ"><label for="bilan-moi">' + x('creation.moi') + '</label>' +
        '<input id="bilan-moi" class="bilan-input" type="text" maxlength="30" autocomplete="given-name" value="' + esc(brouillon.moi) + '"></div>' +
        '<div class="bilan-champ"><span class="bilan-label">' + x('creation.genre') + '</span>' + champGenre('g-moi', brouillon.genreMoi) + '</div>' +
        '<div class="bilan-champ"><label for="bilan-autre">' + x('creation.autre') + '</label>' +
        '<input id="bilan-autre" class="bilan-input" type="text" maxlength="30" autocomplete="off" value="' + esc(brouillon.autre) + '">' +
        (aideAutre ? '<p class="bilan-note">' + esc(ins(aideAutre)) + '</p>' : '') + '</div>' +
        '<div class="bilan-champ"><span class="bilan-label">' + x('creation.genreAutre') + '</span>' + champGenre('g-autre', brouillon.genreAutre) + '</div>' +
        '<p class="bilan-note">' + x('creation.genreAide') + '</p>' +
        '<hr class="bilan-sep">' +
        (solo ? '<p class="bilan-info">' + avecNomAutre('creation.soloNote') + '</p>' : '') +
        '<label class="bilan-case"><input type="checkbox" id="bilan-consent"' + (brouillon.consent ? ' checked' : '') + '> <span>' + x('creation.consentement') + '</span></label>' +
        '<p class="bilan-note">' + avecNomAutre('creation.accordAide') + '</p>' +
        '<p class="bilan-prix-rappel">' + avecPromo(x('creation.prixRappel')) + '</p>' +
        '<p class="bilan-note">' + x('accueil.violence') + '</p>' +
        '<p class="bilan-alerte" id="bilan-erreur" hidden></p>' +
        '<div class="bilan-actions bilan-actions--ecart">' +
        bouton('retour', x('creation.retour'), 'btn-outline') +
        bouton('valider', x('creation.creer')) + '</div>';
    } else {
      corps += '<div class="bilan-actions bilan-actions--ecart">' + bouton('retour', x('creation.retour'), 'btn-outline') + '</div>';
    }
    corps += blocRetrouver();
    afficher(carte(corps, 'bilan-creation' + (solo ? ' bilan-creation--solo' : '')));
    compterVue('depart', { mode: brouillon.mode });
    var champ = racine.querySelector('input[type="text"]');
    if (champ && !brouillon.moi && !modeDemande) champ.focus({ preventScroll: true });
    // Les phrases sous les cases nomment le partenaire dès qu'on l'écrit.
    var champAutre = document.getElementById('bilan-autre');
    if (champAutre) champAutre.addEventListener('input', function () {
      var nom = this.value.trim() || tr('creation.autreDefaut', '');
      racine.querySelectorAll('.bilan-nom-autre').forEach(function (n) { n.textContent = nom; });
    });

    function erreur(cle, cause) {
      var p = document.getElementById('bilan-erreur');
      p.textContent = ins(remplir(tr(cle, ''), {}));
      p.hidden = false;
      if (cause) compterVue('depart_erreur', { mode: brouillon.mode, cle: cause });
    }
    // Ce qui est à l'écran passe dans le brouillon : rien n'est perdu quand
    // on change de façon de faire ou de réponse à « Où en êtes-vous ? ».
    function lire() {
      var valeur = function (id) { var e = document.getElementById(id); return e ? (e.value || '').trim() : null; };
      if (document.getElementById('bilan-moi')) {
        brouillon.moi = valeur('bilan-moi');
        brouillon.autre = valeur('bilan-autre');
        brouillon.genreMoi = lireGenre('g-moi');
        brouillon.genreAutre = lireGenre('g-autre');
        brouillon.consent = document.getElementById('bilan-consent').checked;
      }
      if (document.getElementById('bilan-celib-email')) {
        brouillon.celib = {
          interets: [].map.call(racine.querySelectorAll('input[name="celib-sujet"]:checked'), function (c) { return c.value; }),
          autre: valeur('bilan-celib-autre'),
          email: valeur('bilan-celib-email'),
          consent: document.getElementById('bilan-celib-consent').checked,
        };
      }
    }
    ACTIONS = {
      // Changer de façon de faire redessine l'écran avec ses textes, sans
      // perdre ce qui est déjà écrit.
      mode: function (input) {
        lire();
        brouillon.mode = input.value === 'solo' ? 'solo' : 'duo';
        modeDemande = brouillon.mode;
        creation();
      },
      // « Où en êtes-vous ? », comptée une fois par visite et par réponse.
      statut: function (input) {
        lire();
        brouillon.statut = STATUTS_SOLO.indexOf(input.value) >= 0 ? input.value : null;
        if (brouillon.statut) compterVue('statut_solo', { cle: brouillon.statut });
        creation();
      },
      retour: function () {
        lire();
        if (lireListe().length) accueil();
        else quitterFocus();
      },
      valider: function (b) {
        lire();
        if (!brouillon.moi || !brouillon.autre) return erreur('creation.prenomManque', 'prenoms');
        // Une seule case dit l'âge et le consentement : la cause est
        // « accord » (de 21 au 25 octobre 2026, deux cases, « majeur » et
        // « consentement » comptées à part).
        if (!brouillon.consent) return erreur('creation.accordManque', 'accord');
        b.disabled = true;
        appel('creer', {
          lang: LANG, mode: brouillon.mode, src: source(),
          moi: { prenom: brouillon.moi, genre: brouillon.genreMoi },
          autre: { prenom: brouillon.autre, genre: brouillon.genreAutre },
          consentement: true, majeur: true,
        }).then(function (r) {
          b.disabled = false;
          if (r.statut !== 200) return erreur(r.json.erreur === 'trop' ? 'erreurs.trop' : 'erreurs.serveur');
          var entree = { id: r.json.id, jeton: r.json.jeton, mode: brouillon.mode, invitation: r.json.invitation || null, invitationVue: true, role: 'a', moi: brouillon.moi, autre: brouillon.autre, statut: 'encours' };
          garder(entree);
          brouillon = null;
          // Seul(e) : personne à inviter, la situation puis les questions.
          if (entree.mode === 'solo') return ouvrir(entree);
          invitation(entree, r.json.etat);
        }).catch(function () { b.disabled = false; erreur('erreurs.reseau'); });
      },
      // Un célibataire : au moins un sujet ; l'adresse est facultative, mais
      // si elle est là, la case qui dit à quoi elle sert doit être cochée.
      envoyerCelib: function (b) {
        lire();
        var c = brouillon.celib;
        if (!c.interets.length) return erreur('celib.choixManque');
        if (c.email && !emailValide(c.email)) return erreur('creation.emailFaux');
        if (c.email && !c.consent) return erreur('celib.consentManque');
        b.disabled = true;
        appel('celib', {
          lang: LANG, interets: c.interets, autre: c.autre || undefined,
          email: c.email || undefined, consentement: c.email ? true : undefined,
        }).then(function (r) {
          b.disabled = false;
          if (r.statut !== 200) return erreur(r.json.erreur === 'trop' ? 'erreurs.trop' : r.json.erreur === 'email' ? 'creation.emailFaux' : 'erreurs.serveur');
          merciCelib(c.email);
        }).catch(function () { b.disabled = false; erreur('erreurs.reseau'); });
      },
    };
  }

  // Seul(e), en couple : ce que l'évaluation seul(e) apporte, avant les
  // prénoms (25 octobre 2026). Le prénom de l'autre s'y écrit dès qu'on le
  // tape, comme dans les notes sous la case.
  function apportSolo() {
    var points = tr('creation.apport', []);
    if (!Array.isArray(points) || !points.length) return '';
    var nom = '<span class="bilan-nom-autre">' + esc(brouillon.autre || tr('creation.autreDefaut', '')) + '</span>';
    return '<div class="bilan-apport"><p class="bilan-apport-titre">' + x('creation.apportTitre') + '</p>' +
      '<ul class="bilan-apport-liste">' + points.map(function (p) {
        return '<li>' + esc(ins(remplir(p, { autre: '\u0001' }))).split('\u0001').join(nom) + '</li>';
      }).join('') + '</ul>' +
      '<p class="bilan-note">' + x('creation.apportNote') + '</p></div>';
  }

  // « Où en êtes-vous ? » au départ seul(e) : en couple, c'est compliqué, ou
  // célibataire (C.STATUTS_SOLO).
  var STATUTS_SOLO = ['couple', 'complique', 'celib'];
  function champStatut(valeur) {
    return '<div class="bilan-genres bilan-statuts" role="radiogroup" aria-label="' + x('creation.statutTitre') + '">' + STATUTS_SOLO.map(function (s) {
      return '<label class="bilan-pastille"><input type="radio" name="statut" value="' + s + '"' + (valeur === s ? ' checked' : '') + ' data-change="statut"> <span>' + x('creation.statuts.' + s) + '</span></label>';
    }).join('') + '</div>';
  }

  // Le célibataire : l'évaluation compare ce que vit un couple. On lui dit
  // qu'une évaluation pour célibataires se prépare, on lui demande ce qui
  // l'intéresserait (C.SUJETS_CELIB), et, s'il le veut, où le prévenir.
  function panneauCelib() {
    var c = brouillon.celib || { interets: [], autre: '', email: '', consent: false };
    var sujets = (C && C.SUJETS_CELIB) || [];
    return '<div class="bilan-celib">' +
      '<h3 class="bilan-sous-titre bilan-sous-titre--espace">' + x('celib.titre') + '</h3>' +
      '<p class="bilan-texte">' + x('celib.texte') + '</p>' +
      '<fieldset class="bilan-celib-sujets"><legend class="bilan-label">' + x('celib.question') + '</legend>' +
      sujets.map(function (s) {
        return '<label class="bilan-case"><input type="checkbox" name="celib-sujet" value="' + s + '"' + (c.interets.indexOf(s) >= 0 ? ' checked' : '') + '> <span>' + x('celib.sujets.' + s) + '</span></label>';
      }).join('') + '</fieldset>' +
      '<div class="bilan-champ"><label for="bilan-celib-autre">' + x('celib.autre') + '</label>' +
      '<input id="bilan-celib-autre" class="bilan-input" type="text" maxlength="300" autocomplete="off" value="' + esc(c.autre || '') + '"></div>' +
      '<hr class="bilan-sep">' +
      '<div class="bilan-champ"><label for="bilan-celib-email">' + x('celib.email') + '</label>' +
      '<input id="bilan-celib-email" class="bilan-input" type="email" maxlength="254" autocomplete="email" inputmode="email" spellcheck="false" value="' + esc(c.email || '') + '"></div>' +
      '<label class="bilan-case"><input type="checkbox" id="bilan-celib-consent"' + (c.consent ? ' checked' : '') + '> <span>' + x('celib.consentement') + '</span></label>' +
      '<p class="bilan-note">' + x('celib.emailAide') + (CFG.confidentialite ? ' <a href="' + esc(CFG.confidentialite) + '">' + x('celib.confidentialite') + '</a>' : '') + '</p>' +
      '<p class="bilan-alerte" id="bilan-erreur" hidden></p>' +
      '<div class="bilan-actions bilan-actions--ecart">' +
      bouton('retour', x('creation.retour'), 'btn-outline') +
      bouton('envoyerCelib', x('celib.envoyer')) + '</div>' +
      '</div>';
  }

  function merciCelib(email) {
    brouillon = null;
    var liens = (CFG.celibTests || []).map(function (t) {
      return '<li><a href="' + esc(t.url) + '">' + esc(ins(t.titre)) + '</a></li>';
    }).join('');
    var rose = mascotte('rose', 'joie', 76);
    afficher(carte(
      (rose ? '<div class="bilan-duo" aria-hidden="true">' + rose + '</div>' : '') +
      '<h2 class="bilan-titre">' + x('celib.merciTitre') + '</h2>' +
      '<p class="bilan-texte">' + (email ? x('celib.merciEmail', { email: email }) : x('celib.merci')) + '</p>' +
      (liens ? '<h3 class="bilan-sous-titre">' + x('celib.testsTitre') + '</h3><ul class="bilan-celib-tests">' + liens + '</ul>' : '') +
      '<div class="bilan-actions">' + bouton('fermer', x('celib.fermer'), 'btn-outline') + '</div>', 'bilan-celib-merci'));
    ACTIONS = { fermer: function () { quitterFocus(); } };
  }

  // ── Invitation ──────────────────────────────────────────────────────────

  function invitation(entree, etat) {
    var lien = lienPersonnel(entree.id, entree.invitation);
    var autre = entree.autre;
    var html = carte(
      duo('salut', 'surprise', 80, etat && etat.moi.genre, etat && etat.autre.genre) +
      '<h2 class="bilan-titre">' + x('invitation.titre', { autre: autre }) + '</h2>' +
      '<p class="bilan-texte">' + x('invitation.texte', { autre: autre }) + '</p>' +
      (entree.invitationNeuve ? '<p class="bilan-note">' + x('invitation.nouveauLien', { autre: autre }) + '</p>' : '') +
      '<div class="bilan-lien"><input class="bilan-input" type="text" readonly value="' + esc(lien) + '" aria-label="' + x('invitation.copier') + '"></div>' +
      '<div class="bilan-actions">' +
      (navigator.share ? bouton('partager', x('invitation.envoyer'), 'btn-outline') : '') +
      bouton('copier', x('invitation.copier'), 'btn-outline') +
      bouton('qr', x('invitation.qr'), 'btn-outline btn-sm') + '</div>' +
      '<div class="bilan-qr" id="bilan-qr" hidden></div>' +
      // « Commencer mes réponses » dans le premier écran (22 octobre 2026) :
      // il était sous le lien personnel, à 992 px du haut sur un téléphone, et
      // 18 créateurs sur 25 n'ont jamais commencé (ils envoyaient le lien et
      // partaient, comme s'il fallait attendre l'autre).
      '<div class="bilan-invite-suite"><p>' + x('invitation.suite', { autre: autre }) + '</p>' +
      bouton('commencer', x('invitation.commencer'), 'btn-cta btn-gradient btn-lg') + '</div>' +
      '<hr class="bilan-sep">' +
      '<h3 class="bilan-sous-titre">' + x('invitation.monLien') + '</h3>' +
      '<p class="bilan-note">' + x('invitation.monLienAide', { autre: autre }) + '</p>' +
      '<div class="bilan-actions">' + bouton('copierMoi', x('invitation.copierMonLien'), 'btn-outline btn-sm') + '</div>' +
      blocLien(etat && etat.moi && etat.moi.email), 'bilan-invitation');
    afficher(html);
    var message = remplir(tr('invitation.message', ''), { lien: lien });
    ACTIONS = {
      partager: function () {
        navigator.share({ title: remplir(tr('invitation.messageTitre', ''), {}), text: message }).catch(function () {});
      },
      copier: function (b) { copier(lien, b); },
      copierMoi: function (b) { copier(lienPersonnel(entree.id, entree.jeton), b); },
      envoyerLien: function (b) { envoyerLien(b, entree.id, entree.jeton); },
      qr: function (b) {
        var zone = document.getElementById('bilan-qr');
        if (!zone.hidden) { zone.hidden = true; return; }
        chargerScript('/js/vendor/qrcode.js', function (err) {
          if (err || typeof window.qrcode !== 'function') return;
          try {
            var q = window.qrcode(0, 'M');
            q.addData(lien); q.make();
            zone.innerHTML = q.createSvgTag({ cellSize: 4, margin: 2, scalable: true }) +
              '<p class="bilan-note">' + x('invitation.qrAide', { autre: autre }) + '</p>';
            zone.hidden = false;
          } catch (e) { /* rien */ }
        });
      },
      commencer: function () { ouvrir(entree); },
    };
  }

  // ── Rejoindre (B) ───────────────────────────────────────────────────────

  // L'écran de l'invitation : le prénom, le genre et la case. La situation
  // se confirme au fil des domaines (questionSituation), et l'adresse se
  // donne à la fin.
  function rejoindre(etat, jetonInvitation) {
    var autre = etat.autre.prenom;
    var html = carte(
      duo('salut', 'mignon', 86, etat.autre.genre, etat.moi.genre) +
      '<h2 class="bilan-titre">' + x('rejoindre.titre', { autre: autre }) + '</h2>' +
      '<p class="bilan-texte">' + x('rejoindre.texte', { autre: autre }) + '</p>' +
      '<p class="bilan-texte">' + x('rejoindre.duree') + '</p>' +
      (etat.paye ? '<p class="bilan-alerte bilan-alerte--ok">' + x('rejoindre.paye', { autre: autre }) + '</p>' : '') +
      '<div class="bilan-champ"><label for="bilan-moi">' + x('rejoindre.prenom') + '</label>' +
      '<input id="bilan-moi" class="bilan-input" type="text" maxlength="30" value="' + esc(etat.moi.prenom) + '"></div>' +
      '<div class="bilan-champ"><span class="bilan-label">' + x('rejoindre.genre') + '</span>' + champGenre('g-moi', etat.moi.genre) + '</div>' +
      '<hr class="bilan-sep">' +
      '<label class="bilan-case"><input type="checkbox" id="bilan-consent"> <span>' + x('creation.consentement') + '</span></label>' +
      '<p class="bilan-note">' + x('creation.accordAide', { autre: autre }) + '</p>' +
      '<p class="bilan-prix-rappel">' + avecPromo(x('creation.prixRappel')) + '</p>' +
      '<p class="bilan-note">' + x('accueil.violence') + '</p>' +
      '<p class="bilan-alerte" id="bilan-erreur" hidden></p>' +
      '<div class="bilan-actions">' + bouton('accepter', x('rejoindre.commencer')) + '</div>', 'bilan-rejoindre');
    afficher(html);
    function erreur(cle) {
      var p = document.getElementById('bilan-erreur');
      p.textContent = ins(remplir(tr(cle, ''), {}));
      p.hidden = false;
    }
    compterVue('invitation_vue', { mode: 'duo', id: etat.id });
    ACTIONS = {
      accepter: function (b) {
        var prenom = (document.getElementById('bilan-moi').value || '').trim();
        if (!prenom) return erreur('rejoindre.prenomManque');
        if (!document.getElementById('bilan-consent').checked) return erreur('creation.accordManque');
        b.disabled = true;
        appel('consentir', { id: etat.id, jeton: jetonInvitation, prenom: prenom, genre: lireGenre('g-moi'), consentement: true, majeur: true })
          .then(function (r) {
            if (r.statut !== 200) { b.disabled = false; return erreur(r.statut === 409 ? 'rejoindre.lienUtilise' : 'erreurs.serveur'); }
            var entree = { id: etat.id, jeton: r.json.jeton, role: etat.role, moi: prenom, autre: autre, statut: 'encours' };
            garder(entree);
            ouvrir(entree);
          })
          .catch(function () { b.disabled = false; erreur('erreurs.reseau'); });
      },
    };
  }

  // ── Les réponses ────────────────────────────────────────────────────────

  function commencerSession(entree, etat, revoir) {
    MODE = etat.mode === 'solo' ? 'solo' : 'duo';
    S = {
      entree: entree,
      id: entree.id, jeton: entree.jeton, role: etat.role,
      mode: MODE,
      situation: etat.situation,
      moi: etat.moi, autre: etat.autre,
      reponses: JSON.parse(JSON.stringify(etat.moi.reponses || {})),
      // En solo, ce que la personne prête à l'autre, question par question
      // (C.INCONNU pour « je ne sais pas ») ; null à deux.
      percu: MODE === 'solo' ? JSON.parse(JSON.stringify(etat.moi.percu || {})) : null,
      nn: (etat.moi.nn || []).slice(),
      introsVues: {},
      // Les clés de situation déjà posées ou confirmées dans cette visite.
      sitFaites: {},
      revoir: !!revoir,
      // La phase de la question affichée : 'moi' (ma réponse) ou, en solo,
      // 'autre' (ce que l'autre répondrait).
      phase: 'moi',
      envoi: { enCours: false, sale: false, fini: false, attente: [] },
    };
    S.liste = listeQuestions();
    S.index = revoir ? 0 : premierSansReponse();
    if (S.index > 0 && S.index < S.liste.length) S.introsVues[S.liste[S.index].domaine] = !!revoir;
    // À deux, le créateur qui n'a encore rien répondu et dont l'invitation
    // n'est pas acceptée commence par l'invitation.
    if (!revoir && S.mode === 'duo' && etat.role === 'a' && !etat.autre.rejoint && S.index === 0 && entree.invitation && !entree.invitationVue) {
      majEntree(entree.id, entree.role, { invitationVue: true });
      entree.invitationVue = true;
      return invitation(entree, etat);
    }
    suivante();
  }

  // Les questions de la personne, dans l'ordre de passage (C.ORDRE) ; une clé
  // de situation pas encore donnée compte avec sa valeur par défaut, et le
  // total vaut cent dès le départ.
  function listeQuestions() {
    return C.questionsPour(C.avecDefauts(S.situation), S.reponses, C.ORDRE);
  }

  // ── La situation ────────────────────────────────────────────────────────
  // Depuis le 25 octobre 2026, chaque clé est posée juste avant le premier
  // domaine qui en a besoin (C.clesAvant), et plus en bloc avant les cent
  // questions (78 personnes sur 205 s'arrêtaient dans ces sept écrans).
  // Déjà donnée (par l'autre, ou par soi-même sur un autre appareil), elle
  // s'affiche choisie, à confirmer ou à changer. Elle n'entre pas dans le
  // compte des cent questions.

  function connue(cle) {
    return C.SITUATION.some(function (it) { return it.id === cle && it.valeurs.indexOf(S.situation && S.situation[cle]) >= 0; });
  }

  // Les clés à poser en entrant dans un domaine : aucune en relecture, ni si
  // la personne y a déjà répondu. Une clé déjà donnée ne se montre (choisie,
  // à confirmer) que si l'autre a pu la donner : à deux, tant qu'il n'a pas
  // fini (ensuite la situation ne bouge plus), et pas dans une situation
  // donnée en entier au départ, avant le 25 octobre 2026 (elle porte encore
  // la durée), que l'autre relisait avant ses questions.
  function clesAPoser(dom) {
    if (S.revoir) return [];
    var deja = S.liste.some(function (q) { return q.domaine === dom && Number.isInteger(S.reponses[q.id]); });
    if (deja) return [];
    var cles = C.clesAvant(dom, S.situation).filter(function (k) { return !S.sitFaites[k]; });
    var figee = S.mode === 'solo' || (S.autre && S.autre.fini) || (S.situation && S.situation.duree);
    if (figee) cles = cles.filter(function (k) { return !connue(k); });
    return cles;
  }

  // À deux, ce que l'autre a donné de la situation entre-temps, et s'il a
  // fini : repris de chaque réponse enregistrée (`repondre` rend l'état), et
  // relu à l'intro d'un domaine qui pose une clé (relireSituation), pour
  // montrer choisie une réponse que l'autre vient de donner.
  function majDepuisEtat(session, etat) {
    if (etat.situation) session.situation = etat.situation;
    if (etat.autre) session.autre = etat.autre;
  }
  // Une lecture qui échoue ou tarde (plus de 4 s) ne bloque rien : on garde
  // ce qu'on sait, et le serveur fusionne les clés.
  function relireSituation(session) {
    var lecture = appel('etat', { id: session.id, jeton: session.jeton }).then(function (r) {
      if (r.statut === 200 && r.json && r.json.moi) majDepuisEtat(session, r.json);
    }).catch(function () {});
    var delai = new Promise(function (fin) { setTimeout(fin, 4000); });
    return { quand: Date.now(), promesse: Promise.race([lecture, delai]) };
  }

  function questionSituation(dom, cles, i) {
    var cle = cles[i];
    var item = C.SITUATION.filter(function (it) { return it.id === cle; })[0];
    var t = Q.situation[cle];
    if (!S.sit) S.sit = {};
    var dejaDonnee = connue(cle);
    var v = S.sit[cle] !== undefined ? S.sit[cle] : (dejaDonnee ? S.situation[cle] : undefined);
    var rond = '<span class="bilan-option-rond" aria-hidden="true"></span>';
    var options = item.valeurs.map(function (val, k) {
      var choisie = v === val;
      return '<button type="button" class="bilan-option' + (choisie ? ' choisie' : '') + '" role="radio" aria-checked="' + choisie + '" data-action="choisir" data-v="' + esc(val) + '">' +
        rond + '<span>' + esc(ins(t.o[k])) + '</span></button>';
    }).join('');
    afficher(carte(
      '<div class="bilan-q-tete"><span class="bilan-q-domaine">' + esc(ins(titreDomaine(dom))) + '</span>' +
      '<span>' + x('situation.titre') + '</span></div>' +
      '<h2 class="bilan-q-texte">' + esc(ins(t.q)) + '</h2>' +
      '<p class="bilan-note bilan-q-aide">' + x(dejaDonnee ? 'situation.deja' : 'situation.aide', { autre: S.autre.prenom }) + '</p>' +
      '<div class="bilan-options" role="radiogroup">' + options + '</div>' +
      '<div class="bilan-q-pied">' +
      (i > 0 ? bouton('precedente', '← ' + x('question.precedente'), 'btn-outline btn-sm') : '<span></span>') +
      '<span></span>' +
      (v ? bouton('suivanteQ', x('question.suivante') + ' →', 'btn-cta btn-gradient btn-sm') : '<span></span>') +
      '</div>' +
      '<div class="bilan-q-bas">' + bouton('pause', x('question.pause'), 'btn-link') + '</div>',
      'bilan-question bilan-question--situation'), true);
    garderEnVue();
    // Comptée au premier écran de situation de l'évaluation, quand aucune clé
    // n'est encore donnée : une fois par évaluation, comme « situation »,
    // que la base compte à la première clé reçue.
    var vierge = !C.SITUATION.some(function (it) { return connue(it.id); });
    if (vierge) compterVue('situation_vue', { mode: S.mode, id: S.id });
    var session = S;
    function apres() {
      if (S !== session) return;
      if (S.sit[cle] === undefined) S.sit[cle] = v;
      if (i + 1 < cles.length) questionSituation(dom, cles, i + 1); else enregistrerSituation(session, cles);
    }
    ACTIONS = {
      choisir: function (b) {
        S.sit[cle] = b.getAttribute('data-v');
        racine.querySelectorAll('.bilan-option').forEach(function (o) {
          var oui = o === b;
          o.classList.toggle('choisie', oui);
          o.setAttribute('aria-checked', String(oui));
        });
        setTimeout(function () {
          if (racine.querySelector('.bilan-question--situation') && S === session && S.sit[cle] === b.getAttribute('data-v')) apres();
        }, 220);
      },
      suivanteQ: function () { if (S.sit[cle] || v) apres(); },
      precedente: function () { questionSituation(dom, cles, i - 1); },
      pause: function () { pause(function () { questionSituation(dom, cles, i); }); },
    };
  }

  // N'envoie que les clés données ou changées ici (action `situation`, que
  // le serveur fusionne avec les autres), puis reprend les questions.
  function enregistrerSituation(session, cles) {
    var change = {};
    cles.forEach(function (k) {
      if (session.sit && session.sit[k] !== undefined && session.sit[k] !== (session.situation || {})[k]) change[k] = session.sit[k];
    });
    function reprendre() {
      cles.forEach(function (k) { session.sitFaites[k] = true; });
      session.sit = null;
      S = session;
      S.liste = listeQuestions();
      S.index = premierSansReponse();
      suivante();
    }
    if (!Object.keys(change).length) return reprendre();
    chargement();
    appel('situation', { id: session.id, jeton: session.jeton, situation: change }).then(function (r) {
      // L'un des deux a déjà fini : la situation est figée, l'état dit la suite.
      if (r.statut === 409) return ouvrir(session.entree);
      if (r.statut !== 200) return messageErreur(r.json.erreur, function () { enregistrerSituation(session, cles); });
      session.situation = r.json.etat.situation;
      reprendre();
    }).catch(function () { messageErreur('reseau', function () { enregistrerSituation(session, cles); }); });
  }

  // Seul(e), ce que l'autre répondrait n'est demandé que sur une partie des
  // questions (C.percuDemande : les sujets décisifs, et au moins trois
  // questions par domaine ; 25 octobre 2026, deux cents écrans, c'était trop
  // long). Une perception déjà donnée, dans une évaluation commencée avant ce
  // jour, reste à sa place et se modifie comme avant.
  function percuDemandee(id) {
    if (!S.percu) return false;
    return Number.isInteger(S.percu[id]) || C.percuDemande(S.situation, S.reponses).has(id);
  }

  // La première question à laquelle il manque une réponse ; en solo, une
  // question peut en avoir deux (la sienne, puis celle qu'on prête à
  // l'autre), et la phase s'arrête sur celle qui manque.
  function premierSansReponse() {
    for (var i = 0; i < S.liste.length; i++) {
      var id = S.liste[i].id;
      if (!Number.isInteger(S.reponses[id])) { S.phase = 'moi'; return i; }
      if (S.percu && !Number.isInteger(S.percu[id]) && percuDemandee(id)) { S.phase = 'autre'; return i; }
    }
    S.phase = 'moi';
    return S.liste.length;
  }

  // La question suivante, à sa première phase. Hors relecture, ce qui est
  // déjà répondu se saute : après un retour en arrière, ou dans une
  // évaluation commencée avant le nouvel ordre des domaines.
  function avancer() {
    S.index++;
    if (!S.revoir) {
      while (S.index < S.liste.length && Number.isInteger(S.reponses[S.liste[S.index].id]) &&
        (!S.percu || Number.isInteger(S.percu[S.liste[S.index].id]) || !percuDemandee(S.liste[S.index].id))) S.index++;
    }
    S.phase = 'moi';
    suivante();
  }

  function suivante() {
    if (S.index >= S.liste.length) return terminer();
    var item = S.liste[S.index];
    var debutDomaine = S.index === 0 || S.liste[S.index - 1].domaine !== item.domaine;
    if (debutDomaine && !S.introsVues[item.domaine]) return introDomaine(item.domaine);
    var cles = clesAPoser(item.domaine);
    if (cles.length) return questionSituation(item.domaine, cles, 0);
    afficherQuestion();
  }

  function introDomaine(dom) {
    var ordre = C.ORDRE;
    var n = ordre.indexOf(dom) + 1;
    var nb = S.liste.filter(function (q) { return q.domaine === dom; }).length;
    var min = Math.max(1, Math.round(nb * SECONDES_PAR_QUESTION / 60));
    var D = Q.domaines[dom] || {};
    var points = ordre.map(function (d, i) {
      var cls = i < n - 1 ? ' fait' : i === n - 1 ? ' actuel' : '';
      return '<span class="bilan-point' + cls + '" title="' + esc(titreDomaine(d)) + '"></span>';
    }).join('');
    afficher(carte(
      '<p class="bilan-etape">' + x('domaine.partie', { n: n, total: ordre.length }) + '</p>' +
      '<div class="bilan-points" aria-hidden="true">' + points + '</div>' +
      '<h2 class="bilan-titre">' + esc(ins(D.titre || dom)) + '</h2>' +
      '<p class="bilan-texte">' + esc(ins(C.remplir(D.intro || '', { autre: S.autre.prenom }))) + '</p>' +
      '<p class="bilan-pastille-info">' + x('domaine.nb', { n: nb, min: min }) + '</p>' +
      '<div class="bilan-actions">' + bouton('go', x('domaine.go')) + bouton('pause', x('domaine.pause'), 'btn-outline') + '</div>',
      'bilan-domaine-intro'));
    // À deux, l'état est relu pendant que l'intro est à l'écran quand le
    // domaine pose une clé de situation (quatre lectures au plus par
    // personne), et encore une fois en partant si l'intro est restée plus de
    // 30 secondes à l'écran.
    var session = S;
    var lecture = S.mode === 'duo' && clesAPoser(dom).length ? relireSituation(S) : null;
    ACTIONS = {
      go: function (b) {
        S.introsVues[dom] = true;
        if (!lecture) return suivante();
        if (b) b.disabled = true;
        if (Date.now() - lecture.quand > 30000) lecture = relireSituation(session);
        var attente = setTimeout(chargement, 200);
        lecture.promesse.then(function () {
          clearTimeout(attente);
          if (S === session) suivante();
        });
      },
      pause: function () { pause(); },
    };
  }

  function afficherQuestion() {
    var item = S.liste[S.index];
    var id = item.id;
    var r = C.INDEX[id];
    var solo = S.mode === 'solo';
    var percu = solo && S.phase === 'autre';
    var v = percu ? S.percu[id] : S.reponses[id];
    var opts = percu ? libellesPercu(id) : libellesOptions(id, S.moi.genre, S.autre.prenom);
    var total = S.liste.length;
    var pct = Math.round((S.index + (percu ? 0.5 : 0)) / total * 100);
    var rond = '<span class="bilan-option-rond" aria-hidden="true"></span>';
    var options = opts.map(function (o, i) {
      var choisie = v === i;
      return '<button type="button" class="bilan-option' + (choisie ? ' choisie' : '') + '" role="radio" aria-checked="' + choisie + '" data-action="choisir" data-v="' + i + '">' +
        rond + '<span>' + esc(ins(o)) + '</span></button>';
    }).join('');
    if (percu) {
      // « Je ne sais pas » : une réponse à part entière, comptée dans les
      // zones d'ombre du rapport.
      options += '<button type="button" class="bilan-option bilan-option--inconnu' + (v === C.INCONNU ? ' choisie' : '') + '" role="radio" aria-checked="' + (v === C.INCONNU) + '" data-action="choisir" data-v="' + C.INCONNU + '">' +
        rond + '<span>' + x('question.inconnu') + '<small>' + x('question.inconnuAide') + '</small></span></button>';
    }
    var nn = '';
    if (r.q.decisif && !percu) {
      nn = '<label class="bilan-nn' + (Number.isInteger(v) ? '' : ' inactif') + '"><input type="checkbox" data-change="nn"' +
        (S.nn.indexOf(id) >= 0 ? ' checked' : '') + (Number.isInteger(v) ? '' : ' disabled') + '> <span>' + x('question.nn') + '</span></label>' +
        '<p class="bilan-note">' + x('question.nnAide') + '</p>';
    }
    var avecSuivante = r.q.decisif || S.revoir || Number.isInteger(v);
    // En solo, l'en-tête dit à qui est la réponse : la sienne, ou celle
    // qu'on prête à l'autre (avec un rappel de la sienne).
    var tete = '';
    if (percu) {
      var mienne = libellesOptions(id, S.moi.genre, S.autre.prenom)[S.reponses[id]] || '';
      tete = '<p class="bilan-phase bilan-phase--autre">' + x('question.percuTitre', { autre: S.autre.prenom }) + '</p>' +
        (mienne ? '<p class="bilan-ma-reponse">' + x('question.maReponse') + ' <strong>' + esc(ins(mienne)) + '</strong></p>' : '');
    } else if (solo) {
      tete = '<p class="bilan-phase">' + x('question.vous') + '</p>';
    }
    var texteQuestion = percu ? enonce(id, S.autre.genre, S.moi.prenom) : enonce(id, S.moi.genre, S.autre.prenom);
    afficher(carte(
      '<div class="bilan-q-tete"><span class="bilan-q-domaine">' + esc(ins(titreDomaine(item.domaine))) + '</span>' +
      '<span>' + x('question.progression', { n: S.index + 1, total: total }) + '</span></div>' +
      '<div class="bilan-barre" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '"><span style="width:' + pct + '%"></span></div>' +
      tete +
      '<h2 class="bilan-q-texte">' + esc(ins(texteQuestion)) + '</h2>' +
      (percu ? '<p class="bilan-note bilan-q-aide">' + x('question.percuAide', { autre: S.autre.prenom }) + '</p>' : '') +
      '<div class="bilan-options" role="radiogroup">' + options + '</div>' + nn +
      '<div class="bilan-q-pied">' +
      (S.index > 0 || percu ? bouton('precedente', '← ' + x('question.precedente'), 'btn-outline btn-sm') : '<span></span>') +
      '<span class="bilan-envoi" id="bilan-envoi" aria-live="polite"></span>' +
      (avecSuivante ? bouton('suivanteQ', x('question.suivante') + ' →', 'btn-cta btn-gradient btn-sm', Number.isInteger(v) ? '' : ' disabled') : '<span></span>') +
      '</div>' +
      '<div class="bilan-q-bas">' + bouton('pause', x('question.pause'), 'btn-link') + '</div>',
      'bilan-question' + (percu ? ' bilan-question--percu' : '')), true);
    garderEnVue();
    etatEnvoi();
    // Après ma réponse : la perception de l'autre en solo, quand elle est
    // demandée, sinon la suite.
    function apres() {
      if (solo && !percu && percuDemandee(id)) { S.phase = 'autre'; afficherQuestion(); } else avancer();
    }
    ACTIONS = {
      choisir: function (b) {
        var val = +b.getAttribute('data-v');
        if (percu) {
          S.percu[id] = val;
        } else {
          S.reponses[id] = val;
          // Une réponse peut ouvrir ou fermer des questions plus loin.
          S.liste = listeQuestions();
          S.index = indexDe(id);
        }
        sauver(false);
        if (r.q.decisif || S.revoir) { afficherQuestion(); return; }
        racine.querySelectorAll('.bilan-option').forEach(function (o) {
          var oui = o === b;
          o.classList.toggle('choisie', oui);
          o.setAttribute('aria-checked', String(oui));
        });
        setTimeout(function () {
          if (S && S.liste[S.index] && S.liste[S.index].id === id && S.phase === (percu ? 'autre' : 'moi')) apres();
        }, 220);
      },
      nn: function (c) {
        var i = S.nn.indexOf(id);
        if (c.checked && i < 0) S.nn.push(id);
        if (!c.checked && i >= 0) S.nn.splice(i, 1);
        sauver(false);
      },
      suivanteQ: function () {
        if (Number.isInteger(percu ? S.percu[id] : S.reponses[id])) apres();
      },
      precedente: function () {
        if (percu) { S.phase = 'moi'; afficherQuestion(); return; }
        S.index = Math.max(0, S.index - 1);
        S.phase = solo && percuDemandee(S.liste[S.index].id) ? 'autre' : 'moi';
        S.introsVues[S.liste[S.index].domaine] = true;
        afficherQuestion();
      },
      pause: function () { pause(); },
    };
  }

  function indexDe(id) {
    for (var i = 0; i < S.liste.length; i++) if (S.liste[i].id === id) return i;
    return 0;
  }

  // La question reste à l'écran sans sauter : on ne défile que si la carte
  // sort de la fenêtre.
  function garderEnVue() {
    var c = racine.querySelector('.bilan-question');
    if (!c) return;
    var r = c.getBoundingClientRect();
    if (r.top < 60 || r.top > window.innerHeight * 0.5) {
      var y = window.pageYOffset + r.top - 80;
      try { window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' }); } catch (e) { window.scrollTo(0, Math.max(0, y)); }
    }
  }

  // ── Enregistrement ──────────────────────────────────────────────────────
  // Chaque réponse part tout de suite ; si un envoi est en cours, la suivante
  // attend et part avec tout ce qui a changé entre-temps (la page envoie
  // toujours la série complète, le serveur la remplace).

  function sauver(fini, apres) {
    if (!S) return;
    S.envoi.sale = true;
    if (fini) S.envoi.fini = true;
    if (apres) S.envoi.attente.push(apres);
    pousser();
  }
  function pousser() {
    var e = S && S.envoi;
    if (!e || e.enCours || !e.sale) return;
    var session = S;
    e.enCours = true;
    e.sale = false;
    var demandeFin = e.fini;
    etatEnvoi('envoi');
    appel('repondre', { id: session.id, jeton: session.jeton, reponses: session.reponses, nn: session.nn, percu: session.percu || undefined, fini: demandeFin })
      .then(function (r) {
        e.enCours = false;
        if (r.statut === 200) {
          if (demandeFin && r.json.fini) e.fini = false;
          var p = r.json.progression || {};
          majEntree(session.id, session.role, { repondu: p.repondu, total: p.total, statut: r.json.etat && r.json.etat.verrouille ? 'resultat' : r.json.fini ? 'fini' : 'encours' });
          session.dernierEtat = r.json.etat;
          if (r.json.etat) majDepuisEtat(session, r.json.etat);
          etatEnvoi(e.sale ? 'envoi' : 'ok');
          if (!e.sale) {
            var a = e.attente; e.attente = [];
            a.forEach(function (f) { try { f(r); } catch (err) { /* rien */ } });
          }
        } else if (r.statut === 409) {
          // L'autre a fini entre-temps : le bilan est figé.
          e.sale = false;
          var b = e.attente; e.attente = [];
          b.forEach(function (f) { try { f(r); } catch (err) { /* rien */ } });
          if (!b.length && S === session) ouvrirResultat(session.entree);
          return;
        } else {
          e.sale = true;
          etatEnvoi('erreur');
          setTimeout(pousser, 4000);
          return;
        }
        pousser();
      })
      .catch(function () {
        e.enCours = false;
        e.sale = true;
        etatEnvoi('horsLigne');
        setTimeout(pousser, 5000);
      });
  }
  function etatEnvoi(quoi) {
    var z = document.getElementById('bilan-envoi');
    if (!z) return;
    var e = S && S.envoi;
    var q = quoi || (e && (e.enCours || e.sale) ? 'envoi' : '');
    z.className = 'bilan-envoi' + (q ? ' bilan-envoi--' + q : '');
    z.textContent = q === 'ok' ? remplir(tr('question.enregistre', ''), {}) + ' ✓'
      : q === 'horsLigne' ? ins(remplir(tr('question.horsLigne', ''), {}))
      : q === 'erreur' ? ins(remplir(tr('question.erreur', ''), {}))
      : '';
  }
  // En quittant la page, ce qui n'est pas parti part quand même.
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState !== 'hidden' || !S || !S.envoi.sale || S.envoi.enCours) return;
    S.envoi.sale = false;
    appel('repondre', { id: S.id, jeton: S.jeton, reponses: S.reponses, nn: S.nn, percu: S.percu || undefined, fini: S.envoi.fini }, true).catch(function () {});
  });

  function pause(reprise) {
    var session = S;
    sauver(false);
    var p = C.progression(session.situation, session.reponses, session.percu || undefined);
    afficher(carte(
      duo('dort', 'repos', 76, session.moi.genre, session.autre.genre) +
      '<h2 class="bilan-titre">' + x('pause.titre') + '</h2>' +
      '<p class="bilan-texte">' + x('pause.progression', { n: p.repondu, total: p.total }) + '</p>' +
      '<p class="bilan-texte">' + x('pause.texte') + '</p>' +
      '<div class="bilan-actions">' + bouton('reprendre', x('pause.reprendre')) +
      bouton('copierMoi', x('invitation.copierMonLien'), 'btn-outline') + '</div>' +
      blocLien(session.moi && session.moi.email), 'bilan-pause'));
    ACTIONS = {
      reprendre: function () { S = session; if (reprise) reprise(); else suivante(); },
      copierMoi: function (b) { copier(lienPersonnel(session.id, session.jeton), b); },
      envoyerLien: function (b) { envoyerLien(b, session.id, session.jeton); },
    };
  }

  function terminer() {
    var session = S;
    // L'adresse où envoyer le rapport, demandée ici depuis le 21 octobre
    // 2026 : sans elle, le serveur ne marque pas fini.
    // Une adresse venue de « Recevoir mon lien par e-mail » n'a pas eu, sous
    // son champ, la phrase qui annonce le « prêt » et le rappel (`rappel`
    // faux) : la fin la redemande, préremplie (24 octobre 2026).
    if (!session.moi.email || session.moi.rappel === false) return ecranEmail(session);
    afficher(carte('<p class="bilan-centre">' + x('chargement') + '</p>', 'bilan-chargement'), true);
    sauver(true, function (r) {
      if (r.statut === 409) return ouvrirResultat(session.entree);
      var etat = r.json.etat;
      if (etat && etat.verrouille) return ouvrirResultat(session.entree);
      if (r.json.fini) return attente(session.entree, etat);
      if (r.json.emailManque) { S = session; session.moi.email = null; return ecranEmail(session); }
      // Il manque encore des réponses (une question ouverte par une autre),
      // ou une clé de situation jamais donnée : on la pose.
      S = session;
      S.liste = listeQuestions();
      S.index = premierSansReponse();
      if (S.index >= S.liste.length && !C.situationValide(S.situation)) {
        var manque = C.SITUATION.map(function (it) { return it.id; }).filter(function (k) { return !connue(k); });
        return questionSituation(C.DOMAINE_DE_CLE[manque[0]] || C.ORDRE[0], manque, 0);
      }
      suivante();
    });
  }

  // Toutes les réponses sont là : l'adresse où partira le rapport, juste
  // avant l'offre. Obligatoire, et le PDF y part tout seul ; la phrase sous
  // le champ annonce l'e-mail « rapport prêt » et le rappel (`rappel`).
  function ecranEmail(session) {
    S = session;
    afficher(carte(
      duo('joie', 'mignon', 76, session.moi.genre, session.autre.genre) +
      '<h2 class="bilan-titre">' + x('fin.titre') + '</h2>' +
      '<p class="bilan-texte">' + x('fin.texte', { autre: session.autre.prenom }) + '</p>' +
      champEmailFin(session.moi.email || '', session.autre.prenom) +
      '<p class="bilan-alerte" id="bilan-erreur" hidden></p>' +
      '<div class="bilan-actions">' + bouton('valider', x('fin.bouton')) + '</div>' +
      '<div class="bilan-q-bas">' + bouton('precedente', '← ' + x('fin.revenir'), 'btn-link') + '</div>', 'bilan-fin-email'));
    compterVue('email_vue', { mode: session.mode, id: session.id, cle: session.role });
    var champ = document.getElementById('bilan-email');
    function erreur(cle) {
      var p = document.getElementById('bilan-erreur');
      p.textContent = ins(remplir(tr(cle, ''), {}));
      p.hidden = false;
      champ.focus();
    }
    champ.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); ACTIONS.valider(racine.querySelector('[data-action="valider"]')); }
    });
    ACTIONS = {
      valider: function (b) {
        var email = (champ.value || '').trim();
        if (!email) return erreur('creation.emailManque');
        if (!emailValide(email)) return erreur('creation.emailFaux');
        b.disabled = true;
        // La phrase sous le champ annonce le « prêt », le rappel et, à deux,
        // un mot si l'autre tarde à finir (`reprise`, 24 octobre 2026).
        appel('email', { id: session.id, jeton: session.jeton, email: email, rappel: true, reprise: session.mode !== 'solo' }).then(function (r) {
          b.disabled = false;
          if (r.statut !== 200) return erreur(r.json.erreur === 'email' ? 'creation.emailFaux' : 'erreurs.serveur');
          session.moi.email = r.json.email || email;
          session.moi.rappel = true;
          terminer();
        }).catch(function () { b.disabled = false; erreur('erreurs.reseau'); });
      },
      // Revenir sur la dernière question, pour changer une réponse.
      precedente: function () {
        S = session;
        S.index = Math.max(0, S.liste.length - 1);
        S.phase = S.mode === 'solo' && percuDemandee(S.liste[S.index].id) ? 'autre' : 'moi';
        S.introsVues[S.liste[S.index].domaine] = true;
        afficherQuestion();
      },
    };
  }

  // ── Mes réponses sont finies : l'attente, et le rapport à débloquer ─────
  // Aucun résultat avant le paiement (Thomas, 18 octobre 2026). Celui qui a
  // fini ses réponses peut payer tout de suite : le rapport s'ouvrira, et
  // partira par e-mail, dès que l'autre aura fini.

  function paiementOuvert(etat) {
    return !!(etat.paiementOuvert && (CFG.ouvert !== false || etat.paiementTest));
  }

  function blocAutre(entree, etat) {
    var autre = etat.autre.prenom;
    var pct = etat.autre.total ? Math.round(etat.autre.repondu / etat.autre.total * 100) : 0;
    var ligne = etat.autre.rejoint
      ? x('attente.autreProgression', { autre: autre, n: nombre(etat.autre.repondu), total: etat.autre.total ? nombre(etat.autre.total) : '…' })
      : x('attente.autrePasRejoint', { autre: autre });
    return '<div class="bilan-autre"><p>' + ligne + '</p>' +
      (etat.autre.rejoint ? '<div class="bilan-barre bilan-barre--autre"><span style="width:' + pct + '%"></span></div>' : '') +
      '<div class="bilan-actions bilan-actions--gauche">' +
      (!etat.autre.rejoint && etat.role === 'a' ? bouton('renvoyer', x('attente.renvoyer'), 'btn-outline btn-sm')
        : etat.autre.rejoint ? bouton('relancer', x('attente.relance', { autre: autre }), 'btn-outline btn-sm') : '') +
      '</div></div>';
  }

  // Le champ de l'adresse où recevoir le PDF.
  function champEmail(valeur, id) {
    return '<div class="bilan-champ bilan-email"><label for="' + id + '">' + x('paywall.emailLabel') + '</label>' +
      '<input id="' + id + '" class="bilan-input" type="email" inputmode="email" autocomplete="email" maxlength="254" placeholder="' + x('paywall.emailPlaceholder') + '" value="' + esc(valeur || '') + '">' +
      '<p class="bilan-note">' + x('paywall.emailAide') + '</p></div>';
  }
  function emailValide(v) {
    return /^[^\s@<>()[\]",;:\\]{1,64}@[^\s@<>()[\]",;:\\.]+(\.[^\s@<>()[\]",;:\\.]+)+$/.test(v) && /\.[a-z]{2,}$/i.test(v) && v.length <= 254;
  }

  // L'aperçu de l'écran « rapport prêt » (resultat 402, apercu) : combien
  // d'accords, de réponses proches, d'écarts et de sujets décisifs en
  // désaccord, jamais lesquels (21 octobre 2026, Thomas a accepté cette
  // entorse à « aucun résultat gratuit »). Un serveur plus ancien n'envoie
  // rien : l'écran garde alors sa phrase d'avant.
  // Le radar de la synthèse, avant le paiement (22 octobre 2026, Thomas :
  // « une partie des résultats gratuite, mais vraiment rien, genre juste la
  // synthèse, le graphique araignée ») : dessiné par le gabarit du rapport
  // (window.QCBilanRapport.radar) à partir des scores des domaines que le
  // serveur envoie avec les comptes. Rien de plus : ni chiffre, ni question.
  function radarApercu(liste) {
    var R = window.QCBilanRapport;
    if (!liste || liste.length < 3 || !R || typeof R.radar !== 'function') return '';
    var bref = function (id) { return (Q && Q.domaines[id] && (Q.domaines[id].bref || Q.domaines[id].titre)) || id; };
    var dessin = R.radar(liste, bref, remplir(tr('rapport.synthese.radar', ''), {}), true);
    if (!dessin) return '';
    var cles = ['fort', 'moyen', 'faible'].map(function (b) {
      return '<span class="bilan-radar-cle bilan-radar-cle--' + b + '"><span aria-hidden="true"></span>' + x('rapport.carte.bandes.' + b) + '</span>';
    }).join('');
    return '<div class="bilan-apercu-radar"><p class="bilan-apercu-radar-titre">' + x('rapport.synthese.radar') + '</p>' + dessin +
      '<p class="bilan-apercu-radar-cles">' + cles + '</p></div>';
  }

  function blocApercu(ap, autre) {
    if (!ap) return '';
    var tuiles = [['accord', ap.accords, 'accords'], ['proche', ap.proches, 'proches'], ['ecart', ap.ecarts, 'ecarts']];
    var lignes = [];
    if (ap.ecarts > 0) lignes.push(x(ap.decisifs === 0 ? 'paywall.apercu.decisifs0' : ap.decisifs === 1 ? 'paywall.apercu.decisifsUn' : 'paywall.apercu.decisifsN', { n: nombre(ap.decisifs) }));
    if (MODE === 'solo' && ap.inconnus > 0) lignes.push(x(ap.inconnus === 1 ? 'paywall.apercu.inconnusUn' : 'paywall.apercu.inconnusN', { n: nombre(ap.inconnus), autre: autre }));
    return radarApercu(ap.radar) +
      '<p class="bilan-pret-intro">' + x('paywall.apercu.intro', { autre: autre }) + '</p>' +
      '<div class="bilan-tuiles">' + tuiles.map(function (t) {
        return '<div class="bilan-tuile bilan-tuile--' + t[0] + '"><span class="bilan-tuile-n">' + esc(nombre(t[1])) + '</span>' +
          '<span class="bilan-tuile-l">' + x('paywall.apercu.' + t[2] + (t[1] === 1 ? 'Un' : 'N')) + '</span></div>';
      }).join('') + '</div>' +
      (lignes.length ? '<p class="bilan-pret-decisif">' + lignes.join(' ') + '</p>' : '') +
      '<p class="bilan-pret-quoi">' + x('paywall.apercu.quoi') + '</p>';
  }

  // Ce que contient le rapport, avec leurs chiffres (25 octobre 2026 : 39
  // couples avaient vu l'écran « rapport prêt », 3 avaient payé ; le sommaire
  // était dans la carte du dessous, et rien ne disait dans la première ce
  // qu'on achetait). À deux, l'accroche est ce qu'on n'a pas encore vu : les
  // réponses de l'autre. Rien du contenu, seulement les comptes de l'aperçu.
  function blocPoints(ap, autre) {
    var v = { autre: autre };
    var points = [x('paywall.points.reponses', v)];
    if (ap.ecarts > 1) points.push(x('paywall.points.ecartsN', { n: nombre(ap.ecarts), autre: autre }));
    else if (ap.ecarts === 1) points.push(x('paywall.points.ecartsUn', v));
    else if (ap.proches > 0) points.push(x('paywall.points.ecarts0', v));
    else points.push(x('paywall.points.accords', v));
    if (MODE === 'solo' && ap.inconnus > 0) points.push(x(ap.inconnus === 1 ? 'paywall.points.ombreUn' : 'paywall.points.ombreN', { n: nombre(ap.inconnus), autre: autre }));
    if (ap.conversations > 1) points.push(x('paywall.points.conversationsN', { n: nombre(ap.conversations) }));
    else if (ap.conversations === 1) points.push(x('paywall.points.conversationsUn'));
    if (MODE !== 'solo') points.push(x('paywall.points.climat'));
    points.push(x('paywall.points.pdf'));
    return '<div class="bilan-inclus"><h3 class="bilan-inclus-titre">' + x('paywall.accroche', v) + '</h3>' +
      '<ul class="bilan-inclus-liste">' + points.map(function (p) { return '<li>' + p + '</li>'; }).join('') + '</ul></div>';
  }

  // Le prix. À deux, partagé en deux colonnes, une par personne avec son
  // personnage (25 octobre 2026, Thomas : « le prix divisé par deux en
  // colonne pour montrer que quand on divise par deux (vu que c'est un
  // couple) ça fait à peine plus de 3€ ») ; seul(e), le prix seul. La moitié
  // vient du prix que la page affiche (CFG.prixCentimes, celui des textes),
  // pour que les deux colonnes fassent toujours le total écrit dessous.
  function blocPrix(etat, promo) {
    var c = CFG.prixCentimes || etat.prix || 0;
    var deux = MODE !== 'solo' && c > 0;
    var html = '<div class="bilan-prix' + (deux ? ' bilan-prix--deux' : '') + '">' +
      (promo ? '<p class="bilan-prix-pastille"><span class="promo-pastille">' + esc(promo.badge) + '</span></p>' : '');
    if (deux) {
      var chacun = prixEcrit(Math.round(c / 2));
      var part = function (p, rang) {
        var nom = perso(p.genre, rang);
        return '<span class="bilan-part bilan-part--' + nom + '">' + mascotte(nom, 'joie', 58) +
          '<span class="bilan-part-nom">' + esc(p.prenom) + '</span><span class="bilan-part-prix">' + esc(chacun) + '</span></span>';
      };
      html += '<div class="bilan-partage" aria-hidden="true">' + part(etat.moi, 0) + '<span class="bilan-part-plus">+</span>' + part(etat.autre, 1) + '</div>' +
        '<p class="bilan-note bilan-prix-cine"><span class="sr-only">' + x('paywall.chacunSr', { chacun: chacun }) + ' </span>' + x('paywall.cine') + '</p>';
    }
    return html +
      '<p class="bilan-prix-montant">' + (deux ? '<span class="bilan-prix-egal" aria-hidden="true">=</span> ' : '') + avecPromo(x('paywall.prix'), !!promo) + '</p>' +
      (promo ? '<p class="bilan-note bilan-prix-code">' + esc(promo.code) + '</p>' : '') +
      '<p class="bilan-note">' + x('paywall.prixAide', { autre: etat.autre.prenom }) + '</p></div>' +
      '<p class="bilan-note bilan-centre bilan-prix-conseiller">' + x('paywall.conseiller') + '</p>';
  }

  // Sous le bouton : le paiement par Stripe, les moyens de paiement de la
  // page de vente (CFG.paiements, dessinés par bilan-couple.ejs) et ce qui se
  // passe une fois payé.
  var CADENAS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>';
  function blocConfiance(pret) {
    var moyens = Array.isArray(CFG.paiements) ? CFG.paiements : [];
    return '<div class="bilan-confiance"><p class="bilan-confiance-ligne">' + CADENAS + '<span>' + x('paywall.securite') + '</span></p>' +
      (moyens.length ? '<ul class="bilan-moyens" role="list" aria-label="' + x('paywall.moyens') + '">' + moyens.map(function (m) {
        return '<li class="bilan-moyen" title="' + esc(m.nom) + '">' + m.svg + '<span class="sr-only">' + esc(m.nom) + '</span></li>';
      }).join('') + '</ul>' : '') +
      (pret ? '<p class="bilan-note bilan-centre bilan-immediat">' + x('paywall.immediat') + '</p>' : '') + '</div>';
  }

  // La barre collée de l'écran « rapport prêt » : visible tant
  // que le bloc d'achat (prix, case, bouton) n'est pas à l'écran, et un appui
  // y descend. Elle ne paie pas elle-même : la case de la renonciation doit
  // être cochée avant.
  var obsColle = null;
  function barreColle(promo) {
    return '<div class="bilan-colle" id="bilan-colle" hidden><span class="bilan-colle-texte"><span class="bilan-colle-nom">' + x('paywall.colle') + '</span>' +
      '<span class="bilan-colle-prix">' + (promo ? promo.html : esc(CFG.prix || '')) + '</span></span>' +
      bouton('versAchat', x('paywall.colleBouton'), 'btn-cta btn-gradient btn-sm') + '</div>';
  }
  function surveillerColle() {
    if (obsColle) { obsColle.disconnect(); obsColle = null; }
    var colle = document.getElementById('bilan-colle');
    var achat = document.getElementById('bilan-achat');
    if (!colle || !achat || !('IntersectionObserver' in window)) return;
    obsColle = new IntersectionObserver(function (entrees) {
      colle.hidden = entrees[entrees.length - 1].isIntersecting;
    }, { threshold: 0 });
    obsColle.observe(achat);
  }
  function versAchat() {
    var achat = document.getElementById('bilan-achat');
    if (!achat) return;
    try { achat.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) { achat.scrollIntoView(true); }
  }

  // Le sommaire du rapport et sa couverture à leurs prénoms : les chapitres
  // de rapport.mjs (chapitresListe), dans le même ordre.
  function sommaire(etat) {
    var cles = ['synthese', 'carte', 'conversations', 'bloquants'].concat(MODE === 'solo' ? ['ombre'] : [])
      .concat(['climat', 'signaux', 'roles', 'domaines', 'fin', 'suite']);
    var couv = '<div class="bilan-couv" aria-hidden="true"><p class="bilan-couv-de">' + x('rapport.couverture.de') + '</p>' +
      '<p class="bilan-couv-noms">' + esc(etat.moi.prenom) + (MODE === 'solo' ? '' : '<span class="bilan-couv-et">' + x('rapport.couverture.et') + '</span>' + esc(etat.autre.prenom)) + '</p>' +
      '<p class="bilan-couv-marque">Quiz Couple</p></div>';
    return '<h3 class="bilan-sous-titre">' + x('paywall.sommaire') + '</h3><div class="bilan-sommaire">' + couv +
      '<ol class="bilan-sommaire-liste">' + cles.map(function (k, i) {
        return '<li><span class="bilan-sommaire-num">' + (i < 9 ? '0' : '') + (i + 1) + '</span><span>' + x('rapport.chapitres.' + k) + '</span></li>';
      }).join('') + '</ol></div>';
  }

  // L'offre. pret : le rapport attend (les deux ont fini, ou la personne
  // seule) ; l'écran « rapport prêt » met le titre, l'aperçu, le prix, la case
  // et le bouton dans le premier écran d'un téléphone, et le sommaire dans une
  // seconde carte (21 octobre 2026 : sur 24 personnes au bout des cent
  // questions, une seule avait ouvert la page de paiement ; le bouton était à
  // deux écrans et demi du haut, sous un rapport d'exemple illisible). Sinon,
  // on a fini et l'autre pas encore : l'offre repliée sous l'attente.
  // tete : le haut de l'écran « rapport prêt ».
  function offre(etat, pret, tete) {
    var autre = etat.autre.prenom;
    if (!paiementOuvert(etat)) {
      return carte('<h3 class="bilan-sous-titre">' + x('paywall.titre') + '</h3><p class="bilan-alerte bilan-alerte--doux">' + x('paywall.ferme') + '</p>', 'bilan-offre');
    }
    // La réduction, seulement si le serveur dit qu'il l'appliquera (une
    // fonction plus ancienne ne le dit pas : rien n'est affiché).
    var promo = promoAffichee(etat.promo ? true : false);
    var achat = '<div class="bilan-achat" id="bilan-achat">' + blocPrix(etat, promo) +
      // Sans adresse connue (évaluation d'avant le 20 octobre 2026), le champ
      // reste ici ; sinon il est replié sous le sommaire.
      (etat.moi.email ? '' : champEmail('', 'bilan-email-paie')) +
      '<label class="bilan-case bilan-case--serree"><input type="checkbox" id="bilan-renonce"> <span>' + x('paywall.renonciation') + '</span></label>' +
      '<p class="bilan-alerte" id="bilan-erreur" hidden></p>' +
      '<div class="bilan-actions">' + bouton('payer', x('paywall.bouton'), 'btn-cta btn-gradient btn-lg') + '</div>' +
      blocConfiance(pret) + '</div>';
    var suite = sommaire(etat) +
      (etat.moi.email ? '<details class="bilan-email-autre bilan-offre-email"><summary>' + x('paywall.emailAutre') + '</summary>' + champEmail(etat.moi.email, 'bilan-email-paie') + '</details>' : '') +
      '<p class="bilan-note bilan-centre"><a href="' + esc(CFG.cgv) + '" target="_blank" rel="noopener">' + x('paywall.cgv') + '</a> · ' + x('paywall.tva') + '</p>';
    if (pret) return carte(tete + achat, 'bilan-offre bilan-offre--pret') + carte(suite, 'bilan-offre-suite') + barreColle(promo);
    return carte('<details class="bilan-offre-plie"><summary><span class="bilan-offre-plie-titre">' + x('paywall.plie') + '</span>' +
      '<span class="bilan-offre-plie-prix">' + avecPromo(x('paywall.prix'), !!promo) + '</span></summary>' +
      '<p class="bilan-offre-intro">' + x('paywall.introAttente', { autre: autre }) + '</p>' + achat + suite + '</details>', 'bilan-offre bilan-offre--attente');
  }

  function actionsOffre(entree, mode) {
    return {
      versAchat: versAchat,
      payer: function (b) {
        var err = document.getElementById('bilan-erreur');
        var montre = function (cle) { err.textContent = ins(remplir(tr(cle, ''), {})); err.hidden = false; };
        var champ = document.getElementById('bilan-email-paie');
        var email = champ ? (champ.value || '').trim() : '';
        if (email && !emailValide(email)) { if (champ) champ.focus(); return montre('paywall.emailFaux'); }
        if (!document.getElementById('bilan-renonce').checked) {
          compterVue('case_manquante', { mode: mode, id: entree.id });
          return montre('paywall.renonciationManque');
        }
        err.hidden = true;
        b.disabled = true;
        b.textContent = remplir(tr('paywall.redirection', ''), {});
        appel('payer', { id: entree.id, jeton: entree.jeton, renonciation: true, lang: LANG, email: email || undefined }).then(function (r) {
          if (r.statut === 200 && r.json.url) { location.href = r.json.url; return; }
          if (r.statut === 200 && r.json.paye) { ouvrir(entree); return; }
          b.disabled = false;
          b.innerHTML = x('paywall.bouton');
          montre(r.json.erreur === 'paiement_ferme' ? 'paywall.ferme' : 'erreurs.serveur');
        }).catch(function () {
          b.disabled = false;
          b.innerHTML = x('paywall.bouton');
          montre('erreurs.reseau');
        });
      },
    };
  }

  // Le bloc « recevoir le rapport par e-mail », une fois payé.
  // Le PDF part tout seul aux adresses connues (création, acceptation de
  // l'invitation, reçu Stripe) : le bloc dit où il est parti ou où il
  // partira, et ne demande rien. Changer d'adresse reste possible, replié.
  function blocEmail(etat) {
    var r = etat.rapport || {};
    var dest = (r.envoiA || []).join(', ');
    var ligne = dest
      ? '<p class="bilan-texte bilan-email-etat">' + x(r.envoye ? 'rapport.ecran.envoyeA' : 'rapport.ecran.envoiA', { emails: dest }) + '</p>'
      : '<p class="bilan-texte bilan-email-etat">' + x('rapport.ecran.envoiSans') + '</p>';
    return '<div class="bilan-email-bloc"><h3 class="bilan-sous-titre">' + x('rapport.ecran.emailTitre') + '</h3>' + ligne +
      '<details class="bilan-email-autre"><summary>' + x('rapport.ecran.emailAutre') + '</summary>' +
      '<div class="bilan-email-ligne"><input id="bilan-email" class="bilan-input" type="email" inputmode="email" autocomplete="email" maxlength="254" placeholder="' + x('paywall.emailPlaceholder') + '" value="' + esc(etat.moi.email || '') + '" aria-label="' + x('rapport.ecran.emailChamp') + '">' +
      bouton('email', x('rapport.ecran.emailBouton'), 'btn-outline') + '</div>' +
      '<p class="bilan-note" id="bilan-email-msg" aria-live="polite">' + x('rapport.ecran.emailAide') + '</p></details></div>';
  }
  function actionEmail(entree) {
    return function (b) {
      var champ = document.getElementById('bilan-email');
      var msg = document.getElementById('bilan-email-msg');
      var v = (champ.value || '').trim();
      if (!emailValide(v)) { msg.textContent = ins(remplir(tr('rapport.ecran.emailFaux', ''), {})); msg.className = 'bilan-note bilan-erreur-texte'; champ.focus(); return; }
      b.disabled = true;
      appel('email', { id: entree.id, jeton: entree.jeton, email: v }).then(function (r) {
        b.disabled = false;
        if (r.statut !== 200) { msg.textContent = ins(remplir(tr(r.json.erreur === 'email' ? 'rapport.ecran.emailFaux' : 'erreurs.serveur', ''), {})); msg.className = 'bilan-note bilan-erreur-texte'; return; }
        msg.textContent = ins(remplir(tr('rapport.ecran.emailOk', ''), {}));
        msg.className = 'bilan-note bilan-ok-texte';
      }).catch(function () { b.disabled = false; msg.textContent = ins(remplir(tr('erreurs.reseau', ''), {})); msg.className = 'bilan-note bilan-erreur-texte'; });
    };
  }

  function attente(entree, etat) {
    S = null;
    var autre = etat.autre.prenom;
    var paye = !!etat.paye;
    var html = carte(
      duo('joie', 'repos', 86, etat.moi.genre, etat.autre.genre) +
      '<h2 class="bilan-titre">' + x(paye ? 'attente.payeTitre' : 'attente.titre') + '</h2>' +
      '<p class="bilan-texte">' + x(paye ? 'attente.payeTexte' : 'attente.texte', { autre: autre }) + '</p>' +
      // L'e-mail « rapport prêt » partira dès que l'autre aura fini.
      (!paye && etat.moi.prevenu && etat.moi.email ? '<p class="bilan-prevenu">' + x('attente.prevenu', { email: etat.moi.email, autre: autre }) + '</p>' : '') +
      blocAutre(entree, etat) +
      (paye ? blocEmail(etat) : '') +
      '<p class="bilan-note">' + x('attente.maj') + '</p>', 'bilan-attente') +
      (paye ? '' : offre(etat, false)) +
      carte('<div class="bilan-actions bilan-actions--gauche">' + bouton('revoir', x('attente.revoir'), 'btn-outline btn-sm') + '</div>' +
        '<p class="bilan-note">' + x('attente.revoirAide', { autre: autre }) + '</p>', 'bilan-carte--discrete');
    afficher(html);
    if (!paye) compterVue('attente_vue', { mode: etat.mode, id: entree.id });
    var actions = actionsOffre(entree, etat.mode);
    actions.renvoyer = function (b) {
      if (entree.invitation) return invitation(entree, etat);
      // Le lien de la création n'est pas sur cet appareil : un nouveau lien,
      // l'ancien ne marche plus (action `inviter`, 24 octobre 2026).
      b.disabled = true;
      appel('inviter', { id: entree.id, jeton: entree.jeton }).then(function (r) {
        b.disabled = false;
        if (r.statut !== 200 || !r.json.invitation) return;
        entree.invitation = r.json.invitation;
        entree.invitationNeuve = true;
        majEntree(entree.id, entree.role, { invitation: r.json.invitation });
        invitation(entree, etat);
      }).catch(function () { b.disabled = false; });
    };
    actions.relancer = function (b) { relancer(b, autre); };
    actions.revoir = function () { commencerSession(entree, etat, true); };
    actions.email = actionEmail(entree);
    ACTIONS = actions;
    var verifier = function () {
      if (document.visibilityState !== 'visible') return;
      appel('etat', { id: entree.id, jeton: entree.jeton }).then(function (r) {
        if (r.statut !== 200 || !racine.querySelector('.bilan-attente')) return;
        var e = r.json;
        if (e.verrouille) return ouvrirResultat(entree);
        // On ne redessine pas sous les doigts de quelqu'un qui écrit.
        var actif = document.activeElement;
        if (actif && racine.contains(actif) && /INPUT|TEXTAREA/.test(actif.tagName)) return;
        if (e.autre.repondu !== etat.autre.repondu || e.autre.rejoint !== etat.autre.rejoint || e.paye !== etat.paye) attente(entree, e);
      }).catch(function () {});
    };
    minuteur = setInterval(verifier, 15000);
    verifAttente = verifier;
  }
  // Au retour sur l'onglet, l'écran d'attente regarde tout de suite.
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible' && verifAttente) verifAttente();
  });

  // Un petit message à l'autre, sans lien : il reprend sur son téléphone.
  function relancer(b, autre) {
    var message = remplir(tr('attente.relanceMessage', ''), { autre: autre });
    if (navigator.share) {
      navigator.share({ text: message }).catch(function () {});
      return;
    }
    copier(message, b);
  }

  // ── Le résultat ─────────────────────────────────────────────────────────

  function ouvrirResultat(entree, message) {
    S = null;
    chargement();
    appel('resultat', { id: entree.id, jeton: entree.jeton }).then(function (r) {
      if (r.statut === 404) { oublier(entree.id, entree.role); return messageErreur('introuvable', accueil); }
      if (r.statut === 402) {
        // Pas encore payé : l'offre, seule. Si l'un des deux n'a pas fini, on
        // repart de l'état (questions ou attente).
        if (!r.json.deuxFinis) return ouvrir(entree);
        majEntree(entree.id, entree.role, { statut: 'pret' });
        return aDebloquer(entree, r.json, message);
      }
      if (r.statut === 409) return ouvrir(entree);
      if (r.statut !== 200) return messageErreur(r.json.erreur, function () { ouvrirResultat(entree, message); });
      majEntree(entree.id, entree.role, { statut: 'resultat' });
      rapport(entree, r.json, message);
    }).catch(function () { messageErreur('reseau', function () { ouvrirResultat(entree, message); }); });
  }

  // Les deux ont fini, rien n'est payé : un seul écran, l'offre.
  function aDebloquer(entree, res, message) {
    MODE = res.mode === 'solo' ? 'solo' : 'duo';
    var moi = res.role === 'a' ? res.a : res.b;
    var autre = res.role === 'a' ? res.b : res.a;
    var etat = {
      paiementOuvert: res.paiementOuvert, paiementTest: res.paiementTest, promo: res.promo || null, prix: res.prix,
      moi: { prenom: moi.prenom, genre: moi.genre, email: res.moiEmail || null }, autre: { prenom: autre.prenom, genre: autre.genre },
    };
    var ap = res.apercu || null;
    afficher(
      (message ? carte('<p class="bilan-alerte bilan-alerte--doux">' + message + '</p>') : '') +
      offre(etat, true,
        '<p class="bilan-pret-sur">' + x('rapport.surtitre') + '</p>' +
        '<h2 class="bilan-titre bilan-pret-titre">' + x('paywall.pretTitre', { moi: moi.prenom, autre: autre.prenom }) + '</h2>' +
        (ap ? blocApercu(ap, autre.prenom) + blocPoints(ap, autre.prenom) : '<p class="bilan-offre-intro">' + x('paywall.introPret', { autre: autre.prenom }) + '</p>')));
    compterVue('offre_vue', { mode: MODE, id: entree.id });
    ACTIONS = actionsOffre(entree, MODE);
    surveillerColle();
  }

  function retourPaiement(id, session) {
    var entree = entreeDe(id);
    nettoyerUrl();
    if (!entree) return accueil();
    afficher(carte('<p class="bilan-centre">' + x('paiement.verification') + '</p>', 'bilan-chargement'));
    var essais = 0;
    var essai = function () {
      appel('verifier', { id: id, jeton: entree.jeton, session: session }).then(function (r) {
        if (r.statut === 200 && r.json.paye) return ouvrirResultat(entree, x('paiement.ok'));
        if (++essais < 8) {
          afficher(carte('<p class="bilan-centre">' + x('paiement.attente') + '</p>', 'bilan-chargement'));
          return setTimeout(essai, 2500);
        }
        ouvrirResultat(entree, x('paiement.erreur'));
      }).catch(function () {
        if (++essais < 8) return setTimeout(essai, 3000);
        ouvrirResultat(entree, x('paiement.erreur'));
      });
    };
    essai();
  }

  // ── Le rapport ──────────────────────────────────────────────────────────
  // Le même gabarit que le PDF (window.QCBilanRapport, construit depuis
  // supabase/functions/_shared/bilan/rapport.mjs), en version écran.

  function feuilleRapport() {
    if (document.getElementById('bilan-rapport-css')) return;
    var l = document.createElement('link');
    l.id = 'bilan-rapport-css';
    l.rel = 'stylesheet';
    l.href = '/css/bilan-rapport.css' + (window.__QCV ? '?v=' + window.__QCV : '');
    document.head.appendChild(l);
  }

  function rapport(entree, res, message) {
    MODE = res.mode === 'solo' ? 'solo' : 'duo';
    feuilleRapport();
    var R = window.QCBilanRapport;
    if (!R) return messageErreur('serveur', function () { ouvrirResultat(entree, message); });
    var corps;
    try {
      corps = R.rapportHtml(res, T, Q, { format: 'ecran' }).html;
    } catch (e) {
      return messageErreur('serveur', function () { ouvrirResultat(entree, message); });
    }
    var r = res.rapport || {};
    var etatPdf = r.pret ? '' : '<p class="bilan-note" id="bilan-pdf-etat">' + x(r.statut === 'erreur' ? 'rapport.ecran.pdfErreur' : 'rapport.ecran.pdfPrepa') + '</p>';
    var etatEmail = { rapport: r, moi: { email: res.moiEmail || null } };
    afficher(
      (message ? carte('<p class="bilan-alerte bilan-alerte--doux">' + message + '</p>') : '') +
      carte('<div class="bilan-rapport-barre">' +
        '<div class="bilan-actions bilan-actions--gauche">' + bouton('pdf', x('rapport.ecran.telecharger')) + '</div>' + etatPdf +
        '</div>' + blocEmail(etatEmail), 'bilan-rapport-outils') +
      '<div class="bilan-rapport">' + corps + '</div>' +
      carte('<p class="bilan-note">' + x('rapport.ecran.garde') + '</p>' +
        '<div class="bilan-actions bilan-actions--gauche">' + bouton('supprimer', x('rapport.ecran.supprimer'), 'btn-outline btn-sm') + '</div>' +
        '<p class="bilan-note">' + x('rapport.ecran.supprimerAide') + '</p>', 'bilan-carte--discrete'),
      !!message);
    if (pdfDemande) {
      // Une seule fois : revenir sur la page ne relance pas le téléchargement.
      pdfDemande = false;
      if (r.pret) setTimeout(function () {
        var b = racine.querySelector('[data-action="pdf"]');
        if (b && ACTIONS.pdf) ACTIONS.pdf(b);
      }, 300);
    }
    ACTIONS = {
      pdf: function (b) {
        b.disabled = true;
        appel('pdf', { id: entree.id, jeton: entree.jeton }).then(function (rr) {
          b.disabled = false;
          if (rr.statut === 200 && rr.json.pret && rr.json.url) { location.href = rr.json.url; return; }
          var z = document.getElementById('bilan-pdf-etat');
          if (!z) {
            z = document.createElement('p');
            z.className = 'bilan-note';
            z.id = 'bilan-pdf-etat';
            b.parentNode.parentNode.appendChild(z);
          }
          z.textContent = ins(remplir(tr(rr.json.statut === 'erreur' ? 'rapport.ecran.pdfErreur' : 'rapport.ecran.pdfPrepa', ''), {}));
        }).catch(function () { b.disabled = false; });
      },
      email: actionEmail(entree),
      supprimer: function (b) {
        confirmerDeuxFois(b, x('rapport.ecran.supprimerConfirmer'), function () {
          b.disabled = true;
          appel('supprimer', { id: entree.id, jeton: entree.jeton }).then(function (rr) {
            if (rr.statut !== 200) { b.disabled = false; return; }
            oublier(entree.id);
            afficher(carte('<p class="bilan-texte">' + x('rapport.ecran.supprime') + '</p>' +
              '<div class="bilan-actions">' + bouton('accueil', x('attente.accueil'), 'btn-outline') + '</div>'));
          }).catch(function () { b.disabled = false; });
        });
      },
    };
  }

  // ── Le mode focus ───────────────────────────────────────────────────────
  // La page est d'abord une présentation. Dès que quelqu'un commence, ou
  // arrive par un lien, l'application prend toute la place : la
  // présentation est masquée, le bouton « retour » du navigateur la rend.

  var enFocus = false;
  function focus(oui, sansHistorique) {
    if (oui === enFocus) return;
    enFocus = oui;
    document.body.classList.toggle('bilan-focus', oui);
    if (oui && !sansHistorique) {
      try { history.pushState({ bilanFocus: true }, '', location.pathname); } catch (e) { /* rien */ }
    }
    window.scrollTo(0, 0);
  }
  window.addEventListener('popstate', function () {
    if (!enFocus) return;
    S = null;
    arreterMinuteur();
    focus(false, true);
    repriseSurLaPage();
  });
  function quitterFocus() {
    if (!enFocus) return;
    if (history.state && history.state.bilanFocus) { history.back(); return; }
    focus(false, true);
    repriseSurLaPage();
  }

  // La source de la visite, gardée le temps de la session pour la création
  // de l'évaluation. Elle arrive avec le clic sur un lien du site
  // (data-bilan-src, rangé par audience.js dans qc-bilan-clic), ou par
  // l'adresse pour les liens écrits avant le 20 octobre 2026 et ceux partis
  // ailleurs (?src=, ?mode=). L'adresse est alors nettoyée tout de suite :
  // l'adresse d'une page ne porte jamais de source (voir audience.js).
  var srcVisite = null;
  function arrivee(query) {
    var src = query.get('src'), mode = query.get('mode'), clic = null;
    try {
      clic = JSON.parse(localStorage.getItem('qc-bilan-clic') || 'null');
      localStorage.removeItem('qc-bilan-clic');
    } catch (e) { clic = null; }
    var age = clic && typeof clic.t === 'number' ? Date.now() - clic.t : -1;
    if (age >= 0 && age < 10 * 60 * 1000) {
      src = src || clic.s;
      mode = mode || clic.m;
    }
    if (src && /^[a-z0-9-]{1,40}$/.test(src)) {
      srcVisite = src;
      try { sessionStorage.setItem('qc-bilan-src', src); } catch (e) { /* rien */ }
    }
    if (mode === 'solo' || mode === 'duo') modeDemande = mode;
    if (query.has('src') || query.has('mode')) {
      var reste = new URLSearchParams(location.search);
      reste.delete('src');
      reste.delete('mode');
      reste = reste.toString();
      try { history.replaceState(history.state, '', location.pathname + (reste ? '?' + reste : '') + location.hash); } catch (e) { /* rien */ }
    }
  }
  function source() {
    try { return sessionStorage.getItem('qc-bilan-src') || srcVisite || 'direct'; } catch (e) { return srcVisite || 'direct'; }
  }
  // La page, le bouton « Commencer » et chaque écran du parcours, comptés une
  // fois par visite (21 octobre 2026 : le bouton l'était à chaque clic, 240
  // clics pour beaucoup moins de personnes). `mode` ajoute le compte seul(e),
  // `cle` la cause d'une erreur du départ, `id` limite à une évaluation.
  function compterVue(quoi, o) {
    o = o || {};
    var cle = 'qc-bilan-' + quoi + (o.cle ? '-' + o.cle : '') + (o.id ? '-' + o.id : '');
    try {
      if (sessionStorage.getItem(cle)) return;
      sessionStorage.setItem(cle, '1');
    } catch (e) { /* rien */ }
    try { if (localStorage.getItem('qc-no-track')) return; } catch (e) { /* rien */ }
    if (navigator.webdriver) return;
    var corps = { quoi: quoi, src: source() };
    if (o.mode === 'solo' || o.mode === 'duo') corps.mode = o.mode;
    if (o.cle) corps.cle = o.cle;
    appel('vue', corps).catch(function () {});
  }

  // Le bandeau « reprendre » en haut de la présentation, pour un bilan déjà
  // commencé sur cet appareil.
  function repriseSurLaPage() {
    var zone = document.getElementById('bilan-reprise');
    if (!zone) return;
    var liste = lireListe();
    if (!liste.length) { zone.hidden = true; zone.innerHTML = ''; return; }
    var e = liste[0];
    zone.innerHTML = '<p>' + x(e.statut === 'resultat' ? 'accueil.repriseRapport' : 'accueil.reprise', { autre: e.autre || '' }) + '</p>' +
      '<button type="button" class="btn btn-cta btn-gradient btn-sm" data-bilan-reprendre>' + x(e.statut === 'resultat' ? 'accueil.voir' : 'accueil.reprendre') + '</button>';
    zone.hidden = false;
  }

  document.addEventListener('click', function (ev) {
    var go = ev.target.closest('[data-bilan-commencer]');
    if (go) {
      ev.preventDefault();
      var m = go.getAttribute('data-bilan-commencer');
      compterVue('cta', { mode: m === 'solo' || m === 'duo' ? m : modeDemande });
      focus(true);
      // Un bouton qui dit la façon de faire (à deux, seul(e)) mène droit à
      // la création ; le bouton générique passe par les évaluations de
      // l'appareil.
      if (m === 'solo' || m === 'duo') {
        modeDemande = m;
        brouillon = null;
        chargement();
        preparer().then(function () { creation(); }).catch(function () { messageErreur('reseau'); });
        return;
      }
      accueil();
      return;
    }
    if (ev.target.closest('[data-bilan-reprendre]')) {
      ev.preventDefault();
      focus(true);
      chargement();
      preparer().then(function () {
        var l = lireListe();
        if (l.length === 1) ouvrir(l[0]); else accueil();
      }).catch(function () { messageErreur('reseau'); });
      return;
    }
    if (ev.target.closest('[data-bilan-quitter]')) {
      ev.preventDefault();
      quitterFocus();
    }
  });

  demarrer();
})();
