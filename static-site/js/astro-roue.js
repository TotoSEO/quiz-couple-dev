/* La roue du thème astral de couple, en SVG : les douze signes, les
 * planètes de la première personne (rose) sur l'anneau extérieur, celles de
 * la seconde (lavande) sur l'anneau intérieur, et au centre les liens entre
 * les deux thèmes (or pour un accord, corail pour une tension). Le Bélier
 * est à gauche et les signes tournent dans le sens inverse des aiguilles
 * d'une montre, comme sur une carte du ciel. Servi à la page de vente
 * (l'aperçu) et au rapport : window.QCAstroRoue.svg(ciel, options).
 * `ciel` est la sortie de QCAstroCiel.cielDuCouple. */
(function () {
  'use strict';
  var GLYPHES = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
  var GP = { soleil: '☉', lune: '☽', mercure: '☿', venus: '♀', mars: '♂' };
  var PLANETES = ['soleil', 'lune', 'mercure', 'venus', 'mars'];
  var TEINTE_ELEMENT = ['rgba(255,140,90,0.10)', 'rgba(140,200,140,0.08)', 'rgba(200,210,255,0.08)', 'rgba(110,160,255,0.10)'];
  var DOUX = { conjonction: 1, trigone: 1, sextile: 1 };

  function pt(r, lon) {
    var t = (180 + lon) * Math.PI / 180;
    return [r * Math.cos(t), -r * Math.sin(t)];
  }
  function f(n) { return Math.round(n * 10) / 10; }
  function arc(r1, r2, l0, l1) {
    var a = pt(r2, l0), b = pt(r2, l1), c = pt(r1, l1), d = pt(r1, l0);
    return 'M' + f(a[0]) + ' ' + f(a[1]) + 'A' + r2 + ' ' + r2 + ' 0 0 0 ' + f(b[0]) + ' ' + f(b[1]) +
      'L' + f(c[0]) + ' ' + f(c[1]) + 'A' + r1 + ' ' + r1 + ' 0 0 1 ' + f(d[0]) + ' ' + f(d[1]) + 'Z';
  }
  // Les glyphes trop proches s'écartent un peu ; le petit trait sur le
  // cercle reste à la vraie longitude.
  function ecarter(lons, ecart) {
    var items = lons.map(function (l, i) { return { i: i, l: l, d: l }; }).sort(function (x, y) { return x.l - y.l; });
    for (var passe = 0; passe < 6; passe++) {
      for (var k = 0; k < items.length; k++) {
        var a = items[k], b = items[(k + 1) % items.length];
        var dist = ((b.d - a.d) % 360 + 360) % 360;
        if (items.length > 1 && dist < ecart) {
          var pousse = (ecart - dist) / 2;
          a.d -= pousse; b.d += pousse;
        }
      }
    }
    var out = [];
    items.forEach(function (it) { out[it.i] = it.d; });
    return out;
  }

  function svg(ciel, options) {
    options = options || {};
    var A = ciel.themes[0].planetes, B = ciel.themes[1].planetes;
    var R = { bord: 196, signes: 170, a: 140, b: 112, centre: 86 };
    var o = [];
    o.push('<svg viewBox="-205 -205 410 410" role="img" aria-label="' + (options.lecteur || '') + '" class="as-roue-svg">');
    o.push('<defs><radialGradient id="as-roue-fond" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#121a44"/><stop offset="100%" stop-color="#0a1030"/></radialGradient></defs>');
    o.push('<circle r="' + R.bord + '" fill="url(#as-roue-fond)" stroke="rgba(240,207,134,0.45)" stroke-width="1.2"/>');
    for (var s = 0; s < 12; s++) {
      o.push('<path d="' + arc(R.signes, R.bord, s * 30, s * 30 + 30) + '" fill="' + TEINTE_ELEMENT[s % 4] + '"/>');
      var l = pt(R.signes, s * 30), m = pt(R.bord, s * 30);
      o.push('<line x1="' + f(l[0]) + '" y1="' + f(l[1]) + '" x2="' + f(m[0]) + '" y2="' + f(m[1]) + '" stroke="rgba(240,207,134,0.4)" stroke-width="0.8"/>');
      var g = pt((R.signes + R.bord) / 2, s * 30 + 15);
      o.push('<text x="' + f(g[0]) + '" y="' + f(g[1]) + '" class="as-roue-signe" text-anchor="middle" dominant-baseline="central">' + GLYPHES[s] + '︎</text>');
    }
    for (var d = 0; d < 360; d += 5) {
      var long = d % 30 === 0 ? 0 : d % 10 === 0 ? 5 : 3;
      if (!long) continue;
      var p1 = pt(R.signes, d), p2 = pt(R.signes - long, d);
      o.push('<line x1="' + f(p1[0]) + '" y1="' + f(p1[1]) + '" x2="' + f(p2[0]) + '" y2="' + f(p2[1]) + '" stroke="rgba(240,207,134,0.35)" stroke-width="0.6"/>');
    }
    [R.signes, R.b + (R.a - R.b) / 2 + 0.5, R.centre].forEach(function (r, i) {
      o.push('<circle r="' + f(r) + '" fill="none" stroke="rgba(185,164,255,' + (i === 0 ? 0.45 : 0.18) + ')" stroke-width="' + (i === 0 ? 1 : 0.8) + '"/>');
    });
    o.push('<circle r="' + R.centre + '" fill="rgba(6,10,29,0.55)"/>');

    // Les liens entre les deux thèmes.
    var liens = (ciel.lectures || []).filter(function (x) { return x.aspect; })
      .sort(function (x, y) { return (x.ecart || 0) - (y.ecart || 0); }).slice(0, 9);
    liens.forEach(function (x) {
      var la = x.sens === 'ab' ? A[x.a].lon : B[x.a].lon, lb = x.sens === 'ab' ? B[x.b].lon : A[x.b].lon;
      var a = pt(R.centre - 2, la), b = pt(R.centre - 2, lb);
      var doux = DOUX[x.aspect] || x.desir;
      o.push('<line x1="' + f(a[0]) + '" y1="' + f(a[1]) + '" x2="' + f(b[0]) + '" y2="' + f(b[1]) + '" stroke="' + (doux ? '#f0cf86' : '#ff8f80') +
        '" stroke-width="' + (x.ecart < 3 ? 1.6 : 1.1) + '" stroke-opacity="' + (x.ecart < 3 ? 0.95 : 0.7) + '"' + (doux ? '' : ' stroke-dasharray="4 3"') + ' stroke-linecap="round"/>');
    });

    // Les planètes : un trait à la vraie longitude, le glyphe écarté si besoin.
    function planetes(P, r, couleur) {
      var lons = PLANETES.map(function (n) { return P[n].lon; });
      var aff = ecarter(lons, 15);
      PLANETES.forEach(function (n, i) {
        var t1 = pt(r + 13, lons[i]), t2 = pt(r + 6, lons[i]), c = pt(r - 4, aff[i]), dot = pt(R.centre - 2, lons[i]);
        o.push('<line x1="' + f(t1[0]) + '" y1="' + f(t1[1]) + '" x2="' + f(t2[0]) + '" y2="' + f(t2[1]) + '" stroke="' + couleur + '" stroke-width="1.4"/>');
        o.push('<circle cx="' + f(dot[0]) + '" cy="' + f(dot[1]) + '" r="2.2" fill="' + couleur + '"/>');
        o.push('<g class="as-roue-planete"><circle cx="' + f(c[0]) + '" cy="' + f(c[1]) + '" r="10.5" fill="#0b1233" stroke="' + couleur + '" stroke-width="1.2"/>' +
          '<text x="' + f(c[0]) + '" y="' + f(c[1]) + '" fill="' + couleur + '" text-anchor="middle" dominant-baseline="central">' + GP[n] + '︎</text></g>');
      });
    }
    planetes(A, R.a + 4, '#ff9cc6');
    planetes(B, R.b + 4, '#b9a4ff');
    o.push('<text x="0" y="0" class="as-roue-centre" text-anchor="middle" dominant-baseline="central">✦</text>');
    o.push('</svg>');
    return o.join('');
  }

  window.QCAstroRoue = { svg: svg };
})();
