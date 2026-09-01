/**
 * Mesure d'audience première partie.
 *
 * Google Analytics ne rapporte qu'une moitié du trafic réel : les bloqueurs
 * de pistage l'interceptent au niveau réseau, le mode consentement ne compte
 * rien tant que le bandeau n'a pas été accepté, et il se charge sur l'évènement
 * « load », donc après toutes les images, ce qui rate les visites courtes.
 *
 * Ce fichier fait l'inverse : il parle au domaine du site, aucun bloqueur ne
 * le connaît, il part dès que le HTML est analysé, et il n'a besoin d'aucun
 * consentement parce qu'il ne collecte rien de personnel.
 *
 * ── Pourquoi il n'y a pas de bandeau à cliquer ─────────────────────────────
 * La CNIL exempte la mesure d'audience du consentement quand elle sert
 * uniquement à produire des statistiques anonymes pour le site lui-même. Les
 * conditions sont respectées ici par construction :
 *
 *   - l'identifiant de visite est tiré au hasard et meurt après trente
 *     minutes d'inactivité. Quelqu'un qui revient demain repart avec un
 *     nouveau numéro, et rien ne permet de rapprocher les deux visites ;
 *   - aucune adresse IP, aucune empreinte de navigateur, rien de nominatif ;
 *   - rien ne sort du site, rien n'est recoupé avec quoi que ce soit ;
 *   - la base ne rend que des agrégats, personne ne peut la lire ligne à
 *     ligne.
 *
 * Conséquence assumée : on compte des VISITES, pas des personnes. Quelqu'un
 * qui revient trois fois dans la semaine, ce sont trois visites. C'est le
 * prix de l'anonymat, et c'est la bonne unité pour lire du trafic.
 *
 * ── Ce qui n'est volontairement pas compté ────────────────────────────────
 * Les robots, les pages préchargées par le navigateur, la page
 * d'administration, et le propriétaire du site quand il a demandé à être
 * exclu. Chacun de ces cas fausse les chiffres dans le même sens : il gonfle
 * le trafic sans qu'il y ait de visiteur derrière.
 */
(function () {
  'use strict';

  var URL_SB = 'https://lojvajnnvhatfplevyvy.supabase.co';
  var KEY_SB = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvanZham5udmhhdGZwbGV2eXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNzk3NDIsImV4cCI6MjA4Nzg1NTc0Mn0.gdd9HRbRvfQr6io9jGN6hUCW6tBOtognhwbsTJtSTng';

  var CLE_VISITE = 'qc-visite';
  var CLE_EXCLU  = 'qc-no-track';
  var INACTIVITE = 30 * 60 * 1000;      // même définition que GA : 30 min
  var DUREE_MAX  = 6 * 60 * 60 * 1000;  // un onglet laissé ouvert n'est pas une visite de douze heures

  // ── Stockage ────────────────────────────────────────────────────────────
  // localStorage d'abord : il est partagé entre les onglets, donc ouvrir un
  // test dans un nouvel onglet reste la même visite. En navigation privée ou
  // quand le navigateur bloque le stockage, il lève une exception : on
  // retombe sur sessionStorage, puis sur un objet en mémoire. Le dernier
  // recours dégrade la mesure (chaque page devient une visite) mais ne la
  // casse pas et ne fait jamais planter la page.
  var memoire = {};
  function coffre() {
    try {
      if (window.localStorage) { window.localStorage.getItem(CLE_VISITE); return window.localStorage; }
    } catch (e) {}
    try {
      if (window.sessionStorage) { window.sessionStorage.getItem(CLE_VISITE); return window.sessionStorage; }
    } catch (e) {}
    return {
      getItem: function (k) { return Object.prototype.hasOwnProperty.call(memoire, k) ? memoire[k] : null; },
      setItem: function (k, v) { memoire[k] = String(v); },
      removeItem: function (k) { delete memoire[k]; }
    };
  }
  var st = coffre();

  function lis(k) { try { return st.getItem(k); } catch (e) { return null; } }
  function ecris(k, v) { try { st.setItem(k, v); } catch (e) {} }
  function efface(k) { try { st.removeItem(k); } catch (e) {} }

  // ── Exclusion personnelle ───────────────────────────────────────────────
  // Le propriétaire passe beaucoup de temps sur son propre site : sans ça, il
  // est le premier visiteur de ses statistiques. Le drapeau se pose tout seul
  // à la connexion au tableau de bord, et à la main sur n'importe quel
  // appareil avec ?qc-notrack=1 dans l'adresse (?qc-notrack=0 pour l'enlever).
  var demande = (location.search || '').match(/[?&]qc-notrack=([01])/);
  if (demande) {
    if (demande[1] === '1') ecris(CLE_EXCLU, '1'); else efface(CLE_EXCLU);
  }
  function exclu() { return lis(CLE_EXCLU) === '1'; }

  // ── Identifiant de visite ───────────────────────────────────────────────
  // { id, debut, dernier }. Il est renouvelé après trente minutes sans page
  // vue, ou au bout de six heures quoi qu'il arrive. Jamais reconduit d'une
  // visite à la suivante : c'est ce qui rend la mesure anonyme.
  function tirage() {
    var s = '';
    try {
      var t = new Uint8Array(16);
      (window.crypto || window.msCrypto).getRandomValues(t);
      for (var i = 0; i < t.length; i++) s += ('0' + t[i].toString(16)).slice(-2);
      return s;
    } catch (e) {
      for (var j = 0; j < 32; j++) s += '0123456789abcdef'.charAt(Math.floor(Math.random() * 16));
      return s;
    }
  }

  function visite(rafraichir) {
    var now = Date.now();
    var v = null;
    try { v = JSON.parse(lis(CLE_VISITE) || 'null'); } catch (e) { v = null; }
    var valide = v && v.id && typeof v.dernier === 'number' &&
                 (now - v.dernier) < INACTIVITE &&
                 (now - (v.debut || v.dernier)) < DUREE_MAX;
    if (!valide) v = { id: tirage(), debut: now, dernier: now };
    if (rafraichir !== false) {
      v.dernier = now;
      ecris(CLE_VISITE, JSON.stringify(v));
    }
    return v.id;
  }

  // Lu par quiz-extras.js : un lancement et une partie terminée doivent
  // porter le même numéro de visite que la page vue, sinon l'entonnoir
  // rapproche des inconnus.
  window.QCAudience = {
    visite: function () { return exclu() ? null : visite(false); },
    exclu: exclu,
    // Lu par blog-lectures.js : le robot et le proprietaire du site n'ont pas
    // a peupler le compteur de lectures. Dupliquer la liste des robots
    // ailleurs, c'est se garantir deux listes qui divergent.
    ignorer: function () { return ignorer(); },
    exclure: function (oui) { if (oui) ecris(CLE_EXCLU, '1'); else efface(CLE_EXCLU); },
    // Lu par resultat-url.js. Une partie se joue du debut a la fin sans
    // changer de page : l'ecran de resultat, qui est le moment le plus
    // regarde de la visite, ne comptait pour rien. Il s'enregistre desormais
    // sous son propre chemin, avec le meme numero de visite, et les memes
    // exclusions s'appliquent puisque c'est le meme envoi.
    pageVue: function (cheminVoulu) { envoie(cheminVoulu); }
  };

  // ── Ce qu'on ne compte pas ──────────────────────────────────────────────
  var ROBOTS = /bot|crawl|spider|slurp|headless|phantom|puppeteer|playwright|lighthouse|pagespeed|gtmetrix|pingdom|uptime|monitor|preview|scrape|curl|wget|python-requests|axios|node-fetch|facebookexternalhit|embedly|quora link preview|whatsapp|telegram|discord|slackbot/i;

  function ignorer() {
    if (exclu()) return true;
    if (navigator.webdriver) return true;
    if (ROBOTS.test(navigator.userAgent || '')) return true;
    // Le tableau de bord n'est pas du trafic, et l'iframe d'une régie
    // publicitaire ou d'un aperçu n'est pas une visite.
    if (/^\/admin\/?$/.test(location.pathname || '')) return true;
    try { if (window.top !== window.self) return true; } catch (e) { return true; }
    return false;
  }

  // ── Le chemin, normalisé ────────────────────────────────────────────────
  // Sans normalisation, /Test-Couple, /test-couple et /test-couple/ font trois
  // lignes différentes dans le rapport pour une seule page. La requête et
  // l'ancre sont déjà exclues : location.pathname ne les contient pas.
  //
  // La normalisation est isolée parce qu'un chemin peut aussi arriver du
  // dehors : l'écran de résultat s'enregistre sous /test-x/resultat/, un
  // chemin qui n'existe pas comme page mais qui doit se ranger dans le
  // tableau de bord exactement comme les autres.
  function normalise(p) {
    p = String(p || '/').toLowerCase();
    if (p.charAt(0) !== '/') p = '/' + p;
    if (p.charAt(p.length - 1) !== '/') p += '/';
    return p.length > 200 ? p.slice(0, 200) : p;
  }

  function chemin() { return normalise(location.pathname); }

  // ── D'où vient la visite ────────────────────────────────────────────────
  // Le nom d'hôte seulement, jamais l'URL complète : celle d'un moteur de
  // recherche peut contenir la requête tapée, donc parfois quelque chose de
  // personnel. « interne » désigne une page du site, ce qui n'arrive en
  // première page que lorsqu'une visite reprend après trente minutes de
  // pause.
  // Un lien envoye par WhatsApp, par SMS ou par Messenger arrive sans referent,
  // exactement comme une adresse tapee a la main : les deux se retrouvaient
  // melangees sous « direct ». Le bouton de partage marque desormais le lien
  // qu'il met dans le message, et ce marqueur les separe.
  //
  // Il ne l'emporte que faute de referent : un lien partage puis colle dans
  // un message Facebook arrive avec facebook.com en referent, et c'est cette
  // provenance-la qui est la plus utile a lire.
  function marquePartage() {
    try { return new URLSearchParams(location.search).has('part'); }
    catch (e) { return (location.search || '').indexOf('part') !== -1; }
  }

  function source() {
    var r = document.referrer;
    if (!r) return marquePartage() ? 'partage' : 'direct';
    try {
      var h = new URL(r).hostname.replace(/^www\./, '');
      if (h === (location.hostname || '').replace(/^www\./, '')) return 'interne';
      return h.slice(0, 100);
    } catch (e) { return marquePartage() ? 'partage' : 'direct'; }
  }

  // ── Envoi ───────────────────────────────────────────────────────────────
  // keepalive : la requête doit survivre à un départ immédiat de la page,
  // sinon les visites les plus courtes, justement celles qu'on cherche à
  // mesurer, se perdent en chemin.
  function envoie(cheminVoulu) {
    if (ignorer()) return;
    var pq = document.getElementById('pq-reviews');
    var corps = {
      visite_id: visite(),
      path: cheminVoulu ? normalise(cheminVoulu) : chemin(),
      route_key: (pq && pq.dataset.quizSlug) || null,
      lang: document.documentElement.lang || 'fr',
      source: source()
    };
    try {
      fetch(URL_SB + '/rest/v1/page_views', {
        method: 'POST',
        keepalive: true,
        headers: {
          'apikey': KEY_SB,
          'Authorization': 'Bearer ' + KEY_SB,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(corps)
      }).catch(function () {});
    } catch (e) {}
  }

  // ── Clics sur « Ajouter Quiz Couple à mes sources préférées » ───────────
  // Ce qu'on mesure ici, c'est l'intention, jamais le résultat. Le bouton
  // ouvre l'outil de Google, où il reste une confirmation à donner, sur une
  // page qui ne nous appartient pas. Google ne renvoie rien : ni retour
  // JavaScript, ni rapport dans la Search Console, ni API. Personne ne peut
  // savoir combien de gens sont allés jusqu'au bout, et ce compteur ne doit
  // jamais être lu comme un nombre d'abonnés.
  //
  // Reste que le chiffre sert : il dit si l'encart intéresse quelqu'un, et
  // lequel des deux emplacements travaille le mieux.
  function clicSourcePref(e) {
    var lien = e.target && e.target.closest ? e.target.closest('.gsource-btn') : null;
    if (!lien) return;
    if (ignorer()) return;
    var corps = {
      visite_id: visite(false),
      emplacement: lien.getAttribute('data-emplacement') || 'pied',
      lang: document.documentElement.lang || 'fr',
      path: chemin()
    };
    try {
      fetch(URL_SB + '/rest/v1/source_pref_clics', {
        method: 'POST',
        keepalive: true,
        headers: {
          'apikey': KEY_SB,
          'Authorization': 'Bearer ' + KEY_SB,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(corps)
      }).catch(function () {});
    } catch (e2) {}
  }
  document.addEventListener('click', clicSourcePref, true);

  // ── Départ ──────────────────────────────────────────────────────────────
  // Chrome précharge les liens qu'il juge probables. Compter un préchargement
  // inventerait des visites qui n'ont jamais eu lieu : on attend que la page
  // soit réellement affichée.
  if (document.prerendering) {
    document.addEventListener('prerenderingchange', envoie, { once: true });
  } else if (document.visibilityState === 'prerender') {
    document.addEventListener('visibilitychange', function once() {
      if (document.visibilityState !== 'prerender') {
        document.removeEventListener('visibilitychange', once);
        envoie();
      }
    });
  } else {
    envoie();
  }
})();
