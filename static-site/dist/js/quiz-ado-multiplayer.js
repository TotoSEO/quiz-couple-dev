/**
 * Quiz Ado - Multiplayer Real-Time Engine
 * 5 screens: Mode Select → Name Input → Waiting Room → Questions → Results
 * Uses Supabase Realtime Broadcast (no database/edge function needed)
 */
(function () {
  'use strict';

  var SUPABASE_URL = 'https://nbjpgecedevlmypqisng.supabase.co';
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ianBnZWNlZGV2bG15cHFpc25nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNDk3MjgsImV4cCI6MjA4NDgyNTcyOH0.agwrq1lrAKP8Vc-Y349H3RxEZhEgsDj21cG1luw9AXs';

  var container, lang, sb, channel;
  var questions = [];
  var totalQ = 20;
  var state = {
    screen: 'mode-select',
    mode: null,
    sessionCode: null,
    playerNum: 0,
    myName: '',
    partnerName: '',
    currentQ: 0,
    myAnswers: [],
    partnerAnswers: [],
    questionIds: [],
    questionsReady: false,
    error: null,
    loading: false
  };

  // ── UI Translations ──
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
      back: 'Retour',
      waitingTitle: 'En attente de ton/ta partenaire…',
      waitingDesc: 'Envoie ce code à ton/ta partenaire pour qu\'il/elle te rejoigne :',
      copyCode: 'Copier le code',
      copied: 'Copié !',
      questionOf: 'sur',
      waitingAnswer: 'En attente de la réponse de {{name}}…',
      waitingPartnerProgress: '{{name}} en est à la question {{n}}/{{total}}',
      resultsTitle: 'Résultats',
      matchPercent: '{{pct}}% de compatibilité',
      identical: 'réponses identiques',
      playAgain: 'Rejouer',
      backHome: 'Retour à l\'accueil',
      errorGeneric: 'Une erreur est survenue. Réessaie.',
      errorCodeInvalid: 'Code invalide ou partie introuvable.',
      errorSessionFull: 'Cette partie est déjà complète.',
      errorTimeout: 'Connexion perdue. Réessaie.',
      comparison: 'Comparaison des réponses',
      connecting: 'Connexion en cours…'
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
      back: 'Back',
      waitingTitle: 'Waiting for your partner…',
      waitingDesc: 'Send this code to your partner so they can join:',
      copyCode: 'Copy code',
      copied: 'Copied!',
      questionOf: 'of',
      waitingAnswer: 'Waiting for {{name}}\'s answer…',
      waitingPartnerProgress: '{{name}} is on question {{n}}/{{total}}',
      resultsTitle: 'Results',
      matchPercent: '{{pct}}% compatibility',
      identical: 'identical answers',
      playAgain: 'Play again',
      backHome: 'Back to home',
      errorGeneric: 'An error occurred. Try again.',
      errorCodeInvalid: 'Invalid code or game not found.',
      errorSessionFull: 'This game is already full.',
      errorTimeout: 'Connection lost. Try again.',
      comparison: 'Answer comparison',
      connecting: 'Connecting…'
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
      back: 'Volver',
      waitingTitle: 'Esperando a tu pareja…',
      waitingDesc: 'Envía este código a tu pareja para que se una:',
      copyCode: 'Copiar código',
      copied: '¡Copiado!',
      questionOf: 'de',
      waitingAnswer: 'Esperando la respuesta de {{name}}…',
      waitingPartnerProgress: '{{name}} va por la pregunta {{n}}/{{total}}',
      resultsTitle: 'Resultados',
      matchPercent: '{{pct}}% de compatibilidad',
      identical: 'respuestas idénticas',
      playAgain: 'Jugar de nuevo',
      backHome: 'Volver al inicio',
      errorGeneric: 'Ocurrió un error. Inténtalo de nuevo.',
      errorCodeInvalid: 'Código inválido o partida no encontrada.',
      errorSessionFull: 'Esta partida ya está completa.',
      errorTimeout: 'Conexión perdida. Inténtalo de nuevo.',
      comparison: 'Comparación de respuestas',
      connecting: 'Conectando…'
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
      back: 'Zurück',
      waitingTitle: 'Warte auf deinen Partner…',
      waitingDesc: 'Sende diesen Code an deinen Partner:',
      copyCode: 'Code kopieren',
      copied: 'Kopiert!',
      questionOf: 'von',
      waitingAnswer: 'Warte auf {{name}}s Antwort…',
      waitingPartnerProgress: '{{name}} ist bei Frage {{n}}/{{total}}',
      resultsTitle: 'Ergebnisse',
      matchPercent: '{{pct}}% Kompatibilität',
      identical: 'identische Antworten',
      playAgain: 'Nochmal spielen',
      backHome: 'Zurück zur Startseite',
      errorGeneric: 'Ein Fehler ist aufgetreten. Versuche es erneut.',
      errorCodeInvalid: 'Ungültiger Code oder Spiel nicht gefunden.',
      errorSessionFull: 'Dieses Spiel ist bereits voll.',
      errorTimeout: 'Verbindung verloren. Versuche es erneut.',
      comparison: 'Antwortvergleich',
      connecting: 'Verbindung wird hergestellt…'
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
      back: 'Indietro',
      waitingTitle: 'In attesa del tuo partner…',
      waitingDesc: 'Invia questo codice al tuo partner per unirsi:',
      copyCode: 'Copia codice',
      copied: 'Copiato!',
      questionOf: 'di',
      waitingAnswer: 'In attesa della risposta di {{name}}…',
      waitingPartnerProgress: '{{name}} è alla domanda {{n}}/{{total}}',
      resultsTitle: 'Risultati',
      matchPercent: '{{pct}}% di compatibilità',
      identical: 'risposte identiche',
      playAgain: 'Gioca di nuovo',
      backHome: 'Torna alla home',
      errorGeneric: 'Si è verificato un errore. Riprova.',
      errorCodeInvalid: 'Codice non valido o partita non trovata.',
      errorSessionFull: 'Questa partita è già completa.',
      errorTimeout: 'Connessione persa. Riprova.',
      comparison: 'Confronto risposte',
      connecting: 'Connessione in corso…'
    }
  };

  function t(key) {
    return (UI[lang] || UI.fr)[key] || UI.fr[key] || key;
  }

  // ── Code generator ──
  function generateCode() {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars
    var code = '';
    for (var i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  }

  // ── Supabase Realtime Broadcast ──
  function joinChannel(code, onReady) {
    if (channel) { channel.unsubscribe(); channel = null; }

    channel = sb.channel('ado-' + code, {
      config: { broadcast: { self: false } }
    });

    // Listen for player_joined (player 1 receives this)
    channel.on('broadcast', { event: 'player_joined' }, function (payload) {
      if (state.screen === 'waiting') {
        state.partnerName = payload.payload.name;
        // Send back the question IDs and player1 name
        channel.send({
          type: 'broadcast',
          event: 'game_start',
          payload: {
            player1_name: state.myName,
            question_ids: state.questionIds
          }
        });
        state.screen = 'questions';
        render();
      }
    });

    // Listen for game_start (player 2 receives this)
    channel.on('broadcast', { event: 'game_start' }, function (payload) {
      if (state._joinTimeout) { clearTimeout(state._joinTimeout); state._joinTimeout = null; }
      state.partnerName = payload.payload.player1_name;
      state.questionIds = payload.payload.question_ids;
      loadQuestionsFromIds(state.questionIds);
      state.screen = 'questions';
      render();
    });

    // Listen for answers
    channel.on('broadcast', { event: 'answer' }, function (payload) {
      var p = payload.payload;
      if (p.playerNum !== state.playerNum) {
        state.partnerAnswers = p.answers;
        // Check if both finished
        if (state.myAnswers.length >= totalQ && state.partnerAnswers.length >= totalQ) {
          state.screen = 'results';
        }
        render();
      }
    });

    // Listen for session_full (player 2 gets rejected)
    channel.on('broadcast', { event: 'session_full' }, function () {
      state.error = t('errorSessionFull');
      state.screen = 'name-input';
      render();
    });

    channel.subscribe(function (status) {
      if (status === 'SUBSCRIBED') {
        if (onReady) onReady();
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        state.error = t('errorTimeout');
        state.loading = false;
        state.screen = 'name-input';
        render();
      }
    });
  }

  // ── Data loading ──
  var allQData = null;

  function loadQuizData() {
    return fetch('/js/data/gd-' + lang + '.json')
      .then(function (r) { return r.json(); })
      .then(function (data) { allQData = data.ado || {}; });
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
        id: id,
        text: allQData['q' + id] || '',
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
          t('back') +
        '</button>' +
        '<div class="space-y-4">' +
          '<div>' +
            '<label class="block text-sm font-medium mb-1.5" for="input-name">' + t('yourName') + '</label>' +
            '<input id="input-name" type="text" class="w-full rounded-lg border border-border bg-card px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="' + t('namePlaceholder') + '" maxlength="30" autocomplete="given-name" />' +
          '</div>' +
          (isJoin ?
          '<div>' +
            '<label class="block text-sm font-medium mb-1.5" for="input-code">' + t('sessionCode') + '</label>' +
            '<input id="input-code" type="text" class="w-full rounded-lg border border-border bg-card px-4 py-3 text-base text-center font-mono tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="' + t('codePlaceholder') + '" maxlength="6" autocomplete="off" />' +
          '</div>' : '') +
          (state.error ? '<p class="text-sm text-destructive">' + escHtml(state.error) + '</p>' : '') +
          '<button id="btn-submit" class="btn btn-primary w-full py-3 text-base" ' + (state.loading ? 'disabled' : '') + '>' +
            (state.loading ? '<span class="spinner-sm mr-2"></span>' + t('connecting') : (isJoin ? t('join') : t('start'))) +
          '</button>' +
        '</div>' +
      '</div>';

    document.getElementById('btn-back').addEventListener('click', function () {
      state.screen = 'mode-select';
      state.error = null;
      state.loading = false;
      if (channel) { channel.unsubscribe(); channel = null; }
      render();
    });

    var nameInput = document.getElementById('input-name');
    if (state.myName) nameInput.value = state.myName;
    if (!state.loading) nameInput.focus();

    document.getElementById('btn-submit').addEventListener('click', function () {
      if (state.loading) return;
      var name = nameInput.value.trim();
      if (!name) { nameInput.focus(); return; }
      state.myName = name;
      state.error = null;

      if (isJoin) {
        var code = document.getElementById('input-code').value.trim().toUpperCase();
        if (!code || code.length < 4) {
          document.getElementById('input-code').focus();
          return;
        }
        doJoin(code);
      } else {
        doCreate();
      }
    });

    container.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        var btn = document.getElementById('btn-submit');
        if (btn && !btn.disabled) btn.click();
      }
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
          '<p class="text-4xl font-mono font-bold tracking-[0.4em] text-primary select-all">' + state.sessionCode + '</p>' +
        '</div>' +
        '<button id="btn-copy" class="btn btn-outline text-sm">' +
          '<svg class="h-4 w-4 mr-2 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>' +
          t('copyCode') +
        '</button>' +
        '<button id="btn-cancel" class="block mx-auto text-sm text-muted-foreground hover:text-foreground transition-colors">' + t('back') + '</button>' +
      '</div>';

    document.getElementById('btn-copy').addEventListener('click', function () {
      var btn = this;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(state.sessionCode).then(function () {
          btn.textContent = '✓ ' + t('copied');
          setTimeout(function () { render(); }, 2000);
        });
      } else {
        // Fallback: select text
        var range = document.createRange();
        var sel = window.getSelection();
        range.selectNodeContents(container.querySelector('.select-all'));
        sel.removeAllRanges();
        sel.addRange(range);
      }
    });

    document.getElementById('btn-cancel').addEventListener('click', function () {
      if (channel) { channel.unsubscribe(); channel = null; }
      state.screen = 'mode-select';
      state.error = null;
      render();
    });
  }

  function renderQuestions() {
    if (!state.questionsReady || questions.length === 0) {
      container.innerHTML = '<div class="text-center py-12"><div class="spinner mx-auto mb-4"></div><p class="text-muted-foreground text-sm">' + t('connecting') + '</p></div>';
      return;
    }

    var qi = state.currentQ;
    if (qi >= totalQ) {
      // I'm done, waiting for partner to finish
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
          '<span class="font-medium">' + escHtml(state.myName) + '</span>' +
        '</div>' +
        '<div class="w-full bg-muted rounded-full h-2">' +
          '<div class="bg-primary h-2 rounded-full transition-all duration-300" style="width:' + ((qi + 1) / totalQ * 100) + '%"></div>' +
        '</div>' +
        '<h3 class="text-lg font-semibold leading-snug">' + escHtml(qText) + '</h3>' +
        '<div class="grid gap-3">' +
          choices.map(function (c) {
            return '<button class="choice-btn btn btn-outline text-left py-3 px-4 w-full" data-choice="' + c.key + '">' + escHtml(c.text) + '</button>';
          }).join('') +
        '</div>' +
      '</div>';

    container.querySelectorAll('.choice-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        handleAnswer(btn.dataset.choice);
      });
    });
  }

  function renderWaitingForPartner() {
    var waitText = t('waitingAnswer').replace('{{name}}', escHtml(state.partnerName));
    var progressText = t('waitingPartnerProgress')
      .replace('{{name}}', escHtml(state.partnerName))
      .replace('{{n}}', state.partnerAnswers.length)
      .replace('{{total}}', totalQ);

    container.innerHTML =
      '<div class="max-w-md mx-auto py-12 text-center space-y-6">' +
        '<div class="spinner mx-auto"></div>' +
        '<p class="font-medium">' + waitText + '</p>' +
        '<p class="text-sm text-muted-foreground">' + progressText + '</p>' +
        '<div class="w-full bg-muted rounded-full h-2 max-w-xs mx-auto">' +
          '<div class="bg-secondary h-2 rounded-full transition-all duration-300" style="width:' + (state.partnerAnswers.length / totalQ * 100) + '%"></div>' +
        '</div>' +
      '</div>';
  }

  function renderResults() {
    var matches = 0;
    for (var i = 0; i < totalQ; i++) {
      if (state.myAnswers[i] === state.partnerAnswers[i]) matches++;
    }
    var pct = Math.round(matches / totalQ * 100);

    var resultKey = 'r1';
    if (pct >= 80) resultKey = 'r5';
    else if (pct >= 60) resultKey = 'r4';
    else if (pct >= 40) resultKey = 'r3';
    else if (pct >= 20) resultKey = 'r2';

    var resultTitle = allQData[resultKey + '_t'] || '';
    var resultDesc = allQData[resultKey + '_d'] || '';
    var resultAdvice = allQData[resultKey + '_a'] || '';

    var compRows = '';
    for (var j = 0; j < totalQ; j++) {
      var q = questions[j];
      var same = state.myAnswers[j] === state.partnerAnswers[j];
      var myChoice = q[state.myAnswers[j]] || '–';
      var partnerChoice = q[state.partnerAnswers[j]] || '–';
      myChoice = myChoice.replace(/\{\{name\}\}/g, state.partnerName);
      partnerChoice = partnerChoice.replace(/\{\{name\}\}/g, state.myName);
      if (myChoice.length > 35) myChoice = myChoice.substring(0, 32) + '…';
      if (partnerChoice.length > 35) partnerChoice = partnerChoice.substring(0, 32) + '…';

      compRows +=
        '<tr class="border-b border-border/50 ' + (same ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : '') + '">' +
          '<td class="py-2 px-3 text-xs text-muted-foreground">' + (j + 1) + '</td>' +
          '<td class="py-2 px-3 text-sm">' + escHtml(myChoice) + '</td>' +
          '<td class="py-2 px-3 text-sm">' + escHtml(partnerChoice) + '</td>' +
          '<td class="py-2 px-3 text-center">' + (same ? '<span class="text-emerald-600 font-bold">✓</span>' : '<span class="text-muted-foreground">✗</span>') + '</td>' +
        '</tr>';
    }

    var borderColor = pct >= 60 ? 'border-emerald-500' : pct >= 30 ? 'border-amber-500' : 'border-red-400';
    var matchText = t('matchPercent').replace('{{pct}}', pct);

    container.innerHTML =
      '<div class="max-w-lg mx-auto py-8 space-y-8">' +
        '<div class="text-center space-y-4">' +
          '<div class="inline-flex items-center justify-center w-32 h-32 rounded-full border-4 ' + borderColor + '">' +
            '<div>' +
              '<p class="text-3xl font-bold">' + pct + '%</p>' +
              '<p class="text-xs text-muted-foreground">' + matches + '/' + totalQ + ' ' + t('identical') + '</p>' +
            '</div>' +
          '</div>' +
          '<p class="text-lg font-semibold text-gradient">' + matchText + '</p>' +
          (resultTitle ? '<h2 class="text-2xl font-bold">' + escHtml(resultTitle) + '</h2>' : '') +
          (resultDesc ? '<p class="text-muted-foreground">' + escHtml(resultDesc) + '</p>' : '') +
          (resultAdvice ? '<div class="bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm text-muted-foreground">' + escHtml(resultAdvice) + '</div>' : '') +
        '</div>' +
        '<details class="border border-border rounded-lg">' +
          '<summary class="p-4 font-medium cursor-pointer hover:bg-muted/50 transition-colors">' + t('comparison') + '</summary>' +
          '<div class="overflow-x-auto">' +
            '<table class="w-full text-sm">' +
              '<thead><tr class="border-b border-border bg-muted/30">' +
                '<th class="py-2 px-3 text-left text-xs">#</th>' +
                '<th class="py-2 px-3 text-left text-xs">' + escHtml(state.myName) + '</th>' +
                '<th class="py-2 px-3 text-left text-xs">' + escHtml(state.partnerName) + '</th>' +
                '<th class="py-2 px-3 text-center text-xs"></th>' +
              '</tr></thead>' +
              '<tbody>' + compRows + '</tbody>' +
            '</table>' +
          '</div>' +
        '</details>' +
        '<div class="flex gap-3 justify-center">' +
          '<button id="btn-replay" class="btn btn-primary">' + t('playAgain') + '</button>' +
          '<a href="/" class="btn btn-outline">' + t('backHome') + '</a>' +
        '</div>' +
      '</div>';

    document.getElementById('btn-replay').addEventListener('click', function () {
      resetState();
      render();
    });

    // Cleanup channel
    if (channel) { setTimeout(function () { channel.unsubscribe(); channel = null; }, 5000); }
  }

  // ── Actions ──
  function doCreate() {
    state.loading = true;
    state.error = null;
    render(); // show loading state

    var code = generateCode();
    state.sessionCode = code;
    state.playerNum = 1;
    state.questionIds = selectRandomQuestions();
    loadQuestionsFromIds(state.questionIds);

    joinChannel(code, function () {
      state.loading = false;
      state.screen = 'waiting';
      render();
    });
  }

  function doJoin(code) {
    state.loading = true;
    state.error = null;
    render(); // show loading state

    state.sessionCode = code;
    state.playerNum = 2;

    joinChannel(code, function () {
      // Announce ourselves to player 1
      channel.send({
        type: 'broadcast',
        event: 'player_joined',
        payload: { name: state.myName }
      });

      // Wait for game_start from player 1 (timeout after 15s)
      state.loading = false;
      var timeout = setTimeout(function () {
        if (state.screen === 'name-input' || !state.questionsReady) {
          state.error = t('errorCodeInvalid');
          state.loading = false;
          state.screen = 'name-input';
          if (channel) { channel.unsubscribe(); channel = null; }
          render();
        }
      }, 15000);

      // The game_start event handler (set up in joinChannel) will move to questions screen
      // Store timeout to clear it if game starts
      state._joinTimeout = timeout;
    });
  }

  function handleAnswer(choice) {
    state.myAnswers.push(choice);
    state.currentQ++;

    // Broadcast answer to partner
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'answer',
        payload: {
          playerNum: state.playerNum,
          answers: state.myAnswers.slice() // send copy
        }
      });
    }

    // Check if both finished
    if (state.currentQ >= totalQ && state.partnerAnswers.length >= totalQ) {
      state.screen = 'results';
    }
    render();
  }

  function resetState() {
    if (channel) { channel.unsubscribe(); channel = null; }
    if (state._joinTimeout) clearTimeout(state._joinTimeout);
    state = {
      screen: 'mode-select',
      mode: null,
      sessionCode: null,
      playerNum: 0,
      myName: '',
      partnerName: '',
      currentQ: 0,
      myAnswers: [],
      partnerAnswers: [],
      questionIds: [],
      questionsReady: false,
      error: null,
      loading: false
    };
    questions = [];
  }

  function escHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ── Init ──
  function init() {
    container = document.getElementById('quiz-engine');
    if (!container || container.dataset.quiz !== 'ado') return;
    lang = container.dataset.lang || 'fr';

    // Load Supabase JS client from CDN
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
    script.onload = function () {
      sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      loadQuizData().then(function () {
        render();
      });
    };
    script.onerror = function () {
      container.innerHTML = '<div class="text-center py-12"><p class="text-destructive">' + t('errorGeneric') + '</p></div>';
    };
    document.head.appendChild(script);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
