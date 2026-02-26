import { useKnowledgeQuiz } from '@/hooks/useKnowledgeQuiz';
import { KnowledgePlayerSetup } from './KnowledgePlayerSetup';
import { KnowledgeQuizProgress } from './KnowledgeQuizProgress';
import { KnowledgeQuizQuestion } from './KnowledgeQuizQuestion';
import { KnowledgeQuizTransition } from './KnowledgeQuizTransition';
import { KnowledgeQuizResult } from './KnowledgeQuizResult';

export function KnowledgeQuizEngine() {
  const {
    gameState,
    startGame,
    handleAnswer,
    restartGame,
    getCurrentRound,
    getCurrentQuestion,
    getPlayer,
    nextGuessingPlayerIndex,
    totalQuestions,
  } = useKnowledgeQuiz();

  const { phase, scores, currentRound, players } = gameState;

  // Setup Phase
  if (phase === 'setup') {
    return (
      <div className="glass-card p-6 md:p-8">
        <KnowledgePlayerSetup onStart={startGame} />
      </div>
    );
  }

  // Game in progress (question or transition)
  if (phase === 'question' || phase === 'transition') {
    const player1 = getPlayer(0);
    const player2 = getPlayer(1);
    const currentRoundData = getCurrentRound();
    const currentQuestion = getCurrentQuestion();

    if (!player1 || !player2 || !currentRoundData || !currentQuestion) {
      return null;
    }

    const guessingPlayer = getPlayer(currentRoundData.guessingPlayerIndex);
    const targetPlayer = getPlayer(currentRoundData.targetPlayerIndex);

    if (!guessingPlayer || !targetPlayer) return null;

    return (
      <div className="glass-card p-6 md:p-8 space-y-8">
        {/* Progress Bar */}
        <KnowledgeQuizProgress
          currentRound={currentRound}
          totalRounds={totalQuestions}
          player1Name={player1.name}
          player2Name={player2.name}
          scores={scores}
        />

        {/* Transition or Question */}
        {phase === 'transition' ? (
          <KnowledgeQuizTransition 
            nextPlayerName={getPlayer(nextGuessingPlayerIndex)?.name || ''} 
          />
        ) : (
          <KnowledgeQuizQuestion
            question={currentQuestion}
            guessingPlayerName={guessingPlayer.name}
            targetPlayerName={targetPlayer.name}
            onAnswer={handleAnswer}
          />
        )}
      </div>
    );
  }

  // Results Phase
  if (phase === 'results' && players) {
    return (
      <div className="glass-card p-6 md:p-8">
        <KnowledgeQuizResult
          player1Name={players[0].name}
          player2Name={players[1].name}
          scores={scores}
          totalQuestions={totalQuestions}
          onRestart={restartGame}
        />
      </div>
    );
  }

  return null;
}
