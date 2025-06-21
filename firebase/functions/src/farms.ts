
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK (only once)
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

// Define interfaces for expected data structures (optional but good practice)
interface FarmData {
  name: string;
  location: any; // Or a more specific GeoPoint type if defined
  farm_type: string;
  owner_id: string; // Should match auth.uid
  // Add other expected fields
}

interface CropData {
  farm_id: string;
  crop_type: string;
  owner_id: string; // Should match auth.uid
  // Add other expected fields
}


/**
 * Cloud Function to create a new farm and link it to the user's profile.
 * Ensures the request is authenticated and the farm owner matches the authenticated user.
 */
export const createFarm = functions.https.onCall(async (data: FarmData, context: functions.https.CallableContext) => {
  // Ensure the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be authenticated to create a farm.'
    );
  }

  const userId = context.auth.uid;
  const farmData = data;

  // Basic validation (expand this to match your detailed schema)
  if (!farmData.name || !farmData.location || !farmData.farm_type) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing required farm data fields (name, location, farm_type).'
    );
  }

  // Ensure the owner_id in the data matches the authenticated user's UID
  if (farmData.owner_id !== userId) {
     throw new functions.https.HttpsError(
      'permission-denied',
      'You can only create farms for yourself.'
    );
  }

  // Start a batched write to ensure both operations succeed or fail together
  const batch = db.batch();

  // 1. Add the new farm document
  const newFarmRef = db.collection('farms').doc(); // Firestore auto-generates doc ID
  batch.set(newFarmRef, {
    ...farmData, // owner_id is already part of farmData and validated
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // 2. Update the user's document to add the new farm ID to their farm_ids array
  const userRef = db.collection('users').doc(userId);
  batch.update(userRef, {
    farm_ids: admin.firestore.FieldValue.arrayUnion(newFarmRef.id),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(), // Also update user's updatedAt
  });

  try {
    // Commit the batched write
    await batch.commit();

    // Return success response with the new farm's ID
    return { id: newFarmRef.id, message: 'Farm created successfully.' };
  } catch (error: any) {
    // Handle any errors during the batched write
    console.error('Error creating farm and updating user:', error);
    throw new functions.https.HttpsError(
      'internal',
      'An error occurred while creating the farm.',
      error.message
    );
  }
});

/**
 * Cloud Function to create a new crop for a specific farm using onCall.
 * Ensures the request is authenticated and the user is the owner of the farm.
 */
export const createCrop = functions.https.onCall(async (data: CropData, context: functions.https.CallableContext) => {
  // Ensure the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be authenticated to create a crop.'
    );
  }

  const userId = context.auth.uid;
  const cropData = data;

  // Basic validation (expand this to match your detailed schema)
  if (!cropData.farm_id || !cropData.crop_type) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing required crop data fields (farm_id, crop_type).'
    );
  }

  const farmId = cropData.farm_id;

  // 1. Verify that the authenticated user is the owner of the farm
  try {
    const farmDoc = await db.collection('farms').doc(farmId).get();

    if (!farmDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Farm not found.');
    }

    const farmDocData = farmDoc.data() as FarmData | undefined; // Cast to FarmData

    if (farmDocData?.owner_id !== userId) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'You can only add crops to your own farms.'
      );
    }
  } catch (error: any) {
    console.error('Error verifying farm ownership:', error);
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError('internal', 'Could not verify farm ownership.', error.message);
  }

  // 2. Add the new crop document
  const newCropRef = db.collection('crops').doc();
  await newCropRef.set({
    ...cropData,
    owner_id: userId, // Set owner_id explicitly from auth context
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { id: newCropRef.id, message: 'Crop created successfully.' };
});

/**
 * Cloud Function to retrieve a specific farm by ID using onCall.
 * Ensures the request is authenticated and authorized (user owns the farm).
 */
export const getFarm = functions.https.onCall(async (data: { farmId: string }, context: functions.https.CallableContext) => {
  // Ensure the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be authenticated to view farm details.'
    );
  }

  const userId = context.auth.uid;
  const { farmId } = data;

  if (!farmId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing farm ID.'
    );
  }

  try {
    const farmDoc = await db.collection('farms').doc(farmId).get();

    if (!farmDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Farm not found.');
    }

    const farmData = farmDoc.data() as FarmData | undefined;
    const farmOwnerId = farmData?.owner_id;

    // Ensure the authenticated user is the owner of the farm
    if (farmOwnerId !== userId) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'You do not have permission to view this farm.'
      );
    }

    return { id: farmDoc.id, ...farmData };
  } catch (error: any) {
    console.error('Error retrieving farm:', error);
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError('internal', 'Could not retrieve farm details.', error.message);
  }
});

/**
 * Cloud Function to retrieve all farms owned by the authenticated user using onCall.
 * Ensures the request is authenticated.
 */
export const getUserFarms = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
  // Ensure the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be authenticated to view your farms.'
    );
  }

  const userId = context.auth.uid;

  const farmDocs = await db.collection('farms').where('owner_id', '==', userId).get();

  return farmDocs.docs.map((doc: admin.firestore.QueryDocumentSnapshot) => ({ id: doc.id, ...doc.data() }));
});

/**
 * Cloud Function to retrieve a specific crop by ID using onCall.
 * Ensures the request is authenticated and authorized (user owns the farm the crop belongs to).
 */
export const getCrop = functions.https.onCall(async (data: { cropId: string }, context: functions.https.CallableContext) => {
  // Ensure the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be authenticated to view crop details.'
    );
  }

  const userId = context.auth.uid;
  const { cropId } = data;

  if (!cropId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing crop ID.'
    );
  }

  try {
    const cropDoc = await db.collection('crops').doc(cropId).get();

    if (!cropDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Crop not found.');
    }

    const cropData = cropDoc.data() as CropData | undefined;
    const farmId = cropData?.farm_id;

    if (!farmId) {
       throw new functions.https.HttpsError('internal', 'Crop document is missing farm ID.');
    }

    // Verify that the authenticated user is the owner of the farm the crop belongs to
    const farmDoc = await db.collection('farms').doc(farmId).get();
    const farmDocData = farmDoc.data() as FarmData | undefined;
    const farmOwnerId = farmDocData?.owner_id;

    if (!farmDoc.exists || farmOwnerId !== userId) {
       throw new functions.https.HttpsError(
        'permission-denied',
        'You do not have permission to view this crop.'
      );
    }

    return { id: cropDoc.id, ...cropData };
  } catch (error: any) {
    console.error('Error retrieving crop:', error);
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError('internal', 'Could not retrieve crop details.', error.message);
  }
});

/**
 * Cloud Function to retrieve all crops for a specific farm using onCall.
 * Ensures the request is authenticated and the user owns the farm.
 */
export const getFarmCrops = functions.https.onCall(async (data: { farmId: string }, context: functions.https.CallableContext) => {
  // Ensure the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be authenticated to view farm crops.'
    );
  }

  const userId = context.auth.uid;
  const { farmId } = data;

  if (!farmId) {
     throw new functions.https.HttpsError('invalid-argument', 'Missing farm ID.');
  }

  const cropDocs = await db.collection('crops').where('farm_id', '==', farmId).where('owner_id', '==', userId).get();

  return cropDocs.docs.map((doc: admin.firestore.QueryDocumentSnapshot) => ({ id: doc.id, ...doc.data() }));
});

/**
 * Cloud Function to update a farm document.
 * Ensures the request is authenticated and the user owns the farm.
 */
export const updateFarm = functions.https.onCall(async (data: { farmId: string, updatedFarmData: Partial<FarmData> }, context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be authenticated to update a farm.'
    );
  }

  const userId = context.auth.uid;
  const { farmId, updatedFarmData } = data;

  if (!farmId || !updatedFarmData) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing farm ID or updated farm data.'
    );
  }

  try {
    const farmRef = db.collection('farms').doc(farmId);
    const farmDoc = await farmRef.get();

    if (!farmDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Farm not found.');
    }

    const farmData = farmDoc.data() as FarmData | undefined;
    const farmOwnerId = farmData?.owner_id;

    if (farmOwnerId !== userId) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'You do not have permission to update this farm.'
      );
    }
    
    // Ensure owner_id is not changed and createdAt is not part of updatedFarmData
    const { owner_id, createdAt, ...validUpdateData } = updatedFarmData as any;

    await farmRef.update({
        ...validUpdateData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { id: farmId, message: 'Farm updated successfully.' };

  } catch (error: any) {
    console.error('Error updating farm:', error);
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError('internal', 'Could not update farm.', error.message);
  }
});

/**
 * Cloud Function to delete a farm document.
 * Ensures the request is authenticated and the user owns the farm.
 * Deletes associated crops and updates user's farm_ids array atomically.
 */
export const deleteFarm = functions.https.onCall(async (data: { farmId: string }, context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You must be authenticated to delete a farm.');
  }

  const userId = context.auth.uid;
  const { farmId } = data;

  if (!farmId) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing farm ID.');
  }

  const farmRef = db.collection('farms').doc(farmId);
  const userRef = db.collection('users').doc(userId);
  const batch = db.batch();

  try {
    const farmDoc = await farmRef.get();

    if (!farmDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Farm not found.');
    }

    const farmData = farmDoc.data() as FarmData | undefined;
    const farmOwnerId = farmData?.owner_id;

    if (farmOwnerId !== userId) {
       throw new functions.https.HttpsError(
        'permission-denied',
        'You do not have permission to delete this farm.'
      );
    }

    // 1. Delete associated crops
    const cropsSnapshot = await db.collection('crops').where('farm_id', '==', farmId).where('owner_id', '==', userId).get();
    if (!cropsSnapshot.empty) {
      cropsSnapshot.docs.forEach((doc: admin.firestore.QueryDocumentSnapshot) => {
        batch.delete(doc.ref);
      });
    }

    // 2. Delete the farm itself
    batch.delete(farmRef);

    // 3. Remove the farm ID from the user's farm_ids array
    batch.update(userRef, {
      farm_ids: admin.firestore.FieldValue.arrayRemove(farmId),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(), // Also update user's updatedAt
    });
    
    // 4. Commit the batched operations
    await batch.commit();

    return { id: farmId, message: 'Farm and associated crops deleted successfully.' };

  } catch (error: any) {
    console.error('Error deleting farm:', error);
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError('internal', 'Could not delete farm.', error.message);
  }
});

/**
 * Cloud Function to update a crop document.
 * Ensures the request is authenticated and the user owns the farm the crop belongs to.
 */
export const updateCrop = functions.https.onCall(async (data: { cropId: string, updatedCropData: Partial<CropData> }, context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be authenticated to update a crop.'
    );
  }

  const userId = context.auth.uid;
  const { cropId, updatedCropData } = data;

  if (!cropId || !updatedCropData) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing crop ID or updated crop data.'
    );
  }

  try {
    const cropRef = db.collection('crops').doc(cropId);
    const cropDoc = await cropRef.get();

    if (!cropDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Crop not found.');
    }

    const currentCropData = cropDoc.data() as CropData | undefined;
    const farmId = currentCropData?.farm_id;

    if (!farmId) {
       throw new functions.https.HttpsError('internal', 'Crop document is missing farm ID.');
    }

    const farmDoc = await db.collection('farms').doc(farmId).get();
    const farmData = farmDoc.data() as FarmData | undefined;
    const farmOwnerId = farmData?.owner_id;

    if (!farmDoc.exists || farmOwnerId !== userId || currentCropData?.owner_id !== userId) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'You do not have permission to update this crop.'
      );
    }
    
    // Ensure farm_id and owner_id are not changed, createdAt is not part of updatedCropData
    const { farm_id, owner_id, createdAt, ...validUpdateData } = updatedCropData as any;

    await cropRef.update({
        ...validUpdateData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { id: cropId, message: 'Crop updated successfully.' };

  } catch (error: any) {
    console.error('Error updating crop:', error);
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError('internal', 'Could not update crop.', error.message);
  }
});

/**
 * Cloud Function to delete a crop document.
 * Ensures the request is authenticated and the user owns the farm the crop belongs to.
 */
export const deleteCrop = functions.https.onCall(async (data: { cropId: string }, context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You must be authenticated to delete a crop.');
  }

  const userId = context.auth.uid;
  const { cropId } = data;

  if (!cropId) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing crop ID.');
  }

  try {
    const cropRef = db.collection('crops').doc(cropId);
    const cropDoc = await cropRef.get();

    if (!cropDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Crop not found.');
    }

    const cropData = cropDoc.data() as CropData | undefined;
    const farmId = cropData?.farm_id;

     if (!farmId) {
       throw new functions.https.HttpsError('internal', 'Crop document is missing farm ID.');
    }

    const farmDoc = await db.collection('farms').doc(farmId).get();
    const farmData = farmDoc.data() as FarmData | undefined;
    const farmOwnerId = farmData?.owner_id;

    if (!farmDoc.exists || farmOwnerId !== userId || cropData?.owner_id !== userId) {
       throw new functions.https.HttpsError(
        'permission-denied',
        'You do not have permission to delete this crop.'
      );
    }

    // Consider deleting associated subcollections here if they exist.
    await cropRef.delete();

    return { id: cropId, message: 'Crop deleted successfully.' };

  } catch (error: any) {
    console.error('Error deleting crop:', error);
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError('internal', 'Could not delete crop.', error.message);
  }
});
