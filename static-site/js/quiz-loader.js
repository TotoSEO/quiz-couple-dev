/**
 * Universal Quiz Loader - auto-initializes quiz engine based on data attributes
 * Reads data-quiz and data-lang from #quiz-engine element
 * Maps each quiz type to its correct engine, pool size, and mechanics
 * Handles multiple gd.json key patterns across languages (FR base + non-FR variants)
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
  // textOnly: true means no per-question options (knowledge, most, funny, debate)
  var QUIZ_CONFIG = {
    // ── Solo scoring (single player, points-based) ──
    'toxic':          { prefix: 'divorce', engine: 'solo', totalQ: 25, pool: 25, quizType: 'toxic', ascending: true },
    'divorce':        { prefix: 'divorce', engine: 'solo', totalQ: 15, pool: 25, quizType: 'divorce', hasSkip: true, ascending: true },
    'mariage':        { prefix: 'marriage', engine: 'solo', totalQ: 30, pool: 30, hasSkip: true, hasLocalStorage: true },
    'ado':            { prefix: 'ado', engine: 'solo', totalQ: 20, pool: 80, ascending: true, needsName: true },

    // ── Duo with gender (2 players + gender selection, answer matching) ──
    'tester-couple':  { prefix: 'couple', engine: 'duo-match', totalQ: 20, pool: 30, needsGender: true },
    'common-points':  { prefix: 'commonPoints', engine: 'duo-match', totalQ: 20, pool: 30, needsGender: true },

    // ── Healthy quiz (2 players + gender, weighted scoring) ──
    'sain':           { prefix: 'healthy', engine: 'healthy', totalQ: 20, pool: 30, needsGender: true },

    // ── Distance quiz (2 players, alternating turns, points per option) ──
    'distance':       { prefix: 'distance', engine: 'distance', totalQ: 20, pool: 20 },

    // ── Coquin quiz (guess & reveal mechanic) ──
    'coquin':         { prefix: 'coquin', engine: 'coquin', totalQ: 30, pool: 30 },

    // ── Knowledge quiz (oral validation with ✅/❌) - text only ──
    'knowledge':      { prefix: 'knowledge', engine: 'knowledge', totalQ: 20, pool: 100, textOnly: true },

    // ── Debate quiz (amoureux - 1-5 scale, together) - text only for debate ──
    'amoureux':       { prefix: 'amoureux', engine: 'debate', totalQ: 20, pool: 30 },

    // ── Funny quiz (marrant - discussion only, no scoring) - text only ──
    'marrant':        { prefix: 'marrant', engine: 'funny', totalQ: 20, pool: 160, textOnly: true },

    // ── Most quiz ("Qui est le plus..." - 2-8 players, vote) - text only ──
    'most':           { prefix: 'most', engine: 'most', totalQ: 20, pool: 240, textOnly: true },

    // ── Parentalite quiz (2 players, same questions, explicit point values) ──
    'parentalite':    { prefix: 'parentalite', engine: 'parentalite', totalQ: 20, pool: 20 },

    // ── Emmenager quiz (same engine as parentalite) ──
    'emmenager':      { prefix: 'emmenager', engine: 'parentalite', totalQ: 20, pool: 20 },

    // ── Jalousie quizzes (solo scoring, two sub-tests on same page) ──
    'jalousie1':      { prefix: 'jalousie1', engine: 'solo', totalQ: 20, pool: 20, quizType: 'jalousie1' },
    'jalousie2':      { prefix: 'jalousie2', engine: 'solo', totalQ: 20, pool: 20, quizType: 'jalousie2' },

    // ── Genant quiz (solo scoring, embarrassing couple behaviors) ──
    'genant':         { prefix: 'genant', engine: 'solo', totalQ: 15, pool: 15, quizType: 'genant' }
  };

  var config = QUIZ_CONFIG[quizType];
  if (!config) {
    container.innerHTML = '<p class="text-center text-muted-foreground">Quiz non disponible.</p>';
    return;
  }

  // Load translations then initialize
  QuizEngine.loadTranslations(lang, function() {
    var textOnly = config.textOnly || false;
    var questions = parseGdQuestions(config.prefix, config.pool + 10, config.ascending, textOnly);

    // Fallback: healthy quiz uses 'couple' prefix if 'healthy' has no questions
    if (questions.length === 0 && config.prefix === 'healthy') {
      questions = parseGdQuestions('couple', config.pool + 10, config.ascending, textOnly);
    }

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
      case 'parentalite':
        initParentaliteQuiz(config, questions);
        break;
      default:
        showUnavailable(config);
    }
  });

  // ─── Parse questions from gd.json ─────────────────────────
  // Handles multiple key patterns:
  // - Standard: prefix.q{N} with options prefix.q{N}a/b/c/d
  // - Numeric: prefix.{N} (most, knowledge, funny in non-FR)
  // - Alt options: prefix.q{N}o0/o1/o2/o3 (testerC, amoureux in non-FR)
  // - Uppercase options: prefix.q{N}A/B/C/D (coquinQ in non-FR)
  // tgd() handles prefix aliases automatically (couple→testerC, etc.)
  function parseGdQuestions(prefix, maxQ, ascending, textOnly) {
    var questions = [];
    var consecutiveMisses = 0;
    var maxMisses = textOnly ? 5 : 3;

    for (var i = 1; i <= (maxQ || 50); i++) {
      // Try q{N} key first, then numeric {N}
      var qText = QuizEngine.tgd(prefix + '.q' + i, null);
      if (!qText || qText === prefix + '.q' + i) {
        qText = QuizEngine.tgd(prefix + '.' + i, null);
      }
      if (!qText || qText === prefix + '.q' + i || qText === prefix + '.' + i) {
        consecutiveMisses++;
        if (questions.length > 0 && consecutiveMisses >= maxMisses) break;
        continue;
      }
      consecutiveMisses = 0;

      // Text-only quizzes (most, knowledge, funny, debate) don't need per-question options
      if (textOnly) {
        questions.push({ id: i, text: qText, options: [] });
        continue;
      }

      var options = [];
      var optLetters = ['a', 'b', 'c', 'd', 'e'];

      // Pattern 1: Standard a/b/c/d/e (FR format)
      for (var j = 0; j < optLetters.length; j++) {
        var oText = QuizEngine.tgd(prefix + '.q' + i + optLetters[j], null);
        if (oText && oText !== prefix + '.q' + i + optLetters[j]) {
          options.push({ id: optLetters[j], text: oText });
        }
      }

      // Pattern 2: o0/o1/o2/o3 (testerC, amoureux in non-FR)
      if (options.length === 0) {
        for (var j = 0; j < 5; j++) {
          var oText = QuizEngine.tgd(prefix + '.q' + i + 'o' + j, null);
          if (oText && oText !== prefix + '.q' + i + 'o' + j) {
            options.push({ id: optLetters[j], text: oText });
          }
        }
      }

      // Pattern 3: Uppercase A/B/C/D (coquinQ in non-FR)
      if (options.length === 0) {
        var upperLetters = ['A', 'B', 'C', 'D', 'E'];
        for (var j = 0; j < upperLetters.length; j++) {
          var oText = QuizEngine.tgd(prefix + '.q' + i + upperLetters[j], null);
          if (oText && oText !== prefix + '.q' + i + upperLetters[j]) {
            options.push({ id: optLetters[j], text: oText });
          }
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
  // maxScore: the real achievable max score (sum of max points per question)
  function parseGdResults(prefix, maxScore) {
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
    // Try r{N}t pattern without underscore (debate results in non-FR: r0t, r1t...)
    if (results.length === 0) {
      for (var k = 0; k <= 10; k++) {
        var rTitle = QuizEngine.tgd(prefix + '.r' + k + 't', null);
        if (!rTitle || rTitle === prefix + '.r' + k + 't') {
          if (k > 0) break;
          continue;
        }
        results.push({
          title: rTitle,
          description: QuizEngine.tgd(prefix + '.r' + k + 'd', ''),
          advice: QuizEngine.tgd(prefix + '.r' + k + 'a', '')
        });
      }
    }
    if (results.length === 0) return results;
    // Calculate score ranges based on real achievable max score
    var rangeSize = Math.ceil(maxScore / results.length);
    for (var r = 0; r < results.length; r++) {
      results[r].min = r * rangeSize;
      results[r].max = r === results.length - 1 ? maxScore : (r + 1) * rangeSize - 1;
    }
    return results;
  }

  // ─── Initializers ─────────────────────────────────────────

  function initSoloQuiz(cfg, questions) {
    // Calculate real achievable max score (sum of max points per question)
    var realMaxScore = 0;
    for (var i = 0; i < questions.length; i++) {
      var qMax = 0;
      for (var j = 0; j < questions[i].options.length; j++) {
        if (questions[i].options[j].points > qMax) qMax = questions[i].options[j].points;
      }
      realMaxScore += qMax;
    }
    var results = parseGdResults(cfg.prefix, realMaxScore);
    new QuizEngine.SoloTest({
      container: container,
      questions: questions,
      results: results,
      prefix: cfg.prefix,
      lang: lang,
      quizType: cfg.quizType || 'solo',
      hasSkip: cfg.hasSkip || false,
      hasLocalStorage: cfg.hasLocalStorage || false,
      needsName: cfg.needsName || false
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
    // In non-FR languages, 'healthy' prefix has full questions with options.
    // In FR, 'healthy' only has results, questions come from 'couple' prefix.
    var healthyQuestions = parseGdQuestions('healthy', 100);
    if (healthyQuestions.length === 0) {
      // Fallback: try 'couple' prefix (FR behavior)
      healthyQuestions = parseGdQuestions('couple', 30);
    }

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

    // Determine the prefix used for question text lookup at render time
    var usedPrefix = healthyQuestions.length > 0 && QuizEngine.tgd('healthy.q1', null) !== null ? 'healthy' : 'couple';

    new QuizEngine.HealthyQuiz({
      container: container,
      questions: healthyQuestions,
      results: results,
      prefix: usedPrefix,
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
    // Debate: try to parse with options first (FR has q1a/b/c/d)
    // If options exist, use them. Otherwise, text-only questions work fine
    // since debate engine uses 1-5 scale.
    var debateQuestions = parseGdQuestions(cfg.prefix, cfg.pool + 10);
    if (debateQuestions.length === 0) {
      // Retry as text-only
      debateQuestions = parseGdQuestions(cfg.prefix, cfg.pool + 10, false, true);
    }
    if (debateQuestions.length > cfg.totalQ) {
      debateQuestions = QuizEngine.shuffleArray(debateQuestions).slice(0, cfg.totalQ);
    } else if (debateQuestions.length > 0) {
      debateQuestions = QuizEngine.shuffleArray(debateQuestions);
    }
    if (debateQuestions.length === 0) debateQuestions = questions;

    // Debate results: try from gd.json first (non-FR debate prefix has r0t/r1t pattern)
    // Debate uses 1-5 scale, so max score = questions * 5
    var results = parseGdResults(cfg.prefix, debateQuestions.length * 5);

    if (results.length === 0) {
      // Fallback to percentage-based defaults
      results = [
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
    }

    new QuizEngine.DebateQuiz({
      container: container,
      questions: debateQuestions,
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

  function initParentaliteQuiz(cfg, questions) {
    // Parentalite quiz: each answer has explicit point values stored in gd.json
    // Format: parentalite.q{N}a_pts, parentalite.q{N}b_pts etc.
    // Points are encoded in the options data
    for (var i = 0; i < questions.length; i++) {
      var q = questions[i];
      for (var j = 0; j < q.options.length; j++) {
        var ptsKey = cfg.prefix + '.q' + q.id + q.options[j].id + '_pts';
        var pts = QuizEngine.tgd(ptsKey, null);
        if (pts !== null && pts !== ptsKey) {
          q.options[j].points = parseInt(pts, 10) || 0;
        }
      }
    }

    // Parse results from gd.json
    var results = [];
    for (var r = 1; r <= 10; r++) {
      var title = QuizEngine.tgd(cfg.prefix + '.r' + r + '_t', null);
      if (!title || title === cfg.prefix + '.r' + r + '_t') break;
      results.push({
        title: title,
        description: QuizEngine.tgd(cfg.prefix + '.r' + r + '_d', ''),
        advice: QuizEngine.tgd(cfg.prefix + '.r' + r + '_a', '')
      });
    }

    // Fixed score ranges for parentalite (out of 60 per player):
    // r1: 0-19, r2: 20-34, r3: 35-47, r4: 48-60
    if (results.length === 4) {
      results[0].min = 0;  results[0].max = 19;
      results[1].min = 20; results[1].max = 34;
      results[2].min = 35; results[2].max = 47;
      results[3].min = 48; results[3].max = 60;
    }

    new QuizEngine.ParentaliteQuiz({
      container: container,
      questions: questions,
      results: results,
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
