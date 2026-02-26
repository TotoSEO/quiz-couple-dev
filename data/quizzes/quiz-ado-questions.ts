/**
 * Teen Couple Quiz - 80 questions across 4 categories.
 * Each question has 4 options scored 1-4.
 * Text is loaded from i18n (quiz-ado namespace, keys q.1, q.1a, q.1b, q.1c, q.1d).
 */

export type AdoCategory = 'projection' | 'communication' | 'compatibility' | 'instinct';

export interface AdoQuestion {
  id: number;
  category: AdoCategory;
}

// Questions 1-20: Projection & Future
// Questions 21-40: Communication & Trust
// Questions 41-60: Compatibility & Values
// Questions 61-80: Feelings & Instinct
export const adoQuestions: AdoQuestion[] = Array.from({ length: 80 }, (_, i) => {
  const id = i + 1;
  let category: AdoCategory;
  if (id <= 20) category = 'projection';
  else if (id <= 40) category = 'communication';
  else if (id <= 60) category = 'compatibility';
  else category = 'instinct';
  return { id, category };
});

export const ADO_TOTAL_QUESTIONS = 80;
export const ADO_QUESTIONS_PER_SESSION = 20;
export const ADO_MAX_SCORE_PER_SESSION = 80; // 20 questions × max 4 points
export const ADO_OPTIONS = ['a', 'b', 'c', 'd'] as const;

export interface AdoResult {
  key: string;
  minScore: number;
  maxScore: number;
}

export const adoResults: AdoResult[] = [
  { key: 'r1', minScore: 20, maxScore: 35 },
  { key: 'r2', minScore: 36, maxScore: 53 },
  { key: 'r3', minScore: 54, maxScore: 68 },
  { key: 'r4', minScore: 69, maxScore: 80 },
];

export function getAdoResult(score: number): AdoResult {
  for (const result of adoResults) {
    if (score <= result.maxScore) return result;
  }
  return adoResults[adoResults.length - 1];
}
