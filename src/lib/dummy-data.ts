
import type { UserProfile, MarketplaceItem, ForumTopic, ForumPost, FeedItem, DirectMessage, AgriEvent, MobileHomeCategory, MobileDiscoverItem } from './types';
import { STAKEHOLDER_ROLES, LISTING_TYPES, UNIFIED_MARKETPLACE_CATEGORY_IDS, AGRI_EVENT_TYPES } from './constants';
import { Sprout, Tractor, ShoppingBag, Cog, Users, BookOpen, Bot, TrendingUp, Briefcase, Package, Wheat, Truck, Leaf, ShieldAlert, Brain, Award, LandPlot, Wrench, Sparkles, CalendarDays, Search, User, MessageSquare, ShoppingCart as MarketIcon, Home, CircleDollarSign, GraduationCap, DraftingCompass, Warehouse, Apple, Carrot, Drumstick, Milk, Box, TestTube2, ShieldCheck, FlaskConical, Satellite, Sun, UserCheck, GitBranch, Recycle } from "lucide-react";


// --- User Data for Avatars/Names (used in multiple places) ---
export const dummyUsersData: { [key: string]: { name: string, avatarUrl?: string, role?: StakeholderRole | string, headline?: string } } = {
  'userA': { name: 'Dr. Alima Bello', avatarUrl: 'https://placehold.co/40x40.png', headline: "Agricultural Economist & Supply Chain Specialist" },
  'userB': { name: 'GreenLeaf Organics Co-op', avatarUrl: 'https://placehold.co/40x40.png', headline: "Connecting Organic Farmers to Global Buyers" },
  'userC': { name: 'AgriTech Solutions Ltd.', avatarUrl: 'https://placehold.co/40x40.png', headline: "Pioneering Technology for Efficient Agriculture" },
  'farmerJoe': { name: 'Joe\'s Family Farm', role: 'Farmer', avatarUrl: 'https://placehold.co/150x150.png', headline: 'Sustainable corn and soy farmer.' },
  'agriLogisticsCo': { name: 'AgriLogistics Co-op', role: 'Logistics Partner (Third-Party Transporter)', avatarUrl: 'https://placehold.co/150x150.png', headline: 'Efficient produce aggregation and transport.' },
  'freshFoodsProcessor': { name: 'FreshFoods Processors Ltd.', role: 'Packaging & Dried Food Processing Unit', avatarUrl: 'https://placehold.co/150x150.png', headline: 'IQF fruits and vegetable processing.' },
  'globalCommoditiesTrader': { name: 'Global Commodities Trading', role: 'Buyer (Restaurant, Supermarket, Exporter)', avatarUrl: 'https://placehold.co/150x150.png', headline: 'Specializing in coffee, cocoa, and sugar.' },
  'ecoHarvestRetail': { name: 'EcoHarvest Grocers', role: 'Retailer/City Market Seller', avatarUrl: 'https://placehold.co/150x150.png', headline: 'Organic and locally sourced produce retailer.' },
  'agriTechInnovator': { name: 'Dr. Lena Hanson', role: 'Researcher/Academic', avatarUrl: 'https://placehold.co/150x150.png', headline: 'Researcher in agricultural robotics and AI.' },
  'inputSolutionsInc': { name: 'Input Solutions Inc.', role: 'Input Supplier (Seed, Fertilizer, Pesticide)', avatarUrl: 'https://placehold.co/150x150.png', headline: 'Certified seeds and organic fertilizers.' },
  'agriProcessorSarah': { name: 'Sarah Chen - ValueChain Processors', role: 'Packaging & Dried Food Processing Unit', avatarUrl: 'https://placehold.co/200x200.png', headline: 'Transforming raw produce into export-ready goods.' },
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
  'sc1': { name: 'AgriLogistics Global', role: 'Buyer (Restaurant, Supermarket, Exporter)', avatarUrl: 'https://placehold.co/150x150.png', headline: 'Connecting European buyers with global agricultural producers. Specializing in grains, oilseeds, and sustainable commodities.'},
  'sc2': { name: 'EcoFertilizers Ltd.', role: 'Input Supplier (Seed, Fertilizer, Pesticide)', avatarUrl: 'https://placehold.co/150x150.png', headline: 'Provider of organic fertilizers and soil health solutions for smallholder farmers in East Africa. Seeking distribution partners.'},
  'sc3': { name: 'Maria Silva - Coffee Cooperative', role: 'Farmer', avatarUrl: 'https://placehold.co/150x150.png', headline: 'Manager of a cooperative of 200+ specialty coffee farmers. Focused on direct trade and quality improvement. Seeking buyers.'}, // Role simplified for broader category
  'sc4': { name: 'TechFarm Solutions', role: 'Agri-Tech Innovator/Developer', avatarUrl: 'https://placehold.co/150x150.png', headline: 'Develops and implements precision agriculture tools (drone imagery, IoT sensors) for optimizing farm inputs and yields.'},
  'sc5': { name: 'Asia Food Processors Inc.', role: 'Packaging & Dried Food Processing Unit', avatarUrl: 'https://placehold.co/150x150.png', headline: 'Large-scale processor of tropical fruits and vegetables for export and local markets. Interested in sourcing from new farm clusters.'},
  'sc6': { name: 'FairHarvest Finance', role: 'Financial Institution (Micro-finance/Loans)', avatarUrl: 'https://placehold.co/150x150.png', headline: 'Impact investment fund providing trade finance and working capital for ethical agribusinesses in developing countries.'},
  'kenyaFreshExports': { name: 'Kenya Fresh Exports', avatarUrl: 'https://placehold.co/40x40.png', role: 'Agro-Export Facilitator/Customs Broker', headline: 'Exporters of premium Kenyan fresh produce.' },
  'organicGrowthAdvisors': { name: 'Organic Growth Advisors', avatarUrl: 'https://placehold.co/40x40.png', role: 'Agronomy Expert/Consultant (External)', headline: 'Consultancy for organic certification.' },
  'agriBankCorp': { name: 'AgriBank Corp', avatarUrl: 'https://placehold.co/40x40.png', role: 'Financial Institution (Micro-finance/Loans)', headline: 'Financial services for the agricultural sector.' },
  'landHoldingsLLC': { name: 'Land Holdings LLC', avatarUrl: 'https://placehold.co/40x40.png', role: 'Equipment Supplier (Sales of Machinery/IoT)', headline: 'Connecting landowners with farmers.' }, // Role simplified for now
  'skyAgroScout': { name: 'SkyAgro Scout', avatarUrl: 'https://placehold.co/40x40.png', role: 'Agri-Tech Innovator/Developer', headline: 'Drone-based crop scouting services.' },
  'midwestHarvestServices': { name: 'Midwest Harvest Services', avatarUrl: 'https://placehold.co/40x40.png', role: 'Equipment Supplier (Sales of Machinery/IoT)', headline: 'Custom harvesting solutions.' }, // Role implies equipment services
  'quinoaCoopPeru': { name: 'Quinoa Coop Peru', avatarUrl: 'https://placehold.co/40x40.png', role: 'Farmer', headline: 'Fair Trade certified organic quinoa producers.' },
  'coolHaulLogistics': { name: 'CoolHaul Logistics', avatarUrl: 'https://placehold.co/40x40.png', role: 'Logistics Partner (Third-Party Transporter)', headline: 'Refrigerated trucking services.' },
  'ecoGrowInputs': { name: 'EcoGrow Inputs', avatarUrl: 'https://placehold.co/40x40.png', role: 'Input Supplier (Seed, Fertilizer, Pesticide)', headline: 'OMRI listed organic fertilizers.' },
  'seedTechResale': { name: 'SeedTech Resale', avatarUrl: 'https://placehold.co/40x40.png', role: 'Equipment Supplier (Sales of Machinery/IoT)', headline: 'Resale of quality seed cleaning units.' },
  'sunnyAcresFarm': { name: 'Sunny Acres Farm', avatarUrl: 'https://placehold.co/40x40.png', role: 'Farmer', headline: 'Sustainably grown fresh produce.' },
  'agriPlanExperts': { name: 'AgriPlan Experts', avatarUrl: 'https://placehold.co/40x40.png', role: 'Agronomy Expert/Consultant (External)', headline: 'Consulting for agribusiness plans.' },
  'ethicaAgri': { name: 'Ethica Agri Group', avatarUrl: 'https://placehold.co/40x40.png', role: 'Certification Body (Organic, Fair Trade etc.)', headline: 'Promoting ethical sourcing in agriculture.'},
  'foodSaverPro': { name: 'FoodSaver Professionals', avatarUrl: 'https://placehold.co/40x40.png', role: 'Agronomy Expert/Consultant (External)', headline: 'Experts in post-harvest loss reduction.'},
  'marketAnalystAgri': { name: 'Agri Market Analyst', avatarUrl: 'https://placehold.co/40x40.png', role: 'Researcher/Academic', headline: 'Analyzing global commodity market trends.'},
  'packagingInnovator': { name: 'Packaging Innovator Hub', avatarUrl: 'https://placehold.co/40x40.png', role: 'Input Supplier (Seed, Fertilizer, Pesticide)', headline: 'Exploring sustainable food packaging.'}, // Role implies supplying packaging
  'agriFinanceExpert': { name: 'Agri Finance Expert', avatarUrl: 'https://placehold.co/40x40.png', role: 'Financial Institution (Micro-finance/Loans)', headline: 'Advising on agribusiness funding.'},
  'traceTechLead': { name: 'TraceTech Lead', avatarUrl: 'https://placehold.co/40x40.png', role: 'Agri-Tech Innovator/Developer', headline: 'Implementing digital traceability solutions.'},
  'agriEventsGlobal': {name: 'AgriEvents Global', avatarUrl: 'https://placehold.co/40x40.png', headline: 'Organizers of international agricultural events.'},
  'virtualFarmingSummit': {name: 'Virtual Farming Summit Org.', avatarUrl: 'https://placehold.co/40x40.png', headline: 'Host of online farming summits.'},
  'harvestTechExpo': {name: 'HarvestTech Expo', avatarUrl: 'https://placehold.co/40x40.png', headline: 'Connecting technology with agriculture.'},
  'sug1': { name: 'Global Alliance for Food Security', role: 'Government Regulator/Auditor', avatarUrl: 'https://placehold.co/50x50.png', headline: 'Advocating for sustainable agriculture and food security worldwide. Connect to learn about policy initiatives.' }, // Role adapted
  'sug2': { name: 'AgriLogistics Innovators Forum', role: 'Researcher/Academic', avatarUrl: 'https://placehold.co/50x50.png', headline: 'A forum for discussing cutting-edge supply chain technologies and logistics optimization in agriculture.' }, // Role adapted
  'sug3': { name: 'DroughtResist Seeds Corp.', role: 'Input Supplier (Seed, Fertilizer, Pesticide)', avatarUrl: 'https://placehold.co/50x50.png', headline: 'Developing and supplying climate-resilient seed varieties for arid and semi-arid regions.' },
  'sugFarmerNetworkKenya': { name: 'Kenya Organic Farmers Network', role: 'Farmer', avatarUrl: 'https://placehold.co/50x50.png', headline: 'A network of organic farmers in Kenya sharing best practices and market access opportunities.' },
  'sugAgriFinanceIndia': { name: 'AgriFinance India', role: 'Financial Institution (Micro-finance/Loans)', avatarUrl: 'https://placehold.co/50x50.png', headline: 'Providing micro-loans and financial literacy training for smallholder farmers in India.' },
  'organicFarmKenya': {name: 'Organic Farm Kenya', avatarUrl: 'https://placehold.co/40x40.png', role: 'Farmer', headline: 'Certified organic produce from Kenya.'},
  'agroInputsGhana': {name: 'Agro Inputs Ghana', avatarUrl: 'https://placehold.co/40x40.png', role: 'Input Supplier (Seed, Fertilizer, Pesticide)', headline: 'Reliable supplier of farming inputs.'},
  'precisionAgNigeria': {name: 'Precision Ag Nigeria', avatarUrl: 'https://placehold.co/40x40.png', role: 'Agri-Tech Innovator/Developer', headline: 'Tech solutions for modern farming.'},
  'valueChainExperts': {name: 'Value Chain Experts', avatarUrl: 'https://placehold.co/40x40.png', role: 'Agronomy Expert/Consultant (External)', headline: 'Consulting for agricultural value chains.'},
  'landLeaseAfrica': {name: 'LandLease Africa', avatarUrl: 'https://placehold.co/40x40.png', role: 'Equipment Supplier (Sales of Machinery/IoT)', headline: 'Connecting farmers with available land.'}, // Simplified role
  'vetServicesKenya': { name: 'Kenya Veterinary Services', avatarUrl: 'https://placehold.co/40x40.png', role: 'Agronomy Expert/Consultant (External)', headline: 'Mobile veterinary care for livestock.'}, // Vets often act as consultants
  'exportDocsPro': { name: 'Export Docs Pro', avatarUrl: 'https://placehold.co/40x40.png', role: 'Agro-Export Facilitator/Customs Broker', headline: 'Assistance with agricultural export documentation.'},
  'honeyHarvestCo': { name: 'Honey Harvest Co-op', avatarUrl: 'https://placehold.co/40x40.png', role: 'Farmer', headline: 'Ethically sourced organic honey producers.'},
};

// --- Dashboard Feed Items ---
export const dummyFeedItems: FeedItem[] = [
  {
    id: 'feed1',
    type: 'forum_post',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    userId: 'userA',
    userName: dummyUsersData['userA'].name,
    userAvatar: dummyUsersData['userA'].avatarUrl,
    userHeadline: dummyUsersData['userA'].headline,
    content: 'Shared insights from the West Africa Post-Harvest Losses Summit. Key strategies discussed for improving storage and transportation for grains. Full report linked in the "Sustainable Agriculture" forum. #PostHarvest #FoodSecurity #AgriLogistics ...more',
    link: '/forums/ft2',
    postImage: "https://placehold.co/600x350.png",
    dataAiHint: "conference agriculture",
    likesCount: 78,
    commentsCount: 12,
  },
  {
    id: 'feed2',
    type: 'marketplace_listing',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    userId: 'userB',
    userName: dummyUsersData['userB'].name,
    userAvatar: dummyUsersData['userB'].avatarUrl,
    userHeadline: dummyUsersData['userB'].headline,
    content: "Fresh listing: 500kg of certified organic ginger, ready for export. Seeking partners in the European market. View specs and pricing on our Marketplace profile. #OrganicGinger #Export #DirectSourcing ...more",
    link: '/marketplace/item3',
    postImage: "https://placehold.co/600x400.png",
    dataAiHint: "ginger harvest",
    likesCount: 135,
    commentsCount: 22,
  },
   {
    id: 'feed3',
    type: 'success_story',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    userId: 'userC',
    userName: dummyUsersData['userC'].name,
    userAvatar: dummyUsersData['userC'].avatarUrl,
    userHeadline: dummyUsersData['userC'].headline,
    content: "Proud to announce our new partnership with 'FarmFresh Logistics' to implement AI-powered route optimization for their fleet, reducing fuel consumption by 15% and ensuring faster delivery of perishable goods! #AgriTech #Sustainability #LogisticsInnovation ...more",
    link: '/profiles/agriTechSolutions', // This ID needs to exist in dummyUsersData or dummyProfiles
    postImage: "https://placehold.co/600x350.png",
    dataAiHint: "technology agriculture",
    likesCount: 210,
    commentsCount: 35,
  }
];

// --- Profiles Page Data ---
export const dummyProfiles: UserProfile[] = Object.entries(dummyUsersData).map(([id, data]) => ({
  id,
  name: data.name,
  email: `${id.toLowerCase().replace(/\s+/g, '.')}@damdoh.example.com`, // Generic email
  role: data.role as StakeholderRole || STAKEHOLDER_ROLES[Math.floor(Math.random() * STAKEHOLDER_ROLES.length)], // Assign from data or random
  location: data.headline?.includes("Kenya") ? "Kenya" : data.headline?.includes("USA") ? "USA" : "Global", // Simple location logic
  avatarUrl: data.avatarUrl,
  profileSummary: data.headline || `A valued member of the ${APP_NAME} agricultural community.`,
  bio: `More information about ${data.name}, including their role as ${data.role || 'a valued stakeholder'}. Details coming soon.`,
  yearsOfExperience: Math.floor(Math.random() * 20) + 1,
  areasOfInterest: ["Sustainable Farming", "Market Access"], // Generic interests
  needs: ["New Buyers", "Logistics Support"], // Generic needs
  contactInfo: { website: `${id.toLowerCase().replace(/\s+/g, '')}.damdoh.example.com` },
  connections: [],
  createdAt: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(), // Random date in last 30 days
  updatedAt: new Date(Date.now() - Math.random() * 7 * 86400000).toISOString(), // Random date in last 7 days
}));


// --- Network Page Data ---
export const dummySuggestedConnections: UserProfile[] = dummyProfiles.slice(0, 6); // Use first 6 profiles as suggestions
export const dummyNetworkInterests = ['All', 'Grain Trading', 'Organic Inputs', 'Coffee Supply Chain', 'Precision Agriculture', 'Food Processing', 'Agri-Finance', 'Sustainable Sourcing', 'Cold Chain Logistics', 'Export Markets', 'Local Food Systems', 'Post-Harvest Technology', 'Water Management', 'Soil Health'];


// --- Marketplace Page Data (Unified) ---
export const dummyMarketplaceItems: MarketplaceItem[] = [
  // Products
  {
    id: 'item1', name: 'Bulk Organic Quinoa (10 Tons)', listingType: 'Product',
    description: 'High-altitude, Fair Trade certified organic quinoa from Peru. Ready for export. Seeking direct buyers or processors.',
    price: 3200, currency: 'USD', perUnit: '/ton', sellerId: 'quinoaCoopPeru',
    category: 'grains-cereals', location: 'Andes Region, Peru',
    imageUrl: 'https://placehold.co/400x300.png', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), updatedAt: new Date().toISOString(),
    contactInfo: 'Contact via DamDoh platform.', dataAiHint: "quinoa grains",
    isSustainable: true, sellerVerification: 'Verified',
    aiPriceSuggestion: {min: 3100, max: 3350, confidence: 'Medium'}
  },
  {
    id: 'item3', name: 'Certified Organic Fertilizer (NPK 5-3-2)', listingType: 'Product',
    description: 'Bulk supply of OMRI listed organic fertilizer. Ideal for vegetable and fruit crops. Pelletized for easy application.',
    price: 650, currency: 'USD', perUnit: '/ton', sellerId: 'ecoGrowInputs',
    category: 'fertilizers-soil', location: 'Global Shipping',
    imageUrl: 'https://placehold.co/400x300.png', createdAt: new Date(Date.now() - 259200000).toISOString(), updatedAt: new Date().toISOString(),
    contactInfo: 'inquiries@ecogrow.com', dataAiHint: "fertilizer bag",
    isSustainable: true, sellerVerification: 'Verified',
    aiPriceSuggestion: {min: 600, max: 700, confidence: 'High'}
  },
  {
    id: 'item4', name: 'Mobile Seed Cleaning & Sorting Unit', listingType: 'Product',
    description: 'High-capacity mobile seed cleaning and optical sorting machine for sale. Gently used, excellent condition. Improves seed quality and reduces waste.',
    price: 45000, currency: 'USD', perUnit: 'unit', sellerId: 'seedTechResale',
    category: 'heavy-machinery-sale', location: 'Midwest, USA',
    imageUrl: 'https://placehold.co/400x300.png', createdAt: new Date(Date.now() - 604800000).toISOString(), updatedAt: new Date().toISOString(),
    contactInfo: 'Book via platform.', dataAiHint: "seed cleaning machine",
    sellerVerification: 'Pending'
  },
  {
    id: 'item5', name: 'Fresh Harvested Tomatoes (500kg)', listingType: 'Product',
    description: 'Vine-ripened Roma tomatoes, perfect for processing or fresh market. Sustainably grown. Available for immediate pickup.',
    price: 1.20, currency: 'USD', perUnit: '/kg', sellerId: 'sunnyAcresFarm',
    category: 'fresh-produce-vegetables', location: 'Local Farm Region, CA',
    imageUrl: 'https://placehold.co/400x300.png', createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), updatedAt: new Date().toISOString(),
    contactInfo: 'Contact for viewing.', dataAiHint: "tomatoes harvest",
    isSustainable: true, sellerVerification: 'Verified',
    aiPriceSuggestion: {min: 1.10, max: 1.30, confidence: 'High'}
  },
  {
    id: 'item7', name: 'Drip Irrigation Kits (1 Acre Coverage)', listingType: 'Product',
    description: 'Complete drip irrigation kits for small to medium scale farms. Includes mainlines, laterals, emitters, and filter. Water efficient.',
    price: 300, currency: 'USD', perUnit: '/kit', sellerId: 'inputSolutionsInc',
    category: 'farm-tools-small-equip', location: 'Ships Worldwide',
    imageUrl: 'https://placehold.co/400x300.png', createdAt: new Date(Date.now() - 86400000 * 4).toISOString(), updatedAt: new Date().toISOString(),
    contactInfo: 'sales@inputsolutions.ag', dataAiHint: "irrigation system",
    isSustainable: true, sellerVerification: 'Verified'
  },
  {
    id: 'item9', name: 'Fresh Organic Mangoes (Kent)', listingType: 'Product',
    description: 'Box of 10kg export-quality Kent mangoes. Sweet and fiberless. GlobalG.A.P certified.',
    price: 25, currency: 'USD', perUnit: '/box', sellerId: 'kenyaFreshExports',
    category: 'fresh-produce-fruits', location: 'Mombasa, Kenya',
    imageUrl: 'https://placehold.co/400x300.png', createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), updatedAt: new Date().toISOString(),
    contactInfo: 'sales@kenyafresh.co.ke', dataAiHint: "mango fruit",
    isSustainable: true, sellerVerification: 'Verified', certifications: ['GlobalG.A.P.']
  },
  // Services
  {
    id: 'service1', name: 'Supply Chain Management Consultation', listingType: 'Service',
    description: 'Expert consultation for optimizing your agricultural supply chain, focusing on perishables. Improve logistics, inventory, and supplier relations.',
    category: 'agronomy-consultancy', sellerId: 'kenyaFreshExports', location: 'Nairobi, Kenya (Remote Available)',
    skillsRequired: ['Supply Chain Management', 'Cold Chain Logistics', 'Export Documentation', 'ERP Systems'],
    compensation: 'KES 15,000/day or Project-based', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), updatedAt: new Date().toISOString(),
    dataAiHint: "office meeting", imageUrl: 'https://placehold.co/400x300.png', contactInfo: 'Apply via DamDoh profile.',
    sellerVerification: 'Verified', experienceLevel: 'Expert (10+ years)'
  },
  {
    id: 'service2', name: 'Organic Farm Certification Guidance', listingType: 'Service',
    description: 'Comprehensive guidance for farms transitioning to organic or seeking certifications (e.g., USDA Organic, EU Organic). Includes audit preparation and documentation support.',
    category: 'certification-services', sellerId: 'organicGrowthAdvisors', location: 'Remote / Global',
    skillsRequired: ['Organic Standards (USDA, EU, JAS)', 'Farm Auditing', 'Sustainable Agriculture', 'Documentation'],
    compensation: 'Project-based or $120/hour', createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), updatedAt: new Date().toISOString(),
    dataAiHint: "farm consultant", imageUrl: 'https://placehold.co/400x300.png', contactInfo: 'info@organicgrowth.com',
    isSustainable: true, experienceLevel: 'Senior Consultant'
  },
  {
    id: 'service3', name: 'Lease: 50 Hectares Prime Arable Land', listingType: 'Service',
    description: '50 hectares of well-drained, fertile land available for long-term lease. Suitable for row crops or horticulture. Irrigation access available.',
    category: 'land-services', sellerId: 'landHoldingsLLC', location: 'Central Valley, CA',
    compensation: 'Negotiable Annual Lease ($500-$800/Ha/Year range)', createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), updatedAt: new Date().toISOString(),
    dataAiHint: "farmland aerial", imageUrl: 'https://placehold.co/400x300.png', contactInfo: 'Contact owner for terms.'
  },
  {
    id: 'service4', name: 'Custom Drone-Based Crop Scouting', listingType: 'Service',
    description: 'FAA-certified drone pilot offering NDVI analysis, pest detection, and plant health assessments for large-scale farms. Covering California.',
    category: 'technical-repair-services', sellerId: 'skyAgroScout', location: 'California, USA', // Changed category, more fitting
    skillsRequired: ['Drone Piloting (Fixed Wing & VTOL)', 'NDVI & Multispectral Analysis', 'GIS Mapping', 'Agronomy Basics'],
    compensation: '$5 - $10 / Acre / Per Project', createdAt: new Date(Date.now() - 86400000 * 7).toISOString(), updatedAt: new Date().toISOString(),
    dataAiHint: "drone agriculture", imageUrl: 'https://placehold.co/400x300.png', contactInfo: 'DroneScout@example.com', experienceLevel: 'Certified Professional'
  },
  {
    id: 'service5', name: 'Combine Harvester for Rent (with Operator)', listingType: 'Service',
    description: 'John Deere S780 combine harvester available for rent during harvest season. Experienced operator included. Ideal for wheat, corn, soybeans.',
    category: 'equipment-rental-operation', sellerId: 'midwestHarvestServices', location: 'Iowa, USA',
    skillsRequired: ['Combine Operation', 'Grain Harvesting', 'Machine Maintenance'],
    compensation: '$250/Hour or $50/Acre', createdAt: new Date(Date.now() - 86400000 * 4).toISOString(), updatedAt: new Date().toISOString(),
    dataAiHint: "combine harvester", imageUrl: 'https://placehold.co/400x300.png', contactInfo: 'Call to book.', experienceLevel: 'Experienced Operator'
  },
  {
    id: 'service10', name: 'Permaculture Design Course (Online)', listingType: 'Service',
    description: 'Comprehensive online course on permaculture design principles and practices for sustainable farm and garden development. Certificate upon completion.',
    category: 'training-education-services', sellerId: 'organicGrowthAdvisors', location: 'Online',
    compensation: '$150 per course enrollment', createdAt: new Date(Date.now() - 86400000 * 25).toISOString(), updatedAt: new Date().toISOString(),
    imageUrl: 'https://placehold.co/400x300.png', dataAiHint: "online course agriculture",
    isSustainable: true, skillsRequired: ['Permaculture Design', 'Sustainable Agriculture', 'Online Teaching']
  },
  {
    id: 'service11', name: 'Veterinary Services for Livestock', listingType: 'Service',
    description: 'Mobile veterinary services for cattle, sheep, and goats. Vaccinations, health checks, and emergency care. Serving Rift Valley region.',
    category: 'technical-repair-services', sellerId: 'vetServicesKenya', location: 'Rift Valley, Kenya', // Changed category
    skillsRequired: ['Large Animal Medicine', 'Vaccination Programs', 'Herd Health Management', 'Emergency Veterinary Care'],
    compensation: 'Call-out fee + service charges (e.g. KES 3000 call-out)', createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), updatedAt: new Date().toISOString(),
    dataAiHint: "veterinarian livestock", imageUrl: 'https://placehold.co/400x300.png', contactInfo: 'vet@kenyavets.co.ke', experienceLevel: 'Licensed Veterinarian (5+ years)'
  },
];

// --- Forum Topics Page Data ---
export const dummyForumTopics: ForumTopic[] = [
  { id: 'ft1', title: 'Sustainable Sourcing & Fair Trade Practices', description: 'Discuss ethical sourcing, certification, and building transparent supply chains for agricultural products.', postCount: 130, lastActivityAt: new Date(Date.now() - 2600000).toISOString(), creatorId: 'ethicaAgri', icon: 'Leaf', createdAt: new Date(Date.now() - 86400000 * 6).toISOString(), updatedAt: new Date().toISOString() },
  { id: 'ft2', title: 'Post-Harvest Loss Reduction Strategies', description: 'Share innovations and best practices for minimizing spoilage and waste from farm to consumer.', postCount: 95, lastActivityAt: new Date(Date.now() - 6200000).toISOString(), creatorId: 'foodSaverPro', icon: 'ShieldAlert', createdAt: new Date(Date.now() - 86400000 * 4).toISOString(), updatedAt: new Date().toISOString() },
  { id: 'ft3', title: 'Agri-Logistics & Cold Chain Management', description: 'Challenges and solutions in transporting perishable goods, warehouse management, and last-mile delivery.', postCount: 250, lastActivityAt: new Date(Date.now() - 900000).toISOString(), creatorId: 'logisticsGuru', icon: 'Truck', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), updatedAt: new Date().toISOString() },
  { id: 'ft4', title: 'Global Commodity Market Trends & Price Volatility', description: 'Analysis of grain, coffee, cocoa, and other commodity markets. Hedging and risk management strategies.', postCount: 180, lastActivityAt: new Date(Date.now() - 76400000).toISOString(), creatorId: 'marketAnalystAgri', icon: 'TrendingUp', createdAt: new Date(Date.now() - 86400000 * 9).toISOString(), updatedAt: new Date().toISOString() },
  { id: 'ft5', title: 'Innovations in Food Packaging & Preservation', description: 'Exploring sustainable packaging options, shelf-life extension technologies, and food safety.', postCount: 70, lastActivityAt: new Date(Date.now() - 162800000).toISOString(), creatorId: 'packagingInnovator', icon: 'Package', createdAt: new Date(Date.now() - 86400000 * 12).toISOString(), updatedAt: new Date().toISOString() },
  { id: 'ft6', title: 'Access to Finance for Agribusinesses', description: 'Discussing funding sources, grant opportunities, and financial planning for agricultural SMEs and cooperatives.', postCount: 55, lastActivityAt: new Date(Date.now() - 249200000).toISOString(), creatorId: 'agriFinanceExpert', icon: 'Award', createdAt: new Date(Date.now() - 86400000 * 18).toISOString(), updatedAt: new Date().toISOString() },
  { id: 'ft7', title: 'Digital Traceability in Supply Chains', description: 'Implementing blockchain and other technologies for tracking products from farm to fork.', postCount: 110, lastActivityAt: new Date(Date.now() - 3600000 * 5).toISOString(), creatorId: 'traceTechLead', icon: 'Brain', createdAt: new Date(Date.now() - 86400000 * 7).toISOString(), updatedAt: new Date().toISOString() },
];

// --- Forum Topic Detail Page Data ---
export const dummyForumTopicDetail: ForumTopic = {
  id: 'agri-logistics',
  title: 'Agri-Logistics & Cold Chain Management',
  description: 'A forum for discussing challenges and solutions in transporting perishable goods, warehouse optimization, last-mile delivery strategies, and cold chain technologies to reduce post-harvest losses and ensure quality.',
  postCount: 250,
  lastActivityAt: new Date(Date.now() - 900000).toISOString(),
  creatorId: 'logisticsGuru', // Assuming this user is in dummyUsersData
  icon: 'Truck',
  createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  updatedAt: new Date().toISOString(),
};

export const dummyForumPosts: ForumPost[] = [
  {
    id: 'post1',
    topicId: 'agri-logistics',
    authorId: 'freshProduceExporter',
    content: "We're facing challenges with maintaining consistent temperature for mango shipments from West Africa to Europe. Any recommendations for affordable and reliable reefer container monitoring solutions? Also, looking for partners for shared container space.",
    createdAt: new Date(Date.now() - 10800000).toISOString(),
    likes: 28,
  },
  // Removed replies from here to simplify, they are part of the type but often handled by fetching logic
  {
    id: 'post2',
    topicId: 'agri-logistics',
    authorId: 'warehouseManagerAnna',
    content: "Seeking advice on optimizing warehouse layout for a multi-commodity storage facility (grains, pulses, some horticulture). How do you balance accessibility, FIFO, and pest control in a mixed-use space?",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    likes: 19,
  },
];


// --- Profile Detail Page Data ---
export const dummyProfileDetailsPageData: { profile: UserProfile, activity: any[] } = {
  profile: dummyProfiles.find(p => p.id === 'agriProcessorSarah') || dummyProfiles[0], // Fallback if ID changes
  activity: [
    { id: 'activity1', type: 'Forum Discussion Started', title: 'Seeking Best Practices for Cashew Nut Shell Liquid (CNSL) Extraction', date: '2024-05-15', link: '/forums/ft5' },
    { id: 'activity2', type: 'Marketplace Listing (Seeking)', title: 'RFP: Bulk Supply of Dried Mango Slices (Organic)', date: '2024-05-20', link: '/marketplace/item1' }, // Changed link to an existing item for demo
    { id: 'activity3', type: 'Shared Article', title: 'Report: APAC Food Processing Market Growth Trends 2025', date: '2024-05-10', link: '#' },
    { id: 'activity4', type: 'New Connection', title: 'Connected with GreenLeaf Organics Cooperative', date: '2024-05-22', link: `/profiles/${dummyUsersData['userB']?.name.toLowerCase().replace(' ','-') || 'userB' }` }, // Changed link
  ]
};

// --- Messaging Panel Data ---
export const dummyDirectMessages: DirectMessage[] = [
  { id: 'msg1', senderName: dummyUsersData['agriLogisticsCo'].name, lastMessage: 'Your grain shipment is confirmed for Tuesday.', timestamp: '10:30 AM', senderAvatarUrl: dummyUsersData['agriLogisticsCo'].avatarUrl, unread: true, dataAiHint: "logistics company" },
  { id: 'msg2', senderName: dummyUsersData['userA'].name, lastMessage: 'Dr. Chen sent the soil analysis report for your West field.', timestamp: 'Yesterday', senderAvatarUrl: dummyUsersData['userA'].avatarUrl, dataAiHint: "scientist profile" },
  { id: 'msg3', senderName: dummyUsersData['freshProduceExporter'].name, lastMessage: 'New RFP for organic cashews posted.', timestamp: 'May 12', senderAvatarUrl: dummyUsersData['freshProduceExporter'].avatarUrl, dataAiHint: "trade group" },
];

// --- Agri-Events Page Data ---
export const dummyAgriEvents: AgriEvent[] = [
  {
    id: 'event1',
    title: 'Global Agri-Tech Summit 2024',
    description: 'Join industry leaders, innovators, and policymakers to discuss the future of agricultural technology and sustainable farming practices. Keynotes on AI in agriculture, precision farming, and supply chain optimization.',
    eventDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
    eventTime: '09:00',
    location: 'Online & San Francisco, CA',
    eventType: 'Conference',
    organizer: 'AgriEvents Global',
    websiteLink: 'https://example.com/agritech-summit',
    imageUrl: 'https://placehold.co/600x400.png',
    listerId: 'agriEventsGlobal',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    dataAiHint: "conference tech agriculture",
  },
  {
    id: 'event2',
    title: 'Webinar: Mastering Organic Certification',
    description: 'A step-by-step guide for farmers and processors looking to obtain or maintain organic certification. Covers standards, documentation, and audit preparation.',
    eventDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(),
    eventTime: '14:00',
    location: 'Online',
    eventType: 'Webinar',
    organizer: 'Organic Growth Advisors',
    websiteLink: 'https://example.com/organic-webinar',
    imageUrl: 'https://placehold.co/600x400.png',
    listerId: 'organicGrowthAdvisors',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    dataAiHint: "webinar agriculture",
  },
  {
    id: 'event3',
    title: 'Sustainable Farming Field Day',
    description: 'Visit a model farm implementing innovative sustainable practices, including cover cropping, no-till farming, and integrated pest management. Networking opportunities available.',
    eventDate: new Date(new Date().setDate(new Date().getDate() + 45)).toISOString(),
    eventTime: '10:00',
    location: 'Green Valley Farms, Ruralville',
    eventType: 'Field Day',
    organizer: 'Sunny Acres Farm',
    websiteLink: 'https://example.com/field-day',
    imageUrl: 'https://placehold.co/600x400.png',
    listerId: 'sunnyAcresFarm',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    dataAiHint: "farm field day",
  },
   {
    id: 'event4',
    title: 'Agri-Food Supply Chain Expo East Africa',
    description: 'The premier trade show for agricultural inputs, machinery, logistics, and processing solutions in East Africa. Connect with suppliers and buyers.',
    eventDate: new Date(new Date().setDate(new Date().getDate() + 60)).toISOString(),
    eventTime: '09:00',
    location: 'KICC, Nairobi, Kenya',
    eventType: 'Trade Show',
    organizer: 'HarvestTech Expo',
    websiteLink: 'https://example.com/agriexpo-ea',
    imageUrl: 'https://placehold.co/600x400.png',
    listerId: 'harvestTechExpo',
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    dataAiHint: "expo agriculture",
  },
];


// --- Mobile Homepage Data ---
export const mobileHomeCategories: MobileHomeCategory[] = [
  { id: 'cat1', name: 'Produce Market', icon: Apple, href: '/marketplace?category=fresh-produce-fruits', dataAiHint: "fresh vegetables" },
  { id: 'cat2', name: 'Farm Inputs', icon: ShoppingBag, href: '/marketplace?category=seeds-seedlings', dataAiHint: "seeds fertilizer" },
  { id: 'cat3', name: 'Agri-Services', icon: Briefcase, href: '/marketplace?listingType=Service&category=agronomy-consultancy', dataAiHint: "farm service" },
  { id: 'cat4', name: 'Machinery', icon: Tractor, href: '/marketplace?category=heavy-machinery-sale', dataAiHint: "farm tractor" },
  { id: 'cat5', name: 'Logistics', icon: Truck, href: '/marketplace?category=logistics-transport', dataAiHint: "supply chain" },
  { id: 'cat6', name: 'Knowledge Hub', icon: BookOpen, href: '/forums', dataAiHint: "learning resources" },
  { id: 'cat7', name: 'AI Assistant', icon: Bot, href: '/ai-assistant', dataAiHint: "ai agriculture" },
  { id: 'cat8', name: 'Events', icon: CalendarDays, href: '/agri-events', dataAiHint: "farm event" },
];

export const mobileDiscoverItems: MobileDiscoverItem[] = [
  { id: 'disc1', title: 'Fair Trade Coffee Beans', imageUrl: 'https://placehold.co/200x250.png', type: 'Marketplace', link: '/marketplace/item1', dataAiHint: "coffee beans" },
  { id: 'disc2', title: 'Join: Cold Chain Logistics Discussion', imageUrl: 'https://placehold.co/200x250.png', type: 'Forum', link: '/forums/ft3', dataAiHint: "logistics discussion" },
  { id: 'disc3', title: 'Sarah Chen: Processing Expert', imageUrl: dummyUsersData['agriProcessorSarah'].avatarUrl || 'https://placehold.co/200x250.png', type: 'Profile', link: '/profiles/agriProcessorSarah', dataAiHint: "business woman" },
  { id: 'disc4', title: 'Organic Certification Consulting', imageUrl: 'https://placehold.co/200x250.png', type: 'Service', link: '/marketplace/service2', dataAiHint: "organic farm" },
  { id: 'disc5', title: 'New Tractors Available', imageUrl: 'https://placehold.co/200x250.png', type: 'Marketplace', link: '/marketplace/item4', dataAiHint: "new tractor" },
  { id: 'disc6', title: 'Sustainable Farming Practices Forum', imageUrl: 'https://placehold.co/200x250.png', type: 'Forum', link: '/forums/ft1', dataAiHint: "sustainable farming" },
];

export const APP_NAME = "DamDoh"; // Ensure APP_NAME is exported if used in dummyProfiles
