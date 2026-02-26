import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/layout/SEOHead';
import { CommonPointsQuizEngine } from '@/components/common-points-quiz/CommonPointsQuizEngine';
import { WaveDivider } from '@/components/decorations/WaveDivider';
import { FloatingBlobs } from '@/components/decorations/FloatingBlobs';
import { Badge } from '@/components/ui/badge';
import { ReviewsSection } from '@/components/reviews/ReviewsSection';
import { 
  Clock, Users, Target, Sparkles, CheckCircle2, 
  Heart, MessageCircle, Brain, Home, Compass, Lightbulb
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { getLocalizedUrl, getRouteAlternates } from '@/i18n/routes';
import { generateQuizJsonLd, QUIZ_I18N } from '@/utils/json-ld-generator';
import { commonPointsQuestions } from '@/data/quizzes/common-points-questions';

const TestPointsCommuns = () => {
  const { lang, t } = useLanguage();
  const alternates = getRouteAlternates('testCommonPoints');

  const faqItems = t('quiz-common-points:seo.faq', { returnObjects: true }) as Array<{q: string; a: string}>;
  const stepsData = t('quiz-common-points:seo.s3.steps', { returnObjects: true }) as Array<{title: string; desc: string}>;
  const categoriesData = t('quiz-common-points:seo.s4.categories', { returnObjects: true }) as Array<{title: string; desc: string}>;
  const whenItems = t('quiz-common-points:seo.s7.items', { returnObjects: true }) as string[];

  const commonPointsResults = [
    { min: 0, max: 5, title: t('quiz-common-points:results.fewTitle'), description: t('quiz-common-points:results.fewDesc') },
    { min: 6, max: 10, title: t('quiz-common-points:results.someTitle'), description: t('quiz-common-points:results.someDesc') },
    { min: 11, max: 15, title: t('quiz-common-points:results.goodTitle'), description: t('quiz-common-points:results.goodDesc') },
    { min: 16, max: 20, title: t('quiz-common-points:results.greatTitle'), description: t('quiz-common-points:results.greatDesc') }
  ];

  const quizData = generateQuizJsonLd({
    id: "test-points-communs",
    title: t('quizzes:testCommonPoints.title'),
    description: t('quizzes:testCommonPoints.metaDescription'),
    category: "couple",
    subcategory: "compatibilite",
    totalQuestions: commonPointsQuestions.length,
    questions: commonPointsQuestions,
    results: commonPointsResults,
    timeRequired: 300,
    lang,
    createdDate: "2026-01-23",
    t,
    translationConfig: QUIZ_I18N.cp,
  });

  const faqJsonLd = {
    "@type": "FAQPage",
    "mainEntity": faqItems.map(item => ({
      "@type": "Question", "name": item.q,
      "acceptedAnswer": { "@type": "Answer", "text": item.a }
    }))
  };

  const catIcons = [Brain, Heart, Sparkles, Home, MessageCircle, Compass];
  const catColors = ['purple', 'pink', 'yellow', 'green', 'red', 'blue'];

  return (
    <Layout>
      <SEOHead
        title={t('quizzes:testCommonPoints.title')}
        description={t('quizzes:testCommonPoints.metaDescription')}
        canonical={getLocalizedUrl('testCommonPoints', lang)}
        jsonLd={[quizData, faqJsonLd]}
        lang={lang}
        alternates={alternates}
      />
      {/* Hero */}
      <section className="relative py-12 md:py-16 overflow-hidden">
        <FloatingBlobs />
        <div className="container mx-auto px-4 relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4 gap-2 px-4 py-2">
              <Sparkles className="h-4 w-4" />
              {t('quiz-common-points:hero.badge')}
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-gradient">{t('quiz-common-points:hero.title')}</h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">{t('quiz-common-points:hero.description')}</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /><span>{t('quiz-common-points:hero.duration')}</span></div>
              <div className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /><span>{t('quiz-common-points:hero.players')}</span></div>
              <div className="flex items-center gap-2"><Target className="h-4 w-4 text-primary" /><span>{t('quiz-common-points:hero.questions')}</span></div>
            </div>
          </div>
        </div>
      </section>

      <WaveDivider />

      {/* Quiz */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl"><CommonPointsQuizEngine /></div>
        </div>
      </section>

      <WaveDivider direction="up" />

      {/* SEO Content */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <article className="mx-auto max-w-4xl prose prose-lg dark:prose-invert">
            <div className="not-prose text-center mb-12">
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">{t('quiz-common-points:seo.intro')}</p>
            </div>

            <h2 className="flex items-center gap-3 not-prose text-2xl font-bold mb-4">
              <Heart className="h-6 w-6 text-primary" />{t('quiz-common-points:seo.s1.title')}
            </h2>
            <p>{t('quiz-common-points:seo.s1.p1')}</p>
            <p>{t('quiz-common-points:seo.s1.p2')}</p>

            <h2 className="flex items-center gap-3 not-prose text-2xl font-bold mb-4 mt-12">
              <MessageCircle className="h-6 w-6 text-primary" />{t('quiz-common-points:seo.s2.title')}
            </h2>
            <p dangerouslySetInnerHTML={{ __html: t('quiz-common-points:seo.s2.p1') }} />
            <p dangerouslySetInnerHTML={{ __html: t('quiz-common-points:seo.s2.p2') }} />

            <h2 className="flex items-center gap-3 not-prose text-2xl font-bold mb-4 mt-12">
              <Lightbulb className="h-6 w-6 text-primary" />{t('quiz-common-points:seo.s3.title')}
            </h2>
            <div className="not-prose glass-card p-6 my-6">
              <div className="grid md:grid-cols-3 gap-6">
                {stepsData.map((step, i) => (
                  <div key={i} className="text-center">
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">{i + 1}</div>
                    <h4 className="font-medium mb-2">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <h2 className="flex items-center gap-3 not-prose text-2xl font-bold mb-4 mt-12">
              <Target className="h-6 w-6 text-primary" />{t('quiz-common-points:seo.s4.title')}
            </h2>
            <p>{t('quiz-common-points:seo.s4.p1')}</p>
            <div className="not-prose grid md:grid-cols-2 gap-4 my-8">
              {categoriesData.map((cat, i) => {
                const Icon = catIcons[i];
                return (
                  <div key={i} className="glass-card p-5">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full bg-${catColors[i]}-500/10 flex items-center justify-center shrink-0`}>
                        <Icon className={`h-5 w-5 text-${catColors[i]}-500`} />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{cat.title}</h3>
                        <p className="text-sm text-muted-foreground">{cat.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <h2 className="not-prose text-2xl font-bold mb-4 mt-12">{t('quiz-common-points:seo.s5.title')}</h2>
            <p>{t('quiz-common-points:seo.s5.p1')}</p>
            <p>{t('quiz-common-points:seo.s5.p2')}</p>

            <h2 className="not-prose text-2xl font-bold mb-4 mt-12">{t('quiz-common-points:seo.s6.title')}</h2>
            <p dangerouslySetInnerHTML={{ __html: t('quiz-common-points:seo.s6.p1') }} />
            <p>{t('quiz-common-points:seo.s6.p2')}</p>

            <h2 className="not-prose text-2xl font-bold mb-4 mt-12">{t('quiz-common-points:seo.s7.title')}</h2>
            <p>{t('quiz-common-points:seo.s7.p1')}</p>
            <ul>
              {whenItems.map((item, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ul>

            <div className="not-prose glass-card p-8 mt-12 text-center">
              <h2 className="text-xl font-bold mb-4">{t('quiz-common-points:seo.ctaTitle')}</h2>
              <p className="text-muted-foreground mb-6">{t('quiz-common-points:seo.ctaDesc')}</p>
            </div>

            <div className="not-prose mt-16">
              <h2 className="text-2xl font-bold text-center mb-8">{t('quiz-common-points:seo.faqTitle')}</h2>
              <div className="space-y-4">
                {faqItems.map((item, i) => (
                  <div key={i} className="glass-card p-5">
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />{item.q}
                    </h3>
                    <p className="text-sm text-muted-foreground">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Reviews */}
      <section id="review-section" className="py-16 bg-muted/30">
        <div className="container mx-auto px-4"><ReviewsSection /></div>
      </section>
    </Layout>
  );
};

export default TestPointsCommuns;