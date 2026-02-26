import { useEffect, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/layout/SEOHead';
import { Hero } from '@/components/home/Hero';
import { QuizSection } from '@/components/home/QuizSection';
import { AIResolverSection } from '@/components/home/AIResolverSection';
import { WhatIsQuizCouple } from '@/components/home/WhatIsQuizCouple';
import { WhyDoQuiz } from '@/components/home/WhyDoQuiz';
import { HowItWorks } from '@/components/home/HowItWorks';
import { FinalCTA } from '@/components/home/FinalCTA';
import { WaveDivider } from '@/components/decorations/WaveDivider';
import { LatestArticles } from '@/components/home/LatestArticles';
import { ReviewsSection } from '@/components/reviews/ReviewsSection';
import { useReviews } from '@/hooks/useReviews';
import { generateReviewSchema } from '@/lib/review-schema';
import { useLanguage } from '@/hooks/useLanguage';
import { getLocalizedUrl, getRouteAlternates } from '@/i18n/routes';

const Index = () => {
  const { approvedReviews, stats } = useReviews();
  const reviewSchema = generateReviewSchema(approvedReviews, stats);
  const { lang, t } = useLanguage();
  const alternates = getRouteAlternates('home');

  // Handle scroll to reviews section from hash
  useEffect(() => {
    if (window.location.hash === '#avis') {
      setTimeout(() => {
        const element = document.getElementById('avis');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    }
  }, []);

  // Build combined JSON-LD with Organization for Google favicon/logo
  const allSchemas = useMemo(() => {
    const schemas: object[] = [
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Quiz Couple",
        "url": "https://quiz-couple.com",
        "description": t('home:seo.schemaDescription', 'Plateforme de quiz gratuits pour tester votre relation de couple'),
        "publisher": {
          "@id": "https://quiz-couple.com/#organization"
        }
      },
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": "https://quiz-couple.com/#organization",
        "name": "Quiz Couple",
        "url": "https://quiz-couple.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://quiz-couple.com/apple-touch-icon.png",
          "width": 180,
          "height": 180
        },
        "image": "https://quiz-couple.com/og-image.jpg",
        "description": t('home:seo.schemaDescription', 'Plateforme de quiz gratuits pour tester et renforcer votre relation de couple'),
        "sameAs": []
      }
    ];
    if (reviewSchema) schemas.push(reviewSchema);
    return schemas;
  }, [reviewSchema, lang, t]);

  return (
    <Layout>
      <SEOHead
        title={t('home:seo.title', 'Quiz pour couples en ligne et gratuit !')}
        description={t('home:seo.description', 'Découvrez nos quiz gratuits pour couples ! Testez votre relation, renforcez votre complicité et amusez-vous à deux. Sans inscription, résultats instantanés.')}
        canonical={getLocalizedUrl('home', lang)}
        ogImage="https://quiz-couple.com/og-image.webp"
        jsonLd={allSchemas}
        lang={lang}
        alternates={alternates}
      />
      
      {/* Hero Section */}
      <Hero />
      
      {/* Wave Divider */}
      <WaveDivider variant="muted" />
      
      {/* Quiz Grid Section */}
      <QuizSection />
      
      {/* Wave Divider */}
      <WaveDivider direction="up" variant="background" />
      
      {/* AI Resolver Section */}
      <AIResolverSection />
      
      {/* Wave Divider */}
      <WaveDivider variant="muted" />
      
      {/* What is Quiz Couple */}
      <WhatIsQuizCouple />
      
      {/* Wave Divider */}
      <WaveDivider variant="muted" />
      
      {/* Why Do Quiz */}
      <WhyDoQuiz />
      
      {/* Wave Divider */}
      <WaveDivider direction="up" variant="background" />
      
      {/* How It Works */}
      <HowItWorks />
      
      {/* Wave Divider */}
      <WaveDivider variant="muted" />
      
      {/* Latest Blog Articles */}
      <LatestArticles />
      
      {/* Wave Divider */}
      <WaveDivider variant="muted" />
      
      {/* Reviews Section */}
      <div id="avis">
        <ReviewsSection />
      </div>
      
      {/* Wave Divider */}
      <WaveDivider variant="muted" />
      
      {/* Final CTA */}
      <FinalCTA />
    </Layout>
  );
};

export default Index;
