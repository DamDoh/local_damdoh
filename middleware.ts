import createMiddleware from 'next-intl/middleware';
 
const locales = ['ar', 'de', 'en', 'es', 'fr', 'hi', 'id', 'ja', 'km', 'ko', 'ms', 'pt', 'ru', 'th', 'tr', 'vi', 'zh'];
const defaultLocale = 'en';
 
export default createMiddleware({
  locales,
  defaultLocale,
  // The following setting is needed to support the root page at `/`
  // instead of redirecting to `/en`. This is a more flexible approach.
  localePrefix: 'as-needed' 
});
 
export const config = {
  // Skip all paths that should not be internationalized. This is a common source of errors.
  // This updated matcher ensures that only pages are matched, excluding API routes,
  // static files, and Next.js-specific folders.
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',

    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    '/(ar|de|en|es|fr|hi|id|ja|km|ko|ms|pt|ru|th|tr|vi|zh)/:path*',

    // Enable redirects that add a locale prefix
    // (e.g. `/pathnames` -> `/en/pathnames`)
    '/((?!_next|api|.*\\..*).*)'
  ]
};
