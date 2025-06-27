

import type { z } from 'zod';
import type {
  StakeholderProfileSchema,
  MarketplaceItemSchema,
  ForumTopicSchema,
  ForumPostSchema,
  AgriEventSchema
} from './schemas';
import type { CategoryNode as CatNodeType } from './category-data';

// =================================================================
// 1. CORE TYPES (INFERRED FROM ZOD SCHEMAS)
// These are the primary data structures used across the application.
// =================================================================

export type UserProfile = z.infer<typeof StakeholderProfileSchema>;
export type MarketplaceItem = z.infer<typeof MarketplaceItemSchema>;
export type ForumPost = z.infer<typeof ForumPostSchema>;
export type AgriEvent = z.infer<typeof AgriEventSchema>;
export type ForumTopic = z.infer<typeof ForumPostSchema>;

// =================================================================
// 2. UI & COMPONENT-SPECIFIC TYPES
// Types used for navigation, UI components, and specific page features.
// =================================================================

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
  id?: string;
  text: string;
  votes: number;
}

export interface PostReply {
  id: string;
  author: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  content: string;
  timestamp: string;
}

export interface FeedItem {
  id:string;
  type: 'forum_post' | 'marketplace_listing' | 'connection' | 'shared_article' | 'industry_news' | 'success_story' | 'poll';
  timestamp: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userHeadline?: string;
  content?: string;
  postImage?: string;
  dataAiHint?: string;
  likesCount: number;
  commentsCount: number;
  link?: string;
  agriEvent?: AgriEvent;
  pollOptions?: PollOption[];
  relatedUser?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
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

export interface ForumGroup {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  memberCount: number;
  ownerId: string;
  createdAt: string; // ISO string
}

export interface Conversation {
  id: string;
  participant: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}
export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
}
export interface Notification {
  id: string;
  actorId: string;
  userId: string;
  type: 'like' | 'comment';
  postId: string;
  read: boolean;
  createdAt: any; // Firestore Timestamp
}

export interface EventAttendee {
  id: string; // This is the User UID
  email: string;
  displayName: string;
  avatarUrl?: string;
  registeredAt: string; // ISO string
  checkedIn: boolean;
  checkedInAt?: string | null; // ISO string
}

export interface EventCoupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  expiresAt?: string | null;
  usageLimit?: number;
  usageCount: number;
  createdAt: string;
}

export interface MarketplaceCoupon {
  id: string;
  sellerId: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  expiresAt?: string | null;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
  applicableToListingIds?: string[];
  applicableToCategories?: string[];
  createdAt: string;
}


// =================================================================
// 3. CONCEPTUAL "SUPER APP" & DASHBOARD DATA STRUCTURES
// These types serve as a blueprint for the data required for the
// various stakeholder-specific dashboards and future features.
// =================================================================

export interface FinancialTransaction {
    id: string;
    type: 'income' | 'expense';
    amount: number;
    currency: string;
    description: string;
    category?: string;
    timestamp: string; // ISO string
}

export interface FinancialSummary {
    totalIncome: number;
    totalExpense: number;
    netFlow: number;
}


export interface FarmerDashboardData {
  farmCount: number;
  cropCount: number;
  recentCrops: {
    id: string;
    farmId: string;
    cropType: string;
    plantingDate: string;
    currentStage?: string;
  }[];
  knfBatches: {
    id: string;
    typeName: string;
    status: string;
    nextStep: string;
    nextStepDate: string;
  }[];
}

export interface BuyerDashboardData {
  supplyChainRisk: {
    region: string;
    level: string;
    factor: string;
    action: {
      label: string;
      link: string;
    };
  };
  sourcingRecommendations: {
    id: string;
    name: string;
    product: string;
    reliability: number;
    vtiVerified: boolean;
  }[];
  marketPriceIntelligence: {
    product: string;
    trend: 'up' | 'down' | 'stable';
    forecast: string;
    action: {
      label: string;
      link: string;
    };
  };
}


export interface LogisticsDashboardData {
    activeShipments: {
        id: string;
        to: string;
        status: string;
        eta: string;
        vtiLink: string;
    }[];
    incomingJobs: {
        id: string;
        from: string;
        to: string;
        product: string;
        requirements: string;
        actionLink: string;
    }[];
    performanceMetrics: {
        onTimePercentage: number;
        fuelEfficiency: string;
        actionLink: string;
    };
}

export interface FiDashboardData {
    pendingApplications: {
        id: string;
        applicantName: string;
        type: string;
        amount: number;
        riskScore: number;
        actionLink: string;
    }[];
    portfolioAtRisk: {
        count: number;
        value: number;
        highestRisk: {
            name: string;
            reason: string;
        };
        actionLink: string;
    };
    marketUpdates: {
        id: string;
        content: string;
        actionLink: string;
    }[];
}

export interface InputSupplierDashboardData {
    demandForecast: {
        id: string;
        region: string;
        product: string;
        trend: string;
        reason: string;
    }[];
    productPerformance: {
        id: string;
        productName: string;
        rating: number;
        feedback: string;
        link: string;
    }[];
    activeOrders: {
        count: number;
        value: number;
        link: string;
    };
}

export interface FieldAgentDashboardData {
    assignedFarmers: {
        id: string;
        name: string;
        lastVisit: string;
        issues: number;
        actionLink: string;
    }[];
    portfolioHealth: {
        overallScore: number;
        alerts: string[];
        actionLink: string;
    };
    pendingReports: number;
    dataVerificationTasks: {
        count: number;
        description: string;
        actionLink: string;
    };
}

export interface AgroExportDashboardData {
    pendingCustomsDocs: {
        id: string;
        vtiLink: string;
        destination: string;
        status: string;
    }[];
    trackedShipments: {
        id: string;
        status: string;
        location: string;
        carrier: string;
    }[];
    complianceAlerts: {
        id: string;
        content: string;
        actionLink: string;
    }[];
}

export interface KnfBatch {
    id: string;
    userId: string;
    type: 'fpj' | 'faa' | 'wca' | 'imo' | 'lab';
    typeName: string;
    ingredients: string;
    startDate: { _seconds: number, _nanoseconds: number } | any; // Allow for firestore timestamp
    status: 'Fermenting' | 'Ready' | 'Used' | 'Archived';
    nextStep: string;
    nextStepDate: { _seconds: number, _nanoseconds: number } | any;
    createdAt: { _seconds: number, _nanoseconds: number } | any;
}


// =================================================================
// 4. SHARED & MISCELLANEOUS TYPES
// =================================================================

// Re-export CategoryNode type from category-data.ts for easier access
export type CategoryNode = CatNodeType;

/**
 * Represents a single event in a product's journey, linked by a VTI.
 */
export interface TraceabilityEvent {
  id: string;
  vtiId: string;
  timestamp: { _seconds: number; _nanoseconds: number; };
  eventType: string;
  actorRef?: string;
  geoLocation?: {
    lat: number;
    lng: number;
  } | null;
  payload: { [key: string]: any };
}
