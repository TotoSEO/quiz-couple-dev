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
  function buildBubbles(containerId, items, selectedItems, maxItems) {
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
        if (maxItems && checked.length > maxItems) {
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
  function rebuildMethods(specialty, selectedMethods) {
    var plan = (currentProfile && currentProfile.plan) || 'gratuit';
    var maxMethods = METHODS_LIMITS[plan] || 3;
    var limitEl = $('prof-methods-limit');
    if (limitEl) limitEl.textContent = '(max ' + maxMethods + ')';

    var allMethods = [];
    if (specialty && METHODS_BY_SPECIALTY[specialty]) {
      allMethods = METHODS_BY_SPECIALTY[specialty];
    } else {
      Object.values(METHODS_BY_SPECIALTY).forEach(function (methods) {
        methods.forEach(function (m) { if (allMethods.indexOf(m) === -1) allMethods.push(m); });
      });
    }
    buildBubbles('prof-methods-container', allMethods, selectedMethods || [], maxMethods);
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
        fetch('https://nominatim.openstreetmap.org/search?format=json&countrycodes=fr&limit=5&q=' + encodeURIComponent(query), {
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
              input.value = r.display_name;
              suggestions.style.display = 'none';
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
    if (data.session) return data.session;
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
    if (file.size > 5 * 1024 * 1024) throw new Error('Photo trop lourde (5 Mo max).');
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

  function fillForm(profile) {
    if (!profile) return;
    $('prof-firstname').value = profile.first_name || '';
    $('prof-lastname').value = profile.last_name || '';
    $('prof-specialty').value = profile.specialty || '';
    $('prof-city').value = profile.city || '';
    $('prof-email').value = profile.email || '';
    $('prof-phone').value = profile.phone || '';
    $('prof-address').value = profile.address || '';
    $('prof-website').value = profile.website || '';
    $('prof-description').value = profile.description || '';
    $('prof-experience').value = profile.years_experience || '';
    $('prof-price').value = profile.price_range || '';

    // Update char count
    var descEl = $('prof-description');
    if (descEl) $('prof-desc-count').textContent = (descEl.value || '').length;

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
      website: $('prof-website').disabled ? undefined : ($('prof-website').value.trim() || null),
      description: $('prof-description').value.trim(),
      years_experience: parseInt($('prof-experience').value) || 0,
      price_range: $('prof-price').value.trim() || null,
      methods: getSelectedBubbles('prof-methods-container'),
      languages: getSelectedBubbles('prof-languages-container'),
      availability: getSelectedBubbles('prof-availability-container').join(', ') || null,
    };
    var gpiInput = $('prof-google-place-id');
    if (gpiInput && $('dash-google-reviews-section') && $('dash-google-reviews-section').style.display !== 'none') {
      data.google_place_id = gpiInput.value.trim() || null;
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
      } else {
        if (pendingMeta) fillForm(pendingMeta);
        updateProfileStatus(null);
      }
      showDashboard();
    } else {
      showAuthScreen();
    }

    bindLoginForm(); bindForgotPassword(); bindResetForm(); bindDeleteAccount();

    $('dash-logout').addEventListener('click', logout);

    // Dashboard tabs
    document.querySelectorAll('[data-dash-tab]').forEach(function (btn) {
      btn.addEventListener('click', async function () {
        document.querySelectorAll('[data-dash-tab]').forEach(function (b) { b.classList.remove('ann-auth-tab-active'); });
        btn.classList.add('ann-auth-tab-active');
        var tab = btn.getAttribute('data-dash-tab');
        hide($('dash-tab-profile')); hide($('dash-tab-stats'));
        show($('dash-tab-' + tab));
        if (tab === 'stats') await loadStatsTab();
      });
    });

    // Description char count
    $('prof-description').addEventListener('input', function () {
      $('prof-desc-count').textContent = this.value.length;
    });

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
        $('dash-photo-preview').innerHTML = '<img src="' + url + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" alt="Photo">';
        await saveProfile({ photo_url: url }, session.access_token, !currentProfile);
      } catch (err) {
        alert(err.message || 'Erreur lors de l\'upload');
      }
    });

    // Profile save
    $('dash-profile-form').addEventListener('submit', async function (e) {
      e.preventDefault();
      hideError('dash-profile-error');
      hide($('dash-profile-success'));

      var session = await checkAuth();
      if (!session) { showError('dash-profile-error', 'Session expirée. Reconnectez-vous.'); return; }

      var data = getFormData();
      var btn = $('dash-save-btn');
      btn.disabled = true; btn.textContent = 'Enregistrement...';

      try {
        var isNew = !currentProfile;
        var res = await saveProfile(data, session.access_token, isNew);
        if (res.error || res.msg) {
          showError('dash-profile-error', res.error || res.msg);
        } else if (res.profile) {
          currentProfile = res.profile;
          updateProfileStatus(currentProfile);
          $('dash-profile-success').textContent = 'Fiche enregistrée avec succès !';
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
