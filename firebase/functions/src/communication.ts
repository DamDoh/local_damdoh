import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK (ensure this is done once)
// admin.initializeApp(); // Uncomment and configure if not already initialized

/**
 * Sends a push notification to specified users or a topic via Firebase Cloud Messaging (FCM).
 * Requires strong authorization to prevent abuse.
 *
 * Request body should contain:
 * - targetUserIds?: string[] (Array of user UIDs to send the notification to)
 * - topic?: string (FCM topic to send the notification to)
 * - title: string (Notification title)
 * - body: string (Notification body/message)
 * - data?: { [key: string]: string } (Optional data payload for background handling)
 */
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
      response = await admin.messaging().sendMulticast(message);


    } else if (topic) {
      // Sending to a topic
      message.topic = topic;
      response = await admin.messaging().send(message);
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

/**
 * Updates the notification preferences for the authenticated user.
 * Preferences are stored in the user's document or a dedicated collection.
 *
 * Request body should contain:
 * - preferences: { [key: string]: boolean } (Map of preference types to boolean values)
 */
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
    await admin.firestore().collection('users').doc(userId).set(
      { notificationPreferences: preferences },
      { merge: true } // Use merge to update only this field
    );

    // Example storing in a separate collection:
    // await admin.firestore().collection('notification_preferences').doc(userId).set(preferences);

    // 3. Return a success response.
    return { success: true, message: 'Notification preferences updated successfully.' };

  } catch (error) {
    console.error('Error updating notification preferences:', error);
    // 4. Return an error response.
    throw new functions.https.HttpsError('internal', 'Failed to update notification preferences.', error);
  }
});

/**
 * Retrieves the notification preferences for the authenticated user.
 */
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
    const userDoc = await admin.firestore().collection('users').doc(userId).get();

    // 2. Return the preferences data.
    return userDoc.exists ? (userDoc.data()?.notificationPreferences || {}) : {};

  } catch (error) {
    console.error('Error retrieving notification preferences:', error);
    // 3. Return an error response.
    throw new functions.https.HttpsError('internal', 'Failed to retrieve notification preferences.', error);
  }
});

/**
 * Creates a new chat conversation.
 * Requires authentication and potentially authorization based on chat type (e.g., group).
 *
 * Request body should contain:
 * - participantUserIds: string[] (Array of UIDs for participants, including the creator)
 * - isGroupChat?: boolean (True if creating a group chat, default false)
 * - groupName?: string (Required if isGroupChat is true)
 */
export const createConversation = functions.https.onCall(async (data, context) => {
  // 1. Ensure the request is authenticated.
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  const creatorId = context.auth.uid;
  const { participantUserIds, isGroupChat = false, groupName } = data;

  // 2. Validate input data and enforce authorization based on chat type.
  if (!participantUserIds || !Array.isArray(participantUserIds) || participantUserIds.length < 2) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'participantUserIds must be an array with at least two participants.'
    );
  }

  if (!participantUserIds.includes(creatorId)) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'The creator must be included in the participantUserIds.'
    );
  }

  if (isGroupChat) {
    if (!groupName || groupName.trim() === '') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'groupName is required for group chats.'
      );
    }
    // Add additional authorization checks here if only certain roles can create group chats
    // Example: if (!context.auth.token.isAdmin) { ... }
  } else {
    // Ensure only two participants for a one-on-one chat
    if (participantUserIds.length !== 2) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'One-on-one chats must have exactly two participants.'
        );
    }
  }

  try {
    // 3. Create a new document in a `conversations` collection.
    const newConversationRef = admin.firestore().collection('conversations').doc();

    await newConversationRef.set({
      participants: participantUserIds,
      isGroup: isGroupChat,
      name: isGroupChat ? groupName.trim() : null, // Store group name only for group chats
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: creatorId,
      // Add other relevant fields, e.g., lastMessage, lastMessageAt, etc.
    });

    // 4. Return the new conversation ID.
    return { success: true, conversationId: newConversationRef.id };

  } catch (error) {
    console.error('Error creating conversation:', error);
    throw new functions.https.HttpsError('internal', 'Failed to create conversation.', error);
  }
});

/**
 * Adds a participant to an existing chat conversation.
 * Requires authentication and authorization (e.g., conversation creator or admin).
 *
 * Request body should contain:
 * - conversationId: string (ID of the conversation)
 * - userId: string (UID of the user to add)
 */
export const addParticipantToConversation = functions.https.onCall(async (data, context) => {
  // 1. Ensure the request is authenticated.
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  const callerId = context.auth.uid;
  const { conversationId, userId } = data;

  // 2. Validate input data.
  if (!conversationId || !userId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'conversationId and userId are required.'
    );
  }

  try {
    const conversationRef = admin.firestore().collection('conversations').doc(conversationId);
    const conversationDoc = await conversationRef.get();

    if (!conversationDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Conversation not found.');
    }

    const conversationData = conversationDoc.data();

    // 3. Enforce authorization (e.g., only creator or admin can add).
    // Example: Check if the caller is the creator OR has admin role.
    if (conversationData.createdBy !== callerId /* && !context.auth.token.isAdmin */) {
       throw new functions.https.HttpsError(
         'permission-denied',
         'You do not have permission to add participants to this conversation.'
       );
    }

    // 4. Update the participant list.
    // Use arrayUnion to add the userId without duplicates
    await conversationRef.update({
      participants: admin.firestore.FieldValue.arrayUnion(userId)
    });

    // 5. Return a success response.
    return { success: true, message: 'Participant added successfully.' };

  } catch (error) {
    console.error('Error adding participant to conversation:', error);
    throw new functions.https.HttpsError('internal', 'Failed to add participant to conversation.', error);
  }
});