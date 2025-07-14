

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
    lat: z.number(),
    lng: z.number(),
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
  // Added for shopfront feature
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
    lat: z.number(),
    lng: z.number(),
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
  skillsRequired: z.array(z.string()).optional(),
  compensation: z.string().optional(),
  experienceLevel: z.string().optional(),
  brand: z.string().optional(),
  condition: z.string().optional(),
  availabilityStatus: z.string().optional(),
  contactInfo: z.string().optional(),
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
  name: z.string(),
  description: z.string(),
  stakeholderType: z.string(),
});

export const AgriEventSchema = z.object({
  title: z.string(),
  description: z.string(),
  eventDate: z.string(),
  eventTime: z.string().optional(),
  location: z.string(),
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
  keyPrefix: z.string(),
  lastFour: z.string(),
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


// =================================================================
// 2. AI FLOW SCHEMAS
// These schemas are used for input and output validation in Genkit flows.
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
