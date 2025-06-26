
import type { z } from 'zod';
import type {
  StakeholderProfileSchema,
  MarketplaceItemSchema,
  ForumTopicSchema,
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
export type ForumPost = z.infer<typeof ForumPostSchema>;
export type AgriEvent = z.infer<typeof AgriEventSchema>;
export type ForumTopic = z.infer<typeof ForumPostSchema>;

// =================================================================
// 2. DASHBOARD & UI-SPECIFIC TYPES
// =================================================================

export interface FarmerDashboardData {
  farmCount: number;
  cropCount: number;
  recentCrops: {
      id: string;
      name: string;
      stage: string;
      farmName: string;
  }[];
  trustScore: {
      reputation: number;
      certifications: {
          id: string;
          name: string;
          issuingBody: string;
      }[];
  };
  matchedBuyers: {
    id: string;
    name: string;
    matchScore: number;
    request: string;
    contactId: string;
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
    packagingOrders: {
        id: string;
        supplierName: string;
        orderDate: string;
        deliveryDate: string;
        status: 'Pending' | 'Shipped' | 'Delivered' | 'Canceled';
        actionLink: string;
    }[];
    packagingInventory: {
        packagingType: string;
        unitsInStock: number;
        reorderLevel: number;
    }[];
    packagingImpactMetrics: {
        metric: string; // e.g., 'Recycled Content Used', 'Biodegradable Packaging Rate'
        value: string;
        actionLink: string;
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
      id: string;
      alert: string;
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

// ... other dashboard types as they are defined ...
