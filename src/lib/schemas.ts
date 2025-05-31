
import { z } from "zod";
import { STAKEHOLDER_ROLES, LISTING_TYPES, UNIFIED_MARKETPLACE_CATEGORY_IDS, AGRI_EVENT_TYPES } from "@/lib/constants";

export const ContactInfoSchema = z.object({
  phone: z.string().optional(),
  website: z.string().url({ message: "Invalid website URL" }).optional(),
  email: z.string().email({ message: "Invalid email address" }).optional(), // Added email here if it's part of contactInfo struct
});

export const StakeholderProfileSchema = z.object({
  id: z.string().cuid2({ message: "Invalid CUID" }),
  name: z.string().min(2, "Name must be at least 2 characters.").max(100),
  email: z.string().email(),
  avatarUrl: z.string().url().optional(),
  role: z.enum(STAKEHOLDER_ROLES),
  location: z.string().min(2).max(100),
  bio: z.string().max(2000).optional(),
  profileSummary: z.string().max(250).optional(),
  yearsOfExperience: z.number().int().min(0).optional(),
  areasOfInterest: z.array(z.string()).optional(),
  needs: z.array(z.string()).optional(),
  contactInfo: ContactInfoSchema.optional(),
  connections: z.array(z.string().cuid2()).optional(), // Array of user IDs
  createdAt: z.string().datetime({ message: "Invalid ISO datetime string" }),
  updatedAt: z.string().datetime({ message: "Invalid ISO datetime string" }),
});

export const AiPriceSuggestionSchema = z.object({
  min: z.number(),
  max: z.number(),
  confidence: z.string(), // Could be an enum: e.g., 'Low', 'Medium', 'High'
});

export const MarketplaceItemSchema = z.object({
  id: z.string().cuid2({ message: "Invalid CUID" }),
  name: z.string().min(3).max(100),
  listingType: z.enum(LISTING_TYPES),
  description: z.string().min(10).max(1000),
  price: z.number().min(0),
  currency: z.string().length(3).toUpperCase(),
  perUnit: z.string().max(30).optional(),
  sellerId: z.string().cuid2({ message: "Invalid seller ID" }),
  category: z.enum(UNIFIED_MARKETPLACE_CATEGORY_IDS),
  location: z.string().min(2).max(100),
  imageUrl: z.string().url().optional(),
  createdAt: z.string().datetime({ message: "Invalid ISO datetime string" }),
  updatedAt: z.string().datetime({ message: "Invalid ISO datetime string" }),
  contactInfo: z.string().min(5).max(200).optional(), // Or a structured object if preferred
  dataAiHint: z.string().optional(),
  isSustainable: z.boolean().optional(),
  sellerVerification: z.enum(['Verified', 'Pending', 'Unverified']).optional(),
  aiPriceSuggestion: AiPriceSuggestionSchema.optional(),
  skillsRequired: z.array(z.string()).optional(), // For services
  experienceLevel: z.string().optional(), // For services
  compensation: z.string().optional(), // For services
});

export const ForumTopicSchema = z.object({
  id: z.string().cuid2({ message: "Invalid CUID" }),
  title: z.string().min(10).max(150),
  description: z.string().min(20).max(2000),
  creatorId: z.string().cuid2({ message: "Invalid creator ID" }),
  createdAt: z.string().datetime({ message: "Invalid ISO datetime string" }),
  updatedAt: z.string().datetime({ message: "Invalid ISO datetime string" }),
  postCount: z.number().int().min(0),
  lastActivityAt: z.string().datetime({ message: "Invalid ISO datetime string" }),
  icon: z.string().optional(), // Assuming icon is a string identifier for Lucide icons
});

export const ForumPostSchema = z.object({
  id: z.string().cuid2({ message: "Invalid CUID" }),
  topicId: z.string().cuid2({ message: "Invalid topic ID" }),
  authorId: z.string().cuid2({ message: "Invalid author ID" }),
  content: z.string().min(1, "Post content cannot be empty.").max(5000),
  createdAt: z.string().datetime({ message: "Invalid ISO datetime string" }),
  updatedAt: z.string().datetime({ message: "Invalid ISO datetime string" }).optional(),
  likes: z.number().int().min(0),
  parentId: z.string().cuid2().optional(), // For replies
  // replies: z.array(z.lazy(() => ForumPostSchema)).optional(), // Recursive replies can be complex, handle separately if needed or keep flat
});


export const AgriEventSchema = z.object({
  id: z.string().cuid2({ message: "Invalid CUID" }),
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(2000),
  eventDate: z.string().datetime({ message: "Invalid ISO datetime string for event date" }), // Storing as ISO string
  eventTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM).").optional(),
  location: z.string().min(3).max(150),
  eventType: z.enum(AGRI_EVENT_TYPES),
  organizer: z.string().max(100).optional(),
  websiteLink: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
  listerId: z.string().cuid2({ message: "Invalid lister ID" }),
  createdAt: z.string().datetime({ message: "Invalid ISO datetime string" }),
  dataAiHint: z.string().optional(),
});

// Example of how to infer types (this will be done in types.ts)
// export type UserProfile = z.infer<typeof StakeholderProfileSchema>;
// export type MarketplaceItem = z.infer<typeof MarketplaceItemSchema>;
// etc.
