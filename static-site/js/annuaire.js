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
          '<br><a href="/professionnel/' + pro.slug + '/" style="color:hsl(340,65%,55%);font-size:12px;font-weight:500;margin-top:6px;display:inline-block;">Voir le profil →</a>' +
          '</div>'
        );
    });
  }

  // ── Hero Search Form ──────────────────────────────────────────────
  var heroForm = document.getElementById('hero-search-form');
  if (heroForm) {
    heroForm.addEventListener('submit', function (e) {
      // For now, just prevent and log (search page not yet built)
      e.preventDefault();
      var q = heroForm.querySelector('input[name="q"]');
      var city = heroForm.querySelector('input[name="city"]');
      // In future: redirect to /recherche/?q=...&city=...
      if (q && q.value) {
        window.location.href = '/recherche/?q=' + encodeURIComponent(q.value) + (city && city.value ? '&city=' + encodeURIComponent(city.value) : '');
      }
    });
  }
})();
