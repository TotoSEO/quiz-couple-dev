import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, User } from 'lucide-react';
 import { useLanguage } from '@/hooks/useLanguage';

interface FunnyPlayerSetupProps {
  onStart: (name1: string, name2: string) => void;
}

export function FunnyPlayerSetup({ onStart }: FunnyPlayerSetupProps) {
   const { t } = useLanguage();
  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name1.trim() && name2.trim()) {
      onStart(name1.trim(), name2.trim());
    }
  };

  const isValid = name1.trim().length > 0 && name2.trim().length > 0;

  return (
    <Card className="w-full max-w-md mx-auto border-primary/20 bg-card/80 backdrop-blur-sm">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
         <CardTitle className="text-2xl">{t('quizGames:playerSetup.readyToLaugh')}</CardTitle>
        <CardDescription>
           {t('quizGames:playerSetup.enterNamesFun')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="player1" className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                 {t('quizGames:playerSetup.firstPlayer')}
              </Label>
              <Input
                id="player1"
                type="text"
                 placeholder={t('quizGames:playerSetup.player1Placeholder')}
                value={name1}
                onChange={(e) => setName1(e.target.value)}
                className="bg-background/50"
                maxLength={20}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="player2" className="flex items-center gap-2">
                <User className="h-4 w-4 text-secondary-foreground" />
                 {t('quizGames:playerSetup.secondPlayer')}
              </Label>
              <Input
                id="player2"
                type="text"
                 placeholder={t('quizGames:playerSetup.player2Placeholder')}
                value={name2}
                onChange={(e) => setName2(e.target.value)}
                className="bg-background/50"
                maxLength={20}
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full text-lg py-6"
            size="lg"
            disabled={!isValid}
          >
            <Sparkles className="mr-2 h-5 w-5" />
             {t('quizGames:playerSetup.startQuiz')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
