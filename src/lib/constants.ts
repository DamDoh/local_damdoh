
import { AGRICULTURAL_CATEGORIES } from './category-data';
import type { LucideIcon } from "lucide-react";
import {
  Sprout, Tractor, Users, Briefcase, Truck, Warehouse, Award,
  BookOpen, Brain, TrendingUp, CircleDollarSign, GraduationCap,
  Home, GitBranch, Satellite, Sun, UserCheck, Recycle, Building2,
  Factory, ShoppingBag, Globe, Scale, Clipboard, Bolt, Banknote, ShieldCheck, Box
} from 'lucide-react';


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
  'Insurance Provider',
  'Packaging Supplier'
] as const;


export type StakeholderRole = typeof STAKEHOLDER_ROLES[number];

// Unified Marketplace Categories - Leaf nodes from AGRICULTURAL_CATEGORIES
export const UNIFIED_MARKETPLACE_CATEGORY_IDS = AGRICULTURAL_CATEGORIES.map(cat => cat.id) as [string, ...string[]];
export type UnifiedMarketplaceCategoryType = typeof UNIFIED_MARKETPLACE_CATEGORY_IDS[number];


export const LISTING_TYPES = ['Product', 'Service', 'AgroTourism'] as const;
export type ListingType = typeof LISTING_TYPES[number];

export const getListingTypeFilterOptions = (t: (key: string) => string) => {
  const types: Array<{ value: ListingType | 'All', label: string }> = [
    { value: 'All', label: t('listingTypes.All') },
    { value: 'Product', label: t('listingTypes.Product') },
    { value: 'Service', label: t('listingTypes.Service') },
    { value: 'AgroTourism', label: t('listingTypes.AgroTourism') }
  ];
  return types;
};


// Form options for Marketplace creation
export const UNIFIED_MARKETPLACE_FORM_CATEGORIES: Array<{ value: UnifiedMarketplaceCategoryType, label: string }> =
  AGRICULTURAL_CATEGORIES.map(cat => ({ value: cat.id as UnifiedMarketplaceCategoryType, label: cat.name }));


export const HOMEPAGE_PREFERENCE_KEY = "damdohHomepagePreference";

export const AGRI_EVENT_TYPES = ['Conference', 'Webinar', 'Workshop', 'Trade Show', 'Field Day', 'Networking Event', 'Online Course Launch', 'Policy Briefing'] as const;
export type AgriEventTypeConstant = typeof AGRI_EVENT_TYPES[number];

export const getAgriEventFilterOptions = (t: (key: string) => string) => {
  const types: Array<{ value: AgriEventTypeConstant | 'All', label: string }> = [
    { value: 'All', label: t('agriEventTypes.All') },
    { value: 'Conference', label: t('agriEventTypes.Conference') },
    { value: 'Webinar', label: t('agriEventTypes.Webinar') },
    { value: 'Workshop', label: t('agriEventTypes.Workshop') },
    { value: 'Trade Show', label: t('agriEventTypes.TradeShow') },
    { value: 'Field Day', label: t('agriEventTypes.FieldDay') },
    { value: 'Networking Event', label: t('agriEventTypes.NetworkingEvent') },
    { value: 'Online Course Launch', label: t('agriEventTypes.OnlineCourseLaunch') },
    { value: 'Policy Briefing', label: t('agriEventTypes.PolicyBriefing') }
  ];
  return types;
};


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
