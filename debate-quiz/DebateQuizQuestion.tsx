import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import type { DebateQuizQuestion as QuestionType } from '@/types/debate-quiz';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';

interface DebateQuizQuestionProps {
  question: QuestionType;
  previousScore?: number;
  onAnswer: (score: number) => void;
  onPrevious: () => void;
  canGoPrevious: boolean;
}

export function DebateQuizQuestion({
  question,
  previousScore,
  onAnswer,
  onPrevious,
  canGoPrevious,
}: DebateQuizQuestionProps) {
  const { t } = useLanguage();
  const [selectedScore, setSelectedScore] = useState<number | null>(previousScore ?? null);
  const [isAnimating, setIsAnimating] = useState(false);

  const scoreLabels = [
    { score: 1, label: t('quizGames:question.stronglyDisagree'), emoji: '😔' },
    { score: 2, label: t('quizGames:question.disagree'), emoji: '😕' },
    { score: 3, label: t('quizGames:question.neutral'), emoji: '😐' },
    { score: 4, label: t('quizGames:question.agree'), emoji: '🙂' },
    { score: 5, label: t('quizGames:question.stronglyAgree'), emoji: '😍' },
  ];

  const handleSelect = (score: number) => {
    if (isAnimating) return;
    
    setSelectedScore(score);
    setIsAnimating(true);
    
    setTimeout(() => {
      onAnswer(score);
      setSelectedScore(null);
      setIsAnimating(false);
    }, 400);
  };

  return (
    <div className="space-y-8">
      {canGoPrevious && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrevious}
          className="text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          {t('quizGames:question.previousQuestion')}
        </Button>
      )}
      
      <div className="text-center space-y-4">
        <p className="text-sm uppercase tracking-wider text-pink-600 dark:text-pink-400 font-medium">
          {t('quizGames:question.doYouAgree')}
        </p>
        <h2 className="text-xl md:text-2xl font-semibold leading-relaxed px-4">
          "{question.text}"
        </h2>
        <p className="text-sm text-muted-foreground">
          {t('quizGames:question.discussAndChoose')}
        </p>
      </div>

      <div className="space-y-3">
        {scoreLabels.map(({ score, label, emoji }) => (
          <button
            key={score}
            onClick={() => handleSelect(score)}
            disabled={isAnimating}
            className={cn(
              'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300',
              'hover:scale-[1.02] hover:shadow-md',
              selectedScore === score
                ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/30 scale-[1.02] shadow-md'
                : 'border-border bg-card hover:border-pink-300 dark:hover:border-pink-700',
              isAnimating && selectedScore === score && 'animate-pulse'
            )}
          >
            <div 
              className={cn(
                'flex items-center justify-center w-12 h-12 rounded-full text-2xl transition-transform',
                selectedScore === score && 'scale-110'
              )}
              style={{
                background: selectedScore === score 
                  ? 'linear-gradient(135deg, #ec4899, #f43f5e)' 
                  : 'hsl(var(--muted))',
              }}
            >
              {emoji}
            </div>
            <div className="flex-1 text-left">
              <span className="font-medium">{label}</span>
            </div>
            <div 
              className={cn(
                'flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg transition-all',
                selectedScore === score
                  ? 'bg-pink-500 text-white'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {score}
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-center gap-1">
        {scoreLabels.map(({ score }) => (
          <div
            key={score}
            className={cn(
              'w-2 h-2 rounded-full transition-all',
              selectedScore === score
                ? 'bg-pink-500 scale-125'
                : 'bg-muted'
            )}
          />
        ))}
      </div>
    </div>
  );
}