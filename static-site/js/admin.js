/**
 * Admin Dashboard - Review moderation + Article management
 */
(function () {
  'use strict';

  var SUPABASE_URL, SUPABASE_KEY;
  var adminToken = null;
  var allReviews = [];
  var currentFilter = 'all';

  // ── Articles state ──
  var allArticles = [];
  var currentArticle = null;
  var currentLang = 'fr';
  var translationCache = {}; // { "articleId-lang": { ... } }
  var currentTab = 'reviews';
  var allLeads = [];
  var allMessages = [];
  var currentMessageFilter = 'all';

  // ── Seed data (all existing articles) ──
  // AUTO-GENERATED AT BUILD TIME from config.js BLOG_ARTICLES + article TS files
  // Do NOT edit manually — add articles in data/blog/ and static-site/build/config.js
  var SEED_ARTICLES = /*__SEED_ARTICLES__*/[
    {
      internal_slug: 'les-phases-de-la-rupture-chez-l-homme',
      featured_image_url: '/blog/phases-rupture-homme.webp',
      author_id: 'mathieu-courtin',
      status: 'published',
      published_at: '2026-02-21',
      translations: [
        { lang: 'fr', slug: 'les-phases-de-la-rupture-chez-l-homme', title: "Les \u00e9tapes de la rupture chez l'Homme", meta_title: "Les phases de la rupture chez l'homme | 6 \u00e9tapes d\u00e9crypt\u00e9es", meta_description: "D\u00e9couvrez les 6 phases de la rupture chez l'homme : du d\u00e9ni \u00e0 la reconstruction. Comprendre chaque \u00e9tape pour mieux traverser une s\u00e9paration.", featured_image_alt: "Homme traversant les phases de la rupture amoureuse", excerpt: "Les 6 phases de la rupture chez l'homme : du d\u00e9ni \u00e0 la reconstruction." },
        { lang: 'en', slug: 'breakup-stages-for-men', title: 'The Stages of a Breakup for Men', meta_title: 'The Stages of a Breakup for Men | 6 Phases Explained', meta_description: 'Discover the 6 stages of a breakup for men: from denial to rebuilding. Understand each phase to better navigate a separation.', featured_image_alt: 'Man going through the stages of a romantic breakup', excerpt: 'The 6 stages of a breakup for men: from denial to rebuilding.' },
        { lang: 'es', slug: 'fases-de-la-ruptura-en-el-hombre', title: 'Las etapas de la ruptura en el hombre', meta_title: 'Las fases de la ruptura en el hombre | 6 etapas explicadas', meta_description: 'Descubre las 6 fases de la ruptura en el hombre: de la negaci\u00f3n a la reconstrucci\u00f3n. Comprende cada etapa para superar mejor una separaci\u00f3n.', featured_image_alt: 'Hombre atravesando las fases de una ruptura amorosa', excerpt: 'Las 6 fases de la ruptura en el hombre: de la negaci\u00f3n a la reconstrucci\u00f3n.' },
        { lang: 'de', slug: 'trennungsphasen-beim-mann', title: 'Die Phasen der Trennung beim Mann', meta_title: 'Die Phasen der Trennung beim Mann | 6 Stufen erkl\u00e4rt', meta_description: 'Entdecken Sie die 6 Phasen der Trennung beim Mann: von der Verleugnung bis zum Neuaufbau. Verstehen Sie jede Phase, um eine Trennung besser zu bew\u00e4ltigen.', featured_image_alt: 'Mann, der die Phasen einer Trennung durchlebt', excerpt: 'Die 6 Phasen der Trennung beim Mann: von der Verleugnung bis zum Neuaufbau.' },
        { lang: 'it', slug: 'fasi-della-rottura-nell-uomo', title: "Le fasi della rottura nell'uomo", meta_title: "Le fasi della rottura nell'uomo | 6 tappe spiegate", meta_description: "Scopri le 6 fasi della rottura nell'uomo: dalla negazione alla ricostruzione. Comprendi ogni fase per affrontare meglio una separazione.", featured_image_alt: 'Uomo che attraversa le fasi di una rottura sentimentale', excerpt: "Le 6 fasi della rottura nell'uomo: dalla negazione alla ricostruzione." }
      ]
    },
    {
      internal_slug: 'choses-pas-accepter-couple',
      featured_image_url: '/blog/limites-couple-accepter.webp',
      author_id: 'lucie-courtin',
      status: 'published',
      published_at: '2026-02-21',
      translations: [
        { lang: 'fr', slug: 'choses-pas-accepter-couple', title: "Ce qu'on ne devrait jamais accepter dans une relation amoureuse", meta_title: 'Choses \u00e0 ne pas accepter en couple | Limites essentielles', meta_description: "D\u00e9couvrez les choses \u00e0 ne pas accepter en couple : manque de respect, manipulation, jalousie toxique. Apprenez \u00e0 poser vos limites. Guide complet et gratuit.", featured_image_alt: 'Couple posant des limites dans leur relation amoureuse', excerpt: "Les comportements \u00e0 ne jamais tol\u00e9rer en couple et comment poser ses limites." },
        { lang: 'en', slug: 'things-not-accept-relationship', title: 'Things You Should Never Accept in a Relationship', meta_title: 'Things Not to Accept in a Relationship | Essential Boundaries', meta_description: 'Discover things you should never accept in a relationship: disrespect, manipulation, toxic jealousy. Learn to set healthy boundaries. Free complete guide.', featured_image_alt: 'Couple setting boundaries in their romantic relationship', excerpt: 'Behaviors you should never tolerate in a relationship and how to set limits.' },
        { lang: 'es', slug: 'cosas-no-aceptar-pareja', title: 'Lo que nunca deber\u00edas aceptar en una relaci\u00f3n de pareja', meta_title: 'Cosas que no aceptar en pareja | L\u00edmites esenciales', meta_description: 'Descubre las cosas que no debes aceptar en pareja: falta de respeto, manipulaci\u00f3n, celos t\u00f3xicos. Aprende a poner l\u00edmites. Gu\u00eda completa y gratuita.', featured_image_alt: 'Pareja estableciendo l\u00edmites en su relaci\u00f3n sentimental', excerpt: 'Los comportamientos que nunca debes tolerar en pareja y c\u00f3mo poner l\u00edmites.' },
        { lang: 'de', slug: 'grenzen-beziehung-nicht-akzeptieren', title: 'Was man in einer Beziehung niemals akzeptieren sollte', meta_title: 'Grenzen in der Beziehung | Was nicht akzeptabel ist', meta_description: 'Erfahren Sie, was in einer Beziehung nicht akzeptabel ist: Respektlosigkeit, Manipulation, toxische Eifersucht. Lernen Sie Grenzen zu setzen. Kostenloser Leitfaden.', featured_image_alt: 'Paar setzt Grenzen in ihrer Liebesbeziehung', excerpt: 'Verhaltensweisen, die in einer Beziehung nicht toleriert werden sollten.' },
        { lang: 'it', slug: 'cose-non-accettare-coppia', title: 'Cose da non accettare mai in una relazione di coppia', meta_title: 'Cose da non accettare in coppia | Limiti essenziali', meta_description: 'Scopri le cose da non accettare in coppia: mancanza di rispetto, manipolazione, gelosia tossica. Impara a porre i tuoi limiti. Guida completa e gratuita.', featured_image_alt: 'Coppia che stabilisce limiti nella propria relazione sentimentale', excerpt: 'I comportamenti da non tollerare mai in coppia e come porre i propri limiti.' }
      ]
    },
    {
      internal_slug: 'avis-tinder',
      featured_image_url: '/blog/avis-tinder.webp',
      author_id: 'mathieu-courtin',
      status: 'published',
      published_at: '2026-02-24',
      translations: [
        { lang: 'fr', slug: 'avis-tinder', title: 'Que vaut Tinder en 2026 ? Notre avis et test complet', meta_title: "Avis Tinder 2026 : notre verdict honn\u00eate apr\u00e8s des ann\u00e9es de swipe", meta_description: "Tinder vaut-il encore le coup en 2026 ? Notre avis honn\u00eate sur les fonctionnalit\u00e9s, les prix, les faux profils et les alternatives. On ne m\u00e2che pas nos mots.", featured_image_alt: "L'avis de QuizCouple sur tinder en 2026", excerpt: "Notre avis sur Tinder : ce que l'appli fait bien, mal, et pour qui elle est faite." },
        { lang: 'en', slug: 'tinder-review', title: 'Is Tinder worth it in 2026? Our full review and test', meta_title: 'Tinder review 2026: Our honest verdict after years of swiping', meta_description: "Is Tinder still worth it in 2026? Our honest opinion on features, prices, fake profiles, and alternatives. We don't pull any punches.", featured_image_alt: "QuizCouple's opinion on Tinder in 2026", excerpt: "Our review of Tinder: what the app does well, poorly, and who it's made for." },
        { lang: 'es', slug: 'tinder-opiniones-vale-la-pena', title: '\u00bfQu\u00e9 vale Tinder en 2026? nuestra opini\u00f3n y prueba completa', meta_title: 'Opiniones Tinder 2026 : nuestro veredicto honesto', meta_description: '\u00bfVale la pena Tinder en 2026? nuestra opini\u00f3n honesta sobre las funciones, los precios, los perfiles falsos y las alternativas. no nos mordemos la lengua.', featured_image_alt: 'La opini\u00f3n de QuizCouple sobre Tinder en 2026', excerpt: 'Nuestra opini\u00f3n sobre Tinder: lo que la app hace bien, mal, y para qui\u00e9n est\u00e1 hecha.' },
        { lang: 'de', slug: 'tinder-bewertung', title: 'Was taugt Tinder im Jahr 2026? Unsere Bewertung und der komplette Test', meta_title: 'Tinder Erfahrungen 2026: Unser ehrliches Urteil', meta_description: 'Lohnt sich Tinder 2026 noch? Unsere ehrliche Meinung zu Funktionen, Preisen, Fake-Profilen und Alternativen. Wir nehmen kein Blatt vor den Mund.', featured_image_alt: 'Die Meinung von QuizCouple zu Tinder im Jahr 2026', excerpt: 'Unsere Meinung zu Tinder: Was die App gut und schlecht macht und f\u00fcr wen sie geeignet ist.' },
        { lang: 'it', slug: 'recensione-tinder', title: 'Quanto vale Tinder nel 2026? La nostra recensione e test completo', meta_title: "Recensione di Tinder 2026: il nostro onesto verdetto sull'app", meta_description: 'Tinder vale ancora la pena nel 2026? La nostra opinione onesta su funzionalit\u00e0, prezzi, profili falsi e alternative. Non usiamo mezzi termini.', featured_image_alt: "L'opinione di QuizCouple su Tinder nel 2026", excerpt: "La nostra opinione su Tinder: cosa fa bene l'app, cosa fa male e per chi \u00e8 pensata." }
      ]
    },
    {
      internal_slug: 'avis-bumble',
      featured_image_url: '/blog/avis-bumble.webp',
      author_id: 'mathieu-courtin',
      status: 'published',
      published_at: '2026-02-25',
      translations: [
        { lang: 'fr', slug: 'avis-bumble', title: "Bumble en 2026 : une application hors budget et d\u00e9laiss\u00e9 ?", meta_title: "Notre avis sur Bumble en 2026 : test et r\u00e9sultats de l'app", meta_description: "Notre avis complet sur Bumble apr\u00e8s plusieurs mois de test : fonctionnalit\u00e9s, prix, r\u00e9sultats r\u00e9els et verdict honn\u00eate. On vous dit si \u00e7a vaut vraiment le coup en 2026.", featured_image_alt: 'image bumble avis', excerpt: "On a test\u00e9 Bumble pendant des mois. Voici notre verdict honn\u00eate et notre note." },
        { lang: 'en', slug: 'bumble-app-review', title: 'Bumble in 2026: an over-budget and neglected app?', meta_title: 'Our Bumble review in 2026: app test and results', meta_description: "Our complete Bumble review after several months of testing: features, price, real results, and honest verdict. We tell you if it's really worth it in 2026.", featured_image_alt: 'bumble review image', excerpt: 'We tested Bumble for months. Here is our honest verdict and rating.' },
        { lang: 'es', slug: 'opiniones-bumble', title: 'Bumble en 2026: \u00bfuna aplicaci\u00f3n fuera de presupuesto y abandonada?', meta_title: 'Nuestra opini\u00f3n sobre Bumble en 2026: prueba y resultados de la app', meta_description: 'Nuestra opini\u00f3n completa sobre Bumble tras varios meses de prueba: funcionalidades, precio, resultados reales y veredicto honesto. Te decimos si realmente vale la pena en 2026.', featured_image_alt: 'imagen opiniones bumble', excerpt: 'Hemos probado Bumble durante meses. Aqu\u00ed tienes nuestro veredicto honesto y nuestra nota.' },
        { lang: 'de', slug: 'bumble-erfahrungen', title: 'Bumble im Jahr 2026: Eine \u00fcberteuerte und vernachl\u00e4ssigte App?', meta_title: 'Unsere Bumble-Erfahrungen 2026: App-Test und Ergebnisse', meta_description: 'Unser ausf\u00fchrlicher Bumble-Test nach mehreren Monaten: Funktionen, Preis, echte Ergebnisse und ehrliches Fazit. Wir verraten, ob es sich 2026 wirklich lohnt.', featured_image_alt: 'bild bumble erfahrungen', excerpt: 'Wir haben Bumble monatelang getestet. Hier ist unser ehrliches Fazit und unsere Bewertung.' },
        { lang: 'it', slug: 'recensione-bumble', title: "Bumble nel 2026: un'applicazione fuori budget e trascurata?", meta_title: "La nostra recensione di Bumble nel 2026: test e risultati dell'app", meta_description: 'La nostra recensione completa su Bumble dopo diversi mesi di test: funzionalit\u00e0, prezzo, risultati reali e verdetto onesto. Ti diciamo se ne vale davvero la pena nel 2026.', featured_image_alt: 'immagine recensione bumble', excerpt: 'Abbiamo testato Bumble per mesi. Ecco il nostro verdetto onesto e il nostro voto.' }
      ]
    },
    {
      internal_slug: 'avis-hinge',
      featured_image_url: '/blog/avis-hinge.webp',
      author_id: 'mathieu-courtin',
      status: 'published',
      published_at: '2026-02-27',
      translations: [
        { lang: 'fr', slug: 'avis-hinge-rencontre', title: "Test de l'application Hinge en 2026 : avis et explications", meta_title: 'Notre avis sur Hinge en 2026 : test et r\u00e9sultats', meta_description: "On a test\u00e9 Hinge en France pendant plusieurs mois. Accroches, algorithme, tarifs r\u00e9els, bannissements et r\u00e9sultats : notre avis complet, honn\u00eate et sans langue de bois.", featured_image_alt: 'image hinge avis application rencontre', excerpt: "Hinge, l'appli \"con\u00e7ue pour \u00eatre supprim\u00e9e\". On a v\u00e9rifi\u00e9 si la promesse tient vraiment en France." },
        { lang: 'en', slug: 'hinge-dating-app-review', title: 'Hinge dating app review in 2026: our honest test and verdict', meta_title: 'Our Hinge review in 2026: app test and results', meta_description: 'We tested Hinge for several months. Prompts, algorithm, real pricing, bans, and results: our complete, honest, no-nonsense review.', featured_image_alt: 'hinge review dating app image', excerpt: 'Hinge, the app "designed to be deleted." We checked whether the promise actually holds up.' },
        { lang: 'es', slug: 'opinion-hinge-app-citas', title: 'Test de la aplicaci\u00f3n Hinge en 2026: opini\u00f3n y explicaciones', meta_title: 'Nuestra opini\u00f3n sobre Hinge en 2026: prueba y resultados', meta_description: 'Hemos probado Hinge en Espa\u00f1a durante varios meses. Frases para romper el hielo, algoritmo, precios reales, baneos y resultados: nuestra opini\u00f3n completa, honesta y sin rodeos.', featured_image_alt: 'imagen hinge opini\u00f3n aplicaci\u00f3n citas', excerpt: 'Hinge, la app "dise\u00f1ada para ser eliminada". Hemos comprobado si la promesa se cumple realmente en Espa\u00f1a.' },
        { lang: 'de', slug: 'hinge-erfahrungen-test', title: 'Hinge im Test 2026: Erfahrungen und ehrliche Bewertung', meta_title: 'Unsere Hinge-Erfahrungen 2026: Test und Ergebnisse', meta_description: 'Wir haben Hinge in Deutschland mehrere Monate lang getestet. Prompts, Algorithmus, echte Preise, Kontosperren und Ergebnisse: unser vollst\u00e4ndiger, ehrlicher Erfahrungsbericht ohne Besch\u00f6nigung.', featured_image_alt: 'bild hinge erfahrungen dating-app', excerpt: 'Hinge, die App "die gel\u00f6scht werden soll". Wir haben gepr\u00fcft, ob das Versprechen in Deutschland wirklich h\u00e4lt.' },
        { lang: 'it', slug: 'recensione-hinge-app', title: "Test dell'app Hinge nel 2026: recensione e spiegazioni", meta_title: 'La nostra recensione di Hinge nel 2026: test e risultati', meta_description: "Abbiamo testato Hinge in Italia per diversi mesi. Spunti di conversazione, algoritmo, prezzi reali, ban e risultati: la nostra recensione completa, onesta e senza peli sulla lingua.", featured_image_alt: 'immagine hinge recensione app incontri', excerpt: "Hinge, l'app \"progettata per essere cancellata\". Abbiamo verificato se la promessa regge davvero in Italia." }
      ]
    },
    {
      internal_slug: 'avis-badoo',
      featured_image_url: '/blog/avis-badoo.webp',
      author_id: 'mathieu-courtin',
      status: 'published',
      published_at: '2026-02-28',
      translations: [
        { lang: 'fr', slug: 'avis-badoo', title: "Notre avis sur l'application de rencontre Badoo", meta_title: "Avis Badoo 2026 : ce qu'on en pense vraiment apr\u00e8s des mois de test", meta_description: "L'\u00e9quipe QuizCouple a test\u00e9 Badoo pendant plusieurs mois. R\u00e9sultats, ressenti c\u00f4t\u00e9 homme et c\u00f4t\u00e9 femme, tarifs, faux profils : notre avis complet et sans filtre.", featured_image_alt: "Notre avis sur l'application de rencontre Badoo en 2026", excerpt: "Badoo, tout le monde la conna\u00eet, personne n'en parle franchement. On l'a test\u00e9e." },
        { lang: 'en', slug: 'badoo-review', title: 'Our review of the Badoo dating app', meta_title: 'Badoo review 2026: what we really think after months of testing', meta_description: 'The QuizCouple team tested Badoo for several months. Results, experience as a man and as a woman, pricing, fake profiles: our complete, unfiltered review.', featured_image_alt: 'Our review of the Badoo dating app in 2026', excerpt: 'Badoo, everyone knows it, nobody talks about it honestly. We tested it.' },
        { lang: 'es', slug: 'opinion-badoo', title: 'Nuestra opini\u00f3n sobre la aplicaci\u00f3n de citas Badoo', meta_title: 'Opiniones Badoo 2026: lo que pensamos de verdad tras meses de prueba', meta_description: 'El equipo QuizCouple ha probado Badoo durante varios meses. Resultados, experiencia como hombre y como mujer, precios, perfiles falsos: nuestra opini\u00f3n completa y sin filtros.', featured_image_alt: 'Nuestra opini\u00f3n sobre la aplicaci\u00f3n de citas Badoo en 2026', excerpt: 'Badoo, todo el mundo la conoce, nadie habla de ella con franqueza. La hemos probado.' },
        { lang: 'de', slug: 'badoo-erfahrungen', title: 'Unsere Meinung zur Dating-App Badoo', meta_title: 'Badoo Erfahrungen 2026: Was wir nach monatelangem Test wirklich davon halten', meta_description: 'Das QuizCouple-Team hat Badoo mehrere Monate lang getestet. Ergebnisse, Erfahrungen aus m\u00e4nnlicher und weiblicher Sicht, Preise, Fake-Profile: unser vollst\u00e4ndiger und ehrlicher Erfahrungsbericht.', featured_image_alt: 'Unsere Meinung zur Dating-App Badoo im Jahr 2026', excerpt: 'Badoo \u2014 jeder kennt sie, aber niemand spricht offen dar\u00fcber. Wir haben sie getestet.' },
        { lang: 'it', slug: 'recensione-badoo', title: "La nostra opinione sull'app di incontri Badoo", meta_title: 'Recensione Badoo 2026: cosa ne pensiamo davvero dopo mesi di test', meta_description: "Il team QuizCouple ha testato Badoo per diversi mesi. Risultati, esperienza lato uomo e lato donna, prezzi, profili falsi: la nostra recensione completa e senza filtri.", featured_image_alt: "La nostra opinione sull'app di incontri Badoo nel 2026", excerpt: "Badoo, tutti la conoscono, nessuno ne parla apertamente. Noi l'abbiamo testata." }
      ]
    },
    {
      internal_slug: 'femme-malheureuse-en-couple',
      featured_image_url: '',
      author_id: 'mathieu-courtin',
      status: 'published',
      published_at: '2026-03-01',
      translations: [
        { lang: 'fr', slug: 'femme-malheureuse-en-couple', title: "Comment reconna\u00eetre une femme malheureuse en couple : les vrais signes", meta_title: "Comment reconna\u00eetre une femme malheureuse en couple : les vrais signes", meta_description: "Elle sourit encore, mais quelque chose a chang\u00e9. Les signes qu'une femme est malheureuse en couple sont souvent l\u00e0 depuis un moment. On vous explique quoi regarder.", featured_image_alt: "Femme pensive assise seule, signes de mal-\u00eatre dans le couple", excerpt: "Les signes sont souvent l\u00e0 depuis longtemps. On ne sait juste pas quoi regarder." },
        { lang: 'en', slug: 'unhappy-woman-in-relationship-signs', title: 'How to Recognize an Unhappy Woman in a Relationship: The Real Signs', meta_title: 'How to Recognize an Unhappy Woman in a Relationship: The Real Signs', meta_description: "She still smiles, but something has changed. The signs a woman is unhappy in a relationship are often there -- you just don't know what to look for. Here's what to watch.", featured_image_alt: 'Pensive woman sitting alone, signs of unhappiness in a relationship', excerpt: "The signs have often been there for a while. You just didn't know what to look for." },
        { lang: 'es', slug: 'mujer-infeliz-en-pareja-senales', title: 'C\u00f3mo reconocer a una mujer infeliz en pareja: las verdaderas se\u00f1ales', meta_title: 'C\u00f3mo reconocer a una mujer infeliz en pareja: las verdaderas se\u00f1ales', meta_description: 'Sigue sonriendo, pero algo ha cambiado. Las se\u00f1ales de que una mujer es infeliz en pareja llevan tiempo ah\u00ed. Te explicamos qu\u00e9 mirar.', featured_image_alt: 'Mujer pensativa sentada sola, se\u00f1ales de malestar en la pareja', excerpt: 'Las se\u00f1ales llevan tiempo ah\u00ed. Simplemente no sab\u00edas qu\u00e9 mirar.' },
        { lang: 'de', slug: 'unglueckliche-frau-in-beziehung-anzeichen', title: 'Wie man eine ungl\u00fcckliche Frau in einer Beziehung erkennt: Die wahren Anzeichen', meta_title: 'Wie man eine ungl\u00fcckliche Frau in einer Beziehung erkennt: Die wahren Anzeichen', meta_description: 'Sie l\u00e4chelt noch, aber etwas hat sich ver\u00e4ndert. Die Anzeichen, dass eine Frau in der Beziehung ungl\u00fccklich ist, sind oft schon lange da. Wir erkl\u00e4ren, worauf du achten solltest.', featured_image_alt: 'Nachdenkliche Frau allein sitzend, Anzeichen von Unzufriedenheit in der Beziehung', excerpt: 'Die Anzeichen sind oft schon lange da. Man wei\u00df nur nicht, worauf man achten soll.' },
        { lang: 'it', slug: 'donna-infelice-in-coppia-segnali', title: 'Come riconoscere una donna infelice in coppia: i veri segnali', meta_title: 'Come riconoscere una donna infelice in coppia: i veri segnali', meta_description: 'Sorride ancora, ma qualcosa \u00e8 cambiato. I segnali che una donna \u00e8 infelice in coppia spesso ci sono da tempo. Ti spieghiamo cosa osservare.', featured_image_alt: 'Donna pensierosa seduta da sola, segnali di malessere nella coppia', excerpt: "I segnali ci sono spesso da tempo. Semplicemente non sapevi cosa cercare." }
      ]
    }
  ];

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

  function showDashboard() {
    document.getElementById('admin-login').classList.add('hidden');
    document.getElementById('admin-dashboard').classList.remove('hidden');
  }

  // ── Tab switching ──
  function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.admin-tab').forEach(function (b) { b.classList.remove('active'); });
    document.querySelector('.admin-tab[data-tab="' + tab + '"]').classList.add('active');

    document.getElementById('admin-reviews-tab').classList.toggle('hidden', tab !== 'reviews');
    document.getElementById('admin-articles-tab').classList.toggle('hidden', tab !== 'articles');
    document.getElementById('admin-leads-tab').classList.toggle('hidden', tab !== 'leads');
    document.getElementById('admin-messages-tab').classList.toggle('hidden', tab !== 'messages');

    if (tab === 'articles' && allArticles.length === 0) {
      loadArticles();
    }
    if (tab === 'leads' && allLeads.length === 0) {
      loadLeads();
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
        updateStats();
        renderReviews();
      } else {
        throw new Error('Invalid response format');
      }
    })
    .catch(function () {
      fetch(SUPABASE_URL + '/rest/v1/reviews?select=*&order=created_at.desc&limit=100', {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
      })
      .then(function (res) { return res.json(); })
      .then(function (reviews) {
        if (Array.isArray(reviews)) {
          allReviews = reviews;
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
      html += '<div class="flex items-center gap-2"><span class="font-semibold">' + esc(r.author_name || 'Anonyme') + '</span>' + statusBadge + '</div>';
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
    if (tbody) tbody.innerHTML = '<tr><td colspan="5" style="padding:2rem;text-align:center;color:hsl(var(--muted-foreground));">Chargement...</td></tr>';

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
        renderLeads();
      } else {
        tbody.innerHTML = '<tr><td colspan="5" style="padding:2rem;text-align:center;color:hsl(var(--destructive));">Erreur de chargement.</td></tr>';
      }
    })
    .catch(function () {
      tbody.innerHTML = '<tr><td colspan="5" style="padding:2rem;text-align:center;color:hsl(var(--destructive));">Erreur réseau.</td></tr>';
    });
  }

  function renderLeads() {
    var tbody = document.getElementById('leads-table-body');
    if (!tbody) return;
    if (allLeads.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="padding:2rem;text-align:center;color:hsl(var(--muted-foreground));">Aucun lead pour le moment.</td></tr>';
      return;
    }
    var html = '';
    allLeads.forEach(function (lead) {
      var date = new Date(lead.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
      html += '<tr style="border-top:1px solid hsl(var(--border));">'
        + '<td style="padding:0.75rem 1rem;">' + escapeLeadHtml(lead.first_name) + '</td>'
        + '<td style="padding:0.75rem 1rem;">' + escapeLeadHtml(lead.email) + '</td>'
        + '<td style="padding:0.75rem 1rem;"><span style="display:inline-block;padding:0.15rem 0.5rem;border-radius:9999px;font-size:0.75rem;background:hsl(var(--primary)/0.1);color:hsl(var(--primary));">' + escapeLeadHtml(lead.subject) + '</span></td>'
        + '<td style="padding:0.75rem 1rem;font-size:0.8rem;color:hsl(var(--muted-foreground));">' + date + '</td>'
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
        if (action === 'delete') {
          if (!confirm('Supprimer ce message ?')) return;
          fetch(SUPABASE_URL + '/functions/v1/admin-messages', {
            method: 'DELETE',
            headers: {
              'Authorization': 'Bearer ' + SUPABASE_KEY,
              'x-admin-token': adminToken,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: id })
          }).then(function () {
            allMessages = allMessages.filter(function (m) { return m.id !== id; });
            renderMessages();
          });
        } else {
          fetch(SUPABASE_URL + '/functions/v1/admin-messages', {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer ' + SUPABASE_KEY,
              'x-admin-token': adminToken,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: id, status: action })
          }).then(function () {
            var msg = allMessages.find(function (m) { return m.id === id; });
            if (msg) msg.status = action;
            renderMessages();
          });
        }
      });
    });
  }

  // ── Articles ──
  function adminBlogFetch(action, params) {
    var qs = '?action=' + action;
    if (params) {
      Object.keys(params).forEach(function (k) { qs += '&' + k + '=' + encodeURIComponent(params[k]); });
    }
    return fetch(SUPABASE_URL + '/functions/v1/admin-blog' + qs, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'x-admin-token': adminToken
      }
    }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    });
  }

  function adminBlogPost(action, body) {
    return fetch(SUPABASE_URL + '/functions/v1/admin-blog?action=' + action, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json',
        'x-admin-token': adminToken
      },
      body: JSON.stringify(body)
    }).then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok) {
          var errMsg = (data && data.error) ? data.error : 'HTTP ' + res.status;
          throw new Error(errMsg);
        }
        return data;
      });
    });
  }

  function loadArticles() {
    var listEl = document.getElementById('articles-list');
    listEl.innerHTML = '<p class="text-center text-muted-foreground py-8">Chargement...</p>';

    adminBlogFetch('list')
      .then(function (data) {
        if (data.success && data.articles) {
          allArticles = data.articles;
          renderArticles();
        } else {
          listEl.innerHTML = '<p class="text-center text-destructive py-8">Erreur: ' + esc(data.error || 'Réponse invalide') + '</p>';
        }
      })
      .catch(function (err) {
        listEl.innerHTML = '<p class="text-center text-destructive py-8">Erreur de connexion. Vérifiez que l\'Edge Function admin-blog est déployée.</p>';
      });
  }

  function renderArticles() {
    var listEl = document.getElementById('articles-list');

    if (allArticles.length === 0) {
      listEl.innerHTML = '<div class="text-center py-12 space-y-4">'
        + '<p class="text-muted-foreground">Aucun article. Cliquez sur "+ Nouvel article" pour en ajouter un.</p>'
        + '</div>';
      return;
    }

    var html = '';
    allArticles.forEach(function (article) {
      var translations = article.blog_article_translations || [];
      var langBadges = '';
      var LANGS = ['fr', 'en', 'es', 'de', 'it'];
      LANGS.forEach(function (lang) {
        var tr = translations.find(function (t) { return t.lang === lang; });
        if (tr) {
          langBadges += '<span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium '
            + (tr.is_complete ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400')
            + '">' + lang.toUpperCase() + '</span> ';
        } else {
          langBadges += '<span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground">' + lang.toUpperCase() + '</span> ';
        }
      });

      var frTitle = '';
      var frTranslation = translations.find(function (t) { return t.lang === 'fr'; });
      if (frTranslation && frTranslation.title) frTitle = frTranslation.title;

      var statusBadge = article.status === 'published'
        ? '<span class="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">Publié</span>'
        : '<span class="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">Brouillon</span>';

      html += '<div class="glass-card rounded-xl p-5 cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all article-card" data-id="' + article.id + '" style="overflow:hidden;">';
      html += '<div style="display:flex;align-items:flex-start;gap:1rem;overflow:hidden;">';

      // Image thumbnail
      if (article.featured_image_url) {
        html += '<img src="' + esc(article.featured_image_url) + '" alt="" style="width:5rem;height:3.5rem;border-radius:0.5rem;object-fit:cover;flex-shrink:0;">';
      } else {
        html += '<div style="width:5rem;height:3.5rem;border-radius:0.5rem;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:0.75rem;background:hsl(var(--muted));color:hsl(var(--muted-foreground));">No img</div>';
      }

      html += '<div style="flex:1;min-width:0;overflow:hidden;">';
      html += '<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.25rem;">';
      html += '<h3 style="font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;">' + esc(frTitle || article.internal_slug) + '</h3>';
      html += statusBadge;
      html += '</div>';
      html += '<p class="text-sm text-muted-foreground" style="margin-bottom:0.5rem;overflow:hidden;text-overflow:ellipsis;">/' + esc(article.internal_slug) + '</p>';
      html += '<div style="display:flex;align-items:center;gap:0.25rem;flex-wrap:wrap;">' + langBadges + '</div>';
      html += '</div>';
      html += '</div>';
      html += '</div>';
    });

    listEl.innerHTML = html;

    // Bind click handlers
    listEl.querySelectorAll('.article-card').forEach(function (card) {
      card.addEventListener('click', function () {
        openArticleEditor(this.dataset.id);
      });
    });
  }

  function promptCreateArticle() {
    var slug = prompt('Slug interne de l\'article (ex: avis-badoo) :');
    if (!slug) return;
    slug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');

    adminBlogPost('create', { internal_slug: slug, title: slug, status: 'draft' })
      .then(function (data) {
        if (data.success) {
          loadArticles();
        } else {
          alert('Erreur: ' + (data.error || 'Création échouée'));
        }
      })
      .catch(function () {
        alert('Erreur de connexion');
      });
  }

  function openArticleEditor(articleId) {
    currentArticle = allArticles.find(function (a) { return a.id === articleId; });
    if (!currentArticle) return;

    document.getElementById('articles-list-view').classList.add('hidden');
    document.getElementById('article-editor-view').classList.remove('hidden');
    document.getElementById('article-editor-title').textContent = currentArticle.internal_slug;

    // Set status select
    var statusSelect = document.getElementById('article-status-select');
    if (statusSelect) statusSelect.value = currentArticle.status || 'draft';

    // Show image preview
    updateImagePreview();

    // Reset to FR tab
    currentLang = 'fr';
    document.querySelectorAll('.lang-tab').forEach(function (b) { b.classList.remove('active'); });
    document.querySelector('.lang-tab[data-lang="fr"]').classList.add('active');

    // Clear cache for fresh load
    translationCache = {};

    // Load FR translation
    loadTranslation(articleId, 'fr');
  }

  // ── Delete article with confirmation ──
  function showDeleteModal() {
    if (!currentArticle) return;
    var modal = document.getElementById('delete-modal');
    var slugEl = document.getElementById('delete-modal-slug');
    if (slugEl) slugEl.textContent = currentArticle.internal_slug;
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
  }

  function hideDeleteModal() {
    var modal = document.getElementById('delete-modal');
    modal.classList.add('hidden');
    modal.style.display = 'none';
  }

  function confirmDeleteArticle() {
    if (!currentArticle) return;
    var articleId = currentArticle.id;

    hideDeleteModal();

    adminBlogPost('delete', { id: articleId })
      .then(function (data) {
        if (data.success) {
          allArticles = allArticles.filter(function (a) { return a.id !== articleId; });
          closeArticleEditor();
          renderArticles();
        } else {
          alert('Erreur: ' + (data.error || 'Suppression échouée'));
        }
      })
      .catch(function () {
        alert('Erreur de connexion lors de la suppression');
      });
  }

  // ── Status toggle ──
  function changeArticleStatus(newStatus) {
    if (!currentArticle) return;
    adminBlogPost('update', { id: currentArticle.id, status: newStatus })
      .then(function (data) {
        if (data.success) {
          currentArticle.status = newStatus;
          var idx = allArticles.findIndex(function (a) { return a.id === currentArticle.id; });
          if (idx >= 0) allArticles[idx].status = newStatus;
        }
      });
  }

  // ── Seed articles from static data ──
  function seedArticles() {
    var modal = document.getElementById('seed-modal');
    var statusEl = document.getElementById('seed-modal-status');
    var actionsEl = document.getElementById('seed-modal-actions');
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    actionsEl.classList.add('hidden');
    statusEl.textContent = 'Envoi des 6 articles et 30 traductions en cours...';

    adminBlogPost('seed', { articles: SEED_ARTICLES })
      .then(function (data) {
        if (data.success) {
          statusEl.textContent = 'Terminé ! ' + (data.created || 0) + ' créé(s), ' + (data.skipped || 0) + ' mis à jour.';
          if (data.errors && data.errors.length > 0) {
            statusEl.textContent += ' Erreurs: ' + data.errors.join(', ');
          }
          actionsEl.classList.remove('hidden');
          // Refresh article list
          allArticles = [];
          loadArticles();
        } else {
          statusEl.textContent = 'Erreur: ' + (data.error || 'Échec de la synchronisation');
          actionsEl.classList.remove('hidden');
        }
      })
      .catch(function (err) {
        statusEl.textContent = 'Erreur de connexion: ' + (err.message || 'Échec');
        actionsEl.classList.remove('hidden');
      });
  }

  function hideSeedModal() {
    var modal = document.getElementById('seed-modal');
    modal.classList.add('hidden');
    modal.style.display = 'none';
  }

  function updateImagePreview() {
    var preview = document.getElementById('article-image-preview');
    if (currentArticle && currentArticle.featured_image_url) {
      preview.innerHTML = '<img src="' + esc(currentArticle.featured_image_url) + '" alt="" class="w-full h-full object-cover">';
    } else {
      preview.innerHTML = '<span>Aucune image</span>';
    }
    document.getElementById('article-image-status').textContent = '';
  }

  function closeArticleEditor() {
    document.getElementById('article-editor-view').classList.add('hidden');
    document.getElementById('articles-list-view').classList.remove('hidden');
    currentArticle = null;
    translationCache = {};
  }

  function loadTranslation(articleId, lang) {
    var cacheKey = articleId + '-' + lang;
    if (translationCache[cacheKey]) {
      fillTranslationForm(translationCache[cacheKey]);
      return;
    }

    // Clear form while loading
    clearTranslationForm();
    document.getElementById('article-save-status').textContent = 'Chargement...';

    adminBlogFetch('get', { id: articleId, lang: lang })
      .then(function (data) {
        if (data.success) {
          var tr = data.translation || {};
          translationCache[cacheKey] = tr;
          fillTranslationForm(tr);
          document.getElementById('article-save-status').textContent = '';
        } else {
          document.getElementById('article-save-status').textContent = 'Erreur de chargement';
        }
      })
      .catch(function () {
        document.getElementById('article-save-status').textContent = 'Erreur de connexion';
      });
  }

  function clearTranslationForm() {
    document.getElementById('article-field-slug').value = '';
    document.getElementById('article-field-title').value = '';
    document.getElementById('article-field-meta-title').value = '';
    document.getElementById('article-field-meta-description').value = '';
    document.getElementById('article-field-alt').value = '';
    updateCharCounts();
  }

  function fillTranslationForm(tr) {
    document.getElementById('article-field-slug').value = tr.slug || '';
    document.getElementById('article-field-title').value = tr.title || '';
    document.getElementById('article-field-meta-title').value = tr.meta_title || '';
    document.getElementById('article-field-meta-description').value = tr.meta_description || '';
    document.getElementById('article-field-alt').value = tr.featured_image_alt || '';
    updateCharCounts();
  }

  function getTranslationFormData() {
    return {
      slug: document.getElementById('article-field-slug').value.trim(),
      title: document.getElementById('article-field-title').value.trim(),
      meta_title: document.getElementById('article-field-meta-title').value.trim(),
      meta_description: document.getElementById('article-field-meta-description').value.trim(),
      featured_image_alt: document.getElementById('article-field-alt').value.trim()
    };
  }

  function saveCurrentFormToCache() {
    if (!currentArticle) return;
    var cacheKey = currentArticle.id + '-' + currentLang;
    var formData = getTranslationFormData();
    var cached = translationCache[cacheKey] || {};
    Object.keys(formData).forEach(function (k) { cached[k] = formData[k]; });
    translationCache[cacheKey] = cached;
  }

  function switchLang(lang) {
    if (!currentArticle) return;
    // Save current form data to cache before switching
    saveCurrentFormToCache();

    currentLang = lang;
    document.querySelectorAll('.lang-tab').forEach(function (b) { b.classList.remove('active'); });
    document.querySelector('.lang-tab[data-lang="' + lang + '"]').classList.add('active');

    loadTranslation(currentArticle.id, lang);
  }

  function saveTranslation() {
    if (!currentArticle) return;

    var formData = getTranslationFormData();
    var statusEl = document.getElementById('article-save-status');
    var saveBtn = document.getElementById('article-save-lang');

    saveBtn.disabled = true;
    statusEl.textContent = 'Enregistrement...';
    statusEl.className = 'text-sm text-muted-foreground self-center';

    // Get the cached translation to preserve existing data (sections, etc.)
    var cacheKey = currentArticle.id + '-' + currentLang;
    var cached = translationCache[cacheKey] || {};

    var body = {
      article_id: currentArticle.id,
      lang: currentLang,
      slug: formData.slug,
      title: formData.title,
      meta_title: formData.meta_title,
      meta_description: formData.meta_description,
      featured_image_alt: formData.featured_image_alt,
      excerpt: cached.excerpt || '',
      introduction: cached.introduction || '',
      quick_summary: cached.quick_summary || [],
      sections: cached.sections || [],
      is_complete: !!(formData.title && formData.meta_title && formData.meta_description && formData.slug)
    };

    adminBlogPost('save-translation', body)
      .then(function (data) {
        saveBtn.disabled = false;
        if (data.success) {
          statusEl.textContent = 'Enregistré !';
          statusEl.className = 'text-sm text-emerald-600 dark:text-emerald-400 self-center';
          // Update cache
          Object.keys(formData).forEach(function (k) { cached[k] = formData[k]; });
          cached.is_complete = body.is_complete;
          translationCache[cacheKey] = cached;
          setTimeout(function () { statusEl.textContent = ''; }, 3000);
        } else {
          statusEl.textContent = 'Erreur: ' + (data.error || 'Échec');
          statusEl.className = 'text-sm text-destructive self-center';
        }
      })
      .catch(function (err) {
        saveBtn.disabled = false;
        statusEl.textContent = 'Erreur: ' + (err.message || 'Connexion échouée');
        statusEl.className = 'text-sm text-destructive self-center';
        console.error('Save translation error:', err);
      });
  }

  function uploadArticleImage() {
    if (!currentArticle) return;

    var fileInput = document.getElementById('article-image-input');
    var file = fileInput.files[0];
    if (!file) return;

    var statusEl = document.getElementById('article-image-status');
    var uploadBtn = document.getElementById('article-image-upload-btn');

    uploadBtn.disabled = true;
    statusEl.textContent = 'Upload en cours...';

    var path = currentArticle.internal_slug + '.' + (file.name.split('.').pop() || 'webp');

    var formData = new FormData();
    formData.append('file', file);
    formData.append('path', path);

    fetch(SUPABASE_URL + '/functions/v1/admin-blog?action=upload-image', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'x-admin-token': adminToken
      },
      body: formData
    })
    .then(function (res) {
      return res.json().catch(function () { return { success: false, error: 'HTTP ' + res.status }; }).then(function (data) {
        if (!res.ok) throw new Error((data && data.error) || 'HTTP ' + res.status);
        return data;
      });
    })
    .then(function (data) {
      uploadBtn.disabled = false;
      if (data.success && data.url) {
        statusEl.textContent = 'Image uploadée !';
        // Update article with new image URL
        return adminBlogPost('update', {
          id: currentArticle.id,
          featured_image_url: data.url
        }).then(function () {
          currentArticle.featured_image_url = data.url;
          updateImagePreview();
          // Also update in allArticles list
          var idx = allArticles.findIndex(function (a) { return a.id === currentArticle.id; });
          if (idx >= 0) allArticles[idx].featured_image_url = data.url;
        });
      } else {
        statusEl.textContent = 'Erreur: ' + (data.error || 'Upload échoué');
      }
    })
    .catch(function (err) {
      uploadBtn.disabled = false;
      statusEl.textContent = 'Erreur: ' + (err.message || 'Upload échoué');
      console.error('Upload error:', err);
    });
  }

  // ── Deploy ──
  function triggerDeploy() {
    var banner = document.getElementById('deploy-banner');
    var spinner = document.getElementById('deploy-spinner');
    var iconSuccess = document.getElementById('deploy-icon-success');
    var iconError = document.getElementById('deploy-icon-error');
    var message = document.getElementById('deploy-message');
    var deployBtn = document.getElementById('admin-deploy');

    banner.classList.remove('hidden');
    spinner.classList.remove('hidden');
    iconSuccess.classList.add('hidden');
    iconError.classList.add('hidden');
    message.textContent = 'Deploiement en cours...';
    deployBtn.disabled = true;

    fetch(SUPABASE_URL + '/functions/v1/trigger-deploy', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json',
        'x-admin-token': adminToken
      },
      body: JSON.stringify({})
    })
    .then(function (res) { return res.json(); })
    .then(function (data) {
      spinner.classList.add('hidden');
      deployBtn.disabled = false;
      if (data.success) {
        iconSuccess.classList.remove('hidden');
        message.textContent = data.message || 'Deploiement lance ! Le site sera mis a jour dans 1-2 minutes.';
        banner.style.borderColor = 'hsl(142 71% 45% / 0.3)';
        banner.style.background = 'hsl(142 71% 45% / 0.05)';
      } else {
        iconError.classList.remove('hidden');
        message.textContent = 'Erreur: ' + (data.error || 'Deploiement echoue');
        banner.style.borderColor = 'hsl(var(--destructive) / 0.3)';
        banner.style.background = 'hsl(var(--destructive) / 0.05)';
      }
    })
    .catch(function (err) {
      spinner.classList.add('hidden');
      deployBtn.disabled = false;
      iconError.classList.remove('hidden');
      message.textContent = 'Erreur: ' + (err.message || 'Connexion echouee');
      banner.style.borderColor = 'hsl(var(--destructive) / 0.3)';
      banner.style.background = 'hsl(var(--destructive) / 0.05)';
    });
  }

  function updateCharCounts() {
    var metaTitleEl = document.getElementById('article-field-meta-title');
    var metaDescEl = document.getElementById('article-field-meta-description');
    var titleCountEl = document.getElementById('meta-title-count');
    var descCountEl = document.getElementById('meta-desc-count');

    if (metaTitleEl && titleCountEl) {
      var len = metaTitleEl.value.length;
      titleCountEl.textContent = len;
      titleCountEl.className = 'font-medium' + (len > 60 ? ' text-destructive' : len > 50 ? ' text-amber-600' : '');
    }
    if (metaDescEl && descCountEl) {
      var len2 = metaDescEl.value.length;
      descCountEl.textContent = len2;
      descCountEl.className = 'font-medium' + (len2 > 160 ? ' text-destructive' : len2 > 150 ? ' text-amber-600' : '');
    }
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

    // Deploy button
    var deployBtn = document.getElementById('admin-deploy');
    if (deployBtn) deployBtn.addEventListener('click', triggerDeploy);

    // Articles create
    var createBtn = document.getElementById('articles-create');
    if (createBtn) createBtn.addEventListener('click', promptCreateArticle);

    // Articles refresh
    var articlesRefresh = document.getElementById('articles-refresh');
    if (articlesRefresh) articlesRefresh.addEventListener('click', function () {
      allArticles = [];
      loadArticles();
    });

    // Articles seed
    var seedBtn = document.getElementById('articles-seed');
    if (seedBtn) seedBtn.addEventListener('click', seedArticles);

    // Seed modal close
    var seedModalClose = document.getElementById('seed-modal-close');
    if (seedModalClose) seedModalClose.addEventListener('click', hideSeedModal);

    // Article editor - back button
    var backBtn = document.getElementById('article-back');
    if (backBtn) backBtn.addEventListener('click', function () {
      closeArticleEditor();
      // Refresh the list to reflect changes
      loadArticles();
    });

    // Article delete
    var deleteBtn = document.getElementById('article-delete');
    if (deleteBtn) deleteBtn.addEventListener('click', showDeleteModal);

    // Delete modal
    var deleteCancel = document.getElementById('delete-modal-cancel');
    if (deleteCancel) deleteCancel.addEventListener('click', hideDeleteModal);
    var deleteConfirm = document.getElementById('delete-modal-confirm');
    if (deleteConfirm) deleteConfirm.addEventListener('click', confirmDeleteArticle);

    // Status change
    var statusSelect = document.getElementById('article-status-select');
    if (statusSelect) statusSelect.addEventListener('change', function () {
      changeArticleStatus(this.value);
    });

    // Language tabs
    document.querySelectorAll('.lang-tab').forEach(function (btn) {
      btn.addEventListener('click', function () {
        switchLang(this.dataset.lang);
      });
    });

    // Save translation
    var saveBtn = document.getElementById('article-save-lang');
    if (saveBtn) saveBtn.addEventListener('click', saveTranslation);

    // Image upload
    var imageInput = document.getElementById('article-image-input');
    var uploadBtn = document.getElementById('article-image-upload-btn');
    if (imageInput) {
      imageInput.addEventListener('change', function () {
        if (this.files.length > 0) {
          uploadBtn.classList.remove('hidden');
          document.getElementById('article-image-status').textContent = this.files[0].name + ' (' + Math.round(this.files[0].size / 1024) + ' Ko)';
        } else {
          uploadBtn.classList.add('hidden');
        }
      });
    }
    if (uploadBtn) uploadBtn.addEventListener('click', uploadArticleImage);

    // Character counts on input
    var metaTitleInput = document.getElementById('article-field-meta-title');
    var metaDescInput = document.getElementById('article-field-meta-description');
    if (metaTitleInput) metaTitleInput.addEventListener('input', updateCharCounts);
    if (metaDescInput) metaDescInput.addEventListener('input', updateCharCounts);

    // Check existing auth
    checkAuth();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
