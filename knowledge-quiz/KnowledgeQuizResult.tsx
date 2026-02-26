import { Button } from '@/components/ui/button';
import { ShareButtons } from '@/components/shared/ShareButtons';
import { ReviewCTA } from '@/components/reviews/ReviewCTA';
import { Trophy, RefreshCw, Star } from 'lucide-react';
 import { useLanguage } from '@/hooks/useLanguage';

interface KnowledgeQuizResultProps {
  player1Name: string;
  player2Name: string;
  scores: [number, number];
  totalQuestions: number;
  onRestart: () => void;
}

export function KnowledgeQuizResult({
  player1Name,
  player2Name,
  scores,
  totalQuestions,
  onRestart,
}: KnowledgeQuizResultProps) {
   const { t } = useLanguage();
  const [score1, score2] = scores;
  const difference = Math.abs(score1 - score2);
  
  // Determine winner
  let winnerName: string;
  let loserName: string;
  let winnerScore: number;
  let loserScore: number;
  let isTie = false;

  if (score1 > score2) {
    winnerName = player1Name;
    loserName = player2Name;
    winnerScore = score1;
    loserScore = score2;
  } else if (score2 > score1) {
    winnerName = player2Name;
    loserName = player1Name;
    winnerScore = score2;
    loserScore = score1;
  } else {
    isTie = true;
    winnerName = player1Name;
    loserName = player2Name;
    winnerScore = score1;
    loserScore = score2;
  }

  // Generate result message based on score difference
  const getResultMessage = () => {
    if (isTie) {
       return t('quizGames:result.knowEachOtherWell');
    }
    if (difference > 5) {
       return `${winnerName} ${t('quizGames:result.knowsMuchBetter')} ${loserName} !`;
    }
    if (difference >= 3) {
       return `${winnerName} ${t('quizGames:result.knowsSlightlyBetter')} ${loserName}`;
    }
     return `${winnerName} ${t('quizGames:result.knowsLittleBetter')} ${loserName}`;
  };

  // Generate stars based on score
  const getStars = (score: number) => {
    const percentage = (score / totalQuestions) * 100;
    if (percentage >= 80) return 3;
    if (percentage >= 60) return 2;
    if (percentage >= 40) return 1;
    return 0;
  };

  const shareText = isTie 
    ? `${player1Name} & ${player2Name} - ${score1}/${totalQuestions} ${t('quizGames:share.each')} !`
    : `${winnerName} > ${loserName} (${winnerScore}/${totalQuestions} vs ${loserScore}/${totalQuestions}) !`;

  return (
    <div className="animate-fade-in space-y-8">
      {/* Trophy Icon */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white mb-4">
          <Trophy className="h-10 w-10" />
        </div>
      </div>

      {/* Result Message */}
      <h2 className="text-2xl md:text-3xl font-bold text-center bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
        {getResultMessage()}
      </h2>

      {/* Score Cards */}
      <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
        {/* Player 1 Score */}
        <div className="glass-card p-6 text-center min-w-[150px]">
          <h3 className="text-lg font-semibold mb-2 text-amber-600 dark:text-amber-400">
            {player1Name}
          </h3>
          <p className="text-4xl font-bold mb-2">
            {score1}/{totalQuestions}
          </p>
          <div className="flex justify-center gap-1">
            {Array.from({ length: getStars(score1) }).map((_, i) => (
              <Star key={i} className="h-5 w-5 text-amber-500 fill-amber-500" />
            ))}
            {Array.from({ length: 3 - getStars(score1) }).map((_, i) => (
              <Star key={i} className="h-5 w-5 text-muted-foreground/30" />
            ))}
          </div>
        </div>

        {/* VS */}
        <div className="text-2xl font-bold text-muted-foreground">VS</div>

        {/* Player 2 Score */}
        <div className="glass-card p-6 text-center min-w-[150px]">
          <h3 className="text-lg font-semibold mb-2 text-orange-600 dark:text-orange-400">
            {player2Name}
          </h3>
          <p className="text-4xl font-bold mb-2">
            {score2}/{totalQuestions}
          </p>
          <div className="flex justify-center gap-1">
            {Array.from({ length: getStars(score2) }).map((_, i) => (
              <Star key={i} className="h-5 w-5 text-orange-500 fill-orange-500" />
            ))}
            {Array.from({ length: 3 - getStars(score2) }).map((_, i) => (
              <Star key={i} className="h-5 w-5 text-muted-foreground/30" />
            ))}
          </div>
        </div>
      </div>

      {/* Personalized Message */}
      <div className="glass-card p-6 text-center">
        <p className="text-muted-foreground">
          {isTie 
             ? t('quizGames:result.perfectTie')
            : difference > 5 
               ? `${winnerName} ${t('quizGames:result.aheadKnowledge')} ${loserName}, ${t('quizGames:result.timeToAskQuestions')}` 
               : t('quizGames:result.knowEachOtherPrettyWell')}
        </p>
      </div>

      {/* Review CTA */}
      <ReviewCTA variant="compact" />

      {/* Actions */}
      <div className="flex flex-col gap-4 items-center">
        <Button
          size="lg"
          onClick={onRestart}
          className="h-14 px-12 text-lg rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <RefreshCw className="mr-2 h-5 w-5" />
           {t('quizGames:result.restartOtherQuestions')}
        </Button>
        
        <ShareButtons
          title={t('quizGames:result.quizResults')}
          text={shareText}
        />
      </div>
    </div>
  );
}
