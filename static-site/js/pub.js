/* ═══════════════════════════════════════════════════════════════════
   LES EMPLACEMENTS DE LA REGIE, CHARGES APRES LE RESTE

   Le tag de la regie est deux balises script posees dans le div de
   l'emplacement. Telles quelles, elles arretaient l'analyse de la page le
   temps d'un aller-retour vers un domaine tiers : avec cinq emplacements,
   dix arrets, dont six avant le moteur de quiz.

   « defer » supprimait les arrets, mais pas l'attente : les scripts differes
   s'executent dans l'ordre du document, et le moteur, declare apres les
   premiers emplacements, attendait encore leur telechargement pour demarrer.

   Les scripts sont donc poses d'ici, une fois le document analyse. La page
   s'affiche et le moteur se lance sans rien devoir a la regie ; les annonces
   partent juste apres, dans le meme tour de boucle.

   « async = false » sur une balise creee en JavaScript garde l'ordre
   d'execution entre les deux fichiers, ce dont la regie a besoin : c'est le
   meme mecanisme que pour l'interstitiel, deja verifie en production.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  // Un emplacement masque ne doit rien demander : la colonne laterale
  // n'existe pas sous 1440 px, et une annonce servie dans un conteneur
  // invisible n'est vue par personne. On la reclame si la fenetre s'elargit.
  function affiche(hote) {
    return !!(hote.offsetWidth || hote.offsetHeight || hote.getClientRects().length);
  }

  function pose(hote) {
    if (hote.getAttribute('data-pub-posee')) return;
    var format = hote.getAttribute('data-pub-differee');
    var site = hote.getAttribute('data-pub-site');
    if (!format || !site) return;
    if (!affiche(hote)) { enAttente = true; return; }
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

  var enAttente = false;

  function toutPoser() {
    enAttente = false;
    var liste = document.querySelectorAll('[data-pub-differee]:not([data-pub-posee])');
    for (var i = 0; i < liste.length; i++) {
      try { pose(liste[i]); } catch (e) {}
    }
    if (enAttente && !surveille) {
      surveille = true;
      window.addEventListener('resize', reessaie);
      window.addEventListener('orientationchange', reessaie);
    }
  }

  var surveille = false, minuteur = null;
  function reessaie() {
    if (minuteur) clearTimeout(minuteur);
    minuteur = setTimeout(function () {
      toutPoser();
      if (!enAttente) {
        window.removeEventListener('resize', reessaie);
        window.removeEventListener('orientationchange', reessaie);
        surveille = false;
      }
    }, 250);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', toutPoser);
  } else {
    toutPoser();
  }
})();
