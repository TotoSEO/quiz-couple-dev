import { useDebateQuiz } from '@/hooks/useDebateQuiz';
import { DebatePlayerSetup } from './DebatePlayerSetup';
import { DebateQuizProgress } from './DebateQuizProgress';
import { DebateQuizQuestion } from './DebateQuizQuestion';
import { DebateQuizResult } from './DebateQuizResult';
import type { DebateQuiz } from '@/types/debate-quiz';

interface DebateQuizEngineProps {
  quiz: DebateQuiz;
}

export function DebateQuizEngine({ quiz }: DebateQuizEngineProps) {
  const {
    phase,
    players,
    currentQuestion,
    scores,
    totalQuestions,
    progress,
    totalScore,
    percentageScore,
    result,
    setPlayers,
    answerQuestion,
    goToPreviousQuestion,
    resetQuiz,
  } = useDebateQuiz(quiz);

  const currentQuestionData = quiz.questions[currentQuestion];

  return (
    <div className="glass-card p-6 md:p-8 transition-all duration-500">
      {phase === 'setup' && (
        <DebatePlayerSetup onStart={setPlayers} />
      )}

      {phase === 'playing' && players && currentQuestionData && (
        <div className="space-y-8">
          <DebateQuizProgress
            players={players}
            currentQuestion={currentQuestion}
            totalQuestions={totalQuestions}
            progress={progress}
            category={currentQuestionData.category}
          />
          
          <DebateQuizQuestion
            question={currentQuestionData}
            previousScore={scores[currentQuestion]}
            onAnswer={answerQuestion}
            onPrevious={goToPreviousQuestion}
            canGoPrevious={currentQuestion > 0}
          />
        </div>
      )}

      {phase === 'results' && players && result && (
        <DebateQuizResult
          players={players}
          totalScore={totalScore}
          percentageScore={percentageScore}
          result={result}
          onRestart={resetQuiz}
        />
      )}
    </div>
  );
}
