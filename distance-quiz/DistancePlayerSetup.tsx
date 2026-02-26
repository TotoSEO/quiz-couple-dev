import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Heart } from 'lucide-react';
 import { useLanguage } from '@/hooks/useLanguage';

interface DistancePlayerSetupProps {
  onStart: (player1Name: string, player2Name: string) => void;
}

export function DistancePlayerSetup({ onStart }: DistancePlayerSetupProps) {
   const { t } = useLanguage();
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (player1Name.trim() && player2Name.trim()) {
      onStart(player1Name.trim(), player2Name.trim());
    }
  };

  const isValid = player1Name.trim().length > 0 && player2Name.trim().length > 0;

  return (
    <Card className="w-full max-w-md mx-auto border-primary/20 bg-card/50 backdrop-blur">
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
          <MapPin className="w-8 h-8 text-primary" />
        </div>
         <CardTitle className="text-2xl">{t('quizGames:playerSetup.readyForTest')}</CardTitle>
        <CardDescription className="text-base">
           {t('quizGames:playerSetup.discoverCompatibility')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="player1" className="text-sm font-medium flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-500" />
                 {t('quizGames:playerSetup.firstFirstName')}
              </label>
              <Input
                id="player1"
                type="text"
                placeholder="Ex: Marie"
                value={player1Name}
                onChange={(e) => setPlayer1Name(e.target.value)}
                className="h-12 text-lg"
                maxLength={20}
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="player2" className="text-sm font-medium flex items-center gap-2">
                <Heart className="w-4 h-4 text-blue-500" />
                 {t('quizGames:playerSetup.secondFirstName')}
              </label>
              <Input
                id="player2"
                type="text"
                placeholder="Ex: Thomas"
                value={player2Name}
                onChange={(e) => setPlayer2Name(e.target.value)}
                className="h-12 text-lg"
                maxLength={20}
                autoComplete="off"
              />
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={!isValid}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
          >
             {t('quizGames:playerSetup.startQuiz')}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
             {t('quizGames:playerSetup.questionsCount')}
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
