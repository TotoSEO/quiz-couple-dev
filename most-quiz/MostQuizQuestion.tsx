import { UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MostPlayer, MostQuestion } from '@/types/most-quiz';
import { useLanguage } from '@/hooks/useLanguage';

interface MostQuizQuestionProps {
  question: MostQuestion;
  players: MostPlayer[];
  onAnswer: (playerId: string | null) => void;
  getPlayerLetter: (index: number) => string;
}

export function MostQuizQuestion({
  question,
  players,
  onAnswer,
  getPlayerLetter,
}: MostQuizQuestionProps) {
  const { t } = useLanguage();

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="mb-8 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30 shadow-lg">
        <CardContent className="pt-8 pb-8 px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-center leading-relaxed">
            {question.text}
          </h2>
        </CardContent>
      </Card>

      <p className="text-center text-muted-foreground mb-6">
        {t('quizGames:question.voteInstruction')}
      </p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {players.map((player, index) => (
          <Button
            key={player.id}
            variant="outline"
            onClick={() => onAnswer(player.id)}
            className="h-auto py-4 px-4 flex items-center gap-3 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-sm">
              {getPlayerLetter(index)}
            </div>
            <span className="font-medium text-lg truncate">{player.name}</span>
          </Button>
        ))}
      </div>

      <Button
        variant="secondary"
        onClick={() => onAnswer(null)}
        className="w-full h-auto py-4 flex items-center justify-center gap-3 hover:bg-secondary/80 transition-all duration-200"
      >
        <UserX className="h-5 w-5" />
        <span className="font-medium text-lg">{t('quizGames:question.nobody')}</span>
      </Button>
    </div>
  );
}
