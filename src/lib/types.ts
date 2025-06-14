
import type { StakeholderRole, UnifiedMarketplaceCategoryType, ListingType, AgriEventTypeConstant } from './constants';
import type { LucideIcon } from 'lucide-react';
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
export type ForumPost = z.infer<typeof ForumPostSchema>;
export type AgriEvent = z.infer<typeof AgriEventSchema>;
export type ForumTopic = z.infer<typeof ForumTopicSchema>; // Added ForumTopic type inference


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
  relatedUser?: { 
    id: string;
    name: string;
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
