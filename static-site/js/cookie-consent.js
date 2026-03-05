/**
 * Cookie consent banner
 */
(function() {
  var banner = document.getElementById('cookie-consent');
  var acceptBtn = document.getElementById('cookie-accept');
  var refuseBtn = document.getElementById('cookie-refuse');
  if (!banner) return;

  var consent = localStorage.getItem('cookie-consent');

  // If user already accepted previously, grant consent immediately
  // so GA tracks this pageview (consent default is 'denied' in <head>)
  if (consent === 'accepted' && window.gtag) {
    window.gtag('consent', 'update', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
  }

  // Show banner only if user hasn't made a choice yet
  if (!consent) {
    setTimeout(function() {
      banner.classList.remove('hidden');
    }, 1000);
  }

  if (acceptBtn) {
    acceptBtn.addEventListener('click', function() {
      localStorage.setItem('cookie-consent', 'accepted');
      if (window.gtag) {
        window.gtag('consent', 'update', {
          analytics_storage: 'granted',
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied'
        });
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
