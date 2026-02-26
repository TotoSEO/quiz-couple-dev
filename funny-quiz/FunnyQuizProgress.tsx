import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { FunnyQuizPlayer } from '@/types/funny-quiz';
import { useLanguage } from '@/hooks/useLanguage';

interface FunnyQuizProgressProps {
  players: [FunnyQuizPlayer, FunnyQuizPlayer];
  currentPlayerIndex: number;
  currentQuestionIndex: number;
  totalQuestions: number;
  progress: number;
}

export function FunnyQuizProgress({
  players,
  currentPlayerIndex,
  currentQuestionIndex,
  totalQuestions,
  progress,
}: FunnyQuizProgressProps) {
  const { t } = useLanguage();

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Player indicators */}
      <div className="flex justify-center gap-4">
        {players.map((player, index) => (
          <div
            key={index}
            className={cn(
              "px-4 py-2 rounded-full font-medium transition-all duration-300",
              currentPlayerIndex === index
                ? "bg-primary text-primary-foreground scale-110 shadow-lg"
                : "bg-muted text-muted-foreground"
            )}
          >
            {player.name}
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{t('quizGames:question.questionXofY', { current: currentQuestionIndex + 1, total: totalQuestions })}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    </div>
  );
}