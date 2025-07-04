
import createMiddleware from 'next-intl/middleware';

// The middleware MUST be self-contained and have NO imports from other project files.
// This is the definitive fix to prevent crashes in the Edge runtime.
const locales = ['en', 'fr', 'de', 'km'];
const defaultLocale = 'en';
 
export default createMiddleware({
  // A list of all locales that are supported
  locales: locales,
 
  // Used when no locale matches
  defaultLocale: defaultLocale,
  localePrefix: 'as-needed' 
});
 
export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
