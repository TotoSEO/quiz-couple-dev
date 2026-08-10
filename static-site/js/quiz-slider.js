/* Horizontal quiz/test sliders on the home page.
   Progressive enhancement: without JS the track is still a scrollable rail. */
(function () {
  function initSlider(root) {
    var track = root.querySelector('[data-slider-track]');
    var prev = root.querySelector('[data-slider-prev]');
    var next = root.querySelector('[data-slider-next]');
    if (!track) return;

    function step() {
      var card = track.querySelector('.quiz-slide');
      var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || '20') || 20;
      var w = card ? card.getBoundingClientRect().width + gap : track.clientWidth * 0.8;
      // Scroll by ~the number of fully visible cards, at least one
      var visible = Math.max(1, Math.floor(track.clientWidth / w));
      return w * visible;
    }

    function update() {
      // La piste porte un scroll-padding : au repos scrollLeft vaut déjà
      // quelques pixels, jamais zéro. Sans cette marge la flèche « précédent »
      // restait affichée dès le chargement et mordait sur la première carte.
      var MARGE = 8;
      var maxScroll = track.scrollWidth - track.clientWidth - 1;
      var x = track.scrollLeft;
      var debut = x <= MARGE;
      var fin = x >= maxScroll - MARGE;
      if (prev) prev.disabled = debut;
      if (next) next.disabled = fin;
      root.classList.toggle('is-start', debut);
      root.classList.toggle('is-end', fin);
    }

    if (prev) prev.addEventListener('click', function () {
      track.scrollBy({ left: -step(), behavior: 'smooth' });
    });
    if (next) next.addEventListener('click', function () {
      track.scrollBy({ left: step(), behavior: 'smooth' });
    });
    track.addEventListener('scroll', function () {
      window.requestAnimationFrame(update);
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  function initAll() {
    var sliders = document.querySelectorAll('[data-slider]');
    for (var i = 0; i < sliders.length; i++) initSlider(sliders[i]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
