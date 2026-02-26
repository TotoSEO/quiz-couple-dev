import type { SupportedLanguage } from './config';

export const BASE_URL = 'https://quiz-couple.com';

// Route definitions with slugs for each language
export const ROUTE_SLUGS = {
  home: {
    fr: '',
    en: '',
    es: '',
    de: '',
    it: '',
  },
  testCouple: {
    fr: 'tester-son-couple',
    en: 'couple-compatibility-test',
    es: 'test-compatibilidad-pareja',
    de: 'paar-kompatibilitaetstest',
    it: 'test-compatibilita-coppia',
  },
  testCommonPoints: {
    fr: 'test-points-communs-couples',
    en: 'couple-common-points-test',
    es: 'test-puntos-comunes-pareja',
    de: 'gemeinsamkeiten-test-paare',
    it: 'test-punti-comuni-coppia',
  },
  testDistance: {
    fr: 'quiz-couple-distance',
    en: 'long-distance-relationship-quiz',
    es: 'quiz-pareja-distancia',
    de: 'fernbeziehung-quiz',
    it: 'quiz-coppia-distanza',
  },
  testToxic: {
    fr: 'test-couple-toxique',
    en: 'toxic-relationship-test',
    es: 'test-relacion-toxica',
    de: 'toxische-beziehung-test',
    it: 'test-relazione-tossica',
  },
  quizAmoureux: {
    fr: 'quiz-amoureux',
    en: 'love-quiz',
    es: 'quiz-enamorados',
    de: 'liebes-quiz',
    it: 'quiz-innamorati',
  },
  quizCoquin: {
    fr: 'quiz-couple-coquin',
    en: 'spicy-couple-quiz',
    es: 'quiz-pareja-picante',
    de: 'pikantes-paar-quiz',
    it: 'quiz-coppia-piccante',
  },
  quizMarrant: {
    fr: 'quiz-couple-marrant',
    en: 'funny-couple-quiz',
    es: 'quiz-pareja-divertido',
    de: 'lustiges-paar-quiz',
    it: 'quiz-coppia-divertente',
  },
  quizKnowledge: {
    fr: 'quiz-qui-connait-mieux-partenaire',
    en: 'who-knows-partner-best-quiz',
    es: 'quiz-quien-conoce-mejor-pareja',
    de: 'wer-kennt-partner-besser-quiz',
    it: 'quiz-chi-conosce-meglio-partner',
  },
  quizMost: {
    fr: 'quiz-qui-est-le-plus',
    en: 'who-is-most-likely-quiz',
    es: 'quiz-quien-es-mas',
    de: 'wer-ist-am-meisten-quiz',
    it: 'quiz-chi-e-piu',
  },
  questionsCouple: {
    fr: 'questions-couple',
    en: 'couple-questions',
    es: 'preguntas-pareja',
    de: 'fragen-fuer-paare',
    it: 'domande-coppia',
  },
  problemResolver: {
    fr: 'resoudre-probleme-couple',
    en: 'solve-couple-problem',
    es: 'resolver-problema-pareja',
    de: 'paar-problem-loesen',
    it: 'risolvere-problema-coppia',
  },
  legalMentions: {
    fr: 'mentions-legales',
    en: 'legal-notice',
    es: 'aviso-legal',
    de: 'impressum',
    it: 'note-legali',
  },
  privacy: {
    fr: 'confidentialite',
    en: 'privacy-policy',
    es: 'politica-privacidad',
    de: 'datenschutz',
    it: 'privacy',
  },
  testCoupleSain: {
    fr: 'test-couple-sain',
    en: 'healthy-relationship-test',
    es: 'test-relacion-sana',
    de: 'gesunde-beziehung-test',
    it: 'test-relazione-sana',
  },
  testMariage: {
    fr: 'test-couple-mariage',
    en: 'marriage-compatibility-test',
    es: 'test-compatibilidad-matrimonio',
    de: 'ehe-kompatibilitaetstest',
    it: 'test-compatibilita-matrimonio',
  },
  testDivorce: {
    fr: 'test-dois-je-divorcer',
    en: 'should-i-divorce-test',
    es: 'test-debo-divorciarme',
    de: 'scheidungstest',
    it: 'test-devo-divorziare',
  },
  blog: {
    fr: 'blog',
    en: 'blog',
    es: 'blog',
    de: 'blog',
    it: 'blog',
  },
  quizAdo: {
    fr: 'quiz-couple-ado',
    en: 'teen-couple-quiz',
    es: 'quiz-pareja-adolescentes',
    de: 'teenager-paar-quiz',
    it: 'quiz-coppia-adolescenti',
  },
} as const;

export type RouteKey = keyof typeof ROUTE_SLUGS;

// Get the full path for a route in a specific language
export function getLocalizedPath(routeKey: RouteKey, lang: SupportedLanguage): string {
  const slug = ROUTE_SLUGS[routeKey][lang];
  
  if (lang === 'fr') {
    return slug ? `/${slug}` : '/';
  }
  
  return slug ? `/${lang}/${slug}` : `/${lang}`;
}

// Get the full URL for a route in a specific language
export function getLocalizedUrl(routeKey: RouteKey, lang: SupportedLanguage): string {
  return `${BASE_URL}${getLocalizedPath(routeKey, lang)}`;
}

// Get all alternates for a route (for hreflang tags)
export function getRouteAlternates(routeKey: RouteKey): { lang: SupportedLanguage; href: string }[] {
  return (['fr', 'en', 'es', 'de', 'it'] as SupportedLanguage[]).map((lang) => ({
    lang,
    href: getLocalizedUrl(routeKey, lang),
  }));
}

// Detect language from pathname
export function detectLanguageFromPath(pathname: string): SupportedLanguage {
  if (pathname.startsWith('/en/') || pathname === '/en') return 'en';
  if (pathname.startsWith('/es/') || pathname === '/es') return 'es';
  if (pathname.startsWith('/de/') || pathname === '/de') return 'de';
  if (pathname.startsWith('/it/') || pathname === '/it') return 'it';
  return 'fr';
}

// Get route key from pathname
export function getRouteKeyFromPath(pathname: string): RouteKey | null {
  const lang = detectLanguageFromPath(pathname);
  
  // Remove language prefix
  let cleanPath = pathname;
  if (lang !== 'fr') {
    cleanPath = pathname.replace(new RegExp(`^/${lang}/?`), '/');
  }
  cleanPath = cleanPath.replace(/^\//, '').replace(/\/$/, '');
  
  // Find matching route
  for (const [key, slugs] of Object.entries(ROUTE_SLUGS)) {
    if (slugs[lang] === cleanPath || (cleanPath === '' && slugs[lang] === '')) {
      return key as RouteKey;
    }
  }
  
  return null;
}
