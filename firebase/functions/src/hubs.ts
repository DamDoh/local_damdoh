
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

if (admin.apps.length === 0) {
  admin.initializeApp();
}

/**
 * =================================================================
 * FARMER MISSION CONTROL HUB
 * =================================================================
 */
export const getFarmerDashboardData = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
  }
  
  const mockDashboardData = {
    predictedYield: {
      crop: "Maize",
      variance: "+8%",
      confidence: "High",
    },
    irrigationSchedule: {
      next_run: "Tomorrow, 6:00 AM",
      duration_minutes: 45,
      recommendation: "Slightly increase duration due to dry conditions.",
    },
    matchedBuyers: [
      { 
        id: "buyer1", 
        name: "Global Grain Corp", 
        matchScore: 95,
        request: "Seeking 50 tons of Grade A Maize for export. VTI required.",
        contactId: "contact_ggc"
      },
      { 
        id: "buyer2", 
        name: "Local Millers Inc.", 
        matchScore: 88,
        request: "Needs 10 tons of milling wheat, immediate delivery.",
        contactId: "contact_lmi"
      },
    ],
    trustScore: {
        reputation: 850,
        certifications: [
            { id: "cert1", name: "Organic Certified", issuingBody: "Global Organic Alliance" },
            { id: "cert2", name: "Fair Trade Certified", issuingBody: "Fair Trade International" }
        ]
    }
  };

  return mockDashboardData;
});


/**
 * =================================================================
 * BUYER COMMAND CENTER
 * =================================================================
 */
export const getBuyerDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }

    const mockBuyerData = {
        supplyChainRisk: {
            region: "East Africa",
            level: "Moderate",
            factor: "Potential transport delays due to weather.",
            action: {
                label: "View Alternate Routes",
                link: "/logistics/routes?region=east-africa"
            }
        },
        sourcingRecommendations: [
            { id: "farmerA", name: "Green Valley Farms", product: "Organic Tomatoes", reliability: 98, vtiVerified: true },
            { id: "farmerB", name: "Sunrise Acres", product: "Grade A Maize", reliability: 95, vtiVerified: true },
            { id: "farmerC", name: "New Harvest Co.", product: "Soybeans", reliability: 85, vtiVerified: false }
        ],
        marketPriceIntelligence: {
            product: "Coffee Beans",
            trend: "up",
            forecast: "Expected to rise 5% in the next quarter.",
            action: {
                label: "Secure Forward Contract",
                link: "/marketplace/search?q=coffee+beans&type=contract"
            }
        }
    };
    
    return mockBuyerData;
});


/**
 * =================================================================
 * REGULATORY OVERSIGHT PANEL
 * =================================================================
 */
export const getRegulatorDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }

    const mockRegulatorData = {
        complianceRiskAlerts: [
            { id: "alert1", region: "Region A", issue: "Pesticide usage above limit", severity: "High", actionLink: "/reports/compliance/region-a" },
            { id: "alert2", region: "Region B", issue: "Unverified organic claims", severity: "Medium", actionLink: "/reports/compliance/region-b" }
        ],
        pendingCertifications: {
            count: 5,
            actionLink: "/certifications/pending"
        },
        supplyChainAnomalies: [
            { id: "anomaly1", description: "Unusual temperature drop in shipment XYZ", level: "Critical", vtiLink: "/traceability/shipment-xyz" },
            { id: "anomaly2", description: "VTI mismatch for batch ABC", level: "High", vtiLink: "/traceability/batch-abc" }
        ]
    };

    return mockRegulatorData;
});


/**
 * =================================================================
 * LOGISTICS COORDINATION HUB
 * =================================================================
 */
export const getLogisticsDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }

    const mockLogisticsData = {
        optimizedRoutes: [
            { id: "route1", from: "Farm A", to: "Warehouse B", savings: "15% fuel", eta: "4 hours", actionLink: "/routes/plan/route1" },
        ],
        shipmentStatus: {
            total: 150,
            inTransit: 120,
            delayed: 5,
            actionLink: "/shipments/overview"
        },
        demandHotspots: [
            { id: "hotspot1", location: "City Market", product: "Fresh Vegetables", demand: "High", actionLink: "/logistics/demand-map" },
        ]
    };
    
    return mockLogisticsData;
});


/**
 * =================================================================
 * FINANCIAL INSTITUTION PORTAL
 * =================================================================
 */
export const getFiDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }

    const mockFiData = {
        creditRiskAssessments: [
            { id: "farmerX", name: "J. Doe", score: 720, recommendation: "Approve", actionLink: "/profiles/farmerX/assessment" },
        ],
        portfolioPerformance: {
            totalValue: 1250000,
            nonPerforming: 0.05,
            actionLink: "/finance/portfolio/overview"
        },
        emergingOpportunities: [
            { id: "opp1", sector: "Aquaculture", region: "Region C", potential: "High Growth", actionLink: "/markets/opportunities/aquaculture" },
        ]
    };

    return mockFiData;
});
