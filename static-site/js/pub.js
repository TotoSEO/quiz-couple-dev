/* ═══════════════════════════════════════════════════════════════════
   LES EMPLACEMENTS DE LA REGIE, CHARGES APRES LE RESTE ET A L'APPROCHE

   Le tag de la regie est deux balises script posees dans le div de
   l'emplacement. Telles quelles, elles arretaient l'analyse de la page le
   temps d'un aller-retour vers un domaine tiers : avec cinq emplacements,
   dix arrets, dont six avant le moteur de quiz.

   Les scripts sont donc poses d'ici, une fois le document analyse. La page
   s'affiche et le moteur se lance sans rien devoir a la regie.

   Et un emplacement dans le flux n'est demande que lorsqu'il approche de
   l'ecran, 300 px avant. Chaque emplacement coute trois fichiers a la regie,
   dont un de 270 Ko a analyser ; sur une page de test, trois des quatre sont
   a plus de 2 500 px du haut, et la plupart des visites ne descendent jamais
   jusque la. Les demander au chargement ne servait qu'a ralentir la page,
   PageSpeed les comptait dans le JavaScript inutilise. La marge a longtemps
   ete d'une hauteur d'ecran (800 px) : sur telephone, le billboard pose juste
   sous le moteur etait alors demande des le chargement, compte comme une
   impression, et jamais vu par qui repond au test sans faire defiler la
   page. Une impression servie hors de l'ecran fait baisser la visibilite
   mesuree par la regie, donc les encheres sur tout le domaine.

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
   le premier geste : un defilement, ou un clic dans la page (dans <main>,
   donc ni l'en-tete, ni le menu, ni le bandeau de consentement), la premiere
   reponse a un test par exemple. Le defilement seul laissait sans footer
   tous ceux qui jouent un test en tapant leurs reponses sans jamais faire
   defiler la page, alors que c'est le format le mieux vu sur telephone.
   PageSpeed, qui ne clique pas, ne voit rien de plus. Les autres
   emplacements sont demandes a l'approche comme avant.
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

   ── Pas de rafraichissement hors de la vue ────────────────────────────
   La regie recharge chaque emplacement a intervalle regulier, a l'ecran
   comme hors de l'ecran, et jusque dans un onglet passe en arriere-plan.
   On ne la laisse rafraichir qu'un emplacement vu, dans un onglet affiche,
   et seulement apres un delai complet passe sous les yeux de la personne
   (voir brideRafraichissement).

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
  // l'ecran. Une a trois secondes de reponse pour la regie, le temps de
  // faire defiler 300 px au doigt ; une hauteur d'ecran faisait servir le
  // billboard sous le moteur a des gens qui ne descendaient jamais jusqu'a lui.
  var MARGE = '300px 0px';

  // Le temps laisse a la regie pour remplir un emplacement demande, avant de
  // le considerer vide. Leurs encheres prennent une a trois secondes ; huit
  // laissent de la marge aux connexions lentes.
  var DELAI_VIDE = 8000;
  var PAS_SURVEILLANCE = 500;

  // A l'evenement load, la mise en page n'est pas finie : le moteur dessine
  // son premier ecran une fois ses textes recus, et pousse de plusieurs
  // centaines de pixels les emplacements qui le suivent. Mesures a cet
  // instant, le billboard sous le moteur paraissait a portee de l'ecran et
  // etait demande, puis repousse hors de vue : une impression servie pour
  // personne. On laisse donc la page se poser avant de regarder ou sont les
  // emplacements du flux. Le footer, l'interstitiel et le premier geste ne
  // dependent pas de la mise en page et n'attendent pas.
  var ATTENTE_MISE_EN_PAGE = 800;

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
    rapatrie(hote, format);
    injecte(cible, format, site);
    if (!HORS_FLUX[format]) surveilleRemplissage(hote, cible);
    else if (format === FORMAT_FOOTER) surveilleFooter(hote);
  }

  // ── L'annonce reste dans son emplacement ────────────────────────────
  // Sur telephone, le script du pave (format 2) ignore le div qu'on lui
  // prepare : il prend tous les <p> de la page, regarde ceux qui tombent
  // entre 10 % et 20 % de la liste, et glisse son conteneur (sas_26300) dans
  // le plus long ; avec moins de cinq paragraphes, dans le div a 10 % de la
  // liste des div. C'est un reglage de leur cote (« 2 == 2 && 1 == 1 &&
  // deviceType == 0 » dans leur script). Mesure le 6 octobre 2026 : au
  // resultat d'un test, l'annonce atterrissait dans le texte, 1 500 a
  // 2 400 px sous l'ecran, jamais vue ; et notre encart, reste blanc, se
  // repliait huit secondes plus tard, ce qui faisait sauter la page.
  //
  // Leur script cree le conteneur et l'insere d'un seul tenant, puis attend
  // les encheres (une a trois secondes) avant de rendre l'annonce dedans, en
  // le retrouvant par son identifiant. Un MutationObserver pose avant
  // l'injection voit l'insertion dans la microtache qui suit, et ramene le
  // conteneur dans notre encart avant tout rendu. Un conteneur qui porte deja
  // un cadre n'est jamais deplace : le deplacer rechargerait l'annonce.
  // L'observateur de visibilite de la regie suit l'element lui-meme, il
  // continue donc de le suivre a sa nouvelle place.
  var CONTENEURS = { '2': 'sas_26300', '31': 'sas_39287' };
  var DUREE_RAPATRIEMENT = 15000;

  function rapatrie(hote, format) {
    var id = CONTENEURS[format];
    if (!id || !('MutationObserver' in window)) return;
    var cible = hote.firstElementChild || hote;
    var mo = new MutationObserver(function () {
      var el = document.getElementById(id);
      if (!el) return;
      mo.disconnect();
      if (hote.contains(el) || el.querySelector('iframe')) return;
      var ancien = el.parentElement;
      cible.appendChild(el);
      if (ancien && ancien.classList) ancien.classList.remove('aBigClassNameToAvoidCollision' + format);
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(function () { mo.disconnect(); }, DUREE_RAPATRIEMENT);
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

  // Le premier element qui suit l'emplacement dans le document : c'est sa
  // position qui dit de combien le contenu a bouge.
  function elementSuivant(n) {
    while (n && n !== document.body) {
      if (n.nextElementSibling) return n.nextElementSibling;
      n = n.parentElement;
    }
    return null;
  }

  // Applique le changement de hauteur sans que rien ne bouge sous les yeux.
  // En dessous de l'ecran, il n'y a rien a faire : seul ce qui suit bouge,
  // et rien de ce qui suit n'est visible. Au-dessus, tout ce qu'on lit
  // remonterait de 250 px. Chrome compense tout seul (ancrage du
  // defilement), Safari non : un iPhone voyait la page sauter. On coupe donc
  // l'ancrage le temps du changement, on mesure de combien le contenu a
  // bouge, et on fait defiler d'autant, ce qui donne le meme resultat
  // partout. Lecture, ecriture, lecture : une seule mise en page forcee.
  function sansSaut(hote, action) {
    var r = hote.getBoundingClientRect();
    var repere = r.bottom <= 0 ? elementSuivant(hote) : null;
    if (!repere) { action(); return; }
    var racine = document.documentElement, corps = document.body;
    var avant = repere.getBoundingClientRect().top;
    var ancrages = [racine.style.overflowAnchor, corps.style.overflowAnchor];
    racine.style.overflowAnchor = 'none';
    corps.style.overflowAnchor = 'none';
    action();
    var decalage = repere.getBoundingClientRect().top - avant;
    if (decalage) window.scrollBy(0, decalage);
    window.requestAnimationFrame(function () {
      racine.style.overflowAnchor = ancrages[0];
      corps.style.overflowAnchor = ancrages[1];
    });
  }

  // Applique un changement de mise en page a l'emplacement quand il n'est pas
  // a l'ecran : tout de suite s'il est deja hors champ, sinon a sa sortie.
  // Jamais sous les yeux de la personne, et sans saut (sansSaut).
  function quandHorsEcran(hote, action) {
    function applique() { sansSaut(hote, action); }
    if (horsEcran(hote)) { applique(); return; }
    if (!('IntersectionObserver' in window)) return;
    var obs = new IntersectionObserver(function (entrees) {
      for (var i = 0; i < entrees.length; i++) {
        if (entrees[i].isIntersecting) continue;
        obs.disconnect();
        applique();
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

  // ── Le premier geste ────────────────────────────────────────────────
  // Appelle fn une seule fois, au premier geste reel dans la page : un
  // defilement, ou un clic dans <main> (une reponse a un test, « Commencer »,
  // un lien du texte). Un clic dans l'en-tete, le menu ou le bandeau de
  // consentement, qui vivent hors de <main>, n'en est pas un : on n'a rien
  // lu ni rien joue. Le clic est ecoute en phase de capture, parce que les
  // moteurs arretent parfois la propagation de leurs propres clics. Une page
  // rechargee a mi-hauteur a deja defile : l'appel part tout de suite.
  function auPremierGeste(fn) {
    var fait = false;
    function declenche() {
      if (fait) return;
      fait = true;
      window.removeEventListener('scroll', surDefilement);
      document.removeEventListener('click', surClic, true);
      fn();
    }
    function surDefilement() {
      if ((window.scrollY || document.documentElement.scrollTop || 0) > 0) declenche();
    }
    function surClic(e) {
      var cible = e.target;
      if (!cible || !cible.closest) return;
      if (!cible.closest('main')) return;
      declenche();
    }
    if ((window.scrollY || document.documentElement.scrollTop || 0) > 0) { declenche(); return; }
    window.addEventListener('scroll', surDefilement, { passive: true });
    document.addEventListener('click', surClic, true);
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

  // ── Pas de rafraichissement hors de la vue ──────────────────────────
  // La regie recharge chaque emplacement a intervalle regulier, meme quand il
  // n'est pas a l'ecran : un delai « visible » (18,5 s pour le pave, 19,5 s
  // pour le billboard, 25 s pour le footer) et un delai « invisible » (37,
  // 60 et 45 s), jusqu'a cinquante fois par page. Une page de resultat reste
  // souvent ouverte : le pave remonte dans le resultat produisait alors une
  // impression toutes les 37 s, hors de vue, vendue presque rien. Ces
  // impressions comptent comme monetisables, mais elles font chuter la
  // visibilite mesuree, et le CPM du domaine avec elle (0,30 a 0,20 € du 1er au
  // 4 octobre 2026).
  //
  // La premiere parade, en septembre 2026, posait vide la table des delais
  // « invisibles » de l'objet tmzrToolbox avant le premier script de la
  // regie. Elle n'a jamais eu d'effet : leur script lit bien la table, puis
  // ecrase la valeur en dur a la ligne suivante (« invisibleRefreshRate =
  // 37000 »). Et pour certains encherisseurs dits lents (teads, sharethrough,
  // richaudience...), il ignore meme ce delai et en prend un fixe de 30 a
  // 60 s, visible ou non.
  //
  // Le seul point de passage commun est la boucle qui decide : toutes les
  // deux secondes, pour chaque unite de window.tmzrLocalToolbox.adUnits,
  // elle rafraichit si « refreshTimer + delai < maintenant ». On remplace
  // donc refreshTimer, sur chaque unite, par une propriete calculee : tant
  // que l'unite est hors de vue (isVisible, que la regie tient a jour avec
  // son propre IntersectionObserver, au-dela de 50 % visible) ou que
  // l'onglet est cache, elle vaut « maintenant », et la condition ne peut
  // jamais etre vraie, quel que soit le delai. Une fois l'unite revenue sous
  // les yeux, elle vaut l'instant de ce retour : le rafraichissement
  // n'arrive qu'apres un delai visible complet. La regie ecrit refreshTimer a
  // chaque rafraichissement ; l'ecriture est conservee telle quelle.
  //
  // Les unites forcees visibles par la regie (forceVisibility, des formats
  // que nous ne posons pas) gardent leur rythme, onglet cache excepte.
  // Les unites apparaissent au fil des demandes, et la regie peut en
  // recreer une : le registre est relu chaque seconde, chaque objet n'est
  // traite qu'une fois. Si la regie change la structure de son script, le
  // pire cas est que ceci n'ait plus d'effet ; aucune erreur ne remonte.
  var PAS_BRIDE = 1000;
  var unitesBridees = [];   // objets deja traites, quelques-uns par page

  // Le footer est un cas a part. Son annonce s'affiche dans un bandeau fixe
  // que la regie ajoute en fin de body (sas_iframe_fixed_26328), mais son
  // observateur de visibilite suit le conteneur sas_26328, pose dans notre
  // ancre du bas de page, de hauteur nulle, et qu'elle masque elle-meme au
  // rendu. Pour elle, le footer est donc toujours « hors de vue » : il se
  // rafraichissait au delai invisible (45 s) alors qu'il est sous les yeux en
  // permanence. Sa visibilite est donc lue sur le bandeau lui-meme : affiche,
  // ni masque par la limite des 30 % (data-pub-trop-haut), ni ferme. Le
  // rythme reste celui que la regie lui donne, 45 s.
  var UNITE_FOOTER = 26328;

  function footerAffiche() {
    var liste = document.querySelectorAll('[id^="sas_iframe_fixed_' + UNITE_FOOTER + '"]');
    for (var i = 0; i < liste.length; i++) {
      var e = liste[i];
      if (e.hasAttribute('data-pub-trop-haut')) continue;
      if (e.offsetWidth > 0 && e.offsetHeight > 0 && !estUnVoile(e)) return true;
    }
    return false;
  }

  function bloquee(u) {
    if (document.visibilityState === 'hidden') return true;
    if (u.forceVisibility === true) return false;
    if (Number(u.formatId) === UNITE_FOOTER) return !footerAffiche();
    return u.isVisible !== true;
  }

  function brideUnite(u) {
    if (!u || typeof u !== 'object' || unitesBridees.indexOf(u) !== -1) return;
    unitesBridees.push(u);
    var minuteur = typeof u.refreshTimer === 'number' ? u.refreshTimer : Date.now();
    // L'instant ou l'unite a ete vue bloquee pour la derniere fois.
    var dernierBlocage = 0;
    try {
      Object.defineProperty(u, 'refreshTimer', {
        configurable: true,
        enumerable: true,
        get: function () {
          var maintenant = Date.now();
          if (bloquee(u)) { dernierBlocage = maintenant; return maintenant; }
          return Math.max(minuteur, dernierBlocage);
        },
        set: function (v) { minuteur = v; }
      });
      // Au retour sur un onglet cache, la boucle de la regie, ralentie en
      // arriere-plan, n'a peut-etre pas relu l'unite depuis une minute : le
      // retour compte comme le dernier blocage.
      u.__qcReveil = function () { dernierBlocage = Date.now(); };
    } catch (e) {}
  }

  function brideRafraichissement() {
    function passe() {
      var registre;
      try { registre = window.tmzrLocalToolbox && window.tmzrLocalToolbox.adUnits; } catch (e) { return; }
      if (!registre || typeof registre !== 'object') return;
      var cles = Object.keys(registre);
      for (var i = 0; i < cles.length; i++) {
        try { brideUnite(registre[cles[i]]); } catch (e) {}
      }
    }
    passe();
    setInterval(passe, PAS_BRIDE);
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState !== 'visible') return;
      for (var i = 0; i < unitesBridees.length; i++) {
        try { if (typeof unitesBridees[i].__qcReveil === 'function') unitesBridees[i].__qcReveil(); } catch (e) {}
      }
    });
  }

  function demarre() {
    if (document.querySelector('[data-pub-differee], [data-pub-au-resultat]')) {
      try { brideRafraichissement(); } catch (e) {}
    }
    try { interstitielDeNavigation(); } catch (e) {}
    var tous = document.querySelectorAll('[data-pub-differee]:not([data-pub-posee])');
    var dansLeFlux = [];
    var horsFlux = [];
    for (var i = 0; i < tous.length; i++) {
      var h = tous[i];
      (HORS_FLUX[h.getAttribute('data-pub-differee')] ? horsFlux : dansLeFlux).push(h);
    }
    if (!dansLeFlux.length && !horsFlux.length) return;

    // Les emplacements du premier ecran attendent le premier geste ; la liste
    // n'est connue qu'une fois la mise en page posee (ci-dessous). Si le geste
    // vient avant, elle est vide ici, et ces emplacements partiront a
    // l'approche comme les autres.
    var gesteFait = false;
    var premierEcran = [];
    auPremierGeste(function () {
      gesteFait = true;
      try { poseHorsFlux(horsFlux); } catch (e) {}
      lance(premierEcran);
    });

    setTimeout(function () {
      var plusBas = [];   // sous la ligne de flottaison : a l'approche
      for (var j = 0; j < dansLeFlux.length; j++) {
        var e = dansLeFlux[j];
        if (e.getAttribute('data-pub-posee')) continue;
        var visible = false;
        try { visible = dansLePremierEcran(e); } catch (x) {}
        (visible && !gesteFait ? premierEcran : plusBas).push(e);
      }
      lance(plusBas);
    }, ATTENTE_MISE_EN_PAGE);
  }

  // Au chargement complet de la page, jamais avant (voir en tete).
  if (document.readyState === 'complete') {
    demarre();
  } else {
    window.addEventListener('load', demarre, { once: true });
  }
})();
