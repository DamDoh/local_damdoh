
import type { StakeholderRole } from './constants';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: StakeholderRole;
  location: string;
  bio?: string;
  profileSummary?: string; // AI Generated, focusing on agricultural expertise and supply chain role
  yearsOfExperience?: number;
  areasOfInterest?: string[]; // e.g., 'Sustainable Sourcing', 'Cold Chain Logistics', 'Organic Certification'
  needs?: string[]; // e.g., 'Reliable Transporters', 'Bulk Buyers for Grains', 'Eco-friendly Packaging Suppliers'
  contactInfo?: {
    phone?: string;
    website?: string; // e.g., farm website, company portal
  };
  connections?: string[]; // Array of user IDs, representing supply chain partners
}

export interface ForumTopic {
  id: string;
  title: string; // e.g., 'Innovations in Post-Harvest Technology', 'Navigating Export Regulations for Coffee'
  description: string;
  creatorId: string;
  createdAt: string; // ISO date string
  postCount: number;
  lastActivityAt: string; // ISO date string
  icon?: string; // Lucide icon name, related to agriculture/business
}

export interface ForumPost {
  id: string;
  topicId: string;
  authorId: string; // Could be a farmer, supplier, researcher, etc.
  content: string; // Discussions on best practices, market queries, collaboration requests
  createdAt: string; // ISO date string
  updatedAt?: string; // ISO date string
  likes: number;
  replies?: ForumPost[]; // For threaded discussions
}

export interface MarketplaceItem {
  id:string;
  name: string; // e.g., 'Organic Hass Avocados (Bulk)', 'Used Combine Harvester John Deere S780', 'Cold Storage Space for Rent'
  description: string;
  price: number;
  currency: string;
  sellerId: string; // Could be a farmer, cooperative, equipment dealer, service provider
  category: string; // e.g., 'Fresh Produce', 'Grains & Pulses', 'Farm Machinery', 'Logistics Services', 'Agri-Inputs'
  location: string;
  imageUrl?: string;
  createdAt: string; // ISO date string
  contactInfo?: string;
}

export interface TalentListing {
  id: string;
  title: string; // e.g., 'Experienced Agronomist for Tropical Fruits', 'Logistics Manager (Perishables)', 'Custom Drone Spraying Service'
  description: string;
  type: 'Job' | 'Service'; // Job opening or service offered
  listerId: string; // Farm, Agribusiness, Cooperative, Individual
  location: string; // Can be specific or 'Remote' or 'Servicing X Region'
  skillsRequired?: string[]; // e.g., 'HACCP Certification', 'Supply Chain Optimization', 'Precision Agriculture'
  experienceLevel?: string; // e.g., 'Lead Agronomist', 'Junior Supply Chain Analyst'
  compensation?: string; // Salary, project fee, per-acre rate
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
  type: 'forum_post' | 'marketplace_listing' | 'talent_listing' | 'connection' | 'shared_article' | 'industry_news' | 'success_story';
  timestamp: string; // ISO date string
  userId?: string; // User associated with the item
  userName?: string;
  userAvatar?: string;
  userHeadline?: string; // e.g., "Founder, AgriConnect Logistics", "Organic Vegetable Farmer & Educator"
  content?: string; // e.g., "Just listed: 10 tons of organic quinoa. Seeking buyers.", "Great discussion on water conservation in the forums!"
  postImage?: string;
  likesCount?: number;
  commentsCount?: number;
  link?: string; // Link to the full item
  relatedUser?: { // For connection type
    id: string;
    name: string;
    avatarUrl?: string;
  }
}

export interface DirectMessage {
  id: string;
  senderName: string; // e.g., "AgriLogistics Co-op", "Maria - Farmer's Union"
  senderAvatarUrl?: string;
  lastMessage: string; // e.g., "Regarding your soybean order...", "Can you share insights on coffee bean grading?"
  timestamp: string; // ISO date string
  unread?: boolean;
}
