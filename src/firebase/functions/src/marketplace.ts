
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import type { MarketplaceCoupon, MarketplaceItem, Shop, MarketplaceOrder } from "@/lib/types"; // Import from new location
import { _internalInitiatePayment } from "./financial-services";
import { MarketplaceItemSchema, ShopSchema, MarketplaceOrderSchema } from "@/lib/schemas"; // Import from new location
import { geohashForLocation } from 'geofire-common';

const db = admin.firestore();

// Helper to check for authentication
const checkAuth = (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated.",
    );
  }
  return context.auth.uid;
};

/**
 * Creates a new Digital Shopfront for an authenticated user.
 */
export const createShop = functions.https.onCall(async (data, context) => {
  const userId = checkAuth(context);

  // Validate the incoming data against the Zod schema
  const validation = ShopSchema.safeParse(data);
  if (!validation.success) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Invalid shop data provided.",
      validation.error.format(),
    );
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
  } catch (error: any) {
    console.error("Error creating shop:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to create Digital Shopfront.",
      { originalError: error.message },
    );
  }
});

/**
 * Creates a new marketplace listing.
 */
export const createMarketplaceListing = functions.https.onCall(
  async (data, context) => {
    const sellerId = checkAuth(context);

    // Validate incoming data using the partial schema, omitting client-side-only fields
    const listingSchema = MarketplaceItemSchema.omit({ 
      id: true, 
      sellerId: true, 
      createdAt: true, 
      updatedAt: true,
      dataAiHint: true, // This is a client-side hint, not stored in DB
    });
    const validation = listingSchema.safeParse(data);

    if (!validation.success) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Invalid listing data.",
        validation.error.format()
      );
    }
    
    const validatedData = validation.data;

    try {
      const listingData: any = {
        ...validatedData,
        sellerId: sellerId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      
      // Handle Geohash generation for location
      if (validatedData.location && typeof validatedData.location.lat === 'number' && typeof validatedData.location.lng === 'number') {
        listingData.geohash = geohashForLocation([validatedData.location.lat, validatedData.location.lng]);
      } else {
        listingData.geohash = null;
      }

      const docRef = await db.collection("marketplaceItems").add(listingData);

      return {id: docRef.id, name: listingData.name};
    } catch (error: any) {
      console.error("Error creating marketplace listing:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to create marketplace listing.",
        { originalError: error.message },
      );
    }
  },
);

/**
 * Creates a new marketplace coupon for the authenticated seller.
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
        { originalError: error.message },
      );
    }
  },
);

/**
 * Fetches all marketplace coupons for the authenticated seller.
 */
export const getSellerCoupons = functions.https.onCall(async (data, context) => {
  const sellerId = checkAuth(context);

  try {
    const snapshot = await db
      .collection("marketplace_coupons")
      .where("sellerId", "==", sellerId)
      .orderBy("createdAt", "desc")
      .get();

    const coupons = snapshot.docs.map((doc) => {
        const couponData = doc.data() as Omit<MarketplaceCoupon, 'id'>;
        return {
            id: doc.id,
            ...couponData,
            createdAt: (couponData.createdAt as admin.firestore.Timestamp)?.toDate?.().toISOString() || null,
            expiresAt: (couponData.expiresAt as admin.firestore.Timestamp)?.toDate?.().toISOString() || null,
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
 */
export const validateMarketplaceCoupon = functions.https.onCall(
  async (data, context) => {
    checkAuth(context);

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

      const expiresAt = (couponData.expiresAt as admin.firestore.Timestamp)?.toDate();
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
    } as Shop;
  } catch (error) {
    console.error(`Error fetching shop details for ${shopId}:`, error);
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError("internal", "Could not fetch shop details.");
  }
});


/**
 * Fetches all marketplace listings for a specific seller.
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
      const data = doc.data() as Omit<MarketplaceItem, 'id'>;
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

/**
 * Fetches the details of a specific marketplace item.
 */
export const getMarketplaceItemById = functions.https.onCall(async (data, context) => {
  const { itemId } = data;
  if (!itemId) {
    throw new functions.https.HttpsError("invalid-argument", "An itemId must be provided.");
  }
  
  try {
    const itemDoc = await db.collection("marketplaceItems").doc(itemId).get();
    if (!itemDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Marketplace item not found.");
    }

    const itemData = itemDoc.data()!;
    return {
      id: itemDoc.id,
      ...itemData,
      createdAt: (itemData.createdAt as admin.firestore.Timestamp)?.toDate?.().toISOString() || null,
      updatedAt: (itemData.updatedAt as admin.firestore.Timestamp)?.toDate?.().toISOString() || null,
    } as MarketplaceItem;
  } catch (error) {
    console.error(`Error fetching marketplace item details for ${itemId}:`, error);
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError("internal", "Could not fetch item details.");
  }
});


/**
 * Creates a new marketplace order.
 */
export const createMarketplaceOrder = functions.https.onCall(async (data, context) => {
    const buyerId = checkAuth(context);

    // Validate incoming data
    const validation = MarketplaceOrderSchema.omit({id: true, buyerId: true, sellerId: true, createdAt: true, updatedAt: true, totalPrice: true, currency: true, orderId: true}).safeParse(data);
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

        const itemData = itemDoc.data() as MarketplaceItem;
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
    } catch (error: any) {
        console.error("Error creating marketplace order:", error);
        if (error instanceof functions.https.HttpsError) throw error;
        throw new functions.https.HttpsError("internal", "Failed to create order.", { originalError: error.message });
    }
});

export const getSellerOrders = functions.https.onCall(async (data, context) => {
    const sellerId = checkAuth(context);
    
    try {
        const ordersSnapshot = await db.collection("marketplace_orders")
            .where("sellerId", "==", sellerId)
            .orderBy("createdAt", "desc")
            .get();
        
        const buyerIds = [...new Set(ordersSnapshot.docs.map(doc => doc.data().buyerId))];
        const buyerProfiles: Record<string, any> = {};

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
            const orderData = doc.data();
            return {
                id: doc.id,
                ...orderData,
                buyerProfile: buyerProfiles[orderData.buyerId] || { displayName: 'Unknown Buyer', avatarUrl: null },
                createdAt: (orderData.createdAt as admin.firestore.Timestamp)?.toDate?.().toISOString(),
                updatedAt: (orderData.updatedAt as admin.firestore.Timestamp)?.toDate?.().toISOString(),
            };
        });

        return { orders };
    } catch (error) {
        console.error("Error fetching seller orders:", error);
        throw new functions.https.HttpsError("internal", "Could not fetch orders.");
    }
});

export const updateOrderStatus = functions.https.onCall(async (data, context) => {
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

        if (orderDoc.data()?.sellerId !== sellerId) {
            throw new functions.https.HttpsError("permission-denied", "You are not authorized to update this order.");
        }
        
        await orderRef.update({
            status: newStatus,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        
        return { success: true, message: `Order status updated to ${newStatus}.` };

    } catch (error: any) {
         if (error instanceof functions.https.HttpsError) throw error;
         console.error("Error updating order status:", error);
         throw new functions.https.HttpsError("internal", "Could not update the order status.");
    }
});
