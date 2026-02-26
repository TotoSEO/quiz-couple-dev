import { Button } from '@/components/ui/button';
import { ChevronLeft, HelpCircle, MessageCircle } from 'lucide-react';
import type { DivorceQuizQuestion as QuestionType } from '@/types/divorce-quiz';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';

interface DivorceQuizQuestionProps {
  question: QuestionType;
  currentQuestionIndex: number;
  totalQuestions: number;
  progress: number;
  previousAnswer?: number | null;
  onAnswer: (points: number, optionId?: string) => void;
  onSkip: () => void;
  onPrevious: () => void;
  canGoBack: boolean;
}

export function DivorceQuizQuestion({
  question,
  currentQuestionIndex,
  totalQuestions,
  progress,
  previousAnswer,
  onAnswer,
  onSkip,
  onPrevious,
  canGoBack,
}: DivorceQuizQuestionProps) {
  const { t } = useLanguage();

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      {/* Progress */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {t('quiz-divorce:quiz.questionOf', { current: currentQuestionIndex + 1, total: totalQuestions })}
          </span>
          <span className="font-medium text-foreground">
            {Math.round(progress)}%
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-foreground leading-relaxed md:text-2xl">
          {question.text}
        </h2>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((option, index) => {
          const isSelected = previousAnswer === option.points;
          const letter = String.fromCharCode(65 + index);

          return (
            <button
              key={option.id}
              onClick={() => onAnswer(option.points, option.id)}
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

      {/* Skip button */}
      {question.hasSkipButton && (
        <div className="mt-4 text-center">
          <Button
            variant="ghost"
            onClick={onSkip}
            className="text-muted-foreground hover:text-foreground gap-2"
          >
            <HelpCircle className="h-4 w-4" />
            {t('quiz-divorce:quiz.noAnswer')}
          </Button>
        </div>
      )}

      {/* Reassurance text */}
      {question.reassurance && (
        <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-5">
          <div className="flex items-start gap-3">
            <MessageCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              {question.reassurance}
            </p>
          </div>
        </div>
      )}

      {/* Back button */}
      {canGoBack && (
        <div className="mt-8">
          <Button
            variant="ghost"
            onClick={onPrevious}
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            {t('quiz-divorce:quiz.previousQuestion')}
          </Button>
        </div>
      )}
    </div>
  );
}
