import {getRequestConfig} from 'next-intl/server';
 
export default getRequestConfig(async ({locale}) => {
  // This is the crucial part: the path is now relative to the project root, 
  // so it must include `src`.
  let messages;
  try {
    messages = (await import(`./src/messages/${locale}.json`)).default;
  } catch (error) {
     console.warn(`Could not load messages for locale: ${locale}. Falling back to 'en'.`);
     messages = (await import('./src/messages/en.json')).default;
  }
 
  return {messages};
});