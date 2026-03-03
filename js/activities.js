/**
 * Activities Search Engine - Geolocated couple activities finder
 * Steps: Location → Filters → Results (map + cards)
 * Calls Supabase Edge Function "search-activities"
 */
(function() {
  'use strict';

  var container = document.getElementById('activities-engine');
  if (!container) return;

  var lang = container.dataset.lang || 'fr';
  var SUPABASE_URL = container.dataset.supabaseUrl || '';
  var SUPABASE_KEY = container.dataset.supabaseKey || '';

  // ── SVG Icons ───────────────────────────────────────────────
  var ICONS = {
    mapPin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    crosshair: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    filter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><polyline points="20 6 9 17 4 12"/></svg>',
    navigation: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none" class="w-4 h-4"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    shuffle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>',
    arrowLeft: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
    chevDown: '<svg viewBox="0 0 12 12" fill="none" class="w-4 h-4"><path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
    cloud: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/></svg>',
    droplet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/></svg>',
    thermometer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z"/></svg>'
  };

  // ── Category definitions ────────────────────────────────────
  var CATEGORIES = [
    { id: 'culture',        tKey: 'culture',        emoji: '\uD83C\uDFDB\uFE0F', color: '#8b5cf6' },
    { id: 'nature',         tKey: 'nature',         emoji: '\uD83C\uDF3F',       color: '#22c55e' },
    { id: 'sport',          tKey: 'sport',          emoji: '\u26A1',             color: '#f97316' },
    { id: 'divertissement', tKey: 'divertissement', emoji: '\uD83C\uDFAE',       color: '#ec4899' },
    { id: 'bienEtre',       tKey: 'bienEtre',       emoji: '\uD83E\uDDD8',       color: '#06b6d4' },
    { id: 'gastronomie',    tKey: 'gastronomie',    emoji: '\uD83C\uDF77',       color: '#ef4444' },
    { id: 'ateliers',       tKey: 'ateliers',       emoji: '\uD83C\uDFA8',       color: '#eab308' }
  ];

  var RADIUS_STEPS = [1, 3, 5, 10, 15, 20, 30, 50];

  // ── State ───────────────────────────────────────────────────
  var state = {
    step: 'location',
    lat: null,
    lng: null,
    address: '',
    radiusIndex: 3, // 10km default
    activityTypes: [],
    intensity: 'indifferent',
    ambiance: [],
    duration: 'indifferent',
    environment: 'indifferent',
    setting: 'indifferent',
    novelty: 'indifferent',
    budget: 'indifferent',
    groupSize: 'couple',
    groupComposition: 'couple',
    childrenAge: null,
    results: [],
    weather: null,
    meta: null,
    loading: false,
    error: null,
    sortBy: 'score',
    map: null,
    markersLayer: null,
    radiusCircle: null,
    geolocating: false,
    nominatimResults: []
  };

  var t = {};
  var nominatimTimer = null;

  // ── Translation loading ─────────────────────────────────────
  loadTranslations(function() { render(); });

  function loadTranslations(cb) {
    fetch('/js/data/activities-' + lang + '.json')
      .then(function(r) { return r.json(); })
      .then(function(data) { t = data || {}; cb(); })
      .catch(function() {
        fetch('/js/data/activities-fr.json')
          .then(function(r) { return r.json(); })
          .then(function(data) { t = data || {}; cb(); })
          .catch(function() { t = {}; cb(); });
      });
  }

  function tr(key, fallback, replacements) {
    var parts = key.split('.');
    var val = t;
    for (var i = 0; i < parts.length; i++) {
      if (val && typeof val === 'object' && parts[i] in val) {
        val = val[parts[i]];
      } else {
        val = null;
        break;
      }
    }
    var result = (typeof val === 'string') ? val : (fallback || key);
    if (replacements) {
      Object.keys(replacements).forEach(function(k) {
        result = result.replace('{' + k + '}', replacements[k]);
      });
    }
    return result;
  }

  // ── Scroll helper ─────────────────────────────────────────
  function scrollToTool() {
    var toolSection = document.getElementById('outil');
    if (toolSection) {
      toolSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // ── Main render ─────────────────────────────────────────────
  function render() {
    container.innerHTML = '';
    var wrap = el('div', 'space-y-6 animate-fade-in');

    renderStepIndicator(wrap);

    switch (state.step) {
      case 'location': renderLocation(wrap); break;
      case 'filters': renderFilters(wrap); break;
      case 'loading': renderLoading(wrap); doSearch(); break;
      case 'results': renderResults(wrap); break;
    }

    container.appendChild(wrap);
  }

  // ── Step indicator ──────────────────────────────────────────
  function renderStepIndicator(parent) {
    var steps = [
      { key: 'location', label: tr('form.stepLocation', 'Localisation'), icon: ICONS.mapPin },
      { key: 'filters',  label: tr('form.stepFilters', 'Filtres'),       icon: ICONS.filter },
      { key: 'results',  label: tr('form.stepResults', 'Resultats'),     icon: ICONS.search }
    ];
    var currentIndex = steps.findIndex(function(s) { return s.key === state.step; });
    if (state.step === 'loading') currentIndex = 2;

    var bar = el('div', 'flex items-center justify-center gap-0 mb-8');
    for (var i = 0; i < steps.length; i++) {
      var isComplete = i < currentIndex;
      var isActive = i === currentIndex;

      var circle = el('div', 'flex flex-col items-center');
      var dot = el('div', 'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all');
      if (isComplete) {
        dot.style.cssText = 'background:hsl(var(--primary));color:white;';
        dot.innerHTML = ICONS.check;
      } else if (isActive) {
        dot.style.cssText = 'border:2px solid hsl(var(--primary));color:hsl(var(--primary));background:transparent;';
        dot.innerHTML = steps[i].icon;
      } else {
        dot.style.cssText = 'background:hsl(var(--muted));color:hsl(var(--muted-foreground));';
        dot.innerHTML = steps[i].icon;
      }
      circle.appendChild(dot);

      var label = el('span', 'text-xs mt-1 ' + (isActive ? 'text-primary font-medium' : 'text-muted-foreground'));
      label.textContent = steps[i].label;
      circle.appendChild(label);
      bar.appendChild(circle);

      if (i < steps.length - 1) {
        var line = el('div', 'flex-1 h-0.5 mx-2 mt-[-16px]');
        line.style.cssText = 'background:' + (i < currentIndex ? 'hsl(var(--primary))' : 'hsl(var(--border))') + ';min-width:32px;max-width:60px;';
        bar.appendChild(line);
      }
    }
    parent.appendChild(bar);
  }

  // ── Step 1: Location ────────────────────────────────────────
  function renderLocation(parent) {
    var form = el('div', 'space-y-6 max-w-lg mx-auto');

    // Geolocation button
    var geoBtn = el('button', 'btn btn-cta w-full flex items-center justify-center gap-2 py-4 text-lg');
    geoBtn.type = 'button';
    if (state.geolocating) {
      geoBtn.innerHTML = '<div class="spinner w-5 h-5"></div> ' + esc(tr('form.geolocSearching', 'Recherche...'));
      geoBtn.disabled = true;
    } else {
      geoBtn.innerHTML = ICONS.crosshair + ' ' + esc(tr('form.geolocBtn', 'Me geolocaliser'));
    }
    geoBtn.addEventListener('click', function() {
      if (!navigator.geolocation) {
        showLocationError(tr('form.geolocError', 'Geolocalisation non disponible'));
        return;
      }
      state.geolocating = true;
      render();
      navigator.geolocation.getCurrentPosition(
        function(pos) {
          state.lat = pos.coords.latitude;
          state.lng = pos.coords.longitude;
          state.geolocating = false;
          reverseGeocode(state.lat, state.lng, function(addr) {
            state.address = addr;
            render();
          });
        },
        function() {
          state.geolocating = false;
          showLocationError(tr('form.geolocDenied', 'Geolocalisation refusee'));
          render();
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
    form.appendChild(geoBtn);

    // Separator
    var sep = el('div', 'flex items-center gap-3');
    var sepLine1 = el('div', 'flex-1 h-px bg-border');
    var sepText = el('span', 'text-sm text-muted-foreground');
    sepText.textContent = 'ou';
    var sepLine2 = el('div', 'flex-1 h-px bg-border');
    sep.appendChild(sepLine1);
    sep.appendChild(sepText);
    sep.appendChild(sepLine2);
    form.appendChild(sep);

    // Address search
    var searchGroup = el('div', 'space-y-2 relative');
    var searchLabel = el('label', 'text-sm font-semibold');
    searchLabel.textContent = tr('form.addressPlaceholder', 'Entrez une adresse ou un lieu');
    searchGroup.appendChild(searchLabel);

    var searchInput = el('input', 'input w-full');
    searchInput.type = 'text';
    searchInput.placeholder = tr('form.addressPlaceholder', 'Entrez une adresse ou un lieu');
    searchInput.value = state.address;
    searchInput.addEventListener('input', function() {
      state.address = searchInput.value;
      clearTimeout(nominatimTimer);
      if (searchInput.value.length >= 3) {
        nominatimTimer = setTimeout(function() { searchNominatim(searchInput.value, searchGroup); }, 300);
      } else {
        removeDropdown(searchGroup);
      }
    });
    searchGroup.appendChild(searchInput);
    form.appendChild(searchGroup);

    // Current location display
    if (state.lat && state.address) {
      var locDisplay = el('div', 'flex items-center gap-2 p-3 rounded-lg border border-primary/30 bg-primary/5');
      var locIcon = el('span', 'text-primary');
      locIcon.innerHTML = ICONS.mapPin;
      locDisplay.appendChild(locIcon);
      var locText = el('span', 'text-sm font-medium flex-1');
      locText.textContent = state.address;
      locDisplay.appendChild(locText);
      var locCoords = el('span', 'text-xs text-muted-foreground');
      locCoords.textContent = state.lat.toFixed(4) + ', ' + state.lng.toFixed(4);
      locDisplay.appendChild(locCoords);
      form.appendChild(locDisplay);
    }

    // Radius slider
    var radiusGroup = el('div', 'space-y-3');
    var radiusHeader = el('div', 'flex items-center justify-between');
    var radiusLabel = el('label', 'text-sm font-semibold');
    radiusLabel.textContent = tr('form.radiusLabel', 'Rayon de recherche');
    radiusHeader.appendChild(radiusLabel);
    var radiusValue = el('span', 'text-sm font-bold text-primary');
    radiusValue.textContent = RADIUS_STEPS[state.radiusIndex] + ' km';
    radiusHeader.appendChild(radiusValue);
    radiusGroup.appendChild(radiusHeader);

    var slider = el('input', 'range-slider w-full');
    slider.type = 'range';
    slider.min = '0';
    slider.max = String(RADIUS_STEPS.length - 1);
    slider.value = String(state.radiusIndex);
    slider.addEventListener('input', function() {
      state.radiusIndex = parseInt(slider.value, 10);
      radiusValue.textContent = RADIUS_STEPS[state.radiusIndex] + ' km';
    });
    radiusGroup.appendChild(slider);

    var radiusTicks = el('div', 'flex justify-between');
    RADIUS_STEPS.forEach(function(v) {
      var tick = el('span', 'text-xs text-muted-foreground');
      tick.textContent = v;
      radiusTicks.appendChild(tick);
    });
    radiusGroup.appendChild(radiusTicks);
    form.appendChild(radiusGroup);

    // Next button
    var nextBtn = el('button', 'btn btn-cta w-full mt-4');
    nextBtn.type = 'button';
    nextBtn.textContent = tr('form.next', 'Suivant');
    nextBtn.disabled = !state.lat;
    if (!state.lat) nextBtn.style.opacity = '0.5';
    nextBtn.addEventListener('click', function() {
      if (!state.lat) return;
      state.step = 'filters';
      if (state.activityTypes.length === 0) {
        state.activityTypes = CATEGORIES.map(function(c) { return c.id; });
      }
      render();
    });
    form.appendChild(nextBtn);

    // Business promo link
    var promoLink = el('p', 'text-center text-xs text-muted-foreground mt-4');
    promoLink.innerHTML = tr('form.businessPromo', 'Entreprise : <a href="' + getContactUrl() + '" class="text-primary hover:underline">Contactez Quiz Couple pour promouvoir votre business ici !</a>');
    form.appendChild(promoLink);

    parent.appendChild(form);
  }

  function showLocationError(msg) {
    var existing = container.querySelector('.location-error');
    if (existing) existing.remove();
    var errDiv = el('div', 'location-error text-sm text-destructive text-center p-2');
    errDiv.textContent = msg;
    var form = container.querySelector('.space-y-6');
    if (form) form.insertBefore(errDiv, form.firstChild);
    setTimeout(function() { if (errDiv.parentNode) errDiv.remove(); }, 4000);
  }

  // ── Nominatim autocomplete ──────────────────────────────────
  function searchNominatim(query, parentEl) {
    fetch('https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(query) +
      '&format=json&limit=5&accept-language=' + lang)
      .then(function(r) { return r.json(); })
      .then(function(results) {
        removeDropdown(parentEl);
        if (!results || results.length === 0) return;

        var dropdown = el('div', 'nominatim-dropdown');
        results.forEach(function(r) {
          var item = el('div', 'nominatim-item');
          item.textContent = r.display_name;
          item.addEventListener('click', function() {
            state.lat = parseFloat(r.lat);
            state.lng = parseFloat(r.lon);
            state.address = r.display_name;
            removeDropdown(parentEl);
            render();
          });
          dropdown.appendChild(item);
        });
        parentEl.appendChild(dropdown);
      })
      .catch(function() {});
  }

  function reverseGeocode(lat, lng, cb) {
    fetch('https://nominatim.openstreetmap.org/reverse?lat=' + lat + '&lon=' + lng +
      '&format=json&accept-language=' + lang)
      .then(function(r) { return r.json(); })
      .then(function(data) {
        cb(data.display_name || (lat.toFixed(4) + ', ' + lng.toFixed(4)));
      })
      .catch(function() {
        cb(lat.toFixed(4) + ', ' + lng.toFixed(4));
      });
  }

  function removeDropdown(parentEl) {
    var d = parentEl.querySelector('.nominatim-dropdown');
    if (d) d.remove();
  }

  // ── Step 2: Filters ────────────────────────────────────────
  function renderFilters(parent) {
    var form = el('div', 'space-y-6 rounded-2xl border border-border bg-card p-5 md:p-8 max-w-3xl mx-auto');

    // Back button + location badge
    var backRow = el('div', 'flex items-center gap-2 mb-2');
    var backBtn = el('button', 'btn btn-outline flex items-center gap-1 text-sm');
    backBtn.type = 'button';
    backBtn.innerHTML = ICONS.arrowLeft + ' ' + esc(tr('form.back', 'Retour'));
    backBtn.addEventListener('click', function() {
      state.step = 'location';
      render();
    });
    backRow.appendChild(backBtn);
    var locBadge = el('span', 'text-sm text-muted-foreground flex-1 truncate');
    locBadge.textContent = state.address;
    backRow.appendChild(locBadge);
    form.appendChild(backRow);

    // ── Activity types (always visible) ──
    var typesBlock = el('div', 'rounded-xl border border-border bg-card p-5 space-y-3');
    var typesTitle = el('h3', 'font-semibold text-sm flex items-center gap-2');
    typesTitle.innerHTML = '<span style="color:hsl(var(--primary));">' + ICONS.filter + '</span> ' + esc(tr('form.activityTypes', "Types d'activites"));
    typesBlock.appendChild(typesTitle);

    // Select all / deselect all
    var allSelected = state.activityTypes.length === CATEGORIES.length;
    var toggleRow = el('div', 'flex justify-end');
    var toggleBtn = el('button', 'text-xs text-primary hover:underline');
    toggleBtn.type = 'button';
    toggleBtn.textContent = allSelected ? tr('form.deselectAll', 'Tout deselectionner') : tr('form.selectAll', 'Tout selectionner');
    toggleBtn.addEventListener('click', function() {
      if (allSelected) { state.activityTypes = []; } else { state.activityTypes = CATEGORIES.map(function(c) { return c.id; }); }
      render();
    });
    toggleRow.appendChild(toggleBtn);
    typesBlock.appendChild(toggleRow);

    var catsGrid = el('div', 'flex flex-wrap gap-2');
    CATEGORIES.forEach(function(cat) {
      var isActive = state.activityTypes.indexOf(cat.id) !== -1;
      var chip = el('button', 'activity-chip' + (isActive ? ' active' : ''));
      chip.type = 'button';
      if (isActive) {
        chip.style.borderColor = cat.color;
        chip.style.background = cat.color + '15';
      }
      chip.innerHTML = '<span>' + cat.emoji + '</span> ' + esc(tr('categories.' + cat.tKey, cat.id));
      chip.addEventListener('click', function() {
        var idx = state.activityTypes.indexOf(cat.id);
        if (idx === -1) { state.activityTypes.push(cat.id); } else { state.activityTypes.splice(idx, 1); }
        render();
      });
      catsGrid.appendChild(chip);
    });
    typesBlock.appendChild(catsGrid);
    form.appendChild(typesBlock);

    // ── Budget + Group (side by side on desktop) ──
    var rowGrid = el('div', 'grid md:grid-cols-2 gap-4');

    // Budget
    var budgetBlock = el('div', 'rounded-xl border border-border bg-card/50 p-5 space-y-3');
    var budgetTitle = el('h3', 'font-semibold text-sm');
    budgetTitle.textContent = tr('form.budget', 'Budget');
    budgetBlock.appendChild(budgetTitle);
    budgetBlock.appendChild(renderOptionGroup(
      '',
      [
        { value: 'indifferent', label: tr('form.budgetIndifferent', 'Indifferent') },
        { value: 'free', label: tr('form.budgetFree', 'Gratuit') },
        { value: 'small', label: tr('form.budgetSmall', '< 15\u20AC') },
        { value: 'medium', label: tr('form.budgetMedium', '15-35\u20AC') },
        { value: 'comfortable', label: tr('form.budgetComfortable', '35-55\u20AC') },
        { value: 'premium', label: tr('form.budgetPremium', '55\u20AC+') }
      ],
      state.budget,
      function(v) { state.budget = v; render(); }
    ));
    rowGrid.appendChild(budgetBlock);

    // Group (composition only — groupSize is derived)
    var groupBlock = el('div', 'rounded-xl border border-border bg-card/50 p-5 space-y-3');
    var groupTitle = el('h3', 'font-semibold text-sm');
    groupTitle.textContent = tr('form.groupComposition', 'Composition du groupe');
    groupBlock.appendChild(groupTitle);
    groupBlock.appendChild(renderOptionGroup(
      '',
      [
        { value: 'couple', label: tr('form.groupCouple', 'Couple') },
        { value: 'adults', label: tr('form.groupAdults', 'Adultes') },
        { value: 'family', label: tr('form.groupFamily', 'Famille') },
        { value: 'friends', label: tr('form.groupFriends', 'Amis') },
        { value: 'team', label: tr('form.groupTeamBuilding', 'Team building') }
      ],
      state.groupComposition,
      function(v) {
        state.groupComposition = v;
        // Derive groupSize from composition
        var sizeMap = { couple: 'couple', adults: 'small', family: 'small', friends: 'small', team: 'large' };
        state.groupSize = sizeMap[v] || 'couple';
        render();
      }
    ));
    if (state.groupComposition === 'family') {
      groupBlock.appendChild(renderOptionGroup(
        tr('form.childrenAge', 'Age des enfants'),
        [
          { value: '0-3', label: tr('form.childrenAge0_3', '0-3 ans') },
          { value: '3-6', label: tr('form.childrenAge3_6', '3-6 ans') },
          { value: '6-12', label: tr('form.childrenAge6_12', '6-12 ans') },
          { value: '12-16', label: tr('form.childrenAge12_16', '12-16 ans') }
        ],
        state.childrenAge || '6-12',
        function(v) { state.childrenAge = v; render(); }
      ));
    }
    rowGrid.appendChild(groupBlock);
    form.appendChild(rowGrid);

    // ── Preferences (collapsible "more filters") ──
    var moreBlock = el('div', 'rounded-xl border border-border bg-card overflow-hidden');
    var moreHeader = el('button', 'w-full flex items-center justify-between p-4 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors');
    moreHeader.type = 'button';
    var moreHeaderText = el('span', '');
    moreHeaderText.textContent = tr('form.moreFilters', 'Filtres avancés (optionnel)');
    moreHeader.appendChild(moreHeaderText);
    var moreChevron = el('span', 'transition-transform duration-200' + (state.showMore ? ' rotate-180' : ''));
    moreChevron.innerHTML = ICONS.chevDown;
    moreHeader.appendChild(moreChevron);
    moreHeader.addEventListener('click', function() {
      state.showMore = !state.showMore;
      render();
    });
    moreBlock.appendChild(moreHeader);

    if (state.showMore) {
      var moreBody = el('div', 'p-5 pt-0 space-y-4 border-t border-border');

      // Ambiance (multi-select chips)
      var ambianceGroup = el('div', 'space-y-2');
      var ambianceLabel = el('label', 'text-sm font-medium text-muted-foreground');
      ambianceLabel.textContent = tr('form.ambiance', 'Ambiance');
      ambianceGroup.appendChild(ambianceLabel);
      var ambianceGrid = el('div', 'flex flex-wrap gap-2');
      var ambiances = [
        { value: 'calme', label: tr('form.ambianceCalme', 'Calme') },
        { value: 'fun', label: tr('form.ambianceFun', 'Fun') },
        { value: 'culturel', label: tr('form.ambianceCulturel', 'Culturel') },
        { value: 'adrenaline', label: tr('form.ambianceAdrenaline', 'Adrenaline') },
        { value: 'romantique', label: tr('form.ambianceRomantique', 'Romantique') },
        { value: 'familial', label: tr('form.ambianceFamilial', 'Familial') }
      ];
      ambiances.forEach(function(a) {
        var isActive = state.ambiance.indexOf(a.value) !== -1;
        var chip = el('button', 'activity-chip' + (isActive ? ' active' : ''));
        chip.type = 'button';
        chip.textContent = a.label;
        chip.addEventListener('click', function() {
          var idx = state.ambiance.indexOf(a.value);
          if (idx === -1) { state.ambiance.push(a.value); } else { state.ambiance.splice(idx, 1); }
          render();
        });
        ambianceGrid.appendChild(chip);
      });
      ambianceGroup.appendChild(ambianceGrid);
      moreBody.appendChild(ambianceGroup);

      // Intensity
      moreBody.appendChild(renderOptionGroup(
        tr('form.intensity', 'Intensite'),
        [
          { value: 'indifferent', label: tr('form.indifferent', 'Indifferent') },
          { value: 'sedentaire', label: tr('form.intensitySedentaire', 'Sedentaire') },
          { value: 'modere', label: tr('form.intensityModere', 'Modere') },
          { value: 'sportif', label: tr('form.intensitySportif', 'Sportif') }
        ],
        state.intensity,
        function(v) { state.intensity = v; render(); }
      ));

      // Duration
      moreBody.appendChild(renderOptionGroup(
        tr('form.duration', 'Duree'),
        [
          { value: 'indifferent', label: tr('form.durationIndifferent', 'Indifferent') },
          { value: '1h', label: tr('form.duration1h', '~ 1h') },
          { value: '2h', label: tr('form.duration2h', '~ 2h') },
          { value: 'halfday', label: tr('form.durationHalfDay', 'Demi-journee') },
          { value: 'fullday', label: tr('form.durationFullDay', 'Journee') }
        ],
        state.duration,
        function(v) { state.duration = v; render(); }
      ));

      // Environment
      moreBody.appendChild(renderOptionGroup(
        tr('form.environment', 'Environnement'),
        [
          { value: 'indifferent', label: tr('form.envIndifferent', 'Indifferent') },
          { value: 'indoor', label: tr('form.envIndoor', 'Interieur') },
          { value: 'outdoor', label: tr('form.envOutdoor', 'Exterieur') },
          { value: 'mixed', label: tr('form.envMixed', 'Mixte') }
        ],
        state.environment,
        function(v) { state.environment = v; render(); }
      ));

      // Setting
      moreBody.appendChild(renderOptionGroup(
        tr('form.setting', 'Cadre'),
        [
          { value: 'indifferent', label: tr('form.settingIndifferent', 'Indifferent') },
          { value: 'nature', label: tr('form.settingNature', 'Nature') },
          { value: 'urban', label: tr('form.settingUrban', 'Urbain') }
        ],
        state.setting,
        function(v) { state.setting = v; render(); }
      ));

      moreBlock.appendChild(moreBody);
    }
    form.appendChild(moreBlock);

    // Search button (centered)
    var searchWrap = el('div', 'text-center mt-6');
    var searchBtn = el('button', 'btn btn-cta py-4 text-lg inline-flex items-center justify-center gap-2 px-12');
    searchBtn.type = 'button';
    searchBtn.disabled = state.activityTypes.length === 0;
    if (state.activityTypes.length === 0) searchBtn.style.opacity = '0.5';
    searchBtn.innerHTML = ICONS.search + ' ' + esc(tr('form.search', 'Rechercher'));
    searchBtn.addEventListener('click', function() {
      if (state.activityTypes.length === 0) return;
      state.step = 'loading';
      state.error = null;
      state.results = [];
      render();
      // Scroll to keep the tool visible
      scrollToTool();
    });
    searchWrap.appendChild(searchBtn);
    form.appendChild(searchWrap);

    parent.appendChild(form);
  }

  // ── Option group (radio-like) ───────────────────────────────
  function renderOptionGroup(label, options, currentValue, onChange) {
    var group = el('div', 'space-y-2 mt-3');
    if (label) {
      var lbl = el('label', 'text-sm font-medium text-muted-foreground');
      lbl.textContent = label;
      group.appendChild(lbl);
    }
    var grid = el('div', 'flex flex-wrap gap-2');
    options.forEach(function(opt) {
      var isActive = opt.value === currentValue;
      var btn = el('button', 'option-card' + (isActive ? ' active' : ''));
      btn.type = 'button';
      btn.textContent = opt.label;
      btn.addEventListener('click', function() { onChange(opt.value); });
      grid.appendChild(btn);
    });
    group.appendChild(grid);
    return group;
  }

  // ── Step: Loading ───────────────────────────────────────────
  function renderLoading(parent) {
    var wrap = el('div', 'text-center py-16 space-y-6');

    var iconWrap = el('div', 'relative inline-block');
    var circle = el('div', 'w-24 h-24 rounded-full flex items-center justify-center mx-auto animate-pulse-soft');
    circle.style.cssText = 'background:hsl(var(--primary)/0.15);color:hsl(var(--primary));';
    circle.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-12 h-12"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>';
    iconWrap.appendChild(circle);
    wrap.appendChild(iconWrap);

    var title = el('h2', 'text-xl font-bold');
    title.textContent = tr('results.loading', 'Chargement des activites...');
    wrap.appendChild(title);

    var dots = el('div', 'flex justify-center gap-2 pt-4');
    for (var i = 0; i < 3; i++) {
      var dot = el('div', 'w-3 h-3 rounded-full');
      dot.style.cssText = 'background:hsl(var(--primary));animation:bounce 1s infinite;animation-delay:' + (i * 150) + 'ms;';
      dots.appendChild(dot);
    }
    wrap.appendChild(dots);

    parent.appendChild(wrap);
  }

  // ── API Call ────────────────────────────────────────────────
  function doSearch() {
    var radiusKm = RADIUS_STEPS[state.radiusIndex];
    var payload = {
      lat: state.lat,
      lng: state.lng,
      radius: radiusKm * 1000,
      activityTypes: state.activityTypes,
      intensity: state.intensity !== 'indifferent' ? state.intensity : undefined,
      ambiance: state.ambiance.length > 0 ? state.ambiance.join(',') : undefined,
      duration: state.duration !== 'indifferent' ? state.duration : undefined,
      environment: state.environment !== 'indifferent' ? state.environment : undefined,
      setting: state.setting !== 'indifferent' ? state.setting : undefined,
      novelty: state.novelty !== 'indifferent' ? state.novelty : undefined,
      budget: state.budget !== 'indifferent' ? state.budget : undefined,
      groupSize: state.groupSize,
      groupComposition: state.groupComposition,
      childrenAge: state.childrenAge,
      lang: lang
    };

    fetch(SUPABASE_URL + '/functions/v1/search-activities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'apikey': SUPABASE_KEY
      },
      body: JSON.stringify(payload)
    })
    .then(function(res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function(data) {
      if (data.error) {
        state.error = data.error;
        state.step = 'results';
        render();
        scrollToTool();
        return;
      }
      state.results = data.activities || [];
      state.weather = data.weather || null;
      state.meta = data.meta || null;
      state.step = 'results';
      render();
      // Scroll back to tool section so user sees results
      scrollToTool();
    })
    .catch(function(err) {
      state.error = err.message || tr('results.error', 'Une erreur est survenue');
      state.step = 'results';
      render();
      scrollToTool();
    });
  }

  // ── Step 3: Results ─────────────────────────────────────────
  function renderResults(parent) {
    // Error state
    if (state.error) {
      var errWrap = el('div', 'text-center py-12 space-y-4');
      var errIcon = el('div', 'w-16 h-16 rounded-full flex items-center justify-center mx-auto');
      errIcon.style.cssText = 'background:rgba(239,68,68,0.15);color:#ef4444;';
      errIcon.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-8 h-8"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
      errWrap.appendChild(errIcon);
      var errTitle = el('h3', 'text-lg font-bold');
      errTitle.textContent = tr('results.error', 'Une erreur est survenue');
      errWrap.appendChild(errTitle);
      var errMsg = el('p', 'text-sm text-muted-foreground');
      errMsg.textContent = state.error;
      errWrap.appendChild(errMsg);
      var retryBtn = el('button', 'btn btn-primary mt-4');
      retryBtn.type = 'button';
      retryBtn.textContent = tr('results.retry', 'Reessayer');
      retryBtn.addEventListener('click', function() {
        state.step = 'loading';
        state.error = null;
        render();
      });
      errWrap.appendChild(retryBtn);
      var modifyBtn = el('button', 'btn btn-outline mt-2');
      modifyBtn.type = 'button';
      modifyBtn.textContent = tr('form.modify', 'Modifier');
      modifyBtn.addEventListener('click', function() { state.step = 'filters'; render(); });
      errWrap.appendChild(modifyBtn);
      parent.appendChild(errWrap);
      return;
    }

    // Header row: weather + count + modify
    var headerRow = el('div', 'flex flex-wrap items-center justify-between gap-3 mb-4');

    // Weather badge
    if (state.weather) {
      var isNight = state.weather.isNight || false;
      var weatherBadge = el('div', 'flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted text-sm');
      weatherBadge.innerHTML = getWeatherIcon(state.weather.condition, isNight) +
        ' <span class="font-medium">' + esc(getWeatherLabel(state.weather.condition, isNight)) + '</span>' +
        ' <span class="text-muted-foreground">' + Math.round(state.weather.temp) + '\u00B0C</span>';
      headerRow.appendChild(weatherBadge);
    }

    // Count
    var countText = el('span', 'text-sm text-muted-foreground');
    if (state.results.length === 0) {
      countText.textContent = tr('results.noResults', 'Aucune activite trouvee');
    } else if (state.results.length === 1) {
      countText.textContent = tr('results.countSingular', '1 activite trouvee');
    } else {
      countText.textContent = tr('results.count', '{count} activites trouvees', { count: state.results.length });
    }
    headerRow.appendChild(countText);

    // Modify button
    var modBtn = el('button', 'btn btn-outline text-sm flex items-center gap-1');
    modBtn.type = 'button';
    modBtn.innerHTML = ICONS.filter + ' ' + esc(tr('form.modify', 'Modifier'));
    modBtn.addEventListener('click', function() { state.step = 'filters'; render(); });
    headerRow.appendChild(modBtn);
    parent.appendChild(headerRow);

    // Expanded radius notice with explanation
    if (state.meta && state.meta.expanded) {
      var noticeMsg = getExpandedMessage();
      var notice = el('div', 'text-sm p-3 rounded-lg bg-primary/10 text-primary mb-4');
      notice.textContent = noticeMsg;
      parent.appendChild(notice);
    }

    if (state.results.length === 0) {
      var noResults = el('div', 'text-center py-12');
      var noIcon = el('div', 'text-4xl mb-4');
      noIcon.textContent = '\uD83D\uDD0D';
      noResults.appendChild(noIcon);
      var noText = el('p', 'text-muted-foreground');
      noText.textContent = tr('results.noResults', 'Aucune activite trouvee');
      noResults.appendChild(noText);
      parent.appendChild(noResults);
      return;
    }

    // Sort bar
    var sortBar = el('div', 'flex items-center gap-2 mb-4');
    var sortLabel = el('span', 'text-sm text-muted-foreground');
    sortLabel.textContent = 'Tri :';
    sortBar.appendChild(sortLabel);

    var sorts = [
      { key: 'score', label: tr('results.sortScore', 'Pertinence') },
      { key: 'distance', label: tr('results.sortDistance', 'Distance') },
      { key: 'price', label: tr('results.sortPrice', 'Prix') }
    ];
    sorts.forEach(function(s) {
      var btn = el('button', 'activity-sort-btn' + (state.sortBy === s.key ? ' active' : ''));
      btn.type = 'button';
      btn.textContent = s.label;
      btn.addEventListener('click', function() {
        state.sortBy = s.key;
        sortResults();
        render();
      });
      sortBar.appendChild(btn);
    });

    // Surprise me button
    var surpriseBtn = el('button', 'activity-sort-btn ml-auto flex items-center gap-1');
    surpriseBtn.type = 'button';
    surpriseBtn.innerHTML = ICONS.shuffle + ' ' + esc(tr('results.surpriseMe', 'Surprenez-moi !'));
    surpriseBtn.addEventListener('click', function() {
      var top = state.results.slice(0, Math.min(10, state.results.length));
      var totalScore = top.reduce(function(sum, a) { return sum + a.score; }, 0);
      var random = Math.random() * totalScore;
      var running = 0;
      var picked = top[0];
      for (var i = 0; i < top.length; i++) {
        running += top[i].score;
        if (running >= random) { picked = top[i]; break; }
      }
      highlightActivity(picked.id);
    });
    sortBar.appendChild(surpriseBtn);
    parent.appendChild(sortBar);

    // Results layout: map left, cards right
    var layout = el('div', 'activities-results');

    // Map container (sticky on desktop)
    var mapWrap = el('div', 'activity-map');
    mapWrap.id = 'activities-map';
    layout.appendChild(mapWrap);

    // Cards scroll container: 2-col grid, scrollable on desktop, natural flow on mobile
    var cardsList = el('div', 'activity-cards-scroll');
    state.results.forEach(function(activity, index) {
      cardsList.appendChild(renderActivityCard(activity, index));
    });
    layout.appendChild(cardsList);

    parent.appendChild(layout);

    // Business promo link below the map
    var promoLink2 = el('p', 'text-center text-xs text-muted-foreground mt-4');
    promoLink2.innerHTML = tr('form.businessPromo', 'Entreprise : <a href="' + getContactUrl() + '" class="text-primary hover:underline">Contactez Quiz Couple pour promouvoir votre business ici !</a>');
    parent.appendChild(promoLink2);

    // Initialize map after DOM is ready
    setTimeout(function() { initMap(); }, 50);
  }

  // ── Expanded radius explanation ─────────────────────────────
  function getExpandedMessage() {
    // Check what filters are active and give a contextual explanation
    if (state.budget === 'free') {
      return tr('results.expandedBudgetFree', 'Les activites gratuites sont souvent peu referencees. On a elargi la zone.');
    }
    if (state.budget === 'small') {
      return tr('results.expandedBudgetSmall', 'Peu d\'activites a petit budget dans cette zone. On a elargi le rayon.');
    }
    if (state.activityTypes.length === 1) {
      return tr('results.expandedCategories', 'Ce type d\'activite est peu represente dans cette zone. On a elargi pour vous proposer des resultats.');
    }
    if (state.activityTypes.length <= 3 && state.budget !== 'indifferent') {
      return tr('results.expandedGeneric', 'La combinaison de vos filtres est assez restrictive dans cette zone. Essayez d\'assouplir un critere ou d\'elargir le rayon.');
    }
    return tr('results.expandedRadius', 'Peu d\'activites trouvees dans votre rayon — on a elargi la zone de recherche.');
  }

  // ── Activity card ───────────────────────────────────────────
  function renderActivityCard(activity, index) {
    var card = el('div', 'activity-card' + (index < 3 ? ' highlighted' : ''));
    card.setAttribute('data-id', activity.id);

    // Top row: category badge + score
    var topRow = el('div', 'flex items-center justify-between mb-2');

    var catInfo = getCategoryInfo(activity.category);
    var badge = el('span', 'cat-badge cat-' + catInfo.cssClass);
    badge.textContent = catInfo.emoji + ' ' + catInfo.label;
    topRow.appendChild(badge);

    // Score badge
    var scoreClass = activity.score >= 70 ? 'score-high' : activity.score >= 40 ? 'score-medium' : 'score-low';
    var scoreBadge = el('span', 'score-badge ' + scoreClass);
    scoreBadge.textContent = activity.score + '/100';
    topRow.appendChild(scoreBadge);
    card.appendChild(topRow);

    // Name
    var name = el('h3', 'font-bold text-base mb-1');
    name.textContent = activity.name;
    card.appendChild(name);

    // Meta row: distance + price + weather
    var metaRow = el('div', 'flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-2');

    // Distance
    var distSpan = el('span', 'flex items-center gap-1');
    distSpan.innerHTML = ICONS.navigation + ' ' + formatDistance(activity.distance);
    metaRow.appendChild(distSpan);

    // Price
    var priceSpan = el('span', 'flex items-center gap-1');
    if (activity.priceRange[0] === 0 && activity.priceRange[1] === 0) {
      priceSpan.textContent = tr('results.priceFree', 'Gratuit');
      priceSpan.style.color = '#22c55e';
    } else {
      priceSpan.textContent = activity.priceRange[0] + '-' + activity.priceRange[1] + '\u20AC';
    }
    metaRow.appendChild(priceSpan);

    // Weather compat
    if (state.weather) {
      var weatherSpan = el('span', 'flex items-center gap-1');
      if (activity.weatherCompat >= 0.7) {
        weatherSpan.innerHTML = ICONS.sun;
        weatherSpan.style.color = '#22c55e';
        weatherSpan.title = tr('results.weatherOk', 'Meteo favorable');
      } else if (activity.weatherCompat >= 0.4) {
        weatherSpan.innerHTML = ICONS.cloud;
        weatherSpan.style.color = '#f59e0b';
      } else {
        weatherSpan.innerHTML = ICONS.droplet;
        weatherSpan.style.color = '#ef4444';
        weatherSpan.title = tr('results.weatherWarning', 'Attention meteo');
      }
      metaRow.appendChild(weatherSpan);
    }

    card.appendChild(metaRow);

    // Address
    if (activity.address) {
      var addrText = el('p', 'text-xs text-muted-foreground mb-2 truncate');
      addrText.textContent = activity.address;
      card.appendChild(addrText);
    }

    // Top badge
    if (index < 3) {
      var topBadge = el('span', 'inline-block text-xs px-2 py-0.5 rounded-full font-medium mb-2');
      topBadge.style.cssText = 'background:hsl(var(--primary)/0.15);color:hsl(var(--primary));';
      topBadge.textContent = index === 0 ? '\u2B50 ' + tr('results.recommended', 'Recommande') : '\u2728 Top ' + (index + 1);
      card.appendChild(topBadge);
    }

    // Action buttons
    var actions = el('div', 'flex flex-wrap gap-2 mt-2');

    // Directions
    var dirBtn = el('a', 'btn btn-outline text-xs flex items-center gap-1');
    dirBtn.href = 'https://www.openstreetmap.org/directions?from=' + state.lat + ',' + state.lng + '&to=' + activity.lat + ',' + activity.lng;
    dirBtn.target = '_blank';
    dirBtn.rel = 'noopener';
    dirBtn.innerHTML = ICONS.navigation + ' ' + esc(tr('results.directions', 'Itineraire'));
    actions.appendChild(dirBtn);

    // Website
    if (activity.website) {
      var webBtn = el('a', 'btn btn-outline text-xs flex items-center gap-1');
      webBtn.href = activity.website;
      webBtn.target = '_blank';
      webBtn.rel = 'noopener';
      webBtn.innerHTML = ICONS.globe + ' ' + esc(tr('results.website', 'Site web'));
      actions.appendChild(webBtn);
    }

    // Phone
    if (activity.phone) {
      var phoneBtn = el('a', 'btn btn-outline text-xs flex items-center gap-1');
      phoneBtn.href = 'tel:' + activity.phone;
      phoneBtn.innerHTML = ICONS.phone + ' ' + esc(activity.phone);
      actions.appendChild(phoneBtn);
    }

    card.appendChild(actions);

    // Click to highlight on map
    card.addEventListener('click', function(e) {
      if (e.target.tagName === 'A') return;
      highlightActivity(activity.id);
    });

    return card;
  }

  // ── Map ─────────────────────────────────────────────────────
  function initMap() {
    if (typeof L === 'undefined') return;

    var mapEl = document.getElementById('activities-map');
    if (!mapEl) return;

    // Clean up previous map
    if (state.map) {
      state.map.remove();
      state.map = null;
    }

    state.map = L.map('activities-map', { zoomControl: true, scrollWheelZoom: true });

    // Tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18
    }).addTo(state.map);

    // User position marker
    var userIcon = L.divIcon({
      html: '<div style="width:16px;height:16px;border-radius:50%;background:hsl(var(--primary));border:3px solid white;box-shadow:0 0 6px rgba(0,0,0,0.3);"></div>',
      iconSize: [16, 16],
      className: ''
    });
    L.marker([state.lat, state.lng], { icon: userIcon, zIndexOffset: 1000 })
      .addTo(state.map)
      .bindPopup('<b>' + esc(state.address || 'Vous') + '</b>');

    // Radius circle
    var radiusKm = RADIUS_STEPS[state.radiusIndex];
    state.radiusCircle = L.circle([state.lat, state.lng], {
      radius: radiusKm * 1000,
      color: 'hsl(var(--primary))',
      fillColor: 'hsl(var(--primary))',
      fillOpacity: 0.05,
      weight: 1.5,
      dashArray: '5,5'
    }).addTo(state.map);

    // Activity markers
    state.markersLayer = L.featureGroup();
    var bounds = L.latLngBounds([[state.lat, state.lng]]);

    state.results.forEach(function(activity, index) {
      var catInfo = getCategoryInfo(activity.category);
      var markerIcon = L.divIcon({
        html: '<div style="width:28px;height:28px;border-radius:50%;background:' + catInfo.color +
          ';display:flex;align-items:center;justify-content:center;font-size:14px;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);cursor:pointer;">' +
          catInfo.emoji + '</div>',
        iconSize: [28, 28],
        className: ''
      });

      var marker = L.marker([activity.lat, activity.lng], { icon: markerIcon });

      var popupContent = '<div style="min-width:180px;">' +
        '<b>' + esc(activity.name) + '</b><br>' +
        '<span style="color:' + catInfo.color + ';font-size:12px;">' + catInfo.emoji + ' ' + esc(catInfo.label) + '</span><br>' +
        '<span style="font-size:12px;color:#666;">' + formatDistance(activity.distance) + '</span>' +
        (activity.priceRange[0] === 0 && activity.priceRange[1] === 0
          ? '<br><span style="color:#22c55e;font-size:12px;">' + esc(tr('results.priceFree', 'Gratuit')) + '</span>'
          : '<br><span style="font-size:12px;">' + activity.priceRange[0] + '-' + activity.priceRange[1] + '\u20AC</span>') +
        '<br><span style="font-weight:600;font-size:13px;">Score: ' + activity.score + '/100</span>' +
        '<br><a href="https://www.openstreetmap.org/directions?from=' + state.lat + ',' + state.lng +
        '&to=' + activity.lat + ',' + activity.lng +
        '" target="_blank" rel="noopener" style="font-size:12px;">' + esc(tr('results.directions', 'Itineraire')) + '</a>' +
        '</div>';

      marker.bindPopup(popupContent);
      marker._activityId = activity.id;
      state.markersLayer.addLayer(marker);
      bounds.extend([activity.lat, activity.lng]);
    });

    state.markersLayer.addTo(state.map);

    // Fit bounds
    if (state.results.length > 0) {
      state.map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    } else {
      state.map.setView([state.lat, state.lng], 12);
    }
  }

  function highlightActivity(id) {
    // On mobile, scroll to map first so user sees the popup
    var isMobile = window.innerWidth < 768;
    var mapEl = document.getElementById('activities-map');

    if (isMobile && mapEl) {
      mapEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Highlight card visually
    var card = container.querySelector('.activity-card[data-id="' + id + '"]');
    if (card) {
      if (!isMobile) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      card.style.boxShadow = '0 0 0 3px hsl(var(--primary))';
      setTimeout(function() { card.style.boxShadow = ''; }, 2000);
    }

    // Open popup on map
    if (state.markersLayer) {
      state.markersLayer.eachLayer(function(marker) {
        if (marker._activityId === id) {
          marker.openPopup();
          if (state.map) state.map.panTo(marker.getLatLng());
        }
      });
    }
  }

  // ── Sort ────────────────────────────────────────────────────
  function sortResults() {
    switch (state.sortBy) {
      case 'score':
        state.results.sort(function(a, b) { return b.score - a.score; });
        break;
      case 'distance':
        state.results.sort(function(a, b) { return a.distance - b.distance; });
        break;
      case 'price':
        state.results.sort(function(a, b) {
          var avgA = (a.priceRange[0] + a.priceRange[1]) / 2;
          var avgB = (b.priceRange[0] + b.priceRange[1]) / 2;
          return avgA - avgB;
        });
        break;
    }
  }

  // ── Helpers ─────────────────────────────────────────────────
  function el(tag, className) {
    var e = document.createElement(tag);
    if (className) e.className = className;
    return e;
  }

  function esc(str) {
    var d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
  }

  function getContactUrl() {
    var contactSlugs = { fr: '/contact/', en: '/en/contact/', es: '/es/contacto/', de: '/de/kontakt/', it: '/it/contatto/' };
    return contactSlugs[lang] || '/contact/';
  }

  function formatDistance(km) {
    if (km < 1) return Math.round(km * 1000) + ' m';
    return km.toFixed(1) + ' km';
  }

  function getCategoryInfo(category) {
    var cat = CATEGORIES.filter(function(c) { return c.id === category; })[0];
    if (cat) {
      return {
        emoji: cat.emoji,
        color: cat.color,
        label: tr('categories.' + cat.tKey, category),
        cssClass: cat.tKey
      };
    }
    return { emoji: '\uD83D\uDCCD', color: '#6b7280', label: category, cssClass: 'other' };
  }

  function getWeatherIcon(condition, isNight) {
    if (isNight && condition === 'nuageux') {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>';
    }
    switch (condition) {
      case 'soleil': return ICONS.sun;
      case 'nuageux': return ICONS.cloud;
      case 'pluie_legere':
      case 'pluie_forte': return ICONS.droplet;
      case 'neige': return ICONS.cloud;
      case 'canicule': return ICONS.thermometer;
      default: return ICONS.sun;
    }
  }

  function getWeatherLabel(condition, isNight) {
    if (isNight && condition === 'nuageux') {
      return tr('weather.clearNight', 'Nuit claire');
    }
    var map = {
      soleil: 'weather.sun',
      nuageux: 'weather.cloudy',
      pluie_legere: 'weather.lightRain',
      pluie_forte: 'weather.heavyRain',
      neige: 'weather.snow',
      canicule: 'weather.heatwave'
    };
    return tr(map[condition] || 'weather.sun', condition);
  }

})();
