import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/layout/SEOHead";
import { KnowledgeQuizEngine } from "@/components/knowledge-quiz/KnowledgeQuizEngine";
import { FloatingBlobs } from "@/components/decorations/FloatingBlobs";
import { WaveDivider } from "@/components/decorations/WaveDivider";
import {
  Brain, Heart, MessageCircle, Users, Trophy, Sparkles,
  Target, Lightbulb, Clock, Gift, Zap, Star,
} from "lucide-react";
import { useLanguage } from '@/hooks/useLanguage';
import { getLocalizedUrl, getRouteAlternates } from '@/i18n/routes';
import { generateQuizJsonLd, QUIZ_I18N } from '@/utils/json-ld-generator';
import { knowledgeQuestions } from '@/data/quizzes/quiz-knowledge-questions';

export default function QuizQuiConnait() {
  const { lang, t } = useLanguage();
  const alternates = getRouteAlternates('quizKnowledge');

  const faqItems = t('quiz-knowledge:faq.items', { returnObjects: true }) as Array<{q: string; a: string}>;
  const steps = t('quiz-knowledge:howItWorks.steps', { returnObjects: true }) as Array<{title: string; desc: string}>;
  const features = t('quiz-knowledge:whatIs.features', { returnObjects: true }) as Array<{title: string; desc: string}>;
  const benefits = t('quiz-knowledge:why.benefits', { returnObjects: true }) as Array<{title: string; desc: string}>;
  const categories = t('quiz-knowledge:examples.categories', { returnObjects: true }) as Array<{emoji: string; title: string; questions: string[]}>;
  const occasions = t('quiz-knowledge:when.occasions', { returnObjects: true }) as Array<{emoji: string; title: string; desc: string}>;
  const tips = t('quiz-knowledge:tips.items', { returnObjects: true }) as Array<{title: string; desc: string}>;

  const quizData = generateQuizJsonLd({
    id: "quiz-knowledge",
    title: t('quizzes:quizKnowledge.title'),
    description: t('quizzes:quizKnowledge.metaDescription'),
    category: "couple",
    subcategory: "connaissance",
    totalQuestions: knowledgeQuestions.length,
    questions: knowledgeQuestions,
    results: [],
    timeRequired: 600,
    lang,
    createdDate: "2026-01-23",
    t,
    translationConfig: QUIZ_I18N.knowledge,
  });

  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map(item => ({
      "@type": "Question", name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const stepIcons = [Users, MessageCircle, Heart, Trophy];
  const featureIcons = [Target, Zap, Gift];
  const benefitIcons = [Sparkles, MessageCircle, Heart, Lightbulb, Clock, Star];

  return (
    <Layout>
      <SEOHead
        title={t('quizzes:quizKnowledge.title')}
        description={t('quizzes:quizKnowledge.metaDescription')}
        canonical={getLocalizedUrl('quizKnowledge', lang)}
        jsonLd={[quizData, faqData]}
        lang={lang}
        alternates={alternates}
      />
      {/* Hero */}
      <section className="relative py-12 md:py-16 overflow-hidden">
        <FloatingBlobs variant="hero" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
              <Brain className="h-4 w-4" />
              <span className="text-sm font-medium">{t('quiz-knowledge:hero.badge')}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              {t('quiz-knowledge:hero.title1')}{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t('quiz-knowledge:hero.title2')}
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t('quiz-knowledge:hero.description')}</p>
          </div>
        </div>
      </section>

      <WaveDivider />

      {/* Quiz */}
      <section className="py-12 md:py-16" id="quiz">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto"><KnowledgeQuizEngine /></div>
        </div>
      </section>

      <WaveDivider direction="up" />

      {/* How it works */}
      <section className="relative py-12 md:py-16 overflow-hidden">
        <FloatingBlobs variant="subtle" />
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">{t('quiz-knowledge:howItWorks.title')}</h2>
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {steps.map((step, i) => {
              const Icon = stepIcons[i];
              return (
                <div key={i} className="glass-card p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* What is */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">{t('quiz-knowledge:whatIs.title')}</h2>
            <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
              <p dangerouslySetInnerHTML={{ __html: t('quiz-knowledge:whatIs.p1') }} />
              <p>{t('quiz-knowledge:whatIs.p2')}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {features.map((feat, i) => {
                const Icon = featureIcons[i];
                return (
                  <div key={i} className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-semibold">{feat.title}</h3>
                    </div>
                    <p className="text-muted-foreground text-sm">{feat.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">{t('quiz-knowledge:why.title')}</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">{t('quiz-knowledge:why.subtitle')}</p>
            <div className="grid md:grid-cols-2 gap-8">
              {[0, 1].map(col => (
                <div key={col} className="glass-card p-8 space-y-6">
                  {benefits.slice(col * 3, col * 3 + 3).map((b, i) => {
                    const Icon = benefitIcons[col * 3 + i];
                    return (
                      <div key={i} className="flex gap-4">
                        <div className="flex-shrink-0"><Icon className="h-6 w-6 text-primary" /></div>
                        <div>
                          <h3 className="font-semibold mb-1">{b.title}</h3>
                          <p className="text-muted-foreground">{b.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Examples */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">{t('quiz-knowledge:examples.title')}</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">{t('quiz-knowledge:examples.subtitle')}</p>
            <div className="grid md:grid-cols-2 gap-6">
              {categories.map((cat, i) => (
                <div key={i} className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">{cat.emoji}</span>
                    {cat.title}
                  </h3>
                  <ul className="space-y-2 text-muted-foreground">
                    {cat.questions.map((q, j) => (
                      <li key={j} className="glass-card p-3 text-sm">{q}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* When */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">{t('quiz-knowledge:when.title')}</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {occasions.map((occ, i) => (
                <div key={i} className="glass-card p-6 text-center">
                  <div className="text-4xl mb-4">{occ.emoji}</div>
                  <h3 className="font-semibold mb-2">{occ.title}</h3>
                  <p className="text-sm text-muted-foreground">{occ.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tips */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">{t('quiz-knowledge:tips.title')}</h2>
            <div className="glass-card p-8 space-y-6">
              {tips.map((tip, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">{i + 1}</div>
                  <div>
                    <h3 className="font-semibold mb-1">{tip.title}</h3>
                    <p className="text-muted-foreground">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">{t('quiz-knowledge:cta.title')}</h2>
            <p className="text-muted-foreground mb-8">{t('quiz-knowledge:cta.desc')}</p>
            <a href="#quiz" className="inline-flex items-center gap-2 h-14 px-12 text-lg rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-medium">
              <Brain className="h-5 w-5" />
              {t('quiz-knowledge:cta.button')}
            </a>
          </div>
        </div>
      </section>

      <WaveDivider />

      {/* FAQ */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">{t('quiz-knowledge:faq.title')}</h2>
            <div className="space-y-4">
              {faqItems.map((item, i) => (
                <details key={i} className="glass-card p-4 group" open={i === 0}>
                  <summary className="font-semibold cursor-pointer list-none flex justify-between items-center">
                    {item.q}
                    <span className="transform group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-4 text-muted-foreground">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}