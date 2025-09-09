"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeConnection = exports.getConnections = exports.respondToConnectionRequest = exports.getPendingRequests = exports.sendConnectionRequest = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
const checkAuth = (context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    return context.auth.uid;
};
// --- Connection Request Functions ---
exports.sendConnectionRequest = functions.https.onCall(async (data, context) => {
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
exports.getPendingRequests = functions.https.onCall(async (data, context) => {
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
    const profilesMap = new Map(userProfiles.docs.map(doc => [doc.id, doc.data()]));
    const requests = snapshot.docs.map(doc => {
        var _a, _b;
        const reqData = doc.data();
        const profile = profilesMap.get(reqData.requesterId);
        return {
            id: doc.id,
            requester: {
                id: reqData.requesterId,
                displayName: (profile === null || profile === void 0 ? void 0 : profile.displayName) || 'Unknown User',
                avatarUrl: (profile === null || profile === void 0 ? void 0 : profile.avatarUrl) || null,
                primaryRole: (profile === null || profile === void 0 ? void 0 : profile.primaryRole) || 'Stakeholder',
            },
            createdAt: (_b = (_a = reqData.createdAt) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a).toISOString(),
        };
    });
    return { requests };
});
exports.respondToConnectionRequest = functions.https.onCall(async (data, context) => {
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
    const requestData = requestSnap.data();
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
exports.getConnections = functions.https.onCall(async (data, context) => {
    var _a;
    const userId = checkAuth(context);
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'User profile not found.');
    }
    const connectionIds = ((_a = userDoc.data()) === null || _a === void 0 ? void 0 : _a.connections) || [];
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
        };
    });
    return { connections };
});
exports.removeConnection = functions.https.onCall(async (data, context) => {
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
//# sourceMappingURL=network.js.map