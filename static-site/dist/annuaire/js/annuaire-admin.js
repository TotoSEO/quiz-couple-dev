/**
 * Annuaire Admin - Dedicated professional moderation dashboard
 * Uses the same HMAC admin token verification as the main site admin
 */
(function () {
  'use strict';

  var SUPABASE_URL;
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvanZham5udmhhdGZwbGV2eXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNzk3NDIsImV4cCI6MjA4Nzg1NTc0Mn0.gdd9HRbRvfQr6io9jGN6hUCW6tBOtognhwbsTJtSTng';
  var adminToken = null;
  var allProfiles = [];
  var allInvoices = [];
  var currentFilter = 'all';
  var searchQuery = '';
  var invoiceSearchQuery = '';
  var invoicesLoaded = false;

  var SPEC_LABELS = {
    'therapeute-de-couple': 'Therapeute de couple',
    'sexologue': 'Sexologue',
    'sexotherapeute': 'Sexotherapeute',
    'mediateur-familial': 'Mediateur familial',
    'coach-parental': 'Coach parental',
    'conseiller-conjugal': 'Conseiller conjugal',
  };

  var PLAN_LABELS = {
    'gratuit': 'Gratuit',
    'pro': 'Pro',
    'boost': 'Boost',
  };

  var PLAN_COLORS = {
    'gratuit': 'hsl(var(--ann-muted-fg))',
    'pro': 'hsl(220 70% 50%)',
    'boost': 'hsl(280 70% 50%)',
  };

  // ── Auth ──

  function login() {
    var pw = document.getElementById('ann-admin-pw');
    var errEl = document.getElementById('ann-admin-error');
    if (!pw || !pw.value.trim()) return;

    errEl.style.display = 'none';

    fetch(SUPABASE_URL + '/functions/v1/verify-annuaire-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + SUPABASE_KEY },
      body: JSON.stringify({ password: pw.value.trim() }),
    })
    .then(function (r) {
      if (!r.ok && r.status === 404) {
        throw new Error('Function verify-annuaire-admin introuvable (404). Verifiez le deploiement.');
      }
      return r.json();
    })
    .then(function (data) {
      if (data.token) {
        adminToken = data.token;
        sessionStorage.setItem('ann-admin-token', adminToken);
        showDashboard();
      } else {
        errEl.textContent = data.error || 'Mot de passe incorrect';
        errEl.style.display = 'block';
      }
    })
    .catch(function (err) {
      errEl.textContent = err.message || 'Erreur de connexion';
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

  // ── Tabs ──

  function switchTab(tab) {
    document.querySelectorAll('.aadm-tab').forEach(function (btn) {
      var isActive = btn.dataset.tab === tab;
      btn.style.color = isActive ? 'hsl(var(--ann-primary))' : 'hsl(var(--ann-muted-fg))';
      btn.style.borderBottomColor = isActive ? 'hsl(var(--ann-primary))' : 'transparent';
    });

    var profilesTab = document.getElementById('aadm-tab-profiles');
    var invoicesTab = document.getElementById('aadm-tab-invoices');
    if (profilesTab) profilesTab.style.display = tab === 'profiles' ? '' : 'none';
    if (invoicesTab) invoicesTab.style.display = tab === 'invoices' ? '' : 'none';

    if (tab === 'invoices' && !invoicesLoaded) {
      loadInvoices();
    }
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
        'Authorization': 'Bearer ' + SUPABASE_KEY,
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
        listEl.innerHTML = '<p style="text-align:center;color:hsl(0 70% 50%);padding:3rem 0;">Erreur: ' + esc(data.error || 'Inconnue') + '</p>';
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

  // ── Render Profiles ──

  function renderProfiles() {
    var listEl = document.getElementById('aadm-profiles-list');
    if (!listEl) return;

    var filtered = allProfiles;
    if (currentFilter === 'pending') {
      filtered = allProfiles.filter(function (p) { return !p.is_published; });
    } else if (currentFilter === 'approved') {
      filtered = allProfiles.filter(function (p) { return p.is_published; });
    }

    // Apply search filter
    if (searchQuery) {
      var q = searchQuery.toLowerCase();
      filtered = filtered.filter(function (p) {
        var fullName = ((p.first_name || '') + ' ' + (p.last_name || '')).toLowerCase();
        return fullName.indexOf(q) !== -1;
      });
    }

    if (filtered.length === 0) {
      listEl.innerHTML = '<p style="text-align:center;color:hsl(var(--ann-muted-fg));padding:3rem 0;">' + (searchQuery ? 'Aucun resultat pour "' + esc(searchQuery) + '"' : 'Aucune fiche trouvee.') + '</p>';
      return;
    }

    listEl.innerHTML = filtered.map(function (p) {
      var statusBadge = p.is_published
        ? '<span style="display:inline-flex;padding:0.125rem 0.5rem;border-radius:9999px;font-size:0.75rem;font-weight:600;background:hsl(160 60% 45%/0.1);color:hsl(160 60% 35%);">Publie</span>'
        : '<span style="display:inline-flex;padding:0.125rem 0.5rem;border-radius:9999px;font-size:0.75rem;font-weight:600;background:hsl(40 90% 55%/0.1);color:hsl(40 70% 35%);">En attente</span>';

      // Plan badge
      var planLabel = PLAN_LABELS[p.plan] || p.plan || 'Gratuit';
      var planColor = PLAN_COLORS[p.plan] || PLAN_COLORS.gratuit;
      var planBadge = '<span style="display:inline-flex;padding:0.125rem 0.5rem;border-radius:9999px;font-size:0.75rem;font-weight:600;border:1px solid ' + planColor + ';color:' + planColor + ';">' + esc(planLabel) + '</span>';

      var photoHtml = p.photo_url
        ? '<img src="' + esc(p.photo_url) + '" style="width:3rem;height:3rem;border-radius:50%;object-fit:cover;" alt="">'
        : '<div style="width:3rem;height:3rem;border-radius:50%;background:hsl(var(--ann-muted));display:flex;align-items:center;justify-content:center;"><svg style="width:1.25rem;height:1.25rem;color:hsl(var(--ann-muted-fg));" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>';

      var date = p.created_at ? new Date(p.created_at).toLocaleDateString('fr-FR') : '';

      // Build fiche URL for the external link icon
      var ficheUrl = 'https://annuaire.quiz-couple.com/' + encodeURIComponent(p.specialty || '') + '/' + encodeURIComponent(p.city || '') + '/' + encodeURIComponent(p.slug || '') + '/';
      var linkIcon = p.is_published && p.slug
        ? ' <a href="' + esc(ficheUrl) + '" target="_blank" rel="noopener" title="Voir la fiche en ligne" style="color:hsl(var(--ann-primary));display:inline-flex;align-items:center;vertical-align:middle;">' +
            '<svg style="width:0.875rem;height:0.875rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>' +
          '</a>'
        : '';

      var actions = '';
      if (!p.is_published) {
        actions += '<button class="ann-btn ann-btn-primary" style="font-size:0.75rem;padding:0.25rem 0.75rem;" data-action="approve" data-id="' + p.id + '">Approuver</button>';
        actions += ' <button class="ann-btn" style="font-size:0.75rem;padding:0.25rem 0.75rem;color:hsl(0 70% 50%);border:1px solid hsl(0 70% 50%/0.3);background:transparent;" data-action="reject" data-id="' + p.id + '">Rejeter</button>';
      } else {
        actions += '<button class="ann-btn" style="font-size:0.75rem;padding:0.25rem 0.75rem;color:hsl(40 70% 40%);border:1px solid hsl(40 70% 40%/0.3);background:transparent;" data-action="reject" data-id="' + p.id + '">Depublier</button>';
      }
      // Change plan button
      actions += ' <button class="ann-btn" style="font-size:0.75rem;padding:0.25rem 0.75rem;color:hsl(260 50% 50%);border:1px solid hsl(260 50% 50%/0.3);background:transparent;" data-action="change-plan" data-id="' + p.id + '" title="Modifier l\'abonnement">' +
        '<svg style="width:0.75rem;height:0.75rem;margin-right:0.25rem;vertical-align:middle;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>Plan</button>';
      // Delete button
      actions += ' <button class="ann-btn" style="font-size:0.75rem;padding:0.25rem 0.5rem;color:hsl(0 70% 50%);background:transparent;border:none;" data-action="delete" data-id="' + p.id + '" title="Supprimer definitivement">' +
        '<svg style="width:0.875rem;height:0.875rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button>';

      return '<div style="background:hsl(var(--ann-card));border:1px solid hsl(var(--ann-border));border-radius:var(--ann-radius);padding:1rem;display:flex;gap:1rem;align-items:flex-start;flex-wrap:wrap;margin-bottom:0.75rem;">' +
        '<div style="flex-shrink:0;">' + photoHtml + '</div>' +
        '<div style="flex:1;min-width:0;">' +
          '<div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.25rem;">' +
            '<span style="font-weight:700;">' + esc(p.first_name || '') + ' ' + esc(p.last_name || '') + '</span>' +
            statusBadge + planBadge + linkIcon +
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

  // ── Load Invoices ──

  function loadInvoices() {
    var listEl = document.getElementById('aadm-invoices-list');
    if (!listEl) return;
    listEl.innerHTML = '<p style="text-align:center;color:hsl(var(--ann-muted-fg));padding:3rem 0;">Chargement des factures...</p>';

    fetch(SUPABASE_URL + '/functions/v1/admin-annuaire?action=invoices', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'x-admin-token': adminToken,
      },
    })
    .then(function (r) {
      if (r.status === 401 || r.status === 403) {
        logout();
        throw new Error('unauthorized');
      }
      return r.json();
    })
    .then(function (data) {
      if (!data.success) {
        listEl.innerHTML = '<p style="text-align:center;color:hsl(0 70% 50%);padding:3rem 0;">Erreur: ' + esc(data.error || 'Inconnue') + '</p>';
        return;
      }
      allInvoices = data.invoices || [];
      invoicesLoaded = true;
      renderInvoices();
    })
    .catch(function (err) {
      if (err.message !== 'unauthorized') {
        listEl.innerHTML = '<p style="text-align:center;color:hsl(0 70% 50%);padding:3rem 0;">Erreur reseau</p>';
      }
    });
  }

  function renderInvoices() {
    var listEl = document.getElementById('aadm-invoices-list');
    if (!listEl) return;

    var filtered = allInvoices;
    if (invoiceSearchQuery) {
      var q = invoiceSearchQuery.toLowerCase();
      filtered = allInvoices.filter(function (inv) {
        var name = ((inv.annuaire_professionals?.first_name || '') + ' ' + (inv.annuaire_professionals?.last_name || '')).toLowerCase();
        var num = (inv.invoice_number || '').toLowerCase();
        return name.indexOf(q) !== -1 || num.indexOf(q) !== -1;
      });
    }

    if (filtered.length === 0) {
      listEl.innerHTML = '<p style="text-align:center;color:hsl(var(--ann-muted-fg));padding:3rem 0;">' +
        (invoiceSearchQuery ? 'Aucune facture trouvee pour "' + esc(invoiceSearchQuery) + '"' : 'Aucune facture.') + '</p>';
      return;
    }

    // Table header
    var html = '<div style="overflow-x:auto;">' +
      '<table style="width:100%;border-collapse:collapse;font-size:0.875rem;">' +
      '<thead><tr style="border-bottom:2px solid hsl(var(--ann-border));text-align:left;">' +
        '<th style="padding:0.75rem 0.5rem;font-weight:600;">N° Facture</th>' +
        '<th style="padding:0.75rem 0.5rem;font-weight:600;">Professionnel</th>' +
        '<th style="padding:0.75rem 0.5rem;font-weight:600;">Plan</th>' +
        '<th style="padding:0.75rem 0.5rem;font-weight:600;">Montant TTC</th>' +
        '<th style="padding:0.75rem 0.5rem;font-weight:600;">Date</th>' +
        '<th style="padding:0.75rem 0.5rem;font-weight:600;">PDF</th>' +
      '</tr></thead><tbody>';

    html += filtered.map(function (inv) {
      var pro = inv.annuaire_professionals || {};
      var name = esc((pro.first_name || '') + ' ' + (pro.last_name || ''));
      var amountTtc = inv.amount_ttc ? (inv.amount_ttc / 100).toFixed(2).replace('.', ',') + ' €' : '-';
      var date = inv.created_at ? new Date(inv.created_at).toLocaleDateString('fr-FR') : '-';
      var planLabel = PLAN_LABELS[inv.plan] || inv.plan || '-';
      var periodLabel = inv.period === 'annual' ? '/an' : '/mois';

      var pdfBtn = inv.pdf_storage_path
        ? '<button class="ann-btn" style="font-size:0.75rem;padding:0.25rem 0.5rem;background:transparent;border:1px solid hsl(var(--ann-primary));color:hsl(var(--ann-primary));" data-action="download-invoice" data-path="' + esc(inv.pdf_storage_path) + '">PDF</button>'
        : '<span style="color:hsl(var(--ann-muted-fg));">-</span>';

      return '<tr style="border-bottom:1px solid hsl(var(--ann-border));">' +
        '<td style="padding:0.625rem 0.5rem;font-weight:600;">' + esc(inv.invoice_number || '-') + '</td>' +
        '<td style="padding:0.625rem 0.5rem;">' + name + '<br><span style="font-size:0.75rem;color:hsl(var(--ann-muted-fg));">' + esc(pro.email || '') + '</span></td>' +
        '<td style="padding:0.625rem 0.5rem;">' + esc(planLabel) + ' ' + esc(periodLabel) + '</td>' +
        '<td style="padding:0.625rem 0.5rem;font-weight:600;">' + amountTtc + '</td>' +
        '<td style="padding:0.625rem 0.5rem;">' + date + '</td>' +
        '<td style="padding:0.625rem 0.5rem;">' + pdfBtn + '</td>' +
      '</tr>';
    }).join('');

    html += '</tbody></table></div>';
    listEl.innerHTML = html;
  }

  function downloadInvoicePdf(path) {
    fetch(SUPABASE_URL + '/functions/v1/admin-annuaire?action=invoice-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'x-admin-token': adminToken,
      },
      body: JSON.stringify({ path: path }),
    })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (data.success && data.url) {
        window.open(data.url, '_blank');
      } else {
        alert('Erreur: ' + (data.error || 'Impossible de telecharger la facture'));
      }
    })
    .catch(function () { alert('Erreur reseau'); });
  }

  // ── Delete Modal ──

  var pendingDeleteId = null;

  function showDeleteModal(id) {
    var profile = allProfiles.find(function (p) { return p.id === id; });
    var nameEl = document.getElementById('aadm-delete-name');
    if (nameEl && profile) {
      nameEl.textContent = (profile.first_name || '') + ' ' + (profile.last_name || '') + ' — ' + (SPEC_LABELS[profile.specialty] || profile.specialty || '') + ', ' + (profile.city || '');
    }
    pendingDeleteId = id;
    var modal = document.getElementById('aadm-delete-modal');
    if (modal) modal.style.display = 'flex';
  }

  function hideDeleteModal() {
    pendingDeleteId = null;
    var modal = document.getElementById('aadm-delete-modal');
    if (modal) modal.style.display = 'none';
  }

  function confirmDelete() {
    if (!pendingDeleteId) return;
    var id = pendingDeleteId;
    hideDeleteModal();
    apiPost('delete', { id: id });
  }

  // ── Plan Modal ──

  var pendingPlanId = null;

  function showPlanModal(id) {
    var profile = allProfiles.find(function (p) { return p.id === id; });
    if (!profile) return;

    var nameEl = document.getElementById('aadm-plan-name');
    if (nameEl) nameEl.textContent = (profile.first_name || '') + ' ' + (profile.last_name || '');

    var currentEl = document.getElementById('aadm-plan-current');
    if (currentEl) currentEl.textContent = PLAN_LABELS[profile.plan] || profile.plan || 'Gratuit';

    // Pre-select current plan
    var radios = document.querySelectorAll('input[name="aadm-plan"]');
    radios.forEach(function (r) {
      r.checked = r.value === (profile.plan || 'gratuit');
    });

    pendingPlanId = id;
    var modal = document.getElementById('aadm-plan-modal');
    if (modal) modal.style.display = 'flex';
  }

  function hidePlanModal() {
    pendingPlanId = null;
    var modal = document.getElementById('aadm-plan-modal');
    if (modal) modal.style.display = 'none';
  }

  function confirmPlanChange() {
    if (!pendingPlanId) return;

    var selected = document.querySelector('input[name="aadm-plan"]:checked');
    if (!selected) {
      alert('Veuillez selectionner un plan.');
      return;
    }

    var newPlan = selected.value;
    var profile = allProfiles.find(function (p) { return p.id === pendingPlanId; });
    if (profile && profile.plan === newPlan) {
      hidePlanModal();
      return;
    }

    var id = pendingPlanId;
    hidePlanModal();

    apiPost('update-plan', { id: id, plan: newPlan });
  }

  // ── Actions ──

  function handleAction(action, id, extraData) {
    if (action === 'approve') {
      if (!confirm('Approuver et publier cette fiche ?')) return;
      apiPost('approve', { id: id });
    } else if (action === 'reject') {
      var reason = prompt('Motif du rejet (optionnel) :');
      if (reason === null) return;
      apiPost('reject', { id: id, reason: reason });
    } else if (action === 'delete') {
      showDeleteModal(id);
    } else if (action === 'change-plan') {
      showPlanModal(id);
    } else if (action === 'download-invoice') {
      downloadInvoicePdf(extraData);
    }
  }

  function apiPost(action, body) {
    fetch(SUPABASE_URL + '/functions/v1/admin-annuaire?action=' + action, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + SUPABASE_KEY,
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

  // ── Deploy ──

  function triggerDeploy() {
    var btn = document.getElementById('aadm-deploy');
    if (!btn) return;
    var origText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<svg style="width:1rem;height:1rem;animation:spin 1s linear infinite;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg> Deploiement...';

    fetch(SUPABASE_URL + '/functions/v1/trigger-deploy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'x-admin-token': adminToken,
      },
    })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (data.success) {
        btn.innerHTML = '<svg style="width:1rem;height:1rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Deploiement lance !';
        setTimeout(function () { btn.innerHTML = origText; btn.disabled = false; }, 5000);
      } else {
        alert('Erreur: ' + (data.error || 'Inconnue'));
        btn.innerHTML = origText;
        btn.disabled = false;
      }
    })
    .catch(function () {
      alert('Erreur reseau');
      btn.innerHTML = origText;
      btn.disabled = false;
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

    // Deploy button
    var deployBtn = document.getElementById('aadm-deploy');
    if (deployBtn) deployBtn.addEventListener('click', triggerDeploy);

    // Search bar (profiles)
    var searchInput = document.getElementById('aadm-search');
    if (searchInput) {
      searchInput.addEventListener('input', function () {
        searchQuery = this.value.trim();
        renderProfiles();
      });
    }

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

    // Tab buttons
    document.querySelectorAll('.aadm-tab').forEach(function (btn) {
      btn.addEventListener('click', function () {
        switchTab(this.dataset.tab);
      });
    });

    // Invoices refresh
    var invRefreshBtn = document.getElementById('aadm-invoices-refresh');
    if (invRefreshBtn) invRefreshBtn.addEventListener('click', function () {
      invoicesLoaded = false;
      loadInvoices();
    });

    // Invoices search
    var invSearchInput = document.getElementById('aadm-invoices-search');
    if (invSearchInput) {
      invSearchInput.addEventListener('input', function () {
        invoiceSearchQuery = this.value.trim();
        renderInvoices();
      });
    }

    // Delete modal buttons
    var deleteCancelBtn = document.getElementById('aadm-delete-cancel');
    if (deleteCancelBtn) deleteCancelBtn.addEventListener('click', hideDeleteModal);
    var deleteConfirmBtn = document.getElementById('aadm-delete-confirm');
    if (deleteConfirmBtn) deleteConfirmBtn.addEventListener('click', confirmDelete);

    // Plan modal buttons
    var planCancelBtn = document.getElementById('aadm-plan-cancel');
    if (planCancelBtn) planCancelBtn.addEventListener('click', hidePlanModal);
    var planConfirmBtn = document.getElementById('aadm-plan-confirm');
    if (planConfirmBtn) planConfirmBtn.addEventListener('click', confirmPlanChange);

    // Close modals on backdrop click
    var deleteModal = document.getElementById('aadm-delete-modal');
    if (deleteModal) deleteModal.addEventListener('click', function (e) {
      if (e.target === deleteModal) hideDeleteModal();
    });
    var planModal = document.getElementById('aadm-plan-modal');
    if (planModal) planModal.addEventListener('click', function (e) {
      if (e.target === planModal) hidePlanModal();
    });

    // Close modals on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        hideDeleteModal();
        hidePlanModal();
      }
    });

    // Action delegation (approve/reject/delete/change-plan/download-invoice buttons)
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-action]');
      if (btn && btn.dataset.action) {
        if (btn.dataset.action === 'download-invoice') {
          handleAction('download-invoice', null, btn.dataset.path);
        } else if (btn.dataset.id) {
          handleAction(btn.dataset.action, btn.dataset.id);
        }
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
