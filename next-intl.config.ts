import {getRequestConfig} from 'next-intl/server';
import {locales} from './src/i18n';
import {notFound} from 'next/navigation';
 
export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    notFound();
  }
 
  return {
    messages: (await import(`./src/messages/${locale}.json`)).default
  };
});