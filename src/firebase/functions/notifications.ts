

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();
const messaging = admin.messaging();

import {getUserDocument} from "./utils";

/**
 * =================================================================
 * Cross-Cutting Notification System
 * =================================================================
 * This file contains backend components for creating and sending
 * notifications to users based on various platform events.
 */

async function createAndSendNotification(
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
    console.warn("Cannot create notification for a null userId or if user is notifying themselves.");
    return;
  }

  console.log(
    `Creating notification for user ${userId}, type: ${notificationPayload.type}`,
  );

  const newNotificationRef = db.collection("notifications").doc();
  await newNotificationRef.set({
    notificationId: newNotificationRef.id,
    userId: userId,
    ...notificationPayload,
    isRead: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  console.log(`Notification document created: ${newNotificationRef.id}`);

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
    }
  } else {
    console.log(
      `User ${userId} does not have an FCM token. Storing notification only.`,
    );
  }
}

/**
 * Firestore trigger for new profile views.
 */
export const onNewProfileView = functions.firestore
    .document('profile_views/{viewId}')
    .onCreate(async (snap, context) => {
        const viewData = snap.data();
        if (!viewData) return;

        const { viewerId, viewedId } = viewData;
        
        // Extra safeguard: do not notify on self-views.
        if (!viewerId || !viewedId || viewerId === viewedId) {
            return;
        }

        const viewerDoc = await db.collection('users').doc(viewerId).get();
        const viewerName = viewerDoc.data()?.displayName || 'Someone';

        const notificationPayload = {
            type: "profile_view",
            title_en: "Your profile has a new view",
            body_en: `${viewerName} viewed your profile.`,
            actorId: viewerId,
            linkedEntity: { collection: "profiles", documentId: viewerId },
        };

        await createAndSendNotification(viewedId, notificationPayload);
    });


/**
 * Firestore trigger for new connection requests.
 */
export const onNewConnectionRequest = functions.firestore
    .document('connection_requests/{requestId}')
    .onCreate(async (snap, context) => {
        const requestData = snap.data();
        if (!requestData) return;

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
    });

/**
 * Firestore trigger to update a post's like count and send a notification.
 */
export const onPostLike = functions.firestore
  .document('posts/{postId}/likes/{userId}')
  .onWrite(async (change, context) => {
    const { postId, userId } = context.params;
    const postRef = db.collection('posts').doc(postId);

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
  });


/**
 * Firestore trigger to update a post's comment count and send a notification.
 */
export const onPostComment = functions.firestore
  .document('posts/{postId}/comments/{commentId}')
  .onWrite(async (change, context) => {
    const { postId } = context.params;
    const postRef = db.collection('posts').doc(postId);

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
  });


/**
 * Firestore trigger for new marketplace orders.
 */
export const onNewMarketplaceOrder = functions.firestore
    .document('marketplace_orders/{orderId}')
    .onCreate(async (snap, context) => {
        const orderData = snap.data();
        if (!orderData) return;
        
        await createAndSendNotification(orderData.sellerId, {
            type: "new_order",
            title_en: "You have a new order!",
            body_en: `A buyer has placed an order for your listing: "${orderData.listingName}".`,
            actorId: orderData.buyerId,
            linkedEntity: { collection: "marketplace_orders", documentId: snap.id },
        });
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


/**
 * Scheduled function to send reminders for upcoming events.
 * Runs every day at a specified time (e.g., 8 AM UTC).
 */
export const sendEventReminders = functions.pubsub.schedule("every day 08:00")
  .timeZone("UTC")
  .onRun(async (context) => {
    console.log("Running daily event reminder check...");

    const now = new Date();
    const aDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // 1. Handle Agri-Events
    try {
      const upcomingEventsQuery = db.collection("agri_events")
        .where("eventDate", ">=", now)
        .where("eventDate", "<=", aDayFromNow);

      const eventsSnapshot = await upcomingEventsQuery.get();
      if (eventsSnapshot.empty) {
        console.log("No upcoming agri-events in the next 24 hours.");
      } else {
        console.log(`Found ${eventsSnapshot.docs.length} upcoming agri-events.`);
        for (const eventDoc of eventsSnapshot.docs) {
          const eventData = eventDoc.data();
          const attendeesSnapshot = await eventDoc.ref.collection("attendees").get();

          if (!attendeesSnapshot.empty) {
            for (const attendeeDoc of attendeesSnapshot.docs) {
              const attendeeId = attendeeDoc.id;
              const notificationPayload = {
                type: "event_reminder",
                title_en: "Event Reminder",
                body_en: `Your event, "${eventData.title}", is starting soon!`,
                actorId: 'system', // System-generated notification
                linkedEntity: { collection: "agri_events", documentId: eventDoc.id },
              };
              await createAndSendNotification(attendeeId, notificationPayload);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error processing agri-event reminders:", error);
    }

    // 2. Handle Agro-Tourism Bookings
    // NOTE: This part is conceptual. It assumes a `bookingDate` field exists on the booking documents.
    // This logic needs to be activated once the data model supports specific booking dates.
    try {
        const upcomingBookingsQuery = db.collectionGroup("bookings")
            // This query is commented out because 'bookingDate' does not exist on the documents yet.
            // .where("bookingDate", ">=", now) 
            // .where("bookingDate", "<=", aDayFromNow)
            .get(); 
        
        console.log("Conceptually checking for Agro-Tourism bookings... (This part is not fully functional without a booking date field)");
        // The loop below is commented out to prevent it from running with an inefficient query.
        // It serves as a blueprint for future implementation.
        /*
        for (const bookingDoc of (await upcomingBookingsQuery).docs) {
            const bookingData = bookingDoc.data();
            const serviceRef = bookingDoc.ref.parent.parent; // This gets the marketplaceItem doc
            if (serviceRef) {
              const serviceDoc = await serviceRef.get();
              if (serviceDoc.exists) {
                const serviceData = serviceDoc.data()!;
                const guestId = bookingData.userId;
                const notificationPayload = {
                    type: "service_reminder",
                    title_en: "Service Reminder",
                    body_en: `Your booked service, "${serviceData.name}", is coming up soon!`,
                    actorId: 'system',
                    linkedEntity: { collection: "marketplaceItems", documentId: serviceDoc.id },
                };
                await createAndSendNotification(guestId, notificationPayload);
              }
            }
        }
        */

    } catch (error) {
        console.error("Error processing agro-tourism booking reminders:", error);
    }

    console.log("Daily event reminder check finished.");
    return null;
  });

    
