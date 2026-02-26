import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, ArrowRight, Link2, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Props {
  onCreateSession: (name: string) => Promise<void>;
  onJoinSession: (name: string, code: string) => Promise<void>;
  error: string | null;
  loading: boolean;
}

export function AdoPlayerSetup({ onCreateSession, onJoinSession, error, loading }: Props) {
  const { t } = useTranslation('quiz-ado');
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  const isNameValid = name.trim().length > 0 && name.trim().length <= 30;

  const handleCreate = () => {
    if (isNameValid) onCreateSession(name.trim());
  };

  const handleJoin = () => {
    if (isNameValid && code.trim().length >= 4) onJoinSession(name.trim(), code.trim());
  };

  if (mode === 'choose') {
    return (
      <div className="glass-card p-6 md:p-8 space-y-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium">
          <Users className="h-4 w-4" />
          {t('ui.multiplayer')}
        </div>
        <h2 className="text-2xl font-bold">{t('ui.howToPlay')}</h2>
        <p className="text-muted-foreground max-w-md mx-auto">{t('ui.howToPlayDesc')}</p>

        <div className="grid gap-4 md:grid-cols-2 max-w-lg mx-auto">
          <Button
            onClick={() => setMode('create')}
            size="lg"
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white h-auto py-4 flex flex-col gap-1"
          >
            <span className="text-base font-semibold">{t('ui.createSession')}</span>
            <span className="text-xs opacity-80">{t('ui.createSessionDesc')}</span>
          </Button>

          <Button
            onClick={() => setMode('join')}
            size="lg"
            variant="outline"
            className="h-auto py-4 flex flex-col gap-1"
          >
            <span className="text-base font-semibold">{t('ui.joinSession')}</span>
            <span className="text-xs opacity-60">{t('ui.joinSessionDesc')}</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 md:p-8 space-y-6">
      <button
        onClick={() => setMode('choose')}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        ← {t('ui.back')}
      </button>

      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold">
          {mode === 'create' ? t('ui.createTitle') : t('ui.joinTitle')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {mode === 'create' ? t('ui.createSubtitle') : t('ui.joinSubtitle')}
        </p>
      </div>

      <div className="space-y-4 max-w-sm mx-auto">
        <div>
          <label className="text-sm font-medium mb-1 block">{t('ui.yourName')}</label>
          <Input
            placeholder={t('ui.namePlaceholder')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={30}
          />
        </div>

        {mode === 'join' && (
          <div>
            <label className="text-sm font-medium mb-1 block">{t('ui.sessionCode')}</label>
            <Input
              placeholder="Ex: ROSE47"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={10}
              className="text-center font-mono text-lg tracking-widest"
            />
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}

        <Button
          onClick={mode === 'create' ? handleCreate : handleJoin}
          disabled={loading || !isNameValid || (mode === 'join' && code.trim().length < 4)}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
          size="lg"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              {mode === 'create' ? t('ui.startBtn') : t('ui.joinBtn')}
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
