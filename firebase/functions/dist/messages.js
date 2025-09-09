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
exports.sendMessage = exports.getMessagesForConversation = exports.getConversationsForUser = exports.getOrCreateConversation = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const profiles_1 = require("./profiles");
const db = admin.firestore();
const checkAuth = (context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    return context.auth.uid;
};
// Gets or creates a conversation between the authenticated user and a recipient.
exports.getOrCreateConversation = functions.https.onCall(async (data, context) => {
    const userId = checkAuth(context);
    const { recipientId } = data;
    if (!recipientId) {
        throw new functions.https.HttpsError('invalid-argument', 'A recipientId must be provided.');
    }
    if (userId === recipientId) {
        throw new functions.https.HttpsError('invalid-argument', 'Cannot create a conversation with yourself.');
    }
    const participantIds = [userId, recipientId].sort();
    const conversationId = participantIds.join('_');
    const conversationRef = db.collection('conversations').doc(conversationId);
    const conversationSnap = await conversationRef.get();
    if (!conversationSnap.exists) {
        // Fetch profiles to store basic info in the conversation doc for easier access
        const userProfile = await (0, profiles_1.getProfileByIdFromDB)(userId);
        const recipientProfile = await (0, profiles_1.getProfileByIdFromDB)(recipientId);
        if (!userProfile || !recipientProfile) {
            throw new functions.https.HttpsError('not-found', 'One or more user profiles could not be found.');
        }
        await conversationRef.set({
            participantIds,
            participantInfo: {
                [userId]: {
                    displayName: userProfile.displayName,
                    avatarUrl: userProfile.avatarUrl || null,
                },
                [recipientId]: {
                    displayName: recipientProfile.displayName,
                    avatarUrl: recipientProfile.avatarUrl || null,
                },
            },
            lastMessage: "Conversation started.",
            lastMessageTimestamp: admin.firestore.FieldValue.serverTimestamp(),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    }
    return { conversationId };
});
// Fetches all conversations for the authenticated user.
exports.getConversationsForUser = functions.https.onCall(async (data, context) => {
    const userId = checkAuth(context);
    const conversationsQuery = db.collection('conversations').where('participantIds', 'array-contains', userId).orderBy('lastMessageTimestamp', 'desc');
    const snapshot = await conversationsQuery.get();
    if (snapshot.empty) {
        return { conversations: [] };
    }
    const conversations = snapshot.docs.map(doc => {
        var _a, _b, _c;
        const data = doc.data();
        // Defensive coding: Ensure data structure is valid before accessing properties.
        const participantIds = data.participantIds || [];
        const participantInfo = data.participantInfo || {};
        const otherParticipantId = participantIds.find((id) => id !== userId);
        // Gracefully handle cases where the other participant might be missing.
        const otherParticipantInfo = (otherParticipantId ? participantInfo[otherParticipantId] : null) || { displayName: 'Unknown User', avatarUrl: '' };
        return {
            id: doc.id,
            participant: {
                id: otherParticipantId,
                name: otherParticipantInfo.displayName,
                avatarUrl: otherParticipantInfo.avatarUrl
            },
            lastMessage: data.lastMessage,
            lastMessageTimestamp: (_b = (_a = data.lastMessageTimestamp) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a).toISOString(),
            unreadCount: ((_c = data.unreadCount) === null || _c === void 0 ? void 0 : _c[userId]) || 0, // Placeholder for unread count logic
        };
    }).filter(Boolean); // Filter out any potentially null results from malformed data
    return { conversations };
});
// Fetches all messages for a specific conversation.
exports.getMessagesForConversation = functions.https.onCall(async (data, context) => {
    var _a;
    const userId = checkAuth(context);
    const { conversationId } = data;
    if (!conversationId) {
        throw new functions.https.HttpsError('invalid-argument', 'A conversationId must be provided.');
    }
    // Security check: Ensure the user is part of this conversation
    const conversationRef = db.collection('conversations').doc(conversationId);
    const conversationSnap = await conversationRef.get();
    if (!conversationSnap.exists || !((_a = conversationSnap.data()) === null || _a === void 0 ? void 0 : _a.participantIds.includes(userId))) {
        throw new functions.https.HttpsError('permission-denied', 'You are not a participant in this conversation.');
    }
    const messagesQuery = conversationRef.collection('messages').orderBy('timestamp', 'asc');
    const snapshot = await messagesQuery.get();
    const messages = snapshot.docs.map(doc => {
        var _a, _b;
        const data = doc.data();
        return {
            id: doc.id,
            conversationId: conversationId,
            senderId: data.senderId,
            content: data.content,
            timestamp: (_b = (_a = data.timestamp) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a).toISOString(),
        };
    });
    return { messages };
});
// Sends a new message to a conversation.
exports.sendMessage = functions.https.onCall(async (data, context) => {
    var _a;
    const userId = checkAuth(context);
    const { conversationId, content } = data;
    if (!conversationId || !content) {
        throw new functions.https.HttpsError('invalid-argument', 'conversationId and content are required.');
    }
    const conversationRef = db.collection('conversations').doc(conversationId);
    const conversationSnap = await conversationRef.get();
    if (!conversationSnap.exists || !((_a = conversationSnap.data()) === null || _a === void 0 ? void 0 : _a.participantIds.includes(userId))) {
        throw new functions.https.HttpsError('permission-denied', 'You are not a participant in this conversation.');
    }
    const messageRef = conversationRef.collection('messages').doc();
    const batch = db.batch();
    batch.set(messageRef, {
        senderId: userId,
        content: content,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    batch.update(conversationRef, {
        lastMessage: content,
        lastMessageTimestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    await batch.commit();
    return { success: true, messageId: messageRef.id };
});
//# sourceMappingURL=messages.js.map