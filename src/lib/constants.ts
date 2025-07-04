
import { AGRICULTURAL_CATEGORIES } from './category-data';
import { getStakeholderRoles, getListingTypes, getAgriEventTypes, getFinancialServiceTypes, getInsuranceServiceTypes } from './i18n-constants';

export const APP_NAME = "DamDoh";

// These have been moved to the root i18n.ts file to be the single source of truth
// and to avoid dependency issues with the middleware.

export const STAKEHOLDER_ROLES = [
  'Farmer',
  'Agricultural Cooperative',
  'Field Agent/Agronomist (DamDoh Internal)',
  'Operations/Logistics Team (DamDoh Internal)',
  'Quality Assurance Team (DamDoh Internal)',
  'Processing & Packaging Unit',
  'Buyer (Restaurant, Supermarket, Exporter)',
  'Input Supplier (Seed, Fertilizer, Pesticide)',
  'Equipment Supplier (Sales of Machinery/IoT)',
  'Financial Institution (Micro-finance/Loans)',
  'Government Regulator/Auditor',
  'Certification Body (Organic, Fair Trade etc.)',
  'Consumer',
  'Researcher/Academic',
  'Logistics Partner (Third-Party Transporter)',
  'Storage/Warehouse Facility',
  'Agronomy Expert/Consultant (External)',
  'Agro-Tourism Operator',
  'Energy Solutions Provider (Solar, Biogas)',
  'Agro-Export Facilitator/Customs Broker',
  'Agri-Tech Innovator/Developer',
  'Waste Management & Compost Facility',
  'Crowdfunder (Impact Investor, Individual)',
  'Insurance Provider',
  'Packaging Supplier'
] as const;


export type StakeholderRole = typeof STAKEHOLDER_ROLES[number];

// Unified Marketplace Categories - Leaf nodes from AGRICULTURAL_CATEGORIES
export const UNIFIED_MARKETPLACE_CATEGORY_IDS = AGRICULTURAL_CATEGORIES.map(cat => cat.id) as [string, ...string[]];
export type UnifiedMarketplaceCategoryType = typeof UNIFIED_MARKETPLACE_CATEGORY_IDS[number];


export const LISTING_TYPES = ['Product', 'Service'] as const;
export type ListingType = typeof LISTING_TYPES[number];

// Filter options for Marketplace page
export const UNIFIED_MARKETPLACE_FILTER_OPTIONS: Array<{ value: UnifiedMarketplaceCategoryType | 'All', label: string }> = [
  { value: 'All', label: 'All Categories' },
  ...AGRICULTURAL_CATEGORIES.map(cat => ({ value: cat.id as UnifiedMarketplaceCategoryType, label: cat.name })),
];

export const getListingTypeFilterOptions = (t: any) => [
  { value: 'All', label: t('listingTypes.All') },
  ...getListingTypes(t).map(type => ({ value: type.value, label: `${type.label}s` })),
];

// Form options for Marketplace creation
export const UNIFIED_MARKETPLACE_FORM_CATEGORIES: Array<{ value: UnifiedMarketplaceCategoryType, label: string }> =
  AGRICULTURAL_CATEGORIES.map(cat => ({ value: cat.id as UnifiedMarketplaceCategoryType, label: cat.name }));

export const getListingTypeFormOptions = (t: any) =>
    getListingTypes(t).map(type => ({ value: type.value, label: type.label }));


export const HOMEPAGE_PREFERENCE_KEY = "damdohHomepagePreference";

export const AGRI_EVENT_TYPES = ['Conference', 'Webinar', 'Workshop', 'Trade Show', 'Field Day', 'Networking Event', 'Online Course Launch', 'Policy Briefing'] as const;
export type AgriEventTypeConstant = typeof AGRI_EVENT_TYPES[number];

export const getAgriEventTypeFormOptions = (t: any) =>
    getAgriEventTypes(t).map(type => ({value: type.value, label: type.label}));

export const getAgriEventFilterOptions = (t: any) => [
    {value: 'All', label: t('agriEventTypes.All')},
    ...getAgriEventTypes(t).map(type => ({value: type.value, label: type.label}))
];

// Added for financial services module
export const FINANCIAL_SERVICE_TYPES = [
  'loan', 'credit', 'grant', 'savings'
] as const;
export type FinancialServiceType = typeof FINANCIAL_SERVICE_TYPES[number];

// Added for insurance module
export const INSURANCE_SERVICE_TYPES = [
  'crop_insurance', 'livestock_insurance', 'property_insurance'
] as const;
export type InsuranceServiceType = typeof INSURANCE_SERVICE_TYPES[number];

// Icon mapping for Stakeholder Roles
import type { LucideIcon } from "lucide-react";
import {
  Sprout, Tractor, Users, Briefcase, Truck, Warehouse, Award,
  BookOpen, Brain, TrendingUp, CircleDollarSign, GraduationCap,
  Home, GitBranch, Satellite, Sun, UserCheck, Recycle, Building2,
  Factory, ShoppingBag, Globe, Scale, Clipboard, Bolt, Banknote, ShieldCheck, Box
} from 'lucide-react';

export const STAKEHOLDER_ICONS: Record<string, LucideIcon> = {
    'Farmer': Sprout,
    'Agricultural Cooperative': Building2,
    'Field Agent/Agronomist (DamDoh Internal)': UserCheck,
    'Operations/Logistics Team (DamDoh Internal)': Truck,
    'Quality Assurance Team (DamDoh Internal)': Clipboard,
    'Processing & Packaging Unit': Factory,
    'Buyer (Restaurant, Supermarket, Exporter)': Briefcase,
    'Input Supplier (Seed, Fertilizer, Pesticide)': ShoppingBag,
    'Equipment Supplier (Sales of Machinery/IoT)': Tractor,
    'Financial Institution (Micro-finance/Loans)': CircleDollarSign,
    'Government Regulator/Auditor': Scale,
    'Certification Body (Organic, Fair Trade etc.)': Award,
    'Consumer': Users,
    'Researcher/Academic': BookOpen,
    'Logistics Partner (Third-Party Transporter)': GitBranch,
    'Storage/Warehouse Facility': Warehouse,
    'Agronomy Expert/Consultant (External)': GraduationCap,
    'Agro-Tourism Operator': Home,
    'Energy Solutions Provider (Solar, Biogas)': Sun,
    'Agro-Export Facilitator/Customs Broker': Globe,
    'Agri-Tech Innovator/Developer': Brain,
    'Waste Management & Compost Facility': Recycle,
    'Crowdfunder (Impact Investor, Individual)': Banknote,
    'Insurance Provider': ShieldCheck,
    'Packaging Supplier': Box,
};
