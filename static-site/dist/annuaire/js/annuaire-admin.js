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
  var selectedIds = new Set();

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
    var mailTab = document.getElementById('aadm-tab-mail');
    if (profilesTab) profilesTab.style.display = tab === 'profiles' ? '' : 'none';
    if (invoicesTab) invoicesTab.style.display = tab === 'invoices' ? '' : 'none';
    if (mailTab) mailTab.style.display = tab === 'mail' ? '' : 'none';

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
      selectedIds.clear();

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

    // Show bulk bar
    var bulkBar = document.getElementById('aadm-bulk-bar');
    if (bulkBar) bulkBar.style.display = 'flex';

    listEl.innerHTML = filtered.map(function (p) {
      var isChecked = selectedIds.has(p.id);
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
        '<div style="flex-shrink:0;display:flex;align-items:center;"><input type="checkbox" class="aadm-check" data-id="' + p.id + '"' + (isChecked ? ' checked' : '') + ' style="width:1.125rem;height:1.125rem;cursor:pointer;accent-color:hsl(var(--ann-primary));"></div>' +
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

    updateBulkUI();
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
        // Auto-trigger deploy after approve/reject/delete to rebuild static pages
        if (action === 'approve' || action === 'reject' || action === 'delete') {
          autoTriggerDeploy();
        }
      } else {
        alert('Erreur: ' + (data.error || 'Inconnue'));
      }
    })
    .catch(function () {
      alert('Erreur reseau');
    });
  }

  var deployDebounceTimer = null;
  var pendingDeployActions = 0;

  function autoTriggerDeploy() {
    pendingDeployActions++;
    // Debounce: wait 5 seconds after last action before triggering deploy
    // This prevents 10 deploys when approving 10 profiles
    if (deployDebounceTimer) clearTimeout(deployDebounceTimer);
    var btn = document.getElementById('aadm-deploy');
    if (btn) {
      btn.innerHTML = '<svg style="width:1rem;height:1rem;animation:spin 1s linear infinite;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg> Deploiement dans 5s... (' + pendingDeployActions + ' action' + (pendingDeployActions > 1 ? 's' : '') + ')';
    }
    deployDebounceTimer = setTimeout(function () {
      var count = pendingDeployActions;
      pendingDeployActions = 0;
      deployDebounceTimer = null;
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
        if (data.success && btn) {
          var origText = '<svg style="width:1rem;height:1rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg> Deployer les fiches';
          btn.innerHTML = '<svg style="width:1rem;height:1rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Deploiement lance (' + count + ' action' + (count > 1 ? 's' : '') + ')';
          setTimeout(function () { btn.innerHTML = origText; }, 4000);
        }
      })
      .catch(function () { /* silent */ });
    }, 5000);
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

  // ── Bulk Selection ──

  function updateBulkUI() {
    var countEl = document.getElementById('aadm-selected-count');
    var approveBtn = document.getElementById('aadm-bulk-approve');
    var rejectBtn = document.getElementById('aadm-bulk-reject');
    var deleteBtn = document.getElementById('aadm-bulk-delete');
    var selectAll = document.getElementById('aadm-select-all');

    var count = selectedIds.size;
    if (countEl) countEl.textContent = count + ' selectionne' + (count > 1 ? 's' : '');
    if (approveBtn) approveBtn.disabled = count === 0;
    if (rejectBtn) rejectBtn.disabled = count === 0;
    if (deleteBtn) deleteBtn.disabled = count === 0;

    // Update select-all checkbox state
    var checkboxes = document.querySelectorAll('.aadm-check');
    if (selectAll && checkboxes.length > 0) {
      selectAll.checked = count > 0 && count === checkboxes.length;
      selectAll.indeterminate = count > 0 && count < checkboxes.length;
    }
  }

  function bulkAction(action) {
    if (selectedIds.size === 0) return;
    var ids = Array.from(selectedIds);
    var count = ids.length;

    if (action === 'approve') {
      if (!confirm('Approuver et publier ' + count + ' fiche' + (count > 1 ? 's' : '') + ' ?')) return;
    } else if (action === 'reject') {
      var reason = prompt('Motif du rejet (optionnel) pour ' + count + ' fiche(s) :');
      if (reason === null) return;
    } else if (action === 'delete') {
      if (!confirm('Supprimer definitivement ' + count + ' fiche' + (count > 1 ? 's' : '') + ' ? Cette action est irreversible.')) return;
    }

    var completed = 0;
    var errors = 0;

    ids.forEach(function (id) {
      var body = { id: id };
      if (action === 'reject' && reason) body.reason = reason;

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
        if (!data.success) errors++;
        completed++;
        if (completed === count) {
          selectedIds.clear();
          allProfiles = [];
          loadProfiles();
          autoTriggerDeploy();
          if (errors > 0) alert(errors + ' erreur(s) sur ' + count + ' action(s).');
        }
      })
      .catch(function () {
        errors++;
        completed++;
        if (completed === count) {
          selectedIds.clear();
          allProfiles = [];
          loadProfiles();
          if (errors > 0) alert(errors + ' erreur(s) sur ' + count + ' action(s).');
        }
      });
    });
  }

  // ── Mail Templates ──

  var MAIL_TEMPLATES = {
    prospection: {
      subject: 'Invitation a rejoindre un nouvel annuaire specialise',
      html: '<p style="font-size:15px;line-height:1.7;color:#1a1a2e;margin:0 0 16px;">Bonjour,</p>\n' +
        '<p style="font-size:15px;line-height:1.7;color:#1a1a2e;margin:0 0 16px;">Nous avons le plaisir de vous informer du lancement d\'un <strong>nouvel annuaire en ligne</strong> dedie aux professionnels de la therapie de couple, sexologie et mediation familiale.</p>\n' +
        '<p style="font-size:15px;line-height:1.7;color:#1a1a2e;margin:0 0 16px;">L\'<strong>Annuaire Quiz Couple</strong> a ete concu pour offrir une visibilite optimale aux professionnels comme vous, aupres de patients qui recherchent activement un specialiste dans leur ville.</p>\n' +
        '<p style="font-size:15px;line-height:1.7;color:#1a1a2e;margin:0 0 20px;">Votre inscription est <strong>gratuite</strong> et ne prend que quelques minutes :</p>\n' +
        '<!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://annuaire.quiz-couple.com/rejoindre/" style="height:44px;v-text-anchor:middle;width:260px;" arcsize="14%" strokecolor="#c0507e" fillcolor="#c0507e"><w:anchorlock/><center style="color:#ffffff;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;">Creer ma fiche gratuitement</center></v:roundrect><![endif]-->\n' +
        '<!--[if !mso]><!--><a href="https://annuaire.quiz-couple.com/rejoindre/" style="display:inline-block;background-color:#c0507e;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;padding:12px 28px;border-radius:6px;font-family:Arial,sans-serif;">Creer ma fiche gratuitement</a><!--<![endif]-->\n' +
        '<p style="font-size:15px;line-height:1.7;color:#1a1a2e;margin:24px 0 16px;">Ce que l\'annuaire vous apporte :</p>\n' +
        '<ul style="font-size:15px;line-height:1.8;color:#1a1a2e;margin:0 0 16px;padding-left:20px;">\n' +
        '  <li>Une fiche professionnelle complete et referencee sur Google</li>\n' +
        '  <li>Une visibilite locale aupres de patients dans votre ville</li>\n' +
        '  <li>Un lien direct vers votre site ou votre Doctolib</li>\n' +
        '</ul>\n' +
        '<p style="font-size:15px;line-height:1.7;color:#1a1a2e;margin:0 0 16px;">N\'hesitez pas a decouvrir l\'annuaire : <a href="https://annuaire.quiz-couple.com/" style="color:#c0507e;">annuaire.quiz-couple.com</a></p>\n' +
        '<p style="font-size:15px;line-height:1.7;color:#1a1a2e;margin:0 0 4px;">Cordialement,</p>\n' +
        '<p style="font-size:15px;line-height:1.7;color:#1a1a2e;margin:0;">L\'equipe Annuaire Quiz Couple</p>',
    },
  };

  function wrapMailHtml(bodyHtml) {
    // Wrap in a responsive, anti-spam compliant email wrapper
    // Key anti-spam rules: 600px max, inline CSS, system fonts, minimal structure, DOCTYPE
    return '<!DOCTYPE html>\n' +
      '<html lang="fr" xmlns="http://www.w3.org/1999/xhtml">\n' +
      '<head>\n' +
      '  <meta charset="UTF-8">\n' +
      '  <meta name="viewport" content="width=device-width,initial-scale=1">\n' +
      '  <meta http-equiv="X-UA-Compatible" content="IE=edge">\n' +
      '  <title></title>\n' +
      '  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->\n' +
      '</head>\n' +
      '<body style="margin:0;padding:0;background-color:#f4f4f7;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">\n' +
      '  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7;">\n' +
      '    <tr><td align="center" style="padding:32px 16px;">\n' +
      '      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;">\n' +
      '        <!-- Content -->\n' +
      '        <tr><td style="padding:32px 40px;">\n' +
      bodyHtml + '\n' +
      '        </td></tr>\n' +
      '        <!-- Footer -->\n' +
      '        <tr><td style="padding:20px 40px;border-top:1px solid #e8e8ed;">\n' +
      '          <p style="font-size:12px;line-height:1.6;color:#8e8ea0;margin:0;text-align:center;">\n' +
      '            Annuaire Quiz Couple &mdash; annuaire.quiz-couple.com\n' +
      '          </p>\n' +
      '        </td></tr>\n' +
      '      </table>\n' +
      '    </td></tr>\n' +
      '  </table>\n' +
      '</body>\n' +
      '</html>';
  }

  function parseEmails(text) {
    // Split by newlines, commas, semicolons
    return text
      .split(/[\n,;]+/)
      .map(function (e) { return e.trim().toLowerCase(); })
      .filter(function (e) { return e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); });
  }

  function updateMailCount() {
    var textarea = document.getElementById('aadm-mail-emails');
    var countEl = document.getElementById('aadm-mail-count');
    if (!textarea || !countEl) return;
    var emails = parseEmails(textarea.value);
    var unique = new Set(emails);
    countEl.textContent = unique.size + ' email(s) unique(s)';
  }

  function loadMailTemplate(templateKey) {
    var tpl = MAIL_TEMPLATES[templateKey];
    if (!tpl) return;
    var subjectInput = document.getElementById('aadm-mail-subject');
    var htmlInput = document.getElementById('aadm-mail-html');
    if (subjectInput) subjectInput.value = tpl.subject;
    if (htmlInput) htmlInput.value = tpl.html;
  }

  function refreshMailPreview() {
    var htmlInput = document.getElementById('aadm-mail-html');
    var previewEl = document.getElementById('aadm-mail-preview');
    if (!htmlInput || !previewEl) return;

    var bodyHtml = htmlInput.value.trim();
    if (!bodyHtml) {
      previewEl.innerHTML = '<p style="color:hsl(var(--ann-muted-fg));font-size:0.875rem;text-align:center;padding:2rem 0;">Saisissez du contenu HTML pour voir l\'apercu.</p>';
      return;
    }

    var fullHtml = wrapMailHtml(bodyHtml);
    // Render in a sandboxed iframe for safety
    var iframe = document.createElement('iframe');
    iframe.style.cssText = 'width:100%;border:none;min-height:20rem;background:#fff;border-radius:4px;';
    iframe.sandbox = 'allow-same-origin';
    previewEl.innerHTML = '';
    previewEl.appendChild(iframe);

    var doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(fullHtml);
    doc.close();

    // Auto-resize iframe to content
    setTimeout(function () {
      try {
        var h = doc.documentElement.scrollHeight;
        if (h > 0) iframe.style.height = Math.min(h + 20, 600) + 'px';
      } catch (e) { /* cross-origin fallback */ }
    }, 200);
  }

  function sendMassMail() {
    var emailsTextarea = document.getElementById('aadm-mail-emails');
    var subjectInput = document.getElementById('aadm-mail-subject');
    var htmlInput = document.getElementById('aadm-mail-html');
    var fromNameInput = document.getElementById('aadm-mail-from-name');
    var replyToInput = document.getElementById('aadm-mail-reply-to');
    var sendBtn = document.getElementById('aadm-mail-send');
    var statusEl = document.getElementById('aadm-mail-status');
    var progressEl = document.getElementById('aadm-mail-progress');
    var progressBar = document.getElementById('aadm-mail-progress-bar');
    var progressText = document.getElementById('aadm-mail-progress-text');
    var resultsEl = document.getElementById('aadm-mail-results');

    if (!emailsTextarea || !subjectInput || !htmlInput) return;

    var emails = parseEmails(emailsTextarea.value);
    var uniqueEmails = Array.from(new Set(emails));
    var subject = subjectInput.value.trim();
    var bodyHtml = htmlInput.value.trim();
    var fromName = fromNameInput ? fromNameInput.value.trim() : '';
    var replyTo = replyToInput ? replyToInput.value.trim() : '';

    if (uniqueEmails.length === 0) {
      if (statusEl) { statusEl.textContent = 'Aucun email valide.'; statusEl.style.color = 'hsl(0 70% 50%)'; }
      return;
    }
    if (!subject) {
      if (statusEl) { statusEl.textContent = 'Sujet requis.'; statusEl.style.color = 'hsl(0 70% 50%)'; }
      return;
    }
    if (!bodyHtml) {
      if (statusEl) { statusEl.textContent = 'Contenu HTML requis.'; statusEl.style.color = 'hsl(0 70% 50%)'; }
      return;
    }

    var fullHtml = wrapMailHtml(bodyHtml);

    if (!confirm('Envoyer ' + uniqueEmails.length + ' email(s) ?\n\nObjet : ' + subject + '\n\nCette action est irreversible.')) return;

    // UI: disable and show progress
    if (sendBtn) { sendBtn.disabled = true; sendBtn.textContent = 'Envoi en cours...'; }
    if (statusEl) { statusEl.textContent = 'Envoi en cours...'; statusEl.style.color = 'hsl(var(--ann-muted-fg))'; }
    if (progressEl) progressEl.style.display = 'block';
    if (progressBar) progressBar.style.width = '0%';
    if (progressText) progressText.textContent = '0 / ' + uniqueEmails.length + ' envoye(s)';
    if (resultsEl) resultsEl.style.display = 'none';

    // Simulate progress while waiting (the backend processes all)
    var progressInterval = setInterval(function () {
      // The actual progress is unknown since it's one API call. Show an animated bar.
    }, 500);

    // Show an indeterminate animation
    if (progressBar) {
      progressBar.style.width = '30%';
      setTimeout(function () { if (progressBar) progressBar.style.width = '60%'; }, 3000);
      setTimeout(function () { if (progressBar) progressBar.style.width = '80%'; }, 10000);
    }

    var requestBody = {
      emails: uniqueEmails,
      subject: subject,
      html: fullHtml,
    };
    if (fromName) requestBody.fromName = fromName;
    if (replyTo) requestBody.replyTo = replyTo;

    fetch(SUPABASE_URL + '/functions/v1/admin-mass-mail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'x-admin-token': adminToken,
      },
      body: JSON.stringify(requestBody),
    })
    .then(function (r) {
      if (r.status === 401 || r.status === 403) {
        logout();
        throw new Error('Session expiree');
      }
      return r.json();
    })
    .then(function (data) {
      clearInterval(progressInterval);
      if (progressBar) progressBar.style.width = '100%';
      if (progressText) progressText.textContent = (data.sent || 0) + ' / ' + (data.total || uniqueEmails.length) + ' envoye(s)';

      if (data.success) {
        var msg = data.sent + ' email(s) envoye(s) avec succes.';
        if (data.failed > 0) msg += ' ' + data.failed + ' echec(s).';
        if (statusEl) { statusEl.textContent = msg; statusEl.style.color = data.failed > 0 ? 'hsl(40 70% 40%)' : 'hsl(160 60% 35%)'; }

        if (resultsEl) {
          var bgColor = data.failed > 0 ? 'hsl(40 90% 55%/0.08)' : 'hsl(160 60% 45%/0.08)';
          var borderColor = data.failed > 0 ? 'hsl(40 90% 55%/0.25)' : 'hsl(160 60% 45%/0.25)';
          var textColor = data.failed > 0 ? 'hsl(40 70% 35%)' : 'hsl(160 60% 30%)';
          resultsEl.style.display = 'block';
          resultsEl.style.background = bgColor;
          resultsEl.style.border = '1px solid ' + borderColor;
          resultsEl.style.color = textColor;
          var html = '<strong>' + msg + '</strong>';
          if (data.errors && data.errors.length > 0) {
            html += '<br><br><strong>Erreurs :</strong><ul style="margin:0.5rem 0 0;padding-left:1.25rem;font-size:0.8125rem;">';
            data.errors.forEach(function (e) { html += '<li>' + esc(e) + '</li>'; });
            html += '</ul>';
          }
          resultsEl.innerHTML = html;
        }
      } else {
        if (statusEl) { statusEl.textContent = 'Erreur: ' + (data.error || 'Inconnue'); statusEl.style.color = 'hsl(0 70% 50%)'; }
      }
    })
    .catch(function (err) {
      clearInterval(progressInterval);
      if (statusEl) { statusEl.textContent = 'Erreur: ' + (err.message || 'Erreur reseau'); statusEl.style.color = 'hsl(0 70% 50%)'; }
    })
    .finally(function () {
      if (sendBtn) {
        sendBtn.disabled = false;
        sendBtn.innerHTML = '<svg style="width:1rem;height:1rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Envoyer';
      }
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

    // ── Mail tab events ──
    var mailEmailsTextarea = document.getElementById('aadm-mail-emails');
    if (mailEmailsTextarea) {
      mailEmailsTextarea.addEventListener('input', updateMailCount);
    }

    var mailTemplateSelect = document.getElementById('aadm-mail-template');
    if (mailTemplateSelect) {
      mailTemplateSelect.addEventListener('change', function () {
        if (this.value) loadMailTemplate(this.value);
      });
    }

    var mailPreviewBtn = document.getElementById('aadm-mail-preview-btn');
    if (mailPreviewBtn) mailPreviewBtn.addEventListener('click', refreshMailPreview);

    var mailSendBtn = document.getElementById('aadm-mail-send');
    if (mailSendBtn) mailSendBtn.addEventListener('click', sendMassMail);

    // Bulk action buttons
    var bulkApproveBtn = document.getElementById('aadm-bulk-approve');
    if (bulkApproveBtn) bulkApproveBtn.addEventListener('click', function () { bulkAction('approve'); });
    var bulkRejectBtn = document.getElementById('aadm-bulk-reject');
    if (bulkRejectBtn) bulkRejectBtn.addEventListener('click', function () { bulkAction('reject'); });
    var bulkDeleteBtn = document.getElementById('aadm-bulk-delete');
    if (bulkDeleteBtn) bulkDeleteBtn.addEventListener('click', function () { bulkAction('delete'); });

    // Select all checkbox
    var selectAllCb = document.getElementById('aadm-select-all');
    if (selectAllCb) selectAllCb.addEventListener('change', function () {
      var checked = this.checked;
      document.querySelectorAll('.aadm-check').forEach(function (cb) {
        cb.checked = checked;
        if (checked) selectedIds.add(cb.dataset.id);
        else selectedIds.delete(cb.dataset.id);
      });
      updateBulkUI();
    });

    // Individual checkbox delegation
    document.addEventListener('change', function (e) {
      if (e.target.classList.contains('aadm-check')) {
        if (e.target.checked) selectedIds.add(e.target.dataset.id);
        else selectedIds.delete(e.target.dataset.id);
        updateBulkUI();
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
