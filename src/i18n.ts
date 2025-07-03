
import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';

const locales = ['ar', 'de', 'en', 'es', 'fr', 'hi', 'id', 'ja', 'km', 'ko', 'ms', 'pt', 'ru', 'th', 'tr', 'vi', 'zh'];
 
export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale)) notFound();
 
  let messages;
  try {
    // Use a switch statement for static analysis by build tools.
    // The path is now relative to the `src` directory.
    switch (locale) {
      case 'en':
        messages = (await import('../messages/en.json')).default;
        break;
      case 'es':
        messages = (await import('../messages/es.json')).default;
        break;
      case 'ar': messages = (await import('../messages/ar.json')).default; break;
      case 'de': messages = (await import('../messages/de.json')).default; break;
      case 'fr': messages = (await import('../messages/fr.json')).default; break;
      case 'hi': messages = (await import('../messages/hi.json')).default; break;
      case 'id': messages = (await import('../messages/id.json')).default; break;
      case 'ja': messages = (await import('../messages/ja.json')).default; break;
      case 'km': messages = (await import('../messages/km.json')).default; break;
      case 'ko': messages = (await import('../messages/ko.json')).default; break;
      case 'ms': messages = (await import('../messages/ms.json')).default; break;
      case 'pt': messages = (await import('../messages/pt.json')).default; break;
      case 'ru': messages = (await import('../messages/ru.json')).default; break;
      case 'th': messages = (await import('../messages/th.json')).default; break;
      case 'tr': messages = (await import('../messages/tr.json')).default; break;
      case 'vi': messages = (await import('../messages/vi.json')).default; break;
      case 'zh': messages = (await import('../messages/zh.json')).default; break;
      default:
        messages = (await import('../messages/en.json')).default;
    }
  } catch (error) {
    notFound();
  }

  return {
    messages
  };
});
