
export const locales = ['en', 'fr', 'de', 'km', 'es'] as const;

export const localeNames: Record<typeof locales[number], string> = {
  en: "English",
  fr: "Français",
  de: "Deutsch",
  km: "ភាសាខ្មែរ",
  es: "Español",
};
