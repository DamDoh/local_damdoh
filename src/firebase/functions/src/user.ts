
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { v4 as uuidv4 } from "uuid";
import { stakeholderProfileSchemas } from "@/lib/schemas"; // Corrected import
import { deleteCollectionByPath, getRole, getUserDocument } from './utils';

const db = admin.firestore();

/**
 * Triggered on new Firebase Authentication user creation.
 * Creates a corresponding user document in Firestore with default values.
 * This is the secure, server-side way to create user profiles.
 */
export const onUserCreate = functions.auth.user().onCreate(async (user) => {
    console.log(`New user signed up: ${user.uid}, email: ${user.email}`);

    const userRef = db.collection("users").doc(user.uid);
    const universalId = uuidv4();

    try {
        await userRef.set({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email?.split('@')[0] || "New User",
            avatarUrl: user.photoURL || null,
            primaryRole: 'Consumer', // Default role
            profileSummary: "Just joined the DamDoh community!",
            universalId: universalId,
            viewCount: 0,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`Successfully created Firestore profile for user ${user.uid}.`);
        return null;
    } catch (error) {
        console.error(`Error creating Firestore profile for user ${user.uid}:`, error);
        return null;
    }
});


/**
 * Triggered when a user deletes their Firebase Authentication account.
 * This function performs a "cascade delete" to remove all of the user's
 * data from the Firestore database, ensuring GDPR/CCPA compliance.
 */
export const onUserDeleteCleanup = functions.auth.user().onDelete(async (user) => {
    console.log(`User account deleted: ${user.uid}. Starting data cleanup.`);
    const uid = user.uid;
    const batchSize = 200; // Define a batch size for deletions

    const collectionsToDelete = [
        { name: 'posts', userIdField: 'userId' },
        { name: 'marketplaceItems', userIdField: 'sellerId' },
        { name: 'farms', userIdField: 'ownerId' },
        { name: 'crops', userIdField: 'ownerId' },
        // Add other collections and their respective user ID fields here
    ];

    try {
        const promises: Promise<any>[] = [];

        // Delete top-level collections created by the user
        for (const collection of collectionsToDelete) {
            const query = db.collection(collection.name).where(collection.userIdField, '==', uid);
            const snapshot = await query.get();
            if (!snapshot.empty) {
                console.log(`Deleting ${snapshot.size} documents from '${collection.name}' for user ${uid}.`);
                const deletePromise = Promise.all(snapshot.docs.map(doc => doc.ref.delete()));
                promises.push(deletePromise);
            }
        }
        
        // Delete user's own profile document
        promises.push(db.collection('users').doc(uid).delete());
        
        // Delete any collections nested under the user document
        const workersPath = `users/${uid}/workers`;
        promises.push(deleteCollectionByPath(workersPath, batchSize));

        // Delete credit score document
        promises.push(db.collection('credit_scores').doc(uid).delete());

        await Promise.all(promises);
        console.log(`Successfully completed data cleanup for user ${uid}.`);
        return null;

    } catch (error) {
        console.error(`Error cleaning up data for user ${uid}:`, error);
        return null;
    }
});


const checkAuth = (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
  }
  return context.auth.uid;
};

/**
 * Validates the structure of profileData based on the stakeholder's role.
 * @param {string} role The primary role of the stakeholder.
 * @param {any} data The profileData object to validate.
 * @throws {functions.https.HttpsError} Throws an error if validation fails.
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

    // During initial sign-up, only role and display name are required.
    // The onUserCreate trigger handles the base document. This function just merges the initial role info.
    if (!primaryRole) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "A primary role must be provided.",
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
      if (location !== undefined) updatePayload.location = location;
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
        "Failed to write to the database. This might be because Firestore is not enabled in your Firebase project.",
        {originalError: error.message},
      );
    }
  },
);

/**
 * Helper function to get a user's profile from Firestore by their ID for backend use.
 * This is NOT a callable function.
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
        const profileData = userDoc.data();
        if (!profileData) return null;
        
        // Ensure timestamps are serialized
        return {
            id: userDoc.id,
            ...profileData,
            createdAt: (profileData.createdAt as admin.firestore.Timestamp)?.toDate ? (profileData.createdAt as admin.firestore.Timestamp).toDate().toISOString() : new Date().toISOString(),
            updatedAt: (profileData.updatedAt as admin.firestore.Timestamp)?.toDate ? (profileData.updatedAt as admin.firestore.Timestamp).toDate().toISOString() : new Date().toISOString(),
        };
    } catch (error) {
        console.error("Error fetching user profile by ID:", error);
        return null;
    }
};

/**
 * Callable Cloud Function to get a user's profile from the client-side.
 */
export const getProfileByIdCallable = functions.https.onCall(async (data, context) => {
  const { uid } = data;
  if (!uid) {
    throw new functions.https.HttpsError('invalid-argument', 'A uid must be provided.');
  }
  // This function is public, so no auth check is needed, but you might add one
  // if you want to restrict who can look up profiles.
  return await getProfileByIdFromDB(uid);
});

export const deleteUserAccount = functions.https.onCall(async (data, context) => {
    const uid = checkAuth(context);
    console.log(`User ${uid} has requested account deletion.`);
    try {
        await admin.auth().deleteUser(uid);
        console.log(`Successfully deleted Firebase Auth user ${uid}. The onDelete trigger will now handle data cleanup.`);
        return { success: true, message: "Account deletion process initiated." };
    } catch (error) {
        console.error(`Error deleting auth user ${uid}:`, error);
        throw new functions.https.HttpsError("internal", "Failed to delete user account.");
    }
});

export const requestDataExport = functions.https.onCall(async (data, context) => {
    const uid = checkAuth(context);
    console.log(`User ${uid} has requested a data export.`);
    // Placeholder for actual data export logic
    return { success: true, message: "If an account with your email exists, a data export link will be sent shortly." };
});

// --- Activity Functions ---

export const logProfileView = functions.https.onCall(async (data, context) => {
    const viewerId = checkAuth(context);
    const { viewedId } = data;

    if (!viewedId) {
        throw new functions.https.HttpsError("invalid-argument", "error.viewedId.required");
    }

    // Don't log self-views
    if (viewerId === viewedId) {
        return { success: true, message: "Self-view, not logged." };
    }
    
    const logRef = db.collection('profile_views').doc();
    await logRef.set({
        viewerId,
        viewedId,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, logId: logRef.id };
});

export const getUserActivity = functions.https.onCall(async (data, context) => {
    checkAuth(context);
    const { userId } = data;
    if (!userId) {
        throw new functions.https.HttpsError('invalid-argument', 'error.userId.required');
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

        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        return { activities: activities.slice(0, 10) };

    } catch (error) {
        console.error(`Error fetching activity for user ${userId}:`, error);
        throw new functions.https.HttpsError('internal', 'error.activity.fetchFailed');
    }
});

async function getEngagementStats(userId: string): Promise<{ profileViews: number, postLikes: number, postComments: number }> {
    if (!userId) {
        throw new Error('A userId must be provided.');
    }
    try {
        const userDoc = await getUserDocument(userId);
        const profileViews = userDoc?.data()?.viewCount || 0;

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
        throw new Error('Could not fetch engagement statistics.');
    }
};

export const getUserEngagementStats = functions.https.onCall(async (data, context) => {
    checkAuth(context);
    const { userId } = data;
    if (!userId) {
        throw new functions.https.HttpsError('invalid-argument', 'error.userId.required');
    }
    try {
        return await getEngagementStats(userId);
    } catch (error: any) {
        throw new functions.https.HttpsError('internal', error.message || 'error.stats.fetchFailed');
    }
});

// --- Firestore Triggers related to User/Activity ---

export const onNewProfileView = functions.firestore
    .document('profile_views/{viewId}')
    .onCreate(async (snap, context) => {
        const viewData = snap.data();
        if (!viewData) {
            console.error("View log created with no data:", context.params.viewId);
            return;
        }

        const { viewedId } = viewData;
        
        if (!viewedId) {
            console.error("View log is missing 'viewedId':", context.params.viewId);
            return;
        }
        
        const viewedUserRef = db.collection('users').doc(viewedId);
        
        try {
            await viewedUserRef.update({
                viewCount: admin.firestore.FieldValue.increment(1)
            });
            console.log(`Successfully incremented view count for user ${viewedId}.`);
        } catch (error) {
            console.error(`Failed to increment view count for user ${viewedId}:`, error);
        }
    });
