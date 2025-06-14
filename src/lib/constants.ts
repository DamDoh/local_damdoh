
import { AGRICULTURAL_CATEGORIES } from './category-data';

export const APP_NAME = "DamDoh";

export const STAKEHOLDER_ROLES = [
  'Farmer', // Producer of raw agricultural products
  'Field Agent/Agronomist (DamDoh Internal)', // DamDoh staff providing field support
  'Operations/Logistics Team (DamDoh Internal)', // DamDoh staff managing supply chain ops
  'Quality Assurance Team (DamDoh Internal)', // DamDoh staff ensuring quality
  'Packaging & Dried Food Processing Unit', // Transforms raw produce
  'Buyer (Restaurant, Supermarket, Exporter)', // Purchases produce/processed goods
  'Input Supplier (Seed, Fertilizer, Pesticide)', // Sells agricultural inputs
  'Equipment Supplier (Sales of Machinery/IoT)', // Sells farm machinery and technology
  'Financial Institution (Micro-finance/Loans)', // Provides financial services
  'Government Regulator/Auditor', // Oversees compliance and policy
  'Certification Body (Organic, Fair Trade etc.)', // Provides certifications
  'Consumer', // End-user of agricultural products
  'Researcher/Academic', // Conducts agricultural research
  'Logistics Partner (Third-Party Transporter)', // Provides transportation services
  'Storage/Warehouse Facility', // Offers storage solutions
  'Agronomy Expert/Consultant (External)', // Offers specialized paid advisory
  'Agro-Tourism Operator', // Offers farm-based tourism experiences
  'Energy Solutions Provider (Solar, Biogas)', // Supplies sustainable energy solutions
  'Agro-Export Facilitator/Customs Broker', // Assists with international trade
  'Agri-Tech Innovator/Developer', // Develops new agricultural technologies
  'Retailer/City Market Seller', // Sells produce in local/urban markets
  'Waste Management & Compost Facility' // Processes agricultural waste
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
