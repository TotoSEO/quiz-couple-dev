/**
 * Annuaire Admin - Dedicated professional moderation dashboard
 * Uses the same HMAC admin token verification as the main site admin
 */
(function () {
  'use strict';

  var SUPABASE_URL;
  var adminToken = null;
  var allProfiles = [];
  var currentFilter = 'all';

  var SPEC_LABELS = {
    'therapeute-de-couple': 'Therapeute de couple',
    'sexologue': 'Sexologue',
    'sexotherapeute': 'Sexotherapeute',
    'mediateur-familial': 'Mediateur familial',
    'coach-parental': 'Coach parental',
    'conseiller-conjugal': 'Conseiller conjugal',
  };

  // ── Auth ──

  function login() {
    var pw = document.getElementById('ann-admin-pw');
    var errEl = document.getElementById('ann-admin-error');
    if (!pw || !pw.value.trim()) return;

    errEl.style.display = 'none';

    fetch(SUPABASE_URL + '/functions/v1/verify-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw.value.trim() }),
    })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (data.token) {
        adminToken = data.token;
        sessionStorage.setItem('ann-admin-token', adminToken);
        showDashboard();
      } else {
        errEl.textContent = 'Mot de passe incorrect';
        errEl.style.display = 'block';
      }
    })
    .catch(function () {
      errEl.textContent = 'Erreur de connexion';
      errEl.style.display = 'block';
    });
  }

  function logout() {
    adminToken = null;
    sessionStorage.removeItem('ann-admin-token');
    document.getElementById('ann-admin-login').style.display = '';
    document.getElementById('ann-admin-dashboard').style.display = 'none';
  }

  function checkAuth() {
    var saved = sessionStorage.getItem('ann-admin-token');
    if (saved) {
      adminToken = saved;
      showDashboard();
    }
  }

  function showDashboard() {
    document.getElementById('ann-admin-login').style.display = 'none';
    document.getElementById('ann-admin-dashboard').style.display = '';
    loadProfiles();
  }

  // ── Load Profiles ──

  function loadProfiles() {
    var listEl = document.getElementById('aadm-profiles-list');
    if (!listEl) return;
    listEl.innerHTML = '<p style="text-align:center;color:hsl(var(--ann-muted-fg));padding:3rem 0;">Chargement...</p>';

    fetch(SUPABASE_URL + '/functions/v1/admin-annuaire?action=list&filter=' + currentFilter, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': adminToken,
      },
    })
    .then(function (r) {
      if (r.status === 401 || r.status === 403) {
        logout();
        var errEl = document.getElementById('ann-admin-error');
        errEl.textContent = 'Session expiree, veuillez vous reconnecter';
        errEl.style.display = 'block';
        throw new Error('unauthorized');
      }
      return r.json();
    })
    .then(function (data) {
      if (!data.success) {
        listEl.innerHTML = '<p style="text-align:center;color:hsl(0 70% 50%);padding:3rem 0;">Erreur: ' + (data.error || 'Inconnue') + '</p>';
        return;
      }
      allProfiles = data.profiles || [];

      // Update stats
      var s = data.stats || {};
      setText('aadm-stat-pending', s.pending || 0);
      setText('aadm-stat-approved', s.approved || 0);
      setText('aadm-stat-total', s.total || 0);

      renderProfiles();
    })
    .catch(function (err) {
      if (err.message !== 'unauthorized') {
        listEl.innerHTML = '<p style="text-align:center;color:hsl(0 70% 50%);padding:3rem 0;">Erreur reseau</p>';
      }
    });
  }

  function setText(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  // ── Render ──

  function renderProfiles() {
    var listEl = document.getElementById('aadm-profiles-list');
    if (!listEl) return;

    var filtered = allProfiles;
    if (currentFilter === 'pending') {
      filtered = allProfiles.filter(function (p) { return !p.is_published; });
    } else if (currentFilter === 'approved') {
      filtered = allProfiles.filter(function (p) { return p.is_published; });
    }

    if (filtered.length === 0) {
      listEl.innerHTML = '<p style="text-align:center;color:hsl(var(--ann-muted-fg));padding:3rem 0;">Aucune fiche trouvee.</p>';
      return;
    }

    listEl.innerHTML = filtered.map(function (p) {
      var statusBadge = p.is_published
        ? '<span style="display:inline-flex;padding:0.125rem 0.5rem;border-radius:9999px;font-size:0.75rem;font-weight:600;background:hsl(160 60% 45%/0.1);color:hsl(160 60% 35%);">Publie</span>'
        : '<span style="display:inline-flex;padding:0.125rem 0.5rem;border-radius:9999px;font-size:0.75rem;font-weight:600;background:hsl(40 90% 55%/0.1);color:hsl(40 70% 35%);">En attente</span>';

      var photoHtml = p.photo_url
        ? '<img src="' + p.photo_url + '" style="width:3rem;height:3rem;border-radius:50%;object-fit:cover;" alt="">'
        : '<div style="width:3rem;height:3rem;border-radius:50%;background:hsl(var(--ann-muted));display:flex;align-items:center;justify-content:center;"><svg style="width:1.25rem;height:1.25rem;color:hsl(var(--ann-muted-fg));" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>';

      var date = p.created_at ? new Date(p.created_at).toLocaleDateString('fr-FR') : '';

      var actions = '';
      if (!p.is_published) {
        actions += '<button class="ann-btn ann-btn-primary" style="font-size:0.75rem;padding:0.25rem 0.75rem;" data-action="approve" data-id="' + p.id + '">Approuver</button>';
        actions += ' <button class="ann-btn" style="font-size:0.75rem;padding:0.25rem 0.75rem;color:hsl(0 70% 50%);border:1px solid hsl(0 70% 50%/0.3);background:transparent;" data-action="reject" data-id="' + p.id + '">Rejeter</button>';
      } else {
        actions += '<button class="ann-btn" style="font-size:0.75rem;padding:0.25rem 0.75rem;color:hsl(40 70% 40%);border:1px solid hsl(40 70% 40%/0.3);background:transparent;" data-action="reject" data-id="' + p.id + '">Depublier</button>';
      }
      actions += ' <button class="ann-btn" style="font-size:0.75rem;padding:0.25rem 0.5rem;color:hsl(0 70% 50%);background:transparent;border:none;" data-action="delete" data-id="' + p.id + '" title="Supprimer definitivement">' +
        '<svg style="width:0.875rem;height:0.875rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button>';

      return '<div style="background:hsl(var(--ann-card));border:1px solid hsl(var(--ann-border));border-radius:var(--ann-radius);padding:1rem;display:flex;gap:1rem;align-items:flex-start;flex-wrap:wrap;margin-bottom:0.75rem;">' +
        '<div style="flex-shrink:0;">' + photoHtml + '</div>' +
        '<div style="flex:1;min-width:0;">' +
          '<div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.25rem;">' +
            '<span style="font-weight:700;">' + esc(p.first_name || '') + ' ' + esc(p.last_name || '') + '</span>' +
            statusBadge +
          '</div>' +
          '<p style="font-size:0.875rem;color:hsl(var(--ann-muted-fg));margin-bottom:0.25rem;">' +
            esc(SPEC_LABELS[p.specialty] || p.specialty || '') + ' &mdash; ' + esc(p.city || '') +
          '</p>' +
          '<p style="font-size:0.75rem;color:hsl(var(--ann-muted-fg));">' + esc(p.email || '') + ' &middot; ' + esc(p.phone || '') + ' &middot; Inscrit le ' + date + '</p>' +
          (p.description ? '<p style="font-size:0.75rem;color:hsl(var(--ann-muted-fg));margin-top:0.5rem;max-height:3rem;overflow:hidden;text-overflow:ellipsis;">' + esc(p.description.substring(0, 200)) + (p.description.length > 200 ? '...' : '') + '</p>' : '') +
        '</div>' +
        '<div style="display:flex;gap:0.5rem;flex-shrink:0;flex-wrap:wrap;">' + actions + '</div>' +
      '</div>';
    }).join('');
  }

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  // ── Actions ──

  function handleAction(action, id) {
    if (action === 'approve') {
      if (!confirm('Approuver et publier cette fiche ?')) return;
      apiPost('approve', { id: id });
    } else if (action === 'reject') {
      var reason = prompt('Motif du rejet (optionnel) :');
      if (reason === null) return;
      apiPost('reject', { id: id, reason: reason });
    } else if (action === 'delete') {
      if (!confirm('Supprimer definitivement cette fiche ? Cette action est irreversible.')) return;
      apiPost('delete', { id: id });
    }
  }

  function apiPost(action, body) {
    fetch(SUPABASE_URL + '/functions/v1/admin-annuaire?action=' + action, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': adminToken,
      },
      body: JSON.stringify(body),
    })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (data.success) {
        allProfiles = [];
        loadProfiles();
      } else {
        alert('Erreur: ' + (data.error || 'Inconnue'));
      }
    })
    .catch(function () {
      alert('Erreur reseau');
    });
  }

  // ── Init ──

  function init() {
    var app = document.getElementById('ann-admin-app');
    if (!app) return;

    SUPABASE_URL = app.dataset.url;
    if (!SUPABASE_URL) return;

    // Login
    var loginBtn = document.getElementById('ann-admin-login-btn');
    if (loginBtn) loginBtn.addEventListener('click', login);

    var pwInput = document.getElementById('ann-admin-pw');
    if (pwInput) pwInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') login();
    });

    // Logout
    var logoutBtn = document.getElementById('ann-admin-logout');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);

    // Refresh
    var refreshBtn = document.getElementById('aadm-refresh');
    if (refreshBtn) refreshBtn.addEventListener('click', function () {
      allProfiles = [];
      loadProfiles();
    });

    // Filter buttons
    document.querySelectorAll('.aadm-filter').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.aadm-filter').forEach(function (b) {
          b.style.background = 'hsl(var(--ann-card))';
          b.style.color = 'hsl(var(--ann-fg))';
        });
        this.style.background = 'hsl(var(--ann-primary))';
        this.style.color = 'hsl(var(--ann-primary-fg))';
        currentFilter = this.dataset.filter;
        renderProfiles();
      });
    });

    // Action delegation (approve/reject/delete buttons)
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-action]');
      if (btn && btn.dataset.action && btn.dataset.id) {
        handleAction(btn.dataset.action, btn.dataset.id);
      }
    });

    // Check saved session
    checkAuth();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
