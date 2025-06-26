import createMiddleware from 'next-intl/middleware';
 
export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'es', 'zh', 'fr', 'ar', 'pt', 'hi', 'ru', 'id', 'de', 'tr', 'ja', 'km', 'th', 'ko', 'vi', 'ms'],
 
  // Used when no locale matches
  defaultLocale: 'en'
});
 
export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(en|es|zh|fr|ar|pt|hi|ru|id|de|tr|ja|km|th|ko|vi|ms)/:path*']
};
