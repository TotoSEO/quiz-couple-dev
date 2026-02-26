import { useState, useCallback, useMemo } from 'react';
import type { CoquinQuestion, CoquinPlayer, CoquinPhase, CoquinResult, CoquinGameRound } from '@/types/coquin-quiz';
import { coquinResults } from '@/data/quizzes/quiz-coquin-questions';
import { tgd } from '@/utils/quiz-i18n';
import i18n from 'i18next';

const TOTAL_ROUNDS = 30;
const QUESTIONS_PER_PLAYER = 15;

interface UseCoquinQuizReturn {
  // State
  phase: CoquinPhase;
  players: CoquinPlayer | null;
  currentRoundIndex: number;
  rounds: CoquinGameRound[];
  currentRound: CoquinGameRound | null;
  currentQuestion: CoquinQuestion | null;
  
  // Computed
  totalRounds: number;
  progress: number;
  score: number;
  maxScore: number;
  result: CoquinResult | null;
  guessingPlayerName: string;
  targetPlayerName: string;
  
  // Actions
  setPlayers: (name1: string, name2: string) => void;
  submitGuess: (optionId: string) => void;
  submitReveal: (optionId: string) => void;
  nextRound: () => void;
  resetQuiz: () => void;
  restartWithNewQuestions: () => void;
}

// Fisher-Yates shuffle algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const useCoquinQuiz = (allQuestions: CoquinQuestion[]): UseCoquinQuizReturn => {
  const [phase, setPhase] = useState<CoquinPhase>('setup');
  const [players, setPlayersState] = useState<CoquinPlayer | null>(null);
  const [rounds, setRounds] = useState<CoquinGameRound[]>([]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [shuffledQuestionsP1, setShuffledQuestionsP1] = useState<number[]>([]);
  const [shuffledQuestionsP2, setShuffledQuestionsP2] = useState<number[]>([]);

  const totalRounds = TOTAL_ROUNDS;
  const progress = useMemo(() => Math.round((currentRoundIndex / totalRounds) * 100), [currentRoundIndex, totalRounds]);
  const currentRound = useMemo(() => rounds[currentRoundIndex] || null, [rounds, currentRoundIndex]);

  // Translated current question
  const currentQuestion = useMemo(() => {
    if (!currentRound) return null;
    const q = allQuestions.find(q => q.id === currentRound.questionIndex + 1) || null;
    if (!q) return null;
    return {
      ...q,
      text: tgd(`coquinQ.q${q.id}`, q.text),
      options: q.options.map(o => ({ ...o, text: tgd(`coquinQ.q${q.id}${o.id}`, o.text) })),
    };
  }, [currentRound, allQuestions, i18n.language]);

  const guessingPlayerName = useMemo(() => {
    if (!players || !currentRound) return '';
    return currentRound.guessingPlayer === 0 ? players.name1 : players.name2;
  }, [players, currentRound]);

  const targetPlayerName = useMemo(() => {
    if (!players || !currentRound) return '';
    return currentRound.targetPlayer === 0 ? players.name1 : players.name2;
  }, [players, currentRound]);

  const score = useMemo(() => rounds.filter(r => r.isCorrect === true).length, [rounds]);
  const maxScore = QUESTIONS_PER_PLAYER;

  // Translated result
  const result = useMemo(() => {
    if (phase !== 'results') return null;
    const r = coquinResults.find(r => score >= r.minScore && score <= r.maxScore) || coquinResults[coquinResults.length - 1];
    const idx = coquinResults.indexOf(r);
    return {
      ...r,
      title: tgd(`coquinQ.r${idx}t`, r.title),
      description: tgd(`coquinQ.r${idx}d`, r.description),
      advice: tgd(`coquinQ.r${idx}a`, r.advice),
    };
  }, [phase, score, i18n.language]);

  // Generate random questions for a new game
  const generateRandomQuestions = useCallback(() => {
    const allIndices = Array.from({ length: 60 }, (_, i) => i);
    const shuffledAll = shuffleArray(allIndices);
    return { questionsForP1: shuffledAll.slice(0, 15), questionsForP2: shuffledAll.slice(15, 30) };
  }, []);

  const setPlayers = useCallback((name1: string, name2: string) => {
    setPlayersState({ name1, name2 });
    const { questionsForP1, questionsForP2 } = generateRandomQuestions();
    setShuffledQuestionsP1(questionsForP1);
    setShuffledQuestionsP2(questionsForP2);
    const newRounds: CoquinGameRound[] = [];
    for (let i = 0; i < QUESTIONS_PER_PLAYER; i++) {
      newRounds.push({ questionIndex: questionsForP1[i], guessingPlayer: 0, targetPlayer: 1, guessedOptionId: null, actualOptionId: null, isCorrect: null });
      newRounds.push({ questionIndex: questionsForP2[i], guessingPlayer: 1, targetPlayer: 0, guessedOptionId: null, actualOptionId: null, isCorrect: null });
    }
    setRounds(newRounds); setCurrentRoundIndex(0); setPhase('guessing');
  }, [generateRandomQuestions]);

  const restartWithNewQuestions = useCallback(() => {
    if (!players) return;
    const { questionsForP1, questionsForP2 } = generateRandomQuestions();
    setShuffledQuestionsP1(questionsForP1); setShuffledQuestionsP2(questionsForP2);
    const newRounds: CoquinGameRound[] = [];
    for (let i = 0; i < QUESTIONS_PER_PLAYER; i++) {
      newRounds.push({ questionIndex: questionsForP1[i], guessingPlayer: 0, targetPlayer: 1, guessedOptionId: null, actualOptionId: null, isCorrect: null });
      newRounds.push({ questionIndex: questionsForP2[i], guessingPlayer: 1, targetPlayer: 0, guessedOptionId: null, actualOptionId: null, isCorrect: null });
    }
    setRounds(newRounds); setCurrentRoundIndex(0); setPhase('guessing');
  }, [players, generateRandomQuestions]);

  const submitGuess = useCallback((optionId: string) => {
    setRounds(prev => { const u = [...prev]; u[currentRoundIndex] = { ...u[currentRoundIndex], guessedOptionId: optionId }; return u; });
    setPhase('revealing');
  }, [currentRoundIndex]);

  const submitReveal = useCallback((optionId: string) => {
    setRounds(prev => {
      const u = [...prev]; const round = u[currentRoundIndex];
      u[currentRoundIndex] = { ...round, actualOptionId: optionId, isCorrect: round.guessedOptionId === optionId };
      return u;
    });
    setPhase('feedback');
  }, [currentRoundIndex]);

  const nextRound = useCallback(() => {
    if (currentRoundIndex + 1 >= totalRounds) setPhase('results');
    else { setCurrentRoundIndex(prev => prev + 1); setPhase('guessing'); }
  }, [currentRoundIndex, totalRounds]);

  const resetQuiz = useCallback(() => {
    setPhase('setup'); setPlayersState(null); setRounds([]); setCurrentRoundIndex(0);
    setShuffledQuestionsP1([]); setShuffledQuestionsP2([]);
  }, []);

  return {
    phase, players, currentRoundIndex, rounds, currentRound, currentQuestion,
    totalRounds, progress, score, maxScore, result, guessingPlayerName, targetPlayerName,
    setPlayers, submitGuess, submitReveal, nextRound, resetQuiz, restartWithNewQuestions,
  };
};
