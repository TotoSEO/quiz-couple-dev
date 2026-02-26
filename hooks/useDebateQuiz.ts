import { useState, useMemo, useCallback } from 'react';
import type { DebateQuiz, DebatePlayers, DebateQuizPhase, DebateQuizResult } from '@/types/debate-quiz';
import { tgd, DEBATE_KEYS } from '@/utils/quiz-i18n';
import i18n from 'i18next';

interface UseDebateQuizReturn {
  phase: DebateQuizPhase; players: DebatePlayers | null;
  currentQuestion: number; scores: number[];
  totalQuestions: number; progress: number;
  totalScore: number; percentageScore: number;
  result: DebateQuizResult | null;
  currentQuestionData: { id: number; text: string; category: string } | null;
  setPlayers: (p1: string, p2: string) => void;
  answerQuestion: (score: number) => void;
  goToPreviousQuestion: () => void; resetQuiz: () => void;
}

export function useDebateQuiz(quiz: DebateQuiz): UseDebateQuizReturn {
  const [phase, setPhase] = useState<DebateQuizPhase>('setup');
  const [players, setPlayersState] = useState<DebatePlayers | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState<number[]>([]);

  const qKey = DEBATE_KEYS[quiz.id] || quiz.id;
  const currentLang = i18n.language;
  const totalQuestions = quiz.questions.length;
  const progress = useMemo(() => (currentQuestion / totalQuestions) * 100, [currentQuestion, totalQuestions]);
  const totalScore = useMemo(() => scores.reduce((sum, s) => sum + s, 0), [scores]);
  const percentageScore = useMemo(() => Math.round((totalScore / (totalQuestions * 5)) * 100), [totalScore, totalQuestions]);

  // Translated current question
  const currentQuestionData = useMemo(() => {
    const q = quiz.questions[currentQuestion];
    if (!q) return null;
    return { ...q, text: tgd(`${qKey}.q${q.id}`, q.text) };
  }, [quiz.questions, currentQuestion, qKey, currentLang]);

  const result = useMemo((): DebateQuizResult | null => {
    if (phase !== 'results') return null;
    const r = quiz.results.find(r => percentageScore >= r.minScore && percentageScore <= r.maxScore) || quiz.results[quiz.results.length - 1];
    if (!r) return null;
    const idx = quiz.results.indexOf(r);
    return {
      ...r,
      title: tgd(`${qKey}.r${idx}t`, r.title),
      description: tgd(`${qKey}.r${idx}d`, r.description),
      advice: tgd(`${qKey}.r${idx}a`, r.advice),
    };
  }, [phase, percentageScore, quiz.results, qKey, currentLang]);

  const setPlayers = useCallback((name1: string, name2: string) => {
    setPlayersState({ player1: { name: name1.trim() }, player2: { name: name2.trim() } });
    setPhase('playing'); setCurrentQuestion(0); setScores([]);
  }, []);

  const answerQuestion = useCallback((score: number) => {
    const newScores = [...scores]; newScores[currentQuestion] = score; setScores(newScores);
    if (currentQuestion < totalQuestions - 1) setCurrentQuestion(prev => prev + 1);
    else setPhase('results');
  }, [scores, currentQuestion, totalQuestions]);

  const goToPreviousQuestion = useCallback(() => {
    if (currentQuestion > 0) setCurrentQuestion(prev => prev - 1);
  }, [currentQuestion]);

  const resetQuiz = useCallback(() => {
    setPhase('setup'); setPlayersState(null); setCurrentQuestion(0); setScores([]);
  }, []);

  return {
    phase, players, currentQuestion, scores, totalQuestions, progress,
    totalScore, percentageScore, result, currentQuestionData,
    setPlayers, answerQuestion, goToPreviousQuestion, resetQuiz,
  };
}
