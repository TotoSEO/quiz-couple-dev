import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { LANGUAGE_CONFIG, SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/i18n/config';

export function LanguageSelector() {
  const { lang, switchLanguage } = useLanguage();
  const currentLang = LANGUAGE_CONFIG[lang];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLang.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[150px]">
        {SUPPORTED_LANGUAGES.map((langCode) => {
          const langInfo = LANGUAGE_CONFIG[langCode];
          const isActive = langCode === lang;
          
          return (
            <DropdownMenuItem
              key={langCode}
              onClick={() => switchLanguage(langCode as SupportedLanguage)}
              className={isActive ? 'bg-accent' : ''}
            >
              <span className="mr-2">{langInfo.flag}</span>
              <span>{langInfo.name}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
