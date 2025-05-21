
import type { UserProfile, MarketplaceItem, ForumTopic, ForumPost, TalentListing, FeedItem, DirectMessage, AgriEvent, AgriEventType } from './types';
import { STAKEHOLDER_ROLES } from './constants';

// --- User Data for Avatars/Names (used in multiple places) ---
export const dummyUsersData: { [key: string]: { name: string, avatarUrl?: string, role?: string, headline?: string } } = {
  'userA': { name: 'Dr. Alima Bello', avatarUrl: 'https://placehold.co/40x40.png', headline: "Agricultural Economist & Supply Chain Specialist" },
  'userB': { name: 'GreenLeaf Organics Co-op', avatarUrl: 'https://placehold.co/40x40.png', headline: "Connecting Organic Farmers to Global Buyers" },
  'userC': { name: 'AgriTech Solutions Ltd.', avatarUrl: 'https://placehold.co/40x40.png', headline: "Pioneering Technology for Efficient Agriculture" },
  'farmerJoe': { name: 'Joe\'s Family Farm', role: 'Farmer', avatarUrl: 'https://placehold.co/150x150.png', headline: 'Sustainable corn and soy farmer.' },
  'agriLogisticsCo': { name: 'AgriLogistics Co-op', role: 'Collection Agent', avatarUrl: 'https://placehold.co/150x150.png', headline: 'Efficient produce aggregation and transport.' },
  'freshFoodsProcessor': { name: 'FreshFoods Processors Ltd.', role: 'Processor', avatarUrl: 'https://placehold.co/150x150.png', headline: 'IQF fruits and vegetable processing.' },
  'globalCommoditiesTrader': { name: 'Global Commodities Trading', role: 'Trader', avatarUrl: 'https://placehold.co/150x150.png', headline: 'Specializing in coffee, cocoa, and sugar.' },
  'ecoHarvestRetail': { name: 'EcoHarvest Grocers', role: 'Retailer', avatarUrl: 'https://placehold.co/150x150.png', headline: 'Organic and locally sourced produce retailer.' },
  'agriTechInnovator': { name: 'Dr. Lena Hanson', role: 'Development Personnel', avatarUrl: 'https://placehold.co/150x150.png', headline: 'Researcher in agricultural robotics and AI.' },
  'inputSolutionsInc': { name: 'Input Solutions Inc.', role: 'Input Supplier', avatarUrl: 'https://placehold.co/150x150.png', headline: 'Certified seeds and organic fertilizers.' },
  'agriProcessorSarah': { name: 'Sarah Chen - ValueChain Processors', role: 'Processor', avatarUrl: 'https://placehold.co/200x200.png', headline: 'Transforming raw produce into export-ready goods.' },
  'logisticsGuru': { name: 'Logistics Expert Mod', avatarUrl: 'https://placehold.co/40x40.png', role: 'Moderator', headline: 'Supply chain optimization expert.' },
  'freshProduceExporter': { name: 'Amina Exports Ltd.', avatarUrl: 'https://placehold.co/40x40.png', role: 'Fruit Exporter', headline: 'Exporting fresh mangoes and pineapples.' },
  'coldChainTech': { name: 'CoolTech Solutions', avatarUrl: 'https://placehold.co/40x40.png', role: 'Cold Chain Technology Provider', headline: 'Real-time temperature monitoring solutions.' },
  'logisticsConsultant': { name: 'Dr. Raj Singh', avatarUrl: 'https://placehold.co/40x40.png', role: 'Supply Chain Consultant', headline: 'Advising on warehouse optimization.' },
  'warehouseManagerAnna': { name: 'Anna Petrova', avatarUrl: 'https://placehold.co/40x40.png', role: 'Warehouse Manager', headline: 'Managing multi-commodity storage facilities.' },
  'storageSolutionsInc': { name: 'StoreSafe Systems', avatarUrl: 'https://placehold.co/40x40.png', role: 'Storage Solutions Provider', headline: 'Hermetic storage solutions provider.' },
  'currentUser': { name: 'My AgriBusiness', avatarUrl: 'https://placehold.co/40x40.png', role: 'Agri-Entrepreneur', headline: 'Building sustainable food systems.'},
  'rajPatel': { name: "Raj Patel", avatarUrl: "https://placehold.co/40x40.png", headline: "Agri-Supply Chain Analyst"},
  'aishaBello': { name: "Aisha Bello", avatarUrl: "https://placehold.co/80x80.png", headline: "Founder, Sahel Organics | Connecting smallholder farmers to sustainable markets." },
  'currentDemoUser': { name: "Demo User", avatarUrl: "https://placehold.co/40x40.png", headline: "Agri-Enthusiast | DamDoh Platform"},
  // For Network Page
  'sc1': { name: 'AgriLogistics Global', role: 'Trader', avatarUrl: 'https://placehold.co/150x150.png', headline: 'Connecting European buyers with global agricultural producers. Specializing in grains, oilseeds, and sustainable commodities.'},
  'sc2': { name: 'EcoFertilizers Ltd.', role: 'Input Supplier', avatarUrl: 'https://placehold.co/150x150.png', headline: 'Provider of organic fertilizers and soil health solutions for smallholder farmers in East Africa. Seeking distribution partners.'},
  'sc3': { name: 'Maria Silva - Coffee Cooperative', role: 'Agricultural Cooperative', avatarUrl: 'https://placehold.co/150x150.png', headline: 'Manager of a cooperative of 200+ specialty coffee farmers. Focused on direct trade and quality improvement. Seeking buyers.'},
  'sc4': { name: 'TechFarm Solutions', role: 'Development Personnel', avatarUrl: 'https://placehold.co/150x150.png', headline: 'Develops and implements precision agriculture tools (drone imagery, IoT sensors) for optimizing farm inputs and yields.'},
  'sc5': { name: 'Asia Food Processors Inc.', role: 'Processor', avatarUrl: 'https://placehold.co/150x150.png', headline: 'Large-scale processor of tropical fruits and vegetables for export and local markets. Interested in sourcing from new farm clusters.'},
  'sc6': { name: 'FairHarvest Finance', role: 'Financial Institution', avatarUrl: 'https://placehold.co/150x150.png', headline: 'Impact investment fund providing trade finance and working capital for ethical agribusinesses in developing countries.'},
  // For Talent Exchange Page
  'kenyaFreshExports': { name: 'Kenya Fresh Exports', avatarUrl: 'https://placehold.co/40x40.png', headline: 'Exporters of premium Kenyan fresh produce.' },
  'organicGrowthAdvisors': { name: 'Organic Growth Advisors', avatarUrl: 'https://placehold.co/40x40.png', headline: 'Consultancy for organic certification.' },
  'agriBankCorp': { name: 'AgriBank Corp', avatarUrl: 'https://placehold.co/40x40.png', headline: 'Financial services for the agricultural sector.' },
  'landHoldingsLLC': { name: 'Land Holdings LLC', avatarUrl: 'https://placehold.co/40x40.png', headline: 'Connecting landowners with farmers.' },
  'skyAgroScout': { name: 'SkyAgro Scout', avatarUrl: 'https://placehold.co/40x40.png', headline: 'Drone-based crop scouting services.' },
  'midwestHarvestServices': { name: 'Midwest Harvest Services', avatarUrl: 'https://placehold.co/40x40.png', headline: 'Custom harvesting solutions.' },
  // For Marketplace Page
   'quinoaCoopPeru': { name: 'Quinoa Coop Peru', avatarUrl: 'https://placehold.co/40x40.png', headline: 'Fair Trade certified organic quinoa producers.' },
  'coolHaulLogistics': { name: 'CoolHaul Logistics', avatarUrl: 'https://placehold.co/40x40.png', headline: 'Refrigerated trucking services.' },
  'ecoGrowInputs': { name: 'EcoGrow Inputs', avatarUrl: 'https://placehold.co/40x40.png', headline: 'OMRI listed organic fertilizers.' },
  'seedTechResale': { name: 'SeedTech Resale', avatarUrl: 'https://placehold.co/40x40.png', headline: 'Resale of quality seed cleaning units.' },
  'sunnyAcresFarm': { name: 'Sunny Acres Farm', avatarUrl: 'https://placehold.co/40x40.png', headline: 'Sustainably grown fresh produce.' },
  'agriPlanExperts': { name: 'AgriPlan Experts', avatarUrl: 'https://placehold.co/40x40.png', headline: 'Consulting for agribusiness plans.' },
  // Forum topic creators
  'ethicaAgri': { name: 'Ethica Agri Group', avatarUrl: 'https://placehold.co/40x40.png', headline: 'Promoting ethical sourcing in agriculture.'},
  'foodSaverPro': { name: 'FoodSaver Professionals', avatarUrl: 'https://placehold.co/40x40.png', headline: 'Experts in post-harvest loss reduction.'},
  'marketAnalystAgri': { name: 'Agri Market Analyst', avatarUrl: 'https://placehold.co/40x40.png', headline: 'Analyzing global commodity market trends.'},
  'packagingInnovator': { name: 'Packaging Innovator Hub', avatarUrl: 'https://placehold.co/40x40.png', headline: 'Exploring sustainable food packaging.'},
  'agriFinanceExpert': { name: 'Agri Finance Expert', avatarUrl: 'https://placehold.co/40x40.png', headline: 'Advising on agribusiness funding.'},
  'traceTechLead': { name: 'TraceTech Lead', avatarUrl: 'https://placehold.co/40x40.png', headline: 'Implementing digital traceability solutions.'},
  // Event Listers
  'agriEventsGlobal': {name: 'AgriEvents Global', avatarUrl: 'https://placehold.co/40x40.png', headline: 'Organizers of international agricultural events.'},
  'virtualFarmingSummit': {name: 'Virtual Farming Summit Org.', avatarUrl: 'https://placehold.co/40x40.png', headline: 'Host of online farming summits.'},
  'harvestTechExpo': {name: 'HarvestTech Expo', avatarUrl: 'https://placehold.co/40x40.png', headline: 'Connecting technology with agriculture.'},
  // Sidebar Suggestions - Enriched
  'sug1': { name: 'Global Alliance for Food Security', role: 'Non-profit Organization', avatarUrl: 'https://placehold.co/50x50.png', headline: 'Advocating for sustainable agriculture and food security worldwide. Connect to learn about policy initiatives.' },
  'sug2': { name: 'AgriLogistics Innovators Forum', role: 'Community Group', avatarUrl: 'https://placehold.co/50x50.png', headline: 'A forum for discussing cutting-edge supply chain technologies and logistics optimization in agriculture.' },
  'sug3': { name: 'DroughtResist Seeds Corp.', role: 'Input Supplier', avatarUrl: 'https://placehold.co/50x50.png', headline: 'Developing and supplying climate-resilient seed varieties for arid and semi-arid regions.' },
  'sugFarmerNetworkKenya': { name: 'Kenya Organic Farmers Network', role: 'Farmer Cooperative', avatarUrl: 'https://placehold.co/50x50.png', headline: 'A network of organic farmers in Kenya sharing best practices and market access opportunities.' },
  'sugAgriFinanceIndia': { name: 'AgriFinance India', role: 'Financial Institution', avatarUrl: 'https://placehold.co/50x50.png', headline: 'Providing micro-loans and financial literacy training for smallholder farmers in India.' },
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
    link: '/forums/sustainable-farming/post123',
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
    link: '/marketplace/item-organic-ginger',
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
    link: '/profiles/agritech-solutions',
    postImage: "https://placehold.co/600x350.png",
    dataAiHint: "technology agriculture",
    likesCount: 210,
    commentsCount: 35,
  }
];

// --- Profiles Page Data ---
export const dummyProfiles: UserProfile[] = [
  { id: 'farmerJoe', name: dummyUsersData['farmerJoe'].name, role: 'Farmer', location: 'Iowa, USA', avatarUrl: dummyUsersData['farmerJoe'].avatarUrl, profileSummary: 'Fifth-generation corn and soybean farmer. Implementing precision agriculture techniques. Seeking partners for sustainable inputs and direct buyers.', email: 'joe.farm@example.com' },
  { id: 'agriLogisticsCo', name: dummyUsersData['agriLogisticsCo'].name, role: 'Collection Agent', location: 'Rural Hub, Kenya', avatarUrl: dummyUsersData['agriLogisticsCo'].avatarUrl, profileSummary: 'Farmer cooperative providing aggregation, warehousing, and transport services for smallholders. Connecting members to larger markets.', email: 'info@agrilogcoop.ke' },
  { id: 'freshFoodsProcessor', name: dummyUsersData['freshFoodsProcessor'].name, role: 'Processor', location: 'Industrial Park, Vietnam', avatarUrl: dummyUsersData['freshFoodsProcessor'].avatarUrl, profileSummary: 'Specializes in IQF fruits and vegetables for export. HACCP and GlobalG.A.P. certified. Seeking reliable farm suppliers.', email: 'sourcing@freshfoods.vn' },
  { id: 'globalCommoditiesTrader', name: dummyUsersData['globalCommoditiesTrader'].name, role: 'Trader', location: 'Geneva, Switzerland', avatarUrl: dummyUsersData['globalCommoditiesTrader'].avatarUrl, profileSummary: 'International trader of coffee, cocoa, and sugar. Focus on sustainable and traceable supply chains. Offers market insights.', email: 'trade@globalcommodities.ch' },
  { id: 'ecoHarvestRetail', name: dummyUsersData['ecoHarvestRetail'].name, role: 'Retailer', location: 'Urban Center, Canada', avatarUrl: dummyUsersData['ecoHarvestRetail'].avatarUrl, profileSummary: 'Retail chain focused on organic and locally sourced produce. Building direct relationships with farmers and food artisans.', email: 'buyer@ecoharvest.ca' },
  { id: 'agriTechInnovator', name: dummyUsersData['agriTechInnovator'].name, role: 'Development Personnel', location: 'Wageningen University, NL', avatarUrl: dummyUsersData['agriTechInnovator'].avatarUrl, profileSummary: 'Researcher in agricultural robotics and AI for crop monitoring. Open to industry collaborations and field trials.', email: 'lena.hanson@wur.nl' },
  { id: 'inputSolutionsInc', name: dummyUsersData['inputSolutionsInc'].name, role: 'Input Supplier', location: 'Midwest, USA', avatarUrl: dummyUsersData['inputSolutionsInc'].avatarUrl, profileSummary: 'Provider of certified seeds, organic fertilizers, and integrated pest management solutions. Technical support available.', email: 'sales@inputsolutions.ag' },
];

// --- Network Page Data ---
export const dummySuggestedConnections: UserProfile[] = [
  { id: 'sc1', name: dummyUsersData['sc1'].name, role: 'Trader', location: 'Rotterdam Port, Netherlands', avatarUrl: dummyUsersData['sc1'].avatarUrl, profileSummary: dummyUsersData['sc1'].headline, email: 'contact@agrilogistics.global'},
  { id: 'sc2', name: dummyUsersData['sc2'].name, role: 'Input Supplier', location: 'Nairobi, Kenya', avatarUrl: dummyUsersData['sc2'].avatarUrl, profileSummary: dummyUsersData['sc2'].headline, email: 'sales@ecofertilizers.ke'},
  { id: 'sc3', name: dummyUsersData['sc3'].name, role: 'Agricultural Cooperative', location: 'Minas Gerais, Brazil', avatarUrl: dummyUsersData['sc3'].avatarUrl, profileSummary: dummyUsersData['sc3'].headline, email: 'maria.silva@coffeecoop.br'},
  { id: 'sc4', name: dummyUsersData['sc4'].name, role: 'Development Personnel', location: 'Silicon Valley, CA', avatarUrl: dummyUsersData['sc4'].avatarUrl, profileSummary: dummyUsersData['sc4'].headline, email: 'info@techfarm.solutions'},
  { id: 'sc5', name: dummyUsersData['sc5'].name, role: 'Processor', location: 'Bangkok, Thailand', avatarUrl: dummyUsersData['sc5'].avatarUrl, profileSummary: dummyUsersData['sc5'].headline, email: 'sourcing@asiafoodpro.th'},
  { id: 'sc6', name: dummyUsersData['sc6'].name, role: 'Financial Institution', location: 'London, UK', avatarUrl: dummyUsersData['sc6'].avatarUrl, profileSummary: dummyUsersData['sc6'].headline, email: 'deals@fairharvest.finance'},
];
export const dummyNetworkInterests = ['All', 'Grain Trading', 'Organic Inputs', 'Coffee Supply Chain', 'Precision Agriculture', 'Food Processing', 'Agri-Finance', 'Sustainable Sourcing', 'Cold Chain Logistics', 'Export Markets', 'Local Food Systems', 'Post-Harvest Technology', 'Water Management', 'Soil Health'];


// --- Marketplace Page Data ---
export const dummyMarketplaceItems: MarketplaceItem[] = [
  { id: 'item1', name: 'Bulk Organic Quinoa (10 Tons)', description: 'High-altitude, Fair Trade certified organic quinoa from Peru. Ready for export. Seeking direct buyers or processors.', price: 3200, currency: 'USD', perUnit: '/ton', sellerId: 'quinoaCoopPeru', category: 'Agricultural Produce', location: 'Andes Region, Peru', imageUrl: 'https://placehold.co/300x200.png', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), contactInfo: 'Contact via DamDoh platform.', dataAiHint: "quinoa grains" },
  { id: 'item2', name: 'Refrigerated Trucking Services (Cross-Border)', description: 'Reliable cold chain logistics for perishable goods. Servicing US-Canada-Mexico routes. GPS tracked, temp-controlled fleet.', price: 0.85, currency: 'USD', perUnit: '/mile (estimate)', sellerId: 'coolHaulLogistics', category: 'Machinery & Business Services', location: 'Servicing North America', imageUrl: 'https://placehold.co/300x200.png', createdAt: new Date(Date.now() - 172800000).toISOString(), contactInfo: 'Request quote via profile.', dataAiHint: "truck logistics" },
  { id: 'item3', name: 'Certified Organic Fertilizer (NPK 5-3-2)', description: 'Bulk supply of OMRI listed organic fertilizer. Ideal for vegetable and fruit crops. Pelletized for easy application.', price: 650, currency: 'USD', perUnit: '/ton', sellerId: 'ecoGrowInputs', category: 'Inputs & Supplies', location: 'Global Shipping', imageUrl: 'https://placehold.co/300x200.png', createdAt: new Date(Date.now() - 259200000).toISOString(), contactInfo: 'inquiries@ecogrow.com', dataAiHint: "fertilizer bag" },
  { id: 'item4', name: 'Mobile Seed Cleaning & Sorting Unit', description: 'High-capacity mobile seed cleaning and optical sorting machine for sale. Gently used, excellent condition. Improves seed quality and reduces waste.', price: 45000, currency: 'USD', perUnit: 'unit', sellerId: 'seedTechResale', category: 'Machinery & Business Services', location: 'Midwest, USA', imageUrl: 'https://placehold.co/300x200.png', createdAt: new Date(Date.now() - 604800000).toISOString(), contactInfo: 'Book via platform.', dataAiHint: "seed cleaning machine" },
  { id: 'item5', name: 'Fresh Harvested Tomatoes (500kg)', description: 'Vine-ripened Roma tomatoes, perfect for processing or fresh market. Sustainably grown. Available for immediate pickup.', price: 1.20, currency: 'USD', perUnit: '/kg', sellerId: 'sunnyAcresFarm', category: 'Agricultural Produce', location: 'Local Farm Region, CA', imageUrl: 'https://placehold.co/300x200.png', createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), contactInfo: 'Contact for viewing.', dataAiHint: "tomatoes harvest" },
  { id: 'item6', name: 'Agricultural Business Plan Consulting', description: 'Expert consulting for developing bankable business plans, feasibility studies, and grant proposals for agribusinesses.', price: 150, currency: 'USD', perUnit: '/hour', sellerId: 'agriPlanExperts', category: 'Machinery & Business Services', location: 'Remote', imageUrl: 'https://placehold.co/300x200.png', createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), contactInfo: 'info@agriplan.com', dataAiHint: "business meeting" },
];

// --- Forum Topics Page Data ---
export const dummyForumTopics: ForumTopic[] = [
  { id: 'ft1', title: 'Sustainable Sourcing & Fair Trade Practices', description: 'Discuss ethical sourcing, certification, and building transparent supply chains for agricultural products.', postCount: 130, lastActivityAt: new Date(Date.now() - 2600000).toISOString(), creatorId: 'ethicaAgri', icon: 'Leaf', createdAt: new Date(Date.now() - 86400000 * 6).toISOString() },
  { id: 'ft2', title: 'Post-Harvest Loss Reduction Strategies', description: 'Share innovations and best practices for minimizing spoilage and waste from farm to consumer.', postCount: 95, lastActivityAt: new Date(Date.now() - 6200000).toISOString(), creatorId: 'foodSaverPro', icon: 'ShieldAlert', createdAt: new Date(Date.now() - 86400000 * 4).toISOString() },
  { id: 'ft3', title: 'Agri-Logistics & Cold Chain Management', description: 'Challenges and solutions in transporting perishable goods, warehouse management, and last-mile delivery.', postCount: 250, lastActivityAt: new Date(Date.now() - 900000).toISOString(), creatorId: 'logisticsGuru', icon: 'Truck', createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 'ft4', title: 'Global Commodity Market Trends & Price Volatility', description: 'Analysis of grain, coffee, cocoa, and other commodity markets. Hedging and risk management strategies.', postCount: 180, lastActivityAt: new Date(Date.now() - 76400000).toISOString(), creatorId: 'marketAnalystAgri', icon: 'TrendingUp', createdAt: new Date(Date.now() - 86400000 * 9).toISOString() },
  { id: 'ft5', title: 'Innovations in Food Packaging & Preservation', description: 'Exploring sustainable packaging options, shelf-life extension technologies, and food safety.', postCount: 70, lastActivityAt: new Date(Date.now() - 162800000).toISOString(), creatorId: 'packagingInnovator', icon: 'Package', createdAt: new Date(Date.now() - 86400000 * 12).toISOString() },
  { id: 'ft6', title: 'Access to Finance for Agribusinesses', description: 'Discussing funding sources, grant opportunities, and financial planning for agricultural SMEs and cooperatives.', postCount: 55, lastActivityAt: new Date(Date.now() - 249200000).toISOString(), creatorId: 'agriFinanceExpert', icon: 'Award', createdAt: new Date(Date.now() - 86400000 * 18).toISOString() },
  { id: 'ft7', title: 'Digital Traceability in Supply Chains', description: 'Implementing blockchain and other technologies for tracking products from farm to fork.', postCount: 110, lastActivityAt: new Date(Date.now() - 3600000 * 5).toISOString(), creatorId: 'traceTechLead', icon: 'Brain', createdAt: new Date(Date.now() - 86400000 * 7).toISOString() },
];

// --- Forum Topic Detail Page Data ---
export const dummyForumTopicDetail: ForumTopic = {
  id: 'agri-logistics', // Matches ft3 for linking
  title: 'Agri-Logistics & Cold Chain Management',
  description: 'A forum for discussing challenges and solutions in transporting perishable goods, warehouse optimization, last-mile delivery strategies, and cold chain technologies to reduce post-harvest losses and ensure quality.',
  postCount: 250, // Should ideally match the list view
  lastActivityAt: new Date(Date.now() - 900000).toISOString(),
  creatorId: 'logisticsGuru',
  icon: 'Truck',
  createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
};

export const dummyForumPosts: ForumPost[] = [
  {
    id: 'post1',
    topicId: 'agri-logistics',
    authorId: 'freshProduceExporter',
    content: "We're facing challenges with maintaining consistent temperature for mango shipments from West Africa to Europe. Any recommendations for affordable and reliable reefer container monitoring solutions? Also, looking for partners for shared container space.",
    createdAt: new Date(Date.now() - 10800000).toISOString(),
    likes: 28,
    replies: [
      { id: 'reply1', topicId: 'agri-logistics', authorId: 'coldChainTech', content: "For monitoring, check out 'TempSure IoT'. We offer real-time tracking with alerts. Regarding shared space, we might have some capacity on routes from Lagos. DM me your volume and destination.", createdAt: new Date(Date.now() - 7200000).toISOString(), likes: 12 },
      { id: 'reply2', topicId: 'agri-logistics', authorId: 'logisticsConsultant', content: "Beyond tech, ensure your pre-cooling protocols are robust. Improper pre-cooling is a common culprit. Happy to share a checklist if interested. Also, explore vacuum sealing for certain mango varieties.", createdAt: new Date(Date.now() - 3600000).toISOString(), likes: 9 },
    ]
  },
  {
    id: 'post2',
    topicId: 'agri-logistics',
    authorId: 'warehouseManagerAnna',
    content: "Seeking advice on optimizing warehouse layout for a multi-commodity storage facility (grains, pulses, some horticulture). How do you balance accessibility, FIFO, and pest control in a mixed-use space?",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    likes: 19,
     replies: [
      { id: 'reply3', topicId: 'agri-logistics', authorId: 'storageSolutionsInc', content: "Consider mobile racking systems for flexibility. We also provide hermetic storage bags for grains/pulses which can be very effective for pest control. We have case studies from similar facilities in East Africa.", createdAt: new Date(Date.now() - 80000000).toISOString(), likes: 7 },
    ]
  },
];


// --- Talent Exchange Page Data ---
export const dummyTalentListings: TalentListing[] = [
  { id: 'talent1', title: 'Supply Chain Manager (Perishables)', description: 'Seeking experienced Supply Chain Manager for our expanding fresh produce export business. Responsibilities include logistics, inventory, and supplier relations. Based in Nairobi.', type: 'Job', category: 'Jobs & Recruitment', listerId: 'kenyaFreshExports', location: 'Nairobi, Kenya', skillsRequired: ['Supply Chain Management', 'Cold Chain Logistics', 'Export Documentation', 'ERP Systems'], compensation: 'Competitive Salary + Benefits', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), dataAiHint: "office meeting" },
  { id: 'talent2', title: 'Organic Farm Certification Consultant', description: 'Offering consultancy services for farms transitioning to organic or seeking certifications (e.g., USDA Organic, EU Organic). Includes audit preparation and documentation support.', type: 'Service', category: 'Equipment Rentals & Services', listerId: 'organicGrowthAdvisors', location: 'Remote / Global', skillsRequired: ['Organic Standards (USDA, EU, JAS)', 'Farm Auditing', 'Sustainable Agriculture', 'Documentation'], compensation: 'Project-based or Daily Rate', createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), dataAiHint: "farm consultant" },
  { id: 'talent3', title: 'Agricultural Loan Officer', description: 'Financial institution seeks an Agricultural Loan Officer to manage a portfolio of agribusiness clients. Experience in credit analysis for farming and processing required.', type: 'Job', category: 'Jobs & Recruitment', listerId: 'agriBankCorp', location: 'Midwest, USA', skillsRequired: ['Agricultural Finance', 'Credit Analysis', 'Client Relationship Management', 'Risk Assessment'], compensation: '$80k - $110k + Bonus', createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), dataAiHint: "finance agriculture" },
  { id: 'talent4', title: 'Lease: 50 Hectares Prime Arable Land', description: '50 hectares of well-drained, fertile land available for long-term lease. Suitable for row crops or horticulture. Irrigation access available.', type: 'Service', category: 'Land & Tenancies', listerId: 'landHoldingsLLC', location: 'Central Valley, CA', skillsRequired: ['Sustainable Farming Practices'], compensation: 'Annual Lease per Hectare', createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), dataAiHint: "farmland aerial" },
  { id: 'talent5', title: 'Custom Drone-Based Crop Scouting Service', description: 'FAA-certified drone pilot offering NDVI analysis, pest detection, and plant health assessments for large-scale farms. Covering [State/Region].', type: 'Service', category: 'Equipment Rentals & Services', listerId: 'skyAgroScout', location: 'California, USA', skillsRequired: ['Drone Piloting (Fixed Wing & VTOL)', 'NDVI & Multispectral Analysis', 'GIS Mapping', 'Agronomy Basics'], compensation: 'Per Acre / Per Project', createdAt: new Date(Date.now() - 86400000 * 7).toISOString(), dataAiHint: "drone agriculture" },
  { id: 'talent6', title: 'Combine Harvester for Rent (with Operator)', description: 'John Deere S780 combine harvester available for rent during harvest season. Experienced operator included. Ideal for wheat, corn, soybeans.', type: 'Service', category: 'Equipment Rentals & Services', listerId: 'midwestHarvestServices', location: 'Iowa, USA', skillsRequired: ['Combine Operation', 'Grain Harvesting'], compensation: 'Per Hour / Per Acre', createdAt: new Date(Date.now() - 86400000 * 4).toISOString(), dataAiHint: "combine harvester" },
];

// --- Profile Detail Page Data ---
export const dummyProfileDetailsPageData: { profile: UserProfile, activity: any[] } = {
  profile: {
    id: 'agriProcessorSarah',
    name: 'Sarah Chen - ValueChain Processors',
    role: 'Processor',
    location: 'Agri-Food Hub, Singapore',
    avatarUrl: 'https://placehold.co/200x200.png',
    email: 'sarah.chen@valuechainprocessors.com', // Added email for UserProfile type
    profileSummary: 'CEO of ValueChain Processors, specializing in transforming raw agricultural produce (fruits, spices, grains) into high-quality, export-ready ingredients and packaged goods. Strong focus on food safety, traceability, and sustainable sourcing. Actively seeking new farm partnerships and innovative packaging solutions.',
    bio: "With over 20 years in the food processing industry, I've led ValueChain Processors to become a key player in the APAC region. Our state-of-the-art facilities are GFSI certified, and we work closely with farmer cooperatives to ensure quality inputs. We are committed to reducing post-harvest losses and adding value for our partners. I'm passionate about leveraging technology to improve supply chain efficiency and transparency. Looking to connect with input suppliers (especially organic), logistics providers, and buyers in Europe and North America.",
    yearsOfExperience: 20,
    areasOfInterest: ['Food Processing Technology', 'Sustainable Sourcing', 'Export Market Development', 'Supply Chain Traceability', 'Food Safety Standards (GFSI, HACCP)', 'Innovative Packaging', 'Value-Added Agriculture'],
    needs: ['Reliable Organic Raw Material Suppliers (e.g., ginger, turmeric, cashews)', 'Cold Chain Logistics Partners for Export', 'Distributors in EU/US Markets', 'Eco-friendly Packaging Innovations', 'Collaboration on Product Development'],
    contactInfo: {
      email: 'sarah.chen@valuechainprocessors.com',
      phone: '+65-555-0202',
      website: 'www.valuechainprocessors.com'
    },
    connections: ['farmerJoe', 'ecoHarvestRetail', 'globalCommoditiesTrader']
  },
  activity: [
    { id: 'post1', type: 'Forum Discussion Started', title: 'Seeking Best Practices for Cashew Nut Shell Liquid (CNSL) Extraction', date: '2024-05-15', link: '/forums/processing-tech/cnsl-extraction' },
    { id: 'item1', type: 'Marketplace Listing (Seeking)', title: 'RFP: Bulk Supply of Dried Mango Slices (Organic)', date: '2024-05-20', link: '/marketplace/rfp/dried-mango' },
    { id: 'post2', type: 'Shared Article', title: 'Report: APAC Food Processing Market Growth Trends 2025', date: '2024-05-10', link: '#' },
    { id: 'conn1', type: 'New Connection', title: 'Connected with GreenLeaf Organics Cooperative', date: '2024-05-22', link: '/profiles/greenleaf-organics' },
  ]
};

// --- Messaging Panel Data ---
export const dummyDirectMessages: DirectMessage[] = [
  { id: 'msg1', senderName: 'AgriLogistics Co-op', lastMessage: 'AgriLogistics Co-op: Your grain shipment is confirmed for Tuesday.', timestamp: '10:30 AM', senderAvatarUrl: 'https://placehold.co/40x40.png', unread: true, dataAiHint: "logistics company" },
  { id: 'msg2', senderName: 'Dr. Chen (Soil Scientist)', lastMessage: 'Dr. Chen sent the soil analysis report for your West field.', timestamp: 'Yesterday', senderAvatarUrl: 'https://placehold.co/40x40.png', dataAiHint: "scientist profile" },
  { id: 'msg3', senderName: 'Export Africa Group', lastMessage: 'Export Africa Group: New RFP for organic cashews posted.', timestamp: 'May 12', senderAvatarUrl: 'https://placehold.co/40x40.png', dataAiHint: "trade group" },
];

// --- Agri-Events Page Data ---
export const dummyAgriEvents: AgriEvent[] = [
  {
    id: 'event1',
    title: 'Global Agri-Tech Summit 2024',
    description: 'Join industry leaders, innovators, and policymakers to discuss the future of agricultural technology and sustainable farming practices. Keynotes on AI in agriculture, precision farming, and supply chain optimization.',
    eventDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(), // Approx. 1 month from now
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
    eventDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(), // Approx. 2 weeks from now
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
    eventDate: new Date(new Date().setDate(new Date().getDate() + 45)).toISOString(), // Approx. 1.5 months from now
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
    eventDate: new Date(new Date().setDate(new Date().getDate() + 60)).toISOString(), // Approx. 2 months
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
