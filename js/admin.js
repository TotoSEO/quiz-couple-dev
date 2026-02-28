/**
 * Admin Dashboard - Review moderation + Article management
 */
(function () {
  'use strict';

  var SUPABASE_URL, SUPABASE_KEY;
  var adminToken = null;
  var allReviews = [];
  var currentFilter = 'all';

  // ── Articles state ──
  var allArticles = [];
  var currentArticle = null;
  var currentLang = 'fr';
  var translationCache = {}; // { "articleId-lang": { ... } }
  var currentTab = 'reviews';

  function esc(s) { return s ? String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') : ''; }

  function starsHtml(rating) {
    var html = '';
    for (var i = 1; i <= 5; i++) {
      html += '<svg viewBox="0 0 24 24" class="w-4 h-4 ' + (i <= rating ? 'star-filled' : 'star-empty') + '"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
    }
    return html;
  }

  function formatDate(dateStr) {
    if (!dateStr) return '-';
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

  // ── Tab switching ──
  function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.admin-tab').forEach(function (b) { b.classList.remove('active'); });
    document.querySelector('.admin-tab[data-tab="' + tab + '"]').classList.add('active');

    document.getElementById('admin-reviews-tab').classList.toggle('hidden', tab !== 'reviews');
    document.getElementById('admin-articles-tab').classList.toggle('hidden', tab !== 'articles');

    if (tab === 'articles' && allArticles.length === 0) {
      loadArticles();
    }
  }

  // ── Reviews CRUD ──
  function loadReviews() {
    var listEl = document.getElementById('admin-reviews-list');
    listEl.innerHTML = '<p class="text-center text-muted-foreground py-8">Chargement...</p>';

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
        html += '<button class="admin-action btn btn-sm text-emerald-600 border border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" data-id="' + r.id + '" data-action="approve">Approuver</button>';
      } else {
        html += '<button class="admin-action btn btn-sm text-amber-600 border border-amber-200 hover:bg-amber-50 dark:hover:bg-amber-900/20" data-id="' + r.id + '" data-action="reject">Retirer</button>';
      }
      html += '<button class="admin-action btn btn-sm text-destructive border border-destructive/20 hover:bg-destructive/10" data-id="' + r.id + '" data-action="delete">Supprimer</button>';
      html += '</div>';
      html += '</div>';
    });

    list.innerHTML = html;

    list.querySelectorAll('.admin-action').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = this.dataset.id;
        var action = this.dataset.action;
        if (action === 'delete' && !confirm('Supprimer cet avis définitivement ?')) return;
        reviewAction(id, action);
      });
    });
  }

  // ── Articles ──
  function adminBlogFetch(action, params) {
    var qs = '?action=' + action;
    if (params) {
      Object.keys(params).forEach(function (k) { qs += '&' + k + '=' + encodeURIComponent(params[k]); });
    }
    return fetch(SUPABASE_URL + '/functions/v1/admin-blog' + qs, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'x-admin-token': adminToken
      }
    }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    });
  }

  function adminBlogPost(action, body) {
    return fetch(SUPABASE_URL + '/functions/v1/admin-blog?action=' + action, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json',
        'x-admin-token': adminToken
      },
      body: JSON.stringify(body)
    }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    });
  }

  function loadArticles() {
    var listEl = document.getElementById('articles-list');
    listEl.innerHTML = '<p class="text-center text-muted-foreground py-8">Chargement...</p>';

    adminBlogFetch('list')
      .then(function (data) {
        if (data.success && data.articles) {
          allArticles = data.articles;
          renderArticles();
        } else {
          listEl.innerHTML = '<p class="text-center text-destructive py-8">Erreur: ' + esc(data.error || 'Réponse invalide') + '</p>';
        }
      })
      .catch(function (err) {
        listEl.innerHTML = '<p class="text-center text-destructive py-8">Erreur de connexion. Vérifiez que l\'Edge Function admin-blog est déployée.</p>';
      });
  }

  function renderArticles() {
    var listEl = document.getElementById('articles-list');

    if (allArticles.length === 0) {
      listEl.innerHTML = '<div class="text-center py-12 space-y-4">'
        + '<p class="text-muted-foreground">Aucun article trouvé dans la base de données.</p>'
        + '<button id="create-first-article" class="btn btn-primary">Créer un article</button>'
        + '</div>';
      var createBtn = document.getElementById('create-first-article');
      if (createBtn) createBtn.addEventListener('click', promptCreateArticle);
      return;
    }

    var html = '';
    allArticles.forEach(function (article) {
      var translations = article.blog_article_translations || [];
      var langBadges = '';
      var LANGS = ['fr', 'en', 'es', 'de', 'it'];
      LANGS.forEach(function (lang) {
        var tr = translations.find(function (t) { return t.lang === lang; });
        if (tr) {
          langBadges += '<span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium '
            + (tr.is_complete ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400')
            + '">' + lang.toUpperCase() + '</span> ';
        } else {
          langBadges += '<span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground">' + lang.toUpperCase() + '</span> ';
        }
      });

      var frTitle = '';
      var frTranslation = translations.find(function (t) { return t.lang === 'fr'; });
      if (frTranslation && frTranslation.title) frTitle = frTranslation.title;

      var statusBadge = article.status === 'published'
        ? '<span class="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">Publié</span>'
        : '<span class="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">Brouillon</span>';

      html += '<div class="glass-card rounded-xl p-5 cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all article-card" data-id="' + article.id + '">';
      html += '<div class="flex items-start gap-4">';

      // Image thumbnail
      if (article.featured_image_url) {
        html += '<img src="' + esc(article.featured_image_url) + '" alt="" class="w-20 h-14 rounded-lg object-cover flex-shrink-0">';
      } else {
        html += '<div class="w-20 h-14 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-xs flex-shrink-0">No img</div>';
      }

      html += '<div class="flex-1 min-w-0">';
      html += '<div class="flex items-center gap-2 mb-1">';
      html += '<h3 class="font-semibold truncate">' + esc(frTitle || article.internal_slug) + '</h3>';
      html += statusBadge;
      html += '</div>';
      html += '<p class="text-sm text-muted-foreground mb-2">/' + esc(article.internal_slug) + '</p>';
      html += '<div class="flex items-center gap-1 flex-wrap">' + langBadges + '</div>';
      html += '</div>';
      html += '</div>';
      html += '</div>';
    });

    listEl.innerHTML = html;

    // Bind click handlers
    listEl.querySelectorAll('.article-card').forEach(function (card) {
      card.addEventListener('click', function () {
        openArticleEditor(this.dataset.id);
      });
    });
  }

  function promptCreateArticle() {
    var slug = prompt('Slug interne de l\'article (ex: avis-badoo) :');
    if (!slug) return;
    slug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');

    adminBlogPost('create', { internal_slug: slug, title: slug, status: 'draft' })
      .then(function (data) {
        if (data.success) {
          loadArticles();
        } else {
          alert('Erreur: ' + (data.error || 'Création échouée'));
        }
      })
      .catch(function () {
        alert('Erreur de connexion');
      });
  }

  function openArticleEditor(articleId) {
    currentArticle = allArticles.find(function (a) { return a.id === articleId; });
    if (!currentArticle) return;

    document.getElementById('articles-list-view').classList.add('hidden');
    document.getElementById('article-editor-view').classList.remove('hidden');
    document.getElementById('article-editor-title').textContent = currentArticle.internal_slug;

    // Show image preview
    updateImagePreview();

    // Reset to FR tab
    currentLang = 'fr';
    document.querySelectorAll('.lang-tab').forEach(function (b) { b.classList.remove('active'); });
    document.querySelector('.lang-tab[data-lang="fr"]').classList.add('active');

    // Clear cache for fresh load
    translationCache = {};

    // Load FR translation
    loadTranslation(articleId, 'fr');
  }

  function updateImagePreview() {
    var preview = document.getElementById('article-image-preview');
    if (currentArticle && currentArticle.featured_image_url) {
      preview.innerHTML = '<img src="' + esc(currentArticle.featured_image_url) + '" alt="" class="w-full h-full object-cover">';
    } else {
      preview.innerHTML = '<span>Aucune image</span>';
    }
    document.getElementById('article-image-status').textContent = '';
  }

  function closeArticleEditor() {
    document.getElementById('article-editor-view').classList.add('hidden');
    document.getElementById('articles-list-view').classList.remove('hidden');
    currentArticle = null;
    translationCache = {};
  }

  function loadTranslation(articleId, lang) {
    var cacheKey = articleId + '-' + lang;
    if (translationCache[cacheKey]) {
      fillTranslationForm(translationCache[cacheKey]);
      return;
    }

    // Clear form while loading
    clearTranslationForm();
    document.getElementById('article-save-status').textContent = 'Chargement...';

    adminBlogFetch('get', { id: articleId, lang: lang })
      .then(function (data) {
        if (data.success) {
          var tr = data.translation || {};
          translationCache[cacheKey] = tr;
          fillTranslationForm(tr);
          document.getElementById('article-save-status').textContent = '';
        } else {
          document.getElementById('article-save-status').textContent = 'Erreur de chargement';
        }
      })
      .catch(function () {
        document.getElementById('article-save-status').textContent = 'Erreur de connexion';
      });
  }

  function clearTranslationForm() {
    document.getElementById('article-field-slug').value = '';
    document.getElementById('article-field-title').value = '';
    document.getElementById('article-field-meta-title').value = '';
    document.getElementById('article-field-meta-description').value = '';
    document.getElementById('article-field-alt').value = '';
    updateCharCounts();
  }

  function fillTranslationForm(tr) {
    document.getElementById('article-field-slug').value = tr.slug || '';
    document.getElementById('article-field-title').value = tr.title || '';
    document.getElementById('article-field-meta-title').value = tr.meta_title || '';
    document.getElementById('article-field-meta-description').value = tr.meta_description || '';
    document.getElementById('article-field-alt').value = tr.featured_image_alt || '';
    updateCharCounts();
  }

  function getTranslationFormData() {
    return {
      slug: document.getElementById('article-field-slug').value.trim(),
      title: document.getElementById('article-field-title').value.trim(),
      meta_title: document.getElementById('article-field-meta-title').value.trim(),
      meta_description: document.getElementById('article-field-meta-description').value.trim(),
      featured_image_alt: document.getElementById('article-field-alt').value.trim()
    };
  }

  function saveCurrentFormToCache() {
    if (!currentArticle) return;
    var cacheKey = currentArticle.id + '-' + currentLang;
    var formData = getTranslationFormData();
    var cached = translationCache[cacheKey] || {};
    Object.keys(formData).forEach(function (k) { cached[k] = formData[k]; });
    translationCache[cacheKey] = cached;
  }

  function switchLang(lang) {
    if (!currentArticle) return;
    // Save current form data to cache before switching
    saveCurrentFormToCache();

    currentLang = lang;
    document.querySelectorAll('.lang-tab').forEach(function (b) { b.classList.remove('active'); });
    document.querySelector('.lang-tab[data-lang="' + lang + '"]').classList.add('active');

    loadTranslation(currentArticle.id, lang);
  }

  function saveTranslation() {
    if (!currentArticle) return;

    var formData = getTranslationFormData();
    var statusEl = document.getElementById('article-save-status');
    var saveBtn = document.getElementById('article-save-lang');

    saveBtn.disabled = true;
    statusEl.textContent = 'Enregistrement...';
    statusEl.className = 'text-sm text-muted-foreground self-center';

    // Get the cached translation to preserve existing data (sections, etc.)
    var cacheKey = currentArticle.id + '-' + currentLang;
    var cached = translationCache[cacheKey] || {};

    var body = {
      article_id: currentArticle.id,
      lang: currentLang,
      slug: formData.slug,
      title: formData.title,
      meta_title: formData.meta_title,
      meta_description: formData.meta_description,
      featured_image_alt: formData.featured_image_alt,
      excerpt: cached.excerpt || '',
      introduction: cached.introduction || '',
      quick_summary: cached.quick_summary || [],
      sections: cached.sections || [],
      is_complete: !!(formData.title && formData.meta_title && formData.meta_description && formData.slug)
    };

    adminBlogPost('save-translation', body)
      .then(function (data) {
        saveBtn.disabled = false;
        if (data.success) {
          statusEl.textContent = 'Enregistré !';
          statusEl.className = 'text-sm text-emerald-600 dark:text-emerald-400 self-center';
          // Update cache
          Object.keys(formData).forEach(function (k) { cached[k] = formData[k]; });
          cached.is_complete = body.is_complete;
          translationCache[cacheKey] = cached;
          setTimeout(function () { statusEl.textContent = ''; }, 3000);
        } else {
          statusEl.textContent = 'Erreur: ' + (data.error || 'Échec');
          statusEl.className = 'text-sm text-destructive self-center';
        }
      })
      .catch(function () {
        saveBtn.disabled = false;
        statusEl.textContent = 'Erreur de connexion';
        statusEl.className = 'text-sm text-destructive self-center';
      });
  }

  function uploadArticleImage() {
    if (!currentArticle) return;

    var fileInput = document.getElementById('article-image-input');
    var file = fileInput.files[0];
    if (!file) return;

    var statusEl = document.getElementById('article-image-status');
    var uploadBtn = document.getElementById('article-image-upload-btn');

    uploadBtn.disabled = true;
    statusEl.textContent = 'Upload en cours...';

    var path = currentArticle.internal_slug + '.' + (file.name.split('.').pop() || 'webp');

    var formData = new FormData();
    formData.append('file', file);
    formData.append('path', path);

    fetch(SUPABASE_URL + '/functions/v1/admin-blog?action=upload-image', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'x-admin-token': adminToken
      },
      body: formData
    })
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function (data) {
      uploadBtn.disabled = false;
      if (data.success && data.url) {
        statusEl.textContent = 'Image uploadée !';
        // Update article with new image URL
        return adminBlogPost('update', {
          id: currentArticle.id,
          featured_image_url: data.url
        }).then(function () {
          currentArticle.featured_image_url = data.url;
          updateImagePreview();
          // Also update in allArticles list
          var idx = allArticles.findIndex(function (a) { return a.id === currentArticle.id; });
          if (idx >= 0) allArticles[idx].featured_image_url = data.url;
        });
      } else {
        statusEl.textContent = 'Erreur: ' + (data.error || 'Upload échoué');
      }
    })
    .catch(function () {
      uploadBtn.disabled = false;
      statusEl.textContent = 'Erreur de connexion lors de l\'upload';
    });
  }

  function updateCharCounts() {
    var metaTitleEl = document.getElementById('article-field-meta-title');
    var metaDescEl = document.getElementById('article-field-meta-description');
    var titleCountEl = document.getElementById('meta-title-count');
    var descCountEl = document.getElementById('meta-desc-count');

    if (metaTitleEl && titleCountEl) {
      var len = metaTitleEl.value.length;
      titleCountEl.textContent = len;
      titleCountEl.className = 'font-medium' + (len > 60 ? ' text-destructive' : len > 50 ? ' text-amber-600' : '');
    }
    if (metaDescEl && descCountEl) {
      var len2 = metaDescEl.value.length;
      descCountEl.textContent = len2;
      descCountEl.className = 'font-medium' + (len2 > 160 ? ' text-destructive' : len2 > 150 ? ' text-amber-600' : '');
    }
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

    // Refresh reviews
    var refreshBtn = document.getElementById('admin-refresh');
    if (refreshBtn) refreshBtn.addEventListener('click', loadReviews);

    // Review Filters
    document.querySelectorAll('.admin-filter').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.admin-filter').forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');
        currentFilter = this.dataset.filter;
        renderReviews();
      });
    });

    // Tab switching
    document.querySelectorAll('.admin-tab').forEach(function (btn) {
      btn.addEventListener('click', function () {
        switchTab(this.dataset.tab);
      });
    });

    // Articles refresh
    var articlesRefresh = document.getElementById('articles-refresh');
    if (articlesRefresh) articlesRefresh.addEventListener('click', function () {
      allArticles = [];
      loadArticles();
    });

    // Article editor - back button
    var backBtn = document.getElementById('article-back');
    if (backBtn) backBtn.addEventListener('click', function () {
      closeArticleEditor();
      // Refresh the list to reflect changes
      loadArticles();
    });

    // Language tabs
    document.querySelectorAll('.lang-tab').forEach(function (btn) {
      btn.addEventListener('click', function () {
        switchLang(this.dataset.lang);
      });
    });

    // Save translation
    var saveBtn = document.getElementById('article-save-lang');
    if (saveBtn) saveBtn.addEventListener('click', saveTranslation);

    // Image upload
    var imageInput = document.getElementById('article-image-input');
    var uploadBtn = document.getElementById('article-image-upload-btn');
    if (imageInput) {
      imageInput.addEventListener('change', function () {
        if (this.files.length > 0) {
          uploadBtn.classList.remove('hidden');
          document.getElementById('article-image-status').textContent = this.files[0].name + ' (' + Math.round(this.files[0].size / 1024) + ' Ko)';
        } else {
          uploadBtn.classList.add('hidden');
        }
      });
    }
    if (uploadBtn) uploadBtn.addEventListener('click', uploadArticleImage);

    // Character counts on input
    var metaTitleInput = document.getElementById('article-field-meta-title');
    var metaDescInput = document.getElementById('article-field-meta-description');
    if (metaTitleInput) metaTitleInput.addEventListener('input', updateCharCounts);
    if (metaDescInput) metaDescInput.addEventListener('input', updateCharCounts);

    // Check existing auth
    checkAuth();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
