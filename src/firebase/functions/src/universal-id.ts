

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { v4 as uuidv4 } from "uuid";
import { getRole } from "./profiles";
import { randomBytes } from 'crypto'; // For generating a secret

const db = admin.firestore();

export const generateUniversalIdOnUserCreate = functions.firestore
  .document("users/{userId}")
  .onCreate(async (snap, context) => {
    const userId = context.params.userId;
    const userData = snap.data();

    if (userData.universalId) {
      console.log(`User ${userId} already has a Universal ID. Exiting function.`);
      return null;
    }

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

export const getUniversalIdData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "error.unauthenticated");
    }

    const { scannedUniversalId } = data;
    if (!scannedUniversalId) {
        throw new functions.https.HttpsError("invalid-argument", "error.universalId.required");
    }

    const scannerUid = context.auth.uid;

    try {
        const usersRef = db.collection("users");
        const querySnapshot = await usersRef.where("universalId", "==", scannedUniversalId).limit(1).get();

        if (querySnapshot.empty) {
            throw new functions.https.HttpsError("not-found", "error.universalId.notFound");
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
            return { ...publicProfile, email: scannedUserData.email };
        } else if (scannerRole === 'Field Agent/Agronomist (DamDoh Internal)' || scannerRole === 'Admin') {
            return { ...publicProfile, email: scannedUserData.email, phoneNumber: scannedUserData.phoneNumber };
        } else {
            return publicProfile;
        }

    } catch (error) {
        console.error("Error retrieving Universal ID data:", error);
        if (error instanceof functions.https.HttpsError) throw error;
        throw new functions.https.HttpsError("internal", "error.internal");
    }
});

export const lookupUserByPhone = functions.https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "error.unauthenticated");

    const { phoneNumber } = data;
    if (!phoneNumber) throw new functions.https.HttpsError("invalid-argument", "error.phone.required");

    const agentUid = context.auth.uid;
    const agentRole = await getRole(agentUid);
    const authorizedRoles = ['Field Agent/Agronomist (DamDoh Internal)', 'Admin', 'Operations/Logistics Team (DamDoh Internal)'];

    if (!agentRole || !authorizedRoles.includes(agentRole)) {
        throw new functions.https.HttpsError("permission-denied", "error.permissionDenied");
    }

    try {
        const usersRef = db.collection("users");
        const querySnapshot = await usersRef.where("phoneNumber", "==", phoneNumber).limit(1).get();
        if (querySnapshot.empty) throw new functions.https.HttpsError("not-found", "error.user.notFound");

        const foundUserDoc = querySnapshot.docs[0];
        const foundUserData = foundUserDoc.data();
        return {
            uid: foundUserDoc.id, universalId: foundUserData.universalId,
            displayName: foundUserData.displayName, primaryRole: foundUserData.primaryRole,
            avatarUrl: foundUserData.avatarUrl || null, location: foundUserData.location || null,
            phoneNumber: foundUserData.phoneNumber,
        };
    } catch (error) {
        console.error("Error looking up user by phone:", error);
        if (error instanceof functions.https.HttpsError) throw error;
        throw new functions.https.HttpsError("internal", "error.internal");
    }
});

export const createRecoverySession = functions.https.onCall(async (data, context) => {
    const { phoneNumber } = data;
    if (!phoneNumber) throw new functions.https.HttpsError("invalid-argument", "error.phone.required");
    
    const usersRef = db.collection("users");
    const querySnapshot = await usersRef.where("phoneNumber", "==", phoneNumber).limit(1).get();
    if (querySnapshot.empty) throw new functions.https.HttpsError("not-found", "error.user.notFound");

    const userToRecoverDoc = querySnapshot.docs[0];
    const sessionId = uuidv4();
    const recoverySecret = randomBytes(16).toString('hex');
    const recoveryQrValue = `damdoh:recover:${sessionId}:${recoverySecret}`;

    const sessionRef = db.collection('recovery_sessions').doc(sessionId);
    await sessionRef.set({
        sessionId, userIdToRecover: userToRecoverDoc.id, recoverySecret,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'pending', confirmedBy: null,
        expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + 10 * 60 * 1000),
    });
    return { sessionId, recoveryQrValue };
});

export const scanRecoveryQr = functions.https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "error.unauthenticated");

    const friendUid = context.auth.uid;
    const { sessionId, scannedSecret } = data;
    if (!sessionId || !scannedSecret) throw new functions.https.HttpsError("invalid-argument", "error.form.missingFields");

    const sessionRef = db.collection('recovery_sessions').doc(sessionId);
    const sessionDoc = await sessionRef.get();
    if (!sessionDoc.exists) throw new functions.https.HttpsError("not-found", "error.recovery.invalidSession");

    const sessionData = sessionDoc.data()!;
    if (new Date() > (sessionData.expiresAt as admin.firestore.Timestamp).toDate()) {
        await sessionRef.update({ status: 'expired' });
        throw new functions.https.HttpsError("deadline-exceeded", "error.recovery.expired");
    }
    if (sessionData.status !== 'pending') throw new functions.https.HttpsError("failed-precondition", "error.recovery.sessionUsed");
    if (sessionData.recoverySecret !== scannedSecret) throw new functions.https.HttpsError("permission-denied", "error.recovery.invalidCode");
    if (sessionData.userIdToRecover === friendUid) throw new functions.https.HttpsError("invalid-argument", "error.recovery.selfScan");
    
    await sessionRef.update({ status: 'confirmed', confirmedBy: friendUid });
    return { success: true, message: "Friend confirmation successful! The user can now proceed with their recovery.", recoveryComplete: true };
});
