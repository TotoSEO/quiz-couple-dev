/**
 * En-tête à deux niveaux : état collé, menu mobile plein écran, ses
 * panneaux de famille et ses mouvements, panneaux du bureau.
 */
(function() {
  var entete = document.getElementById('site-header');

  // ── État collé ──────────────────────────────────────────
  // Sur bureau, est-collee fait glisser l'en-tête d'un niveau vers le haut
  // (par transform, jamais par la hauteur : voir styles.css). L'hystérésis
  // évite le battement autour du seuil, et le décollage se fait avant 56 px :
  // en dessous, la bande translatée (52 px) laisserait entrevoir un vide
  // entre l'en-tête et le début de la page en remontant.
  if (entete) {
    var collee = false;
    var pose = function(v) {
      if (v === collee) return;
      collee = v;
      entete.classList.toggle('est-collee', v);
    };
    var poserEtat = function() {
      var y = window.scrollY || document.documentElement.scrollTop || 0;
      if (!collee && y > 96) pose(true);
      else if (collee && y < 56) pose(false);
    };
    // L'etat initial ne lit plus la position de defilement : cette lecture,
    // faite juste apres que les autres scripts ont ecrit dans la page,
    // forcait une mise en page complete (434 ms sur le Moto G de PageSpeed).
    // Une sentinelle invisible, posee entre 56 et 96 px du haut du document,
    // est observee a la place : entierement sortie par le haut, l'en-tete se
    // colle ; entierement visible, il se decolle. L'observateur repond apres
    // la mise en page du navigateur, sans jamais la forcer, et donne aussi
    // l'etat initial (page rechargee a mi-hauteur, ancre).
    if ('IntersectionObserver' in window) {
      var sentinelle = document.createElement('div');
      sentinelle.setAttribute('aria-hidden', 'true');
      sentinelle.style.cssText = 'position:absolute;top:56px;left:0;width:1px;height:40px;pointer-events:none;visibility:hidden';
      document.body.appendChild(sentinelle);
      new IntersectionObserver(function(entrees) {
        var e = entrees[entrees.length - 1];
        if (e.boundingClientRect.bottom <= 0) pose(true);
        else if (e.intersectionRatio >= 1) pose(false);
      }, { threshold: [0, 1] }).observe(sentinelle);
    } else {
      window.addEventListener('scroll', poserEtat, { passive: true });
      poserEtat();
    }
  }

  // ── Menu mobile ─────────────────────────────────────────
  // Plein écran sous la rangée du logo (9 novembre 2026) : la page, derrière,
  // ne défile plus tant qu'il est ouvert (html.menu-mobile-ouvert). Il montre
  // d'abord la liste des familles (.mnav-accueil) ; une famille touchée ouvre
  // son panneau (.mnav-panneau), qui prend toute la place, et la flèche de sa
  // barre ramène à la liste, là où on l'avait laissée. Refermer le menu le
  // remet sur la liste.
  //
  // Les mouvements (Thomas, le même soir : « le menu s'affiche immédiatement
  // [...] des petites animations très légères mais qui fluidifient ») : le
  // menu apparaît en fondu, ses cartes montent l'une après l'autre (30 ms
  // d'écart), un panneau arrive de la droite avec ses sections en cascade,
  // l'icône du bouton tourne en passant du burger à la croix, et le menu se
  // referme en fondu avant de disparaître. Transform et opacity seulement,
  // par l'API Web Animations ; rien quand le mouvement est réduit.
  var menuBtn = document.getElementById('mobile-menu-btn');
  var menu = document.getElementById('mobile-menu');
  var accueil = menu ? menu.querySelector('.mnav-accueil') : null;
  var familles = menu ? Array.prototype.slice.call(menu.querySelectorAll('.mnav-famille')) : [];
  var panneaux = menu ? Array.prototype.slice.call(menu.querySelectorAll('.mnav-panneau')) : [];
  var defilementListe = 0;
  var mouvementReduit = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DOUX = 'cubic-bezier(0.22, 1, 0.36, 1)';
  // L'état voulu, qui change dès le geste, même pendant le fondu de fermeture.
  var menuOuvert = false;
  var fermeture = null;

  function anime(el, images, options) {
    if (mouvementReduit || !el || !el.animate) return null;
    try { return el.animate(images, options); } catch (e) { return null; }
  }

  // L'arrivée d'une vue de côté (un panneau, la liste au retour).
  function glisse(el, depuis) {
    anime(el, [
      { transform: 'translateX(' + depuis + 'px)', opacity: 0 },
      { transform: 'none', opacity: 1 }
    ], { duration: 260, easing: DOUX });
  }

  // Les éléments d'une vue montent l'un après l'autre, les huit premiers
  // seulement : les suivants sont sous le bord de l'écran.
  function cascade(els, depart) {
    for (var i = 0; i < els.length && i < 8; i++) {
      anime(els[i], [
        { transform: 'translateY(12px)', opacity: 0 },
        { transform: 'none', opacity: 1 }
      ], { duration: 280, delay: depart + i * 30, easing: DOUX, fill: 'backwards' });
    }
  }

  // La liste : le bouton de l'évaluation, chaque famille, le trait, les tuiles.
  function elementsAccueil() {
    var els = [];
    if (!accueil) return els;
    Array.prototype.forEach.call(accueil.children, function(c) {
      if (c.classList.contains('mnav-familles')) Array.prototype.push.apply(els, c.children);
      else els.push(c);
    });
    return els;
  }

  function panneauOuvert() {
    for (var i = 0; i < panneaux.length; i++) if (!panneaux[i].hidden) return panneaux[i];
    return null;
  }

  function ouvrirFamille(bouton) {
    var panneau = document.getElementById(bouton.getAttribute('aria-controls'));
    if (!panneau || !accueil) return;
    defilementListe = menu.scrollTop;
    accueil.hidden = true;
    panneaux.forEach(function(p) { p.hidden = p !== panneau; });
    familles.forEach(function(b) { b.setAttribute('aria-expanded', b === bouton ? 'true' : 'false'); });
    menu.scrollTop = 0;
    glisse(panneau, 24);
    cascade(panneau.querySelectorAll('.mnav-section, .mnav-hub'), 60);
    var retour = panneau.querySelector('.mnav-retour');
    if (retour) { try { retour.focus({ preventScroll: true }); } catch (e) { retour.focus(); } }
  }

  // Retour à la liste des familles ; « anime » à faux quand le menu se ferme.
  function revenirALaListe(animer) {
    var ouvert = panneauOuvert();
    if (!accueil || (!ouvert && !accueil.hidden)) return;
    var bouton = ouvert ? menu.querySelector('.mnav-famille[aria-controls="' + ouvert.id + '"]') : null;
    panneaux.forEach(function(p) { p.hidden = true; });
    familles.forEach(function(b) { b.setAttribute('aria-expanded', 'false'); });
    accueil.hidden = false;
    menu.scrollTop = animer ? defilementListe : 0;
    if (!animer) return;
    glisse(accueil, -24);
    if (bouton) { try { bouton.focus({ preventScroll: true }); } catch (e) { bouton.focus(); } }
  }

  // Le menu couvre toute la page : tant qu'il est ouvert, le contenu caché
  // derrière (main, pied de page) sort de la tabulation et des lecteurs
  // d'écran, qui sinon y poursuivaient leur lecture.
  function rendreInerte(oui) {
    document.querySelectorAll('main, body > footer').forEach(function(el) {
      if (oui) el.setAttribute('inert', '');
      else el.removeAttribute('inert');
    });
  }

  // Le burger devient une croix, et l'inverse, en tournant d'un quart de tour.
  function basculeIcone(ouvre, animer) {
    var menuIcon = menuBtn.querySelector('.menu-icon');
    var closeIcon = menuBtn.querySelector('.close-icon');
    if (menuIcon) menuIcon.classList.toggle('hidden', ouvre);
    if (closeIcon) closeIcon.classList.toggle('hidden', !ouvre);
    if (animer) anime(ouvre ? closeIcon : menuIcon, [
      { transform: 'rotate(-90deg) scale(0.6)', opacity: 0 },
      { transform: 'none', opacity: 1 }
    ], { duration: 240, easing: DOUX });
  }

  // « immediat » : sans fondu, quand on suit un lien du menu ou que l'écran
  // passe en largeur de bureau.
  function poserTiroir(ouvrir, immediat) {
    if (!menuBtn || !menu) return;
    // Un geste pendant le fondu de fermeture le rattrape : le menu reste.
    var reprise = false;
    if (fermeture) { fermeture.cancel(); fermeture = null; reprise = ouvrir; }
    menuOuvert = ouvrir;
    document.documentElement.classList.toggle('menu-mobile-ouvert', ouvrir);
    rendreInerte(ouvrir);
    menuBtn.setAttribute('aria-expanded', ouvrir ? 'true' : 'false');
    basculeIcone(ouvrir, !immediat);
    if (ouvrir) {
      if (reprise) return;
      menu.classList.remove('hidden');
      menu.scrollTop = 0;
      if (immediat) return;
      anime(menu, [{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }], { duration: 200, easing: DOUX });
      cascade(elementsAccueil(), 40);
      return;
    }
    var finir = function() {
      fermeture = null;
      if (menuOuvert) return;
      menu.classList.add('hidden');
      revenirALaListe(false);
    };
    var a = (immediat || menu.classList.contains('hidden')) ? null : anime(menu, [
      { opacity: 1, transform: 'none' },
      { opacity: 0, transform: 'translateY(-6px)' }
    ], { duration: 170, easing: 'cubic-bezier(0.4, 0, 1, 1)' });
    if (!a) { finir(); return; }
    fermeture = a;
    a.onfinish = finir;
  }

  if (menuBtn && menu) {
    menuBtn.addEventListener('click', function() {
      poserTiroir(!menuOuvert);
    });
    // Suivre un lien du menu le referme, sans attendre : la page change.
    menu.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() { poserTiroir(false, true); });
    });
    familles.forEach(function(bouton) {
      bouton.addEventListener('click', function() { ouvrirFamille(bouton); });
    });
    panneaux.forEach(function(p) {
      var retour = p.querySelector('.mnav-retour');
      if (retour) retour.addEventListener('click', function() { revenirALaListe(true); });
    });
    // Échap : d'abord le retour à la liste, puis la fermeture du menu.
    document.addEventListener('keydown', function(e) {
      if (e.key !== 'Escape' || !menuOuvert) return;
      if (panneauOuvert()) { revenirALaListe(true); return; }
      poserTiroir(false);
      menuBtn.focus();
    });
    // Passé en largeur de bureau, le menu mobile disparaît (CSS) : la page
    // doit pouvoir défiler de nouveau.
    if (window.matchMedia) {
      var bureau = window.matchMedia('(min-width: 1024px)');
      var auBureau = function() { if (bureau.matches && menuOuvert) poserTiroir(false, true); };
      if (bureau.addEventListener) bureau.addEventListener('change', auBureau);
      else if (bureau.addListener) bureau.addListener(auBureau);
    }
  }

  // ── Menus déroulants (bureau) ───────────────────────────
  // Les panneaux des familles s'ouvrent au survol (et à la tabulation par le
  // CSS), jamais au clic : un panneau qui reste planté après un clic sur
  // l'onglet gêne plus qu'il n'aide. Seuls gardent un clic les déclencheurs
  // qui n'ont pas d'équivalent au survol tactile : la flèche du menu des
  // jeux (le libellé est un lien, il navigue) et le sélecteur de langue.
  var deroulants = Array.prototype.slice.call(document.querySelectorAll('#site-header .nav-dropdown'));
  function fermerDeroulants(sauf) {
    deroulants.forEach(function(bloc) {
      if (bloc === sauf) return;
      bloc.classList.remove('est-ouvert');
      var d = bloc.querySelector('[aria-expanded]');
      if (d) d.setAttribute('aria-expanded', 'false');
    });
  }
  deroulants.forEach(function(bloc) {
    var declencheur = bloc.querySelector('.nav-trigger-fleche') ||
      (bloc.hasAttribute('data-megamenu') ? null : bloc.querySelector('.nav-dropdown-trigger'));
    if (!declencheur) return;
    declencheur.addEventListener('click', function(e) {
      e.preventDefault();
      var ouvert = bloc.classList.toggle('est-ouvert');
      declencheur.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
      if (ouvert) { fermerDeroulants(bloc); caleMegamenu(bloc); }
    });
    bloc.addEventListener('keydown', function(e) {
      if (e.key !== 'Escape') return;
      bloc.classList.remove('est-ouvert');
      declencheur.setAttribute('aria-expanded', 'false');
      declencheur.focus();
    });
  });
  document.addEventListener('click', function(e) {
    deroulants.forEach(function(bloc) {
      if (bloc.contains(e.target)) return;
      if (!bloc.classList.contains('est-ouvert')) return;
      bloc.classList.remove('est-ouvert');
      var d = bloc.querySelector('[aria-expanded]');
      if (d) d.setAttribute('aria-expanded', 'false');
    });
  });

  // ── Calage des méga-panneaux ────────────────────────────
  // Le panneau est ancré sur le bord gauche de son onglet, pour rester sous
  // lui et que la souris puisse y descendre sans que le menu se referme. Sur
  // les onglets de droite, un panneau large sortirait de l'écran : on le
  // recule alors du strict nécessaire, jamais au-delà du bord gauche de la
  // fenêtre, et jamais au point de ne plus couvrir son onglet.
  var megamenus = document.querySelectorAll('[data-megamenu]');
  function caleMegamenu(bloc) {
    var pan = bloc.querySelector('.nav-megamenu');
    if (!pan) return;
    pan.style.transform = '';
    var rp = pan.getBoundingClientRect();
    if (!rp.width) return;
    var ro = bloc.getBoundingClientRect();
    var marge = 12;
    var debord = rp.right - (window.innerWidth - marge);
    if (debord <= 0) return;
    var recul = Math.min(debord, rp.left - marge, rp.width - ro.width - 8);
    if (recul > 0) pan.style.transform = 'translateX(' + (-Math.round(recul)) + 'px)';
  }
  megamenus.forEach(function(bloc) {
    bloc.addEventListener('mouseenter', function() { caleMegamenu(bloc); });
    bloc.addEventListener('focusin', function() { caleMegamenu(bloc); });
  });
  var minuteurCale;
  window.addEventListener('resize', function() {
    clearTimeout(minuteurCale);
    minuteurCale = setTimeout(function() {
      megamenus.forEach(function(bloc) {
        var pan = bloc.querySelector('.nav-megamenu');
        if (pan) pan.style.transform = '';
      });
    }, 150);
  });
})();
