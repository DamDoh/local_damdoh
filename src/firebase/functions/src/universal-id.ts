
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { v4 as uuidv4 } from "uuid";
import { getRole } from "./profiles";

const db = admin.firestore();

const checkAuth = (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
  }
  return context.auth.uid;
};

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
      console.log(`User ${userId} already has a Universal ID. Exiting function.`);
      return null;
    }

    console.log(`Generating Universal ID for new user: ${userId}`);

    // Generate a unique ID (UUID v4)
    const universalId = uuidv4();

    try {
      await snap.ref.update({
        universalId: universalId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`Successfully assigned Universal ID ${universalId} to user ${userId}.`);
      return null;
    } catch (error) {
      console.error(`Error updating user ${userId} with Universal ID:`, error);
      return null;
    }
  });


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
        // This can be expanded with more granular permissions.
        if (scannerUid === scannedUserDoc.id) {
            // The user is scanning their own ID, return all non-sensitive data
            return {
                ...publicProfile,
                phoneNumber: scannedUserData.phoneNumber, // Include phone number for self-scan
                email: scannedUserData.email,
            };
        } else if (scannerRole === 'Field Agent/Agronomist (DamDoh Internal)' || scannerRole === 'Admin') {
            // An agent or admin gets more detailed information
            return {
                ...publicProfile,
                phoneNumber: scannedUserData.phoneNumber,
                // Concept: Could also return linked farm data here
            };
        } else {
            // For any other authenticated user, just return the public profile
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

        // Return a subset of data, similar to getUniversalIdData for an agent
        const userProfileSubset = {
            uid: foundUserDoc.id,
            universalId: foundUserData.universalId,
            displayName: foundUserData.displayName,
            primaryRole: foundUserData.primaryRole,
            avatarUrl: foundUserData.avatarUrl || null,
            location: foundUserData.location || null,
            phoneNumber: foundUserData.phoneNumber,
        };
        
        return userProfileSubset;

    } catch (error) {
        console.error("Error looking up user by phone:", error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "An unexpected error occurred while searching for the user.");
    }
});


/**
 * Creates a secure, temporary recovery session for a user.
 */
export const createRecoverySession = functions.https.onCall(async (data, context) => {
    const { phoneNumber } = data;
    if (!phoneNumber) {
        throw new functions.https.HttpsError("invalid-argument", "A phoneNumber must be provided.");
    }

    try {
        const usersRef = db.collection("users");
        const querySnapshot = await usersRef.where("phoneNumber", "==", phoneNumber).limit(1).get();

        if (querySnapshot.empty) {
            throw new functions.https.HttpsError("not-found", `No user found with the phone number: ${phoneNumber}.`);
        }

        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        const recoveringUniversalId = userData.universalId;

        const sessionId = uuidv4();
        const recoveryQrSecret = uuidv4().substring(0, 8); // A short, unique secret for this session
        const recoveryQrValue = `damdoh:recover:${sessionId}:${recoveryQrSecret}`;
        
        const expiresAt = admin.firestore.Timestamp.fromMillis(Date.now() + 10 * 60 * 1000); // Session expires in 10 minutes

        const sessionRef = db.collection("recovery_sessions").doc(sessionId);
        await sessionRef.set({
            sessionId,
            recoveringUniversalId,
            recoveringUserId: userDoc.id,
            recoveryQrSecret,
            status: 'pending',
            requiredConfirmations: 2, // Example value
            confirmedBy: [],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            expiresAt,
        });

        return { sessionId, recoveryQrValue };
    } catch (error) {
         console.error("Error creating recovery session:", error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "An unexpected error occurred while creating the recovery session.");
    }
});

/**
 * Verifies a recovery QR code scanned by a trusted friend.
 */
export const scanRecoveryQr = functions.https.onCall(async (data, context) => {
    const friendUid = checkAuth(context);
    const { sessionId, scannedSecret } = data;
    if (!sessionId || !scannedSecret) {
        throw new functions.https.HttpsError("invalid-argument", "Session ID and secret are required.");
    }
    
    const sessionRef = db.collection("recovery_sessions").doc(sessionId);
    
    try {
        const result = await db.runTransaction(async (transaction) => {
            const sessionDoc = await transaction.get(sessionRef);

            if (!sessionDoc.exists) {
                throw new functions.https.HttpsError("not-found", "Recovery session not found or has expired.");
            }

            const sessionData = sessionDoc.data()!;

            if (sessionData.status !== 'pending') {
                throw new functions.https.HttpsError("failed-precondition", "This recovery session is no longer active.");
            }
            if (sessionData.expiresAt.toDate() < new Date()) {
                transaction.update(sessionRef, { status: 'expired' });
                throw new functions.https.HttpsError("deadline-exceeded", "This recovery session has expired.");
            }

            if (sessionData.recoveryQrSecret !== scannedSecret) {
                throw new functions.https.HttpsError("permission-denied", "Invalid recovery code.");
            }

            const confirmedBy = sessionData.confirmedBy || [];
            if (confirmedBy.includes(friendUid)) {
                return { success: true, message: "You have already confirmed this recovery." };
            }
            
            const newConfirmedBy = [...confirmedBy, friendUid];
            
            const requiredConfirmations = sessionData.requiredConfirmations || 2;
            let newStatus = sessionData.status;
            let recoveryComplete = false;
            
            if (newConfirmedBy.length >= requiredConfirmations) {
                newStatus = 'confirmed';
                recoveryComplete = true;
            }
            
            transaction.update(sessionRef, {
                confirmedBy: newConfirmedBy,
                status: newStatus,
            });

            return {
                success: true,
                recoveryComplete,
                message: recoveryComplete ? "Recovery confirmed! The user can now regain access." : `Confirmation successful. ${requiredConfirmations - newConfirmedBy.length} more needed.`
            };
        });

        return result;

    } catch(error) {
        console.error("Error during recovery scan:", error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "An unexpected error occurred while confirming recovery.");
    }
});
