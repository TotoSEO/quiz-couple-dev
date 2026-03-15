/**
 * Annuaire — Multi-step registration form
 * Handles: step navigation, validation, char counters, recap,
 *          Supabase auth registration, profile creation, photo upload
 *          Bubble selectors for methods (specialty-specific) and languages
 *          Address autocomplete via OpenStreetMap Nominatim
 */
(function () {
  'use strict';

  var SUPABASE_URL = 'https://lojvajnnvhatfplevyvy.supabase.co';
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvanZham5udmhhdGZwbGV2eXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNzk3NDIsImV4cCI6MjA4Nzg1NTc0Mn0.gdd9HRbRvfQr6io9jGN6hUCW6tBOtognhwbsTJtSTng';

  // ── Rich Text Editor helper ──
  function initRichTextEditorRejoindre(toolbarId, editorId, textareaId, countId) {
    var toolbar = document.getElementById(toolbarId);
    var editor = document.getElementById(editorId);
    var textarea = document.getElementById(textareaId);
    if (!toolbar || !editor) return;

    toolbar.querySelectorAll('.ann-rte-btn').forEach(function (btn) {
      btn.addEventListener('mousedown', function (e) { e.preventDefault(); });
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var cmd = btn.getAttribute('data-cmd');
        if (cmd === 'insertTable') {
          if (editor.querySelector('table')) { alert('Un seul tableau est autorise par description.'); return; }
          var cols = prompt('Nombre de colonnes (2 a 5) :', '3');
          cols = parseInt(cols, 10);
          if (isNaN(cols) || cols < 2) cols = 2;
          if (cols > 5) cols = 5;
          var rows = prompt('Nombre de lignes (2 a 10) :', '3');
          rows = parseInt(rows, 10);
          if (isNaN(rows) || rows < 2) rows = 2;
          if (rows > 10) rows = 10;
          var html = '<table><thead><tr>';
          for (var c = 0; c < cols; c++) html += '<th>En-tete</th>';
          html += '</tr></thead><tbody>';
          for (var r = 0; r < rows - 1; r++) { html += '<tr>'; for (var c2 = 0; c2 < cols; c2++) html += '<td>...</td>'; html += '</tr>'; }
          html += '</tbody></table><p><br></p>';
          document.execCommand('insertHTML', false, html);
        } else {
          document.execCommand(cmd, false, null);
        }
        editor.focus();
        updateCount();
      });
    });

    function updateCount() {
      var count = (editor.textContent || '').length;
      var countEl = document.getElementById(countId);
      if (countEl) countEl.textContent = count;
      if (textarea) textarea.value = editor.innerHTML.trim();
    }

    editor.addEventListener('input', updateCount);
    editor.addEventListener('blur', updateCount);
    editor.addEventListener('paste', function (e) {
      e.preventDefault();
      var text = (e.clipboardData || window.clipboardData).getData('text/plain');
      document.execCommand('insertText', false, text);
    });
  }

  var form = document.getElementById('rejoindre-form');
  if (!form) return;

  // ── Redirect logged-in users to dashboard ──
  (function () {
    var authKey = 'sb-lojvajnnvhatfplevyvy-auth-token';
    var raw = localStorage.getItem(authKey);
    if (!raw) return;
    try {
      var data = JSON.parse(raw);
      if (data && data.access_token) {
        window.location.href = '/dashboard/';
      }
    } catch (e) { /* not logged in */ }
  })();

  // ── Specialty-specific methods (same as dashboard) ──
  var METHODS_BY_SPECIALTY = {
    'therapeute-de-couple': [
      'Thérapie systémique', 'TCC', 'EFT (Thérapie centrée sur les émotions)',
      'Méthode Gottman', 'Approche Imago', 'Psychanalyse', 'Thérapie narrative',
      'Thérapie brève', 'EMDR', 'Pleine conscience', 'Médiation conjugale',
      'Analyse transactionnelle',
    ],
    'sexologue': [
      'Sexocorporel', 'TCC', 'Pleine conscience', 'Hypnose', 'Sophrologie',
      'Approche psychodynamique', 'Sensate focus', 'EMDR', 'Thérapie de couple',
      'Sexoanalyse',
    ],
    'sexotherapeute': [
      'Sexocorporel', 'TCC', 'Pleine conscience', 'Hypnose', 'Sophrologie',
      'EMDR', 'Approche corporelle', 'Thérapie psychosexuelle', 'Sensate focus',
      'Relaxation psychosomatique',
    ],
    'mediateur-familial': [
      'Médiation familiale', 'Médiation transformative', 'Médiation intégrative',
      'Approche systémique', 'Communication non-violente (CNV)',
      'Négociation raisonnée', 'Médiation narrative', 'Droit collaboratif',
    ],
    'coach-parental': [
      'Discipline positive', 'Communication non-violente (CNV)', 'Approche Montessori',
      'Parentalité bienveillante', 'Coaching systémique', 'PNL',
      'Gestion des émotions', 'Faber et Mazlish', 'Parentalité Filliozat',
    ],
    'conseiller-conjugal': [
      'Écoute active', 'Communication non-violente (CNV)', 'Approche systémique',
      'TCC', 'Thérapie brève', 'Analyse transactionnelle', 'Counseling',
      'Approche humaniste', 'Médiation conjugale',
    ],
  };

  var LANGUAGES = [
    'Français', 'Anglais', 'Espagnol', 'Allemand', 'Italien', 'Portugais',
    'Arabe', 'Chinois (Mandarin)', 'Russe', 'Turc', 'Japonais', 'Coréen',
    'Néerlandais', 'Polonais', 'Roumain', 'Hindi',
    'Langue des signes française (LSF)',
  ];

  var METHODS_LIMIT = 3; // free plan limit at registration

  var TOTAL_STEPS = 5;
  var currentStep = 1;
  var steps = form.querySelectorAll('[data-form-step]');
  var progressSteps = document.querySelectorAll('.ann-progress-step');
  var progressFill = document.getElementById('progress-fill');
  var btnPrev = document.getElementById('btn-prev');
  var btnNext = document.getElementById('btn-next');
  var btnSubmit = document.getElementById('btn-submit');
  var formSuccess = document.getElementById('form-success');

  // ── Supabase init ──────────────────────────────────────────────
  var supabase = null;
  function initSupabase() {
    if (supabase) return;
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }
  }

  function waitForSupabase(timeout) {
    return new Promise(function (resolve) {
      initSupabase();
      if (supabase) return resolve(true);
      var elapsed = 0;
      var interval = setInterval(function () {
        initSupabase();
        elapsed += 200;
        if (supabase || elapsed >= timeout) {
          clearInterval(interval);
          resolve(!!supabase);
        }
      }, 200);
    });
  }

  // ── Char Counters ────────────────────────────────────────────────
  var counters = [
    { input: 'f-prenom', counter: 'count-prenom' },
    { input: 'f-nom', counter: 'count-nom' },
    { input: 'f-titre', counter: 'count-titre' },
    { input: 'f-cabinet', counter: 'count-cabinet' },
  ];

  counters.forEach(function (c) {
    var input = document.getElementById(c.input);
    var counter = document.getElementById(c.counter);
    if (!input || !counter) return;

    function update() { counter.textContent = input.value.length; }
    input.addEventListener('input', update);
    update();
  });

  // ── Short description counter ──
  (function() {
    var input = document.getElementById('f-short-description');
    var counter = document.getElementById('f-short-desc-counter');
    if (!input || !counter) return;
    function update() {
      var len = input.value.length;
      counter.textContent = len + '/165';
      counter.style.color = len > 155 ? 'hsl(0 70% 50%)' : '';
    }
    input.addEventListener('input', update);
    input.addEventListener('paste', function() {
      var el = this;
      setTimeout(function() { if (el.value.length > 165) el.value = el.value.slice(0, 165); update(); }, 0);
    });
  })();

  // ── Rich Text Editor (registration) ──
  initRichTextEditorRejoindre('f-desc-toolbar', 'f-description-editor', 'f-description', 'count-description');

  // ── Limit digit count on numeric inputs ────────────────────────
  function limitDigits(inputId, maxDigits) {
    var el = document.getElementById(inputId);
    if (!el) return;
    el.addEventListener('keydown', function (e) {
      // Allow: backspace, delete, tab, escape, enter, arrows, home, end
      if ([8, 9, 13, 27, 35, 36, 37, 38, 39, 40, 46].indexOf(e.keyCode) !== -1) return;
      // Allow Ctrl/Cmd+A/C/V/X
      if ((e.ctrlKey || e.metaKey) && [65, 67, 86, 88].indexOf(e.keyCode) !== -1) return;
      // Block non-digit keys
      var isDigit = (e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105);
      if (!isDigit) { e.preventDefault(); return; }
      // Block if already at max digits
      var val = el.value.replace(/[^0-9]/g, '');
      if (val.length >= maxDigits) { e.preventDefault(); }
    });
    el.addEventListener('input', function () {
      // Truncate on paste or any other input that bypasses keydown
      var digits = el.value.replace(/[^0-9]/g, '');
      if (digits.length > maxDigits) {
        el.value = digits.slice(0, maxDigits);
      }
    });
  }
  limitDigits('f-prix-min', 4);
  limitDigits('f-prix-max', 4);
  limitDigits('f-experience', 2);

  // ── Bubble builder (shared for methods & languages) ────────────
  function buildBubbles(container, items, nameAttr, selectedValues, maxSelect) {
    if (!container) return;
    container.innerHTML = '';
    items.forEach(function (item) {
      var label = document.createElement('label');
      label.className = 'ann-method-option';
      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.name = nameAttr;
      cb.value = item;
      cb.className = 'ann-sr-only';
      if (selectedValues && selectedValues.indexOf(item) !== -1) cb.checked = true;
      var tag = document.createElement('span');
      tag.className = 'ann-method-tag';
      if (cb.checked) tag.classList.add('selected');
      tag.textContent = item;
      label.appendChild(cb);
      label.appendChild(tag);
      container.appendChild(label);

      cb.addEventListener('change', function () {
        if (maxSelect && cb.checked) {
          var checked = container.querySelectorAll('input:checked');
          if (checked.length > maxSelect) {
            cb.checked = false;
            return;
          }
        }
        tag.classList.toggle('selected', cb.checked);
      });
    });
  }

  function getSelectedBubbles(container) {
    var values = [];
    if (!container) return values;
    container.querySelectorAll('input:checked').forEach(function (cb) {
      values.push(cb.value);
    });
    return values;
  }

  // ── Specialty Selection (max 2, ordered) ────────────────────────
  var specSelector = document.getElementById('specialty-selector');
  var specOrder = []; // tracks selection order by value
  var methodsContainer = document.getElementById('methods-selector');

  function updateSpecBadges() {
    specSelector.querySelectorAll('.ann-specialty-option').forEach(function (opt) {
      var cb = opt.querySelector('input');
      var existing = opt.querySelector('.ann-spec-order');
      if (existing) existing.remove();

      opt.classList.toggle('selected', cb.checked);

      if (cb.checked) {
        var idx = specOrder.indexOf(cb.value);
        if (idx !== -1) {
          var badge = document.createElement('span');
          badge.className = 'ann-spec-order';
          badge.textContent = idx + 1;
          badge.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;width:1.25rem;height:1.25rem;border-radius:50%;background:hsl(var(--ann-primary));color:white;font-size:0.7rem;font-weight:700;margin-left:auto;flex-shrink:0;';
          opt.appendChild(badge);
        }
      }
    });
  }

  function rebuildMethods() {
    var primary = specOrder.length ? specOrder[0] : null;
    var methods = primary && METHODS_BY_SPECIALTY[primary] ? METHODS_BY_SPECIALTY[primary] : [];
    var currentSelected = getSelectedBubbles(methodsContainer);
    buildBubbles(methodsContainer, methods, 'methodes', currentSelected, METHODS_LIMIT);
  }

  if (specSelector) {
    specSelector.addEventListener('change', function (e) {
      if (!e.target.matches('input[type="checkbox"]')) return;

      if (e.target.checked) {
        if (specOrder.length >= 2) {
          e.target.checked = false;
          return;
        }
        specOrder.push(e.target.value);
      } else {
        var removeIdx = specOrder.indexOf(e.target.value);
        if (removeIdx !== -1) specOrder.splice(removeIdx, 1);
      }

      updateSpecBadges();
      clearError('err-specialites');
      rebuildMethods();
    });
  }

  // ── Build languages bubbles ────────────────────────────────────
  var languesContainer = document.getElementById('langues-selector');
  buildBubbles(languesContainer, LANGUAGES, 'langues', ['Français'], null);

  // ── Consultation Mode Toggle ─────────────────────────────────────
  document.querySelectorAll('.ann-consult-option input').forEach(function (cb) {
    cb.addEventListener('change', function () {
      cb.closest('.ann-consult-option').querySelector('.ann-consult-card').classList.toggle('selected', cb.checked);
      clearError('err-modes');
    });
  });

  // ── Radio Toggle ─────────────────────────────────────────────────
  document.querySelectorAll('.ann-toggle-option input').forEach(function (radio) {
    radio.addEventListener('change', function () {
      radio.closest('.ann-toggle-group').querySelectorAll('.ann-toggle-btn').forEach(function (btn) {
        btn.classList.remove('selected');
      });
      radio.closest('.ann-toggle-option').querySelector('.ann-toggle-btn').classList.add('selected');
    });
    if (radio.checked) {
      radio.closest('.ann-toggle-option').querySelector('.ann-toggle-btn').classList.add('selected');
    }
  });

  // ── Checkbox visual toggle ───────────────────────────────────────
  var consentCb = document.getElementById('f-consent');
  if (consentCb) {
    consentCb.addEventListener('change', function () {
      consentCb.closest('.ann-checkbox-label').classList.toggle('checked', consentCb.checked);
      clearError('err-consent');
    });
  }

  // ── Address Autocomplete (OpenStreetMap Nominatim) ─────────────
  (function () {
    var addrInput = document.getElementById('f-adresse');
    var sugBox = document.getElementById('f-adresse-suggestions');
    if (!addrInput || !sugBox) return;
    var debounceTimer = null;

    addrInput.addEventListener('input', function () {
      clearTimeout(debounceTimer);
      var q = addrInput.value.trim();
      if (q.length < 4) { sugBox.style.display = 'none'; return; }
      debounceTimer = setTimeout(function () {
        fetch('https://nominatim.openstreetmap.org/search?format=json&countrycodes=fr&limit=5&q=' + encodeURIComponent(q), {
          headers: { 'Accept-Language': 'fr' }
        })
          .then(function (r) { return r.json(); })
          .then(function (results) {
            sugBox.innerHTML = '';
            if (!results.length) { sugBox.style.display = 'none'; return; }
            results.forEach(function (r) {
              var div = document.createElement('div');
              div.textContent = r.display_name;
              div.style.cssText = 'padding:0.625rem 0.75rem;cursor:pointer;font-size:0.875rem;border-bottom:1px solid hsl(var(--ann-border)/0.5);';
              div.addEventListener('mouseenter', function () { div.style.background = 'hsl(var(--ann-muted)/0.5)'; });
              div.addEventListener('mouseleave', function () { div.style.background = ''; });
              div.addEventListener('mousedown', function (e) {
                e.preventDefault();
                // Simplify address: keep only the first 2-3 meaningful parts
                var parts = r.display_name.split(', ');
                var simplified = parts.slice(0, 3).join(', ');
                addrInput.value = simplified;
                // Capture lat/lng from Nominatim result
                var latInput = document.getElementById('f-lat');
                var lngInput = document.getElementById('f-lng');
                if (latInput && r.lat) latInput.value = r.lat;
                if (lngInput && r.lon) lngInput.value = r.lon;
                sugBox.style.display = 'none';
              });
              sugBox.appendChild(div);
            });
            sugBox.style.display = 'block';
          })
          .catch(function () { sugBox.style.display = 'none'; });
      }, 350);
    });

    addrInput.addEventListener('blur', function () {
      setTimeout(function () { sugBox.style.display = 'none'; }, 200);
    });
  })();

  // ── Validation ───────────────────────────────────────────────────
  function showError(id, msg) {
    var el = document.getElementById(id);
    if (el) {
      el.textContent = msg;
      el.classList.add('visible');
    }
  }

  function clearError(id) {
    var el = document.getElementById(id);
    if (el) {
      el.textContent = '';
      el.classList.remove('visible');
    }
  }

  function clearAllErrors() {
    form.querySelectorAll('.ann-field-error').forEach(function (el) {
      el.textContent = '';
      el.classList.remove('visible');
    });
  }

  function val(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function validateStep(step) {
    clearAllErrors();
    var valid = true;

    if (step === 1) {
      if (!val('f-prenom')) { showError('err-prenom', 'Le prénom est requis'); valid = false; }
      if (!val('f-nom')) { showError('err-nom', 'Le nom est requis'); valid = false; }
      var email = val('f-email');
      if (!email) { showError('err-email', 'L\'email est requis'); valid = false; }
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showError('err-email', 'Email invalide'); valid = false; }
      if (!val('f-telephone')) { showError('err-telephone', 'Le téléphone est requis'); valid = false; }
      var pw = val('f-password');
      if (!pw) { showError('err-password', 'Le mot de passe est requis'); valid = false; }
      else if (pw.length < 10) { showError('err-password', 'Minimum 10 caractères'); valid = false; }
      else if (!/[A-Z]/.test(pw)) { showError('err-password', 'Le mot de passe doit contenir au moins une majuscule'); valid = false; }
      else if (!/[^a-zA-Z0-9]/.test(pw)) { showError('err-password', 'Le mot de passe doit contenir au moins un caractère spécial'); valid = false; }
      var pw2 = val('f-password2');
      if (!pw2) { showError('err-password2', 'Confirmez le mot de passe'); valid = false; }
      else if (pw !== pw2) { showError('err-password2', 'Les mots de passe ne correspondent pas'); valid = false; }
    }

    if (step === 2) {
      var specChecked = form.querySelectorAll('input[name="specialites"]:checked');
      if (specChecked.length === 0) { showError('err-specialites', 'Sélectionnez au moins une spécialité'); valid = false; }
      if (!val('f-titre')) { showError('err-titre', 'Le titre est requis'); valid = false; }
      var exp = val('f-experience');
      if (!exp) { showError('err-experience', 'Les années d\'expérience sont requises'); valid = false; }
      else if (Number(exp) < 0 || Number(exp) > 50) { showError('err-experience', 'Valeur entre 0 et 50'); valid = false; }
    }

    if (step === 3) {
      if (!val('f-adresse')) { showError('err-adresse', 'L\'adresse est requise'); valid = false; }
      var cp = val('f-codepostal');
      if (!cp) { showError('err-codepostal', 'Le code postal est requis'); valid = false; }
      else if (!/^[0-9]{5}$/.test(cp)) { showError('err-codepostal', 'Code postal invalide (5 chiffres)'); valid = false; }
      if (!val('f-ville')) { showError('err-ville', 'La ville est requise'); valid = false; }
      var modesChecked = form.querySelectorAll('input[name="modes"]:checked');
      if (modesChecked.length === 0) { showError('err-modes', 'Sélectionnez au moins un mode'); valid = false; }
    }

    if (step === 4) {
      // Short description
      var shortDesc = val('f-short-description').trim();
      if (!shortDesc) { showError('err-short-description', 'La description courte est requise'); valid = false; }
      else if (shortDesc.length < 20) { showError('err-short-description', 'Minimum 20 caractères'); valid = false; }
      else if (shortDesc.length > 165) { showError('err-short-description', 'Maximum 165 caractères'); valid = false; }

      // Sync rich text editor to hidden textarea
      var descEditorEl = document.getElementById('f-description-editor');
      var descTextareaEl = document.getElementById('f-description');
      if (descEditorEl && descTextareaEl) descTextareaEl.value = descEditorEl.innerHTML.trim();
      var descText = descEditorEl ? (descEditorEl.textContent || '').trim() : val('f-description');
      if (!descText) { showError('err-description', 'La description est requise'); valid = false; }
      else if (descText.length < 50) { showError('err-description', 'Minimum 50 caractères (' + descText.length + '/50)'); valid = false; }
      var pmin = val('f-prix-min');
      var pmax = val('f-prix-max');
      if (!pmin) { showError('err-prix-min', 'Requis'); valid = false; }
      else if (Number(pmin) < 0 || !Number.isInteger(Number(pmin))) { showError('err-prix-min', 'Nombre entier positif requis'); valid = false; }
      else if (Number(pmin) > 9999) { showError('err-prix-min', 'Maximum 9999'); valid = false; }
      if (!pmax) { showError('err-prix-max', 'Requis'); valid = false; }
      else if (Number(pmax) < 0 || !Number.isInteger(Number(pmax))) { showError('err-prix-max', 'Nombre entier positif requis'); valid = false; }
      else if (Number(pmax) > 9999) { showError('err-prix-max', 'Maximum 9999'); valid = false; }
      if (pmin && pmax && Number(pmax) <= Number(pmin)) { showError('err-prix-max', 'Doit être supérieur au tarif min'); valid = false; }
    }

    if (step === 5) {
      if (!document.getElementById('f-consent').checked) { showError('err-consent', 'Vous devez accepter les conditions'); valid = false; }
    }

    return valid;
  }

  // ── Navigation ───────────────────────────────────────────────────
  function goToStep(step) {
    if (step < 1 || step > TOTAL_STEPS) return;

    var currentEl = form.querySelector('[data-form-step="' + currentStep + '"]');
    if (currentEl) {
      currentEl.classList.remove('active');
      currentEl.classList.add('exit');
      setTimeout(function () { currentEl.classList.remove('exit'); }, 300);
    }

    currentStep = step;

    setTimeout(function () {
      var nextEl = form.querySelector('[data-form-step="' + step + '"]');
      if (nextEl) nextEl.classList.add('active');
      updateProgress();
      var formRect = form.getBoundingClientRect();
      if (formRect.top < 0) {
        window.scrollTo({ top: window.scrollY + formRect.top - 100, behavior: 'smooth' });
      }
    }, 150);

    if (step === 5) buildRecap();
  }

  function updateProgress() {
    var pct = ((currentStep - 1) / (TOTAL_STEPS - 1)) * 100;
    if (progressFill) progressFill.style.width = pct + '%';

    progressSteps.forEach(function (el) {
      var s = parseInt(el.getAttribute('data-step'), 10);
      el.classList.toggle('active', s === currentStep);
      el.classList.toggle('completed', s < currentStep);
    });

    btnPrev.style.display = currentStep > 1 ? '' : 'none';
    btnNext.style.display = currentStep < TOTAL_STEPS ? '' : 'none';
    btnSubmit.style.display = currentStep === TOTAL_STEPS ? '' : 'none';
  }

  btnNext.addEventListener('click', function () {
    if (validateStep(currentStep)) {
      goToStep(currentStep + 1);
    } else {
      var firstErr = form.querySelector('.ann-field-error.visible');
      if (firstErr) {
        var group = firstErr.closest('.ann-form-group');
        if (group) {
          group.classList.add('ann-shake');
          setTimeout(function () { group.classList.remove('ann-shake'); }, 500);
        }
      }
    }
  });

  btnPrev.addEventListener('click', function () {
    clearAllErrors();
    goToStep(currentStep - 1);
  });

  progressSteps.forEach(function (el) {
    el.addEventListener('click', function () {
      var target = parseInt(el.getAttribute('data-step'), 10);
      if (target < currentStep) {
        clearAllErrors();
        goToStep(target);
      }
    });
  });

  // ── Build Recap ──────────────────────────────────────────────────
  function buildRecap() {
    setText('recap-nom', val('f-prenom') + ' ' + val('f-nom'));
    setText('recap-email', val('f-email'));
    setText('recap-telephone', val('f-telephone'));

    var specs = [];
    var orderedValues = specOrder.length ? specOrder : [];
    if (orderedValues.length) {
      orderedValues.forEach(function (v, i) {
        var cb = specSelector.querySelector('input[value="' + v + '"]');
        if (cb) {
          var label = cb.closest('.ann-specialty-option');
          if (label) {
            var name = label.querySelector('.ann-specialty-name').textContent;
            specs.push(i === 0 ? name + ' (principale)' : name);
          }
        }
      });
    } else {
      form.querySelectorAll('input[name="specialites"]:checked').forEach(function (cb) {
        var label = cb.closest('.ann-specialty-option');
        if (label) specs.push(label.querySelector('.ann-specialty-name').textContent);
      });
    }
    setText('recap-specialites', specs.join(', ') || '—');

    setText('recap-titre', val('f-titre'));

    var methods = getSelectedBubbles(methodsContainer);
    setText('recap-methodes', methods.length ? methods.join(', ') : 'Non renseigné');

    var exp = val('f-experience');
    setText('recap-experience', exp ? exp + ' an' + (Number(exp) > 1 ? 's' : '') : '—');

    var cabinetVal = val('f-cabinet');
    var cabinetRow = document.getElementById('recap-cabinet-row');
    if (cabinetVal && cabinetRow) {
      cabinetRow.style.display = '';
      setText('recap-cabinet', cabinetVal);
    } else if (cabinetRow) {
      cabinetRow.style.display = 'none';
    }

    // City: get the selected option text
    var villeSelect = document.getElementById('f-ville');
    var villeName = villeSelect && villeSelect.selectedIndex > 0 ? villeSelect.options[villeSelect.selectedIndex].text : '—';
    setText('recap-adresse', val('f-adresse') + ', ' + val('f-codepostal') + ' ' + villeName);

    var modes = [];
    form.querySelectorAll('input[name="modes"]:checked').forEach(function (cb) {
      var map = { 'cabinet': 'En cabinet', 'en-ligne': 'En ligne', 'domicile': 'À domicile' };
      modes.push(map[cb.value] || cb.value);
    });
    setText('recap-modes', modes.join(', ') || '—');

    var pmin = val('f-prix-min');
    var pmax = val('f-prix-max');
    setText('recap-tarifs', pmin && pmax ? pmin + '€ - ' + pmax + '€ / séance' : '—');

    var rdv = form.querySelector('input[name="rdv_gratuit"]:checked');
    setText('recap-rdv', rdv && rdv.value === 'oui' ? 'Oui' : 'Non');

    var langues = getSelectedBubbles(languesContainer);
    setText('recap-langues', langues.length ? langues.join(', ') : 'Non renseigné');

    var recapDescEditor = document.getElementById('f-description-editor');
    setText('recap-description', recapDescEditor ? (recapDescEditor.textContent || '') : val('f-description'));
  }

  function setText(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  // ── Submit: Supabase auth + profile creation ─────────────────────
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (!validateStep(5)) return;

    // Wait for Supabase SDK to load (up to 5s)
    var sbReady = await waitForSupabase(5000);
    if (!sbReady) {
      showError('err-consent', 'Le service de connexion n\'a pas pu être chargé. Vérifiez votre connexion internet et rechargez la page.');
      return;
    }

    var submitBtn = document.getElementById('btn-submit');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<svg class="ann-spinner" viewBox="0 0 24 24" style="width:1rem;height:1rem;animation:spin 1s linear infinite"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="30 70" stroke-linecap="round"/></svg> Création du compte...';

    try {
      // ── 1. Collect all profile data first ──
      var email = val('f-email');
      var password = val('f-password');

      // Collect specialties in selection order (first = primary)
      var specialties = specOrder.length ? specOrder.slice() : [];
      if (!specialties.length) {
        form.querySelectorAll('input[name="specialites"]:checked').forEach(function (cb) {
          specialties.push(cb.value);
        });
      }

      // Collect methods from bubble selector
      var methods = getSelectedBubbles(methodsContainer);

      // Collect languages from bubble selector
      var languages = getSelectedBubbles(languesContainer);

      var pmin = val('f-prix-min');
      var pmax = val('f-prix-max');

      // Sync editor to textarea before reading
      var subDescEditor = document.getElementById('f-description-editor');
      var subDescTextarea = document.getElementById('f-description');
      if (subDescEditor && subDescTextarea) subDescTextarea.value = subDescEditor.innerHTML.trim();

      var profileData = {
        first_name: val('f-prenom'),
        last_name: val('f-nom'),
        email: email,
        phone: val('f-telephone'),
        specialty: specialties[0] || '',
        city: val('f-ville'),
        short_description: val('f-short-description').slice(0, 165).trim(),
        description: val('f-description'),
        methods: methods,
        languages: languages.length ? languages : ['Français'],
        years_experience: parseInt(val('f-experience'), 10) || 0,
        price_range: pmin && pmax ? pmin + '€ - ' + pmax + '€' : '',
        address: val('f-adresse') + ', ' + val('f-codepostal') + ' ' + (function () {
          var vs = document.getElementById('f-ville');
          return vs && vs.selectedIndex > 0 ? vs.options[vs.selectedIndex].text.replace(/\s*\(.*\)$/, '') : '';
        })(),
        availability: (function () {
          var modes = [];
          form.querySelectorAll('input[name="modes"]:checked').forEach(function (cb) {
            var map = { 'cabinet': 'En cabinet', 'en-ligne': 'En ligne', 'domicile': 'À domicile' };
            modes.push(map[cb.value] || cb.value);
          });
          return modes.join(', ') || 'Sur rendez-vous';
        })(),
        lat: parseFloat(val('f-lat')) || null,
        lng: parseFloat(val('f-lng')) || null,
        is_published: false,
      };

      // ── 2. Register auth account (store profile in user_metadata) ──
      var authResult = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            annuaire_profile: profileData,
            has_pending_profile: true,
          },
          emailRedirectTo: window.location.origin + '/dashboard/',
        },
      });

      if (authResult.error) {
        if (authResult.error.message.includes('already registered')) {
          showError('err-consent', 'Un compte existe déjà avec cet email. Connectez-vous sur votre espace professionnel.');
        } else {
          showError('err-consent', authResult.error.message);
        }
        resetSubmitBtn();
        return;
      }

      var user = authResult.data.user;
      var session = authResult.data.session;

      // ── 3. If email confirmation is required (no session yet) ──
      if (user && !session) {
        // Detect fake/obfuscated user (Supabase returns this for already-existing emails)
        if (user.identities && user.identities.length === 0) {
          showError('err-consent', 'Un compte existe déjà avec cet email. Connectez-vous sur votre espace professionnel.');
          resetSubmitBtn();
          return;
        }
        // Supabase sends confirmation email via its built-in templates (configured in Dashboard)
        // Profile data is stored in user_metadata and will be auto-created on first dashboard login
        showSuccess();
        return;
      }

      if (!session) {
        showError('err-consent', 'Erreur lors de la création du compte. Réessayez.');
        resetSubmitBtn();
        return;
      }

      // ── 4. Create profile via edge function ──
      submitBtn.innerHTML = '<svg class="ann-spinner" viewBox="0 0 24 24" style="width:1rem;height:1rem;animation:spin 1s linear infinite"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="30 70" stroke-linecap="round"/></svg> Création de votre fiche...';

      var profileRes = await fetch(SUPABASE_URL + '/functions/v1/annuaire-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': 'Bearer ' + session.access_token,
        },
        body: JSON.stringify(profileData),
      });

      var profileResult = await profileRes.json();

      if (profileResult.error) {
        console.error('Profile creation error:', profileResult.error);
        showSuccessWithMessage('Votre compte a été créé mais la fiche n\'a pas pu être enregistrée automatiquement. Connectez-vous sur votre <a href="/dashboard/" target="_blank" style="color:hsl(var(--ann-primary))">espace professionnel</a> pour compléter votre fiche.');
        return;
      }

      // ── 5. Success! ──
      showSuccess();

    } catch (err) {
      console.error('Registration error:', err);
      showError('err-consent', 'Une erreur est survenue. Vérifiez votre connexion et réessayez.');
      resetSubmitBtn();
    }
  });

  function resetSubmitBtn() {
    var submitBtn = document.getElementById('btn-submit');
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:1rem;height:1rem"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Soumettre pour validation';
  }

  function showSuccess() {
    form.style.display = 'none';
    document.getElementById('form-progress').style.display = 'none';
    document.getElementById('form-nav').style.display = 'none';
    formSuccess.classList.remove('hidden');
    formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function showSuccessWithMessage(msg) {
    form.style.display = 'none';
    document.getElementById('form-progress').style.display = 'none';
    document.getElementById('form-nav').style.display = 'none';
    formSuccess.classList.remove('hidden');

    // Replace the default message
    var msgEl = formSuccess.querySelector('.ann-text-muted');
    if (msgEl) msgEl.innerHTML = msg;

    formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // Init
  initSupabase();
  updateProgress();
})();
