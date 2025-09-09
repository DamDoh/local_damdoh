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
exports.updateOrderStatus = exports.getSellerOrders = exports.createMarketplaceOrder = exports.getMarketplaceItemById = exports.getListingsBySeller = exports.getShopDetails = exports.validateMarketplaceCoupon = exports.getSellerCoupons = exports.createMarketplaceCoupon = exports.createMarketplaceListing = exports.createShop = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const schemas_1 = require("@/lib/schemas"); // Import from new location
const db = admin.firestore();
// Helper to check for authentication
const checkAuth = (context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
    }
    return context.auth.uid;
};
/**
 * Creates a new Digital Shopfront for an authenticated user.
 */
exports.createShop = functions.https.onCall(async (data, context) => {
    const userId = checkAuth(context);
    // Validate the incoming data against the Zod schema
    const validation = schemas_1.ShopSchema.safeParse(data);
    if (!validation.success) {
        throw new functions.https.HttpsError("invalid-argument", "Invalid shop data provided.", validation.error.format());
    }
    const { name, description, stakeholderType } = validation.data;
    try {
        const shopRef = db.collection("shops").doc();
        const userRef = db.collection("users").doc(userId);
        const batch = db.batch();
        batch.set(shopRef, {
            ownerId: userId,
            name: name,
            description: description,
            stakeholderType: stakeholderType,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            logoUrl: null,
            bannerUrl: null,
            contactInfo: {},
            itemCount: 0,
            rating: 0,
        });
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
        throw new functions.https.HttpsError("internal", "Failed to create Digital Shopfront.", { originalError: error.message });
    }
});
/**
 * Creates a new marketplace listing.
 */
exports.createMarketplaceListing = functions.https.onCall(async (data, context) => {
    const sellerId = checkAuth(context);
    // Validate incoming data using the partial schema
    const listingSchema = schemas_1.MarketplaceItemSchema.omit({ id: true, sellerId: true, createdAt: true, updatedAt: true });
    const validation = listingSchema.safeParse(data);
    if (!validation.success) {
        throw new functions.https.HttpsError("invalid-argument", "Invalid listing data.", validation.error.format());
    }
    const validatedData = validation.data;
    try {
        const listingData = Object.assign(Object.assign({}, validatedData), { sellerId: sellerId, createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp() });
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
 */
exports.createMarketplaceCoupon = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "You must be logged in to create a coupon.");
    }
    const sellerId = context.auth.uid;
    const { code, discountType, discountValue, expiresAt, usageLimit, applicableToListingIds, applicableToCategories, } = data;
    if (!code || !discountType || discountValue === undefined) {
        throw new functions.https.HttpsError("invalid-argument", "Missing required coupon fields.");
    }
    const newCoupon = {
        sellerId,
        code: code.toUpperCase(),
        discountType,
        discountValue,
        expiresAt: expiresAt ? admin.firestore.Timestamp.fromDate(new Date(expiresAt)) : null,
        usageLimit: usageLimit || null,
        usageCount: 0,
        isActive: true,
        applicableToListingIds: applicableToListingIds || [],
        applicableToCategories: applicableToCategories || [],
    };
    try {
        const docRef = await db.collection("marketplace_coupons").add(Object.assign(Object.assign({}, newCoupon), { createdAt: admin.firestore.FieldValue.serverTimestamp() }));
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
 */
exports.getSellerCoupons = functions.https.onCall(async (data, context) => {
    const sellerId = checkAuth(context);
    try {
        const snapshot = await db
            .collection("marketplace_coupons")
            .where("sellerId", "==", sellerId)
            .orderBy("createdAt", "desc")
            .get();
        const coupons = snapshot.docs.map((doc) => {
            var _a, _b, _c, _d;
            const couponData = doc.data();
            return Object.assign(Object.assign({ id: doc.id }, couponData), { createdAt: ((_b = (_a = couponData.createdAt) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a).toISOString()) || null, expiresAt: ((_d = (_c = couponData.expiresAt) === null || _c === void 0 ? void 0 : _c.toDate) === null || _d === void 0 ? void 0 : _d.call(_c).toISOString()) || null });
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
 */
exports.validateMarketplaceCoupon = functions.https.onCall(async (data, context) => {
    var _a;
    checkAuth(context);
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
        const expiresAt = (_a = couponData.expiresAt) === null || _a === void 0 ? void 0 : _a.toDate();
        if (expiresAt && expiresAt < new Date()) {
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
/**
 * Fetches the details of a specific shop.
 */
exports.getShopDetails = functions.https.onCall(async (data, context) => {
    var _a, _b, _c, _d;
    const { shopId } = data;
    if (!shopId) {
        throw new functions.https.HttpsError("invalid-argument", "A shopId must be provided.");
    }
    try {
        const shopDoc = await db.collection("shops").doc(shopId).get();
        if (!shopDoc.exists) {
            throw new functions.https.HttpsError("not-found", "Shop not found.");
        }
        const shopData = shopDoc.data();
        return Object.assign(Object.assign({ id: shopDoc.id }, shopData), { createdAt: ((_b = (_a = shopData.createdAt) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a).toISOString()) || null, updatedAt: ((_d = (_c = shopData.updatedAt) === null || _c === void 0 ? void 0 : _c.toDate) === null || _d === void 0 ? void 0 : _d.call(_c).toISOString()) || null });
    }
    catch (error) {
        console.error(`Error fetching shop details for ${shopId}:`, error);
        if (error instanceof functions.https.HttpsError)
            throw error;
        throw new functions.https.HttpsError("internal", "Could not fetch shop details.");
    }
});
/**
 * Fetches all marketplace listings for a specific seller.
 */
exports.getListingsBySeller = functions.https.onCall(async (data, context) => {
    const { sellerId } = data;
    if (!sellerId) {
        throw new functions.https.HttpsError("invalid-argument", "A sellerId must be provided.");
    }
    try {
        const listingsQuery = db.collection("marketplaceItems").where("sellerId", "==", sellerId);
        const snapshot = await listingsQuery.get();
        const items = snapshot.docs.map(doc => {
            var _a, _b, _c, _d;
            const data = doc.data();
            return Object.assign(Object.assign({ id: doc.id }, data), { createdAt: ((_b = (_a = data.createdAt) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a).toISOString()) || null, updatedAt: ((_d = (_c = data.updatedAt) === null || _c === void 0 ? void 0 : _c.toDate) === null || _d === void 0 ? void 0 : _d.call(_c).toISOString()) || null });
        });
        return { items };
    }
    catch (error) {
        console.error(`Error fetching listings for seller ${sellerId}:`, error);
        throw new functions.https.HttpsError("internal", "Could not fetch seller's listings.");
    }
});
/**
 * Fetches the details of a specific marketplace item.
 */
exports.getMarketplaceItemById = functions.https.onCall(async (data, context) => {
    var _a, _b, _c, _d;
    const { itemId } = data;
    if (!itemId) {
        throw new functions.https.HttpsError("invalid-argument", "An itemId must be provided.");
    }
    try {
        const itemDoc = await db.collection("marketplaceItems").doc(itemId).get();
        if (!itemDoc.exists) {
            throw new functions.https.HttpsError("not-found", "Marketplace item not found.");
        }
        const itemData = itemDoc.data();
        return Object.assign(Object.assign({ id: itemDoc.id }, itemData), { createdAt: ((_b = (_a = itemData.createdAt) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a).toISOString()) || null, updatedAt: ((_d = (_c = itemData.updatedAt) === null || _c === void 0 ? void 0 : _c.toDate) === null || _d === void 0 ? void 0 : _d.call(_c).toISOString()) || null });
    }
    catch (error) {
        console.error(`Error fetching marketplace item details for ${itemId}:`, error);
        if (error instanceof functions.https.HttpsError)
            throw error;
        throw new functions.https.HttpsError("internal", "Could not fetch item details.");
    }
});
/**
 * Creates a new marketplace order.
 */
exports.createMarketplaceOrder = functions.https.onCall(async (data, context) => {
    const buyerId = checkAuth(context);
    // Validate incoming data
    const validation = schemas_1.MarketplaceOrderSchema.omit({ id: true, buyerId: true, sellerId: true, createdAt: true, updatedAt: true, totalPrice: true, currency: true, orderId: true }).safeParse(data);
    if (!validation.success) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid order data.', validation.error.format());
    }
    const { itemId, quantity, buyerNotes } = validation.data;
    try {
        const itemRef = db.collection("marketplaceItems").doc(itemId);
        const itemDoc = await itemRef.get();
        if (!itemDoc.exists) {
            throw new functions.https.HttpsError("not-found", "The item you are trying to order does not exist.");
        }
        const itemData = itemDoc.data();
        const sellerId = itemData.sellerId;
        const totalPrice = (itemData.price || 0) * quantity;
        const orderRef = db.collection("marketplace_orders").doc();
        await orderRef.set({
            orderId: orderRef.id,
            itemId: itemId,
            listingName: itemData.name,
            buyerId: buyerId,
            sellerId: sellerId,
            quantity: quantity,
            totalPrice: totalPrice,
            currency: itemData.currency,
            buyerNotes: buyerNotes || "",
            status: "new",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        // The onWrite trigger in notifications.ts will handle sending a notification to the seller.
        return { success: true, orderId: orderRef.id };
    }
    catch (error) {
        console.error("Error creating marketplace order:", error);
        if (error instanceof functions.https.HttpsError)
            throw error;
        throw new functions.https.HttpsError("internal", "Failed to create order.", { originalError: error.message });
    }
});
exports.getSellerOrders = functions.https.onCall(async (data, context) => {
    const sellerId = checkAuth(context);
    try {
        const ordersSnapshot = await db.collection("marketplace_orders")
            .where("sellerId", "==", sellerId)
            .orderBy("createdAt", "desc")
            .get();
        const buyerIds = [...new Set(ordersSnapshot.docs.map(doc => doc.data().buyerId))];
        const buyerProfiles = {};
        if (buyerIds.length > 0) {
            const profileChunks = [];
            for (let i = 0; i < buyerIds.length; i += 30) {
                profileChunks.push(buyerIds.slice(i, i + 30));
            }
            for (const chunk of profileChunks) {
                const profilesSnapshot = await db.collection("users").where(admin.firestore.FieldPath.documentId(), 'in', chunk).get();
                profilesSnapshot.forEach(doc => {
                    buyerProfiles[doc.id] = {
                        displayName: doc.data().displayName,
                        avatarUrl: doc.data().avatarUrl || null,
                    };
                });
            }
        }
        const orders = ordersSnapshot.docs.map(doc => {
            var _a, _b, _c, _d;
            const orderData = doc.data();
            return Object.assign(Object.assign({ id: doc.id }, orderData), { buyerProfile: buyerProfiles[orderData.buyerId] || { displayName: 'Unknown Buyer', avatarUrl: null }, createdAt: (_b = (_a = orderData.createdAt) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a).toISOString(), updatedAt: (_d = (_c = orderData.updatedAt) === null || _c === void 0 ? void 0 : _c.toDate) === null || _d === void 0 ? void 0 : _d.call(_c).toISOString() });
        });
        return { orders };
    }
    catch (error) {
        console.error("Error fetching seller orders:", error);
        throw new functions.https.HttpsError("internal", "Could not fetch orders.");
    }
});
exports.updateOrderStatus = functions.https.onCall(async (data, context) => {
    var _a;
    const sellerId = checkAuth(context);
    const { orderId, newStatus } = data;
    if (!orderId || !newStatus) {
        throw new functions.https.HttpsError("invalid-argument", "Order ID and new status are required.");
    }
    const validStatuses = ["new", "confirmed", "shipped", "completed", "cancelled"];
    if (!validStatuses.includes(newStatus)) {
        throw new functions.https.HttpsError("invalid-argument", "Invalid status provided.");
    }
    const orderRef = db.collection("marketplace_orders").doc(orderId);
    try {
        const orderDoc = await orderRef.get();
        if (!orderDoc.exists) {
            throw new functions.https.HttpsError("not-found", "Order not found.");
        }
        if (((_a = orderDoc.data()) === null || _a === void 0 ? void 0 : _a.sellerId) !== sellerId) {
            throw new functions.https.HttpsError("permission-denied", "You are not authorized to update this order.");
        }
        await orderRef.update({
            status: newStatus,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return { success: true, message: `Order status updated to ${newStatus}.` };
    }
    catch (error) {
        if (error instanceof functions.https.HttpsError)
            throw error;
        console.error("Error updating order status:", error);
        throw new functions.https.HttpsError("internal", "Could not update the order status.");
    }
});
//# sourceMappingURL=marketplace.js.map