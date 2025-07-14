

import type { z } from 'zod';
import type { 
    StakeholderProfileSchema,
    MarketplaceItemSchema,
    MarketplaceOrderSchema,
    ForumPostSchema,
    AgriEventSchema,
    ShopSchema,
    ApiKeySchema,
    InsuranceProductSchema,
    InsuranceApplicationSchema,
    FinancialProductSchema,
    SmartSearchInterpretationSchema,
    MarketplaceRecommendationInputSchema,
    MarketplaceRecommendationOutputSchema,
    CropRotationInputSchema,
    CropRotationOutputSchema,
    DiagnoseCropInputSchema,
    DiagnoseCropOutputSchema,
    FarmingAssistantInputSchema,
    FarmingAssistantOutputSchema
} from './schemas';
import type { LucideIcon } from 'lucide-react';


// =================================================================
// 1. CORE TYPES (INFERRED FROM ZOD SCHEMAS)
// These are the primary data structures used across the application.
// =================================================================

export type UserProfile = z.infer<typeof StakeholderProfileSchema>;
export type MarketplaceItem = z.infer<typeof MarketplaceItemSchema>;
export type MarketplaceOrder = z.infer<typeof MarketplaceOrderSchema> & {
    buyerProfile: { displayName: string, avatarUrl?: string }
};
export type AgriEvent = z.infer<typeof AgriEventSchema> & {
  id: string; // Add id to the type for frontend use
  organizerId: string;
  registeredAttendeesCount: number;
  isRegistered?: boolean;
};
export type ForumTopic = z.infer<typeof ForumPostSchema>;
export type Shop = z.infer<typeof ShopSchema>;
export type ApiKey = z.infer<typeof ApiKeySchema>;
export type InsuranceProduct = z.infer<typeof InsuranceProductSchema>;
export type InsuranceApplication = z.infer<typeof InsuranceApplicationSchema>;
export type FinancialProduct = z.infer<typeof FinancialProductSchema>;

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

export type ForumGroup = {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  isPublic: boolean;
  ownerId: string;
  createdAt: string; // ISO String
}

export interface JoinRequest {
    id: string; // Request ID
    requesterId: string;
    requesterName: string;
    requesterAvatarUrl?: string;
    createdAt: string;
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

export interface Notification {
  id: string;
  userId: string;
  actorId: string;
  type: 'like' | 'comment' | 'new_order' | 'new_connection_request' | 'event_reminder' | 'service_reminder' | 'profile_view';
  title_en: string;
  body_en: string;
  linkedEntity: {
    collection: string;
    documentId: string;
  } | null;
  isRead: boolean;
  createdAt: any; // Firestore Timestamp
}


// =================================================================
// 2. DASHBOARD & UI-SPECIFIC TYPES
// =================================================================
export type FarmerDashboardAlert = {
    id: string;
    icon: 'FlaskConical' | 'Sprout';
    type: 'info' | 'warning';
    message: string;
    link: string;
}

export type FinancialTransaction = {
    id: string;
    type: 'income' | 'expense';
    amount: number;
    currency: string;
    description: string;
    category?: string;
    timestamp: any; // Allow for firestore timestamp
}

export type FinancialSummary = {
    totalIncome: number;
    totalExpense: number;
    netFlow: number;
}

export type FarmerDashboardData = {
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
  knfBatches: KnfBatch[];
  financialSummary?: FinancialSummary;
  alerts?: FarmerDashboardAlert[];
  certifications?: {
    id: string;
    name: string;
    issuingBody: string;
  }[];
}

export type CooperativeDashboardData = {
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


export type BuyerDashboardData = {
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


export type RegulatorDashboardData = {
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


export type LogisticsDashboardData = {
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

export type FiDashboardData = {
    pendingApplications: FinancialApplication[];
    portfolioOverview: {
        loanCount: number;
        totalValue: number;
    };
    financialProducts: FinancialProduct[];
}

export type FieldAgentDashboardData = {
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

export type InputSupplierDashboardData = {
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

export type AgroExportDashboardData = {
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

export type ProcessingUnitDashboardData = {
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


export type WarehouseDashboardData = {
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


export type QaDashboardData = {
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


export type CertificationBodyDashboardData = {
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

export type ResearcherDashboardData = {
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

export type AgronomistDashboardData = {
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
    farmerId: string;
  }[];
  knowledgeHubContributions: {
    id: string;
    title: string;
    status: 'Published' | 'Pending Review';
  }[];
}


export type EnergyProviderDashboardData = {
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


export type CrowdfunderDashboardData = {
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

export type EquipmentSupplierDashboardData = {
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

export type WasteManagementDashboardData = {
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
    

export type PackagingSupplierDashboardData = {
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

export type SustainabilityDashboardData = {
    carbonFootprint: { total: number; unit: string; trend: number; };
    waterUsage: { efficiency: number; unit: string; trend: number; };
    biodiversityScore: { score: number; unit: string; trend: number; };
    sustainablePractices: { id: string; practice: string; lastLogged: string; }[];
    certifications: { id:string; name: string; status: string; expiry: string; }[];
}

export type InsuranceProviderDashboardData = {
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

export type OperationsDashboardData = {
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

export type AdminDashboardData = {
    totalUsers: number;
    totalFarms: number;
    totalListings: number;
    pendingApprovals: number;
    newUsersLastWeek: number;
}
export type AdminActivity = {
    id: string;
    type: 'New User' | 'New Listing';
    primaryInfo: string;
    secondaryInfo?: string;
    timestamp: string;
    link: string;
    avatarUrl?: string;
}

export type FinancialApplication = {
  id: string;
  applicantId: string;
  applicantName: string;
  fiId: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  riskScore?: number;
  purpose: string;
  submittedAt: string | null;
  actionLink?: string;
  applicantProfile?: UserProfile;
}


export type KnfBatch = {
    id: string;
    userId: string;
    type: string; // 'fpj', 'faa', etc.
    typeName: string; // "Fermented Plant Juice"
    ingredients: string;
    startDate: any; // Firestore Timestamp
    nextStepDate: any; // Firestore Timestamp
    status: 'Fermenting' | 'Ready' | 'Used' | 'Archived';
    nextStep: string;
    createdAt?: any;
    quantityProduced?: number;
    unit?: string;
}

export type ForumPost = {
  id: string;
  title: string;
  content: string;
  topicId: string;
  topicName: string;
  createdAt: string; // ISO String
  author: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  replyCount: number;
}

export type GroupPost = {
  id: string;
  title: string;
  content: string;
  authorRef: string;
  authorName: string;
  authorAvatarUrl: string;
  replyCount: number;
  createdAt: string; // ISO
}

export type PostReply = {
    id: string;
    content: string;
    timestamp: string; // ISO string
    author: {
        id: string;
        name: string;
        avatarUrl?: string;
    };
}

export type PollOption = {
  text: string;
  votes?: number;
}

export type FeedItem = {
  id: string;
  type: 'forum_post' | 'marketplace_listing' | 'success_story' | 'poll';
  timestamp: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userHeadline?: string;
  content: string;
  link: string;
  imageUrl?: string;
  dataAiHint?: string;
  likesCount: number;
  commentsCount: number;
  pollOptions?: PollOption[];
}

export type Conversation = {
  id: string;
  participant: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  lastMessage: string;
  lastMessageTimestamp: string;
  unreadCount: number;
}

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string; // ISO string
}

export type MobileHomeCategory = {
    id: string;
    name: string;
    icon: LucideIcon;
    href: string;
    dataAiHint?: string;
}

export type MobileDiscoverItem = {
    id: string;
    title: string;
    imageUrl: string;
    type: 'Marketplace' | 'Forum' | 'Profile' | 'Service';
    link: string;
    dataAiHint?: string;
}

export type Worker = {
  id: string;
  name: string;
  contactInfo?: string;
  payRate?: number;
  payRateUnit?: string;
  totalHoursLogged?: number;
  totalPaid?: number;
}

export type WorkLog = {
    id: string;
    hours: number;
    date: string; // ISO string
    taskDescription: string;
    isPaid: boolean;
}

export type PaymentLog = {
    id: string;
    amount: number;
    currency: string;
    date: string; // ISO string
    notes: string;
}

export type ServiceItem = MarketplaceItem & {
    listingType: 'Service';
    skillsRequired: string[];
    compensation: string;
    experienceLevel: string;
};

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
