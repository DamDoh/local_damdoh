
import * as admin from "firebase-admin";

export type UserRole =
  | "Admin"
  | "System"
  | "Farmer"
  | "Agronomist"
  | "Operation Team"
  | "Quality Assurance Team"
  | "Processing & Packaging Unit"
  | "Buyer"
  | "Input Supplier"
  | "Financial Institution"
  | "Government Regulator"
  | "Certification Body"
  | "Consumer"
  | "Researcher/Academic"
  | "Logistic Partner"
  | "Storage/Warehouse Facility"
  | "Agronomy Expert"
  | "Agro-Tourism Operator"
  | "Energy Solutions Provider"
  | "Agro-Export Facilitator"
  | "Insurance Provider"
  | "Packaging Supplier"
  | "Crowdfunder";

export interface UserProfile {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  primaryRole: UserRole;
  secondaryRoles?: UserRole[];
  organization?: {
    id: string;
    name: string;
  } | null;
  location?: {
    country: string;
    city?: string;
  } | null;
  lastLogin: admin.firestore.Timestamp;
  createdAt: admin.firestore.Timestamp;
}
export interface KnfBatch {
  id: string;
  userId: string;
  type: string;
  typeName: string;
  ingredients: string[];
  startDate: admin.firestore.Timestamp;
  status: "Fermenting" | "Ready" | "Used" | "Archived";
  nextStep: string;
  nextStepDate: admin.firestore.Timestamp;
  createdAt: admin.firestore.Timestamp;
}

export interface FarmerDashboardData {
  farmCount: number;
  cropCount: number;
  recentCrops: {
    id: string;
    cropType: string;
    plantingDate: string | null; // ISO String
  }[];
  knfBatches: {
    id: string;
    typeName: string;
    status: string;
    nextStepDate: string | null; // ISO String
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


export interface MarketplaceItem {
    id: string;
    name: string;
    listingType: 'Product' | 'Service';
    description: string;
    price?: number;
    currency?: string;
    perUnit?: string;
    sellerId: string;
    category: string;
    location: string;
    imageUrl?: string;
    createdAt: string | null; // ISO string
    updatedAt: string | null; // ISO string
    contactInfo?: string;
    dataAiHint?: string;
    isSustainable?: boolean;
    sellerVerification?: 'Verified' | 'Pending' | 'Unverified';
    aiPriceSuggestion?: { min: number; max: number; confidence: 'Low' | 'Medium' | 'High' };
    stockQuantity?: number;
    relatedTraceabilityId?: string;
    serviceType?: string;
    priceDisplay?: string;
    availabilityStatus?: string;
    serviceArea?: string;
    relatedFinancialProductId?: string;
    relatedInsuranceProductId?: string;
    skillsRequired?: string[];
    experienceLevel?: string;
    compensation?: string;
    serviceAvailability?: string;
    brand?: string;
    condition?: 'New' | 'Used' | 'Refurbished';
    certifications?: string[];
    traceabilityLink?: string;
}

export interface MarketplaceCoupon {
  id: string;
  sellerId: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  expiresAt: string | null; // ISO String
  usageLimit?: number | null;
  usageCount: number;
  isActive: boolean;
  applicableToListingIds?: string[];
  applicableToCategories?: string[];
  createdAt: string | null; // ISO String
}

export interface Shop {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  stakeholderType: string;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  itemCount: number;
  rating: number;
  createdAt: string | null;
  updatedAt: string | null;
}
