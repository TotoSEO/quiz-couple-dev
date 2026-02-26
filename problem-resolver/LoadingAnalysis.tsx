import { Brain, Sparkles } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export function LoadingAnalysis() {
  const { t } = useLanguage();

  return (
    <div className="text-center space-y-8 py-12 animate-fade-in">
      <div className="relative inline-flex">
        <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center animate-pulse-soft">
          <Brain className="h-12 w-12 text-primary" />
        </div>
        <div className="absolute -top-2 -right-2">
          <Sparkles className="h-8 w-8 text-amber-500 animate-spark" />
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-2xl font-bold">{t('quizGames:problemResolver.aiAnalyzing')}</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          {t('quizGames:problemResolver.aiExamining')}
        </p>
      </div>

      <div className="flex justify-center gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-full bg-primary animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
}