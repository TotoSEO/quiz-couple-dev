import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ScoreGaugeProps {
  score: number;
  label: string;
  icon: React.ReactNode;
  color?: 'primary' | 'secondary' | 'warning' | 'success';
  description?: string;
}

const colorClasses = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  warning: 'bg-amber-500',
  success: 'bg-emerald-500',
};

export function ScoreGauge({ 
  score, 
  label, 
  icon, 
  color = 'primary',
  description 
}: ScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setAnimatedScore(score);
    }, 300);
    return () => clearTimeout(timeout);
  }, [score]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-semibold">{label}</span>
        </div>
        <span className="text-2xl font-bold">{score}/100</span>
      </div>
      
      <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-1000 ease-out',
            colorClasses[color]
          )}
          style={{ width: `${animatedScore}%` }}
        />
      </div>
      
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
