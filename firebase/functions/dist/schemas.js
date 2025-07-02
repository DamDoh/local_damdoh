"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgriEventSchema = exports.ForumPostSchema = exports.ForumTopicSchema = exports.MarketplaceOrderSchema = exports.MarketplaceItemSchema = exports.StakeholderProfileSchema = void 0;
const zod_1 = require("zod");
exports.StakeholderProfileSchema = zod_1.z.object({
    uid: zod_1.z.string(),
    email: zod_1.z.string().email().optional().nullable(),
    displayName: zod_1.z.string().optional().nullable(),
    photoURL: zod_1.z.string().url().optional().nullable(),
    primaryRole: zod_1.z.string(),
    secondaryRoles: zod_1.z.array(zod_1.z.string()).optional(),
    organization: zod_1.z.object({
        id: zod_1.z.string(),
        name: zod_1.z.string(),
    }).optional().nullable(),
    location: zod_1.z.object({
        country: zod_1.z.string(),
        city: zod_1.z.string().optional(),
    }).optional().nullable(),
    lastLogin: zod_1.z.any(),
    createdAt: zod_1.z.any(),
});
exports.MarketplaceItemSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    listingType: zod_1.z.string(),
    description: zod_1.z.string(),
    category: zod_1.z.string(),
    location: zod_1.z.string(),
    sellerId: zod_1.z.string(),
    createdAt: zod_1.z.any(),
    updatedAt: zod_1.z.any(),
});
exports.MarketplaceOrderSchema = zod_1.z.object({
    id: zod_1.z.string(),
    buyerId: zod_1.z.string(),
    sellerId: zod_1.z.string(),
    listingId: zod_1.z.string(),
    quantity: zod_1.z.number(),
    totalPrice: zod_1.z.number(),
    status: zod_1.z.string(),
    createdAt: zod_1.z.any(),
    updatedAt: zod_1.z.any(),
});
exports.ForumTopicSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    description: zod_1.z.string(),
    postCount: zod_1.z.number(),
    createdBy: zod_1.z.string(),
    createdAt: zod_1.z.any(),
    lastActivity: zod_1.z.any(),
});
exports.ForumPostSchema = zod_1.z.object({
    id: zod_1.z.string(),
    title: zod_1.z.string(),
    content: zod_1.z.string(),
    authorRef: zod_1.z.string(),
    timestamp: zod_1.z.any(),
    replyCount: zod_1.z.number(),
    likeCount: zod_1.z.number(),
});
exports.AgriEventSchema = zod_1.z.object({
    id: zod_1.z.string(),
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    eventDate: zod_1.z.string(),
    location: zod_1.z.string(),
    eventType: zod_1.z.string(),
    organizerId: zod_1.z.string(),
    createdAt: zod_1.z.any(),
    registeredAttendeesCount: zod_1.z.number(),
});
//# sourceMappingURL=schemas.js.map