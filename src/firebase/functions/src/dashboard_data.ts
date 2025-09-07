

      

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import type { 
    AdminDashboardData,
    AdminActivity,
    FarmerDashboardData,
    CooperativeDashboardData,
    BuyerDashboardData,
    RegulatorDashboardData,
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



export const getPackagingSupplierDashboardData = functions.https.onCall(
  async (data, context): Promise<PackagingSupplierDashboardData> => {
    const supplierId = checkAuth(context);
    try {
        // Fetch real inventory data
        const inventorySnapshot = await db.collection('marketplaceItems')
            .where('sellerId', '==', supplierId)
            .where('category', '==', 'packaging-solutions')
            .get();

        const inventory = inventorySnapshot.docs.map(doc => {
            const item = doc.data();
            return {
                id: doc.id,
                item: item.name,
                stock: item.stock || 0, // Assuming a stock field exists
                reorderLevel: item.reorderLevel || 100, // Assuming a reorderLevel field
            };
        });
        
        // Fetch real orders
         const ordersSnapshot = await db.collection('marketplace_orders')
            .where('sellerId', '==', supplierId)
            .orderBy('createdAt', 'desc')
            .limit(10)
            .get();

        const buyerIds = [...new Set(ordersSnapshot.docs.map(doc => doc.data().buyerId))];
        const buyerProfiles: {[key: string]: string} = {};
        if(buyerIds.length > 0) {
            const buyerDocs = await db.collection('users').where(admin.firestore.FieldPath.documentId(), 'in', buyerIds).get();
            buyerDocs.forEach(doc => {
                buyerProfiles[doc.id] = doc.data().displayName || 'Unknown Customer';
            });
        }

        const incomingOrders = ordersSnapshot.docs.map(doc => {
            const order = doc.data();
            return {
                id: doc.id,
                customerName: buyerProfiles[order.buyerId] || 'Unknown Customer',
                product: order.listingName,
                quantity: order.quantity,
                status: order.status,
                actionLink: `/marketplace/my-orders/${doc.id}`,
            };
        });


        return { incomingOrders, inventory };

    } catch (error) {
        console.error("Error fetching packaging supplier dashboard data:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch dashboard data.");
    }
  }
);


export const getInputSupplierDashboardData = functions.https.onCall(
  async (data, context): Promise<InputSupplierDashboardData> => {
    const supplierId = checkAuth(context);

    try {
      // 1. Fetch active orders
      const ordersSnapshot = await db.collection('marketplace_orders')
        .where('sellerId', '==', supplierId)
        .get();

      const ordersData = ordersSnapshot.docs.map(doc => doc.data());
      const totalValue = ordersData.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

      const activeOrders = {
        count: ordersSnapshot.size,
        value: totalValue,
        link: '/marketplace/my-orders'
      };

      // 2. Keep other sections as mock data for now
      const demandForecast = [
        { id: 'df1', region: 'Rift Valley', product: 'DAP Fertilizer', trend: 'High', reason: 'Planting season approaching' }
      ];
      const productPerformance = [
        { id: 'pp1', productName: 'Eco-Fertilizer Plus', rating: 4.5, feedback: 'Great results on maize crops.', link: '#' }
      ];

      return {
        demandForecast,
        productPerformance,
        activeOrders,
      };

    } catch (error) {
        console.error("Error fetching Input Supplier dashboard data:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch dashboard data.");
    }
  }
);

export const getAgroExportDashboardData = functions.https.onCall(
  async (data, context): Promise<AgroExportDashboardData> => {
    checkAuth(context);
     try {
        const vtisForExportPromise = await db.collection('vti_registry')
            .where('metadata.forExport', '==', true)
            // Ideally, we'd have a `documentationStatus` field to query
            .limit(5)
            .get();

        const [vtisSnapshot] = await Promise.all([vtisForExportPromise]);

        const pendingCustomsDocs = vtisSnapshot.docs.map(doc => ({
            id: doc.id,
            vtiLink: `/traceability/batches/${doc.id}`,
            destination: doc.data().metadata.destinationCountry || 'Unknown',
            status: 'Awaiting Phytosanitary Certificate' // Mock status
        }));

        return {
            pendingCustomsDocs,
            // These remain mocked
            trackedShipments: [
                { id: 'ship1', status: 'In Transit', location: 'Indian Ocean', carrier: 'Maersk' }
            ],
            complianceAlerts: [
                { id: 'ca1', content: 'New packaging regulations for EU effective Aug 1.', actionLink: '#' }
            ]
        };
     } catch (error) {
        console.error("Error fetching agro-export dashboard data:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch dashboard data.");
    }
  }
);

export const getAgriTechInnovatorDashboardData = functions.https.onCall(
  async (data, context): Promise<AgriTechInnovatorDashboardData> => {
    const innovatorId = checkAuth(context);
    
    const keysSnapshot = await db.collection('users').doc(innovatorId).collection('api_keys')
        .orderBy('createdAt', 'desc')
        .get();

    const apiKeys = keysSnapshot.docs.map(doc => {
        const keyData = doc.data();
        return {
            id: doc.id,
            description: keyData.description,
            environment: keyData.environment,
            status: keyData.status,
            keyPrefix: keyData.keyPrefix, 
            createdAt: (keyData.createdAt as admin.firestore.Timestamp).toDate().toISOString(),
            key: `${keyData.keyPrefix}...${keyData.lastFour}` 
        }
    });

    // In a real app, this data would be pulled from system monitoring tools.
    return {
      apiKeys: apiKeys,
      sandboxStatus: {
        status: 'Operational',
        lastReset: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      integrationProjects: [
        { id: 'proj1', title: 'Real-time Cold Chain Monitoring with CoolTech', status: 'Live', partner: 'CoolTech Solutions', actionLink: '#' },
        { id: 'proj2', title: 'Drone-based Crop Scouting API Integration', status: 'In Development', partner: 'SkyAgroScout', actionLink: '#' },
      ],
    };
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
