import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from './StarRating';
import { Heart, CheckCircle, Loader2 } from 'lucide-react';
import type { CreateReviewData } from '@/types/review';
 import { useLanguage } from '@/hooks/useLanguage';

interface ReviewFormProps {
  onSubmit: (data: CreateReviewData) => Promise<void>;
  hasAlreadyReviewed: boolean;
  submitting: boolean;
}

export function ReviewForm({ onSubmit, hasAlreadyReviewed, submitting }: ReviewFormProps) {
   const { t } = useLanguage();
  const [authorName, setAuthorName] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!authorName.trim()) {
       setError(t('quizGames:reviews.pleasePseudo'));
      return;
    }
    if (rating === 0) {
       setError(t('quizGames:reviews.pleaseRating'));
      return;
    }

    try {
      await onSubmit({ author_name: authorName, rating, comment });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('quizGames:problemResolver.errorOccurred'));
    }
  };

  if (hasAlreadyReviewed || submitted) {
    return (
      <div className="text-center py-8 px-4 rounded-xl bg-primary/5 border border-primary/20">
        <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
        <h4 className="text-lg font-semibold text-foreground mb-2">
           {t('quizGames:reviews.thanksForReview')}
        </h4>
        <p className="text-muted-foreground text-sm">
          {submitted 
             ? t('quizGames:reviews.pendingValidation')
             : t('quizGames:reviews.alreadyReviewed')}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="author_name" className="block text-sm font-medium text-foreground mb-1.5">
           {t('quizGames:reviews.yourPseudo')}
        </label>
        <div className="relative">
          <Input
            id="author_name"
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value.slice(0, 60))}
             placeholder={t('quizGames:reviews.enterPseudo')}
            maxLength={60}
            required
            className="pr-16"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {authorName.length}/60
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
           {t('quizGames:reviews.yourRating')}
        </label>
        <StarRating
          rating={rating}
          interactive
          onChange={setRating}
          size="lg"
        />
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-foreground mb-1.5">
           {t('quizGames:reviews.yourMessage')}
        </label>
        <div className="relative">
          <Textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, 200))}
             placeholder={t('quizGames:reviews.encouragementPlaceholder')}
            maxLength={200}
            rows={3}
            className="resize-none pr-16"
          />
          <span className="absolute right-3 bottom-3 text-xs text-muted-foreground">
            {comment.length}/200
          </span>
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Button 
        type="submit" 
        disabled={submitting}
        className="w-full gap-2"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
             {t('quizGames:reviews.sending')}
          </>
        ) : (
          <>
            <Heart className="h-4 w-4" />
             {t('quizGames:reviews.sendReview')}
          </>
        )}
      </Button>
    </form>
  );
}
