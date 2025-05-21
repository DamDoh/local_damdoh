
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

export const MARKETPLACE_CATEGORY_VALUES = ['Agricultural Produce', 'Inputs & Supplies', 'Machinery & Business Services'] as const;

export type MarketplaceCategoryType = typeof MARKETPLACE_CATEGORY_VALUES[number];

export const MARKETPLACE_FILTER_OPTIONS: Array<{ value: MarketplaceCategoryType | 'All', label: string }> = [
  { value: 'All', label: 'All Categories' },
  ...MARKETPLACE_CATEGORY_VALUES.map(cat => ({ value: cat, label: cat }))
];

export const MARKETPLACE_FORM_OPTIONS: Array<{ value: MarketplaceCategoryType, label: string }> =
  MARKETPLACE_CATEGORY_VALUES.map(cat => ({ value: cat, label: cat }));

export const TALENT_CATEGORY_VALUES = ['Jobs & Recruitment', 'Land & Tenancies', 'Equipment Rentals & Services'] as const;
export type TalentCategoryType = typeof TALENT_CATEGORY_VALUES[number];

export const TALENT_FILTER_OPTIONS: Array<{ value: TalentCategoryType | 'All', label: string }> = [
    { value: 'All', label: 'All Categories' },
    ...TALENT_CATEGORY_VALUES.map(cat => ({ value: cat, label: cat }))
];

export const TALENT_FORM_OPTIONS: Array<{ value: TalentCategoryType, label: string }> =
    TALENT_CATEGORY_VALUES.map(cat => ({ value: cat, label: cat }));

export const TALENT_LISTING_TYPE_VALUES = ['Job', 'Service'] as const;
export type TalentListingType = typeof TALENT_LISTING_TYPE_VALUES[number];

export const TALENT_LISTING_TYPE_FILTER_OPTIONS: Array<{value: TalentListingType | 'All', label: string}> = [
    {value: 'All', label: 'All Listing Types'},
    ...TALENT_LISTING_TYPE_VALUES.map(type => ({value: type, label: type}))
];

export const TALENT_LISTING_TYPE_FORM_OPTIONS: Array<{value: TalentListingType, label: string}> = 
    TALENT_LISTING_TYPE_VALUES.map(type => ({value: type, label: type}));

export const HOMEPAGE_PREFERENCE_KEY = "damdohHomepagePreference";

export const AGRI_EVENT_TYPES = ['Conference', 'Webinar', 'Workshop', 'Trade Show', 'Field Day', 'Networking Event'] as const;
export type AgriEventTypeConstant = typeof AGRI_EVENT_TYPES[number];

export const AGRI_EVENT_TYPE_FORM_OPTIONS: Array<{value: AgriEventTypeConstant, label: string}> =
    AGRI_EVENT_TYPES.map(type => ({value: type, label: type}));

export const AGRI_EVENT_FILTER_OPTIONS: Array<{value: AgriEventTypeConstant | 'All', label: string}> = [
    {value: 'All', label: 'All Event Types'},
    ...AGRI_EVENT_TYPES.map(type => ({value: type, label: type}))
];
