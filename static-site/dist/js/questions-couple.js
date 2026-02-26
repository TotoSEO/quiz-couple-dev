/**
 * Questions Couple - loads question categories and displays them interactively
 */
(function() {
  'use strict';

  var container = document.getElementById('questions-container');
  if (!container) return;

  var lang = document.documentElement.lang || 'fr';
  var SUPABASE_URL = 'https://nbjpgecedevlmypqisng.supabase.co';
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ianBnZWNlZGV2bG15cHFpc25nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNDk3MjgsImV4cCI6MjA4NDgyNTcyOH0.agwrq1lrAKP8Vc-Y349H3RxEZhEgsDj21cG1luw9AXs';

  // Translations
  var labels = {
    fr: { random: 'Question aléatoire', next: 'Suivante', categories: 'Catégories', all: 'Toutes', loading: 'Chargement...', noQ: 'Aucune question disponible.' },
    en: { random: 'Random question', next: 'Next', categories: 'Categories', all: 'All', loading: 'Loading...', noQ: 'No questions available.' },
    es: { random: 'Pregunta aleatoria', next: 'Siguiente', categories: 'Categorías', all: 'Todas', loading: 'Cargando...', noQ: 'No hay preguntas disponibles.' },
    de: { random: 'Zufällige Frage', next: 'Nächste', categories: 'Kategorien', all: 'Alle', loading: 'Laden...', noQ: 'Keine Fragen verfügbar.' },
    it: { random: 'Domanda casuale', next: 'Prossima', categories: 'Categorie', all: 'Tutte', loading: 'Caricamento...', noQ: 'Nessuna domanda disponibile.' }
  };
  var t = labels[lang] || labels.fr;

  // Load questions from translation file
  fetch('/js/data/games-' + lang + '.json')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      // Try to extract questions from quizGames data
      var questions = extractQuestions(data);
      if (questions.length > 0) {
        renderQuestions(questions);
      } else {
        renderFallback();
      }
    })
    .catch(function() {
      renderFallback();
    });

  function extractQuestions(data) {
    var questions = [];
    // Look for question-like patterns in the data
    var categories = [
      { key: 'connaissance', label: 'Se connaître', emoji: '🧠' },
      { key: 'futur', label: 'Projets futurs', emoji: '🚀' },
      { key: 'intime', label: 'Intimité', emoji: '💕' },
      { key: 'fun', label: 'Fun', emoji: '😄' },
      { key: 'profond', label: 'Questions profondes', emoji: '💭' }
    ];

    // Try to find questions in the data structure
    if (data && data.questionsCouple) {
      var qData = data.questionsCouple;
      for (var key in qData) {
        if (typeof qData[key] === 'string') {
          questions.push({ text: qData[key], category: 'general' });
        }
      }
    }

    // If no structured data, create sample questions
    if (questions.length === 0) {
      var sampleQuestions = {
        fr: [
          'Quel est mon plat préféré ?', 'Quelle est ma plus grande peur ?', 'Quel est mon souvenir d\'enfance préféré ?',
          'Où te vois-tu dans 5 ans ?', 'Quel est ton rêve de voyage ultime ?', 'Qu\'est-ce qui t\'attire le plus chez moi ?',
          'Si on était des animaux, lesquels serions-nous ?', 'Quelle est la chose la plus embarrassante que tu aies faite ?',
          'Quel est le moment où tu as été le plus fier de nous ?', 'Si tu pouvais changer une chose dans notre routine, ce serait quoi ?',
          'Quel est ton langage de l\'amour ?', 'Comment imagines-tu notre vie dans 10 ans ?'
        ],
        en: [
          'What is my favorite dish?', 'What is my biggest fear?', 'What is my favorite childhood memory?',
          'Where do you see yourself in 5 years?', 'What is your ultimate travel dream?', 'What attracts you most about me?',
          'If we were animals, which would we be?', 'What\'s the most embarrassing thing you\'ve done?',
          'When were you proudest of us?', 'If you could change one thing in our routine, what would it be?',
          'What is your love language?', 'How do you imagine our life in 10 years?'
        ]
      };
      var qs = sampleQuestions[lang] || sampleQuestions.fr;
      for (var i = 0; i < qs.length; i++) {
        questions.push({ text: qs[i], category: 'general' });
      }
    }

    return questions;
  }

  function renderQuestions(questions) {
    container.innerHTML = '';

    var currentIndex = Math.floor(Math.random() * questions.length);

    var card = document.createElement('div');
    card.className = 'quiz-engine animate-fade-in text-center';

    var questionEl = document.createElement('p');
    questionEl.className = 'text-xl md:text-2xl font-semibold mb-8 leading-relaxed';
    questionEl.textContent = questions[currentIndex].text;

    var btn = document.createElement('button');
    btn.className = 'btn btn-cta';
    btn.textContent = t.next;
    btn.addEventListener('click', function() {
      currentIndex = (currentIndex + 1) % questions.length;
      // Shuffle occasionally
      if (currentIndex === 0) {
        for (var i = questions.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var tmp = questions[i]; questions[i] = questions[j]; questions[j] = tmp;
        }
      }
      questionEl.textContent = questions[currentIndex].text;
      card.classList.remove('animate-fade-in');
      void card.offsetWidth;
      card.classList.add('animate-fade-in');
    });

    card.appendChild(questionEl);
    card.appendChild(btn);
    container.appendChild(card);
  }

  function renderFallback() {
    container.innerHTML = '<div class="text-center py-8"><p class="text-muted-foreground">' + t.noQ + '</p></div>';
  }
})();
