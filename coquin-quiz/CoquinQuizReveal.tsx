import { Card, CardContent } from '@/components/ui/card';
import { Unlock, Eye } from 'lucide-react';
import type { CoquinQuestion } from '@/types/coquin-quiz';
import { useLanguage } from '@/hooks/useLanguage';
import i18n from 'i18next';

interface CoquinQuizRevealProps {
  question: CoquinQuestion;
  targetPlayerName: string;
  guessingPlayerName: string;
  guessedOptionId: string;
  onReveal: (optionId: string) => void;
}

export const CoquinQuizReveal = ({
  question,
  targetPlayerName,
  guessingPlayerName,
  guessedOptionId,
  onReveal,
}: CoquinQuizRevealProps) => {
  const { t } = useLanguage();
  const lang = i18n.language || 'fr';

  // Reformulate question for reveal phase (second person) - language-aware
  let questionText = question.text;
  
  if (lang === 'fr') {
    questionText = questionText
      .replace(/Quelle est la position préférée de NOM/g, 'Quelle est ta position préférée')
      .replace(/NOM préfère/g, 'Tu préfères')
      .replace(/NOM est plutôt/g, 'Tu es plutôt')
      .replace(/NOM aime/g, 'Tu aimes')
      .replace(/NOM a /g, 'Tu as ')
      .replace(/Pour NOM/g, 'Pour toi')
      .replace(/Après l'amour, NOM/g, 'Après l\'amour, tu')
      .replace(/Quand NOM/g, 'Quand tu')
      .replace(/Ce qui .+ chez NOM/g, (match) => match.replace('NOM', 'toi'))
      .replace(/chez NOM/g, 'chez toi')
      .replace(/NOM se sent/g, 'Tu te sens')
      .replace(/NOM trouve/g, 'Tu trouves')
      .replace(/NOM réagit/g, 'Tu réagis')
      .replace(/NOM vit/g, 'Tu vis')
      .replace(/NOM considère/g, 'Tu considères')
      .replace(/NOM accorde/g, 'Tu accordes')
      .replace(/NOM/g, 'toi');
  } else {
    // For other languages, simply replace NAME/NOM with "you"
    const youWord: Record<string, string> = { en: 'you', es: 'ti', de: 'du', it: 'te' };
    questionText = questionText.replace(/NAME|NOM/g, youWord[lang] || 'you');
  }
  
  const guessedOption = question.options.find(o => o.id === guessedOptionId);

  return (
    <div className="space-y-6 animate-sensual-fade">
      <Card className="glass-card-strong border-coquin-accent/30 overflow-hidden">
        <CardContent className="p-6 md:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-coquin-accent/20 border border-coquin-accent/30 mb-4">
              <Unlock className="w-4 h-4 text-coquin-accent" />
              <span className="text-sm font-medium text-coquin-accent">
                {targetPlayerName}, {t('quizGames:coquin.revealAnswer')}
              </span>
            </div>
          </div>

          {/* Question */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-coquin-accent to-coquin-primary mb-4">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground leading-relaxed">
              {questionText}
            </h2>
          </div>

          {/* What was guessed */}
          <div className="mb-6 p-4 rounded-xl bg-muted/50 border border-border/50">
            <p className="text-sm text-muted-foreground mb-1">
              {guessingPlayerName} {t('quizGames:coquin.guessed')}
            </p>
            <p className="font-semibold text-foreground flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-coquin-primary/20 text-coquin-primary text-xs font-bold">
                {guessedOptionId}
              </span>
              {guessedOption?.text} 🤔
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {question.options.map((option) => (
              <button
                key={option.id}
                onClick={() => onReveal(option.id)}
                className="w-full p-4 md:p-5 rounded-xl border-2 border-border/50 bg-card/50 hover:bg-coquin-accent/10 hover:border-coquin-accent/50 transition-all duration-300 text-left group coquin-option"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-coquin-accent/20 to-coquin-primary/20 border border-coquin-accent/30 flex items-center justify-center font-bold text-coquin-accent group-hover:from-coquin-accent group-hover:to-coquin-primary group-hover:text-white transition-all">
                    {option.id}
                  </div>
                  <span className="text-base md:text-lg font-medium text-foreground group-hover:text-coquin-accent transition-colors">
                    {option.text}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Hint */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              💕 {t('quizGames:coquin.beHonest')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};