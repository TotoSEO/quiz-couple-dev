import { useState } from 'react';
import { Share2, Copy, Check, Facebook, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useLanguage } from '@/hooks/useLanguage';

interface ShareButtonsProps {
  title: string;
  text: string;
  url?: string;
  /** URL used only for copy-to-clipboard (defaults to current page) */
  copyUrl?: string;
}

export function ShareButtons({ title, text, url, copyUrl }: ShareButtonsProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareUrl = url || pageUrl;
  const clipboardUrl = copyUrl || pageUrl;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(clipboardUrl);
      setCopied(true);
      toast.success(t('quizGames:share.linkCopied'));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t('quizGames:share.copyError'));
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    }
  };

  const handleFacebookShare = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(fbUrl, '_blank', 'width=600,height=400');
  };

  const handleTwitterShare = () => {
    const tweetText = `${text} ${shareUrl}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {/* Native Share (mobile) */}
      {typeof navigator !== 'undefined' && navigator.share && (
        <Button
          variant="outline"
          size="lg"
          onClick={handleNativeShare}
          className="gap-2"
        >
          <Share2 className="h-4 w-4" />
          {t('quizGames:share.share')}
        </Button>
      )}

      {/* Copy Link */}
      <Button
        variant="outline"
        size="lg"
        onClick={handleCopy}
        className="gap-2"
      >
      {copied ? (
          <Check className="h-4 w-4 text-primary" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
        {copied ? t('quizGames:share.copied') : t('quizGames:share.copyLink')}
      </Button>

      {/* Facebook */}
      <Button
        variant="outline"
        size="icon"
        onClick={handleFacebookShare}
        aria-label={t('quizGames:share.shareOnFacebook')}
        className="h-11 w-11"
      >
        <Facebook className="h-5 w-5" />
      </Button>

      {/* Twitter/X */}
      <Button
        variant="outline"
        size="icon"
        onClick={handleTwitterShare}
        aria-label={t('quizGames:share.shareOnTwitter')}
        className="h-11 w-11"
      >
        <Twitter className="h-5 w-5" />
      </Button>
    </div>
  );
}