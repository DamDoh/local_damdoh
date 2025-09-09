

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { v4 as uuidv4 } from "uuid";
import { stakeholderProfileSchemas } from "@/lib/schemas"; // Corrected import
import { deleteCollectionByPath, getRole, checkAuth as checkAuthUtil } from './utils';
import { randomBytes } from 'crypto';

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
 * This is NOT a callable function. It's for other backend services to use.
 * @param {string} uid The user's ID.
 * @return {Promise<any | null>} The user's profile data or null if not found.
 */
export async function getUserProfile(uid: string): Promise<any | null> {
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
}

/**
 * Callable Cloud Function to get a user's profile from the client-side.
 */
export const getProfileByIdFromDB = functions.https.onCall(async (data, context) => {
    const { uid } = data;
    if (!uid) {
        throw new functions.https.HttpsError('invalid-argument', 'A uid must be provided.');
    }
    // This function is public, so no auth check is needed, but you might add one
    // if you want to restrict who can look up profiles.
    return await getUserProfile(uid);
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
                createdAt: (profileData.createdAt as admin.firestore.Timestamp)?.toDate ? (profileData.createdAt as admin.firestore.Timestamp).toDate().toISOString() : null,
                updatedAt: (profileData.updatedAt as admin.firestore.Timestamp)?.toDate ? (profileData.updatedAt as admin.firestore.Timestamp).toDate().toISOString() : null,
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

// =================================================================
// UNIVERSAL ID & RECOVERY FUNCTIONS
// =================================================================

/**
 * Securely retrieves a subset of a user's data based on their Universal ID.
 * The amount of data returned depends on the role of the person scanning the ID.
 */
export const getUniversalIdData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "You must be logged in to scan a Universal ID.");
    }

    const { scannedUniversalId } = data;
    if (!scannedUniversalId) {
        throw new functions.https.HttpsError("invalid-argument", "A 'scannedUniversalId' must be provided.");
    }

    const scannerUid = context.auth.uid;

    try {
        // Find the user document corresponding to the scanned Universal ID
        const usersRef = db.collection("users");
        const querySnapshot = await usersRef.where("universalId", "==", scannedUniversalId).limit(1).get();

        if (querySnapshot.empty) {
            throw new functions.https.HttpsError("not-found", "The scanned Universal ID does not correspond to any user.");
        }

        const scannedUserDoc = querySnapshot.docs[0];
        const scannedUserData = scannedUserDoc.data();
        
        // Get the role of the user who is doing the scanning
        const scannerRole = await getRole(scannerUid);

        // Define the public profile data that anyone can see
        const publicProfile = {
            uid: scannedUserDoc.id,
            universalId: scannedUserData.universalId,
            displayName: scannedUserData.displayName,
            primaryRole: scannedUserData.primaryRole,
            avatarUrl: scannedUserData.avatarUrl || null,
            location: scannedUserData.location || null,
        };

        // Here, we implement the Role-Based Access Control (RBAC) logic.
        if (scannerUid === scannedUserDoc.id) {
            return { ...publicProfile, phoneNumber: scannedUserData.phoneNumber, email: scannedUserData.email };
        } else if (scannerRole === 'Field Agent/Agronomist (DamDoh Internal)' || scannerRole === 'Admin') {
            return { ...publicProfile, phoneNumber: scannedUserData.phoneNumber };
        } else {
            return publicProfile;
        }

    } catch (error) {
        console.error("Error retrieving Universal ID data:", error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "An unexpected error occurred while fetching user data.");
    }
});


/**
 * Securely retrieves a user's data by their phone number for authorized agents.
 */
export const lookupUserByPhone = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "You must be logged in to perform this action.");
    }

    const { phoneNumber } = data;
    if (!phoneNumber) {
        throw new functions.https.HttpsError("invalid-argument", "A 'phoneNumber' must be provided.");
    }

    const agentUid = context.auth.uid;
    const agentRole = await getRole(agentUid);

    // Security Check: Only allow authorized roles to perform this lookup
    const authorizedRoles = ['Field Agent/Agronomist (DamDoh Internal)', 'Admin', 'Operations/Logistics Team (DamDoh Internal)'];
    if (!agentRole || !authorizedRoles.includes(agentRole)) {
        throw new functions.https.HttpsError("permission-denied", "You are not authorized to look up users by phone number.");
    }

    try {
        const usersRef = db.collection("users");
        const querySnapshot = await usersRef.where("phoneNumber", "==", phoneNumber).limit(1).get();

        if (querySnapshot.empty) {
            throw new functions.https.HttpsError("not-found", `No user found with the phone number: ${phoneNumber}.`);
        }

        const foundUserDoc = querySnapshot.docs[0];
        const foundUserData = foundUserDoc.data();

        return {
            uid: foundUserDoc.id,
            universalId: foundUserData.universalId,
            displayName: foundUserData.displayName,
            primaryRole: foundUserData.primaryRole,
            avatarUrl: foundUserData.avatarUrl || null,
            location: foundUserData.location || null,
            phoneNumber: foundUserData.phoneNumber,
        };
        
    } catch (error) {
        console.error("Error looking up user by phone:", error);
        if (error instanceof functions.https.HttpsError) throw error;
        throw new functions.https.HttpsError("internal", "An unexpected error occurred while searching for the user.");
    }
});


/**
 * Creates a temporary, secure session for account recovery.
 */
export const createRecoverySession = functions.https.onCall(async (data, context) => {
    const { phoneNumber } = data;
    if (!phoneNumber) {
        throw new functions.https.HttpsError("invalid-argument", "A 'phoneNumber' must be provided.");
    }
    
    const usersRef = db.collection("users");
    const querySnapshot = await usersRef.where("phoneNumber", "==", phoneNumber).limit(1).get();

    if (querySnapshot.empty) {
        throw new functions.https.HttpsError("not-found", `No user found with the phone number: ${phoneNumber}.`);
    }

    const userToRecoverDoc = querySnapshot.docs[0];
    
    const sessionId = uuidv4();
    const recoverySecret = randomBytes(16).toString('hex');
    const recoveryQrValue = `damdoh:recover:${sessionId}:${recoverySecret}`;

    const sessionRef = db.collection('recovery_sessions').doc(sessionId);

    await sessionRef.set({
        sessionId,
        userIdToRecover: userToRecoverDoc.id,
        recoverySecret,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'pending', 
        confirmedBy: null,
        expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + 10 * 60 * 1000), // Expires in 10 minutes
    });

    return { sessionId, recoveryQrValue };
});


/**
 * Called by a logged-in user (the "friend") who has scanned the recovery QR code.
 */
export const scanRecoveryQr = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "You must be logged in to help a friend recover their account.");
    }

    const friendUid = context.auth.uid;
    const { sessionId, scannedSecret } = data;

    if (!sessionId || !scannedSecret) {
        throw new functions.https.HttpsError("invalid-argument", "Session ID and secret are required.");
    }

    const sessionRef = db.collection('recovery_sessions').doc(sessionId);
    const sessionDoc = await sessionRef.get();

    if (!sessionDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Invalid recovery session.");
    }

    const sessionData = sessionDoc.data()!;
    const expiresAt = (sessionData.expiresAt as admin.firestore.Timestamp).toDate();

    if (new Date() > expiresAt) {
        await sessionRef.update({ status: 'expired' });
        throw new functions.https.HttpsError("deadline-exceeded", "This recovery session has expired. Please start over.");
    }
    
    if (sessionData.status !== 'pending') {
        throw new functions.https.HttpsError("failed-precondition", "This recovery session has already been used or is invalid.");
    }

    if (sessionData.recoverySecret !== scannedSecret) {
        throw new functions.https.HttpsError("permission-denied", "Invalid recovery code.");
    }
    
    if (sessionData.userIdToRecover === friendUid) {
        throw new functions.https.HttpsError("invalid-argument", "You cannot use your own recovery code.");
    }
    
    await sessionRef.update({
        status: 'confirmed',
        confirmedBy: friendUid,
    });
    
    return { success: true, message: "Friend confirmation successful! The user can now proceed with their recovery.", recoveryComplete: true };
});

/**
 * Called by the recovering user's device to finalize the process.
 */
export const completeRecovery = functions.https.onCall(async (data, context) => {
    const { sessionId } = data;
    if (!sessionId) {
        throw new functions.https.HttpsError('invalid-argument', 'A session ID is required.');
    }

    const sessionRef = db.collection('recovery_sessions').doc(sessionId);
    const sessionDoc = await sessionRef.get();

    if (!sessionDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Invalid recovery session.");
    }

    const sessionData = sessionDoc.data()!;
    if (sessionData.status !== 'confirmed') {
        throw new functions.https.HttpsError('failed-precondition', 'Session not yet confirmed by a friend.');
    }

    // Generate a custom auth token for the recovered user
    const customToken = await admin.auth().createCustomToken(sessionData.userIdToRecover);
    
    // Clean up the session
    await sessionRef.update({ status: 'completed' });

    return { success: true, customToken: customToken };
});
