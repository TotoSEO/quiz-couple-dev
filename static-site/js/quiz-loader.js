/**
 * Universal Quiz Loader - auto-initializes quiz engine based on data attributes
 * Reads data-quiz and data-lang from #quiz-engine element
 * Maps each quiz type to its correct engine, pool size, and mechanics
 * Handles multiple gd.json key patterns across languages (FR base + non-FR variants)
 */
(function() {
  'use strict';

  var container = document.getElementById('quiz-engine');
  if (!container) return;

  var quizType = container.dataset.quiz;
  var lang = container.dataset.lang || 'fr';
  if (!quizType) return;

  // ─── Quiz Configuration ───────────────────────────────────
  // Each quiz has: prefix (gd.json key), engine type, totalQ, pool size
  // textOnly: true means no per-question options (knowledge, most, funny)
  var QUIZ_CONFIG = {
    // ── Solo scoring (single player, points-based) ──
    // Le test toxique a son propre pool depuis toujours en EN, ES, DE et IT ;
    // il n'etait branche nulle part et les cinq langues retombaient sur la
    // serie 'divorce', ce qui publiait deux pages aux memes 25 questions.
    'toxic':          { prefix: 'toxic', engine: 'solo', totalQ: 25, pool: 25, quizType: 'toxic', ascending: true, resultPrefix: 'toxic' },
    'pervers':        { prefix: 'pervers', engine: 'solo', totalQ: 20, pool: 20, quizType: 'pervers', ascending: true, resultPrefix: 'pervers' },
    // Fin de couple : 24 questions dont la première ne sert qu'à situer la
    // relation. Les 23 autres n'ont pas le même poids, le barème est donc
    // écrit à la main dans gd.json plutôt que déduit du rang des réponses.
    'fin-couple':     { prefix: 'finCouple', engine: 'solo', totalQ: 24, pool: 24, quizType: 'fin-couple', ascending: true, ptsExplicites: true },
    // Amour ou amitié : le score monte vers l'amour. Les signaux forts
    // (l'envie d'embrasser, la jalousie des rencards) pèsent bien plus que
    // ce qui est commun aux deux liens, d'où le barème explicite.
    'amour-amitie':   { prefix: 'amourAmitie', engine: 'solo', totalQ: 20, pool: 20, quizType: 'amour-amitie', ascending: true, ptsExplicites: true },
    'amour-habitude': { prefix: 'habitude', engine: 'solo', totalQ: 20, pool: 20, quizType: 'amour-habitude', ascending: true, resultPrefix: 'habitude' },
    'divorce':        { prefix: 'divorce', engine: 'solo', totalQ: 15, pool: 25, quizType: 'divorce', hasSkip: true, ascending: true },
    'mariage':        { prefix: 'marriage', engine: 'solo', totalQ: 30, pool: 30, hasSkip: true, hasLocalStorage: true },

    // ── Duo with gender (2 players + gender selection, answer matching) ──
    // Test de couple : pool 'testerC' qui lui est propre dans les 5 langues,
    // distinct du pool 'couple' que le quiz sain utilise en repli francais.
    // Les 33 questions mesurent la solidite (jalons franchis, epreuves
    // traversees, projection, ancrage) et portent chacune un poids.
    'tester-couple':  { modesGrand: true, modes: [
      // SOLO : le couple repond ensemble, une seule serie de reponses, donc
      // ni prenoms ni genre a saisir et une note unique a l'arrivee.
      { id: 'solo', emoji: '💑', prefix: 'testerC', engine: 'duo-match', totalQ: 20, pool: 33,
        useScoring: true, stratifie: true, modeSolo: true },
      // DUO : chacun repond aux memes questions a tour de role, deux notes
      // individuelles et leur moyenne.
      { id: 'duo',  emoji: '👥', prefix: 'testerC', engine: 'duo-match', totalQ: 20, pool: 33,
        useScoring: true, stratifie: true, needsGender: true }
    ] },
    'common-points':  { prefix: 'commonPoints', engine: 'duo-match', totalQ: 20, pool: 153, needsGender: true },

    // ── Love compatibility (2 players, matching = alignment % on core dimensions) ──
    'compatibilite':  { prefix: 'compatibilite', engine: 'duo-match', totalQ: 20, pool: 20, needsGender: true, resultSet: 'compat' },

    // ── Healthy quiz (2 players + gender, weighted scoring) ──
    'sain':           { prefix: 'healthy', engine: 'healthy', totalQ: 20, pool: 78, needsGender: true },

    // ── Distance quiz (2 players, alternating turns, points per option) ──
    'distance':       { prefix: 'distance', engine: 'distance', totalQ: 20, pool: 100 },

    // ── Coquin quiz (guess & reveal mechanic) ──
    'coquin':         { prefix: 'coquin', engine: 'coquin', totalQ: 30, pool: 60 },

    // ── Knowledge quiz (oral validation with ✅/❌) - text only ──
    'knowledge':      { prefix: 'knowledge', engine: 'knowledge', totalQ: 20, pool: 100, textOnly: true },

    // ── Quiz amoureux : on compare les réponses, à deux ──
    // Les trente entrées « amoureux » sont des questions ouvertes sur votre
    // histoire, chacune avec quatre réponses écrites. L'ancien moteur « débat »
    // ignorait ces réponses et affichait à la place une échelle « pas du tout
    // d'accord → tout à fait d'accord » : on demandait donc son niveau
    // d'accord avec « Quel est mon plat préféré ? ». Ces cent vingt réponses
    // servent enfin, dans le moteur à deux qui compare vos choix.
    'amoureux':       { prefix: 'amoureux', engine: 'duo-match', totalQ: 20, pool: 30 },

    // ── Quiz marrant : des questions qu'on se pose l'un à l'autre ──
    // Six familles de vingt-cinq questions. Le moteur pioche lui-même, à parts
    // égales dans chaque famille : les prénoms qu'on demandait avant ne
    // servaient à rien, ils ont disparu.
    'marrant':        { prefix: 'marrant', engine: 'funny', totalQ: 20, pool: 0, textOnly: true,
                        familles: [
                          { id: 'debuts', emoji: '💘' }, { id: 'genant', emoji: '😬' },
                          { id: 'quotidien', emoji: '🏠' }, { id: 'betises', emoji: '🤣' },
                          { id: 'avoue', emoji: '🙈' }, { id: 'siOn', emoji: '🎬' }
                        ] },

    // ── Most quiz ("Qui est le plus..." - 2-8 players, vote) - text only ──
    'most':           { prefix: 'most', engine: 'most', totalQ: 20, pool: 245, textOnly: true },

    // ── Parentalite quiz (2 players, same questions, explicit point values) ──
    'parentalite':    { prefix: 'parentalite', engine: 'parentalite', totalQ: 24, pool: 24 },

    // ── Emmenager quiz (same engine as parentalite) ──
    'emmenager':      { prefix: 'emmenager', engine: 'parentalite', totalQ: 20, pool: 20 },

    // ── Jalousie quizzes (solo scoring, two sub-tests on same page) ──
    'jalousie1':      { prefix: 'jalousie1', engine: 'solo', totalQ: 20, pool: 20, quizType: 'jalousie1', ascending: true },
    'jalousie2':      { prefix: 'jalousie2', engine: 'solo', totalQ: 20, pool: 20, quizType: 'jalousie2', ascending: true },

    // ── Quiz gênant : la page répond à deux intentions ──
    // « Sommes-nous un couple gênant ? » est un test à score, et c'est le seul
    // format qu'on exploitait. Mais on cherche aussi « questions gênantes à
    // poser à son copain » : ça, c'est un jeu à deux, pas un test. Les deux
    // vivent sur la même page, le visiteur choisit en arrivant.
    'genant':         { modes: [
      { id: 'test', emoji: '📊', prefix: 'genant', engine: 'solo', totalQ: 15, pool: 15, quizType: 'genant' },
      { id: 'jeu',  emoji: '😳', prefix: 'genantJeu', engine: 'funny', totalQ: 20, pool: 0, textOnly: true,
        familles: [
          { id: 'corps', emoji: '🚽' }, { id: 'avant', emoji: '💔' },
          { id: 'entourage', emoji: '👀' }, { id: 'verite', emoji: '😳' }
        ] }
    ] },

    // ── Vrai/Faux quiz (true/false with correct answer reveal) ──
    'vrai-faux':      { prefix: 'vraifaux', engine: 'truefalse', totalQ: 30, pool: 100, textOnly: true },

    // ── Attachement quiz (categorical: secure/anxious/avoidant → 4 styles) ──
    'attachement':    { prefix: 'attachement', engine: 'profile', totalQ: 20, pool: 20, quizType: 'attachement', categoryMap: { a: 'secure', b: 'secure', c: 'avoidant', d: 'anxious' } },

    // ── Action ou vérité (cartes, le joueur choisit vérité ou action) ──
    // Deux pages distinctes : la version grand public et la version coquine,
    // qui n'ont ni la même intention de recherche ni le même public. Les deux
    // séries d'une page forment un seul paquet, elles ne sont plus proposées
    // séparément au joueur.
    'action-ou-verite':        { prefix: 'actionVerite', engine: 'party', totalQ: 0, pool: 0, textOnly: true, series: ['classique', 'marrant'] },
    'action-ou-verite-coquin': { prefix: 'actionVeriteHot', engine: 'party', totalQ: 0, pool: 0, textOnly: true, series: ['coquin', 'hot'] },
    'gage-couple':             { prefix: 'gageRoue', engine: 'roue', totalQ: 0, pool: 0, textOnly: true, segments: ['bisou', 'massage', 'show', 'aveu', 'grimace', 'photo', 'douceur'] },

    // ── Le plateau : le seul jeu qui se gagne. Il pioche dans ses propres
    // cases et dans les paquets deja ecrits pour les cartes et pour la roue,
    // d'ou les prefixes supplementaires a charger.
    'plateau-couple':          { prefix: 'plateau', engine: 'plateau', totalQ: 0, pool: 0, textOnly: true, prefixesExtra: ['actionVerite', 'gageRoue'] },
    // ── Qui de nous deux : vote secret de chacun puis revelation commune.
    'qui-de-nous-deux':        { prefix: 'quiDeNous', engine: 'duo-vote', totalQ: 0, pool: 0, textOnly: true },

    // ── Dilemmes : on accepte ou on refuse un marché, et on voit le score
    // des autres couples. Rien à voir avec « tu préfères », qui fait choisir
    // entre deux options : ici il n'y a qu'une proposition sur la table. ──
    'dilemmes':                { prefix: 'dilemmes', engine: 'dilemme', totalQ: 0, pool: 0, textOnly: true },

    // ── Pour ou contre : une proposition, deux camps, et les pourcentages
    // des couples qui sont passés avant. Les familles sont déclarées ici avec
    // leur effectif parce que l'identifiant envoyé en base est la position
    // dans cette liste : la première proposition de « projets » est la n° 1,
    // la dernière de « discuter » est la n° 60, et ça ne doit pas bouger. ──
    'pour-contre':             { prefix: 'pourContre', engine: 'pour-contre', totalQ: 0, pool: 0, textOnly: true,
                                 familles: [
                                   { id: 'projets', n: 12 }, { id: 'vacances', n: 10 },
                                   { id: 'couple', n: 10 }, { id: 'quotidien', n: 10 },
                                   { id: 'moments', n: 8 }, { id: 'discuter', n: 10 }
                                 ] },

    // ── Suis-je amoureux (solo, ascendant : plus de signes = plus de points) ──
    'suis-je-amoureux': { prefix: 'suisjeamoureux', engine: 'solo', totalQ: 20, pool: 20, quizType: 'suisjeamoureux', ascending: true },

    // ── Karmique (typologie du lien : apaisé / miroir / karmique → 4 profils) ──
    'karmique':       { prefix: 'karmique', engine: 'profile', totalQ: 20, pool: 20, quizType: 'karmique', typologie: 'karmique', categoryMap: { a: 'apaise', b: 'miroir', c: 'karmique' } },

    // ── Les 5 langages de l'amour (typologie à cinq axes) ──
    // Le sens des lettres tourne d'une question à l'autre : cinq permutations
    // qui se répètent tous les cinq questions, pour que chaque langage soit
    // proposé autant de fois à chaque position et qu'on ne puisse pas répondre
    // « toujours a » sans lire. La table est donc une fonction, pas un tableau.
    'langage-amour':  { prefix: 'loveLanguage', engine: 'profile', totalQ: 30, pool: 30, quizType: 'langage-amour', typologie: 'langageAmour',
      categoryMap: (function() {
        var LANGS = ['words', 'acts', 'gifts', 'time', 'touch'];
        var PERMS = [
          [0, 1, 2, 3, 4], // words, acts,  gifts, time,  touch
          [3, 4, 0, 1, 2], // time,  touch, words, acts,  gifts
          [1, 2, 3, 4, 0], // acts,  gifts, time,  touch, words
          [4, 0, 1, 3, 2], // touch, words, acts,  time,  gifts
          [2, 3, 4, 0, 1]  // gifts, time,  touch, words, acts
        ];
        return function(optId, questionId) {
          var col = ['a', 'b', 'c', 'd', 'e'].indexOf(optId);
          if (col < 0) return null;
          return LANGS[PERMS[(questionId - 1) % 5][col]];
        };
      })() },

    // ── Confiance quiz (solo scoring, trust assessment) ──
    // ── Dependance affective (solo, ascendant : plus de points = plus dependant) ──
    'dependance':     { prefix: 'dependance', engine: 'solo', totalQ: 20, pool: 20, quizType: 'dependance', ascending: true },

    'confiance':      { prefix: 'confiance', engine: 'solo', totalQ: 20, pool: 20, quizType: 'confiance' },

    // ── Infidelite quiz (solo scoring, ascending: more signs = higher score) ──
    'infidelite':     { prefix: 'infidelite', engine: 'solo', totalQ: 20, pool: 20, quizType: 'infidelite', ascending: true },

    // ── « A-t-il / a-t-elle couché avec quelqu'un d'autre » ──
    // Le genre du partenaire est demandé avant la première question : ce n'est
    // pas de la cosmétique, deux des quinze questions n'ont de sens que pour
    // l'un ou pour l'autre, et les accords français ne se devinent pas. Les
    // deux séries partagent leurs paliers de résultat, sous « couche ».
    // ── « M'aime-t-il / m'aime-t-elle en secret » ──
    // Même mécanique que le test précédent : on demande d'abord à qui on
    // pense, puis on charge la série correspondante. Dix questions seulement,
    // le sujet ne supporte pas la longueur.
    // ── « M'aime-t-il / m'aime-t-elle encore », spécial distance ──
    // Une seule série ici : les questions sont écrites autour de « votre
    // partenaire » et sans adjectif accordé, le genre n'a donc pas à être
    // demandé. Barème inversé par rapport aux deux tests de doute : la
    // dernière réponse est la plus rassurante, un score haut est une bonne
    // nouvelle.
    'distance-aime':  { prefix: 'distanceAime', engine: 'solo', totalQ: 15, pool: 15, quizType: 'distanceAime', ascending: true },

    'secret':         { modes: [
      { id: 'homme', emoji: '👨', prefix: 'secretH', engine: 'solo', totalQ: 10, pool: 10, quizType: 'secret', ascending: true, resultPrefix: 'secret' },
      { id: 'femme', emoji: '👩', prefix: 'secretF', engine: 'solo', totalQ: 10, pool: 10, quizType: 'secret', ascending: true, resultPrefix: 'secret' }
    ] },

    'couche':         { modes: [
      { id: 'homme', emoji: '👨', prefix: 'coucheH', engine: 'solo', totalQ: 15, pool: 15, quizType: 'couche', ascending: true, resultPrefix: 'couche' },
      { id: 'femme', emoji: '👩', prefix: 'coucheF', engine: 'solo', totalQ: 15, pool: 15, quizType: 'couche', ascending: true, resultPrefix: 'couche' }
    ] },

    // ── Bebe quiz (solo scoring, descending: more ready = higher score) ──

    // ── Les Z'Amours (TV game-show: guess & reveal + 45s final) ──
    'zamours':        { prefix: 'zamours', engine: 'zamours', totalQ: 14, pool: 60 },
    'tentation':      { prefix: 'tentation', engine: 'tentation', totalQ: 12, pool: 30, ascending: true }
  };

  var config = QUIZ_CONFIG[quizType];
  if (!config) {
    container.innerHTML = '<p class="text-center text-muted-foreground">Quiz non disponible.</p>';
    return;
  }

  // Préfixes de données dont ce quiz a besoin. tgd ne consulte jamais que le
  // préfixe demandé et son alias, auxquels s'ajoutent le préfixe de résultats
  // quand il diffère et le repli 'couple' du quiz sain. Sans cette liste, la
  // page téléchargeait les trente préfixes du fichier complet.
  // Les alias ne sont pas listés : le build émet chaque fragment sous les deux
  // noms, donc une seule requête suffit quelle que soit la langue.
  // Une page à deux formats a besoin des données des deux : le choix se fait
  // après le chargement, on ne peut pas attendre de savoir lequel sera retenu.
  function prefixesNecessaires(cfg) {
    var l = [];
    function ajoute(p) { if (p && l.indexOf(p) === -1) l.push(p); }
    (cfg.modes || [cfg]).forEach(function(m) {
      ajoute(m.prefix);
      ajoute(m.resultPrefix);
      (m.prefixesExtra || []).forEach(ajoute);
      if (m.prefix === 'healthy') ajoute('couple');   // repli du quiz sain en FR
    });
    return l;
  }

  // ─── Pages à deux formats ────────────────────────────────
  // Les libellés du choix vivent avec les questions, sous le préfixe du quiz :
  // « genant.modeTestTitre », « genant.modeJeuDesc »…
  function texteMode(cfg, id, champ, repli) {
    var cle = cfg.prefix + '.mode' + id.charAt(0).toUpperCase() + id.slice(1) + champ;
    var v = QuizEngine.tgd(cle, null);
    return (v && v !== cle) ? v : repli;
  }

  function afficherChoixDeMode(racine) {
    var base = racine.modes[0].prefix;
    var lu = function(champ, repli) {
      var cle = base + '.' + champ;
      var v = QuizEngine.tgd(cle, null);
      return (v && v !== cle) ? v : repli;
    };
    container.innerHTML = '';
    container.appendChild(QuizEngine.ecranModes({
      icone: lu('modesIcone', '😳'),
      titre: lu('modesTitre', ''),
      desc: lu('modesDesc', ''),
      grand: !!racine.modesGrand,
      modes: racine.modes.map(function(m) {
        return {
          id: m.id, emoji: m.emoji,
          titre: texteMode(racine.modes[0], m.id, 'Titre', m.id),
          desc: texteMode(racine.modes[0], m.id, 'Desc', ''),
          meta: texteMode(racine.modes[0], m.id, 'Meta', '')
        };
      }),
      onChoix: function(id) {
        for (var i = 0; i < racine.modes.length; i++) {
          if (racine.modes[i].id !== id) continue;
          config = racine.modes[i];
          poserRetourAuxModes(racine, lu('modesRetour', 'Changer de format'));
          initFromData();
          return;
        }
      }
    }));
  }

  // Le bouton de retour est posé à côté du moteur, pas dedans : les moteurs
  // vident leur conteneur à chaque écran, il n'y survivrait pas.
  function poserRetourAuxModes(racine, libelle) {
    var ancien = document.getElementById('quiz-modes-retour');
    if (ancien) ancien.remove();
    var b = document.createElement('button');
    b.id = 'quiz-modes-retour';
    b.type = 'button';
    b.className = 'quiz-modes-retour';
    b.innerHTML = '<span aria-hidden="true">&larr;</span> ' + libelle;
    b.addEventListener('click', function() {
      b.remove();
      config = racine;
      initFromData();
    });
    container.parentNode.insertBefore(b, container.nextSibling);
  }

  // Load translations then initialize
  var _dataAttempt = 0;
  var _repliComplet = false;
  function initFromData() {
    // Une page à deux formats commence par demander lequel. Le mode retenu
    // remplace la configuration : tout ce qui suit se déroule ensuite comme
    // pour un quiz ordinaire.
    if (config.modes) {
      afficherChoixDeMode(config);
      return;
    }

    // Le plateau vérifie lui aussi ses propres données : ses cases, mais
    // surtout les paquets empruntés aux autres jeux.
    if (config.engine === 'plateau') {
      var sondeP = config.prefix + '.souvenir1';
      var sondeC = 'actionVerite.classique_q1';
      var manque = function(k) { return !QuizEngine.tgd(k, null) || QuizEngine.tgd(k, null) === k; };
      if (manque(sondeP) || manque(sondeC)) {
        if (!_repliComplet) { _repliComplet = true; QuizEngine.loadAllTranslations(lang, initFromData); return; }
        if (_dataAttempt < 3) { _dataAttempt++; setTimeout(function() { QuizEngine.loadAllTranslations(lang, initFromData); }, 700 * _dataAttempt); return; }
        showUnavailable(config);
        return;
      }
      new QuizEngine.BoardGame({ container: container, prefix: config.prefix, lang: lang });
      return;
    }

    // Qui de nous deux lit quatre familles de questions : il vérifie la
    // première de chacune avant de démarrer.
    if (config.engine === 'duo-vote') {
      var themes = ['quotidien', 'amour', 'caractere', 'drole'];
      var absent = themes.some(function(t) {
        var k = config.prefix + '.' + t + '1';
        return !QuizEngine.tgd(k, null) || QuizEngine.tgd(k, null) === k;
      });
      if (absent) {
        if (!_repliComplet) { _repliComplet = true; QuizEngine.loadAllTranslations(lang, initFromData); return; }
        if (_dataAttempt < 3) { _dataAttempt++; setTimeout(function() { QuizEngine.loadAllTranslations(lang, initFromData); }, 700 * _dataAttempt); return; }
        showUnavailable(config);
        return;
      }
      new QuizEngine.DuoVoteGame({ container: container, prefix: config.prefix, lang: lang });
      return;
    }

    // Les dilemmes sont stockés par paires : d{N} porte l'avantage, d{N}_mais
    // la contrepartie. Un dilemme sans sa contrepartie n'a pas de sens, on
    // n'en garde donc que les paires complètes.
    if (config.engine === 'dilemme') {
      var dilemmes = [];
      for (var di = 1; di <= 300; di++) {
        var haut = QuizEngine.tgd(config.prefix + '.d' + di, null);
        var bas = QuizEngine.tgd(config.prefix + '.d' + di + '_mais', null);
        if (!haut || haut === config.prefix + '.d' + di) continue;
        if (!bas || bas === config.prefix + '.d' + di + '_mais') continue;
        dilemmes.push({ id: di, haut: haut, bas: bas });
      }
      if (dilemmes.length === 0) {
        if (!_repliComplet) { _repliComplet = true; QuizEngine.loadAllTranslations(lang, initFromData); return; }
        if (_dataAttempt < 3) { _dataAttempt++; setTimeout(function() { QuizEngine.loadAllTranslations(lang, initFromData); }, 700 * _dataAttempt); return; }
        showUnavailable(config);
        return;
      }
      new QuizEngine.DilemmeGame({ container: container, prefix: config.prefix, lang: lang, dilemmes: dilemmes });
      return;
    }

    // Pour ou contre : les propositions sont rangées par famille, mais leur
    // identifiant est leur rang global, indépendant de la famille. Il est
    // incrémenté avant la vérification du texte pour qu'une traduction
    // manquante décale les votes de personne.
    if (config.engine === 'pour-contre') {
      var famillesPC = config.familles || [];
      var propositions = [], rang = 0;
      famillesPC.forEach(function(f) {
        var cleTheme = config.prefix + '.theme_' + f.id;
        var theme = QuizEngine.tgd(cleTheme, null);
        if (!theme || theme === cleTheme) theme = '';
        for (var pi = 1; pi <= f.n; pi++) {
          rang++;
          var clePC = config.prefix + '.' + f.id + pi;
          var textePC = QuizEngine.tgd(clePC, null);
          if (!textePC || textePC === clePC) continue;
          propositions.push({ id: rang, texte: textePC, theme: theme });
        }
      });
      if (propositions.length === 0) {
        if (!_repliComplet) { _repliComplet = true; QuizEngine.loadAllTranslations(lang, initFromData); return; }
        if (_dataAttempt < 3) { _dataAttempt++; setTimeout(function() { QuizEngine.loadAllTranslations(lang, initFromData); }, 700 * _dataAttempt); return; }
        showUnavailable(config);
        return;
      }
      new QuizEngine.PourContreGame({ container: container, prefix: config.prefix, lang: lang, questions: propositions });
      return;
    }

    // Le quiz marrant tire lui-même ses questions, autant dans chacune de ses
    // six familles, pour qu'une partie ne tombe pas vingt fois sur la même
    // veine. Il vérifie la première question de chaque famille avant de
    // démarrer.
    if (config.engine === 'funny') {
      var familles = config.familles || [];
      var manquante = familles.some(function(f) {
        var k = config.prefix + '.' + f.id + '1';
        return !QuizEngine.tgd(k, null) || QuizEngine.tgd(k, null) === k;
      });
      if (manquante) {
        if (!_repliComplet) { _repliComplet = true; QuizEngine.loadAllTranslations(lang, initFromData); return; }
        if (_dataAttempt < 3) { _dataAttempt++; setTimeout(function() { QuizEngine.loadAllTranslations(lang, initFromData); }, 700 * _dataAttempt); return; }
        showUnavailable(config);
        return;
      }
      // le réservoir est bien plus grand qu'une partie : « autres questions »
      // a un sens sur l'écran de fin
      new QuizEngine.FunnyQuiz({ container: container, prefix: config.prefix, lang: lang,
        familles: familles, total: config.totalQ });
      return;
    }

    // La roue des gages ne lit pas des questions numérotées mais des familles
    // de gages : elle vérifie elle-même que ses données sont là.
    if (config.engine === 'roue') {
      var sondeR = config.prefix + '.' + (config.segments || ['bisou'])[0] + '1';
      if (!QuizEngine.tgd(sondeR, null) || QuizEngine.tgd(sondeR, null) === sondeR) {
        if (!_repliComplet) { _repliComplet = true; QuizEngine.loadAllTranslations(lang, initFromData); return; }
        if (_dataAttempt < 3) { _dataAttempt++; setTimeout(function() { QuizEngine.loadAllTranslations(lang, initFromData); }, 700 * _dataAttempt); return; }
        showUnavailable(config);
        return;
      }
      new QuizEngine.WheelGame({ container: container, prefix: config.prefix, lang: lang, segments: config.segments });
      return;
    }

    // Le moteur de cartes ne lit pas des questions numérotées mais des paquets
    // par ambiance : il vérifie lui-même que ses données sont là.
    if (config.engine === 'party') {
      var sonde = config.prefix + '.' + (config.series || ['classique'])[0] + '_q1';
      if (!QuizEngine.tgd(sonde, null) || QuizEngine.tgd(sonde, null) === sonde) {
        if (!_repliComplet) { _repliComplet = true; QuizEngine.loadAllTranslations(lang, initFromData); return; }
        if (_dataAttempt < 3) { _dataAttempt++; setTimeout(function() { QuizEngine.loadAllTranslations(lang, initFromData); }, 700 * _dataAttempt); return; }
        showUnavailable(config);
        return;
      }
      initPartyGame(config);
      return;
    }

    var textOnly = config.textOnly || false;
    var questions = parseGdQuestions(config.prefix, config.pool + 10, config.ascending, textOnly);

    // Fallback: healthy quiz uses 'couple' prefix if 'healthy' has no questions
    if (questions.length === 0 && config.prefix === 'healthy') {
      questions = parseGdQuestions('couple', config.pool + 10, config.ascending, textOnly);
    }

    if (questions.length === 0) {
      // The data (gd-*.json) is likely still loading or a transient fetch
      // failed. Keep the "loading" placeholder visible and retry a few times
      // before showing the unavailable fallback - so slow connections and
      // crawlers never flash "quiz unavailable" on a page that is actually fine.
      // Premier échec : on recharge le fichier complet. Si le découpage par
      // préfixe avait laissé passer quelque chose, ce repli le rattrape et le
      // quiz se comporte exactement comme avant.
      if (!_repliComplet) {
        _repliComplet = true;
        QuizEngine.loadAllTranslations(lang, initFromData);
        return;
      }
      if (_dataAttempt < 3) {
        _dataAttempt++;
        setTimeout(function() { QuizEngine.loadAllTranslations(lang, initFromData); }, 700 * _dataAttempt);
        return;
      }
      showUnavailable(config);
      return;
    }

    // Randomly select totalQ questions from pool if pool > totalQ
    var hasRandomPool = questions.length > config.totalQ;
    if (config.stratifie) {
      // Tirage stratifie : les questions posees couvrent toutes les dimensions
      // du bareme, pour que deux parties du meme couple mesurent la meme chose.
      questions = QuizEngine.tirageStratifieTester(questions, config.totalQ);
    } else if (hasRandomPool) {
      questions = QuizEngine.shuffleArray(questions).slice(0, config.totalQ);
    } else {
      questions = QuizEngine.shuffleArray(questions);
    }

    switch (config.engine) {
      case 'solo':
        initSoloQuiz(config, questions);
        break;
      case 'duo-match':
        initDuoMatchQuiz(config, questions);
        break;
      case 'healthy':
        initHealthyQuiz(config, questions);
        break;
      case 'distance':
        initDistanceQuiz(config, questions);
        break;
      case 'coquin':
        initCoquinQuiz(config, questions);
        break;
      case 'knowledge':
        initKnowledgeQuiz(config, questions);
        break;
      case 'most':
        initMostQuiz(config, questions);
        break;
      case 'parentalite':
        initParentaliteQuiz(config, questions);
        break;
      case 'truefalse':
        initTruefalseQuiz(config, questions);
        break;
      case 'profile':
        initProfileQuiz(config, questions);
        break;
      case 'zamours':
        initZamoursQuiz(config, questions);
        break;
      case 'tentation':
        initTentationQuiz(config, questions);
        break;
      default:
        showUnavailable(config);
    }
  }
  QuizEngine.loadTranslations(lang, initFromData, prefixesNecessaires(config));

  // ─── Parse questions from gd.json ─────────────────────────
  // Handles multiple key patterns:
  // - Standard: prefix.q{N} with options prefix.q{N}a/b/c/d
  // - Numeric: prefix.{N} (most, knowledge, funny in non-FR)
  // - Alt options: prefix.q{N}o0/o1/o2/o3 (testerC, amoureux in non-FR)
  // - Uppercase options: prefix.q{N}A/B/C/D (coquinQ in non-FR)
  // tgd() handles prefix aliases automatically (couple→testerC, etc.)
  function parseGdQuestions(prefix, maxQ, ascending, textOnly) {
    var questions = [];
    var consecutiveMisses = 0;
    var maxMisses = textOnly ? 5 : 3;

    for (var i = 1; i <= (maxQ || 50); i++) {
      // Try q{N} key first, then numeric {N}
      var qText = QuizEngine.tgd(prefix + '.q' + i, null);
      if (!qText || qText === prefix + '.q' + i) {
        qText = QuizEngine.tgd(prefix + '.' + i, null);
      }
      if (!qText || qText === prefix + '.q' + i || qText === prefix + '.' + i) {
        consecutiveMisses++;
        if (questions.length > 0 && consecutiveMisses >= maxMisses) break;
        continue;
      }
      consecutiveMisses = 0;

      // Text-only quizzes (most, knowledge, funny) don't need per-question options
      if (textOnly) {
        questions.push({ id: i, text: qText, options: [] });
        continue;
      }

      var optLetters = ['a', 'b', 'c', 'd', 'e'];

      // Option discovery: prefer NATIVE options (no FR fallback) so a non-FR
      // quiz never inherits FR-only options it doesn't actually have (e.g. FR
      // distance has 4 options where non-FR natively has 3). But if a language
      // has NO native options for this question, fall back to FR-inclusive
      // lookup so fully-untranslated quizzes (e.g. non-FR common-points) still
      // render their options instead of disappearing.
      var findOptions = function(nativeOnly) {
        var opts = [];
        // Pattern 1: Standard a/b/c/d/e (FR format)
        for (var p1 = 0; p1 < optLetters.length; p1++) {
          var t1 = QuizEngine.tgd(prefix + '.q' + i + optLetters[p1], null, nativeOnly);
          if (t1 && t1 !== prefix + '.q' + i + optLetters[p1]) opts.push({ id: optLetters[p1], text: t1 });
        }
        // Pattern 2: o0/o1/o2/o3 (testerC, amoureux in non-FR)
        if (opts.length === 0) {
          for (var p2 = 0; p2 < 5; p2++) {
            var t2 = QuizEngine.tgd(prefix + '.q' + i + 'o' + p2, null, nativeOnly);
            if (t2 && t2 !== prefix + '.q' + i + 'o' + p2) opts.push({ id: optLetters[p2], text: t2 });
          }
        }
        // Pattern 3: Uppercase A/B/C/D (coquinQ in non-FR)
        if (opts.length === 0) {
          var upper = ['A', 'B', 'C', 'D', 'E'];
          for (var p3 = 0; p3 < upper.length; p3++) {
            var t3 = QuizEngine.tgd(prefix + '.q' + i + upper[p3], null, nativeOnly);
            if (t3 && t3 !== prefix + '.q' + i + upper[p3]) opts.push({ id: optLetters[p3], text: t3 });
          }
        }
        // Pattern 4: vocabulaire d'options partage (commonPoints q31+). La
        // question porte la liste des identifiants d'options, chaque libelle
        // vit une seule fois dans prefix.o_{id}. Sans ce pattern, ces
        // questions n'ont aucune option et sont silencieusement ecartees.
        if (opts.length === 0) {
          var ids = QuizEngine.tgd(prefix + '.q' + i + 'opts', null, nativeOnly);
          if (typeof ids === 'string' && ids && ids !== prefix + '.q' + i + 'opts') {
            var list = ids.split(',');
            for (var p4 = 0; p4 < list.length && p4 < optLetters.length; p4++) {
              var id = list[p4].trim();
              // Les libelles partages sont cherches sans nativeOnly : une
              // langue qui aurait oublie un libelle retombe sur le francais
              // plutot que de perdre l'option.
              var t4 = QuizEngine.tgd(prefix + '.o_' + id, null);
              if (t4 && t4 !== prefix + '.o_' + id) opts.push({ id: optLetters[p4], text: t4 });
            }
          }
        }
        return opts;
      };
      var options = findOptions(true);
      if (options.length === 0) options = findOptions(false);

      if (options.length > 0) {
        // Assign points based on scoring mode
        if (ascending) {
          for (var k = 0; k < options.length; k++) options[k].points = k;
        } else {
          var maxPts = options.length - 1;
          for (var k = 0; k < options.length; k++) options[k].points = maxPts - k;
        }
        questions.push({ id: i, text: qText, options: options });
      }
    }
    return questions;
  }

  // ─── Parse results from gd.json ───────────────────────────
  // maxScore: the real achievable max score (sum of max points per question)
  function parseGdResults(prefix, maxScore) {
    var results = [];
    // Try r{N}_t pattern (healthy, marriage, couple, distance, ado)
    for (var i = 1; i <= 10; i++) {
      var title = QuizEngine.tgd(prefix + '.r' + i + '_t', null);
      if (!title || title === prefix + '.r' + i + '_t') break;
      results.push({
        title: title,
        description: QuizEngine.tgd(prefix + '.r' + i + '_d', ''),
        advice: QuizEngine.tgd(prefix + '.r' + i + '_a', '')
      });
    }
    // Try v{N}_t pattern (divorce verdicts)
    if (results.length === 0) {
      for (var j = 1; j <= 10; j++) {
        var vTitle = QuizEngine.tgd(prefix + '.v' + j + '_t', null);
        if (!vTitle || vTitle === prefix + '.v' + j + '_t') break;
        results.push({
          title: vTitle,
          description: QuizEngine.tgd(prefix + '.v' + j + '_d', ''),
          advice: ''
        });
      }
    }
    // Try r{N}t pattern without underscore (non-FR results: r0t, r1t...)
    if (results.length === 0) {
      for (var k = 0; k <= 10; k++) {
        var rTitle = QuizEngine.tgd(prefix + '.r' + k + 't', null);
        if (!rTitle || rTitle === prefix + '.r' + k + 't') {
          if (k > 0) break;
          continue;
        }
        results.push({
          title: rTitle,
          description: QuizEngine.tgd(prefix + '.r' + k + 'd', ''),
          advice: QuizEngine.tgd(prefix + '.r' + k + 'a', '')
        });
      }
    }
    if (results.length === 0) return results;
    // Calculate score ranges based on real achievable max score
    var rangeSize = Math.ceil(maxScore / results.length);
    for (var r = 0; r < results.length; r++) {
      results[r].min = r * rangeSize;
      results[r].max = r === results.length - 1 ? maxScore : (r + 1) * rangeSize - 1;
    }
    return results;
  }

  // ─── Initializers ─────────────────────────────────────────

  // ── Barème pondéré des tests à points ───────────────────────────────────
  // Par défaut un test solo donne 0, 1, 2, 3 points selon le rang de la
  // réponse, ce qui met toutes ses questions sur le même pied. Sur un test de
  // gravité c'est faux : « il n'a pas répondu depuis trois heures » ne dit pas
  // la même chose de la dépendance que « depuis cette relation, vos projets
  // personnels ont disparu », et une tension diffuse qu'on n'explique pas ne
  // vaut pas la preuve d'un message à trois heures du matin.
  //
  // Chaque question porte donc un poids, et chaque réponse une valeur selon son
  // rang, du plus sain au pire. La valeur monte lentement puis fort : répondre
  // « parfois » partout ne doit pas suffire à déclencher un verdict alarmant.
  //   3 = fondamental   2 = structurant   1 = signal faible
  // Le maximum réel se recalcule plus bas à partir des points posés, donc les
  // paliers suivent le barème sans être écrits à la main. La table sert aussi
  // au test à distance, qui se joue à deux mais note chaque joueur de la même
  // façon.
  // Courbe de reference, pour une question a quatre reponses. Elle monte
  // lentement puis fort : repondre « parfois » partout ne doit pas suffire a
  // declencher un verdict alarmant.
  var SOLO_VALEURS = [0, 1, 3, 5];

  // Toutes les questions n'ont pas quatre reponses : le mariage en a trois sur
  // vingt-cinq, le divorce en a de deux a cinq. Lire la courbe par l'indice
  // ecrasait ces questions, une question a trois reponses plafonnant a trois
  // cinquiemes de son poids, et la cinquieme reponse d'une question a cinq
  // choix ne valant rien du tout. On interpole donc la courbe sur le nombre
  // reel de reponses : la premiere vaut toujours zero, la derniere toujours le
  // poids plein, et la forme reste la meme.
  function valeurAuRang(rang, nb) {
    if (nb <= 1) return SOLO_VALEURS[SOLO_VALEURS.length - 1];
    var t = (rang / (nb - 1)) * (SOLO_VALEURS.length - 1);
    var bas = Math.floor(t);
    if (bas >= SOLO_VALEURS.length - 1) return SOLO_VALEURS[SOLO_VALEURS.length - 1];
    return SOLO_VALEURS[bas] + (SOLO_VALEURS[bas + 1] - SOLO_VALEURS[bas]) * (t - bas);
  }

  var SOLO_BAREME = {
    // Confiance : consulter le telephone en cachette est un acte, imaginer
    // un voyage entre amis n'en est pas un.
    confiance: {
      1:  { d: 'reaction',     w: 2 },
      2:  { d: 'reaction',     w: 2 },
      3:  { d: 'verification', w: 3 },
      4:  { d: 'reaction',     w: 1 },
      5:  { d: 'fiabilite',    w: 2 },
      6:  { d: 'limites',      w: 2 },
      7:  { d: 'reaction',     w: 2 },
      8:  { d: 'reparation',   w: 3 },
      9:  { d: 'reassurance',  w: 3 },
      10: { d: 'reaction',     w: 1 },
      11: { d: 'intimite',     w: 3 },
      12: { d: 'reaction',     w: 2 },
      13: { d: 'hypothese',    w: 1 },
      14: { d: 'tolerance',    w: 2 },
      15: { d: 'transparence', w: 2 },
      16: { d: 'reparation',   w: 2 },
      17: { d: 'honnetete',    w: 3 },
      18: { d: 'conflit',      w: 2 },
      19: { d: 'hypothese',    w: 2 },
      20: { d: 'synthese',     w: 3 }
    },
    // Jalousie ressentie : ce qu'on imagine pese moins que ce qu'on va
    // verifier, telephone ou abonnements.
    jalousie1: {
      1:  { d: 'attente',      w: 2 },
      2:  { d: 'imagination',  w: 2 },
      3:  { d: 'imagination',  w: 1 },
      4:  { d: 'autonomie',    w: 2 },
      5:  { d: 'passe',        w: 1 },
      6:  { d: 'imagination',  w: 1 },
      7:  { d: 'attente',      w: 2 },
      8:  { d: 'imagination',  w: 2 },
      9:  { d: 'verification', w: 3 },
      10: { d: 'attente',      w: 2 },
      11: { d: 'soupcon',      w: 2 },
      12: { d: 'soupcon',      w: 2 },
      13: { d: 'imagination',  w: 1 },
      14: { d: 'passe',        w: 2 },
      15: { d: 'verification', w: 3 },
      16: { d: 'imagination',  w: 1 },
      17: { d: 'imagination',  w: 1 },
      18: { d: 'situation',    w: 2 },
      19: { d: 'imagination',  w: 2 },
      20: { d: 'synthese',     w: 3 }
    },
    // Jalousie subie : suivre la localisation, dicter la tenue ou interdire
    // des frequentations sont du controle, pas de l'inquietude.
    jalousie2: {
      1:  { d: 'reaction',     w: 2 },
      2:  { d: 'reaction',     w: 2 },
      3:  { d: 'autonomie',    w: 2 },
      4:  { d: 'controle',     w: 2 },
      5:  { d: 'reaction',     w: 2 },
      6:  { d: 'autonomie',    w: 2 },
      7:  { d: 'soupcon',      w: 1 },
      8:  { d: 'passe',        w: 2 },
      9:  { d: 'reaction',     w: 2 },
      10: { d: 'controle',     w: 2 },
      11: { d: 'reaction',     w: 2 },
      12: { d: 'surveillance', w: 3 },
      13: { d: 'controle',     w: 3 },
      14: { d: 'reaction',     w: 2 },
      15: { d: 'passe',        w: 1 },
      16: { d: 'situation',    w: 2 },
      17: { d: 'isolement',    w: 3 },
      18: { d: 'conflit',      w: 2 },
      19: { d: 'confiance',    w: 2 },
      20: { d: 'synthese',     w: 3 }
    },
    // Amour ou habitude : la raison de rester et ce qu'on ressent en imaginant
    // partir disent plus que les papillons du debut.
    habitude: {
      1:  { d: 'elan',       w: 2 },
      2:  { d: 'desir',      w: 2 },
      3:  { d: 'motif',      w: 3 },
      4:  { d: 'projection', w: 3 },
      5:  { d: 'projets',    w: 2 },
      6:  { d: 'effort',     w: 1 },
      7:  { d: 'echanges',   w: 2 },
      8:  { d: 'manque',     w: 2 },
      9:  { d: 'admiration', w: 2 },
      10: { d: 'tendresse',  w: 2 },
      11: { d: 'jalousie',   w: 2 },
      12: { d: 'motif',      w: 3 },
      13: { d: 'complicite', w: 2 },
      14: { d: 'projection', w: 2 },
      15: { d: 'confidence', w: 2 },
      16: { d: 'effort',     w: 1 },
      17: { d: 'elan',       w: 1 },
      18: { d: 'curiosite',  w: 2 },
      19: { d: 'ancrage',    w: 2 },
      20: { d: 'synthese',   w: 3 }
    },
    // Suis-je amoureux : voir ses defauts, se projeter et accepter que ce reste
    // amical sont les questions qui tranchent.
    suisjeamoureux: {
      1:  { d: 'pensee',       w: 2 },
      2:  { d: 'corps',        w: 2 },
      3:  { d: 'pensee',       w: 1 },
      4:  { d: 'absence',      w: 2 },
      5:  { d: 'partage',      w: 2 },
      6:  { d: 'lucidite',     w: 3 },
      7:  { d: 'exclusivite',  w: 3 },
      8:  { d: 'place',        w: 1 },
      9:  { d: 'partage',      w: 2 },
      10: { d: 'projection',   w: 3 },
      11: { d: 'entourage',    w: 1 },
      12: { d: 'apres',        w: 2 },
      13: { d: 'absence',      w: 2 },
      14: { d: 'attention',    w: 2 },
      15: { d: 'don',          w: 2 },
      16: { d: 'authenticite', w: 3 },
      17: { d: 'comparaison',  w: 1 },
      18: { d: 'memoire',      w: 1 },
      19: { d: 'exclusivite',  w: 3 },
      20: { d: 'aveu',         w: 3 }
    },
    // Divorce : la peur et les violences sont des questions de securite. Avoir
    // des enfants communs ou etre suivi par un professionnel decrit une
    // situation, pas une gravite, et pesait pourtant autant jusqu'ici.
    divorce: {
      1:  { d: 'doute',         w: 2 },
      2:  { d: 'projection',    w: 3 },
      3:  { d: 'tentatives',    w: 2 },
      4:  { d: 'climat',        w: 2 },
      5:  { d: 'securite',      w: 3 },
      6:  { d: 'securite',      w: 3 },
      7:  { d: 'complicite',    w: 2 },
      8:  { d: 'intimite',      w: 1 },
      9:  { d: 'respect',       w: 3 },
      10: { d: 'contexte',      w: 1 },
      11: { d: 'contexte',      w: 1 },
      12: { d: 'passe',         w: 1 },
      13: { d: 'projection',    w: 2 },
      14: { d: 'communication', w: 2 },
      15: { d: 'charge',        w: 2 },
      16: { d: 'ailleurs',      w: 2 },
      17: { d: 'etat',          w: 3 },
      18: { d: 'contexte',      w: 1 },
      19: { d: 'entourage',     w: 2 },
      20: { d: 'projets',       w: 2 },
      21: { d: 'liberte',       w: 3 },
      22: { d: 'depart',        w: 3 },
      23: { d: 'reciprocite',   w: 2 },
      24: { d: 'projection',    w: 2 },
      25: { d: 'decision',      w: 3 }
    },
    // Relation a distance : la place occupee la-bas et la fin annoncee de la
    // distance comptent plus que la qualite d'un appel.
    distanceAime: {
      1:  { d: 'echanges',      w: 2 },
      2:  { d: 'initiative',    w: 2 },
      3:  { d: 'echanges',      w: 2 },
      4:  { d: 'retrouvailles', w: 2 },
      5:  { d: 'place',         w: 3 },
      6:  { d: 'transparence',  w: 2 },
      7:  { d: 'attentions',    w: 2 },
      8:  { d: 'projet',        w: 3 },
      9:  { d: 'intimite',      w: 1 },
      10: { d: 'fiabilite',     w: 2 },
      11: { d: 'place',         w: 3 },
      12: { d: 'retrouvailles', w: 2 },
      13: { d: 'silences',      w: 2 },
      14: { d: 'projet',        w: 3 },
      15: { d: 'accroche',      w: 1 }
    },
    // A-t-il couche avec une autre : les depenses inexpliquees, les explications
    // qui ne tiennent pas et le retour du preservatif sont des faits.
    // L'intuition et un changement d'apparence n'en sont pas.
    coucheH: {
      1:  { d: 'habitudes',    w: 2 },
      2:  { d: 'secret',       w: 2 },
      3:  { d: 'intimite',     w: 2 },
      4:  { d: 'apparence',    w: 1 },
      5:  { d: 'entourage',    w: 2 },
      6:  { d: 'secret',       w: 1 },
      7:  { d: 'retournement', w: 3 },
      8:  { d: 'preuve',       w: 3 },
      9:  { d: 'preuve',       w: 3 },
      10: { d: 'entourage',    w: 2 },
      11: { d: 'compensation', w: 1 },
      12: { d: 'evitement',    w: 2 },
      13: { d: 'habitudes',    w: 3 },
      14: { d: 'preuve',       w: 3 },
      15: { d: 'ressenti',     w: 1 }
    },
    // Meme serie declinee au feminin : memes poids.
    coucheF: {
      1:  { d: 'habitudes',    w: 2 },
      2:  { d: 'secret',       w: 2 },
      3:  { d: 'intimite',     w: 2 },
      4:  { d: 'apparence',    w: 1 },
      5:  { d: 'entourage',    w: 2 },
      6:  { d: 'secret',       w: 1 },
      7:  { d: 'retournement', w: 3 },
      8:  { d: 'preuve',       w: 3 },
      9:  { d: 'preuve',       w: 3 },
      10: { d: 'entourage',    w: 2 },
      11: { d: 'compensation', w: 1 },
      12: { d: 'evitement',    w: 2 },
      13: { d: 'habitudes',    w: 3 },
      14: { d: 'preuve',       w: 3 },
      15: { d: 'ressenti',     w: 1 }
    },
    // M'aime-t-il en secret : la reaction quand on parle de quelqu'un d'autre et
    // la memoire des details valent mieux qu'un regard interprete.
    secretH: {
      1:  { d: 'regard',      w: 2 },
      2:  { d: 'attention',   w: 3 },
      3:  { d: 'initiative',  w: 2 },
      4:  { d: 'constance',   w: 2 },
      5:  { d: 'proximite',   w: 2 },
      6:  { d: 'echanges',    w: 2 },
      7:  { d: 'exclusivite', w: 3 },
      8:  { d: 'entourage',   w: 2 },
      9:  { d: 'confidence',  w: 2 },
      10: { d: 'accroche',    w: 1 }
    },
    // Meme serie declinee au feminin : memes poids.
    secretF: {
      1:  { d: 'regard',      w: 2 },
      2:  { d: 'attention',   w: 3 },
      3:  { d: 'initiative',  w: 2 },
      4:  { d: 'constance',   w: 2 },
      5:  { d: 'proximite',   w: 2 },
      6:  { d: 'echanges',    w: 2 },
      7:  { d: 'exclusivite', w: 3 },
      8:  { d: 'entourage',   w: 2 },
      9:  { d: 'confidence',  w: 2 },
      10: { d: 'accroche',    w: 1 }
    },
    // Mariage : vouloir des enfants, la fidelite et le lieu de vie sont des
    // sujets de rupture. Les standards de proprete n'en sont pas.
    marriage: {
      1:  { d: 'argent',     w: 2 },
      2:  { d: 'argent',     w: 2 },
      3:  { d: 'argent',     w: 1 },
      4:  { d: 'argent',     w: 2 },
      5:  { d: 'enfants',    w: 3 },
      6:  { d: 'enfants',    w: 2 },
      7:  { d: 'enfants',    w: 3 },
      8:  { d: 'famille',    w: 1 },
      9:  { d: 'quotidien',  w: 1 },
      10: { d: 'quotidien',  w: 1 },
      11: { d: 'quotidien',  w: 2 },
      12: { d: 'valeurs',    w: 2 },
      13: { d: 'valeurs',    w: 3 },
      14: { d: 'valeurs',    w: 1 },
      15: { d: 'social',     w: 1 },
      16: { d: 'social',     w: 2 },
      17: { d: 'autonomie',  w: 2 },
      18: { d: 'intimite',   w: 2 },
      19: { d: 'fidelite',   w: 3 },
      20: { d: 'intimite',   w: 2 },
      21: { d: 'lieu',       w: 3 },
      22: { d: 'carriere',   w: 2 },
      23: { d: 'lieu',       w: 2 },
      24: { d: 'projets',    w: 2 },
      25: { d: 'conflit',    w: 3 },
      26: { d: 'conflit',    w: 2 },
      27: { d: 'reparation', w: 2 },
      28: { d: 'besoins',    w: 2 },
      29: { d: 'aide',       w: 1 },
      30: { d: 'synthese',   w: 3 }
    },
    // Dépendance affective : le cœur du test est la place que la relation prend
    // dans l'identité et la vie de la personne, pas ses réactions ponctuelles.
    dependance: {
      1:  { d: 'absence',    w: 2 },  2:  { d: 'autonomie',  w: 2 },
      3:  { d: 'identite',   w: 3 },  4:  { d: 'affirmation',w: 2 },
      5:  { d: 'reassurance',w: 2 },  6:  { d: 'isolement',  w: 3 },
      7:  { d: 'controle',   w: 1 },  8:  { d: 'affirmation',w: 2 },
      9:  { d: 'identite',   w: 3 },  10: { d: 'abandon',    w: 3 },
      11: { d: 'autonomie',  w: 1 },  12: { d: 'emotions',   w: 2 },
      13: { d: 'absence',    w: 2 },  14: { d: 'isolement',  w: 3 },
      15: { d: 'identite',   w: 2 },  16: { d: 'estime',     w: 3 },
      17: { d: 'abandon',    w: 2 },  18: { d: 'protestation',w: 3 },
      19: { d: 'affirmation',w: 3 },  20: { d: 'absence',    w: 2 }
    },
    // Pervers narcissique : les signaux qui distinguent vraiment ce profil sont
    // le retournement, la double façade et le déni face à la preuve.
    pervers: {
      1:  { d: 'cycle',      w: 2 },  2:  { d: 'humiliation',w: 3 },
      3:  { d: 'retournement',w: 3 }, 4:  { d: 'isolement',  w: 3 },
      5:  { d: 'empathie',   w: 3 },  6:  { d: 'asymetrie',  w: 2 },
      7:  { d: 'controle',   w: 3 },  8:  { d: 'facade',     w: 3 },
      9:  { d: 'punition',   w: 2 },  10: { d: 'climat',     w: 3 },
      11: { d: 'retournement',w: 3 }, 12: { d: 'sabotage',   w: 2 },
      13: { d: 'emprise',    w: 3 },  14: { d: 'triangulation',w: 2 },
      15: { d: 'cycle',      w: 2 },  16: { d: 'cycle',      w: 2 },
      17: { d: 'estime',     w: 3 },  18: { d: 'asymetrie',  w: 2 },
      19: { d: 'entourage',  w: 2 },  20: { d: 'emprise',    w: 3 }
    },
    // Couple toxique : ce qui pèse, c'est la peur, l'invalidation et l'atteinte
    // à l'estime, pas les frictions ordinaires d'une vie à deux.
    toxic: {
      1:  { d: 'asymetrie',  w: 2 },  2:  { d: 'peur',       w: 3 },
      3:  { d: 'autocensure',w: 2 },  4:  { d: 'equilibre',  w: 2 },
      5:  { d: 'cruaute',    w: 3 },  6:  { d: 'asymetrie',  w: 2 },
      7:  { d: 'charge',     w: 2 },  8:  { d: 'invalidation',w: 3 },
      9:  { d: 'asymetrie',  w: 2 },  10: { d: 'culpabilite',w: 3 },
      11: { d: 'conflit',    w: 2 },  12: { d: 'invalidation',w: 3 },
      13: { d: 'punition',   w: 3 },  14: { d: 'besoins',    w: 2 },
      15: { d: 'reparation', w: 2 },  16: { d: 'estime',     w: 3 },
      17: { d: 'estime',     w: 2 },  18: { d: 'peur',       w: 3 },
      19: { d: 'isolement',  w: 3 },  20: { d: 'projection', w: 2 },
      21: { d: 'peur',       w: 3 },  22: { d: 'cycle',      w: 2 },
      23: { d: 'emprise',    w: 3 },  24: { d: 'emprise',    w: 3 },
      25: { d: 'miroir',     w: 2 }
    },
    // Infidélité : un test qui annonce une tromperie doit s'appuyer sur des
    // faits observables. Les ressentis sans preuve gardent le poids le plus
    // faible, sinon l'angoisse seule suffit à faire monter le score.
    infidelite: {
      1:  { d: 'secret',     w: 2 },  2:  { d: 'habitudes',  w: 2 },
      3:  { d: 'intimite',   w: 2 },  4:  { d: 'entourage',  w: 1 },
      5:  { d: 'apparence',  w: 1 },  6:  { d: 'evitement',  w: 2 },
      7:  { d: 'ressenti',   w: 1 },  8:  { d: 'preuve',     w: 3 },
      9:  { d: 'evitement',  w: 2 },  10: { d: 'comparaison',w: 1 },
      11: { d: 'preuve',     w: 3 },  12: { d: 'evitement',  w: 2 },
      13: { d: 'entourage',  w: 2 },  14: { d: 'secret',     w: 1 },
      15: { d: 'intimite',   w: 2 },  16: { d: 'preuve',     w: 3 },
      17: { d: 'evitement',  w: 2 },  18: { d: 'habitudes',  w: 2 },
      19: { d: 'ressenti',   w: 1 },  20: { d: 'transparence',w: 3 }
    },
    // Distance : cent questions pour vingt posées, et elles ne pèsent pas
    // pareil. Savoir quand la distance s'arrête, se faire confiance quand
    // l'autre sort, avoir un rythme de communication qui convient aux deux :
    // c'est là-dessus qu'une relation à distance tient ou lâche. Partager une
    // playlist ou manger en visio fait du bien, mais ne dit rien de sa
    // solidité. Les neuf dimensions servent aussi au tirage, pour qu'une
    // partie ne se résume pas aux questions sur les visites.
    distance: {
      1:  { d: 'communication', w: 3 },  2:  { d: 'visites',       w: 2 },
      3:  { d: 'confiance',     w: 3 },  4:  { d: 'projet',        w: 3 },
      5:  { d: 'visites',       w: 2 },  6:  { d: 'communication', w: 2 },
      7:  { d: 'complicite',    w: 1 },  8:  { d: 'moral',         w: 2 },
      9:  { d: 'entourage',     w: 1 },  10: { d: 'projet',        w: 3 },
      11: { d: 'communication', w: 3 },  12: { d: 'communication', w: 2 },
      13: { d: 'confiance',     w: 2 },  14: { d: 'complicite',    w: 1 },
      15: { d: 'moral',         w: 3 },  16: { d: 'quotidien',     w: 2 },
      17: { d: 'projet',        w: 3 },  18: { d: 'bilan',         w: 1 },
      19: { d: 'bilan',         w: 1 },  20: { d: 'bilan',         w: 3 },
      21: { d: 'communication', w: 2 },  22: { d: 'complicite',    w: 1 },
      23: { d: 'confiance',     w: 2 },  24: { d: 'entourage',     w: 1 },
      25: { d: 'complicite',    w: 2 },  26: { d: 'communication', w: 1 },
      27: { d: 'communication', w: 1 },  28: { d: 'communication', w: 1 },
      29: { d: 'communication', w: 3 },  30: { d: 'communication', w: 3 },
      31: { d: 'visites',       w: 3 },  32: { d: 'visites',       w: 2 },
      33: { d: 'visites',       w: 2 },  34: { d: 'visites',       w: 1 },
      35: { d: 'visites',       w: 1 },  36: { d: 'visites',       w: 1 },
      37: { d: 'visites',       w: 1 },  38: { d: 'visites',       w: 1 },
      39: { d: 'visites',       w: 2 },  40: { d: 'visites',       w: 2 },
      41: { d: 'confiance',     w: 3 },  42: { d: 'confiance',     w: 3 },
      43: { d: 'confiance',     w: 2 },  44: { d: 'confiance',     w: 2 },
      45: { d: 'confiance',     w: 3 },  46: { d: 'confiance',     w: 3 },
      47: { d: 'confiance',     w: 2 },  48: { d: 'moral',         w: 3 },
      49: { d: 'confiance',     w: 2 },  50: { d: 'communication', w: 3 },
      51: { d: 'projet',        w: 3 },  52: { d: 'projet',        w: 3 },
      53: { d: 'projet',        w: 3 },  54: { d: 'projet',        w: 2 },
      55: { d: 'projet',        w: 2 },  56: { d: 'entourage',     w: 1 },
      57: { d: 'projet',        w: 3 },  58: { d: 'projet',        w: 2 },
      59: { d: 'projet',        w: 2 },  60: { d: 'projet',        w: 3 },
      61: { d: 'quotidien',     w: 2 },  62: { d: 'quotidien',     w: 2 },
      63: { d: 'quotidien',     w: 1 },  64: { d: 'complicite',    w: 1 },
      65: { d: 'complicite',    w: 2 },  66: { d: 'complicite',    w: 2 },
      67: { d: 'complicite',    w: 1 },  68: { d: 'complicite',    w: 1 },
      69: { d: 'complicite',    w: 1 },  70: { d: 'complicite',    w: 1 },
      71: { d: 'moral',         w: 1 },  72: { d: 'communication', w: 2 },
      73: { d: 'moral',         w: 3 },  74: { d: 'moral',         w: 1 },
      75: { d: 'moral',         w: 2 },  76: { d: 'moral',         w: 2 },
      77: { d: 'entourage',     w: 1 },  78: { d: 'complicite',    w: 2 },
      79: { d: 'moral',         w: 3 },  80: { d: 'moral',         w: 2 },
      81: { d: 'complicite',    w: 2 },  82: { d: 'complicite',    w: 2 },
      83: { d: 'visites',       w: 1 },  84: { d: 'moral',         w: 2 },
      85: { d: 'moral',         w: 2 },  86: { d: 'entourage',     w: 2 },
      87: { d: 'entourage',     w: 2 },  88: { d: 'entourage',     w: 1 },
      89: { d: 'entourage',     w: 2 },  90: { d: 'moral',         w: 3 },
      91: { d: 'quotidien',     w: 2 },  92: { d: 'quotidien',     w: 2 },
      93: { d: 'quotidien',     w: 3 },  94: { d: 'quotidien',     w: 2 },
      95: { d: 'quotidien',     w: 1 },  96: { d: 'bilan',         w: 2 },
      97: { d: 'bilan',         w: 2 },  98: { d: 'bilan',         w: 1 },
      99: { d: 'bilan',         w: 1 },  100:{ d: 'bilan',         w: 3 }
    }
  };

  // Pose les points de chaque réponse à partir du poids de sa question.
  // Renvoie false si le test n'a pas de table : le barème par rang reste alors
  // en place, exactement comme avant.
  function appliqueBaremePondere(prefix, questions, ascendant) {
    var table = SOLO_BAREME[prefix];
    if (!table) return false;
    for (var i = 0; i < questions.length; i++) {
      var q = questions[i];
      var fiche = table[q.id];
      var poids = fiche && fiche.w ? fiche.w : 1;
      var n = q.options.length;
      for (var j = 0; j < n; j++) {
        // Les options sont rangées de la plus saine à la pire dans un test
        // ascendant, l'inverse sinon.
        var rang = ascendant ? j : (n - 1 - j);
        q.options[j].points = Math.round(poids * valeurAuRang(rang, n));
      }
    }
    return true;
  }

  // Pose le barème pondéré sur les questions, puis, si le test pioche dans un
  // pool plus grand que ce qu'il pose, refait le tirage en couvrant toutes les
  // dimensions du barème. Sans ça deux parties du même test ne mesurent pas la
  // même chose : l'une peut tomber sur dix questions de visites, l'autre sur
  // dix questions de projet. Le tirage aléatoire pur a déjà eu lieu plus haut,
  // on repart donc du pool complet pour le refaire proprement.
  // Partagé par le moteur solo et le test à distance : même table, même courbe.
  function questionsPonderees(cfg, questions) {
    appliqueBaremePondere(cfg.prefix, questions, !!cfg.ascending);
    if (SOLO_BAREME[cfg.prefix] && cfg.pool > cfg.totalQ && QuizEngine.tirageStratifie) {
      var complet = parseGdQuestions(cfg.prefix, cfg.pool + 10, cfg.ascending);
      if (complet.length > cfg.totalQ) {
        appliqueBaremePondere(cfg.prefix, complet, !!cfg.ascending);
        return QuizEngine.tirageStratifie(complet, SOLO_BAREME[cfg.prefix], cfg.totalQ);
      }
    }
    return questions;
  }

  function initSoloQuiz(cfg, questions) {
    // Barème explicite : par défaut un test solo donne 0, 1, 2, 3 points selon
    // le rang de la réponse, ce qui met toutes les questions sur le même pied.
    // Un test dont les questions n'ont pas la même gravité déclare
    // ptsExplicites et range ses points dans gd.json, comme la parentalité :
    // prefix.q{N}{lettre}_pts. Le maximum réel se recalcule tout seul en
    // dessous, donc les paliers suivent le barème sans être écrits à la main.
    if (cfg.ptsExplicites) appliquePointsExplicites(cfg.prefix, questions);
    else questions = questionsPonderees(cfg, questions);

    // Calculate real achievable max score (sum of max points per question)
    var realMaxScore = 0;
    for (var i = 0; i < questions.length; i++) {
      var qMax = 0;
      for (var j = 0; j < questions[i].options.length; j++) {
        if (questions[i].options[j].points > qMax) qMax = questions[i].options[j].points;
      }
      realMaxScore += qMax;
    }
    var resultPrefix = cfg.resultPrefix || cfg.prefix;
    var results = parseGdResults(resultPrefix, realMaxScore);
    new QuizEngine.SoloTest({
      container: container,
      questions: questions,
      results: results,
      prefix: cfg.prefix,
      lang: lang,
      quizType: cfg.quizType || 'solo',
      hasSkip: cfg.hasSkip || false,
      hasLocalStorage: cfg.hasLocalStorage || false,
      needsName: cfg.needsName || false
    });
  }

  function initDuoMatchQuiz(cfg, questions) {
    var total = questions.length;
    var results = cfg.resultSet === 'compat' ? buildCompatResults(total) : buildDuoResults(total);
    new QuizEngine.DuoMatchQuiz({
      container: container,
      questions: questions,
      results: results,
      prefix: cfg.prefix,
      lang: lang,
      needsGender: cfg.needsGender || false,
      useScoring: cfg.useScoring || false,
      modeSolo: cfg.modeSolo || false
    });
  }

  function initHealthyQuiz(cfg, questions) {
    // In non-FR languages, 'healthy' prefix has full questions with options.
    // In FR, 'healthy' only has results, questions come from 'couple' prefix.
    var healthyQuestions = parseGdQuestions('healthy', 100);
    var usedHealthyNative = healthyQuestions.length > 0;
    if (!usedHealthyNative) {
      // Fallback: try 'couple' prefix (FR behavior)
      healthyQuestions = parseGdQuestions('couple', 30);
    }

    // Tirage stratifie : les 20 questions couvrent toutes les dimensions du
    // barème au lieu d'être tirées au hasard, pour que deux parties du même
    // couple mesurent la même chose.
    healthyQuestions = QuizEngine.tirageStratifieSain(
      healthyQuestions,
      usedHealthyNative ? 'healthy' : 'couple',
      cfg.totalQ
    );

    if (healthyQuestions.length === 0) {
      showUnavailable(cfg);
      return;
    }

    // Parse results from healthy prefix
    var results = [];
    for (var i = 1; i <= 10; i++) {
      var title = QuizEngine.tgd('healthy.r' + i + '_t', null);
      if (!title || title === 'healthy.r' + i + '_t') break;
      results.push({
        title: title,
        description: QuizEngine.tgd('healthy.r' + i + '_d', ''),
        advice: QuizEngine.tgd('healthy.r' + i + '_a', '')
      });
    }
    // Les bornes de palier ne sont plus calculées ici : le moteur classe le
    // résultat sur le pourcentage pondéré (HEALTHY_PALIERS), ce qui reste juste
    // quel que soit le nombre de questions tirées et leur poids.

    // Determine the prefix used for question text lookup at render time.
    // Native 'healthy' questions (non-FR) are authored a=least→d=healthiest, so
    // their weighting is reversed vs the 'couple' questions used as FR fallback.
    var usedPrefix = usedHealthyNative ? 'healthy' : 'couple';

    new QuizEngine.HealthyQuiz({
      container: container,
      questions: healthyQuestions,
      results: results,
      prefix: usedPrefix,
      lang: lang,
      reverseScore: usedHealthyNative
    });
  }

  function initDistanceQuiz(cfg, questions) {
    // Le maximum du test se recalcule dans le moteur à partir des points posés
    // ici, donc les paliers du verdict suivent le barème sans être réécrits.
    new QuizEngine.DistanceQuiz({
      container: container,
      questions: questionsPonderees(cfg, questions),
      prefix: cfg.prefix,
      lang: lang
    });
  }

  function initZamoursQuiz(cfg, questions) {
    // Pass the FULL question bank so the engine draws a fresh random subset
    // every game (and on "other questions"), not just the pre-sliced set.
    var pool = parseGdQuestions(cfg.prefix, (cfg.pool || 60) + 10);
    if (!pool || pool.length === 0) pool = questions;
    new QuizEngine.ZamoursQuiz({
      container: container,
      questions: pool,
      prefix: cfg.prefix,
      lang: lang,
      perGame: cfg.totalQ || 14
    });
  }

  function initTentationQuiz(cfg, questions) {
    // Hand over the FULL bank so each "stay" on the island draws a fresh set
    // of 12 situations out of the 30 available.
    var pool = parseGdQuestions(cfg.prefix, (cfg.pool || 30) + 10, cfg.ascending);
    if (!pool || pool.length === 0) pool = questions;
    // Tier ranges are computed on one stay (days x max points per situation),
    // not on the whole bank, so the verdict matches the score actually shown.
    var days = Math.min(cfg.totalQ || 12, pool.length);
    var perDayMax = 0;
    for (var i = 0; i < pool.length; i++) {
      var best = 0;
      for (var j = 0; j < pool[i].options.length; j++) {
        if ((pool[i].options[j].points || 0) > best) best = pool[i].options[j].points || 0;
      }
      if (best > perDayMax) perDayMax = best;
    }
    var results = parseGdResults(cfg.prefix, days * perDayMax);
    new QuizEngine.TentationQuiz({
      container: container,
      questions: pool,
      results: results,
      prefix: cfg.prefix,
      lang: lang,
      days: days
    });
  }

  function initCoquinQuiz(cfg, questions) {
    new QuizEngine.CoquinQuiz({
      container: container,
      questions: questions,
      prefix: cfg.prefix,
      lang: lang
    });
  }

  function initKnowledgeQuiz(cfg, questions) {
    new QuizEngine.KnowledgeQuiz({
      container: container,
      questions: questions,
      prefix: cfg.prefix,
      lang: lang
    });
  }

  function initMostQuiz(cfg, questions) {
    new QuizEngine.MostQuiz({
      container: container,
      questions: questions,
      prefix: cfg.prefix,
      lang: lang
    });
  }

  // Chaque réponse porte son propre nombre de points, rangé dans gd.json sous
  // prefix.q{N}{lettre}_pts. Une clé absente laisse le point calculé par
  // défaut : une question sans barème explicite reste jouable.
  function appliquePointsExplicites(prefix, questions) {
    for (var i = 0; i < questions.length; i++) {
      var q = questions[i];
      for (var j = 0; j < q.options.length; j++) {
        var ptsKey = prefix + '.q' + q.id + q.options[j].id + '_pts';
        var pts = QuizEngine.tgd(ptsKey, null);
        if (pts !== null && pts !== ptsKey) {
          q.options[j].points = parseInt(pts, 10) || 0;
        }
      }
    }
  }

  function initParentaliteQuiz(cfg, questions) {
    // Parentalite quiz: each answer has explicit point values stored in gd.json
    // Format: parentalite.q{N}a_pts, parentalite.q{N}b_pts etc.
    appliquePointsExplicites(cfg.prefix, questions);

    // Parse results from gd.json
    var results = [];
    for (var r = 1; r <= 10; r++) {
      var title = QuizEngine.tgd(cfg.prefix + '.r' + r + '_t', null);
      if (!title || title === cfg.prefix + '.r' + r + '_t') break;
      results.push({
        title: title,
        description: QuizEngine.tgd(cfg.prefix + '.r' + r + '_d', ''),
        advice: QuizEngine.tgd(cfg.prefix + '.r' + r + '_a', '')
      });
    }

    // Fixed score ranges for parentalite (out of 60 per player):
    // r1: 0-19, r2: 20-34, r3: 35-47, r4: 48-60
    if (results.length === 4) {
      results[0].min = 0;  results[0].max = 19;
      results[1].min = 20; results[1].max = 34;
      results[2].min = 35; results[2].max = 47;
      results[3].min = 48; results[3].max = 60;
    }

    new QuizEngine.ParentaliteQuiz({
      container: container,
      questions: questions,
      results: results,
      prefix: cfg.prefix,
      lang: lang
    });
  }

  function initTruefalseQuiz(cfg, questions) {
    // Parse true/false questions: each has q{N}, q{N}answer (true/false), q{N}exp
    var tfQuestions = [];
    for (var i = 0; i < questions.length; i++) {
      var q = questions[i];
      var answer = QuizEngine.tgd(cfg.prefix + '.q' + q.id + 'answer', null);
      if (!answer || (answer !== 'true' && answer !== 'false')) continue;
      tfQuestions.push({ id: q.id, text: q.text, answer: answer });
    }
    if (tfQuestions.length === 0) {
      showUnavailable(cfg);
      return;
    }
    // Build score-based results
    var total = tfQuestions.length;
    var results = parseGdResults(cfg.prefix, total);
    if (results.length === 0) {
      // Default 4-tier results
      var q1 = Math.ceil(total * 0.25);
      var q2 = Math.ceil(total * 0.50);
      var q3 = Math.ceil(total * 0.75);
      results = [
        { min: 0, max: q1 - 1, title: QuizEngine.tgd(cfg.prefix + '.r1_t', 'Novice'), description: QuizEngine.tgd(cfg.prefix + '.r1_d', ''), advice: QuizEngine.tgd(cfg.prefix + '.r1_a', '') },
        { min: q1, max: q2 - 1, title: QuizEngine.tgd(cfg.prefix + '.r2_t', 'En bonne voie'), description: QuizEngine.tgd(cfg.prefix + '.r2_d', ''), advice: QuizEngine.tgd(cfg.prefix + '.r2_a', '') },
        { min: q2, max: q3 - 1, title: QuizEngine.tgd(cfg.prefix + '.r3_t', 'Expert'), description: QuizEngine.tgd(cfg.prefix + '.r3_d', ''), advice: QuizEngine.tgd(cfg.prefix + '.r3_a', '') },
        { min: q3, max: total, title: QuizEngine.tgd(cfg.prefix + '.r4_t', 'Maître'), description: QuizEngine.tgd(cfg.prefix + '.r4_d', ''), advice: QuizEngine.tgd(cfg.prefix + '.r4_a', '') }
      ];
    }
    new QuizEngine.TruefalseQuiz({
      container: container,
      questions: tfQuestions,
      results: results,
      prefix: cfg.prefix,
      lang: lang
    });
  }


  function initPartyGame(cfg) {
    new QuizEngine.PartyGame({
      container: container,
      prefix: cfg.prefix,
      lang: lang,
      series: cfg.series || ['classique']
    });
  }

  // Typologies du moteur ProfileQuiz : chaque option est rattachée à un axe,
  // l'axe dominant désigne le profil. L'attachement reste la typologie par
  // défaut ; le test karmique classe le lien plutôt que le style.
  var TYPOLOGIES = {
    attachement: {
      icone: '🔗',
      axes: [
        { id: 'secure', color: '#22c55e', defaut: 'Sécure' },
        { id: 'anxious', color: '#f59e0b', defaut: 'Anxieux' },
        { id: 'avoidant', color: '#6366f1', defaut: 'Évitant' }
      ],
      profils: ['secure', 'anxious', 'avoidant', 'disorganized']
    },
    karmique: {
      icone: '🔮',
      axes: [
        { id: 'apaise', color: '#22c55e', defaut: 'Lien apaisé' },
        { id: 'miroir', color: '#8b5cf6', defaut: 'Lien miroir' },
        { id: 'karmique', color: '#f43f5e', defaut: 'Lien karmique' }
      ],
      profils: ['apaise', 'echos', 'karmique', 'miroir'],
      // Le karmique prime dès qu'il domine nettement : c'est la répétition et
      // le coût de la relation, pas son intensité, qui font le lien karmique.
      // Le miroir ne l'emporte que s'il est fort ET plus présent que lui.
      classify: function(t, n) {
        var seuil = function(p) { return Math.ceil(n * p); };
        if (t.karmique >= seuil(0.45)) return 'karmique';
        if (t.miroir >= seuil(0.40) && t.miroir > t.karmique && t.miroir >= t.apaise) return 'miroir';
        if (t.apaise >= seuil(0.50) && t.karmique < seuil(0.25)) return 'apaise';
        if (t.karmique >= seuil(0.25)) return 'echos';
        return 'apaise';
      }
    },
    // Les cinq langages de Gary Chapman. Pas de profil composite ici : le
    // langage le plus choisi est le résultat, les cinq barres montrent le
    // reste du profil.
    langageAmour: {
      icone: '💕',
      axes: [
        { id: 'words', color: '#6366f1', defaut: 'Paroles valorisantes' },
        { id: 'acts',  color: '#10b981', defaut: 'Services rendus' },
        { id: 'gifts', color: '#f59e0b', defaut: 'Cadeaux' },
        { id: 'time',  color: '#3b82f6', defaut: 'Moments de qualité' },
        { id: 'touch', color: '#ec4899', defaut: 'Toucher physique' }
      ],
      profils: ['words', 'acts', 'gifts', 'time', 'touch'],
      // Les textes de résultat de ce test sont rangés sous r_<clé>_… et non
      // sous pf_<clé>_… comme les deux typologies précédentes.
      cleProfil: 'r_',
      classify: function(t) {
        var ordre = ['words', 'acts', 'gifts', 'time', 'touch'];
        var tete = ordre[0];
        for (var i = 1; i < ordre.length; i++) {
          if ((t[ordre[i]] || 0) > (t[tete] || 0)) tete = ordre[i];
        }
        return tete;
      }
    }
  };

  function initProfileQuiz(cfg, questions) {
    var typo = TYPOLOGIES[cfg.typologie] || TYPOLOGIES.attachement;
    var cp = typo.cleProfil || 'pf_';
    function prof(key) {
      return {
        title: QuizEngine.tgd(cfg.prefix + '.' + cp + key + '_t', ''),
        description: QuizEngine.tgd(cfg.prefix + '.' + cp + key + '_d', ''),
        advice: QuizEngine.tgd(cfg.prefix + '.' + cp + key + '_a', '')
      };
    }
    var profiles = {}, axisLabels = {}, axes = [];
    for (var p = 0; p < typo.profils.length; p++) profiles[typo.profils[p]] = prof(typo.profils[p]);
    for (var a = 0; a < typo.axes.length; a++) {
      var ax = typo.axes[a];
      axes.push({ id: ax.id, color: ax.color });
      axisLabels[ax.id] = QuizEngine.tgd(cfg.prefix + '.pf_axis_' + ax.id, ax.defaut);
    }
    var opts = {
      container: container,
      questions: questions,
      prefix: cfg.prefix,
      lang: lang,
      labels: { icon: typo.icone },
      categoryMap: cfg.categoryMap,
      profiles: profiles,
      axes: axes,
      axisLabels: axisLabels
    };
    if (typo.classify) opts.classify = typo.classify;
    // Intitulés propres au quiz, sinon ceux du test d'attachement.
    var intro = QuizEngine.tgd(cfg.prefix + '.introTitle', '');
    var etiquette = QuizEngine.tgd(cfg.prefix + '.linkLabel', '');
    if (intro && intro !== cfg.prefix + '.introTitle') opts.introTitle = intro;
    if (etiquette && etiquette !== cfg.prefix + '.linkLabel') opts.resultLabel = etiquette;
    new QuizEngine.ProfileQuiz(opts);
  }

  // ─── Helpers ──────────────────────────────────────────────

  function buildDuoResults(total) {
    var third = Math.ceil(total / 3);
    return [
      { minScore: 0, maxScore: third - 1, min: 0, max: third - 1,
        title: QuizEngine.tg('result.low', 'Vous avez des choses à découvrir !'),
        description: QuizEngine.tg('result.lowDesc', 'Vous avez encore beaucoup à apprendre sur vos goûts respectifs.') },
      { minScore: third, maxScore: third * 2 - 1, min: third, max: third * 2 - 1,
        title: QuizEngine.tg('result.medium', 'Bonne compatibilité !'),
        description: QuizEngine.tg('result.mediumDesc', 'Vous vous connaissez plutôt bien, avec quelques surprises.') },
      { minScore: third * 2, maxScore: total, min: third * 2, max: total,
        title: QuizEngine.tg('result.high', 'Incroyable connexion !'),
        description: QuizEngine.tg('result.highDesc', 'Vous êtes sur la même longueur d\'onde !') }
    ];
  }

  // Verdicts du test de compatibilite amoureuse. Les paliers generiques de
  // buildDuoResults sont ecrits pour un quiz de gouts ("vos gouts se
  // ressemblent") et decoupent le score en tiers, alors que la page annonce
  // sa propre grille de lecture en pourcentage (80+, 60-79, 40-59, <40).
  // On construit donc les bornes directement depuis cette grille pour que le
  // verdict affiche corresponde a ce que la page explique juste en dessous.
  function buildCompatResults(total) {
    var at = function(pct) { return Math.ceil(total * pct / 100); };
    var b40 = at(40), b60 = at(60), b80 = at(80);
    var fb = [
      'Des chemins différents', 'Une compatibilité à cultiver',
      'Une belle compatibilité', 'Âmes sœurs'
    ];
    function tier(n, min, max) {
      return {
        minScore: min, maxScore: max, min: min, max: max,
        title: QuizEngine.tg('result.compat.t' + n, fb[n - 1]),
        description: QuizEngine.tg('result.compat.t' + n + 'd', '')
      };
    }
    return [
      tier(1, 0, b40 - 1),
      tier(2, b40, b60 - 1),
      tier(3, b60, b80 - 1),
      tier(4, b80, total)
    ];
  }

  function showUnavailable(cfg) {
    container.innerHTML = '';
    // Reached only after several failed data-load retries: present it as a
    // temporary loading hiccup with a retry action, never as unfinished content.
    var M = {
      fr: { t: 'Le contenu met du temps à charger', p: 'Vérifiez votre connexion internet, puis réessayez.', b: 'Réessayer' },
      en: { t: 'This is taking a while to load', p: 'Please check your connection and try again.', b: 'Retry' },
      es: { t: 'La carga está tardando', p: 'Comprueba tu conexión e inténtalo de nuevo.', b: 'Reintentar' },
      de: { t: 'Das Laden dauert etwas länger', p: 'Bitte prüfe deine Verbindung und versuche es erneut.', b: 'Erneut versuchen' },
      it: { t: 'Il caricamento sta impiegando un po\'', p: 'Controlla la connessione e riprova.', b: 'Riprova' }
    };
    var m = M[lang] || M.fr;
    var wrap = QuizEngine.el('div', 'quiz-engine animate-fade-in text-center');
    wrap.innerHTML = '<h2 class="text-2xl font-bold mb-4">' + QuizEngine.esc(m.t) + '</h2>' +
      '<p class="text-muted-foreground mb-6">' + QuizEngine.esc(m.p) + '</p>' +
      '<button type="button" class="btn btn-primary" onclick="location.reload()">' + QuizEngine.esc(m.b) + '</button>';
    container.appendChild(wrap);
  }
})();
