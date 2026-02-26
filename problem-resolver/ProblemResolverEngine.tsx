import { useEffect } from 'react';
import { useProblemResolver } from '@/hooks/useProblemResolver';
import { ContextForm } from './ContextForm';
import { StatementForm } from './StatementForm';
import { LoadingAnalysis } from './LoadingAnalysis';
import { ResultDisplay } from './ResultDisplay';
import { StepIndicator } from './StepIndicator';

export function ProblemResolverEngine() {
  const { state, setContextData, setPersonStatement, submitToAI } = useProblemResolver();

  // Soumettre automatiquement quand on passe à l'étape loading
  useEffect(() => {
    if (state.step === 'loading' && state.problemContext) {
      submitToAI();
    }
  }, [state.step, state.problemContext, submitToAI]);

  const currentPerson = state.problemContext?.persons[state.currentPersonIndex];
  const totalPersons = state.problemContext?.persons.length || 0;

  return (
    <div className="space-y-8">
      {/* Indicateur d'étapes */}
      <StepIndicator 
        currentStep={state.step} 
        hasContext={!!state.problemContext}
        currentPersonIndex={state.currentPersonIndex}
        totalPersons={totalPersons}
      />

      {/* Contenu dynamique selon l'étape */}
      <div className="glass-card p-6 md:p-8 rounded-2xl">
        {state.step === 'context' && (
          <ContextForm onSubmit={setContextData} />
        )}

        {state.step === 'statements' && currentPerson && (
          <StatementForm
            key={state.currentPersonIndex}
            person={currentPerson}
            personIndex={state.currentPersonIndex}
            totalPersons={totalPersons}
            onSubmit={(statement) => setPersonStatement(state.currentPersonIndex, statement)}
          />
        )}

        {state.step === 'loading' && <LoadingAnalysis />}

        {state.step === 'result' && (
          <ResultDisplay
            result={state.result}
            isRateLimited={state.isRateLimited}
            error={state.error}
          />
        )}
      </div>

      {/* Message d'erreur global */}
      {state.error && state.step === 'context' && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-center">
          {state.error}
        </div>
      )}
    </div>
  );
}
