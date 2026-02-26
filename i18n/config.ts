import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import French translations (default)
import commonFR from '@/locales/fr/common.json';
import homeFR from '@/locales/fr/home.json';
import quizzesFR from '@/locales/fr/quizzes.json';
import quizCoquinFR from '@/locales/fr/quiz-coquin.json';
import quizTesterCoupleFR from '@/locales/fr/quiz-tester-couple.json';
import quizAmoureuxFR from '@/locales/fr/quiz-amoureux.json';
import quizMostFR from '@/locales/fr/quiz-most.json';
import quizToxicFR from '@/locales/fr/quiz-toxic.json';
import quizDistanceFR from '@/locales/fr/quiz-distance.json';
import quizMarrantFR from '@/locales/fr/quiz-marrant.json';
import quizKnowledgeFR from '@/locales/fr/quiz-knowledge.json';
import quizCommonPointsFR from '@/locales/fr/quiz-common-points.json';
import quizProblemResolverFR from '@/locales/fr/quiz-problem-resolver.json';
import quizQuestionsFR from '@/locales/fr/quiz-questions-couple.json';
import quizGamesFR from '@/locales/fr/quizGames.json';
import gdFR from '@/locales/fr/gd.json';
import legalFR from '@/locales/fr/legal.json';
import quizCoupleSainFR from '@/locales/fr/quiz-couple-sain.json';
import quizMariageFR from '@/locales/fr/quiz-mariage.json';
import quizDivorceFR from '@/locales/fr/quiz-divorce.json';
import quizAdoFR from '@/locales/fr/quiz-ado.json';

// Import English translations
import commonEN from '@/locales/en/common.json';
import homeEN from '@/locales/en/home.json';
import quizzesEN from '@/locales/en/quizzes.json';
import quizCoquinEN from '@/locales/en/quiz-coquin.json';
import quizTesterCoupleEN from '@/locales/en/quiz-tester-couple.json';
import quizAmoureuxEN from '@/locales/en/quiz-amoureux.json';
import quizMostEN from '@/locales/en/quiz-most.json';
import quizToxicEN from '@/locales/en/quiz-toxic.json';
import quizDistanceEN from '@/locales/en/quiz-distance.json';
import quizMarrantEN from '@/locales/en/quiz-marrant.json';
import quizKnowledgeEN from '@/locales/en/quiz-knowledge.json';
import quizCommonPointsEN from '@/locales/en/quiz-common-points.json';
import quizProblemResolverEN from '@/locales/en/quiz-problem-resolver.json';
import quizQuestionsEN from '@/locales/en/quiz-questions-couple.json';
import quizGamesEN from '@/locales/en/quizGames.json';
import gdEN from '@/locales/en/gd.json';
import legalEN from '@/locales/en/legal.json';
import quizCoupleSainEN from '@/locales/en/quiz-couple-sain.json';
import quizMariageEN from '@/locales/en/quiz-mariage.json';
import quizDivorceEN from '@/locales/en/quiz-divorce.json';
import quizAdoEN from '@/locales/en/quiz-ado.json';

// Import Spanish translations
import commonES from '@/locales/es/common.json';
import homeES from '@/locales/es/home.json';
import quizzesES from '@/locales/es/quizzes.json';
import quizCoquinES from '@/locales/es/quiz-coquin.json';
import quizTesterCoupleES from '@/locales/es/quiz-tester-couple.json';
import quizAmoureuxES from '@/locales/es/quiz-amoureux.json';
import quizMostES from '@/locales/es/quiz-most.json';
import quizToxicES from '@/locales/es/quiz-toxic.json';
import quizDistanceES from '@/locales/es/quiz-distance.json';
import quizMarrantES from '@/locales/es/quiz-marrant.json';
import quizKnowledgeES from '@/locales/es/quiz-knowledge.json';
import quizCommonPointsES from '@/locales/es/quiz-common-points.json';
import quizProblemResolverES from '@/locales/es/quiz-problem-resolver.json';
import quizQuestionsES from '@/locales/es/quiz-questions-couple.json';
import quizGamesES from '@/locales/es/quizGames.json';
import gdES from '@/locales/es/gd.json';
import legalES from '@/locales/es/legal.json';
import quizCoupleSainES from '@/locales/es/quiz-couple-sain.json';
import quizMariageES from '@/locales/es/quiz-mariage.json';
import quizDivorceES from '@/locales/es/quiz-divorce.json';
import quizAdoES from '@/locales/es/quiz-ado.json';

// Import German translations
import commonDE from '@/locales/de/common.json';
import homeDE from '@/locales/de/home.json';
import quizzesDE from '@/locales/de/quizzes.json';
import quizCoquinDE from '@/locales/de/quiz-coquin.json';
import quizTesterCoupleDE from '@/locales/de/quiz-tester-couple.json';
import quizAmoureuxDE from '@/locales/de/quiz-amoureux.json';
import quizMostDE from '@/locales/de/quiz-most.json';
import quizToxicDE from '@/locales/de/quiz-toxic.json';
import quizDistanceDE from '@/locales/de/quiz-distance.json';
import quizMarrantDE from '@/locales/de/quiz-marrant.json';
import quizKnowledgeDE from '@/locales/de/quiz-knowledge.json';
import quizCommonPointsDE from '@/locales/de/quiz-common-points.json';
import quizProblemResolverDE from '@/locales/de/quiz-problem-resolver.json';
import quizQuestionsDE from '@/locales/de/quiz-questions-couple.json';
import quizGamesDE from '@/locales/de/quizGames.json';
import gdDE from '@/locales/de/gd.json';
import legalDE from '@/locales/de/legal.json';
import quizCoupleSainDE from '@/locales/de/quiz-couple-sain.json';
import quizMariageDE from '@/locales/de/quiz-mariage.json';
import quizDivorceDE from '@/locales/de/quiz-divorce.json';
import quizAdoDE from '@/locales/de/quiz-ado.json';

// Import Italian translations
import commonIT from '@/locales/it/common.json';
import homeIT from '@/locales/it/home.json';
import quizzesIT from '@/locales/it/quizzes.json';
import quizCoquinIT from '@/locales/it/quiz-coquin.json';
import quizTesterCoupleIT from '@/locales/it/quiz-tester-couple.json';
import quizAmoureuxIT from '@/locales/it/quiz-amoureux.json';
import quizMostIT from '@/locales/it/quiz-most.json';
import quizToxicIT from '@/locales/it/quiz-toxic.json';
import quizDistanceIT from '@/locales/it/quiz-distance.json';
import quizMarrantIT from '@/locales/it/quiz-marrant.json';
import quizKnowledgeIT from '@/locales/it/quiz-knowledge.json';
import quizCommonPointsIT from '@/locales/it/quiz-common-points.json';
import quizProblemResolverIT from '@/locales/it/quiz-problem-resolver.json';
import quizQuestionsIT from '@/locales/it/quiz-questions-couple.json';
import quizGamesIT from '@/locales/it/quizGames.json';
import gdIT from '@/locales/it/gd.json';
import legalIT from '@/locales/it/legal.json';
import quizCoupleSainIT from '@/locales/it/quiz-couple-sain.json';
import quizMariageIT from '@/locales/it/quiz-mariage.json';
import quizDivorceIT from '@/locales/it/quiz-divorce.json';
import quizAdoIT from '@/locales/it/quiz-ado.json';

export const SUPPORTED_LANGUAGES = ['fr', 'en', 'es', 'de', 'it'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export const LANGUAGE_CONFIG = {
  fr: { flag: '🇫🇷', name: 'Français', locale: 'fr_FR' },
  en: { flag: '🇬🇧', name: 'English', locale: 'en_US' },
  es: { flag: '🇪🇸', name: 'Español', locale: 'es_ES' },
  de: { flag: '🇩🇪', name: 'Deutsch', locale: 'de_DE' },
  it: { flag: '🇮🇹', name: 'Italiano', locale: 'it_IT' },
} as const;

const resources = {
  fr: {
    common: commonFR, home: homeFR, quizzes: quizzesFR,
    'quiz-coquin': quizCoquinFR, 'quiz-tester-couple': quizTesterCoupleFR,
    'quiz-amoureux': quizAmoureuxFR, 'quiz-most': quizMostFR,
    'quiz-toxic': quizToxicFR, 'quiz-distance': quizDistanceFR,
    'quiz-marrant': quizMarrantFR, 'quiz-knowledge': quizKnowledgeFR,
    'quiz-common-points': quizCommonPointsFR, 'quiz-problem-resolver': quizProblemResolverFR,
    'quiz-questions-couple': quizQuestionsFR, quizGames: quizGamesFR, gd: gdFR, legal: legalFR, 'quiz-couple-sain': quizCoupleSainFR, 'quiz-mariage': quizMariageFR, 'quiz-divorce': quizDivorceFR, 'quiz-ado': quizAdoFR,
  },
  en: {
    common: commonEN, home: homeEN, quizzes: quizzesEN,
    'quiz-coquin': quizCoquinEN, 'quiz-tester-couple': quizTesterCoupleEN,
    'quiz-amoureux': quizAmoureuxEN, 'quiz-most': quizMostEN,
    'quiz-toxic': quizToxicEN, 'quiz-distance': quizDistanceEN,
    'quiz-marrant': quizMarrantEN, 'quiz-knowledge': quizKnowledgeEN,
    'quiz-common-points': quizCommonPointsEN, 'quiz-problem-resolver': quizProblemResolverEN,
    'quiz-questions-couple': quizQuestionsEN, quizGames: quizGamesEN, gd: gdEN, legal: legalEN, 'quiz-couple-sain': quizCoupleSainEN, 'quiz-mariage': quizMariageEN, 'quiz-divorce': quizDivorceEN, 'quiz-ado': quizAdoEN,
  },
  es: {
    common: commonES, home: homeES, quizzes: quizzesES,
    'quiz-coquin': quizCoquinES, 'quiz-tester-couple': quizTesterCoupleES,
    'quiz-amoureux': quizAmoureuxES, 'quiz-most': quizMostES,
    'quiz-toxic': quizToxicES, 'quiz-distance': quizDistanceES,
    'quiz-marrant': quizMarrantES, 'quiz-knowledge': quizKnowledgeES,
    'quiz-common-points': quizCommonPointsES, 'quiz-problem-resolver': quizProblemResolverES,
    'quiz-questions-couple': quizQuestionsES, quizGames: quizGamesES, gd: gdES, legal: legalES, 'quiz-couple-sain': quizCoupleSainES, 'quiz-mariage': quizMariageES, 'quiz-divorce': quizDivorceES, 'quiz-ado': quizAdoES,
  },
  de: {
    common: commonDE, home: homeDE, quizzes: quizzesDE,
    'quiz-coquin': quizCoquinDE, 'quiz-tester-couple': quizTesterCoupleDE,
    'quiz-amoureux': quizAmoureuxDE, 'quiz-most': quizMostDE,
    'quiz-toxic': quizToxicDE, 'quiz-distance': quizDistanceDE,
    'quiz-marrant': quizMarrantDE, 'quiz-knowledge': quizKnowledgeDE,
    'quiz-common-points': quizCommonPointsDE, 'quiz-problem-resolver': quizProblemResolverDE,
    'quiz-questions-couple': quizQuestionsDE, quizGames: quizGamesDE, gd: gdDE, legal: legalDE, 'quiz-couple-sain': quizCoupleSainDE, 'quiz-mariage': quizMariageDE, 'quiz-divorce': quizDivorceDE, 'quiz-ado': quizAdoDE,
  },
  it: {
    common: commonIT, home: homeIT, quizzes: quizzesIT,
    'quiz-coquin': quizCoquinIT, 'quiz-tester-couple': quizTesterCoupleIT,
    'quiz-amoureux': quizAmoureuxIT, 'quiz-most': quizMostIT,
    'quiz-toxic': quizToxicIT, 'quiz-distance': quizDistanceIT,
    'quiz-marrant': quizMarrantIT, 'quiz-knowledge': quizKnowledgeIT,
    'quiz-common-points': quizCommonPointsIT, 'quiz-problem-resolver': quizProblemResolverIT,
    'quiz-questions-couple': quizQuestionsIT, quizGames: quizGamesIT, gd: gdIT, legal: legalIT, 'quiz-couple-sain': quizCoupleSainIT, 'quiz-mariage': quizMariageIT, 'quiz-divorce': quizDivorceIT, 'quiz-ado': quizAdoIT,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    defaultNS: 'common',
    ns: ['common', 'home', 'quizzes', 'quiz-coquin', 'quiz-tester-couple', 'quiz-amoureux', 'quiz-most', 'quiz-toxic', 'quiz-distance', 'quiz-marrant', 'quiz-knowledge', 'quiz-common-points', 'quiz-problem-resolver', 'quiz-questions-couple', 'quizGames', 'gd', 'legal', 'quiz-couple-sain', 'quiz-mariage', 'quiz-divorce', 'quiz-ado'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: [],
      caches: [],
    },
  });

export default i18n;