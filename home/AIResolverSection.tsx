import { Brain, ArrowRight, Shield, Heart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';

export function AIResolverSection() {
  const { t, getPath } = useLanguage();
  
  return (
    <section className="relative section-padding bg-gradient-to-b from-background to-muted/30 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-secondary/5 rounded-full blur-3xl" />
      </div>
      
      <div className="container relative mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="text-center mb-8 md:mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">{t('home:aiResolver.badge')}</span>
            </div>
            
            <h2 className="text-3xl font-bold md:text-4xl lg:text-5xl font-display mb-4">
              {t('home:aiResolver.title')}{' '}
              <span className="text-gradient">{t('home:aiResolver.titleHighlight')}</span>
            </h2>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('home:aiResolver.description')}{' '}
              <strong>{t('home:aiResolver.descriptionHighlight')}</strong>{' '}
              {t('home:aiResolver.descriptionEnd')}
            </p>
          </header>
          
          {/* Card */}
          <div className="glass-card p-6 md:p-8 rounded-2xl">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-center">
              {/* Icon */}
              <div className="flex-shrink-0">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                  <Brain className="h-10 w-10 md:h-12 md:w-12 text-white" />
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1 text-center lg:text-left space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl md:text-2xl font-bold">
                    {t('home:aiResolver.cardTitle')}
                  </h3>
                  <p className="text-muted-foreground">
                    {t('home:aiResolver.cardDescription')}
                  </p>
                </div>
                
                {/* Features */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Shield className="h-4 w-4 text-emerald-500" />
                    <span>{t('home:aiResolver.features.confidential')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Heart className="h-4 w-4 text-primary" />
                    <span>{t('home:aiResolver.features.free')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Brain className="h-4 w-4 text-secondary" />
                    <span>{t('home:aiResolver.features.impartial')}</span>
                  </div>
                </div>
              </div>
              
              {/* CTA */}
              <div className="flex-shrink-0">
                <Button asChild size="lg" className="rounded-xl shadow-lg group">
                  <Link to={getPath('problemResolver')}>
                    {t('home:aiResolver.cta')}
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
