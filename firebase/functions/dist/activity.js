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
exports.getUserEngagementStats = exports.getUserActivity = exports.onNewProfileView = exports.logProfileView = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
const checkAuth = (context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "error.unauthenticated");
    }
    return context.auth.uid;
};
/**
 * Logs a profile view event. This function ONLY writes to the `profile_views` collection.
 * The actual incrementing of the view count is handled by the `onNewProfileView` trigger.
 * @param {any} data The data for the function call.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{success: boolean, logId?: string, message?: string}>} A promise that resolves with the operation status.
 */
exports.logProfileView = functions.https.onCall(async (data, context) => {
    const viewerId = checkAuth(context);
    const { viewedId } = data;
    if (!viewedId) {
        throw new functions.https.HttpsError("invalid-argument", "error.viewedId.required");
    }
    // Don't log self-views
    if (viewerId === viewedId) {
        return { success: true, message: "Self-view, not logged." };
    }
    const logRef = db.collection('profile_views').doc();
    await logRef.set({
        viewerId,
        viewedId,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { success: true, logId: logRef.id };
});
/**
 * Firestore trigger that listens for new documents in the `profile_views` collection.
 * It atomically increments the `viewCount` on the corresponding user's profile.
 * This is the new, scalable way to handle view counts.
 */
exports.onNewProfileView = functions.firestore
    .document('profile_views/{viewId}')
    .onCreate(async (snap, context) => {
    const viewData = snap.data();
    if (!viewData) {
        console.error("View log created with no data:", context.params.viewId);
        return;
    }
    const { viewedId } = viewData;
    if (!viewedId) {
        console.error("View log is missing 'viewedId':", context.params.viewId);
        return;
    }
    const viewedUserRef = db.collection('users').doc(viewedId);
    try {
        // Atomically increment the view count on the user's profile.
        await viewedUserRef.update({
            viewCount: admin.firestore.FieldValue.increment(1)
        });
        console.log(`Successfully incremented view count for user ${viewedId}.`);
    }
    catch (error) {
        console.error(`Failed to increment view count for user ${viewedId}:`, error);
    }
});
/**
 * Fetches recent activity for a given user.
 * @param {any} data The data for the function call.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{activities: any[]}>} A promise that resolves with the user's recent activities.
 */
exports.getUserActivity = functions.https.onCall(async (data, context) => {
    checkAuth(context);
    const { userId } = data;
    if (!userId) {
        throw new functions.https.HttpsError('invalid-argument', 'error.userId.required');
    }
    try {
        const postsPromise = db.collection('posts').where('userId', '==', userId).orderBy('createdAt', 'desc').limit(5).get();
        const ordersPromise = db.collection('marketplace_orders').where('buyerId', '==', userId).orderBy('createdAt', 'desc').limit(5).get();
        const salesPromise = db.collection('marketplace_orders').where('sellerId', '==', userId).orderBy('createdAt', 'desc').limit(5).get();
        const eventsPromise = db.collection('traceability_events').where('actorRef', '==', userId).orderBy('timestamp', 'desc').limit(5).get();
        const [postsSnap, ordersSnap, salesSnap, eventsSnap] = await Promise.all([postsPromise, ordersPromise, salesPromise, eventsSnap]);
        const activities = [];
        const toISODate = (timestamp) => {
            return timestamp && timestamp.toDate ? timestamp.toDate().toISOString() : new Date().toISOString();
        };
        postsSnap.forEach(doc => {
            const post = doc.data();
            activities.push({
                id: doc.id,
                type: 'Shared a Post',
                title: post.content.substring(0, 70) + (post.content.length > 70 ? '...' : ''),
                timestamp: toISODate(post.createdAt),
                icon: 'MessageSquare'
            });
        });
        ordersSnap.forEach(doc => {
            const order = doc.data();
            activities.push({
                id: doc.id,
                type: 'Placed an Order',
                title: `For: ${order.listingName}`,
                timestamp: toISODate(order.createdAt),
                icon: 'ShoppingCart'
            });
        });
        salesSnap.forEach(doc => {
            const sale = doc.data();
            activities.push({
                id: doc.id,
                type: 'Received an Order',
                title: `For: ${sale.listingName}`,
                timestamp: toISODate(sale.createdAt),
                icon: 'CircleDollarSign'
            });
        });
        eventsSnap.forEach(doc => {
            var _a, _b;
            const event = doc.data();
            activities.push({
                id: doc.id,
                type: `Logged Event: ${event.eventType}`,
                title: ((_a = event.payload) === null || _a === void 0 ? void 0 : _a.inputId) || ((_b = event.payload) === null || _b === void 0 ? void 0 : _b.cropType) || 'Traceability Update',
                timestamp: toISODate(event.timestamp),
                icon: 'GitBranch'
            });
        });
        // Sort all activities by date and take the most recent 10
        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return { activities: activities.slice(0, 10) };
    }
    catch (error) {
        console.error(`Error fetching activity for user ${userId}:`, error);
        throw new functions.https.HttpsError('internal', 'error.activity.fetchFailed');
    }
});
/**
 * Fetches engagement statistics for a given user.
 * @param {object} data The data for the function call.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<object>} A promise that resolves with the user's engagement stats.
 */
exports.getUserEngagementStats = functions.https.onCall(async (data, context) => {
    var _a;
    checkAuth(context);
    const { userId } = data;
    if (!userId) {
        throw new functions.https.HttpsError('invalid-argument', 'error.userId.required');
    }
    try {
        // Fetch the user document to get the pre-aggregated view count.
        const userDoc = await db.collection('users').doc(userId).get();
        const profileViews = ((_a = userDoc.data()) === null || _a === void 0 ? void 0 : _a.viewCount) || 0;
        // The logic for likes and comments remains the same, as it's already performant.
        const postsQuery = db.collection('posts').where('userId', '==', userId).get();
        const postsSnapshot = await postsQuery;
        let postLikes = 0;
        let postComments = 0;
        postsSnapshot.forEach(doc => {
            postLikes += doc.data().likesCount || 0;
            postComments += doc.data().commentsCount || 0;
        });
        return {
            profileViews,
            postLikes,
            postComments
        };
    }
    catch (error) {
        console.error(`Error fetching engagement stats for user ${userId}:`, error);
        throw new functions.https.HttpsError('internal', 'error.stats.fetchFailed');
    }
});
//# sourceMappingURL=activity.js.map