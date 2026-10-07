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

  // ── Dernières publications Instagram ─────────────────────────────
  // Nos propres affiches (bucket public social-public, déposées au rendu),
  // pas le script d'Instagram : rien de tiers, rien à consentir, et le rendu
  // est le nôtre. La section reste masquée tant qu'il n'y a rien à montrer.
  var igSection = document.getElementById('instagram-recents');
  if (igSection && SB_URL) {
    var igGrille = igSection.querySelector('.ig-grille');
    var igTexte = { fr: 'Voir sur Instagram', en: 'View on Instagram', es: 'Ver en Instagram', de: 'Auf Instagram ansehen', it: 'Guarda su Instagram' }[lang] || 'View on Instagram';
    var igIcone = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>';
    var igCarte = function (p) {
      var image = SB_URL + '/storage/v1/object/public/social-public/' + p.affiche;
      var son = p.son_titre ? '\u266a ' + esc(p.son_titre) + (p.son_artiste ? ' \u00b7 ' + esc(p.son_artiste) : '') : '';
      return '<a class="ig-carte" href="' + esc(p.permalien) + '" target="_blank" rel="noopener" aria-label="' + esc(igTexte) + '">' +
        '<img src="' + esc(image) + '" alt="' + esc(p.legende || '') + '" loading="lazy" decoding="async" width="540" height="960">' +
        '<span class="ig-tag">' + igIcone + (p.format === 'reel' ? 'Reel' : 'Post') + '</span>' +
        (p.legende ? '<span class="ig-legende">' + esc(p.legende) + '</span>' : '') +
        (son ? '<span class="ig-son">' + son + '</span>' : '') +
        '</a>';
    };
    fetch(SB_URL + '/rest/v1/rpc/get_instagram_recents', {
      method: 'POST',
      headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_limit: 3 })
    })
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (posts) {
        if (!Array.isArray(posts) || !posts.length || !igGrille) return;
        igGrille.innerHTML = posts.map(igCarte).join('');
        igSection.style.display = '';
      })
      .catch(function () { /* sans Supabase, la section reste masquée */ });
  }
})();
