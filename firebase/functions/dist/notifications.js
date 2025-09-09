"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEventReminders = exports.manageNotificationPreferences = exports.markNotificationAsRead = exports.onNewMarketplaceOrder = exports.onNewPostComment = exports.onNewPostLike = exports.onNewConnectionRequest = exports.onNewProfileView = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
const messaging = admin.messaging();
const profiles_1 = require("./profiles");
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
async function createAndSendNotification(userId, notificationPayload) {
    var _a, _b, _c;
    if (!userId || userId === notificationPayload.actorId) {
        console.warn("Cannot create notification for a null userId or if user is notifying themselves.");
        return;
    }
    console.log(`Creating notification for user ${userId}, type: ${notificationPayload.type}`);
    // 1. Create a document in the 'notifications' collection
    const newNotificationRef = db.collection("notifications").doc();
    await newNotificationRef.set(Object.assign(Object.assign({ notificationId: newNotificationRef.id, userId: userId }, notificationPayload), { isRead: false, createdAt: admin.firestore.FieldValue.serverTimestamp() }));
    console.log(`Notification document created: ${newNotificationRef.id}`);
    // 2. Attempt to send a push notification via FCM
    const userDoc = await (0, profiles_1.getUserDocument)(userId);
    const fcmToken = (_a = userDoc === null || userDoc === void 0 ? void 0 : userDoc.data()) === null || _a === void 0 ? void 0 : _a.fcmToken;
    if (fcmToken) {
        console.log(`FCM token found for user ${userId}. Attempting to send push notification...`);
        const message = {
            notification: {
                title: notificationPayload.title_en,
                body: notificationPayload.body_en,
            },
            data: {
                notificationId: newNotificationRef.id,
                type: notificationPayload.type,
                linkedCollection: ((_b = notificationPayload.linkedEntity) === null || _b === void 0 ? void 0 : _b.collection) || "",
                linkedDocumentId: ((_c = notificationPayload.linkedEntity) === null || _c === void 0 ? void 0 : _c.documentId) || "",
            },
            token: fcmToken,
        };
        try {
            const response = await messaging.send(message);
            console.log("Successfully sent FCM message:", response);
        }
        catch (error) {
            console.error("Error sending FCM message:", error);
            // Handle invalid tokens, e.g., remove from user document
        }
    }
    else {
        console.log(`User ${userId} does not have an FCM token. Storing notification only.`);
    }
}
/**
 * Firestore trigger for new profile views.
 */
exports.onNewProfileView = functions.firestore
    .document('profile_views/{viewId}')
    .onCreate(async (snap, context) => {
    var _a;
    const viewData = snap.data();
    if (!viewData)
        return;
    const { viewerId, viewedId } = viewData;
    // Extra safeguard: do not notify on self-views.
    if (!viewerId || !viewedId || viewerId === viewedId) {
        return;
    }
    const viewerDoc = await db.collection('users').doc(viewerId).get();
    const viewerName = ((_a = viewerDoc.data()) === null || _a === void 0 ? void 0 : _a.displayName) || 'Someone';
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
exports.onNewConnectionRequest = functions.firestore
    .document('connection_requests/{requestId}')
    .onCreate(async (snap, context) => {
    var _a;
    const requestData = snap.data();
    if (!requestData)
        return;
    const requesterDoc = await db.collection('users').doc(requestData.requesterId).get();
    const requesterName = ((_a = requesterDoc.data()) === null || _a === void 0 ? void 0 : _a.displayName) || 'Someone';
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
 * Firestore trigger for new likes on posts.
 */
exports.onNewPostLike = functions.firestore
    .document('posts/{postId}/likes/{userId}')
    .onCreate(async (snap, context) => {
    var _a;
    const { postId, userId } = context.params;
    const postRef = db.collection('posts').doc(postId);
    const postDoc = await postRef.get();
    const postData = postDoc.data();
    if (!postData)
        return;
    const likerProfile = await db.collection('users').doc(userId).get();
    const likerName = ((_a = likerProfile.data()) === null || _a === void 0 ? void 0 : _a.displayName) || 'Someone';
    await createAndSendNotification(postData.userId, {
        type: 'like',
        title_en: `${likerName} liked your post`,
        body_en: `Your post "${postData.content.substring(0, 50)}..." has a new like.`,
        actorId: userId,
        linkedEntity: { collection: 'posts', documentId: postId }
    });
});
/**
 * Firestore trigger for new comments on posts.
 */
exports.onNewPostComment = functions.firestore
    .document('posts/{postId}/comments/{commentId}')
    .onCreate(async (snap, context) => {
    const { postId } = context.params;
    const commentData = snap.data();
    if (!commentData)
        return;
    const postRef = db.collection('posts').doc(postId);
    const postDoc = await postRef.get();
    const postData = postDoc.data();
    if (!postData)
        return;
    await createAndSendNotification(postData.userId, {
        type: 'comment',
        title_en: `${commentData.userName} commented on your post`,
        body_en: `"${commentData.content.substring(0, 50)}..."`,
        actorId: commentData.userId,
        linkedEntity: { collection: 'posts', documentId: postId }
    });
});
/**
 * Firestore trigger for new marketplace orders.
 */
exports.onNewMarketplaceOrder = functions.firestore
    .document('marketplace_orders/{orderId}')
    .onCreate(async (snap, context) => {
    const orderData = snap.data();
    if (!orderData)
        return;
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
exports.markNotificationAsRead = functions.https.onCall(async (data, context) => {
    var _a;
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
    }
    const { notificationId } = data;
    if (!notificationId) {
        throw new functions.https.HttpsError("invalid-argument", "Notification ID is required.");
    }
    const notificationRef = db.collection("notifications").doc(notificationId);
    const notificationDoc = await notificationRef.get();
    if (!notificationDoc.exists ||
        ((_a = notificationDoc.data()) === null || _a === void 0 ? void 0 : _a.userId) !== context.auth.uid) {
        throw new functions.https.HttpsError("permission-denied", "You do not have permission to update this notification.");
    }
    await notificationRef.update({ isRead: true });
    return { status: "success" };
});
/**
 * Retrieves and updates notification preferences for the authenticated user.
 * @param {any} data The data for the function call.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<any>} A promise that resolves with the preferences.
 */
exports.manageNotificationPreferences = functions.https.onCall(async (data, context) => {
    var _a;
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
    }
    const userRef = db.collection("users").doc(context.auth.uid);
    if (data.preferences) {
        await userRef.set({ notificationPreferences: data.preferences }, { merge: true });
        return { success: true, message: "Preferences updated." };
    }
    else {
        const userDoc = await userRef.get();
        return ((_a = userDoc.data()) === null || _a === void 0 ? void 0 : _a.notificationPreferences) || {};
    }
});
/**
 * Scheduled function to send reminders for upcoming events.
 * Runs every day at a specified time (e.g., 8 AM UTC).
 */
exports.sendEventReminders = functions.pubsub.schedule("every day 08:00")
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
        }
        else {
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
    }
    catch (error) {
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
            .get(); // We get all for now for demonstration, but this is inefficient.
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
    }
    catch (error) {
        console.error("Error processing agro-tourism booking reminders:", error);
    }
    console.log("Daily event reminder check finished.");
    return null;
});
//# sourceMappingURL=notifications.js.map