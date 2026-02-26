import { Button } from '@/components/ui/button';
import { RefreshCw, Phone } from 'lucide-react';
import type { DivorceQuizVerdict } from '@/types/divorce-quiz';
import { MAX_SCORE } from '@/data/quizzes/quiz-divorce-questions';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';

interface DivorceQuizResultProps {
  totalScore: number;
  verdict: DivorceQuizVerdict;
  onReset: () => void;
}

export function DivorceQuizResult({ totalScore, verdict, onReset }: DivorceQuizResultProps) {
  const { t } = useLanguage();
  const colorClasses: Record<string, { bg: string; border: string; text: string }> = {
    amber: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-600 dark:text-amber-400',
    },
    orange: {
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/30',
      text: 'text-orange-600 dark:text-orange-400',
    },
    rose: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      text: 'text-rose-600 dark:text-rose-400',
    },
    red: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-600 dark:text-red-400',
    },
  };

  const colors = colorClasses[verdict.color] || colorClasses.amber;

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      {/* Score Card */}
      <div className={cn(
        "mb-8 rounded-2xl border-2 p-8 text-center",
        colors.bg,
        colors.border
      )}>
        <div className="mb-4 text-5xl">{verdict.emoji}</div>

        <div className="mb-2 text-lg text-muted-foreground">
          {t('quiz-divorce:quiz.yourScore')}
        </div>

        <div className={cn("mb-4 text-4xl font-bold", colors.text)}>
          {totalScore} pts
        </div>

        <h2 className={cn("text-2xl font-semibold", colors.text)}>
          {verdict.title}
        </h2>
      </div>

      {/* Description */}
      <div className="mb-8 rounded-xl border border-border bg-card p-6">
        <p className="text-foreground leading-relaxed">
          {verdict.description}
        </p>
      </div>

      {/* Interpretation Table */}
      <div className="mb-8 overflow-hidden rounded-xl border border-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">{t('quiz-divorce:quiz.yourScore')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">{t('quiz-divorce:quiz.interpretation')}</th>
            </tr>
          </thead>
          <tbody>
            <tr className={cn("border-b border-border", verdict.level === 'difficult' && "bg-amber-500/10")}>
              <td className="px-4 py-3 text-sm text-muted-foreground">0 – 25</td>
              <td className="px-4 py-3 text-sm font-medium text-amber-600 dark:text-amber-400">{t('quiz-divorce:quiz.difficultPeriod')}</td>
            </tr>
            <tr className={cn("border-b border-border", verdict.level === 'suffering' && "bg-orange-500/10")}>
              <td className="px-4 py-3 text-sm text-muted-foreground">26 – 50</td>
              <td className="px-4 py-3 text-sm font-medium text-orange-600 dark:text-orange-400">{t('quiz-divorce:quiz.realSuffering')}</td>
            </tr>
            <tr className={cn("border-b border-border", verdict.level === 'separable' && "bg-rose-500/10")}>
              <td className="px-4 py-3 text-sm text-muted-foreground">51 – 75</td>
              <td className="px-4 py-3 text-sm font-medium text-rose-600 dark:text-rose-400">{t('quiz-divorce:quiz.separationConsiderable')}</td>
            </tr>
            <tr className={cn(verdict.level === 'priority' && "bg-red-500/10")}>
              <td className="px-4 py-3 text-sm text-muted-foreground">76+</td>
              <td className="px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400">{t('quiz-divorce:quiz.wellbeingPriority')}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Emergency notice */}
      <div className="mb-8 rounded-xl border border-border bg-muted/30 p-6">
        <div className="flex items-start gap-3">
          <Phone className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: t('quizzes:testDivorce.emergencyResult') }} />
        </div>
      </div>

      {/* Important Notice */}
      <div className="mb-8 rounded-xl border border-border bg-muted/30 p-6">
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">{t('quiz-divorce:quiz.importantReminder')}</strong> {t('quiz-divorce:quiz.reminderText')}
        </p>
      </div>

      {/* Reset Button */}
      <div className="text-center">
        <Button
          variant="outline"
          onClick={onReset}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          {t('quiz-divorce:quiz.redoTest')}
        </Button>
      </div>
    </div>
  );
}
