
import type { UserProfile, MarketplaceItem, ForumTopic, ForumPost, FeedItem, AgriEvent, MobileHomeCategory, MobileDiscoverItem } from './types';
import { STAKEHOLDER_ROLES, LISTING_TYPES, UNIFIED_MARKETPLACE_CATEGORY_IDS, AGRI_EVENT_TYPES, StakeholderRole } from './constants';
import { Sprout, Tractor, ShoppingBag, Cog, Users, BookOpen, Bot, TrendingUp, Briefcase, Package, Wheat, Truck, Leaf, ShieldAlert, Brain, Award, LandPlot, Wrench, Sparkles, CalendarDays, Search, User, MessageSquare, ShoppingCart as MarketIcon, Home, CircleDollarSign, GraduationCap, DraftingCompass, Warehouse, Apple, Carrot, Drumstick, Milk, Box, TestTube2, ShieldCheck, FlaskConical, Satellite, Sun, UserCheck, GitBranch, Recycle } from "lucide-react";

// This file provides placeholder data. In a real application, this data would be fetched from Firestore.
// The hardcoded text content will be replaced by translation keys.

// --- User Data for Avatars/Names (used in multiple places) ---
export const dummyUsersData: { [key: string]: { name: string, avatarUrl?: string, role?: StakeholderRole | string, headline?: string } } = {
  'userA': { name: 'Dr. Alima Bello', avatarUrl: 'https://placehold.co/40x40.png', headline: "Agricultural Economist & Supply Chain Specialist" },
  'userB': { name: 'GreenLeaf Organics Co-op', avatarUrl: 'https://placehold.co/40x40.png', headline: "Connecting Organic Farmers to Global Buyers" },
  'userC': { name: 'AgriTech Solutions Ltd.', avatarUrl: 'https://placehold.co/40x40.png', headline: "Pioneering Technology for Efficient Agriculture" },
  'farmerJoe': { name: 'Joe\'s Family Farm', role: 'Farmer', avatarUrl: 'https://placehold.co/150x150.png', headline: 'Sustainable corn and soy farmer.' },
  'agriLogisticsCo': { name: 'AgriLogistics Co-op', role: 'Logistics Partner (Third-Party Transporter)', avatarUrl: 'https://placehold.co/150x150.png', headline: 'Efficient produce aggregation and transport.' },
  'freshFoodsProcessor': { name: 'FreshFoods Processors Ltd.', role: 'Processing & Packaging Unit', avatarUrl: 'https://placehold.co/150x150.png', headline: 'IQF fruits and vegetable processing.' },
  'globalCommoditiesTrader': { name: 'Global Commodities Trading', role: 'Buyer (Restaurant, Supermarket, Exporter)', avatarUrl: 'https://placehold.co/150x150.png', headline: 'Specializing in coffee, cocoa, and sugar.' },
  'ecoHarvestRetail': { name: 'EcoHarvest Grocers', role: 'Buyer (Restaurant, Supermarket, Exporter)', avatarUrl: 'https://placehold.co/150x150.png', headline: 'Organic and locally sourced produce retailer.' }, // Adapted role
  'agriTechInnovator': { name: 'Dr. Lena Hanson', role: 'Researcher/Academic', avatarUrl: 'https://placehold.co/150x150.png', headline: 'Researcher in agricultural robotics and AI.' },
  'inputSolutionsInc': { name: 'Input Solutions Inc.', role: 'Input Supplier (Seed, Fertilizer, Pesticide)', avatarUrl: 'https://placehold.co/150x150.png', headline: 'Certified seeds and organic fertilizers.' },
  'agriProcessorSarah': { name: 'Sarah Chen - ValueChain Processors', role: 'Processing & Packaging Unit', avatarUrl: 'https://placehold.co/200x200.png', headline: 'Transforming raw produce into export-ready goods.' },
  'logisticsGuru': { name: 'Logistics Expert Mod', avatarUrl: 'https://placehold.co/40x40.png', role: 'Agronomy Expert/Consultant (External)', headline: 'Supply chain optimization expert.' },
  'freshProduceExporter': { name: 'Amina Exports Ltd.', avatarUrl: 'https://placehold.co/40x40.png', role: 'Agro-Export Facilitator/Customs Broker', headline: 'Exporting fresh mangoes and pineapples.' },
  'coldChainTech': { name: 'CoolTech Solutions', avatarUrl: 'https://placehold.co/40x40.png', role: 'Equipment Supplier (Sales of Machinery/IoT)', headline: 'Real-time temperature monitoring solutions.' },
  'logisticsConsultant': { name: 'Dr. Raj Singh', avatarUrl: 'https://placehold.co/40x40.png', role: 'Agronomy Expert/Consultant (External)', headline: 'Advising on warehouse optimization.' },
  'warehouseManagerAnna': { name: 'Anna Petrova', avatarUrl: 'https://placehold.co/40x40.png', role: 'Storage/Warehouse Facility', headline: 'Managing multi-commodity storage facilities.' },
  'storageSolutionsInc': { name: 'StoreSafe Systems', avatarUrl: 'https://placehold.co/40x40.png', role: 'Equipment Supplier (Sales of Machinery/IoT)', headline: 'Hermetic storage solutions provider.' },
  'currentUser': { name: 'My AgriBusiness', avatarUrl: 'https://placehold.co/40x40.png', role: 'Farmer', headline: 'Building sustainable food systems.'},
  'rajPatel': { name: "Raj Patel", avatarUrl: "https://placehold.co/40x40.png", headline: "Agri-Supply Chain Analyst"},
  'aishaBello': { name: "Aisha Bello", avatarUrl: "https://placehold.co/80x80.png", headline: "Founder, Sahel Organics | Connecting smallholder farmers to sustainable markets." },
  'currentDemoUser': { name: "Demo User", avatarUrl: "https://placehold.co/40x40.png", headline: "Agri-Enthusiast | DamDoh Platform"},
  'sug1': { name: 'Global Alliance for Food Security', role: 'Government Regulator/Auditor', avatarUrl: 'https://placehold.co/50x50.png', headline: 'Advocating for sustainable agriculture and food security worldwide. Connect to learn about policy initiatives.' }, 
  'sug2': { name: 'AgriLogistics Innovators Forum', role: 'Researcher/Academic', avatarUrl: 'https://placehold.co/50x50.png', headline: 'A forum for discussing cutting-edge supply chain technologies and logistics optimization in agriculture.' }, 
  'sug3': { name: 'DroughtResist Seeds Corp.', role: 'Input Supplier (Seed, Fertilizer, Pesticide)', avatarUrl: 'https://placehold.co/50x50.png', headline: 'Developing and supplying climate-resilient seed varieties for arid and semi-arid regions.' },
  'sugFarmerNetworkKenya': { name: 'Kenya Organic Farmers Network', role: 'Farmer', avatarUrl: 'https://placehold.co/50x50.png', headline: 'A network of organic farmers in Kenya sharing best practices and market access opportunities.' },
  'sugAgriFinanceIndia': { name: 'AgriFinance India', role: 'Financial Institution (Micro-finance/Loans)', avatarUrl: 'https://placehold.co/50x50.png', headline: 'Providing micro-loans and financial literacy training for smallholder farmers in India.' },
  'organicFarmKenya': {name: 'Organic Farm Kenya', avatarUrl: 'https://placehold.co/40x40.png', role: 'Farmer', headline: 'Certified organic produce from Kenya.'},
  'agroInputsGhana': {name: 'Agro Inputs Ghana', avatarUrl: 'https://placehold.co/40x40.png', role: 'Input Supplier (Seed, Fertilizer, Pesticide)', headline: 'Reliable supplier of farming inputs.'},
  'precisionAgNigeria': {name: 'Precision Ag Nigeria', avatarUrl: 'https://placehold.co/40x40.png', role: 'Agri-Tech Innovator/Developer', headline: 'Tech solutions for modern farming.'},
  'valueChainExperts': {name: 'Value Chain Experts', avatarUrl: 'https://placehold.co/40x40.png', role: 'Agronomy Expert/Consultant (External)', headline: 'Consulting for agricultural value chains.'},
  'landLeaseAfrica': {name: 'LandLease Africa', avatarUrl: 'https://placehold.co/40x40.png', role: 'Equipment Supplier (Sales of Machinery/IoT)', headline: 'Connecting farmers with available land.'}, 
  'vetServicesKenya': { name: 'Kenya Veterinary Services', avatarUrl: 'https://placehold.co/40x40.png', role: 'Agronomy Expert/Consultant (External)', headline: 'Mobile veterinary care for livestock.'}, 
  'exportDocsPro': { name: 'Export Docs Pro', avatarUrl: 'https://placehold.co/40x40.png', role: 'Agro-Export Facilitator/Customs Broker', headline: 'Assistance with agricultural export documentation.'},
  'honeyHarvestCo': { name: 'Honey Harvest Co-op', avatarUrl: 'https://placehold.co/40x40.png', role: 'Farmer', headline: 'Ethically sourced organic honey producers.'},
};

// --- Dashboard Feed Items ---
export const dummyFeedItems: FeedItem[] = [
  // This data is now fetched live from Firestore in MainDashboard.tsx
];

// --- Profiles Page Data ---
export const dummyProfiles: UserProfile[] = [
  // This data is now fetched live from Firestore in `[locale]/network/page.tsx`
];

// --- Network Page Data ---
export const dummySuggestedConnections: UserProfile[] = [
    // This data is now generated by AI in `DashboardRightSidebar.tsx`
];
export const dummyNetworkInterests = ['All', 'Grain Trading', 'Organic Inputs', 'Coffee Supply Chain', 'Precision Agriculture', 'Food Processing', 'Agri-Finance', 'Sustainable Sourcing', 'Cold Chain Logistics', 'Export Markets', 'Local Food Systems', 'Post-Harvest Technology', 'Water Management', 'Soil Health'];


// --- Marketplace Page Data (Unified) ---
export const dummyMarketplaceItems: MarketplaceItem[] = [
  // This data is now fetched live from Firestore in `[locale]/marketplace/page.tsx`
];

// --- Forum Topics Page Data ---
export const dummyForumTopics: ForumTopic[] = [
    // This data is now fetched live from Firestore in `[locale]/forums/page.tsx`
];

// --- Forum Topic Detail Page Data ---
export const dummyForumTopicDetail: ForumTopic = {
    // This data is now fetched live from Firestore in `[locale]/forums/[topicId]/page.tsx`
    id: '', name: '', description: '', postCount: 0, lastActivityAt: '', creatorId: '', icon: '', createdAt: '', updatedAt: ''
};

export const dummyForumPosts: ForumPost[] = [
    // This data is now fetched live from Firestore in `[locale]/forums/[topicId]/page.tsx`
];

export const dummyAgriEvents: AgriEvent[] = [
    // This data is now fetched live from Firestore in `[locale]/agri-events/page.tsx`
];


// --- Profile Detail Page Data ---
export const dummyProfileDetailsPageData: { profile: UserProfile, activity: any[] } = {
  profile: {
      id: '', displayName: '', email: '', primaryRole: '', createdAt: '', updatedAt: ''
  },
  activity: [
    // This data is now fetched live from Firestore in `[locale]/profiles/[id]/page.tsx`
  ]
};

// --- Mobile Homepage Data ---
export const mobileHomeCategories: MobileHomeCategory[] = [
  { id: 'cat1', name: 'Produce Market', icon: Apple, href: '/marketplace?category=fresh-produce-fruits', dataAiHint: "fresh vegetables" },
  { id: 'cat2', name: 'Farm Inputs', icon: ShoppingBag, href: '/marketplace?category=seeds-seedlings', dataAiHint: "seeds fertilizer" },
  { id: 'cat3', name: 'Talent Exchange', icon: Briefcase, href: '/talent-exchange', dataAiHint: "farm service" },
  { id: 'cat4', name: 'Machinery', icon: Tractor, href: '/marketplace?category=heavy-machinery-sale', dataAiHint: "farm tractor" },
  { id: 'cat5', name: 'Logistics', icon: Truck, href: '/marketplace?category=logistics-transport', dataAiHint: "supply chain" },
  { id: 'cat6', name: 'Knowledge Hub', icon: BookOpen, href: '/forums', dataAiHint: "learning resources" },
  { id: 'cat7', name: 'AI Assistant', icon: Bot, href: '/ai-assistant', dataAiHint: "ai agriculture" },
  { id: 'cat8', name: 'Events', icon: CalendarDays, href: '/agri-events', dataAiHint: "farm event" },
];

export const mobileDiscoverItems: MobileDiscoverItem[] = [
    // This data is now generated by AI in `MobileHomepage.tsx`
];
