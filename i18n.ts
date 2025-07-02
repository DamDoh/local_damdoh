import {getRequestConfig} from 'next-intl/server';
 
// Using a dynamic import for messages is recommended
export default getRequestConfig(async ({locale}) => ({
  messages: (await import(`./src/messages/${locale}.json`)).default
}));
