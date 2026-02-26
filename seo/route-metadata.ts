/**
 * Static SEO metadata map for build-time injection.
 * This file is imported by vite.config.ts (Node context) and must NOT depend on React or i18next.
 * It reads translation JSON files directly.
 */

// Import translation data directly (works in both Node/Vite contexts)
import frQuizzes from '../locales/fr/quizzes.json';
import enQuizzes from '../locales/en/quizzes.json';
import esQuizzes from '../locales/es/quizzes.json';
import deQuizzes from '../locales/de/quizzes.json';
import itQuizzes from '../locales/it/quizzes.json';

import frHome from '../locales/fr/home.json';
import enHome from '../locales/en/home.json';
import esHome from '../locales/es/home.json';
import deHome from '../locales/de/home.json';
import itHome from '../locales/it/home.json';

const BASE_URL = 'https://quiz-couple.com';

type Lang = 'fr' | 'en' | 'es' | 'de' | 'it';

const LOCALES: Record<Lang, string> = {
  fr: 'fr_FR',
  en: 'en_US',
  es: 'es_ES',
  de: 'de_DE',
  it: 'it_IT',
};

// Route slugs (mirrored from src/i18n/routes.ts to avoid circular deps)
const ROUTE_SLUGS: Record<string, Record<Lang, string>> = {
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

// Quizzes metadata per language
const quizzesData: Record<Lang, Record<string, { title: string; metaDescription: string }>> = {
  fr: frQuizzes as any,
  en: enQuizzes as any,
  es: esQuizzes as any,
  de: deQuizzes as any,
  it: itQuizzes as any,
};

// Home metadata per language
const homeData: Record<Lang, { seo: { title: string; description: string } }> = {
  fr: frHome as any,
  en: enHome as any,
  es: esHome as any,
  de: deHome as any,
  it: itHome as any,
};

// Legal pages metadata (not in quizzes.json)
const legalMeta: Record<Lang, { title: string; description: string }> = {
  fr: { title: 'Mentions Légales - Quiz Couple', description: 'Mentions légales du site Quiz Couple. Informations sur l\'éditeur, l\'hébergeur et les conditions d\'utilisation.' },
  en: { title: 'Legal Notice - Quiz Couple', description: 'Legal notice for Quiz Couple website. Information about the publisher, hosting and terms of use.' },
  es: { title: 'Aviso Legal - Quiz Couple', description: 'Aviso legal del sitio Quiz Couple. Información sobre el editor, alojamiento y condiciones de uso.' },
  de: { title: 'Impressum - Quiz Couple', description: 'Impressum der Website Quiz Couple. Informationen zum Herausgeber, Hosting und Nutzungsbedingungen.' },
  it: { title: 'Note Legali - Quiz Couple', description: 'Note legali del sito Quiz Couple. Informazioni sull\'editore, hosting e condizioni d\'uso.' },
};

const privacyMeta: Record<Lang, { title: string; description: string }> = {
  fr: { title: 'Politique de Confidentialité - Quiz Couple', description: 'Politique de confidentialité de Quiz Couple. Découvrez comment nous protégeons vos données personnelles.' },
  en: { title: 'Privacy Policy - Quiz Couple', description: 'Quiz Couple privacy policy. Learn how we protect your personal data and respect your privacy.' },
  es: { title: 'Política de Privacidad - Quiz Couple', description: 'Política de privacidad de Quiz Couple. Descubre cómo protegemos tus datos personales.' },
  de: { title: 'Datenschutzerklärung - Quiz Couple', description: 'Datenschutzerklärung von Quiz Couple. Erfahren Sie, wie wir Ihre persönlichen Daten schützen.' },
  it: { title: 'Privacy Policy - Quiz Couple', description: 'Informativa sulla privacy di Quiz Couple. Scopri come proteggiamo i tuoi dati personali.' },
};

const blogMeta: Record<Lang, { title: string; description: string }> = {
  fr: { title: 'Blog - Conseils et astuces pour couples | Quiz Couple', description: 'Découvrez nos articles et conseils pour renforcer votre relation de couple. Astuces, tests et réflexions pour mieux se comprendre.' },
  en: { title: 'Blog - Tips & Advice for Couples | Quiz Couple', description: 'Discover our articles and tips to strengthen your relationship. Advice, quizzes and reflections to understand each other better.' },
  es: { title: 'Blog - Consejos para parejas | Quiz Couple', description: 'Descubre nuestros artículos y consejos para fortalecer tu relación de pareja.' },
  de: { title: 'Blog - Tipps und Ratschläge für Paare | Quiz Couple', description: 'Entdecke unsere Artikel und Tipps, um deine Beziehung zu stärken.' },
  it: { title: 'Blog - Consigli per coppie | Quiz Couple', description: 'Scopri i nostri articoli e consigli per rafforzare la tua relazione di coppia.' },
};

function getPath(routeKey: string, lang: Lang): string {
  const slug = ROUTE_SLUGS[routeKey][lang];
  if (lang === 'fr') return slug ? `/${slug}` : '/';
  return slug ? `/${lang}/${slug}` : `/${lang}`;
}

function getUrl(routeKey: string, lang: Lang): string {
  return `${BASE_URL}${getPath(routeKey, lang)}`;
}

export interface RouteMetadata {
  title: string;
  description: string;
  canonical: string;
  lang: Lang;
  locale: string;
  alternates: { hreflang: string; href: string }[];
}

function buildAlternates(routeKey: string): { hreflang: string; href: string }[] {
  const langs: Lang[] = ['fr', 'en', 'es', 'de', 'it'];
  const alts: { hreflang: string; href: string }[] = langs.map(l => ({ hreflang: l as string, href: getUrl(routeKey, l) }));
  alts.push({ hreflang: 'x-default', href: getUrl(routeKey, 'fr') });
  return alts;
}

function getMetaForRoute(routeKey: string, lang: Lang): { title: string; description: string } {
  if (routeKey === 'home') {
    const home = homeData[lang];
    return { title: home.seo.title, description: home.seo.description };
  }
  if (routeKey === 'legalMentions') return legalMeta[lang];
  if (routeKey === 'privacy') return privacyMeta[lang];
  if (routeKey === 'blog') return blogMeta[lang];
  
  const quiz = quizzesData[lang][routeKey];
  if (quiz) return { title: quiz.title, description: quiz.metaDescription };
  
  // Fallback
  return { title: 'Quiz Couple', description: 'Quiz gratuit pour couples.' };
}

// Build the complete metadata map
const metadataMap = new Map<string, RouteMetadata>();

const langs: Lang[] = ['fr', 'en', 'es', 'de', 'it'];
for (const routeKey of Object.keys(ROUTE_SLUGS)) {
  for (const lang of langs) {
    const path = getPath(routeKey, lang);
    const meta = getMetaForRoute(routeKey, lang);
    metadataMap.set(path, {
      title: meta.title,
      description: meta.description,
      canonical: getUrl(routeKey, lang),
      lang,
      locale: LOCALES[lang],
      alternates: buildAlternates(routeKey),
    });
  }
}

export function getMetadataForRoute(route: string): RouteMetadata | null {
  // Normalize: remove trailing slash except for root
  let normalized = route.replace(/\/$/, '') || '/';
  return metadataMap.get(normalized) || null;
}
