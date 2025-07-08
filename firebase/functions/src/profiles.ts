
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { v4 as uuidv4 } from "uuid";
import {stakeholderProfileSchemas} from "./stakeholder-profile-data";
import { UserRole } from "./types";

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
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`Successfully created Firestore profile for user ${user.uid}.`);
        return null;
    } catch (error) {
        console.error(`Error creating Firestore profile for user ${user.uid}:`, error);
        // Optional: you could add logic to delete the auth user if the profile creation fails,
        // but this could also be problematic if the function fails for transient reasons.
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
    
    // To prevent spamming notifications, we could add a check here.
    // e.g., only log a view from the same viewer for the same profile once per day.
    // For now, we'll keep it simple and log every view.

    const logRef = db.collection('profile_views').doc();
    await logRef.set({
        viewerId,
        viewedId,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, logId: logRef.id };
});


export const getUserActivity = functions.https.onCall(async (data, context) => {
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

        postsSnap.forEach(doc => {
            const post = doc.data();
            activities.push({
                id: doc.id,
                type: 'Shared a Post',
                title: post.content.substring(0, 70) + (post.content.length > 70 ? '...' : ''),
                timestamp: post.createdAt.toDate().toISOString(),
                icon: 'MessageSquare'
            });
        });

        ordersSnap.forEach(doc => {
            const order = doc.data();
            activities.push({
                id: doc.id,
                type: 'Placed an Order',
                title: `For: ${order.listingName}`,
                timestamp: order.createdAt.toDate().toISOString(),
                icon: 'ShoppingCart'
            });
        });

        salesSnap.forEach(doc => {
            const sale = doc.data();
            activities.push({
                id: doc.id,
                type: 'Received an Order',
                title: `For: ${sale.listingName}`,
                timestamp: sale.createdAt.toDate().toISOString(),
                icon: 'CircleDollarSign'
            });
        });
        
        eventsSnap.forEach(doc => {
            const event = doc.data();
            activities.push({
                id: doc.id,
                type: `Logged Event: ${event.eventType}`,
                title: event.payload?.inputId || event.payload?.cropType || 'Traceability Update',
                timestamp: event.timestamp.toDate().toISOString(),
                icon: 'GitBranch'
            });
        });

        // Sort all activities by date and take the most recent 10
        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        return { activities: activities.slice(0, 10) };

    } catch (error) {
        console.error(`Error fetching activity for user ${userId}:`, error);
        throw new functions.https.HttpsError('internal', 'Could not fetch user activity.');
    }
});

export const getUserEngagementStats = functions.https.onCall(async (data, context) => {
    const userId = checkAuth(context);

    try {
        const viewsQuery = db.collection('profile_views').where('viewedId', '==', userId).get();
        const postsQuery = db.collection('posts').where('userId', '==', userId).get();

        const [viewsSnapshot, postsSnapshot] = await Promise.all([viewsQuery, postsQuery]);

        const profileViews = viewsSnapshot.size;

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
        throw new functions.https.HttpsError('internal', 'Could not fetch engagement statistics.');
    }
});
