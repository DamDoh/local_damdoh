
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK (only once)
// Avoid re-initializing if it's already done in index.ts
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

// --- Cross-Cutting Service: Dashboard Data Aggregation ---
// This file contains backend functions responsible for fetching and aggregating
// data from various modules to populate role-based dashboards/hubs for users.
// In a real application, these functions would replace mock data with actual
// data retrieved from Firestore and potentially other services (like AI).


/**
 * Cloud Function to get data for the Farmer Dashboard.
 * Ensures the user is authenticated and likely has the Farmer role (enforced by frontend/security rules).
 * (Integrated from hubs.ts)
 */
export const getFarmerDashboardData = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
  }

  // const userId = context.auth.uid;

  // TODO: In a real application, fetch personalized data for the authenticated user (userId)
  // from relevant modules (e.g., Module 3 for farm data, Module 4 for matched buyers,
  // Module 7 for trust score, Module 8 for predictions/recommendations).
  // Replace this mock data fetching with actual database queries and service calls.

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
 * Cloud Function to get data for the Buyer Dashboard.
 * Ensures the user is authenticated and likely has the Buyer role.
 * (Integrated from hubs.ts)
 */
export const getBuyerDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }

     // const userId = context.auth.uid;

    // TODO: Fetch personalized data for the authenticated user (userId)
    // from relevant modules (e.g., Module 4 for marketplace data, Module 1 for traceability,
    // Module 8 for risk/sourcing recommendations).
    // Replace this mock data fetching with actual database queries and service calls.

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
 * Cloud Function to get data for the Logistics Provider Dashboard.
 * Ensures the user is authenticated and likely has the Logistics Provider role.
 * (Integrated from hubs.ts)
 */
export const getLogisticsDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }

    // const userId = context.auth.uid;

    // TODO: Fetch personalized data for the authenticated user (userId)
    // from relevant modules (e.g., Module 1 for traceability, Module 4 for incoming jobs,
    // Module 8 for performance metrics).
    // Replace this mock data fetching with actual database queries and service calls.

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
 * Cloud Function to get data for the Financial Institution Dashboard.
 * Ensures the user is authenticated and likely has the Financial Institution role.
 * (Integrated from hubs.ts)
 */
export const getFiDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }

    // const userId = context.auth.uid;

    // TODO: Fetch personalized data for the authenticated user (userId)
    // from relevant modules (e.g., Module 7 for applications/portfolio, Module 8 for risk assessment,
    // Module 5 for market updates/news relevant to finance).
    // Replace this mock data fetching with actual database queries and service calls.

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
 * Cloud Function to get data for the Agro Export/Import Dashboard.
 * Ensures the user is authenticated and likely has the Agro Export/Import role.
 * (Integrated from hubs.ts)
 */
export const getAgroExportDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }

    // const userId = context.auth.uid;

    // TODO: Fetch personalized data for the authenticated user (userId)
    // from relevant modules (e.g., Module 1 for traceability/VTI, Module 10 for regulatory compliance,
    // Module 4 for shipments).
    // Replace this mock data fetching with actual database queries and service calls.

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
 * Cloud Function to get data for the Input Supplier Dashboard.
 * Ensures the user is authenticated and likely has the Input Supplier role.
 * (Integrated from hubs.ts)
 */
export const getInputSupplierDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }

    // const userId = context.auth.uid;

    // TODO: Fetch personalized data for the authenticated user (userId)
    // from relevant modules (e.g., Module 8 for demand forecasts/product performance,
    // Module 4 for active orders, Module 3 for farm activity trends).
    // Replace this mock data fetching with actual database queries and service calls.

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
 * Cloud Function to get data for the Field Agent / Agronomist Dashboard.
 * Ensures the user is authenticated and likely has the Field Agent / Agronomist role.
 * (Integrated from hubs.ts)
 */
export const getFieldAgentDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }

    // const userId = context.auth.uid;

    // TODO: Fetch personalized data for the authenticated user (userId)
    // from relevant modules (e.g., Module 3 for assigned farmers/portfolio health,
    // Module 1 for data verification tasks, Module 5 for knowledge base contributions).
    // Replace this mock data fetching with actual database queries and service calls.

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
 * Cloud Function to get data for the Energy Provider Dashboard.
 * Ensures the user is authenticated and likely has the Energy Provider role.
 * (Integrated from hubs.ts)
 */
export const getEnergyProviderDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }

    // const userId = context.auth.uid;

    // TODO: Fetch personalized data for the authenticated user (userId)
    // from relevant modules (e.g., Module 12 for carbon impact, Module 7 for leads/proposals).
    // Replace this mock data fetching with actual database queries and service calls.

    const mockEnergyProviderData = {
        highPotentialLeads: [
            { id: "lead1", name: "Sunset Farms", energySpend: 15000, potentialSaving: "25%", actionLink: "/leads/lead1" },
            { id: "lead2", name: "Agri-Processors Ltd.", energySpend: 50000, potentialSaving: "30%", actionLink: "/leads/lead2" },
        ],
        carbonImpact: {
            savedThisYear: 500, // tons of CO2e
            totalProjects: 15,
        },
        pendingProposals: 8,
    };

    return mockEnergyProviderData;
});


/**
 * Cloud Function to get data for the Packaging Supplier Dashboard.
 * Ensures the user is authenticated and likely has the Packaging Supplier role.
 * (Integrated from hubs.ts)
 */
export const getPackagingSupplierDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }

    // const userId = context.auth.uid;

    // TODO: Fetch personalized data for the authenticated user (userId)
    // from relevant modules (e.g., Module 8 for demand forecast, Module 4 for orders,
    // Module 12 for sustainability impact).
    // Replace this mock data fetching with actual database queries and service calls.

    const mockPackagingSupplierData = {
        demandForecast: {
            productType: "Biodegradable Packaging",
            unitsNeeded: 150000,
            for: "Q3 2024 (Global)",
        },
        integrationRequests: [
            { from: "Agri-Processors Ltd.", request: "Integrate smart temperature sensors into packaging for fresh produce.", actionLink: "/integration/requests/req1" },
        ],
        sustainableShowcase: {
            views: 5000,
            leads: 50,
        },
    };

    return mockPackagingSupplierData;
});

/**
 * Cloud Function to get data for the Regulator / Auditor Dashboard.
 * Ensures the user is authenticated and likely has the Regulator / Auditor role.
 * (Integrated from hubs.ts)
 */
export const getRegulatorDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }

    // const userId = context.auth.uid;

    // TODO: Fetch personalized data for the authenticated user (userId)
    // from relevant modules (e.g., Module 10 for compliance/audits, Module 1 for traceability anomalies,
    // Module 8 for risk alerts).
    // Replace this mock data fetching with actual database queries and service calls.

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
 * Cloud Function to get data for the Quality Assurance (QA) Dashboard.
 * Ensures the user is authenticated and likely has the Quality Assurance role.
 * (Integrated from hubs.ts)
 */
export const getQaDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }

    // const userId = context.auth.uid;

    // TODO: Fetch personalized data for the authenticated user (userId)
    // from relevant modules (e.g., Module 1 for batches, Module 10 for compliance,
    // Module 4 for issues reported by buyers).
    // Replace this mock data fetching with actual database queries and service calls.

    const mockQaData = {
            pendingInspections: [
                { id: "insp1", batchId: "batch-avo-001", product: "Organic Hass Avocados", location: "Warehouse A", dueDate: "2024-06-10", actionLink: "/inspections/insp1" },
                { id: "insp2", batchId: "batch-maize-088", product: "Grade A Maize", location: "Farm 12", dueDate: "2024-06-12", actionLink: "/inspections/insp2" }
            ],
            recentIssues: [
                { id: "res1", batchId: "batch-coffee-003", issue: "Mold detected in sample", severity: "High" as const, reportedBy: "Processing Unit A", actionLink: "/issues/res1" },
                { id: "res2", batchId: "batch-tomato-050", issue: "Inconsistent sizing", severity: "Medium" as const, reportedBy: "Buyer X", actionLink: "/issues/res2" }
            ],
            complianceChecklistProgress: [
                { standard: "Global GAP", progress: 85, actionLink: "/compliance/global-gap" },
                { standard: "ISO 22000", progress: 90, actionLink: "/compliance/iso-22000" },
            ],
        };

    return mockQaData;
});

/**
 * Cloud Function to get data for the Certification Body Dashboard.
 * Ensures the user is authenticated and likely has the Certification Body role.
 * (Integrated from hubs.ts)
 */
export const getCertificationBodyDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }

    // const userId = context.auth.uid;

    // TODO: Fetch personalized data for the authenticated user (userId)
    // from relevant modules (e.g., Module 10 for audits/certifications,
    // Module 1 for traceability data related to standards monitoring).
    // Replace this mock data fetching with actual database queries and service calls.

    const mockCertificationBodyData = {
        pendingAudits: [
            { id: "audit1", farmName: "Green Valley Farms", standard: "Organic Certified", dueDate: "2024-06-15", actionLink: "/audits/audit1" },
            { id: "audit2", farmName: "Sunrise Acres", standard: "Fair Trade Certified", dueDate: "2024-06-20", actionLink: "/audits/audit2" },
        ],
        certifiedEntities: [
            { id: "entity1", name: "Green Valley Farms", type: "Farmer" as const, certificationStatus: "Active", actionLink: "/entities/entity1" },
            { id: "entity2", name: "Agri-Processors Ltd.", type: "Processor" as const, certificationStatus: "Pending", actionLink: "/entities/entity2" },
        ],
        standardsMonitoring: [
            { standard: "Organic Standards", adherenceRate: 98, alerts: 2, actionLink: "/standards/organic" },
            { standard: "Fair Trade Principles", adherenceRate: 95, alerts: 0, actionLink: "/standards/fair-trade" },
        ],
    };

    return mockCertificationBodyData;
});

/**
 * Cloud Function to get data for the Researcher / Academic Dashboard.
 * Ensures the user is authenticated and likely has the Researcher / Academic role.
 * (Integrated from hubs.ts)
 */
export const getResearcherDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }

    // const userId = context.auth.uid;

    // TODO: Fetch personalized data for the authenticated user (userId)
    // from relevant modules (e.g., Module 8 for available datasets/projects,
    // Module 5 for knowledge hub contributions).
    // Replace this mock data fetching with actual database queries and service calls.

    const mockResearcherData = {
        availableDatasets: [
            { id: "dataset1", name: "Global Satellite Imagery 2020-2024", description: "High-resolution satellite data for agricultural areas.", dataType: "Satellite Imagery", accessLevel: "Anonymized" as const, actionLink: "/data/dataset1" },
            { id: "dataset2", name: "Global VTI Event Log", description: "Anonymized log of VTI events across the supply chain.", dataType: "VTI Events", accessLevel: "Anonymized" as const, actionLink: "/data/dataset2" },
        ],
        ongoingProjects: [
            { id: "project1", title: "Predictive Yield Modeling using AI", progress: 75, collaborators: ["University of Agriculture", "DamDoh AI Team"], actionLink: "/research/project1" },
        ],
        knowledgeHubContributions: [
            { id: "contrib1", title: "Impact of Regenerative Practices on Soil Health", type: "Article", status: "Published", actionLink: "/knowledge/contrib1" },
        ],
    };

    return mockResearcherData;
});

/**
 * Cloud Function to get data for the Agronomist / Consultant Dashboard.
 * Ensures the user is authenticated and likely has the Agronomist / Consultant role.
 * (Integrated from hubs.ts)
 */
export const getAgronomistDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }

    // const userId = context.auth.uid;

    // TODO: Fetch personalized data for the authenticated user (userId)
    // from relevant modules (e.g., Module 3 for assigned farmers/portfolio,
    // Module 6 for consultation requests/community interactions, Module 5 for knowledge base).
    // Replace this mock data fetching with actual database queries and service calls.

    const mockAgronomistData = {
        assignedFarmersOverview: [
            { id: "farmerA", name: "Green Valley Farms", farmLocation: "Region A", lastConsultation: "2024-05-25", alerts: 1, actionLink: "/profiles/farmerA" },
            { id: "farmerB", name: "Sunrise Acres", farmLocation: "Region B", lastConsultation: "2024-05-20", alerts: 0, actionLink: "/profiles/farmerB" },
        ],
        pendingConsultationRequests: [
            { id: "req1", farmerName: "Hillside Plots", issueSummary: "Pest identification and treatment recommendations.", requestDate: "2024-05-29", actionLink: "/consultations/req1" },
        ],
        knowledgeBaseContributions: [
            { id: "kb1", title: "Guide to Organic Pest Control", status: "Published", actionLink: "/knowledge/kb1" },
        ],
    };

    return mockAgronomistData;
});

/**
 * Cloud Function to get data for the Agro-Tourism Operator Dashboard.
 * Ensures the user is authenticated and likely has the Agro-Tourism Operator role.
 * (Integrated from hubs.ts)
 */
export const getAgroTourismDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }

    // const userId = context.auth.uid;

    // TODO: Fetch personalized data for the authenticated user (userId)
    // from relevant modules (e.g., Module 4 for listings/bookings, Module 6 for reviews).
    // Replace this mock data fetching with actual database queries and service calls.

    const mockAgroTourismData = {
        listedExperiences: [
            { id: "exp1", title: "Organic Farm Tour & Tasting", location: "Green Valley Farms", status: "Active" as const, bookingsCount: 15, actionLink: "/tourism/experiences/exp1" },
            { id: "exp2", title: "Harvest Festival Weekend", location: "Sunrise Acres", status: "Active" as const, bookingsCount: 50, actionLink: "/tourism/experiences/exp2" },
        ],
        upcomingBookings: [
            { id: "book1", experienceTitle: "Organic Farm Tour & Tasting", guestName: "Alice Smith", date: "2024-06-10", actionLink: "/tourism/bookings/book1" },
        ],
        guestReviews: [
            { id: "review1", guestName: "Bob Johnson", experienceTitle: "Organic Farm Tour & Tasting", rating: 5, comment: "Absolutely loved the tour and the fresh produce!", actionLink: "/tourism/reviews/review1" },
        ],
    };

    return mockAgroTourismData;
});

/**
 * Cloud Function to get data for the Insurance Provider Dashboard.
 * Ensures the user is authenticated and likely has the Insurance Provider role.
 * (Integrated from hubs.ts)
 */
export const getInsuranceProviderDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }

    // const userId = context.auth.uid;

    // TODO: Fetch personalized data for the authenticated user (userId)
    // from relevant modules (e.g., Module 11 for claims/policies/risk alerts,
    // Module 8 for risk assessment data).
    // Replace this mock data fetching with actual database queries and service calls.

    const mockInsuranceProviderData = {
        pendingClaims: [
            { id: "claim1", policyHolderName: "Farmer Brown", policyType: "Crop Insurance", claimDate: "2024-05-28", status: "Submitted" as const, actionLink: "/insurance/claims/claim1" },
        ],
        activePolicies: [
            { id: "policy1", policyHolderName: "Green Valley Farms", policyType: "Crop Insurance", coverageAmount: 10000, expiryDate: "2025-03-15", actionLink: "/insurance/policies/policy1" },
        ],
        riskAssessmentAlerts: [
            { id: "risk1", policyHolderName: "Hillside Plots", alert: "Increased pest risk due to weather patterns.", severity: "Medium" as const, actionLink: "/insurance/alerts/risk1" },
        ],
    };

    return mockInsuranceProviderData;
});

/**
 * Cloud Function to get data for the Crowdfunder Dashboard.
 * Ensures the user is authenticated and likely has the Crowdfunder role.
 * (Integrated from hubs.ts)
 */
export const getCrowdfunderDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }

    // const userId = context.auth.uid;

    // TODO: Fetch personalized data for the authenticated user (userId)
    // from relevant modules (e.g., Module 7 for projects/investments/impact,
    // Module 12 for sustainability impact metrics).
    // Replace this mock data fetching with actual database queries and service calls.

    const mockCrowdfunderData = {
        featuredProjects: [
            { id: "projectABC", title: "Expand Organic Vegetable Production", farmerName: "Sunny Meadows Farm", amountSought: 20000, amountRaised: 15000, progress: 75, actionLink: "/crowdfunding/projects/projectABC" },
            { id: "projectXYZ", title: "Install Solar Irrigation System", farmerName: "Aqua Green Farms", amountSought: 50000, amountRaised: 10000, progress: 20, actionLink: "/crowdfunding/projects/projectXYZ" },
        ],
        myInvestments: [
            { id: "invest1", projectTitle: "Expand Organic Vegetable Production", amountInvested: 500, expectedReturn: "10% ROI", status: "Active" as const, actionLink: "/crowdfunding/investments/invest1" },
        ],
        impactReport: {
            totalInvested: 1000,
            totalImpactMetrics: [
                { metric: "CO2 Reduced Annually", value: "5 tons" },
                { metric: "Farmers Supported", value: "2" },
            ],
            actionLink: "/crowdfunding/impact"
        },
    };

    return mockCrowdfunderData;
});

/**
 * Cloud Function to get data for the Processing Unit Dashboard.
 * Ensures the user is authenticated and likely has the Processing Unit role.
 * (Integrated from hubs.ts)
 */
export const getProcessingUnitDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }

    // const userId = context.auth.uid;

    // TODO: Fetch personalized data for the authenticated user (userId)
    // from relevant modules (e.g., Module 1 for traceability/batches, Module 8 for optimization/predictions,
    // Module 4 for orders, Module 12 for waste/packaging impact).
    // Replace this mock data fetching with actual database queries and service calls.

    const mockProcessingUnitData = {
        yieldOptimization: {
            currentYield: 92,
            potentialYield: 95,
            suggestion: "Analyze raw material quality variations."
        },
        inventory: [
            { product: "Processed Tomatoes", tons: 500, quality: "Grade A" },
            { product: "Tomato Paste", tons: 200, quality: "Standard" },
        ],
        wasteReduction: {
            currentRate: 5,
            potentialRate: 3,
            insight: "Implement better sorting of raw materials."
        },
        packagingOrders: [
            { id: "packord1", supplierName: "Sustainable Packaging Co.", orderDate: "2024-05-20", deliveryDate: "2024-06-10", status: "Pending" as const, actionLink: "/processing/packaging/orders/packord1" },
            { id: "packord2", supplierName: "Bio-Pack Solutions", orderDate: "2024-05-15", deliveryDate: "2024-06-01", status: "Delivered" as const, actionLink: "/processing/packaging/orders/packord2" },
        ],
        packagingInventory: [
            { packagingType: "Biodegradable Pouches (500g)", unitsInStock: 5000, reorderLevel: 1000 },
            { packagingType: "Recycled Cardboard Boxes", unitsInStock: 2000, reorderLevel: 500 },
        ],
        packagingImpactMetrics: [
            { metric: "Recycled Content Used", value: "75%", actionLink: "/processing/packaging/impact/recycled" },
            { metric: "Biodegradable Packaging Rate", value: "60%", actionLink: "/processing/packaging/impact/biodegradable" },
        ],
    };

    return mockProcessingUnitData;
});


/**
 * Cloud Function to get data for the Warehouse Hub.
 * Ensures the user is authenticated and likely has the Warehouse role.
 * (Integrated from hubs.ts)
 */
export const getWarehouseDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }

    // const userId = context.auth.uid;

    // TODO: Fetch personalized data for the authenticated user (userId)
    // from relevant modules (e.g., Module 4 for inventory/shipments,
    // Module 8 for optimization/alerts).
    // Replace this mock data fetching with actual database queries and service calls.
    
    const mockWarehouseData = {
        storageOptimization: {
            utilization: 85,
            suggestion: "Consolidate pallets in Section C to free up space."
        },
        inventoryLevels: {
            totalItems: 1250,
            itemsNeedingAttention: 15
        },
        predictiveAlerts: [
            { id: "alert1", alert: "High humidity detected in Cold Storage Unit 2.", actionLink: "/warehouse/alerts/1" },
            { id: "alert2", alert: "Batch B-456 approaching expiry date.", actionLink: "/warehouse/inventory/B-456" }
        ]
    };

    return mockWarehouseData;
});
