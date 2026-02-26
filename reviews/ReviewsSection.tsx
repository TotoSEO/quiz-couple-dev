import { useReviews } from '@/hooks/useReviews';
import { StarRating } from './StarRating';
import { ReviewCard } from './ReviewCard';
import { ReviewForm } from './ReviewForm';
import { MessageSquareHeart, Star } from 'lucide-react';
 import { useLanguage } from '@/hooks/useLanguage';

export function ReviewsSection() {
   const { t } = useLanguage();
  const { approvedReviews, stats, loading, submitting, createReview, hasAlreadyReviewed } = useReviews();

  return (
    <section className="py-16 sm:py-20" aria-labelledby="reviews-heading">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header with stats */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <MessageSquareHeart className="h-5 w-5" />
             <span className="font-medium">{t('quizGames:reviews.yourReviews')}</span>
          </div>
          
          <h2 id="reviews-heading" className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
             {t('quizGames:reviews.whatYouThink')}
          </h2>
          
          {stats.totalReviews > 0 && (
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                <span className="text-2xl font-bold text-foreground">{stats.avgRating.toFixed(1)}</span>
              </div>
              <span className="text-muted-foreground">
                 {t('quizGames:reviews.basedOn')} {stats.totalReviews} {t('quizGames:reviews.reviews')}
              </span>
            </div>
          )}
          
          <p className="text-muted-foreground max-w-2xl mx-auto">
             {t('quizGames:reviews.siteDescription')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Reviews list */}
          <div className="order-2 lg:order-1">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-xl bg-card/50 border border-border/50 p-5 animate-pulse">
                    <div className="h-4 bg-muted rounded w-1/3 mb-3"></div>
                    <div className="h-3 bg-muted rounded w-full mb-2"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : approvedReviews.length > 0 ? (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
                {approvedReviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 rounded-xl bg-card/30 border border-border/30">
                <MessageSquareHeart className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">
                   {t('quizGames:reviews.beFirst')}
                </p>
              </div>
            )}
          </div>

          {/* Review form */}
          <div className="order-1 lg:order-2">
            <div className="rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 p-6 sm:p-8 sticky top-24">
              <h3 className="text-xl font-semibold text-foreground mb-2">
                 {t('quizGames:reviews.leaveReview')}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                 {t('quizGames:reviews.noEmailNoSignup')}
              </p>
              <ReviewForm
                onSubmit={createReview}
                hasAlreadyReviewed={hasAlreadyReviewed}
                submitting={submitting}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
