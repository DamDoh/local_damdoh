
import createMiddleware from 'next-intl/middleware';

export const locales = ['en', 'fr', 'de', 'km'] as const;
export const localeNames: Record<string, string> = {
  en: "English",
  fr: "Français",
  de: "Deutsch",
  km: "ភាសាខ្មែរ",
};
 
export default createMiddleware({
  // A list of all locales that are supported
  locales,
 
  // Used when no locale matches
  defaultLocale: 'en',
  localePrefix: 'as-needed' 
});
 
export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
