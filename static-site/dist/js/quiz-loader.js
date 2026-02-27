/**
 * Universal Quiz Loader - auto-initializes quiz engine based on data attributes
 * Reads data-quiz and data-lang from #quiz-engine element
 * Maps each quiz type to its correct engine, pool size, and mechanics
 */
(function() {
  'use strict';

  var container = document.getElementById('quiz-engine');
  if (!container) return;

  var quizType = container.dataset.quiz;
  var lang = container.dataset.lang || 'fr';
  if (!quizType) return;

  // ─── Quiz Configuration ───────────────────────────────────
  // Each quiz has: prefix (gd.json key), engine type, totalQ, pool size
  var QUIZ_CONFIG = {
    // ── Solo scoring (single player, points-based) ──
    'toxic':          { prefix: 'divorce', engine: 'solo', totalQ: 25, pool: 25, quizType: 'toxic' },
    'divorce':        { prefix: 'divorce', engine: 'solo', totalQ: 15, pool: 25, quizType: 'divorce', hasSkip: true },
    'mariage':        { prefix: 'marriage', engine: 'solo', totalQ: 30, pool: 30, hasSkip: true, hasLocalStorage: true },
    'ado':            { prefix: 'ado', engine: 'solo', totalQ: 20, pool: 80, ascending: true },

    // ── Duo with gender (2 players + gender selection, answer matching) ──
    'tester-couple':  { prefix: 'couple', engine: 'duo-match', totalQ: 20, pool: 20, needsGender: true },
    'common-points':  { prefix: 'commonPoints', engine: 'duo-match', totalQ: 20, pool: 30, needsGender: true },

    // ── Healthy quiz (2 players + gender, weighted scoring) ──
    'sain':           { prefix: 'healthy', engine: 'healthy', totalQ: 20, pool: 20, needsGender: true },

    // ── Distance quiz (2 players, alternating turns, points per option) ──
    'distance':       { prefix: 'distance', engine: 'distance', totalQ: 20, pool: 20 },

    // ── Coquin quiz (guess & reveal mechanic) ──
    'coquin':         { prefix: 'coquin', engine: 'coquin', totalQ: 30, pool: 30 },

    // ── Knowledge quiz (oral validation with ✅/❌) ──
    'knowledge':      { prefix: 'knowledge', engine: 'knowledge', totalQ: 20, pool: 30 },

    // ── Debate quiz (amoureux - 1-5 scale, together) ──
    'amoureux':       { prefix: 'amoureux', engine: 'debate', totalQ: 20, pool: 30 },

    // ── Funny quiz (marrant - discussion only, no scoring) ──
    'marrant':        { prefix: 'marrant', engine: 'funny', totalQ: 20, pool: 30 },

    // ── Most quiz ("Qui est le plus..." - 2-8 players, vote) ──
    'most':           { prefix: 'most', engine: 'most', totalQ: 20, pool: 30 }
  };

  var config = QUIZ_CONFIG[quizType];
  if (!config) {
    container.innerHTML = '<p class="text-center text-muted-foreground">Quiz non disponible.</p>';
    return;
  }

  // Load translations then initialize
  QuizEngine.loadTranslations(lang, function() {
    var questions = parseGdQuestions(config.prefix, config.pool + 10, config.ascending);

    if (questions.length === 0) {
      showUnavailable(config);
      return;
    }

    // Randomly select totalQ questions from pool if pool > totalQ
    if (questions.length > config.totalQ) {
      questions = QuizEngine.shuffleArray(questions).slice(0, config.totalQ);
    } else {
      questions = QuizEngine.shuffleArray(questions);
    }

    switch (config.engine) {
      case 'solo':
        initSoloQuiz(config, questions);
        break;
      case 'duo-match':
        initDuoMatchQuiz(config, questions);
        break;
      case 'healthy':
        initHealthyQuiz(config, questions);
        break;
      case 'distance':
        initDistanceQuiz(config, questions);
        break;
      case 'coquin':
        initCoquinQuiz(config, questions);
        break;
      case 'knowledge':
        initKnowledgeQuiz(config, questions);
        break;
      case 'debate':
        initDebateQuiz(config, questions);
        break;
      case 'funny':
        initFunnyQuiz(config, questions);
        break;
      case 'most':
        initMostQuiz(config, questions);
        break;
      default:
        showUnavailable(config);
    }
  });

  // ─── Parse questions from gd.json ─────────────────────────
  function parseGdQuestions(prefix, maxQ, ascending) {
    var questions = [];
    for (var i = 1; i <= (maxQ || 50); i++) {
      var qText = QuizEngine.tgd(prefix + '.q' + i, null);
      if (!qText || qText === prefix + '.q' + i) {
        if (questions.length > 0) break;
        continue;
      }
      var options = [];
      var optLetters = ['a', 'b', 'c', 'd', 'e'];
      for (var j = 0; j < optLetters.length; j++) {
        var oText = QuizEngine.tgd(prefix + '.q' + i + optLetters[j], null);
        if (oText && oText !== prefix + '.q' + i + optLetters[j]) {
          options.push({ id: optLetters[j], text: oText });
        }
      }
      if (options.length > 0) {
        // Assign points based on scoring mode
        if (ascending) {
          for (var k = 0; k < options.length; k++) options[k].points = k + 1;
        } else {
          var maxPts = options.length - 1;
          for (var k = 0; k < options.length; k++) options[k].points = maxPts - k;
        }
        questions.push({ id: i, text: qText, options: options });
      }
    }
    return questions;
  }

  // ─── Parse results from gd.json ───────────────────────────
  function parseGdResults(prefix, totalQuestions, maxOptions) {
    var results = [];
    // Try r{N}_t pattern (healthy, marriage, couple, distance, ado)
    for (var i = 1; i <= 10; i++) {
      var title = QuizEngine.tgd(prefix + '.r' + i + '_t', null);
      if (!title || title === prefix + '.r' + i + '_t') break;
      results.push({
        title: title,
        description: QuizEngine.tgd(prefix + '.r' + i + '_d', ''),
        advice: QuizEngine.tgd(prefix + '.r' + i + '_a', '')
      });
    }
    // Try v{N}_t pattern (divorce verdicts)
    if (results.length === 0) {
      for (var j = 1; j <= 10; j++) {
        var vTitle = QuizEngine.tgd(prefix + '.v' + j + '_t', null);
        if (!vTitle || vTitle === prefix + '.v' + j + '_t') break;
        results.push({
          title: vTitle,
          description: QuizEngine.tgd(prefix + '.v' + j + '_d', ''),
          advice: ''
        });
      }
    }
    if (results.length === 0) return results;
    // Calculate score ranges
    var maxScore = totalQuestions * (maxOptions - 1);
    var rangeSize = Math.ceil(maxScore / results.length);
    for (var r = 0; r < results.length; r++) {
      results[r].min = r * rangeSize;
      results[r].max = r === results.length - 1 ? maxScore : (r + 1) * rangeSize - 1;
    }
    return results;
  }

  // ─── Initializers ─────────────────────────────────────────

  function initSoloQuiz(cfg, questions) {
    var maxOpts = 0;
    for (var i = 0; i < questions.length; i++) {
      if (questions[i].options.length > maxOpts) maxOpts = questions[i].options.length;
    }
    var results = parseGdResults(cfg.prefix, questions.length, maxOpts);
    new QuizEngine.SoloTest({
      container: container,
      questions: questions,
      results: results,
      prefix: cfg.prefix,
      lang: lang,
      quizType: cfg.quizType || 'solo',
      hasSkip: cfg.hasSkip || false,
      hasLocalStorage: cfg.hasLocalStorage || false
    });
  }

  function initDuoMatchQuiz(cfg, questions) {
    var total = questions.length;
    var results = buildDuoResults(total);
    new QuizEngine.DuoMatchQuiz({
      container: container,
      questions: questions,
      results: results,
      prefix: cfg.prefix,
      lang: lang,
      needsGender: cfg.needsGender || false
    });
  }

  function initHealthyQuiz(cfg, questions) {
    // Healthy quiz questions come from 'couple' prefix (same as tester-couple)
    // but uses weighted scoring. Since gd.json 'healthy' only has results,
    // we need to load questions from 'couple' prefix
    var healthyQuestions = parseGdQuestions('couple', 30);
    if (healthyQuestions.length > cfg.totalQ) {
      healthyQuestions = QuizEngine.shuffleArray(healthyQuestions).slice(0, cfg.totalQ);
    } else {
      healthyQuestions = QuizEngine.shuffleArray(healthyQuestions);
    }

    if (healthyQuestions.length === 0) {
      showUnavailable(cfg);
      return;
    }

    // Parse results from healthy prefix
    var results = [];
    for (var i = 1; i <= 10; i++) {
      var title = QuizEngine.tgd('healthy.r' + i + '_t', null);
      if (!title || title === 'healthy.r' + i + '_t') break;
      results.push({
        title: title,
        description: QuizEngine.tgd('healthy.r' + i + '_d', ''),
        advice: QuizEngine.tgd('healthy.r' + i + '_a', '')
      });
    }
    // Score ranges for healthy: max total = 20 questions * 2 points * 2 players = 80
    var maxTotal = healthyQuestions.length * 2 * 2;
    if (results.length > 0) {
      var rangeSize = Math.ceil(maxTotal / results.length);
      for (var r = 0; r < results.length; r++) {
        results[r].min = r * rangeSize;
        results[r].max = r === results.length - 1 ? maxTotal : (r + 1) * rangeSize - 1;
      }
    }

    new QuizEngine.HealthyQuiz({
      container: container,
      questions: healthyQuestions,
      results: results,
      prefix: 'couple',
      lang: lang
    });
  }

  function initDistanceQuiz(cfg, questions) {
    new QuizEngine.DistanceQuiz({
      container: container,
      questions: questions,
      prefix: cfg.prefix,
      lang: lang
    });
  }

  function initCoquinQuiz(cfg, questions) {
    new QuizEngine.CoquinQuiz({
      container: container,
      questions: questions,
      prefix: cfg.prefix,
      lang: lang
    });
  }

  function initKnowledgeQuiz(cfg, questions) {
    new QuizEngine.KnowledgeQuiz({
      container: container,
      questions: questions,
      prefix: cfg.prefix,
      lang: lang
    });
  }

  function initDebateQuiz(cfg, questions) {
    // Debate results: percentage-based
    var results = [
      { min: 0, max: 30, minScore: 0, maxScore: 30,
        title: QuizEngine.tg('result.low', 'De belles discussions à venir'),
        description: QuizEngine.tg('result.lowDesc', 'Vous avez des points de vue différents. C\'est une opportunité de mieux vous comprendre !'),
        advice: QuizEngine.tg('result.lowAdvice', 'Prenez le temps de discuter de chaque sujet qui vous a surpris.')
      },
      { min: 31, max: 60, minScore: 31, maxScore: 60,
        title: QuizEngine.tg('result.medium', 'Bonne connexion !'),
        description: QuizEngine.tg('result.mediumDesc', 'Vous êtes souvent d\'accord, avec quelques sujets à explorer.'),
        advice: ''
      },
      { min: 61, max: 100, minScore: 61, maxScore: 100,
        title: QuizEngine.tg('result.high', 'Connexion exceptionnelle !'),
        description: QuizEngine.tg('result.highDesc', 'Vous êtes sur la même longueur d\'onde !'),
        advice: ''
      }
    ];

    new QuizEngine.DebateQuiz({
      container: container,
      questions: questions,
      results: results,
      prefix: cfg.prefix,
      lang: lang
    });
  }

  function initFunnyQuiz(cfg, questions) {
    new QuizEngine.FunnyQuiz({
      container: container,
      questions: questions,
      prefix: cfg.prefix,
      lang: lang
    });
  }

  function initMostQuiz(cfg, questions) {
    new QuizEngine.MostQuiz({
      container: container,
      questions: questions,
      prefix: cfg.prefix,
      lang: lang
    });
  }

  // ─── Helpers ──────────────────────────────────────────────

  function buildDuoResults(total) {
    var third = Math.ceil(total / 3);
    return [
      { minScore: 0, maxScore: third - 1, min: 0, max: third - 1,
        title: QuizEngine.tg('result.low', 'Vous avez des choses à découvrir !'),
        description: QuizEngine.tg('result.lowDesc', 'Vous avez encore beaucoup à apprendre sur vos goûts respectifs.') },
      { minScore: third, maxScore: third * 2 - 1, min: third, max: third * 2 - 1,
        title: QuizEngine.tg('result.medium', 'Bonne compatibilité !'),
        description: QuizEngine.tg('result.mediumDesc', 'Vous vous connaissez plutôt bien, avec quelques surprises.') },
      { minScore: third * 2, maxScore: total, min: third * 2, max: total,
        title: QuizEngine.tg('result.high', 'Incroyable connexion !'),
        description: QuizEngine.tg('result.highDesc', 'Vous êtes sur la même longueur d\'onde !') }
    ];
  }

  function showUnavailable(cfg) {
    container.innerHTML = '';
    var wrap = QuizEngine.el('div', 'quiz-engine animate-fade-in text-center');
    wrap.innerHTML = '<h2 class="text-2xl font-bold mb-4">' +
      QuizEngine.esc(QuizEngine.tg('playerSetup.readyForTest', 'Quiz')) + '</h2>' +
      '<p class="text-muted-foreground mb-6">Ce quiz sera disponible très prochainement.</p>' +
      '<a href="/" class="btn btn-primary">' + QuizEngine.esc(QuizEngine.tg('question.backHome', 'Retour à l\'accueil')) + '</a>';
    container.appendChild(wrap);
  }
})();
