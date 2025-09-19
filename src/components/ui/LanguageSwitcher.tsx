"use client";

import React, { useState, useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Globe, Check, Loader2 } from 'lucide-react';
import { locales, localeNames, languageMetadata } from '@/i18n-config';

interface LanguageSwitcherProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  showFlag?: boolean;
  compact?: boolean;
  className?: string;
}

export function LanguageSwitcher({
  variant = 'outline',
  size = 'default',
  showFlag = true,
  compact = false,
  className = ''
}: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();
  const t = useTranslations('common');
  const [isPending, startTransition] = useTransition();

  const handleLocaleChange = (newLocale: string) => {
    startTransition(() => {
      // Remove current locale from pathname
      const segments = pathname.split('/');
      const currentLocaleIndex = segments.findIndex(segment =>
        locales.includes(segment as any)
      );

      if (currentLocaleIndex > 0) {
        segments.splice(currentLocaleIndex, 1);
      }

      // Add new locale
      segments.splice(1, 0, newLocale);

      const newPathname = segments.join('/') || '/';

      router.replace(newPathname);
    });
  };

  const getLanguageDisplay = (locale: string) => {
    const metadata = languageMetadata[locale as keyof typeof languageMetadata];
    const displayName = localeNames[locale as keyof typeof localeNames];

    if (compact) {
      return locale.toUpperCase();
    }

    if (showFlag) {
      // You can add flag emojis or flag icons here based on locale
      const flagEmoji = getFlagEmoji(locale);
      return `${flagEmoji} ${displayName}`;
    }

    return displayName;
  };

  const getFlagEmoji = (locale: string): string => {
    const flagMap: Record<string, string> = {
      en: '🇺🇸',
      ar: '🇸🇦',
      bn: '🇧🇩',
      de: '🇩🇪',
      es: '🇪🇸',
      fr: '🇫🇷',
      gu: '🇮🇳',
      hi: '🇮🇳',
      id: '🇮🇩',
      ja: '🇯🇵',
      km: '🇰🇭',
      ko: '🇰🇷',
      ms: '🇲🇾',
      ne: '🇳🇵',
      pt: '🇵🇹',
      ru: '🇷🇺',
      ta: '🇮🇳',
      te: '🇮🇳',
      th: '🇹🇭',
      vi: '🇻🇳',
    };

    return flagMap[locale] || '🌐';
  };

  const getCurrentLanguageInfo = () => {
    const metadata = languageMetadata[currentLocale as keyof typeof languageMetadata];
    return {
      name: localeNames[currentLocale as keyof typeof localeNames],
      flag: getFlagEmoji(currentLocale),
      region: metadata?.region || 'Global',
      isRTL: metadata?.isRTL || false
    };
  };

  const currentLang = getCurrentLanguageInfo();

  if (compact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant}
            size={size}
            className={`relative ${className}`}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Globe className="h-4 w-4 mr-1" />
                <span className="font-medium">{currentLocale.toUpperCase()}</span>
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
            Select Language
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {locales.map((locale) => (
            <DropdownMenuItem
              key={locale}
              onClick={() => handleLocaleChange(locale)}
              className="flex items-center justify-between cursor-pointer"
              disabled={isPending}
            >
              <span className="flex items-center">
                <span className="mr-2">{getFlagEmoji(locale)}</span>
                <span>{localeNames[locale]}</span>
              </span>
              {currentLocale === locale && (
                <Check className="h-4 w-4 text-green-600" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={`relative ${className}`}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <span className="mr-2">{currentLang.flag}</span>
              <span className="hidden sm:inline">{currentLang.name}</span>
              <span className="sm:hidden">{currentLocale.toUpperCase()}</span>
              <Globe className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
          Choose Your Language
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Group languages by region for better UX */}
        {Object.entries(
          locales.reduce((acc, locale) => {
            const metadata = languageMetadata[locale as keyof typeof languageMetadata];
            const region = metadata?.region || 'Other';

            if (!acc[region]) {
              acc[region] = [];
            }
            acc[region].push(locale);
            return acc;
          }, {} as Record<string, string[]>)
        ).map(([region, regionLocales]) => (
          <React.Fragment key={region}>
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground mt-2">
              {region}
            </DropdownMenuLabel>
            {regionLocales.map((locale) => {
              const metadata = languageMetadata[locale as keyof typeof languageMetadata];
              return (
                <DropdownMenuItem
                  key={locale}
                  onClick={() => handleLocaleChange(locale)}
                  className="flex items-center justify-between cursor-pointer"
                  disabled={isPending}
                >
                  <span className="flex items-center">
                    <span className="mr-2 text-lg">{getFlagEmoji(locale)}</span>
                    <div className="flex flex-col">
                      <span className="font-medium">{localeNames[locale as keyof typeof localeNames]}</span>
                      {metadata?.agriculturalFocus && (
                        <span className="text-xs text-muted-foreground">
                          {metadata.agriculturalFocus.slice(0, 2).join(', ')}
                          {metadata.agriculturalFocus.length > 2 && '...'}
                        </span>
                      )}
                    </div>
                  </span>
                  {currentLocale === locale && (
                    <Check className="h-4 w-4 text-green-600" />
                  )}
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Export a hook for programmatic language switching
export function useLanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();
  const [, startTransition] = useTransition();

  const switchLanguage = (newLocale: string) => {
    startTransition(() => {
      const segments = pathname.split('/');
      const currentLocaleIndex = segments.findIndex(segment =>
        locales.includes(segment as any)
      );

      if (currentLocaleIndex > 0) {
        segments.splice(currentLocaleIndex, 1);
      }

      segments.splice(1, 0, newLocale);
      const newPathname = segments.join('/') || '/';

      router.replace(newPathname);
    });
  };

  return {
    currentLocale,
    switchLanguage,
    availableLocales: locales,
    localeNames,
    languageMetadata
  };
}