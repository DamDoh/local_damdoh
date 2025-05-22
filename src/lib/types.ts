
import type { StakeholderRole, UnifiedMarketplaceCategoryType, ListingType } from './constants';

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
  price: number; // Can be 0 or a placeholder for services if using 'compensation' field
  currency: string;
  perUnit?: string; // e.g. "/ton", "/kg", "/hour", "/project"
  sellerId: string; 
  category: UnifiedMarketplaceCategoryType; // Uses new unified categories
  location: string;
  imageUrl?: string;
  createdAt: string; 
  contactInfo?: string;
  dataAiHint?: string;
  isSustainable?: boolean;
  sellerVerification?: 'Verified' | 'Pending' | 'Unverified';
  aiPriceSuggestion?: {min: number, max: number, confidence: string};
  // Fields primarily for 'Service' type listings (previously from TalentListing)
  skillsRequired?: string[]; 
  experienceLevel?: string; 
  compensation?: string; // More descriptive for services, e.g., "Negotiable", "$50/hr", "Project-based"
}

// TalentCategory is deprecated, use UnifiedMarketplaceCategoryType with listingType='Service'
// export type TalentCategory = 'Jobs & Recruitment' | 'Land & Tenancies' | 'Equipment Rentals & Services';

// TalentListing is deprecated, its fields are merged into MarketplaceItem
// export interface TalentListing { ... }


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
