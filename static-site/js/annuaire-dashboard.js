/**
 * Annuaire Dashboard — Client-side JavaScript
 * Handles: Auth, Profile CRUD, Photo upload, Stats, Forgot/Reset password
 */
(function () {
  'use strict';

  var SUPABASE_URL = 'https://lojvajnnvhatfplevyvy.supabase.co';
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvanZham5udmhhdGZwbGV2eXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNzk3NDIsImV4cCI6MjA4Nzg1NTc0Mn0.gdd9HRbRvfQr6io9jGN6hUCW6tBOtognhwbsTJtSTng';

  var supabase = null;
  var currentUser = null;
  var currentProfile = null;

  // ── Password validation ──
  function validatePassword(pw) {
    if (pw.length < 10) return 'Minimum 10 caractères.';
    if (!/[A-Z]/.test(pw)) return 'Le mot de passe doit contenir au moins une majuscule.';
    if (!/[^a-zA-Z0-9]/.test(pw)) return 'Le mot de passe doit contenir au moins un caractère spécial.';
    return null;
  }

  // ── Init Supabase ──
  function initSupabase() {
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }
  }

  // ── API helpers ──
  function apiCall(endpoint, method, body, token) {
    var opts = {
      method: method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
      },
    };
    if (token) opts.headers['Authorization'] = 'Bearer ' + token;
    if (body) opts.body = JSON.stringify(body);
    return fetch(SUPABASE_URL + '/functions/v1/' + endpoint, opts).then(function (r) { return r.json(); });
  }

  // ── DOM helpers ──
  function $(id) { return document.getElementById(id); }
  function show(el) { if (el) el.style.display = ''; }
  function hide(el) { if (el) el.style.display = 'none'; }
  function showError(id, msg) {
    var el = $(id);
    if (el) { el.textContent = msg; el.style.display = 'block'; el.style.color = ''; }
  }
  function hideError(id) {
    var el = $(id);
    if (el) el.style.display = 'none';
  }
  function showSuccess(id, msg) {
    var el = $(id);
    if (el) { el.textContent = msg; el.style.display = 'block'; }
  }

  // ── Auth ──
  async function checkAuth() {
    if (!supabase) return null;
    var { data } = await supabase.auth.getSession();
    return data.session;
  }

  async function login(email, password) {
    var { data, error } = await supabase.auth.signInWithPassword({ email: email, password: password });
    if (error) throw error;
    return data;
  }

  async function register(email, password) {
    var { data, error } = await supabase.auth.signUp({ email: email, password: password });
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
    return res.profile || null;
  }

  async function saveProfile(data, token, isNew) {
    return apiCall('annuaire-profile', isNew ? 'POST' : 'PUT', data, token);
  }

  // ── Photo upload ──
  async function uploadPhoto(file, userId) {
    var ext = file.name.split('.').pop().toLowerCase();
    if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
      throw new Error('Format non supporté. Utilisez JPEG, PNG ou WebP.');
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Photo trop lourde (5 Mo max).');
    }

    var path = userId + '/photo.' + ext;
    var { data, error } = await supabase.storage
      .from('annuaire-photos')
      .upload(path, file, { upsert: true, contentType: file.type });

    if (error) throw error;

    var { data: urlData } = supabase.storage
      .from('annuaire-photos')
      .getPublicUrl(path);

    return urlData.publicUrl;
  }

  // ── Stats ──
  async function loadStats(token) {
    return apiCall('annuaire-stats', 'GET', null, token);
  }

  // ── Screen management ──
  function showAuthScreen() {
    show($('ann-dash'));
    hide($('ann-dash-loading'));
    show($('dash-auth'));
    hide($('dash-main'));
  }

  function showDashboard() {
    show($('ann-dash'));
    hide($('ann-dash-loading'));
    hide($('dash-auth'));
    show($('dash-main'));
  }

  function showAuthForm(formId) {
    hide($('auth-login-form'));
    hide($('auth-register-form'));
    hide($('auth-forgot-form'));
    hide($('auth-reset-form'));
    show($(formId));
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
    $('prof-methods').value = (profile.methods || []).join(', ');
    $('prof-languages').value = (profile.languages || []).join(', ');
    $('prof-availability').value = profile.availability || '';

    // Update char count
    var descEl = $('prof-description');
    if (descEl) $('prof-desc-count').textContent = (descEl.value || '').length;

    // Photo preview
    if (profile.photo_url) {
      var safeUrl = profile.photo_url.replace(/[&<>"']/g, function (c) { return '&#' + c.charCodeAt(0) + ';'; });
      $('dash-photo-preview').innerHTML = '<img src="' + safeUrl + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" alt="Photo de profil">';
    }

    // View profile link
    if (profile.slug && profile.is_published) {
      var link = $('dash-view-profile');
      link.href = '/' + (profile.specialty || '') + '/' + (profile.city || '') + '/' + profile.slug + '/';
      show(link);
    }
  }

  function getFormData() {
    return {
      first_name: $('prof-firstname').value.trim(),
      last_name: $('prof-lastname').value.trim(),
      specialty: $('prof-specialty').value,
      city: $('prof-city').value,
      email: $('prof-email').value.trim(),
      phone: $('prof-phone').value.trim() || null,
      address: $('prof-address').value.trim() || null,
      website: $('prof-website').value.trim() || null,
      description: $('prof-description').value.trim(),
      years_experience: parseInt($('prof-experience').value) || 0,
      price_range: $('prof-price').value.trim() || null,
      methods: $('prof-methods').value.split(',').map(function (m) { return m.trim(); }).filter(Boolean),
      languages: $('prof-languages').value.split(',').map(function (l) { return l.trim(); }).filter(Boolean),
      availability: $('prof-availability').value.trim() || null,
    };
  }

  // ── Profile status banner ──
  function updateProfileStatus(profile) {
    var banner = $('dash-status-banner');
    if (!banner) return;
    if (!profile) {
      banner.style.display = 'none';
      return;
    }
    banner.style.display = '';
    if (profile.is_published) {
      banner.style.background = 'hsl(160 60% 45% / 0.08)';
      banner.style.borderColor = 'hsl(160 60% 45% / 0.3)';
      banner.innerHTML = '<div style="display:flex;align-items:center;gap:0.75rem"><svg viewBox="0 0 24 24" fill="none" stroke="hsl(160 60% 45%)" stroke-width="2" style="width:1.25rem;height:1.25rem;flex-shrink:0"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><div><strong style="color:hsl(160 60% 35%)">Fiche en ligne</strong><p style="font-size:0.8125rem;color:hsl(var(--ann-muted-fg));margin-top:0.125rem">Votre fiche est visible par les patients.</p></div></div>';
    } else {
      banner.style.background = 'hsl(40 90% 55% / 0.08)';
      banner.style.borderColor = 'hsl(40 90% 55% / 0.3)';
      banner.innerHTML = '<div style="display:flex;align-items:center;gap:0.75rem"><svg viewBox="0 0 24 24" fill="none" stroke="hsl(40 90% 45%)" stroke-width="2" style="width:1.25rem;height:1.25rem;flex-shrink:0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><div><strong style="color:hsl(40 70% 35%)">En attente de validation</strong><p style="font-size:0.8125rem;color:hsl(var(--ann-muted-fg));margin-top:0.125rem">Votre fiche est en cours de vérification par notre équipe. Ce processus prend 24h à 72h.</p></div></div>';
    }
  }

  // ── Detect recovery redirect (password reset flow) ──
  function isRecoveryRedirect() {
    var hash = window.location.hash;
    if (hash && hash.includes('type=recovery')) return true;
    var params = new URLSearchParams(window.location.search);
    if (params.get('type') === 'recovery') return true;
    return false;
  }

  // ── Init ──
  async function init() {
    initSupabase();
    if (!supabase) {
      hide($('ann-dash-loading'));
      show($('ann-dash'));
      show($('dash-auth'));
      return;
    }

    // Check if this is a password recovery redirect
    if (isRecoveryRedirect()) {
      hide($('ann-dash-loading'));
      show($('ann-dash'));
      show($('dash-auth'));
      showAuthForm('auth-reset-form');
      bindResetForm();
      bindForgotPassword();
      bindAuthTabs();
      return;
    }

    var session = await checkAuth();
    if (session) {
      currentUser = session.user;
      try {
        currentProfile = await loadProfile(session.access_token);
      } catch (e) { /* no profile yet */ }

      // Auto-create profile from user_metadata (post email confirmation flow)
      if (!currentProfile && currentUser.user_metadata && currentUser.user_metadata.has_pending_profile) {
        try {
          var meta = currentUser.user_metadata.annuaire_profile;
          if (meta) {
            var res = await saveProfile(meta, session.access_token, true);
            if (res.profile) {
              currentProfile = res.profile;
              // Clear the pending flag from user_metadata
              await supabase.auth.updateUser({ data: { has_pending_profile: false } });
            }
          }
        } catch (e) { console.warn('Auto-create profile failed:', e); }
      }

      // Check if account is approved (profile exists but not published)
      if (currentProfile && !currentProfile.is_published) {
        $('dash-welcome').textContent = 'Connecté en tant que ' + currentUser.email;
        fillForm(currentProfile);
        updateProfileStatus(currentProfile);
        showDashboard();
      } else if (currentProfile && currentProfile.is_published) {
        $('dash-welcome').textContent = 'Connecté en tant que ' + currentUser.email;
        fillForm(currentProfile);
        updateProfileStatus(currentProfile);
        showDashboard();
      } else {
        // No profile yet — show dashboard so they can create one
        $('dash-welcome').textContent = 'Connecté en tant que ' + currentUser.email;
        showDashboard();
      }
    } else {
      showAuthScreen();
    }

    bindAuthTabs();
    bindLoginForm();
    bindRegisterForm();
    bindForgotPassword();
    bindResetForm();

    // ── Logout ──
    $('dash-logout').addEventListener('click', logout);

    // ── Dashboard tabs ──
    document.querySelectorAll('[data-dash-tab]').forEach(function (btn) {
      btn.addEventListener('click', async function () {
        document.querySelectorAll('[data-dash-tab]').forEach(function (b) { b.classList.remove('ann-auth-tab-active'); });
        btn.classList.add('ann-auth-tab-active');
        var tab = btn.getAttribute('data-dash-tab');
        hide($('dash-tab-profile'));
        hide($('dash-tab-stats'));
        show($('dash-tab-' + tab));

        if (tab === 'stats') {
          await loadStatsTab();
        }
      });
    });

    // ── Description char count ──
    $('prof-description').addEventListener('input', function () {
      $('prof-desc-count').textContent = this.value.length;
    });

    // ── Photo upload ──
    $('dash-photo-input').addEventListener('change', async function () {
      var file = this.files[0];
      if (!file) return;
      try {
        var session = await checkAuth();
        if (!session) { alert('Session expirée. Reconnectez-vous.'); return; }
        var url = await uploadPhoto(file, session.user.id);
        $('dash-photo-preview').innerHTML = '<img src="' + url + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" alt="Photo">';
        // Save URL to profile
        await saveProfile({ photo_url: url }, session.access_token, !currentProfile);
      } catch (err) {
        alert(err.message || 'Erreur lors de l\'upload');
      }
    });

    // ── Profile save ──
    $('dash-profile-form').addEventListener('submit', async function (e) {
      e.preventDefault();
      hideError('dash-profile-error');
      hide($('dash-profile-success'));

      var session = await checkAuth();
      if (!session) { showError('dash-profile-error', 'Session expirée. Reconnectez-vous.'); return; }

      var data = getFormData();
      var btn = $('dash-save-btn');
      btn.disabled = true;
      btn.textContent = 'Enregistrement...';

      try {
        var res = await saveProfile(data, session.access_token, !currentProfile);
        if (res.error) {
          showError('dash-profile-error', res.error);
        } else {
          currentProfile = res.profile;
          updateProfileStatus(currentProfile);
          $('dash-profile-success').textContent = 'Fiche enregistrée avec succès !';
          show($('dash-profile-success'));
          if (currentProfile.slug && currentProfile.is_published) {
            var link = $('dash-view-profile');
            link.href = '/' + (currentProfile.specialty || '') + '/' + (currentProfile.city || '') + '/' + currentProfile.slug + '/';
            show(link);
          }
        }
      } catch (err) {
        showError('dash-profile-error', err.message || 'Erreur serveur');
      } finally {
        btn.disabled = false;
        btn.textContent = 'Enregistrer';
      }
    });
  }

  // ── Auth tabs ──
  function bindAuthTabs() {
    $('auth-tab-login').addEventListener('click', function () {
      this.classList.add('ann-auth-tab-active');
      $('auth-tab-register').classList.remove('ann-auth-tab-active');
      showAuthForm('auth-login-form');
    });
    $('auth-tab-register').addEventListener('click', function () {
      this.classList.add('ann-auth-tab-active');
      $('auth-tab-login').classList.remove('ann-auth-tab-active');
      showAuthForm('auth-register-form');
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

        // If profile exists but not published → show waiting message
        if (currentProfile && !currentProfile.is_published) {
          $('dash-welcome').textContent = 'Connecté en tant que ' + currentUser.email;
          fillForm(currentProfile);
          updateProfileStatus(currentProfile);
          showDashboard();
          return;
        }

        $('dash-welcome').textContent = 'Connecté en tant que ' + currentUser.email;
        if (currentProfile) fillForm(currentProfile);
        updateProfileStatus(currentProfile);
        showDashboard();
      } catch (err) {
        showError('auth-login-error', err.message || 'Erreur de connexion');
      }
    });
  }

  // ── Register form ──
  function bindRegisterForm() {
    $('auth-register-form').addEventListener('submit', async function (e) {
      e.preventDefault();
      hideError('auth-register-error');
      var pw1 = $('reg-password').value;
      var pw2 = $('reg-password2').value;

      // Validate password strength
      var pwError = validatePassword(pw1);
      if (pwError) {
        showError('auth-register-error', pwError);
        return;
      }

      if (pw1 !== pw2) {
        showError('auth-register-error', 'Les mots de passe ne correspondent pas.');
        return;
      }
      try {
        var data = await register($('reg-email').value.trim(), pw1);
        if (data.user && !data.session) {
          // Email confirmation required
          var el = $('auth-register-error');
          el.textContent = 'Un email de confirmation vous a été envoyé. Vérifiez votre boîte de réception (et vos spams).';
          el.style.display = 'block';
          el.style.color = 'hsl(var(--ann-success))';
          return;
        }
        currentUser = data.user;
        $('dash-welcome').textContent = 'Connecté en tant que ' + currentUser.email;
        showDashboard();
      } catch (err) {
        showError('auth-register-error', err.message || 'Erreur lors de l\'inscription');
      }
    });
  }

  // ── Forgot password ──
  function bindForgotPassword() {
    var forgotLink = $('forgot-password-link');
    var backLink = $('back-to-login-link');
    if (!forgotLink || !backLink) return;

    forgotLink.addEventListener('click', function (e) {
      e.preventDefault();
      showAuthForm('auth-forgot-form');
    });

    backLink.addEventListener('click', function (e) {
      e.preventDefault();
      showAuthForm('auth-login-form');
    });

    $('auth-forgot-form').addEventListener('submit', async function (e) {
      e.preventDefault();
      hideError('auth-forgot-error');
      hide($('auth-forgot-success'));

      var email = $('forgot-email').value.trim();
      if (!email) {
        showError('auth-forgot-error', 'Entrez votre adresse email.');
        return;
      }

      try {
        var { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '/dashboard/',
        });
        if (error) throw error;
        showSuccess('auth-forgot-success', 'Un email de réinitialisation vous a été envoyé. Vérifiez votre boîte de réception.');
      } catch (err) {
        showError('auth-forgot-error', err.message || 'Erreur lors de l\'envoi.');
      }
    });
  }

  // ── Reset password form (after recovery redirect) ──
  function bindResetForm() {
    var form = $('auth-reset-form');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      hideError('auth-reset-error');
      hide($('auth-reset-success'));

      var pw1 = $('reset-password').value;
      var pw2 = $('reset-password2').value;

      var pwError = validatePassword(pw1);
      if (pwError) {
        showError('auth-reset-error', pwError);
        return;
      }

      if (pw1 !== pw2) {
        showError('auth-reset-error', 'Les mots de passe ne correspondent pas.');
        return;
      }

      try {
        var { error } = await supabase.auth.updateUser({ password: pw1 });
        if (error) throw error;
        showSuccess('auth-reset-success', 'Mot de passe mis à jour ! Redirection...');
        // Clear hash and redirect
        setTimeout(function () {
          window.location.href = '/dashboard/';
        }, 2000);
      } catch (err) {
        showError('auth-reset-error', err.message || 'Erreur lors de la réinitialisation.');
      }
    });
  }

  // ── Stats tab ──
  async function loadStatsTab() {
    if (!currentProfile || currentProfile.plan !== 'boost') {
      show($('dash-stats-locked'));
      hide($('dash-stats-content'));
      return;
    }

    hide($('dash-stats-locked'));
    show($('dash-stats-content'));

    try {
      var session = await checkAuth();
      var stats = await loadStats(session.access_token);
      if (stats.error) {
        show($('dash-stats-locked'));
        hide($('dash-stats-content'));
        return;
      }

      $('stat-views').textContent = stats.views || 0;
      $('stat-clicks').textContent = stats.clicks || 0;
      var rate = stats.views > 0 ? ((stats.clicks / stats.views) * 100).toFixed(1) + '%' : '—';
      $('stat-rate').textContent = rate;

      // Click details
      var detail = $('stat-clicks-detail');
      var types = { phone: 'Appels', email: 'Emails', website: 'Site web', appointment: 'Rendez-vous' };
      detail.innerHTML = '';
      Object.keys(types).forEach(function (type) {
        var row = document.createElement('div');
        row.className = 'ann-profile-info-row';
        row.innerHTML = '<span class="ann-text-muted">' + types[type] + '</span><span class="ann-font-medium">' + ((stats.clicksByType || {})[type] || 0) + '</span>';
        detail.appendChild(row);
      });
    } catch (err) {
      console.error('Stats error:', err);
    }
  }

  // ── Start ──
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
