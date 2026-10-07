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
  function modeManuel() { return compteEn().mode === 'manuel'; }
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
    var c = (donnees.comptes || []).find(function (x) { return x.langue === 'en'; }) || {};
    $('rsx-compte').textContent = c.connecte ? (c.actif ? 'Actif' : 'En pause') : 'Non connecté';
    $('rsx-compte-sub').textContent = c.connecte
      ? '@' + (c.nom || '?') + (c.jeton_expire_le ? ', jeton valable jusqu\'au ' + new Date(c.jeton_expire_le).toLocaleDateString('fr-FR') : '')
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
    var aPublier = listeAPublier();
    if (modeManuel() && aPublier.length) {
      $('rsx-prochain').textContent = String(aPublier.length) + (aPublier.length > 1 ? ' reels' : ' reel');
      $('rsx-prochain-sub').textContent = 'à publier à la main depuis l\'appli';
    } else if (prochaines.length) {
      $('rsx-prochain').textContent = heureParis(prochaines[0].v.publier_a, false);
      $('rsx-prochain-sub').textContent = heureParis(prochaines[0].v.publier_a, true) + ', ' + nomDuPost(prochaines[0].p).toLowerCase();
    } else {
      $('rsx-prochain').textContent = '-';
      $('rsx-prochain-sub').textContent = 'aucun post prévu';
    }
    $('rsx-pause').checked = donnees.reglages && donnees.reglages.pause === true;
    var pastille = document.querySelector('[data-notif="reseaux"]');
    var echecs = (donnees.posts || []).some(function (p) { return (p.variantes || []).some(function (v) { return v.statut === 'echec'; }); });
    var enRetard = aPublier.some(function (x) { return new Date(x.v.publier_a) < new Date(); });
    if (pastille) pastille.classList.toggle('hidden', !echecs && !enRetard && (donnees.reserve || 0) >= 7);
  }

  // Les reels prêts d'un compte en mode manuel : à publier depuis l'appli.
  function listeAPublier() {
    if (!modeManuel()) return [];
    var l = [];
    (donnees.posts || []).forEach(function (p) {
      if (p.format !== 'reel' || p.statut !== 'valide') return;
      (p.variantes || []).forEach(function (v) {
        if (v.langue === 'en' && v.statut === 'rendu') l.push({ p: p, v: v });
      });
    });
    l.sort(function (a, b) { return new Date(a.v.publier_a) - new Date(b.v.publier_a); });
    return l;
  }

  function legendeComplete(v) {
    return ((v.legende || '').trim() + '\n\n' + (v.hashtags || []).join(' ')).trim();
  }

  function copier(texte, bouton) {
    var fini = function () {
      var t = bouton.textContent;
      bouton.textContent = 'Copiée !';
      setTimeout(function () { bouton.textContent = t; }, 1600);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texte).then(fini, function () { copierAncien(texte); fini(); });
    } else { copierAncien(texte); fini(); }
  }
  function copierAncien(texte) {
    var z = document.createElement('textarea');
    z.value = texte; z.setAttribute('readonly', ''); z.style.position = 'fixed'; z.style.opacity = '0';
    document.body.appendChild(z); z.select(); try { document.execCommand('copy'); } catch (e) { /* tant pis */ }
    document.body.removeChild(z);
  }

  var ouverte = null;
  function rendreAPublier() {
    var panneau = $('rsx-main-panel');
    var el = $('rsx-main');
    if (!panneau || !el) return;
    var manuel = modeManuel();
    panneau.classList.toggle('hidden', !manuel);
    if (!manuel) return;
    var l = listeAPublier();
    if (!l.length) {
      el.innerHTML = '<p class="rsx-vide">Rien à publier pour le moment : les reels apparaissent ici dès qu\'ils sont rendus, la veille au soir.</p>';
      return;
    }
    var maintenant = new Date();
    el.innerHTML = l.map(function (x) {
      var p = x.p, v = x.v;
      var retard = v.publier_a && new Date(v.publier_a) < maintenant;
      var ouvert = ouverte === v.id;
      var nomFichier = 'quiz-couple-' + p.jour + '-' + p.creneau + '.mp4';
      return '<article class="rsx-carte' + (ouvert ? ' is-ouverte' : '') + (retard ? ' is-retard' : '') + '" data-carte="' + esc(v.id) + '">' +
        '<button type="button" class="rsx-carte-tete" data-ouvrir="' + esc(v.id) + '" aria-expanded="' + (ouvert ? 'true' : 'false') + '">' +
        '<div class="rsx-vignette">' + (v.vignette ? '<img src="' + esc(v.vignette) + '" alt="" loading="lazy">' : '<span>R</span>') + '</div>' +
        '<div class="rsx-carte-titre"><strong>' + esc(v.texte || nomDuPost(p)) + '</strong>' +
        '<span>' + esc(nomDuPost(p)) + ' · prévu ' + esc(heureParis(v.publier_a, true)) + (retard ? ' · <b>en retard</b>' : '') + '</span></div>' +
        '<span class="rsx-carte-fleche" aria-hidden="true">›</span></button>' +
        '<div class="rsx-carte-corps">' +
        '<div>' + (v.video ? '<video controls playsinline preload="none"' + (v.couverture ? ' poster="' + esc(v.couverture) + '"' : '') + ' src="' + esc(v.video) + '"></video>' : '<p class="rsx-aide">Vidéo indisponible (fichier supprimé).</p>') + '</div>' +
        '<div><pre class="rsx-legende">' + esc((v.legende || '').trim()) + '\n\n<span class="rsx-tags">' + esc((v.hashtags || []).join(' ')) + '</span></pre>' +
        '<div class="rsx-carte-actions">' +
        (v.video ? '<a class="btn btn-primary" href="' + esc(v.video) + '" download="' + esc(nomFichier) + '" target="_blank" rel="noopener">Enregistrer la vidéo</a>' +
          '<p class="rsx-aide">Sur iPhone : la vidéo s\'ouvre, appuie sur Partager puis « Enregistrer la vidéo ». Le fichier est l\'original en 1080 × 1920.</p>' : '') +
        '<button type="button" class="rsx-btn" data-copier="' + esc(v.id) + '">Copier la légende et les hashtags</button>' +
        '<button type="button" class="rsx-btn rsx-btn--publie" data-act="publie_main" data-variante="' + esc(v.id) + '">Publié !</button>' +
        '</div></div></div></article>';
    }).join('');
  }

  function rendreCompte() {
    var c = (donnees.comptes || []).find(function (x) { return x.langue === 'en'; }) || {};
    var corps = $('rsx-compte-corps');
    if (!c.connecte) {
      corps.innerHTML =
        '<form id="rsx-connexion" class="rsx-connexion">' +
        '<label class="rsx-champ"><span>Jeton d\'accès du compte anglais (appli Meta, « Generate token »)</span>' +
        '<input type="password" id="rsx-jeton" class="input" autocomplete="off" spellcheck="false" placeholder="IGAA..."></label>' +
        '<button type="submit" class="btn btn-primary">Connecter</button></form>';
      $('rsx-connexion').addEventListener('submit', function (e) {
        e.preventDefault();
        var jeton = $('rsx-jeton').value.trim();
        if (!jeton) return;
        action({ action: 'connecter', langue: 'en', jeton: jeton });
      });
      return;
    }
    var manuel = c.mode === 'manuel';
    corps.innerHTML =
      '<div class="rsx-compte-ligne"><div><strong>@' + esc(c.nom) + '</strong><span class="rsx-gris"> · identifiant ' + esc(c.ig_user_id) + '</span></div>' +
      '<label class="rsx-pause"><input type="checkbox" id="rsx-actif"' + (c.actif ? ' checked' : '') + '> <span>Publication active</span></label></div>' +
      '<div class="rsx-compte-ligne" style="margin-top:.8rem"><div><strong>Les reels</strong><span class="rsx-gris"> · les images et les carrousels partent toujours tout seuls</span></div>' +
      '<div class="rsx-mode" role="radiogroup">' +
      '<label><input type="radio" name="rsx-mode" value="auto"' + (manuel ? '' : ' checked') + '> Automatique (API, notre musique)</label>' +
      '<label><input type="radio" name="rsx-mode" value="manuel"' + (manuel ? ' checked' : '') + '> À la main (son tendance dans l\'appli)</label>' +
      '</div></div>';
    $('rsx-actif').addEventListener('change', function () {
      action({ action: 'activer', langue: 'en', actif: this.checked });
    });
    corps.querySelectorAll('input[name="rsx-mode"]').forEach(function (r) {
      r.addEventListener('change', function () {
        if (this.checked) action({ action: 'mode', langue: 'en', mode: this.value });
      });
    });
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
        if (v && v.statut === 'rendu' && p.format === 'reel' && modeManuel()) statut = ['À publier', 'attente'];
        if (v && v.statut === 'publie' && v.publie_main) statut = ['Publié (appli)', 'publie'];
        return '<div class="rsx-ligne">' +
          '<div class="rsx-vignette">' + (v && v.vignette ? '<img src="' + esc(v.vignette) + '" alt="" loading="lazy">' : '<span>' + esc((FORMATS[p.format] || '').slice(0, 1)) + '</span>') + '</div>' +
          '<div class="rsx-quand"><strong>' + esc(v && v.publier_a ? heureParis(v.publier_a) : '-') + '</strong><span>' + esc(CRENEAUX[p.creneau] || p.creneau) + '</span></div>' +
          '<div class="rsx-quoi"><span class="rsx-format">' + esc(libelleFormat(p)) + '</span>' +
          '<span class="rsx-texte">' + esc(v ? v.texte : '') + '</span>' +
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
    rendreAPublier();
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
      var o = e.target.closest('[data-ouvrir]');
      if (o) {
        var id = o.getAttribute('data-ouvrir');
        ouverte = ouverte === id ? null : id;
        rendreAPublier();
        return;
      }
      var c = e.target.closest('[data-copier]');
      if (c) {
        var vid = c.getAttribute('data-copier');
        var trouve = listeAPublier().find(function (x) { return x.v.id === vid; });
        if (trouve) copier(legendeComplete(trouve.v), c);
        return;
      }
      var b = e.target.closest('[data-act]');
      if (!b || b.id === 'rsx-pause') return;
      var act = b.getAttribute('data-act');
      if (act === 'annuler' && !confirm('Annuler ce post ? Il ne sera pas publié.')) return;
      if (act === 'publie_main' && !confirm('Ce reel est publié sur Instagram ?')) return;
      if (act === 'publie_main') ouverte = null;
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
