/**
 * Build configuration - routes, languages, and constants
 */

export const BASE_URL = 'https://quiz-couple.com';
// Le compte Instagram du site : menu, pied de page, JSON-LD (sameAs), merci après un avis.
export const INSTAGRAM_URL = 'https://www.instagram.com/quiz_couple_official/';
export const LANGUAGES = ['fr', 'en', 'es', 'de', 'it', 'nl'];
// Les langues construites mais pas encore ouvertes (30 octobre 2026, le
// néerlandais, docs/langues/CADRAGE-NL.md) : leurs pages sont publiées en
// noindex, hors des sitemaps, du hreflang, des flux RSS et du sélecteur de
// langue, et un article n'y existe que traduit. On retire une langue de la
// liste le jour de son ouverture.
export const LANGUES_CACHEES = ['nl'];
export const LANGUES_PUBLIQUES = LANGUAGES.filter((l) => !LANGUES_CACHEES.includes(l));
export function langueCachee(lang) { return LANGUES_CACHEES.includes(lang); }
export const DEFAULT_LANG = 'fr';

export const LOCALES = {
  fr: 'fr_FR',
  en: 'en_US',
  es: 'es_ES',
  de: 'de_DE',
  it: 'it_IT',
  nl: 'nl_NL',
};

// Route slugs per language (mirrored from i18n/routes.ts)
export const ROUTE_SLUGS = {
  home: { fr: '', en: '', es: '', de: '', it: '', nl: '' },
  testCouple: { fr: 'tester-son-couple', en: 'couple-compatibility-test', es: 'test-compatibilidad-pareja', de: 'paar-kompatibilitaetstest', it: 'test-compatibilita-coppia', nl: 'relatietest' },
  testCommonPoints: { fr: 'test-points-communs-couples', en: 'couple-common-points-test', es: 'test-puntos-comunes-pareja', de: 'gemeinsamkeiten-test-paare', it: 'test-punti-comuni-coppia', nl: 'hoeveel-hebben-we-gemeen' },
  testCompatibilite: { fr: 'test-compatibilite-amoureuse', en: 'love-compatibility-test', es: 'test-compatibilidad-amorosa', de: 'liebeskompatibilitaet-test', it: 'test-compatibilita-amorosa', nl: 'passen-we-bij-elkaar' },
  testDistance: { fr: 'quiz-couple-distance', en: 'long-distance-relationship-quiz', es: 'quiz-pareja-distancia', de: 'fernbeziehung-quiz', it: 'quiz-coppia-distanza', nl: 'lange-afstandsrelatie-test' },
  testToxic: { fr: 'test-couple-toxique', en: 'toxic-relationship-test', es: 'test-relacion-toxica', de: 'toxische-beziehung-test', it: 'test-relazione-tossica', nl: 'toxische-relatie-test' },
  testRedFlag: { fr: 'test-red-flag', en: 'red-flag-test', es: 'test-red-flag', de: 'red-flag-test', it: 'test-red-flag', nl: 'red-flag-test' },
  testPervers: { fr: 'test-pervers-narcissique', en: 'narcissistic-partner-test', es: 'test-pareja-narcisista', de: 'narzisstischer-partner-test', it: 'test-partner-narcisista', nl: 'narcistische-partner-test' },
  testAmourHabitude: { fr: 'test-amour-ou-habitude', en: 'love-or-habit-test', es: 'test-amor-o-costumbre', de: 'liebe-oder-gewohnheit-test', it: 'test-amore-o-abitudine', nl: 'liefde-of-gewoonte-test' },
  testAmourAttachement: { fr: 'test-amour-ou-attachement', en: 'love-or-attachment-test', es: 'test-amor-o-apego', de: 'liebe-oder-bindung-test', it: 'test-amore-o-attaccamento', nl: 'verliefd-of-gehecht-test' },
  testJeLaimeEncore: { fr: 'test-je-l-aime-encore', en: 'do-i-still-love-him-her-test', es: 'test-todavia-le-quiero', de: 'liebe-ich-ihn-sie-noch-test', it: 'test-lo-amo-ancora', nl: 'hou-ik-nog-van-hem' },
  testCoupleSain: { fr: 'test-couple-sain', en: 'healthy-relationship-test', es: 'test-relacion-sana', de: 'gesunde-beziehung-test', it: 'test-relazione-sana', nl: 'gezonde-relatie-test' },
  testMariage: { fr: 'test-couple-mariage', en: 'marriage-compatibility-test', es: 'test-compatibilidad-matrimonio', de: 'ehe-kompatibilitaetstest', it: 'test-compatibilita-matrimonio', nl: 'klaar-om-te-trouwen-test' },
  testDivorce: { fr: 'test-dois-je-divorcer', en: 'should-i-divorce-test', es: 'test-debo-divorciarme', de: 'scheidungstest', it: 'test-devo-divorziare', nl: 'moet-ik-scheiden-test' },
  testPurete: { fr: 'test-purete-couple', en: 'purity-test-couples', es: 'test-de-pureza-pareja', de: 'reinheitstest-paare', it: 'test-di-purezza-coppia', nl: 'puriteitstest' },
  quizAmoureux: { fr: 'quiz-amoureux', en: 'love-quiz', es: 'quiz-enamorados', de: 'liebes-quiz', it: 'quiz-innamorati', nl: 'quiz-over-liefde' },
  quizTypeCouple: { fr: 'quel-type-de-couple-etes-vous', en: 'what-type-of-couple-are-you-quiz', es: 'que-tipo-de-pareja-sois-quiz', de: 'welcher-paartyp-seid-ihr-quiz', it: 'che-tipo-di-coppia-siete-quiz', nl: 'wat-voor-koppel-zijn-jullie' },
  quizCoquin: { fr: 'quiz-couple-coquin', en: 'spicy-couple-quiz', es: 'quiz-pareja-picante', de: 'pikantes-paar-quiz', it: 'quiz-coppia-piccante', nl: 'ondeugende-quiz' },
  quizMarrant: { fr: 'quiz-couple-marrant', en: 'funny-couple-quiz', es: 'quiz-pareja-divertido', de: 'lustiges-paar-quiz', it: 'quiz-coppia-divertente', nl: 'grappige-vragen-voor-koppels' },
  quizKnowledge: { fr: 'quiz-qui-connait-mieux-partenaire', en: 'who-knows-partner-best-quiz', es: 'quiz-quien-conoce-mejor-pareja', de: 'wer-kennt-partner-besser-quiz', it: 'quiz-chi-conosce-meglio-partner', nl: 'hoe-goed-ken-je-je-partner' },
  quizMost: { fr: 'quiz-qui-est-le-plus', en: 'who-is-most-likely-quiz', es: 'quiz-quien-es-mas', de: 'wer-ist-am-meisten-quiz', it: 'quiz-chi-e-piu', nl: 'wie-is-het-meest' },
  questionsCouple: { fr: 'questions-couple', en: 'couple-questions', es: 'preguntas-pareja', de: 'fragen-fuer-paare', it: 'domande-coppia', nl: 'vragen-voor-koppels' },
  legalMentions: { fr: 'mentions-legales', en: 'legal-notice', es: 'aviso-legal', de: 'impressum', it: 'note-legali', nl: 'juridische-informatie' },
  privacy: { fr: 'confidentialite', en: 'privacy-policy', es: 'politica-privacidad', de: 'datenschutz', it: 'privacy', nl: 'privacybeleid' },
  blog: { fr: 'blog', en: 'blog', es: 'blog', de: 'blog', it: 'blog', nl: 'blog' },
  quizAdo: { fr: 'quiz-couple-ado', en: 'teen-couple-quiz', es: 'quiz-pareja-adolescentes', de: 'teenager-paar-quiz', it: 'quiz-coppia-adolescenti', nl: 'liefdesquiz-voor-tieners' },
  testParentalite: { fr: 'test-parentalite-couple', en: 'parenthood-readiness-test', es: 'test-parentalidad-pareja', de: 'elternschafts-bereitschaftstest', it: 'test-genitorialita-coppia', nl: 'klaar-voor-een-baby-test' },
  testEmmenager: { fr: 'test-habiter-vivre-ensemble', en: 'moving-in-together-test', es: 'test-vivir-juntos-pareja', de: 'zusammenziehen-test-paare', it: 'test-andare-a-vivere-insieme', nl: 'samenwonen-test' },
  testAstroPrenoms: { fr: 'signes-astrologiques-prenoms-compatibilite', en: 'zodiac-signs-names-compatibility', es: 'signos-astrologicos-nombres-compatibilidad', de: 'sternzeichen-vornamen-kompatibilitaet', it: 'segni-zodiacali-nomi-compatibilita', nl: 'sterrenbeelden-match' },
  calculatriceAmour: { fr: 'calculatrice-de-l-amour', en: 'love-calculator', es: 'calculadora-del-amor', de: 'liebesrechner', it: 'calcolatrice-dell-amore', nl: 'liefdestest' },
  compteurCouple: { fr: 'compteur-de-couple', en: 'relationship-counter', es: 'contador-de-pareja', de: 'beziehungszaehler', it: 'contatore-di-coppia', nl: 'hoe-lang-zijn-we-samen' },
  // Le bilan de couple payant (docs/bilan/CONCEPTION.md). Les mêmes adresses
  // sont écrites dans CHEMINS de supabase/functions/_shared/bilan/serveur.mjs
  // (le retour de Stripe), un test vérifie qu'elles ne divergent pas.
  bilanCouple: { fr: 'evaluation-de-couple', en: 'relationship-assessment', es: 'evaluacion-de-pareja', de: 'beziehungsanalyse', it: 'valutazione-di-coppia', nl: 'relatiecheck' },
  cgv: { fr: 'conditions-generales-de-vente', en: 'terms-of-sale', es: 'condiciones-generales-de-venta', de: 'agb', it: 'condizioni-generali-di-vendita', nl: 'algemene-voorwaarden' },
  testSignesChinois: { fr: 'compatibilite-amoureuse-signes-chinois', en: 'chinese-zodiac-love-compatibility', es: 'compatibilidad-amorosa-signos-chinos', de: 'chinesische-sternzeichen-liebeskompatibilitaet', it: 'compatibilita-amorosa-segni-cinesi', nl: 'chinese-sterrenbeelden-liefde' },
  testDateNaissance: { fr: 'compatibilite-amoureuse-date-de-naissance', en: 'birth-date-love-compatibility', es: 'compatibilidad-amorosa-fecha-de-nacimiento', de: 'liebeskompatibilitaet-geburtsdatum', it: 'compatibilita-amorosa-data-di-nascita', nl: 'compatibiliteit-geboortedatum' },
  testJalousie: { fr: 'test-jalousie-couple', en: 'jealousy-test-couple', es: 'test-celos-pareja', de: 'eifersucht-test-paar', it: 'test-gelosia-coppia', nl: 'jaloezie-test' },
  testKarmique: { fr: 'test-relation-karmique', en: 'karmic-relationship-test', es: 'test-relacion-karmica', de: 'karmische-beziehung-test', it: 'test-relazione-karmica', nl: 'karmische-relatie-test' },
  testSuisJeAmoureux: { fr: 'test-suis-je-amoureux', en: 'am-i-in-love-test', es: 'test-estoy-enamorado', de: 'bin-ich-verliebt-test', it: 'test-sono-innamorato', nl: 'ben-ik-verliefd-test' },
  // Le test ame soeur ouvre en francais seulement, le temps que ses deux
  // series de questions soient traduites.
  testAmeSoeur: { fr: 'test-ame-soeur', en: 'soulmate-test', es: 'test-alma-gemela', de: 'seelenverwandtschaft-test', it: 'test-anima-gemella', nl: 'zielsverwant-test' },
  jeuActionVerite: { fr: 'jeu-action-ou-verite-couple', en: 'truth-or-dare-couple-game', es: 'juego-verdad-o-reto-pareja', de: 'wahrheit-oder-pflicht-paar', it: 'gioco-obbligo-o-verita-coppia', nl: 'waarheid-of-durven-koppels' },
  jeuActionVeriteHot: { fr: 'action-ou-verite-coquin', en: 'dirty-truth-or-dare-couples', es: 'verdad-o-reto-picante-pareja', de: 'wahrheit-oder-pflicht-versaut', it: 'obbligo-o-verita-piccante-coppia', nl: 'waarheid-of-durven-18' },
  jeuxCouple: { fr: 'jeux-de-couple', en: 'couple-games', es: 'juegos-para-parejas', de: 'paarspiele', it: 'giochi-di-coppia', nl: 'spelletjes-voor-koppels' },
  jeuGages: { fr: 'gage-couple', en: 'couple-forfeits-wheel', es: 'prendas-para-parejas', de: 'pfaender-fuer-paare', it: 'penitenze-di-coppia', nl: 'opdrachten-voor-koppels' },
  jeuPlateau: { fr: 'jeu-de-plateau-couple', en: 'couple-board-game', es: 'juego-de-mesa-para-parejas', de: 'brettspiel-fuer-paare', it: 'gioco-da-tavolo-di-coppia', nl: 'bordspel-voor-koppels' },
  jeuQuiDeNous: { fr: 'qui-de-nous-deux', en: 'which-one-of-us-couple-game', es: 'quien-de-los-dos-pareja', de: 'wer-von-uns-beiden-paarspiel', it: 'chi-di-noi-due-coppia', nl: 'wie-van-ons-twee' },
  quizGenant: { fr: 'quiz-couple-genant', en: 'embarrassing-couple-quiz', es: 'quiz-pareja-vergonzoso', de: 'peinliches-paar-quiz', it: 'quiz-coppia-imbarazzante', nl: 'genante-vragen' },
  testLangageAmour: { fr: 'test-langage-amour-couple', en: 'love-language-test-couple', es: 'test-lenguaje-amor-pareja', de: 'liebessprache-test-paar', it: 'test-linguaggio-amore-coppia', nl: 'liefdestaal-test' },
  testPersonnalite: { fr: 'test-personnalite-couple', en: 'love-personality-test', es: 'test-personalidad-amorosa', de: 'liebespersoenlichkeit-test', it: 'test-personalita-amorosa', nl: 'persoonlijkheidstest-liefde' },
  quizTuPreferes: { fr: 'tu-preferes-couple-quiz', en: 'would-you-rather-couple-quiz', es: 'quiz-preferirias-pareja', de: 'was-wuerdest-du-lieber-paar-quiz', it: 'preferiresti-quiz-coppia', nl: 'zou-je-liever-vragen' },
  quizVraiFaux: { fr: 'quiz-vrai-ou-faux', en: 'true-or-false-couple-quiz', es: 'quiz-verdadero-o-falso-pareja', de: 'richtig-oder-falsch-paar-quiz', it: 'quiz-vero-o-falso-coppia', nl: 'waar-of-niet-waar-quiz' },
  testAttachement: { fr: 'test-style-attachement-couple', en: 'attachment-style-test', es: 'test-estilo-apego', de: 'bindungsstil-test', it: 'test-stile-attaccamento', nl: 'hechtingsstijl-test' },
  testDependance: { fr: 'test-dependance-affective', en: 'emotional-dependency-test', es: 'test-dependencia-emocional', de: 'emotionale-abhaengigkeit-test', it: 'test-dipendenza-affettiva', nl: 'emotionele-afhankelijkheid-test' },
  testConfiance: { fr: 'test-confiance-couple', en: 'trust-test-couple', es: 'test-confianza-pareja', de: 'vertrauenstest-paar', it: 'test-fiducia-coppia', nl: 'vertrouwen-relatie-test' },
  testInfidelite: { fr: 'test-infidelite-couple', en: 'infidelity-test-couple', es: 'test-infidelidad-pareja', de: 'untreue-test-paar', it: 'test-infedelta-coppia', nl: 'gaat-mijn-partner-vreemd' },
  testCouche: { fr: 'savoir-s-il-elle-a-couche-avec-un-autre', en: 'has-he-she-slept-with-someone-else-test', es: 'test-se-ha-acostado-con-otra-persona', de: 'hat-er-sie-mit-jemand-anderem-geschlafen', it: 'e-andato-a-letto-con-un-altro-test', nl: 'met-iemand-anders-geslapen' },
  testSecret: { fr: 'test-m-aime-t-il-elle-en-secret', en: 'does-he-she-secretly-love-me-test', es: 'test-me-quiere-en-secreto', de: 'liebt-er-sie-mich-heimlich-test', it: 'mi-ama-in-segreto-test', nl: 'stiekem-verliefd-op-mij' },
  testDistanceAime: { fr: 'relation-a-distance-m-aime-t-il-encore', en: 'long-distance-does-he-she-still-love-me-test', es: 'relacion-a-distancia-me-sigue-queriendo', de: 'fernbeziehung-liebt-er-sie-mich-noch', it: 'relazione-a-distanza-mi-ama-ancora', nl: 'houdt-hij-van-mij-op-afstand' },
  testEx: { fr: 'mon-ex-pense-t-il-elle-encore-a-moi', en: 'does-my-ex-still-think-about-me', es: 'mi-ex-todavia-piensa-en-mi', de: 'denkt-mein-ex-noch-an-mich', it: 'il-mio-ex-pensa-ancora-a-me', nl: 'denkt-mijn-ex-nog-aan-mij' },
  // Les tests « ex » (28 octobre 2026, Thomas : « on a encore aucun test en
  // rapport avec les ex ») : l'amour ou le manque, puis le temps qu'il faudra.
  testEncoreAmoureuxEx: { fr: 'test-suis-je-encore-amoureux-de-mon-ex', en: 'am-i-still-in-love-with-my-ex-quiz', es: 'test-sigo-enamorado-de-mi-ex', de: 'bin-ich-noch-in-meinen-ex-verliebt-test', it: 'test-sono-ancora-innamorato-del-mio-ex', nl: 'nog-verliefd-op-mijn-ex' },
  testOublierEx: { fr: 'combien-de-temps-pour-oublier-son-ex', en: 'how-long-to-get-over-an-ex-test', es: 'cuanto-tiempo-se-tarda-en-olvidar-a-un-ex', de: 'wie-lange-dauert-es-ueber-den-ex-hinwegzukommen', it: 'quanto-tempo-ci-vuole-per-dimenticare-un-ex', nl: 'over-je-ex-heen-komen' },
  // Lot 2 : les chances d'un retour, puis la question de s'y remettre.
  testExRevenir: { fr: 'test-mon-ex-va-t-il-revenir', en: 'will-my-ex-come-back-quiz', es: 'test-mi-ex-volvera', de: 'kommt-mein-ex-zurueck-test', it: 'test-il-mio-ex-tornera', nl: 'komt-mijn-ex-terug' },
  testRemettreEx: { fr: 'dois-je-me-remettre-avec-mon-ex', en: 'should-i-get-back-with-my-ex-quiz', es: 'test-debo-volver-con-mi-ex', de: 'soll-ich-zu-meinem-ex-zurueck-test', it: 'test-devo-tornare-con-il-mio-ex', nl: 'terug-naar-mijn-ex' },
  // Lot 3 : l'ex de son partenaire (tests de couple), puis pourquoi c'est fini.
  testOublieSonEx: { fr: 'test-a-t-il-oublie-son-ex', en: 'is-he-over-his-ex-quiz', es: 'test-ha-olvidado-a-su-ex', de: 'ist-er-ueber-seine-ex-hinweg-test', it: 'test-ha-dimenticato-la-sua-ex', nl: 'is-hij-over-zijn-ex-heen' },
  testPourquoiQuitte: { fr: 'pourquoi-mon-ex-m-a-quitte', en: 'why-did-my-ex-break-up-with-me-quiz', es: 'test-por-que-me-dejo-mi-ex', de: 'warum-hat-mein-ex-schluss-gemacht-test', it: 'test-perche-il-mio-ex-mi-ha-lasciato', nl: 'waarom-heeft-mijn-ex-het-uitgemaakt' },
  testAimeEncore: { fr: 'test-m-aime-t-il-encore', en: 'does-he-she-still-love-me-test', es: 'test-me-sigue-queriendo', de: 'liebt-er-sie-mich-noch-test', it: 'mi-ama-ancora-test', nl: 'houdt-hij-nog-van-mij' },
  testEmprise: { fr: 'test-emprise-psychologique', en: 'coercive-control-test', es: 'test-manipulacion-psicologica-pareja', de: 'psychische-kontrolle-beziehung-test', it: 'test-manipolazione-psicologica-coppia', nl: 'controlerende-relatie-test' },
  testTrouverAmour: { fr: 'test-pourquoi-je-ne-trouve-pas-l-amour', en: 'why-cant-i-find-love-test', es: 'test-por-que-no-encuentro-el-amor', de: 'warum-finde-ich-keine-liebe-test', it: 'test-perche-non-trovo-l-amore', nl: 'waarom-vind-ik-geen-liefde' },
  testCelibataire: { fr: 'test-pourquoi-suis-je-celibataire', en: 'why-am-i-still-single-test', es: 'test-por-que-sigo-soltero', de: 'warum-bin-ich-noch-single-test', it: 'test-perche-sono-ancora-single', nl: 'waarom-ben-ik-nog-single' },
  testCoupleOuCelibat: { fr: 'test-couple-ou-celibat', en: 'single-life-or-relationship-test', es: 'test-pareja-o-solteria', de: 'beziehung-oder-single-test', it: 'test-coppia-o-single', nl: 'single-of-relatie-test' },
  testCompatSexuelle: { fr: 'test-compatibilite-sexuelle', en: 'sexual-compatibility-test', es: 'test-compatibilidad-sexual', de: 'sexuelle-kompatibilitaet-test', it: 'test-compatibilita-sessuale', nl: 'seksuele-compatibiliteit-test' },
  testEstCeLeBon: { fr: 'test-est-ce-le-bon-ou-la-bonne', en: 'is-this-the-one-test', es: 'test-es-la-persona-adecuada', de: 'ist-es-die-richtige-person-test', it: 'test-e-la-persona-giusta', nl: 'is-hij-de-ware' },
  testPretRelation: { fr: 'test-pret-pour-une-nouvelle-relation', en: 'ready-for-a-new-relationship-test', es: 'test-preparado-para-una-nueva-relacion', de: 'bereit-fuer-eine-neue-beziehung-test', it: 'test-pronto-per-una-nuova-relazione', nl: 'klaar-voor-een-nieuwe-relatie' },
  testDureeCelibat: { fr: 'combien-de-temps-je-vais-rester-celibataire', en: 'how-long-will-i-be-single-test', es: 'test-cuanto-tiempo-voy-a-estar-soltero', de: 'wie-lange-bleibe-ich-noch-single-test', it: 'test-quanto-tempo-restero-single', nl: 'hoe-lang-blijf-ik-nog-single' },
  testAmourAmi: { fr: 'test-amour-meilleur-ami', en: 'in-love-with-my-best-friend-test', es: 'test-enamorado-de-mi-mejor-amigo', de: 'in-besten-freund-verliebt-test', it: 'test-innamorato-del-migliore-amico', nl: 'verliefd-op-je-beste-vriend' },
  testChargeMentale: { fr: 'test-charge-mentale-couple', en: 'mental-load-test-couples', es: 'test-carga-mental-pareja', de: 'mental-load-test-paare', it: 'test-carico-mentale-coppia', nl: 'mentale-belasting-test' },
  quizRencontre: { fr: 'questions-premier-rendez-vous', en: 'first-date-questions-game', es: 'preguntas-primera-cita', de: 'fragen-erstes-date', it: 'domande-primo-appuntamento', nl: 'vragen-eerste-date' },
  zamours: { fr: 'quiz-couple-les-zamours' },
  testVacances: { fr: 'test-ou-partir-en-vacances' },
  jeuDilemmes: { fr: 'dilemmes-couple', en: 'couple-dilemmas-game', es: 'dilemas-de-pareja', de: 'dilemmata-fuer-paare', it: 'dilemmi-di-coppia', nl: 'dilemmas-voor-koppels' },
  testAmourAmitie: { fr: 'test-amour-ou-amitie', en: 'love-or-friendship-test', es: 'test-amor-o-amistad', de: 'liebe-oder-freundschaft-test', it: 'test-amore-o-amicizia', nl: 'liefde-of-vriendschap-test' },
  testCrush: { fr: 'test-amour-ou-crush', en: 'love-or-crush-test', es: 'test-amor-o-crush', de: 'liebe-oder-crush-test', it: 'test-amore-o-cotta', nl: 'crush-test' },
  testFinCouple: { fr: 'test-est-ce-la-fin-de-mon-couple', en: 'is-my-relationship-over-test', es: 'test-es-el-final-de-mi-relacion', de: 'ist-meine-beziehung-am-ende-test', it: 'test-e-la-fine-della-mia-relazione', nl: 'is-mijn-relatie-voorbij' },
  pourContre: { fr: 'quiz-pour-contre-couple', en: 'for-or-against-couple-game', es: 'juego-a-favor-o-en-contra-pareja', de: 'dafuer-oder-dagegen-paarspiel', it: 'gioco-pro-o-contro-coppia', nl: 'voor-of-tegen-stellingen' },
  jeuJamais: { fr: 'je-nai-jamais-jeu-couple', en: 'never-have-i-ever-couples-game', es: 'yo-nunca-juego-pareja', de: 'ich-hab-noch-nie-paar-spiel', it: 'non-ho-mai-gioco-coppia', nl: 'ik-heb-nog-nooit-vragen' },
  jeuQuiPourrait: { fr: 'qui-pourrait-couple', en: 'who-could-couples-game', es: 'quien-podria-juego-pareja', de: 'wer-koennte-paar-spiel', it: 'chi-potrebbe-gioco-coppia', nl: 'wie-zou-eerder-vragen' },
  jeuOuiNon: { fr: 'jeu-oui-non-couple', en: 'yes-or-no-couples-game', es: 'juego-si-o-no-pareja', de: 'ja-oder-nein-paar-spiel', it: 'gioco-si-o-no-coppia', nl: 'ja-of-nee-vragen' },
  jeuPhrases: { fr: 'phrases-a-completer-couple', en: 'finish-the-sentence-couples-game', es: 'frases-para-completar-pareja', de: 'satz-vervollstaendigen-paarspiel', it: 'frasi-da-completare-coppia', nl: 'maak-de-zin-af' },
  jeuDixMais: { fr: 'jeu-c-est-un-10-mais', en: 'hes-a-10-but-game', es: 'juego-es-un-10-pero', de: 'er-ist-eine-10-aber-spiel', it: 'gioco-e-un-10-ma', nl: 'hij-is-een-10-maar' },
  // Le jeu de soirée pour couples (27 octobre 2026) : à plusieurs couples,
  // chacun sur son téléphone, un maître du jeu. Positionné sur « jeu de
  // soirée couples ».
  jeuSoireeCouples: { fr: 'jeu-de-soiree-couples', en: 'couples-party-game', es: 'juego-de-fiesta-para-parejas', de: 'partyspiel-fuer-paare', it: 'gioco-da-serata-per-coppie', nl: 'partyspel-voor-koppels' },
  // Les quiz spéciaux de saison (16 octobre 2026) : le hub, puis les cinq quiz
  // d'Halloween. Le hub n'a pas de préfixe « quiz » dans sa clé : il n'est pas
  // une page jouable (pas de moteur, pas d'avis, pas de compteur).
  speciauxCouple: { fr: 'quiz-speciaux-pour-couple', en: 'special-couple-quizzes', es: 'quiz-especiales-para-parejas', de: 'besondere-paar-quiz', it: 'quiz-speciali-per-coppie', nl: 'themaquiz-voor-koppels' },
  quizSerialKiller: { fr: 'quiz-serial-killer-compatible', en: 'which-serial-killer-are-you-compatible-with-quiz', es: 'quiz-con-que-asesino-en-serie-eres-compatible', de: 'quiz-welcher-serienmoerder-passt-zu-dir', it: 'quiz-quale-serial-killer-e-compatibile-con-te', nl: 'seriemoordenaar-quiz' },
  quizMortFilmHorreur: { fr: 'quiz-qui-meurt-en-premier-film-horreur', en: 'who-dies-first-in-a-horror-movie-quiz', es: 'quiz-quien-muere-primero-pelicula-de-terror', de: 'quiz-wer-stirbt-zuerst-im-horrorfilm', it: 'quiz-chi-muore-per-primo-nel-film-horror', nl: 'wie-gaat-als-eerste-dood' },
  quizPossession: { fr: 'quiz-qui-pourrait-se-faire-posseder', en: 'who-would-get-possessed-quiz', es: 'quiz-quien-podria-ser-poseido', de: 'quiz-wer-wuerde-besessen-werden', it: 'quiz-chi-potrebbe-essere-posseduto', nl: 'wie-wordt-bezeten-quiz' },
  quizSuperVilain: { fr: 'quiz-quel-super-vilain-es-tu', en: 'which-supervillain-are-you-quiz', es: 'quiz-que-supervillano-eres', de: 'quiz-welcher-superschurke-bist-du', it: 'quiz-quale-supercattivo-sei', nl: 'welke-superschurk-ben-jij' },
  quizDuoVilains: { fr: 'quiz-quel-duo-de-super-vilains-formez-vous', en: 'which-supervillain-duo-are-you-quiz', es: 'quiz-que-duo-de-supervillanos-formais', de: 'quiz-welches-superschurken-duo-seid-ihr', it: 'quiz-quale-duo-di-supercattivi-siete', nl: 'welk-superschurkenduo-zijn-jullie' },
  quizTentation: { fr: 'quiz-ile-de-la-tentation', en: 'temptation-island-quiz', es: 'quiz-la-isla-de-las-tentaciones', de: 'temptation-island-quiz', it: 'quiz-temptation-island', nl: 'temptation-island-quiz' },
  admin: { fr: 'admin', en: 'admin', es: 'admin', de: 'admin', it: 'admin', nl: 'admin' },
  contact: { fr: 'contact', en: 'contact', es: 'contacto', de: 'kontakt', it: 'contatto', nl: 'contact' },
  about: { fr: 'qui-sommes-nous', en: 'about-us', es: 'quienes-somos', de: 'ueber-uns', it: 'chi-siamo', nl: 'over-ons' },
  customQuiz: { fr: 'creation-quiz-personnalise', en: 'create-your-own-quiz', es: 'crear-tu-propio-quiz', de: 'eigenes-quiz-erstellen', it: 'crea-il-tuo-quiz', nl: 'maak-je-eigen-quiz' },
  sitemap: { fr: 'plan-du-site', en: 'sitemap', es: 'mapa-del-sitio', de: 'seitenverzeichnis', it: 'mappa-del-sito', nl: 'sitemap' },
  ebookConfirm: { fr: 'confirmation-ebook' },
};

// L'image de partage du site (27 octobre 2026) : og:image de l'accueil et de
// toute page sans image de tête, une par langue, public/og/<fichier>-<lang>.jpg,
// dessinée par build/image-partage.mjs (les mascottes et « Quiz, tests et
// jeux pour les couples »). Pour une nouvelle image, on change `fichier` :
// les réseaux gardent en cache l'image d'une adresse déjà vue.
export const IMAGE_PARTAGE = {
  fichier: 'quiz-couple',
  alt: {
    fr: "Les deux mascottes de Quiz Couple, l'une rose et l'autre violette, avec le texte « Quiz, tests et jeux pour les couples »",
    en: 'The two Quiz Couple mascots, one pink and one purple, with the words “Quizzes, tests and games for couples”',
    es: 'Las dos mascotas de Quiz Couple, una rosa y otra morada, con el texto «Quiz, tests y juegos para parejas»',
    de: 'Die beiden Maskottchen von Quiz Couple, eines rosa und eines lila, mit dem Text „Quiz, Tests und Spiele für Paare“',
    it: 'Le due mascotte di Quiz Couple, una rosa e una viola, con la scritta «Quiz, test e giochi per coppie»',
  },
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
  testRedFlag:       { file: 'red-flag-loupe',            old: null,                  alt: { fr: "La mascotte rose, l'air sceptique, examine à la loupe la mascotte violette qui sourit avec des cœurs dans les yeux, entourée de petits drapeaux rouges plantés dans le sol", en: 'The pink mascot, looking sceptical, inspects with a magnifying glass the purple mascot, who smiles with hearts in its eyes, surrounded by little red flags planted in the ground', es: 'La mascota rosa, con cara de escéptica, examina con una lupa a la mascota morada, que sonríe con corazones en los ojos, rodeada de banderitas rojas clavadas en el suelo', de: 'Das rosa Maskottchen schaut skeptisch durch eine Lupe auf das lila Maskottchen, das mit Herzen in den Augen lächelt, umgeben von kleinen roten Fahnen im Boden', it: 'La mascotte rosa, con aria scettica, esamina con una lente la mascotte viola che sorride con i cuori negli occhi, circondata da piccole bandierine rosse piantate nel terreno' } },
  testPervers:       { file: 'masquerade-mask',           old: null,                  alt: { fr: 'Masque de théâtre blanc à deux visages sur fond sombre, symbole de la double personnalité', en: 'White two-faced theatre mask on a dark background, symbol of a double personality', es: 'Máscara de teatro blanca de dos caras sobre fondo oscuro, símbolo de la doble personalidad', de: 'Weiße zweigesichtige Theatermaske auf dunklem Hintergrund, Symbol der Doppelpersönlichkeit', it: 'Maschera teatrale bianca a due volti su sfondo scuro, simbolo della doppia personalità' } },
  testAmourHabitude:  { file: 'two-slippers-bed',            old: null,                  alt: { fr: "Deux paires de chaussons côte à côte au pied d'un lit fait, une rose et une lavande, dans la lumière du matin", en: "Two pairs of slippers side by side at the foot of a made bed, one pink and one lavender, in the morning light", es: "Dos pares de pantuflas una junto a la otra al pie de una cama hecha, unas rosas y otras lavanda, con la luz de la mañana", de: "Zwei Paar Hausschuhe nebeneinander am Fußende eines gemachten Betts, eines rosa und eines lavendelfarben, im Morgenlicht", it: "Due paia di pantofole affiancate ai piedi di un letto rifatto, un paio rosa e uno lavanda, nella luce del mattino" } },
  testAmourAttachement: { file: 'amour-ou-attachement',   old: null,                  alt: { fr: "Une rose ancienne rose poudré posée sur du lin clair, à côté d'un cordon de coton lavande enroulé et noué serré", en: 'A dusty pink garden rose lying on pale linen, next to a coiled lavender cotton cord tied in a tight knot', es: 'Una rosa de jardín rosa empolvado sobre lino claro, junto a un cordón de algodón lavanda enrollado y atado con un nudo apretado', de: 'Eine altrosa Gartenrose auf hellem Leinen, daneben eine aufgerollte lavendelfarbene Baumwollkordel mit einem festen Knoten', it: 'Una rosa da giardino rosa antico posata su lino chiaro, accanto a un cordone di cotone lavanda arrotolato e stretto in un nodo' } },
  testJeLaimeEncore: { file: 'je-l-aime-encore',           old: null,                  alt: { fr: "Une bougie rose consumée presque jusqu'au bout, encore allumée d'une petite flamme, sur une coupelle lavande, avec une allumette usagée posée à côté", en: 'A pink candle burned down almost to its base, still lit with a small flame, on a lavender saucer, a spent match lying beside it', es: 'Una vela rosa consumida casi hasta la base, aún encendida con una llama pequeña, sobre un platito lavanda, con una cerilla gastada al lado', de: 'Eine fast bis zum Boden abgebrannte rosa Kerze, noch mit kleiner Flamme, auf einem lavendelfarbenen Tellerchen, daneben ein abgebranntes Streichholz', it: 'Una candela rosa consumata quasi fino alla base, ancora accesa con una piccola fiamma, su un piattino lavanda, con un fiammifero usato accanto' } },
  testCoupleSain:    { file: 'healthy-plant-heart',       old: 'test-couple-sain',    alt: { fr: 'Plante verte luxuriante en forme de cœur près d\'une fenêtre', en: 'Lush green heart-shaped plant by a sunny window', es: 'Planta verde con forma de corazón junto a una ventana', de: 'Üppige herzförmige grüne Pflanze am sonnigen Fenster', it: 'Rigogliosa pianta verde a forma di cuore vicino a una finestra' } },
  testMariage:       { file: 'wedding-chapel-rings',      old: 'test-mariage',        alt: { fr: "Deux alliances dorées devant l'autel d'une chapelle de mariage", en: 'Two golden wedding rings before a wedding chapel altar', es: 'Dos anillos de boda dorados ante el altar de una capilla', de: 'Zwei goldene Eheringe vor dem Altar einer Hochzeitskapelle', it: "Due fedi nuziali dorate davanti all'altare di una cappella" } },
  testDivorce:       { file: 'divorce-rings-papers',      old: 'test-divorce',        alt: { fr: 'Deux alliances séparées sur un document déchiré', en: 'Two wedding rings apart on a torn document', es: 'Dos anillos de boda separados sobre un documento roto', de: 'Zwei getrennte Eheringe auf einem zerrissenen Dokument', it: 'Due fedi separate su un documento strappato' } },
  quizAmoureux:       { file: 'paper-hearts-string',         old: 'quiz-amoureux',       alt: { fr: "Deux cœurs en papier, un rose et un lavande, accrochés ensemble par une petite pince en bois sur une ficelle tendue", en: "Two paper hearts, one pink and one lavender, pinned together with a small wooden clothespin on a taut string", es: "Dos corazones de papel, uno rosa y otro lavanda, sujetos juntos con una pequeña pinza de madera en un cordel tenso", de: "Zwei Papierherzen, eines rosa und eines lavendelfarben, mit einer kleinen Holzklammer gemeinsam an eine gespannte Schnur geheftet", it: "Due cuori di carta, uno rosa e uno lavanda, appesi insieme con una piccola molletta di legno a uno spago teso" } },
  quizTypeCouple:    { file: 'couple-type-puzzle',       old: null,                  alt: { fr: "Deux grandes pièces de puzzle en bois de formes différentes, une rose et une lavande, emboîtées au centre d'une nappe en lin", en: "Two large wooden jigsaw pieces of different shapes, one pink and one lavender, locked together in the centre of a linen tablecloth", es: "Dos grandes piezas de puzle de madera de formas distintas, una rosa y otra lavanda, encajadas en el centro de un mantel de lino", de: "Zwei große Holzpuzzleteile in unterschiedlichen Formen, eines rosa und eines lavendelfarben, in der Mitte einer Leinentischdecke ineinandergesteckt", it: "Due grandi pezzi di puzzle in legno di forme diverse, uno rosa e uno lavanda, incastrati al centro di una tovaglia di lino" } },
  quizCoquin:        { file: 'naughty-date-night',        old: 'quiz-coquin',         alt: { fr: 'Ambiance romantique : deux coupes de champagne, pétales et bougie sur un lit', en: 'Romantic setting: two champagne glasses, petals and a candle on a bed', es: 'Ambiente romántico: dos copas de champán, pétalos y una vela', de: 'Romantische Szene: zwei Sektgläser, Rosenblätter und eine Kerze', it: 'Atmosfera romantica: due calici di champagne, petali e una candela' } },
  quizMarrant:       { file: 'fun-confetti',              old: 'quiz-marrant',        alt: { fr: 'Confettis colorés et ballons de fête qui explosent', en: 'Colorful confetti and party balloons bursting', es: 'Confeti colorido y globos de fiesta estallando', de: 'Buntes Konfetti und platzende Partyballons', it: 'Coriandoli colorati e palloncini di festa che esplodono' } },
  quizKnowledge:     { file: 'knowledge-lightbulb-heart', old: 'quiz-knowledge',      alt: { fr: 'Ampoule vintage dont le filament forme un petit cœur rouge', en: 'Vintage lightbulb with a filament shaped like a red heart', es: 'Bombilla vintage con filamento en forma de corazón rojo', de: 'Vintage-Glühbirne mit herzförmigem roten Glühfaden', it: 'Lampadina vintage con filamento a forma di cuore rosso' } },
  quizMost:          { file: 'most-likely-trophy',        old: 'quiz-most',           alt: { fr: 'Trophée doré orné d\'un cœur rouge sous une pluie de confettis', en: 'Golden trophy with a red heart under falling confetti', es: 'Trofeo dorado con un corazón rojo bajo confeti', de: 'Goldener Pokal mit rotem Herz unter fallendem Konfetti', it: 'Trofeo dorato con un cuore rosso sotto i coriandoli' } },
  questionsCouple:    { file: 'question-cards-fan',          old: null,                  alt: { fr: "Un éventail de cartes pastel vierges, roses, lavande et crème, étalées sur une nappe en lin, une carte légèrement soulevée", en: "A fan of blank pastel cards in pink, lavender and cream spread on a linen tablecloth, one card slightly lifted", es: "Un abanico de tarjetas pastel en blanco, rosas, lavanda y crema, extendidas sobre un mantel de lino, con una tarjeta ligeramente levantada", de: "Ein Fächer leerer Pastellkarten in Rosa, Lavendel und Creme auf einer Leinentischdecke, eine Karte leicht angehoben", it: "Un ventaglio di carte pastello bianche, rosa, lavanda e crema, sparse su una tovaglia di lino, con una carta leggermente sollevata" } },
  quizAdo:           { file: 'teen-polaroids',            old: 'quiz-ado',            alt: { fr: "Bracelets d'amitié et photos polaroïd sur un bureau", en: 'Friendship bracelets and polaroid photos on a desk', es: 'Pulseras de la amistad y fotos polaroid sobre un escritorio', de: 'Freundschaftsbänder und Polaroidfotos auf einem Schreibtisch', it: "Braccialetti dell'amicizia e foto polaroid su una scrivania" } },
  testParentalite:   { file: 'baby-shoes-toys',          old: 'test-parentalite',    alt: { fr: 'Petits chaussons de bébé et jouets en bois sur une couverture', en: 'Tiny baby shoes and wooden toys on a blanket', es: 'Pequeños zapatos de bebé y juguetes de madera sobre una manta', de: 'Winzige Babyschuhe und Holzspielzeug auf einer Decke', it: 'Scarpine da neonato e giochi di legno su una coperta' } },
  testEmmenager:     { file: 'moving-in-boxes',          old: null,                  alt: { fr: 'Cartons de déménagement dans un appartement lumineux et vide', en: 'Moving boxes in a bright empty apartment', es: 'Cajas de mudanza en un apartamento luminoso y vacío', de: 'Umzugskartons in einer hellen leeren Wohnung', it: 'Scatole per il trasloco in un appartamento luminoso e vuoto' } },
  calculatriceAmour: { file: 'love-calculator-hearts', old: null, alt: {"fr": "Petite machine à calculer ancienne sur une nappe de lin, un ruban de papier terminé par un cœur rose", "en": "A small vintage adding machine on a linen tablecloth, its paper ribbon ending in a pink paper heart", "es": "Pequeña máquina de calcular antigua sobre un mantel de lino, con una cinta de papel que termina en un corazón rosa", "de": "Kleine alte Rechenmaschine auf einer Leinendecke, deren Papierstreifen in einem rosa Herz endet", "it": "Piccola macchina da calcolo d'epoca su una tovaglia di lino, con un nastro di carta che termina in un cuore rosa"} },
  bilanCouple: { file: 'couple-check-up', old: null, alt: {"fr": "Deux petits carnets ouverts côte à côte sur une nappe de lin, l'un rose et l'autre lavande, chacun avec son stylo et une liste de cases vides, deux tasses de thé derrière", "en": "Two small open notebooks side by side on a linen tablecloth, one pink and one lavender, each with its own pen and a list of empty tick boxes, two cups of tea behind", "es": "Dos libretas abiertas una al lado de la otra sobre un mantel de lino, una rosa y otra lavanda, cada una con su bolígrafo y una lista de casillas vacías, dos tazas de té detrás", "de": "Zwei kleine aufgeschlagene Notizbücher nebeneinander auf einer Leinentischdecke, eines rosa und eines lavendelfarben, jedes mit eigenem Stift und einer Liste leerer Kästchen, dahinter zwei Tassen Tee", "it": "Due piccoli quaderni aperti uno accanto all'altro su una tovaglia di lino, uno rosa e uno lavanda, ciascuno con la sua penna e un elenco di caselle vuote, due tazze di tè dietro"} },
  compteurCouple: { file: 'couple-day-counter', old: null, alt: {"fr": "Un grand bocal en verre rempli de centaines de petits cœurs en papier rose et lilas, quelques-uns tombés sur la nappe de lin, deux tasses de café côte à côte", "en": "A tall glass jar filled with hundreds of tiny pink and lilac paper hearts, a few spilled on the linen tablecloth, two coffee cups side by side", "es": "Un gran tarro de cristal lleno de cientos de pequeños corazones de papel rosa y lila, algunos caídos sobre el mantel de lino, dos tazas de café juntas", "de": "Ein hohes Glas voll mit hunderten kleinen Papierherzen in Rosa und Lila, ein paar auf die Leinentischdecke gefallen, zwei Kaffeetassen nebeneinander", "it": "Un grande barattolo di vetro pieno di centinaia di piccoli cuori di carta rosa e lilla, alcuni caduti sulla tovaglia di lino, due tazzine da caffè affiancate"} },
  testAstroPrenoms:  { file: 'zodiac-astrology',          old: 'test-astro-prenoms',  alt: { fr: 'Carte astrologique avec les constellations dorées du zodiaque', en: 'Astrology chart with golden zodiac constellations', es: 'Carta astrológica con constelaciones doradas del zodiaco', de: 'Astrologie-Karte mit goldenen Sternzeichen-Konstellationen', it: 'Carta astrologica con costellazioni dorate dello zodiaco' } },
  testSignesChinois: { file: 'chinese-zodiac-wheel',    old: null,                  alt: { fr: "Sur une soie rouge, une roue du zodiaque chinois en bois sculpté avec ses douze animaux, deux petits jetons de laque rouge reliés par un fil rouge posés au centre, quelques pétales de prunier", en: "On red silk, a carved wooden Chinese zodiac wheel with its twelve animals, two small red lacquer tokens tied together by a red thread resting at the centre, a few plum blossom petals", es: "Sobre una seda roja, una rueda del zodiaco chino de madera tallada con sus doce animales, dos pequeñas fichas de laca roja unidas por un hilo rojo en el centro, algunos pétalos de ciruelo", de: "Auf roter Seide ein geschnitztes Holzrad des chinesischen Tierkreises mit seinen zwölf Tieren, in der Mitte zwei kleine rote Lackplättchen, durch einen roten Faden verbunden, ein paar Pflaumenblütenblätter", it: "Su una seta rossa, una ruota dello zodiaco cinese in legno intagliato con i suoi dodici animali, due piccoli gettoni di lacca rossa legati da un filo rosso posati al centro, qualche petalo di pruno" } },
  testDateNaissance: { file: 'birth-date-compatibility', old: null,                  alt: { fr: 'Deux calendriers ouverts côte à côte, une date entourée sur chacun, reliées par un fil rouge', en: 'Two open calendars side by side, a circled date on each, linked by a red thread', es: 'Dos calendarios abiertos uno al lado del otro, una fecha rodeada en cada uno, unidos por un hilo rojo', de: 'Zwei aufgeschlagene Kalender nebeneinander, je ein eingekreistes Datum, verbunden durch einen roten Faden', it: 'Due calendari aperti affiancati, una data cerchiata su ciascuno, uniti da un filo rosso' } },
  testJalousie:      { file: 'jealousy-phone',           old: 'test-jalousie',       alt: { fr: 'Smartphone retourné sur une table projetant une longue ombre', en: 'Smartphone face down on a table casting a long shadow', es: 'Smartphone boca abajo sobre una mesa con una larga sombra', de: 'Umgedrehtes Smartphone auf einem Tisch mit langem Schatten', it: 'Smartphone capovolto su un tavolo con una lunga ombra' } },
  jeuActionVerite:    { file: 'spinning-bottle-cushions',    old: null,                  alt: { fr: "Une bouteille en verre couchée sur un parquet au milieu d'un cercle de coussins roses, lavande et crème, une guirlande lumineuse derrière", en: "A glass bottle lying on a wooden floor in the middle of a circle of pink, lavender and cream cushions, string lights glowing behind", es: "Una botella de vidrio tumbada en el suelo de madera en medio de un círculo de cojines rosas, lavanda y crema, con luces de guirnalda detrás", de: "Eine Glasflasche liegt auf einem Holzboden inmitten eines Kreises aus rosa, lavendelfarbenen und cremefarbenen Kissen, dahinter eine leuchtende Lichterkette", it: "Una bottiglia di vetro distesa su un pavimento di legno al centro di un cerchio di cuscini rosa, lavanda e crema, con una ghirlanda luminosa dietro" } },
  jeuActionVeriteHot: { file: 'silk-blindfold-card',         old: null,                  alt: { fr: "Un bandeau de soie rouge plié et une carte à jouer face cachée sur des draps de satin sombre, une bougie floue en arrière-plan", en: "A folded red silk blindfold and a playing card face down on dark satin sheets, a blurred candle in the background", es: "Un antifaz de seda roja doblado y una carta boca abajo sobre sábanas de satén oscuro, con una vela desenfocada al fondo", de: "Eine gefaltete rote Seidenaugenbinde und eine verdeckte Spielkarte auf dunklen Satinlaken, im Hintergrund eine unscharfe Kerze", it: "Una benda di seta rossa piegata e una carta da gioco coperta su lenzuola di raso scuro, con una candela sfocata sullo sfondo" } },
  testSuisJeAmoureux: { file: 'daisy-petals',                old: null,                  alt: { fr: "Une marguerite presque entièrement effeuillée sur une table en bois clair, ses pétales éparpillés à côté, une serviette en lin pliée", en: "A daisy almost fully plucked on a pale wooden table, its petals scattered beside it, a folded linen napkin", es: "Una margarita casi deshojada del todo sobre una mesa de madera clara, con los pétalos esparcidos al lado y una servilleta de lino doblada", de: "Ein fast vollständig abgezupftes Gänseblümchen auf einem hellen Holztisch, die Blütenblätter daneben verstreut, eine gefaltete Leinenserviette", it: "Una margherita quasi del tutto sfogliata su un tavolo di legno chiaro, i petali sparsi accanto e un tovagliolo di lino piegato" } },
  testKarmique:       { file: 'red-thread-infinity',         old: null,                  alt: { fr: "Un fil rouge posé en forme de boucle infinie sur du velours sombre, quelques petites étoiles dorées autour", en: "A red thread laid out as an infinity loop on dark velvet, a few tiny golden stars scattered around", es: "Un hilo rojo dispuesto en forma de bucle infinito sobre terciopelo oscuro, con algunas pequeñas estrellas doradas alrededor", de: "Ein roter Faden, als Unendlichkeitsschleife auf dunklem Samt gelegt, ein paar winzige goldene Sterne darum", it: "Un filo rosso disposto a forma di infinito su velluto scuro, con qualche piccola stella dorata intorno" } },
  testAmeSoeur:       { file: 'two-halves-stone',            old: null,                  alt: { fr: "Les deux moitiés d'un galet fendu posées à quelques centimètres l'une de l'autre sur du lin clair, leurs bords cassés faits pour s'emboîter", en: "The two halves of a split pebble lying a few centimetres apart on pale linen, their broken edges made to fit together", es: "Las dos mitades de un guijarro partido a pocos centímetros una de otra sobre lino claro, con los bordes rotos hechos para encajar", de: "Die beiden Hälften eines gespaltenen Kieselsteins liegen wenige Zentimeter voneinander entfernt auf hellem Leinen, ihre Bruchkanten passen genau zusammen", it: "Le due metà di un sasso spezzato a pochi centimetri l'una dall'altra su lino chiaro, con i bordi rotti fatti per incastrarsi" } },
  quizGenant:         { file: 'hidden-pink-note',            old: 'quiz-genant',         alt: { fr: "Un mot en papier rose plié, à moitié glissé sous un coussin lavande sur un canapé, un coin qui dépasse", en: "A folded pink paper note half tucked under a lavender cushion on a sofa, one corner peeking out", es: "Una nota de papel rosa doblada, medio escondida bajo un cojín lavanda en un sofá, con una esquina asomando", de: "Ein gefalteter rosa Zettel, halb unter ein lavendelfarbenes Kissen auf einem Sofa geschoben, eine Ecke schaut heraus", it: "Un biglietto di carta rosa piegato, mezzo nascosto sotto un cuscino lavanda su un divano, con un angolo che spunta" } },
  testLangageAmour:  { file: 'love-languages-gift',       old: 'test-langage-amour',  alt: { fr: 'Un cadeau, une carte vierge, un réveil, une tasse de thé et une écharpe alignés sur une table, pour le test des langages de l\'amour', en: 'A gift, a blank card, an alarm clock, a cup of tea and a scarf lined up on a table, for the love languages test', es: 'Un regalo, una tarjeta en blanco, un despertador, una taza de té y una bufanda alineados sobre una mesa, para el test de los lenguajes del amor', de: 'Ein Geschenk, eine leere Karte, ein Wecker, eine Tasse Tee und ein Schal in einer Reihe auf einem Tisch, für den Test der Sprachen der Liebe', it: 'Un regalo, un biglietto bianco, una sveglia, una tazza di tè e una sciarpa allineati su un tavolo, per il test dei linguaggi dell\'amore' } },
  testPersonnalite:  { file: 'love-personality-mirror',   old: null,                  alt: { fr: "Quatre cœurs de couleurs différentes posés côte à côte sur un fond clair", en: 'Four hearts in different colours side by side on a light background', es: 'Cuatro corazones de colores distintos, uno al lado del otro, sobre fondo claro', de: 'Vier Herzen in verschiedenen Farben nebeneinander auf hellem Hintergrund', it: 'Quattro cuori di colori diversi, uno accanto all\'altro, su fondo chiaro' } },
  quizTuPreferes:    { file: 'would-you-rather-doors',    old: 'quiz-tu-preferes',    alt: { fr: 'Deux portes, une rose et une bleue, symbolisant un choix', en: 'Two doors, one pink and one blue, symbolizing a choice', es: 'Dos puertas, una rosa y una azul, que simbolizan una elección', de: 'Zwei Türen, eine rosa und eine blaue, als Symbol einer Wahl', it: 'Due porte, una rosa e una blu, simbolo di una scelta' } },
  testPurete:        { file: 'purity-thermometer',        old: null,                  alt: { fr: 'Cinq verres alignés sur une table, du plus clair au plus foncé, pour le test de pureté en couple', en: 'Five glasses lined up on a table, from the palest to the darkest, for the couple purity test', es: 'Cinco vasos alineados sobre una mesa, del más claro al más oscuro, para el test de pureza en pareja', de: 'Fünf Gläser in einer Reihe auf einem Tisch, vom hellsten zum dunkelsten, für den Reinheitstest für Paare', it: 'Cinque bicchieri allineati su un tavolo, dal più chiaro al più scuro, per il test di purezza di coppia' } },
  quizVraiFaux:      { file: 'true-false-cards',          old: 'quiz-vrai-faux',      alt: { fr: 'Deux cartes en bois : une coche verte et une croix rouge', en: 'Two wooden cards: a green check and a red cross', es: 'Dos tarjetas de madera: una marca verde y una cruz roja', de: 'Zwei Holzkarten: ein grünes Häkchen und ein rotes Kreuz', it: 'Due carte di legno: un segno verde e una croce rossa' } },
  testAttachement:   { file: 'attachment-knot',           old: 'test-attachement',    alt: { fr: 'Deux rubans de soie rose et rouge noués ensemble', en: 'Two silk ribbons, pink and red, tied together in a knot', es: 'Dos cintas de seda, rosa y roja, atadas en un nudo', de: 'Zwei Seidenbänder, rosa und rot, zu einem Knoten gebunden', it: 'Due nastri di seta, rosa e rosso, annodati insieme' } },
  testDependance:    { file: 'anchor-heart',            alt: { fr: "Petite ancre de bateau attachée à un ballon rouge en forme de cœur qui s'élève", en: 'Small boat anchor tied to a rising red heart-shaped balloon', es: 'Pequeña ancla de barco atada a un globo rojo en forma de corazón que se eleva', de: 'Kleiner Bootsanker an einem aufsteigenden roten Herzballon', it: 'Piccola ancora legata a un palloncino rosso a forma di cuore che sale' } },
  testConfiance:     { file: 'trust-bridge',             old: 'test-confiance',      alt: { fr: 'Pont de bois traversant une eau calme au lever du soleil', en: 'Wooden footbridge crossing calm water at sunrise', es: 'Puente de madera sobre aguas tranquilas al amanecer', de: 'Holzsteg über ruhigem Wasser bei Sonnenaufgang', it: "Ponte di legno su acque calme all'alba" } },
  testInfidelite:    { file: 'infidelity-hidden-phone',   old: null,                  alt: { fr: 'Alliance retirée à côté d\'un téléphone au message caché', en: 'A wedding ring removed beside a phone with a hidden message', es: 'Un anillo de boda junto a un teléfono con un mensaje oculto', de: 'Ein abgelegter Ehering neben einem Handy mit versteckter Nachricht', it: 'Una fede tolta accanto a un telefono con un messaggio nascosto' } },
  testCouche:        { file: 'unmade-bed-earring',       old: null,                  alt: { fr: "Un lit défait avec deux oreillers et une boucle d'oreille inconnue posée sur le drap", en: 'An unmade bed with two pillows and an unfamiliar earring left on the sheet', es: 'Una cama deshecha con dos almohadas y un pendiente desconocido sobre la sábana', de: 'Ein zerwühltes Bett mit zwei Kissen und einem fremden Ohrring auf dem Laken', it: "Un letto sfatto con due cuscini e un orecchino sconosciuto sul lenzuolo" } },
  testSecret:        { file: 'heart-on-window',            old: null,                  alt: { fr: "Un cœur dessiné du bout du doigt sur une vitre embuée, devant une lumière douce", en: 'A heart drawn with a fingertip on a misted window, in front of soft light', es: 'Un corazón dibujado con el dedo en un cristal empañado, ante una luz suave', de: 'Ein mit dem Finger auf eine beschlagene Scheibe gemaltes Herz vor sanftem Licht', it: "Un cuore disegnato con un dito su un vetro appannato, davanti a una luce soffusa" } },
  testDistanceAime:  { file: 'night-call-glow',            old: null,                  alt: { fr: "Un téléphone posé sur un lit la nuit, l'écran allumé qui éclaire un halo en forme de cœur", en: 'A phone lying on a bed at night, its lit screen casting a heart-shaped glow', es: 'Un móvil sobre una cama de noche, con la pantalla encendida proyectando un halo con forma de corazón', de: 'Ein Handy nachts auf einem Bett, dessen leuchtender Bildschirm einen herzförmigen Schein wirft', it: "Un telefono su un letto di notte, lo schermo acceso che proietta un alone a forma di cuore" } },
  testEx:            { file: 'unsent-message',             old: null,                  alt: { fr: "Un message écrit mais jamais envoyé sur un écran de téléphone, dans une pièce sombre", en: 'A message typed but never sent on a phone screen, in a dark room', es: 'Un mensaje escrito pero nunca enviado en la pantalla de un móvil, en una habitación a oscuras', de: 'Eine getippte, nie gesendete Nachricht auf einem Handybildschirm in einem dunklen Zimmer', it: "Un messaggio scritto ma mai inviato sullo schermo di un telefono, in una stanza buia" } },
  // Photos générées pour la page (28 octobre 2026), jamais un visage.
  testEncoreAmoureuxEx: { file: 'ex-empty-bed',          old: null,                  alt: { fr: "Une femme de dos, assise sur un lit défait près de la fenêtre, et sur l'autre oreiller le pull gris de celui qui est parti", en: 'A woman seen from behind, sitting on an unmade bed by the window, with the grey sweater of the person who left lying on the other pillow', es: 'Una mujer de espaldas, sentada en una cama deshecha junto a la ventana, y en la otra almohada el jersey gris de quien se fue', de: 'Eine Frau von hinten, auf einem ungemachten Bett am Fenster, auf dem anderen Kissen der graue Pullover dessen, der gegangen ist', it: "Una donna di spalle, seduta su un letto disfatto vicino alla finestra, e sull'altro cuscino il maglione grigio di chi se n'è andato" } },
  testOublierEx:     { file: 'footprints-tide',          old: null,                  alt: { fr: "Des traces de pas sur une plage au soleil couchant, que la marée montante commence à effacer", en: 'Footprints on a beach at sunset, slowly being washed away by the rising tide', es: 'Huellas de pasos en una playa al atardecer, que la marea empieza a borrar', de: 'Fußspuren an einem Strand bei Sonnenuntergang, die die steigende Flut langsam verwischt', it: 'Impronte di passi su una spiaggia al tramonto, che la marea sta cominciando a cancellare' } },
  testExRevenir:     { file: 'ex-door-ajar',             old: null,                  alt: { fr: "La porte d'entrée d'une maison restée entrouverte à la tombée de la nuit, une lumière chaude passe par l'entrebâillement", en: 'A front door left ajar at dusk, with warm light spilling out through the gap', es: 'La puerta de una casa entreabierta al anochecer, con una luz cálida que se cuela por la rendija', de: 'Eine Haustür, die in der Abenddämmerung einen Spalt offen steht, warmes Licht fällt nach draußen', it: 'La porta di casa socchiusa al tramonto, con una luce calda che filtra dallo spiraglio' } },
  testRemettreEx:    { file: 'kintsugi-vase',            old: null,                  alt: { fr: "Un vase en céramique cassé puis réparé à l'or, selon la technique japonaise du kintsugi, posé près d'une fenêtre", en: 'A ceramic vase that was broken and mended with gold using the Japanese kintsugi technique, standing by a window', es: 'Un jarrón de cerámica roto y reparado con oro, con la técnica japonesa del kintsugi, junto a una ventana', de: 'Eine zerbrochene Keramikvase, mit Gold repariert nach der japanischen Kintsugi-Technik, am Fenster', it: "Un vaso di ceramica rotto e riparato con l'oro, secondo la tecnica giapponese del kintsugi, vicino a una finestra" } },
  testOublieSonEx:   { file: 'ex-keepsake-box',          old: null,                  alt: { fr: "Une vieille boîte à chaussures sortie de sous un lit, avec des lettres nouées, une rose séchée et des photos retournées", en: 'An old shoebox pulled out from under a bed, with tied-up letters, a dried rose and photos turned face down', es: 'Una vieja caja de zapatos sacada de debajo de la cama, con cartas atadas, una rosa seca y fotos boca abajo', de: 'Ein alter Schuhkarton, unter dem Bett hervorgezogen, mit zusammengebundenen Briefen, einer getrockneten Rose und umgedrehten Fotos', it: "Una vecchia scatola da scarpe tirata fuori da sotto il letto, con lettere legate, una rosa secca e foto girate al contrario" } },
  testPourquoiQuitte: { file: 'keys-left-behind',        old: null,                  alt: { fr: "Un trousseau de clés et un mot plié laissés sur une console dans l'entrée, sous une patère vide", en: 'A set of keys and a folded note left on a console table in the entryway, under an empty coat hook', es: 'Un llavero y una nota doblada dejados sobre una consola en la entrada, bajo un perchero vacío', de: 'Ein Schlüsselbund und ein gefalteter Zettel auf einer Kommode im Flur, unter einem leeren Garderobenhaken', it: "Un mazzo di chiavi e un biglietto piegato lasciati su una consolle all'ingresso, sotto un appendiabiti vuoto" } },
  testAimeEncore:     { file: 'two-pillows-one-untouched',   old: null,                  alt: { fr: "Un lit vu de dessus avec deux oreillers : l'un froissé, le drap rabattu, l'autre parfaitement lisse et intact", en: "A bed seen from above with two pillows: one crumpled with the sheet turned back, the other perfectly smooth and untouched", es: "Una cama vista desde arriba con dos almohadas: una arrugada con la sábana retirada, la otra perfectamente lisa e intacta", de: "Ein Bett von oben mit zwei Kissen: eines zerknittert mit zurückgeschlagenem Laken, das andere vollkommen glatt und unberührt", it: "Un letto visto dall'alto con due cuscini: uno spiegazzato con il lenzuolo ripiegato, l'altro perfettamente liscio e intatto" } },
  testEmprise:       { file: 'open-birdcage-window',        old: null,                  alt: { fr: "Une cage à oiseaux vide, la porte grande ouverte, posée sur le rebord d'une fenêtre avec quelques plumes", en: 'An empty birdcage with its door wide open on a windowsill, a few feathers left behind', es: 'Una jaula de pájaros vacía con la puerta abierta de par en par en el alféizar de una ventana, con algunas plumas', de: 'Ein leerer Vogelkäfig mit weit offener Tür auf einer Fensterbank, ein paar Federn liegen daneben', it: 'Una gabbia per uccelli vuota con la porta spalancata sul davanzale di una finestra, con qualche piuma' } },
  testTrouverAmour:   { file: 'compass-heart-map',           old: null,                  alt: { fr: "Une boussole en laiton ouverte sur une nappe en lin, l'aiguille remplacée par un petit cœur rose, à côté d'une carte pliée et d'un brin de lavande", en: "An open brass compass on a linen tablecloth, its needle replaced by a small pink heart, next to a folded map and a sprig of lavender", es: "Una brújula de latón abierta sobre un mantel de lino, con la aguja sustituida por un pequeño corazón rosa, junto a un mapa doblado y una ramita de lavanda", de: "Ein geöffneter Messingkompass auf einer Leinentischdecke, die Nadel durch ein kleines rosa Herz ersetzt, neben einer gefalteten Karte und einem Lavendelzweig", it: "Una bussola di ottone aperta su una tovaglia di lino, con l'ago sostituito da un piccolo cuore rosa, accanto a una mappa piegata e a un rametto di lavanda" } },
  testCelibataire:    { file: 'magnifier-paper-heart',       old: null,                  alt: { fr: "Une loupe ancienne à manche en bois posée sur une nappe en lin, sa lentille au-dessus d'un petit cœur en papier rose, à côté d'un carnet lavande fermé et d'un crayon", en: 'An old magnifying glass with a wooden handle on a linen tablecloth, its lens over a small pink paper heart, next to a closed lavender notebook and a pencil', es: 'Una lupa antigua con mango de madera sobre un mantel de lino, con la lente sobre un pequeño corazón de papel rosa, junto a un cuaderno lavanda cerrado y un lápiz', de: 'Eine alte Lupe mit Holzgriff auf einer Leinentischdecke, die Linse über einem kleinen rosa Papierherz, daneben ein geschlossenes lavendelfarbenes Notizbuch und ein Bleistift', it: "Una vecchia lente d'ingrandimento con manico di legno su una tovaglia di lino, la lente sopra un piccolo cuore di carta rosa, accanto a un quaderno lavanda chiuso e a una matita" } },
  testCoupleOuCelibat: { file: 'couple-ou-celibat',           old: null,                  alt: { fr: "Un fauteuil en velours rose à une place et un canapé lavande à deux places posés côte à côte devant une grande fenêtre, dans une pièce claire", en: 'A rose-pink velvet armchair for one and a lavender two-seater sofa side by side in front of a large window, in a bright room', es: 'Un sillón de terciopelo rosa para una persona y un sofá lavanda de dos plazas, uno al lado del otro delante de un gran ventanal, en una habitación luminosa', de: 'Ein rosa Samtsessel für eine Person und ein lavendelfarbenes Zweisitzersofa nebeneinander vor einem großen Fenster, in einem hellen Raum', it: "Una poltrona di velluto rosa a un posto e un divano lavanda a due posti, uno accanto all'altro davanti a una grande finestra, in una stanza luminosa" } },
  testCompatSexuelle: { file: 'rubans-noues-draps',   old: null,                  alt: { fr: "Deux rubans de soie, un rose et un lavande, noués ensemble au milieu de draps de lin froissés, deux oreillers flous à l'arrière-plan dans la lumière du matin", en: 'Two silk ribbons, one pink and one lavender, knotted together in the middle of rumpled linen sheets, two blurred pillows in the background in the morning light', es: 'Dos cintas de seda, una rosa y otra lavanda, anudadas en medio de unas sábanas de lino arrugadas, con dos almohadas desenfocadas al fondo en la luz de la mañana', de: 'Zwei Seidenbänder, ein rosafarbenes und ein lavendelfarbenes, in der Mitte zerwühlter Leinenlaken miteinander verknotet, im Hintergrund zwei unscharfe Kissen im Morgenlicht', it: "Due nastri di seta, uno rosa e uno lavanda, annodati insieme in mezzo a lenzuola di lino stropicciate, con due cuscini sfocati sullo sfondo nella luce del mattino" } },
  testEstCeLeBon:    { file: 'right-person-key',         old: null,                  alt: { fr: "Sur une table en bois clair, un trousseau de vieilles clés en laiton posé en désordre à gauche et, à droite, une seule clé glissée dans la serrure d'une petite porte peinte en bleu pâle, entrouverte, d'où passe une lumière chaude", en: "On a light wooden table, a bunch of old brass keys lying in a tangle on the left and, on the right, a single key in the lock of a small pale blue painted door, slightly ajar, with warm light coming through", es: "Sobre una mesa de madera clara, un manojo de viejas llaves de latón desordenado a la izquierda y, a la derecha, una sola llave metida en la cerradura de una pequeña puerta pintada de azul pálido, entreabierta, por la que pasa una luz cálida", de: "Auf einem hellen Holztisch links ein Bund alter Messingschlüssel in einem Durcheinander und rechts ein einzelner Schlüssel im Schloss einer kleinen, hellblau gestrichenen Tür, die einen Spalt offen steht und warmes Licht durchlässt", it: "Su un tavolo di legno chiaro, a sinistra un mazzo di vecchie chiavi d'ottone in disordine e, a destra, una sola chiave infilata nella serratura di una piccola porta dipinta di azzurro pallido, socchiusa, da cui passa una luce calda" } },
  testPretRelation:  { file: 'new-relationship-sprout',  old: null,                  alt: { fr: "Sur un rebord de fenêtre, un vieil album photo fermé à gauche et, à droite, une jeune pousse verte dans un pot en terre cuite, une petite clé en laiton posée à côté", en: "On a windowsill, an old closed photo album on the left and, on the right, a fresh green sprout in a terracotta pot with a small brass key beside it", es: "En el alféizar de una ventana, un viejo álbum de fotos cerrado a la izquierda y, a la derecha, un brote verde en una maceta de barro con una pequeña llave de latón al lado", de: "Auf einer Fensterbank links ein altes, geschlossenes Fotoalbum und rechts ein frischer grüner Trieb in einem Terrakottatopf, daneben ein kleiner Messingschlüssel", it: "Su un davanzale, a sinistra un vecchio album di foto chiuso e, a destra, un germoglio verde in un vaso di terracotta con una piccola chiave d'ottone accanto" } },
  testDureeCelibat:  { file: 'single-hourglass-cafe',    old: null,                  alt: {"fr": "Sur une petite table de café en marbre, un sablier en laiton au sable rose à moitié écoulé, un cappuccino et un cœur en papier plié, face à une chaise vide, dans la lumière dorée d'une fin d'après-midi", "en": "On a small marble cafe table, a brass hourglass with pink sand half run through, a cappuccino and a folded paper heart, facing an empty chair, in golden late-afternoon light", "es": "Sobre una mesita de mármol de una terraza, un reloj de arena de latón con arena rosa a medio caer, un capuchino y un corazón de papel doblado, frente a una silla vacía, con la luz dorada del final de la tarde", "de": "Auf einem kleinen Marmortisch eines Cafés eine Sanduhr aus Messing mit halb durchgelaufenem rosa Sand, ein Cappuccino und ein gefaltetes Papierherz, gegenüber ein leerer Stuhl, im goldenen Licht des späten Nachmittags", "it": "Su un tavolino di marmo di un caffè, una clessidra d'ottone con la sabbia rosa a metà, un cappuccino e un cuore di carta piegato, davanti a una sedia vuota, nella luce dorata del tardo pomeriggio"} },
  testAmourAmi:      { file: 'friendship-bracelets-heart',  old: null,                  alt: { fr: "Deux bracelets d'amitié tressés, un rose et un lavande, entrelacés en forme de cœur sur une table en bois", en: 'Two braided friendship bracelets, one pink and one lavender, intertwined into a heart on a wooden table', es: 'Dos pulseras de la amistad trenzadas, una rosa y otra lavanda, entrelazadas en forma de corazón sobre una mesa de madera', de: 'Zwei geflochtene Freundschaftsbändchen, eines rosa und eines lavendelblau, herzförmig verschlungen auf einem Holztisch', it: "Due braccialetti dell'amicizia intrecciati, uno rosa e uno lavanda, uniti a forma di cuore su un tavolo di legno" } },
  testChargeMentale: { file: 'sticky-notes-fridge',        old: null,                  alt: { fr: "Une porte de réfrigérateur couverte de listes et de pense-bêtes qui se chevauchent", en: 'A fridge door covered in overlapping lists and reminder notes', es: 'Una puerta de nevera cubierta de listas y notas recordatorias superpuestas', de: 'Eine Kühlschranktür voller sich überlappender Listen und Merkzettel', it: "Una porta di frigorifero coperta di liste e promemoria sovrapposti" } },
  quizRencontre:      { file: 'bistro-table-two-chairs',     old: null,                  alt: { fr: "Une petite table de bistrot en terrasse avec deux chaises vides face à face, une fleur dans un vase fin, des guirlandes lumineuses floues derrière", en: "A small bistro table on a terrace with two empty chairs facing each other, a flower in a slim vase, blurred string lights behind", es: "Una pequeña mesa de bistró en una terraza con dos sillas vacías frente a frente, una flor en un jarrón fino y luces de guirnalda desenfocadas detrás", de: "Ein kleiner Bistrotisch auf einer Terrasse mit zwei leeren Stühlen einander gegenüber, eine Blume in einer schmalen Vase, dahinter unscharfe Lichterketten", it: "Un tavolino da bistrot su una terrazza con due sedie vuote una di fronte all'altra, un fiore in un vaso sottile e ghirlande luminose sfocate dietro" } },
  zamours:            { file: 'game-show-buzzers',           old: null,                  alt: { fr: "Deux gros boutons de jeu télévisé, un rose et un violet, sur un pupitre brillant sous les lumières d'un plateau", en: "Two large game show buzzer buttons, one pink and one violet, on a glossy desk under studio lights", es: "Dos grandes pulsadores de concurso de televisión, uno rosa y otro violeta, sobre un pupitre brillante bajo las luces del plató", de: "Zwei große Buzzer einer Fernsehshow, einer rosa und einer violett, auf einem glänzenden Pult unter Studiolicht", it: "Due grossi pulsanti da quiz televisivo, uno rosa e uno viola, su un bancone lucido sotto le luci di uno studio" } },
  testVacances:      { file: 'carte-vacances-couple',      old: null,                  alt: { fr: 'Carte du monde stylisée rose et violette avec des épingles en forme de cœur, illustrant le test où partir en vacances en couple' } },
  jeuPlateau:         { file: 'board-path-pawns',            old: null,                  alt: { fr: "Deux pions en bois, un rose et un lavande, côte à côte sur le chemin dessiné d'un plateau de jeu, un dé blanc posé à côté", en: "Two wooden pawns, one pink and one lavender, side by side on the drawn path of a board game, a white die resting nearby", es: "Dos peones de madera, uno rosa y otro lavanda, uno al lado del otro en el camino dibujado de un tablero, con un dado blanco al lado", de: "Zwei Holzspielfiguren, eine rosa und eine lavendelfarben, nebeneinander auf dem gezeichneten Pfad eines Spielbretts, ein weißer Würfel daneben", it: "Due pedine di legno, una rosa e una lavanda, fianco a fianco sul percorso disegnato di un tabellone, con un dado bianco accanto" } },
  jeuQuiDeNous:       { file: 'two-blank-signs',             old: null,                  alt: { fr: "Deux petites ardoises vierges sur chevalets, une rose et une lavande, face à face sur une nappe en lin, comme en attente de deux réponses", en: "Two small blank sign boards on easels, one pink and one lavender, facing each other on a linen tablecloth, as if waiting for two answers", es: "Dos pequeñas pizarras en blanco sobre caballetes, una rosa y otra lavanda, frente a frente en un mantel de lino, como esperando dos respuestas", de: "Zwei kleine leere Schilder auf Staffeleien, eines rosa und eines lavendelfarben, einander gegenüber auf einer Leinentischdecke, als warteten sie auf zwei Antworten", it: "Due piccole lavagnette bianche su cavalletti, una rosa e una lavanda, una di fronte all'altra su una tovaglia di lino, come in attesa di due risposte" } },
  jeuGages:           { file: 'pastel-prize-wheel',          old: null,                  alt: { fr: "Une petite roue de la fortune en bois peint aux cases pastel, rose, lavande, crème et menthe, posée sur une table de cuisine", en: "A small painted wooden prize wheel with pastel segments in pink, lavender, cream and mint, standing on a kitchen table", es: "Una pequeña ruleta de madera pintada con casillas pastel, rosa, lavanda, crema y menta, sobre una mesa de cocina", de: "Ein kleines bemaltes Glücksrad aus Holz mit Pastellfeldern in Rosa, Lavendel, Creme und Mint, auf einem Küchentisch", it: "Una piccola ruota della fortuna in legno dipinto con caselle pastello, rosa, lavanda, crema e menta, su un tavolo di cucina" } },
  jeuDilemmes:       { file: 'dilemma-scales-choice',    old: null,                  alt: { fr: 'Une balance en équilibre : un cadeau rose d\'un côté, un poids violet de l\'autre', en: 'A balanced scale: a pink gift on one side, a purple weight on the other', es: 'Una balanza en equilibrio: un regalo rosa a un lado, una pesa morada al otro', de: 'Eine Waage im Gleichgewicht: ein rosa Geschenk auf der einen Seite, ein violettes Gewicht auf der anderen', it: 'Una bilancia in equilibrio: un regalo rosa da un lato, un peso viola dall\'altro' } },
  jeuxCouple:        { file: 'game-night-table',            old: null,                  alt: { fr: 'Soirée jeux à deux vue de dessus : plateau, pions roses et violets, dés, cartes, deux verres de vin et une bougie', en: 'Games night for two seen from above: a board, pink and purple pawns, dice, cards, two glasses of wine and a candle', es: 'Noche de juegos en pareja vista desde arriba: tablero, fichas rosas y moradas, dados, cartas, dos copas de vino y una vela', de: 'Spieleabend zu zweit von oben: Spielbrett, rosa und lila Spielfiguren, Würfel, Karten, zwei Weingläser und eine Kerze', it: 'Serata giochi in due vista dall\'alto: tabellone, pedine rosa e viola, dadi, carte, due bicchieri di vino e una candela' } },
  testAmourAmitie:   { file: 'panneau-amour-amitie',      old: null,                  alt: { fr: 'Une rose rouge et un bracelet d\'amitié tressé posés côte à côte sur une table en bois, pour le test amour ou amitié', en: 'A red rose and a braided friendship bracelet side by side on a wooden table, for the love or friendship test', es: 'Una rosa roja y una pulsera de la amistad trenzada, una al lado de la otra sobre una mesa de madera, para el test amor o amistad', de: 'Eine rote Rose und ein geflochtenes Freundschaftsband nebeneinander auf einem Holztisch, für den Test Liebe oder Freundschaft', it: 'Una rosa rossa e un braccialetto dell\'amicizia intrecciato uno accanto all\'altro su un tavolo di legno, per il test amore o amicizia' } },
  testCrush:          { file: 'locker-heart-note',           old: null,                  alt: { fr: "La porte d'un casier de lycée en métal clair avec un petit autocollant en forme de cœur et un mot plié glissé dans la grille", en: "A pale metal school locker door with a small heart-shaped sticker and a folded note slipped into the vent", es: "La puerta de una taquilla escolar de metal claro con una pequeña pegatina en forma de corazón y una nota doblada metida en la rejilla", de: "Eine helle Metalltür eines Schulspinds mit einem kleinen herzförmigen Aufkleber und einem gefalteten Zettel im Lüftungsschlitz", it: "La porta di un armadietto scolastico in metallo chiaro con un piccolo adesivo a forma di cuore e un biglietto piegato infilato nella griglia" } },
  testFinCouple:     { file: 'corde-effilochee',           old: null,                  alt: { fr: 'Une corde tendue, effilochée en son centre, dont il ne reste que quelques fils', en: 'A taut rope, frayed at its centre, with only a few threads still holding', es: 'Una cuerda tensa, deshilachada en el centro, de la que solo quedan unos hilos', de: 'Ein gespanntes Seil, in der Mitte ausgefranst, nur noch wenige Fäden halten', it: 'Una corda tesa, sfilacciata al centro, di cui restano solo pochi fili' } },
  pourContre:        { file: 'pour-contre-pouces',       old: null,                  alt: { fr: 'Une balance en laiton sur une table en bois, des pétales de rose sur un plateau et un galet sur l\'autre, pour le jeu pour ou contre en couple', en: 'A brass balance scale on a wooden table, rose petals on one pan and a pebble on the other, for the for or against couple game', es: 'Una balanza de latón sobre una mesa de madera, pétalos de rosa en un platillo y un guijarro en el otro, para el juego a favor o en contra en pareja', de: 'Eine Messingwaage auf einem Holztisch, Rosenblätter in der einen Schale und ein Kieselstein in der anderen, für das Paarspiel dafür oder dagegen', it: 'Una bilancia di ottone su un tavolo di legno, petali di rosa su un piatto e un ciottolo sull\'altro, per il gioco pro o contro in coppia' } },
  jeuJamais:          { file: 'candles-blown-out',           old: null,                  alt: { fr: "Une rangée de petites bougies pastel sur un plateau en bois, trois déjà soufflées avec un filet de fumée, les autres encore allumées", en: "A row of small pastel candles on a wooden tray, three already blown out with wisps of smoke, the others still burning", es: "Una fila de pequeñas velas pastel sobre una bandeja de madera, tres ya apagadas con un hilo de humo, las demás aún encendidas", de: "Eine Reihe kleiner Pastellkerzen auf einem Holztablett, drei schon ausgeblasen mit dünnen Rauchfäden, die anderen brennen noch", it: "Una fila di piccole candele pastello su un vassoio di legno, tre già spente con un filo di fumo, le altre ancora accese" } },
  jeuQuiPourrait:     { file: 'two-cards-face-off',          old: null,                  alt: { fr: "Deux cartes vierges posées face à face sur une petite table ronde en bois, une verte et une jaune, comme prêtes à être retournées", en: "Two blank cards lying face to face on a small round wooden table, one green and one yellow, as if about to be flipped", es: "Dos cartas en blanco frente a frente sobre una pequeña mesa redonda de madera, una verde y otra amarilla, como a punto de darse la vuelta", de: "Zwei leere Karten liegen sich auf einem kleinen runden Holztisch gegenüber, eine grün und eine gelb, als würden sie gleich umgedreht", it: "Due carte bianche una di fronte all'altra su un tavolino rotondo di legno, una verde e una gialla, come pronte a essere girate" } },
  jeuOuiNon:         { file: 'oui-non-vote',           old: null,                  alt: { fr: 'Deux cartes de vote face à face, une verte pour le oui et une rouge pour le non', en: 'Two voting cards facing each other, a green one for yes and a red one for no', es: 'Dos tarjetas de voto frente a frente, una verde para el sí y una roja para el no', de: 'Zwei Abstimmungskarten einander gegenüber, eine grüne für Ja und eine rote für Nein', it: 'Due carte per votare una di fronte all\'altra, una verde per il sì e una rossa per il no' } },
  jeuPhrases:        { file: 'deux-bulles-phrase',    old: null,                  alt: { fr: 'Deux bulles de conversation, une rose et une violette, qui finissent chacune par trois points de suspension', en: 'Two speech bubbles, one pink and one purple, each ending in three dots', es: 'Dos bocadillos de conversación, uno rosa y otro morado, que terminan con tres puntos suspensivos', de: 'Zwei Sprechblasen, eine rosa und eine violette, die beide mit drei Punkten enden', it: 'Due fumetti, uno rosa e uno viola, che finiscono entrambi con tre puntini' } },
  jeuDixMais:        { file: 'macaron-fendu',         old: null,                  alt: { fr: "Une boîte de macarons pastel roses et lilas, tous parfaits sauf un, fendu en deux, quelques miettes tombées sur la nappe en lin à côté d'un ruban rose", en: 'A box of pastel pink and lilac macarons, all flawless except one cracked in half, a few crumbs on the linen tablecloth next to a pink ribbon', es: 'Una caja de macarons pastel rosas y lilas, todos perfectos menos uno, partido por la mitad, con unas migas sobre el mantel de lino junto a una cinta rosa', de: 'Eine Schachtel pastellrosa und lila Macarons, alle makellos bis auf einen, der in der Mitte gebrochen ist, daneben ein paar Krümel auf der Leinentischdecke und ein rosa Band', it: 'Una scatola di macaron pastello rosa e lilla, tutti perfetti tranne uno, spezzato a metà, con qualche briciola sulla tovaglia di lino accanto a un nastro rosa' } },
  // Le jeu de soirée pour couples : trois couples de mascottes autour d'un
  // téléphone, dessinés avec reseaux/charte/mascottes.js et rendus par
  // Chromium (pas de générateur d'images depuis une session de travail).
  jeuSoireeCouples:  { file: 'soiree-couples-mascottes', old: null, alt: { fr: "Trois couples de mascottes, roses et violettes, réunis autour d'une table basse où un téléphone affiche un point d'interrogation, sous une guirlande lumineuse et des confettis", en: 'Three couples of mascots, pink and purple, gathered around a coffee table where a phone shows a question mark, under fairy lights and confetti', es: 'Tres parejas de mascotas, rosas y moradas, reunidas alrededor de una mesa baja donde un móvil muestra un signo de interrogación, bajo una guirnalda de luces y confeti', de: 'Drei Maskottchen-Paare, rosa und lila, um einen Couchtisch versammelt, auf dem ein Handy ein Fragezeichen zeigt, unter einer Lichterkette und Konfetti', it: 'Tre coppie di mascotte, rosa e viola, riunite attorno a un tavolino dove un telefono mostra un punto interrogativo, sotto una ghirlanda di luci e coriandoli' } },
  // Les quiz spéciaux d'Halloween (16 octobre 2026) : des illustrations dessinées pour les pages, jamais une photo de vraie personne ni une image des films
  speciauxCouple:    { file: 'quiz-speciaux-saisons',   old: null, alt: { fr: "Une table de soirée vue de près : une citrouille sculptée, une boule de Noël, une bougie et deux tasses, une rose et une violette, sur des feuilles d'automne", en: 'A close-up of a party table: a carved pumpkin, a Christmas bauble, a candle and two mugs, one pink and one purple, on autumn leaves', es: 'Una mesa de fiesta de cerca: una calabaza tallada, una bola de Navidad, una vela y dos tazas, una rosa y una morada, sobre hojas de otoño', de: 'Ein Partytisch aus der Nähe: ein geschnitzter Kürbis, eine Weihnachtskugel, eine Kerze und zwei Tassen, eine rosa und eine lila, auf Herbstlaub', it: 'Un tavolo da festa da vicino: una zucca intagliata, una pallina di Natale, una candela e due tazze, una rosa e una viola, su foglie autunnali' } },
  quizSerialKiller:  { file: 'halloween-serial-killer', old: null, alt: { fr: "Une ruelle victorienne dans le brouillard, la nuit : un réverbère, l'ombre d'un chapeau haut de forme sur les pavés mouillés, et deux parapluies, un rose et un violet, appuyés contre un mur", en: 'A Victorian alley in the fog at night: a gas lamp, the shadow of a top hat on wet cobblestones, and two umbrellas, one pink and one purple, leaning against a wall', es: 'Un callejón victoriano entre la niebla, de noche: una farola, la sombra de un sombrero de copa sobre los adoquines mojados y dos paraguas, uno rosa y otro morado, apoyados en una pared', de: 'Eine viktorianische Gasse im Nebel bei Nacht: eine Gaslaterne, der Schatten eines Zylinders auf nassem Kopfsteinpflaster und zwei Regenschirme, ein rosa und ein lila, an einer Mauer', it: "Un vicolo vittoriano nella nebbia, di notte: un lampione, l'ombra di un cilindro sui ciottoli bagnati e due ombrelli, uno rosa e uno viola, appoggiati a un muro" } },
  quizMortFilmHorreur: { file: 'halloween-film-horreur', old: null, alt: { fr: "Un salon le soir d'un film d'horreur : la télévision montre un chalet abandonné dans les bois, du pop-corn renversé sur le canapé, une couverture rose et une couverture violette, le faisceau d'une lampe de poche", en: 'A living room on horror movie night: the TV shows an abandoned cabin in the woods, popcorn spilled on the sofa, a pink blanket and a purple blanket, a flashlight beam', es: 'Un salón en una noche de película de terror: la tele muestra una cabaña abandonada en el bosque, palomitas volcadas en el sofá, una manta rosa y otra morada, el haz de una linterna', de: 'Ein Wohnzimmer am Horrorfilmabend: der Fernseher zeigt eine verlassene Hütte im Wald, verschüttetes Popcorn auf dem Sofa, eine rosa und eine lila Decke, der Strahl einer Taschenlampe', it: 'Un salotto la sera di un film horror: la TV mostra una baita abbandonata nel bosco, popcorn rovesciati sul divano, una coperta rosa e una viola, il fascio di una torcia' } },
  quizPossession:    { file: 'halloween-possession',   old: null, alt: { fr: "Un vieux grenier : une planche de Ouija sur une table en bois, une bougie, de la poussière en suspension, un miroir fêlé qui reflète une lueur, et deux tasses côte à côte, une rose et une violette", en: 'An old attic: a ouija board on a wooden table, a candle, dust in the air, a cracked mirror reflecting a faint glow, and two mugs side by side, one pink and one purple', es: 'Un viejo desván: una tabla de ouija sobre una mesa de madera, una vela, polvo en el aire, un espejo agrietado que refleja un resplandor y dos tazas juntas, una rosa y otra morada', de: 'Ein alter Dachboden: ein Ouija-Brett auf einem Holztisch, eine Kerze, Staub in der Luft, ein gesprungener Spiegel mit einem schwachen Schimmer und zwei Tassen nebeneinander, eine rosa und eine lila', it: 'Una vecchia soffitta: una tavola ouija su un tavolo di legno, una candela, polvere nell\'aria, uno specchio incrinato che riflette un bagliore e due tazze affiancate, una rosa e una viola' } },
  quizSuperVilain:   { file: 'halloween-super-vilain', old: null, alt: { fr: "Le repaire d'un super-vilain la nuit, vu de derrière un grand fauteuil : les gratte-ciel par la baie vitrée, une cape violette au portemanteau et un masque rose posé sur une table", en: "A supervillain's lair at night seen from behind a big armchair: the skyline through the window, a purple cape on a coat rack and a pink mask on a table", es: 'La guarida de un supervillano de noche, vista desde detrás de un gran sillón: los rascacielos tras la cristalera, una capa morada en el perchero y una máscara rosa sobre una mesa', de: 'Das Versteck eines Superschurken bei Nacht, von hinter einem großen Sessel aus: die Skyline durch das Fenster, ein lila Umhang an der Garderobe und eine rosa Maske auf einem Tisch', it: 'Il covo di un supercattivo di notte, visto da dietro una grande poltrona: i grattacieli oltre la vetrata, un mantello viola sull\'attaccapanni e una maschera rosa su un tavolo' } },
  quizDuoVilains:    { file: 'halloween-duo-vilains',  old: null, alt: { fr: "Deux silhouettes de méchants main dans la main, de dos, vers la porte d'un coffre-fort, l'une auréolée de rose et l'autre de violet, des plans et une carte au sol", en: 'Two villain silhouettes hand in hand, seen from behind, walking toward a vault door, one with a pink glow and one with a purple glow, blueprints and a map on the floor', es: 'Dos siluetas de villanos de la mano, de espaldas, hacia la puerta de una caja fuerte, una con un halo rosa y otra morado, planos y un mapa en el suelo', de: 'Zwei Schurken-Silhouetten Hand in Hand, von hinten, auf dem Weg zu einer Tresortür, eine mit rosa, eine mit lila Schein, Baupläne und eine Karte auf dem Boden', it: 'Due sagome di cattivi mano nella mano, di spalle, verso la porta di un caveau, una con un alone rosa e l\'altra viola, planimetrie e una mappa a terra' } },
  quizTentation:     { file: 'island-bonfire',            old: null,                  alt: { fr: 'Feu de camp sur une plage tropicale la nuit, avec palmiers et pleine lune', en: 'Bonfire on a tropical beach at night, with palm trees and a full moon', es: 'Hoguera en una playa tropical de noche, con palmeras y luna llena', de: 'Lagerfeuer an einem tropischen Strand bei Nacht, mit Palmen und Vollmond', it: 'Falò su una spiaggia tropicale di notte, con palme e luna piena' } },
};

// Map route keys to their page template and translation namespaces

export const ROUTE_CONFIG = {
  home: { template: 'home', namespaces: ['home', 'common', 'quizzes'] },
  testCouple: { template: 'quiz-tester-couple', namespaces: ['quiz-tester-couple', 'quizzes', 'quizGames', 'gd', 'common'] },
  testCommonPoints: { template: 'quiz-common-points', namespaces: ['quiz-common-points', 'quizzes', 'quizGames', 'gd', 'common'] },
  testCompatibilite: { template: 'quiz-compatibilite', namespaces: ['quiz-compatibilite', 'quizzes', 'quizGames', 'gd', 'common'] },
  testDistance: { template: 'quiz-distance', namespaces: ['quiz-distance', 'quizzes', 'quizGames', 'gd', 'common'] },
  testToxic: { template: 'quiz-toxic', namespaces: ['quiz-toxic', 'quizzes', 'quizGames', 'gd', 'common'] },
  testRedFlag: { template: 'quiz-red-flag', namespaces: ['quiz-red-flag', 'quizzes', 'quizGames', 'gd', 'common'] },
  testPervers: { template: 'quiz-pervers-narcissique', namespaces: ['quiz-pervers-narcissique', 'quizzes', 'quizGames', 'gd', 'common'] },
  testAmourHabitude: { template: 'quiz-amour-habitude', namespaces: ['quiz-amour-habitude', 'quizzes', 'quizGames', 'gd', 'common'] },
  testAmourAttachement: { template: 'quiz-amour-attachement', namespaces: ['quiz-amour-attachement', 'quizzes', 'quizGames', 'gd', 'common'] },
  testJeLaimeEncore: { template: 'quiz-je-l-aime-encore', namespaces: ['quiz-je-l-aime-encore', 'quizzes', 'quizGames', 'gd', 'common'] },
  testCoupleSain: { template: 'quiz-couple-sain', namespaces: ['quiz-couple-sain', 'quizzes', 'quizGames', 'gd', 'common'] },
  testMariage: { template: 'quiz-mariage', namespaces: ['quiz-mariage', 'quizzes', 'quizGames', 'gd', 'common'] },
  testDivorce: { template: 'quiz-divorce', namespaces: ['quiz-divorce', 'quizzes', 'quizGames', 'gd', 'common'] },
  quizAmoureux: { template: 'quiz-amoureux', namespaces: ['quiz-amoureux', 'quizzes', 'quizGames', 'gd', 'common'] },
  quizTypeCouple: { template: 'quiz-type-couple', namespaces: ['quiz-type-couple', 'quizzes', 'quizGames', 'gd', 'common'] },
  quizCoquin: { template: 'quiz-coquin', namespaces: ['quiz-coquin', 'quizzes', 'quizGames', 'gd', 'common'] },
  quizMarrant: { template: 'quiz-marrant', namespaces: ['quiz-marrant', 'quizzes', 'quizGames', 'gd', 'common'] },
  quizKnowledge: { template: 'quiz-knowledge', namespaces: ['quiz-knowledge', 'quizzes', 'quizGames', 'gd', 'common'] },
  quizMost: { template: 'quiz-most', namespaces: ['quiz-most', 'quizzes', 'quizGames', 'gd', 'common'] },
  questionsCouple: { template: 'questions-couple', namespaces: ['quiz-questions-couple', 'quizzes', 'common'] },
  legalMentions: { template: 'legal', namespaces: ['legal', 'cgv', 'common'] },
  privacy: { template: 'privacy', namespaces: ['legal', 'common'] },
  blog: { template: 'blog-listing', namespaces: ['common'] },
  quizAdo: { template: 'quiz-ado', namespaces: ['quiz-ado', 'quizzes', 'quizGames', 'gd', 'common'] },
  testParentalite: { template: 'quiz-parentalite', namespaces: ['quiz-parentalite', 'quizzes', 'quizGames', 'gd', 'common'] },
  testEmmenager: { template: 'quiz-emmenager', namespaces: ['quiz-emmenager', 'quizzes', 'quizGames', 'gd', 'common'] },
  testAstroPrenoms: { template: 'quiz-astro-prenoms', namespaces: ['quiz-astro-prenoms', 'quizzes', 'common'] },
  calculatriceAmour: { template: 'calculatrice-amour', namespaces: ['calculatrice-amour', 'quizzes', 'common'] },
  compteurCouple: { template: 'compteur-couple', namespaces: ['compteur-couple', 'quizzes', 'common'] },
  bilanCouple: { template: 'bilan-couple', namespaces: ['bilan', 'quizzes', 'common'] },
  cgv: { template: 'cgv', namespaces: ['cgv', 'common'] },
  testDateNaissance: { template: 'quiz-date-naissance', namespaces: ['quiz-date-naissance', 'quizzes', 'common'] },
  testSignesChinois: { template: 'quiz-signes-chinois', namespaces: ['quiz-signes-chinois', 'quizzes', 'common'] },
  testJalousie: { template: 'quiz-jalousie', namespaces: ['quiz-jalousie', 'quizzes', 'quizGames', 'gd', 'common'] },
  testKarmique: { template: 'quiz-karmique', namespaces: ['quiz-karmique', 'quizzes', 'quizGames', 'gd', 'common'] },
  testAmeSoeur: { template: 'quiz-ame-soeur', namespaces: ['quiz-ame-soeur', 'quizzes', 'quizGames', 'gd', 'common'] },
  testSuisJeAmoureux: { template: 'quiz-suis-je-amoureux', namespaces: ['quiz-suis-je-amoureux', 'quizzes', 'quizGames', 'gd', 'common'] },
  jeuxCouple: { template: 'jeux-couple', namespaces: ['jeux-couple', 'quizzes', 'common'] },
  jeuGages: { template: 'jeu-gages', namespaces: ['jeu-gages', 'quizzes', 'quizGames', 'gd', 'common'] },
  jeuPlateau: { template: 'jeu-plateau', namespaces: ['jeu-plateau', 'quizzes', 'quizGames', 'gd', 'common'] },
  jeuQuiDeNous: { template: 'jeu-qui-de-nous', namespaces: ['jeu-qui-de-nous', 'quizzes', 'quizGames', 'gd', 'common'] },
  jeuActionVerite: { template: 'jeu-action-verite', namespaces: ['jeu-action-verite', 'quizzes', 'quizGames', 'gd', 'common'] },
  jeuActionVeriteHot: { template: 'jeu-action-verite-hot', namespaces: ['jeu-action-verite-hot', 'quizzes', 'quizGames', 'gd', 'common'] },
  quizGenant: { template: 'quiz-genant', namespaces: ['quiz-genant', 'quizzes', 'quizGames', 'gd', 'common'] },
  testLangageAmour: { template: 'quiz-langage-amour', namespaces: ['quiz-langage-amour', 'quizzes', 'quizGames', 'gd', 'common'] },
  testPersonnalite: { template: 'quiz-personnalite', namespaces: ['quiz-personnalite', 'quizzes', 'quizGames', 'gd', 'common'] },
  quizTuPreferes: { template: 'quiz-tu-preferes', namespaces: ['quiz-tu-preferes', 'quizzes', 'quizGames', 'gd', 'common'] },
  quizVraiFaux: { template: 'quiz-vrai-faux', namespaces: ['quiz-vrai-faux', 'quizzes', 'quizGames', 'gd', 'common'] },
  testAttachement: { template: 'quiz-attachement', namespaces: ['quiz-attachement', 'quizzes', 'quizGames', 'gd', 'common'] },
  testDependance: { template: 'quiz-dependance', namespaces: ['quiz-dependance', 'quizzes', 'quizGames', 'gd', 'common'] },
  testConfiance: { template: 'quiz-confiance', namespaces: ['quiz-confiance', 'quizzes', 'quizGames', 'gd', 'common'] },
  testInfidelite: { template: 'quiz-infidelite', namespaces: ['quiz-infidelite', 'quizzes', 'quizGames', 'gd', 'common'] },
  testCouche: { template: 'quiz-couche', namespaces: ['quiz-couche', 'quizzes', 'quizGames', 'gd', 'common'] },
  testSecret: { template: 'quiz-secret', namespaces: ['quiz-secret', 'quizzes', 'quizGames', 'gd', 'common'] },
  testDistanceAime: { template: 'quiz-distance-aime', namespaces: ['quiz-distance-aime', 'quizzes', 'quizGames', 'gd', 'common'] },
  testEx: { template: 'quiz-ex', namespaces: ['quiz-ex', 'quizzes', 'quizGames', 'gd', 'common'] },
  testEncoreAmoureuxEx: { template: 'quiz-encore-amoureux-ex', namespaces: ['quiz-encore-amoureux-ex', 'quizzes', 'quizGames', 'gd', 'common'] },
  testOublierEx: { template: 'quiz-oublier-ex', namespaces: ['quiz-oublier-ex', 'quizzes', 'quizGames', 'gd', 'common'] },
  testExRevenir: { template: 'quiz-ex-revenir', namespaces: ['quiz-ex-revenir', 'quizzes', 'quizGames', 'gd', 'common'] },
  testRemettreEx: { template: 'quiz-remettre-ex', namespaces: ['quiz-remettre-ex', 'quizzes', 'quizGames', 'gd', 'common'] },
  testOublieSonEx: { template: 'quiz-oublie-son-ex', namespaces: ['quiz-oublie-son-ex', 'quizzes', 'quizGames', 'gd', 'common'] },
  testPourquoiQuitte: { template: 'quiz-pourquoi-quitte', namespaces: ['quiz-pourquoi-quitte', 'quizzes', 'quizGames', 'gd', 'common'] },
  testAimeEncore: { template: 'quiz-aime-encore', namespaces: ['quiz-aime-encore', 'quizzes', 'quizGames', 'gd', 'common'] },
  testEmprise: { template: 'quiz-emprise', namespaces: ['quiz-emprise', 'quizzes', 'quizGames', 'gd', 'common'] },
  testTrouverAmour: { template: 'quiz-trouver-amour', namespaces: ['quiz-trouver-amour', 'quizzes', 'quizGames', 'gd', 'common'] },
  testCelibataire: { template: 'quiz-celibataire', namespaces: ['quiz-celibataire', 'quizzes', 'quizGames', 'gd', 'common'] },
  testCoupleOuCelibat: { template: 'quiz-couple-ou-celibat', namespaces: ['quiz-couple-ou-celibat', 'quizzes', 'quizGames', 'gd', 'common'] },
  testCompatSexuelle: { template: 'quiz-compatibilite-sexuelle', namespaces: ['quiz-compatibilite-sexuelle', 'quizzes', 'quizGames', 'gd', 'common'] },
  testEstCeLeBon: { template: 'quiz-est-ce-le-bon', namespaces: ['quiz-est-ce-le-bon', 'quizzes', 'quizGames', 'gd', 'common'] },
  testPretRelation: { template: 'quiz-pret-nouvelle-relation', namespaces: ['quiz-pret-nouvelle-relation', 'quizzes', 'quizGames', 'gd', 'common'] },
  testDureeCelibat: { template: 'quiz-duree-celibat', namespaces: ['quiz-duree-celibat', 'quizzes', 'quizGames', 'gd', 'common'] },
  testAmourAmi: { template: 'quiz-amour-ami', namespaces: ['quiz-amour-ami', 'quizzes', 'quizGames', 'gd', 'common'] },
  testChargeMentale: { template: 'quiz-charge-mentale', namespaces: ['quiz-charge-mentale', 'quizzes', 'quizGames', 'gd', 'common'] },
  quizRencontre: { template: 'quiz-rencontre', namespaces: ['quiz-rencontre', 'quizzes', 'quizGames', 'gd', 'common'] },
  zamours: { template: 'quiz-zamours', namespaces: ['quiz-zamours', 'quizzes', 'quizGames', 'gd', 'common'], frOnly: true },
  testVacances: { template: 'quiz-vacances', namespaces: ['quizzes', 'common'], frOnly: true },
  jeuDilemmes: { template: 'jeu-dilemmes', namespaces: ['jeu-dilemmes', 'quizzes', 'quizGames', 'gd', 'common'] },
  testAmourAmitie: { template: 'quiz-amour-amitie', namespaces: ['quiz-amour-amitie', 'quizzes', 'quizGames', 'gd', 'common'] },
  testCrush: { template: 'quiz-crush', namespaces: ['quiz-crush', 'quizzes', 'quizGames', 'gd', 'common'] },
  testFinCouple: { template: 'quiz-fin-couple', namespaces: ['quiz-fin-couple', 'quizzes', 'quizGames', 'gd', 'common'] },
  pourContre: { template: 'jeu-pour-contre', namespaces: ['jeu-pour-contre', 'quizzes', 'quizGames', 'gd', 'common'] },
  jeuJamais: { template: 'jeu-jamais', namespaces: ['jeu-jamais', 'quizzes', 'quizGames', 'gd', 'common'] },
  jeuQuiPourrait: { template: 'jeu-qui-pourrait', namespaces: ['jeu-qui-pourrait', 'quizzes', 'quizGames', 'gd', 'common'] },
  jeuOuiNon: { template: 'jeu-oui-non', namespaces: ['jeu-oui-non', 'quizzes', 'quizGames', 'gd', 'common'] },
  jeuPhrases: { template: 'jeu-phrases', namespaces: ['jeu-phrases', 'quizzes', 'quizGames', 'gd', 'common'] },
  jeuDixMais: { template: 'jeu-dix-mais', namespaces: ['jeu-dix-mais', 'quizzes', 'quizGames', 'gd', 'common'] },
  jeuSoireeCouples: { template: 'jeu-soiree-couples', namespaces: ['jeu-soiree-couples', 'quizzes', 'quizGames', 'gd', 'common'] },
  speciauxCouple: { template: 'quiz-speciaux', namespaces: ['quiz-speciaux', 'quizzes', 'common'] },
  quizSerialKiller: { template: 'quiz-serial-killer', namespaces: ['quiz-serial-killer', 'quizzes', 'quizGames', 'gd', 'common'] },
  quizMortFilmHorreur: { template: 'quiz-film-horreur', namespaces: ['quiz-film-horreur', 'quizzes', 'quizGames', 'gd', 'common'] },
  quizPossession: { template: 'quiz-possession', namespaces: ['quiz-possession', 'quizzes', 'quizGames', 'gd', 'common'] },
  quizSuperVilain: { template: 'quiz-super-vilain', namespaces: ['quiz-super-vilain', 'quizzes', 'quizGames', 'gd', 'common'] },
  quizDuoVilains: { template: 'quiz-duo-vilains', namespaces: ['quiz-duo-vilains', 'quizzes', 'quizGames', 'gd', 'common'] },
  quizTentation: { template: 'quiz-tentation', namespaces: ['quiz-tentation', 'quizzes', 'quizGames', 'gd', 'common'] },
  testPurete: { template: 'test-purete', namespaces: ['test-purete', 'quizzes', 'common'] },
  admin: { template: 'admin', namespaces: ['common'] },
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

// ── Le bilan de couple payant ───────────────────────────────────────────
// Un seul interrupteur (docs/bilan/CONCEPTION.md, « Ce qu'il faut de Thomas
// avant d'ouvrir »). Tant qu'il est à false : la page existe mais n'est pas
// indexée ni dans le sitemap, elle n'est dans aucun menu, les liens écrits
// vers elle dans les textes sont neutralisés à la construction, et les
// écrans de résultat des tests ne la proposent pas. Ouvert le 20 octobre
// 2026 (Thomas : « Met tout en on, on lance la machine. Ouvre. »), une fois
// le compte Stripe branché (secrets STRIPE_SECRET_KEY et
// STRIPE_WEBHOOK_SECRET chez Supabase) et VENDEUR rempli ; le workflow
// « Évaluation de couple · santé » (bilan-sante.yml) vérifie que les secrets
// sont là et que les fonctions répondent.
// QC_BILAN=ouvert ou QC_BILAN=ferme force le choix pour une construction.
export const BILAN_OUVERT = process.env.QC_BILAN === 'ouvert' ? true
  : process.env.QC_BILAN === 'ferme' ? false
  : true;
// Les pages qui envoient vers le bilan, une fois ouvert : l'encart sous le
// verdict (encartBilan, quiz-engine-core.js) et la bannière au-dessus des
// cartes « À faire ensuite » (related-tests.ejs). Le groupe choisit le texte :
// `score`, un test fait à deux qui rend un chiffre ou un profil ; `projet`,
// avant une grande étape ; `doute`, quand on se pose des questions sur son
// couple. L'identifiant part avec le clic (data-bilan-src="resultat-<id>"
// ou "bas-<id>", lu par audience.js, jamais dans l'adresse) et se lit dans l'onglet Bilan de l'admin. Jamais les pages
// d'emprise, de violence, de manipulation ou d'infidélité : le bilan montre à
// chacun les réponses de l'autre.
export const BILAN_ENTREES = {
  // `sousMoteur` : la carte de l'évaluation juste sous le moteur, en plus de
  // l'encart du résultat et de la bannière du bas (20 octobre 2026, Thomas :
  // « mettre mieux en avant l'évaluation de couple » sur ces deux tests) ;
  // partials/bilan-sous-moteur.ejs, inclus par quiz-generic.ejs.
  testCouple: { groupe: 'score', id: 'tester-couple', sousMoteur: true },
  testCompatibilite: { groupe: 'score', id: 'compatibilite', sousMoteur: true },
  testCommonPoints: { groupe: 'score', id: 'points-communs' },
  quizAmoureux: { groupe: 'score', id: 'amoureux' },
  quizTypeCouple: { groupe: 'score', id: 'type-couple' },
  testCompatSexuelle: { groupe: 'score', id: 'compat-sexuelle' },
  testLangageAmour: { groupe: 'score', id: 'langage-amour' },
  testEmmenager: { groupe: 'projet', id: 'emmenager' },
  testMariage: { groupe: 'projet', id: 'mariage' },
  testParentalite: { groupe: 'projet', id: 'parentalite' },
  testEstCeLeBon: { groupe: 'projet', id: 'est-ce-le-bon' },
  testFinCouple: { groupe: 'doute', id: 'fin-couple' },
  testCoupleSain: { groupe: 'doute', id: 'couple-sain' },
  testChargeMentale: { groupe: 'doute', id: 'charge-mentale' },
  testDistance: { groupe: 'doute', id: 'distance' },
  testDivorce: { groupe: 'doute', id: 'divorce' },
  testConfiance: { groupe: 'doute', id: 'confiance' },
  testAmourHabitude: { groupe: 'doute', id: 'amour-habitude' },
  testJeLaimeEncore: { groupe: 'doute', id: 'je-l-aime-encore' },
  // Depuis le 19 octobre 2026 (Thomas : « on ne va pas compter sur le SEO
  // pour vendre »), presque toute la famille des tests de couple, les jeux
  // (groupe `jeu`) et le hub des questions (groupe `questions`) ; le mode
  // seul(e) permet d'y renvoyer depuis les tests où l'on doute. Toujours
  // rien depuis l'emprise, la manipulation et l'infidélité.
  testToxic: { groupe: 'doute', id: 'toxique' },
  testRedFlag: { groupe: 'doute', id: 'red-flag' },
  testOublieSonEx: { groupe: 'doute', id: 'oublie-son-ex' },
  testJalousie: { groupe: 'doute', id: 'jalousie' },
  testAmourAttachement: { groupe: 'doute', id: 'amour-attachement' },
  testAimeEncore: { groupe: 'doute', id: 'aime-encore' },
  testDistanceAime: { groupe: 'doute', id: 'distance-aime' },
  testDependance: { groupe: 'doute', id: 'dependance' },
  testAttachement: { groupe: 'score', id: 'attachement' },
  testAmeSoeur: { groupe: 'score', id: 'ame-soeur' },
  testCouche: { groupe: 'score', id: 'couche' },
  testPersonnalite: { groupe: 'score', id: 'personnalite' },
  testKarmique: { groupe: 'score', id: 'karmique' },
  testVacances: { groupe: 'projet', id: 'vacances' },
  quizCoquin: { groupe: 'score', id: 'coquin' },
  quizKnowledge: { groupe: 'score', id: 'connaissance' },
  quizGenant: { groupe: 'score', id: 'genant' },
  quizTuPreferes: { groupe: 'jeu', id: 'tu-preferes' },
  jeuDilemmes: { groupe: 'jeu', id: 'dilemmes' },
  jeuQuiDeNous: { groupe: 'jeu', id: 'qui-de-nous' },
  jeuJamais: { groupe: 'jeu', id: 'jamais' },
  jeuQuiPourrait: { groupe: 'jeu', id: 'qui-pourrait' },
  jeuDixMais: { groupe: 'jeu', id: 'dix-mais' },
  jeuSoireeCouples: { groupe: 'jeu', id: 'soiree' },
  jeuOuiNon: { groupe: 'jeu', id: 'oui-non' },
  pourContre: { groupe: 'jeu', id: 'pour-contre' },
  jeuPhrases: { groupe: 'jeu', id: 'phrases' },
  jeuActionVerite: { groupe: 'jeu', id: 'action-verite' },
  jeuGages: { groupe: 'jeu', id: 'gages' },
  jeuPlateau: { groupe: 'jeu', id: 'plateau' },
  questionsCouple: { groupe: 'questions', id: 'questions-couple' },
};
// Les mentions obligatoires d'un vendeur (mentions légales et conditions de
// vente). Un champ vide n'est pas affiché. L'entreprise de Thomas est une
// entreprise individuelle (nom de l'entrepreneur suivi de « EI » dans les
// mentions légales), sans TVA (franchise en base). Pas de médiateur de la
// consommation : choix de Thomas (18 octobre 2026), la section « Réclamations »
// des CGV s'écrit alors sans (pSans de {lang}/cgv.json) ; un médiateur se
// déclare ici, mediateur: { nom, site }, et la phrase revient d'elle-même.
// La porte e-mail des écrans de résultat (19 octobre 2026, Thomas : « si je
// récolte des emails tous les jours, je vais pouvoir contacter les gens pour
// leur promouvoir le test payant, avec des codes de réduction ») : les tests
// de couple et les quiz à résultat (les groupes score, projet et doute de
// BILAN_ENTREES), jamais les tests célibataires, les jeux ni les questions.
// Le body porte data-capture="<id>", capture.js floute le résultat après le
// titre jusqu'à ce qu'une adresse soit laissée (table abonnes, fonction
// lead-capture) ; l'id est la source gardée avec l'adresse.
// Le jeu de soirée pour couples est la seule exception parmi les jeux
// (27 octobre 2026, Thomas : « pour avoir les résultats, il faut qu'ils
// mettent leur mail, 5 couples c'est 5 adresses voire 10 ! ») : le podium
// s'affiche sur chaque téléphone derrière la porte, source `soiree`.
export const CAPTURE_PAGES = {
  ...Object.fromEntries(Object.entries(BILAN_ENTREES)
    .filter(([, e]) => e.groupe === 'score' || e.groupe === 'projet' || e.groupe === 'doute')
    .map(([cle, e]) => [cle, e.id])),
  jeuSoireeCouples: 'soiree',
};

// Les moyens de paiement dessinés sous le prix, dans le hero de la page de
// vente (20 octobre 2026, Thomas : « le pictogramme carte, apple pay, amazon
// pay, ça peut rassurer »). Stripe Checkout propose ce que le tableau de bord
// Stripe a d'activé : les cartes toujours, Apple Pay et Google Pay d'office sur
// les appareils qui les ont, Amazon Pay seulement s'il est activé dans
// Paramètres > Moyens de paiement. On retire d'ici un moyen qui n'est pas
// activé : un pictogramme qui promet un moyen absent de la page de paiement
// ferait l'inverse de rassurer. Les dessins sont dans bilan-couple.ejs
// (PICTOS_PAIEMENT), un nom inconnu ici n'affiche rien. Amazon Pay est sorti
// de la liste le 23 octobre 2026, à la demande de Thomas (son dessin reste).
export const MOYENS_PAIEMENT = ['visa', 'mastercard', 'cb', 'applepay', 'googlepay'];

export const VENDEUR = {
  nom: 'Visibilitea',
  dirigeant: 'Thomas Owaller',
  statut: { fr: 'Entreprise individuelle (EI) de Thomas Owaller', en: 'Sole proprietorship of Thomas Owaller (French entreprise individuelle)', es: 'Empresa individual de Thomas Owaller (entreprise individuelle francesa)', de: 'Einzelunternehmen von Thomas Owaller (französische entreprise individuelle)', it: 'Impresa individuale di Thomas Owaller (entreprise individuelle francese)' },
  siret: '940 106 800 00011',
  adresse: '4 rue de Bruges, 67000 Strasbourg',
  email: 'infoquizcouple@gmail.com',
  // La LCEN (art. 6-III) et le Code de la consommation (L221-5) demandent un
  // numéro de téléphone ; vide tant que Thomas n'en donne pas, et alors rien
  // n'est affiché. Le médiateur de la consommation (L612-1, obligatoire) se
  // renseigne de même : mediateur: { nom: '...', site: 'https://...' }, et la
  // section « Réclamations et médiation » des CGV s'écrit alors avec son nom.
  telephone: '',
};

// ── La saison du site ────────────────────────────────────────────────────
// Un habillage léger, posé et retiré d'un seul geste (Thomas, 16 octobre
// 2026 : « un design Halloween du site, vraiment léger... un truc qui peut
// facilement s'ajouter et facilement s'enlever »). Entre `du` et `au` (jours
// inclus, heure de Paris), le body porte la classe saison-<nom> et
// data-saison="<nom>", la feuille css/saison/<nom>.css est écrite dans le
// <head> (jamais sur l'admin), et les mascottes reçoivent leurs déguisements
// (SAISONS dans reseaux/charte/mascottes.js) sur le hero de l'accueil et dans
// les moteurs. La reconstruction programmée (sept fois par jour) l'allume et
// l'éteint toute seule aux dates ; QC_SAISON=aucune ou QC_SAISON=halloween
// force le choix pour une construction. Rien de tout ça ne touche les
// réseaux sociaux. Pour retirer l'habillage avant la date : SAISON = null.
export const SAISON = { nom: 'halloween', du: '2026-10-16', au: '2026-11-01' };
export function saisonActive(maintenant = new Date()) {
  const force = process.env.QC_SAISON;
  if (force) return ['aucune', 'none', '0', ''].includes(force) ? null : force;
  if (!SAISON) return null;
  const jour = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }).format(maintenant);
  return jour >= SAISON.du && jour <= SAISON.au ? SAISON.nom : null;
}
// La régie du site est The Moneytizer. Le fichier ads.txt qu'elle fournit est
// écrit tel quel dans public/, il déclare quiz-couple.com comme propriétaire
// et themoneytizer.com comme gestionnaire. Il n'y a plus d'identifiant
// publicitaire à poser dans les pages : leurs tags viennent de leur régie.

// Pages jouables. Elles portent le bloc d'avis, le compteur de parties et,
// des qu'elles ont de vrais avis, la note structuree. Les tests et les quiz
// se reconnaissent a leur cle ; les jeux, non, il faut donc les nommer.
// Sans cette liste, les six jeux ne remontaient aucune partie a l'admin.
export const ROUTES_JEUX = [
  'jeuActionVerite', 'jeuActionVeriteHot', 'jeuGages',
  'jeuPlateau', 'jeuQuiDeNous', 'jeuDilemmes', 'pourContre', 'jeuJamais', 'jeuQuiPourrait',
  'jeuOuiNon', 'jeuPhrases', 'jeuDixMais', 'jeuSoireeCouples',
];

// Les quatre familles de navigation, dans l'ordre d'affichage. C'est la seule
// liste : le menu (header.ejs), les carrousels de l'accueil (home.ejs), le
// pied de page (footer.ejs) et le plan du site (sitemap.ejs) la lisent tous.
// Écrites à la main dans chaque gabarit, les quatre copies avaient dérivé :
// pas le même ordre, le test de pureté et celui des vacances sur l'accueil
// mais pas dans le menu, quatre tests absents du plan du site. Une page
// réservée au français disparaît d'elle-même ailleurs, getLocalizedUrl ne lui
// donnant pas d'adresse. Le libellé de chaque lien est `nav.<clé>` dans
// common.json, le même partout.
export const FAMILLES_NAV = {
  tests: [
    // Le bilan de couple en tête des tests de couple, une fois ouvert.
    ...(BILAN_OUVERT ? ['bilanCouple'] : []),
    'testCouple', 'testCommonPoints', 'testCompatibilite', 'testCompatSexuelle', 'testDistance',
    'testFinCouple', 'testToxic', 'testRedFlag', 'testPervers', 'testEmprise',
    'testAmourHabitude', 'testAmourAttachement', 'testEstCeLeBon',
    'testJeLaimeEncore', 'testCoupleSain', 'testMariage', 'testDivorce',
    'testParentalite', 'testEmmenager', 'calculatriceAmour', 'compteurCouple',
    'testAstroPrenoms', 'testDateNaissance', 'testSignesChinois',
    'testJalousie', 'testLangageAmour', 'testPersonnalite', 'testAttachement',
    'testConfiance', 'testDependance', 'testAmeSoeur', 'testKarmique',
    'testInfidelite', 'testCouche', 'testAimeEncore', 'testOublieSonEx', 'testDistanceAime',
    'testChargeMentale', 'testPurete', 'testVacances',
  ],
  celib: [
    'testTrouverAmour', 'testCelibataire', 'testDureeCelibat', 'testCoupleOuCelibat',
    'testPretRelation', 'testSuisJeAmoureux', 'testCrush', 'testAmourAmitie',
    'testAmourAmi', 'testSecret', 'testEx', 'testEncoreAmoureuxEx', 'testOublierEx', 'testExRevenir', 'testRemettreEx', 'testPourquoiQuitte',
  ],
  quiz: [
    'quizAmoureux', 'quizTypeCouple', 'quizRencontre', 'quizCoquin',
    'quizMarrant', 'quizKnowledge', 'quizMost', 'quizAdo', 'quizGenant',
    'quizVraiFaux', 'zamours', 'quizTentation',
  ],
  jeux: [
    'jeuSoireeCouples',
    'quizTuPreferes', 'jeuActionVerite', 'jeuActionVeriteHot', 'jeuGages',
    'jeuPlateau', 'jeuQuiDeNous', 'jeuDilemmes', 'pourContre', 'jeuJamais',
    'jeuQuiPourrait', 'jeuOuiNon', 'jeuPhrases', 'jeuDixMais',
  ],
  // Les quiz spéciaux de saison (16 octobre 2026, demande de Thomas) : le hub
  // speciauxCouple les répertorie tous et met en avant ceux de la saison en
  // cours (SAISON). Pour le moment, les cinq quiz d'Halloween ; ceux de Noël
  // viendront s'ajouter ici. Le menu, le pied de page, le plan du site et
  // l'accueil lisent cette liste comme les quatre autres.
  speciaux: [
    'quizSerialKiller', 'quizMortFilmHorreur', 'quizPossession', 'quizSuperVilain', 'quizDuoVilains',
  ],
};
// La saison de chaque quiz spécial : le hub et l'accueil mettent en avant ceux
// de la saison en cours, les autres restent jouables toute l'année.
export const SAISON_DES_QUIZ = {
  quizSerialKiller: 'halloween', quizMortFilmHorreur: 'halloween', quizPossession: 'halloween',
  quizSuperVilain: 'halloween', quizDuoVilains: 'halloween',
};

// Les outils : on donne deux prenoms ou deux dates, la page rend un resultat,
// il n'y a pas de question posee. Ils ne se reconnaissent ni a leur cle ni a
// leur gabarit, il faut donc les nommer aussi. Sans ca, la calculatrice de
// l'amour n'avait ni compteur, ni bloc d'avis, ni interstitiel au resultat,
// alors que la compatibilite par date de naissance, qui marche pareil, a les
// trois (sa cle commence par « quiz »).
const ROUTES_OUTILS = ['calculatriceAmour', 'compteurCouple'];

export function estPageJouable(routeKey) {
  if (!routeKey || routeKey === 'home') return false;
  return /^(test|quiz)/.test(routeKey) || routeKey === 'zamours' ||
         ROUTES_JEUX.includes(routeKey) || ROUTES_OUTILS.includes(routeKey);
}

// Pages qui portent de la publicite. La liste dit l'inverse de la precedente :
// on nomme ce qui n'en porte pas, parce que c'est le petit nombre et parce que
// c'est ce qui doit rester vrai quoi qu'il arrive. Une page de mentions
// legales, un formulaire de contact ou le tableau de bord n'ont rien a
// monetiser, et une publicite sur la page de confirmation d'un ebook qu'on
// vient de promettre ferait mauvais genre.
const ROUTES_SANS_PUB = [
  'admin', 'legalMentions', 'privacy', 'contact', 'ebookConfirm', 'sitemap', '404',
  // Le bilan est un produit payant : une page de publicité à côté le
  // dévaloriserait, et ses écrans se succèdent sans fin de page.
  'bilanCouple', 'cgv',
];

export function pagePublicitaire(routeKey) {
  if (!routeKey) return false;
  return !ROUTES_SANS_PUB.includes(routeKey);
}

// « Ce jeu a deja ete joue » / « ce quiz a deja ete joue » / « ce test a deja
// ete realise » : le mot depend du genre de page, pas du prefixe de la cle.
// Les Z'Amours porte la cle « zamours » mais reste un quiz.
export function genrePageJouable(routeKey) {
  if (ROUTES_OUTILS.includes(routeKey)) return 'outil';
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
  const alts = LANGUES_PUBLIQUES.map(lang => ({
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
  psychologie: {
    fr: 'Psychologie',
    en: 'Psychology',
    es: 'Psicología',
    de: 'Psychologie',
    it: 'Psicologia',
  },
  // Les ex (28 octobre 2026, Thomas : « nouvelle catégorie de blog « Ex » ») :
  // rester ami, être quitté pour quelqu'un d'autre, les phases de la rupture.
  ex: {
    fr: 'Ex',
    en: 'Exes',
    es: 'Ex',
    de: 'Ex',
    it: 'Ex',
  },
  // Les histoires vraies de couples célèbres (22 octobre 2026), écrites pour
  // Google Discover : un couple, un fait vérifié, des sources citées.
  histoires: {
    fr: "Histoires d'amour",
    en: 'Love stories',
    es: 'Historias de amor',
    de: 'Liebesgeschichten',
    it: "Storie d'amore",
  },
};

// Blog article metadata
export const BLOG_ARTICLES = [
  {
    internalSlug: 'homme-nerveux-devant-une-femme',
    category: 'psychologie',
    featuredImage: '/blog/homme-nerveux-devant-une-femme.webp',
    slugs: {
      fr: 'homme-nerveux-devant-une-femme',
      en: 'signs-a-man-is-nervous-around-you',
      es: 'hombre-nervioso-delante-de-una-mujer',
      de: 'mann-nervoes-vor-einer-frau',
      it: 'uomo-nervoso-davanti-a-una-donna',
    },
    publishedAt: '2026-08-26T16:20:00+02:00',
  },
  {
    internalSlug: 'il-annule-au-dernier-moment',
    category: 'psychologie',
    featuredImage: '/blog/il-annule-au-dernier-moment.webp',
    slugs: {
      fr: 'il-annule-au-dernier-moment',
      en: 'he-cancelled-last-minute',
      es: 'cancela-en-el-ultimo-momento',
      de: 'er-sagt-in-letzter-minute-ab',
      it: 'annulla-all-ultimo-momento',
    },
    publishedAt: '2026-08-28T14:41:00+02:00',
  },
  {
    internalSlug: 'homme-qu-on-ignore',
    category: 'psychologie',
    featuredImage: '/blog/homme-qu-on-ignore.webp',
    slugs: {
      fr: 'homme-qu-on-ignore',
      en: 'how-men-feel-when-ignored',
      es: 'que-siente-un-hombre-cuando-lo-ignoras',
      de: 'was-fuehlt-ein-mann-wenn-man-ihn-ignoriert',
      it: 'cosa-prova-un-uomo-quando-lo-ignori',
    },
    publishedAt: '2026-08-26T09:30:00+02:00',
  },
  {
    // Article français uniquement : les citations signées sont des textes
    // français (Hugo, Sand, Prévert, Lamartine) et la requête n'a pas
    // d'équivalent dans les autres langues. Les traduire donnerait quatre
    // pages faibles au lieu d'une bonne.
    internalSlug: 'citation-ame-soeur',
    category: 'vie-de-couple',
    frOnly: true,
    featuredImage: '/blog/citation-ame-soeur.webp',
    slugs: {
      fr: 'citation-ame-soeur',
    },
    publishedAt: '2026-08-25T17:34:00+02:00',
  },
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
    category: 'ex',
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
    internalSlug: 'femme-malheureuse-en-couple',
    featuredImage: '/blog/femme-malheureuse-en-couple.webp',
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
    featuredImage: '/blog/red-flags-homme.webp',
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
    featuredImage: '/blog/red-flags-femme.webp',
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
    featuredImage: '/blog/love-bombing.webp',
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
    featuredImage: '/blog/copain-ne-fait-pas-effort.webp',
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
    featuredImage: '/blog/lexique-relations-2026.webp',
    category: 'vie-de-couple',
    frOnly: true,
    slugs: {
      fr: 'lexique-relations-2026',
    },
    publishedAt: '2026-03-11',
  },
  {
    internalSlug: 'dependance-affective',
    featuredImage: '/blog/dependance-affective.webp',
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
    publishedAt: '2026-08-22T15:20:00+02:00',
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
    publishedAt: '2026-08-25T13:18:00+02:00',
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
    publishedAt: '2026-08-29T15:25:00+02:00',
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
    publishedAt: '2026-09-01T11:34:00+02:00',
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
    publishedAt: '2026-09-05T09:15:00+02:00',
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
    publishedAt: '2026-09-08T13:26:00+02:00',
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
    publishedAt: '2026-09-12T11:33:00+02:00',
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
    publishedAt: '2026-09-15T13:53:00+02:00',
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
    publishedAt: '2026-09-19T09:26:00+02:00',
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
    publishedAt: '2026-09-22T11:32:00+02:00',
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
    publishedAt: '2026-09-26T09:25:00+02:00',
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
    publishedAt: '2026-09-29T17:24:00+02:00',
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
    publishedAt: '2026-10-03T11:34:00+02:00',
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
    publishedAt: '2026-10-06T09:45:00+02:00',
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
    publishedAt: '2026-10-10T13:37:00+02:00',
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
    publishedAt: '2026-10-13T17:47:00+02:00',
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
    publishedAt: '2026-10-17T09:54:00+02:00',
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
    publishedAt: '2026-10-20T11:16:00+02:00',
  },
  {
    internalSlug: 'marie-antoinette-fersen-lettres',
    category: 'histoires',
    featuredImage: '/blog/marie-antoinette-fersen-lettres.webp',
    slugs: {
      fr: 'marie-antoinette-fersen-lettres',
      en: 'marie-antoinette-fersen-letters',
      es: 'maria-antonieta-fersen-cartas',
      de: 'marie-antoinette-fersen-briefe',
      it: 'maria-antonietta-fersen-lettere',
    },
    publishedAt: '2026-10-22T16:30:00+02:00',
  },
  {
    internalSlug: 'pierre-marie-curie-histoire-amour',
    category: 'histoires',
    featuredImage: '/blog/pierre-marie-curie-histoire-amour.webp',
    slugs: {
      fr: 'pierre-marie-curie-histoire-amour',
      en: 'pierre-marie-curie-love-story',
      es: 'pierre-marie-curie-historia-amor',
      de: 'pierre-marie-curie-liebesgeschichte',
      it: 'pierre-marie-curie-storia-amore',
    },
    publishedAt: '2026-10-23T08:10:00+02:00',
  },
  {
    internalSlug: 'juliette-drouet-victor-hugo-lettres',
    category: 'histoires',
    featuredImage: '/blog/juliette-drouet-victor-hugo-lettres.webp',
    slugs: {
      fr: 'juliette-drouet-victor-hugo-lettres',
      en: 'juliette-drouet-victor-hugo-letters',
      es: 'juliette-drouet-victor-hugo-cartas',
      de: 'juliette-drouet-victor-hugo-briefe',
      it: 'juliette-drouet-victor-hugo-lettere',
    },
    publishedAt: '2026-10-24T08:20:00+02:00',
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
    publishedAt: '2026-10-24T13:37:00+02:00',
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
    publishedAt: '2026-10-27T14:30:00+01:00',
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
    publishedAt: '2026-10-31T08:38:00+01:00',
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
    publishedAt: '2026-11-03T10:33:00+01:00',
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
    publishedAt: '2026-11-07T12:21:00+01:00',
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
    publishedAt: '2026-11-10T10:20:00+01:00',
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
    publishedAt: '2026-11-14T16:55:00+01:00',
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
    publishedAt: '2026-11-17T14:15:00+01:00',
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
    publishedAt: '2026-11-21T12:28:00+01:00',
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
    publishedAt: '2026-11-24T10:38:00+01:00',
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
    publishedAt: '2026-11-28T08:25:00+01:00',
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
    publishedAt: '2026-12-01T12:20:00+01:00',
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
    publishedAt: '2026-12-05T16:21:00+01:00',
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
    publishedAt: '2026-12-08T08:31:00+01:00',
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
    publishedAt: '2026-12-12T16:37:00+01:00',
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
    publishedAt: '2026-12-15T14:15:00+01:00',
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
    publishedAt: '2026-12-19T12:18:00+01:00',
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
    publishedAt: '2026-12-22T10:24:00+01:00',
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
    publishedAt: '2026-12-26T08:35:00+01:00',
  },
  {
    internalSlug: 'rester-ami-avec-son-ex',
    category: 'ex',
    featuredImage: '/blog/rester-ami-avec-son-ex.webp',
    slugs: {
      fr: 'rester-ami-avec-son-ex',
      en: 'can-you-be-friends-with-your-ex',
      es: 'se-puede-ser-amigo-de-tu-ex',
      de: 'mit-dem-ex-befreundet-bleiben',
      it: 'restare-amici-con-l-ex',
    },
    publishedAt: '2026-10-28T21:30:00+01:00',
  },
  {
    internalSlug: 'quitter-quelqu-un-pour-quelqu-un-d-autre',
    category: 'ex',
    featuredImage: '/blog/quitter-quelqu-un-pour-quelqu-un-d-autre.webp',
    slugs: {
      fr: 'on-ne-quitte-pas-quelqu-un-pour-quelqu-un-d-autre',
      en: 'leaving-someone-for-someone-else',
      es: 'dejar-a-alguien-por-otra-persona',
      de: 'jemanden-fuer-jemand-anderen-verlassen',
      it: 'lasciare-qualcuno-per-un-altro',
    },
    publishedAt: '2026-10-28T21:45:00+01:00',
  },
  {
    internalSlug: 'mon-ex-etait-il-le-bon',
    category: 'ex',
    featuredImage: '/blog/mon-ex-etait-il-le-bon.webp',
    slugs: {
      fr: 'mon-ex-etait-il-le-bon',
      en: 'was-my-ex-the-one',
      es: 'mi-ex-era-el-amor-de-mi-vida',
      de: 'war-mein-ex-der-richtige',
      it: 'il-mio-ex-era-quello-giusto',
    },
    publishedAt: '2026-10-28T22:20:00+01:00',
  },
  {
    internalSlug: 'se-remettre-ensemble-apres-plusieurs-ruptures',
    category: 'ex',
    featuredImage: '/blog/se-remettre-ensemble-apres-plusieurs-ruptures.webp',
    slugs: {
      fr: 'se-remettre-ensemble-apres-plusieurs-ruptures',
      en: 'on-again-off-again-relationship',
      es: 'relacion-intermitente',
      de: 'on-off-beziehung',
      it: 'relazione-tira-e-molla',
    },
    publishedAt: '2026-10-28T22:25:00+01:00',
  },
];

// Author data
export const AUTHORS = {
  thomas: {
    id: 'thomas',
    name: 'Thomas',
    avatar: '/authors/thomas-carre.webp',
    bios: {
      fr: "Créateur de Quiz Couple, Thomas, en couple depuis 4 ans, imagine des quiz, tests et jeux pour aider les couples à mieux se connaître, rire ensemble et partager de nouveaux moments.",
      en: "Creator of Quiz Couple, Thomas has been in a relationship for 4 years. He designs quizzes, tests and games to help couples get to know each other better, laugh together and share new moments.",
      es: "Creador de Quiz Couple, Thomas lleva 4 años en pareja. Idea quizzes, tests y juegos para ayudar a las parejas a conocerse mejor, reír juntas y compartir nuevos momentos.",
      de: "Thomas, der Gründer von Quiz Couple, ist seit 4 Jahren in einer Beziehung. Er entwickelt Quiz, Tests und Spiele, die Paaren helfen, sich besser kennenzulernen, gemeinsam zu lachen und Neues zu erleben.",
      it: "Creatore di Quiz Couple, Thomas è in coppia da 4 anni. Crea quiz, test e giochi per aiutare le coppie a conoscersi meglio, ridere insieme e condividere nuovi momenti.",
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
  const alts = LANGUES_PUBLIQUES.map(lang => ({
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

// Les articles du blog qui sont des listes de questions, dans l'ordre du
// curseur de la page « Questions pour couple » (questions-couple.ejs). Un
// article programmé n'apparaît qu'à la reconstruction qui suit sa date, et un
// article absent d'une langue n'a pas de carte dans cette langue. Un nouvel
// article de questions se déclare ici, et reçoit son étiquette dans
// listes.tags de {lang}/quiz-questions-couple.json.
export const ARTICLES_QUESTIONS = [
  'questions-pour-mieux-se-connaitre-en-couple',
  'questions-debut-de-relation',
  'questions-intimes-couple',
  'questions-avenir-couple',
  'questions-couple-telephone-message',
  '36-questions-pour-tomber-amoureux',
  'questions-a-poser-a-son-copain',
  'questions-a-poser-a-sa-copine',
  'questions-a-poser-a-son-crush',
  'questions-a-poser-a-une-fille',
];

// Quiz/test route → relevant existing blog articles (by internalSlug).
// Resolved at build time per language; articles not published in a language are
// filtered out automatically, so non-FR pages only show their available ones.
export const QUIZ_RELATED_ARTICLES = {
  testCouple:       ['comment-savoir-si-cest-le-bon', 'sauver-son-couple', 'manque-communication-couple'],
  testCommonPoints: ['comment-savoir-si-cest-le-bon', 'manque-communication-couple'],
  testCompatibilite: ['comment-savoir-si-cest-le-bon', 'sauver-son-couple', 'manque-communication-couple'],
  testDistance:     ['manque-communication-couple', 'sauver-son-couple'],
  testToxic:        ['choses-pas-accepter-couple', 'red-flags-homme', 'red-flags-femme', 'femme-malheureuse-en-couple'],
  // Le test red flag : les deux listes, le love bombing et les signes d'une relation toxique.
  testRedFlag:      ['red-flags-homme', 'red-flags-femme', 'love-bombing', 'relation-toxique-signes'],
  testPervers:      ['red-flags-homme', 'red-flags-femme', 'dependance-affective', 'choses-pas-accepter-couple'],
  testAmourHabitude:['comment-savoir-si-cest-le-bon', 'copain-ne-fait-pas-effort', 'sauver-son-couple', 'femme-malheureuse-en-couple', 'dependance-affective', 'manque-communication-couple'],
  testAmourAttachement: ['dependance-affective', 'sauver-son-couple', 'arreter-ou-continuer-relation', 'attachement-anxieux'],
  testJeLaimeEncore: ['arreter-ou-continuer-relation', 'sauver-son-couple', 'comment-savoir-si-cest-le-bon', 'les-phases-de-la-rupture-chez-l-homme'],
  testCoupleSain:   ['sauver-son-couple', 'disputes-couple', 'manque-communication-couple'],
  testMariage:      ['comment-savoir-si-cest-le-bon', 'charge-mentale-couple'],
  testDivorce:      ['les-phases-de-la-rupture-chez-l-homme', 'choses-pas-accepter-couple', 'sauver-son-couple'],
  testParentalite:  ['charge-mentale-couple', 'manque-communication-couple'],
  testEmmenager:    ['charge-mentale-couple', 'disputes-couple'],
  testJalousie:     ['dependance-affective', 'red-flags-homme', 'choses-pas-accepter-couple'],
  testLangageAmour: ['manque-communication-couple', 'sauver-son-couple'],
  testPersonnalite: ['5-langages-de-l-amour', 'styles-attachement-couple', 'comment-savoir-si-cest-le-bon'],
  testAttachement:  ['dependance-affective', 'comment-savoir-si-cest-le-bon', 'sauver-son-couple'],
  testDependance:   ['dependance-affective', 'love-bombing', 'sauver-son-couple'],
  testConfiance:    ['sauver-son-couple', 'red-flags-homme', 'disputes-couple'],
  testInfidelite:   ['red-flags-homme', 'red-flags-femme', 'choses-pas-accepter-couple'],
  testAstroPrenoms: ['compatibilite-amoureuse-belier', 'compatibilite-amoureuse-lion', 'compatibilite-amoureuse-scorpion'],
  calculatriceAmour: ['questions-a-poser-a-son-crush', '36-questions-pour-tomber-amoureux', 'questions-debut-de-relation'],
  compteurCouple: ['questions-avenir-couple', 'questions-pour-mieux-se-connaitre-en-couple', '5-langages-de-l-amour', 'activites-couple-ete'],
  quizAmoureux:     ['comment-savoir-si-cest-le-bon', 'sauver-son-couple'],
  quizTypeCouple: ['disputes-couple', 'manque-communication-couple', 'charge-mentale-couple', 'activites-couple-ete'],
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
  testSecret:       ['sentiments-chez-un-homme', 'comment-savoir-si-cest-le-bon', 'homme-qu-on-ignore', 'il-annule-au-dernier-moment', 'homme-nerveux-devant-une-femme'],
  testCouche:       ['red-flags-homme', 'red-flags-femme', 'choses-pas-accepter-couple'],
  testDistanceAime: ['manque-communication-couple', 'sentiments-chez-un-homme', 'arreter-ou-continuer-relation'],
  testEx:           ['les-phases-de-la-rupture-chez-l-homme', 'rester-ami-avec-son-ex', 'mon-ex-etait-il-le-bon', 'dependance-affective-rupture', 'arreter-ou-continuer-relation', 'homme-qu-on-ignore'],
  testEncoreAmoureuxEx: ['mon-ex-etait-il-le-bon', 'amour-ou-dependance-affective', 'rester-ami-avec-son-ex', 'les-phases-de-la-rupture-chez-l-homme', 'dependance-affective-rupture', 'sortir-de-la-dependance-affective', 'attachement-anxieux'],
  testOublierEx:    ['les-phases-de-la-rupture-chez-l-homme', 'mon-ex-etait-il-le-bon', 'rester-ami-avec-son-ex', 'sortir-de-la-dependance-affective', 'dependance-affective-rupture', 'amour-ou-dependance-affective', 'attachement-anxieux'],
  testExRevenir:    ['se-remettre-ensemble-apres-plusieurs-ruptures', 'les-phases-de-la-rupture-chez-l-homme', 'quitter-quelqu-un-pour-quelqu-un-d-autre', 'dependance-affective-rupture', 'amour-ou-dependance-affective', 'sortir-de-la-dependance-affective', 'attachement-anxieux'],
  testRemettreEx:   ['se-remettre-ensemble-apres-plusieurs-ruptures', 'mon-ex-etait-il-le-bon', 'amour-ou-dependance-affective', 'quitter-quelqu-un-pour-quelqu-un-d-autre', 'red-flags-homme', 'red-flags-femme', 'les-phases-de-la-rupture-chez-l-homme', 'dependance-affective-rupture'],
  testOublieSonEx:  ['rester-ami-avec-son-ex', 'jalousie-maladive', 'relation-toxique-signes', 'red-flags-homme', 'red-flags-femme', 'amour-ou-dependance-affective'],
  testPourquoiQuitte: ['quitter-quelqu-un-pour-quelqu-un-d-autre', 'mon-ex-etait-il-le-bon', 'les-phases-de-la-rupture-chez-l-homme', 'dependance-affective-rupture', 'disputes-couple', 'sortir-de-la-dependance-affective', 'attachement-anxieux'],
  testChargeMentale:['charge-mentale-couple', 'disputes-couple', 'manque-communication-couple'],
  // Les deux tests du doute et de l'emprise : les articles qui parlent des
  // sentiments qui s'effacent et de ce qu'on ne doit pas accepter.
  testAimeEncore:   ['sentiments-chez-un-homme', 'arreter-ou-continuer-relation', 'copain-ne-fait-pas-effort', 'femme-malheureuse-en-couple', 'manque-communication-couple'],
  testEmprise:      ['choses-pas-accepter-couple', 'red-flags-homme', 'red-flags-femme', 'dependance-affective', 'love-bombing'],
  // Le célibat qui dure : la peur de l'engagement, les façons de s'attacher,
  // la dépendance, et de quoi parler quand la rencontre arrive enfin.
  testTrouverAmour: ['peur-de-l-engagement', 'attachement-anxieux', 'attachement-evitant', 'dependance-affective', '36-questions-pour-tomber-amoureux'],
  // Le célibat qu'on ne s'explique pas : la peur de s'engager, les deux
  // façons de s'attacher qui font fuir ou qui fuient, et de quoi parler quand
  // la rencontre arrive.
  testCelibataire:  ['peur-de-l-engagement', 'attachement-evitant', 'attachement-anxieux', 'dependance-affective', '36-questions-pour-tomber-amoureux'],
  testCoupleOuCelibat: ['peur-de-l-engagement', 'dependance-affective', 'attachement-evitant', 'les-phases-de-la-rupture-chez-l-homme'],
  // Compatibilité sexuelle : se parler de ce qu'on aime, la tendresse comme
  // langage, et les questions intimes à se poser.
  testCompatSexuelle: ['questions-intimes-couple', '5-langages-de-l-amour', 'manque-communication-couple', 'questions-pour-mieux-se-connaitre-en-couple'],
  testEstCeLeBon: ['comment-savoir-si-cest-le-bon', 'arreter-ou-continuer-relation', 'questions-avenir-couple', 'red-flags-homme'],
  testPretRelation: ['dependance-affective', 'les-phases-de-la-rupture-chez-l-homme', 'arreter-ou-continuer-relation', 'comment-savoir-si-cest-le-bon'],
  testDureeCelibat: ['homme-nerveux-devant-une-femme', 'questions-a-poser-a-son-crush', 'sentiments-chez-un-homme', 'lexique-relations-2026'],
  testAmourAmi:     ['questions-a-poser-a-son-crush', 'sentiments-chez-un-homme', 'homme-nerveux-devant-une-femme', 'dependance-affective'],
  quizRencontre:    ['36-questions-pour-tomber-amoureux', 'questions-debut-de-relation', 'questions-a-poser-a-son-crush', 'il-annule-au-dernier-moment', 'homme-nerveux-devant-une-femme'],
  testFinCouple:    ['arreter-ou-continuer-relation', 'les-phases-de-la-rupture-chez-l-homme', 'sauver-son-couple'],
  testAmourAmitie:  ['sentiments-chez-un-homme', 'comment-savoir-si-cest-le-bon'],
  testCrush:        ['questions-a-poser-a-son-crush', 'sentiments-chez-un-homme', 'homme-nerveux-devant-une-femme', '36-questions-pour-tomber-amoureux'],
  testKarmique:     ['dependance-affective', 'love-bombing', 'arreter-ou-continuer-relation'],
  testAmeSoeur:     ['dependance-affective', 'love-bombing', 'arreter-ou-continuer-relation', 'citation-ame-soeur'],
  testDateNaissance: ['compatibilite-amoureuse-lion', 'compatibilite-amoureuse-scorpion', 'compatibilite-amoureuse-taureau'],
  testSignesChinois: ['compatibilite-amoureuse-belier', 'compatibilite-amoureuse-lion', 'compatibilite-amoureuse-scorpion', 'compatibilite-amoureuse-poissons'],
  testVacances:     ['activites-couple-ete', 'disputes-couple-vacances', 'sauver-son-couple'],
  quizTuPreferes:   ['comment-savoir-si-cest-le-bon', 'activites-couple-ete'],
  quizVraiFaux:     ['comment-savoir-si-cest-le-bon', 'manque-communication-couple'],
  quizMost:         ['activites-couple-ete', 'disputes-couple'],
  jeuxCouple:       ['activites-couple-ete', 'disputes-couple', 'sauver-son-couple'],
  jeuPlateau:       ['activites-couple-ete', 'manque-communication-couple'],
  jeuQuiDeNous:     ['comment-savoir-si-cest-le-bon', 'manque-communication-couple'],
  jeuDilemmes:      ['choses-pas-accepter-couple', 'disputes-couple'],
  jeuJamais:        ['questions-intimes-couple', 'questions-pour-mieux-se-connaitre-en-couple'],
  jeuQuiPourrait:   ['questions-pour-mieux-se-connaitre-en-couple', 'questions-couple-telephone-message'],
  jeuOuiNon:        ['choses-pas-accepter-couple', 'questions-pour-mieux-se-connaitre-en-couple'],
  jeuGages:         ['activites-couple-ete', 'comment-savoir-si-cest-le-bon'],
  jeuPhrases:       ['questions-pour-mieux-se-connaitre-en-couple', 'questions-intimes-couple'],
  // C'est un 10 mais : les défauts qu'on pardonne et ceux qu'on ne pardonne
  // pas, donc les red flags et ce qu'on n'accepte pas.
  jeuDixMais:       ['red-flags-homme', 'red-flags-femme', 'choses-pas-accepter-couple', 'il-annule-au-dernier-moment'],
  // Le jeu de soirée pour couples : ce qu'on se demande entre couples, et
  // les questions qui font parler.
  jeuSoireeCouples: ['questions-pour-mieux-se-connaitre-en-couple', 'questions-couple-telephone-message', 'questions-intimes-couple', 'activites-couple-ete'],
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

