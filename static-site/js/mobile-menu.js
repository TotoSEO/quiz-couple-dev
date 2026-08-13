/**
 * En-tête à deux niveaux : état collé, menu mobile, accordéons, panneaux.
 */
(function() {
  var entete = document.getElementById('site-header');

  // ── État collé ──────────────────────────────────────────
  // La classe est-collee replie le niveau qui sert le moins : le niveau 1 sur
  // bureau, la rangée de puces sur mobile. L'hystérésis (48 px pour coller,
  // 12 px pour décoller) évite que la barre batte des ailes autour du seuil
  // pendant que sa propre hauteur change.
  if (entete) {
    var collee = false;
    var poserEtat = function() {
      var y = window.scrollY || document.documentElement.scrollTop || 0;
      if (!collee && y > 48) { collee = true; entete.classList.add('est-collee'); }
      else if (collee && y < 12) { collee = false; entete.classList.remove('est-collee'); }
    };
    window.addEventListener('scroll', poserEtat, { passive: true });
    poserEtat();
  }

  // ── Menu mobile ─────────────────────────────────────────
  var menuBtn = document.getElementById('mobile-menu-btn');
  var menu = document.getElementById('mobile-menu');

  function poserTiroir(ouvert) {
    if (!menuBtn || !menu) return;
    menu.classList.toggle('hidden', !ouvert);
    menuBtn.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
    var menuIcon = menuBtn.querySelector('.menu-icon');
    var closeIcon = menuBtn.querySelector('.close-icon');
    if (menuIcon) menuIcon.classList.toggle('hidden', ouvert);
    if (closeIcon) closeIcon.classList.toggle('hidden', !ouvert);
  }

  if (menuBtn && menu) {
    menuBtn.addEventListener('click', function() {
      poserTiroir(menu.classList.contains('hidden'));
    });
    // Suivre un lien du menu le referme.
    menu.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() { poserTiroir(false); });
    });
  }

  // ── Accordéons du menu mobile ───────────────────────────
  // Deux formes : le déclencheur classique (bouton pleine largeur) et le
  // déclencheur scindé des jeux (le libellé est un lien vers le hub, seule
  // la flèche déplie la liste).
  function basculerAccordeon(bouton, contenu, forcerOuvert) {
    var ouvert = bouton.getAttribute('aria-expanded') === 'true';
    var cible = (forcerOuvert === undefined) ? !ouvert : forcerOuvert;
    if (cible === ouvert) return;
    bouton.setAttribute('aria-expanded', cible ? 'true' : 'false');
    if (contenu) {
      contenu.classList.toggle('open', cible);
      contenu.classList.toggle('hidden', !cible);
    }
  }
  document.querySelectorAll('.mobile-accordion-trigger').forEach(function(trigger) {
    var contenu = trigger.nextElementSibling;
    var fleche = trigger.querySelector('.mobile-trigger-fleche');
    if (fleche) { fleche.addEventListener('click', function() { basculerAccordeon(fleche, contenu); }); return; }
    trigger.addEventListener('click', function() { basculerAccordeon(trigger, contenu); });
  });

  // ── Menus déroulants (bureau) ───────────────────────────
  // Les panneaux des familles s'ouvrent au survol (et à la tabulation par le
  // CSS), jamais au clic : un panneau qui reste planté après un clic sur
  // l'onglet gêne plus qu'il n'aide. Seuls gardent un clic les déclencheurs
  // qui n'ont pas d'équivalent au survol tactile : la flèche du menu des
  // jeux (le libellé est un lien, il navigue) et le sélecteur de langue.
  var deroulants = Array.prototype.slice.call(document.querySelectorAll('#site-header .nav-dropdown'));
  function fermerDeroulants(sauf) {
    deroulants.forEach(function(bloc) {
      if (bloc === sauf) return;
      bloc.classList.remove('est-ouvert');
      var d = bloc.querySelector('[aria-expanded]');
      if (d) d.setAttribute('aria-expanded', 'false');
    });
  }
  deroulants.forEach(function(bloc) {
    var declencheur = bloc.querySelector('.nav-trigger-fleche') ||
      (bloc.hasAttribute('data-megamenu') ? null : bloc.querySelector('.nav-dropdown-trigger'));
    if (!declencheur) return;
    declencheur.addEventListener('click', function(e) {
      e.preventDefault();
      var ouvert = bloc.classList.toggle('est-ouvert');
      declencheur.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
      if (ouvert) { fermerDeroulants(bloc); caleMegamenu(bloc); }
    });
    bloc.addEventListener('keydown', function(e) {
      if (e.key !== 'Escape') return;
      bloc.classList.remove('est-ouvert');
      declencheur.setAttribute('aria-expanded', 'false');
      declencheur.focus();
    });
  });
  document.addEventListener('click', function(e) {
    deroulants.forEach(function(bloc) {
      if (bloc.contains(e.target)) return;
      if (!bloc.classList.contains('est-ouvert')) return;
      bloc.classList.remove('est-ouvert');
      var d = bloc.querySelector('[aria-expanded]');
      if (d) d.setAttribute('aria-expanded', 'false');
    });
  });

  // ── Calage des méga-panneaux ────────────────────────────
  // Le panneau est ancré sur le bord gauche de son onglet, pour rester sous
  // lui et que la souris puisse y descendre sans que le menu se referme. Sur
  // les onglets de droite, un panneau large sortirait de l'écran : on le
  // recule alors du strict nécessaire, jamais au-delà du bord gauche de la
  // fenêtre, et jamais au point de ne plus couvrir son onglet.
  var megamenus = document.querySelectorAll('[data-megamenu]');
  function caleMegamenu(bloc) {
    var pan = bloc.querySelector('.nav-megamenu');
    if (!pan) return;
    pan.style.transform = '';
    var rp = pan.getBoundingClientRect();
    if (!rp.width) return;
    var ro = bloc.getBoundingClientRect();
    var marge = 12;
    var debord = rp.right - (window.innerWidth - marge);
    if (debord <= 0) return;
    var recul = Math.min(debord, rp.left - marge, rp.width - ro.width - 8);
    if (recul > 0) pan.style.transform = 'translateX(' + (-Math.round(recul)) + 'px)';
  }
  megamenus.forEach(function(bloc) {
    bloc.addEventListener('mouseenter', function() { caleMegamenu(bloc); });
    bloc.addEventListener('focusin', function() { caleMegamenu(bloc); });
  });
  var minuteurCale;
  window.addEventListener('resize', function() {
    clearTimeout(minuteurCale);
    minuteurCale = setTimeout(function() {
      megamenus.forEach(function(bloc) {
        var pan = bloc.querySelector('.nav-megamenu');
        if (pan) pan.style.transform = '';
      });
    }, 150);
  });
})();
