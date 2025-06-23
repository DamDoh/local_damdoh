
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
import type { CategoryNode as CatNodeType } from './category-data';

// Infer types from Zod schemas
export type UserProfile = Omit<z.infer<typeof StakeholderProfileSchema>, 'role'> & {
  roles: StakeholderRole[];
};

export interface MarketplaceItem extends z.infer<typeof MarketplaceItemSchema> {
  vtiId?: string; // Link to the Vibrant Traceability ID
}

export type ForumPost = z.infer<typeof ForumPostSchema>;
export type AgriEvent = z.infer<typeof AgriEventSchema>;
export type ForumTopic = z.infer<typeof ForumTopicSchema>;

/**
 * Represents a social feed post.
 */
export interface Post {
  id: string;
  authorId: string;
  content: string;
  timestamp: string;
  likesCount: number;
  commentsCount: number;
  imageUrl?: string;
  relatedListingId?: string;
  relatedForumTopicId?: string;
}

/**
 * Represents a comment on a social feed post.
 */
export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  timestamp: string;
}

/**
 * Represents a like on a social feed post or comment.
 */
export interface Like {
  id: string;
  postId?: string;
  commentId?: string;
  userId: string;
}

/**
 * Represents a conversation thread in the messaging module.
 */
export interface Conversation {
  id: string;
  participants: Pick<UserProfile, 'id' | 'name' | 'avatarUrl'>[];
  lastMessage: Pick<Message, 'senderId' | 'content' | 'timestamp'>;
  unreadCount: number;
  updatedAt: string;
}

/**
 * Represents an individual message within a conversation.
 */
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

/**
 * Represents a sustainability or quality certification.
 */
export interface Certification {
  id: string;
  name: string;
  issuingBody: string;
  validUntil: string;
  verificationLink?: string;
  relatedFarmId?: string;
  relatedProductId?: string;
}

/**
 * Represents a conceptual Financial Service or product available through the Financial Hub.
 */
export interface FinancialProduct {
  id: string;
  name: string;
  provider: Pick<UserProfile, 'id' | 'name'>;
  description: string;
  link: string;
  targetAudience?: StakeholderRole[];
  requirements?: string[];
}

/**
 * Represents a single event in a product's journey, linked by a VTI.
 */
export interface TraceabilityEvent {
  vtiId: string;
  timestamp: string;
  eventType: string;
  actorRef: string;
  geoLocation: {
    lat: number;
    lng: number;
  };
  payload: { [key: string]: any };
}

// Re-export CategoryNode type from category-data.ts for easier access if needed elsewhere
export type CategoryNode = CatNodeType;

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
  agriEvent?: AgriEvent;
  originTraceabilityId?: string;
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
  relatedListingId?: string;
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
  category: 'Fresh Produce';
  harvestDate?: Date;
  isOrganic?: boolean;
  certifications?: string[];
  minimumOrderQuantity?: string;
}

interface AgroInputsEquipmentProduct extends BaseProduct {
  category: 'Agro-Inputs & Equipment';
  condition: 'new' | 'used';
  brand?: string;
  model?: string;
  year?: number;
}

interface AgriculturalServicesProduct extends BaseProduct {
  category: 'Agricultural Services';
  serviceType: string; 
  availability?: string; 
  serviceArea?: string; 
}

interface ProcessedDriedFoodsProduct extends BaseProduct {
  category: 'Processed/Dried Foods';
  ingredients?: string[];
  allergens?: string[];
  packagingType?: string;
  expiryDate?: Date;
  certifications?: string[]; 
}

export type Product = FreshProduceProduct | AgroInputsEquipmentProduct | AgriculturalServicesProduct | ProcessedDriedFoodsProduct;
