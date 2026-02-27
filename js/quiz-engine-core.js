/**
 * Quiz Couple - Core Quiz Engine (vanilla JS)
 * Handles solo scoring tests: toxic, sain, distance, mariage, divorce
 * Also provides base for duo and multi-player quizzes.
 */

var QuizEngine = (function() {
  'use strict';

  var SUPABASE_URL = 'https://nbjpgecedevlmypqisng.supabase.co';
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ianBnZWNlZGV2bG15cHFpc25nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNDk3MjgsImV4cCI6MjA4NDgyNTcyOH0.agwrq1lrAKP8Vc-Y349H3RxEZhEgsDj21cG1luw9AXs';

  // ─── Translation helper ───────────────────────────────────
  var gdTranslations = null;
  var gamesTranslations = null;

  function loadTranslations(lang, callback) {
    var loaded = 0;
    var total = 2;
    function check() { loaded++; if (loaded >= total && callback) callback(); }

    fetch('/js/data/gd-' + lang + '.json').then(function(r) { return r.json(); })
      .then(function(d) { gdTranslations = d; check(); })
      .catch(function() { fetch('/js/data/gd-fr.json').then(function(r) { return r.json(); }).then(function(d) { gdTranslations = d; check(); }).catch(check); });

    fetch('/js/data/games-' + lang + '.json').then(function(r) { return r.json(); })
      .then(function(d) { gamesTranslations = d; check(); })
      .catch(function() { fetch('/js/data/games-fr.json').then(function(r) { return r.json(); }).then(function(d) { gamesTranslations = d; check(); }).catch(check); });
  }

  function tgd(key, fallback) {
    if (!gdTranslations) return fallback || key;
    var parts = key.split('.');
    var val = gdTranslations;
    for (var i = 0; i < parts.length; i++) {
      if (!val || typeof val !== 'object') return fallback || key;
      val = val[parts[i]];
    }
    return (val !== undefined && val !== null) ? val : (fallback || key);
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

  // ─── Solo Scoring Test ────────────────────────────────────
  function SoloTest(config) {
    this.container = config.container;
    this.questions = config.questions;
    this.results = config.results;
    this.prefix = config.prefix;
    this.lang = config.lang || 'fr';
    this.labels = config.labels || {};
    this.phase = 'intro';
    this.currentQ = 0;
    this.answers = [];
    this.totalScore = 0;
    this.render();
  }

  SoloTest.prototype.render = function() {
    this.container.innerHTML = '';
    if (this.phase === 'intro') this.renderIntro();
    else if (this.phase === 'playing') this.renderQuestion();
    else if (this.phase === 'results') this.renderResults();
  };

  SoloTest.prototype.renderIntro = function() {
    var self = this;
    var wrap = el('div', 'quiz-engine animate-fade-in text-center');

    var icon = el('div', 'text-5xl mb-4', '📝');
    var title = el('h2', 'text-2xl font-bold mb-3', tg('playerSetup.readyForTest', 'Prêt pour le test ?'));
    var desc = el('p', 'text-muted-foreground mb-2', this.questions.length + ' questions');
    var time = el('p', 'text-sm text-muted-foreground mb-6', '⏱ ' + tg('meta.duration', '5 min') + ' &bull; 🔒 Anonyme & gratuit');

    // Prénom input
    var nameWrap = el('div', 'max-w-sm mx-auto mb-6');
    var nameLabel = el('label', 'block text-sm font-medium mb-2', '👤 ' + tg('playerSetup.firstName', 'Prénom'));
    var nameInput = el('input', 'input w-full text-center');
    nameInput.type = 'text';
    nameInput.placeholder = tg('playerSetup.enterFirstName', 'Entrez votre prénom');
    nameInput.maxLength = 30;
    nameWrap.appendChild(nameLabel);
    nameWrap.appendChild(nameInput);

    var startLabel = this.labels.start || tg('playerSetup.startTest', tg('playerSetup.startNow', 'Commencer le test'));
    var btn = el('button', 'btn btn-cta btn-lg', esc(startLabel));
    btn.addEventListener('click', function() {
      self.playerName = nameInput.value.trim() || '';
      self.phase = 'playing';
      self.currentQ = 0;
      self.answers = [];
      self.totalScore = 0;
      self.render();
    });

    wrap.appendChild(icon);
    wrap.appendChild(title);
    wrap.appendChild(desc);
    wrap.appendChild(time);
    wrap.appendChild(nameWrap);
    wrap.appendChild(btn);
    this.container.appendChild(wrap);
  };

  SoloTest.prototype.renderQuestion = function() {
    var self = this;
    var q = this.questions[this.currentQ];
    var total = this.questions.length;
    var progress = Math.round(((this.currentQ) / total) * 100);

    var wrap = el('div', 'quiz-engine quiz-question-enter');

    // Progress bar
    var progressWrap = el('div', 'mb-6');
    var progressInfo = el('div', 'flex justify-between text-sm text-muted-foreground mb-2');
    progressInfo.innerHTML = '<span>' + tg('question.question', 'Question') + ' ' + (this.currentQ + 1) + '/' + total + '</span><span>' + progress + '%</span>';
    var barOuter = el('div', 'quiz-progress');
    var barInner = el('div', 'quiz-progress-bar');
    barInner.style.width = progress + '%';
    barOuter.appendChild(barInner);
    progressWrap.appendChild(progressInfo);
    progressWrap.appendChild(barOuter);

    // Question text
    var qText = tgd(this.prefix + '.q' + q.id, q.text);
    var qEl = el('h3', 'text-xl font-semibold mb-6 text-center', esc(qText));

    // Remark (if exists)
    var remarkKey = this.prefix + '.q' + q.id + '_r';
    var remarkText = tgd(remarkKey, null);

    // Options
    var optionsWrap = el('div', 'space-y-2');
    q.options.forEach(function(opt, idx) {
      var optText = tgd(self.prefix + '.q' + q.id + opt.id, opt.text);
      var optBtn = el('button', 'quiz-option');
      optBtn.textContent = optText;
      optBtn.style.animationDelay = (idx * 60) + 'ms';
      optBtn.addEventListener('click', function() {
        // Visual feedback
        optBtn.classList.add('selected');
        var siblings = optionsWrap.querySelectorAll('.quiz-option');
        for (var s = 0; s < siblings.length; s++) {
          if (siblings[s] !== optBtn) siblings[s].style.opacity = '0.5';
          siblings[s].style.pointerEvents = 'none';
        }

        self.answers[self.currentQ] = opt.points || opt.score || 0;
        self.totalScore = self.answers.reduce(function(s, v) { return s + (v || 0); }, 0);

        // Delay before moving to next question for visual feedback
        setTimeout(function() {
          if (self.currentQ < total - 1) {
            self.currentQ++;
            self.render();
          } else {
            self.phase = 'results';
            self.render();
          }
        }, 350);
      });
      optionsWrap.appendChild(optBtn);
    });

    // Back button
    var navWrap = el('div', 'flex justify-between mt-6');
    if (this.currentQ > 0) {
      var backBtn = el('button', 'btn btn-ghost text-sm', '&larr; ' + tg('question.previousQuestion', tg('question.previous', 'Précédent')));
      backBtn.addEventListener('click', function() { self.currentQ--; self.render(); });
      navWrap.appendChild(backBtn);
    }

    wrap.appendChild(progressWrap);
    wrap.appendChild(qEl);
    if (remarkText && remarkText !== remarkKey) {
      var remark = el('div', 'text-sm text-muted-foreground bg-secondary/10 border border-secondary/20 rounded-lg p-4 mb-6');
      remark.innerHTML = '💡 ' + esc(remarkText);
      wrap.appendChild(remark);
    }
    wrap.appendChild(optionsWrap);
    wrap.appendChild(navWrap);
    this.container.appendChild(wrap);
  };

  SoloTest.prototype.renderResults = function() {
    var self = this;
    var wrap = el('div', 'quiz-engine quiz-result-card text-center');
    var result = null;

    for (var i = 0; i < this.results.length; i++) {
      var r = this.results[i];
      if (this.totalScore >= r.min && this.totalScore <= r.max) {
        result = r;
        break;
      }
    }

    if (!result && this.results.length > 0) {
      result = this.results[this.results.length - 1];
    }

    var maxScore = this.results.length > 0 ? this.results[this.results.length - 1].max : 100;
    var pct = Math.round((this.totalScore / maxScore) * 100);

    // Player name greeting
    if (this.playerName) {
      var greeting = el('p', 'text-lg font-semibold mb-2', tg('result.bravo', 'Bravo') + ' ' + esc(this.playerName) + ' !');
      wrap.appendChild(greeting);
    }

    // Score circle
    var scoreCircle = el('div', 'quiz-score-circle mx-auto mb-4', pct + '%');
    wrap.appendChild(scoreCircle);

    var scoreLabel = el('p', 'text-sm text-muted-foreground mb-6', this.totalScore + '/' + maxScore + ' points');
    wrap.appendChild(scoreLabel);

    if (result) {
      var resultTitle = el('h3', 'text-2xl font-bold mb-3', esc(result.title));
      var resultDesc = el('p', 'text-muted-foreground leading-relaxed mb-4 max-w-lg mx-auto', result.description);
      wrap.appendChild(resultTitle);
      wrap.appendChild(resultDesc);
      if (result.advice) {
        var advice = el('div', 'text-sm text-foreground bg-primary/5 border border-primary/20 rounded-xl p-5 mt-4 text-left max-w-lg mx-auto');
        advice.innerHTML = '<strong class="block mb-2">' + esc(tg('result.ourAdvice', 'Notre conseil')) + '</strong>' + esc(result.advice);
        wrap.appendChild(advice);
      }
    }

    // Actions
    var actions = el('div', 'flex flex-col sm:flex-row gap-3 justify-center mt-8');

    // "Recommencer avec d'autres questions" reloads the page to get new random questions
    var newQBtn = el('button', 'btn btn-cta', '🎲 ' + tg('result.restartOtherQuestions', 'Recommencer avec d\'autres questions'));
    newQBtn.addEventListener('click', function() { location.reload(); });
    actions.appendChild(newQBtn);

    var restartBtn = el('button', 'btn btn-outline', '🔄 ' + tg('result.restartFromBeginning', tg('result.redoQuiz', 'Recommencer')));
    restartBtn.addEventListener('click', function() { self.phase = 'intro'; self.render(); });
    actions.appendChild(restartBtn);

    var homeBtn = el('a', 'btn btn-primary', '🏠 ' + tg('question.backHome', 'Retour à l\'accueil'));
    homeBtn.href = '/';
    actions.appendChild(homeBtn);

    wrap.appendChild(actions);
    this.container.appendChild(wrap);

    // Scroll to results
    wrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // ─── Duo Quiz ─────────────────────────────────────────────
  function DuoQuiz(config) {
    this.container = config.container;
    this.questions = config.questions;
    this.results = config.results;
    this.prefix = config.prefix;
    this.lang = config.lang || 'fr';
    this.phase = 'setup';
    this.players = [null, null];
    this.currentQ = 0;
    this.currentPlayer = 0;
    this.answers = { p1: [], p2: [] };
    this.render();
  }

  DuoQuiz.prototype.render = function() {
    this.container.innerHTML = '';
    if (this.phase === 'setup') this.renderSetup();
    else if (this.phase === 'playing') this.renderQuestion();
    else if (this.phase === 'handoff') this.renderHandoff();
    else if (this.phase === 'results') this.renderResults();
  };

  DuoQuiz.prototype.renderSetup = function() {
    var self = this;
    var wrap = el('div', 'quiz-engine animate-fade-in');

    var icon = el('div', 'text-5xl mb-4 text-center', '💕');
    var title = el('h2', 'text-2xl font-bold mb-2 text-center', tg('playerSetup.readyToPlay', 'Prêts à jouer ?'));
    var desc = el('p', 'text-muted-foreground mb-6 text-center', tg('playerSetup.enterNames', 'Entrez vos prénoms'));

    var form = el('div', 'space-y-4 max-w-md mx-auto');

    var p1Wrap = el('div', 'glass-card rounded-xl p-4');
    var p1Label = el('label', 'block text-sm font-medium mb-2', '👤 ' + tg('playerSetup.player1', 'Joueur 1'));
    var p1Input = el('input', 'input w-full');
    p1Input.type = 'text';
    p1Input.placeholder = tg('playerSetup.firstName', 'Prénom');
    p1Input.maxLength = 30;
    p1Wrap.appendChild(p1Label);
    p1Wrap.appendChild(p1Input);

    var p2Wrap = el('div', 'glass-card rounded-xl p-4');
    var p2Label = el('label', 'block text-sm font-medium mb-2', '👤 ' + tg('playerSetup.player2', 'Joueur 2'));
    var p2Input = el('input', 'input w-full');
    p2Input.type = 'text';
    p2Input.placeholder = tg('playerSetup.firstName', 'Prénom');
    p2Input.maxLength = 30;
    p2Wrap.appendChild(p2Label);
    p2Wrap.appendChild(p2Input);

    var info = el('p', 'text-xs text-muted-foreground text-center mt-3', '📝 ' + this.questions.length + ' questions &bull; ⏱ ' + tg('meta.duration', '5 min'));

    var startBtn = el('button', 'btn btn-cta w-full mt-4', tg('playerSetup.startQuiz', 'Commencer le quiz'));
    startBtn.addEventListener('click', function() {
      var n1 = p1Input.value.trim() || tg('playerSetup.player1', 'Joueur 1');
      var n2 = p2Input.value.trim() || tg('playerSetup.player2', 'Joueur 2');
      self.players = [{ name: n1 }, { name: n2 }];
      self.phase = 'playing';
      self.currentQ = 0;
      self.currentPlayer = 0;
      var total = self.questions.length;
      self.answers = { p1: new Array(total).fill(null), p2: new Array(total).fill(null) };
      self.render();
    });

    form.appendChild(p1Wrap);
    form.appendChild(p2Wrap);
    form.appendChild(info);
    form.appendChild(startBtn);

    wrap.appendChild(icon);
    wrap.appendChild(title);
    wrap.appendChild(desc);
    wrap.appendChild(form);
    this.container.appendChild(wrap);
  };

  DuoQuiz.prototype.renderHandoff = function() {
    var self = this;
    var playerName = this.players[this.currentPlayer].name;
    var wrap = el('div', 'quiz-engine animate-fade-in text-center');

    var icon = el('div', 'text-5xl mb-4', '📱');
    var title = el('h2', 'text-xl font-bold mb-3', tg('question.itsTurnOf', 'C\'est au tour de') + ' ' + esc(playerName) + ' !');
    var desc = el('p', 'text-muted-foreground mb-6', tg('question.dontLookAnswer', 'Ne regardez pas la réponse !'));

    var btn = el('button', 'btn btn-cta', tg('question.chooseAnswer', 'Choisir ma réponse'));
    btn.addEventListener('click', function() {
      self.phase = 'playing';
      self.render();
    });

    wrap.appendChild(icon);
    wrap.appendChild(title);
    wrap.appendChild(desc);
    wrap.appendChild(btn);
    this.container.appendChild(wrap);
  };

  DuoQuiz.prototype.renderQuestion = function() {
    var self = this;
    var q = this.questions[this.currentQ];
    var total = this.questions.length;
    var totalNeeded = total * 2;
    var answered = this.answers.p1.filter(function(a) { return a !== null; }).length + this.answers.p2.filter(function(a) { return a !== null; }).length;
    var progress = Math.round((answered / totalNeeded) * 100);
    var playerName = this.players[this.currentPlayer].name;

    var wrap = el('div', 'quiz-engine quiz-question-enter');

    // Progress
    var progressWrap = el('div', 'mb-6');
    var progressInfo = el('div', 'flex justify-between text-sm text-muted-foreground mb-2');
    progressInfo.innerHTML = '<span>' + tg('question.question', 'Question') + ' ' + (this.currentQ + 1) + '/' + total + '</span><span>' + progress + '%</span>';
    var barOuter = el('div', 'quiz-progress');
    var barInner = el('div', 'quiz-progress-bar');
    barInner.style.width = progress + '%';
    barOuter.appendChild(barInner);
    progressWrap.appendChild(progressInfo);
    progressWrap.appendChild(barOuter);

    // Player indicator
    var playerBadge = el('div', 'text-center mb-4');
    playerBadge.innerHTML = '<span class="badge badge-primary">' + esc(playerName) + '</span>';

    // Question
    var qText = tgd(this.prefix + '.q' + q.id, q.text);
    var qEl = el('h3', 'text-xl font-semibold mb-6 text-center', esc(qText));

    // Options
    var optionsWrap = el('div', 'space-y-2');
    q.options.forEach(function(opt, idx) {
      var optText = tgd(self.prefix + '.q' + q.id + opt.id, opt.text);
      var optBtn = el('button', 'quiz-option');
      optBtn.textContent = optText;
      optBtn.style.animationDelay = (idx * 60) + 'ms';
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

    wrap.appendChild(progressWrap);
    wrap.appendChild(playerBadge);
    wrap.appendChild(qEl);
    wrap.appendChild(optionsWrap);
    this.container.appendChild(wrap);
  };

  DuoQuiz.prototype.renderResults = function() {
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
      if (matchCount >= (r.minScore || r.min || 0) && matchCount <= (r.maxScore || r.max || 999)) {
        result = r;
        break;
      }
    }

    var icon = el('div', 'text-5xl mb-4', pct >= 70 ? '🎉' : pct >= 40 ? '😊' : '🤔');
    var scoreCircle = el('div', 'quiz-score-circle mx-auto mb-4', pct + '%');
    var scoreLabel = el('p', 'text-muted-foreground mb-6', matchCount + '/' + total + ' ' + tg('result.identicalAnswers', 'réponses identiques'));

    wrap.appendChild(icon);
    wrap.appendChild(scoreCircle);
    wrap.appendChild(scoreLabel);

    if (result) {
      wrap.appendChild(el('h3', 'text-2xl font-bold mb-3', esc(result.title || '')));
      wrap.appendChild(el('p', 'text-muted-foreground leading-relaxed max-w-lg mx-auto', result.description || ''));
    }

    var actions = el('div', 'flex flex-col sm:flex-row gap-3 justify-center mt-8');

    var newQBtn = el('button', 'btn btn-cta', '🎲 ' + tg('result.restartOtherQuestions', 'Recommencer avec d\'autres questions'));
    newQBtn.addEventListener('click', function() { location.reload(); });
    actions.appendChild(newQBtn);

    var restartBtn = el('button', 'btn btn-outline', '🔄 ' + tg('result.restartFromBeginning', tg('result.redoQuiz', 'Recommencer')));
    restartBtn.addEventListener('click', function() { self.phase = 'setup'; self.render(); });
    actions.appendChild(restartBtn);

    var homeBtn = el('a', 'btn btn-primary', '🏠 ' + tg('question.backHome', 'Retour à l\'accueil'));
    homeBtn.href = '/';
    actions.appendChild(homeBtn);

    wrap.appendChild(actions);
    this.container.appendChild(wrap);
    wrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // ─── Public API ───────────────────────────────────────────
  return {
    loadTranslations: loadTranslations,
    tgd: tgd,
    tg: tg,
    SoloTest: SoloTest,
    DuoQuiz: DuoQuiz,
    el: el,
    esc: esc,
    SUPABASE_URL: SUPABASE_URL,
    SUPABASE_KEY: SUPABASE_KEY,
  };
})();
