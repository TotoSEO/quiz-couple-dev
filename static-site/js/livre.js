/* La page du livre « 100 aventures à deux » (templates/pages/livre-quiz-couple.ejs) :
   la page avant et après l'aventure, les pages à feuilleter, la visionneuse,
   la barre collée du téléphone, et la mesure : les visites, d'où elles
   viennent, les clics vers Amazon et ce que les gens regardent (table
   livre_evenements, onglet Livre de l'admin), plus l'événement Google
   Analytics « livre_amazon » avec l'emplacement du bouton. Les ventes se
   lisent dans le tableau de bord du Partenariat Amazon. */
(function () {
  'use strict';
  var racine = document.querySelector('[data-livre]');
  if (!racine) return;
  var reduit = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  // ── La mesure (14 novembre 2026, Thomas : « rajoute du tracking sur la
  // page du livre. Nombre de clics sur la page, sur le bouton Amazon et
  // d'autres trucs que tu trouves pertinents ») ──
  // Une ligne par geste dans livre_evenements (migration 20261114150000),
  // écrite par audience.js (QCAudience.ecrit, requête simple) avec le numéro
  // de visite de la page vue et les mêmes exclusions : robots, navigateurs
  // pilotés, le propriétaire du site. Un clic vers Amazon compte à chaque
  // fois ; les autres gestes une fois par page chargée. audience.js est
  // chargé après ce fichier (les scripts différés suivent l'ordre du
  // document, et celui-ci est dans la page) : on le lit au moment d'écrire.
  var idVisite = null;
  var deja = {};
  function mesure(evenement, detail, chaqueFois) {
    var A = window.QCAudience;
    if (!A || typeof A.ecrit !== 'function') return;
    try { if (A.ignorer()) return; } catch (err) { return; }
    var cle = evenement + '|' + (detail || '');
    if (!chaqueFois && deja[cle]) return;
    if (!idVisite) idVisite = A.visite();
    if (!idVisite) return;
    deja[cle] = true;
    try {
      A.ecrit('livre_evenements', {
        visite_id: idVisite,
        evenement: evenement,
        detail: detail ? String(detail).slice(0, 120) : null,
        lang: document.documentElement.lang || 'fr'
      }).catch(function () {});
    } catch (err) { /* la mesure ne bloque jamais la page */ }
  }

  // D'où vient la visite : le bouton du livre dans le menu, dans le menu du
  // téléphone ou dans le pied de page (audience.js garde le clic dans
  // qc-livre-clic, lu ici une fois puis effacé), sinon la page du site d'où
  // l'on vient, sinon le site (Google, Instagram...), sinon « direct ». Jamais
  // l'adresse complète d'un autre site, seulement son nom.
  function provenance() {
    try {
      var m = JSON.parse(window.localStorage.getItem('qc-livre-clic') || 'null');
      window.localStorage.removeItem('qc-livre-clic');
      if (m && typeof m.s === 'string' && /^[a-z-]{1,20}$/.test(m.s) && Date.now() - m.t < 10 * 60 * 1000) return m.s;
    } catch (err) { /* stockage fermé : on lit le référent */ }
    var r = document.referrer;
    if (!r) return 'direct';
    try {
      var u = new URL(r);
      var h = (u.hostname || '').replace(/^www\./, '');
      if (h === (location.hostname || '').replace(/^www\./, '')) {
        var p = (u.pathname || '/').toLowerCase();
        if (p.charAt(p.length - 1) !== '/') p += '/';
        return 'page:' + p.slice(0, 110);
      }
      if (/google\./.test(h)) return 'google';
      if (/(^|\.)bing\.com$/.test(h)) return 'bing';
      if (/(^|\.)instagram\.com$/.test(h)) return 'instagram';
      if (/(^|\.)(facebook\.com|fb\.com|fb\.me|messenger\.com)$/.test(h)) return 'facebook';
      if (/(^|\.)pinterest\./.test(h)) return 'pinterest';
      if (/(^|\.)(amazon\.|amzn\.)/.test(h)) return 'amazon';
      return h.slice(0, 100) || 'direct';
    } catch (err) { return 'direct'; }
  }
  var source = provenance();

  // Une page chargée sans être vue (onglet d'arrière-plan, préchargement)
  // n'est pas une visite : comme audience.js, on attend qu'elle s'affiche.
  function quandVisible(fn) {
    var lancer = function () {
      if (document.visibilityState !== 'hidden') { fn(); return; }
      document.addEventListener('visibilitychange', function une() {
        if (document.visibilityState === 'hidden') return;
        document.removeEventListener('visibilitychange', une);
        fn();
      });
    };
    if (document.prerendering) document.addEventListener('prerenderingchange', lancer, { once: true });
    else lancer();
  }
  // Après les scripts différés : audience.js a alors posé le numéro de visite.
  function quandPret(fn) {
    var fait = false;
    var une = function () { if (!fait) { fait = true; fn(); } };
    if (document.readyState === 'complete') { une(); return; }
    document.addEventListener('DOMContentLoaded', une, { once: true });
    window.addEventListener('load', une, { once: true });
  }

  // Les parties de la page arrivées à l'écran : le haut de la partie passe
  // aux deux tiers de la hauteur de l'écran.
  var SECTIONS = [
    ['.lv-principe', 'principe'], ['.lv-dixans', 'dix-ans'], ['.lv-feuilleter', 'feuilleter'],
    ['.lv-budget', 'budget'], ['.lv-cadeau', 'cadeau'], ['.lv-faq', 'questions'], ['.lv-fin', 'fin']
  ];
  function suivreSections() {
    if (!('IntersectionObserver' in window)) return;
    var obs = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (en) {
        if (!en.isIntersecting) return;
        obs.unobserve(en.target);
        mesure('section', en.target.getAttribute('data-lv-mesure'));
      });
    }, { rootMargin: '0px 0px -35% 0px' });
    SECTIONS.forEach(function (s) {
      var el = racine.querySelector(s[0]);
      if (!el) return;
      el.setAttribute('data-lv-mesure', s[1]);
      obs.observe(el);
    });
  }
  quandPret(function () {
    quandVisible(function () {
      mesure('vue', source);
      suivreSections();
    });
  });

  // Le lien « Feuilleter le livre » du haut, et les questions ouvertes.
  racine.addEventListener('click', function (e) {
    if (!e.target.closest) return;
    if (e.target.closest('.lv-feuilleter-lien')) { mesure('feuilleter'); return; }
    var resume = e.target.closest('.lv-faq summary');
    if (resume && resume.parentNode && !resume.parentNode.open) {
      mesure('faq', (resume.textContent || '').replace(/[\u00a0\u202f]/g, ' ').replace(/\s+/g, ' ').trim());
    }
  });

  // ── Les clics vers Amazon ──
  function compterClic(e) {
    if (e.type === 'auxclick' && e.button !== 1) return;
    var a = e.target.closest ? e.target.closest('[data-livre-src]') : null;
    if (!a) return;
    var ou = a.getAttribute('data-livre-src');
    mesure('amazon', ou, true);
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'livre_amazon', { emplacement: ou });
      }
    } catch (err) { /* la mesure ne bloque jamais le lien */ }
  }
  racine.addEventListener('click', compterClic);
  racine.addEventListener('auxclick', compterClic);

  // ── La page avant et après : on fait glisser la ligne ──
  var avap = racine.querySelector('[data-avap]');
  if (avap) {
    var cadre = avap.querySelector('.lv-avap-cadre');
    var curseur = avap.querySelector('.lv-avap-curseur');
    var touche = false;
    var poser = function (v) {
      var p = Math.max(0, Math.min(100, v));
      cadre.style.setProperty('--pos', p.toFixed(1) + '%');
      curseur.value = String(Math.round(p));
    };
    // Le clavier passe par le curseur (invisible, mais il reçoit le focus).
    curseur.addEventListener('input', function () { touche = true; mesure('avap'); poser(+curseur.value); });

    // La souris et le doigt passent par le cadre : un glissé de côté déplace
    // la ligne, un glissé vers le haut ou le bas fait défiler la page.
    var glisse = null;
    var depuisX = function (x) { poser((x - glisse.gauche) / glisse.largeur * 100); };
    cadre.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      touche = true;
      mesure('avap');
      var r = cadre.getBoundingClientRect();
      glisse = { id: e.pointerId, x0: e.clientX, y0: e.clientY, gauche: r.left, largeur: r.width || 1, actif: e.pointerType === 'mouse' };
      if (glisse.actif) {
        try { cadre.setPointerCapture(e.pointerId); } catch (err) { /* rien */ }
        depuisX(e.clientX);
        e.preventDefault();
      }
    });
    cadre.addEventListener('pointermove', function (e) {
      if (!glisse || e.pointerId !== glisse.id) return;
      if (!glisse.actif) {
        var dx = Math.abs(e.clientX - glisse.x0);
        var dy = Math.abs(e.clientY - glisse.y0);
        if (dx < 6 && dy < 6) return;
        if (dy > dx) { glisse = null; return; }
        glisse.actif = true;
        try { cadre.setPointerCapture(e.pointerId); } catch (err) { /* rien */ }
      }
      depuisX(e.clientX);
    });
    cadre.addEventListener('pointerup', function (e) {
      // Un simple toucher pose la ligne là où l'on a touché.
      if (glisse && !glisse.actif && e.pointerId === glisse.id) depuisX(e.clientX);
      glisse = null;
    });
    cadre.addEventListener('pointercancel', function () { glisse = null; });

    // Un aller-retour quand la page arrive à l'écran, pour montrer qu'elle glisse.
    if (!reduit && 'IntersectionObserver' in window) {
      var montrer = function () {
        if (touche) return;
        var debut = null;
        var duree = 1800;
        var pas = function (t) {
          if (touche) return;
          if (debut === null) debut = t;
          var p = Math.min(1, (t - debut) / duree);
          poser(50 - 24 * Math.sin(p * Math.PI * 2));
          if (p < 1) requestAnimationFrame(pas);
        };
        requestAnimationFrame(pas);
      };
      var vu = new IntersectionObserver(function (entrees) {
        if (!entrees.some(function (en) { return en.isIntersecting; })) return;
        vu.disconnect();
        setTimeout(montrer, 450);
      }, { threshold: 0.6 });
      vu.observe(cadre);
    }
  }

  // ── Les pages à feuilleter ──
  var piste = racine.querySelector('[data-car-piste]');
  if (piste) {
    var fleches = Array.prototype.slice.call(racine.querySelectorAll('[data-car]'));
    var majFleches = function () {
      var max = piste.scrollWidth - piste.clientWidth;
      var x = piste.scrollLeft;
      fleches.forEach(function (b) {
        b.disabled = +b.getAttribute('data-car') < 0 ? x <= 2 : x >= max - 2;
      });
    };
    // Feuilleté de côté : par les flèches, ou au doigt, à la souris, au
    // clavier (un défilement qui ne vient pas de la personne, comme celui que
    // le navigateur rétablit au rechargement, ne compte pas).
    var pisteTouchee = false;
    ['pointerdown', 'touchstart', 'wheel', 'keydown'].forEach(function (type) {
      piste.addEventListener(type, function () { pisteTouchee = true; }, { passive: true });
    });
    var attente = 0;
    piste.addEventListener('scroll', function () {
      if (pisteTouchee && piste.scrollLeft > 40) mesure('carrousel');
      if (!attente) attente = requestAnimationFrame(function () { attente = 0; majFleches(); });
    }, { passive: true });
    fleches.forEach(function (b) {
      b.addEventListener('click', function () {
        mesure('carrousel');
        var item = piste.querySelector('.lv-car-item');
        var ecart = parseFloat(getComputedStyle(piste).columnGap) || 0;
        var pas = item ? item.getBoundingClientRect().width + ecart : piste.clientWidth * 0.8;
        var visibles = Math.max(1, Math.floor((piste.clientWidth + ecart + 1) / pas));
        piste.scrollBy({ left: +b.getAttribute('data-car') * pas * visibles, behavior: reduit ? 'auto' : 'smooth' });
      });
    });
    majFleches();
    window.addEventListener('resize', majFleches);
  }

  // ── La visionneuse ──
  var dlg = racine.querySelector('[data-lv-vue]');
  var vues = {};
  try { vues = JSON.parse(document.getElementById('lv-vues').textContent) || {}; } catch (err) { vues = {}; }
  if (dlg) {
    var image = dlg.querySelector('[data-vue-img]');
    var legende = dlg.querySelector('[data-vue-leg]');
    var compte = dlg.querySelector('[data-vue-compte]');
    var nav = dlg.querySelector('.lv-vue-nav');
    var prec = dlg.querySelector('[data-vue-pas="-1"]');
    var suiv = dlg.querySelector('[data-vue-pas="1"]');
    var groupe = null;
    var rang = 0;
    var ouvreur = null;
    var afficher = function () {
      var g = vues[groupe] || [];
      var p = g[rang];
      if (!p) return;
      image.src = p.src;
      image.alt = p.alt || '';
      legende.textContent = p.leg || '';
      compte.textContent = (rang + 1) + ' ' + (compte.getAttribute('data-sur') || '/') + ' ' + g.length;
      nav.hidden = g.length < 2;
      prec.disabled = rang <= 0;
      suiv.disabled = rang >= g.length - 1;
      // Chaque page du livre ouverte en grand, par son nom d'image.
      if (groupe === 'pages') mesure('page', (String(p.src).match(/\/([^\/]+?)-\d+\.webp$/) || [])[1] || String(rang + 1));
      [rang - 1, rang + 1].forEach(function (k) { if (g[k]) { var im = new Image(); im.src = g[k].src; } });
    };
    var avancer = function (sens) {
      var g = vues[groupe] || [];
      var k = rang + sens;
      if (k < 0 || k >= g.length) return;
      rang = k;
      afficher();
    };
    var ouvrir = function (nom, k, bouton) {
      var g = vues[nom];
      if (!g || !g[k]) return;
      if (nom === 'liste') mesure('liste');
      if (typeof dlg.showModal !== 'function') { window.open(g[k].src, '_blank', 'noopener'); return; }
      groupe = nom;
      rang = k;
      ouvreur = bouton;
      afficher();
      document.documentElement.classList.add('lv-vue-ouverte');
      if (!dlg.open) dlg.showModal();
    };
    racine.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-vue]') : null;
      if (!b) return;
      e.preventDefault();
      ouvrir(b.getAttribute('data-vue'), +b.getAttribute('data-vue-i') || 0, b);
    });
    dlg.addEventListener('click', function (e) {
      if (e.target === dlg) { dlg.close(); return; }
      var pasBtn = e.target.closest('[data-vue-pas]');
      if (pasBtn) { avancer(+pasBtn.getAttribute('data-vue-pas')); return; }
      if (e.target.closest('[data-vue-fermer]')) dlg.close();
    });
    dlg.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { avancer(1); e.preventDefault(); }
      else if (e.key === 'ArrowLeft') { avancer(-1); e.preventDefault(); }
    });
    // Le doigt : un glissé de côté sur la page passe à la suivante.
    var depart = null;
    image.addEventListener('pointerdown', function (e) { depart = { x: e.clientX, y: e.clientY }; });
    image.addEventListener('pointerup', function (e) {
      if (!depart) return;
      var dx = e.clientX - depart.x;
      var dy = e.clientY - depart.y;
      depart = null;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) avancer(dx < 0 ? 1 : -1);
    });
    image.addEventListener('pointercancel', function () { depart = null; });
    dlg.addEventListener('close', function () {
      document.documentElement.classList.remove('lv-vue-ouverte');
      if (ouvreur && typeof ouvreur.focus === 'function') {
        try { ouvreur.focus({ preventScroll: true }); } catch (err) { ouvreur.focus(); }
      }
      ouvreur = null;
    });
  }

  // ── La barre collée du téléphone ──
  // Elle apparaît quand le bouton du haut est passé, et s'efface dès qu'un
  // autre bouton « Voir sur Amazon » est à l'écran ou que le dernier appel
  // est atteint. Les deux repères sont observés avec une marge immense d'un
  // côté : l'état change quand le bord du repère franchit le bord de l'écran,
  // même quand la page saute d'un coup par-dessus (une ancre, le retour en
  // haut), ce qu'une observation ordinaire laisserait passer.
  var barre = racine.querySelector('[data-lv-barre]');
  var hautAchat = racine.querySelector('.lv-hero .lv-achat');
  var fin = racine.querySelector('[data-lv-fin]');
  if (barre && hautAchat && fin && 'IntersectionObserver' in window) {
    var hautPasse = false;
    var finAtteinte = false;
    var boutonsVus = new Set();
    var majBarre = function () {
      var visible = hautPasse && !finAtteinte && boutonsVus.size === 0;
      barre.classList.toggle('est-visible', visible);
      // La barre apparue, une fois par page (elle n'existe que sous 1 024 px).
      if (visible && getComputedStyle(barre).display !== 'none') mesure('barre');
    };
    // Le bouton du haut est « passé » quand son bas est au-dessus de l'écran.
    new IntersectionObserver(function (entrees) {
      entrees.forEach(function (en) { hautPasse = !en.isIntersecting; });
      majBarre();
    }, { rootMargin: '0px 0px 100000px 0px' }).observe(hautAchat);
    // Le dernier appel est « atteint » dès que son haut entre par le bas de l'écran.
    new IntersectionObserver(function (entrees) {
      entrees.forEach(function (en) { finAtteinte = en.isIntersecting; });
      majBarre();
    }, { rootMargin: '100000px 0px 0px 0px' }).observe(fin);
    var obsBoutons = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (en) {
        if (en.isIntersecting) boutonsVus.add(en.target);
        else boutonsVus.delete(en.target);
      });
      majBarre();
    });
    Array.prototype.forEach.call(racine.querySelectorAll('.lv-amazon'), function (a) {
      if (!barre.contains(a) && !hautAchat.contains(a)) obsBoutons.observe(a);
    });
  }
})();
