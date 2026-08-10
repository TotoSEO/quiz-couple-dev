/**
 * Questions Couple - loads question categories and displays them interactively
 */
(function() {
  'use strict';

  var container = document.getElementById('questions-container');
  if (!container) return;

  var lang = document.documentElement.lang || 'fr';
  var SUPABASE_URL = 'https://lojvajnnvhatfplevyvy.supabase.co';
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvanZham5udmhhdGZwbGV2eXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNzk3NDIsImV4cCI6MjA4Nzg1NTc0Mn0.gdd9HRbRvfQr6io9jGN6hUCW6tBOtognhwbsTJtSTng';

  // Translations
  var labels = {
    fr: { random: 'Question aléatoire', next: 'Suivante', categories: 'Catégories', all: 'Toutes', loading: 'Chargement...', noQ: 'Aucune question disponible.' },
    en: { random: 'Random question', next: 'Next', categories: 'Categories', all: 'All', loading: 'Loading...', noQ: 'No questions available.' },
    es: { random: 'Pregunta aleatoria', next: 'Siguiente', categories: 'Categorías', all: 'Todas', loading: 'Cargando...', noQ: 'No hay preguntas disponibles.' },
    de: { random: 'Zufällige Frage', next: 'Nächste', categories: 'Kategorien', all: 'Alle', loading: 'Laden...', noQ: 'Keine Fragen verfügbar.' },
    it: { random: 'Domanda casuale', next: 'Prossima', categories: 'Categorie', all: 'Tutte', loading: 'Caricamento...', noQ: 'Nessuna domanda disponibile.' }
  };
  var t = labels[lang] || labels.fr;

  // Les questions sont deja dans la page, ecrites en dur par le gabarit.
  // On les relit depuis le DOM plutot que de retelecharger un fichier : c'est
  // la meme source pour l'affichage et pour le tirage, donc aucun risque que
  // les deux divergent. L'ancien code cherchait une cle « questionsCouple »
  // qui n'a jamais existe, et retombait sur douze questions codees en dur,
  // servies en francais y compris sur les pages espagnole, allemande et
  // italienne.
  var questions = [];
  document.querySelectorAll('#liste-questions .qc-question').forEach(function (li) {
    var texte = li.querySelector('span:last-child');
    var theme = li.closest('.qc-theme');
    var titre = theme ? theme.querySelector('.qc-theme-titre') : null;
    if (texte && texte.textContent.trim()) {
      questions.push({ text: texte.textContent.trim(), category: titre ? titre.textContent.trim() : '' });
    }
  });
  if (questions.length > 0) renderQuestions(questions);
  else if (container) container.innerHTML = '';

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
