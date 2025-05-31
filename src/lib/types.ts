
import type { StakeholderRole, UnifiedMarketplaceCategoryType, ListingType, AgriEventTypeConstant } from './constants';
import type { LucideIcon } from 'lucide-react';
import type { z } from 'zod';
import type { 
  StakeholderProfileSchema, 
  MarketplaceItemSchema, 
  ForumTopicSchema, 
  ForumPostSchema,
  AgriEventSchema
} from './schemas'; // Import Zod schemas

// Infer types from Zod schemas
export type UserProfile = z.infer<typeof StakeholderProfileSchema>;
export type MarketplaceItem = z.infer<typeof MarketplaceItemSchema>;
export type ForumTopic = z.infer<typeof ForumTopicSchema>;
export type ForumPost = z.infer<typeof ForumPostSchema>;
export type AgriEvent = z.infer<typeof AgriEventSchema>;

// Keep existing types that are not yet covered by Zod schemas or are UI specific
export type AgriEventType = AgriEventTypeConstant; // This was already based on constants

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

// For new category navigation (already in category-data.ts, kept for reference if used elsewhere)
export interface SubCategory {
  id: string;
  name: string;
  href: string;
  icon?: LucideIcon;
}
export interface MainCategory {
  id: string;
  name: string;
  icon: LucideIcon;
  subCategories: SubCategory[];
}

// Recursive ForumPost type for replies (if needed, Zod lazy handles this better)
// export interface ForumPostWithReplies extends ForumPost {
//   replies?: ForumPostWithReplies[];
// }
