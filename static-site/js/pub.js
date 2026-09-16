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

   ── Rien au-dessus de la ligne de flottaison ─────────────────────────
   Aucune publicite ne doit etre visible dans le premier ecran, avant que la
   personne ait bouge. Les emplacements qui tombent dans le premier ecran au
   chargement, et le footer qui se colle en bas de la fenetre, attendent donc
   le premier defilement ; les autres sont demandes a l'approche comme avant.
   L'interstitiel ne part jamais a l'arrivee depuis l'exterieur : un
   interstitiel a l'ouverture, pour quelqu'un qui vient de la recherche,
   c'est exactement ce que Google sanctionne. Il part a l'ecran de resultat
   (resultat-url.js), sur le geste de la personne, ou a l'arrivee depuis une
   autre page du site (ci-dessous).

   ── L'interstitiel de navigation ──────────────────────────────────────
   Un interstitiel est fait pour s'afficher entre deux pages : c'est ainsi que
   Google definit et sert le sien, sur le clic d'un lien interne, jamais sur
   une arrivee depuis les resultats de recherche. On fait pareil. Quand la
   page precedente est une page du site (referrer de meme origine), le div de
   l'interstitiel est demande au chargement complet, comme les autres
   emplacements. Trois exclusions : une adresse qui porte deja le resultat
   (c'est resultat-url.js qui gere), une arrivee par un lien de partie a
   distance (la personne vient rejoindre quelqu'un), et une page sans div.

   Et un plafond de frequence, le notre, en plus de celui de la regie : au
   plus un interstitiel de navigation toutes les INTERVALLE_INTERSTITIEL, la
   date du dernier interstitiel affiche (navigation ou resultat) etant gardee
   dans localStorage sous CLE_INTERSTITIEL. La cle est ecrite deux fois, ici
   et dans resultat-url.js, parce que les deux fichiers ne se chargent pas
   toujours ensemble : une modification dans l'un en appelle une dans
   l'autre. Sans stockage (navigation privee stricte), pas de plafond
   possible, donc pas d'interstitiel de navigation.

   Sur une page ou l'interstitiel a ete pose a l'arrivee, l'ecran de resultat
   n'en redemande pas : le drapeau data-pub-posee est partage, et la regie
   n'en sert de toute facon qu'un par page.

   ── Le footer ────────────────────────────────────────────────────────
   Le footer (format 6) est le seul format hors flux : son div n'est qu'un
   point d'ancrage, le script de la regie ajoute lui-meme en fin de body un
   conteneur en position fixe, colle en bas de la fenetre (728x90 sur
   ordinateur, 320x50 ou 320x100 sur telephone), ou, quand l'enchere gagnante
   est un 300x250, un « slide-in » colle au bord droit a mi-hauteur. Une fois
   pose, on le surveille, pour deux raisons.

   Le standard Better Ads, que Chrome applique en filtrant les annonces des
   sites qui le violent, tolere un collant jusqu'a 30 % de la hauteur de
   l'ecran. Un bandeau de 90 px passe partout ; un 300x250 depasse la limite
   sur presque tous les telephones. Tout element fixe pose par la regie pour
   ce format qui depasse la limite recoit data-pub-trop-haut, que styles.css
   masque. La mesure est refaite quand la fenetre change de taille.

   Et un bandeau colle en bas de la fenetre recouvre ce qui s'y trouve : le
   dernier choix de reponse, le bouton d'un encart, les liens du pied de page.
   Tant qu'il est la, sa hauteur est posee dans --pub-footer sur l'element
   racine, que styles.css ajoute en bas du body : tout peut de nouveau etre
   amene au-dessus du bandeau en defilant. Quand la personne le ferme (la
   regie retire l'element), la variable est retiree.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  // Les formats qui se placent tout seuls, hors du flux (le footer, colle en
  // bas de la fenetre) : la position de leur div dans le document ne dit rien
  // de leur visibilite, on les demande au premier defilement, sans attendre
  // qu'ils approchent de l'ecran.
  var HORS_FLUX = { '6': true };
  var FORMAT_FOOTER = '6';
  // La part de la hauteur de l'ecran qu'un element fixe de la regie peut
  // occuper (standard Better Ads).
  var PART_MAX_FIXE = 0.30;

  // L'interstitiel de navigation : la cle du dernier affichage dans
  // localStorage (ecrite aussi par resultat-url.js) et l'intervalle minimal
  // entre deux interstitiels de navigation.
  var CLE_INTERSTITIEL = 'qc-interstitiel';
  var INTERVALLE_INTERSTITIEL = 10 * 60 * 1000;

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
    else if (format === FORMAT_FOOTER) surveilleFooter(hote);
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

  // ── Le premier defilement ───────────────────────────────────────────
  // Appelle fn une seule fois, au premier defilement reel de la page. Une
  // page rechargee a mi-hauteur a deja defile : l'appel part tout de suite.
  function auPremierDefilement(fn) {
    var fait = false;
    function declenche() {
      if (fait) return;
      fait = true;
      window.removeEventListener('scroll', surDefilement);
      fn();
    }
    function surDefilement() {
      if ((window.scrollY || document.documentElement.scrollTop || 0) > 0) declenche();
    }
    if ((window.scrollY || document.documentElement.scrollTop || 0) > 0) { declenche(); return; }
    window.addEventListener('scroll', surDefilement, { passive: true });
  }

  // Un emplacement est « dans le premier ecran » si son haut est au-dessus du
  // bas de la fenetre au moment du chargement, sans avoir defile.
  function dansLePremierEcran(hote) {
    var r = hote.getBoundingClientRect();
    return r.top < window.innerHeight && r.bottom > 0;
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

  // Les formats hors flux partent tous ensemble, quelle que soit la taille de
  // la fenetre : le footer a sa place en bas de n'importe quel ecran, et ce
  // qui serait trop haut pour l'ecran est ecarte apres coup (surveilleFooter).
  function poseHorsFlux(liste) {
    for (var i = 0; i < liste.length; i++) { try { pose(liste[i]); } catch (e) {} }
  }

  // ── Le footer : la limite des 30 % et le bas de page degage ─────────
  // Les elements fixes que la regie pose pour ce format : ceux qu'elle ajoute
  // en fin de body (le bandeau, le slide-in, la variante a deux bandeaux), et
  // ce qu'elle a pu mettre en position fixe dans notre propre div.
  //
  // Le conteneur de l'interstitiel porte le meme prefixe (sas_iframe_fixed_
  // suivi du numero de l'unite), et c'est un voile qui couvre tout l'ecran :
  // 100vw sur 100vh, fond assombri, la creation centree dedans avec sa croix.
  // Il ne doit jamais etre retenu ici. Retenu, il depassait forcement les
  // 30 % et se retrouvait masque, croix comprise, pendant que la regie
  // laissait son overflow:hidden sur le body : une page qu'on ne pouvait
  // plus faire defiler ni cliquer, sans rien de visible a fermer. Un
  // element fixe qui couvre presque tout l'ecran n'est pas un bandeau.
  var PART_VOILE = 0.9;
  function estUnVoile(e) {
    var r = e.getBoundingClientRect();
    return r.width >= PART_VOILE * window.innerWidth && r.height >= PART_VOILE * window.innerHeight;
  }

  function elementsFixesDuFooter(hote) {
    var trouves = [];
    var candidats = document.querySelectorAll('body > [id^="sas_iframe_fixed_"], body > [id^="sas-container_"]');
    var i;
    for (i = 0; i < candidats.length; i++) {
      if (!estUnVoile(candidats[i])) trouves.push(candidats[i]);
    }
    var dedans = hote.querySelectorAll('*');
    for (i = 0; i < dedans.length; i++) {
      var e = dedans[i];
      if (e.tagName === 'SCRIPT' || e.tagName === 'STYLE') continue;
      if (getComputedStyle(e).position === 'fixed' && !estUnVoile(e)) trouves.push(e);
    }
    return trouves;
  }

  function surveilleFooter(hote) {
    if (!('MutationObserver' in window)) return;
    var racine = document.documentElement;
    var prevu = false;

    function mesure() {
      prevu = false;
      var hauteurEcran = window.innerHeight;
      var basCouvert = 0;
      var liste = elementsFixesDuFooter(hote);
      // Toutes les lectures d'abord, les ecritures ensuite : une lecture de
      // geometrie apres une ecriture force une mise en page complete.
      var lectures = [];
      for (var i = 0; i < liste.length; i++) {
        var e = liste[i];
        var retenue = parseFloat(e.getAttribute('data-pub-hauteur') || '');
        var r = e.getBoundingClientRect();
        var enfant = e.firstElementChild;
        var h = r.height;
        var haut = r.top;
        // La regie cale la creation en bas d'un conteneur de 90 px : une
        // creation de 100 px en deborde par le haut. C'est la boite la plus
        // haute des deux qui compte.
        if (enfant && enfant.tagName !== 'SCRIPT') {
          var re = enfant.getBoundingClientRect();
          if (re.height > 0) { h = Math.max(h, re.height); haut = Math.min(haut, re.top); }
        }
        // Un element qu'on a masque n'a plus de hauteur : on garde celle
        // mesuree la premiere fois, pour pouvoir le remontrer si la fenetre
        // grandit.
        if (!(h > 0) && retenue > 0) h = retenue;
        lectures.push({ e: e, h: h, r: r, haut: haut, retenue: retenue });
      }
      for (var j = 0; j < lectures.length; j++) {
        var l = lectures[j];
        if (!(l.h > 0)) continue;
        if (!(l.retenue > 0)) l.e.setAttribute('data-pub-hauteur', String(Math.round(l.h)));
        var tropHaut = l.h > PART_MAX_FIXE * hauteurEcran;
        if (tropHaut) {
          if (!l.e.hasAttribute('data-pub-trop-haut')) l.e.setAttribute('data-pub-trop-haut', '1');
          continue;
        }
        if (l.e.hasAttribute('data-pub-trop-haut')) l.e.removeAttribute('data-pub-trop-haut');
        // Colle en bas de la fenetre : c'est de cette hauteur qu'il faut
        // degager le bas de la page. Le slide-in, a mi-hauteur, ne cache
        // rien de ce qu'on pourrait faire defiler.
        if (l.r.height > 0 && l.r.bottom >= hauteurEcran - 2 && l.haut > hauteurEcran / 2) {
          basCouvert = Math.max(basCouvert, hauteurEcran - l.haut);
        }
      }
      var voulu = basCouvert > 0 ? Math.ceil(basCouvert) + 'px' : '';
      if (racine.style.getPropertyValue('--pub-footer') !== voulu) {
        if (voulu) racine.style.setProperty('--pub-footer', voulu);
        else racine.style.removeProperty('--pub-footer');
      }
    }

    function planifie() {
      if (prevu) return;
      prevu = true;
      window.requestAnimationFrame(mesure);
    }

    // La regie ajoute et retire ses conteneurs en fin de body ; dans notre
    // div, elle peut passer un element en position fixe par son style.
    new MutationObserver(planifie).observe(document.body, { childList: true });
    new MutationObserver(planifie).observe(hote, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });
    window.addEventListener('resize', planifie, { passive: true });
    if ('ResizeObserver' in window) {
      // La hauteur d'un conteneur change quand l'annonce est remplacee.
      var ro = new ResizeObserver(planifie);
      new MutationObserver(function () {
        var liste = elementsFixesDuFooter(hote);
        for (var i = 0; i < liste.length; i++) ro.observe(liste[i]);
      }).observe(document.body, { childList: true });
    }
  }

  function lance(liste) {
    if (!liste.length) return;
    if ('IntersectionObserver' in window) surveille(liste);
    else repli(liste);
  }

  // ── L'interstitiel de navigation ────────────────────────────────────
  function vientDuSite() {
    var ref = document.referrer;
    if (!ref) return false;
    try { return new URL(ref).origin === window.location.origin; }
    catch (e) { return false; }
  }

  function dernierInterstitiel() {
    try {
      var v = window.localStorage.getItem(CLE_INTERSTITIEL);
      return v ? (parseInt(v, 10) || 0) : 0;
    } catch (e) { return -1; }   // pas de stockage : on ne saura pas plafonner
  }

  function noteInterstitiel() {
    try { window.localStorage.setItem(CLE_INTERSTITIEL, String(Date.now())); } catch (e) {}
  }

  function interstitielDeNavigation() {
    var hote = document.querySelector('[data-pub-au-resultat]:not([data-pub-posee])');
    if (!hote) return;
    var recherche = window.location.search || '';
    if (/[?&](resultat|salon)(=|&|$)/.test(recherche)) return;
    if (!vientDuSite()) return;
    var dernier = dernierInterstitiel();
    if (dernier < 0) return;
    if (dernier && Date.now() - dernier < INTERVALLE_INTERSTITIEL) return;
    var format = hote.getAttribute('data-pub-au-resultat');
    var site = hote.getAttribute('data-pub-site');
    if (!format || !site) return;
    hote.setAttribute('data-pub-posee', '1');
    hote.setAttribute('data-pub-navigation', '1');
    noteInterstitiel();
    injecte(hote.firstElementChild || hote, format, site);
  }

  function demarre() {
    try { interstitielDeNavigation(); } catch (e) {}
    var tous = document.querySelectorAll('[data-pub-differee]:not([data-pub-posee])');
    var plusBas = [];       // sous la ligne de flottaison : a l'approche, comme avant
    var premierEcran = [];  // dans le premier ecran : apres le premier defilement
    var horsFlux = [];
    for (var i = 0; i < tous.length; i++) {
      var h = tous[i];
      if (HORS_FLUX[h.getAttribute('data-pub-differee')]) { horsFlux.push(h); continue; }
      var visible = false;
      try { visible = dansLePremierEcran(h); } catch (e) {}
      (visible ? premierEcran : plusBas).push(h);
    }
    lance(plusBas);
    if (horsFlux.length || premierEcran.length) {
      auPremierDefilement(function () {
        try { poseHorsFlux(horsFlux); } catch (e) {}
        lance(premierEcran);
      });
    }
  }

  // Au chargement complet de la page, jamais avant (voir en tete).
  if (document.readyState === 'complete') {
    demarre();
  } else {
    window.addEventListener('load', demarre, { once: true });
  }
})();
