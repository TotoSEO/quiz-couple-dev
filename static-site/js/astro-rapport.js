/* Le rapport du thème astral de couple, dessiné dans la page :
 * window.QCAstroRapport.afficher(zone, rapport, T).
 *
 * `rapport` vient de l'action `rapport` de la fonction astro (assemblé par
 * supabase/functions/_shared/astro/rapport.mjs, textes accordés et espaces
 * insécables posées) ; `T` sont les textes de la page (fr/theme-astral.json),
 * dont `rapport.*` pour les titres et les libellés. La feuille de style est
 * css/astro-rapport.css, chargée avec ce fichier.
 *
 * Tout est en HTML et en SVG, sans bibliothèque : la couverture et son ciel
 * propre au couple (tiré des prénoms et des dates), la roue
 * (js/astro-roue.js), le profil, les domaines, les éléments, les chapitres
 * des planètes avec le petit cercle de l'écart entre les deux, les signes
 * chinois, les chemins de vie, l'année et les questions. Les entrées à
 * l'écran ne bougent qu'en transform et opacity, et rien ne bouge avec
 * prefers-reduced-motion. */
(function () {
  'use strict';

  var SIGNES = ['belier', 'taureau', 'gemeaux', 'cancer', 'lion', 'vierge', 'balance', 'scorpion', 'sagittaire', 'capricorne', 'verseau', 'poissons'];
  var VS = '︎';
  var GS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
  var GP = { soleil: '☉', lune: '☽', mercure: '☿', venus: '♀', mars: '♂', jupiter: '♃' };
  var GA = { conjonction: '☌', sextile: '⚹', carre: '□', trigone: '△', opposition: '☍' };
  var ELEMENTS = ['feu', 'terre', 'air', 'eau'];
  var HAN = { rat: '鼠', buffle: '牛', tigre: '虎', lapin: '兔', dragon: '龍', serpent: '蛇', cheval: '馬', chevre: '羊', singe: '猴', coq: '雞', chien: '狗', cochon: '豬' };
  var HAN_EL = { bois: '木', feu: '火', terre: '土', metal: '金', eau: '水' };
  var GLYPHE_TON = { tendre: '♀', passion: '♂', elan: '♃', malentendus: '☿', turbulences: '☍', calme: '☽' };
  var DOUX = { conjonction: 1, trigone: 1, sextile: 1 };
  var ROMAINS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI'];
  var MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  var MOIS_COURT = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  var NB = ' ';

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  // {{k}} remplacé par v[k] ; en français, « de » et « que » devant une
  // valeur qui commence par une voyelle s'élident (« les planètes d'Inès »,
  // « Cochon d'Eau »).
  var VOYELLE = /^[aeiouyàâäéèêëîïôöùûüÿœæ]/i;
  // En espagnol, « y » devient « e » devant un son « i » ; en italien, « e »
  // devient « ed » devant un « e » (conjonction.mjs de la fonction astro).
  function conjonction(mot, x) {
    var nu = String(x).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (LANG === 'es' && (mot === 'y' || mot === 'Y')) return /^h?i(?!e)/i.test(nu) ? (mot === 'Y' ? 'E' : 'e') : mot;
    if (LANG === 'it' && (mot === 'e' || mot === 'E')) return /^e/i.test(nu) ? mot + 'd' : mot;
    return mot;
  }
  // En italien, « il », « dal », « al »... s'élident devant le 8 et le 11
  // (« l'8 marzo », « dall'11 aprile » : eliderDates de conjonction.mjs).
  var ELISIONS_IT = { il: "l'", Il: "L'", dal: "dall'", Dal: "Dall'", al: "all'", Al: "All'", del: "dell'", Del: "Dell'", nel: "nell'", Nel: "Nell'" };
  function eliderDates(s) {
    if (LANG !== 'it') return s;
    return String(s).replace(/(^|[^A-Za-zÀ-ÖØ-öø-ÿ])(il|Il|dal|Dal|al|Al|del|Del|nel|Nel) (8|11)(?!\d)/g, function (t, avant, mot, n) { return avant + ELISIONS_IT[mot] + n; })
      // « all'1:15 » (all'una), mais « alle 11:15 ».
      .replace(/(^|[^A-Za-zÀ-ÖØ-öø-ÿ])(alle|Alle) 1:/g, function (t, avant, mot) { return avant + mot.slice(0, 3) + "'1:"; });
  }
  function tpl(s, v) {
    return eliderDates(String(s || '').replace(/(^|[^A-Za-zÀ-ÖØ-öø-ÿ])(de|De|que|Que|y|Y|e|E) \{\{(\w+)\}\}|\{\{(\w+)\}\}/g, function (t, avant, mot, k1, k2) {
      if (k2) return v[k2] != null ? v[k2] : t;
      var x = v[k1];
      if (x == null) return t;
      if (/^(de|De|que|Que)$/.test(mot)) return avant + (LANG === 'fr' && VOYELLE.test(String(x)) ? mot.slice(0, -1) + "'" + x : mot + ' ' + x);
      return avant + conjonction(mot, x) + ' ' + x;
    }));
  }
  // {masc|fém} au genre d'une personne.
  function accord(s, genre) { return String(s || '').replace(/\{([^{}|:]*)\|([^{}]*)\}/g, function (_, m, f) { return genre === 'm' ? m : f; }); }
  function f1(n) { return Math.round(n * 10) / 10; }
  function g(glyphe) { return glyphe + VS; }

  // Les dates et les heures : à la française (« 1er mars 1995 », « 14 h 30 »),
  // sinon dans la forme de la langue de la page (« March 1, 1995 »,
  // « 1. März 1995 », « 2:30 PM »).
  var LANG = String(document.documentElement.getAttribute('lang') || 'fr').slice(0, 2);
  var LOCALE = { en: 'en-US', es: 'es-ES', de: 'de-DE', it: 'it-IT', nl: 'nl-NL' }[LANG] || '';
  function formatIntl(o, t) {
    try { return new Intl.DateTimeFormat(LOCALE, Object.assign({ timeZone: 'UTC' }, o)).format(t); } catch (e) { return ''; }
  }
  function dateLongue(iso) {
    var p = String(iso || '').slice(0, 10).split('-').map(Number);
    if (!p[0]) return '';
    if (LOCALE) {
      var d = formatIntl({ day: 'numeric', month: 'long', year: 'numeric' }, Date.UTC(p[0], p[1] - 1, p[2])) || String(iso).slice(0, 10);
      // « 1° marzo 1995 », comme dateCourte de rapport.mjs.
      return LANG === 'it' && p[2] === 1 ? d.replace(/^1 /, '1° ') : d;
    }
    return (p[2] === 1 ? '1er' : p[2]) + ' ' + MOIS[p[1] - 1] + ' ' + p[0];
  }
  function heureLongue(h) {
    var p = String(h || '').split(':');
    if (p.length !== 2) return '';
    if (LOCALE) return formatIntl({ hour: 'numeric', minute: '2-digit' }, Date.UTC(2000, 0, 1, Number(p[0]), Number(p[1]))) || h;
    return Number(p[0]) + NB + 'h' + NB + p[1];
  }
  function moisCourt(m) {
    return LOCALE ? formatIntl({ month: 'short' }, Date.UTC(2000, m - 1, 15)) : MOIS_COURT[m - 1];
  }

  // Un tirage reproductible, pour que le ciel de la couverture soit toujours
  // le même pour un couple.
  function graine(texte) {
    var h = 2166136261;
    for (var i = 0; i < texte.length; i++) { h ^= texte.charCodeAt(i); h = Math.imul(h, 16777619); }
    return function () { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
  }

  // Le point d'une longitude sur un cercle : le Bélier à gauche, les signes
  // dans le sens inverse des aiguilles d'une montre (comme js/astro-roue.js).
  function pt(r, lon) {
    var t = (180 + lon) * Math.PI / 180;
    return [r * Math.cos(t), -r * Math.sin(t)];
  }

  function afficher(zone, R, T, opts) {
    var options = opts || {};
    var L = (T && T.rapport) || {};
    var lire = function (chemin, defaut) {
      var o = L, k = chemin.split('.');
      for (var i = 0; i < k.length; i++) { if (o == null) return defaut; o = o[k[i]]; }
      return o == null ? defaut : o;
    };
    var A = R.personnes[0], B = R.personnes[1];
    var qui = function (k) { return k === 'a' ? A : B; };
    var nomSigne = function (s) { return (T.signes && T.signes[s] && T.signes[s].nom) || s; };
    // « en Bélier » (insécable en français), « in Aries », « im Widder » :
    // signes.<s>.en de la langue.
    var enSigne = function (s) {
      var f = (T.signes && T.signes[s] && T.signes[s].en) || ('en ' + nomSigne(s));
      return LANG === 'fr' ? f.replace(/^en /, 'en' + NB) : f;
    };
    var nomPlanete = function (n) { return lire('planetes.' + n, n); };
    var lonDe = function (k, n) { return R.themes[k === 'a' ? 0 : 1].planetes[n].lon; };
    var html = [];
    var num = 0;
    var sommaire = [];

    // ── En-tête d'une partie ──────────────────────────────────
    function tete(id, titre, intro, options) {
      options = options || {};
      num++;
      sommaire.push({ id: id, n: num, titre: titre, glyphe: options.glyphe || '' });
      return '<div class="ar-tete ar-revele">' +
        (options.glyphe ? '<span class="ar-tete-glyphe" aria-hidden="true">' + g(options.glyphe) + '</span>' : '<span class="ar-tete-etoile" aria-hidden="true">✦</span>') +
        '<p class="ar-tete-num">' + esc(tpl(lire(options.glyphe ? 'chapitre' : 'partie', ''), { n: ROMAINS[num - 1] })) + '</p>' +
        '<h2 class="ar-tete-titre" id="' + id + '-titre">' + esc(titre) + '</h2>' +
        (intro ? '<p class="ar-tete-intro">' + esc(intro) + '</p>' : '') +
        '</div>';
    }
    function section(id, contenu, classe) {
      return '<section class="ar-section' + (classe ? ' ' + classe : '') + '" id="' + id + '" aria-labelledby="' + id + '-titre">' + contenu + '</section>';
    }

    // ── Les constellations ────────────────────────────────────
    function constellation(cle, donnees, couleur, idGrad) {
      var c = donnees && donnees[cle];
      if (!c) return '';
      var o = [];
      (c.c || []).forEach(function (s) {
        var r = Math.max(0.35, 1.5 - s[2] * 0.22);
        o.push('<circle cx="' + f1(s[0] * 100) + '" cy="' + f1(-s[1] * 100) + '" r="' + f1(r) + '" fill="#cdd3ff" opacity="' + f1(Math.max(0.18, 0.75 - s[2] * 0.11)) + '"/>');
      });
      (c.a || []).forEach(function (e) {
        var p = c.s[e[0]], q = c.s[e[1]];
        o.push('<line x1="' + f1(p[0] * 100) + '" y1="' + f1(-p[1] * 100) + '" x2="' + f1(q[0] * 100) + '" y2="' + f1(-q[1] * 100) + '" stroke="' + couleur + '" stroke-width="1.1" stroke-opacity="0.75" stroke-linecap="round" pathLength="1"/>');
      });
      c.s.forEach(function (s) {
        var r = Math.max(1.6, 4.6 - s[2] * 0.7);
        o.push('<circle cx="' + f1(s[0] * 100) + '" cy="' + f1(-s[1] * 100) + '" r="' + f1(r * 2.6) + '" fill="url(#' + idGrad + ')"/>');
        o.push('<circle cx="' + f1(s[0] * 100) + '" cy="' + f1(-s[1] * 100) + '" r="' + f1(r) + '" fill="#fff"/>');
      });
      return o.join('');
    }

    // ── La couverture ─────────────────────────────────────────
    function couverture(donnees) {
      var r = graine(A.prenom + A.date + B.prenom + B.date);
      var etoiles = [];
      for (var i = 0; i < 170; i++) {
        var x = r() * 1000, y = r() * 1000, t = r();
        var rayon = t > 0.97 ? 1.9 : t > 0.85 ? 1.2 : 0.7;
        etoiles.push('<circle cx="' + f1(x) + '" cy="' + f1(y) + '" r="' + rayon + '" fill="#fff" opacity="' + f1(0.25 + r() * 0.6) + '"' +
          (t > 0.93 ? ' class="ar-scintille" style="animation-delay:' + f1(r() * 5) + 's"' : '') + '/>');
      }
      var ia = SIGNES.indexOf(A.signe), ib = SIGNES.indexOf(B.signe);
      var nee = function (p) {
        var nee = accord(tpl(lire(p.heure ? 'neeHeure' : 'nee', ''), { p: esc(p.prenom), date: dateLongue(p.date), heure: heureLongue(p.heure) }), p.genre);
        // « a las 14:30 », mais « a la 1:15 ».
        return LANG === 'es' ? nee.replace(/\ba las 1:/, 'a la 1:') : nee;
      };
      // Le dessin : le cercle du zodiaque, vos deux signes allumés, et vos deux
      // constellations dedans, côte à côte sur un grand écran, l'une au-dessus
      // de l'autre sur un téléphone.
      var portrait = window.innerWidth < 700;
      var vb = portrait ? '-250 -290 500 580' : '-300 -250 600 500';
      var posA = portrait ? 'translate(-26 -100) scale(1.02)' : 'translate(-112 -12) scale(0.98)';
      var posB = portrait ? 'translate(26 100) scale(1.02)' : 'translate(112 12) scale(0.98)';
      var fil = portrait ? 'M-26 -100 C 120 -60, -120 60, 26 100' : 'M-112 -12 C -40 -130, 40 130, 112 12';
      var anneau = '<circle r="230" fill="none" stroke="rgba(240,207,134,0.32)" stroke-width="1"/><circle r="210" fill="none" stroke="rgba(240,207,134,0.14)" stroke-width="1"/>';
      for (var k = 0; k < 12; k++) {
        var t1 = pt(210, k * 30), t2 = pt(230, k * 30), c = pt(220, k * 30 + 15);
        var actif = k === ia ? 'a' : k === ib ? 'b' : '';
        anneau += '<line x1="' + f1(t1[0]) + '" y1="' + f1(t1[1]) + '" x2="' + f1(t2[0]) + '" y2="' + f1(t2[1]) + '" stroke="rgba(240,207,134,0.25)" stroke-width="1"/>' +
          '<text x="' + f1(c[0]) + '" y="' + f1(c[1]) + '" class="ar-couv-gs' + (actif ? ' est-' + actif : '') + '" text-anchor="middle" dominant-baseline="central">' + g(GS[k]) + '</text>';
      }
      return '<div class="ar-couv' + (portrait ? ' ar-couv--portrait' : '') + '">' +
        '<svg class="ar-couv-ciel" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' + etoiles.join('') + '</svg>' +
        '<div class="ar-couv-dessin" aria-hidden="true"><svg viewBox="' + vb + '">' +
        '<defs><radialGradient id="ar-halo-a"><stop offset="0" stop-color="#ff9cc6" stop-opacity="0.85"/><stop offset="1" stop-color="#ff9cc6" stop-opacity="0"/></radialGradient>' +
        '<radialGradient id="ar-halo-b"><stop offset="0" stop-color="#b9a4ff" stop-opacity="0.85"/><stop offset="1" stop-color="#b9a4ff" stop-opacity="0"/></radialGradient>' +
        '<radialGradient id="ar-couv-centre"><stop offset="0" stop-color="#1a2156" stop-opacity="0.9"/><stop offset="1" stop-color="#060a1d" stop-opacity="0"/></radialGradient>' +
        '<linearGradient id="ar-fil" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#ff9cc6"/><stop offset="0.5" stop-color="#f0cf86"/><stop offset="1" stop-color="#b9a4ff"/></linearGradient></defs>' +
        '<circle r="230" fill="url(#ar-couv-centre)"/>' +
        '<g class="ar-couv-anneau">' + anneau + '</g>' +
        '<g transform="' + posA + '" class="ar-couv-const ar-couv-const--a">' + constellation(A.signe, donnees, '#ff9cc6', 'ar-halo-a') + '</g>' +
        '<g transform="' + posB + '" class="ar-couv-const ar-couv-const--b">' + constellation(B.signe, donnees, '#b9a4ff', 'ar-halo-b') + '</g>' +
        '<path class="ar-couv-fil" d="' + fil + '" fill="none" stroke="url(#ar-fil)" stroke-width="1.4" stroke-dasharray="3 6" stroke-linecap="round"/>' +
        '</svg></div>' +
        '<div class="ar-couv-texte">' +
        '<p class="ar-couv-kicker">' + esc(lire('kicker', '')) + '</p>' +
        '<h1 class="ar-couv-titre"><span class="ar-a">' + esc(A.prenom) + '</span><span class="ar-et">&amp;</span><span class="ar-b">' + esc(B.prenom) + '</span></h1>' +
        '<p class="ar-couv-signes"><span class="ar-a">' + g(GS[ia]) + ' ' + esc(nomSigne(A.signe)) + '</span><span class="ar-point" aria-hidden="true">✦</span><span class="ar-b">' + g(GS[ib]) + ' ' + esc(nomSigne(B.signe)) + '</span></p>' +
        '<p class="ar-couv-nes">' + nee(A) + '<br>' + nee(B) + '</p>' +
        (R.date ? '<p class="ar-couv-etabli">' + esc(tpl(lire('etabli', ''), { date: dateLongue(R.date) })) + '</p>' : '') +
        '<a class="ar-couv-suite" href="#ar-sommaire">' + esc(lire('defiler', '')) + '<span aria-hidden="true">↓</span></a>' +
        '</div></div>';
    }

    // ── I. La carte du ciel ───────────────────────────────────
    function carte() {
      var lignes = ['soleil', 'lune', 'mercure', 'venus', 'mars'].map(function (n) {
        var cellule = function (p) {
          var P = p.planetes[n];
          var k = p === A ? 'a' : 'b';
          var i = SIGNES.indexOf(P.signe);
          var ou = P.doute && P.doute.length > 1 ? P.doute.filter(function (s) { return s !== P.signe; })[0] : null;
          return '<td data-qui="' + esc(p.prenom) + '" class="ar-place--' + k + '"><span class="ar-place-signe">' + g(GS[i]) + '</span> ' + esc(nomSigne(P.signe)) +
            '<span class="ar-place-deg">' + P.degre + '°</span>' +
            (ou ? '<span class="ar-place-ou">' + esc(tpl(lire('placements.ou', ''), { signe: nomSigne(ou) })) + '</span>' : '') + '</td>';
        };
        return '<tr><th scope="row"><span class="ar-place-gp">' + g(GP[n]) + '</span>' + esc(nomPlanete(n)) + '</th>' + cellule(A) + cellule(B) + '</tr>';
      }).join('');
      var doute = [A, B].some(function (p) { return Object.keys(p.planetes).some(function (n) { return p.planetes[n].doute; }); });
      var roue = window.QCAstroRoue ? window.QCAstroRoue.svg(R, { lecteur: lire('sections.carte', '') }) : '';
      return section('ar-carte',
        tete('ar-carte', lire('sections.carte', ''), tpl(lire('intros.carte', ''), { a: A.prenom, b: B.prenom })) +
        '<div class="ar-carte-grille">' +
        '<figure class="ar-roue ar-revele">' + roue +
        '<figcaption class="ar-legende">' +
        '<span><i class="ar-pastille ar-pastille--a"></i>' + esc(tpl(lire('planetesDe', ''), { p: A.prenom })) + '</span>' +
        '<span><i class="ar-pastille ar-pastille--b"></i>' + esc(tpl(lire('planetesDe', ''), { p: B.prenom })) + '</span>' +
        '<span><i class="ar-trait ar-trait--doux"></i>' + esc(lire('legende.doux', '')) + '</span>' +
        '<span><i class="ar-trait ar-trait--tendu"></i>' + esc(lire('legende.tendu', '')) + '</span>' +
        '</figcaption></figure>' +
        '<div class="ar-places ar-revele"><table class="ar-places-table"><caption>' + esc(lire('placements.titre', '')) + '</caption>' +
        '<thead><tr><th scope="col">' + esc(lire('placements.planete', '')) + '</th><th scope="col" class="ar-a">' + esc(A.prenom) + '</th><th scope="col" class="ar-b">' + esc(B.prenom) + '</th></tr></thead>' +
        '<tbody>' + lignes + '</tbody></table>' +
        (doute ? '<p class="ar-note">' + esc(lire('placements.doute', '')) + '</p>' : '') +
        '</div></div>');
    }

    // ── II. Le profil ─────────────────────────────────────────
    function profil() {
      var P = R.profil;
      var arch = (T.ciel && T.ciel.archetypes) || {};
      var x = 20 + P.douceur * 2.6, y = 280 - P.etincelle * 2.6;
      var quart = function (cle, cx, cy) {
        var actif = cle === P.archetype;
        return '<text x="' + cx + '" y="' + cy + '" class="ar-quart' + (actif ? ' est-actif' : '') + '" text-anchor="middle">' + esc((arch[cle] && arch[cle].nom) || '') + '</text>';
      };
      var schema = '<svg class="ar-profil-svg" viewBox="0 0 300 300" role="img" aria-label="' + esc(lire('axes.douceur', '') + ' ' + P.douceur + ', ' + lire('axes.etincelle', '') + ' ' + P.etincelle) + '">' +
        '<defs><radialGradient id="ar-profil-halo"><stop offset="0" stop-color="#f0cf86" stop-opacity="0.9"/><stop offset="1" stop-color="#f0cf86" stop-opacity="0"/></radialGradient></defs>' +
        '<rect x="20" y="20" width="260" height="260" rx="18" class="ar-profil-fond"/>' +
        '<rect x="150" y="20" width="130" height="130" class="ar-profil-zone' + (P.archetype === 'flamme' ? ' est-actif' : '') + '"/>' +
        '<rect x="20" y="20" width="130" height="130" class="ar-profil-zone' + (P.archetype === 'aimants' ? ' est-actif' : '') + '"/>' +
        '<rect x="150" y="150" width="130" height="130" class="ar-profil-zone' + (P.archetype === 'havre' ? ' est-actif' : '') + '"/>' +
        '<rect x="20" y="150" width="130" height="130" class="ar-profil-zone' + (P.archetype === 'explorateurs' ? ' est-actif' : '') + '"/>' +
        '<line x1="150" y1="20" x2="150" y2="280" class="ar-profil-axe"/><line x1="20" y1="150" x2="280" y2="150" class="ar-profil-axe"/>' +
        quart('aimants', 85, 46) + quart('flamme', 215, 46) + quart('explorateurs', 85, 266) + quart('havre', 215, 266) +
        '<text x="150" y="296" class="ar-profil-lib" text-anchor="middle">' + esc(lire('axes.douceur', '')) + ' →</text>' +
        '<text x="8" y="150" class="ar-profil-lib" text-anchor="middle" transform="rotate(-90 8 150)">' + esc(lire('axes.etincelle', '')) + ' →</text>' +
        '<circle cx="' + f1(x) + '" cy="' + f1(y) + '" r="26" fill="url(#ar-profil-halo)" class="ar-profil-halo"/>' +
        '<circle cx="' + f1(x) + '" cy="' + f1(y) + '" r="7" class="ar-profil-point"/>' +
        '</svg>';
      var jauge = function (cle, v) {
        return '<div class="ar-mini"><div class="ar-mini-tete"><span>' + esc(lire('axes.' + cle, '')) + '</span><b>' + v + '</b></div>' +
          '<div class="ar-barre ar-barre--' + cle + '"><span style="--v:' + v + '%"></span></div></div>';
      };
      return section('ar-profil',
        tete('ar-profil', lire('sections.profil', ''), lire('intros.profil', '')) +
        '<div class="ar-profil-grille">' +
        '<div class="ar-profil-carte ar-revele"><p class="ar-profil-kicker">' + esc(lire('sections.profil', '')) + '</p>' +
        '<p class="ar-profil-nom">' + esc(P.nom) + '</p><p class="ar-profil-accroche">' + esc(P.accroche) + '</p>' +
        schema + jauge('douceur', P.douceur) + jauge('etincelle', P.etincelle) + '</div>' +
        '<div class="ar-texte ar-revele">' + P.texte.map(function (t) { return '<p>' + esc(t) + '</p>'; }).join('') + '</div>' +
        '</div>');
    }

    // ── III. Les domaines ─────────────────────────────────────
    function domaines() {
      return section('ar-domaines',
        tete('ar-domaines', lire('sections.domaines', ''), lire('intros.domaines', '')) +
        '<div class="ar-domaines">' + R.domaines.map(function (d) {
          return '<article class="ar-domaine ar-domaine--' + d.niveau + ' ar-revele">' +
            '<div class="ar-domaine-tete"><h3>' + esc(d.nom) + '</h3><span class="ar-niveau ar-niveau--' + d.niveau + '">' + esc(lire('niveaux.' + d.niveau, '')) + '</span><b class="ar-domaine-note">' + d.note + '<small>/100</small></b></div>' +
            '<div class="ar-barre ar-barre--' + d.niveau + '" role="img" aria-label="' + esc(d.nom + ' ' + d.note + '/100') + '"><span style="--v:' + d.note + '%"></span></div>' +
            '<p>' + esc(d.texte) + '</p></article>';
        }).join('') + '</div>');
    }

    // ── IV. Atouts et défis ───────────────────────────────────
    function carteLien(l, classe) {
      var glyphes = (function () {
        var p = l.cle.split('-');
        var kx = l.sens === 'ba' ? 'b' : 'a', ky = kx === 'a' ? 'b' : 'a';
        return '<span class="ar-lien-gp ar-' + kx + '">' + g(GP[p[0]]) + '</span><span class="ar-lien-asp">' + (l.aspect ? g(GA[l.aspect]) : '≈') + '</span><span class="ar-lien-gp ar-' + ky + '">' + g(GP[p[1]]) + '</span>';
      })();
      return '<article class="ar-lien ' + classe + ' ar-revele"><div class="ar-lien-glyphes" aria-hidden="true">' + glyphes + '</div>' +
        '<div><h4>' + esc(l.titre) + '</h4><span class="ar-chip">' + esc(l.aspect ? lire('aspects.' + l.aspect, '') : lire('relations.' + l.relation, '')) + '</span><p>' + esc(l.texte) + '</p></div></article>';
    }
    function atouts() {
      var colonne = function (titre, liste, classe, vide) {
        return '<div class="ar-colonne"><h3 class="ar-colonne-titre ' + classe + '">' + esc(titre) + '</h3>' +
          (liste.length ? liste.map(function (l) { return carteLien(l, classe); }).join('') : '<p class="ar-vide">' + esc(vide) + '</p>') + '</div>';
      };
      return section('ar-atouts',
        tete('ar-atouts', lire('sections.atouts', ''), lire('intros.atouts', '')) +
        '<div class="ar-deux-colonnes">' +
        colonne(lire('atoutsTitre', ''), R.atouts, 'ar-lien--atout', lire('aucunAtout', '')) +
        colonne(lire('defisTitre', ''), R.defis, 'ar-lien--defi', lire('aucunDefi', '')) +
        '</div>');
    }

    // ── V. Les éléments ───────────────────────────────────────
    var SYMBOLES = {
      feu: '<path d="M0 -15 L13 9 L-13 9 Z"/>',
      terre: '<path d="M0 15 L13 -9 L-13 -9 Z"/><line x1="-8" y1="1" x2="8" y2="1"/>',
      air: '<path d="M0 -15 L13 9 L-13 9 Z"/><line x1="-8" y1="-1" x2="8" y2="-1"/>',
      eau: '<path d="M0 15 L13 -9 L-13 -9 Z"/>'
    };
    function elements() {
      var E = R.elements;
      var compter = function (p, el) {
        return Object.keys(p.planetes).filter(function (n) { return ELEMENTS[SIGNES.indexOf(p.planetes[n].signe) % 4] === el; }).length;
      };
      var colonnes = ELEMENTS.map(function (el) {
        var na = compter(A, el), nb = compter(B, el);
        var points = '';
        for (var i = 0; i < na; i++) points += '<i class="ar-el-point ar-el-point--a"></i>';
        for (var j = 0; j < nb; j++) points += '<i class="ar-el-point ar-el-point--b"></i>';
        var domine = E.egalite && E.egalite.length ? E.egalite.indexOf(el) >= 0 : el === E.dominant;
        var marque = domine ? '<span class="ar-el-marque">' + esc(lire('dominant', '')) + '</span>' : (E.manquant.indexOf(el) >= 0 ? '<span class="ar-el-marque ar-el-marque--absent">' + esc(lire('absent', '')) + '</span>' : '');
        return '<div class="ar-el ar-el--' + el + (domine ? ' est-dominant' : '') + ' ar-revele">' +
          '<svg viewBox="-20 -20 40 40" class="ar-el-symbole" aria-hidden="true">' + SYMBOLES[el] + '</svg>' +
          '<p class="ar-el-nom">' + esc((T.elements && T.elements[el] && T.elements[el].nom) || el) + '</p>' +
          '<p class="ar-el-n">' + (na + nb) + '</p>' +
          '<div class="ar-el-points" aria-label="' + esc(A.prenom + ' ' + na + ', ' + B.prenom + ' ' + nb) + '">' + points + '</div>' + marque + '</div>';
      }).join('');
      return section('ar-elements',
        tete('ar-elements', lire('sections.elements', ''), lire('intros.elements', '')) +
        '<div class="ar-els">' + colonnes + '</div>' +
        '<div class="ar-legende ar-legende--centre"><span><i class="ar-pastille ar-pastille--a"></i>' + esc(A.prenom) + '</span><span><i class="ar-pastille ar-pastille--b"></i>' + esc(B.prenom) + '</span></div>' +
        '<div class="ar-texte ar-texte--centre ar-revele">' + E.texte.map(function (t) { return '<p>' + esc(t) + '</p>'; }).join('') + '</div>');
    }

    // ── Les chapitres des planètes ────────────────────────────
    // Le petit cercle de l'écart : les deux planètes à leur place, l'arc qui
    // les sépare, en or quand elles s'accordent, en corail quand elles se
    // frottent, gris sans aspect.
    function cercleEcart(lonX, lonY, aspect, desir, gx, gy, cx, cy) {
      var d = ((lonY - lonX) % 360 + 360) % 360;
      var sens = d <= 180 ? 1 : -1;
      var ecart = d <= 180 ? d : 360 - d;
      var couleur = !aspect ? '#8c93c2' : (DOUX[aspect] || desir) ? '#f0cf86' : '#ff8f80';
      var a = pt(44, lonX), b = pt(44, lonY);
      var arc = 'M' + f1(a[0]) + ' ' + f1(a[1]) + ' A44 44 0 0 ' + (sens > 0 ? 0 : 1) + ' ' + f1(b[0]) + ' ' + f1(b[1]);
      var ticks = '';
      for (var s = 0; s < 12; s++) {
        var t1 = pt(50, s * 30), t2 = pt(55, s * 30);
        ticks += '<line x1="' + f1(t1[0]) + '" y1="' + f1(t1[1]) + '" x2="' + f1(t2[0]) + '" y2="' + f1(t2[1]) + '"/>';
      }
      return '<svg class="ar-ecart" viewBox="-64 -64 128 128" role="img" aria-label="' + esc(tpl(lire('angle', ''), { n: Math.round(ecart) })) + '">' +
        '<circle r="50" class="ar-ecart-cercle"/><g class="ar-ecart-ticks">' + ticks + '</g>' +
        '<path d="' + arc + '" fill="none" stroke="' + couleur + '" stroke-width="3" stroke-linecap="round"' + (aspect && !(DOUX[aspect] || desir) ? ' stroke-dasharray="5 4"' : '') + '/>' +
        '<line x1="' + f1(a[0]) + '" y1="' + f1(a[1]) + '" x2="' + f1(b[0]) + '" y2="' + f1(b[1]) + '" stroke="' + couleur + '" stroke-opacity="0.35" stroke-width="1"/>' +
        '<circle cx="' + f1(a[0]) + '" cy="' + f1(a[1]) + '" r="9" fill="#0b1233" stroke="' + cx + '" stroke-width="1.6"/><text x="' + f1(a[0]) + '" y="' + f1(a[1]) + '" fill="' + cx + '" class="ar-ecart-gp" text-anchor="middle" dominant-baseline="central">' + g(gx) + '</text>' +
        '<circle cx="' + f1(b[0]) + '" cy="' + f1(b[1]) + '" r="9" fill="#0b1233" stroke="' + cy + '" stroke-width="1.6"/><text x="' + f1(b[0]) + '" y="' + f1(b[1]) + '" fill="' + cy + '" class="ar-ecart-gp" text-anchor="middle" dominant-baseline="central">' + g(gy) + '</text>' +
        '<text x="0" y="-2" class="ar-ecart-deg" text-anchor="middle">' + Math.round(ecart) + '°</text>' +
        '<text x="0" y="14" class="ar-ecart-asp" text-anchor="middle">' + (aspect ? g(GA[aspect]) : '') + '</text>' +
        '</svg>';
    }
    var COULEUR = { a: '#ff9cc6', b: '#b9a4ff' };
    function chapitre(c) {
      var personnes = c.blocs.filter(function (b) { return b.type === 'personne'; });
      var lien = c.blocs.filter(function (b) { return b.type === 'lien'; })[0];
      var carteP = function (b) {
        var p = qui(b.qui), i = SIGNES.indexOf(b.signe);
        return '<article class="ar-perso ar-perso--' + b.qui + ' ar-revele">' +
          '<span class="ar-perso-filigrane" aria-hidden="true">' + g(GS[i]) + '</span>' +
          '<p class="ar-perso-kicker">' + g(GP[b.planete]) + ' ' + esc(nomPlanete(b.planete)) + ' · ' + b.degre + '° ' + esc(nomSigne(b.signe)) + '</p>' +
          '<h3>' + esc(b.titre) + '</h3><p>' + esc(b.texte) + '</p>' +
          (b.note ? '<p class="ar-note">' + esc(b.note) + '</p>' : '') +
          (b.alternative ? '<details class="ar-autre"><summary>' + esc(b.alternative.titre) + '</summary><p>' + esc(b.alternative.texte) + '</p></details>' : '') +
          '</article>';
      };
      var pont = '';
      if (lien) {
        pont = '<article class="ar-pont ar-revele">' +
          cercleEcart(lonDe('a', c.cle), lonDe('b', c.cle), lien.aspect, c.cle === 'mars', GP[c.cle], GP[c.cle], COULEUR.a, COULEUR.b) +
          '<div><h3>' + esc(lien.titre) + '</h3><span class="ar-chip">' + esc(lien.aspect ? lire('aspects.' + lien.aspect, '') : lire('relations.' + lien.relation, '')) + '</span>' +
          '<p>' + esc(lien.texte) + '</p></div></article>';
      }
      return section('ar-' + c.cle,
        tete('ar-' + c.cle, c.titre, c.intro, { glyphe: GP[c.cle] }) +
        '<div class="ar-duo">' + personnes.map(carteP).join('') + '</div>' + pont, 'ar-chap');
    }
    function chapitreLiens(c) {
      if (!c.blocs.length) return '';
      return section('ar-liens',
        tete('ar-liens', c.titre, c.intro, { glyphe: '☌' }) +
        '<div class="ar-liens">' + c.blocs.map(function (b) {
          var p = b.cle.split('-');
          var kx = b.sens === 'ab' ? 'a' : 'b', ky = b.sens === 'ab' ? 'b' : 'a';
          return '<article class="ar-pont ar-pont--croise ar-revele">' +
            cercleEcart(lonDe(kx, p[0]), lonDe(ky, p[1]), b.aspect, b.cle === 'venus-mars', GP[p[0]], GP[p[1]], COULEUR[kx], COULEUR[ky]) +
            '<div><h3>' + esc(b.titre) + '</h3><span class="ar-chip">' + esc(b.aspect ? lire('aspects.' + b.aspect, '') : lire('relations.' + b.relation, '')) + '</span>' +
            '<p>' + esc(b.texte) + '</p></div></article>';
        }).join('') + '</div>', 'ar-chap');
    }

    // ── Les signes chinois ────────────────────────────────────
    function chinois() {
      var C = R.chinois;
      var sceau = function (k) {
        var c = C[k], p = qui(k);
        var nom = lire('chinois.animaux.' + c.animal, c.animal), el = lire('chinois.elements.' + c.element, c.element);
        return '<div class="ar-sceau ar-sceau--' + k + ' ar-revele"><div class="ar-sceau-rond" aria-hidden="true"><span class="ar-sceau-han">' + HAN[c.animal] + '</span><span class="ar-sceau-el">' + HAN_EL[c.element] + '</span></div>' +
          '<p class="ar-sceau-nom">' + esc(p.prenom) + '</p><p class="ar-sceau-an">' + esc(tpl(lire('chinois.annee', ''), { animal: nom, element: el, an: c.an })) + '</p></div>';
      };
      return section('ar-chinois',
        tete('ar-chinois', lire('sections.chinois', ''), lire('intros.chinois', '')) +
        '<div class="ar-sceaux">' + sceau('a') + '<div class="ar-sceaux-lien"><span>' + esc(C.titre) + '</span></div>' + sceau('b') + '</div>' +
        '<div class="ar-texte ar-texte--centre ar-revele">' + C.texte.map(function (t) { return '<p>' + esc(t) + '</p>'; }).join('') + '</div>' +
        '<div class="ar-duo">' + C.portraits.map(function (pt2) {
          var c = C[pt2.qui];
          var kicker = tpl(lire('chinois.portrait', ''), { p: qui(pt2.qui).prenom, animal: lire('chinois.animaux.' + c.animal, c.animal), element: lire('chinois.elements.' + c.element, c.element) });
          return '<article class="ar-perso ar-perso--' + pt2.qui + ' ar-revele"><span class="ar-perso-filigrane ar-perso-filigrane--han" aria-hidden="true">' + HAN[c.animal] + '</span>' +
            '<p class="ar-perso-kicker">' + esc(kicker) + '</p><p>' + esc(pt2.texte) + '</p></article>';
        }).join('') + '</div>');
    }

    // ── Les chemins de vie ────────────────────────────────────
    function vie() {
      var V = R.vie;
      var rond = function (k, n, texte) {
        return '<article class="ar-vie ar-vie--' + k + ' ar-revele"><div class="ar-vie-rond"><span>' + n + '</span></div>' +
          '<p class="ar-vie-lib">' + esc(lire('vie.chemin', '')) + ' · ' + esc(qui(k).prenom) + '</p><p>' + esc(texte) + '</p></article>';
      };
      return section('ar-vie',
        tete('ar-vie', lire('sections.vie', ''), lire('intros.vie', '')) +
        '<div class="ar-duo">' + rond('a', V.a, V.texteA) + rond('b', V.b, V.texteB) + '</div>' +
        '<div class="ar-accord ar-revele"><p class="ar-accord-n">' + esc(tpl(lire('vie.accord', ''), { n: V.note })) + '</p>' +
        '<div class="ar-barre ar-barre--or"><span style="--v:' + (V.note * 10) + '%"></span></div><p>' + esc(V.accord) + '</p></div>');
    }

    // ── L'année ───────────────────────────────────────────────
    function annee() {
      var M = R.annee.mois;
      var frise = '<ol class="ar-frise ar-revele" aria-label="' + esc(lire('annee.frise', '')) + '">' + M.map(function (m) {
        var mm = Number(m.mois.slice(5, 7));
        return '<li class="ar-frise-mois ar-ton--' + m.ton + (m.meilleur ? ' est-meilleur' : '') + (m.prudence ? ' est-prudence' : '') + '">' +
          '<a href="#ar-mois-' + m.mois + '"><span class="ar-frise-gl" aria-hidden="true">' + g(GLYPHE_TON[m.ton]) + '</span>' +
          '<span class="ar-frise-nom">' + esc(moisCourt(mm)) + '</span><span class="ar-frise-ton">' + esc(lire('annee.tons.' + m.ton, '')) + '</span></a></li>';
      }).join('') + '</ol>';
      var cartes = M.map(function (m) {
        var badges = '';
        if (m.meilleur) badges += '<span class="ar-badge ar-badge--meilleur">✦ ' + esc(lire('annee.meilleur', '')) + '</span>';
        if (m.prudence) badges += '<span class="ar-badge ar-badge--prudence">' + esc(lire('annee.prudence', '')) + '</span>';
        var ciel = ['venus', 'mars', 'jupiter'].map(function (n) {
          return '<span class="ar-transit"><b>' + g(GP[n]) + '</b>' + esc(tpl(lire('annee.' + n, ''), { en: enSigne(m.planetes[n]) })) + '</span>';
        }).join('');
        var notes = m.notes.map(function (n) {
          var anniv = n.type === 'anniv';
          return '<li class="' + (anniv ? 'ar-note-anniv' : 'ar-note-retro') + '"><span aria-hidden="true">' + (anniv ? '★' : '℞') + '</span>' + esc(n.texte) + '</li>';
        }).join('');
        return '<article class="ar-mois ar-ton--' + m.ton + (m.meilleur ? ' est-meilleur' : '') + ' ar-revele" id="ar-mois-' + m.mois + '">' +
          '<div class="ar-mois-tete"><h3>' + esc(m.libelle.charAt(0).toUpperCase() + m.libelle.slice(1)) + '</h3><span class="ar-mois-ton"><span aria-hidden="true">' + g(GLYPHE_TON[m.ton]) + '</span> ' + esc(m.titre) + '</span></div>' +
          (badges ? '<div class="ar-badges">' + badges + '</div>' : '') +
          '<p>' + esc(m.texte) + '</p>' +
          '<div class="ar-transits">' + ciel + '</div>' +
          (notes ? '<ul class="ar-mois-notes">' + notes + '</ul>' : '') + '</article>';
      }).join('');
      return section('ar-annee',
        tete('ar-annee', lire('sections.annee', ''), lire('intros.annee', '')) + frise + '<div class="ar-moiss">' + cartes + '</div>');
    }

    // ── Les questions ─────────────────────────────────────────
    function questions() {
      return section('ar-questions',
        tete('ar-questions', lire('sections.questions', ''), lire('intros.questions', '')) +
        '<ol class="ar-questions">' + R.questions.map(function (q, i) {
          return '<li class="ar-question ar-revele"><span class="ar-question-n" aria-hidden="true">' + (i + 1) + '</span><p>' + esc(q) + '</p></li>';
        }).join('') + '</ol>');
    }

    // ── La fin ────────────────────────────────────────────────
    function fin() {
      return '<section class="ar-section ar-fin" id="ar-fin" aria-labelledby="ar-fin-titre"><div class="ar-tete"><span class="ar-tete-etoile" aria-hidden="true">✦</span><h2 class="ar-tete-titre" id="ar-fin-titre">' + esc(lire('sections.fin', '')) + '</h2></div>' +
        '<div class="ar-texte ar-texte--centre">' + R.fin.map(function (t) { return '<p>' + esc(t) + '</p>'; }).join('') + '</div>' +
        '<div class="ar-actions">' +
        '<button type="button" class="ar-bouton ar-bouton--or" data-ar="imprimer">' + esc(lire('fin.imprimer', '')) + '</button>' +
        '<button type="button" class="ar-bouton" data-ar="copier">' + esc(lire('fin.copier', '')) + '</button>' +
        '</div>' +
        '<p class="ar-garde">' + esc(lire('fin.garde', '')) + '</p>' +
        '<p class="ar-supprimer"><button type="button" class="ar-lien-discret" data-ar="supprimer">' + esc(lire('fin.supprimer', '')) + '</button></p>' +
        '<p class="ar-rappel">' + esc(lire('rappel', '')) + '</p>' +
        '<p class="ar-credits">' + esc(lire('credits', '')) + '</p></section>';
    }

    // ── L'assemblage ──────────────────────────────────────────
    function construire(donnees) {
      num = 0; sommaire = [];
      var corps = [];
      corps.push(carte());
      corps.push(profil());
      corps.push(domaines());
      corps.push(atouts());
      corps.push(elements());
      R.chapitres.forEach(function (c) { corps.push(c.cle === 'liens' ? chapitreLiens(c) : chapitre(c)); });
      corps.push(chinois());
      corps.push(vie());
      corps.push(annee());
      corps.push(questions());
      var somm = '<nav class="ar-sommaire" id="ar-sommaire" aria-labelledby="ar-sommaire-titre"><h2 id="ar-sommaire-titre">' + esc(lire('sommaire', '')) + '</h2><ol>' +
        sommaire.map(function (s) {
          return '<li><a href="#' + s.id + '"><span class="ar-somm-n">' + ROMAINS[s.n - 1] + '</span><span class="ar-somm-t">' + esc(s.titre) + '</span>' + (s.glyphe ? '<span class="ar-somm-g" aria-hidden="true">' + g(s.glyphe) + '</span>' : '') + '</a></li>';
        }).join('') + '</ol></nav>';
      var barre = '<div class="ar-barre-lecture" aria-hidden="true"><div class="ar-barre-lecture-in"><span class="ar-barre-lecture-n"></span><span class="ar-barre-lecture-t"></span><a href="#ar-sommaire" class="ar-barre-lecture-somm">' + esc(lire('sommaire', '')) + '</a></div><i></i></div>';
      zone.innerHTML = '<div class="ar' + (reduit ? '' : ' ar-anim') + '" lang="' + esc(R.lang || 'fr') + '">' + barre + couverture(donnees) + somm + corps.join('') + fin() + '</div>';
      apres();
    }

    var reduit = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ── Ce qui bouge : entrées à l'écran, barre de lecture, boutons ─
    function apres() {
      var racine = zone.querySelector('.ar');
      if ('IntersectionObserver' in window && !reduit) {
        var io = new IntersectionObserver(function (entrees) {
          entrees.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('est-vu'); io.unobserve(e.target); } });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
        racine.querySelectorAll('.ar-revele').forEach(function (el) { io.observe(el); });
      } else {
        racine.classList.remove('ar-anim');
      }
      // La barre de lecture : la partie en cours et l'avancée dans le rapport.
      var barre = racine.querySelector('.ar-barre-lecture');
      var nEl = barre.querySelector('.ar-barre-lecture-n'), tEl = barre.querySelector('.ar-barre-lecture-t'), trait = barre.querySelector('i');
      var sections = [].slice.call(racine.querySelectorAll('.ar-section[id]'));
      var titres = {};
      sommaire.forEach(function (s) { titres[s.id] = s; });
      var enCours = null, attente = false;
      function maj() {
        attente = false;
        var haut = racine.getBoundingClientRect().top;
        var total = racine.offsetHeight - window.innerHeight;
        var p = total > 0 ? Math.min(1, Math.max(0, -haut / total)) : 0;
        var visible = -haut > window.innerHeight * 0.6;
        var actif = null;
        for (var i = 0; i < sections.length; i++) {
          if (sections[i].getBoundingClientRect().top < window.innerHeight * 0.35) actif = sections[i]; else break;
        }
        barre.classList.toggle('est-visible', visible);
        trait.style.transform = 'scaleX(' + p.toFixed(4) + ')';
        var s = actif && titres[actif.id];
        if (s !== enCours) {
          enCours = s;
          nEl.textContent = s ? ROMAINS[s.n - 1] : '';
          tEl.textContent = s ? s.titre : '';
        }
      }
      window.addEventListener('scroll', function () { if (!attente) { attente = true; requestAnimationFrame(maj); } }, { passive: true });
      maj();

      racine.addEventListener('click', function (e) {
        var b = e.target.closest('[data-ar]');
        if (!b) return;
        var quoi = b.getAttribute('data-ar');
        if (quoi === 'imprimer') { window.print(); return; }
        if (quoi === 'copier') {
          var fait = function () { var t = b.textContent; b.textContent = lire('fin.copie', t); setTimeout(function () { b.textContent = t; }, 2200); };
          if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(location.href).then(fait, function () {});
          return;
        }
        if (quoi === 'supprimer') {
          if (!b.classList.contains('est-arme')) {
            b.classList.add('est-arme');
            b.dataset.texte = b.textContent;
            b.textContent = lire('fin.confirmer', b.textContent);
            b.dataset.quand = String(Date.now());
            setTimeout(function () { if (b.classList.contains('est-arme')) { b.classList.remove('est-arme'); b.textContent = b.dataset.texte; } }, 5000);
            return;
          }
          if (Date.now() - Number(b.dataset.quand || 0) < 400) return;
          b.disabled = true;
          if (typeof options.supprimer === 'function') {
            options.supprimer().then(function () {
              zone.innerHTML = '<p class="as-chargement">' + esc(lire('fin.supprime', '')) + '</p>';
              window.scrollTo(0, 0);
            }, function () { b.disabled = false; });
          }
        }
      });
    }

    // Les constellations de la couverture : le même fichier que la scène.
    fetch('/astro/constellations.json').then(function (r) { return r.json(); }).then(construire, function () { construire(null); });
  }

  window.QCAstroRapport = { afficher: afficher };
})();
