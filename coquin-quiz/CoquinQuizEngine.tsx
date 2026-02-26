import { useCoquinQuiz } from '@/hooks/useCoquinQuiz';
import { coquinQuestions } from '@/data/quizzes/quiz-coquin-questions';
import { CoquinPlayerSetup } from './CoquinPlayerSetup';
import { CoquinQuizGuess } from './CoquinQuizGuess';
import { CoquinQuizReveal } from './CoquinQuizReveal';
import { CoquinQuizFeedback } from './CoquinQuizFeedback';
import { CoquinQuizResult } from './CoquinQuizResult';

export const CoquinQuizEngine = () => {
  const {
    phase,
    players,
    currentRoundIndex,
    currentRound,
    currentQuestion,
    progress,
    totalRounds,
    score,
    maxScore,
    result,
    guessingPlayerName,
    targetPlayerName,
    setPlayers,
    submitGuess,
    submitReveal,
    nextRound,
    resetQuiz,
    restartWithNewQuestions,
  } = useCoquinQuiz(coquinQuestions);

  if (phase === 'setup') {
    return <CoquinPlayerSetup onStart={setPlayers} />;
  }

  if (phase === 'guessing' && currentQuestion && players) {
    return (
      <CoquinQuizGuess
        key={`guess-${currentRoundIndex}`}
        question={currentQuestion}
        roundIndex={currentRoundIndex}
        totalRounds={totalRounds}
        progress={progress}
        guessingPlayerName={guessingPlayerName}
        targetPlayerName={targetPlayerName}
        onGuess={submitGuess}
      />
    );
  }

  if (phase === 'revealing' && currentQuestion && currentRound && players) {
    return (
      <CoquinQuizReveal
        key={`reveal-${currentRoundIndex}`}
        question={currentQuestion}
        targetPlayerName={targetPlayerName}
        guessingPlayerName={guessingPlayerName}
        guessedOptionId={currentRound.guessedOptionId!}
        onReveal={submitReveal}
      />
    );
  }

  if (phase === 'feedback' && currentQuestion && currentRound && players) {
    return (
      <CoquinQuizFeedback
        key={`feedback-${currentRoundIndex}`}
        question={currentQuestion}
        guessingPlayerName={guessingPlayerName}
        targetPlayerName={targetPlayerName}
        guessedOptionId={currentRound.guessedOptionId!}
        actualOptionId={currentRound.actualOptionId!}
        isCorrect={currentRound.isCorrect!}
        currentScore={score}
        currentRound={currentRoundIndex}
        onNext={nextRound}
      />
    );
  }

  if (phase === 'results' && players && result) {
    return (
      <CoquinQuizResult
        players={players}
        score={score}
        maxScore={maxScore}
        result={result}
        onRestart={resetQuiz}
        onRestartWithNewQuestions={restartWithNewQuestions}
      />
    );
  }

  return null;
};
