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
  var SEED_ARTICLES = [{"internal_slug":"les-phases-de-la-rupture-chez-l-homme","featured_image_url":"/blog/phases-rupture-homme.webp","author_id":"mathieu-courtin","status":"published","published_at":"2026-02-21","translations":[{"lang":"fr","slug":"les-phases-de-la-rupture-chez-l-homme","title":"Les étapes de la rupture chez l'Homme","meta_title":"Les phases de la rupture chez l'homme | 6 étapes décryptées","meta_description":"Découvrez les 6 phases de la rupture chez l'homme : du déni à la reconstruction. Comprendre chaque étape pour mieux traverser une séparation.","featured_image_alt":"Homme traversant les phases de la rupture amoureuse","excerpt":"Les 6 phases de la rupture chez l'homme : du déni à la reconstruction."},{"lang":"en","slug":"breakup-stages-for-men","title":"The Stages of a Breakup for Men","meta_title":"The Stages of a Breakup for Men | 6 Phases Explained","meta_description":"Discover the 6 stages of a breakup for men: from denial to rebuilding. Understand each phase to better navigate a separation.","featured_image_alt":"Man going through the stages of a romantic breakup","excerpt":"The 6 stages of a breakup for men: from denial to rebuilding."},{"lang":"es","slug":"fases-de-la-ruptura-en-el-hombre","title":"Las etapas de la ruptura en el hombre","meta_title":"Las fases de la ruptura en el hombre | 6 etapas explicadas","meta_description":"Descubre las 6 fases de la ruptura en el hombre: de la negación a la reconstrucción. Comprende cada etapa para superar mejor una separación.","featured_image_alt":"Hombre atravesando las fases de una ruptura amorosa","excerpt":"Las 6 fases de la ruptura en el hombre: de la negación a la reconstrucción."},{"lang":"de","slug":"trennungsphasen-beim-mann","title":"Die Phasen der Trennung beim Mann","meta_title":"Die Phasen der Trennung beim Mann | 6 Stufen erklärt","meta_description":"Entdecken Sie die 6 Phasen der Trennung beim Mann: von der Verleugnung bis zum Neuaufbau. Verstehen Sie jede Phase, um eine Trennung besser zu bewältigen.","featured_image_alt":"Mann, der die Phasen einer Trennung durchlebt","excerpt":"Die 6 Phasen der Trennung beim Mann: von der Verleugnung bis zum Neuaufbau."},{"lang":"it","slug":"fasi-della-rottura-nell-uomo","title":"Le fasi della rottura nell'uomo","meta_title":"Le fasi della rottura nell'uomo | 6 tappe spiegate","meta_description":"Scopri le 6 fasi della rottura nell'uomo: dalla negazione alla ricostruzione. Comprendi ogni fase per affrontare meglio una separazione.","featured_image_alt":"Uomo che attraversa le fasi di una rottura sentimentale","excerpt":"Le 6 fasi della rottura nell'uomo: dalla negazione alla ricostruzione."}]},{"internal_slug":"choses-pas-accepter-couple","featured_image_url":"/blog/limites-couple-accepter.webp","author_id":"lucie-courtin","status":"published","published_at":"2026-02-21","translations":[{"lang":"fr","slug":"choses-pas-accepter-couple","title":"Ce qu'on ne devrait jamais accepter dans une relation amoureuse","meta_title":"Choses à ne pas accepter en couple | Limites essentielles","meta_description":"Découvrez les choses à ne pas accepter en couple : manque de respect, manipulation, jalousie toxique. Apprenez à poser vos limites. Guide complet et gratuit.","featured_image_alt":"Couple posant des limites dans leur relation amoureuse","excerpt":"Les comportements à ne jamais tolérer en couple et comment poser ses limites."},{"lang":"en","slug":"things-not-accept-relationship","title":"Things You Should Never Accept in a Relationship","meta_title":"Things Not to Accept in a Relationship | Essential Boundaries","meta_description":"Discover things you should never accept in a relationship: disrespect, manipulation, toxic jealousy. Learn to set healthy boundaries. Free complete guide.","featured_image_alt":"Couple setting boundaries in their romantic relationship","excerpt":"Behaviors you should never tolerate in a relationship and how to set limits."},{"lang":"es","slug":"cosas-no-aceptar-pareja","title":"Lo que nunca deberías aceptar en una relación de pareja","meta_title":"Cosas que no aceptar en pareja | Límites esenciales","meta_description":"Descubre las cosas que no debes aceptar en pareja: falta de respeto, manipulación, celos tóxicos. Aprende a poner límites. Guía completa y gratuita.","featured_image_alt":"Pareja estableciendo límites en su relación sentimental","excerpt":"Los comportamientos que nunca debes tolerar en pareja y cómo poner límites."},{"lang":"de","slug":"grenzen-beziehung-nicht-akzeptieren","title":"Was man in einer Beziehung niemals akzeptieren sollte","meta_title":"Grenzen in der Beziehung | Was nicht akzeptabel ist","meta_description":"Erfahren Sie, was in einer Beziehung nicht akzeptabel ist: Respektlosigkeit, Manipulation, toxische Eifersucht. Lernen Sie Grenzen zu setzen. Kostenloser Leitfaden.","featured_image_alt":"Paar setzt Grenzen in ihrer Liebesbeziehung","excerpt":"Verhaltensweisen, die in einer Beziehung nicht toleriert werden sollten."},{"lang":"it","slug":"cose-non-accettare-coppia","title":"Cose da non accettare mai in una relazione di coppia","meta_title":"Cose da non accettare in coppia | Limiti essenziali","meta_description":"Scopri le cose da non accettare in coppia: mancanza di rispetto, manipolazione, gelosia tossica. Impara a porre i tuoi limiti. Guida completa e gratuita.","featured_image_alt":"Coppia che stabilisce limiti nella propria relazione sentimentale","excerpt":"I comportamenti da non tollerare mai in coppia e come porre i propri limiti."}]},{"internal_slug":"avis-tinder","featured_image_url":"/blog/avis-tinder.webp","author_id":"mathieu-courtin","status":"published","published_at":"2026-02-27","translations":[{"lang":"fr","slug":"avis-tinder","title":"Que vaut Tinder en 2026 ? Notre avis et test complet","meta_title":"Avis Tinder 2026 : notre verdict honnête après des années de swipe","meta_description":"Tinder vaut-il encore le coup en 2026 ? Notre avis honnête sur les fonctionnalités, les prix, les faux profils et les alternatives. On ne mâche pas nos mots.","featured_image_alt":"L'avis de QuizCouple sur tinder en 2026","excerpt":"Notre avis sur Tinder : ce que l'appli fait bien, mal, et pour qui elle est faite."},{"lang":"en","slug":"tinder-review","title":"Is Tinder worth it in 2026? Our full review and test","meta_title":"Tinder review 2026: Our honest verdict after years of swiping","meta_description":"Is Tinder still worth it in 2026? Our honest opinion on features, prices, fake profiles, and alternatives. We don't pull any punches.","featured_image_alt":"QuizCouple's opinion on Tinder in 2026","excerpt":"Our review of Tinder: what the app does well, poorly, and who it's made for."},{"lang":"es","slug":"tinder-opiniones-vale-la-pena","title":"¿Qué vale Tinder en 2026? nuestra opinión y prueba completa","meta_title":"Opiniones Tinder 2026 : nuestro veredicto honesto","meta_description":"¿Vale la pena Tinder en 2026? nuestra opinión honesta sobre las funciones, los precios, los perfiles falsos y las alternativas. no nos mordemos la lengua.","featured_image_alt":"La opinión de QuizCouple sobre Tinder en 2026","excerpt":"Nuestra opinión sobre Tinder: lo que la app hace bien, mal, y para quién está hecha."},{"lang":"de","slug":"tinder-bewertung","title":"Was taugt Tinder im Jahr 2026? Unsere Bewertung und der komplette Test","meta_title":"Tinder Erfahrungen 2026: Unser ehrliches Urteil","meta_description":"Lohnt sich Tinder 2026 noch? Unsere ehrliche Meinung zu Funktionen, Preisen, Fake-Profilen und Alternativen. Wir nehmen kein Blatt vor den Mund.","featured_image_alt":"Die Meinung von QuizCouple zu Tinder im Jahr 2026","excerpt":"Unsere Meinung zu Tinder: Was die App gut und schlecht macht und für wen sie geeignet ist."},{"lang":"it","slug":"recensione-tinder","title":"Quanto vale Tinder nel 2026? La nostra recensione e test completo","meta_title":"Recensione di Tinder 2026: il nostro onesto verdetto sull'app","meta_description":"Tinder vale ancora la pena nel 2026? La nostra opinione onesta su funzionalità, prezzi, profili falsi e alternative. Non usiamo mezzi termini.","featured_image_alt":"L'opinione di QuizCouple su Tinder nel 2026","excerpt":"La nostra opinione su Tinder: cosa fa bene l'app, cosa fa male e per chi è pensata."}]},{"internal_slug":"avis-bumble","featured_image_url":"/blog/avis-bumble.webp","author_id":"mathieu-courtin","status":"published","published_at":"2026-02-27","translations":[{"lang":"fr","slug":"avis-bumble","title":"Bumble en 2026 : une application hors budget et délaissé ?","meta_title":"Notre avis sur Bumble en 2026 : test et résultats de l'app","meta_description":"Notre avis complet sur Bumble après plusieurs mois de test : fonctionnalités, prix, résultats réels et verdict honnête. On vous dit si ça vaut vraiment le coup en 2026.","featured_image_alt":"image bumble avis","excerpt":"On a testé Bumble pendant des mois. Voici notre verdict honnête et notre note."},{"lang":"en","slug":"bumble-app-review","title":"Bumble in 2026: an over-budget and neglected app?","meta_title":"Our Bumble review in 2026: app test and results","meta_description":"Our complete Bumble review after several months of testing: features, price, real results, and honest verdict. We tell you if it's really worth it in 2026.","featured_image_alt":"bumble review image","excerpt":"We tested Bumble for months. Here is our honest verdict and rating."},{"lang":"es","slug":"opiniones-bumble","title":"Bumble en 2026: ¿una aplicación fuera de presupuesto y abandonada?","meta_title":"Nuestra opinión sobre Bumble en 2026: prueba y resultados de la app","meta_description":"Nuestra opinión completa sobre Bumble tras varios meses de prueba: funcionalidades, precio, resultados reales y veredicto honesto. Te decimos si realmente vale la pena en 2026.","featured_image_alt":"imagen opiniones bumble","excerpt":"Hemos probado Bumble durante meses. Aquí tienes nuestro veredicto honesto y nuestra nota."},{"lang":"de","slug":"bumble-erfahrungen","title":"Bumble im Jahr 2026: Eine überteuerte und vernachlässigte App?","meta_title":"Unsere Bumble-Erfahrungen 2026: App-Test und Ergebnisse","meta_description":"Unser ausführlicher Bumble-Test nach mehreren Monaten: Funktionen, Preis, echte Ergebnisse und ehrliches Fazit. Wir verraten, ob es sich 2026 wirklich lohnt.","featured_image_alt":"bild bumble erfahrungen","excerpt":"Wir haben Bumble monatelang getestet. Hier ist unser ehrliches Fazit und unsere Bewertung."},{"lang":"it","slug":"recensione-bumble","title":"Bumble nel 2026: un'applicazione fuori budget e trascurata?","meta_title":"La nostra recensione di Bumble nel 2026: test e risultati dell'app","meta_description":"La nostra recensione completa su Bumble dopo diversi mesi di test: funzionalità, prezzo, risultati reali e verdetto onesto. Ti diciamo se ne vale davvero la pena nel 2026.","featured_image_alt":"immagine recensione bumble","excerpt":"Abbiamo testato Bumble per mesi. Ecco il nostro verdetto onesto e il nostro voto."}]},{"internal_slug":"avis-hinge","featured_image_url":"/blog/avis-hinge.webp","author_id":"mathieu-courtin","status":"published","published_at":"2026-02-27","translations":[{"lang":"fr","slug":"avis-hinge-rencontre","title":"Test de l'application Hinge en 2026 : avis et explications","meta_title":"Notre avis sur Hinge en 2026 : test et résultats","meta_description":"On a testé Hinge en France pendant plusieurs mois. Accroches, algorithme, tarifs réels, bannissements et résultats : notre avis complet, honnête et sans langue de bois.","featured_image_alt":"image hinge avis application rencontre","excerpt":"Hinge, l'appli \"conçue pour être supprimée\". On a vérifié si la promesse tient vraiment en France."},{"lang":"en","slug":"hinge-dating-app-review","title":"Hinge dating app review in 2026: our honest test and verdict","meta_title":"Our Hinge review in 2026: app test and results","meta_description":"We tested Hinge for several months. Prompts, algorithm, real pricing, bans, and results: our complete, honest, no-nonsense review.","featured_image_alt":"hinge review dating app image","excerpt":"Hinge, the app \"designed to be deleted.\" We checked whether the promise actually holds up."},{"lang":"es","slug":"opinion-hinge-app-citas","title":"Test de la aplicación Hinge en 2026: opinión y explicaciones","meta_title":"Nuestra opinión sobre Hinge en 2026: prueba y resultados","meta_description":"Hemos probado Hinge en España durante varios meses. Frases para romper el hielo, algoritmo, precios reales, baneos y resultados: nuestra opinión completa, honesta y sin rodeos.","featured_image_alt":"imagen hinge opinión aplicación citas","excerpt":"Hinge, la app \"diseñada para ser eliminada\". Hemos comprobado si la promesa se cumple realmente en España."},{"lang":"de","slug":"hinge-erfahrungen-test","title":"Hinge im Test 2026: Erfahrungen und ehrliche Bewertung","meta_title":"Unsere Hinge-Erfahrungen 2026: Test und Ergebnisse","meta_description":"Wir haben Hinge in Deutschland mehrere Monate lang getestet. Prompts, Algorithmus, echte Preise, Kontosperren und Ergebnisse: unser vollständiger, ehrlicher Erfahrungsbericht ohne Beschönigung.","featured_image_alt":"bild hinge erfahrungen dating-app","excerpt":"Hinge, die App \"die gelöscht werden soll\". Wir haben geprüft, ob das Versprechen in Deutschland wirklich hält."},{"lang":"it","slug":"recensione-hinge-app","title":"Test dell'app Hinge nel 2026: recensione e spiegazioni","meta_title":"La nostra recensione di Hinge nel 2026: test e risultati","meta_description":"Abbiamo testato Hinge in Italia per diversi mesi. Spunti di conversazione, algoritmo, prezzi reali, ban e risultati: la nostra recensione completa, onesta e senza peli sulla lingua.","featured_image_alt":"immagine hinge recensione app incontri","excerpt":"Hinge, l'app \"progettata per essere cancellata\". Abbiamo verificato se la promessa regge davvero in Italia."}]},{"internal_slug":"avis-badoo","featured_image_url":"/blog/avis-badoo.webp","author_id":"mathieu-courtin","status":"published","published_at":"2026-02-28","translations":[{"lang":"fr","slug":"avis-badoo","title":"Notre avis sur l'application de rencontre Badoo","meta_title":"Avis Badoo 2026 : ce qu'on en pense vraiment après des mois de test","meta_description":"L'équipe QuizCouple a testé Badoo pendant plusieurs mois. Résultats, ressenti côté homme et côté femme, tarifs, faux profils : notre avis complet et sans filtre.","featured_image_alt":"Notre avis sur l'application de rencontre Badoo en 2026","excerpt":"Badoo, tout le monde la connaît, personne n'en parle franchement. On l'a testée."},{"lang":"en","slug":"badoo-review","title":"Our review of the Badoo dating app","meta_title":"Badoo review 2026: what we really think after months of testing","meta_description":"The QuizCouple team tested Badoo for several months. Results, experience as a man and as a woman, pricing, fake profiles: our complete, unfiltered review.","featured_image_alt":"Our review of the Badoo dating app in 2026","excerpt":"Badoo, everyone knows it, nobody talks about it honestly. We tested it."},{"lang":"es","slug":"opinion-badoo","title":"Nuestra opinión sobre la aplicación de citas Badoo","meta_title":"Opiniones Badoo 2026: lo que pensamos de verdad tras meses de prueba","meta_description":"El equipo QuizCouple ha probado Badoo durante varios meses. Resultados, experiencia como hombre y como mujer, precios, perfiles falsos: nuestra opinión completa y sin filtros.","featured_image_alt":"Nuestra opinión sobre la aplicación de citas Badoo en 2026","excerpt":"Badoo, todo el mundo la conoce, nadie habla de ella con franqueza. La hemos probado."},{"lang":"de","slug":"badoo-erfahrungen","title":"Unsere Meinung zur Dating-App Badoo","meta_title":"Badoo Erfahrungen 2026: Was wir nach monatelangem Test wirklich davon halten","meta_description":"Das QuizCouple-Team hat Badoo mehrere Monate lang getestet. Ergebnisse, Erfahrungen aus männlicher und weiblicher Sicht, Preise, Fake-Profile: unser vollständiger und ehrlicher Erfahrungsbericht.","featured_image_alt":"Unsere Meinung zur Dating-App Badoo im Jahr 2026","excerpt":"Badoo — jeder kennt sie, aber niemand spricht offen darüber. Wir haben sie getestet."},{"lang":"it","slug":"recensione-badoo","title":"La nostra opinione sull'app di incontri Badoo","meta_title":"Recensione Badoo 2026: cosa ne pensiamo davvero dopo mesi di test","meta_description":"Il team QuizCouple ha testato Badoo per diversi mesi. Risultati, esperienza lato uomo e lato donna, prezzi, profili falsi: la nostra recensione completa e senza filtri.","featured_image_alt":"La nostra opinione sull'app di incontri Badoo nel 2026","excerpt":"Badoo, tutti la conoscono, nessuno ne parla apertamente. Noi l'abbiamo testata."}]},{"internal_slug":"femme-malheureuse-en-couple","featured_image_url":"","author_id":"mathieu-courtin","status":"published","published_at":"2026-03-01","translations":[{"lang":"fr","slug":"femme-malheureuse-en-couple","title":"Comment reconnaître une femme malheureuse en couple : les vrais signes","meta_title":"Comment reconnaître une femme malheureuse en couple : les vrais signes","meta_description":"Elle sourit encore, mais quelque chose a changé. Les signes qu'une femme est malheureuse en couple sont souvent là depuis un moment. On vous explique quoi regarder.","featured_image_alt":"Femme pensive assise seule, signes de mal-être dans le couple","excerpt":"Les signes sont souvent là depuis longtemps. On ne sait juste pas quoi regarder."},{"lang":"en","slug":"unhappy-woman-in-relationship-signs","title":"How to Recognize an Unhappy Woman in a Relationship: The Real Signs","meta_title":"How to Recognize an Unhappy Woman in a Relationship: The Real Signs","meta_description":"She still smiles, but something has changed. The signs a woman is unhappy in a relationship are often there — you just don't know what to look for. Here's what to watch.","featured_image_alt":"Pensive woman sitting alone, signs of unhappiness in a relationship","excerpt":"The signs have often been there for a while. You just didn't know what to look for."},{"lang":"es","slug":"mujer-infeliz-en-pareja-senales","title":"Cómo reconocer a una mujer infeliz en pareja: las verdaderas señales","meta_title":"Cómo reconocer a una mujer infeliz en pareja: las verdaderas señales","meta_description":"Sigue sonriendo, pero algo ha cambiado. Las señales de que una mujer es infeliz en pareja llevan tiempo ahí. Te explicamos qué mirar.","featured_image_alt":"Mujer pensativa sentada sola, señales de malestar en la pareja","excerpt":"Las señales llevan tiempo ahí. Simplemente no sabías qué mirar."},{"lang":"de","slug":"unglueckliche-frau-in-beziehung-anzeichen","title":"Wie man eine unglückliche Frau in einer Beziehung erkennt: Die wahren Anzeichen","meta_title":"Wie man eine unglückliche Frau in einer Beziehung erkennt: Die wahren Anzeichen","meta_description":"Sie lächelt noch, aber etwas hat sich verändert. Die Anzeichen, dass eine Frau in der Beziehung unglücklich ist, sind oft schon lange da. Wir erklären, worauf du achten solltest.","featured_image_alt":"Nachdenkliche Frau allein sitzend, Anzeichen von Unzufriedenheit in der Beziehung","excerpt":"Die Anzeichen sind oft schon lange da. Man weiß nur nicht, worauf man achten soll."},{"lang":"it","slug":"donna-infelice-in-coppia-segnali","title":"Come riconoscere una donna infelice in coppia: i veri segnali","meta_title":"Come riconoscere una donna infelice in coppia: i veri segnali","meta_description":"Sorride ancora, ma qualcosa è cambiato. I segnali che una donna è infelice in coppia spesso ci sono da tempo. Ti spieghiamo cosa osservare.","featured_image_alt":"Donna pensierosa seduta da sola, segnali di malessere nella coppia","excerpt":"I segnali ci sono spesso da tempo. Semplicemente non sapevi cosa cercare."}]},{"internal_slug":"compatibilite-amoureuse-belier","featured_image_url":"/blog/compatibilite-amoureuse-belier.svg","author_id":"lucie-courtin","status":"published","published_at":"2026-03-03","translations":[{"lang":"fr","slug":"compatibilite-amoureuse-belier","title":"Compatibilité amoureuse du Bélier : les signes qui l'enflamment (et ceux qui l'éteignent)","meta_title":"Compatibilité amoureuse Bélier : qui lui résiste vraiment ?","meta_description":"Le Bélier tombe vite amoureux, s'emballe encore plus vite — et déchante parfois. Découvrez quels signes peuvent vraiment tenir le rythme avec lui, et lesquels feront long feu.","featured_image_alt":"Symbole astrologique du Bélier — compatibilité amoureuse","excerpt":"Le Bélier tombe vite amoureux, s'emballe encore plus vite — et déchante parfois. Quels signes tiennent le rythme ?"},{"lang":"en","slug":"aries-love-compatibility","title":"Aries love compatibility: the signs that ignite them (and the ones that burn out)","meta_title":"Aries love compatibility: who can actually keep up?","meta_description":"Aries falls fast, loves hard, and moves on quickly when the spark dies. Find out which zodiac signs can truly match their fire — and which ones fizzle out.","featured_image_alt":"Aries astrological symbol — love compatibility","excerpt":"Aries falls fast, loves hard, and moves on quickly when the spark dies. Which signs can truly keep up?"},{"lang":"es","slug":"compatibilidad-amorosa-aries","title":"Compatibilidad amorosa de Aries: los signos que encienden su llama (y los que la apagan)","meta_title":"Compatibilidad amorosa de Aries: quién aguanta su ritmo","meta_description":"Aries se enamora rápido, se entusiasma aún más rápido y a veces se decepciona. Descubre qué signos pueden seguirle el paso y cuáles se quedan atrás.","featured_image_alt":"Símbolo astrológico de Aries — compatibilidad amorosa","excerpt":"Aries se enamora rápido, se entusiasma aún más rápido y a veces se decepciona. ¿Qué signos aguantan su ritmo?"},{"lang":"de","slug":"liebeskompatibilitaet-widder","title":"Liebeskompatibilität des Widders: Welche Sternzeichen entfachen sein Feuer — und welche es löschen","meta_title":"Liebeskompatibilität Widder: Wer hält wirklich mit ihm Schritt?","meta_description":"Der Widder verliebt sich schnell, brennt noch schneller — und wird manchmal enttäuscht. Erfahren Sie, welche Sternzeichen sein Tempo mitgehen können und welche auf der Strecke bleiben.","featured_image_alt":"Astrologisches Symbol des Widders — Liebeskompatibilität","excerpt":"Der Widder verliebt sich schnell, brennt noch schneller — und wird manchmal enttäuscht. Welche Sternzeichen können sein Tempo mitgehen?"},{"lang":"it","slug":"compatibilita-amorosa-ariete","title":"Compatibilità amorosa dell'Ariete: i segni che lo accendono (e quelli che lo spengono)","meta_title":"Compatibilità amorosa Ariete: chi riesce davvero a stargli dietro?","meta_description":"L'Ariete si innamora in fretta, si entusiasma ancora più in fretta — e a volte resta deluso. Scopri quali segni possono davvero tenere il suo ritmo e quali si esauriranno presto.","featured_image_alt":"Simbolo astrologico dell'Ariete — compatibilità amorosa","excerpt":"L'Ariete si innamora in fretta, si entusiasma ancora più in fretta — e a volte resta deluso. Quali segni riescono a tenere il passo?"}]},{"internal_slug":"compatibilite-amoureuse-taureau","featured_image_url":"/blog/compatibilite-amoureuse-taureau.svg","author_id":"mathieu-courtin","status":"published","published_at":"2026-03-03","translations":[{"lang":"fr","slug":"compatibilite-amoureuse-taureau","title":"Compatibilité amoureuse du Taureau : ce que les astres disent de ses histoires d'amour","meta_title":"Compatibilité amoureuse Taureau : amour solide ou impasse ?","meta_description":"Le Taureau aime profondément, loyalement — et souvent longuement. Mais tous les signes ne sont pas faits pour ce rythme-là. On vous dit avec qui ça marche vraiment.","featured_image_alt":"Symbole astrologique du Taureau — compatibilité amoureuse","excerpt":"Le Taureau aime profondément, loyalement — et souvent longuement. Mais tous les signes ne sont pas faits pour ce rythme-là."},{"lang":"en","slug":"taurus-love-compatibility","title":"Taurus love compatibility: what the stars say about their love stories","meta_title":"Taurus love compatibility: solid romance or dead end?","meta_description":"Taurus loves deeply, loyally, and for the long haul. But not every sign is built for that rhythm. Discover who truly works — and who doesn't.","featured_image_alt":"Taurus astrological symbol — love compatibility","excerpt":"Taurus loves deeply, loyally, and for the long haul. But not every sign is built for that rhythm."},{"lang":"es","slug":"compatibilidad-amorosa-tauro","title":"Compatibilidad amorosa de Tauro: lo que los astros dicen de sus historias de amor","meta_title":"Compatibilidad amorosa de Tauro: amor sólido o callejón sin salida","meta_description":"Tauro ama profundamente, con lealtad — y a menudo durante largo tiempo. Pero no todos los signos están hechos para ese ritmo. Te contamos con quién funciona de verdad.","featured_image_alt":"Símbolo astrológico de Tauro — compatibilidad amorosa","excerpt":"Tauro ama profundamente, con lealtad — y a menudo durante largo tiempo. Pero no todos los signos están hechos para ese ritmo."},{"lang":"de","slug":"liebeskompatibilitaet-stier","title":"Liebeskompatibilität des Stiers: Was die Sterne über seine Liebesgeschichten verraten","meta_title":"Liebeskompatibilität Stier: Solide Liebe oder Sackgasse?","meta_description":"Der Stier liebt tief, treu — und oft sehr lange. Doch nicht jedes Sternzeichen ist für dieses Tempo gemacht. Wir verraten, mit wem es wirklich funktioniert.","featured_image_alt":"Astrologisches Symbol des Stiers — Liebeskompatibilität","excerpt":"Der Stier liebt tief, treu — und oft sehr lange. Doch nicht jedes Sternzeichen ist für dieses Tempo gemacht."},{"lang":"it","slug":"compatibilita-amorosa-toro","title":"Compatibilità amorosa del Toro: cosa dicono le stelle sulle sue storie d'amore","meta_title":"Compatibilità amorosa Toro: amore solido o vicolo cieco?","meta_description":"Il Toro ama profondamente, con lealtà — e spesso a lungo. Ma non tutti i segni sono fatti per questo ritmo. Scopri con chi funziona davvero.","featured_image_alt":"Simbolo astrologico del Toro — compatibilità amorosa","excerpt":"Il Toro ama profondamente, con lealtà — e spesso a lungo. Ma non tutti i segni sono fatti per questo ritmo."}]},{"internal_slug":"compatibilite-amoureuse-gemeaux","featured_image_url":"/blog/compatibilite-amoureuse-gemeaux.svg","author_id":"lucie-courtin","status":"published","published_at":"2026-03-03","translations":[{"lang":"fr","slug":"compatibilite-amoureuse-gemeaux","title":"Compatibilité amoureuse des Gémeaux : les signes qui comprennent leur double nature","meta_title":"Compatibilité amoureuse Gémeaux : qui peut le suivre ?","meta_description":"Le Gémeaux change d'avis comme de chemise — et il aime ça. Mais en amour, qui arrive vraiment à le comprendre ? Nos analyses signe par signe, sans langue de bois.","featured_image_alt":"Symbole astrologique des Gémeaux — compatibilité amoureuse","excerpt":"Le Gémeaux change d'avis comme de chemise — et il aime ça. Mais en amour, qui arrive vraiment à le comprendre ?"},{"lang":"en","slug":"gemini-love-compatibility","title":"Gemini love compatibility: the signs that embrace their dual nature","meta_title":"Gemini love compatibility: who can keep up with them?","meta_description":"Gemini changes their mind like the wind — and they love it. But in love, who actually gets them? Our honest, sign-by-sign compatibility breakdown.","featured_image_alt":"Gemini astrological symbol — love compatibility","excerpt":"Gemini changes their mind like the wind — and they love it. But in love, who actually gets them?"},{"lang":"es","slug":"compatibilidad-amorosa-geminis","title":"Compatibilidad amorosa de Géminis: los signos que entienden su doble naturaleza","meta_title":"Compatibilidad amorosa de Géminis: quién puede seguirle el ritmo","meta_description":"Géminis cambia de opinión como de camisa — y le encanta. Pero en el amor, ¿quién logra entenderle de verdad? Nuestro análisis signo por signo, sin rodeos.","featured_image_alt":"Símbolo astrológico de Géminis — compatibilidad amorosa","excerpt":"Géminis cambia de opinión como de camisa — y le encanta. Pero en el amor, ¿quién logra entenderle de verdad?"},{"lang":"de","slug":"liebeskompatibilitaet-zwillinge","title":"Liebeskompatibilität der Zwillinge: Zwischen Schmetterlingen und Fluchtinstinkt","meta_title":"Liebeskompatibilität Zwillinge: Wer fängt diesen Luftgeist ein?","meta_description":"Zwillinge lieben die Abwechslung — auch in der Liebe. Erfahren Sie, welche Sternzeichen sie langfristig fesseln und welche nur ein kurzes Abenteuer bleiben.","featured_image_alt":"Astrologisches Symbol der Zwillinge — Liebeskompatibilität","excerpt":"Zwillinge lieben die Abwechslung — auch in der Liebe. Welche Sternzeichen fesseln sie wirklich langfristig?"},{"lang":"it","slug":"compatibilita-amorosa-gemelli","title":"Compatibilità amorosa dei Gemelli: l'amore come conversazione infinita","meta_title":"Compatibilità amorosa Gemelli: chi riesce a non annoiarli?","meta_description":"I Gemelli hanno bisogno di un partner che li stimoli mentalmente prima ancora che emotivamente. Scopri quali segni riescono a tenere vivo il dialogo — e quali li fanno fuggire.","featured_image_alt":"Simbolo astrologico dei Gemelli — compatibilità amorosa","excerpt":"I Gemelli hanno bisogno di un partner che li stimoli mentalmente prima ancora che emotivamente. Quali segni ci riescono?"}]},{"internal_slug":"compatibilite-amoureuse-cancer","featured_image_url":"/blog/compatibilite-amoureuse-cancer.svg","author_id":"mathieu-courtin","status":"published","published_at":"2026-03-03","translations":[{"lang":"fr","slug":"compatibilite-amoureuse-cancer","title":"Compatibilité amoureuse du Cancer : à qui peut-il vraiment ouvrir son cœur ?","meta_title":"Compatibilité amoureuse Cancer : les unions qui le comblent","meta_description":"Le Cancer donne tout en amour — peut-être même trop. Quels signes savent recevoir cet amour sans en abuser ? Notre analyse complète de ses compatibilités.","featured_image_alt":"Symbole astrologique du Cancer — compatibilité amoureuse","excerpt":"Le Cancer donne tout en amour — peut-être même trop. Quels signes savent recevoir cet amour sans en abuser ?"},{"lang":"en","slug":"cancer-love-compatibility","title":"Cancer love compatibility: who can they truly open their heart to?","meta_title":"Cancer love compatibility: the unions that fulfil them","meta_description":"Cancer gives everything in love — sometimes too much. Which signs know how to receive that love without taking advantage? Our full compatibility analysis.","featured_image_alt":"Cancer astrological symbol — love compatibility","excerpt":"Cancer gives everything in love — sometimes too much. Which signs know how to receive that love without taking advantage?"},{"lang":"es","slug":"compatibilidad-amorosa-cancer","title":"Compatibilidad amorosa de Cáncer: a quién puede abrirle realmente el corazón","meta_title":"Compatibilidad amorosa de Cáncer: las uniones que le colman","meta_description":"Cáncer lo da todo en el amor — quizá incluso demasiado. ¿Qué signos saben recibir ese amor sin abusar de él? Nuestro análisis completo de sus compatibilidades.","featured_image_alt":"Símbolo astrológico de Cáncer — compatibilidad amorosa","excerpt":"Cáncer lo da todo en el amor — quizá incluso demasiado. ¿Qué signos saben recibir ese amor sin abusar de él?"},{"lang":"de","slug":"liebeskompatibilitaet-krebs","title":"Liebeskompatibilität des Krebses: Wer darf hinter seine schützende Schale?","meta_title":"Liebeskompatibilität Krebs: Wer erreicht sein verwundbares Herz?","meta_description":"Der Krebs liebt intensiv und schützend — doch nicht jedes Zeichen versteht seine emotionale Tiefe. Finden Sie heraus, welche Verbindungen blühen und welche scheitern.","featured_image_alt":"Astrologisches Symbol des Krebses — Liebeskompatibilität","excerpt":"Der Krebs liebt intensiv und schützend — doch nicht jedes Zeichen versteht seine emotionale Tiefe."},{"lang":"it","slug":"compatibilita-amorosa-cancro","title":"Compatibilità amorosa del Cancro: l'amore come rifugio (o come campo minato)","meta_title":"Compatibilità amorosa Cancro: chi merita davvero la sua fiducia?","meta_description":"Il Cancro ama con tutto sé stesso e costruisce nidi emotivi per chi gli sta accanto. Ma non tutti i segni sanno abitare quello spazio. Ecco con chi funziona — e perché.","featured_image_alt":"Simbolo astrologico del Cancro — compatibilità amorosa","excerpt":"Il Cancro ama con tutto sé stesso e costruisce nidi emotivi per chi gli sta accanto. Ma non tutti i segni sanno abitare quello spazio."}]},{"internal_slug":"compatibilite-amoureuse-lion","featured_image_url":"/blog/compatibilite-amoureuse-lion.svg","author_id":"lucie-courtin","status":"published","published_at":"2026-03-03","translations":[{"lang":"fr","slug":"compatibilite-amoureuse-lion","title":"Compatibilité amoureuse du Lion : les signes à la hauteur de son feu","meta_title":"Compatibilité amoureuse Lion : qui mérite sa loyauté royale ?","meta_description":"Le Lion aime avec panache et attend qu'on lui rende. Mais tous les signes ne jouent pas ce jeu-là. Découvrez quelles unions l'épanouissent vraiment — et lesquelles l'éteignent.","featured_image_alt":"Symbole astrologique du Lion — compatibilité amoureuse","excerpt":"Le Lion aime avec panache et attend qu'on lui rende. Mais tous les signes ne jouent pas ce jeu-là."},{"lang":"en","slug":"leo-love-compatibility","title":"Leo love compatibility: the signs worthy of their fire","meta_title":"Leo love compatibility: who deserves their royal loyalty?","meta_description":"Leo loves with flair and expects it in return. But not every sign plays that game. Discover which unions truly let them shine — and which dim their light.","featured_image_alt":"Leo astrological symbol — love compatibility","excerpt":"Leo loves with flair and expects it in return. But not every sign plays that game."},{"lang":"es","slug":"compatibilidad-amorosa-leo","title":"Compatibilidad amorosa de Leo: los signos que están a la altura de su fuego","meta_title":"Compatibilidad amorosa de Leo: quién merece su lealtad real","meta_description":"Leo ama con intensidad y espera que se lo devuelvan. Pero no todos los signos juegan a ese juego. Descubre qué uniones le hacen brillar y cuáles le apagan.","featured_image_alt":"Símbolo astrológico de Leo — compatibilidad amorosa","excerpt":"Leo ama con intensidad y espera que se lo devuelvan. Pero no todos los signos juegan a ese juego."},{"lang":"de","slug":"liebeskompatibilitaet-loewe","title":"Liebeskompatibilität des Löwen: Welche Zeichen seinem Feuer gewachsen sind","meta_title":"Liebeskompatibilität Löwe: Wer verdient seine königliche Treue?","meta_description":"Der Löwe liebt mit Leidenschaft und erwartet Gleiches zurück. Doch nicht jedes Zeichen spielt dieses Spiel mit. Erfahren Sie, welche Verbindungen ihn zum Strahlen bringen.","featured_image_alt":"Astrologisches Symbol des Löwen — Liebeskompatibilität","excerpt":"Der Löwe liebt mit Leidenschaft und erwartet Gleiches zurück. Doch nicht jedes Zeichen spielt dieses Spiel mit."},{"lang":"it","slug":"compatibilita-amorosa-leone","title":"Compatibilità amorosa del Leone: amare sotto i riflettori","meta_title":"Compatibilità amorosa Leone: chi brilla al suo fianco?","meta_description":"Il Leone ama in grande — con gesti, con passione, con orgoglio. Ma ha bisogno di un partner che non si lasci eclissare. Ecco chi riesce a stargli accanto senza perdersi.","featured_image_alt":"Simbolo astrologico del Leone — compatibilità amorosa","excerpt":"Il Leone ama in grande — con gesti, con passione, con orgoglio. Ma ha bisogno di un partner che non si lasci eclissare."}]},{"internal_slug":"compatibilite-amoureuse-vierge","featured_image_url":"/blog/compatibilite-amoureuse-vierge.svg","author_id":"mathieu-courtin","status":"published","published_at":"2026-03-03","translations":[{"lang":"fr","slug":"compatibilite-amoureuse-vierge","title":"Compatibilité amoureuse de la Vierge : qui sait lire entre ses lignes ?","meta_title":"Compatibilité amoureuse Vierge : l'amour sous toutes ses facettes","meta_description":"La Vierge aime en silence, en actes, en détails que personne d'autre ne remarque. Quels signes savent lire cet amour discret ? Notre analyse complète de ses compatibilités.","featured_image_alt":"Symbole astrologique de la Vierge — compatibilité amoureuse","excerpt":"La Vierge aime en silence, en actes, en détails que personne d'autre ne remarque. Quels signes savent lire cet amour discret ?"},{"lang":"en","slug":"virgo-love-compatibility","title":"Virgo love compatibility: who knows how to read between their lines?","meta_title":"Virgo love compatibility: love in all its quiet depth","meta_description":"Virgo loves in silence, through actions, through details no one else notices. Which signs can read that quiet devotion? Our full compatibility analysis.","featured_image_alt":"Virgo astrological symbol — love compatibility","excerpt":"Virgo loves in silence, through actions, through details no one else notices. Which signs can read that quiet devotion?"},{"lang":"es","slug":"compatibilidad-amorosa-virgo","title":"Compatibilidad amorosa de Virgo: quién sabe leer entre sus líneas","meta_title":"Compatibilidad amorosa de Virgo: el amor en todas sus facetas","meta_description":"Virgo ama en silencio, con hechos, con detalles que nadie más percibe. ¿Qué signos saben interpretar ese amor discreto? Nuestro análisis completo de sus compatibilidades.","featured_image_alt":"Símbolo astrológico de Virgo — compatibilidad amorosa","excerpt":"Virgo ama en silencio, con hechos, con detalles que nadie más percibe. ¿Qué signos saben interpretar ese amor discreto?"},{"lang":"de","slug":"liebeskompatibilitaet-jungfrau","title":"Liebeskompatibilität der Jungfrau: Perfektion gesucht — Menschlichkeit gefunden","meta_title":"Liebeskompatibilität Jungfrau: Wer erfüllt ihre hohen Ansprüche?","meta_description":"Die Jungfrau analysiert alles — auch die Liebe. Erfahren Sie, welche Sternzeichen ihre Tiefe zu schätzen wissen und welche an ihrem Perfektionismus scheitern.","featured_image_alt":"Astrologisches Symbol der Jungfrau — Liebeskompatibilität","excerpt":"Die Jungfrau analysiert alles — auch die Liebe. Welche Sternzeichen wissen ihre Tiefe wirklich zu schätzen?"},{"lang":"it","slug":"compatibilita-amorosa-vergine","title":"Compatibilità amorosa della Vergine: l'amore nei dettagli","meta_title":"Compatibilità amorosa Vergine: chi sa apprezzare la sua cura?","meta_description":"La Vergine ama con attenzione, precisione e dedizione silenziosa. Ma non tutti i segni capiscono questo linguaggio. Scopri chi riesce a valorizzare la sua profondità.","featured_image_alt":"Simbolo astrologico della Vergine — compatibilità amorosa","excerpt":"La Vergine ama con attenzione, precisione e dedizione silenziosa. Ma non tutti i segni capiscono questo linguaggio."}]},{"internal_slug":"compatibilite-amoureuse-balance","featured_image_url":"/blog/compatibilite-amoureuse-balance.svg","author_id":"lucie-courtin","status":"published","published_at":"2026-03-03","translations":[{"lang":"fr","slug":"compatibilite-amoureuse-balance","title":"Compatibilité amoureuse de la Balance : les signes qui l'aident à s'ancrer","meta_title":"Compatibilité amoureuse Balance : qui l'aide à choisir ?","meta_description":"La Balance cherche l'harmonie en amour — parfois au point de ne jamais trancher. Découvrez quels signes lui donnent enfin envie de se décider, et lesquels compliquent tout.","featured_image_alt":"Symbole astrologique de la Balance — compatibilité amoureuse","excerpt":"La Balance cherche l'harmonie en amour — parfois au point de ne jamais trancher. Quels signes lui donnent envie de se décider ?"},{"lang":"en","slug":"libra-love-compatibility","title":"Libra love compatibility: the signs that help them find their anchor","meta_title":"Libra love compatibility: who helps them choose?","meta_description":"Libra craves harmony in love — sometimes to the point of never deciding. Discover which signs finally make them want to commit, and which ones complicate everything.","featured_image_alt":"Libra astrological symbol — love compatibility","excerpt":"Libra craves harmony in love — sometimes to the point of never deciding. Which signs make them want to commit?"},{"lang":"es","slug":"compatibilidad-amorosa-libra","title":"Compatibilidad amorosa de Libra: el signo que busca el equilibrio perfecto en pareja","meta_title":"Compatibilidad amorosa de Libra: con quién encuentra la armonía","meta_description":"Libra necesita armonía en el amor como otros necesitan aire para respirar. ¿Qué signos saben dársela sin anularle? Análisis completo de sus compatibilidades.","featured_image_alt":"Símbolo astrológico de Libra — compatibilidad amorosa","excerpt":"Libra necesita armonía en el amor como otros necesitan aire para respirar. ¿Qué signos saben dársela sin anularle?"},{"lang":"de","slug":"liebeskompatibilitaet-waage","title":"Liebeskompatibilität der Waage: Harmonie um jeden Preis — oder echte Partnerschaft?","meta_title":"Liebeskompatibilität Waage: Wer bringt sie ins Gleichgewicht?","meta_description":"Die Waage sucht Harmonie, Schönheit und einen Partner auf Augenhöhe. Erfahren Sie, welche Sternzeichen ihr das bieten können — und welche sie aus dem Gleichgewicht bringen.","featured_image_alt":"Astrologisches Symbol der Waage — Liebeskompatibilität","excerpt":"Die Waage sucht Harmonie, Schönheit und einen Partner auf Augenhöhe. Welche Zeichen bringen sie ins Gleichgewicht?"},{"lang":"it","slug":"compatibilita-amorosa-bilancia","title":"Compatibilità amorosa della Bilancia: l'eterna ricerca dell'equilibrio a due","meta_title":"Compatibilità amorosa Bilancia: chi completa la sua armonia?","meta_description":"La Bilancia cerca l'armonia in tutto, specialmente in amore. Ma trovare un partner che non la squilibri è più difficile di quanto sembri. La nostra analisi segno per segno.","featured_image_alt":"Simbolo astrologico della Bilancia — compatibilità amorosa","excerpt":"La Bilancia cerca l'armonia in tutto, specialmente in amore. Ma trovare chi non la squilibri è più difficile di quanto sembri."}]},{"internal_slug":"compatibilite-amoureuse-scorpion","featured_image_url":"/blog/compatibilite-amoureuse-scorpion.svg","author_id":"mathieu-courtin","status":"published","published_at":"2026-03-03","translations":[{"lang":"fr","slug":"compatibilite-amoureuse-scorpion","title":"Compatibilité amoureuse du Scorpion : l'amour sans demi-mesures","meta_title":"Compatibilité amoureuse Scorpion : qui survit à son intensité ?","meta_description":"Le Scorpion aime sans demi-mesure — et il attend la même chose. Quels signes peuvent soutenir cette intensité ? Notre analyse complète, signe par signe, sans esquiver.","featured_image_alt":"Symbole astrologique du Scorpion — compatibilité amoureuse","excerpt":"Le Scorpion aime sans demi-mesure — et il attend la même chose. Quels signes peuvent soutenir cette intensité ?"},{"lang":"en","slug":"scorpio-love-compatibility","title":"Scorpio love compatibility: love without half measures","meta_title":"Scorpio love compatibility: who can survive their intensity?","meta_description":"Scorpio loves without compromise — and expects the same in return. Which signs can handle that depth? Our complete, sign-by-sign analysis, no punches pulled.","featured_image_alt":"Scorpio astrological symbol — love compatibility","excerpt":"Scorpio loves without compromise — and expects the same in return. Which signs can handle that depth?"},{"lang":"es","slug":"compatibilidad-amorosa-escorpio","title":"Compatibilidad amorosa de Escorpio: los signos que resisten su intensidad","meta_title":"Compatibilidad amorosa de Escorpio: quién aguanta su profundidad","meta_description":"Escorpio ama con una intensidad que pocos signos pueden igualar. ¿Quién está a la altura de esa pasión sin salir quemado? Análisis completo de sus compatibilidades.","featured_image_alt":"Símbolo astrológico de Escorpio — compatibilidad amorosa","excerpt":"Escorpio ama con una intensidad que pocos signos pueden igualar. ¿Quién está a la altura de esa pasión sin salir quemado?"},{"lang":"de","slug":"liebeskompatibilitaet-skorpion","title":"Liebeskompatibilität des Skorpions: Zwischen Hingabe und Abgrund","meta_title":"Liebeskompatibilität Skorpion: Wer übersteht seine Intensität?","meta_description":"Der Skorpion liebt absolut — oder gar nicht. Erfahren Sie, welche Sternzeichen diese Tiefe aushalten und welche daran zerbrechen.","featured_image_alt":"Astrologisches Symbol des Skorpions — Liebeskompatibilität","excerpt":"Der Skorpion liebt absolut — oder gar nicht. Welche Sternzeichen halten seine Intensität aus?"},{"lang":"it","slug":"compatibilita-amorosa-scorpione","title":"Compatibilità amorosa dello Scorpione: l'amore senza mezze misure","meta_title":"Compatibilità amorosa Scorpione: chi sopravvive alla sua intensità?","meta_description":"Lo Scorpione ama senza mezze misure — e pretende lo stesso dall'altro. Quali segni possono reggere questa intensità? Analisi completa, segno per segno, senza giri di parole.","featured_image_alt":"Simbolo astrologico dello Scorpione — compatibilità amorosa","excerpt":"Lo Scorpione ama senza mezze misure — e pretende lo stesso dall'altro. Quali segni possono reggere questa intensità?"}]},{"internal_slug":"compatibilite-amoureuse-sagittaire","featured_image_url":"/blog/compatibilite-amoureuse-sagittaire.svg","author_id":"mathieu-courtin","status":"published","published_at":"2026-03-03","translations":[{"lang":"fr","slug":"compatibilite-amoureuse-sagittaire","title":"Compatibilité amoureuse du Sagittaire : l'amour comme une aventure","meta_title":"Compatibilité amoureuse Sagittaire : qui peut suivre son rythme ?","meta_description":"Le Sagittaire a besoin de liberté, de mouvement et de sens. Quels signes peuvent l'accompagner sans le freiner ? Notre analyse complète, signe par signe.","featured_image_alt":"Symbole astrologique du Sagittaire — compatibilité amoureuse","excerpt":"Le Sagittaire a besoin de liberté, de mouvement et de sens. Quels signes peuvent l'accompagner sans le freiner ?"},{"lang":"en","slug":"sagittarius-love-compatibility","title":"Sagittarius love compatibility: love as an adventure","meta_title":"Sagittarius love compatibility: who can match their pace?","meta_description":"Sagittarius needs freedom, movement, and meaning. Which signs can journey alongside them without holding them back? Our complete, sign-by-sign analysis.","featured_image_alt":"Sagittarius astrological symbol — love compatibility","excerpt":"Sagittarius needs freedom, movement, and meaning. Which signs can journey alongside them without holding them back?"},{"lang":"es","slug":"compatibilidad-amorosa-sagitario","title":"Compatibilidad amorosa de Sagitario: los signos que no le cortan las alas","meta_title":"Compatibilidad amorosa de Sagitario: quién le sigue sin frenarlo","meta_description":"Sagitario necesita libertad como necesita respirar. Pero eso no significa que no quiera amar. Descubre qué signos saben acompañarle sin ponerle cadenas.","featured_image_alt":"Símbolo astrológico de Sagitario — compatibilidad amorosa","excerpt":"Sagitario necesita libertad como necesita respirar. Pero eso no significa que no quiera amar. ¿Qué signos le acompañan sin ponerle cadenas?"},{"lang":"de","slug":"liebeskompatibilitaet-schuetze","title":"Liebeskompatibilität des Schützen: Freiheit, Fernweh und die Suche nach dem großen Ganzen","meta_title":"Liebeskompatibilität Schütze: Wer begleitet ihn auf seiner Reise?","meta_description":"Der Schütze liebt die Freiheit — und trotzdem die Liebe. Erfahren Sie, welche Sternzeichen ihn begleiten können, ohne ihn einzuengen.","featured_image_alt":"Astrologisches Symbol des Schützen — Liebeskompatibilität","excerpt":"Der Schütze liebt die Freiheit — und trotzdem die Liebe. Welche Sternzeichen können ihn begleiten, ohne ihn einzuengen?"},{"lang":"it","slug":"compatibilita-amorosa-sagittario","title":"Compatibilità amorosa del Sagittario: l'amore come avventura senza mappa","meta_title":"Compatibilità amorosa Sagittario: chi riesce a viaggiare al suo passo?","meta_description":"Il Sagittario vive l'amore come un'avventura — e non tutti sono pronti a partire senza sapere la destinazione. Scopri quali segni sanno stare al suo fianco senza frenarlo.","featured_image_alt":"Simbolo astrologico del Sagittario — compatibilità amorosa","excerpt":"Il Sagittario vive l'amore come un'avventura — e non tutti sono pronti a partire senza sapere la destinazione."}]},{"internal_slug":"compatibilite-amoureuse-capricorne","featured_image_url":"/blog/compatibilite-amoureuse-capricorne.svg","author_id":"lucie-courtin","status":"published","published_at":"2026-03-03","translations":[{"lang":"fr","slug":"compatibilite-amoureuse-capricorne","title":"Compatibilité amoureuse du Capricorne : l'amour comme un engagement","meta_title":"Compatibilité amoureuse Capricorne : qui mérite sa loyauté ?","meta_description":"Le Capricorne ne s'engage pas à la légère — et quand il le fait, c'est pour construire. Quels signes partagent cette vision ? Notre analyse complète, signe par signe.","featured_image_alt":"Symbole astrologique du Capricorne — compatibilité amoureuse","excerpt":"Le Capricorne ne s'engage pas à la légère — et quand il le fait, c'est pour construire. Quels signes partagent cette vision ?"},{"lang":"en","slug":"capricorn-love-compatibility","title":"Capricorn love compatibility: love as a commitment","meta_title":"Capricorn love compatibility: who deserves their loyalty?","meta_description":"Capricorn doesn't commit lightly — and when they do, it's to build something real. Which signs share that vision? Our complete, sign-by-sign analysis.","featured_image_alt":"Capricorn astrological symbol — love compatibility","excerpt":"Capricorn doesn't commit lightly — and when they do, it's to build something real. Which signs share that vision?"},{"lang":"es","slug":"compatibilidad-amorosa-capricornio","title":"Compatibilidad amorosa de Capricornio: los signos que entienden su forma de querer","meta_title":"Compatibilidad amorosa de Capricornio: amor lento pero sólido","meta_description":"Capricornio no dice \"te quiero\" a la ligera. Cuando lo dice, es para siempre. Descubre qué signos entienden esa forma de amar y cuáles se impacientan.","featured_image_alt":"Símbolo astrológico de Capricornio — compatibilidad amorosa","excerpt":"Capricornio no dice \"te quiero\" a la ligera. Cuando lo dice, es para siempre. ¿Qué signos entienden esa forma de amar?"},{"lang":"de","slug":"liebeskompatibilitaet-steinbock","title":"Liebeskompatibilität des Steinbocks: Langsam, beständig — und tiefer als gedacht","meta_title":"Liebeskompatibilität Steinbock: Wer erreicht sein verborgenes Herz?","meta_description":"Der Steinbock liebt leise, aber dafür auf Dauer. Erfahren Sie, welche Sternzeichen seine reservierte Art als Stärke erkennen — und welche daran verzweifeln.","featured_image_alt":"Astrologisches Symbol des Steinbocks — Liebeskompatibilität","excerpt":"Der Steinbock liebt leise, aber dafür auf Dauer. Welche Sternzeichen erkennen seine reservierte Art als Stärke?"},{"lang":"it","slug":"compatibilita-amorosa-capricorno","title":"Compatibilità amorosa del Capricorno: l'amore come progetto a lungo termine","meta_title":"Compatibilità amorosa Capricorno: chi è all'altezza della sua serietà?","meta_description":"Il Capricorno non perde tempo con storie senza futuro. Cerca un partner che costruisca con lui, non che lo distragga. Scopri quali segni sono pronti per questo impegno.","featured_image_alt":"Simbolo astrologico del Capricorno — compatibilità amorosa","excerpt":"Il Capricorno non perde tempo con storie senza futuro. Cerca un partner che costruisca con lui, non che lo distragga."}]},{"internal_slug":"compatibilite-amoureuse-verseau","featured_image_url":"/blog/compatibilite-amoureuse-verseau.svg","author_id":"mathieu-courtin","status":"published","published_at":"2026-03-03","translations":[{"lang":"fr","slug":"compatibilite-amoureuse-verseau","title":"Compatibilité amoureuse du Verseau : l'amour en toute liberté","meta_title":"Compatibilité amoureuse Verseau : qui peut aimer sans posséder ?","meta_description":"Le Verseau aime autrement — avec distance, intelligence et liberté. Quels signes comprennent cette façon d'aimer ? Notre analyse complète, sans compromis.","featured_image_alt":"Symbole astrologique du Verseau — compatibilité amoureuse","excerpt":"Le Verseau aime autrement — avec distance, intelligence et liberté. Quels signes comprennent cette façon d'aimer ?"},{"lang":"en","slug":"aquarius-love-compatibility","title":"Aquarius love compatibility: love on their own terms","meta_title":"Aquarius love compatibility: who can love without possessing?","meta_description":"Aquarius loves differently — with distance, intelligence, and freedom. Which signs understand that approach? Our complete analysis, no compromises.","featured_image_alt":"Aquarius astrological symbol — love compatibility","excerpt":"Aquarius loves differently — with distance, intelligence, and freedom. Which signs understand that approach?"},{"lang":"es","slug":"compatibilidad-amorosa-acuario","title":"Compatibilidad amorosa de Acuario: los signos que aman sin asfixiar","meta_title":"Compatibilidad amorosa de Acuario: libertad y amor, ¿son compatibles?","meta_description":"Acuario ama a su manera — con espacio, independencia y una mente que no para. ¿Qué signos entienden esa forma de querer sin tomárselo como indiferencia?","featured_image_alt":"Símbolo astrológico de Acuario — compatibilidad amorosa","excerpt":"Acuario ama a su manera — con espacio, independencia y una mente que no para. ¿Qué signos entienden esa forma de querer?"},{"lang":"de","slug":"liebeskompatibilitaet-wassermann","title":"Liebeskompatibilität des Wassermanns: Freigeist mit Herz — wenn man ihn lässt","meta_title":"Liebeskompatibilität Wassermann: Wer versteht seinen Freiheitsdrang?","meta_description":"Der Wassermann liebt anders als alle anderen — unkonventionell, frei und auf seine eigene Art tief. Erfahren Sie, welche Zeichen damit umgehen können.","featured_image_alt":"Astrologisches Symbol des Wassermanns — Liebeskompatibilität","excerpt":"Der Wassermann liebt anders als alle anderen — unkonventionell, frei und auf seine eigene Art tief."},{"lang":"it","slug":"compatibilita-amorosa-acquario","title":"Compatibilità amorosa dell'Acquario: l'amore secondo le proprie regole","meta_title":"Compatibilità amorosa Acquario: chi accetta il suo modo unico di amare?","meta_description":"L'Acquario ama a modo suo — e quel modo non somiglia a nessun altro. Scopri quali segni capiscono la sua libertà e quali tentano invano di cambiarlo.","featured_image_alt":"Simbolo astrologico dell'Acquario — compatibilità amorosa","excerpt":"L'Acquario ama a modo suo — e quel modo non somiglia a nessun altro. Quali segni capiscono la sua libertà?"}]},{"internal_slug":"compatibilite-amoureuse-poissons","featured_image_url":"/blog/compatibilite-amoureuse-poissons.svg","author_id":"lucie-courtin","status":"published","published_at":"2026-03-03","translations":[{"lang":"fr","slug":"compatibilite-amoureuse-poissons","title":"Compatibilité amoureuse des Poissons : l'amour comme un océan","meta_title":"Compatibilité amoureuse Poissons : qui peut plonger avec eux ?","meta_description":"Les Poissons aiment avec une profondeur que peu de signes comprennent. Quels partenaires savent naviguer dans leurs eaux ? Notre analyse complète, signe par signe.","featured_image_alt":"Symbole astrologique des Poissons — compatibilité amoureuse","excerpt":"Les Poissons aiment avec une profondeur que peu de signes comprennent. Quels partenaires savent naviguer dans leurs eaux ?"},{"lang":"en","slug":"pisces-love-compatibility","title":"Pisces love compatibility: love as an ocean","meta_title":"Pisces love compatibility: who can dive in with them?","meta_description":"Pisces loves with a depth few signs understand. Which partners can navigate their waters? Our complete, sign-by-sign analysis.","featured_image_alt":"Pisces astrological symbol — love compatibility","excerpt":"Pisces loves with a depth few signs understand. Which partners can navigate their waters?"},{"lang":"es","slug":"compatibilidad-amorosa-piscis","title":"Compatibilidad amorosa de Piscis: los signos que navegan sus aguas profundas","meta_title":"Compatibilidad amorosa de Piscis: quién se sumerge con él","meta_description":"Piscis ama con todo su ser — a veces hasta perderse. ¿Qué signos saben nadar en sus aguas profundas sin ahogarse ni ahogarle? Análisis completo de sus compatibilidades.","featured_image_alt":"Símbolo astrológico de Piscis — compatibilidad amorosa","excerpt":"Piscis ama con todo su ser — a veces hasta perderse. ¿Qué signos saben nadar en sus aguas profundas sin ahogarse?"},{"lang":"de","slug":"liebeskompatibilitaet-fische","title":"Liebeskompatibilität der Fische: Zwischen Traum und Wirklichkeit — wer hält sie an Land?","meta_title":"Liebeskompatibilität Fische: Wer verdient ihre grenzenlose Hingabe?","meta_description":"Die Fische lieben ohne Grenzen — und genau das kann zum Problem werden. Erfahren Sie, welche Sternzeichen sie tragen und welche sie untergehen lassen.","featured_image_alt":"Astrologisches Symbol der Fische — Liebeskompatibilität","excerpt":"Die Fische lieben ohne Grenzen — und genau das kann zum Problem werden. Welche Zeichen tragen sie wirklich?"},{"lang":"it","slug":"compatibilita-amorosa-pesci","title":"Compatibilità amorosa dei Pesci: l'amore come immersione totale","meta_title":"Compatibilità amorosa Pesci: chi sa nuotare nelle loro acque profonde?","meta_description":"I Pesci amano con un'intensità emotiva che pochi altri segni raggiungono. Ma non tutti sanno nuotare in acque così profonde. Scopri chi li completa davvero.","featured_image_alt":"Simbolo astrologico dei Pesci — compatibilità amorosa","excerpt":"I Pesci amano con un'intensità emotiva che pochi altri segni raggiungono. Ma non tutti sanno nuotare in acque così profonde."}]},{"internal_slug":"red-flags-homme","featured_image_url":"","author_id":"lucie-courtin","status":"published","published_at":"2026-03-05","translations":[{"lang":"fr","slug":"red-flags-homme","title":"Red flags chez un homme : ce que ton instinct essaie de te dire","meta_title":"Les Red flags chez un Homme : la liste complète","meta_description":"Quelque chose cloche, mais tu n'arrives pas à mettre le doigt dessus ? Red flags comportementaux, émotionnels, relationnels — la liste complète pour y voir clair.","featured_image_alt":"Red flags chez un homme — liste complète des signaux d'alarme en couple","excerpt":"Les red flags sont rarement des signaux fracassants. Ce sont des patterns qu'on minimise jusqu'au jour où on réalise qu'on les a normalisés."},{"lang":"en","slug":"red-flags-in-a-man","title":"Red flags in a man: what your gut is trying to tell you","meta_title":"Red Flags in a Man: The Complete List","meta_description":"Something feels off but you can't quite name it? Emotional, behavioural, relationship red flags — the complete list to help you see things clearly.","featured_image_alt":"Red flags in a man — complete list of warning signs in a relationship","excerpt":"Red flags are rarely loud alarm bells. They're patterns you brush off until the day you realise you've been normalising them for months."},{"lang":"es","slug":"red-flags-en-un-hombre","title":"Red flags en un hombre: lo que tu instinto intenta decirte","meta_title":"Red flags en un hombre: la lista completa","meta_description":"Algo no cuadra pero no logras definir qué. Red flags emocionales, de comportamiento, relacionales — la lista completa para verlo con claridad.","featured_image_alt":"Red flags en un hombre — lista completa de señales de alerta en pareja","excerpt":"Las red flags rara vez son señales de alarma estridentes. Son patrones que minimizas hasta que un día te das cuenta de que llevas meses normalizándolos."},{"lang":"de","slug":"red-flags-bei-einem-mann","title":"Red Flags bei einem Mann: Was dein Instinkt dir sagen will","meta_title":"Red Flags bei einem Mann: Die vollständige Liste","meta_description":"Irgendetwas stimmt nicht, aber du kannst es nicht benennen? Emotionale, verhaltensbezogene und beziehungstechnische Red Flags — die vollständige Liste für mehr Klarheit.","featured_image_alt":"Red Flags bei einem Mann — vollständige Liste der Warnsignale in einer Beziehung","excerpt":"Red Flags sind selten laute Alarmsignale. Es sind Muster, die du herunterspielst, bis du eines Tages merkst, dass du sie seit Monaten als normal akzeptierst."},{"lang":"it","slug":"red-flag-in-un-uomo","title":"Red flag in un uomo: quello che il tuo istinto sta cercando di dirti","meta_title":"Red flag in un uomo: la lista completa","meta_description":"Qualcosa non va, ma non riesci a capire cosa. Red flag emotive, comportamentali, relazionali — la lista completa per vederci chiaro.","featured_image_alt":"Red flag in un uomo — lista completa dei segnali d'allarme in coppia","excerpt":"Le red flag sono raramente segnali d'allarme fragorosi. Sono schemi che minimizzi fino al giorno in cui ti rendi conto di averli normalizzati da mesi."}]},{"internal_slug":"red-flags-femme","featured_image_url":"","author_id":"mathieu-courtin","status":"published","published_at":"2026-03-07","translations":[{"lang":"fr","slug":"red-flags-femme","title":"Red flags chez une femme : ce que tu ressens a probablement un nom","meta_title":"Les Red flags chez une Femme : la liste complète","meta_description":"Quelque chose cloche dans ta relation mais tu n'arrives pas à mettre le doigt dessus ? Red flags émotionnels, comportementaux, relationnels chez une femme, la liste complète.","featured_image_alt":"Red flags chez une femme — liste complète des signaux d'alarme en couple","excerpt":"Un red flag, ce n'est pas un défaut de caractère. C'est un pattern relationnel répété qui, sur la durée, rend une relation épuisante, déséquilibrée ou toxique."},{"lang":"en","slug":"red-flags-in-a-woman","title":"Red flags in a woman: what you're feeling probably has a name","meta_title":"Red Flags in a Woman: The Complete List","meta_description":"Something feels off in your relationship but you can't quite name it? Emotional, behavioural, relational red flags in a woman — the complete list.","featured_image_alt":"Red flags in a woman — complete list of warning signs in a relationship","excerpt":"A red flag isn't a character flaw. It's a repeated relational pattern that, over time, makes a relationship exhausting, unbalanced, or toxic."},{"lang":"es","slug":"red-flags-en-una-mujer","title":"Red flags en una mujer: lo que sientes probablemente tiene nombre","meta_title":"Red flags en una mujer: la lista completa","meta_description":"Algo no cuadra en tu relación pero no logras definir qué. Red flags emocionales, de comportamiento, relacionales en una mujer, la lista completa.","featured_image_alt":"Red flags en una mujer — lista completa de señales de alerta en pareja","excerpt":"Una red flag no es un defecto de carácter. Es un patrón relacional repetido que, con el tiempo, hace que una relación sea agotadora, desequilibrada o tóxica."},{"lang":"de","slug":"red-flags-bei-einer-frau","title":"Red Flags bei einer Frau: Was du fühlst, hat wahrscheinlich einen Namen","meta_title":"Red Flags bei einer Frau: Die vollständige Liste","meta_description":"Irgendetwas stimmt in deiner Beziehung nicht, aber du kannst es nicht benennen? Emotionale, verhaltensbezogene, relationale Red Flags bei einer Frau, die vollständige Liste.","featured_image_alt":"Red Flags bei einer Frau — vollständige Liste der Warnsignale in einer Beziehung","excerpt":"Ein Red Flag ist kein Charakterfehler. Es ist ein wiederholtes relationales Muster, das eine Beziehung über die Zeit erschöpfend, unausgewogen oder toxisch macht."},{"lang":"it","slug":"red-flag-in-una-donna","title":"Red flag in una donna: quello che senti ha probabilmente un nome","meta_title":"Red flag in una donna: la lista completa","meta_description":"Qualcosa non va nella tua relazione ma non riesci a capire cosa. Red flag emotive, comportamentali, relazionali in una donna, la lista completa.","featured_image_alt":"Red flag in una donna — lista completa dei segnali d'allarme in coppia","excerpt":"Una red flag non è un difetto di carattere. È un pattern relazionale ripetuto che, nel tempo, rende una relazione estenuante, squilibrata o tossica."}]},{"internal_slug":"copain-ne-fait-pas-effort","featured_image_url":"","author_id":"lucie-courtin","status":"published","published_at":"2026-03-08","translations":[{"lang":"fr","slug":"copain-ne-fait-pas-effort","title":"Mon copain ne fait pas d'effort : ce que ça veut dire et quoi faire","meta_title":"Mon copain ne fait pas d'effort : que faire vraiment ?","meta_description":"Tu fais tout, lui rien. Ou presque. Pourquoi certains hommes arrêtent de faire des efforts, comment le reconnaître, quoi en penser et quoi faire concrètement.","featured_image_alt":"Mon copain ne fait pas d'effort — comprendre et agir","excerpt":"Le déséquilibre d'effort dans un couple est l'une des causes les plus fréquentes de rupture, précisément parce qu'il s'installe progressivement et qu'on a tendance à s'y adapter."},{"lang":"en","slug":"boyfriend-doesnt-make-effort","title":"My boyfriend doesn't make an effort: what it means and what to do","meta_title":"My Boyfriend Doesn't Make an Effort: What to Do","meta_description":"You do everything, he does nothing. Or close to it. Why some men stop making an effort, how to recognise it, what it means and what to do about it.","featured_image_alt":"My boyfriend doesn't make an effort — understanding and taking action","excerpt":"An imbalance of effort in a couple is one of the most common causes of breakup, precisely because it sets in gradually and we tend to adapt to it before realising how much it weighs on us."},{"lang":"es","slug":"novio-no-hace-esfuerzo","title":"Mi novio no hace ningún esfuerzo: qué significa y qué hacer","meta_title":"Mi novio no hace ningún esfuerzo: qué hacer de verdad","meta_description":"Haces todo tú, él nada. O casi. Por qué algunos hombres dejan de esforzarse, cómo reconocerlo, qué significa y qué hacer concretamente.","featured_image_alt":"Mi novio no hace ningún esfuerzo — entender y actuar","excerpt":"El desequilibrio de esfuerzo en una pareja es una de las causas más frecuentes de ruptura, precisamente porque se instala progresivamente y tendemos a adaptarnos antes de darnos cuenta de cuánto pesa."},{"lang":"de","slug":"freund-gibt-sich-keine-muehe","title":"Mein Freund gibt sich keine Mühe: Was das bedeutet und was man tun kann","meta_title":"Mein Freund gibt sich keine Mühe: Was tun?","meta_description":"Du machst alles, er nichts. Oder fast nichts. Warum manche Männer aufhören, sich zu bemühen, wie man es erkennt, was es bedeutet und was man konkret tun kann.","featured_image_alt":"Mein Freund gibt sich keine Mühe — verstehen und handeln","excerpt":"Ein Ungleichgewicht beim Einsatz in einer Beziehung ist einer der häufigsten Trennungsgründe, genau weil es sich allmählich einschleicht und wir uns oft daran gewöhnen, bevor wir merken, wie sehr es uns belastet."},{"lang":"it","slug":"ragazzo-non-si-impegna","title":"Il mio ragazzo non si impegna: cosa significa e cosa fare","meta_title":"Il mio ragazzo non si impegna: cosa fare davvero","meta_description":"Fai tutto tu, lui niente. O quasi. Perché certi uomini smettono di impegnarsi, come riconoscerlo, cosa significa e cosa fare concretamente.","featured_image_alt":"Il mio ragazzo non si impegna — capire e agire","excerpt":"Lo squilibrio di impegno in una coppia è una delle cause più frequenti di rottura, proprio perché si installa progressivamente e tendiamo ad adattarci prima di renderci conto di quanto pesi."}]},{"internal_slug":"lexique-relations-2026","featured_image_url":"","author_id":"mathieu-courtin","status":"published","published_at":"2026-03-11","translations":[{"lang":"fr","slug":"lexique-relations-2026","title":"Ghosting, crush, red flag : le vrai lexique des relations en 2026 (et ce qu'il dit de nous)","meta_title":"Ghosting, crush, red flag : le lexique des relations 2026","meta_description":"Ghosting, crush, love bombing, red flag, date… Les mots qu'on utilise vraiment pour parler d'amour en 2026, décryptés sans jargon de psy.","featured_image_alt":"Lexique des relations amoureuses en 2026 — ghosting, crush, red flag, love bombing","excerpt":"Ces mots ne décrivent pas des nouveaux comportements — ils donnent enfin des noms à des choses qui existaient depuis toujours."}]}];

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
