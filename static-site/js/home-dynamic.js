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
  var counterEl = document.getElementById('home-total-counter');
  if (counterEl) {
    var baseline = parseInt(counterEl.dataset.baseline, 10) || 0;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var setCounter = function (n) { counterEl.textContent = Number(n).toLocaleString(locale); };
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

  // ── Most-played community quizzes ──────────────────────────────────
  var pop = document.getElementById('home-popular-quizzes');
  if (pop && SB_URL && SB_KEY) {
    var base = pop.dataset.quizBase || '';
    var d = pop.dataset;
    var emoji = { points: '🎯', truefalse: '✅', fun: '🎉', wyr: '🤔' };
    var typeLabel = {
      points: d.labelPoints || 'Quiz', truefalse: d.labelTruefalse || 'Quiz',
      fun: d.labelFun || 'Fun', wyr: d.labelWyr || 'Quiz'
    };
    var rankMedal = ['🥇', '🥈', '🥉'];
    var qWord = d.labelQuestions || 'questions';
    var playWord = d.labelPlay || 'Jouer';
    // Compact badge: keep only the first segment before a "/" ("Fun / sans score" → "Fun")
    var shortLabel = function (t) { return String(t).split('/')[0].trim(); };
    var arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" '
      + 'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>';

    fetch(SB_URL + '/functions/v1/manage-custom-quiz', {
      method: 'POST',
      headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'list_public', lang: lang })
    }).then(function (r) { return r.json(); }).then(function (res) {
      var list = (res && res.quizzes) || [];
      list.sort(function (a, b) { return (b.plays || 0) - (a.plays || 0); });
      list = list.slice(0, 3);
      if (!list.length) return;
      var grid = pop.querySelector('.home-popular-grid');
      grid.innerHTML = list.map(function (q, i) {
        var type = q.quiz_type || 'points';
        var href = base + (base.indexOf('?') >= 0 ? '&' : '?') + 'q=' + encodeURIComponent(q.share_id);
        var plays = Number(q.plays) || 0;
        var qc = Number(q.question_count) || 0;
        var desc = q.description
          ? '<span class="home-pop-desc">' + esc(q.description) + '</span>' : '';
        var qcStat = qc
          ? '<span class="home-pop-stat"><span class="home-pop-stat-ico">📝</span>' + qc + ' ' + esc(qWord) + '</span>' : '';
        return '<a class="home-pop-card home-pop-card--' + esc(type) + '" href="' + href + '" style="--pop-i:' + i + '">'
          + '<span class="home-pop-rank" aria-hidden="true">' + rankMedal[i] + '</span>'
          + '<span class="home-pop-ico" aria-hidden="true">' + (emoji[type] || '🎯') + '</span>'
          + '<span class="home-pop-badge">' + esc(shortLabel(typeLabel[type] || type)) + '</span>'
          + '<span class="home-pop-name">' + esc(q.title) + '</span>'
          + desc
          + '<span class="home-pop-foot">'
          +   '<span class="home-pop-stats">' + qcStat
          +     '<span class="home-pop-stat home-pop-plays"><span class="home-pop-stat-ico">🔥</span>' + plays.toLocaleString(locale) + '</span>'
          +   '</span>'
          +   '<span class="home-pop-go">' + esc(playWord) + arrow + '</span>'
          + '</span>'
          + '</a>';
      }).join('');
      pop.hidden = false;
    }).catch(function () {});
  }
})();
