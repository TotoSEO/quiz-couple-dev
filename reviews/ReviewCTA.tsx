import { Link } from 'react-router-dom';
import { Heart, MessageSquareHeart } from 'lucide-react';
import { Button } from '@/components/ui/button';
 import { useLanguage } from '@/hooks/useLanguage';

interface ReviewCTAProps {
  variant?: 'default' | 'compact';
}

export function ReviewCTA({ variant = 'default' }: ReviewCTAProps) {
   const { t } = useLanguage();
  const scrollToReviews = () => {
    // Navigate to home and scroll to reviews section
    window.location.href = '/#avis';
  };

  if (variant === 'compact') {
    return (
      <div className="text-center py-6 px-4 rounded-xl bg-primary/5 border border-primary/20">
        <p className="text-muted-foreground mb-4">
           {t('quizGames:reviews.quizLiked')} <Heart className="inline h-4 w-4 text-primary" /> {t('quizGames:reviews.noEmailNoSignup')}
        </p>
        <Button onClick={scrollToReviews} variant="outline" size="sm" className="gap-2">
          <MessageSquareHeart className="h-4 w-4" />
           {t('quizGames:reviews.leaveReview')}
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center py-8 px-6 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
      <MessageSquareHeart className="h-10 w-10 text-primary mx-auto mb-4" />
      <h4 className="text-lg font-semibold text-foreground mb-2">
         {t('quizGames:reviews.quizLiked')}
      </h4>
      <p className="text-muted-foreground text-sm mb-4 max-w-md mx-auto">
         {t('quizGames:reviews.leaveReviewDesc')}
      </p>
      <Button onClick={scrollToReviews} className="gap-2">
        <Heart className="h-4 w-4" />
         {t('quizGames:reviews.leaveReview')}
      </Button>
    </div>
  );
}
