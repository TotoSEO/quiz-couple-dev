/**
 * Salon : le mode a distance des tests et jeux a deux.
 *
 * Par defaut, tout se joue sur un seul telephone qu'on se passe. Ce module
 * ajoute l'autre facon : une personne cree la partie, l'autre la rejoint
 * avec un code, un lien ou un QR code, et chacun repond sur son propre
 * ecran. Les moteurs ne changent pas de regles : ils recoivent les reponses
 * de l'autre joueur au lieu de les saisir eux-memes.
 *
 * Il n'y a aucune base de donnees derriere. Un salon, c'est un canal de
 * diffusion Supabase Realtime nomme d'apres le code : il existe tant que
 * quelqu'un y est abonne, et disparait de lui-meme quand les deux ont ferme
 * la page. Rien a nettoyer, rien qui traine. La presence (qui est la, avec
 * quel role) sert a savoir si quelqu'un attend bien derriere un code, si la
 * partie est deja complete, et si le partenaire a perdu la connexion.
 *
 * Ce fichier n'est charge que si quelqu'un active le mode a distance ou
 * arrive avec un code dans l'adresse : la page ordinaire ne paie rien.
 */
(function () {
  'use strict';
  var QE = window.QuizEngine;
  if (!QE) return;
  var el = QE.el, esc = QE.esc, tg = QE.tg;

  var VERSION = 1;
  var PARAM = 'salon';
  // Ni 0, ni 1, ni I, ni O : un code se dicte a voix haute et se lit sur un
  // ecran d'en face sans hesitation. 32 symboles sur six positions font un
  // milliard de codes : personne ne tombe sur une partie par hasard.
  var ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  var LONGUEUR = 6;
  var DELAI_PRESENCE = 2500;   // le temps que la presence se synchronise apres l'abonnement
  var DELAI_DEPART = 12000;    // le temps qu'a le createur pour repondre a « bonjour »
  var DELAI_SCRIPT = 15000;

  function s(cle, repli) { return tg('salon.' + cle, repli); }
  function avec(texte, vars) {
    return String(texte).replace(/\{\{(\w+)\}\}/g, function (_, k) { return vars[k] !== undefined ? vars[k] : ''; });
  }

  // ── Codes et adresses ─────────────────────────────────────────────────
  function codeAleatoire() {
    var code = '', i;
    if (window.crypto && window.crypto.getRandomValues) {
      var tab = new Uint8Array(LONGUEUR);
      window.crypto.getRandomValues(tab);
      for (i = 0; i < LONGUEUR; i++) code += ALPHABET[tab[i] % ALPHABET.length];
    } else {
      for (i = 0; i < LONGUEUR; i++) code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    }
    return code;
  }

  // Ce qu'on tape a la main est genereux : minuscules, espaces, tirets, et
  // les confusions habituelles (0 lu pour O, 1 pour I) sont rattrapees.
  function normaliserCode(brut) {
    var c = String(brut || '').toUpperCase().replace(/[^A-Z0-9]/g, '')
      .replace(/0/g, 'O').replace(/1/g, 'I');
    // O et I n'existent pas dans l'alphabet : on les ramene aux voisins lisibles.
    c = c.replace(/O/g, 'Q').replace(/I/g, 'J');
    return c;
  }
  function codeValide(code) {
    if (!code || code.length !== LONGUEUR) return false;
    for (var i = 0; i < code.length; i++) if (ALPHABET.indexOf(code[i]) === -1) return false;
    return true;
  }

  function codeDansUrl() {
    try {
      var p = new URLSearchParams(location.search);
      var c = p.get(PARAM);
      if (!c) return null;
      c = normaliserCode(c);
      return codeValide(c) ? c : null;
    } catch (e) { return null; }
  }

  // Une fois la partie lancee, le code sort de l'adresse : un rechargement ou
  // un partage du resultat ne doit pas renvoyer vers un salon qui n'existe
  // plus. Les autres parametres restent tels quels.
  function retirerCodeDeUrl() {
    try {
      var recherche = location.search || '';
      if (!recherche) return;
      var restants = recherche.slice(1).split('&').filter(function (m) {
        return m && m.split('=')[0] !== PARAM;
      });
      var url = location.pathname + (restants.length ? '?' + restants.join('&') : '') + location.hash;
      history.replaceState(history.state, '', url);
    } catch (e) {}
  }

  function urlDeRejointe(code) {
    return location.origin + location.pathname + '?' + PARAM + '=' + code;
  }

  // ── Chargement des scripts tiers, seulement ici ───────────────────────
  var scriptsEnCours = {};
  function chargerScript(url, cb) {
    if (scriptsEnCours[url]) { scriptsEnCours[url].push(cb); return; }
    scriptsEnCours[url] = [cb];
    var sc = document.createElement('script');
    sc.src = url; sc.async = true;
    var fini = false;
    function termine(err) {
      if (fini) return; fini = true;
      var liste = scriptsEnCours[url] || []; delete scriptsEnCours[url];
      liste.forEach(function (f) { try { f(err || null); } catch (e) {} });
    }
    sc.onload = function () { termine(null); };
    sc.onerror = function () { termine(new Error('script')); };
    setTimeout(function () { termine(new Error('timeout')); }, DELAI_SCRIPT);
    document.head.appendChild(sc);
  }
  function avecVersion(chemin) {
    return chemin + (window.__QCV ? '?v=' + window.__QCV : '');
  }

  // Le client Supabase vient du CDN, comme pour le quiz ado, avec un second
  // CDN en secours. Il ne pese que sur ceux qui jouent a distance.
  var CDN_SUPABASE = [
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js',
    'https://unpkg.com/@supabase/supabase-js@2/dist/umd/supabase.min.js'
  ];
  var clientSupabase = null;
  function obtenirTransport(cb) {
    // Doublure de test : elle imite l'API du canal sans reseau.
    if (window.__QCSalonTransport) { cb(null, window.__QCSalonTransport); return; }
    if (clientSupabase) { cb(null, adaptateurSupabase(clientSupabase)); return; }
    function creer() {
      try {
        clientSupabase = window.supabase.createClient(QE.SUPABASE_URL, QE.SUPABASE_KEY, {
          realtime: { params: { eventsPerSecond: 5 } }
        });
        cb(null, adaptateurSupabase(clientSupabase));
      } catch (e) { cb(e); }
    }
    if (window.supabase && window.supabase.createClient) { creer(); return; }
    chargerScript(CDN_SUPABASE[0], function (err) {
      if (!err && window.supabase) { creer(); return; }
      chargerScript(CDN_SUPABASE[1], function (err2) {
        if (!err2 && window.supabase) creer(); else cb(err2 || err || new Error('supabase'));
      });
    });
  }

  // Le transport ne connait que cinq gestes : ecouter les messages, ecouter
  // la presence, envoyer, s'annoncer present, fermer. Tout le reste est ici.
  function adaptateurSupabase(sb) {
    return {
      canal: function (nom, clePresence) {
        var ch = sb.channel(nom, { config: { broadcast: { self: false }, presence: { key: clePresence } } });
        return {
          surMessage: function (fn) { ch.on('broadcast', { event: 'qc' }, function (m) { fn(m && m.payload); }); },
          surPresence: function (fn) {
            ch.on('presence', { event: 'sync' }, function () { fn('sync'); });
            ch.on('presence', { event: 'join' }, function () { fn('join'); });
            ch.on('presence', { event: 'leave' }, function () { fn('leave'); });
          },
          envoyer: function (payload) { try { ch.send({ type: 'broadcast', event: 'qc', payload: payload }); } catch (e) {} },
          annoncer: function (meta) { try { ch.track(meta); } catch (e) {} },
          presence: function () { try { return ch.presenceState() || {}; } catch (e) { return {}; } },
          abonner: function (fn) { ch.subscribe(function (statut) { fn(statut); }); },
          fermer: function () { try { sb.removeChannel(ch); } catch (e) { try { ch.unsubscribe(); } catch (e2) {} } }
        };
      }
    };
  }

  // ── Le salon ──────────────────────────────────────────────────────────
  //   role      : 'c' (a cree la partie) ou 'j' (l'a rejointe)
  //   quizType  : la page, pour que deux salons de deux tests ne se croisent pas
  //   moi       : { nom, genre }
  function Salon(o) {
    this.role = o.role;
    this.code = o.code;
    this.quizType = o.quizType;
    this.moi = { nom: coupe(o.moi && o.moi.nom, 20), genre: genreSur(o.moi && o.moi.genre) };
    this.partenaire = null;
    this.demarre = false;
    this.ferme = false;
    this.connecte = false;
    this.partenairePresent = false;
    this.ecouteurs = {};
    this.canal = null;
    this.bandeauEl = null;
    this.container = o.container || null;
  }

  function coupe(v, n) { return String(v || '').replace(/\s+/g, ' ').trim().slice(0, n); }
  function genreSur(g) { return g === 'homme' || g === 'femme' ? g : null; }

  Salon.prototype.on = function (type, fn) {
    (this.ecouteurs[type] = this.ecouteurs[type] || []).push(fn);
    return this;
  };
  Salon.prototype.emettre = function (type, data) {
    (this.ecouteurs[type] || []).slice().forEach(function (fn) { try { fn(data); } catch (e) {} });
  };
  Salon.prototype.autreRole = function () { return this.role === 'c' ? 'j' : 'c'; };

  Salon.prototype.envoyer = function (t, data) {
    if (!this.canal || this.ferme) return;
    var p = { v: VERSION, de: this.role, t: t };
    if (data) for (var k in data) if (Object.prototype.hasOwnProperty.call(data, k)) p[k] = data[k];
    this.canal.envoyer(p);
  };

  // Tout ce qui arrive vient d'un inconnu jusqu'a preuve du contraire : la
  // version, l'expediteur et le type sont controles, et chaque champ utilise
  // est rebornee avant d'atteindre un moteur.
  Salon.prototype.recevoir = function (p) {
    if (!p || typeof p !== 'object' || p.v !== VERSION) return;
    if (p.de !== this.autreRole()) return;
    if (typeof p.t !== 'string' || p.t.length > 20) return;
    var self = this;
    switch (p.t) {
      case 'bonjour':
        if (this.role !== 'c') return;
        if (this.demarre) { this.envoyer('refus', { pour: 'complet' }); return; }
        this.partenaire = { nom: coupe(p.nom, 20) || tg('playerSetup.player2', 'Joueur 2'), genre: genreSur(p.genre) };
        this.marquerDemarre();
        this.envoyer('depart', {
          quizType: this.quizType, modeId: this.modeId || null, ids: this.ids || [],
          createur: this.moi
        });
        retirerCodeDeUrl();
        this.emettre('partenaire', this.partenaire);
        break;
      case 'depart':
        if (this.role !== 'j' || this.demarre) return;
        if (p.quizType !== this.quizType) return;
        if (!Array.isArray(p.ids) || p.ids.length > 300) return;
        var ids = [];
        for (var i = 0; i < p.ids.length; i++) {
          var n = Number(p.ids[i]);
          if (isFinite(n) && n > 0 && n < 100000) ids.push(n);
        }
        this.partenaire = {
          nom: coupe(p.createur && p.createur.nom, 20) || tg('playerSetup.player1', 'Joueur 1'),
          genre: genreSur(p.createur && p.createur.genre)
        };
        this.marquerDemarre();
        if (this.minuteurDepart) { clearTimeout(this.minuteurDepart); this.minuteurDepart = null; }
        retirerCodeDeUrl();
        this.emettre('depart', { modeId: typeof p.modeId === 'string' ? p.modeId.slice(0, 30) : null, ids: ids, createur: this.partenaire });
        break;
      case 'refus':
        if (this.role !== 'j' || this.demarre) return;
        this.echec('complete');
        break;
      case 'reponses':
        if (!this.demarre) return;
        if (!Array.isArray(p.a) || p.a.length > 300) return;
        var a = [];
        for (var j = 0; j < p.a.length; j++) {
          var v = p.a[j];
          a.push(v === null || v === undefined ? null : (typeof v === 'number' ? v : String(v).slice(0, 12)));
        }
        this.emettre('reponses', { a: a });
        break;
      case 'pret':
        // « J'ai appuye sur suivant jusqu'a la question n » : un simple rang,
        // idempotent, qu'on peut renvoyer autant de fois qu'on veut.
        if (!this.demarre) return;
        var q = Number(p.q);
        if (!isFinite(q) || q < 0 || q > 300) return;
        this.emettre('pret', { q: Math.floor(q) });
        break;
      case 'annule':
        if (!this.demarre) return;
        this.emettre('annule', { par: coupe(p.par, 20) || (this.partenaire && this.partenaire.nom) || '' });
        this.fermer();
        break;
      case 'etat':
        // Un moteur peut partager un etat libre (tour, manche...) : il est
        // transmis tel quel mais borne en taille, le moteur le valide.
        if (!this.demarre) return;
        try { if (JSON.stringify(p.d).length > 4000) return; } catch (e) { return; }
        this.emettre('etat', p.d);
        break;
      default:
        break;
    }
  };

  Salon.prototype.surPresence = function () {
    var etat = this.canal ? this.canal.presence() : {};
    var autre = this.autreRole();
    var present = !!(etat[autre] && etat[autre].length);
    if (present && !this.partenairePresent) {
      this.partenairePresent = true;
      if (this.demarre) this.emettre('partenaireRevenu', this.partenaire);
    } else if (!present && this.partenairePresent) {
      this.partenairePresent = false;
      if (this.demarre) this.emettre('partenaireParti', this.partenaire);
    }
    this.emettre('presence', etat);
  };

  Salon.prototype.ouvrir = function (cb) {
    var self = this;
    obtenirTransport(function (err, transport) {
      if (err || !transport) { cb(err || new Error('transport')); return; }
      var nom = 'qc-' + String(self.quizType).replace(/[^a-z0-9-]/gi, '') + '-' + self.code;
      self.canal = transport.canal(nom, self.role);
      self.canal.surMessage(function (p) { self.recevoir(p); });
      self.canal.surPresence(function () { self.surPresence(); });
      var premier = true;
      self.canal.abonner(function (statut) {
        if (statut === 'SUBSCRIBED') {
          self.connecte = true;
          self.canal.annoncer({ role: self.role, nom: self.moi.nom, v: VERSION });
          if (premier) { premier = false; cb(null); }
          else self.emettre('reconnecte');
        } else if (statut === 'CHANNEL_ERROR' || statut === 'TIMED_OUT') {
          self.connecte = false;
          if (premier) { premier = false; cb(new Error(statut)); }
          else self.emettre('coupure');
        } else if (statut === 'CLOSED') {
          self.connecte = false;
        }
      });
    });
  };

  // Le chargeur et le bandeau ont besoin de savoir s'il y a une partie en
  // cours pour demander confirmation avant de la casser.
  Salon.prototype.marquerDemarre = function () {
    this.demarre = true;
    window.QCSalon.actif = this;
    this.mesure('depart');
  };

  // Une ligne de mesure par telephone et par etape : c'est quiz-extras.js qui
  // l'envoie, avec le slug et la langue qu'il connait deja.
  Salon.prototype.mesure = function (etape) {
    try {
      document.dispatchEvent(new CustomEvent('qc:salon', { detail: { etape: etape, role: this.role, code: this.code } }));
    } catch (e) {}
  };

  // Annuler pour les deux : l'autre recoit le message et voit qui a annule.
  Salon.prototype.annuler = function () {
    if (this.ferme) return;
    this.envoyer('annule', { par: this.moi.nom });
    this.fermer();
  };

  // La partie est allee au bout : on le note, puis le canal tombe un peu
  // plus tard, le temps que le partenaire recoive les dernieres reponses.
  Salon.prototype.terminer = function () {
    if (this.termineDeja) return;
    this.termineDeja = true;
    this.mesure('fin');
    this.fermerApres(4000);
  };

  Salon.prototype.fermer = function () {
    if (this.ferme) return;
    this.ferme = true;
    if (window.QCSalon && window.QCSalon.actif === this) window.QCSalon.actif = null;
    if (this.minuteurDepart) { clearTimeout(this.minuteurDepart); this.minuteurDepart = null; }
    if (this.canal) { try { this.canal.fermer(); } catch (e) {} this.canal = null; }
    if (this.bandeauEl && this.bandeauEl.parentNode) this.bandeauEl.parentNode.removeChild(this.bandeauEl);
    this.bandeauEl = null;
  };

  // Le salon se ferme un peu apres le resultat : le partenaire lent recoit
  // encore les dernieres reponses, puis le canal tombe et le code meurt.
  Salon.prototype.fermerApres = function (ms) {
    var self = this;
    setTimeout(function () { self.fermer(); }, ms || 4000);
  };

  Salon.prototype.echec = function (motif) {
    this.emettre('echec', motif);
  };

  // ── Le bandeau, hors du conteneur du moteur ───────────────────────────
  // Les moteurs vident leur conteneur a chaque ecran : le bandeau vit a cote,
  // au-dessus, et survit a tous les redessins.
  Salon.prototype.bandeau = function (texte, ton) {
    if (!this.container || !this.container.parentNode) return;
    if (!this.bandeauEl) {
      this.bandeauEl = el('div', 'salon-bandeau');
      this.bandeauEl.setAttribute('role', 'status');
      this.bandeauEl.setAttribute('aria-live', 'polite');
      this.container.parentNode.insertBefore(this.bandeauEl, this.container);
    }
    this.bandeauEl.className = 'salon-bandeau' + (ton ? ' salon-bandeau--' + ton : '');
    this.bandeauEl.innerHTML = '<span class="salon-bandeau-point" aria-hidden="true"></span><span class="salon-bandeau-texte">' + esc(texte) + '</span>';
    // Une sortie toujours visible, qui demande confirmation : quitter une
    // partie a distance, c'est l'annuler pour deux personnes.
    if (!this.ferme && this.demarre) {
      var self = this;
      var quitter = el('button', 'salon-bandeau-quitter', esc(s('quitter', 'Quitter la partie')));
      quitter.type = 'button';
      quitter.addEventListener('click', function () {
        confirmerAnnulation(function () { self.annuler(); location.reload(); });
      });
      this.bandeauEl.appendChild(quitter);
    }
  };

  // La boite de confirmation, la meme partout ou une partie peut se casser.
  function confirmerAnnulation(onOui, onNon) {
    var voile = el('div', 'salon-voile');
    var boite = el('div', 'salon-modale');
    boite.setAttribute('role', 'dialog'); boite.setAttribute('aria-modal', 'true');
    boite.setAttribute('aria-labelledby', 'salon-modale-texte');
    var texte = el('p', 'salon-modale-texte', esc(s('annulerTexte', 'Cette interaction est sur le point d\'annuler la partie. Souhaitez-vous continuer ?')));
    texte.id = 'salon-modale-texte';
    boite.appendChild(texte);
    var actions = el('div', 'salon-modale-actions');
    var non = el('button', 'btn btn-cta salon-modale-non', esc(s('annulerNon', 'Non, continuer')));
    var oui = el('button', 'btn btn-outline salon-modale-oui', esc(s('annulerOui', 'Oui, annuler la partie')));
    non.type = 'button'; oui.type = 'button';
    function fermerBoite() { if (voile.parentNode) voile.parentNode.removeChild(voile); document.removeEventListener('keydown', surTouche); }
    function surTouche(e) { if (e.key === 'Escape') { fermerBoite(); if (onNon) onNon(); } }
    non.addEventListener('click', function () { fermerBoite(); if (onNon) onNon(); });
    oui.addEventListener('click', function () { fermerBoite(); onOui(); });
    voile.addEventListener('click', function (e) { if (e.target === voile) { fermerBoite(); if (onNon) onNon(); } });
    document.addEventListener('keydown', surTouche);
    actions.appendChild(non); actions.appendChild(oui);
    boite.appendChild(actions);
    voile.appendChild(boite);
    document.body.appendChild(voile);
    setTimeout(function () { try { non.focus(); } catch (e) {} }, 30);
  }

  // L'ecran de celui qui apprend que l'autre a annule.
  function ecranAnnulee(container, par, onRetour) {
    container.innerHTML = '';
    var wrap = el('div', 'quiz-engine quiz-setup-screen animate-fade-in salon-ecran');
    wrap.appendChild(el('div', 'quiz-setup-icon quiz-setup-icon--emoji mx-auto mb-6', '🙁'));
    wrap.appendChild(titre(avec(s('annulee', 'La partie a été annulée par {{nom}}.'), { nom: par || '' })));
    var retour = el('button', 'btn btn-cta', esc(s('retourTest', 'Revenir au test')));
    retour.type = 'button';
    retour.addEventListener('click', function () { if (onRetour) onRetour(); else location.reload(); });
    wrap.appendChild(retour);
    container.appendChild(wrap);
  }

  // Les messages de presence que tout moteur voudra afficher pareil.
  Salon.prototype.brancherBandeau = function () {
    var self = this;
    var nom = function () { return (self.partenaire && self.partenaire.nom) || ''; };
    this.bandeau(avec(s('avecPartenaire', 'Vous jouez à distance avec {{nom}}'), { nom: nom() }), 'ok');
    this.on('annule', function () { self.bandeau(avec(s('annulee', 'La partie a été annulée par {{nom}}.'), { nom: nom() }), 'alerte'); });
    this.on('partenaireParti', function () {
      self.bandeau(avec(s('parti', '{{nom}} s\'est déconnecté(e). On attend son retour…'), { nom: nom() }), 'alerte');
    });
    this.on('partenaireRevenu', function () {
      self.bandeau(avec(s('revenu', '{{nom}} est de retour !'), { nom: nom() }), 'ok');
      // Chacun renvoie ou il en est : celui qui revient rattrape tout.
      self.emettre('resync');
    });
    this.on('reconnecte', function () { self.emettre('resync'); });
    this.on('coupure', function () {
      self.bandeau(s('erreurReseau', 'Impossible de se connecter. Vérifiez votre connexion et réessayez.'), 'alerte');
    });
  };

  // ── Les ecrans ─────────────────────────────────────────────────────────
  function titre(texte) { return el('h2', 'text-2xl font-bold mb-3 text-center', esc(texte)); }
  function para(texte) { return el('p', 'text-muted-foreground mb-6 text-center', esc(texte)); }
  function attenteVisuelle(texte) {
    var w = el('p', 'salon-attente');
    w.innerHTML = '<span class="salon-spinner" aria-hidden="true"></span> ' + esc(texte);
    return w;
  }

  // La carte « moi » est celle du moteur commun : le formulaire de celui qui
  // rejoint ressemble ainsi a l'ecran des prenoms qu'a vu le createur.
  var carteMoi = QE.carteMoi;

  // L'ecran d'attente du createur : le code en grand, le QR code, le lien.
  function ecranAttente(salon, opts) {
    var container = salon.container;
    container.innerHTML = '';
    var wrap = el('div', 'quiz-engine quiz-setup-screen animate-fade-in salon-ecran');
    var badge = el('div', 'quiz-setup-icon quiz-setup-icon--emoji mx-auto mb-6', '📲');
    wrap.appendChild(badge);
    wrap.appendChild(titre(s('creeeTitre', 'Partie créée !')));
    wrap.appendChild(para(s('creeeDesc', '')));

    var code = el('div', 'salon-code', esc(salon.code));
    code.setAttribute('aria-label', s('codeLabel', 'Code de la partie') + ' : ' + salon.code.split('').join(' '));
    wrap.appendChild(code);

    var url = urlDeRejointe(salon.code);
    var qr = el('div', 'salon-qr');
    qr.setAttribute('aria-hidden', 'true');
    wrap.appendChild(qr);
    chargerScript(avecVersion('/js/vendor/qrcode.js'), function (err) {
      if (err || typeof window.qrcode !== 'function') { qr.remove(); return; }
      try {
        var q = window.qrcode(0, 'M');
        q.addData(url); q.make();
        qr.innerHTML = q.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
      } catch (e) { qr.remove(); }
    });

    var actions = el('div', 'salon-actions');
    var copier = el('button', 'btn btn-cta btn-gradient', esc(s('copierLien', 'Copier le lien')));
    copier.type = 'button';
    copier.addEventListener('click', function () {
      var ok = function () { copier.textContent = s('lienCopie', 'Lien copié !'); setTimeout(function () { copier.textContent = s('copierLien', 'Copier le lien'); }, 2200); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(ok, function () { copieDeSecours(url); ok(); });
      else { copieDeSecours(url); ok(); }
    });
    actions.appendChild(copier);
    if (navigator.share) {
      var partager = el('button', 'btn btn-outline', esc(s('envoyerLien', 'Envoyer le lien')));
      partager.type = 'button';
      partager.addEventListener('click', function () {
        navigator.share({ title: document.title, text: s('creeeDesc', ''), url: url }).catch(function () {});
      });
      actions.appendChild(partager);
    }
    wrap.appendChild(actions);
    wrap.appendChild(attenteVisuelle(s('enAttente', 'En attente de votre partenaire…')));

    var annuler = el('button', 'btn btn-ghost salon-annuler', esc(s('annuler', 'Annuler')));
    annuler.type = 'button';
    annuler.addEventListener('click', function () { salon.fermer(); if (opts.onRetour) opts.onRetour(); });
    wrap.appendChild(annuler);
    container.appendChild(wrap);
  }

  function copieDeSecours(texte) {
    try {
      var ta = document.createElement('textarea');
      ta.value = texte; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.focus(); ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    } catch (e) {}
  }

  function ecranErreur(container, message, opts) {
    container.innerHTML = '';
    var wrap = el('div', 'quiz-engine quiz-setup-screen animate-fade-in salon-ecran');
    wrap.appendChild(el('div', 'quiz-setup-icon quiz-setup-icon--emoji mx-auto mb-6', '😶'));
    wrap.appendChild(titre(s('rejoindreTitre', 'Rejoindre une partie')));
    wrap.appendChild(el('p', 'salon-erreur', esc(message)));
    var retour = el('button', 'btn btn-cta', esc(opts && opts.libelle || s('annuler', 'Annuler')));
    retour.type = 'button';
    retour.addEventListener('click', function () { if (opts && opts.onRetour) opts.onRetour(); });
    wrap.appendChild(retour);
    container.appendChild(wrap);
  }

  function messageErreur(motif) {
    if (motif === 'introuvable') return s('introuvable', '');
    if (motif === 'complete') return s('complete', '');
    if (motif === 'code') return s('codeInvalide', '');
    return s('erreurReseau', '');
  }

  // ── Les deux parcours ─────────────────────────────────────────────────
  // Creer : on connait deja le tirage des questions, on l'enverra a l'autre.
  function creer(o) {
    var salon = new Salon({ role: 'c', code: codeAleatoire(), quizType: o.quizType, moi: o.moi, container: o.container });
    salon.modeId = o.modeId || null;
    salon.ids = (o.ids || []).slice(0, 300);
    o.container.innerHTML = '';
    var chargement = el('div', 'quiz-engine quiz-setup-screen animate-fade-in salon-ecran');
    chargement.appendChild(attenteVisuelle(s('connexion', 'Connexion…')));
    o.container.appendChild(chargement);
    salon.on('partenaire', function (partenaire) {
      if (o.onPartenaire) o.onPartenaire(partenaire, salon);
    });
    salon.ouvrir(function (err) {
      if (err) { ecranErreur(o.container, messageErreur('reseau'), { onRetour: function () { salon.fermer(); if (o.onRetour) o.onRetour(); } }); return; }
      ecranAttente(salon, { onRetour: o.onRetour });
    });
    return salon;
  }

  // Rejoindre : on se connecte, on verifie qu'un createur attend bien, et on
  // dit bonjour. Le depart arrive avec le tirage et le prenom d'en face.
  function rejoindre(o) {
    var code = normaliserCode(o.code);
    if (!codeValide(code)) { if (o.onErreur) o.onErreur('code'); return null; }
    var salon = new Salon({ role: 'j', code: code, quizType: o.quizType, moi: o.moi, container: o.container });
    o.container.innerHTML = '';
    var chargement = el('div', 'quiz-engine quiz-setup-screen animate-fade-in salon-ecran');
    chargement.appendChild(attenteVisuelle(s('connexion', 'Connexion…')));
    o.container.appendChild(chargement);

    var termine = false;
    function echoue(motif) {
      if (termine) return; termine = true;
      salon.fermer();
      if (o.onErreur) o.onErreur(motif);
    }
    salon.on('echec', echoue);
    salon.on('depart', function (dep) {
      if (termine) return; termine = true;
      if (o.onDepart) o.onDepart(dep, salon);
    });
    salon.ouvrir(function (err) {
      if (err) { echoue('reseau'); return; }
      // La presence met un instant a se synchroniser : on lui laisse le temps
      // avant de conclure que personne n'attend.
      var debut = Date.now();
      (function verifier() {
        if (termine) return;
        var etat = salon.canal ? salon.canal.presence() : {};
        var createur = etat.c && etat.c.length;
        // Ma propre presence est deja sous « j » : un second « j », c'est
        // quelqu'un d'autre, et la partie est complete.
        var autreJoueur = etat.j && etat.j.length > 1;
        if (createur) {
          if (autreJoueur) { echoue('complete'); return; }
          salon.envoyer('bonjour', { nom: salon.moi.nom, genre: salon.moi.genre });
          salon.minuteurDepart = setTimeout(function () { echoue('introuvable'); }, DELAI_DEPART);
          return;
        }
        if (Date.now() - debut < DELAI_PRESENCE) { setTimeout(verifier, 250); return; }
        echoue('introuvable');
      })();
    });
    return salon;
  }

  // Le formulaire du joueur qui rejoint : son prenom (et son genre si le test
  // le demande), le code s'il n'est pas deja dans l'adresse.
  function formulaireRejoindre(container, o) {
    container.innerHTML = '';
    var wrap = el('div', 'quiz-engine quiz-setup-screen animate-fade-in salon-ecran');
    wrap.appendChild(el('div', 'quiz-setup-icon quiz-setup-icon--emoji mx-auto mb-6', '📲'));
    wrap.appendChild(titre(s('rejoindreTitre', 'Rejoindre une partie')));
    wrap.appendChild(para(s('rejoindreDesc', '')));
    var carte = carteMoi(!!o.needsGender, o.valeurs);
    var grille = el('div', 'quiz-setup-grid quiz-setup-grid--seul max-w-lg mx-auto');
    grille.appendChild(carte.el);
    wrap.appendChild(grille);

    var codeChamp = null;
    if (!o.code) {
      var zone = el('div', 'salon-code-zone');
      var lab = el('label', 'block text-sm font-semibold mb-2 text-center', esc(s('codeLabel', 'Code de la partie')));
      lab.setAttribute('for', 'salon-code');
      codeChamp = el('input', 'input w-full salon-code-saisie');
      codeChamp.type = 'text'; codeChamp.id = 'salon-code'; codeChamp.maxLength = 8;
      codeChamp.autocomplete = 'off'; codeChamp.autocapitalize = 'characters'; codeChamp.spellcheck = false;
      codeChamp.placeholder = 'ABC123';
      zone.appendChild(lab); zone.appendChild(codeChamp);
      wrap.appendChild(zone);
    } else {
      var rappel = el('p', 'salon-code salon-code--petit', esc(o.code));
      wrap.appendChild(rappel);
    }
    var erreur = el('p', 'salon-erreur');
    erreur.hidden = true;
    wrap.appendChild(erreur);

    var bouton = el('button', 'btn btn-cta btn-gradient quiz-setup-start-btn', esc(s('rejoindre', 'Rejoindre')));
    bouton.type = 'button';
    function valider() {
      var moi = carte.lire();
      if (!moi.nom) { carte.champ.focus(); return; }
      var code = o.code || normaliserCode(codeChamp ? codeChamp.value : '');
      if (!codeValide(code)) { erreur.textContent = s('codeInvalide', ''); erreur.hidden = false; if (codeChamp) codeChamp.focus(); return; }
      erreur.hidden = true;
      if (o.onValider) o.onValider(moi, code);
    }
    bouton.addEventListener('click', valider);
    wrap.querySelectorAll('input').forEach(function (ch) {
      ch.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); valider(); } });
    });
    wrap.appendChild(bouton);
    if (o.onRetour) {
      var retour = el('button', 'btn btn-ghost salon-annuler', esc(s('annuler', 'Annuler')));
      retour.type = 'button';
      retour.addEventListener('click', o.onRetour);
      wrap.appendChild(retour);
    }
    container.appendChild(wrap);
    setTimeout(function () { try { carte.champ.focus({ preventScroll: true }); } catch (e) {} }, 60);
  }

  // L'ecran « j'ai fini, j'attends l'autre », commun aux moteurs.
  function ecranAttenteFin(container, o) {
    container.innerHTML = '';
    var wrap = el('div', 'quiz-engine quiz-setup-screen animate-fade-in salon-ecran');
    wrap.appendChild(el('div', 'quiz-setup-icon quiz-setup-icon--emoji mx-auto mb-6', '⏳'));
    wrap.appendChild(titre(s('attenteTitre', 'À vous, c\'est fini !')));
    wrap.appendChild(attenteVisuelle(avec(s('attenteDesc', 'En attente des réponses de {{nom}}…'), { nom: o.nom || '' })));
    var prog = el('p', 'salon-progression');
    prog.textContent = avec(s('progression', '{{nom}} : {{n}}/{{total}}'), { nom: o.nom || '', n: o.n || 0, total: o.total || 0 });
    wrap.appendChild(prog);
    wrap.appendChild(para(s('attenteNote', '')));
    if (o.onQuitter) {
      var q = el('button', 'btn btn-ghost salon-annuler', esc(s('quitter', 'Quitter la partie')));
      q.type = 'button';
      q.addEventListener('click', o.onQuitter);
      wrap.appendChild(q);
    }
    container.appendChild(wrap);
    return { progression: function (n) { prog.textContent = avec(s('progression', '{{nom}} : {{n}}/{{total}}'), { nom: o.nom || '', n: n, total: o.total || 0 }); } };
  }

  window.QCSalon = {
    actif: null,
    confirmerAnnulation: confirmerAnnulation,
    ecranAnnulee: ecranAnnulee,
    creer: creer,
    rejoindre: rejoindre,
    formulaireRejoindre: formulaireRejoindre,
    ecranErreur: ecranErreur,
    ecranAttenteFin: ecranAttenteFin,
    carteMoi: carteMoi,
    codeDansUrl: codeDansUrl,
    retirerCodeDeUrl: retirerCodeDeUrl,
    normaliserCode: normaliserCode,
    codeValide: codeValide,
    urlDeRejointe: urlDeRejointe,
    messageErreur: messageErreur,
    avec: avec,
    s: s
  };
})();
