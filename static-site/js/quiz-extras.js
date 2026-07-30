/**
 * Quiz extras : compteur "realise X fois" (bulle sous le fil d'Ariane),
 * suivi des completions, et bloc avis par quiz (liste + formulaire).
 * Degrade proprement si Supabase est injoignable.
 */
(function () {
  'use strict';

  var cfg = document.getElementById('reviews-config');
  if (!cfg) return;
  var URL = cfg.dataset.url, KEY = cfg.dataset.key;
  if (!URL || !KEY) return;

  var lang = document.documentElement.lang || 'fr';
  var H = { apikey: KEY, 'Authorization': 'Bearer ' + KEY };
  var HJ = { apikey: KEY, 'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json' };

  var UI = {
    fr: { more: "Plus que votre / vos prénom(s), et c'est en ligne !", name: 'Votre prénom (ou vos prénoms)', comment: 'Un mot sur votre expérience (optionnel)', submit: 'Publier mon avis', thanks: 'Merci ! Votre avis sera visible après validation.', err: 'Une erreur est survenue, réessayez.', none: 'Soyez les premiers à donner votre avis !', based: 'avis', doneTest: 'Ce test a déjà été réalisé {n} fois', doneQuiz: 'Ce quiz a déjà été joué {n} fois' },
    en: { more: 'Just your first name(s), and it goes live!', name: 'Your first name(s)', comment: 'A word about your experience (optional)', submit: 'Post my review', thanks: 'Thanks! Your review will show after moderation.', err: 'Something went wrong, please retry.', none: 'Be the first to leave a review!', based: 'reviews', doneTest: 'This test has been taken {n} times', doneQuiz: 'This quiz has been played {n} times' },
    es: { more: '¡Solo tu(s) nombre(s) y se publica!', name: 'Tu nombre (o nombres)', comment: 'Unas palabras sobre tu experiencia (opcional)', submit: 'Publicar mi opinión', thanks: '¡Gracias! Tu opinión se verá tras la validación.', err: 'Ha ocurrido un error, inténtalo de nuevo.', none: '¡Sé el primero en opinar!', based: 'opiniones', doneTest: 'Este test se ha realizado {n} veces', doneQuiz: 'Este quiz se ha jugado {n} veces' },
    de: { more: 'Nur noch dein(e) Vorname(n), dann ist sie online!', name: 'Dein Vorname (oder Vornamen)', comment: 'Ein Wort zu deiner Erfahrung (optional)', submit: 'Bewertung veröffentlichen', thanks: 'Danke! Deine Bewertung erscheint nach der Prüfung.', err: 'Ein Fehler ist aufgetreten, bitte erneut versuchen.', none: 'Sei der Erste mit einer Bewertung!', based: 'Bewertungen', doneTest: 'Dieser Test wurde {n} mal gemacht', doneQuiz: 'Dieses Quiz wurde {n} mal gespielt' },
    it: { more: 'Solo il tuo/i vostri nome(i) e va online!', name: 'Il tuo nome (o i vostri nomi)', comment: 'Una parola sulla tua esperienza (facoltativo)', submit: 'Pubblica la mia recensione', thanks: 'Grazie! La recensione sarà visibile dopo la moderazione.', err: 'Si è verificato un errore, riprova.', none: 'Sii il primo a lasciare una recensione!', based: 'recensioni', doneTest: 'Questo test è stato fatto {n} volte', doneQuiz: 'Questo quiz è stato giocato {n} volte' }
  };
  var t = UI[lang] || UI.fr;
  function fmt(n) { try { return Number(n).toLocaleString(lang); } catch (e) { return '' + n; } }
  function esc(s) { return s ? String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') : ''; }
  function stars(r) { var h = ''; for (var i = 1; i <= 5; i++) h += '<svg viewBox="0 0 24 24" class="pqx-star ' + (i <= r ? 'on' : '') + '"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'; return h; }

  // ── Bulle "realise X fois" juste sous le fil d'Ariane ──
  function countBubble(slug) {
    var bc = document.querySelector('.breadcrumb');
    if (!bc || document.getElementById('quiz-count-bubble')) return;
    var isQuiz = /^quiz/i.test(slug);
    var bubble = document.createElement('div');
    bubble.id = 'quiz-count-bubble';
    bubble.className = 'quiz-count-bubble';
    bubble.style.display = 'none';
    bubble.innerHTML = '<span class="qcb-dot"></span><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21s-7-4-9.5-8.5C.8 9 2.5 5.5 6 5.5c2 0 3.2 1.2 4 2.4C10.8 6.7 12 5.5 14 5.5c3.5 0 5.2 3.5 3.5 7C19.5 17 12 21 12 21z"/></svg><span class="qcb-text"></span>';
    bc.parentNode.insertBefore(bubble, bc.nextSibling);
    fetch(URL + '/rest/v1/rpc/get_quiz_counts', { method: 'POST', headers: HJ, body: '{}' })
      .then(function (r) { return r.json(); })
      .then(function (rows) {
        if (!Array.isArray(rows)) return;
        var row = rows.filter(function (x) { return x.quiz_slug === slug; })[0];
        var n = row ? +row.total : 0;
        if (n > 0) { bubble.querySelector('.qcb-text').textContent = (isQuiz ? t.doneQuiz : t.doneTest).replace('{n}', fmt(n)); bubble.style.display = ''; }
      })
      .catch(function () {});
  }

  // ── Suivi des completions (une fois par session/quiz) ──
  function watch(slug) {
    var engine = document.getElementById('quiz-engine');
    if (!engine) return;
    var key = 'qc-done-' + slug;
    function check() {
      if (!engine.querySelector('.quiz-result-card') || sessionStorage.getItem(key)) return;
      try { sessionStorage.setItem(key, '1'); } catch (e) {}
      fetch(URL + '/rest/v1/quiz_completions', { method: 'POST', headers: Object.assign({ 'Prefer': 'return=minimal' }, HJ), body: JSON.stringify({ quiz_slug: slug, lang: lang }) }).catch(function () {});
    }
    check();
    new MutationObserver(check).observe(engine, { childList: true, subtree: true });
  }

  // ── Bloc avis par quiz (liste + formulaire progressif) ──
  function initReviews(slug) {
    var root = document.getElementById('pq-reviews');
    if (!root) return;
    var listEl = root.querySelector('.pqx-list');
    var aggEl = root.querySelector('.pqx-agg');
    var moreMsg = root.querySelector('.pqx-more-msg'); if (moreMsg) moreMsg.textContent = t.more;
    var nameI = root.querySelector('.pqx-name'); if (nameI) nameI.placeholder = t.name;
    var commentI = root.querySelector('.pqx-comment'); if (commentI) commentI.placeholder = t.comment;
    var submitB = root.querySelector('.pqx-submit'); if (submitB) submitB.textContent = t.submit;

    fetch(URL + '/rest/v1/reviews?select=author_name,rating,comment,created_at&is_approved=eq.true&quiz_slug=eq.' + encodeURIComponent(slug) + '&order=created_at.desc&limit=12', { headers: H })
      .then(function (r) { return r.json(); })
      .then(function (rows) {
        if (!Array.isArray(rows) || rows.length === 0) { if (listEl) listEl.innerHTML = '<p class="pqx-none">' + t.none + '</p>'; return; }
        var sum = 0; rows.forEach(function (x) { sum += x.rating || 0; });
        var avg = (sum / rows.length).toFixed(1);
        if (aggEl) aggEl.innerHTML = '<span class="pqx-avg">' + avg + '</span><span class="pqx-stars">' + stars(Math.round(avg)) + '</span><span class="pqx-count">' + rows.length + ' ' + t.based + '</span>';
        if (listEl) listEl.innerHTML = rows.map(function (x) { return '<div class="pqx-card"><div class="pqx-card-top"><b>' + esc(x.author_name) + '</b><span class="pqx-stars">' + stars(x.rating) + '</span></div>' + (x.comment ? '<p>' + esc(x.comment) + '</p>' : '') + '</div>'; }).join('');
      })
      .catch(function () { if (listEl) listEl.innerHTML = ''; });

    var rating = 0;
    var starBtns = root.querySelectorAll('.pqx-input-stars [data-star]');
    var more = root.querySelector('.pqx-more');
    starBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        rating = +b.dataset.star;
        starBtns.forEach(function (x) { x.classList.toggle('on', +x.dataset.star <= rating); });
        if (more && more.hidden) more.hidden = false;
        if (nameI) nameI.focus();
      });
    });
    var form = root.querySelector('.pqx-form');
    if (form) form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = root.querySelector('.pqx-msg');
      var name = nameI ? nameI.value.trim() : '';
      if (!rating || !name) { if (msg) { msg.textContent = t.err; msg.className = 'pqx-msg err'; } return; }
      if (submitB) submitB.disabled = true;
      var body = { author_name: name.substring(0, 60), rating: rating, quiz_slug: slug, is_approved: false };
      var c = commentI ? commentI.value.trim() : ''; if (c) body.comment = c.substring(0, 200);
      fetch(URL + '/rest/v1/reviews', { method: 'POST', headers: Object.assign({ 'Prefer': 'return=minimal' }, HJ), body: JSON.stringify(body) })
        .then(function (r) { if (r.ok || r.status === 201) { form.innerHTML = '<p class="pqx-thanks">' + t.thanks + '</p>'; } else throw new Error('x'); })
        .catch(function () { if (msg) { msg.textContent = t.err; msg.className = 'pqx-msg err'; } if (submitB) submitB.disabled = false; });
    });
  }

  function boot() {
    document.body.classList.add('quiz-page');
    var pq = document.getElementById('pq-reviews');
    var slug = pq ? pq.dataset.quizSlug : null;
    if (!slug) return;
    countBubble(slug);
    watch(slug);
    initReviews(slug);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
