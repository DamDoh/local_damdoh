
import { STAKEHOLDER_ROLES, LISTING_TYPES, AGRI_EVENT_TYPES, FINANCIAL_SERVICE_TYPES, INSURANCE_SERVICE_TYPES } from './constants';

export const getStakeholderRoles = (t: any) =>
  STAKEHOLDER_ROLES.map(role => ({
    value: role,
    label: t('stakeholderRoles.' + role.replace(/[\s/()&,]+/g, ''))
  }));
  
export const getListingTypes = (t: any) =>
  LISTING_TYPES.map(type => ({
    value: type,
    label: t('listingTypes.' + type.toLowerCase())
  }));
  
export const getAgriEventTypes = (t: any) =>
  AGRI_EVENT_TYPES.map(type => ({
    value: type,
    label: t('agriEventTypes.' + type.replace(/\s/g, ''))
  }));

export const getFinancialServiceTypes = (t: any) =>
  FINANCIAL_SERVICE_TYPES.map(type => ({
    value: type,
    label: t('financialServiceTypes.' + type.replace(/_/g, ''))
  }));

export const getInsuranceServiceTypes = (t: any) =>
  INSURANCE_SERVICE_TYPES.map(type => ({
    value: type,
    label: t('insuranceServiceTypes.' + type.replace(/_/g, ''))
  }));
