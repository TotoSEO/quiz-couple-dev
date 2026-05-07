/**
 * Quiz Couple - Core Quiz Engine (vanilla JS)
 * Complete engine with specialized quiz types:
 * - SoloTest: toxic, divorce, mariage, ado (single player, points-based)
 * - DuoMatchQuiz: tester-couple, common-points (2 players + gender, match answers)
 * - DistanceQuiz: distance (2 players, alternating turns, 0/1/2 points per option)
 * - CoquinQuiz: coquin (guess & reveal mechanic, 30 rounds)
 * - KnowledgeQuiz: knowledge (oral validation with check/cross buttons)
 * - DebateQuiz: amoureux (1-5 scale debate mode, played together)
 * - FunnyQuiz: marrant (discussion-only, "Question suivante" button)
 * - MostQuiz: most (2-8 players, vote for one player per question)
 * - HealthyQuiz: couple-sain (weighted scoring a=3 b=2 c=1 d=0, 2 players + gender)
 */

var QuizEngine = (function() {
  'use strict';

  var SUPABASE_URL = 'https://lojvajnnvhatfplevyvy.supabase.co';
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvanZham5udmhhdGZwbGV2eXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNzk3NDIsImV4cCI6MjA4Nzg1NTc0Mn0.gdd9HRbRvfQr6io9jGN6hUCW6tBOtognhwbsTJtSTng';

  // ─── Translation helper ───────────────────────────────────
  var gdTranslations = null;
  var gdFrTranslations = null;
  var gamesTranslations = null;

  // Prefix aliases: non-FR languages use different prefix names for some quizzes
  var PREFIX_ALIASES = {
    'couple': 'testerC',
    'commonPoints': 'cp',
    'coquin': 'coquinQ',
    'marrant': 'funny'
  };

  function loadTranslations(lang, callback) {
    var loaded = 0;
    var total = lang === 'fr' ? 2 : 3;
    function check() { loaded++; if (loaded >= total && callback) callback(); }

    // Always load FR as base fallback
    if (lang !== 'fr') {
      fetch('/js/data/gd-fr.json').then(function(r) { return r.json(); })
        .then(function(d) { gdFrTranslations = d; check(); })
        .catch(check);
    }

    fetch('/js/data/gd-' + lang + '.json').then(function(r) { return r.json(); })
      .then(function(d) { gdTranslations = d; if (lang === 'fr') gdFrTranslations = d; check(); })
      .catch(function() { fetch('/js/data/gd-fr.json').then(function(r) { return r.json(); }).then(function(d) { gdTranslations = d; gdFrTranslations = d; check(); }).catch(check); });
    fetch('/js/data/games-' + lang + '.json').then(function(r) { return r.json(); })
      .then(function(d) { gamesTranslations = d; check(); })
      .catch(function() { fetch('/js/data/games-fr.json').then(function(r) { return r.json(); }).then(function(d) { gamesTranslations = d; check(); }).catch(check); });
  }

  function _lookup(data, key) {
    if (!data) return undefined;
    var parts = key.split('.');
    var val = data;
    for (var i = 0; i < parts.length; i++) {
      if (!val || typeof val !== 'object') return undefined;
      val = val[parts[i]];
    }
    return (val !== undefined && val !== null) ? val : undefined;
  }

  function _tryAllPrefixes(data, prefix, rest) {
    var val = _lookup(data, prefix + '.' + rest);
    if (val !== undefined) return val;
    if (PREFIX_ALIASES[prefix]) {
      val = _lookup(data, PREFIX_ALIASES[prefix] + '.' + rest);
      if (val !== undefined) return val;
    }
    return undefined;
  }

  function tgd(key, fallback) {
    // 1. Try current language (exact key)
    var val = _lookup(gdTranslations, key);
    if (val !== undefined) return val;

    var dotIdx = key.indexOf('.');
    if (dotIdx > 0) {
      var prefix = key.substring(0, dotIdx);
      var rest = key.substring(dotIdx + 1);

      // 2. Try alias prefix in current language
      if (PREFIX_ALIASES[prefix]) {
        val = _lookup(gdTranslations, PREFIX_ALIASES[prefix] + '.' + rest);
        if (val !== undefined) return val;
      }

      // 3. Try numeric variant for question keys: q{N} → {N}
      var numMatch = rest.match(/^q(\d+)$/);
      if (numMatch) {
        val = _tryAllPrefixes(gdTranslations, prefix, numMatch[1]);
        if (val !== undefined) return val;
      }

      // 4. Try option pattern variants: q{N}a → q{N}o0 or q{N}A
      var optMatch = rest.match(/^q(\d+)([a-e])$/);
      if (optMatch) {
        var qNum = optMatch[1];
        var letterIdx = optMatch[2].charCodeAt(0) - 97; // a=0, b=1, c=2, d=3, e=4
        // Try o-pattern: q{N}o{idx}
        val = _tryAllPrefixes(gdTranslations, prefix, 'q' + qNum + 'o' + letterIdx);
        if (val !== undefined) return val;
        // Try uppercase pattern: q{N}A/B/C/D
        val = _tryAllPrefixes(gdTranslations, prefix, 'q' + qNum + optMatch[2].toUpperCase());
        if (val !== undefined) return val;
      }
    }

    // 5. Fallback to FR
    val = _lookup(gdFrTranslations, key);
    if (val !== undefined) return val;

    return (fallback !== undefined && fallback !== null) ? fallback : key;
  }

  function tg(key, fallback) {
    if (!gamesTranslations) return fallback || key;
    var parts = key.split('.');
    var val = gamesTranslations;
    for (var i = 0; i < parts.length; i++) {
      if (!val || typeof val !== 'object') return fallback || key;
      val = val[parts[i]];
    }
    return (val !== undefined && val !== null) ? val : (fallback || key);
  }

  // ─── Utility ──────────────────────────────────────────────
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  function esc(str) {
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function shuffleArray(arr) {
    var shuffled = arr.slice();
    for (var i = shuffled.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = temp;
    }
    return shuffled;
  }

  // ─── SVG Icons ────────────────────────────────────────────
  var ICONS = {
    heart: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
    users: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    mapPin: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    flame: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 23c-3.6 0-8-2.4-8-8.3C4 8.4 9.5 3.2 11.1 1.6c.3-.3.8-.3 1.1-.1.3.2.5.5.4.9-.3 2.2.5 3.7 1.6 5.4 1 1.5 2.1 3.2 2.4 5.7.4 3.4-1 6.5-4.6 6.5z"/></svg>',
    check: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    cross: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    plus: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    trash: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>'
  };

  // ─── Common UI Components ─────────────────────────────────

  function renderProgressBar(wrap, current, total, label) {
    var progress = Math.round((current / total) * 100);
    var progressWrap = el('div', 'quiz-progress-wrapper');
    var header = el('div', 'quiz-progress-header');
    header.innerHTML = '<span class="quiz-progress-label">' + esc(label || (tg('question.question', 'Question') + ' ' + (current + 1) + '/' + total)) + '</span><span class="quiz-progress-pct">' + progress + '%</span>';
    var barOuter = el('div', 'quiz-progress-bar');
    var barInner = el('div', 'quiz-progress-fill');
    barInner.style.width = progress + '%';
    barOuter.appendChild(barInner);
    progressWrap.appendChild(header);
    progressWrap.appendChild(barOuter);
    wrap.appendChild(progressWrap);
    return progressWrap;
  }

  // SVG gradient definition (injected once for score rings)
  function ensureScoreGradient() {
    if (document.getElementById('scoreGradientSvg')) return;
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'scoreGradientSvg';
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.style.position = 'absolute';
    svg.innerHTML = '<defs><linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="hsl(340, 65%, 65%)"/><stop offset="100%" stop-color="hsl(270, 40%, 70%)"/></linearGradient></defs>';
    document.body.appendChild(svg);
  }

  function renderScoreRing(pct, size) {
    ensureScoreGradient();
    var circumference = 283; // 2 * PI * 45
    var offset = circumference - (circumference * pct / 100);
    var sizeClass = size === 'sm' ? ' score-ring-wrap--sm' : '';
    var confetti = '';
    if (pct >= 70 && size !== 'sm') {
      var colors = ['#ec4899','#a855f7','#f59e0b','#22c55e','#3b82f6','#ef4444','#8b5cf6','#06b6d4'];
      for (var i = 0; i < 8; i++) {
        var angle = (i / 8) * Math.PI * 2;
        var tx = Math.round(Math.cos(angle) * 60);
        var ty = Math.round(Math.sin(angle) * 60);
        confetti += '<span class="confetti-dot" style="background:' + colors[i] + ';--tx:' + tx + 'px;--ty:' + ty + 'px;animation-delay:' + (0.1 * i) + 's"></span>';
      }
    }
    return '<div class="score-ring-wrap' + sizeClass + '">' +
      (confetti ? '<div class="confetti-container">' + confetti + '</div>' : '') +
      '<svg viewBox="0 0 100 100" class="score-ring">' +
        '<circle cx="50" cy="50" r="45" class="score-ring-bg"/>' +
        '<circle cx="50" cy="50" r="45" class="score-ring-fill" style="stroke-dashoffset:' + offset + '"/>' +
      '</svg>' +
      '<span class="score-ring-value">' + pct + '%</span>' +
    '</div>';
  }

  function renderPlayerBadge(wrap, name, color) {
    var badge = el('div', 'text-center mb-4');
    var colorClass = color || 'badge-primary';
    badge.innerHTML = '<span class="badge ' + colorClass + '">' + esc(name) + '</span>';
    wrap.appendChild(badge);
    return badge;
  }

  // ─── Related quizzes data ────────────────────────────────
  var ALL_QUIZZES_LIST = [
    { type: 'test', key: 'tester-couple', icon: '💕', route: 'testCouple' },
    { type: 'test', key: 'common-points', icon: '🎯', route: 'testCommonPoints' },
    { type: 'test', key: 'distance', icon: '🌍', route: 'testDistance' },
    { type: 'test', key: 'toxic', icon: '⚠️', route: 'testToxic' },
    { type: 'test', key: 'sain', icon: '💚', route: 'testCoupleSain' },
    { type: 'test', key: 'mariage', icon: '💒', route: 'testMariage' },
    { type: 'test', key: 'divorce', icon: '⚖️', route: 'testDivorce' },
    { type: 'test', key: 'parentalite', icon: '👶', route: 'testParentalite' },
    { type: 'test', key: 'jalousie', icon: '🫣', route: 'testJalousie' },
    { type: 'quiz', key: 'amoureux', icon: '❤️', route: 'quizAmoureux' },
    { type: 'quiz', key: 'coquin', icon: '🔥', route: 'quizCoquin' },
    { type: 'quiz', key: 'marrant', icon: '😂', route: 'quizMarrant' },
    { type: 'quiz', key: 'knowledge', icon: '🧠', route: 'quizKnowledge' },
    { type: 'quiz', key: 'most', icon: '🏆', route: 'quizMost' },
    { type: 'quiz', key: 'ado', icon: '🌟', route: 'quizAdo' },
    { type: 'quiz', key: 'genant', icon: '😳', route: 'quizGenant' },
    { type: 'quiz', key: 'tu-preferes', icon: '🤔', route: 'quizTuPreferes' },
    { type: 'quiz', key: 'vrai-faux', icon: '✅', route: 'quizVraiFaux' },
  ];

  function getRelatedQuizUrl(routeKey, lang) {
    // Build localized URL from ROUTE_SLUGS-like data embedded in page
    var slugEl = document.querySelector('[data-route-slugs]');
    if (slugEl) {
      try {
        var slugs = JSON.parse(slugEl.dataset.routeSlugs);
        var slug = slugs[routeKey] && slugs[routeKey][lang];
        if (slug) return lang === 'fr' ? '/' + slug + '/' : '/' + lang + '/' + slug + '/';
      } catch(e) {}
    }
    // Fallback: just go home
    return '/';
  }

  function renderRelatedQuizzes(wrap, currentQuizKey, lang) {
    var others = ALL_QUIZZES_LIST.filter(function(q) { return q.key !== currentQuizKey; });
    var shuffled = shuffleArray(others).slice(0, 3);
    if (shuffled.length === 0) return;

    var section = el('div', 'result-related-section mt-10');
    var title = el('p', 'text-lg font-bold text-center mb-6', tg('result.relatedTitle', 'Poursuivez avec d\'autres tests / quiz !'));
    section.appendChild(title);

    var grid = el('div', 'result-related-grid');
    for (var i = 0; i < shuffled.length; i++) {
      var q = shuffled[i];
      var card = el('a', 'result-related-card');
      card.href = getRelatedQuizUrl(q.route, lang);
      var emoji = el('span', 'result-related-emoji', q.icon);
      var name = el('span', 'result-related-name', esc(tg('quizNames.' + q.route, q.key)));
      var typeLabel = el('span', 'result-related-type', q.type === 'test' ? 'Test' : 'Quiz');
      card.appendChild(emoji);
      card.appendChild(name);
      card.appendChild(typeLabel);
      grid.appendChild(card);
    }
    section.appendChild(grid);
    wrap.appendChild(section);
  }

  function renderActionButtons(wrap, opts) {
    // ── Action buttons in a clean grid ──
    var actions = el('div', 'result-actions-grid mt-8');

    // Only show "other questions" button if quiz has a random pool (pool > totalQ)
    var quizEl = document.getElementById('quiz-engine');
    var hasPool = quizEl && quizEl.dataset.hasPool === '1';
    if (opts.newQuestions && hasPool) {
      var newQBtn = el('button', 'result-action-btn result-action-btn--primary');
      newQBtn.innerHTML = '<span class="result-action-icon">🎲</span><span class="result-action-label">' + esc(tg('result.restartOtherQuestions', 'Autres questions')) + '</span>';
      newQBtn.addEventListener('click', opts.newQuestions);
      actions.appendChild(newQBtn);
    }
    if (opts.restart) {
      var restartBtn = el('button', 'result-action-btn');
      restartBtn.innerHTML = '<span class="result-action-icon">🔄</span><span class="result-action-label">' + esc(tg('result.restartFromBeginning', 'Recommencer')) + '</span>';
      restartBtn.addEventListener('click', opts.restart);
      actions.appendChild(restartBtn);
    }
    if (opts.changePlayers) {
      var changeBtn = el('button', 'result-action-btn');
      changeBtn.innerHTML = '<span class="result-action-icon">👥</span><span class="result-action-label">' + esc(tg('result.changePlayers', 'Changer de joueurs')) + '</span>';
      changeBtn.addEventListener('click', opts.changePlayers);
      actions.appendChild(changeBtn);
    }
    var homeBtn = el('a', 'result-action-btn');
    homeBtn.href = '/';
    homeBtn.innerHTML = '<span class="result-action-icon">🏠</span><span class="result-action-label">' + esc(tg('question.backHome', 'Accueil')) + '</span>';
    actions.appendChild(homeBtn);
    wrap.appendChild(actions);

    // ── Review CTA — compact inline ──
    var reviewRow = el('div', 'result-review-row mt-6');
    var reviewText = el('span', 'result-review-text', esc(tg('reviews.quizLiked', 'Ce quiz vous a plu ?')));
    var reviewBtn = el('a', 'result-review-btn');
    reviewBtn.href = '/#avis';
    reviewBtn.innerHTML = ICONS.heart + ' ' + esc(tg('reviews.leaveReview', 'Laisser un avis'));
    reviewRow.appendChild(reviewText);
    reviewRow.appendChild(reviewBtn);
    wrap.appendChild(reviewRow);

    // ── Related quizzes ──
    var quizEl = document.getElementById('quiz-engine');
    var currentKey = quizEl ? quizEl.dataset.quiz : '';
    var currentLang = quizEl ? (quizEl.dataset.lang || 'fr') : 'fr';
    renderRelatedQuizzes(wrap, currentKey, currentLang);
  }

  function renderGenderButtons(container, selectedGender, onSelect) {
    var genderWrap = el('div', 'flex gap-2 mt-2');
    var maleBtn = el('button', 'gender-btn' + (selectedGender === 'homme' ? ' gender-btn-selected gender-btn-male' : ''));
    maleBtn.innerHTML = '👨 ' + tg('playerSetup.male', 'Homme');
    maleBtn.addEventListener('click', function() { onSelect('homme'); });
    var femaleBtn = el('button', 'gender-btn' + (selectedGender === 'femme' ? ' gender-btn-selected gender-btn-female' : ''));
    femaleBtn.innerHTML = '👩 ' + tg('playerSetup.female', 'Femme');
    femaleBtn.addEventListener('click', function() { onSelect('femme'); });
    genderWrap.appendChild(maleBtn);
    genderWrap.appendChild(femaleBtn);
    container.appendChild(genderWrap);
    return genderWrap;
  }

  function getPlayerColor(player, otherPlayer, playerIndex) {
    if (!player || !player.gender) return { bg: '#ec4899', text: '#fff' };
    var sameGender = player.gender === (otherPlayer && otherPlayer.gender);
    if (player.gender === 'femme') {
      if (sameGender) return playerIndex === 0 ? { bg: '#ec4899', text: '#fff' } : { bg: '#be185d', text: '#fff' };
      return { bg: '#ec4899', text: '#fff' };
    }
    if (sameGender) return playerIndex === 0 ? { bg: '#3b82f6', text: '#fff' } : { bg: '#3730a3', text: '#fff' };
    return { bg: '#3b82f6', text: '#fff' };
  }

  // ═══════════════════════════════════════════════════════════
  // SOLO TEST - toxic, divorce, mariage, ado
  // Single player, points-based scoring
  // ═══════════════════════════════════════════════════════════
  function SoloTest(config) {
    this.container = config.container;
    this.questions = config.questions;
    this.results = config.results;
    this.prefix = config.prefix;
    this.lang = config.lang || 'fr';
    this.labels = config.labels || {};
    this.quizType = config.quizType || 'solo';
    this.hasSkip = config.hasSkip || false;
    this.hasLocalStorage = config.hasLocalStorage || false;
    this.needsName = config.needsName || false;
    this.phase = 'intro';
    this.currentQ = 0;
    this.answers = [];
    this.totalScore = 0;
    this.skippedCount = 0;
    this.playerName = '';
    // Restore from localStorage if applicable
    if (this.hasLocalStorage) {
      try {
        var saved = JSON.parse(localStorage.getItem('quiz-' + this.prefix) || 'null');
        if (saved && saved.currentQ > 0 && saved.questionCount === this.questions.length) {
          this.currentQ = saved.currentQ;
          this.answers = saved.answers;
          this.totalScore = saved.totalScore;
          this.skippedCount = saved.skippedCount || 0;
          this.phase = saved.isComplete ? 'results' : 'playing';
        } else if (saved) {
          localStorage.removeItem('quiz-' + this.prefix);
        }
      } catch(e) {}
    }
    this.render();
  }

  SoloTest.prototype.saveState = function() {
    if (!this.hasLocalStorage) return;
    try {
      localStorage.setItem('quiz-' + this.prefix, JSON.stringify({
        currentQ: this.currentQ, answers: this.answers,
        totalScore: this.totalScore, skippedCount: this.skippedCount,
        isComplete: this.phase === 'results',
        questionCount: this.questions.length
      }));
    } catch(e) {}
  };

  SoloTest.prototype.render = function() {
    this.container.innerHTML = '';
    if (this.phase === 'intro') this.renderIntro();
    else if (this.phase === 'playing') this.renderQuestion();
    else if (this.phase === 'results') this.renderResults();
  };

  SoloTest.prototype.renderIntro = function() {
    var self = this;
    var wrap = el('div', 'quiz-engine animate-fade-in text-center');

    var icon = el('div', 'text-5xl mb-4', this.labels.icon || '📝');
    var title = el('h2', 'text-2xl font-bold mb-3', tg('playerSetup.readyForTest', 'Prêt pour le test ?'));
    var desc = el('p', 'text-muted-foreground mb-2', this.questions.length + ' ' + tg('meta.questionsWord', 'questions'));
    var time = el('p', 'text-sm text-muted-foreground mb-6', '⏱ ' + tg('meta.duration', '5 min') + ' &bull; 🔒 ' + tg('truefalse.freeAnon', 'Gratuit & anonyme'));

    wrap.appendChild(icon);
    wrap.appendChild(title);
    wrap.appendChild(desc);
    wrap.appendChild(time);

    // Special toxic quiz intro
    if (this.quizType === 'toxic') {
      var introBox = el('div', 'glass-card rounded-xl p-5 mb-6 max-w-md mx-auto text-left');
      introBox.innerHTML = '<p class="text-sm text-muted-foreground mb-2">' + esc(tg('toxic.introQuestion', 'Vous vous posez la question :')) + '</p>' +
        '<p class="font-semibold text-foreground mb-3 italic">' + esc(tg('toxic.introQuote', '« Est-ce que mon couple est toxique… ou est-ce que je dramatise ? »')) + '</p>' +
        '<p class="text-sm text-muted-foreground">' + esc(tg('toxic.disclaimer', 'Ce test n\'est ni un diagnostic médical, ni un jugement.')) + '</p>';
      wrap.appendChild(introBox);
    }

    // Special divorce quiz intro
    if (this.quizType === 'divorce') {
      var disclaimerBox = el('div', 'glass-card rounded-xl p-5 mb-6 max-w-md mx-auto text-left');
      disclaimerBox.innerHTML = '<p class="text-sm text-muted-foreground">💡 ' + esc(tg('divorce.disclaimer', 'Ce test est un outil de réflexion personnel. Il ne remplace en aucun cas l\'avis d\'un professionnel.')) + '</p>';
      wrap.appendChild(disclaimerBox);
    }

    // Name input for ado quiz
    var nameInput = null;
    if (this.needsName) {
      var nameWrap = el('div', 'max-w-sm mx-auto mb-6');
      var nameLabel = el('label', 'block text-sm font-medium text-foreground mb-2');
      nameLabel.textContent = tg('ui.yourName', 'Prénom de ton/ta partenaire');
      nameInput = el('input', 'w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-center text-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none');
      nameInput.type = 'text';
      nameInput.placeholder = tg('ui.namePlaceholder', 'Ex : Lucas');
      nameInput.maxLength = 30;
      nameWrap.appendChild(nameLabel);
      nameWrap.appendChild(nameInput);
      wrap.appendChild(nameWrap);
    }

    var startLabel = this.labels.start || tg('playerSetup.startTest', 'Commencer le test');
    var btn = el('button', 'btn btn-cta btn-lg', esc(startLabel));
    btn.addEventListener('click', function() {
      if (self.needsName && nameInput) {
        var name = nameInput.value.trim();
        if (!name) {
          nameInput.style.borderColor = '#ef4444';
          nameInput.focus();
          return;
        }
        self.playerName = name;
      }
      self.phase = 'playing';
      self.currentQ = 0;
      self.answers = [];
      self.totalScore = 0;
      self.skippedCount = 0;
      self.render();
    });

    wrap.appendChild(btn);
    this.container.appendChild(wrap);
  };

  SoloTest.prototype.renderQuestion = function() {
    var self = this;
    var q = this.questions[this.currentQ];
    var total = this.questions.length;

    var wrap = el('div', 'quiz-engine quiz-question-enter');

    // Progress bar
    renderProgressBar(wrap, this.currentQ, total);

    // Question text
    var qText = tgd(this.prefix + '.q' + q.id, q.text);
    // Replace {{name}} placeholder
    if (this.playerName) qText = qText.replace(/\{\{name\}\}/g, this.playerName);
    var qEl = el('h3', 'text-xl font-semibold mb-6 text-center', esc(qText));
    wrap.appendChild(qEl);

    // Remark/reassurance (divorce quiz)
    var remarkKey = this.prefix + '.q' + q.id + '_r';
    var remarkText = tgd(remarkKey, null);
    if (remarkText && remarkText !== remarkKey) {
      var remark = el('div', 'text-sm text-muted-foreground bg-secondary/10 border border-secondary/20 rounded-lg p-4 mb-6');
      remark.innerHTML = '💡 ' + esc(remarkText);
      wrap.appendChild(remark);
    }

    // Options
    var optionsWrap = el('div', 'space-y-2');
    q.options.forEach(function(opt, idx) {
      var optText = tgd(self.prefix + '.q' + q.id + opt.id, opt.text);
      var optBtn = el('button', 'quiz-option');
      var optLetters = ['A','B','C','D','E'];
      optBtn.innerHTML = '<span class="quiz-option-letter">' + (optLetters[idx] || '') + '</span><span>' + esc(optText) + '</span>';
      optBtn.style.animationDelay = (idx * 60) + 'ms';
      optBtn.addEventListener('mousemove', function(e) {
        var rect = optBtn.getBoundingClientRect();
        optBtn.style.setProperty('--ripple-x', ((e.clientX - rect.left) / rect.width * 100) + '%');
        optBtn.style.setProperty('--ripple-y', ((e.clientY - rect.top) / rect.height * 100) + '%');
      });
      optBtn.addEventListener('click', function() {
        optBtn.classList.add('selected');
        var siblings = optionsWrap.querySelectorAll('.quiz-option');
        for (var s = 0; s < siblings.length; s++) {
          if (siblings[s] !== optBtn) siblings[s].style.opacity = '0.5';
          siblings[s].style.pointerEvents = 'none';
        }

        self.answers[self.currentQ] = opt.points || 0;
        self.totalScore = self.answers.reduce(function(s, v) { return s + (v || 0); }, 0);
        // Divorce: check conditional Q11 (Q10 answer 'b' = has children)
        if (self.quizType === 'divorce' && q.id === 10) {
          self.hasChildren = (opt.id === 'b');
        }
        self.saveState();
        setTimeout(function() {
          if (self.currentQ < total - 1) { self.currentQ++; self.render(); }
          else { self.phase = 'results'; self.saveState(); self.render(); }
        }, 350);
      });
      optionsWrap.appendChild(optBtn);
    });
    wrap.appendChild(optionsWrap);

    // Navigation: Back + Skip buttons
    var navWrap = el('div', 'flex justify-between items-center mt-6');
    if (this.currentQ > 0) {
      var backBtn = el('button', 'btn btn-ghost text-sm', '&larr; ' + tg('question.previousQuestion', 'Précédent'));
      backBtn.addEventListener('click', function() {
        self.currentQ--;
        var prevAnswer = self.answers[self.currentQ];
        if (prevAnswer === 'skip') self.skippedCount--;
        if (typeof prevAnswer === 'number') self.totalScore -= prevAnswer;
        delete self.answers[self.currentQ];
        self.saveState();
        self.render();
      });
      navWrap.appendChild(backBtn);
    } else {
      navWrap.appendChild(el('div'));
    }

    if (this.hasSkip) {
      var skipBtn = el('button', 'btn btn-ghost text-sm text-muted-foreground', tg('question.skipQuestion', 'Passer cette question') + ' →');
      skipBtn.addEventListener('click', function() {
        self.answers[self.currentQ] = 'skip';
        self.skippedCount++;
        self.saveState();
        if (self.currentQ < total - 1) { self.currentQ++; self.render(); }
        else { self.phase = 'results'; self.saveState(); self.render(); }
      });
      navWrap.appendChild(skipBtn);
    }

    wrap.appendChild(navWrap);
    this.container.appendChild(wrap);
  };

  SoloTest.prototype.renderResults = function() {
    var self = this;
    var wrap = el('div', 'quiz-engine quiz-result-card text-center');
    var result = null;
    for (var i = 0; i < this.results.length; i++) {
      var r = this.results[i];
      if (this.totalScore >= r.min && this.totalScore <= r.max) { result = r; break; }
    }
    if (!result && this.results.length > 0) result = this.results[this.results.length - 1];

    var maxScore = this.results.length > 0 ? this.results[this.results.length - 1].max : 100;
    var pct = Math.round((this.totalScore / maxScore) * 100);

    // Score ring (SVG animated)
    var scoreDiv = el('div', 'mb-4');
    scoreDiv.innerHTML = renderScoreRing(pct);
    wrap.appendChild(scoreDiv);
    var scoreLabel = el('p', 'text-sm text-muted-foreground mb-6', this.totalScore + '/' + maxScore + ' points');
    wrap.appendChild(scoreLabel);

    if (result) {
      wrap.appendChild(el('h3', 'text-2xl font-bold mb-3 quiz-reveal-enter', esc(result.title)));
      wrap.appendChild(el('p', 'text-muted-foreground leading-relaxed mb-4 max-w-lg mx-auto quiz-reveal-enter', result.description));
      if (result.advice) {
        var advice = el('div', 'text-sm text-foreground bg-primary/5 border border-primary/20 rounded-xl p-5 mt-4 text-left max-w-lg mx-auto quiz-reveal-enter');
        advice.innerHTML = '<strong class="block mb-2">' + esc(tg('result.ourAdvice', 'Notre conseil')) + '</strong>' + esc(result.advice);
        wrap.appendChild(advice);
      }
    }

    renderActionButtons(wrap, {
      newQuestions: function() { location.reload(); },
      restart: function() { if (self.hasLocalStorage) { try { localStorage.removeItem('quiz-' + self.prefix); } catch(e) {} } self.phase = 'intro'; self.render(); }
    });

    this.container.appendChild(wrap);
    wrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // ═══════════════════════════════════════════════════════════
  // DUO MATCH QUIZ - tester-couple, common-points
  // 2 players (optionally with gender), answer matching
  // ═══════════════════════════════════════════════════════════
  function DuoMatchQuiz(config) {
    this.container = config.container;
    this.questions = config.questions;
    this.results = config.results;
    this.prefix = config.prefix;
    this.lang = config.lang || 'fr';
    this.needsGender = config.needsGender || false;
    this.setupTitle = config.setupTitle || '';
    this.setupDesc = config.setupDesc || '';
    this.phase = 'setup';
    this.players = [null, null];
    this.currentQ = 0;
    this.currentPlayer = 0;
    this.answers = { p1: [], p2: [] };
    this.render();
  }

  DuoMatchQuiz.prototype.render = function() {
    this.container.innerHTML = '';
    if (this.phase === 'setup') this.renderSetup();
    else if (this.phase === 'handoff') this.renderHandoff();
    else if (this.phase === 'playing') this.renderQuestion();
    else if (this.phase === 'results') this.renderResults();
  };

  DuoMatchQuiz.prototype.renderSetup = function() {
    var self = this;
    var wrap = el('div', 'quiz-engine quiz-setup-screen animate-fade-in');

    // Icon in gradient circle
    var iconWrap = el('div', 'quiz-setup-icon mx-auto mb-6');
    iconWrap.innerHTML = ICONS.users;
    wrap.appendChild(iconWrap);

    var title = el('h2', 'text-2xl font-bold mb-3 text-center', this.setupTitle || tg('playerSetup.readyToPlay', 'Prêts à jouer ensemble ?'));
    var desc = el('p', 'text-muted-foreground mb-8 text-center', this.setupDesc || tg('playerSetup.enterNames', 'Entrez vos prénoms et commencez le quiz à deux !'));

    var form = el('div', 'quiz-setup-grid max-w-lg mx-auto');

    var genders = ['', ''];

    function createPlayerCard(idx) {
      var card = el('div', 'quiz-player-card');
      var numCircle = el('div', 'quiz-player-number');
      numCircle.textContent = (idx + 1);
      card.appendChild(numCircle);
      var label = el('label', 'block text-sm font-semibold mb-2 text-center', tg('playerSetup.player' + (idx + 1), 'Joueur ' + (idx + 1)));
      var input = el('input', 'input w-full');
      input.type = 'text';
      input.placeholder = tg('playerSetup.firstName', 'Prénom');
      input.maxLength = 20;
      input.id = 'player-input-' + idx;
      card.appendChild(label);
      card.appendChild(input);

      if (self.needsGender) {
        var gLabel = el('label', 'block text-sm font-semibold mt-4 mb-2 text-center', tg('playerSetup.gender', 'Genre'));
        card.appendChild(gLabel);
        var gWrap = el('div', 'flex gap-3 justify-center');
        var maleBtn = el('button', 'gender-btn', '👨 ' + tg('playerSetup.male', 'Homme'));
        var femaleBtn = el('button', 'gender-btn', '👩 ' + tg('playerSetup.female', 'Femme'));
        maleBtn.addEventListener('click', function() {
          genders[idx] = 'homme';
          maleBtn.className = 'gender-btn gender-btn-selected gender-btn-male';
          femaleBtn.className = 'gender-btn';
        });
        femaleBtn.addEventListener('click', function() {
          genders[idx] = 'femme';
          femaleBtn.className = 'gender-btn gender-btn-selected gender-btn-female';
          maleBtn.className = 'gender-btn';
        });
        gWrap.appendChild(maleBtn);
        gWrap.appendChild(femaleBtn);
        card.appendChild(gWrap);
      }
      return card;
    }

    form.appendChild(createPlayerCard(0));
    form.appendChild(createPlayerCard(1));

    var info = el('div', 'quiz-setup-meta', '📝 ' + this.questions.length + ' questions &bull; ⏱ ' + tg('meta.duration', '5 min'));

    var startBtn = el('button', 'btn btn-cta btn-gradient quiz-setup-start-btn', tg('playerSetup.startQuiz', 'Commencer le quiz'));
    startBtn.addEventListener('click', function() {
      var n1 = document.getElementById('player-input-0').value.trim() || tg('playerSetup.player1', 'Joueur 1');
      var n2 = document.getElementById('player-input-1').value.trim() || tg('playerSetup.player2', 'Joueur 2');
      self.players = [
        { name: n1, gender: genders[0] || null },
        { name: n2, gender: genders[1] || null }
      ];
      self.phase = 'handoff';
      self.currentQ = 0;
      self.currentPlayer = 0;
      var total = self.questions.length;
      self.answers = { p1: new Array(total).fill(null), p2: new Array(total).fill(null) };
      self.render();
    });

    wrap.appendChild(title);
    wrap.appendChild(desc);
    wrap.appendChild(form);
    wrap.appendChild(info);
    wrap.appendChild(startBtn);
    this.container.appendChild(wrap);
  };

  DuoMatchQuiz.prototype.renderHandoff = function() {
    var self = this;
    var player = this.players[this.currentPlayer];
    var wrap = el('div', 'quiz-engine animate-fade-in text-center');

    var icon = el('div', 'text-5xl mb-4', '📱');
    var title = el('h2', 'text-xl font-bold mb-3');
    title.textContent = tg('question.itsTurnOf', 'C\'est au tour de') + ' ' + player.name + ' !';
    var desc = el('p', 'text-muted-foreground mb-6', tg('question.passPhoneOrLookAway', 'Passez le téléphone ou détournez le regard'));

    var btn = el('button', 'btn btn-cta', tg('question.chooseAnswer', 'Choisir ma réponse'));
    btn.addEventListener('click', function() { self.phase = 'playing'; self.render(); });

    wrap.appendChild(icon);
    wrap.appendChild(title);
    wrap.appendChild(desc);
    wrap.appendChild(btn);
    this.container.appendChild(wrap);
  };

  DuoMatchQuiz.prototype.renderQuestion = function() {
    var self = this;
    var q = this.questions[this.currentQ];
    var total = this.questions.length;
    var totalNeeded = total * 2;
    var answered = this.answers.p1.filter(function(a) { return a !== null; }).length + this.answers.p2.filter(function(a) { return a !== null; }).length;
    var player = this.players[this.currentPlayer];
    var color = this.needsGender ? getPlayerColor(player, this.players[this.currentPlayer === 0 ? 1 : 0], this.currentPlayer) : null;

    var wrap = el('div', 'quiz-engine quiz-question-enter');

    renderProgressBar(wrap, answered, totalNeeded, tg('question.question', 'Question') + ' ' + (this.currentQ + 1) + '/' + total);

    // Player indicator with color
    var badge = el('div', 'text-center mb-4');
    if (color) {
      badge.innerHTML = '<span class="badge" style="background:' + color.bg + ';color:' + color.text + '">' + esc(player.name) + '</span>';
    } else {
      badge.innerHTML = '<span class="badge badge-primary">' + esc(player.name) + '</span>';
    }
    wrap.appendChild(badge);

    // Question
    var qText = tgd(this.prefix + '.q' + q.id, q.text);
    wrap.appendChild(el('h3', 'text-xl font-semibold mb-6 text-center', esc(qText)));

    // Options
    var optionsWrap = el('div', 'space-y-2');
    q.options.forEach(function(opt, idx) {
      var optText = tgd(self.prefix + '.q' + q.id + opt.id, opt.text);
      var optBtn = el('button', 'quiz-option');
      var optLetters = ['A','B','C','D','E'];
      optBtn.innerHTML = '<span class="quiz-option-letter">' + (optLetters[idx] || '') + '</span><span>' + esc(optText) + '</span>';
      optBtn.style.animationDelay = (idx * 60) + 'ms';
      optBtn.addEventListener('mousemove', function(e) {
        var rect = optBtn.getBoundingClientRect();
        optBtn.style.setProperty('--ripple-x', ((e.clientX - rect.left) / rect.width * 100) + '%');
        optBtn.style.setProperty('--ripple-y', ((e.clientY - rect.top) / rect.height * 100) + '%');
      });
      optBtn.addEventListener('click', function() {
        optBtn.classList.add('selected');
        var siblings = optionsWrap.querySelectorAll('.quiz-option');
        for (var s = 0; s < siblings.length; s++) {
          if (siblings[s] !== optBtn) siblings[s].style.opacity = '0.5';
          siblings[s].style.pointerEvents = 'none';
        }
        setTimeout(function() {
          if (self.currentPlayer === 0) {
            self.answers.p1[self.currentQ] = opt.id;
            self.currentPlayer = 1;
            self.phase = 'handoff';
          } else {
            self.answers.p2[self.currentQ] = opt.id;
            if (self.currentQ < total - 1) {
              self.currentQ++;
              self.currentPlayer = 0;
              self.phase = 'handoff';
            } else {
              self.phase = 'results';
            }
          }
          self.render();
        }, 350);
      });
      optionsWrap.appendChild(optBtn);
    });
    wrap.appendChild(optionsWrap);
    this.container.appendChild(wrap);
  };

  DuoMatchQuiz.prototype.renderResults = function() {
    var self = this;
    var wrap = el('div', 'quiz-engine quiz-result-card text-center');
    var total = this.questions.length;
    var matchCount = 0;
    for (var i = 0; i < total; i++) {
      if (this.answers.p1[i] && this.answers.p2[i] && this.answers.p1[i] === this.answers.p2[i]) matchCount++;
    }
    var pct = Math.round((matchCount / total) * 100);

    var result = null;
    for (var j = 0; j < this.results.length; j++) {
      var r = this.results[j];
      if (matchCount >= (r.minScore || r.min || 0) && matchCount <= (r.maxScore || r.max || 999)) { result = r; break; }
    }

    var icon = el('div', 'text-5xl mb-4', pct >= 70 ? '🎉' : pct >= 40 ? '😊' : '🤔');
    wrap.appendChild(icon);
    var scoreRingDiv = el('div', '');
    scoreRingDiv.innerHTML = renderScoreRing(pct);
    wrap.appendChild(scoreRingDiv);
    var matchLabel = el('p', 'text-muted-foreground mb-6 quiz-reveal-enter', matchCount + '/' + total + ' ' + tg('result.identicalAnswers', 'réponses identiques'));
    wrap.appendChild(matchLabel);

    if (result) {
      wrap.appendChild(el('h3', 'text-2xl font-bold mb-3', esc(result.title || '')));
      wrap.appendChild(el('p', 'text-muted-foreground leading-relaxed max-w-lg mx-auto', result.description || ''));
      if (result.advice) {
        var advice = el('div', 'text-sm text-foreground bg-primary/5 border border-primary/20 rounded-xl p-5 mt-4 text-left max-w-lg mx-auto');
        advice.innerHTML = '<strong class="block mb-2">' + esc(tg('result.ourAdvice', 'Notre conseil')) + '</strong>' + esc(result.advice);
        wrap.appendChild(advice);
      }
    }

    renderActionButtons(wrap, {
      newQuestions: function() { location.reload(); },
      restart: function() { self.phase = 'setup'; self.render(); }
    });

    this.container.appendChild(wrap);
    wrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // ═══════════════════════════════════════════════════════════
  // DISTANCE QUIZ - 2 players, alternating turns, 0/1/2 points
  // ═══════════════════════════════════════════════════════════
  function DistanceQuiz(config) {
    this.container = config.container;
    this.questions = config.questions;
    this.prefix = config.prefix;
    this.lang = config.lang || 'fr';
    this.phase = 'setup';
    this.players = [null, null];
    this.currentQ = 0;
    this.currentPlayer = 0;
    this.p1Score = 0;
    this.p2Score = 0;
    // Compute real max from actual question points
    var realMax = 0;
    for (var i = 0; i < this.questions.length; i++) {
      var qMax = 0;
      for (var j = 0; j < this.questions[i].options.length; j++) {
        if (this.questions[i].options[j].points > qMax) qMax = this.questions[i].options[j].points;
      }
      realMax += qMax;
    }
    this.maxScorePerPlayer = realMax;
    this.render();
  }

  DistanceQuiz.prototype.render = function() {
    this.container.innerHTML = '';
    if (this.phase === 'setup') this.renderSetup();
    else if (this.phase === 'privacy') this.renderPrivacy();
    else if (this.phase === 'playing') this.renderQuestion();
    else if (this.phase === 'results') this.renderResults();
  };

  DistanceQuiz.prototype.renderSetup = function() {
    var self = this;
    var wrap = el('div', 'quiz-engine animate-fade-in');

    var iconWrap = el('div', 'quiz-setup-icon mx-auto mb-4');
    iconWrap.innerHTML = ICONS.mapPin;
    wrap.appendChild(iconWrap);

    wrap.appendChild(el('h2', 'text-2xl font-bold mb-2 text-center', tg('playerSetup.readyForTest', 'Prêts pour le test ?')));
    wrap.appendChild(el('p', 'text-muted-foreground mb-6 text-center', tg('playerSetup.discoverCompatibility', 'Découvrez si vous êtes faits pour la distance')));

    var form = el('div', 'space-y-4 max-w-md mx-auto');

    for (var i = 0; i < 2; i++) {
      (function(idx) {
        var card = el('div', 'glass-card rounded-xl p-4');
        var labelWrap = el('div', 'flex items-center gap-2 mb-2');
        var heartSpan = el('span', idx === 0 ? 'text-pink-500' : 'text-blue-500');
        heartSpan.innerHTML = ICONS.heart;
        labelWrap.appendChild(heartSpan);
        labelWrap.appendChild(el('span', 'text-sm font-medium', tg('playerSetup.player' + (idx + 1), 'Joueur ' + (idx + 1))));
        card.appendChild(labelWrap);
        var input = el('input', 'input w-full');
        input.type = 'text';
        input.placeholder = tg('playerSetup.firstName', 'Prénom');
        input.maxLength = 20;
        input.id = 'distance-player-' + idx;
        card.appendChild(input);
        form.appendChild(card);
      })(i);
    }

    var startBtn = el('button', 'btn btn-cta btn-gradient w-full mt-4', tg('playerSetup.startTest', 'Commencer le test'));
    startBtn.addEventListener('click', function() {
      var n1 = document.getElementById('distance-player-0').value.trim() || tg('playerSetup.player1', 'Joueur 1');
      var n2 = document.getElementById('distance-player-1').value.trim() || tg('playerSetup.player2', 'Joueur 2');
      self.players = [{ name: n1 }, { name: n2 }];
      self.currentQ = 0; self.currentPlayer = 0; self.p1Score = 0; self.p2Score = 0;
      self.phase = 'privacy'; self.render();
    });
    form.appendChild(startBtn);
    wrap.appendChild(form);
    this.container.appendChild(wrap);
  };

  DistanceQuiz.prototype.renderPrivacy = function() {
    var self = this;
    var player = this.players[this.currentPlayer];
    var wrap = el('div', 'quiz-engine animate-fade-in text-center');
    wrap.appendChild(el('div', 'text-5xl mb-4', '🔒'));
    wrap.appendChild(el('h2', 'text-xl font-bold mb-3', tg('question.itsTurnOf', 'C\'est au tour de') + ' ' + esc(player.name) + ' !'));
    wrap.appendChild(el('p', 'text-muted-foreground mb-6', tg('question.passPhoneOrLookAway', 'Passez le téléphone ou détournez le regard')));

    var btn = el('button', 'btn btn-cta', tg('question.chooseAnswer', 'Répondre'));
    btn.addEventListener('click', function() { self.phase = 'playing'; self.render(); });
    wrap.appendChild(btn);
    this.container.appendChild(wrap);
  };

  DistanceQuiz.prototype.renderQuestion = function() {
    var self = this;
    var q = this.questions[this.currentQ];
    var total = this.questions.length;
    var totalAnswers = total * 2;
    var currentAnswerNum = this.currentQ * 2 + this.currentPlayer;
    var player = this.players[this.currentPlayer];

    var wrap = el('div', 'quiz-engine quiz-question-enter');
    renderProgressBar(wrap, currentAnswerNum, totalAnswers, tg('question.question', 'Question') + ' ' + (this.currentQ + 1) + '/' + total);
    renderPlayerBadge(wrap, player.name, this.currentPlayer === 0 ? 'badge-pink' : 'badge-blue');

    var qText = tgd(this.prefix + '.q' + q.id, q.text);
    wrap.appendChild(el('h3', 'text-xl font-semibold mb-6 text-center', esc(qText)));

    var optionsWrap = el('div', 'space-y-2');
    q.options.forEach(function(opt, idx) {
      var optText = tgd(self.prefix + '.q' + q.id + opt.id, opt.text);
      var optBtn = el('button', 'quiz-option');
      var optLetters = ['A','B','C','D','E'];
      optBtn.innerHTML = '<span class="quiz-option-letter">' + (optLetters[idx] || '') + '</span><span>' + esc(optText) + '</span>';
      optBtn.style.animationDelay = (idx * 60) + 'ms';
      optBtn.addEventListener('mousemove', function(e) {
        var rect = optBtn.getBoundingClientRect();
        optBtn.style.setProperty('--ripple-x', ((e.clientX - rect.left) / rect.width * 100) + '%');
        optBtn.style.setProperty('--ripple-y', ((e.clientY - rect.top) / rect.height * 100) + '%');
      });
      optBtn.addEventListener('click', function() {
        optBtn.classList.add('selected');
        var siblings = optionsWrap.querySelectorAll('.quiz-option');
        for (var s = 0; s < siblings.length; s++) {
          if (siblings[s] !== optBtn) siblings[s].style.opacity = '0.5';
          siblings[s].style.pointerEvents = 'none';
        }
        var points = opt.points || 0;
        if (self.currentPlayer === 0) self.p1Score += points;
        else self.p2Score += points;

        setTimeout(function() {
          if (self.currentPlayer === 0) {
            self.currentPlayer = 1;
            self.phase = 'privacy';
          } else {
            if (self.currentQ < total - 1) {
              self.currentQ++;
              self.currentPlayer = 0;
              self.phase = 'privacy';
            } else {
              self.phase = 'results';
            }
          }
          self.render();
        }, 350);
      });
      optionsWrap.appendChild(optBtn);
    });
    wrap.appendChild(optionsWrap);
    this.container.appendChild(wrap);
  };

  DistanceQuiz.prototype.renderResults = function() {
    var self = this;
    var wrap = el('div', 'quiz-engine quiz-result-card');

    wrap.appendChild(el('h2', 'text-2xl font-bold text-center mb-6', tg('result.quizResults', 'Résultats du quiz')));

    // Individual scores
    var scoresGrid = el('div', 'grid grid-cols-2 gap-4 mb-6');
    for (var i = 0; i < 2; i++) {
      var score = i === 0 ? this.p1Score : this.p2Score;
      var pct = Math.round((score / this.maxScorePerPlayer) * 100);
      var scorePct = score / self.maxScorePerPlayer;
      var vKey = scorePct >= 0.8 ? 'h' : scorePct >= 0.6 ? 'm' : scorePct >= 0.4 ? 'l' : 'vl';
      var verdict = tgd(this.prefix + '.pv_' + vKey, '');
      verdict = verdict.replace('{{name}}', this.players[i].name);

      var card = el('div', 'glass-card rounded-xl p-4 text-center');
      card.appendChild(el('p', 'font-semibold mb-2', esc(this.players[i].name)));
      var ringDiv = el('div', '');
      ringDiv.innerHTML = renderScoreRing(pct, 'sm');
      card.appendChild(ringDiv);
      card.appendChild(el('p', 'text-xs text-muted-foreground', score + '/' + this.maxScorePerPlayer));
      if (verdict) card.appendChild(el('p', 'text-sm mt-2', esc(verdict)));
      scoresGrid.appendChild(card);
    }
    wrap.appendChild(scoresGrid);

    // Couple verdict
    var avg = (this.p1Score + this.p2Score) / 2;
    var avgPct = avg / this.maxScorePerPlayer;
    var cvKey = avgPct >= 0.7 ? 'h' : avgPct >= 0.5 ? 'm' : avgPct >= 0.3 ? 'l' : 'vl';
    var coupleVerdict = tgd(this.prefix + '.cv_' + cvKey, '');
    if (coupleVerdict) {
      var cvBox = el('div', 'glass-card rounded-xl p-5 text-center mb-4');
      cvBox.appendChild(el('h3', 'font-bold mb-2', tg('result.coupleVerdict', 'Verdict du couple')));
      cvBox.appendChild(el('p', 'text-muted-foreground', esc(coupleVerdict)));
      wrap.appendChild(cvBox);
    }

    renderActionButtons(wrap, {
      newQuestions: function() { location.reload(); },
      restart: function() { self.phase = 'setup'; self.render(); }
    });
    this.container.appendChild(wrap);
    wrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // ═══════════════════════════════════════════════════════════
  // COQUIN QUIZ - Guess & Reveal mechanic
  // Player A guesses what Player B would answer, then B reveals
  // 30 rounds (15 per player), alternating guesser/target
  // ═══════════════════════════════════════════════════════════
  function CoquinQuiz(config) {
    this.container = config.container;
    this.questions = config.questions;
    this.prefix = config.prefix;
    this.lang = config.lang || 'fr';
    this.phase = 'setup';
    this.players = [null, null];
    this.rounds = [];
    this.currentRound = 0;
    this.totalRounds = 30;
    this.questionsPerPlayer = 15;
    this.render();
  }

  CoquinQuiz.prototype.render = function() {
    this.container.innerHTML = '';
    if (this.phase === 'setup') this.renderSetup();
    else if (this.phase === 'guessing') this.renderGuessing();
    else if (this.phase === 'revealing') this.renderRevealing();
    else if (this.phase === 'feedback') this.renderFeedback();
    else if (this.phase === 'results') this.renderResults();
  };

  CoquinQuiz.prototype.renderSetup = function() {
    var self = this;
    var wrap = el('div', 'quiz-engine animate-fade-in');

    var iconWrap = el('div', 'quiz-setup-icon quiz-setup-icon-coquin mx-auto mb-4');
    iconWrap.innerHTML = ICONS.flame;
    wrap.appendChild(iconWrap);

    wrap.appendChild(el('h2', 'text-2xl font-bold mb-2 text-center', tg('coquin.readyToSpice', 'Prêts à pimenter ?')));
    wrap.appendChild(el('p', 'text-muted-foreground mb-6 text-center', tg('coquin.enterNamesSpicy', 'Entrez vos prénoms')));

    var form = el('div', 'space-y-4 max-w-md mx-auto');
    for (var i = 0; i < 2; i++) {
      (function(idx) {
        var card = el('div', 'glass-card rounded-xl p-4');
        var labelWrap = el('div', 'flex items-center gap-2 mb-2');
        labelWrap.appendChild(el('span', 'text-sm font-medium', idx === 0 ? tg('coquin.firstName1', 'Premier prénom') : tg('coquin.firstName2', 'Deuxième prénom')));
        card.appendChild(labelWrap);
        var input = el('input', 'input w-full');
        input.type = 'text';
        input.placeholder = idx === 0 ? tg('coquin.yourFirstName', 'Votre prénom...') : tg('coquin.theirFirstName', 'Son prénom...');
        input.maxLength = 20;
        input.id = 'coquin-player-' + idx;
        card.appendChild(input);
        form.appendChild(card);
      })(i);
    }

    form.appendChild(el('p', 'text-xs text-muted-foreground text-center mt-2', tg('coquin.randomQuestions', '🎲 15 questions aléatoires parmi 30 à découvrir !')));

    var startBtn = el('button', 'btn btn-cta btn-gradient w-full mt-4', '🔥 ' + tg('coquin.lightTheFlame', 'Allumer la flamme'));
    startBtn.addEventListener('click', function() {
      var n1 = document.getElementById('coquin-player-0').value.trim() || tg('playerSetup.player1', 'Joueur 1');
      var n2 = document.getElementById('coquin-player-1').value.trim() || tg('playerSetup.player2', 'Joueur 2');
      self.players = [{ name: n1 }, { name: n2 }];
      self.initRounds();
      self.phase = 'guessing'; self.render();
    });
    form.appendChild(startBtn);
    wrap.appendChild(form);
    this.container.appendChild(wrap);
  };

  CoquinQuiz.prototype.initRounds = function() {
    var allIndices = [];
    for (var i = 0; i < this.questions.length; i++) allIndices.push(i);
    var shuffled = shuffleArray(allIndices);
    var p1Questions = shuffled.slice(0, this.questionsPerPlayer);
    var p2Questions = shuffled.slice(this.questionsPerPlayer, this.questionsPerPlayer * 2);

    this.rounds = [];
    for (var j = 0; j < this.questionsPerPlayer; j++) {
      this.rounds.push({ qIdx: p1Questions[j], guesser: 0, target: 1, guess: null, actual: null, correct: null });
      this.rounds.push({ qIdx: p2Questions[j], guesser: 1, target: 0, guess: null, actual: null, correct: null });
    }
    this.currentRound = 0;
  };

  CoquinQuiz.prototype.renderGuessing = function() {
    var self = this;
    var round = this.rounds[this.currentRound];
    var q = this.questions[round.qIdx];
    var guesser = this.players[round.guesser];
    var target = this.players[round.target];

    var wrap = el('div', 'quiz-engine quiz-question-enter');
    renderProgressBar(wrap, this.currentRound, this.totalRounds, tg('question.roundXofY', 'Manche {{current}} sur {{total}}').replace('{{current}}', this.currentRound + 1).replace('{{total}}', this.totalRounds));

    wrap.appendChild(el('div', 'text-center mb-2 text-sm text-muted-foreground', esc(guesser.name) + ' ' + tg('coquin.guessFor', 'devine pour') + ' ' + esc(target.name)));
    renderPlayerBadge(wrap, guesser.name + ' ' + tg('question.itsYourTurnToGuess', 'c\'est à toi de deviner !'));

    var qText = tgd(this.prefix + '.q' + q.id, q.text);
    // Replace NAME/{{name}} with target player's name
    qText = qText.replace(/\bNAME\b/g, target.name).replace(/\{\{name\}\}/g, target.name);
    wrap.appendChild(el('h3', 'text-xl font-semibold mb-6 text-center', esc(qText)));

    var optionsWrap = el('div', 'space-y-2');
    q.options.forEach(function(opt, idx) {
      var optText = tgd(self.prefix + '.q' + q.id + opt.id, opt.text);
      var optBtn = el('button', 'quiz-option');
      var optLetters = ['A','B','C','D','E'];
      optBtn.innerHTML = '<span class="quiz-option-letter">' + (optLetters[idx] || '') + '</span><span>' + esc(optText) + '</span>';
      optBtn.style.animationDelay = (idx * 60) + 'ms';
      optBtn.addEventListener('mousemove', function(e) {
        var rect = optBtn.getBoundingClientRect();
        optBtn.style.setProperty('--ripple-x', ((e.clientX - rect.left) / rect.width * 100) + '%');
        optBtn.style.setProperty('--ripple-y', ((e.clientY - rect.top) / rect.height * 100) + '%');
      });
      optBtn.addEventListener('click', function() {
        optBtn.classList.add('selected');
        var siblings = optionsWrap.querySelectorAll('.quiz-option');
        for (var s = 0; s < siblings.length; s++) {
          if (siblings[s] !== optBtn) siblings[s].style.opacity = '0.5';
          siblings[s].style.pointerEvents = 'none';
        }
        round.guess = opt.id;
        setTimeout(function() { self.phase = 'revealing'; self.render(); }, 350);
      });
      optionsWrap.appendChild(optBtn);
    });
    wrap.appendChild(optionsWrap);
    this.container.appendChild(wrap);
  };

  CoquinQuiz.prototype.renderRevealing = function() {
    var self = this;
    var round = this.rounds[this.currentRound];
    var q = this.questions[round.qIdx];
    var target = this.players[round.target];

    var wrap = el('div', 'quiz-engine quiz-question-enter');
    renderProgressBar(wrap, this.currentRound, this.totalRounds, tg('question.roundXofY', 'Manche {{current}} sur {{total}}').replace('{{current}}', this.currentRound + 1).replace('{{total}}', this.totalRounds));

    wrap.appendChild(el('div', 'text-center mb-2', '📱 ' + tg('coquin.passPhone', 'Passez le téléphone à') + ' ' + esc(target.name)));
    renderPlayerBadge(wrap, target.name + ', ' + tg('coquin.revealAnswer', 'révèle ta vraie réponse !'));

    var qText = tgd(this.prefix + '.q' + q.id, q.text);
    qText = qText.replace(/\bNAME\b/g, target.name).replace(/\{\{name\}\}/g, target.name);
    wrap.appendChild(el('h3', 'text-xl font-semibold mb-4 text-center', esc(qText)));
    wrap.appendChild(el('p', 'text-sm text-muted-foreground text-center mb-4', tg('coquin.beHonest', 'Soyez honnête, c\'est plus fun !')));

    var optionsWrap = el('div', 'space-y-2');
    q.options.forEach(function(opt, idx) {
      var optText = tgd(self.prefix + '.q' + q.id + opt.id, opt.text);
      var optBtn = el('button', 'quiz-option');
      var optLetters = ['A','B','C','D','E'];
      optBtn.innerHTML = '<span class="quiz-option-letter">' + (optLetters[idx] || '') + '</span><span>' + esc(optText) + '</span>';
      optBtn.style.animationDelay = (idx * 60) + 'ms';
      optBtn.addEventListener('mousemove', function(e) {
        var rect = optBtn.getBoundingClientRect();
        optBtn.style.setProperty('--ripple-x', ((e.clientX - rect.left) / rect.width * 100) + '%');
        optBtn.style.setProperty('--ripple-y', ((e.clientY - rect.top) / rect.height * 100) + '%');
      });
      optBtn.addEventListener('click', function() {
        optBtn.classList.add('selected');
        var siblings = optionsWrap.querySelectorAll('.quiz-option');
        for (var s = 0; s < siblings.length; s++) {
          if (siblings[s] !== optBtn) siblings[s].style.opacity = '0.5';
          siblings[s].style.pointerEvents = 'none';
        }
        round.actual = opt.id;
        round.correct = (round.guess === opt.id);
        setTimeout(function() { self.phase = 'feedback'; self.render(); }, 350);
      });
      optionsWrap.appendChild(optBtn);
    });
    wrap.appendChild(optionsWrap);
    this.container.appendChild(wrap);
  };

  CoquinQuiz.prototype.renderFeedback = function() {
    var self = this;
    var round = this.rounds[this.currentRound];
    var q = this.questions[round.qIdx];
    var guesser = this.players[round.guesser];
    var target = this.players[round.target];
    var score = this.rounds.filter(function(r) { return r.correct === true; }).length;

    var wrap = el('div', 'quiz-engine animate-fade-in text-center');

    if (round.correct) {
      wrap.appendChild(el('div', 'text-5xl mb-4', '✅'));
      wrap.appendChild(el('h2', 'text-xl font-bold mb-3 text-green-500', tg('coquin.correctGuess', 'Bien deviné !')));
    } else {
      wrap.appendChild(el('div', 'text-5xl mb-4', '❌'));
      wrap.appendChild(el('h2', 'text-xl font-bold mb-3 text-red-500', tg('coquin.wrongGuess', 'Raté !')));
    }

    // Show what was guessed vs actual
    var guessOpt = q.options.find(function(o) { return o.id === round.guess; });
    var actualOpt = q.options.find(function(o) { return o.id === round.actual; });
    if (guessOpt) {
      var guessText = tgd(self.prefix + '.q' + q.id + guessOpt.id, guessOpt.text);
      wrap.appendChild(el('p', 'text-sm text-muted-foreground mb-1', esc(guesser.name) + ' ' + tg('coquin.guessed', 'a deviné :') + ' ' + esc(guessText)));
    }
    if (actualOpt) {
      var actualText = tgd(self.prefix + '.q' + q.id + actualOpt.id, actualOpt.text);
      wrap.appendChild(el('p', 'text-sm text-muted-foreground mb-4', tg('coquin.realAnswer', 'La vraie réponse de') + ' ' + esc(target.name) + ' : ' + esc(actualText)));
    }

    wrap.appendChild(el('p', 'text-sm font-medium mb-6', tg('coquin.currentScore', 'Score actuel') + ' : ' + score + ' ' + tg('coquin.correctAnswers', 'bonnes réponses')));

    var nextBtn = el('button', 'btn btn-cta', tg('coquin.nextRound', 'Manche suivante'));
    nextBtn.addEventListener('click', function() {
      if (self.currentRound + 1 >= self.totalRounds) { self.phase = 'results'; }
      else { self.currentRound++; self.phase = 'guessing'; }
      self.render();
    });
    wrap.appendChild(nextBtn);
    this.container.appendChild(wrap);
  };

  CoquinQuiz.prototype.renderResults = function() {
    var self = this;
    var wrap = el('div', 'quiz-engine quiz-result-card text-center');
    var score = this.rounds.filter(function(r) { return r.correct === true; }).length;
    var pct = Math.round((score / this.totalRounds) * 100);

    wrap.appendChild(el('div', 'text-5xl mb-4', '🔥'));
    wrap.appendChild(el('h2', 'text-2xl font-bold mb-2', tg('coquin.resultsOf', 'Résultats de') + ' ' + esc(this.players[0].name) + ' & ' + esc(this.players[1].name)));
    wrap.appendChild(el('div', 'quiz-score-circle mx-auto mb-4', pct + '%'));
    wrap.appendChild(el('p', 'text-muted-foreground mb-6', score + '/' + this.totalRounds + ' ' + tg('coquin.goodGuesses', 'bonnes devinettes')));

    renderActionButtons(wrap, {
      newQuestions: function() { location.reload(); },
      restart: function() { self.phase = 'setup'; self.render(); }
    });
    this.container.appendChild(wrap);
    wrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // ═══════════════════════════════════════════════════════════
  // KNOWLEDGE QUIZ - Oral validation with ✅/❌ buttons
  // Player A says answer out loud, Player B validates
  // 20 questions, alternating guesser
  // ═══════════════════════════════════════════════════════════
  function KnowledgeQuiz(config) {
    this.container = config.container;
    this.questions = config.questions;
    this.prefix = config.prefix;
    this.lang = config.lang || 'fr';
    this.phase = 'setup';
    this.players = [null, null];
    this.currentQ = 0;
    this.scores = [0, 0];
    this.render();
  }

  KnowledgeQuiz.prototype.render = function() {
    this.container.innerHTML = '';
    if (this.phase === 'setup') this.renderSetup();
    else if (this.phase === 'question') this.renderQuestion();
    else if (this.phase === 'transition') this.renderTransition();
    else if (this.phase === 'results') this.renderResults();
  };

  KnowledgeQuiz.prototype.renderSetup = function() {
    var self = this;
    var wrap = el('div', 'quiz-engine animate-fade-in');

    var iconWrap = el('div', 'quiz-setup-icon mx-auto mb-4');
    iconWrap.innerHTML = ICONS.users;
    wrap.appendChild(iconWrap);

    wrap.appendChild(el('h2', 'text-2xl font-bold mb-2 text-center', tg('playerSetup.whoKnowsBest', 'Qui se connait le mieux ?')));
    wrap.appendChild(el('p', 'text-muted-foreground mb-6 text-center', tg('playerSetup.discoverWhoKnows', 'Découvrez qui connait mieux l\'autre !')));

    var form = el('div', 'space-y-4 max-w-md mx-auto');
    for (var i = 0; i < 2; i++) {
      (function(idx) {
        var card = el('div', 'glass-card rounded-xl p-4');
        var labelWrap = el('div', 'flex items-center gap-2 mb-2');
        var heartSpan = el('span', idx === 0 ? 'text-pink-500' : 'text-blue-500');
        heartSpan.innerHTML = ICONS.heart;
        labelWrap.appendChild(heartSpan);
        labelWrap.appendChild(el('span', 'text-sm font-medium', tg('playerSetup.player' + (idx + 1), 'Joueur ' + (idx + 1))));
        card.appendChild(labelWrap);
        var input = el('input', 'input w-full');
        input.type = 'text'; input.placeholder = tg('playerSetup.firstName', 'Prénom'); input.maxLength = 20;
        input.id = 'knowledge-player-' + idx;
        card.appendChild(input);
        form.appendChild(card);
      })(i);
    }

    var info = el('p', 'text-xs text-muted-foreground text-center mt-3', tg('playerSetup.questionsCount', '20 questions • Répondez chacun votre tour • Résultats individuels'));

    var startBtn = el('button', 'btn btn-cta btn-gradient w-full mt-4', tg('playerSetup.startQuiz', 'Commencer le quiz'));
    startBtn.addEventListener('click', function() {
      var n1 = document.getElementById('knowledge-player-0').value.trim() || tg('playerSetup.player1', 'Joueur 1');
      var n2 = document.getElementById('knowledge-player-1').value.trim() || tg('playerSetup.player2', 'Joueur 2');
      self.players = [{ name: n1 }, { name: n2 }];
      self.currentQ = 0; self.scores = [0, 0];
      self.phase = 'question'; self.render();
    });
    form.appendChild(info);
    form.appendChild(startBtn);
    wrap.appendChild(form);
    this.container.appendChild(wrap);
  };

  KnowledgeQuiz.prototype.getGuesser = function() { return this.currentQ % 2; };
  KnowledgeQuiz.prototype.getTarget = function() { return (this.currentQ + 1) % 2; };

  KnowledgeQuiz.prototype.renderQuestion = function() {
    var self = this;
    var q = this.questions[this.currentQ];
    var total = this.questions.length;
    var guesserIdx = this.getGuesser();
    var targetIdx = this.getTarget();
    var guesser = this.players[guesserIdx];
    var target = this.players[targetIdx];

    var wrap = el('div', 'quiz-engine quiz-question-enter');
    renderProgressBar(wrap, this.currentQ, total);

    // Instructions
    wrap.appendChild(el('div', 'text-center mb-2 text-sm font-medium', esc(guesser.name) + ', ' + tg('question.sayAnswerOutLoud', 'dis ta réponse à voix haute,')));
    wrap.appendChild(el('div', 'text-center mb-4 text-sm text-muted-foreground', esc(target.name) + ' ' + tg('question.validates', 'valide !')));

    var qText = tgd(this.prefix + '.q' + q.id, q.text);
    // Replace NAME/{{name}} placeholder with target player's name
    qText = qText.replace(/\bNAME\b/g, target.name).replace(/\{\{name\}\}/g, target.name);
    wrap.appendChild(el('h3', 'text-xl font-semibold mb-6 text-center', esc(qText)));

    // Show options as reference (read-only display)
    if (q.options && q.options.length > 0) {
      var optionsRef = el('div', 'space-y-1 mb-6');
      q.options.forEach(function(opt) {
        var optText = tgd(self.prefix + '.q' + q.id + opt.id, opt.text);
        optionsRef.appendChild(el('div', 'text-sm text-muted-foreground text-center py-1', esc(optText)));
      });
      wrap.appendChild(optionsRef);
    }

    // ✅ / ❌ validation buttons
    var validationWrap = el('div', 'flex justify-center gap-4 mt-4');

    var correctBtn = el('button', 'quiz-validate-btn quiz-validate-correct');
    correctBtn.innerHTML = ICONS.check + ' <span>' + tg('question.found', 'a trouvé !') + '</span>';
    correctBtn.addEventListener('click', function() {
      self.scores[guesserIdx]++;
      self.advance();
    });

    var wrongBtn = el('button', 'quiz-validate-btn quiz-validate-wrong');
    wrongBtn.innerHTML = ICONS.cross + ' <span>' + tg('question.wasMistaken', 's\'est trompé(e) !') + '</span>';
    wrongBtn.addEventListener('click', function() {
      self.advance();
    });

    validationWrap.appendChild(correctBtn);
    validationWrap.appendChild(wrongBtn);
    wrap.appendChild(validationWrap);

    this.container.appendChild(wrap);
  };

  KnowledgeQuiz.prototype.advance = function() {
    if (this.currentQ >= this.questions.length - 1) {
      this.phase = 'results';
      this.render();
    } else {
      this.phase = 'transition';
      this.render();
    }
  };

  KnowledgeQuiz.prototype.renderTransition = function() {
    var self = this;
    var nextGuesserIdx = (this.currentQ + 1) % 2;
    var nextGuesser = this.players[nextGuesserIdx];

    var wrap = el('div', 'quiz-engine animate-fade-in text-center');
    wrap.appendChild(el('div', 'text-5xl mb-4', '🎯'));
    wrap.appendChild(el('h2', 'text-xl font-bold mb-3', tg('question.itsTurnOf', 'C\'est au tour de') + ' ' + esc(nextGuesser.name) + ' !'));
    wrap.appendChild(el('p', 'text-muted-foreground mb-2', tg('question.getReadyToGuess', 'Préparez-vous à deviner !')));
    wrap.appendChild(el('p', 'text-sm text-muted-foreground mb-6', tg('coquin.currentScore', 'Score') + ' : ' + esc(this.players[0].name) + ' ' + this.scores[0] + ' - ' + this.scores[1] + ' ' + esc(this.players[1].name)));

    // Auto-advance after 2.5s or click (but never both)
    var advanced = false;
    function advance() {
      if (advanced) return;
      advanced = true;
      clearTimeout(timer);
      self.currentQ++;
      self.phase = 'question';
      self.render();
    }
    var btn = el('button', 'btn btn-cta', tg('question.nextQuestionBtn', 'Question suivante !'));
    btn.addEventListener('click', advance);
    wrap.appendChild(btn);
    var timer = setTimeout(advance, 2500);

    this.container.appendChild(wrap);
  };

  KnowledgeQuiz.prototype.renderResults = function() {
    var self = this;
    var wrap = el('div', 'quiz-engine quiz-result-card text-center');

    wrap.appendChild(el('h2', 'text-2xl font-bold mb-6', tg('result.quizResults', 'Résultats du quiz')));

    var scoresGrid = el('div', 'grid grid-cols-2 gap-4 mb-6');
    for (var i = 0; i < 2; i++) {
      var total = this.questions.length;
      var score = this.scores[i];
      var pct = Math.round((score / (total / 2)) * 100);
      var card = el('div', 'glass-card rounded-xl p-4 text-center');
      card.appendChild(el('p', 'font-semibold mb-2', esc(this.players[i].name)));
      card.appendChild(el('div', 'quiz-score-circle quiz-score-sm mx-auto mb-2', pct + '%'));
      card.appendChild(el('p', 'text-xs text-muted-foreground', score + '/' + Math.floor(total / 2) + ' ' + tg('coquin.correctAnswers', 'bonnes réponses')));
      scoresGrid.appendChild(card);
    }
    wrap.appendChild(scoresGrid);

    // Winner message
    var diff = this.scores[0] - this.scores[1];
    var msg = '';
    if (diff === 0) msg = tg('result.perfectTie', 'Égalité parfaite !');
    else if (Math.abs(diff) >= 5) msg = esc(this.players[diff > 0 ? 0 : 1].name) + ' ' + tg('result.knowsMuchBetter', 'connait beaucoup mieux') + ' ' + esc(this.players[diff > 0 ? 1 : 0].name) + ' !';
    else if (Math.abs(diff) >= 3) msg = esc(this.players[diff > 0 ? 0 : 1].name) + ' ' + tg('result.knowsSlightlyBetter', 'connait légèrement mieux') + ' ' + esc(this.players[diff > 0 ? 1 : 0].name);
    else msg = esc(this.players[diff > 0 ? 0 : 1].name) + ' ' + tg('result.knowsLittleBetter', 'connait un peu mieux') + ' ' + esc(this.players[diff > 0 ? 1 : 0].name);

    wrap.appendChild(el('p', 'text-lg font-medium mb-4', msg));

    renderActionButtons(wrap, {
      newQuestions: function() { location.reload(); },
      restart: function() { self.phase = 'setup'; self.render(); }
    });
    this.container.appendChild(wrap);
    wrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // ═══════════════════════════════════════════════════════════
  // DEBATE QUIZ - amoureux (1-5 scale, played together)
  // Both players discuss and rate agreement together
  // ═══════════════════════════════════════════════════════════
  function DebateQuiz(config) {
    this.container = config.container;
    this.questions = config.questions;
    this.results = config.results;
    this.prefix = config.prefix;
    this.lang = config.lang || 'fr';
    this.phase = 'setup';
    this.players = [null, null];
    this.currentQ = 0;
    this.scores = [];
    this.render();
  }

  DebateQuiz.prototype.render = function() {
    this.container.innerHTML = '';
    if (this.phase === 'setup') this.renderSetup();
    else if (this.phase === 'playing') this.renderQuestion();
    else if (this.phase === 'results') this.renderResults();
  };

  DebateQuiz.prototype.renderSetup = function() {
    var self = this;
    var wrap = el('div', 'quiz-engine animate-fade-in');

    wrap.appendChild(el('div', 'text-5xl mb-4 text-center', '💕'));
    wrap.appendChild(el('h2', 'text-2xl font-bold mb-2 text-center', tg('playerSetup.quizForTwo', 'Quiz à Faire en Couple')));
    wrap.appendChild(el('p', 'text-muted-foreground mb-4 text-center', tg('playerSetup.quizTogetherDesc', 'Ce quiz se joue ensemble. Discutez et notez de 1 à 5.')));

    // How it works
    var howBox = el('div', 'glass-card rounded-xl p-5 mb-6 max-w-md mx-auto text-left');
    howBox.innerHTML = '<p class="font-semibold mb-3">' + esc(tg('playerSetup.howItWorks', 'Comment ça marche ?')) + '</p>' +
      '<ol class="space-y-2 text-sm text-muted-foreground">' +
      '<li>1️⃣ ' + esc(tg('playerSetup.step1', 'Lisez chaque affirmation ensemble')) + '</li>' +
      '<li>2️⃣ ' + esc(tg('playerSetup.step2', 'Discutez et débattez si nécessaire')) + '</li>' +
      '<li>3️⃣ ' + esc(tg('playerSetup.step3', 'Choisissez un score de 1 à 5')) + '</li>' +
      '<li>4️⃣ ' + esc(tg('playerSetup.step4', 'Découvrez votre score d\'amour !')) + '</li></ol>';
    wrap.appendChild(howBox);

    var form = el('div', 'space-y-4 max-w-md mx-auto');
    for (var i = 0; i < 2; i++) {
      (function(idx) {
        var card = el('div', 'glass-card rounded-xl p-4');
        var labelWrap = el('div', 'flex items-center gap-2 mb-2');
        var heartSpan = el('span', idx === 0 ? 'text-pink-500' : 'text-blue-500');
        heartSpan.innerHTML = ICONS.heart;
        labelWrap.appendChild(heartSpan);
        labelWrap.appendChild(el('span', 'text-sm font-medium', idx === 0 ? tg('playerSetup.firstFirstName', 'Premier prénom') : tg('playerSetup.secondFirstName', 'Deuxième prénom')));
        card.appendChild(labelWrap);
        var input = el('input', 'input w-full');
        input.type = 'text'; input.placeholder = tg('playerSetup.firstName', 'Prénom'); input.maxLength = 20;
        input.id = 'debate-player-' + idx;
        card.appendChild(input);
        form.appendChild(card);
      })(i);
    }

    var startBtn = el('button', 'btn btn-cta btn-gradient w-full mt-4', tg('playerSetup.startQuiz', 'Commencer le quiz'));
    startBtn.addEventListener('click', function() {
      var n1 = document.getElementById('debate-player-0').value.trim() || tg('playerSetup.player1', 'Joueur 1');
      var n2 = document.getElementById('debate-player-1').value.trim() || tg('playerSetup.player2', 'Joueur 2');
      self.players = [{ name: n1 }, { name: n2 }];
      self.currentQ = 0; self.scores = [];
      self.phase = 'playing'; self.render();
    });
    form.appendChild(startBtn);
    wrap.appendChild(form);
    this.container.appendChild(wrap);
  };

  DebateQuiz.prototype.renderQuestion = function() {
    var self = this;
    var q = this.questions[this.currentQ];
    var total = this.questions.length;

    var wrap = el('div', 'quiz-engine quiz-question-enter');
    renderProgressBar(wrap, this.currentQ, total);

    var qText = tgd(this.prefix + '.q' + q.id, q.text);
    wrap.appendChild(el('h3', 'text-xl font-semibold mb-2 text-center', esc(qText)));
    wrap.appendChild(el('p', 'text-sm text-muted-foreground mb-6 text-center', tg('question.discussAndChoose', 'Discutez ensemble et choisissez votre niveau d\'accord')));

    // 1-5 Scale buttons
    var scaleLabels = [
      tg('question.stronglyDisagree', 'Pas du tout d\'accord'),
      tg('question.disagree', 'Plutôt pas d\'accord'),
      tg('question.neutral', 'Neutre'),
      tg('question.agree', 'Plutôt d\'accord'),
      tg('question.stronglyAgree', 'Tout à fait d\'accord')
    ];

    var scaleWrap = el('div', 'space-y-2');
    for (var s = 1; s <= 5; s++) {
      (function(score) {
        var scaleEmojis = ['😕', '😐', '🙂', '😊', '😍'];
        var scaleBtn = el('button', 'quiz-option quiz-scale-option');
        scaleBtn.innerHTML = '<span class="quiz-scale-number">' + score + '</span> <span class="quiz-scale-emoji">' + scaleEmojis[score - 1] + '</span> <span>' + esc(scaleLabels[score - 1]) + '</span>';
        scaleBtn.style.animationDelay = ((score - 1) * 60) + 'ms';
        scaleBtn.addEventListener('click', function() {
          scaleBtn.classList.add('selected');
          var siblings = scaleWrap.querySelectorAll('.quiz-option');
          for (var s = 0; s < siblings.length; s++) {
            if (siblings[s] !== scaleBtn) siblings[s].style.opacity = '0.5';
            siblings[s].style.pointerEvents = 'none';
          }
          self.scores[self.currentQ] = score;
          setTimeout(function() {
            if (self.currentQ < total - 1) { self.currentQ++; self.render(); }
            else { self.phase = 'results'; self.render(); }
          }, 350);
        });
        scaleWrap.appendChild(scaleBtn);
      })(s);
    }
    wrap.appendChild(scaleWrap);

    // Back button
    if (this.currentQ > 0) {
      var navWrap = el('div', 'mt-4');
      var backBtn = el('button', 'btn btn-ghost text-sm', '&larr; ' + tg('question.previousQuestion', 'Précédent'));
      backBtn.addEventListener('click', function() { self.currentQ--; self.render(); });
      navWrap.appendChild(backBtn);
      wrap.appendChild(navWrap);
    }

    this.container.appendChild(wrap);
  };

  DebateQuiz.prototype.renderResults = function() {
    var self = this;
    var wrap = el('div', 'quiz-engine quiz-result-card text-center');
    var total = this.questions.length;
    var totalScore = this.scores.reduce(function(s, v) { return s + (v || 0); }, 0);
    var pct = Math.round((totalScore / (total * 5)) * 100);

    wrap.appendChild(el('div', 'text-5xl mb-4', '💕'));
    wrap.appendChild(el('h2', 'text-2xl font-bold mb-2', tg('result.loveScore', 'Score d\'amour')));
    wrap.appendChild(el('div', 'quiz-score-circle mx-auto mb-4', pct + '%'));
    wrap.appendChild(el('p', 'text-muted-foreground mb-6', totalScore + '/' + (total * 5) + ' points'));

    // Find matching result
    var result = null;
    for (var i = 0; i < this.results.length; i++) {
      var r = this.results[i];
      if (pct >= (r.minScore || r.min || 0) && pct <= (r.maxScore || r.max || 100)) { result = r; break; }
    }
    if (result) {
      wrap.appendChild(el('h3', 'text-xl font-bold mb-3', esc(result.title)));
      wrap.appendChild(el('p', 'text-muted-foreground leading-relaxed max-w-lg mx-auto mb-4', result.description));
      if (result.advice) {
        var advice = el('div', 'text-sm text-foreground bg-primary/5 border border-primary/20 rounded-xl p-5 mt-4 text-left max-w-lg mx-auto');
        advice.innerHTML = '<strong class="block mb-2">' + esc(tg('result.ourAdvice', 'Notre conseil')) + '</strong>' + esc(result.advice);
        wrap.appendChild(advice);
      }
    }

    renderActionButtons(wrap, {
      newQuestions: function() { location.reload(); },
      restart: function() { self.phase = 'setup'; self.render(); }
    });
    this.container.appendChild(wrap);
    wrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // ═══════════════════════════════════════════════════════════
  // FUNNY QUIZ - marrant (discussion only, no scoring)
  // Both players read question aloud, discuss, then "Next"
  // ═══════════════════════════════════════════════════════════
  function FunnyQuiz(config) {
    this.container = config.container;
    this.questions = config.questions;
    this.prefix = config.prefix;
    this.lang = config.lang || 'fr';
    this.phase = 'setup';
    this.players = [null, null];
    this.currentQ = 0;
    this.render();
  }

  FunnyQuiz.prototype.render = function() {
    this.container.innerHTML = '';
    if (this.phase === 'setup') this.renderSetup();
    else if (this.phase === 'playing') this.renderQuestion();
    else if (this.phase === 'results') this.renderResults();
  };

  FunnyQuiz.prototype.renderSetup = function() {
    var self = this;
    var wrap = el('div', 'quiz-engine animate-fade-in');

    wrap.appendChild(el('div', 'text-5xl mb-4 text-center', '😂'));
    wrap.appendChild(el('h2', 'text-2xl font-bold mb-2 text-center', tg('playerSetup.readyToLaugh', 'Prêts à rire ensemble ?')));
    wrap.appendChild(el('p', 'text-muted-foreground mb-6 text-center', tg('playerSetup.enterNamesFun', 'Entrez vos prénoms pour commencer le quiz fun !')));

    var form = el('div', 'space-y-4 max-w-md mx-auto');
    for (var i = 0; i < 2; i++) {
      (function(idx) {
        var card = el('div', 'glass-card rounded-xl p-4');
        var labelWrap = el('div', 'flex items-center gap-2 mb-2');
        var heartSpan = el('span', idx === 0 ? 'text-pink-500' : 'text-blue-500');
        heartSpan.innerHTML = ICONS.heart;
        labelWrap.appendChild(heartSpan);
        labelWrap.appendChild(el('span', 'text-sm font-medium', tg('playerSetup.player' + (idx + 1), 'Joueur ' + (idx + 1))));
        card.appendChild(labelWrap);
        var input = el('input', 'input w-full');
        input.type = 'text'; input.placeholder = tg('playerSetup.firstName', 'Prénom'); input.maxLength = 20;
        input.id = 'funny-player-' + idx;
        card.appendChild(input);
        form.appendChild(card);
      })(i);
    }

    var startBtn = el('button', 'btn btn-cta btn-gradient w-full mt-4', '😂 ' + tg('playerSetup.startQuiz', 'Commencer le quiz'));
    startBtn.addEventListener('click', function() {
      var n1 = document.getElementById('funny-player-0').value.trim() || tg('playerSetup.player1', 'Joueur 1');
      var n2 = document.getElementById('funny-player-1').value.trim() || tg('playerSetup.player2', 'Joueur 2');
      self.players = [{ name: n1 }, { name: n2 }];
      self.currentQ = 0;
      self.phase = 'playing'; self.render();
    });
    form.appendChild(startBtn);
    wrap.appendChild(form);
    this.container.appendChild(wrap);
  };

  FunnyQuiz.prototype.renderQuestion = function() {
    var self = this;
    var q = this.questions[this.currentQ];
    var total = this.questions.length;

    var wrap = el('div', 'quiz-engine quiz-question-enter');
    renderProgressBar(wrap, this.currentQ, total);

    var qText = tgd(this.prefix + '.q' + q.id, q.text);
    wrap.appendChild(el('h3', 'text-xl font-semibold mb-4 text-center', esc(qText)));

    // Options displayed as conversation starters (read-only)
    var optionsWrap = el('div', 'space-y-2 mb-6');
    q.options.forEach(function(opt) {
      var optText = tgd(self.prefix + '.q' + q.id + opt.id, opt.text);
      var optEl = el('div', 'quiz-option-display');
      optEl.textContent = optText;
      optionsWrap.appendChild(optEl);
    });
    wrap.appendChild(optionsWrap);

    wrap.appendChild(el('p', 'text-sm text-muted-foreground text-center mb-4', '💬 Discutez de vos réponses ensemble !'));

    // Navigation
    var navWrap = el('div', 'flex justify-between items-center mt-4');
    if (this.currentQ > 0) {
      var backBtn = el('button', 'btn btn-ghost text-sm', '&larr; ' + tg('question.previousQuestion', 'Précédent'));
      backBtn.addEventListener('click', function() { self.currentQ--; self.render(); });
      navWrap.appendChild(backBtn);
    } else {
      navWrap.appendChild(el('div'));
    }

    var nextBtn = el('button', 'btn btn-cta', tg('question.nextQuestionBtn', 'Question suivante !') + ' →');
    nextBtn.addEventListener('click', function() {
      if (self.currentQ < total - 1) { self.currentQ++; self.render(); }
      else { self.phase = 'results'; self.render(); }
    });
    navWrap.appendChild(nextBtn);
    wrap.appendChild(navWrap);

    this.container.appendChild(wrap);
  };

  FunnyQuiz.prototype.renderResults = function() {
    var self = this;
    var wrap = el('div', 'quiz-engine quiz-result-card text-center');
    wrap.appendChild(el('div', 'text-5xl mb-4', '🎉'));
    wrap.appendChild(el('h2', 'text-2xl font-bold mb-3', tg('result.bravo', 'Bravo') + ' ' + esc(this.players[0].name) + ' & ' + esc(this.players[1].name) + ' !'));
    wrap.appendChild(el('p', 'text-lg text-muted-foreground mb-2', tg('result.completedQuestions', 'Vous avez terminé les 20 questions !')));
    wrap.appendChild(el('p', 'text-muted-foreground mb-4', tg('result.sharedMoment', 'Vous avez partagé un super moment ensemble !')));
    wrap.appendChild(el('p', 'text-sm text-muted-foreground mb-6', tg('result.bestMemories', 'Les meilleurs souvenirs se construisent dans le rire et la complicité 💕')));

    renderActionButtons(wrap, {
      newQuestions: function() { location.reload(); },
      restart: function() { self.phase = 'setup'; self.render(); }
    });
    this.container.appendChild(wrap);
    wrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // ═══════════════════════════════════════════════════════════
  // MOST QUIZ - "Qui est le plus..." (2-8 players, vote)
  // Players vote for who best matches each question
  // ═══════════════════════════════════════════════════════════
  function MostQuiz(config) {
    this.container = config.container;
    this.questions = config.questions;
    this.prefix = config.prefix;
    this.lang = config.lang || 'fr';
    this.phase = 'setup';
    this.players = [];
    this.currentQ = 0;
    this.designations = {};
    this.render();
  }

  MostQuiz.prototype.render = function() {
    this.container.innerHTML = '';
    if (this.phase === 'setup') this.renderSetup();
    else if (this.phase === 'question') this.renderQuestion();
    else if (this.phase === 'transition') this.renderTransition();
    else if (this.phase === 'results') this.renderResults();
  };

  MostQuiz.prototype.renderSetup = function() {
    var self = this;
    this.players = [{ name: '', letter: 'A' }, { name: '', letter: 'B' }];
    var wrap = el('div', 'quiz-engine animate-fade-in');

    var iconWrap = el('div', 'quiz-setup-icon mx-auto mb-4');
    iconWrap.innerHTML = ICONS.users;
    wrap.appendChild(iconWrap);

    wrap.appendChild(el('h2', 'text-2xl font-bold mb-2 text-center', tg('playerSetup.whoParticipates', 'Qui participe au quiz ?')));
    wrap.appendChild(el('p', 'text-muted-foreground mb-6 text-center', tg('playerSetup.addPlayers', 'Ajoutez entre 2 et 8 joueurs')));

    var playersContainer = el('div', 'space-y-3 max-w-md mx-auto');
    playersContainer.id = 'most-players-list';

    function renderPlayersList() {
      playersContainer.innerHTML = '';
      self.players.forEach(function(p, idx) {
        var card = el('div', 'glass-card rounded-xl p-3 flex items-center gap-3');
        var letter = el('div', 'quiz-player-letter');
        letter.textContent = String.fromCharCode(65 + idx);
        card.appendChild(letter);
        var input = el('input', 'input flex-1');
        input.type = 'text';
        input.placeholder = tg('playerSetup.playerName', 'Prénom du joueur');
        input.maxLength = 20;
        input.value = p.name;
        input.addEventListener('input', function() { self.players[idx].name = this.value; });
        card.appendChild(input);
        if (self.players.length > 2) {
          var removeBtn = el('button', 'btn-icon text-red-400 hover:text-red-500');
          removeBtn.innerHTML = ICONS.trash;
          removeBtn.title = tg('playerSetup.removePlayer', 'Supprimer');
          removeBtn.addEventListener('click', function() {
            self.players.splice(idx, 1);
            renderPlayersList();
          });
          card.appendChild(removeBtn);
        }
        playersContainer.appendChild(card);
      });

      // Add player button
      if (self.players.length < 8) {
        var addBtn = el('button', 'quiz-add-player-btn');
        addBtn.innerHTML = ICONS.plus + ' <span>' + tg('playerSetup.addPlayer', 'Ajouter un joueur') + '</span> <span class="text-muted-foreground text-xs">(' + self.players.length + '/8)</span>';
        addBtn.addEventListener('click', function() {
          self.players.push({ name: '', letter: String.fromCharCode(65 + self.players.length) });
          renderPlayersList();
        });
        playersContainer.appendChild(addBtn);
      }
    }

    renderPlayersList();

    var startBtn = el('button', 'btn btn-cta btn-gradient w-full mt-8 max-w-md mx-auto');
    startBtn.id = 'most-start-btn';
    startBtn.textContent = tg('playerSetup.startQuiz', 'Commencer le quiz');
    startBtn.addEventListener('click', function() {
      // Validate all names filled
      var allFilled = self.players.every(function(p) { return p.name.trim().length > 0; });
      if (!allFilled) {
        var warn = document.getElementById('most-warning');
        if (!warn) {
          warn = el('p', 'text-sm text-red-500 text-center mt-2');
          warn.id = 'most-warning';
          warn.textContent = tg('playerSetup.fillAllNames', 'Remplissez tous les prénoms');
          startBtn.parentElement.insertBefore(warn, startBtn.nextSibling);
        }
        return;
      }
      self.players.forEach(function(p, i) {
        p.letter = String.fromCharCode(65 + i);
        p.name = p.name.trim();
      });
      self.designations = {};
      self.players.forEach(function(p) { self.designations[p.letter] = 0; });
      self.currentQ = 0;
      self.phase = 'question'; self.render();
    });

    wrap.appendChild(playersContainer);
    wrap.appendChild(startBtn);
    this.container.appendChild(wrap);
  };

  MostQuiz.prototype.renderQuestion = function() {
    var self = this;
    var q = this.questions[this.currentQ];
    var total = this.questions.length;

    var wrap = el('div', 'quiz-engine quiz-question-enter');
    renderProgressBar(wrap, this.currentQ, total);

    var qText = tgd(this.prefix + '.q' + q.id, q.text);
    wrap.appendChild(el('h3', 'text-xl font-semibold mb-2 text-center', esc(qText)));
    wrap.appendChild(el('p', 'text-sm text-muted-foreground mb-6 text-center', tg('question.voteInstruction', 'Votez ensemble ! Qui correspond le mieux ?')));

    // Player buttons - dynamic based on actual players
    var playersWrap = el('div', 'quiz-most-players-grid');
    this.players.forEach(function(p) {
      var playerBtn = el('button', 'quiz-most-player-btn');
      playerBtn.innerHTML = '<span class="quiz-player-letter-sm">' + esc(p.letter) + '</span><span>' + esc(p.name) + '</span>';
      playerBtn.addEventListener('click', function() {
        playerBtn.classList.add('selected');
        var siblings = playersWrap.querySelectorAll('.quiz-most-player-btn');
        for (var s = 0; s < siblings.length; s++) {
          if (siblings[s] !== playerBtn) { siblings[s].style.opacity = '0.5'; siblings[s].style.pointerEvents = 'none'; }
        }
        var nobodyBtn = playersWrap.querySelector('.quiz-most-nobody-btn');
        if (nobodyBtn) { nobodyBtn.style.opacity = '0.5'; nobodyBtn.style.pointerEvents = 'none'; }
        self.designations[p.letter] = (self.designations[p.letter] || 0) + 1;
        setTimeout(function() { self.advanceQuestion(); }, 400);
      });
      playersWrap.appendChild(playerBtn);
    });

    // "Personne" button
    var nobodyBtn = el('button', 'quiz-most-player-btn quiz-most-nobody-btn');
    nobodyBtn.innerHTML = '<span>🤷</span><span>' + tg('question.nobody', 'Personne') + '</span>';
    nobodyBtn.addEventListener('click', function() {
      nobodyBtn.classList.add('selected');
      var siblings = playersWrap.querySelectorAll('.quiz-most-player-btn');
      for (var s = 0; s < siblings.length; s++) {
        if (siblings[s] !== nobodyBtn) { siblings[s].style.opacity = '0.5'; siblings[s].style.pointerEvents = 'none'; }
      }
      setTimeout(function() { self.advanceQuestion(); }, 400);
    });
    playersWrap.appendChild(nobodyBtn);

    wrap.appendChild(playersWrap);
    this.container.appendChild(wrap);
  };

  MostQuiz.prototype.advanceQuestion = function() {
    if (this.currentQ >= this.questions.length - 1) {
      this.phase = 'results'; this.render();
    } else {
      this.phase = 'transition'; this.render();
    }
  };

  MostQuiz.prototype.renderTransition = function() {
    var self = this;
    var wrap = el('div', 'quiz-engine animate-fade-in text-center');
    wrap.appendChild(el('div', 'text-5xl mb-4', '🎯'));
    wrap.appendChild(el('h2', 'text-xl font-bold mb-6', tg('question.getReadyToVote', 'Préparez-vous à voter ! 🎯')));

    var timer = setTimeout(function() {
      self.currentQ++; self.phase = 'question'; self.render();
    }, 2000);

    var skipBtn = el('button', 'btn btn-ghost text-sm', tg('question.nextQuestionTransition', 'Question suivante !'));
    skipBtn.addEventListener('click', function() {
      clearTimeout(timer);
      self.currentQ++; self.phase = 'question'; self.render();
    });
    wrap.appendChild(skipBtn);
    this.container.appendChild(wrap);
  };

  MostQuiz.prototype.renderResults = function() {
    var self = this;
    var wrap = el('div', 'quiz-engine quiz-result-card text-center');

    wrap.appendChild(el('h2', 'text-2xl font-bold mb-6', tg('result.quizResults', 'Résultats du quiz')));

    // Sort players by designation count
    var sorted = this.players.slice().sort(function(a, b) {
      return (self.designations[b.letter] || 0) - (self.designations[a.letter] || 0);
    });

    // Ranking
    var ranking = el('div', 'space-y-3 max-w-md mx-auto mb-6');
    sorted.forEach(function(p, idx) {
      var count = self.designations[p.letter] || 0;
      var podiumClass = idx === 0 ? 'quiz-podium-gold' : idx === 1 ? 'quiz-podium-silver' : idx === 2 ? 'quiz-podium-bronze' : '';
      var card = el('div', 'glass-card rounded-xl p-4 flex items-center gap-3 quiz-reveal-enter ' + podiumClass);
      card.style.animationDelay = (idx * 100) + 'ms';
      var medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : (idx + 1) + '.';
      var barPct = sorted[0] && self.designations[sorted[0].letter] ? Math.round((count / self.designations[sorted[0].letter]) * 100) : 0;
      card.innerHTML = '<span class="text-2xl">' + medal + '</span>' +
        '<span class="quiz-player-letter-sm">' + esc(p.letter) + '</span>' +
        '<div class="flex-1"><span class="font-medium block">' + esc(p.name) + '</span>' +
        '<div class="quiz-podium-bar mt-1"><div class="quiz-podium-bar-fill" style="width:' + barPct + '%"></div></div></div>' +
        '<span class="text-muted-foreground font-semibold">' + count + ' ' + tg('result.times', 'fois') + '</span>';
      ranking.appendChild(card);
    });
    wrap.appendChild(ranking);

    // Winner message
    var topCount = self.designations[sorted[0].letter] || 0;
    var secondCount = sorted.length > 1 ? (self.designations[sorted[1].letter] || 0) : 0;
    var msg = '';
    if (topCount === 0) msg = tg('result.nobodyDominated', 'Personne n\'a vraiment dominé ce quiz !');
    else if (topCount - secondCount >= 5) msg = esc(sorted[0].name) + ' ' + tg('result.clearlyTheStar', 'est clairement la star !');
    else if (topCount > secondCount) msg = esc(sorted[0].name) + ' ' + tg('result.standsOut', 'se démarque du groupe !');
    else msg = tg('result.nobodyDominated', 'Égalité ! Vous êtes tous uniques !');
    wrap.appendChild(el('p', 'text-lg font-medium mb-4', msg));

    renderActionButtons(wrap, {
      newQuestions: function() { location.reload(); },
      changePlayers: function() { self.phase = 'setup'; self.render(); }
    });
    this.container.appendChild(wrap);
    wrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // ═══════════════════════════════════════════════════════════
  // HEALTHY QUIZ - couple-sain (weighted scoring, 2 players + gender)
  // Each answer has weighted points: a=3, b=2, c=1, d=0
  // Both players answer each question, scores summed
  // ═══════════════════════════════════════════════════════════
  function HealthyQuiz(config) {
    this.container = config.container;
    this.questions = config.questions;
    this.results = config.results;
    this.prefix = config.prefix;
    this.lang = config.lang || 'fr';
    this.phase = 'setup';
    this.players = [null, null];
    this.currentQ = 0;
    this.currentPlayer = 0;
    this.scores = [[], []];
    this.maxScorePerPlayer = this.questions.length * 3;
    this.render();
  }

  HealthyQuiz.prototype.render = function() {
    this.container.innerHTML = '';
    if (this.phase === 'setup') this.renderSetup();
    else if (this.phase === 'handoff') this.renderHandoff();
    else if (this.phase === 'playing') this.renderQuestion();
    else if (this.phase === 'results') this.renderResults();
  };

  HealthyQuiz.prototype.renderSetup = function() {
    var self = this;
    var wrap = el('div', 'quiz-engine quiz-setup-screen animate-fade-in');

    var iconWrap = el('div', 'quiz-setup-icon mx-auto mb-6');
    iconWrap.innerHTML = ICONS.users;
    wrap.appendChild(iconWrap);

    wrap.appendChild(el('h2', 'text-2xl font-bold mb-3 text-center', tg('playerSetup.readyForTest', 'Prêts pour le test ?')));
    wrap.appendChild(el('p', 'text-muted-foreground mb-8 text-center', tg('playerSetup.enterNames', 'Entrez vos prénoms et commencez le test à deux !')));

    var form = el('div', 'quiz-setup-grid max-w-lg mx-auto');
    var genders = ['', ''];

    for (var i = 0; i < 2; i++) {
      (function(idx) {
        var card = el('div', 'quiz-player-card');
        var numCircle = el('div', 'quiz-player-number');
        numCircle.textContent = (idx + 1);
        card.appendChild(numCircle);
        var label = el('label', 'block text-sm font-semibold mb-2 text-center', tg('playerSetup.player' + (idx + 1), 'Joueur ' + (idx + 1)));
        var input = el('input', 'input w-full');
        input.type = 'text'; input.placeholder = tg('playerSetup.firstName', 'Prénom'); input.maxLength = 20;
        input.id = 'healthy-player-' + idx;
        card.appendChild(label);
        card.appendChild(input);

        // Gender buttons
        var gLabel = el('label', 'block text-sm font-semibold mt-4 mb-2 text-center', tg('playerSetup.gender', 'Genre'));
        card.appendChild(gLabel);
        var gWrap = el('div', 'flex gap-3 justify-center');
        var maleBtn = el('button', 'gender-btn', '👨 ' + tg('playerSetup.male', 'Homme'));
        var femaleBtn = el('button', 'gender-btn', '👩 ' + tg('playerSetup.female', 'Femme'));
        maleBtn.addEventListener('click', function() {
          genders[idx] = 'homme';
          maleBtn.className = 'gender-btn gender-btn-selected gender-btn-male';
          femaleBtn.className = 'gender-btn';
        });
        femaleBtn.addEventListener('click', function() {
          genders[idx] = 'femme';
          femaleBtn.className = 'gender-btn gender-btn-selected gender-btn-female';
          maleBtn.className = 'gender-btn';
        });
        gWrap.appendChild(maleBtn);
        gWrap.appendChild(femaleBtn);
        card.appendChild(gWrap);
        form.appendChild(card);
      })(i);
    }

    var startBtn = el('button', 'btn btn-cta btn-gradient quiz-setup-start-btn', tg('playerSetup.startTest', 'Commencer le test'));
    startBtn.addEventListener('click', function() {
      var n1 = document.getElementById('healthy-player-0').value.trim() || tg('playerSetup.player1', 'Joueur 1');
      var n2 = document.getElementById('healthy-player-1').value.trim() || tg('playerSetup.player2', 'Joueur 2');
      self.players = [
        { name: n1, gender: genders[0] || 'homme' },
        { name: n2, gender: genders[1] || 'femme' }
      ];
      self.currentQ = 0; self.currentPlayer = 0; self.scores = [[], []];
      self.phase = 'handoff'; self.render();
    });

    wrap.appendChild(form);
    wrap.appendChild(startBtn);
    this.container.appendChild(wrap);
  };

  HealthyQuiz.prototype.renderHandoff = function() {
    var self = this;
    var player = this.players[this.currentPlayer];
    var color = getPlayerColor(player, this.players[this.currentPlayer === 0 ? 1 : 0], this.currentPlayer);
    var wrap = el('div', 'quiz-engine animate-fade-in text-center');
    wrap.appendChild(el('div', 'text-5xl mb-4', '📱'));
    var t = el('h2', 'text-xl font-bold mb-3');
    t.textContent = tg('question.itsTurnOf', 'C\'est au tour de') + ' ' + player.name + ' !';
    wrap.appendChild(t);
    wrap.appendChild(el('p', 'text-muted-foreground mb-6', tg('question.passPhoneOrLookAway', 'Passez le téléphone ou détournez le regard')));

    var btn = el('button', 'btn btn-cta', tg('question.chooseAnswer', 'Répondre'));
    btn.style.background = color.bg;
    btn.addEventListener('click', function() { self.phase = 'playing'; self.render(); });
    wrap.appendChild(btn);
    this.container.appendChild(wrap);
  };

  HealthyQuiz.prototype.renderQuestion = function() {
    var self = this;
    var q = this.questions[this.currentQ];
    var total = this.questions.length;
    var totalAnswers = total * 2;
    var answeredCount = this.scores[0].length + this.scores[1].length;
    var player = this.players[this.currentPlayer];
    var color = getPlayerColor(player, this.players[this.currentPlayer === 0 ? 1 : 0], this.currentPlayer);

    var wrap = el('div', 'quiz-engine quiz-question-enter');
    renderProgressBar(wrap, answeredCount, totalAnswers, tg('question.question', 'Question') + ' ' + (this.currentQ + 1) + '/' + total);

    var badge = el('div', 'text-center mb-4');
    badge.innerHTML = '<span class="badge" style="background:' + color.bg + ';color:' + color.text + '">' + esc(player.name) + '</span>';
    wrap.appendChild(badge);

    var qText = tgd(this.prefix + '.q' + q.id, q.text);
    wrap.appendChild(el('h3', 'text-xl font-semibold mb-6 text-center', esc(qText)));

    var OPTION_SCORES = { a: 3, b: 2, c: 1, d: 0 };
    var optionsWrap = el('div', 'space-y-2');
    q.options.forEach(function(opt, idx) {
      var optText = tgd(self.prefix + '.q' + q.id + opt.id, opt.text);
      var optBtn = el('button', 'quiz-option');
      var optLetters = ['A','B','C','D','E'];
      optBtn.innerHTML = '<span class="quiz-option-letter">' + (optLetters[idx] || '') + '</span><span>' + esc(optText) + '</span>';
      optBtn.style.animationDelay = (idx * 60) + 'ms';
      optBtn.addEventListener('mousemove', function(e) {
        var rect = optBtn.getBoundingClientRect();
        optBtn.style.setProperty('--ripple-x', ((e.clientX - rect.left) / rect.width * 100) + '%');
        optBtn.style.setProperty('--ripple-y', ((e.clientY - rect.top) / rect.height * 100) + '%');
      });
      optBtn.addEventListener('click', function() {
        optBtn.classList.add('selected');
        var siblings = optionsWrap.querySelectorAll('.quiz-option');
        for (var s = 0; s < siblings.length; s++) {
          if (siblings[s] !== optBtn) siblings[s].style.opacity = '0.5';
          siblings[s].style.pointerEvents = 'none';
        }
        var score = OPTION_SCORES[opt.id] || 0;
        self.scores[self.currentPlayer].push(score);

        setTimeout(function() {
          if (self.currentPlayer === 0) {
            self.currentPlayer = 1;
            self.phase = 'handoff';
          } else if (self.currentQ < total - 1) {
            self.currentQ++;
            self.currentPlayer = 0;
            self.phase = 'handoff';
          } else {
            self.phase = 'results';
          }
          self.render();
        }, 350);
      });
      optionsWrap.appendChild(optBtn);
    });
    wrap.appendChild(optionsWrap);
    this.container.appendChild(wrap);
  };

  HealthyQuiz.prototype.renderResults = function() {
    var self = this;
    var wrap = el('div', 'quiz-engine quiz-result-card text-center');

    var s1 = this.scores[0].reduce(function(s, v) { return s + v; }, 0);
    var s2 = this.scores[1].reduce(function(s, v) { return s + v; }, 0);
    var totalScore = s1 + s2;
    var maxTotal = this.maxScorePerPlayer * 2;
    var pct = Math.round((totalScore / maxTotal) * 100);

    wrap.appendChild(el('h2', 'text-2xl font-bold mb-2', tg('result.totalCoupleScore', 'Score total du couple')));
    var mainRingDiv = el('div', '');
    mainRingDiv.innerHTML = renderScoreRing(pct);
    wrap.appendChild(mainRingDiv);
    wrap.appendChild(el('p', 'text-sm text-muted-foreground mb-6 quiz-reveal-enter', Math.round(totalScore) + '/' + maxTotal + ' points'));

    // Individual scores
    var scoresGrid = el('div', 'grid grid-cols-2 gap-4 mb-6');
    for (var i = 0; i < 2; i++) {
      var score = i === 0 ? s1 : s2;
      var color = getPlayerColor(this.players[i], this.players[i === 0 ? 1 : 0], i);
      var iPct = Math.round((score / this.maxScorePerPlayer) * 100);
      var card = el('div', 'glass-card rounded-xl p-4 text-center');
      card.innerHTML = '<p class="font-semibold mb-2" style="color:' + color.bg + '">' + esc(this.players[i].name) + '</p>' +
        renderScoreRing(iPct, 'sm') +
        '<p class="text-xs text-muted-foreground">' + Math.round(score) + '/' + this.maxScorePerPlayer + '</p>';
      scoresGrid.appendChild(card);
    }
    wrap.appendChild(scoresGrid);

    // Alert if big gap
    if (Math.abs(s1 - s2) > 10) {
      var gapAlert = el('div', 'glass-card rounded-xl p-4 mb-4 border-l-4 border-orange-400');
      gapAlert.innerHTML = '<p class="text-sm">⚠️ L\'écart entre vos scores est significatif. Prenez le temps de discuter de vos perceptions respectives.</p>';
      wrap.appendChild(gapAlert);
    }

    // Find matching result
    var result = null;
    for (var j = 0; j < this.results.length; j++) {
      var r = this.results[j];
      if (totalScore >= (r.min || r.minScore || 0) && totalScore <= (r.max || r.maxScore || 999)) { result = r; break; }
    }
    if (result) {
      wrap.appendChild(el('h3', 'text-xl font-bold mb-3', esc(result.title)));
      wrap.appendChild(el('p', 'text-muted-foreground leading-relaxed max-w-lg mx-auto mb-4', result.description));
      if (result.advice) {
        var adviceEl = el('div', 'text-sm text-foreground bg-primary/5 border border-primary/20 rounded-xl p-5 mt-4 text-left max-w-lg mx-auto');
        adviceEl.innerHTML = '<strong class="block mb-2">' + esc(tg('result.ourAdvice', 'Notre conseil')) + '</strong>' + esc(result.advice);
        wrap.appendChild(adviceEl);
      }
    }

    renderActionButtons(wrap, {
      newQuestions: function() { location.reload(); },
      restart: function() { self.phase = 'setup'; self.render(); }
    });
    this.container.appendChild(wrap);
    wrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // ═══════════════════════════════════════════════════════════
  // PARENTALITE QUIZ - 2 players, same questions, fixed point values per answer
  // Each answer has explicit points (0-3), both players answer all 20 questions
  // Individual scores + combined score, max 60 per player / 120 total
  // ═══════════════════════════════════════════════════════════
  function ParentaliteQuiz(config) {
    this.container = config.container;
    this.questions = config.questions;
    this.results = config.results || [];
    this.prefix = config.prefix;
    this.lang = config.lang || 'fr';
    this.phase = 'setup';
    this.players = [null, null];
    this.currentQ = 0;
    this.currentPlayer = 0;
    this.scores = [[], []];
    var maxPts = 0;
    for (var i = 0; i < this.questions.length; i++) {
      var qMax = 0;
      for (var j = 0; j < this.questions[i].options.length; j++) {
        if (this.questions[i].options[j].points > qMax) qMax = this.questions[i].options[j].points;
      }
      maxPts += qMax;
    }
    this.maxPerPlayer = maxPts || 60;
    this.render();
  }

  ParentaliteQuiz.prototype.render = function() {
    this.container.innerHTML = '';
    if (this.phase === 'setup') this.renderSetup();
    else if (this.phase === 'handoff') this.renderHandoff();
    else if (this.phase === 'playing') this.renderQuestion();
    else if (this.phase === 'results') this.renderResults();
  };

  ParentaliteQuiz.prototype.renderSetup = function() {
    var self = this;
    var wrap = el('div', 'quiz-engine animate-fade-in');

    var iconWrap = el('div', 'quiz-setup-icon mx-auto mb-4');
    iconWrap.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
    wrap.appendChild(iconWrap);

    wrap.appendChild(el('h2', 'text-2xl font-bold mb-2 text-center', tg('playerSetup.readyForTest', 'Prêts pour le test ?')));
    wrap.appendChild(el('p', 'text-muted-foreground mb-2 text-center', tg('parentalite.setupDesc', 'Répondez chacun de votre côté aux mêmes 20 questions.')));
    wrap.appendChild(el('p', 'text-sm text-muted-foreground mb-6 text-center', '20 questions &bull; ' + tg('meta.duration', '10 min') + ' &bull; ' + tg('parentalite.scoreOn60', 'Score sur 60 par personne')));

    var form = el('div', 'quiz-setup-grid max-w-lg mx-auto');

    for (var i = 0; i < 2; i++) {
      (function(idx) {
        var card = el('div', 'glass-card rounded-xl p-5');
        var numCircle = el('div', 'quiz-player-number');
        numCircle.textContent = (idx + 1);
        card.appendChild(numCircle);
        var label = el('label', 'block text-sm font-medium mb-2', tg('playerSetup.player' + (idx + 1), 'Joueur ' + (idx + 1)));
        var input = el('input', 'input w-full');
        input.type = 'text'; input.placeholder = tg('playerSetup.firstName', 'Prénom'); input.maxLength = 20;
        input.id = 'parentalite-player-' + idx;
        card.appendChild(label);
        card.appendChild(input);
        form.appendChild(card);
      })(i);
    }

    var startBtn = el('button', 'btn btn-cta btn-gradient w-full mt-4', tg('playerSetup.startTest', 'Commencer le test'));
    startBtn.addEventListener('click', function() {
      var n1 = document.getElementById('parentalite-player-0').value.trim() || tg('playerSetup.player1', 'Joueur 1');
      var n2 = document.getElementById('parentalite-player-1').value.trim() || tg('playerSetup.player2', 'Joueur 2');
      self.players = [{ name: n1 }, { name: n2 }];
      self.currentQ = 0; self.currentPlayer = 0; self.scores = [[], []];
      self.phase = 'handoff'; self.render();
    });

    wrap.appendChild(form);
    wrap.appendChild(startBtn);
    this.container.appendChild(wrap);
  };

  ParentaliteQuiz.prototype.renderHandoff = function() {
    var self = this;
    var player = this.players[this.currentPlayer];
    var colors = [{ bg: '#ec4899', text: '#fff' }, { bg: '#3b82f6', text: '#fff' }];
    var color = colors[this.currentPlayer];
    var wrap = el('div', 'quiz-engine animate-fade-in text-center');
    wrap.appendChild(el('div', 'text-5xl mb-4', '📱'));
    var heading = el('h2', 'text-xl font-bold mb-3');
    heading.textContent = tg('question.itsTurnOf', 'C\'est au tour de') + ' ' + player.name + ' !';
    wrap.appendChild(heading);
    wrap.appendChild(el('p', 'text-muted-foreground mb-6', tg('question.passPhoneOrLookAway', 'Passez le téléphone ou détournez le regard')));

    var btn = el('button', 'btn btn-cta', tg('question.chooseAnswer', 'Répondre'));
    btn.style.background = color.bg;
    btn.addEventListener('click', function() { self.phase = 'playing'; self.render(); });
    wrap.appendChild(btn);
    this.container.appendChild(wrap);
  };

  ParentaliteQuiz.prototype.renderQuestion = function() {
    var self = this;
    var q = this.questions[this.currentQ];
    var total = this.questions.length;
    var totalAnswers = total * 2;
    var answeredCount = this.scores[0].length + this.scores[1].length;
    var player = this.players[this.currentPlayer];
    var colors = [{ bg: '#ec4899', text: '#fff' }, { bg: '#3b82f6', text: '#fff' }];
    var color = colors[this.currentPlayer];

    var wrap = el('div', 'quiz-engine quiz-question-enter');
    renderProgressBar(wrap, answeredCount, totalAnswers, tg('question.question', 'Question') + ' ' + (this.currentQ + 1) + '/' + total);

    var badge = el('div', 'text-center mb-4');
    badge.innerHTML = '<span class="badge" style="background:' + color.bg + ';color:' + color.text + '">' + esc(player.name) + '</span>';
    wrap.appendChild(badge);

    var qText = tgd(this.prefix + '.q' + q.id, q.text);
    wrap.appendChild(el('h3', 'text-xl font-semibold mb-6 text-center', esc(qText)));

    var optionsWrap = el('div', 'space-y-2');
    q.options.forEach(function(opt, idx) {
      var optText = tgd(self.prefix + '.q' + q.id + opt.id, opt.text);
      var optBtn = el('button', 'quiz-option');
      var optLetters = ['A','B','C','D','E'];
      optBtn.innerHTML = '<span class="quiz-option-letter">' + (optLetters[idx] || '') + '</span><span>' + esc(optText) + '</span>';
      optBtn.style.animationDelay = (idx * 60) + 'ms';
      optBtn.addEventListener('mousemove', function(e) {
        var rect = optBtn.getBoundingClientRect();
        optBtn.style.setProperty('--ripple-x', ((e.clientX - rect.left) / rect.width * 100) + '%');
        optBtn.style.setProperty('--ripple-y', ((e.clientY - rect.top) / rect.height * 100) + '%');
      });
      optBtn.addEventListener('click', function() {
        optBtn.classList.add('selected');
        var siblings = optionsWrap.querySelectorAll('.quiz-option');
        for (var s = 0; s < siblings.length; s++) {
          if (siblings[s] !== optBtn) siblings[s].style.opacity = '0.5';
          siblings[s].style.pointerEvents = 'none';
        }
        self.scores[self.currentPlayer].push(opt.points);

        setTimeout(function() {
          if (self.currentPlayer === 0) {
            self.currentPlayer = 1;
            self.phase = 'handoff';
          } else if (self.currentQ < total - 1) {
            self.currentQ++;
            self.currentPlayer = 0;
            self.phase = 'handoff';
          } else {
            self.phase = 'results';
          }
          self.render();
        }, 350);
      });
      optionsWrap.appendChild(optBtn);
    });
    wrap.appendChild(optionsWrap);
    this.container.appendChild(wrap);
  };

  ParentaliteQuiz.prototype.renderResults = function() {
    var self = this;
    var wrap = el('div', 'quiz-engine quiz-result-card text-center');

    var s1 = this.scores[0].reduce(function(s, v) { return s + v; }, 0);
    var s2 = this.scores[1].reduce(function(s, v) { return s + v; }, 0);
    var totalScore = s1 + s2;
    var maxTotal = this.maxPerPlayer * 2;
    var pct = Math.round((totalScore / maxTotal) * 100);

    // Combined score header
    wrap.appendChild(el('h2', 'text-2xl font-bold mb-2', tg('parentalite.combinedScore', 'Score global du couple')));
    var mainRingP = el('div', '');
    mainRingP.innerHTML = renderScoreRing(pct);
    wrap.appendChild(mainRingP);
    wrap.appendChild(el('p', 'text-sm text-muted-foreground mb-6 quiz-reveal-enter', totalScore + '/' + maxTotal));

    // Individual scores
    var scoresGrid = el('div', 'grid grid-cols-2 gap-4 mb-6');
    var colors = [{ bg: '#ec4899' }, { bg: '#3b82f6' }];
    for (var i = 0; i < 2; i++) {
      var score = i === 0 ? s1 : s2;
      var card = el('div', 'glass-card rounded-xl p-4 text-center');
      var iPctP = Math.round((score / this.maxPerPlayer) * 100);
      card.innerHTML = '<p class="font-semibold mb-2" style="color:' + colors[i].bg + '">' + esc(this.players[i].name) + '</p>' +
        renderScoreRing(iPctP, 'sm') +
        '<p class="text-xs text-muted-foreground">' + score + '/' + this.maxPerPlayer + '</p>';
      scoresGrid.appendChild(card);
    }
    wrap.appendChild(scoresGrid);

    // Alert if big gap between scores
    if (Math.abs(s1 - s2) > 15) {
      var gapAlert = el('div', 'glass-card rounded-xl p-4 mb-6 border-l-4 border-orange-400');
      gapAlert.innerHTML = '<p class="text-sm">' + esc(tg('parentalite.gapWarning', 'Il y a un écart significatif entre vos deux scores. C\'est souvent dans ces écarts que se trouvent les discussions les plus importantes à avoir.')) + '</p>';
      wrap.appendChild(gapAlert);
    }

    // Find matching result based on combined score
    var result = null;
    for (var j = 0; j < this.results.length; j++) {
      var r = this.results[j];
      // Use individual player score (average) to match results on 60-point scale
      var avgScore = totalScore / 2;
      if (avgScore >= (r.min || 0) && avgScore <= (r.max || 999)) { result = r; break; }
    }
    if (result) {
      var resultCard = el('div', 'glass-card rounded-xl p-6 mb-6 text-left max-w-lg mx-auto');
      resultCard.innerHTML = '<h3 class="text-xl font-bold mb-3 text-center">' + esc(result.title) + '</h3>' +
        '<p class="text-muted-foreground leading-relaxed mb-4">' + esc(result.description) + '</p>';
      if (result.advice) {
        resultCard.innerHTML += '<div class="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-3"><strong class="block mb-2">' +
          esc(tg('result.ourAdvice', 'Notre conseil')) + '</strong><span class="text-sm text-muted-foreground">' + esc(result.advice) + '</span></div>';
      }
      wrap.appendChild(resultCard);
    }

    renderActionButtons(wrap, {
      restart: function() { self.phase = 'setup'; self.render(); }
    });
    this.container.appendChild(wrap);
    wrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // ═══════════════════════════════════════════════════════════
  // TRUE/FALSE QUIZ - vrai-faux (solo, correct answer reveal)
  // Single player: statement → Vrai/Faux → reveal correct + explanation
  // ═══════════════════════════════════════════════════════════
  function TruefalseQuiz(config) {
    this.container = config.container;
    this.questions = config.questions;
    this.results = config.results;
    this.prefix = config.prefix;
    this.lang = config.lang || 'fr';
    this.phase = 'intro';
    this.currentQ = 0;
    this.score = 0;
    this.answers = [];
    this.render();
  }

  TruefalseQuiz.prototype.render = function() {
    this.container.innerHTML = '';
    if (this.phase === 'intro') this.renderIntro();
    else if (this.phase === 'playing') this.renderQuestion();
    else if (this.phase === 'reveal') this.renderReveal();
    else if (this.phase === 'results') this.renderResults();
  };

  TruefalseQuiz.prototype.renderIntro = function() {
    var self = this;
    var wrap = el('div', 'quiz-engine animate-fade-in text-center');
    wrap.appendChild(el('div', 'text-5xl mb-4', '✅'));
    wrap.appendChild(el('h2', 'text-2xl font-bold mb-3', tg('truefalse.ready', 'Prêt pour le vrai ou faux ?')));
    wrap.appendChild(el('p', 'text-muted-foreground mb-2', this.questions.length + ' ' + tg('truefalse.statements', 'affirmations')));
    wrap.appendChild(el('p', 'text-sm text-muted-foreground mb-6', '⏱ ' + tg('meta.duration', '5 min') + ' \u2022 ' + tg('truefalse.freeAnon', 'Gratuit & anonyme')));

    var infoBox = el('div', 'glass-card rounded-xl p-5 mb-6 max-w-md mx-auto text-left');
    infoBox.innerHTML = '<p class="text-sm text-muted-foreground mb-2"><strong>' + esc(tg('truefalse.howTitle', 'Comment ça marche ?')) + '</strong></p>' +
      '<p class="text-sm text-muted-foreground">' + esc(tg('truefalse.howDesc', 'Pour chaque affirmation, choisissez Vrai ou Faux. La bonne réponse et une explication s\'affichent après chaque question.')) + '</p>';
    wrap.appendChild(infoBox);

    var btn = el('button', 'btn btn-cta btn-lg', esc(tg('playerSetup.startQuiz', 'Commencer le quiz')));
    btn.addEventListener('click', function() {
      self.phase = 'playing';
      self.currentQ = 0;
      self.score = 0;
      self.answers = [];
      self.render();
    });
    wrap.appendChild(btn);
    this.container.appendChild(wrap);
  };

  TruefalseQuiz.prototype.renderQuestion = function() {
    var self = this;
    var q = this.questions[this.currentQ];
    var total = this.questions.length;
    var wrap = el('div', 'quiz-engine quiz-question-enter');

    renderProgressBar(wrap, this.currentQ, total);

    // Score display
    var scoreDisp = el('div', 'text-center mb-4');
    scoreDisp.innerHTML = '<span class="inline-flex items-center gap-2 text-sm font-medium text-primary bg-primary/10 rounded-full px-3 py-1">' +
      esc(tg('truefalse.score', 'Score')) + ': ' + this.score + '/' + this.currentQ + '</span>';
    wrap.appendChild(scoreDisp);

    // Statement
    var qText = tgd(this.prefix + '.q' + q.id, q.text);
    var qEl = el('h3', 'text-xl font-semibold mb-8 text-center leading-relaxed', esc(qText));
    wrap.appendChild(qEl);

    // True / False buttons
    var btnWrap = el('div', 'grid grid-cols-2 gap-4 max-w-md mx-auto');

    var trueBtn = el('button', 'quiz-tf-btn quiz-tf-btn--true');
    trueBtn.innerHTML = '<span class="quiz-tf-icon">✓</span><span class="quiz-tf-label">' + esc(tg('truefalse.true', 'Vrai')) + '</span>';
    trueBtn.addEventListener('click', function() { self.handleAnswer('true'); });

    var falseBtn = el('button', 'quiz-tf-btn quiz-tf-btn--false');
    falseBtn.innerHTML = '<span class="quiz-tf-icon">✗</span><span class="quiz-tf-label">' + esc(tg('truefalse.false', 'Faux')) + '</span>';
    falseBtn.addEventListener('click', function() { self.handleAnswer('false'); });

    btnWrap.appendChild(trueBtn);
    btnWrap.appendChild(falseBtn);
    wrap.appendChild(btnWrap);

    // Back button
    if (this.currentQ > 0) {
      var navWrap = el('div', 'flex justify-center mt-6');
      var backBtn = el('button', 'btn btn-ghost text-sm', '&larr; ' + tg('question.previousQuestion', 'Précédent'));
      backBtn.addEventListener('click', function() {
        var prev = self.answers[self.currentQ - 1];
        if (prev && prev.correct) self.score--;
        self.answers.splice(self.currentQ - 1, 1);
        self.currentQ--;
        self.render();
      });
      navWrap.appendChild(backBtn);
      wrap.appendChild(navWrap);
    }

    this.container.appendChild(wrap);
  };

  TruefalseQuiz.prototype.handleAnswer = function(userAnswer) {
    var q = this.questions[this.currentQ];
    var correctAnswer = tgd(this.prefix + '.q' + q.id + 'answer', q.answer || 'true').trim().toLowerCase();
    var isCorrect = userAnswer === correctAnswer;
    if (isCorrect) this.score++;
    this.answers.push({ qId: q.id, userAnswer: userAnswer, correctAnswer: correctAnswer, correct: isCorrect });
    this.phase = 'reveal';
    this.render();
  };

  TruefalseQuiz.prototype.renderReveal = function() {
    var self = this;
    var q = this.questions[this.currentQ];
    var total = this.questions.length;
    var lastAnswer = this.answers[this.answers.length - 1];
    var isCorrect = lastAnswer.correct;
    var correctAnswer = lastAnswer.correctAnswer;
    var wrap = el('div', 'quiz-engine animate-fade-in');

    renderProgressBar(wrap, this.currentQ, total);

    // Result badge with revealSlide animation
    var badge = el('div', 'text-center mb-4 quiz-reveal-enter');
    if (isCorrect) {
      badge.innerHTML = '<span class="inline-flex items-center gap-2 text-base font-bold bg-green-500/15 text-green-600 dark:text-green-400 rounded-full px-5 py-2.5 shadow-sm">' +
        '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>' +
        esc(tg('truefalse.correct', 'Bonne réponse !')) + '</span>';
    } else {
      badge.innerHTML = '<span class="inline-flex items-center gap-2 text-base font-bold bg-red-500/15 text-red-600 dark:text-red-400 rounded-full px-5 py-2.5 shadow-sm">' +
        '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
        esc(tg('truefalse.wrong', 'Mauvaise réponse')) + '</span>';
    }
    wrap.appendChild(badge);

    // Statement
    var qText = tgd(this.prefix + '.q' + q.id, q.text);
    var qEl = el('h3', 'text-lg font-semibold mb-4 text-center', esc(qText));
    wrap.appendChild(qEl);

    // Correct answer display
    var answerLabel = correctAnswer === 'true' ? tg('truefalse.true', 'Vrai') : tg('truefalse.false', 'Faux');
    var answerBox = el('div', 'text-center mb-4');
    answerBox.innerHTML = '<span class="text-sm text-muted-foreground">' + esc(tg('truefalse.correctAnswer', 'La réponse :')) +
      '</span> <span class="font-bold text-primary">' + esc(answerLabel) + '</span>';
    wrap.appendChild(answerBox);

    // Explanation
    var expText = tgd(this.prefix + '.q' + q.id + 'exp', '');
    if (expText) {
      var expBox = el('div', 'glass-card rounded-xl p-5 mb-6 max-w-lg mx-auto text-left quiz-reveal-enter');
      expBox.style.animationDelay = '200ms';
      expBox.innerHTML = '<p class="text-sm text-muted-foreground leading-relaxed">' +
        '<strong class="text-foreground">' + esc(tg('truefalse.explanation', 'Explication')) + ' :</strong> ' + esc(expText) + '</p>';
      wrap.appendChild(expBox);
    }

    // Score tracker with pulse
    var scoreDisp = el('div', 'text-center mb-6 quiz-score-tracker');
    scoreDisp.innerHTML = '<span class="text-sm font-medium text-muted-foreground">' +
      esc(tg('truefalse.score', 'Score')) + ': <span class="text-primary font-bold quiz-score-pulse">' + this.score + '</span>/' + (this.currentQ + 1) + '</span>';
    wrap.appendChild(scoreDisp);

    // Next button
    var isLast = this.currentQ >= total - 1;
    var nextLabel = isLast ? tg('truefalse.seeResults', 'Voir les résultats') : tg('truefalse.next', 'Question suivante');
    var nextBtn = el('button', 'btn btn-cta btn-lg', esc(nextLabel) + ' &rarr;');
    nextBtn.addEventListener('click', function() {
      if (isLast) {
        self.phase = 'results';
      } else {
        self.currentQ++;
        self.phase = 'playing';
      }
      self.render();
    });
    var btnWrap = el('div', 'text-center');
    btnWrap.appendChild(nextBtn);
    wrap.appendChild(btnWrap);

    this.container.appendChild(wrap);
    this.container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  TruefalseQuiz.prototype.renderResults = function() {
    var self = this;
    var total = this.questions.length;
    var pct = Math.round((this.score / total) * 100);
    var wrap = el('div', 'quiz-engine quiz-result-card text-center');

    // Score ring
    var scoreRingTf = el('div', '');
    scoreRingTf.innerHTML = renderScoreRing(pct);
    wrap.appendChild(scoreRingTf);
    wrap.appendChild(el('p', 'text-sm text-muted-foreground mb-6 quiz-reveal-enter', this.score + '/' + total + ' ' + tg('truefalse.correctAnswers', 'bonnes réponses')));

    // Find matching result
    var result = null;
    for (var i = 0; i < this.results.length; i++) {
      var r = this.results[i];
      if (this.score >= r.min && this.score <= r.max) { result = r; break; }
    }
    if (!result && this.results.length > 0) result = this.results[this.results.length - 1];

    if (result) {
      wrap.appendChild(el('h3', 'text-2xl font-bold mb-3', esc(result.title)));
      wrap.appendChild(el('p', 'text-muted-foreground leading-relaxed mb-4 max-w-lg mx-auto', result.description));
      if (result.advice) {
        var advice = el('div', 'text-sm text-foreground bg-primary/5 border border-primary/20 rounded-xl p-5 mt-4 text-left max-w-lg mx-auto');
        advice.innerHTML = '<strong class="block mb-2">' + esc(tg('result.ourAdvice', 'Notre conseil')) + '</strong>' + esc(result.advice);
        wrap.appendChild(advice);
      }
    }

    // Review answers summary
    var summaryWrap = el('div', 'mt-8 max-w-lg mx-auto text-left');
    summaryWrap.appendChild(el('h4', 'text-lg font-bold mb-4 text-center', esc(tg('truefalse.summary', 'Résumé de vos réponses'))));
    for (var j = 0; j < this.answers.length; j++) {
      var a = this.answers[j];
      var qObj = this.questions[j];
      var qTextSum = tgd(this.prefix + '.q' + qObj.id, qObj.text);
      var icon = a.correct ? '✅' : '❌';
      var row = el('div', 'flex items-start gap-2 py-2 border-b border-border last:border-0');
      row.innerHTML = '<span class="shrink-0 mt-0.5">' + icon + '</span>' +
        '<span class="text-sm text-muted-foreground">' + esc(qTextSum) + '</span>';
      summaryWrap.appendChild(row);
    }
    wrap.appendChild(summaryWrap);

    renderActionButtons(wrap, {
      newQuestions: function() { location.reload(); },
      restart: function() { self.phase = 'intro'; self.render(); }
    });

    this.container.appendChild(wrap);
    wrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // ─── Public API ───────────────────────────────────────────
  return {
    loadTranslations: loadTranslations,
    tgd: tgd,
    tg: tg,
    SoloTest: SoloTest,
    DuoMatchQuiz: DuoMatchQuiz,
    DistanceQuiz: DistanceQuiz,
    CoquinQuiz: CoquinQuiz,
    KnowledgeQuiz: KnowledgeQuiz,
    DebateQuiz: DebateQuiz,
    FunnyQuiz: FunnyQuiz,
    MostQuiz: MostQuiz,
    HealthyQuiz: HealthyQuiz,
    ParentaliteQuiz: ParentaliteQuiz,
    TruefalseQuiz: TruefalseQuiz,
    el: el,
    esc: esc,
    shuffleArray: shuffleArray,
    SUPABASE_URL: SUPABASE_URL,
    SUPABASE_KEY: SUPABASE_KEY,
  };
})();
