import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/layout/SEOHead';
import { AdoQuizEngine } from '@/components/ado-quiz/AdoQuizEngine';
import { WaveDivider } from '@/components/decorations/WaveDivider';
import { Heart, Users, Smartphone, Trophy, BookOpen, Shield, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { getLocalizedUrl, getRouteAlternates } from '@/i18n/routes';

const QuizCoupleAdo = () => {
  const { lang, t } = useLanguage();
  const alternates = getRouteAlternates('quizAdo');

  const quizJsonLd = {
    "@context": "https://schema.org",
    "@type": "Quiz",
    "name": t('quizzes:quizAdo.title'),
    "description": t('quizzes:quizAdo.metaDescription'),
    "inLanguage": lang,
    "dateCreated": "2026-02-24",
    "datePublished": "2026-02-24",
    "timeRequired": "PT10M",
    "isAccessibleForFree": true,
    "learningResourceType": "Quiz",
    "interactivityType": "active",
    "educationalAlignment": {
      "@type": "AlignmentObject",
      "educationalFramework": "Couple relationships",
      "targetName": "Teen relationship assessment",
      "alignmentType": "teaches",
    },
    "about": { "@type": "Thing", "name": "teen couple quiz" },
    "additionalProperty": [
      { "@type": "PropertyValue", "name": "totalQuestions", "value": 80 },
      { "@type": "PropertyValue", "name": "questionsPerSession", "value": 20 },
      { "@type": "PropertyValue", "name": "players", "value": 2 },
      { "@type": "PropertyValue", "name": "audience", "value": "teenagers" },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": t('quiz-ado:seo.faq1Q'), "acceptedAnswer": { "@type": "Answer", "text": t('quiz-ado:seo.faq1A') } },
      { "@type": "Question", "name": t('quiz-ado:seo.faq2Q'), "acceptedAnswer": { "@type": "Answer", "text": t('quiz-ado:seo.faq2A') } },
      { "@type": "Question", "name": t('quiz-ado:seo.faq3Q'), "acceptedAnswer": { "@type": "Answer", "text": t('quiz-ado:seo.faq3A') } },
      { "@type": "Question", "name": t('quiz-ado:seo.faq4Q'), "acceptedAnswer": { "@type": "Answer", "text": t('quiz-ado:seo.faq4A') } },
    ],
  };

  return (
    <Layout>
      <SEOHead
        title={t('quizzes:quizAdo.title')}
        description={t('quizzes:quizAdo.metaDescription')}
        canonical={getLocalizedUrl('quizAdo', lang)}
        jsonLd={[quizJsonLd, faqJsonLd]}
        lang={lang}
        alternates={alternates}
      />

      {/* Hero */}
      <section className="relative py-12 md:py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-background" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium">
              <Smartphone className="h-4 w-4" />
              {t('quiz-ado:hero.badge')}
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              {t('quiz-ado:hero.title')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('quiz-ado:hero.description')}
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-4 w-4 text-emerald-500" /> {t('quiz-ado:hero.feat1')}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Smartphone className="h-4 w-4 text-emerald-500" /> {t('quiz-ado:hero.feat2')}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Trophy className="h-4 w-4 text-emerald-500" /> {t('quiz-ado:hero.feat3')}
              </span>
            </div>
          </div>
        </div>
      </section>

      <WaveDivider />

      {/* Quiz */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl">
            <AdoQuizEngine />
          </div>
        </div>
      </section>

      <WaveDivider direction="up" />

      {/* SEO Content */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <article className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <h2>{t('quiz-ado:seo.s1Title')}</h2>
            <p>{t('quiz-ado:seo.s1P1')}</p>
            <p>{t('quiz-ado:seo.s1P2')}</p>

            <h2>{t('quiz-ado:seo.s2Title')}</h2>
            <p dangerouslySetInnerHTML={{ __html: t('quiz-ado:seo.s2P1') }} />
            <h3>{t('quiz-ado:seo.s2Sub1')}</h3>
            <ul>
              <li>{t('quiz-ado:seo.s2L1')}</li>
              <li>{t('quiz-ado:seo.s2L2')}</li>
              <li>{t('quiz-ado:seo.s2L3')}</li>
              <li>{t('quiz-ado:seo.s2L4')}</li>
              <li>{t('quiz-ado:seo.s2L5')}</li>
            </ul>
            <h3>{t('quiz-ado:seo.s2Sub2')}</h3>
            <ul>
              <li>{t('quiz-ado:seo.s2W1')}</li>
              <li>{t('quiz-ado:seo.s2W2')}</li>
              <li>{t('quiz-ado:seo.s2W3')}</li>
              <li>{t('quiz-ado:seo.s2W4')}</li>
              <li>{t('quiz-ado:seo.s2W5')}</li>
            </ul>

            <h2>{t('quiz-ado:seo.s3Title')}</h2>
            <p>{t('quiz-ado:seo.s3P1')}</p>
            <p>{t('quiz-ado:seo.s3P2')}</p>

            <h2>{t('quiz-ado:seo.s4Title')}</h2>
            <p dangerouslySetInnerHTML={{ __html: t('quiz-ado:seo.s4P1') }} />
            <p>{t('quiz-ado:seo.s4P2')}</p>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500 p-4 rounded-r-lg not-prose">
              <p className="text-sm"><strong>💡 {t('quiz-ado:seo.tipLabel')}</strong> {t('quiz-ado:seo.s4Tip')}</p>
            </div>

            <h2>{t('quiz-ado:seo.s5Title')}</h2>
            <p>{t('quiz-ado:seo.s5P1')}</p>
            <p dangerouslySetInnerHTML={{ __html: t('quiz-ado:seo.s5P2') }} />
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500 p-4 rounded-r-lg not-prose">
              <p className="text-sm"><strong>💡 {t('quiz-ado:seo.tipLabel')}</strong> {t('quiz-ado:seo.s5Tip')}</p>
            </div>

            <h2>{t('quiz-ado:seo.s6Title')}</h2>
            <p>{t('quiz-ado:seo.s6P1')}</p>
            <p>{t('quiz-ado:seo.s6P2')}</p>

            <h2>{t('quiz-ado:seo.s7Title')}</h2>
            <p>{t('quiz-ado:seo.s7P1')}</p>
            <p>{t('quiz-ado:seo.s7P2')}</p>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500 p-4 rounded-r-lg not-prose">
              <p className="text-sm"><strong>💡 {t('quiz-ado:seo.tipLabel')}</strong> {t('quiz-ado:seo.s7Tip')}</p>
            </div>

            <h2>{t('quiz-ado:seo.s8Title')}</h2>
            <p dangerouslySetInnerHTML={{ __html: t('quiz-ado:seo.s8P1') }} />
            <p>{t('quiz-ado:seo.s8P2')}</p>
          </article>

          {/* FAQ */}
          <div className="max-w-3xl mx-auto mt-12 bg-card rounded-xl border p-6 md:p-8 space-y-6">
            <h2 className="text-xl font-bold">{t('quiz-ado:seo.faqTitle')}</h2>
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i}>
                  <h3 className="font-semibold">{t(`quiz-ado:seo.faq${i}Q`)}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{t(`quiz-ado:seo.faq${i}A`)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default QuizCoupleAdo;
