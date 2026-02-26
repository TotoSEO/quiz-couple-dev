import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import type { ToxicQuizQuestion as QuestionType } from '@/types/toxic-quiz';
import { ToxicQuizProgress } from './ToxicQuizProgress';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';

interface ToxicQuizQuestionProps {
  question: QuestionType;
  currentQuestionIndex: number;
  totalQuestions: number;
  progress: number;
  previousAnswer?: number;
  onAnswer: (points: number) => void;
  onPrevious: () => void;
  canGoBack: boolean;
}

export function ToxicQuizQuestion({
  question,
  currentQuestionIndex,
  totalQuestions,
  progress,
  previousAnswer,
  onAnswer,
  onPrevious,
  canGoBack,
}: ToxicQuizQuestionProps) {
  const { t } = useLanguage();

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      <ToxicQuizProgress
        currentQuestion={currentQuestionIndex + 1}
        totalQuestions={totalQuestions}
        progress={progress}
      />

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-foreground leading-relaxed md:text-2xl">
          {question.text}
        </h2>
      </div>

      <div className="space-y-3">
        {question.options.map((option, index) => {
          const isSelected = previousAnswer === option.points;
          const letter = String.fromCharCode(65 + index);

          return (
            <button
              key={option.id}
              onClick={() => onAnswer(option.points)}
              className={cn(
                "w-full rounded-xl border-2 p-4 text-left transition-all duration-200",
                "hover:border-primary hover:bg-primary/5",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                isSelected
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card"
              )}
              aria-label={`Option ${letter}: ${option.text}`}
            >
              <div className="flex items-start gap-3">
                <span className={cn(
                  "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}>
                  {letter}
                </span>
                <span className="pt-1 text-foreground">{option.text}</span>
              </div>
            </button>
          );
        })}
      </div>

      {canGoBack && (
        <div className="mt-8">
          <Button
            variant="ghost"
            onClick={onPrevious}
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            {t('quizGames:question.previousQuestion')}
          </Button>
        </div>
      )}
    </div>
  );
}