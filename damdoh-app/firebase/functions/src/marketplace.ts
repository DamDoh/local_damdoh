
/**
 * =================================================================
 * Module 4: Marketplace & E-commerce (The Global Commercial Engine)
 * =================================================================
 * This module is the dynamic commercial heart of DamDoh, designed to connect
 * agricultural buyers and sellers globally, facilitate transparent transactions,
 * and support economic growth for all stakeholders. It goes beyond simple
 * product listings to include a "Talent Exchange" and a robust promotional system.
 *
 * @purpose To provide a comprehensive, multi-currency, multi-language marketplace
 * for agricultural products, services, and labor, enabling efficient trade,
 * price discovery, and secure transactions across diverse geographical and
 * economic contexts.
 *
 * @key_concepts
 * - Multi-Category Product Listings: Raw produce, processed goods, inputs, and services.
 * - Talent Exchange: A dedicated space for agricultural jobs and expertise.
 * - Order Management System: Handling quotations, negotiations, and order tracking.
 * - Payment Integration & Escrow: Secure transactions via Module 7.
 * - Promotional System: Tools for sellers to create discounts and coupons.
 * - Rating & Review System: Building trust and reputation within the community.
 *
 * @synergy
 * - Integrates with Module 1 (Traceability) by linking listings to VTIs.
 * - Relies on Module 2 (Profiles) for seller/buyer information and reputation.
 * - Utilizes Module 7 (Financials) for payment processing and escrow.
 * - Feeds data to Module 6 (AI & Analytics) for market insights and price prediction.
 * - Triggers Module 13 (Notifications) for order updates and new messages.
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import type { MarketplaceCoupon, MarketplaceItem, Shop, MarketplaceOrder } from "./types";
import { _internalInitiatePayment } from "./financials";
import { getProfileByIdFromDB } from "./profiles";

const db = admin.firestore();

/**
 * Creates a new Digital Shopfront for an authenticated user.
 * This is the entry point for stakeholders to establish a presence in the Marketplace.
 * @param {any} data The data for the new shop.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{success: boolean, shopId: string, message: string}>} A promise that resolves with the new shop ID.
 */
export const createShop = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated to create a shop.",
    );
  }

  const {name, description, stakeholderType} = data;
  if (!name || !description || !stakeholderType) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Shop name, description, and stakeholder type are required.",
    );
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
  } catch (error: any) {
    console.error("Error creating shop:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to create Digital Shopfront. Please check your project's Firestore setup.",
      {originalError: error.message},
    );
  }
});

/**
 * Creates a new marketplace listing.
 * This function is callable from the client.
 * @param {any} data The data for the new listing.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{id: string, name: string}>} A promise that resolves with the new listing ID and name.
 */
export const createMarketplaceListing = functions.https.onCall(
  async (data: Omit<MarketplaceItem, "id" | "sellerId" | "createdAt" | "updatedAt">, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "You must be logged in to create a listing.",
      );
    }

    const sellerId = context.auth.uid;
    const {name, listingType, description, category, location} = data;

    // Basic validation
    if (!name || !listingType || !description || !category || !location) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required fields for the listing.",
      );
    }

    try {
      const listingData = {
        ...data, // Include all validated data from the client
        sellerId: sellerId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const docRef = await db.collection("marketplaceItems").add(listingData);

      return {id: docRef.id, name: listingData.name};
    } catch (error: any) {
      console.error("Error creating marketplace listing:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to create marketplace listing.",
        {originalError: error.message},
      );
    }
  },
);

/**
 * Creates a new marketplace coupon for the authenticated seller.
 * @param {any} data The data for the new coupon.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{couponId: string, code: string, message: string}>} A promise that resolves with the new coupon ID.
 */
export const createMarketplaceCoupon = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "You must be logged in to create a coupon.",
      );
    }

    const sellerId = context.auth.uid;
    const {
      code,
      discountType,
      discountValue,
      expiresAt,
      usageLimit,
      applicableToListingIds,
      applicableToCategories,
    } = data;

    // Basic validation
    if (!code || !discountType || discountValue === undefined) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required coupon fields.",
      );
    }

    const newCoupon: Omit<MarketplaceCoupon, "id" | "createdAt"> = {
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
      const docRef = await db.collection("marketplace_coupons").add({
          ...newCoupon,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return {
        couponId: docRef.id,
        code: newCoupon.code,
        message: "Coupon created successfully.",
      };
    } catch (error: any) {
      console.error("Error creating marketplace coupon:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Could not create coupon.",
        {originalError: error.message},
      );
    }
  },
);

/**
 * Fetches all marketplace coupons for the authenticated seller.
 * @param {any} data The data for the function call.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{coupons: any[]}>} A promise that resolves with the seller's coupons.
 */
export const getSellerCoupons = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be logged in to view your coupons.",
    );
  }
  const sellerId = context.auth.uid;

  try {
    const snapshot = await db
      .collection("marketplace_coupons")
      .where("sellerId", "==", sellerId)
      .orderBy("createdAt", "desc")
      .get();

    const coupons = snapshot.docs.map((doc) => {
        const couponData = doc.data() as MarketplaceCoupon;
        return {
            id: doc.id,
            ...couponData,
            createdAt: (couponData.createdAt as any)?.toDate?.().toISOString() || null,
            expiresAt: (couponData.expiresAt as any)?.toDate?.().toISOString() || null,
        };
    });
    return {coupons};
  } catch (error) {
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
export const validateMarketplaceCoupon = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "You must be logged in to validate a coupon.",
      );
    }

    const {couponCode, sellerId} = data;
    if (!couponCode || !sellerId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "couponCode and sellerId are required.",
      );
    }

    try {
      const couponQuery = db
        .collection("marketplace_coupons")
        .where("code", "==", couponCode.toUpperCase())
        .where("sellerId", "==", sellerId)
        .limit(1);

      const snapshot = await couponQuery.get();

      if (snapshot.empty) {
        return {valid: false, message: "Invalid or expired coupon code."};
      }

      const couponDoc = snapshot.docs[0];
      const couponData = couponDoc.data() as MarketplaceCoupon;

      if (!couponData.isActive) {
        return {valid: false, message: "This coupon is no longer active."};
      }

      const expiresAt = (couponData.expiresAt as any)?.toDate ? (couponData.expiresAt as any).toDate() : null;
      if (expiresAt && expiresAt < new Date()) {
        await couponDoc.ref.update({isActive: false}); // Deactivate expired coupon
        return {valid: false, message: "This coupon has expired."};
      }

      if (
        couponData.usageLimit &&
        couponData.usageCount >= couponData.usageLimit
      ) {
        return {valid: false, message: "This coupon has reached its usage limit."};
      }

      return {
        valid: true,
        discountType: couponData.discountType,
        discountValue: couponData.discountValue,
        code: couponData.code,
      };
    } catch (error) {
      console.error("Error validating coupon:", error);
      throw new functions.https.HttpsError("internal", "Could not validate coupon.");
    }
  },
);


/**
 * Fetches the details of a specific shop.
 * @param {any} data The data containing the shopId.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<Shop>} A promise that resolves with the shop's details.
 */
export const getShopDetails = functions.https.onCall(async (data, context) => {
  const { shopId } = data;
  if (!shopId) {
    throw new functions.https.HttpsError("invalid-argument", "A shopId must be provided.");
  }
  
  try {
    const shopDoc = await db.collection("shops").doc(shopId).get();
    if (!shopDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Shop not found.");
    }

    const shopData = shopDoc.data()!;
    return {
      id: shopDoc.id,
      ...shopData,
      createdAt: (shopData.createdAt as admin.firestore.Timestamp)?.toDate?.().toISOString() || null,
      updatedAt: (shopData.updatedAt as admin.firestore.Timestamp)?.toDate?.().toISOString() || null,
    };
  } catch (error: any) {
    console.error(`Error fetching shop details for ${shopId}:`, error);
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError("internal", "Could not fetch shop details.");
  }
});


/**
 * Fetches all marketplace listings for a specific seller.
 * @param {any} data The data containing the sellerId.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{items: MarketplaceItem[]}>} A promise that resolves with the seller's listings.
 */
export const getListingsBySeller = functions.https.onCall(async (data, context) => {
  const { sellerId } = data;
  if (!sellerId) {
    throw new functions.https.HttpsError("invalid-argument", "A sellerId must be provided.");
  }

  try {
    const listingsQuery = db.collection("marketplaceItems").where("sellerId", "==", sellerId);
    const snapshot = await listingsQuery.get();
    
    const items = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: (data.createdAt as admin.firestore.Timestamp)?.toDate?.().toISOString() || null,
        updatedAt: (data.updatedAt as admin.firestore.Timestamp)?.toDate?.().toISOString() || null,
      };
    });

    return { items };
  } catch (error) {
    console.error(`Error fetching listings for seller ${sellerId}:`, error);
    throw new functions.https.HttpsError("internal", "Could not fetch seller's listings.");
  }
});

// =================================================================
// CONCEPTUAL FUTURE FUNCTIONS FOR MODULE 4
// =================================================================

/**
 * [Conceptual] Triggered when a new order is created in the `orders` collection.
 * This function would handle post-order logic like updating inventory and notifying parties.
 */
export const processOrderCreation = functions.firestore
    .document("orders/{orderId}")
    .onCreate(async (snapshot, context) => {
        const orderData = snapshot.data();
        console.log(`[Conceptual] Processing new order: ${context.params.orderId}`, orderData);
        // 1. Decrement stock from the corresponding `marketplaceItems` document if applicable.
        // 2. Trigger notifications (via Module 13) to the seller and buyer.
        // 3. Log a "SALE" event in the traceability log (Module 1) if a VTI is linked.
        // 4. Update seller/buyer analytics data in Module 6.
        return null;
    });

/**
 * [Conceptual] Updates the status of a marketplace listing.
 * Could be triggered by an order completion or manual action.
 */
export const updateListingStatus = functions.https.onCall(async (data, context) => {
    // Placeholder for logic to update a listing's status (e.g., 'active' to 'sold_out').
    console.log("[Conceptual] Updating listing status with data:", data);
    return { success: true, message: `[Conceptual] Listing ${data.listingId} status updated to ${data.newStatus}.` };
});

/**
 * [Conceptual] A scheduled function to generate market reports.
 * This would be triggered periodically (e.g., daily) to aggregate data for Module 6.
 */
export const generateMarketReport = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
    console.log('[Conceptual] Generating daily market report...');
    // 1. Aggregate recent transaction data from the `orders` collection.
    // 2. Calculate average prices, volume trends, etc.
    // 3. Store the aggregated report in a 'market_reports' collection for the AI & Analytics Engine to consume.
    console.log('[Conceptual] Daily market report generation complete.');
    return null;
});
