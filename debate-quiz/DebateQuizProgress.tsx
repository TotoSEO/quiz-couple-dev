import { Progress } from '@/components/ui/progress';
import type { DebatePlayers } from '@/types/debate-quiz';
import { useLanguage } from '@/hooks/useLanguage';

interface DebateQuizProgressProps {
  players: DebatePlayers;
  currentQuestion: number;
  totalQuestions: number;
  progress: number;
  category: string;
}

export function DebateQuizProgress({
  players,
  currentQuestion,
  totalQuestions,
  progress,
  category,
}: DebateQuizProgressProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">💕</span>
          <span className="font-medium">
            {players.player1.name} & {players.player2.name}
          </span>
        </div>
        <span className="text-sm font-medium px-3 py-1 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300">
          {category}
        </span>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {t('quizGames:question.questionXofY', { current: currentQuestion + 1, total: totalQuestions })}
          </span>
          <span className="font-medium text-pink-600 dark:text-pink-400">
            {Math.round(progress)}%
          </span>
        </div>
        <Progress 
          value={progress} 
          className="h-2 bg-pink-100 dark:bg-pink-900/30 [&>div]:bg-gradient-to-r [&>div]:from-pink-500 [&>div]:to-rose-500"
        />
      </div>
    </div>
  );
}