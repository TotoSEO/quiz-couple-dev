import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { DuoPlayer, Gender } from '@/types/duo-quiz';
import { Heart, User, Users } from 'lucide-react';
 import { useLanguage } from '@/hooks/useLanguage';

interface DuoPlayerSetupProps {
  onStart: (player1: DuoPlayer, player2: DuoPlayer) => void;
}

export function DuoPlayerSetup({ onStart }: DuoPlayerSetupProps) {
   const { t } = useLanguage();
  const [player1, setPlayer1] = useState<DuoPlayer>({ name: '', gender: 'homme' });
  const [player2, setPlayer2] = useState<DuoPlayer>({ name: '', gender: 'femme' });
  const [errors, setErrors] = useState<{ player1?: string; player2?: string }>({});

  const validateAndSubmit = () => {
    const newErrors: { player1?: string; player2?: string } = {};
    
    if (!player1.name.trim()) {
       newErrors.player1 = t('quizGames:playerSetup.firstNameRequired');
    } else if (player1.name.length > 70) {
       newErrors.player1 = t('quizGames:playerSetup.maxChars');
    }
    
    if (!player2.name.trim()) {
       newErrors.player2 = t('quizGames:playerSetup.firstNameRequired');
    } else if (player2.name.length > 70) {
       newErrors.player2 = t('quizGames:playerSetup.maxChars');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onStart(
      { ...player1, name: player1.name.trim() },
      { ...player2, name: player2.name.trim() }
    );
  };

  const GenderButton = ({ 
    gender, 
    selected, 
    onClick,
    playerIndex
  }: { 
    gender: Gender; 
    selected: boolean; 
    onClick: () => void;
    playerIndex: 1 | 2;
  }) => {
    const isHomme = gender === 'homme';
    const bgColor = isHomme 
      ? selected ? 'bg-blue-500 text-white border-blue-500' : 'bg-transparent border-blue-300 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950'
      : selected ? 'bg-pink-500 text-white border-pink-500' : 'bg-transparent border-pink-300 text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-950';

    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all duration-200',
          'flex items-center justify-center gap-2',
          bgColor,
          selected && 'shadow-lg scale-105'
        )}
      >
        <User className="h-4 w-4" />
         {isHomme ? t('quizGames:playerSetup.male') : t('quizGames:playerSetup.female')}
      </button>
    );
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 text-white mb-4">
          <Users className="h-8 w-8" />
        </div>
         <h2 className="text-2xl font-bold mb-2">{t('quizGames:playerSetup.readyToPlay')}</h2>
        <p className="text-muted-foreground">
           {t('quizGames:playerSetup.enterNames')}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Player 1 */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center',
              player1.gender === 'homme' ? 'bg-blue-500' : 'bg-pink-500',
              'text-white'
            )}>
              1
            </div>
             <span>{t('quizGames:playerSetup.player1')}</span>
          </div>

          <div className="space-y-2">
             <Label htmlFor="player1-name">{t('quizGames:playerSetup.firstName')}</Label>
            <Input
              id="player1-name"
               placeholder={t('quizGames:playerSetup.enterFirstName')}
              value={player1.name}
              onChange={(e) => {
                setPlayer1({ ...player1, name: e.target.value });
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

          <div className="space-y-2">
             <Label>{t('quizGames:playerSetup.gender')}</Label>
            <div className="flex gap-3">
              <GenderButton
                gender="homme"
                selected={player1.gender === 'homme'}
                onClick={() => setPlayer1({ ...player1, gender: 'homme' })}
                playerIndex={1}
              />
              <GenderButton
                gender="femme"
                selected={player1.gender === 'femme'}
                onClick={() => setPlayer1({ ...player1, gender: 'femme' })}
                playerIndex={1}
              />
            </div>
          </div>
        </div>

        {/* Player 2 */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center',
              player2.gender === 'homme' ? 'bg-blue-500' : 'bg-pink-500',
              'text-white'
            )}>
              2
            </div>
             <span>{t('quizGames:playerSetup.player2')}</span>
          </div>

          <div className="space-y-2">
             <Label htmlFor="player2-name">{t('quizGames:playerSetup.firstName')}</Label>
            <Input
              id="player2-name"
               placeholder={t('quizGames:playerSetup.enterFirstName')}
              value={player2.name}
              onChange={(e) => {
                setPlayer2({ ...player2, name: e.target.value });
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

          <div className="space-y-2">
             <Label>{t('quizGames:playerSetup.gender')}</Label>
            <div className="flex gap-3">
              <GenderButton
                gender="homme"
                selected={player2.gender === 'homme'}
                onClick={() => setPlayer2({ ...player2, gender: 'homme' })}
                playerIndex={2}
              />
              <GenderButton
                gender="femme"
                selected={player2.gender === 'femme'}
                onClick={() => setPlayer2({ ...player2, gender: 'femme' })}
                playerIndex={2}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Button
          size="lg"
          onClick={validateAndSubmit}
          className="h-14 px-12 text-lg rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <Heart className="mr-2 h-5 w-5" />
           {t('quizGames:playerSetup.startQuiz')}
        </Button>
      </div>
    </div>
  );
}
