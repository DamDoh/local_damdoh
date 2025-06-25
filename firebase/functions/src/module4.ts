
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

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

  } catch (error) {
    console.error("Error creating shop:", error);
    throw new functions.https.HttpsError("internal", "Failed to create Digital Shopfront.");
  }
});
