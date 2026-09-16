/**
 * Home dynamic bits:
 *  - Cumulative "quiz & tests réalisés" counter (baseline + live get_quiz_total)
 *  - Most-played community quizzes teaser
 * Reads Supabase creds from #reviews-config (already on the home page).
 * Degrades silently if Supabase is unreachable.
 */
(function () {
  'use strict';
  var cfg = document.getElementById('reviews-config');
  var SB_URL = cfg && cfg.dataset.url, SB_KEY = cfg && cfg.dataset.key;
  var lang = document.documentElement.lang || 'fr';
  var locale = { fr: 'fr-FR', en: 'en-US', es: 'es-ES', de: 'de-DE', it: 'it-IT' }[lang] || 'fr-FR';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // ── Cumulative counter ─────────────────────────────────────────────
  // Le chiffre est affiche a deux endroits (le hero et la preuve sociale du
  // dernier bloc) : on met a jour toutes les cibles d'un coup plutot que le
  // seul element porteur de l'id.
  var counterEls = [].slice.call(document.querySelectorAll('[data-total-counter]'));
  var counterEl = counterEls[0] || document.getElementById('home-total-counter');
  if (counterEl) {
    if (!counterEls.length) counterEls = [counterEl];
    var baseline = parseInt(counterEl.dataset.baseline, 10) || 0;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var setCounter = function (n) {
      var txt = Number(n).toLocaleString(locale);
      for (var i = 0; i < counterEls.length; i++) counterEls[i].textContent = txt;
    };
    var animateTo = function (target) {
      if (reduce || target <= 0) { setCounter(target); return; }
      var start = Math.max(0, Math.round(target * 0.8)), t0 = null, dur = 1400;
      var frame = function (ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min(1, (ts - t0) / dur);
        var e = 1 - Math.pow(1 - p, 3);
        setCounter(Math.round(start + (target - start) * e));
        if (p < 1) requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    };
    setCounter(baseline);
    if (SB_URL && SB_KEY) {
      fetch(SB_URL + '/rest/v1/rpc/get_quiz_total', {
        method: 'POST',
        headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY, 'Content-Type': 'application/json' },
        body: '{}'
      }).then(function (r) { return r.json(); }).then(function (v) {
        var n = Array.isArray(v) ? (v[0] && (v[0].get_quiz_total != null ? v[0].get_quiz_total : v[0])) : v;
        animateTo(baseline + (Number(n) || 0));
      }).catch(function () { animateTo(baseline); });
    } else {
      animateTo(baseline);
    }
  }

})();
