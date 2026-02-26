import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/layout/SEOHead';
import { MostQuizEngine } from '@/components/most-quiz/MostQuizEngine';
import { FloatingBlobs } from '@/components/decorations/FloatingBlobs';
import { WaveDivider } from '@/components/decorations/WaveDivider';
import { Card } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Users, PartyPopper, MessageCircle, Heart, Sparkles, Trophy, Lightbulb, ThumbsUp, Laugh, HelpCircle } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { getLocalizedUrl, getRouteAlternates } from '@/i18n/routes';
import { generateQuizJsonLd, QUIZ_I18N } from '@/utils/json-ld-generator';
import { mostQuestions } from '@/data/quizzes/quiz-most-questions';

export default function QuizQuiEstLePlus() {
  const { lang, t } = useLanguage();
  const alternates = getRouteAlternates('quizMost');

  const quizData = generateQuizJsonLd({
    id: "quiz-qui-est-le-plus",
    title: t('quizzes:quizMost.title'),
    description: t('quizzes:quizMost.metaDescription'),
    category: "couple",
    subcategory: "qui_est_le_plus",
    totalQuestions: mostQuestions.length,
    questions: mostQuestions,
    results: [],
    timeRequired: 600,
    lang,
    createdDate: "2026-01-23",
    t,
    translationConfig: QUIZ_I18N.most,
  });

  const faqSchemaData = {
    "@context": "https://schema.org", "@type": "FAQPage",
    "mainEntity": [1,2,3,4,5,6].map(i => ({
      "@type": "Question", "name": t(`quiz-most:faq.q${i}`),
      "acceptedAnswer": { "@type": "Answer", "text": t(`quiz-most:faq.a${i}`) }
    }))
  };

  const classicQuestions = t('quiz-most:examples.classicQuestions', { returnObjects: true }) as string[];
  const funQuestions = t('quiz-most:examples.funQuestions', { returnObjects: true }) as string[];
  const intimateQuestions = t('quiz-most:examples.intimateQuestions', { returnObjects: true }) as string[];

  return (
    <Layout>
      <SEOHead title={t('quizzes:quizMost.title')} description={t('quizzes:quizMost.metaDescription')} canonical={getLocalizedUrl('quizMost', lang)} jsonLd={[quizData, faqSchemaData]} lang={lang} alternates={alternates} />
      {/* Hero */}
      <section className="relative py-12 md:py-20 overflow-hidden">
        <FloatingBlobs />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              {t('quiz-most:hero.title')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t('quiz-most:hero.description')}{' '}
              <strong className="text-foreground">{t('quiz-most:hero.descriptionBold')}</strong>{' '}
              {t('quiz-most:hero.descriptionEnd')}
            </p>
          </div>
          <div className="max-w-2xl mx-auto"><MostQuizEngine /></div>
        </div>
      </section>

      <WaveDivider variant="primary" />

      {/* How to play */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{t('quiz-most:howToPlay.title')}</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Users, color: 'primary', titleKey: 'step1Title', textKey: 'step1Text' },
                { icon: MessageCircle, color: 'secondary', titleKey: 'step2Title', textKey: 'step2Text' },
                { icon: Trophy, color: 'primary', titleKey: 'step3Title', textKey: 'step3Text' },
              ].map(({ icon: Icon, color, titleKey, textKey }) => (
                <Card key={titleKey} className="text-center p-6 bg-card/80 backdrop-blur border-primary/20 hover:border-primary/40 transition-colors">
                  <div className="flex justify-center mb-4"><div className={`p-4 rounded-full bg-${color}/10`}><Icon className={`h-8 w-8 text-${color}`} /></div></div>
                  <h3 className="text-xl font-semibold mb-3">{t(`quiz-most:howToPlay.${titleKey}`)}</h3>
                  <p className="text-muted-foreground">{t(`quiz-most:howToPlay.${textKey}`)}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why popular */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{t('quiz-most:whyPopular.title')}</h2>
            <div className="space-y-8">
              {[
                { icon: PartyPopper, color: 'primary', i: 1 },
                { icon: Heart, color: 'secondary', i: 2 },
                { icon: Sparkles, color: 'primary', i: 3 },
              ].map(({ icon: Icon, color, i }) => (
                <div key={i} className="flex gap-6 items-start">
                  <div className={`flex-shrink-0 p-3 rounded-full bg-${color}/10`}><Icon className={`h-6 w-6 text-${color}`} /></div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{t(`quiz-most:whyPopular.item${i}Title`)}</h3>
                    <p className="text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: t(`quiz-most:whyPopular.item${i}Text`) }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <WaveDivider variant="muted" />

      {/* Question examples */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">{t('quiz-most:examples.title')}</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">{t('quiz-most:examples.subtitle')}</p>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: ThumbsUp, color: 'primary', titleKey: 'classicTitle', questions: classicQuestions },
                { icon: Laugh, color: 'secondary', titleKey: 'funTitle', questions: funQuestions },
                { icon: Heart, color: 'primary', titleKey: 'intimateTitle', questions: intimateQuestions },
              ].map(({ icon: Icon, color, titleKey, questions }) => (
                <Card key={titleKey} className="p-6 bg-card/80 backdrop-blur">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-full bg-${color}/10`}><Icon className={`h-5 w-5 text-${color}`} /></div>
                    <h3 className="text-lg font-semibold">{t(`quiz-most:examples.${titleKey}`)}</h3>
                  </div>
                  <ul className="space-y-2">
                    {Array.isArray(questions) && questions.map((q: string, i: number) => (
                      <li key={i} className={`text-muted-foreground text-sm flex items-start gap-2`}>
                        <span className={`text-${color}`}>•</span>{q}
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tips */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{t('quiz-most:tips.title')}</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Lightbulb, color: 'primary', i: 1 },
                { icon: MessageCircle, color: 'secondary', i: 2 },
                { icon: Laugh, color: 'primary', i: 3 },
              ].map(({ icon: Icon, color, i }) => (
                <Card key={i} className={`p-6 bg-gradient-to-br from-${color}/5 to-transparent border-${color}/20`}>
                  <div className="flex justify-center mb-4"><Icon className={`h-10 w-10 text-${color}`} /></div>
                  <h3 className="text-xl font-semibold text-center mb-3">{t(`quiz-most:tips.tip${i}Title`)}</h3>
                  <p className="text-muted-foreground text-center">{t(`quiz-most:tips.tip${i}Text`)}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <WaveDivider variant="primary" />

      {/* FAQ */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-8">
              <HelpCircle className="h-8 w-8 text-primary" />
              <h2 className="text-3xl md:text-4xl font-bold">{t('quiz-most:faq.title')}</h2>
            </div>
            <Accordion type="single" collapsible className="space-y-4">
              {[1,2,3,4,5,6].map(i => (
                <AccordionItem key={i} value={`item-${i}`} className="bg-card rounded-xl border border-border/50 px-6">
                  <AccordionTrigger className="text-lg font-medium hover:no-underline">{t(`quiz-most:faq.q${i}`)}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">{t(`quiz-most:faq.a${i}`)}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">{t('quiz-most:cta.title')}</h2>
            <p className="text-muted-foreground mb-8">{t('quiz-most:cta.text')}</p>
            <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
              {t('quiz-most:cta.button')}
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
