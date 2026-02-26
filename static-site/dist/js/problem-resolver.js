/**
 * Problem Resolver - AI-powered couple problem resolution form
 * Uses Supabase Edge Function for AI analysis
 */
(function() {
  'use strict';

  var container = document.getElementById('problem-resolver-engine');
  if (!container) return;

  var lang = container.dataset.lang || document.documentElement.lang || 'fr';
  var SUPABASE_URL = 'https://nbjpgecedevlmypqisng.supabase.co';
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ianBnZWNlZGV2bG15cHFpc25nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNDk3MjgsImV4cCI6MjA4NDgyNTcyOH0.agwrq1lrAKP8Vc-Y349H3RxEZhEgsDj21cG1luw9AXs';

  var labels = {
    fr: {
      title: 'Décrivez votre problème',
      placeholder: 'Expliquez la situation que vous traversez en couple... Soyez aussi précis que possible pour obtenir des conseils personnalisés.',
      duration: 'Depuis combien de temps ?',
      durationOpts: ['Moins d\'un mois', '1-6 mois', '6-12 mois', 'Plus d\'un an'],
      severity: 'Niveau de gravité ressenti',
      severityOpts: ['Léger', 'Modéré', 'Important', 'Critique'],
      submit: 'Obtenir des conseils',
      loading: 'Analyse en cours...',
      error: 'Une erreur est survenue. Veuillez réessayer.',
      restart: 'Nouveau problème',
      disclaimer: 'Cet outil ne remplace pas un avis professionnel. En cas de danger, contactez le 3919.',
      minChars: 'Minimum 30 caractères'
    },
    en: {
      title: 'Describe your problem',
      placeholder: 'Explain the situation you are going through as a couple... Be as specific as possible to get personalized advice.',
      duration: 'How long has this been going on?',
      durationOpts: ['Less than a month', '1-6 months', '6-12 months', 'More than a year'],
      severity: 'Perceived severity level',
      severityOpts: ['Mild', 'Moderate', 'Significant', 'Critical'],
      submit: 'Get advice',
      loading: 'Analyzing...',
      error: 'An error occurred. Please try again.',
      restart: 'New problem',
      disclaimer: 'This tool does not replace professional advice. If you are in danger, contact emergency services.',
      minChars: 'Minimum 30 characters'
    },
    es: {
      title: 'Describe tu problema',
      placeholder: 'Explica la situación que estás atravesando en pareja...',
      duration: '¿Desde cuándo?',
      durationOpts: ['Menos de un mes', '1-6 meses', '6-12 meses', 'Más de un año'],
      severity: 'Nivel de gravedad',
      severityOpts: ['Leve', 'Moderado', 'Importante', 'Crítico'],
      submit: 'Obtener consejos',
      loading: 'Analizando...',
      error: 'Ha ocurrido un error. Por favor, inténtelo de nuevo.',
      restart: 'Nuevo problema',
      disclaimer: 'Esta herramienta no reemplaza el consejo profesional.',
      minChars: 'Mínimo 30 caracteres'
    },
    de: {
      title: 'Beschreiben Sie Ihr Problem',
      placeholder: 'Erklären Sie die Situation, die Sie als Paar durchmachen...',
      duration: 'Seit wann?',
      durationOpts: ['Weniger als einen Monat', '1-6 Monate', '6-12 Monate', 'Mehr als ein Jahr'],
      severity: 'Schweregrad',
      severityOpts: ['Leicht', 'Mäßig', 'Erheblich', 'Kritisch'],
      submit: 'Ratschläge erhalten',
      loading: 'Analyse läuft...',
      error: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.',
      restart: 'Neues Problem',
      disclaimer: 'Dieses Tool ersetzt keine professionelle Beratung.',
      minChars: 'Mindestens 30 Zeichen'
    },
    it: {
      title: 'Descrivi il tuo problema',
      placeholder: 'Spiega la situazione che stai attraversando come coppia...',
      duration: 'Da quanto tempo?',
      durationOpts: ['Meno di un mese', '1-6 mesi', '6-12 mesi', 'Più di un anno'],
      severity: 'Livello di gravità',
      severityOpts: ['Lieve', 'Moderato', 'Importante', 'Critico'],
      submit: 'Ottieni consigli',
      loading: 'Analisi in corso...',
      error: 'Si è verificato un errore. Per favore riprova.',
      restart: 'Nuovo problema',
      disclaimer: 'Questo strumento non sostituisce il parere professionale.',
      minChars: 'Minimo 30 caratteri'
    }
  };

  var t = labels[lang] || labels.fr;
  renderForm();

  function renderForm() {
    container.innerHTML = '';

    var form = document.createElement('div');
    form.className = 'space-y-6';

    // Problem description
    form.innerHTML = '<h2 class="text-xl font-bold mb-2">' + esc(t.title) + '</h2>';

    var textarea = document.createElement('textarea');
    textarea.className = 'textarea w-full';
    textarea.rows = 6;
    textarea.placeholder = t.placeholder;
    textarea.minLength = 30;
    textarea.maxLength = 2000;
    form.appendChild(textarea);

    var charCount = document.createElement('p');
    charCount.className = 'text-xs text-muted-foreground text-right';
    charCount.textContent = '0/2000 (' + t.minChars + ')';
    textarea.addEventListener('input', function() {
      charCount.textContent = textarea.value.length + '/2000' + (textarea.value.length < 30 ? ' (' + t.minChars + ')' : '');
    });
    form.appendChild(charCount);

    // Duration selector
    var durationWrap = document.createElement('div');
    durationWrap.innerHTML = '<label class="block text-sm font-medium mb-2">' + esc(t.duration) + '</label>';
    var durationSelect = document.createElement('select');
    durationSelect.className = 'input w-full';
    t.durationOpts.forEach(function(opt, i) {
      var option = document.createElement('option');
      option.value = i;
      option.textContent = opt;
      durationSelect.appendChild(option);
    });
    durationWrap.appendChild(durationSelect);
    form.appendChild(durationWrap);

    // Severity selector
    var severityWrap = document.createElement('div');
    severityWrap.innerHTML = '<label class="block text-sm font-medium mb-2">' + esc(t.severity) + '</label>';
    var severityBtns = document.createElement('div');
    severityBtns.className = 'flex gap-2 flex-wrap';
    var selectedSeverity = 1;
    t.severityOpts.forEach(function(opt, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn ' + (i === 1 ? 'btn-primary' : 'btn-outline') + ' text-sm';
      btn.textContent = opt;
      btn.addEventListener('click', function() {
        selectedSeverity = i;
        severityBtns.querySelectorAll('button').forEach(function(b, j) {
          b.className = 'btn ' + (j === i ? 'btn-primary' : 'btn-outline') + ' text-sm';
        });
      });
      severityBtns.appendChild(btn);
    });
    severityWrap.appendChild(severityBtns);
    form.appendChild(severityWrap);

    // Submit button
    var submitBtn = document.createElement('button');
    submitBtn.className = 'btn btn-cta w-full';
    submitBtn.textContent = t.submit;
    submitBtn.addEventListener('click', function() {
      var text = textarea.value.trim();
      if (text.length < 30) {
        textarea.style.borderColor = 'hsl(var(--destructive))';
        return;
      }
      submitBtn.disabled = true;
      submitBtn.textContent = t.loading;
      submitBtn.className = 'btn btn-outline w-full opacity-60';

      analyzeProblems(text, selectedSeverity, parseInt(durationSelect.value))
        .then(function(result) { renderResult(result); })
        .catch(function() { renderError(); });
    });
    form.appendChild(submitBtn);

    // Disclaimer
    var disclaimer = document.createElement('p');
    disclaimer.className = 'text-xs text-muted-foreground text-center mt-4';
    disclaimer.textContent = t.disclaimer;
    form.appendChild(disclaimer);

    container.appendChild(form);
  }

  function analyzeProblems(text, severity, duration) {
    return fetch(SUPABASE_URL + '/functions/v1/problem-resolver', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'apikey': SUPABASE_KEY
      },
      body: JSON.stringify({
        problem: text,
        severity: severity,
        duration: duration,
        language: lang
      })
    })
    .then(function(res) {
      if (!res.ok) throw new Error('API error');
      return res.json();
    });
  }

  function renderResult(result) {
    container.innerHTML = '';
    var wrap = document.createElement('div');
    wrap.className = 'space-y-6 animate-fade-in';

    var content = result.analysis || result.response || result.advice || '';
    if (typeof content === 'string' && content.length > 0) {
      var article = document.createElement('article');
      article.className = 'prose prose-lg dark:prose-invert max-w-none';
      // Simple markdown-like rendering
      article.innerHTML = content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');
      if (!article.innerHTML.startsWith('<p>')) article.innerHTML = '<p>' + article.innerHTML + '</p>';
      wrap.appendChild(article);
    }

    var restartBtn = document.createElement('button');
    restartBtn.className = 'btn btn-outline w-full mt-4';
    restartBtn.textContent = t.restart;
    restartBtn.addEventListener('click', renderForm);
    wrap.appendChild(restartBtn);

    container.appendChild(wrap);
  }

  function renderError() {
    container.innerHTML = '';
    var wrap = document.createElement('div');
    wrap.className = 'text-center py-8 animate-fade-in';
    wrap.innerHTML = '<p class="text-destructive mb-4">' + esc(t.error) + '</p>';
    var btn = document.createElement('button');
    btn.className = 'btn btn-outline';
    btn.textContent = t.restart;
    btn.addEventListener('click', renderForm);
    wrap.appendChild(btn);
    container.appendChild(wrap);
  }

  function esc(str) {
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }
})();
