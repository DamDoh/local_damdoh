
import { z } from "zod";
import { STAKEHOLDER_ROLES, LISTING_TYPES, UNIFIED_MARKETPLACE_CATEGORY_IDS, AGRI_EVENT_TYPES } from "@/lib/constants";

export const ContactInfoSchema = z.object({
  phone: z.string().optional(),
  website: z.string().url({ message: "Invalid website URL" }).optional().or(z.literal('')),
  email: z.string().email({ message: "Invalid email address" }).optional(),
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
  connections: z.array(z.string().cuid2()).optional(), 
  createdAt: z.string().datetime({ message: "Invalid ISO datetime string" }),
  updatedAt: z.string().datetime({ message: "Invalid ISO datetime string" }),
});

export const AiPriceSuggestionSchema = z.object({
  min: z.number(),
  max: z.number(),
  confidence: z.enum(['Low', 'Medium', 'High']), 
});

export const MarketplaceItemSchema = z.object({
  id: z.string().cuid2({ message: "Invalid CUID" }),
  name: z.string().min(3, "Name must be at least 3 characters.").max(100, "Name cannot exceed 100 characters."),
  listingType: z.enum(LISTING_TYPES),
  description: z.string().min(10, "Description must be at least 10 characters long.").max(2000, "Description cannot exceed 2000 characters."), // Increased max length
  price: z.number().min(0).optional(), // Price is optional, esp. for services with 'Contact for Quote'
  currency: z.string().length(3, "Currency code must be 3 characters.").toUpperCase().default("USD"),
  perUnit: z.string().max(30, "Unit description is too long.").optional(),
  sellerId: z.string().cuid2({ message: "Invalid seller ID" }),
  category: z.enum(UNIFIED_MARKETPLACE_CATEGORY_IDS, { errorMap: () => ({ message: "Please select a valid category."}) }),
  location: z.string().min(2, "Location is too short.").max(150, "Location is too long."), // Increased max length
  imageUrl: z.string().url({ message: "Invalid image URL."}).optional().or(z.literal('')),
  createdAt: z.string().datetime({ message: "Invalid ISO datetime string" }),
  updatedAt: z.string().datetime({ message: "Invalid ISO datetime string" }),
  contactInfo: z.string().min(5, "Contact info is too short.").max(300, "Contact info is too long.").optional(), // Increased max length for diverse contact methods
  dataAiHint: z.string().max(50, "AI hint is too long.").optional(),
  isSustainable: z.boolean().optional().default(false),
  sellerVerification: z.enum(['Verified', 'Pending', 'Unverified']).optional().default('Pending'),
  aiPriceSuggestion: AiPriceSuggestionSchema.optional(),
  // Service-specific fields
  skillsRequired: z.array(z.string().max(50, "Skill entry is too long.")).optional().describe("For services: List key skills offered or required."),
  experienceLevel: z.string().max(100, "Experience level description is too long.").optional().describe("For services: e.g., Beginner, Intermediate, Expert, 5+ years"),
  compensation: z.string().max(150, "Compensation details are too long.").optional().describe("For services: e.g., $50/hr, Project-based, Negotiable, Specific loan terms"),
  // Additional fields for various listing types
  serviceAvailability: z.string().max(100, "Service availability is too long.").optional().describe("For services: e.g., Mon-Fri 9am-5pm, By Appointment"),
  brand: z.string().max(50, "Brand name is too long.").optional().describe("For products/equipment: Brand of the item"),
  condition: z.enum(['New', 'Used', 'Refurbished']).optional().describe("For products/equipment: Condition of the item"),
  certifications: z.array(z.string().max(100, "Certification name is too long.")).optional().describe("List of relevant certifications (e.g., Organic, Fair Trade, ISO)"),
  traceabilityLink: z.string().url({ message: "Invalid traceability link URL." }).optional().or(z.literal('')).describe("Direct link to an external traceability system if applicable"),
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
  icon: z.string().optional(), 
});

export const ForumPostSchema = z.object({
  id: z.string().cuid2({ message: "Invalid CUID" }),
  topicId: z.string().cuid2({ message: "Invalid topic ID" }),
  authorId: z.string().cuid2({ message: "Invalid author ID" }),
  content: z.string().min(1, "Post content cannot be empty.").max(5000),
  createdAt: z.string().datetime({ message: "Invalid ISO datetime string" }),
  updatedAt: z.string().datetime({ message: "Invalid ISO datetime string" }).optional(),
  likes: z.number().int().min(0),
  parentId: z.string().cuid2().optional(), 
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
  websiteLink: z.string().url().optional().or(z.literal('')),
  imageUrl: z.string().url().optional().or(z.literal('')),
  listerId: z.string().cuid2({ message: "Invalid lister ID" }),
  createdAt: z.string().datetime({ message: "Invalid ISO datetime string" }),
  dataAiHint: z.string().optional(),
});
