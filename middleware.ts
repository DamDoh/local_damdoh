
import createMiddleware from 'next-intl/middleware';

// Define locales directly within the middleware to ensure it's self-contained
// and has no dependencies on other project files, which is crucial for the Edge runtime.
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
