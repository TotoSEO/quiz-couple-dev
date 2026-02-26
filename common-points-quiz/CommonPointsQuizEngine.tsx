import { useCommonPointsQuiz } from '@/hooks/useCommonPointsQuiz';
import { CommonPointsPlayerSetup } from './CommonPointsPlayerSetup';
import { CommonPointsProgress } from './CommonPointsProgress';
import { CommonPointsQuestion } from './CommonPointsQuestion';
import { CommonPointsResult } from './CommonPointsResult';
import { cn } from '@/lib/utils';

export function CommonPointsQuizEngine() {
  const {
    phase,
    players,
    currentQuestion,
    currentPlayer,
    progress,
    totalQuestions,
    score,
    result,
    currentPlayerData,
    currentQuestionData,
    setPlayers,
    answerQuestion,
    resetQuiz,
    restartWithNewQuestions,
  } = useCommonPointsQuiz();

  const currentGlow = currentPlayer === 0 
    ? 'shadow-pink-500/40' 
    : 'shadow-blue-500/40';

  return (
    <div 
      className={cn(
        'glass-card p-6 md:p-8 transition-all duration-500',
        phase === 'playing' && `${currentGlow} shadow-lg`
      )}
    >
      {phase === 'setup' && (
        <CommonPointsPlayerSetup onStart={setPlayers} />
      )}

      {phase === 'playing' && players && currentPlayerData && currentQuestionData && (
        <div className="space-y-8">
          <CommonPointsProgress
            players={players}
            currentPlayer={currentPlayer}
            currentQuestion={currentQuestion}
            totalQuestions={totalQuestions}
            progress={progress}
          />
          
          <CommonPointsQuestion
            question={currentQuestionData}
            player={currentPlayerData}
            playerIndex={currentPlayer}
            onAnswer={answerQuestion}
          />
        </div>
      )}

      {phase === 'results' && players && result && (
        <CommonPointsResult
          players={players}
          score={score}
          maxScore={totalQuestions}
          result={result}
          onRestart={resetQuiz}
          onRestartNewQuestions={restartWithNewQuestions}
        />
      )}
    </div>
  );
}
