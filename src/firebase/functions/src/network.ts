

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import type { UserProfile } from "./types";

const db = admin.firestore();

const checkAuth = (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "error.unauthenticated");
  }
  return context.auth.uid;
};

// --- Connection Request Functions ---

export const sendConnectionRequest = functions.https.onCall(async (data, context) => {
    const requesterId = checkAuth(context);
    const { recipientId } = data;

    if (!recipientId) {
        throw new functions.https.HttpsError('invalid-argument', 'error.network.recipientRequired');
    }
    if (requesterId === recipientId) {
        throw new functions.https.HttpsError('invalid-argument', 'error.network.selfConnection');
    }
    
    const recipientDoc = await db.collection('users').doc(recipientId).get();
    if (!recipientDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'error.network.userNotFound');
    }

    // Check if users are already connected
    const connections = recipientDoc.data()?.connections || [];
    if (connections.includes(requesterId)) {
        throw new functions.https.HttpsError('already-exists', 'error.network.alreadyConnected');
    }

    // Check if a request already exists in either direction
    const requestQuery1 = db.collection('connection_requests')
        .where('requesterId', '==', requesterId)
        .where('recipientId', '==', recipientId).get();
    
    const requestQuery2 = db.collection('connection_requests')
        .where('requesterId', '==', recipientId)
        .where('recipientId', '==', requesterId).get();
        
    const [reqSnap1, reqSnap2] = await Promise.all([requestQuery1, requestQuery2]);

    if (!reqSnap1.empty || !reqSnap2.empty) {
        throw new functions.https.HttpsError('already-exists', 'error.network.requestExists');
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
    if (requesterIds.length === 0) return { requests: [] }; // Handle case where all requesters might be null/undefined

    const userProfiles = await db.collection('users').where(admin.firestore.FieldPath.documentId(), 'in', requesterIds).get();
    
    const profilesMap = new Map(userProfiles.docs.map(doc => [doc.id, doc.data() as UserProfile]));

    const requests = snapshot.docs.map(doc => {
        const reqData = doc.data();
        const profile = profilesMap.get(reqData.requesterId);
        if (!profile) return null; // Skip if profile not found for some reason

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
    }).filter(Boolean); // Filter out nulls

    return { requests };
});


export const respondToConnectionRequest = functions.https.onCall(async (data, context) => {
    const userId = checkAuth(context);
    const { requestId, response } = data; // response can be 'accepted' or 'declined'

    if (!requestId || !response) {
        throw new functions.https.HttpsError('invalid-argument', 'error.form.missingFields');
    }
    if (!['accepted', 'declined'].includes(response)) {
        throw new functions.https.HttpsError('invalid-argument', 'error.network.invalidResponse');
    }

    const requestRef = db.collection('connection_requests').doc(requestId);
    const requestSnap = await requestRef.get();

    if (!requestSnap.exists) {
        throw new functions.https.HttpsError('not-found', 'error.network.requestNotFound');
    }
    const requestData = requestSnap.data()!;

    if (requestData.recipientId !== userId) {
        throw new functions.https.HttpsError('permission-denied', 'error.permissionDenied');
    }
    if (requestData.status !== 'pending') {
        throw new functions.https.HttpsError('failed-precondition', 'error.network.requestAlreadyHandled');
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

    return { success: true, message: `Request has been ${response}ed.` };
});


// --- Connection Management Functions ---

export const getConnections = functions.https.onCall(async (data, context) => {
    const userId = checkAuth(context);
    
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
         throw new functions.https.HttpsError('not-found', 'error.user.notFound');
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
        throw new functions.https.HttpsError('invalid-argument', 'error.network.connectionIdRequired');
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
    throw new functions.https.HttpsError('invalid-argument', 'error.email.invalid');
  }

  const inviterProfile = await db.collection('users').doc(inviterId).get();
  const inviterName = inviterProfile.data()?.displayName || 'A DamDoh user';

  console.log(`Simulating sending invite from ${inviterName} (${inviterId}) to ${inviteeEmail}`);
  
  // Placeholder: In a real app, this would use an email service like SendGrid
  // to send a formatted invitation email with a unique sign-up link.
  
  return { success: true, message: `An invitation has been sent to ${inviteeEmail}.` };
});

// Used on the Network page to determine connection status between the current user and other profiles
export const getProfileConnectionStatuses = functions.https.onCall(async (data, context) => {
    const currentUserId = checkAuth(context);
    const { profileIds } = data;

    if (!Array.isArray(profileIds) || profileIds.length === 0) {
        return {};
    }

    const currentUserDoc = await db.collection('users').doc(currentUserId).get();
    const currentUserConnections = currentUserDoc.data()?.connections || [];
    
    const sentReqsQuery = db.collection('connection_requests')
        .where('requesterId', '==', currentUserId)
        .where('recipientId', 'in', profileIds)
        .where('status', '==', 'pending').get();
        
    const receivedReqsQuery = db.collection('connection_requests')
        .where('recipientId', '==', currentUserId)
        .where('requesterId', 'in', profileIds)
        .where('status', '==', 'pending').get();
        
    const [sentSnapshot, receivedSnapshot] = await Promise.all([sentReqsQuery, receivedReqsQuery]);
    
    const sentRequests = new Set(sentSnapshot.docs.map(doc => doc.data().recipientId));
    const receivedRequests = new Set(receivedSnapshot.docs.map(doc => doc.data().requesterId));

    const statuses: Record<string, 'connected' | 'pending_sent' | 'pending_received' | 'none'> = {};
    
    for (const profileId of profileIds) {
        if (currentUserConnections.includes(profileId)) {
            statuses[profileId] = 'connected';
        } else if (sentRequests.has(profileId)) {
            statuses[profileId] = 'pending_sent';
        } else if (receivedRequests.has(profileId)) {
            statuses[profileId] = 'pending_received';
        } else {
            statuses[profileId] = 'none';
        }
    }
    
    return statuses;
});
