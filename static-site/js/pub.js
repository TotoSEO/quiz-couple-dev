/* ═══════════════════════════════════════════════════════════════════
   LES EMPLACEMENTS DE LA REGIE, CHARGES APRES LE RESTE ET A L'APPROCHE

   Le tag de la regie est deux balises script posees dans le div de
   l'emplacement. Telles quelles, elles arretaient l'analyse de la page le
   temps d'un aller-retour vers un domaine tiers : avec cinq emplacements,
   dix arrets, dont six avant le moteur de quiz.

   Les scripts sont donc poses d'ici, une fois le document analyse. La page
   s'affiche et le moteur se lance sans rien devoir a la regie.

   Et un emplacement dans le flux n'est demande que lorsqu'il approche de
   l'ecran, environ une hauteur d'ecran avant. Chaque emplacement coute trois
   fichiers a la regie, dont un de 270 Ko a analyser ; sur une page de test,
   trois des quatre sont a plus de 2 500 px du haut, et la plupart des visites
   ne descendent jamais jusque la. Les demander au chargement ne servait qu'a
   ralentir la page, PageSpeed les comptait dans le JavaScript inutilise.

   « async = false » sur une balise creee en JavaScript garde l'ordre
   d'execution entre les deux fichiers, ce dont la regie a besoin : c'est le
   meme mecanisme que pour l'interstitiel, deja verifie en production.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  // Les formats qui se placent tout seuls, hors du flux (le double skyrail,
  // dans les gouttieres) : la position de leur div dans le document ne dit
  // rien de leur visibilite, on les demande des le depart.
  var HORS_FLUX = { '4': true };

  // La distance a laquelle un emplacement est demande avant d'entrer dans
  // l'ecran : une hauteur d'ecran, le temps pour la regie de repondre.
  var MARGE = '800px 0px';

  function pose(hote) {
    if (hote.getAttribute('data-pub-posee')) return;
    var format = hote.getAttribute('data-pub-differee');
    var site = hote.getAttribute('data-pub-site');
    if (!format || !site) return;
    hote.setAttribute('data-pub-posee', '1');

    var cible = hote.firstElementChild || hote;
    var sources = [
      '//ads.themoneytizer.com/s/gen.js?type=' + format,
      '//ads.themoneytizer.com/s/requestform.js?siteId=' + site + '&formatId=' + format
    ];
    for (var i = 0; i < sources.length; i++) {
      var balise = document.createElement('script');
      balise.src = sources[i];
      balise.async = false;
      cible.appendChild(balise);
    }
  }

  // Un emplacement masque ne doit rien demander : la colonne laterale
  // n'existe pas sous 1440 px, et une annonce servie dans un conteneur
  // invisible n'est vue par personne. L'observateur regle les deux questions
  // a la fois, sans jamais forcer de mise en page : un element en display:none
  // n'a pas de boite, donc ne croise jamais l'ecran ; s'il apparait quand la
  // fenetre s'elargit, ou quand la page defile jusqu'a lui, il est signale.
  function surveille(liste) {
    var obs = new IntersectionObserver(function (entrees) {
      for (var i = 0; i < entrees.length; i++) {
        var e = entrees[i];
        if (!e.isIntersecting) continue;
        var r = e.boundingClientRect;
        if (!r.width && !r.height) continue;
        obs.unobserve(e.target);
        try { pose(e.target); } catch (x) {}
      }
    }, { rootMargin: MARGE });
    for (var i = 0; i < liste.length; i++) obs.observe(liste[i]);
  }

  // Sans observateur (navigateurs anciens), le comportement d'avant : tout
  // ce qui est affiche est demande tout de suite.
  function affiche(hote) {
    return !!(hote.offsetWidth || hote.offsetHeight || hote.getClientRects().length);
  }
  function repli(liste) {
    for (var i = 0; i < liste.length; i++) {
      try { if (affiche(liste[i])) pose(liste[i]); } catch (e) {}
    }
  }

  function demarre() {
    var tous = document.querySelectorAll('[data-pub-differee]:not([data-pub-posee])');
    var dansLeFlux = [];
    for (var i = 0; i < tous.length; i++) {
      if (HORS_FLUX[tous[i].getAttribute('data-pub-differee')]) {
        try { pose(tous[i]); } catch (e) {}
      } else {
        dansLeFlux.push(tous[i]);
      }
    }
    if (!dansLeFlux.length) return;
    if ('IntersectionObserver' in window) surveille(dansLeFlux);
    else repli(dansLeFlux);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', demarre);
  } else {
    demarre();
  }
})();
