
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

// Helper to check for authentication
const checkAuth = (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
  }
  return context.auth.uid;
};

// Callable function to add a new asset
export const addAsset = functions.https.onCall(async (data, context) => {
  const ownerId = checkAuth(context);
  const { name, type, purchaseDate, value, currency, notes } = data;

  if (!name || !type || !purchaseDate || value === undefined || !currency) {
    throw new functions.https.HttpsError("invalid-argument", "Missing required asset fields.");
  }

  const newAssetRef = db.collection(`users/${ownerId}/assets`).doc();
  await newAssetRef.set({
    name,
    type,
    purchaseDate: admin.firestore.Timestamp.fromDate(new Date(purchaseDate)),
    value: Number(value),
    currency,
    notes: notes || "",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true, assetId: newAssetRef.id };
});

// Callable function to get all assets for a user
export const getUserAssets = functions.https.onCall(async (data, context) => {
  const ownerId = checkAuth(context);
  const assetsSnapshot = await db.collection(`users/${ownerId}/assets`).orderBy('purchaseDate', 'desc').get();
  
  const assets = assetsSnapshot.docs.map(doc => {
    const assetData = doc.data();
    return {
      id: doc.id,
      ...assetData,
      purchaseDate: assetData.purchaseDate.toDate().toISOString(),
      createdAt: assetData.createdAt.toDate().toISOString(),
      updatedAt: assetData.updatedAt.toDate().toISOString(),
    }
  });

  return { assets };
});

// Note: Additional functions for updating and deleting assets would be added here in a full implementation.

