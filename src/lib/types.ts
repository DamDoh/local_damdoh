
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
  expiresAt?: string | null; // ISO String
  usageLimit?: number | null;
  usageCount: number;
  createdAt: string; // ISO String
}


export interface MarketplaceCoupon {
  id: string;
  sellerId: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  expiresAt: any; // Can be Timestamp or null
  usageLimit?: number | null;
  usageCount: number;
  isActive: boolean;
  applicableToListingIds?: string[];
  applicableToCategories?: string[];
  createdAt: any; // Firestore Timestamp
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

export interface KnfBatch {
  id: string;
  userId: string;
  type: string;
  typeName: string;
  ingredients: string;
  startDate: string; // ISO string
  status: 'Fermenting' | 'Ready' | 'Used' | 'Archived';
  nextStep: string;
  nextStepDate: string; // ISO string;
}

export interface FarmerDashboardData {
  farmCount: number;
  cropCount: number;
  recentCrops: {
    id: string;
    cropType: string;
    plantingDate: string; // ISO String
  }[];
  knfBatches: {
    id: string;
    typeName: string;
    status: string;
    nextStepDate: string; // ISO String
  }[];
}

export interface YieldData {
    crop: string;
    historical: number;
    predicted: number;
    unit: string;
  }

export interface IrrigationSchedule {
    next_run: string;
    duration_minutes: number;
    recommendation: string;
  }

export interface MatchedBuyer {
    id: string;
    name: string;
    matchScore: number;
    request: string;
    contactId: string;
  }

export interface TrustScore {
    reputation: number;
    certifications: Certification[];
  }

export interface Certification {
    id: string;
    name: string;
    issuingBody: string;
  }

export interface AgroTourismDashboardData {
  upcomingBookings: {
    id: string;
    experienceTitle: string;
    guestName: string;
    date: string; // ISO string
    actionLink: string;
  }[];
  listedExperiences: {
    id: string;
    title: string;
    location: string;
    status: 'Published' | 'Draft';
    bookingsCount: number;
    actionLink: string;
  }[];
  guestReviews: {
    id: string;
    guestName: string;
    experienceTitle: string;
    rating: number; // e.g., 1-5
    comment: string;
    actionLink: string;
  }[];
}

export interface InsuranceProviderDashboardData {
  pendingClaims: {
    id: string;
    policyHolderName: string;
    policyType: 'Crop' | 'Livestock';
    claimDate: string; // ISO string
    status: 'Submitted' | 'Under Review';
    actionLink: string;
  }[];
  riskAssessmentAlerts: {
    id: string;
    policyHolderName: string;
    alert: string;
    severity: 'High' | 'Medium' | 'Low';
    actionLink: string;
  }[];
  activePolicies: {
    id: string;
    policyHolderName: string;
    policyType: string;
    coverageAmount: number;
    expiryDate: string; // ISO string
    actionLink: string;
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

export interface InputSupplierDashboardData {
    demandForecast: {
        id: string;
        region: string;
        product: string;
        trend: 'High' | 'Steady' | 'Low';
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
        lastVisit: string; // ISO string
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

export interface ProcessingUnitDashboardData {
  yieldOptimization: {
    currentYield: number;
    potentialYield: number;
    suggestion: string;
  };
  inventory: {
    product: string;
    quality: string;
    tons: number;
  }[];
  wasteReduction: {
    currentRate: number;
    insight: string;
  };
  packagingOrders: {
    id: string;
    supplierName: string;
    deliveryDate: string;
    status: string;
    actionLink: string;
  }[];
  packagingInventory: {
    packagingType: string;
    unitsInStock: number;
    reorderLevel: number;
  }[];
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


export interface RegulatorDashboardData {
  complianceRiskAlerts: {
    id: string;
    issue: string;
    region: string;
    severity: 'High' | 'Medium' | 'Low';
    actionLink: string;
  }[];
  pendingCertifications: {
    count: number;
    actionLink: string;
  };
  supplyChainAnomalies: {
    id: string;
    description: string;
    level: 'Critical' | 'Warning';
    vtiLink: string;
  }[];
}

export interface QaDashboardData {
  pendingInspections: {
    id: string;
    batchId: string;
    productName: string;
    sellerName: string;
    dueDate: string; // ISO String
    actionLink: string;
  }[];
  recentResults: {
    id: string;
    productName: string;
    result: 'Pass' | 'Fail';
    reason?: string;
    inspectedAt: string; // ISO String
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
    dueDate: string; // ISO String
    actionLink: string;
  }[];
  certifiedEntities: {
    id: string;
    name: string;
    type: string;
    certificationStatus: 'Active' | 'Pending Renewal' | 'Expired';
    actionLink: string;
  }[];
  standardsMonitoring: {
    standard: string;
    adherenceRate: number;
    alerts: number;
    actionLink: string;
  }[];
}

export interface ResearcherDashboardData {
  availableDatasets: {
    id: string;
    name: string;
    dataType: string;
    accessLevel: 'Public' | 'Requires Request';
    actionLink: string;
  }[];
  ongoingProjects: {
    id: string;
    title: string;
    progress: number;
    collaborators: string[];
    actionLink: string;
  }[];
  knowledgeHubContributions: {
    id: string;
    title: string;
    status: 'Published' | 'Pending Review' | 'Draft';
    actionLink: string;
  }[];
}


export interface AgronomistDashboardData {
  assignedFarmersOverview: {
    id: string;
    name: string;
    farmLocation: string;
    lastConsultation: string; // ISO String
    alerts: number;
  }[];
  pendingConsultationRequests: {
    id: string;
    farmerName: string;
    issueSummary: string;
    requestDate: string; // ISO String
  }[];
  knowledgeBaseContributions: {
    id: string;
    title: string;
    status: 'Published' | 'Pending Review';
  }[];
}

export interface EnergyProviderDashboardData {
  projectLeads: {
    id: string;
    entityName: string;
    location: string;
    estimatedEnergyNeed: string;
    status: 'New' | 'Contacted' | 'Proposal Sent' | 'Closed';
    actionLink: string;
  }[];
  activeProjects: {
    id: string;
    projectName: string;
    solutionType: string;
    status: 'In Progress' | 'Completed';
    completionDate: string; // ISO String
  }[];
  impactMetrics: {
    totalInstallations: number;
    totalEstimatedCarbonReduction: string;
  };
}


export interface CrowdfunderDashboardData {
  portfolioOverview: {
    totalInvested: number;
    numberOfInvestments: number;
    estimatedReturns: number;
  };
  suggestedOpportunities: {
    id: string;
    projectName: string;
    category: string;
    fundingGoal: number;
    amountRaised: number;
    actionLink: string;
  }[];
  recentTransactions: {
    id: string;
    projectName: string;
    type: 'Investment' | 'Payout';
    amount: number;
    date: string; // ISO String
  }[];
}
