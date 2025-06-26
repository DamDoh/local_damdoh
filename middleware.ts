
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';
 
export default createMiddleware({
  // A list of all locales that are supported
  locales,
 
  // Used when no locale matches
  defaultLocale
});
 
export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(en|es|zh|fr|ar|pt|hi|ru|id|de|tr|ja|km|th|ko|vi|ms)/:path*']
};
