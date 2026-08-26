/**
 * Compteur de lectures d'un article, et bulle d'explication des sources
 * préférées Google.
 *
 * ── Le compteur ───────────────────────────────────────────────────────────
 * Il ne collecte rien de nouveau : la mesure d'audience enregistre déjà
 * chaque page affichée, ce fichier ne fait que demander le total du chemin
 * courant. L'unité est la visite, pas la ligne : quelqu'un qui recharge
 * l'article ou qui y revient dans la demi-heure l'a lu une fois.
 *
 * Le compteur reste caché tant que le nombre est petit. « Ce contenu a été
 * lu 4 fois » dessert l'article au lieu de le servir, et un article publié
 * hier n'a pas à s'excuser d'être jeune. Le seuil est posé dans le gabarit,
 * pas ici, pour pouvoir le bouger sans toucher au code.
 */
(function () {
  'use strict';

  // ── Le compteur ─────────────────────────────────────────────────────────
  var el = document.getElementById('blog-lectures');
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
      var ouvert = aide.getAttribute('aria-expanded') === 'true';
      if (ouvert) { ferme(); return; }
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
})();
