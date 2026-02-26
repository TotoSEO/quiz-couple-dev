import { Progress } from '@/components/ui/progress';
import type { CommonPointsPlayer } from '@/types/common-points-quiz';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';

interface CommonPointsProgressProps {
  players: [CommonPointsPlayer, CommonPointsPlayer];
  currentPlayer: 0 | 1;
  currentQuestion: number;
  totalQuestions: number;
  progress: number;
}

export function CommonPointsProgress({
  players,
  currentPlayer,
  currentQuestion,
  totalQuestions,
  progress,
}: CommonPointsProgressProps) {
  const { t } = useLanguage();
  const player1Colors = 'bg-pink-500 text-white';
  const player2Colors = 'bg-blue-500 text-white';

  return (
    <div className="space-y-4">
      {/* Player indicator with names */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div 
            className={cn(
              'px-3 py-1 rounded-full text-sm font-medium transition-all duration-300',
              currentPlayer === 0 
                ? `${player1Colors} scale-110 shadow-lg` 
                : 'bg-muted text-muted-foreground'
            )}
          >
            {players[0].name}
          </div>
          <div 
            className={cn(
              'px-3 py-1 rounded-full text-sm font-medium transition-all duration-300',
              currentPlayer === 1 
                ? `${player2Colors} scale-110 shadow-lg` 
                : 'bg-muted text-muted-foreground'
            )}
          >
            {players[1].name}
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          {t('quizGames:question.questionXofY', { current: currentQuestion + 1, total: totalQuestions })}
        </div>
      </div>

      {/* Progress bar */}
      <Progress value={progress} className="h-2" />
    </div>
  );
}