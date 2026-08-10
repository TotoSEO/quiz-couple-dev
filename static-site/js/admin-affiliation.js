/**
 * Onglet Affiliation de l'admin, branche sur l'API REST d'Affilae.
 *
 * Le jeton n'est jamais ecrit dans le depot ni dans la page construite : le
 * site est statique et public, tout ce qui est genere au build est lisible par
 * n'importe qui. Il est saisi une fois et garde dans le localStorage de ce
 * navigateur, et un bouton permet de l'effacer.
 *
 * L'API autorise l'origine du site en CORS (elle renvoie l'Origin recu), donc
 * aucun relais serveur n'est necessaire.
 */
(function () {
  'use strict';

  var BASE = 'https://rest.affilae.com';
  var CLE_JETON = 'qc_affilae_token';
  // Les montants de l'API sont en centimes (100 = 1,00 EUR).
  var CENTIMES = 100;

  var etat = {
    jeton: null,
    profils: [],
    profilCourant: null,
    jours: 30,
    partenariats: [],
    mesures: {},
    conversions: [],
    filtre: 'tous',
    tri: { champ: 'gains', asc: false },
    charge: false
  };

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // ── Formatage ──────────────────────────────────────────────────────
  function nombre(n) { return Number(n || 0).toLocaleString('fr-FR'); }
  function euros(centimes) {
    return (Number(centimes || 0) / CENTIMES).toLocaleString('fr-FR', {
      style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2
    });
  }
  function dateCourte(v) {
    // L'API donne tantot un timestamp en secondes, tantot une date ISO.
    var d = typeof v === 'number' ? new Date(v * 1000) : new Date(v);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' });
  }
  function iso(d) { return new Date(d).toISOString().replace(/\.\d{3}Z$/, '.000Z'); }

  // ── Appels API ─────────────────────────────────────────────────────
  function appel(chemin, params) {
    var url = BASE + chemin;
    if (params) {
      var q = Object.keys(params)
        .filter(function (k) { return params[k] !== undefined && params[k] !== null && params[k] !== ''; })
        .map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]); })
        .join('&');
      if (q) url += '?' + q;
    }
    return fetch(url, { headers: { Authorization: 'Bearer ' + etat.jeton, Accept: 'application/json' } })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) {
          if (!r.ok) {
            var msg = j && j.message ? j.message : 'Erreur ' + r.status;
            if (r.status === 401 || r.status === 403) msg = 'Jeton refusé par Affilae.';
            throw new Error(msg);
          }
          return j;
        });
      });
  }

  function appelPost(chemin, corps) {
    return fetch(BASE + chemin, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + etat.jeton, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(corps)
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (!r.ok) throw new Error((j && j.message) || 'Erreur ' + r.status);
        return j;
      });
    });
  }

  // ── Chargement ─────────────────────────────────────────────────────
  function chargerProfils() {
    return appel('/publisher/publishers.me').then(function (d) {
      var data = (d.affiliateProfiles && d.affiliateProfiles.data) || [];
      etat.profils = data.map(function (p) { return { id: p.id, nom: p.name }; });
      if (!etat.profilCourant && etat.profils.length) {
        // On ouvre sur quiz-couple.com quand il est present.
        var qc = etat.profils.filter(function (p) { return /quiz-couple/i.test(p.nom); })[0];
        etat.profilCourant = (qc || etat.profils[0]).id;
      }
      var sel = $('afl-profile');
      sel.innerHTML = etat.profils.map(function (p) {
        return '<option value="' + esc(p.id) + '"' + (p.id === etat.profilCourant ? ' selected' : '') + '>' + esc(p.nom) + '</option>';
      }).join('');
      // Un seul site rattache au jeton : le selecteur n'aurait rien a proposer.
      sel.classList.toggle('hidden', etat.profils.length < 2);
    });
  }

  function bornes() {
    var to = new Date();
    var from = new Date(to.getTime() - etat.jours * 24 * 3600 * 1000);
    from.setHours(0, 0, 0, 0);
    return { from: iso(from), to: iso(to) };
  }

  // L'API est stricte sur « currency » : elle l'exige pour toute mesure qui
  // touche a l'argent, et la refuse pour les mesures de volume. Sans ce tri,
  // la moitie des appels repartait en 400 et le tableau ne s'affichait pas.
  var SANS_DEVISE = { clicks: 1, impressions: 1 };

  // Une mesure a la fois : l'API rend un total et le detail par partenariat.
  function chargerMesure(metrique) {
    var b = bornes();
    return appel('/publisher/partnerships.kpis', {
      from: b.from, to: b.to, metric: metrique, affiliateProfiles: etat.profilCourant,
      currency: SANS_DEVISE[metrique] ? undefined : 'EUR'
    }).then(function (d) {
      var parPart = {};
      (d.partnerships || []).forEach(function (p) { parPart[p.id] = p.value; });
      return { total: d.total || 0, parPart: parPart };
    });
  }

  function chargerTout() {
    if (!etat.profilCourant) return Promise.resolve();
    var bouton = $('afl-refresh');
    bouton.classList.add('tourne');
    erreur('');

    var b = bornes();
    return Promise.all([
      appel('/publisher/partnerships.list', { affiliateProfile: etat.profilCourant, withProgramsDetails: true }),
      chargerMesure('clicks'),
      chargerMesure('conversionsTotal'),
      chargerMesure('commissionsTotal'),
      chargerMesure('EPC'),
      appel('/publisher/conversions.list', {
        affiliateProfile: etat.profilCourant, limit: 12, from: b.from, to: b.to, orderBy: 'date', sort: 'desc'
      }).catch(function () { return { conversions: { data: [] } }; })
    ]).then(function (r) {
      var brut = (r[0].partnerships && r[0].partnerships.data) || [];
      etat.mesures = { clics: r[1], conv: r[2], gains: r[3], epc: r[4] };
      etat.partenariats = brut.map(function (p) {
        var prog = p.program && typeof p.program === 'object' ? p.program : {};
        return {
          id: p.id,
          nom: prog.name || 'Programme',
          url: prog.url || '',
          statut: p.statut || p.status || '',
          trackingId: p.trackingId,
          groupe: (p.group && p.group.name) || '',
          clics: etat.mesures.clics.parPart[p.id] || 0,
          conv: etat.mesures.conv.parPart[p.id] || 0,
          gains: etat.mesures.gains.parPart[p.id] || 0
        };
      });
      // Le nom du groupe de commission n'est pas renvoye par partnerships.list,
      // mais il l'est par les KPIs : on le recupere la.
      etat.conversions = (r[5].conversions && r[5].conversions.data) || [];
      etat.charge = true;
      return appel('/publisher/partnerships.kpis', {
        from: b.from, to: b.to, metric: 'clicks', affiliateProfiles: etat.profilCourant
      }).then(function (d) {
        var groupes = {};
        (d.partnerships || []).forEach(function (p) { if (p.group) groupes[p.id] = p.group.name; });
        etat.partenariats.forEach(function (p) { if (groupes[p.id]) p.groupe = groupes[p.id]; });
      }).catch(function () {});
    }).then(function () {
      rendre();
      $('afl-updated').textContent = 'à ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }).catch(function (e) {
      erreur(e.message || 'Impossible de joindre Affilae.');
      if (/jeton/i.test(e.message || '')) montrerPorte();
    }).then(function () {
      bouton.classList.remove('tourne');
    });
  }

  function erreur(msg) {
    var el = $('afl-error');
    el.textContent = msg || '';
    el.classList.toggle('hidden', !msg);
  }

  // ── Rendu ──────────────────────────────────────────────────────────
  function rendre() {
    var m = etat.mesures;
    $('afl-kpi-clicks').textContent = nombre(m.clics.total);
    $('afl-kpi-conv').textContent = nombre(m.conv.total);
    $('afl-kpi-commissions').textContent = euros(m.gains.total);
    // L'EPC est un montant par clic. La documentation annonce tous les montants
    // en centimes ; impossible de le confirmer tant que le compte n'a aucune
    // conversion, a revoir a la premiere vente.
    $('afl-kpi-epc').textContent = euros(m.epc.total);
    rendrePartenariats();
    rendreGenerateur();
    rendreConversions();
  }

  function libelleStatut(s) {
    if (s === 'active') return { txt: 'Accepté', cls: 'active' };
    if (s === 'pending') return { txt: 'En attente', cls: 'pending' };
    if (s === 'blocked') return { txt: 'Bloqué', cls: 'autre' };
    if (s === 'cancelled') return { txt: 'Annulé', cls: 'autre' };
    return { txt: s || 'Inconnu', cls: 'autre' };
  }

  function rendrePartenariats() {
    var liste = etat.partenariats.filter(function (p) {
      return etat.filtre === 'tous' || p.statut === etat.filtre;
    });
    var t = etat.tri;
    liste.sort(function (a, b) {
      var va = t.champ === 'nom' ? a.nom.toLowerCase() : a[t.champ];
      var vb = t.champ === 'nom' ? b.nom.toLowerCase() : b[t.champ];
      if (va < vb) return t.asc ? -1 : 1;
      if (va > vb) return t.asc ? 1 : -1;
      return 0;
    });

    var actifs = etat.partenariats.filter(function (p) { return p.statut === 'active'; }).length;
    $('afl-part-sub').textContent = etat.partenariats.length + ' programme' +
      (etat.partenariats.length > 1 ? 's' : '') + ', ' + actifs + ' accepté' + (actifs > 1 ? 's' : '');

    var corps = $('afl-part-body');
    if (!liste.length) {
      corps.innerHTML = '<tr><td colspan="6" class="afl-vide">Aucun programme dans ce filtre.</td></tr>';
      return;
    }
    corps.innerHTML = liste.map(function (p) {
      var s = libelleStatut(p.statut);
      return '<tr>' +
        '<td><span class="afl-prog">' + esc(p.nom) + '</span></td>' +
        '<td><span class="afl-statut afl-statut--' + s.cls + '">' + esc(s.txt) + '</span></td>' +
        '<td class="afl-hide-sm"><span class="afl-remu">' + esc(p.groupe || '-') + '</span></td>' +
        '<td class="afl-num">' + nombre(p.clics) + '</td>' +
        '<td class="afl-num">' + nombre(p.conv) + '</td>' +
        '<td class="afl-num">' + euros(p.gains) + '</td>' +
        '</tr>';
    }).join('');

    document.querySelectorAll('.afl-sort').forEach(function (th) {
      th.classList.toggle('tri', th.dataset.tri === t.champ);
      th.classList.toggle('asc', th.dataset.tri === t.champ && t.asc);
    });
  }

  function rendreGenerateur() {
    var sel = $('afl-gen-part');
    var utilisables = etat.partenariats.filter(function (p) { return p.statut === 'active'; });
    if (!utilisables.length) {
      sel.innerHTML = '<option value="">Aucun partenariat accepté pour le moment</option>';
      sel.disabled = true;
      $('afl-gen-btn').disabled = true;
      return;
    }
    sel.disabled = false;
    $('afl-gen-btn').disabled = false;
    var choisi = sel.value;
    sel.innerHTML = utilisables.map(function (p) {
      return '<option value="' + esc(p.id) + '"' + (p.id === choisi ? ' selected' : '') + '>' + esc(p.nom) + '</option>';
    }).join('');
  }

  function rendreConversions() {
    var el = $('afl-conv-list');
    if (!etat.conversions.length) {
      el.innerHTML = '<p class="afl-vide">Aucune conversion sur la période. C\'est normal tant qu\'aucun lien n\'est en ligne.</p>';
      $('afl-conv-sub').innerHTML = '&nbsp;';
      return;
    }
    $('afl-conv-sub').textContent = etat.conversions.length + ' sur la période';
    el.innerHTML = etat.conversions.map(function (c) {
      var prog = (c.program && c.program.name) || (c.partnership && c.partnership.name) || 'Programme';
      var sous = [dateCourte(c.date || c.createdAt), c.subId ? 'depuis « ' + c.subId + ' »' : '', c.status || '']
        .filter(Boolean).join(' &middot; ');
      return '<div class="afl-conv">' +
        '<div><div class="afl-conv-nom">' + esc(prog) + '</div><div class="afl-conv-meta">' + sous + '</div></div>' +
        '<div class="afl-conv-gain">' + euros(c.commission || c.amount || 0) + '</div>' +
        '</div>';
    }).join('');
  }

  // ── Generateur de liens ────────────────────────────────────────────
  function genererLien() {
    var partId = $('afl-gen-part').value;
    if (!partId) return;
    var destination = $('afl-gen-url').value.trim();
    var sub = $('afl-gen-sub').value.trim();
    var note = $('afl-gen-note');
    var sortie = $('afl-gen-out');

    var charge = { partnershipId: partId };
    if (sub) charge.subId = sub;

    appelPost('/common/tracking/url.build', { urls: [charge] }).then(function (r) {
      var lien = Array.isArray(r) ? r[0] : (r && r.urls && r.urls[0]);
      if (!lien) throw new Error('Affilae n\'a pas renvoyé de lien.');

      // Affilae ne construit le lien que vers l'accueil de l'annonceur. Pour
      // pointer une page precise on reporte ses parametres de suivi dessus,
      // ce que le format « parametre » de leur tracking permet.
      note.classList.add('hidden');
      if (destination) {
        try {
          var src = new URL(lien);
          var cible = new URL(destination);
          src.searchParams.forEach(function (v, k) { cible.searchParams.set(k, v); });
          if (cible.hostname.replace(/^www\./, '') !== src.hostname.replace(/^www\./, '')) {
            note.textContent = 'Attention : la page de destination n\'est pas sur le domaine du programme (' +
              src.hostname + '). Le suivi ne fonctionnera probablement pas.';
            note.classList.remove('hidden');
          }
          lien = cible.toString();
        } catch (e) {
          note.textContent = 'L\'adresse de destination n\'est pas valide, le lien renvoie vers l\'accueil de l\'annonceur.';
          note.classList.remove('hidden');
        }
      }
      $('afl-gen-link').textContent = lien;
      sortie.classList.remove('hidden');
    }).catch(function (e) {
      erreur(e.message || 'Génération impossible.');
    });
  }

  function copierLien() {
    var txt = $('afl-gen-link').textContent;
    var bouton = $('afl-gen-copy');
    var fini = function () {
      bouton.textContent = 'Copié';
      setTimeout(function () { bouton.textContent = 'Copier'; }, 1600);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(fini).catch(function () {});
    } else {
      var z = document.createElement('textarea');
      z.value = txt; document.body.appendChild(z); z.select();
      try { document.execCommand('copy'); fini(); } catch (e) {}
      document.body.removeChild(z);
    }
  }

  // ── Porte d'entree ─────────────────────────────────────────────────
  function montrerPorte() {
    $('afl-gate').classList.remove('hidden');
    $('afl-board').classList.add('hidden');
  }
  function montrerTableau() {
    $('afl-gate').classList.add('hidden');
    $('afl-board').classList.remove('hidden');
  }

  function connecter() {
    var val = $('afl-token-input').value.trim();
    var err = $('afl-gate-error');
    if (!val) { err.textContent = 'Collez votre jeton pour continuer.'; err.classList.remove('hidden'); return; }
    err.classList.add('hidden');
    etat.jeton = val;
    appel('/publisher/publishers.me').then(function () {
      try { localStorage.setItem(CLE_JETON, val); } catch (e) {}
      $('afl-token-input').value = '';
      montrerTableau();
      return chargerProfils().then(chargerTout);
    }).catch(function (e) {
      etat.jeton = null;
      err.textContent = e.message || 'Jeton refusé.';
      err.classList.remove('hidden');
    });
  }

  function oublier() {
    if (!window.confirm('Effacer le jeton Affilae de ce navigateur ?')) return;
    try { localStorage.removeItem(CLE_JETON); } catch (e) {}
    etat.jeton = null;
    etat.charge = false;
    montrerPorte();
  }

  // ── Branchements ───────────────────────────────────────────────────
  function brancher() {
    $('afl-token-save').addEventListener('click', connecter);
    $('afl-token-input').addEventListener('keydown', function (e) { if (e.key === 'Enter') connecter(); });
    $('afl-forget').addEventListener('click', oublier);
    $('afl-refresh').addEventListener('click', function () { chargerTout(); });

    $('afl-profile').addEventListener('change', function () {
      etat.profilCourant = this.value;
      chargerTout();
    });

    document.querySelectorAll('.afl-range-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        document.querySelectorAll('.afl-range-btn').forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        etat.jours = parseInt(b.dataset.days, 10) || 30;
        chargerTout();
      });
    });

    document.querySelectorAll('.afl-chip').forEach(function (c) {
      c.addEventListener('click', function () {
        document.querySelectorAll('.afl-chip').forEach(function (x) { x.classList.remove('active'); });
        c.classList.add('active');
        etat.filtre = c.dataset.statut;
        rendrePartenariats();
      });
    });

    document.querySelectorAll('.afl-sort').forEach(function (th) {
      th.addEventListener('click', function () {
        var champ = th.dataset.tri;
        if (etat.tri.champ === champ) etat.tri.asc = !etat.tri.asc;
        else { etat.tri.champ = champ; etat.tri.asc = champ === 'nom'; }
        rendrePartenariats();
      });
    });

    $('afl-gen-btn').addEventListener('click', genererLien);
    $('afl-gen-copy').addEventListener('click', copierLien);
  }

  // Appele par admin.js quand l'onglet devient visible.
  function ouvrir() {
    if (!etat.jeton) {
      try { etat.jeton = localStorage.getItem(CLE_JETON); } catch (e) {}
    }
    if (!etat.jeton) { montrerPorte(); return; }
    montrerTableau();
    if (!etat.charge) chargerProfils().then(chargerTout).catch(function (e) {
      erreur(e.message || 'Impossible de joindre Affilae.');
      montrerPorte();
    });
  }

  function init() {
    if (!$('admin-affiliation-tab')) return;
    brancher();
    window.AdminAffiliation = { ouvrir: ouvrir };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
