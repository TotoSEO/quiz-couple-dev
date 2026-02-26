import { Target } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface KnowledgeQuizTransitionProps {
  nextPlayerName: string;
}

export function KnowledgeQuizTransition({ nextPlayerName }: KnowledgeQuizTransitionProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-white animate-bounce">
          <Target className="h-10 w-10" />
        </div>
        
        <div className="space-y-2">
          <p className="text-xl text-muted-foreground">{t('quizGames:question.turnOfToGuess')}</p>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent animate-pulse">
            {nextPlayerName}
          </h2>
        </div>
        
        <p className="text-lg text-muted-foreground animate-fade-in">
          {t('quizGames:question.getReadyToGuess')}
        </p>
      </div>
    </div>
  );
}