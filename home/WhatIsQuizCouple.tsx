import { CheckCircle2, Heart, Sparkles } from 'lucide-react';
import quizCoupleHero from '@/assets/quiz-couple-hero.webp';
import { useLanguage } from '@/hooks/useLanguage';

export function WhatIsQuizCouple() {
  const { t } = useLanguage();
  
  const features = t('home:whatIs.features', { returnObjects: true }) as string[];
  
  return (
    <section className="section-padding">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            {/* Content */}
            <article className="space-y-6">
              <h2 className="text-3xl font-bold md:text-4xl lg:text-5xl font-display">
                {t('home:whatIs.title')} <span className="text-gradient">{t('home:whatIs.titleHighlight')}</span> ?
              </h2>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t('home:whatIs.paragraph1')} <strong className="text-foreground">{t('home:whatIs.paragraph1Highlight')}</strong> {t('home:whatIs.paragraph1End')}
              </p>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t('home:whatIs.paragraph2')} <strong className="text-foreground">{t('home:whatIs.paragraph2Highlight')}</strong>{t('home:whatIs.paragraph2End')}
              </p>
              
              <ul className="space-y-3 pt-2">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 text-foreground">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </article>
            
            {/* Illustration */}
            <aside className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-3xl" />
              <div className="relative flex flex-col gap-6">
                {/* Image principale */}
                <div className="glass-card rounded-3xl p-4 overflow-hidden">
                  <img 
                    src={quizCoupleHero} 
                    alt={t('home:whatIs.imageAlt')} 
                    className="w-full h-auto rounded-2xl object-contain"
                  />
                </div>
                
                {/* Stats en dessous */}
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="glass-card rounded-2xl p-4">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Heart className="h-5 w-5 text-primary" fill="currentColor" />
                      <span className="text-2xl font-bold text-gradient">{t('home:whatIs.stats.quizzes')}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{t('home:whatIs.stats.quizzesLabel')}</p>
                  </div>
                  <div className="glass-card rounded-2xl p-4">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <span className="text-2xl font-bold text-gradient">{t('home:whatIs.stats.questions')}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{t('home:whatIs.stats.questionsLabel')}</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
