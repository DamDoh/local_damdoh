
import type { StakeholderRole, UnifiedMarketplaceCategoryType, ListingType, AgriEventTypeConstant } from './constants';
import type { LucideIcon } from 'lucide-react'; // Keep if LucideIcon is used elsewhere
import type { z } from 'zod';
import type { 
  StakeholderProfileSchema, 
  MarketplaceItemSchema, 
  ForumTopicSchema, 
  ForumPostSchema,
  AgriEventSchema
} from './schemas';
import type { CategoryNode as CatNodeType } from './category-data'; // Import CategoryNode for use here

// Infer types from Zod schemas
export type UserProfile = z.infer<typeof StakeholderProfileSchema>;
export type MarketplaceItem = z.infer<typeof MarketplaceItemSchema>;
export interface MarketplaceItem extends z.infer<typeof MarketplaceItemSchema> {
  vtiId?: string; // Link to the Vibrant Traceability ID
}

// Note: MarketplaceItem type now reflects the expanded schema for products and services.
export type ExpandedMarketplaceItem = MarketplaceItem & {
  listingType: ListingType; // 'Product' or 'Service'
  // Fields specific to Services (optional for Products)
  serviceType?: string; // e.g., 'financial_service', 'logistics'
  priceDisplay?: string; // For non-fixed prices like 'Negotiable' or 'Rate varies'
  availabilityStatus?: string; // e.g., 'Available', 'Booking Required'
  relatedServiceDetailId?: string; // Link to a more detailed service-specific data structure if needed
  relatedFinancialProductId?: string; // Link to a detailed financial product if serviceType is 'financial_service'
};

export type ForumPost = z.infer<typeof ForumPostSchema>;
export type AgriEvent = z.infer<typeof AgriEventSchema>;
export type ForumTopic = z.infer<typeof ForumTopicSchema>; // Added ForumTopic type inference

// Extended types for Super App functionality

/**
 * Represents a social feed post.
 */
export interface Post {
 id: string;
 authorId: string; // User ID of the author
 content: string; // Text content of the post
 timestamp: string; // Creation timestamp
 likesCount: number;
 commentsCount: number;
 imageUrl?: string; // Optional image URL
 relatedListingId?: string; // Link to a Marketplace item
 relatedForumTopicId?: string; // Link to a Forum topic
}

/**
 * Represents a comment on a social feed post.
 */
export interface Comment {
 id: string;
 postId: string; // Link to the parent post
 authorId: string; // User ID of the author
 content: string; // Text content of the comment
 timestamp: string; // Creation timestamp
}

/**
 * Represents a like on a social feed post or comment.
 */
export interface Like {
 id: string;
 postId?: string; // Link to the liked post (if applicable)
 commentId?: string; // Link to the liked comment (if applicable)
 userId: string; // User ID of the user who liked
}

export type ExtendedUserProfile = UserProfile & {
  // Financial Data & Permissions
  financialConsent?: { [institutionId: string]: boolean }; // User consent for FIs
  creditScore?: number; // AI-derived or linked credit score
  marketplaceHistory?: { // Aggregated data from Marketplace interactions
    totalSalesValue?: number;
    totalPurchasesValue?: number;
    listingsCount?: number;
    transactionsCount?: number;
  };
  // Traceability Links
  traceabilityIds?: string[]; // Link to products/batches associated with this user
  // Network & Collaboration
  connectedUsers?: string[]; // IDs of users they are connected with
  groupMemberships?: string[]; // IDs of coops or groups they belong to
  // Permissions/Roles within the Super App
  superAppPermissions?: { [key: string]: boolean }; // Fine-grained permissions for specific features
};

// --- Detailed Data Interfaces for each Stakeholder Pillar ---
// These interfaces hold the specific data relevant to each stakeholder role.
// They are optional fields within ExtendedUserProfile, allowing for a flexible schema
// where a user profile can have data specific to their primary role(s).

/**
 * Detailed data for a Farmer stakeholder.
 */
export interface FarmerData {
  farms?: Farm[]; // Array of farms managed by this farmer
  cropsGrown?: string[]; // List of crops grown
  farmingPractices?: string[]; // e.g., ['Organic', 'No-Till', 'Irrigated']
  equipmentOwned?: string[]; // List of major equipment
  iotDevices?: IoTDevice[]; // Linked IoT devices on the farm
  plantingRecords?: PlantingRecord[]; // Historical planting data
  harvestRecords?: HarvestRecord[]; // Historical harvest data
  soilAnalysisResults?: SoilAnalysisResult[]; // Soil test data
  waterUsageRecords?: WaterUsageRecord[]; // Water consumption data
  inputUsageRecords?: InputUsageRecord[]; // Records of seeds, fertilizers, pesticides used
  certifications?: Certification[]; // Certifications held by the farm/farmer
  financialRecords?: FinancialRecord[]; // Basic on-farm financial data
}

/**
 * Detailed data for a Field Agent stakeholder.
 */
export interface FieldAgentData {
  assignedFarmers?: string[]; // IDs of farmers assigned to this agent
  visitLogs?: FieldVisitLog[]; // Records of farm visits
  assessmentReports?: AssessmentReport[]; // Reports on farm conditions or practices
  dataCollectionLogs?: DataCollectionLog[]; // Records of data collected
  expertise?: string[]; // Areas of agricultural expertise
}

/**
 * Detailed data for an Operations / Logistics Team stakeholder.
 */
export interface LogisticsData {
  fleet?: Vehicle[]; // Information about owned or managed vehicles
  shipmentRecords?: ShipmentRecord[]; // History of shipments handled
  routeOptimizationData?: RouteOptimizationData[]; // Data related to routing
  coldChainMonitoringData?: ColdChainData[]; // Temperature and humidity data during transport
  warehouseFacilities?: StorageFacility[]; // Linked storage/warehouse facilities
  serviceAreas?: string[]; // Geographical areas served
}

/**
 * Detailed data for a Quality Assurance (QA) Team stakeholder.
 */
export interface QAData {
  inspectionRecords?: InspectionRecord[]; // Records of quality inspections
  testingResults?: TestResult[]; // Laboratory test results (e.g., residue levels, nutrient content)
  qualityParametersSet?: QualityParameter[]; // Standards or parameters used for quality checks
  certificationAuditsPerformed?: AuditRecord[]; // Records of audits conducted
}

/**
 * Detailed data for a Processing & Packaging Unit stakeholder.
 */
export interface ProcessingData {
  processingFacilities?: ProcessingFacility[]; // Information about the processing plant(s)
  rawMaterialIntakeRecords?: RawMaterialIntake[]; // Records of raw produce received
  processingBatchRecords?: ProcessingBatch[]; // Data on processing batches and outputs
  packagingRecords?: PackagingRecord[]; // Details on packaging used
  equipmentMaintenanceLogs?: EquipmentMaintenance[]; // Maintenance history for machinery
  certificationsHeld?: Certification[]; // Certifications relevant to processing
}

/**
 * Detailed data for a Buyer stakeholder.
 */
export interface BuyerData {
  purchaseHistory?: Order[]; // Records of past orders
  productInterests?: string[]; // Types of products they are interested in
  qualityRequirements?: string; // Specific quality standards needed
  feedbackProvided?: Feedback[]; // Feedback given on received products/batches
  demandForecasts?: DemandForecast[]; // Optional: Buyer's demand forecast data
}

/**
 * Detailed data for an Input Supplier stakeholder.
 */
export interface InputSupplierData {
  productsSupplied?: string[]; // List of input types supplied (seeds, fertilizers, etc.)
  inventory?: SupplierInventoryItem[]; // Inventory of inputs
  distributionNetwork?: string[]; // Areas or regions they distribute to
  certificationsHeld?: Certification[]; // Certifications for their products
  technicalSupportOffered?: string; // Description of support services
}

/**
 * Detailed data for a Financial Institution stakeholder.
 */
export interface FinancialInstitutionData {
  financialProductsOffered?: FinancialProduct[]; // List of financial products (loans, insurance)
  loanApplicationRecords?: LoanApplication[]; // Records of loan applications processed
  creditAssessmentData?: CreditAssessmentData[]; // Data used for credit scoring (aggregated/anonymized)
  partnershipDetails?: PartnershipDetails[]; // Details of partnerships with other stakeholders
}

/**
 * Detailed data for a Government Regulator/Auditor stakeholder.
 */
export interface GovernmentData {
  regulationsManaged?: string[]; // List of relevant agricultural regulations
  auditRecords?: AuditRecord[]; // Records of regulatory audits performed
  policyUpdates?: PolicyUpdate[]; // Information on recent policy changes
  inspectionFindings?: InspectionFinding[]; // Results of regulatory inspections
}

/**
 * Detailed data for a Certification Body stakeholder.
 */
export interface CertificationBodyData {
  certificationsOffered?: string[]; // Types of certifications they issue (Organic, Fair Trade, GlobalG.A.P.)
  certifiedEntities?: string[]; // IDs of farmers, processors, etc. they have certified
  auditProtocols?: string; // Description of their audit processes
  certificationStandards?: string[]; // Links or references to the standards they use
}

/**
 * Detailed data for a Consumer stakeholder.
 */
export interface ConsumerData {
  purchaseHistory?: Order[]; // Records of product purchases (potentially linked to VTI)
  productPreferences?: string[]; // Preferred product attributes (organic, local, etc.)
  feedbackProvided?: Feedback[]; // Feedback on products consumed
  allergiesDietaryNeeds?: string[]; // Relevant health/dietary information (optional, with user consent)
  interestInSustainability?: boolean; // Indication of interest in sustainable products
}

/**
 * Detailed data for a Researcher/Academic stakeholder.
 */
export interface ResearcherData {
  researchAreas?: string[]; // Areas of agricultural research
  publications?: Publication[]; // List of research papers or reports
  datasetsAccessed?: string[]; // IDs or descriptions of datasets accessed via DamDoh (with permission)
  collaborationInterests?: string[]; // Topics for potential collaboration
}

/**
 * Detailed data for a Storage / Warehouse Facility stakeholder.
 */
export interface StorageData {
  facilityDetails?: StorageFacility[]; // Information about storage locations
  inventoryRecords?: WarehouseInventoryItem[]; // Records of stored goods
  storageConditionsMonitoring?: StorageConditionData[]; // Temperature, humidity, pest control data
  handlingEquipment?: string[]; // Types of equipment available (forklifts, etc.)
}

/**
 * Detailed data for an Agronomy Expert / Consultant (External) stakeholder.
 */
export interface AgronomyExpertData {
  areasOfSpecialty?: string[]; // Specific expertise (e.g., soil science, pest management, specific crops)
  consultationHistory?: ConsultationRecord[]; // Records of consultations provided
  recommendationsIssued?: Recommendation[]; // Agronomic recommendations given
  certificationsAccreditations?: string[]; // Professional certifications
}

// ... Add interfaces for other pillars as needed (e.g., Agro-Tourism, Energy Provider, etc.)

// Enhance ExtendedUserProfile to include optional data fields for each pillar
export type ExtendedUserProfile = UserProfile & {
  // Financial Data & Permissions
  financialConsent?: { [institutionId: string]: boolean }; // User consent for FIs
  creditScore?: number; // AI-derived or linked credit score
  marketplaceHistory?: { // Aggregated data from Marketplace interactions
    totalSalesValue?: number;
    totalPurchasesValue?: number;
    listingsCount?: number;
    transactionsCount?: number;
  };
  // Traceability Links
  traceabilityIds?: string[]; // Link to products/batches associated with this user
  // Network & Collaboration
  connectedUsers?: string[]; // IDs of users they are connected with
  groupMemberships?: string[]; // IDs of coops or groups they belong to
  // Permissions/Roles within the Super App
  superAppPermissions?: { [key: string]: boolean }; // Fine-grained permissions for specific features

  // Optional Detailed Stakeholder Data (based on their role)
  farmerData?: FarmerData;
  fieldAgentData?: FieldAgentData;
  logisticsData?: LogisticsData;
  qaData?: QAData;
  processingData?: ProcessingData;
  buyerData?: BuyerData;
  inputSupplierData?: InputSupplierData;
  financialInstitutionData?: FinancialInstitutionData;
  governmentData?: GovernmentData;
  certificationBodyData?: CertificationBodyData;
  consumerData?: ConsumerData;
  researcherData?: ResearcherData;
  storageData?: StorageData;
  agronomyExpertData?: AgronomyExpertData;
  // Add optional fields for other pillars as their interfaces are defined:
  // agroTourismData?: AgroTourismData;
  // energyProviderData?: EnergyProviderData;
  // agroExportData?: AgroExportData;
  // insuranceProviderData?: InsuranceProviderData;
  // packagingSupplierData?: PackagingSupplierData;
  // crowdfunderData?: CrowdfunderData;
};

// Re-export CategoryNode type from category-data.ts for easier access if needed elsewhere
export type CategoryNode = CatNodeType;

export type AgriEventType = AgriEventTypeConstant;

export interface NavItem {
 title: string;
 href: string;
 icon: React.ElementType;
 disabled?: boolean;
 external?: boolean;
 label?: string;
 description?: string;
 active?: boolean;
}

export interface PollOption {
 text: string;
 votes: number;
}
export interface FeedItem {
 id: string;
 type: 'forum_post' | 'marketplace_listing' | 'talent_listing' | 'connection' | 'shared_article' | 'industry_news' | 'success_story' | 'poll';
 timestamp: string;
 userId?: string;
 userName?: string;
 userAvatar?: string;
 userHeadline?: string;
 content?: string;
 postImage?: string;
 dataAiHint?: string;
 likesCount?: number;
 commentsCount?: number;
 link?: string;
 originTraceabilityId?: string; // Link FeedItem activity to a Traceability ID
 relatedUser?: {
 id: string;
 name: string;
 avatarUrl?: string;
  };
 pollOptions?: PollOption[];
}

// Conceptual Interfaces for New Super App Features

/**
 * Represents a conversation thread in the messaging module.
 */
export interface Conversation {
  id: string;
  participants: Pick<UserProfile, 'id' | 'name' | 'avatarUrl'>[]; // Basic info of participants
  lastMessage: Pick<Message, 'senderId' | 'content' | 'timestamp'>; // Summary of the last message
  unreadCount: number; // Number of unread messages for the current user
  updatedAt: string; // Timestamp of the last message or update
}

/**
 * Represents an individual message within a conversation.
 */
export interface Message {
  id: string;
  conversationId: string; // Link to the parent conversation
  senderId: string; // ID of the message sender
  content: string; // The message text
  timestamp: string; // Time the message was sent
  isRead: boolean; // Whether the recipient has read the message
}

/**
 * Represents a sustainability metric for a farm or user.
 */
export interface Metric {
  id: string;
  type: string; // e.g., "carbon_footprint", "water_usage_efficiency"
  value: number;
  unit: string; // e.g., "Tons CO2e", "%"
  timestamp: string; // When the metric was recorded or calculated
  description?: string; // Optional explanation of the metric
  relatedFarmId?: string; // Link to a specific farm if applicable
}

/**
 * Represents a sustainability or quality certification.
 */
export interface Certification {
  id: string;
  name: string; // e.g., "Organic Certified", "Fair Trade"
  issuingBody: string; // Organization that issued the certification
  validUntil: string; // Expiry date of the certification
  verificationLink?: string; // Link to verify the certification externally
  relatedFarmId?: string; // Link to a specific farm if applicable
  relatedProductId?: string; // Link to a specific product if applicable
}

/**
 * Represents an item in a farmer's inventory.
 */
export interface InventoryItem {
  id: string;
  farmId: string; // Link to the farm where inventory is held
  productName: string; // Name of the product (e.g., "Corn Seeds", "Fertilizer")
  quantity: number;
  unit: string; // e.g., "kg", "bags", "liters"
  storageLocation?: string; // Where the item is stored on the farm
  addedAt: string; // When the item was added to inventory
  lastUpdated?: string; // When the quantity or location was last updated
}

/**
 * Represents a conceptual link to a logistics tool or partner service.
 */
export interface LogisticsLink {
  id: string;
  name: string; // Name of the tool or service (e.g., "Schedule a Pickup", "Find a Trucker")
  href: string; // URL or internal route to the tool/service
  description?: string; // Brief description of the link
}


/**
 * Represents a conceptual Financial Service or product available through the Financial Hub.
 * This is highly simplified for conceptual purposes.
 */
export interface FinancialProduct {
  id: string;
  name: string; // e.g., "Farm Loan", "Input Financing", "Crop Insurance"
  provider: Pick<UserProfile, 'id' | 'name'>; // The Financial Institution providing the service
  description: string;
  link: string; // Link to apply or learn more
  targetAudience?: StakeholderRole[]; // Roles this product is relevant to
  requirements?: string[]; // Key requirements for eligibility
}

/**
 * Represents a conceptual Service Listing (beyond Marketplace products).
 * This could be for agricultural services, consulting, etc.
 */
export interface ServiceListing {
  id: string;
  providerId: string; // Link to the user providing the service
  title: string; // Title of the service (e.g., "Agronomy Consulting", "Tractor Repair")
  description: string;
  serviceType: string; // Category of service
  serviceArea?: string; // Geographical area served
  availability?: string; // How available the service provider is
  contactOptions?: string[]; // Ways to contact the provider
  pricingModel?: string; // How the service is priced (e.g., per hour, per project)
}

/**
 * Represents a single event in a product's journey, linked by a VTI.
 * This forms the immutable ledger of the product's history.
 */
export interface TraceabilityEvent {
  id: string; // Unique ID for this specific event
  vtiId: string; // The Vibrant Traceability ID for the product/batch
  eventType: string; // Type of event (e.g., 'planted', 'harvested', 'processed', 'shipped', 'quality_checked', 'purchased')
  timestamp: string; // When the event occurred
  location?: { // Where the event occurred (can be detailed or general)
    latitude?: number;
    longitude?: number;
    description?: string; // e.g., "Farm Field 3", "Warehouse A", "Port of Mombasa"
  };
  eventData?: { [key: string]: any }; // Flexible object to store event-specific data (e.g., yield, quality results, temperature)
  recordedByStakeholderId: string; // The ID of the stakeholder who recorded this event
  relatedEntities?: { // Links to other relevant entities
    farmId?: string;
    processingUnitId?: string;
    shipmentId?: string;
    certificationId?: string;
    orderId?: string;
    // Add other relevant entity IDs as needed
  };
}



// This Product type might be from an older structure or for a specific 'shops' module.
// The primary marketplace items are now defined by MarketplaceItem.
// We can keep this for now if it's used by src/app/shops/[shopId]/page.tsx
interface BaseProduct {
  id: string;
  shopId: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  images?: string[];
  location?: {
    latitude: number;
    longitude: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface FreshProduceProduct extends BaseProduct {
  category: 'Fresh Produce'; // This should align with UnifiedMarketplaceCategoryType if possible
  harvestDate?: Date;
  isOrganic?: boolean;
  certifications?: string[];
  minimumOrderQuantity?: string;
}

interface AgroInputsEquipmentProduct extends BaseProduct {
  category: 'Agro-Inputs & Equipment'; // Align with UnifiedMarketplaceCategoryType
  condition: 'new' | 'used';
  brand?: string;
  model?: string;
  year?: number;
}

interface AgriculturalServicesProduct extends BaseProduct {
  category: 'Agricultural Services'; // Align with UnifiedMarketplaceCategoryType
  serviceType: string;
  availability?: string;
  serviceArea?: string;
}

interface ProcessedDriedFoodsProduct extends BaseProduct {
  category: 'Processed/Dried Foods'; // Align with UnifiedMarketplaceCategoryType
  ingredients?: string[];
  allergens?: string[];
  packagingType?: string;
  expiryDate?: Date;
  certifications?: string[];
}

export type Product = FreshProduceProduct | AgroInputsEquipmentProduct | AgriculturalServicesProduct | ProcessedDriedFoodsProduct;
  relatedUser?: { 
    id: string;
    name: string;
 // Assuming avatarUrl is part of the user profile linked here
    avatarUrl?: string;
  };
  pollOptions?: PollOption[];
}

export interface DirectMessage {
  id: string;
  senderName: string; 
  senderAvatarUrl?: string;
  lastMessage: string; 
  timestamp: string; 
  unread?: boolean;
  dataAiHint?: string;
  relatedListingId?: string; // Link message to a Marketplace listing or other item
}

export interface MobileHomeCategory {
  id: string;
  name: string;
  icon: React.ElementType; 
  href: string;
  dataAiHint?: string;
}

export interface MobileDiscoverItem {
  id: string;
  title: string;
  imageUrl: string;
  type: 'Marketplace' | 'Forum' | 'Profile' | 'Service'; 
  link: string;
  dataAiHint?: string;
}

// This Product type might be from an older structure or for a specific 'shops' module.
// The primary marketplace items are now defined by MarketplaceItem.
// We can keep this for now if it's used by src/app/shops/[shopId]/page.tsx
interface BaseProduct {
  id: string;
  shopId: string; 
  name: string;
  description: string;
  price: number;
  unit: string; 
  images?: string[]; 
  location?: { 
    latitude: number;
    longitude: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface FreshProduceProduct extends BaseProduct {
  category: 'Fresh Produce'; // This should align with UnifiedMarketplaceCategoryType if possible
  harvestDate?: Date;
  isOrganic?: boolean;
  certifications?: string[];
  minimumOrderQuantity?: string;
}

interface AgroInputsEquipmentProduct extends BaseProduct {
  category: 'Agro-Inputs & Equipment'; // Align with UnifiedMarketplaceCategoryType
  condition: 'new' | 'used';
  brand?: string;
  model?: string;
  year?: number;
}

interface AgriculturalServicesProduct extends BaseProduct {
  category: 'Agricultural Services'; // Align with UnifiedMarketplaceCategoryType
  serviceType: string; 
  availability?: string; 
  serviceArea?: string; 
}

interface ProcessedDriedFoodsProduct extends BaseProduct {
  category: 'Processed/Dried Foods'; // Align with UnifiedMarketplaceCategoryType
  ingredients?: string[];
  allergens?: string[];
  packagingType?: string;
  expiryDate?: Date;
  certifications?: string[]; 
}

export type Product = FreshProduceProduct | AgroInputsEquipmentProduct | AgriculturalServicesProduct | ProcessedDriedFoodsProduct;
