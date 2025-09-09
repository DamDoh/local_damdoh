

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { createAssetSchema } from "@/lib/schemas"; // Assuming schemas are shared
import { checkAuth } from "./utils";
import { logError } from "./logging";

const db = admin.firestore();

// Callable function to add a new asset
export const addAsset = functions.https.onCall(async (data, context) => {
  const ownerId = checkAuth(context);
  
  const validation = createAssetSchema.safeParse(data);
  if(!validation.success) {
      throw new functions.https.HttpsError("invalid-argument", "Invalid asset data.", validation.error.format());
  }

  try {
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
  } catch (error) {
    logError("Error adding asset", { ownerId, data, error });
    throw new functions.https.HttpsError("internal", "Could not add new asset.");
  }
});

// Callable function to get all assets for a user
export const getUserAssets = functions.https.onCall(async (data, context) => {
  const ownerId = checkAuth(context);
  try {
    const assetsSnapshot = await db.collection(`users/${ownerId}/assets`).orderBy('purchaseDate', 'desc').get();
  
    const assets = assetsSnapshot.docs.map(doc => {
      const assetData = doc.data();
      return {
        id: doc.id,
        ...assetData,
        purchaseDate: (assetData.purchaseDate as admin.firestore.Timestamp)?.toDate?.().toISOString(),
        createdAt: (assetData.createdAt as admin.firestore.Timestamp)?.toDate?.().toISOString(),
        updatedAt: (assetData.updatedAt as admin.firestore.Timestamp)?.toDate?.().toISOString(),
      }
    });
  
    return { assets };
  } catch (error) {
    logError("Error getting user assets", { ownerId, error });
    throw new functions.https.HttpsError("internal", "Could not retrieve assets.");
  }
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
        purchaseDate: (assetData.purchaseDate as admin.firestore.Timestamp)?.toDate?.().toISOString(),
        createdAt: (assetData.createdAt as admin.firestore.Timestamp)?.toDate?.().toISOString(),
        updatedAt: (assetData.updatedAt as admin.firestore.Timestamp)?.toDate?.().toISOString(),
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
    
    try {
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

    } catch (error) {
        logError("Error updating asset", { ownerId, assetId, error });
        if (error instanceof functions.https.HttpsError) throw error;
        throw new functions.https.HttpsError("internal", "Could not update asset.");
    }
});
