import { Progress } from '@/components/ui/progress';
import { Star } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface KnowledgeQuizProgressProps {
  currentRound: number;
  totalRounds: number;
  player1Name: string;
  player2Name: string;
  scores: [number, number];
}

export function KnowledgeQuizProgress({
  currentRound,
  totalRounds,
  player1Name,
  player2Name,
  scores,
}: KnowledgeQuizProgressProps) {
  const { t } = useLanguage();
  const progress = ((currentRound + 1) / totalRounds) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">
          {t('quizGames:question.questionXofY', { current: currentRound + 1, total: totalRounds })}
        </span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="font-medium text-amber-600 dark:text-amber-400">
              {player1Name}:
            </span>
            <span className="font-bold">{scores[0]}</span>
            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium text-orange-600 dark:text-orange-400">
              {player2Name}:
            </span>
            <span className="font-bold">{scores[1]}</span>
            <Star className="h-3 w-3 text-orange-500 fill-orange-500" />
          </div>
        </div>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}