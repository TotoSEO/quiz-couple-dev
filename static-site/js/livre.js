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

  // ── Le livre à feuilleter (14 novembre 2026, Thomas : « que le livre on
  // puisse le feuilleter, avec une animation ultra bien faite avec les pages
  // qui se tournent [...] Avec le livre qui se feuillette tout seul à
  // intervalle régulier jusqu'à ce que la personne appuie dessus ») ──
  // page-flip (js/vendor/page-flip.js : StPageFlip, licence MIT, retouché,
  // voir docs/livre/page-flip.md) dessine les pages qui tournent. Il est
  // chargé quand la partie approche de l'écran ; d'ici là, et sans lui, on
  // voit la couverture. Ses gestes à lui sont coupés (useMouseEvents: false) :
  // on les lui passe d'ici, pour qu'un geste vertical fasse toujours défiler
  // la page et que la lecture automatique s'arrête au premier appui, au
  // premier glissé de côté, aux flèches ou au clavier, jamais quand on fait
  // seulement défiler la page par-dessus le livre.
  // Une fonction à part : ses variables ne se mêlent pas à celles de la
  // visionneuse, plus bas (les var d'un bloc appartiennent à toute la fonction).
  var flip = racine.querySelector('[data-flip]');
  var livreFlip = flip ? flip.querySelector('[data-flip-livre]') : null;
  if (flip && livreFlip) (function () {
    var feuilles = Array.prototype.slice.call(livreFlip.querySelectorAll('.lv-feuille'));
    var sansBlanc = feuilles.filter(function (f) { return !f.hasAttribute('data-blanc'); });
    var legende = flip.querySelector('[data-flip-leg]');
    var btnPrec = flip.querySelector('[data-flip-pas="-1"]');
    var btnSuiv = flip.querySelector('[data-flip-pas="1"]');
    var btnAuto = flip.querySelector('[data-flip-auto]');
    var btnGrand = flip.querySelector('[data-flip-grand]');
    var texteFlip = racine.querySelector('[data-flip-texte]');
    // Le livre passe en portrait (une page) sous deux fois MIN_PAGE de large :
    // la même borne que la requête de conteneur de livreQuizCouple.css.
    var MIN_PAGE = 290;
    var DELAI_OUVERTURE = 1300; // la couverture, avant la première page
    var DELAI_PAGE = 2700;      // le temps de regarder chaque double page
    var DELAI_FIN = 3000;       // la quatrième de couverture, avant de revenir au début
    var pf = null;              // le livre de page-flip
    var jeu = feuilles;         // les pages données au livre (sans les blanches en portrait)
    var portrait = false;
    var auto = !reduit;         // la lecture automatique
    var aLaMain = false;        // la personne a pris la main au moins une fois
    var minuterie = 0;
    var visible = false;        // le livre est à l'écran (plus de la moitié)
    var premiereFois = true;
    var origine = null;         // 'auto' ou 'main' : qui a tourné la page qui se termine
    var geste = null;
    var charge = false;
    var AVANT = 0;              // FlipDirection.FORWARD de page-flip
    var pageAffichee = null;    // la page qu'on regarde, gardée quand l'écran change de largeur

    if (reduit && texteFlip && texteFlip.getAttribute('data-fixe')) texteFlip.textContent = texteFlip.getAttribute('data-fixe');

    var index = function () { return pf ? pf.getCurrentPageIndex() : 0; };
    var dernier = function () { return jeu.length - 1; };
    // Ce que le livre montre : la double page, ou la page seule (couverture,
    // dos, portrait).
    var pagesVues = function () {
      var i = index();
      if (portrait || i === 0 || i === dernier()) return [jeu[i]].filter(Boolean);
      return [jeu[i], jeu[i + 1]].filter(Boolean);
    };
    var texteLegende = function () {
      var vues = pagesVues();
      if (!vues.length) return '';
      // Une double page dit ce qu'elle montre ; à côté d'une page blanche, la page seule.
      if (vues.length === 2) return vues[0].getAttribute('data-double') || vues[1].getAttribute('data-leg') || vues[0].getAttribute('data-leg') || '';
      return vues[0].getAttribute('data-leg') || '';
    };
    // Les images arrivent à mesure : la double page affichée et les deux
    // suivantes (lazy jusque-là, puis eager), décodées avant d'être tournées.
    var charger = function (f) {
      var img = f ? f.querySelector('img') : null;
      if (!img || img.getAttribute('data-pret')) return;
      img.setAttribute('data-pret', '1');
      img.loading = 'eager';
      if (img.decode) img.decode().catch(function () { /* l'image arrivera quand même */ });
    };
    var prechargerAutour = function () {
      var i = index();
      for (var k = Math.max(0, i - 2); k <= Math.min(dernier(), i + (portrait ? 3 : 5)); k++) charger(jeu[k]);
    };
    var majBoutonAuto = function () {
      if (!btnAuto) return;
      btnAuto.setAttribute('data-etat', auto ? 'lecture' : 'pause');
      var lab = btnAuto.querySelector('span');
      if (lab) lab.textContent = btnAuto.getAttribute(auto ? 'data-pause' : 'data-lire') || '';
    };
    var majEtat = function () {
      var i = index();
      flip.classList.toggle('est-ferme', !portrait && i === 0);
      flip.classList.toggle('est-fin', !portrait && i === dernier() && i > 0);
      btnPrec.disabled = i <= 0;
      btnSuiv.disabled = i >= dernier();
      var t = texteLegende();
      if (legende.textContent !== t) {
        legende.textContent = t;
        if (!reduit && legende.animate) legende.animate([{ opacity: 0, transform: 'translate3d(0, 5px, 0)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: 'ease-out' });
      }
      // « Voir en grand » ouvre la page affichée (la première qui n'est pas blanche).
      var vue = pagesVues().filter(function (f) { return f.hasAttribute('data-vue-i'); })[0];
      if (vue && btnGrand) btnGrand.setAttribute('data-vue-i', vue.getAttribute('data-vue-i'));
      prechargerAutour();
    };

    // ── La lecture automatique ──
    var arreterMinuterie = function () { clearTimeout(minuterie); minuterie = 0; };
    var planifier = function (delai) {
      arreterMinuterie();
      if (!auto || !visible || !pf || document.visibilityState === 'hidden') return;
      minuterie = setTimeout(pasAuto, delai);
    };
    var tourner = function (sens) {
      if (!pf) return;
      var i = index();
      if ((sens > 0 && i >= dernier()) || (sens < 0 && i <= 0)) return;
      if (reduit) {
        // Sans mouvement : la page change d'un coup.
        if (sens > 0) pf.turnToNextPage(); else pf.turnToPrevPage();
        if (auto) planifier(DELAI_PAGE);
        return;
      }
      if (sens > 0) pf.flipNext('bottom'); else pf.flipPrev('bottom');
    };
    // À la fin, le livre disparaît en fondu, revient à la couverture et repart.
    var rembobiner = function () {
      mesure('carrousel', 'auto');
      flip.classList.add('est-retour');
      setTimeout(function () {
        origine = null;
        pf.turnToPage(0);
        majEtat();
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            flip.classList.remove('est-retour');
            planifier(DELAI_OUVERTURE);
          });
        });
      }, 380);
    };
    var pasAuto = function () {
      minuterie = 0;
      if (!auto || !visible || !pf) return;
      if (pf.getState() !== 'read' || geste) { planifier(500); return; }
      if (index() >= dernier()) { rembobiner(); return; }
      origine = 'auto';
      tourner(1);
    };
    // La personne prend la main : plus de lecture automatique (le bouton la relance).
    var prendreLaMain = function () {
      if (auto) { auto = false; arreterMinuterie(); majBoutonAuto(); }
      if (!aLaMain) { aLaMain = true; legende.setAttribute('aria-live', 'polite'); }
    };

    // Fermé, le livre est décalé pour que la couverture soit au centre : il
    // glisse en même temps que la couverture s'ouvre ou se referme.
    var glisserPendantLeTour = function () {
      if (portrait) return;
      var i = index();
      var avant = pf.getRender().getDirection() === AVANT;
      if (avant && i === 0) flip.classList.remove('est-ferme');
      if (!avant && i <= 2) flip.classList.toggle('est-ferme', true);
      if (avant && i + 2 >= dernier()) flip.classList.add('est-fin');
      if (!avant && i === dernier()) flip.classList.remove('est-fin');
    };

    // La page qu'on regarde : la première page non blanche affichée. Elle ne
    // se note qu'une fois la page tournée : quand l'écran change de largeur,
    // page-flip réaffiche d'abord la double page qui contient l'index courant
    // (ce qui ferait reculer d'une page).
    var noterPage = function () {
      var v = pagesVues().filter(function (f) { return !f.hasAttribute('data-blanc'); })[0];
      if (v) pageAffichee = v;
    };
    var orientationEnCours = function () { return (pf.getOrientation() === 'portrait') !== portrait; };
    // En portrait, les deux pages blanches n'ont rien à faire seules : le
    // livre les saute, et les reprend en paysage.
    var majJeu = function () {
      if (!pf) return;
      var voulu = portrait ? sansBlanc : feuilles;
      if (voulu === jeu) return;
      var courante = pageAffichee && jeu.indexOf(pageAffichee) >= 0 ? pageAffichee : jeu[index()];
      if (courante && courante.hasAttribute('data-blanc')) {
        var k = jeu.indexOf(courante);
        courante = jeu[k + 1] && !jeu[k + 1].hasAttribute('data-blanc') ? jeu[k + 1] : jeu[k - 1];
      }
      origine = null;
      jeu = voulu;
      pf.updateFromHtml(jeu);
      var n = Math.max(0, jeu.indexOf(courante));
      pf.turnToPage(n);
      majEtat();
    };
    var orienter = function (o) {
      portrait = o === 'portrait';
      flip.classList.toggle('est-portrait', portrait);
      flip.classList.toggle('est-paysage', !portrait);
    };

    var echec = function () {
      flip.classList.add('est-echec');
      btnPrec.hidden = true;
      btnSuiv.hidden = true;
      if (btnAuto) btnAuto.hidden = true;
    };
    var lancer = function () {
      var St = window.St;
      if (!St || typeof St.PageFlip !== 'function') { echec(); return; }
      // Le premier jeu de pages selon la largeur, comme page-flip la mesurera.
      portrait = livreFlip.offsetWidth < MIN_PAGE * 2;
      jeu = portrait ? sansBlanc : feuilles;
      try {
        pf = new St.PageFlip(livreFlip, {
          width: 500, height: 500, size: 'stretch',
          minWidth: MIN_PAGE, maxWidth: 600, minHeight: MIN_PAGE, maxHeight: 1200,
          showCover: true, usePortrait: true, autoSize: true,
          drawShadow: true, maxShadowOpacity: 0.55, flippingTime: 1150,
          useMouseEvents: false, showPageCorners: true, startPage: 0
        });
        pf.on('changeOrientation', function (ev) {
          var avant = portrait;
          orienter(ev.data);
          if (avant !== portrait) setTimeout(majJeu, 0);
          majEtat();
        });
        pf.on('flip', function () {
          // L'écran change de largeur : changeOrientation suit, et majJeu replace la page.
          if (orientationEnCours()) return;
          majEtat();
          noterPage();
          if (origine === 'main') {
            mesure('carrousel');
            if (index() >= dernier()) mesure('carrousel', 'fin');
          }
        });
        pf.on('changeState', function (ev) {
          if (ev.data === 'flipping') glisserPendantLeTour();
          if (ev.data === 'read') {
            majEtat();
            if (auto) planifier(index() >= dernier() ? DELAI_FIN : DELAI_PAGE);
          }
        });
        orienter(portrait ? 'portrait' : 'landscape');
        pf.loadFromHTML(jeu);
      } catch (err) {
        pf = null;
        echec();
        return;
      }
      flip.classList.add('est-pret');
      if (btnAuto) { btnAuto.hidden = false; majBoutonAuto(); }
      majEtat();
      noterPage();
      if (visible) planifier(DELAI_OUVERTURE);
    };
    var chargerEtLancer = function () {
      if (charge) return;
      charge = true;
      charger(feuilles[0]);
      var sc = document.createElement('script');
      sc.src = '/js/vendor/page-flip.js' + (window.__QCV ? '?v=' + window.__QCV : '');
      sc.async = true;
      sc.onload = lancer;
      sc.onerror = echec;
      document.head.appendChild(sc);
    };

    // Chargé à l'approche ; la lecture ne tourne que livre à l'écran et onglet affiché.
    if ('IntersectionObserver' in window) {
      var proche = new IntersectionObserver(function (entrees) {
        if (!entrees.some(function (en) { return en.isIntersecting; })) return;
        proche.disconnect();
        chargerEtLancer();
      }, { rootMargin: '900px 0px' });
      proche.observe(flip);
      new IntersectionObserver(function (entrees) {
        entrees.forEach(function (en) { visible = en.isIntersecting; });
        if (!visible) { arreterMinuterie(); return; }
        if (pf && auto && !minuterie && pf.getState() === 'read') planifier(premiereFois ? DELAI_OUVERTURE : 900);
        premiereFois = false;
      }, { threshold: 0.55 }).observe(livreFlip);
    } else {
      visible = true;
      chargerEtLancer();
    }
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') arreterMinuterie();
      else if (pf && auto && !minuterie && pf.getState() === 'read') planifier(900);
    });

    // ── Les gestes : on les donne à page-flip ──
    var bloc = function () { return pf.getUI().getDistElement(); };
    var posDans = function (e, r) {
      r = r || bloc().getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    livreFlip.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (!pf) {
        // Avant le livre : on le charge tout de suite, et l'appui compte.
        if (flip.classList.contains('est-echec')) { if (btnGrand) btnGrand.click(); return; }
        auto = false;
        chargerEtLancer();
        return;
      }
      var etaitAuto = auto;
      arreterMinuterie();
      if (pf.getState() === 'flipping') { if (e.pointerType === 'mouse') prendreLaMain(); return; }
      geste = { id: e.pointerId, souris: e.pointerType === 'mouse', x0: e.clientX, y0: e.clientY, rect: bloc().getBoundingClientRect(), pris: false, bouge: false, premier: etaitAuto, pts: [{ x: e.clientX, t: e.timeStamp }] };
      geste.p0 = posDans(e, geste.rect);
      if (geste.souris) {
        // La souris attrape la page tout de suite.
        prendreLaMain();
        geste.pris = true;
        pf.startUserTouch(geste.p0);
        try { livreFlip.setPointerCapture(e.pointerId); } catch (err) { /* rien */ }
        // preventDefault retient aussi le focus : on le donne, pour les flèches du clavier.
        e.preventDefault();
        try { livreFlip.focus({ preventScroll: true }); } catch (err) { /* rien */ }
      }
    });
    livreFlip.addEventListener('pointermove', function (e) {
      if (!pf) return;
      if (!geste) {
        // Survolé à la souris, une fois la main prise : le coin se replie.
        if (e.pointerType === 'mouse' && e.buttons === 0 && !auto && pf.getState() !== 'flipping') pf.userMove(posDans(e), false);
        return;
      }
      if (e.pointerId !== geste.id) return;
      geste.pts.push({ x: e.clientX, t: e.timeStamp });
      if (geste.pts.length > 6) geste.pts.shift();
      if (!geste.pris) {
        var dx = Math.abs(e.clientX - geste.x0);
        var dy = Math.abs(e.clientY - geste.y0);
        if (dx < 8 && dy < 8) return;
        // Vers le haut ou le bas, c'est la page qui défile.
        if (dy > dx) { geste = null; if (auto) planifier(DELAI_PAGE); return; }
        prendreLaMain();
        geste.pris = true;
        pf.startUserTouch(geste.p0);
        try { livreFlip.setPointerCapture(e.pointerId); } catch (err) { /* rien */ }
      }
      if (!geste.bouge) { geste.bouge = true; origine = 'main'; flip.classList.add('est-glisse'); }
      pf.userMove(posDans(e, geste.rect), true);
    });
    var finGeste = function (e, annule) {
      if (!geste || e.pointerId !== geste.id) return;
      var g = geste;
      geste = null;
      flip.classList.remove('est-glisse');
      try { livreFlip.releasePointerCapture(g.id); } catch (err) { /* rien */ }
      var p = posDans(e, g.rect);
      if (annule) {
        // Sans glissé, isSwipe à vrai : le geste se termine sans tourner la page.
        if (g.pris) pf.userStop(p, !g.bouge, false);
        if (auto) planifier(DELAI_PAGE);
        return;
      }
      if (!g.bouge) {
        // Un appui sans glisser. Le premier, pendant la lecture automatique,
        // ne fait que l'arrêter : on regarde la double page affichée.
        prendreLaMain();
        if (g.premier) { if (g.pris) pf.userStop(p, true); return; }
        origine = 'main';
        if (reduit) {
          if (g.pris) pf.userStop(p, true);
          var r = pf.getBoundsRect();
          var milieu = portrait ? r.left + r.pageWidth * 1.4 : r.left + r.width / 2;
          tourner(p.x < milieu ? -1 : 1);
          return;
        }
        if (!g.pris) pf.startUserTouch(p);
        pf.userStop(p);
        return;
      }
      // Un glissé : la page finit de tourner dès que le doigt a parcouru le
      // tiers d'une page dans le bon sens, ou qu'il part vite dans ce sens ;
      // elle revient s'il repart vite en arrière. Sinon, page-flip décide
      // (le coin a-t-il passé la reliure ?).
      var sens = pf.getRender().getDirection() === AVANT ? -1 : 1;
      var a = g.pts[0];
      var b = g.pts[g.pts.length - 1];
      var vitesse = b.t > a.t ? sens * (b.x - a.x) / (b.t - a.t) : 0;
      var trajet = sens * (p.x - g.p0.x);
      var tournerVers;
      if (vitesse < -0.3) tournerVers = false;
      else if (vitesse > 0.3 || trajet > pf.getBoundsRect().pageWidth * 0.3) tournerVers = true;
      pf.userStop(p, false, tournerVers);
    };
    livreFlip.addEventListener('pointerup', function (e) { finGeste(e, false); });
    livreFlip.addEventListener('pointercancel', function (e) { finGeste(e, true); });
    livreFlip.addEventListener('pointerleave', function (e) {
      // La souris sort : le coin replié se remet en place.
      if (pf && !geste && e.pointerType === 'mouse' && !auto) pf.userMove({ x: -9999, y: -9999 }, false);
    });
    livreFlip.addEventListener('keydown', function (e) {
      if (!pf || (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft')) return;
      e.preventDefault();
      prendreLaMain();
      origine = 'main';
      tourner(e.key === 'ArrowRight' ? 1 : -1);
    });
    [btnPrec, btnSuiv].forEach(function (b) {
      b.addEventListener('click', function () {
        if (!pf) return;
        prendreLaMain();
        origine = 'main';
        tourner(+b.getAttribute('data-flip-pas'));
      });
    });
    if (btnAuto) {
      btnAuto.addEventListener('click', function () {
        auto = !auto;
        majBoutonAuto();
        if (auto) planifier(index() >= dernier() ? 600 : 700);
        else arreterMinuterie();
      });
    }
    // « Voir en grand » ouvre la visionneuse plus bas (data-vue="livre") :
    // la lecture automatique s'arrête.
    if (btnGrand) btnGrand.addEventListener('click', prendreLaMain);
  })();

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
      if (groupe === 'livre') mesure('page', (String(p.src).match(/\/([^\/]+?)-\d+\.webp$/) || [])[1] || String(rang + 1));
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
