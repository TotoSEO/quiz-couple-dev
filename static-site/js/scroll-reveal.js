/**
 * Scroll-reveal: fade/slide elements with .animate-on-scroll into view.
 * Safe by design — only acts when html.js-reveal is set (added in <head> before
 * paint, and only when motion is allowed). If JS is off or the user prefers
 * reduced motion, the gate class is absent, the CSS never hides anything, and
 * this script no-ops. A timeout safety net also guarantees content is never
 * left hidden if the observer ever misbehaves.
 */
(function () {
  'use strict';
  var root = document.documentElement;
  if (!root.classList.contains('js-reveal')) return;
  var els = [].slice.call(document.querySelectorAll('.animate-on-scroll'));
  if (!els.length) return;

  function revealAll() {
    for (var i = 0; i < els.length; i++) els[i].classList.add('visible');
  }

  if (!('IntersectionObserver' in window)) { revealAll(); return; }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  els.forEach(function (e) { io.observe(e); });

  // Safety net: never leave content hidden.
  setTimeout(revealAll, 4000);
})();
