
import {getRequestConfig} from 'next-intl/server';
import {locales} from './i18n-config';
import {notFound} from 'next/navigation';
 
export default getRequestConfig(async ({requestLocale}) => {
  // Await the locale before using it
  const locale = await requestLocale;
  
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();
 
  let messages;
  try {
    // The `default` is important here because of how JSON files are imported
    messages = (await import(`./messages/${locale}.json`)).default;
  } catch (error) {
    // This will trigger a 404 if the message file for a valid locale is not found
    // This prevents a server crash if a file is missing.
    console.error("Could not load messages for locale:", locale, error);
    notFound();
  }

  return {
    messages,
    locale
  };
});
