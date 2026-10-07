/**
 * Onglet Réseaux de l'admin : planning des posts Instagram, compte, pause
 * générale, idées et journal. Tout passe par la fonction admin-social, avec
 * le jeton admin : les tables social_* ne sont pas lisibles avec la clé
 * publique du site.
 */
(function () {
  'use strict';

  var ctx = null;
  var donnees = null;
  var charge = false;

  var CRENEAUX = { matin: 'Matin', midi: 'Midi', soir: 'Après-midi' };
  var FORMATS = { reel: 'Reel', image: 'Image', carrousel: 'Carrousel' };
  var GABARITS = { citation: 'Citation', 'quiz-chrono': 'Quiz chrono', 'connais-tu': 'Connais-tu ton partenaire', 'tu-preferes': 'Tu préfères', pov: 'Animation', image: 'Image', carrousel: 'Carrousel' };
  // les catégories de la ligne éditoriale, plus parlantes que le gabarit
  var CATEGORIES = { pov: 'Animation POV', coquin: 'Animation coquine', statique: 'Reel statique', 'connais-tu': 'Connais-tu ton partenaire', 'tu-preferes': 'Tu préfères', phrase: 'Phrase tendre', post: 'Post', carrousel: 'Carrousel' };
  function nomDuPost(p) { return CATEGORIES[p.categorie] || GABARITS[p.gabarit] || p.gabarit; }
  var STATUTS = {
    a_rendre: ['À rendre', 'attente'],
    rendu: ['Prêt', 'pret'],
    conteneur: ['Envoi en cours', 'pret'],
    publication: ['Envoi en cours', 'pret'],
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

  function compteEn() { return (donnees && donnees.comptes || []).find(function (x) { return x.langue === 'en'; }) || {}; }
  function jourMoins(n) { return new Date(Date.now() - n * 86400000).toISOString().slice(0, 10); }

  function appel(methode, corps) {
    return fetch(ctx.url + '/functions/v1/admin-social' + (methode === 'GET' ? '?jours=23&debut=' + jourMoins(7) : ''), {
      method: methode,
      headers: {
        'Authorization': 'Bearer ' + ctx.cle,
        'x-admin-token': ctx.jeton,
        'Content-Type': 'application/json'
      },
      body: corps ? JSON.stringify(corps) : undefined
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) {
        if (!r.ok || d.success === false) throw new Error(d.error || ('Erreur ' + r.status));
        return d;
      });
    });
  }

  function action(corps) {
    return appel('POST', corps).then(charger).catch(function (e) { alert(e.message); });
  }

  // ── Rendu ────────────────────────────────────────────────────────────
  function rendreTuiles() {
    var c = compteEn();
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
  }

  // Le formulaire du jeton : à la première connexion, et pour en coller un
  // nouveau si Meta refuse l'ancien (le journal le dit).
  function formulaireJeton() {
    return '<form id="rsx-connexion" class="rsx-connexion">' +
      '<label class="rsx-champ"><span>Jeton d\'accès Facebook longue durée (Graph API Explorer, puis « Étendre le jeton d\'accès » dans l\'outil de jetons)</span>' +
      '<input type="password" id="rsx-jeton" class="input" autocomplete="off" spellcheck="false" placeholder="EAA..."></label>' +
      '<button type="submit" class="btn btn-primary">Connecter</button></form>';
  }
  function brancherJeton() {
    $('rsx-connexion').addEventListener('submit', function (e) {
      e.preventDefault();
      var jeton = $('rsx-jeton').value.trim();
      if (!jeton) return;
      action({ action: 'connecter', langue: 'en', jeton: jeton });
    });
  }

  function rendreCompte() {
    var c = compteEn();
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
      '<div id="rsx-reconnexion" class="rsx-reconnexion hidden">' + formulaireJeton() + '</div>';
    $('rsx-actif').addEventListener('change', function () {
      action({ action: 'activer', langue: 'en', actif: this.checked });
    });
    $('rsx-changer-jeton').addEventListener('click', function () {
      $('rsx-reconnexion').classList.toggle('hidden');
    });
    brancherJeton();
  }

  function boutonsPost(p, v) {
    var b = [];
    var publie = v && v.statut === 'publie';
    if (publie) return '';
    if (p.statut === 'valide') b.push('<button class="rsx-btn" data-act="suspendre" data-post="' + p.id + '">Suspendre</button>');
    if (p.statut === 'suspendu' || p.statut === 'annule') b.push('<button class="rsx-btn" data-act="reprendre" data-post="' + p.id + '">Reprendre</button>');
    if (p.statut !== 'annule') b.push('<button class="rsx-btn rsx-btn--danger" data-act="annuler" data-post="' + p.id + '">Annuler</button>');
    if (v && v.statut === 'echec') b.push('<button class="rsx-btn" data-act="relancer" data-variante="' + v.id + '">Relancer</button>');
    return b.join('');
  }

  function libelleFormat(p) {
    var f = FORMATS[p.format] || p.format, g = nomDuPost(p);
    return f === g ? f : f + ' · ' + g;
  }

  // le son tendance posé à la publication (Audio API)
  function libelleSon(v) {
    if (!v || !v.son || !v.son.titre) return '';
    return '<span class="rsx-son" title="Son de la bibliothèque Instagram">♪ ' + esc(v.son.titre) + (v.son.artiste ? ' · ' + esc(v.son.artiste) : '') + '</span>';
  }

  function rendrePlanning() {
    var posts = donnees.posts || [];
    var el = $('rsx-planning');
    if (!posts.length) {
      el.innerHTML = '<p class="rsx-vide">Aucun post sur ces deux semaines. La routine Claude remplit le planning chaque jour, avec 14 jours d\'avance une fois lancée.</p>';
      return;
    }
    var parJour = {};
    posts.forEach(function (p) { (parJour[p.jour] = parJour[p.jour] || []).push(p); });
    var ordre = { matin: 0, midi: 1, soir: 2 };
    el.innerHTML = Object.keys(parJour).sort().map(function (jour) {
      var lignes = parJour[jour].sort(function (a, b) { return ordre[a.creneau] - ordre[b.creneau]; }).map(function (p) {
        var v = (p.variantes || []).find(function (x) { return x.langue === 'en'; }) || (p.variantes || [])[0];
        var statut = p.statut !== 'valide' ? STATUTS[p.statut] : STATUTS[v ? v.statut : 'planifie'];
        statut = statut || [p.statut, 'attente'];
        return '<div class="rsx-ligne">' +
          '<div class="rsx-vignette">' + (v && v.vignette ? '<img src="' + esc(v.vignette) + '" alt="" loading="lazy">' : '<span>' + esc((FORMATS[p.format] || '').slice(0, 1)) + '</span>') + '</div>' +
          '<div class="rsx-quand"><strong>' + esc(v && v.publier_a ? heureParis(v.publier_a) : '-') + '</strong><span>' + esc(CRENEAUX[p.creneau] || p.creneau) + '</span></div>' +
          '<div class="rsx-quoi"><span class="rsx-format">' + esc(libelleFormat(p)) + '</span>' +
          '<span class="rsx-texte">' + esc(v ? v.texte : '') + '</span>' +
          libelleSon(v) +
          (v && v.erreur ? '<span class="rsx-erreur">' + esc(v.erreur) + '</span>' : '') + '</div>' +
          '<div class="rsx-etat"><span class="rsx-statut rsx-statut--' + statut[1] + '">' + esc(statut[0]) + '</span>' +
          (v && v.permalien ? '<a href="' + esc(v.permalien) + '" target="_blank" rel="noopener">Voir</a>' : '') + '</div>' +
          '<div class="rsx-actions">' + boutonsPost(p, v) + '</div>' +
          '</div>';
      }).join('');
      return '<section class="rsx-jour"><h3>' + esc(jourLong(jour)) + '</h3>' + lignes + '</section>';
    }).join('');
  }

  function rendreIdees() {
    var idees = donnees.idees || [];
    $('rsx-idees').innerHTML = idees.length ? idees.map(function (i) {
      return '<li><span>' + esc(i.texte) + (i.utilisee_le ? ' <em class="rsx-gris">(utilisée)</em>' : '') + '</span>' +
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
    rendreTuiles();
    rendreCompte();
    rendrePlanning();
    rendreIdees();
    rendreJournal();
  }

  function charger() {
    return appel('GET').then(function (d) {
      donnees = d;
      rendre();
    }).catch(function (e) {
      $('rsx-planning').innerHTML = '<p class="rsx-vide">Chargement impossible : ' + esc(e.message) + '</p>';
    });
  }

  function brancher() {
    if (charge) return;
    charge = true;
    $('rsx-pause').addEventListener('change', function () {
      if (this.checked && !confirm('Mettre en pause toutes les publications ?')) { this.checked = false; return; }
      action({ action: 'pause', valeur: this.checked });
    });
    $('rsx-idee-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var t = $('rsx-idee').value.trim();
      if (!t) return;
      $('rsx-idee').value = '';
      action({ action: 'idee', texte: t });
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
      charger();
    }
  };
})();
