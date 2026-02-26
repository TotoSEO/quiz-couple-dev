import { Card, CardContent } from '@/components/ui/card';
import { Flame, ArrowRight } from 'lucide-react';
import type { CoquinQuestion } from '@/types/coquin-quiz';
import { CoquinQuizProgress } from './CoquinQuizProgress';
import { useLanguage } from '@/hooks/useLanguage';

interface CoquinQuizGuessProps {
  question: CoquinQuestion;
  roundIndex: number;
  totalRounds: number;
  progress: number;
  guessingPlayerName: string;
  targetPlayerName: string;
  onGuess: (optionId: string) => void;
}

export const CoquinQuizGuess = ({
  question,
  roundIndex,
  totalRounds,
  progress,
  guessingPlayerName,
  targetPlayerName,
  onGuess,
}: CoquinQuizGuessProps) => {
  const { t } = useLanguage();
  const questionText = question.text.replace(/NOM|NAME/g, targetPlayerName);

  return (
    <div className="space-y-6 animate-sensual-fade">
      <CoquinQuizProgress 
        current={roundIndex} 
        total={totalRounds} 
        progress={progress}
        guessingPlayerName={guessingPlayerName}
      />
      
      <Card className="glass-card-strong border-coquin-primary/30 overflow-hidden">
        <CardContent className="p-6 md:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-coquin-primary/20 border border-coquin-primary/30 mb-4">
              <span className="text-sm font-medium text-coquin-primary">
                👤 {guessingPlayerName}, {t('quizGames:coquin.guessFor')} {targetPlayerName}...
              </span>
            </div>
          </div>

          {/* Question */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-coquin-primary to-coquin-accent mb-4">
              <Flame className="w-6 h-6 text-white animate-flame-flicker" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground leading-relaxed">
              {questionText}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {question.options.map((option) => (
              <button
                key={option.id}
                onClick={() => onGuess(option.id)}
                className="w-full p-4 md:p-5 rounded-xl border-2 border-border/50 bg-card/50 hover:bg-coquin-primary/10 hover:border-coquin-primary/50 transition-all duration-300 text-left group coquin-option coquin-glow"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-coquin-primary/20 to-coquin-accent/20 border border-coquin-primary/30 flex items-center justify-center font-bold text-coquin-primary group-hover:from-coquin-primary group-hover:to-coquin-accent group-hover:text-white transition-all">
                    {option.id}
                  </div>
                  <span className="text-base md:text-lg font-medium text-foreground group-hover:text-coquin-primary transition-colors">
                    {option.text}
                  </span>
                  <ArrowRight className="w-5 h-5 ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-coquin-primary transition-all transform group-hover:translate-x-1" />
                </div>
              </button>
            ))}
          </div>

          {/* Hint */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              📱 {t('quizGames:coquin.passPhone')} <span className="font-semibold text-coquin-accent">{targetPlayerName}</span> {t('quizGames:coquin.after')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};