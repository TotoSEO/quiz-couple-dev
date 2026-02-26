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

  // Mobile accordions
  var accordions = document.querySelectorAll('.mobile-accordion-trigger');
  accordions.forEach(function(trigger) {
    trigger.addEventListener('click', function() {
      var content = this.nextElementSibling;
      var isOpen = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', !isOpen);
      if (content) {
        content.classList.toggle('open');
        content.classList.toggle('hidden');
      }
    });
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
