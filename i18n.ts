import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';
 
// Define the locales directly in the configuration file.
const locales = ['ar', 'de', 'en', 'es', 'fr', 'hi', 'id', 'ja', 'km', 'ko', 'ms', 'pt', 'ru', 'th', 'tr', 'vi', 'zh'];
 
export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();
 
  return {
    messages: (await import(`./src/messages/${locale}.json`)).default
  };
});