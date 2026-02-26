import { useState, useCallback, useMemo } from 'react';
import type { DuoPlayer, DuoQuiz, DuoQuizAnswers, DuoQuizPhase, DuoQuizResult, PlayerColors } from '@/types/duo-quiz';
import { tgd, DUO_KEYS } from '@/utils/quiz-i18n';
import i18n from 'i18next';

interface UseDuoQuizReturn {
  phase: DuoQuizPhase; players: [DuoPlayer, DuoPlayer] | null;
  currentQuestion: number; currentPlayer: 0 | 1; answers: DuoQuizAnswers;
  totalQuestions: number; progress: number; score: number;
  result: DuoQuizResult | null; currentPlayerData: DuoPlayer | null;
  getPlayerColors: (playerIndex: 0 | 1) => PlayerColors;
  setPlayers: (p1: DuoPlayer, p2: DuoPlayer) => void;
  answerQuestion: (optionId: string) => void; resetQuiz: () => void;
}

export function useDuoQuiz(quiz: DuoQuiz): UseDuoQuizReturn {
  const [phase, setPhase] = useState<DuoQuizPhase>('setup');
  const [players, setPlayersState] = useState<[DuoPlayer, DuoPlayer] | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState<0 | 1>(0);
  const [answers, setAnswers] = useState<DuoQuizAnswers>({ player1: [], player2: [] });

  const qKey = DUO_KEYS[quiz.id] || quiz.id;
  const totalQuestions = quiz.questions.length;
  const totalAnswersNeeded = totalQuestions * 2;
  const currentAnswersCount = answers.player1.filter(a => a !== null).length + answers.player2.filter(a => a !== null).length;
  const progress = Math.round((currentAnswersCount / totalAnswersNeeded) * 100);

  const score = useMemo(() => {
    let matchCount = 0;
    for (let i = 0; i < totalQuestions; i++) {
      if (answers.player1[i] && answers.player2[i] && answers.player1[i] === answers.player2[i]) matchCount++;
    }
    return matchCount;
  }, [answers, totalQuestions]);

  const result = useMemo(() => {
    if (phase !== 'results') return null;
    const r = quiz.results.find(r => score >= r.minScore && score <= r.maxScore) || null;
    if (!r) return null;
    const idx = quiz.results.indexOf(r);
    return {
      ...r,
      title: tgd(`${qKey}.r${idx}t`, r.title),
      description: tgd(`${qKey}.r${idx}d`, r.description),
      advice: tgd(`${qKey}.r${idx}a`, r.advice),
    };
  }, [phase, score, quiz.results, qKey, i18n.language]);

  const currentPlayerData = useMemo(() => {
    if (!players) return null;
    return players[currentPlayer];
  }, [players, currentPlayer]);

  const getPlayerColors = useCallback((playerIndex: 0 | 1): PlayerColors => {
    if (!players) return { bg: 'bg-primary', text: 'text-primary-foreground', border: 'border-primary', glow: 'shadow-primary/40', gradient: 'from-primary to-primary/80' };
    const player = players[playerIndex];
    const otherPlayer = players[playerIndex === 0 ? 1 : 0];
    const sameGender = player.gender === otherPlayer.gender;
    if (player.gender === 'femme') {
      if (sameGender) return playerIndex === 0 
        ? { bg: 'bg-pink-500', text: 'text-white', border: 'border-pink-400', glow: 'shadow-pink-500/40', gradient: 'from-pink-500 to-pink-400' }
        : { bg: 'bg-rose-700', text: 'text-white', border: 'border-rose-600', glow: 'shadow-rose-700/40', gradient: 'from-rose-700 to-rose-600' };
      return { bg: 'bg-pink-500', text: 'text-white', border: 'border-pink-400', glow: 'shadow-pink-500/40', gradient: 'from-pink-500 to-pink-400' };
    }
    if (sameGender) return playerIndex === 0 
      ? { bg: 'bg-blue-500', text: 'text-white', border: 'border-blue-400', glow: 'shadow-blue-500/40', gradient: 'from-blue-500 to-blue-400' }
      : { bg: 'bg-indigo-800', text: 'text-white', border: 'border-indigo-700', glow: 'shadow-indigo-800/40', gradient: 'from-indigo-800 to-indigo-700' };
    return { bg: 'bg-blue-500', text: 'text-white', border: 'border-blue-400', glow: 'shadow-blue-500/40', gradient: 'from-blue-500 to-blue-400' };
  }, [players]);

  const setPlayers = useCallback((p1: DuoPlayer, p2: DuoPlayer) => {
    setPlayersState([p1, p2]);
    setPhase('playing');
    setCurrentQuestion(0);
    setCurrentPlayer(0);
    setAnswers({ player1: Array(totalQuestions).fill(null), player2: Array(totalQuestions).fill(null) });
  }, [totalQuestions]);

  const answerQuestion = useCallback((optionId: string) => {
    setAnswers(prev => {
      const newAnswers = { ...prev };
      if (currentPlayer === 0) { newAnswers.player1 = [...prev.player1]; newAnswers.player1[currentQuestion] = optionId; }
      else { newAnswers.player2 = [...prev.player2]; newAnswers.player2[currentQuestion] = optionId; }
      return newAnswers;
    });
    if (currentPlayer === 0) setCurrentPlayer(1);
    else if (currentQuestion < totalQuestions - 1) { setCurrentQuestion(prev => prev + 1); setCurrentPlayer(0); }
    else setPhase('results');
  }, [currentPlayer, currentQuestion, totalQuestions]);

  const resetQuiz = useCallback(() => {
    setPhase('setup'); setPlayersState(null); setCurrentQuestion(0); setCurrentPlayer(0);
    setAnswers({ player1: [], player2: [] });
  }, []);

  return {
    phase, players, currentQuestion, currentPlayer, answers, totalQuestions,
    progress, score, result, currentPlayerData, getPlayerColors,
    setPlayers, answerQuestion, resetQuiz,
  };
}
