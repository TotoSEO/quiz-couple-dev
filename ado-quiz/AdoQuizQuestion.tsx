import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ADO_OPTIONS } from '@/data/quizzes/quiz-ado-questions';
import { useTranslation } from 'react-i18next';

interface Props {
  questionId: number;
  questionNumber: number;
  totalQuestions: number;
  myName: string;
  otherName: string;
  otherAnswerCount: number;
  myAnswerCount: number;
  onAnswer: (score: number) => void;
}

export function AdoQuizQuestion({
  questionId, questionNumber, totalQuestions,
  myName, otherName, otherAnswerCount, myAnswerCount,
  onAnswer,
}: Props) {
  const { t } = useTranslation('quiz-ado');
  const [selected, setSelected] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);

  const progress = (myAnswerCount / totalQuestions) * 100;
  const otherProgress = (otherAnswerCount / totalQuestions) * 100;

  const questionText = t(`q.${questionId}`, { name: otherName });

  const handleSelect = (score: number) => {
    if (animating) return;
    setSelected(score);
    setAnimating(true);
    setTimeout(() => {
      onAnswer(score);
      setSelected(null);
      setAnimating(false);
    }, 400);
  };

  return (
    <div className="glass-card p-6 md:p-8 space-y-6">
      {/* Progress bars */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{t('ui.questionOf', { current: questionNumber, total: totalQuestions })}</span>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs w-16 truncate font-medium">{myName}</span>
            <Progress value={progress} className="flex-1 h-2" />
            <span className="text-xs w-8 text-right">{myAnswerCount}/{totalQuestions}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs w-16 truncate text-muted-foreground">{otherName}</span>
            <Progress value={otherProgress} className="flex-1 h-2 opacity-50" />
            <span className="text-xs w-8 text-right text-muted-foreground">{otherAnswerCount}/{totalQuestions}</span>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="text-center py-4">
        <p className="text-lg md:text-xl font-semibold leading-relaxed">
          {questionText}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {ADO_OPTIONS.map((optId, index) => {
          const score = index + 1;
          const optionText = t(`q.${questionId}${optId}`, { name: otherName });
          const isSelected = selected === score;

          return (
            <button
              key={optId}
              onClick={() => handleSelect(score)}
              disabled={animating}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-500/10 scale-[0.98]'
                  : 'border-border hover:border-emerald-300 hover:bg-emerald-500/5'
              }`}
            >
              <span className="text-sm md:text-base">{optionText}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
