import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import type { ToxicQuizVerdict } from '@/types/toxic-quiz';
import { MAX_SCORE } from '@/data/quizzes/quiz-toxic-questions';
import { cn } from '@/lib/utils';
 import { useLanguage } from '@/hooks/useLanguage';

interface ToxicQuizResultProps {
  totalScore: number;
  verdict: ToxicQuizVerdict;
  onReset: () => void;
}

export function ToxicQuizResult({ totalScore, verdict, onReset }: ToxicQuizResultProps) {
   const { t } = useLanguage();
  const colorClasses = {
    emerald: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-600 dark:text-emerald-400',
    },
    amber: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-600 dark:text-amber-400',
    },
    rose: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      text: 'text-rose-600 dark:text-rose-400',
    },
  };

  const colors = colorClasses[verdict.color as keyof typeof colorClasses];

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
           {t('quizGames:toxic.yourScore')}
        </div>
        
        <div className={cn("mb-4 text-4xl font-bold", colors.text)}>
          {totalScore} / {MAX_SCORE}
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
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                 {t('quizGames:toxic.scoreTotal')}
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                 {t('quizGames:toxic.toxicityLevel')}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className={cn(
              "border-b border-border",
              verdict.level === 'healthy' && "bg-emerald-500/10"
            )}>
               <td className="px-4 py-3 text-sm text-muted-foreground">0-25 {t('quizGames:toxic.points')}</td>
              <td className="px-4 py-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                 {t('quizGames:toxic.healthy')}
              </td>
            </tr>
            <tr className={cn(
              "border-b border-border",
              verdict.level === 'dysfunctional' && "bg-amber-500/10"
            )}>
               <td className="px-4 py-3 text-sm text-muted-foreground">26-60 {t('quizGames:toxic.points')}</td>
              <td className="px-4 py-3 text-sm font-medium text-amber-600 dark:text-amber-400">
                 {t('quizGames:toxic.dysfunctional')}
              </td>
            </tr>
            <tr className={cn(
              verdict.level === 'toxic' && "bg-rose-500/10"
            )}>
               <td className="px-4 py-3 text-sm text-muted-foreground">61-125 {t('quizGames:toxic.points')}</td>
              <td className="px-4 py-3 text-sm font-medium text-rose-600 dark:text-rose-400">
                 {t('quizGames:toxic.highlyToxic')}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Important Notice */}
      <div className="mb-8 rounded-xl border border-border bg-muted/30 p-6">
        <p className="text-sm text-muted-foreground leading-relaxed">
           <strong className="text-foreground">{t('quizGames:toxic.importantReminder')}</strong> {t('quizGames:toxic.reminderText')}
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
           {t('quizGames:toxic.retakeTest')}
        </Button>
      </div>
    </div>
  );
}
