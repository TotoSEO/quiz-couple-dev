import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6'
};

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange,
  className
}: StarRatingProps) {
  const stars = Array.from({ length: maxRating }, (_, i) => i + 1);

  return (
    <div className={cn('flex gap-1', className)}>
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange?.(star)}
          className={cn(
            'transition-transform',
            interactive && 'cursor-pointer hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary rounded',
            !interactive && 'cursor-default'
          )}
          aria-label={`${star} étoile${star > 1 ? 's' : ''}`}
        >
          <Star
            className={cn(
              sizeClasses[size],
              'transition-colors',
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-muted text-muted-foreground/30'
            )}
          />
        </button>
      ))}
    </div>
  );
}
