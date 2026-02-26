import { Button } from '@/components/ui/button';
import { ArrowRight, Heart, Sparkles, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FloatingBlobs } from '@/components/decorations/FloatingBlobs';
import { useLanguage } from '@/hooks/useLanguage';

export function Hero() {
  const { t, getPath } = useLanguage();
  
  return (
    <section className="relative overflow-hidden py-20 md:py-28 lg:py-36">
      {/* Background Decorations */}
      <FloatingBlobs variant="hero" />
      <div className="gradient-hero absolute inset-0" />
      
      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-5 py-2.5 text-sm font-medium text-primary animate-fade-in-up">
            <Sparkles className="h-4 w-4" />
            <span>{t('home:hero.badge')}</span>
            <Heart className="h-4 w-4" fill="currentColor" />
          </div>
          
          {/* H1 - SEO Optimized */}
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl xl:text-7xl font-display animate-fade-in-up delay-100">
            {t('home:hero.title')}{' '}
            <span className="text-gradient">{t('home:hero.titleHighlight')}</span> !
          </h1>
          
          {/* Introduction */}
          <p className="text-lg text-muted-foreground md:text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-200">
            {t('home:hero.description')}
            <span className="text-foreground font-medium"> {t('home:hero.descriptionHighlight')}</span>
          </p>
          
          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 py-4 animate-fade-in-up delay-300">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">{t('home:hero.stats.couples')}</span>
              <span>{t('home:hero.stats.couplesLabel')}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Heart className="h-5 w-5 text-primary" fill="currentColor" />
              <span className="font-semibold text-foreground">{t('home:hero.stats.quizzes')}</span>
              <span>{t('home:hero.stats.quizzesLabel')}</span>
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center animate-fade-in-up delay-400">
            <Button asChild size="lg" className="gap-2 glow-primary text-lg px-8 py-6 rounded-2xl font-semibold">
              <Link to={getPath('testCouple')}>
                {t('home:hero.cta')}
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 rounded-2xl border-2 hover:bg-primary/5">
              <Link to={getPath('questionsCouple')}>
                {t('home:hero.ctaSecondary')}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
