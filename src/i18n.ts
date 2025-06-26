import {getRequestConfig} from 'next-intl/server';
import enMessages from './messages/en.json';
import esMessages from './messages/es.json';
import {notFound} from 'next/navigation';

// Can be imported from a shared config
const locales = ['en', 'es', 'zh', 'fr', 'ar', 'pt', 'hi', 'ru', 'id', 'de', 'tr', 'ja', 'km', 'th', 'ko', 'vi', 'ms'];
 
export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();
 
  // Using static imports as a workaround for dynamic import issues in the build environment
  const messages = locale === 'es' ? esMessages : enMessages;

  return {
    messages
  };
});
