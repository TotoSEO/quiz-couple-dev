import { MousePointerClick, MessageCircle, Trophy } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export function HowItWorks() {
  const { t } = useLanguage();
  
  const steps = [
    {
      icon: MousePointerClick,
      stepKey: 'home:howItWorks.steps.choose.step',
      titleKey: 'home:howItWorks.steps.choose.title',
      descriptionKey: 'home:howItWorks.steps.choose.description'
    },
    {
      icon: MessageCircle,
      stepKey: 'home:howItWorks.steps.answer.step',
      titleKey: 'home:howItWorks.steps.answer.title',
      descriptionKey: 'home:howItWorks.steps.answer.description'
    },
    {
      icon: Trophy,
      stepKey: 'home:howItWorks.steps.results.step',
      titleKey: 'home:howItWorks.steps.results.title',
      descriptionKey: 'home:howItWorks.steps.results.description'
    }
  ];

  return (
    <section className="section-padding">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl font-bold md:text-4xl lg:text-5xl font-display mb-4">
            {t('home:howItWorks.title')} <span className="text-gradient">{t('home:howItWorks.titleHighlight')}</span> ?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('home:howItWorks.subtitle')}
          </p>
        </div>
        
        <div className="max-w-5xl mx-auto">
          <div className="grid gap-8 md:grid-cols-3 relative">
            {/* Connecting Line (desktop only) */}
            <div className="hidden md:block absolute top-16 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-primary/50 via-secondary/50 to-primary/50" />
            
            {steps.map((step, index) => (
              <div 
                key={index} 
                className="relative animate-fade-in-up text-center"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Step Number */}
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse-soft" />
                  <div className="relative w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-primary to-secondary p-1">
                    <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                      <step.icon className="h-12 w-12 text-primary" />
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-white text-lg font-display">
                    {t(step.stepKey)}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold font-display mb-3">
                  {t(step.titleKey)}
                </h3>
                <p className="text-muted-foreground max-w-xs mx-auto">
                  {t(step.descriptionKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
