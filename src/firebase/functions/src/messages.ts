
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import type { UserProfile } from "./types";

const db = admin.firestore();

const checkAuth = (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
  }
  return context.auth.uid;
};

// This function now returns conversations for the authenticated user
export const getConversationsForUser = functions.https.onCall(async (data, context) => {
    const userId = checkAuth(context);
    
    // In a real app, you would have a more complex query.
    // This is a placeholder that simulates fetching conversations.
    const conversations = [
        { id: 'msg1', participant: { id: 'agriLogisticsCo', name: 'AgriLogistics Co-op', avatarUrl: 'https://placehold.co/40x40.png' }, lastMessage: 'Your grain shipment is confirmed...', lastMessageTimestamp: new Date(Date.now() - 3600000).toISOString(), unreadCount: 1 },
        { id: 'msg2', participant: { id: 'userA', name: 'Dr. Alima Bello', avatarUrl: 'https://placehold.co/40x40.png' }, lastMessage: 'Sounds good, let\'s proceed.', lastMessageTimestamp: new Date(Date.now() - 86400000).toISOString(), unreadCount: 0 },
        { id: 'msg3', participant: { id: 'freshProduceExporter', name: 'Amina Exports Ltd.', avatarUrl: 'https://placehold.co/40x40.png' }, lastMessage: 'Okay, I will review the documents.', lastMessageTimestamp: new Date(Date.now() - 172800000).toISOString(), unreadCount: 0 },
    ];
    
    return { conversations };
});


// This function now returns dummy messages for a specific conversation
export const getMessagesForConversation = functions.https.onCall(async (data, context) => {
    const userId = checkAuth(context);
    const { conversationId } = data;

    if (!conversationId) {
        throw new functions.https.HttpsError('invalid-argument', 'A conversationId must be provided.');
    }

    // Dummy messages. In a real app, you would query a subcollection.
    const allMessages: { [key: string]: any[] } = {
        'msg1': [
            { id: 'm1-1', conversationId, senderId: 'agriLogisticsCo', content: 'Your grain shipment is confirmed for Tuesday.', timestamp: new Date(Date.now() - 3600000).toISOString() },
            { id: 'm1-2', conversationId, senderId: userId, content: 'Great, thanks for the update!', timestamp: new Date(Date.now() - 3500000).toISOString() },
        ],
        'msg2': [
            { id: 'm2-1', conversationId, senderId: 'userA', content: 'Sounds good, let\'s proceed.', timestamp: new Date(Date.now() - 86400000).toISOString() }
        ],
         'msg3': [
            { id: 'm3-1', conversationId, senderId: 'freshProduceExporter', content: 'Okay, I will review the documents.', timestamp: new Date(Date.now() - 172800000).toISOString() }
        ],
    };
    
    const messages = allMessages[conversationId] || [];
    return { messages };
});


// Placeholder for sending a message
export const sendMessage = functions.https.onCall(async (data, context) => {
    const userId = checkAuth(context);
    const { conversationId, content } = data;
    if (!conversationId || !content) {
        throw new functions.https.HttpsError('invalid-argument', 'conversationId and content are required.');
    }
    // In a real app, you would add a new document to the messages subcollection 
    // and update the conversation's lastMessage field and timestamp.
    console.log(`User ${userId} sent message in conversation ${conversationId}: ${content}`);
    return { success: true };
});

// Placeholder for getting or creating a conversation
export const getOrCreateConversation = functions.https.onCall(async (data, context) => {
    const userId = checkAuth(context);
    const { recipientId } = data;
     if (!recipientId) {
        throw new functions.https.HttpsError('invalid-argument', 'A recipientId must be provided.');
    }
    // This function would look for an existing conversation between the two users.
    // If it doesn't exist, it would create one and return its ID.
    // For now, let's just pretend we found/created one.
    console.log(`Getting or creating conversation between ${userId} and recipient: ${recipientId}`);
    // This would typically return an existing or new conversation ID.
    // We return a predictable ID for the demo.
    const sortedIds = [userId, recipientId].sort();
    const conversationId = `conv_${sortedIds[0]}_${sortedIds[1]}`;
    return { conversationId };
});
