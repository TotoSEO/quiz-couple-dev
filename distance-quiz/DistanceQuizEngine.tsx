import { useDistanceQuiz } from '@/hooks/useDistanceQuiz';
import { DistancePlayerSetup } from './DistancePlayerSetup';
import { DistanceQuizProgress } from './DistanceQuizProgress';
import { DistanceQuizQuestion } from './DistanceQuizQuestion';
import { DistanceQuizResult } from './DistanceQuizResult';

export function DistanceQuizEngine() {
  const {
    phase,
    players,
    currentQuestionIndex,
    currentPlayerIndex,
    player1Score,
    player2Score,
    totalQuestions,
    getCurrentQuestion,
    getActivePlayer,
    getOtherPlayer,
    getResults,
    setPlayers,
    answerQuestion,
    restartWithNewQuestions,
    resetQuiz,
  } = useDistanceQuiz();

  if (phase === 'setup') {
    return <DistancePlayerSetup onStart={setPlayers} />;
  }

  if (phase === 'playing') {
    const question = getCurrentQuestion();
    if (!question) return null;

    return (
      <div className="w-full max-w-2xl mx-auto">
        <DistanceQuizProgress
          players={players}
          currentPlayerIndex={currentPlayerIndex}
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={totalQuestions}
          player1Score={player1Score}
          player2Score={player2Score}
        />
        <DistanceQuizQuestion
          question={question}
          activePlayer={getActivePlayer()}
          otherPlayer={getOtherPlayer()}
          currentPlayerIndex={currentPlayerIndex}
          onAnswer={answerQuestion}
        />
      </div>
    );
  }

  if (phase === 'results') {
    const results = getResults();
    if (!results) return null;

    return (
      <div className="w-full max-w-2xl mx-auto">
        <DistanceQuizResult
          player1Result={results.player1}
          player2Result={results.player2}
          coupleVerdict={results.couple}
          onRestartWithNewQuestions={restartWithNewQuestions}
          onReset={resetQuiz}
        />
      </div>
    );
  }

  return null;
}
