
import { STAKEHOLDER_ROLES, LISTING_TYPES, AGRI_EVENT_TYPES, FINANCIAL_SERVICE_TYPES, INSURANCE_SERVICE_TYPES } from './constants';

// A generic type for the translation function from next-intl's useTranslations
type TranslationFunction = (key: string, defaultMessage?: string) => string;

// Helper to create a safe key from a string
const toKey = (str: string) => str.replace(/[^a-zA-Z0-9]/g, '');

export const getStakeholderRoles = (t: TranslationFunction) =>
  STAKEHOLDER_ROLES.map(role => ({
    value: role,
    label: t(`stakeholderRoles.${toKey(role)}`, role),
  }));

export const getListingTypes = (t: TranslationFunction) =>
  LISTING_TYPES.map(type => ({
    value: type,
    label: t(`listingTypes.${toKey(type)}`, type),
  }));

export const getAgriEventTypes = (t: TranslationFunction) =>
  AGRI_EVENT_TYPES.map(type => ({
    value: type,
    label: t(`agriEventTypes.${toKey(type)}`, type),
  }));
  
export const getFinancialServiceTypes = (t: TranslationFunction) =>
  FINANCIAL_SERVICE_TYPES.map(type => ({
    value: type,
    label: t(`financialServiceTypes.${toKey(type)}`, type),
  }));
  
export const getInsuranceServiceTypes = (t: TranslationFunction) =>
  INSURANCE_SERVICE_TYPES.map(type => ({
    value: type,
    label: t(`insuranceServiceTypes.${toKey(type)}`, type),
  }));
