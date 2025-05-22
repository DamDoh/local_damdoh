
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

// Unified Marketplace Categories
export const UNIFIED_MARKETPLACE_CATEGORIES = [
  'Agricultural Produce',
  'Inputs & Supplies',
  'Machinery & Equipment',
  'Professional Services & Labor',
  'Land & Tenancies',
] as const;
export type UnifiedMarketplaceCategoryType = typeof UNIFIED_MARKETPLACE_CATEGORIES[number];

export const LISTING_TYPES = ['Product', 'Service'] as const;
export type ListingType = typeof LISTING_TYPES[number];

// Filter options for Unified Marketplace page
export const UNIFIED_MARKETPLACE_FILTER_OPTIONS: Array<{ value: UnifiedMarketplaceCategoryType | 'All', label: string }> = [
  { value: 'All', label: 'All Categories' },
  ...UNIFIED_MARKETPLACE_CATEGORIES.map(cat => ({ value: cat, label: cat })),
];

export const LISTING_TYPE_FILTER_OPTIONS: Array<{ value: ListingType | 'All', label: string }> = [
  { value: 'All', label: 'All Types (Products & Services)' },
  ...LISTING_TYPES.map(type => ({ value: type, label: `${type}s` })),
];

// Form options for Marketplace creation (doesn't include "All")
export const UNIFIED_MARKETPLACE_FORM_CATEGORIES: Array<{ value: UnifiedMarketplaceCategoryType, label: string }> =
  UNIFIED_MARKETPLACE_CATEGORIES.map(cat => ({ value: cat, label: cat }));

export const LISTING_TYPE_FORM_OPTIONS: Array<{ value: ListingType, label: string }> =
  LISTING_TYPES.map(type => ({ value: type, label: type }));


// Old Talent Exchange constants - will be removed or deprecated by new unified system
// export const TALENT_CATEGORY_VALUES = ['Jobs & Recruitment', 'Land & Tenancies', 'Equipment Rentals & Services'] as const;
// export type TalentCategoryType = typeof TALENT_CATEGORY_VALUES[number];

// export const TALENT_FILTER_OPTIONS: Array<{ value: TalentCategoryType | 'All', label: string }> = [
//     { value: 'All', label: 'All Categories' },
//     ...TALENT_CATEGORY_VALUES.map(cat => ({ value: cat, label: cat }))
// ];

// export const TALENT_FORM_OPTIONS: Array<{ value: TalentCategoryType, label: string }> =
//     TALENT_CATEGORY_VALUES.map(cat => ({ value: cat, label: cat }));

// export const TALENT_LISTING_TYPE_VALUES = ['Job', 'Service'] as const;
// export type TalentListingTypeOld = typeof TALENT_LISTING_TYPE_VALUES[number];

// export const TALENT_LISTING_TYPE_FILTER_OPTIONS: Array<{value: TalentListingTypeOld | 'All', label: string}> = [
//     {value: 'All', label: 'All Listing Types'},
//     ...TALENT_LISTING_TYPE_VALUES.map(type => ({value: type, label: type}))
// ];

// export const TALENT_LISTING_TYPE_FORM_OPTIONS: Array<{value: TalentListingTypeOld, label: string}> = 
//     TALENT_LISTING_TYPE_VALUES.map(type => ({value: type, label: type}));


export const HOMEPAGE_PREFERENCE_KEY = "damdohHomepagePreference";

export const AGRI_EVENT_TYPES = ['Conference', 'Webinar', 'Workshop', 'Trade Show', 'Field Day', 'Networking Event'] as const;
export type AgriEventTypeConstant = typeof AGRI_EVENT_TYPES[number];

export const AGRI_EVENT_TYPE_FORM_OPTIONS: Array<{value: AgriEventTypeConstant, label: string}> =
    AGRI_EVENT_TYPES.map(type => ({value: type, label: type}));

export const AGRI_EVENT_FILTER_OPTIONS: Array<{value: AgriEventTypeConstant | 'All', label: string}> = [
    {value: 'All', label: 'All Event Types'},
    ...AGRI_EVENT_TYPES.map(type => ({value: type, label: type}))
];
