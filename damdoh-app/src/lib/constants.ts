
import { 
    Sprout, Tractor, ShoppingBag, Briefcase, Users, BookOpen, Bot, TrendingUp,
    Package, Wheat, Truck, Leaf, ShieldAlert, Brain, Award, LandPlot, Wrench,
    Sparkles, CalendarDays, Search, User, MessageSquare, ShoppingCart as MarketIcon,
    Home, CircleDollarSign, GraduationCap, DraftingCompass, Warehouse, Apple,
    Carrot, Drumstick, Milk, Box, TestTube2, ShieldCheck, FlaskConical, Satellite,
    Sun, UserCheck, GitBranch, Recycle, Bolt, Banknote, Calendar, Network,
    MessageSquare as ForumIcon, Building2, Medal, Globe, Compass, Clipboard, Factory,
    Lightbulb, Landmark, Scale 
} from 'lucide-react';
import { AGRICULTURAL_CATEGORIES } from './category-data';
import React from 'react';

export const APP_NAME = "DamDoh";

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
  'Insurance Provider'
] as const;

export type StakeholderRole = typeof STAKEHOLDER_ROLES[number];

export const STAKEHOLDER_ICONS: Record<StakeholderRole, React.ElementType> = {
    'Farmer': Sprout,
    'Agricultural Cooperative': Users,
    'Field Agent/Agronomist (DamDoh Internal)': Compass,
    'Operations/Logistics Team (DamDoh Internal)': Truck,
    'Quality Assurance Team (DamDoh Internal)': Clipboard,
    'Processing & Packaging Unit': Factory,
    'Buyer (Restaurant, Supermarket, Exporter)': Briefcase,
    'Input Supplier (Seed, Fertilizer, Pesticide)': ShoppingBag,
    'Equipment Supplier (Sales of Machinery/IoT)': Tractor,
    'Financial Institution (Micro-finance/Loans)': Landmark,
    'Government Regulator/Auditor': Scale,
    'Certification Body (Organic, Fair Trade etc.)': Medal,
    'Consumer': User,
    'Researcher/Academic': BookOpen,
    'Logistics Partner (Third-Party Transporter)': Truck,
    'Storage/Warehouse Facility': Warehouse,
    'Agronomy Expert/Consultant (External)': BookOpen,
    'Agro-Tourism Operator': Globe,
    'Energy Solutions Provider (Solar, Biogas)': Bolt,
    'Agro-Export Facilitator/Customs Broker': TrendingUp,
    'Agri-Tech Innovator/Developer': Lightbulb,
    'Waste Management & Compost Facility': Recycle,
    'Crowdfunder (Impact Investor, Individual)': Banknote,
    'Insurance Provider': ShieldCheck,
};


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
