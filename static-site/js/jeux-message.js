/* Jeux de couple par message : un jeu, une question tirée au hasard, et un
   message prêt à partir sur WhatsApp, par SMS, par le partage du téléphone
   ou en copie, avec le lien de la page pour que l'autre en renvoie une.
   Les questions arrivent dans window.PM_DATA (gabarit jeux-par-message.ejs).
   WhatsApp et SMS sont de vrais liens, mis à jour à chaque question : le
   garde-fou des redirections de pub.js ne laisse partir vers un autre site
   que la navigation qui vient d'un clic sur un lien. Un message envoyé, copié
   ou partagé pose data-quiz-done sur la racine, que quiz-extras.js compte
   comme une partie (une fois par visite). */
(function () {
  'use strict';
  var racine = document.getElementById('pm-outil');
  if (!racine) return;

  var D = window.PM_DATA || {};
  var JEUX = D.jeux || {};
  var ORDRE = (D.ordre || []).filter(function (id) { return JEUX[id] && JEUX[id].items && JEUX[id].items.length; });
  var O = D.outil || {};
  if (!ORDRE.length) return;

  var courant = null;
  var question = '';
  var files = {};

  function q(sel) { return racine.querySelector(sel); }
  function melanger(liste) {
    var a = liste.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  // Chaque jeu a sa file mélangée : on ne retombe sur une question qu'une
  // fois toutes les autres tirées.
  function tirer(id) {
    var f = files[id];
    if (!f || !f.length) {
      f = files[id] = melanger(JEUX[id].items);
      if (f.length > 1 && f[f.length - 1] === question) f.unshift(f.pop());
    }
    return f.pop();
  }
  function lien(id) {
    var base = D.url || (location.origin + location.pathname);
    return base.split('#')[0] + '#' + (JEUX[id].ancre || id);
  }
  function texteQuestion() { return JEUX[courant].modele.replace('{{q}}', question); }
  function message() { return texteQuestion() + '\n\n' + (O.appel || '') + '\n' + lien(courant); }

  function afficher() {
    var j = JEUX[courant];
    q('.pm-question').textContent = texteQuestion();
    q('.pm-aide').textContent = j.aide || '';
    var m = encodeURIComponent(message());
    document.getElementById('pm-wa').href = 'https://wa.me/?text=' + m;
    document.getElementById('pm-sms').href = 'sms:?&body=' + m;
    var boutons = racine.querySelectorAll('.pm-jeu');
    for (var i = 0; i < boutons.length; i++) {
      var actif = boutons[i].getAttribute('data-jeu') === courant;
      boutons[i].setAttribute('aria-pressed', actif ? 'true' : 'false');
      boutons[i].classList.toggle('pm-jeu--actif', actif);
    }
  }
  function choisir(id) {
    if (!JEUX[id]) return;
    courant = id;
    question = tirer(id);
    afficher();
  }
  function fini() { racine.setAttribute('data-quiz-done', '1'); }

  function confirmer(texte) {
    var c = document.getElementById('pm-copie');
    if (!c) return;
    c.textContent = texte;
    c.classList.remove('hidden');
    clearTimeout(confirmer.t);
    confirmer.t = setTimeout(function () { c.classList.add('hidden'); }, 2600);
  }
  function copier() {
    var texte = message();
    var ok = function () { confirmer(O.copie || ''); fini(); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texte).then(ok).catch(function () {});
      return;
    }
    var z = document.createElement('textarea');
    z.value = texte; z.setAttribute('readonly', ''); z.style.position = 'absolute'; z.style.left = '-9999px';
    document.body.appendChild(z); z.select();
    try { document.execCommand('copy'); ok(); } catch (e) {}
    document.body.removeChild(z);
  }

  // ── Les gestes ──
  var boutons = racine.querySelectorAll('.pm-jeu');
  for (var i = 0; i < boutons.length; i++) {
    boutons[i].addEventListener('click', function () { choisir(this.getAttribute('data-jeu')); });
  }
  document.getElementById('pm-autre').addEventListener('click', function () { choisir(courant); });
  document.getElementById('pm-wa').addEventListener('click', fini);
  document.getElementById('pm-sms').addEventListener('click', fini);
  document.getElementById('pm-copier').addEventListener('click', copier);
  var partage = document.getElementById('pm-partager');
  if (partage && navigator.share) {
    partage.hidden = false;
    partage.addEventListener('click', function () {
      navigator.share({ text: message() }).then(fini).catch(function () {});
    });
  }

  // ── Au chargement : le jeu de l'ancre (le lien reçu dans un message), sinon le premier ──
  var ancre = (location.hash || '').slice(1);
  var depart = null;
  ORDRE.forEach(function (id) { if ((JEUX[id].ancre || id) === ancre) depart = id; });
  choisir(depart || ORDRE[0]);
  if (depart) {
    var haut = racine.getBoundingClientRect().top + window.pageYOffset - 80;
    window.scrollTo({ top: Math.max(0, haut) });
  }

  // Pour les essais : le message en cours, sans rien envoyer.
  window.QCMessage = { message: message, jeu: function () { return courant; } };
})();
