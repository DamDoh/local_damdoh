import { z } from "zod";

// =================================================================
// SINGLE SOURCE OF TRUTH FOR CORE DATA SCHEMAS
// These schemas define the shape of data in Firestore and are used for
// validation on both the frontend (forms) and backend (Cloud Functions).
// =================================================================

export const StakeholderProfileSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  email: z.string().email(),
  primaryRole: z.string(),
  secondaryRoles: z.array(z.string()).optional(),
  location: z.string().optional(),
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
});
export type UserProfile = z.infer<typeof StakeholderProfileSchema>;


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
  location: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  imageUrls: z.array(z.string().url()).optional(),
  dataAiHint: z.string().optional().nullable(),
  isSustainable: z.boolean().optional(),
  sellerVerification: z.string().optional(),
  certifications: z.array(z.string()).optional(),
  relatedTraceabilityId: z.string().optional(),
  createdAt: z.any(), // Firestore Timestamp
  updatedAt: z.any(), // Firestore Timestamp
  // Service-specific fields
  skillsRequired: z.union([z.string(), z.array(z.string())]).optional(), // Handle both string and array
  compensation: z.string().optional(),
  experienceLevel: z.string().optional(),
  brand: z.string().optional(),
  condition: z.string().optional(),
  availabilityStatus: z.string().optional(),
  contactInfo: z.string().optional(),
});
export type MarketplaceItem = z.infer<typeof MarketplaceItemSchema>;


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
export type MarketplaceOrder = z.infer<typeof MarketplaceOrderSchema>;


export const ShopSchema = z.object({
  name: z.string(),
  description: z.string(),
  stakeholderType: z.string(),
});
export type Shop = z.infer<typeof ShopSchema>;

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
export type AgriEvent = z.infer<typeof AgriEventSchema>;

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
export type ForumTopic = z.infer<typeof ForumPostSchema>;


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
export type SmartSearchInterpretation = z.infer<typeof SmartSearchInterpretationSchema>;


export const MarketplaceRecommendationInputSchema = z.object({
  userId: z.string().optional().describe("The ID of the user to generate recommendations for."),
  count: z.number().optional().default(5).describe('The number of suggestions to generate.'),
});

const RecommendedItemSchema = z.object({
    item: MarketplaceItemSchema, // Using the existing schema
    reason: z.string().describe("A brief, user-friendly explanation (max 1-2 sentences) of why this item is recommended for this specific user.")
});

export const MarketplaceRecommendationOutputSchema = z.object({
  recommendations: z.array(RecommendedItemSchema).describe("A list of suggested marketplace items (products or services) with accompanying reasons."),
});
export type MarketplaceRecommendation = any;
