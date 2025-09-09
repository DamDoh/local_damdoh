

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { getUserDocument } from "./utils";
import { logInfo, logError } from './logging';

const db = admin.firestore();
const messaging = admin.messaging();

/**
 * =================================================================
 * Cross-Cutting Notification System
 * =================================================================
 * This file contains backend components for creating and sending
 * notifications to users based on various platform events.
 */

export async function createAndSendNotification(
  userId: string,
  notificationPayload: {
      type: string,
      title_en: string,
      body_en: string,
      actorId: string, 
      linkedEntity: { collection: string; documentId: string } | null,
    },
) {
  if (!userId || userId === notificationPayload.actorId) {
    logInfo("Cannot create notification for a null userId or if user is notifying themselves.", { userId, actorId: notificationPayload.actorId });
    return;
  }

  logInfo("Creating notification", { userId, type: notificationPayload.type });

  try {
    const newNotificationRef = db.collection("notifications").doc();
    await newNotificationRef.set({
      notificationId: newNotificationRef.id,
      userId: userId,
      ...notificationPayload,
      isRead: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    logInfo("Notification document created", { notificationId: newNotificationRef.id });

    // 2. Attempt to send a push notification via FCM
    const userDoc = await getUserDocument(userId);
    const fcmToken = userDoc?.data()?.fcmToken;

    if (fcmToken) {
      logInfo("FCM token found for user. Attempting to send push notification...", { userId });
      const message: admin.messaging.Message = {
        notification: {
          title: notificationPayload.title_en,
          body: notificationPayload.body_en,
        },
        data: {
          notificationId: newNotificationRef.id,
          type: notificationPayload.type,
          linkedCollection: notificationPayload.linkedEntity?.collection || "",
          linkedDocumentId: notificationPayload.linkedEntity?.documentId || "",
        },
        token: fcmToken,
      };

      const response = await messaging.send(message);
      logInfo("Successfully sent FCM message:", { response, userId });
    } else {
      logInfo("User does not have an FCM token. Storing notification only.", { userId });
    }
  } catch (error) {
    logError("Error during notification creation/sending", { userId, error });
  }
}

/**
 * Firestore trigger for new connection requests.
 */
export const onNewConnectionRequest = functions.firestore
    .document('connection_requests/{requestId}')
    .onCreate(async (snap, context) => {
        const requestData = snap.data();
        if (!requestData) return;

        try {
            const requesterDoc = await db.collection('users').doc(requestData.requesterId).get();
            const requesterName = requesterDoc.data()?.displayName || 'Someone';

            const notificationPayload = {
                type: "new_connection_request",
                title_en: "New Connection Request",
                body_en: `${requesterName} wants to connect with you.`,
                actorId: requestData.requesterId,
                linkedEntity: { collection: "network", documentId: "my-network" },
            };

            await createAndSendNotification(requestData.recipientId, notificationPayload);
        } catch(error) {
            logError("Failed to send onNewConnectionRequest notification", { requestId: context.params.requestId, error });
        }
    });

/**
 * Firestore trigger to update a post's like count and send a notification.
 */
export const onPostLike = functions.firestore
  .document('posts/{postId}/likes/{userId}')
  .onWrite(async (change, context) => {
    const { postId, userId } = context.params;
    const postRef = db.collection('posts').doc(postId);

    try {
        if (change.after.exists && !change.before.exists) { // Document created (like)
          await postRef.update({ likesCount: admin.firestore.FieldValue.increment(1) });
          const postDoc = await postRef.get();
          const postData = postDoc.data();
          if (!postData) return;

          const likerProfile = await db.collection('users').doc(userId).get();
          const likerName = likerProfile.data()?.displayName || 'Someone';

          await createAndSendNotification(postData.userId, {
            type: 'like',
            title_en: `${likerName} liked your post`,
            body_en: `Your post "${postData.content.substring(0, 50)}..." has a new like.`,
            actorId: userId,
            linkedEntity: { collection: 'posts', documentId: postId }
          });

        } else if (!change.after.exists && change.before.exists) { // Document deleted (unlike)
          await postRef.update({ likesCount: admin.firestore.FieldValue.increment(-1) });
        }
    } catch(error) {
        logError("Failed to process post like event", { postId, userId, error });
    }
  });


/**
 * Firestore trigger to update a post's comment count and send a notification.
 */
export const onPostComment = functions.firestore
  .document('posts/{postId}/comments/{commentId}')
  .onWrite(async (change, context) => {
    const { postId } = context.params;
    const postRef = db.collection('posts').doc(postId);
    
    try {
        if (change.after.exists && !change.before.exists) { // Comment created
          await postRef.update({ commentsCount: admin.firestore.FieldValue.increment(1) });
          const commentData = change.after.data();
          if (!commentData) return;

          const postDoc = await postRef.get();
          const postData = postDoc.data();
          if (!postData) return;

          await createAndSendNotification(postData.userId, {
            type: 'comment',
            title_en: `${commentData.userName} commented on your post`,
            body_en: `"${commentData.content.substring(0, 50)}..."`,
            actorId: commentData.userId,
            linkedEntity: { collection: 'posts', documentId: postId }
          });
        } else if (!change.after.exists && change.before.exists) { // Comment deleted
            await postRef.update({ commentsCount: admin.firestore.FieldValue.increment(-1) });
        }
    } catch(error) {
        logError("Failed to process post comment event", { postId, commentId: context.params.commentId, error });
    }
  });


/**
 * Firestore trigger for new marketplace orders.
 */
export const onNewMarketplaceOrder = functions.firestore
    .document('marketplace_orders/{orderId}')
    .onCreate(async (snap, context) => {
        const orderData = snap.data();
        if (!orderData) return;
        
        try {
            await createAndSendNotification(orderData.sellerId, {
                type: "new_order",
                title_en: "You have a new order!",
                body_en: `A buyer has placed an order for your listing: "${orderData.listingName}".`,
                actorId: orderData.buyerId,
                linkedEntity: { collection: "marketplace_orders", documentId: snap.id },
            });
        } catch(error) {
            logError("Failed to send onNewMarketplaceOrder notification", { orderId: context.params.orderId, error });
        }
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
    const userId = context.auth.uid;

    const {notificationId} = data;
    if (!notificationId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Notification ID is required.",
      );
    }

    try {
        const notificationRef = db.collection("notifications").doc(notificationId);
        const notificationDoc = await notificationRef.get();

        if (
        !notificationDoc.exists ||
        notificationDoc.data()?.userId !== userId
        ) {
        throw new functions.https.HttpsError(
            "permission-denied",
            "You do not have permission to update this notification.",
        );
        }

        await notificationRef.update({isRead: true});
        return {status: "success"};
    } catch(error) {
        logError("Failed to mark notification as read", { userId, notificationId, error });
        if (error instanceof functions.https.HttpsError) throw error;
        throw new functions.https.HttpsError("internal", "Could not update notification.");
    }
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
    const userId = context.auth.uid;

    try {
        const userRef = db.collection("users").doc(userId);

        if (data.preferences) {
        await userRef.set({notificationPreferences: data.preferences}, {merge: true});
        return {success: true, message: "Preferences updated."};
        } else {
        const userDoc = await userRef.get();
        return userDoc.data()?.notificationPreferences || {};
        }
    } catch (error) {
        logError("Failed to manage notification preferences", { userId, error });
        throw new functions.https.HttpsError("internal", "Could not update preferences.");
    }
  },
);


/**
 * Scheduled function to send reminders for upcoming events.
 * Runs every day at a specified time (e.g., 8 AM UTC).
 */
export const sendEventReminders = functions.pubsub.schedule("every day 08:00")
  .timeZone("UTC")
  .onRun(async (context) => {
    logInfo("Running daily event reminder check...");

    const now = new Date();
    const aDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // 1. Handle Agri-Events
    try {
      const upcomingEventsQuery = db.collection("agri_events")
        .where("eventDate", ">=", now)
        .where("eventDate", "<=", aDayFromNow);

      const eventsSnapshot = await upcomingEventsQuery.get();
      if (eventsSnapshot.empty) {
        logInfo("No upcoming agri-events in the next 24 hours.");
      } else {
        logInfo(`Found ${eventsSnapshot.docs.length} upcoming agri-events.`);
        for (const eventDoc of eventsSnapshot.docs) {
          const eventData = eventDoc.data();
          const attendeesSnapshot = await eventDoc.ref.collection("attendees").get();

          if (!attendeesSnapshot.empty) {
            for (const attendeeDoc of attendeesSnapshot.docs) {
              const attendeeId = attendeeDoc.id;
              await createAndSendNotification(attendeeId, {
                type: "event_reminder",
                title_en: "Event Reminder",
                body_en: `Your event, "${eventData.title}", is starting soon!`,
                actorId: 'system', // System-generated notification
                linkedEntity: { collection: "agri_events", documentId: eventDoc.id },
              });
            }
          }
        }
      }
    } catch (error) {
      logError("Error processing agri-event reminders:", { error });
    }
    logInfo("Daily event reminder check finished.");
    return null;
  });

