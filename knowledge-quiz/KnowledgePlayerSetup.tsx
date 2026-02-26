import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { KnowledgePlayer } from '@/types/knowledge-quiz';
import { Brain, Users } from 'lucide-react';
 import { useLanguage } from '@/hooks/useLanguage';

interface KnowledgePlayerSetupProps {
  onStart: (player1: KnowledgePlayer, player2: KnowledgePlayer) => void;
}

export function KnowledgePlayerSetup({ onStart }: KnowledgePlayerSetupProps) {
   const { t } = useLanguage();
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [errors, setErrors] = useState<{ player1?: string; player2?: string }>({});

  const validateAndSubmit = () => {
    const newErrors: { player1?: string; player2?: string } = {};
    
    if (!player1Name.trim()) {
       newErrors.player1 = t('quizGames:playerSetup.firstNameRequired');
    } else if (player1Name.length > 70) {
       newErrors.player1 = t('quizGames:playerSetup.maxChars');
    }
    
    if (!player2Name.trim()) {
       newErrors.player2 = t('quizGames:playerSetup.firstNameRequired');
    } else if (player2Name.length > 70) {
       newErrors.player2 = t('quizGames:playerSetup.maxChars');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onStart(
      { name: player1Name.trim() },
      { name: player2Name.trim() }
    );
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-white mb-4">
          <Users className="h-8 w-8" />
        </div>
         <h2 className="text-2xl font-bold mb-2">{t('quizGames:playerSetup.whoKnowsBest')}</h2>
        <p className="text-muted-foreground">
           {t('quizGames:playerSetup.discoverWhoKnows')}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Player 1 */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-amber-500 text-white">
              1
            </div>
             <span>{t('quizGames:playerSetup.player1')}</span>
          </div>

          <div className="space-y-2">
             <Label htmlFor="player1-name">{t('quizGames:playerSetup.firstName')}</Label>
            <Input
              id="player1-name"
               placeholder={t('quizGames:playerSetup.enterFirstName')}
              value={player1Name}
              onChange={(e) => {
                setPlayer1Name(e.target.value);
                if (errors.player1) setErrors({ ...errors, player1: undefined });
              }}
              maxLength={70}
              className={cn(
                'h-12 text-lg rounded-xl',
                errors.player1 && 'border-destructive'
              )}
            />
            {errors.player1 && (
              <p className="text-sm text-destructive">{errors.player1}</p>
            )}
          </div>
        </div>

        {/* Player 2 */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-orange-500 text-white">
              2
            </div>
             <span>{t('quizGames:playerSetup.player2')}</span>
          </div>

          <div className="space-y-2">
             <Label htmlFor="player2-name">{t('quizGames:playerSetup.firstName')}</Label>
            <Input
              id="player2-name"
               placeholder={t('quizGames:playerSetup.enterFirstName')}
              value={player2Name}
              onChange={(e) => {
                setPlayer2Name(e.target.value);
                if (errors.player2) setErrors({ ...errors, player2: undefined });
              }}
              maxLength={70}
              className={cn(
                'h-12 text-lg rounded-xl',
                errors.player2 && 'border-destructive'
              )}
            />
            {errors.player2 && (
              <p className="text-sm text-destructive">{errors.player2}</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Button
          size="lg"
          onClick={validateAndSubmit}
          className="h-14 px-12 text-lg rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <Brain className="mr-2 h-5 w-5" />
           {t('quizGames:playerSetup.startQuiz')}
        </Button>
      </div>
    </div>
  );
}
