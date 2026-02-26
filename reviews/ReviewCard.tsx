import { StarRating } from './StarRating';
import type { Review } from '@/types/review';

interface ReviewCardProps {
  review: Review;
}

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaine${Math.floor(diffDays / 7) > 1 ? 's' : ''}`;
  if (diffDays < 365) return `Il y a ${Math.floor(diffDays / 30)} mois`;
  return `Il y a ${Math.floor(diffDays / 365)} an${Math.floor(diffDays / 365) > 1 ? 's' : ''}`;
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <article className="rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h4 className="font-semibold text-foreground">{review.author_name}</h4>
          <time 
            dateTime={review.created_at} 
            className="text-sm text-muted-foreground"
          >
            {getRelativeTime(review.created_at)}
          </time>
        </div>
        <StarRating rating={review.rating} size="sm" />
      </div>
      {review.comment && (
        <p className="text-muted-foreground text-sm leading-relaxed">
          "{review.comment}"
        </p>
      )}
    </article>
  );
}
