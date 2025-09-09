

import type { z } from 'zod';
import type { 
    StakeholderProfileSchema,
    MarketplaceItemSchema,
    MarketplaceOrderSchema,
    AgriEventSchema,
    ShopSchema,
    ApiKeySchema,
    InsuranceProductSchema,
    InsuranceApplicationSchema,
    FinancialProductSchema,
    FinancialApplicationSchema,
    SmartSearchInterpretationSchema,
    MarketplaceRecommendationInputSchema,
    MarketplaceRecommendationOutputSchema,
    CropRotationInputSchema,
    CropRotationOutputSchema,
    DiagnoseCropInputSchema,
    DiagnoseCropOutputSchema,
    FarmingAssistantInputSchema,
    FarmingAssistantOutputSchema,
    KnfBatchSchema,
    FeedItemSchema,
    ServiceItemSchema,
    ConnectionSchema,
    ConnectionRequestSchema,
    ConversationSchema,
    FinancialTransactionSchema,
    FinancialSummarySchema,
    ForumGroupSchema,
    GroupPostSchema,
    JoinRequestSchema,
    MarketplaceCouponSchema,
    MessageSchema,
    MobileDiscoverItemSchema,
    MobileHomeCategorySchema,
    NotificationSchema,
    PaymentLogSchema,
    PollOptionSchema,
    PostReplySchema,
    WorkerSchema,
    WorkLogSchema,
    createFarmSchema,
    createCropSchema,
    GroupPostReplySchema,
    createInventoryItemSchema,
    KnowledgeArticleSchema,
    FarmAssetSchema,
    ForumTopicSchema
} from './schemas';
import type { LucideIcon } from 'lucide-react';


// =================================================================
// 1. CORE TYPES (INFERRED FROM ZOD SCHEMAS)
// These are the primary data structures used across the application.
// =================================================================

export type UserProfile = z.infer<typeof StakeholderProfileSchema>;
export type MarketplaceItem = z.infer<typeof MarketplaceItemSchema>;
export type MarketplaceOrder = z.infer<typeof MarketplaceOrderSchema> & {
    buyerProfile: { displayName: string, avatarUrl?: string },
    sellerProfile?: { displayName: string, avatarUrl?: string }
};
export type AgriEvent = z.infer<typeof AgriEventSchema> & {
  id: string; // Add id to the type for frontend use
  organizerId: string;
  registeredAttendeesCount: number;
  isRegistered?: boolean;
};
export type ForumTopic = z.infer<typeof ForumTopicSchema>;
export type Shop = z.infer<typeof ShopSchema>;
export type ApiKey = z.infer<typeof ApiKeySchema>;
export type InsuranceProduct = z.infer<typeof InsuranceProductSchema>;
export type InsuranceApplication = z.infer<typeof InsuranceApplicationSchema>;
export type FinancialProduct = z.infer<typeof FinancialProductSchema>;
export type FinancialApplication = z.infer<typeof FinancialApplicationSchema>;
export type KnfBatch = z.infer<typeof KnfBatchSchema>;
export type FeedItem = z.infer<typeof FeedItemSchema>;
export type ServiceItem = z.infer<typeof ServiceItemSchema>;
export type Connection = z.infer<typeof ConnectionSchema>;
export type ConnectionRequest = z.infer<typeof ConnectionRequestSchema>;
export type Conversation = z.infer<typeof ConversationSchema>;
export type FinancialTransaction = z.infer<typeof FinancialTransactionSchema>;
export type FinancialSummary = z.infer<typeof FinancialSummarySchema>;
export type ForumGroup = z.infer<typeof ForumGroupSchema>;
export type GroupPost = z.infer<typeof GroupPostSchema>;
export type JoinRequest = z.infer<typeof JoinRequestSchema>;
export type MarketplaceCoupon = z.infer<typeof MarketplaceCouponSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type MobileDiscoverItem = z.infer<typeof MobileDiscoverItemSchema>;
export type MobileHomeCategory = z.infer<typeof MobileHomeCategorySchema>;
export type Notification = z.infer<typeof NotificationSchema>;
export type PaymentLog = z.infer<typeof PaymentLogSchema>;
export type PollOption = z.infer<typeof PollOptionSchema>;
export type PostReply = z.infer<typeof PostReplySchema>;
export type GroupPostReply = z.infer<typeof GroupPostReplySchema>;
export type Worker = z.infer<typeof WorkerSchema>;
export type WorkLog = z.infer<typeof WorkLogSchema>;
export type Farm = z.infer<typeof createFarmSchema> & { id: string };
export type Crop = z.infer<typeof createCropSchema> & { id: string, plantingDate: string, harvestDate?: string, createdAt: string, ownerId: string };
export type InventoryItem = z.infer<typeof createInventoryItemSchema> & { id: string, purchaseDate?: string, expiryDate?: string | null };
export type KnowledgeArticle = z.infer<typeof KnowledgeArticleSchema>;
export type FarmAsset = z.infer<typeof FarmAssetSchema>;


export type UserRole = "Admin" | "Regulator" | "Auditor" | "Farmer" | "System" | "Buyer" | "Input Supplier" | "Agricultural Cooperative" | "Field Agent/Agronomist (DamDoh Internal)" | "Financial Institution (Micro-finance/Loans)" | "Logistics Partner (Third-Party Transporter)" | "Processing & Packaging Unit" | "Researcher/Academic" | "Quality Assurance Team (DamDoh Internal)" | "Certification Body (Organic, Fair Trade etc.)" | "Insurance Provider" | "Energy Solutions Provider (Solar, Biogas)" | "Agro-Tourism Operator" | "Agro-Export Facilitator/Customs Broker" | "Crowdfunder (Impact Investor, Individual)" | "Consumer" | "General" | "Equipment Supplier (Sales of Machinery/IoT)" | "Waste Management & Compost Facility" | "Storage/Warehouse Facility" | "Agronomy Expert/Consultant (External)" | "Agri-Tech Innovator/Developer" | "Operations/Logistics Team (DamDoh Internal)" | "Packaging Supplier";


// =================================================================
// 2. DASHBOARD & UI-SPECIFIC TYPES
// =================================================================

// Note: These interfaces are being deprecated in favor of Zod-inferred types.
// New dashboard data types should be defined with Zod in `schemas.ts` and inferred here.
// This provides a single source of truth for data structures.

export interface FarmerDashboardAlert {
    id: string;
    icon: 'FlaskConical' | 'Sprout';
    type: 'info' | 'warning';
    message: string;
    link: string;
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
  financialSummary?: FinancialSummary;
  alerts?: FarmerDashboardAlert[];
  certifications?: {
    id: string;
    name: string;
    issuingBody: string;
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
    groupId: string | null;
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

export interface FieldAgentDashboardData {
    assignedFarmers: {
        id: string;
        name: string;
        lastVisit: string; // ISO string
        issues: number;
        actionLink: string;
        avatarUrl?: string | null;
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
  inventory: { // This is for finished goods
    product: string;
    quality: string;
    tons: number;
  }[];
  wasteReduction: {
    currentRate: number;
    insight: string;
  };
  packagingOrders: { // This is for incoming packaging materials
    id: string;
    supplierName: string;
    deliveryDate: string;
    status: string;
    actionLink: string;
  }[];
  packagingInventory: { // This is for their stock of packaging
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
  }[];
}

export interface AgronomistDashboardData {
  assignedFarmersOverview: {
    id: string;
    name: string;
    farmLocation: string;
    lastConsultation: string; // ISO String
    alerts: number;
    avatarUrl?: string | null;
  }[];
  pendingConsultationRequests: {
    id: string;
    farmerName: string;
    issueSummary: string;
    requestDate: string; // ISO String
  }[];
  knowledgeHubContributions: {
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

export interface EquipmentSupplierDashboardData {
  listedEquipment: {
    id: string;
    name: string;
    type: 'Sale' | 'Rental';
    status: 'Available' | 'Rented Out';
    actionLink: string;
  }[];
  rentalActivity: {
    totalRentals: number;
  };
  pendingMaintenanceRequests: {
    id: string;
    equipmentName: string;
    issue: string;
    farmerName: string;
    actionLink: string;
  }[];
}

export interface WasteManagementDashboardData {
  incomingWasteStreams: {
    id: string;
    type: string; // e.g., 'Crop Residue', 'Animal Manure'
    source: string; // e.g., 'Green Valley Farms'
    quantity: string; // e.g., '5 tons'
  }[];
  compostBatches: {
    id: string;
    status: 'Active' | 'Curing' | 'Ready';
    estimatedCompletion: string; // ISO date
  }[];
  finishedProductInventory: {
    product: string;
    quantity: string; // e.g., '20 tons'
    actionLink: string;
  }[];
}
    

export interface PackagingSupplierDashboardData {
  incomingOrders: {
    id: string;
    customerName: string;
    product: string;
    quantity: number;
    status: 'New' | 'Processing' | 'Shipped';
    actionLink: string;
  }[];
  inventory: {
    id: string;
    item: string;
    stock: number;
    reorderLevel: number;
  }[];
}

export interface SustainabilityDashboardData {
    carbonFootprint: { total: number; unit: string; trend: number; };
    waterUsage: { efficiency: number; unit: string; trend: number; };
    biodiversityScore: { score: number; unit: string; trend: number; };
    sustainablePractices: { id: string; practice: string; lastLogged: string; }[];
    certifications: { id:string; name: string; status: string; expiry: string; }[];
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
    expiryDate: string; // ISO string;
  }[];
}

export interface OperationsDashboardData {
  vtiGenerationRate: {
    rate: number;
    unit: 'VTIs/hour';
    trend: number;
  };
  dataPipelineStatus: {
    status: 'Operational' | 'Degraded' | 'Offline';
    lastChecked: string; // ISO string
  };
  flaggedEvents: {
    id: string;
    type: 'Anomalous Geolocation' | 'Unusual Time Lag' | 'Data Mismatch';
    description: string;
    vtiLink: string;
  }[];
}

export type AdminDashboardData = z.infer<typeof AdminDashboardDataSchema>;
export type AdminActivity = z.infer<typeof AdminActivitySchema>;
export type AgriTechInnovatorDashboardData = z.infer<typeof AgriTechInnovatorDashboardDataSchema>;

// =================================================================
// 3. AI FLOW TYPES (Inferred from schemas)
// =================================================================

export type SmartSearchInterpretation = z.infer<typeof SmartSearchInterpretationSchema>;
export type MarketplaceRecommendationInput = z.infer<typeof MarketplaceRecommendationInputSchema>;
export type MarketplaceRecommendationOutput = z.infer<typeof MarketplaceRecommendationOutputSchema>;
export type CropRotationInput = z.infer<typeof CropRotationInputSchema>;
export type CropRotationOutput = z.infer<typeof CropRotationOutputSchema>;
export type DiagnoseCropInput = z.infer<typeof DiagnoseCropInputSchema>;
export type DiagnoseCropOutput = z.infer<typeof DiagnoseCropOutputSchema>;
export type FarmingAssistantInput = z.infer<typeof FarmingAssistantInputSchema>;
export type FarmingAssistantOutput = z.infer<typeof FarmingAssistantOutputSchema>;


// For use in both frontend and backend
export interface SuggestedConnectionsOutput {
    suggestions: Array<{
      id: string;
      name: string;
      role: string;
      avatarUrl?: string;
      reason: string;
    }>;
}

export interface SuggestedConnectionsInput {
    userId: string;
    count?: number;
    language?: string;
}
