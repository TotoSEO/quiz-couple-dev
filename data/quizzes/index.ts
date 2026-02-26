import { quizCouple } from './quiz-couple';
import { quizAmoureux } from './quiz-amoureux';
import { quizCoquin } from './quiz-coquin';
import { quizKnowledge } from './quiz-knowledge';
import { quizMost } from './quiz-most';
import { quizCommonPoints } from './quiz-common-points';
import { quizMarrant } from './quiz-marrant';
import { quizDistance } from './quiz-distance';
import { quizToxic } from './quiz-toxic';
import { quizCoupleSain } from './quiz-couple-sain';
import { quizMariage } from './quiz-mariage';
import { quizDivorce } from './quiz-divorce';
import type { Quiz } from '@/types/quiz';

// Tests pour couples (évaluation individuelle ou de la relation)
export const coupleTests: Quiz[] = [
  quizCouple,
  quizCommonPoints,
  quizDistance,
  quizToxic,
  quizCoupleSain,
  quizMariage,
  quizDivorce,
];

// Quiz à faire en couple (jeux interactifs à deux)
export const coupleQuizzes: Quiz[] = [
  quizAmoureux,
  quizCoquin,
  quizMarrant,
  quizKnowledge,
  quizMost,
];

// Tous les quiz/tests combinés
export const allQuizzes: Quiz[] = [...coupleTests, ...coupleQuizzes];

// Alias for convenience
export const quizzes = allQuizzes;

export { 
  quizCouple, 
  quizAmoureux, 
  quizCoquin, 
  quizKnowledge, 
  quizMost, 
  quizCommonPoints, 
  quizMarrant,
  quizDistance,
  quizToxic,
  quizMariage,
  quizDivorce
};
export { questionsCouple, questionCategories } from './questions-couple';
