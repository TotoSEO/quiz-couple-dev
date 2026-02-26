import { Button } from '@/components/ui/button';
import { ArrowRight, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FloatingBlobs } from '@/components/decorations/FloatingBlobs';
import { useLanguage } from '@/hooks/useLanguage';

export function FinalCTA() {
  const { t, getPath } = useLanguage();
  
  return (
    <section className="relative section-padding overflow-hidden">
      <FloatingBlobs variant="hero" />
      <div className="gradient-hero absolute inset-0" />
      
      <div className="container relative mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary animate-pulse-soft">
            <Heart className="h-10 w-10 text-white" fill="currentColor" />
          </div>
          
          <h2 className="text-3xl font-bold md:text-4xl lg:text-5xl font-display">
            {t('home:finalCTA.title')} <span className="text-gradient">{t('home:finalCTA.titleHighlight')}</span> ?
          </h2>
          
          <p className="text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto">
            {t('home:finalCTA.description')}
          </p>
          
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center pt-4">
            <Button asChild size="lg" className="gap-2 glow-primary text-lg px-10 py-7 rounded-2xl font-semibold">
              <Link to={getPath('testCouple')}>
                {t('home:finalCTA.button')}
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground">
            {t('home:finalCTA.socialProof')} <strong className="text-foreground">{t('home:finalCTA.socialProofCount')}</strong> {t('home:finalCTA.socialProofEnd')}
          </p>
        </div>
      </div>
    </section>
  );
}
