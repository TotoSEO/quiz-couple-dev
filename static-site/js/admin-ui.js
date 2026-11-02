/**
 * L'interface du tableau de bord (2 novembre 2026) : le thème clair ou
 * sombre, le tiroir du menu sur téléphone et tablette, et les bulles d'aide
 * ouvertes par les « ? ». Rien ici ne lit la base : admin.js, admin-reseaux.js
 * et admin-affiliation.js gardent tout le travail sur les données. La page ne
 * charge pas theme.js : ce script tient le même rôle, avec la même clé
 * localStorage « theme » que le site, pour les boutons [data-theme-toggle].
 */
(function () {
  'use strict';
  var app = document.getElementById('admin-app');
  if (!app) return;
  var html = document.documentElement;

  // ── Thème ──────────────────────────────────────────────────────────────
  function poseTheme(sombre) {
    html.classList.toggle('dark', sombre);
    try { localStorage.setItem('theme', sombre ? 'dark' : 'light'); } catch (e) { /* stockage fermé */ }
    // admin.js observe la classe du <html> et redessine les courbes avec les
    // couleurs du nouveau thème : rien d'autre à faire ici.
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-theme-toggle]'), function (b) {
    b.addEventListener('click', function () { poseTheme(!html.classList.contains('dark')); });
  });

  // ── Le tiroir du menu ──────────────────────────────────────────────────
  var coquille = document.getElementById('admin-dashboard');
  var bouton = document.getElementById('adm-menu');
  var voile = document.getElementById('adm-voile');
  var large = window.matchMedia ? window.matchMedia('(min-width: 961px)') : null;
  function menu(ouvert) {
    if (!coquille || !bouton) return;
    coquille.classList.toggle('est-ouvert', ouvert);
    bouton.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
    bouton.setAttribute('aria-label', ouvert ? 'Fermer le menu' : 'Ouvrir le menu');
    if (voile) voile.hidden = !ouvert;
    document.body.style.overflow = ouvert ? 'hidden' : '';
  }
  if (bouton) bouton.addEventListener('click', function () { menu(!coquille.classList.contains('est-ouvert')); });
  if (voile) voile.addEventListener('click', function () { menu(false); });
  Array.prototype.forEach.call(document.querySelectorAll('.adm-nav .admin-tab'), function (b) {
    b.addEventListener('click', function () { if (!large || !large.matches) menu(false); });
  });
  if (large && large.addEventListener) large.addEventListener('change', function (e) { if (e.matches) menu(false); });

  // ── Les bulles d'aide ──────────────────────────────────────────────────
  // Chaque « ? » (.adm-aide-btn) ouvre la bulle (.adm-bulle) qui le suit.
  // Avec l'API Popover, la bulle vit dans la couche du dessus et se ferme
  // toute seule au clic ailleurs ; sinon on fait la même chose à la main.
  var avecPopover = typeof HTMLElement !== 'undefined' && 'popover' in HTMLElement.prototype;
  var ouvertes = [];
  var n = 0;
  function place(btn, bulle) {
    var marge = 12;
    var r = btn.getBoundingClientRect();
    bulle.style.maxWidth = Math.min(352, window.innerWidth - 2 * marge) + 'px';
    var w = bulle.offsetWidth, h = bulle.offsetHeight;
    var left = Math.round(Math.min(Math.max(marge, r.left + r.width / 2 - w / 2), window.innerWidth - marge - w));
    var top = Math.round(r.bottom + 8);
    if (top + h > window.innerHeight - marge && r.top - 8 - h >= marge) top = Math.round(r.top - 8 - h);
    bulle.style.left = left + 'px';
    bulle.style.top = top + 'px';
  }
  function ferme(bulle) {
    var btn = bulle._bouton;
    if (avecPopover) { try { if (bulle.matches(':popover-open')) bulle.hidePopover(); } catch (e) { /* déjà fermée */ } }
    else bulle.hidden = true;
    if (btn) btn.setAttribute('aria-expanded', 'false');
    ouvertes = ouvertes.filter(function (b) { return b !== bulle; });
  }
  function fermeToutes() { ouvertes.slice().forEach(ferme); }
  function ouvre(btn, bulle) {
    fermeToutes();
    if (avecPopover) { try { bulle.showPopover(); } catch (e) { return; } }
    else bulle.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    ouvertes.push(bulle);
    place(btn, bulle);
  }
  Array.prototype.forEach.call(document.querySelectorAll('.adm-aide'), function (wrap) {
    var btn = wrap.querySelector('.adm-aide-btn');
    var bulle = wrap.querySelector('.adm-bulle');
    if (!btn || !bulle) return;
    var id = 'adm-bulle-' + (++n);
    bulle.id = id;
    bulle._bouton = btn;
    btn.setAttribute('aria-controls', id);
    if (avecPopover) {
      bulle.removeAttribute('hidden');
      bulle.setAttribute('popover', 'manual');
    }
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var estOuverte = ouvertes.indexOf(bulle) !== -1;
      if (estOuverte) ferme(bulle); else ouvre(btn, bulle);
    });
    bulle.addEventListener('click', function (e) { e.stopPropagation(); });
  });
  document.addEventListener('click', function () { if (ouvertes.length) fermeToutes(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (ouvertes.length) { var derniere = ouvertes[ouvertes.length - 1]; var btn = derniere._bouton; fermeToutes(); if (btn) btn.focus(); }
      else if (coquille && coquille.classList.contains('est-ouvert')) menu(false);
    }
  });
  // Au défilement ou au redimensionnement, la bulle suit son bouton.
  function replace() { ouvertes.forEach(function (b) { if (b._bouton) place(b._bouton, b); }); }
  window.addEventListener('scroll', replace, true);
  window.addEventListener('resize', replace);
})();
