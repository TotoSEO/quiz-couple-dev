import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/layout/SEOHead';
import { FunnyQuizEngine } from '@/components/funny-quiz/FunnyQuizEngine';
import { WaveDivider } from '@/components/decorations/WaveDivider';
import { ReviewsSection } from '@/components/reviews/ReviewsSection';
import { Badge } from '@/components/ui/badge';
import { Sparkles, MessageCircle, Users, Clock } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { getLocalizedUrl, getRouteAlternates } from '@/i18n/routes';
import { generateQuizJsonLd, QUIZ_I18N } from '@/utils/json-ld-generator';
import { funnyQuizQuestions } from '@/data/quizzes/quiz-marrant-questions';

export default function QuizMarrant() {
  const { lang, t } = useLanguage();
  const alternates = getRouteAlternates('quizMarrant');

  const quizData = generateQuizJsonLd({
    id: "quiz-marrant",
    title: t('quizzes:quizMarrant.title'),
    description: t('quizzes:quizMarrant.metaDescription'),
    category: "couple",
    subcategory: "fun",
    totalQuestions: funnyQuizQuestions.length,
    questions: funnyQuizQuestions,
    results: [],
    timeRequired: 600,
    lang,
    createdDate: "2026-01-23",
    t,
    translationConfig: QUIZ_I18N.funny,
  });

  const jsonLdFaq = { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [1,2,3].map(i => ({ "@type": "Question", "name": t(`quiz-marrant:faq.q${i}`), "acceptedAnswer": { "@type": "Answer", "text": t(`quiz-marrant:faq.a${i}`) } })) };

  return (
    <Layout>
      <SEOHead title={t('quizzes:quizMarrant.title')} description={t('quizzes:quizMarrant.metaDescription')} canonical={getLocalizedUrl('quizMarrant', lang)} jsonLd={[quizData, jsonLdFaq]} lang={lang} alternates={alternates} />
      <main>
        {/* Hero */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Badge variant="secondary" className="mb-6"><Sparkles className="mr-1 h-3 w-3" />{t('quiz-marrant:hero.badge')}</Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">{t('quiz-marrant:hero.title')}</h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">{t('quiz-marrant:hero.description')}</p>
              <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><MessageCircle className="h-5 w-5 text-primary" /><span>{t('quiz-marrant:hero.questions')}</span></div>
                <div className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /><span>{t('quiz-marrant:hero.players')}</span></div>
                <div className="flex items-center gap-2"><Clock className="h-5 w-5 text-primary" /><span>{t('quiz-marrant:hero.duration')}</span></div>
              </div>
            </div>
          </div>
        </section>

        <WaveDivider />
        <section className="py-16 bg-muted/30"><div className="container mx-auto px-4"><FunnyQuizEngine /></div></section>
        <WaveDivider direction="up" />

        {/* SEO Content */}
        <article className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-12">
              {[1,2,3].map(i => (
                <section key={i} className="space-y-4">
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">{t(`quiz-marrant:section${i}.title`)}</h2>
                  <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                    <p dangerouslySetInnerHTML={{ __html: t(`quiz-marrant:section${i}.p1`) }} />
                    <p dangerouslySetInnerHTML={{ __html: t(`quiz-marrant:section${i}.p2`) }} />
                    <p dangerouslySetInnerHTML={{ __html: t(`quiz-marrant:section${i}.p3`) }} />
                    {t(`quiz-marrant:section${i}.p4`, { defaultValue: '' }) && <p dangerouslySetInnerHTML={{ __html: t(`quiz-marrant:section${i}.p4`) }} />}
                  </div>
                </section>
              ))}

              {/* Section 4 with subsections */}
              <section className="space-y-6">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">{t('quiz-marrant:section4.title')}</h2>
                <div className="space-y-4">
                  <h3 className="text-xl md:text-2xl font-semibold text-foreground">{t('quiz-marrant:section4.sub1Title')}</h3>
                  <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                    <p>{t('quiz-marrant:section4.sub1P1')}</p><p>{t('quiz-marrant:section4.sub1P2')}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl md:text-2xl font-semibold text-foreground">{t('quiz-marrant:section4.sub2Title')}</h3>
                  <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                    <p>{t('quiz-marrant:section4.sub2P1')}</p><p>{t('quiz-marrant:section4.sub2P2')}</p>
                  </div>
                </div>
              </section>

              {[5,6,7,8,9].map(i => (
                <section key={i} className="space-y-4">
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">{t(`quiz-marrant:section${i}.title`)}</h2>
                  <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                    <p dangerouslySetInnerHTML={{ __html: t(`quiz-marrant:section${i}.p1`) }} />
                    <p dangerouslySetInnerHTML={{ __html: t(`quiz-marrant:section${i}.p2`) }} />
                    {t(`quiz-marrant:section${i}.p3`, { defaultValue: '' }) && <p dangerouslySetInnerHTML={{ __html: t(`quiz-marrant:section${i}.p3`) }} />}
                  </div>
                </section>
              ))}

              {/* FAQ */}
              <section className="space-y-6">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">{t('quiz-marrant:faq.title')}</h2>
                <div className="space-y-6">
                  {[1,2,3].map(i => (
                    <div key={i} className="space-y-2">
                      <h3 className="text-xl font-semibold text-foreground">{t(`quiz-marrant:faq.q${i}`)}</h3>
                      <p className="text-lg text-muted-foreground leading-relaxed">{t(`quiz-marrant:faq.a${i}`)}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Conclusion */}
              <section className="space-y-4">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">{t('quiz-marrant:conclusion.title')}</h2>
                <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                  <p dangerouslySetInnerHTML={{ __html: t('quiz-marrant:conclusion.p1') }} />
                  <p dangerouslySetInnerHTML={{ __html: t('quiz-marrant:conclusion.p2') }} />
                </div>
              </section>
            </div>
          </div>
        </article>

        <WaveDivider />
        <section id="reviews-section"><ReviewsSection /></section>
      </main>
    </Layout>
  );
}
