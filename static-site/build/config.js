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
  testDistance: { fr: 'quiz-couple-distance', en: 'long-distance-relationship-quiz', es: 'quiz-pareja-distancia', de: 'fernbeziehung-quiz', it: 'quiz-coppia-distanza' },
  testToxic: { fr: 'test-couple-toxique', en: 'toxic-relationship-test', es: 'test-relacion-toxica', de: 'toxische-beziehung-test', it: 'test-relazione-tossica' },
  testCoupleSain: { fr: 'test-couple-sain', en: 'healthy-relationship-test', es: 'test-relacion-sana', de: 'gesunde-beziehung-test', it: 'test-relazione-sana' },
  testMariage: { fr: 'test-couple-mariage', en: 'marriage-compatibility-test', es: 'test-compatibilidad-matrimonio', de: 'ehe-kompatibilitaetstest', it: 'test-compatibilita-matrimonio' },
  testDivorce: { fr: 'test-dois-je-divorcer', en: 'should-i-divorce-test', es: 'test-debo-divorciarme', de: 'scheidungstest', it: 'test-devo-divorziare' },
  quizAmoureux: { fr: 'quiz-amoureux', en: 'love-quiz', es: 'quiz-enamorados', de: 'liebes-quiz', it: 'quiz-innamorati' },
  quizCoquin: { fr: 'quiz-couple-coquin', en: 'spicy-couple-quiz', es: 'quiz-pareja-picante', de: 'pikantes-paar-quiz', it: 'quiz-coppia-piccante' },
  quizMarrant: { fr: 'quiz-couple-marrant', en: 'funny-couple-quiz', es: 'quiz-pareja-divertido', de: 'lustiges-paar-quiz', it: 'quiz-coppia-divertente' },
  quizKnowledge: { fr: 'quiz-qui-connait-mieux-partenaire', en: 'who-knows-partner-best-quiz', es: 'quiz-quien-conoce-mejor-pareja', de: 'wer-kennt-partner-besser-quiz', it: 'quiz-chi-conosce-meglio-partner' },
  quizMost: { fr: 'quiz-qui-est-le-plus', en: 'who-is-most-likely-quiz', es: 'quiz-quien-es-mas', de: 'wer-ist-am-meisten-quiz', it: 'quiz-chi-e-piu' },
  questionsCouple: { fr: 'questions-couple', en: 'couple-questions', es: 'preguntas-pareja', de: 'fragen-fuer-paare', it: 'domande-coppia' },
  problemResolver: { fr: 'resoudre-probleme-couple', en: 'solve-couple-problem', es: 'resolver-problema-pareja', de: 'paar-problem-loesen', it: 'risolvere-problema-coppia' },
  legalMentions: { fr: 'mentions-legales', en: 'legal-notice', es: 'aviso-legal', de: 'impressum', it: 'note-legali' },
  privacy: { fr: 'confidentialite', en: 'privacy-policy', es: 'politica-privacidad', de: 'datenschutz', it: 'privacy' },
  blog: { fr: 'blog', en: 'blog', es: 'blog', de: 'blog', it: 'blog' },
  quizAdo: { fr: 'quiz-couple-ado', en: 'teen-couple-quiz', es: 'quiz-pareja-adolescentes', de: 'teenager-paar-quiz', it: 'quiz-coppia-adolescenti' },
  testParentalite: { fr: 'test-parentalite-couple', en: 'parenthood-readiness-test', es: 'test-parentalidad-pareja', de: 'elternschafts-bereitschaftstest', it: 'test-genitorialita-coppia' },
  testEmmenager: { fr: 'test-habiter-vivre-ensemble', en: 'moving-in-together-test', es: 'test-vivir-juntos-pareja', de: 'zusammenziehen-test-paare', it: 'test-andare-a-vivere-insieme' },
  testAstroPrenoms: { fr: 'signes-astrologiques-prenoms-compatibilite', en: 'zodiac-signs-names-compatibility', es: 'signos-astrologicos-nombres-compatibilidad', de: 'sternzeichen-vornamen-kompatibilitaet', it: 'segni-zodiacali-nomi-compatibilita' },
  testJalousie: { fr: 'test-jalousie-couple', en: 'jealousy-test-couple', es: 'test-celos-pareja', de: 'eifersucht-test-paar', it: 'test-gelosia-coppia' },
  quizGenant: { fr: 'quiz-couple-genant', en: 'embarrassing-couple-quiz', es: 'quiz-pareja-vergonzoso', de: 'peinliches-paar-quiz', it: 'quiz-coppia-imbarazzante' },
  testLangageAmour: { fr: 'test-langage-amour-couple', en: 'love-language-test-couple', es: 'test-lenguaje-amor-pareja', de: 'liebessprache-test-paar', it: 'test-linguaggio-amore-coppia' },
  quizTuPreferes: { fr: 'tu-preferes-couple-quiz', en: 'would-you-rather-couple-quiz', es: 'quiz-preferirias-pareja', de: 'was-wuerdest-du-lieber-paar-quiz', it: 'preferiresti-quiz-coppia' },
  quizVraiFaux: { fr: 'quiz-vrai-ou-faux', en: 'true-or-false-couple-quiz', es: 'quiz-verdadero-o-falso-pareja', de: 'richtig-oder-falsch-paar-quiz', it: 'quiz-vero-o-falso-coppia' },
  testAttachement: { fr: 'test-style-attachement-couple' },
  testConfiance: { fr: 'test-confiance-couple' },
  testInfidelite: { fr: 'test-infidelite-couple' },
  testBebe: { fr: 'test-pret-pour-bebe' },
  admin: { fr: 'admin', en: 'admin', es: 'admin', de: 'admin', it: 'admin' },
  activities: { fr: 'activites-autours-de-moi', en: 'couple-activities-near-me', es: 'actividades-en-pareja-cerca', de: 'paar-aktivitaeten-in-der-naehe', it: 'attivita-di-coppia-vicino' },
  contact: { fr: 'contact', en: 'contact', es: 'contacto', de: 'kontakt', it: 'contatto' },
  about: { fr: 'qui-sommes-nous', en: 'about-us', es: 'quienes-somos', de: 'ueber-uns', it: 'chi-siamo' },
  sitemap: { fr: 'plan-du-site', en: 'sitemap', es: 'mapa-del-sitio', de: 'seitenverzeichnis', it: 'mappa-del-sito' },
  ebookConfirm: { fr: 'confirmation-ebook' },
};

// Map route keys to their page template and translation namespaces
export const ROUTE_CONFIG = {
  home: { template: 'home', namespaces: ['home', 'common', 'quizzes'] },
  testCouple: { template: 'quiz-tester-couple', namespaces: ['quiz-tester-couple', 'quizzes', 'quizGames', 'gd', 'common'] },
  testCommonPoints: { template: 'quiz-common-points', namespaces: ['quiz-common-points', 'quizzes', 'quizGames', 'gd', 'common'] },
  testDistance: { template: 'quiz-distance', namespaces: ['quiz-distance', 'quizzes', 'quizGames', 'gd', 'common'] },
  testToxic: { template: 'quiz-toxic', namespaces: ['quiz-toxic', 'quizzes', 'quizGames', 'gd', 'common'] },
  testCoupleSain: { template: 'quiz-couple-sain', namespaces: ['quiz-couple-sain', 'quizzes', 'quizGames', 'gd', 'common'] },
  testMariage: { template: 'quiz-mariage', namespaces: ['quiz-mariage', 'quizzes', 'quizGames', 'gd', 'common'] },
  testDivorce: { template: 'quiz-divorce', namespaces: ['quiz-divorce', 'quizzes', 'quizGames', 'gd', 'common'] },
  quizAmoureux: { template: 'quiz-amoureux', namespaces: ['quiz-amoureux', 'quizzes', 'quizGames', 'gd', 'common'] },
  quizCoquin: { template: 'quiz-coquin', namespaces: ['quiz-coquin', 'quizzes', 'quizGames', 'gd', 'common'] },
  quizMarrant: { template: 'quiz-marrant', namespaces: ['quiz-marrant', 'quizzes', 'quizGames', 'gd', 'common'] },
  quizKnowledge: { template: 'quiz-knowledge', namespaces: ['quiz-knowledge', 'quizzes', 'quizGames', 'gd', 'common'] },
  quizMost: { template: 'quiz-most', namespaces: ['quiz-most', 'quizzes', 'quizGames', 'gd', 'common'] },
  questionsCouple: { template: 'questions-couple', namespaces: ['quiz-questions-couple', 'quizzes', 'common'] },
  problemResolver: { template: 'problem-resolver', namespaces: ['quiz-problem-resolver', 'quizzes', 'quizGames', 'common'] },
  legalMentions: { template: 'legal', namespaces: ['legal', 'common'] },
  privacy: { template: 'privacy', namespaces: ['legal', 'common'] },
  blog: { template: 'blog-listing', namespaces: ['common'] },
  quizAdo: { template: 'quiz-ado', namespaces: ['quiz-ado', 'quizzes', 'quizGames', 'gd', 'common'] },
  testParentalite: { template: 'quiz-parentalite', namespaces: ['quiz-parentalite', 'quizzes', 'quizGames', 'gd', 'common'] },
  testEmmenager: { template: 'quiz-emmenager', namespaces: ['quiz-emmenager', 'quizzes', 'quizGames', 'gd', 'common'] },
  testAstroPrenoms: { template: 'quiz-astro-prenoms', namespaces: ['quiz-astro-prenoms', 'quizzes', 'common'] },
  testJalousie: { template: 'quiz-jalousie', namespaces: ['quiz-jalousie', 'quizzes', 'quizGames', 'gd', 'common'] },
  quizGenant: { template: 'quiz-genant', namespaces: ['quiz-genant', 'quizzes', 'quizGames', 'gd', 'common'] },
  testLangageAmour: { template: 'quiz-langage-amour', namespaces: ['quiz-langage-amour', 'quizzes', 'quizGames', 'gd', 'common'] },
  quizTuPreferes: { template: 'quiz-tu-preferes', namespaces: ['quiz-tu-preferes', 'quizzes', 'quizGames', 'gd', 'common'] },
  quizVraiFaux: { template: 'quiz-vrai-faux', namespaces: ['quiz-vrai-faux', 'quizzes', 'quizGames', 'gd', 'common'] },
  testAttachement: { template: 'quiz-attachement', namespaces: ['quiz-attachement', 'quizzes', 'quizGames', 'gd', 'common'], frOnly: true },
  testConfiance: { template: 'quiz-confiance', namespaces: ['quiz-confiance', 'quizzes', 'quizGames', 'gd', 'common'], frOnly: true },
  testInfidelite: { template: 'quiz-infidelite', namespaces: ['quiz-infidelite', 'quizzes', 'quizGames', 'gd', 'common'], frOnly: true },
  testBebe: { template: 'quiz-bebe', namespaces: ['quiz-bebe', 'quizzes', 'quizGames', 'gd', 'common'], frOnly: true },
  admin: { template: 'admin', namespaces: ['common'] },
  activities: { template: 'activities', namespaces: ['activities', 'common'] },
  contact: { template: 'contact', namespaces: ['contact', 'common'] },
  about: { template: 'about', namespaces: ['common'] },
  sitemap: { template: 'sitemap', namespaces: ['common'] },
  ebookConfirm: { template: 'ebook-confirm', namespaces: ['common'], frOnly: true },
};

// Supabase config
export const SUPABASE_URL = 'https://lojvajnnvhatfplevyvy.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvanZham5udmhhdGZwbGV2eXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNzk3NDIsImV4cCI6MjA4Nzg1NTc0Mn0.gdd9HRbRvfQr6io9jGN6hUCW6tBOtognhwbsTJtSTng';

// Google Analytics
export const GA_ID = 'G-XZV8V6FEK5';

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
};

// Blog article metadata
export const BLOG_ARTICLES = [
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
    internalSlug: 'copain-ne-fait-pas-effort',
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
    category: 'vie-de-couple',
    frOnly: true,
    slugs: {
      fr: 'lexique-relations-2026',
    },
    publishedAt: '2026-03-11',
  },
  {
    internalSlug: 'dependance-affective',
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
      de: "Mathieu Courtin ist Autor mit Schwerpunkt auf Liebesbeziehungen und Paarpsychologie. Als Mitgründer von Quiz Couple beleuchtet er männliche emotionale Dynamiken in der Liebe — ehrlich, fundiert und ohne Tabus.",
      it: "Mathieu Courtin è autore specializzato in relazioni sentimentali e psicologia di coppia. Co-fondatore di Quiz Couple, analizza le dinamiche emotive maschili nell'amore con sincerità, rigore e senza tabù.",
    },
  },
  'lucie-courtin': {
    id: 'lucie-courtin',
    name: 'Lucie Courtin',
    avatar: '/authors/lucie-courtin.webp',
    bios: {
      fr: "Lucie Courtin est rédactrice spécialisée en relations de couple et bien-être émotionnel. Co-fondatrice de Quiz Couple, elle explore la vie sentimentale sous un angle féminin — avec empathie, profondeur et une touche de franc-parler.",
      en: "Lucie Courtin is a writer specializing in couple relationships and emotional well-being. Co-founder of Quiz Couple, she explores love from a female perspective — with empathy, depth, and a touch of straight talk.",
      es: "Lucie Courtin es redactora especializada en relaciones de pareja y bienestar emocional. Cofundadora de Quiz Couple, explora la vida sentimental desde una perspectiva femenina — con empatía, profundidad y franqueza.",
      de: "Lucie Courtin ist Autorin mit Schwerpunkt auf Paarbeziehungen und emotionalem Wohlbefinden. Als Mitgründerin von Quiz Couple beleuchtet sie die Liebe aus weiblicher Perspektive — mit Empathie, Tiefe und Klartext.",
      it: "Lucie Courtin è autrice specializzata in relazioni di coppia e benessere emotivo. Co-fondatrice di Quiz Couple, esplora la vita sentimentale da una prospettiva femminile — con empatia, profondità e schiettezza.",
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
