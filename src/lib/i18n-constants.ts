
import type { LucideIcon } from "lucide-react";
import { STAKEHOLDER_ROLES, LISTING_TYPES, AGRI_EVENT_TYPES, FINANCIAL_SERVICE_TYPES, INSURANCE_SERVICE_TYPES } from './constants';
import { Sprout, Apple, Tractor, Briefcase, Bot, CalendarDays, Search, User, MessageSquare, ShoppingCart as MarketIcon, Home } from 'lucide-react';

export const getStakeholderRoles = (t: any) =>
  STAKEHOLDER_ROLES.map(role => ({
    value: role,
    label: t('stakeholderRoles.' + role.replace(/[^a-zA-Z0-9]/g, ''))
  }));
  
export const getListingTypeFilterOptions = (t: any) =>
  ([ 'All', ...LISTING_TYPES ] as const).map(type => ({
    value: type,
    label: t('listingTypes.' + type)
  }));
  
export const getAgriEventFilterOptions = (t: any) =>
  ([ 'All', ...AGRI_EVENT_TYPES ] as const).map(type => ({
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
    { value: 'Planting', label: t('cropStages.Planting') },
    { value: 'Vegetative', label: t('cropStages.Vegetative') },
    { value: 'Flowering', label: t('cropStages.Flowering') },
    { value: 'Fruiting', label: t('cropStages.Fruiting') },
    { value: 'Harvesting', label: t('cropStages.Harvesting') },
    { value: 'Post-Harvest', label: t('cropStages.Post-Harvest') }
];

export const getObservationTypes = (t: any) => [
    { value: 'General Note', label: t('observationTypes.GeneralNote') },
    { value: 'Pest Sighting', label: t('observationTypes.PestSighting') },
    { value: 'Disease Sighting', label: t('observationTypes.DiseaseSighting') },
    { value: 'Soil Condition', label: t('observationTypes.SoilCondition') },
    { value: 'Weather Event', label: t('observationTypes.WeatherEvent') },
    { value: 'Growth Stage Change', label: t('observationTypes.GrowthStageChange') },
    { value: 'Irrigation Event', label: t('observationTypes.IrrigationEvent') },
];

export const getMobileHomeCategories = (t: any): { id: string; name: string; icon: LucideIcon; href: string; dataAiHint?: string; }[] => [
    { id: 'cat1', name: t('produceMarket'), icon: Apple, href: '/marketplace?category=fresh-produce-fruits', dataAiHint: "fresh vegetables" },
    { id: 'cat2', name: t('farmInputs'), icon: Sprout, href: '/marketplace?category=seeds-seedlings', dataAiHint: "seeds fertilizer" },
    { id: 'cat3', name: t('talentExchange'), icon: Briefcase, href: '/talent-exchange', dataAiHint: "farm service" },
    { id: 'cat4', name: t('machinery'), icon: Tractor, href: '/marketplace?category=heavy-machinery-sale', dataAiHint: "farm tractor" },
    { id: 'cat5', name: t('community'), icon: Users, href: '/forums', dataAiHint: "community forum" },
    { id: 'cat6', name: t('aiAssistant'), icon: Bot, href: '/ai-assistant', dataAiHint: "ai agriculture" },
    { id: 'cat7', name: t('events'), icon: CalendarDays, href: '/agri-events', dataAiHint: "farm event" },
];
