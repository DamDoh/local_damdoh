
export const locales = [
  'en', 'ar', 'bn', 'de', 'es', 'fr', 'gu', 'hi', 'id', 'ja',
  'km', 'ko', 'ms', 'ne', 'pt', 'ru', 'ta', 'te', 'th', 'vi'
] as const;

export const localeNames: Record<typeof locales[number], string> = {
  en: "English",
  ar: "العربية",
  bn: "বাংলা",
  de: "Deutsch",
  es: "Español",
  fr: "Français",
  gu: "ગુજરાતી",
  hi: "हिन्दी",
  id: "Bahasa Indonesia",
  ja: "日本語",
  km: "ភាសាខ្មែរ",
  ko: "한국어",
  ms: "Bahasa Melayu",
  ne: "नेपाली",
  pt: "Português",
  ru: "Русский",
  ta: "தமிழ்",
  te: "తెలుగు",
  th: "ไทย",
  vi: "Tiếng Việt",
};

// RTL (Right-to-Left) language configuration
export const rtlLocales = ['ar'] as const;

// Language metadata for cultural adaptations
export const languageMetadata: Record<typeof locales[number], {
  region: string;
  script: string;
  isRTL: boolean;
  agriculturalFocus: string[];
}> = {
  en: { region: 'Global', script: 'Latin', isRTL: false, agriculturalFocus: ['general'] },
  ar: { region: 'Middle East/North Africa', script: 'Arabic', isRTL: true, agriculturalFocus: ['dates', 'olive', 'wheat'] },
  bn: { region: 'South Asia', script: 'Bengali', isRTL: false, agriculturalFocus: ['rice', 'jute', 'tea'] },
  de: { region: 'Europe', script: 'Latin', isRTL: false, agriculturalFocus: ['wheat', 'potatoes', 'beets'] },
  es: { region: 'Latin America', script: 'Latin', isRTL: false, agriculturalFocus: ['coffee', 'corn', 'soybeans'] },
  fr: { region: 'Europe/Africa', script: 'Latin', isRTL: false, agriculturalFocus: ['wine', 'wheat', 'dairy'] },
  gu: { region: 'India', script: 'Gujarati', isRTL: false, agriculturalFocus: ['cotton', 'groundnut', 'castor'] },
  hi: { region: 'India', script: 'Devanagari', isRTL: false, agriculturalFocus: ['wheat', 'rice', 'sugarcane'] },
  id: { region: 'Southeast Asia', script: 'Latin', isRTL: false, agriculturalFocus: ['palm oil', 'rubber', 'coffee'] },
  ja: { region: 'East Asia', script: 'Japanese', isRTL: false, agriculturalFocus: ['rice', 'tea', 'vegetables'] },
  km: { region: 'Southeast Asia', script: 'Khmer', isRTL: false, agriculturalFocus: ['rice', 'cassava', 'rubber'] },
  ko: { region: 'East Asia', script: 'Korean', isRTL: false, agriculturalFocus: ['rice', 'vegetables', 'fruits'] },
  ms: { region: 'Southeast Asia', script: 'Latin', isRTL: false, agriculturalFocus: ['palm oil', 'rubber', 'cocoa'] },
  ne: { region: 'South Asia', script: 'Devanagari', isRTL: false, agriculturalFocus: ['rice', 'wheat', 'potatoes'] },
  pt: { region: 'Brazil/Portugal', script: 'Latin', isRTL: false, agriculturalFocus: ['coffee', 'soybeans', 'sugarcane'] },
  ru: { region: 'Eurasia', script: 'Cyrillic', isRTL: false, agriculturalFocus: ['wheat', 'sunflower', 'potatoes'] },
  ta: { region: 'India/Sri Lanka', script: 'Tamil', isRTL: false, agriculturalFocus: ['rice', 'coconut', 'tea'] },
  te: { region: 'India', script: 'Telugu', isRTL: false, agriculturalFocus: ['rice', 'cotton', 'chili'] },
  th: { region: 'Southeast Asia', script: 'Thai', isRTL: false, agriculturalFocus: ['rice', 'rubber', 'cassava'] },
  vi: { region: 'Southeast Asia', script: 'Latin', isRTL: false, agriculturalFocus: ['rice', 'coffee', 'tea'] },
};

// Default locale for the application
export const defaultLocale = 'en' as const;

// Fallback locale chain for missing translations
export const fallbackLocales: Record<typeof locales[number], typeof locales[number][]> = {
  en: [],
  ar: ['en'],
  bn: ['hi', 'en'],
  de: ['en'],
  es: ['en'],
  fr: ['en'],
  gu: ['hi', 'en'],
  hi: ['en'],
  id: ['ms', 'en'],
  ja: ['en'],
  km: ['th', 'en'],
  ko: ['en'],
  ms: ['id', 'en'],
  ne: ['hi', 'en'],
  pt: ['es', 'en'],
  ru: ['en'],
  ta: ['en'],
  te: ['hi', 'en'],
  th: ['en'],
  vi: ['en'],
};
