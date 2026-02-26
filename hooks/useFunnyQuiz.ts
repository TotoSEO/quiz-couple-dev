import { useState, useCallback } from 'react';
import type { FunnyQuizPlayer, FunnyQuizPhase, FunnyQuizQuestion } from '@/types/funny-quiz';
import { getRandomFunnyQuestions, funnyQuizCategories } from '@/data/quizzes/quiz-marrant-questions';
import { tgd } from '@/utils/quiz-i18n';

const QUESTIONS_PER_GAME = 20;

export function useFunnyQuiz() {
  const [phase, setPhase] = useState<FunnyQuizPhase>('setup');
  const [players, setPlayersState] = useState<[FunnyQuizPlayer, FunnyQuizPlayer]>([{ name: '' }, { name: '' }]);
  const [questions, setQuestions] = useState<FunnyQuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const currentPlayerIndex = currentQuestionIndex % 2;
  const activePlayer = players[currentPlayerIndex];
  const otherPlayer = players[currentPlayerIndex === 0 ? 1 : 0];

  const rawQuestion = questions[currentQuestionIndex] || null;
  const currentQuestion = rawQuestion ? {
    ...rawQuestion,
    text: tgd(`funny.${rawQuestion.id}`, rawQuestion.text),
    category: tgd(`funny.cat_${funnyQuizCategories.indexOf(rawQuestion.category)}`, rawQuestion.category),
  } : null;

  const totalQuestions = QUESTIONS_PER_GAME;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const setPlayers = useCallback((name1: string, name2: string) => {
    setPlayersState([{ name: name1 }, { name: name2 }]);
    setQuestions(getRandomFunnyQuestions(QUESTIONS_PER_GAME));
    setCurrentQuestionIndex(0);
    setPhase('playing');
  }, []);

  const nextQuestion = useCallback(() => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setPhase('results');
    }
  }, [currentQuestionIndex, totalQuestions]);

  const restartWithNewQuestions = useCallback(() => {
    setQuestions(getRandomFunnyQuestions(QUESTIONS_PER_GAME));
    setCurrentQuestionIndex(0);
    setPhase('playing');
  }, []);

  const resetQuiz = useCallback(() => {
    setPlayersState([{ name: '' }, { name: '' }]);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setPhase('setup');
  }, []);

  return {
    phase, players, questions, currentQuestionIndex, currentPlayerIndex,
    activePlayer, otherPlayer, currentQuestion, totalQuestions, progress,
    setPlayers, nextQuestion, restartWithNewQuestions, resetQuiz,
  };
}
