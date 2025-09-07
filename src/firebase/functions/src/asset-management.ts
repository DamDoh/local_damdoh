
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { createAssetSchema } from "@/lib/schemas"; // Assuming schemas are shared

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
  
  const validation = createAssetSchema.safeParse(data);
  if(!validation.success) {
      throw new functions.https.HttpsError("invalid-argument", "Invalid asset data.", validation.error.format());
  }

  const { name, type, purchaseDate, value, currency, notes } = validation.data;

  const newAssetRef = db.collection(`users/${ownerId}/assets`).doc();
  await newAssetRef.set({
    name,
    type,
    purchaseDate: admin.firestore.Timestamp.fromDate(new Date(purchaseDate)),
    value: Number(value),
    currency: currency || 'USD',
    notes: notes || "",
    ownerId,
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
      purchaseDate: assetData.purchaseDate?.toDate().toISOString(),
      createdAt: assetData.createdAt.toDate().toISOString(),
      updatedAt: assetData.updatedAt.toDate().toISOString(),
    }
  });

  return { assets };
});

// Callable function to get a single asset
export const getAsset = functions.https.onCall(async (data, context) => {
    const ownerId = checkAuth(context);
    const { assetId } = data;
    if(!assetId) throw new functions.https.HttpsError("invalid-argument", "Asset ID is required.");
    
    const assetRef = db.collection(`users/${ownerId}/assets`).doc(assetId);
    const doc = await assetRef.get();
    
    if(!doc.exists) {
        throw new functions.https.HttpsError("not-found", "Asset not found.");
    }

    const assetData = doc.data()!;

    return {
        id: doc.id,
        ...assetData,
        purchaseDate: assetData.purchaseDate?.toDate().toISOString(),
        createdAt: assetData.createdAt.toDate().toISOString(),
        updatedAt: assetData.updatedAt.toDate().toISOString(),
    }
});


// Callable function to update an asset
export const updateAsset = functions.https.onCall(async (data, context) => {
    const ownerId = checkAuth(context);
    const { assetId, ...updateData } = data;
    if(!assetId) throw new functions.https.HttpsError("invalid-argument", "Asset ID is required.");

    const validation = createAssetSchema.partial().safeParse(updateData);
     if(!validation.success) {
      throw new functions.https.HttpsError("invalid-argument", "Invalid asset data.", validation.error.format());
    }

    const assetRef = db.collection(`users/${ownerId}/assets`).doc(assetId);

    const assetDoc = await assetRef.get();
    if (!assetDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Asset not found.");
    }
    if (assetDoc.data()?.ownerId !== ownerId) {
        throw new functions.https.HttpsError("permission-denied", "You are not authorized to update this asset.");
    }

    const validatedPayload = validation.data;
    const payloadForFirestore: any = { ...validatedPayload, updatedAt: admin.firestore.FieldValue.serverTimestamp() };

    if (validatedPayload.purchaseDate) {
        payloadForFirestore.purchaseDate = admin.firestore.Timestamp.fromDate(new Date(validatedPayload.purchaseDate));
    }


    await assetRef.update(payloadForFirestore);

    return { success: true };
});
