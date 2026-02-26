import { useState, useCallback, useMemo } from 'react';
import type { DivorceQuizPhase, DivorceQuizState } from '@/types/divorce-quiz';
import { divorceQuizQuestions, getVerdict, TOTAL_QUESTIONS } from '@/data/quizzes/quiz-divorce-questions';
import { tgd } from '@/utils/quiz-i18n';
import { useTranslation } from 'react-i18next';

const initialState: DivorceQuizState = {
  phase: 'intro',
  currentQuestionIndex: 0,
  answers: [],
  totalScore: 0,
  hasChildren: false,
};

export function useDivorceQuiz() {
  const { i18n } = useTranslation();
  const [state, setState] = useState<DivorceQuizState>(initialState);

  const translatedQuestions = useMemo(() => {
    return divorceQuizQuestions.map((q) => {
      const qKey = `divorce.q${q.id}`;
      const optionLetters = ['a', 'b', 'c', 'd', 'e'];
      return {
        ...q,
        text: tgd(qKey, q.text),
        reassurance: q.reassurance ? tgd(`${qKey}_r`, q.reassurance) : undefined,
        options: q.options.map((opt, i) => ({
          ...opt,
          text: tgd(`${qKey}${optionLetters[i]}`, opt.text),
        })),
      };
    });
  }, [i18n.language]);

  const getEffectiveQuestions = useCallback((hasChildren: boolean) => {
    return translatedQuestions.filter(q => {
      if (q.conditionalOn) {
        return hasChildren;
      }
      return true;
    });
  }, [translatedQuestions]);

  const effectiveQuestions = getEffectiveQuestions(state.hasChildren);
  const totalEffective = effectiveQuestions.length;
  const currentQuestion = effectiveQuestions[state.currentQuestionIndex] || null;
  const progress = ((state.currentQuestionIndex + 1) / totalEffective) * 100;

  const translatedVerdict = useMemo(() => {
    if (state.phase !== 'results') return null;
    const v = getVerdict(state.totalScore);
    const levelMap: Record<string, string> = {
      difficult: 'v1',
      suffering: 'v2',
      separable: 'v3',
      priority: 'v4',
    };
    const vKey = levelMap[v.level] || 'v1';
    return {
      ...v,
      title: tgd(`divorce.${vKey}_t`, v.title),
      description: tgd(`divorce.${vKey}_d`, v.description),
    };
  }, [state.phase, state.totalScore, i18n.language]);

  const startQuiz = useCallback(() => {
    setState({ ...initialState, phase: 'playing' });
  }, []);

  const answerQuestion = useCallback((points: number, optionId?: string) => {
    setState((prev) => {
      const effectiveQs = getEffectiveQuestions(prev.hasChildren);
      const currentQ = effectiveQs[prev.currentQuestionIndex];
      
      let newHasChildren = prev.hasChildren;
      if (currentQ && currentQ.id === 10 && optionId === 'b') {
        newHasChildren = true;
      } else if (currentQ && currentQ.id === 10 && optionId !== 'b') {
        newHasChildren = false;
      }

      const newAnswers = [...prev.answers];
      newAnswers[prev.currentQuestionIndex] = points;
      const newTotalScore = newAnswers.reduce((sum, p) => sum + (p || 0), 0);

      const updatedEffective = getEffectiveQuestions(newHasChildren);
      
      if (prev.currentQuestionIndex >= updatedEffective.length - 1) {
        return { ...prev, answers: newAnswers, totalScore: newTotalScore, phase: 'results' as DivorceQuizPhase, hasChildren: newHasChildren };
      }
      return { ...prev, answers: newAnswers, totalScore: newTotalScore, currentQuestionIndex: prev.currentQuestionIndex + 1, hasChildren: newHasChildren };
    });
  }, [getEffectiveQuestions]);

  const skipQuestion = useCallback(() => {
    answerQuestion(0);
  }, [answerQuestion]);

  const goToPreviousQuestion = useCallback(() => {
    setState((prev) => {
      if (prev.currentQuestionIndex === 0) return prev;
      return { ...prev, currentQuestionIndex: prev.currentQuestionIndex - 1 };
    });
  }, []);

  const resetQuiz = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    phase: state.phase,
    currentQuestionIndex: state.currentQuestionIndex,
    currentQuestion,
    totalScore: state.totalScore,
    answers: state.answers,
    progress,
    verdict: translatedVerdict,
    totalQuestions: totalEffective,
    startQuiz,
    answerQuestion,
    skipQuestion,
    goToPreviousQuestion,
    resetQuiz,
  };
}
