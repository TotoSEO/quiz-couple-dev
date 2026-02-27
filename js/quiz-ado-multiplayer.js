/**
 * Quiz Ado - Multiplayer Real-Time Engine
 * 5 screens: Mode Select → Name Input → Waiting Room → Questions → Results
 * Uses Supabase Realtime for synchronization
 */
(function () {
  'use strict';

  var SUPABASE_URL = 'https://nbjpgecedevlmypqisng.supabase.co';
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ianBnZWNlZGV2bG15cHFpc25nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNDk3MjgsImV4cCI6MjA4NDgyNTcyOH0.agwrq1lrAKP8Vc-Y349H3RxEZhEgsDj21cG1luw9AXs';
  var EDGE_FN_URL = SUPABASE_URL + '/functions/v1/manage-ado-session';

  var container, lang, sb, channel;
  var questions = []; // Array of { id, text, a, b, c, d }
  var totalQ = 20;
  var state = {
    screen: 'mode-select',
    mode: null,
    sessionId: null,
    sessionCode: null,
    playerNum: 0,
    myName: '',
    partnerName: '',
    currentQ: 0,
    myAnswers: [],
    partnerAnswers: [],
    partnerCurrentQ: 0,
    questionsReady: false,
    error: null
  };

  // ── UI Translations (embedded, keyed by lang) ──
  var UI = {
    fr: {
      modeTitle: 'Quiz Couple Ado',
      modeSubtitle: 'Jouez chacun sur votre téléphone et découvrez votre compatibilité !',
      createBtn: 'Créer une partie',
      createDesc: 'Crée un code et envoie-le à ton/ta partenaire',
      joinBtn: 'Rejoindre une partie',
      joinDesc: 'Entre le code que ton/ta partenaire t\'a envoyé',
      yourName: 'Ton prénom',
      namePlaceholder: 'Entre ton prénom',
      sessionCode: 'Code de la partie',
      codePlaceholder: 'Ex: ABC123',
      start: 'C\'est parti !',
      join: 'Rejoindre',
      waitingTitle: 'En attente de ton/ta partenaire…',
      waitingDesc: 'Envoie ce code à ton/ta partenaire pour qu\'il/elle te rejoigne :',
      copyCode: 'Copier le code',
      copied: 'Copié !',
      questionOf: 'sur',
      waitingAnswer: 'En attente de la réponse de {{name}}…',
      resultsTitle: 'Résultats',
      yourScore: 'Votre score',
      matchPercent: '{{pct}}% de compatibilité',
      identical: 'réponses identiques',
      playAgain: 'Rejouer',
      backHome: 'Retour à l\'accueil',
      errorGeneric: 'Une erreur est survenue. Réessaie.',
      errorCodeInvalid: 'Code invalide ou partie introuvable.',
      errorSessionFull: 'Cette partie est déjà complète.',
      you: 'Toi',
      partner: 'Partenaire',
      comparison: 'Comparaison des réponses',
      agree: 'D\'accord',
      disagree: 'Différent'
    },
    en: {
      modeTitle: 'Teen Couple Quiz',
      modeSubtitle: 'Play on your own phones and discover your compatibility!',
      createBtn: 'Create a game',
      createDesc: 'Create a code and send it to your partner',
      joinBtn: 'Join a game',
      joinDesc: 'Enter the code your partner sent you',
      yourName: 'Your name',
      namePlaceholder: 'Enter your name',
      sessionCode: 'Game code',
      codePlaceholder: 'E.g. ABC123',
      start: 'Let\'s go!',
      join: 'Join',
      waitingTitle: 'Waiting for your partner…',
      waitingDesc: 'Send this code to your partner so they can join:',
      copyCode: 'Copy code',
      copied: 'Copied!',
      questionOf: 'of',
      waitingAnswer: 'Waiting for {{name}}\'s answer…',
      resultsTitle: 'Results',
      yourScore: 'Your score',
      matchPercent: '{{pct}}% compatibility',
      identical: 'identical answers',
      playAgain: 'Play again',
      backHome: 'Back to home',
      errorGeneric: 'An error occurred. Try again.',
      errorCodeInvalid: 'Invalid code or game not found.',
      errorSessionFull: 'This game is already full.',
      you: 'You',
      partner: 'Partner',
      comparison: 'Answer comparison',
      agree: 'Same',
      disagree: 'Different'
    },
    es: {
      modeTitle: 'Quiz Pareja Adolescentes',
      modeSubtitle: '¡Juega cada uno en su teléfono y descubre su compatibilidad!',
      createBtn: 'Crear una partida',
      createDesc: 'Crea un código y envíaselo a tu pareja',
      joinBtn: 'Unirse a una partida',
      joinDesc: 'Introduce el código que te envió tu pareja',
      yourName: 'Tu nombre',
      namePlaceholder: 'Introduce tu nombre',
      sessionCode: 'Código de la partida',
      codePlaceholder: 'Ej: ABC123',
      start: '¡Vamos!',
      join: 'Unirse',
      waitingTitle: 'Esperando a tu pareja…',
      waitingDesc: 'Envía este código a tu pareja para que se una:',
      copyCode: 'Copiar código',
      copied: '¡Copiado!',
      questionOf: 'de',
      waitingAnswer: 'Esperando la respuesta de {{name}}…',
      resultsTitle: 'Resultados',
      yourScore: 'Tu puntuación',
      matchPercent: '{{pct}}% de compatibilidad',
      identical: 'respuestas idénticas',
      playAgain: 'Jugar de nuevo',
      backHome: 'Volver al inicio',
      errorGeneric: 'Ocurrió un error. Inténtalo de nuevo.',
      errorCodeInvalid: 'Código inválido o partida no encontrada.',
      errorSessionFull: 'Esta partida ya está completa.',
      you: 'Tú',
      partner: 'Pareja',
      comparison: 'Comparación de respuestas',
      agree: 'Igual',
      disagree: 'Diferente'
    },
    de: {
      modeTitle: 'Teenager Paar-Quiz',
      modeSubtitle: 'Spielt jeder auf eurem Handy und entdeckt eure Kompatibilität!',
      createBtn: 'Spiel erstellen',
      createDesc: 'Erstelle einen Code und sende ihn an deinen Partner',
      joinBtn: 'Spiel beitreten',
      joinDesc: 'Gib den Code ein, den dir dein Partner geschickt hat',
      yourName: 'Dein Name',
      namePlaceholder: 'Gib deinen Namen ein',
      sessionCode: 'Spielcode',
      codePlaceholder: 'Z.B. ABC123',
      start: 'Los geht\'s!',
      join: 'Beitreten',
      waitingTitle: 'Warte auf deinen Partner…',
      waitingDesc: 'Sende diesen Code an deinen Partner:',
      copyCode: 'Code kopieren',
      copied: 'Kopiert!',
      questionOf: 'von',
      waitingAnswer: 'Warte auf {{name}}s Antwort…',
      resultsTitle: 'Ergebnisse',
      yourScore: 'Euer Ergebnis',
      matchPercent: '{{pct}}% Kompatibilität',
      identical: 'identische Antworten',
      playAgain: 'Nochmal spielen',
      backHome: 'Zurück zur Startseite',
      errorGeneric: 'Ein Fehler ist aufgetreten. Versuche es erneut.',
      errorCodeInvalid: 'Ungültiger Code oder Spiel nicht gefunden.',
      errorSessionFull: 'Dieses Spiel ist bereits voll.',
      you: 'Du',
      partner: 'Partner',
      comparison: 'Antwortvergleich',
      agree: 'Gleich',
      disagree: 'Unterschiedlich'
    },
    it: {
      modeTitle: 'Quiz Coppia Adolescenti',
      modeSubtitle: 'Giocate ognuno sul proprio telefono e scoprite la vostra compatibilità!',
      createBtn: 'Crea una partita',
      createDesc: 'Crea un codice e invialo al tuo partner',
      joinBtn: 'Unisciti a una partita',
      joinDesc: 'Inserisci il codice che ti ha inviato il tuo partner',
      yourName: 'Il tuo nome',
      namePlaceholder: 'Inserisci il tuo nome',
      sessionCode: 'Codice partita',
      codePlaceholder: 'Es: ABC123',
      start: 'Andiamo!',
      join: 'Unisciti',
      waitingTitle: 'In attesa del tuo partner…',
      waitingDesc: 'Invia questo codice al tuo partner per unirsi:',
      copyCode: 'Copia codice',
      copied: 'Copiato!',
      questionOf: 'di',
      waitingAnswer: 'In attesa della risposta di {{name}}…',
      resultsTitle: 'Risultati',
      yourScore: 'Il vostro punteggio',
      matchPercent: '{{pct}}% di compatibilità',
      identical: 'risposte identiche',
      playAgain: 'Gioca di nuovo',
      backHome: 'Torna alla home',
      errorGeneric: 'Si è verificato un errore. Riprova.',
      errorCodeInvalid: 'Codice non valido o partita non trovata.',
      errorSessionFull: 'Questa partita è già completa.',
      you: 'Tu',
      partner: 'Partner',
      comparison: 'Confronto risposte',
      agree: 'Uguale',
      disagree: 'Diverso'
    }
  };

  function t(key) {
    return (UI[lang] || UI.fr)[key] || UI.fr[key] || key;
  }

  // ── Supabase helpers ──
  function callEdgeFn(action, payload) {
    return fetch(EDGE_FN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'apikey': SUPABASE_KEY
      },
      body: JSON.stringify(Object.assign({ action: action }, payload))
    }).then(function (r) { return r.json(); });
  }

  function subscribeToSession(sessionId) {
    if (channel) channel.unsubscribe();
    channel = sb.channel('session-' + sessionId)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'quiz_ado_sessions',
        filter: 'id=eq.' + sessionId
      }, function (payload) {
        handleRealtimeUpdate(payload.new);
      })
      .subscribe();
  }

  function handleRealtimeUpdate(row) {
    // Player 2 joined
    if (state.screen === 'waiting' && row.player2_name) {
      state.partnerName = row.player2_name;
      // Both players now have the question set from the session
      if (row.question_ids) {
        loadQuestionsFromIds(row.question_ids);
      }
      state.screen = 'questions';
      render();
      return;
    }

    // Partner answered
    if (state.screen === 'questions') {
      var partnerKey = state.playerNum === 1 ? 'player2_answers' : 'player1_answers';
      var partnerAnswers = row[partnerKey] || [];
      state.partnerAnswers = partnerAnswers;
      state.partnerCurrentQ = partnerAnswers.length;

      // Check if both done
      if (state.myAnswers.length >= totalQ && partnerAnswers.length >= totalQ) {
        state.screen = 'results';
        render();
        // Cleanup after 10 seconds
        setTimeout(function () { callEdgeFn('cleanup', { session_id: state.sessionId }); }, 10000);
      } else if (state.myAnswers.length > 0 && state.myAnswers.length === state.partnerCurrentQ) {
        // Both answered current question, re-render to clear waiting state
        render();
      } else {
        render();
      }
    }
  }

  // ── Data loading ──
  var allQData = null;

  function loadQuizData() {
    return fetch('/js/data/gd-' + lang + '.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        allQData = data.ado || {};
      });
  }

  function selectRandomQuestions() {
    // Pick 20 random question IDs from pool of 80
    var ids = [];
    for (var i = 1; i <= 80; i++) ids.push(i);
    // Shuffle
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
      var text = allQData['q' + id] || '';
      questions.push({
        id: id,
        text: text,
        a: allQData['q' + id + 'a'] || '',
        b: allQData['q' + id + 'b'] || '',
        c: allQData['q' + id + 'c'] || '',
        d: allQData['q' + id + 'd'] || ''
      });
    }
    state.questionsReady = true;
  }

  // ── Rendering ──
  function render() {
    switch (state.screen) {
      case 'mode-select': renderModeSelect(); break;
      case 'name-input': renderNameInput(); break;
      case 'waiting': renderWaiting(); break;
      case 'questions': renderQuestions(); break;
      case 'results': renderResults(); break;
    }
  }

  function renderModeSelect() {
    container.innerHTML =
      '<div class="text-center space-y-8 py-8">' +
        '<div class="space-y-2">' +
          '<h2 class="text-2xl font-bold">' + t('modeTitle') + '</h2>' +
          '<p class="text-muted-foreground">' + t('modeSubtitle') + '</p>' +
        '</div>' +
        '<div class="grid gap-4 max-w-md mx-auto">' +
          '<button id="btn-create" class="btn btn-primary py-6 text-lg flex flex-col items-center gap-1">' +
            '<span class="flex items-center gap-2">' +
              '<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>' +
              t('createBtn') +
            '</span>' +
            '<span class="text-xs opacity-70 font-normal">' + t('createDesc') + '</span>' +
          '</button>' +
          '<button id="btn-join" class="btn btn-outline py-6 text-lg flex flex-col items-center gap-1">' +
            '<span class="flex items-center gap-2">' +
              '<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>' +
              t('joinBtn') +
            '</span>' +
            '<span class="text-xs opacity-70 font-normal">' + t('joinDesc') + '</span>' +
          '</button>' +
        '</div>' +
      '</div>';

    document.getElementById('btn-create').addEventListener('click', function () {
      state.mode = 'create';
      state.screen = 'name-input';
      render();
    });
    document.getElementById('btn-join').addEventListener('click', function () {
      state.mode = 'join';
      state.screen = 'name-input';
      render();
    });
  }

  function renderNameInput() {
    var isJoin = state.mode === 'join';
    container.innerHTML =
      '<div class="max-w-md mx-auto py-8 space-y-6">' +
        '<button id="btn-back" class="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">' +
          '<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>' +
          'Retour' +
        '</button>' +
        '<div class="space-y-4">' +
          '<div>' +
            '<label class="block text-sm font-medium mb-1.5">' + t('yourName') + '</label>' +
            '<input id="input-name" type="text" class="w-full rounded-lg border border-border bg-card px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="' + t('namePlaceholder') + '" maxlength="30" autocomplete="given-name" />' +
          '</div>' +
          (isJoin ?
          '<div>' +
            '<label class="block text-sm font-medium mb-1.5">' + t('sessionCode') + '</label>' +
            '<input id="input-code" type="text" class="w-full rounded-lg border border-border bg-card px-4 py-3 text-base text-center tracking-[0.3em] uppercase focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="' + t('codePlaceholder') + '" maxlength="6" />' +
          '</div>' : '') +
          (state.error ? '<p class="text-sm text-destructive">' + state.error + '</p>' : '') +
          '<button id="btn-submit" class="btn btn-primary w-full py-3 text-base">' +
            (isJoin ? t('join') : t('start')) +
          '</button>' +
        '</div>' +
      '</div>';

    document.getElementById('btn-back').addEventListener('click', function () {
      state.screen = 'mode-select';
      state.error = null;
      render();
    });

    var nameInput = document.getElementById('input-name');
    nameInput.focus();

    document.getElementById('btn-submit').addEventListener('click', function () {
      var name = nameInput.value.trim();
      if (!name) { nameInput.focus(); return; }
      state.myName = name;

      if (isJoin) {
        var code = document.getElementById('input-code').value.trim().toUpperCase();
        if (!code) { document.getElementById('input-code').focus(); return; }
        joinSession(code);
      } else {
        createSession();
      }
    });

    // Enter key submits
    container.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') document.getElementById('btn-submit').click();
    });
  }

  function renderWaiting() {
    container.innerHTML =
      '<div class="max-w-md mx-auto py-12 text-center space-y-8">' +
        '<div class="space-y-2">' +
          '<div class="spinner mx-auto mb-4"></div>' +
          '<h2 class="text-xl font-bold">' + t('waitingTitle') + '</h2>' +
          '<p class="text-muted-foreground text-sm">' + t('waitingDesc') + '</p>' +
        '</div>' +
        '<div class="bg-card border-2 border-dashed border-primary/40 rounded-xl p-6">' +
          '<p class="text-4xl font-mono font-bold tracking-[0.4em] text-primary">' + state.sessionCode + '</p>' +
        '</div>' +
        '<button id="btn-copy" class="btn btn-outline text-sm">' +
          '<svg class="h-4 w-4 mr-2 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>' +
          t('copyCode') +
        '</button>' +
      '</div>';

    document.getElementById('btn-copy').addEventListener('click', function () {
      var btn = this;
      navigator.clipboard.writeText(state.sessionCode).then(function () {
        btn.textContent = t('copied');
        setTimeout(function () { btn.innerHTML = '<svg class="h-4 w-4 mr-2 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>' + t('copyCode'); }, 2000);
      });
    });
  }

  function renderQuestions() {
    if (!state.questionsReady || questions.length === 0) {
      container.innerHTML = '<div class="text-center py-12"><div class="spinner mx-auto mb-4"></div></div>';
      return;
    }

    var qi = state.currentQ;
    if (qi >= totalQ) {
      // I'm done, waiting for partner
      renderWaitingForPartner();
      return;
    }

    var q = questions[qi];
    var qText = q.text.replace(/\{\{name\}\}/g, state.partnerName);
    var choices = [
      { key: 'a', text: q.a.replace(/\{\{name\}\}/g, state.partnerName) },
      { key: 'b', text: q.b.replace(/\{\{name\}\}/g, state.partnerName) },
      { key: 'c', text: q.c.replace(/\{\{name\}\}/g, state.partnerName) },
      { key: 'd', text: q.d.replace(/\{\{name\}\}/g, state.partnerName) }
    ];

    container.innerHTML =
      '<div class="max-w-lg mx-auto py-6 space-y-6">' +
        '<div class="flex items-center justify-between text-sm text-muted-foreground">' +
          '<span>' + (qi + 1) + ' ' + t('questionOf') + ' ' + totalQ + '</span>' +
          '<span class="font-medium">' + state.myName + '</span>' +
        '</div>' +
        '<div class="w-full bg-muted rounded-full h-2">' +
          '<div class="bg-primary h-2 rounded-full transition-all duration-300" style="width:' + ((qi + 1) / totalQ * 100) + '%"></div>' +
        '</div>' +
        '<h3 class="text-lg font-semibold leading-snug">' + qText + '</h3>' +
        '<div class="grid gap-3">' +
          choices.map(function (c) {
            return '<button class="choice-btn btn btn-outline text-left py-3 px-4 w-full" data-choice="' + c.key + '">' + c.text + '</button>';
          }).join('') +
        '</div>' +
      '</div>';

    var choiceBtns = container.querySelectorAll('.choice-btn');
    choiceBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        handleAnswer(btn.dataset.choice);
      });
    });
  }

  function renderWaitingForPartner() {
    var waitText = t('waitingAnswer').replace('{{name}}', state.partnerName);
    container.innerHTML =
      '<div class="max-w-md mx-auto py-12 text-center space-y-6">' +
        '<div class="spinner mx-auto"></div>' +
        '<p class="text-muted-foreground">' + waitText + '</p>' +
        '<p class="text-sm text-muted-foreground">' + state.partnerCurrentQ + ' / ' + totalQ + '</p>' +
      '</div>';
  }

  function renderResults() {
    var matches = 0;
    for (var i = 0; i < totalQ; i++) {
      if (state.myAnswers[i] === state.partnerAnswers[i]) matches++;
    }
    var pct = Math.round(matches / totalQ * 100);

    // Determine result tier
    var resultKey = 'r1';
    if (pct >= 80) resultKey = 'r5';
    else if (pct >= 60) resultKey = 'r4';
    else if (pct >= 40) resultKey = 'r3';
    else if (pct >= 20) resultKey = 'r2';

    var resultTitle = allQData[resultKey + '_t'] || '';
    var resultDesc = allQData[resultKey + '_d'] || '';
    var resultAdvice = allQData[resultKey + '_a'] || '';

    // Build comparison table
    var compRows = '';
    for (var j = 0; j < totalQ; j++) {
      var q = questions[j];
      var qText = q.text.replace(/\{\{name\}\}/g, '').replace(/  /g, ' ').trim();
      if (qText.length > 50) qText = qText.substring(0, 47) + '…';
      var same = state.myAnswers[j] === state.partnerAnswers[j];
      var myChoice = q[state.myAnswers[j]] || '';
      var partnerChoice = q[state.partnerAnswers[j]] || '';
      if (myChoice.length > 30) myChoice = myChoice.substring(0, 27) + '…';
      if (partnerChoice.length > 30) partnerChoice = partnerChoice.substring(0, 27) + '…';

      compRows +=
        '<tr class="' + (same ? 'bg-emerald-50 dark:bg-emerald-900/10' : '') + '">' +
          '<td class="py-2 px-3 text-sm">' + (j + 1) + '</td>' +
          '<td class="py-2 px-3 text-sm">' + myChoice.replace(/\{\{name\}\}/g, state.partnerName) + '</td>' +
          '<td class="py-2 px-3 text-sm">' + partnerChoice.replace(/\{\{name\}\}/g, state.myName) + '</td>' +
          '<td class="py-2 px-3 text-center">' + (same ? '<span class="text-emerald-600">✓</span>' : '<span class="text-muted-foreground">✗</span>') + '</td>' +
        '</tr>';
    }

    container.innerHTML =
      '<div class="max-w-lg mx-auto py-8 space-y-8">' +
        // Score circle
        '<div class="text-center space-y-4">' +
          '<div class="inline-flex items-center justify-center w-32 h-32 rounded-full border-4 ' + (pct >= 60 ? 'border-emerald-500' : pct >= 30 ? 'border-yellow-500' : 'border-red-400') + '">' +
            '<div>' +
              '<p class="text-3xl font-bold">' + pct + '%</p>' +
              '<p class="text-xs text-muted-foreground">' + matches + '/' + totalQ + '</p>' +
            '</div>' +
          '</div>' +
          '<h2 class="text-2xl font-bold">' + resultTitle + '</h2>' +
          '<p class="text-muted-foreground">' + resultDesc + '</p>' +
          (resultAdvice ? '<div class="bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm text-muted-foreground">' + resultAdvice + '</div>' : '') +
        '</div>' +
        // Comparison table
        '<details class="border border-border rounded-lg">' +
          '<summary class="p-4 font-medium cursor-pointer hover:bg-muted transition-colors">' + t('comparison') + '</summary>' +
          '<div class="overflow-x-auto">' +
            '<table class="w-full text-sm">' +
              '<thead><tr class="border-b border-border">' +
                '<th class="py-2 px-3 text-left">#</th>' +
                '<th class="py-2 px-3 text-left">' + state.myName + '</th>' +
                '<th class="py-2 px-3 text-left">' + state.partnerName + '</th>' +
                '<th class="py-2 px-3 text-center"></th>' +
              '</tr></thead>' +
              '<tbody>' + compRows + '</tbody>' +
            '</table>' +
          '</div>' +
        '</details>' +
        // Actions
        '<div class="flex gap-3 justify-center">' +
          '<button id="btn-replay" class="btn btn-primary">' + t('playAgain') + '</button>' +
          '<a href="/" class="btn btn-outline">' + t('backHome') + '</a>' +
        '</div>' +
      '</div>';

    document.getElementById('btn-replay').addEventListener('click', function () {
      resetState();
      render();
    });
  }

  // ── Actions ──
  function createSession() {
    var qIds = selectRandomQuestions();
    setLoading(true);
    callEdgeFn('create', {
      player1_name: state.myName,
      question_ids: qIds,
      lang: lang
    }).then(function (res) {
      setLoading(false);
      if (res.error) {
        state.error = t('errorGeneric');
        render();
        return;
      }
      state.sessionId = res.id;
      state.sessionCode = res.code;
      state.playerNum = 1;
      loadQuestionsFromIds(qIds);
      subscribeToSession(res.id);
      state.screen = 'waiting';
      render();
    }).catch(function () {
      setLoading(false);
      state.error = t('errorGeneric');
      render();
    });
  }

  function joinSession(code) {
    setLoading(true);
    callEdgeFn('join', {
      code: code,
      player2_name: state.myName
    }).then(function (res) {
      setLoading(false);
      if (res.error === 'not_found') {
        state.error = t('errorCodeInvalid');
        render();
        return;
      }
      if (res.error === 'session_full') {
        state.error = t('errorSessionFull');
        render();
        return;
      }
      if (res.error) {
        state.error = t('errorGeneric');
        render();
        return;
      }
      state.sessionId = res.id;
      state.sessionCode = code;
      state.playerNum = 2;
      state.partnerName = res.player1_name;
      if (res.question_ids) {
        loadQuestionsFromIds(res.question_ids);
      }
      subscribeToSession(res.id);
      state.screen = 'questions';
      render();
    }).catch(function () {
      setLoading(false);
      state.error = t('errorGeneric');
      render();
    });
  }

  function handleAnswer(choice) {
    state.myAnswers.push(choice);
    state.currentQ++;

    // Push answer to Supabase
    var answerKey = state.playerNum === 1 ? 'player1_answers' : 'player2_answers';
    var updateData = {};
    updateData[answerKey] = state.myAnswers;

    sb.from('quiz_ado_sessions')
      .update(updateData)
      .eq('id', state.sessionId)
      .then(function () {});

    // Check if both done
    if (state.currentQ >= totalQ && state.partnerAnswers.length >= totalQ) {
      state.screen = 'results';
      render();
      setTimeout(function () { callEdgeFn('cleanup', { session_id: state.sessionId }); }, 10000);
    } else {
      render();
    }
  }

  function setLoading(loading) {
    var btn = document.getElementById('btn-submit');
    if (btn) {
      btn.disabled = loading;
      if (loading) {
        btn.dataset.originalText = btn.textContent;
        btn.innerHTML = '<span class="spinner-sm mr-2"></span>…';
      } else if (btn.dataset.originalText) {
        btn.textContent = btn.dataset.originalText;
      }
    }
  }

  function resetState() {
    if (channel) { channel.unsubscribe(); channel = null; }
    state = {
      screen: 'mode-select',
      mode: null,
      sessionId: null,
      sessionCode: null,
      playerNum: 0,
      myName: '',
      partnerName: '',
      currentQ: 0,
      myAnswers: [],
      partnerAnswers: [],
      partnerCurrentQ: 0,
      questionsReady: false,
      error: null
    };
    questions = [];
  }

  // ── Init ──
  function init() {
    container = document.getElementById('quiz-engine');
    if (!container || container.dataset.quiz !== 'ado') return;
    lang = container.dataset.lang || 'fr';

    // Load Supabase client from CDN
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
    script.onload = function () {
      sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      loadQuizData().then(function () {
        render();
      });
    };
    script.onerror = function () {
      // Fallback: render without realtime (basic mode)
      loadQuizData().then(function () {
        render();
      });
    };
    document.head.appendChild(script);
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
