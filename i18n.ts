import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';

// A list of all locales that are supported
const locales = ['ar', 'de', 'en', 'es', 'fr', 'hi', 'id', 'ja', 'km', 'ko', 'ms', 'pt', 'ru', 'th', 'tr', 'vi', 'zh'];

async function getMessagesForLocale(locale: string) {
    switch (locale) {
      case 'ar': return (await import('./src/messages/ar/common.json')).default;
      case 'de': return (await import('./src/messages/de/common.json')).default;
      case 'en': return (await import('./src/messages/en/common.json')).default;
      case 'es': return (await import('./src/messages/es/common.json')).default;
      case 'fr': return (await import('./src/messages/fr/common.json')).default;
      case 'hi': return (await import('./src/messages/hi/common.json')).default;
      case 'id': return (await import('./src/messages/id/common.json')).default;
      case 'ja': return (await import('./src/messages/ja/common.json')).default;
      case 'km': return (await import('./src/messages/km/common.json')).default;
      case 'ko': return (await import('./src/messages/ko/common.json')).default;
      case 'ms': return (await import('./src/messages/ms/common.json')).default;
      case 'pt': return (await import('./src/messages/pt/common.json')).default;
      case 'ru': return (await import('./src/messages/ru/common.json')).default;
      case 'th': return (await import('./src/messages/th/common.json')).default;
      case 'tr': return (await import('./src/messages/tr/common.json')).default;
      case 'vi': return (await import('./src/messages/vi/common.json')).default;
      case 'zh': return (await import('./src/messages/zh/common.json')).default;
      default: notFound();
    }
}
 
export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();
 
  return {
    messages: await getMessagesForLocale(locale)
  };
});