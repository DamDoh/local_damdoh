

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

export const createAssetSchema = z.object({
  name: z.string().min(3, "Asset name must be at least 3 characters.").max(100),
  type: z.enum(['Machinery', 'Tool', 'Building', 'Other'], { required_error: "Please select an asset type." }),
  purchaseDate: z.date({ required_error: "Purchase date is required." }),
  value: z.coerce.number().min(0, "Value cannot be negative."),
  currency: z.string().default('USD'),
  notes: z.string().max(1000, "Notes cannot exceed 1000 characters.").optional(),
});
export type CreateAssetValues = z.infer<typeof createAssetSchema>;

export const createMarketplaceItemSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long.").max(100, "Name cannot exceed 100 characters."),
  listingType: z.enum(LISTING_TYPES, {
    errorMap: () => ({ message: "Please select a listing type (Product or Service)." }),
  }),
  description: z.string().min(10, "Description must be at least 10 characters long.").max(2000, "Description cannot exceed 2000 characters."),
  price: z.coerce.number({ invalid_type_error: "Price must be a number." }).min(0, "Price cannot be negative.").optional(),
  currency: z.string().length(3, "Currency must be a 3-letter code.").default("USD").transform(value => value.toUpperCase()),
  perUnit: z.string().max(30, "Unit description (e.g., /kg, /ton, /hour) is too long.").optional().or(z.literal('')),
  category: z.enum(UNIFIED_MARKETPLACE_CATEGORY_IDS, {
    errorMap: () => ({ message: "Please select a valid category." }),
  }),
  isSustainable: z.boolean().default(false).optional(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string(),
  }),
  imageFile: imageFileSchema,
  dataAiHint: z.string().optional(),
  contactInfo: z.string().min(5, "Contact information must be at least 5 characters long.").max(200, "Contact information cannot exceed 200 characters.").optional(),
  skillsRequired: z.string().max(250, "Skills list is too long (max 250 chars).").optional(),
  compensation: z.string().max(100, "Compensation details are too long (max 100 chars).").optional(),
   // Fields from extended schema, made optional for the form
  brand: z.string().max(50, "Brand name is too long.").optional(),
  condition: z.enum(['New', 'Used', 'Refurbished']).optional(),
  availabilityStatus: z.enum(['Available', 'Booking Required', 'Limited Availability']).optional(),
  certifications: z.string().max(500, "Certifications list is too long.").optional(),
  relatedTraceabilityId: z.string().max(100, "Traceability ID is too long.").optional().nullable(),
  experienceLevel: z.string().optional(),
});

export const createForumTopicSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters long.").max(150, "Title cannot exceed 150 characters."),
  description: z.string().min(20, "Description must be at least 20 characters long.").max(2000, "Description cannot exceed 2000 characters."),
});

export const createAgriEventSchema = z.object({
  title: z.string().min(5, "Event title must be at least 5 characters.").max(100, "Event title cannot exceed 100 characters."),
  description: z.string().min(20, "Event description must be at least 20 characters.").max(2000, "Event description cannot exceed 2000 characters."),
  eventDate: z.date({
    required_error: "Event date is required.",
    invalid_type_error: "That's not a valid date!",
  }),
  eventTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Please enter a valid time in HH:MM format (e.g., 14:30).").optional().or(z.literal('')),
  location: z.string().min(3, "Location must be at least 3 characters.").max(150, "Location cannot exceed 150 characters."),
  eventType: z.enum(AGRI_EVENT_TYPES, {
    errorMap: () => ({ message: "Please select a valid event type." }),
  }),
  organizer: z.string().max(100, "Organizer name cannot exceed 100 characters.").optional(),
  websiteLink: z.string().url({ message: "Please enter a valid URL for the event website." }).optional().or(z.literal('')),
  imageFile: imageFileSchema,
  dataAiHint: z.string().optional(),
  registrationEnabled: z.boolean().default(false).optional(),
  attendeeLimit: z.coerce.number().int().positive("Must be a positive number.").optional(),
  price: z.coerce.number().min(0, "Price cannot be negative.").optional(),
  currency: z.string().length(3, "Currency must be a 3-letter code.").optional(),
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
  farmId: z.string().min(1, "A farm ID is required."), // Added farmId for validation
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

export const createInputApplicationSchema = z.object({
  applicationDate: z.date({ required_error: "An application date is required." }),
  inputId: z.string().min(2, "Input name/ID is required.").max(100),
  quantity: z.coerce.number().positive("Quantity must be a positive number."),
  unit: z.string().min(1, "Unit is required.").max(20),
  method: z.string().max(100).optional(),
});

export const createObservationSchema = z.object({
  observationType: z.string().min(3, { message: "Please select an observation type."}),
  observationDate: z.date({ required_error: "An observation date is required." }),
  details: z.string().min(10, "Details must be at least 10 characters.").max(1000),
  imageFile: imageFileSchema,
});

export const createHarvestSchema = z.object({
    harvestDate: z.date({ required_error: "A harvest date is required."}),
    yield_kg: z.coerce.number().positive("Yield must be a positive number."),
    quality_grade: z.string().min(1, "Quality grade is required.").max(50),
    notes: z.string().max(1000).optional(),
    pricePerUnit: z.coerce.number().positive("Price must be a positive number.").optional(),
    unit: z.string().min(1, "Unit is required.").max(20).optional(),
});

export const editProfileSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters.").max(100, "Name cannot exceed 100 characters."),
  email: z.string().email("Please enter a valid email address."),
  role: z.enum(STAKEHOLDER_ROLES, {
    errorMap: () => ({ message: "Please select a valid stakeholder role."}),
  }),
  profileSummary: z.string().max(250, "Profile summary cannot exceed 250 characters.").optional(),
  bio: z.string().max(2000, "Bio cannot exceed 2000 characters.").optional(),
  location: z.string().min(2, "Location must be at least 2 characters.").max(100, "Location cannot exceed 100 characters."),
  areasOfInterest: z.string().max(500, "Areas of interest cannot exceed 500 characters (use comma-separated values).").optional(),
  needs: z.string().max(500, "Needs/offerings cannot exceed 500 characters (use comma-separated values).").optional(),
  contactInfoPhone: z.string().max(30, "Phone number is too long.").optional(),
  contactInfoWebsite: z.string().url({ message: "Please enter a valid website URL."}).optional().or(z.literal('')),
  profileData: z.any().optional(),
});

export const signInSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long." }),
});

export const signUpSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).max(100, { message: "Name cannot be longer than 100 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  role: z.enum(STAKEHOLDER_ROLES, {
    errorMap: () => ({ message: "Please select a stakeholder role." }),
  }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long." }),
  confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters long." }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"], // path of error
});

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, { message: "Password must be at least 8 characters long." }),
  confirmPassword: z.string().min(8, { message: "Password must be at least 8 characters long." }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

export const logFinancialTransactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  date: z.string().min(1, "Date is required."),
  amount: z.coerce.number({ required_error: "Amount is required.", invalid_type_error: "Amount must be a number."}).min(0.01, "Amount must be positive."),
  currency: z.string().min(3, "Please select a currency.").max(3),
  description: z.string().min(3, "Description is required.").max(200, "Description is too long."),
  category: z.string().max(50, "Category is too long.").optional(),
});

export const createShopSchema = z.object({
  name: z.string().min(3, "Shop name must be at least 3 characters.").max(100),
  description: z.string().min(10, "Description must be at least 10 characters long.").max(1000),
  stakeholderType: z.enum(STAKEHOLDER_ROLES, {
    errorMap: () => ({ message: "Please select a valid business type."}),
  }),
});

// Internationalized schema using a factory function
export const getCreateMarketplaceCouponSchema = (t: (key: string) => string) => z.object({
  code: z.string()
      .min(4, t('code.min'))
      .max(20, t('code.max'))
      .regex(/^[a-zA-Z0-9]+$/, t('code.regex')),
  discountType: z.enum(['percentage', 'fixed'], { required_error: t('discountType.required') }),
  discountValue: z.coerce.number({invalid_type_error: t('discountValue.invalid')}).positive(t('discountValue.positive')),
  expiresAt: z.date().optional(),
  usageLimit: z.coerce.number().int().positive(t('usageLimit.positive')).optional(),
}).refine(data => {
    if (data.discountType === 'percentage' && data.discountValue > 100) {
        return false;
    }
    return true;
}, {
    message: t('discountValue.percentageMax'),
    path: ["discountValue"],
});

export const createInsuranceProductSchema = z.object({
  name: z.string().min(5, "Product name must be at least 5 characters.").max(100),
  type: z.enum(['Crop', 'Livestock', 'Asset', 'Weather'], { required_error: "Please select a product type." }),
  description: z.string().min(20, "Please provide a detailed description.").max(1000),
  coverageDetails: z.string().min(20, "Please provide coverage details.").max(2000),
  premium: z.coerce.number().positive("Premium must be a positive number."),
  currency: z.string().length(3, "Currency must be a 3-letter code.").default("USD"),
});

export const createInsuranceApplicationSchema = z.object({
  productId: z.string(),
  farmId: z.string({ required_error: "Please select the farm to insure." }),
  coverageValue: z.coerce.number().positive("Coverage value must be a positive number."),
});

export const financialApplicationSchema = z.object({
  fiId: z.string({ required_error: "Please select a financial institution." }),
  type: z.enum(['Loan', 'Grant']),
  amount: z.coerce.number().positive("Please enter a valid loan amount."),
  currency: z.string().length(3, "Currency must be a 3-letter code.").default("USD"),
  purpose: z.string().min(20, "Please describe the purpose of the funding.").max(2000),
});

export const createInventoryItemSchema = z.object({
    name: z.string().min(2, "Item name is required."),
    category: z.enum(['Seeds', 'Fertilizers', 'Pesticides', 'Animal Feed', 'Tools', 'Other'], { required_error: "Please select a category." }),
    quantity: z.coerce.number().min(0, "Quantity cannot be negative."),
    unit: z.string().min(1, "Unit is required (e.g., kg, bags, liters)."),
    purchaseDate: z.date().optional(),
    expiryDate: z.date().optional(),
    supplier: z.string().optional(),
    notes: z.string().optional(),
});

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

// Schemas for Dashboard Data
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
  knfBatches: z.array(z.any()), // Re-using KnfBatchSchema was problematic, using any for now
  financialSummary: z.any().optional(), // Re-using FinancialSummarySchema was problematic
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
});

export const BuyerDashboardDataSchema = z.object({
  supplyChainRisk: z.object({
    region: z.string(),
    level: z.string(),
    factor: z.string(),
    action: z.object({ label: z.string(), link: z.string() }),
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
    action: z.object({ label: z.string(), link: z.string() }),
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
  pendingApplications: z.array(z.any()), // Using `any` due to recursive issues, should be FinancialApplicationSchema
  portfolioOverview: z.object({
    loanCount: z.number(),
    totalValue: z.number(),
  }),
  financialProducts: z.array(z.any()), // Using `any` due to recursive issues, should be FinancialProductSchema
});

export const FieldAgentDashboardDataSchema = z.object({
    assignedFarmers: z.array(z.object({
        id: z.string(),
        name: z.string(),
        lastVisit: z.string(),
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
    name: z.string(),
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
  })),
  knowledgeHubContributions: z.array(z.object({
    id: z.string(),
    title: z.string(),
    status: z.enum(['Published', 'Pending Review']),
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
    unit: z.enum(['VTIs/hour']),
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
    type: z.string(),
    primaryInfo: z.string(),
    secondaryInfo: z.string().optional(),
    timestamp: z.string(),
    link: z.string(),
    avatarUrl: z.string().optional().nullable(),
});

export const AgriTechInnovatorDashboardDataSchema = z.object({
  apiKeys: z.array(ApiKeySchema),
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
