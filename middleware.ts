
import createMiddleware from 'next-intl/middleware';
 
// The locales are defined here and used by the middleware to determine
// which language paths to recognize.
const locales = ['ar', 'de', 'en', 'es', 'fr', 'hi', 'id', 'ja', 'km', 'ko', 'ms', 'pt', 'ru', 'th', 'tr', 'vi', 'zh'];
const defaultLocale = 'en';

export default createMiddleware({
  locales,
  defaultLocale
});
 
export const config = {
  // Skip all paths that should not be internationalized.
  // This includes API routes, internal Next.js folders, and static files.
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
