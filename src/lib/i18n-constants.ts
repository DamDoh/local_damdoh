
import { STAKEHOLDER_ROLES, LISTING_TYPES, AGRI_EVENT_TYPES, FINANCIAL_SERVICE_TYPES, INSURANCE_SERVICE_TYPES } from './constants';

export const getStakeholderRoles = (t: any) =>
  STAKEHOLDER_ROLES.map(role => ({
    value: role,
    label: t('stakeholderRoles.' + role.replace(/[^a-zA-Z0-9]/g, ''))
  }));
  
export const getListingTypes = (t: any) =>
  LISTING_TYPES.map(type => ({
    value: type,
    label: t('listingTypes.' + type)
  }));
  
export const getAgriEventTypes = (t: any) =>
  AGRI_EVENT_TYPES.map(type => ({
    value: type,
    label: t(`agriEventTypes.${type.replace(/\s/g, '')}`)
  }));

export const getFinancialServiceTypes = (t: any) =>
  FINANCIAL_SERVICE_TYPES.map(type => ({
    value: type,
    label: t('financialServiceTypes.' + type)
  }));

export const getInsuranceServiceTypes = (t: any) =>
  INSURANCE_SERVICE_TYPES.map(type => ({
    value: type,
    label: t('insuranceServiceTypes.' + type)
  }));

export const getInsuranceProductTypes = (t: any) => [
    { value: 'Crop', label: t('insuranceProductTypes.Crop') },
    { value: 'Livestock', label: t('insuranceProductTypes.Livestock') },
    { value: 'Asset', label: t('insuranceProductTypes.Asset') },
    { value: 'Weather', label: t('insuranceProductTypes.Weather') },
];

export const getCropStages = (t: any) => [
    { value: 'Planting', label: t('farmManagement.createCrop.stages.Planting') },
    { value: 'Vegetative', label: t('farmManagement.createCrop.stages.Vegetative') },
    { value: 'Flowering', label: t('farmManagement.createCrop.stages.Flowering') },
    { value: 'Fruiting', label: t('farmManagement.createCrop.stages.Fruiting') },
    { value: 'Harvesting', label: t('farmManagement.createCrop.stages.Harvesting') },
    { value: 'Post-Harvest', label: t('farmManagement.createCrop.stages.Post-Harvest') }
];

export const getObservationTypes = (t: any) => [
    { value: 'General Note', label: t('farmManagement.logObservation.types.General Note') },
    { value: 'Pest Sighting', label: t('farmManagement.logObservation.types.Pest Sighting') },
    { value: 'Disease Sighting', label: t('farmManagement.logObservation.types.Disease Sighting') },
    { value: 'Soil Condition', label: t('farmManagement.logObservation.types.Soil Condition') },
    { value: 'Weather Event', label: t('farmManagement.logObservation.types.Weather Event') },
    { value: 'Growth Stage Change', label: t('farmManagement.logObservation.types.Growth Stage Change') },
    { value: 'Irrigation Event', label: t('farmManagement.logObservation.types.Irrigation Event') },
];
