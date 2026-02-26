import { useState, useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { Quiz, QuizState } from '@/types/quiz';
import { tgd, QUIZ_KEYS } from '@/utils/quiz-i18n';
import i18n from 'i18next';

const initialState: QuizState = {
  currentQuestion: 0,
  answers: [],
  score: 0,
  isComplete: false,
};

export function useQuiz(quiz: Quiz) {
  const storageKey = `quiz-progress-${quiz.id}`;
  const [savedState, setSavedState, clearSavedState] = useLocalStorage<QuizState>(storageKey, initialState);
  const [state, setState] = useState<QuizState>(savedState);

  const qKey = QUIZ_KEYS[quiz.id] || quiz.id;
  const currentLang = i18n.language;
  const totalQuestions = quiz.questions.length;
  
  // Translated question data
  const currentQuestionData = useMemo(() => {
    const q = quiz.questions[state.currentQuestion];
    if (!q) return q;
    return {
      ...q,
      text: tgd(`${qKey}.q${q.id}`, q.text),
      options: q.options.map((o, j) => ({ ...o, text: tgd(`${qKey}.q${q.id}o${j}`, o.text) })),
    };
  }, [quiz.questions, state.currentQuestion, qKey, currentLang]);

  const progress = ((state.currentQuestion) / totalQuestions) * 100;

  const maxScore = useMemo(() => {
    return quiz.questions.reduce((acc, q) => acc + Math.max(...q.options.map(o => o.points)), 0);
  }, [quiz.questions]);

  // Translated result
  const result = useMemo(() => {
    if (!state.isComplete) return null;
    const percentage = (state.score / maxScore) * 100;
    const r = quiz.results.find(r => percentage >= r.min && percentage <= r.max) || quiz.results[quiz.results.length - 1];
    if (!r) return null;
    const idx = quiz.results.indexOf(r);
    return {
      ...r,
      title: tgd(`${qKey}.r${idx}t`, r.title),
      description: tgd(`${qKey}.r${idx}d`, r.description),
      advice: tgd(`${qKey}.r${idx}a`, r.advice),
    };
  }, [state.isComplete, state.score, maxScore, quiz.results, qKey, currentLang]);

  const answerQuestion = useCallback((optionIndex: number) => {
    const points = quiz.questions[state.currentQuestion].options[optionIndex].points;
    setState(prev => {
      const newAnswers = [...prev.answers, optionIndex];
      const newScore = prev.score + points;
      const isLastQuestion = prev.currentQuestion === totalQuestions - 1;
      const newState: QuizState = {
        currentQuestion: isLastQuestion ? prev.currentQuestion : prev.currentQuestion + 1,
        answers: newAnswers, score: newScore, isComplete: isLastQuestion,
      };
      setSavedState(newState);
      return newState;
    });
  }, [quiz.questions, state.currentQuestion, totalQuestions, setSavedState]);

  const goToPreviousQuestion = useCallback(() => {
    setState(prev => {
      if (prev.currentQuestion === 0 || prev.isComplete) return prev;
      const lastAnswerIndex = prev.answers[prev.answers.length - 1];
      const lastPoints = quiz.questions[prev.currentQuestion - 1].options[lastAnswerIndex].points;
      const newState: QuizState = {
        currentQuestion: prev.currentQuestion - 1, answers: prev.answers.slice(0, -1),
        score: prev.score - lastPoints, isComplete: false,
      };
      setSavedState(newState);
      return newState;
    });
  }, [quiz.questions, setSavedState]);

  const resetQuiz = useCallback(() => {
    setState(initialState);
    clearSavedState();
  }, [clearSavedState]);

  const hasProgress = state.currentQuestion > 0 || state.answers.length > 0;

  return {
    currentQuestion: state.currentQuestion, currentQuestionData,
    answers: state.answers, score: state.score, isComplete: state.isComplete, result,
    totalQuestions, progress, maxScore, hasProgress,
    answerQuestion, goToPreviousQuestion, resetQuiz,
  };
}
