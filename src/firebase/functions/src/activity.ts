

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { checkAuth, getUserDocument } from './utils';

const db = admin.firestore();


/**
 * Logs a profile view event. This function ONLY writes to the `profile_views` collection.
 * The actual incrementing of the view count is handled by the `onNewProfileView` trigger.
 * @param {any} data The data for the function call.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{success: boolean, logId?: string, message?: string}>} A promise that resolves with the operation status.
 */
export const logProfileView = functions.https.onCall(async (data, context) => {
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
 * Fetches recent activity for a given user.
 * @param {any} data The data for the function call.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{activities: any[]}>} A promise that resolves with the user's recent activities.
 */
export const getUserActivity = functions.https.onCall(async (data, context) => {
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
        
        const activities: any[] = [];
        const toISODate = (timestamp: admin.firestore.Timestamp | undefined) => {
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
            const event = doc.data();
            activities.push({
                id: doc.id,
                type: `Logged Event: ${event.eventType}`,
                title: event.payload?.inputId || event.payload?.cropType || 'Traceability Update',
                timestamp: toISODate(event.timestamp),
                icon: 'GitBranch'
            });
        });

        // Sort all activities by date and take the most recent 10
        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        return { activities: activities.slice(0, 10) };

    } catch (error) {
        console.error(`Error fetching activity for user ${userId}:`, error);
        throw new functions.https.HttpsError('internal', 'error.activity.fetchFailed');
    }
});

/**
 * Fetches engagement statistics for a given user. This is a helper function for the backend.
 * @param {string} userId The ID of the user.
 * @return {Promise<object>} A promise that resolves with the user's engagement stats.
 */
export async function getUserEngagementStats(userId: string): Promise<{ profileViews: number, postLikes: number, postComments: number }> {
    if (!userId) {
        throw new Error('A userId must be provided.');
    }
    try {
        const userDoc = await getUserDocument(userId);
        const profileViews = userDoc?.data()?.viewCount || 0;

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
    } catch (error) {
        console.error(`Error fetching engagement stats for user ${userId}:`, error);
        throw new Error('Could not fetch engagement statistics.');
    }
};

/**
 * Callable Cloud Function wrapper for getUserEngagementStats.
 */
export const getUserEngagementStatsCallable = functions.https.onCall(async (data, context) => {
    checkAuth(context);
    const { userId } = data;
    if (!userId) {
        throw new functions.https.HttpsError('invalid-argument', 'error.userId.required');
    }
    try {
        return await getUserEngagementStats(userId);
    } catch (error: any) {
        throw new functions.https.HttpsError('internal', error.message || 'error.stats.fetchFailed');
    }
});