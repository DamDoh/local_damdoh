
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import type { AdminDashboardData, AdminActivity } from '@/lib/types';


const db = admin.firestore();

const checkAuth = (context: functions.https.CallableContext) => {
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
 * Firestore trigger that listens for new documents in the `profile_views` collection.
 * It atomically increments the `viewCount` on the corresponding user's profile.
 * This is the new, scalable way to handle view counts.
 */
export const onNewProfileView = functions.firestore
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
        } catch (error) {
            console.error(`Failed to increment view count for user ${viewedId}:`, error);
        }
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
 * Fetches engagement statistics for a given user.
 * @param {object} data The data for the function call.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<object>} A promise that resolves with the user's engagement stats.
 */
export const getUserEngagementStats = functions.https.onCall(async (data, context) => {
    checkAuth(context);
    const { userId } = data;
     if (!userId) {
        throw new functions.https.HttpsError('invalid-argument', 'error.userId.required');
    }

    try {
        // Fetch the user document to get the pre-aggregated view count.
        const userDoc = await db.collection('users').doc(userId).get();
        const profileViews = userDoc.data()?.viewCount || 0;

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
    } catch (error) {
        console.error(`Error fetching engagement stats for user ${userId}:`, error);
        throw new functions.https.HttpsError('internal', 'error.stats.fetchFailed');
    }
});


// =================================================================
// DASHBOARD DATA FUNCTIONS
// =================================================================

export const getAdminDashboardData = functions.https.onCall(async (data, context): Promise<AdminDashboardData> => {
    // Ideally, you'd add an admin role check here.
    checkAuth(context);
    
    try {
        const usersPromise = db.collection('users').get();
        const farmsPromise = db.collection('farms').get();
        const listingsPromise = db.collection('marketplaceItems').get();
        const pendingApprovalsPromise = db.collection('marketplaceItems').where('status', '==', 'pending_approval').get();

        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const newUsersQuery = db.collection('users').where('createdAt', '>=', sevenDaysAgo).get();

        const [usersSnap, farmsSnap, listingsSnap, newUsersSnap, pendingApprovalsSnap] = await Promise.all([
            usersPromise,
            farmsPromise,
            listingsPromise,
            newUsersQuery,
            pendingApprovalsPromise,
        ]);

        return {
            totalUsers: usersSnap.size,
            totalFarms: farmsSnap.size,
            totalListings: listingsSnap.size,
            pendingApprovals: pendingApprovalsSnap.size,
            newUsersLastWeek: newUsersSnap.size,
        };
    } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch admin dashboard data.");
    }
});


export const getAdminRecentActivity = functions.https.onCall(async (data, context): Promise<{ activity: AdminActivity[] }> => {
    checkAuth(context);
    try {
        const newUsersPromise = db.collection('users').orderBy('createdAt', 'desc').limit(5).get();
        const newListingsPromise = db.collection('marketplaceItems').orderBy('createdAt', 'desc').limit(5).get();

        const [usersSnap, listingsSnap] = await Promise.all([newUsersPromise, newListingsPromise]);
        
        const activities: AdminActivity[] = [];

        usersSnap.forEach(doc => {
            const user = doc.data();
            activities.push({
                id: doc.id,
                type: 'New User',
                primaryInfo: user.displayName,
                secondaryInfo: user.primaryRole,
                timestamp: (user.createdAt as admin.firestore.Timestamp).toDate().toISOString(),
                link: `/profiles/${doc.id}`,
                avatarUrl: user.avatarUrl,
            });
        });

        listingsSnap.forEach(doc => {
            const listing = doc.data();
            activities.push({
                id: doc.id,
                type: 'New Listing',
                primaryInfo: listing.name,
                secondaryInfo: listing.category,
                timestamp: (listing.createdAt as admin.firestore.Timestamp).toDate().toISOString(),
                link: `/marketplace/${doc.id}`,
                avatarUrl: listing.imageUrl,
            });
        });
        
        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        return { activity: activities.slice(0, 10) };
    } catch (error) {
         console.error("Error fetching admin recent activity:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch recent activity.");
    }
});
