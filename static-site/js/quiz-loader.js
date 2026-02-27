/**
 * Universal Quiz Loader - auto-initializes quiz engine based on data attributes
 * Reads data-quiz and data-lang from #quiz-engine element
 */
(function() {
  'use strict';

  var container = document.getElementById('quiz-engine');
  if (!container) return;

  var quizType = container.dataset.quiz;
  var lang = container.dataset.lang || 'fr';
  if (!quizType) return;

  // Quiz configuration: maps quiz type to gd.json key prefix, mode, and question count
  var QUIZ_CONFIG = {
    // Solo scoring tests (points-based, single player)
    'toxic':          { prefix: 'divorce', mode: 'solo', totalQ: 25, gdKey: 'divorce', pool: 25 },
    'tester-couple':  { prefix: 'couple', mode: 'solo', totalQ: 20, gdKey: 'couple', pool: 20 },
    'sain':           { prefix: 'healthy', mode: 'solo', totalQ: 20, gdKey: 'healthy', pool: 20 },
    'distance':       { prefix: 'distance', mode: 'solo', totalQ: 20, gdKey: 'distance', pool: 20 },
    'divorce':        { prefix: 'divorce', mode: 'solo', totalQ: 25, gdKey: 'divorce', pool: 25 },
    'mariage':        { prefix: 'marriage', mode: 'solo', totalQ: 30, gdKey: 'marriage', pool: 30 },
    'ado':            { prefix: 'ado', mode: 'solo', totalQ: 20, gdKey: 'ado', pool: 80 },
    // Duo quizzes (2 players, match answers)
    'amoureux':       { prefix: 'amoureux', mode: 'duo', totalQ: 20, gdKey: 'amoureux', pool: 30 },
    'coquin':         { prefix: 'coquin', mode: 'duo', totalQ: 20, gdKey: 'coquin', pool: 30 },
    'marrant':        { prefix: 'marrant', mode: 'duo', totalQ: 20, gdKey: 'marrant', pool: 30 },
    'knowledge':      { prefix: 'knowledge', mode: 'duo', totalQ: 20, gdKey: 'knowledge', pool: 30 },
    'most':           { prefix: 'most', mode: 'duo', totalQ: 20, gdKey: 'most', pool: 30 },
    'common-points':  { prefix: 'commonPoints', mode: 'duo', totalQ: 20, gdKey: 'commonPoints', pool: 30 }
  };

  var config = QUIZ_CONFIG[quizType];
  if (!config) {
    container.innerHTML = '<p class="text-center text-muted-foreground">Quiz non disponible.</p>';
    return;
  }

  // Load translations then initialize
  QuizEngine.loadTranslations(lang, function() {
    if (config.mode === 'solo' && config.gdKey) {
      initSoloFromGd(config);
    } else if (config.mode === 'duo' && config.gdKey) {
      initDuoQuiz(config);
    } else if (config.mode === 'duo') {
      initDuoQuiz(config);
    } else {
      initGenericQuiz(config);
    }
  });

  /**
   * Parse questions from gd.json data for solo scoring tests.
   * For ado quiz: questions use ascending scores (1-4 points).
   * For other quizzes: descending scores (first option = highest).
   */
  function parseGdQuestions(prefix, maxQ, ascending) {
    var questions = [];
    for (var i = 1; i <= (maxQ || 50); i++) {
      var qText = QuizEngine.tgd(prefix + '.q' + i, null);
      if (!qText || qText === prefix + '.q' + i) {
        if (questions.length > 0) break; // Stop after first gap
        continue; // Skip gaps at start
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
        if (ascending) {
          // Ascending: a=1, b=2, c=3, d=4
          for (var k = 0; k < options.length; k++) {
            options[k].points = k + 1;
          }
        } else {
          // Descending: first option = highest
          var maxPts = options.length - 1;
          for (var k = 0; k < options.length; k++) {
            options[k].points = maxPts - k;
          }
        }
        questions.push({ id: i, text: qText, options: options });
      }
    }
    return questions;
  }

  /**
   * Parse results from gd.json data
   */
  function parseGdResults(prefix, totalQuestions, maxOptions) {
    var results = [];
    // Try r{N}_t pattern first (healthy, marriage, couple, distance)
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

  /**
   * Initialize a solo scoring test from gd.json data
   */
  function initSoloFromGd(cfg) {
    var ascending = (cfg.prefix === 'ado');
    var questions = parseGdQuestions(cfg.prefix, cfg.pool + 10, ascending);

    // Randomly select totalQ questions from pool if pool > totalQ
    if (questions.length > cfg.totalQ) {
      questions = shuffleArray(questions).slice(0, cfg.totalQ);
    } else if (questions.length > 0) {
      // Shuffle questions order even if we use all of them
      questions = shuffleArray(questions);
    }

    if (questions.length === 0) {
      initGenericQuiz(cfg);
      return;
    }

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
      lang: lang
    });
  }

  /**
   * Initialize a duo quiz (2 players, match answers)
   */
  function initDuoQuiz(cfg) {
    var questions = parseGdQuestions(cfg.prefix, cfg.pool + 10);

    // Randomly select totalQ questions from pool if pool > totalQ
    if (questions.length > cfg.totalQ) {
      questions = shuffleArray(questions).slice(0, cfg.totalQ);
    } else if (questions.length > 0) {
      questions = shuffleArray(questions);
    }

    if (questions.length === 0) {
      initGenericQuiz(cfg);
      return;
    }

    // Duo results: based on match count
    var results = [];
    var total = questions.length;
    var third = Math.ceil(total / 3);
    results.push({ minScore: 0, maxScore: third - 1, min: 0, max: third - 1,
      title: QuizEngine.tg('result.low', 'Vous avez des choses à découvrir !'),
      description: QuizEngine.tg('result.lowDesc', 'Vous avez encore beaucoup à apprendre sur vos goûts et préférences respectifs.')
    });
    results.push({ minScore: third, maxScore: third * 2 - 1, min: third, max: third * 2 - 1,
      title: QuizEngine.tg('result.medium', 'Bonne compatibilité !'),
      description: QuizEngine.tg('result.mediumDesc', 'Vous vous connaissez plutôt bien, avec quelques surprises.')
    });
    results.push({ minScore: third * 2, maxScore: total, min: third * 2, max: total,
      title: QuizEngine.tg('result.high', 'Incroyable connexion !'),
      description: QuizEngine.tg('result.highDesc', 'Vous êtes sur la même longueur d\'onde !')
    });

    new QuizEngine.DuoQuiz({
      container: container,
      questions: questions,
      results: results,
      prefix: cfg.prefix,
      lang: lang
    });
  }

  /**
   * Generic fallback: shows quiz intro with start button
   */
  function initGenericQuiz(cfg) {
    var wrap = QuizEngine.el('div', 'quiz-engine animate-fade-in text-center');
    var title = QuizEngine.el('h2', 'text-2xl font-bold mb-4',
      QuizEngine.tg('playerSetup.readyForTest', 'Prêt pour le quiz ?'));
    var desc = QuizEngine.el('p', 'text-muted-foreground mb-6',
      (cfg.totalQ || 20) + ' questions &bull; ' + QuizEngine.tg('meta.duration', '5 min'));

    var btn = QuizEngine.el('button', 'btn btn-cta',
      QuizEngine.esc(QuizEngine.tg('playerSetup.startNow', 'Commencer')));

    btn.addEventListener('click', function() {
      wrap.innerHTML = '<div class="text-center py-8"><div class="spinner mx-auto mb-4"></div><p class="text-muted-foreground">Chargement...</p></div>';
      setTimeout(function() {
        var questions = parseGdQuestions(cfg.prefix, cfg.totalQ + 5);
        if (questions.length > 0) {
          container.innerHTML = '';
          if (cfg.mode === 'duo') {
            initDuoQuiz(cfg);
          } else {
            initSoloFromGd(cfg);
          }
        } else {
          showUnavailable(cfg);
        }
      }, 300);
    });

    wrap.appendChild(title);
    wrap.appendChild(desc);
    wrap.appendChild(btn);
    container.appendChild(wrap);
  }

  function showUnavailable(cfg) {
    container.innerHTML = '';
    var wrap = QuizEngine.el('div', 'quiz-engine animate-fade-in text-center');
    var isDuo = cfg.mode === 'duo';
    wrap.innerHTML = '<h2 class="text-2xl font-bold mb-4">' +
      QuizEngine.esc(isDuo ? QuizEngine.tg('playerSetup.readyToPlay', 'Quiz à deux') : QuizEngine.tg('playerSetup.readyForTest', 'Quiz')) + '</h2>' +
      '<p class="text-muted-foreground mb-6">Ce quiz est en cours de migration vers cette version du site. Il sera disponible très prochainement.</p>' +
      '<a href="/" class="btn btn-primary">' + QuizEngine.esc(QuizEngine.tg('question.backHome', 'Retour à l\'accueil')) + '</a>';
    container.appendChild(wrap);
  }

  function shuffleArray(arr) {
    var shuffled = arr.slice();
    for (var i = shuffled.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = temp;
    }
    return shuffled;
  }
})();
