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
  testAstroPrenoms: { fr: 'signes-astrologiques-prenoms-compatibilite', en: 'zodiac-signs-names-compatibility', es: 'signos-astrologicos-nombres-compatibilidad', de: 'sternzeichen-vornamen-kompatibilitaet', it: 'segni-zodiacali-nomi-compatibilita' },
  admin: { fr: 'admin', en: 'admin', es: 'admin', de: 'admin', it: 'admin' },
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
  testAstroPrenoms: { template: 'quiz-astro-prenoms', namespaces: ['quiz-astro-prenoms', 'quizzes', 'common'] },
  admin: { template: 'admin', namespaces: ['common'] },
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

// Blog article metadata
export const BLOG_ARTICLES = [
  {
    internalSlug: 'les-phases-de-la-rupture-chez-l-homme',
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
    slugs: {
      fr: 'femme-malheureuse-en-couple',
      en: 'unhappy-woman-in-relationship-signs',
      es: 'mujer-infeliz-en-pareja-senales',
      de: 'unglueckliche-frau-in-beziehung-anzeichen',
      it: 'donna-infelice-in-coppia-segnali',
    },
    publishedAt: '2026-03-01',
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
