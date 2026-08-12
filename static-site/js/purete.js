/**
 * Test de pureté — moteur autonome.
 *
 * Volontairement séparé de quiz-engine-core.js. Ce test ne partage rien avec
 * les autres : pas de prénoms, pas de tour de rôle, pas de relais entre deux
 * joueurs. Il a son barème pondéré, ses catégories, son portail d'âge et son
 * écran de résultat. Charger les 180 Ko du moteur commun pour n'en utiliser
 * que la fonction d'échappement n'aurait servi à rien, sur une page dont la
 * légèreté est justement l'argument.
 *
 * Les questions vivent dans /js/data/purete-<langue>.json, chargé seulement
 * quand quelqu'un lance le test. La page elle-même reste vide de données.
 *
 * Les libellés de l'interface arrivent par window.PU_I18N, posé par le
 * gabarit depuis <langue>/test-purete.json. Les valeurs françaises restent
 * en dur comme repli : une clé oubliée dans une traduction affiche du
 * français plutôt qu'un trou.
 */
(function () {
  'use strict';

  var RACINE = document.getElementById('purete');
  if (!RACINE) return;

  var SUPABASE_URL = RACINE.dataset.supabaseUrl || '';
  var SUPABASE_KEY = RACINE.dataset.supabaseKey || '';
  var LANGUE = RACINE.dataset.lang || 'fr';
  var URL_DONNEES = '/js/data/purete-' + LANGUE + '.json';
  var MIN_ECHANTILLON = 30; // en dessous, une courbe de répartition ne veut rien dire

  var I18N = window.PU_I18N || {};
  function T(cle, repli) {
    var v = I18N[cle];
    return (v != null && v !== '') ? v : repli;
  }
  // Beaucoup de phrases changent selon le mode : en solo on tutoie une seule
  // personne, en couple on s'adresse aux deux. Deux clés plutôt qu'une règle
  // grammaticale, parce que la bascule ne se fait pas au même endroit d'une
  // langue à l'autre.
  function TV(cleSolo, cleCouple, repliSolo, repliCouple) {
    return mode === 'solo' ? T(cleSolo, repliSolo) : T(cleCouple, repliCouple);
  }
  // Les gabarits portent {score}, {max}, {pct}, {n} ou {lien}.
  function fmt(chaine, valeurs) {
    return String(chaine).replace(/\{(\w+)\}/g, function (tout, cle) {
      return valeurs[cle] != null ? valeurs[cle] : tout;
    });
  }

  // ─── Utilitaires ────────────────────────────────────────────────────────
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  var LOCALES = { fr: 'fr-FR', en: 'en-GB', es: 'es-ES', de: 'de-DE', it: 'it-IT' };
  function nb(n) {
    try { return Number(n).toLocaleString(LOCALES[LANGUE] || 'fr-FR'); } catch (e) { return String(n); }
  }
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function versLeHaut(node) {
    if (!node) return;
    try { node.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    catch (e) { node.scrollIntoView(); }
  }

  // ─── État ───────────────────────────────────────────────────────────────
  var D = null;              // données chargées
  var mode = 'solo';         // 'solo' | 'couple'
  var adulte = true;         // décide du pool servi
  var questions = [];        // pool réellement joué
  var scoreMax = 0;
  var index = 0;
  var reponses = [];         // { pts, cat, maxCat }
  var statsGlobales = null;  // agrégats renvoyés par la base

  // ─── Chargement ─────────────────────────────────────────────────────────
  function charge() {
    if (D) return Promise.resolve(D);
    return fetch(URL_DONNEES)
      .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
      .then(function (j) { D = j; return D; });
  }

  // Les agrégats servent deux choses : la moyenne annoncée sur la page et la
  // courbe de répartition. Tant que la table n'existe pas, ou tant qu'il y a
  // trop peu de parties, on n'affiche ni l'une ni l'autre plutôt que
  // d'inventer des chiffres.
  function chargeStats(pourMode) {
    if (!SUPABASE_URL) return Promise.resolve(null);
    return fetch(SUPABASE_URL + '/rest/v1/rpc/get_purete_stats', {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ p_mode: pourMode || null })
    })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (rows) {
        if (!Array.isArray(rows) || !rows.length) return null;
        var total = Number(rows[0].total) || 0;
        if (total < MIN_ECHANTILLON) return { total: total, assez: false };
        var tranches = new Array(20).fill(0);
        rows.forEach(function (r) {
          if (r.tranche != null) tranches[Math.min(19, Math.max(0, Number(r.tranche)))] = Number(r.effectif) || 0;
        });
        return {
          total: total, assez: true,
          moyenne: Number(rows[0].moyenne) || 0,
          moyennePct: Number(rows[0].moyenne_pct) || 0,
          tranches: tranches
        };
      })
      .catch(function () { return null; });
  }

  function envoieScore(score, max, pct) {
    if (!SUPABASE_URL) return;
    fetch(SUPABASE_URL + '/rest/v1/purete_scores', {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json', 'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        mode: mode + (adulte ? '' : '-ado'),
        score: score, score_max: max, pct: pct
      })
    }).catch(function () {});
  }

  // ─── Écran 1 : choix du mode ────────────────────────────────────────────
  function ecranModes() {
    var w = el('div', 'pu-carte pu-carte--modes');
    w.appendChild(el('div', 'pu-macaron', '<span>🌡️</span>'));
    w.appendChild(el('p', 'pu-kicker', T('etape1', 'Étape 1 sur 2')));
    w.appendChild(el('h2', 'pu-titre', T('modes_titre', 'Choisissez votre mode du test de pureté : en couple ou seul ?')));
    w.appendChild(el('p', 'pu-sous', T('modes_sous', '50 questions dans les deux cas. Le mode change ce qu\'on note.')));

    var grille = el('div', 'pu-modes');
    [
      { k: 'solo', emoji: '🙋', nom: T('mode_solo_nom', 'Chacun de son côté'), action: T('mode_action', 'Choisir ce mode'),
        desc: T('mode_solo_desc', 'Sur vous : votre passé, vos casseroles.') },
      { k: 'couple', emoji: '💞', nom: T('mode_couple_nom', 'À deux en couple'), action: T('mode_action', 'Choisir ce mode'),
        desc: T('mode_couple_desc', 'Sur vous deux : ce que vous avez fait ensemble.') }
    ].forEach(function (m) {
      var b = el('button', 'pu-mode');
      b.type = 'button';
      b.innerHTML = '<span class="pu-mode-emoji" aria-hidden="true">' + m.emoji + '</span>' +
        '<span class="pu-mode-nom">' + esc(m.nom) + '</span>' +
        '<span class="pu-mode-desc">' + esc(m.desc) + '</span>' +
        '<span class="pu-mode-action">' + esc(m.action) + '</span>';
      b.addEventListener('click', function () { mode = m.k; rend(ecranAge); });
      grille.appendChild(b);
    });
    w.appendChild(grille);
    return w;
  }

  // ─── Écran 2 : portail d'âge ────────────────────────────────────────────
  // Le pool adulte parle de drogues, de libertinage et de sexualité explicite.
  // On ne le sert pas à quelqu'un qui déclare avoir moins de 16 ans : la
  // version tout public garde les questions sur les mensonges, la famille,
  // les soirées et les secrets, et laisse tomber le reste.
  function ecranAge() {
    var w = el('div', 'pu-carte pu-carte--age');
    w.appendChild(el('div', 'pu-macaron', '<span>🔞</span>'));
    w.appendChild(el('p', 'pu-kicker', T('etape2', 'Étape 2 sur 2')));
    w.appendChild(el('h2', 'pu-titre', TV('age_titre_solo', 'age_titre_couple', 'Tu as plus de 16 ans ?', 'Vous avez plus de 16 ans ?')));
    w.appendChild(el('p', 'pu-sous',
      T('age_sous', 'La réponse ne change que les questions posées. La version tout public retire tout ce qui touche au sexe explicite et aux drogues, et garde les mensonges, la famille, les soirées et les secrets.')));

    var choix = el('div', 'pu-ages');
    [
      { ok: true, nom: T('age_oui', 'Oui, 16 ans ou plus'), sous: T('age_oui_sous', 'Version complète, sans filtre') },
      { ok: false, nom: T('age_non', 'Non, moins de 16 ans'), sous: T('age_non_sous', 'Version tout public') }
    ].forEach(function (a) {
      var b = el('button', 'pu-age' + (a.ok ? ' pu-age--oui' : ''));
      b.type = 'button';
      b.innerHTML = '<span class="pu-age-nom">' + esc(a.nom) + '</span>' +
        '<span class="pu-age-sous">' + esc(a.sous) + '</span>';
      b.addEventListener('click', function () { adulte = a.ok; demarre(); });
      choix.appendChild(b);
    });
    w.appendChild(choix);

    var retour = el('button', 'pu-lien', '← Changer de mode');
    retour.type = 'button';
    retour.addEventListener('click', function () { rend(ecranModes); });
    w.appendChild(retour);
    return w;
  }

  // ─── Démarrage ──────────────────────────────────────────────────────────
  function demarre() {
    rend(function () {
      var w = el('div', 'pu-carte pu-carte--chargement');
      w.appendChild(el('p', 'pu-sous', T('chargement', 'On prépare les questions…')));
      return w;
    });
    charge().then(function () {
      var pool = D[mode].questions.filter(function (q) { return adulte || q.ado; });
      questions = pool;
      scoreMax = pool.reduce(function (s, q) { return s + maxQ(q); }, 0);
      index = 0;
      reponses = [];
      rend(ecranQuestion);
    }).catch(function () {
      rend(function () {
        var w = el('div', 'pu-carte');
        w.appendChild(el('h2', 'pu-titre', 'Les questions n\'ont pas voulu se charger'));
        w.appendChild(el('p', 'pu-sous', T('erreur_sous', 'Vérifiez votre connexion et réessayez.')));
        var b = el('button', 'pu-cta', T('reessayer', 'Réessayer'));
        b.type = 'button';
        b.addEventListener('click', demarre);
        w.appendChild(b);
        return w;
      });
    });
  }

  function maxQ(q) {
    return q.r.reduce(function (m, r) { return Math.max(m, r.p); }, 0);
  }

  // ─── Écran de question ──────────────────────────────────────────────────
  function ecranQuestion() {
    var q = questions[index];
    var cat = D.cats[q.cat] || { nom: '', emoji: '' };
    var pct = Math.round((index / questions.length) * 100);

    var w = el('div', 'pu-jeu');

    var barre = el('div', 'pu-barre-zone');
    var precedent = el('button', 'pu-rond', '↺');
    precedent.type = 'button';
    precedent.setAttribute('aria-label', T('precedente', 'Revenir à la question précédente'));
    precedent.disabled = index === 0;
    precedent.addEventListener('click', function () {
      if (index === 0) return;
      index--; reponses.pop(); rend(ecranQuestion);
    });

    var piste = el('div', 'pu-piste');
    piste.setAttribute('role', 'progressbar');
    piste.setAttribute('aria-valuemin', '0');
    piste.setAttribute('aria-valuemax', '100');
    piste.setAttribute('aria-valuenow', String(pct));
    piste.innerHTML = '<span style="width:' + pct + '%"></span>';

    var quitter = el('button', 'pu-rond pu-rond--sortie', '✕');
    quitter.type = 'button';
    quitter.setAttribute('aria-label', 'Quitter le test');
    quitter.addEventListener('click', function () {
      if (confirm(T('quitter', 'Quitter le test ? Les réponses seront perdues.'))) rend(ecranModes);
    });

    barre.appendChild(precedent);
    barre.appendChild(piste);
    barre.appendChild(quitter);
    w.appendChild(barre);

    var carte = el('div', 'pu-carte pu-carte--question');
    carte.appendChild(el('p', 'pu-num',
      'N°' + (index + 1) + ' <span class="pu-num-cat">' + cat.emoji + ' ' + esc(cat.nom) + '</span>'));
    carte.appendChild(el('h2', 'pu-question', esc(q.q)));

    // Les réponses sont teintées du vert au rouge selon ce qu'elles coûtent :
    // on voit d'un coup d'œil laquelle est la plus sage, sans lire le barème.
    var maxi = maxQ(q) || 1;
    var liste = el('div', 'pu-reponses');
    q.r.forEach(function (r, i) {
      var force = Math.round((r.p / maxi) * 4); // 0 à 4
      var b = el('button', 'pu-rep pu-rep--' + force, esc(r.t));
      b.type = 'button';
      b.style.animationDelay = (i * 45) + 'ms';
      b.addEventListener('click', function () {
        if (w.dataset.verrou) return;
        w.dataset.verrou = '1';
        b.classList.add('pu-rep--pris');
        reponses[index] = { pts: r.p, cat: q.cat, maxCat: maxi };
        setTimeout(function () {
          index++;
          if (index >= questions.length) termine();
          else rend(ecranQuestion);
        }, 260);
      });
      liste.appendChild(b);
    });
    carte.appendChild(liste);
    w.appendChild(carte);
    return w;
  }

  // ─── Fin de partie ──────────────────────────────────────────────────────
  function termine() {
    var score = reponses.reduce(function (s, r) { return s + r.pts; }, 0);
    var pct = scoreMax ? Math.round((score / scoreMax) * 100) : 0;
    envoieScore(score, scoreMax, pct);

    rend(function () {
      var w = el('div', 'pu-carte pu-carte--chargement');
      w.appendChild(el('p', 'pu-sous', T('calcul', 'On calcule votre score…')));
      return w;
    });

    chargeStats(mode + (adulte ? '' : '-ado')).then(function (s) {
      statsGlobales = s;
      // Le panneau qui invite à laisser un avis passe avant les résultats,
      // comme sur les autres tests. Le résultat est déjà construit derrière.
      rend(function () { return ecranResultat(score, pct); });
      if (typeof window.qcPanneauAvantResultats === 'function') {
        window.qcPanneauAvantResultats({
          lang: 'fr',
          onContinue: function () { versLeHaut(RACINE); }
        });
      } else {
        versLeHaut(RACINE);
      }
    });
  }

  function palier(pct) {
    var ps = D[mode].paliers;
    for (var i = 0; i < ps.length; i++) if (pct >= ps[i].min && pct < ps[i].max) return ps[i];
    return ps[ps.length - 1];
  }

  // ─── Écran de résultat ──────────────────────────────────────────────────
  function ecranResultat(score, pct) {
    var p = palier(pct);
    var w = el('div', 'pu-resultat');
    w.setAttribute('data-quiz-done', '1');

    // Verdict
    var tete = el('div', 'pu-verdict');
    tete.appendChild(el('h2', 'pu-verdict-titre',
      esc(p.titre) + ' <span class="pu-verdict-emoji" aria-hidden="true">' + p.emoji + '</span>'));
    tete.appendChild(el('p', 'pu-score-pastille',
      fmt(TV('score_solo', 'score_couple', 'Ton score : <strong>{score}</strong> points', 'Votre score : <strong>{score}</strong> points'), { score: nb(score) })));
    tete.appendChild(el('p', 'pu-score-note',
      fmt(TV('resultat_max_solo', 'resultat_max_couple',
        'Le maximum de cette version est {max} points. Plus le score est haut, moins tu es pur.',
        'Le maximum de cette version est {max} points. Plus le score est haut, moins vous êtes purs.'), { max: nb(scoreMax) })));
    tete.appendChild(el('p', 'pu-verdict-texte', esc(p.texte)));
    w.appendChild(tete);

    var colonnes = el('div', 'pu-colonnes');

    // Courbe de répartition, seulement si la base a de quoi la dessiner.
    if (statsGlobales && statsGlobales.assez) {
      colonnes.appendChild(bloCourbe(pct));
    }
    colonnes.appendChild(blocPartage(score, pct));
    w.appendChild(colonnes);

    w.appendChild(blocCategories());
    var suites = blocSuites();
    if (suites) w.appendChild(suites);
    w.appendChild(blocReprendre());
    return w;
  }

  // ─── Poursuivre ailleurs ────────────────────────────────────────────────
  // Les pages proposées sont choisies à la main dans le gabarit, différentes
  // selon le mode : quelqu'un qui a joué seul n'a personne à côté de lui, on
  // ne lui met pas un jeu à deux en premier.
  function blocSuites() {
    var brut = RACINE.dataset.suites;
    if (!brut) return null;
    var tables;
    try { tables = JSON.parse(brut); } catch (e) { return null; }
    var liste = (tables && tables[mode]) || [];
    if (!liste.length) return null;

    var bloc = el('section', 'pu-bloc pu-bloc--suites');
    bloc.appendChild(el('h3', 'pu-bloc-titre', 'Et maintenant ?'));
    bloc.appendChild(el('p', 'pu-bloc-sous',
      mode === 'solo'
        ? T('suites_sous_solo', 'Tu as le score, il te manque la suite. Voilà par quoi enchaîner.')
        : T('suites_sous_couple', 'Vous êtes déjà à deux devant l\'écran, autant en profiter.')));

    var grille = el('div', 'pu-suites');
    liste.forEach(function (s) {
      if (!s || !s.url) return;
      var a = document.createElement('a');
      a.className = 'pu-suite';
      a.href = s.url;
      a.innerHTML = '<span class="pu-suite-emoji" aria-hidden="true">' + (s.emoji || '•') + '</span>' +
        '<span class="pu-suite-corps"><span class="pu-suite-nom">' + esc(s.nom) + '</span>' +
        '<span class="pu-suite-desc">' + esc(s.desc || '') + '</span></span>' +
        '<span class="pu-suite-fleche" aria-hidden="true">→</span>';
      grille.appendChild(a);
    });
    bloc.appendChild(grille);
    return bloc;
  }

  // Courbe des scores réellement enregistrés, avec un repère sur le vôtre.
  function bloCourbe(pct) {
    var s = statsGlobales;
    var bloc = el('section', 'pu-bloc pu-bloc--courbe');
    bloc.appendChild(el('h3', 'pu-bloc-titre', TV('courbe_titre_solo', 'courbe_titre_couple', 'Où tu te situes', 'Où vous vous situez')));

    // Part des parties dont le score est plus bas que le vôtre. « Moins pur
    // que X % » était juste mais se lisait de travers : on formule dans le
    // sens du score, qui monte avec l'impureté.
    var enDessous = 0, total = 0;
    s.tranches.forEach(function (n, i) { total += n; if (i * 5 + 5 <= pct) enDessous += n; });
    var devant = total ? Math.round((enDessous / total) * 100) : 50;
    bloc.appendChild(el('p', 'pu-bloc-sous',
      fmt(TV('courbe_sous_solo', 'courbe_sous_couple',
        'Sur <strong>{n}</strong> tests, tu fais moins pur que <strong>{devant}%</strong> des gens. La moyenne est à <strong>{moyenne}</strong> points.',
        'Sur <strong>{n}</strong> tests, vous faites moins purs que <strong>{devant}%</strong> des gens. La moyenne est à <strong>{moyenne}</strong> points.'),
        { n: nb(s.total), devant: devant, moyenne: nb(s.moyenne) })));

    // Courbe lissée en SVG. Les vingt tranches deviennent une polyligne
    // adoucie ; le trait vertical marque le score de la personne.
    var L = 640, H = 220, bas = H - 28, gauche = 8, droite = L - 8;
    var maxT = Math.max.apply(null, s.tranches) || 1;
    var pts = s.tranches.map(function (n, i) {
      return [gauche + ((droite - gauche) * (i + 0.5)) / 20, bas - (n / maxT) * (bas - 16)];
    });
    var d = 'M' + pts[0][0].toFixed(1) + ',' + pts[0][1].toFixed(1);
    for (var i = 0; i < pts.length - 1; i++) {
      var a = pts[i], b = pts[i + 1], mx = (a[0] + b[0]) / 2;
      d += ' C' + mx.toFixed(1) + ',' + a[1].toFixed(1) + ' ' + mx.toFixed(1) + ',' + b[1].toFixed(1) +
        ' ' + b[0].toFixed(1) + ',' + b[1].toFixed(1);
    }
    var x = gauche + ((droite - gauche) * pct) / 100;

    var svg = '<svg class="pu-courbe" viewBox="0 0 ' + L + ' ' + H + '" role="img" ' +
      'aria-label="' + esc(fmt(T('courbe_aria', 'Répartition des scores, le vôtre est à {pct} pour cent du maximum'), { pct: pct })) + '">' +
      '<defs><linearGradient id="puAire" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="hsl(338 72% 62% / .38)"/>' +
      '<stop offset="100%" stop-color="hsl(338 72% 62% / 0)"/></linearGradient></defs>' +
      '<path d="' + d + ' L' + droite + ',' + bas + ' L' + gauche + ',' + bas + ' Z" fill="url(#puAire)"/>' +
      '<path d="' + d + '" fill="none" stroke="hsl(338 72% 62%)" stroke-width="3" stroke-linecap="round"/>' +
      '<line x1="' + x.toFixed(1) + '" y1="8" x2="' + x.toFixed(1) + '" y2="' + bas + '" ' +
      'stroke="currentColor" stroke-width="2" stroke-dasharray="5 4"/>' +
      '<circle cx="' + x.toFixed(1) + '" cy="' + bas + '" r="5" fill="hsl(338 72% 62%)"/>' +
      '<text x="0" y="' + (H - 8) + '" class="pu-courbe-axe">0</text>' +
      '<text x="' + (L / 2) + '" y="' + (H - 8) + '" class="pu-courbe-axe" text-anchor="middle">' +
      Math.round(scoreMax / 2) + '</text>' +
      '<text x="' + L + '" y="' + (H - 8) + '" class="pu-courbe-axe" text-anchor="end">' + scoreMax + '</text>' +
      '</svg>';
    var boite = el('div', 'pu-courbe-boite', svg);
    var etiq = el('span', 'pu-courbe-repere', 'Vous');
    etiq.style.left = ((x / L) * 100).toFixed(2) + '%';
    boite.appendChild(etiq);
    bloc.appendChild(boite);
    return bloc;
  }

  // ─── Partage ────────────────────────────────────────────────────────────
  function blocPartage(score, pct) {
    var bloc = el('section', 'pu-bloc pu-bloc--partage');
    bloc.appendChild(el('h3', 'pu-bloc-titre', TV('partage_titre_solo', 'partage_titre_couple', 'Envoie ton score à quelqu\'un', 'Envoyez votre score à quelqu\'un')));
    bloc.appendChild(el('p', 'pu-bloc-sous',
      mode === 'solo'
        ? T('partage_sous_solo', 'Le plus drôle, c\'est de comparer. Envoie ça à ton/ta partenaire ou à tes potes, et attends leur score.')
        : T('partage_sous_couple', 'Envoyez le score de votre couple à vos amis, et mettez-les au défi de faire mieux. Ou pire.')));

    var lien = location.origin + location.pathname;
    var texte = mode === 'solo'
      ? fmt(T('partage_msg_solo', 'J\'ai eu {score} points au test de pureté ({pct}% d\'impureté). À toi maintenant : '), { score: score, pct: pct })
      : fmt(T('partage_msg_couple', 'On a eu {score} points au test de pureté en couple ({pct}% d\'impureté). À vous maintenant : '), { score: score, pct: pct });
    var complet = texte + lien;

    var grille = el('div', 'pu-partages');

    function bouton(cls, libelle, action) {
      var b = el('button', 'pu-partage ' + cls, libelle);
      b.type = 'button';
      b.addEventListener('click', action);
      grille.appendChild(b);
      return b;
    }

    // Le partage natif ouvre directement la liste de contacts sur mobile,
    // c'est le chemin le plus court vers « je l'envoie à mon copain ».
    if (navigator.share) {
      bouton('pu-partage--natif', '📤 ' + T('partage_envoyer', 'Envoyer'), function () {
        navigator.share({ title: T('partage_sujet', 'Test de pureté'), text: texte, url: lien }).catch(function () {});
      });
    }
    bouton('pu-partage--wa', '💬 WhatsApp', function () {
      window.open('https://wa.me/?text=' + encodeURIComponent(complet), '_blank', 'noopener');
    });
    bouton('pu-partage--sms', '✉️ ' + T('partage_sms', 'SMS'), function () {
      location.href = 'sms:?&body=' + encodeURIComponent(complet);
    });
    bouton('pu-partage--x', '𝕏 Poster', function () {
      window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(texte) +
        '&url=' + encodeURIComponent(lien), '_blank', 'noopener');
    });
    var copie = bouton('pu-partage--copie', '🔗 Copier le message', function () {
      var fini = function () {
        copie.textContent = '✅ ' + T('partage_copie', 'Copié');
        setTimeout(function () { copie.textContent = '🔗 Copier le message'; }, 2200);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(complet).then(fini).catch(function () {});
      } else {
        var z = document.createElement('textarea');
        z.value = complet; document.body.appendChild(z); z.select();
        try { document.execCommand('copy'); fini(); } catch (e) {}
        document.body.removeChild(z);
      }
    });

    bloc.appendChild(grille);
    return bloc;
  }

  // ─── Détail par catégorie ───────────────────────────────────────────────
  function blocCategories() {
    var totaux = {};
    reponses.forEach(function (r, i) {
      if (!r) return;
      var c = r.cat;
      if (!totaux[c]) totaux[c] = { pts: 0, max: 0 };
      totaux[c].pts += r.pts;
      totaux[c].max += questions[i] ? maxQ(questions[i]) : r.maxCat;
    });

    var bloc = el('section', 'pu-bloc pu-bloc--cats');
    bloc.appendChild(el('h3', 'pu-bloc-titre', T('categories_titre', 'Le détail, catégorie par catégorie')));
    bloc.appendChild(el('p', 'pu-bloc-sous',
      TV('categories_sous_solo', 'categories_sous_couple',
        'C\'est là qu\'on voit ce qui te perd vraiment. Une barre pleine, c\'est un domaine où tu as tout coché.',
        'C\'est là qu\'on voit ce qui vous perd vraiment. Une barre pleine, c\'est un domaine où vous avez tout coché.')));

    var liste = el('div', 'pu-cats');
    Object.keys(totaux)
      .map(function (c) {
        var t = totaux[c];
        return { c: c, pct: t.max ? Math.round((t.pts / t.max) * 100) : 0, pts: t.pts, max: t.max };
      })
      .sort(function (a, b) { return b.pct - a.pct; })
      .forEach(function (r) {
        var meta = D.cats[r.c] || { nom: r.c, emoji: '•' };
        var ligne = el('div', 'pu-cat');
        ligne.innerHTML =
          '<div class="pu-cat-tete"><span class="pu-cat-nom">' + meta.emoji + ' ' + esc(meta.nom) + '</span>' +
          '<span class="pu-cat-val">' + r.pct + '%</span></div>' +
          '<div class="pu-cat-piste"><span style="width:' + r.pct + '%"></span></div>' +
          '<p class="pu-cat-detail">' + nb(r.pts) + ' points sur ' + nb(r.max) + '</p>';
        liste.appendChild(ligne);
      });
    bloc.appendChild(liste);
    return bloc;
  }

  function blocReprendre() {
    var bloc = el('div', 'pu-reprise');
    var b = el('button', 'pu-cta pu-cta--fantome', T('refaire', 'Refaire le test'));
    b.type = 'button';
    b.addEventListener('click', function () { rend(ecranModes); versLeHaut(RACINE); });
    bloc.appendChild(b);
    return bloc;
  }

  // ─── Rendu ──────────────────────────────────────────────────────────────
  function rend(fabrique) {
    RACINE.innerHTML = '';
    RACINE.appendChild(fabrique());
  }

  // ─── Amorce ─────────────────────────────────────────────────────────────
  // Le bouton du hero descend jusqu'au moteur et ouvre le choix du mode.
  function amorce() {
    rend(ecranModes);
    var depart = document.getElementById('purete-demarrer');
    if (depart) {
      depart.addEventListener('click', function (e) {
        e.preventDefault();
        rend(ecranModes);
        versLeHaut(RACINE);
      });
    }
    // Le compteur de parties et la moyenne annoncés dans le hero viennent des
    // mêmes agrégats que la courbe. S'ils manquent, les emplacements restent
    // masqués : mieux vaut un hero plus court qu'un chiffre inventé.
    chargeStats(null).then(function (s) {
      if (!s) return;
      var cpt = document.getElementById('purete-compteur');
      if (cpt && s.total > 0) {
        cpt.textContent = fmt(T('hero_compteur', 'Ce test a déjà été fait {n} fois'), { n: nb(s.total) });
        cpt.hidden = false;
      }
      var moy = document.getElementById('purete-moyenne');
      if (moy && s.assez) {
        moy.textContent = fmt(T('hero_moyenne', 'Score moyen : {n} points'), { n: nb(s.moyenne) });
        moy.hidden = false;
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', amorce);
  else amorce();
})();
