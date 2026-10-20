/* La page de vente de l'évaluation de couple (pages/bilan-couple.ejs) : la
   barre d'appel collée en bas sur téléphone, qui apparaît dès que le haut
   de page est sorti de l'écran, et la démonstration de trois questions. Le
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
