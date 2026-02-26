import i18n from 'i18next';

/**
 * Translate game data string. Returns fallback (French) if no translation found.
 * Used for quiz questions, options, results, and verdicts.
 */
export function tgd(key: string, fallback: string): string {
  if (!i18n.isInitialized || i18n.language === 'fr') return fallback;
  const result = i18n.t(`gd:${key}`, { defaultValue: '' });
  return result || fallback;
}

/** Key mappings for useQuiz hook (Quiz type) */
export const QUIZ_KEYS: Record<string, string> = {
  'quiz-amoureux': 'amoureux',
  'quiz-couple-coquin': 'coquinC',
  'tester-son-couple': 'couple',
};

/** Key mappings for useDuoQuiz hook (DuoQuiz type) */
export const DUO_KEYS: Record<string, string> = {
  'tester-son-couple': 'testerC',
};

/** Key mappings for useDebateQuiz hook (DebateQuiz type) */
export const DEBATE_KEYS: Record<string, string> = {
  'quiz-amoureux': 'debate',
};
