import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { FaultScore } from '@/types/problem-resolver';
import { useLanguage } from '@/hooks/useLanguage';

interface FaultDistributionProps {
  faultScores: FaultScore[];
}

const colors = [
  'bg-primary',
  'bg-secondary',
  'bg-amber-500',
  'bg-emerald-500',
];

export function FaultDistribution({ faultScores }: FaultDistributionProps) {
  const { t } = useLanguage();
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setAnimated(true), 500);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        ⚖️ {t('quizGames:problemResolver.responsibilityDistribution')}
      </h3>

      {/* Barre de répartition */}
      <div className="h-8 w-full rounded-full overflow-hidden flex bg-muted">
        {faultScores.map((fault, index) => (
          <div
            key={fault.name}
            className={cn(
              'h-full transition-all duration-1000 ease-out flex items-center justify-center',
              colors[index % colors.length]
            )}
            style={{ 
              width: animated ? `${fault.score}%` : '0%',
              transitionDelay: `${index * 100}ms`
            }}
          >
            {fault.score > 15 && (
              <span className="text-xs font-bold text-white">
                {fault.score}%
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Légende */}
      <div className="flex flex-wrap gap-4">
        {faultScores.map((fault, index) => (
          <div key={fault.name} className="flex items-center gap-2">
            <div 
              className={cn(
                'h-3 w-3 rounded-full',
                colors[index % colors.length]
              )} 
            />
            <span className="text-sm font-medium">{fault.name}</span>
            <span className="text-sm text-muted-foreground">({fault.score}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}