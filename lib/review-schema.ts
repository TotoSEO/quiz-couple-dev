import type { Review, ReviewStats } from '@/types/review';

export function generateReviewSchema(reviews: Review[], stats: ReviewStats) {
  if (!stats || stats.totalReviews === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Quiz Couple",
    "datePublished": "2026-01-23",
    "dateModified": "2026-02-01",
    "description": "Quiz pour couples gratuits en ligne - Testez votre relation, renforcez votre complicité et amusez-vous à deux",
    "url": "https://quiz-couple.com",
    "applicationCategory": "Entertainment",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EUR"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": stats.avgRating.toFixed(1),
      "bestRating": "5",
      "worstRating": "1",
      "reviewCount": stats.totalReviews
    },
    "review": reviews.slice(0, 10).map(review => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": review.author_name
      },
      "datePublished": new Date(review.created_at).toISOString().split('T')[0],
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating,
        "bestRating": "5",
        "worstRating": "1"
      },
      "reviewBody": review.comment || ""
    }))
  };
}
