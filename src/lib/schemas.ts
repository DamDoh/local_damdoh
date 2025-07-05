
import { z } from "zod";

// Note: For backend schemas, we use z.string() for enums instead of z.enum(...)
// to avoid a direct dependency on the constants file, simplifying cross-package logic.
// The stricter enum validation is handled on the frontend form schemas.

// =================================================================
// 1. CORE DATA SCHEMAS
// These schemas define the shape of data in Firestore.
// =================================================================

export const StakeholderProfileSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  email: z.string().email(),
  universalId: z.string().optional(),
  primaryRole: z.string(),
  secondaryRoles: z.array(z.string()).optional(),
  location: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  bannerUrl: z.string().url().optional(),
  profileSummary: z.string().optional(),
  bio: z.string().optional(),
  areasOfInterest: z.array(z.string()).optional(),
  needs: z.array(z.string()).optional(),
  contactInfo: z.object({
    phone: z.string().optional(),
    website: z.string().url().optional(),
  }).optional(),
  connections: z.array(z.string()).optional(), // Array of user IDs
  stakeholderProfile: z.any().optional(), // For role-specific data
  createdAt: z.any(), // Firestore Timestamp
  updatedAt: z.any(), // Firestore Timestamp
});

export const MarketplaceItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  listingType: z.string(), // 'Product' or 'Service'
  description: z.string(),
  sellerId: z.string(),
  price: z.number().optional(),
  currency: z.string().optional(),
  perUnit: z.string().optional(),
  category: z.string(), // Should map to a valid category ID
  location: z.string(),
  imageUrl: z.string().url().optional(),
  imageUrls: z.array(z.string().url()).optional(),
  isSustainable: z.boolean().optional(),
  sellerVerification: z.string().optional(),
  certifications: z.array(z.string()).optional(),
  relatedTraceabilityId: z.string().optional(),
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
  itemId: z.string(),
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


export const AgriEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  eventType: z.string(),
  eventDate: z.any(), // Firestore Timestamp
  location: z.string(),
  organizer: z.string().optional(),
  imageUrl: z.string().url().optional(),
  createdAt: z.any(), // Firestore Timestamp
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
