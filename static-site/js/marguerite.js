/* Effeuiller la marguerite en ligne : une fleur de 14 à 26 pétales tirés au
   hasard, qu'on effeuille en touchant les pétales un par un. Chaque pétale
   enlevé dit l'étape suivante de la formule choisie (window.MG_DATA,
   gabarit jeu-marguerite.ejs) : deux phrases qui alternent (« il m'aime »,
   « il ne m'aime pas ») ou les cinq mots de la version française. Le
   dernier pétale donne la réponse, dans une carte qui porte
   quiz-result-card : c'est elle que guettent le compteur de parties et le
   bloc des avis. Les réglages (prénom, il ou elle, formule) se figent au
   premier pétale et se libèrent avec « Une autre marguerite ». Les chutes
   n'animent que transform et opacity, et prefers-reduced-motion les coupe. */
(function () {
  'use strict';
  var racine = document.getElementById('mg-outil');
  if (!racine) return;

  var D = window.MG_DATA || {};
  var O = D.outil || {};
  var V = D.versions || {};
  var PRONOMS = D.pronoms || [];
  var MIN = 14, MAX = 26;

  var fleur = document.getElementById('mg-fleur');
  var coeur = fleur.querySelector('.mg-coeur');
  var champ = document.getElementById('mg-prenom');
  var tete = racine.querySelector('.mg-tete');
  var phrase = racine.querySelector('.mg-phrase');
  var boutonTout = document.getElementById('mg-tout');
  var boutonNouvelle = document.getElementById('mg-nouvelle');
  var resultat = document.getElementById('mg-resultat');
  var reduit = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  var etat = {
    version: V[D.versionDefaut] ? D.versionDefaut : Object.keys(V)[0],
    pronom: PRONOMS.length ? PRONOMS[0].id : null,
    total: 0, ote: 0, fini: false, auto: null, finale: '',
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function sujet() {
    var nom = (champ && champ.value || '').replace(/\s+/g, ' ').trim().slice(0, 30);
    if (nom) return nom;
    for (var i = 0; i < PRONOMS.length; i++) if (PRONOMS[i].id === etat.pronom) return PRONOMS[i].sujet;
    return '';
  }
  // « {{s}} m'aime » : le prénom, ou il, elle, ou rien (« m'ama », « me
  // quiere ») ; la première lettre en capitale dans tous les cas.
  function remplir(modele) {
    var s = String(modele || '').replace('{{s}}', sujet()).replace(/\s+/g, ' ').trim();
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  // L'étape n (0 pour le premier pétale enlevé).
  function etape(n) {
    var v = V[etat.version];
    if (!v) return { tete: '', mot: '', sens: 'moyen' };
    if (v.mots && v.mots.length) {
      var i = n % v.mots.length;
      return { tete: remplir(v.tete), mot: v.mots[i], sens: (v.sens || [])[i] || 'moyen' };
    }
    var j = n % v.phrases.length;
    return { tete: '', mot: remplir(v.phrases[j]), sens: (v.sens || [])[j] || 'moyen' };
  }

  // ── La fleur ──
  function petales() { return fleur.querySelectorAll('.mg-petale'); }
  function restants() { return fleur.querySelectorAll('.mg-petale:not(.mg-petale--ote)'); }
  function suivantFocalisable() {
    var tous = petales();
    var r = restants();
    for (var i = 0; i < tous.length; i++) tous[i].tabIndex = -1;
    if (r.length) r[0].tabIndex = 0;
    return r[0] || null;
  }
  function dessiner() {
    var anciens = petales();
    for (var k = anciens.length - 1; k >= 0; k--) anciens[k].parentNode.removeChild(anciens[k]);
    var n = MIN + Math.floor(Math.random() * (MAX - MIN + 1));
    etat.total = n; etat.ote = 0; etat.fini = false; etat.finale = '';
    fleur.style.setProperty('--n', String(n));
    var depart = Math.random() * 360;
    var morceau = document.createDocumentFragment();
    for (var i = 0; i < n; i++) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'mg-petale';
      var angle = depart + i * 360 / n + (Math.random() * 6 - 3);
      var taille = 0.92 + Math.random() * 0.13;
      b.style.setProperty('--a', angle.toFixed(1) + 'deg');
      b.style.setProperty('--t', taille.toFixed(3));
      b.setAttribute('aria-label', O.petale || '');
      morceau.appendChild(b);
    }
    fleur.insertBefore(morceau, coeur);
    suivantFocalisable();
  }

  function figer(oui) {
    if (champ) champ.disabled = oui;
    var opts = racine.querySelectorAll('.mg-option');
    for (var i = 0; i < opts.length; i++) opts[i].disabled = oui;
  }
  function afficherEtape(e) {
    tete.textContent = e.tete || '';
    tete.hidden = !e.tete;
    phrase.textContent = e.mot;
    phrase.classList.add('mg-phrase--mot');
    phrase.setAttribute('data-sens', e.sens);
  }
  function chute(b) {
    b.classList.add('mg-petale--ote');
    b.disabled = true;
    b.tabIndex = -1;
    if (reduit || typeof b.animate !== 'function') { b.style.opacity = '0'; return; }
    var base = 'rotate(' + b.style.getPropertyValue('--a') + ') scaleY(' + b.style.getPropertyValue('--t') + ')';
    var dx = Math.round(Math.random() * 110 - 55);
    var dy = Math.round(170 + Math.random() * 90);
    var tour = Math.round(Math.random() * 260 - 130);
    b.animate([
      { transform: base, opacity: 1 },
      { transform: 'translate(' + Math.round(dx * 0.25) + 'px,-10px) ' + base + ' rotate(' + Math.round(tour * 0.2) + 'deg)', opacity: 1, offset: 0.18 },
      { transform: 'translate(' + dx + 'px,' + dy + 'px) ' + base + ' rotate(' + tour + 'deg)', opacity: 0 }
    ], { duration: 950, easing: 'cubic-bezier(.4,.05,.75,.6)', fill: 'forwards' });
  }
  function oter(b) {
    if (!b || etat.fini || b.classList.contains('mg-petale--ote')) return;
    if (etat.ote === 0) { figer(true); resultat.hidden = true; resultat.innerHTML = ''; }
    var e = etape(etat.ote);
    etat.ote++;
    afficherEtape(e);
    chute(b);
    var prochain = suivantFocalisable();
    if (etat.ote >= etat.total) {
      finir(e);
    } else if (prochain && document.activeElement === b) {
      prochain.focus({ preventScroll: true });
    } else if (document.activeElement === b) {
      boutonNouvelle.focus({ preventScroll: true });
    }
  }

  // ── Le résultat ──
  function lien() { return (D.url || (location.origin + location.pathname)).split('#')[0].split('?')[0]; }
  function messagePartage() { return String(O.partage || '{{phrase}}').replace('{{phrase}}', etat.finale); }
  function confirmer(texte) {
    var c = document.getElementById('mg-copie');
    if (!c) return;
    c.textContent = texte;
    c.classList.remove('hidden');
    clearTimeout(confirmer.t);
    confirmer.t = setTimeout(function () { c.classList.add('hidden'); }, 2600);
  }
  function copier() {
    var texte = messagePartage() + '\n' + lien();
    var ok = function () { confirmer(O.copie || ''); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texte).then(ok).catch(function () {});
      return;
    }
    var z = document.createElement('textarea');
    z.value = texte; z.setAttribute('readonly', ''); z.style.position = 'absolute'; z.style.left = '-9999px';
    document.body.appendChild(z); z.select();
    try { document.execCommand('copy'); ok(); } catch (err) {}
    document.body.removeChild(z);
  }
  function finir(e) {
    etat.fini = true;
    arreterAuto();
    boutonTout.disabled = true;
    etat.finale = e.tete ? e.tete + ' ' + e.mot : e.mot;
    var cle = e.sens === 'positif' ? 'finPositif' : (e.sens === 'negatif' ? 'finNegatif' : 'finMoyen');
    var html = '<div class="quiz-result-card mg-carte mg-carte--' + esc(e.sens) + '">' +
      '<p class="mg-carte-titre">' + esc(O.finTitre) + '</p>' +
      (e.tete ? '<p class="mg-carte-tete">' + esc(e.tete) + '</p>' : '') +
      '<p class="mg-carte-mot">' + esc(e.mot) + '</p>' +
      '<p class="mg-carte-texte">' + esc(O[cle]) + '</p>' +
      '<div class="mg-carte-actions">' +
        '<button type="button" class="btn btn-cta mg-carte-nouvelle">' + esc(O.nouvelle) + '</button>' +
        (navigator.share ? '<button type="button" class="btn btn-outline mg-carte-partager">' + esc(O.partager) + '</button>' : '') +
        '<button type="button" class="btn btn-outline mg-carte-copier">' + esc(O.copier) + '</button>' +
      '</div>' +
      (D.suite ? '<p class="mg-carte-suite">' + esc(O.suite) + '</p><a class="mg-carte-lien" href="' + esc(D.suite) + '">' + esc(O.suiteBouton) + ' →</a>' : '') +
      '</div>';
    // La carte apparaît une fois le dernier pétale tombé, pas pendant sa chute.
    setTimeout(function () {
      if (!etat.fini) return;
      resultat.innerHTML = html;
      resultat.hidden = false;
      racine.setAttribute('data-quiz-done', '1');
      var n = resultat.querySelector('.mg-carte-nouvelle');
      if (n) n.addEventListener('click', function () { recommencer(true); });
      var p = resultat.querySelector('.mg-carte-partager');
      if (p) p.addEventListener('click', function () {
        navigator.share({ text: messagePartage(), url: lien() }).catch(function () {});
      });
      var c = resultat.querySelector('.mg-carte-copier');
      if (c) c.addEventListener('click', copier);
      var r = resultat.getBoundingClientRect();
      if (r.top > window.innerHeight - 120 || r.top < 60) {
        window.scrollTo({ top: Math.max(0, window.pageYOffset + r.top - 90), behavior: reduit ? 'auto' : 'smooth' });
      }
    }, reduit ? 0 : 650);
  }

  // ── Tout effeuiller d'un coup ──
  function arreterAuto() { if (etat.auto) { clearInterval(etat.auto); etat.auto = null; } }
  function toutEffeuiller() {
    if (etat.fini || etat.auto) return;
    boutonTout.disabled = true;
    var pas = function () {
      var r = restants();
      if (!r.length || etat.fini) { arreterAuto(); return; }
      oter(r[Math.floor(Math.random() * r.length)]);
    };
    pas();
    etat.auto = setInterval(pas, reduit ? 40 : 140);
  }

  function recommencer(defiler) {
    arreterAuto();
    resultat.hidden = true;
    resultat.innerHTML = '';
    racine.removeAttribute('data-quiz-done');
    boutonTout.disabled = false;
    figer(false);
    tete.textContent = '';
    tete.hidden = true;
    phrase.textContent = O.consigne || '';
    phrase.classList.remove('mg-phrase--mot');
    phrase.removeAttribute('data-sens');
    dessiner();
    if (defiler) {
      var r = racine.getBoundingClientRect();
      if (r.top < 0) window.scrollTo({ top: Math.max(0, window.pageYOffset + r.top - 90), behavior: reduit ? 'auto' : 'smooth' });
    }
  }

  // ── Les gestes ──
  fleur.addEventListener('click', function (ev) {
    var b = ev.target && ev.target.closest && ev.target.closest('.mg-petale');
    if (b && !etat.auto) oter(b);
  });
  boutonTout.addEventListener('click', toutEffeuiller);
  boutonNouvelle.addEventListener('click', function () { recommencer(false); });
  function choisir(attr, cle) {
    var boutons = racine.querySelectorAll('[' + attr + ']');
    for (var i = 0; i < boutons.length; i++) {
      boutons[i].addEventListener('click', function () {
        if (etat.ote > 0) return;
        etat[cle] = this.getAttribute(attr);
        for (var j = 0; j < boutons.length; j++) {
          var actif = boutons[j] === this;
          boutons[j].classList.toggle('mg-option--actif', actif);
          boutons[j].setAttribute('aria-pressed', actif ? 'true' : 'false');
        }
      });
    }
  }
  choisir('data-pronom', 'pronom');
  choisir('data-version', 'version');

  recommencer(false);

  // Pour les essais : l'état de la fleur, sans rien toucher.
  window.QCMarguerite = {
    total: function () { return etat.total; },
    otes: function () { return etat.ote; },
    finale: function () { return etat.finale; },
    etape: function (n) { return etape(n); },
  };
})();
