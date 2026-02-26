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
};

// Supabase config
export const SUPABASE_URL = 'https://nbjpgecedevlmypqisng.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ianBnZWNlZGV2bG15cHFpc25nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNDk3MjgsImV4cCI6MjA4NDgyNTcyOH0.agwrq1lrAKP8Vc-Y349H3RxEZhEgsDj21cG1luw9AXs';

// Google Analytics
export const GA_ID = 'G-XZV8V6FEK5';

// Helper functions
export function getLocalizedPath(routeKey, lang) {
  const slug = ROUTE_SLUGS[routeKey]?.[lang];
  if (slug === undefined) return null;
  if (lang === 'fr') return slug ? `/${slug}` : '/';
  return slug ? `/${lang}/${slug}` : `/${lang}`;
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

export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;');
}
