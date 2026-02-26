import { useState, useCallback, useMemo } from 'react';
import i18n from 'i18next';
import type { DuoPlayer, DuoQuizQuestion, DuoQuizPhase, PlayerColors } from '@/types/duo-quiz';
import { tgd } from '@/utils/quiz-i18n';

const OPTION_SCORES: Record<string, number> = { a: 0.5, b: 1, c: 1.5, d: 2 };
const QUESTIONS_PER_SESSION = 20;
const MAX_SCORE_PER_PLAYER = QUESTIONS_PER_SESSION * 2; // 40

export interface HealthyQuizResultRange {
  minScore: number;
  maxScore: number;
  title: string;
  emoji: string;
  description: string;
  advice: string;
}

const RESULT_RANGES_FR: HealthyQuizResultRange[] = [
  {
    minScore: 0, maxScore: 30,
    emoji: '🔴',
    title: 'Des fondations à (re)construire',
    description: 'Votre relation traverse visiblement des turbulences profondes. Plusieurs piliers essentiels semblent fragilisés. Ce résultat n\'est pas une sentence — c\'est une information.',
    advice: 'Beaucoup de couples ont traversé des phases très difficiles et s\'en sont sortis. Mais cela demande une volonté sincère des deux côtés, et souvent l\'aide d\'un professionnel.',
  },
  {
    minScore: 31, maxScore: 52,
    emoji: '🟠',
    title: 'Un couple qui mérite plus d\'attention',
    description: 'Il y a de vraies choses positives dans votre relation, mais certaines zones d\'ombre méritent votre attention. Vous avez probablement identifié quelques questions qui vous ont fait réfléchir.',
    advice: 'Ce stade est souvent le plus propice au changement. Parlez-vous de ce que vous avez ressenti en faisant ce test.',
  },
  {
    minScore: 53, maxScore: 68,
    emoji: '🟢',
    title: 'Une relation solide avec des points d\'amélioration',
    description: 'Votre couple est globalement sain. Vous avez de bonnes bases : la confiance, la communication, le respect semblent présents.',
    advice: 'Certains aspects pourraient être renforcés, et c\'est normal dans toute relation. Vous êtes dans une dynamique positive !',
  },
  {
    minScore: 69, maxScore: 80,
    emoji: '💚',
    title: 'Une relation épanouissante',
    description: 'Bravo ! Vous avez construit quelque chose de solide, de respectueux et de bienveillant. Votre couple est une belle illustration de ce que peut être une relation saine.',
    advice: 'Continuez à en prendre soin, à vous parler, à vous choisir. Ces scores ne se maintiennent pas tout seuls : ils sont le fruit d\'un effort quotidien.',
  },
];

function shuffleAndPick(pool: DuoQuizQuestion[], count: number): DuoQuizQuestion[] {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function translateQuestion(q: DuoQuizQuestion): DuoQuizQuestion {
  return {
    ...q,
    text: tgd(`healthy.q${q.id}`, q.text),
    options: q.options.map(o => ({
      ...o,
      text: tgd(`healthy.q${q.id}${o.id}`, o.text),
    })),
  };
}

function getTranslatedResults(): HealthyQuizResultRange[] {
  return RESULT_RANGES_FR.map((r, i) => ({
    ...r,
    title: tgd(`healthy.r${i + 1}_t`, r.title),
    description: tgd(`healthy.r${i + 1}_d`, r.description),
    advice: tgd(`healthy.r${i + 1}_a`, r.advice),
  }));
}

export function useHealthyQuiz(questionsPool: DuoQuizQuestion[]) {
  const [phase, setPhase] = useState<DuoQuizPhase>('setup');
  const [players, setPlayersState] = useState<[DuoPlayer, DuoPlayer] | null>(null);
  const [questions, setQuestions] = useState<DuoQuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState<0 | 1>(0);
  const [scores, setScores] = useState<[number[], number[]]>([[], []]);

  const totalQuestions = questions.length || QUESTIONS_PER_SESSION;
  const totalAnswersNeeded = totalQuestions * 2;
  const currentAnswersCount = scores[0].length + scores[1].length;
  const progress = totalAnswersNeeded > 0 ? Math.round((currentAnswersCount / totalAnswersNeeded) * 100) : 0;

  const scorePlayer1 = useMemo(() => scores[0].reduce((sum, s) => sum + s, 0), [scores]);
  const scorePlayer2 = useMemo(() => scores[1].reduce((sum, s) => sum + s, 0), [scores]);
  const totalScore = scorePlayer1 + scorePlayer2;

  const translatedCurrentQuestion = useMemo(() => {
    if (!questions[currentQuestion]) return null;
    return translateQuestion(questions[currentQuestion]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions, currentQuestion, i18n.language]);

  const result = useMemo(() => {
    if (phase !== 'results') return null;
    const ranges = getTranslatedResults();
    return ranges.find(r => totalScore >= r.minScore && totalScore <= r.maxScore) || ranges[0];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, totalScore, i18n.language]);

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
    const selected = shuffleAndPick(questionsPool, QUESTIONS_PER_SESSION);
    setPlayersState([p1, p2]);
    setQuestions(selected);
    setPhase('playing');
    setCurrentQuestion(0);
    setCurrentPlayer(0);
    setScores([[], []]);
  }, [questionsPool]);

  const answerQuestion = useCallback((optionId: string) => {
    const score = OPTION_SCORES[optionId] ?? 0;
    setScores(prev => {
      const newScores: [number[], number[]] = [[...prev[0]], [...prev[1]]];
      newScores[currentPlayer].push(score);
      return newScores;
    });
    if (currentPlayer === 0) {
      setCurrentPlayer(1);
    } else if (currentQuestion < QUESTIONS_PER_SESSION - 1) {
      setCurrentQuestion(prev => prev + 1);
      setCurrentPlayer(0);
    } else {
      setPhase('results');
    }
  }, [currentPlayer, currentQuestion]);

  const restartWithNewQuestions = useCallback(() => {
    const selected = shuffleAndPick(questionsPool, QUESTIONS_PER_SESSION);
    setQuestions(selected);
    setPhase('playing');
    setCurrentQuestion(0);
    setCurrentPlayer(0);
    setScores([[], []]);
  }, [questionsPool]);

  const resetQuiz = useCallback(() => {
    setPhase('setup');
    setPlayersState(null);
    setQuestions([]);
    setCurrentQuestion(0);
    setCurrentPlayer(0);
    setScores([[], []]);
  }, []);

  return {
    phase, players, questions, currentQuestion, currentPlayer,
    totalQuestions: QUESTIONS_PER_SESSION, progress,
    scorePlayer1, scorePlayer2, totalScore,
    maxScorePerPlayer: MAX_SCORE_PER_PLAYER,
    maxTotalScore: MAX_SCORE_PER_PLAYER * 2,
    result, currentPlayerData, getPlayerColors,
    translatedCurrentQuestion,
    setPlayers, answerQuestion, restartWithNewQuestions, resetQuiz,
  };
}
