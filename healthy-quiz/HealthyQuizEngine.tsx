import { useHealthyQuiz } from '@/hooks/useHealthyQuiz';
import { DuoPlayerSetup } from '@/components/duo-quiz/DuoPlayerSetup';
import { DuoQuizProgress } from '@/components/duo-quiz/DuoQuizProgress';
import { DuoQuizQuestion } from '@/components/duo-quiz/DuoQuizQuestion';
import { HealthyQuizResult } from './HealthyQuizResult';
import { healthyQuizQuestions } from '@/data/quizzes/quiz-couple-sain-questions';
import { cn } from '@/lib/utils';

export function HealthyQuizEngine() {
  const {
    phase, players, currentQuestion, currentPlayer,
    totalQuestions, progress,
    scorePlayer1, scorePlayer2, totalScore,
    maxScorePerPlayer, maxTotalScore,
    result, currentPlayerData, getPlayerColors,
    translatedCurrentQuestion,
    setPlayers, answerQuestion, restartWithNewQuestions, resetQuiz,
  } = useHealthyQuiz(healthyQuizQuestions);

  const currentColors = players ? getPlayerColors(currentPlayer) : null;

  return (
    <div
      className={cn(
        'glass-card p-6 md:p-8 transition-all duration-500',
        phase === 'playing' && currentColors && `${currentColors.glow} shadow-lg`
      )}
    >
      {phase === 'setup' && (
        <DuoPlayerSetup onStart={setPlayers} />
      )}

      {phase === 'playing' && players && currentPlayerData && currentColors && translatedCurrentQuestion && (
        <div className="space-y-8">
          <DuoQuizProgress
            players={players}
            currentPlayer={currentPlayer}
            currentQuestion={currentQuestion}
            totalQuestions={totalQuestions}
            progress={progress}
            getPlayerColors={getPlayerColors}
          />
          <DuoQuizQuestion
            question={translatedCurrentQuestion}
            player={currentPlayerData}
            colors={currentColors}
            onAnswer={answerQuestion}
          />
        </div>
      )}

      {phase === 'results' && players && result && (
        <HealthyQuizResult
          players={players}
          scorePlayer1={scorePlayer1}
          scorePlayer2={scorePlayer2}
          totalScore={totalScore}
          maxScorePerPlayer={maxScorePerPlayer}
          maxTotalScore={maxTotalScore}
          result={result}
          getPlayerColors={getPlayerColors}
          onRestartNewQuestions={restartWithNewQuestions}
          onRestart={resetQuiz}
        />
      )}
    </div>
  );
}
