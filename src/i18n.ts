import {getRequestConfig} from 'next-intl/server';
 
// This function is used to dynamically load the messages for the requested locale.
export default getRequestConfig(async ({locale}) => {
  // The `.` in the path is important, it tells the bundler that this is a relative path.
  // The `switch` statement is used here to make the imports static, which is more reliable
  // for some build tools than a dynamic import with a variable.
  let messages;
  switch (locale) {
    case 'ar':
      messages = (await import('./messages/ar.json')).default;
      break;
    case 'de':
      messages = (await import('./messages/de.json')).default;
      break;
    case 'es':
      messages = (await import('./messages/es.json')).default;
      break;
    case 'fr':
      messages = (await import('./messages/fr.json')).default;
      break;
    case 'hi':
      messages = (await import('./messages/hi.json')).default;
      break;
    case 'id':
      messages = (await import('./messages/id.json')).default;
      break;
    case 'ja':
      messages = (await import('./messages/ja.json')).default;
      break;
    case 'km':
      messages = (await import('./messages/km.json')).default;
      break;
    case 'ko':
      messages = (await import('./messages/ko.json')).default;
      break;
    case 'ms':
      messages = (await import('./messages/ms.json')).default;
      break;
    case 'pt':
      messages = (await import('./messages/pt.json')).default;
      break;
    case 'ru':
      messages = (await import('./messages/ru.json')).default;
      break;
    case 'th':
      messages = (await import('./messages/th.json')).default;
      break;
    case 'tr':
      messages = (await import('./messages/tr.json')).default;
      break;
    case 'vi':
      messages = (await import('./messages/vi.json')).default;
      break;
    case 'zh':
      messages = (await import('./messages/zh.json')).default;
      break;
    default:
      // Default to English if the locale is not found.
      messages = (await import('./messages/en.json')).default;
  }
 
  return {messages};
});