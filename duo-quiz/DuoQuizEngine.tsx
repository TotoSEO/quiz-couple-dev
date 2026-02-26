import { useDuoQuiz } from '@/hooks/useDuoQuiz';
import { DuoPlayerSetup } from './DuoPlayerSetup';
import { DuoQuizProgress } from './DuoQuizProgress';
import { DuoQuizQuestion } from './DuoQuizQuestion';
import { DuoQuizResult } from './DuoQuizResult';
import type { DuoQuiz } from '@/types/duo-quiz';
import { cn } from '@/lib/utils';

interface DuoQuizEngineProps {
  quiz: DuoQuiz;
}

export function DuoQuizEngine({ quiz }: DuoQuizEngineProps) {
  const {
    phase,
    players,
    currentQuestion,
    currentPlayer,
    progress,
    score,
    result,
    currentPlayerData,
    getPlayerColors,
    setPlayers,
    answerQuestion,
    resetQuiz,
  } = useDuoQuiz(quiz);

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

      {phase === 'playing' && players && currentPlayerData && currentColors && (
        <div className="space-y-8">
          <DuoQuizProgress
            players={players}
            currentPlayer={currentPlayer}
            currentQuestion={currentQuestion}
            totalQuestions={quiz.questions.length}
            progress={progress}
            getPlayerColors={getPlayerColors}
          />
          
          <DuoQuizQuestion
            question={quiz.questions[currentQuestion]}
            player={currentPlayerData}
            colors={currentColors}
            onAnswer={answerQuestion}
          />
        </div>
      )}

      {phase === 'results' && players && result && (
        <DuoQuizResult
          players={players}
          score={score}
          maxScore={quiz.questions.length}
          result={result}
          getPlayerColors={getPlayerColors}
          onRestart={resetQuiz}
        />
      )}
    </div>
  );
}
