

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { stakeholderProfileSchemas } from "./stakeholder-profile-data";
import { UserRole } from "./types";
import { v4 as uuidv4 } from "uuid";

const db = admin.firestore();

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
 * Fetches a user's profile from Firestore by their ID.
 * @param {string} uid The user's ID.
 * @return {Promise<any | null>} The user's profile data or null if not found.
 */
export const getProfileByIdFromDB = functions.https.onCall(async (data, context): Promise<any | null> => {
    const { uid } = data;
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
});


/**
 * Fetches all user profiles from the database.
 * NOTE: This is an admin-level function and should be protected by security rules.
 * @return {Promise<any[]>} A promise that resolves with an array of all user profiles.
 */
export const getAllProfilesFromDB = functions.https.onCall(async (data, context) => {
    checkAuth(context);
    // TODO: Add admin role check for production
    try {
        const usersSnapshot = await db.collection("users").get();
        const profiles = usersSnapshot.docs.map(doc => {
            const profileData = doc.data();
            return {
                id: doc.id,
                ...profileData,
                createdAt: (profileData.createdAt as admin.firestore.Timestamp)?.toDate ? (profileData.createdAt as admin.firestore.Timestamp).toDate().toISOString() : new Date().toISOString(),
                updatedAt: (profileData.updatedAt as admin.firestore.Timestamp)?.toDate ? (profileData.updatedAt as admin.firestore.Timestamp).toDate().toISOString() : new Date().toISOString(),
            };
        });
        return { profiles };
    } catch (error) {
        console.error("Error fetching all user profiles:", error);
        throw new functions.https.HttpsError("internal", "Could not fetch all profiles.");
    }
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
    // In a real app, this would:
    // 1. Gather all of the user's data from Firestore, Storage, etc.
    // 2. Package it into a file (e.g., JSON).
    // 3. Upload it to a secure, private Cloud Storage bucket.
    // 4. Generate a secure, time-limited download link.
    // 5. Email the link to the user's registered email address.
    return { success: true, message: "If an account with your email exists, a data export link will be sent shortly." };
});
