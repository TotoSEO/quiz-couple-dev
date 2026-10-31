/**
 * Questions Couple - tirage au sort d'une question, par theme ou parmi toutes
 */
(function() {
  'use strict';

  var container = document.getElementById('questions-container');
  if (!container) return;

  var lang = document.documentElement.lang || 'fr';

  var labels = {
    fr: { next: 'Une autre question', categories: 'Thèmes', all: 'Toutes' },
    en: { next: 'Another question', categories: 'Themes', all: 'All' },
    es: { next: 'Otra pregunta', categories: 'Temas', all: 'Todas' },
    de: { next: 'Andere Frage', categories: 'Themen', all: 'Alle' },
    it: { next: 'Un’altra domanda', categories: 'Temi', all: 'Tutte' },
    nl: { next: 'Andere vraag', categories: 'Thema’s', all: 'Alle' }
  };
  var t = labels[lang] || labels.fr;

  // Les questions sont deja dans la page, ecrites en dur par le gabarit.
  // On les relit depuis le DOM plutot que de retelecharger un fichier : c'est
  // la meme source pour l'affichage et pour le tirage, donc aucun risque que
  // les deux divergent. Chaque theme porte son nom court (data-court) pour
  // les pastilles du tirage.
  var themes = [];
  var questions = [];
  document.querySelectorAll('#liste-questions .qc-theme').forEach(function (th) {
    var cle = th.getAttribute('data-theme') || String(themes.length);
    themes.push({ cle: cle, court: th.getAttribute('data-court') || '' });
    th.querySelectorAll('.qc-question').forEach(function (li) {
      var texte = li.querySelector('span:last-child');
      if (texte && texte.textContent.trim()) {
        questions.push({ text: texte.textContent.trim(), theme: cle });
      }
    });
  });
  if (!questions.length) { container.innerHTML = ''; return; }

  var courtDe = {};
  themes.forEach(function (th) { courtDe[th.cle] = th.court; });

  function melange(liste) {
    for (var i = liste.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = liste[i]; liste[i] = liste[j]; liste[j] = tmp;
    }
    return liste;
  }

  var themeChoisi = '';
  var paquet = [];
  var rang = 0;
  function nouveauPaquet(eviter) {
    paquet = melange(questions.filter(function (q) { return !themeChoisi || q.theme === themeChoisi; }));
    // Jamais deux fois la meme question a la suite, meme en changeant de paquet
    if (eviter && paquet.length > 1 && paquet[0] === eviter) paquet.push(paquet.shift());
    rang = 0;
  }

  var card = document.createElement('div');
  card.className = 'quiz-engine qc-tirage text-center';

  var rangee = document.createElement('div');
  rangee.className = 'qc-tirage-themes';
  rangee.setAttribute('role', 'group');
  rangee.setAttribute('aria-label', t.categories);
  var pastilles = [{ cle: '', court: t.all }].concat(themes).map(function (th) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'qc-tirage-theme';
    b.textContent = th.court;
    b.setAttribute('aria-pressed', th.cle === themeChoisi ? 'true' : 'false');
    b.addEventListener('click', function () {
      if (themeChoisi === th.cle) return;
      themeChoisi = th.cle;
      pastilles.forEach(function (p) { p.btn.setAttribute('aria-pressed', p.cle === themeChoisi ? 'true' : 'false'); });
      nouveauPaquet(paquet[rang]);
      afficher();
    });
    rangee.appendChild(b);
    return { cle: th.cle, btn: b };
  });

  var etiquette = document.createElement('p');
  etiquette.className = 'qc-tirage-etiquette';

  var questionEl = document.createElement('p');
  questionEl.className = 'qc-tirage-question text-xl md:text-2xl font-semibold mb-8 leading-relaxed';
  questionEl.setAttribute('aria-live', 'polite');

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn btn-cta';
  btn.textContent = t.next;
  btn.addEventListener('click', function () {
    rang++;
    if (rang >= paquet.length) nouveauPaquet(paquet[rang - 1]);
    afficher();
  });

  function afficher() {
    var q = paquet[rang];
    etiquette.textContent = courtDe[q.theme] || '';
    questionEl.textContent = q.text;
    card.classList.remove('animate-fade-in');
    void card.offsetWidth;
    card.classList.add('animate-fade-in');
  }

  card.appendChild(rangee);
  card.appendChild(etiquette);
  card.appendChild(questionEl);
  card.appendChild(btn);
  container.innerHTML = '';
  container.appendChild(card);
  nouveauPaquet(null);
  afficher();
})();
