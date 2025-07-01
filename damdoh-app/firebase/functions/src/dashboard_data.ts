
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {
    FarmerDashboardData, BuyerDashboardData, FiDashboardData, 
    InputSupplierDashboardData, MarketplaceOrder
} from "./types";

const db = admin.firestore();

// =================================================================
// Functions with Real / Hybrid Logic
// =================================================================

export const getFarmerDashboardData = functions.https.onCall(
  async (data, context): Promise<FarmerDashboardData> => {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    
    const farmerId = context.auth.uid;

    try {
        const farmsPromise = db.collection('farms').where('ownerId', '==', farmerId).get();
        const cropsPromise = db.collection('crops').where('ownerId', '==', farmerId).get();
        const knfBatchesPromise = db.collection('knf_batches').where('userId', '==', farmerId).get();

        const [farmsSnapshot, cropsSnapshot, knfBatchesSnapshot] = await Promise.all([
            farmsPromise,
            cropsPromise,
            knfBatchesPromise,
        ]);

        const farms = farmsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const recentCrops = cropsSnapshot.docs
            .map(doc => {
                const cropData = doc.data();
                return {
                    id: doc.id,
                    ...cropData,
                    createdAt: (cropData.createdAt as admin.firestore.Timestamp)?.toDate ? (cropData.createdAt as admin.firestore.Timestamp).toDate() : new Date(0),
                    plantingDate: (cropData.plantingDate as admin.firestore.Timestamp)?.toDate ? (cropData.plantingDate as admin.firestore.Timestamp).toDate().toISOString() : null,
                };
            })
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()) // Sort in-memory
            .slice(0, 5); // Take the 5 most recent
        
        const activeKnfBatches = knfBatchesSnapshot.docs
            .map(doc => {
                const batchData = doc.data();
                return {
                    id: doc.id,
                    ...batchData,
                    nextStepDate: (batchData.nextStepDate as admin.firestore.Timestamp)?.toDate ? (batchData.nextStepDate as admin.firestore.Timestamp).toDate().toISOString() : null,
                };
            })
            .filter(batch => batch.status === 'Fermenting' || batch.status === 'Ready') // Filter in-memory
            .slice(0, 5);


        return {
            farmCount: farms.length,
            cropCount: cropsSnapshot.size, 
            recentCrops: recentCrops.map(({ createdAt, ...rest }) => rest) as any, // remove temporary sort key
            knfBatches: activeKnfBatches as any,
        };

    } catch (error) {
        console.error("Error fetching farmer dashboard data:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch farmer dashboard data.");
    }
  },
);

export const getBuyerDashboardData = functions.https.onCall(
  async (data, context): Promise<BuyerDashboardData> => {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    
    try {
        const farmersSnapshot = await db.collection("users").where("primaryRole", "==", "Farmer").limit(3).get();
        const sourcingRecommendations = farmersSnapshot.docs.map(doc => {
            const farmerData = doc.data();
            return {
                id: doc.id,
                name: farmerData.displayName || "Unnamed Farm",
                product: farmerData.profileData?.crops?.[0] || "Various Produce", 
                reliability: Math.floor(Math.random() * (98 - 85 + 1) + 85),
                vtiVerified: Math.random() > 0.3, 
            };
        });

        const liveData: BuyerDashboardData = {
          supplyChainRisk: {
            region: "East Africa",
            level: "Medium",
            factor: "Potential for port congestion.",
            action: { label: "View Logistics Report", link: "/logistics/reports/east-africa" },
          },
          sourcingRecommendations: sourcingRecommendations,
          marketPriceIntelligence: {
            product: "Coffee Arabica",
            trend: "up",
            forecast: "Prices expected to rise 5-8% in the next quarter due to weather patterns.",
            action: { label: "View Full Market Analysis", link: "/market-intelligence/coffee" },
          },
        };
        return liveData;
    } catch (error) {
        console.error("Error fetching buyer dashboard data:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch buyer dashboard data.");
    }
  },
);

export const getFiDashboardData = functions.https.onCall(
  async (data, context): Promise<FiDashboardData> => {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    try {
        const farmersSnapshot = await db.collection("users").where("primaryRole", "==", "Farmer").limit(4).get();
        const pendingApplications = farmersSnapshot.docs.map(doc => {
            const farmerData = doc.data();
            return {
                id: doc.id,
                applicantName: farmerData.displayName || "Unnamed Farmer",
                type: Math.random() > 0.5 ? "Crop Loan" : "Equipment Financing",
                amount: Math.floor(Math.random() * (100000 - 5000 + 1) + 5000),
                riskScore: Math.floor(Math.random() * (800 - 600 + 1) + 600),
                actionLink: `/applications/${doc.id}`
            };
        });

        const liveData: FiDashboardData = {
            pendingApplications: pendingApplications,
            portfolioAtRisk: {
                count: 12, value: 45000,
                highestRisk: { name: "Dry Season Farmers Group", reason: "Drought warning in region." },
                actionLink: "/risk/analysis/q4",
            },
            marketUpdates: [
                { id: "update1", content: "Central Bank raises interest rates by 0.25%.", actionLink: "/news/cbr-rates-q4" },
                { id: "update2", content: "New government subsidy announced for organic farming inputs.", actionLink: "/news/organic-subsidy" },
            ]
        };
        return liveData;
    } catch (error) {
        console.error("Error fetching FI dashboard data:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch FI dashboard data.");
    }
  },
);

export const getInputSupplierDashboardData = functions.https.onCall(
  async (data, context): Promise<InputSupplierDashboardData> => {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    const supplierId = context.auth.uid;
    
    try {
        const ordersSnapshot = await db.collection("marketplace_orders")
            .where("sellerId", "==", supplierId)
            .where("status", "in", ["pending", "confirmed"])
            .get();

        let totalValue = 0;
        const activeOrders = ordersSnapshot.docs.map(doc => {
            const orderData = doc.data() as MarketplaceOrder;
            totalValue += orderData.totalPrice;
            return orderData;
        });

        const liveData: InputSupplierDashboardData = {
          demandForecast: [
            { id: "fc1", region: "Rift Valley, Kenya", product: "Drought-Resistant Maize Seed", trend: "High", reason: "Below-average rainfall predicted for the next planting season." },
            { id: "fc2", region: "Northern Nigeria", product: "Organic NPK Fertilizer", trend: "Steady", reason: "Increased adoption of organic farming practices in the region." },
          ],
          productPerformance: [
            { id: "perf1", productName: "Eco-Fertilizer 5-3-2", rating: 4.5, feedback: "Great results on tomato yield, will re-order.", link: "/products/eco-fertilizer/reviews" },
            { id: "perf2", productName: "Pioneer P3812W Maize Seed", rating: 4.8, feedback: "Excellent germination rate and crop uniformity.", link: "/products/pioneer-p3812w/reviews" },
          ],
          activeOrders: {
            count: activeOrders.length,
            value: totalValue,
            link: "/marketplace/orders/manage"
          }
        };
        return liveData;
    } catch (error) {
         console.error("Error fetching input supplier dashboard data:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch input supplier dashboard data.");
    }
  },
);
// Other dashboard data functions would be implemented with live data here.
// For now, they are removed to avoid using mock data.

// Placeholder exports for roles that don't have a dashboard yet
// to avoid breaking the frontend components that import them.
export const getLogisticsDashboardData = functions.https.onCall(async () => ({}));
export const getAgroExportDashboardData = functions.https.onCall(async () => ({}));
export const getFieldAgentDashboardData = functions.https.onCall(async () => ({}));
export const getEnergyProviderDashboardData = functions.https.onCall(async () => ({}));
export const getPackagingSupplierDashboardData = functions.https.onCall(async () => ({}));
export const getRegulatorDashboardData = functions.https.onCall(async () => ({}));
export const getQaDashboardData = functions.https.onCall(async () => ({}));
export const getCertificationBodyDashboardData = functions.https.onCall(async () => ({}));
export const getResearcherDashboardData = functions.https.onCall(async () => ({}));
export const getAgronomistDashboardData = functions.https.onCall(async () => ({}));
export const getAgroTourismDashboardData = functions.https.onCall(async () => ({}));
export const getInsuranceProviderDashboardData = functions.https.onCall(async () => ({}));
export const getCrowdfunderDashboardData = functions.https.onCall(async () => ({}));
export const getProcessingUnitDashboardData = functions.https.onCall(async () => ({}));
export const getWarehouseDashboardData = functions.https.onCall(async () => ({}));
export const getCooperativeDashboardData = functions.https.onCall(async () => ({}));
