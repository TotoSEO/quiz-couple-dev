import { useState, useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { marriageQuestions, marriageResults, type MarriageQuestion, type MarriageResult } from '@/data/quizzes/quiz-mariage-questions';
import { tgd } from '@/utils/quiz-i18n';
import { useTranslation } from 'react-i18next';

interface MarriageQuizState {
  currentQuestion: number;
  answers: (number | 'skip')[];
  score: number;
  skippedCount: number;
  isComplete: boolean;
}

const initialState: MarriageQuizState = {
  currentQuestion: 0,
  answers: [],
  score: 0,
  skippedCount: 0,
  isComplete: false,
};

const THEME_MAP: Record<string, string> = {
  'Finances & Argent': 't1',
  'Enfants & Famille': 't2',
  'Tâches du Quotidien': 't3',
  'Valeurs & Religion': 't4',
  'Vie Sociale & Amis': 't5',
  'Sexualité & Intimité': 't6',
  'Projets de Vie & Ambitions': 't7',
  'Communication & Conflits': 't8',
};

export function useMarriageQuiz() {
  const { i18n } = useTranslation();
  const [savedState, setSavedState, clearSavedState] = useLocalStorage<MarriageQuizState>('quiz-marriage', initialState);
  const [state, setState] = useState<MarriageQuizState>(savedState);

  const totalQuestions = marriageQuestions.length;

  const translatedQuestions = useMemo(() => {
    return marriageQuestions.map((q) => {
      const qKey = `marriage.q${q.id}`;
      const tKey = THEME_MAP[q.theme] || '';
      const optionLetters = ['a', 'b', 'c', 'd'];
      return {
        ...q,
        theme: tgd(`marriage.${tKey}`, q.theme),
        text: tgd(qKey, q.text),
        options: q.options.map((opt, i) => ({
          ...opt,
          text: tgd(`${qKey}${optionLetters[i]}`, opt.text),
        })),
      };
    });
  }, [i18n.language]);

  const translatedResults = useMemo(() => {
    return marriageResults.map((r, i) => ({
      ...r,
      title: tgd(`marriage.r${i + 1}_t`, r.title),
      description: tgd(`marriage.r${i + 1}_d`, r.description),
    }));
  }, [i18n.language]);

  const currentQuestionData = translatedQuestions[state.currentQuestion] || null;
  const progress = (state.currentQuestion / totalQuestions) * 100;

  const answeredCount = totalQuestions - state.skippedCount;
  const maxScore = answeredCount * 2;
  const percentage = maxScore > 0 ? Math.round((state.score / maxScore) * 100) : 0;

  const result: MarriageResult | null = useMemo(() => {
    if (!state.isComplete) return null;
    return translatedResults.find(r => percentage >= r.min && percentage <= r.max) || translatedResults[translatedResults.length - 1];
  }, [state.isComplete, percentage, translatedResults]);

  const skippedQuestions = useMemo(() => {
    if (!state.isComplete) return [];
    return state.answers
      .map((a, i) => (a === 'skip' ? translatedQuestions[i] : null))
      .filter(Boolean) as MarriageQuestion[];
  }, [state.isComplete, state.answers, translatedQuestions]);

  const answerQuestion = useCallback((optionIndex: number) => {
    setState(prev => {
      const q = marriageQuestions[prev.currentQuestion];
      const points = q.options[optionIndex].points;
      const isLast = prev.currentQuestion === totalQuestions - 1;
      const newState: MarriageQuizState = {
        currentQuestion: isLast ? prev.currentQuestion : prev.currentQuestion + 1,
        answers: [...prev.answers, optionIndex],
        score: prev.score + points,
        skippedCount: prev.skippedCount,
        isComplete: isLast,
      };
      setSavedState(newState);
      return newState;
    });
  }, [totalQuestions, setSavedState]);

  const skipQuestion = useCallback(() => {
    setState(prev => {
      const isLast = prev.currentQuestion === totalQuestions - 1;
      const newState: MarriageQuizState = {
        currentQuestion: isLast ? prev.currentQuestion : prev.currentQuestion + 1,
        answers: [...prev.answers, 'skip'],
        score: prev.score,
        skippedCount: prev.skippedCount + 1,
        isComplete: isLast,
      };
      setSavedState(newState);
      return newState;
    });
  }, [totalQuestions, setSavedState]);

  const goToPreviousQuestion = useCallback(() => {
    setState(prev => {
      if (prev.currentQuestion === 0 || prev.isComplete) return prev;
      const lastAnswer = prev.answers[prev.answers.length - 1];
      const wasSkipped = lastAnswer === 'skip';
      const lastPoints = wasSkipped ? 0 : marriageQuestions[prev.currentQuestion - 1].options[lastAnswer as number].points;
      const newState: MarriageQuizState = {
        currentQuestion: prev.currentQuestion - 1,
        answers: prev.answers.slice(0, -1),
        score: prev.score - lastPoints,
        skippedCount: prev.skippedCount - (wasSkipped ? 1 : 0),
        isComplete: false,
      };
      setSavedState(newState);
      return newState;
    });
  }, [setSavedState]);

  const resetQuiz = useCallback(() => {
    setState(initialState);
    clearSavedState();
  }, [clearSavedState]);

  const hasProgress = state.currentQuestion > 0 || state.answers.length > 0;

  return {
    currentQuestion: state.currentQuestion,
    currentQuestionData,
    totalQuestions,
    progress,
    score: state.score,
    maxScore,
    percentage,
    skippedCount: state.skippedCount,
    answeredCount,
    isComplete: state.isComplete,
    result,
    skippedQuestions,
    hasProgress,
    answerQuestion,
    skipQuestion,
    goToPreviousQuestion,
    resetQuiz,
  };
}
