
import { STAKEHOLDER_ROLES, LISTING_TYPES, AGRI_EVENT_TYPES, FINANCIAL_SERVICE_TYPES, INSURANCE_SERVICE_TYPES } from './constants';

export const getStakeholderRoles = (t: any) =>
  STAKEHOLDER_ROLES.map(role => ({
    value: role,
    label: t(role.replace(/[\s/()]+/g, '')) // Create a key like 'FieldAgentAgronomistDamDohInternal'
  }));
  
export const getListingTypes = (t: any) =>
  LISTING_TYPES.map(type => ({
    value: type,
    label: t(type.toLowerCase())
  }));
  
export const getAgriEventTypes = (t: any) =>
  AGRI_EVENT_TYPES.map(type => ({
    value: type,
    label: t(type.replace(/\s/g, ''))
  }));

export const getFinancialServiceTypes = (t: any) =>
  FINANCIAL_SERVICE_TYPES.map(type => ({
    value: type,
    label: t(type.replace(/_/g, ''))
  }));

export const getInsuranceServiceTypes = (t: any) =>
  INSURANCE_SERVICE_TYPES.map(type => ({
    value: type,
    label: t(type.replace(/_/g, ''))
  }));
