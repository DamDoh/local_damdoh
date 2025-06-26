import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';

// Can be imported from a shared config
export const locales = ['en', 'es', 'zh', 'fr', 'ar', 'pt', 'hi', 'ru', 'id', 'de', 'tr', 'ja', 'km', 'th', 'ko', 'vi', 'ms'];
export const defaultLocale = 'en';
 
export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();
 
  return {
    messages: (await import(`./src/messages/${locale}.json`)).default
  };
});
