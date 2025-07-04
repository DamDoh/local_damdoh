
import createMiddleware from 'next-intl/middleware';

// The list of supported locales is defined directly here to avoid import issues in the Edge runtime.
// This list should be kept in sync with src/i18n-config.ts
export const locales = ['en', 'fr', 'de', 'km'] as const;
 
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
