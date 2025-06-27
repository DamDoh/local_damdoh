
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();
const messaging = admin.messaging();

import {getUserDocument} from "./module2";

/**
 * =================================================================
 * Cross-Cutting Notification System
 * =================================================================
 * This file contains backend components for creating and sending
 * notifications to users based on various platform events.
 */

/**
 * Creates a notification document in Firestore and attempts to send a push notification.
 * @param {string} userId - The ID of the user to notify.
 * @param {object} notificationPayload - The content of the notification.
 */
async function createAndSendNotification(
    userId: string,
    notificationPayload: {
      type: string,
      title_en: string,
      body_en: string,
      linkedEntity: { collection: string; documentId: string } | null,
    },
) {
  if (!userId) {
    console.warn("Cannot create notification for a null userId.");
    return;
  }

  console.log(
      `Creating notification for user ${userId}, type: ${notificationPayload.type}`,
  );

  // 1. Create a document in the 'notifications' collection
  const newNotificationRef = db.collection("notifications").doc();
  await newNotificationRef.set({
    notificationId: newNotificationRef.id,
    userId: userId,
    ...notificationPayload,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    isRead: false,
  });
  console.log(`Notification document created: ${newNotificationRef.id}`);

  // 2. Attempt to send a push notification via FCM
  const userDoc = await getUserDocument(userId);
  const fcmToken = userDoc?.data()?.fcmToken;

  if (fcmToken) {
    console.log(
        `FCM token found for user ${userId}. Attempting to send push notification...`,
    );
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

    try {
      const response = await messaging.send(message);
      console.log("Successfully sent FCM message:", response);
    } catch (error) {
      console.error("Error sending FCM message:", error);
      // Handle invalid tokens, e.g., remove from user document
    }
  } else {
    console.log(
        `User ${userId} does not have an FCM token. Storing notification only.`,
    );
  }
}

/**
 * A generic trigger that listens to writes across multiple collections
 * and creates specific notifications based on the event.
 * NOTE: For production, it's more efficient to have specific triggers per collection
 * but this approach is used here for demonstration.
 * @param {functions.Change<functions.firestore.DocumentSnapshot>} change The change event.
 * @param {functions.EventContext} context The event context.
 * @return {Promise<null>} A promise that resolves when the function is complete.
 */
export const onDataChangeCreateNotification = functions.firestore
    .document("{collectionId}/{documentId}")
    .onWrite(async (change, context) => {
      const {collectionId, documentId} = context.params;
      const afterData = change.after.exists ? change.after.data() : null;
      const beforeData = change.before.exists ? change.before.data() : null;

      if (!afterData && !beforeData) {
        return null; // Document was deleted, no notification needed.
      }

      let notificationDetails = null;

      // --- Logic to identify target user and construct notification content ---
      if (collectionId === "marketplace_orders" && !beforeData && afterData) {
        notificationDetails = {
          userId: afterData.sellerId, // Notify the seller
          payload: {
            type: "new_order",
            title_en: "You have a new order!",
            body_en: `A buyer has placed an order for your listing: "${afterData.listingName}".`,
            linkedEntity: {collection: "marketplace_orders", documentId},
          },
        };
      } else if (collectionId === "forum_replies" && !beforeData && afterData) {
        console.log(
            `Conceptual: New forum reply notification trigger for ${documentId}`,
        );
      } else if (
        collectionId === "applications" &&
      beforeData?.status !== afterData?.status &&
      afterData
      ) {
        notificationDetails = {
          userId: afterData.applicantId, // Notify the applicant
          payload: {
            type: "application_update",
            title_en: "Your application status has changed",
            body_en: `The status of your application for "${afterData.productName}" is now: ${afterData.status}.`,
            linkedEntity: {collection: "applications", documentId},
          },
        };
      }

      if (notificationDetails) {
        await createAndSendNotification(
            notificationDetails.userId,
            notificationDetails.payload,
        );
      }

      return null;
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
