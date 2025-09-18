

import { z } from "zod";
import { UNIFIED_MARKETPLACE_CATEGORY_IDS, LISTING_TYPES, AGRI_EVENT_TYPES, STAKEHOLDER_ROLES } from '@/lib/constants';

// =================================================================
// 1. CORE DATA SCHEMAS
// These schemas define the shape of data in Firestore and are used for
// validation on both the frontend (forms) and backend (Cloud Functions).
// =================================================================

// --- Stakeholder Profile Schemas (Centralized) ---

const baseProfileSchema = z.object({
  location: z.string().optional(),
  profileSummary: z.string().optional(),
  needs: z.array(z.string()).optional(),
});

export const farmerProfileSchema = baseProfileSchema.extend({
  farmSize: z.number().optional(),
  crops: z.array(z.string()).optional(),
  livestock: z.array(z.string()).optional(),
});
export const fieldAgentProfileSchema = baseProfileSchema.extend({
  specialization: z.string().optional(),
  yearsOfExperience: z.number().optional(),
});
export const logisticsTeamProfileSchema = baseProfileSchema.extend({
  fleetSize: z.number().optional(),
  coverageArea: z.string().optional(),
});
export const qaTeamProfileSchema = baseProfileSchema.extend({
  certifications: z.array(z.string()).optional(),
  inspectionCapacity: z.string().optional(),
});
export const processingUnitProfileSchema = baseProfileSchema.extend({
  processingTypes: z.array(z.string()).optional(),
  capacity: z.string().optional(),
});
export const buyerProfileSchema = baseProfileSchema.extend({
  businessType: z.string().optional(),
  productNeeds: z.array(z.string()).optional(),
});
export const inputSupplierProfileSchema = baseProfileSchema.extend({
  productCategories: z.array(z.string()).optional(),
  distributionReach: z.string().optional(),
});
export const financialInstitutionProfileSchema = baseProfileSchema.extend({
  servicesOffered: z.array(z.string()).optional(),
  loanProducts: z.array(z.string()).optional(),
});
export const regulatorProfileSchema = baseProfileSchema.extend({
  jurisdiction: z.string().optional(),
  regulatoryFocus: z.array(z.string()).optional(),
});
export const certificationBodyProfileSchema = baseProfileSchema.extend({
  certificationsOffered: z.array(z.string()).optional(),
  accreditation: z.string().optional(),
});
export const consumerProfileSchema = baseProfileSchema.extend({
  dietaryPreferences: z.array(z.string()).optional(),
  sustainabilityFocus: z.boolean().optional(),
});
export const researcherProfileSchema = baseProfileSchema.extend({
  institution: z.string().optional(),
  researchInterests: z.array(z.string()).optional(),
});
export const logisticsPartnerProfileSchema = baseProfileSchema.extend({
  transportModes: z.array(z.string()).optional(),
  warehouseLocations: z.array(z.string()).optional(),
});
export const warehouseProfileSchema = baseProfileSchema.extend({
  storageCapacity: z.string().optional(),
  storageConditions: z.array(z.string()).optional(),
});
export const agronomyExpertProfileSchema = baseProfileSchema.extend({
  consultingAreas: z.array(z.string()).optional(),
  hourlyRate: z.number().optional(),
});
export const agroTourismOperatorProfileSchema = baseProfileSchema.extend({
  experiencesOffered: z.array(z.string()).optional(),
  bookingLink: z.string().optional(),
});
export const energyProviderProfileSchema = baseProfileSchema.extend({
  energySolutions: z.array(z.string()).optional(),
  installationServices: z.boolean().optional(),
});
export const agroExportFacilitatorProfileSchema = baseProfileSchema.extend({
  countriesOfOperation: z.array(z.string()).optional(),
  services: z.array(z.string()).optional(),
});
export const insuranceProviderProfileSchema = baseProfileSchema.extend({
  insuranceProducts: z.array(z.string()).optional(),
  coverageArea: z.string().optional(),
});
export const packagingSupplierProfileSchema = baseProfileSchema.extend({
  packagingTypes: z.array(z.string()).optional(),
  sustainabilityOptions: z.boolean().optional(),
});
export const crowdfunderProfileSchema = baseProfileSchema.extend({
  investmentInterests: z.array(z.string()).optional(),
  averageInvestmentSize: z.string().optional(),
});
export const agriTechInnovatorProfileSchema = baseProfileSchema.extend({
    technologyFocus: z.array(z.string()).optional(),
    integrationCapabilities: z.array(z.string()).optional(),
});
export const wasteManagementProfileSchema = baseProfileSchema.extend({
    wasteTypesAccepted: z.array(z.string()).optional(),
    outputProducts: z.array(z.string()).optional(),
});
export const equipmentSupplierProfileSchema = baseProfileSchema.extend({
    equipmentTypes: z.array(z.string()).optional(),
    brandsCarried: z.array(z.string()).optional(),
});

// A comprehensive map of role names to their respective schemas
export const stakeholderProfileSchemas = {
  "Farmer": farmerProfileSchema,
  "Agricultural Cooperative": baseProfileSchema,
  "Field Agent/Agronomist (DamDoh Internal)": fieldAgentProfileSchema,
  "Operations/Logistics Team (DamDoh Internal)": logisticsTeamProfileSchema,
  "Quality Assurance Team (DamDoh Internal)": qaTeamProfileSchema,
  "Processing & Packaging Unit": processingUnitProfileSchema,
  "Buyer (Restaurant, Supermarket, Exporter)": buyerProfileSchema,
  "Input Supplier (Seed, Fertilizer, Pesticide)": inputSupplierProfileSchema,
  "Equipment Supplier (Sales of Machinery/IoT)": equipmentSupplierProfileSchema,
  "Financial Institution (Micro-finance/Loans)": financialInstitutionProfileSchema,
  "Government Regulator/Auditor": regulatorProfileSchema,
  "Certification Body (Organic, Fair Trade etc.)": certificationBodyProfileSchema,
  "Consumer": consumerProfileSchema,
  "Researcher/Academic": researcherProfileSchema,
  "Logistics Partner (Third-Party Transporter)": logisticsPartnerProfileSchema,
  "Storage/Warehouse Facility": warehouseProfileSchema,
  "Agronomy Expert/Consultant (External)": agronomyExpertProfileSchema,
  "Agro-Tourism Operator": agroTourismOperatorProfileSchema,
  "Energy Solutions Provider (Solar, Biogas)": energyProviderProfileSchema,
  "Agro-Export Facilitator/Customs Broker": agroExportFacilitatorProfileSchema,
  "Agri-Tech Innovator/Developer": agriTechInnovatorProfileSchema,
  "Waste Management & Compost Facility": wasteManagementProfileSchema,
  "Crowdfunder (Impact Investor, Individual)": crowdfunderProfileSchema,
  "Insurance Provider": insuranceProviderProfileSchema,
  "Packaging Supplier": packagingSupplierProfileSchema,
};

// --- End Stakeholder Schemas ---


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
  viewCount: z.number().optional(),
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
  sellerLocation: z.object({
    address: z.string().optional(),
  }).optional().nullable(),
  buyerLocation: z.object({
    address: z.string().optional(),
  }).optional().nullable(),
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
  id: z.string().optional(),
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
  registeredAttendeesCount: z.number().optional(),
  price: z.number().optional().nullable(),
  currency: z.string().optional(),
});

export const ForumTopicSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    creatorId: z.string(),
    postCount: z.number().default(0),
    lastActivityAt: z.any(), // Firestore Timestamp
    createdAt: z.any(), // Firestore Timestamp
    icon: z.string().optional(), // For display purposes
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
    applicantName: z.string().optional(),
    type: z.string().optional(),
    amount: z.number().optional(),
    riskScore: z.number().optional(),
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

export const FarmAssetSchema = z.object({
  name: z.string().min(3, "Asset name must be at least 3 characters.").max(100),
  type: z.enum(['Machinery', 'Tool', 'Building', 'Other'], { required_error: "Please select an asset type." }),
  purchaseDate: z.date({ required_error: "Purchase date is required." }),
  value: z.coerce.number().min(0, "Value cannot be negative."),
  currency: z.string().default('USD'),
  notes: z.string().max(1000, "Notes cannot exceed 1000 characters.").optional(),
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

export const GroupPostSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  authorRef: z.string(),
  authorName: z.string(),
  authorAvatarUrl: z.string(),
  replyCount: z.number(),
  createdAt: z.string(), // ISO
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

export const KnowledgeArticleSchema = z.object({
  id: z.string(),
  title_en: z.string().optional().nullable(),
  title_km: z.string().optional().nullable(),
  content_markdown_en: z.string().optional().nullable(),
  content_markdown_km: z.string().optional().nullable(),
  excerpt_en: z.string().optional().nullable(),
  excerpt_km: z.string().optional().nullable(),
  category: z.string(),
  tags: z.array(z.string()),
  author: z.string(),
  authorId: z.string(),
  status: z.enum(['Published', 'Draft']),
  createdAt: z.any(), // Timestamp
  updatedAt: z.any(), // Timestamp
  imageUrl: z.string().url().optional().nullable(),
  dataAiHint: z.string().optional().nullable(),
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


// =================================================================
// 2. FORM-SPECIFIC SCHEMAS
// These are used for client-side form validation and often overlap with
// the core schemas but may omit fields generated by the server.
// =================================================================

// File upload schema for reuse
const fileUploadSchema = z
  .instanceof(File, { message: "Please upload a file." })
  .optional()
  .refine(
    (file) => !file || file.size <= 5 * 1024 * 1024,
    `Max image size is 5MB.`
  )
  .refine(
    (file) => !file || ["image/jpeg", "image/png", "image/webp"].includes(file.type),
    "Only .jpg, .png and .webp formats are accepted."
  );

export const createFarmSchema = z.object({
  name: z.string().min(3, "Farm name must be at least 3 characters.").max(100),
  location: z.string().min(3, "Location is required.").max(200),
  size: z.coerce.number().min(0, "Size cannot be negative."),
  sizeUnit: z.enum(['Acres', 'Hectares', 'Square Meters'], { required_error: "Please select a size unit." }),
  description: z.string().max(1000).optional(),
});

export const createCropSchema = z.object({
  cropType: z.string().min(2, "Crop type is required.").max(100),
  plantingDate: z.date({ required_error: "Planting date is required." }),
  expectedHarvestDate: z.date().optional(),
  farmId: z.string(),
  notes: z.string().max(1000).optional(),
  currentStage: z.enum(['Planting', 'Vegetative', 'Flowering', 'Fruiting', 'Harvesting', 'Post-Harvest']).optional(),
});

export const createInventoryItemSchema = z.object({
  name: z.string().min(3, "Item name must be at least 3 characters.").max(100),
  category: z.enum(['Seeds', 'Fertilizers', 'Pesticides', 'Animal Feed', 'Tools', 'Other'], { required_error: "Please select a category." }),
  quantity: z.coerce.number().min(0, "Quantity cannot be negative."),
  unit: z.string().min(1, "Unit is required.").max(20),
  purchaseDate: z.date().optional(),
  expiryDate: z.date().optional(),
  supplier: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
});
export type CreateInventoryItemValues = z.infer<typeof createInventoryItemSchema>;


// =================================================================
// 3. AI FLOW-SPECIFIC SCHEMAS
// These define the inputs and outputs for Genkit AI flows.
// =================================================================

export const SmartSearchInterpretationSchema = z.object({
  originalQuery: z.string().describe("The original, unmodified user query."),
  mainKeywords: z.array(z.string()).describe("The core nouns or concepts the user is searching for."),
  identifiedLocation: z.string().optional().describe("A specific location (city, region, country) mentioned in the query."),
  identifiedIntent: z.enum(['buy', 'sell', 'rent', 'find service', 'find information']).optional().describe("The user's likely goal."),
  suggestedFilters: z.array(z.object({
    type: z.enum(['category', 'listingType', 'role', 'tag']).describe("The type of filter to apply."),
    value: z.string().describe("The specific value for the filter."),
  })).optional().describe("A list of potential filters to apply to the search results."),
  interpretationNotes: z.string().optional().describe("A brief, natural language explanation of how the query was interpreted."),
  minPrice: z.number().optional().describe("The minimum price specified in the query."),
  maxPrice: z.number().optional().describe("The maximum price specified in the query."),
  perUnit: z.string().optional().describe("The pricing unit specified (e.g., /kg, /ton, /hour)."),
});

export const MarketplaceRecommendationInputSchema = z.object({
    userId: z.string(),
    count: z.number().optional().default(5),
});

export const MarketplaceRecommendationOutputSchema = z.object({
    recommendations: z.array(z.object({
        item: MarketplaceItemSchema,
        reason: z.string().describe("A personalized reason why this item is recommended for the user."),
    })),
});

export const CropRotationInputSchema = z.object({
  cropHistory: z.array(z.string()).describe("List of previous crops planted in the field, in chronological order."),
  location: z.string().describe("The geographical location of the farm (e.g., 'Rift Valley, Kenya')."),
  soilType: z.string().optional().describe("The soil type of the field (e.g., 'Loamy', 'Clay')."),
  language: z.string().optional().describe("The language for the AI to respond in (e.g., 'en', 'km'). Defaults to English."),
});

export const CropRotationOutputSchema = z.object({
  suggestions: z.array(z.object({
    cropName: z.string().describe("The name of the suggested crop."),
    benefits: z.string().describe("Explanation of the agronomic benefits of planting this crop next."),
    notes: z.string().optional().describe("Any additional practical tips for the farmer."),
  })),
});

export const DiagnoseCropInputSchema = z.object({
  photoDataUri: z.string().describe("A photo of the plant as a Base64 encoded data URI."),
  description: z.string().describe("The user's description of the problem or question about the plant."),
  language: z.string().optional().describe("The language for the AI to respond in (e.g., 'en', 'es'). Defaults to English."),
});

export const DiagnoseCropOutputSchema = z.object({
  isPlant: z.boolean().describe("Whether the image contains a plant."),
  isHealthy: z.boolean().describe("Whether the plant appears to be healthy."),
  potentialProblems: z.array(z.string()).describe("A list of potential diseases, pests, or deficiencies identified."),
  suggestedActions: z.array(z.object({
    title: z.string().describe("A short title for the suggested action."),
    details: z.string().describe("A detailed explanation of the action."),
    type: z.enum(['treatment', 'prevention', 'further-investigation']).describe("The category of the action."),
  })),
});

export const FarmingAssistantInputSchema = z.object({
  query: z.string().describe("The user's question or message to the assistant."),
  photoDataUri: z.string().optional().describe("An optional photo of a plant provided by the user for diagnosis, as a data URI."),
  language: z.string().optional().describe("The language for the AI to respond in, specified as a two-letter ISO 639-1 code. Defaults to English."),
});

export const FarmingAssistantOutputSchema = z.object({
  summary: z.string().describe("A concise, direct summary of the answer or diagnosis."),
  detailedPoints: z.array(z.object({
    title: z.string().describe("A short, clear heading for a specific point or action."),
    content: z.string().describe("The detailed content or explanation for that point."),
  })).optional().describe("An optional list of structured points for more complex answers."),
  suggestedQueries: z.array(z.string()).optional().describe("An optional list of 2-3 relevant follow-up questions."),
});


export const SuggestMarketPriceInputSchema = z.object({
    productName: z.string(),
    description: z.string(),
    category: z.string().optional(),
    location: z.string(),
});

export const SuggestMarketPriceOutputSchema = z.object({
    price: z.number(),
});
