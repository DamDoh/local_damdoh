

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import type { 
    AdminDashboardData,
    AdminActivity,
    BuyerDashboardData,
    RegulatorDashboardData,
    FiDashboardData,
    FieldAgentDashboardData,
    AgroExportDashboardData,
    QaDashboardData,
    WasteManagementDashboardData
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



export const getBuyerDashboardData = functions.https.onCall(
  async (data, context): Promise<BuyerDashboardData> => {
    checkAuth(context);
    
    try {
        // --- Sourcing Recommendations ---
        // Fetch a few highly-rated, verified product listings.
        const recommendationsSnapshot = await db.collection('marketplaceItems')
            .where('listingType', '==', 'Product')
            .where('isSustainable', '==', true) // Example filter for "good" products
            .orderBy('createdAt', 'desc')
            .limit(5)
            .get();
        
        const sellerIds = [...new Set(recommendationsSnapshot.docs.map(doc => doc.data().sellerId))];
        const sellerProfiles: Record<string, string> = {};
        if (sellerIds.length > 0) {
            const sellersSnapshot = await db.collection('users').where(admin.firestore.FieldPath.documentId(), 'in', sellerIds).get();
            sellersSnapshot.forEach(doc => {
                sellerProfiles[doc.id] = doc.data().displayName || 'Unknown Seller';
            });
        }

        const sourcingRecommendations = recommendationsSnapshot.docs.map(doc => {
            const item = doc.data();
            return {
                id: doc.id,
                name: sellerProfiles[item.sellerId] || 'Verified Supplier',
                product: item.name,
                reliability: 85 + Math.floor(Math.random() * 15), // Mock reliability
                vtiVerified: !!item.relatedTraceabilityId,
            };
        });

        // --- Mock Data for other sections ---
        // These sections would require more complex AI/data analysis in a real app.
        const supplyChainRisk = { 
            region: 'East Africa', 
            level: 'Medium', 
            factor: 'Drought conditions affecting coffee bean yields.', 
            action: { label: 'Diversify Sourcing', link: '/network?role=Farmer&region=WestAfrica' }
        };
        const marketPriceIntelligence = { 
            product: 'Coffee Beans', 
            trend: 'up' as 'up' | 'down' | 'stable', 
            forecast: 'Prices expected to rise 5% next month due to weather.', 
            action: { label: 'Secure Forward Contracts', link: '/marketplace?category=fresh-produce-fruits' } // updated link to match a category
        };

        return {
            supplyChainRisk,
            sourcingRecommendations,
            marketPriceIntelligence
        };

    } catch (error) {
        console.error("Error fetching buyer dashboard data:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch dashboard data for buyer.");
    }
  }
);


export const getRegulatorDashboardData = functions.https.onCall(
  async (data, context): Promise<RegulatorDashboardData> => {
    checkAuth(context);

    try {
        const anomaliesPromise = db.collection('traceability_events')
            .where('payload.isAnomaly', '==', true)
            .limit(5)
            .get();

        const [anomaliesSnapshot] = await Promise.all([anomaliesPromise]);
        
        const supplyChainAnomalies = anomaliesSnapshot.docs.map(doc => {
            const event = doc.data();
            return {
                 id: doc.id, 
                 description: event.payload.anomalyDescription || 'Unusual supply chain activity detected.', 
                 level: 'Warning' as 'Critical' | 'Warning', 
                 vtiLink: `/traceability/batches/${event.vtiId}` 
            }
        });

        return {
            // These remain mocked as their data sources are complex
            complianceRiskAlerts: [
                { id: 'alert1', issue: 'Unverified organic inputs detected in VTI log', region: 'Rift Valley', severity: 'High', actionLink: '#' },
            ],
            pendingCertifications: { count: 12, actionLink: '#' },
            supplyChainAnomalies,
        };
    } catch (error) {
        console.error("Error fetching regulator dashboard data:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch dashboard data.");
    }
  }
);


export const getFieldAgentDashboardData = functions.https.onCall(
  async (data, context): Promise<FieldAgentDashboardData> => {
    const agentId = checkAuth(context);
    
    try {
        const agentDoc = await db.collection('users').doc(agentId).get();
        if (!agentDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Agent profile not found.');
        }
        
        const agentData = agentDoc.data();
        // Assuming assigned farmers are stored in profileData.assignedFarmers
        const assignedFarmerIds = agentData?.profileData?.assignedFarmers || [];
        
        let assignedFarmers: FieldAgentDashboardData['assignedFarmers'] = [];

        if (assignedFarmerIds.length > 0) {
            // Firestore 'in' query is limited to 30 items per query.
            // For a production app, this would need chunking if an agent has > 30 farmers.
            const farmersSnapshot = await db.collection('users').where(admin.firestore.FieldPath.documentId(), 'in', assignedFarmerIds.slice(0, 30)).get();
            
            assignedFarmers = farmersSnapshot.docs.map(doc => {
                const farmerData = doc.data();
                // Mocking lastVisit and issues for now
                return {
                    id: doc.id,
                    name: farmerData.displayName || 'Unknown Farmer',
                    lastVisit: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
                    issues: Math.floor(Math.random() * 3), // Random number of issues
                    actionLink: `/profiles/${doc.id}`
                };
            });
        }
        
        // Keep other parts mocked for this iteration
        const portfolioHealth = {
            overallScore: 85,
            alerts: ['Pest alert in North region'],
            actionLink: '#'
        };
        const pendingReports = 3;
        const dataVerificationTasks = {
            count: 8,
            description: 'Verify harvest logs for maize',
            actionLink: '#'
        };

        return {
            assignedFarmers,
            portfolioHealth,
            pendingReports,
            dataVerificationTasks
        };
        
    } catch (error) {
        console.error("Error fetching field agent dashboard data:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch dashboard data for field agent.");
    }
  }
);


export const getAgroExportDashboardData = functions.https.onCall(
  async (data, context): Promise<AgroExportDashboardData> => {
    checkAuth(context);
     try {
        const vtisForExportPromise = db.collection('vti_registry')
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

export const getWasteManagementDashboardData = functions.https.onCall(
  (data, context): WasteManagementDashboardData => {
    checkAuth(context);
    return {
      incomingWasteStreams: [
        { id: 'waste1', type: 'Maize Stover', source: 'Green Valley Farms', quantity: '10 tons' }
      ],
      compostBatches: [
        { id: 'comp1', status: 'Active', estimatedCompletion: new Date(Date.now() + 86400000 * 30).toISOString() },
        { id: 'comp2', status: 'Curing', estimatedCompletion: new Date(Date.now() + 86400000 * 10).toISOString() },
      ],
      finishedProductInventory: [
        { product: 'Grade A Compost', quantity: '25 tons', actionLink: '#' }
      ]
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
