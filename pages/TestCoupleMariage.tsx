import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/layout/SEOHead';
import { MarriageQuizEngine } from '@/components/marriage-quiz/MarriageQuizEngine';
import { WaveDivider } from '@/components/decorations/WaveDivider';
import { FloatingBlobs } from '@/components/decorations/FloatingBlobs';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Target, Sparkles, CheckCircle2, Heart, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { getLocalizedUrl, getRouteAlternates } from '@/i18n/routes';
import { generateQuizJsonLd, QUIZ_I18N } from '@/utils/json-ld-generator';
import { marriageQuestions, marriageResults } from '@/data/quizzes/quiz-mariage-questions';

const TestCoupleMariage = () => {
  const { lang, t } = useLanguage();
  const alternates = getRouteAlternates('testMariage');

  const quizData = generateQuizJsonLd({
    id: "test-mariage",
    title: t('quizzes:testMariage.title'),
    description: t('quizzes:testMariage.metaDescription'),
    category: "couple",
    subcategory: "mariage",
    totalQuestions: marriageQuestions.length,
    questions: marriageQuestions,
    results: marriageResults,
    timeRequired: 600,
    lang,
    createdDate: "2026-01-23",
    t,
    translationConfig: QUIZ_I18N.marriage,
  });

  const jsonLd = [
    quizData,
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        { "@type": "Question", "name": t('quiz-mariage:seo.faq1Q'), "acceptedAnswer": { "@type": "Answer", "text": t('quiz-mariage:seo.faq1A') } },
        { "@type": "Question", "name": t('quiz-mariage:seo.faq2Q'), "acceptedAnswer": { "@type": "Answer", "text": t('quiz-mariage:seo.faq2A') } },
        { "@type": "Question", "name": t('quiz-mariage:seo.faq3Q'), "acceptedAnswer": { "@type": "Answer", "text": t('quiz-mariage:seo.faq3A') } },
      ]
    }
  ];
  return (
    <Layout>
      <SEOHead
        title={t('quizzes:testMariage.title')}
        description={t('quizzes:testMariage.metaDescription')}
        canonical={getLocalizedUrl('testMariage', lang)}
        jsonLd={jsonLd}
        lang={lang}
        alternates={alternates}
      />
      
      {/* Hero Section */}
      <section className="relative py-12 md:py-16 overflow-hidden">
        <FloatingBlobs />
        <div className="container mx-auto px-4 relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4 gap-2 px-4 py-2">
              <Sparkles className="h-4 w-4" />
              {t('quiz-mariage:hero.badge')}
            </Badge>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-gradient">
              {t('quiz-mariage:hero.title')}
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t('quiz-mariage:hero.description')}
            </p>

            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>{t('quiz-mariage:hero.duration')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span>{t('quiz-mariage:hero.players')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <span>{t('quiz-mariage:hero.questions')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <WaveDivider />

      {/* Quiz Section */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <MarriageQuizEngine />
          </div>
        </div>
      </section>

      <WaveDivider direction="up" />

      {/* SEO Content Section */}
      <article className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
              {t('quiz-mariage:seo.whyTitle')}
            </h2>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <div className="glass-card p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center shrink-0">
                    <Heart className="h-6 w-6 text-pink-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{t('quiz-mariage:seo.card1Title')}</h3>
                    <p className="text-muted-foreground text-sm">{t('quiz-mariage:seo.card1Text')}</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                    <MessageCircle className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{t('quiz-mariage:seo.card2Title')}</h3>
                    <p className="text-muted-foreground text-sm">{t('quiz-mariage:seo.card2Text')}</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                    <Target className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{t('quiz-mariage:seo.card3Title')}</h3>
                    <p className="text-muted-foreground text-sm">{t('quiz-mariage:seo.card3Text')}</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                    <Sparkles className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{t('quiz-mariage:seo.card4Title')}</h3>
                    <p className="text-muted-foreground text-sm">{t('quiz-mariage:seo.card4Text')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Rich SEO content */}
            <div className="prose prose-lg dark:prose-invert mx-auto mb-12" dangerouslySetInnerHTML={{ __html: t('quiz-mariage:seo.richContent') }} />

            {/* FAQ */}
            <div>
              <h3 className="text-xl font-semibold text-center mb-8">{t('quiz-mariage:seo.faqTitle')}</h3>
              <div className="space-y-4">
                <div className="glass-card p-5">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    {t('quiz-mariage:seo.faq1Q')}
                  </h4>
                  <p className="text-sm text-muted-foreground">{t('quiz-mariage:seo.faq1A')}</p>
                </div>
                <div className="glass-card p-5">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    {t('quiz-mariage:seo.faq2Q')}
                  </h4>
                  <p className="text-sm text-muted-foreground">{t('quiz-mariage:seo.faq2A')}</p>
                </div>
                <div className="glass-card p-5">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    {t('quiz-mariage:seo.faq3Q')}
                  </h4>
                  <p className="text-sm text-muted-foreground">{t('quiz-mariage:seo.faq3A')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>
    </Layout>
  );
};

export default TestCoupleMariage;
