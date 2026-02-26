import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
 import { useLanguage } from '@/hooks/useLanguage';

interface ToxicQuizIntroProps {
  onStart: () => void;
}

export function ToxicQuizIntro({ onStart }: ToxicQuizIntroProps) {
   const { t } = useLanguage();
 
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="mb-8 space-y-6">
        <p className="text-lg text-foreground leading-relaxed">
           {t('quizGames:toxic.introQuestion')}<br />
          <span className="font-medium italic">
             {t('quizGames:toxic.introQuote')}
          </span>
        </p>

        <p className="text-muted-foreground leading-relaxed">
           {t('quizGames:toxic.introDesc')}
        </p>

        <div className="rounded-xl border border-border bg-muted/30 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
            <p className="text-sm text-muted-foreground text-left">
               <strong className="text-foreground">{t('quizGames:toxic.disclaimer')}</strong><br />
               {t('quizGames:toxic.disclaimerDesc')}
            </p>
          </div>
        </div>
      </div>

      <Button 
        size="lg" 
        onClick={onStart}
        className="px-8 py-6 text-lg"
      >
         {t('quizGames:toxic.takeTest')}
      </Button>

      <p className="mt-4 text-sm text-muted-foreground">
         {t('quizGames:toxic.testInfo')}
      </p>
    </div>
  );
}
