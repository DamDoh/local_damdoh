
import { z } from "zod";
import { STAKEHOLDER_ROLES, LISTING_TYPES, UNIFIED_MARKETPLACE_CATEGORY_IDS, AGRI_EVENT_TYPES } from "@/lib/constants";

// Super App Vision Note: The schemas are the DNA of the application.
// By defining clear, robust data structures, we enable the seamless flow of information
// between modules. For example, `relatedTraceabilityId` on the MarketplaceItemSchema
// is a direct link back to the Traceability module, creating a powerful, interconnected system.
// Future AI features will rely on these well-defined schemas to validate data, detect anomalies
// (e.g., an illogical sequence of traceability events), and provide intelligent suggestions.

export const ContactInfoSchema = z.object({
  phone: z.string().optional(),
  website: z.string().url({ message: "Invalid website URL" }).optional().or(z.literal('')),
  email: z.string().email({ message: "Invalid email address" }).optional(),
});

export const GeoPointSchema = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
});

export const StakeholderProfileSchema = z.object({
  id: z.string().cuid2({ message: "Invalid CUID" }),
  name: z.string().min(2, "Name must be at least 2 characters.").max(100),
  email: z.string().email(),
  avatarUrl: z.string().url().optional(),
  role: z.enum(STAKEHOLDER_ROLES),
  location: z.string().min(2).max(150),
  bio: z.string().max(2000).optional(),
  profileSummary: z.string().max(250).optional(),
  yearsOfExperience: z.number().int().min(0).optional(),
  areasOfInterest: z.array(z.string()).optional(),
  needs: z.array(z.string()).optional(),
  contactInfo: ContactInfoSchema.optional(),
  connections: z.array(z.string().cuid2()).optional(), 
  createdAt: z.string().datetime({ message: "Invalid ISO datetime string" }),
  updatedAt: z.string().datetime({ message: "Invalid ISO datetime string" }),
  // New fields for organizations
  organizationId: z.string().cuid2().optional(),
  isOrgAdmin: z.boolean().default(false).optional(),
  bannerUrl: z.string().url().optional(),
});

export const OrganizationSchema = z.object({
  id: z.string().cuid2(),
  name: z.string().min(2).max(150),
  type: z.string().max(100), // E.g., 'Cooperative', 'Logistics Company', 'NGO'
  location: z.string().max(150),
  geoPoint: GeoPointSchema.optional(),
  contactPersonId: z.string().cuid2(),
  kycStatus: z.enum(['pending', 'verified', 'rejected']).default('pending'),
  businessRegistrationDocUrl: z.string().url().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const AiPriceSuggestionSchema = z.object({
  min: z.number(),
  max: z.number(),
  confidence: z.enum(['Low', 'Medium', 'High']), 
});

export const FarmSchema = z.object({
  id: z.string().cuid2(), 
  ownerId: z.string().cuid2(),
  name: z.string().min(2).max(100),
  location: GeoPointSchema,
  size: z.string().max(50).optional(),
  mainCrops: z.array(z.string().max(50)).optional(),
  description: z.string().max(500).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const BatchSchema = z.object({
  id: z.string().cuid2(), // This IS the Vibrant Traceability ID (VTI)
  farmId: z.string().cuid2(),
  productName: z.string().min(2).max(100),
  quantity: z.number().min(0),
  unit: z.string().max(20),
  harvestDate: z.string().datetime(),
  status: z.string().max(50),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const TraceabilityEventSchema = z.object({
  id: z.string().cuid2(),
  batchId: z.string().cuid2(),
  eventType: z.string().max(50),
  timestamp: z.string().datetime(),
  location: GeoPointSchema.optional(),
  details: z.string().max(1000).optional(),
  photoUrl: z.string().url().optional().or(z.literal('')),
  verifierId: z.string().cuid2().optional(),
});

export const MarketplaceItemSchema = z.object({
  id: z.string().cuid2({ message: "Invalid CUID" }),
  name: z.string().min(3, "Name must be at least 3 characters.").max(100, "Name cannot exceed 100 characters."),
  listingType: z.enum(LISTING_TYPES),
  description: z.string().min(10, "Description must be at least 10 characters long.").max(2000, "Description cannot exceed 2000 characters."),
  price: z.number().min(0).optional(),
  currency: z.string().length(3, "Currency code must be 3 characters.").toUpperCase().default("USD"),
  perUnit: z.string().max(30, "Unit description is too long.").optional(),
  sellerId: z.string().cuid2({ message: "Invalid seller ID" }),
  category: z.enum(UNIFIED_MARKETPLACE_CATEGORY_IDS, { errorMap: () => ({ message: "Please select a valid category."}) }),
  location: z.string().min(2, "Location is too short.").max(150, "Location is too long."),
  imageUrl: z.string().url({ message: "Invalid image URL."}).optional().or(z.literal('')),
  createdAt: z.string().datetime({ message: "Invalid ISO datetime string" }),
  updatedAt: z.string().datetime({ message: "Invalid ISO datetime string" }),
  contactInfo: z.string().min(5, "Contact info is too short.").max(300, "Contact info is too long.").optional(),
  dataAiHint: z.string().max(50, "AI hint is too long.").optional(),
  isSustainable: z.boolean().optional().default(false),
  sellerVerification: z.enum(['Verified', 'Pending', 'Unverified']).optional().default('Pending'),
  aiPriceSuggestion: AiPriceSuggestionSchema.optional(),
  stockQuantity: z.number().int().min(0).optional(),
  // Synergy Point: This field directly links a marketplace product to its source batch,
  // enabling full "farm to folk" traceability.
  relatedTraceabilityId: z.string().cuid2({ message: "Invalid traceability ID" }).optional(),
  serviceType: z.string().max(50).optional(),
  priceDisplay: z.string().max(100).optional(),
  availabilityStatus: z.string().max(50).optional(),
  serviceArea: z.string().max(150).optional(),
  relatedFinancialProductId: z.string().cuid2({ message: "Invalid financial product ID" }).optional(),
  relatedInsuranceProductId: z.string().cuid2({ message: "Invalid insurance product ID" }).optional(),
  skillsRequired: z.array(z.string().max(50, "Skill entry is too long.")).optional(),
  experienceLevel: z.string().max(100, "Experience level description is too long.").optional(),
  compensation: z.string().max(150, "Compensation details are too long.").optional(),
  serviceAvailability: z.string().max(100, "Service availability is too long.").optional(),
  brand: z.string().max(50, "Brand name is too long.").optional(),
  condition: z.enum(['New', 'Used', 'Refurbished']).optional(),
  certifications: z.array(z.string().max(100, "Certification name is too long.")).optional(),
  traceabilityLink: z.string().url({ message: "Invalid traceability link URL." }).optional().or(z.literal('')),
});

export const MarketplaceOrderSchema = z.object({
  id: z.string().cuid2(),
  listingId: z.string().cuid2(),
  listingName: z.string(), // Denormalized for easy display
  listingImageUrl: z.string().url().optional().or(z.literal('')), // Denormalized
  buyerId: z.string().cuid2(),
  sellerId: z.string().cuid2(),
  quantity: z.number().min(1),
  totalPrice: z.number().min(0),
  currency: z.string().length(3),
  status: z.enum(['pending', 'confirmed', 'shipped', 'completed', 'cancelled']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});


export const ForumTopicSchema = z.object({
  id: z.string().cuid2({ message: "Invalid CUID" }),
  name: z.string().min(10).max(150),
  description: z.string().min(20).max(2000),
  creatorId: z.string().cuid2({ message: "Invalid creator ID" }),
  createdAt: z.string().datetime({ message: "Invalid ISO datetime string" }),
  updatedAt: z.string().datetime({ message: "Invalid ISO datetime string" }),
  postCount: z.number().int().min(0),
  lastActivityAt: z.string().datetime({ message: "Invalid ISO datetime string" }),
  icon: z.string().optional(), 
});

export const ForumPostSchema = z.object({
  id: z.string().cuid2({ message: "Invalid CUID" }),
  topicId: z.string().cuid2({ message: "Invalid topic ID" }),
  authorId: z.string().cuid2({ message: "Invalid author ID" }),
  content: z.string().min(1, "Post content cannot be empty.").max(5000),
  createdAt: z.string().datetime({ message: "Invalid ISO datetime string" }),
  updatedAt: z.string().datetime({ message: "Invalid ISO datetime string" }).optional(),
  likes: z.number().int().min(0).optional().default(0), // Made optional for creation
  parentId: z.string().cuid2().optional(),
  replies: z.array(z.lazy(() => ForumPostSchema)).optional(), // Self-referencing for nested replies
});

export const AgriEventSchema = z.object({
  id: z.string().cuid2({ message: "Invalid CUID" }),
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(2000),
  eventDate: z.string().datetime({ message: "Invalid ISO datetime string for event date" }),
  eventTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM).").optional().or(z.literal('')),
  location: z.string().min(3).max(150),
  eventType: z.enum(AGRI_EVENT_TYPES),
  organizer: z.string().max(100).optional(),
  organizerId: z.string().cuid2({ message: "Invalid organizer ID" }), // Added organizer ID
  websiteLink: z.string().url().optional().or(z.literal('')),
  imageUrl: z.string().url().optional().or(z.literal('')),
  listerId: z.string().cuid2({ message: "Invalid lister ID" }),
  createdAt: z.string().datetime({ message: "Invalid ISO datetime string" }),
  dataAiHint: z.string().optional(),
  // New fields for registration
  registrationEnabled: z.boolean().default(false),
  attendeeLimit: z.number().int().positive().optional(),
  registeredAttendeesCount: z.number().int().min(0).default(0),
});

export const FinancialProductSchema = z.object({
  id: z.string().cuid2(),
  providerId: z.string().cuid2(),
  productName: z.string().min(5).max(150),
  type: z.string().max(50),
  description: z.string().min(20).max(2000),
  terms: z.string().max(2000),
  eligibilityCriteria: z.string().max(1000),
  interestRate: z.string().max(50).optional(),
  loanTenor: z.string().max(50).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const InsuranceProductSchema = z.object({
  id: z.string().cuid2(),
  providerId: z.string().cuid2(),
  productName: z.string().min(5).max(150),
  type: z.string().max(50),
  description: z.string().min(20).max(2000),
  coverageDetails: z.string().max(2000),
  eligibilityCriteria: z.string().max(1000),
  premiumCalculation: z.string().max(100).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const ApplicationSchema = z.object({
  id: z.string().cuid2(),
  applicantId: z.string().cuid2(),
  productId: z.string().cuid2(),
  productType: z.enum(['financial', 'insurance']),
  providerId: z.string().cuid2(),
  applicationDate: z.string().datetime(),
  status: z.enum(['pending_review', 'approved', 'rejected', 'more_info_needed', 'under_processing']),
  requestedAmount: z.number().min(0).optional(),
  consentGivenForDataSharing: z.object({
    farmData: z.boolean(),
    marketplaceSalesHistory: z.boolean(),
    traceabilityReports: z.boolean(),
    carbonFootprintData: z.boolean(),
    consentedAt: z.string().datetime().optional(),
  }).optional(),
});

export const MasterDataProductSchema = z.object({
  productId: z.string(),
  name_en: z.string(),
  name_local: z.string(),
  category: z.string(),
  unit: z.string(),
  certifications: z.array(z.string()),
});

export const MasterDataInputSchema = z.object({
  inputId: z.string(),
  name_en: z.string(),
  name_local: z.string(),
  type: z.string(),
  composition: z.string(),
  certifications: z.array(z.string()),
});

export const VtiEntrySchema = z.object({
 vtiId: z.string(),
 type: z.string(),
  creationTime: z.string(), // Assuming ISO datetime string
  currentLocation: z.string(),
  status: z.string(),
  linked_vtis: z.array(z.string()),
  metadata: z.object({ carbon_footprint_kgCO2e: z.number().optional() }).optional(), // Optional metadata object with optional carbon footprint
});

export const TraceabilityEventSchemaV2 = z.object({ // Renamed to avoid conflict
 vtiId: z.string(),
  timestamp: z.string().datetime({ message: "Invalid ISO datetime string" }),
  eventType: z.string(),
  actorRef: z.string(), // Assuming this links to a user/organization ID
  geoLocation: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  payload: z.record(z.any()).optional(), // Allowing any key-value pairs
});
