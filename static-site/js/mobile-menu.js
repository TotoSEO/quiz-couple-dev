/**
 * Mobile menu toggle + accordion navigation
 */
(function() {
  var menuBtn = document.getElementById('mobile-menu-btn');
  var menu = document.getElementById('mobile-menu');
  if (!menuBtn || !menu) return;

  var menuIcon = menuBtn.querySelector('.menu-icon');
  var closeIcon = menuBtn.querySelector('.close-icon');

  menuBtn.addEventListener('click', function() {
    var isOpen = menu.classList.contains('hidden');
    menu.classList.toggle('hidden');
    menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    if (menuIcon) menuIcon.classList.toggle('hidden');
    if (closeIcon) closeIcon.classList.toggle('hidden');
  });

  // Accordeons mobiles. Deux formes coexistent : le declencheur classique,
  // qui est un bouton pleine largeur, et le declencheur scinde des jeux, ou
  // le libelle est un lien vers le hub et seule la fleche deplie la liste.
  function basculer(bouton, contenu) {
    var ouvert = bouton.getAttribute('aria-expanded') === 'true';
    bouton.setAttribute('aria-expanded', ouvert ? 'false' : 'true');
    if (contenu) {
      contenu.classList.toggle('open');
      contenu.classList.toggle('hidden');
    }
  }
  document.querySelectorAll('.mobile-accordion-trigger').forEach(function(trigger) {
    var contenu = trigger.nextElementSibling;
    var fleche = trigger.querySelector('.mobile-trigger-fleche');
    if (fleche) { fleche.addEventListener('click', function() { basculer(fleche, contenu); }); return; }
    trigger.addEventListener('click', function() { basculer(trigger, contenu); });
  });

  // Menu des jeux en version bureau : le panneau s'ouvre au survol par le CSS,
  // mais il faut aussi qu'un clic sur la fleche l'ouvre, sinon l'ecran tactile
  // et le clavier n'ont aucun moyen d'y acceder.
  document.querySelectorAll('.nav-dropdown--scinde').forEach(function(bloc) {
    var fleche = bloc.querySelector('.nav-trigger-fleche');
    if (!fleche) return;
    fleche.addEventListener('click', function(e) {
      e.preventDefault();
      var ouvert = bloc.classList.toggle('est-ouvert');
      fleche.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
    });
    // Un clic ailleurs, ou la touche d'echappement, referme le panneau.
    document.addEventListener('click', function(e) {
      if (bloc.contains(e.target)) return;
      bloc.classList.remove('est-ouvert');
      fleche.setAttribute('aria-expanded', 'false');
    });
    bloc.addEventListener('keydown', function(e) {
      if (e.key !== 'Escape') return;
      bloc.classList.remove('est-ouvert');
      fleche.setAttribute('aria-expanded', 'false');
      fleche.focus();
    });
  });

  // Megamenu bureau : le panneau est ancre sur le bord gauche de son onglet,
  // pour qu'il reste sous lui et que la souris puisse y descendre sans que le
  // menu se referme. Sur les onglets de droite, un panneau large sortirait de
  // l'ecran : on le recule alors du strict necessaire, jamais au-dela du bord
  // gauche de la fenetre, et jamais au point de ne plus couvrir son onglet.
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

  // Close mobile menu when clicking a link
  menu.querySelectorAll('a').forEach(function(link) {
    link.addEventListener('click', function() {
      menu.classList.add('hidden');
      menuBtn.setAttribute('aria-expanded', 'false');
      if (menuIcon) menuIcon.classList.remove('hidden');
      if (closeIcon) closeIcon.classList.add('hidden');
    });
  });
})();
