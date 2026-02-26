import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Flame, Heart, Sparkles } from 'lucide-react';
 import { useLanguage } from '@/hooks/useLanguage';

interface CoquinPlayerSetupProps {
  onStart: (name1: string, name2: string) => void;
}

export const CoquinPlayerSetup = ({ onStart }: CoquinPlayerSetupProps) => {
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
    <div className="animate-sensual-fade">
      <Card className="glass-card-strong border-coquin-primary/30 overflow-hidden relative">
        {/* Decorative flames */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-coquin-primary via-coquin-accent to-coquin-primary" />
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-coquin-primary/10 rounded-full blur-3xl animate-heat-pulse" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-coquin-accent/10 rounded-full blur-3xl animate-heat-pulse delay-1000" />
        
        <CardContent className="p-8 relative">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center gap-2 mb-4">
              <Flame className="w-8 h-8 text-coquin-primary animate-flame-flicker" />
              <Heart className="w-6 h-6 text-coquin-secondary animate-heart-beat" />
              <Flame className="w-8 h-8 text-coquin-primary animate-flame-flicker delay-200" />
            </div>
            <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-coquin-primary to-coquin-accent bg-clip-text text-transparent">
               {t('quizGames:coquin.readyToSpice')}
            </h2>
            <p className="text-muted-foreground">
               {t('quizGames:coquin.enterNamesSpicy')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2 group">
                <Label htmlFor="name1" className="flex items-center gap-2 text-foreground">
                  <Sparkles className="w-4 h-4 text-coquin-primary" />
                   {t('quizGames:coquin.firstName1')}
                </Label>
                <Input
                  id="name1"
                  type="text"
                   placeholder={t('quizGames:coquin.yourFirstName')}
                  value={name1}
                  onChange={(e) => setName1(e.target.value.slice(0, 70))}
                  className="border-coquin-primary/30 focus:border-coquin-primary focus:ring-coquin-primary/20 transition-all duration-300 placeholder:text-muted-foreground/50"
                  maxLength={70}
                />
              </div>
              <div className="space-y-2 group">
                <Label htmlFor="name2" className="flex items-center gap-2 text-foreground">
                  <Sparkles className="w-4 h-4 text-coquin-accent" />
                   {t('quizGames:coquin.firstName2')}
                </Label>
                <Input
                  id="name2"
                  type="text"
                   placeholder={t('quizGames:coquin.theirFirstName')}
                  value={name2}
                  onChange={(e) => setName2(e.target.value.slice(0, 70))}
                  className="border-coquin-accent/30 focus:border-coquin-accent focus:ring-coquin-accent/20 transition-all duration-300 placeholder:text-muted-foreground/50"
                  maxLength={70}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={!isValid}
              className="w-full bg-gradient-to-r from-coquin-primary to-coquin-accent hover:from-coquin-primary/90 hover:to-coquin-accent/90 text-white font-semibold py-6 text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed coquin-glow group"
            >
              <Flame className="w-5 h-5 mr-2 group-hover:animate-flame-flicker" />
               {t('quizGames:coquin.lightTheFlame')}
              <Flame className="w-5 h-5 ml-2 group-hover:animate-flame-flicker delay-100" />
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
             {t('quizGames:coquin.questionsAwaiting')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
