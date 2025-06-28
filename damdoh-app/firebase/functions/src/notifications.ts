
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();
const messaging = admin.messaging();

import {getUserDocument} from "./profiles";

/**
 * =================================================================
 * Cross-Cutting Notification System
 * =================================================================
 * This file contains backend components for creating and sending
 * notifications to users based on various platform events.
 */

/**
 * Creates a notification document in Firestore and attempts to send a push notification.
 * @param {string} recipientId - The ID of the user to notify.
 * @param {string} actorId - The ID of the user who performed the action.
 * @param {'like' | 'comment'} type - The type of notification.
 * @param {string} postId - The ID of the post that was interacted with.
 * @param {string} postContentSnippet - A snippet of the post content for context.
 */
async function createAndSendNotification(
  recipientId: string,
  actorId: string,
  type: 'like' | 'comment',
  postId: string,
  postContentSnippet: string
) {
  if (!recipientId || !actorId || recipientId === actorId) {
    if (recipientId === actorId) {
        console.log("Skipping notification because user interacted with their own post.");
    } else {
        console.warn("Cannot create notification for null recipient or actor.");
    }
    return;
  }

  const actorDoc = await getUserDocument(actorId);
  const actorName = actorDoc?.data()?.displayName || "Someone";
  const notificationTitle = type === 'like' ? `${actorName} liked your post` : `${actorName} commented on your post`;
  const notificationBody = `On your post: "${postContentSnippet}"`;

  console.log(`Creating notification for user ${recipientId}, type: ${type}`);
  const newNotificationRef = db.collection("notifications").doc();
  await newNotificationRef.set({
    notificationId: newNotificationRef.id,
    userId: recipientId, // The user receiving the notification
    actorId: actorId, // The user who performed the action
    type: type,
    postId: postId,
    postContentSnippet: postContentSnippet,
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
        title: notificationTitle,
        body: notificationBody,
      },
      data: {
        notificationId: newNotificationRef.id,
        type: type,
        postId: postId,
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
    
    await createAndSendNotification(postAuthorId, actorId, 'like', postId, postContentSnippet);
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
        
        await createAndSendNotification(postAuthorId, actorId, 'comment', postId, postContentSnippet);
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

    