
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { getRole } from './module2';

const db = admin.firestore();

/**
 * Creates a new Digital Shopfront for an authenticated user.
 * This is the entry point for stakeholders to establish a presence in the Marketplace (Module 4).
 */
export const createShop = functions.https.onCall(async (data, context) => {
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
      userId: userId,
      name: name,
      description: description,
      stakeholderType: stakeholderType,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      // Add other optional fields with defaults if needed
      logoUrl: null,
      bannerUrl: null,
      contactInfo: {},
    });

    // 2. Update the user's document with a reference to their new shop.
    // Using an array to support multiple shopfronts in the future if needed.
    batch.update(userRef, {
      shops: admin.firestore.FieldValue.arrayUnion(shopRef.id)
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
        { originalError: error.message }
    );
  }
});

/**
 * Creates a new marketplace listing.
 * This function is callable from the client.
 */
export const createMarketplaceListing = functions.https.onCall(async (data, context) => {
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
    const listingData = {
      ...data, // Include all validated data from the client
      sellerId: sellerId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection("marketplaceItems").add(listingData);

    return { id: docRef.id, name: listingData.name };
  } catch (error: any) {
    console.error("Error creating marketplace listing:", error);
    throw new functions.https.HttpsError("internal", "Failed to create marketplace listing.", { originalError: error.message });
  }
});


/**
 * Creates a new marketplace coupon for the authenticated seller.
 */
export const createMarketplaceCoupon = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "You must be logged in to create a coupon.");
  }

  const sellerId = context.auth.uid;
  const { code, discountType, discountValue, expiresAt, usageLimit, applicableToListingIds, applicableToCategories } = data;

  // Basic validation
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
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  try {
    const docRef = await db.collection("marketplace_coupons").add(newCoupon);
    return { couponId: docRef.id, code: newCoupon.code, message: "Coupon created successfully." };
  } catch (error: any) {
    console.error("Error creating marketplace coupon:", error);
    throw new functions.https.HttpsError("internal", "Could not create coupon.", { originalError: error.message });
  }
});


/**
 * Fetches all marketplace coupons for the authenticated seller.
 */
export const getSellerCoupons = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "You must be logged in to view your coupons.");
  }
  const sellerId = context.auth.uid;

  try {
    const snapshot = await db.collection("marketplace_coupons")
      .where("sellerId", "==", sellerId)
      .orderBy("createdAt", "desc")
      .get();
      
    const coupons = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { coupons };
  } catch (error) {
    console.error("Error fetching seller coupons:", error);
    throw new functions.https.HttpsError("internal", "Could not fetch coupons.");
  }
});

/**
 * Validates a marketplace coupon for a specific seller.
 */
export const validateMarketplaceCoupon = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "You must be logged in to validate a coupon.");
  }

  const { couponCode, sellerId } = data;
  if (!couponCode || !sellerId) {
    throw new functions.https.HttpsError("invalid-argument", "couponCode and sellerId are required.");
  }

  try {
    const couponQuery = db.collection("marketplace_coupons")
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

    if (couponData.usageLimit && couponData.usageCount >= couponData.usageLimit) {
        return { valid: false, message: "This coupon has reached its usage limit." };
    }

    return {
        valid: true,
        discountType: couponData.discountType,
        discountValue: couponData.discountValue,
        code: couponData.code
    };

  } catch (error) {
    console.error("Error validating coupon:", error);
    throw new functions.https.HttpsError("internal", "Could not validate coupon.");
  }
});
    
