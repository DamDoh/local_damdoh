

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { getProfileByIdFromDB } from './user';
import { getFunctions, httpsCallable } from 'firebase-functions/v1';

const db = admin.firestore();

const checkAuth = (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
  }
  return context.auth.uid;
};

// Gets or creates a conversation between the authenticated user and a recipient.
export const getOrCreateConversation = functions.https.onCall(async (data, context) => {
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
        const [userProfile, recipientProfile] = await Promise.all([
             getProfileByIdFromDB(userId),
             getProfileByIdFromDB(recipientId)
        ]);

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
export const getConversationsForUser = functions.https.onCall(async (data, context) => {
    const userId = checkAuth(context);
    
    const conversationsQuery = db.collection('conversations').where('participantIds', 'array-contains', userId).orderBy('lastMessageTimestamp', 'desc');
    const snapshot = await conversationsQuery.get();

    if (snapshot.empty) {
        return { conversations: [] };
    }

    const conversations = snapshot.docs.map(doc => {
        const data = doc.data();
        
        // Defensive coding: Ensure data structure is valid before accessing properties.
        const participantIds = data.participantIds || [];
        const participantInfo = data.participantInfo || {};
        const otherParticipantId = participantIds.find((id: string) => id !== userId);
        
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
            lastMessageTimestamp: (data.lastMessageTimestamp as admin.firestore.Timestamp)?.toDate?.().toISOString(),
            unreadCount: data.unreadCount?.[userId] || 0, // Placeholder for unread count logic
        };
    }).filter(Boolean); // Filter out any potentially null results from malformed data
    
    return { conversations };
});


// Fetches all messages for a specific conversation.
export const getMessagesForConversation = functions.https.onCall(async (data, context) => {
    const userId = checkAuth(context);
    const { conversationId } = data;

    if (!conversationId) {
        throw new functions.https.HttpsError('invalid-argument', 'A conversationId must be provided.');
    }

    // Security check: Ensure the user is part of this conversation
    const conversationRef = db.collection('conversations').doc(conversationId);
    const conversationSnap = await conversationRef.get();
    if (!conversationSnap.exists || !conversationSnap.data()?.participantIds.includes(userId)) {
        throw new functions.https.HttpsError('permission-denied', 'You are not a participant in this conversation.');
    }

    const messagesQuery = conversationRef.collection('messages').orderBy('timestamp', 'asc');
    const snapshot = await messagesQuery.get();
    
    const messages = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            conversationId: conversationId,
            senderId: data.senderId,
            content: data.content,
            timestamp: (data.timestamp as admin.firestore.Timestamp)?.toDate?.().toISOString(),
        }
    });

    return { messages };
});

// Sends a new message to a conversation.
export const sendMessage = functions.https.onCall(async (data, context) => {
    const userId = checkAuth(context);
    const { conversationId, content } = data;
    if (!conversationId || !content) {
        throw new functions.https.HttpsError('invalid-argument', 'conversationId and content are required.');
    }

    const conversationRef = db.collection('conversations').doc(conversationId);
    const conversationSnap = await conversationRef.get();
    if (!conversationSnap.exists || !conversationSnap.data()?.participantIds.includes(userId)) {
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
