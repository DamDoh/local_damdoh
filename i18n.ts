
import {notFound} from 'next-intl';
import {getRequestConfig} from 'next-intl/server';
 
export default getRequestConfig(async ({locale}) => {
  let messages;
  try {
    switch (locale) {
      case 'en':
        messages = (await import('./src/messages/en.json')).default;
        break;
      case 'es':
        messages = (await import('./src/messages/es.json')).default;
        break;
      case 'ar':
        messages = (await import('./src/messages/ar.json')).default;
        break;
      case 'de':
        messages = (await import('./src/messages/de.json')).default;
        break;
      case 'fr':
        messages = (await import('./src/messages/fr.json')).default;
        break;
      case 'hi':
        messages = (await import('./src/messages/hi.json')).default;
        break;
      case 'id':
          messages = (await import('./src/messages/id.json')).default;
          break;
      case 'ja':
          messages = (await import('./src/messages/ja.json')).default;
          break;
      case 'km':
          messages = (await import('./src/messages/km.json')).default;
          break;
      case 'ko':
          messages = (await import('./src/messages/ko.json')).default;
          break;
      case 'ms':
          messages = (await import('./src/messages/ms.json')).default;
          break;
      case 'pt':
          messages = (await import('./src/messages/pt.json')).default;
          break;
      case 'ru':
          messages = (await import('./src/messages/ru.json')).default;
          break;
      case 'th':
          messages = (await import('./src/messages/th.json')).default;
          break;
      case 'tr':
          messages = (await import('./src/messages/tr.json')).default;
          break;
      case 'vi':
          messages = (await import('./src/messages/vi.json')).default;
          break;
      case 'zh':
          messages = (await import('./src/messages/zh.json')).default;
          break;
      default:
        // For any other locale, we'll just fall back to English
        // to prevent crashes, but we'll flag it.
        console.warn(`No specific message file found for locale "${locale}", falling back to English.`);
        messages = (await import('./src/messages/en.json')).default;
    }
  } catch (error) {
    // This will catch any errors if a specific JSON file is missing or malformed
    console.error(`Could not load messages for locale: ${locale}`, error);
    notFound();
  }

  return {messages};
});
