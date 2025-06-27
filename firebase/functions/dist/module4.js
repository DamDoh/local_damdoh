"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateMarketplaceCoupon = exports.getSellerCoupons = exports.createMarketplaceCoupon = exports.createMarketplaceListing = exports.createShop = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
/**
 * Creates a new Digital Shopfront for an authenticated user.
 * This is the entry point for stakeholders to establish a presence in the Marketplace (Module 4).
 * @param {any} data The data for the new shop.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{success: boolean, shopId: string, message: string}>} A promise that resolves with the new shop ID.
 */
exports.createShop = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated to create a shop.");
    }
    const { name, description, stakeholderType } = data;
    if (!name || !description || !stakeholderType) {
        throw new functions.https.HttpsError("invalid-argument", "Shop name, description, and stakeholder type are required.");
    }
    const userId = context.auth.uid;
    try {
        const shopRef = db.collection("shops").doc();
        const userRef = db.collection("users").doc(userId);
        // Use a batched write to ensure both operations succeed or fail together.
        const batch = db.batch();
        // 1. Create the new shop document.
        batch.set(shopRef, {
            ownerId: userId,
            name: name,
            description: description,
            stakeholderType: stakeholderType,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            // Add other optional fields with defaults if needed
            logoUrl: null,
            bannerUrl: null,
            contactInfo: {},
            itemCount: 0,
            rating: 0,
        });
        // 2. Update the user's document with a reference to their new shop.
        // Using an array to support multiple shopfronts in the future if needed.
        batch.update(userRef, {
            shops: admin.firestore.FieldValue.arrayUnion(shopRef.id),
        });
        await batch.commit();
        return {
            success: true,
            shopId: shopRef.id,
            message: "Digital Shopfront created successfully.",
        };
    }
    catch (error) {
        console.error("Error creating shop:", error);
        throw new functions.https.HttpsError("internal", "Failed to create Digital Shopfront. Please check your project's Firestore setup.", { originalError: error.message });
    }
});
/**
 * Creates a new marketplace listing.
 * This function is callable from the client.
 * @param {any} data The data for the new listing.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{id: string, name: string}>} A promise that resolves with the new listing ID and name.
 */
exports.createMarketplaceListing = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "You must be logged in to create a listing.");
    }
    const sellerId = context.auth.uid;
    const { name, listingType, description, category, location } = data;
    // Basic validation
    if (!name || !listingType || !description || !category || !location) {
        throw new functions.https.HttpsError("invalid-argument", "Missing required fields for the listing.");
    }
    try {
        const listingData = Object.assign(Object.assign({}, data), { sellerId: sellerId, createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp() });
        const docRef = await db.collection("marketplaceItems").add(listingData);
        return { id: docRef.id, name: listingData.name };
    }
    catch (error) {
        console.error("Error creating marketplace listing:", error);
        throw new functions.https.HttpsError("internal", "Failed to create marketplace listing.", { originalError: error.message });
    }
});
/**
 * Creates a new marketplace coupon for the authenticated seller.
 * @param {any} data The data for the new coupon.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{couponId: string, code: string, message: string}>} A promise that resolves with the new coupon ID.
 */
exports.createMarketplaceCoupon = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "You must be logged in to create a coupon.");
    }
    const sellerId = context.auth.uid;
    const { code, discountType, discountValue, expiresAt, usageLimit, applicableToListingIds, applicableToCategories, } = data;
    // Basic validation
    if (!code || !discountType || discountValue === undefined) {
        throw new functions.https.HttpsError("invalid-argument", "Missing required coupon fields.");
    }
    const newCoupon = {
        sellerId,
        code: code.toUpperCase(),
        discountType,
        discountValue,
        expiresAt: expiresAt ?
            admin.firestore.Timestamp.fromDate(new Date(expiresAt)) :
            null,
        usageLimit: usageLimit || null,
        usageCount: 0,
        isActive: true,
        applicableToListingIds: applicableToListingIds || [],
        applicableToCategories: applicableToCategories || [],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    try {
        const docRef = await db.collection("marketplace_coupons").add(newCoupon);
        return {
            couponId: docRef.id,
            code: newCoupon.code,
            message: "Coupon created successfully.",
        };
    }
    catch (error) {
        console.error("Error creating marketplace coupon:", error);
        throw new functions.https.HttpsError("internal", "Could not create coupon.", { originalError: error.message });
    }
});
/**
 * Fetches all marketplace coupons for the authenticated seller.
 * @param {any} data The data for the function call.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{coupons: any[]}>} A promise that resolves with the seller's coupons.
 */
exports.getSellerCoupons = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "You must be logged in to view your coupons.");
    }
    const sellerId = context.auth.uid;
    try {
        const snapshot = await db
            .collection("marketplace_coupons")
            .where("sellerId", "==", sellerId)
            .orderBy("createdAt", "desc")
            .get();
        const coupons = snapshot.docs.map((doc) => {
            var _a, _b;
            const couponData = doc.data();
            return Object.assign(Object.assign({ id: doc.id }, couponData), { createdAt: ((_a = couponData.createdAt) === null || _a === void 0 ? void 0 : _a.toDate) ? couponData.createdAt.toDate().toISOString() : null, expiresAt: ((_b = couponData.expiresAt) === null || _b === void 0 ? void 0 : _b.toDate) ? couponData.expiresAt.toDate().toISOString() : null });
        });
        return { coupons };
    }
    catch (error) {
        console.error("Error fetching seller coupons:", error);
        throw new functions.https.HttpsError("internal", "Could not fetch coupons.");
    }
});
/**
 * Validates a marketplace coupon for a specific seller.
 * @param {any} data The data for the function call.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{valid: boolean, message?: string, discountType?: string, discountValue?: number, code?: string}>} A promise that resolves with the validation result.
 */
exports.validateMarketplaceCoupon = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "You must be logged in to validate a coupon.");
    }
    const { couponCode, sellerId } = data;
    if (!couponCode || !sellerId) {
        throw new functions.https.HttpsError("invalid-argument", "couponCode and sellerId are required.");
    }
    try {
        const couponQuery = db
            .collection("marketplace_coupons")
            .where("code", "==", couponCode.toUpperCase())
            .where("sellerId", "==", sellerId)
            .limit(1);
        const snapshot = await couponQuery.get();
        if (snapshot.empty) {
            return { valid: false, message: "Invalid or expired coupon code." };
        }
        const couponDoc = snapshot.docs[0];
        const couponData = couponDoc.data();
        if (!couponData.isActive) {
            return { valid: false, message: "This coupon is no longer active." };
        }
        if (couponData.expiresAt && couponData.expiresAt.toDate() < new Date()) {
            await couponDoc.ref.update({ isActive: false }); // Deactivate expired coupon
            return { valid: false, message: "This coupon has expired." };
        }
        if (couponData.usageLimit &&
            couponData.usageCount >= couponData.usageLimit) {
            return { valid: false, message: "This coupon has reached its usage limit." };
        }
        return {
            valid: true,
            discountType: couponData.discountType,
            discountValue: couponData.discountValue,
            code: couponData.code,
        };
    }
    catch (error) {
        console.error("Error validating coupon:", error);
        throw new functions.https.HttpsError("internal", "Could not validate coupon.");
    }
});
//# sourceMappingURL=module4.js.map