/**
 * Onglet Réseaux de l'admin : les deux comptes Instagram (Quiz Couple, Les
 * mipaps), le planning de chacun en grille serrée (un jour par rangée, les
 * trois créneaux en colonnes), les posts publiés dans une vue à part lue à la
 * demande, le compte et son jeton, la pause générale, les idées et le journal.
 * Tout passe par la fonction admin-social, avec le jeton admin : les tables
 * social_* ne sont pas lisibles avec la clé publique du site.
 *
 * Les réponses sont gardées en mémoire de session par compte (préfixe
 * admin-cache, que le bouton « Actualiser » de l'en-tête vide aussi) : ouvrir
 * l'onglet dix fois ne relit pas dix fois la base. Les vignettes sont des
 * adresses signées d'une heure : la mémoire se périme après cinquante minutes.
 */
(function () {
  'use strict';

  var ctx = null;
  var donnees = null;
  var publies = null;
  var langue = 'en';
  var vue = 'planning';
  var branche = false;
  var toutLePlanning = false;

  var COMPTES = { en: 'Quiz Couple', fr: 'Les mipaps' };
  var CRENEAUX = { matin: 'Matin', midi: 'Midi', soir: 'Après-midi' };
  var ORDRE = ['matin', 'midi', 'soir'];
  var FORMATS = { reel: 'Reel', image: 'Image', carrousel: 'Carrousel' };
  var GABARITS = {
    citation: 'Citation', 'quiz-chrono': 'Quiz chrono', 'connais-tu': 'Connais-tu ton partenaire', 'tu-preferes': 'Tu préfères', pov: 'Animation', image: 'Image', carrousel: 'Carrousel', bd: 'BD',
    'mipaps-reel': 'Reel animé', 'mipaps-statique': 'Reel statique', 'mipaps-carrousel': 'Carrousel-histoire', 'mipaps-post': 'Post'
  };
  // les catégories de la ligne éditoriale, plus parlantes que le gabarit
  var CATEGORIES = {
    pov: 'Animation POV', coquin: 'Animation coquine', statique: 'Reel statique', 'connais-tu': 'Connais-tu ton partenaire', 'tu-preferes': 'Tu préfères', phrase: 'Phrase tendre', post: 'Post', carrousel: 'Carrousel', bd: 'BD',
    'mipaps-anime': 'Reel animé', 'mipaps-statique': 'Reel statique', 'mipaps-histoire': 'Carrousel-histoire', 'mipaps-post': 'Post'
  };
  // les catégories qu'une idée peut viser, par compte, avec le créneau de la grille
  var CATEGORIES_IDEE = {
    en: [
      ['pov', 'Animation POV (matin et soir)'], ['bd', 'BD en quatre cases (mardi soir)'], ['connais-tu', 'Connais-tu ton partenaire ? (midi)'], ['tu-preferes', 'Tu préfères (midi)'],
      ['statique', 'Reel statique, dessin et phrase (midi)'], ['phrase', 'Phrase tendre (week-end soir)'], ['coquin', 'Animation coquine (vendredi soir)'], ['carrousel', 'Carrousel de questions (jeudi soir)']
    ],
    fr: [
      ['mipaps-anime', 'Reel animé (matin)'], ['mipaps-post', 'Post : mini, déclaration ou schéma (midi)'], ['mipaps-histoire', 'Carrousel-histoire (soir, lundi, mercredi, vendredi, dimanche)'], ['mipaps-statique', 'Reel statique (soir, mardi, jeudi, samedi)']
    ]
  };
  function nomDuPost(p) { return CATEGORIES[p.categorie] || GABARITS[p.gabarit] || p.gabarit; }
  var STATUTS = {
    a_rendre: ['À rendre', 'attente'],
    rendu: ['Prêt', 'pret'],
    conteneur: ['Envoi', 'pret'],
    publication: ['Envoi', 'pret'],
    publie: ['Publié', 'publie'],
    echec: ['Échec', 'echec'],
    suspendu: ['Suspendu', 'suspendu'],
    annule: ['Annulé', 'suspendu'],
    planifie: ['Prévu', 'attente'],
    brouillon: ['Brouillon', 'attente'],
    valide: ['Validé', 'attente']
  };

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function heureParis(iso, avecJour) {
    if (!iso) return '';
    var o = { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit' };
    if (avecJour) { o.weekday = 'short'; o.day = 'numeric'; o.month = 'short'; }
    return new Date(iso).toLocaleString('fr-FR', o);
  }
  function jourLong(jour) {
    return new Date(jour + 'T12:00:00Z').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
  }
  function jourCourt(jour) {
    return new Date(jour + 'T12:00:00Z').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
  }
  function jourIso(d) { return d.toISOString().slice(0, 10); }
  function jourMoins(n) { return jourIso(new Date(Date.now() - n * 86400000)); }
  function ajouterJours(jour, n) { var d = new Date(jour + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return jourIso(d); }
  function jourDeSemaine(jour) { return ((new Date(jour + 'T12:00:00Z').getUTCDay() + 6) % 7) + 1; }
  function categorieAttendue(melange, jour, creneau) {
    var r = melange && melange[creneau];
    if (!r) return null;
    return typeof r === 'string' ? r : (r[String(jourDeSemaine(jour))] || null);
  }
  function nombre(n) { return n == null ? '' : Number(n).toLocaleString('fr-FR'); }

  // ── La mémoire de session, par compte ────────────────────────────────
  var CACHE_PREFIXE = 'admin-cache:rsx:';
  var PERIME_MS = 50 * 60000;
  function cle(quoi) { return CACHE_PREFIXE + quoi + ':' + langue; }
  function cacheLis(k) {
    try {
      var v = sessionStorage.getItem(k);
      if (!v) return null;
      var o = JSON.parse(v);
      return Date.now() - o.t > PERIME_MS ? null : o.d;
    } catch (e) { return null; }
  }
  function cacheEcris(k, d) { try { sessionStorage.setItem(k, JSON.stringify({ t: Date.now(), d: d })); } catch (e) {} }
  function cacheOublie() {
    try {
      Object.keys(sessionStorage).forEach(function (k) { if (k.indexOf(CACHE_PREFIXE) === 0) sessionStorage.removeItem(k); });
    } catch (e) {}
  }

  function compteCourant() { return (donnees && donnees.comptes || []).find(function (x) { return x.langue === langue; }) || { langue: langue }; }

  function appel(methode, corps, params) {
    var q = '?langue=' + langue + (params || '');
    return fetch(ctx.url + '/functions/v1/admin-social' + (methode === 'GET' ? q : ''), {
      method: methode,
      headers: {
        'Authorization': 'Bearer ' + ctx.cle,
        'x-admin-token': ctx.jeton,
        'Content-Type': 'application/json'
      },
      body: corps ? JSON.stringify(Object.assign({ langue: langue }, corps)) : undefined
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) {
        if (!r.ok || d.success === false) {
          var err = new Error(d.error || ('Erreur ' + r.status));
          err.donnees = d;
          throw err;
        }
        return d;
      });
    });
  }

  // une action modifie la base : on oublie la mémoire du compte et on relit
  function action(corps) {
    return appel('POST', corps).then(function () {
      cacheOublie();
      return charger(true).then(function () { if (vue === 'publies') return chargerPublies(true); });
    }).catch(function (e) { alert(e.message); });
  }

  // ── La barre : les comptes et les vues ───────────────────────────────
  function rendreBarre() {
    var comptes = (donnees && donnees.comptes && donnees.comptes.length) ? donnees.comptes : [{ langue: 'en' }, { langue: 'fr' }];
    $('rsx-comptes').innerHTML = comptes.map(function (c) {
      var actif = c.langue === langue;
      var etat = c.connecte ? (c.actif ? 'actif' : 'pause') : 'off';
      return '<button type="button" class="rsx-compte-chip' + (actif ? ' active' : '') + '" data-langue="' + esc(c.langue) + '" role="tab" aria-selected="' + actif + '">' +
        '<span class="rsx-point rsx-point--' + etat + '" aria-hidden="true"></span>' + esc(COMPTES[c.langue] || c.langue) +
        (c.nom && c.connecte ? '<small>@' + esc(c.nom) + '</small>' : '') + '</button>';
    }).join('');
    document.querySelectorAll('.rsx-vue').forEach(function (b) {
      var active = b.getAttribute('data-vue') === vue;
      b.classList.toggle('active', active);
      b.setAttribute('aria-selected', String(active));
    });
    $('rsx-vue-planning').classList.toggle('hidden', vue !== 'planning');
    $('rsx-vue-publies').classList.toggle('hidden', vue !== 'publies');
  }

  // ── Les tuiles ───────────────────────────────────────────────────────
  function rendreTuiles() {
    var c = compteCourant();
    $('rsx-compte-titre').textContent = COMPTES[langue] || langue;
    $('rsx-compte').textContent = c.connecte ? (c.actif ? 'Actif' : 'En pause') : 'Non connecté';
    $('rsx-compte-sub').textContent = c.connecte
      ? '@' + (c.nom || '?') + (c.jeton_expire_le ? ', accès valable jusqu\'au ' + new Date(c.jeton_expire_le).toLocaleDateString('fr-FR') : ', jeton de Page sans date d\'expiration')
      : 'les posts se préparent, rien ne part';
    $('rsx-reserve').textContent = String(donnees.reserve || 0);
    var prochaines = [];
    (donnees.posts || []).forEach(function (p) {
      (p.variantes || []).forEach(function (v) {
        if (v.publier_a && new Date(v.publier_a) > new Date() && ['a_rendre', 'rendu', 'conteneur'].indexOf(v.statut) >= 0 && p.statut === 'valide') {
          prochaines.push({ p: p, v: v });
        }
      });
    });
    prochaines.sort(function (a, b) { return new Date(a.v.publier_a) - new Date(b.v.publier_a); });
    if (prochaines.length) {
      $('rsx-prochain').textContent = heureParis(prochaines[0].v.publier_a, false);
      $('rsx-prochain-sub').textContent = heureParis(prochaines[0].v.publier_a, true) + ', ' + nomDuPost(prochaines[0].p).toLowerCase();
    } else {
      $('rsx-prochain').textContent = '-';
      $('rsx-prochain-sub').textContent = 'aucun post prévu';
    }
    $('rsx-pause').checked = donnees.reglages && donnees.reglages.pause === true;
    var pastille = document.querySelector('[data-notif="reseaux"]');
    var echecs = (donnees.posts || []).some(function (p) { return (p.variantes || []).some(function (v) { return v.statut === 'echec'; }); });
    if (pastille) pastille.classList.toggle('hidden', !echecs && (donnees.reserve || 0) >= 7);
    // les clics vers Instagram viennent du site : seul Quiz Couple en a
    $('rsx-clics-tuile').classList.toggle('hidden', langue !== 'en');
  }

  // ── Le compte et son jeton ───────────────────────────────────────────
  // Le formulaire du jeton : à la première connexion, et pour en coller un
  // nouveau si Meta refuse l'ancien (le journal le dit). Quand le jeton
  // relie plusieurs comptes Instagram (les deux Pages de Thomas), la
  // fonction renvoie la liste et on choisit lequel est celui-ci.
  function formulaireJeton() {
    return '<form id="rsx-connexion" class="rsx-connexion">' +
      '<label class="rsx-champ"><span>Jeton d\'accès Facebook longue durée (Graph API Explorer, puis « Étendre le jeton d\'accès » dans l\'outil de jetons)</span>' +
      '<input type="password" id="rsx-jeton" class="input" autocomplete="off" spellcheck="false" placeholder="EAA..."></label>' +
      '<button type="submit" class="btn btn-primary">Connecter</button></form>' +
      '<div id="rsx-choix" class="rsx-choix hidden"></div>';
  }
  function connecter(jeton, nom) {
    return appel('POST', { action: 'connecter', jeton: jeton, nom: nom }).then(function () {
      cacheOublie();
      return charger(true);
    }).catch(function (e) {
      var choix = e.donnees && e.donnees.choix;
      var zone = $('rsx-choix');
      if (choix && zone) {
        zone.classList.remove('hidden');
        zone.innerHTML = '<p>' + esc(e.message) + '</p>' + choix.map(function (c) {
          return '<button type="button" class="rsx-btn" data-choix="' + esc(c.nom) + '">@' + esc(c.nom) + ' <small>(Page ' + esc(c.page) + ')</small></button>';
        }).join('');
        zone.querySelectorAll('[data-choix]').forEach(function (b) {
          b.addEventListener('click', function () { connecter(jeton, b.getAttribute('data-choix')); });
        });
        return;
      }
      alert(e.message);
    });
  }
  function brancherJeton() {
    var f = $('rsx-connexion');
    if (!f) return;
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var jeton = $('rsx-jeton').value.trim();
      if (jeton) connecter(jeton, null);
    });
  }

  function rendreCompte() {
    var c = compteCourant();
    var corps = $('rsx-compte-corps');
    if (!c.connecte) {
      corps.innerHTML = formulaireJeton();
      brancherJeton();
      return;
    }
    corps.innerHTML =
      '<div class="rsx-compte-ligne"><div><strong>@' + esc(c.nom) + '</strong><span class="rsx-gris"> · identifiant ' + esc(c.ig_user_id) + ' · connexion Facebook</span></div>' +
      '<div class="rsx-actions"><label class="rsx-pause"><input type="checkbox" id="rsx-actif"' + (c.actif ? ' checked' : '') + '> <span>Publication active</span></label>' +
      '<button type="button" class="rsx-btn" id="rsx-changer-jeton">Changer le jeton</button></div></div>' +
      '<div class="rsx-compte-ligne"><div><span class="rsx-gris">' + (c.page_id ? 'Page Facebook « ' + esc(c.page_nom || c.page_id) + ' »' : 'Page Facebook : recolle le jeton pour la relier') + '</span></div>' +
      '<div class="rsx-actions"><label class="rsx-pause"><input type="checkbox" id="rsx-facebook"' + (c.facebook !== false ? ' checked' : '') + '> <span>Publier aussi sur la Page Facebook</span></label></div></div>' +
      '<div id="rsx-reconnexion" class="rsx-reconnexion hidden">' + formulaireJeton() + '</div>';
    $('rsx-actif').addEventListener('change', function () {
      action({ action: 'activer', actif: this.checked });
    });
    $('rsx-facebook').addEventListener('change', function () {
      action({ action: 'facebook', facebook: this.checked });
    });
    $('rsx-changer-jeton').addEventListener('click', function () {
      $('rsx-reconnexion').classList.toggle('hidden');
    });
    brancherJeton();
  }

  // ── Le planning : une grille, un jour par rangée ─────────────────────
  var ICONES = {
    suspendre: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>',
    reprendre: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5v14l11-7z"/></svg>',
    annuler: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" fill="none"/></svg>',
    relancer: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.3-5.7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M20 4v5h-5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>'
  };
  function boutonsPost(p, v) {
    var b = [];
    if (v && v.statut === 'publie') return '';
    if (p.statut === 'valide') b.push('<button class="rsx-ico" data-act="suspendre" data-post="' + p.id + '" title="Suspendre" aria-label="Suspendre">' + ICONES.suspendre + '</button>');
    if (p.statut === 'suspendu' || p.statut === 'annule') b.push('<button class="rsx-ico" data-act="reprendre" data-post="' + p.id + '" title="Reprendre" aria-label="Reprendre">' + ICONES.reprendre + '</button>');
    if (v && v.statut === 'echec') b.push('<button class="rsx-ico" data-act="relancer" data-variante="' + v.id + '" title="Relancer le rendu" aria-label="Relancer">' + ICONES.relancer + '</button>');
    if (p.statut !== 'annule') b.push('<button class="rsx-ico rsx-ico--danger" data-act="annuler" data-post="' + p.id + '" title="Annuler ce post" aria-label="Annuler">' + ICONES.annuler + '</button>');
    return b.join('');
  }

  // le son tendance posé à la publication (Audio API)
  function libelleSon(v) {
    if (!v || !v.son || !v.son.titre) return '';
    var bulle = 'Son de la bibliothèque Instagram' + (v.son.ambiance ? ', ambiance ' + v.son.ambiance : '') + (v.son.recherche ? ', recherche « ' + v.son.recherche + ' »' : '');
    return '<span class="rsx-son" title="' + esc(bulle) + '">♪ ' + esc(v.son.titre) + (v.son.artiste ? ' · ' + esc(v.son.artiste) : '') + '</span>';
  }

  function casePost(p) {
    var v = (p.variantes || []).find(function (x) { return x.langue === langue; }) || (p.variantes || [])[0];
    var statut = p.statut !== 'valide' ? STATUTS[p.statut] : STATUTS[v ? v.statut : 'planifie'];
    statut = statut || [p.statut, 'attente'];
    return '<div class="rsx-case is-' + statut[1] + '">' +
      '<div class="rsx-case-vignette">' + (v && v.vignette ? '<img src="' + esc(v.vignette) + '" alt="" loading="lazy">' : '<span>' + esc((FORMATS[p.format] || '').slice(0, 1)) + '</span>') + '</div>' +
      '<div class="rsx-case-corps">' +
      '<div class="rsx-case-haut"><strong>' + esc(v && v.publier_a ? heureParis(v.publier_a) : '-') + '</strong>' +
      '<span class="rsx-statut rsx-statut--' + statut[1] + '">' + esc(statut[0]) + '</span>' +
      (v && v.story_statut === 'publie' ? '<span class="rsx-statut rsx-statut--publie" title="Le reel du matin a aussi été publié en story">+ story</span>' : '') +
      (v && v.story_statut === 'echec' ? '<span class="rsx-statut rsx-statut--echec" title="La story du matin n\'est pas partie (voir le journal)">story ✕</span>' : '') +
      (v && v.fb_statut === 'publie' ? '<span class="rsx-statut rsx-statut--publie" title="Publié aussi sur la Page Facebook">+ Facebook</span>' : '') +
      (v && v.fb_statut === 'echec' ? '<span class="rsx-statut rsx-statut--echec" title="' + esc('Pas publié sur la Page Facebook : ' + (v.fb_erreur || 'voir le journal')) + '">Facebook ✕</span>' : '') + '</div>' +
      '<div class="rsx-case-cat">' + esc(nomDuPost(p)) + '</div>' +
      '<div class="rsx-case-texte" title="' + esc(v ? v.texte : '') + '">' + esc(v ? v.texte : '') + '</div>' +
      libelleSon(v) +
      (v && v.erreur ? '<div class="rsx-erreur" title="' + esc(v.erreur) + '">' + esc(v.erreur) + '</div>' : '') +
      '</div>' +
      '<div class="rsx-case-actions">' + boutonsPost(p, v) + (v && v.permalien ? '<a class="rsx-ico" href="' + esc(v.permalien) + '" target="_blank" rel="noopener" title="Voir sur Instagram" aria-label="Voir sur Instagram">↗</a>' : '') +
      (v && v.fb_lien ? '<a class="rsx-ico" href="' + esc(v.fb_lien) + '" target="_blank" rel="noopener" title="Voir sur Facebook" aria-label="Voir sur Facebook">f</a>' : '') + '</div>' +
      '</div>';
  }
  function caseVide(jour, creneau) {
    var attendue = categorieAttendue(donnees.melange, jour, creneau);
    return '<div class="rsx-case is-vide"><span>à écrire</span>' + (attendue ? '<small>' + esc(CATEGORIES[attendue] || attendue) + '</small>' : '') + '</div>';
  }

  function rendrePlanning() {
    var el = $('rsx-planning');
    var posts = donnees.posts || [];
    var aujourdhui = donnees.aujourdhui || jourIso(new Date());
    var n = toutLePlanning ? 16 : 10;
    var jours = [];
    for (var i = 0; i < n; i++) jours.push(ajouterJours(aujourdhui, i));
    // un post passé qui n'est pas parti (échec) reste visible devant
    posts.forEach(function (p) { if (p.jour < aujourdhui && jours.indexOf(p.jour) < 0) jours.push(p.jour); });
    jours.sort();
    var html = '<div class="rsx-grille" role="table"><div class="rsx-grille-tete" role="row"><span></span>' +
      ORDRE.map(function (c) { return '<span role="columnheader">' + esc(CRENEAUX[c]) + '</span>'; }).join('') + '</div>';
    jours.forEach(function (jour) {
      html += '<div class="rsx-rang' + (jour === aujourdhui ? ' is-aujourdhui' : '') + (jour < aujourdhui ? ' is-passe' : '') + '" role="row">' +
        '<div class="rsx-rang-jour" role="rowheader" title="' + esc(jourLong(jour)) + '">' + esc(jourCourt(jour)) + (jour === aujourdhui ? '<small>aujourd\'hui</small>' : '') + '</div>';
      ORDRE.forEach(function (c) {
        var p = posts.find(function (x) { return x.jour === jour && x.creneau === c; });
        html += p ? casePost(p) : (jour < aujourdhui ? '<div class="rsx-case is-vide"></div>' : caseVide(jour, c));
      });
      html += '</div>';
    });
    html += '</div>';
    if (!toutLePlanning) html += '<div class="rsx-plus"><button type="button" class="rsx-btn" id="rsx-plus">Six jours de plus</button></div>';
    el.innerHTML = html;
    var plus = $('rsx-plus');
    if (plus) plus.addEventListener('click', function () { toutLePlanning = true; rendrePlanning(); });
  }

  // ── Les posts publiés : à part, lus quand on ouvre la vue ────────────
  function rendrePublies() {
    var el = $('rsx-publies');
    if (!publies) { el.innerHTML = '<p class="rsx-vide">Chargement...</p>'; return; }
    var liste = publies.publies || [];
    if (!liste.length) { el.innerHTML = '<p class="rsx-vide">Rien de publié encore sur ce compte.</p>'; return; }
    el.innerHTML = '<div class="rsx-pubs">' + liste.map(function (v) {
      var p = v.post || {};
      var s = v.stats;
      var chiffres = s ? [s.vues != null ? nombre(s.vues) + ' vues' : null, s.likes != null ? nombre(s.likes) + ' j\'aime' : null, s.partages != null ? nombre(s.partages) + ' partages' : null, s.enregistrements != null ? nombre(s.enregistrements) + ' enreg.' : null].filter(Boolean).join(' · ') : '';
      return '<article class="rsx-pub">' +
        (v.permalien ? '<a href="' + esc(v.permalien) + '" target="_blank" rel="noopener" class="rsx-pub-image">' : '<div class="rsx-pub-image">') +
        (v.vignette ? '<img src="' + esc(v.vignette) + '" alt="" loading="lazy">' : '<span>' + esc((FORMATS[p.format] || '').slice(0, 1)) + '</span>') +
        (v.permalien ? '</a>' : '</div>') +
        '<div class="rsx-pub-corps"><strong>' + esc(heureParis(v.publie_le, true)) + '</strong>' +
        '<span class="rsx-case-cat">' + esc(nomDuPost(p)) + (v.story_statut === 'publie' ? ' · + story' : '') + (v.fb_statut === 'publie' ? ' · + Facebook' : '') + (v.fb_statut === 'echec' ? ' · Facebook ✕' : '') + '</span>' +
        '<p title="' + esc(v.texte) + '">' + esc(v.texte) + '</p>' +
        (chiffres ? '<small>' + esc(chiffres) + '</small>' : '<small class="rsx-gris">statistiques à J+1 et J+7</small>') +
        libelleSon(v) +
        (v.fb_lien ? '<small><a href="' + esc(v.fb_lien) + '" target="_blank" rel="noopener">Voir sur Facebook ↗</a></small>' : '') + '</div></article>';
    }).join('') + '</div>';
  }
  function chargerPublies(force) {
    var k = cle('publies');
    var enCache = force ? null : cacheLis(k);
    if (enCache) { publies = enCache; rendrePublies(); return Promise.resolve(); }
    publies = null;
    rendrePublies();
    return appel('GET', null, '&publies=1').then(function (d) {
      publies = d;
      cacheEcris(k, d);
      rendrePublies();
    }).catch(function (e) {
      $('rsx-publies').innerHTML = '<p class="rsx-vide">Chargement impossible : ' + esc(e.message) + '</p>';
    });
  }

  // ── Les idées et le journal ──────────────────────────────────────────
  function quand(c) { return jourLong(c.jour) + ', ' + (CRENEAUX[c.creneau] || c.creneau).toLowerCase(); }
  // Ce que l'idée devient : la fonction d'admin calcule le créneau visé avec
  // la règle de la routine (le plus proche de sa catégorie, rien d'encore
  // parti), puis la synchro la marque utilisée avec le post qui la porte.
  function etatIdee(i) {
    if (i.utilisee_le) return i.post ? 'utilisée : post du ' + quand(i.post) : 'utilisée';
    if (i.visee) return 'visée : ' + quand(i.visee) + ' (Claude l\'écrit à son passage de 5 h 44)';
    if (!i.categorie) return 'Claude choisit la catégorie à son prochain passage (5 h 44), puis le créneau le plus proche';
    return 'aucun créneau libre trouvé pour cette catégorie dans les cinq prochaines semaines';
  }
  function rendreIdees() {
    var select = $('rsx-idee-categorie');
    var choix = CATEGORIES_IDEE[langue] || [];
    select.innerHTML = '<option value="">Claude choisit la catégorie</option>' + choix.map(function (c) { return '<option value="' + esc(c[0]) + '">' + esc(c[1]) + '</option>'; }).join('');
    $('rsx-idee').placeholder = langue === 'fr' ? 'elle lui vole son pull, il a froid, elle est ravie' : 'POV : il rentre avec des fleurs, elle croit qu\'il a fait une bêtise';
    var idees = donnees.idees || [];
    $('rsx-idees').innerHTML = idees.length ? idees.map(function (i) {
      return '<li><span>' + (i.categorie ? '<small class="rsx-idee-cat">' + esc(CATEGORIES[i.categorie] || i.categorie) + '</small>' : '') +
        '<span>' + esc(i.texte) + '</span><small class="rsx-idee-etat">' + esc(etatIdee(i)) + '</small></span>' +
        '<button class="rsx-btn rsx-btn--danger" data-act="supprimer_idee" data-id="' + i.id + '" aria-label="Supprimer">✕</button></li>';
    }).join('') : '<li class="rsx-gris">Aucune idée en attente.</li>';
  }

  function rendreJournal() {
    var j = donnees.journal || [];
    $('rsx-journal').innerHTML = j.length ? j.map(function (e) {
      return '<li class="rsx-j--' + esc(e.niveau) + '"><time>' + esc(new Date(e.at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })) + '</time>' +
        '<span>' + esc(e.source) + '</span><span>' + esc(e.message) + '</span></li>';
    }).join('') : '<li class="rsx-gris">Rien pour l\'instant.</li>';
  }

  function rendre() {
    rendreBarre();
    rendreTuiles();
    rendreCompte();
    rendrePlanning();
    rendreIdees();
    rendreJournal();
  }

  // Les clics vers Instagram depuis le site : un total, tous boutons
  // confondus (Thomas, 7 octobre 2026), lu par la fonction publique
  // get_instagram_clics (migration 20261008150000), comme les statistiques
  // de trafic, avec la clé publique. Quiz Couple seulement : le site est le sien.
  function chargerClics() {
    return fetch(ctx.url + '/rest/v1/rpc/get_instagram_clics', {
      method: 'POST',
      headers: { 'apikey': ctx.cle, 'Authorization': 'Bearer ' + ctx.cle, 'Content-Type': 'application/json' },
      body: '{}'
    }).then(function (r) { return r.json(); }).then(function (r) {
      var c = Array.isArray(r) ? r[0] : r;
      if (!c || c.total == null) throw new Error('vide');
      $('rsx-clics').textContent = String(c.total);
      $('rsx-clics-sub').textContent = c.jours7 + ' sur sept jours, ' + c.aujourdhui + ' aujourd\'hui, depuis le site, tous boutons confondus';
    }).catch(function () {
      $('rsx-clics').textContent = '-';
      $('rsx-clics-sub').textContent = 'migration instagram_clics à appliquer dans Supabase';
    });
  }

  function charger(force) {
    var k = cle('planning');
    var enCache = force ? null : cacheLis(k);
    if (enCache) { donnees = enCache; rendre(); return Promise.resolve(); }
    return appel('GET', null, '&jours=18&debut=' + jourMoins(2)).then(function (d) {
      donnees = d;
      cacheEcris(k, d);
      rendre();
    }).catch(function (e) {
      $('rsx-planning').innerHTML = '<p class="rsx-vide">Chargement impossible : ' + esc(e.message) + '</p>';
    });
  }

  function choisirCompte(l) {
    if (!COMPTES[l] && !(donnees && (donnees.comptes || []).some(function (c) { return c.langue === l; }))) return;
    langue = l;
    try { sessionStorage.setItem('rsx-langue', l); } catch (e) {}
    toutLePlanning = false;
    publies = null;
    charger().then(function () { if (vue === 'publies') return chargerPublies(); });
  }
  function choisirVue(v) {
    vue = v;
    rendreBarre();
    if (v === 'publies') chargerPublies();
  }

  function brancher() {
    if (branche) return;
    branche = true;
    try { langue = sessionStorage.getItem('rsx-langue') || 'en'; } catch (e) {}
    $('rsx-comptes').addEventListener('click', function (e) {
      var b = e.target.closest('[data-langue]');
      if (b) choisirCompte(b.getAttribute('data-langue'));
    });
    document.querySelectorAll('.rsx-vue').forEach(function (b) {
      b.addEventListener('click', function () { choisirVue(b.getAttribute('data-vue')); });
    });
    $('rsx-actualiser').addEventListener('click', function () {
      cacheOublie();
      charger(true).then(function () { if (vue === 'publies') return chargerPublies(true); });
    });
    $('rsx-pause').addEventListener('change', function () {
      if (this.checked && !confirm('Mettre en pause toutes les publications, des deux comptes ?')) { this.checked = false; return; }
      action({ action: 'pause', valeur: this.checked });
    });
    $('rsx-idee-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var t = $('rsx-idee').value.trim();
      if (!t) return;
      var categorie = $('rsx-idee-categorie').value || null;
      $('rsx-idee').value = '';
      $('rsx-idee-categorie').value = '';
      action({ action: 'idee', texte: t, categorie: categorie });
    });
    $('admin-reseaux-tab').addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]');
      if (!b || b.id === 'rsx-pause') return;
      var act = b.getAttribute('data-act');
      if (act === 'annuler' && !confirm('Annuler ce post ? Il ne sera pas publié.')) return;
      action({ action: act, post_id: b.getAttribute('data-post'), variante_id: b.getAttribute('data-variante'), id: b.getAttribute('data-id') });
    });
  }

  window.AdminReseaux = {
    ouvrir: function (contexte) {
      ctx = contexte;
      brancher();
      chargerClics();
      charger().then(function () { if (vue === 'publies') return chargerPublies(); });
    }
  };
})();
