/* Les outils à résultat immédiat : compteur de durée en couple, noces de
   mariage, différence d'âge, compatibilité par date de naissance, signes
   chinois, prénoms et signes. Ce qu'ils partagent depuis le 18 novembre 2026
   (Thomas : « ça doit être joli ! aéré ! agréable ! interactif ! ») :

   - QCOutil.apercu(el, html) : la ligne qui apparaît sous une date dès
     qu'elle est complète (le signe, l'âge, le nombre de jours...), en
     douceur, et seulement quand elle change ;
   - QCOutil.pret(racine, oui) : tout est rempli, le bouton le dit ;
   - QCOutil.compte(boite) : les grands nombres d'un résultat ([data-compte])
     montent de zéro à leur valeur, la valeur finale étant déjà écrite dans
     la page (sans script, ou mouvement réduit, on la voit tout de suite) ;
   - QCOutil.fete(el) : les deux personnages, tirés du <template
     id="outil-fete"> de la page, se posent de part et d'autre du résultat.

   Rien ne part au serveur. Tout bouge en transform et opacity, et
   prefers-reduced-motion coupe tout. Chargé avant le script de chaque outil
   (les scripts différés s'exécutent dans l'ordre du document). */
(function () {
  'use strict';
  var reduit = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var LOCALES = { fr: 'fr-FR', en: 'en-GB', es: 'es-ES', de: 'de-DE', it: 'it-IT', nl: 'nl-NL' };
  var LOCALE = LOCALES[(document.documentElement.lang || 'fr').slice(0, 2)] || 'fr-FR';

  function format(n) {
    try { return new Intl.NumberFormat(LOCALE).format(n); } catch (e) { return String(n); }
  }

  function anime(el, images, options) {
    if (reduit || !el || typeof el.animate !== 'function') return;
    try { el.animate(images, options); } catch (e) { /* rien : l'élément reste à sa place */ }
  }

  // La ligne d'aperçu : vide, elle ne prend aucune place ; remplie, elle
  // arrive en glissant un peu. Le même contenu n'est jamais réécrit (le
  // lecteur d'écran, qui lit la zone, ne répète rien).
  function apercu(el, html) {
    if (!el) return;
    html = html || '';
    if ((el.getAttribute('data-html') || '') === html) return;
    el.setAttribute('data-html', html);
    el.innerHTML = html;
    el.classList.toggle('est-plein', !!html);
    if (html) {
      anime(el, [
        { opacity: 0, transform: 'translateY(6px) scale(0.97)' },
        { opacity: 1, transform: 'none' }
      ], { duration: 280, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
    }
  }

  function pret(racine, oui) {
    if (!racine) return;
    var avant = racine.classList.contains('outil--pret');
    racine.classList.toggle('outil--pret', !!oui);
    if (oui && !avant) {
      var b = racine.querySelector('.astro-submit-btn');
      anime(b, [
        { transform: 'scale(1)' }, { transform: 'scale(1.035)' }, { transform: 'scale(1)' }
      ], { duration: 520, easing: 'ease-in-out', iterations: 2 });
    }
  }

  // Les nombres qui montent. La durée grandit avec le nombre, sans dépasser
  // une seconde et demie : 2 103 jours montent en un peu plus d'une seconde.
  function compte(boite) {
    if (!boite || reduit || !window.requestAnimationFrame) return;
    var els = boite.querySelectorAll('[data-compte]');
    Array.prototype.forEach.call(els, function (el) {
      var fin = parseFloat(el.getAttribute('data-compte'));
      if (!isFinite(fin) || fin <= 0) return;
      var avant = el.getAttribute('data-avant') || '';
      var apres = el.getAttribute('data-apres') || '';
      var duree = Math.min(1500, 550 + Math.log(fin + 1) / Math.LN10 * 230);
      var debut = null;
      function pas(t) {
        if (debut === null) debut = t;
        var p = Math.min(1, (t - debut) / duree);
        var e = 1 - Math.pow(1 - p, 3);
        el.textContent = avant + format(Math.round(fin * e)) + apres;
        if (p < 1) window.requestAnimationFrame(pas);
      }
      el.textContent = avant + format(0) + apres;
      window.requestAnimationFrame(pas);
    });
  }

  // Les deux personnages autour du grand chiffre : copiés du <template> de la
  // page (dessinés à la construction, rose à gauche, violet à droite), posés
  // en tête de l'élément, et qui sautent trois fois (CSS).
  function fete(el) {
    var t = document.getElementById('outil-fete');
    if (!el || !t || !t.content || el.querySelector('.outil-fete')) return;
    var boite = document.createElement('div');
    boite.className = 'outil-fete';
    boite.setAttribute('aria-hidden', 'true');
    boite.appendChild(t.content.cloneNode(true));
    el.insertBefore(boite, el.firstChild);
    el.classList.add('outil-fete-hote');
  }

  // Les blocs d'un résultat arrivent l'un après l'autre.
  function deroule(boite) {
    if (!boite || reduit) return;
    var enfants = boite.children;
    for (var i = 0; i < enfants.length && i < 10; i++) {
      anime(enfants[i], [
        { opacity: 0, transform: 'translateY(14px)' },
        { opacity: 1, transform: 'none' }
      ], { duration: 420, delay: 70 * i, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'backwards' });
    }
  }

  // Tout ce qu'un résultat fait en arrivant, d'un seul appel.
  function resultat(boite, tete) {
    if (!boite) return;
    if (tete) fete(tete);
    deroule(boite);
    compte(boite);
  }

  window.QCOutil = { apercu: apercu, pret: pret, compte: compte, fete: fete, deroule: deroule, resultat: resultat, format: format, reduit: reduit };
})();
