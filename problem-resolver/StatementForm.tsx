import { useState } from 'react';
import { MessageSquare, Lightbulb, Eye, EyeOff, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { Person } from '@/types/problem-resolver';
import { useLanguage } from '@/hooks/useLanguage';

interface StatementFormProps {
  person: Person;
  personIndex: number;
  totalPersons: number;
  onSubmit: (statement: string) => void;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

export function StatementForm({ 
  person, 
  personIndex, 
  totalPersons, 
  onSubmit 
}: StatementFormProps) {
  const { t } = useLanguage();
  const [statement, setStatement] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);

  const wordCount = countWords(statement);
  const maxWords = 500;

  const validate = (): boolean => {
    if (!statement.trim()) {
      setError(t('quizGames:problemResolver.enterYourVersion'));
      return false;
    }
    if (wordCount > maxWords) {
      setError(t('quizGames:problemResolver.maxWordsError', { max: maxWords }));
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(statement.trim());
    }
  };

  const personColors = [
    'from-rose-500 to-pink-500',
    'from-blue-500 to-indigo-500',
    'from-emerald-500 to-teal-500',
    'from-amber-500 to-orange-500',
  ];

  const bgColors = [
    'bg-rose-500/10 border-rose-500/30',
    'bg-blue-500/10 border-blue-500/30',
    'bg-emerald-500/10 border-emerald-500/30',
    'bg-amber-500/10 border-amber-500/30',
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className={`inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br ${personColors[personIndex]} shadow-lg`}>
          <User className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
        </div>
        
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 text-muted-foreground text-xs sm:text-sm">
            <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="font-medium">
              {t('quizGames:problemResolver.turnXofY', { current: personIndex + 1, total: totalPersons })}
            </span>
          </div>
          
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">
            {t('quizGames:problemResolver.itsTurnOf')}{' '}
            <span className={`bg-gradient-to-r ${personColors[personIndex]} bg-clip-text text-transparent`}>
              {person.name}
            </span>
          </h2>
          
          <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto px-2">
            {person.name}, {t('quizGames:problemResolver.explainYourVersion')}
          </p>
        </div>
      </div>

      {/* Zone de texte */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="statement" className="text-base font-semibold flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${personColors[personIndex]}`} />
            {t('quizGames:problemResolver.yourVersion')}
          </Label>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsPrivacyMode(!isPrivacyMode)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {isPrivacyMode ? (
              <>
                <EyeOff className="h-3.5 w-3.5 mr-1.5" />
                {t('quizGames:problemResolver.hideMode')}
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5 mr-1.5" />
                {t('quizGames:problemResolver.privacyMode')}
              </>
            )}
          </Button>
        </div>

        <div className={`relative rounded-xl border-2 transition-colors ${bgColors[personIndex]}`}>
          <Textarea
            id="statement"
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
            placeholder={`${person.name}, ${t('quizGames:problemResolver.contextPlaceholder')}`}
            rows={8}
            className={`resize-none text-base bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 ${
              isPrivacyMode ? 'text-transparent selection:text-transparent caret-foreground' : ''
            }`}
            style={isPrivacyMode ? { 
              textShadow: '0 0 8px currentColor',
              WebkitTextSecurity: 'disc'
            } as React.CSSProperties : undefined}
          />
        </div>
        
        <div className="flex justify-between items-center text-xs">
          <span>
            {error && <span className="text-destructive font-medium">{error}</span>}
          </span>
          <span className={`font-medium ${
            wordCount > maxWords 
              ? 'text-destructive' 
              : wordCount > maxWords * 0.8 
                ? 'text-amber-500' 
                : 'text-muted-foreground'
          }`}>
            {wordCount}/{maxWords} {t('quizGames:problemResolver.words')}
          </span>
        </div>
      </div>

      {/* Conseil */}
      <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
        <div className="flex gap-2 sm:gap-3">
          <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
            <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-foreground text-xs sm:text-sm mb-1">{t('quizGames:problemResolver.adviceTitle')}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t('quizGames:problemResolver.adviceText')}
            </p>
          </div>
        </div>
      </div>

      {/* Avertissement vie privée */}
      {personIndex < totalPersons - 1 && (
        <div className="p-2 sm:p-3 rounded-lg bg-primary/5 border border-primary/20 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground">
            🔒 {t('quizGames:problemResolver.passDeviceTo')} {t('quizGames:problemResolver.textNotVisible')}
          </p>
        </div>
      )}

      <Button 
        type="submit" 
        size="lg" 
        className={`w-full bg-gradient-to-r ${personColors[personIndex]} hover:opacity-90 text-white shadow-lg`}
      >
        {t('quizGames:problemResolver.validateMyVersion')}
      </Button>
    </form>
  );
}