
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

if (admin.apps.length === 0) {
  admin.initializeApp();
}

// This file will contain mock backend functions for fetching data
// for different role-based dashboards (hubs). These are simplified
// versions that return static mock data for development purposes.

/**
 * =================================================================
 * FARMER HUB
 * =================================================================
 */
export const getFarmerDashboardData = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
  }

  // In a real application, you would fetch personalized data for the authenticated user (context.auth.uid)
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
 * BUYER HUB
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
 * LOGISTICS PROVIDER HUB
 * =================================================================
 */
export const getLogisticsDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }

    const mockLogisticsData = {
        activeShipments: [
            { id: "shipment123", to: "City Market", status: "In Transit", eta: "2 hours", vtiLink: "/traceability/shipment123" },
            { id: "shipment456", to: "Export Port", status: "Delayed", eta: "6 hours", vtiLink: "/traceability/shipment456" }
        ],
        incomingJobs: [
            { id: "job1", from: "Green Valley Farms", to: "City Market", product: "Tomatoes", requirements: "Refrigerated", actionLink: "/jobs/details/job1" },
        ],
        performanceMetrics: {
            onTimePercentage: 98,
            fuelEfficiency: "15 mpg",
            actionLink: "/logistics/performance"
        }
    };

    return mockLogisticsData;
});

/**
 * =================================================================
 * FINANCIAL INSTITUTION HUB
 * =================================================================
 */
export const getFiDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }

    const mockFiData = {
        pendingApplications: [
            { id: "app1", applicantName: "J. Doe", type: "Crop Loan", amount: 5000, riskScore: 720, actionLink: "/finance/applications/app1" },
            { id: "app2", applicantName: "Sunrise Acres", type: "Equipment Loan", amount: 25000, riskScore: 810, actionLink: "/finance/applications/app2" }
        ],
        portfolioAtRisk: {
            count: 3,
            value: 45000,
            highestRisk: { name: "Risky Farm Co.", reason: "Drought conditions" },
            actionLink: "/finance/portfolio/risk"
        },
        marketUpdates: [
            { id: "update1", content: "Government announces new green energy subsidies for farms.", actionLink: "/news/article1" }
        ]
    };

    return mockFiData;
});

/**
 * =================================================================
 * AGRO EXPORT/IMPORT HUB
 * =================================================================
 */
export const getAgroExportDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }

    const mockAgroExportData = {
        pendingCustomsDocs: [
            { id: "shipment123", vtiLink: "/traceability/vti-123", destination: "Rotterdam, NL", status: "Awaiting Phytosanitary Certificate" },
            { id: "shipment789", vtiLink: "/traceability/vti-789", destination: "Singapore", status: "Ready for Declaration" }
        ],
        trackedShipments: [
            { id: "shipmentABC", status: "Customs Clearance", location: "Port of Mombasa", carrier: "Maersk" },
            { id: "shipmentDEF", status: "In Transit", location: "Indian Ocean", carrier: "CMA CGM" }
        ],
        complianceAlerts: [
            { id: "alertEU1", content: "New EU regulation on cocoa bean imports effective next month.", actionLink: "/regulations/eu/cocoa-2024" }
        ]
    };

    return mockAgroExportData;
});

/**
 * =================================================================
 * INPUT SUPPLIER HUB
 * =================================================================
 */
export const getInputSupplierDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }

    const mockInputSupplierData = {
        demandForecast: [
            { id: "forecast1", region: "Rift Valley, Kenya", product: "DAP Fertilizer", trend: "+15%", reason: "Early planting season detected via satellite imagery." },
            { id: "forecast2", region: "Punjab, India", product: "Pest-Resistant Wheat Seeds", trend: "+10%", reason: "Increased pest activity reported in region." }
        ],
        productPerformance: [
            { id: "perf1", productName: "SuperGrow Seed Variant X", rating: 4.8, feedback: "High germination rate reported by farmers.", link: "/products/perf1/reviews" }
        ],
        activeOrders: {
            count: 124,
            value: 85000,
            link: "/orders/active"
        }
    };

    return mockInputSupplierData;
});

/**
 * =================================================================
 * FIELD AGENT / AGRONOMIST HUB
 * =================================================================
 */
export const getFieldAgentDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }

    const mockFieldAgentData = {
        assignedFarmers: [
            { id: "farmerA", name: "Green Valley Farms", lastVisit: "2024-05-20", issues: 1, actionLink: "/profiles/farmerA" },
            { id: "farmerB", name: "Sunrise Acres", lastVisit: "2024-05-22", issues: 0, actionLink: "/profiles/farmerB" },
            { id: "farmerC", name: "Hillside Plots", lastVisit: "2024-05-19", issues: 3, actionLink: "/profiles/farmerC" },
        ],
        portfolioHealth: {
            overallScore: 88,
            alerts: ["Pest risk detected at Green Valley Farms"],
            actionLink: "/portfolio/health-overview"
        },
        pendingReports: 3,
        dataVerificationTasks: {
            count: 5,
            description: "New harvest data from Sunrise Acres requires verification.",
            actionLink: "/tasks/verification"
        }
    };
    
    return mockFieldAgentData;
});

/**
 * =================================================================
 * QUALITY ASSURANCE HUB
 * =================================================================
 */
export const getQaDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }

    const mockQaData = {
        pendingInspections: [
            { id: "insp1", productName: "Organic Hass Avocados", sellerName: "Green Valley Farms", batchId: "batch-avo-001", actionLink: "/inspections/insp1" },
            { id: "insp2", productName: "Grade A Maize", sellerName: "Sunrise Acres", batchId: "batch-maize-088", actionLink: "/inspections/insp2" }
        ],
        recentResults: [
            { id: "res1", productName: "Coffee Beans", result: "Pass", inspectedAt: "2024-05-28" },
            { id: "res2", productName: "Tomatoes", result: "Fail", reason: "Inconsistent sizing", inspectedAt: "2024-05-27" }
        ],
        qualityMetrics: {
            passRate: 98.5,
            averageScore: 95
        }
    };

    return mockQaData;
});


/**
 * =================================================================
 * CERTIFICATION BODY HUB
 * =================================================================
 */
export const getCertificationBodyDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }

    const mockCertBodyData = {
        pendingAudits: [
            { id: "audit1", farmName: "Green Valley Farms", standard: "USDA Organic", dueDate: "2024-06-15", actionLink: "/audits/audit1" },
            { id: "audit2", farmName: "Sunrise Acres", standard: "Fair Trade", dueDate: "2024-06-20", actionLink: "/audits/audit2" },
        ],
        certifiedEntities: [
            { id: "entity1", name: "Green Valley Farms", type: "Farmer", certificationStatus: "Active", actionLink: "/entities/entity1" },
            { id: "entity2", name: "FreshFoods Processors", type: "Processor", certificationStatus: "Pending", actionLink: "/entities/entity2" },
            { id: "entity3", name: "Old Mill Co.", type: "Processor", certificationStatus: "Expired", actionLink: "/entities/entity3" },
        ],
        standardsMonitoring: [
            { standard: "USDA Organic", adherenceRate: 98, alerts: 2, actionLink: "/monitoring/usda-organic" },
            { standard: "Fair Trade", adherenceRate: 95, alerts: 5, actionLink: "/monitoring/fair-trade" },
        ]
    };
    
    return mockCertBodyData;
});
