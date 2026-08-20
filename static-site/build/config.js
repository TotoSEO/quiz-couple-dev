/**
 * Build configuration - routes, languages, and constants
 */

export const BASE_URL = 'https://quiz-couple.com';
export const LANGUAGES = ['fr', 'en', 'es', 'de', 'it'];
export const DEFAULT_LANG = 'fr';

export const LOCALES = {
  fr: 'fr_FR',
  en: 'en_US',
  es: 'es_ES',
  de: 'de_DE',
  it: 'it_IT',
};

// Route slugs per language (mirrored from i18n/routes.ts)
export const ROUTE_SLUGS = {
  home: { fr: '', en: '', es: '', de: '', it: '' },
  testCouple: { fr: 'tester-son-couple', en: 'couple-compatibility-test', es: 'test-compatibilidad-pareja', de: 'paar-kompatibilitaetstest', it: 'test-compatibilita-coppia' },
  testCommonPoints: { fr: 'test-points-communs-couples', en: 'couple-common-points-test', es: 'test-puntos-comunes-pareja', de: 'gemeinsamkeiten-test-paare', it: 'test-punti-comuni-coppia' },
  testCompatibilite: { fr: 'test-compatibilite-amoureuse', en: 'love-compatibility-test', es: 'test-compatibilidad-amorosa', de: 'liebeskompatibilitaet-test', it: 'test-compatibilita-amorosa' },
  testDistance: { fr: 'quiz-couple-distance', en: 'long-distance-relationship-quiz', es: 'quiz-pareja-distancia', de: 'fernbeziehung-quiz', it: 'quiz-coppia-distanza' },
  testToxic: { fr: 'test-couple-toxique', en: 'toxic-relationship-test', es: 'test-relacion-toxica', de: 'toxische-beziehung-test', it: 'test-relazione-tossica' },
  testPervers: { fr: 'test-pervers-narcissique', en: 'narcissistic-partner-test', es: 'test-pareja-narcisista', de: 'narzisstischer-partner-test', it: 'test-partner-narcisista' },
  testAmourHabitude: { fr: 'test-amour-ou-habitude', en: 'love-or-habit-test', es: 'test-amor-o-costumbre', de: 'liebe-oder-gewohnheit-test', it: 'test-amore-o-abitudine' },
  testCoupleSain: { fr: 'test-couple-sain', en: 'healthy-relationship-test', es: 'test-relacion-sana', de: 'gesunde-beziehung-test', it: 'test-relazione-sana' },
  testMariage: { fr: 'test-couple-mariage', en: 'marriage-compatibility-test', es: 'test-compatibilidad-matrimonio', de: 'ehe-kompatibilitaetstest', it: 'test-compatibilita-matrimonio' },
  testDivorce: { fr: 'test-dois-je-divorcer', en: 'should-i-divorce-test', es: 'test-debo-divorciarme', de: 'scheidungstest', it: 'test-devo-divorziare' },
  testPurete: { fr: 'test-purete-couple', en: 'purity-test-couples', es: 'test-de-pureza-pareja', de: 'reinheitstest-paare', it: 'test-di-purezza-coppia' },
  quizAmoureux: { fr: 'quiz-amoureux', en: 'love-quiz', es: 'quiz-enamorados', de: 'liebes-quiz', it: 'quiz-innamorati' },
  quizCoquin: { fr: 'quiz-couple-coquin', en: 'spicy-couple-quiz', es: 'quiz-pareja-picante', de: 'pikantes-paar-quiz', it: 'quiz-coppia-piccante' },
  quizMarrant: { fr: 'quiz-couple-marrant', en: 'funny-couple-quiz', es: 'quiz-pareja-divertido', de: 'lustiges-paar-quiz', it: 'quiz-coppia-divertente' },
  quizKnowledge: { fr: 'quiz-qui-connait-mieux-partenaire', en: 'who-knows-partner-best-quiz', es: 'quiz-quien-conoce-mejor-pareja', de: 'wer-kennt-partner-besser-quiz', it: 'quiz-chi-conosce-meglio-partner' },
  quizMost: { fr: 'quiz-qui-est-le-plus', en: 'who-is-most-likely-quiz', es: 'quiz-quien-es-mas', de: 'wer-ist-am-meisten-quiz', it: 'quiz-chi-e-piu' },
  questionsCouple: { fr: 'questions-couple', en: 'couple-questions', es: 'preguntas-pareja', de: 'fragen-fuer-paare', it: 'domande-coppia' },
  legalMentions: { fr: 'mentions-legales', en: 'legal-notice', es: 'aviso-legal', de: 'impressum', it: 'note-legali' },
  privacy: { fr: 'confidentialite', en: 'privacy-policy', es: 'politica-privacidad', de: 'datenschutz', it: 'privacy' },
  blog: { fr: 'blog', en: 'blog', es: 'blog', de: 'blog', it: 'blog' },
  quizAdo: { fr: 'quiz-couple-ado', en: 'teen-couple-quiz', es: 'quiz-pareja-adolescentes', de: 'teenager-paar-quiz', it: 'quiz-coppia-adolescenti' },
  testParentalite: { fr: 'test-parentalite-couple', en: 'parenthood-readiness-test', es: 'test-parentalidad-pareja', de: 'elternschafts-bereitschaftstest', it: 'test-genitorialita-coppia' },
  testEmmenager: { fr: 'test-habiter-vivre-ensemble', en: 'moving-in-together-test', es: 'test-vivir-juntos-pareja', de: 'zusammenziehen-test-paare', it: 'test-andare-a-vivere-insieme' },
  testAstroPrenoms: { fr: 'signes-astrologiques-prenoms-compatibilite', en: 'zodiac-signs-names-compatibility', es: 'signos-astrologicos-nombres-compatibilidad', de: 'sternzeichen-vornamen-kompatibilitaet', it: 'segni-zodiacali-nomi-compatibilita' },
  testDateNaissance: { fr: 'compatibilite-amoureuse-date-de-naissance', en: 'birth-date-love-compatibility', es: 'compatibilidad-amorosa-fecha-de-nacimiento', de: 'liebeskompatibilitaet-geburtsdatum', it: 'compatibilita-amorosa-data-di-nascita' },
  testJalousie: { fr: 'test-jalousie-couple', en: 'jealousy-test-couple', es: 'test-celos-pareja', de: 'eifersucht-test-paar', it: 'test-gelosia-coppia' },
  testKarmique: { fr: 'test-relation-karmique', en: 'karmic-relationship-test', es: 'test-relacion-karmica', de: 'karmische-beziehung-test', it: 'test-relazione-karmica' },
  testSuisJeAmoureux: { fr: 'test-suis-je-amoureux', en: 'am-i-in-love-test', es: 'test-estoy-enamorado', de: 'bin-ich-verliebt-test', it: 'test-sono-innamorato' },
  jeuActionVerite: { fr: 'jeu-action-ou-verite-couple', en: 'truth-or-dare-couple-game', es: 'juego-verdad-o-reto-pareja', de: 'wahrheit-oder-pflicht-paar', it: 'gioco-obbligo-o-verita-coppia' },
  jeuActionVeriteHot: { fr: 'action-ou-verite-coquin', en: 'dirty-truth-or-dare-couples', es: 'verdad-o-reto-picante-pareja', de: 'wahrheit-oder-pflicht-versaut', it: 'obbligo-o-verita-piccante-coppia' },
  jeuxCouple: { fr: 'jeux-de-couple', en: 'couple-games', es: 'juegos-para-parejas', de: 'paarspiele', it: 'giochi-di-coppia' },
  jeuGages: { fr: 'gage-couple', en: 'couple-forfeits-wheel', es: 'prendas-para-parejas', de: 'pfaender-fuer-paare', it: 'penitenze-di-coppia' },
  jeuPlateau: { fr: 'jeu-de-plateau-couple', en: 'couple-board-game', es: 'juego-de-mesa-para-parejas', de: 'brettspiel-fuer-paare', it: 'gioco-da-tavolo-di-coppia' },
  jeuQuiDeNous: { fr: 'qui-de-nous-deux', en: 'which-one-of-us-couple-game', es: 'quien-de-los-dos-pareja', de: 'wer-von-uns-beiden-paarspiel', it: 'chi-di-noi-due-coppia' },
  quizGenant: { fr: 'quiz-couple-genant', en: 'embarrassing-couple-quiz', es: 'quiz-pareja-vergonzoso', de: 'peinliches-paar-quiz', it: 'quiz-coppia-imbarazzante' },
  testLangageAmour: { fr: 'test-langage-amour-couple', en: 'love-language-test-couple', es: 'test-lenguaje-amor-pareja', de: 'liebessprache-test-paar', it: 'test-linguaggio-amore-coppia' },
  quizTuPreferes: { fr: 'tu-preferes-couple-quiz', en: 'would-you-rather-couple-quiz', es: 'quiz-preferirias-pareja', de: 'was-wuerdest-du-lieber-paar-quiz', it: 'preferiresti-quiz-coppia' },
  quizVraiFaux: { fr: 'quiz-vrai-ou-faux', en: 'true-or-false-couple-quiz', es: 'quiz-verdadero-o-falso-pareja', de: 'richtig-oder-falsch-paar-quiz', it: 'quiz-vero-o-falso-coppia' },
  testAttachement: { fr: 'test-style-attachement-couple', en: 'attachment-style-test', es: 'test-estilo-apego', de: 'bindungsstil-test', it: 'test-stile-attaccamento' },
  testDependance: { fr: 'test-dependance-affective', en: 'emotional-dependency-test', es: 'test-dependencia-emocional', de: 'emotionale-abhaengigkeit-test', it: 'test-dipendenza-affettiva' },
  testConfiance: { fr: 'test-confiance-couple', en: 'trust-test-couple', es: 'test-confianza-pareja', de: 'vertrauenstest-paar', it: 'test-fiducia-coppia' },
  testInfidelite: { fr: 'test-infidelite-couple', en: 'infidelity-test-couple', es: 'test-infidelidad-pareja', de: 'untreue-test-paar', it: 'test-infedelta-coppia' },
  testCouche: { fr: 'savoir-s-il-elle-a-couche-avec-un-autre', en: 'has-he-she-slept-with-someone-else-test', es: 'test-se-ha-acostado-con-otra-persona', de: 'hat-er-sie-mit-jemand-anderem-geschlafen', it: 'e-andato-a-letto-con-un-altro-test' },
  testSecret: { fr: 'test-m-aime-t-il-elle-en-secret', en: 'does-he-she-secretly-love-me-test', es: 'test-me-quiere-en-secreto', de: 'liebt-er-sie-mich-heimlich-test', it: 'mi-ama-in-segreto-test' },
  testDistanceAime: { fr: 'relation-a-distance-m-aime-t-il-encore', en: 'long-distance-does-he-she-still-love-me-test', es: 'relacion-a-distancia-me-sigue-queriendo', de: 'fernbeziehung-liebt-er-sie-mich-noch', it: 'relazione-a-distanza-mi-ama-ancora' },
  zamours: { fr: 'quiz-couple-les-zamours' },
  testVacances: { fr: 'test-ou-partir-en-vacances' },
  jeuDilemmes: { fr: 'dilemmes-couple', en: 'couple-dilemmas-game', es: 'dilemas-de-pareja', de: 'dilemmata-fuer-paare', it: 'dilemmi-di-coppia' },
  testAmourAmitie: { fr: 'test-amour-ou-amitie', en: 'love-or-friendship-test', es: 'test-amor-o-amistad', de: 'liebe-oder-freundschaft-test', it: 'test-amore-o-amicizia' },
  testFinCouple: { fr: 'test-est-ce-la-fin-de-mon-couple', en: 'is-my-relationship-over-test', es: 'test-es-el-final-de-mi-relacion', de: 'ist-meine-beziehung-am-ende-test', it: 'test-e-la-fine-della-mia-relazione' },
  pourContre: { fr: 'quiz-pour-contre-couple', en: 'for-or-against-couple-game', es: 'juego-a-favor-o-en-contra-pareja', de: 'dafuer-oder-dagegen-paarspiel', it: 'gioco-pro-o-contro-coppia' },
  quizTentation: { fr: 'quiz-ile-de-la-tentation', en: 'temptation-island-quiz', es: 'quiz-la-isla-de-las-tentaciones', de: 'temptation-island-quiz', it: 'quiz-temptation-island' },
  admin: { fr: 'admin', en: 'admin', es: 'admin', de: 'admin', it: 'admin' },
  activities: { fr: 'activites-autours-de-moi', en: 'couple-activities-near-me', es: 'actividades-en-pareja-cerca', de: 'paar-aktivitaeten-in-der-naehe', it: 'attivita-di-coppia-vicino' },
  contact: { fr: 'contact', en: 'contact', es: 'contacto', de: 'kontakt', it: 'contatto' },
  about: { fr: 'qui-sommes-nous', en: 'about-us', es: 'quienes-somos', de: 'ueber-uns', it: 'chi-siamo' },
  customQuiz: { fr: 'creation-quiz-personnalise', en: 'create-your-own-quiz', es: 'crear-tu-propio-quiz', de: 'eigenes-quiz-erstellen', it: 'crea-il-tuo-quiz' },
  sitemap: { fr: 'plan-du-site', en: 'sitemap', es: 'mapa-del-sitio', de: 'seitenverzeichnis', it: 'mappa-del-sito' },
  ebookConfirm: { fr: 'confirmation-ebook' },
};

// Featured images per quiz/test page.
//   file  → new symbolic photo in public/quiz/featured/<file>.webp (hero + OG + home card)
//   old   → legacy image in public/quiz/<old>.webp, reused inside the SEO content (or null)
//   alt   → translated alt text for the featured image, per language
export const QUIZ_FEATURED = {
  testCouple:        { file: 'love-padlock',              old: 'test-couple',         alt: { fr: "Cadenas d'amour doré accroché à un pont au coucher du soleil", en: 'Golden heart love padlock on a bridge at sunset', es: 'Candado del amor dorado en un puente al atardecer', de: 'Goldenes Liebesschloss an einer Brücke bei Sonnenuntergang', it: "Lucchetto dell'amore dorato su un ponte al tramonto" } },
  testCommonPoints:  { file: 'matching-puzzle',           old: 'test-common-points',  alt: { fr: "Deux pièces de puzzle rose et violet qui s'emboîtent parfaitement", en: 'Two matching puzzle pieces fitting perfectly together', es: 'Dos piezas de puzle que encajan perfectamente', de: 'Zwei perfekt zusammenpassende Puzzleteile', it: 'Due tessere di puzzle che si incastrano perfettamente' } },
  testCompatibilite: { file: 'love-letter-heart',          old: null,                  alt: { fr: "Lettre d'amour et cœur rouge évoquant la compatibilité amoureuse d'un couple", en: 'Love letter and red heart evoking a couple\'s love compatibility', es: 'Carta de amor y corazón rojo que evoca la compatibilidad amorosa', de: 'Liebesbrief und rotes Herz als Sinnbild der Liebeskompatibilität', it: "Lettera d'amore e cuore rosso che evoca la compatibilità amorosa" } },
  testDistance:      { file: 'long-distance-map',         old: 'test-distance',       alt: { fr: 'Carte du monde avec deux épingles reliées par un fil rouge', en: 'World map with two pins linked by a red thread', es: 'Mapa del mundo con dos alfileres unidos por un hilo rojo', de: 'Weltkarte mit zwei durch einen roten Faden verbundenen Nadeln', it: 'Mappa del mondo con due spilli uniti da un filo rosso' } },
  testToxic:         { file: 'wilted-rose',               old: 'test-toxic',          alt: { fr: 'Rose rouge fanée posée sur une surface grise et froide', en: 'Wilted red rose lying on a cold grey surface', es: 'Rosa roja marchita sobre una superficie gris y fría', de: 'Verwelkte rote Rose auf kalter grauer Oberfläche', it: 'Rosa rossa appassita su una fredda superficie grigia' } },
  testPervers:       { file: 'masquerade-mask',           old: null,                  alt: { fr: 'Masque de théâtre blanc à deux visages sur fond sombre, symbole de la double personnalité', en: 'White two-faced theatre mask on a dark background, symbol of a double personality', es: 'Máscara de teatro blanca de dos caras sobre fondo oscuro, símbolo de la doble personalidad', de: 'Weiße zweigesichtige Theatermaske auf dunklem Hintergrund, Symbol der Doppelpersönlichkeit', it: 'Maschera teatrale bianca a due volti su sfondo scuro, simbolo della doppia personalità' } },
  testAmourHabitude: { file: 'two-mugs-heart',            old: null,                  alt: { fr: 'Deux tasses de café côte à côte avec une vapeur en forme de cœur, symbole de la routine du couple', en: 'Two coffee mugs side by side with heart-shaped steam, a symbol of a couple\'s routine', es: 'Dos tazas de café juntas con vapor en forma de corazón, símbolo de la rutina de la pareja', de: 'Zwei Kaffeetassen nebeneinander mit herzförmigem Dampf, Symbol der Paar-Routine', it: 'Due tazze di caffè affiancate con vapore a forma di cuore, simbolo della routine di coppia' } },
  testCoupleSain:    { file: 'healthy-plant-heart',       old: 'test-couple-sain',    alt: { fr: 'Plante verte luxuriante en forme de cœur près d\'une fenêtre', en: 'Lush green heart-shaped plant by a sunny window', es: 'Planta verde con forma de corazón junto a una ventana', de: 'Üppige herzförmige grüne Pflanze am sonnigen Fenster', it: 'Rigogliosa pianta verde a forma di cuore vicino a una finestra' } },
  testMariage:       { file: 'wedding-chapel-rings',      old: 'test-mariage',        alt: { fr: "Deux alliances dorées devant l'autel d'une chapelle de mariage", en: 'Two golden wedding rings before a wedding chapel altar', es: 'Dos anillos de boda dorados ante el altar de una capilla', de: 'Zwei goldene Eheringe vor dem Altar einer Hochzeitskapelle', it: "Due fedi nuziali dorate davanti all'altare di una cappella" } },
  testDivorce:       { file: 'divorce-rings-papers',      old: 'test-divorce',        alt: { fr: 'Deux alliances séparées sur un document déchiré', en: 'Two wedding rings apart on a torn document', es: 'Dos anillos de boda separados sobre un documento roto', de: 'Zwei getrennte Eheringe auf einem zerrissenen Dokument', it: 'Due fedi separate su un documento strappato' } },
  quizAmoureux:      { file: 'love-letter-heart',         old: 'quiz-amoureux',       alt: { fr: "Lettre d'amour manuscrite avec un stylo plume et un cœur rouge", en: 'Handwritten love letter with a fountain pen and red heart', es: 'Carta de amor manuscrita con pluma y corazón rojo', de: 'Handgeschriebener Liebesbrief mit Füller und rotem Herz', it: "Lettera d'amore scritta a mano con penna e cuore rosso" } },
  quizCoquin:        { file: 'naughty-date-night',        old: 'quiz-coquin',         alt: { fr: 'Ambiance romantique : deux coupes de champagne, pétales et bougie sur un lit', en: 'Romantic setting: two champagne glasses, petals and a candle on a bed', es: 'Ambiente romántico: dos copas de champán, pétalos y una vela', de: 'Romantische Szene: zwei Sektgläser, Rosenblätter und eine Kerze', it: 'Atmosfera romantica: due calici di champagne, petali e una candela' } },
  quizMarrant:       { file: 'fun-confetti',              old: 'quiz-marrant',        alt: { fr: 'Confettis colorés et ballons de fête qui explosent', en: 'Colorful confetti and party balloons bursting', es: 'Confeti colorido y globos de fiesta estallando', de: 'Buntes Konfetti und platzende Partyballons', it: 'Coriandoli colorati e palloncini di festa che esplodono' } },
  quizKnowledge:     { file: 'knowledge-lightbulb-heart', old: 'quiz-knowledge',      alt: { fr: 'Ampoule vintage dont le filament forme un petit cœur rouge', en: 'Vintage lightbulb with a filament shaped like a red heart', es: 'Bombilla vintage con filamento en forma de corazón rojo', de: 'Vintage-Glühbirne mit herzförmigem roten Glühfaden', it: 'Lampadina vintage con filamento a forma di cuore rosso' } },
  quizMost:          { file: 'most-likely-trophy',        old: 'quiz-most',           alt: { fr: 'Trophée doré orné d\'un cœur rouge sous une pluie de confettis', en: 'Golden trophy with a red heart under falling confetti', es: 'Trofeo dorado con un corazón rojo bajo confeti', de: 'Goldener Pokal mit rotem Herz unter fallendem Konfetti', it: 'Trofeo dorato con un cuore rosso sotto i coriandoli' } },
  questionsCouple:   { file: 'conversation-cards',        old: null,                  alt: { fr: 'Cartes de questions en éventail près de deux tasses de café', en: 'Question cards fanned out beside two cups of coffee', es: 'Tarjetas de preguntas en abanico junto a dos cafés', de: 'Aufgefächerte Fragekarten neben zwei Tassen Kaffee', it: 'Carte con domande a ventaglio accanto a due tazze di caffè' } },
  quizAdo:           { file: 'teen-polaroids',            old: 'quiz-ado',            alt: { fr: "Bracelets d'amitié et photos polaroïd sur un bureau", en: 'Friendship bracelets and polaroid photos on a desk', es: 'Pulseras de la amistad y fotos polaroid sobre un escritorio', de: 'Freundschaftsbänder und Polaroidfotos auf einem Schreibtisch', it: "Braccialetti dell'amicizia e foto polaroid su una scrivania" } },
  testParentalite:   { file: 'baby-shoes-toys',          old: 'test-parentalite',    alt: { fr: 'Petits chaussons de bébé et jouets en bois sur une couverture', en: 'Tiny baby shoes and wooden toys on a blanket', es: 'Pequeños zapatos de bebé y juguetes de madera sobre una manta', de: 'Winzige Babyschuhe und Holzspielzeug auf einer Decke', it: 'Scarpine da neonato e giochi di legno su una coperta' } },
  testEmmenager:     { file: 'moving-in-boxes',          old: null,                  alt: { fr: 'Cartons de déménagement dans un appartement lumineux et vide', en: 'Moving boxes in a bright empty apartment', es: 'Cajas de mudanza en un apartamento luminoso y vacío', de: 'Umzugskartons in einer hellen leeren Wohnung', it: 'Scatole per il trasloco in un appartamento luminoso e vuoto' } },
  testAstroPrenoms:  { file: 'zodiac-astrology',          old: 'test-astro-prenoms',  alt: { fr: 'Carte astrologique avec les constellations dorées du zodiaque', en: 'Astrology chart with golden zodiac constellations', es: 'Carta astrológica con constelaciones doradas del zodiaco', de: 'Astrologie-Karte mit goldenen Sternzeichen-Konstellationen', it: 'Carta astrologica con costellazioni dorate dello zodiaco' } },
  testDateNaissance: { file: 'birth-date-compatibility', old: null,                  alt: { fr: 'Deux calendriers ouverts côte à côte, une date entourée sur chacun, reliées par un fil rouge', en: 'Two open calendars side by side, a circled date on each, linked by a red thread', es: 'Dos calendarios abiertos uno al lado del otro, una fecha rodeada en cada uno, unidos por un hilo rojo', de: 'Zwei aufgeschlagene Kalender nebeneinander, je ein eingekreistes Datum, verbunden durch einen roten Faden', it: 'Due calendari aperti affiancati, una data cerchiata su ciascuno, uniti da un filo rosso' } },
  testJalousie:      { file: 'jealousy-phone',           old: 'test-jalousie',       alt: { fr: 'Smartphone retourné sur une table projetant une longue ombre', en: 'Smartphone face down on a table casting a long shadow', es: 'Smartphone boca abajo sobre una mesa con una larga sombra', de: 'Umgedrehtes Smartphone auf einem Tisch mit langem Schatten', it: 'Smartphone capovolto su un tavolo con una lunga ombra' } },
  jeuActionVerite:   { file: 'conversation-cards',        old: null,                  alt: { fr: 'Cartes de jeu en éventail pour une partie d\'action ou vérité en couple', en: 'Fanned-out game cards for a couple truth or dare game', es: 'Cartas de juego en abanico para una partida de verdad o reto en pareja', de: 'Aufgefächerte Spielkarten für Wahrheit oder Pflicht zu zweit', it: 'Carte da gioco a ventaglio per una partita di obbligo o verità in coppia' } },
  jeuActionVeriteHot:{ file: 'naughty-date-night',        old: null,                  alt: { fr: 'Ambiance tamisée avec bougie et pétales pour une soirée coquine à deux', en: 'Dimmed setting with candle and petals for a spicy night for two', es: 'Ambiente tenue con vela y pétalos para una noche picante en pareja', de: 'Gedämpfte Stimmung mit Kerze und Blütenblättern für einen pikanten Abend zu zweit', it: 'Atmosfera soffusa con candela e petali per una serata piccante in due' } },
  testSuisJeAmoureux:{ file: 'love-padlock',              old: null,                  alt: { fr: "Cadenas en forme de cœur, symbole des sentiments amoureux naissants", en: 'Heart-shaped padlock, a symbol of budding romantic feelings', es: 'Candado con forma de corazón, símbolo de los sentimientos que nacen', de: 'Herzförmiges Schloss als Sinnbild aufkeimender Gefühle', it: 'Lucchetto a forma di cuore, simbolo dei sentimenti che nascono' } },
  testKarmique:      { file: 'zodiac-astrology',          old: null,                  alt: { fr: 'Carte céleste dorée évoquant le lien karmique entre deux personnes', en: 'Golden celestial chart evoking the karmic bond between two people', es: 'Carta celeste dorada que evoca el vínculo kármico entre dos personas', de: 'Goldene Himmelskarte als Sinnbild der karmischen Verbindung zweier Menschen', it: 'Carta celeste dorata che evoca il legame karmico tra due persone' } },
  quizGenant:        { file: 'awkward-blush-note',        old: 'quiz-genant',         alt: { fr: 'Note rose avec un émoji gêné et une tasse renversée', en: 'Pink note with an embarrassed emoji and a spilled cup', es: 'Nota rosa con un emoji avergonzado y una taza derramada', de: 'Rosa Notiz mit verlegenem Emoji und verschütteter Tasse', it: 'Biglietto rosa con emoji imbarazzata e tazza rovesciata' } },
  testLangageAmour:  { file: 'love-languages-gift',       old: 'test-langage-amour',  alt: { fr: "Petit cadeau, mot d'amour et cœur rouge sur une table", en: 'A small gift, love note and red heart on a table', es: 'Un pequeño regalo, nota de amor y corazón rojo', de: 'Kleines Geschenk, Liebesnotiz und rotes Herz auf einem Tisch', it: "Un piccolo regalo, biglietto d'amore e cuore rosso" } },
  quizTuPreferes:    { file: 'would-you-rather-doors',    old: 'quiz-tu-preferes',    alt: { fr: 'Deux portes, une rose et une bleue, symbolisant un choix', en: 'Two doors, one pink and one blue, symbolizing a choice', es: 'Dos puertas, una rosa y una azul, que simbolizan una elección', de: 'Zwei Türen, eine rosa und eine blaue, als Symbol einer Wahl', it: 'Due porte, una rosa e una blu, simbolo di una scelta' } },
  testPurete:        { file: 'purity-thermometer',        old: null,                  alt: { fr: 'Thermomètre stylisé rose et violet entouré de cœurs, illustrant le test de pureté du couple', en: 'Stylised pink and purple thermometer surrounded by hearts, illustrating the couple purity test', es: 'Termómetro estilizado rosa y violeta rodeado de corazones, que ilustra el test de pureza en pareja', de: 'Stilisiertes rosa-violettes Thermometer, umgeben von Herzen, als Sinnbild des Reinheitstests für Paare', it: 'Termometro stilizzato rosa e viola circondato da cuori, che illustra il test di purezza di coppia' } },
  quizVraiFaux:      { file: 'true-false-cards',          old: 'quiz-vrai-faux',      alt: { fr: 'Deux cartes en bois : une coche verte et une croix rouge', en: 'Two wooden cards: a green check and a red cross', es: 'Dos tarjetas de madera: una marca verde y una cruz roja', de: 'Zwei Holzkarten: ein grünes Häkchen und ein rotes Kreuz', it: 'Due carte di legno: un segno verde e una croce rossa' } },
  testAttachement:   { file: 'attachment-knot',           old: 'test-attachement',    alt: { fr: 'Deux rubans de soie rose et rouge noués ensemble', en: 'Two silk ribbons, pink and red, tied together in a knot', es: 'Dos cintas de seda, rosa y roja, atadas en un nudo', de: 'Zwei Seidenbänder, rosa und rot, zu einem Knoten gebunden', it: 'Due nastri di seta, rosa e rosso, annodati insieme' } },
  testDependance:    { file: 'anchor-heart',            alt: { fr: "Petite ancre de bateau attachée à un ballon rouge en forme de cœur qui s'élève", en: 'Small boat anchor tied to a rising red heart-shaped balloon', es: 'Pequeña ancla de barco atada a un globo rojo en forma de corazón que se eleva', de: 'Kleiner Bootsanker an einem aufsteigenden roten Herzballon', it: 'Piccola ancora legata a un palloncino rosso a forma di cuore che sale' } },
  testConfiance:     { file: 'trust-bridge',             old: 'test-confiance',      alt: { fr: 'Pont de bois traversant une eau calme au lever du soleil', en: 'Wooden footbridge crossing calm water at sunrise', es: 'Puente de madera sobre aguas tranquilas al amanecer', de: 'Holzsteg über ruhigem Wasser bei Sonnenaufgang', it: "Ponte di legno su acque calme all'alba" } },
  testInfidelite:    { file: 'infidelity-hidden-phone',   old: null,                  alt: { fr: 'Alliance retirée à côté d\'un téléphone au message caché', en: 'A wedding ring removed beside a phone with a hidden message', es: 'Un anillo de boda junto a un teléfono con un mensaje oculto', de: 'Ein abgelegter Ehering neben einem Handy mit versteckter Nachricht', it: 'Una fede tolta accanto a un telefono con un messaggio nascosto' } },
  testCouche:        { file: 'unmade-bed-earring',       old: null,                  alt: { fr: "Un lit défait avec deux oreillers et une boucle d'oreille inconnue posée sur le drap", en: 'An unmade bed with two pillows and an unfamiliar earring left on the sheet', es: 'Una cama deshecha con dos almohadas y un pendiente desconocido sobre la sábana', de: 'Ein zerwühltes Bett mit zwei Kissen und einem fremden Ohrring auf dem Laken', it: "Un letto sfatto con due cuscini e un orecchino sconosciuto sul lenzuolo" } },
  testSecret:        { file: 'heart-on-window',            old: null,                  alt: { fr: "Un cœur dessiné du bout du doigt sur une vitre embuée, devant une lumière douce", en: 'A heart drawn with a fingertip on a misted window, in front of soft light', es: 'Un corazón dibujado con el dedo en un cristal empañado, ante una luz suave', de: 'Ein mit dem Finger auf eine beschlagene Scheibe gemaltes Herz vor sanftem Licht', it: "Un cuore disegnato con un dito su un vetro appannato, davanti a una luce soffusa" } },
  testDistanceAime:  { file: 'night-call-glow',            old: null,                  alt: { fr: "Un téléphone posé sur un lit la nuit, l'écran allumé qui éclaire un halo en forme de cœur", en: 'A phone lying on a bed at night, its lit screen casting a heart-shaped glow', es: 'Un móvil sobre una cama de noche, con la pantalla encendida proyectando un halo con forma de corazón', de: 'Ein Handy nachts auf einem Bett, dessen leuchtender Bildschirm einen herzförmigen Schein wirft', it: "Un telefono su un letto di notte, lo schermo acceso che proietta un alone a forma di cuore" } },
  zamours:           { file: 'conversation-cards',         old: null,                  alt: { fr: 'Cartes de questions en éventail pour jouer aux Z\'Amours en couple', en: 'Fanned-out question cards for playing the Newlywed Game as a couple', es: 'Tarjetas de preguntas en abanico para jugar en pareja', de: 'Aufgefächerte Fragekarten für das Paar-Quizspiel', it: 'Carte con domande a ventaglio per giocare in coppia' } },
  testVacances:      { file: 'carte-vacances-couple',      old: null,                  alt: { fr: 'Carte du monde stylisée rose et violette avec des épingles en forme de cœur, illustrant le test où partir en vacances en couple' } },
  jeuPlateau:        { file: 'matching-puzzle',            old: null,                  alt: { fr: 'Deux pièces de puzzle emboîtées, comme deux pions sur un plateau', en: 'Two interlocking puzzle pieces, like two pawns on a board', es: 'Dos piezas de puzle encajadas, como dos fichas en un tablero', de: 'Zwei ineinandergreifende Puzzleteile, wie zwei Figuren auf einem Brett', it: 'Due tessere di puzzle incastrate, come due pedine su un tabellone' } },
  jeuQuiDeNous:      { file: 'two-mugs-heart',              old: null,                  alt: { fr: 'Deux tasses face à face formant un cœur, comme deux points de vue qui se rejoignent', en: 'Two mugs facing each other forming a heart, like two points of view meeting', es: 'Dos tazas enfrentadas que forman un corazón, como dos puntos de vista que se encuentran', de: 'Zwei Tassen, die einander gegenüberstehen und ein Herz bilden, wie zwei Sichtweisen, die sich treffen', it: 'Due tazze una di fronte all\'altra che formano un cuore, come due punti di vista che si incontrano' } },
  jeuGages:          { file: 'most-likely-trophy',        old: null,                  alt: { fr: 'Trophée doré et confettis pour une soirée de gages en couple', en: 'Golden trophy and confetti for a couple forfeit night', es: 'Trofeo dorado y confeti para una noche de prendas en pareja', de: 'Goldener Pokal und Konfetti für einen Abend mit Strafen zu zweit', it: 'Trofeo dorato e coriandoli per una serata di penitenze in coppia' } },
  jeuDilemmes:       { file: 'dilemma-scales-choice',    old: null,                  alt: { fr: 'Une balance en équilibre : un cadeau rose d\'un côté, un poids violet de l\'autre', en: 'A balanced scale: a pink gift on one side, a purple weight on the other', es: 'Una balanza en equilibrio: un regalo rosa a un lado, una pesa morada al otro', de: 'Eine Waage im Gleichgewicht: ein rosa Geschenk auf der einen Seite, ein violettes Gewicht auf der anderen', it: 'Una bilancia in equilibrio: un regalo rosa da un lato, un peso viola dall\'altro' } },
  jeuxCouple:        { file: 'fun-confetti',            old: null,                  alt: { fr: 'Confettis et ballons colorés pour une soirée jeux à deux', en: 'Confetti and colourful balloons for a games night for two', es: 'Confeti y globos de colores para una noche de juegos en pareja', de: 'Konfetti und bunte Luftballons für einen Spieleabend zu zweit', it: 'Coriandoli e palloncini colorati per una serata di giochi in due' } },
  testAmourAmitie:   { file: 'panneau-amour-amitie',      old: null,                  alt: { fr: 'Un panneau de bois à deux flèches opposées : AMOUR en rose d\'un côté, AMITIÉ en violet de l\'autre', en: 'A wooden signpost with two opposite arrows: AMOUR in pink one way, AMITIÉ in purple the other', es: 'Un poste de madera con dos flechas opuestas: AMOUR en rosa hacia un lado, AMITIÉ en violeta hacia el otro', de: 'Ein Holzwegweiser mit zwei entgegengesetzten Pfeilen: AMOUR in Rosa, AMITIÉ in Violett', it: 'Un cartello di legno con due frecce opposte: AMOUR in rosa da una parte, AMITIÉ in viola dall\'altra' } },
  testFinCouple:     { file: 'corde-effilochee',           old: null,                  alt: { fr: 'Une corde tendue, effilochée en son centre, dont il ne reste que quelques fils', en: 'A taut rope, frayed at its centre, with only a few threads still holding', es: 'Una cuerda tensa, deshilachada en el centro, de la que solo quedan unos hilos', de: 'Ein gespanntes Seil, in der Mitte ausgefranst, nur noch wenige Fäden halten', it: 'Una corda tesa, sfilacciata al centro, di cui restano solo pochi fili' } },
  pourContre:        { file: 'pour-contre-pouces',       old: null,                  alt: { fr: 'Un pouce levé rose et un pouce baissé violet séparés par un cœur, pour le jeu pour ou contre en couple', en: 'A pink thumbs-up and a purple thumbs-down separated by a heart, for the for or against couple game', es: 'Un pulgar hacia arriba rosa y uno hacia abajo morado separados por un corazón, para el juego a favor o en contra en pareja', de: 'Ein rosa Daumen hoch und ein violetter Daumen runter, getrennt durch ein Herz, für das Paarspiel dafür oder dagegen', it: 'Un pollice in su rosa e un pollice in giù viola separati da un cuore, per il gioco pro o contro in coppia' } },
  quizTentation:     { file: 'island-bonfire',            old: null,                  alt: { fr: 'Feu de camp sur une plage tropicale la nuit, avec palmiers et pleine lune', en: 'Bonfire on a tropical beach at night, with palm trees and a full moon', es: 'Hoguera en una playa tropical de noche, con palmeras y luna llena', de: 'Lagerfeuer an einem tropischen Strand bei Nacht, mit Palmen und Vollmond', it: 'Falò su una spiaggia tropicale di notte, con palme e luna piena' } },
};

// Map route keys to their page template and translation namespaces
// Applications passées en revue sur le blog. Sert au balisage Review, qui
// rend ces pages éligibles aux étoiles en résultat de recherche. La clé est le
// slug interne de l'article ; la note, elle, est lue dans le contenu.
export const APPLICATIONS_EVALUEES = {
  'avis-tinder': { nom: 'Tinder' },
  'avis-bumble': { nom: 'Bumble' },
  'avis-badoo': { nom: 'Badoo' },
  'avis-hinge': { nom: 'Hinge' },
  'avis-gleese': { nom: 'Gleese', plateformes: 'Web, iOS, Android' },
};

export const ROUTE_CONFIG = {
  home: { template: 'home', namespaces: ['home', 'common', 'quizzes'] },
  testCouple: { template: 'quiz-tester-couple', namespaces: ['quiz-tester-couple', 'quizzes', 'quizGames', 'gd', 'common'] },
  testCommonPoints: { template: 'quiz-common-points', namespaces: ['quiz-common-points', 'quizzes', 'quizGames', 'gd', 'common'] },
  testCompatibilite: { template: 'quiz-compatibilite', namespaces: ['quiz-compatibilite', 'quizzes', 'quizGames', 'gd', 'common'] },
  testDistance: { template: 'quiz-distance', namespaces: ['quiz-distance', 'quizzes', 'quizGames', 'gd', 'common'] },
  testToxic: { template: 'quiz-toxic', namespaces: ['quiz-toxic', 'quizzes', 'quizGames', 'gd', 'common'] },
  testPervers: { template: 'quiz-pervers-narcissique', namespaces: ['quiz-pervers-narcissique', 'quizzes', 'quizGames', 'gd', 'common'] },
  testAmourHabitude: { template: 'quiz-amour-habitude', namespaces: ['quiz-amour-habitude', 'quizzes', 'quizGames', 'gd', 'common'] },
  testCoupleSain: { template: 'quiz-couple-sain', namespaces: ['quiz-couple-sain', 'quizzes', 'quizGames', 'gd', 'common'] },
  testMariage: { template: 'quiz-mariage', namespaces: ['quiz-mariage', 'quizzes', 'quizGames', 'gd', 'common'] },
  testDivorce: { template: 'quiz-divorce', namespaces: ['quiz-divorce', 'quizzes', 'quizGames', 'gd', 'common'] },
  quizAmoureux: { template: 'quiz-amoureux', namespaces: ['quiz-amoureux', 'quizzes', 'quizGames', 'gd', 'common'] },
  quizCoquin: { template: 'quiz-coquin', namespaces: ['quiz-coquin', 'quizzes', 'quizGames', 'gd', 'common'] },
  quizMarrant: { template: 'quiz-marrant', namespaces: ['quiz-marrant', 'quizzes', 'quizGames', 'gd', 'common'] },
  quizKnowledge: { template: 'quiz-knowledge', namespaces: ['quiz-knowledge', 'quizzes', 'quizGames', 'gd', 'common'] },
  quizMost: { template: 'quiz-most', namespaces: ['quiz-most', 'quizzes', 'quizGames', 'gd', 'common'] },
  questionsCouple: { template: 'questions-couple', namespaces: ['quiz-questions-couple', 'quizzes', 'common'] },
  legalMentions: { template: 'legal', namespaces: ['legal', 'common'] },
  privacy: { template: 'privacy', namespaces: ['legal', 'common'] },
  blog: { template: 'blog-listing', namespaces: ['common'] },
  quizAdo: { template: 'quiz-ado', namespaces: ['quiz-ado', 'quizzes', 'quizGames', 'gd', 'common'] },
  testParentalite: { template: 'quiz-parentalite', namespaces: ['quiz-parentalite', 'quizzes', 'quizGames', 'gd', 'common'] },
  testEmmenager: { template: 'quiz-emmenager', namespaces: ['quiz-emmenager', 'quizzes', 'quizGames', 'gd', 'common'] },
  testAstroPrenoms: { template: 'quiz-astro-prenoms', namespaces: ['quiz-astro-prenoms', 'quizzes', 'common'] },
  testDateNaissance: { template: 'quiz-date-naissance', namespaces: ['quiz-date-naissance', 'quizzes', 'common'] },
  testJalousie: { template: 'quiz-jalousie', namespaces: ['quiz-jalousie', 'quizzes', 'quizGames', 'gd', 'common'] },
  testKarmique: { template: 'quiz-karmique', namespaces: ['quiz-karmique', 'quizzes', 'quizGames', 'gd', 'common'] },
  testSuisJeAmoureux: { template: 'quiz-suis-je-amoureux', namespaces: ['quiz-suis-je-amoureux', 'quizzes', 'quizGames', 'gd', 'common'] },
  jeuxCouple: { template: 'jeux-couple', namespaces: ['jeux-couple', 'quizzes', 'common'] },
  jeuGages: { template: 'jeu-gages', namespaces: ['jeu-gages', 'quizzes', 'quizGames', 'gd', 'common'] },
  jeuPlateau: { template: 'jeu-plateau', namespaces: ['jeu-plateau', 'quizzes', 'quizGames', 'gd', 'common'] },
  jeuQuiDeNous: { template: 'jeu-qui-de-nous', namespaces: ['jeu-qui-de-nous', 'quizzes', 'quizGames', 'gd', 'common'] },
  jeuActionVerite: { template: 'jeu-action-verite', namespaces: ['jeu-action-verite', 'quizzes', 'quizGames', 'gd', 'common'] },
  jeuActionVeriteHot: { template: 'jeu-action-verite-hot', namespaces: ['jeu-action-verite-hot', 'quizzes', 'quizGames', 'gd', 'common'] },
  quizGenant: { template: 'quiz-genant', namespaces: ['quiz-genant', 'quizzes', 'quizGames', 'gd', 'common'] },
  testLangageAmour: { template: 'quiz-langage-amour', namespaces: ['quiz-langage-amour', 'quizzes', 'quizGames', 'gd', 'common'] },
  quizTuPreferes: { template: 'quiz-tu-preferes', namespaces: ['quiz-tu-preferes', 'quizzes', 'quizGames', 'gd', 'common'] },
  quizVraiFaux: { template: 'quiz-vrai-faux', namespaces: ['quiz-vrai-faux', 'quizzes', 'quizGames', 'gd', 'common'] },
  testAttachement: { template: 'quiz-attachement', namespaces: ['quiz-attachement', 'quizzes', 'quizGames', 'gd', 'common'] },
  testDependance: { template: 'quiz-dependance', namespaces: ['quiz-dependance', 'quizzes', 'quizGames', 'gd', 'common'] },
  testConfiance: { template: 'quiz-confiance', namespaces: ['quiz-confiance', 'quizzes', 'quizGames', 'gd', 'common'] },
  testInfidelite: { template: 'quiz-infidelite', namespaces: ['quiz-infidelite', 'quizzes', 'quizGames', 'gd', 'common'] },
  testCouche: { template: 'quiz-couche', namespaces: ['quiz-couche', 'quizzes', 'quizGames', 'gd', 'common'] },
  testSecret: { template: 'quiz-secret', namespaces: ['quiz-secret', 'quizzes', 'quizGames', 'gd', 'common'] },
  testDistanceAime: { template: 'quiz-distance-aime', namespaces: ['quiz-distance-aime', 'quizzes', 'quizGames', 'gd', 'common'] },
  zamours: { template: 'quiz-zamours', namespaces: ['quiz-zamours', 'quizzes', 'quizGames', 'gd', 'common'], frOnly: true },
  testVacances: { template: 'quiz-vacances', namespaces: ['quizzes', 'common'], frOnly: true },
  jeuDilemmes: { template: 'jeu-dilemmes', namespaces: ['jeu-dilemmes', 'quizzes', 'quizGames', 'gd', 'common'] },
  testAmourAmitie: { template: 'quiz-amour-amitie', namespaces: ['quiz-amour-amitie', 'quizzes', 'quizGames', 'gd', 'common'] },
  testFinCouple: { template: 'quiz-fin-couple', namespaces: ['quiz-fin-couple', 'quizzes', 'quizGames', 'gd', 'common'] },
  pourContre: { template: 'jeu-pour-contre', namespaces: ['jeu-pour-contre', 'quizzes', 'quizGames', 'gd', 'common'] },
  quizTentation: { template: 'quiz-tentation', namespaces: ['quiz-tentation', 'quizzes', 'quizGames', 'gd', 'common'] },
  testPurete: { template: 'test-purete', namespaces: ['test-purete', 'quizzes', 'common'] },
  admin: { template: 'admin', namespaces: ['common'] },
  activities: { template: 'activities', namespaces: ['activities', 'common'] },
  contact: { template: 'contact', namespaces: ['contact', 'common'] },
  about: { template: 'about', namespaces: ['common'] },
  customQuiz: { template: 'custom-quiz', namespaces: ['custom-quiz', 'common'] },
  sitemap: { template: 'sitemap', namespaces: ['common'] },
  ebookConfirm: { template: 'ebook-confirm', namespaces: ['common'], frOnly: true },
};

// Supabase config — piloté par les secrets GitHub (SUPABASE_URL / SUPABASE_ANON_KEY)
// injectés au build par les workflows. La valeur en dur ne sert que de repli local.
// Ces valeurs (URL + clé anon) sont publiques par nature (embarquées côté client).
export const SUPABASE_URL = process.env.SUPABASE_URL || 'https://lojvajnnvhatfplevyvy.supabase.co';
export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvanZham5udmhhdGZwbGV2eXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNzk3NDIsImV4cCI6MjA4Nzg1NTc0Mn0.gdd9HRbRvfQr6io9jGN6hUCW6tBOtognhwbsTJtSTng';

// Google Analytics
export const GA_ID = 'G-XZV8V6FEK5';
// Identifiant AdSense. Posé ici parce qu'il sert à trois endroits : la balise
// meta de validation, le script de diffusion, et le fichier ads.txt à la
// racine, qui lui est écrit à la main dans public/ (Google le lit tel quel).
export const ADSENSE_CLIENT = 'ca-pub-3699606544344200';

// Pages jouables. Elles portent le bloc d'avis, le compteur de parties et,
// des qu'elles ont de vrais avis, la note structuree. Les tests et les quiz
// se reconnaissent a leur cle ; les jeux, non, il faut donc les nommer.
// Sans cette liste, les six jeux ne remontaient aucune partie a l'admin.
const ROUTES_JEUX = [
  'jeuActionVerite', 'jeuActionVeriteHot', 'jeuGages',
  'jeuPlateau', 'jeuQuiDeNous', 'jeuDilemmes', 'pourContre',
];

export function estPageJouable(routeKey) {
  if (!routeKey || routeKey === 'home') return false;
  return /^(test|quiz)/.test(routeKey) || routeKey === 'zamours' || ROUTES_JEUX.includes(routeKey);
}

// « Ce jeu a deja ete joue » / « ce quiz a deja ete joue » / « ce test a deja
// ete realise » : le mot depend du genre de page, pas du prefixe de la cle.
// Les Z'Amours porte la cle « zamours » mais reste un quiz.
export function genrePageJouable(routeKey) {
  if (ROUTES_JEUX.includes(routeKey)) return 'jeu';
  if (routeKey === 'zamours' || /^quiz/.test(routeKey)) return 'quiz';
  return 'test';
}

// Helper functions
export function getLocalizedPath(routeKey, lang) {
  const slug = ROUTE_SLUGS[routeKey]?.[lang];
  if (slug === undefined) return null;
  if (lang === 'fr') return slug ? `/${slug}/` : '/';
  return slug ? `/${lang}/${slug}/` : `/${lang}/`;
}

export function getLocalizedUrl(routeKey, lang) {
  const path = getLocalizedPath(routeKey, lang);
  return path !== null ? `${BASE_URL}${path}` : null;
}

export function getRouteAlternates(routeKey) {
  const alts = LANGUAGES.map(lang => ({
    hreflang: lang,
    href: getLocalizedUrl(routeKey, lang),
  }));
  alts.push({ hreflang: 'x-default', href: getLocalizedUrl(routeKey, 'fr') });
  return alts;
}

// Blog categories with translations
export const BLOG_CATEGORIES = {
  astrologie: {
    fr: 'Astrologie',
    en: 'Astrology',
    es: 'Astrología',
    de: 'Astrologie',
    it: 'Astrologia',
  },
  'vie-de-couple': {
    fr: 'Vie de couple',
    en: 'Relationship',
    es: 'Vida en pareja',
    de: 'Beziehung',
    it: 'Vita di coppia',
  },
  'apps-rencontre': {
    fr: 'Apps de rencontre',
    en: 'Dating apps',
    es: 'Apps de citas',
    de: 'Dating-Apps',
    it: 'App di incontri',
  },
  psychologie: {
    fr: 'Psychologie',
    en: 'Psychology',
    es: 'Psicología',
    de: 'Psychologie',
    it: 'Psicologia',
  },
};

// Blog article metadata
export const BLOG_ARTICLES = [
  {
    internalSlug: 'disputes-couple-vacances',
    category: 'vie-de-couple',
    featuredImage: '/blog/disputes-couple-vacances.webp',
    slugs: {
      fr: 'disputes-couple-vacances',
      en: 'couples-arguing-on-holiday',
      es: 'discusiones-pareja-vacaciones',
      de: 'streit-im-paar-im-urlaub',
      it: 'litigi-di-coppia-in-vacanza',
    },
    publishedAt: '2026-08-12',
  },
  {
    internalSlug: 'sentiments-chez-un-homme',
    category: 'vie-de-couple',
    featuredImage: '/blog/sentiments-chez-un-homme.webp',
    slugs: {
      fr: 'sentiments-chez-un-homme',
      en: 'how-men-develop-feelings',
      es: 'como-nacen-los-sentimientos-en-un-hombre',
      de: 'wie-gefuehle-bei-einem-mann-entstehen',
      it: 'come-nascono-i-sentimenti-in-un-uomo',
    },
    publishedAt: '2026-08-12',
  },
  {
    internalSlug: 'arreter-ou-continuer-relation',
    category: 'vie-de-couple',
    featuredImage: '/blog/arreter-ou-continuer-relation.webp',
    slugs: {
      fr: 'arreter-ou-continuer-relation',
      en: 'stay-or-leave-relationship-signs',
      es: 'dejarlo-o-seguir-pareja',
      de: 'beziehung-beenden-oder-weitermachen',
      it: 'lasciarsi-o-continuare-coppia',
    },
    publishedAt: '2026-08-11',
  },
  {
    internalSlug: 'les-phases-de-la-rupture-chez-l-homme',
    category: 'vie-de-couple',
    slugs: {
      fr: 'les-phases-de-la-rupture-chez-l-homme',
      en: 'breakup-stages-for-men',
      es: 'fases-de-la-ruptura-en-el-hombre',
      de: 'trennungsphasen-beim-mann',
      it: 'fasi-della-rottura-nell-uomo',
    },
    publishedAt: '2026-02-21',
  },
  {
    internalSlug: 'choses-pas-accepter-couple',
    category: 'vie-de-couple',
    slugs: {
      fr: 'choses-pas-accepter-couple',
      en: 'things-not-accept-relationship',
      es: 'cosas-no-aceptar-pareja',
      de: 'grenzen-beziehung-nicht-akzeptieren',
      it: 'cose-non-accettare-coppia',
    },
    publishedAt: '2026-02-21',
  },
  {
    internalSlug: 'cadeau-mariage-combien-donner',
    category: 'vie-de-couple',
    frOnly: true,
    featuredImage: '/blog/cadeau-mariage.webp',
    slugs: {
      fr: 'cadeau-mariage-combien-donner',
    },
    publishedAt: '2026-08-09',
  },
  {
    internalSlug: 'avis-gleese',
    category: 'apps-rencontre',
    frOnly: true,
    featuredImage: '/blog/avis-gleese.webp',
    slugs: {
      fr: 'avis-gleese',
    },
    publishedAt: '2026-08-09',
  },
  {
    internalSlug: 'avis-tinder',
    category: 'apps-rencontre',
    slugs: {
      fr: 'avis-tinder',
      en: 'tinder-review',
      es: 'tinder-opiniones-vale-la-pena',
      de: 'tinder-bewertung',
      it: 'recensione-tinder',
    },
    publishedAt: '2026-02-27',
  },
  {
    internalSlug: 'avis-bumble',
    category: 'apps-rencontre',
    slugs: {
      fr: 'avis-bumble',
      en: 'bumble-app-review',
      es: 'opiniones-bumble',
      de: 'bumble-erfahrungen',
      it: 'recensione-bumble',
    },
    publishedAt: '2026-02-27',
  },
  {
    internalSlug: 'avis-hinge',
    category: 'apps-rencontre',
    slugs: {
      fr: 'avis-hinge-rencontre',
      en: 'hinge-dating-app-review',
      es: 'opinion-hinge-app-citas',
      de: 'hinge-erfahrungen-test',
      it: 'recensione-hinge-app',
    },
    publishedAt: '2026-02-27',
  },
  {
    internalSlug: 'avis-badoo',
    category: 'apps-rencontre',
    slugs: {
      fr: 'avis-badoo',
      en: 'badoo-review',
      es: 'opinion-badoo',
      de: 'badoo-erfahrungen',
      it: 'recensione-badoo',
    },
    publishedAt: '2026-02-28',
  },
  {
    internalSlug: 'femme-malheureuse-en-couple',
    featuredImage: '/blog/femme-malheureuse-en-couple.svg',
    category: 'vie-de-couple',
    slugs: {
      fr: 'femme-malheureuse-en-couple',
      en: 'unhappy-woman-in-relationship-signs',
      es: 'mujer-infeliz-en-pareja-senales',
      de: 'unglueckliche-frau-in-beziehung-anzeichen',
      it: 'donna-infelice-in-coppia-segnali',
    },
    publishedAt: '2026-03-01',
  },
  {
    category: 'astrologie',
    internalSlug: 'compatibilite-amoureuse-belier',
    slugs: {
      fr: 'compatibilite-amoureuse-belier',
      en: 'aries-love-compatibility',
      es: 'compatibilidad-amorosa-aries',
      de: 'liebeskompatibilitaet-widder',
      it: 'compatibilita-amorosa-ariete',
    },
    publishedAt: '2026-03-03',
  },
  {
    category: 'astrologie',
    internalSlug: 'compatibilite-amoureuse-taureau',
    slugs: {
      fr: 'compatibilite-amoureuse-taureau',
      en: 'taurus-love-compatibility',
      es: 'compatibilidad-amorosa-tauro',
      de: 'liebeskompatibilitaet-stier',
      it: 'compatibilita-amorosa-toro',
    },
    publishedAt: '2026-03-03',
  },
  {
    category: 'astrologie',
    internalSlug: 'compatibilite-amoureuse-gemeaux',
    slugs: {
      fr: 'compatibilite-amoureuse-gemeaux',
      en: 'gemini-love-compatibility',
      es: 'compatibilidad-amorosa-geminis',
      de: 'liebeskompatibilitaet-zwillinge',
      it: 'compatibilita-amorosa-gemelli',
    },
    publishedAt: '2026-03-03',
  },
  {
    category: 'astrologie',
    internalSlug: 'compatibilite-amoureuse-cancer',
    slugs: {
      fr: 'compatibilite-amoureuse-cancer',
      en: 'cancer-love-compatibility',
      es: 'compatibilidad-amorosa-cancer',
      de: 'liebeskompatibilitaet-krebs',
      it: 'compatibilita-amorosa-cancro',
    },
    publishedAt: '2026-03-03',
  },
  {
    category: 'astrologie',
    internalSlug: 'compatibilite-amoureuse-lion',
    slugs: {
      fr: 'compatibilite-amoureuse-lion',
      en: 'leo-love-compatibility',
      es: 'compatibilidad-amorosa-leo',
      de: 'liebeskompatibilitaet-loewe',
      it: 'compatibilita-amorosa-leone',
    },
    publishedAt: '2026-03-03',
  },
  {
    category: 'astrologie',
    internalSlug: 'compatibilite-amoureuse-vierge',
    slugs: {
      fr: 'compatibilite-amoureuse-vierge',
      en: 'virgo-love-compatibility',
      es: 'compatibilidad-amorosa-virgo',
      de: 'liebeskompatibilitaet-jungfrau',
      it: 'compatibilita-amorosa-vergine',
    },
    publishedAt: '2026-03-03',
  },
  {
    category: 'astrologie',
    internalSlug: 'compatibilite-amoureuse-balance',
    slugs: {
      fr: 'compatibilite-amoureuse-balance',
      en: 'libra-love-compatibility',
      es: 'compatibilidad-amorosa-libra',
      de: 'liebeskompatibilitaet-waage',
      it: 'compatibilita-amorosa-bilancia',
    },
    publishedAt: '2026-03-03',
  },
  {
    category: 'astrologie',
    internalSlug: 'compatibilite-amoureuse-scorpion',
    slugs: {
      fr: 'compatibilite-amoureuse-scorpion',
      en: 'scorpio-love-compatibility',
      es: 'compatibilidad-amorosa-escorpio',
      de: 'liebeskompatibilitaet-skorpion',
      it: 'compatibilita-amorosa-scorpione',
    },
    publishedAt: '2026-03-03',
  },
  {
    category: 'astrologie',
    internalSlug: 'compatibilite-amoureuse-sagittaire',
    slugs: {
      fr: 'compatibilite-amoureuse-sagittaire',
      en: 'sagittarius-love-compatibility',
      es: 'compatibilidad-amorosa-sagitario',
      de: 'liebeskompatibilitaet-schuetze',
      it: 'compatibilita-amorosa-sagittario',
    },
    publishedAt: '2026-03-03',
  },
  {
    category: 'astrologie',
    internalSlug: 'compatibilite-amoureuse-capricorne',
    slugs: {
      fr: 'compatibilite-amoureuse-capricorne',
      en: 'capricorn-love-compatibility',
      es: 'compatibilidad-amorosa-capricornio',
      de: 'liebeskompatibilitaet-steinbock',
      it: 'compatibilita-amorosa-capricorno',
    },
    publishedAt: '2026-03-03',
  },
  {
    category: 'astrologie',
    internalSlug: 'compatibilite-amoureuse-verseau',
    slugs: {
      fr: 'compatibilite-amoureuse-verseau',
      en: 'aquarius-love-compatibility',
      es: 'compatibilidad-amorosa-acuario',
      de: 'liebeskompatibilitaet-wassermann',
      it: 'compatibilita-amorosa-acquario',
    },
    publishedAt: '2026-03-03',
  },
  {
    category: 'astrologie',
    internalSlug: 'compatibilite-amoureuse-poissons',
    slugs: {
      fr: 'compatibilite-amoureuse-poissons',
      en: 'pisces-love-compatibility',
      es: 'compatibilidad-amorosa-piscis',
      de: 'liebeskompatibilitaet-fische',
      it: 'compatibilita-amorosa-pesci',
    },
    publishedAt: '2026-03-03',
  },
  {
    internalSlug: 'red-flags-homme',
    featuredImage: '/blog/red-flags-homme.svg',
    category: 'vie-de-couple',
    slugs: {
      fr: 'red-flags-homme',
      en: 'red-flags-in-a-man',
      es: 'red-flags-en-un-hombre',
      de: 'red-flags-bei-einem-mann',
      it: 'red-flag-in-un-uomo',
    },
    publishedAt: '2026-03-05',
  },
  {
    internalSlug: 'red-flags-femme',
    featuredImage: '/blog/red-flags-femme.svg',
    category: 'vie-de-couple',
    slugs: {
      fr: 'red-flags-femme',
      en: 'red-flags-in-a-woman',
      es: 'red-flags-en-una-mujer',
      de: 'red-flags-bei-einer-frau',
      it: 'red-flag-in-una-donna',
    },
    publishedAt: '2026-03-07',
  },
  {
    internalSlug: 'love-bombing',
    featuredImage: '/blog/love-bombing.svg',
    category: 'vie-de-couple',
    slugs: {
      fr: 'love-bombing',
      en: 'love-bombing-signs',
      es: 'love-bombing-senales',
      de: 'love-bombing-anzeichen',
      it: 'love-bombing-segnali',
    },
    publishedAt: '2026-08-02',
  },
  {
    internalSlug: 'copain-ne-fait-pas-effort',
    featuredImage: '/blog/copain-ne-fait-pas-effort.svg',
    category: 'vie-de-couple',
    slugs: {
      fr: 'copain-ne-fait-pas-effort',
      en: 'boyfriend-doesnt-make-effort',
      es: 'novio-no-hace-esfuerzo',
      de: 'freund-gibt-sich-keine-muehe',
      it: 'ragazzo-non-si-impegna',
    },
    publishedAt: '2026-03-08',
  },
  {
    internalSlug: 'lexique-relations-2026',
    featuredImage: '/blog/lexique-relations-2026.svg',
    category: 'vie-de-couple',
    frOnly: true,
    slugs: {
      fr: 'lexique-relations-2026',
    },
    publishedAt: '2026-03-11',
  },
  {
    internalSlug: 'dependance-affective',
    featuredImage: '/blog/dependance-affective.svg',
    category: 'vie-de-couple',
    slugs: {
      fr: 'dependance-affective',
      en: 'emotional-dependency-in-relationships',
      es: 'dependencia-emocional-en-la-pareja',
      de: 'emotionale-abhaengigkeit-in-beziehungen',
      it: 'dipendenza-affettiva-nella-coppia',
    },
    publishedAt: '2026-03-24',
  },
  {
    internalSlug: 'sauver-son-couple',
    category: 'vie-de-couple',
    frOnly: true,
    slugs: {
      fr: 'sauver-son-couple',
    },
    publishedAt: '2026-05-26',
  },
  {
    internalSlug: 'disputes-couple',
    category: 'vie-de-couple',
    frOnly: true,
    slugs: {
      fr: 'disputes-couple',
    },
    publishedAt: '2026-05-26',
  },
  {
    internalSlug: 'charge-mentale-couple',
    category: 'vie-de-couple',
    frOnly: true,
    slugs: {
      fr: 'charge-mentale-couple',
    },
    publishedAt: '2026-05-26',
  },
  {
    internalSlug: 'manque-communication-couple',
    category: 'vie-de-couple',
    frOnly: true,
    slugs: {
      fr: 'manque-communication-couple',
    },
    publishedAt: '2026-05-26',
  },
  {
    internalSlug: 'comment-savoir-si-cest-le-bon',
    category: 'vie-de-couple',
    frOnly: true,
    slugs: {
      fr: 'comment-savoir-si-cest-le-bon',
    },
    publishedAt: '2026-05-26',
  },
  {
    internalSlug: 'activites-couple-ete',
    featuredImage: '/blog/activites-couple-ete.webp',
    category: 'vie-de-couple',
    slugs: {
      fr: 'activites-couple-ete',
      en: 'summer-couple-activities',
      es: 'actividades-en-pareja-verano',
      de: 'paar-aktivitaeten-im-sommer',
      it: 'attivita-di-coppia-in-estate',
    },
    publishedAt: '2026-07-29',
  },
  {
    internalSlug: 'pervers-narcissique-amour',
    category: 'psychologie',
    featuredImage: '/blog/pervers-narcissique-amour.webp',
    slugs: {
      fr: 'pervers-narcissique-amour',
      en: 'narcissist-in-love-signs',
      es: 'narcisista-en-el-amor',
      de: 'narzisst-in-der-liebe',
      it: 'narcisista-in-amore',
    },
    publishedAt: '2026-08-25',
  },
  {
    internalSlug: 'questions-a-poser-a-son-copain',
    category: 'vie-de-couple',
    featuredImage: '/blog/questions-a-poser-a-son-copain.webp',
    slugs: {
      fr: 'questions-a-poser-a-son-copain',
      en: 'questions-to-ask-your-boyfriend',
      es: 'preguntas-para-tu-novio',
      de: 'fragen-an-deinen-freund',
      it: 'domande-da-fare-al-tuo-ragazzo',
    },
    publishedAt: '2026-08-28',
  },
  {
    internalSlug: 'homme-pervers-narcissique-signes',
    category: 'psychologie',
    featuredImage: '/blog/homme-pervers-narcissique-signes.webp',
    slugs: {
      fr: 'homme-pervers-narcissique-signes',
      en: 'narcissistic-man-signs',
      es: 'hombre-narcisista-senales',
      de: 'narzisstischer-mann-anzeichen',
      it: 'uomo-narcisista-segnali',
    },
    publishedAt: '2026-09-01',
  },
  {
    internalSlug: 'questions-a-poser-a-son-crush',
    category: 'vie-de-couple',
    featuredImage: '/blog/questions-a-poser-a-son-crush.webp',
    slugs: {
      fr: 'questions-a-poser-a-son-crush',
      en: 'questions-to-ask-your-crush',
      es: 'preguntas-para-tu-crush',
      de: 'fragen-an-deinen-crush',
      it: 'domande-da-fare-al-tuo-crush',
    },
    publishedAt: '2026-09-04',
  },
  {
    internalSlug: 'phrases-preferees-des-manipulateurs',
    category: 'psychologie',
    featuredImage: '/blog/phrases-preferees-des-manipulateurs.webp',
    slugs: {
      fr: 'phrases-preferees-des-manipulateurs',
      en: 'manipulator-phrases',
      es: 'frases-de-manipuladores',
      de: 'saetze-von-manipulatoren',
      it: 'frasi-dei-manipolatori',
    },
    publishedAt: '2026-09-08',
  },
  {
    internalSlug: 'questions-a-poser-a-une-fille',
    category: 'vie-de-couple',
    featuredImage: '/blog/questions-a-poser-a-une-fille.webp',
    slugs: {
      fr: 'questions-a-poser-a-une-fille',
      en: 'questions-to-ask-a-girl',
      es: 'preguntas-para-una-chica',
      de: 'fragen-an-ein-maedchen',
      it: 'domande-da-fare-a-una-ragazza',
    },
    publishedAt: '2026-09-11',
  },
  {
    internalSlug: 'dependance-affective-symptomes',
    category: 'psychologie',
    featuredImage: '/blog/dependance-affective-symptomes.webp',
    slugs: {
      fr: 'dependance-affective-symptomes',
      en: 'emotional-dependency-symptoms',
      es: 'sintomas-dependencia-emocional',
      de: 'emotionale-abhaengigkeit-symptome',
      it: 'sintomi-dipendenza-affettiva',
    },
    publishedAt: '2026-09-15',
  },
  {
    internalSlug: 'manipulateur-narcissique',
    category: 'psychologie',
    featuredImage: '/blog/manipulateur-narcissique.webp',
    slugs: {
      fr: 'manipulateur-narcissique',
      en: 'narcissistic-manipulator',
      es: 'manipulador-narcisista',
      de: 'narzisstischer-manipulator',
      it: 'manipolatore-narcisista',
    },
    publishedAt: '2026-09-18',
  },
  {
    internalSlug: 'questions-intimes-couple',
    category: 'vie-de-couple',
    featuredImage: '/blog/questions-intimes-couple.webp',
    slugs: {
      fr: 'questions-intimes-couple',
      en: 'intimate-questions-for-couples',
      es: 'preguntas-intimas-pareja',
      de: 'intime-fragen-fuer-paare',
      it: 'domande-intime-di-coppia',
    },
    publishedAt: '2026-09-22',
  },
  {
    internalSlug: 'sortir-de-la-dependance-affective',
    category: 'psychologie',
    featuredImage: '/blog/sortir-de-la-dependance-affective.webp',
    slugs: {
      fr: 'sortir-de-la-dependance-affective',
      en: 'overcome-emotional-dependency',
      es: 'superar-la-dependencia-emocional',
      de: 'emotionale-abhaengigkeit-ueberwinden',
      it: 'superare-la-dipendenza-affettiva',
    },
    publishedAt: '2026-09-25',
  },
  {
    internalSlug: 'femme-perverse-narcissique-signes',
    category: 'psychologie',
    featuredImage: '/blog/femme-perverse-narcissique-signes.webp',
    slugs: {
      fr: 'femme-perverse-narcissique-signes',
      en: 'narcissistic-woman-signs',
      es: 'mujer-narcisista-senales',
      de: 'narzisstische-frau-anzeichen',
      it: 'donna-narcisista-segnali',
    },
    publishedAt: '2026-09-29',
  },
  {
    internalSlug: 'questions-a-poser-a-sa-copine',
    category: 'vie-de-couple',
    featuredImage: '/blog/questions-a-poser-a-sa-copine.webp',
    slugs: {
      fr: 'questions-a-poser-a-sa-copine',
      en: 'questions-to-ask-your-girlfriend',
      es: 'preguntas-para-tu-novia',
      de: 'fragen-an-deine-freundin',
      it: 'domande-da-fare-alla-tua-ragazza',
    },
    publishedAt: '2026-10-02',
  },
  {
    internalSlug: 'relation-toxique-signes',
    category: 'psychologie',
    featuredImage: '/blog/relation-toxique-signes.webp',
    slugs: {
      fr: 'relation-toxique-signes',
      en: 'toxic-relationship-signs',
      es: 'senales-relacion-toxica',
      de: 'toxische-beziehung-anzeichen',
      it: 'segnali-relazione-tossica',
    },
    publishedAt: '2026-10-06',
  },
  {
    internalSlug: 'amour-ou-dependance-affective',
    category: 'psychologie',
    featuredImage: '/blog/amour-ou-dependance-affective.webp',
    slugs: {
      fr: 'amour-ou-dependance-affective',
      en: 'love-or-emotional-dependency',
      es: 'amor-o-dependencia-emocional',
      de: 'liebe-oder-emotionale-abhaengigkeit',
      it: 'amore-o-dipendenza-affettiva',
    },
    publishedAt: '2026-10-09',
  },
  {
    internalSlug: 'questions-pour-mieux-se-connaitre-en-couple',
    category: 'vie-de-couple',
    featuredImage: '/blog/questions-pour-mieux-se-connaitre-en-couple.webp',
    slugs: {
      fr: 'questions-pour-mieux-se-connaitre-en-couple',
      en: 'questions-to-get-to-know-each-other',
      es: 'preguntas-para-conoceros-mejor',
      de: 'fragen-um-sich-besser-kennenzulernen',
      it: 'domande-per-conoscersi-meglio',
    },
    publishedAt: '2026-10-13',
  },
  {
    internalSlug: 'dependance-affective-chez-l-homme',
    category: 'psychologie',
    featuredImage: '/blog/dependance-affective-chez-l-homme.webp',
    slugs: {
      fr: 'dependance-affective-chez-l-homme',
      en: 'emotional-dependency-in-men',
      es: 'dependencia-emocional-en-el-hombre',
      de: 'emotionale-abhaengigkeit-bei-maennern',
      it: 'dipendenza-affettiva-negli-uomini',
    },
    publishedAt: '2026-10-16',
  },
  {
    internalSlug: 'rupture-pervers-narcissique',
    category: 'psychologie',
    featuredImage: '/blog/rupture-pervers-narcissique.webp',
    slugs: {
      fr: 'rupture-pervers-narcissique',
      en: 'breaking-up-with-a-narcissist',
      es: 'ruptura-con-un-narcisista',
      de: 'trennung-von-einem-narzissten',
      it: 'rottura-con-un-narcisista',
    },
    publishedAt: '2026-10-20',
  },
  {
    internalSlug: 'questions-debut-de-relation',
    category: 'vie-de-couple',
    featuredImage: '/blog/questions-debut-de-relation.webp',
    slugs: {
      fr: 'questions-debut-de-relation',
      en: 'questions-early-relationship',
      es: 'preguntas-inicio-relacion',
      de: 'fragen-beziehungsanfang',
      it: 'domande-inizio-relazione',
    },
    publishedAt: '2026-10-23',
  },
  {
    internalSlug: 'homme-toxique-en-amour',
    category: 'psychologie',
    featuredImage: '/blog/homme-toxique-en-amour.webp',
    slugs: {
      fr: 'homme-toxique-en-amour',
      en: 'toxic-man-in-love',
      es: 'hombre-toxico-en-el-amor',
      de: 'toxischer-mann-in-der-liebe',
      it: 'uomo-tossico-in-amore',
    },
    publishedAt: '2026-10-27',
  },
  {
    internalSlug: 'questions-avenir-couple',
    category: 'vie-de-couple',
    featuredImage: '/blog/questions-avenir-couple.webp',
    slugs: {
      fr: 'questions-avenir-couple',
      en: 'future-questions-for-couples',
      es: 'preguntas-sobre-el-futuro-pareja',
      de: 'zukunftsfragen-fuer-paare',
      it: 'domande-sul-futuro-di-coppia',
    },
    publishedAt: '2026-10-30',
  },
  {
    internalSlug: 'femme-toxique-en-amour',
    category: 'psychologie',
    featuredImage: '/blog/femme-toxique-en-amour.webp',
    slugs: {
      fr: 'femme-toxique-en-amour',
      en: 'toxic-woman-in-love',
      es: 'mujer-toxica-en-el-amor',
      de: 'toxische-frau-in-der-liebe',
      it: 'donna-tossica-in-amore',
    },
    publishedAt: '2026-11-03',
  },
  {
    internalSlug: '36-questions-pour-tomber-amoureux',
    category: 'vie-de-couple',
    featuredImage: '/blog/36-questions-pour-tomber-amoureux.webp',
    slugs: {
      fr: '36-questions-pour-tomber-amoureux',
      en: '36-questions-to-fall-in-love',
      es: '36-preguntas-para-enamorarse',
      de: '36-fragen-um-sich-zu-verlieben',
      it: '36-domande-per-innamorarsi',
    },
    publishedAt: '2026-11-06',
  },
  {
    internalSlug: 'dependant-affectif-et-manipulateur',
    category: 'psychologie',
    featuredImage: '/blog/dependant-affectif-et-manipulateur.webp',
    slugs: {
      fr: 'dependant-affectif-et-manipulateur',
      en: 'codependent-and-manipulator',
      es: 'dependiente-emocional-y-manipulador',
      de: 'emotional-abhaengig-und-manipulator',
      it: 'dipendente-affettivo-e-manipolatore',
    },
    publishedAt: '2026-11-10',
  },
  {
    internalSlug: 'sortir-emprise-pervers-narcissique',
    category: 'psychologie',
    featuredImage: '/blog/sortir-emprise-pervers-narcissique.webp',
    slugs: {
      fr: 'sortir-emprise-pervers-narcissique',
      en: 'escape-narcissistic-abuse',
      es: 'salir-del-control-de-un-narcisista',
      de: 'aus-narzisstischem-missbrauch-ausbrechen',
      it: 'uscire-dal-controllo-di-un-narcisista',
    },
    publishedAt: '2026-11-13',
  },
  {
    internalSlug: 'dependance-affective-amitie',
    category: 'psychologie',
    featuredImage: '/blog/dependance-affective-amitie.webp',
    slugs: {
      fr: 'dependance-affective-amitie',
      en: 'emotional-dependency-in-friendship',
      es: 'dependencia-emocional-en-la-amistad',
      de: 'emotionale-abhaengigkeit-in-freundschaften',
      it: 'dipendenza-affettiva-in-amicizia',
    },
    publishedAt: '2026-11-17',
  },
  {
    internalSlug: 'dependance-affective-rupture',
    category: 'psychologie',
    featuredImage: '/blog/dependance-affective-rupture.webp',
    slugs: {
      fr: 'dependance-affective-rupture',
      en: 'emotional-dependency-after-a-breakup',
      es: 'dependencia-emocional-tras-una-ruptura',
      de: 'emotionale-abhaengigkeit-nach-der-trennung',
      it: 'dipendenza-affettiva-dopo-una-rottura',
    },
    publishedAt: '2026-11-20',
  },
  {
    internalSlug: 'gaslighting',
    category: 'psychologie',
    featuredImage: '/blog/gaslighting.webp',
    slugs: {
      fr: 'gaslighting',
      en: 'gaslighting-signs',
      es: 'gaslighting-senales',
      de: 'gaslighting-anzeichen',
      it: 'gaslighting-segnali',
    },
    publishedAt: '2026-11-24',
  },
  {
    internalSlug: 'questions-couple-telephone-message',
    category: 'vie-de-couple',
    featuredImage: '/blog/questions-couple-telephone-message.webp',
    slugs: {
      fr: 'questions-couple-telephone-message',
      en: 'questions-for-couples-over-text',
      es: 'preguntas-de-pareja-por-mensaje',
      de: 'fragen-fuer-paare-per-nachricht',
      it: 'domande-di-coppia-per-messaggio',
    },
    publishedAt: '2026-11-27',
  },
  {
    internalSlug: 'styles-attachement-couple',
    category: 'psychologie',
    featuredImage: '/blog/styles-attachement-couple.webp',
    slugs: {
      fr: 'styles-attachement-couple',
      en: 'attachment-styles-in-love',
      es: 'estilos-de-apego-en-la-pareja',
      de: 'bindungsstile-in-der-liebe',
      it: 'stili-di-attaccamento-in-amore',
    },
    publishedAt: '2026-12-01',
  },
  {
    internalSlug: 'attachement-anxieux',
    category: 'psychologie',
    featuredImage: '/blog/attachement-anxieux.webp',
    slugs: {
      fr: 'attachement-anxieux',
      en: 'anxious-attachment-in-love',
      es: 'apego-ansioso-en-el-amor',
      de: 'aengstliche-bindung-in-der-liebe',
      it: 'attaccamento-ansioso-in-amore',
    },
    publishedAt: '2026-12-04',
  },
  {
    internalSlug: 'attachement-evitant',
    category: 'psychologie',
    featuredImage: '/blog/attachement-evitant.webp',
    slugs: {
      fr: 'attachement-evitant',
      en: 'avoidant-attachment-in-love',
      es: 'apego-evitativo-en-el-amor',
      de: 'vermeidende-bindung-in-der-liebe',
      it: 'attaccamento-evitante-in-amore',
    },
    publishedAt: '2026-12-08',
  },
  {
    internalSlug: 'peur-de-l-engagement',
    category: 'psychologie',
    featuredImage: '/blog/peur-de-l-engagement.webp',
    slugs: {
      fr: 'peur-de-l-engagement',
      en: 'fear-of-commitment',
      es: 'miedo-al-compromiso',
      de: 'bindungsangst',
      it: 'paura-dell-impegno',
    },
    publishedAt: '2026-12-11',
  },
  {
    internalSlug: '5-langages-de-l-amour',
    category: 'vie-de-couple',
    featuredImage: '/blog/5-langages-de-l-amour.webp',
    slugs: {
      fr: '5-langages-de-l-amour',
      en: '5-love-languages',
      es: '5-lenguajes-del-amor',
      de: '5-sprachen-der-liebe',
      it: '5-linguaggi-dell-amore',
    },
    publishedAt: '2026-12-15',
  },
  {
    internalSlug: 'jalousie-maladive',
    category: 'psychologie',
    featuredImage: '/blog/jalousie-maladive.webp',
    slugs: {
      fr: 'jalousie-maladive',
      en: 'pathological-jealousy',
      es: 'celos-patologicos',
      de: 'krankhafte-eifersucht',
      it: 'gelosia-patologica',
    },
    publishedAt: '2026-12-18',
  },
  {
    internalSlug: 'signes-infidelite',
    category: 'psychologie',
    featuredImage: '/blog/signes-infidelite.webp',
    slugs: {
      fr: 'signes-infidelite',
      en: 'signs-of-infidelity',
      es: 'senales-de-infidelidad',
      de: 'anzeichen-fuer-untreue',
      it: 'segnali-di-infedelta',
    },
    publishedAt: '2026-12-22',
  },
  {
    internalSlug: 'micro-tromperie',
    category: 'psychologie',
    featuredImage: '/blog/micro-tromperie.webp',
    slugs: {
      fr: 'micro-tromperie',
      en: 'micro-cheating',
      es: 'micro-infidelidad',
      de: 'micro-cheating',
      it: 'micro-tradimento',
    },
    publishedAt: '2026-12-25',
  },
  {
    internalSlug: 'pardonner-une-infidelite',
    category: 'psychologie',
    featuredImage: '/blog/pardonner-une-infidelite.webp',
    slugs: {
      fr: 'pardonner-une-infidelite',
      en: 'forgiving-infidelity',
      es: 'perdonar-una-infidelidad',
      de: 'untreue-verzeihen',
      it: 'perdonare-un-infedelta',
    },
    publishedAt: '2026-12-29',
  },
];

// Author data
export const AUTHORS = {
  'mathieu-courtin': {
    id: 'mathieu-courtin',
    name: 'Mathieu Courtin',
    avatar: '/authors/mathieu-courtin.webp',
    bios: {
      fr: "Mathieu Courtin est rédacteur spécialisé en relations amoureuses et psychologie du couple. Co-fondateur de Quiz Couple, il décrypte les dynamiques masculines dans la vie sentimentale avec un regard sincère, documenté et sans tabou.",
      en: "Mathieu Courtin is a writer specializing in romantic relationships and couple psychology. Co-founder of Quiz Couple, he explores male emotional dynamics in love with honesty, research-backed insights, and no taboos.",
      es: "Mathieu Courtin es redactor especializado en relaciones sentimentales y psicología de pareja. Cofundador de Quiz Couple, analiza las dinámicas masculinas en el amor con sinceridad, rigor y sin tabúes.",
      de: "Mathieu Courtin ist Autor mit Schwerpunkt auf Liebesbeziehungen und Paarpsychologie. Als Mitgründer von Quiz Couple beleuchtet er männliche emotionale Dynamiken in der Liebe, ehrlich, fundiert und ohne Tabus.",
      it: "Mathieu Courtin è autore specializzato in relazioni sentimentali e psicologia di coppia. Co-fondatore di Quiz Couple, analizza le dinamiche emotive maschili nell'amore con sincerità, rigore e senza tabù.",
    },
  },
  'lucie-courtin': {
    id: 'lucie-courtin',
    name: 'Lucie Courtin',
    avatar: '/authors/lucie-courtin.webp',
    bios: {
      fr: "Lucie Courtin est rédactrice spécialisée en relations de couple et bien-être émotionnel. Co-fondatrice de Quiz Couple, elle explore la vie sentimentale sous un angle féminin, avec empathie, profondeur et une touche de franc-parler.",
      en: "Lucie Courtin is a writer specializing in couple relationships and emotional well-being. Co-founder of Quiz Couple, she explores love from a female perspective, with empathy, depth, and a touch of straight talk.",
      es: "Lucie Courtin es redactora especializada en relaciones de pareja y bienestar emocional. Cofundadora de Quiz Couple, explora la vida sentimental desde una perspectiva femenina, con empatía, profundidad y franqueza.",
      de: "Lucie Courtin ist Autorin mit Schwerpunkt auf Paarbeziehungen und emotionalem Wohlbefinden. Als Mitgründerin von Quiz Couple beleuchtet sie die Liebe aus weiblicher Perspektive, mit Empathie, Tiefe und Klartext.",
      it: "Lucie Courtin è autrice specializzata in relazioni di coppia e benessere emotivo. Co-fondatrice di Quiz Couple, esplora la vita sentimentale da una prospettiva femminile, con empatia, profondità e schiettezza.",
    },
  },
};

export function getArticlePath(articleSlug, lang) {
  if (lang === 'fr') return `/blog/${articleSlug}/`;
  return `/${lang}/blog/${articleSlug}/`;
}

export function getArticleUrl(articleSlug, lang) {
  return `${BASE_URL}${getArticlePath(articleSlug, lang)}`;
}

export function getArticleAlternates(articleMeta) {
  const alts = LANGUAGES.map(lang => ({
    hreflang: lang,
    href: getArticleUrl(articleMeta.slugs[lang], lang),
  }));
  alts.push({ hreflang: 'x-default', href: getArticleUrl(articleMeta.slugs.fr, 'fr') });
  return alts;
}

export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;');
}

// Quiz/test route → relevant existing blog articles (by internalSlug).
// Resolved at build time per language; articles not published in a language are
// filtered out automatically, so non-FR pages only show their available ones.
export const QUIZ_RELATED_ARTICLES = {
  testCouple:       ['comment-savoir-si-cest-le-bon', 'sauver-son-couple', 'manque-communication-couple'],
  testCommonPoints: ['comment-savoir-si-cest-le-bon', 'manque-communication-couple'],
  testCompatibilite: ['comment-savoir-si-cest-le-bon', 'sauver-son-couple', 'manque-communication-couple'],
  testDistance:     ['manque-communication-couple', 'sauver-son-couple'],
  testToxic:        ['choses-pas-accepter-couple', 'red-flags-homme', 'red-flags-femme', 'femme-malheureuse-en-couple'],
  testPervers:      ['red-flags-homme', 'red-flags-femme', 'dependance-affective', 'choses-pas-accepter-couple'],
  testAmourHabitude:['comment-savoir-si-cest-le-bon', 'copain-ne-fait-pas-effort', 'sauver-son-couple', 'femme-malheureuse-en-couple', 'dependance-affective', 'manque-communication-couple'],
  testCoupleSain:   ['sauver-son-couple', 'disputes-couple', 'manque-communication-couple'],
  testMariage:      ['comment-savoir-si-cest-le-bon', 'charge-mentale-couple'],
  testDivorce:      ['les-phases-de-la-rupture-chez-l-homme', 'choses-pas-accepter-couple', 'sauver-son-couple'],
  testParentalite:  ['charge-mentale-couple', 'manque-communication-couple'],
  testEmmenager:    ['charge-mentale-couple', 'disputes-couple'],
  testJalousie:     ['dependance-affective', 'red-flags-homme', 'choses-pas-accepter-couple'],
  testLangageAmour: ['manque-communication-couple', 'sauver-son-couple'],
  testAttachement:  ['dependance-affective', 'comment-savoir-si-cest-le-bon', 'sauver-son-couple'],
  testDependance:   ['dependance-affective', 'love-bombing', 'sauver-son-couple'],
  testConfiance:    ['sauver-son-couple', 'red-flags-homme', 'disputes-couple'],
  testInfidelite:   ['red-flags-homme', 'red-flags-femme', 'choses-pas-accepter-couple'],
  testAstroPrenoms: ['compatibilite-amoureuse-belier', 'compatibilite-amoureuse-lion', 'compatibilite-amoureuse-scorpion'],
  quizAmoureux:     ['comment-savoir-si-cest-le-bon', 'sauver-son-couple'],
  quizCoquin:       ['comment-savoir-si-cest-le-bon', 'manque-communication-couple'],
  quizGenant:       ['copain-ne-fait-pas-effort', 'red-flags-homme'],
  quizAdo:          ['red-flags-homme', 'red-flags-femme'],
  quizMarrant:      ['comment-savoir-si-cest-le-bon', 'manque-communication-couple'],
  quizKnowledge:    ['comment-savoir-si-cest-le-bon', 'manque-communication-couple'],
  quizTentation:    ['red-flags-homme', 'red-flags-femme', 'choses-pas-accepter-couple', 'les-phases-de-la-rupture-chez-l-homme', 'copain-ne-fait-pas-effort'],
  // Vingt pages jouables n'avaient aucun article rattaché, et onze articles
  // n'étaient donc remontés nulle part : ils ne recevaient de lien que du
  // listing du blog et de leurs voisins. Or ces pages de test sont les plus
  // fortes du site (menu, accueil, carrousels). Les rattachements ci-dessous
  // sont thématiques, jamais de remplissage : un test sans article vraiment
  // proche garde une liste vide.
  testPurete:       ['choses-pas-accepter-couple', 'lexique-relations-2026'],
  testSuisJeAmoureux: ['sentiments-chez-un-homme', 'comment-savoir-si-cest-le-bon', 'dependance-affective'],
  testSecret:       ['sentiments-chez-un-homme', 'comment-savoir-si-cest-le-bon'],
  testCouche:       ['red-flags-homme', 'red-flags-femme', 'choses-pas-accepter-couple'],
  testDistanceAime: ['manque-communication-couple', 'sentiments-chez-un-homme', 'arreter-ou-continuer-relation'],
  testFinCouple:    ['arreter-ou-continuer-relation', 'les-phases-de-la-rupture-chez-l-homme', 'sauver-son-couple'],
  testAmourAmitie:  ['sentiments-chez-un-homme', 'comment-savoir-si-cest-le-bon'],
  testKarmique:     ['dependance-affective', 'love-bombing', 'arreter-ou-continuer-relation'],
  testDateNaissance: ['compatibilite-amoureuse-lion', 'compatibilite-amoureuse-scorpion', 'compatibilite-amoureuse-taureau'],
  testVacances:     ['activites-couple-ete', 'disputes-couple-vacances', 'sauver-son-couple'],
  quizTuPreferes:   ['comment-savoir-si-cest-le-bon', 'activites-couple-ete'],
  quizVraiFaux:     ['comment-savoir-si-cest-le-bon', 'manque-communication-couple'],
  quizMost:         ['activites-couple-ete', 'disputes-couple'],
  jeuxCouple:       ['activites-couple-ete', 'disputes-couple', 'sauver-son-couple'],
  jeuPlateau:       ['activites-couple-ete', 'manque-communication-couple'],
  jeuQuiDeNous:     ['comment-savoir-si-cest-le-bon', 'manque-communication-couple'],
  jeuDilemmes:      ['choses-pas-accepter-couple', 'disputes-couple'],
  jeuGages:         ['activites-couple-ete', 'comment-savoir-si-cest-le-bon'],
};
// Ajouts sur des entrées déjà existantes : on complète sans réécrire la table,
// pour que la liste d'origine reste lisible telle qu'elle a été pensée. Le
// love bombing décrit exactement le mécanisme que traquent ces trois tests,
// et n'était pourtant rattaché à aucun.
QUIZ_RELATED_ARTICLES.testPervers.push('love-bombing');
QUIZ_RELATED_ARTICLES.testToxic.push('love-bombing');
QUIZ_RELATED_ARTICLES.testJalousie.push('love-bombing');
QUIZ_RELATED_ARTICLES.quizAdo.push('lexique-relations-2026');
QUIZ_RELATED_ARTICLES.testCoupleSain.push('femme-malheureuse-en-couple');
QUIZ_RELATED_ARTICLES.testCouple.push('femme-malheureuse-en-couple');
QUIZ_RELATED_ARTICLES.testDivorce.push('arreter-ou-continuer-relation');
