
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
export type ForumTopic = z.infer<typeof ForumTopicSchema>;

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

export interface FeedItem {
  id: string;
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

// =================================================================
// 3. CONCEPTUAL "SUPER APP" & DASHBOARD DATA STRUCTURES
// These types serve as a blueprint for the data required for the
// various stakeholder-specific dashboards and future features.
// =================================================================

export interface FarmerDashboardData {
  predictedYield: {
    crop: string;
    variance: string;
    confidence: string;
  };
  irrigationSchedule: {
    next_run: string;
    duration_minutes: number;
    recommendation: string;
  };
  matchedBuyers: {
    id: string;
    name: string;
    matchScore: number;
    request: string;
    contactId: string;
  }[];
  trustScore: {
      reputation: number;
      certifications: {
          id: string;
          name: string;
          issuingBody: string;
      }[];
  }
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
    trend: 'up' | 'down';
    forecast: string;
    action: {
      label: string;
      link: string;
    };
  };
}

export interface RegulatorDashboardData {
  complianceRiskAlerts: {
    id: string;
    region: string;
    issue: string;
    severity: string;
    actionLink: string;
  }[];
  pendingCertifications: {
    count: number;
    actionLink: string;
  };
  supplyChainAnomalies: {
    id: string;
    description: string;
    level: string;
    vtiLink: string;
  }[];
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

export interface EnergyProviderDashboardData {
    highPotentialLeads: {
        id: string;
        name: string;
        energySpend: number;
        potentialSaving: string;
        actionLink: string;
    }[];
    carbonImpact: {
        savedThisYear: number;
        totalProjects: number;
    };
    pendingProposals: number;
}

export interface PackagingSupplierDashboardData {
    demandForecast: {
        productType: string;
        unitsNeeded: number;
        for: string;
    };
    integrationRequests: {
        from: string;
        request: string;
        actionLink: string;
    }[];
    sustainableShowcase: {
        views: number;
        leads: number;
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

export interface ProcessingUnitDashboardData {
    yieldOptimization: {
        currentYield: number;
        potentialYield: number;
        suggestion: string;
    };
    inventory: {
        product: string;
        tons: number;
        quality: string;
    }[];
    wasteReduction: {
        currentRate: number;
        potentialRate: number;
        insight: string;
    };
}

export interface WarehouseDashboardData {
    storageOptimization: {
        utilization: number;
        suggestion: string;
    };
    inventoryLevels: {
        totalItems: number;
        itemsNeedingAttention: number;
    };
    predictiveAlerts: {
        alert: string;
        actionLink: string;
    }[];
}

export interface QaDashboardData {
  pendingInspections: {
    id: string;
    productName: string;
    sellerName: string;
    batchId: string;
    actionLink: string;
  }[];
  recentResults: {
    id: string;
    productName: string;
    result: 'Pass' | 'Fail';
    reason?: string;
    inspectedAt: string;
  }[];
  qualityMetrics: {
    passRate: number;
    averageScore: number;
  };
}

export interface CertificationBodyDashboardData {
    pendingAudits: {
        id: string;
        farmName: string;
        standard: string;
        dueDate: string;
        actionLink: string;
    }[];
    certifiedEntities: {
        id: string;
        name: string;
        type: 'Farmer' | 'Processor';
        certificationStatus: string;
        actionLink: string;
    }[];
    standardsMonitoring: {
        standard: string;
        adherenceRate: number;
        alerts: number;
        actionLink: string;
    }[];
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
