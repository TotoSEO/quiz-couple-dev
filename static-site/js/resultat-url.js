/**
 * L'ecran de resultat sur sa propre adresse, et la porte qui le precede.
 *
 * Une partie entiere se joue aujourd'hui sans jamais changer d'adresse :
 * l'ecran de depart, les vingt questions et le resultat ne comptent que pour
 * une seule page vue. Le moment le plus regarde de la visite ne produit rien.
 *
 * Ce fichier repare ca de la maniere la moins risquee possible.
 *
 * ── Pourquoi un parametre et pas un rechargement ──────────────────────────
 * Recharger la page vers une vraie adresse /resultat/ donnerait une page vue
 * que n'importe quelle regie compte sans discuter. Mais il faudrait alors que
 * chacun des vingt-deux moteurs sache memoriser puis rejouer sa partie. Un
 * seul le fait aujourd'hui. Le jour ou un cas serait oublie, quelqu'un
 * perdrait son resultat apres cinq minutes de questions : c'est le pire
 * incident possible ici, et rien ne le justifie.
 *
 * On change donc l'adresse sans quitter la page. Et un parametre plutot qu'un
 * chemin, parce qu'un chemin qui n'existe pas comme fichier renvoie une 404
 * sur GitHub Pages des que quelqu'un recharge ou partage l'adresse.
 * « ?resultat » retombe toujours sur la vraie page. Le canonical de la page
 * pointe deja vers l'adresse propre, il n'y a donc rien a desindexer.
 *
 * ── La porte ─────────────────────────────────────────────────────────────
 * Le resultat sera plus tard place derriere une publicite a regarder. Tout
 * est ecrit ici, mais PORTE_ACTIVE est a faux : le resultat s'affiche
 * immediatement, exactement comme avant. Le jour ou la regie fournit son
 * format, on passe le drapeau a vrai et on branche l'appel sur brancherPub().
 *
 * Deux garde-fous sont ecrits des maintenant, parce qu'ils seraient oublies
 * apres : la porte s'ouvre toute seule au bout de DELAI_MAX si la publicite
 * ne se charge pas, et immediatement si la regie annonce qu'elle n'a rien a
 * montrer. Personne ne doit rester devant un ecran vide apres avoir repondu
 * a vingt questions.
 *
 * Tant que le drapeau est a faux, la minification de la construction retire
 * tout ce bloc du fichier publie : la porte, ses cinq traductions et ses
 * garde-fous ne pesent rien du tout sur les pages en ligne. Passer le drapeau
 * a vrai les fait revenir a la construction suivante.
 */
(function () {
  'use strict';

  var CLE = 'resultat';
  var PORTE_ACTIVE = false;   // a passer a true le jour ou le rewarded est branche
  var DELAI_MAX = 20000;      // au-dela, on ouvre sans attendre la publicite

  var TEXTES = {
    fr: {
      titre: 'Votre résultat est prêt !',
      note: "Une courte publicité et il s'affiche. C'est ce qui garde Quiz Couple gratuit, et on n'a rien trouvé de mieux ❤️",
      bouton: 'Voir mon résultat',
      attente: 'Un instant…'
    },
    en: {
      titre: 'Your result is ready!',
      note: "One short ad and it shows up. That is what keeps Quiz Couple free, and we haven't found anything better ❤️",
      bouton: 'See my result',
      attente: 'One moment…'
    },
    es: {
      titre: '¡Tu resultado está listo!',
      note: 'Un anuncio corto y aparece. Es lo que mantiene Quiz Couple gratis, y no hemos encontrado nada mejor ❤️',
      bouton: 'Ver mi resultado',
      attente: 'Un momento…'
    },
    de: {
      titre: 'Dein Ergebnis ist fertig!',
      note: 'Eine kurze Werbung, dann wird es angezeigt. Das hält Quiz Couple kostenlos, und etwas Besseres haben wir nicht gefunden ❤️',
      bouton: 'Mein Ergebnis ansehen',
      attente: 'Einen Moment…'
    },
    it: {
      titre: 'Il tuo risultato è pronto!',
      note: 'Una breve pubblicità e compare. È quello che tiene Quiz Couple gratuito, e non abbiamo trovato niente di meglio ❤️',
      bouton: 'Vedi il mio risultato',
      attente: 'Un attimo…'
    }
  };

  var dejaPasse = false;      // une partie a-t-elle atteint son resultat ici
  var derniereMesure = 0;

  // ── L'adresse ───────────────────────────────────────────────────────────
  // Les autres parametres sont conserves : le quiz personnalise se reconnait
  // a « ?q= », et le marqueur de partage « ?part » sert a la mesure. Les
  // perdre en chemin casserait l'un et fausserait l'autre. Ils sont recopies
  // tels quels plutot que relus puis reecrits : « ?part », qui n'a pas de
  // valeur, ressortirait sinon en « ?part= », et l'adresse ne serait plus
  // celle par laquelle la personne est arrivee.
  function sansParam() {
    var recherche = location.search || '';
    if (!recherche || recherche === '?') return location.pathname;
    var morceaux = recherche.slice(1).split('&');
    var restants = [];
    for (var i = 0; i < morceaux.length; i++) {
      if (!morceaux[i]) continue;
      if (morceaux[i].split('=')[0] === CLE) continue;
      restants.push(morceaux[i]);
    }
    return location.pathname + (restants.length ? '?' + restants.join('&') : '');
  }

  // L'ancre est recollee a la fin : sans elle, quelqu'un arrive sur
  // « /test-x/#faq » verrait l'ancre disparaitre de la barre d'adresse au
  // moment du resultat.
  function avecParam() {
    var base = sansParam();
    return base + (base.indexOf('?') === -1 ? '?' : '&') + CLE + location.hash;
  }

  function parametrePresent() {
    return /[?&]resultat(=|&|$)/.test(location.search || '');
  }

  // ── Le chemin de mesure ─────────────────────────────────────────────────
  // « /test-couple-toxique/resultat/ » : lisible dans le tableau de bord, et
  // range juste a cote du test dont il vient.
  function cheminMesure() {
    var p = location.pathname || '/';
    if (p.charAt(p.length - 1) !== '/') p += '/';
    return p + 'resultat/';
  }

  function mesure() {
    // Un moteur qui redessine son ecran de resultat rappellerait cette
    // fonction pour un seul et meme resultat. Deux pages vues pour une, c'est
    // une mesure qui ment : on ignore le rappel immediat.
    var maintenant = Date.now();
    if (maintenant - derniereMesure < 2000) return;
    derniereMesure = maintenant;

    var chemin = cheminMesure();
    try {
      if (window.QCAudience && typeof window.QCAudience.pageVue === 'function') {
        window.QCAudience.pageVue(chemin);
      }
    } catch (e) {}
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'page_view', {
          page_location: location.origin + avecParam(),
          page_title: document.title,
          page_referrer: location.origin + sansParam()
        });
      }
    } catch (e2) {}
  }

  // ── L'interstitiel de l'ecran de resultat ───────────────────────────────
  // Le div d'accueil est pose dans la page, vide ; ses scripts partent d'ici,
  // au moment ou le resultat s'affiche. Le declencheur est donc le clic de la
  // personne sur « voir mes resultats », et non le chargement de la page :
  // c'est le motif que Google decrit pour son propre interstitiel web, et
  // celui qui ne touche jamais quelqu'un qui arrive depuis la recherche.
  //
  // L'injection apres coup fonctionne parce que la chaine de la regie n'a
  // aucun document.write : leur propre requestform.js charge deja le format
  // en creant une balise script. On fait exactement la meme chose.
  //
  // Une seule fois par chargement de page. Rejouer dans la foulee ne redonne
  // pas d'interstitiel : la regie a son propre plafond de frequence, et un
  // deuxieme passage a la suite serait de toute facon de trop.
  var interstitielPose = false;

  function poseInterstitiel() {
    if (interstitielPose) return;
    var hote = document.querySelector('[data-pub-differee]');
    if (!hote) return;
    var format = hote.getAttribute('data-pub-differee');
    var site = hote.getAttribute('data-pub-site');
    if (!format || !site) return;
    interstitielPose = true;

    var cible = hote.firstElementChild || hote;
    [
      '//ads.themoneytizer.com/s/gen.js?type=' + format,
      '//ads.themoneytizer.com/s/requestform.js?siteId=' + site + '&formatId=' + format
    ].forEach(function (src) {
      var b = document.createElement('script');
      b.src = src;
      // Une balise script creee en JavaScript part en asynchrone par defaut,
      // et l'ordre d'execution n'est alors plus garanti. Le premier fichier
      // installe ce dont le second se sert : il faut donc rendre la sequence
      // explicite, ce que fait async a faux.
      b.async = false;
      cible.appendChild(b);
    });
  }

  // ── Le rafraichissement des emplacements publicitaires ──────────────────
  // Vide tant qu'aucun tag n'est pose. Une regie ne recharge pas ses
  // emplacements d'elle-meme quand l'adresse change sans rechargement : c'est
  // ici que viendra son appel, une fois qu'on saura lequel.
  function rafraichirPubs() {}

  // ── La porte ────────────────────────────────────────────────────────────
  var afficheLaPub = null;   // pose par brancherPub(), appele au clic
  var porte = null;          // l'etat courant tant qu'elle est fermee

  function construitPanneau(t) {
    var bloc = document.createElement('div');
    bloc.className = 'qc-porte';
    bloc.setAttribute('role', 'group');

    // Purement decoratif : masque aux lecteurs d'ecran, qui liraient sinon un
    // emoji sans contexte.
    var macaron = document.createElement('div');
    macaron.className = 'qc-porte-macaron';
    macaron.setAttribute('aria-hidden', 'true');
    macaron.textContent = '🎁';

    // Un paragraphe et non un titre : la page a deja sa hierarchie, en glisser
    // un ici la casserait pour les lecteurs d'ecran.
    var titre = document.createElement('p');
    titre.className = 'qc-porte-titre';
    titre.textContent = t.titre;

    var note = document.createElement('p');
    note.className = 'qc-porte-note';
    note.textContent = t.note;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'qc-porte-btn';
    btn.textContent = t.bouton;

    bloc.appendChild(macaron);
    bloc.appendChild(titre);
    bloc.appendChild(note);
    bloc.appendChild(btn);
    return { bloc: bloc, btn: btn };
  }

  function ouvrir() {
    if (!porte) return;
    var p = porte;
    porte = null;
    clearTimeout(p.filet);
    if (p.panneau.parentNode) p.panneau.parentNode.removeChild(p.panneau);
    p.cible.hidden = false;
    p.cible.classList.remove('qc-cache');
    try { p.suite(); } catch (e) {}
  }

  function fermer(cible, lang, suite) {
    var t = TEXTES[lang] || TEXTES.fr;
    var vue = construitPanneau(t);

    // hidden seul ne suffit pas : n'importe quelle regle de classe qui pose un
    // display l'emporte sur celui du navigateur, et le resultat resterait
    // visible derriere la porte.
    cible.hidden = true;
    cible.classList.add('qc-cache');
    cible.parentNode.insertBefore(vue.bloc, cible);

    porte = { panneau: vue.bloc, cible: cible, suite: suite, filet: null };

    vue.btn.addEventListener('click', function () {
      if (!porte) return;
      if (typeof afficheLaPub !== 'function') { ouvrir(); return; }
      vue.btn.disabled = true;
      vue.btn.textContent = t.attente;
      porte.filet = setTimeout(ouvrir, DELAI_MAX);
      try { afficheLaPub(ouvrir); } catch (e) { ouvrir(); }
    });

    try { vue.btn.focus({ preventScroll: true }); } catch (e) {}
  }

  // ── Le point d'entree des moteurs ───────────────────────────────────────
  // Appele au moment exact ou le resultat vient d'etre construit. « cible »
  // est l'element qui le porte : c'est celui qu'on masque derriere la porte.
  //
  // Tout est enveloppe : on arrive ici une fois le resultat construit et
  // affiche. Une erreur de ce fichier ne doit jamais empecher la remontee
  // vers le resultat, qui est la seule chose que la personne attend.
  function arrivee(cible, options) {
    var opts = options || {};
    var suite = typeof opts.apres === 'function' ? opts.apres : function () {};
    try { poseLAdresse(cible, opts, suite); }
    catch (e) { try { suite(); } catch (e2) {} }
  }

  function poseLAdresse(cible, opts, suite) {
    // Une entree d'historique par resultat, pas par appel : un moteur qui
    // redessine son ecran en poserait deux, et le bouton « precedent » ne
    // ramenerait nulle part au premier appui.
    //
    // Le drapeau n'est leve que si l'adresse porte vraiment le parametre.
    // Sans cette precaution, un pushState refuse laisserait le drapeau a vrai
    // et le premier « precedent » rechargerait la page, donc effacerait un
    // resultat que personne n'avait demande a quitter.
    if (parametrePresent()) {
      dejaPasse = true;
    } else {
      try { history.pushState({ qcResultat: 1 }, '', avecParam()); dejaPasse = true; }
      catch (e) {}
    }
    mesure();
    rafraichirPubs();
    poseInterstitiel();

    if (!PORTE_ACTIVE || porte || !cible) { suite(); return; }
    var lang = opts.lang || document.documentElement.lang || 'fr';
    if (cible.parentNode) { fermer(cible, lang, suite); return; }

    // Certains moteurs assemblent leur resultat avant de le poser dans la
    // page. Sans parent, il n'y a nulle part ou glisser la porte : on laisse
    // passer une image, et on renonce si rien n'a bouge plutot que de risquer
    // un ecran vide.
    requestAnimationFrame(function () {
      if (porte || !cible.parentNode) { suite(); return; }
      fermer(cible, lang, suite);
    });
  }

  // ── Le retour arriere ───────────────────────────────────────────────────
  // Le parametre disparait : ce qui est a l'ecran est un resultat sous une
  // adresse qui ne le decrit plus. On recharge, l'ecran de depart revient
  // proprement, et aucun moteur n'a a savoir revenir en arriere tout seul.
  window.addEventListener('popstate', function () {
    if (!dejaPasse) {
      // Rien n'a ete joue dans cet onglet : une adresse de resultat qui
      // reapparait dans l'historique n'annonce plus rien, on l'efface.
      if (parametrePresent()) retireLeParametre();
      return;
    }
    if (parametrePresent()) return;
    location.reload();
  });

  function retireLeParametre() {
    try { history.replaceState(history.state, '', sansParam() + location.hash); } catch (e) {}
  }

  // ── Au chargement ───────────────────────────────────────────────────────
  // Le parametre est la sans qu'aucune partie n'ait ete jouee : quelqu'un a
  // recharge, ou colle l'adresse. On le retire sans ajouter d'entree dans
  // l'historique, et la page repart de son ecran de depart.
  if (parametrePresent()) retireLeParametre();

  window.QCResultat = {
    arrivee: arrivee,
    ouvrir: ouvrir,
    // Les moteurs autonomes redessinent leur ecran de depart sur place, sans
    // recharger. L'adresse annoncerait alors un resultat devant un formulaire
    // vide : ils appellent ceci en repartant. replaceState plutot que
    // pushState, sinon le bouton « precedent » ramenerait a une adresse de
    // resultat qui n'a plus de resultat derriere elle.
    retour: function () { dejaPasse = false; retireLeParametre(); },
    // Branche plus tard par l'integration de la regie : la fonction recoit un
    // rappel a executer quand la publicite est terminee, ou tout de suite s'il
    // n'y a rien a montrer.
    brancherPub: function (fn) { afficheLaPub = typeof fn === 'function' ? fn : null; },
    rafraichirPubs: rafraichirPubs,
    // Lu par le moteur commun : « Recommencer » recharge la page, et doit la
    // recharger sans le parametre, sinon la reprise rouvrirait une adresse de
    // resultat pour un ecran de depart.
    urlPropre: function () { return sansParam() + location.hash; }
  };
})();
