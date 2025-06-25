import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Assuming admin and db are initialized in index.ts or a shared file
// import { db } from './index';

const db = admin.firestore();
const messaging = admin.messaging();

// Import necessary functions/types from module2 (for user data and FCM tokens)
// import { getUserDocument } from './module2'; // Assuming this function exists

// Helper function to get user document (Assuming this is implemented elsewhere or as a placeholder)
async function getUserDocument(uid: string): Promise<FirebaseFirestore.DocumentSnapshot | null> {
    try {
        const userDoc = await db.collection('users').doc(uid).get();
        return userDoc.exists ? userDoc : null;
    } catch (error) {
        console.error('Error getting user document:', error);
        return null;
    }
}

// --- Cross-Cutting Notification System ---

// This file contains backend components for managing notifications across modules.


// 1. Conceptual Data Model for the 'notifications' Collection
// This is represented conceptually below and in the triggered function implementation.
/*
interface Notification {
  notificationId: string; // Unique identifier for the notification (document ID)
  userId: string; // ID of the target user
  type: 'new_message' | 'new_order' | 'farm_alert' | 'claim_update' | 'recommendation' | 'event_reminder' | 'compliance_alert'; // Type of notification
  title_en: string; // Notification title in English
  title_local: { [key: string]: string }; // Localized titles
  body_en: string; // Notification body in English
  body_local: { [key: string]: string }; // Localized bodies
  timestamp: admin.firestore.FieldValue; // Timestamp of notification creation
  isRead: boolean; // Status of the notification (read or unread)
  linkedEntity: { // Reference or details of the linked document
    collection: string;
    documentId: string;
    // Optional: Add reference itself if needed: ref: FirebaseFirestore.DocumentReference;
  } | null;
  // Add other relevant notification details (e.g., priority, icon)
}
*/

// 2. Triggered Function Placeholder for creating and sending notifications

// NOTE: You will need to configure specific triggers in your Firebase project
// for relevant events in OTHER modules. Examples:
// - onCreate of a message in conversations/{convId}/messages/{messageId} (Module 6)
// - onCreate of an order in orders/{orderId} (Module 4)
// - onCreate of a farmer_alerts/{alertId} (Module 3)
// - onUpdate of a claims/{claimId} when status changes (Module 11)
// - onCreate of a user_recommendations document (or when new recommendations are generated) (Module 5)
// - onUpdate of an events/{eventId} or attendees/{attendeeId} for reminders (Module 10)
// - onCreate of a generated_reports or submission_logs for compliance (Module 10)

// Generic trigger placeholder - refine based on actual triggers needed
export const onDataChangeCreateNotification = functions.firestore
    .document('{collectionId}/{documentId}')
    .onWrite(async (change, context) => {
        const collectionId = context.params.collectionId;
        const documentId = context.params.documentId;
        const triggerData = change.after.exists ? change.after.data() : null;
        const oldTriggerData = change.before.exists ? change.before.data() : null;

        // Only process document creations or updates with relevant data
        if (!triggerData) {
             console.log(`Document ${collectionId}/${documentId} deleted. No notification creation needed.`);
             return null;
        }

        console.log(`Notification trigger received for: ${collectionId}/${documentId}`);

        let targetUserId: string | null = null;
        let notificationType: 'new_message' | 'new_order' | 'farm_alert' | 'claim_update' | 'recommendation' | 'event_reminder' | 'compliance_alert' | 'other' = 'other';
        let title_en = 'New Activity';
        let title_local: { [key: string]: string } = {};
        let body_en = 'There is new activity on the platform.';
        let body_local: { [key: string]: string } = {};
        let linkedEntity: { collection: string; documentId: string; } | null = { collection: collectionId, documentId: documentId };

        // --- Logic to identify target user, type, and content based on the trigger ---
        // This is a crucial part and needs to be expanded for each specific trigger scenario.

        if (collectionId === 'messages' && triggerData.conversationRef?.id && triggerData.senderRef?.id && change.type === 'create') {
             // Triggered by a new message (Module 6)
             const conversationId = triggerData.conversationRef.id;
             const senderId = triggerData.senderRef.id;

             // Fetch the conversation document to get participants and exclude the sender
             const conversationDoc = await db.collection('conversations').doc(conversationId).get();
             if (conversationDoc.exists) {
                 const participants = conversationDoc.data()?.participants || [];
                 const recipientIds = participants.filter((uid: string) => uid !== senderId);

                 // For simplicity here, we'll notify all recipients.
                 // In a real app, you'd handle group chats and notification preferences.
                 if (recipientIds.length > 0) {
                     targetUserId = recipientIds[0]; // Example: Notify just the first recipient

                     // TODO: Expand to notify ALL recipientIds
                     // recipientIds.forEach(id => createAndSendNotification(id, ...));
                 }

                 // Construct notification content
                 notificationType = 'new_message';
                 // TODO: Fetch sender's name from Module 2
                 const senderName = "A user"; // Placeholder
                 title_en = `New Message from ${senderName}`;
                 body_en = triggerData.content.substring(0, 100); // Truncate long messages
                 // TODO: Generate localized titles and bodies based on recipient's language preferences (from Module 2)
                 // body_local = generateLocalizedMessageBody(triggerData.content, recipientLanguage);
                 linkedEntity = { collection: 'conversations', documentId: conversationId };

             } else {
                 console.warn(`Conversation ${conversationId} not found for message ${documentId}. Cannot notify.`);
                 return null; // Cannot proceed without conversation data
             }


        } else if (collectionId === 'orders' && triggerData.sellerRef?.id && change.type === 'create') {
             // Triggered by a new order (Module 4)
             targetUserId = triggerData.sellerRef.id; // Notify the seller
             notificationType = 'new_order';
             // TODO: Fetch buyer's name from Module 2
             const buyerName = "A buyer"; // Placeholder
             title_en = `New Order from ${buyerName}`;
             // TODO: Fetch product name from Module 1/4 listing
             const productName = "a product"; // Placeholder
             body_en = `You have a new order for ${productName}.`;
             linkedEntity = { collection: 'orders', documentId: documentId };
             // TODO: Generate localized titles and bodies


        } else if (collectionId === 'farmer_alerts' && triggerData.farmerRef?.id && change.type === 'create') {
            // Triggered by a new farm alert (Module 3)
            targetUserId = triggerData.farmerRef.id; // Notify the farmer
            notificationType = 'farm_alert';
            title_en = `Farm Alert: ${triggerData.type}`;
            body_en = triggerData.message_en; // Use English message from alert data
             linkedEntity = { collection: 'farmer_alerts', documentId: documentId };
            // TODO: Use triggerData.message_local for localized bodies


        } else if (collectionId === 'claims' && triggerData.policyholderRef?.id && change.type === 'update' && triggerData.status !== oldTriggerData?.status) {
            // Triggered by a claim status update (Module 11)
            targetUserId = triggerData.policyholderRef.id; // Notify the policyholder
            notificationType = 'claim_update';
            title_en = `Claim Status Updated: ${claimId}`;
            body_en = `Your claim status has changed to ${triggerData.status}.`;
             linkedEntity = { collection: 'claims', documentId: documentId };
            // TODO: Generate localized titles and bodies


        } else if (collectionId === 'user_recommendations' && triggerData.userId && change.type === 'create') {
            // Triggered by new recommendations (Module 5)
             targetUserId = triggerData.userId;
             notificationType = 'recommendation';
             title_en = 'New Learning Recommendations';
             body_en = 'Check out personalized content suggested for you.';
             linkedEntity = null; // Recommendations might not link to a single entity directly


        }
        // TODO: Add conditions for other trigger sources (Module 10 events, etc.)


        // If a target user was identified, create and attempt to send the notification
        if (targetUserId) {
             console.log(`Creating and sending notification for user ${targetUserId}, type: ${notificationType}`);
             const userDoc = await getUserDocument(targetUserId);
             const userFCMToken = userDoc?.data()?.fcmToken; // Assume FCM token is stored in user document


            // 3. Create a new document in the 'notifications' collection
            const newNotificationRef = db.collection('notifications').doc();
            await newNotificationRef.set({
                notificationId: newNotificationRef.id,
                userId: targetUserId,
                type: notificationType,
                title_en: title_en,
                title_local: title_local, // Store potentially empty local object
                body_en: body_en,
                body_local: body_local, // Store potentially empty local object
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                isRead: false,
                linkedEntity: linkedEntity,
                 // Add other initial notification fields
            });
             console.log(`Notification document created for user ${targetUserId}: ${newNotificationRef.id}`);


            // 4. Send Push Notification (Placeholder - requires FCM token)
            if (userFCMToken) {
                 console.log(`Attempting to send FCM push notification to user ${targetUserId}...`);
                const message: admin.messaging.Message = {
                    notification: {
                        title: title_en, // Use English title for FCM notification payload, localization handled on client
                        body: body_en, // Use English body for FCM notification payload
                    },
                    data: { // Custom data payload for the app
                         notificationId: newNotificationRef.id,
                         type: notificationType,
                         linkedCollection: linkedEntity?.collection || '',
                         linkedDocumentId: linkedEntity?.documentId || '',
                         // Include localized titles/bodies in data payload for client localization
                         title_en: title_en,
                         ...title_local,
                         body_en: body_en,
                         ...body_local,
                    },
                    token: userFCMToken,
                };

                try {
                     const response = await messaging.send(message);
                     console.log('Successfully sent FCM message:', response);
                     // TODO: Log success or update notification document status


                } catch (error) {
                     console.error('Error sending FCM message:', error);
                     // TODO: Log error or update notification document status
                     // Consider handling invalid tokens (e.g., removing them from the user document)
                }
            } else {
                console.log(`User ${targetUserId} does not have an FCM token. Storing notification only.`);
            }
        } else {
             console.log(`No target user identified for notification triggered by ${collectionId}/${documentId}.`);
        }


        return null; // Indicate successful completion

    });


// Integrated from communication.ts: Sends a push notification to specified users or a topic via Firebase Cloud Messaging (FCM).
// Requires strong authorization to prevent abuse.
export const sendNotification = functions.https.onCall(async (data, context) => {
  // 1. Ensure the request is authenticated and authorized.
  // This is a crucial security step. Replace with your actual authorization logic.
  // Example: Check if the caller is an authenticated user with a specific role,
  // or if the call is coming from a trusted service account (e.g., via a custom header).
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  // Example authorization check (replace with your actual logic):
  // const callerUid = context.auth.uid;
  // const callerUser = await admin.auth().getUser(callerUid);
  // if (!callerUser.customClaims || !callerUser.customClaims.isTrustedService) {
  //   throw new functions.https.HttpsError(
  //     'permission-denied',
  //     'The caller does not have permission to send notifications.'
  //   );
  // }

  const { targetUserIds, topic, title, body, data: payload } = data;

  // 2. Validate the input data.
  if (!targetUserIds && !topic) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Either targetUserIds or topic must be provided.'
    );
  }
  if (!title || !body) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Title and body are required for the notification.'
    );
  }

  const message: admin.messaging.Message = {
    notification: {
      title: title,
      body: body,
    },
    data: payload, // Optional data payload
  };

  try {
    let response;
    // 3. Use the Firebase Admin SDK to send the push notification.
    if (targetUserIds && targetUserIds.length > 0) {
      // Sending to specific devices associated with user UIDs.
      // You would typically fetch the FCM registration tokens for these user UIDs from your database.
      // For this example, we'll assume targetUserIds directly correspond to registration tokens for simplicity,
      // but in a real app, you need to manage token registration and retrieval.
      // This part needs to be adjusted based on how you store user device tokens.

      // *** Placeholder for fetching FCM tokens for targetUserIds ***
      // Example: Query a 'fcmTokens' collection where document IDs are user UIDs
      // and each document contains an array of tokens or a map of tokens to device IDs.
      // const tokensSnapshot = await admin.firestore().collection('fcmTokens').where(admin.firestore.FieldPath.documentId(), 'in', targetUserIds).get();
      // let registrationTokens: string[] = [];
      // tokensSnapshot.forEach(doc => {
      //   const userData = doc.data();
      //   // Assuming tokens are stored in an array field called 'tokens'
      //   if (userData.tokens && Array.isArray(userData.tokens)) {
      //     registrationTokens = registrationTokens.concat(userData.tokens);
      //   }
      // });
      // if (registrationTokens.length === 0) {
      //    console.warn('No FCM tokens found for target users:', targetUserIds);
      //    return { success: false, message: 'No target devices found.' };
      // }
      // message.tokens = registrationTokens;
      // response = await admin.messaging().sendMulticast(message);


      // Simplified sending directly to user IDs (requires client-side setup to handle this)
      // A more robust approach involves fetching tokens as shown above.
      message.tokens = targetUserIds; // Assuming targetUserIds are registration tokens for this example
       if (targetUserIds.length > 100) {
         // FCM sendToDevice has a limit of 100 tokens per call
         throw new functions.https.HttpsError(
            'invalid-argument',
            'Cannot send to more than 100 devices at once. Implement batching.'
         );
       }
      response = await messaging.sendMulticast(message);


    } else if (topic) {
      // Sending to a topic
      message.topic = topic;
      response = await messaging.send(message);
    } else {
         // Should not reach here due to validation above, but as a fallback
         throw new functions.https.HttpsError(
             'invalid-argument',
             'Invalid recipient specification.'
         );
    }

    // 5. Implement error handling for FCM sending failures.
    // The response object from sendMulticast or send contains details about success/failure.
    console.log('Successfully sent message:', response);
    if (response && 'responses' in response) { // sendMulticast response
         const successfulSends = response.responses.filter(r => r.success).length;
         const failedSends = response.responses.filter(r => !r.success).length;
         console.log(`Successful sends: ${successfulSends}, Failed sends: ${failedSends}`);
         if (failedSends > 0) {
             // Optionally log failed sends with error details
             response.responses.forEach(r => {
                 if (!r.success) {
                     console.error('Failed send error:', r.error);
                 }
             });
         }
        return { success: true, successful: successfulSends, failed: failedSends };
    } else if (response && 'success' in response) { // send response (to topic)
        return { success: response.success, messageId: response.messageId };
    }


     return { success: true, message: 'Notification sent successfully.' };

  } catch (error) {
    console.error('Error sending notification:', error);
    // 6. Return an error response.
    if (error instanceof functions.https.HttpsError) {
         throw error; // Re-throw existing HttpsErrors
    }
    throw new functions.https.HttpsError('internal', 'Failed to send notification.', error);
  }
});

// Integrated from communication.ts: Updates the notification preferences for the authenticated user.
export const updateNotificationPreferences = functions.https.onCall(async (data, context) => {
  // 1. Ensure the request is authenticated and authorized (user updating their own preferences).
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  const userId = context.auth.uid;
  const { preferences } = data;

  // 2. Validate the input data.
  if (!preferences || typeof preferences !== 'object' || Object.keys(preferences).length === 0) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Notification preferences must be a non-empty object.'
    );
  }

  try {
    // Store preferences in the user's document (e.g., in a 'notificationPreferences' map field)
    // Or store in a separate 'notification_preferences' collection with userId as document ID.

    // Example storing in user document:
    await db.collection('users').doc(userId).set(
      { notificationPreferences: preferences },
      { merge: true } // Use merge to update only this field
    );

    // Example storing in a separate collection:
    // await db.collection('notification_preferences').doc(userId).set(preferences);

    // 3. Return a success response.
    return { success: true, message: 'Notification preferences updated successfully.' };

  } catch (error) {
    console.error('Error updating notification preferences:', error);
    // 4. Return an error response.
    throw new functions.https.HttpsError('internal', 'Failed to update notification preferences.', error);
  }
});

// Integrated from communication.ts: Retrieves the notification preferences for the authenticated user.
export const getNotificationPreferences = functions.https.onCall(async (data, context) => {
  // 1. Ensure the request is authenticated.
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  const userId = context.auth.uid;

  try {
    // Retrieve preferences from the user's document or the 'notification_preferences' collection.
    const userDoc = await db.collection('users').doc(userId).get();

    // 2. Return the preferences data.
    return userDoc.exists ? (userDoc.data()?.notificationPreferences || {}) : {};

  } catch (error) {
    console.error('Error retrieving notification preferences:', error);
    // 3. Return an error response.
    throw new functions.https.HttpsError('internal', 'Failed to retrieve notification preferences.', error);
  }
});



// 4. Callable function to mark a notification as read
export const markNotificationAsRead = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to mark a notification as read.');
    });


// 3. Callable function to mark a notification as read
export const markNotificationAsRead = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to mark a notification as read.');
    }

    const callerUid = context.auth.uid;
    const { notificationId } = data;

    // Basic validation
    if (!notificationId || typeof notificationId !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'Notification ID is required and must be a string.');
    }

    try {
        const notificationRef = db.collection('notifications').doc(notificationId);
        const notificationDoc = await notificationRef.get();

        if (!notificationDoc.exists) {
            throw new functions.https.HttpsError('not-found', `Notification with ID ${notificationId} not found.`);
        }

        const notificationData = notificationDoc.data();

        // Authorization Check: Ensure the caller is the target user of the notification
        if (!notificationData || notificationData.userId !== callerUid) {
            throw new functions.https.HttpsError('permission-denied', 'User does not have permission to mark this notification as read.');
        }

        // Only update if it's not already read
        if (notificationData.isRead === false) {
            await notificationRef.update({
                isRead: true,
                 // Optional: Add readAt timestamp: readAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            console.log(`Notification ${notificationId} marked as read by user ${callerUid}.`);
        } else {
             console.log(`Notification ${notificationId} was already marked as read for user ${callerUid}.`);
        }


        return { notificationId: notificationId, status: 'read' };

    } catch (error) {
        console.error(`Error marking notification ${notificationId} as read by user ${callerUid}:`, error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Unable to mark notification as read.', error);
    }
});