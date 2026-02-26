import { Progress } from '@/components/ui/progress';
import { DistanceQuizPlayer } from '@/types/distance-quiz';
import { useLanguage } from '@/hooks/useLanguage';

interface DistanceQuizProgressProps {
  players: [DistanceQuizPlayer, DistanceQuizPlayer];
  currentPlayerIndex: 0 | 1;
  currentQuestionIndex: number;
  totalQuestions: number;
  player1Score: number;
  player2Score: number;
}

export function DistanceQuizProgress({
  players,
  currentPlayerIndex,
  currentQuestionIndex,
  totalQuestions,
  player1Score,
  player2Score,
}: DistanceQuizProgressProps) {
  const { t } = useLanguage();
  const totalAnswers = totalQuestions * 2;
  const answersGiven = currentQuestionIndex * 2 + currentPlayerIndex;
  const progressPercent = (answersGiven / totalAnswers) * 100;

  return (
    <div className="space-y-4 mb-6">
      {/* Indicateurs des joueurs avec scores */}
      <div className="flex justify-between items-center gap-4">
        <div 
          className={`flex-1 rounded-lg p-3 transition-all ${
            currentPlayerIndex === 0 
              ? 'bg-pink-500/20 border-2 border-pink-500 shadow-lg shadow-pink-500/20' 
              : 'bg-muted/50 border border-border'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`font-medium ${currentPlayerIndex === 0 ? 'text-pink-400' : 'text-muted-foreground'}`}>
              {players[0].name}
            </span>
            <span className="text-sm font-bold">{player1Score} pts</span>
          </div>
        </div>

        <div 
          className={`flex-1 rounded-lg p-3 transition-all ${
            currentPlayerIndex === 1 
              ? 'bg-blue-500/20 border-2 border-blue-500 shadow-lg shadow-blue-500/20' 
              : 'bg-muted/50 border border-border'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`font-medium ${currentPlayerIndex === 1 ? 'text-blue-400' : 'text-muted-foreground'}`}>
              {players[1].name}
            </span>
            <span className="text-sm font-bold">{player2Score} pts</span>
          </div>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{t('quizGames:question.questionXofY', { current: currentQuestionIndex + 1, total: totalQuestions })}</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>
    </div>
  );
}