/**
 * Admin Dashboard - Review moderation
 */
(function () {
  'use strict';

  var SUPABASE_URL, SUPABASE_KEY;
  var adminToken = null;
  var allReviews = [];
  var currentFilter = 'all';

  function esc(s) { return s ? String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') : ''; }

  function starsHtml(rating) {
    var html = '';
    for (var i = 1; i <= 5; i++) {
      html += '<svg viewBox="0 0 24 24" class="w-4 h-4 ' + (i <= rating ? 'star-filled' : 'star-empty') + '"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
    }
    return html;
  }

  function formatDate(dateStr) {
    var d = new Date(dateStr);
    var months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear() + ' à ' + d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
  }

  // ── Auth ──
  function checkAuth() {
    var token = sessionStorage.getItem('admin-token');
    var expiry = sessionStorage.getItem('admin-token-expiry');
    if (token && expiry && Date.now() < parseInt(expiry)) {
      adminToken = token;
      showDashboard();
      loadReviews();
    }
  }

  function login() {
    var pw = document.getElementById('admin-password').value;
    var errorEl = document.getElementById('admin-login-error');
    var btn = document.getElementById('admin-login-btn');
    if (!pw) return;

    btn.disabled = true;
    btn.textContent = 'Connexion...';
    errorEl.classList.add('hidden');

    fetch(SUPABASE_URL + '/functions/v1/verify-admin', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + SUPABASE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw })
    })
    .then(function (res) { return res.json(); })
    .then(function (data) {
      if (data.success && data.token) {
        adminToken = data.token;
        var expiry = Date.now() + 2 * 60 * 60 * 1000; // 2h
        sessionStorage.setItem('admin-token', data.token);
        sessionStorage.setItem('admin-token-expiry', expiry.toString());
        showDashboard();
        loadReviews();
      } else {
        errorEl.textContent = data.error || 'Mot de passe incorrect';
        errorEl.classList.remove('hidden');
        btn.disabled = false;
        btn.textContent = 'Se connecter';
      }
    })
    .catch(function () {
      errorEl.textContent = 'Erreur de connexion';
      errorEl.classList.remove('hidden');
      btn.disabled = false;
      btn.textContent = 'Se connecter';
    });
  }

  function logout() {
    sessionStorage.removeItem('admin-token');
    sessionStorage.removeItem('admin-token-expiry');
    adminToken = null;
    document.getElementById('admin-login').classList.remove('hidden');
    document.getElementById('admin-dashboard').classList.add('hidden');
  }

  function showDashboard() {
    document.getElementById('admin-login').classList.add('hidden');
    document.getElementById('admin-dashboard').classList.remove('hidden');
  }

  // ── Reviews CRUD ──
  function loadReviews() {
    var listEl = document.getElementById('admin-reviews-list');
    listEl.innerHTML = '<p class="text-center text-muted-foreground py-8">Chargement...</p>';

    // Try Edge Function first, fallback to direct REST API
    fetch(SUPABASE_URL + '/functions/v1/admin-reviews', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'x-admin-token': adminToken
      }
    })
    .then(function (res) {
      if (!res.ok) throw new Error('Edge function returned ' + res.status);
      return res.json();
    })
    .then(function (data) {
      var reviews = Array.isArray(data) ? data : (data && data.reviews ? data.reviews : (data && data.data ? data.data : null));
      if (reviews && Array.isArray(reviews)) {
        allReviews = reviews;
        updateStats();
        renderReviews();
      } else {
        throw new Error('Invalid response format');
      }
    })
    .catch(function () {
      // Fallback: query reviews table directly via REST API (only approved ones visible due to RLS, but worth trying)
      fetch(SUPABASE_URL + '/rest/v1/reviews?select=*&order=created_at.desc&limit=100', {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
      })
      .then(function (res) { return res.json(); })
      .then(function (reviews) {
        if (Array.isArray(reviews)) {
          allReviews = reviews;
          updateStats();
          renderReviews();
        } else {
          listEl.innerHTML = '<p class="text-center text-destructive py-8">Erreur de chargement. Vérifiez que l\'Edge Function admin-reviews est déployée.</p>';
        }
      })
      .catch(function () {
        listEl.innerHTML = '<p class="text-center text-destructive py-8">Erreur de connexion au serveur.</p>';
      });
    });
  }

  function reviewAction(reviewId, action) {
    fetch(SUPABASE_URL + '/functions/v1/admin-reviews', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json',
        'x-admin-token': adminToken
      },
      body: JSON.stringify({ reviewId: reviewId, action: action })
    })
    .then(function (res) {
      if (res.ok) loadReviews();
    });
  }

  function updateStats() {
    var pending = allReviews.filter(function (r) { return !r.is_approved; }).length;
    var approved = allReviews.filter(function (r) { return r.is_approved; }).length;
    var sum = 0;
    allReviews.forEach(function (r) { sum += r.rating || 0; });
    var avg = allReviews.length > 0 ? (sum / allReviews.length).toFixed(1) : '-';

    document.getElementById('admin-stat-avg').textContent = avg;
    document.getElementById('admin-stat-pending').textContent = pending;
    document.getElementById('admin-stat-approved').textContent = approved;

    var allCount = document.getElementById('admin-filter-all-count');
    var pendingCount = document.getElementById('admin-filter-pending-count');
    var approvedCount = document.getElementById('admin-filter-approved-count');
    if (allCount) allCount.textContent = '(' + allReviews.length + ')';
    if (pendingCount) pendingCount.textContent = '(' + pending + ')';
    if (approvedCount) approvedCount.textContent = '(' + approved + ')';
  }

  function renderReviews() {
    var list = document.getElementById('admin-reviews-list');
    var filtered = allReviews;

    if (currentFilter === 'pending') {
      filtered = allReviews.filter(function (r) { return !r.is_approved; });
    } else if (currentFilter === 'approved') {
      filtered = allReviews.filter(function (r) { return r.is_approved; });
    }

    if (filtered.length === 0) {
      list.innerHTML = '<p class="text-center text-muted-foreground py-8">Aucun avis</p>';
      return;
    }

    var html = '';
    filtered.forEach(function (r) {
      var statusBadge = r.is_approved
        ? '<span class="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">Approuvé</span>'
        : '<span class="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">En attente</span>';

      html += '<div class="glass-card rounded-xl p-5 space-y-3">';
      html += '<div class="flex items-center justify-between flex-wrap gap-2">';
      html += '<div class="flex items-center gap-2"><span class="font-semibold">' + esc(r.author_name || 'Anonyme') + '</span>' + statusBadge + '</div>';
      html += '<div class="flex items-center gap-0.5">' + starsHtml(r.rating) + '</div>';
      html += '</div>';
      html += '<p class="text-sm text-muted-foreground">' + formatDate(r.created_at) + '</p>';
      if (r.comment) html += '<p class="text-sm text-foreground">' + esc(r.comment) + '</p>';
      if (r.ip_address) html += '<p class="text-xs text-muted-foreground/60">IP: ' + esc(r.ip_address) + '</p>';
      html += '<div class="flex gap-2 pt-2">';
      if (!r.is_approved) {
        html += '<button class="admin-action btn btn-sm text-emerald-600 border border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" data-id="' + r.id + '" data-action="approve">✅ Approuver</button>';
      } else {
        html += '<button class="admin-action btn btn-sm text-amber-600 border border-amber-200 hover:bg-amber-50 dark:hover:bg-amber-900/20" data-id="' + r.id + '" data-action="reject">❌ Retirer</button>';
      }
      html += '<button class="admin-action btn btn-sm text-destructive border border-destructive/20 hover:bg-destructive/10" data-id="' + r.id + '" data-action="delete">🗑️ Supprimer</button>';
      html += '</div>';
      html += '</div>';
    });

    list.innerHTML = html;

    // Bind action buttons
    list.querySelectorAll('.admin-action').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = this.dataset.id;
        var action = this.dataset.action;
        if (action === 'delete' && !confirm('Supprimer cet avis définitivement ?')) return;
        reviewAction(id, action);
      });
    });
  }

  // ── Init ──
  function init() {
    var app = document.getElementById('admin-app');
    if (!app) return;

    SUPABASE_URL = app.dataset.url;
    SUPABASE_KEY = app.dataset.key;
    if (!SUPABASE_URL || !SUPABASE_KEY) return;

    // Password toggle
    var togglePw = document.getElementById('admin-toggle-pw');
    var pwInput = document.getElementById('admin-password');
    if (togglePw && pwInput) {
      togglePw.addEventListener('click', function () {
        var isPassword = pwInput.type === 'password';
        pwInput.type = isPassword ? 'text' : 'password';
        this.querySelector('.eye-open').classList.toggle('hidden');
        this.querySelector('.eye-closed').classList.toggle('hidden');
      });
    }

    // Login
    var loginBtn = document.getElementById('admin-login-btn');
    if (loginBtn) loginBtn.addEventListener('click', login);
    if (pwInput) pwInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') login(); });

    // Logout
    var logoutBtn = document.getElementById('admin-logout');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);

    // Refresh
    var refreshBtn = document.getElementById('admin-refresh');
    if (refreshBtn) refreshBtn.addEventListener('click', loadReviews);

    // Filters
    document.querySelectorAll('.admin-filter').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.admin-filter').forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');
        currentFilter = this.dataset.filter;
        renderReviews();
      });
    });

    // Check existing auth
    checkAuth();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
