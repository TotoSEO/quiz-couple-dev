import { cn } from '@/lib/utils';
import type { DuoPlayer, PlayerColors } from '@/types/duo-quiz';
import { User } from 'lucide-react';

interface PlayerIndicatorProps {
  player: DuoPlayer;
  colors: PlayerColors;
  isActive?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function PlayerIndicator({ 
  player, 
  colors, 
  isActive = false,
  size = 'md' 
}: PlayerIndicatorProps) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-12 w-12 text-sm',
    lg: 'h-16 w-16 text-base',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-7 w-7',
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={cn(
          'rounded-full flex items-center justify-center transition-all duration-300',
          sizeClasses[size],
          colors.bg,
          colors.text,
          isActive && 'ring-4 ring-offset-2 ring-offset-background animate-pulse-soft',
          isActive && colors.border.replace('border-', 'ring-'),
          isActive && `shadow-lg ${colors.glow}`
        )}
      >
        <User className={iconSizes[size]} />
      </div>
      <span 
        className={cn(
          'font-medium truncate max-w-[100px]',
          size === 'sm' && 'text-xs',
          size === 'md' && 'text-sm',
          size === 'lg' && 'text-base',
          isActive ? 'text-foreground' : 'text-muted-foreground'
        )}
      >
        {player.name}
      </span>
    </div>
  );
}
