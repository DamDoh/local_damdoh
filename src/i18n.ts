
import {getRequestConfig} from 'next-intl/server';
import {locales, fallbackLocales} from './i18n-config';
import {notFound} from 'next/navigation';

// Utility function to convert kebab-case to camelCase
const toCamelCase = (str: string) => str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());

// Microservice directories that contain translation files
const microservices = [
  'ai-ml-services',
  'analytics',
  'audit-services',
  'auth',
  'blockchain-services',
  'carbon-trading',
  'common',
  'communication-hub',
  'compliance',
  'contract-management',
  'crm-customer-relationship',
  'dashboard',
  'data-integration-hub',
  'emergency-management',
  'equipment-management',
  'farm-management',
  'field-operations',
  'financial',
  'forums',
  'geospatial-services',
  'human-resources',
  'insurance-management',
  'inventory-management',
  'iot-management',
  'knowledge-hub',
  'logistics-transportation',
  'market-intelligence',
  'marketplace',
  'mobile-operations',
  'network',
  'notifications',
  'project-management',
  'quality-control',
  'regulatory-filing',
  'risk-management',
  'search',
  'soil-health-management',
  'supply-chain-finance',
  'sustainability',
  'sustainability-tracking',
  'traceability',
  'training-certification',
  'water-management',
  'weather-climate',
  'workflow-automation'
] as const;

export default getRequestConfig(async ({requestLocale}) => {
  // Await the locale before using it
  const locale = await requestLocale;

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();

  const messages: Record<string, any> = {};

  try {
    // Load messages from each microservice directory
    for (const service of microservices) {
      try {
        const serviceMessages = (await import(`./messages/${service}/${locale}.json`)).default;
        // Convert kebab-case to camelCase for consistency with TypeScript types
        const camelCaseKey = toCamelCase(service);
        messages[camelCaseKey] = serviceMessages;
      } catch (serviceError) {
        // Try fallback locales for this microservice
        const fallbacks = fallbackLocales[locale as keyof typeof fallbackLocales] || [];
        let loaded = false;

        for (const fallback of fallbacks) {
          try {
            const fallbackMessages = (await import(`./messages/${service}/${fallback}.json`)).default;
            const camelCaseKey = toCamelCase(service);
            messages[camelCaseKey] = fallbackMessages;
            loaded = true;
            break;
          } catch (fallbackError) {
            // Continue to next fallback
          }
        }

        if (!loaded) {
          console.warn(`Could not load ${service} messages for locale: ${locale}`);
          // Use empty object as fallback to prevent crashes
          messages[service.replace('-', '')] = {};
        }
      }
    }

    // If no messages were loaded at all, trigger 404
    if (Object.keys(messages).length === 0) {
      console.error("Could not load any messages for locale:", locale);
      notFound();
    }

  } catch (error) {
    console.error("Could not load messages for locale:", locale, error);
    notFound();
  }

  return {
    messages,
    locale
  };
});
