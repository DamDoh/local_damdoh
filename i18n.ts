import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';

// Can be imported from a shared config
const locales = ['ar', 'de', 'en', 'es', 'fr', 'hi', 'id', 'ja', 'km', 'ko', 'ms', 'pt', 'ru', 'th', 'tr', 'vi', 'zh'];

export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();

  let messages;
  try {
    // Use a static import for each locale for maximum reliability
    // The path is relative to the project root now.
    switch (locale) {
      case 'en': messages = (await import('./src/messages/en.json')).default; break;
      case 'es': messages = (await import('./src/messages/es.json')).default; break;
      case 'ar': messages = (await import('./src/messages/ar.json')).default; break;
      case 'de': messages = (await import('./src/messages/de.json')).default; break;
      case 'fr': messages = (await import('./src/messages/fr.json')).default; break;
      case 'hi': messages = (await import('./src/messages/hi.json')).default; break;
      case 'id': messages = (await import('./src/messages/id.json')).default; break;
      case 'ja': messages = (await import('./src/messages/ja.json')).default; break;
      case 'km': messages = (await import('./src/messages/km.json')).default; break;
      case 'ko': messages = (await import('./src/messages/ko.json')).default; break;
      case 'ms': messages = (await import('./src/messages/ms.json')).default; break;
      case 'pt': messages = (await import('./src/messages/pt.json')).default; break;
      case 'ru': messages = (await import('./src/messages/ru.json')).default; break;
      case 'th': messages = (await import('./src/messages/th.json')).default; break;
      case 'tr': messages = (await import('./src/messages/tr.json')).default; break;
      case 'vi': messages = (await import('./src/messages/vi.json')).default; break;
      case 'zh': messages = (await import('./src/messages/zh.json')).default; break;
      default:
        messages = (await import('./src/messages/en.json')).default;
    }
  } catch (error) {
    notFound();
  }

  return { messages };
});
