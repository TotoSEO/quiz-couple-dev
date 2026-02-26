import { useMostQuiz } from '@/hooks/useMostQuiz';
import { MostPlayerSetup } from './MostPlayerSetup';
import { MostQuizProgress } from './MostQuizProgress';
import { MostQuizQuestion } from './MostQuizQuestion';
import { MostQuizTransition } from './MostQuizTransition';
import { MostQuizResult } from './MostQuizResult';

export function MostQuizEngine() {
  const {
    phase,
    players,
    currentQuestionIndex,
    totalQuestions,
    getCurrentQuestion,
    getResults,
    canStartGame,
    getPlayerLetter,
    addPlayer,
    removePlayer,
    updatePlayerName,
    startQuiz,
    answerQuestion,
    restartWithNewQuestions,
    restartWithNewPlayers,
  } = useMostQuiz();

  // Phase de setup
  if (phase === 'setup') {
    return (
      <MostPlayerSetup
        players={players}
        onAddPlayer={addPlayer}
        onRemovePlayer={removePlayer}
        onUpdatePlayerName={updatePlayerName}
        onStartQuiz={startQuiz}
        canStart={canStartGame()}
        getPlayerLetter={getPlayerLetter}
      />
    );
  }

  // Phase de transition
  if (phase === 'transition') {
    return <MostQuizTransition />;
  }

  // Phase de résultats
  if (phase === 'results') {
    return (
      <MostQuizResult
        results={getResults()}
        totalQuestions={totalQuestions}
        onRestartNewQuestions={restartWithNewQuestions}
        onRestartNewPlayers={restartWithNewPlayers}
      />
    );
  }

  // Phase de question
  const currentQuestion = getCurrentQuestion();
  if (!currentQuestion) return null;

  return (
    <div className="w-full">
      <MostQuizProgress
        currentQuestion={currentQuestionIndex}
        totalQuestions={totalQuestions}
      />
      <MostQuizQuestion
        question={currentQuestion}
        players={players}
        onAnswer={answerQuestion}
        getPlayerLetter={getPlayerLetter}
      />
    </div>
  );
}
