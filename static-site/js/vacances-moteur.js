/**
 * Moteur de correspondance du test « où partir en vacances ? ».
 *
 * Il ne fait qu'une chose : à partir des réponses du questionnaire, choisir
 * dans la base de destinations celles qui collent vraiment. Il est écrit à
 * part de l'interface pour tourner tel quel dans Node : un test parcourt
 * toutes les combinaisons de réponses possibles et vérifie qu'aucune ne
 * débouche sur une page vide ou sur une absurdité (Amsterdam pour douze
 * jours, du ski en été, les Maldives pour une nuit).
 *
 * Les filtres durs (zone, durée, saison, plafond de budget) ne se
 * franchissent jamais en douce : quand ils ne laissent pas assez de
 * destinations, le moteur les élargit un cran à la fois, dans un ordre
 * fixe, et dit lesquels il a élargis pour que l'interface puisse
 * l'annoncer honnêtement.
 */
(function (fabrique) {
  // Posé sur globalThis : le navigateur y lit window.VacancesMoteur, et le
  // test Node évalue ce fichier tel quel puis récupère l'objet au même nom.
  (typeof globalThis !== 'undefined' ? globalThis : window).VacancesMoteur = fabrique();
})(function () {

  // Fenêtres de nuits correspondant aux réponses de durée.
  var DUREES = {
    we1: [1, 1], we2: [2, 2], we3: [3, 3],
    v47: [4, 7], v812: [8, 12], v13: [13, 21]
  };

  // Décors voisins : la mer console de l'île qui manque, la nature de la
  // montagne. La ville n'a pas de voisin, on n'y échoue pas par accident.
  var ADJACENT = { mer: ['ile'], ile: ['mer'], montagne: ['nature'], nature: ['montagne'], ville: [] };

  // Ce que chaque tranche d'âge apprécie un peu plus que les autres. C'est un
  // bonus de tri, jamais un filtre : à 55 ans on peut partir faire la fête.
  var AGE_AMBIANCES = {
    a1: ['festif', 'sauvage'],
    a2: ['festif', 'romantique'],
    a3: ['romantique', 'culturel'],
    a4: ['confort', 'culturel']
  };

  function hachette(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 997;
    return h % 7;
  }

  function zonesPermises(zone, large) {
    if (zone === 'partout') return null; // tout est permis
    if (!large) return [zone];
    if (zone === 'france') return ['france', 'europe'];
    if (zone === 'europe') return ['europe', 'france'];
    return ['monde', 'europe'];
  }

  // r : { age, duree, zone, decor, budget, saison, rythme }
  function score(dest, r) {
    var s = 0;
    if (dest.decor.indexOf(r.decor) !== -1) s += 50;
    else if ((ADJACENT[r.decor] || []).some(function (v) { return dest.decor.indexOf(v) !== -1; })) s += 18;
    if (dest.budget === r.budget) s += 16;
    else if (dest.budget === r.budget - 1) s += 10;
    else s += 4;
    if (dest.rythme.indexOf(r.rythme) !== -1) s += 14;
    var envies = AGE_AMBIANCES[r.age] || [];
    for (var i = 0; i < envies.length; i++) if (dest.ambiance.indexOf(envies[i]) !== -1) s += 6;
    var d = DUREES[r.duree];
    if (dest.nMin <= d[0] && dest.nMax >= d[1]) s += 8; else s += 3;
    return s + hachette(dest.id);
  }

  var MINIMUM = 4;
  var MAXIMUM = 8;

  function selectionne(destinations, r) {
    var d = DUREES[r.duree];
    var weekend = r.duree.charAt(0) === 'w';

    // Les paliers d'élargissement, du plus doux au plus large. Chaque palier
    // cumule les précédents ; on s'arrête dès que le vivier est suffisant.
    var paliers = [
      {},
      { duree: true },
      { duree: true, budget: true },
      { duree: true, budget: true, saison: true },
      { duree: true, budget: true, saison: true, zone: true }
    ];

    for (var p = 0; p < paliers.length; p++) {
      var o = paliers[p];
      var uMin = o.duree ? Math.max(1, d[0] - (weekend ? 1 : 2)) : d[0];
      var uMax = o.duree ? d[1] + (weekend ? 2 : 3) : d[1];
      var budgetMax = o.budget ? Math.min(4, r.budget + 1) : r.budget;
      var zones = zonesPermises(r.zone, !!o.zone);

      var vivier = destinations.filter(function (x) {
        if (zones && zones.indexOf(x.zone) === -1) return false;
        if (x.nMin > uMax || x.nMax < uMin) return false;
        if (x.budget > budgetMax) return false;
        var horsSaison = x.saisons.indexOf(r.saison) === -1;
        if (!o.saison && horsSaison) return false;
        // Même en élargissant la saison, une destination très saisonnière
        // (une ou deux bonnes saisons seulement, comme le ski ou la Laponie)
        // ne sort jamais de sa fenêtre.
        if (o.saison && horsSaison && x.saisons.length <= 2) return false;
        return true;
      });

      if (vivier.length >= MINIMUM || p === paliers.length - 1) {
        vivier.sort(function (a, b) { return score(b, r) - score(a, r); });
        var elargi = [];
        if (o.duree) elargi.push('duree');
        if (o.budget) elargi.push('budget');
        if (o.saison) elargi.push('saison');
        if (o.zone) elargi.push('zone');
        return { resultats: vivier.slice(0, MAXIMUM), elargi: elargi };
      }
    }
  }

  return { selectionne: selectionne, DUREES: DUREES, MINIMUM: MINIMUM };
});
