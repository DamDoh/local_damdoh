
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { createInventoryItemSchema } from "@/lib/schemas";

const db = admin.firestore();

// Helper to check for authentication
const checkAuth = (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
  }
  return context.auth.uid;
};

// Callable function to add a new inventory item
export const addInventoryItem = functions.https.onCall(async (data, context) => {
  const ownerId = checkAuth(context);
  
  const validation = createInventoryItemSchema.safeParse(data);
  if(!validation.success) {
      throw new functions.https.HttpsError("invalid-argument", "Invalid inventory item data.", validation.error.format());
  }

  const { name, category, quantity, unit, purchaseDate, expiryDate, supplier, notes } = validation.data;

  const newItemRef = db.collection(`users/${ownerId}/inventory`).doc();
  await newItemRef.set({
    name,
    category,
    quantity: Number(quantity),
    unit,
    purchaseDate: purchaseDate ? admin.firestore.Timestamp.fromDate(new Date(purchaseDate)) : null,
    expiryDate: expiryDate ? admin.firestore.Timestamp.fromDate(new Date(expiryDate)) : null,
    supplier: supplier || null,
    notes: notes || "",
    ownerId,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true, itemId: newItemRef.id };
});

// Callable function to get all inventory items for a user
export const getInventory = functions.https.onCall(async (data, context) => {
  const ownerId = checkAuth(context);
  const itemsSnapshot = await db.collection(`users/${ownerId}/inventory`).orderBy('name', 'asc').get();
  
  const items = itemsSnapshot.docs.map(doc => {
    const itemData = doc.data();
    return {
      id: doc.id,
      ...itemData,
      purchaseDate: itemData.purchaseDate?.toDate().toISOString(),
      expiryDate: itemData.expiryDate?.toDate().toISOString() || null,
      createdAt: itemData.createdAt.toDate().toISOString(),
      updatedAt: itemData.updatedAt.toDate().toISOString(),
    }
  });

  return { items };
});


// Callable function to get a single inventory item
export const getInventoryItem = functions.https.onCall(async (data, context) => {
    const ownerId = checkAuth(context);
    const { itemId } = data;
    if(!itemId) throw new functions.https.HttpsError("invalid-argument", "Item ID is required.");
    
    const itemRef = db.collection(`users/${ownerId}/inventory`).doc(itemId);
    const doc = await itemRef.get();
    
    if(!doc.exists) {
        throw new functions.https.HttpsError("not-found", "Inventory item not found.");
    }

    const itemData = doc.data()!;

    return {
        id: doc.id,
        ...itemData,
        purchaseDate: itemData.purchaseDate?.toDate().toISOString(),
        expiryDate: itemData.expiryDate?.toDate().toISOString() || null,
        createdAt: itemData.createdAt.toDate().toISOString(),
        updatedAt: itemData.updatedAt.toDate().toISOString(),
    }
});


// Callable function to update an inventory item
export const updateInventoryItem = functions.https.onCall(async (data, context) => {
    const ownerId = checkAuth(context);
    const { itemId, ...updateData } = data;
    if(!itemId) throw new functions.https.HttpsError("invalid-argument", "Item ID is required.");

    const validation = createInventoryItemSchema.partial().safeParse(updateData);
     if(!validation.success) {
      throw new functions.https.HttpsError("invalid-argument", "Invalid inventory item data.", validation.error.format());
    }

    const itemRef = db.collection(`users/${ownerId}/inventory`).doc(itemId);

    const itemDoc = await itemRef.get();
    if (!itemDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Inventory item not found.");
    }
    if (itemDoc.data()?.ownerId !== ownerId) {
        throw new functions.https.HttpsError("permission-denied", "You are not authorized to update this item.");
    }

    const validatedPayload = validation.data;
    const payloadForFirestore: any = { ...validatedPayload, updatedAt: admin.firestore.FieldValue.serverTimestamp() };

    if (validatedPayload.purchaseDate) {
        payloadForFirestore.purchaseDate = admin.firestore.Timestamp.fromDate(new Date(validatedPayload.purchaseDate));
    }
    if (validatedPayload.expiryDate) {
        payloadForFirestore.expiryDate = admin.firestore.Timestamp.fromDate(new Date(validatedPayload.expiryDate));
    }


    await itemRef.update(payloadForFirestore);

    return { success: true };
});

    