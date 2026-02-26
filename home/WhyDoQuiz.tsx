import { 
  Heart, 
  Gamepad2, 
  Search, 
  Link2, 
  MessageSquare, 
  Camera 
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export function WhyDoQuiz() {
  const { t } = useLanguage();
  
  const reasons = [
    {
      icon: Heart,
      titleKey: 'home:whyDoQuiz.reasons.testRelation.title',
      descriptionKey: 'home:whyDoQuiz.reasons.testRelation.description'
    },
    {
      icon: Gamepad2,
      titleKey: 'home:whyDoQuiz.reasons.haveFun.title',
      descriptionKey: 'home:whyDoQuiz.reasons.haveFun.description'
    },
    {
      icon: Search,
      titleKey: 'home:whyDoQuiz.reasons.discover.title',
      descriptionKey: 'home:whyDoQuiz.reasons.discover.description'
    },
    {
      icon: Link2,
      titleKey: 'home:whyDoQuiz.reasons.strengthen.title',
      descriptionKey: 'home:whyDoQuiz.reasons.strengthen.description'
    },
    {
      icon: MessageSquare,
      titleKey: 'home:whyDoQuiz.reasons.dialogue.title',
      descriptionKey: 'home:whyDoQuiz.reasons.dialogue.description'
    },
    {
      icon: Camera,
      titleKey: 'home:whyDoQuiz.reasons.memories.title',
      descriptionKey: 'home:whyDoQuiz.reasons.memories.description'
    }
  ];

  return (
    <section className="section-padding bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl font-bold md:text-4xl lg:text-5xl font-display mb-4">
            {t('home:whyDoQuiz.title')} <span className="text-gradient">{t('home:whyDoQuiz.titleHighlight')}</span> ?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('home:whyDoQuiz.subtitle')}
          </p>
        </div>
        
        <div className="grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {reasons.map((reason, index) => (
            <article 
              key={index} 
              className="group relative animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
              <div className="relative glass-card rounded-3xl p-6 md:p-8 h-full transition-all duration-300 group-hover:border-primary/30 group-hover:shadow-lg">
                <div className="mb-4">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 group-hover:from-primary/30 group-hover:to-secondary/30 transition-colors">
                    <reason.icon className="h-7 w-7 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold font-display mb-3 group-hover:text-primary transition-colors">
                  {t(reason.titleKey)}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t(reason.descriptionKey)}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
