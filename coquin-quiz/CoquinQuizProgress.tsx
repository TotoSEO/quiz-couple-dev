import { Flame } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface CoquinQuizProgressProps {
  current: number;
  total: number;
  progress: number;
  guessingPlayerName?: string;
}

export const CoquinQuizProgress = ({ current, total, progress, guessingPlayerName }: CoquinQuizProgressProps) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-muted-foreground">
          <Flame className="w-4 h-4 text-coquin-primary animate-flame-flicker" />
          {t('quizGames:question.roundXofY', { current: current + 1, total })}
          {guessingPlayerName && (
            <span className="text-coquin-accent">• {guessingPlayerName}</span>
          )}
        </span>
        <span className="font-medium text-coquin-primary">{progress}%</span>
      </div>
      
      <div className="relative h-3 bg-muted/50 rounded-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-coquin-dark/20 via-coquin-primary/10 to-coquin-dark/20" />
        
        <div
          className="h-full bg-gradient-to-r from-coquin-primary via-coquin-accent to-coquin-primary rounded-full transition-all duration-500 ease-out relative overflow-hidden"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white/50 to-transparent" />
        </div>
        
        {Array.from({ length: 5 }).map((_, i) => {
          const position = ((i + 1) / 5) * 100;
          const isPassed = progress >= position;
          return (
            <div
              key={i}
              className={`absolute top-1/2 -translate-y-1/2 w-1 h-1 rounded-full transition-all duration-300 ${
                isPassed ? 'bg-white' : 'bg-muted-foreground/30'
              }`}
              style={{ left: `${position}%` }}
            />
          );
        })}
      </div>
    </div>
  );
};