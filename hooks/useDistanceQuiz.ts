import { useState, useCallback } from 'react';
import { DistanceQuizState, DistanceQuizQuestion, DistanceQuizPlayerResult } from '@/types/distance-quiz';
import { getRandomDistanceQuestions, getPlayerVerdict, getCoupleVerdict } from '@/data/quizzes/quiz-distance-questions';
import { tgd } from '@/utils/quiz-i18n';

const QUESTIONS_PER_GAME = 20;
const MAX_SCORE = QUESTIONS_PER_GAME * 2;

const initialState: DistanceQuizState = {
  phase: 'setup', players: [{ name: '' }, { name: '' }], questions: [],
  currentQuestionIndex: 0, currentPlayerIndex: 0, player1Score: 0, player2Score: 0,
};

export function useDistanceQuiz() {
  const [state, setState] = useState<DistanceQuizState>(initialState);

  const setPlayers = useCallback((player1Name: string, player2Name: string) => {
    const questions = getRandomDistanceQuestions(QUESTIONS_PER_GAME);
    setState({ phase: 'playing', players: [{ name: player1Name }, { name: player2Name }], questions, currentQuestionIndex: 0, currentPlayerIndex: 0, player1Score: 0, player2Score: 0 });
  }, []);

  const answerQuestion = useCallback((points: number) => {
    setState(prev => {
      const newP1 = prev.currentPlayerIndex === 0 ? prev.player1Score + points : prev.player1Score;
      const newP2 = prev.currentPlayerIndex === 1 ? prev.player2Score + points : prev.player2Score;
      if (prev.currentPlayerIndex === 0) return { ...prev, player1Score: newP1, currentPlayerIndex: 1 };
      const next = prev.currentQuestionIndex + 1;
      if (next >= QUESTIONS_PER_GAME) return { ...prev, player2Score: newP2, phase: 'results' };
      return { ...prev, player2Score: newP2, currentQuestionIndex: next, currentPlayerIndex: 0 };
    });
  }, []);

  const restartWithNewQuestions = useCallback(() => {
    const questions = getRandomDistanceQuestions(QUESTIONS_PER_GAME);
    setState(prev => ({ ...prev, phase: 'playing', questions, currentQuestionIndex: 0, currentPlayerIndex: 0, player1Score: 0, player2Score: 0 }));
  }, []);

  const resetQuiz = useCallback(() => { setState(initialState); }, []);

  const getCurrentQuestion = (): DistanceQuizQuestion | null => {
    if (state.phase !== 'playing' || state.currentQuestionIndex >= state.questions.length) return null;
    const q = state.questions[state.currentQuestionIndex];
    return {
      ...q,
      text: tgd(`distance.q${q.id}`, q.text),
      options: q.options.map(o => ({ ...o, text: tgd(`distance.q${q.id}${o.id}`, o.text) })),
    };
  };

  const getResults = (): { player1: DistanceQuizPlayerResult; player2: DistanceQuizPlayerResult; couple: { verdict: string; emoji: string } } | null => {
    if (state.phase !== 'results') return null;
    const p1v = getPlayerVerdict(state.player1Score, state.players[0].name);
    const p2v = getPlayerVerdict(state.player2Score, state.players[1].name);
    const avg = (state.player1Score + state.player2Score) / 2;
    const cv = getCoupleVerdict(avg);

    // Translate verdicts
    const pvKey = state.player1Score >= 32 ? 'h' : state.player1Score >= 24 ? 'm' : state.player1Score >= 16 ? 'l' : 'vl';
    const p2vKey = state.player2Score >= 32 ? 'h' : state.player2Score >= 24 ? 'm' : state.player2Score >= 16 ? 'l' : 'vl';
    const cvKey = avg >= 28 ? 'h' : avg >= 20 ? 'm' : avg >= 12 ? 'l' : 'vl';

    return {
      player1: { name: state.players[0].name, score: state.player1Score, maxScore: MAX_SCORE, verdict: tgd(`distance.pv_${pvKey}`, p1v.verdict).replace('{{name}}', state.players[0].name), emoji: p1v.emoji },
      player2: { name: state.players[1].name, score: state.player2Score, maxScore: MAX_SCORE, verdict: tgd(`distance.pv_${p2vKey}`, p2v.verdict).replace('{{name}}', state.players[1].name), emoji: p2v.emoji },
      couple: { verdict: tgd(`distance.cv_${cvKey}`, cv.verdict), emoji: cv.emoji },
    };
  };

  const getActivePlayer = () => state.players[state.currentPlayerIndex];
  const getOtherPlayer = () => state.players[state.currentPlayerIndex === 0 ? 1 : 0];

  return {
    phase: state.phase, players: state.players, currentQuestionIndex: state.currentQuestionIndex,
    currentPlayerIndex: state.currentPlayerIndex, player1Score: state.player1Score,
    player2Score: state.player2Score, totalQuestions: QUESTIONS_PER_GAME, maxScore: MAX_SCORE,
    getCurrentQuestion, getActivePlayer, getOtherPlayer, getResults,
    setPlayers, answerQuestion, restartWithNewQuestions, resetQuiz,
  };
}
