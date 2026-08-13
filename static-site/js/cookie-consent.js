/**
 * Cookie consent banner
 */
(function() {
  var banner = document.getElementById('cookie-consent');
  var acceptBtn = document.getElementById('cookie-accept');
  var refuseBtn = document.getElementById('cookie-refuse');
  if (!banner) return;

  var consent = localStorage.getItem('cookie-consent');

  // Les quatre signaux accordés d'un coup. Ils étaient tous refusés sauf la
  // mesure d'audience, y compris après un clic sur « Accepter » : AdSense ne
  // pouvait donc servir que des annonces non personnalisées. Le bandeau
  // annonce désormais explicitement la publicité, ce qui est la condition
  // pour que ce consentement veuille dire quelque chose.
  var TOUT_ACCORDE = {
    analytics_storage: 'granted',
    ad_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'granted'
  };
  var TOUT_REFUSE = {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  };

  // Choix déjà fait lors d'une visite précédente : on le rejoue tout de suite,
  // l'en-tête a posé « refusé » par défaut.
  if (consent === 'accepted' && window.gtag) {
    window.gtag('consent', 'update', TOUT_ACCORDE);
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
      if (window.gtag) window.gtag('consent', 'update', TOUT_ACCORDE);
      banner.classList.add('hidden');
    });
  }

  if (refuseBtn) {
    refuseBtn.addEventListener('click', function() {
      localStorage.setItem('cookie-consent', 'refused');
      // Refus explicite plutôt que silencieux : quelqu'un qui avait accepté
      // puis change d'avis dans la même page verrait sinon son consentement
      // rester accordé jusqu'au rechargement.
      if (window.gtag) window.gtag('consent', 'update', TOUT_REFUSE);
      banner.classList.add('hidden');
    });
  }
})();
