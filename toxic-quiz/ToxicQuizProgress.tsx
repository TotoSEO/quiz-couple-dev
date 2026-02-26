import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/hooks/useLanguage';

interface ToxicQuizProgressProps {
  currentQuestion: number;
  totalQuestions: number;
  progress: number;
}

export function ToxicQuizProgress({ 
  currentQuestion, 
  totalQuestions, 
  progress 
}: ToxicQuizProgressProps) {
  const { t } = useLanguage();

  return (
    <div className="mb-8">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {t('quizGames:question.questionXofY', { current: currentQuestion, total: totalQuestions })}
        </span>
        <span className="font-medium text-foreground">
          {Math.round(progress)}%
        </span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}