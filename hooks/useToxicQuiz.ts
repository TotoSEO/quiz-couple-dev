import { useState, useCallback } from 'react';
import type { ToxicQuizPhase, ToxicQuizState } from '@/types/toxic-quiz';
import { toxicQuizQuestions, getVerdict, TOTAL_QUESTIONS } from '@/data/quizzes/quiz-toxic-questions';
import { tgd } from '@/utils/quiz-i18n';

const initialState: ToxicQuizState = {
  phase: 'intro',
  currentQuestionIndex: 0,
  answers: [],
  totalScore: 0,
};

export function useToxicQuiz() {
  const [state, setState] = useState<ToxicQuizState>(initialState);

  const rawQuestion = toxicQuizQuestions[state.currentQuestionIndex];
  const currentQuestion = rawQuestion ? {
    ...rawQuestion,
    text: tgd(`toxic.q${rawQuestion.id}`, rawQuestion.text),
    options: rawQuestion.options.map(o => ({
      ...o,
      text: tgd(`toxic.q${rawQuestion.id}${o.id}`, o.text),
    })),
  } : rawQuestion;

  const isLastQuestion = state.currentQuestionIndex === TOTAL_QUESTIONS - 1;
  const progress = ((state.currentQuestionIndex + 1) / TOTAL_QUESTIONS) * 100;

  const startQuiz = useCallback(() => {
    setState({ ...initialState, phase: 'playing' });
  }, []);

  const answerQuestion = useCallback((points: number) => {
    setState((prev) => {
      const newAnswers = [...prev.answers];
      newAnswers[prev.currentQuestionIndex] = points;
      const newTotalScore = newAnswers.reduce((sum, p) => sum + p, 0);
      if (prev.currentQuestionIndex === TOTAL_QUESTIONS - 1) {
        return { ...prev, answers: newAnswers, totalScore: newTotalScore, phase: 'results' };
      }
      return { ...prev, answers: newAnswers, totalScore: newTotalScore, currentQuestionIndex: prev.currentQuestionIndex + 1 };
    });
  }, []);

  const goToPreviousQuestion = useCallback(() => {
    setState((prev) => {
      if (prev.currentQuestionIndex === 0) return prev;
      return { ...prev, currentQuestionIndex: prev.currentQuestionIndex - 1 };
    });
  }, []);

  const resetQuiz = useCallback(() => {
    setState(initialState);
  }, []);

  const rawVerdict = state.phase === 'results' ? getVerdict(state.totalScore) : null;
  const verdict = rawVerdict ? {
    ...rawVerdict,
    title: tgd(`toxic.v_${rawVerdict.level}_t`, rawVerdict.title),
    description: tgd(`toxic.v_${rawVerdict.level}_d`, rawVerdict.description),
  } : null;

  return {
    phase: state.phase, currentQuestionIndex: state.currentQuestionIndex,
    currentQuestion, totalScore: state.totalScore, answers: state.answers,
    progress, isLastQuestion, verdict, totalQuestions: TOTAL_QUESTIONS,
    startQuiz, answerQuestion, goToPreviousQuestion, resetQuiz,
  };
}
