import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/hooks/useLanguage';

interface MostQuizProgressProps {
  currentQuestion: number;
  totalQuestions: number;
}

export function MostQuizProgress({
  currentQuestion,
  totalQuestions,
}: MostQuizProgressProps) {
  const { t } = useLanguage();
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-muted-foreground">
          {t('quizGames:question.questionXofY', { current: currentQuestion + 1, total: totalQuestions })}
        </span>
        <span className="text-sm font-medium text-primary">
          {Math.round(progress)}%
        </span>
      </div>
      <Progress value={progress} className="h-3" />
    </div>
  );
}
