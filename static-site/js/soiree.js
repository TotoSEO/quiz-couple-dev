/* Le jeu de soirée pour couples (27 octobre 2026, Thomas : « Le jeu à
   plusieurs couples de Quiz Couple ! Multijoueur jusqu'à 10 personnes »).
   De deux à cinq couples, chacun sur son téléphone. Une personne crée la
   partie et devient le maître du jeu : c'est son téléphone qui tient l'état
   de la partie (joueurs, couples, questions, réponses, scores) et qui le
   diffuse en entier à chaque changement sur un canal Supabase Realtime
   (diffusion + présence, nommé d'après le code, sans aucune table), comme
   le mode à distance de salon.js. Les joueurs n'envoient que trois choses :
   « je rejoins », « ma réponse », « renvoie-moi l'état ». Un message est
   idempotent : un téléphone qui recharge la page retrouve sa place (son
   identité est gardée dans sessionStorage, l'état du maître du jeu dans
   localStorage), et un état en retard est ignoré grâce à son numéro.

   Deux manches : l'accord (dans chaque couple, l'un répond pour lui, l'autre
   devine, les rôles alternent, un point par accord, un bonus toutes les
   trois de suite) et la spéciale, une question sur quatre (tout le monde
   vote pour un couple, le gagnant prend deux points et un titre, une
   égalité partage un point). Le maître du jeu choisit 10, 20, 30 ou 40
   questions et peut prolonger de dix à la dernière, jusqu'à 40. Le podium
   s'affiche sur chaque téléphone dans une .quiz-result-card : la porte
   e-mail (capture.js, source « soiree ») et le compteur de parties
   (quiz-extras.js) le reconnaissent. Les textes et les deux banques
   viennent de la page (window.__QC_SOIREE, {lang}/jeu-soiree-couples.json).
   Doublure de test sans réseau : window.__QCSoireeTransport. */
(function () {
  'use strict';
  var racine = document.getElementById('soiree-app');
  var CFG = window.__QC_SOIREE;
  if (!racine || !CFG) return;
  var T = CFG.t || {};
  var QUESTIONS = Array.isArray(CFG.questions) ? CFG.questions : [];
  var SPECIALES = Array.isArray(CFG.speciales) ? CFG.speciales : [];
  var LIENS = Array.isArray(CFG.liens) ? CFG.liens : [];
  if (!T.accueil || !QUESTIONS.length || !SPECIALES.length) return;

  var VERSION = 1;
  var MAX_JOUEURS = 10;
  var MIN_COUPLES = 2;
  var NB_CHOIX = [10, 20, 30, 40];
  var NB_DEFAUT = 20;
  var PROLONGATION = 10;
  var NB_MAX = 40;
  // La 4e, 8e, 12e question... est une manche spéciale.
  var SPECIALE_TOUTES_LES = 4;
  var SERIE_BONUS = 3;
  var ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  var CLE_SESSION = 'qc-soiree-moi';
  var CLE_MJ = 'qc-soiree-mj-';
  var DELAI_SCRIPT = 12000;
  var DELAI_MJ = 7000;
  var LETTRES = ['A', 'B', 'C', 'D'];
  var MEDAILLES = ['🥇', '🥈', '🥉'];
  // La clé publique du site, la même que celle des moteurs (quiz-engine-core.js) ;
  // le bloc des avis la porte aussi, on la lit là d'abord.
  var SUPABASE_URL = 'https://lojvajnnvhatfplevyvy.supabase.co';
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvanZham5udmhhdGZwbGV2eXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNzk3NDIsImV4cCI6MjA4Nzg1NTc0Mn0.gdd9HRbRvfQr6io9jGN6hUCW6tBOtognhwbsTJtSTng';
  (function () {
    var c = document.getElementById('reviews-config');
    if (c && c.dataset.url && c.dataset.key) { SUPABASE_URL = c.dataset.url; SUPABASE_KEY = c.dataset.key; }
  })();

  // ── Outils ──────────────────────────────────────────────────────────────
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function tx(cle, vals) {
    var s = cle.split('.').reduce(function (o, k) { return o && o[k] != null ? o[k] : null; }, T);
    s = s == null ? '' : String(s);
    if (vals) Object.keys(vals).forEach(function (k) { s = s.split('{{' + k + '}}').join(vals[k]); });
    return s;
  }
  function coupe(v, n) { return String(v || '').replace(/\s+/g, ' ').trim().slice(0, n); }
  // En français, « ? ! : ; » restent collés à leur mot (le « ? » d'une
  // question passait seul à la ligne sur un téléphone).
  function inse(texte) { return CFG.lang === 'fr' ? String(texte || '').replace(/ ([?!:;])/g, '\u00a0$1') : String(texte || ''); }
  function pts(n) { return n === 1 ? tx('fin.point') : tx('fin.points', { n: n }); }
  function votes(n) { return n === 1 ? tx('revele.vote') : tx('revele.votes', { n: n }); }
  function aleatoire(n) {
    var out = '', i, valeurs = null;
    try { if (window.crypto && window.crypto.getRandomValues) { valeurs = new Uint32Array(n); window.crypto.getRandomValues(valeurs); } } catch (e) { valeurs = null; }
    for (i = 0; i < n; i++) out += ALPHABET[(valeurs ? valeurs[i] : Math.floor(Math.random() * 1e9)) % ALPHABET.length];
    return out;
  }
  function melange(liste) {
    var a = liste.slice(), i, j, t;
    for (i = a.length - 1; i > 0; i--) { j = Math.floor(Math.random() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function idValide(id) { return typeof id === 'string' && /^[A-Z0-9]{6,12}$/.test(id); }
  function codeValide(c) { return typeof c === 'string' && /^[A-Z0-9]{6}$/.test(c); }
  function nomPropre(n) { return coupe(n, 20); }
  function couleur(i) { return '--c: var(--soiree-c' + (((i % 5) + 5) % 5) + ')'; }
  function lienPartie(code) { return location.origin + location.pathname + '#soiree=' + code; }
  function retirerCodeDeUrl() {
    if (/soiree=/.test(location.hash)) { try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {} }
  }
  // Le haut du jeu sous l'en-tête collé (et la barre de la réduction quand
  // elle y est) : scrollIntoView seul glissait le bandeau et le compteur de
  // questions sous l'en-tête.
  function defilerVersLeJeu() {
    try {
      var cible = (bandeauEl && bandeauEl.parentNode) ? bandeauEl : racine;
      var entete = document.getElementById('site-header');
      var haut = cible.getBoundingClientRect().top + window.pageYOffset - ((entete ? entete.offsetHeight : 0) + 10);
      window.scrollTo({ top: Math.max(0, haut), behavior: 'smooth' });
    } catch (e) {}
  }

  // Les mascottes de la charte (/js/mascottes.js, chargé avant ce script) :
  // la rose et le violet sur l'accueil et le podium. Sans le module, rien.
  var BOITES = { rose: [260, 280], violet: [220, 300] };
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
      .replace(/^<svg /, '<svg class="qc-masc" aria-hidden="true" focusable="false" ')
      .replace(/ width="\d+" height="\d+"/, ' width="' + Math.round(hauteur * b[0] / b[1]) + '" height="' + hauteur + '"');
  }
  function duo(poseA, poseB, hauteur, classe) {
    var html = mascotte('rose', poseA, hauteur) + mascotte('violet', poseB, hauteur);
    return html ? '<div class="soiree-duo' + (classe ? ' ' + classe : '') + '" aria-hidden="true">' + html + '</div>' : '';
  }

  // ── La mémoire de l'appareil ────────────────────────────────────────────
  function lireSession() {
    try { var m = JSON.parse(sessionStorage.getItem(CLE_SESSION) || 'null'); if (m && codeValide(m.code) && idValide(m.id) && (m.role === 'mj' || m.role === 'j')) return m; } catch (e) {}
    return null;
  }
  function ecrireSession(m) { try { sessionStorage.setItem(CLE_SESSION, JSON.stringify(m)); } catch (e) {} }
  function effacerSession() { try { sessionStorage.removeItem(CLE_SESSION); } catch (e) {} }
  function lireEtatMj(code) { try { return JSON.parse(localStorage.getItem(CLE_MJ + code) || 'null'); } catch (e) { return null; } }
  function ecrireEtatMj(s) { try { localStorage.setItem(CLE_MJ + s.code, JSON.stringify(s)); } catch (e) {} }
  function effacerEtatMj(code) { try { localStorage.removeItem(CLE_MJ + code); } catch (e) {} }

  // ── Le transport ────────────────────────────────────────────────────────
  // Le client Supabase vient du CDN, à la demande, comme pour le mode à
  // distance : il ne pèse que sur ceux qui jouent.
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
  var CDN_SUPABASE = [
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js',
    'https://unpkg.com/@supabase/supabase-js@2/dist/umd/supabase.min.js'
  ];
  var clientSupabase = null;
  function obtenirTransport(cb) {
    if (window.__QCSoireeTransport) { cb(null, window.__QCSoireeTransport); return; }
    if (clientSupabase) { cb(null, adaptateurSupabase(clientSupabase)); return; }
    function creer() {
      try {
        clientSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, { realtime: { params: { eventsPerSecond: 10 } } });
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
          envoyer: function (payload) { try { var p = ch.send({ type: 'broadcast', event: 'qc', payload: payload }); if (p && p.catch) p.catch(function () {}); } catch (e) {} },
          annoncer: function (meta) { try { var p = ch.track(meta); if (p && p.catch) p.catch(function () {}); } catch (e) {} },
          presence: function () { try { return ch.presenceState() || {}; } catch (e) { return {}; } },
          abonner: function (fn) { ch.subscribe(function (statut) { fn(statut); }); },
          fermer: function () { try { sb.removeChannel(ch); } catch (e) { try { ch.unsubscribe(); } catch (e2) {} } }
        };
      }
    };
  }

  // ── L'état ──────────────────────────────────────────────────────────────
  var moi = null;          // { role: 'mj' | 'j', id, nom, code }
  var etat = null;         // l'état de la partie (le maître du jeu l'écrit, les joueurs le reçoivent)
  var canal = null;
  var connecte = false;
  var accepte = false;     // joueur : vu au moins une fois dans l'état du maître du jeu
  var maReponseLocale = {}; // joueur : « partie:q » -> réponse, en attendant l'écho
  var presents = {};       // id -> présent, d'après la présence du canal
  var mjPresent = false;
  var ui = { cle: '', choisi: null, erreur: '', minuteur: null, essais: 0 };
  var bandeauEl = null;

  var QUESTION_PAR_ID = {}, SPECIALE_PAR_ID = {};
  QUESTIONS.forEach(function (q) { QUESTION_PAR_ID[q.id] = q; });
  SPECIALES.forEach(function (s) { SPECIALE_PAR_ID[s.id] = s; });
  function estSpeciale(id) { return !!SPECIALE_PAR_ID[id]; }
  function nombres(a, n) { var out = [], i; for (i = 0; i < n; i++) out.push(Array.isArray(a) && isFinite(Number(a[i])) ? Number(a[i]) : 0); return out; }

  // Tout ce qui arrive vient d'un inconnu jusqu'à preuve du contraire : un
  // état reçu est reconstruit champ par champ, borné, les prénoms coupés.
  var PHASES = { lobby: 1, question: 1, reveal: 1, fin: 1 };
  function etatValide(s) {
    if (!s || typeof s !== 'object' || s.v !== VERSION) return null;
    try { if (JSON.stringify(s).length > 40000) return null; } catch (e) { return null; }
    if (!codeValide(s.code) || !PHASES[s.phase]) return null;
    if (!s.mj || !idValide(s.mj.id)) return null;
    if (!Array.isArray(s.joueurs) || s.joueurs.length > MAX_JOUEURS) return null;
    var joueurs = [], couples = [], ordre = [], i;
    for (i = 0; i < s.joueurs.length; i++) {
      var j = s.joueurs[i];
      if (!j || !idValide(j.id)) return null;
      joueurs.push({ id: j.id, nom: nomPropre(j.nom) });
    }
    if (!Array.isArray(s.couples) || s.couples.length > 5) return null;
    for (i = 0; i < s.couples.length; i++) {
      var c = s.couples[i];
      if (!Array.isArray(c) || c.length !== 2 || !idValide(c[0]) || !idValide(c[1])) return null;
      couples.push([c[0], c[1]]);
    }
    if (!Array.isArray(s.ordre) || s.ordre.length > NB_MAX) return null;
    for (i = 0; i < s.ordre.length; i++) {
      var n = Number(s.ordre[i]);
      if (!isFinite(n) || (!QUESTION_PAR_ID[n] && !SPECIALE_PAR_ID[n])) return null;
      ordre.push(n);
    }
    var q = Number(s.q), nb = Number(s.nb), num = Number(s.n), partie = Number(s.partie);
    if (!isFinite(q) || q < 0 || q > NB_MAX || !isFinite(nb) || nb < 0 || nb > NB_MAX) return null;
    var rep = {};
    if (s.rep && typeof s.rep === 'object') {
      Object.keys(s.rep).forEach(function (k) {
        var bloc = s.rep[k];
        if (!/^\d{1,2}$/.test(k) || !bloc || typeof bloc !== 'object') return;
        rep[k] = {};
        Object.keys(bloc).forEach(function (id) { var r = Number(bloc[id]); if (idValide(id) && isFinite(r)) rep[k][id] = Math.floor(r); });
      });
    }
    var titres = [];
    if (Array.isArray(s.titres)) s.titres.slice(0, NB_MAX).forEach(function (t) {
      if (t && SPECIALE_PAR_ID[Number(t.s)] && isFinite(Number(t.c))) titres.push({ s: Number(t.s), c: Number(t.c) });
    });
    return {
      v: VERSION, code: s.code, n: isFinite(num) ? num : 0, partie: isFinite(partie) && partie > 0 ? partie : 1, phase: s.phase,
      mj: { id: s.mj.id, nom: nomPropre(s.mj.nom), joue: !!s.mj.joue },
      joueurs: joueurs, couples: couples, nb: nb, ordre: ordre, q: q, rep: rep,
      scores: nombres(s.scores, couples.length), series: nombres(s.series, couples.length),
      meilleures: nombres(s.meilleures, couples.length), accords: nombres(s.accords, couples.length),
      titres: titres, rev: (s.rev && typeof s.rev === 'object') ? s.rev : null
    };
  }

  function joueurParId(id) { for (var i = 0; i < etat.joueurs.length; i++) if (etat.joueurs[i].id === id) return etat.joueurs[i]; return null; }
  function nomDe(id) { var j = joueurParId(id); return j ? j.nom : ''; }
  function coupleDe(id) { for (var i = 0; i < etat.couples.length; i++) if (etat.couples[i][0] === id || etat.couples[i][1] === id) return i; return -1; }
  function partenaireDe(id) { var i = coupleDe(id); if (i < 0) return null; var c = etat.couples[i]; return c[0] === id ? c[1] : c[0]; }
  function nomCouple(i) { var c = etat.couples[i]; return c ? nomDe(c[0]) + ' & ' + nomDe(c[1]) : ''; }
  function sansCouple() { return etat.joueurs.filter(function (j) { return coupleDe(j.id) < 0; }); }
  function attendus() { var ids = []; etat.couples.forEach(function (c) { ids.push(c[0], c[1]); }); return ids; }
  function reponsesCourantes() { return etat.rep[String(etat.q)] || {}; }
  function aRepondu(id) {
    if (reponsesCourantes()[id] !== undefined) return true;
    return maReponseLocale[etat.partie + ':' + etat.q] !== undefined && id === moi.id;
  }
  function questionCourante() {
    var id = etat.ordre[etat.q];
    return { id: id, speciale: estSpeciale(id), q: QUESTION_PAR_ID[id] || null, s: SPECIALE_PAR_ID[id] || null };
  }
  // Dans un couple, celui qui répond pour lui-même alterne d'une manche
  // accord à l'autre : le premier du couple sur la première, le second sur
  // la suivante, les manches spéciales ne comptant pas.
  function indexSujet(qIndex) {
    var n = 0;
    for (var i = 0; i < qIndex && i < etat.ordre.length; i++) if (!estSpeciale(etat.ordre[i])) n++;
    return n % 2;
  }
  function nbAccords() { var n = 0; etat.ordre.slice(0, etat.nb).forEach(function (id) { if (!estSpeciale(id)) n++; }); return n; }
  function derniereQuestion() { return etat.q + 1 >= etat.nb; }
  function restantes(deja) {
    var pris = {}; deja.forEach(function (id) { pris[id] = 1; });
    return QUESTIONS.filter(function (q) { return !pris[q.id]; }).length + SPECIALES.filter(function (s) { return !pris[s.id]; }).length;
  }
  function peutProlonger() { return etat.ordre.length < NB_MAX && restantes(etat.ordre) > 0; }

  // La suite des questions : une spéciale toutes les quatre, les autres
  // d'accord, tirées sans répétition ; une prolongation continue la cadence.
  function construireOrdre(nb, deja) {
    var pris = {}; deja.forEach(function (id) { pris[id] = 1; });
    var poolA = melange(QUESTIONS.filter(function (q) { return !pris[q.id]; }).map(function (q) { return q.id; }));
    var poolS = melange(SPECIALES.filter(function (s) { return !pris[s.id]; }).map(function (s) { return s.id; }));
    var out = [], k = deja.length + 1;
    while (out.length < nb && (poolA.length || poolS.length)) {
      var speciale = (k % SPECIALE_TOUTES_LES === 0 && poolS.length) || !poolA.length;
      out.push(speciale ? poolS.shift() : poolA.shift());
      k++;
    }
    return out;
  }
  function tirerUne(speciale, deja) {
    var pris = {}; deja.forEach(function (id) { pris[id] = 1; });
    var pool = (speciale ? SPECIALES : QUESTIONS).filter(function (x) { return !pris[x.id]; }).map(function (x) { return x.id; });
    return pool.length ? melange(pool)[0] : null;
  }

  // ── Le canal ────────────────────────────────────────────────────────────
  function envoyer(p) {
    if (!canal || !connecte) return;
    p.v = VERSION; p.de = moi.role;
    canal.envoyer(p);
  }
  function ouvrirCanal(cb) {
    obtenirTransport(function (err, transport) {
      if (err || !transport) { cb(err || new Error('transport')); return; }
      canal = transport.canal('qc-soiree-' + moi.code, moi.id);
      canal.surMessage(recevoir);
      canal.surPresence(surPresence);
      var premier = true;
      canal.abonner(function (statut) {
        if (statut === 'SUBSCRIBED') {
          connecte = true;
          canal.annoncer({ role: moi.role, id: moi.id, nom: moi.nom, v: VERSION });
          if (premier) { premier = false; cb(null); } else surReconnexion();
        } else if (statut === 'CHANNEL_ERROR' || statut === 'TIMED_OUT') {
          connecte = false;
          if (premier) { premier = false; cb(new Error(statut)); } else bandeau(tx('bandeau.coupure'), 'alerte');
        } else if (statut === 'CLOSED') {
          connecte = false;
        }
      });
    });
  }
  function surReconnexion() {
    if (moi.role === 'mj') { if (etat) diffuser(); }
    else envoyer({ t: 'rejoindre', id: moi.id, nom: moi.nom });
    majBandeau();
  }
  function surPresence() {
    var p = canal ? canal.presence() : {};
    var avant = mjPresent;
    presents = {}; mjPresent = false;
    Object.keys(p).forEach(function (k) {
      (p[k] || []).forEach(function (m) {
        if (!m) return;
        if (m.role === 'mj') mjPresent = true;
        if (typeof m.id === 'string') presents[m.id] = true;
      });
    });
    if (moi && moi.role === 'mj') mjPresent = true;
    if (moi && moi.role === 'j' && etat) {
      if (mjPresent && !avant) { bandeau(tx('bandeau.mjRevenu'), 'ok'); envoyer({ t: 'etat?', id: moi.id }); setTimeout(majBandeau, 2500); }
      else if (!mjPresent && avant) bandeau(tx('bandeau.mjParti'), 'alerte');
    }
    rafraichir();
  }
  function recevoir(p) {
    if (!p || typeof p !== 'object' || p.v !== VERSION || typeof p.t !== 'string') return;
    if (!moi) return;
    if (moi.role === 'mj') { if (p.de === 'j') recevoirMj(p); }
    else if (p.de === 'mj') recevoirJoueur(p);
  }

  // ── Le maître du jeu ────────────────────────────────────────────────────
  function diffuser() { envoyer({ t: 'etat', s: etat }); }
  function publier() {
    etat.n++;
    ecrireEtatMj(etat);
    diffuser();
    rendre();
  }
  function recevoirMj(p) {
    if (!etat) return;
    switch (p.t) {
      case 'rejoindre': {
        if (!idValide(p.id)) return;
        var nom = nomPropre(p.nom);
        var connu = joueurParId(p.id);
        if (connu) { if (nom && connu.nom !== nom && etat.phase === 'lobby') { connu.nom = nom; publier(); } else diffuser(); return; }
        if (etat.phase !== 'lobby') { envoyer({ t: 'refus', pour: p.id, motif: 'commencee' }); return; }
        if (etat.joueurs.length >= MAX_JOUEURS) { envoyer({ t: 'refus', pour: p.id, motif: 'complete' }); return; }
        if (!nom) return;
        etat.joueurs.push({ id: p.id, nom: nom });
        publier();
        break;
      }
      case 'reponse': {
        if (etat.phase !== 'question' || !idValide(p.id) || Number(p.q) !== etat.q) return;
        if (coupleDe(p.id) < 0) return;
        enregistrerReponse(p.id, p.r);
        break;
      }
      case 'etat?':
        if (idValide(p.id)) diffuser();
        break;
      case 'quitter':
        if (etat.phase === 'lobby' && idValide(p.id) && joueurParId(p.id)) retirerJoueur(p.id, true);
        break;
      default: break;
    }
  }
  function enregistrerReponse(id, valeur) {
    var r = Number(valeur);
    if (!isFinite(r)) return;
    r = Math.floor(r);
    var qc = questionCourante();
    if (qc.speciale ? (r < 0 || r >= etat.couples.length) : (r < 0 || r > 3)) return;
    var rep = etat.rep[String(etat.q)] || (etat.rep[String(etat.q)] = {});
    if (rep[id] !== undefined) return;
    rep[id] = r;
    publier();
  }
  function creerPartie(nom, joue) {
    var id = aleatoire(8), code = aleatoire(6);
    moi = { role: 'mj', id: id, nom: nom, code: code };
    etat = {
      v: VERSION, code: code, n: 0, partie: 1, phase: 'lobby',
      mj: { id: id, nom: nom, joue: joue },
      joueurs: joue ? [{ id: id, nom: nom }] : [],
      couples: [], nb: NB_DEFAUT, ordre: [], q: 0, rep: {},
      scores: [], series: [], meilleures: [], accords: [], titres: [], rev: null
    };
    ecrireSession(moi);
    ecrireEtatMj(etat);
    ecranConnexion();
    ouvrirCanal(function (err) {
      if (err) { effacerSession(); effacerEtatMj(code); ecranMessage(tx('rejoindre.erreurReseau'), ecranAccueil); return; }
      publier();
      defilerVersLeJeu();
    });
  }
  function formerCouple(a, b) {
    if (a === b || coupleDe(a) >= 0 || coupleDe(b) >= 0 || !joueurParId(a) || !joueurParId(b)) return;
    if (etat.couples.length >= 5) return;
    etat.couples.push([a, b]);
    ui.choisi = null;
    publier();
  }
  function defaireCouple(i) { if (etat.couples[i]) { etat.couples.splice(i, 1); publier(); } }
  function formerAuto() {
    var libres = sansCouple().map(function (j) { return j.id; });
    while (libres.length >= 2 && etat.couples.length < 5) etat.couples.push([libres.shift(), libres.shift()]);
    ui.choisi = null;
    publier();
  }
  function retirerJoueur(id, parLuiMeme) {
    if (etat.phase !== 'lobby' || id === moi.id) return;
    var c = coupleDe(id);
    if (c >= 0) etat.couples.splice(c, 1);
    etat.joueurs = etat.joueurs.filter(function (j) { return j.id !== id; });
    if (ui.choisi === id) ui.choisi = null;
    if (!parLuiMeme) envoyer({ t: 'retire', pour: id });
    publier();
  }
  function choisirNb(n) { if (NB_CHOIX.indexOf(n) >= 0) { etat.nb = n; publier(); } }
  function commencer() {
    if (etat.couples.length < MIN_COUPLES || sansCouple().length) return;
    etat.ordre = construireOrdre(etat.nb, []);
    etat.nb = etat.ordre.length;
    etat.q = 0; etat.rep = {}; etat.rev = null;
    var n = etat.couples.length;
    etat.scores = nombres([], n); etat.series = nombres([], n); etat.meilleures = nombres([], n); etat.accords = nombres([], n);
    etat.titres = [];
    etat.phase = 'question';
    publier();
  }
  // La révélation : le maître du jeu calcule le résultat de la question et
  // les points, et tout le monde reçoit la même chose (rev).
  function reveler() {
    if (etat.phase !== 'question') return;
    var qc = questionCourante(), rep = reponsesCourantes(), i;
    if (qc.speciale) {
      var votes = nombres([], etat.couples.length);
      Object.keys(rep).forEach(function (id) { var c = rep[id]; if (c >= 0 && c < votes.length && coupleDe(id) >= 0) votes[c]++; });
      var max = 0; for (i = 0; i < votes.length; i++) if (votes[i] > max) max = votes[i];
      var gagnants = [];
      for (i = 0; i < votes.length; i++) if (max > 0 && votes[i] === max) gagnants.push(i);
      if (gagnants.length === 1) { etat.scores[gagnants[0]] += 2; etat.titres.push({ s: qc.id, c: gagnants[0] }); }
      else gagnants.forEach(function (g) { etat.scores[g] += 1; });
      etat.rev = { type: 's', votes: votes, gagnants: gagnants, max: max };
    } else {
      var s = indexSujet(etat.q), parCouple = [];
      for (i = 0; i < etat.couples.length; i++) {
        var c = etat.couples[i], sujet = c[s], devin = c[1 - s];
        var rs = rep[sujet], rd = rep[devin];
        var ok = rs !== undefined && rd !== undefined && rs === rd;
        var bonus = false;
        if (ok) {
          etat.scores[i] += 1; etat.accords[i] += 1; etat.series[i] += 1;
          if (etat.series[i] > etat.meilleures[i]) etat.meilleures[i] = etat.series[i];
          if (etat.series[i] % SERIE_BONUS === 0) { etat.scores[i] += 1; bonus = true; }
        } else etat.series[i] = 0;
        parCouple.push({ c: i, ok: ok, sujet: sujet, devin: devin, rs: rs === undefined ? null : rs, rd: rd === undefined ? null : rd, bonus: bonus, serie: etat.series[i] });
      }
      etat.rev = { type: 'a', parCouple: parCouple };
    }
    etat.phase = 'reveal';
    publier();
  }
  function passer() {
    if (etat.phase !== 'question') return;
    var qc = questionCourante();
    var autre = tirerUne(qc.speciale, etat.ordre);
    etat.rep[String(etat.q)] = {};
    if (autre !== null) { etat.ordre[etat.q] = autre; publier(); }
    else suivant();
  }
  function suivant() {
    if (etat.q + 1 < etat.nb) { etat.q += 1; etat.phase = 'question'; etat.rev = null; }
    else { etat.phase = 'fin'; etat.rev = null; }
    publier();
  }
  function prolonger() {
    if (!peutProlonger()) { suivant(); return; }
    var plus = construireOrdre(Math.min(PROLONGATION, NB_MAX - etat.ordre.length), etat.ordre);
    etat.ordre = etat.ordre.concat(plus);
    etat.nb = etat.ordre.length;
    suivant();
  }
  function terminer() { etat.phase = 'fin'; etat.rev = null; publier(); }
  function rejouer() {
    var n = etat.couples.length;
    etat.phase = 'lobby'; etat.ordre = []; etat.q = 0; etat.rep = {}; etat.rev = null;
    etat.scores = nombres([], n); etat.series = nombres([], n); etat.meilleures = nombres([], n); etat.accords = nombres([], n);
    etat.titres = []; etat.partie += 1;
    maReponseLocale = {}; ui.cle = '';
    publier();
  }
  function annuler() {
    envoyer({ t: 'annule' });
    effacerEtatMj(moi.code);
    effacerSession();
    setTimeout(function () { location.reload(); }, 150);
  }

  // ── Le joueur ───────────────────────────────────────────────────────────
  function recevoirJoueur(p) {
    switch (p.t) {
      case 'etat': {
        var s = etatValide(p.s);
        if (!s || s.code !== moi.code) return;
        if (etat && s.partie === etat.partie && s.n < etat.n) return;
        appliquerEtat(s);
        break;
      }
      case 'refus':
        if (p.pour === moi.id && !accepte) echecRejoindre(p.motif === 'complete' ? 'complete' : 'commencee');
        break;
      case 'retire':
        if (p.pour === moi.id) finDePartie('retire');
        break;
      case 'annule':
        finDePartie('annulee');
        break;
      default: break;
    }
  }
  function appliquerEtat(s) {
    var premiere = !etat;
    if (etat && s.partie !== etat.partie) { maReponseLocale = {}; ui.cle = ''; }
    etat = s;
    if (!joueurParId(moi.id)) {
      // Pas encore dans la liste : le maître du jeu m'ajoute et rediffuse ;
      // déjà vu puis absent : il m'a retiré.
      if (accepte) finDePartie('retire');
      return;
    }
    if (!accepte) { accepte = true; if (ui.minuteur) { clearTimeout(ui.minuteur); ui.minuteur = null; } retirerCodeDeUrl(); }
    if (premiere) defilerVersLeJeu();
    rendre();
  }
  function rejoindrePartie(code, nom) {
    var session = lireSession();
    var id = session && session.code === code ? session.id : aleatoire(8);
    moi = { role: 'j', id: id, nom: nom, code: code };
    ecrireSession(moi);
    ecranConnexion();
    ouvrirCanal(function (err) {
      if (err) { effacerSession(); ecranMessage(tx('rejoindre.erreurReseau'), function () { ecranRejoindre(code); }); return; }
      envoyerRejoindre();
    });
  }
  function envoyerRejoindre() {
    envoyer({ t: 'rejoindre', id: moi.id, nom: moi.nom });
    ui.essais = 0;
    attendreLeMj();
  }
  function attendreLeMj() {
    if (ui.minuteur) clearTimeout(ui.minuteur);
    ui.minuteur = setTimeout(function () {
      ui.minuteur = null;
      if (accepte) return;
      ui.essais += 1;
      if (ui.essais < 2 && mjPresent) { envoyer({ t: 'rejoindre', id: moi.id, nom: moi.nom }); attendreLeMj(); return; }
      echecRejoindre('introuvable');
    }, DELAI_MJ);
  }
  function echecRejoindre(motif) {
    var code = moi ? moi.code : '';
    fermerCanal();
    effacerSession();
    etat = null; accepte = false;
    ecranMessage(tx('rejoindre.' + motif), function () { ecranRejoindre(code); });
  }
  function repondre(r) {
    if (!etat || etat.phase !== 'question' || aRepondu(moi.id)) return;
    if (moi.role === 'mj') { enregistrerReponse(moi.id, r); return; }
    maReponseLocale[etat.partie + ':' + etat.q] = r;
    envoyer({ t: 'reponse', id: moi.id, q: etat.q, r: r });
    rendre();
  }
  function quitter() {
    envoyer({ t: 'quitter', id: moi.id });
    fermerCanal();
    effacerSession();
    setTimeout(function () { location.reload(); }, 150);
  }
  function fermerCanal() {
    connecte = false;
    if (canal) { try { canal.fermer(); } catch (e) {} canal = null; }
    if (bandeauEl && bandeauEl.parentNode) bandeauEl.parentNode.removeChild(bandeauEl);
    bandeauEl = null;
  }
  function finDePartie(motif) {
    fermerCanal();
    effacerSession();
    etat = null; accepte = false;
    ecranMessage(tx('bandeau.' + motif), function () { location.reload(); }, tx('bandeau.retour'));
  }

  // ── Le bandeau et la boîte de confirmation ───────────────────────────────
  function bandeau(texte, ton) {
    if (!racine.parentNode) return;
    if (!bandeauEl) {
      bandeauEl = el('div', 'salon-bandeau');
      bandeauEl.setAttribute('role', 'status');
      bandeauEl.setAttribute('aria-live', 'polite');
      racine.parentNode.insertBefore(bandeauEl, racine);
    }
    bandeauEl.className = 'salon-bandeau' + (ton ? ' salon-bandeau--' + ton : '');
    bandeauEl.innerHTML = '<span class="salon-bandeau-point" aria-hidden="true"></span><span class="salon-bandeau-texte">' + esc(texte) + '</span>';
    var sortir = el('button', 'salon-bandeau-quitter', esc(tx('bandeau.quitter')));
    sortir.type = 'button';
    sortir.addEventListener('click', function () {
      if (moi.role === 'mj') confirmer(tx('bandeau.annulerTexte'), annuler);
      else confirmer(tx('bandeau.quitterTexte'), quitter);
    });
    bandeauEl.appendChild(sortir);
  }
  function majBandeau() {
    if (!etat || !moi) return;
    if (moi.role === 'mj') bandeau(tx('bandeau.mj', { code: moi.code }), 'ok');
    else if (!mjPresent) bandeau(tx('bandeau.mjParti'), 'alerte');
    else bandeau(tx('bandeau.joueur', { code: moi.code, mj: etat.mj.nom }), 'ok');
  }
  function confirmer(texte, onOui) {
    var voile = el('div', 'salon-voile');
    var boite = el('div', 'salon-modale');
    boite.setAttribute('role', 'dialog'); boite.setAttribute('aria-modal', 'true');
    boite.setAttribute('aria-labelledby', 'soiree-modale-texte');
    var p = el('p', 'salon-modale-texte', esc(texte)); p.id = 'soiree-modale-texte';
    boite.appendChild(p);
    var actions = el('div', 'salon-modale-actions');
    var non = el('button', 'btn btn-cta salon-modale-non', esc(tx('bandeau.non')));
    var oui = el('button', 'btn btn-outline salon-modale-oui', esc(tx('bandeau.oui')));
    non.type = 'button'; oui.type = 'button';
    function fermerBoite() { if (voile.parentNode) voile.parentNode.removeChild(voile); document.removeEventListener('keydown', surTouche); }
    function surTouche(e) { if (e.key === 'Escape') fermerBoite(); }
    non.addEventListener('click', fermerBoite);
    oui.addEventListener('click', function () { fermerBoite(); onOui(); });
    voile.addEventListener('click', function (e) { if (e.target === voile) fermerBoite(); });
    document.addEventListener('keydown', surTouche);
    actions.appendChild(non); actions.appendChild(oui);
    boite.appendChild(actions);
    voile.appendChild(boite);
    document.body.appendChild(voile);
    setTimeout(function () { try { non.focus(); } catch (e) {} }, 30);
  }

  // ── Les écrans hors partie ──────────────────────────────────────────────
  function monter(html) {
    racine.innerHTML = '';
    var ecran = el('div', 'soiree-ecran', html);
    racine.appendChild(ecran);
    return ecran;
  }
  function liensSeul() {
    if (!LIENS.length) return '';
    return '<ul class="soiree-liens">' + LIENS.map(function (l) { return '<li><a href="' + esc(l.url) + '">' + esc(l.texte) + '</a></li>'; }).join('') + '</ul>';
  }
  function ecranAccueil() {
    moi = null; etat = null;
    var e = monter(
      duo('salut', 'joie', 74) +
      '<h2 class="soiree-titre">' + esc(tx('accueil.titre')) + '</h2>' +
      '<p class="soiree-texte">' + esc(tx('accueil.texte')) + '</p>' +
      '<div class="soiree-choix">' +
        '<button type="button" class="soiree-tuile" data-act="creer"><span class="soiree-tuile-ic" aria-hidden="true">🎲</span><span class="soiree-tuile-titre">' + esc(tx('accueil.creer')) + '</span><span class="soiree-tuile-aide">' + esc(tx('accueil.creerAide')) + '</span></button>' +
        '<button type="button" class="soiree-tuile soiree-tuile--second" data-act="rejoindre"><span class="soiree-tuile-ic" aria-hidden="true">📲</span><span class="soiree-tuile-titre">' + esc(tx('accueil.rejoindre')) + '</span><span class="soiree-tuile-aide">' + esc(tx('accueil.rejoindreAide')) + '</span></button>' +
      '</div>' +
      '<p class="soiree-minimum">' + esc(tx('accueil.minimum')) + '</p>' +
      '<div class="soiree-seul"><p class="soiree-seul-titre">' + esc(tx('accueil.seulTitre')) + '</p><p class="soiree-seul-texte">' + esc(tx('accueil.seulTexte')) + '</p>' + liensSeul() + '</div>'
    );
    e.querySelector('[data-act="creer"]').addEventListener('click', ecranCreer);
    e.querySelector('[data-act="rejoindre"]').addEventListener('click', function () { ecranRejoindre(''); });
  }
  function ecranCreer() {
    var e = monter(
      '<h2 class="soiree-titre">' + esc(tx('creer.titre')) + '</h2>' +
      '<p class="soiree-texte">' + esc(tx('creer.texte')) + '</p>' +
      '<form class="soiree-form" novalidate>' +
        '<div class="soiree-champ"><label for="soiree-nom">' + esc(tx('creer.prenom')) + '</label><input id="soiree-nom" class="soiree-input" type="text" maxlength="20" autocomplete="given-name" autocapitalize="words" enterkeyhint="go"></div>' +
        '<div class="soiree-radios" role="radiogroup">' +
          '<label class="soiree-radio soiree-radio--on"><input type="radio" name="joue" value="1" checked><span><span class="soiree-radio-titre">' + esc(tx('creer.joue')) + '</span><span class="soiree-radio-aide">' + esc(tx('creer.joueAide')) + '</span></span></label>' +
          '<label class="soiree-radio"><input type="radio" name="joue" value="0"><span><span class="soiree-radio-titre">' + esc(tx('creer.anime')) + '</span><span class="soiree-radio-aide">' + esc(tx('creer.animeAide')) + '</span></span></label>' +
        '</div>' +
        '<p class="soiree-erreur" role="alert" hidden></p>' +
        '<div class="soiree-actions"><button type="submit" class="btn btn-cta btn-gradient">' + esc(tx('creer.bouton')) + '</button><button type="button" class="soiree-lien-retour" data-act="retour">←</button></div>' +
      '</form>'
    );
    var form = e.querySelector('form'), champ = e.querySelector('#soiree-nom'), erreur = e.querySelector('.soiree-erreur');
    e.querySelectorAll('.soiree-radio input').forEach(function (r) {
      r.addEventListener('change', function () { e.querySelectorAll('.soiree-radio').forEach(function (l) { l.classList.toggle('soiree-radio--on', l.querySelector('input').checked); }); });
    });
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var nom = nomPropre(champ.value);
      if (!nom) { erreur.textContent = tx('creer.prenomRequis'); erreur.hidden = false; champ.focus(); return; }
      var joue = form.querySelector('input[name="joue"]:checked').value === '1';
      creerPartie(nom, joue);
    });
    e.querySelector('[data-act="retour"]').addEventListener('click', ecranAccueil);
    setTimeout(function () { try { champ.focus(); } catch (err) {} }, 50);
  }
  function ecranRejoindre(code) {
    var e = monter(
      '<h2 class="soiree-titre">' + esc(tx('rejoindre.titre')) + '</h2>' +
      '<p class="soiree-texte">' + esc(tx('rejoindre.texte')) + '</p>' +
      '<form class="soiree-form" novalidate>' +
        '<div class="soiree-champ"><label for="soiree-code">' + esc(tx('rejoindre.code')) + '</label><input id="soiree-code" class="soiree-input soiree-input--code" type="text" maxlength="6" autocomplete="off" autocapitalize="characters" spellcheck="false" inputmode="latin" value="' + esc(code) + '"></div>' +
        '<div class="soiree-champ"><label for="soiree-nom">' + esc(tx('rejoindre.prenom')) + '</label><input id="soiree-nom" class="soiree-input" type="text" maxlength="20" autocomplete="given-name" autocapitalize="words" enterkeyhint="go"></div>' +
        '<p class="soiree-erreur" role="alert" hidden></p>' +
        '<div class="soiree-actions"><button type="submit" class="btn btn-cta btn-gradient">' + esc(tx('rejoindre.bouton')) + '</button><button type="button" class="soiree-lien-retour" data-act="retour">←</button></div>' +
      '</form>'
    );
    var form = e.querySelector('form'), champCode = e.querySelector('#soiree-code'), champNom = e.querySelector('#soiree-nom'), erreur = e.querySelector('.soiree-erreur');
    champCode.addEventListener('input', function () { champCode.value = champCode.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6); });
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var c = champCode.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
      var nom = nomPropre(champNom.value);
      if (!codeValide(c)) { erreur.textContent = tx('rejoindre.codeInvalide'); erreur.hidden = false; champCode.focus(); return; }
      if (!nom) { erreur.textContent = tx('rejoindre.prenomRequis'); erreur.hidden = false; champNom.focus(); return; }
      rejoindrePartie(c, nom);
    });
    e.querySelector('[data-act="retour"]').addEventListener('click', ecranAccueil);
    setTimeout(function () { try { (code ? champNom : champCode).focus(); } catch (err) {} }, 50);
  }
  function ecranConnexion() {
    monter('<div class="soiree-attente"><span class="soiree-spinner" aria-hidden="true"></span><p class="soiree-texte">' + esc(tx('rejoindre.connexion')) + '</p></div>');
  }
  function ecranMessage(texte, onRetour, libelle) {
    var e = monter(
      '<div class="soiree-attente"><span class="soiree-tuile-ic" aria-hidden="true">🙁</span>' +
      '<p class="soiree-texte">' + esc(texte) + '</p>' +
      '<button type="button" class="btn btn-cta" data-act="retour">' + esc(libelle || tx('bandeau.retour')) + '</button></div>'
    );
    e.querySelector('[data-act="retour"]').addEventListener('click', onRetour);
  }

  // ── Le rendu d'une partie ───────────────────────────────────────────────
  // Un écran n'est redessiné que lorsque sa clé change : un joueur qui tape
  // un prénom ou qui lit ses réponses n'est pas interrompu par chaque état
  // reçu. Entre deux, rafraichir() met à jour les compteurs en place.
  function cleEcran() {
    var cle = [etat.phase, etat.partie, etat.q, etat.ordre[etat.q], moi.role];
    if (etat.phase === 'lobby') cle.push(etat.n);
    if (etat.phase === 'question') cle.push(aRepondu(moi.id) ? 'r' : '');
    if (etat.phase === 'reveal') cle.push(etat.nb);
    return cle.join('|');
  }
  function rendre() {
    if (!etat || !moi) return;
    var cle = cleEcran();
    majBandeau();
    if (cle === ui.cle) { rafraichir(); return; }
    var changementDePhase = ui.cle && ui.cle.split('|')[0] !== etat.phase;
    ui.cle = cle;
    if (etat.phase === 'lobby') { if (moi.role === 'mj') rendreSalleMj(); else rendreSalleJoueur(); }
    else if (etat.phase === 'question') rendreQuestion();
    else if (etat.phase === 'reveal') rendreRevelation();
    else rendreFin();
    if (changementDePhase) defilerVersLeJeu();
  }
  function rafraichir() {
    if (!etat) return;
    var c = racine.querySelector('[data-compteur]');
    if (c && etat.phase === 'question') {
      var ids = attendus(), n = ids.filter(aRepondu).length;
      c.textContent = tx('partie.attente', { n: n, total: ids.length });
    }
    var mjEtat = racine.querySelector('[data-mj-etat]');
    if (mjEtat && etat.phase === 'question') {
      var tous = attendus(), repondu = tous.filter(aRepondu), tousOk = repondu.length >= tous.length;
      mjEtat.textContent = tousOk ? tx('partie.mjTous') : tx('partie.mjReponses', { n: repondu.length, total: tous.length });
      mjEtat.classList.toggle('soiree-mj-etat--pret', tousOk);
      var manquent = racine.querySelector('[data-manquent]');
      if (manquent) {
        var noms = tous.filter(function (id) { return !aRepondu(id); }).map(function (id) { return nomDe(id) + (presents[id] ? '' : ' (' + tx('bandeau.deconnecte') + ')'); });
        manquent.textContent = noms.length ? tx('partie.manquent', { noms: noms.join(', ') }) : '';
      }
      var bouton = racine.querySelector('[data-act="reveler"]');
      if (bouton) { bouton.textContent = tousOk ? tx('partie.reveler') : tx('partie.revelerQuandMeme'); bouton.classList.toggle('soiree-pulse', tousOk); bouton.classList.toggle('btn-cta', tousOk); bouton.classList.toggle('btn-outline', !tousOk); }
    }
    racine.querySelectorAll('[data-presence]').forEach(function (p) {
      p.classList.toggle('soiree-point--hors', !presents[p.getAttribute('data-presence')]);
    });
  }
  function entete(qc) {
    return '<div class="soiree-entete"><span class="soiree-compteur">' + esc(tx('partie.question', { n: etat.q + 1, total: etat.nb })) + '</span>' +
      '<span class="soiree-manche' + (qc.speciale ? ' soiree-manche--speciale' : '') + '">' + esc(tx(qc.speciale ? 'partie.speciale' : 'partie.accord')) + '</span></div>';
  }
  function chipJoueur(j, options) {
    var o = options || {};
    var moiMeme = j.id === moi.id;
    return '<' + (o.bouton ? 'button type="button"' : 'span') + ' class="soiree-chip' + (o.choisi ? ' soiree-chip--choisi' : '') + (o.bouton ? '' : ' soiree-chip--fixe') + '"' + (o.bouton ? ' data-chip="' + esc(j.id) + '"' : '') + '>' +
      '<span class="soiree-point' + (presents[j.id] || moiMeme ? '' : ' soiree-point--hors') + '" data-presence="' + esc(j.id) + '" aria-hidden="true"></span>' +
      '<span>' + esc(j.nom) + '</span>' +
      (moiMeme ? '<span class="soiree-chip-mj">(' + esc(tx('salle.vous')) + ')</span>' : (j.id === etat.mj.id ? '<span class="soiree-chip-mj">(' + esc(tx('salle.mj')) + ')</span>' : '')) +
      (o.retirer && !moiMeme ? '<span class="soiree-chip-x" role="button" tabindex="0" data-retirer="' + esc(j.id) + '" aria-label="' + esc(tx('salle.retirer')) + ' ' + esc(j.nom) + '">×</span>' : '') +
      '</' + (o.bouton ? 'button' : 'span') + '>';
  }
  function dessinerQr(zone, texte) {
    if (!zone) return;
    var dessiner = function () {
      try {
        var q = window.qrcode(0, 'M');
        q.addData(texte); q.make();
        zone.innerHTML = q.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
      } catch (e) { zone.remove(); }
    };
    if (typeof window.qrcode === 'function') return dessiner();
    chargerScript('/js/vendor/qrcode.js', function (err) {
      if (!zone.isConnected) return;
      if (err || typeof window.qrcode !== 'function') return zone.remove();
      dessiner();
    });
  }
  function copier(texte, bouton, libelle) {
    function fait() { bouton.textContent = tx('salle.copie'); setTimeout(function () { bouton.textContent = libelle; }, 2000); }
    if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(texte).then(fait, function () { copieDeSecours(texte); fait(); }); }
    else { copieDeSecours(texte); fait(); }
  }
  function copieDeSecours(texte) {
    var ta = document.createElement('textarea'); ta.value = texte; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) {} document.body.removeChild(ta);
  }
  function rendreSalleMj() {
    var lien = lienPartie(moi.code);
    var libres = sansCouple();
    var pretsAJouer = etat.couples.length >= MIN_COUPLES && !libres.length;
    var note = '';
    if (!pretsAJouer) {
      if (etat.joueurs.length === 2 && etat.couples.length <= 1) note = '<p class="soiree-note">' + esc(tx('salle.unSeul')) + '</p>' + liensSeul();
      else if (etat.couples.length < MIN_COUPLES) note = '<p class="soiree-note">' + esc(tx('salle.manque')) + '</p>';
      else note = '<p class="soiree-note">' + esc(tx('salle.pasAssigne', { n: libres.length })) + '</p>';
    }
    var e = monter(
      '<h2 class="soiree-titre">' + esc(tx('salle.titre')) + '</h2>' +
      '<div class="soiree-code-bloc"><p class="soiree-code-label">' + esc(tx('salle.codeLabel')) + '</p><div class="soiree-code">' + esc(moi.code) + '</div>' +
        '<div class="soiree-qr" data-qr aria-hidden="true"></div>' +
        '<p class="soiree-scan">' + esc(tx('salle.scan')) + '</p>' +
        '<div class="soiree-actions"><button type="button" class="btn btn-outline" data-act="copier">' + esc(tx('salle.copier')) + '</button>' +
        (navigator.share ? '<button type="button" class="btn btn-outline" data-act="envoyer">' + esc(tx('salle.envoyer')) + '</button>' : '') + '</div></div>' +
      '<section class="soiree-section"><h3 class="soiree-section-titre"><span>' + esc(tx('salle.joueurs')) + '</span><span class="soiree-compteur">' + etat.joueurs.length + '/' + MAX_JOUEURS + '</span></h3>' +
        (libres.length ? '<div class="soiree-chips">' + libres.map(function (j) { return chipJoueur(j, { bouton: true, choisi: ui.choisi === j.id, retirer: true }); }).join('') + '</div>' : (etat.joueurs.length ? '' : '<p class="soiree-vide">' + esc(tx('salle.aucun')) + '</p>')) +
        (libres.length && etat.couples.length ? '' : '') +
      '</section>' +
      '<section class="soiree-section"><h3 class="soiree-section-titre"><span>' + esc(tx('salle.couplesTitre')) + '</span></h3><p class="soiree-section-aide">' + esc(tx('salle.couplesAide')) + '</p>' +
        (etat.couples.length ? '<div class="soiree-couples">' + etat.couples.map(function (c, i) {
          return '<div class="soiree-couple" style="' + couleur(i) + '"><span class="soiree-couple-num">' + esc(tx('salle.couple', { n: i + 1 })) + '</span><span class="soiree-couple-noms">' + esc(nomDe(c[0])) + ' &amp; ' + esc(nomDe(c[1])) + '</span><button type="button" class="soiree-petit-btn" data-defaire="' + i + '">' + esc(tx('salle.defaire')) + '</button></div>';
        }).join('') + '</div>' : '') +
        (libres.length >= 2 && etat.couples.length < 5 ? '<div class="soiree-actions"><button type="button" class="btn btn-outline" data-act="auto">' + esc(tx('salle.auto')) + '</button></div>' : '') +
      '</section>' +
      '<section class="soiree-section"><h3 class="soiree-section-titre"><span>' + esc(tx('salle.nb')) + '</span></h3>' +
        '<div class="soiree-nb">' + NB_CHOIX.map(function (n) { return '<button type="button" data-nb="' + n + '" aria-pressed="' + (etat.nb === n ? 'true' : 'false') + '">' + n + '</button>'; }).join('') + '</div>' +
        '<p class="soiree-section-aide">' + esc(tx('salle.nbAide')) + '</p>' +
      '</section>' +
      '<div class="soiree-lancer"><button type="button" class="btn btn-cta btn-gradient" data-act="commencer"' + (pretsAJouer ? '' : ' disabled') + '>' + esc(tx('salle.commencer')) + '</button>' + note + '</div>'
    );
    dessinerQr(e.querySelector('[data-qr]'), lien);
    var bCopier = e.querySelector('[data-act="copier"]');
    bCopier.addEventListener('click', function () { copier(lien, bCopier, tx('salle.copier')); });
    var bEnvoyer = e.querySelector('[data-act="envoyer"]');
    if (bEnvoyer) bEnvoyer.addEventListener('click', function () {
      try { navigator.share({ text: tx('partage.texte', { code: moi.code, lien: lien }) }).catch(function () {}); } catch (err) {}
    });
    e.querySelectorAll('[data-chip]').forEach(function (b) {
      b.addEventListener('click', function (ev) {
        if (ev.target && ev.target.getAttribute('data-retirer')) return;
        var id = b.getAttribute('data-chip');
        if (ui.choisi === id) { ui.choisi = null; rendreApresChoix(); return; }
        if (ui.choisi) { formerCouple(ui.choisi, id); return; }
        ui.choisi = id; rendreApresChoix();
      });
    });
    e.querySelectorAll('[data-retirer]').forEach(function (x) {
      var agir = function (ev) { ev.stopPropagation(); ev.preventDefault(); retirerJoueur(x.getAttribute('data-retirer'), false); };
      x.addEventListener('click', agir);
      x.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') agir(ev); });
    });
    e.querySelectorAll('[data-defaire]').forEach(function (b) { b.addEventListener('click', function () { defaireCouple(Number(b.getAttribute('data-defaire'))); }); });
    var bAuto = e.querySelector('[data-act="auto"]');
    if (bAuto) bAuto.addEventListener('click', formerAuto);
    e.querySelectorAll('[data-nb]').forEach(function (b) { b.addEventListener('click', function () { choisirNb(Number(b.getAttribute('data-nb'))); }); });
    e.querySelector('[data-act="commencer"]').addEventListener('click', commencer);
  }
  function rendreApresChoix() {
    racine.querySelectorAll('[data-chip]').forEach(function (b) { b.classList.toggle('soiree-chip--choisi', b.getAttribute('data-chip') === ui.choisi); });
  }
  function rendreSalleJoueur() {
    var c = coupleDe(moi.id), part = partenaireDe(moi.id);
    var autres = etat.joueurs.filter(function (j) { return j.id !== moi.id; }).map(function (j) { return j.nom; });
    monter(
      '<div class="soiree-attente"><span class="soiree-spinner" aria-hidden="true"></span>' +
      '<h2 class="soiree-titre">' + esc(tx('salle.attente')) + '</h2>' +
      '<p class="soiree-texte">' + esc(tx('salle.attenteTexte', { mj: etat.mj.nom })) + '</p></div>' +
      (c >= 0 ? '<p class="soiree-partenaire" style="' + couleur(c) + '">' + esc(tx('salle.avec', { nom: nomDe(part) })) + '</p>' : '<p class="soiree-note">' + esc(tx('salle.pasEncore')) + '</p>') +
      (autres.length ? '<p class="soiree-note">' + esc(tx('salle.arrives')) + ' ' + esc(autres.join(', ')) + '</p>' : '')
    );
  }
  function blocMj(qc) {
    if (moi.role !== 'mj') return '';
    return '<div class="soiree-mj">' +
      '<p class="soiree-mj-etat" data-mj-etat></p><p class="soiree-mj-manquent" data-manquent></p>' +
      '<div class="soiree-actions"><button type="button" class="btn btn-outline" data-act="reveler"></button><button type="button" class="soiree-lien-retour" data-act="passer">' + esc(tx('partie.passer')) + '</button></div>' +
      '</div>';
  }
  function rendreQuestion() {
    var qc = questionCourante();
    var c = coupleDe(moi.id);
    var joue = c >= 0;
    var repondu = joue && aRepondu(moi.id);
    var maRep = joue ? (reponsesCourantes()[moi.id] !== undefined ? reponsesCourantes()[moi.id] : maReponseLocale[etat.partie + ':' + etat.q]) : undefined;
    var html = entete(qc), options = '';
    if (qc.speciale) {
      html += (joue ? '<p class="soiree-role">' + esc(tx('partie.vote')) + '</p>' : '<p class="soiree-role">' + esc(tx('partie.spectateur')) + '</p>');
      html += '<p class="soiree-q">' + esc(inse(qc.s.q)) + '</p>';
      if (joue) options = etat.couples.map(function (cp, i) {
        return '<button type="button" class="soiree-option soiree-option--couple' + (maRep === i ? ' soiree-option--choisie' : '') + '" data-rep="' + i + '" style="' + couleur(i) + '"' + (repondu ? ' disabled' : '') + '><span class="soiree-option-lettre">' + (i + 1) + '</span><span>' + esc(nomCouple(i)) + '</span></button>';
      }).join('');
    } else {
      var s = indexSujet(etat.q);
      if (joue) {
        var sujet = etat.couples[c][s], part = partenaireDe(moi.id);
        var moiSujet = sujet === moi.id;
        html += '<p class="soiree-role">' + esc(moiSujet ? tx('partie.toi', { nom: nomDe(part) }) : tx('partie.devine', { nom: nomDe(part) })) + '</p>';
        html += '<p class="soiree-q">' + esc(inse(moiSujet ? qc.q.toi : String(qc.q.lui).split('{{nom}}').join(nomDe(part)))) + '</p>';
        options = qc.q.options.map(function (o, i) {
          return '<button type="button" class="soiree-option' + (maRep === i ? ' soiree-option--choisie' : '') + '" data-rep="' + i + '"' + (repondu ? ' disabled' : '') + '><span class="soiree-option-lettre">' + LETTRES[i] + '</span><span>' + esc(o) + '</span></button>';
        }).join('');
      } else {
        html += '<p class="soiree-role">' + esc(tx('partie.spectateur')) + '</p>';
        html += '<p class="soiree-q">' + esc(inse(qc.q.toi)) + '</p>';
        html += '<div class="soiree-options">' + qc.q.options.map(function (o, i) { return '<div class="soiree-option" style="cursor:default"><span class="soiree-option-lettre">' + LETTRES[i] + '</span><span>' + esc(o) + '</span></div>'; }).join('') + '</div>';
      }
    }
    if (options) html += '<div class="soiree-options">' + options + '</div>';
    if (repondu) html += '<p class="soiree-enregistre">' + esc(tx('partie.enregistre')) + '</p><p class="soiree-progression" data-compteur></p>' + (moi.role === 'mj' ? '' : '<p class="soiree-note">' + esc(tx('partie.attenteMj')) + '</p>');
    html += blocMj(qc);
    var e = monter(html);
    if (joue && !repondu) e.querySelectorAll('[data-rep]').forEach(function (b) { b.addEventListener('click', function () { repondre(Number(b.getAttribute('data-rep'))); }); });
    if (moi.role === 'mj') {
      e.querySelector('[data-act="reveler"]').addEventListener('click', reveler);
      e.querySelector('[data-act="passer"]').addEventListener('click', passer);
    }
    rafraichir();
  }
  function texteReponse(qc, r) {
    if (r === null || r === undefined) return tx('revele.sansReponse');
    return qc.speciale ? nomCouple(r) : (qc.q.options[r] || '');
  }
  function blocScores() {
    var ordre = etat.couples.map(function (_, i) { return i; }).sort(function (a, b) { return etat.scores[b] - etat.scores[a]; });
    return '<div class="soiree-scores"><p class="soiree-scores-titre">' + esc(tx('revele.scores')) + '</p>' + ordre.map(function (i) {
      return '<div class="soiree-score" style="' + couleur(i) + '"><span class="soiree-score-pastille" aria-hidden="true"></span><span class="soiree-score-noms">' + esc(nomCouple(i)) + '</span><span class="soiree-score-pts">' + esc(pts(etat.scores[i])) + '</span></div>';
    }).join('') + '</div>';
  }
  function carteCouple(qc, r, moiMeme) {
    var ok = r.ok;
    return '<div class="soiree-rev-carte' + (moiMeme ? ' soiree-rev-carte--moi' : '') + '" style="' + couleur(r.c) + '">' +
      '<div class="soiree-rev-tete"><span>' + esc(nomCouple(r.c)) + '</span><span class="soiree-rev-verdict soiree-rev-verdict--' + (ok ? 'ok' : 'ko') + '">' + (ok ? '✓ ' + esc(tx('revele.accordOui')) : '✗ ' + esc(tx('revele.accordNon'))) + '</span></div>' +
      '<p class="soiree-rev-ligne">' + esc(tx('revele.aRepondu', { nom: nomDe(r.sujet), r: texteReponse(qc, r.rs) })) + '</p>' +
      '<p class="soiree-rev-ligne">' + esc(tx('revele.pensait', { nom: nomDe(r.devin), r: texteReponse(qc, r.rd) })) + '</p>' +
      (r.bonus ? '<p class="soiree-rev-bonus">🔥 ' + esc(tx('revele.serie', { n: r.serie })) + '</p>' : '') +
      '</div>';
  }
  function rendreRevelation() {
    var qc = questionCourante(), rev = etat.rev || {};
    var c = coupleDe(moi.id);
    var html = entete(qc) + '<p class="soiree-q">' + esc(inse(qc.speciale ? qc.s.q : qc.q.toi)) + '</p>';
    if (rev.type === 'a' && Array.isArray(rev.parCouple)) {
      var mien = null, autres = [];
      rev.parCouple.forEach(function (r) { if (r.c === c) mien = r; else autres.push(r); });
      var gagnants = rev.parCouple.filter(function (r) { return r.ok; });
      html += '<div class="soiree-rev">' + (mien ? carteCouple(qc, mien, true) : '') + '</div>';
      html += '<p class="soiree-rev-resume">' + esc(gagnants.length === 0 ? tx('revele.aucun') : (gagnants.length === rev.parCouple.length ? tx('revele.tous') : tx('revele.couplesOk'))) + '</p>';
      html += '<div class="soiree-rev">' + autres.map(function (r) { return carteCouple(qc, r, false); }).join('') + '</div>';
    } else if (rev.type === 's' && Array.isArray(rev.votes)) {
      var max = rev.max || 0;
      html += '<div class="soiree-votes">' + etat.couples.map(function (_, i) {
        var v = Number(rev.votes[i]) || 0;
        return '<div class="soiree-vote" style="' + couleur(i) + '"><span class="soiree-vote-noms">' + esc(nomCouple(i)) + '</span><span class="soiree-vote-n">' + esc(votes(v)) + '</span><span class="soiree-vote-barre" aria-hidden="true"><span style="transform: scaleX(' + (max ? v / max : 0) + ')"></span></span></div>';
      }).join('') + '</div>';
      var g = Array.isArray(rev.gagnants) ? rev.gagnants : [];
      if (!max) html += '<p class="soiree-gagnant">' + esc(tx('revele.aucunVote')) + '</p>';
      else if (g.length === 1) html += '<p class="soiree-gagnant">🏆 ' + esc(tx('revele.gagnant', { couple: nomCouple(g[0]), titre: qc.s.titre })) + '</p>';
      else html += '<p class="soiree-gagnant">' + esc(tx('revele.egalite', { couples: g.map(nomCouple).join(', ') })) + '</p>';
    }
    html += blocScores();
    if (moi.role === 'mj') {
      if (derniereQuestion()) {
        html += '<div class="soiree-derniere"><p class="soiree-derniere-titre">' + esc(tx('revele.derniereTitre')) + '</p><div class="soiree-actions">' +
          (peutProlonger() ? '<button type="button" class="btn btn-outline" data-act="prolonger">' + esc(tx('revele.prolonger', { n: Math.min(PROLONGATION, NB_MAX - etat.ordre.length, restantes(etat.ordre)) })) + '</button>' : '') +
          '<button type="button" class="btn btn-cta btn-gradient" data-act="terminer">' + esc(tx('revele.terminer')) + '</button></div>' +
          (peutProlonger() ? '<p class="soiree-note">' + esc(tx('revele.prolongerAide', { n: restantes(etat.ordre) })) + '</p>' : '') + '</div>';
      } else html += '<div class="soiree-actions soiree-lancer"><button type="button" class="btn btn-cta btn-gradient" data-act="suivant">' + esc(tx('revele.suivant')) + '</button></div>';
    } else html += '<p class="soiree-note">' + esc(derniereQuestion() ? tx('revele.derniereJoueur') : tx('revele.attenteMj')) + '</p>';
    var e = monter(html);
    var bS = e.querySelector('[data-act="suivant"]'); if (bS) bS.addEventListener('click', suivant);
    var bP = e.querySelector('[data-act="prolonger"]'); if (bP) bP.addEventListener('click', prolonger);
    var bT = e.querySelector('[data-act="terminer"]'); if (bT) bT.addEventListener('click', terminer);
  }
  function rendreFin() {
    var ordre = etat.couples.map(function (_, i) { return i; }).sort(function (a, b) { return etat.scores[b] - etat.scores[a] || etat.accords[b] - etat.accords[a]; });
    var total = nbAccords();
    var tete = ordre.filter(function (i) { return etat.scores[i] === etat.scores[ordre[0]]; });
    var titresDe = function (i) { return etat.titres.filter(function (t) { return t.c === i && SPECIALE_PAR_ID[t.s]; }).map(function (t) { return SPECIALE_PAR_ID[t.s].titre; }); };
    var html = '<div class="quiz-result-card soiree-fin">' +
      '<h2 class="soiree-titre">' + esc(tx('fin.titre')) + '</h2>' +
      '<p class="soiree-fin-sous">' + esc(tx('fin.sousTitre', { n: etat.nb, couples: etat.couples.length })) + '</p>' +
      duo('joie', 'joie', 64, 'soiree-duo--petit') +
      '<p class="soiree-gagnant">' + esc(tete.length === 1 ? tx('fin.gagnant', { couple: nomCouple(tete[0]) }) : tx('fin.egalite', { couples: tete.map(nomCouple).join(', ') })) + '</p>' +
      '<div class="soiree-podium">' + ordre.map(function (i, rang) {
        var titres = titresDe(i);
        return '<div class="soiree-rang soiree-rang--' + (rang + 1) + '" style="' + couleur(i) + '">' +
          '<span class="soiree-rang-medaille" aria-hidden="true">' + (MEDAILLES[rang] || (rang + 1) + '.') + '</span>' +
          '<span class="soiree-rang-noms">' + esc(nomCouple(i)) + '</span>' +
          '<span class="soiree-rang-pts">' + esc(pts(etat.scores[i])) + '</span>' +
          '<span class="soiree-rang-detail">' + esc(tx('fin.accords', { n: etat.accords[i], total: total })) + ' · ' + esc(tx('fin.serieMax', { n: etat.meilleures[i] })) + '</span>' +
          '<span class="soiree-rang-titres">' + (titres.length ? titres.map(function (t) { return '<span class="soiree-titre-badge">🏆 ' + esc(t) + '</span>'; }).join('') : '<span class="soiree-rang-detail">' + esc(tx('fin.aucunTitre')) + '</span>') + '</span>' +
          '</div>';
      }).join('') + '</div>' +
      '</div>' +
      '<div class="soiree-fin-actions soiree-actions">' +
        (moi.role === 'mj' ? '<button type="button" class="btn btn-cta btn-gradient" data-act="rejouer">' + esc(tx('fin.rejouer')) + '</button>' : '') +
        '<button type="button" class="btn btn-outline" data-act="nouvelle">' + esc(tx('fin.nouvelle')) + '</button>' +
      '</div>' + (moi.role === 'mj' ? '' : '<p class="soiree-note">' + esc(tx('fin.attenteRejouer')) + '</p>');
    var e = monter(html);
    var bR = e.querySelector('[data-act="rejouer"]'); if (bR) bR.addEventListener('click', rejouer);
    e.querySelector('[data-act="nouvelle"]').addEventListener('click', function () {
      if (moi.role === 'mj') confirmer(tx('bandeau.annulerTexte'), annuler); else quitter();
    });
  }

  // ── Le départ ───────────────────────────────────────────────────────────
  function reprendre(session) {
    moi = session;
    if (moi.role === 'mj') {
      var s = etatValide(lireEtatMj(moi.code));
      if (!s || s.mj.id !== moi.id) { effacerSession(); ecranAccueil(); return; }
      etat = s;
      ecranConnexion();
      ouvrirCanal(function (err) {
        if (err) { ecranMessage(tx('rejoindre.erreurReseau'), function () { location.reload(); }); return; }
        publier();
      });
    } else {
      ecranConnexion();
      ouvrirCanal(function (err) {
        if (err) { effacerSession(); ecranMessage(tx('rejoindre.erreurReseau'), function () { location.reload(); }); return; }
        envoyerRejoindre();
      });
    }
  }
  function demarrer() {
    var m = location.hash.match(/soiree=([A-Za-z0-9]{6})/);
    var codeDuLien = m ? m[1].toUpperCase() : '';
    var session = lireSession();
    if (session && (!codeDuLien || codeDuLien === session.code)) { reprendre(session); return; }
    if (codeDuLien) { ecranRejoindre(codeDuLien); return; }
    ecranAccueil();
  }
  window.addEventListener('pagehide', function () { if (canal && moi && moi.role === 'mj' && etat) ecrireEtatMj(etat); });
  // Pour les essais dans Chromium : une copie de l'état, jamais l'original.
  window.__QCSoireeEtat = function () { try { return JSON.parse(JSON.stringify({ moi: moi, etat: etat, connecte: connecte, accepte: accepte, cle: ui.cle })); } catch (e) { return null; } };
  demarrer();
})();
