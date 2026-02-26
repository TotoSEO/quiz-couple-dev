import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/layout/SEOHead';
import { DebateQuizEngine } from '@/components/debate-quiz/DebateQuizEngine';
import { quizAmoureuxDebate } from '@/data/quizzes/quiz-amoureux-debate';
import { WaveDivider } from '@/components/decorations/WaveDivider';
import { Heart, Users, MessageCircle, Trophy } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { getLocalizedUrl, getRouteAlternates } from '@/i18n/routes';
import { generateQuizJsonLd, QUIZ_I18N } from '@/utils/json-ld-generator';

const QuizAmoureux = () => {
  const { lang, t } = useLanguage();
  const alternates = getRouteAlternates('quizAmoureux');

  const quizData = generateQuizJsonLd({
    id: "quiz-amoureux",
    title: t('quizzes:quizAmoureux.title'),
    description: t('quizzes:quizAmoureux.metaDescription'),
    category: "couple",
    subcategory: "debate",
    totalQuestions: quizAmoureuxDebate.questions.length,
    questions: quizAmoureuxDebate.questions,
    results: quizAmoureuxDebate.results,
    timeRequired: 900,
    lang,
    createdDate: "2026-01-23",
    t,
    translationConfig: QUIZ_I18N.debate,
  });

  const jsonLd = [
    quizData,
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": t('quiz-amoureux:seo.faq1Q'),
          "acceptedAnswer": {
            "@type": "Answer",
            "text": t('quiz-amoureux:seo.faq1A')
          }
        },
        {
          "@type": "Question",
          "name": t('quiz-amoureux:seo.faq2Q'),
          "acceptedAnswer": {
            "@type": "Answer",
            "text": t('quiz-amoureux:seo.faq2A')
          }
        },
        {
          "@type": "Question",
          "name": t('quiz-amoureux:seo.faq3Q'),
          "acceptedAnswer": {
            "@type": "Answer",
            "text": t('quiz-amoureux:seo.faq3A')
          }
        },
        {
          "@type": "Question",
          "name": t('quiz-amoureux:seo.faq4Q'),
          "acceptedAnswer": {
            "@type": "Answer",
            "text": t('quiz-amoureux:seo.faq4A')
          }
        }
      ]
    }
  ];

  return (
    <Layout>
      <SEOHead
        title={t('quizzes:quizAmoureux.title')}
        description={t('quizzes:quizAmoureux.metaDescription')}
        canonical={getLocalizedUrl('quizAmoureux', lang)}
        jsonLd={jsonLd}
        lang={lang}
        alternates={alternates}
      />
      
      {/* Hero Section */}
      <section className="relative py-12 md:py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-rose-500/5 to-background" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 text-sm font-medium">
              <Users className="h-4 w-4" />
              {t('quiz-amoureux:hero.badge')}
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              {t('quiz-amoureux:hero.title')} <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">{t('quiz-amoureux:hero.titleHighlight')}</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('quiz-amoureux:hero.description')}
            </p>

            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-muted-foreground">
                <MessageCircle className="h-4 w-4 text-pink-500" />
                {t('quiz-amoureux:hero.statements')}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Heart className="h-4 w-4 text-pink-500" />
                {t('quiz-amoureux:hero.score')}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Trophy className="h-4 w-4 text-pink-500" />
                {t('quiz-amoureux:hero.results')}
              </span>
            </div>
          </div>
        </div>
      </section>

      <WaveDivider />

      {/* Quiz Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl">
            <DebateQuizEngine quiz={quizAmoureuxDebate} />
          </div>
        </div>
      </section>

      <WaveDivider direction="up" />

      {/* SEO Content Section */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                {t('quiz-amoureux:seo.whyTitle')}
              </h2>
              <p className="text-muted-foreground">
                {t('quiz-amoureux:seo.whySubtitle')}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-card rounded-xl p-6 border">
                <div className="h-12 w-12 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center mb-4">
                  <MessageCircle className="h-6 w-6 text-pink-500" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{t('quiz-amoureux:seo.card1Title')}</h3>
                <p className="text-sm text-muted-foreground">{t('quiz-amoureux:seo.card1Text')}</p>
              </div>

              <div className="bg-card rounded-xl p-6 border">
                <div className="h-12 w-12 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-pink-500" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{t('quiz-amoureux:seo.card2Title')}</h3>
                <p className="text-sm text-muted-foreground">{t('quiz-amoureux:seo.card2Text')}</p>
              </div>

              <div className="bg-card rounded-xl p-6 border">
                <div className="h-12 w-12 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-pink-500" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{t('quiz-amoureux:seo.card3Title')}</h3>
                <p className="text-sm text-muted-foreground">{t('quiz-amoureux:seo.card3Text')}</p>
              </div>

              <div className="bg-card rounded-xl p-6 border">
                <div className="h-12 w-12 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center mb-4">
                  <Trophy className="h-6 w-6 text-pink-500" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{t('quiz-amoureux:seo.card4Title')}</h3>
                <p className="text-sm text-muted-foreground">{t('quiz-amoureux:seo.card4Text')}</p>
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-card rounded-xl border p-6 md:p-8 space-y-6">
              <h2 className="text-xl font-bold">{t('quiz-amoureux:seo.faqTitle')}</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">{t('quiz-amoureux:seo.faq1Q')}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{t('quiz-amoureux:seo.faq1A')}</p>
                </div>

                <div>
                  <h3 className="font-semibold">{t('quiz-amoureux:seo.faq2Q')}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{t('quiz-amoureux:seo.faq2A')}</p>
                </div>

                <div>
                  <h3 className="font-semibold">{t('quiz-amoureux:seo.faq3Q')}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{t('quiz-amoureux:seo.faq3A')}</p>
                </div>

                <div>
                  <h3 className="font-semibold">{t('quiz-amoureux:seo.faq4Q')}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{t('quiz-amoureux:seo.faq4A')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default QuizAmoureux;