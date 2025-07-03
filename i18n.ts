import {getRequestConfig} from 'next-intl/server';
 
export const locales = ['ar', 'de', 'en', 'es', 'fr', 'hi', 'id', 'ja', 'km', 'ko', 'ms', 'pt', 'ru', 'th', 'tr', 'vi', 'zh'];
 
export default getRequestConfig(async ({locale}) => {
  // This provides a robust fallback if a locale is requested that is not supported.
  if (!locales.includes(locale as any)) {
      console.warn(`Unsupported locale "${locale}" requested. Falling back to "en".`);
      locale = 'en';
  }
 
  return {
    messages: (await import(`./src/messages/${locale}.json`)).default
  };
});
