
import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';
import {locales} from './src/i18n-config';
 
export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();
 
  let messages;
  try {
    // The `default` is important here because of how JSON files are imported
    messages = (await import(`./src/messages/${locale}.json`)).default;
  } catch (error) {
    // This will trigger a 404 if the message file for a valid locale is not found
    // This prevents a server crash if a file is missing.
    notFound();
  }

  return {
    messages
  };
});
