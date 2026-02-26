import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, Users } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface DebatePlayerSetupProps {
  onStart: (name1: string, name2: string) => void;
}

export function DebatePlayerSetup({ onStart }: DebatePlayerSetupProps) {
  const { t } = useLanguage();
  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');
  const [errors, setErrors] = useState<{ name1?: string; name2?: string }>({});

  const validateAndSubmit = () => {
    const newErrors: { name1?: string; name2?: string } = {};
    
    if (!name1.trim()) {
      newErrors.name1 = t('quizGames:playerSetup.firstNameRequired');
    } else if (name1.trim().length > 70) {
      newErrors.name1 = t('quizGames:playerSetup.maxChars');
    }
    
    if (!name2.trim()) {
      newErrors.name2 = t('quizGames:playerSetup.firstNameRequired');
    } else if (name2.trim().length > 70) {
      newErrors.name2 = t('quizGames:playerSetup.maxChars');
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onStart(name1.trim(), name2.trim());
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg">
          <Users className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold">{t('quizGames:playerSetup.quizForTwo')}</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          {t('quizGames:playerSetup.quizTogetherDesc')}
        </p>
      </div>

      <div className="bg-muted/50 rounded-xl p-6 space-y-2">
        <h3 className="font-semibold flex items-center gap-2">
          <Heart className="h-4 w-4 text-pink-500" />
          {t('quizGames:playerSetup.howItWorks')}
        </h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• {t('quizGames:playerSetup.step1')}</li>
          <li>• {t('quizGames:playerSetup.step2')}</li>
          <li>• {t('quizGames:playerSetup.step3')}</li>
          <li>• {t('quizGames:playerSetup.step4')}</li>
        </ul>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-3">
          <Label htmlFor="name1" className="text-base font-medium">
            💕 {t('quizGames:playerSetup.firstFirstName')}
          </Label>
          <Input
            id="name1"
            value={name1}
            onChange={(e) => {
              setName1(e.target.value);
              if (errors.name1) setErrors({ ...errors, name1: undefined });
            }}
            placeholder="Ex: Marie"
            maxLength={70}
            className="h-12 text-base"
          />
          {errors.name1 && (
            <p className="text-sm text-destructive">{errors.name1}</p>
          )}
        </div>
        
        <div className="space-y-3">
          <Label htmlFor="name2" className="text-base font-medium">
            💕 {t('quizGames:playerSetup.secondFirstName')}
          </Label>
          <Input
            id="name2"
            value={name2}
            onChange={(e) => {
              setName2(e.target.value);
              if (errors.name2) setErrors({ ...errors, name2: undefined });
            }}
            placeholder="Ex: Thomas"
            maxLength={70}
            className="h-12 text-base"
          />
          {errors.name2 && (
            <p className="text-sm text-destructive">{errors.name2}</p>
          )}
        </div>
      </div>

      <Button 
        onClick={validateAndSubmit}
        size="lg"
        className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
      >
        <Heart className="mr-2 h-5 w-5" />
        {t('quizGames:playerSetup.startQuiz')}
      </Button>
    </div>
  );
}