import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';

// Can be imported from a shared config.
// Only include locales with actual message files to prevent errors.
export const locales = ['en', 'es'];
export const defaultLocale = 'en';
 
export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();
 
  return {
    // The `.` is important since this file is at the root.
    messages: (await import(`./src/messages/${locale}.json`)).default
  };
});
