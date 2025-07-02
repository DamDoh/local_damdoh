import createMiddleware from 'next-intl/middleware';
 
const locales = ['ar', 'de', 'en', 'es', 'fr', 'hi', 'id', 'ja', 'km', 'ko', 'ms', 'pt', 'ru', 'th', 'tr', 'vi', 'zh'];
const defaultLocale = 'en';

export default createMiddleware({
  locales,
  defaultLocale
});
 
export const config = {
  // Skip all paths that should not be internationalized
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
