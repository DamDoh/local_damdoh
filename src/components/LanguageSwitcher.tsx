
"use client";

import { useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Languages } from "lucide-react";
import { locales, localeNames } from '@/i18n';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('LanguageSwitcher');

  const languages = useMemo(() => {
    return locales.map((langCode) => ({
      code: langCode,
      name: localeNames[langCode] || langCode.toUpperCase(),
    }));
  }, []);

  const changeLocale = (newLocale: string) => {
    // Correctly reconstruct the path by removing the old locale
    const pathSegments = pathname.split('/').filter(Boolean);
    if (pathSegments.length > 0 && (locales as readonly string[]).includes(pathSegments[0])) {
      pathSegments.shift(); // Remove the old locale
    }
    const newPath = `/${newLocale}/${pathSegments.join('/')}`;
    router.replace(newPath);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{t('toggle')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLocale(lang.code)}
            disabled={locale === lang.code}
          >
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
