import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Check, X, Trash2, Star } from 'lucide-react';
import type { Review } from '@/types/review';

interface AdminReviewCardProps {
  review: Review;
  onApprove: (id: string) => Promise<boolean>;
  onReject: (id: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export const AdminReviewCard = ({ review, onApprove, onReject, onDelete }: AdminReviewCardProps) => {
  const formattedDate = format(new Date(review.created_at), "d MMMM yyyy 'à' HH:mm", { locale: fr });

  return (
    <div className={`bg-card border rounded-xl p-4 ${review.is_approved ? 'border-green-500/30 bg-green-500/5' : 'border-amber-500/30 bg-amber-500/5'}`}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium">{review.author_name}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${review.is_approved ? 'bg-green-500/20 text-green-600' : 'bg-amber-500/20 text-amber-600'}`}>
              {review.is_approved ? 'Approuvé' : 'En attente'}
            </span>
          </div>
          <div className="flex items-center gap-1 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'}`}
              />
            ))}
          </div>
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formattedDate}
        </span>
      </div>

      {review.comment && (
        <p className="text-sm text-foreground/80 mb-3 whitespace-pre-wrap">
          {review.comment}
        </p>
      )}

      {review.ip_address && (
        <p className="text-xs text-muted-foreground mb-3">
          IP: {review.ip_address}
        </p>
      )}

      <div className="flex items-center gap-2 pt-3 border-t border-border">
        {!review.is_approved && (
          <Button
            size="sm"
            variant="outline"
            className="text-green-600 hover:bg-green-500/10 hover:text-green-600"
            onClick={() => onApprove(review.id)}
          >
            <Check className="w-4 h-4 mr-1" />
            Approuver
          </Button>
        )}
        
        {review.is_approved && (
          <Button
            size="sm"
            variant="outline"
            className="text-amber-600 hover:bg-amber-500/10 hover:text-amber-600"
            onClick={() => onReject(review.id)}
          >
            <X className="w-4 h-4 mr-1" />
            Retirer
          </Button>
        )}

        <Button
          size="sm"
          variant="outline"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive ml-auto"
          onClick={() => onDelete(review.id)}
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Supprimer
        </Button>
      </div>
    </div>
  );
};
