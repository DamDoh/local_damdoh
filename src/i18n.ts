export const locales = ['en', 'fr', 'de', 'km'] as const;
export type Locale = (typeof locales)[number];
 
export const localeNames: Record<string, string> = {
  en: "English",
  fr: "Français",
  de: "Deutsch",
  km: "ភាសាខ្មែរ",
};
