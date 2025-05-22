
import { AGRICULTURAL_CATEGORIES } from './category-data';

export const APP_NAME = "DamDoh";

export const STAKEHOLDER_ROLES = [
  'Farmer',
  'Input Supplier',
  'Pre-Harvest Contractor',
  'Collection Agent',
  'Processor',
  'Trader',
  'Retailer',
  'Exporter',
  'Consumer',
  'Government Agency',
  'Agricultural Cooperative',
  'Financial Institution',
  'Trade Association',
  'Development Personnel',
] as const;

export type StakeholderRole = typeof STAKEHOLDER_ROLES[number];

// Unified Marketplace Categories - Now refers to the leaf nodes (subcategories)
export const UNIFIED_MARKETPLACE_CATEGORY_IDS = AGRICULTURAL_CATEGORIES.map(cat => cat.id) as [string, ...string[]]; // Ensure it's not an empty array for Zod enum
export type UnifiedMarketplaceCategoryType = typeof UNIFIED_MARKETPLACE_CATEGORY_IDS[number];


export const LISTING_TYPES = ['Product', 'Service'] as const;
export type ListingType = typeof LISTING_TYPES[number];

// Filter options for Marketplace page (using the new subcategories)
export const UNIFIED_MARKETPLACE_FILTER_OPTIONS: Array<{ value: UnifiedMarketplaceCategoryType | 'All', label: string }> = [
  { value: 'All', label: 'All Categories' },
  ...AGRICULTURAL_CATEGORIES.map(cat => ({ value: cat.id as UnifiedMarketplaceCategoryType, label: cat.name })),
];

export const LISTING_TYPE_FILTER_OPTIONS: Array<{ value: ListingType | 'All', label: string }> = [
  { value: 'All', label: 'All Types (Products & Services)' },
  ...LISTING_TYPES.map(type => ({ value: type, label: `${type}s` })),
];

// Form options for Marketplace creation (using the new subcategories)
export const UNIFIED_MARKETPLACE_FORM_CATEGORIES: Array<{ value: UnifiedMarketplaceCategoryType, label: string }> =
  AGRICULTURAL_CATEGORIES.map(cat => ({ value: cat.id as UnifiedMarketplaceCategoryType, label: cat.name }));

export const LISTING_TYPE_FORM_OPTIONS: Array<{ value: ListingType, label: string }> =
  LISTING_TYPES.map(type => ({ value: type, label: type }));


export const HOMEPAGE_PREFERENCE_KEY = "damdohHomepagePreference";

export const AGRI_EVENT_TYPES = ['Conference', 'Webinar', 'Workshop', 'Trade Show', 'Field Day', 'Networking Event'] as const;
export type AgriEventTypeConstant = typeof AGRI_EVENT_TYPES[number];

export const AGRI_EVENT_TYPE_FORM_OPTIONS: Array<{value: AgriEventTypeConstant, label: string}> =
    AGRI_EVENT_TYPES.map(type => ({value: type, label: type}));

export const AGRI_EVENT_FILTER_OPTIONS: Array<{value: AgriEventTypeConstant | 'All', label: string}> = [
    {value: 'All', label: 'All Event Types'},
    ...AGRI_EVENT_TYPES.map(type => ({value: type, label: type}))
];

