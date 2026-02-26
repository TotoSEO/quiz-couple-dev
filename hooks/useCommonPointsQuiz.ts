import { useState, useCallback, useMemo } from 'react';
import { CommonPointsQuestion, getRandomQuestions } from '@/data/quizzes/common-points-questions';
import type { CommonPointsPlayer, CommonPointsPhase, CommonPointsAnswers, CommonPointsQuizResult } from '@/types/common-points-quiz';
import { tgd } from '@/utils/quiz-i18n';
import i18n from 'i18next';

const QUESTIONS_PER_GAME = 20;

const results: CommonPointsQuizResult[] = [
  { minScore: 0, maxScore: 5, title: "Vous avez encore beaucoup à découvrir !", emoji: "🌱", description: "Vos réponses diffèrent souvent, mais ce n'est pas un problème ! Les différences peuvent enrichir une relation et ouvrir des discussions passionnantes.", advice: "Profitez de ce quiz pour explorer vos différences et comprendre ce qui vous rend uniques. La complémentarité peut être une vraie force !" },
  { minScore: 6, maxScore: 10, title: "Quelques points communs, de belles différences", emoji: "🌿", description: "Vous partagez certaines affinités tout en gardant vos particularités. C'est un bon équilibre entre fusion et indépendance !", advice: "Continuez à cultiver vos points communs tout en respectant vos différences. C'est cette diversité qui rend votre relation intéressante." },
  { minScore: 11, maxScore: 15, title: "Belle complicité, vous vous connaissez bien !", emoji: "💕", description: "Vous êtes souvent sur la même longueur d'onde. Votre complicité est évidente et vos goûts se rejoignent naturellement.", advice: "Vous formez un duo complice ! N'hésitez pas à explorer de nouvelles expériences ensemble pour renforcer encore plus vos liens." },
  { minScore: 16, maxScore: 20, title: "Âmes sœurs ! Vous êtes sur la même longueur d'onde", emoji: "💖", description: "Incroyable ! Vous partagez une grande majorité de vos goûts, valeurs et visions. Votre connexion est rare et précieuse.", advice: "Votre compatibilité est exceptionnelle ! Continuez à nourrir cette belle harmonie et à construire ensemble sur cette base solide." },
];

interface UseCommonPointsQuizReturn {
  phase: CommonPointsPhase;
  players: [CommonPointsPlayer, CommonPointsPlayer] | null;
  questions: CommonPointsQuestion[];
  currentQuestion: number;
  currentPlayer: 0 | 1;
  answers: CommonPointsAnswers;
  totalQuestions: number;
  progress: number;
  score: number;
  result: CommonPointsQuizResult | null;
  currentPlayerData: CommonPointsPlayer | null;
  currentQuestionData: CommonPointsQuestion | null;
  setPlayers: (p1: CommonPointsPlayer, p2: CommonPointsPlayer) => void;
  answerQuestion: (optionId: string) => void;
  resetQuiz: () => void;
  restartWithNewQuestions: () => void;
}

export function useCommonPointsQuiz(): UseCommonPointsQuizReturn {
  const [phase, setPhase] = useState<CommonPointsPhase>('setup');
  const [players, setPlayersState] = useState<[CommonPointsPlayer, CommonPointsPlayer] | null>(null);
  const [questions, setQuestions] = useState<CommonPointsQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState<0 | 1>(0);
  const [answers, setAnswers] = useState<CommonPointsAnswers>({ player1: [], player2: [] });

  const totalQuestions = QUESTIONS_PER_GAME;
  const totalAnswersNeeded = totalQuestions * 2;
  const currentAnswersCount = answers.player1.filter(a => a !== null).length + answers.player2.filter(a => a !== null).length;
  const progress = Math.round((currentAnswersCount / totalAnswersNeeded) * 100);

  const score = useMemo(() => {
    let matchCount = 0;
    for (let i = 0; i < questions.length; i++) {
      if (answers.player1[i] && answers.player2[i] && answers.player1[i] === answers.player2[i]) matchCount++;
    }
    return matchCount;
  }, [answers, questions.length]);

  const currentLang = i18n.language;

  const result = useMemo(() => {
    if (phase !== 'results') return null;
    const r = results.find(r => score >= r.minScore && score <= r.maxScore) || null;
    if (!r) return null;
    const idx = results.indexOf(r);
    return {
      ...r,
      title: tgd(`cp.r${idx}t`, r.title),
      description: tgd(`cp.r${idx}d`, r.description),
      advice: tgd(`cp.r${idx}a`, r.advice),
    };
  }, [phase, score, currentLang]);

  const currentPlayerData = useMemo(() => {
    if (!players) return null;
    return players[currentPlayer];
  }, [players, currentPlayer]);

  // Translated question data
  const currentQuestionData = useMemo(() => {
    if (questions.length === 0) return null;
    const q = questions[currentQuestion];
    if (!q) return null;
    return {
      ...q,
      text: tgd(`cp.q${q.id}`, q.text),
      options: q.options.map(o => ({ ...o, text: tgd(`cp.o_${o.id}`, o.text) })),
    };
  }, [questions, currentQuestion, currentLang]);

  const setPlayers = useCallback((p1: CommonPointsPlayer, p2: CommonPointsPlayer) => {
    const randomQuestions = getRandomQuestions(QUESTIONS_PER_GAME);
    setPlayersState([p1, p2]);
    setQuestions(randomQuestions);
    setPhase('playing');
    setCurrentQuestion(0);
    setCurrentPlayer(0);
    setAnswers({ player1: Array(QUESTIONS_PER_GAME).fill(null), player2: Array(QUESTIONS_PER_GAME).fill(null) });
  }, []);

  const answerQuestion = useCallback((optionId: string) => {
    setAnswers(prev => {
      const newAnswers = { ...prev };
      if (currentPlayer === 0) {
        newAnswers.player1 = [...prev.player1];
        newAnswers.player1[currentQuestion] = optionId;
      } else {
        newAnswers.player2 = [...prev.player2];
        newAnswers.player2[currentQuestion] = optionId;
      }
      return newAnswers;
    });
    if (currentPlayer === 0) {
      setCurrentPlayer(1);
    } else {
      if (currentQuestion < totalQuestions - 1) {
        setCurrentQuestion(prev => prev + 1);
        setCurrentPlayer(0);
      } else {
        setPhase('results');
      }
    }
  }, [currentPlayer, currentQuestion, totalQuestions]);

  const resetQuiz = useCallback(() => {
    setPhase('setup');
    setPlayersState(null);
    setQuestions([]);
    setCurrentQuestion(0);
    setCurrentPlayer(0);
    setAnswers({ player1: [], player2: [] });
  }, []);

  const restartWithNewQuestions = useCallback(() => {
    if (!players) return;
    const randomQuestions = getRandomQuestions(QUESTIONS_PER_GAME);
    setQuestions(randomQuestions);
    setPhase('playing');
    setCurrentQuestion(0);
    setCurrentPlayer(0);
    setAnswers({ player1: Array(QUESTIONS_PER_GAME).fill(null), player2: Array(QUESTIONS_PER_GAME).fill(null) });
  }, [players]);

  return {
    phase, players, questions, currentQuestion, currentPlayer, answers,
    totalQuestions, progress, score, result, currentPlayerData, currentQuestionData,
    setPlayers, answerQuestion, resetQuiz, restartWithNewQuestions,
  };
}
