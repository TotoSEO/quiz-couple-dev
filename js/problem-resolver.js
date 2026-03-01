/**
 * Problem Resolver - AI-powered couple problem resolution (4-step flow)
 * Steps: Context → Statements → Loading → Result
 * Calls Supabase Edge Function "resolve-couple-problem"
 */
(function() {
  'use strict';

  var container = document.getElementById('problem-resolver-engine');
  if (!container) return;

  var lang = container.dataset.lang || document.documentElement.lang || 'fr';
  var SUPABASE_URL = 'https://lojvajnnvhatfplevyvy.supabase.co';
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvanZham5udmhhdGZwbGV2eXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNzk3NDIsImV4cCI6MjA4Nzg1NTc0Mn0.gdd9HRbRvfQr6io9jGN6hUCW6tBOtognhwbsTJtSTng';

  // SVG icons (24x24, stroke-based)
  var ICONS = {
    fileText: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
    messageSquare: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>',
    brain: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M9.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 01-4.96.44A2.5 2.5 0 015 17.5a2.5 2.5 0 01-.64-4.9A2.5 2.5 0 016 8.5a2.5 2.5 0 013.5-6z"/><path d="M14.5 2A2.5 2.5 0 0012 4.5v15a2.5 2.5 0 004.96.44A2.5 2.5 0 0019 17.5a2.5 2.5 0 00.64-4.9A2.5 2.5 0 0018 8.5a2.5 2.5 0 00-3.5-6z"/></svg>',
    trophy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M6 9H4.5a2.5 2.5 0 010-5H6"/><path d="M18 9h1.5a2.5 2.5 0 000-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0012 0V2z"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><polyline points="20 6 9 17 4 12"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
    eyeOff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>',
    alertCircle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    wrench: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>',
    target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
    lightbulb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    sparkles: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z"/></svg>',
    scale: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M16 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z"/><path d="M2 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>'
  };

  // Step definitions
  var STEPS = [
    { key: 'context', icon: ICONS.fileText },
    { key: 'statements', icon: ICONS.messageSquare },
    { key: 'loading', icon: ICONS.brain },
    { key: 'result', icon: ICONS.trophy }
  ];

  // Person colors by index
  var PERSON_COLORS = [
    { bg: 'rgba(244,63,94,0.1)', border: 'rgba(244,63,94,0.3)', gradient: 'linear-gradient(135deg,#f43f5e,#ec4899)', text: '#f43f5e' },
    { bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)', gradient: 'linear-gradient(135deg,#3b82f6,#6366f1)', text: '#3b82f6' },
    { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', gradient: 'linear-gradient(135deg,#10b981,#14b8a6)', text: '#10b981' },
    { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', gradient: 'linear-gradient(135deg,#f59e0b,#f97316)', text: '#f59e0b' }
  ];

  // Gender colors
  var GENDER_COLORS = {
    homme: { bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)', gradient: 'linear-gradient(135deg,#3b82f6,#6366f1)' },
    femme: { bg: 'rgba(244,63,94,0.1)', border: 'rgba(244,63,94,0.3)', gradient: 'linear-gradient(135deg,#f43f5e,#ec4899)' }
  };

  // Fault bar colors
  var FAULT_COLORS = ['hsl(var(--primary))', '#8b5cf6', '#f59e0b', '#10b981'];

  // State
  var state = {
    step: 'context',
    title: '',
    context: '',
    persons: [
      { name: '', gender: 'homme', statement: '' },
      { name: '', gender: 'femme', statement: '' }
    ],
    currentPerson: 0,
    privacyMode: false,
    result: null,
    error: null,
    rateLimited: false
  };

  var t = {};

  // Load translations then render
  loadTranslations(function() { render(); });

  function loadTranslations(cb) {
    fetch('/js/data/games-' + lang + '.json')
      .then(function(r) { return r.json(); })
      .then(function(data) { t = (data && data.problemResolver) || {}; cb(); })
      .catch(function() {
        fetch('/js/data/games-fr.json')
          .then(function(r) { return r.json(); })
          .then(function(data) { t = (data && data.problemResolver) || {}; cb(); })
          .catch(function() { t = {}; cb(); });
      });
  }

  function tr(key, fallback, replacements) {
    var val = t[key] || fallback || key;
    if (replacements) {
      Object.keys(replacements).forEach(function(k) {
        val = val.replace('{{' + k + '}}', replacements[k]);
      });
    }
    return val;
  }

  // ─── Main render ──────────────────────────────────────────
  function render() {
    container.innerHTML = '';
    var wrap = el('div', 'space-y-6 animate-fade-in');
    renderStepIndicator(wrap);
    switch (state.step) {
      case 'context': renderContextForm(wrap); break;
      case 'statements': renderStatementForm(wrap); break;
      case 'loading': renderLoading(wrap); submitToAI(); break;
      case 'result': renderResultDisplay(wrap); break;
    }
    container.appendChild(wrap);
  }

  // ─── Step indicator ───────────────────────────────────────
  function renderStepIndicator(parent) {
    var stepLabels = [
      tr('stepContext', 'Contexte'),
      tr('stepStatements', 'Versions'),
      tr('stepAnalysis', 'Analyse'),
      tr('stepResult', 'Résultat')
    ];
    var stepIndex = STEPS.findIndex(function(s) { return s.key === state.step; });
    var bar = el('div', 'flex items-center justify-center gap-0 mb-8');
    for (var i = 0; i < STEPS.length; i++) {
      var isComplete = i < stepIndex;
      var isActive = i === stepIndex;
      // Circle
      var circle = el('div', 'flex flex-col items-center');
      var dot = el('div', 'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all');
      if (isComplete) {
        dot.style.cssText = 'background:hsl(var(--primary));color:white;';
        dot.innerHTML = ICONS.check;
      } else if (isActive) {
        dot.style.cssText = 'border:2px solid hsl(var(--primary));color:hsl(var(--primary));background:transparent;';
        dot.innerHTML = STEPS[i].icon;
      } else {
        dot.style.cssText = 'background:hsl(var(--muted));color:hsl(var(--muted-foreground));';
        dot.innerHTML = STEPS[i].icon;
      }
      circle.appendChild(dot);
      var label = el('span', 'text-xs mt-1 ' + (isActive ? 'text-primary font-medium' : 'text-muted-foreground'));
      label.textContent = stepLabels[i];
      circle.appendChild(label);
      bar.appendChild(circle);
      // Connector line
      if (i < STEPS.length - 1) {
        var line = el('div', 'flex-1 h-0.5 mx-2 mt-[-16px]');
        line.style.cssText = 'background:' + (i < stepIndex ? 'hsl(var(--primary))' : 'hsl(var(--border))') + ';min-width:32px;max-width:60px;';
        bar.appendChild(line);
      }
    }
    parent.appendChild(bar);
  }

  // ─── Step 1: Context form ─────────────────────────────────
  function renderContextForm(parent) {
    var form = el('div', 'space-y-6');

    // Title field
    var titleGroup = el('div', 'space-y-2');
    var titleLabel = el('label', 'flex items-center gap-2 text-sm font-semibold');
    titleLabel.innerHTML = ICONS.fileText + ' ' + esc(tr('problemTitle', 'Titre du problème'));
    titleGroup.appendChild(titleLabel);
    var titleInput = el('input', 'input w-full');
    titleInput.type = 'text';
    titleInput.maxLength = 80;
    titleInput.placeholder = tr('problemTitlePlaceholder', 'Ex : Répartition des tâches ménagères');
    titleInput.value = state.title;
    titleInput.addEventListener('input', function() {
      state.title = titleInput.value;
      titleCounter.textContent = titleInput.value.length + '/80';
    });
    titleGroup.appendChild(titleInput);
    var titleCounter = el('p', 'text-xs text-muted-foreground text-right');
    titleCounter.textContent = state.title.length + '/80';
    titleGroup.appendChild(titleCounter);
    form.appendChild(titleGroup);

    // People section
    var peopleGroup = el('div', 'space-y-4');
    var peopleHeader = el('div', 'flex items-center justify-between');
    var peopleTitleEl = el('h3', 'text-sm font-semibold');
    peopleTitleEl.textContent = tr('peopleConcerned', 'Personnes concernées');
    peopleHeader.appendChild(peopleTitleEl);
    var peopleCount = el('span', 'text-xs text-muted-foreground');
    peopleCount.textContent = state.persons.length + '/4 ' + tr('people', 'personnes');
    peopleHeader.appendChild(peopleCount);
    peopleGroup.appendChild(peopleHeader);

    // Person cards
    state.persons.forEach(function(person, idx) {
      var gc = GENDER_COLORS[person.gender] || GENDER_COLORS.homme;
      var card = el('div', 'rounded-xl p-4 border space-y-3 transition-all');
      card.style.cssText = 'background:' + gc.bg + ';border-color:' + gc.border + ';';

      var cardHeader = el('div', 'flex items-center gap-3');
      // Avatar
      var avatar = el('div', 'w-8 h-8 rounded-full flex items-center justify-center text-white');
      avatar.style.background = gc.gradient;
      avatar.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
      cardHeader.appendChild(avatar);

      // Name input
      var nameInput = el('input', 'input flex-1 text-sm');
      nameInput.type = 'text';
      nameInput.maxLength = 30;
      nameInput.placeholder = (person.gender === 'femme' ? 'Prénom' : 'Prénom');
      nameInput.value = person.name;
      (function(i) {
        nameInput.addEventListener('input', function() { state.persons[i].name = nameInput.value; });
      })(idx);
      cardHeader.appendChild(nameInput);

      // Gender toggle
      var genderToggle = el('div', 'flex rounded-lg overflow-hidden border');
      genderToggle.style.borderColor = gc.border;
      ['homme', 'femme'].forEach(function(g) {
        var gBtn = el('button', 'px-3 py-1 text-xs font-medium transition-all');
        gBtn.type = 'button';
        gBtn.textContent = g === 'homme' ? 'Homme' : 'Femme';
        if (person.gender === g) {
          gBtn.style.cssText = 'background:' + GENDER_COLORS[g].gradient + ';color:white;';
        } else {
          gBtn.style.cssText = 'background:transparent;color:hsl(var(--muted-foreground));';
        }
        (function(i, gender) {
          gBtn.addEventListener('click', function() {
            state.persons[i].gender = gender;
            render();
          });
        })(idx, g);
        genderToggle.appendChild(gBtn);
      });
      cardHeader.appendChild(genderToggle);

      // Delete button (if > 2 persons)
      if (state.persons.length > 2) {
        var delBtn = el('button', 'p-1.5 rounded-lg text-muted-foreground hover:text-destructive transition-colors');
        delBtn.type = 'button';
        delBtn.innerHTML = ICONS.trash;
        (function(i) {
          delBtn.addEventListener('click', function() {
            state.persons.splice(i, 1);
            render();
          });
        })(idx);
        cardHeader.appendChild(delBtn);
      }

      card.appendChild(cardHeader);
      peopleGroup.appendChild(card);
    });

    // Add person button
    if (state.persons.length < 4) {
      var addBtn = el('button', 'btn btn-outline w-full flex items-center justify-center gap-2 text-sm');
      addBtn.type = 'button';
      addBtn.innerHTML = ICONS.plus + ' ' + esc(tr('addPerson', 'Ajouter une personne'));
      addBtn.addEventListener('click', function() {
        state.persons.push({ name: '', gender: 'homme', statement: '' });
        render();
      });
      peopleGroup.appendChild(addBtn);
    }
    form.appendChild(peopleGroup);

    // Neutral context warning
    var warningBox = el('div', 'rounded-xl p-4 border');
    warningBox.style.cssText = 'background:linear-gradient(135deg,rgba(245,158,11,0.1),rgba(249,115,22,0.1));border-color:rgba(245,158,11,0.2);';
    var warningHeader = el('div', 'flex items-center gap-2 mb-2');
    var warningIcon = el('div', 'w-8 h-8 rounded-full flex items-center justify-center');
    warningIcon.style.cssText = 'background:rgba(245,158,11,0.2);color:#f59e0b;';
    warningIcon.innerHTML = ICONS.alertCircle;
    warningHeader.appendChild(warningIcon);
    var warningTitle = el('span', 'font-bold text-sm');
    warningTitle.style.color = '#f59e0b';
    warningTitle.textContent = tr('stayNeutral', 'Restez neutre');
    warningHeader.appendChild(warningTitle);
    warningBox.appendChild(warningHeader);
    var warningText = el('p', 'text-sm text-muted-foreground');
    warningText.textContent = tr('neutralExplanation', 'Décrivez uniquement les faits objectifs, pas le problème en lui-même.');
    warningBox.appendChild(warningText);
    var warningExample = el('p', 'text-sm text-muted-foreground mt-1');
    warningExample.style.fontStyle = 'italic';
    warningExample.textContent = tr('neutralExample', 'Exemple : "Un des deux était en soirée et n\'a pas envoyé de message pendant 3 heures."');
    warningBox.appendChild(warningExample);
    form.appendChild(warningBox);

    // Context textarea
    var ctxGroup = el('div', 'space-y-2');
    var ctxLabel = el('label', 'text-sm font-semibold');
    ctxLabel.textContent = tr('contextDescription', 'Description du contexte (neutre)');
    ctxGroup.appendChild(ctxLabel);
    var ctxArea = el('textarea', 'textarea w-full');
    ctxArea.rows = 4;
    ctxArea.maxLength = 300;
    ctxArea.placeholder = tr('contextPlaceholder', 'Décrivez la situation de manière factuelle et neutre...');
    ctxArea.value = state.context;
    ctxArea.addEventListener('input', function() {
      state.context = ctxArea.value;
      ctxCounter.textContent = ctxArea.value.length + '/300';
    });
    ctxGroup.appendChild(ctxArea);
    var ctxCounter = el('p', 'text-xs text-muted-foreground text-right');
    ctxCounter.textContent = state.context.length + '/300';
    ctxGroup.appendChild(ctxCounter);
    form.appendChild(ctxGroup);

    // Validate button
    var validateBtn = el('button', 'btn btn-cta w-full');
    validateBtn.type = 'button';
    validateBtn.textContent = tr('validateContinue', 'Valider le contexte et continuer');
    validateBtn.addEventListener('click', function() {
      // Validate
      if (!state.title.trim() || state.title.trim().length > 80) {
        shake(titleInput);
        titleInput.focus();
        return;
      }
      var allNamed = state.persons.every(function(p) { return p.name.trim().length > 0 && p.name.trim().length <= 30; });
      if (!allNamed) {
        var firstEmpty = form.querySelector('input[type="text"][maxlength="30"]:placeholder-shown') || form.querySelectorAll('input[type="text"][maxlength="30"]')[0];
        if (firstEmpty) { shake(firstEmpty); firstEmpty.focus(); }
        return;
      }
      if (!state.context.trim() || state.context.trim().length > 300) {
        shake(ctxArea);
        ctxArea.focus();
        return;
      }
      state.step = 'statements';
      state.currentPerson = 0;
      state.privacyMode = false;
      render();
    });
    form.appendChild(validateBtn);

    parent.appendChild(form);
  }

  // ─── Step 2: Statement form (per person) ──────────────────
  function renderStatementForm(parent) {
    var idx = state.currentPerson;
    var person = state.persons[idx];
    var gc = GENDER_COLORS[person.gender] || GENDER_COLORS.homme;
    var color = { bg: gc.bg, border: gc.border, gradient: gc.gradient, text: person.gender === 'femme' ? '#f43f5e' : '#3b82f6' };
    var total = state.persons.length;

    var wrap = el('div', 'space-y-6 text-center');

    // Large avatar
    var avatarWrap = el('div', 'flex justify-center');
    var avatar = el('div', 'w-20 h-20 rounded-full flex items-center justify-center text-white mx-auto');
    avatar.style.background = color.gradient;
    avatar.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-10 h-10"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
    avatarWrap.appendChild(avatar);
    wrap.appendChild(avatarWrap);

    // Turn badge
    var badge = el('span', 'inline-block px-3 py-1 rounded-full text-xs text-muted-foreground');
    badge.style.cssText = 'background:hsl(var(--muted));';
    badge.textContent = tr('turnXofY', 'Témoignage {{current}}/{{total}}', { current: idx + 1, total: total });
    wrap.appendChild(badge);

    // Title
    var title = el('h2', 'text-xl font-bold');
    title.innerHTML = esc(tr('itsTurnOf', "C'est au tour de")) + ' <span style="background:' + color.gradient + ';-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">' + esc(person.name) + '</span>';
    wrap.appendChild(title);

    var subtitle = el('p', 'text-muted-foreground text-sm');
    subtitle.textContent = person.name + ', ' + tr('explainYourVersion', 'expliquez votre version des faits') + '.';
    wrap.appendChild(subtitle);

    // Textarea with word counter
    var textGroup = el('div', 'space-y-2 text-left');

    var textareaWrap = el('div', 'relative rounded-xl border p-1');
    textareaWrap.style.cssText = 'background:' + color.bg + ';border-color:' + color.border + ';';

    var textarea = el('textarea', 'textarea w-full bg-transparent border-0 resize-none');
    textarea.rows = 8;
    textarea.placeholder = tr('yourVersion', 'Votre version des faits') + '...';
    textarea.value = person.statement || '';

    // Privacy mode handling
    if (state.privacyMode) {
      textarea.style.cssText = '-webkit-text-security:disc;text-security:disc;';
    }

    textarea.addEventListener('input', function() {
      state.persons[idx].statement = textarea.value;
      updateWordCount();
    });

    textareaWrap.appendChild(textarea);

    // Privacy toggle + word counter row
    var counterRow = el('div', 'flex items-center justify-between px-2 py-1');

    var privacyBtn = el('button', 'flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors');
    privacyBtn.type = 'button';
    privacyBtn.innerHTML = (state.privacyMode ? ICONS.eyeOff : ICONS.eye) + ' ' + esc(tr('privacyMode', 'Mode privé'));
    privacyBtn.addEventListener('click', function() {
      state.privacyMode = !state.privacyMode;
      if (state.privacyMode) {
        textarea.style.cssText = '-webkit-text-security:disc;text-security:disc;';
        privacyBtn.innerHTML = ICONS.eyeOff + ' ' + esc(tr('privacyMode', 'Mode privé'));
      } else {
        textarea.style.cssText = '';
        privacyBtn.innerHTML = ICONS.eye + ' ' + esc(tr('privacyMode', 'Mode privé'));
      }
    });
    counterRow.appendChild(privacyBtn);

    var wordCount = el('span', 'text-xs text-muted-foreground');
    function updateWordCount() {
      var words = textarea.value.trim() ? textarea.value.trim().split(/\s+/).length : 0;
      wordCount.textContent = words + '/500 ' + tr('words', 'mots');
      if (words > 500) wordCount.style.color = 'hsl(var(--destructive))';
      else wordCount.style.color = '';
    }
    updateWordCount();
    counterRow.appendChild(wordCount);

    textareaWrap.appendChild(counterRow);
    textGroup.appendChild(textareaWrap);
    wrap.appendChild(textGroup);

    // Advice box
    var adviceBox = el('div', 'rounded-xl p-4 border text-left');
    adviceBox.style.cssText = 'background:linear-gradient(135deg,rgba(245,158,11,0.1),rgba(249,115,22,0.1));border-color:rgba(245,158,11,0.2);';
    var adviceTitle = el('p', 'text-sm font-semibold mb-1');
    adviceTitle.style.color = '#f59e0b';
    adviceTitle.textContent = tr('adviceTitle', 'Conseil important');
    adviceBox.appendChild(adviceTitle);
    var adviceText = el('p', 'text-sm text-muted-foreground');
    adviceText.textContent = tr('adviceText', "Racontez les faits de votre point de vue, en restant honnête. L'IA analysera les deux versions de manière impartiale.");
    adviceBox.appendChild(adviceText);
    wrap.appendChild(adviceBox);

    // Pass device warning (if not last person)
    if (idx < total - 1) {
      var nextPerson = state.persons[idx + 1];
      var passBox = el('div', 'rounded-xl p-4 border text-center');
      passBox.style.cssText = 'background:hsl(var(--muted)/0.5);border-color:hsl(var(--border));';
      passBox.innerHTML = '<p class="text-sm font-medium">&#128274; ' + esc(tr('passDeviceTo', 'Passez l\'appareil à la personne suivante.').replace('la personne suivante', nextPerson.name)) + '</p><p class="text-xs text-muted-foreground mt-1">' + esc(tr('textNotVisible', 'Votre texte ne sera pas visible.')) + '</p>';
      wrap.appendChild(passBox);
    }

    // Validate button
    var validateBtn = el('button', 'btn w-full text-white font-semibold py-3 rounded-xl');
    validateBtn.type = 'button';
    validateBtn.style.background = color.gradient;
    validateBtn.textContent = tr('validateMyVersion', 'Valider ma version');
    validateBtn.addEventListener('click', function() {
      var text = textarea.value.trim();
      if (!text) {
        shake(textarea);
        textarea.focus();
        return;
      }
      var words = text.split(/\s+/).length;
      if (words > 500) {
        shake(textarea);
        return;
      }
      state.persons[idx].statement = text;
      if (idx < total - 1) {
        state.currentPerson = idx + 1;
        state.privacyMode = false;
        render();
      } else {
        state.step = 'loading';
        render();
      }
    });
    wrap.appendChild(validateBtn);

    parent.appendChild(wrap);
  }

  // ─── Step 3: Loading ──────────────────────────────────────
  function renderLoading(parent) {
    var wrap = el('div', 'text-center py-12 space-y-6');

    // Brain icon with pulse
    var iconWrap = el('div', 'relative inline-block');
    var brainCircle = el('div', 'w-24 h-24 rounded-full flex items-center justify-center mx-auto animate-pulse-soft');
    brainCircle.style.cssText = 'background:hsl(var(--primary)/0.15);color:hsl(var(--primary));';
    brainCircle.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-12 h-12"><path d="M9.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 01-4.96.44A2.5 2.5 0 015 17.5a2.5 2.5 0 01-.64-4.9A2.5 2.5 0 016 8.5a2.5 2.5 0 013.5-6z"/><path d="M14.5 2A2.5 2.5 0 0012 4.5v15a2.5 2.5 0 004.96.44A2.5 2.5 0 0019 17.5a2.5 2.5 0 00.64-4.9A2.5 2.5 0 0018 8.5a2.5 2.5 0 00-3.5-6z"/></svg>';
    iconWrap.appendChild(brainCircle);

    // Sparkle
    var sparkle = el('div', 'absolute top-0 right-0 animate-spark');
    sparkle.style.color = '#f59e0b';
    sparkle.innerHTML = ICONS.sparkles;
    iconWrap.appendChild(sparkle);
    wrap.appendChild(iconWrap);

    // Title
    var title = el('h2', 'text-xl font-bold');
    title.textContent = tr('aiAnalyzing', "L'IA analyse votre situation...");
    wrap.appendChild(title);

    var subtitle = el('p', 'text-muted-foreground text-sm max-w-md mx-auto');
    subtitle.textContent = tr('aiExamining', "Notre intelligence artificielle examine chaque point de vue pour vous fournir une analyse complète et impartiale.");
    wrap.appendChild(subtitle);

    // Bouncing dots
    var dots = el('div', 'flex justify-center gap-2 pt-4');
    for (var i = 0; i < 3; i++) {
      var dot = el('div', 'w-3 h-3 rounded-full');
      dot.style.cssText = 'background:hsl(var(--primary));animation:bounce 1s infinite;animation-delay:' + (i * 150) + 'ms;';
      dots.appendChild(dot);
    }
    wrap.appendChild(dots);

    parent.appendChild(wrap);
  }

  // ─── Step 4: Result display ───────────────────────────────
  function renderResultDisplay(parent) {
    // Rate limited
    if (state.rateLimited) {
      var wrap = el('div', 'text-center py-12 space-y-4 animate-fade-in');
      var iconCircle = el('div', 'w-20 h-20 rounded-full flex items-center justify-center mx-auto');
      iconCircle.style.cssText = 'background:rgba(245,158,11,0.15);color:#f59e0b;';
      iconCircle.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-10 h-10"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
      wrap.appendChild(iconCircle);
      var title = el('h2', 'text-xl font-bold');
      title.textContent = tr('limitReached', 'Limite atteinte');
      wrap.appendChild(title);
      var msg = el('p', 'text-muted-foreground');
      msg.textContent = tr('alreadyUsedToday', "Vous avez déjà utilisé cet outil aujourd'hui.");
      wrap.appendChild(msg);
      var comeback = el('div', 'rounded-xl p-4 border mx-auto max-w-xs');
      comeback.style.cssText = 'background:hsl(var(--primary)/0.1);border-color:hsl(var(--primary)/0.2);color:hsl(var(--primary));';
      comeback.innerHTML = '<p class="font-semibold text-center">' + esc(tr('comeBackTomorrow', 'Revenez demain !')) + '</p>';
      wrap.appendChild(comeback);
      parent.appendChild(wrap);
      return;
    }

    // Error
    if (state.error) {
      var wrap2 = el('div', 'text-center py-12 space-y-4 animate-fade-in');
      var errCircle = el('div', 'w-20 h-20 rounded-full flex items-center justify-center mx-auto');
      errCircle.style.cssText = 'background:rgba(239,68,68,0.15);color:#ef4444;';
      errCircle.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-10 h-10"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
      wrap2.appendChild(errCircle);
      var errTitle = el('h2', 'text-xl font-bold');
      errTitle.textContent = tr('errorOccurred', 'Une erreur est survenue');
      wrap2.appendChild(errTitle);
      var errMsg = el('p', 'text-muted-foreground');
      errMsg.textContent = state.error;
      wrap2.appendChild(errMsg);
      parent.appendChild(wrap2);
      return;
    }

    // Normal result
    var result = state.result;
    if (!result) return;

    var wrap3 = el('div', 'space-y-8 animate-fade-in');

    // Header
    var header = el('div', 'text-center space-y-2');
    var h2 = el('h2', 'text-2xl font-bold');
    h2.textContent = tr('analysisComplete', 'Analyse terminée !');
    header.appendChild(h2);
    var sub = el('p', 'text-muted-foreground');
    sub.textContent = tr('impartialAnalysis', 'Voici notre analyse impartiale de votre situation.');
    header.appendChild(sub);
    wrap3.appendChild(header);

    // Score gauges (2 columns)
    var gaugesGrid = el('div', 'grid grid-cols-1 sm:grid-cols-2 gap-4');

    // Gravity gauge
    gaugesGrid.appendChild(buildGauge(
      ICONS.alertCircle,
      '#f59e0b',
      tr('disputeGravity', 'Gravité de la dispute'),
      result.gravityScore || 0,
      tr('gravityDesc', '0 = dispute insignifiante, 100 = problème très grave'),
      'rgba(245,158,11,0.2)',
      '#f59e0b'
    ));

    // Resolution gauge
    gaugesGrid.appendChild(buildGauge(
      ICONS.wrench,
      '#10b981',
      tr('resolutionPotential', 'Potentiel de résolution'),
      result.resolutionScore || 0,
      tr('resolutionDesc', '100 = facilement résolvable, 0 = nécessite un professionnel'),
      'rgba(16,185,129,0.2)',
      '#10b981'
    ));

    wrap3.appendChild(gaugesGrid);

    // Fault distribution
    if (result.faultScores && result.faultScores.length > 0) {
      var faultSection = el('div', 'space-y-4');
      var faultHeader = el('div', 'flex items-center gap-2');
      var faultIcon = el('span', '');
      faultIcon.innerHTML = ICONS.scale;
      faultIcon.style.color = 'hsl(var(--primary))';
      faultHeader.appendChild(faultIcon);
      var faultTitle = el('h3', 'text-lg font-bold');
      faultTitle.textContent = tr('responsibilityDistribution', 'Répartition des responsabilités');
      faultHeader.appendChild(faultTitle);
      faultSection.appendChild(faultHeader);

      // Horizontal stacked bar
      var barWrap = el('div', 'w-full h-10 rounded-xl overflow-hidden flex');
      barWrap.style.background = 'hsl(var(--muted))';
      result.faultScores.forEach(function(fs, i) {
        var seg = el('div', 'h-full flex items-center justify-center text-white text-sm font-bold transition-all');
        seg.style.cssText = 'width:0%;background:' + FAULT_COLORS[i % FAULT_COLORS.length] + ';';
        if (fs.score > 15) {
          seg.textContent = fs.score + '%';
        }
        barWrap.appendChild(seg);
        // Animate after mount
        setTimeout(function() { seg.style.cssText = 'width:' + fs.score + '%;background:' + FAULT_COLORS[i % FAULT_COLORS.length] + ';transition:width 1s ease-out;'; }, 300 + i * 100);
      });
      faultSection.appendChild(barWrap);

      // Legend
      var legend = el('div', 'flex flex-wrap gap-4 justify-center');
      result.faultScores.forEach(function(fs, i) {
        var item = el('div', 'flex items-center gap-2 text-sm');
        var dot = el('div', 'w-3 h-3 rounded-full');
        dot.style.background = FAULT_COLORS[i % FAULT_COLORS.length];
        item.appendChild(dot);
        var lbl = el('span', '');
        lbl.textContent = fs.name + ' (' + fs.score + '%)';
        item.appendChild(lbl);
        legend.appendChild(item);
      });
      faultSection.appendChild(legend);
      wrap3.appendChild(faultSection);
    }

    // Detailed analysis
    if (result.analysis) {
      var analysisSection = el('div', 'space-y-3');
      var analysisHeader = el('div', 'flex items-center gap-2');
      var analysisIcon = el('span', '');
      analysisIcon.innerHTML = ICONS.target;
      analysisIcon.style.color = 'hsl(var(--primary))';
      analysisHeader.appendChild(analysisIcon);
      var analysisTitle = el('h3', 'text-lg font-bold');
      analysisTitle.textContent = tr('detailedAnalysis', 'Analyse détaillée');
      analysisHeader.appendChild(analysisTitle);
      analysisSection.appendChild(analysisHeader);
      var analysisText = el('p', 'text-muted-foreground leading-relaxed');
      analysisText.style.whiteSpace = 'pre-wrap';
      analysisText.textContent = result.analysis;
      analysisSection.appendChild(analysisText);
      wrap3.appendChild(analysisSection);
    }

    // Improvements
    if (result.improvements && result.improvements.length > 0) {
      var improvSection = el('div', 'space-y-3');
      var improvHeader = el('div', 'flex items-center gap-2');
      var improvIcon = el('span', '');
      improvIcon.innerHTML = ICONS.lightbulb;
      improvIcon.style.color = '#f59e0b';
      improvHeader.appendChild(improvIcon);
      var improvTitle = el('h3', 'text-lg font-bold');
      improvTitle.textContent = tr('improvementAreas', "Pistes d'amélioration");
      improvHeader.appendChild(improvTitle);
      improvSection.appendChild(improvHeader);

      result.improvements.forEach(function(tip, i) {
        var card = el('div', 'flex items-start gap-3 p-4 rounded-xl');
        card.style.background = 'hsl(var(--muted)/0.5)';
        var num = el('div', 'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold');
        num.style.cssText = 'background:hsl(var(--primary)/0.2);color:hsl(var(--primary));';
        num.textContent = i + 1;
        card.appendChild(num);
        var tipText = el('p', 'text-sm text-muted-foreground');
        tipText.textContent = tip;
        card.appendChild(tipText);
        improvSection.appendChild(card);
      });
      wrap3.appendChild(improvSection);
    }

    // Come back tomorrow
    var endBox = el('div', 'rounded-xl p-4 border text-center');
    endBox.style.cssText = 'background:hsl(var(--primary)/0.1);border-color:hsl(var(--primary)/0.2);color:hsl(var(--primary));';
    endBox.innerHTML = '<p class="font-semibold">' + esc(tr('comeBackTomorrow', 'Revenez demain !')) + '</p>';
    wrap3.appendChild(endBox);

    parent.appendChild(wrap3);
  }

  // ─── Build gauge widget ───────────────────────────────────
  function buildGauge(icon, iconColor, label, score, desc, barBg, barColor) {
    var card = el('div', 'rounded-xl p-4 border space-y-3');
    card.style.borderColor = 'hsl(var(--border))';

    var header = el('div', 'flex items-center justify-between');
    var left = el('div', 'flex items-center gap-2');
    var iconEl = el('span', '');
    iconEl.innerHTML = icon;
    iconEl.style.color = iconColor;
    left.appendChild(iconEl);
    var labelEl = el('span', 'text-sm font-semibold');
    labelEl.textContent = label;
    left.appendChild(labelEl);
    header.appendChild(left);
    var scoreEl = el('span', 'text-lg font-bold');
    scoreEl.style.color = iconColor;
    scoreEl.textContent = score + '/100';
    header.appendChild(scoreEl);
    card.appendChild(header);

    // Bar
    var barOuter = el('div', 'w-full h-3 rounded-full overflow-hidden');
    barOuter.style.background = barBg;
    var barInner = el('div', 'h-full rounded-full');
    barInner.style.cssText = 'width:0%;background:' + barColor + ';transition:width 1s ease-out;';
    barOuter.appendChild(barInner);
    card.appendChild(barOuter);
    setTimeout(function() { barInner.style.width = score + '%'; }, 400);

    // Description
    var descEl = el('p', 'text-xs text-muted-foreground');
    descEl.textContent = desc;
    card.appendChild(descEl);

    return card;
  }

  // ─── API call ─────────────────────────────────────────────
  function submitToAI() {
    var payload = {
      title: state.title.trim(),
      context: state.context.trim(),
      persons: state.persons.map(function(p) {
        return { name: p.name.trim(), gender: p.gender, statement: p.statement.trim() };
      })
    };

    fetch(SUPABASE_URL + '/functions/v1/resolve-couple-problem', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'apikey': SUPABASE_KEY
      },
      body: JSON.stringify(payload)
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data.rateLimited) {
        state.rateLimited = true;
        state.step = 'result';
        render();
        return;
      }
      if (data.error && !data.analysis) {
        state.error = data.error;
        state.step = 'result';
        render();
        return;
      }
      state.result = data;
      state.step = 'result';
      render();
    })
    .catch(function(err) {
      state.error = err.message || 'Une erreur est survenue';
      state.step = 'result';
      render();
    });
  }

  // ─── Helpers ──────────────────────────────────────────────
  function el(tag, className) {
    var e = document.createElement(tag);
    if (className) e.className = className;
    return e;
  }

  function esc(str) {
    var d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
  }

  function shake(element) {
    element.style.borderColor = 'hsl(var(--destructive))';
    element.classList.add('animate-shake');
    setTimeout(function() {
      element.classList.remove('animate-shake');
      element.style.borderColor = '';
    }, 600);
  }
})();
