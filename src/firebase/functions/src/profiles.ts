
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { v4 as uuidv4 } from "uuid";
import {stakeholderProfileSchemas} from "./stakeholder-profile-data";
import { UserRole } from "@/lib/types";
import { geohashForLocation } from "geofire-common";
import { logInfo, logError } from "./logging";


const db = admin.firestore();

/**
 * Triggered on new Firebase Authentication user creation.
 * Creates a corresponding user document in Firestore with default values.
 * This is the secure, server-side way to create user profiles.
 * @param {admin.auth.UserRecord} user The user record of the new user.
 * @return {Promise<null>} A promise that resolves when the function is complete.
 */
export const onUserCreate = functions.auth.user().onCreate(async (user) => {
    logInfo("New user signed up", { uid: user.uid, email: user.email });

    const userRef = db.collection("users").doc(user.uid);
    const universalId = uuidv4();
    const defaultLocation = { lat: 0, lng: 0, address: "Not specified" };

    try {
        await userRef.set({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email?.split('@')[0] || "New User",
            avatarUrl: user.photoURL || null,
            primaryRole: 'Consumer', // Default role. User will update this in their profile.
            profileSummary: "Just joined the DamDoh community!", // A generic initial summary.
            universalId: universalId,
            location: defaultLocation,
            geohash: geohashForLocation([defaultLocation.lat, defaultLocation.lng]),
            viewCount: 0,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        logInfo("Successfully created Firestore base profile for user", { uid: user.uid });
        return null;
    } catch (error: any) {
        logError("Error creating Firestore profile", { uid: user.uid, errorMessage: error.message });
        return null;
    }
});


/**
 * A cleanup function triggered when a user is deleted from Firebase Authentication.
 * This function performs a "cascade delete" to remove all of a user's data
 * from various collections in Firestore, ensuring data privacy compliance.
 */
export const onUserDeleteCleanup = functions.auth.user().onDelete(async (user) => {
    const userId = user.uid;
    logInfo("Starting data cleanup for deleted user", { uid: userId });

    const db = admin.firestore();
    const userRef = db.collection('users').doc(userId);

    const cleanupPromises: Promise<any>[] = [];

    // 1. Delete main user profile document
    cleanupPromises.push(userRef.delete());

    // 2. Delete all subcollections of the user
    cleanupPromises.push(deleteCollection(`users/${userId}/workers`, 100));
    cleanupPromises.push(deleteCollection(`users/${userId}/api_keys`, 50));
    cleanupPromises.push(deleteCollection(`users/${userId}/certifications`, 50));


    // 3. Delete all top-level documents directly created by the user
    const collectionsToClean: { name: string, userField: string }[] = [
        { name: 'posts', userField: 'userId' },
        { name: 'farms', userField: 'ownerId' },
        { name: 'crops', userField: 'ownerId' },
        { name: 'knf_batches', userField: 'userId' },
        { name: 'marketplaceItems', userField: 'sellerId' },
        { name: 'shops', userField: 'ownerId' },
        { name: 'agri_events', userField: 'organizerId' },
        { name: 'financial_transactions', userField: 'userRef' }, // Note: userRef is a reference, not a string
    ];

    collectionsToClean.forEach(collectionInfo => {
        const userIdentifier = collectionInfo.userField === 'userRef' ? userRef : userId;
        const query = db.collection(collectionInfo.name).where(collectionInfo.userField, '==', userIdentifier);
        cleanupPromises.push(query.get().then(snapshot => {
            if (snapshot.empty) return;
            const batch = db.batch();
            snapshot.docs.forEach(doc => batch.delete(doc.ref));
            return batch.commit();
        }));
    });
    
    // 4. Clean up connections in other users' documents
    const connectionsQuery = db.collection('users').where('connections', 'array-contains', userId);
    cleanupPromises.push(connectionsQuery.get().then(snapshot => {
        if (snapshot.empty) return;
        const batch = db.batch();
        snapshot.docs.forEach(doc => {
            batch.update(doc.ref, { connections: admin.firestore.FieldValue.arrayRemove(userId) });
        });
        return batch.commit();
    }));
    
    // 5. Clean up group memberships
    const groupMembershipQuery = db.collectionGroup('members').where(admin.firestore.FieldPath.documentId(), '==', userId);
    cleanupPromises.push(groupMembershipQuery.get().then(snapshot => {
      if (snapshot.empty) return;
      const batch = db.batch();
      snapshot.docs.forEach(doc => {
        const groupRef = doc.ref.parent.parent;
        if(groupRef) {
          batch.update(groupRef, { memberCount: admin.firestore.FieldValue.increment(-1) });
        }
        batch.delete(doc.ref);
      });
      return batch.commit();
    }));


    try {
        await Promise.all(cleanupPromises);
        logInfo("Successfully completed data cleanup for user", { uid: userId });
    } catch (error: any) {
        logError("Error during data cleanup", { uid: userId, errorMessage: error.message });
    }
});


/**
 * Recursively deletes a collection in batches.
 * This is a helper function used by onUserDeleteCleanup.
 * @param {string} collectionPath The path of the collection to delete.
 * @param {number} batchSize The number of documents to delete in each batch.
 * @return {Promise<void>}
 */
async function deleteCollection(collectionPath: string, batchSize: number): Promise<void> {
  const db = admin.firestore();
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.orderBy('__name__').limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(query, resolve).catch(reject);
  });
}

/**
 * Recursively deletes documents from a query in batches.
 * @param {FirebaseFirestore.Query} query The query to delete documents from.
 * @param {() => void} resolve The promise resolve function.
 */
async function deleteQueryBatch(query: admin.firestore.Query, resolve: () => void): Promise<void> {
  const snapshot = await query.get();

  if (snapshot.size === 0) {
    resolve();
    return;
  }

  const batch = admin.firestore().batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  process.nextTick(() => {
    deleteQueryBatch(query, resolve);
  });
}


/**
 * Checks for user authentication in a callable function context.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {string} The user's UID.
 */
const checkAuth = (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "error.unauthenticated");
  }
  return context.auth.uid;
};

/**
 * Validates the structure of profileData based on the stakeholder's role.
 * @param {string} role The primary role of the stakeholder.
 * @param {any} data The profileData object to validate.
 * @throws {functions.https.HttpsError} Throws an error if validation fails.
 * @return {object} The validated data.
 */
const validateProfileData = (role: string, data: any) => {
  const schemaKey = role as keyof typeof stakeholderProfileSchemas;
  const schema = stakeholderProfileSchemas[schemaKey];
  if (schema) {
    const result = schema.safeParse(data);
    if (!result.success) {
      const errorMessage = result.error.errors.map(e => `${e.path.join('.')} - ${e.message}`).join('; ');
      throw new functions.https.HttpsError(
        "invalid-argument",
        `Profile data validation failed for role ${role}: ${errorMessage}`,
      );
    }
    return result.data; // Return cleaned/validated data
  }
  return data || {};
};


/**
 * Creates or updates a detailed stakeholder profile. This is the single, secure entry point for all profile modifications.
 * @param {any} data The data for the function call. Must include a primaryRole.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{status: string, message: string}>} A promise that resolves with the status.
 */
export const upsertStakeholderProfile = functions.https.onCall(
  async (data, context) => {
    const userId = checkAuth(context);

    const {
      primaryRole,
      displayName,
      profileSummary,
      bio,
      location,
      areasOfInterest,
      needs,
      contactInfoPhone,
      contactInfoWebsite,
      profileData,
    } = data;

    if (!primaryRole) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "error.profile.roleRequired",
      );
    }

    // Validate the role-specific data if it exists
    const validatedProfileData = profileData ? validateProfileData(primaryRole, profileData) : {};

    try {
      const userRef = db.collection("users").doc(userId);

      const updatePayload: {[key: string]: any} = {
        primaryRole,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      if (displayName !== undefined) updatePayload.displayName = displayName;
      if (profileSummary !== undefined) updatePayload.profileSummary = profileSummary;
      if (bio !== undefined) updatePayload.bio = bio;
      
      // Handle Geohash generation for location
      if (location !== undefined) {
        updatePayload.location = location;
      }

      if (Array.isArray(areasOfInterest)) updatePayload.areasOfInterest = areasOfInterest;
      if (Array.isArray(needs)) updatePayload.needs = needs;
      if (contactInfoPhone !== undefined || contactInfoWebsite !== undefined) {
        updatePayload.contactInfo = {
          phone: contactInfoPhone || null,
          website: contactInfoWebsite || null,
        };
      }
      // Add the validated data to the payload
      if (validatedProfileData) updatePayload.profileData = validatedProfileData;

      // Use { merge: true } to create or update the document without overwriting existing fields.
      await userRef.set(updatePayload, {merge: true});

      logInfo("User profile updated successfully", { uid: userId, role: primaryRole });
      return {status: "success", message: "Profile updated successfully."};
    } catch (error: any) {
      logError("Error upserting stakeholder profile", { uid: userId, errorMessage: error.message });
       if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      throw new functions.https.HttpsError(
        "internal",
        "error.profile.updateFailed",
        {originalError: error.message},
      );
    }
  },
);


/**
 * Helper function to get a user's role from Firestore.
 * @param {string | undefined} uid The user's ID.
 * @return {Promise<UserRole | null>} The user's role or null if not found.
 */
export async function getRole(uid: string | undefined): Promise<UserRole | null> {
  if (!uid) {
    return null;
  }
  try {
    const userDoc = await db.collection("users").doc(uid).get();
    const role = userDoc.data()?.primaryRole;
    return role ? (role as UserRole) : null;
  } catch (error: any) {
    logError("Error fetching user role", { uid, errorMessage: error.message });
    return null;
  }
}

/**
 * Helper function to get a user's document from Firestore.
 * @param {string} uid The user's ID.
 * @return {Promise<FirebaseFirestore.DocumentSnapshot | null>} The user's document snapshot or null if not found.
 */
export async function getUserDocument(
  uid: string,
): Promise<FirebaseFirestore.DocumentSnapshot | null> {
  try {
    const userDoc = await db.collection("users").doc(uid).get();
    return userDoc.exists ? userDoc : null;
  } catch (error: any) {
    logError("Error getting user document", { uid, errorMessage: error.message });
    return null;
  }
}

/**
 * Cloud Function to get a user's profile from Firestore by their ID.
 * @param {any} data The data for the function call, expects a `uid`.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<any | null>} The user's profile data or null if not found.
 */
export const getProfileByIdFromDB = functions.https.onCall(async (data, context) => {
    checkAuth(context);
    const { uid } = data;
    if (!uid) {
        throw new functions.https.HttpsError("invalid-argument", "UID is required.");
    }
    try {
        const userDoc = await db.collection("users").doc(uid).get();
        if (!userDoc.exists) {
            return null;
        }
        const profileData = userDoc.data();
        if (!profileData) return null;
        
        // Ensure timestamps are serialized
        const serializedData = {
            id: userDoc.id,
            ...profileData,
            createdAt: (profileData.createdAt as admin.firestore.Timestamp)?.toDate?.().toISOString(),
            updatedAt: (profileData.updatedAt as admin.firestore.Timestamp)?.toDate?.().toISOString(),
        };

        return serializedData;
    } catch (error: any) {
        logError("Error fetching user profile by ID", { uid, errorMessage: error.message });
        throw new functions.https.HttpsError("internal", "Failed to fetch profile.");
    }
});


/**
 * Cloud Function to fetch all user profiles from Firestore.
 */
export const getAllProfilesFromDB = functions.https.onCall(async (data, context) => {
    checkAuth(context);
    try {
        const usersSnapshot = await db.collection('users').get();
        const profiles: UserProfile[] = [];
        usersSnapshot.forEach(doc => {
            const data = doc.data();
            profiles.push({
                id: doc.id,
                ...data,
                createdAt: (data.createdAt as admin.firestore.Timestamp)?.toDate?.().toISOString(),
                updatedAt: (data.updatedAt as admin.firestore.Timestamp)?.toDate?.().toISOString(),
            } as UserProfile);
        });
        return { profiles };
    } catch (error: any) {
        logError("Error fetching all profiles", { errorMessage: error.message });
        throw new functions.https.HttpsError("internal", "Failed to fetch profiles.");
    }
});


/**
 * Deletes the calling user's account from Firebase Authentication.
 * This will then trigger the onUserDeleteCleanup function to remove their data.
 */
export const deleteUserAccount = functions.https.onCall(async (data, context) => {
    const uid = checkAuth(context);
    try {
        await admin.auth().deleteUser(uid);
        logInfo("Successfully deleted auth user", { uid });
        return { success: true, message: "Account deleted successfully." };
    } catch (error: any) {
        logError("Error deleting user account", { uid, errorMessage: error.message });
        throw new functions.https.HttpsError('internal', 'Failed to delete account.');
    }
});

/**
 * Initiates a data export process for the calling user.
 */
export const requestDataExport = functions.https.onCall(async (data, context) => {
    const uid = checkAuth(context);
    
    // In a real application, this would trigger a long-running process
    // using Cloud Tasks to gather all user data from various collections,
    // generate a file (JSON, CSV), and send a secure download link via email.
    
    logInfo("User requested data export", { uid });
    
    // For this demonstration, we'll just return a success message.
    return {
        success: true,
        message: "Your data export request has been received. You will receive an email with a download link within 24 hours.",
    };
});
