import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { getAdoResult } from '@/data/quizzes/quiz-ado-questions';

export type AdoPhase = 'setup' | 'waiting' | 'playing' | 'results';

interface SessionData {
  id: string;
  code: string;
  status: string;
  question_indices: number[];
  player1_name: string;
  player1_answers: number[];
  player2_name: string | null;
  player2_answers: number[];
}

export function useAdoQuiz() {
  const { t, i18n } = useTranslation('quiz-ado');
  const [phase, setPhase] = useState<AdoPhase>('setup');
  const [session, setSession] = useState<SessionData | null>(null);
  const [playerNumber, setPlayerNumber] = useState<1 | 2>(1);
  const [myAnswers, setMyAnswers] = useState<number[]>([]);
  const [otherAnswerCount, setOtherAnswerCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Auto-delete session 10s after results are shown
  useEffect(() => {
    if (phase !== 'results' || !session?.id) return;

    const timer = setTimeout(async () => {
      try {
        await supabase.functions.invoke('manage-ado-session', {
          body: { action: 'cleanup', sessionId: session.id },
        });
      } catch {
        // Silent cleanup
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [phase, session?.id]);

  // Subscribe to realtime updates on the session
  useEffect(() => {
    if (!session?.id) return;

    const channel = supabase
      .channel(`ado-${session.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'quiz_ado_sessions',
          filter: `id=eq.${session.id}`,
        },
        (payload) => {
          const newData = payload.new as SessionData;
          setSession(newData);

          // Player 2 joined — start quiz
          if (phase === 'waiting' && newData.status === 'active') {
            setPhase('playing');
          }

          // Track other player's progress
          const otherAnswers = playerNumber === 1 ? newData.player2_answers : newData.player1_answers;
          setOtherAnswerCount((otherAnswers || []).length);

          // Both done with all 20 questions
          const p1Done = (newData.player1_answers || []).length >= 20;
          const p2Done = (newData.player2_answers || []).length >= 20;
          if (p1Done && p2Done) {
            setPhase('results');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.id, phase, playerNumber]);

  const createSession = useCallback(async (playerName: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('manage-ado-session', {
        body: { action: 'create', playerName },
      });

      if (fnError) throw fnError;
      if (data?.error) {
        setError(data.error === 'rate_limit' ? t('ui.rateLimitError') : t('ui.genericError'));
        return;
      }

      setSession(data.session);
      setPlayerNumber(1);
      setPhase('waiting');
    } catch (err: any) {
      setError(err.message || t('ui.genericError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const joinSession = useCallback(async (playerName: string, code: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('manage-ado-session', {
        body: { action: 'join', playerName, code },
      });

      if (fnError) throw fnError;
      if (data?.error) {
        setError(data.error === 'session_not_found' ? t('ui.sessionNotFound') : t('ui.genericError'));
        return;
      }

      setSession(data.session);
      setPlayerNumber(2);
      setPhase('playing');
    } catch (err: any) {
      setError(err.message || t('ui.genericError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const answerQuestion = useCallback(async (score: number) => {
    if (!session?.id) return;

    const newAnswers = [...myAnswers, score];
    setMyAnswers(newAnswers);

    const field = playerNumber === 1 ? 'player1_answers' : 'player2_answers';

    await (supabase as any)
      .from('quiz_ado_sessions')
      .update({ [field]: newAnswers })
      .eq('id', session.id);

    // Check if both are done
    if (newAnswers.length >= 20 && otherAnswerCount >= 20) {
      setPhase('results');
    }
  }, [session?.id, myAnswers, playerNumber, otherAnswerCount]);

  const resetQuiz = useCallback(() => {
    setPhase('setup');
    setSession(null);
    setPlayerNumber(1);
    setMyAnswers([]);
    setOtherAnswerCount(0);
    setError(null);
  }, []);

  const results = useMemo(() => {
    if (!session || phase !== 'results') return null;

    const p1 = session.player1_answers || [];
    const p2 = session.player2_answers || [];
    const p1Score = p1.reduce((a, b) => a + b, 0);
    const p2Score = p2.reduce((a, b) => a + b, 0);
    const avgScore = Math.round((p1Score + p2Score) / 2);
    const resultData = getAdoResult(avgScore);

    return {
      player1: { name: session.player1_name, score: p1Score, answers: p1 },
      player2: { name: session.player2_name || '', score: p2Score, answers: p2 },
      avgScore,
      maxScore: 80,
      result: resultData,
      questionIds: session.question_indices,
    };
  }, [session, phase]);

  const myName = playerNumber === 1 ? session?.player1_name : session?.player2_name;
  const otherName = playerNumber === 1 ? session?.player2_name : session?.player1_name;

  // Synchronized question index: both must answer before moving on
  const sharedQuestionIndex = Math.min(myAnswers.length, otherAnswerCount);
  const currentQuestionId = session?.question_indices?.[sharedQuestionIndex];
  const isWaitingForOtherAnswer = myAnswers.length > otherAnswerCount && myAnswers.length < 20;
  const isWaitingForOther = myAnswers.length >= 20 && otherAnswerCount < 20;

  return {
    phase, session, playerNumber, currentQuestionIndex: sharedQuestionIndex, currentQuestionId,
    myAnswers, otherAnswerCount, error, loading, results,
    myName, otherName, isWaitingForOther, isWaitingForOtherAnswer,
    createSession, joinSession, answerQuestion, resetQuiz,
    lang: i18n.language,
  };
}
