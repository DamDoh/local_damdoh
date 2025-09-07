

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import type { 
    AdminDashboardData,
    AdminActivity
} from "@/lib/types";

const db = admin.firestore();

// Helper to check for authentication in a consistent way
const checkAuth = (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "error.unauthenticated",
    );
  }
  return context.auth.uid;
};

// =================================================================
// LIVE DATA DASHBOARDS
// =================================================================

// Note: All functions are being systematically refactored into their own
// dedicated files (e.g., `src/functions/farmer.ts`, `src/functions/buyer.ts`).
// This file will eventually be empty.


// =================================================================
// DASHBOARDS WITH PARTIAL OR MOCK DATA
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
