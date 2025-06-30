
/**
 * =================================================================
 * Module 13: Notifications System (The Engagement Engine)
 * =================================================================
 * This module is the ubiquitous communication backbone of the DamDoh Super App,
 * ensuring users receive timely, relevant, and personalized alerts and updates
 * across all platform functionalities.
 *
 * @purpose To deliver real-time, customizable notifications to users about
 * critical events, updates, messages, and opportunities, ensuring they stay
 * informed and engaged.
 *
 * @key_concepts
 * - Multi-Channel Delivery: Supports in-app, push (FCM), SMS, and email notifications.
 * - Event-Driven Triggers: Listens for events from all other modules (Marketplace,
 *   Community, Farm Management, etc.) to trigger notifications.
 * - User Preferences: Allows users to customize which alerts they receive on which channels.
 * - Localization: Delivers notifications in the user's preferred language and timezone.
 * - Notification History: An in-app inbox of all past notifications.
 *
 * @firebase_data_model
 * - notifications: Stores individual notification documents for each user.
 * - user_notification_settings: Stores user-specific preferences for notifications.
 *
 * @synergy
 * - This is a cross-cutting concern, invoked by nearly all other modules.
 * - Uses Module 2 (Profiles) to get user preferences (language, FCM token).
 * - Triggers Module 9 (Integrations) to send notifications via third-party
 *   services like SMS gateways or email providers.
 */


import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();
const messaging = admin.messaging();

import {getUserDocument} from "./profiles";

/**
 * Creates a notification document in Firestore and attempts to send a push notification.
 * This is the central internal function for creating and dispatching notifications.
 * @param {string} recipientId - The ID of the user to notify.
 * @param {string} actorId - The ID of the user who performed the action.
 * @param {'like' | 'comment' | 'new_order' | 'application_update'} type - The type of notification.
 * @param {string} title - The title of the notification.
 * @param {string} body - The body content of the notification.
 * @param {string} link - The in-app link the notification should navigate to.
 */
async function createAndSendNotification(
  recipientId: string,
  actorId: string,
  type: 'like' | 'comment' | 'new_order' | 'application_update',
  title: string,
  body: string,
  link: string,
) {
  if (!recipientId || !actorId || recipientId === actorId) {
    if (recipientId === actorId) {
        console.log("Skipping notification because user acted on their own content.");
    } else {
        console.warn("Cannot create notification for null recipient or actor.");
    }
    return;
  }

  console.log(`Creating notification for user ${recipientId}, type: ${type}`);
  const newNotificationRef = db.collection("notifications").doc();
  
  await newNotificationRef.set({
    notificationId: newNotificationRef.id,
    userId: recipientId, // The user receiving the notification
    actorId: actorId, // The user who performed the action
    type: type,
    title: title,
    body: body,
    link: link,
    read: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  console.log(`Notification document created: ${newNotificationRef.id}`);

  // Attempt to send a push notification via FCM
  const recipientDoc = await getUserDocument(recipientId);
  const fcmToken = recipientDoc?.data()?.fcmToken;

  if (fcmToken) {
    console.log(`FCM token found for user ${recipientId}. Attempting to send push notification...`);
    const message: admin.messaging.Message = {
      notification: {
        title: title,
        body: body,
      },
      data: {
        notificationId: newNotificationRef.id,
        type: type,
        link: link,
      },
      token: fcmToken,
    };

    try {
      const response = await messaging.send(message);
      console.log("Successfully sent FCM message:", response);
    } catch (error) {
      console.error("Error sending FCM message:", error);
    }
  } else {
    console.log(`User ${recipientId} does not have an FCM token. Storing notification only.`);
  }
}

/**
 * Triggered when a new like is added to a post.
 */
export const onNewPostLike = functions.firestore
  .document("posts/{postId}/likes/{userId}")
  .onCreate(async (snapshot, context) => {
    const { postId, userId: actorId } = context.params;

    const postRef = db.collection("posts").doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      console.error(`Post with ID ${postId} not found.`);
      return;
    }

    const postData = postDoc.data()!;
    const postAuthorId = postData.userId;
    const postContentSnippet = postData.content?.substring(0, 50) + "..." || "your post";
    
    const actorDoc = await getUserDocument(actorId);
    const actorName = actorDoc?.data()?.displayName || "Someone";
    
    await createAndSendNotification(
        postAuthorId, 
        actorId, 
        'like', 
        `${actorName} liked your post`,
        `On your post: "${postContentSnippet}"`,
        `/feed?postId=${postId}`
    );
  });

/**
 * Triggered when a new comment is added to a post.
 */
export const onNewPostComment = functions.firestore
    .document("posts/{postId}/comments/{commentId}")
    .onCreate(async (snapshot, context) => {
        const { postId, commentId } = context.params;
        const commentData = snapshot.data();
        if (!commentData) return;
        
        const actorId = commentData.userId;

        const postRef = db.collection("posts").doc(postId);
        const postDoc = await postRef.get();

        if (!postDoc.exists) {
            console.error(`Post with ID ${postId} not found for new comment.`);
            return;
        }

        const postData = postDoc.data()!;
        const postAuthorId = postData.userId;
        const postContentSnippet = postData.content?.substring(0, 50) + "..." || "your post";
        
        const actorDoc = await getUserDocument(actorId);
        const actorName = actorDoc?.data()?.displayName || "Someone";

        await createAndSendNotification(
            postAuthorId, 
            actorId, 
            'comment', 
            `${actorName} commented on your post`,
            `On your post: "${postContentSnippet}"`,
            `/feed?postId=${postId}`
        );
    });


/**
 * Marks a specific notification as read for the authenticated user.
 * @param {any} data The data for the function call.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{status: string}>} A promise that resolves with the status.
 */
export const markNotificationAsRead = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated.",
      );
    }

    const {notificationId} = data;
    if (!notificationId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Notification ID is required.",
      );
    }

    const notificationRef = db.collection("notifications").doc(notificationId);
    const notificationDoc = await notificationRef.get();

    if (
      !notificationDoc.exists ||
      notificationDoc.data()?.userId !== context.auth.uid
    ) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "You do not have permission to update this notification.",
      );
    }

    await notificationRef.update({isRead: true});
    return {status: "success"};
  },
);

/**
 * Retrieves and updates notification preferences for the authenticated user.
 * @param {any} data The data for the function call.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<any>} A promise that resolves with the preferences.
 */
export const manageNotificationPreferences = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated.",
      );
    }

    const userRef = db.collection("users").doc(context.auth.uid);

    if (data.preferences) {
      await userRef.set({notificationPreferences: data.preferences}, {merge: true});
      return {success: true, message: "Preferences updated."};
    } else {
      const userDoc = await userRef.get();
      return userDoc.data()?.notificationPreferences || {};
    }
  },
);


// =================================================================
// CONCEPTUAL FUTURE FUNCTIONS FOR MODULE 13
// =================================================================

/**
 * [Conceptual] Interfaces with a third-party SMS gateway to send critical alerts.
 * This would be called by the central `createAndSendNotification` function if the
 * user's preferences indicate they want SMS for a certain notification type.
 * @param {any} data - Contains `toPhoneNumber` and `messageBody`.
 * @return {Promise<{status: string, messageId: string}>} - A promise resolving with the message ID.
 */
export const sendSmsNotification = functions.https.onCall(async (data, context) => {
    // 1. Authenticate that this is called by a trusted internal service.
    // 2. Call Module 9's SMS gateway function.
    console.log("[Conceptual] Sending SMS with data:", data);
    return { success: true, messageId: `sms_${Date.now()}` };
});

/**
 * [Conceptual] A scheduled job to periodically clean up very old notifications
 * from the database to keep the collection size manageable.
 */
export const cleanOldNotifications = functions.pubsub.schedule('every 30 days').onRun(async (context) => {
    console.log('[Conceptual] Running scheduled job to clean old notifications...');
    // 1. Query 'notifications' collection for documents older than a threshold (e.g., 6 months).
    // 2. Use a batched write to delete the old documents.
    return null;
});
