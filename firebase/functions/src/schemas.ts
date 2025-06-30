
import { z } from 'zod';

export const StakeholderProfileSchema = z.object({
  uid: z.string(),
  email: z.string().email().optional().nullable(),
  displayName: z.string().optional().nullable(),
  photoURL: z.string().url().optional().nullable(),
  primaryRole: z.string(),
  secondaryRoles: z.array(z.string()).optional(),
  organization: z.object({
    id: z.string(),
    name: z.string(),
  }).optional().nullable(),
  location: z.object({
    country: z.string(),
    city: z.string().optional(),
  }).optional().nullable(),
  lastLogin: z.any(),
  createdAt: z.any(),
});

export const MarketplaceItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  listingType: z.string(),
  description: z.string(),
  category: z.string(),
  location: z.string(),
  sellerId: z.string(),
  createdAt: z.any(),
  updatedAt: z.any(),
});

export const MarketplaceOrderSchema = z.object({
  id: z.string(),
  buyerId: z.string(),
  sellerId: z.string(),
  listingId: z.string(),
  quantity: z.number(),
  totalPrice: z.number(),
  status: z.string(),
  createdAt: z.any(),
  updatedAt: z.any(),
});

export const ForumTopicSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  postCount: z.number(),
  createdBy: z.string(),
  createdAt: z.any(),
  lastActivity: z.any(),
});

export const ForumPostSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  authorRef: z.string(),
  timestamp: z.any(),
  replyCount: z.number(),
  likeCount: z.number(),
});

export const AgriEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  eventDate: z.string(),
  location: z.string(),
  eventType: z.string(),
  organizerId: z.string(),
  createdAt: z.any(),
  registeredAttendeesCount: z.number(),
});
