
import { AGRICULTURAL_CATEGORIES } from './category-data';

export const APP_NAME = "DamDoh";

export const STAKEHOLDER_ROLES = [
  'Farmer',
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
  'Retailer/City Market Seller',
  'Waste Management & Compost Facility',
  'Crowdfunder (Impact Investor, Individual)' // Added from stakeholder doc
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

export const LISTING_TYPE_FILTER_OPTIONS: Array<{ value: ListingType | 'All', label: string }> = [
  { value: 'All', label: 'All Types (Products & Services)' },
  ...LISTING_TYPES.map(type => ({ value: type, label: `${type}s` })),
];

// Form options for Marketplace creation
export const UNIFIED_MARKETPLACE_FORM_CATEGORIES: Array<{ value: UnifiedMarketplaceCategoryType, label: string }> =
  AGRICULTURAL_CATEGORIES.map(cat => ({ value: cat.id as UnifiedMarketplaceCategoryType, label: cat.name }));

export const LISTING_TYPE_FORM_OPTIONS: Array<{ value: ListingType, label: string }> =
  LISTING_TYPES.map(type => ({ value: type, label: type }));


export const HOMEPAGE_PREFERENCE_KEY = "damdohHomepagePreference";

export const AGRI_EVENT_TYPES = ['Conference', 'Webinar', 'Workshop', 'Trade Show', 'Field Day', 'Networking Event', 'Online Course Launch', 'Policy Briefing'] as const;
export type AgriEventTypeConstant = typeof AGRI_EVENT_TYPES[number];

export const AGRI_EVENT_TYPE_FORM_OPTIONS: Array<{value: AgriEventTypeConstant, label: string}> =
    AGRI_EVENT_TYPES.map(type => ({value: type, label: type}));

export const AGRI_EVENT_FILTER_OPTIONS: Array<{value: AgriEventTypeConstant | 'All', label: string}> = [
    {value: 'All', label: 'All Event Types'},
    ...AGRI_EVENT_TYPES.map(type => ({value: type, label: type}))
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
