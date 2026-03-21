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
      joinDesc2: 'Entre le code reçu de ton/ta partenaire'
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
      joinDesc2: 'Enter the code from your partner'
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
      joinDesc2: 'Introduce el código recibido'
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
      joinDesc2: 'Code eingeben'
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
      joinDesc2: 'Inserisci il codice ricevuto'
    }
  };

  function t(key) { return (UI[lang] || UI.fr)[key] || UI.fr[key] || key; }
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

  function loadQuizData() {
    return fetch('/js/data/gd-' + lang + '.json')
      .then(function (r) { return r.json(); })
      .then(function (d) { allQData = d.ado || {}; });
  }

  function selectRandomQuestions() {
    var ids = [];
    for (var i = 1; i <= 80; i++) ids.push(i);
    for (var j = ids.length - 1; j > 0; j--) {
      var k = Math.floor(Math.random() * (j + 1));
      var tmp = ids[j]; ids[j] = ids[k]; ids[k] = tmp;
    }
    return ids.slice(0, totalQ);
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
      '<div class="text-center space-y-8 py-8">' +
        '<div class="space-y-2">' +
          '<h2 class="text-2xl font-bold">' + t('modeTitle') + '</h2>' +
          '<p class="text-muted-foreground">' + t('modeSubtitle') + '</p>' +
        '</div>' +
        '<div class="grid gap-3 max-w-sm mx-auto px-4">' +
          '<button id="btn-local" class="btn btn-primary py-4 text-base flex flex-col items-center gap-1 w-full">' +
            '<span class="flex items-center gap-2">' +
              '<svg class="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>' +
              '<span>' + t('localBtn') + '</span>' +
            '</span>' +
            '<span class="text-xs opacity-70 font-normal leading-tight">' + t('localDesc') + '</span>' +
          '</button>' +
          '<button id="btn-online" class="btn btn-outline py-4 text-base flex flex-col items-center gap-1 w-full">' +
            '<span class="flex items-center gap-2">' +
              '<svg class="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>' +
              '<span>' + t('onlineBtn') + '</span>' +
            '</span>' +
            '<span class="text-xs opacity-70 font-normal leading-tight">' + t('onlineDesc') + '</span>' +
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
      '<div class="max-w-md mx-auto py-8 space-y-6">' +
        backBtn() +
        '<div class="space-y-4">' +
          '<div>' +
            '<label class="block text-sm font-medium mb-1.5" for="name1">' + t('player1Name') + '</label>' +
            '<input id="name1" type="text" class="w-full rounded-lg border border-border bg-card px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="' + t('namePlaceholder') + '" maxlength="30" autocomplete="off" />' +
          '</div>' +
          '<div>' +
            '<label class="block text-sm font-medium mb-1.5" for="name2">' + t('player2Name') + '</label>' +
            '<input id="name2" type="text" class="w-full rounded-lg border border-border bg-card px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="' + t('namePlaceholder') + '" maxlength="30" autocomplete="off" />' +
          '</div>' +
          (state.error ? '<p class="text-sm text-destructive">' + esc(state.error) + '</p>' : '') +
          '<button id="btn-go" class="btn btn-primary w-full py-3 text-base">' + t('startLocal') + '</button>' +
        '</div>' +
      '</div>';

    addBackListener();
    var n1 = document.getElementById('name1');
    var n2 = document.getElementById('name2');
    if (state.name1) n1.value = state.name1;
    if (state.name2) n2.value = state.name2;
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
    container.innerHTML =
      '<div class="max-w-md mx-auto py-8 space-y-6">' +
        backBtn() +
        '<div class="grid gap-3 mb-4">' +
          '<button id="btn-create" class="btn ' + (state.onlineRole === 'create' ? 'btn-primary' : 'btn-outline') + ' py-3 text-sm flex flex-col items-center gap-0.5 w-full">' +
            '<span>' + t('createGame') + '</span>' +
            '<span class="text-xs opacity-70 font-normal leading-tight">' + t('createDesc2') + '</span>' +
          '</button>' +
          '<button id="btn-join" class="btn ' + (state.onlineRole === 'join' ? 'btn-primary' : 'btn-outline') + ' py-3 text-sm flex flex-col items-center gap-0.5 w-full">' +
            '<span>' + t('joinGame') + '</span>' +
            '<span class="text-xs opacity-70 font-normal leading-tight">' + t('joinDesc2') + '</span>' +
          '</button>' +
        '</div>' +
        (state.onlineRole ?
        '<div class="space-y-4">' +
          '<div>' +
            '<label class="block text-sm font-medium mb-1.5" for="online-name">' + t('player1Name') + '</label>' +
            '<input id="online-name" type="text" class="w-full rounded-lg border border-border bg-card px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="' + t('namePlaceholder') + '" maxlength="30" autocomplete="off" />' +
          '</div>' +
          (state.onlineRole === 'join' ?
          '<div>' +
            '<label class="block text-sm font-medium mb-1.5" for="online-code">' + t('sessionCode') + '</label>' +
            '<input id="online-code" type="text" class="w-full rounded-lg border border-border bg-card px-4 py-3 text-base text-center font-mono tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="' + t('codePlaceholder') + '" maxlength="6" autocomplete="off" />' +
          '</div>' : '') +
          (state.error ? '<p class="text-sm text-destructive">' + esc(state.error) + '</p>' : '') +
          '<button id="btn-online-go" class="btn btn-primary w-full py-3 text-base" ' + (state.loading ? 'disabled' : '') + '>' +
            (state.loading ? '<span class="spinner-sm mr-2"></span>' + t('connecting') : (state.onlineRole === 'join' ? t('joinGame') : t('createGame'))) +
          '</button>' +
        '</div>' : '') +
      '</div>';

    addBackListener();

    document.getElementById('btn-create').addEventListener('click', function () {
      state.onlineRole = 'create'; state.error = null; render();
    });
    document.getElementById('btn-join').addEventListener('click', function () {
      state.onlineRole = 'join'; state.error = null; render();
    });

    var nameInput = document.getElementById('online-name');
    if (nameInput) {
      if (state.name1) nameInput.value = state.name1;
      if (!state.loading) nameInput.focus();
    }

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
      '<div class="max-w-md mx-auto py-12 text-center space-y-8">' +
        '<div class="space-y-2">' +
          '<div class="spinner mx-auto mb-4"></div>' +
          '<h2 class="text-xl font-bold">' + t('waitingTitle') + '</h2>' +
          '<p class="text-muted-foreground text-sm">' + t('waitingDesc') + '</p>' +
        '</div>' +
        '<div class="bg-card border-2 border-dashed border-primary/40 rounded-xl p-6">' +
          '<p class="text-4xl font-mono font-bold tracking-[0.4em] text-primary select-all">' + state.sessionCode + '</p>' +
        '</div>' +
        '<button id="btn-copy" class="btn btn-outline text-sm">' + t('copyCode') + '</button>' +
        '<button id="btn-cancel" class="block mx-auto text-sm text-muted-foreground hover:text-foreground transition-colors">' + t('back') + '</button>' +
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
      '<div class="max-w-md mx-auto py-12 text-center space-y-6">' +
        '<div class="text-6xl mb-4">🔄</div>' +
        '<h2 class="text-2xl font-bold">' + t('passPhone').replace('{{name}}', esc(nextName)) + '</h2>' +
        '<p class="text-muted-foreground">' + t('passPhoneDesc').replace('{{name}}', esc(doneName)).replace('{{name2}}', esc(nextName)) + '</p>' +
        '<p class="text-sm text-muted-foreground italic">' + t('dontLook').replace('{{name}}', esc(doneName)) + '</p>' +
        '<button id="btn-continue" class="btn btn-primary py-3 px-8 text-lg mt-4">' + t('tapToContinue') + '</button>' +
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
      container.innerHTML = '<div class="text-center py-12"><div class="spinner mx-auto mb-4"></div></div>';
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

    // Build dual progress bars for online mode
    var progressHtml = '';
    if (state.gameMode === 'online') {
      var myNameProg = getMyName();
      var myProgress = state.answers1.length;
      var partnerProgress = state.partnerAnswers.length;
      progressHtml =
        '<div class="space-y-2 mb-2">' +
          '<div class="flex items-center gap-2 text-xs">' +
            '<span class="font-medium text-primary w-20 truncate">' + esc(myNameProg) + '</span>' +
            '<div class="flex-1 bg-muted rounded-full h-2"><div class="bg-primary h-2 rounded-full transition-all duration-300" style="width:' + (myProgress / totalQ * 100) + '%"></div></div>' +
            '<span class="text-muted-foreground w-10 text-right">' + myProgress + '/' + totalQ + '</span>' +
          '</div>' +
          '<div class="flex items-center gap-2 text-xs">' +
            '<span class="font-medium text-secondary w-20 truncate">' + esc(partnerName) + '</span>' +
            '<div class="flex-1 bg-muted rounded-full h-2"><div class="bg-secondary h-2 rounded-full transition-all duration-300" style="width:' + (partnerProgress / totalQ * 100) + '%"></div></div>' +
            '<span class="text-muted-foreground w-10 text-right">' + partnerProgress + '/' + totalQ + '</span>' +
          '</div>' +
        '</div>';
    }

    container.innerHTML =
      '<div class="max-w-lg mx-auto py-6 space-y-6">' +
        '<div class="flex items-center justify-between text-sm text-muted-foreground">' +
          '<span>' + (qi + 1) + ' ' + t('questionOf') + ' ' + totalQ + '</span>' +
          (state.gameMode === 'local' ?
            '<span class="font-medium text-primary">' + t('turnOf').replace('{{name}}', esc(currentName)) + '</span>' :
            '') +
        '</div>' +
        (state.gameMode === 'online' ? progressHtml :
        '<div class="w-full bg-muted rounded-full h-2">' +
          '<div class="bg-primary h-2 rounded-full transition-all duration-300" style="width:' + ((qi + 1) / totalQ * 100) + '%"></div>' +
        '</div>') +
        '<h3 class="text-lg font-semibold leading-snug">' + esc(qText) + '</h3>' +
        '<div class="grid gap-3">' +
          choices.map(function (c) {
            return '<button class="choice-btn btn btn-outline text-left py-3 px-4 w-full" data-choice="' + c.key + '">' + esc(c.text) + '</button>';
          }).join('') +
        '</div>' +
      '</div>';

    container.querySelectorAll('.choice-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        handleAnswer(btn.dataset.choice);
      });
    });
  }

  // Online mode: waiting for partner to answer the same question
  function renderWaitingForQuestion() {
    var pName = getPartnerName();
    var myName = getMyName();
    var qi = state.currentQ;
    var myProgress = state.answers1.length;
    var partnerProgress = state.partnerAnswers.length;

    container.innerHTML =
      '<div class="max-w-md mx-auto py-8 space-y-6">' +
        // Dual progress bars
        '<div class="space-y-2">' +
          '<div class="flex items-center gap-2 text-xs">' +
            '<span class="font-medium text-primary w-20 truncate">' + esc(myName) + '</span>' +
            '<div class="flex-1 bg-muted rounded-full h-2"><div class="bg-primary h-2 rounded-full transition-all duration-300" style="width:' + (myProgress / totalQ * 100) + '%"></div></div>' +
            '<span class="text-muted-foreground w-10 text-right">' + myProgress + '/' + totalQ + '</span>' +
          '</div>' +
          '<div class="flex items-center gap-2 text-xs">' +
            '<span class="font-medium text-secondary w-20 truncate">' + esc(pName) + '</span>' +
            '<div class="flex-1 bg-muted rounded-full h-2"><div class="bg-secondary h-2 rounded-full transition-all duration-300" style="width:' + (partnerProgress / totalQ * 100) + '%"></div></div>' +
            '<span class="text-muted-foreground w-10 text-right">' + partnerProgress + '/' + totalQ + '</span>' +
          '</div>' +
        '</div>' +
        // Waiting message
        '<div class="text-center space-y-4 py-6">' +
          '<div class="spinner mx-auto"></div>' +
          '<p class="font-medium text-foreground">' + t('waitingAnswer').replace('{{name}}', esc(pName)) + '</p>' +
          '<p class="text-sm text-muted-foreground">' + t('waitingProgress').replace('{{name}}', esc(pName)).replace('{{n}}', partnerProgress).replace('{{total}}', totalQ) + '</p>' +
        '</div>' +
      '</div>';
  }

  // Online mode: I finished all questions, waiting for partner to finish too
  function renderWaitingForPartner() {
    var pName = getPartnerName();
    var myName = getMyName();
    var pAnswers = state.partnerAnswers || [];
    container.innerHTML =
      '<div class="max-w-md mx-auto py-8 space-y-6">' +
        // Dual progress bars
        '<div class="space-y-2">' +
          '<div class="flex items-center gap-2 text-xs">' +
            '<span class="font-medium text-primary w-20 truncate">' + esc(myName) + '</span>' +
            '<div class="flex-1 bg-muted rounded-full h-2"><div class="bg-primary h-2 rounded-full transition-all duration-300" style="width:100%"></div></div>' +
            '<span class="text-muted-foreground w-10 text-right">' + totalQ + '/' + totalQ + '</span>' +
          '</div>' +
          '<div class="flex items-center gap-2 text-xs">' +
            '<span class="font-medium text-secondary w-20 truncate">' + esc(pName) + '</span>' +
            '<div class="flex-1 bg-muted rounded-full h-2"><div class="bg-secondary h-2 rounded-full transition-all duration-300" style="width:' + (pAnswers.length / totalQ * 100) + '%"></div></div>' +
            '<span class="text-muted-foreground w-10 text-right">' + pAnswers.length + '/' + totalQ + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="text-center space-y-4 py-6">' +
          '<div class="spinner mx-auto"></div>' +
          '<p class="font-medium text-foreground">' + t('waitingAnswer').replace('{{name}}', esc(pName)) + '</p>' +
          '<p class="text-sm text-muted-foreground">' + t('waitingProgress').replace('{{name}}', esc(pName)).replace('{{n}}', pAnswers.length).replace('{{total}}', totalQ) + '</p>' +
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

    var resultKey = pct >= 80 ? 'r5' : pct >= 60 ? 'r4' : pct >= 40 ? 'r3' : pct >= 20 ? 'r2' : 'r1';
    var resultTitle = allQData[resultKey + '_t'] || '';
    var resultDesc = allQData[resultKey + '_d'] || '';
    var resultAdvice = allQData[resultKey + '_a'] || '';

    var n1 = state.name1, n2 = state.name2;
    var compRows = '';
    for (var j = 0; j < totalQ; j++) {
      var q = questions[j];
      var same = a1[j] === a2[j];
      var c1 = (q[a1[j]] || '–').replace(/\{\{name\}\}/g, n2);
      var c2 = (q[a2[j]] || '–').replace(/\{\{name\}\}/g, n1);
      if (c1.length > 35) c1 = c1.substring(0, 32) + '…';
      if (c2.length > 35) c2 = c2.substring(0, 32) + '…';
      compRows +=
        '<tr class="border-b border-border/50 ' + (same ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : '') + '">' +
          '<td class="py-2 px-2 text-xs text-muted-foreground">' + (j+1) + '</td>' +
          '<td class="py-2 px-2 text-sm">' + esc(c1) + '</td>' +
          '<td class="py-2 px-2 text-sm">' + esc(c2) + '</td>' +
          '<td class="py-2 px-2 text-center">' + (same ? '<span class="text-emerald-600 font-bold">✓</span>' : '<span class="text-muted-foreground">✗</span>') + '</td>' +
        '</tr>';
    }

    var borderColor = pct >= 60 ? 'border-emerald-500' : pct >= 30 ? 'border-amber-500' : 'border-red-400';

    container.innerHTML =
      '<div class="max-w-lg mx-auto py-8 space-y-8">' +
        '<div class="text-center space-y-4">' +
          '<div class="inline-flex items-center justify-center w-32 h-32 rounded-full border-4 ' + borderColor + '">' +
            '<div><p class="text-3xl font-bold">' + pct + '%</p><p class="text-xs text-muted-foreground">' + matches + '/' + totalQ + ' ' + t('identical') + '</p></div>' +
          '</div>' +
          '<p class="text-lg font-semibold text-gradient">' + t('matchPercent').replace('{{pct}}', pct) + '</p>' +
          (resultTitle ? '<h2 class="text-2xl font-bold">' + esc(resultTitle) + '</h2>' : '') +
          (resultDesc ? '<p class="text-muted-foreground">' + esc(resultDesc) + '</p>' : '') +
          (resultAdvice ? '<div class="bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm text-muted-foreground">' + esc(resultAdvice) + '</div>' : '') +
        '</div>' +
        '<details class="border border-border rounded-lg">' +
          '<summary class="p-4 font-medium cursor-pointer hover:bg-muted/50 transition-colors">' + t('comparison') + '</summary>' +
          '<div class="overflow-x-auto">' +
            '<table class="w-full text-sm"><thead><tr class="border-b border-border bg-muted/30">' +
              '<th class="py-2 px-2 text-left text-xs">#</th>' +
              '<th class="py-2 px-2 text-left text-xs">' + esc(n1) + '</th>' +
              '<th class="py-2 px-2 text-left text-xs">' + esc(n2) + '</th>' +
              '<th class="py-2 px-2"></th>' +
            '</tr></thead><tbody>' + compRows + '</tbody></table>' +
          '</div>' +
        '</details>' +
        '<div class="flex gap-3 justify-center">' +
          '<button id="btn-replay" class="btn btn-primary">' + t('playAgain') + '</button>' +
          '<a href="/" class="btn btn-outline">' + t('backHome') + '</a>' +
        '</div>' +
      '</div>';

    document.getElementById('btn-replay').addEventListener('click', function () {
      resetState(); render();
    });

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
    return '<button id="btn-back" class="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">' +
      '<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>' +
      t('back') + '</button>';
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
