
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import type { UserProfile } from "./types";

const db = admin.firestore();

const checkAuth = (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
  }
  return context.auth.uid;
};

// --- Connection Request Functions ---

export const sendConnectionRequest = functions.https.onCall(async (data, context) => {
    const requesterId = checkAuth(context);
    const { recipientId } = data;

    if (!recipientId) {
        throw new functions.https.HttpsError('invalid-argument', 'A recipientId must be provided.');
    }
    if (requesterId === recipientId) {
        throw new functions.https.HttpsError('invalid-argument', 'You cannot send a connection request to yourself.');
    }

    // Check if a request already exists
    const existingReqQuery = db.collection('connection_requests')
        .where('requesterId', '==', requesterId)
        .where('recipientId', '==', recipientId);
    
    const existingReqSnap = await existingReqQuery.get();
    if (!existingReqSnap.empty) {
        throw new functions.https.HttpsError('already-exists', 'A connection request has already been sent.');
    }

    const requestRef = db.collection('connection_requests').doc();
    await requestRef.set({
        requesterId,
        recipientId,
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, requestId: requestRef.id };
});

export const getPendingRequests = functions.https.onCall(async (data, context) => {
    const userId = checkAuth(context);

    const q = db.collection('connection_requests')
        .where('recipientId', '==', userId)
        .where('status', '==', 'pending')
        .orderBy('createdAt', 'desc');

    const snapshot = await q.get();

    if (snapshot.empty) {
        return { requests: [] };
    }

    const requesterIds = snapshot.docs.map(doc => doc.data().requesterId);
    const userProfiles = await db.collection('users').where(admin.firestore.FieldPath.documentId(), 'in', requesterIds).get();
    
    const profilesMap = new Map(userProfiles.docs.map(doc => [doc.id, doc.data() as UserProfile]));

    const requests = snapshot.docs.map(doc => {
        const reqData = doc.data();
        const profile = profilesMap.get(reqData.requesterId);
        return {
            id: doc.id,
            requester: {
                id: reqData.requesterId,
                displayName: profile?.displayName || 'Unknown User',
                avatarUrl: profile?.avatarUrl || null,
                primaryRole: profile?.primaryRole || 'Stakeholder',
            },
            createdAt: (reqData.createdAt as admin.firestore.Timestamp)?.toDate?.().toISOString(),
        };
    });

    return { requests };
});


export const respondToConnectionRequest = functions.https.onCall(async (data, context) => {
    const userId = checkAuth(context);
    const { requestId, response } = data; // response can be 'accepted' or 'declined'

    if (!requestId || !response) {
        throw new functions.https.HttpsError('invalid-argument', 'requestId and response are required.');
    }
    if (!['accepted', 'declined'].includes(response)) {
        throw new functions.https.HttpsError('invalid-argument', 'Response must be "accepted" or "declined".');
    }

    const requestRef = db.collection('connection_requests').doc(requestId);
    const requestSnap = await requestRef.get();

    if (!requestSnap.exists) {
        throw new functions.https.HttpsError('not-found', 'Connection request not found.');
    }
    const requestData = requestSnap.data()!;

    if (requestData.recipientId !== userId) {
        throw new functions.https.HttpsError('permission-denied', 'You are not the recipient of this request.');
    }
    if (requestData.status !== 'pending') {
        throw new functions.https.HttpsError('failed-precondition', 'This request has already been responded to.');
    }

    const batch = db.batch();

    batch.update(requestRef, { status: response });

    if (response === 'accepted') {
        const userRef = db.collection('users').doc(userId);
        const requesterRef = db.collection('users').doc(requestData.requesterId);
        
        batch.update(userRef, { connections: admin.firestore.FieldValue.arrayUnion(requestData.requesterId) });
        batch.update(requesterRef, { connections: admin.firestore.FieldValue.arrayUnion(userId) });
    }

    await batch.commit();

    return { success: true, message: `Request has been ${response}.` };
});


// --- Connection Management Functions ---

export const getConnections = functions.https.onCall(async (data, context) => {
    const userId = checkAuth(context);
    
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
         throw new functions.https.HttpsError('not-found', 'User profile not found.');
    }
    
    const connectionIds = userDoc.data()?.connections || [];
    
    if (connectionIds.length === 0) {
        return { connections: [] };
    }
    
    const connectionDocs = await db.collection('users').where(admin.firestore.FieldPath.documentId(), 'in', connectionIds).get();

    const connections = connectionDocs.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            displayName: data.displayName,
            avatarUrl: data.avatarUrl || null,
            primaryRole: data.primaryRole,
            profileSummary: data.profileSummary || ''
        }
    });

    return { connections };
});


export const removeConnection = functions.https.onCall(async (data, context) => {
    const userId = checkAuth(context);
    const { connectionId } = data;
    
    if (!connectionId) {
        throw new functions.https.HttpsError('invalid-argument', 'A connectionId must be provided.');
    }

    const userRef = db.collection('users').doc(userId);
    const connectionRef = db.collection('users').doc(connectionId);
    
    const batch = db.batch();
    batch.update(userRef, { connections: admin.firestore.FieldValue.arrayRemove(connectionId) });
    batch.update(connectionRef, { connections: admin.firestore.FieldValue.arrayRemove(userId) });

    await batch.commit();

    return { success: true, message: "Connection removed." };
});


// --- Invitation Functions for Growth ---

/**
 * Sends an invitation to a non-user. Placeholder for a full email implementation.
 */
export const sendInvite = functions.https.onCall(async (data, context) => {
  const inviterId = checkAuth(context);
  const { inviteeEmail } = data;

  if (!inviteeEmail || typeof inviteeEmail !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'A valid email address is required.');
  }

  // Placeholder logic: In a real app, you would generate a unique token,
  // store it with the invite details, and use a service like SendGrid
  // to send an email with a special sign-up link containing the token.
  const inviterProfile = await db.collection('users').doc(inviterId).get();
  const inviterName = inviterProfile.data()?.displayName || 'A DamDoh user';

  console.log(`Simulating sending invite from ${inviterName} (${inviterId}) to ${inviteeEmail}`);

  return { success: true, message: `An invitation has been sent to ${inviteeEmail}.` };
});
