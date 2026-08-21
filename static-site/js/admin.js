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
  // Do NOT edit manually, add articles in data/blog/ and static-site/build/config.js
  var SEED_ARTICLES = /*__SEED_ARTICLES__*/[
    {
      internal_slug: 'les-phases-de-la-rupture-chez-l-homme',
      featured_image_url: '/blog/phases-rupture-homme.webp',
      author_id: 'thomas',
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
      author_id: 'thomas',
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
      author_id: 'thomas',
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
      author_id: 'thomas',
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
      author_id: 'thomas',
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
      author_id: 'thomas',
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
      author_id: 'thomas',
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
    // Les pastilles doivent etre justes des l'arrivee : on interroge les trois
    // sources tout de suite, meme si l'affichage de chaque onglet reste
    // paresseux.
    if (allLeads.length === 0) loadLeads();
    if (allMessages.length === 0) loadMessages();
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
    'amour-habitude': 'Amour ou habitude',
    'amoureux': 'Quiz amoureux',
    'attachement': "Style d'attachement",
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
    'purete': 'Test de pureté',
    'qui-de-nous-deux': 'Qui de nous deux',
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
    // 'zamours' est deja plus haut : c'est le seul identifiant identique dans
    // les deux nommages, une seule entree suffit.
    jeuDilemmes: 'Dilemmes',
    pourContre: 'Pour ou contre',
    quizTentation: 'Tentation',
    testPurete: 'Test de pureté',
    testAmeSoeur: 'Test âme sœur',
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
    'amour-habitude': 'testAmourHabitude',
    'amoureux': 'quizAmoureux',
    'attachement': 'testAttachement',
    'common-points': 'testCommonPoints',
    'compatibilite': 'testCompatibilite',
    'confiance': 'testConfiance',
    'coquin': 'quizCoquin',
    'couche': 'testCouche',
    'dependance': 'testDependance',
    'dilemmes': 'jeuDilemmes',
    'distance': 'testDistance',
    'distance-aime': 'testDistanceAime',
    'divorce': 'testDivorce',
    'emmenager': 'testEmmenager',
    'gage-couple': 'jeuGages',
    'genant': 'quizGenant',
    'infidelite': 'testInfidelite',
    'karmique': 'testKarmique',
    'knowledge': 'quizKnowledge',
    'langage-amour': 'testLangageAmour',
    'mariage': 'testMariage',
    'marrant': 'quizMarrant',
    'most': 'quizMost',
    'parentalite': 'testParentalite',
    'pervers': 'testPervers',
    'plateau-couple': 'jeuPlateau',
    'purete': 'testPurete',
    'qui-de-nous-deux': 'jeuQuiDeNous',
    'sain': 'testCoupleSain',
    'secret': 'testSecret',
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
          'jeuDilemmes', 'pourContre', 'quizTuPreferes',
          'action-ou-verite', 'action-ou-verite-coquin', 'gage-couple', 'plateau-couple',
          'qui-de-nous-deux', 'dilemmes', 'pour-contre', 'tu-preferes'],
    quiz: ['zamours', 'amoureux', 'coquin', 'genant', 'knowledge', 'marrant', 'most',
           'vrai-faux', 'ado', 'tentation']
  };
  var LIBELLE_FAMILLE = { test: 'Tests', quiz: 'Quiz', jeu: 'Jeux' };
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
  var statsMesure = 'termines';
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
  var statsComp = 7;
  function statsRpc(fn, body) {
    return fetch(SUPABASE_URL + '/rest/v1/rpc/' + fn, {
      method: 'POST',
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {})
    }).then(function (r) { return r.json(); });
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

  // ── Lancements : total et detail par page ──
  // Une partie lancee n'est pas une partie finie. Le rapport des deux, page
  // par page, est la seule facon de voir laquelle interesse mais decroche :
  // trop longue, mal cadree, ou decevante des les premieres questions. Il n'y
  // a volontairement pas de taux global : les completions ont des mois
  // d'historique que les lancements n'ont pas, un chiffre unique melangerait
  // les pages mesurees et celles qui ne le sont pas encore.
  function chargeLancements() {
    var elTotal = document.getElementById('admin-lances-total');
    statsRpc('get_quiz_starts_total').then(function (v) {
      var n = Array.isArray(v) ? (v[0] && (v[0].get_quiz_starts_total != null ? v[0].get_quiz_starts_total : v[0])) : v;
      if (n == null || isNaN(Number(n))) throw new Error('pas de rpc');
      if (elTotal) elTotal.textContent = Number(n).toLocaleString('fr-FR');
      return statsRpc('get_quiz_starts_counts');
    }).then(function (rows) {
      if (!Array.isArray(rows) || rows.error) throw new Error('pas de rpc');
      var map = {};
      fusionneComptes(rows).forEach(function (r) { map[r.quiz_slug] = r.total; });
      statsLances = map;
      renderStatsList();
      // La serie quotidienne arrive apres : elle borne la fenetre commune.
      statsRpc('get_quiz_starts_daily_par_quiz', { p_days: joursCharges, p_tz: fuseau() })
        .then(function (jours) {
          if (!Array.isArray(jours) || jours.error) return;
          var idx = {};
          jours.forEach(function (r) {
            var slug = canon(r.quiz_slug), k = rowDateKey(r);
            if (!slug || !k) return;
            if (!idx[slug]) idx[slug] = {};
            idx[slug][k] = (idx[slug][k] || 0) + rowTotal(r);
          });
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
  var MINI_PAGE = 10;    // sous ce nombre de lancements, un taux par page est du bruit
  var MINI_GLOBAL = 25;  // idem pour le taux global

  // Debut de la fenetre : le lendemain du premier lancement enregistre, pas
  // le jour meme. Ce premier jour est forcement partiel, la mesure ayant ete
  // mise en service en cours de journee, alors que les completions y comptent
  // depuis minuit. L'y inclure gonflerait le taux d'un facteur arbitraire.
  // Tant que ce lendemain n'est pas passe, il n'y a pas de fenetre du tout.
  function debutFenetre() {
    if (!statsLancesParJour) return null;
    var min = null;
    Object.keys(statsLancesParJour).forEach(function (slug) {
      Object.keys(statsLancesParJour[slug]).forEach(function (j) {
        if (statsLancesParJour[slug][j] > 0 && (min === null || j < min)) min = j;
      });
    });
    if (!min) return null;
    var d = new Date(min + 'T12:00:00Z');
    d.setUTCDate(d.getUTCDate() + 1);
    return d.toISOString().slice(0, 10);
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
    statsRpc('get_quiz_daily_par_quiz', { p_days: jours, p_tz: tz }).then(function (rows) {
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
  var courbesVisibles = { lances: true, finis: true, ratio: true };

  // Total des lancements du jour, toutes pages confondues. null avant la mise
  // en service : la courbe s'interrompt au lieu de descendre a zero.
  function lancesDuJour(iso) {
    if (!statsLancesParJour) return null;
    var depuis = null, total = 0, vu = false;
    Object.keys(statsLancesParJour).forEach(function (slug) {
      Object.keys(statsLancesParJour[slug]).forEach(function (j) {
        if (statsLancesParJour[slug][j] > 0 && (depuis === null || j < depuis)) depuis = j;
      });
    });
    if (depuis === null || iso < depuis) return null;
    Object.keys(statsLancesParJour).forEach(function (slug) {
      var v = statsLancesParJour[slug][iso];
      if (v != null) { total += v; vu = true; }
    });
    return vu || iso >= depuis ? total : null;
  }

  function construitCourbes(series) {
    var lances = series.map(function (p) {
      var iso = p.date.getFullYear() + '-' + String(p.date.getMonth() + 1).padStart(2, '0') + '-' + String(p.date.getDate()).padStart(2, '0');
      return { date: p.date, label: p.label, total: lancesDuJour(iso) };
    });
    var ratio = series.map(function (p, i) {
      var l = lances[i].total;
      if (l === null || l === 0) return { date: p.date, label: p.label, total: null };
      return { date: p.date, label: p.label, total: Math.min(100, Math.round((p.total / l) * 100)) };
    });
    var par = { lances: lances, finis: series, ratio: ratio };
    return COURBES.map(function (c) {
      return { cle: c.cle, nom: c.nom, couleur: c.couleur, axe: c.axe, unite: c.unite,
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
          var sl = 0, sf = 0;
          lc.points.forEach(function (p, i) {
            if (p.total === null || p.total === undefined) return;
            sl += p.total; sf += fc.points[i].total || 0;
          });
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

    var lancesJour = statsLancesParJour ? lancesDuJour(isoNJoursAvant(0)) : null;
    var elLJ = document.getElementById('admin-lances-jour');
    if (elLJ) elLJ.textContent = lancesJour === null ? '—' : lancesJour.toLocaleString('fr-FR');

    var elR = document.getElementById('admin-ratio-jour');
    var elRD = document.getElementById('admin-ratio-detail');
    if (elR) {
      if (lancesJour === null || lancesJour === 0) {
        elR.textContent = '—';
        if (elRD) elRD.textContent = lancesJour === 0 ? 'aucune partie lancée aujourd\'hui' : 'lancés pas encore mesurés';
      } else {
        var pct = Math.min(100, Math.round((finisJour / lancesJour) * 100));
        elR.textContent = pct + ' %';
        if (elRD) elRD.textContent = finisJour.toLocaleString('fr-FR') + ' finis sur ' + lancesJour.toLocaleString('fr-FR') + ' lancés';
      }
    }
  }

  function renderTotalDaily(series) {
    majTetes(series);
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
  // La colonne grise porte l'autre nombre du couple. Elle disait « 3 711
  // finis » a cote d'un « 4 065 » sans etiquette : le seul nombre nomme etant
  // celui qu'on n'a PAS demande, l'oeil s'y accroche et lit la ligne a
  // l'envers. « dont » et « sur » rattachent explicitement le nombre gris a
  // la valeur en gras, qui reste le sujet de la ligne.
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

  function valeurMesure(slug, terminesTotal) {
    var c = comptesPeriode(slug, terminesTotal);
    var lances = c.lances, termines = c.finis;
    if (statsMesure === 'lances') return { n: lances, libelle: lances.toLocaleString('fr-FR'), sur: 'dont ' + termines.toLocaleString('fr-FR') + ' finis', classe: '' };
    if (statsMesure === 'ratio') {
      // Sur toute l'histoire, le rapport melangerait des mois de completions
      // et quelques heures de lancements : on borne a la fenetre commune. Sur
      // une periode choisie, les deux series couvrent deja les memes jours.
      var d = statsPeriode === 0 ? comptesFenetre(slug) : c;
      if (!d || d.lances < MINI_PAGE) {
        return { n: -1, libelle: '—', sur: d ? 'sur ' + d.lances + ' lancés' : '', classe: '' };
      }
      var pct = tauxDepuis(d.lances, d.finis);
      return { n: pct, libelle: pct + ' %',
               sur: d.finis.toLocaleString('fr-FR') + ' finis sur ' + d.lances.toLocaleString('fr-FR'),
               classe: pct < 40 ? ' est-faible' : (pct >= 70 ? ' est-fort' : '') };
    }
    return { n: termines, libelle: termines.toLocaleString('fr-FR'), sur: lances ? 'sur ' + lances.toLocaleString('fr-FR') + ' lancés' : '', classe: '' };
  }

  function renderStatsList() {
    var listEl = document.getElementById('admin-stats-list');
    if (!listEl) return;
    if (statsCounts.length === 0) { listEl.innerHTML = '<p class="text-center text-muted-foreground py-6">Aucune complétion pour le moment.</p>'; return; }

    // Sans lancements, la bascule n'a rien a montrer : on reste sur les
    // completions plutot que d'afficher une colonne de tirets.
    if (!statsLances && statsMesure !== 'termines') statsMesure = 'termines';

    var lignes = statsCounts.map(function (r) {
      var termines = Number(r.total) || 0;
      var v = valeurMesure(r.quiz_slug, termines);
      return { slug: r.quiz_slug, famille: familleQuiz(r.quiz_slug), termines: termines, v: v };
    });

    // L'echelle des barres est propre a la mesure : en ratio elle va de 0 a
    // 100, sinon elle se cale sur la page la plus jouee, toutes familles
    // confondues, pour que les familles restent comparables entre elles.
    var maxGlobal = 1;
    if (statsMesure !== 'ratio') lignes.forEach(function (l) { if (l.v.n > maxGlobal) maxGlobal = l.v.n; });

    var html = '';
    ['test', 'quiz', 'jeu'].forEach(function (fam) {
      var groupe = lignes.filter(function (l) { return l.famille === fam; })
        .sort(function (a, b) { return b.v.n - a.v.n; });
      if (groupe.length === 0) return;
      var totalFam = groupe.reduce(function (acc, l) { return acc + comptesPeriode(l.slug, l.termines).finis; }, 0);
      html += '<div class="stats-groupe stats-fam-' + fam + '">'
        + '<div class="stats-groupe-tete">'
        + '<span class="stats-groupe-pastille" aria-hidden="true"></span>'
        + '<span class="stats-groupe-nom">' + LIBELLE_FAMILLE[fam] + '</span>'
        + '<span class="stats-groupe-compte">' + groupe.length + ' page' + (groupe.length > 1 ? 's' : '')
        + ' · ' + totalFam.toLocaleString('fr-FR') + ' finis</span>'
        + '</div>';
      html += groupe.map(function (l) {
        var pct = statsMesure === 'ratio'
          ? Math.max(0, Math.min(100, l.v.n))
          : Math.round((l.v.n / maxGlobal) * 100);
        // Le compteur vert : parties de la journee en cours. Tant que les
        // series quotidiennes ne sont pas chargees, la colonne reste vide
        // puis se remplit au second rendu.
        var jour;
        if (statsParJour) {
          var nJour = comptagesDuJour(l.slug);
          jour = '<span class="stats-row-jour' + (nJour > 0 ? '' : ' est-zero') + '" title="Aujourd\'hui">'
            + (nJour > 0 ? '+' + nJour.toLocaleString('fr-FR') : '0') + '</span>';
        } else {
          jour = '<span class="stats-row-jour"></span>';
        }
        return '<button class="stats-row' + (l.slug === statsSelectedSlug ? ' active' : '') + '" data-slug="' + esc(l.slug) + '" title="' + esc(l.slug) + '">'
          + '<span class="stats-row-name">' + esc(nomQuiz(l.slug)) + '</span>'
          + '<span class="stats-row-bar"><span style="width:' + pct + '%"></span></span>'
          + '<span class="stats-row-sur">' + esc(l.v.sur) + '</span>'
          + jour
          + '<span class="stats-row-val' + l.v.classe + '">' + l.v.libelle + '</span>'
          + '</button>';
      }).join('');
      html += '</div>';
    });
    listEl.innerHTML = html;

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

    if (statsMesure === 'ratio') {
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
    if (titleEl) titleEl.textContent = nomQuiz(slug) + ' · 30 derniers jours';
    drawLineChart(cv, null, { loading: true });
    // Meme decoupage que la courbe totale : sans fuseau, la base groupe en UTC
    // et la colonne du jour reste vide jusqu'a deux heures du matin.
    function trace(rows, enUTC) {
      _lastQuizSeries = buildSeries(Array.isArray(rows) ? rows : [], 30, enUTC);
      drawLineChart(document.getElementById('admin-stats-chart'), _lastQuizSeries, {});
    }
    var source = statsMesure === 'lances' ? 'get_quiz_starts_daily' : 'get_quiz_daily';
    // Les lancements n'ont pas de RPC par quiz : on decoupe la serie deja
    // chargee plutot que d'ajouter un aller-retour.
    if (statsMesure === 'lances') {
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
    var muted = dark ? 'rgba(190,180,210,0.45)' : 'rgba(90,70,110,0.4)';
    var grid = dark ? 'rgba(200,190,220,0.12)' : 'rgba(90,70,110,0.12)';
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
    var padL = 38, padR = aDroite ? 42 : 12, padT = 12, padB = 22;
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
    // ses etiquettes : deux grilles superposees brouillent la lecture.
    ctx.lineWidth = 1;
    [0, 0.5, 1].forEach(function (f) {
      var y = padT + plotH - f * plotH;
      ctx.strokeStyle = grid;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(cssW - padR, y); ctx.stroke();
      ctx.fillStyle = muted;
      ctx.textAlign = 'right';
      ctx.fillText(String(Math.round(hautG * f)), padL - 6, y);
      if (aDroite) {
        ctx.textAlign = 'left';
        ctx.fillText(Math.round(hautD * f) + ' %', cssW - padR + 6, y);
      }
    });

    visibles.forEach(function (c) {
      // On decoupe en segments continus : chaque trou (null) coupe la ligne.
      var segs = [], cour = [];
      c.points.forEach(function (p, i) {
        if (p.total === null || p.total === undefined) { if (cour.length) segs.push(cour); cour = []; return; }
        cour.push({ i: i, v: p.total });
      });
      if (cour.length) segs.push(cour);

      // Aplat seulement quand une seule courbe est affichee : superposes, les
      // aplats faussent les couleurs.
      if (visibles.length === 1) {
        segs.forEach(function (seg) {
          if (seg.length < 2) return;
          var g = ctx.createLinearGradient(0, padT, 0, padT + plotH);
          g.addColorStop(0, c.couleur + '59');
          g.addColorStop(1, c.couleur + '08');
          ctx.beginPath();
          ctx.moveTo(xAt(seg[0].i), yAt(seg[0].v, c.axe));
          seg.forEach(function (pt) { ctx.lineTo(xAt(pt.i), yAt(pt.v, c.axe)); });
          ctx.lineTo(xAt(seg[seg.length - 1].i), padT + plotH);
          ctx.lineTo(xAt(seg[0].i), padT + plotH);
          ctx.closePath(); ctx.fillStyle = g; ctx.fill();
        });
      }

      ctx.lineWidth = 2.5; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      segs.forEach(function (seg) {
        if (seg.length === 1) {
          // Un segment d'un seul point ne tracerait rien : on pose une pastille.
          ctx.beginPath();
          ctx.arc(xAt(seg[0].i), yAt(seg[0].v, c.axe), 2.5, 0, Math.PI * 2);
          ctx.fillStyle = c.couleur; ctx.fill();
          return;
        }
        ctx.beginPath();
        seg.forEach(function (pt, k) {
          var x = xAt(pt.i), y = yAt(pt.v, c.axe);
          k === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.strokeStyle = c.couleur; ctx.stroke();
      });

      var q = segs.length ? segs[segs.length - 1] : null;
      var dernier = q ? q[q.length - 1] : null;
      if (dernier) {
        ctx.beginPath(); ctx.arc(xAt(dernier.i), yAt(dernier.v, c.axe), 3.5, 0, Math.PI * 2);
        ctx.fillStyle = c.couleur; ctx.fill();
        ctx.strokeStyle = dark ? '#1a1524' : '#fff'; ctx.lineWidth = 2; ctx.stroke();
      }
    });

    ctx.fillStyle = muted; ctx.textAlign = 'center';
    var pas = Math.max(1, Math.ceil(n / 6));
    for (var i = 0; i < n; i += pas) ctx.fillText(visibles[0].points[i].label, xAt(i), cssH - padB / 2 + 2);
    ctx.textAlign = 'left';

    cv._geo = { couches: visibles, n: n, padL: padL, padR: padR, xAt: xAt, cssW: cssW };
    brancheInfobulle(cv);
  }

  // Ancienne signature, gardee pour la courbe d'un seul quiz.
  function drawLineChart(cv, series, opts) {
    opts = opts || {};
    if (opts.loading) return drawChart(cv, [], { loading: true });
    return drawChart(cv, [{
      cle: 'serie', nom: opts.nom || 'Parties', couleur: '#EF4E88',
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
      bulle.style.left = Math.max(4, Math.min(g.cssW - bulle.offsetWidth - 4, x - bulle.offsetWidth / 2)) + 'px';
      // Cale sur le haut du canevas et non du panneau : sinon l'infobulle
      // recouvre les boutons de periode places au-dessus.
      bulle.style.top = (cv.offsetTop + 4) + 'px';
    }
    function cache() { bulle.classList.add('est-cachee'); }

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

  // ── Tab switching ──
  function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.admin-tab').forEach(function (b) { b.classList.remove('active'); });
    document.querySelector('.admin-tab[data-tab="' + tab + '"]').classList.add('active');

    document.getElementById('admin-reviews-tab').classList.toggle('hidden', tab !== 'reviews');
    document.getElementById('admin-leads-tab').classList.toggle('hidden', tab !== 'leads');
    document.getElementById('admin-messages-tab').classList.toggle('hidden', tab !== 'messages');
    var statsTab = document.getElementById('admin-stats-tab');
    if (statsTab) statsTab.classList.toggle('hidden', tab !== 'stats');
    var afTab = document.getElementById('admin-affiliation-tab');
    if (afTab) afTab.classList.toggle('hidden', tab !== 'affiliation');

    if (tab === 'stats') {
      loadStats();
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
      fetch(SUPABASE_URL + '/rest/v1/reviews?select=*&order=created_at.desc&limit=100', {
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
    // Bascule de la liste par page : lances, termines, taux de finition.
    document.querySelectorAll('.stats-comp-btn[data-mesure]').forEach(function (b) {
      b.addEventListener('click', function () {
        if (!statsLances && this.dataset.mesure !== 'termines') return;
        document.querySelectorAll('.stats-comp-btn[data-mesure]').forEach(function (x) { x.classList.remove('active'); });
        this.classList.add('active');
        statsMesure = this.dataset.mesure;
        var aide = document.getElementById('admin-stats-mesure-aide');
        if (aide) {
          aide.textContent = statsMesure === 'ratio'
            ? 'Part des parties lancées qui vont jusqu\'au résultat, mesurée depuis la mise en service des lancés. Un tiret veut dire moins de ' + MINI_PAGE + ' lancés, trop peu pour conclure. Rouge sous 40 %, vert à partir de 70 %.'
            : statsMesure === 'lances'
              ? 'Parties commencées, abandons compris. Cliquez sur une page pour voir sa courbe.'
              : 'Parties allées jusqu\'au résultat. Cliquez sur une page pour voir sa courbe.';
        }
        renderStatsList();
        if (statsSelectedSlug) loadDaily(statsSelectedSlug);
      });
    });
    // Redraw charts on resize (canvas is width-dependent)
    var rT;
    window.addEventListener('resize', function () {
      clearTimeout(rT);
      rT = setTimeout(function () {
        if (currentTab !== 'stats') return;
        if (_lastTotalCouches) drawChart(document.getElementById('admin-stats-total-chart'), _lastTotalCouches, {});
        if (_lastQuizSeries) drawLineChart(document.getElementById('admin-stats-chart'), _lastQuizSeries, _lastQuizOpts);
      }, 180);
    });

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
