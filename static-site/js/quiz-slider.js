/* Horizontal quiz/test sliders on the home page.
   Progressive enhancement: without JS the track is still a scrollable rail. */
(function () {
  function initSlider(root) {
    var track = root.querySelector('[data-slider-track]');
    var prev = root.querySelector('[data-slider-prev]');
    var next = root.querySelector('[data-slider-next]');
    if (!track) return;
    var compteur = root.querySelector('[data-slider-compteur]');
    var cartes = track.querySelectorAll('.quiz-slide');
    // L'ecart entre deux cartes ne change qu'avec la largeur de la fenetre :
    // on le relit a ce moment-la seulement, getComputedStyle a un cout.
    var ecart = null;
    function lireEcart() {
      ecart = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || '20') || 20;
      return ecart;
    }
    function pas() {
      var card = cartes[0];
      var gap = ecart === null ? lireEcart() : ecart;
      return card ? card.getBoundingClientRect().width + gap : track.clientWidth * 0.8;
    }

    function step() {
      var w = pas();
      // Scroll by ~the number of fully visible cards, at least one
      var visible = Math.max(1, Math.floor(track.clientWidth / w));
      return w * visible;
    }

    // Toutes les lectures d'abord (lire), toutes les ecritures ensuite
    // (ecrire). Lire la largeur d'une carte apres avoir pose une variable CSS
    // sur le curseur forcait une mise en page complete a chaque appel, quatre
    // fois au chargement de l'accueil : PageSpeed comptait 126 ms rien que la.
    // Au premier releve, initAll lit les quatre curseurs avant d'ecrire dans
    // le premier.
    function lire() {
      return {
        largeur: track.clientWidth,
        etendue: track.scrollWidth,
        x: track.scrollLeft,
        w: (compteur && cartes.length) ? pas() : 0
      };
    }
    function ecrire(m) {
      // La piste porte un scroll-padding : au repos scrollLeft vaut déjà
      // quelques pixels, jamais zéro. Sans cette marge la flèche « précédent »
      // restait affichée dès le chargement et mordait sur la première carte.
      var MARGE = 8;
      var maxScroll = m.etendue - m.largeur - 1;
      var debut = m.x <= MARGE;
      var fin = m.x >= maxScroll - MARGE;
      if (prev) prev.disabled = debut;
      if (next) next.disabled = fin;
      root.classList.toggle('is-start', debut);
      root.classList.toggle('is-end', fin);
      // La barre sous la piste : la part visible et l'avancement, en variables
      // CSS ; le compteur dit la derniere carte visible sur le total.
      var part = m.etendue ? m.largeur / m.etendue : 1;
      root.style.setProperty('--part', part.toFixed(4));
      root.style.setProperty('--avance', (maxScroll > 0 ? Math.min(1, Math.max(0, m.x / maxScroll)) : 0).toFixed(4));
      if (compteur && cartes.length) {
        var visibles = Math.max(1, Math.floor((m.largeur + 1) / m.w));
        var premier = Math.round(m.x / m.w);
        var dernier = fin ? cartes.length : Math.min(cartes.length, premier + visibles);
        compteur.textContent = dernier + ' / ' + cartes.length;
      }
    }
    function update() { ecrire(lire()); }

    if (prev) prev.addEventListener('click', function () {
      track.scrollBy({ left: -step(), behavior: 'smooth' });
    });
    if (next) next.addEventListener('click', function () {
      track.scrollBy({ left: step(), behavior: 'smooth' });
    });
    track.addEventListener('scroll', function () {
      window.requestAnimationFrame(update);
    }, { passive: true });
    window.addEventListener('resize', function () { ecart = null; update(); });
    return { lire: lire, ecrire: ecrire };
  }

  function initAll() {
    var sliders = document.querySelectorAll('[data-slider]');
    var curseurs = [];
    for (var i = 0; i < sliders.length; i++) {
      var c = initSlider(sliders[i]);
      if (c) curseurs.push(c);
    }
    // Le premier releve part dans une seule image, une fois que les autres
    // scripts differes ont fini d'ecrire dans la page, et lit les quatre
    // curseurs avant d'ecrire dans le premier : une seule mise en page au
    // lieu d'une par curseur.
    var premier = function () {
      var mesures = [];
      for (var j = 0; j < curseurs.length; j++) mesures.push(curseurs[j].lire());
      for (var k = 0; k < curseurs.length; k++) curseurs[k].ecrire(mesures[k]);
    };
    if (window.requestAnimationFrame) window.requestAnimationFrame(premier); else premier();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
