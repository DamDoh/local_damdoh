

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {stakeholderProfileSchemas} from "./stakeholder-profile-data";
import { UserRole } from "@/lib/types";
import { geohashForLocation } from 'geofire-common';

const db = admin.firestore();

/**
 * Triggered on new Firebase Authentication user creation.
 * Creates a corresponding user document in Firestore with default values.
 * This is the secure, server-side way to create user profiles.
 * @param {admin.auth.UserRecord} user The user record of the new user.
 * @return {Promise<null>} A promise that resolves when the function is complete.
 */
export const onUserCreate = functions.auth.user().onCreate(async (user) => {
    console.log(`New user signed up: ${user.uid}, email: ${user.email}`);

    const userRef = db.collection("users").doc(user.uid);
    
    try {
        // Only set the most basic, non-user-provided information here.
        // Role and display name will be handled by the client call to upsertStakeholderProfile.
        // The universalId is handled by a separate trigger in universal-id.ts
        await userRef.set({
            uid: user.uid,
            email: user.email,
            avatarUrl: user.photoURL || null,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            viewCount: 0,
        });
        console.log(`Successfully created Firestore base profile for user ${user.uid}.`);
        return null;
    } catch (error) {
        console.error(`Error creating Firestore profile for user ${user.uid}:`, error);
        return null;
    }
});


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
        if (location && typeof location.lat === 'number' && typeof location.lng === 'number') {
            updatePayload.geohash = geohashForLocation([location.lat, location.lng]);
        } else {
            updatePayload.geohash = null;
        }
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

      return {status: "success", message: "Profile updated successfully."};
    } catch (error: any) {
      console.error("Error upserting stakeholder profile:", error);
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
  } catch (error) {
    console.error("Error fetching user role:", error);
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
  } catch (error) {
    console.error("Error getting user document:", error);
    return null;
  }
}

/**
 * Helper function to get a user's profile from Firestore by their ID.
 * @param {string} uid The user's ID.
 * @return {Promise<any | null>} The user's profile data or null if not found.
 */
export async function getProfileByIdFromDB(uid: string): Promise<any | null> {
    if (!uid) {
        return null;
    }
    try {
        const userDoc = await db.collection("users").doc(uid).get();
        if (!userDoc.exists) {
            return null;
        }
        const data = userDoc.data();
        if (!data) return null;
        
        // Ensure timestamps are serialized
        const serializedData = {
            id: userDoc.id,
            ...data,
            createdAt: (data.createdAt as admin.firestore.Timestamp)?.toDate ? (data.createdAt as admin.firestore.Timestamp).toDate().toISOString() : new Date().toISOString(),
            updatedAt: (data.updatedAt as admin.firestore.Timestamp)?.toDate ? (data.updatedAt as admin.firestore.Timestamp).toDate().toISOString() : new Date().toISOString(),
        };

        return serializedData;
    } catch (error) {
        console.error("Error fetching user profile by ID:", error);
        return null;
    }
}

/**
 * Logs a profile view event and increments the view count on the user's profile.
 * @param {any} data The data for the function call.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{success: boolean, logId?: string, message?: string}>} A promise that resolves with the operation status.
 */
export const logProfileView = functions.https.onCall(async (data, context) => {
    const viewerId = checkAuth(context);
    const { viewedId } = data;

    if (!viewedId) {
        throw new functions.https.HttpsError("invalid-argument", "A 'viewedId' must be provided.");
    }

    // Don't log self-views
    if (viewerId === viewedId) {
        console.log("User viewed their own profile. No log created.");
        return { success: true, message: "Self-view, not logged." };
    }
    
    const viewedUserRef = db.collection('users').doc(viewedId);
    
    // Atomically increment the view count on the user's profile.
    await viewedUserRef.update({
        viewCount: admin.firestore.FieldValue.increment(1)
    });

    const logRef = db.collection('profile_views').doc();
    await logRef.set({
        viewerId,
        viewedId,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, logId: logRef.id };
});


/**
 * Fetches recent activity for a given user.
 * @param {any} data The data for the function call.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{activities: any[]}>} A promise that resolves with the user's recent activities.
 */
export const getUserActivity = functions.https.onCall(async (data, context) => {
    checkAuth(context);
    const { userId } = data;
    if (!userId) {
        throw new functions.https.HttpsError('invalid-argument', 'A userId must be provided.');
    }

    try {
        const postsPromise = db.collection('posts').where('userId', '==', userId).orderBy('createdAt', 'desc').limit(5).get();
        const ordersPromise = db.collection('marketplace_orders').where('buyerId', '==', userId).orderBy('createdAt', 'desc').limit(5).get();
        const salesPromise = db.collection('marketplace_orders').where('sellerId', '==', userId).orderBy('createdAt', 'desc').limit(5).get();
        const eventsPromise = db.collection('traceability_events').where('actorRef', '==', userId).orderBy('timestamp', 'desc').limit(5).get();

        const [postsSnap, ordersSnap, salesSnap, eventsSnap] = await Promise.all([postsPromise, ordersPromise, salesPromise, eventsSnap]);
        
        const activities: any[] = [];
        const toISODate = (timestamp: admin.firestore.Timestamp | undefined) => {
            return timestamp && timestamp.toDate ? timestamp.toDate().toISOString() : new Date().toISOString();
        };

        postsSnap.forEach(doc => {
            const post = doc.data();
            activities.push({
                id: doc.id,
                type: 'Shared a Post',
                title: post.content.substring(0, 70) + (post.content.length > 70 ? '...' : ''),
                timestamp: toISODate(post.createdAt),
                icon: 'MessageSquare'
            });
        });

        ordersSnap.forEach(doc => {
            const order = doc.data();
            activities.push({
                id: doc.id,
                type: 'Placed an Order',
                title: `For: ${order.listingName}`,
                timestamp: toISODate(order.createdAt),
                icon: 'ShoppingCart'
            });
        });

        salesSnap.forEach(doc => {
            const sale = doc.data();
            activities.push({
                id: doc.id,
                type: 'Received an Order',
                title: `For: ${sale.listingName}`,
                timestamp: toISODate(sale.createdAt),
                icon: 'CircleDollarSign'
            });
        });
        
        eventsSnap.forEach(doc => {
            const event = doc.data();
            activities.push({
                id: doc.id,
                type: `Logged Event: ${event.eventType}`,
                title: event.payload?.inputId || event.payload?.cropType || 'Traceability Update',
                timestamp: toISODate(event.timestamp),
                icon: 'GitBranch'
            });
        });

        // Sort all activities by date and take the most recent 10
        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        return { activities: activities.slice(0, 10) };

    } catch (error) {
        console.error(`Error fetching activity for user ${userId}:`, error);
        throw new functions.https.HttpsError('internal', 'error.activity.fetchFailed');
    }
});

/**
 * Fetches engagement statistics for a given user.
 * @param {object} data The data for the function call.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<object>} A promise that resolves with the user's engagement stats.
 */
export const getUserEngagementStats = functions.https.onCall(async (data, context) => {
    checkAuth(context);
    const { userId } = data;
     if (!userId) {
        throw new functions.https.HttpsError('invalid-argument', 'A userId must be provided.');
    }

    try {
        // Fetch the user document to get the pre-aggregated view count.
        const userDoc = await db.collection('users').doc(userId).get();
        const profileViews = userDoc.data()?.viewCount || 0;

        // The logic for likes and comments remains the same, as it's already performant.
        const postsQuery = db.collection('posts').where('userId', '==', userId).get();
        const postsSnapshot = await postsQuery;

        let postLikes = 0;
        let postComments = 0;
        postsSnapshot.forEach(doc => {
            postLikes += doc.data().likesCount || 0;
            postComments += doc.data().commentsCount || 0;
        });

        return {
            profileViews,
            postLikes,
            postComments
        };
    } catch (error) {
        console.error(`Error fetching engagement stats for user ${userId}:`, error);
        throw new functions.https.HttpsError('internal', 'error.stats.fetchFailed');
    }
});


/**
 * Deletes a user's data from across the entire Firestore database upon their Auth deletion.
 * This is a critical function for GDPR "Right to be Forgotten" compliance.
 * It performs a "cascade delete" of all content created by the user.
 * @param {functions.auth.UserRecord} user The user record of the deleted user.
 * @return {Promise<void>} A promise that resolves when cleanup is complete.
 */
export const onUserDeleteCleanup = functions.auth.user().onDelete(async (user) => {
    console.log(`User deletion triggered for UID: ${user.uid}. Cleaning up Firestore data.`);

    const uid = user.uid;
    const batchSize = 200; // Firestore batch limit is 500 writes

    // Mapping of collections to the field that stores the user's UID.
    const collectionsToDeleteFrom: { [key: string]: string | string[] } = {
        posts: 'userId',
        marketplaceItems: 'sellerId',
        farms: 'ownerId',
        crops: 'ownerId',
        knf_batches: 'userId',
        traceability_events: 'actorRef',
        connection_requests: ['requesterId', 'recipientId'], // Special case for multiple fields
        agri_events: 'organizerId',
        financial_applications: 'applicantId',
        insurance_applications: 'applicantId',
        groups: 'ownerId',
    };

    const promises: Promise<any>[] = [];

    // Loop through each collection and delete documents related to the user.
    for (const [collection, field] of Object.entries(collectionsToDeleteFrom)) {
        if (Array.isArray(field)) {
            for (const f of field) {
                const query = db.collection(collection).where(f, '==', uid).limit(batchSize);
                promises.push(deleteQueryBatch(query));
            }
        } else {
            const query = db.collection(collection).where(field, '==', uid).limit(batchSize);
            promises.push(deleteQueryBatch(query));
        }
    }
    
    // Remove user from any groups they are a member of
    const memberOfQuery = db.collectionGroup('members').where(admin.firestore.FieldPath.documentId(), '==', uid);
    promises.push(deleteQueryBatch(memberOfQuery));

    // Also delete the main user profile document
    promises.push(db.collection('users').doc(uid).delete());
    
    // Delete any credit scores associated with the user
    promises.push(db.collection('credit_scores').doc(uid).delete());
    
    // Delete any API Keys associated with the user
    promises.push(deleteCollectionByPath(`users/${uid}/api_keys`, batchSize));

    // Remove from search index
    promises.push(db.collection('search_index').doc(`users_${uid}`).delete());

    await Promise.all(promises);
    console.log(`Cleanup finished for user ${uid}.`);
});

/**
 * Recursively deletes documents from a query in batches.
 * @param {FirebaseFirestore.Query} query The query to delete documents from.
 * @return {Promise<number>} A promise that resolves with the number of documents deleted.
 */
async function deleteQueryBatch(query: FirebaseFirestore.Query): Promise<number> {
  const snapshot = await query.get();

  if (snapshot.size === 0) {
    return 0;
  }

  const batch = query.firestore.batch();
  snapshot.docs.forEach((doc) => {
    // If it's a member document, we also need to decrement the group's memberCount
    if (doc.ref.parent.parent?.path.startsWith('groups/')) {
        const groupRef = doc.ref.parent.parent;
        if(groupRef) {
            batch.update(groupRef, { memberCount: admin.firestore.FieldValue.increment(-1) });
        }
    }
    batch.delete(doc.ref);
  });
  await batch.commit();
  console.log(`Deleted ${snapshot.size} documents.`);

  // Recurse on the same query to delete more documents if the batch was full.
  if (snapshot.size > 0) {
    return snapshot.size + await deleteQueryBatch(query);
  } else {
    return snapshot.size;
  }
}


/**
 * Recursively deletes a collection in batches.
 * @param {string} collectionPath The path to the collection to delete.
 * @param {number} batchSize The number of documents to delete in each batch.
 * @return {Promise<void>} A promise that resolves when the deletion is complete.
 */
async function deleteCollectionByPath(collectionPath: string, batchSize: number): Promise<void> {
    const collectionRef = db.collection(collectionPath);
    const query = collectionRef.orderBy('__name__').limit(batchSize);

    return new Promise((resolve, reject) => {
        deleteQueryBatchForSubcollection(query, resolve).catch(reject);
    });
}

/**
 * Helper for deleting subcollections.
 * @param {FirebaseFirestore.Query} query The query to delete documents from.
 * @param {Function} resolve The promise resolve function.
 * @return {Promise<void>} A promise that resolves when the batch is deleted.
 */
async function deleteQueryBatchForSubcollection(query: admin.firestore.Query, resolve: (value?: unknown) => void): Promise<void> {
    const snapshot = await query.get();

    if (snapshot.size === 0) {
        resolve();
        return;
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();

    process.nextTick(() => {
        deleteQueryBatchForSubcollection(query, resolve);
    });
}
