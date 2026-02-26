import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, Loader2, Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/hooks/useLanguage';
import { getLocalizedUrl } from '@/i18n/routes';

interface Props {
  code: string;
  onCancel: () => void;
}

export function AdoWaitingRoom({ code, onCancel }: Props) {
  const { t } = useTranslation('quiz-ado');
  const { lang } = useLanguage();
  const [copied, setCopied] = useState(false);

  const pageUrl = getLocalizedUrl('quizAdo', lang);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t('ui.sharePageTitle'),
          text: t('ui.sharePageText', { code }),
          url: pageUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      // Fallback: copy page URL
      try {
        await navigator.clipboard.writeText(pageUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // fallback
      }
    }
  };

  return (
    <div className="glass-card p-6 md:p-8 text-center space-y-6">
      <Loader2 className="h-10 w-10 animate-spin mx-auto text-emerald-500" />

      <div className="space-y-2">
        <h2 className="text-xl font-bold">{t('ui.waitingTitle')}</h2>
        <p className="text-muted-foreground">{t('ui.waitingDesc')}</p>
      </div>

      {/* Code display */}
      <div className="bg-muted/50 rounded-2xl p-6 space-y-3 max-w-sm mx-auto">
        <p className="text-sm text-muted-foreground">{t('ui.shareCode')}</p>
        <div className="text-4xl font-mono font-bold tracking-[0.3em] text-emerald-500">
          {code}
        </div>
      </div>

      {/* Share page */}
      <Button
        onClick={handleShare}
        variant="outline"
        className="gap-2"
      >
        {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
        {copied ? t('ui.copied') : t('ui.sharePage')}
      </Button>

      <p className="text-xs text-muted-foreground">{t('ui.waitingHint')}</p>

      <Button variant="ghost" size="sm" onClick={onCancel} className="text-muted-foreground">
        {t('ui.cancel')}
      </Button>
    </div>
  );
}
