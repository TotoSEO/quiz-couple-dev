/**
 * Quiz Ado - Multiplayer Engine
 * Supports two modes:
 *   1) "local" - same phone, both players take turns
 *   2) "online" - separate phones via Supabase Realtime Broadcast
 */
(function () {
  'use strict';

  var SUPABASE_URL = 'https://lojvajnnvhatfplevyvy.supabase.co';
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvanZham5udmhhdGZwbGV2eXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNzk3NDIsImV4cCI6MjA4Nzg1NTc0Mn0.gdd9HRbRvfQr6io9jGN6hUCW6tBOtognhwbsTJtSTng';

  var container, lang, sb, channel;
  var questions = [];
  var totalQ = 20;
  var state = {
    screen: 'mode-select',
    gameMode: null,    // 'local' or 'online'
    onlineRole: null,  // 'create' or 'join' (online only)
    sessionCode: null,
    playerNum: 0,      // 1 or 2
    name1: '',
    name2: '',
    currentPlayer: 1,  // who's currently answering (local mode)
    currentQ: 0,
    answers1: [],      // player 1 answers
    answers2: [],      // player 2 answers
    partnerAnswers: [], // online mode: partner answers received
    questionIds: [],
    questionsReady: false,
    error: null,
    loading: false,
    waitingForPartner: false
  };

  // ── UI Translations ──
  var UI = {
    fr: {
      modeTitle: 'Quiz Couple Ado',
      modeSubtitle: 'Testez votre compatibilité en répondant aux mêmes questions !',
      localBtn: 'Sur le même téléphone',
      localDesc: 'Répondez chacun votre tour sur le même appareil',
      onlineBtn: 'Chacun sur son téléphone',
      onlineDesc: 'Jouez à distance avec un code de partie',
      player1Name: 'Prénom du joueur 1',
      player2Name: 'Prénom du joueur 2',
      namePlaceholder: 'Entre ton prénom',
      sessionCode: 'Code de la partie',
      codePlaceholder: 'Ex: ABC123',
      startLocal: 'Commencer le quiz',
      createGame: 'Créer une partie',
      joinGame: 'Rejoindre',
      back: 'Retour',
      waitingTitle: 'En attente de ton/ta partenaire…',
      waitingDesc: 'Envoie ce code à ton/ta partenaire :',
      copyCode: 'Copier le code',
      copied: 'Copié !',
      passPhone: 'Passe le téléphone à {{name}} !',
      passPhoneDesc: '{{name}} a terminé. C\'est au tour de {{name2}} de répondre aux mêmes questions.',
      tapToContinue: 'C\'est parti !',
      dontLook: '({{name}}, ne regarde pas les réponses !)',
      questionOf: 'sur',
      turnOf: 'Tour de {{name}}',
      waitingAnswer: 'En attente de {{name}}…',
      waitingProgress: '{{name}} : question {{n}}/{{total}}',
      resultsTitle: 'Vos résultats',
      matchPercent: '{{pct}}% de compatibilité',
      identical: 'réponses identiques',
      playAgain: 'Rejouer',
      backHome: 'Retour à l\'accueil',
      errorGeneric: 'Erreur de connexion. Essaie le mode "même téléphone".',
      errorCodeInvalid: 'Code invalide ou partie introuvable.',
      errorTimeout: 'Connexion perdue. Réessaie.',
      comparison: 'Voir le détail des réponses',
      connecting: 'Connexion…',
      createDesc2: 'Crée un code et envoie-le à ton/ta partenaire',
      joinDesc2: 'Entre le code reçu de ton/ta partenaire',
      joueur: 'Joueur',
      prenomCourt: 'Prénom',
      questionLabel: 'Question',
      metaQuestions: '{{n}} questions chacun',
      notreConseil: 'Notre conseil',
      nomLabel: 'Ton prénom',
      roleTitre: 'Comment on se retrouve ?'
    },
    en: {
      modeTitle: 'Teen Couple Quiz',
      modeSubtitle: 'Test your compatibility by answering the same questions!',
      localBtn: 'Same phone',
      localDesc: 'Take turns answering on the same device',
      onlineBtn: 'Separate phones',
      onlineDesc: 'Play remotely with a game code',
      player1Name: 'Player 1 name',
      player2Name: 'Player 2 name',
      namePlaceholder: 'Enter your name',
      sessionCode: 'Game code',
      codePlaceholder: 'E.g. ABC123',
      startLocal: 'Start quiz',
      createGame: 'Create a game',
      joinGame: 'Join',
      back: 'Back',
      waitingTitle: 'Waiting for your partner…',
      waitingDesc: 'Send this code to your partner:',
      copyCode: 'Copy code',
      copied: 'Copied!',
      passPhone: 'Pass the phone to {{name}}!',
      passPhoneDesc: '{{name}} is done. Now it\'s {{name2}}\'s turn to answer the same questions.',
      tapToContinue: 'Let\'s go!',
      dontLook: '({{name}}, don\'t peek at the answers!)',
      questionOf: 'of',
      turnOf: '{{name}}\'s turn',
      waitingAnswer: 'Waiting for {{name}}…',
      waitingProgress: '{{name}}: question {{n}}/{{total}}',
      resultsTitle: 'Your results',
      matchPercent: '{{pct}}% compatibility',
      identical: 'identical answers',
      playAgain: 'Play again',
      backHome: 'Back to home',
      errorGeneric: 'Connection error. Try "same phone" mode.',
      errorCodeInvalid: 'Invalid code or game not found.',
      errorTimeout: 'Connection lost. Try again.',
      comparison: 'See answer details',
      connecting: 'Connecting…',
      createDesc2: 'Create a code and send it to your partner',
      joinDesc2: 'Enter the code from your partner',
      joueur: 'Player',
      prenomCourt: 'First name',
      questionLabel: 'Question',
      metaQuestions: '{{n}} questions each',
      notreConseil: 'Our advice',
      nomLabel: 'Your name',
      roleTitre: 'How do you meet up?'
    },
    es: {
      modeTitle: 'Quiz Pareja Adolescentes',
      modeSubtitle: '¡Prueba tu compatibilidad respondiendo las mismas preguntas!',
      localBtn: 'Mismo teléfono',
      localDesc: 'Responded por turnos en el mismo dispositivo',
      onlineBtn: 'Cada uno en su teléfono',
      onlineDesc: 'Juega a distancia con un código',
      player1Name: 'Nombre jugador 1',
      player2Name: 'Nombre jugador 2',
      namePlaceholder: 'Tu nombre',
      sessionCode: 'Código de partida',
      codePlaceholder: 'Ej: ABC123',
      startLocal: 'Empezar',
      createGame: 'Crear partida',
      joinGame: 'Unirse',
      back: 'Volver',
      waitingTitle: 'Esperando a tu pareja…',
      waitingDesc: 'Envía este código a tu pareja:',
      copyCode: 'Copiar',
      copied: '¡Copiado!',
      passPhone: '¡Pasa el teléfono a {{name}}!',
      passPhoneDesc: '{{name}} ha terminado. Ahora le toca a {{name2}}.',
      tapToContinue: '¡Vamos!',
      dontLook: '({{name}}, ¡no mires las respuestas!)',
      questionOf: 'de',
      turnOf: 'Turno de {{name}}',
      waitingAnswer: 'Esperando a {{name}}…',
      waitingProgress: '{{name}}: pregunta {{n}}/{{total}}',
      resultsTitle: 'Resultados',
      matchPercent: '{{pct}}% compatibilidad',
      identical: 'respuestas idénticas',
      playAgain: 'Jugar de nuevo',
      backHome: 'Volver al inicio',
      errorGeneric: 'Error de conexión. Prueba el modo "mismo teléfono".',
      errorCodeInvalid: 'Código inválido.',
      errorTimeout: 'Conexión perdida.',
      comparison: 'Ver detalle',
      connecting: 'Conectando…',
      createDesc2: 'Crea un código y envíalo',
      joinDesc2: 'Introduce el código recibido',
      joueur: 'Jugador',
      prenomCourt: 'Nombre',
      questionLabel: 'Pregunta',
      metaQuestions: '{{n}} preguntas cada uno',
      notreConseil: 'Nuestro consejo',
      nomLabel: 'Tu nombre',
      roleTitre: '¿Cómo os conectáis?'
    },
    de: {
      modeTitle: 'Teenager Paar-Quiz',
      modeSubtitle: 'Testet eure Kompatibilität mit denselben Fragen!',
      localBtn: 'Gleiches Handy',
      localDesc: 'Antwortet abwechselnd auf demselben Gerät',
      onlineBtn: 'Jeder auf seinem Handy',
      onlineDesc: 'Spielt aus der Ferne mit einem Code',
      player1Name: 'Name Spieler 1',
      player2Name: 'Name Spieler 2',
      namePlaceholder: 'Dein Name',
      sessionCode: 'Spielcode',
      codePlaceholder: 'Z.B. ABC123',
      startLocal: 'Quiz starten',
      createGame: 'Spiel erstellen',
      joinGame: 'Beitreten',
      back: 'Zurück',
      waitingTitle: 'Warte auf Partner…',
      waitingDesc: 'Sende diesen Code:',
      copyCode: 'Kopieren',
      copied: 'Kopiert!',
      passPhone: 'Gib das Handy an {{name}}!',
      passPhoneDesc: '{{name}} ist fertig. Jetzt ist {{name2}} dran.',
      tapToContinue: 'Los geht\'s!',
      dontLook: '({{name}}, nicht spicken!)',
      questionOf: 'von',
      turnOf: '{{name}} ist dran',
      waitingAnswer: 'Warte auf {{name}}…',
      waitingProgress: '{{name}}: Frage {{n}}/{{total}}',
      resultsTitle: 'Ergebnisse',
      matchPercent: '{{pct}}% Kompatibilität',
      identical: 'identische Antworten',
      playAgain: 'Nochmal',
      backHome: 'Startseite',
      errorGeneric: 'Verbindungsfehler. Probiere "gleiches Handy".',
      errorCodeInvalid: 'Ungültiger Code.',
      errorTimeout: 'Verbindung verloren.',
      comparison: 'Details anzeigen',
      connecting: 'Verbinde…',
      createDesc2: 'Erstelle einen Code',
      joinDesc2: 'Code eingeben',
      joueur: 'Spieler',
      prenomCourt: 'Vorname',
      questionLabel: 'Frage',
      metaQuestions: '{{n}} Fragen pro Person',
      notreConseil: 'Unser Tipp',
      nomLabel: 'Dein Name',
      roleTitre: 'Wie findet ihr euch?'
    },
    it: {
      modeTitle: 'Quiz Coppia Adolescenti',
      modeSubtitle: 'Testate la vostra compatibilità rispondendo alle stesse domande!',
      localBtn: 'Stesso telefono',
      localDesc: 'Rispondete a turno sullo stesso dispositivo',
      onlineBtn: 'Ognuno sul suo telefono',
      onlineDesc: 'Giocate a distanza con un codice',
      player1Name: 'Nome giocatore 1',
      player2Name: 'Nome giocatore 2',
      namePlaceholder: 'Il tuo nome',
      sessionCode: 'Codice partita',
      codePlaceholder: 'Es: ABC123',
      startLocal: 'Inizia il quiz',
      createGame: 'Crea partita',
      joinGame: 'Unisciti',
      back: 'Indietro',
      waitingTitle: 'In attesa del partner…',
      waitingDesc: 'Invia questo codice:',
      copyCode: 'Copia',
      copied: 'Copiato!',
      passPhone: 'Passa il telefono a {{name}}!',
      passPhoneDesc: '{{name}} ha finito. Ora tocca a {{name2}}.',
      tapToContinue: 'Andiamo!',
      dontLook: '({{name}}, non sbirciare!)',
      questionOf: 'di',
      turnOf: 'Turno di {{name}}',
      waitingAnswer: 'In attesa di {{name}}…',
      waitingProgress: '{{name}}: domanda {{n}}/{{total}}',
      resultsTitle: 'Risultati',
      matchPercent: '{{pct}}% compatibilità',
      identical: 'risposte identiche',
      playAgain: 'Rigioca',
      backHome: 'Home',
      errorGeneric: 'Errore. Prova "stesso telefono".',
      errorCodeInvalid: 'Codice non valido.',
      errorTimeout: 'Connessione persa.',
      comparison: 'Vedi dettaglio',
      connecting: 'Connessione…',
      createDesc2: 'Crea un codice e invialo',
      joinDesc2: 'Inserisci il codice ricevuto',
      joueur: 'Giocatore',
      prenomCourt: 'Nome',
      questionLabel: 'Domanda',
      metaQuestions: '{{n}} domande a testa',
      notreConseil: 'Il nostro consiglio',
      nomLabel: 'Il tuo nome',
      roleTitre: 'Come vi collegate?'
    }
  };

  function t(key) { return (UI[lang] || UI.fr)[key] || UI.fr[key] || key; }

  // ── Les briques d'ecran, calquees sur le moteur commun ──
  // Ce moteur est a part, mais ses ecrans reprennent les memes classes que
  // les autres tests : c'est la feuille de style du moteur commun qui les
  // habille (cadre a l'encre, cartes joueurs, barre de progression, reponses,
  // relais, ecran de resultat). Aucune regle n'est a ecrire deux fois.
  var ICONE_DEUX = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>';
  var ICONE_TEL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>';
  var LETTRES = ['A', 'B', 'C', 'D', 'E'];

  function enTete(icone, titre, desc) {
    return '<div class="quiz-setup-icon mx-auto mb-6">' + icone + '</div>' +
      '<h2 class="text-2xl font-bold mb-3 text-center"><span class="quiz-setup-h2-txt">' + esc(titre) + '</span></h2>' +
      (desc ? '<p class="text-muted-foreground mb-8 text-center">' + esc(desc) + '</p>' : '');
  }
  function carteJoueur(num, inputId, valeur) {
    return '<div class="quiz-player-card">' +
      '<div class="quiz-player-number">' + num + '</div>' +
      '<label class="block text-sm font-semibold mb-2 text-center" for="' + inputId + '">' + esc(t('joueur')) + ' ' + num + '</label>' +
      '<input id="' + inputId + '" type="text" class="input w-full" placeholder="' + esc(t('prenomCourt')) + '" maxlength="30" autocomplete="off" value="' + esc(valeur || '') + '" />' +
    '</div>';
  }
  function progression(courant, total, droite) {
    var pct = Math.round(courant / total * 100);
    var libelle = t('questionLabel') + ' ' + Math.min(courant + 1, total) + '/' + total;
    return '<div class="quiz-progress-wrapper">' +
      '<div class="quiz-progress-header">' +
        '<span class="quiz-progress-label">' + esc(libelle) + '</span>' +
        '<span class="quiz-progress-pct">' + (droite || (pct + '%')) + '</span>' +
      '</div>' +
      '<div class="quiz-progress-bar" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100" aria-label="' + esc(libelle) + '">' +
        '<div class="quiz-progress-fill" style="width:' + pct + '%"></div>' +
      '</div>' +
    '</div>';
  }
  // A distance, chacun avance a son rythme : deux barres, une par joueur,
  // avec la meme piste que la barre commune.
  function progressionDuo(moi, lui, nMoi, nLui) {
    function ligne(nom, n, cls) {
      return '<div class="ado-duo-ligne">' +
        '<span class="ado-duo-nom ' + cls + '">' + esc(nom) + '</span>' +
        '<div class="quiz-progress-bar"><div class="quiz-progress-fill ' + cls + '" style="width:' + (n / totalQ * 100) + '%"></div></div>' +
        '<span class="ado-duo-compte">' + n + '/' + totalQ + '</span>' +
      '</div>';
    }
    return '<div class="ado-duo-progression">' + ligne(moi, nMoi, 'ado-duo--moi') + ligne(lui, nLui, 'ado-duo--lui') + '</div>';
  }
  function anneauScore(pct) {
    if (!document.getElementById('scoreGradientSvg')) {
      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.id = 'scoreGradientSvg'; svg.setAttribute('width', '0'); svg.setAttribute('height', '0'); svg.style.position = 'absolute';
      svg.innerHTML = '<defs><linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="hsl(340, 65%, 65%)"/><stop offset="100%" stop-color="hsl(270, 40%, 70%)"/></linearGradient></defs>';
      document.body.appendChild(svg);
    }
    var c = 283, offset = c - (c * pct / 100);
    return '<div class="score-ring-wrap">' +
      '<svg viewBox="0 0 100 100" class="score-ring" aria-hidden="true">' +
        '<circle cx="50" cy="50" r="45" class="score-ring-bg"/>' +
        '<circle cx="50" cy="50" r="45" class="score-ring-fill" style="stroke-dashoffset:' + offset + '"/>' +
      '</svg>' +
      '<span class="score-ring-value">' + pct + '%</span>' +
    '</div>';
  }
  function esc(s) { return s ? String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') : ''; }

  // Helper: resolve names consistently regardless of player perspective
  function getMyName() {
    if (state.gameMode === 'online' && state.playerNum === 2) return state.name2;
    return state.name1;
  }
  function getPartnerName() {
    if (state.gameMode === 'online' && state.playerNum === 2) return state.name1;
    return state.name2;
  }

  // ── Data ──
  var allQData = null;

  // Ce quiz n'a besoin que du préfixe 'ado' : on va chercher son fragment
  // plutôt que les ~300 Ko du fichier complet, avec repli sur celui-ci.
  // Empreinte de la construction, posée par le générateur dans l'en-tête de la
  // page : les données sont demandées avec elle pour qu'aucun cache ne réponde
  // avec celles d'une version antérieure du site.
  function _v(url) {
    var v = (typeof window !== 'undefined' && window.__QCV) || '';
    return v ? url + '?v=' + v : url;
  }

  function loadQuizData() {
    return fetch(_v('/js/data/gd/ado-' + lang + '.json'))
      .then(function (r) { if (!r.ok) throw new Error('fragment absent'); return r.json(); })
      .then(function (d) {
        allQData = d.ado || {};
        if (!Object.keys(allQData).length) throw new Error('fragment vide');
      })
      .catch(function () {
        return fetch(_v('/js/data/gd-' + lang + '.json'))
          .then(function (r) { return r.json(); })
          .then(function (d) { allQData = d.ado || {}; });
      });
  }

  // Les quatre-vingts questions ne parlent pas de la même chose : certaines
  // portent sur l'avenir, d'autres sur la confiance, d'autres sur les goûts
  // partagés. Tirées au hasard, vingt d'entre elles pouvaient être presque
  // toutes des questions de goûts, et la partie ne mesurait alors plus la même
  // chose que la précédente. On garde donc un quota par thème : chaque partie
  // couvre les sept, et le hasard ne joue plus qu'à l'intérieur d'un thème.
  var THEMES = {
    projection:    [1, 2, 3, 6, 7, 9, 11, 12, 13, 14, 79],
    engagement:    [4, 5, 15, 42, 43, 45, 46, 55, 56, 58],
    communication: [17, 21, 23, 24, 28, 30, 34, 35, 36],
    confiance:     [22, 29, 32, 37, 39, 40, 59, 65],
    complicite:    [18, 25, 33, 38, 41, 44, 47, 48, 49, 50, 51, 53, 54, 57, 69, 70, 73, 76],
    soutien:       [8, 16, 26, 31, 60, 75],
    ressenti:      [10, 19, 20, 27, 52, 61, 62, 63, 64, 66, 67, 68, 71, 72, 74, 77, 78, 80]
  };

  function melange(t) {
    var c = t.slice();
    for (var j = c.length - 1; j > 0; j--) {
      var k = Math.floor(Math.random() * (j + 1));
      var tmp = c[j]; c[j] = c[k]; c[k] = tmp;
    }
    return c;
  }

  function selectRandomQuestions() {
    // Un créneau de base par thème, puis le reliquat aux thèmes les mieux
    // fournis : le tirage reflète le poids réel de chaque thème sans jamais
    // laisser un thème de côté.
    var noms = Object.keys(THEMES);
    var quotas = {}, restant = totalQ, i, n;
    var base = Math.floor(totalQ / noms.length);
    for (i = 0; i < noms.length; i++) {
      n = Math.min(base, THEMES[noms[i]].length);
      quotas[noms[i]] = n;
      restant -= n;
    }
    var ordre = noms.slice().sort(function (a, b) {
      return THEMES[b].length - THEMES[a].length;
    });
    while (restant > 0) {
      var avance = false;
      for (i = 0; i < ordre.length && restant > 0; i++) {
        if (quotas[ordre[i]] < THEMES[ordre[i]].length) {
          quotas[ordre[i]]++; restant--; avance = true;
        }
      }
      if (!avance) break;
    }
    var ids = [];
    for (i = 0; i < noms.length; i++) {
      ids = ids.concat(melange(THEMES[noms[i]]).slice(0, quotas[noms[i]]));
    }
    return melange(ids).slice(0, totalQ);
  }

  function loadQuestionsFromIds(ids) {
    questions = [];
    for (var i = 0; i < ids.length; i++) {
      var id = ids[i];
      questions.push({
        id: id, text: allQData['q' + id] || '',
        a: allQData['q' + id + 'a'] || '', b: allQData['q' + id + 'b'] || '',
        c: allQData['q' + id + 'c'] || '', d: allQData['q' + id + 'd'] || ''
      });
    }
    state.questionsReady = true;
  }

  // ── Rendering ──
  function render() {
    switch (state.screen) {
      case 'mode-select': renderModeSelect(); break;
      case 'name-input-local': renderNameInputLocal(); break;
      case 'name-input-online': renderNameInputOnline(); break;
      case 'waiting': renderWaiting(); break;
      case 'pass-phone': renderPassPhone(); break;
      case 'questions': renderQuestions(); break;
      case 'results': renderResults(); break;
    }
  }

  // ── Screen: Mode Select ──
  function renderModeSelect() {
    container.innerHTML =
      '<div class="quiz-engine quiz-setup-screen quiz-modes animate-fade-in">' +
        enTete(ICONE_DEUX, t('modeTitle'), t('modeSubtitle')) +
        '<div class="choix-modes choix-modes--longs">' +
          '<button id="btn-local" type="button" class="choix-mode choix-mode--solo" aria-label="' + esc(t('localBtn') + ' : ' + t('localDesc')) + '">' +
            '<span class="ado-mode-icon" aria-hidden="true">' + ICONE_TEL + '</span>' +
            '<span class="choix-mode-nom">' + esc(t('localBtn')) + '</span>' +
            '<span class="choix-mode-desc">' + esc(t('localDesc')) + '</span>' +
          '</button>' +
          '<button id="btn-online" type="button" class="choix-mode choix-mode--duo" aria-label="' + esc(t('onlineBtn') + ' : ' + t('onlineDesc')) + '">' +
            '<span class="ado-mode-icon ado-mode-icon--alt" aria-hidden="true">' + ICONE_DEUX + '</span>' +
            '<span class="choix-mode-nom">' + esc(t('onlineBtn')) + '</span>' +
            '<span class="choix-mode-desc">' + esc(t('onlineDesc')) + '</span>' +
          '</button>' +
        '</div>' +
      '</div>';

    document.getElementById('btn-local').addEventListener('click', function () {
      state.gameMode = 'local';
      state.screen = 'name-input-local';
      render();
    });
    document.getElementById('btn-online').addEventListener('click', function () {
      state.gameMode = 'online';
      state.screen = 'name-input-online';
      render();
    });
  }

  // ── Screen: Name Input (Local mode) ──
  function renderNameInputLocal() {
    container.innerHTML =
      '<div class="quiz-engine quiz-setup-screen animate-fade-in">' +
        enTete(ICONE_TEL, t('localBtn'), t('localDesc')) +
        '<div class="quiz-setup-grid max-w-lg mx-auto">' +
          carteJoueur(1, 'name1', state.name1) +
          carteJoueur(2, 'name2', state.name2) +
        '</div>' +
        (state.error ? '<p class="ado-erreur">' + esc(state.error) + '</p>' : '') +
        '<div class="quiz-setup-meta">' + esc(t('metaQuestions').replace('{{n}}', totalQ)) + '</div>' +
        '<button id="btn-go" type="button" class="btn btn-cta btn-lg quiz-setup-start-btn">' + esc(t('startLocal')) + '</button>' +
        backBtn() +
      '</div>';

    addBackListener();
    var n1 = document.getElementById('name1');
    var n2 = document.getElementById('name2');
    n1.focus();

    document.getElementById('btn-go').addEventListener('click', function () {
      var v1 = n1.value.trim(), v2 = n2.value.trim();
      if (!v1) { n1.focus(); return; }
      if (!v2) { n2.focus(); return; }
      state.name1 = v1;
      state.name2 = v2;
      state.playerNum = 1;
      state.currentPlayer = 1;
      state.currentQ = 0;
      state.answers1 = [];
      state.answers2 = [];
      state.questionIds = selectRandomQuestions();
      loadQuestionsFromIds(state.questionIds);
      state.screen = 'questions';
      render();
    });

    addEnterListener();
  }

  // ── Screen: Name Input (Online mode) ──
  function renderNameInputOnline() {
    var role = state.onlineRole;
    container.innerHTML =
      '<div class="quiz-engine quiz-setup-screen animate-fade-in">' +
        enTete(ICONE_DEUX, t('onlineBtn'), t('onlineDesc')) +
        '<p class="ado-role-titre">' + esc(t('roleTitre')) + '</p>' +
        '<div class="quiz-modes-liste ado-roles">' +
          '<button id="btn-create" type="button" class="quiz-mode-carte' + (role === 'create' ? ' est-choisi' : '') + '" aria-pressed="' + (role === 'create') + '">' +
            '<span class="quiz-mode-emoji" aria-hidden="true">✨</span>' +
            '<span class="quiz-mode-corps"><span class="quiz-mode-titre">' + esc(t('createGame')) + '</span><span class="quiz-mode-desc">' + esc(t('createDesc2')) + '</span></span>' +
          '</button>' +
          '<button id="btn-join" type="button" class="quiz-mode-carte' + (role === 'join' ? ' est-choisi' : '') + '" aria-pressed="' + (role === 'join') + '">' +
            '<span class="quiz-mode-emoji" aria-hidden="true">🔑</span>' +
            '<span class="quiz-mode-corps"><span class="quiz-mode-titre">' + esc(t('joinGame')) + '</span><span class="quiz-mode-desc">' + esc(t('joinDesc2')) + '</span></span>' +
          '</button>' +
        '</div>' +
        (role ?
        '<div class="quiz-setup-grid quiz-setup-grid--seul max-w-lg mx-auto">' +
          '<div class="quiz-player-card">' +
            '<div class="quiz-player-number">' + (role === 'join' ? 2 : 1) + '</div>' +
            '<label class="block text-sm font-semibold mb-2 text-center" for="online-name">' + esc(t('nomLabel')) + '</label>' +
            '<input id="online-name" type="text" class="input w-full" placeholder="' + esc(t('namePlaceholder')) + '" maxlength="30" autocomplete="off" value="' + esc(state.name1) + '" />' +
            (role === 'join' ?
            '<label class="block text-sm font-semibold mt-4 mb-2 text-center" for="online-code">' + esc(t('sessionCode')) + '</label>' +
            '<input id="online-code" type="text" class="input w-full ado-code-saisie" placeholder="' + esc(t('codePlaceholder')) + '" maxlength="6" autocomplete="off" autocapitalize="characters" spellcheck="false" />' : '') +
          '</div>' +
        '</div>' +
        (state.error ? '<p class="ado-erreur">' + esc(state.error) + '</p>' : '') +
        '<button id="btn-online-go" type="button" class="btn btn-cta btn-lg quiz-setup-start-btn"' + (state.loading ? ' disabled' : '') + '>' +
          (state.loading ? '<span class="spinner-sm"></span> ' + esc(t('connecting')) : esc(role === 'join' ? t('joinGame') : t('createGame'))) +
        '</button>' : '') +
        backBtn() +
      '</div>';

    addBackListener();

    document.getElementById('btn-create').addEventListener('click', function () {
      state.onlineRole = 'create'; state.error = null; render();
    });
    document.getElementById('btn-join').addEventListener('click', function () {
      state.onlineRole = 'join'; state.error = null; render();
    });

    var nameInput = document.getElementById('online-name');
    if (nameInput && !state.loading) nameInput.focus();

    var goBtn = document.getElementById('btn-online-go');
    if (goBtn) {
      goBtn.addEventListener('click', function () {
        if (state.loading) return;
        var name = nameInput.value.trim();
        if (!name) { nameInput.focus(); return; }
        state.name1 = name;
        state.error = null;

        if (!sb) {
          state.error = t('errorGeneric');
          render();
          return;
        }

        if (state.onlineRole === 'create') {
          doOnlineCreate();
        } else {
          var codeInput = document.getElementById('online-code');
          var code = codeInput ? codeInput.value.trim().toUpperCase() : '';
          if (!code || code.length < 4) { if (codeInput) codeInput.focus(); return; }
          doOnlineJoin(code);
        }
      });

      addEnterListener();
    }
  }

  // ── Screen: Waiting Room (online create) ──
  function renderWaiting() {
    container.innerHTML =
      '<div class="quiz-engine quiz-setup-screen animate-fade-in">' +
        enTete(ICONE_DEUX, t('waitingTitle'), t('waitingDesc')) +
        '<div class="ado-code" aria-live="polite">' + esc(state.sessionCode) + '</div>' +
        '<div class="ado-attente"><span class="spinner"></span></div>' +
        '<div class="ado-actions">' +
          '<button id="btn-copy" type="button" class="btn btn-outline">' + esc(t('copyCode')) + '</button>' +
          '<button id="btn-cancel" type="button" class="btn btn-ghost">' + esc(t('back')) + '</button>' +
        '</div>' +
      '</div>';

    document.getElementById('btn-copy').addEventListener('click', function () {
      var btn = this;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(state.sessionCode).then(function () {
          btn.textContent = '✓ ' + t('copied');
          setTimeout(function () { btn.textContent = t('copyCode'); }, 2000);
        });
      }
    });

    document.getElementById('btn-cancel').addEventListener('click', function () {
      if (channel) { channel.unsubscribe(); channel = null; }
      state.screen = 'mode-select'; state.error = null;
      render();
    });
  }

  // ── Screen: Pass Phone (local mode) ──
  function renderPassPhone() {
    var doneName = state.name1;
    var nextName = state.name2;
    container.innerHTML =
      '<div class="qc-relais ado-relais" role="status" aria-live="polite">' +
        '<div class="qc-relais-macaron" aria-hidden="true"><span>📱</span></div>' +
        '<p class="qc-relais-annonce">' + esc(t('passPhone')).replace('{{name}}', '<span class="qc-relais-nom">' + esc(nextName) + '</span>') + '</p>' +
        '<p class="qc-relais-note">' + esc(t('passPhoneDesc').replace('{{name}}', doneName).replace('{{name2}}', nextName)) + '</p>' +
        '<p class="qc-relais-etape">' + esc(t('dontLook').replace('{{name}}', doneName)) + '</p>' +
        '<button id="btn-continue" type="button" class="btn btn-cta btn-lg">' + esc(t('tapToContinue')) + '</button>' +
      '</div>';

    document.getElementById('btn-continue').addEventListener('click', function () {
      state.currentPlayer = 2;
      state.currentQ = 0;
      state.screen = 'questions';
      render();
    });
  }

  // ── Screen: Questions ──
  function renderQuestions() {
    if (!state.questionsReady || questions.length === 0) {
      container.innerHTML = '<div class="quiz-engine quiz-setup-screen"><div class="ado-attente"><span class="spinner"></span></div></div>';
      return;
    }

    var qi = state.currentQ;

    // Local mode: check if current player is done
    if (state.gameMode === 'local' && qi >= totalQ) {
      if (state.currentPlayer === 1) {
        state.screen = 'pass-phone';
        render();
        return;
      } else {
        state.screen = 'results';
        render();
        return;
      }
    }

    // Online mode: both done → results
    if (state.gameMode === 'online' && qi >= totalQ && state.partnerAnswers.length >= totalQ) {
      state.screen = 'results';
      render();
      return;
    }

    // Online mode: I answered this question, waiting for partner
    if (state.gameMode === 'online' && state.waitingForPartner) {
      renderWaitingForQuestion();
      return;
    }

    // Online mode: I'm done but partner isn't
    if (state.gameMode === 'online' && qi >= totalQ) {
      renderWaitingForPartner();
      return;
    }

    var q = questions[qi];
    var currentName = (state.gameMode === 'local')
      ? (state.currentPlayer === 1 ? state.name1 : state.name2)
      : getMyName();
    var partnerName = (state.gameMode === 'local')
      ? (state.currentPlayer === 1 ? state.name2 : state.name1)
      : getPartnerName();

    var qText = q.text.replace(/\{\{name\}\}/g, partnerName);
    var choices = [
      { key: 'a', text: q.a.replace(/\{\{name\}\}/g, partnerName) },
      { key: 'b', text: q.b.replace(/\{\{name\}\}/g, partnerName) },
      { key: 'c', text: q.c.replace(/\{\{name\}\}/g, partnerName) },
      { key: 'd', text: q.d.replace(/\{\{name\}\}/g, partnerName) }
    ];

    // Sur le meme telephone, la barre dit a qui c'est le tour, a la place du
    // pourcentage. A distance, chaque joueur a sa barre.
    var barre = (state.gameMode === 'online')
      ? progressionDuo(getMyName(), partnerName, state.answers1.length, state.partnerAnswers.length) +
        '<p class="quiz-progress-label ado-question-numero">' + esc(t('questionLabel') + ' ' + (qi + 1) + '/' + totalQ) + '</p>'
      : progression(qi, totalQ, '<span class="ado-tour ado-tour--' + state.currentPlayer + '">' + esc(t('turnOf').replace('{{name}}', currentName)) + '</span>');

    container.innerHTML =
      '<div class="quiz-engine quiz-question-enter">' +
        barre +
        '<h3 class="text-xl font-semibold mb-6 text-center">' + esc(qText) + '</h3>' +
        '<div class="space-y-2">' +
          choices.map(function (c, idx) {
            return '<button type="button" class="quiz-option" data-choice="' + c.key + '" style="animation-delay:' + (idx * 60) + 'ms">' +
              '<span class="quiz-option-letter">' + LETTRES[idx] + '</span><span>' + esc(c.text) + '</span></button>';
          }).join('') +
        '</div>' +
      '</div>';

    var options = container.querySelectorAll('.quiz-option');
    var verrou = false;
    options.forEach(function (btn) {
      btn.addEventListener('click', function () {
        // Un seul choix par question : la reponse se marque, les autres
        // s'eteignent, et l'ecran suivant vient apres un court temps, comme
        // dans les autres tests.
        if (verrou) return;
        verrou = true;
        btn.classList.add('selected');
        options.forEach(function (o) { if (o !== btn) o.style.opacity = '0.5'; o.style.pointerEvents = 'none'; });
        var choix = btn.getAttribute('data-choice');
        setTimeout(function () { handleAnswer(choix); }, 260);
      });
    });
  }

  function renderWaitingForQuestion() {
    var pName = getPartnerName();
    var myProgress = state.answers1.length;
    var partnerProgress = state.partnerAnswers.length;
    container.innerHTML =
      '<div class="quiz-engine quiz-question-enter">' +
        progressionDuo(getMyName(), pName, myProgress, partnerProgress) +
        '<div class="ado-attente ado-attente--texte">' +
          '<span class="spinner"></span>' +
          '<p class="ado-attente-titre">' + esc(t('waitingAnswer').replace('{{name}}', pName)) + '</p>' +
          '<p class="ado-attente-note">' + esc(t('waitingProgress').replace('{{name}}', pName).replace('{{n}}', partnerProgress).replace('{{total}}', totalQ)) + '</p>' +
        '</div>' +
      '</div>';
  }

  function renderWaitingForPartner() {
    var pName = getPartnerName();
    var pAnswers = state.partnerAnswers || [];
    container.innerHTML =
      '<div class="quiz-engine quiz-question-enter">' +
        progressionDuo(getMyName(), pName, totalQ, pAnswers.length) +
        '<div class="ado-attente ado-attente--texte">' +
          '<span class="spinner"></span>' +
          '<p class="ado-attente-titre">' + esc(t('waitingAnswer').replace('{{name}}', pName)) + '</p>' +
          '<p class="ado-attente-note">' + esc(t('waitingProgress').replace('{{name}}', pName).replace('{{n}}', pAnswers.length).replace('{{total}}', totalQ)) + '</p>' +
        '</div>' +
      '</div>';
  }

  // ── Screen: Results ──
  function renderResults() {
    var a1 = state.answers1;
    var a2 = state.answers2;
    // Online mode: use partner answers
    if (state.gameMode === 'online') {
      if (state.playerNum === 1) { a1 = state.answers1; a2 = state.partnerAnswers; }
      else { a1 = state.partnerAnswers; a2 = state.answers1; }
    }

    var matches = 0;
    for (var i = 0; i < totalQ; i++) {
      if (a1[i] === a2[i]) matches++;
    }
    var pct = Math.round(matches / totalQ * 100);

    // Quatre verdicts sont écrits, dans les cinq langues : r1 à r4. Le moteur
    // en réclamait cinq, si bien qu'au-delà de 80 % de réponses identiques le
    // couple le mieux assorti repartait sans titre, sans texte et sans conseil.
    var resultKey = pct >= 75 ? 'r4' : pct >= 50 ? 'r3' : pct >= 25 ? 'r2' : 'r1';
    var palier = resultKey === 'r4' ? 'high' : resultKey === 'r1' ? 'low' : 'mid';
    var n1 = state.name1, n2 = state.name2;

    // Les verdicts s'adressent aux deux joueurs par leur prénom. Le moteur les
    // affichait tels quels : « Les réponses de {{name1}} et {{name2}} dessinent
    // un couple qui… » s'affichait avec les jetons à l'écran, dans les cinq
    // langues. On les remplace ici, comme le tableau de comparaison le fait.
    function prenoms(t) {
      return String(t || '')
        .replace(/\{\{name1\}\}/g, n1)
        .replace(/\{\{name2\}\}/g, n2);
    }

    var resultTitle = prenoms(allQData[resultKey + '_t']);
    var resultDesc = prenoms(allQData[resultKey + '_d']);
    var resultAdvice = prenoms(allQData[resultKey + '_a']);
    var compRows = '';
    for (var j = 0; j < totalQ; j++) {
      var q = questions[j];
      var same = a1[j] === a2[j];
      var c1 = (q[a1[j]] || '-').replace(/\{\{name\}\}/g, n2);
      var c2 = (q[a2[j]] || '-').replace(/\{\{name\}\}/g, n1);
      compRows +=
        '<tr class="' + (same ? 'ado-ligne--pareil' : '') + '">' +
          '<td class="ado-col-num">' + (j + 1) + '</td>' +
          '<td>' + esc(c1) + '</td>' +
          '<td>' + esc(c2) + '</td>' +
          '<td class="ado-col-verdict">' + (same ? '<span class="ado-pareil" aria-label="identique">✓</span>' : '<span class="ado-different" aria-label="différent">✗</span>') + '</td>' +
        '</tr>';
    }

    // La carte porte data-quiz-done : c'est elle que l'admin compte comme une
    // partie finie, et que resultat-url.js signale.
    container.innerHTML =
      '<div class="quiz-engine quiz-result-card text-center qr-plan" data-quiz-done="1">' +
        // La colonne est la meme que celle du moteur commun : sans elle, les
        // deux zones se retrouveraient cote a cote sur grand ecran.
        '<div class="qr-colonne">' +
        '<div class="qr-zone qr-zone--resultat">' +
          '<div class="duo-result-hero duo-result-hero--' + palier + '">' +
            '<div class="duo-result-emoji">' + (palier === 'high' ? '🎉' : palier === 'mid' ? '😊' : '🤔') + '</div>' +
            '<div class="duo-result-ring">' + anneauScore(pct) + '</div>' +
            '<div class="duo-result-match">' + matches + '/' + totalQ + ' ' + esc(t('identical')) + '</div>' +
            (resultTitle ? '<h3 class="duo-result-title">' + esc(resultTitle) + '</h3>' : '') +
            (resultDesc ? '<p class="duo-result-desc">' + esc(resultDesc) + '</p>' : '') +
          '</div>' +
          (resultAdvice ? '<div class="duo-result-advice"><strong>' + esc(t('notreConseil')) + '</strong>' + esc(resultAdvice) + '</div>' : '') +
          '<details class="ado-comparaison">' +
            '<summary>' + esc(t('comparison')) + '</summary>' +
            '<div class="ado-comparaison-corps">' +
              '<table class="ado-tableau"><thead><tr>' +
                '<th class="ado-col-num">#</th>' +
                '<th>' + esc(n1) + '</th>' +
                '<th>' + esc(n2) + '</th>' +
                '<th class="ado-col-verdict"></th>' +
              '</tr></thead><tbody>' + compRows + '</tbody></table>' +
            '</div>' +
          '</details>' +
        '</div>' +
        '<div class="qr-zone qr-zone--actions">' +
          '<div class="result-actions-grid">' +
            '<button id="btn-replay" type="button" class="result-action-btn result-action-btn--primary"><span class="result-action-icon">🔄</span><span class="result-action-label">' + esc(t('playAgain')) + '</span></button>' +
            '<a href="' + (lang === 'fr' ? '/' : '/' + lang + '/') + '" class="result-action-btn"><span class="result-action-icon">🏠</span><span class="result-action-label">' + esc(t('backHome')) + '</span></a>' +
          '</div>' +
        '</div>' +
        '</div>' +
      '</div>';

    document.getElementById('btn-replay').addEventListener('click', function () {
      // La partie repart sur place, sans rechargement : l'adresse annoncerait
      // sinon un resultat devant l'ecran de depart.
      if (window.QCResultat) window.QCResultat.retour();
      resetState(); render();
    });

    // Ce moteur ne passe pas par le moteur commun : on signale nous-memes que
    // le resultat est la, sinon cette page serait la seule dont l'ecran de
    // resultat ne prendrait pas son adresse.
    if (window.QCResultat) {
      window.QCResultat.arrivee(container.firstElementChild, { lang: document.documentElement.lang || 'fr' });
    }

    if (channel) { setTimeout(function () { channel.unsubscribe(); channel = null; }, 3000); }
  }

  // ── Answer handling ──
  function handleAnswer(choice) {
    if (state.gameMode === 'local') {
      if (state.currentPlayer === 1) {
        state.answers1.push(choice);
      } else {
        state.answers2.push(choice);
      }
      state.currentQ++;
      render();
    } else {
      // Online mode: simultaneous play
      state.answers1.push(choice);

      // Broadcast my answer
      if (channel) {
        channel.send({
          type: 'broadcast', event: 'answer',
          payload: { playerNum: state.playerNum, questionIndex: state.answers1.length - 1, answers: state.answers1.slice() }
        });
      }

      // Check if partner has answered this same question
      if (state.partnerAnswers.length >= state.answers1.length) {
        // Partner already answered - both can proceed to next question
        state.currentQ = state.answers1.length;
        state.waitingForPartner = false;

        // Check if both are completely done
        if (state.currentQ >= totalQ && state.partnerAnswers.length >= totalQ) {
          state.screen = 'results';
        }
      } else {
        // Partner hasn't answered yet - show waiting
        state.waitingForPartner = true;
        state.currentQ = state.answers1.length;
      }

      render();
    }
  }

  // ── Online mode: Supabase Realtime ──
  function generateCode() {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var code = '';
    for (var i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  }

  function joinChannel(code, onReady) {
    if (channel) { channel.unsubscribe(); channel = null; }
    channel = sb.channel('ado-' + code, { config: { broadcast: { self: false } } });

    channel.on('broadcast', { event: 'player_joined' }, function (p) {
      if (state.screen === 'waiting') {
        state.name2 = p.payload.name;
        channel.send({
          type: 'broadcast', event: 'game_start',
          payload: { player1_name: state.name1, question_ids: state.questionIds }
        });
        state.screen = 'questions';
        render();
      }
    });

    channel.on('broadcast', { event: 'game_start' }, function (p) {
      if (state._joinTimeout) { clearTimeout(state._joinTimeout); state._joinTimeout = null; }
      state.name2 = state.name1; // my name is name2 in p2's view
      state.name1 = p.payload.player1_name; // p1's name
      // Swap: I'm player2, so name1=p1(partner), name2=me
      var myName = state.name2;
      state.name1 = p.payload.player1_name;
      state.name2 = myName;
      state.questionIds = p.payload.question_ids;
      loadQuestionsFromIds(state.questionIds);
      state.screen = 'questions';
      render();
    });

    channel.on('broadcast', { event: 'answer' }, function (p) {
      if (p.payload.playerNum !== state.playerNum) {
        state.partnerAnswers = p.payload.answers;

        // If I was waiting for partner to answer the current question
        if (state.waitingForPartner && state.partnerAnswers.length >= state.answers1.length) {
          state.waitingForPartner = false;
          state.currentQ = state.answers1.length;
        }

        // Check if both are completely done
        if (state.answers1.length >= totalQ && state.partnerAnswers.length >= totalQ) {
          state.screen = 'results';
        }

        render();
      }
    });

    channel.subscribe(function (status) {
      if (status === 'SUBSCRIBED') { if (onReady) onReady(); }
      else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        state.error = t('errorTimeout');
        state.loading = false;
        state.screen = 'name-input-online';
        render();
      }
    });
  }

  function doOnlineCreate() {
    state.loading = true;
    render();
    var code = generateCode();
    state.sessionCode = code;
    state.playerNum = 1;
    state.questionIds = selectRandomQuestions();
    loadQuestionsFromIds(state.questionIds);
    state.answers1 = [];
    state.partnerAnswers = [];
    state.currentQ = 0;

    joinChannel(code, function () {
      state.loading = false;
      state.screen = 'waiting';
      render();
    });
  }

  function doOnlineJoin(code) {
    state.loading = true;
    render();
    state.sessionCode = code;
    state.playerNum = 2;
    state.answers1 = [];
    state.partnerAnswers = [];
    state.currentQ = 0;

    joinChannel(code, function () {
      channel.send({
        type: 'broadcast', event: 'player_joined',
        payload: { name: state.name1 }
      });
      state.loading = false;

      state._joinTimeout = setTimeout(function () {
        if (!state.questionsReady) {
          state.error = t('errorCodeInvalid');
          state.loading = false;
          state.screen = 'name-input-online';
          if (channel) { channel.unsubscribe(); channel = null; }
          render();
        }
      }, 15000);
    });
  }

  // ── Helpers ──
  function backBtn() {
    return '<button id="btn-back" type="button" class="btn btn-ghost ado-retour">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg> ' +
      esc(t('back')) + '</button>';
  }

  function addBackListener() {
    var btn = document.getElementById('btn-back');
    if (btn) btn.addEventListener('click', function () {
      if (channel) { channel.unsubscribe(); channel = null; }
      state.screen = 'mode-select'; state.error = null; state.loading = false;
      render();
    });
  }
  function addEnterListener() {
    container.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        var go = document.getElementById('btn-go') || document.getElementById('btn-online-go');
        if (go && !go.disabled) go.click();
      }
    });
  }

  function resetState() {
    if (channel) { channel.unsubscribe(); channel = null; }
    if (state._joinTimeout) clearTimeout(state._joinTimeout);
    state = {
      screen: 'mode-select', gameMode: null, onlineRole: null,
      sessionCode: null, playerNum: 0,
      name1: '', name2: '', currentPlayer: 1, currentQ: 0,
      answers1: [], answers2: [], partnerAnswers: [],
      questionIds: [], questionsReady: false,
      error: null, loading: false, waitingForPartner: false
    };
    questions = [];
  }

  // ── Init ──
  function init() {
    container = document.getElementById('quiz-engine');
    if (!container || container.dataset.quiz !== 'ado') return;
    lang = container.dataset.lang || 'fr';

    // Load quiz data first (always needed)
    loadQuizData().then(function () {
      // Try loading Supabase for online mode (non-blocking)
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
      script.onload = function () {
        try { sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY); } catch (e) { sb = null; }
      };
      document.head.appendChild(script);

      // Render immediately, don't wait for Supabase
      render();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
