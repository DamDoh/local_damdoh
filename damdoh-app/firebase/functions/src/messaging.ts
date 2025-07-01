/**
 * =================================================================
 * Module 5 Sub-Module: Direct Messaging
 * =================================================================
 * This module handles all real-time, one-on-one, and group chat
 * functionalities within the DamDoh platform. It enables seamless
 * communication between any two stakeholders, crucial for negotiations,
 * support, and building relationships.
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { getProfileByIdFromDB } from "./profiles";

const db = admin.firestore();


// ================== MESSAGING ==================

/**
 * Gets all conversations for the currently authenticated user.
 */
export const getConversationsForUser = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
    }
    const uid = context.auth.uid;

    const conversationsRef = db.collection('conversations');
    const q = conversationsRef.where('participantIds', 'array-contains', uid).orderBy('lastMessageTimestamp', 'desc');

    const snapshot = await q.get();
    if (snapshot.empty) {
        return { conversations: [] };
    }

    const conversations = await Promise.all(snapshot.docs.map(async doc => {
        const data = doc.data();
        const otherParticipantId = data.participantIds.find((pId: string) => pId !== uid);
        const otherParticipantInfo = await getProfileByIdFromDB(otherParticipantId);

        return {
            id: doc.id,
            participant: {
                id: otherParticipantId,
                name: otherParticipantInfo?.displayName || 'Unknown User',
                avatarUrl: otherParticipantInfo?.photoURL || '',
            },
            lastMessage: data.lastMessage,
            lastMessageTimestamp: (data.lastMessageTimestamp as admin.firestore.Timestamp).toDate().toISOString(),
            unreadCount: 0, // Simplified for now
        };
    }));

    return { conversations };
});

/**
 * Gets all messages for a specific conversation.
 */
export const getMessagesForConversation = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
    }
    const { conversationId } = data;
    if (!conversationId) {
        throw new functions.https.HttpsError("invalid-argument", "A conversationId must be provided.");
    }
    
    // Security Check: ensure user is part of the conversation
    const convoRef = db.collection('conversations').doc(conversationId);
    const convoSnap = await convoRef.get();
    if (!convoSnap.exists || !convoSnap.data()?.participantIds.includes(context.auth.uid)) {
        throw new functions.https.HttpsError("permission-denied", "You do not have access to this conversation.");
    }

    const messagesRef = convoRef.collection('messages').orderBy('timestamp', 'asc');
    const snapshot = await messagesRef.get();
    const messages = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            timestamp: (data.timestamp as admin.firestore.Timestamp).toDate().toISOString(),
        };
    });

    return { messages };
});

/**
 * Sends a message to a conversation.
 */
export const sendMessage = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
    }
    const { conversationId, content } = data;
    if (!conversationId || !content) {
        throw new functions.https.HttpsError("invalid-argument", "conversationId and content are required.");
    }

    const uid = context.auth.uid;
    const convoRef = db.collection('conversations').doc(conversationId);

    // Security check
    const convoSnap = await convoRef.get();
    if (!convoSnap.exists || !convoSnap.data()?.participantIds.includes(uid)) {
        throw new functions.https.HttpsError("permission-denied", "You do not have access to this conversation.");
    }

    const message = {
        senderId: uid,
        content: content,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };
    
    await convoRef.collection('messages').add(message);
    await convoRef.update({
        lastMessage: content,
        lastMessageTimestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
});

/**
 * Finds an existing conversation between two users or creates a new one.
 */
export const getOrCreateConversation = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
    }
    const { recipientId } = data;
    if (!recipientId) {
        throw new functions.https.HttpsError("invalid-argument", "A recipientId must be provided.");
    }

    const uid = context.auth.uid;
    if (uid === recipientId) {
         throw new functions.https.HttpsError("invalid-argument", "Cannot start a conversation with yourself.");
    }

    const participantIds = [uid, recipientId].sort(); // Sort to ensure consistent query ID
    
    const conversationsRef = db.collection('conversations');
    const q = conversationsRef.where('participantIds', '==', participantIds);
    
    const snapshot = await q.get();

    if (!snapshot.empty) {
        // Conversation already exists
        const doc = snapshot.docs[0];
        return { conversationId: doc.id, isNew: false };
    } else {
        // Create new conversation
        const [userProfileSnap, recipientProfileSnap] = await Promise.all([
            db.collection('users').doc(uid).get(),
            db.collection('users').doc(recipientId).get()
        ]);
        
        if (!userProfileSnap.exists() || !recipientProfileSnap.exists()) {
            throw new functions.https.HttpsError("not-found", "One or both user profiles not found.");
        }

        const newConversation = {
            participantIds,
            participantInfo: {
                [uid]: { name: userProfileSnap.data()?.displayName, photoURL: userProfileSnap.data()?.photoURL || null },
                [recipientId]: { name: recipientProfileSnap.data()?.displayName, photoURL: recipientProfileSnap.data()?.photoURL || null }
            },
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            lastMessageTimestamp: admin.firestore.FieldValue.serverTimestamp(),
            lastMessage: "Conversation started.",
        };
        const newConvoRef = await conversationsRef.add(newConversation);
        return { conversationId: newConvoRef.id, isNew: true };
    }
});
