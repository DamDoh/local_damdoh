
import { z } from "zod";
import { UNIFIED_MARKETPLACE_CATEGORY_IDS, LISTING_TYPES, AGRI_EVENT_TYPES, STAKEHOLDER_ROLES } from '@/lib/constants';

// =================================================================
// 1. CORE DATA SCHEMAS
// These schemas define the shape of data in Firestore and are used for
// validation on both the frontend (forms) and backend (Cloud Functions).
// =================================================================

export const StakeholderProfileSchema = z.object({
  id: z.string(),
  uid: z.string(),
  displayName: z.string(),
  email: z.string().email(),
  primaryRole: z.string(),
  secondaryRoles: z.array(z.string()).optional(),
  location: z.object({
    lat: z.number().optional(),
    lng: z.number().optional(),
    address: z.string(),
  }).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
  bannerUrl: z.string().url().optional().nullable(),
  profileSummary: z.string().optional(),
  bio: z.string().optional(),
  areasOfInterest: z.array(z.string()).optional(),
  needs: z.array(z.string()).optional(),
  contactInfo: z.object({
    phone: z.string().optional().nullable(),
    website: z.string().url().optional().nullable(),
  }).optional(),
  connections: z.array(z.string()).optional(), // Array of user IDs
  profileData: z.any().optional(), // For role-specific data
  createdAt: z.any(), // Firestore Timestamp
  updatedAt: z.any(), // Firestore Timestamp
  shops: z.array(z.string()).optional(),
  universalId: z.string().optional(),
});


export const MarketplaceItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  listingType: z.string(), // 'Product' or 'Service'
  description: z.string(),
  sellerId: z.string(),
  price: z.number().optional().nullable(),
  currency: z.string().optional().nullable(),
  perUnit: z.string().optional().nullable(),
  category: z.string(), // Should map to a valid category ID
  location: z.object({
    lat: z.number().optional(),
    lng: z.number().optional(),
    address: z.string(),
  }),
  imageUrl: z.string().url().optional().nullable(),
  imageUrls: z.array(z.string().url()).optional(),
  dataAiHint: z.string().optional().nullable(),
  isSustainable: z.boolean().optional(),
  sellerVerification: z.string().optional(),
  certifications: z.array(z.string()).optional(),
  relatedTraceabilityId: z.string().optional().nullable(),
  createdAt: z.any(), // Firestore Timestamp
  updatedAt: z.any(), // Firestore Timestamp
  // Service-specific fields
  skillsRequired: z.union([z.array(z.string()), z.string()]).optional(),
  compensation: z.string().optional(),
  experienceLevel: z.string().optional(),
  brand: z.string().optional(),
  condition: z.string().optional(),
  availabilityStatus: z.string().optional(),
  contactInfo: z.string().optional(),
  status: z.enum(['pending_approval', 'active', 'rejected']).optional().default('pending_approval'),
});


export const MarketplaceOrderSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  itemId: z.string(),
  listingName: z.string(),
  buyerId: z.string(),
  sellerId: z.string(),
  quantity: z.number(),
  totalPrice: z.number(),
  currency: z.string(),
  status: z.string(), // e.g., 'new', 'confirmed', 'shipped', 'completed'
  buyerNotes: z.string().optional(),
  createdAt: z.any(), // Firestore Timestamp
  updatedAt: z.any(), // Firestore Timestamp
});


export const ShopSchema = z.object({
  id: z.string().optional(), // Optional for creation form
  ownerId: z.string().optional(), // Optional for creation form
  name: z.string().min(3, "Shop name must be at least 3 characters.").max(100),
  description: z.string().min(10, "Description must be at least 10 characters long.").max(1000),
  stakeholderType: z.enum(STAKEHOLDER_ROLES, {
    errorMap: () => ({ message: "Please select a valid business type."}),
  }),
  createdAt: z.any().optional(), // Firestore Timestamp
  updatedAt: z.any().optional(), // Firestore Timestamp
  logoUrl: z.string().url().nullable().optional(),
  bannerUrl: z.string().url().nullable().optional(),
  contactInfo: z.object({
      phone: z.string().optional(),
      website: z.string().optional(),
  }).optional(),
  itemCount: z.number().optional(),
  rating: z.number().optional(),
});

export const AgriEventSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(2000),
  eventDate: z.string(),
  eventTime: z.string().optional(),
  location: z.string().min(3).max(150),
  eventType: z.string(),
  organizer: z.string().optional(),
  websiteLink: z.string().optional(),
  imageUrl: z.string().optional(),
  dataAiHint: z.string().optional().nullable(),
  registrationEnabled: z.boolean().optional(),
  attendeeLimit: z.number().optional().nullable(),
  price: z.number().optional().nullable(),
  currency: z.string().optional(),
});

export const ForumPostSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    creatorId: z.string(),
    postCount: z.number().default(0),
    lastActivityAt: z.any(), // Firestore Timestamp
    createdAt: z.any(), // Firestore Timestamp
    icon: z.string().optional(), // For display purposes
    updatedAt: z.any(),
});

export const FinancialProductSchema = z.object({
  id: z.string(),
  fiId: z.string(),
  name: z.string(),
  type: z.enum(['Loan', 'Grant']),
  description: z.string(),
  interestRate: z.coerce.number().optional().nullable(),
  maxAmount: z.coerce.number().optional().nullable(),
  targetRoles: z.array(z.string()),
  status: z.enum(['Active', 'Inactive']),
  createdAt: z.any(),
  updatedAt: z.any(),
});

export const InsuranceProductSchema = z.object({
  id: z.string(),
  providerId: z.string(),
  name: z.string(),
  type: z.enum(['Crop', 'Livestock', 'Asset', 'Weather']),
  description: z.string(),
  coverageDetails: z.string(),
  premium: z.number(),
  currency: z.string(),
  status: z.enum(['Active', 'Inactive']),
  createdAt: z.any(),
  updatedAt: z.any(),
  provider: z.object({
      displayName: z.string(),
      avatarUrl: z.string().optional().nullable(),
  }).optional(),
});

export const InsuranceApplicationSchema = z.object({
    id: z.string(),
    applicantId: z.string(),
    productId: z.string(),
    farmId: z.string(),
    coverageValue: z.number(),
    status: z.string(), // e.g., 'Submitted', 'Under Review', 'Approved', 'Rejected'
    submittedAt: z.any(),
});

export const ApiKeySchema = z.object({
  id: z.string(),
  description: z.string().optional(),
  environment: z.enum(['Sandbox', 'Production']),
  status: z.enum(['Active', 'Revoked']),
  key: z.string(),
  keyPrefix: z.string().optional(),
  lastFour: z.string().optional(),
  createdAt: z.string(),
});

export const createFarmSchema = z.object({
  name: z.string().min(3, "Farm name must be at least 3 characters.").max(100, "Name cannot exceed 100 characters."),
  description: z.string().max(500, "Description cannot exceed 500 characters.").optional(),
  location: z.string().min(3, "Please provide a location.").max(200, "Location cannot exceed 200 characters."),
  size: z.string().min(1, "Please provide the farm size.").max(100, "Size description cannot exceed 100 characters."),
  farmType: z.enum(['crop', 'livestock', 'mixed', 'aquaculture', 'other'], {
    errorMap: () => ({ message: "Please select a farm type." }),
  }),
  irrigationMethods: z.string().max(200, "Irrigation methods description is too long.").optional(),
});

export const createCropSchema = z.object({
  farmId: z.string().min(1, "A farm ID is required."),
  cropType: z.string().min(2, "Crop type must be at least 2 characters.").max(100, "Crop type cannot exceed 100 characters."),
  plantingDate: z.date({
    required_error: "A planting date is required.",
    invalid_type_error: "That's not a valid date!",
  }),
  harvestDate: z.date().optional(),
  expectedYield: z.string().max(50, "Expected yield description is too long.").optional(),
  currentStage: z.enum(['Planting', 'Vegetative', 'Flowering', 'Fruiting', 'Harvesting', 'Post-Harvest']).optional(),
  notes: z.string().max(1000, "Notes are too long.").optional(),
});

// Other Schemas to be moved from `types.ts`
export const MarketplaceCouponSchema = z.object({
    id: z.string(),
    sellerId: z.string(),
    code: z.string(),
    discountType: z.enum(['percentage', 'fixed']),
    discountValue: z.number(),
    expiresAt: z.any(), // Timestamp
    usageLimit: z.number().nullable(),
    usageCount: z.number(),
    isActive: z.boolean(),
    applicableToListingIds: z.array(z.string()),
    applicableToCategories: z.array(z.string()),
    createdAt: z.any(), // Timestamp
});

export const ForumGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  memberCount: z.number(),
  isPublic: z.boolean(),
  ownerId: z.string(),
  createdAt: z.string(), // ISO String
});

export const JoinRequestSchema = z.object({
    id: z.string(), // Request ID
    requesterId: z.string(),
    requesterName: z.string(),
    requesterAvatarUrl: z.string().optional(),
    createdAt: z.string(),
});

export const ConnectionSchema = z.object({
    id: z.string(), // User ID of the connection
    displayName: z.string(),
    avatarUrl: z.string().optional(),
    primaryRole: z.string(),
    profileSummary: z.string(),
});

export const ConnectionRequestSchema = z.object({
    id: z.string(), // The request document ID
    requester: z.object({
        id: z.string(),
        displayName: z.string(),
        avatarUrl: z.string().optional(),
        primaryRole: z.string(),
    }),
    createdAt: z.string(), // ISO string
});

export const NotificationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  actorId: z.string(),
  type: z.enum(['like', 'comment', 'new_order', 'new_connection_request', 'event_reminder', 'service_reminder', 'profile_view']),
  title_en: z.string(),
  body_en: z.string(),
  linkedEntity: z.object({
    collection: z.string(),
    documentId: z.string(),
  }).nullable(),
  isRead: z.boolean(),
  createdAt: z.any(), // Firestore Timestamp
});


export const FinancialTransactionSchema = z.object({
    id: z.string(),
    type: z.enum(['income', 'expense']),
    amount: z.number(),
    currency: z.string(),
    description: z.string(),
    category: z.string().optional(),
    timestamp: z.any(), // Allow for firestore timestamp
});

export const FinancialSummarySchema = z.object({
    totalIncome: z.number(),
    totalExpense: z.number(),
    netFlow: z.number(),
});

export const KnfBatchSchema = z.object({
    id: z.string(),
    userId: z.string(),
    type: z.string(), // 'fpj', 'faa', etc.
    typeName: z.string(), // "Fermented Plant Juice"
    ingredients: z.string(),
    startDate: z.any(), // Firestore Timestamp
    nextStepDate: z.any(), // Firestore Timestamp
    status: z.enum(['Fermenting', 'Ready', 'Used', 'Archived']),
    nextStep: z.string(),
    createdAt: z.any().optional(),
    quantityProduced: z.number().optional(),
    unit: z.string().optional(),
});

export const PollOptionSchema = z.object({
  text: z.string(),
  votes: z.number().optional(),
});

export const FeedItemSchema = z.object({
  id: z.string(),
  type: z.enum(['forum_post', 'marketplace_listing', 'success_story', 'poll']),
  timestamp: z.string(),
  userId: z.string(),
  userName: z.string(),
  userAvatar: z.string().optional(),
  userHeadline: z.string().optional(),
  content: z.string(),
  link: z.string(),
  imageUrl: z.string().optional(),
  dataAiHint: z.string().optional(),
  likesCount: z.number(),
  commentsCount: z.number(),
  pollOptions: z.array(PollOptionSchema).optional(),
});

export const ConversationSchema = z.object({
  id: z.string(),
  participant: z.object({
    id: z.string(),
    name: z.string(),
    avatarUrl: z.string().optional(),
  }),
  lastMessage: z.string(),
  lastMessageTimestamp: z.string(),
  unreadCount: z.number(),
});

export const MessageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  senderId: z.string(),
  content: z.string(),
  timestamp: z.string(), // ISO string
});

export const MobileHomeCategorySchema = z.object({
    id: z.string(),
    name: z.string(),
    icon: z.any(), // Cannot serialize LucideIcon, use any for Zod
    href: z.string(),
    dataAiHint: z.string().optional(),
});

export const MobileDiscoverItemSchema = z.object({
    id: z.string(),
    title: z.string(),
    imageUrl: z.string(),
    type: z.enum(['Marketplace', 'Forum', 'Profile', 'Service']),
    link: z.string(),
    dataAiHint: z.string().optional(),
});

export const WorkerSchema = z.object({
  id: z.string(),
  name: z.string(),
  contactInfo: z.string().optional(),
  payRate: z.number().optional(),
  payRateUnit: z.string().optional(),
  totalHoursLogged: z.number().optional(),
  totalPaid: z.number().optional(),
});

export const WorkLogSchema = z.object({
    id: z.string(),
    hours: z.number(),
    date: z.string(), // ISO string
    taskDescription: z.string(),
    isPaid: z.boolean(),
});

export const PaymentLogSchema = z.object({
    id: z.string(),
    amount: z.number(),
    currency: z.string(),
    date: z.string(), // ISO string
    notes: z.string(),
});

export const ServiceItemSchema = MarketplaceItemSchema.extend({
    listingType: z.literal('Service'),
    skillsRequired: z.array(z.string()),
    compensation: z.string(),
    experienceLevel: z.string(),
});

export const GroupPostReplySchema = z.object({
  id: z.string(),
  content: z.string(),
  timestamp: z.string(), // ISO string
  author: z.object({
      id: z.string(),
      name: z.string(),
      avatarUrl: z.string().optional(),
  }),
});


// =================================================================
// 2. DASHBOARD DATA SCHEMAS
// =================================================================

export const FarmerDashboardAlertSchema = z.object({
    id: z.string(),
    icon: z.enum(['FlaskConical', 'Sprout']),
    type: z.enum(['info', 'warning']),
    message: z.string(),
    link: z.string(),
});

export const FarmerDashboardDataSchema = z.object({
  farmCount: z.number(),
  cropCount: z.number(),
  recentCrops: z.array(z.object({
      id: z.string(),
      name: z.string(),
      stage: z.string(),
      farmName: z.string(),
      farmId: z.string(),
      plantingDate: z.string().nullable(),
  })),
  knfBatches: z.array(KnfBatchSchema.omit({ createdAt: true, id: true }).extend({ id: z.string()})), // Omit createdAt as it's not on the frontend type
  financialSummary: FinancialSummarySchema.optional(),
  alerts: z.array(FarmerDashboardAlertSchema).optional(),
  certifications: z.array(z.object({
    id: z.string(),
    name: z.string(),
    issuingBody: z.string(),
  })).optional(),
});

export const CooperativeDashboardDataSchema = z.object({
    memberCount: z.number(),
    totalLandArea: z.number(),
    aggregatedProduce: z.array(z.object({
        id: z.string(),
        productName: z.string(),
        quantity: z.number(),
        quality: z.string(),
        readyBy: z.string(),
    })),
    pendingMemberApplications: z.number(),
    groupId: z.string().nullable(),
});

export const BuyerDashboardDataSchema = z.object({
  supplyChainRisk: z.object({
    region: z.string(),
    level: z.string(),
    factor: z.string(),
    action: z.object({
      label: z.string(),
      link: z.string(),
    }),
  }),
  sourcingRecommendations: z.array(z.object({
    id: z.string(),
    name: z.string(),
    product: z.string(),
    reliability: z.number(),
    vtiVerified: z.boolean(),
  })),
  marketPriceIntelligence: z.object({
    product: z.string(),
    trend: z.enum(['up', 'down', 'stable']),
    forecast: z.string(),
    action: z.object({
      label: z.string(),
      link: z.string(),
    }),
  }),
});

export const RegulatorDashboardDataSchema = z.object({
  complianceRiskAlerts: z.array(z.object({
    id: z.string(),
    issue: z.string(),
    region: z.string(),
    severity: z.enum(['High', 'Medium', 'Low']),
    actionLink: z.string(),
  })),
  pendingCertifications: z.object({
    count: z.number(),
    actionLink: z.string(),
  }),
  supplyChainAnomalies: z.array(z.object({
    id: z.string(),
    description: z.string(),
    level: z.enum(['Critical', 'Warning']),
    vtiLink: z.string(),
  })),
});

export const LogisticsDashboardDataSchema = z.object({
    activeShipments: z.array(z.object({
        id: z.string(),
        to: z.string(),
        status: z.string(),
        eta: z.string(),
        vtiLink: z.string(),
    })),
    incomingJobs: z.array(z.object({
        id: z.string(),
        from: z.string(),
        to: z.string(),
        product: z.string(),
        requirements: z.string(),
        actionLink: z.string(),
    })),
    performanceMetrics: z.object({
        onTimePercentage: z.number(),
        fuelEfficiency: z.string(),
        actionLink: z.string(),
    }),
});

export const FiDashboardDataSchema = z.object({
    pendingApplications: z.array(z.lazy(() => FinancialApplicationSchema)),
    portfolioOverview: z.object({
        loanCount: z.number(),
        totalValue: z.number(),
    }),
    financialProducts: z.array(z.lazy(() => FinancialProductSchema)),
});

export const FinancialApplicationSchema = z.object({
  id: z.string(),
  applicantId: z.string(),
  applicantName: z.string(),
  fiId: z.string(),
  type: z.string(),
  amount: z.number(),
  currency: z.string(),
  status: z.string(),
  riskScore: z.number().optional(),
  purpose: z.string(),
  submittedAt: z.string().nullable(),
  actionLink: z.string().optional(),
  applicantProfile: StakeholderProfileSchema.optional(),
});


export const FieldAgentDashboardDataSchema = z.object({
    assignedFarmers: z.array(z.object({
        id: z.string(),
        name: z.string(),
        lastVisit: z.string(), // ISO string
        issues: z.number(),
        actionLink: z.string(),
    })),
    portfolioHealth: z.object({
        overallScore: z.number(),
        alerts: z.array(z.string()),
        actionLink: z.string(),
    }),
    pendingReports: z.number(),
    dataVerificationTasks: z.object({
        count: z.number(),
        description: z.string(),
        actionLink: z.string(),
    }),
});

export const InputSupplierDashboardDataSchema = z.object({
    demandForecast: z.array(z.object({
        id: z.string(),
        region: z.string(),
        product: z.string(),
        trend: z.enum(['High', 'Steady', 'Low']),
        reason: z.string(),
    })),
    productPerformance: z.array(z.object({
        id: z.string(),
        productName: z.string(),
        rating: z.number(),
        feedback: z.string(),
        link: z.string(),
    })),
    activeOrders: z.object({
        count: z.number(),
        value: z.number(),
        link: z.string(),
    }),
});


export const AgroExportDashboardDataSchema = z.object({
    pendingCustomsDocs: z.array(z.object({
        id: z.string(),
        vtiLink: z.string(),
        destination: z.string(),
        status: z.string(),
    })),
    trackedShipments: z.array(z.object({
        id: z.string(),
        status: z.string(),
        location: z.string(),
        carrier: z.string(),
    })),
    complianceAlerts: z.array(z.object({
        id: z.string(),
        content: z.string(),
        actionLink: z.string(),
    })),
});

export const ProcessingUnitDashboardDataSchema = z.object({
  yieldOptimization: z.object({
    currentYield: z.number(),
    potentialYield: z.number(),
    suggestion: z.string(),
  }),
  inventory: z.array(z.object({
    product: z.string(),
    quality: z.string(),
    tons: z.number(),
  })),
  wasteReduction: z.object({
    currentRate: z.number(),
    insight: z.string(),
  }),
  packagingOrders: z.array(z.object({
    id: z.string(),
    supplierName: z.string(),
    deliveryDate: z.string(),
    status: z.string(),
    actionLink: z.string(),
  })),
  packagingInventory: z.array(z.object({
    id: z.string(),
    packagingType: z.string(),
    unitsInStock: z.number(),
    reorderLevel: z.number(),
  })),
});

export const WarehouseDashboardDataSchema = z.object({
  storageOptimization: z.object({
    utilization: z.number(),
    suggestion: z.string(),
  }),
  inventoryLevels: z.object({
    totalItems: z.number(),
    itemsNeedingAttention: z.number(),
  }),
  predictiveAlerts: z.array(z.object({
    alert: z.string(),
    actionLink: z.string(),
  })),
});

export const QaDashboardDataSchema = z.object({
  pendingInspections: z.array(z.object({
    id: z.string(),
    batchId: z.string(),
    productName: z.string(),
    sellerName: z.string(),
    dueDate: z.string(), // ISO String
    actionLink: z.string(),
  })),
  recentResults: z.array(z.object({
    id: z.string(),
    productName: z.string(),
    result: z.enum(['Pass', 'Fail']),
    reason: z.string().optional(),
    inspectedAt: z.string(), // ISO String
  })),
  qualityMetrics: z.object({
    passRate: z.number(),
    averageScore: z.number(),
  }),
});

export const CertificationBodyDashboardDataSchema = z.object({
  pendingAudits: z.array(z.object({
    id: z.string(),
    farmName: z.string(),
    standard: z.string(),
    dueDate: z.string(), // ISO String
    actionLink: z.string(),
  })),
  certifiedEntities: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
    certificationStatus: z.enum(['Active', 'Pending Renewal', 'Expired']),
    actionLink: z.string(),
  })),
  standardsMonitoring: z.array(z.object({
    standard: z.string(),
    adherenceRate: z.number(),
    alerts: z.number(),
    actionLink: z.string(),
  })),
});

export const ResearcherDashboardDataSchema = z.object({
  availableDatasets: z.array(z.object({
    id: z.string(),
    name: zstring(),
    dataType: z.string(),
    accessLevel: z.enum(['Public', 'Requires Request']),
    actionLink: z.string(),
  })),
  ongoingProjects: z.array(z.object({
    id: z.string(),
    title: z.string(),
    progress: z.number(),
    collaborators: z.array(z.string()),
    actionLink: z.string(),
  })),
  knowledgeHubContributions: z.array(z.object({
    id: z.string(),
    title: z.string(),
    status: z.enum(['Published', 'Pending Review', 'Draft']),
  })),
});

export const AgronomistDashboardDataSchema = z.object({
  assignedFarmersOverview: z.array(z.object({
    id: z.string(),
    name: z.string(),
    farmLocation: z.string(),
    lastConsultation: z.string(), // ISO String
    alerts: z.number(),
  })),
  pendingConsultationRequests: z.array(z.object({
    id: z.string(),
    farmerName: z.string(),
    issueSummary: z.string(),
    requestDate: z.string(), // ISO String
    farmerId: z.string(),
  })),
  knowledgeHubContributions: z.array(z.object({
    id: z.string(),
    title: z.string(),
    status: z.enum(['Published', 'Pending Review', 'Draft']),
  })),
});

export const EnergyProviderDashboardDataSchema = z.object({
  projectLeads: z.array(z.object({
    id: z.string(),
    entityName: z.string(),
    location: z.string(),
    estimatedEnergyNeed: z.string(),
    status: z.enum(['New', 'Contacted', 'Proposal Sent', 'Closed']),
    actionLink: z.string(),
  })),
  activeProjects: z.array(z.object({
    id: z.string(),
    projectName: z.string(),
    solutionType: z.string(),
    status: z.enum(['In Progress', 'Completed']),
    completionDate: z.string(), // ISO String
  })),
  impactMetrics: z.object({
    totalInstallations: z.number(),
    totalEstimatedCarbonReduction: z.string(),
  }),
});

export const CrowdfunderDashboardDataSchema = z.object({
  portfolioOverview: z.object({
    totalInvested: z.number(),
    numberOfInvestments: z.number(),
    estimatedReturns: z.number(),
  }),
  suggestedOpportunities: z.array(z.object({
    id: z.string(),
    projectName: z.string(),
    category: z.string(),
    fundingGoal: z.number(),
    amountRaised: z.number(),
    actionLink: z.string(),
  })),
  recentTransactions: z.array(z.object({
    id: z.string(),
    projectName: z.string(),
    type: z.enum(['Investment', 'Payout']),
    amount: z.number(),
    date: z.string(), // ISO String
  })),
});

export const EquipmentSupplierDashboardDataSchema = z.object({
  listedEquipment: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['Sale', 'Rental']),
    status: z.enum(['Available', 'Rented Out']),
    actionLink: z.string(),
  })),
  rentalActivity: z.object({
    totalRentals: z.number(),
  }),
  pendingMaintenanceRequests: z.array(z.object({
    id: z.string(),
    equipmentName: z.string(),
    issue: z.string(),
    farmerName: z.string(),
    actionLink: z.string(),
  })),
});

export const WasteManagementDashboardDataSchema = z.object({
  incomingWasteStreams: z.array(z.object({
    id: z.string(),
    type: z.string(), // e.g., 'Crop Residue', 'Animal Manure'
    source: z.string(), // e.g., 'Green Valley Farms'
    quantity: z.string(), // e.g., '5 tons'
  })),
  compostBatches: z.array(z.object({
    id: z.string(),
    status: z.enum(['Active', 'Curing', 'Ready']),
    estimatedCompletion: z.string(), // ISO date
  })),
  finishedProductInventory: z.array(z.object({
    product: z.string(),
    quantity: z.string(), // e.g., '20 tons'
    actionLink: z.string(),
  })),
});

export const PackagingSupplierDashboardDataSchema = z.object({
  incomingOrders: z.array(z.object({
    id: z.string(),
    customerName: z.string(),
    product: z.string(),
    quantity: z.number(),
    status: z.enum(['New', 'Processing', 'Shipped']),
    actionLink: z.string(),
  })),
  inventory: z.array(z.object({
    id: z.string(),
    item: z.string(),
    stock: z.number(),
    reorderLevel: z.number(),
  })),
});

export const SustainabilityDashboardDataSchema = z.object({
    carbonFootprint: z.object({ total: z.number(), unit: z.string(), trend: z.number() }),
    waterUsage: z.object({ efficiency: z.number(), unit: z.string(), trend: z.number() }),
    biodiversityScore: z.object({ score: z.number(), unit: z.string(), trend: z.number() }),
    sustainablePractices: z.array(z.object({ id: z.string(), practice: z.string(), lastLogged: z.string() })),
    certifications: z.array(z.object({ id:z.string(), name: z.string(), status: z.string(), expiry: z.string() })),
});

export const OperationsDashboardDataSchema = z.object({
  vtiGenerationRate: z.object({
    rate: z.number(),
    unit: z.literal('VTIs/hour'),
    trend: z.number(),
  }),
  dataPipelineStatus: z.object({
    status: z.enum(['Operational', 'Degraded', 'Offline']),
    lastChecked: z.string(), // ISO string
  }),
  flaggedEvents: z.array(z.object({
    id: z.string(),
    type: z.enum(['Anomalous Geolocation', 'Unusual Time Lag', 'Data Mismatch']),
    description: z.string(),
    vtiLink: z.string(),
  })),
});

export const AdminDashboardDataSchema = z.object({
    totalUsers: z.number(),
    totalFarms: z.number(),
    totalListings: z.number(),
    pendingApprovals: z.number(),
    newUsersLastWeek: z.number(),
});

export const AdminActivitySchema = z.object({
    id: z.string(),
    type: z.enum(['New User', 'New Listing']),
    primaryInfo: z.string(),
    secondaryInfo: z.string().optional(),
    timestamp: z.string(),
    link: z.string(),
    avatarUrl: z.string().optional(),
});

export const AgriTechInnovatorDashboardDataSchema = z.object({
  apiKeys: z.array(z.object({
    id: z.string(),
    key: z.string(),
    status: z.enum(['Active', 'Revoked']),
    environment: z.enum(['Sandbox', 'Production']),
    createdAt: z.string(), // ISO String
    description: z.string().optional(),
    keyPrefix: z.string().optional(),
    lastFour: z.string().optional(),
  })),
  sandboxStatus: z.object({
    status: z.enum(['Operational', 'Degraded', 'Offline']),
    lastReset: z.string(), // ISO String
  }),
  integrationProjects: z.array(z.object({
    id: z.string(),
    title: z.string(),
    status: z.enum(['In Development', 'Live', 'Archived']),
    partner: z.string(),
    actionLink: z.string(),
  })),
});


// =================================================================
// 3. AI FLOW SCHEMAS
// =================================================================

export const SuggestedFilterSchema = z.object({
  type: z.string().describe("The type of filter suggested (e.g., 'category', 'listingType', 'locationScope', 'intent')."),
  value: z.string().describe("The suggested value for the filter (e.g., 'fresh-produce-fruits', 'Product', 'Region', 'buy').")
});

export const SmartSearchInterpretationSchema = z.object({
  originalQuery: z.string().describe("The original query provided by the user."),
  mainKeywords: z.array(z.string()).describe("The core items, products, or services the user is likely searching for, extracted from the query."),
  identifiedLocation: z.string().optional().describe("Any specific location (city, region, country, continent) explicitly mentioned or strongly implied by the query. If multiple are mentioned, pick the most prominent or encompassing one."),
  identifiedIntent: z.string().optional().describe("The inferred user intent (e.g., 'buy', 'sell', 'rent', 'find service', 'job search', 'information', 'advice')."),
  suggestedFilters: z.array(SuggestedFilterSchema).optional().describe("An array of potential filters that could be applied based on the query interpretation. Helps narrow down search results."),
  interpretationNotes: z.string().optional().describe("A brief explanation of how the AI understood the query, or suggestions for how the user might refine their search for better results. This could include identified scope like 'local', 'regional', 'continental', 'global' if discernible."),
  minPrice: z.number().optional().describe("The minimum price if specified by the user (e.g., from 'over $50')."),
  maxPrice: z.number().optional().describe("The maximum price if specified by the user (e.g., from 'under $100')."),
  perUnit: z.string().optional().describe("The unit for the price if specified (e.g., '/kg', '/ton').")
});


export const MarketplaceRecommendationInputSchema = z.object({
  userId: z.string().optional().describe("The ID of the user to generate recommendations for."),
  count: z.number().optional().default(5).describe('The number of suggestions to generate.'),
  language: z.string().optional().describe('The language for the AI to respond in, specified as a two-letter ISO 639-1 code. Defaults to English.'),
});

const RecommendedItemSchema = z.object({
    item: MarketplaceItemSchema, // Using the existing schema
    reason: z.string().describe("A brief, user-friendly explanation (max 1-2 sentences) of why this item is recommended for this specific user.")
});

export const MarketplaceRecommendationOutputSchema = z.object({
  recommendations: z.array(RecommendedItemSchema).describe("A list of suggested marketplace items (products or services) with accompanying reasons."),
});

export const CropRotationInputSchema = z.object({
  cropHistory: z.array(z.string()).describe('An array of crop names that have been previously planted in the field, in chronological order.'),
  location: z.string().describe('The geographical location of the farm (e.g., "Rift Valley, Kenya").'),
  soilType: z.string().optional().describe('The type of soil in the field (e.g., "Clay", "Sandy Loam").'),
  language: z.string().optional().describe('The language for the AI to respond in, specified as a two-letter ISO 639-1 code. Defaults to English.'),
});

const CropSuggestionSchema = z.object({
  cropName: z.string().describe('The name of the suggested crop to plant next.'),
  benefits: z.string().describe('A brief explanation of the primary benefits of planting this crop (e.g., "Fixes nitrogen, improves soil structure", "Breaks pest cycles for cereals").'),
  notes: z.string().optional().describe('Any additional notes or considerations for planting this crop, such as timing or specific variety recommendations.'),
});
export const CropRotationOutputSchema = z.object({
  suggestions: z.array(CropSuggestionSchema).describe('A list of 2-4 recommended crops for the next planting season, along with their benefits.'),
});


export const DiagnoseCropInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  description: z.string().describe('The user\'s description of the problem or question about the plant.'),
  language: z.string().optional().describe('The language for the AI to respond in (e.g., "en", "km"). Defaults to English.'),
});

export const DiagnoseCropOutputSchema = z.object({
  isPlant: z.boolean().describe('Whether the image appears to contain a plant.'),
  isHealthy: z.boolean().describe('Whether the plant appears to be healthy.'),
  potentialProblems: z
    .array(z.string())
    .describe('A list of potential diseases, pests, or nutrient deficiencies identified.'),
  suggestedActions: z
    .array(
      z.object({
        title: z.string().describe('A short, actionable title for a suggested treatment or action.'),
        details: z.string().describe('A detailed description of the suggested action, preferably using sustainable or organic methods.'),
        type: z.enum(['treatment', 'prevention', 'further-investigation']).describe('The category of the suggested action.'),
      })
    )
    .describe('A list of structured, actionable suggestions for the user.'),
});

const DetailedPointSchema = z.object({
  title: z.string().describe('A concise title for a specific aspect, key practice, or detailed point related to the answer/diagnosis/explanation. Max 5-7 words.'),
  content: z.string().describe('The detailed explanation, advice, or information for this point. Should be a paragraph or two.'),
});

export const FarmingAssistantInputSchema = z.object({
  query: z.string().describe('The user\'s question about farming, agriculture, supply chain, farming business, app guidance, crop issues, or stakeholders in the agricultural ecosystem.'),
  photoDataUri: z.string().optional().describe("A photo of a plant or crop issue, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'. This is used for diagnosis."),
  language: z.string().optional().describe('The language for the AI to respond in, specified as a two-letter ISO 639-1 code (e.g., "en", "km", "fr", "de", "th"). Defaults to English if not provided.'),
});

export const FarmingAssistantOutputSchema = z.object({
  summary: z.string().describe("A concise overall answer, summary, primary diagnosis, or explanation to the user's query. This should be a few sentences long and directly address the main question or image content."),
  detailedPoints: z.array(DetailedPointSchema).optional().describe("An array of 3-5 detailed points or sections, each with a title and content, expanding on the summary/diagnosis/explanation or providing scannable key information. Only provide this if the query/image warrants a detailed breakdown."),
  suggestedQueries: z.array(z.string()).optional().describe("A list of 2-3 short, relevant follow-up questions or related topics the user might be interested in based on their initial query. For example, if they ask about one KNF input, suggest another."),
});
export const SuggestMarketPriceInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  description: z.string().describe('A detailed description of the product, including quality, origin, and certifications.'),
  category: z.string().optional().describe('The marketplace category of the product.'),
  location: z.string().optional().describe('The location where the product is being sold.'),
  language: z.string().optional().describe('The language for the AI to respond in (e.g., "en", "km"). Defaults to English.'),
});


export const SuggestMarketPriceOutputSchema = z.object({
  price: z.number().describe('The suggested market price as a number.'),
});
export const GenerateForumPostDraftInputSchema = z.object({
    topicId: z.string().describe("The ID of the forum topic the post will be created in."),
    prompt: z.string().describe("The user's short prompt or idea for the post."),
    language: z.string().optional().describe("The language for the AI to respond in (e.g., 'en', 'km'). Defaults to English."),
});

export const GenerateForumPostDraftOutputSchema = z.object({
    title: z.string().describe("A concise and engaging title for the new forum post."),
    content: z.string().describe("The full content of the forum post, written in a helpful and engaging tone."),
});

    

    
