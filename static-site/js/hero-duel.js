/* Démo du hero d'accueil : deux joueurs, une question, la jauge qui monte
   quand les réponses se ressemblent. Le script ne porte aucun texte, tout est
   dans le HTML : il déroule la scène, incline la carte sous la souris, déplace
   les pastilles en parallaxe et lance les cœurs. Il s'arrête quand la scène
   sort de l'écran ou que l'onglet passe en arrière-plan, et se contente d'un
   état fixe si l'utilisateur a demandé moins de mouvement. */
(function () {
  'use strict';
  var scene = document.getElementById('hero-duel');
  if (!scene) return;
  var carte = scene.querySelector('.duel-carte');
  var pile = scene.querySelector('.duel-manches');
  var manches = [].slice.call(scene.querySelectorAll('.duel-manche'));
  var fin = scene.querySelector('.duel-manche--fin');
  var jeu = manches.filter(function (m) { return m !== fin; });
  var arc = scene.querySelector('.duel-jauge-arc');
  var nb = scene.querySelector('.duel-jauge-nb b');
  var coeurs = scene.querySelector('.duel-coeurs');
  var orbes = [].slice.call(scene.querySelectorAll('.duel-orbe'));
  if (!carte || !pile || !jeu.length) return;

  var CIRC = 2 * Math.PI * 27;
  if (arc) { arc.style.strokeDasharray = CIRC; arc.style.strokeDashoffset = CIRC; }
  function jauge(p) {
    if (arc) arc.style.strokeDashoffset = CIRC * (1 - p / 100);
    if (nb) nb.textContent = Math.round(p);
  }
  function classes(m, retire) {
    retire.forEach(function (c) { m.classList.remove(c); });
  }

  var reduit = false;
  try { reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  if (reduit) {
    // État fixe : l'écran de fin, la jauge au score final.
    var gagnees = jeu.filter(function (m) { return m.getAttribute('data-ok') === '1'; }).length;
    manches.forEach(function (m) { classes(m, ['est-active', 'est-revelee']); });
    if (fin) { fin.classList.add('est-active'); fin.classList.add('est-revelee'); }
    jauge(100 * gagnees / jeu.length);
    return;
  }

  // ── L'inclinaison sous la souris, et la parallaxe des pastilles ──
  var cibleX = 0, cibleY = 0, curX = 0, curY = 0, image = null, survol = false;
  function boucle() {
    curX += (cibleX - curX) * 0.09;
    curY += (cibleY - curY) * 0.09;
    carte.style.transform = 'rotateX(' + curY.toFixed(2) + 'deg) rotateY(' + curX.toFixed(2) + 'deg)';
    carte.style.setProperty('--reflet-x', (50 + curX * 3.2).toFixed(1) + '%');
    carte.style.setProperty('--reflet-y', (35 - curY * 3.2).toFixed(1) + '%');
    for (var i = 0; i < orbes.length; i++) {
      var p = parseFloat(orbes[i].getAttribute('data-prof')) || 0.5;
      orbes[i].style.transform = 'translate3d(' + (curX * p * 2.4).toFixed(1) + 'px,' + (-curY * p * 2.4).toFixed(1) + 'px,0)';
    }
    var repos = Math.abs(cibleX - curX) < 0.02 && Math.abs(cibleY - curY) < 0.02;
    image = (repos && !survol) ? null : requestAnimationFrame(boucle);
  }
  function anime() { if (!image) image = requestAnimationFrame(boucle); }
  scene.addEventListener('pointermove', function (e) {
    var r = scene.getBoundingClientRect();
    cibleX = ((e.clientX - r.left) / r.width - 0.5) * 18;
    cibleY = (0.5 - (e.clientY - r.top) / r.height) * 14;
    survol = true;
    anime();
  });
  scene.addEventListener('pointerleave', function () { cibleX = 0; cibleY = 0; survol = false; anime(); });

  // ── Les cœurs ──
  var EMOJIS = ['💕', '💗', '💖', '❤️'];
  function lanceCoeurs(n) {
    if (!coeurs) return;
    for (var i = 0; i < n; i++) {
      var c = document.createElement('span');
      c.className = 'duel-coeur';
      c.textContent = EMOJIS[i % EMOJIS.length];
      var angle = (Math.random() * 130 - 65) * Math.PI / 180;
      var portee = 70 + Math.random() * 70;
      var duree = 900 + Math.random() * 700;
      c.style.setProperty('--dx', (Math.sin(angle) * portee).toFixed(0) + 'px');
      c.style.setProperty('--dy', (-Math.cos(angle) * portee - 30).toFixed(0) + 'px');
      c.style.setProperty('--dur', Math.round(duree) + 'ms');
      c.style.setProperty('--rot', (Math.random() * 60 - 30).toFixed(0) + 'deg');
      c.style.left = (38 + Math.random() * 24).toFixed(0) + '%';
      coeurs.appendChild(c);
      plus(retire(c), duree + 60);
    }
  }
  function retire(el) { return function () { if (el.parentNode) el.parentNode.removeChild(el); }; }

  // ── La partie ──
  var idx = -1, score = 0, minuteurs = [], actif = false;
  function plus(fn, ms) { minuteurs.push(setTimeout(fn, ms)); }
  function stop() { minuteurs.forEach(clearTimeout); minuteurs = []; }
  function manche() {
    if (!actif) return;
    idx++;
    manches.forEach(function (m) { classes(m, ['est-active', 'a-repondu', 'a-repondu-b', 'est-revelee']); });
    if (idx >= jeu.length) {
      if (fin) {
        fin.classList.add('est-active');
        plus(function () { fin.classList.add('est-revelee'); lanceCoeurs(10); }, 450);
      }
      plus(function () { idx = -1; score = 0; jauge(0); manche(); }, fin ? 5600 : 400);
      return;
    }
    var m = jeu[idx], ok = m.getAttribute('data-ok') === '1';
    m.classList.add('est-active');
    plus(function () { m.classList.add('a-repondu'); }, 900);
    plus(function () { m.classList.add('a-repondu-b'); }, 1750);
    plus(function () {
      m.classList.add('est-revelee');
      if (ok) {
        score++;
        jauge(100 * score / jeu.length);
        lanceCoeurs(7);
      } else {
        pile.classList.add('secoue');
        plus(function () { pile.classList.remove('secoue'); }, 520);
      }
    }, 2550);
    plus(manche, 5100);
  }
  function pause() { if (!actif) return; actif = false; stop(); pile.classList.remove('secoue'); }
  function reprend() {
    if (actif) return;
    actif = true;
    // La manche interrompue est rejouée depuis le début, la jauge recalculée.
    idx = Math.max(-1, Math.min(idx, jeu.length) - 1);
    score = 0;
    for (var i = 0; i <= idx && i < jeu.length; i++) if (jeu[i].getAttribute('data-ok') === '1') score++;
    jauge(100 * score / jeu.length);
    manche();
  }

  var visible = true;
  function etat() { if (visible && !document.hidden) reprend(); else pause(); }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) { visible = e.isIntersecting; });
      etat();
    }, { threshold: 0.15 }).observe(scene);
  }
  document.addEventListener('visibilitychange', etat);
  etat();
})();
