import type { StakeholderRole } from './constants';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: StakeholderRole;
  location: string;
  bio?: string;
  profileSummary?: string; // AI Generated
  yearsOfExperience?: number;
  areasOfInterest?: string[]; // Could be tags
  needs?: string[]; // Could be tags
  contactInfo?: {
    phone?: string;
    website?: string;
  };
  connections?: string[]; // Array of user IDs
}

export interface ForumTopic {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  createdAt: string; // ISO date string
  postCount: number;
  lastActivityAt: string; // ISO date string
  icon?: string; // Lucide icon name
}

export interface ForumPost {
  id: string;
  topicId: string;
  authorId: string;
  content: string;
  createdAt: string; // ISO date string
  updatedAt?: string; // ISO date string
  likes: number;
  replies?: ForumPost[]; // For threaded replies
}

export interface MarketplaceItem {
  id:string;
  name: string;
  description: string;
  price: number;
  currency: string;
  sellerId: string;
  category: string; // e.g., Produce, Equipment, Seeds
  location: string;
  imageUrl?: string;
  createdAt: string; // ISO date string
  contactInfo?: string;
}

export interface TalentListing {
  id: string;
  title: string;
  description: string;
  type: 'Job' | 'Service'; // Job opening or service offered
  listerId: string;
  location: string;
  skillsRequired?: string[];
  experienceLevel?: string; // e.g., Entry, Mid, Senior
  compensation?: string; // Salary range or service fee
  createdAt: string; // ISO date string
  contactInfo?: string;
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

export interface FeedItem {
  id: string;
  type: 'new_user' | 'forum_post' | 'marketplace_listing' | 'talent_listing' | 'connection';
  timestamp: string; // ISO date string
  userId?: string; // User associated with the item
  userName?: string;
  userAvatar?: string;
  content?: string; // e.g., post snippet, item name
  link?: string; // Link to the full item
  relatedUser?: { // For connection type
    id: string;
    name: string;
    avatarUrl?: string;
  }
}
