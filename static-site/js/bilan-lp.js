/* La page de vente de l'évaluation de couple (pages/bilan-couple.ejs) : la
   barre d'appel collée en bas sur téléphone, qui apparaît dès que le haut
   de page est sorti de l'écran, le nombre des personnes qui ont déjà
   répondu, qui monte à l'arrivée, et la démonstration de trois questions. Le
   curseur des pages du rapport est celui de l'accueil (quiz-slider.js), les
   apparitions au défilement celles du site (scroll-reveal.js), et le radar
   du haut de page n'est que du CSS. L'application elle-même est bilan.js. */
(function () {
  'use strict';
  var lp = document.querySelector('.blp');
  if (!lp) return;

  // La barre collée : visible tant que ni le haut de page ni le dernier
  // appel (qui ont leurs propres boutons) ne sont à l'écran.
  var colle = document.getElementById('blp-colle');
  var bornes = [lp.querySelector('.blp-hero'), lp.querySelector('.blp-final')].filter(Boolean);
  if (colle && bornes.length && 'IntersectionObserver' in window) {
    var visibles = {};
    var obs = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) { visibles[e.target.className] = e.isIntersecting; });
      colle.hidden = Object.keys(visibles).some(function (k) { return visibles[k]; });
    }, { threshold: 0 });
    bornes.forEach(function (b) { obs.observe(b); });
  }

  // Les personnes qui ont déjà répondu (la section sous le haut de page) :
  // le nombre monte jusqu'à sa valeur quand il arrive à l'écran, une seule
  // fois. Sans IntersectionObserver ou avec prefers-reduced-motion, le
  // nombre écrit par la construction reste tel quel. La largeur finale est
  // lue avant d'écrire quoi que ce soit, pour que la phrase ne bouge pas.
  var chiffre = lp.querySelector('.blp-personnes-chiffre[data-compte]');
  var calme = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cible = chiffre ? parseInt(chiffre.getAttribute('data-compte'), 10) : 0;
  if (chiffre && cible > 0 && !calme && 'IntersectionObserver' in window && window.requestAnimationFrame) {
    var format = null;
    try { format = new Intl.NumberFormat(document.documentElement.lang || undefined); } catch (e) { format = null; }
    var ecrit = function (v) { chiffre.textContent = format ? format.format(v) : String(v); };
    var vu = new IntersectionObserver(function (entrees) {
      if (!entrees.some(function (e) { return e.isIntersecting; })) return;
      vu.disconnect();
      var largeur = chiffre.getBoundingClientRect().width;
      chiffre.style.minWidth = largeur + 'px';
      var debut = null;
      var DUREE = 1400;
      var pas = function (t) {
        if (debut === null) debut = t;
        var x = Math.min(1, (t - debut) / DUREE);
        ecrit(Math.round(cible * (1 - Math.pow(1 - x, 3))));
        if (x < 1) window.requestAnimationFrame(pas);
      };
      ecrit(0);
      window.requestAnimationFrame(pas);
    }, { threshold: 0.6 });
    vu.observe(chiffre);
  }

  // La démonstration : répondre marque la réponse et montre ce que le
  // rapport en ferait (la place de l'autre, et pourquoi ça compte).
  lp.addEventListener('click', function (e) {
    var b = e.target.closest('[data-demo-option]');
    if (!b) return;
    var carte = b.closest('.blp-dq');
    if (!carte) return;
    carte.querySelectorAll('[data-demo-option]').forEach(function (o) {
      var oui = o === b;
      o.classList.toggle('choisie', oui);
      o.setAttribute('aria-pressed', String(oui));
    });
    var vous = carte.querySelector('[data-demo-vous]');
    if (vous) vous.textContent = b.textContent.trim();
    carte.classList.add('repondu');
  });
})();
