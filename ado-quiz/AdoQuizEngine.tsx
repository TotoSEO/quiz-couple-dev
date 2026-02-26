import { useAdoQuiz } from '@/hooks/useAdoQuiz';
import { AdoPlayerSetup } from './AdoPlayerSetup';
import { AdoWaitingRoom } from './AdoWaitingRoom';
import { AdoQuizQuestion } from './AdoQuizQuestion';
import { AdoQuizResult } from './AdoQuizResult';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function AdoQuizEngine() {
  const {
    phase, session, playerNumber, currentQuestionIndex, currentQuestionId,
    myAnswers, otherAnswerCount, error, loading, results,
    myName, otherName, isWaitingForOther, isWaitingForOtherAnswer,
    createSession, joinSession, answerQuestion, resetQuiz,
  } = useAdoQuiz();
  const { t } = useTranslation('quiz-ado');

  if (phase === 'setup') {
    return (
      <AdoPlayerSetup
        onCreateSession={createSession}
        onJoinSession={joinSession}
        error={error}
        loading={loading}
      />
    );
  }

  if (phase === 'waiting' && session) {
    return (
      <AdoWaitingRoom
        code={session.code}
        onCancel={resetQuiz}
      />
    );
  }

  if (phase === 'playing' && session) {
    // Waiting for partner to finish all questions
    if (isWaitingForOther) {
      return (
        <div className="glass-card p-8 text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <h3 className="text-xl font-bold">{t('ui.waitingForOtherDone', { name: otherName })}</h3>
          <p className="text-muted-foreground">{t('ui.youFinished')}</p>
          <div className="flex gap-2 justify-center text-sm text-muted-foreground">
            <span>{myName}: 20/20 ✅</span>
            <span>{otherName}: {otherAnswerCount}/20</span>
          </div>
        </div>
      );
    }

    // Waiting for partner to answer current question
    if (isWaitingForOtherAnswer) {
      return (
        <div className="glass-card p-8 text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-500" />
          <h3 className="text-xl font-bold">{t('ui.waitingForOtherAnswer', { name: otherName })}</h3>
          <p className="text-muted-foreground">{t('ui.waitingForOtherAnswerDesc')}</p>
          <div className="text-sm text-muted-foreground">
            {t('ui.questionProgress', { current: currentQuestionIndex + 1, total: 20 })}
          </div>
        </div>
      );
    }

    if (currentQuestionId) {
      return (
        <AdoQuizQuestion
          questionId={currentQuestionId}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={20}
          myName={myName || ''}
          otherName={otherName || ''}
          otherAnswerCount={otherAnswerCount}
          myAnswerCount={myAnswers.length}
          onAnswer={answerQuestion}
        />
      );
    }
  }

  if (phase === 'results' && results) {
    return (
      <AdoQuizResult
        results={results}
        onReset={resetQuiz}
      />
    );
  }

  return null;
}
