
import {getRequestConfig} from 'next-intl/server';
 
// This function is used to dynamically load the translations for the current locale.
export default getRequestConfig(async ({locale}) => {
    // This is a dynamic import. It will automatically be code-split by the bundler.
    // In case a file for a given locale is not available, the default will be 'en'.
    let messages;
    try {
        messages = (await import(`./messages/${locale}.json`)).default;
    } catch (error) {
        console.warn(`Could not load messages for locale: ${locale}. Falling back to 'en'.`);
        messages = (await import('./messages/en.json')).default;
    }
    
    return {
        messages
    };
});
