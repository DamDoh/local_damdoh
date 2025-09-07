

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import type { 
    AdminDashboardData,
    AdminActivity,
    FarmerDashboardData,
    BuyerDashboardData,
    RegulatorDashboardData,
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
        const anomaliesPromise = await db.collection('traceability_events')
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
