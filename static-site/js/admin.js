/**
 * Admin Dashboard - mesure (trafic, parties, à distance), avis, leads, messagerie, réseaux
 */
(function () {
  'use strict';

  var SUPABASE_URL, SUPABASE_KEY;
  var adminToken = null;
  var allReviews = [];
  var currentFilter = 'all';

  var currentTab = 'trafic';
  var allLeads = [];
  var allMessages = [];
  var currentMessageFilter = 'all';

  function esc(s) { return s ? String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') : ''; }

  function starsHtml(rating) {
    var html = '';
    for (var i = 1; i <= 5; i++) {
      html += '<svg viewBox="0 0 24 24" class="w-4 h-4 ' + (i <= rating ? 'star-filled' : 'star-empty') + '"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
    }
    return html;
  }

  function formatDate(dateStr) {
    if (!dateStr) return '-';
    var d = new Date(dateStr);
    var months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear() + ' à ' + d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
  }

  // ── Auth ──
  function checkAuth() {
    var token = sessionStorage.getItem('admin-token');
    var expiry = sessionStorage.getItem('admin-token-expiry');
    if (token && expiry && Date.now() < parseInt(expiry)) {
      adminToken = token;
      showDashboard();
      loadReviews();
      loadActivityCount();
    }
  }

  function loadActivityCount() {
    fetch(SUPABASE_URL + '/rest/v1/activity_validations?select=id&limit=0', {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Prefer': 'count=exact'
      }
    })
    .then(function (res) {
      var range = res.headers.get('content-range');
      if (range) {
        var total = range.split('/')[1];
        var el = document.getElementById('admin-stat-activities');
        if (el) el.textContent = total === '*' ? '0' : total;
      }
    })
    .catch(function () {
      var el = document.getElementById('admin-stat-activities');
      if (el) el.textContent = '?';
    });
  }

  function login() {
    var pw = document.getElementById('admin-password').value;
    var errorEl = document.getElementById('admin-login-error');
    var btn = document.getElementById('admin-login-btn');
    if (!pw) return;

    btn.disabled = true;
    btn.textContent = 'Connexion...';
    errorEl.classList.add('hidden');

    fetch(SUPABASE_URL + '/functions/v1/verify-admin', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + SUPABASE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw })
    })
    .then(function (res) { return res.json(); })
    .then(function (data) {
      if (data.success && data.token) {
        adminToken = data.token;
        var expiry = Date.now() + 2 * 60 * 60 * 1000; // 2h
        sessionStorage.setItem('admin-token', data.token);
        sessionStorage.setItem('admin-token-expiry', expiry.toString());
        showDashboard();
        loadReviews();
        loadActivityCount();
      } else {
        errorEl.textContent = data.error || 'Mot de passe incorrect';
        errorEl.classList.remove('hidden');
        btn.disabled = false;
        btn.textContent = 'Se connecter';
      }
    })
    .catch(function () {
      errorEl.textContent = 'Erreur de connexion';
      errorEl.classList.remove('hidden');
      btn.disabled = false;
      btn.textContent = 'Se connecter';
    });
  }

  function logout() {
    sessionStorage.removeItem('admin-token');
    sessionStorage.removeItem('admin-token-expiry');
    adminToken = null;
    document.getElementById('admin-login').classList.remove('hidden');
    document.getElementById('admin-dashboard').classList.add('hidden');
  }

  // ── Pastilles d'alerte sur les onglets ──
  // Un avis en attente de moderation, un message jamais ouvert, un lead arrive
  // depuis la derniere fois qu'on a regarde l'onglet. Les leads n'ont pas de
  // drapeau « lu » cote base : on retient donc la date de derniere consultation
  // dans le navigateur, ce qui suffit pour signaler ce qui est nouveau.
  function derniereVue(onglet) {
    return Number(localStorage.getItem('admin-vu-' + onglet) || 0);
  }
  function marqueVu(onglet) {
    localStorage.setItem('admin-vu-' + onglet, String(Date.now()));
  }
  function poseePastille(onglet, nombre, intitule) {
    var el = document.querySelector('.admin-pastille[data-notif="' + onglet + '"]');
    if (!el) return;
    if (nombre > 0) {
      el.textContent = nombre > 99 ? '99+' : String(nombre);
      el.title = nombre + ' ' + intitule;
      el.setAttribute('aria-label', nombre + ' ' + intitule);
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
      el.removeAttribute('title');
      el.removeAttribute('aria-label');
    }
  }
  function majPastilles() {
    poseePastille('reviews',
      allReviews.filter(function (r) { return !r.is_approved; }).length,
      'avis en attente de moderation');
    poseePastille('messages',
      allMessages.filter(function (m) { return m.status === 'new'; }).length,
      'message(s) non lu(s)');
    var vu = derniereVue('leads');
    poseePastille('leads',
      allLeads.filter(function (l) { return new Date(l.created_at).getTime() > vu; }).length,
      'nouveau(x) lead(s)');
  }

  function showDashboard() {
    document.getElementById('admin-login').classList.add('hidden');
    document.getElementById('admin-dashboard').classList.remove('hidden');
    // Quiconque arrive ici est le proprietaire du site : ses propres passages
    // n'ont rien a faire dans la mesure d'audience. Le drapeau vit dans le
    // navigateur, il se pose donc une fois par appareil, a la connexion.
    try { localStorage.setItem('qc-no-track', '1'); } catch (e) {}
    // Les pastilles doivent etre justes des l'arrivee : on interroge les trois
    // sources tout de suite, meme si l'affichage de chaque onglet reste
    // paresseux.
    if (allLeads.length === 0) loadLeads();
    if (allMessages.length === 0) loadMessages();
    // L'onglet ouvert a l'arrivee est celui du trafic : c'est le chiffre
    // qu'on vient regarder en premier le matin. Les parties, les avis et le
    // reste attendent derriere, dans l'ordre du menu.
    switchTab(currentTab);
    majFraicheur();
    var elDate = document.getElementById('adm-date');
    if (elDate) elDate.textContent = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  // ── Noms lisibles des quiz ──
  // La base stocke le slug technique pose sur #quiz-engine (data-quiz). Ca se
  // lit tres mal dans un tableau : « knowledge », « jalousie1 », « sain ».
  // On traduit a l'affichage seulement, jamais en base, sinon les anciennes
  // lignes ne correspondraient plus.
  var NOMS_QUIZ = {
    'action-ou-verite': 'Action ou vérité',
    'action-ou-verite-coquin': 'Action ou vérité hot',
    'ado': 'Couple ado',
    'ame-soeur': 'Test âme sœur',
    'amour-amitie': 'Amour ou amitié',
    'amour-habitude': 'Amour ou habitude',
    'amoureux': 'Quiz amoureux',
    'attachement': "Style d'attachement",
    'charge-mentale': 'Charge mentale',
    'common-points': 'Points communs',
    'compatibilite': 'Compatibilité',
    'confiance': 'Confiance',
    'dependance': 'Dépendance affective',
    'coquin': 'Quiz coquin',
    'couche': "A-t-il/elle couché ailleurs",
    'dilemmes': 'Dilemmes',
    'distance': 'Couple à distance',
    'distance-aime': "M'aime-t-il/elle à distance",
    'divorce': 'Risque de divorce',
    'emmenager': 'Emménager ensemble',
    'ex': 'Mon ex pense-t-il/elle à moi',
    'fin-couple': 'Fin de couple',
    'gage-couple': 'Jeu des gages',
    'genant': 'Questions gênantes',
    'infidelite': 'Infidélité',
    'jalousie1': 'Jalousie (ma jalousie)',
    'jalousie2': 'Jalousie (sa jalousie)',
    'karmique': 'Relation karmique',
    'knowledge': 'Qui connaît le mieux',
    'langage-amour': "Langage de l'amour",
    'mariage': 'Prêts pour le mariage',
    'marrant': 'Quiz marrant',
    'most': 'Qui est le plus',
    'parentalite': 'Parentalité',
    'pervers': 'Pervers narcissique',
    'plateau-couple': 'Jeu de plateau',
    'pour-contre': 'Pour ou contre',
    'jamais': "Je n'ai jamais",
    'purete': 'Test de pureté',
    'qui-de-nous-deux': 'Qui de nous deux',
    'rencontre': 'Questions de premier rendez-vous',
    'sain': 'Couple sain',
    'secret': "M'aime-t-il/elle en secret",
    'suis-je-amoureux': 'Suis-je amoureux',
    'tentation': 'Tentation',
    'tester-couple': 'Test de couple',
    'toxic': 'Couple toxique',
    'tu-preferes': 'Tu préfères',
    'vrai-faux': 'Vrai ou faux',
    'zamours': "Les Z'Amours",

    // Les avis n'utilisent pas le meme identifiant que les completions : ils
    // enregistrent la cle de route (#pq-reviews data-quiz-slug), pas le
    // data-quiz du moteur. Les deux jeux de cles cohabitent donc ici.
    testCouple: 'Test de couple',
    testCommonPoints: 'Points communs',
    testCompatibilite: 'Compatibilité',
    testDistance: 'Couple à distance',
    testToxic: 'Couple toxique',
    testFinCouple: 'Fin de couple',
    testAmourAmitie: 'Amour ou amitié',
    testPervers: 'Pervers narcissique',
    testAmourHabitude: 'Amour ou habitude',
    testCoupleSain: 'Couple sain',
    testMariage: 'Prêts pour le mariage',
    testDivorce: 'Risque de divorce',
    quizAmoureux: 'Quiz amoureux',
    quizCoquin: 'Quiz coquin',
    quizMarrant: 'Quiz marrant',
    quizKnowledge: 'Qui connaît le mieux',
    quizMost: 'Qui est le plus',
    quizAdo: 'Couple ado',
    testParentalite: 'Parentalité',
    testEmmenager: 'Emménager ensemble',
    testAstroPrenoms: 'Compatibilité des prénoms',
    testDateNaissance: 'Compatibilité par date de naissance',
    testSignesChinois: 'Compatibilité signes chinois',
    calculatriceAmour: "Calculatrice de l'amour",
    compteurCouple: 'Compteur de couple',
    testJalousie: 'Jalousie',
    testKarmique: 'Relation karmique',
    testSuisJeAmoureux: 'Suis-je amoureux',
    jeuGages: 'Jeu des gages',
    jeuPlateau: 'Jeu de plateau',
    jeuQuiDeNous: 'Qui de nous deux',
    jeuActionVerite: 'Action ou vérité',
    jeuActionVeriteHot: 'Action ou vérité hot',
    quizGenant: 'Questions gênantes',
    testLangageAmour: "Langage de l'amour",
    quizTuPreferes: 'Tu préfères',
    quizVraiFaux: 'Vrai ou faux',
    testAttachement: "Style d'attachement",
    testConfiance: 'Confiance',
    testInfidelite: 'Infidélité',
    testCouche: 'A-t-il/elle couché ailleurs',
    testSecret: "M'aime-t-il/elle en secret",
    testDistanceAime: "M'aime-t-il/elle à distance",
    testAimeEncore: "M'aime-t-il/elle encore",
    testEmprise: 'Emprise psychologique',
    testTrouverAmour: "Pourquoi je ne trouve pas l'amour",
    testCelibataire: 'Pourquoi je suis encore célibataire',
    testCoupleOuCelibat: 'Couple ou célibat',
    testPretRelation: 'Prêt(e) pour une nouvelle relation',
    testDureeCelibat: 'Combien de temps je vais rester célibataire',
    testEstCeLeBon: 'Est-ce le bon / la bonne',
    quizTypeCouple: 'Quel type de couple êtes-vous',
    testAmourAttachement: 'Amour ou attachement',
    testJeLaimeEncore: "Je l'aime encore ?",
    testPersonnalite: 'Personnalité amoureuse',
    // Page retiree du site : ses parties restent en base et doivent garder
    // un nom lisible, sinon la ligne s'affiche sous sa cle technique.
    testBebe: 'Prêts pour un bébé (page retirée)',
    // 'zamours' est deja plus haut : c'est le seul identifiant identique dans
    // les deux nommages, une seule entree suffit.
    jeuDilemmes: 'Dilemmes',
    pourContre: 'Pour ou contre',
    jeuJamais: "Je n'ai jamais",
    jeuQuiPourrait: 'Qui pourrait',
    jeuOuiNon: 'Oui ou non',
    jeuPhrases: 'Phrases à compléter',
    testCrush: 'Amour ou crush',
    testAmourAmi: 'Amoureux de mon meilleur ami',
    quizTentation: 'Tentation',
    testPurete: 'Test de pureté',
    testAmeSoeur: 'Test âme sœur',
    testEx: 'Mon ex pense-t-il/elle à moi',
    testChargeMentale: 'Charge mentale',
    quizRencontre: 'Questions de premier rendez-vous',
    testDependance: 'Dépendance affective',
    testVacances: 'Test où partir en vacances'
  };
  // Un slug inconnu (nouveau quiz pas encore reference ici) reste affiche tel
  // quel plutot que de disparaitre : la ligne existe en base, elle doit se voir.
  function nomQuiz(slug) {
    if (!slug) return '';
    return NOMS_QUIZ[slug] || slug;
  }

  // ── Un test, un identifiant ──
  // La base connait la plupart des pages sous DEUX identifiants : le data-quiz
  // du moteur, utilise a l'origine (« toxic », « sain », « purete »), et la
  // cle de route posee depuis (« testToxic », « testCoupleSain »...). Les
  // deux cohabitent dans quiz_completions, si bien que le meme test occupait
  // deux lignes du tableau de bord, sous le meme nom, avec ses parties
  // coupees en deux. Un test paraissait donc moins joue qu'il ne l'est, et
  // son taux de finition se calculait sur la moitie de son histoire.
  //
  // On replie l'ancien identifiant sur le nouveau a la lecture, jamais en
  // base : reecrire les lignes existantes ferait perdre la trace de ce qui a
  // ete enregistre, pour un affichage qu'un repli suffit a corriger.
  var SLUG_CANON = {
    'action-ou-verite': 'jeuActionVerite',
    'action-ou-verite-coquin': 'jeuActionVeriteHot',
    'ado': 'quizAdo',
    'ame-soeur': 'testAmeSoeur',
    'amour-amitie': 'testAmourAmitie',
    'amour-habitude': 'testAmourHabitude',
    'amoureux': 'quizAmoureux',
    'attachement': 'testAttachement',
    'charge-mentale': 'testChargeMentale',
    'common-points': 'testCommonPoints',
    'compatibilite': 'testCompatibilite',
    'confiance': 'testConfiance',
    'coquin': 'quizCoquin',
    'couche': 'testCouche',
    'crush': 'testCrush',
    'amour-ami': 'testAmourAmi',
    'dependance': 'testDependance',
    'dilemmes': 'jeuDilemmes',
    'distance': 'testDistance',
    'distance-aime': 'testDistanceAime',
    'divorce': 'testDivorce',
    'emmenager': 'testEmmenager',
    'ex': 'testEx',
    'fin-couple': 'testFinCouple',
    'gage-couple': 'jeuGages',
    'genant': 'quizGenant',
    'infidelite': 'testInfidelite',
    'jalousie1': 'testJalousie',
    'jalousie2': 'testJalousie',
    'karmique': 'testKarmique',
    'knowledge': 'quizKnowledge',
    'langage-amour': 'testLangageAmour',
    'mariage': 'testMariage',
    'marrant': 'quizMarrant',
    'most': 'quizMost',
    'oui-non': 'jeuOuiNon',
    'phrases': 'jeuPhrases',
    'parentalite': 'testParentalite',
    'pervers': 'testPervers',
    'plateau-couple': 'jeuPlateau',
    'pour-contre': 'pourContre',
    'jamais': 'jeuJamais',
    'purete': 'testPurete',
    'qui-de-nous-deux': 'jeuQuiDeNous',
    'qui-pourrait': 'jeuQuiPourrait',
    'rencontre': 'quizRencontre',
    'sain': 'testCoupleSain',
    'secret': 'testSecret',
    'aime-encore': 'testAimeEncore',
    'emprise': 'testEmprise',
    'trouver-amour': 'testTrouverAmour',
    'celibataire': 'testCelibataire',
    'couple-ou-celibat': 'testCoupleOuCelibat',
    'pret-nouvelle-relation': 'testPretRelation',
    'duree-celibat': 'testDureeCelibat',
    'est-ce-le-bon': 'testEstCeLeBon',
    'type-couple': 'quizTypeCouple',
    'amour-ou-attachement': 'testAmourAttachement',
    'je-l-aime-encore': 'testJeLaimeEncore',
    'suis-je-amoureux': 'testSuisJeAmoureux',
    'tentation': 'quizTentation',
    'tester-couple': 'testCouple',
    'toxic': 'testToxic',
    'tu-preferes': 'quizTuPreferes',
    'vrai-faux': 'quizVraiFaux',
  };
  function canon(slug) { return SLUG_CANON[slug] || slug; }

  // Somme les lignes qui pointent vers le meme test apres repli.
  function fusionneComptes(rows) {
    var par = {};
    (rows || []).forEach(function (r) {
      var c = canon(r.quiz_slug);
      par[c] = (par[c] || 0) + (Number(r.total) || 0);
    });
    return Object.keys(par).map(function (k) { return { quiz_slug: k, total: par[k] }; });
  }

  // ── Famille d'une page : test, quiz ou jeu ──
  // Meme regle que genrePageJouable() cote build, pour que le tableau de bord
  // range les pages comme le site les presente. Deux nommages coexistent en
  // base (cle de route et data-quiz du moteur), les deux sont couverts.
  var FAMILLES = {
    jeu: ['jeuActionVerite', 'jeuActionVeriteHot', 'jeuGages', 'jeuPlateau', 'jeuQuiDeNous',
          'jeuDilemmes', 'pourContre', 'quizTuPreferes', 'jeuJamais',
          'action-ou-verite', 'action-ou-verite-coquin', 'gage-couple', 'plateau-couple',
          'qui-de-nous-deux', 'dilemmes', 'pour-contre', 'tu-preferes', 'jamais',
          'jeuPhrases', 'phrases'],
    quiz: ['zamours', 'amoureux', 'coquin', 'genant', 'knowledge', 'marrant', 'most',
           'vrai-faux', 'ado', 'tentation', 'rencontre']
  };
  var LIBELLE_FAMILLE = { test: 'Tests', quiz: 'Quiz', jeu: 'Jeux' };

  // ── Pages sans taux de finition, avec le motif affiche ──
  // Les deux premieres rendent leur resultat immediatement, a partir de deux
  // prenoms ou de deux dates : pas de questionnaire a abandonner en route,
  // donc pas d'ecart possible entre lance et fini. Le oui ou non, lui, n'a
  // pas de fin de partie du tout : on s'arrete quand on veut, il n'envoie
  // jamais de completion. Dans les deux cas le taux ne mesure rien et, mele
  // aux autres, il tirerait la moyenne d'ensemble.
  // Ces pages restent comptees dans les lances (et les termines pour celles
  // qui en ont).
  // Les deux premieres rendent leur resultat immediatement, a partir de deux
  // prenoms ou de deux dates : pas de questionnaire a abandonner en route.
  //
  // Les dix jeux qui suivent n'ont pas de fin a atteindre. On y tire des
  // cartes, des gages ou des dilemmes tant qu'on veut, et l'ecran de fin
  // n'arrive que si quelqu'un appuie sur « Terminer la partie » plutot que
  // de fermer l'onglet. Leur « taux de finition » mesure donc l'usage de ce
  // bouton, rien d'autre, et il part dans tous les sens : 90 % pour la roue
  // des gages, 12 % pour les dilemmes, 0 % pour le oui ou non, qui n'a meme
  // pas ce bouton. Melees aux tests, ces pages tiraient la moyenne du site
  // vers le bas sans rien dire de personne.
  //
  // Le criterion n'est pas un avis : ce sont exactement les pages declarees
  // « totalQ: 0 » dans quiz-loader.js, celles dont le moteur ne connait pas
  // de nombre de tours.
  var SANS_RATIO = {
    testAstroPrenoms: 'résultat immédiat',
    testDateNaissance: 'résultat immédiat',
    testSignesChinois: 'résultat immédiat',
    calculatriceAmour: 'résultat immédiat',
    compteurCouple: 'résultat immédiat',
    jeuOuiNon: 'jeu sans fin de partie',
    jeuPhrases: 'jeu sans fin de partie',
    jeuActionVerite: 'jeu sans fin de partie',
    jeuActionVeriteHot: 'jeu sans fin de partie',
    jeuGages: 'jeu sans fin de partie',
    jeuPlateau: 'jeu sans fin de partie',
    jeuQuiDeNous: 'jeu sans fin de partie',
    jeuDilemmes: 'jeu sans fin de partie',
    jeuJamais: 'jeu sans fin de partie',
    pourContre: 'jeu sans fin de partie',
    jeuQuiPourrait: 'jeu sans fin de partie'
  };
  function sansRatio(slug) { return Object.prototype.hasOwnProperty.call(SANS_RATIO, canon(slug)); }

  // ── Pages retirees de la moyenne, mais qui gardent leur propre taux ──
  // Le vrai ou faux a bien un parcours : trente affirmations tirees parmi
  // cent, puis un ecran de resultat. Son taux a donc un sens pour lui-meme,
  // et il est bas (15 %). Mais la page s'annonce partout comme « 100
  // questions », et son abandon ne se compare pas a celui d'un test de vingt
  // questions : dans la moyenne du site, il tire vers le bas une mesure qui
  // sert a comparer les tests entre eux. Il en sort, sa ligne garde son
  // chiffre.
  var HORS_MOYENNE = { quizVraiFaux: true };
  // Ce qui compte dans la moyenne du site : ni les pages sans taux, ni
  // celles mises de cote ci-dessus.
  function dansMoyenne(slug) {
    var c = canon(slug);
    return !sansRatio(c) && !Object.prototype.hasOwnProperty.call(HORS_MOYENNE, c);
  }
  function familleQuiz(slug) {
    if (!slug) return 'test';
    if (FAMILLES.jeu.indexOf(slug) !== -1) return 'jeu';
    if (FAMILLES.quiz.indexOf(slug) !== -1) return 'quiz';
    // Les cles de route non listees suivent le prefixe : quizXxx est un quiz,
    // tout le reste est un test.
    if (/^quiz/.test(slug)) return 'quiz';
    if (/^jeu/.test(slug)) return 'jeu';
    return 'test';
  }

  // ── Stats : completions de quiz (RPC publiques, cle anon) ──
  var statsCounts = [];
  // Lancements par page : { slug: n }. Vide tant que la table quiz_starts
  // n'existe pas ou n'a rien enregistre, auquel cas la bascule reste sur
  // « terminés » et le dit franchement plutot que d'afficher des zeros.
  var statsLances = null;
  // Serie quotidienne des lancements, meme forme que statsParJour. Elle sert
  // a borner le taux de finition : les completions sont enregistrees depuis
  // des mois, les lancements depuis la mise en service de quiz_starts.
  // Rapporter les unes aux autres sur toute leur histoire donne des taux a
  // quatre chiffres, qui ne veulent rien dire.
  var statsLancesParJour = null;
  // Colonne de tri et sens. -1 = decroissant, le classement le plus utile
  // par defaut : ce qui est le plus joue en haut.
  var statsTri = { col: 'finis', sens: -1 };
  // 0 = depuis toujours, sinon un nombre de jours. Les totaux « depuis
  // toujours » viennent des RPC de comptage ; les periodes se somment sur les
  // series quotidiennes, qu'il faut donc avoir chargees assez loin.
  var statsPeriode = 0;
  var joursCharges = 62;
  var statsRange = 30;
  var statsSelectedSlug = null;
  var _lastTotalSeries = null, _lastQuizSeries = null, _lastQuizOpts = {}, _lastTotalCouches = null;
  // Series quotidienne de chaque quiz : { slug: { 'AAAA-MM-JJ': n } }.
  // Alimente le compteur vert du jour et le comparatif tops / flops.
  var statsParJour = null;
  var statsParJourUTC = false;
  var statsComp = 1;
  // PostgREST plafonne toute reponse a mille lignes, et le plafond ne
  // s'annonce pas : la fonction rend ses mille premieres lignes, statut 200,
  // sans rien dire du reste. Les deux series quotidiennes par page ont
  // depasse ce plafond (1 406 lignes pour les completions), et comme elles
  // sont triees par identifiant de page, la coupure tombait en plein milieu
  // de l'alphabet : dix-sept pages, de testEmprise a zamours, disparaissaient
  // entierement de la serie. Leurs parties terminees ne comptaient plus nulle
  // part, alors que leurs lancements, eux, tenaient encore sous le plafond.
  // Le taux de finition du site comparait donc des lancements complets a des
  // fins de partie amputees : 32 % affiches pour 41 % reels.
  //
  // On demande donc les pages une par une, jusqu'a ce qu'une reponse revienne
  // plus courte que le lot demande. Une seule requete de plus dans le cas
  // courant, et la mesure ne peut plus etre coupee en silence.
  var LOT_RPC = 1000;
  function statsRpcPages(fn, body) {
    var cle = 'pages:' + cleCache(fn, body);
    var enCache = cacheLis(cle);
    if (enCache !== undefined) return Promise.resolve(enCache);
    return statsRpcPagesReseau(fn, body).then(function (r) { cacheEcris(cle, r); return r; });
  }
  function statsRpcPagesReseau(fn, body) {
    var tout = [];
    function lot(depart) {
      return fetch(SUPABASE_URL + '/rest/v1/rpc/' + fn + '?limit=' + LOT_RPC + '&offset=' + depart, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY,
          'Content-Type': 'application/json',
          // Sans ce prefixe, l'en-tete Content-Range se termine par une
          // etoile : le serveur rend le lot sans dire combien de lignes
          // existent, et il n'y a plus aucun moyen de savoir qu'il en reste.
          'Prefer': 'count=exact'
        },
        body: JSON.stringify(body || {})
      }).then(function (r) {
        var plage = r.headers.get('content-range') || '';
        var m = /\/(\d+)$/.exec(plage);
        var total = m ? parseInt(m[1], 10) : null;
        return r.json().then(function (rows) { return { rows: rows, total: total }; });
      }).then(function (rep) {
        var rows = rep.rows;
        // Une erreur PostgREST est un objet, pas un tableau : on la rend
        // telle quelle pour que l'appelant garde son repli habituel.
        if (!Array.isArray(rows)) return depart === 0 ? rows : tout;
        tout = tout.concat(rows);
        // Le serveur peut rendre moins que le lot demande : c'est son propre
        // plafond qui s'applique, pas la fin des donnees. On se fie donc au
        // nombre total annonce, et on ne retombe sur la longueur du lot que
        // si l'en-tete manque. Un lot vide arrete la boucle dans tous les cas.
        var reste = rep.total !== null ? (tout.length < rep.total) : (rows.length >= LOT_RPC);
        if (!rows.length || !reste || depart >= LOT_RPC * 50) return tout;
        return lot(tout.length);
      });
    }
    return lot(0);
  }
  // ── Cache des lectures ──────────────────────────────────────────────
  // Chaque onglet lance ses propres requetes a l'ouverture ; sans cache, un
  // aller-retour entre deux onglets refaisait des dizaines d'appels a la base
  // pour redessiner la meme chose. Les reponses des RPC sont donc gardees
  // dans ce navigateur (memoire de session : elles survivent a un
  // rechargement, pas a la fermeture de l'onglet). Changer d'onglet relit la
  // memoire ; le bouton « Actualiser » de l'en-tete la vide et recharge.
  var CACHE_PREFIXE = 'admin-cache:';
  var cacheMemoire = {};
  function cacheLis(cle) {
    if (Object.prototype.hasOwnProperty.call(cacheMemoire, cle)) return cacheMemoire[cle];
    try {
      var v = sessionStorage.getItem(CACHE_PREFIXE + cle);
      if (v !== null) { var o = JSON.parse(v); cacheMemoire[cle] = o; return o; }
    } catch (e) {}
    return undefined;
  }
  function cacheEcris(cle, valeur) {
    // Une erreur PostgREST est un objet porteur d'un code : on ne la garde
    // pas, sinon une migration appliquee plus tard resterait invisible.
    if (valeur && typeof valeur === 'object' && !Array.isArray(valeur) && (valeur.code || valeur.message)) return;
    cacheMemoire[cle] = valeur;
    try { sessionStorage.setItem(CACHE_PREFIXE + cle, JSON.stringify(valeur)); } catch (e) {}
    if (!lisFraicheur()) poseFraicheur();
  }
  function videCache() {
    cacheMemoire = {};
    try {
      Object.keys(sessionStorage).forEach(function (k) { if (k.indexOf(CACHE_PREFIXE) === 0) sessionStorage.removeItem(k); });
      sessionStorage.removeItem('admin-cache-depuis');
    } catch (e) {}
  }
  function poseFraicheur() {
    try { sessionStorage.setItem('admin-cache-depuis', String(Date.now())); } catch (e) {}
    majFraicheur();
  }
  function lisFraicheur() {
    try { return Number(sessionStorage.getItem('admin-cache-depuis')) || 0; } catch (e) { return 0; }
  }
  function majFraicheur() {
    var el = document.getElementById('adm-fraicheur');
    if (!el) return;
    var t = lisFraicheur();
    el.textContent = t ? 'Données de ' + new Date(t).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '';
    el.hidden = !t;
  }
  function cleCache(fn, body) { return fn + ':' + JSON.stringify(body || {}); }

  function statsRpc(fn, body) {
    var cle = cleCache(fn, body);
    var enCache = cacheLis(cle);
    if (enCache !== undefined) return Promise.resolve(enCache);
    return statsRpcReseau(fn, body).then(function (r) { cacheEcris(cle, r); return r; });
  }
  function statsRpcReseau(fn, body) {
    return fetch(SUPABASE_URL + '/rest/v1/rpc/' + fn, {
      method: 'POST',
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {})
    }).then(function (r) { return r.json(); });
  }

  // ── Export (Thomas, 7 octobre 2026) ──────────────────────────────────────
  // Un fichier JSON avec tout ce que l'admin sait sur trente jours : parties
  // lancées et finies par test, trafic par jour, par page et par source,
  // blog, mode à distance, clics vers Instagram. Il sert à analyser ailleurs
  // (et à décider ce que l'admin doit garder). Les lectures passent par la
  // même mémoire de session que les onglets : un export après une visite
  // des onglets n'ajoute presque aucun appel à la base. Une fonction absente
  // (migration pas passée) laisse son erreur dans le fichier, telle quelle.
  function exporterTout() {
    var btn = document.getElementById('admin-export');
    var texteBouton = btn ? btn.innerHTML : '';
    var tz = fuseau();
    var n = 30;
    if (btn) { btn.disabled = true; btn.querySelector('span').textContent = 'Export...'; }
    var lots = {
      parties_finies_total: statsRpc('get_quiz_total'),
      parties_finies_par_test: statsRpc('get_quiz_counts'),
      lancements_total: statsRpc('get_quiz_starts_total'),
      lancements_par_test: statsRpc('get_quiz_starts_counts'),
      parties_finies_par_jour: statsRpc('get_quiz_daily_total', { p_days: n, p_tz: tz }),
      trafic_resume: statsRpc('get_trafic_resume', { p_days: n, p_tz: tz }),
      trafic_par_jour: statsRpc('get_trafic_daily', { p_days: n, p_tz: tz }),
      trafic_pages: statsRpcPages('get_trafic_pages', { p_days: n, p_tz: tz }),
      trafic_sources: statsRpc('get_trafic_sources', { p_days: n, p_tz: tz }),
      trafic_profondeur: statsRpc('get_trafic_profondeur', { p_days: n, p_tz: tz }),
      trafic_entonnoir: statsRpc('get_trafic_entonnoir', { p_days: n, p_tz: tz }),
      sources_google_clics: statsRpc('get_source_pref_clics', { p_days: n, p_tz: tz }),
      distance_par_jour: statsRpc('get_salon_daily', { p_days: n + 1, p_tz: tz }),
      distance_depuis_le_debut: chargeSalonParPage(),
      instagram_clics: statsRpc('get_instagram_clics')
    };
    var cles = Object.keys(lots);
    Promise.all(cles.map(function (k) {
      return Promise.resolve(lots[k]).catch(function (e) { return { erreur: String((e && e.message) || e) }; });
    })).then(function (valeurs) {
      var donnees = {};
      cles.forEach(function (k, i) { donnees[k] = valeurs[i]; });
      var fichier = {
        exporte_le: new Date().toISOString(),
        periode_jours: n,
        fuseau: tz,
        lecture: 'Export de l\'admin de quiz-couple.com. parties_* : parties terminées (depuis toujours par test, par jour sur la période) ; lancements_* : parties commencées, depuis le 21 août 2026 ; le taux de finition d\'un test = finies / lancées. trafic_* : pages vues, visites, pages, sources, profondeur et entonnoir sur la période. distance_* : mode à distance. instagram_clics : clics vers Instagram depuis le site. Une entrée { erreur } ou { code, message } = fonction absente ou refusée.',
        donnees: donnees
      };
      var blob = new Blob([JSON.stringify(fichier, null, 2)], { type: 'application/json' });
      var lien = document.createElement('a');
      var adresse = window.URL.createObjectURL(blob);
      lien.href = adresse;
      lien.download = 'quiz-couple-admin-' + new Date().toISOString().slice(0, 10) + '.json';
      document.body.appendChild(lien);
      lien.click();
      lien.remove();
      setTimeout(function () { window.URL.revokeObjectURL(adresse); }, 2000);
    }).catch(function (e) {
      alert('Export impossible : ' + ((e && e.message) || e));
    }).then(function () {
      if (btn) { btn.disabled = false; btn.innerHTML = texteBouton; }
    });
  }

  // Detect the date field of an RPC row and return a YYYY-MM-DD key.
  function rowDateKey(row) {
    var keys = ['day', 'd', 'date', 'created_at', 'created_day', 'jour'];
    for (var i = 0; i < keys.length; i++) {
      if (row[keys[i]] != null) return String(row[keys[i]]).slice(0, 10);
    }
    return null;
  }
  function rowTotal(row) {
    if (typeof row === 'number') return row;
    var keys = ['total', 'count', 'n', 'c'];
    for (var i = 0; i < keys.length; i++) if (row[keys[i]] != null) return Number(row[keys[i]]) || 0;
    return 0;
  }
  // Build a continuous series of the last `days` days: [{date:Date, label, total}]
  // `enUTC` sert quand la base a groupe en UTC faute de connaitre le fuseau :
  // les colonnes sont alors construites en UTC elles aussi, pour que les deux
  // cotes parlent des memes journees. Mieux vaut un decalage assume qu'une
  // colonne du jour vide alors que des parties ont bien ete jouees.
  function buildSeries(rows, days, enUTC) {
    var map = {};
    (rows || []).forEach(function (r) {
      var k = rowDateKey(r);
      if (k) map[k] = (map[k] || 0) + rowTotal(r);
    });
    var out = [], today = new Date();
    if (enUTC) today.setUTCHours(0, 0, 0, 0); else today.setHours(0, 0, 0, 0);
    for (var i = days - 1; i >= 0; i--) {
      var dt = new Date(today.getTime() - i * 86400000);
      var an = enUTC ? dt.getUTCFullYear() : dt.getFullYear();
      var mo = (enUTC ? dt.getUTCMonth() : dt.getMonth()) + 1;
      var jo = enUTC ? dt.getUTCDate() : dt.getDate();
      var iso = an + '-' + String(mo).padStart(2, '0') + '-' + String(jo).padStart(2, '0');
      out.push({ date: dt, label: String(jo).padStart(2, '0') + '/' + String(mo).padStart(2, '0'), total: map[iso] || 0 });
    }
    return out;
  }

  function loadStats() {
    var totalEl = document.getElementById('admin-finis-total');
    var listEl = document.getElementById('admin-stats-list');
    if (listEl) listEl.innerHTML = '<p class="text-center text-muted-foreground py-6">Chargement...</p>';
    statsRpc('get_quiz_total').then(function (v) {
      var n = Array.isArray(v) ? (v[0] && (v[0].get_quiz_total != null ? v[0].get_quiz_total : v[0])) : v;
      if (totalEl) totalEl.textContent = (n != null ? Number(n).toLocaleString('fr-FR') : 0);
    }).catch(function () { if (totalEl) totalEl.textContent = '?'; });
    chargeLancements();
    statsRpc('get_quiz_counts').then(function (rows) {
      if (!Array.isArray(rows)) { if (listEl) listEl.innerHTML = '<p class="text-center text-destructive py-6">Erreur de chargement.</p>'; return; }
      statsCounts = fusionneComptes(rows).sort(function (a, b) { return b.total - a.total; });
      renderStatsList();
      // Les slugs sont connus : on peut charger les series quotidiennes
      // (le repli sans RPC groupee en a besoin pour boucler sur les quiz).
      chargeParJour();
    }).catch(function () { if (listEl) listEl.innerHTML = '<p class="text-center text-destructive py-6">Erreur reseau.</p>'; });
    loadTotalDaily(statsRange);
  }

  // ── Parties a distance ──
  // Un lance a distance est une personne qui a joue chacun sur son telephone :
  // une partie en fait deux, comme elle fait deux lances et deux finis. Le
  // mode n'existe que depuis le 7 septembre 2026 : tout ce que cet onglet
  // compare (lancements de toutes les pages, part a distance, courbe) part de
  // cette date, sinon des semaines sans mode a distance ecrasent la part.
  // La table salon_parties n'existe qu'une fois sa migration passee ; sans
  // elle, l'onglet le dit et la ligne sous les lances reste vide.
  var PAGES_DISTANCE = ['testCouple', 'testCommonPoints', 'testCompatibilite', 'quizAmoureux',
    'testCoupleSain', 'testParentalite', 'testEmmenager', 'testAmeSoeur', 'testChargeMentale',
    'jeuJamais', 'jeuQuiDeNous', 'jeuQuiPourrait'];
  var DEBUT_DISTANCE = (typeof window !== 'undefined' && window.__ADM_DEBUT_DISTANCE) || '2026-09-07';
  var distanceCouchesVues = { lances: true, distance: true, part: true };
  var _distanceCouches = null;

  // Nombre de jours ecoules depuis la mise en service, aujourd'hui compris.
  // Zero tant que la date n'est pas atteinte.
  function joursDepuisDebutDistance() {
    var d0 = new Date(DEBUT_DISTANCE + 'T12:00:00');
    var auj = new Date(); auj.setHours(12, 0, 0, 0);
    var n = Math.floor((auj.getTime() - d0.getTime()) / 86400000) + 1;
    return Math.max(0, Math.min(365, n));
  }
  function dateDebutDistanceLisible() {
    return new Date(DEBUT_DISTANCE + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  }
  // La serie des lancements a distance depuis la mise en service, par jour.
  // Renvoie { parJour: { iso: { departs, fins } }, departs, fins }.
  function chargeDistanceParJour() {
    var jours = joursDepuisDebutDistance();
    if (!jours) return Promise.resolve({ parJour: {}, departs: 0, fins: 0, aucunJour: true });
    return statsRpc('get_salon_daily', { p_days: jours + 1, p_tz: fuseau() }).then(function (rows) {
      if (!Array.isArray(rows)) throw new Error('pas de rpc');
      var parJour = {}, departs = 0, fins = 0;
      rows.forEach(function (r) {
        var k = rowDateKey(r);
        if (!k || k < DEBUT_DISTANCE) return;
        var d = Number(r.departs) || 0, f = Number(r.fins) || 0;
        parJour[k] = { departs: (parJour[k] ? parJour[k].departs : 0) + d, fins: (parJour[k] ? parJour[k].fins : 0) + f };
        departs += d; fins += f;
      });
      return { parJour: parJour, departs: departs, fins: fins };
    });
  }
  // Les lancements de toutes les pages depuis la mise en service, par jour et
  // par page, a partir de la serie quotidienne des lancements.
  function chargeLancesDepuisDebut() {
    var jours = joursDepuisDebutDistance();
    if (!jours) return Promise.resolve({ parJour: {}, parPage: {}, total: 0 });
    return statsRpcPages('get_quiz_starts_daily_par_quiz', { p_days: jours + 1, p_tz: fuseau() }).then(function (rows) {
      if (!Array.isArray(rows) || rows.error) throw new Error('pas de rpc');
      var parJour = {}, parPage = {}, total = 0;
      rows.forEach(function (r) {
        var k = rowDateKey(r), slug = canon(r.quiz_slug);
        if (!k || k < DEBUT_DISTANCE || !slug) return;
        var v = rowTotal(r);
        parJour[k] = (parJour[k] || 0) + v;
        parPage[slug] = (parPage[slug] || 0) + v;
        total += v;
      });
      return { parJour: parJour, parPage: parPage, total: total };
    });
  }
  // Les lances et finis a distance par page depuis la mise en service. La
  // fonction bornee a la date a depasse le delai de trois secondes de
  // Supabase le 7 octobre 2026 (erreur 57014) et l'onglet restait vide : si
  // elle ne repond pas, on relit les totaux par page sans borne
  // (get_salon_counts). La table n'existe que depuis la mise en service du
  // mode, les deux comptes ne different donc que de quelques heures autour
  // du premier jour. La migration 20261008160000 rend la fonction bornee
  // rapide ; le repli reste, pour que l'onglet ne soit plus jamais vide.
  function chargeSalonParPage() {
    return statsRpc('get_salon_counts_depuis', { p_depuis: DEBUT_DISTANCE, p_tz: fuseau() }).then(function (r) {
      return Array.isArray(r) ? r : statsRpc('get_salon_counts');
    });
  }

  // Sous le total des lances de l'onglet Parties : la part a distance, sur la
  // seule periode ou le mode existe.
  function ligneDistance() {
    var el = document.getElementById('admin-lances-distance');
    if (!el) return;
    Promise.all([chargeDistanceParJour(), chargeLancesDepuisDebut()]).then(function (r) {
      if (r[0].aucunJour) { el.textContent = 'Mode à distance mesuré à partir du ' + dateDebutDistanceLisible(); return; }
      el.textContent = r[1].total
        ? r[1].total.toLocaleString('fr-FR') + ' lancés depuis le ' + dateDebutDistanceLisible() + ' · ' + r[0].departs.toLocaleString('fr-FR') + ' à distance (' + pct(r[0].departs, r[1].total) + ' %)'
        : r[0].departs.toLocaleString('fr-FR') + ' à distance depuis le ' + dateDebutDistanceLisible();
    }).catch(function () { el.textContent = ''; });
  }
  function renderDistanceLegende(couches) {
    var el = document.getElementById('admin-distance-legende');
    if (!el) return;
    el.innerHTML = couches.map(function (c) {
      var valeur;
      if (c.cle === 'part') valeur = c.total !== null ? c.total + ' %' : '—';
      else valeur = c.points.reduce(function (a, p) { return a + (p.total || 0); }, 0).toLocaleString('fr-FR');
      return '<button type="button" class="stats-leg' + (c.visible ? '' : ' est-eteinte') + '"'
        + ' style="--leg:' + c.couleur + '" data-distance-courbe="' + c.cle + '"'
        + ' aria-pressed="' + (c.visible ? 'true' : 'false') + '">'
        + '<span class="stats-leg-nom"><span class="stats-leg-puce"></span>' + esc(c.nom) + '</span>'
        + '<span class="stats-leg-val">' + valeur + '</span>'
        + '</button>';
    }).join('');
  }
  function renderDistanceCourbe(lances, distance) {
    var cv = document.getElementById('admin-distance-chart');
    if (!cv) return;
    var jours = joursDepuisDebutDistance();
    var points = { lances: [], distance: [], part: [] };
    for (var i = jours - 1; i >= 0; i--) {
      var iso = isoNJoursAvant(i);
      if (iso < DEBUT_DISTANCE) continue;
      var d = new Date(iso + 'T12:00:00');
      var label = d.getDate() + '/' + (d.getMonth() + 1);
      var l = lances.parJour[iso] || 0;
      var dd = distance.parJour[iso] ? distance.parJour[iso].departs : 0;
      points.lances.push({ date: d, label: label, total: l });
      points.distance.push({ date: d, label: label, total: dd });
      points.part.push({ date: d, label: label, total: l ? Math.min(100, Math.round((dd / l) * 100)) : null });
    }
    var partTotale = lances.total ? Math.min(100, Math.round((distance.departs / lances.total) * 100)) : null;
    var couches = [
      { cle: 'lances', nom: 'Lancés, toutes pages', couleur: teinte('lances', '#3B82F6'), axe: 'gauche', unite: '', total: null },
      { cle: 'distance', nom: 'À distance', couleur: teinte('finis', '#EF4E88'), axe: 'gauche', unite: '', total: null },
      { cle: 'part', nom: 'Part à distance', couleur: teinte('ratio', '#F59E0B'), axe: 'droite', unite: ' %', total: partTotale }
    ].map(function (c) { c.visible = distanceCouchesVues[c.cle]; c.points = points[c.cle]; return c; });
    _distanceCouches = couches;
    renderDistanceLegende(couches);
    drawChart(cv, couches, {});
  }
  function loadDistance() {
    var listEl = document.getElementById('admin-distance-list');
    var elL = document.getElementById('admin-distance-lances');
    var elD = document.getElementById('admin-distance-total');
    var elP = document.getElementById('admin-distance-part');
    var elNote = document.getElementById('admin-distance-note');
    var cv = document.getElementById('admin-distance-chart');
    if (listEl) listEl.innerHTML = '<p class="text-center text-muted-foreground py-6">Chargement...</p>';
    if (cv) drawChart(cv, [], { loading: true });
    var depuis = dateDebutDistanceLisible();
    if (elNote) elNote.textContent = 'Toutes les mesures de cet onglet partent du ' + depuis + ', premier jour du mode à distance.';
    if (!joursDepuisDebutDistance()) {
      if (elL) elL.textContent = '—'; if (elD) elD.textContent = '—'; if (elP) elP.textContent = '—';
      if (listEl) listEl.innerHTML = '<p class="text-center text-muted-foreground py-6">La mesure commence le ' + esc(depuis) + '.</p>';
      if (cv) drawChart(cv, [], {});
      var leg0 = document.getElementById('admin-distance-legende'); if (leg0) leg0.innerHTML = '';
      return;
    }
    Promise.all([
      chargeLancesDepuisDebut(),
      chargeDistanceParJour(),
      chargeSalonParPage(),
      statsRpc('get_quiz_counts')
    ]).then(function (r) {
      var lances = r[0], distance = r[1];
      if (!Array.isArray(r[2])) throw new Error('pas de rpc');
      if (elL) elL.textContent = lances.total.toLocaleString('fr-FR');
      if (elD) elD.textContent = distance.departs.toLocaleString('fr-FR');
      if (elP) elP.textContent = lances.total ? pct(distance.departs, lances.total) + ' %' : '—';
      var elFins = document.getElementById('admin-distance-fins');
      if (elFins) elFins.textContent = distance.fins.toLocaleString('fr-FR') + ' finis à distance';
      renderDistanceCourbe(lances, distance);

      var dist = {};
      r[2].forEach(function (x) {
        var c = canon(x.quiz_slug);
        if (!dist[c]) dist[c] = { departs: 0, fins: 0 };
        dist[c].departs += Number(x.departs) || 0;
        dist[c].fins += Number(x.fins) || 0;
      });
      var slugs = PAGES_DISTANCE.slice();
      Object.keys(dist).forEach(function (k) { if (slugs.indexOf(k) === -1) slugs.push(k); });
      var lignes = slugs.map(function (slug) {
        var d = dist[slug] || { departs: 0, fins: 0 };
        return { slug: slug, lances: lances.parPage[slug] || 0, departs: d.departs, fins: d.fins };
      }).sort(function (a, b) { return b.departs - a.departs || b.lances - a.lances; });
      var max = Math.max(1, lignes.reduce(function (m, l) { return Math.max(m, l.departs); }, 0));
      var html = '<div class="stats-entetes">'
        + '<span class="stats-entete-nom">Page</span>'
        + '<span class="stats-tri" style="--col:var(--adm-s-lances)">Lancés</span>'
        + '<span class="stats-tri" style="--col:var(--adm-s-finis)">À distance</span>'
        + '<span class="stats-tri" style="--col:var(--adm-s-taux)">Part</span>'
        + '</div>';
      html += lignes.map(function (l) {
        var part = l.lances ? pct(l.departs, l.lances) : null;
        var bulle = nomQuiz(l.slug) + ' · ' + l.departs.toLocaleString('fr-FR') + ' lancés à distance, ' + l.fins.toLocaleString('fr-FR') + ' finis à distance, sur ' + l.lances.toLocaleString('fr-FR') + ' lancés depuis le ' + depuis;
        return '<div class="stats-row stats-row--fixe" style="--part:' + Math.round((l.departs / max) * 100) + '%" title="' + esc(bulle) + '">'
          + '<span class="stats-row-name">' + esc(nomQuiz(l.slug)) + '</span>'
          + '<span class="stats-cell stats-cell--lances">' + l.lances.toLocaleString('fr-FR') + '</span>'
          + '<span class="stats-cell stats-cell--finis">' + l.departs.toLocaleString('fr-FR')
          + (l.fins ? '<span class="stats-cell-jour" title="Finis à distance">' + l.fins.toLocaleString('fr-FR') + ' finis</span>' : '') + '</span>'
          + (part === null ? '<span class="stats-cell stats-cell--ratio est-vide">—</span>'
             : '<span class="stats-cell stats-cell--ratio">' + part + ' %</span>')
          + '</div>';
      }).join('');
      if (listEl) listEl.innerHTML = html;
    }).catch(function () {
      if (listEl) listEl.innerHTML = '<p class="text-center text-muted-foreground py-6">Les parties à distance ne remontent pas : les fonctions salon_parties ne répondent pas (migration non appliquée, ou délai de trois secondes dépassé).</p>';
      if (elL) elL.textContent = '-'; if (elD) elD.textContent = '-'; if (elP) elP.textContent = '-';
      if (cv) drawChart(cv, [], {});
    });
  }

  function chargeLancements() {
    var elTotal = document.getElementById('admin-lances-total');
    statsRpc('get_quiz_starts_total').then(function (v) {
      var n = Array.isArray(v) ? (v[0] && (v[0].get_quiz_starts_total != null ? v[0].get_quiz_starts_total : v[0])) : v;
      if (n == null || isNaN(Number(n))) throw new Error('pas de rpc');
      if (elTotal) elTotal.textContent = Number(n).toLocaleString('fr-FR');
      ligneDistance();
      return statsRpc('get_quiz_starts_counts');
    }).then(function (rows) {
      if (!Array.isArray(rows) || rows.error) throw new Error('pas de rpc');
      var map = {};
      fusionneComptes(rows).forEach(function (r) { map[r.quiz_slug] = r.total; });
      statsLances = map;
      renderStatsList();
      // La serie quotidienne arrive apres : elle borne la fenetre commune.
      statsRpcPages('get_quiz_starts_daily_par_quiz', { p_days: joursCharges, p_tz: fuseau() })
        .then(function (jours) {
          if (!Array.isArray(jours) || jours.error) return;
          var idx = {};
          jours.forEach(function (r) {
            var slug = canon(r.quiz_slug), k = rowDateKey(r);
            if (!slug || !k) return;
            if (!idx[slug]) idx[slug] = {};
            idx[slug][k] = (idx[slug][k] || 0) + rowTotal(r);
          });
          // Le 21 août 2026 est un jour partiel : la mesure des lancés a été
          // mise en service en cours de journée, alors que les complétions y
          // comptent depuis minuit. On retire ce jour-là à la source, pour
          // que courbes, sommes de période et taux en héritent tous, et on
          // corrige d'autant les totaux déjà affichés. La date est en dur :
          // c'est un fait historique, pas le premier jour de la fenêtre
          // chargée, qui finira par ne plus remonter jusque-là.
          var JOUR_PARTIEL = '2026-08-21';
          var retirePartiel = 0;
          Object.keys(idx).forEach(function (slug) {
            var v = idx[slug][JOUR_PARTIEL];
            if (v) {
              retirePartiel += v;
              if (statsLances && statsLances[slug] != null) statsLances[slug] = Math.max(0, statsLances[slug] - v);
            }
            delete idx[slug][JOUR_PARTIEL];
          });
          if (retirePartiel && elTotal && elTotal.textContent !== '—') {
            var totalBrut = parseInt(elTotal.textContent.replace(/\D/g, ''), 10);
            if (!isNaN(totalBrut)) elTotal.textContent = Math.max(0, totalBrut - retirePartiel).toLocaleString('fr-FR');
          }
          statsLancesParJour = idx;
          renderStatsList();
          if (_lastTotalSeries) renderTotalDaily(_lastTotalSeries);
          if (statsSelectedSlug) loadDaily(statsSelectedSlug);
        }).catch(function () {});
    }).catch(function () {
      // Migration pas encore appliquee : on le dit, on ne montre pas un zero
      // qui ressemblerait a une absence de trafic.
      statsLances = null;
      if (elTotal) elTotal.textContent = '—';
      var aide = document.getElementById('admin-stats-mesure-aide');
      if (aide) aide.textContent = 'Les lancés ne sont pas encore disponibles : la migration quiz_starts n\'est pas appliquée.';
      renderStatsList();
    });
  }

  // ── Fenetre commune aux deux mesures ────────────────────────────────
  // quiz_completions tourne depuis des mois, quiz_starts depuis sa mise en
  // service. Un rapport pris sur toute l'histoire de chacune compare des
  // milliers de parties finies a quelques dizaines de parties lancees, et
  // sort un pourcentage a quatre chiffres. Le taux n'a de sens que sur la
  // periode ou les deux comptent : depuis le premier lancement enregistre.
  // Seuil pour la COURBE de taux d'une page seulement : un point calcule sur
  // deux ou trois lancements saute dans tous les sens et rend le trace
  // illisible. Le tableau, lui, n'a plus de seuil : les deux nombres y sont
  // affiches a cote du rapport, chacun juge de l'echantillon.
  var MINI_PAGE = 5;

  // Debut de la fenetre : le premier jour COMPLET de mesure. Le jour partiel
  // de mise en service (21 aout) est deja retire de la serie a la source,
  // dans chargeLancements : le plus ancien jour restant est donc plein.
  function debutFenetre() {
    if (!statsLancesParJour) return null;
    var min = null;
    Object.keys(statsLancesParJour).forEach(function (slug) {
      Object.keys(statsLancesParJour[slug]).forEach(function (j) {
        if (statsLancesParJour[slug][j] > 0 && (min === null || j < min)) min = j;
      });
    });
    return min;
  }

  // Somme des deux compteurs d'une page sur la fenetre commune. Retourne null
  // tant que l'une des deux series manque : mieux vaut un tiret qu'un chiffre
  // faux.
  function comptesFenetre(slug) {
    var depuis = debutFenetre();
    if (!depuis || !statsParJour) return null;
    var l = statsLancesParJour[slug] || {}, f = statsParJour[slug] || {};
    var lances = 0, finis = 0;
    Object.keys(l).forEach(function (j) { if (j >= depuis) lances += l[j]; });
    Object.keys(f).forEach(function (j) { if (j >= depuis) finis += f[j]; });
    return { lances: lances, finis: finis, depuis: depuis };
  }

  // Une partie commencee avant la mise en service et finie apres compte comme
  // finie sans lancement : sur une fenetre courte, ca peut depasser 100 %. On
  // plafonne, un taux de finition ne peut pas etre superieur a un.
  function tauxDepuis(lances, finis) {
    if (!lances) return null;
    return Math.min(100, Math.round((finis / lances) * 100));
  }

  // « 2026-08-21 » devient « 21 août ».
  function jourCourt(iso) {
    var d = new Date(iso + 'T12:00:00Z');
    return isNaN(d.getTime()) ? iso : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  }

  // ── Series quotidiennes par quiz : compteur du jour + tops / flops ──
  // 62 jours couvrent la comparaison la plus large (30 jours contre les 30
  // precedents) avec une marge pour le decalage de fuseau.
  function chargeParJour(jours) {
    jours = jours || joursCharges;
    joursCharges = jours;
    var tz = fuseau();
    statsRpcPages('get_quiz_daily_par_quiz', { p_days: jours, p_tz: tz }).then(function (rows) {
      if (Array.isArray(rows) && !rows.error) { indexeParJour(rows, false); return; }
      throw new Error('pas de rpc');
    }).catch(function () {
      // La fonction groupee n'est peut-etre pas encore deployee : on retombe
      // sur un appel par quiz, comme le fait deja la courbe totale.
      var slugs = statsCounts.map(function (r) { return r.quiz_slug; });
      if (slugs.length === 0) { indexeParJour([], false); return; }
      Promise.all(slugs.map(function (s) {
        return statsRpc('get_quiz_daily', { p_slug: s, p_days: jours, p_tz: tz })
          .then(function (r) { return Array.isArray(r) && !r.error ? r : null; })
          .catch(function () { return null; })
          .then(function (r) {
            if (r) return { slug: s, rows: r, utc: false };
            return statsRpc('get_quiz_daily', { p_slug: s, p_days: jours })
              .then(function (r2) { return { slug: s, rows: Array.isArray(r2) ? r2 : [], utc: true }; })
              .catch(function () { return { slug: s, rows: [], utc: false }; });
          });
      })).then(function (tous) {
        var plates = [], enUTC = false;
        tous.forEach(function (t) {
          if (t.utc) enUTC = true;
          t.rows.forEach(function (r) {
            plates.push({ quiz_slug: t.slug, day: rowDateKey(r), total: rowTotal(r) });
          });
        });
        indexeParJour(plates, enUTC);
      });
    });
  }
  function indexeParJour(rows, enUTC) {
    statsParJour = {};
    statsParJourUTC = enUTC;
    (rows || []).forEach(function (r) {
      var slug = canon(r.quiz_slug), k = rowDateKey(r);
      if (!slug || !k) return;
      if (!statsParJour[slug]) statsParJour[slug] = {};
      statsParJour[slug][k] = (statsParJour[slug][k] || 0) + rowTotal(r);
    });
    renderStatsList();
    renderMovers();
    // Les trois blocs de tete et la courbe du taux se calculent sur cette
    // serie : tant qu'elle n'etait pas la, le taux du jour affichait « lances
    // pas encore mesures ». Le rafraichissement n'etait declenche que par
    // l'arrivee des lancements, et l'ordre des deux reponses n'est pas
    // garanti : depuis que les completions se chargent en deux requetes, ce
    // sont elles qui arrivent en dernier et le taux restait vide. Chaque
    // serie redessine donc l'autre a son arrivee.
    if (_lastTotalSeries) renderTotalDaily(_lastTotalSeries);
    if (statsSelectedSlug) loadDaily(statsSelectedSlug);
  }
  // Cle AAAA-MM-JJ du jour situe n jours avant aujourd'hui, dans le meme
  // decoupage (local ou UTC) que les series recues.
  function isoNJoursAvant(n) {
    var d = new Date();
    if (statsParJourUTC) d.setUTCHours(0, 0, 0, 0); else d.setHours(0, 0, 0, 0);
    d = new Date(d.getTime() - n * 86400000);
    var an = statsParJourUTC ? d.getUTCFullYear() : d.getFullYear();
    var mo = (statsParJourUTC ? d.getUTCMonth() : d.getMonth()) + 1;
    var jo = statsParJourUTC ? d.getUTCDate() : d.getDate();
    return an + '-' + String(mo).padStart(2, '0') + '-' + String(jo).padStart(2, '0');
  }
  function parJourDuQuiz(slug) { return (statsParJour && statsParJour[slug]) || {}; }
  function sommeFenetre(slug, de, a) {
    var m = parJourDuQuiz(slug), t = 0;
    for (var i = de; i <= a; i++) t += m[isoNJoursAvant(i)] || 0;
    return t;
  }
  function comptagesDuJour(slug) { return parJourDuQuiz(slug)[isoNJoursAvant(0)] || 0; }

  function renderMovers() {
    var hausseEl = document.getElementById('admin-movers-hausse');
    var baisseEl = document.getElementById('admin-movers-baisse');
    if (!hausseEl || !baisseEl) return;
    if (!statsParJour) {
      hausseEl.innerHTML = baisseEl.innerHTML = '<p class="stats-movers-vide">Chargement...</p>';
      return;
    }
    // Fenetres selon le filtre : aujourd'hui vs hier, 7 derniers jours vs
    // les 7 precedents, 30 derniers vs les 30 precedents.
    var n = statsComp;
    var lignes = statsCounts.map(function (r) {
      var slug = r.quiz_slug;
      var actuel = sommeFenetre(slug, 0, n - 1);
      var avant = sommeFenetre(slug, n, 2 * n - 1);
      return { slug: slug, actuel: actuel, avant: avant, delta: actuel - avant };
    });
    function ligne(x) {
      var cls = x.delta > 0 ? 'est-plus' : 'est-moins';
      var badge;
      if (x.avant === 0 && x.actuel > 0) badge = 'nouveau';
      else {
        var pct = Math.round((x.delta / x.avant) * 100);
        badge = (x.delta > 0 ? '+' : '') + x.delta + ' (' + (pct > 0 ? '+' : '') + pct + ' %)';
      }
      return '<div class="stats-mover" title="' + esc(x.slug) + '">'
        + '<span class="stats-mover-nom">' + esc(nomQuiz(x.slug)) + '</span>'
        + '<span class="stats-mover-vals">' + x.avant.toLocaleString('fr-FR') + ' → ' + x.actuel.toLocaleString('fr-FR') + '</span>'
        + '<span class="stats-mover-delta ' + cls + '">' + badge + '</span>'
        + '</div>';
    }
    var hausses = lignes.filter(function (x) { return x.delta > 0; })
      .sort(function (a, b) { return b.delta - a.delta || b.actuel - a.actuel; }).slice(0, 5);
    var baisses = lignes.filter(function (x) { return x.delta < 0; })
      .sort(function (a, b) { return a.delta - b.delta || b.avant - a.avant; }).slice(0, 5);
    hausseEl.innerHTML = hausses.length ? hausses.map(ligne).join('')
      : '<p class="stats-movers-vide">Rien en hausse sur la période.</p>';
    baisseEl.innerHTML = baisses.length ? baisses.map(ligne).join('')
      : '<p class="stats-movers-vide">Rien en baisse sur la période. 🎉</p>';
  }

  // Total completions per day. Prefer the dedicated RPC; if it is missing
  // (not created yet) fall back to summing the per-quiz daily series.
  // Le fuseau de la personne qui regarde. La base groupe les completions par
  // jour ; sans cette information elle le fait en UTC, et le graphique compare
  // alors des jours UTC a des colonnes construites en heure locale. En France
  // l'ete, entre minuit et deux heures, la colonne du jour affichait donc zero
  // pendant que la barre de la veille absorbait la soiree en cours.
  function fuseau() {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; }
    catch (e) { return 'UTC'; }
  }

  function loadTotalDaily(days) {
    var cv = document.getElementById('admin-stats-total-chart');
    drawLineChart(cv, null, { loading: true });
    var tz = fuseau();
    statsRpc('get_quiz_daily_total', { p_days: days, p_tz: tz }).then(function (rows) {
      if (Array.isArray(rows) && !rows.error) { renderTotalDaily(buildSeries(rows, days)); return; }
      throw new Error('no rpc');
    }).catch(function () {
      // La fonction avec fuseau n'est peut-etre pas encore deployee : on
      // retente sans, et les jours recus sont alors des jours UTC.
      return statsRpc('get_quiz_daily_total', { p_days: days }).then(function (rows) {
        if (Array.isArray(rows) && !rows.error) { renderTotalDaily(buildSeries(rows, days, true)); return; }
        throw new Error('no rpc');
      });
    }).catch(function () {
      // Dernier recours : on additionne la courbe de chaque quiz.
      var slugs = statsCounts.map(function (r) { return r.quiz_slug; });
      if (slugs.length === 0) { renderTotalDaily(buildSeries([], days)); return; }
      Promise.all(slugs.map(function (s) {
        return statsRpc('get_quiz_daily', { p_slug: s, p_days: days, p_tz: tz })
          .then(function (r) { return Array.isArray(r) && !r.error ? r : null; })
          .catch(function () { return null; })
          .then(function (r) {
            if (r) return r;
            return statsRpc('get_quiz_daily', { p_slug: s, p_days: days })
              .then(function (r2) { return Array.isArray(r2) ? r2 : []; }).catch(function () { return []; });
          });
      })).then(function (all) {
        var merged = [];
        all.forEach(function (rows) { if (Array.isArray(rows)) merged = merged.concat(rows); });
        renderTotalDaily(buildSeries(merged, days));
      });
    });
  }
  // ── Les trois courbes du graphique principal ────────────────────────
  // Lancés en bleu, terminés en rose, taux de finition en orange sur l'axe de
  // droite. Chacune se masque d'un clic sur sa vignette, comme les mesures de
  // la Search Console, et l'infobulle donne les trois valeurs du jour survolé.
  var COURBES = [
    { cle: 'lances', nom: 'Lancés',           couleur: '#3B82F6', axe: 'gauche', unite: '' },
    { cle: 'finis',  nom: 'Terminés',         couleur: '#EF4E88', axe: 'gauche', unite: '' },
    { cle: 'ratio',  nom: 'Taux de finition', couleur: '#F59E0B', axe: 'droite', unite: ' %' }
  ];
  // La couleur d'une serie vit dans css/admin.css (--adm-s-<cle>), en clair et
  // en sombre ; le script la lit au moment de dessiner. Le repli sert si la
  // feuille n'est pas chargee. Toujours un hexadecimal : le degrade sous la
  // courbe colle un suffixe d'opacite a la couleur.
  var TEINTES = { lances: 'lances', finis: 'finis', ratio: 'taux', visites: 'visites', vues: 'vues', pied: 'pied', blog: 'blog' };
  function teinte(cle, repli) {
    var app = document.getElementById('admin-app');
    var v = app ? getComputedStyle(app).getPropertyValue('--adm-s-' + (TEINTES[cle] || cle)).trim() : '';
    return /^#[0-9a-fA-F]{6}$/.test(v) ? v : repli;
  }
  // Une mini-courbe des derniers jours dans une tuile : le trait, un voile
  // dessous et le point du jour. Rien d'autre, la tuile porte deja le chiffre.
  function sparkline(id, valeurs) {
    var svg = document.getElementById(id);
    if (!svg) return;
    var v = (valeurs || []).map(function (x) { return (x === null || x === undefined) ? null : Number(x); });
    var connus = v.filter(function (x) { return x !== null && !isNaN(x); });
    if (connus.length < 2) { svg.classList.add('est-vide'); svg.innerHTML = ''; return; }
    var W = 124, H = 42, pad = 3;
    var max = Math.max.apply(null, connus), min = Math.min.apply(null, connus);
    if (max === min) { max = min + 1; }
    var n = v.length;
    var pts = [];
    v.forEach(function (x, i) {
      if (x === null || isNaN(x)) return;
      pts.push([pad + (i / (n - 1)) * (W - 2 * pad), H - pad - ((x - min) / (max - min)) * (H - 2 * pad - 4)]);
    });
    var d = pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' ');
    var aire = d + ' L' + pts[pts.length - 1][0].toFixed(1) + ' ' + (H - 1) + ' L' + pts[0][0].toFixed(1) + ' ' + (H - 1) + ' Z';
    var fin = pts[pts.length - 1];
    svg.innerHTML = '<path class="adm-spark-aire" d="' + aire + '"/><path d="' + d + '"/>'
      + '<circle cx="' + fin[0].toFixed(1) + '" cy="' + fin[1].toFixed(1) + '" r="3"/>';
    svg.classList.remove('est-vide');
  }
  // Le delta du jour par rapport a hier, en etiquette a cote du chiffre.
  function etiquetteDelta(id, aujourdhui, hier, libelle) {
    var el = document.getElementById(id);
    if (!el) return;
    if (aujourdhui === null || hier === null || aujourdhui === undefined || hier === undefined) { el.classList.add('hidden'); return; }
    var d = aujourdhui - hier;
    el.classList.remove('hidden', 'est-plus', 'est-moins');
    if (d > 0) el.classList.add('est-plus'); else if (d < 0) el.classList.add('est-moins');
    el.textContent = (d > 0 ? '+' : '') + d.toLocaleString('fr-FR') + ' ' + (libelle || 'vs hier');
    el.title = (libelle ? 'Période précédente : ' : 'Hier : ') + hier.toLocaleString('fr-FR');
  }
  var courbesVisibles = { lances: true, finis: true, ratio: true };

  // Total des lancements du jour, toutes pages confondues. null avant la mise
  // en service : la courbe s'interrompt au lieu de descendre a zero.
  function lancesDuJour(iso, horsImmediat) {
    if (!statsLancesParJour) return null;
    var depuis = null, total = 0, vu = false;
    Object.keys(statsLancesParJour).forEach(function (slug) {
      Object.keys(statsLancesParJour[slug]).forEach(function (j) {
        if (statsLancesParJour[slug][j] > 0 && (depuis === null || j < depuis)) depuis = j;
      });
    });
    if (depuis === null || iso < depuis) return null;
    Object.keys(statsLancesParJour).forEach(function (slug) {
      if (horsImmediat && !dansMoyenne(slug)) return;
      var v = statsLancesParJour[slug][iso];
      if (v != null) { total += v; vu = true; }
    });
    return vu || iso >= depuis ? total : null;
  }

  // Somme des parties finies d'un jour, en excluant les pages hors moyenne.
  // Elle se prend sur les series par page et non sur la courbe totale, qui
  // est un agregat deja fondu et donc indecomposable.
  function finisDuJourHorsImmediat(iso) {
    if (!statsParJour) return null;
    var total = 0;
    Object.keys(statsParJour).forEach(function (slug) {
      if (!dansMoyenne(slug)) return;
      total += statsParJour[slug][iso] || 0;
    });
    return total;
  }

  function construitCourbes(series) {
    var lances = series.map(function (p) {
      var iso = p.date.getFullYear() + '-' + String(p.date.getMonth() + 1).padStart(2, '0') + '-' + String(p.date.getDate()).padStart(2, '0');
      return { date: p.date, label: p.label, total: lancesDuJour(iso) };
    });
    // Le taux ecarte les pages a resultat immediat des deux cotes. La courbe
    // bleue et la rose, elles, gardent tout : ce sont des volumes.
    var ratio = series.map(function (p) {
      var iso = p.date.getFullYear() + '-' + String(p.date.getMonth() + 1).padStart(2, '0') + '-' + String(p.date.getDate()).padStart(2, '0');
      var l = statsLancesParJour ? lancesDuJour(iso, true) : null;
      var f = finisDuJourHorsImmediat(iso);
      if (l === null || l === 0 || f === null) return { date: p.date, label: p.label, total: null };
      return { date: p.date, label: p.label, total: Math.min(100, Math.round((f / l) * 100)) };
    });
    var par = { lances: lances, finis: series, ratio: ratio };
    return COURBES.map(function (c) {
      return { cle: c.cle, nom: c.nom, couleur: teinte(c.cle, c.couleur), axe: c.axe, unite: c.unite,
               visible: courbesVisibles[c.cle], points: par[c.cle] };
    });
  }

  function renderLegende(couches) {
    var el = document.getElementById('admin-stats-legende');
    if (!el) return;
    el.innerHTML = couches.map(function (c) {
      // Le chiffre de la vignette : somme sur la periode pour les volumes,
      // taux d'ensemble pour le ratio (et pas la moyenne des taux journaliers,
      // qui donnerait autant de poids a un jour creux qu'a un jour charge).
      var valeur = '—';
      var connus = c.points.filter(function (p) { return p.total !== null && p.total !== undefined; });
      if (connus.length) {
        if (c.cle === 'ratio') {
          var lc = couches.filter(function (x) { return x.cle === 'lances'; })[0];
          var fc = couches.filter(function (x) { return x.cle === 'finis'; })[0];
          // Somme des deux compteurs hors pages a resultat immediat, sur les
          // jours ou le taux existe. Une moyenne des taux journaliers
          // donnerait autant de poids a un jour creux qu'a un jour charge.
          var sl = 0, sf = 0;
          c.points.forEach(function (p, i) {
            if (p.total === null || p.total === undefined) return;
            var iso = p.date.getFullYear() + '-' + String(p.date.getMonth() + 1).padStart(2, '0') + '-' + String(p.date.getDate()).padStart(2, '0');
            sl += lancesDuJour(iso, true) || 0;
            sf += finisDuJourHorsImmediat(iso) || 0;
          });
          void lc; void fc;
          valeur = sl ? Math.min(100, Math.round((sf / sl) * 100)) + ' %' : '—';
        } else {
          valeur = connus.reduce(function (a, p) { return a + p.total; }, 0).toLocaleString('fr-FR');
        }
      }
      return '<button type="button" class="stats-leg' + (c.visible ? '' : ' est-eteinte') + '"'
        + ' style="--leg:' + c.couleur + '" data-courbe="' + c.cle + '"'
        + ' aria-pressed="' + (c.visible ? 'true' : 'false') + '">'
        + '<span class="stats-leg-nom"><span class="stats-leg-puce"></span>' + esc(c.nom) + '</span>'
        + '<span class="stats-leg-val">' + valeur + '</span>'
        + '</button>';
    }).join('');
    el.querySelectorAll('.stats-leg').forEach(function (b) {
      b.addEventListener('click', function () {
        var cle = this.dataset.courbe;
        // Toujours au moins une courbe : un graphique vide n'apprend rien.
        var restantes = Object.keys(courbesVisibles).filter(function (k) { return courbesVisibles[k]; });
        if (courbesVisibles[cle] && restantes.length === 1) return;
        courbesVisibles[cle] = !courbesVisibles[cle];
        if (_lastTotalSeries) renderTotalDaily(_lastTotalSeries);
      });
    });
  }

  // Les trois blocs de tete : lances du jour, ratio du jour, finis du jour.
  // Le ratio du jour se lit sur la journee en cours uniquement, donc sans la
  // fenetre commune des taux par page : les deux compteurs portent bien sur
  // les memes heures. Il reste plafonne a 100, une partie commencee hier et
  // finie aujourd'hui comptant comme finie sans lancement du jour.
  function majTetes(series) {
    var finisJour = series.length ? series[series.length - 1].total : 0;
    var elFJ = document.getElementById('admin-finis-jour');
    if (elFJ) elFJ.textContent = finisJour.toLocaleString('fr-FR');

    var jour = isoNJoursAvant(0);
    var lancesJour = statsLancesParJour ? lancesDuJour(jour) : null;
    var elLJ = document.getElementById('admin-lances-jour');
    if (elLJ) elLJ.textContent = lancesJour === null ? '—' : lancesJour.toLocaleString('fr-FR');

    // Le ratio ecarte les pages a resultat immediat, des deux cotes du
    // rapport. Les deux compteurs au-dessus, eux, comptent tout : ce sont des
    // volumes, pas une mesure d'engagement.
    var lancesRatio = statsLancesParJour ? lancesDuJour(jour, true) : null;
    var finisRatio = finisDuJourHorsImmediat(jour);
    var elR = document.getElementById('admin-ratio-jour');
    var elRD = document.getElementById('admin-ratio-detail');
    if (elR) {
      if (lancesRatio === null || finisRatio === null || lancesRatio === 0) {
        elR.textContent = '—';
        if (elRD) elRD.textContent = lancesRatio === 0 ? 'aucune partie lancée aujourd\'hui' : 'lancés pas encore mesurés';
      } else {
        var pct = Math.min(100, Math.round((finisRatio / lancesRatio) * 100));
        elR.textContent = pct + ' %';
        if (elRD) elRD.textContent = finisRatio.toLocaleString('fr-FR') + ' finis sur ' + lancesRatio.toLocaleString('fr-FR') + ' lancés, hors résultats immédiats et jeux sans fin de partie';
      }
    }
  }

  // Les quatorze derniers jours en mini-courbe dans chaque tuile, et le delta
  // du jour par rapport a hier a cote du chiffre.
  function majTuiles(series) {
    var n = series.length;
    var finis = series.slice(-14).map(function (p) { return p.total; });
    var lances = series.slice(-14).map(function (p) {
      var iso = p.date.getFullYear() + '-' + String(p.date.getMonth() + 1).padStart(2, '0') + '-' + String(p.date.getDate()).padStart(2, '0');
      return lancesDuJour(iso);
    });
    sparkline('adm-spark-finis', finis);
    sparkline('adm-spark-lances', lances);
    etiquetteDelta('adm-delta-finis', n ? series[n - 1].total : null, n > 1 ? series[n - 2].total : null);
    var jour = isoNJoursAvant(0), hier = isoNJoursAvant(1);
    etiquetteDelta('adm-delta-lances', statsLancesParJour ? lancesDuJour(jour) : null, statsLancesParJour ? lancesDuJour(hier) : null);
  }

  function renderTotalDaily(series) {
    majTetes(series);
    majTuiles(series);
    _lastTotalSeries = series;
    var couches = construitCourbes(series);
    renderLegende(couches);
    _lastTotalCouches = couches;
    drawChart(document.getElementById('admin-stats-total-chart'), couches, {});
  }

  // ── Liste par page, rangee par famille ──
  // Trois mesures possibles : les parties lancees, celles qui sont allees au
  // bout, et le rapport des deux. Le ratio est le seul qui reponde a « quelle
  // page decroche » ; les deux autres servent a le lire sans se tromper de
  // volume, d'ou le second nombre garde en gris a cote.
  // Somme d'une serie quotidienne sur les n derniers jours, aujourd'hui
  // compris. n = 1 donne la seule journee en cours.
  function sommePeriode(parJour, slug, n) {
    var m = parJour && parJour[slug];
    if (!m) return 0;
    var total = 0;
    for (var i = 0; i < n; i++) total += m[isoNJoursAvant(i)] || 0;
    return total;
  }

  // Les deux compteurs d'une page sur la periode selectionnee. Periode 0 :
  // les totaux de toute l'histoire, qui viennent des RPC de comptage et non
  // des series, faute de quoi on perdrait ce qui precede la fenetre chargee.
  function comptesPeriode(slug, terminesTotal) {
    if (statsPeriode === 0) {
      return { finis: terminesTotal, lances: statsLances ? (statsLances[slug] || 0) : 0, complet: true };
    }
    return {
      finis: sommePeriode(statsParJour, slug, statsPeriode),
      lances: statsLancesParJour ? sommePeriode(statsLancesParJour, slug, statsPeriode) : 0,
      complet: !!statsParJour
    };
  }

  // Ce qui s'est ajoute aujourd'hui, page par page. Affiche en petit a cote
  // de chaque chiffre : le cumul dit ou en est la page, le delta dit si elle
  // vit encore.
  function duJour(slug) {
    var j = isoNJoursAvant(0);
    var finis = statsParJour && statsParJour[slug] ? (statsParJour[slug][j] || 0) : 0;
    var lances = statsLancesParJour && statsLancesParJour[slug] ? (statsLancesParJour[slug][j] || 0) : 0;
    return { finis: finis, lances: lances, ratio: lances ? Math.min(100, Math.round((finis / lances) * 100)) : null };
  }

  // ── Pages dont les fins de partie n'arrivent jamais dans la serie ──
  // Le compteur general (get_quiz_counts) connait des parties terminees pour
  // cette page, mais la serie quotidienne n'en voit aucune, aucun jour, quelle
  // que soit la fenetre demandee. Le rapport finis/lances y vaut donc
  // mecaniquement zero, meme avec quatre-vingt-dix lancements dans la semaine.
  // Ce zero decrit un defaut de mesure, pas une page que personne ne termine :
  // l'afficher accuse la page a la place de la mesure. On preferre un tiret.
  //
  // La serie vide dans son ensemble ne prouve rien : tant qu'elle n'est pas
  // chargee, aucune page n'est declaree aveugle.
  function serieAveugle(slug, terminesTotal) {
    if (!terminesTotal || !statsParJour) return false;
    var vue = false;
    for (var k in statsParJour) { if (Object.prototype.hasOwnProperty.call(statsParJour, k)) { vue = true; break; } }
    if (!vue) return false;
    var m = statsParJour[canon(slug)];
    if (!m) return true;
    for (var j in m) if (Object.prototype.hasOwnProperty.call(m, j) && m[j]) return false;
    return true;
  }
  var MOTIF_AVEUGLE = 'fins de partie absentes de la série';

  // Les trois chiffres d'une page sur la periode choisie, prets a afficher.
  // Le ratio vaut null quand il ne veut rien dire : page a resultat immediat,
  // ou trop peu de lancements pour conclure.
  function troisValeurs(slug, terminesTotal) {
    var c = comptesPeriode(slug, terminesTotal);
    var res = { lances: c.lances, finis: c.finis, ratio: null, motif: '' };
    if (sansRatio(slug)) { res.motif = SANS_RATIO[canon(slug)]; return res; }
    if (serieAveugle(slug, terminesTotal)) { res.motif = MOTIF_AVEUGLE; return res; }
    // Sur toute l'histoire, le rapport melangerait des mois de completions et
    // quelques heures de lancements : on borne a la fenetre commune. Sur une
    // periode choisie, les deux series couvrent deja les memes jours.
    var d = statsPeriode === 0 ? comptesFenetre(slug) : c;
    // Plus de seuil minimum : les deux nombres sont affiches juste a cote,
    // donc masquer le rapport n'apprend rien de plus a personne. 2 finis sur
    // 2 lances, ca fait 100 %, et la colonne « Lancés » dit assez que
    // l'echantillon est mince.
    if (!d || !d.lances) {
      // Sur « Tout », une page qui a bien des lancements mais aucun dans la
      // fenetre commune n'est pas une page sans lancement : c'est la mesure
      // qui est trop jeune pour que le rapport ait un sens.
      res.motif = (statsPeriode === 0 && c.lances > 0) ? 'mesure des lancés trop récente' : 'aucun lancé';
      return res;
    }
    res.ratio = tauxDepuis(d.lances, d.finis);
    res.ratioFinis = d.finis;
    res.ratioLances = d.lances;
    return res;
  }

  function classeRatio(pct) {
    return pct < 40 ? ' est-faible' : (pct >= 70 ? ' est-fort' : '');
  }

  // Une valeur absente se range toujours en fin de liste, quel que soit le
  // sens : un tiret n'est ni grand ni petit.
  function cleTri(v) {
    var x = v[statsTri.col];
    return (x === null || x === undefined) ? null : x;
  }

  var COLONNES = [
    { cle: 'lances', nom: 'Lancés', couleur: 'hsl(217 91% 52%)' },
    { cle: 'finis',  nom: 'Finis',  couleur: 'hsl(338 72% 52%)' },
    { cle: 'ratio',  nom: 'Ratio',  couleur: 'hsl(38 92% 45%)' }
  ];

  function renderStatsList() {
    var listEl = document.getElementById('admin-stats-list');
    if (!listEl) return;
    if (statsCounts.length === 0) { listEl.innerHTML = '<p class="text-center text-muted-foreground py-6">Aucune complétion pour le moment.</p>'; return; }

    var lignes = statsCounts.map(function (r) {
      return { slug: r.quiz_slug, famille: familleQuiz(r.quiz_slug), v: troisValeurs(r.quiz_slug, Number(r.total) || 0) };
    }).filter(function (l) {
      // Une page sans la moindre partie sur la periode choisie n'est pas de
      // cette periode : elle sortait une ligne a zero partout et faussait le
      // « N pages » de sa famille.
      return l.v.lances > 0 || l.v.finis > 0;
    });
    if (lignes.length === 0) {
      listEl.innerHTML = '<p class="text-center text-muted-foreground py-6">Aucune partie sur cette période.</p>';
      return;
    }

    // Le fond des lignes suit la colonne de tri : classer par ratio dessine
    // les ratios, classer par volume dessine les volumes. L'echelle est
    // commune a toutes les familles pour qu'elles restent comparables.
    var maxGlobal = 1;
    if (statsTri.col !== 'ratio') {
      lignes.forEach(function (l) { if (l.v[statsTri.col] > maxGlobal) maxGlobal = l.v[statsTri.col]; });
    }

    // Sur « Tout », les finis portent des mois d'historique que les lances
    // n'ont pas encore. Les deux colonnes ne parlent alors pas de la meme
    // periode, et le ratio ne peut pas se calculer : on le dit une fois, au
    // lieu de laisser quarante tirets sans explication.
    var html = '';
    if (statsPeriode === 0 && lignes.some(function (l) { return l.v.motif === 'mesure des lancés trop récente'; })) {
      var depuis = debutFenetre();
      html += '<p class="stats-avis">Sur « Tout », les finis remontent à des mois que les lancés n\'ont pas encore : les deux colonnes ne couvrent pas la même période, et le ratio ne peut pas se calculer. '
        + (depuis ? 'Il apparaîtra à partir du ' + jourCourt(depuis) + '. ' : '')
        + 'Choisissez une période pour comparer ce qui est comparable.</p>';
    }
    // Une page aveugle ne se voit pas dans la liste : sa colonne Finis affiche
    // un zero comme une page qui vient d'ouvrir. On la nomme donc en clair,
    // sinon le tiret du ratio passe pour un oubli.
    var aveugles = lignes.filter(function (l) { return l.v.motif === MOTIF_AVEUGLE; });
    if (aveugles.length) {
      html += '<p class="stats-avis">'
        + (aveugles.length === 1
            ? 'Une page compte des parties terminées au total, mais aucune n\'apparaît dans la série quotidienne : '
            : aveugles.length + ' pages comptent des parties terminées au total, mais aucune n\'apparaît dans la série quotidienne : ')
        + esc(aveugles.map(function (l) { return nomQuiz(l.slug); }).join(', '))
        + '. Leur ratio vaudrait zéro quel que soit le nombre de lancés, il n\'est donc pas affiché.</p>';
    }
    html += '<div class="stats-entetes">'
      + '<span class="stats-entete-nom">Page</span>'
      + COLONNES.map(function (c) {
          var actif = statsTri.col === c.cle;
          var fleche = !actif ? '⇅' : (statsTri.sens === -1 ? '▼' : '▲');
          // Sur « Tout », la colonne des lancés ne couvre pas des mois comme
          // celle des finis : on date sa mesure dans l'en-tête, sinon une
          // vieille page à 12 finis pour 0 lancé ressemble à un bug.
          var note = (c.cle === 'lances' && statsPeriode === 0 && debutFenetre())
            ? '<span class="stats-tri-note">dep. ' + esc(jourCourt(debutFenetre())) + '</span>' : '';
          return '<button type="button" class="stats-tri' + (actif ? ' est-actif' : '') + '"'
            + ' style="--col:' + c.couleur + '" data-tri="' + c.cle + '"'
            + ' aria-label="Trier par ' + c.nom + (actif && statsTri.sens === -1 ? ', décroissant' : ', croissant') + '">'
            + c.nom + '<span class="stats-tri-fleche" aria-hidden="true">' + fleche + '</span>' + note + '</button>';
        }).join('')
      + '</div>';

    ['test', 'quiz', 'jeu'].forEach(function (fam) {
      var groupe = lignes.filter(function (l) { return l.famille === fam; }).sort(function (a, b) {
        var x = cleTri(a.v), y = cleTri(b.v);
        if (x === null && y === null) return 0;
        if (x === null) return 1;   // les valeurs absentes finissent en bas
        if (y === null) return -1;
        return (x - y) * statsTri.sens;
      });
      if (groupe.length === 0) return;
      var totalFam = groupe.reduce(function (acc, l) { return acc + l.v.finis; }, 0);
      html += '<div class="stats-groupe stats-fam-' + fam + '">'
        + '<div class="stats-groupe-tete">'
        + '<span class="stats-groupe-pastille" aria-hidden="true"></span>'
        + '<span class="stats-groupe-nom">' + LIBELLE_FAMILLE[fam] + '</span>'
        + '<span class="stats-groupe-compte">' + groupe.length + ' page' + (groupe.length > 1 ? 's' : '')
        + ' · ' + totalFam.toLocaleString('fr-FR') + ' finis</span>'
        + '</div>';
      html += groupe.map(function (l) {
        var base = statsTri.col === 'ratio' ? (l.v.ratio || 0) : l.v[statsTri.col];
        var pct = statsTri.col === 'ratio'
          ? Math.max(0, Math.min(100, base))
          : Math.round((Math.max(0, base) / maxGlobal) * 100);
        // Le delta du jour, en tout petit sous chaque chiffre. Rien ne
        // s'affiche quand il ne s'est rien passe : un « +0 » repete trois
        // fois sur quarante lignes, ca fait cent vingt fois rien a lire.
        var j = duJour(l.slug);
        var delta = function (n, suffixe) {
          return n ? '<span class="stats-cell-jour" title="Aujourd\'hui">+' + n.toLocaleString('fr-FR') + (suffixe || '') + '</span>' : '';
        };
        var ratioCell = l.v.ratio === null
          ? '<span class="stats-cell stats-cell--ratio est-vide">—</span>'
          : '<span class="stats-cell stats-cell--ratio' + classeRatio(l.v.ratio) + '">' + l.v.ratio + ' %'
            + (j.ratio !== null && !sansRatio(l.slug) ? '<span class="stats-cell-jour" title="Taux du jour">' + j.ratio + ' %</span>' : '')
            + '</span>';
        var bulle = nomQuiz(l.slug) + ' · ' + l.slug
          + (l.v.ratio === null ? ' · ' + l.v.motif
             : ' · ' + l.v.ratioFinis.toLocaleString('fr-FR') + ' finis sur ' + l.v.ratioLances.toLocaleString('fr-FR') + ' lancés');
        return '<button class="stats-row' + (l.slug === statsSelectedSlug ? ' active' : '') + '"'
          + ' style="--part:' + pct + '%" data-slug="' + esc(l.slug) + '" title="' + esc(bulle) + '">'
          + '<span class="stats-row-name">' + esc(nomQuiz(l.slug)) + '</span>'
          + '<span class="stats-cell stats-cell--lances">' + l.v.lances.toLocaleString('fr-FR') + delta(j.lances) + '</span>'
          + '<span class="stats-cell stats-cell--finis">' + l.v.finis.toLocaleString('fr-FR') + delta(j.finis) + '</span>'
          + ratioCell
          + '</button>';
      }).join('');
      html += '</div>';
    });
    listEl.innerHTML = html;

    listEl.querySelectorAll('.stats-tri').forEach(function (b) {
      b.addEventListener('click', function () {
        var col = this.dataset.tri;
        // Re-cliquer la colonne active inverse le sens ; en changer repart du
        // decroissant, qui est ce qu'on veut voir neuf fois sur dix.
        if (statsTri.col === col) statsTri.sens = -statsTri.sens;
        else { statsTri.col = col; statsTri.sens = -1; }
        var aide = document.getElementById('admin-stats-mesure-aide');
        if (aide) {
          aide.textContent = statsTri.col === 'ratio'
            ? 'Trié par taux de finition. Rouge sous 40 %, vert à partir de 70 %. Un tiret : page sans parcours à finir (résultat immédiat, jeu sans fin de partie), ou aucun lancé enregistré.'
            : 'Trié par ' + (statsTri.col === 'lances' ? 'parties lancées' : 'parties finies') + '. Cliquez une ligne pour voir sa courbe.';
        }
        renderStatsList();
        if (statsSelectedSlug) loadDaily(statsSelectedSlug);
      });
    });
    listEl.querySelectorAll('.stats-row').forEach(function (b) {
      b.addEventListener('click', function () {
        listEl.querySelectorAll('.stats-row').forEach(function (x) { x.classList.remove('active'); });
        this.classList.add('active');
        loadDaily(this.dataset.slug);
      });
    });
  }

  // ── Courbe du quiz selectionne ──
  // En mode « taux de finition », la courbe montre l'evolution du taux de
  // cette page plutot que son volume : c'est la seule vue qui repond a
  // « est-ce que ca s'ameliore depuis que j'ai raccourci ce test ? ».
  //
  // Le taux d'une seule journee saute dans tous les sens des que le volume
  // est modeste : trente lancements un jour, huit le lendemain, et la courbe
  // devient illisible. On trace donc une moyenne glissante sur sept jours,
  // taux = somme des parties finies sur la fenetre / somme des lancements sur
  // la meme fenetre. Un jour dont la fenetre porte moins de MINI_PAGE
  // lancements n'est pas trace du tout : mieux vaut une courbe qui commence
  // tard qu'un point invente.
  var FENETRE_GLISSANTE = 7;

  function serieTaux(slug) {
    if (sansRatio(slug)) return null;
    if (!statsLancesParJour || !statsParJour) return null;
    var depuis = debutFenetre();
    if (!depuis) return null;
    var l = statsLancesParJour[slug] || {}, f = statsParJour[slug] || {};
    var pts = [];
    for (var i = 61; i >= 0; i--) {
      var jour = isoNJoursAvant(i);
      if (jour < depuis) continue;
      var lances = 0, finis = 0;
      for (var k = 0; k < FENETRE_GLISSANTE; k++) {
        var j = isoNJoursAvant(i + k);
        if (j < depuis) break;
        lances += l[j] || 0;
        finis += f[j] || 0;
      }
      if (lances < MINI_PAGE) { pts.length = 0; continue; } // on repart des qu'il y a de quoi
      var d = new Date(jour + 'T12:00:00Z');
      pts.push({
        date: d,
        label: String(d.getUTCDate()).padStart(2, '0') + '/' + String(d.getUTCMonth() + 1).padStart(2, '0'),
        total: tauxDepuis(lances, finis),
        texte: tauxDepuis(lances, finis) + ' % · ' + finis + ' finis sur ' + lances + ' lancés (7 j)'
      });
    }
    return pts;
  }

  function loadDaily(slug) {
    statsSelectedSlug = slug;
    var titleEl = document.getElementById('admin-stats-chart-title');
    var cv = document.getElementById('admin-stats-chart');

    if (statsTri.col === 'ratio') {
      var pts = serieTaux(slug);
      if (titleEl) {
        titleEl.textContent = nomQuiz(slug) + ' · taux de finition, moyenne glissante 7 jours';
      }
      if (!pts || pts.length === 0) {
        _lastQuizSeries = null;
        drawLineChart(cv, [], {});
        if (titleEl) titleEl.textContent = nomQuiz(slug) + ' · taux de finition (pas encore assez de lancés)';
        return;
      }
      _lastQuizSeries = pts;
      _lastQuizOpts = { maxFixe: 100, unite: ' %' };
      drawLineChart(cv, pts, _lastQuizOpts);
      return;
    }

    _lastQuizOpts = {};
    if (titleEl) titleEl.textContent = nomQuiz(slug) + ' · ' + (statsTri.col === 'lances' ? 'lancés' : 'parties finies') + ', 30 derniers jours';
    drawLineChart(cv, null, { loading: true });
    // Meme decoupage que la courbe totale : sans fuseau, la base groupe en UTC
    // et la colonne du jour reste vide jusqu'a deux heures du matin.
    function trace(rows, enUTC) {
      _lastQuizSeries = buildSeries(Array.isArray(rows) ? rows : [], 30, enUTC);
      drawLineChart(document.getElementById('admin-stats-chart'), _lastQuizSeries, {});
    }
    var source = statsTri.col === 'lances' ? 'get_quiz_starts_daily' : 'get_quiz_daily';
    // Les lancements n'ont pas de RPC par quiz : on decoupe la serie deja
    // chargee plutot que d'ajouter un aller-retour.
    if (statsTri.col === 'lances') {
      if (!statsLancesParJour) { trace([]); return; }
      var m = statsLancesParJour[slug] || {};
      trace(Object.keys(m).map(function (j) { return { day: j, total: m[j] }; }));
      return;
    }
    statsRpc(source, { p_slug: slug, p_days: 30, p_tz: fuseau() }).then(function (rows) {
      if (Array.isArray(rows) && !rows.error) { trace(rows); return; }
      throw new Error('no rpc');
    }).catch(function () {
      return statsRpc(source, { p_slug: slug, p_days: 30 })
        .then(function (rows) { trace(rows, true); });
    }).catch(function () { trace([]); });
  }

  // ── Graphique multi-courbes ─────────────────────────────────────────
  // Une couche = { cle, nom, couleur, axe, unite, points }. Un point vaut null
  // quand la donnee n'existe pas ce jour-la : les lancements ne sont mesures
  // que depuis leur mise en service, et faire plonger la ligne a zero avant
  // serait un mensonge. La ligne s'interrompt, tout simplement.
  //
  // Deux axes : les volumes a gauche, les pourcentages a droite. Sans ca un
  // taux de 70 % ecrase une courbe de plusieurs milliers de parties.
  function drawChart(cv, couches, opts) {
    if (!cv) return;
    opts = opts || {};
    var dark = document.documentElement.classList.contains('dark');
    var app = document.getElementById('admin-app');
    var css = app ? getComputedStyle(app) : null;
    var muted = (css && css.getPropertyValue('--adm-axis').trim()) || (dark ? 'rgba(190,180,210,0.5)' : 'rgba(90,70,110,0.5)');
    var grid = (css && css.getPropertyValue('--adm-grid').trim()) || (dark ? 'rgba(200,190,220,0.12)' : 'rgba(90,70,110,0.12)');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var cssW = cv.clientWidth || 600, cssH = cv.clientHeight || 200;
    cv.width = cssW * dpr; cv.height = cssH * dpr;
    var ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);
    ctx.textBaseline = 'middle';
    ctx.font = '11px Inter, sans-serif';

    if (opts.loading) { ctx.fillStyle = muted; ctx.fillText('Chargement…', 12, cssH / 2); return; }

    var visibles = (couches || []).filter(function (c) { return c.visible !== false && c.points && c.points.length; });
    var aQuelqueChose = visibles.some(function (c) {
      return c.points.some(function (p) { return p.total !== null && p.total !== undefined && p.total !== 0; });
    });
    if (!visibles.length || !aQuelqueChose) {
      ctx.fillStyle = muted; ctx.fillText('Aucune donnée sur la période', 12, cssH / 2);
      cv._geo = null;
      return;
    }

    var aDroite = visibles.some(function (c) { return c.axe === 'droite'; });
    var padL = 46, padR = aDroite ? 46 : 14, padT = 14, padB = 26;
    var plotW = cssW - padL - padR, plotH = cssH - padT - padB;
    var n = visibles[0].points.length;

    var maxG = 1;
    visibles.forEach(function (c) {
      if (c.axe === 'droite') return;
      c.points.forEach(function (p) { if (p.total > maxG) maxG = p.total; });
    });
    var hautG = niceCeil(maxG), hautD = 100;

    var xAt = function (i) { return padL + (n === 1 ? plotW / 2 : (i / (n - 1)) * plotW); };
    function yAt(v, axe) {
      var haut = axe === 'droite' ? hautD : hautG;
      return padT + plotH - (v / haut) * plotH;
    }

    // L'axe de gauche porte les lignes de grille, celui de droite seulement
    // ses etiquettes : deux grilles superposees brouillent la lecture. Quatre
    // paliers, en filets pleins d'un pixel : la grille se lit sans se voir.
    ctx.lineWidth = 1;
    var paliers = cssH >= 260 ? [0, 0.25, 0.5, 0.75, 1] : [0, 0.5, 1];
    paliers.forEach(function (f) {
      var y = Math.round(padT + plotH - f * plotH) + 0.5;
      ctx.strokeStyle = grid;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(cssW - padR, y); ctx.stroke();
      ctx.fillStyle = muted;
      ctx.textAlign = 'right';
      ctx.fillText(Math.round(hautG * f).toLocaleString('fr-FR'), padL - 8, y);
      if (aDroite) {
        ctx.textAlign = 'left';
        ctx.fillText(Math.round(hautD * f) + ' %', cssW - padR + 8, y);
      }
    });

    // Trace un chemin arrondi passant par tous les points : chaque sommet
    // devient un point de contrôle d'une quadratique jusqu'au milieu du
    // segment suivant. La courbe passe exactement par le premier et le
    // dernier point, et ne peut pas dépasser les valeurs extrêmes de plus
    // d'une demi-maille, ce qui garde le tracé honnête.
    function cheminLisse(pts) {
      ctx.moveTo(pts[0].x, pts[0].y);
      if (pts.length === 2) { ctx.lineTo(pts[1].x, pts[1].y); return; }
      for (var k = 1; k < pts.length - 1; k++) {
        var mx = (pts[k].x + pts[k + 1].x) / 2, my = (pts[k].y + pts[k + 1].y) / 2;
        ctx.quadraticCurveTo(pts[k].x, pts[k].y, mx, my);
      }
      var fin = pts[pts.length - 1];
      ctx.quadraticCurveTo(fin.x, fin.y, fin.x, fin.y);
    }

    visibles.forEach(function (c) {
      // On decoupe en segments continus : chaque trou (null) coupe la ligne.
      var segs = [], cour = [];
      c.points.forEach(function (p, i) {
        if (p.total === null || p.total === undefined) { if (cour.length) segs.push(cour); cour = []; return; }
        cour.push({ i: i, v: p.total });
      });
      if (cour.length) segs.push(cour);

      // Un voile sous chaque courbe, jamais un aplat : un peu plus present
      // quand la courbe est seule, tres leger quand plusieurs se superposent.
      var alphaHaut = visibles.length === 1 ? '2e' : '1a';
      segs.forEach(function (seg) {
        if (seg.length < 2) return;
        var xy = seg.map(function (pt) { return { x: xAt(pt.i), y: yAt(pt.v, c.axe) }; });
        var g = ctx.createLinearGradient(0, padT, 0, padT + plotH);
        g.addColorStop(0, c.couleur + alphaHaut);
        g.addColorStop(1, c.couleur + '00');
        ctx.beginPath();
        cheminLisse(xy);
        ctx.lineTo(xy[xy.length - 1].x, padT + plotH);
        ctx.lineTo(xy[0].x, padT + plotH);
        ctx.closePath(); ctx.fillStyle = g; ctx.fill();
      });

      ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      segs.forEach(function (seg) {
        if (seg.length === 1) {
          // Un segment d'un seul point ne tracerait rien : on pose une pastille.
          ctx.beginPath();
          ctx.arc(xAt(seg[0].i), yAt(seg[0].v, c.axe), 2.5, 0, Math.PI * 2);
          ctx.fillStyle = c.couleur; ctx.fill();
          return;
        }
        ctx.beginPath();
        cheminLisse(seg.map(function (pt) { return { x: xAt(pt.i), y: yAt(pt.v, c.axe) }; }));
        ctx.strokeStyle = c.couleur; ctx.stroke();
      });

      var q = segs.length ? segs[segs.length - 1] : null;
      var dernier = q ? q[q.length - 1] : null;
      if (dernier) {
        // Le point du jour, cerne de la couleur de la carte pour rester
        // lisible quand deux courbes se croisent.
        var surface = (css && css.getPropertyValue('--adm-card').trim()) || (dark ? '#140b1e' : '#ffffff');
        ctx.beginPath(); ctx.arc(xAt(dernier.i), yAt(dernier.v, c.axe), 4, 0, Math.PI * 2);
        ctx.fillStyle = c.couleur; ctx.fill();
        ctx.strokeStyle = surface; ctx.lineWidth = 2; ctx.stroke();
      }
    });

    ctx.fillStyle = muted; ctx.textAlign = 'center';
    // Une etiquette de date tous les 90 pixels environ : plus large, plus de dates.
    var pas = Math.max(1, Math.ceil(n / Math.max(3, Math.floor(plotW / 90))));
    for (var i = 0; i < n; i += pas) ctx.fillText(visibles[0].points[i].label, xAt(i), cssH - padB / 2 + 3);
    ctx.textAlign = 'left';

    cv._geo = { couches: visibles, n: n, padL: padL, padR: padR, padT: padT, plotH: plotH, xAt: xAt, yAt: yAt, cssW: cssW, cssH: cssH };
    brancheInfobulle(cv);
  }

  // Ancienne signature, gardee pour la courbe d'un seul quiz.
  function drawLineChart(cv, series, opts) {
    opts = opts || {};
    if (opts.loading) return drawChart(cv, [], { loading: true });
    return drawChart(cv, [{
      cle: 'serie', nom: opts.nom || 'Parties', couleur: teinte('finis', '#EF4E88'),
      axe: opts.maxFixe === 100 ? 'droite' : 'gauche', unite: opts.unite || '',
      points: series || []
    }], opts);
  }

  // ── Infobulle du graphique ──
  // Passer la souris affiche la date et, pour chaque courbe visible, sa valeur
  // exacte ce jour-la. Sans elle, on ne pouvait que deviner entre deux
  // graduations, et avec trois courbes ce serait devenu illisible.
  function brancheInfobulle(cv) {
    if (cv._infobulleBranchee) return;
    cv._infobulleBranchee = true;
    var parent = cv.parentElement;
    if (parent && getComputedStyle(parent).position === 'static') parent.style.position = 'relative';

    var bulle = document.createElement('div');
    bulle.className = 'stats-infobulle';
    bulle.setAttribute('role', 'status');
    bulle.classList.add('est-cachee');
    (parent || document.body).appendChild(bulle);
    // Le curseur : un filet vertical a la date survolee, et un point sur
    // chaque courbe. On vise une date, jamais un trait de deux pixels.
    var croix = document.createElement('div');
    croix.className = 'stats-croix est-cachee';
    (parent || document.body).appendChild(croix);
    var reperes = [];
    function repere(k) {
      while (reperes.length <= k) {
        var r = document.createElement('div');
        r.className = 'stats-repere est-cachee';
        (parent || document.body).appendChild(r);
        reperes.push(r);
      }
      return reperes[k];
    }

    function indexLePlusProche(clientX) {
      var g = cv._geo;
      if (!g || !g.n) return null;
      var r = cv.getBoundingClientRect();
      var util = g.cssW - g.padL - g.padR;
      var f = util > 0 ? ((clientX - r.left) - g.padL) / util : 0;
      return Math.max(0, Math.min(g.n - 1, Math.round(f * (g.n - 1))));
    }

    function montre(evt) {
      var g = cv._geo;
      if (!g) return;
      var i = indexLePlusProche(evt.clientX);
      if (i === null) return;
      var ref = g.couches[0].points[i];
      var html = '<span class="stats-infobulle-date">' + esc(ref.label) + '</span>';
      g.couches.forEach(function (c) {
        var p = c.points[i];
        var v = (p && p.total !== null && p.total !== undefined)
          ? p.total.toLocaleString('fr-FR') + (c.unite || '')
          : '—';
        html += '<span class="stats-infobulle-ligne">'
          + '<span class="stats-infobulle-puce" style="background:' + c.couleur + '"></span>'
          + '<span class="stats-infobulle-nom">' + esc(c.nom) + '</span>'
          + '<span class="stats-infobulle-val">' + v + '</span>'
          + '</span>';
      });
      bulle.innerHTML = html;
      bulle.classList.remove('est-cachee');
      var x = g.xAt(i);
      // L'infobulle se place a droite du curseur, ou a gauche quand la place
      // manque : elle ne cache jamais le point qu'elle decrit.
      var gauche = x + 14;
      if (gauche + bulle.offsetWidth > g.cssW - 4) gauche = x - bulle.offsetWidth - 14;
      bulle.style.left = Math.max(4, gauche) + 'px';
      // Cale sur le haut du canevas et non du panneau : sinon l'infobulle
      // recouvre les boutons de periode places au-dessus.
      bulle.style.top = (cv.offsetTop + 6) + 'px';
      croix.style.left = (cv.offsetLeft + x) + 'px';
      croix.style.top = (cv.offsetTop + (g.padT || 0)) + 'px';
      croix.style.height = (g.plotH || (cv.clientHeight - 40)) + 'px';
      croix.classList.remove('est-cachee');
      var k = 0;
      g.couches.forEach(function (c) {
        var p = c.points[i];
        if (!p || p.total === null || p.total === undefined || !g.yAt) return;
        var r = repere(k++);
        r.style.setProperty('--pt', c.couleur);
        r.style.left = (cv.offsetLeft + x) + 'px';
        r.style.top = (cv.offsetTop + g.yAt(p.total, c.axe)) + 'px';
        r.classList.remove('est-cachee');
      });
      for (; k < reperes.length; k++) reperes[k].classList.add('est-cachee');
    }
    function cache() {
      bulle.classList.add('est-cachee');
      croix.classList.add('est-cachee');
      reperes.forEach(function (r) { r.classList.add('est-cachee'); });
    }

    cv.addEventListener('mousemove', montre);
    cv.addEventListener('mouseleave', cache);
    cv.addEventListener('touchmove', function (e) { if (e.touches && e.touches[0]) montre(e.touches[0]); }, { passive: true });
    cv.addEventListener('touchend', cache);
  }

  function niceCeil(n) {
    if (n <= 5) return 5;
    var pow = Math.pow(10, Math.floor(Math.log10(n)));
    var d = n / pow;
    var nice = d <= 1 ? 1 : d <= 2 ? 2 : d <= 5 ? 5 : 10;
    return nice * pow;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // ONGLET TRAFIC
  //
  // Mesure d'audience premiere partie, servie par le domaine du site. Elle
  // existe parce qu'Analytics ne voyait qu'un peu plus de la moitie du
  // trafic reel : bloque au niveau reseau par les bloqueurs de pistage, muet
  // tant que le bandeau cookies n'a pas ete accepte, et charge trop tard
  // pour attraper les visites courtes.
  //
  // L'unite est la VISITE, pas la personne : l'identifiant meurt apres
  // trente minutes d'inactivite et n'est jamais reconduit. C'est ce qui
  // permet de se passer de consentement, et c'est de toute facon la bonne
  // unite pour lire du trafic.
  // ═══════════════════════════════════════════════════════════════════════
  // Le trafic s'ouvre sur la journee en cours : c'est ce qu'on vient voir
  // en premier, les periodes plus longues sont a un clic.
  var traficPeriode = 1;
  var traficDonnees = null;          // { resume, daily, pages, sources, profondeur, entonnoir }
  var traficCouchesVues = { visites: true, vues: true };
  var traficTriEnt = { col: 'visites', sens: -1 };
  var traficTriPages = { col: 'pages_vues', sens: -1 };
  var _traficCouches = null;

  var TRAFIC_COURBES = [
    { cle: 'visites', nom: 'Visites',    couleur: '#8B5CF6' },
    { cle: 'vues',    nom: 'Pages vues', couleur: '#0EA5E9' }
  ];

  function nb(n) { return Number(n || 0).toLocaleString('fr-FR'); }
  function pct(a, b) { return b ? Math.round((a / b) * 100) : 0; }

  // Les noms d'hote bruts ne parlent pas tous. On traduit les plus frequents
  // et on laisse le reste tel quel : inventer une categorie « autre » ferait
  // disparaitre justement ce qu'on cherche a decouvrir.
  var TRAFIC_SOURCES = {
    'direct': 'Direct / favori', 'partage': 'Lien partagé', 'duo': 'Mode DUO',
    'google.com': 'Google', 'google.fr': 'Google', 'bing.com': 'Bing',
    'duckduckgo.com': 'DuckDuckGo', 'ecosia.org': 'Ecosia', 'qwant.com': 'Qwant',
    'search.brave.com': 'Brave', 'yahoo.com': 'Yahoo', 'yandex.com': 'Yandex',
    'search.marginalia.nu': 'Marginalia', 'lite.duckduckgo.com': 'DuckDuckGo',
    'facebook.com': 'Facebook', 'm.facebook.com': 'Facebook', 'l.facebook.com': 'Facebook',
    'instagram.com': 'Instagram', 'l.instagram.com': 'Instagram',
    'tiktok.com': 'TikTok', 'pinterest.com': 'Pinterest', 'fr.pinterest.com': 'Pinterest',
    'reddit.com': 'Reddit', 'out.reddit.com': 'Reddit',
    't.co': 'X / Twitter', 'x.com': 'X / Twitter',
    'chatgpt.com': 'ChatGPT', 'chat.openai.com': 'ChatGPT',
    'perplexity.ai': 'Perplexity', 'claude.ai': 'Claude',
    'gemini.google.com': 'Gemini', 'copilot.microsoft.com': 'Copilot'
  };
  function nomSource(s) {
    if (!s) return 'Direct / favori';
    if (TRAFIC_SOURCES[s]) return TRAFIC_SOURCES[s];
    if (s.indexOf('google.') === 0) return 'Google';
    return s;
  }

  // Le bandeau d'explication et le bouton d'exclusion ont quitte l'onglet
  // Trafic. Le drapeau qc-no-track, lui, reste lu par audience.js : les
  // visites du proprietaire restent exclues sur les navigateurs ou il a ete
  // pose ; il n'y a simplement plus d'interface pour le changer ici.

  // ── Chargement ─────────────────────────────────────────────────────────
  // La courbe montre toujours au moins deux semaines : sur « Aujourd'hui »
  // ou « 7 j », les compteurs portent sur la periode choisie, mais une
  // courbe d'un ou deux points n'apprend rien. La legende dit sur combien
  // de jours elle porte quand ce n'est pas la periode des compteurs.
  var TRAFIC_JOURS_COURBE_MINI = 14;
  function joursCourbeTrafic() { return Math.max(traficPeriode, TRAFIC_JOURS_COURBE_MINI); }
  function loadTrafic() {
    var tz = fuseau();
    var n = traficPeriode;
    var vide = { resume: null, daily: [], pages: [], sources: [], profondeur: [], entonnoir: [], sourcePref: [], sourceDaily: [] };
    drawChart(document.getElementById('trafic-chart'), [], { loading: true });
    drawChart(document.getElementById('blog-sourcepref-chart'), [], { loading: true });
    Promise.all([
      statsRpc('get_trafic_resume', { p_days: n, p_tz: tz }),
      statsRpc('get_trafic_daily', { p_days: joursCourbeTrafic(), p_tz: tz }),
      statsRpcPages('get_trafic_pages', { p_days: n, p_tz: tz }),
      statsRpc('get_trafic_sources', { p_days: n, p_tz: tz }),
      statsRpc('get_trafic_profondeur', { p_days: n, p_tz: tz }),
      statsRpc('get_trafic_entonnoir', { p_days: n, p_tz: tz }),
      statsRpc('get_source_pref_clics', { p_days: n, p_tz: tz }),
      statsRpc('get_source_pref_daily', { p_days: joursCourbeTrafic(), p_tz: tz })
    ]).then(function (r) {
      // La RPC de resume rend une seule ligne ; les autres rendent des
      // tableaux. Une erreur PostgREST arrive sous forme d'objet, jamais de
      // tableau : c'est ainsi qu'on distingue « pas encore de donnees » de
      // « la migration n'est pas passee ».
      var estTab = function (x) { return Array.isArray(x) ? x : []; };
      traficDonnees = {
        resume: Array.isArray(r[0]) ? (r[0][0] || null) : null,
        daily: estTab(r[1]),
        pages: estTab(r[2]),
        sources: estTab(r[3]),
        profondeur: estTab(r[4]),
        entonnoir: estTab(r[5]),
        sourcePref: estTab(r[6]),
        sourceDaily: estTab(r[7]),
        erreurSources: !Array.isArray(r[6])
      };
      if (!Array.isArray(r[0])) traficDonnees.erreur = true;
      renderTrafic();
    }).catch(function () {
      traficDonnees = vide;
      traficDonnees.erreur = true;
      renderTrafic();
    });
  }

  function renderTrafic() {
    renderTraficKpis();
    renderTraficCourbe();
    renderTraficSources();
    renderTraficProfondeur();
    renderTraficEntonnoir();
    renderTraficPages();
    renderSourceCourbe();
  }

  function traficAucune() {
    return !traficDonnees || !traficDonnees.resume || !Number(traficDonnees.resume.visites);
  }

  function messageVide(cible, texte) {
    var el = document.getElementById(cible);
    if (el) el.innerHTML = '<p class="trafic-vide">' + esc(texte) + '</p>';
  }

  var TXT_ATTENTE = 'Aucune visite enregistrée sur la période. La mesure démarre au premier déploiement : les journées antérieures resteront vides.';
  var TXT_ERREUR = 'La table de mesure n\'a pas encore été créée dans Supabase. Appliquez la migration page_views, puis rechargez.';

  // Variation par rapport a la periode qui precede, a cote des deux chiffres
  // du haut. La serie quotidienne est deja chargee pour la courbe : la vue du
  // jour se compare a hier, la vue a sept jours aux sept jours d'avant. Au
  // dela, cette serie (quatorze jours au minimum, la periode sinon) ne remonte
  // pas assez loin pour comparer a periode egale, et l'etiquette disparait
  // plutot que d'afficher un ecart calcule sur une fenetre incomplete.
  //
  // La comparaison porte sur des journees entieres, comme celle de l'onglet
  // Parties : a dix heures du matin, la journee en cours est forcement en
  // retard sur la precedente.
  function traficDeltas() {
    var n = traficPeriode;
    if (n !== 1 && n * 2 > joursCourbeTrafic()) return null;
    var par = {};
    (traficDonnees ? traficDonnees.daily : []).forEach(function (l) {
      par[String(l.day).slice(0, 10)] = { visites: Number(l.visites) || 0, vues: Number(l.pages_vues) || 0 };
    });
    function somme(depuis, jours) {
      var t = { visites: 0, vues: 0 };
      for (var i = depuis; i < depuis + jours; i++) {
        var v = par[isoNJoursAvant(i)];
        if (v) { t.visites += v.visites; t.vues += v.vues; }
      }
      return t;
    }
    return { actuel: somme(0, n), avant: somme(n, n), libelle: n === 1 ? null : 'vs ' + n + ' j préc.' };
  }

  function renderTraficKpis() {
    var r = (traficDonnees && traficDonnees.resume) || null;
    var visites = r ? Number(r.visites) : 0;
    var vues = r ? Number(r.pages_vues) : 0;
    var ppv = r ? Number(r.pages_par_visite) : 0;
    var une = r ? Number(r.visites_une_page) : 0;
    var set = function (id, v) { var e = document.getElementById(id); if (e) e.textContent = v; };
    set('trafic-visites', nb(visites));
    set('trafic-vues', nb(vues));
    set('trafic-ppv', visites ? ppv.toFixed(2).replace('.', ',') : '-');
    set('trafic-rebond', visites ? pct(une, visites) + ' %' : '-');
    var sub = document.getElementById('trafic-visites-sub');
    if (sub) sub.textContent = traficPeriode === 1 ? "aujourd'hui" : 'sur ' + traficPeriode + ' jours';
    var rsub = document.getElementById('trafic-rebond-sub');
    if (rsub) rsub.textContent = visites ? nb(une) + ' visites d\'une seule page' : 'des visites repartent sans cliquer';
    var d = traficDeltas();
    etiquetteDelta('adm-delta-trafic-visites', d ? d.actuel.visites : null, d ? d.avant.visites : null, d && d.libelle);
    etiquetteDelta('adm-delta-trafic-vues', d ? d.actuel.vues : null, d ? d.avant.vues : null, d && d.libelle);
  }

  // ── Courbe ─────────────────────────────────────────────────────────────
  // Les journees sans ligne en base valent zero et non « inconnu » : la
  // mesure tourne tous les jours, une journee absente est une journee sans
  // visite, pas une journee non mesuree.
  function renderTraficCourbe() {
    var cv = document.getElementById('trafic-chart');
    var par = {};
    (traficDonnees ? traficDonnees.daily : []).forEach(function (l) {
      var k = String(l.day).slice(0, 10);
      par[k] = { visites: Number(l.visites) || 0, vues: Number(l.pages_vues) || 0 };
    });
    var points = { visites: [], vues: [] };
    var jours = joursCourbeTrafic();
    for (var i = jours - 1; i >= 0; i--) {
      var iso = isoNJoursAvant(i);
      var d = new Date(iso + 'T12:00:00');
      var label = d.getDate() + '/' + (d.getMonth() + 1);
      var v = par[iso] || { visites: 0, vues: 0 };
      points.visites.push({ date: d, label: label, total: v.visites });
      points.vues.push({ date: d, label: label, total: v.vues });
    }
    var suffixe = jours !== traficPeriode ? ' · ' + jours + ' j' : '';
    var couches = TRAFIC_COURBES.map(function (c) {
      return { cle: c.cle, nom: c.nom + suffixe, couleur: teinte(c.cle, c.couleur), axe: 'gauche', unite: '',
               visible: traficCouchesVues[c.cle], points: points[c.cle] };
    });
    // Les mini-courbes des deux tuiles, sur la periode affichee.
    sparkline('adm-spark-visites', points.visites.map(function (p) { return p.total; }));
    sparkline('adm-spark-vues', points.vues.map(function (p) { return p.total; }));
    _traficCouches = couches;
    renderTraficLegende(couches);
    drawChart(cv, couches, {});
  }

  function renderTraficLegende(couches) {
    var el = document.getElementById('trafic-legende');
    if (!el) return;
    el.innerHTML = couches.map(function (c) {
      var somme = c.points.reduce(function (a, p) { return a + (p.total || 0); }, 0);
      return '<button type="button" class="stats-leg' + (c.visible ? '' : ' est-eteinte') + '"'
        + ' style="--leg:' + c.couleur + '" data-trafic-courbe="' + c.cle + '"'
        + ' aria-pressed="' + (c.visible ? 'true' : 'false') + '">'
        + '<span class="stats-leg-nom"><span class="stats-leg-puce"></span>' + esc(c.nom) + '</span>'
        + '<span class="stats-leg-val">' + nb(somme) + '</span>'
        + '</button>';
    }).join('');
  }

  // ── Barres de repartition ──────────────────────────────────────────────
  function barres(cible, lignes, couleur) {
    var el = document.getElementById(cible);
    if (!el) return;
    if (!lignes.length) { messageVide(cible, traficDonnees && traficDonnees.erreur ? TXT_ERREUR : TXT_ATTENTE); return; }
    var total = lignes.reduce(function (a, l) { return a + l.valeur; }, 0);
    var max = Math.max.apply(null, lignes.map(function (l) { return l.valeur; }));
    el.innerHTML = lignes.map(function (l) {
      return '<div class="trafic-barre">'
        + '<span class="trafic-barre-nom" title="' + esc(l.nom) + '">' + esc(l.nom) + '</span>'
        + '<span class="trafic-barre-piste"><span class="trafic-barre-jauge" style="--bar:' + couleur + ';width:' + (max ? (l.valeur / max) * 100 : 0) + '%"></span></span>'
        + '<span class="trafic-barre-val">' + nb(l.valeur)
        + '<span class="trafic-barre-pct">' + pct(l.valeur, total) + ' %</span></span>'
        + '</div>';
    }).join('');
  }

  // Les visites dont la premiere page a pour referent le site lui-meme ne
  // viennent de nulle part : c'est la meme personne qui reprend son onglet
  // apres une pause de plus de trente minutes. Le compteur de visites les
  // traite comme une visite neuve, ce qui coupe une session en deux, et le
  // panneau des sources les affichait comme une origine a part entiere, a
  // cote de Google et de Facebook. Elles sont ecartees ici : les pourcentages
  // se recalculent alors sur les seules vraies provenances.
  function estReprise(source) { return source === 'interne'; }

  function renderTraficSources() {
    var l = (traficDonnees ? traficDonnees.sources : [])
      .filter(function (x) { return !estReprise(x.source); })
      .map(function (x) {
      return { nom: nomSource(x.source), valeur: Number(x.visites) || 0 };
    });
    // Deux hotes peuvent porter le meme nom lisible (google.fr et google.com) :
    // on les additionne plutot que d'afficher deux lignes « Google ».
    var par = {};
    l.forEach(function (x) { par[x.nom] = (par[x.nom] || 0) + x.valeur; });
    var fusion = Object.keys(par).map(function (k) { return { nom: k, valeur: par[k] }; })
      .sort(function (a, b) { return b.valeur - a.valeur; }).slice(0, 12);
    barres('trafic-sources', fusion, 'hsl(258 70% 55%)');
  }

  function renderTraficProfondeur() {
    var l = (traficDonnees ? traficDonnees.profondeur : []).map(function (x) {
      var n = Number(x.pages);
      return { nom: n >= 6 ? '6 pages ou plus' : (n + (n > 1 ? ' pages' : ' page')), valeur: Number(x.visites) || 0, ordre: n };
    }).sort(function (a, b) { return a.ordre - b.ordre; });
    barres('trafic-profondeur', l, 'hsl(150 55% 42%)');
  }

  // ── Entonnoir ──────────────────────────────────────────────────────────
  // Les trois nombres viennent de la meme requete et portent sur les memes
  // visites : le taux ne peut donc pas depasser 100 % par accident, ce qui
  // arrivait fatalement quand on rapprochait deux totaux calcules chacun de
  // son cote.
  function renderTraficEntonnoir() {
    var el = document.getElementById('trafic-entonnoir');
    if (!el) return;
    var lignes = (traficDonnees ? traficDonnees.entonnoir : []).map(function (x) {
      var slug = canon(x.route_key);
      return {
        slug: slug, nom: nomQuiz(slug),
        visites: Number(x.visites) || 0,
        lances: Number(x.lances) || 0,
        finis: Number(x.finis) || 0
      };
    });
    if (!lignes.length) { messageVide('trafic-entonnoir', traficDonnees && traficDonnees.erreur ? TXT_ERREUR : TXT_ATTENTE); return; }
    var t = traficTriEnt;
    lignes.sort(function (a, b) { return (a[t.col] - b[t.col]) * t.sens; });
    var max = Math.max.apply(null, lignes.map(function (l) { return l[t.col]; })) || 1;
    el.innerHTML = lignes.map(function (l) {
      return '<div class="stats-row trafic-ligne" style="--fam:hsl(258 70% 55%);--part:' + (l[t.col] / max) * 100 + '%">'
        + '<span class="stats-row-name" title="' + esc(l.nom) + '">' + esc(l.nom) + '</span>'
        + '<span class="stats-cell stats-cell--visites">' + nb(l.visites) + '</span>'
        + '<span class="stats-cell stats-cell--lances">' + nb(l.lances)
        + '<span class="stats-cell-jour trafic-sous">' + pct(l.lances, l.visites) + ' %</span></span>'
        + '<span class="stats-cell stats-cell--finis">' + nb(l.finis)
        + '<span class="stats-cell-jour trafic-sous">' + pct(l.finis, l.lances) + ' %</span></span>'
        + '</div>';
    }).join('');
    majFleches('[data-tri-ent]', 'triEnt', traficTriEnt);
  }

  // ── Toutes les pages ───────────────────────────────────────────────────
  function renderTraficPages() {
    var el = document.getElementById('trafic-pages');
    if (!el) return;
    var lignes = (traficDonnees ? traficDonnees.pages : []).map(function (x) {
      var visites = Number(x.visites) || 0;
      var entrees = Number(x.entrees) || 0;
      return {
        path: x.path, pages_vues: Number(x.pages_vues) || 0,
        visites: visites, entrees: entrees,
        navigation: Math.max(0, visites - entrees),
        rebond: entrees ? Math.round((Number(x.rebonds) / entrees) * 100) : 0
      };
    });
    if (!lignes.length) { messageVide('trafic-pages', traficDonnees && traficDonnees.erreur ? TXT_ERREUR : TXT_ATTENTE); return; }
    var t = traficTriPages;
    lignes.sort(function (a, b) { return (a[t.col] - b[t.col]) * t.sens; });
    var max = Math.max.apply(null, lignes.map(function (l) { return l[t.col]; })) || 1;
    el.innerHTML = lignes.map(function (l) {
      return '<div class="stats-row trafic-ligne" style="--fam:hsl(199 85% 45%);--part:' + (l[t.col] / max) * 100 + '%">'
        + '<span class="stats-row-name" title="' + esc(l.path) + '">' + esc(l.path) + '</span>'
        + '<span class="stats-cell stats-cell--vues">' + nb(l.pages_vues) + '</span>'
        + '<span class="stats-cell stats-cell--visites">' + nb(l.visites) + '</span>'
        + '<span class="stats-cell stats-cell--lances">' + nb(l.entrees)
        + '<span class="stats-cell-jour trafic-sous">' + nb(l.navigation) + ' par nav.</span></span>'
        + '<span class="stats-cell stats-cell--ratio">' + (l.entrees ? l.rebond + ' %' : '—') + '</span>'
        + '</div>';
    }).join('');
    majFleches('[data-tri-pages]', 'triPages', traficTriPages);
  }

  // Fleche montante ou descendante sur l'en-tete actif, comme dans l'onglet
  // Stats : sans repere, on ne sait plus dans quel sens la liste est rangee.
  function majFleches(selecteur, attr, etat) {
    document.querySelectorAll(selecteur).forEach(function (b) {
      var actif = b.dataset[attr] === etat.col;
      b.classList.toggle('est-actif', actif);
      var f = b.querySelector('.stats-tri-fleche');
      if (f) f.textContent = actif ? (etat.sens === -1 ? '▾' : '▴') : '▾';
    });
  }

  // ══ Sources préférées Google (dans l'onglet Trafic) ═══════════════════
  // Les clics sur « Ajouter Quiz Couple à mes sources préférées », au pied de
  // page et sous les articles. Le panneau vivait dans un onglet Blog avec le
  // classement des articles les plus lus ; l'onglet a été retiré le 7 octobre
  // 2026 (Thomas n'en avait pas l'usage, la fonction get_blog_articles est
  // retirée de la base par la migration 20261008170000). La courbe a rejoint
  // le trafic : elle suit sa période et se charge avec ses six agrégats.
  var sourceCouchesVues = { pied: true, blog: true };
  var _sourceCouches = null;

  var SOURCE_EMPLACEMENTS = {
    pied: 'Pied de page',
    blog: 'Sous un article'
  };
  // Couleurs en hexadecimal obligatoirement : drawChart fabrique le
  // remplissage sous la courbe en collant un suffixe d'opacite a la couleur
  // (« #3B82F6 » + « 24 »). Un « hsl(...) » fait echouer addColorStop et
  // emporte tout le rendu de l'onglet avec lui.
  var SOURCE_COURBES = [
    { cle: 'pied', nom: 'Pied de page', couleur: '#3B82F6' },
    { cle: 'blog', nom: 'Sous un article', couleur: '#EF4E88' }
  ];

  var TXT_SOURCES_ERREUR = 'La fonction get_source_pref_clics ne répond pas : la migration blog_lectures_source_pref n\'est pas appliquée.';

  // ── La courbe des clics « source préférée » ────────────────────────────
  // Meme nombre de jours que la courbe du trafic (quatorze au moins).
  function renderSourceCourbe() {
    var cv = document.getElementById('blog-sourcepref-chart');
    if (!cv) return;
    var par = {};
    ((traficDonnees && traficDonnees.sourceDaily) || []).forEach(function (l) {
      var k = String(l.day).slice(0, 10);
      if (!par[k]) par[k] = { pied: 0, blog: 0 };
      var e = l.emplacement === 'blog' ? 'blog' : 'pied';
      par[k][e] += Number(l.clics) || 0;
    });
    var points = { pied: [], blog: [] };
    for (var i = joursCourbeTrafic() - 1; i >= 0; i--) {
      var iso = isoNJoursAvant(i);
      var d = new Date(iso + 'T12:00:00');
      var label = d.getDate() + '/' + (d.getMonth() + 1);
      var v = par[iso] || { pied: 0, blog: 0 };
      points.pied.push({ date: d, label: label, total: v.pied });
      points.blog.push({ date: d, label: label, total: v.blog });
    }
    var couches = SOURCE_COURBES.map(function (c) {
      return { cle: c.cle, nom: c.nom, couleur: teinte(c.cle, c.couleur), axe: 'gauche', unite: '',
               visible: sourceCouchesVues[c.cle], points: points[c.cle] };
    });
    _sourceCouches = couches;
    renderSourceLegende(couches);
    drawChart(cv, couches, {});
    renderSourceNote();
  }

  function renderSourceLegende(couches) {
    var el = document.getElementById('blog-sourcepref-legende');
    if (!el) return;
    el.innerHTML = couches.map(function (c) {
      var somme = c.points.reduce(function (a, p) { return a + (p.total || 0); }, 0);
      return '<button type="button" class="stats-leg' + (c.visible ? '' : ' est-eteinte') + '"'
        + ' style="--leg:' + c.couleur + '" data-source-courbe="' + c.cle + '"'
        + ' aria-pressed="' + (c.visible ? 'true' : 'false') + '">'
        + '<span class="stats-leg-nom"><span class="stats-leg-puce"></span>' + esc(c.nom) + '</span>'
        + '<span class="stats-leg-val">' + nb(somme) + '</span>'
        + '</button>';
    }).join('');
  }

  // Sous la courbe : les visites distinctes de la periode, et le cumul
  // depuis toujours. La courbe compte les clics, y compris deux clics de la
  // meme personne ; la note dit combien de gens differents ont clique.
  function renderSourceNote() {
    var el = document.getElementById('blog-sourcepref-note');
    if (!el) return;
    var l = (traficDonnees && traficDonnees.sourcePref) || [];
    if (!l.length) {
      el.textContent = traficDonnees && traficDonnees.erreurSources ? TXT_SOURCES_ERREUR : 'Aucun clic sur la période.';
      return;
    }
    var visites = 0, total = 0;
    var detail = l.map(function (x) {
      visites += Number(x.visites) || 0;
      total += Number(x.total) || 0;
      return (SOURCE_EMPLACEMENTS[x.emplacement] || x.emplacement) + ' : ' + nb(x.visites) + ' visite'
        + (Number(x.visites) > 1 ? 's' : '');
    }).join(' · ');
    el.textContent = nb(visites) + ' visite' + (visites > 1 ? 's' : '') + ' distincte'
      + (visites > 1 ? 's' : '') + ' ont cliqué sur la période (' + detail
      + '). Depuis toujours, tous emplacements confondus : ' + nb(total) + ' clics.';
  }

  // ── Tab switching ──
  // Le titre de la zone principale suit l'onglet : c'est lui qui dit ou on est.
  var TITRES_ONGLETS = {
    stats: ['Parties', 'Lancés, terminés et taux de finition, toutes pages confondues'],
    trafic: ['Trafic', 'Visites et pages vues, mesurées par le site lui-même'],
    distance: ['À distance', 'Les parties jouées chacun sur son téléphone'],
    reviews: ['Avis', 'Modération des avis laissés sur les pages'],
    leads: ['Leads', 'Les demandes reçues par le formulaire'],
    messages: ['Messagerie', 'Les messages du formulaire de contact'],
    affiliation: ['Affiliation', 'Clics, conversions et commissions Affilae'],
    reseaux: ['Réseaux', 'Planning et publication des posts Instagram']
  };
  function majTitre(tab) {
    var t = TITRES_ONGLETS[tab];
    var h = document.getElementById('adm-titre'), sub = document.getElementById('adm-sous-titre');
    if (h && t) h.textContent = t[0];
    if (sub && t) sub.textContent = t[1];
  }

  function rechargeOnglet(tab) {
    if (tab === 'stats') loadStats();
    else if (tab === 'trafic') loadTrafic();
    else if (tab === 'distance') loadDistance();
    else if (tab === 'reviews') loadReviews();
    else if (tab === 'leads') { allLeads = []; loadLeads(); }
    else if (tab === 'messages') { allMessages = []; loadMessages(); }
    else if (tab === 'affiliation' && window.AdminAffiliation && window.AdminAffiliation.ouvrir) window.AdminAffiliation.ouvrir();
    else if (tab === 'reseaux') ouvrirReseaux();
  }

  // L'onglet Réseaux vit dans son propre module (admin-reseaux.js) : il reçoit
  // l'adresse du projet et le jeton admin, et parle à la fonction admin-social.
  function ouvrirReseaux() {
    if (window.AdminReseaux && window.AdminReseaux.ouvrir) {
      window.AdminReseaux.ouvrir({ url: SUPABASE_URL, cle: SUPABASE_KEY, jeton: adminToken });
    }
  }

  function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.admin-tab').forEach(function (b) { b.classList.remove('active'); });
    var onglet = document.querySelector('.admin-tab[data-tab="' + tab + '"]');
    if (onglet) onglet.classList.add('active');
    majTitre(tab);

    document.getElementById('admin-reviews-tab').classList.toggle('hidden', tab !== 'reviews');
    document.getElementById('admin-leads-tab').classList.toggle('hidden', tab !== 'leads');
    document.getElementById('admin-messages-tab').classList.toggle('hidden', tab !== 'messages');
    var statsTab = document.getElementById('admin-stats-tab');
    if (statsTab) statsTab.classList.toggle('hidden', tab !== 'stats');
    var afTab = document.getElementById('admin-affiliation-tab');
    if (afTab) afTab.classList.toggle('hidden', tab !== 'affiliation');
    var trTab = document.getElementById('admin-trafic-tab');
    if (trTab) trTab.classList.toggle('hidden', tab !== 'trafic');
    var diTab = document.getElementById('admin-distance-tab');
    if (diTab) diTab.classList.toggle('hidden', tab !== 'distance');
    var rsTab = document.getElementById('admin-reseaux-tab');
    if (rsTab) rsTab.classList.toggle('hidden', tab !== 'reseaux');
    if (tab === 'reseaux') ouvrirReseaux();

    if (tab === 'stats') {
      loadStats();
    }
    // Rechargement a chaque ouverture : le trafic bouge en continu, et les
    // six agregats sont assez legers pour ne pas justifier un cache.
    if (tab === 'trafic') {
      loadTrafic();
    }
    if (tab === 'distance') {
      loadDistance();
    }
    // L'onglet affiliation vit dans son propre module : il gere son jeton et
    // ne parle qu'a Affilae, sans rien partager avec le reste de l'admin.
    if (tab === 'affiliation' && window.AdminAffiliation) {
      window.AdminAffiliation.ouvrir();
    }
    if (tab === 'leads') {
      if (allLeads.length === 0) loadLeads();
      // Consulter l'onglet vaut prise de connaissance : la pastille retombe.
      marqueVu('leads');
      setTimeout(majPastilles, 0);
    }
    if (tab === 'messages' && allMessages.length === 0) {
      loadMessages();
    }
  }

  // ── Reviews CRUD ──
  function loadReviews() {
    var listEl = document.getElementById('admin-reviews-list');
    listEl.innerHTML = '<p class="text-center text-muted-foreground py-8">Chargement...</p>';

    fetch(SUPABASE_URL + '/functions/v1/admin-reviews', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'x-admin-token': adminToken
      }
    })
    .then(function (res) {
      if (!res.ok) throw new Error('Edge function returned ' + res.status);
      return res.json();
    })
    .then(function (data) {
      var reviews = Array.isArray(data) ? data : (data && data.reviews ? data.reviews : (data && data.data ? data.data : null));
      if (reviews && Array.isArray(reviews)) {
        allReviews = reviews;
        majPastilles();
        updateStats();
        renderReviews();
      } else {
        throw new Error('Invalid response format');
      }
    })
    .catch(function () {
      fetch(SUPABASE_URL + '/rest/v1/reviews?select=id,author_name,rating,comment,is_approved,created_at,quiz_slug&order=created_at.desc&limit=100', {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
      })
      .then(function (res) { return res.json(); })
      .then(function (reviews) {
        if (Array.isArray(reviews)) {
          allReviews = reviews;
          majPastilles();
        majPastilles();
          updateStats();
          renderReviews();
        } else {
          listEl.innerHTML = '<p class="text-center text-destructive py-8">Erreur de chargement. Vérifiez que l\'Edge Function admin-reviews est déployée.</p>';
        }
      })
      .catch(function () {
        listEl.innerHTML = '<p class="text-center text-destructive py-8">Erreur de connexion au serveur.</p>';
      });
    });
  }

  function reviewAction(reviewId, action) {
    fetch(SUPABASE_URL + '/functions/v1/admin-reviews', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json',
        'x-admin-token': adminToken
      },
      body: JSON.stringify({ reviewId: reviewId, action: action })
    })
    .then(function (res) {
      if (res.ok) loadReviews();
    });
  }

  function updateStats() {
    var pending = allReviews.filter(function (r) { return !r.is_approved; }).length;
    var approved = allReviews.filter(function (r) { return r.is_approved; }).length;
    var sum = 0;
    allReviews.forEach(function (r) { sum += r.rating || 0; });
    var avg = allReviews.length > 0 ? (sum / allReviews.length).toFixed(1) : '-';

    document.getElementById('admin-stat-avg').textContent = avg;
    document.getElementById('admin-stat-pending').textContent = pending;
    document.getElementById('admin-stat-approved').textContent = approved;

    var allCount = document.getElementById('admin-filter-all-count');
    var pendingCount = document.getElementById('admin-filter-pending-count');
    var approvedCount = document.getElementById('admin-filter-approved-count');
    if (allCount) allCount.textContent = '(' + allReviews.length + ')';
    if (pendingCount) pendingCount.textContent = '(' + pending + ')';
    if (approvedCount) approvedCount.textContent = '(' + approved + ')';
  }

  function renderReviews() {
    var list = document.getElementById('admin-reviews-list');
    var filtered = allReviews;

    if (currentFilter === 'pending') {
      filtered = allReviews.filter(function (r) { return !r.is_approved; });
    } else if (currentFilter === 'approved') {
      filtered = allReviews.filter(function (r) { return r.is_approved; });
    }

    if (filtered.length === 0) {
      list.innerHTML = '<p class="text-center text-muted-foreground py-8">Aucun avis</p>';
      return;
    }

    var html = '';
    filtered.forEach(function (r) {
      var statusBadge = r.is_approved
        ? '<span class="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">Approuvé</span>'
        : '<span class="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">En attente</span>';

      html += '<div class="glass-card rounded-xl p-5 space-y-3">';
      html += '<div class="flex items-center justify-between flex-wrap gap-2">';
      var quizBadge = '<span class="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">' + (r.quiz_slug ? esc(nomQuiz(r.quiz_slug)) : 'Général (home)') + '</span>';
      html += '<div class="flex items-center gap-2 flex-wrap"><span class="font-semibold">' + esc(r.author_name || 'Anonyme') + '</span>' + statusBadge + quizBadge + '</div>';
      html += '<div class="flex items-center gap-0.5">' + starsHtml(r.rating) + '</div>';
      html += '</div>';
      html += '<p class="text-sm text-muted-foreground">' + formatDate(r.created_at) + '</p>';
      if (r.comment) html += '<p class="text-sm text-foreground">' + esc(r.comment) + '</p>';
      if (r.ip_address) html += '<p class="text-xs text-muted-foreground/60">IP: ' + esc(r.ip_address) + '</p>';
      html += '<div class="flex gap-2 pt-2">';
      if (!r.is_approved) {
        html += '<button class="admin-action btn btn-sm text-emerald-600 border border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" data-id="' + r.id + '" data-action="approve">Approuver</button>';
      } else {
        html += '<button class="admin-action btn btn-sm text-amber-600 border border-amber-200 hover:bg-amber-50 dark:hover:bg-amber-900/20" data-id="' + r.id + '" data-action="reject">Retirer</button>';
      }
      html += '<button class="admin-action btn btn-sm text-destructive border border-destructive/20 hover:bg-destructive/10" data-id="' + r.id + '" data-action="delete">Supprimer</button>';
      html += '</div>';
      html += '</div>';
    });

    list.innerHTML = html;

    list.querySelectorAll('.admin-action').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = this.dataset.id;
        var action = this.dataset.action;
        if (action === 'delete' && !confirm('Supprimer cet avis définitivement ?')) return;
        reviewAction(id, action);
      });
    });
  }

  // ── Leads ──
  function loadLeads() {
    var tbody = document.getElementById('leads-table-body');
    if (tbody) tbody.innerHTML = '<tr><td colspan="6" style="padding:2rem;text-align:center;color:hsl(var(--muted-foreground));">Chargement...</td></tr>';

    fetch(SUPABASE_URL + '/functions/v1/admin-leads', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'x-admin-token': adminToken
      }
    })
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function (data) {
      if (data.success && Array.isArray(data.leads)) {
        allLeads = data.leads;
        majPastilles();
        renderLeads();
      } else {
        tbody.innerHTML = '<tr><td colspan="6" style="padding:2rem;text-align:center;color:hsl(var(--destructive));">Erreur de chargement.</td></tr>';
      }
    })
    .catch(function () {
      tbody.innerHTML = '<tr><td colspan="6" style="padding:2rem;text-align:center;color:hsl(var(--destructive));">Erreur réseau.</td></tr>';
    });
  }

  function renderLeads() {
    var tbody = document.getElementById('leads-table-body');
    if (!tbody) return;
    if (allLeads.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="padding:2rem;text-align:center;color:hsl(var(--muted-foreground));">Aucun lead pour le moment.</td></tr>';
      return;
    }
    var html = '';
    allLeads.forEach(function (lead) {
      var date = new Date(lead.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
      var verifiedBadge = lead.email_verified
        ? '<span style="display:inline-block;padding:0.15rem 0.5rem;border-radius:9999px;font-size:0.75rem;background:hsl(142 71% 45%/0.12);color:hsl(142 71% 35%);font-weight:500;">✓ Vérifié</span>'
        : '<span style="display:inline-block;padding:0.15rem 0.5rem;border-radius:9999px;font-size:0.75rem;background:hsl(40 95% 55%/0.12);color:hsl(40 80% 35%);font-weight:500;">En attente</span>';
      html += '<tr style="border-top:1px solid hsl(var(--border));">'
        + '<td style="padding:0.75rem 1rem;">' + escapeLeadHtml(lead.first_name) + '</td>'
        + '<td style="padding:0.75rem 1rem;">' + escapeLeadHtml(lead.email) + '</td>'
        + '<td style="padding:0.75rem 1rem;"><span style="display:inline-block;padding:0.15rem 0.5rem;border-radius:9999px;font-size:0.75rem;background:hsl(var(--primary)/0.1);color:hsl(var(--primary));">' + escapeLeadHtml(lead.subject) + '</span></td>'
        + '<td style="padding:0.75rem 1rem;font-size:0.8rem;color:hsl(var(--muted-foreground));">' + date + '</td>'
        + '<td style="padding:0.75rem 1rem;text-align:center;">' + verifiedBadge + '</td>'
        + '<td style="padding:0.75rem 1rem;text-align:center;"><input type="checkbox"' + (lead.is_closed ? ' checked' : '') + ' data-lead-id="' + lead.id + '" class="lead-closed-cb" style="width:1.1rem;height:1.1rem;cursor:pointer;accent-color:hsl(var(--primary));"></td>'
        + '</tr>';
    });
    tbody.innerHTML = html;

    // Bind checkboxes
    tbody.querySelectorAll('.lead-closed-cb').forEach(function (cb) {
      cb.addEventListener('change', function () {
        var id = this.dataset.leadId;
        var closed = this.checked;
        fetch(SUPABASE_URL + '/functions/v1/admin-leads', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + SUPABASE_KEY,
            'x-admin-token': adminToken,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ id: id, is_closed: closed })
        });
      });
    });
  }

  function escapeLeadHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ── Messages ──
  function loadMessages() {
    var listEl = document.getElementById('messages-list');
    if (listEl) listEl.innerHTML = '<p class="text-center text-muted-foreground py-8">Chargement...</p>';

    fetch(SUPABASE_URL + '/functions/v1/admin-messages', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'x-admin-token': adminToken
      }
    })
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function (data) {
      if (data.success && Array.isArray(data.messages)) {
        allMessages = data.messages;
        majPastilles();
        renderMessages();
      } else {
        listEl.innerHTML = '<p class="text-center text-destructive py-8">Erreur de chargement.</p>';
      }
    })
    .catch(function () {
      listEl.innerHTML = '<p class="text-center text-destructive py-8">Erreur réseau.</p>';
    });
  }

  function renderMessages() {
    var listEl = document.getElementById('messages-list');
    if (!listEl) return;

    var filtered = allMessages;
    if (currentMessageFilter !== 'all') {
      filtered = allMessages.filter(function (m) { return m.status === currentMessageFilter; });
    }

    if (filtered.length === 0) {
      listEl.innerHTML = '<p class="text-center text-muted-foreground py-8">Aucun message' + (currentMessageFilter !== 'all' ? ' dans cette catégorie' : '') + '.</p>';
      return;
    }

    var html = '';
    filtered.forEach(function (msg) {
      var date = new Date(msg.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      var statusColors = { 'new': 'background:hsl(var(--primary)/0.15);color:hsl(var(--primary));', 'read': 'background:hsl(var(--muted));color:hsl(var(--muted-foreground));', 'archived': 'background:hsl(var(--muted));color:hsl(var(--muted-foreground));opacity:0.6;' };
      var statusLabels = { 'new': 'Nouveau', 'read': 'Lu', 'archived': 'Archivé' };
      var isNew = msg.status === 'new';

      html += '<div class="glass-card rounded-xl p-5 space-y-3' + (isNew ? '' : ' opacity-80') + '" data-msg-id="' + msg.id + '">'
        + '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.5rem;">'
        + '<div style="display:flex;align-items:center;gap:0.75rem;">'
        + '<span style="font-weight:700;">' + escapeLeadHtml(msg.first_name) + ' ' + escapeLeadHtml(msg.last_name) + '</span>'
        + '<span style="display:inline-block;padding:0.15rem 0.5rem;border-radius:9999px;font-size:0.7rem;font-weight:600;' + (statusColors[msg.status] || '') + '">' + (statusLabels[msg.status] || msg.status) + '</span>'
        + '</div>'
        + '<span style="font-size:0.8rem;color:hsl(var(--muted-foreground));">' + date + '</span>'
        + '</div>'
        + '<div style="display:flex;flex-wrap:wrap;gap:0.75rem;font-size:0.85rem;color:hsl(var(--muted-foreground));">'
        + '<span>' + escapeLeadHtml(msg.email) + '</span>'
        + (msg.phone ? '<span>' + escapeLeadHtml(msg.phone) + '</span>' : '')
        + (msg.company ? '<span style="font-style:italic;">' + escapeLeadHtml(msg.company) + '</span>' : '')
        + '</div>'
        + '<div style="background:hsl(var(--muted)/0.5);border-radius:0.5rem;padding:0.75rem;font-size:0.875rem;line-height:1.6;white-space:pre-wrap;word-break:break-word;">' + escapeLeadHtml(msg.message) + '</div>'
        + '<div style="display:flex;gap:0.5rem;justify-content:flex-end;">';

      if (msg.status === 'new') {
        html += '<button class="btn btn-sm msg-action" data-action="read" data-id="' + msg.id + '" style="font-size:0.75rem;">Marquer lu</button>';
      }
      if (msg.status !== 'archived') {
        html += '<button class="btn btn-sm msg-action" data-action="archived" data-id="' + msg.id + '" style="font-size:0.75rem;color:hsl(var(--muted-foreground));">Archiver</button>';
      }
      html += '<button class="btn btn-sm msg-action" data-action="delete" data-id="' + msg.id + '" style="font-size:0.75rem;color:hsl(var(--destructive));">Supprimer</button>';
      html += '</div></div>';
    });

    listEl.innerHTML = html;

    // Bind action buttons
    listEl.querySelectorAll('.msg-action').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = this.dataset.id;
        var action = this.dataset.action;
        // Aucune de ces deux requêtes ne regardait sa réponse : un jeton
        // expiré, un refus du serveur ou un blocage du navigateur passaient
        // pour un succès, la ligne disparaissait de l'écran et revenait au
        // rechargement suivant. On lit désormais l'issue avant de toucher à
        // la liste, et on le dit quand ça échoue.
        var bouton = this;
        bouton.disabled = true;

        function echec(raison) {
          bouton.disabled = false;
          alert('Action impossible : ' + raison + '\n\nRechargez la page si le problème persiste.');
        }

        function lisReponse(res) {
          return res.json()
            .catch(function () { return { success: res.ok }; })
            .then(function (data) {
              if (!res.ok || !data || data.success === false) {
                throw new Error((data && data.error) || ('réponse ' + res.status));
              }
              return data;
            });
        }

        if (action === 'delete') {
          if (!confirm('Supprimer ce message ?')) { bouton.disabled = false; return; }
          fetch(SUPABASE_URL + '/functions/v1/admin-messages', {
            method: 'DELETE',
            headers: {
              'Authorization': 'Bearer ' + SUPABASE_KEY,
              'x-admin-token': adminToken,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: id })
          })
          .then(lisReponse)
          .then(function () {
            allMessages = allMessages.filter(function (m) { return m.id !== id; });
            majPastilles();
            renderMessages();
          })
          .catch(function (err) { echec(err.message || 'erreur inconnue'); });
        } else {
          fetch(SUPABASE_URL + '/functions/v1/admin-messages', {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer ' + SUPABASE_KEY,
              'x-admin-token': adminToken,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: id, status: action })
          })
          .then(lisReponse)
          .then(function () {
            var msg = allMessages.find(function (m) { return m.id === id; });
            if (msg) msg.status = action;
            majPastilles();
            renderMessages();
          })
          .catch(function (err) { echec(err.message || 'erreur inconnue'); });
        }
      });
    });
  }

  // ── Init ──
  function init() {
    var app = document.getElementById('admin-app');
    if (!app) return;

    SUPABASE_URL = app.dataset.url;
    SUPABASE_KEY = app.dataset.key;
    if (!SUPABASE_URL || !SUPABASE_KEY) return;

    // Password toggle
    var togglePw = document.getElementById('admin-toggle-pw');
    var pwInput = document.getElementById('admin-password');
    if (togglePw && pwInput) {
      togglePw.addEventListener('click', function () {
        var isPassword = pwInput.type === 'password';
        pwInput.type = isPassword ? 'text' : 'password';
        this.querySelector('.eye-open').classList.toggle('hidden');
        this.querySelector('.eye-closed').classList.toggle('hidden');
      });
    }

    // Login
    var loginBtn = document.getElementById('admin-login-btn');
    if (loginBtn) loginBtn.addEventListener('click', login);
    if (pwInput) pwInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') login(); });

    // Logout
    var logoutBtn = document.getElementById('admin-logout');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);

    // Refresh reviews
    var refreshBtn = document.getElementById('admin-refresh');
    if (refreshBtn) refreshBtn.addEventListener('click', loadReviews);

    // Export de tout ce que l'admin sait, sur trente jours
    var exportBtn = document.getElementById('admin-export');
    if (exportBtn) exportBtn.addEventListener('click', exporterTout);

    // Review Filters
    document.querySelectorAll('.admin-filter').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.admin-filter').forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');
        currentFilter = this.dataset.filter;
        renderReviews();
      });
    });

    // Tab switching
    document.querySelectorAll('.admin-tab').forEach(function (btn) {
      btn.addEventListener('click', function () {
        switchTab(this.dataset.tab);
      });
    });

    // Leads refresh
    var leadsRefresh = document.getElementById('leads-refresh');
    if (leadsRefresh) leadsRefresh.addEventListener('click', function () {
      allLeads = [];
      loadLeads();
    });

    // Messages refresh
    var messagesRefresh = document.getElementById('messages-refresh');
    if (messagesRefresh) messagesRefresh.addEventListener('click', function () {
      allMessages = [];
      loadMessages();
    });

    // Messages filter buttons
    document.querySelectorAll('.messages-filter').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.messages-filter').forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');
        currentMessageFilter = this.dataset.filter;
        renderMessages();
      });
    });

    // Actualiser : on vide la memoire des lectures et on recharge l'onglet
    // ouvert. Les autres onglets se rechargeront a leur prochaine ouverture.
    var rafraichir = document.getElementById('adm-rafraichir');
    if (rafraichir) rafraichir.addEventListener('click', function () {
      videCache();
      poseFraicheur();
      rafraichir.classList.add('tourne');
      setTimeout(function () { rafraichir.classList.remove('tourne'); }, 900);
      rechargeOnglet(currentTab);
    });

    // Stats range switch (30 / 90 / 365 days)
    document.querySelectorAll('.stats-range-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        document.querySelectorAll('.stats-range-btn').forEach(function (x) { x.classList.remove('active'); });
        this.classList.add('active');
        statsRange = parseInt(this.dataset.range, 10) || 30;
        loadTotalDaily(statsRange);
      });
    });
    // Filtre du comparatif tops / flops : aujourd'hui vs hier, 7 jours vs
    // les 7 precedents, 30 jours vs les 30 precedents. Les deux groupes de
    // boutons partagent la meme classe : chacun ne desactive que ses freres,
    // sinon changer de mesure eteindrait le filtre des tops et flops.
    document.querySelectorAll('.stats-comp-btn[data-comp]').forEach(function (b) {
      b.addEventListener('click', function () {
        document.querySelectorAll('.stats-comp-btn[data-comp]').forEach(function (x) { x.classList.remove('active'); });
        this.classList.add('active');
        statsComp = parseInt(this.dataset.comp, 10) || 7;
        renderMovers();
      });
    });
    // Periode de la liste par page. Les series quotidiennes ne sont chargees
    // que sur 62 jours au depart : choisir 90 jours ou plus les recharge plus
    // loin, une seule fois, puis la valeur reste en memoire.
    document.querySelectorAll('.stats-comp-btn[data-periode]').forEach(function (b) {
      b.addEventListener('click', function () {
        document.querySelectorAll('.stats-comp-btn[data-periode]').forEach(function (x) { x.classList.remove('active'); });
        this.classList.add('active');
        statsPeriode = parseInt(this.dataset.periode, 10) || 0;
        var besoin = statsPeriode === 0 ? 62 : statsPeriode + 2;
        if (besoin > joursCharges) {
          var listEl = document.getElementById('admin-stats-list');
          if (listEl) listEl.innerHTML = '<p class="text-center text-muted-foreground py-6">Chargement de la période...</p>';
          chargeParJour(besoin);
          chargeLancements();
        } else {
          renderStatsList();
        }
      });
    });
    // ── Commandes de l'onglet Trafic ──────────────────────────────────
    document.querySelectorAll('.stats-comp-btn[data-trafic-periode]').forEach(function (b) {
      b.addEventListener('click', function () {
        document.querySelectorAll('.stats-comp-btn[data-trafic-periode]').forEach(function (x) { x.classList.remove('active'); });
        this.classList.add('active');
        traficPeriode = parseInt(this.dataset.traficPeriode, 10) || 7;
        loadTrafic();
      });
    });
    // Les vignettes de legende allument et eteignent leur courbe, comme dans
    // la Search Console. On refuse d'eteindre la derniere allumee : un
    // graphique vide n'apprend rien et donne l'impression d'un bug.
    var legTr = document.getElementById('trafic-legende');
    if (legTr) legTr.addEventListener('click', function (e) {
      var b = e.target.closest('[data-trafic-courbe]');
      if (!b) return;
      var cle = b.dataset.traficCourbe;
      var allumees = Object.keys(traficCouchesVues).filter(function (k) { return traficCouchesVues[k]; });
      if (traficCouchesVues[cle] && allumees.length === 1) return;
      traficCouchesVues[cle] = !traficCouchesVues[cle];
      renderTraficCourbe();
    });
    // La legende de la courbe des parties a distance, meme mecanique.
    var legDi = document.getElementById('admin-distance-legende');
    if (legDi) legDi.addEventListener('click', function (e) {
      var b = e.target.closest('[data-distance-courbe]');
      if (!b) return;
      var cle = b.dataset.distanceCourbe;
      var allumees = Object.keys(distanceCouchesVues).filter(function (k) { return distanceCouchesVues[k]; });
      if (distanceCouchesVues[cle] && allumees.length === 1) return;
      distanceCouchesVues[cle] = !distanceCouchesVues[cle];
      if (_distanceCouches) {
        _distanceCouches.forEach(function (c) { c.visible = distanceCouchesVues[c.cle]; });
        renderDistanceLegende(_distanceCouches);
        drawChart(document.getElementById('admin-distance-chart'), _distanceCouches, {});
      }
    });
    // Tri des deux listes. Recliquer la meme colonne inverse le sens.
    function brancheTri(selecteur, attr, etat, redessine) {
      document.querySelectorAll(selecteur).forEach(function (b) {
        b.addEventListener('click', function () {
          var col = this.dataset[attr];
          if (etat.col === col) etat.sens = -etat.sens;
          else { etat.col = col; etat.sens = -1; }
          redessine();
        });
      });
    }
    brancheTri('[data-tri-ent]', 'triEnt', traficTriEnt, renderTraficEntonnoir);
    brancheTri('[data-tri-pages]', 'triPages', traficTriPages, renderTraficPages);

    // ── Légende de la courbe « source préférée » (onglet Trafic) ────────
    // Meme mecanique que la legende du trafic : on allume et on eteint une
    // courbe, sans jamais pouvoir eteindre la derniere.
    var legSo = document.getElementById('blog-sourcepref-legende');
    if (legSo) legSo.addEventListener('click', function (e) {
      var b = e.target.closest('[data-source-courbe]');
      if (!b) return;
      var cle = b.dataset.sourceCourbe;
      var allumees = Object.keys(sourceCouchesVues).filter(function (k) { return sourceCouchesVues[k]; });
      if (sourceCouchesVues[cle] && allumees.length === 1) return;
      sourceCouchesVues[cle] = !sourceCouchesVues[cle];
      renderSourceCourbe();
    });

    // Le canevas depend de sa largeur et de ses couleurs : on redessine au
    // redimensionnement, et au passage du clair au sombre (les series sont
    // relues dans la feuille de style).
    function redessineCourbes() {
      if (currentTab === 'trafic') {
        if (_sourceCouches) renderSourceCourbe();
        if (_traficCouches) renderTraficCourbe();
        return;
      }
      if (currentTab === 'distance') {
        if (_distanceCouches) {
          _distanceCouches.forEach(function (c) { c.couleur = teinte(c.cle === 'part' ? 'ratio' : (c.cle === 'distance' ? 'finis' : 'lances'), c.couleur); });
          renderDistanceLegende(_distanceCouches);
          drawChart(document.getElementById('admin-distance-chart'), _distanceCouches, {});
        }
        return;
      }
      if (currentTab !== 'stats') return;
      if (_lastTotalSeries) renderTotalDaily(_lastTotalSeries);
      if (_lastQuizSeries) drawLineChart(document.getElementById('admin-stats-chart'), _lastQuizSeries, _lastQuizOpts);
    }
    var rT;
    window.addEventListener('resize', function () {
      clearTimeout(rT);
      rT = setTimeout(redessineCourbes, 180);
    });
    if (window.MutationObserver) {
      new MutationObserver(function (muts) {
        for (var i = 0; i < muts.length; i++) {
          if (muts[i].attributeName === 'class') { setTimeout(redessineCourbes, 30); return; }
        }
      }).observe(document.documentElement, { attributes: true });
    }

    // Check existing auth
    checkAuth();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
