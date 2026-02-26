import { cn } from '@/lib/utils';
import type { DuoPlayer, PlayerColors } from '@/types/duo-quiz';
import { PlayerIndicator } from './PlayerIndicator';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/hooks/useLanguage';

interface DuoQuizProgressProps {
  players: [DuoPlayer, DuoPlayer];
  currentPlayer: 0 | 1;
  currentQuestion: number;
  totalQuestions: number;
  progress: number;
  getPlayerColors: (index: 0 | 1) => PlayerColors;
}

export function DuoQuizProgress({
  players,
  currentPlayer,
  currentQuestion,
  totalQuestions,
  progress,
  getPlayerColors,
}: DuoQuizProgressProps) {
  const { t } = useLanguage();
  const currentColors = getPlayerColors(currentPlayer);

  return (
    <div className="space-y-4">
      {/* Player Indicators */}
      <div className="flex items-center justify-between">
        <PlayerIndicator
          player={players[0]}
          colors={getPlayerColors(0)}
          isActive={currentPlayer === 0}
          size="md"
        />
        
        <div className="flex-1 mx-4 text-center">
          <div className="text-sm text-muted-foreground mb-1">
            {t('quizGames:question.questionXofY', { current: currentQuestion + 1, total: totalQuestions })}
          </div>
          <div 
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-500',
              currentColors.bg,
              currentColors.text,
              'shadow-lg',
              currentColors.glow
            )}
            key={`${currentPlayer}-${currentQuestion}`}
          >
            <span className="animate-pulse">👉</span>
            {t('quizGames:question.itsTurnOf')} {players[currentPlayer].name} !
          </div>
        </div>

        <PlayerIndicator
          player={players[1]}
          colors={getPlayerColors(1)}
          isActive={currentPlayer === 1}
          size="md"
        />
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <Progress 
          value={progress} 
          className="h-3 rounded-full"
        />
        <div 
          className={cn(
            'absolute inset-0 h-3 rounded-full opacity-30 transition-all duration-500',
            `bg-gradient-to-r ${currentColors.gradient}`
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <p className="text-center text-sm text-muted-foreground">
        {progress}% {t('quizGames:question.completed')}
      </p>
    </div>
  );
}