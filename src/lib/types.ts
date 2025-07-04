
import type { z } from 'zod';
import type { 
    StakeholderProfileSchema,
    MarketplaceItemSchema,
    MarketplaceOrderSchema,
    ForumPostSchema,
    AgriEventSchema
} from './schemas';

// =================================================================
// 1. CORE TYPES (INFERRED FROM ZOD SCHEMAS)
// These are the primary data structures used across the application.
// =================================================================

export type UserProfile = z.infer<typeof StakeholderProfileSchema>;
export type MarketplaceItem = z.infer<typeof MarketplaceItemSchema>;
export type MarketplaceOrder = z.infer<typeof MarketplaceOrderSchema>;
export type AgriEvent = z.infer<typeof AgriEventSchema>;
export type ForumTopic = z.infer<typeof ForumPostSchema>;
export type UserRole = "Admin" | "Regulator" | "Auditor" | "Farmer" | "System" | "Buyer" | "Input Supplier" | "Agricultural Cooperative" | "Field Agent/Agronomist (DamDoh Internal)" | "Financial Institution (Micro-finance/Loans)" | "Logistics Partner (Third-Party Transporter)" | "Processing & Packaging Unit" | "Researcher/Academic" | "Quality Assurance Team (DamDoh Internal)" | "Certification Body (Organic, Fair Trade etc.)" | "Insurance Provider" | "Energy Solutions Provider (Solar, Biogas)" | "Agro-Tourism Operator" | "Agro-Export Facilitator/Customs Broker" | "Crowdfunder (Impact Investor, Individual)" | "Consumer" | "General" | "Equipment Supplier (Sales of Machinery/IoT)" | "Waste Management & Compost Facility" | "Storage/Warehouse Facility" | "Agronomy Expert/Consultant (External)" | "Agri-Tech Innovator/Developer" | "Operations/Logistics Team (DamDoh Internal)" | "Packaging Supplier";


export interface MarketplaceCoupon {
    id: string;
    sellerId: string;
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    expiresAt: any;
    usageLimit: number | null;
    usageCount: number;
    isActive: boolean;
    applicableToListingIds: string[];
    applicableToCategories: string[];
    createdAt: any;
}

export interface Shop {
    id: string;
    ownerId: string;
    name: string;
    description: string;
    stakeholderType: string;
    createdAt: any;
    updatedAt: any;
    logoUrl: string | null;
    bannerUrl: string | null;
    contactInfo: {
        phone?: string;
        website?: string;
    };
    itemCount: number;
    rating: number;
}

export type ForumGroup = {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  isPublic: boolean;
  ownerId: string;
  createdAt: string; // ISO String
}

export interface Connection {
    id: string; // User ID of the connection
    displayName: string;
    avatarUrl?: string;
    primaryRole: string;
    profileSummary: string;
}

export interface ConnectionRequest {
    id: string; // The request document ID
    requester: {
        id: string;
        displayName: string;
        avatarUrl?: string;
        primaryRole: string;
    };
    createdAt: string; // ISO string
}

// =================================================================
// 2. DASHBOARD & UI-SPECIFIC TYPES
// =================================================================

export interface FinancialTransaction {
    id: string;
    type: 'income' | 'expense';
    amount: number;
    currency: string;
    description: string;
    category?: string;
    timestamp: any; // Allow for firestore timestamp
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
      name: string;
      stage: string;
      farmName: string;
      farmId: string;
      plantingDate: string | null;
  }[];
  knfBatches: {
    id: string;
    typeName: string;
    status: string;
    nextStepDate: string | null;
  }[];
}

export interface CooperativeDashboardData {
    memberCount: number;
    totalLandArea: number; // in Hectares
    aggregatedProduce: {
        id: string;
        productName: string;
        quantity: number; // in tons
        quality: string;
        readyBy: string; // ISO Date string
    }[];
    pendingMemberApplications: number;
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
    pendingApplications: FinancialApplication[];
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

export interface KnfBatch {
  id: string;
  userId: string;
  type: string;
  typeName: string;
  ingredients: string;
  startDate: any;
  status: 'Fermenting' | 'Ready' | 'Used' | 'Archived';
  nextStep: string;
  nextStepDate: any;
  createdAt: any;
}

export interface FinancialApplication {
  id: string;
  applicantName: string;
  type: 'Loan' | 'Grant';
  amount: number;
  currency: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Under Review';
  riskScore: number;
  submittedAt: string; // ISO String
  actionLink: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'new_order' | 'event_reminder' | 'service_reminder' | 'new_connection_request';
  title_en: string;
  body_en: string;
  actorId: string;
  linkedEntity: {
    collection: string;
    documentId: string;
  } | null;
  createdAt: any; // Firestore Timestamp
  isRead: boolean;
  postId?: string; // Legacy field, to be phased out
}

export interface FeedItem {
  id: string;
  type: string;
  timestamp: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userHeadline?: string;
  content: string;
  link: string;
  postImage?: string;
  dataAiHint?: string;
  likesCount: number;
  commentsCount: number;
  pollOptions?: { text: string; votes: number }[];
}

export interface DirectMessage {
  id: string;
  senderName: string;
  lastMessage: string;
  timestamp: string;
  senderAvatarUrl?: string;
  unread: boolean;
  dataAiHint?: string;
}

export interface ForumPost {
    id: string;
    topicId: string;
    topicName?: string;
    title: string;
    content: string;
    author: {
        id: string;
        name: string;
        avatarUrl?: string;
    };
    timestamp: string;
    replyCount?: number;
}


export interface PostReply {
    id: string;
    content: string;
    author: {
        id: string;
        name: string;
        avatarUrl?: string;
    };
    timestamp: string;
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
