import { Plus, Minus, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MostPlayer } from '@/types/most-quiz';
import { useLanguage } from '@/hooks/useLanguage';

interface MostPlayerSetupProps {
  players: MostPlayer[];
  onAddPlayer: () => void;
  onRemovePlayer: (playerId: string) => void;
  onUpdatePlayerName: (playerId: string, name: string) => void;
  onStartQuiz: () => void;
  canStart: boolean;
  getPlayerLetter: (index: number) => string;
}

export function MostPlayerSetup({
  players,
  onAddPlayer,
  onRemovePlayer,
  onUpdatePlayerName,
  onStartQuiz,
  canStart,
  getPlayerLetter,
}: MostPlayerSetupProps) {
  const { t } = useLanguage();

  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl border-primary/20 bg-card/80 backdrop-blur">
      <CardHeader className="text-center pb-2">
        <div className="flex justify-center mb-3">
          <div className="p-3 rounded-full bg-primary/10">
            <Users className="h-8 w-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl">{t('quizGames:playerSetup.whoParticipates')}</CardTitle>
        <p className="text-muted-foreground mt-2">
          {t('quizGames:playerSetup.addPlayers')}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Liste des joueurs */}
        <div className="space-y-3">
          {players.map((player, index) => (
            <div key={player.id} className="flex items-center gap-3 animate-fade-in">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                {getPlayerLetter(index)}
              </div>
              <Input
                type="text"
                placeholder={`${t('quizGames:playerSetup.playerName')} ${getPlayerLetter(index)}`}
                value={player.name}
                onChange={(e) => onUpdatePlayerName(player.id, e.target.value)}
                className="flex-1 text-lg"
                maxLength={20}
              />
              {players.length > 2 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemovePlayer(player.id)}
                  className="flex-shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  aria-label={`${t('quizGames:playerSetup.removePlayer')} ${player.name || getPlayerLetter(index)}`}
                >
                  <Minus className="h-5 w-5" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Bouton ajouter joueur */}
        {players.length < 8 && (
          <Button
            variant="outline"
            onClick={onAddPlayer}
            className="w-full border-dashed border-2 hover:border-primary hover:bg-primary/5"
          >
            <Plus className="h-5 w-5 mr-2" />
            {t('quizGames:playerSetup.addPlayer')} ({players.length}/8)
          </Button>
        )}

        {/* Bouton démarrer */}
        <Button
          onClick={onStartQuiz}
          disabled={!canStart}
          size="lg"
          className="w-full text-lg font-semibold mt-6 gap-2"
        >
          {t('quizGames:playerSetup.startQuiz')}
          <ArrowRight className="h-5 w-5" />
        </Button>

        {!canStart && players.some(p => p.name.trim() === '') && (
          <p className="text-center text-sm text-muted-foreground">
            {t('quizGames:playerSetup.fillAllNames')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}