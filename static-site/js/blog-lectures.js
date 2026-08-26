/**
 * Lectures d'un article : le compteur affiché, et le signal qui l'alimente.
 *
 * ── Ce qu'on appelle une lecture ──────────────────────────────────────────
 * Pas une page ouverte. Compter les ouvertures et les appeler des lectures,
 * c'est mettre le passant qui voit le titre et repart au même niveau que
 * celui qui lit l'article en entier.
 *
 * Une lecture est signalée quand deux conditions sont réunies :
 *
 *   - du temps passé sur la page, proportionnel à la longueur de l'article :
 *     un quart du temps de lecture estimé, avec un plancher de vingt
 *     secondes et un plafond de deux minutes. Le temps ne court que lorsque
 *     l'onglet est au premier plan, sinon un onglet ouvert puis oublié
 *     vaudrait une lecture ;
 *   - du défilement au-delà de la moitié du corps de l'article. Un article
 *     plus court que l'écran remplit cette condition d'emblée : il n'y a
 *     rien à faire défiler.
 *
 * Ça ne prouve pas qu'on a lu, aucune mesure ne le peut. Mais ça ressemble à
 * quelqu'un qui lit, et ça écarte le passage éclair et le robot.
 *
 * Le signal ne part qu'une fois par visite et par article : un drapeau local
 * l'empêche de repartir au rechargement, et un index unique en base attrape
 * ce qui passerait quand même.
 *
 * ── Le compteur ───────────────────────────────────────────────────────────
 * Il reste caché tant que le nombre est petit. « Ce contenu a été lu 4 fois »
 * dessert l'article au lieu de le servir, et un article publié hier n'a pas à
 * s'excuser d'être jeune. Le seuil est posé dans le gabarit, pas ici.
 */
(function () {
  'use strict';

  var el = document.getElementById('blog-lectures');

  // ── Le compteur affiché ─────────────────────────────────────────────────
  if (el && el.dataset.url && el.dataset.key && el.dataset.path) {
    var seuil = parseInt(el.dataset.seuil, 10);
    if (!(seuil >= 0)) seuil = 50;

    fetch(el.dataset.url + '/rest/v1/rpc/get_article_lectures', {
      method: 'POST',
      headers: {
        'apikey': el.dataset.key,
        'Authorization': 'Bearer ' + el.dataset.key,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ p_path: el.dataset.path })
    })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (n) {
        var total = Number(n);
        if (!isFinite(total) || total < seuil) return;
        // Les milliers se groupent dans la langue de la page : « 4 213 » en
        // français, « 4,213 » en anglais, « 4.213 » en allemand. Un séparateur
        // codé en dur donnait un nombre faux dans quatre langues sur cinq.
        var lu;
        try { lu = Number(total).toLocaleString(document.documentElement.lang || 'fr'); }
        catch (e) { lu = String(total); }
        var modele = el.dataset.modele || '{n}';
        el.textContent = modele.replace('{n}', lu);
        el.hidden = false;
        var sep = document.getElementById('blog-lectures-sep');
        if (sep) sep.hidden = false;
      })
      .catch(function () {});
  }

  // ── La bulle « c'est quoi, une source préférée ? » ───────────────────────
  // Repliée au départ : elle répond à une question que la plupart des
  // lecteurs ne se posent pas, et elle ne doit pas pousser l'article vers le
  // bas pour ceux-là.
  var aide = document.querySelector('.gsource-aide');
  var bulle = document.getElementById('gsource-bulle');
  if (aide && bulle) {
    var ferme = function () {
      bulle.hidden = true;
      aide.setAttribute('aria-expanded', 'false');
    };
    aide.addEventListener('click', function (e) {
      e.preventDefault();
      if (aide.getAttribute('aria-expanded') === 'true') { ferme(); return; }
      bulle.hidden = false;
      aide.setAttribute('aria-expanded', 'true');
    });
    // Un clic ailleurs et la touche Échap referment : sans ça, la bulle
    // reste ouverte dans le dos du lecteur pendant tout l'article.
    document.addEventListener('click', function (e) {
      if (bulle.hidden) return;
      if (aide.contains(e.target) || bulle.contains(e.target)) return;
      ferme();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !bulle.hidden) { ferme(); aide.focus(); }
    });
  }

  // ── Le signal de lecture ────────────────────────────────────────────────
  (function signalLecture() {
    if (!el || !el.dataset.url || !el.dataset.key || !el.dataset.path) return;
    var aud = window.QCAudience;
    if (!aud || (aud.ignorer && aud.ignorer())) return;
    var visite = aud.visite && aud.visite();
    if (!visite) return;

    var chemin = el.dataset.path;
    var cle = 'qc-lu:' + chemin;
    try { if (window.localStorage && localStorage.getItem(cle) === visite) return; } catch (e) {}

    var minutes = parseFloat(el.dataset.minutes) || 1;
    var requis = Math.min(120, Math.max(20, Math.round(minutes * 60 * 0.25))) * 1000;

    var corps = document.querySelector('.blog-article');
    var cumul = 0;
    var depuis = document.visibilityState === 'visible' ? Date.now() : 0;
    var defile = false;
    var fait = false;
    var minuteur = null;

    function tempsPasse() {
      return cumul + (depuis ? Date.now() - depuis : 0);
    }

    function verifieDefilement() {
      if (defile) return;
      if (!corps) { defile = true; return; }
      var haut = corps.getBoundingClientRect().top + window.pageYOffset;
      var bas = window.pageYOffset + window.innerHeight;
      // Un article qui tient dans l'écran n'a rien à faire défiler : la
      // condition est remplie dès l'affichage.
      if (corps.offsetHeight <= window.innerHeight) { defile = true; return; }
      if (bas >= haut + corps.offsetHeight * 0.55) defile = true;
    }

    function envoie() {
      if (fait) return;
      fait = true;
      if (minuteur) clearInterval(minuteur);
      window.removeEventListener('scroll', surDefilement);
      document.removeEventListener('visibilitychange', surVisibilite);
      try { if (window.localStorage) localStorage.setItem(cle, visite); } catch (e) {}
      try {
        fetch(el.dataset.url + '/rest/v1/article_lectures', {
          method: 'POST',
          keepalive: true,
          headers: {
            'apikey': el.dataset.key,
            'Authorization': 'Bearer ' + el.dataset.key,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            visite_id: visite,
            path: chemin,
            lang: document.documentElement.lang || 'fr'
          })
        }).catch(function () {});
      } catch (e) {}
    }

    function evalue() {
      verifieDefilement();
      if (defile && tempsPasse() >= requis) envoie();
    }

    function surDefilement() { evalue(); }
    function surVisibilite() {
      if (document.visibilityState === 'visible') {
        depuis = Date.now();
      } else if (depuis) {
        cumul += Date.now() - depuis;
        depuis = 0;
      }
      evalue();
    }

    window.addEventListener('scroll', surDefilement, { passive: true });
    document.addEventListener('visibilitychange', surVisibilite);
    minuteur = setInterval(evalue, 2000);
    evalue();
  })();
})();
