/**
 * Annuaire Quiz Couple — Client-side JavaScript
 * Handles: dropdowns, mobile menu, theme toggle, map, FAQ, animations
 */
(function () {
  'use strict';

  // ── Theme Toggle ──────────────────────────────────────────────────
  const themeBtn = document.getElementById('ann-theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      const isDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('annuaire-theme', isDark ? 'dark' : 'light');
    });
  }

  // ── Mobile Menu ───────────────────────────────────────────────────
  const mobileBtn = document.getElementById('ann-mobile-btn');
  const mobileMenu = document.getElementById('ann-mobile-menu');
  if (mobileBtn && mobileMenu) {
    const menuIcon = mobileBtn.querySelector('.ann-menu-icon');
    const closeIcon = mobileBtn.querySelector('.ann-close-icon');

    mobileBtn.addEventListener('click', function () {
      const isOpen = !mobileMenu.classList.contains('hidden');
      mobileMenu.classList.toggle('hidden');
      mobileBtn.setAttribute('aria-expanded', String(!isOpen));
      if (menuIcon) menuIcon.classList.toggle('hidden');
      if (closeIcon) closeIcon.classList.toggle('hidden');
    });

    // Close on link click
    mobileMenu.querySelectorAll('a:not([data-accordion-trigger])').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileMenu.classList.add('hidden');
        mobileBtn.setAttribute('aria-expanded', 'false');
        if (menuIcon) { menuIcon.classList.remove('hidden'); }
        if (closeIcon) { closeIcon.classList.add('hidden'); }
      });
    });
  }

  // ── Mobile Accordions ─────────────────────────────────────────────
  document.querySelectorAll('[data-accordion]').forEach(function (accordion) {
    var trigger = accordion.querySelector('[data-accordion-trigger]');
    var content = accordion.querySelector('[data-accordion-content]');
    if (!trigger || !content) return;

    trigger.addEventListener('click', function () {
      var isOpen = !content.classList.contains('hidden');
      content.classList.toggle('hidden');
      accordion.classList.toggle('open');
      trigger.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  // ── Desktop Dropdowns ─────────────────────────────────────────────
  document.querySelectorAll('[data-dropdown]').forEach(function (dropdown) {
    var trigger = dropdown.querySelector('[data-dropdown-trigger]');
    var menu = dropdown.querySelector('[data-dropdown-menu]');
    if (!trigger || !menu) return;

    var closeTimeout;

    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = dropdown.classList.contains('open');

      // Close all other dropdowns
      document.querySelectorAll('[data-dropdown].open').forEach(function (d) {
        if (d !== dropdown) d.classList.remove('open');
      });

      dropdown.classList.toggle('open');
      trigger.setAttribute('aria-expanded', String(!isOpen));
    });

    dropdown.addEventListener('mouseenter', function () {
      clearTimeout(closeTimeout);
    });

    dropdown.addEventListener('mouseleave', function () {
      closeTimeout = setTimeout(function () {
        dropdown.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
      }, 150);
    });
  });

  // Close dropdowns on outside click
  document.addEventListener('click', function () {
    document.querySelectorAll('[data-dropdown].open').forEach(function (d) {
      d.classList.remove('open');
      var t = d.querySelector('[data-dropdown-trigger]');
      if (t) t.setAttribute('aria-expanded', 'false');
    });
  });

  // ── FAQ Accordions ────────────────────────────────────────────────
  document.querySelectorAll('[data-faq]').forEach(function (faq) {
    var trigger = faq.querySelector('[data-faq-trigger]');
    var answer = faq.querySelector('.ann-faq-answer');
    if (!trigger || !answer) return;

    trigger.addEventListener('click', function () {
      var isOpen = faq.classList.contains('open');

      // Optional: close others
      document.querySelectorAll('[data-faq].open').forEach(function (f) {
        if (f !== faq) {
          f.classList.remove('open');
          var a = f.querySelector('.ann-faq-answer');
          if (a) a.classList.add('hidden');
        }
      });

      faq.classList.toggle('open');
      answer.classList.toggle('hidden');
    });
  });

  // ── Intersection Observer (animate on scroll) ─────────────────────
  if ('IntersectionObserver' in window) {
    var animObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          animObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.ann-animate-fade-in-up').forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(16px)';
      el.style.transition = 'opacity 500ms ease-out, transform 500ms ease-out';
      animObserver.observe(el);
    });
  }

  // ── Leaflet Map ───────────────────────────────────────────────────
  var mapEl = document.getElementById('ann-map');
  if (mapEl && typeof L !== 'undefined') {
    initMap(mapEl);
  } else if (mapEl) {
    // Wait for Leaflet to load
    window.addEventListener('load', function () {
      if (typeof L !== 'undefined') initMap(mapEl);
    });
  }

  function initMap(container) {
    try {
      var professionals = JSON.parse(container.getAttribute('data-professionals') || '[]');
      var specialties = JSON.parse(container.getAttribute('data-specialties') || '[]');
    } catch (e) {
      return;
    }

    if (!professionals.length) return;

    var map = L.map(container, {
      scrollWheelZoom: false,
      zoomControl: true,
    }).setView([46.603354, 1.888334], 6); // Center of France

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    var specMap = {};
    specialties.forEach(function (s) { specMap[s.id] = s; });

    professionals.forEach(function (pro) {
      var spec = specMap[pro.specialty] || {};
      var color = spec.color || '#E84393';

      var icon = L.divIcon({
        className: 'ann-map-marker',
        html: '<div style="width:28px;height:28px;border-radius:50%;background:' + color + ';border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center;">' +
              '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>' +
              '</div>',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      L.marker([pro.lat, pro.lng], { icon: icon })
        .addTo(map)
        .bindPopup(
          '<div style="font-family:Inter,sans-serif;min-width:180px;">' +
          '<strong style="font-size:14px;">' + pro.name + '</strong><br>' +
          '<span style="color:' + color + ';font-size:12px;font-weight:500;">' + (spec.name || '') + '</span>' +
          (pro.premium ? '<span style="display:inline-block;margin-left:6px;background:#FFF3CD;color:#856404;font-size:10px;padding:1px 6px;border-radius:10px;font-weight:600;">Premium</span>' : '') +
          '<br><a href="/' + pro.specialty + '/' + pro.city + '/' + pro.slug + '/" style="color:hsl(340,65%,55%);font-size:12px;font-weight:500;margin-top:6px;display:inline-block;">Voir le profil →</a>' +
          '</div>'
        );
    });
  }

  // ── Search Autocomplete ──────────────────────────────────────────
  var searchData = window.__ANN_SEARCH__ || { specialties: [], cities: [] };

  function normalize(str) {
    return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function createDropdown(input, type) {
    var dropdown = document.createElement('div');
    dropdown.className = 'ann-search-dropdown';
    dropdown.style.cssText = 'display:none;position:absolute;top:100%;left:0;right:0;z-index:100;background:hsl(var(--ann-bg));border:1px solid hsl(var(--ann-border));border-radius:0.5rem;box-shadow:var(--ann-shadow-md,0 4px 16px rgba(0,0,0,0.08));max-height:16rem;overflow-y:auto;margin-top:0.25rem;';
    var wrapper = input.closest('.ann-search-field') || input.closest('.ann-search-compact') || input.closest('.ann-mobile-search');
    if (wrapper) {
      wrapper.style.position = 'relative';
      wrapper.appendChild(dropdown);
    }

    var items = type === 'city' ? searchData.cities : searchData.specialties;

    input.addEventListener('input', function () {
      var val = normalize(input.value.trim());
      if (val.length < 1) { dropdown.style.display = 'none'; return; }

      var matches = items.filter(function (item) {
        var name = normalize(item.name);
        var short = item.shortName ? normalize(item.shortName) : '';
        var dept = item.department || '';
        return name.indexOf(val) !== -1 || short.indexOf(val) !== -1 || dept.indexOf(val) !== -1;
      }).slice(0, 6);

      if (!matches.length) { dropdown.style.display = 'none'; return; }

      dropdown.innerHTML = '';
      matches.forEach(function (item) {
        var a = document.createElement('a');
        a.href = '/' + item.id + '/';
        a.style.cssText = 'display:flex;align-items:center;gap:0.5rem;padding:0.625rem 0.75rem;color:hsl(var(--ann-fg));text-decoration:none;font-size:0.875rem;transition:background 150ms;';
        a.innerHTML = (type === 'city'
          ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:1rem;height:1rem;flex-shrink:0;color:hsl(var(--ann-muted-fg))"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>'
          : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:1rem;height:1rem;flex-shrink:0;color:hsl(var(--ann-muted-fg))"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>')
          + '<span>' + item.name + (item.department ? ' <span style="color:hsl(var(--ann-muted-fg))">(' + item.department + ')</span>' : '') + '</span>';
        a.addEventListener('mouseenter', function () { a.style.background = 'hsl(var(--ann-muted) / 0.5)'; });
        a.addEventListener('mouseleave', function () { a.style.background = 'none'; });
        dropdown.appendChild(a);
      });
      dropdown.style.display = 'block';
    });

    input.addEventListener('blur', function () {
      setTimeout(function () { dropdown.style.display = 'none'; }, 200);
    });
    input.addEventListener('focus', function () {
      if (input.value.trim().length >= 1) input.dispatchEvent(new Event('input'));
    });

    return dropdown;
  }

  // Hero search
  var heroForm = document.getElementById('hero-search-form');
  if (heroForm) {
    var heroQ = heroForm.querySelector('input[name="q"]');
    var heroCity = heroForm.querySelector('input[name="city"]');
    if (heroQ) createDropdown(heroQ, 'specialty');
    if (heroCity) createDropdown(heroCity, 'city');

    heroForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var qVal = normalize((heroQ && heroQ.value) || '');
      var cityVal = normalize((heroCity && heroCity.value) || '');

      // Try to match city first
      if (cityVal) {
        var cityMatch = searchData.cities.find(function (c) { return normalize(c.name) === cityVal || c.department === heroCity.value.trim(); });
        if (cityMatch) { window.location.href = '/' + cityMatch.id + '/'; return; }
      }
      // Then specialty
      if (qVal) {
        var specMatch = searchData.specialties.find(function (s) { return normalize(s.name).indexOf(qVal) !== -1 || (s.shortName && normalize(s.shortName).indexOf(qVal) !== -1); });
        if (specMatch) { window.location.href = '/' + specMatch.id + '/'; return; }
      }
      // Fallback: go to first city or specialty that partially matches
      var anyCity = cityVal && searchData.cities.find(function (c) { return normalize(c.name).indexOf(cityVal) !== -1; });
      if (anyCity) { window.location.href = '/' + anyCity.id + '/'; return; }
      var anySpec = qVal && searchData.specialties.find(function (s) { return normalize(s.name).indexOf(qVal) !== -1; });
      if (anySpec) { window.location.href = '/' + anySpec.id + '/'; return; }
    });
  }

  // Nav search inputs
  ['nav-search-input', 'mobile-search-input'].forEach(function (id) {
    var input = document.getElementById(id);
    if (!input) return;
    // Combined search: match both specialties and cities
    var dropdown = document.createElement('div');
    dropdown.className = 'ann-search-dropdown';
    dropdown.style.cssText = 'display:none;position:absolute;top:100%;left:0;right:0;z-index:100;background:hsl(var(--ann-bg));border:1px solid hsl(var(--ann-border));border-radius:0.5rem;box-shadow:var(--ann-shadow-md,0 4px 16px rgba(0,0,0,0.08));max-height:16rem;overflow-y:auto;margin-top:0.25rem;';
    var wrapper = input.closest('.ann-search-compact') || input.closest('.ann-mobile-search');
    if (wrapper) { wrapper.style.position = 'relative'; wrapper.appendChild(dropdown); }

    input.addEventListener('input', function () {
      var val = normalize(input.value.trim());
      if (val.length < 1) { dropdown.style.display = 'none'; return; }

      var specMatches = searchData.specialties.filter(function (s) { return normalize(s.name).indexOf(val) !== -1 || (s.shortName && normalize(s.shortName).indexOf(val) !== -1); }).slice(0, 3);
      var cityMatches = searchData.cities.filter(function (c) { return normalize(c.name).indexOf(val) !== -1 || (c.department && c.department.indexOf(val) !== -1); }).slice(0, 4);

      if (!specMatches.length && !cityMatches.length) { dropdown.style.display = 'none'; return; }

      dropdown.innerHTML = '';
      function addItem(item, icon, suffix) {
        var a = document.createElement('a');
        a.href = '/' + item.id + '/';
        a.style.cssText = 'display:flex;align-items:center;gap:0.5rem;padding:0.625rem 0.75rem;color:hsl(var(--ann-fg));text-decoration:none;font-size:0.875rem;transition:background 150ms;';
        a.innerHTML = icon + '<span>' + item.name + (suffix || '') + '</span>';
        a.addEventListener('mouseenter', function () { a.style.background = 'hsl(var(--ann-muted) / 0.5)'; });
        a.addEventListener('mouseleave', function () { a.style.background = 'none'; });
        dropdown.appendChild(a);
      }

      var specIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:1rem;height:1rem;flex-shrink:0;color:hsl(var(--ann-muted-fg))"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>';
      var cityIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:1rem;height:1rem;flex-shrink:0;color:hsl(var(--ann-muted-fg))"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>';

      specMatches.forEach(function (s) { addItem(s, specIcon, ''); });
      cityMatches.forEach(function (c) { addItem(c, cityIcon, ' <span style="color:hsl(var(--ann-muted-fg))">(' + c.department + ')</span>'); });

      dropdown.style.display = 'block';
    });

    input.addEventListener('blur', function () { setTimeout(function () { dropdown.style.display = 'none'; }, 200); });
    input.addEventListener('focus', function () { if (input.value.trim().length >= 1) input.dispatchEvent(new Event('input')); });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        var first = dropdown.querySelector('a');
        if (first) window.location.href = first.href;
      }
    });
  });

  // ── Login/Profile Button (auth-aware) ──────────────────────────
  (function () {
    var btns = document.querySelectorAll('.ann-login-btn');
    if (!btns.length) return;

    // Check Supabase auth token in localStorage
    var authKey = 'sb-lojvajnnvhatfplevyvy-auth-token';
    var raw = localStorage.getItem(authKey);
    if (!raw) return;

    try {
      var data = JSON.parse(raw);
      if (!data || !data.access_token) return;
    } catch (e) { return; }

    // User is logged in — swap to "Voir ma fiche"
    btns.forEach(function (btn) {
      // Update icon to user profile icon
      var svg = btn.querySelector('svg');
      if (svg) {
        svg.innerHTML = '<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>';
      }
      // Update text
      var span = btn.querySelector('span');
      if (span) {
        span.textContent = 'Voir ma fiche';
      } else {
        // Mobile version (text node)
        var textNodes = [];
        btn.childNodes.forEach(function (n) {
          if (n.nodeType === 3 && n.textContent.trim()) textNodes.push(n);
        });
        if (textNodes.length) textNodes[0].textContent = ' Voir ma fiche';
      }

      // Swap outline style for a subtle highlight
      btn.classList.remove('ann-btn-outline');
      btn.classList.add('ann-btn-secondary');
    });
  })();

  // ── City Carousel (specialty pages) ─────────────────────────────
  var track = document.getElementById('city-carousel-track');
  if (track) {
    var cards = track.querySelectorAll('.ann-city-carousel-card');
    var prevBtn = document.querySelector('[data-carousel-prev]');
    var nextBtn = document.querySelector('[data-carousel-next]');
    var offset = 0;

    function getVisibleCount() {
      var w = window.innerWidth;
      if (w <= 480) return 1;
      if (w <= 768) return 2;
      if (w <= 1024) return 3;
      return 4;
    }

    function getCardWidth() {
      if (!cards.length) return 0;
      var card = cards[0];
      var style = getComputedStyle(track);
      var gap = parseFloat(style.gap) || 16;
      return card.offsetWidth + gap;
    }

    function slide(dir) {
      var visible = getVisibleCount();
      var visibleCards = Array.prototype.filter.call(cards, function (c) { return c.style.display !== 'none'; });
      var maxOffset = Math.max(0, visibleCards.length - visible);
      offset = Math.max(0, Math.min(offset + dir, maxOffset));
      track.style.transform = 'translateX(-' + (offset * getCardWidth()) + 'px)';
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { slide(-1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { slide(1); });
  }

  // ── City Filter (specialty pages) ───────────────────────────────
  var cityFilterInput = document.getElementById('city-filter-input');
  var noResultsMsg = document.getElementById('city-no-results');
  if (cityFilterInput && track) {
    cityFilterInput.addEventListener('input', function () {
      var val = normalize(cityFilterInput.value.trim());
      var anyVisible = false;
      offset = 0;
      track.style.transform = 'translateX(0)';

      cards.forEach(function (card) {
        var name = card.getAttribute('data-city-name') || '';
        if (!val || name.indexOf(val) !== -1) {
          card.style.display = '';
          anyVisible = true;
        } else {
          card.style.display = 'none';
        }
      });

      if (noResultsMsg) {
        noResultsMsg.classList.toggle('hidden', anyVisible);
      }
    });
  }
})();
