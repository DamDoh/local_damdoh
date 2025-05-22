
import type { StakeholderRole, UnifiedMarketplaceCategoryType, ListingType } from './constants';
import type { LucideIcon } from 'lucide-react';


export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: StakeholderRole;
  location: string;
  bio?: string;
  profileSummary?: string; 
  yearsOfExperience?: number;
  areasOfInterest?: string[]; 
  needs?: string[]; 
  contactInfo?: {
    phone?: string;
    website?: string; 
  };
  connections?: string[]; 
}

export interface ForumTopic {
  id: string;
  title: string; 
  description: string;
  creatorId: string;
  createdAt: string; 
  postCount: number;
  lastActivityAt: string; 
  icon?: string; 
}

export interface ForumPost {
  id: string;
  topicId: string;
  authorId: string; 
  content: string; 
  createdAt: string; 
  updatedAt?: string; 
  likes: number;
  replies?: ForumPost[]; 
}

export interface MarketplaceItem {
  id:string;
  name: string; 
  listingType: ListingType; // 'Product' or 'Service'
  description: string;
  price: number; 
  currency: string;
  perUnit?: string; 
  sellerId: string; 
  category: UnifiedMarketplaceCategoryType; // Now refers to specific subcategory IDs
  location: string;
  imageUrl?: string;
  createdAt: string; 
  contactInfo?: string;
  dataAiHint?: string;
  isSustainable?: boolean;
  sellerVerification?: 'Verified' | 'Pending' | 'Unverified';
  aiPriceSuggestion?: {min: number, max: number, confidence: string};
  // Fields for 'Service' type listings
  skillsRequired?: string[]; 
  experienceLevel?: string; 
  compensation?: string; 
}

export type AgriEventType = 'Conference' | 'Webinar' | 'Workshop' | 'Trade Show' | 'Field Day' | 'Networking Event';

export interface AgriEvent {
  id: string;
  title: string;
  description: string;
  eventDate: string; 
  eventTime?: string; 
  location: string; 
  eventType: AgriEventType;
  organizer?: string;
  websiteLink?: string;
  imageUrl?: string;
  listerId: string; 
  createdAt: string; 
  dataAiHint?: string;
}


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

// For new category navigation
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
