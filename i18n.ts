import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// Define locales directly here to avoid complex imports in middleware.
export const locales = ['en', 'fr', 'de', 'km'] as const;
export type Locale = (typeof locales)[number];
 
export const localeNames: Record<string, string> = {
  en: "English",
  fr: "Français",
  de: "Deutsch",
  km: "ភាសាខ្មែរ",
};
 
export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();
 
  return {
    messages: (await import(`./src/messages/${locale}.json`)).default
  };
});
