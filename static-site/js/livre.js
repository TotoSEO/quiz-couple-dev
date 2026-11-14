/* La page du livre « 100 aventures à deux » (templates/pages/livre-quiz-couple.ejs) :
   la page avant et après l'aventure, les pages à feuilleter, la visionneuse,
   la barre collée du téléphone et le compte des clics vers Amazon (Google
   Analytics, événement « livre_amazon » avec l'emplacement du bouton). Les
   ventes et les clics se lisent aussi dans le tableau de bord du Partenariat
   Amazon. */
(function () {
  'use strict';
  var racine = document.querySelector('[data-livre]');
  if (!racine) return;
  var reduit = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  // ── Les clics vers Amazon ──
  function compterClic(e) {
    if (e.type === 'auxclick' && e.button !== 1) return;
    var a = e.target.closest ? e.target.closest('[data-livre-src]') : null;
    if (!a) return;
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'livre_amazon', { emplacement: a.getAttribute('data-livre-src') });
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
    curseur.addEventListener('input', function () { touche = true; poser(+curseur.value); });

    // La souris et le doigt passent par le cadre : un glissé de côté déplace
    // la ligne, un glissé vers le haut ou le bas fait défiler la page.
    var glisse = null;
    var depuisX = function (x) { poser((x - glisse.gauche) / glisse.largeur * 100); };
    cadre.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      touche = true;
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
    var attente = 0;
    piste.addEventListener('scroll', function () {
      if (!attente) attente = requestAnimationFrame(function () { attente = 0; majFleches(); });
    }, { passive: true });
    fleches.forEach(function (b) {
      b.addEventListener('click', function () {
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
      barre.classList.toggle('est-visible', hautPasse && !finAtteinte && boutonsVus.size === 0);
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
