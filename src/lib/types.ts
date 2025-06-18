
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
