/* Le bilan de couple : l'application de la page /bilan-de-couple/.
   Chacun répond de son côté, sur son téléphone, à environ 90 questions ; la
   fonction serveur `bilan` garde les réponses, et quand les deux ont fini,
   elle renvoie le résumé gratuit, ou les deux séries de réponses une fois le
   rapport payé. Le calcul est celui du serveur (window.QCBilanCoeur, construit
   depuis supabase/functions/_shared/bilan/coeur.mjs), les questions arrivent
   de /js/data/bilan-<lang>.json.

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
  var LOCALES = { fr: 'fr-FR', en: 'en-GB', es: 'es-ES', de: 'de-DE', it: 'it-IT' };
  var SECONDES_PAR_QUESTION = 15;
  var C = null;   // le calcul (window.QCBilanCoeur)
  var Q = null;   // les textes des questions
  var minuteur = null;
  var verifAttente = null;  // la vérification de l'écran d'attente, s'il est affiché
  var S = null;   // la session de réponses en cours

  // ── Textes ──────────────────────────────────────────────────────────────

  function tr(chemin, defaut) {
    var o = T, parts = chemin.split('.');
    for (var i = 0; i < parts.length; i++) {
      if (o == null || typeof o !== 'object' || !(parts[i] in o)) return defaut;
      o = o[parts[i]];
    }
    return o == null ? defaut : o;
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
  function nombre(n) {
    try { return new Intl.NumberFormat(LOCALES[LANG] || 'fr-FR').format(n); } catch (e) { return String(n); }
  }
  function dateLongue(iso) {
    try { return new Date(iso).toLocaleDateString(LOCALES[LANG] || 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }); }
    catch (e) { return String(iso || '').slice(0, 10); }
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
    accueil: function () { nettoyerUrl(); accueil(); },
  };

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
  // La réponse de quelqu'un, écrite pour être lue par les deux.
  function reponseLue(id, v, genre, nom, autre) {
    var r = C.INDEX[id];
    if (r.q.type === 'qui') {
      if (v === 2) return Q.quiNeutre[2];
      return C.remplir(Q.quiNeutre[v < 2 ? v : 4 - v], { nom: v < 2 ? nom : autre });
    }
    return C.remplir(C.accorder((texteQ(id).o || [])[v] || '', genre), { autre: autre });
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

  function demarrer() {
    chargement();
    charger().then(function () {
      var hash = new URLSearchParams(location.hash.replace(/^#/, ''));
      var query = new URLSearchParams(location.search);
      var id = hash.get('b'), jeton = hash.get('t');
      if (id && jeton) {
        nettoyerUrl();
        return ouvrirLien(id, jeton);
      }
      if (query.get('paiement') && query.get('b')) return retourPaiement(query.get('b'), query.get('paiement'));
      if (query.get('annule') && query.get('b')) {
        var e = entreeDe(query.get('b'));
        nettoyerUrl();
        if (e) return ouvrirResultat(e, x('paiement.annule'));
      }
      accueil();
    }).catch(function () { messageErreur('reseau'); });
  }

  // Un lien (personnel ou d'invitation) : on demande au serveur qui on est.
  function ouvrirLien(id, jeton) {
    chargement();
    appel('etat', { id: id, jeton: jeton }).then(function (r) {
      if (r.statut === 404) {
        afficher(carte('<p class="bilan-alerte">' + x('rejoindre.lienUtilise') + '</p>' +
          '<div class="bilan-actions">' + bouton('accueil', x('attente.accueil'), 'btn-outline') + '</div>'));
        return;
      }
      if (r.statut !== 200) return messageErreur(r.json.erreur, function () { ouvrirLien(id, jeton); });
      var e = r.json;
      if (e.invite) return rejoindre(e, jeton);
      var entree = { id: id, jeton: jeton, role: e.role, moi: e.moi.prenom, autre: e.autre.prenom };
      var ancienne = lireListe().filter(function (x) { return x.id === id && x.role === e.role; })[0];
      if (ancienne && ancienne.invitation) entree.invitation = ancienne.invitation;
      garder(entree);
      suiteEtat(entree, e);
    }).catch(function () { messageErreur('reseau', function () { ouvrirLien(id, jeton); }); });
  }

  // Où mener quelqu'un selon l'état du bilan.
  function suiteEtat(entree, etat) {
    majEntree(entree.id, entree.role, {
      moi: etat.moi.prenom, autre: etat.autre.prenom,
      repondu: C.progression(etat.situation, etat.moi.reponses).repondu,
      total: C.progression(etat.situation, etat.moi.reponses).total,
      statut: etat.verrouille ? 'resultat' : etat.moi.fini ? 'fini' : 'encours',
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

  function accueil() {
    S = null;
    var liste = lireListe();
    var etapes = tr('accueil.etapes', []).map(function (e) { return '<li>' + esc(ins(e)) + '</li>'; }).join('');
    var html = carte(
      duo('salut', 'mignon', 92) +
      '<h2 class="bilan-titre">' + x('accueil.titre') + '</h2>' +
      '<ol class="bilan-etapes">' + etapes + '</ol>' +
      '<div class="bilan-actions">' + bouton('creer', x('accueil.commencer')) + '</div>' +
      '<p class="bilan-note">' + x('accueil.violence') + '</p>', 'bilan-accueil');
    if (liste.length) {
      var cartes = liste.map(function (e) {
        var statut = e.statut === 'resultat' ? x('accueil.resultat')
          : e.statut === 'fini' ? x('accueil.fini')
          : e.total ? x('accueil.progression', { n: nombre(e.repondu || 0), total: nombre(e.total) })
          : '';
        return '<li class="bilan-reprise">' +
          '<div><strong>' + x('accueil.avec', { autre: e.autre || '' }) + '</strong>' +
          (statut ? '<span class="bilan-reprise-statut">' + statut + '</span>' : '') + '</div>' +
          '<div class="bilan-reprise-actions">' +
          bouton('reprendre', e.statut === 'resultat' ? x('accueil.voir') : x('accueil.reprendre'), 'btn-cta btn-gradient btn-sm', ' data-id="' + esc(e.id) + '" data-role="' + esc(e.role) + '"') +
          bouton('oublier', x('accueil.oublier'), 'btn-outline btn-sm', ' data-id="' + esc(e.id) + '" data-role="' + esc(e.role) + '"') +
          '</div></li>';
      }).join('');
      html = carte('<h2 class="bilan-sous-titre">' + x('accueil.enCours') + '</h2><ul class="bilan-reprises">' + cartes + '</ul>' +
        '<p class="bilan-note">' + x('accueil.oublierAide') + '</p>') + html;
    }
    afficher(html, true);
    ACTIONS = {
      creer: function () { creation(); },
      reprendre: function (b) { var e = entreeRole(b.getAttribute('data-id'), b.getAttribute('data-role')); if (e) ouvrir(e); },
      oublier: function (b) {
        confirmerDeuxFois(b, x('accueil.oublierConfirmer'), function () {
          oublier(b.getAttribute('data-id'), b.getAttribute('data-role'));
          accueil();
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

  function formSituation(sit) {
    return C.SITUATION.map(function (s) {
      var t = Q.situation[s.id];
      return '<fieldset class="bilan-champ"><legend>' + esc(ins(t.q)) + '</legend><div class="bilan-pastilles">' +
        s.valeurs.map(function (v, i) {
          return '<label class="bilan-pastille"><input type="radio" name="sit-' + s.id + '" value="' + v + '"' +
            (sit && sit[s.id] === v ? ' checked' : '') + '> <span>' + esc(t.o[i]) + '</span></label>';
        }).join('') + '</div></fieldset>';
    }).join('');
  }
  function lireSituation() {
    var sit = {};
    C.SITUATION.forEach(function (s) {
      var c = racine.querySelector('input[name="sit-' + s.id + '"]:checked');
      if (c) sit[s.id] = c.value;
    });
    return sit;
  }
  function lireGenre(nom) {
    var c = racine.querySelector('input[name="' + nom + '"]:checked');
    return c && c.value ? c.value : null;
  }

  function creation(etape) {
    if (!brouillon) brouillon = { moi: '', autre: '', genreMoi: null, genreAutre: null, situation: {} };
    etape = etape || 1;
    var corps = '<p class="bilan-etape">' + x('creation.etape', { n: etape }) + '</p>';
    if (etape === 1) {
      corps += '<h2 class="bilan-titre">' + x('creation.prenomsTitre') + '</h2>' +
        '<div class="bilan-champ"><label for="bilan-moi">' + x('creation.moi') + '</label>' +
        '<input id="bilan-moi" class="bilan-input" type="text" maxlength="30" autocomplete="given-name" value="' + esc(brouillon.moi) + '"></div>' +
        '<div class="bilan-champ"><span class="bilan-label">' + x('creation.genre') + '</span>' + champGenre('g-moi', brouillon.genreMoi) + '</div>' +
        '<div class="bilan-champ"><label for="bilan-autre">' + x('creation.autre') + '</label>' +
        '<input id="bilan-autre" class="bilan-input" type="text" maxlength="30" autocomplete="off" value="' + esc(brouillon.autre) + '"></div>' +
        '<div class="bilan-champ"><span class="bilan-label">' + x('creation.genreAutre') + '</span>' + champGenre('g-autre', brouillon.genreAutre) + '</div>' +
        '<p class="bilan-note">' + x('creation.genreAide') + '</p>';
    } else if (etape === 2) {
      corps += '<h2 class="bilan-titre">' + x('creation.situationTitre') + '</h2>' +
        '<p class="bilan-texte">' + x('creation.situationAide') + '</p>' + formSituation(brouillon.situation);
    } else {
      corps += '<h2 class="bilan-titre">' + x('creation.accordTitre') + '</h2>' +
        '<label class="bilan-case"><input type="checkbox" id="bilan-majeur"> <span>' + x('creation.majeur') + '</span></label>' +
        '<label class="bilan-case"><input type="checkbox" id="bilan-consent"> <span>' + x('creation.consentement', { autre: brouillon.autre }) + '</span></label>' +
        '<p class="bilan-note">' + x('creation.accordAide') + '</p>' +
        '<p class="bilan-prix-rappel">' + x('creation.prixRappel') + '</p>' +
        '<p class="bilan-note">' + x('accueil.violence') + '</p>';
    }
    corps += '<p class="bilan-alerte" id="bilan-erreur" hidden></p>' +
      '<div class="bilan-actions bilan-actions--ecart">' +
      bouton('retour', x('creation.retour'), 'btn-outline') +
      bouton(etape < 3 ? 'suivant' : 'valider', etape < 3 ? x('creation.suivant') : x('creation.creer')) + '</div>';
    afficher(carte(corps, 'bilan-creation'));
    var champ = racine.querySelector('input[type="text"]');
    if (champ && etape === 1 && !brouillon.moi) champ.focus({ preventScroll: true });

    function erreur(cle) {
      var p = document.getElementById('bilan-erreur');
      p.textContent = ins(remplir(tr(cle, ''), {}));
      p.hidden = false;
    }
    function lireEtape() {
      if (etape === 1) {
        brouillon.moi = (document.getElementById('bilan-moi').value || '').trim();
        brouillon.autre = (document.getElementById('bilan-autre').value || '').trim();
        brouillon.genreMoi = lireGenre('g-moi');
        brouillon.genreAutre = lireGenre('g-autre');
      } else if (etape === 2) {
        brouillon.situation = lireSituation();
      }
    }
    ACTIONS = {
      retour: function () { lireEtape(); if (etape > 1) creation(etape - 1); else accueil(); },
      suivant: function () {
        lireEtape();
        if (etape === 1 && (!brouillon.moi || !brouillon.autre)) return erreur('creation.prenomManque');
        if (etape === 2 && !C.situationValide(brouillon.situation)) return erreur('creation.manque');
        creation(etape + 1);
      },
      valider: function (b) {
        if (!document.getElementById('bilan-majeur').checked || !document.getElementById('bilan-consent').checked) return erreur('creation.accordManque');
        b.disabled = true;
        appel('creer', {
          lang: LANG, situation: brouillon.situation,
          moi: { prenom: brouillon.moi, genre: brouillon.genreMoi },
          autre: { prenom: brouillon.autre, genre: brouillon.genreAutre },
          consentement: true, majeur: true,
        }).then(function (r) {
          b.disabled = false;
          if (r.statut !== 200) return erreur(r.json.erreur === 'trop' ? 'erreurs.trop' : 'erreurs.serveur');
          var entree = { id: r.json.id, jeton: r.json.jeton, invitation: r.json.invitation, invitationVue: true, role: 'a', moi: brouillon.moi, autre: brouillon.autre, statut: 'encours' };
          garder(entree);
          brouillon = null;
          invitation(entree, r.json.etat);
        }).catch(function () { b.disabled = false; erreur('erreurs.reseau'); });
      },
    };
  }

  // ── Invitation ──────────────────────────────────────────────────────────

  function invitation(entree, etat) {
    var lien = lienPersonnel(entree.id, entree.invitation);
    var autre = entree.autre;
    var html = carte(
      duo('salut', 'surprise', 80, etat && etat.moi.genre, etat && etat.autre.genre) +
      '<h2 class="bilan-titre">' + x('invitation.titre', { autre: autre }) + '</h2>' +
      '<p class="bilan-texte">' + x('invitation.texte', { autre: autre }) + '</p>' +
      '<div class="bilan-lien"><input class="bilan-input" type="text" readonly value="' + esc(lien) + '" aria-label="' + x('invitation.copier') + '"></div>' +
      '<div class="bilan-actions">' +
      (navigator.share ? bouton('partager', x('invitation.envoyer')) : '') +
      bouton('copier', x('invitation.copier'), navigator.share ? 'btn-outline' : 'btn-cta btn-gradient') +
      bouton('qr', x('invitation.qr'), 'btn-outline') + '</div>' +
      '<div class="bilan-qr" id="bilan-qr" hidden></div>' +
      '<hr class="bilan-sep">' +
      '<h3 class="bilan-sous-titre">' + x('invitation.monLien') + '</h3>' +
      '<p class="bilan-note">' + x('invitation.monLienAide', { autre: autre }) + '</p>' +
      '<div class="bilan-actions">' + bouton('copierMoi', x('invitation.copierMonLien'), 'btn-outline btn-sm') + '</div>' +
      '<div class="bilan-actions">' + bouton('commencer', x('invitation.commencer')) + '</div>', 'bilan-invitation');
    afficher(html);
    var message = remplir(tr('invitation.message', ''), { lien: lien });
    ACTIONS = {
      partager: function () {
        navigator.share({ title: remplir(tr('invitation.messageTitre', ''), {}), text: message }).catch(function () {});
      },
      copier: function (b) { copier(lien, b); },
      copierMoi: function (b) { copier(lienPersonnel(entree.id, entree.jeton), b); },
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

  function resumeSituation(sit) {
    return '<ul class="bilan-situation">' + C.SITUATION.map(function (s) {
      var t = Q.situation[s.id];
      var i = s.valeurs.indexOf(sit[s.id]);
      return '<li><span>' + esc(ins(t.q)) + '</span> <strong>' + esc(i >= 0 ? t.o[i] : '') + '</strong></li>';
    }).join('') + '</ul>';
  }

  function rejoindre(etat, jetonInvitation) {
    var autre = etat.autre.prenom;
    var sitModifiee = null;
    var html = carte(
      duo('salut', 'mignon', 86, etat.autre.genre, etat.moi.genre) +
      '<h2 class="bilan-titre">' + x('rejoindre.titre', { autre: autre }) + '</h2>' +
      '<p class="bilan-texte">' + x('rejoindre.texte', { autre: autre }) + '</p>' +
      '<p class="bilan-texte">' + x('rejoindre.duree') + '</p>' +
      '<h3 class="bilan-sous-titre">' + x('rejoindre.situationTitre', { autre: autre }) + '</h3>' +
      '<div id="bilan-sit">' + resumeSituation(etat.situation) +
      '<div class="bilan-actions bilan-actions--gauche">' + bouton('corriger', x('rejoindre.situationCorriger'), 'btn-outline btn-sm') + '</div></div>' +
      '<div class="bilan-champ"><label for="bilan-moi">' + x('rejoindre.prenom') + '</label>' +
      '<input id="bilan-moi" class="bilan-input" type="text" maxlength="30" value="' + esc(etat.moi.prenom) + '"></div>' +
      '<div class="bilan-champ"><span class="bilan-label">' + x('rejoindre.genre') + '</span>' + champGenre('g-moi', etat.moi.genre) + '</div>' +
      '<label class="bilan-case"><input type="checkbox" id="bilan-majeur"> <span>' + x('creation.majeur') + '</span></label>' +
      '<label class="bilan-case"><input type="checkbox" id="bilan-consent"> <span>' + x('creation.consentement', { autre: autre }) + '</span></label>' +
      '<p class="bilan-note">' + x('creation.accordAide') + '</p>' +
      '<p class="bilan-prix-rappel">' + x('creation.prixRappel') + '</p>' +
      '<p class="bilan-note">' + x('accueil.violence') + '</p>' +
      '<p class="bilan-alerte" id="bilan-erreur" hidden></p>' +
      '<div class="bilan-actions">' + bouton('accepter', x('rejoindre.commencer')) + '</div>', 'bilan-rejoindre');
    afficher(html);
    function erreur(cle) {
      var p = document.getElementById('bilan-erreur');
      p.textContent = ins(remplir(tr(cle, ''), {}));
      p.hidden = false;
    }
    ACTIONS = {
      corriger: function () {
        document.getElementById('bilan-sit').innerHTML = formSituation(etat.situation);
        sitModifiee = true;
      },
      accepter: function (b) {
        var prenom = (document.getElementById('bilan-moi').value || '').trim();
        if (!prenom) return erreur('creation.prenomManque');
        if (!document.getElementById('bilan-majeur').checked || !document.getElementById('bilan-consent').checked) return erreur('creation.accordManque');
        var sit = sitModifiee ? lireSituation() : null;
        if (sit && !C.situationValide(sit)) return erreur('creation.manque');
        b.disabled = true;
        appel('consentir', { id: etat.id, jeton: jetonInvitation, prenom: prenom, genre: lireGenre('g-moi'), consentement: true, majeur: true })
          .then(function (r) {
            if (r.statut !== 200) { b.disabled = false; return erreur(r.statut === 409 ? 'rejoindre.lienUtilise' : 'erreurs.serveur'); }
            var entree = { id: etat.id, jeton: r.json.jeton, role: etat.role, moi: prenom, autre: autre, statut: 'encours' };
            garder(entree);
            var change = sit && C.SITUATION.some(function (s) { return sit[s.id] !== etat.situation[s.id]; });
            if (!change) return ouvrir(entree);
            return appel('situation', { id: entree.id, jeton: entree.jeton, situation: sit }).then(function () { ouvrir(entree); });
          })
          .catch(function () { b.disabled = false; erreur('erreurs.reseau'); });
      },
    };
  }

  // ── Les réponses ────────────────────────────────────────────────────────

  function commencerSession(entree, etat, revoir) {
    S = {
      entree: entree,
      id: entree.id, jeton: entree.jeton, role: etat.role,
      situation: etat.situation,
      moi: etat.moi, autre: etat.autre,
      reponses: JSON.parse(JSON.stringify(etat.moi.reponses || {})),
      nn: (etat.moi.nn || []).slice(),
      introsVues: {},
      revoir: !!revoir,
      envoi: { enCours: false, sale: false, fini: false, attente: [] },
    };
    S.liste = C.questionsPour(S.situation, S.reponses);
    S.index = revoir ? 0 : premierSansReponse();
    if (S.index > 0 && S.index < S.liste.length) S.introsVues[S.liste[S.index].domaine] = !!revoir;
    // Le créateur qui n'a encore rien répondu et dont l'invitation n'est pas
    // acceptée commence par l'invitation.
    if (!revoir && etat.role === 'a' && !etat.autre.rejoint && S.index === 0 && entree.invitation && !entree.invitationVue) {
      majEntree(entree.id, entree.role, { invitationVue: true });
      entree.invitationVue = true;
      return invitation(entree, etat);
    }
    suivante();
  }

  function premierSansReponse() {
    for (var i = 0; i < S.liste.length; i++) if (!Number.isInteger(S.reponses[S.liste[i].id])) return i;
    return S.liste.length;
  }

  function suivante() {
    if (S.index >= S.liste.length) return terminer();
    var item = S.liste[S.index];
    var debutDomaine = S.index === 0 || S.liste[S.index - 1].domaine !== item.domaine;
    if (debutDomaine && !S.introsVues[item.domaine]) return introDomaine(item.domaine);
    afficherQuestion();
  }

  function introDomaine(dom) {
    var ordre = C.DOMAINES.map(function (d) { return d.id; });
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
    ACTIONS = {
      go: function () { S.introsVues[dom] = true; afficherQuestion(); },
      pause: function () { pause(); },
    };
  }

  function afficherQuestion() {
    var item = S.liste[S.index];
    var id = item.id;
    var r = C.INDEX[id];
    var v = S.reponses[id];
    var opts = libellesOptions(id, S.moi.genre, S.autre.prenom);
    var total = S.liste.length;
    var pct = Math.round(S.index / total * 100);
    var options = opts.map(function (o, i) {
      var choisie = v === i;
      return '<button type="button" class="bilan-option' + (choisie ? ' choisie' : '') + '" role="radio" aria-checked="' + choisie + '" data-action="choisir" data-v="' + i + '">' +
        '<span class="bilan-option-rond" aria-hidden="true"></span><span>' + esc(ins(o)) + '</span></button>';
    }).join('');
    var nn = '';
    if (r.q.decisif) {
      nn = '<label class="bilan-nn' + (Number.isInteger(v) ? '' : ' inactif') + '"><input type="checkbox" data-change="nn"' +
        (S.nn.indexOf(id) >= 0 ? ' checked' : '') + (Number.isInteger(v) ? '' : ' disabled') + '> <span>' + x('question.nn') + '</span></label>' +
        '<p class="bilan-note">' + x('question.nnAide') + '</p>';
    }
    var avecSuivante = r.q.decisif || S.revoir || Number.isInteger(v);
    afficher(carte(
      '<div class="bilan-q-tete"><span class="bilan-q-domaine">' + esc(ins(titreDomaine(item.domaine))) + '</span>' +
      '<span>' + x('question.progression', { n: S.index + 1, total: total }) + '</span></div>' +
      '<div class="bilan-barre" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '"><span style="width:' + pct + '%"></span></div>' +
      '<h2 class="bilan-q-texte">' + esc(ins(enonce(id, S.moi.genre, S.autre.prenom))) + '</h2>' +
      '<div class="bilan-options" role="radiogroup">' + options + '</div>' + nn +
      '<div class="bilan-q-pied">' +
      (S.index > 0 ? bouton('precedente', '← ' + x('question.precedente'), 'btn-outline btn-sm') : '<span></span>') +
      '<span class="bilan-envoi" id="bilan-envoi" aria-live="polite"></span>' +
      (avecSuivante ? bouton('suivanteQ', x('question.suivante') + ' →', 'btn-cta btn-gradient btn-sm', Number.isInteger(v) ? '' : ' disabled') : '<span></span>') +
      '</div>' +
      '<div class="bilan-q-bas">' + bouton('pause', x('question.pause'), 'btn-link') + '</div>',
      'bilan-question'), true);
    garderEnVue();
    etatEnvoi();
    ACTIONS = {
      choisir: function (b) {
        var val = +b.getAttribute('data-v');
        S.reponses[id] = val;
        // Une réponse peut ouvrir ou fermer des questions plus loin.
        S.liste = C.questionsPour(S.situation, S.reponses);
        S.index = indexDe(id);
        sauver(false);
        if (r.q.decisif || S.revoir) { afficherQuestion(); return; }
        racine.querySelectorAll('.bilan-option').forEach(function (o) {
          var oui = o === b;
          o.classList.toggle('choisie', oui);
          o.setAttribute('aria-checked', String(oui));
        });
        setTimeout(function () { if (S && S.liste[S.index] && S.liste[S.index].id === id) { S.index++; suivante(); } }, 220);
      },
      nn: function (c) {
        var i = S.nn.indexOf(id);
        if (c.checked && i < 0) S.nn.push(id);
        if (!c.checked && i >= 0) S.nn.splice(i, 1);
        sauver(false);
      },
      suivanteQ: function () { if (Number.isInteger(S.reponses[id])) { S.index++; suivante(); } },
      precedente: function () {
        S.index = Math.max(0, S.index - 1);
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
    appel('repondre', { id: session.id, jeton: session.jeton, reponses: session.reponses, nn: session.nn, fini: demandeFin })
      .then(function (r) {
        e.enCours = false;
        if (r.statut === 200) {
          if (demandeFin && r.json.fini) e.fini = false;
          var p = r.json.progression || {};
          majEntree(session.id, session.role, { repondu: p.repondu, total: p.total, statut: r.json.etat && r.json.etat.verrouille ? 'resultat' : r.json.fini ? 'fini' : 'encours' });
          session.dernierEtat = r.json.etat;
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
    appel('repondre', { id: S.id, jeton: S.jeton, reponses: S.reponses, nn: S.nn, fini: S.envoi.fini }, true).catch(function () {});
  });

  function pause() {
    var session = S;
    sauver(false);
    var p = C.progression(session.situation, session.reponses);
    afficher(carte(
      duo('dort', 'repos', 76, session.moi.genre, session.autre.genre) +
      '<h2 class="bilan-titre">' + x('pause.titre') + '</h2>' +
      '<p class="bilan-texte">' + x('pause.progression', { n: p.repondu, total: p.total }) + '</p>' +
      '<p class="bilan-texte">' + x('pause.texte') + '</p>' +
      '<div class="bilan-actions">' + bouton('reprendre', x('pause.reprendre')) +
      bouton('copierMoi', x('invitation.copierMonLien'), 'btn-outline') + '</div>', 'bilan-pause'));
    ACTIONS = {
      reprendre: function () { S = session; suivante(); },
      copierMoi: function (b) { copier(lienPersonnel(session.id, session.jeton), b); },
    };
  }

  function terminer() {
    var session = S;
    afficher(carte('<p class="bilan-centre">' + x('chargement') + '</p>', 'bilan-chargement'), true);
    sauver(true, function (r) {
      if (r.statut === 409) return ouvrirResultat(session.entree);
      var etat = r.json.etat;
      if (etat && etat.verrouille) return ouvrirResultat(session.entree);
      if (r.json.fini) return attente(session.entree, etat);
      // Il manque encore des réponses (une question ouverte par une autre).
      S = session;
      S.liste = C.questionsPour(S.situation, S.reponses);
      S.index = premierSansReponse();
      suivante();
    });
  }

  // ── Attente de l'autre ──────────────────────────────────────────────────

  function attente(entree, etat) {
    S = null;
    var autre = etat.autre.prenom;
    var ligne = etat.autre.rejoint
      ? x('attente.autreProgression', { autre: autre, n: etat.autre.repondu, total: etat.autre.total || '…' })
      : x('attente.autrePasRejoint', { autre: autre });
    var pct = etat.autre.total ? Math.round(etat.autre.repondu / etat.autre.total * 100) : 0;
    afficher(carte(
      duo('joie', 'repos', 86, etat.moi.genre, etat.autre.genre) +
      '<h2 class="bilan-titre">' + x('attente.titre') + '</h2>' +
      '<p class="bilan-texte">' + x('attente.texte', { autre: autre }) + '</p>' +
      '<div class="bilan-autre"><p>' + ligne + '</p>' +
      (etat.autre.rejoint ? '<div class="bilan-barre bilan-barre--autre"><span style="width:' + pct + '%"></span></div>' : '') + '</div>' +
      '<div class="bilan-actions">' +
      (!etat.autre.rejoint && entree.invitation ? bouton('renvoyer', x('attente.renvoyer')) : '') +
      bouton('revoir', x('attente.revoir'), 'btn-outline') + '</div>' +
      '<p class="bilan-note">' + x('attente.revoirAide', { autre: autre }) + '</p>' +
      '<p class="bilan-note">' + x('attente.maj') + '</p>' +
      '<div class="bilan-actions">' + bouton('accueil', x('attente.accueil'), 'btn-link') + '</div>', 'bilan-attente'));
    ACTIONS = {
      renvoyer: function () { invitation(entree, etat); },
      revoir: function () { commencerSession(entree, etat, true); },
    };
    var verifier = function () {
      if (document.visibilityState !== 'visible') return;
      appel('etat', { id: entree.id, jeton: entree.jeton }).then(function (r) {
        if (r.statut !== 200 || !racine.querySelector('.bilan-attente')) return;
        var e = r.json;
        if (e.verrouille) return ouvrirResultat(entree);
        if (e.autre.repondu !== etat.autre.repondu || e.autre.rejoint !== etat.autre.rejoint) attente(entree, e);
      }).catch(function () {});
    };
    minuteur = setInterval(verifier, 15000);
    verifAttente = verifier;
  }
  // Au retour sur l'onglet, l'écran d'attente regarde tout de suite.
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible' && verifAttente) verifAttente();
  });

  // ── Le résultat ─────────────────────────────────────────────────────────

  function ouvrirResultat(entree, message) {
    S = null;
    chargement();
    appel('resultat', { id: entree.id, jeton: entree.jeton }).then(function (r) {
      if (r.statut === 409) return ouvrir(entree);
      if (r.statut === 404) { oublier(entree.id, entree.role); return messageErreur('introuvable', accueil); }
      if (r.statut !== 200) return messageErreur(r.json.erreur, function () { ouvrirResultat(entree, message); });
      majEntree(entree.id, entree.role, { statut: 'resultat' });
      if (r.json.paye) rapport(entree, r.json, message);
      else gratuit(entree, r.json, message);
    }).catch(function () { messageErreur('reseau', function () { ouvrirResultat(entree, message); }); });
  }

  // Les deux personnes du point de vue du rapport : a et b, chacun avec son
  // personnage et le prénom de l'autre.
  function personnes(res) {
    var a = { cle: 'a', prenom: res.a.prenom, genre: res.a.genre, perso: perso(res.a.genre, 0) };
    var b = { cle: 'b', prenom: res.b.prenom, genre: res.b.genre, perso: perso(res.b.genre, 1) };
    a.autre = b.prenom; b.autre = a.prenom;
    return { a: a, b: b };
  }

  function anneau(valeur, classe) {
    var v = Math.max(0, Math.min(100, valeur || 0));
    return '<div class="bilan-anneau ' + (classe || '') + '" style="--v:' + v + '"><span>' + v + '<small>%</small></span></div>';
  }

  function enTete(res, an, P) {
    var vg = an.bandeGlobal ? 'resultat.verdicts.' + an.bandeGlobal : null;
    var vm = an.bandeMeteo ? 'resultat.meteos.' + an.bandeMeteo : null;
    return carte(
      duo('joie', 'joie', 92, P.a.genre, P.b.genre) +
      '<h2 class="bilan-titre">' + x('resultat.titre', { a: P.a.prenom, b: P.b.prenom }) + '</h2>' +
      (res.finiLe ? '<p class="bilan-etape">' + x('rapport.date', { date: dateLongue(res.finiLe) }) + '</p>' : '') +
      '<div class="bilan-chiffres">' +
      '<div class="bilan-chiffre">' + anneau(an.global, 'bilan-anneau--accord') + '<p class="bilan-chiffre-titre">' + x('resultat.accord') + '</p>' +
      (vg ? '<p class="bilan-verdict">' + x(vg + '.titre') + '</p><p class="bilan-texte">' + x(vg + '.texte') + '</p>' : '') + '</div>' +
      '<div class="bilan-chiffre">' + anneau(an.meteo, 'bilan-anneau--meteo') + '<p class="bilan-chiffre-titre">' + x('resultat.meteo') + '</p>' +
      (vm ? '<p class="bilan-verdict">' + x(vm + '.titre') + '</p><p class="bilan-texte">' + x(vm + '.texte') + '</p>' : '') + '</div>' +
      '</div>' +
      '<p class="bilan-compte">' + x('resultat.compte', { accords: an.compte.accords, proches: an.compte.proches, ecarts: an.compte.ecarts }) + '</p>' +
      '<p class="bilan-compte bilan-compte--' + (an.compte.bloquants ? 'alerte' : 'ok') + '">' +
      (an.compte.bloquants ? x(an.compte.bloquants > 1 ? 'resultat.bloquantsN' : 'resultat.bloquants', { n: an.compte.bloquants }) : x('resultat.aucunBloquant')) + '</p>' +
      (an.compte.bloquants ? '<p class="bilan-note">' + x('resultat.bloquantsAide') + '</p>' : ''),
      'bilan-tete');
  }

  function barresDomaines(domaines) {
    return carte('<h3 class="bilan-sous-titre">' + x('resultat.parDomaine') + '</h3><ul class="bilan-barres">' +
      domaines.filter(function (d) { return !d.meteo && d.score !== null; }).map(function (d) {
        return '<li><span class="bilan-barre-nom">' + esc(ins(titreDomaine(d.id))) + '</span>' +
          '<span class="bilan-barre bilan-barre--' + (d.bande || 'moyen') + '"><span style="width:' + d.score + '%"></span></span>' +
          '<span class="bilan-barre-val">' + d.score + '%</span></li>';
      }).join('') + '</ul>');
  }

  function etiquette(item) {
    var t = [];
    if (item.statut) t.push('<span class="bilan-tag bilan-tag--' + item.statut + '">' + x('rapport.statut.' + item.statut) + '</span>');
    else t.push('<span class="bilan-tag bilan-tag--' + item.cat + '">' + x('rapport.cat.' + item.cat) + '</span>');
    if (item.chacunPlus) t.push('<span class="bilan-tag bilan-tag--chacun">' + x('rapport.chacunPlus') + '</span>');
    return t.join('');
  }

  // Un écart en entier : les deux réponses, pourquoi, pour en parler, à éviter.
  function carteEcart(item, P, titreAvant) {
    var tq = texteQ(item.id);
    var rep = function (p, v, nn) {
      return '<div class="bilan-rep bilan-rep--' + p.perso + '"><span class="bilan-rep-nom">' + esc(p.prenom) + '</span>' +
        '<span class="bilan-rep-val">' + esc(ins(reponseLue(item.id, v, p.genre, p.prenom, p.autre))) + '</span>' +
        (nn ? '<span class="bilan-tag bilan-tag--nn">' + x('rapport.nnDe', { nom: p.prenom }) + '</span>' : '') + '</div>';
    };
    var parler = (tq.parler || []).map(function (q) { return '<li>' + esc(ins(q)) + '</li>'; }).join('');
    return '<article class="bilan-ecart bilan-ecart--' + item.cat + '">' +
      (titreAvant ? '<p class="bilan-etape">' + titreAvant + '</p>' : '') +
      '<div class="bilan-ecart-tete"><h4>' + esc(ins(tq.court || item.id)) + '</h4><div class="bilan-tags">' + etiquette(item) + '</div></div>' +
      '<p class="bilan-ecart-domaine">' + esc(ins(titreDomaine(item.domaine))) + '</p>' +
      '<div class="bilan-reps">' + rep(P.a, item.a, item.nnA) + rep(P.b, item.b, item.nnB) + '</div>' +
      (item.desequilibre ? '<p class="bilan-texte">' + x('rapport.desequilibre', { nom: item.desequilibre === 'a' ? P.a.prenom : P.b.prenom }) + '</p>' : '') +
      '<div class="bilan-guide">' +
      (tq.pourquoi ? '<p><strong>' + x('rapport.pourquoi') + '</strong> ' + esc(ins(tq.pourquoi)) + '</p>' : '') +
      (parler ? '<p><strong>' + x('rapport.parler') + '</strong></p><ul>' + parler + '</ul>' : '') +
      (tq.eviter ? '<p><strong>' + x('rapport.eviter') + '</strong> ' + esc(ins(tq.eviter)) + '</p>' : '') +
      '</div></article>';
  }

  // ── Le résultat gratuit et le paiement ──────────────────────────────────

  function gratuit(entree, res, message) {
    var an = res.resume;
    var P = personnes(res);
    var html = (message ? carte('<p class="bilan-info">' + message + '</p>') : '') + enTete(res, an, P) + barresDomaines(an.domaines);
    if (an.echantillon) {
      html += carte('<h3 class="bilan-sous-titre">' + x('resultat.echantillonTitre') + '</h3>' +
        '<p class="bilan-note">' + x('resultat.echantillonAide') + '</p>' + carteEcart(an.echantillon, P));
    }
    if (an.autres.length) {
      html += carte('<h3 class="bilan-sous-titre">' + x('resultat.autresTitre') + '</h3><ul class="bilan-floutes">' +
        an.autres.map(function (it) {
          return '<li class="bilan-floute"><div class="bilan-floute-tete"><strong>' + esc(ins(texteQ(it.id).court || it.id)) + '</strong>' +
            '<span class="bilan-tags">' + etiquette(it) + '</span></div>' +
            '<span class="bilan-floute-domaine">' + esc(ins(titreDomaine(it.domaine))) + '</span>' +
            '<div class="bilan-floute-reps" aria-hidden="true"><span></span><span></span></div>' +
            '<span class="bilan-floute-aide">' + x('resultat.masque') + '</span></li>';
        }).join('') + '</ul>' +
        (an.nbAutres > an.autres.length ? '<p class="bilan-note">' + x('resultat.plusAutres', { n: an.nbAutres - an.autres.length }) + '</p>' : ''));
    } else if (!an.echantillon) {
      html += carte('<p class="bilan-texte">' + x('resultat.aucunEcart') + '</p>');
    }
    html += paywall(res);
    afficher(html);
    ACTIONS = {
      payer: function (b) {
        var c = document.getElementById('bilan-renonciation');
        var err = document.getElementById('bilan-erreur');
        if (!c.checked) { err.textContent = ins(remplir(tr('paywall.renonciationManque', ''), {})); err.hidden = false; return; }
        err.hidden = true;
        b.disabled = true;
        b.innerHTML = x('paywall.redirection');
        appel('payer', { id: entree.id, jeton: entree.jeton, renonciation: true, lang: LANG }).then(function (r) {
          if (r.statut === 200 && r.json.url) { location.href = r.json.url; return; }
          if (r.statut === 200 && r.json.paye) { ouvrirResultat(entree); return; }
          b.disabled = false;
          b.innerHTML = x('paywall.bouton');
          err.textContent = ins(remplir(tr(r.json.erreur === 'paiement_ferme' ? 'paywall.ferme' : 'erreurs.serveur', ''), {}));
          err.hidden = false;
        }).catch(function () {
          b.disabled = false;
          b.innerHTML = x('paywall.bouton');
          err.textContent = ins(remplir(tr('erreurs.reseau', ''), {}));
          err.hidden = false;
        });
      },
    };
  }

  function paywall(res) {
    var contenu = tr('paywall.contenu', []).map(function (c) { return '<li>' + esc(ins(c)) + '</li>'; }).join('');
    // Avec une clé Stripe de test, le paiement s'essaie avant l'ouverture.
    var ouvert = res.paiementOuvert && (CFG.ouvert !== false || res.paiementTest);
    return carte(
      '<h3 class="bilan-titre">' + x('paywall.titre') + '</h3>' +
      '<p class="bilan-texte">' + x('paywall.intro') + '</p>' +
      '<ul class="bilan-contenu">' + contenu + '</ul>' +
      '<p class="bilan-prix">' + x('paywall.prix') + '</p>' +
      '<p class="bilan-note">' + x('paywall.prixAide') + '</p>' +
      (ouvert
        ? '<label class="bilan-case"><input type="checkbox" id="bilan-renonciation"> <span>' + x('paywall.renonciation') + '</span></label>' +
          '<p class="bilan-alerte" id="bilan-erreur" hidden></p>' +
          '<div class="bilan-actions">' + bouton('payer', x('paywall.bouton'), 'btn-cta btn-gradient bilan-payer') + '</div>' +
          (res.garantie > 0 ? '<p class="bilan-note">' + x('paywall.garantie') + '</p>' : '') +
          '<p class="bilan-note">' + x('paywall.securite') + '</p>'
        : '<p class="bilan-info">' + x('paywall.ferme') + '</p>') +
      '<p class="bilan-note bilan-legal"><a href="' + esc(CFG.cgv) + '">' + x('paywall.cgv') + '</a> · ' + x('paywall.tva') + '</p>',
      'bilan-paywall');
  }

  function retourPaiement(id, session) {
    var entree = entreeDe(id);
    if (!entree) { nettoyerUrl(); return accueil(); }
    afficher(carte('<p class="bilan-centre">' + x('paiement.verification') + '</p>', 'bilan-chargement'), true);
    var essais = 0;
    var essai = function () {
      appel('verifier', { id: id, jeton: entree.jeton, session: session }).then(function (r) {
        if (r.statut === 200 && r.json.paye) { nettoyerUrl(); return ouvrirResultat(entree, x('paiement.ok')); }
        if (++essais < 8) {
          afficher(carte('<p class="bilan-centre">' + x('paiement.attente') + '</p>', 'bilan-chargement'), true);
          return setTimeout(essai, 2500);
        }
        nettoyerUrl();
        ouvrirResultat(entree, x('paiement.erreur'));
      }).catch(function () {
        if (++essais < 8) return setTimeout(essai, 2500);
        nettoyerUrl();
        ouvrirResultat(entree, x('paiement.erreur'));
      });
    };
    essai();
  }

  // ── Le rapport complet ──────────────────────────────────────────────────

  function rapport(entree, res, message) {
    var P = personnes(res);
    var an = C.analyser(res.situation, { reponses: res.a.reponses, nn: res.a.nn }, { reponses: res.b.reponses, nn: res.b.nn });
    var parId = {};
    an.items.forEach(function (i) { parId[i.id] = i; });
    var html = (message ? carte('<p class="bilan-info">' + message + '</p>') : '') + enTete(res, an, P);

    // Les quatre prochaines conversations.
    if (an.conversations.length) {
      html += carte('<h3 class="bilan-titre">' + x('rapport.conversationsTitre') + '</h3>' +
        '<p class="bilan-texte">' + x('rapport.conversationsIntro') + '</p>' +
        an.conversations.map(function (id, i) { return carteEcart(parId[id], P, x('rapport.conversation', { n: i + 1 })); }).join(''),
        'bilan-conversations');
    }

    // Les points bloquants et les non négociables de chacun.
    var blocs = '';
    if (an.bloquants.length) {
      blocs += '<h3 class="bilan-sous-titre">' + x('rapport.bloquantsTitre') + '</h3><p class="bilan-texte">' + x('rapport.bloquantsIntro') + '</p>' +
        '<ul class="bilan-liste">' + an.bloquants.map(function (id) { return '<li>' + esc(ins(texteQ(id).court)) + '</li>'; }).join('') + '</ul>';
    }
    var listeNn = function (p, ids, reps) {
      return '<div class="bilan-nn-col bilan-rep--' + p.perso + '"><p class="bilan-rep-nom">' + esc(p.prenom) + '</p>' +
        (ids.length ? '<ul class="bilan-liste">' + ids.map(function (id) {
          return '<li><strong>' + esc(ins(texteQ(id).court)) + ' :</strong> ' + esc(ins(reponseLue(id, reps[id], p.genre, p.prenom, p.autre))) + '</li>';
        }).join('') + '</ul>' : '<p class="bilan-note">' + x('rapport.nnAucun') + '</p>') + '</div>';
    };
    blocs += '<h3 class="bilan-sous-titre">' + x('rapport.nnTitre') + '</h3><div class="bilan-nn-cols">' +
      listeNn(P.a, an.nonNegociables.a, res.a.reponses) + listeNn(P.b, an.nonNegociables.b, res.b.reponses) + '</div>';
    html += carte(blocs);

    // Chacun pense en faire plus.
    if (an.chacunPlus.length) {
      html += carte('<h3 class="bilan-sous-titre">' + x('rapport.chacunTitre') + '</h3><p class="bilan-texte">' + x('rapport.chacunIntro') + '</p>' +
        '<ul class="bilan-liste">' + an.chacunPlus.map(function (id) { return '<li>' + esc(ins(texteQ(id).court)) + '</li>'; }).join('') + '</ul>');
    }

    // Ce qui vous rassemble.
    if (an.rassemble.length) {
      html += carte('<h3 class="bilan-sous-titre">' + x('rapport.rassembleTitre') + '</h3><p class="bilan-texte">' + x('rapport.rassembleIntro') + '</p>' +
        '<ul class="bilan-liste bilan-liste--accord">' + an.rassemble.map(function (id) {
          var it = parId[id];
          return '<li><strong>' + esc(ins(texteQ(id).court)) + ' :</strong> ' + esc(ins(reponseLue(id, it.a, P.a.genre, P.a.prenom, P.a.autre))) + '</li>';
        }).join('') + '</ul>');
    }

    // Domaine par domaine.
    var doms = an.domaines.filter(function (d) { return !d.meteo; }).map(function (d) {
      var D = Q.domaines[d.id] || {};
      var accords = d.items.filter(function (i) { return i.cat === 'accord' && !i.chacunPlus; });
      var diffs = d.items.filter(function (i) { return i.cat !== 'accord' || i.chacunPlus || i.desequilibre; })
        .sort(function (u, v) { return v.prio - u.prio; });
      var etats = d.etats.map(function (e) { return ligneEtat(e, P); }).join('');
      return '<details class="bilan-domaine"><summary><span class="bilan-domaine-nom">' + esc(ins(D.titre || d.id)) + '</span>' +
        (d.score !== null ? '<span class="bilan-barre bilan-barre--' + d.bande + '"><span style="width:' + d.score + '%"></span></span><span class="bilan-barre-val">' + d.score + '%</span>' : '') +
        '</summary><div class="bilan-domaine-corps">' +
        (d.bande && D.rapport ? '<p class="bilan-texte">' + esc(ins(D.rapport[d.bande] || '')) + '</p>' : '') +
        '<h4 class="bilan-h4">' + x('rapport.accords') + '</h4>' +
        (accords.length ? '<ul class="bilan-puces">' + accords.map(function (i) {
          return '<li><strong>' + esc(ins(texteQ(i.id).court)) + ' :</strong> ' + esc(ins(reponseLue(i.id, i.a, P.a.genre, P.a.prenom, P.a.autre))) + '</li>';
        }).join('') + '</ul>' : '<p class="bilan-note">' + x('rapport.accordsAucun') + '</p>') +
        '<h4 class="bilan-h4">' + x('rapport.differences') + '</h4>' +
        (diffs.length ? diffs.map(function (i) { return carteEcart(i, P); }).join('') : '<p class="bilan-note">' + x('rapport.differencesAucune') + '</p>') +
        (etats ? '<div class="bilan-etats">' + etats + '</div>' : '') +
        '</div></details>';
    }).join('');
    html += carte('<h3 class="bilan-titre">' + x('rapport.domainesTitre') + '</h3>' + doms, 'bilan-domaines');

    // La météo, question par question.
    var meteo = an.etats.filter(function (e) { return e.domaine === 'meteo'; });
    if (meteo.length) {
      html += carte('<h3 class="bilan-titre">' + x('rapport.meteoTitre') + '</h3><p class="bilan-texte">' + x('rapport.meteoIntro') + '</p>' +
        '<div class="bilan-etats">' + meteo.map(function (e) { return ligneEtat(e, P); }).join('') + '</div>');
    }

    html += carte(
      '<div class="bilan-actions">' + bouton('imprimer', x('rapport.imprimer')) + '</div>' +
      '<p class="bilan-note">' + x('rapport.garde') + '</p>' +
      '<p class="bilan-note">' + x('rapport.note') + '</p>' +
      '<hr class="bilan-sep">' +
      '<div class="bilan-actions">' + bouton('supprimer', x('rapport.supprimer'), 'btn-outline btn-sm') + '</div>' +
      '<p class="bilan-note">' + x('rapport.supprimerAide') + '</p>', 'bilan-fin');
    afficher(html);
    ACTIONS = {
      imprimer: function () {
        racine.querySelectorAll('details').forEach(function (d) { d.open = true; });
        window.print();
      },
      supprimer: function (b) {
        confirmerDeuxFois(b, x('rapport.supprimerConfirmer'), function () {
          b.disabled = true;
          appel('supprimer', { id: entree.id, jeton: entree.jeton }).then(function (r) {
            if (r.statut !== 200 && r.statut !== 404) { b.disabled = false; return; }
            oublier(entree.id);
            afficher(carte('<p class="bilan-info">' + x('rapport.supprime') + '</p><div class="bilan-actions">' + bouton('accueil', x('attente.accueil'), 'btn-outline') + '</div>'));
          }).catch(function () { b.disabled = false; });
        });
      },
    };
  }
  window.addEventListener('beforeprint', function () {
    racine.querySelectorAll('details').forEach(function (d) { d.open = true; });
  });

  function ligneEtat(e, P) {
    var tq = texteQ(e.id);
    var rep = function (p, v, attention) {
      return '<div class="bilan-rep bilan-rep--' + p.perso + (attention ? ' bilan-rep--attention' : '') + '"><span class="bilan-rep-nom">' + esc(p.prenom) + '</span>' +
        '<span class="bilan-rep-val">' + esc(ins(reponseLue(e.id, v, p.genre, p.prenom, p.autre))) + '</span></div>';
    };
    var parler = (tq.parler || []).map(function (q) { return '<li>' + esc(ins(q)) + '</li>'; }).join('');
    var tags = (e.ecart ? '<span class="bilan-tag bilan-tag--ecart">' + x('rapport.meteoEcart') + '</span>' : '') +
      (e.attentionA || e.attentionB ? '<span class="bilan-tag bilan-tag--attention">' + x('rapport.meteoAttention') + '</span>' : '');
    var signal = e.ecart || e.attentionA || e.attentionB;
    return '<article class="bilan-etat' + (signal ? ' bilan-etat--signal' : '') + '">' +
      '<div class="bilan-ecart-tete"><h4>' + esc(ins(tq.court || e.id)) + '</h4><div class="bilan-tags">' + tags + '</div></div>' +
      '<div class="bilan-reps">' + rep(P.a, e.a, e.attentionA) + rep(P.b, e.b, e.attentionB) + '</div>' +
      (signal ? '<div class="bilan-guide">' + (tq.pourquoi ? '<p>' + esc(ins(tq.pourquoi)) + '</p>' : '') +
        (parler ? '<p><strong>' + x('rapport.parler') + '</strong></p><ul>' + parler + '</ul>' : '') + '</div>' : '') +
      '</article>';
  }

  demarrer();
})();
