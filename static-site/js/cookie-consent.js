/**
 * Cookie consent banner
 */
(function() {
  var banner = document.getElementById('cookie-consent');
  var acceptBtn = document.getElementById('cookie-accept');
  var refuseBtn = document.getElementById('cookie-refuse');
  if (!banner) return;

  var consent = localStorage.getItem('cookie-consent');
  if (!consent) {
    setTimeout(function() {
      banner.classList.remove('hidden');
    }, 1000);
  }

  if (acceptBtn) {
    acceptBtn.addEventListener('click', function() {
      localStorage.setItem('cookie-consent', 'accepted');
      if (window.gtag) {
        window.gtag('consent', 'update', { analytics_storage: 'granted' });
      }
      banner.classList.add('hidden');
    });
  }

  if (refuseBtn) {
    refuseBtn.addEventListener('click', function() {
      localStorage.setItem('cookie-consent', 'refused');
      banner.classList.add('hidden');
    });
  }
})();
