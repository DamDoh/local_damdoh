
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Assuming Firebase Admin SDK is initialized in index.ts
const db = admin.firestore();

// --- Cross-Cutting Service: Dashboard Data Aggregation ---
// This file contains backend functions responsible for fetching and aggregating
// data from various modules to populate role-based dashboards/hubs for users.
// In a real application, these functions would replace mock data with actual
// data retrieved from Firestore and potentially other services (like AI).


/**
 * Cloud Function to get data for the Farmer Dashboard.
 * Ensures the user is authenticated and likely has the Farmer role (enforced by frontend/security rules).
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
 * Cloud Function to get data for the Buyer Dashboard.
 * Ensures the user is authenticated and likely has the Buyer role.
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
            trend: "up" as const,
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
 * Cloud Function to get data for the Financial Institution Dashboard.
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
 * Cloud Function to get data for the Agro Export/Import Dashboard.
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
 * Cloud Function to get data for the Input Supplier Dashboard.
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
 * Cloud Function to get data for the Field Agent / Agronomist Dashboard.
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
 * Cloud Function to get data for the Energy Provider Dashboard.
 */
export const getEnergyProviderDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    
    const mockEnergyProviderData = {
        projectLeads: [
            { id: 'lead1', entityName: 'Sunset Farms', location: 'Rift Valley', estimatedEnergyNeed: 'High', status: 'New' as const, actionLink: '/leads/lead1' },
            { id: 'lead2', entityName: 'Agri-Processors Ltd.', location: 'Nairobi', estimatedEnergyNeed: 'Very High', status: 'Contacted' as const, actionLink: '/leads/lead2' },
        ],
        activeProjects: [
            { id: 'proj1', entityName: 'Green Valley', location: 'Naivasha', solutionType: 'Solar Irrigation', installationDate: '2024-03-15', status: 'Completed' as const, actionLink: '/projects/proj1' }
        ],
        impactMetrics: {
            totalInstallations: 15,
            totalEstimatedCarbonReduction: '500 tons CO2e/year',
            actionLink: '/impact-report'
        },
    };

    return mockEnergyProviderData;
});


/**
 * Cloud Function to get data for the Packaging Supplier Dashboard.
 */
export const getPackagingSupplierDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }

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
 * Cloud Function to get data for the Quality Assurance (QA) Dashboard.
 */
export const getQaDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    
    const mockQaData = {
            pendingInspections: [
                { id: "insp1", batchId: "batch-avo-001", productName: "Organic Hass Avocados", sellerName: "Green Valley Farms", dueDate: "2024-06-10", actionLink: "/inspections/insp1" },
                { id: "insp2", batchId: "batch-maize-088", productName: "Grade A Maize", sellerName: "Sunrise Acres", dueDate: "2024-06-12", actionLink: "/inspections/insp2" }
            ],
            recentResults: [
                { id: "res1", productName: "Organic Coffee Beans", result: 'Fail' as const, reason: "Mold detected in sample", inspectedAt: "2024-05-28" },
                { id: "res2", productName: "Tomatoes", result: 'Pass' as const, reason: "Aflatoxin levels within limit", inspectedAt: "2024-05-27" }
            ],
            qualityMetrics: {
                passRate: 98,
                averageScore: 95.5,
            },
        };

    return mockQaData;
});

/**
 * Cloud Function to get data for the Certification Body Dashboard.
 */
export const getCertificationBodyDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }

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
 */
export const getResearcherDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }

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
 */
export const getAgronomistDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }

    const mockAgronomistData = {
        assignedFarmersOverview: [
            { id: "farmerA", name: "Green Valley Farms", farmLocation: "Region A", lastConsultation: "2024-05-25", alerts: 1, actionLink: "/profiles/farmerA" },
            { id: "farmerB", name: "Sunrise Acres", farmLocation: "Region B", lastConsultation: "2024-05-20", alerts: 0, actionLink: "/profiles/farmerB" },
        ],
        pendingConsultationRequests: [
            { id: "req1", farmerName: "Hillside Plots", issueSummary: "Pest identification and treatment recommendations.", requestDate: "2024-05-29", actionLink: "/consultations/req1" },
        ],
        knowledgeBaseContributions: [
            { id: "kb1", title: "Guide to Organic Pest Control", status: "Published" as const, actionLink: "/knowledge/kb1" },
        ],
    };

    return mockAgronomistData;
});

/**
 * Cloud Function to get data for the Agro-Tourism Operator Dashboard.
 */
export const getAgroTourismDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }

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
 */
export const getInsuranceProviderDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }

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
 */
export const getCrowdfunderDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }

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
 */
export const getProcessingUnitDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    
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
 */
export const getWarehouseDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    
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

