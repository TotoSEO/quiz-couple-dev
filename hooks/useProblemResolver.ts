import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { 
  ResolverState, 
  ProblemContext, 
  AIAnalysisResult 
} from '@/types/problem-resolver';

const initialState: ResolverState = {
  step: 'context',
  problemContext: null,
  currentPersonIndex: 0,
  result: null,
  error: null,
  isRateLimited: false,
};

export function useProblemResolver() {
  const [state, setState] = useState<ResolverState>(initialState);

  const setContextData = useCallback((context: ProblemContext) => {
    setState(prev => ({
      ...prev,
      problemContext: context,
      currentPersonIndex: 0,
      step: 'statements',
    }));
  }, []);

  const setPersonStatement = useCallback((personIndex: number, statement: string) => {
    setState(prev => {
      if (!prev.problemContext) return prev;

      const updatedPersons = [...prev.problemContext.persons];
      updatedPersons[personIndex] = {
        ...updatedPersons[personIndex],
        statement,
      };

      const nextIndex = personIndex + 1;
      const allDone = nextIndex >= updatedPersons.length;

      return {
        ...prev,
        problemContext: {
          ...prev.problemContext,
          persons: updatedPersons,
        },
        currentPersonIndex: allDone ? personIndex : nextIndex,
        step: allDone ? 'loading' : 'statements',
      };
    });
  }, []);

  const submitToAI = useCallback(async () => {
    if (!state.problemContext) return;

    setState(prev => ({ ...prev, step: 'loading', error: null }));

    try {
      const { data, error } = await supabase.functions.invoke('resolve-couple-problem', {
        body: state.problemContext,
      });

      if (error) {
        throw new Error(error.message || 'Erreur lors de l\'analyse');
      }

      if (data.error) {
        if (data.rateLimited) {
          setState(prev => ({
            ...prev,
            step: 'result',
            isRateLimited: true,
            error: data.error,
          }));
          return;
        }
        throw new Error(data.error);
      }

      setState(prev => ({
        ...prev,
        step: 'result',
        result: data as AIAnalysisResult,
        isRateLimited: false,
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        step: 'context',
        error: err instanceof Error ? err.message : 'Une erreur est survenue',
      }));
    }
  }, [state.problemContext]);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    state,
    setContextData,
    setPersonStatement,
    submitToAI,
    reset,
  };
}
