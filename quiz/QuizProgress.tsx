import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/hooks/useLanguage';

interface QuizProgressProps {
  current: number;
  total: number;
  progress: number;
}

export function QuizProgress({ current, total, progress }: QuizProgressProps) {
  const { t } = useLanguage();

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {t('quizGames:question.questionXofY', { current: current + 1, total })}
        </span>
        <span className="font-medium text-primary">
          {Math.round(progress)}%
        </span>
      </div>
      <Progress 
        value={progress} 
        className="h-2"
        aria-label={`${Math.round(progress)}%`}
      />
      <p className="sr-only" aria-live="polite">
        {t('quizGames:question.questionXofY', { current: current + 1, total })}
      </p>
    </div>
  );
}
