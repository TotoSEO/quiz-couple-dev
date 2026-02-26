import { useFunnyQuiz } from '@/hooks/useFunnyQuiz';
import { FunnyPlayerSetup } from './FunnyPlayerSetup';
import { FunnyQuizProgress } from './FunnyQuizProgress';
import { FunnyQuizQuestion } from './FunnyQuizQuestion';
import { FunnyQuizResult } from './FunnyQuizResult';

export function FunnyQuizEngine() {
  const {
    phase,
    players,
    currentQuestionIndex,
    currentPlayerIndex,
    activePlayer,
    otherPlayer,
    currentQuestion,
    totalQuestions,
    progress,
    setPlayers,
    nextQuestion,
    restartWithNewQuestions,
    resetQuiz,
  } = useFunnyQuiz();

  if (phase === 'setup') {
    return <FunnyPlayerSetup onStart={setPlayers} />;
  }

  if (phase === 'results') {
    return (
      <FunnyQuizResult
        players={players}
        onRestartWithNewQuestions={restartWithNewQuestions}
        onReset={resetQuiz}
      />
    );
  }

  if (phase === 'playing' && currentQuestion) {
    return (
      <div className="space-y-8">
        <FunnyQuizProgress
          players={players}
          currentPlayerIndex={currentPlayerIndex}
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={totalQuestions}
          progress={progress}
        />
        <FunnyQuizQuestion
          question={currentQuestion}
          questionNumber={currentQuestionIndex + 1}
          activePlayer={activePlayer}
          otherPlayer={otherPlayer}
          currentPlayerIndex={currentPlayerIndex}
          onNext={nextQuestion}
        />
      </div>
    );
  }

  return null;
}
