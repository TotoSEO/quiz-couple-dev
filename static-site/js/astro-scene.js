/* La scène du thème astral de couple : un ciel en WebGL que le défilement
 * fait avancer, image par image, et qui se rembobine quand on remonte.
 *
 * La section #as-scene est haute de plusieurs écrans ; sa scène (.as-stage)
 * reste collée en haut (position: sticky) pendant qu'on la traverse. La
 * progression p (0 en haut de la section, 1 en bas) se lit sur la position
 * de la section, et l'image dessinée est une fonction de p seulement : on
 * peut donc avancer, s'arrêter, revenir en arrière. p affiché rattrape p lu
 * avec un léger amorti, pour que tout glisse.
 *
 * Ce qui se passe, dans l'ordre : le ciel, la constellation de la première
 * personne qui se dessine étoile après étoile, celle de la seconde, les deux
 * qui se rapprochent au milieu de la roue du zodiaque, les planètes qui
 * tournent, le fil d'or qui relie les deux constellations, et le bouton.
 *
 * Dessin : des points (étoiles, planètes) et des traits (tracés des
 * constellations, roue, orbites, fil d'or) en mélange additif, sans
 * bibliothèque. Les étiquettes (prénoms, glyphes) sont des éléments HTML
 * placés par la même projection. Sans WebGL ou avec le mouvement réduit,
 * la page montre l'image finale, fixe.
 *
 * window.QCAstroScene.monter(section, options) ; options : { donnees (les
 * constellations, /astro/constellations.json), a, b ({ signe, prenom,
 * glyphe }), surProgression(p) }. */
(function () {
  'use strict';

  var TAU = Math.PI * 2;
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function fen(p, a, b) { return clamp((p - a) / (b - a), 0, 1); }
  function lisse(t) { return t * t * (3 - 2 * t); }
  function douce(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function mix(a, b, t) { return a + (b - a) * t; }
  function mix3(a, b, t) { return [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)]; }
  function graine(s) { return function () { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }
  function hex(h) { return [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255]; }

  var ROSE = hex('#ff9cc6'), LAVANDE = hex('#b9a4ff'), OR = hex('#f0cf86'), BLANC = [1, 1, 1];

  // ── Matrices (colonnes d'abord, comme WebGL) ──────────────────
  function perspective(fovy, aspect, near, far) {
    var f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
    return [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0];
  }
  function regard(e, c, u) {
    var zx = e[0] - c[0], zy = e[1] - c[1], zz = e[2] - c[2];
    var l = Math.hypot(zx, zy, zz) || 1; zx /= l; zy /= l; zz /= l;
    var xx = u[1] * zz - u[2] * zy, xy = u[2] * zx - u[0] * zz, xz = u[0] * zy - u[1] * zx;
    l = Math.hypot(xx, xy, xz) || 1; xx /= l; xy /= l; xz /= l;
    var yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
    return [xx, yx, zx, 0, xy, yy, zy, 0, xz, yz, zz, 0,
      -(xx * e[0] + xy * e[1] + xz * e[2]), -(yx * e[0] + yy * e[1] + yz * e[2]), -(zx * e[0] + zy * e[1] + zz * e[2]), 1];
  }
  function mul(a, b) {
    var o = new Array(16);
    for (var i = 0; i < 4; i++) for (var j = 0; j < 4; j++) {
      o[j * 4 + i] = a[i] * b[j * 4] + a[4 + i] * b[j * 4 + 1] + a[8 + i] * b[j * 4 + 2] + a[12 + i] * b[j * 4 + 3];
    }
    return o;
  }

  // ── Shaders ───────────────────────────────────────────────────
  var VS_POINTS = [
    'attribute vec3 a_pos; attribute float a_taille; attribute vec3 a_coul; attribute float a_alpha; attribute float a_phase; attribute float a_type;',
    'uniform mat4 u_pv; uniform float u_temps; uniform float u_px; uniform float u_max;',
    'varying vec3 v_coul; varying float v_alpha; varying float v_type;',
    'void main(){ vec4 p = u_pv * vec4(a_pos, 1.0); gl_Position = p;',
    ' float tw = a_type > 0.5 ? 1.0 : 0.78 + 0.22 * sin(u_temps * (1.1 + a_phase) + a_phase * 37.0);',
    ' float t = a_taille * u_px / max(p.w, 0.05); gl_PointSize = clamp(t, 1.6, a_type > 0.5 ? u_max : 96.0);',
    ' v_coul = a_coul; v_type = a_type; v_alpha = a_alpha * tw * (a_type > 0.5 ? 1.0 : clamp(t / 1.6, 0.25, 1.0)); }'
  ].join('\n');
  var FS_POINTS = [
    'precision mediump float; varying vec3 v_coul; varying float v_alpha; varying float v_type;',
    'void main(){ vec2 c = gl_PointCoord - 0.5; float d = dot(c, c) * 4.0;',
    ' if (v_type > 0.5) { float n = exp(-d * 2.6) * (1.0 - d); float an = max(n, 0.0) * v_alpha; if (an < 0.002) discard; gl_FragColor = vec4(v_coul * an, an); return; }',
    ' float coeur = exp(-d * 16.0); float halo = exp(-d * 3.2) * 0.42;',
    ' float a = (coeur + halo) * v_alpha; if (a < 0.004) discard;',
    ' gl_FragColor = vec4(mix(v_coul, vec3(1.0), coeur * 0.55) * a, a); }'
  ].join('\n');
  var VS_TRAITS = [
    'attribute vec2 a_xy; attribute float a_v; attribute vec4 a_coul;',
    'varying float v_v; varying vec4 v_coul;',
    'void main(){ gl_Position = vec4(a_xy, 0.0, 1.0); v_v = a_v; v_coul = a_coul; }'
  ].join('\n');
  var FS_TRAITS = [
    'precision mediump float; varying float v_v; varying vec4 v_coul;',
    'void main(){ float x = abs(v_v); float coeur = 1.0 - smoothstep(0.18, 0.42, x);',
    ' float halo = exp(-x * x * 7.0) * 0.38; float a = (coeur * 0.85 + halo) * v_coul.a;',
    ' if (a < 0.003) discard; gl_FragColor = vec4(v_coul.rgb * a, a); }'
  ].join('\n');

  function compiler(gl, type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader');
    return s;
  }
  function programme(gl, vs, fs) {
    var p = gl.createProgram();
    gl.attachShader(p, compiler(gl, gl.VERTEX_SHADER, vs));
    gl.attachShader(p, compiler(gl, gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) || 'programme');
    return p;
  }

  // ── Mise en page selon l'écran ────────────────────────────────
  // En portrait, les deux constellations se posent l'une au-dessus de
  // l'autre ; en paysage, côte à côte.
  function miseEnPage(portrait) {
    if (portrait) return {
      a0: [-1.15, 2.6, -12], b0: [1.15, -2.4, -12], ech0: 2.15,
      a1: [-0.78, 1.45, -12], b1: [0.8, -0.85, -12], ech1: 0.98,
      anneau: { c: [0, 0.3, -12], r: 2.3, incl: 1.1 },
      cadreA: 5.0, cadreFin: 7.2, cadreLarge: 10
    };
    return {
      a0: [-2.5, 1.2, -12], b0: [2.5, -1.0, -12], ech0: 2.4,
      a1: [-1.6, 0.42, -12], b1: [1.6, 0.42, -12], ech1: 1.38,
      anneau: { c: [0, 0.3, -12], r: 3.55, incl: 1.12 },
      cadreA: 6.2, cadreFin: 8.2, cadreLarge: 14
    };
  }

  // Les attributs du contexte : astro.js demande le même contexte dès le
  // chargement (même toile, mêmes attributs, donc le même objet) pour savoir
  // tout de suite s'il faut la version fixe, avant que la personne défile.
  var ATTRIBUTS_GL = { antialias: false, alpha: true, premultipliedAlpha: true, powerPreference: 'high-performance' };

  function monter(section, options) {
    var stage = section.querySelector('.as-stage');
    var canvas = section.querySelector('.as-canvas');
    var couche = section.querySelector('.as-etiquettes');
    var reduit = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var gl = null;
    try {
      gl = canvas.getContext('webgl', ATTRIBUTS_GL);
    } catch (e) { gl = null; }
    if (!gl) { section.classList.add('as-sans-gl'); return null; }

    // Programmes, emplacements et tampons : créés ici, et recréés si le
    // téléphone retire le contexte WebGL à la page (appli mise en arrière-plan,
    // mémoire) puis le lui rend. Sans ça, le ciel restait noir au retour.
    var progP, progT, locP, locT, bufFond, bufPoints, bufTraits;
    var tailleMax = 96;
    var NEB = 10;
    var capaPoints = 0, capaTraits = 0;
    function initialiserGL() {
      progP = programme(gl, VS_POINTS, FS_POINTS);
      progT = programme(gl, VS_TRAITS, FS_TRAITS);
      locP = {
        pos: gl.getAttribLocation(progP, 'a_pos'), taille: gl.getAttribLocation(progP, 'a_taille'),
        coul: gl.getAttribLocation(progP, 'a_coul'), alpha: gl.getAttribLocation(progP, 'a_alpha'),
        phase: gl.getAttribLocation(progP, 'a_phase'), type: gl.getAttribLocation(progP, 'a_type'),
        pv: gl.getUniformLocation(progP, 'u_pv'), temps: gl.getUniformLocation(progP, 'u_temps'), px: gl.getUniformLocation(progP, 'u_px'),
        max: gl.getUniformLocation(progP, 'u_max')
      };
      locT = {
        xy: gl.getAttribLocation(progT, 'a_xy'), v: gl.getAttribLocation(progT, 'a_v'), coul: gl.getAttribLocation(progT, 'a_coul')
      };
      bufFond = gl.createBuffer(); bufPoints = gl.createBuffer(); bufTraits = gl.createBuffer();
      capaPoints = 0; capaTraits = 0;
      try { tailleMax = Math.min(1024, gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE)[1] || 96); } catch (e) { tailleMax = 96; }
    }
    try { initialiserGL(); } catch (e) {
      section.classList.add('as-sans-gl');
      return null;
    }

    // ── Le fond : des étoiles réparties en profondeur ────────────
    var rnd = graine(20261123);
    var portrait = false, W = 1, H = 1, dpr = 1;
    var nFond = 0;
    function construireFond() {
      // Toujours le même tirage : le ciel ne change pas quand on tourne le
      // téléphone ou quand le contexte WebGL revient.
      rnd = graine(20261123);
      var grand = W * H / (dpr * dpr) >= 500000;
      var n = grand ? 4200 : 2800;
      var neb = tailleMax >= 256 ? 26 : 0;
      var d = new Float32Array((n + neb) * NEB);
      var k = 0;
      function poser(x, y, z, taille, c, alpha, phase, type) {
        d[k] = x; d[k + 1] = y; d[k + 2] = z; d[k + 3] = taille; d[k + 4] = c[0]; d[k + 5] = c[1]; d[k + 6] = c[2];
        d[k + 7] = alpha; d[k + 8] = phase; d[k + 9] = type; k += NEB;
      }
      // La Voie lactée : une bande inclinée où les étoiles se serrent.
      var incl = -0.42, ci = Math.cos(incl), si = Math.sin(incl);
      for (var i = 0; i < n; i++) {
        var proche = i < n * 0.06, bande = !proche && i < n * 0.42;
        var x, y, z;
        if (bande) {
          var u = (rnd() * 2 - 1) * 46, v = ((rnd() + rnd() + rnd()) / 3 - 0.5) * 9;
          x = u * ci - v * si; y = u * si + v * ci; z = -22 - rnd() * 50;
        } else {
          // L'étendue suit l'écran : haute et étroite en portrait, large en
          // paysage, pour que les étoiles tombent là où l'on regarde.
          var ex = portrait ? 22 : 60, ey = portrait ? 42 : 36;
          x = (rnd() * 2 - 1) * (proche ? 9 : ex); y = (rnd() * 2 - 1) * (proche ? 9 : ey);
          z = proche ? -2 - rnd() * 10 : -16 - rnd() * 60;
        }
        var m = 6.4 - 5.6 * Math.pow(rnd(), bande ? 3.4 : 2.4);
        var taille = 0.04 + 0.19 * Math.pow(2.512, (1.5 - m) / 1.6);
        var r = rnd(), c = r < 0.58 ? [1, 1, 1] : r < 0.74 ? [0.78, 0.86, 1] : r < 0.9 ? [1, 0.93, 0.8] : [1, 0.8, 0.64];
        poser(x, y, z, taille, c, 0.55 + 0.45 * rnd(), rnd(), 0);
      }
      // Des nuées de couleur, très pâles, qui bougent avec la profondeur.
      var COUL = [[0.42, 0.32, 0.95], [0.95, 0.38, 0.62], [0.3, 0.45, 1], [0.55, 0.3, 0.85]];
      for (var j = 0; j < neb; j++) {
        var bandeN = j < neb * 0.6;
        var un = (rnd() * 2 - 1) * 40, vn = (rnd() - 0.5) * 7;
        var xn = bandeN ? un * ci - vn * si : (rnd() * 2 - 1) * 34, yn = bandeN ? un * si + vn * ci : (rnd() * 2 - 1) * 22;
        poser(xn, yn, -30 - rnd() * 30, 9 + rnd() * 12, COUL[j % 4], 0.05 + 0.05 * rnd(), 0, 1);
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, bufFond);
      gl.bufferData(gl.ARRAY_BUFFER, d, gl.STATIC_DRAW);
      nFond = n + neb;
    }

    // ── Les deux constellations ─────────────────────────────────
    function preparer(cle, couleur) {
      var c = options.donnees[cle];
      var r2 = graine(cle.length * 7919 + 13);
      var etoiles = c.s.map(function (s) {
        return { x: s[0], y: s[1], z: (r2() - 0.5) * 0.5, mag: s[2] };
      });
      var champ = c.c.map(function (s) {
        return { x: s[0], y: s[1], z: (r2() - 0.5) * 1.6, mag: s[2] };
      });
      // L'ordre du tracé : on part de l'étoile la plus brillante et on suit
      // les traits de proche en proche.
      var plusBrillante = 0;
      etoiles.forEach(function (e, i) { if (e.mag < etoiles[plusBrillante].mag) plusBrillante = i; });
      var restants = c.a.slice(), ordre = [], atteints = {};
      atteints[plusBrillante] = true;
      while (restants.length) {
        var k = -1;
        for (var i = 0; i < restants.length; i++) {
          if (atteints[restants[i][0]] || atteints[restants[i][1]]) { k = i; break; }
        }
        if (k < 0) k = 0;
        var t = restants.splice(k, 1)[0];
        if (!atteints[t[0]] && atteints[t[1]]) t = [t[1], t[0]];
        atteints[t[0]] = true; atteints[t[1]] = true;
        ordre.push(t);
      }
      // L'apparition des étoiles suit le tracé.
      var rang = {}, n = 0;
      rang[plusBrillante] = n++;
      ordre.forEach(function (t) { if (rang[t[1]] === undefined) rang[t[1]] = n++; if (rang[t[0]] === undefined) rang[t[0]] = n++; });
      etoiles.forEach(function (e, i) { if (rang[i] === undefined) rang[i] = n++; e.rang = rang[i] / Math.max(1, n - 1); });
      return { etoiles: etoiles, champ: champ, traits: ordre, couleur: couleur, brillante: plusBrillante };
    }
    var CA = preparer(options.a.signe, ROSE);
    var CB = preparer(options.b.signe, LAVANDE);

    // ── Les étiquettes HTML ─────────────────────────────────────
    function etiquette(classe, html) {
      var e = document.createElement('span');
      e.className = 'as-etiquette ' + classe;
      e.innerHTML = html;
      couche.appendChild(e);
      return e;
    }
    var GLYPHES = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
    var etSignes = GLYPHES.map(function (g, i) {
      var cl = 'as-etiquette--signe' + (i === options.a.signeIndex ? ' est-a' : '') + (i === options.b.signeIndex ? ' est-b' : '');
      return etiquette(cl, g + '︎');
    });
    var PLANETES = [
      { g: '☉', r: 0.62, v: 0.10, a0: 0.4, inconnu: false, coul: OR },
      { g: '☽', r: 0.48, v: -0.16, a0: 2.2, inconnu: true, coul: [0.86, 0.9, 1] },
      { g: '☿', r: 0.36, v: 0.24, a0: 4.1, inconnu: false, coul: [0.8, 0.86, 1] },
      { g: '♀', r: 0.76, v: 0.07, a0: 3.0, inconnu: true, coul: ROSE },
      { g: '♂', r: 0.88, v: -0.05, a0: 5.4, inconnu: true, coul: [1, 0.62, 0.5] }
    ];
    var etPlanetes = PLANETES.map(function (pl) {
      return etiquette('as-etiquette--planete', '<b>' + pl.g + '︎</b>' + (pl.inconnu ? '<i>?</i>' : ''));
    });
    var etNomA = etiquette('as-etiquette--nom est-a', options.a.html);
    var etNomB = etiquette('as-etiquette--nom est-b', options.b.html);

    // ── L'état d'une image, fonction de p ───────────────────────
    var MP = miseEnPage(false);
    function cles(p, liste) {
      // liste : [{ p, ... }] → interpolation douce entre les deux clés qui
      // encadrent p.
      if (p <= liste[0].p) return { a: liste[0], b: liste[0], t: 0 };
      for (var i = 0; i < liste.length - 1; i++) {
        if (p <= liste[i + 1].p) return { a: liste[i], b: liste[i + 1], t: douce((p - liste[i].p) / (liste[i + 1].p - liste[i].p)) };
      }
      var d = liste[liste.length - 1];
      return { a: d, b: d, t: 0 };
    }
    function distancePour(cadre) {
      var demi = Math.tan(FOV / 2);
      var parH = cadre / 2 / demi;
      var parW = cadre / 2 / (demi * (W / H));
      return Math.max(parH, parW);
    }
    var FOV = 50 * Math.PI / 180;
    function camera(p) {
      var ac = MP.a0, bc = MP.b0, an = MP.anneau.c;
      // `ecran` : la part de la largeur dont on décale l'image vers la droite
      // (en paysage, les légendes sont à gauche) ; `haut` : la part de la
      // hauteur dont on la remonte (les légendes sont en bas en portrait,
      // et le bouton en bas à la fin).
      var E = portrait ? 0 : 0.17, Hh = portrait ? 0.13 : 0;
      var K = [
        { p: 0, c: [0, 0, -12], cadre: MP.cadreLarge, d: [0, 0], ecran: 0, haut: 0 },
        { p: 0.1, c: [mix(0, ac[0], 0.35), mix(0, ac[1], 0.35), -12], cadre: MP.cadreLarge * 0.8, d: [0.3, -0.2], ecran: E * 0.5, haut: Hh * 0.5 },
        { p: 0.2, c: ac, cadre: MP.cadreA, d: [0.9, -0.5], ecran: E, haut: Hh },
        { p: 0.31, c: ac, cadre: MP.cadreA * 0.97, d: [0.6, -0.3], ecran: E, haut: Hh },
        { p: 0.42, c: bc, cadre: MP.cadreA, d: [-0.9, 0.5], ecran: E, haut: Hh },
        { p: 0.52, c: bc, cadre: MP.cadreA * 0.97, d: [-0.6, 0.3], ecran: E, haut: Hh },
        { p: 0.66, c: an, cadre: MP.cadreFin * 1.06, d: [0, -1.4], ecran: E, haut: Hh },
        { p: 0.82, c: an, cadre: MP.cadreFin, d: [0.2, -2.1], ecran: E, haut: Hh },
        { p: 1, c: an, cadre: MP.cadreFin * 0.98, d: [0, -1.6], ecran: 0, haut: portrait ? 0.19 : 0.2 }
      ];
      var k = cles(p, K);
      var c = mix3(k.a.c, k.b.c, k.t);
      var cadre = mix(k.a.cadre, k.b.cadre, k.t);
      var dx = mix(k.a.d[0], k.b.d[0], k.t), dy = mix(k.a.d[1], k.b.d[1], k.t);
      var dist = distancePour(cadre);
      var visH = 2 * dist * Math.tan(FOV / 2), visW = visH * W / H;
      var ex = -visW * mix(k.a.ecran, k.b.ecran, k.t), ey = -visH * mix(k.a.haut, k.b.haut, k.t);
      var cible = [c[0] + ex, c[1] + ey, c[2]];
      return { oeil: [cible[0] + dx, cible[1] + dy, cible[2] + dist], cible: cible };
    }
    function placement(qui, p) {
      var debut = qui === 'a' ? MP.a0 : MP.b0, fin = qui === 'a' ? MP.a1 : MP.b1;
      var t = douce(fen(p, 0.55, 0.7));
      var ech = mix(MP.ech0, MP.ech1, t);
      var rot = (qui === 'a' ? -0.1 : 0.08) * (1 - t);
      return { c: mix3(debut, fin, t), ech: ech, rot: rot };
    }
    function versMonde(pl, e, flotte) {
      var cs = Math.cos(pl.rot), sn = Math.sin(pl.rot);
      var x = e.x * pl.ech, y = e.y * pl.ech;
      return [pl.c[0] + x * cs - y * sn, pl.c[1] + x * sn + y * cs + flotte, pl.c[2] + e.z * pl.ech * 0.5];
    }
    function pointAnneau(angle, rayon) {
      var A = MP.anneau, r = rayon || A.r;
      var x = Math.cos(angle) * r, y = Math.sin(angle) * r;
      return [A.c[0] + x, A.c[1] + y * Math.cos(A.incl), A.c[2] - y * Math.sin(A.incl)];
    }
    function angleSigne(i, tour) { return -Math.PI / 2 + (i * 30 + 15) * Math.PI / 180 + tour; }

    // ── Les tampons de chaque image ─────────────────────────────
    // Deux tableaux de flottants gardés d'une image à l'autre et agrandis au
    // besoin : en créer de nouveaux à chaque image (une centaine de kilo-octets)
    // faisait travailler le ramasse-miettes, d'où des à-coups de temps en temps.
    var tabPts = new Float32Array(NEB * 1024), nPts = 0;
    var tabTr = new Float32Array(42 * 1024), nTr = 0;
    function agrandir(t, besoin) {
      var n = t.length;
      while (n < besoin) n *= 2;
      var g = new Float32Array(n);
      g.set(t);
      return g;
    }
    function point(pos, taille, coul, alpha, phase) {
      if (alpha <= 0.002) return;
      if (nPts + NEB > tabPts.length) tabPts = agrandir(tabPts, nPts + NEB);
      tabPts[nPts] = pos[0]; tabPts[nPts + 1] = pos[1]; tabPts[nPts + 2] = pos[2]; tabPts[nPts + 3] = taille;
      tabPts[nPts + 4] = coul[0]; tabPts[nPts + 5] = coul[1]; tabPts[nPts + 6] = coul[2];
      tabPts[nPts + 7] = alpha; tabPts[nPts + 8] = phase || 0; tabPts[nPts + 9] = 0;
      nPts += NEB;
    }
    var PV = null, pvTab = new Float32Array(16);
    function proj(pos) {
      var m = PV, x = pos[0], y = pos[1], z = pos[2];
      var cx = m[0] * x + m[4] * y + m[8] * z + m[12];
      var cy = m[1] * x + m[5] * y + m[9] * z + m[13];
      var cw = m[3] * x + m[7] * y + m[11] * z + m[15];
      if (cw <= 0.05) return null;
      return [cx / cw, cy / cw, cw];
    }
    function trait(p0, p1, largeurPx, coul, alpha, fraction) {
      if (alpha <= 0.002 || fraction <= 0) return;
      var a = proj(p0), b = proj(p1);
      if (!a || !b) return;
      if (fraction < 1) b = [a[0] + (b[0] - a[0]) * fraction, a[1] + (b[1] - a[1]) * fraction, b[2]];
      var ax = (a[0] + 1) * W / 2, ay = (1 - a[1]) * H / 2, bx = (b[0] + 1) * W / 2, by = (1 - b[1]) * H / 2;
      var dx = bx - ax, dy = by - ay, l = Math.hypot(dx, dy);
      if (l < 0.5) return;
      var hw = largeurPx * dpr * 2.2;
      var nx = -dy / l * hw, ny = dx / l * hw;
      var iW = 2 / W, iH = 2 / H;
      var c0x = (ax + nx) * iW - 1, c0y = 1 - (ay + ny) * iH, c1x = (ax - nx) * iW - 1, c1y = 1 - (ay - ny) * iH;
      var c2x = (bx + nx) * iW - 1, c2y = 1 - (by + ny) * iH, c3x = (bx - nx) * iW - 1, c3y = 1 - (by - ny) * iH;
      if (nTr + 42 > tabTr.length) tabTr = agrandir(tabTr, nTr + 42);
      sommet(c0x, c0y, 1, coul, alpha); sommet(c1x, c1y, -1, coul, alpha); sommet(c2x, c2y, 1, coul, alpha);
      sommet(c2x, c2y, 1, coul, alpha); sommet(c1x, c1y, -1, coul, alpha); sommet(c3x, c3y, -1, coul, alpha);
    }
    function sommet(x, y, v, coul, alpha) {
      tabTr[nTr] = x; tabTr[nTr + 1] = y; tabTr[nTr + 2] = v; tabTr[nTr + 3] = coul[0]; tabTr[nTr + 4] = coul[1]; tabTr[nTr + 5] = coul[2]; tabTr[nTr + 6] = alpha;
      nTr += 7;
    }

    // Les styles ne sont écrits que s'ils changent : une étiquette cachée ne
    // coûte rien d'une image à l'autre.
    function ecrire(el, o, t) {
      if (el._o !== o) { el._o = o; el.style.opacity = o; }
      if (t && el._t !== t) { el._t = t; el.style.transform = t; }
    }
    function placerEtiquette(el, pos, alpha, decalPx) {
      var q = alpha > 0.01 ? proj(pos) : null;
      if (!q) { ecrire(el, '0'); return; }
      var x = (q[0] + 1) * W / 2 / dpr, y = (1 - q[1]) * H / 2 / dpr + (decalPx || 0);
      ecrire(el, alpha.toFixed(3), 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) translate(-50%,-50%)');
    }

    function dessinerConstellation(C, qui, p, temps, deb, fin, attenue) {
      var pl = placement(qui, p);
      var flotte = Math.sin(temps * 0.6 + (qui === 'a' ? 0 : 2)) * 0.04;
      var montre = fen(p, deb, fin);
      var vis = attenue;
      // Le champ autour de la figure : il se lève en premier.
      var champ = lisse(fen(p, deb - 0.02, deb + 0.07)) * vis;
      C.champ.forEach(function (e, i) {
        var taille = (0.028 + 0.06 * Math.pow(2.512, (3.5 - e.mag) / 2)) * pl.ech / 2.4;
        point(versMonde(pl, e, flotte), taille, [0.82, 0.88, 1], champ * 0.5, (i % 13) / 13);
      });
      var teinte = mix3(BLANC, C.couleur, 0.32);
      C.etoiles.forEach(function (e, i) {
        var t = lisse(fen(montre, e.rang * 0.72, e.rang * 0.72 + 0.14));
        var eclat = t * vis;
        var taille = (0.11 + 0.28 * Math.pow(2.512, (2.2 - e.mag) / 2.3)) * pl.ech / 2.4;
        var pop = 1 + 0.6 * Math.max(0, 1 - Math.abs(montre - e.rang * 0.72 - 0.07) * 14);
        point(versMonde(pl, e, flotte), taille * pop, teinte, eclat, i * 0.37 % 1);
      });
      var couleurTrait = mix3(OR, C.couleur, 0.42);
      var n = C.traits.length;
      C.traits.forEach(function (t, j) {
        var d0 = 0.1 + (j / Math.max(1, n)) * 0.72;
        var f = lisse(fen(montre, d0, d0 + 0.16));
        trait(versMonde(pl, C.etoiles[t[0]], flotte), versMonde(pl, C.etoiles[t[1]], flotte), 0.9, couleurTrait, 0.85 * vis, f);
      });
      return { pl: pl, flotte: flotte };
    }

    // ── Une image ───────────────────────────────────────────────
    function dessiner(p, temps) {
      gl.viewport(0, 0, W, H);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      var cam = camera(p);
      PV = mul(perspective(FOV, W / H, 0.1, 200), regard(cam.oeil, cam.cible, [0, 1, 0]));
      nPts = 0; nTr = 0;

      // La première constellation reste là, plus discrète, pendant qu'on
      // regarde la seconde ; les deux reviennent en pleine lumière à la fin.
      var attA = 1 - 0.45 * fen(p, 0.33, 0.4) + 0.45 * fen(p, 0.55, 0.66);
      var attB = 1;
      var ra = dessinerConstellation(CA, 'a', p, temps, 0.11, 0.3, attA);
      var rb = dessinerConstellation(CB, 'b', p, temps, 0.33, 0.52, attB);

      // La roue du zodiaque, qui tourne doucement.
      var tour = temps * 0.035 + p * 0.9;
      var roue = lisse(fen(p, 0.56, 0.68));
      if (roue > 0) {
        var seg = 96;
        for (var i = 0; i < seg; i++) {
          var a0 = i / seg * TAU, a1 = (i + 1) / seg * TAU;
          var f = clamp(roue * seg - i, 0, 1);
          if (f > 0) trait(pointAnneau(a0 + tour), pointAnneau(a1 + tour), 0.55, OR, 0.55 * roue, f);
          if (f > 0 && i % 2 === 0) trait(pointAnneau(a0 + tour, MP.anneau.r * 1.12), pointAnneau(a1 + tour, MP.anneau.r * 1.12), 0.35, OR, 0.22 * roue, f);
        }
        for (var s = 0; s < 12; s++) {
          var as = -Math.PI / 2 + s * 30 * Math.PI / 180 + tour;
          trait(pointAnneau(as), pointAnneau(as, MP.anneau.r * 1.12), 0.45, OR, 0.5 * roue, 1);
          var estA = s === options.a.signeIndex, estB = s === options.b.signeIndex;
          var milieu = pointAnneau(angleSigne(s, tour), MP.anneau.r * 1.06);
          var mis = estA || estB ? Math.max(roue, 0) : roue * 0.75;
          placerEtiquette(etSignes[s], milieu, mis, 0);
          if (estA || estB) point(pointAnneau(angleSigne(s, tour), MP.anneau.r), 0.16, estA ? ROSE : LAVANDE, roue * 0.9, 0.2);
        }
        // L'arc d'or entre les deux signes, par le plus court chemin.
        var arc = lisse(fen(p, 0.63, 0.72));
        if (arc > 0) {
          var aa = angleSigne(options.a.signeIndex, tour), ab = angleSigne(options.b.signeIndex, tour);
          var diff = ((ab - aa) % TAU + TAU * 1.5) % TAU - Math.PI;
          var pas = 40;
          for (var k = 0; k < pas; k++) {
            var fk = clamp(arc * pas - k, 0, 1);
            if (fk <= 0) break;
            trait(pointAnneau(aa + diff * k / pas, MP.anneau.r * 0.985), pointAnneau(aa + diff * (k + 1) / pas, MP.anneau.r * 0.985), 1.1, OR, 0.95, fk);
          }
        }
      } else {
        etSignes.forEach(function (e) { ecrire(e, '0'); });
      }

      // Les planètes, sur une orbite intérieure, avec un point
      // d'interrogation sur celles qu'on ne connaît pas encore.
      var pla = lisse(fen(p, 0.72, 0.82));
      var calme = 1 - 0.55 * fen(p, 0.88, 0.96);
      PLANETES.forEach(function (pl, i) {
        var r = MP.anneau.r * pl.r;
        if (pla > 0) {
          var seg2 = 72;
          for (var j = 0; j < seg2; j++) {
            if (j % 3 === 2) continue;
            var b0 = j / seg2 * TAU, b1 = (j + 1) / seg2 * TAU;
            trait(pointAnneau(b0, r), pointAnneau(b1, r), 0.3, [0.75, 0.78, 1], 0.16 * pla * calme, 1);
          }
        }
        var ang = pl.a0 + temps * pl.v + p * pl.v * 6;
        var pos = pointAnneau(ang, r);
        var apparu = lisse(fen(p, 0.73 + i * 0.015, 0.8 + i * 0.015));
        point(pos, 0.26, pl.coul, apparu, 0.5);
        placerEtiquette(etPlanetes[i], pos, apparu * (1 - fen(p, 0.87, 0.93)), -22);
      });

      // Le fil d'or entre les deux constellations : une courbe qui monte un
      // peu, tracée d'une étoile à l'autre, puis une étincelle qui la parcourt.
      var fil = lisse(fen(p, 0.85, 0.94));
      var pa = versMonde(ra.pl, CA.etoiles[CA.brillante], ra.flotte);
      var pb = versMonde(rb.pl, CB.etoiles[CB.brillante], rb.flotte);
      var milieu = [(pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2 + Math.hypot(pb[0] - pa[0], pb[1] - pa[1]) * 0.28, (pa[2] + pb[2]) / 2 + 0.6];
      function courbe(t) {
        var u = 1 - t;
        return [u * u * pa[0] + 2 * u * t * milieu[0] + t * t * pb[0], u * u * pa[1] + 2 * u * t * milieu[1] + t * t * pb[1], u * u * pa[2] + 2 * u * t * milieu[2] + t * t * pb[2]];
      }
      if (fil > 0) {
        var nf = 36;
        for (var q = 0; q < nf; q++) {
          var fq = clamp(fil * nf - q, 0, 1);
          if (fq <= 0) break;
          trait(courbe(q / nf), courbe((q + 1) / nf), 1.25, OR, 0.95, fq);
          trait(courbe(q / nf), courbe((q + 1) / nf), 4.2, OR, 0.14, fq);
        }
      }
      var eclat = lisse(fen(p, 0.92, 1));
      if (eclat > 0) {
        var tt = (temps * 0.22) % 1;
        point(courbe(tt), 0.34, OR, eclat * 0.95, 0.1);
        point(courbe((tt + 0.5) % 1), 0.22, [1, 0.95, 0.85], eclat * 0.7, 0.4);
        point(pa, 0.46, ROSE, eclat * 0.85, 0.3);
        point(pb, 0.46, LAVANDE, eclat * 0.85, 0.6);
      }

      // Les prénoms au-dessus de chaque constellation.
      // À la fin, ils s'effacent presque : le fil d'or et la légende suffisent.
      var finNoms = 1 - 0.8 * lisse(fen(p, 0.86, 0.93));
      var nomA = (lisse(fen(p, 0.17, 0.24)) * (1 - 0.6 * fen(p, 0.33, 0.4)) + 0.6 * lisse(fen(p, 0.66, 0.74))) * finNoms;
      var nomB = lisse(fen(p, 0.39, 0.46)) * finNoms;
      placerEtiquette(etNomA, [ra.pl.c[0], ra.pl.c[1] + ra.pl.ech * 1.08, ra.pl.c[2]], clamp(nomA, 0, 1), 0);
      placerEtiquette(etNomB, [rb.pl.c[0], rb.pl.c[1] + rb.pl.ech * 1.08, rb.pl.c[2]], clamp(nomB, 0, 1), 0);

      // Le fond, plus discret quand on regarde une constellation de près.
      gl.useProgram(progP);
      pvTab.set(PV);
      gl.uniformMatrix4fv(locP.pv, false, pvTab);
      gl.uniform1f(locP.temps, temps);
      gl.uniform1f(locP.px, H / (2 * Math.tan(FOV / 2)));
      gl.uniform1f(locP.max, tailleMax);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE);
      dessinerPoints(bufFond, nFond, false);
      if (nPts) {
        gl.bindBuffer(gl.ARRAY_BUFFER, bufPoints);
        if (capaPoints < tabPts.length) { gl.bufferData(gl.ARRAY_BUFFER, tabPts.byteLength, gl.DYNAMIC_DRAW); capaPoints = tabPts.length; }
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, tabPts.subarray(0, nPts));
        dessinerPoints(bufPoints, nPts / NEB, true);
      }
      if (nTr) {
        gl.useProgram(progT);
        gl.bindBuffer(gl.ARRAY_BUFFER, bufTraits);
        if (capaTraits < tabTr.length) { gl.bufferData(gl.ARRAY_BUFFER, tabTr.byteLength, gl.DYNAMIC_DRAW); capaTraits = tabTr.length; }
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, tabTr.subarray(0, nTr));
        var o = 7 * 4;
        gl.enableVertexAttribArray(locT.xy); gl.vertexAttribPointer(locT.xy, 2, gl.FLOAT, false, o, 0);
        gl.enableVertexAttribArray(locT.v); gl.vertexAttribPointer(locT.v, 1, gl.FLOAT, false, o, 8);
        gl.enableVertexAttribArray(locT.coul); gl.vertexAttribPointer(locT.coul, 4, gl.FLOAT, false, o, 12);
        gl.drawArrays(gl.TRIANGLES, 0, nTr / 7);
        gl.disableVertexAttribArray(locT.xy); gl.disableVertexAttribArray(locT.v); gl.disableVertexAttribArray(locT.coul);
      }
    }
    function dessinerPoints(buf, n, dynamique) {
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      var o = NEB * 4;
      gl.enableVertexAttribArray(locP.pos); gl.vertexAttribPointer(locP.pos, 3, gl.FLOAT, false, o, 0);
      gl.enableVertexAttribArray(locP.taille); gl.vertexAttribPointer(locP.taille, 1, gl.FLOAT, false, o, 12);
      gl.enableVertexAttribArray(locP.coul); gl.vertexAttribPointer(locP.coul, 3, gl.FLOAT, false, o, 16);
      gl.enableVertexAttribArray(locP.alpha); gl.vertexAttribPointer(locP.alpha, 1, gl.FLOAT, false, o, 28);
      gl.enableVertexAttribArray(locP.phase); gl.vertexAttribPointer(locP.phase, 1, gl.FLOAT, false, o, 32);
      gl.enableVertexAttribArray(locP.type); gl.vertexAttribPointer(locP.type, 1, gl.FLOAT, false, o, 36);
      gl.drawArrays(gl.POINTS, 0, n);
      gl.disableVertexAttribArray(locP.pos); gl.disableVertexAttribArray(locP.taille);
      gl.disableVertexAttribArray(locP.coul); gl.disableVertexAttribArray(locP.alpha); gl.disableVertexAttribArray(locP.phase);
      gl.disableVertexAttribArray(locP.type);
    }

    // ── Taille, défilement, boucle ──────────────────────────────
    var hScene = 0;
    function redimensionner() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = stage.clientWidth, h = stage.clientHeight;
      hScene = h;
      W = Math.max(1, Math.round(w * dpr)); H = Math.max(1, Math.round(h * dpr));
      canvas.width = W; canvas.height = H;
      var nouveau = w / h < 0.85;
      if (nouveau !== portrait || !nFond) { portrait = nouveau; MP = miseEnPage(portrait); construireFond(); }
    }
    // La course de la scène collée est la hauteur de la section moins celle de
    // la scène, pas celle de la fenêtre : sur téléphone, la barre d'adresse qui
    // se replie ou revient change window.innerHeight, et la progression
    // sautait alors d'un coup (au début, quand la barre se replie, et quand on
    // remonte, quand elle revient).
    function lireProgression() {
      if (reduit) return 1;
      return progressionDe(section, hScene);
    }

    // L'amorti : court au doigt, où le défilement du téléphone est déjà
    // fluide (un amorti long faisait continuer l'image après qu'on a levé le
    // doigt) ; un peu plus long à la souris, pour lisser les crans de la
    // molette. Aux deux bouts, il se referme vite.
    var doigt = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    var K = doigt ? 16 : 9;
    var perdu = false;
    var pAffiche = lireProgression(), visible = true, enCours = false, dernier = 0, t0 = performance.now();
    function image(maintenant) {
      enCours = false;
      if (!visible || document.hidden) return;
      var dt = Math.min(0.1, (maintenant - (dernier || maintenant)) / 1000);
      dernier = maintenant;
      var cible = lireProgression();
      var k = cible <= 0 || cible >= 1 ? 24 : K;
      pAffiche += (cible - pAffiche) * (1 - Math.exp(-dt * k));
      if (Math.abs(cible - pAffiche) < 0.0004) pAffiche = cible;
      var temps = reduit ? 0 : (maintenant - t0) / 1000;
      if (!perdu) dessiner(pAffiche, temps);
      if (options.surProgression) options.surProgression(pAffiche);
      if (!reduit) demander();
    }
    function demander() { if (!enCours) { enCours = true; requestAnimationFrame(image); } }

    canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); perdu = true; }, false);
    canvas.addEventListener('webglcontextrestored', function () {
      try { initialiserGL(); nFond = 0; construireFond(); perdu = false; demander(); } catch (e) { /* le ciel reste vide, les textes suivent */ }
    }, false);

    redimensionner();
    if ('ResizeObserver' in window) new ResizeObserver(function () { redimensionner(); demander(); }).observe(stage);
    else window.addEventListener('resize', function () { redimensionner(); demander(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entrees) {
        visible = entrees[0].isIntersecting;
        if (visible) { dernier = 0; demander(); }
      }).observe(section);
    }
    document.addEventListener('visibilitychange', function () { if (!document.hidden) { dernier = 0; demander(); } });
    if (reduit) window.addEventListener('resize', demander);
    demander();
    return { progression: function () { return pAffiche; } };
  }

  // La progression d'une scène collée : 0 quand la section touche le haut de
  // l'écran, 1 quand la scène va se décoller, quelle que soit la hauteur de la
  // fenêtre.
  function progressionDe(section, hScene) {
    var r = section.getBoundingClientRect();
    var course = r.height - (hScene || window.innerHeight);
    return course > 0 ? clamp(-r.top / course, 0, 1) : 1;
  }

  window.QCAstroScene = { monter: monter, progressionDe: progressionDe, attributs: ATTRIBUTS_GL };
})();
