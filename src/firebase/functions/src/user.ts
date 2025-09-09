

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { v4 as uuidv4 } from "uuid";
import { stakeholderProfileSchemas } from '@/lib/schemas'; // Corrected import
import { deleteCollectionByPath, getRole, checkAuth } from './utils';
import { randomBytes } from 'crypto';
import { logInfo, logError } from './logging';

const db = admin.firestore();

/**
 * Triggered on new Firebase Authentication user creation.
 * Creates a corresponding user document in Firestore with default values.
 */
export const onUserCreate = functions.auth.user().onCreate(async (user) => {
    logInfo("New user signed up, creating Firestore profile.", { uid: user.uid, email: user.email });

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
        logInfo("Successfully created Firestore profile for user.", { uid: user.uid });
        return null;
    } catch (error) {
        logError("Error creating Firestore profile for user", { uid: user.uid, error });
        return null;
    }
});


/**
 * Triggered when a user deletes their Firebase Authentication account.
 * Performs a "cascade delete" to remove all user data from Firestore.
 */
export const onUserDeleteCleanup = functions.auth.user().onDelete(async (user) => {
    logInfo("User account deleted, starting data cleanup.", { uid: user.uid });
    const uid = user.uid;
    const batchSize = 200;

    const collectionsToDelete = [
        { name: 'posts', userIdField: 'userId' },
        { name: 'marketplaceItems', userIdField: 'sellerId' },
        { name: 'farms', userIdField: 'ownerId' },
        { name: 'crops', userIdField: 'ownerId' },
    ];

    try {
        const promises: Promise<any>[] = [];
        for (const collection of collectionsToDelete) {
            const query = db.collection(collection.name).where(collection.userIdField, '==', uid);
            const snapshot = await query.get();
            if (!snapshot.empty) {
                logInfo(`Deleting ${snapshot.size} documents from '${collection.name}' for user ${uid}.`);
                const deletePromise = Promise.all(snapshot.docs.map(doc => doc.ref.delete()));
                promises.push(deletePromise);
            }
        }
        
        promises.push(db.collection('users').doc(uid).delete());
        promises.push(deleteCollectionByPath(`users/${uid}/workers`, batchSize));
        promises.push(db.collection('credit_scores').doc(uid).delete());

        await Promise.all(promises);
        logInfo("Successfully completed data cleanup for user.", { uid });
        return null;

    } catch (error) {
        logError("Error cleaning up data for user", { uid, error });
        return null;
    }
});


/**
 * Validates profile data against Zod schemas based on role.
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
    return result.data;
  }
  return data || {};
};


/**
 * Creates or updates a detailed stakeholder profile.
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
      throw new functions.https.HttpsError("invalid-argument", "A primary role must be provided.");
    }

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
      if (validatedProfileData) updatePayload.profileData = validatedProfileData;

      await userRef.set(updatePayload, {merge: true});
      logInfo("Profile updated successfully", { userId });
      return {status: "success", message: "Profile updated successfully."};
    } catch (error: any) {
      logError("Error upserting stakeholder profile", { userId, error: error.message });
       if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      throw new functions.https.HttpsError(
        "internal",
        "Failed to write to the database.",
        {originalError: error.message},
      );
    }
  },
);

/**
 * Fetches a user's profile from Firestore by their ID for backend use.
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
        
        return {
            id: userDoc.id,
            ...profileData,
            createdAt: (profileData.createdAt as admin.firestore.Timestamp)?.toDate?.().toISOString(),
            updatedAt: (profileData.updatedAt as admin.firestore.Timestamp)?.toDate?.().toISOString(),
        };
    } catch (error) {
        logError("Error fetching user profile by ID", { uid, error });
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
    return await getUserProfile(uid);
});


/**
 * Fetches all user profiles from the database.
 */
export const getAllProfilesFromDB = functions.https.onCall(async (data, context) => {
    checkAuth(context);
    try {
        const usersSnapshot = await db.collection("users").get();
        const profiles = usersSnapshot.docs.map(doc => {
            const profileData = doc.data();
            return {
                id: doc.id,
                ...profileData,
                createdAt: (profileData.createdAt as admin.firestore.Timestamp)?.toDate?.().toISOString(),
                updatedAt: (profileData.updatedAt as admin.firestore.Timestamp)?.toDate?.().toISOString(),
            };
        });
        return { profiles };
    } catch (error) {
        logError("Error fetching all user profiles", { error });
        throw new functions.https.HttpsError("internal", "Could not fetch all profiles.");
    }
});

export const deleteUserAccount = functions.https.onCall(async (data, context) => {
    const uid = checkAuth(context);
    logInfo("User requested account deletion", { uid });
    try {
        await admin.auth().deleteUser(uid);
        logInfo("Successfully deleted Firebase Auth user. `onDelete` trigger will handle data cleanup.", { uid });
        return { success: true, message: "Account deletion process initiated." };
    } catch (error) {
        logError("Error deleting auth user", { uid, error });
        throw new functions.https.HttpsError("internal", "Failed to delete user account.");
    }
});

export const requestDataExport = functions.https.onCall(async (data, context) => {
    const uid = checkAuth(context);
    logInfo("User has requested a data export.", { uid });
    return { success: true, message: "If an account with your email exists, a data export link will be sent shortly." };
});

// =================================================================
// UNIVERSAL ID & RECOVERY FUNCTIONS
// =================================================================

/**
 * Securely retrieves a subset of a user's data based on their Universal ID.
 */
export const getUniversalIdData = functions.https.onCall(async (data, context) => {
    const scannerUid = checkAuth(context);
    const { scannedUniversalId } = data;
    if (!scannedUniversalId) {
        throw new functions.https.HttpsError("invalid-argument", "A 'scannedUniversalId' must be provided.");
    }

    try {
        const usersRef = db.collection("users");
        const querySnapshot = await usersRef.where("universalId", "==", scannedUniversalId).limit(1).get();

        if (querySnapshot.empty) {
            throw new functions.https.HttpsError("not-found", "The scanned Universal ID does not correspond to any user.");
        }

        const scannedUserDoc = querySnapshot.docs[0];
        const scannedUserData = scannedUserDoc.data();
        
        const scannerRole = await getRole(scannerUid);

        const publicProfile = {
            uid: scannedUserDoc.id,
            universalId: scannedUserData.universalId,
            displayName: scannedUserData.displayName,
            primaryRole: scannedUserData.primaryRole,
            avatarUrl: scannedUserData.avatarUrl || null,
            location: scannedUserData.location || null,
        };

        if (scannerUid === scannedUserDoc.id) {
            return { ...publicProfile, phoneNumber: scannedUserData.contactInfo?.phone, email: scannedUserData.email };
        } else if (scannerRole === 'Field Agent/Agronomist (DamDoh Internal)' || scannerRole === 'Admin') {
            return { ...publicProfile, phoneNumber: scannedUserData.contactInfo?.phone };
        } else {
            return publicProfile;
        }

    } catch (error) {
        logError("Error retrieving Universal ID data", { scannerUid, scannedUniversalId, error });
        if (error instanceof functions.https.HttpsError) throw error;
        throw new functions.https.HttpsError("internal", "An unexpected error occurred while fetching user data.");
    }
});


/**
 * Securely retrieves a user's data by their phone number for authorized agents.
 */
export const lookupUserByPhone = functions.https.onCall(async (data, context) => {
    const agentUid = checkAuth(context);
    const { phoneNumber } = data;
    if (!phoneNumber) {
        throw new functions.https.HttpsError("invalid-argument", "A 'phoneNumber' must be provided.");
    }

    const agentRole = await getRole(agentUid);
    const authorizedRoles = ['Field Agent/Agronomist (DamDoh Internal)', 'Admin', 'Operations/Logistics Team (DamDoh Internal)'];
    if (!agentRole || !authorizedRoles.includes(agentRole)) {
        throw new functions.https.HttpsError("permission-denied", "You are not authorized to look up users by phone number.");
    }

    try {
        const usersRef = db.collection("users");
        const querySnapshot = await usersRef.where("contactInfo.phone", "==", phoneNumber).limit(1).get();

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
            phoneNumber: foundUserData.contactInfo?.phone,
        };
        
    } catch (error) {
        logError("Error looking up user by phone", { agentUid, phoneNumber, error });
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
    const querySnapshot = await usersRef.where("contactInfo.phone", "==", phoneNumber).limit(1).get();

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
    const friendUid = checkAuth(context);
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
