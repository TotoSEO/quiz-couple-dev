/* La carte du thème astral de couple (page /theme-astral-couple/, en
 * français seulement), écrite une fois pour toutes ses entrées :
 * templates/partials/astro-carte.ejs pose ses styles, ses textes
 * (window.QC_ASTRO_CARTE) et ce fichier.
 *
 *  - test    : sous le score du test des prénoms et des signes ;
 *  - date    : sous le résultat de la compatibilité par date de naissance ;
 *  - chinois : sous le résultat de la compatibilité des signes chinois ;
 *  - article : en bas des articles d'astrologie (la carte est écrite par le
 *              gabarit, ce fichier ne fait que la suivre).
 *
 * Sur les deux outils à dates, la carte ne se dessine que si les deux
 * personnes ont 18 ans ou plus (`majeurs`) : le rapport est réservé aux
 * majeurs, et beaucoup de visiteurs de ces pages sont plus jeunes.
 *
 * Au clic, la page du thème astral reçoit ce qu'elle peut reprendre
 * (qc-astro-couple, 24 heures : les prénoms et les signes du test, les dates
 * et les signes des outils à dates) et d'où l'on vient (qc-astro-clic,
 * 30 minutes, qu'elle lit une fois). Rien ne part au serveur, sauf les
 * comptes : vue et clic par la fonction astro (carte_vue et carte_clic pour
 * le test, carte_vue_<source> et carte_clic_<source> pour les autres),
 * jamais pour le propriétaire ni pour un navigateur piloté.
 */
(function () {
  'use strict';
  var C = window.QC_ASTRO_CARTE;
  if (!C || !C.url) return;
  var T = C.textes || {};

  var SIGNES = ['belier', 'taureau', 'gemeaux', 'cancer', 'lion', 'vierge', 'balance', 'scorpion', 'sagittaire', 'capricorne', 'verseau', 'poissons'];
  var GLYPHES = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
  var SOURCES = ['test', 'date', 'chinois', 'article'];
  // Dix étoiles placées une fois pour toutes, qui scintillent à tour de rôle.
  var ETOILES = [[8, 18], [22, 72], [36, 12], [51, 86], [63, 30], [77, 9], [88, 58], [94, 24], [15, 44], [70, 78]];

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // Le signe du jour de naissance, découpage tropical classique : le même
  // que js/date-naissance.js, pour que la carte montre le signe que l'outil
  // vient d'afficher.
  var PREMIER = [9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8];
  var BASCULE = [20, 19, 21, 20, 21, 21, 23, 23, 23, 23, 22, 22];
  function signeDuJour(j, m) {
    var i = m - 1;
    return SIGNES[j >= BASCULE[i] ? (PREMIER[i] + 1) % 12 : PREMIER[i]];
  }
  // L'âge aujourd'hui d'une personne née le j/m/a.
  function age(d, auj) {
    var n = auj.getFullYear() - d.a;
    var m = auj.getMonth() + 1;
    if (m < d.m || (m === d.m && auj.getDate() < d.j)) n -= 1;
    return n;
  }
  function majeurs(d1, d2) {
    var auj = new Date();
    return age(d1, auj) >= 18 && age(d2, auj) >= 18;
  }
  function iso(d) {
    return d.a + '-' + String(d.m).padStart(2, '0') + '-' + String(d.j).padStart(2, '0');
  }

  function ciel() {
    return '<div class="at-ciel" aria-hidden="true">' + ETOILES.map(function (e, i) {
      return '<i style="left:' + e[0] + '%;top:' + e[1] + '%;animation-delay:' + (-i * 0.37).toFixed(2) + 's"></i>';
    }).join('') + '</div>';
  }
  function astre(qui, nom, signe) {
    var i = SIGNES.indexOf(signe);
    return '<div class="at-astre at-astre--' + qui + '"><span class="at-signe at-signe--' + qui + '">' + (GLYPHES[i] || '') + '︎</span>' +
      '<span class="at-nom">' + esc(nom) + '</span><span class="at-signe-nom">' + esc((C.signes || {})[signe] || '') + '</span></div>';
  }

  // La carte d'un résultat, à poser dans le HTML du résultat.
  // o : { source: 'test' | 'date' | 'chinois',
  //       a: { nom?, signe?, d? }, b: { nom?, signe?, d? } }
  // où d = { j, m, a } (les outils à dates). Rend '' quand la carte n'a pas
  // lieu d'être (texte absent, une personne mineure).
  var enAttente = null;
  function html(o) {
    var src = o && SOURCES.indexOf(o.source) >= 0 ? o.source : '';
    var X = T[src];
    if (!src || src === 'article' || !X || !X.titre) return '';
    var a = o.a || {}, b = o.b || {};
    if (a.d || b.d) {
      if (!a.d || !b.d || !majeurs(a.d, b.d)) return '';
      a.signe = a.signe || signeDuJour(a.d.j, a.d.m);
      b.signe = b.signe || signeDuJour(b.d.j, b.d.m);
    }
    if (SIGNES.indexOf(a.signe) < 0 || SIGNES.indexOf(b.signe) < 0) return '';
    enAttente = { source: src, a: a, b: b };
    return '<aside class="at-carte" id="at-carte" data-at-source="' + src + '">' + ciel() +
      '<div class="at-duo" aria-hidden="true">' + astre('a', a.nom || T.vous, a.signe) +
      '<svg class="at-fil" viewBox="0 0 100 40" preserveAspectRatio="none">' +
      '<path d="M2 24 C 30 -2, 70 -2, 98 24" fill="none" stroke="rgba(240,207,134,0.25)" stroke-width="1.2" stroke-dasharray="2 4" stroke-linecap="round" vector-effect="non-scaling-stroke"/>' +
      '<path class="at-fil-trace" pathLength="100" d="M2 24 C 30 -2, 70 -2, 98 24" fill="none" stroke="#f0cf86" stroke-width="1.6" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>' +
      astre('b', b.nom || T.moitie, b.signe) + '</div>' +
      '<p class="at-kicker">' + esc(T.kicker) + '</p>' +
      '<h2 class="at-titre">' + esc(X.titre) + '</h2>' +
      '<p class="at-texte">' + esc(X.texte) + '</p>' +
      '<ul class="at-puces">' + (T.puces || []).map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul>' +
      '<a class="at-bouton no-underline" href="' + esc(C.url) + '" data-at-lien>' + esc(T.bouton) + ' <span aria-hidden="true">→</span></a>' +
      '<p class="at-note">' + esc(X.note) + '</p></aside>';
  }

  function compter(etape) {
    try { if (navigator.webdriver || localStorage.getItem('qc-no-track')) return; } catch (e) { /* rien */ }
    try {
      // Une requête simple (texte, clé dans l'adresse) : pas de requête de
      // préchargement avant le compte.
      fetch(C.fonction + '?apikey=' + encodeURIComponent(C.cle || ''), {
        method: 'POST', keepalive: true, headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'vue', etape: etape, lang: 'fr' })
      }).catch(function () {});
    } catch (e) { /* la mesure ne bloque rien */ }
  }
  function etape(quoi, src) { return src === 'test' ? 'carte_' + quoi : 'carte_' + quoi + '_' + src; }

  // Ce que la page du thème astral reprendra : prénoms et signes (test),
  // dates et signes (outils à dates). Un article ne laisse que sa source.
  function garder(o) {
    try {
      localStorage.setItem('qc-astro-clic', JSON.stringify({ t: Date.now(), src: o.source }));
      if (o.source === 'article') return;
      var p = function (x) {
        var r = { signe: x.signe };
        if (x.nom) r.prenom = String(x.nom).slice(0, 30);
        if (x.d) r.date = iso(x.d);
        return r;
      };
      localStorage.setItem('qc-astro-couple', JSON.stringify({ t: Date.now(), src: o.source, a: p(o.a), b: p(o.b) }));
    } catch (e) { /* navigation privée */ }
  }

  // Suit une carte posée dans la page : vue (à 40 % à l'écran), fil d'or
  // tracé à son arrivée, clic.
  function suivre(carte, o) {
    if (!carte || carte.getAttribute('data-at-suivie')) return;
    carte.setAttribute('data-at-suivie', '1');
    var src = o.source;
    var lien = carte.querySelector('[data-at-lien]');
    if (lien) lien.addEventListener('click', function () { garder(o); compter(etape('clic', src)); });
    if ('IntersectionObserver' in window) {
      var vu = false;
      var io = new IntersectionObserver(function (e) {
        if (!vu && e[0].isIntersecting) { vu = true; io.disconnect(); compter(etape('vue', src)); }
      }, { threshold: 0.4 });
      io.observe(carte);
      var io2 = new IntersectionObserver(function (e) {
        if (e[0].isIntersecting) { carte.classList.add('est-vue'); io2.disconnect(); }
      }, { threshold: 0.25 });
      io2.observe(carte);
    } else {
      carte.classList.add('est-vue');
    }
  }

  // Après avoir posé le résultat qui contient la carte (html), l'outil
  // appelle suivi() pour la brancher.
  function suivi() {
    if (!enAttente) return;
    var o = enAttente;
    enAttente = null;
    suivre(document.querySelector('.at-carte[data-at-source="' + o.source + '"]:not([data-at-suivie])'), o);
  }

  // La carte d'un article est déjà dans la page.
  function articles() {
    var c = document.querySelector('.at-carte[data-at-source="article"]');
    if (c) suivre(c, { source: 'article' });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', articles);
  else articles();

  window.QCAstroCarte = { html: html, suivi: suivi, majeurs: majeurs, signeDuJour: signeDuJour };
})();
