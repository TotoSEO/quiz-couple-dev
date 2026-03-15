/**
 * Annuaire Dashboard — Client-side JavaScript
 * Handles: Auth, Profile CRUD, Photo upload, Stats, Forgot/Reset password
 * Bubble selectors for methods, languages, consultation modes
 */
(function () {
  'use strict';

  var SUPABASE_URL = 'https://lojvajnnvhatfplevyvy.supabase.co';
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvanZham5udmhhdGZwbGV2eXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNzk3NDIsImV4cCI6MjA4Nzg1NTc0Mn0.gdd9HRbRvfQr6io9jGN6hUCW6tBOtognhwbsTJtSTng';

  var supabase = null;
  var currentUser = null;
  var currentProfile = null;

  // ── Specialty-specific methods ──
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

  var CONSULTATION_MODES = [
    { value: 'En cabinet', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:1.25rem;height:1.25rem"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>' },
    { value: 'En ligne', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:1.25rem;height:1.25rem"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>' },
    { value: 'À domicile', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:1.25rem;height:1.25rem"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' },
  ];

  var METHODS_LIMITS = { 'gratuit': 3, 'pro': 5, 'boost': 7 };
  var CUSTOM_METHODS_LIMITS = { 'gratuit': 0, 'pro': 2, 'boost': 5 };
  var DESC_LIMITS = { 'gratuit': 600, 'pro': 1000, 'boost': 2000 };

  // ── Rich Text Editor ──
  function syncEditorToTextarea(editorId, textareaId) {
    var editor = $(editorId);
    var textarea = $(textareaId);
    if (editor && textarea) {
      textarea.value = editor.innerHTML.trim();
    }
    return textarea ? textarea.value : '';
  }

  function initRichTextEditor(toolbarId, editorId, textareaId, countId, maxId) {
    var toolbar = $(toolbarId);
    var editor = $(editorId);
    if (!toolbar || !editor) return;

    // Toolbar buttons
    toolbar.querySelectorAll('.ann-rte-btn').forEach(function (btn) {
      btn.addEventListener('mousedown', function (e) {
        e.preventDefault(); // Keep focus in editor
      });
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var cmd = btn.getAttribute('data-cmd');
        if (cmd === 'insertTable') {
          // Check if table already exists
          if (editor.querySelector('table')) {
            alert('Un seul tableau est autorise par description.');
            return;
          }
          var cols = prompt('Nombre de colonnes (2 a 5) :', '3');
          cols = parseInt(cols, 10);
          if (isNaN(cols) || cols < 2) cols = 2;
          if (cols > 5) cols = 5;
          var rows = prompt('Nombre de lignes (2 a 10) :', '3');
          rows = parseInt(rows, 10);
          if (isNaN(rows) || rows < 2) rows = 2;
          if (rows > 10) rows = 10;
          var tableHtml = '<table><thead><tr>';
          for (var c = 0; c < cols; c++) tableHtml += '<th>En-tete</th>';
          tableHtml += '</tr></thead><tbody>';
          for (var r = 0; r < rows - 1; r++) {
            tableHtml += '<tr>';
            for (var c2 = 0; c2 < cols; c2++) tableHtml += '<td>...</td>';
            tableHtml += '</tr>';
          }
          tableHtml += '</tbody></table><p><br></p>';
          document.execCommand('insertHTML', false, tableHtml);
        } else {
          document.execCommand(cmd, false, null);
        }
        editor.focus();
        updateCount();
      });
    });

    function updateCount() {
      var count = (editor.textContent || '').length;
      var countEl = $(countId);
      if (countEl) countEl.textContent = count;
      syncEditorToTextarea(editorId, textareaId);
    }

    editor.addEventListener('input', updateCount);
    editor.addEventListener('blur', updateCount);

    // Prevent pasting HTML (paste as plain text to avoid messy formatting)
    editor.addEventListener('paste', function (e) {
      e.preventDefault();
      var text = (e.clipboardData || window.clipboardData).getData('text/plain');
      document.execCommand('insertText', false, text);
    });
  }

  // ── Password validation ──
  function validatePassword(pw) {
    if (pw.length < 10) return 'Minimum 10 caractères.';
    if (!/[A-Z]/.test(pw)) return 'Le mot de passe doit contenir au moins une majuscule.';
    if (!/[^a-zA-Z0-9]/.test(pw)) return 'Le mot de passe doit contenir au moins un caractère spécial.';
    return null;
  }

  // ── Init Supabase ──
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

  // ── Limit digit count on numeric inputs ──
  function limitDigits(inputId, maxDigits) {
    var el = document.getElementById(inputId);
    if (!el) return;
    el.addEventListener('keydown', function (e) {
      if ([8, 9, 13, 27, 35, 36, 37, 38, 39, 40, 46].indexOf(e.keyCode) !== -1) return;
      if ((e.ctrlKey || e.metaKey) && [65, 67, 86, 88].indexOf(e.keyCode) !== -1) return;
      var isDigit = (e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105);
      if (!isDigit) { e.preventDefault(); return; }
      var val = el.value.replace(/[^0-9]/g, '');
      if (val.length >= maxDigits) { e.preventDefault(); }
    });
    el.addEventListener('input', function () {
      var digits = el.value.replace(/[^0-9]/g, '');
      if (digits.length > maxDigits) {
        el.value = digits.slice(0, maxDigits);
      }
    });
  }
  limitDigits('prof-price-min', 4);
  limitDigits('prof-price-max', 4);
  limitDigits('prof-experience', 2);

  // ── API helpers ──
  function apiCall(endpoint, method, body, token) {
    var opts = {
      method: method || 'GET',
      headers: { 'apikey': SUPABASE_KEY },
    };
    if (token) opts.headers['Authorization'] = 'Bearer ' + token;
    if (body) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
    return fetch(SUPABASE_URL + '/functions/v1/' + endpoint, opts).then(function (r) {
      if (!r.ok) console.warn('[apiCall] ' + method + ' ' + endpoint + ' returned ' + r.status);
      return r.json().catch(function () {
        return { error: 'Réponse invalide du serveur (HTTP ' + r.status + ')' };
      }).then(function (json) {
        if (json.message && !json.error && !json.profile) json.error = json.message;
        return json;
      });
    });
  }

  // ── DOM helpers ──
  function $(id) { return document.getElementById(id); }
  function show(el) { if (el) el.style.display = ''; }
  function hide(el) { if (el) el.style.display = 'none'; }
  function showError(id, msg) {
    var el = $(id);
    if (el) { el.textContent = msg; el.style.display = 'block'; el.style.color = ''; }
  }
  function hideError(id) { var el = $(id); if (el) el.style.display = 'none'; }
  function showSuccess(id, msg) {
    var el = $(id);
    if (el) { el.textContent = msg; el.style.display = 'block'; }
  }

  // ── Bubble selector builder ──
  // extraCountFn: optional function returning extra count to add when checking maxItems
  function buildBubbles(containerId, items, selectedItems, maxItems, extraCountFn) {
    var container = $(containerId);
    if (!container) return;
    container.innerHTML = '';
    var selected = selectedItems || [];

    items.forEach(function (item) {
      var isSelected = selected.indexOf(item) !== -1;
      var bubble = document.createElement('label');
      bubble.style.cssText = 'display:inline-flex;align-items:center;padding:0.375rem 0.75rem;border-radius:9999px;font-size:0.8125rem;cursor:pointer;border:1px solid ' + (isSelected ? 'hsl(var(--ann-primary))' : 'hsl(var(--ann-border))') + ';background:' + (isSelected ? 'hsl(var(--ann-primary))' : 'hsl(var(--ann-card))') + ';color:' + (isSelected ? 'white' : 'hsl(var(--ann-fg))') + ';transition:all 0.15s;user-select:none;';
      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.value = item;
      cb.checked = isSelected;
      cb.style.display = 'none';
      cb.addEventListener('change', function () {
        var checked = container.querySelectorAll('input:checked');
        var total = checked.length + (extraCountFn ? extraCountFn() : 0);
        if (maxItems && total > maxItems) {
          cb.checked = false;
          return;
        }
        bubble.style.background = cb.checked ? 'hsl(var(--ann-primary))' : 'hsl(var(--ann-card))';
        bubble.style.color = cb.checked ? 'white' : 'hsl(var(--ann-fg))';
        bubble.style.borderColor = cb.checked ? 'hsl(var(--ann-primary))' : 'hsl(var(--ann-border))';
      });
      bubble.appendChild(cb);
      bubble.appendChild(document.createTextNode(item));
      container.appendChild(bubble);
    });
  }

  function getSelectedBubbles(containerId) {
    var container = $(containerId);
    if (!container) return [];
    var result = [];
    container.querySelectorAll('input:checked').forEach(function (cb) { result.push(cb.value); });
    return result;
  }

  // ── Consultation mode builder ──
  function buildConsultationModes(containerId, selectedModes) {
    var container = $(containerId);
    if (!container) return;
    container.innerHTML = '';
    var selected = selectedModes || [];

    CONSULTATION_MODES.forEach(function (mode) {
      var isSelected = selected.indexOf(mode.value) !== -1;
      var card = document.createElement('label');
      card.style.cssText = 'display:flex;align-items:center;gap:0.75rem;padding:0.75rem 1rem;border-radius:var(--ann-radius);border:1px solid ' + (isSelected ? 'hsl(var(--ann-primary))' : 'hsl(var(--ann-border))') + ';background:' + (isSelected ? 'hsl(var(--ann-primary)/0.05)' : 'hsl(var(--ann-card))') + ';cursor:pointer;transition:all 0.15s;flex:1;min-width:8rem;';
      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.value = mode.value;
      cb.checked = isSelected;
      cb.style.display = 'none';
      cb.addEventListener('change', function () {
        card.style.borderColor = cb.checked ? 'hsl(var(--ann-primary))' : 'hsl(var(--ann-border))';
        card.style.background = cb.checked ? 'hsl(var(--ann-primary)/0.05)' : 'hsl(var(--ann-card))';
      });
      card.appendChild(cb);
      var iconSpan = document.createElement('span');
      iconSpan.innerHTML = mode.icon;
      iconSpan.style.color = 'hsl(var(--ann-primary))';
      card.appendChild(iconSpan);
      card.appendChild(document.createTextNode(mode.value));
      container.appendChild(card);
    });
  }

  // ── Methods: rebuild based on specialty ──
  // Collect all predefined method names for detecting custom ones
  var ALL_PREDEFINED_METHODS = [];
  Object.values(METHODS_BY_SPECIALTY).forEach(function (methods) {
    methods.forEach(function (m) { if (ALL_PREDEFINED_METHODS.indexOf(m) === -1) ALL_PREDEFINED_METHODS.push(m); });
  });

  function rebuildMethods(specialty, selectedMethods) {
    var plan = (currentProfile && currentProfile.plan) || 'gratuit';
    var maxMethods = METHODS_LIMITS[plan] || 3;
    var maxCustom = CUSTOM_METHODS_LIMITS[plan] || 0;
    var limitEl = $('prof-methods-limit');
    if (limitEl) limitEl.textContent = '(max ' + maxMethods + (maxCustom > 0 ? ', dont ' + maxCustom + ' personnalisée' + (maxCustom > 1 ? 's' : '') : '') + ')';

    var allMethods = [];
    if (specialty && METHODS_BY_SPECIALTY[specialty]) {
      allMethods = METHODS_BY_SPECIALTY[specialty];
    } else {
      Object.values(METHODS_BY_SPECIALTY).forEach(function (methods) {
        methods.forEach(function (m) { if (allMethods.indexOf(m) === -1) allMethods.push(m); });
      });
    }

    // Separate selected into predefined and custom
    var selected = selectedMethods || [];
    var selectedPredefined = selected.filter(function (m) { return ALL_PREDEFINED_METHODS.indexOf(m) !== -1; });
    var selectedCustom = selected.filter(function (m) { return ALL_PREDEFINED_METHODS.indexOf(m) === -1; });

    buildBubbles('prof-methods-container', allMethods, selectedPredefined, maxMethods, function () {
      return getCustomMethods().length;
    });

    // Build custom methods UI for pro/boost
    buildCustomMethodsUI(maxCustom, selectedCustom, maxMethods);
  }

  function buildCustomMethodsUI(maxCustom, existingCustom, maxTotal) {
    var wrapper = $('prof-custom-methods-wrapper');
    if (!wrapper) return;

    if (maxCustom <= 0) {
      wrapper.style.display = 'none';
      wrapper.innerHTML = '';
      return;
    }

    wrapper.style.display = '';
    wrapper.innerHTML = '';

    // Label
    var label = document.createElement('p');
    label.style.cssText = 'font-size:0.8125rem;color:hsl(var(--ann-muted-fg));margin:0 0 0.5rem;';
    label.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:0.875rem;height:0.875rem;vertical-align:middle;margin-right:0.25rem"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>'
      + 'Méthodes personnalisées <span style="font-weight:600;">(' + maxCustom + ' max)</span>';
    wrapper.appendChild(label);

    // Container for custom method tags
    var tagsContainer = document.createElement('div');
    tagsContainer.id = 'prof-custom-methods-tags';
    tagsContainer.style.cssText = 'display:flex;flex-wrap:wrap;gap:0.5rem;margin-bottom:0.5rem;';
    wrapper.appendChild(tagsContainer);

    // Render existing custom methods
    (existingCustom || []).forEach(function (m) {
      addCustomMethodTag(tagsContainer, m, maxCustom);
    });

    // Input row for adding new custom methods
    var inputRow = document.createElement('div');
    inputRow.style.cssText = 'display:flex;gap:0.5rem;align-items:center;';
    var input = document.createElement('input');
    input.type = 'text';
    input.id = 'prof-custom-method-input';
    input.className = 'ann-form-input';
    input.placeholder = 'Ex: Art-thérapie, Hypnose ericksonienne...';
    input.maxLength = 60;
    input.style.cssText = 'flex:1;font-size:0.8125rem;padding:0.375rem 0.75rem;';
    var addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'ann-btn ann-btn-outline ann-btn-sm';
    addBtn.textContent = 'Ajouter';
    addBtn.style.cssText = 'white-space:nowrap;font-size:0.8125rem;padding:0.375rem 0.75rem;';
    inputRow.appendChild(input);
    inputRow.appendChild(addBtn);
    wrapper.appendChild(inputRow);

    function doAdd() {
      var val = input.value.trim();
      if (!val) return;
      // Check total limit
      var predefinedCount = getSelectedBubbles('prof-methods-container').length;
      var customCount = tagsContainer.querySelectorAll('.ann-custom-method-tag').length;
      if (predefinedCount + customCount >= maxTotal) {
        input.value = '';
        input.placeholder = 'Limite totale atteinte';
        return;
      }
      if (customCount >= maxCustom) {
        input.value = '';
        input.placeholder = 'Limite personnalisées atteinte';
        return;
      }
      // Check duplicate
      var existing = [];
      tagsContainer.querySelectorAll('.ann-custom-method-tag').forEach(function (t) { existing.push(t.getAttribute('data-value')); });
      if (existing.indexOf(val) !== -1 || ALL_PREDEFINED_METHODS.indexOf(val) !== -1) {
        input.value = '';
        return;
      }
      addCustomMethodTag(tagsContainer, val, maxCustom);
      input.value = '';
      input.placeholder = 'Ex: Art-thérapie, Hypnose ericksonienne...';
    }

    addBtn.addEventListener('click', doAdd);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); doAdd(); }
    });
  }

  function addCustomMethodTag(container, value, maxCustom) {
    var tag = document.createElement('span');
    tag.className = 'ann-custom-method-tag';
    tag.setAttribute('data-value', value);
    tag.style.cssText = 'display:inline-flex;align-items:center;gap:0.375rem;padding:0.375rem 0.75rem;border-radius:9999px;font-size:0.8125rem;background:hsl(var(--ann-primary)/0.1);color:hsl(var(--ann-primary));border:1px solid hsl(var(--ann-primary)/0.3);';
    var text = document.createElement('span');
    text.textContent = value;
    var removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.innerHTML = '&times;';
    removeBtn.style.cssText = 'background:none;border:none;color:hsl(var(--ann-primary));cursor:pointer;font-size:1rem;line-height:1;padding:0;';
    removeBtn.addEventListener('click', function () { tag.remove(); });
    tag.appendChild(text);
    tag.appendChild(removeBtn);
    container.appendChild(tag);
  }

  function getCustomMethods() {
    var container = $('prof-custom-methods-tags');
    if (!container) return [];
    var result = [];
    container.querySelectorAll('.ann-custom-method-tag').forEach(function (t) { result.push(t.getAttribute('data-value')); });
    return result;
  }

  // ── Cabinet Photos (Pro/Boost) ──
  function getYouTubeThumb(videoUrl) {
    if (!videoUrl) return '';
    var m = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    return m ? 'https://img.youtube.com/vi/' + m[1] + '/hqdefault.jpg' : '';
  }

  function renderCabinetPhotos(photos, maxPhotos) {
    var grid = $('dash-photos-grid');
    var addLabel = $('dash-photos-add-label');
    if (!grid) return;
    grid.innerHTML = '';
    var items = (photos || []).slice();
    var count = items.length;
    var photoCount = items.filter(function(u) { return u !== 'video'; }).length;
    items.forEach(function (url, idx) {
      var isVideo = (url === 'video');
      var card = document.createElement('div');
      card.className = 'ann-dash-photo-card';
      card.setAttribute('draggable', 'true');
      card.setAttribute('data-photo-idx', idx);

      if (isVideo) {
        var thumb = getYouTubeThumb(currentProfile && currentProfile.video_url);
        card.innerHTML =
          '<span class="ann-dash-photo-badge" style="background:hsl(0 0% 15%);">N°' + (idx + 1) + '</span>' +
          (thumb ? '<img src="' + thumb + '" alt="Vidéo">' : '<div style="width:100%;height:100%;background:hsl(var(--ann-muted)/0.5);display:flex;align-items:center;justify-content:center;color:hsl(var(--ann-muted-fg));">Vidéo</div>') +
          '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;">' +
            '<div style="width:2.5rem;height:2.5rem;border-radius:50%;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;">' +
              '<svg viewBox="0 0 24 24" fill="white" style="width:1.25rem;height:1.25rem;margin-left:2px;"><polygon points="5 3 19 12 5 21 5 3"/></svg>' +
            '</div>' +
          '</div>' +
          '<div class="ann-dash-photo-actions">' +
            (idx > 0 ? '<button type="button" data-move-photo-up="' + idx + '" class="ann-dash-photo-btn" title="Déplacer avant"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><path d="M15 18l-6-6 6-6"/></svg></button>' : '') +
            (idx < count - 1 ? '<button type="button" data-move-photo-down="' + idx + '" class="ann-dash-photo-btn" title="Déplacer après"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><path d="M9 18l6-6-6-6"/></svg></button>' : '') +
          '</div>';
      } else {
        card.innerHTML =
          '<span class="ann-dash-photo-badge">N°' + (idx + 1) + '</span>' +
          '<img src="' + url + '" alt="Photo cabinet ' + (idx + 1) + '">' +
          '<div class="ann-dash-photo-actions">' +
            (idx > 0 ? '<button type="button" data-move-photo-up="' + idx + '" class="ann-dash-photo-btn" title="Déplacer avant"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><path d="M15 18l-6-6 6-6"/></svg></button>' : '') +
            (idx < count - 1 ? '<button type="button" data-move-photo-down="' + idx + '" class="ann-dash-photo-btn" title="Déplacer après"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><path d="M9 18l6-6-6-6"/></svg></button>' : '') +
            '<button type="button" data-remove-photo="' + idx + '" class="ann-dash-photo-btn ann-dash-photo-btn-danger" title="Supprimer">&times;</button>' +
          '</div>';
      }
      // Drag & drop
      card.addEventListener('dragstart', function(e) {
        e.dataTransfer.setData('text/plain', idx);
        card.classList.add('ann-dash-photo-dragging');
      });
      card.addEventListener('dragend', function() { card.classList.remove('ann-dash-photo-dragging'); });
      card.addEventListener('dragover', function(e) { e.preventDefault(); card.classList.add('ann-dash-photo-dragover'); });
      card.addEventListener('dragleave', function() { card.classList.remove('ann-dash-photo-dragover'); });
      card.addEventListener('drop', function(e) {
        e.preventDefault();
        card.classList.remove('ann-dash-photo-dragover');
        var fromIdx = parseInt(e.dataTransfer.getData('text/plain'));
        var toIdx = idx;
        if (fromIdx !== toIdx) reorderPhotos(fromIdx, toIdx);
      });
      grid.appendChild(card);
    });
    // Show/hide add button based on limit (don't count video marker towards photo limit)
    if (addLabel) addLabel.style.display = photoCount >= maxPhotos ? 'none' : '';
  }

  async function reorderPhotos(fromIdx, toIdx) {
    if (!currentProfile || !currentProfile.photos) return;
    var photos = (currentProfile.photos || []).slice();
    var item = photos.splice(fromIdx, 1)[0];
    photos.splice(toIdx, 0, item);
    var session = await checkAuth();
    if (session) {
      var res = await saveProfile({ photos: photos }, session.access_token, false);
      if (res.profile) {
        currentProfile = res.profile;
        var maxPhotos = currentProfile.plan === 'boost' ? 4 : 2;
        renderCabinetPhotos(currentProfile.photos || [], maxPhotos);
      }
    }
  }

  async function uploadCabinetPhoto(file) {
    if (!currentUser || !currentProfile) return;
    var ext = file.name.split('.').pop().toLowerCase();
    if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext)) throw new Error('Format non supporté.');
    if (file.size > 300 * 1024) throw new Error('Photo trop lourde (300 Ko max). Compressez-la avant de l\'envoyer.');
    var timestamp = Date.now();
    var path = currentUser.id + '/cabinet-' + timestamp + '.' + ext;
    var result = await supabase.storage.from('annuaire-photos').upload(path, file, { upsert: true, contentType: file.type });
    if (result.error) throw result.error;
    var urlData = supabase.storage.from('annuaire-photos').getPublicUrl(path);
    return urlData.data.publicUrl;
  }

  async function removeCabinetPhoto(idx) {
    if (!currentProfile || !currentProfile.photos) return;
    var photos = (currentProfile.photos || []).slice();
    var removedUrl = photos.splice(idx, 1)[0];
    // Delete from storage
    if (removedUrl) {
      var match = removedUrl.match(/annuaire-photos\/(.+)$/);
      if (match) {
        try { await supabase.storage.from('annuaire-photos').remove([match[1]]); } catch (e) {}
      }
    }
    // Update profile
    var session = await checkAuth();
    if (session) {
      var res = await saveProfile({ photos: photos }, session.access_token, false);
      if (res.profile) {
        currentProfile = res.profile;
        var maxPhotos = currentProfile.plan === 'boost' ? 4 : 2;
        renderCabinetPhotos(currentProfile.photos || [], maxPhotos);
      }
    }
  }

  // ── Short Description Counter ──
  function updateShortDescCounter() {
    var input = $('prof-short-description');
    var counter = $('prof-short-desc-counter');
    if (!input || !counter) return;
    var len = input.value.length;
    counter.textContent = len + '/165';
    counter.style.color = len > 155 ? 'hsl(0 70% 50%)' : 'hsl(var(--ann-muted-fg))';
  }

  // ── Video Preview ──
  function updateVideoPreview(url) {
    var preview = $('dash-video-preview');
    if (!preview) return;
    if (!url) { hide(preview); return; }
    // Extract YouTube video ID
    var match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    if (match) {
      preview.innerHTML = '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/' + match[1] + '" frameborder="0" allowfullscreen style="border-radius:var(--ann-radius);"></iframe>';
      show(preview);
    } else {
      hide(preview);
    }
  }

  // ── Address autocomplete (OpenStreetMap Nominatim) ──
  var addressTimeout = null;
  function initAddressAutocomplete() {
    var input = $('prof-address');
    var suggestions = $('prof-address-suggestions');
    if (!input || !suggestions) return;

    input.addEventListener('input', function () {
      var query = input.value.trim();
      clearTimeout(addressTimeout);
      if (query.length < 4) { suggestions.style.display = 'none'; return; }

      addressTimeout = setTimeout(function () {
        fetch('https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&countrycodes=fr&limit=5&q=' + encodeURIComponent(query), {
          headers: { 'Accept-Language': 'fr' },
        })
        .then(function (r) { return r.json(); })
        .then(function (results) {
          if (!results.length) { suggestions.style.display = 'none'; return; }
          suggestions.innerHTML = '';
          results.forEach(function (r) {
            var item = document.createElement('div');
            item.style.cssText = 'padding:0.625rem 0.75rem;cursor:pointer;font-size:0.8125rem;border-bottom:1px solid hsl(var(--ann-border)/0.5);';
            item.textContent = r.display_name;
            item.addEventListener('mousedown', function (e) {
              e.preventDefault();
              // Simplify address: keep only the first 2-3 meaningful parts
              var parts = r.display_name.split(', ');
              input.value = parts.slice(0, 3).join(', ');
              suggestions.style.display = 'none';

              // Extract real city from Nominatim structured address
              var addr = r.address || {};
              var realCity = addr.city || addr.town || addr.village || addr.municipality || '';
              var postalCode = addr.postcode || '';

              // Store in hidden fields for form submission
              var dcField = $('prof-display-city');
              var pcField = $('prof-postal-code');
              if (dcField) dcField.value = realCity;
              if (pcField) pcField.value = postalCode;

              // Store lat/lng from Nominatim
              var latField = $('prof-lat');
              var lngField = $('prof-lng');
              if (latField && r.lat) latField.value = r.lat;
              if (lngField && r.lon) lngField.value = r.lon;
            });
            item.addEventListener('mouseenter', function () { item.style.background = 'hsl(var(--ann-muted)/0.3)'; });
            item.addEventListener('mouseleave', function () { item.style.background = ''; });
            suggestions.appendChild(item);
          });
          suggestions.style.display = '';
        })
        .catch(function () { suggestions.style.display = 'none'; });
      }, 350);
    });

    input.addEventListener('blur', function () {
      setTimeout(function () { suggestions.style.display = 'none'; }, 200);
    });
  }

  // ── Auth ──
  async function checkAuth() {
    if (!supabase) return null;
    var { data } = await supabase.auth.getSession();
    if (data.session) {
      // Refresh if token expires within the next 60 seconds
      var expiresAt = data.session.expires_at;
      if (expiresAt && expiresAt < Math.floor(Date.now() / 1000) + 60) {
        var { data: refreshed } = await supabase.auth.refreshSession();
        return (refreshed && refreshed.session) || null;
      }
      return data.session;
    }
    var hash = window.location.hash;
    var search = window.location.search;
    if (hash.includes('access_token') || hash.includes('type=') || search.includes('code=')) {
      return new Promise(function (resolve) {
        var timeout = setTimeout(function () { resolve(null); }, 5000);
        var { data: listener } = supabase.auth.onAuthStateChange(function (event, session) {
          if (session) {
            clearTimeout(timeout);
            listener.subscription.unsubscribe();
            if (window.history.replaceState) window.history.replaceState(null, '', window.location.pathname);
            resolve(session);
          }
        });
      });
    }
    return null;
  }

  async function login(email, password) {
    var { data, error } = await supabase.auth.signInWithPassword({ email: email, password: password });
    if (error) throw error;
    return data;
  }

  async function logout() {
    await supabase.auth.signOut();
    currentUser = null;
    currentProfile = null;
    showAuthScreen();
  }

  // ── Profile ──
  async function loadProfile(token) {
    var res = await apiCall('annuaire-profile', 'GET', null, token);
    if (res.error) { console.warn('[loadProfile] Error:', res.error); return null; }
    return res.profile || null;
  }

  async function saveProfile(data, token, isNew) {
    return apiCall('annuaire-profile', isNew ? 'POST' : 'PUT', data, token);
  }

  // ── Photo upload ──
  async function uploadPhoto(file, userId) {
    var ext = file.name.split('.').pop().toLowerCase();
    if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext)) throw new Error('Format non supporté. Utilisez JPEG, PNG ou WebP.');
    if (file.size > 200 * 1024) throw new Error('Photo de profil trop lourde (200 Ko max). Compressez-la avant de l\'envoyer.');
    var path = userId + '/photo.' + ext;
    var { data, error } = await supabase.storage.from('annuaire-photos').upload(path, file, { upsert: true, contentType: file.type });
    if (error) throw error;
    var { data: urlData } = supabase.storage.from('annuaire-photos').getPublicUrl(path);
    return urlData.publicUrl;
  }

  async function loadStats(token) { return apiCall('annuaire-stats', 'GET', null, token); }

  // ── Screen management ──
  function showAuthScreen() {
    show($('ann-dash')); hide($('ann-dash-loading')); show($('dash-auth')); hide($('dash-main'));
  }
  function showDashboard() {
    show($('ann-dash')); hide($('ann-dash-loading')); hide($('dash-auth')); show($('dash-main'));
  }
  function showAuthForm(formId) {
    hide($('auth-login-form')); hide($('auth-forgot-form')); hide($('auth-reset-form')); show($(formId));
  }

  // ── Parse availability string into modes array ──
  function parseAvailability(availability) {
    if (!availability) return [];
    var modes = [];
    var lower = availability.toLowerCase();
    CONSULTATION_MODES.forEach(function (mode) {
      if (lower.indexOf(mode.value.toLowerCase()) !== -1) modes.push(mode.value);
    });
    if (modes.length === 0) {
      if (lower.indexOf('cabinet') !== -1) modes.push('En cabinet');
      if (lower.indexOf('ligne') !== -1 || lower.indexOf('visio') !== -1) modes.push('En ligne');
      if (lower.indexOf('domicile') !== -1) modes.push('À domicile');
    }
    return modes;
  }

  // ── Opening hours: populate dashboard form from DB data ──
  function populateDashHours(oh) {
    var days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
    days.forEach(function (day) {
      var toggle = document.querySelector('.ann-dash-hours-toggle[data-day="' + day + '"]');
      var slots = document.querySelector('#dash-hours-form .ann-hours-form-slots[data-day="' + day + '"]');
      if (!toggle || !slots) return;
      if (oh && oh[day] && !oh[day].closed) {
        toggle.checked = true;
        slots.classList.remove('disabled');
        var d = oh[day];
        if (d.morning_start) slots.querySelector('input[name="dash_hours_' + day + '_am_start"]').value = d.morning_start;
        if (d.morning_end) slots.querySelector('input[name="dash_hours_' + day + '_am_end"]').value = d.morning_end;
        if (d.afternoon_start) slots.querySelector('input[name="dash_hours_' + day + '_pm_start"]').value = d.afternoon_start;
        if (d.afternoon_end) slots.querySelector('input[name="dash_hours_' + day + '_pm_end"]').value = d.afternoon_end;
      } else {
        toggle.checked = false;
        slots.classList.add('disabled');
      }
    });
  }

  // ── Opening hours: collect from dashboard form ──
  function collectDashHours() {
    var days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
    var hasAny = false;
    var result = {};
    days.forEach(function (day) {
      var toggle = document.querySelector('.ann-dash-hours-toggle[data-day="' + day + '"]');
      if (!toggle || !toggle.checked) {
        result[day] = { closed: true };
        return;
      }
      hasAny = true;
      var prefix = 'dash_hours_' + day;
      result[day] = {
        closed: false,
        morning_start: (document.querySelector('input[name="' + prefix + '_am_start"]') || {}).value || null,
        morning_end: (document.querySelector('input[name="' + prefix + '_am_end"]') || {}).value || null,
        afternoon_start: (document.querySelector('input[name="' + prefix + '_pm_start"]') || {}).value || null,
        afternoon_end: (document.querySelector('input[name="' + prefix + '_pm_end"]') || {}).value || null,
      };
    });
    return hasAny ? result : null;
  }

  // ── Dashboard hours toggle ──
  document.querySelectorAll('.ann-dash-hours-toggle').forEach(function (cb) {
    function toggle() {
      var day = cb.getAttribute('data-day');
      var slots = document.querySelector('#dash-hours-form .ann-hours-form-slots[data-day="' + day + '"]');
      if (slots) {
        if (cb.checked) slots.classList.remove('disabled');
        else slots.classList.add('disabled');
      }
    }
    cb.addEventListener('change', toggle);
  });

  function fillForm(profile) {
    if (!profile) return;
    $('prof-firstname').value = profile.first_name || '';
    $('prof-lastname').value = profile.last_name || '';
    $('prof-specialty').value = profile.specialty || '';
    $('prof-city').value = profile.city || '';
    $('prof-email').value = profile.email || '';
    $('prof-phone').value = profile.phone || '';
    $('prof-address').value = profile.address || '';
    if ($('prof-display-city')) $('prof-display-city').value = profile.display_city || '';
    if ($('prof-postal-code')) $('prof-postal-code').value = profile.postal_code || '';
    if ($('prof-lat') && profile.lat) $('prof-lat').value = profile.lat;
    if ($('prof-lng') && profile.lng) $('prof-lng').value = profile.lng;
    $('prof-website').value = profile.website || '';
    if ($('prof-pro-id-number')) $('prof-pro-id-number').value = profile.professional_id_number || '';
    if ($('prof-doctolib')) $('prof-doctolib').value = profile.doctolib_url || '';
    // Short description
    var shortDescInput = $('prof-short-description');
    if (shortDescInput) {
      shortDescInput.value = profile.short_description || '';
      updateShortDescCounter();
    }

    var descVal = profile.description || '';
    $('prof-description').value = descVal;
    var descEditor = $('prof-description-editor');
    if (descEditor) {
      descEditor.innerHTML = descVal;
    }
    $('prof-experience').value = profile.years_experience || '';
    // Parse price_range "60€ - 100€" into min/max
    if (profile.price_range) {
      var priceMatch = profile.price_range.match(/(\d+)\s*€?\s*[-–]\s*(\d+)/);
      if (priceMatch) {
        $('prof-price-min').value = priceMatch[1];
        $('prof-price-max').value = priceMatch[2];
      } else {
        var singlePrice = profile.price_range.match(/(\d+)/);
        if (singlePrice) { $('prof-price-min').value = singlePrice[1]; $('prof-price-max').value = singlePrice[1]; }
      }
    } else {
      $('prof-price-min').value = '';
      $('prof-price-max').value = '';
    }

    // Update char count and limit from editor
    var plan = profile.plan || 'gratuit';
    var descMax = DESC_LIMITS[plan] || 600;
    var descMaxEl = $('prof-desc-max');
    if (descMaxEl) descMaxEl.textContent = descMax;
    if (descEditor) {
      $('prof-desc-count').textContent = (descEditor.textContent || '').length;
    }

    // Lock name and specialty if profile already exists in DB
    if (profile.id) {
      ['prof-firstname', 'prof-lastname'].forEach(function (id) {
        var el = $(id);
        if (el) { el.readOnly = true; el.style.opacity = '0.6'; el.style.cursor = 'not-allowed'; el.title = 'Contactez le support pour modifier ce champ'; }
      });
      var specEl = $('prof-specialty');
      if (specEl) { specEl.disabled = true; specEl.style.opacity = '0.6'; specEl.style.cursor = 'not-allowed'; specEl.title = 'Contactez le support pour modifier ce champ'; }
    }

    // Build bubble selectors
    rebuildMethods(profile.specialty, profile.methods || []);
    buildBubbles('prof-languages-container', LANGUAGES, profile.languages || []);
    buildConsultationModes('prof-availability-container', parseAvailability(profile.availability));

    // Opening hours
    populateDashHours(profile.opening_hours);

    // Photo preview
    if (profile.photo_url) {
      var safeUrl = profile.photo_url.replace(/[&<>"']/g, function (c) { return '&#' + c.charCodeAt(0) + ';'; });
      $('dash-photo-preview').innerHTML = '<img src="' + safeUrl + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" alt="Photo de profil">';
    }

    // Google Place ID (Boost only)
    var gpi = $('prof-google-place-id');
    if (gpi && profile.google_place_id) gpi.value = profile.google_place_id;

    // Unlock website for Boost users
    var websiteInput = $('prof-website');
    var websiteLocked = $('dash-website-locked');
    if (websiteInput && profile.plan === 'boost') {
      websiteInput.disabled = false; websiteInput.style.opacity = ''; websiteInput.style.cursor = '';
      if (websiteLocked) hide(websiteLocked);
    }

    // Unlock Doctolib for Pro or Boost users
    var doctolibInput = $('prof-doctolib');
    var doctolibLocked = $('dash-doctolib-locked');
    if (doctolibInput && (profile.plan === 'pro' || profile.plan === 'boost')) {
      doctolibInput.disabled = false; doctolibInput.style.opacity = ''; doctolibInput.style.cursor = '';
      if (doctolibLocked) hide(doctolibLocked);
    }

    // Show cabinet photos section for Pro & Boost users
    var photosSection = $('dash-photos-section');
    if (photosSection && (profile.plan === 'pro' || profile.plan === 'boost')) {
      show(photosSection);
      var maxPhotos = profile.plan === 'boost' ? 4 : 2;

      // Auto-add video marker for existing Boost profiles with video but no marker
      // Also persist to DB so it survives reorders
      if (profile.plan === 'boost' && profile.video_url && Array.isArray(profile.photos) && profile.photos.indexOf('video') === -1) {
        profile.photos = ['video'].concat(profile.photos);
        // Save the marker to DB in background
        (async function() {
          var s = await checkAuth();
          if (s) await saveProfile({ photos: profile.photos }, s.access_token, false);
        })();
      }

      var limitEl = $('dash-photos-limit');
      if (limitEl) limitEl.textContent = '(max ' + maxPhotos + ' photos)';
      renderCabinetPhotos(profile.photos || [], maxPhotos);
    }

    // Show video section for Boost users
    var videoSection = $('dash-video-section');
    if (videoSection && profile.plan === 'boost') {
      show(videoSection);
      var videoInput = $('prof-video-url');
      if (videoInput && profile.video_url) {
        videoInput.value = profile.video_url;
        updateVideoPreview(profile.video_url);
      }
    }

    // Show Google Reviews for Boost users
    var googleSection = $('dash-google-reviews-section');
    if (googleSection && profile.plan === 'boost') {
      show(googleSection);
      if (profile.rating > 0 || profile.review_count > 0) {
        var statusEl = $('dash-google-reviews-status');
        statusEl.innerHTML = '<strong>Avis synchronisés :</strong> ' + profile.rating + '/5 (' + profile.review_count + ' avis)';
        show(statusEl);
      }
    }

    // Hide moderation note when published
    var moderationNote = $('dash-moderation-note');
    if (moderationNote && profile.is_published) hide(moderationNote);

    // View profile link
    if (profile.slug && profile.is_published) {
      var link = $('dash-view-profile');
      link.href = '/' + (profile.specialty || '') + '/' + (profile.city || '') + '/' + profile.slug + '/';
      show(link);
    }
  }

  function getFormData() {
    var data = {
      first_name: $('prof-firstname').value.trim(),
      last_name: $('prof-lastname').value.trim(),
      specialty: $('prof-specialty').value,
      city: $('prof-city').value,
      email: $('prof-email').value.trim(),
      phone: $('prof-phone').value.trim() || null,
      address: $('prof-address').value.trim() || null,
      display_city: $('prof-display-city') ? ($('prof-display-city').value.trim() || null) : null,
      postal_code: $('prof-postal-code') ? ($('prof-postal-code').value.trim() || null) : null,
      lat: $('prof-lat') && $('prof-lat').value ? parseFloat($('prof-lat').value) : undefined,
      lng: $('prof-lng') && $('prof-lng').value ? parseFloat($('prof-lng').value) : undefined,
      website: $('prof-website').disabled ? undefined : ($('prof-website').value.trim() || null),
      short_description: ($('prof-short-description').value || '').slice(0, 165).trim(),
      description: syncEditorToTextarea('prof-description-editor', 'prof-description'),
      years_experience: parseInt($('prof-experience').value) || 0,
      professional_id_number: $('prof-pro-id-number') ? ($('prof-pro-id-number').value.trim() || null) : undefined,
      price_range: (function() {
        var pmin = $('prof-price-min').value.trim();
        var pmax = $('prof-price-max').value.trim();
        if (pmin && pmax) return pmin + '€ - ' + pmax + '€';
        if (pmin) return pmin + '€';
        return null;
      })(),
      methods: getSelectedBubbles('prof-methods-container').concat(getCustomMethods()),
      languages: getSelectedBubbles('prof-languages-container'),
      availability: getSelectedBubbles('prof-availability-container').join(', ') || null,
      opening_hours: collectDashHours(),
    };
    var doctolibInput = $('prof-doctolib');
    if (doctolibInput && !doctolibInput.disabled) {
      data.doctolib_url = doctolibInput.value.trim() || null;
    }
    var gpiInput = $('prof-google-place-id');
    if (gpiInput && $('dash-google-reviews-section') && $('dash-google-reviews-section').style.display !== 'none') {
      data.google_place_id = gpiInput.value.trim() || null;
    }
    var videoInput = $('prof-video-url');
    if (videoInput && $('dash-video-section') && $('dash-video-section').style.display !== 'none') {
      data.video_url = videoInput.value.trim() || null;
    }
    return data;
  }

  // ── Profile status banner ──
  function updateProfileStatus(profile) {
    var banner = $('dash-status-banner');
    if (!banner) return;
    banner.style.display = '';
    if (!profile) {
      banner.style.background = 'hsl(var(--ann-muted) / 0.3)';
      banner.style.borderColor = 'hsl(var(--ann-border))';
      banner.innerHTML = '<div style="display:flex;align-items:center;gap:0.75rem"><svg viewBox="0 0 24 24" fill="none" stroke="hsl(var(--ann-muted-fg))" stroke-width="2" style="width:1.25rem;height:1.25rem;flex-shrink:0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg><div><strong>Fiche non créée</strong><p style="font-size:0.8125rem;color:hsl(var(--ann-muted-fg));margin-top:0.125rem">Remplissez le formulaire ci-dessous pour soumettre votre fiche à la modération.</p></div></div>';
      return;
    }
    if (profile.is_published) {
      banner.style.background = 'hsl(160 60% 45% / 0.08)';
      banner.style.borderColor = 'hsl(160 60% 45% / 0.3)';
      banner.innerHTML = '<div style="display:flex;align-items:center;gap:0.75rem"><svg viewBox="0 0 24 24" fill="none" stroke="hsl(160 60% 45%)" stroke-width="2" style="width:1.25rem;height:1.25rem;flex-shrink:0"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><div><strong style="color:hsl(160 60% 35%)">Fiche en ligne</strong><p style="font-size:0.8125rem;color:hsl(var(--ann-muted-fg));margin-top:0.125rem">Votre fiche est visible par les patients.</p></div></div>';
      var moderationNote = $('dash-moderation-note');
      if (moderationNote) hide(moderationNote);
    } else {
      banner.style.background = 'hsl(40 90% 55% / 0.08)';
      banner.style.borderColor = 'hsl(40 90% 55% / 0.3)';
      banner.innerHTML = '<div style="display:flex;align-items:center;gap:0.75rem"><svg viewBox="0 0 24 24" fill="none" stroke="hsl(40 90% 45%)" stroke-width="2" style="width:1.25rem;height:1.25rem;flex-shrink:0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><div><strong style="color:hsl(40 70% 35%)">Votre fiche n\'est pas encore visible</strong><p style="font-size:0.8125rem;color:hsl(var(--ann-muted-fg));margin-top:0.125rem">Notre équipe de modération se chargera bientôt de vérifier votre fiche. Vous serez notifié par email dès qu\'elle sera acceptée ou refusée. Délai habituel : 24h à 72h.</p></div></div>';
    }
  }

  function isRecoveryRedirect() {
    var hash = window.location.hash;
    if (hash && hash.includes('type=recovery')) return true;
    var params = new URLSearchParams(window.location.search);
    if (params.get('type') === 'recovery') return true;
    return false;
  }

  // ── Init ──
  async function init() {
    await waitForSupabase(5000);
    if (!supabase) {
      hide($('ann-dash-loading')); show($('ann-dash')); show($('dash-auth'));
      return;
    }

    if (isRecoveryRedirect()) {
      hide($('ann-dash-loading')); show($('ann-dash')); show($('dash-auth'));
      showAuthForm('auth-reset-form');
      bindLoginForm(); bindResetForm(); bindForgotPassword();
      return;
    }

    var session = await checkAuth();
    if (session) {
      currentUser = session.user;
      try { currentProfile = await loadProfile(session.access_token); } catch (e) {}

      var pendingMeta = null;
      if (!currentProfile && currentUser.user_metadata && currentUser.user_metadata.has_pending_profile) {
        pendingMeta = currentUser.user_metadata.annuaire_profile;
        if (pendingMeta) {
          try {
            var metaCopy = JSON.parse(JSON.stringify(pendingMeta));
            delete metaCopy.is_published;
            var res = await saveProfile(metaCopy, session.access_token, true);
            if (res.profile) {
              currentProfile = res.profile;
              await supabase.auth.updateUser({ data: { has_pending_profile: false } });
            } else if (res.error) {
              // Profile may already exist (409) — reload it
              currentProfile = await loadProfile(session.access_token);
              if (currentProfile) {
                await supabase.auth.updateUser({ data: { has_pending_profile: false } });
              }
            }
          } catch (e) { console.warn('Auto-create profile failed:', e); }
        }
      }

      $('dash-welcome').textContent = 'Connecté en tant que ' + currentUser.email;

      // Init bubble selectors with defaults
      rebuildMethods(null, []);
      buildBubbles('prof-languages-container', LANGUAGES, ['Français']);
      buildConsultationModes('prof-availability-container', []);

      if (currentProfile) {
        fillForm(currentProfile);
        updateProfileStatus(currentProfile);
        updateTopPlanBanner(currentProfile);
      } else {
        if (pendingMeta) fillForm(pendingMeta);
        updateProfileStatus(null);
      }
      showDashboard();
    } else {
      showAuthScreen();
    }

    bindLoginForm(); bindForgotPassword(); bindResetForm(); bindBillingForm(); bindDeleteAccount();

    $('dash-logout').addEventListener('click', logout);

    // Dashboard tabs
    function activateTab(tab) {
      document.querySelectorAll('[data-dash-tab]').forEach(function (b) { b.classList.remove('ann-auth-tab-active'); });
      var activeBtn = document.querySelector('[data-dash-tab="' + tab + '"]');
      if (activeBtn) activeBtn.classList.add('ann-auth-tab-active');
      hide($('dash-tab-profile')); hide($('dash-tab-billing')); hide($('dash-tab-stats'));
      show($('dash-tab-' + tab));
      if (tab === 'stats') loadStatsTab();
      if (tab === 'billing') { fillBillingForm(currentProfile); loadInvoicesTab(); }
    }

    document.querySelectorAll('[data-dash-tab]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var tab = btn.getAttribute('data-dash-tab');
        activateTab(tab);
      });
    });

    // Handle URL hash to auto-switch tabs (e.g. /dashboard/#billing, /dashboard/#subscription)
    var tabHash = window.location.hash.replace('#', '');
    if (tabHash === 'billing' || tabHash === 'stats' || tabHash === 'subscription') {
      activateTab('billing');
      if (tabHash === 'subscription') {
        setTimeout(function () {
          var subEl = document.getElementById('subscription');
          if (subEl) subEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 200);
      }
    }

    // ── Rich Text Editor init (dashboard) ──
    initRichTextEditor('prof-desc-toolbar', 'prof-description-editor', 'prof-description', 'prof-desc-count', 'prof-desc-max');

    // Specialty change → rebuild methods
    $('prof-specialty').addEventListener('change', function () {
      var currentMethods = getSelectedBubbles('prof-methods-container');
      rebuildMethods(this.value, currentMethods);
    });

    // Address autocomplete
    initAddressAutocomplete();

    // Photo upload
    $('dash-photo-input').addEventListener('change', async function () {
      var file = this.files[0];
      if (!file) return;
      try {
        var session = await checkAuth();
        if (!session) { alert('Session expirée. Reconnectez-vous.'); return; }
        var url = await uploadPhoto(file, session.user.id);
        var safePhotoUrl = url.replace(/[&<>"']/g, function (c) { return '&#' + c.charCodeAt(0) + ';'; });
        $('dash-photo-preview').innerHTML = '<img src="' + safePhotoUrl + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" alt="Photo">';
        await saveProfile({ photo_url: url }, session.access_token, !currentProfile);
      } catch (err) {
        alert(err.message || 'Erreur lors de l\'upload');
      }
    });

    // Cabinet photos upload
    var photosInput = $('dash-photos-input');
    if (photosInput) {
      photosInput.addEventListener('change', async function () {
        var file = this.files[0];
        if (!file) return;
        var errEl = $('dash-photos-error');
        if (errEl) hide(errEl);
        try {
          var session = await checkAuth();
          if (!session) { alert('Session expirée.'); return; }
          var url = await uploadCabinetPhoto(file);
          var photos = (currentProfile.photos || []).slice();
          photos.push(url);
          var res = await saveProfile({ photos: photos }, session.access_token, false);
          if (res.profile) {
            currentProfile = res.profile;
            var maxPhotos = currentProfile.plan === 'boost' ? 4 : 2;
            renderCabinetPhotos(currentProfile.photos || [], maxPhotos);
          } else if (res.error) {
            if (errEl) { errEl.textContent = res.error; show(errEl); }
          }
        } catch (err) {
          if (errEl) { errEl.textContent = err.message || 'Erreur upload'; show(errEl); }
        }
        this.value = '';
      });
    }

    // Cabinet photo actions (remove, reorder)
    document.addEventListener('click', function (e) {
      var removeBtn = e.target.closest('[data-remove-photo]');
      if (removeBtn) {
        var idx = parseInt(removeBtn.getAttribute('data-remove-photo'));
        if (!isNaN(idx)) removeCabinetPhoto(idx);
        return;
      }
      var upBtn = e.target.closest('[data-move-photo-up]');
      if (upBtn) {
        var idx = parseInt(upBtn.getAttribute('data-move-photo-up'));
        if (!isNaN(idx) && idx > 0) reorderPhotos(idx, idx - 1);
        return;
      }
      var downBtn = e.target.closest('[data-move-photo-down]');
      if (downBtn) {
        var idx = parseInt(downBtn.getAttribute('data-move-photo-down'));
        if (!isNaN(idx)) reorderPhotos(idx, idx + 1);
      }
    });

    // Short description counter
    var shortDescInput = $('prof-short-description');
    if (shortDescInput) {
      shortDescInput.addEventListener('input', updateShortDescCounter);
      // Block paste that would exceed limit
      shortDescInput.addEventListener('paste', function(e) {
        var el = this;
        setTimeout(function() {
          if (el.value.length > 165) el.value = el.value.slice(0, 165);
          updateShortDescCounter();
        }, 0);
      });
    }

    // Video URL preview
    var videoInput = $('prof-video-url');
    if (videoInput) {
      videoInput.addEventListener('input', function () {
        updateVideoPreview(this.value.trim());
      });
    }

    // Profile save
    $('dash-profile-form').addEventListener('submit', async function (e) {
      e.preventDefault();
      hideError('dash-profile-error');
      hide($('dash-profile-success'));

      var session = await checkAuth();
      if (!session) { showError('dash-profile-error', 'Session expirée. Reconnectez-vous.'); return; }

      var data = getFormData();

      // Validate price fields
      var priceMin = $('prof-price-min').value.trim();
      var priceMax = $('prof-price-max').value.trim();
      if (priceMin || priceMax) {
        var nMin = Number(priceMin), nMax = Number(priceMax);
        if (priceMin && (nMin < 0 || nMin > 9999 || !Number.isInteger(nMin))) {
          showError('dash-profile-error', 'Le tarif min doit être un nombre entier entre 0 et 9999.');
          return;
        }
        if (priceMax && (nMax < 0 || nMax > 9999 || !Number.isInteger(nMax))) {
          showError('dash-profile-error', 'Le tarif max doit être un nombre entier entre 0 et 9999.');
          return;
        }
        if (priceMin && priceMax && nMax <= nMin) {
          showError('dash-profile-error', 'Le tarif max doit être supérieur au tarif min.');
          return;
        }
      }

      // Validate Doctolib URL client-side
      if (data.doctolib_url) {
        try {
          var dUrl = new URL(data.doctolib_url);
          if (dUrl.hostname !== 'www.doctolib.fr' && dUrl.hostname !== 'doctolib.fr') {
            showError('dash-profile-error', 'Seuls les liens Doctolib (doctolib.fr) sont acceptés.');
            return;
          }
        } catch (e) {
          showError('dash-profile-error', 'Seuls les liens Doctolib (doctolib.fr) sont acceptés.');
          return;
        }
      }

      // Sync video marker in photos array
      if (currentProfile && currentProfile.plan === 'boost') {
        var photos = (currentProfile.photos || []).slice();
        var hasVideoMarker = photos.indexOf('video') !== -1;
        var hasVideoUrl = data.video_url && data.video_url.length > 0;
        if (hasVideoUrl && !hasVideoMarker) {
          // Insert video marker at position 0 (hero) by default
          photos.unshift('video');
          data.photos = photos;
        } else if (!hasVideoUrl && hasVideoMarker) {
          // Remove video marker
          data.photos = photos.filter(function(p) { return p !== 'video'; });
        }
      }

      var btn = $('dash-save-btn');
      btn.disabled = true; btn.textContent = 'Enregistrement...';

      try {
        var isNew = !currentProfile;
        var res = await saveProfile(data, session.access_token, isNew);
        // If POST failed with 409 (profile already exists), reload and retry as PUT
        if (isNew && res.error && res.error.indexOf('déjà') !== -1) {
          currentProfile = await loadProfile(session.access_token);
          if (currentProfile) {
            res = await saveProfile(data, session.access_token, false);
          }
        }
        if (res.error || res.msg) {
          showError('dash-profile-error', res.error || res.msg);
        } else if (res.profile) {
          currentProfile = res.profile;
          updateProfileStatus(currentProfile);
          var successMsg = 'Fiche enregistrée avec succès !';
          if (res.profile.google_place_id && res.profile.plan === 'boost') {
            successMsg += ' Les avis Google sont en cours de synchronisation (quelques secondes).';
          }
          $('dash-profile-success').textContent = successMsg;
          show($('dash-profile-success'));
          if (currentProfile.slug && currentProfile.is_published) {
            var link = $('dash-view-profile');
            link.href = '/' + (currentProfile.specialty || '') + '/' + (currentProfile.city || '') + '/' + currentProfile.slug + '/';
            show(link);
          }
        } else {
          showError('dash-profile-error', 'Réponse inattendue du serveur.');
        }
      } catch (err) {
        showError('dash-profile-error', err.message || 'Erreur serveur');
      } finally {
        btn.disabled = false; btn.textContent = 'Enregistrer';
      }
    });
  }

  // ── Login form ──
  function bindLoginForm() {
    $('auth-login-form').addEventListener('submit', async function (e) {
      e.preventDefault();
      hideError('auth-login-error');
      try {
        var data = await login($('login-email').value.trim(), $('login-password').value);
        currentUser = data.user;
        currentProfile = await loadProfile(data.session.access_token);

        if (!currentProfile && currentUser.user_metadata && currentUser.user_metadata.has_pending_profile) {
          var meta = currentUser.user_metadata.annuaire_profile;
          if (meta) {
            try {
              var metaCopy = JSON.parse(JSON.stringify(meta));
              delete metaCopy.is_published;
              var res = await saveProfile(metaCopy, data.session.access_token, true);
              if (res.profile) {
                currentProfile = res.profile;
                await supabase.auth.updateUser({ data: { has_pending_profile: false } });
              }
            } catch (autoErr) { console.warn('Auto-create on login failed:', autoErr); }
          }
        }

        $('dash-welcome').textContent = 'Connecté en tant que ' + currentUser.email;
        rebuildMethods(null, []);
        buildBubbles('prof-languages-container', LANGUAGES, ['Français']);
        buildConsultationModes('prof-availability-container', []);

        if (currentProfile) {
          fillForm(currentProfile);
        } else if (currentUser.user_metadata && currentUser.user_metadata.annuaire_profile) {
          fillForm(currentUser.user_metadata.annuaire_profile);
        }
        updateProfileStatus(currentProfile);
        showDashboard();
      } catch (err) {
        showError('auth-login-error', err.message || 'Erreur de connexion');
      }
    });
  }

  function bindForgotPassword() {
    var forgotLink = $('forgot-password-link');
    var backLink = $('back-to-login-link');
    if (!forgotLink || !backLink) return;
    forgotLink.addEventListener('click', function (e) { e.preventDefault(); showAuthForm('auth-forgot-form'); });
    backLink.addEventListener('click', function (e) { e.preventDefault(); showAuthForm('auth-login-form'); });

    $('auth-forgot-form').addEventListener('submit', async function (e) {
      e.preventDefault();
      hideError('auth-forgot-error'); hide($('auth-forgot-success'));
      var email = $('forgot-email').value.trim();
      if (!email) { showError('auth-forgot-error', 'Entrez votre adresse email.'); return; }
      try {
        var { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/dashboard/' });
        if (error) throw error;
        showSuccess('auth-forgot-success', 'Un email de réinitialisation vous a été envoyé. Vérifiez votre boîte de réception.');
      } catch (err) {
        showError('auth-forgot-error', err.message || 'Erreur lors de l\'envoi.');
      }
    });
  }

  function bindResetForm() {
    var form = $('auth-reset-form');
    if (!form) return;
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      hideError('auth-reset-error'); hide($('auth-reset-success'));
      var pw1 = $('reset-password').value;
      var pw2 = $('reset-password2').value;
      var pwError = validatePassword(pw1);
      if (pwError) { showError('auth-reset-error', pwError); return; }
      if (pw1 !== pw2) { showError('auth-reset-error', 'Les mots de passe ne correspondent pas.'); return; }
      try {
        var { error } = await supabase.auth.updateUser({ password: pw1 });
        if (error) throw error;
        showSuccess('auth-reset-success', 'Mot de passe mis à jour ! Redirection...');
        setTimeout(function () { window.location.href = '/dashboard/'; }, 2000);
      } catch (err) {
        showError('auth-reset-error', err.message || 'Erreur lors de la réinitialisation.');
      }
    });
  }

  async function loadStatsTab() {
    if (!currentProfile || currentProfile.plan !== 'boost') {
      show($('dash-stats-locked')); hide($('dash-stats-content')); return;
    }
    hide($('dash-stats-locked')); show($('dash-stats-content'));
    try {
      var session = await checkAuth();
      var stats = await loadStats(session.access_token);
      if (stats.error) { show($('dash-stats-locked')); hide($('dash-stats-content')); return; }
      $('stat-views').textContent = stats.views || 0;
      $('stat-clicks').textContent = stats.clicks || 0;
      $('stat-rate').textContent = stats.views > 0 ? ((stats.clicks / stats.views) * 100).toFixed(1) + '%' : '—';
      var detail = $('stat-clicks-detail');
      var types = { phone: 'Appels', email: 'Emails', website: 'Site web', appointment: 'Rendez-vous' };
      detail.innerHTML = '';
      Object.keys(types).forEach(function (type) {
        var row = document.createElement('div');
        row.className = 'ann-profile-info-row';
        row.innerHTML = '<span class="ann-text-muted">' + types[type] + '</span><span class="ann-font-medium">' + ((stats.clicksByType || {})[type] || 0) + '</span>';
        detail.appendChild(row);
      });
    } catch (err) { console.error('Stats error:', err); }
  }

  // ── Invoice history ──
  var invoicesLoaded = false;
  async function loadInvoicesTab() {
    if (invoicesLoaded) return;
    var loading = $('bill-invoices-loading');
    var empty = $('bill-invoices-empty');
    var list = $('bill-invoices-list');
    var tbody = $('bill-invoices-tbody');
    if (!loading || !tbody) return;

    try {
      var { data: invoices, error } = await supabase
        .from('annuaire_invoices')
        .select('invoice_number, created_at, plan, period, amount_ttc, pdf_storage_path, paid_at')
        .order('created_at', { ascending: false });

      hide(loading);
      if (error) { console.error('[invoices]', error); show(empty); return; }
      if (!invoices || invoices.length === 0) { show(empty); return; }

      var planLabels = { pro: 'Professionnel', boost: 'Boost' };
      var periodLabels = { monthly: 'Mensuel', annual: 'Annuel' };

      tbody.innerHTML = '';
      invoices.forEach(function (inv) {
        var tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid hsl(var(--ann-border) / 0.5)';
        var date = new Date(inv.paid_at || inv.created_at).toLocaleDateString('fr-FR');
        var amount = (inv.amount_ttc / 100).toFixed(2).replace('.', ',') + ' €';
        var plan = (planLabels[inv.plan] || inv.plan) + ' — ' + (periodLabels[inv.period] || inv.period);

        var pdfCell = '';
        if (inv.pdf_storage_path) {
          pdfCell = '<button type="button" class="ann-btn ann-btn-outline ann-btn-sm" data-download-invoice="' + inv.pdf_storage_path + '" style="font-size:0.75rem;padding:0.25rem 0.625rem;">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:0.75rem;height:0.75rem"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>' +
            ' PDF</button>';
        } else {
          pdfCell = '<span class="ann-text-muted" style="font-size:0.75rem;">—</span>';
        }

        tr.innerHTML = '<td style="padding:0.625rem 0.5rem;font-weight:500;">' + inv.invoice_number + '</td>' +
          '<td style="padding:0.625rem 0.5rem;">' + date + '</td>' +
          '<td style="padding:0.625rem 0.5rem;">' + plan + '</td>' +
          '<td style="padding:0.625rem 0.5rem;text-align:right;font-weight:600;">' + amount + '</td>' +
          '<td style="padding:0.625rem 0.5rem;text-align:center;">' + pdfCell + '</td>';
        tbody.appendChild(tr);
      });

      show(list);
      invoicesLoaded = true;

      // Bind download buttons
      document.querySelectorAll('[data-download-invoice]').forEach(function (btn) {
        btn.addEventListener('click', async function () {
          var path = btn.getAttribute('data-download-invoice');
          btn.disabled = true;
          try {
            var { data, error } = await supabase.storage
              .from('annuaire-invoices')
              .download(path);
            if (error) throw error;
            var url = URL.createObjectURL(data);
            var a = document.createElement('a');
            a.href = url;
            a.download = path.split('/').pop();
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
          } catch (err) {
            alert('Erreur lors du téléchargement : ' + (err.message || err));
          } finally {
            btn.disabled = false;
          }
        });
      });
    } catch (err) {
      hide(loading); show(empty);
      console.error('[invoices]', err);
    }
  }

  // ── Billing info ──
  function isValidSiret(val) { return /^\d{14}$/.test(val); }
  function isValidTva(val) { return /^FR\d{11}$/.test(val.toUpperCase()); }

  function isBillingComplete(profile) {
    if (!profile) return false;
    return !!(profile.billing_company_name && profile.billing_siret && profile.billing_tva_number && profile.billing_address);
  }

  function fillBillingForm(profile) {
    if (!profile) return;
    var el;
    el = $('bill-company'); if (el) el.value = profile.billing_company_name || '';
    el = $('bill-siret'); if (el) el.value = profile.billing_siret || '';
    el = $('bill-tva'); if (el) el.value = profile.billing_tva_number || '';
    el = $('bill-email'); if (el) el.value = profile.billing_email || '';
    // Parse structured billing address (stored as "street\npostalcode city")
    var billAddr = profile.billing_address || '';
    var addrLines = billAddr.split('\n');
    el = $('bill-street'); if (el) el.value = addrLines[0] || '';
    if (addrLines[1]) {
      var match = addrLines[1].match(/^(\d{5})\s+(.+)$/);
      if (match) {
        el = $('bill-postalcode'); if (el) el.value = match[1];
        el = $('bill-city'); if (el) el.value = match[2];
      } else {
        el = $('bill-city'); if (el) el.value = addrLines[1];
      }
    }

    // Update plan info
    var badge = $('bill-plan-badge');
    if (badge) {
      var planLabels = { gratuit: 'Gratuit', pro: 'Professionnel', boost: 'Boost' };
      var plan = profile.plan || 'gratuit';
      badge.textContent = planLabels[plan] || plan;
      badge.className = 'ann-badge';
      if (plan === 'pro') badge.classList.add('ann-badge-primary');
      if (plan === 'boost') badge.classList.add('ann-badge-premium');
    }
    var expiry = $('bill-plan-expiry');
    if (expiry && profile.plan_expires_at) {
      var d = new Date(profile.plan_expires_at);
      expiry.textContent = 'Expire le ' + d.toLocaleDateString('fr-FR');
    }
    var upgradeLink = $('bill-upgrade-link');
    if (upgradeLink && profile.plan !== 'gratuit') {
      upgradeLink.textContent = 'Gérer mon abonnement';
    }

    // Update top plan banner
    updateTopPlanBanner(profile);

    // Show billing completeness status and plan UI
    updateBillingStatus(profile);
    updatePlanUI(profile);
  }

  function updateBillingStatus(profile) {
    var statusEl = $('bill-status');
    if (!statusEl) return;
    if (isBillingComplete(profile)) {
      statusEl.style.display = 'flex';
      statusEl.style.background = 'hsl(var(--ann-success) / 0.1)';
      statusEl.style.border = '1px solid hsl(var(--ann-success) / 0.3)';
      statusEl.style.color = 'hsl(var(--ann-success))';
      statusEl.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:1rem;height:1rem;flex-shrink:0"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Informations de facturation complètes';
    } else {
      statusEl.style.display = 'flex';
      statusEl.style.background = 'hsl(40 90% 55% / 0.08)';
      statusEl.style.border = '1px solid hsl(40 90% 55% / 0.25)';
      statusEl.style.color = 'hsl(40 70% 35%)';
      statusEl.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:1rem;height:1rem;flex-shrink:0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Informations incomplètes — obligatoires pour souscrire à un abonnement payant';
    }
  }

  // ── Billing period state ──
  var billingPeriod = 'monthly';
  var PRICES = {
    pro:   { monthly: '5,99', annual: '4,99' },
    boost: { monthly: '11,99', annual: '9,99' },
  };

  function bindBillingForm() {
    var form = $('dash-billing-form');
    if (!form) return;

    // Auto-format SIRET (digits only)
    var siretInput = $('bill-siret');
    if (siretInput) {
      siretInput.addEventListener('input', function () {
        this.value = this.value.replace(/\D/g, '').slice(0, 14);
        hideError('bill-siret-error');
      });
    }

    // Auto-format TVA
    var tvaInput = $('bill-tva');
    if (tvaInput) {
      tvaInput.addEventListener('input', function () {
        var v = this.value.toUpperCase();
        if (v.length <= 2) {
          this.value = v.replace(/[^FR]/g, '').slice(0, 2);
        } else {
          this.value = v.slice(0, 2) + v.slice(2).replace(/\D/g, '').slice(0, 11);
        }
        hideError('bill-tva-error');
      });
    }

    // Billing form submit
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      hideError('bill-error');
      hide($('bill-success'));
      hide($('bill-saved-indicator'));

      var company = ($('bill-company').value || '').trim();
      var siret = ($('bill-siret').value || '').trim();
      var tva = ($('bill-tva').value || '').trim().toUpperCase();
      var billingEmail = ($('bill-email').value || '').trim();
      var billStreet = ($('bill-street').value || '').trim();
      var billPostalcode = ($('bill-postalcode').value || '').trim();
      var billCity = ($('bill-city').value || '').trim();

      if (!company) { showError('bill-error', 'Le nom de l\'entreprise est obligatoire.'); return; }
      if (!siret || !isValidSiret(siret)) {
        showError('bill-siret-error', 'Le SIRET doit contenir exactement 14 chiffres.');
        showError('bill-error', 'Veuillez corriger les erreurs ci-dessus.'); return;
      }
      if (!tva || !isValidTva(tva)) {
        showError('bill-tva-error', 'Format attendu : FR + 11 chiffres (ex: FR12345678901).');
        showError('bill-error', 'Veuillez corriger les erreurs ci-dessus.'); return;
      }
      if (billingEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billingEmail)) {
        showError('bill-email-error', 'Format d\'email invalide.');
        showError('bill-error', 'Veuillez corriger les erreurs ci-dessus.'); return;
      }
      if (!billStreet) { showError('bill-error', 'Le numéro et la rue sont obligatoires.'); return; }
      if (!billPostalcode) { showError('bill-error', 'Le code postal est obligatoire.'); return; }
      if (!billCity) { showError('bill-error', 'La ville est obligatoire.'); return; }

      var address = billStreet + '\n' + billPostalcode + ' ' + billCity;

      var btn = $('bill-save-btn');
      btn.disabled = true; btn.textContent = 'Enregistrement...';

      try {
        var session = await checkAuth();
        if (!session) { showError('bill-error', 'Session expirée. Reconnectez-vous.'); return; }

        var data = {
          billing_company_name: company,
          billing_siret: siret,
          billing_tva_number: tva,
          billing_email: billingEmail || null,
          billing_address: address
        };

        // Reload profile to ensure it's current before saving billing
        if (!currentProfile || !currentProfile.id) {
          currentProfile = await loadProfile(session.access_token);
        }
        if (!currentProfile || !currentProfile.id) {
          showError('bill-error', 'Votre fiche professionnelle n\'a pas encore été créée. Complétez d\'abord l\'onglet "Ma fiche" puis réessayez.');
          return;
        }
        var res = await saveProfile(data, session.access_token, false);
        if (res.error || res.msg) {
          showError('bill-error', res.error || res.msg);
        } else if (res.profile) {
          currentProfile = res.profile;
          updateBillingStatus(currentProfile);
          updatePlanUI(currentProfile);
          $('bill-success').textContent = 'Informations de facturation enregistrées !';
          show($('bill-success'));
          show($('bill-saved-indicator'));
          setTimeout(function () { hide($('bill-success')); }, 4000);
        }
      } catch (err) {
        showError('bill-error', err.message || 'Erreur serveur');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:1rem;height:1rem"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Enregistrer';
      }
    });

    // Period toggle (monthly / annual)
    document.querySelectorAll('[data-bill-period]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('[data-bill-period]').forEach(function (b) { b.classList.remove('ann-auth-tab-active'); });
        btn.classList.add('ann-auth-tab-active');
        billingPeriod = btn.getAttribute('data-bill-period');
        if ($('bill-price-pro')) $('bill-price-pro').textContent = PRICES.pro[billingPeriod];
        if ($('bill-price-boost')) $('bill-price-boost').textContent = PRICES.boost[billingPeriod];
      });
    });

    // Checkout buttons
    document.querySelectorAll('[data-checkout]').forEach(function (btn) {
      btn.addEventListener('click', async function () {
        hideError('bill-checkout-error');

        if (!currentProfile || !isBillingComplete(currentProfile)) {
          show($('bill-incomplete-warning'));
          showError('bill-checkout-error', 'Veuillez d\'abord renseigner vos informations de facturation ci-dessus.');
          return;
        }

        var plan = btn.getAttribute('data-checkout');
        var priceKey = plan + '_' + billingPeriod;

        btn.disabled = true;
        var origText = btn.textContent;
        btn.textContent = 'Redirection...';

        try {
          var session = await checkAuth();
          if (!session) { showError('bill-checkout-error', 'Session expirée.'); return; }

          var res = await apiCall('annuaire-checkout', 'POST', { price_key: priceKey }, session.access_token);

          if (res.error === 'billing_incomplete') {
            show($('bill-incomplete-warning'));
            showError('bill-checkout-error', 'Veuillez d\'abord renseigner vos informations de facturation ci-dessus.');
            return;
          }
          if (res.error === 'profile_not_validated') {
            showError('bill-checkout-error', 'Votre fiche doit d\'abord être validée par notre équipe avant de pouvoir souscrire à un abonnement. Vous recevrez un email dès qu\'elle sera en ligne.');
            return;
          }
          if (res.error) {
            showError('bill-checkout-error', res.error);
            return;
          }
          if (res.url) {
            window.location.href = res.url;
          }
        } catch (err) {
          showError('bill-checkout-error', err.message || 'Erreur lors de la redirection vers Stripe');
        } finally {
          btn.disabled = false;
          btn.textContent = origText;
        }
      });
    });

    // Stripe billing portal button
    var portalBtn = $('bill-portal-btn');
    if (portalBtn) {
      portalBtn.addEventListener('click', async function () {
        portalBtn.disabled = true;
        portalBtn.textContent = 'Redirection...';
        try {
          var session = await checkAuth();
          if (!session) { alert('Session expirée.'); return; }
          var res = await apiCall('annuaire-billing-portal', 'POST', {}, session.access_token);
          if (res.url) {
            window.location.href = res.url;
          } else {
            alert(res.error || 'Erreur lors de l\'ouverture du portail.');
          }
        } catch (err) {
          alert('Erreur: ' + (err.message || err));
        } finally {
          portalBtn.disabled = false;
          portalBtn.textContent = 'Gérer mon abonnement';
        }
      });
    }

    // Handle checkout success/cancel from URL params
    var params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'success') {
      setTimeout(function () {
        // Show thank you banner immediately
        var thanksBanner = $('dash-checkout-thanks');
        if (thanksBanner) {
          var thanksPlan = $('dash-thanks-plan');
          if (thanksPlan) thanksPlan.textContent = '';
          show(thanksBanner);
          thanksBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
      window.history.replaceState({}, '', window.location.pathname);

      // Poll for plan update (webhook may take a few seconds)
      var pollCount = 0;
      var pollInterval = setInterval(async function () {
        pollCount++;
        try {
          var session = await checkAuth();
          if (session) {
            var freshProfile = await loadProfile(session.access_token);
            if (freshProfile && freshProfile.plan && freshProfile.plan !== 'gratuit') {
              clearInterval(pollInterval);
              currentProfile = freshProfile;
              fillForm(currentProfile);
              updateBillingStatus(currentProfile);
              updatePlanUI(currentProfile);
              updateProfileStatus(currentProfile);
              updateTopPlanBanner(currentProfile);
              // Show thank you message
              var planLabels = { pro: 'Professionnel', boost: 'Boost' };
              var thanksBanner = $('dash-checkout-thanks');
              var thanksPlan = $('dash-thanks-plan');
              if (thanksBanner && thanksPlan) {
                thanksPlan.textContent = planLabels[freshProfile.plan] || freshProfile.plan;
                show(thanksBanner);
                thanksBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }
          }
        } catch (e) { /* ignore polling errors */ }
        if (pollCount >= 20) {
          clearInterval(pollInterval);
          showError('bill-success', 'Le paiement a été reçu mais l\'activation prend plus de temps que prévu. Rechargez la page dans quelques instants.');
        }
      }, 3000); // Check every 3 seconds, up to 60 seconds
    } else if (params.get('checkout') === 'cancel') {
      setTimeout(function () {
        var billingTab = document.querySelector('[data-dash-tab="billing"]');
        if (billingTab) billingTab.click();
      }, 500);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }

  function updateTopPlanBanner(profile) {
    var banner = $('dash-plan-banner');
    if (!banner || !profile) return;
    var planLabels = { gratuit: 'Gratuit', pro: 'Professionnel', boost: 'Boost' };
    var plan = profile.plan || 'gratuit';

    var topBadge = $('dash-top-plan-badge');
    if (topBadge) {
      topBadge.textContent = planLabels[plan] || plan;
      topBadge.className = 'ann-badge';
      if (plan === 'pro') topBadge.classList.add('ann-badge-primary');
      if (plan === 'boost') topBadge.classList.add('ann-badge-premium');
    }

    var topExpiry = $('dash-top-plan-expiry');
    if (topExpiry && profile.plan_expires_at) {
      var d = new Date(profile.plan_expires_at);
      topExpiry.textContent = '· Expire le ' + d.toLocaleDateString('fr-FR');
    } else if (topExpiry) {
      topExpiry.textContent = '';
    }

    var actionBtn = $('dash-top-plan-action');
    if (actionBtn) {
      if (plan === 'gratuit') {
        actionBtn.textContent = 'Passer à un abonnement';
        show(actionBtn);
        actionBtn.onclick = function(e) {
          e.preventDefault();
          var billingTab = document.querySelector('[data-dash-tab="billing"]');
          if (billingTab) billingTab.click();
        };
      } else {
        hide(actionBtn);
      }
    }

    show(banner);
  }

  function updatePlanUI(profile) {
    if (!profile) return;
    var plan = profile.plan || 'gratuit';
    var hasSub = plan !== 'gratuit' && profile.stripe_subscription_id;

    // Show/hide manage button
    var manageSub = $('bill-manage-sub');
    if (manageSub) {
      if (hasSub) show(manageSub); else hide(manageSub);
    }

    // Show/hide billing incomplete warning
    var warning = $('bill-incomplete-warning');
    if (warning) {
      if (!isBillingComplete(profile) && plan === 'gratuit') show(warning); else hide(warning);
    }

    // Update checkout button labels for current plan
    document.querySelectorAll('[data-checkout]').forEach(function (btn) {
      var btnPlan = btn.getAttribute('data-checkout');
      if (btnPlan === plan) {
        btn.textContent = 'Formule actuelle';
        btn.disabled = true;
        btn.style.opacity = '0.5';
      } else {
        btn.textContent = hasSub ? 'Changer' : 'Souscrire';
        btn.disabled = false;
        btn.style.opacity = '';
      }
    });

    // Highlight current plan card
    var proCard = $('bill-card-pro');
    var boostCard = $('bill-card-boost');
    if (proCard) proCard.style.borderColor = plan === 'pro' ? 'hsl(var(--ann-primary))' : 'transparent';
    if (boostCard) boostCard.style.borderColor = plan === 'boost' ? 'hsl(var(--ann-primary))' : 'hsl(var(--ann-primary) / 0.3)';
  }

  function bindDeleteAccount() {
    var toggleBtn = $('dash-delete-toggle');
    var confirmBox = $('dash-delete-confirm');
    var cancelBtn = $('dash-delete-cancel');
    var deleteBtn = $('dash-delete-btn');
    var emailInput = $('delete-email-confirm');
    if (!toggleBtn || !confirmBox) return;

    toggleBtn.addEventListener('click', function () {
      show(confirmBox); toggleBtn.style.display = 'none';
      emailInput.value = ''; deleteBtn.disabled = true; hideError('dash-delete-error');
    });
    cancelBtn.addEventListener('click', function () {
      hide(confirmBox); toggleBtn.style.display = '';
      emailInput.value = ''; deleteBtn.disabled = true; hideError('dash-delete-error');
    });
    emailInput.addEventListener('input', function () {
      deleteBtn.disabled = !currentUser || emailInput.value.trim().toLowerCase() !== currentUser.email.toLowerCase();
    });
    deleteBtn.addEventListener('click', async function () {
      if (!currentUser || emailInput.value.trim().toLowerCase() !== currentUser.email.toLowerCase()) return;
      hideError('dash-delete-error');
      deleteBtn.disabled = true; deleteBtn.textContent = 'Suppression...';
      try {
        var session = await checkAuth();
        if (!session) { showError('dash-delete-error', 'Session expirée.'); return; }
        var res = await apiCall('annuaire-profile', 'DELETE', null, session.access_token);
        if (res.error) {
          showError('dash-delete-error', res.error);
          deleteBtn.disabled = false; deleteBtn.textContent = 'Supprimer définitivement';
          return;
        }
        await supabase.auth.signOut();
        localStorage.removeItem('sb-lojvajnnvhatfplevyvy-auth-token');
        window.location.href = '/?deleted=1';
      } catch (err) {
        showError('dash-delete-error', err.message || 'Erreur lors de la suppression.');
        deleteBtn.disabled = false; deleteBtn.textContent = 'Supprimer définitivement';
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
