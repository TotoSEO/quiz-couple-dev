import { useState, useCallback, useEffect } from 'react';
import type { 
  KnowledgePlayer, 
  KnowledgePhase, 
  KnowledgeGameState,
  KnowledgeGameRound
} from '@/types/knowledge-quiz';
import { getRandomQuestions } from '@/data/quizzes/quiz-knowledge-questions';
import { tgd } from '@/utils/quiz-i18n';
import i18n from 'i18next';

const QUESTIONS_PER_GAME = 20;
const TRANSITION_DURATION = 2500;

export function useKnowledgeQuiz() {
  const [gameState, setGameState] = useState<KnowledgeGameState>({
    phase: 'setup', players: null, selectedQuestions: [], currentRound: 0, rounds: [], scores: [0, 0],
  });
  const [nextGuessingPlayerIndex, setNextGuessingPlayerIndex] = useState<0 | 1>(0);

  // Start the game with player names
  const startGame = useCallback((player1: KnowledgePlayer, player2: KnowledgePlayer) => {
    const questions = getRandomQuestions(QUESTIONS_PER_GAME);
    const initialRounds: KnowledgeGameRound[] = questions.map((_, index) => ({
      questionIndex: index,
      guessingPlayerIndex: (index % 2) as 0 | 1,
      targetPlayerIndex: ((index + 1) % 2) as 0 | 1,
      isCorrect: null,
    }));
    setGameState({ phase: 'question', players: [player1, player2], selectedQuestions: questions, currentRound: 0, rounds: initialRounds, scores: [0, 0] });
    setNextGuessingPlayerIndex(0);
  }, []);

  // Handle answer validation (correct or wrong)
  const handleAnswer = useCallback((isCorrect: boolean) => {
    setGameState(prev => {
      const currentRound = prev.rounds[prev.currentRound];
      const newScores: [number, number] = [...prev.scores];
      if (isCorrect) newScores[currentRound.guessingPlayerIndex]++;
      const updatedRounds = prev.rounds.map((round, index) => index === prev.currentRound ? { ...round, isCorrect } : round);
      const isLastRound = prev.currentRound >= QUESTIONS_PER_GAME - 1;
      const nextGuessingIdx = ((currentRound.guessingPlayerIndex + 1) % 2) as 0 | 1;
      setNextGuessingPlayerIndex(nextGuessingIdx);
      return { ...prev, rounds: updatedRounds, scores: newScores, phase: isLastRound ? 'results' : 'transition' };
    });
  }, []);

  // Transition to next question after delay
  useEffect(() => {
    if (gameState.phase === 'transition') {
      const timer = setTimeout(() => {
        setGameState(prev => ({ ...prev, currentRound: prev.currentRound + 1, phase: 'question' }));
      }, TRANSITION_DURATION);
      return () => clearTimeout(timer);
    }
  }, [gameState.phase]);

  // Restart with new random questions
  const restartGame = useCallback(() => {
    if (!gameState.players) return;
    const questions = getRandomQuestions(QUESTIONS_PER_GAME);
    const initialRounds: KnowledgeGameRound[] = questions.map((_, index) => ({
      questionIndex: index, guessingPlayerIndex: (index % 2) as 0 | 1, targetPlayerIndex: ((index + 1) % 2) as 0 | 1, isCorrect: null,
    }));
    setGameState(prev => ({ ...prev, phase: 'question', selectedQuestions: questions, currentRound: 0, rounds: initialRounds, scores: [0, 0] }));
    setNextGuessingPlayerIndex(0);
  }, [gameState.players]);

  // Reset to setup
  const resetGame = useCallback(() => {
    setGameState({ phase: 'setup', players: null, selectedQuestions: [], currentRound: 0, rounds: [], scores: [0, 0] });
    setNextGuessingPlayerIndex(0);
  }, []);

  // Get current round info
  const getCurrentRound = useCallback(() => {
    if (gameState.currentRound >= gameState.rounds.length) return null;
    return gameState.rounds[gameState.currentRound];
  }, [gameState.currentRound, gameState.rounds]);

  // Translated getCurrentQuestion
  const getCurrentQuestion = useCallback(() => {
    const round = getCurrentRound();
    if (!round) return null;
    const q = gameState.selectedQuestions[round.questionIndex];
    if (!q) return null;
    return { ...q, text: tgd(`knowledge.${q.id}`, q.text) };
  }, [getCurrentRound, gameState.selectedQuestions, i18n.language]);

  // Get player by index
  const getPlayer = useCallback((index: 0 | 1) => {
    return gameState.players?.[index] ?? null;
  }, [gameState.players]);

  return {
    gameState, startGame, handleAnswer, restartGame, resetGame,
    getCurrentRound, getCurrentQuestion, getPlayer, nextGuessingPlayerIndex,
    totalQuestions: QUESTIONS_PER_GAME,
  };
}
