

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import type { 
    AdminDashboardData,
    AdminActivity,
    FarmerDashboardData,
    CooperativeDashboardData,
    BuyerDashboardData,
    LogisticsDashboardData,
    FiDashboardData,
    FieldAgentDashboardData,
    InputSupplierDashboardData,
    AgroExportDashboardData,
    ProcessingUnitDashboardData,
    WarehouseDashboardData,
    QaDashboardData,
    CertificationBodyDashboardData,
    ResearcherDashboardData,
    AgronomistDashboardData,
    AgroTourismDashboardData,
    InsuranceProviderDashboardData,
    EnergyProviderDashboardData,
    CrowdfunderDashboardData,
    EquipmentSupplierDashboardData,
    WasteManagementDashboardData,
    PackagingSupplierDashboardData,
    FinancialApplication,
    AgriTechInnovatorDashboardData,
    FarmerDashboardAlert,
    OperationsDashboardData,
    FinancialProduct,
    KnfBatch
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


export const getQaDashboardData = functions.https.onCall(
  (data, context): QaDashboardData => {
    checkAuth(context);
    return {
        pendingInspections: [
            { id: 'insp1', batchId: 'vti-xyz-123', productName: 'Avocado Batch', sellerName: 'Green Valley Farms', dueDate: new Date().toISOString(), actionLink: '#'}
        ],
        recentResults: [
            { id: 'res1', productName: 'Maize Batch', result: 'Fail', reason: 'Aflatoxin levels exceed limit.', inspectedAt: new Date().toISOString() }
        ],
        qualityMetrics: { passRate: 98, averageScore: 9.2 }
    };
  }
);


export const getCertificationBodyDashboardData = functions.https.onCall(
  async (data, context): Promise<CertificationBodyDashboardData> => {
    checkAuth(context);
    return {
        pendingAudits: [
            { id: 'aud1', farmName: 'Green Valley Farms', standard: 'EU Organic', dueDate: new Date().toISOString(), actionLink: '#' }
        ],
        certifiedEntities: [
            { id: 'ent1', name: 'Riverside Orchards', type: 'Farm', certificationStatus: 'Active', actionLink: '#' }
        ],
        standardsMonitoring: [
            { standard: 'Fair Trade', adherenceRate: 95, alerts: 2, actionLink: '#' }
        ]
    };
  }
);

export const getResearcherDashboardData = functions.https.onCall(
    async (data, context): Promise<ResearcherDashboardData> => {
      const userId = checkAuth(context);
      try {
          // Fetch knowledge hub contributions made by this user
          const articlesSnapshot = await db.collection('knowledge_articles')
              .where('authorId', '==', userId) // Query by UID
              .orderBy('createdAt', 'desc')
              .limit(10)
              .get();

          const knowledgeHubContributions = articlesSnapshot.docs.map(doc => {
              const article = doc.data();
              return {
                  id: doc.id,
                  title: article.title_en || article.title_km || "Untitled Article",
                  status: 'Published' as const // Placeholder status
              };
          });

          // Mock data for datasets and projects, as these collections don't exist yet
          const availableDatasets = [
              { id: 'set1', name: 'Rift Valley Maize Yields (2020-2023)', dataType: 'CSV', accessLevel: 'Requires Request' as const, actionLink: '#' },
              { id: 'set2', name: 'Regional Soil Health Data (Anonymized)', dataType: 'JSON', accessLevel: 'Public' as const, actionLink: '#' },
          ];
          
          const ongoingProjects = [
              { id: 'proj1', title: 'Impact of KNF on Soil Health in Smallholder Farms', progress: 65, collaborators: ['University of Nairobi'], actionLink: '#' },
              { id: 'proj2', title: 'AI-driven Pest Identification Accuracy Study', progress: 30, collaborators: ['DamDoh AI Team'], actionLink: '#' }
          ];

          return {
              availableDatasets,
              ongoingProjects,
              knowledgeHubContributions,
          };

      } catch (error) {
          console.error("Error fetching researcher dashboard data:", error);
          throw new functions.https.HttpsError("internal", "Failed to fetch dashboard data.");
      }
    }
);



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
