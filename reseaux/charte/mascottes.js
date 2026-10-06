/* Mascottes articulées de Quiz Couple : une fonction, des pièces séparées.
   mascotte('rose' | 'violet', options) rend un <svg> complet.
   Options :
     vue      'face' | 'profil' | 'dos'
     bras     [gauche, droit] en degrés vers l'extérieur (0 = pendant, 160 = en l'air)
     jambes   'debout' | 'marche'
     yeux     'ouverts' | 'heureux' | 'coeur' | 'plats' | 'fermes'
     regard   [dx, dy] des pupilles, en pixels
     bouche   'sourire' | 'o' | 'rire' | 'plate' | 'triste'
     saut     hauteur du saut en pixels (le corps monte, l'ombre reste)
     penche   rotation du corps en degrés
     coeurs   true : deux petits cœurs au-dessus de la tête
     couleurs 'jetons' (var(--rose)...) ou 'hex' (fichiers exportés) */
(function (racine) {
  var HEX = {
    rose: '#e17398', 'rose-ombre': '#c9557c', 'rose-lumiere': '#e892af',
    violet: '#7f4db3', 'violet-ombre': '#6c409d', 'violet-lumiere': '#a581c9',
    joue: '#ec9769', pupille: '#2a1e36', blanc: '#ffffff'
  };
  var PERSOS = {
    rose: {
      boite: [0, 0, 260, 280], sol: 270, centre: 130,
      corps: function () { return 'M130 64 C182 64 214 102 214 150 C214 200 180 238 130 238 C80 238 46 200 46 150 C46 102 78 64 130 64 Z'; },
      teinte: 'rose', ombre: 'rose-ombre', lumiere: 'rose-lumiere', jouesOpacite: 0.9,
      yeux: [[102, 136], [159, 136]], rayonOeil: 20, rayonPupille: 8.5,
      joues: [[84, 172], [178, 172]], bouche: [130, 178], largeurBouche: 41,
      epaules: [[55, 162], [205, 162]], bras: [26, 64],
      hanches: [[98, 214], [163, 214]], jambe: [32, 56],
      profil: { oeil: [172, 136], joue: [192, 170], bouche: [186, 182], epaule: [126, 158], hanches: [[120, 214], [142, 214]] }
    },
    violet: {
      boite: [0, 0, 220, 300], sol: 290, centre: 110,
      corps: function () { return 'M110 26 C149 26 180 57 180 96 L180 194 C180 233 149 264 110 264 C71 264 40 233 40 194 L40 96 C40 57 71 26 110 26 Z'; },
      teinte: 'violet', ombre: 'violet-ombre', lumiere: 'violet-lumiere', jouesOpacite: 0.7,
      yeux: [[81, 106], [138, 106]], rayonOeil: 19, rayonPupille: 8.5,
      joues: [[61, 142], [158, 142]], bouche: [110, 152], largeurBouche: 34,
      epaules: [[44, 151], [176, 151]], bras: [24, 72],
      hanches: [[80, 237], [138, 237]], jambe: [30, 53],
      profil: { oeil: [146, 106], joue: [164, 140], bouche: [158, 154], epaule: [106, 150], hanches: [[98, 237], [122, 237]] }
    }
  };
  var n = 0;

  function mascotte(nom, o) {
    o = o || {};
    var p = PERSOS[nom];
    var C = function (k) { return o.couleurs === 'hex' ? HEX[k] : 'var(--' + k + ')'; };
    var vue = o.vue || 'face';
    var bras = o.bras || [10, 10];
    var yeux = o.yeux || 'ouverts';
    var regard = o.regard || [0, 0];
    var bouche = o.bouche || 'sourire';
    var saut = o.saut || 0;
    var id = 'qc-' + nom + '-' + (++n);
    var b = p.boite;
    var out = [];
    out.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + b.join(' ') + '" width="' + b[2] + '" height="' + b[3] + '">');
    out.push('<defs><radialGradient id="' + id + '" cx="' + (vue === 'dos' ? 0.66 : vue === 'profil' ? 0.5 : 0.34) + '" cy="0.24" r="0.75">' +
      '<stop offset="0" stop-color="' + C(p.lumiere) + '"/><stop offset="0.55" stop-color="' + C(p.teinte) + '"/><stop offset="1" stop-color="' + C(p.teinte) + '"/></radialGradient></defs>');
    // ombre au sol, qui ne saute pas
    out.push('<ellipse cx="' + p.centre + '" cy="' + (p.sol + 2) + '" rx="' + (54 - saut * 0.6) + '" ry="7" fill="' + C('pupille') + '" opacity="0.12"/>');
    out.push('<g transform="translate(0 ' + (-saut) + ') rotate(' + (o.penche || 0) + ' ' + p.centre + ' ' + p.sol + ')">');

    function unBras(px, py, angle, cote) {
      var w = p.bras[0], h = p.bras[1];
      // bras levé : l'attache remonte le long du corps pour que le bras sorte au-dessus de l'épaule
      var leve = Math.max(0, Math.min(1, (angle - 90) / 60));
      py -= 34 * leve;
      return '<rect x="' + (px - w / 2) + '" y="' + (py - 6) + '" width="' + w + '" height="' + h + '" rx="' + (w / 2) + '" fill="' + C(p.ombre) +
        '" transform="rotate(' + (cote * angle) + ' ' + px + ' ' + py + ')"/>';
    }
    function uneJambe(hx, hy, angle) {
      var w = p.jambe[0], h = p.jambe[1];
      return '<rect x="' + (hx - w / 2) + '" y="' + hy + '" width="' + w + '" height="' + h + '" rx="' + (w / 2 - 1) + '" fill="' + C(p.ombre) +
        '" transform="rotate(' + angle + ' ' + hx + ' ' + (hy + 4) + ')"/>';
    }
    function oeil(x, y) {
      var r = p.rayonOeil;
      if (yeux === 'heureux') return '<path d="M' + (x - 12) + ' ' + (y + 5) + ' Q' + x + ' ' + (y - 12) + ' ' + (x + 12) + ' ' + (y + 5) + '" fill="none" stroke="' + C('pupille') + '" stroke-width="5.5" stroke-linecap="round"/>';
      if (yeux === 'fermes') return '<path d="M' + (x - 12) + ' ' + (y - 2) + ' Q' + x + ' ' + (y + 10) + ' ' + (x + 12) + ' ' + (y - 2) + '" fill="none" stroke="' + C('pupille') + '" stroke-width="5.5" stroke-linecap="round"/>';
      if (yeux === 'plats') return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + C('blanc') + '"/><path d="M' + (x - r) + ' ' + y + ' A' + r + ' ' + r + ' 0 0 1 ' + (x + r) + ' ' + y + ' Z" fill="' + C(p.teinte) + '"/><circle cx="' + (x + regard[0]) + '" cy="' + (y + 7) + '" r="' + (p.rayonPupille - 1) + '" fill="' + C('pupille') + '"/><path d="M' + (x - r) + ' ' + y + ' L' + (x + r) + ' ' + y + '" stroke="' + C('pupille') + '" stroke-width="4" stroke-linecap="round"/>';
      var s = '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + C('blanc') + '"/>';
      if (yeux === 'coeur') {
        var cx = x + regard[0], cy = y + regard[1] - 1;
        return s + '<path d="M' + cx + ' ' + (cy + 9) + ' C' + (cx - 14) + ' ' + (cy - 1) + ' ' + (cx - 9) + ' ' + (cy - 12) + ' ' + cx + ' ' + (cy - 5) + ' C' + (cx + 9) + ' ' + (cy - 12) + ' ' + (cx + 14) + ' ' + (cy - 1) + ' ' + cx + ' ' + (cy + 9) + ' Z" fill="' + C('rose-ombre') + '"/>';
      }
      return s + '<circle cx="' + (x + regard[0]) + '" cy="' + (y + regard[1]) + '" r="' + p.rayonPupille + '" fill="' + C('pupille') + '"/>';
    }
    function laBouche(x, y, k) {
      var w = p.largeurBouche * k, h = w / 2;
      if (bouche === 'o') return '<ellipse cx="' + x + '" cy="' + (y + 2) + '" rx="' + (9 * k) + '" ry="' + (12 * k) + '" fill="' + C('pupille') + '"/>';
      if (bouche === 'rire') return '<path d="M' + (x - h) + ' ' + (y - 4) + ' C' + (x - h) + ' ' + (y + 24 * k) + ' ' + (x + h) + ' ' + (y + 24 * k) + ' ' + (x + h) + ' ' + (y - 4) + ' Z" fill="' + C('pupille') + '"/>' +
        '<ellipse cx="' + x + '" cy="' + (y + 11 * k) + '" rx="' + (h * 0.5) + '" ry="' + (5 * k) + '" fill="' + C(p.ombre) + '"/>';
      if (bouche === 'plate') return '<path d="M' + (x - h * 0.6) + ' ' + (y + 4) + ' L' + (x + h * 0.6) + ' ' + (y + 4) + '" stroke="' + C('pupille') + '" stroke-width="5" stroke-linecap="round"/>';
      if (bouche === 'triste') return '<path d="M' + (x - h * 0.7) + ' ' + (y + 10) + ' Q' + x + ' ' + (y - 4) + ' ' + (x + h * 0.7) + ' ' + (y + 10) + '" fill="none" stroke="' + C('pupille') + '" stroke-width="5" stroke-linecap="round"/>';
      return '<path d="M' + (x - h) + ' ' + (y - 3) + ' C' + (x - h * 0.55) + ' ' + (y + 15 * k) + ' ' + (x + h * 0.55) + ' ' + (y + 15 * k) + ' ' + (x + h) + ' ' + (y - 3) + ' C' + (x + h * 0.55) + ' ' + (y + 6 * k) + ' ' + (x - h * 0.55) + ' ' + (y + 6 * k) + ' ' + (x - h) + ' ' + (y - 3) + ' Z" fill="' + C('pupille') + '"/>';
    }
    function joue(x, y, k) {
      return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + (13 * k) + '" ry="7" fill="' + C('joue') + '" opacity="' + (o.coeurs ? 1 : p.jouesOpacite) + '"/>';
    }

    if (vue === 'profil') {
      var q = p.profil, mj = o.jambes === 'debout' ? 0 : 22;
      out.push(uneJambe(q.hanches[0][0], q.hanches[0][1], mj));
      out.push(uneJambe(q.hanches[1][0], q.hanches[1][1], -mj));
      out.push('<path d="' + p.corps() + '" fill="url(#' + id + ')"/>');
      out.push(oeil(q.oeil[0], q.oeil[1]));
      out.push(joue(q.joue[0], q.joue[1], 0.8));
      out.push(laBouche(q.bouche[0], q.bouche[1], 0.6));
      out.push(unBras(q.epaule[0], q.epaule[1], bras[0], -1));
    } else {
      out.push(unBras(p.epaules[0][0], p.epaules[0][1], bras[0], 1));
      out.push(unBras(p.epaules[1][0], p.epaules[1][1], bras[1], -1));
      var mf = o.jambes === 'marche' ? 10 : 0;
      out.push(uneJambe(p.hanches[0][0], p.hanches[0][1], mf));
      out.push(uneJambe(p.hanches[1][0], p.hanches[1][1], mf));
      out.push('<path d="' + p.corps() + '" fill="url(#' + id + ')"/>');
      if (vue === 'face') {
        out.push(oeil(p.yeux[0][0], p.yeux[0][1]));
        out.push(oeil(p.yeux[1][0], p.yeux[1][1]));
        out.push(joue(p.joues[0][0], p.joues[0][1], 1));
        out.push(joue(p.joues[1][0], p.joues[1][1], 1));
        out.push(laBouche(p.bouche[0], p.bouche[1], 1));
      }
    }
    out.push('</g>');
    if (o.coeurs) {
      var hx = p.centre + 60, hy = 30;
      [[hx, hy, 1], [hx + 30, hy + 26, 0.7]].forEach(function (c) {
        var x = c[0], y = c[1], k = c[2];
        out.push('<path d="M' + x + ' ' + (y + 12 * k) + ' C' + (x - 18 * k) + ' ' + y + ' ' + (x - 12 * k) + ' ' + (y - 14 * k) + ' ' + x + ' ' + (y - 6 * k) + ' C' + (x + 12 * k) + ' ' + (y - 14 * k) + ' ' + (x + 18 * k) + ' ' + y + ' ' + x + ' ' + (y + 12 * k) + ' Z" fill="' + C('rose-ombre') + '"/>');
      });
    }
    out.push('</svg>');
    return out.join('');
  }

  var POSES = {
    repos: { vue: 'face', bras: [10, 10], yeux: 'ouverts', bouche: 'sourire' },
    salut: { vue: 'face', bras: [10, 150], yeux: 'ouverts', regard: [3, 0], bouche: 'sourire' },
    joie: { vue: 'face', bras: [160, 160], yeux: 'heureux', bouche: 'rire', saut: 10 },
    surprise: { vue: 'face', bras: [65, 65], yeux: 'ouverts', regard: [0, -3], bouche: 'o' },
    profil: { vue: 'profil', bras: [16, 0], jambes: 'marche', yeux: 'ouverts', regard: [6, 0], bouche: 'sourire' },
    dos: { vue: 'dos', bras: [14, 14] },
    amoureux: { vue: 'face', bras: [6, 6], yeux: 'coeur', bouche: 'sourire', coeurs: true },
    boude: { vue: 'face', bras: [-4, -4], yeux: 'plats', regard: [-5, 0], bouche: 'triste', penche: -4 },
    dort: { vue: 'face', bras: [4, 4], yeux: 'fermes', bouche: 'plate', penche: 5 }
  };

  racine.mascotte = mascotte;
  racine.POSES_MASCOTTES = POSES;
  if (typeof module !== 'undefined') module.exports = { mascotte: mascotte, POSES: POSES };
})(typeof window !== 'undefined' ? window : globalThis);
