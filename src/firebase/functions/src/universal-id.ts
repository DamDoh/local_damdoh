

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { v4 as uuidv4 } from "uuid";
import { getRole, checkAuth } from "./utils";
import { randomBytes } from 'crypto'; 
import { logInfo, logError } from './logging';
import { UserProfile } from "@/lib/types";

const db = admin.firestore();

/**
 * Triggered on new user creation to generate a unique, non-sensitive Universal ID.
 * This ID is then stored back into the user's document.
 */
export const generateUniversalIdOnUserCreate = functions.firestore
  .document("users/{userId}")
  .onCreate(async (snap, context) => {
    const userId = context.params.userId;
    const userData = snap.data();

    // Prevent function from running again if universalId already exists
    if (userData.universalId) {
      logInfo("User already has a Universal ID. Exiting function.", { userId });
      return null;
    }

    logInfo("Generating Universal ID for new user", { userId });

    // Generate a unique ID (UUID v4)
    const universalId = uuidv4();

    try {
      await snap.ref.update({
        universalId: universalId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      logInfo("Successfully assigned Universal ID to user", { userId, universalId });
      return null;
    } catch (error) {
      logError("Error updating user with Universal ID", { userId, error });
      return null;
    }
  });


/**
 * Securely retrieves a subset of a user's data based on their Universal ID.
 * The amount of data returned depends on the role of the person scanning the ID.
 */
export const getUniversalIdData = functions.https.onCall(async (data, context) => {
    const scannerUid = checkAuth(context);

    const { scannedUniversalId } = data;
    if (!scannedUniversalId) {
        throw new functions.https.HttpsError("invalid-argument", "A 'scannedUniversalId' must be provided.");
    }


    try {
        // Find the user document corresponding to the scanned Universal ID
        const usersRef = db.collection("users");
        const querySnapshot = await usersRef.where("universalId", "==", scannedUniversalId).limit(1).get();

        if (querySnapshot.empty) {
            throw new functions.https.HttpsError("not-found", "The scanned Universal ID does not correspond to any user.");
        }

        const scannedUserDoc = querySnapshot.docs[0];
        const scannedUserData = scannedUserDoc.data() as UserProfile;
        
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
        // This can be expanded with more granular permissions.
        if (scannerUid === scannedUserDoc.id) {
            // The user is scanning their own ID, return all non-sensitive data
            return {
                ...publicProfile,
                phoneNumber: scannedUserData.contactInfo?.phone, // Corrected field
                email: scannedUserData.email,
            };
        } else if (scannerRole === 'Field Agent/Agronomist (DamDoh Internal)' || scannerRole === 'Admin') {
            // An agent or admin gets more detailed information
            return {
                ...publicProfile,
                phoneNumber: scannedUserData.contactInfo?.phone, // Corrected field
                // Concept: Could also return linked farm data here
            };
        } else {
            // For any other authenticated user, just return the public profile
            return publicProfile;
        }

    } catch (error) {
        logError("Error retrieving Universal ID data", { scannerUid, scannedUniversalId, error });
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
    const agentUid = checkAuth(context);

    const { phoneNumber } = data;
    if (!phoneNumber) {
        throw new functions.https.HttpsError("invalid-argument", "A 'phoneNumber' must be provided.");
    }

    const agentRole = await getRole(agentUid);

    // Security Check: Only allow authorized roles to perform this lookup
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
        const foundUserData = foundUserDoc.data() as UserProfile;

        // Return a subset of data, similar to getUniversalIdData for an agent
        const userProfileSubset = {
            uid: foundUserDoc.id,
            universalId: foundUserData.universalId,
            displayName: foundUserData.displayName,
            primaryRole: foundUserData.primaryRole,
            avatarUrl: foundUserData.avatarUrl || null,
            location: foundUserData.location || null,
            phoneNumber: foundUserData.contactInfo?.phone,
        };
        
        return userProfileSubset;

    } catch (error) {
        logError("Error looking up user by phone", { agentUid, phoneNumber, error });
        if (error instanceof functions.https.HttpsError) throw error;
        throw new functions.https.HttpsError("internal", "An unexpected error occurred while searching for the user.");
    }
});


/**
 * Creates a temporary, secure session for account recovery.
 * The user provides their phone number to initiate this process.
 * The function returns a session ID and a value to be embedded in a temporary QR code.
 */
export const createRecoverySession = functions.https.onCall(async (data, context) => {
    const { phoneNumber } = data;
    if (!phoneNumber) {
        throw new functions.https.HttpsError("invalid-argument", "A 'phoneNumber' must be provided.");
    }
    
    // Find user by phone number
    const usersRef = db.collection("users");
    const querySnapshot = await usersRef.where("contactInfo.phone", "==", phoneNumber).limit(1).get();

    if (querySnapshot.empty) {
        throw new functions.https.HttpsError("not-found", `No user found with the phone number: ${phoneNumber}.`);
    }

    const userToRecoverDoc = querySnapshot.docs[0];
    
    // Generate a secure, short-lived session
    const sessionId = uuidv4();
    const recoverySecret = randomBytes(16).toString('hex'); // A secret that the friend's app will send back
    const recoveryQrValue = `damdoh:recover:${sessionId}:${recoverySecret}`; // Format: standard:action:sessionId:secret

    const sessionRef = db.collection('recovery_sessions').doc(sessionId);

    await sessionRef.set({
        sessionId,
        userIdToRecover: userToRecoverDoc.id,
        recoverySecret,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'pending', // pending -> confirmed -> completed
        confirmedBy: null, // UID of the friend who confirms
        expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + 10 * 60 * 1000), // Session expires in 10 minutes
    });

    return { sessionId, recoveryQrValue };
});


/**
 * Called by a logged-in user (the "friend") who has scanned the recovery QR code.
 * This function verifies the session and secret, and if valid, marks the recovery as confirmed.
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
    
    // Mark session as confirmed
    await sessionRef.update({
        status: 'confirmed',
        confirmedBy: friendUid,
    });
    
    // In a real application, the next step would be for the original user's device
    // to poll the session status. Once 'confirmed', it would request a custom auth token.
    // For this demo, we'll just return a success message.
    
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
