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

   ── Les emplacements qui restent vides ────────────────────────────────
   La hauteur d'un emplacement est reservee d'avance (styles.css), pour que
   l'annonce ne pousse pas le contenu quand elle arrive. Mais la regie n'a pas
   toujours quelque chose a servir, et un cadre vide de 250 px au milieu d'une
   page est pire qu'une annonce. Une fois demande, chaque emplacement est donc
   surveille : si rien n'y est apparu au bout de DELAI_VIDE, il se replie.
   Jamais sous les yeux de la personne : un bloc qui disparait dans l'ecran
   fait sauter le texte, et ce saut compte dans le decalage cumule que Google
   mesure. Le repli attend que l'emplacement soit sorti de l'ecran (au-dessus,
   l'ancrage de defilement du navigateur compense ; en dessous, rien de
   visible ne bouge). Si la regie sert finalement quelque chose apres coup,
   l'emplacement se rouvre selon la meme regle.

   ── Le moment du depart ──────────────────────────────────────────────
   Rien ne part avant l'evenement load : tant que la page charge, la feuille
   de style, les scripts et l'image de tete se partagent une connexion mobile
   qui n'a pas de place pour 600 Ko de regie, et PageSpeed mesurait cette
   concurrence dans le LCP. Une fois la page affichee, les emplacements
   proches de l'ecran sont demandes tout de suite ; l'annonce arrive une
   seconde plus tard qu'avant, sur une page deja lisible.

   Le double skyrail vit dans les gouttieres a cote du contenu : il n'a de
   sens qu'a partir de 1024 px de large. Sur un telephone, il ne s'affiche
   jamais, mais son seul appel chargeait toute la chaine de la regie (encheres,
   synchronisations, 3 s de processeur sur un Moto G) sur chaque page. Il
   n'est donc demande que si la fenetre est assez large, et se pose quand
   elle le devient.

   ── L'interstitiel ───────────────────────────────────────────────────
   Son div est pose vide dans la page, ses scripts partent d'ordinaire au
   moment ou l'ecran de resultat s'affiche (resultat-url.js). La regie decrit
   pourtant son interstitiel comme un format qui « s'affiche a l'ouverture de
   la page ». Quand la personne arrive d'une autre page du site, on le pose
   donc des le depart, comme les autres formats : c'est la navigation interne
   que Google tolere pour ce genre de format, et c'est le moment que la regie
   attend. Quelqu'un qui arrive de l'exterieur garde l'ancien declencheur, au
   resultat. Le drapeau data-pub-posee est partage par les deux scripts pour
   qu'un interstitiel ne soit jamais demande deux fois.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  // Les formats qui se placent tout seuls, hors du flux (le double skyrail,
  // dans les gouttieres) : la position de leur div dans le document ne dit
  // rien de leur visibilite, on les demande des le depart.
  var HORS_FLUX = { '4': true };
  // La largeur a partir de laquelle un format hors flux a une gouttiere ou
  // se poser.
  var LARGEUR_HORS_FLUX = '(min-width: 1024px)';

  // La distance a laquelle un emplacement est demande avant d'entrer dans
  // l'ecran : une hauteur d'ecran, le temps pour la regie de repondre.
  var MARGE = '800px 0px';

  // Le temps laisse a la regie pour remplir un emplacement demande, avant de
  // le considerer vide. Leurs encheres prennent une a trois secondes ; huit
  // laissent de la marge aux connexions lentes.
  var DELAI_VIDE = 8000;
  var PAS_SURVEILLANCE = 500;

  function injecte(cible, format, site) {
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

  function pose(hote) {
    if (hote.getAttribute('data-pub-posee')) return;
    var format = hote.getAttribute('data-pub-differee');
    var site = hote.getAttribute('data-pub-site');
    if (!format || !site) return;
    hote.setAttribute('data-pub-posee', '1');
    var cible = hote.firstElementChild || hote;
    injecte(cible, format, site);
    if (!HORS_FLUX[format]) surveilleRemplissage(hote, cible);
  }

  // ── Rempli ou vide ? ─────────────────────────────────────────────────
  // Une annonce servie laisse toujours une boite visible dans le div de
  // l'emplacement : un cadre, une image, une video, ou le conteneur que la
  // regie construit autour. Les balises script, elles, n'ont pas de boite.
  function estRempli(cible) {
    var enfants = cible.querySelectorAll('*');
    for (var i = 0; i < enfants.length; i++) {
      var e = enfants[i];
      if (e.tagName === 'SCRIPT' || e.tagName === 'STYLE' || e.tagName === 'LINK') continue;
      if (e.offsetWidth > 20 && e.offsetHeight > 20) return true;
    }
    return false;
  }

  function horsEcran(hote) {
    var r = hote.getBoundingClientRect();
    return r.bottom <= 0 || r.top >= window.innerHeight;
  }

  // Applique un changement de mise en page a l'emplacement quand il n'est pas
  // a l'ecran : tout de suite s'il est deja hors champ, sinon a sa sortie.
  function quandHorsEcran(hote, action) {
    if (horsEcran(hote)) { action(); return; }
    if (!('IntersectionObserver' in window)) return;
    var obs = new IntersectionObserver(function (entrees) {
      for (var i = 0; i < entrees.length; i++) {
        if (entrees[i].isIntersecting) continue;
        obs.disconnect();
        action();
        return;
      }
    });
    obs.observe(hote);
  }

  function surveilleRemplissage(hote, cible) {
    var debut = Date.now();
    var minuteur = null;

    function verifie() {
      if (estRempli(cible)) {
        hote.setAttribute('data-pub-remplie', '1');
        if (hote.classList.contains('pub--vide')) {
          quandHorsEcran(hote, function () { hote.classList.remove('pub--vide'); });
        }
        return true;
      }
      return false;
    }

    function boucle() {
      if (verifie()) return;
      if (Date.now() - debut >= DELAI_VIDE) {
        quandHorsEcran(hote, function () {
          // Derniere verification a l'instant du repli : la regie a pu servir
          // entre-temps.
          if (!verifie()) hote.classList.add('pub--vide');
        });
        return;
      }
      minuteur = setTimeout(boucle, PAS_SURVEILLANCE);
    }
    minuteur = setTimeout(boucle, PAS_SURVEILLANCE);

    // Une annonce qui arrive apres le repli rouvre l'emplacement.
    if ('MutationObserver' in window) {
      var mo = new MutationObserver(function () {
        if (hote.classList.contains('pub--vide') && verifie()) mo.disconnect();
      });
      mo.observe(cible, { childList: true, subtree: true });
    }
  }

  // ── L'interstitiel a l'arrivee depuis une autre page du site ─────────
  function arriveeInterne() {
    var ref = document.referrer || '';
    if (!ref || ref.indexOf(location.origin + '/') !== 0) return false;
    try {
      var u = new URL(ref);
      return u.pathname !== location.pathname;
    } catch (e) { return false; }
  }

  function poseInterstitielSiInterne() {
    var hote = document.querySelector('[data-pub-au-resultat]:not([data-pub-posee])');
    if (!hote || !arriveeInterne()) return;
    var format = hote.getAttribute('data-pub-au-resultat');
    var site = hote.getAttribute('data-pub-site');
    if (!format || !site) return;
    hote.setAttribute('data-pub-posee', '1');
    injecte(hote.firstElementChild || hote, format, site);
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

  // Un format hors flux n'est demande que sur une fenetre assez large. Si
  // elle s'elargit plus tard (fenetre de bureau redimensionnee), il part a ce
  // moment-la, une seule fois.
  function poseHorsFlux(liste) {
    if (!liste.length) return;
    var media = window.matchMedia ? window.matchMedia(LARGEUR_HORS_FLUX) : null;
    function poseTous() {
      for (var i = 0; i < liste.length; i++) { try { pose(liste[i]); } catch (e) {} }
    }
    if (!media || media.matches) { poseTous(); return; }
    var surChangement = function (e) {
      if (!e.matches) return;
      if (media.removeEventListener) media.removeEventListener('change', surChangement);
      else if (media.removeListener) media.removeListener(surChangement);
      poseTous();
    };
    if (media.addEventListener) media.addEventListener('change', surChangement);
    else if (media.addListener) media.addListener(surChangement);
  }

  function demarre() {
    try { poseInterstitielSiInterne(); } catch (e) {}
    var tous = document.querySelectorAll('[data-pub-differee]:not([data-pub-posee])');
    var dansLeFlux = [];
    var horsFlux = [];
    for (var i = 0; i < tous.length; i++) {
      if (HORS_FLUX[tous[i].getAttribute('data-pub-differee')]) horsFlux.push(tous[i]);
      else dansLeFlux.push(tous[i]);
    }
    try { poseHorsFlux(horsFlux); } catch (e) {}
    if (!dansLeFlux.length) return;
    if ('IntersectionObserver' in window) surveille(dansLeFlux);
    else repli(dansLeFlux);
  }

  // Au chargement complet de la page, jamais avant (voir en tete).
  if (document.readyState === 'complete') {
    demarre();
  } else {
    window.addEventListener('load', demarre, { once: true });
  }
})();
