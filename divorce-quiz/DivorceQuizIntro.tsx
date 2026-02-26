import { Button } from '@/components/ui/button';
import { Heart, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface DivorceQuizIntroProps {
  onStart: () => void;
}

export function DivorceQuizIntro({ onStart }: DivorceQuizIntroProps) {
  const { t } = useLanguage();

  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="mb-8 space-y-6">
        <p className="text-lg text-foreground leading-relaxed">
          {t('quiz-divorce:quiz.introP1')}
        </p>

        <p className="text-muted-foreground leading-relaxed">
          {t('quiz-divorce:quiz.introP2')}
        </p>

        <div className="rounded-xl border border-border bg-muted/30 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
            <p className="text-sm text-muted-foreground text-left">
              <strong className="text-foreground">{t('quiz-divorce:quiz.introImportant')}</strong><br />
              {t('quiz-divorce:quiz.introDisclaimer')}
            </p>
          </div>
        </div>
      </div>

      <Button
        size="lg"
        onClick={onStart}
        className="px-8 py-6 text-lg gap-2"
      >
        <Heart className="h-5 w-5" />
        {t('quiz-divorce:quiz.startButton')}
      </Button>

      <p className="mt-3 text-sm font-medium text-muted-foreground">
        {t('quizzes:testDivorce.startSubtitle')}
      </p>

      <p className="mt-1 text-sm text-muted-foreground">
        {t('quiz-divorce:quiz.startMeta')}
      </p>
    </div>
  );
}
