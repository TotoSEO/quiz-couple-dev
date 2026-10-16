/* Mascottes dessinées de Quiz Couple : une fonction, des pièces séparées.
   Le style est celui d'un dessin au feutre : un trait d'encre épais, un peu
   tremblé, des aplats, un reflet et des joues estompés à l'aérographe. La
   rose est la fille (elle porte un petit nœud), le violet est le garçon.
   mascotte('rose' | 'violet', options) rend un <svg> complet.
   Options :
     vue      'face' | 'profil' | 'dos'
     bras     [gauche, droit] en degrés vers l'extérieur (0 = pendant, 160 = en l'air)
     jambes   'debout' | 'marche'
     yeux     'ouverts' | 'heureux' | 'coeur' | 'plats' | 'fermes' | 'clin' | 'brillants'
     regard   [dx, dy] des pupilles, en pixels
     sourcils 'tristes' | 'faches' | 'hauts' (aucun par défaut)
     bouche   'sourire' | 'o' | 'rire' | 'plate' | 'triste' | 'bisou' | 'chat' | 'grogne'
     larmes   true, ou un nombre : la descente des larmes en pixels (animation)
     rougit   true : joues pleines et plus larges
     noeud    false : la rose sans son nœud (quand elle porte un bonnet)
     chapeau  'sorciere' : un chapeau de sorcière ; le nœud de la rose passe
              sur le ruban
     cape     true : une cape de vampire, col relevé dans le dos, nœud
              papillon au col (de face)
     crocs    true : deux petites dents de vampire sous la lèvre
              (chapeau, cape et crocs sont les déguisements de saison du
              site, jamais dans les reels : voir SAISONS en bas du fichier)
     saut     hauteur du saut en pixels (le corps monte, l'ombre reste)
     penche   rotation du corps en degrés
     coeurs   true : deux petits cœurs au-dessus de la tête
     tremble  un entier : la graine du tremblé du trait ; on la change toutes
              les quelques images pour que le trait vive. Absent : trait net.
     couleurs 'jetons' (var(--rose)...) ou 'hex' (fichiers exportés)
   Pour l'animation (studio) :
     devant       [gauche, droit] : le bras passe devant le corps (vue de face)
     jambesAngles [a, b] en degrés : remplace 'jambes' (pas de marche)
   mains(nom, options) donne la position des deux mains dans le dessin
   (pour y accrocher un objet tenu). */
(function (racine) {
  var HEX = {
    rose: '#e17398', 'rose-ombre': '#c9557c', 'rose-lumiere': '#e892af',
    violet: '#7f4db3', 'violet-ombre': '#6c409d', 'violet-lumiere': '#a581c9',
    joue: '#ec9769', pupille: '#2a1e36', blanc: '#ffffff', 'decor-trait': '#4a3540',
    noeud: '#ffb3d1', 'noeud-ombre': '#e46f9f', larme: '#8fc8ff',
    // les déguisements de saison (Halloween) : chapeau violet sombre à ruban
    // orange, cape prune doublée de rouge
    chapeau: '#4a2d7a', 'chapeau-ombre': '#3a2260', ruban: '#f08a24', cape: '#2f1b47', 'cape-doublure': '#c8323c'
  };
  // épaisseurs du trait d'encre : corps et membres, puis visage et nœud
  var TRAIT = 6.5, TRAIT_FIN = 4.5;
  var PERSOS = {
    rose: {
      boite: [0, 0, 260, 280], sol: 270, centre: 130, haut: 48, sommet: 64, largeur: 84,
      corps: function () { return 'M130 64 C182 64 214 102 214 150 C214 200 180 238 130 238 C80 238 46 200 46 150 C46 102 78 64 130 64 Z'; },
      teinte: 'rose', ombre: 'rose-ombre', lumiere: 'rose-lumiere', jouesOpacite: 0.85,
      reflet: [100, 112, 60, 44], ombrage: [130, 236, 92, 36],
      yeux: [[102, 136], [159, 136]], rayonOeil: 20, rayonPupille: 8.5,
      joues: [[84, 172], [178, 172]], bouche: [130, 178], largeurBouche: 41,
      epaules: [[55, 162], [205, 162]], bras: [26, 64],
      hanches: [[98, 214], [163, 214]], jambe: [32, 56],
      noeud: [194, 74, 22],
      profil: { oeil: [172, 136], joue: [192, 170], bouche: [186, 182], epaule: [126, 158], hanches: [[120, 214], [142, 214]], noeud: [120, 70, -18] }
    },
    violet: {
      boite: [0, 0, 220, 300], sol: 290, centre: 110, haut: 26, sommet: 26, largeur: 70,
      corps: function () { return 'M110 26 C149 26 180 57 180 96 L180 194 C180 233 149 264 110 264 C71 264 40 233 40 194 L40 96 C40 57 71 26 110 26 Z'; },
      teinte: 'violet', ombre: 'violet-ombre', lumiere: 'violet-lumiere', jouesOpacite: 0.7,
      reflet: [84, 76, 46, 50], ombrage: [110, 262, 74, 38],
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
    var devant = o.devant || [false, false];
    // brasVisibles [gauche, droit] : un bras qu'on ne dessine pas du tout.
    // Au lit, le corps est enfoncé jusqu'à la bouche mais les épaules restent
    // au-dessus du bord de la couette : les bras de base dépassaient à côté
    // des deux petites mains posées sur la couette, quatre bras en tout
    // (Thomas, 7 octobre 2026). Le studio ne garde alors que les bras levés
    // ou occupés, et cache la petite main du même côté.
    var visibles = o.brasVisibles || [true, true];
    var id = 'qc-' + nom + '-' + (++n);
    var b = p.boite;
    // l'encre du trait est celle des décors (claire sur le fond de nuit, où
    // un trait sombre disparaîtrait) ; les pupilles et la bouche restent sombres
    var encre = C('pupille');
    var trait = C('decor-trait');
    var ENC = function (w) { return 'stroke="' + trait + '" stroke-width="' + (w || TRAIT) + '" stroke-linecap="round" stroke-linejoin="round"'; };
    var out = [];
    out.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + b.join(' ') + '" width="' + b[2] + '" height="' + b[3] + '" overflow="visible" style="overflow:visible">');
    out.push('<defs>');
    out.push('<clipPath id="' + id + '-c"><path d="' + p.corps() + '"/></clipPath>');
    // reflet et ombrage du corps, estompés : des dégradés radiaux, pas de flou (trop lent au rendu)
    out.push('<radialGradient id="' + id + '-l"><stop offset="0" stop-color="' + C(p.lumiere) + '" stop-opacity="0.95"/><stop offset="1" stop-color="' + C(p.lumiere) + '" stop-opacity="0"/></radialGradient>');
    out.push('<radialGradient id="' + id + '-o"><stop offset="0" stop-color="' + C(p.ombre) + '" stop-opacity="0.6"/><stop offset="1" stop-color="' + C(p.ombre) + '" stop-opacity="0"/></radialGradient>');
    out.push('<radialGradient id="' + id + '-j"><stop offset="0" stop-color="' + C('joue') + '" stop-opacity="1"/><stop offset="0.55" stop-color="' + C('joue') + '" stop-opacity="0.75"/><stop offset="1" stop-color="' + C('joue') + '" stop-opacity="0"/></radialGradient>');
    if (o.tremble !== undefined) {
      out.push('<filter id="' + id + '-t" x="-15%" y="-10%" width="130%" height="120%" color-interpolation-filters="sRGB">' +
        '<feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="' + (Number(o.tremble) % 1000) + '" result="n"/>' +
        '<feDisplacementMap in="SourceGraphic" in2="n" scale="3.4" xChannelSelector="R" yChannelSelector="G"/></filter>');
    }
    out.push('</defs>');
    // ombre au sol, qui ne saute pas
    out.push('<ellipse cx="' + p.centre + '" cy="' + (p.sol + 2) + '" rx="' + (54 - saut * 0.6) + '" ry="7" fill="' + encre + '" opacity="0.12"/>');
    out.push('<g' + (o.tremble !== undefined ? ' filter="url(#' + id + '-t)"' : '') + ' transform="translate(0 ' + (-saut) + ') rotate(' + (o.penche || 0) + ' ' + p.centre + ' ' + p.sol + ')">');

    function unBras(px, py, angle, cote) {
      var w = p.bras[0], h = p.bras[1];
      // bras levé : l'attache remonte le long du corps pour que le bras sorte au-dessus de l'épaule
      var leve = Math.max(0, Math.min(1, (angle - 90) / 60));
      py -= 34 * leve;
      return '<rect x="' + (px - w / 2) + '" y="' + (py - 6) + '" width="' + w + '" height="' + h + '" rx="' + (w / 2) + '" fill="' + C(p.ombre) + '" ' + ENC() +
        ' transform="rotate(' + (cote * angle) + ' ' + px + ' ' + py + ')"/>';
    }
    function uneJambe(hx, hy, angle) {
      var w = p.jambe[0], h = p.jambe[1];
      return '<rect x="' + (hx - w / 2) + '" y="' + hy + '" width="' + w + '" height="' + h + '" rx="' + (w / 2 - 1) + '" fill="' + C(p.ombre) + '" ' + ENC() +
        ' transform="rotate(' + angle + ' ' + hx + ' ' + (hy + 4) + ')"/>';
    }
    function corps(decalage) {
      var r = p.reflet, s = p.ombrage;
      return '<path d="' + p.corps() + '" fill="' + C(p.teinte) + '"/>' +
        '<g clip-path="url(#' + id + '-c)">' +
        '<ellipse cx="' + (r[0] + decalage) + '" cy="' + r[1] + '" rx="' + r[2] + '" ry="' + r[3] + '" fill="url(#' + id + '-l)"/>' +
        '<ellipse cx="' + s[0] + '" cy="' + s[1] + '" rx="' + s[2] + '" ry="' + s[3] + '" fill="url(#' + id + '-o)"/>' +
        '</g>' +
        '<path d="' + p.corps() + '" fill="none" ' + ENC() + '/>';
    }
    function oeil(x, y, cote) {
      var r = p.rayonOeil;
      var trait = 'fill="none" ' + ENC(5.5);
      if (yeux === 'heureux' || (yeux === 'clin' && cote === 0)) return '<path d="M' + (x - 12) + ' ' + (y + 5) + ' Q' + x + ' ' + (y - 12) + ' ' + (x + 12) + ' ' + (y + 5) + '" ' + trait + '/>';
      if (yeux === 'fermes') return '<path d="M' + (x - 12) + ' ' + (y - 2) + ' Q' + x + ' ' + (y + 10) + ' ' + (x + 12) + ' ' + (y - 2) + '" ' + trait + '/>';
      var blanc = '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + C('blanc') + '" ' + ENC(TRAIT_FIN) + '/>';
      if (yeux === 'plats') return blanc + '<path d="M' + (x - r) + ' ' + y + ' A' + r + ' ' + r + ' 0 0 1 ' + (x + r) + ' ' + y + ' Z" fill="' + C(p.teinte) + '"/><circle cx="' + (x + regard[0]) + '" cy="' + (y + 7) + '" r="' + (p.rayonPupille - 1) + '" fill="' + encre + '"/><path d="M' + (x - r) + ' ' + y + ' L' + (x + r) + ' ' + y + '" ' + ENC(4.5) + '/>';
      if (yeux === 'coeur') {
        var cx = x + regard[0], cy = y + regard[1] - 1;
        return blanc + '<path d="M' + cx + ' ' + (cy + 9) + ' C' + (cx - 14) + ' ' + (cy - 1) + ' ' + (cx - 9) + ' ' + (cy - 12) + ' ' + cx + ' ' + (cy - 5) + ' C' + (cx + 9) + ' ' + (cy - 12) + ' ' + (cx + 14) + ' ' + (cy - 1) + ' ' + cx + ' ' + (cy + 9) + ' Z" fill="' + C('rose-ombre') + '"/>';
      }
      if (yeux === 'brillants') {
        // de grands yeux humides, deux reflets : le regard qui supplie
        var px = x + regard[0], py = y + regard[1];
        return blanc + '<circle cx="' + px + '" cy="' + py + '" r="' + (p.rayonPupille + 4) + '" fill="' + encre + '"/>' +
          '<circle cx="' + (px - 4) + '" cy="' + (py - 4) + '" r="4.2" fill="' + C('blanc') + '"/><circle cx="' + (px + 4.5) + '" cy="' + (py + 3.5) + '" r="2.4" fill="' + C('blanc') + '"/>';
      }
      return blanc + '<circle cx="' + (x + regard[0]) + '" cy="' + (y + regard[1]) + '" r="' + p.rayonPupille + '" fill="' + encre + '"/>';
    }
    // un sourcil au-dessus de l'œil : le côté intérieur monte (triste) ou descend (fâché)
    function sourcil(x, y, cote) {
      if (!o.sourcils) return '';
      var y0 = y - 31, d = cote === 0 ? 1 : -1;
      if (o.sourcils === 'hauts') return '<path d="M' + (x - 12) + ' ' + y0 + ' Q' + x + ' ' + (y0 - 10) + ' ' + (x + 12) + ' ' + y0 + '" fill="none" ' + ENC(5.5) + '/>';
      var monte = o.sourcils === 'tristes' ? -7 : 5;
      return '<path d="M' + (x - 12 * d) + ' ' + (y0 + 2) + ' L' + (x + 12 * d) + ' ' + (y0 + monte) + '" fill="none" ' + ENC(5.5) + '/>';
    }
    // une larme sous le coin extérieur de l'œil
    function larme(x, y, cote) {
      if (!o.larmes) return '';
      var dy = typeof o.larmes === 'number' ? o.larmes : 0;
      var ox = x + (cote === 0 ? -15 : 15), oy = y + 16 + dy;
      return '<path d="M' + ox + ' ' + oy + ' C' + (ox - 7) + ' ' + (oy + 10) + ' ' + (ox - 7) + ' ' + (oy + 18) + ' ' + ox + ' ' + (oy + 18) + ' C' + (ox + 7) + ' ' + (oy + 18) + ' ' + (ox + 7) + ' ' + (oy + 10) + ' ' + ox + ' ' + oy + ' Z" fill="' + C('larme') + '" ' + ENC(3) + '/>';
    }
    function laBouche(x, y, k) {
      var w = p.largeurBouche * k, h = w / 2;
      var plein = 'fill="' + encre + '" ' + ENC(3);
      var vide = 'fill="none" ' + ENC(5);
      if (bouche === 'o') return '<ellipse cx="' + x + '" cy="' + (y + 2) + '" rx="' + (9 * k) + '" ry="' + (12 * k) + '" ' + plein + '/>';
      if (bouche === 'rire') return '<path d="M' + (x - h) + ' ' + (y - 4) + ' C' + (x - h) + ' ' + (y + 24 * k) + ' ' + (x + h) + ' ' + (y + 24 * k) + ' ' + (x + h) + ' ' + (y - 4) + ' Z" ' + plein + '/>' +
        '<ellipse cx="' + x + '" cy="' + (y + 11 * k) + '" rx="' + (h * 0.5) + '" ry="' + (5 * k) + '" fill="' + C(p.ombre) + '"/>';
      if (bouche === 'plate') return '<path d="M' + (x - h * 0.6) + ' ' + (y + 4) + ' L' + (x + h * 0.6) + ' ' + (y + 4) + '" ' + vide + '/>';
      if (bouche === 'bisou') return '<ellipse cx="' + (x + 2 * k) + '" cy="' + (y + 4) + '" rx="' + (7 * k) + '" ry="' + (9 * k) + '" ' + vide + '/>';
      if (bouche === 'triste') return '<path d="M' + (x - h * 0.7) + ' ' + (y + 10) + ' Q' + x + ' ' + (y - 4) + ' ' + (x + h * 0.7) + ' ' + (y + 10) + '" ' + vide + '/>';
      // la petite bouche de chat (« ω »), celle des moments mignons
      if (bouche === 'chat') return '<path d="M' + (x - 13 * k) + ' ' + (y - 1) + ' Q' + (x - 6.5 * k) + ' ' + (y + 10 * k) + ' ' + x + ' ' + (y + 1) + ' Q' + (x + 6.5 * k) + ' ' + (y + 10 * k) + ' ' + (x + 13 * k) + ' ' + (y - 1) + '" ' + vide + '/>';
      // la bouche en zigzag de la colère
      if (bouche === 'grogne') return '<path d="M' + (x - 14 * k) + ' ' + (y + 7) + ' L' + (x - 7 * k) + ' ' + (y + 1) + ' L' + x + ' ' + (y + 7) + ' L' + (x + 7 * k) + ' ' + (y + 1) + ' L' + (x + 14 * k) + ' ' + (y + 7) + '" ' + vide + '/>';
      return '<path d="M' + (x - h) + ' ' + (y - 3) + ' C' + (x - h * 0.55) + ' ' + (y + 15 * k) + ' ' + (x + h * 0.55) + ' ' + (y + 15 * k) + ' ' + (x + h) + ' ' + (y - 3) + ' C' + (x + h * 0.55) + ' ' + (y + 6 * k) + ' ' + (x - h * 0.55) + ' ' + (y + 6 * k) + ' ' + (x - h) + ' ' + (y - 3) + ' Z" ' + plein + '/>';
    }
    // joue estompée : un dégradé, plus large et plus franc quand on rougit
    function joue(x, y, k) {
      var g = o.rougit ? 1.45 : 1;
      return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + (19 * k * g) + '" ry="' + (11 * g) + '" fill="url(#' + id + '-j)" opacity="' + (o.coeurs || o.rougit ? 1 : p.jouesOpacite) + '"/>';
    }
    // le nœud de la rose : deux boucles, un centre, deux pans
    function noeud(x, y, rot, k) {
      if (nom !== 'rose' || o.noeud === false || !x) return '';
      var f = 'fill="' + C('noeud') + '" ' + ENC(TRAIT_FIN);
      return '<g transform="translate(' + x + ' ' + y + ') rotate(' + rot + ')' + (k ? ' scale(' + k + ')' : '') + '">' +
        '<path d="M-6 0 C-16 -22 -40 -22 -40 -4 C-40 10 -22 16 -6 4 Z" ' + f + '/>' +
        '<path d="M6 0 C16 -22 40 -22 40 -4 C40 10 22 16 6 4 Z" ' + f + '/>' +
        '<path d="M-5 5 L-14 24 L-2 20 Z" ' + f + '/><path d="M5 5 L14 24 L2 20 Z" ' + f + '/>' +
        '<ellipse cx="0" cy="1" rx="9" ry="8" fill="' + C('noeud-ombre') + '" ' + ENC(TRAIT_FIN) + '/>' +
        '<circle cx="-26" cy="-8" r="3.5" fill="' + C('blanc') + '" opacity="0.8"/><circle cx="26" cy="-8" r="3.5" fill="' + C('blanc') + '" opacity="0.8"/>' +
        '</g>';
    }

    // Les déguisements de saison du site (Halloween 2026), en hexa quelles
    // que soient les couleurs demandées : la page n'a pas les jetons.
    var D = function (k) { return 'fill="' + HEX[k] + '" ' + ENC(TRAIT_FIN); };
    // le sens : la pointe du chapeau et le pan de la cape penchent vers
    // l'avant de face, vers l'arrière de profil et de dos
    var sens = vue === 'face' ? 1 : -1;
    // Le chapeau de sorcière : un bord en ellipse, un cône qui plie en pointe,
    // un ruban orange ; le nœud de la rose vient sur le ruban. Le cône couvre
    // le haut de la tête, qui monte dedans.
    function chapeau() {
      if (o.chapeau !== 'sorciere') return '';
      var cx = p.centre, yb = p.sommet + 20;
      var X = function (dx) { return cx + sens * dx; };
      return '<ellipse cx="' + cx + '" cy="' + yb + '" rx="96" ry="15" ' + D('chapeau-ombre') + '/>' +
        '<path d="M' + X(-60) + ' ' + yb + ' C' + X(-44) + ' ' + (yb - 34) + ' ' + X(-16) + ' ' + (yb - 60) + ' ' + X(10) + ' ' + (yb - 76) +
        ' C' + X(22) + ' ' + (yb - 84) + ' ' + X(40) + ' ' + (yb - 84) + ' ' + X(46) + ' ' + (yb - 74) +
        ' C' + X(50) + ' ' + (yb - 66) + ' ' + X(42) + ' ' + (yb - 60) + ' ' + X(30) + ' ' + (yb - 64) +
        ' C' + X(34) + ' ' + (yb - 48) + ' ' + X(48) + ' ' + (yb - 24) + ' ' + X(60) + ' ' + yb + ' Z" ' + D('chapeau') + '/>' +
        '<path d="M' + X(-47) + ' ' + (yb - 18) + ' Q' + cx + ' ' + (yb - 25) + ' ' + X(47) + ' ' + (yb - 18) + ' L' + X(57) + ' ' + (yb - 4) + ' Q' + cx + ' ' + (yb - 11) + ' ' + X(-57) + ' ' + (yb - 4) + ' Z" ' + D('ruban') + '/>' +
        '<path d="M' + (cx - 96) + ' ' + yb + ' A96 15 0 0 0 ' + (cx + 96) + ' ' + yb + ' Z" ' + D('chapeau') + '/>' +
        noeud(X(34), yb - 11, sens * 12, 0.72);
    }
    // La cape de vampire : un pan sombre doublé de rouge dans le dos, qui
    // dépasse du corps sur les côtés, et un col relevé derrière la tête.
    // De dos, le pan couvre le corps ; de profil, il ne pend que derrière.
    function colCape(cote) {
      var cx = p.centre, hw = p.largeur, y0 = p.epaules[0][1] - 30;
      var X = function (dx) { return cx + cote * dx; };
      return '<path d="M' + X(hw - 16) + ' ' + (y0 + 8) + ' C' + X(hw + 10) + ' ' + (y0 - 20) + ' ' + X(hw + 30) + ' ' + (y0 - 52) + ' ' + X(hw + 20) + ' ' + (y0 - 70) +
        ' C' + X(hw - 4) + ' ' + (y0 - 52) + ' ' + X(hw - 20) + ' ' + (y0 - 24) + ' ' + X(hw - 28) + ' ' + (y0 + 8) + ' Z" ' + D('cape') + '/>' +
        '<path d="M' + X(hw - 12) + ' ' + (y0 + 2) + ' C' + X(hw + 4) + ' ' + (y0 - 20) + ' ' + X(hw + 18) + ' ' + (y0 - 44) + ' ' + X(hw + 12) + ' ' + (y0 - 56) +
        ' C' + X(hw) + ' ' + (y0 - 42) + ' ' + X(hw - 10) + ' ' + (y0 - 20) + ' ' + X(hw - 16) + ' ' + (y0 + 2) + ' Z" fill="' + HEX['cape-doublure'] + '"/>';
    }
    function capeDerriere() {
      if (!o.cape) return '';
      var cx = p.centre, hw = p.largeur, y0 = p.epaules[0][1] - 30, yB = p.sol - 28;
      var pan = function (cote) {
        var X = function (dx) { return cx + cote * dx; };
        return '<path d="M' + X(hw - 10) + ' ' + y0 + ' C' + X(hw + 20) + ' ' + (y0 + 40) + ' ' + X(hw + 34) + ' ' + (yB - 50) + ' ' + X(hw + 26) + ' ' + yB +
          ' L' + cx + ' ' + yB + ' L' + cx + ' ' + y0 + ' Z" ' + D('cape') + '/>' +
          '<path d="M' + X(hw - 6) + ' ' + (y0 + 10) + ' C' + X(hw + 8) + ' ' + (y0 + 50) + ' ' + X(hw + 16) + ' ' + (yB - 40) + ' ' + X(hw + 10) + ' ' + yB +
          ' L' + X(hw - 10) + ' ' + yB + ' L' + X(hw - 10) + ' ' + (y0 + 10) + ' Z" fill="' + HEX['cape-doublure'] + '"/>';
      };
      if (vue === 'profil') return pan(-1) + colCape(-1);
      return pan(-1) + pan(1) + colCape(-1) + colCape(1);
    }
    // de dos : le pan passe devant le corps, le col au-dessus
    function capeDos() {
      if (!o.cape || vue !== 'dos') return '';
      var cx = p.centre, hw = p.largeur, y0 = p.epaules[0][1] - 30, yB = p.sol - 28;
      return '<path d="M' + (cx - hw + 6) + ' ' + y0 + ' Q' + cx + ' ' + (y0 - 8) + ' ' + (cx + hw - 6) + ' ' + y0 +
        ' C' + (cx + hw + 20) + ' ' + (y0 + 40) + ' ' + (cx + hw + 34) + ' ' + (yB - 50) + ' ' + (cx + hw + 26) + ' ' + yB +
        ' L' + (cx - hw - 26) + ' ' + yB + ' C' + (cx - hw - 34) + ' ' + (yB - 50) + ' ' + (cx - hw - 20) + ' ' + (y0 + 40) + ' ' + (cx - hw + 6) + ' ' + y0 + ' Z" ' + D('cape') + '/>' +
        colCape(-1) + colCape(1);
    }
    // le nœud papillon au col, de face seulement
    function noeudPapillon() {
      if (!o.cape || vue !== 'face') return '';
      var x = p.centre, y = p.bouche[1] + 38;
      var f = 'fill="' + HEX['cape-doublure'] + '" ' + ENC(3);
      return '<path d="M' + (x - 3) + ' ' + y + ' L' + (x - 19) + ' ' + (y - 9) + ' L' + (x - 19) + ' ' + (y + 9) + ' Z" ' + f + '/>' +
        '<path d="M' + (x + 3) + ' ' + y + ' L' + (x + 19) + ' ' + (y - 9) + ' L' + (x + 19) + ' ' + (y + 9) + ' Z" ' + f + '/>' +
        '<circle cx="' + x + '" cy="' + y + '" r="4.5" ' + f + '/>';
    }
    // deux petites dents sous la lèvre, à l'échelle de la bouche
    function crocs(x, y, k) {
      if (!o.crocs) return '';
      var d = 9 * k, l = 12 * k, w = 4 * k, y0 = y - 1;
      var f = 'fill="' + HEX.blanc + '" ' + ENC(2.5);
      return '<path d="M' + (x - d - w) + ' ' + y0 + ' L' + (x - d) + ' ' + (y0 + l) + ' L' + (x - d + w) + ' ' + y0 + ' Z" ' + f + '/>' +
        '<path d="M' + (x + d - w) + ' ' + y0 + ' L' + (x + d) + ' ' + (y0 + l) + ' L' + (x + d + w) + ' ' + y0 + ' Z" ' + f + '/>';
    }

    if (vue === 'profil') {
      var q = p.profil, mj = o.jambes === 'debout' ? 0 : 22;
      var ja = o.jambesAngles || [mj, -mj];
      out.push(capeDerriere());
      out.push(uneJambe(q.hanches[0][0], q.hanches[0][1], ja[0]));
      out.push(uneJambe(q.hanches[1][0], q.hanches[1][1], ja[1]));
      out.push(corps(10));
      out.push(sourcil(q.oeil[0], q.oeil[1], 1));
      out.push(oeil(q.oeil[0], q.oeil[1], 1));
      out.push(larme(q.oeil[0], q.oeil[1], 1));
      out.push(joue(q.joue[0], q.joue[1], 0.8));
      out.push(laBouche(q.bouche[0], q.bouche[1], 0.6));
      out.push(crocs(q.bouche[0], q.bouche[1], 0.6));
      if (visibles[0]) out.push(unBras(q.epaule[0], q.epaule[1], bras[0], -1));
      if (o.chapeau) out.push(chapeau());
      else if (q.noeud) out.push(noeud(q.noeud[0], q.noeud[1], q.noeud[2]));
    } else {
      out.push(capeDerriere());
      if (visibles[0] && !devant[0]) out.push(unBras(p.epaules[0][0], p.epaules[0][1], bras[0], 1));
      if (visibles[1] && !devant[1]) out.push(unBras(p.epaules[1][0], p.epaules[1][1], bras[1], -1));
      var mf = o.jambes === 'marche' ? 10 : 0;
      var jf = o.jambesAngles || [mf, mf];
      out.push(uneJambe(p.hanches[0][0], p.hanches[0][1], jf[0]));
      out.push(uneJambe(p.hanches[1][0], p.hanches[1][1], jf[1]));
      out.push(corps(vue === 'dos' ? 60 : 0));
      out.push(capeDos());
      if (vue === 'face') {
        out.push(sourcil(p.yeux[0][0], p.yeux[0][1], 0));
        out.push(sourcil(p.yeux[1][0], p.yeux[1][1], 1));
        out.push(oeil(p.yeux[0][0], p.yeux[0][1], 0));
        out.push(oeil(p.yeux[1][0], p.yeux[1][1], 1));
        out.push(larme(p.yeux[0][0], p.yeux[0][1], 0));
        out.push(larme(p.yeux[1][0], p.yeux[1][1], 1));
        out.push(joue(p.joues[0][0], p.joues[0][1], 1));
        out.push(joue(p.joues[1][0], p.joues[1][1], 1));
        out.push(laBouche(p.bouche[0], p.bouche[1], 1));
        out.push(crocs(p.bouche[0], p.bouche[1], 1));
        out.push(noeudPapillon());
      }
      if (visibles[0] && devant[0]) out.push(unBras(p.epaules[0][0], p.epaules[0][1], bras[0], 1));
      if (visibles[1] && devant[1]) out.push(unBras(p.epaules[1][0], p.epaules[1][1], bras[1], -1));
      if (o.chapeau) out.push(chapeau());
      else if (p.noeud) out.push(noeud(vue === 'dos' ? p.boite[2] - p.noeud[0] : p.noeud[0], p.noeud[1], vue === 'dos' ? -p.noeud[2] : p.noeud[2]));
    }
    out.push('</g>');
    if (o.coeurs) {
      var hx = p.centre + (o.chapeau ? 76 : 60), hy = 30;
      [[hx, hy, 1], [hx + 30, hy + 26, 0.7]].forEach(function (c) {
        var x = c[0], y = c[1], k = c[2];
        out.push('<path d="M' + x + ' ' + (y + 12 * k) + ' C' + (x - 18 * k) + ' ' + y + ' ' + (x - 12 * k) + ' ' + (y - 14 * k) + ' ' + x + ' ' + (y - 6 * k) + ' C' + (x + 12 * k) + ' ' + (y - 14 * k) + ' ' + (x + 18 * k) + ' ' + y + ' ' + x + ' ' + (y + 12 * k) + ' Z" fill="' + C('rose-ombre') + '" ' + ENC(3.5) + '/>');
      });
    }
    out.push('</svg>');
    return out.join('');
  }

  // Position des mains dans le dessin : le bout de chaque bras, après
  // l'inclinaison et le saut du corps. Vue de profil : la main visible, deux fois.
  function mains(nom, o) {
    o = o || {};
    var p = PERSOS[nom];
    var vue = o.vue || 'face';
    var bras = o.bras || [10, 10];
    var w = p.bras[0], h = p.bras[1], L = h - 6 - w / 2;
    function bout(px, py, angle, cote) {
      var leve = Math.max(0, Math.min(1, (angle - 90) / 60));
      py -= 34 * leve;
      var t = (cote * angle * Math.PI) / 180;
      return [px - L * Math.sin(t), py + L * Math.cos(t)];
    }
    var r = (o.penche || 0) * Math.PI / 180, cx = p.centre, cy = p.sol, s = o.saut || 0;
    function corps(pt) {
      var dx = pt[0] - cx, dy = pt[1] - cy;
      return [cx + dx * Math.cos(r) - dy * Math.sin(r), cy + dx * Math.sin(r) + dy * Math.cos(r) - s];
    }
    if (vue === 'profil') {
      var m = corps(bout(p.profil.epaule[0], p.profil.epaule[1], bras[0], -1));
      return [m, m];
    }
    return [corps(bout(p.epaules[0][0], p.epaules[0][1], bras[0], 1)), corps(bout(p.epaules[1][0], p.epaules[1][1], bras[1], -1))];
  }

  // Repères utiles à l'animation, dans le dessin : boîte, ligne du sol,
  // centre, milieu des yeux, haut de la tête (nœud compris pour la rose).
  function reperes(nom) {
    var p = PERSOS[nom];
    return { boite: p.boite, sol: p.sol, centre: p.centre, yeux: [(p.yeux[0][0] + p.yeux[1][0]) / 2, p.yeux[0][1]], haut: p.haut };
  }

  // Les poses de départ. Chaque humeur a la sienne : on varie, une mascotte
  // qui sourit tout le temps finit par ne plus rien dire.
  var POSES = {
    repos: { vue: 'face', bras: [10, 10], yeux: 'ouverts', bouche: 'sourire' },
    salut: { vue: 'face', bras: [10, 150], yeux: 'ouverts', regard: [3, 0], bouche: 'sourire' },
    joie: { vue: 'face', bras: [160, 160], yeux: 'heureux', bouche: 'rire', saut: 10 },
    surprise: { vue: 'face', bras: [65, 65], yeux: 'ouverts', regard: [0, -3], sourcils: 'hauts', bouche: 'o' },
    profil: { vue: 'profil', bras: [16, 0], jambes: 'marche', yeux: 'ouverts', regard: [6, 0], bouche: 'sourire' },
    dos: { vue: 'dos', bras: [14, 14] },
    amoureux: { vue: 'face', bras: [6, 6], yeux: 'coeur', bouche: 'sourire', coeurs: true },
    boude: { vue: 'face', bras: [-4, -4], yeux: 'plats', regard: [-5, 0], bouche: 'triste', penche: -4 },
    dort: { vue: 'face', bras: [4, 4], yeux: 'fermes', bouche: 'plate', penche: 5 },
    // les humeurs ajoutées en octobre 2026
    mignon: { vue: 'face', bras: [6, 6], yeux: 'heureux', bouche: 'chat', rougit: true },
    triste: { vue: 'face', bras: [-4, -4], yeux: 'ouverts', regard: [0, 5], sourcils: 'tristes', bouche: 'triste', larmes: true, penche: 3 },
    colere: { vue: 'face', bras: [38, 38], yeux: 'ouverts', regard: [0, 0], sourcils: 'faches', bouche: 'grogne', rougit: true },
    gene: { vue: 'face', bras: [14, 14], yeux: 'ouverts', regard: [6, 2], sourcils: 'tristes', bouche: 'plate', rougit: true, penche: -3 },
    fatigue: { vue: 'face', bras: [-2, -2], yeux: 'plats', regard: [0, 2], bouche: 'plate', penche: 4 },
    supplie: { vue: 'face', bras: [40, 40], devant: [true, true], yeux: 'brillants', bouche: 'chat', rougit: true },
    rire: { vue: 'face', bras: [30, 30], yeux: 'fermes', bouche: 'rire', penche: -5 }
  };

  // Les déguisements de saison du SITE (jamais dans les reels) : la page
  // porte data-saison="<nom>" sur le body, le moteur et le hero ajoutent
  // ces options à chaque mascotte. Un seul endroit à changer pour habiller
  // ou déshabiller tout le monde.
  var SAISONS = {
    halloween: { rose: { chapeau: 'sorciere' }, violet: { cape: true, crocs: true } }
  };

  racine.mascotte = mascotte;
  racine.mainsMascotte = mains;
  racine.reperesMascotte = reperes;
  racine.POSES_MASCOTTES = POSES;
  racine.SAISONS_MASCOTTES = SAISONS;
  if (typeof module !== 'undefined') module.exports = { mascotte: mascotte, mains: mains, reperes: reperes, POSES: POSES, SAISONS: SAISONS };
})(typeof window !== 'undefined' ? window : globalThis);
