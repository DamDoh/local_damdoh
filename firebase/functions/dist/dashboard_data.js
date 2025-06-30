"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWarehouseDashboardData = exports.getProcessingUnitDashboardData = exports.getCrowdfunderDashboardData = exports.getInsuranceProviderDashboardData = exports.getAgroTourismDashboardData = exports.getAgronomistDashboardData = exports.getResearcherDashboardData = exports.getCertificationBodyDashboardData = exports.getQaDashboardData = exports.getRegulatorDashboardData = exports.getPackagingSupplierDashboardData = exports.getEnergyProviderDashboardData = exports.getFieldAgentDashboardData = exports.getInputSupplierDashboardData = exports.getAgroExportDashboardData = exports.getFiDashboardData = exports.getLogisticsDashboardData = exports.getBuyerDashboardData = exports.getFarmerDashboardData = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
exports.getFarmerDashboardData = functions.https.onCall(async (data, context) => {
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
        const farms = farmsSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        const recentCrops = cropsSnapshot.docs
            .map(doc => {
            var _a, _b;
            const cropData = doc.data();
            return Object.assign(Object.assign({ id: doc.id }, cropData), { createdAt: ((_a = cropData.createdAt) === null || _a === void 0 ? void 0 : _a.toDate) ? cropData.createdAt.toDate() : new Date(0), plantingDate: ((_b = cropData.plantingDate) === null || _b === void 0 ? void 0 : _b.toDate) ? cropData.plantingDate.toDate().toISOString() : null });
        })
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()) // Sort in-memory
            .slice(0, 5); // Take the 5 most recent
        const activeKnfBatches = knfBatchesSnapshot.docs
            .map(doc => {
            var _a;
            const batchData = doc.data();
            return Object.assign(Object.assign({ id: doc.id }, batchData), { nextStepDate: ((_a = batchData.nextStepDate) === null || _a === void 0 ? void 0 : _a.toDate) ? batchData.nextStepDate.toDate().toISOString() : null });
        })
            .filter(batch => batch.status === 'Fermenting' || batch.status === 'Ready') // Filter in-memory
            .slice(0, 5);
        return {
            farmCount: farms.length,
            cropCount: cropsSnapshot.size,
            recentCrops: recentCrops.map((_a) => {
                var { createdAt } = _a, rest = __rest(_a, ["createdAt"]);
                return rest;
            }), // remove temporary sort key
            knfBatches: activeKnfBatches,
        };
    }
    catch (error) {
        console.error("Error fetching farmer dashboard data:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch farmer dashboard data.");
    }
});
exports.getBuyerDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    try {
        // Simulate fetching some farmers as sourcing recommendations
        const farmersSnapshot = await db.collection("users").where("primaryRole", "==", "Farmer").limit(3).get();
        const sourcingRecommendations = farmersSnapshot.docs.map(doc => {
            var _a, _b;
            const farmerData = doc.data();
            return {
                id: doc.id,
                name: farmerData.displayName || "Unnamed Farm",
                product: ((_b = (_a = farmerData.profileData) === null || _a === void 0 ? void 0 : _a.crops) === null || _b === void 0 ? void 0 : _b[0]) || "Various Produce", // Get first listed crop
                reliability: Math.floor(Math.random() * (98 - 85 + 1) + 85), // Random reliability
                vtiVerified: Math.random() > 0.3, // Random VTI verification
            };
        });
        // Keep mock data for other sections for now, focusing on one live part
        const liveData = {
            supplyChainRisk: {
                region: "East Africa",
                level: "Medium",
                factor: "Potential for port congestion.",
                action: {
                    label: "View Logistics Report",
                    link: "/logistics/reports/east-africa",
                },
            },
            sourcingRecommendations: sourcingRecommendations,
            marketPriceIntelligence: {
                product: "Coffee Arabica",
                trend: "up",
                forecast: "Prices expected to rise 5-8% in the next quarter due to weather patterns.",
                action: {
                    label: "View Full Market Analysis",
                    link: "/market-intelligence/coffee",
                },
            },
        };
        return liveData;
    }
    catch (error) {
        console.error("Error fetching buyer dashboard data:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch buyer dashboard data.");
    }
});
exports.getLogisticsDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    // Returning structured, realistic mock data.
    // In a real system, this would come from live queries on 'shipments' and 'jobs' collections.
    const mockData = {
        activeShipments: [
            { id: 'ship1', to: 'Mombasa Port', status: 'On-Time', eta: '2023-10-30', vtiLink: '/traceability/batches/vti-123' },
            { id: 'ship2', to: 'Kampala', status: 'Delayed', eta: '2023-11-02', vtiLink: '/traceability/batches/vti-456' },
        ],
        incomingJobs: [
            { id: 'job1', from: 'Eldoret Farms', to: 'Nairobi', product: '10 tons Maize', requirements: 'Standard Truck', actionLink: '/jobs/1' },
            { id: 'job2', from: 'Coastal Processors', to: 'Mombasa Port', product: '5 tons Cashews', requirements: 'Refrigerated', actionLink: '/jobs/2' },
        ],
        performanceMetrics: {
            onTimePercentage: 97,
            fuelEfficiency: '12km/L',
            actionLink: '/reports/performance/q4'
        }
    };
    return mockData;
});
exports.getFiDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    // Live data for pending applications, mock for the rest
    try {
        const farmersSnapshot = await db.collection("users")
            .where("primaryRole", "==", "Farmer")
            .limit(4) // Fetch a few farmers to act as applicants
            .get();
        const pendingApplications = farmersSnapshot.docs.map(doc => {
            const farmerData = doc.data();
            return {
                id: doc.id,
                applicantName: farmerData.displayName || "Unnamed Farmer",
                type: Math.random() > 0.5 ? "Crop Loan" : "Equipment Financing",
                amount: Math.floor(Math.random() * (100000 - 5000 + 1) + 5000),
                riskScore: Math.floor(Math.random() * (800 - 600 + 1) + 600), // Random score
                actionLink: `/applications/${doc.id}`
            };
        });
        const liveData = {
            pendingApplications: pendingApplications,
            portfolioAtRisk: {
                count: 12,
                value: 45000,
                highestRisk: {
                    name: "Dry Season Farmers Group",
                    reason: "Drought warning in region.",
                },
                actionLink: "/risk/analysis/q4",
            },
            marketUpdates: [
                { id: "update1", content: "Central Bank raises interest rates by 0.25%.", actionLink: "/news/cbr-rates-q4" },
                { id: "update2", content: "New government subsidy announced for organic farming inputs.", actionLink: "/news/organic-subsidy" },
            ]
        };
        return liveData;
    }
    catch (error) {
        console.error("Error fetching FI dashboard data:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch FI dashboard data.");
    }
});
exports.getAgroExportDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    // Returning mock data to power the new dashboard UI
    const mockData = {
        pendingCustomsDocs: [
            { id: 'doc1', vtiLink: '/traceability/batches/vti-789', destination: 'Rotterdam, NL', status: 'Awaiting Phytosanitary Certificate' },
            { id: 'doc2', vtiLink: '/traceability/batches/vti-101', destination: 'Dubai, UAE', status: 'Ready for Submission' },
        ],
        trackedShipments: [
            { id: 'ship3', status: 'In Transit', location: 'Indian Ocean', carrier: 'Maersk' },
            { id: 'ship4', status: 'At Port', location: 'Port of Singapore', carrier: 'CMA CGM' },
        ],
        complianceAlerts: [
            { id: 'alert1', content: "New EU regulation update for organic produce imports effective Jan 1, 2024.", actionLink: '/news/eu-organic-update' },
        ]
    };
    return mockData;
});
exports.getInputSupplierDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    // Returning mock data to power the new dashboard UI
    const mockData = {
        demandForecast: [
            { id: "fc1", region: "Rift Valley, Kenya", product: "Drought-Resistant Maize Seed", trend: "High", reason: "Below-average rainfall predicted for the next planting season." },
            { id: "fc2", region: "Northern Nigeria", product: "Organic NPK Fertilizer", trend: "Steady", reason: "Increased adoption of organic farming practices in the region." },
        ],
        productPerformance: [
            { id: "perf1", productName: "Eco-Fertilizer 5-3-2", rating: 4.5, feedback: "Great results on tomato yield, will re-order.", link: "/products/eco-fertilizer/reviews" },
            { id: "perf2", productName: "Pioneer P3812W Maize Seed", rating: 4.8, feedback: "Excellent germination rate and crop uniformity.", link: "/products/pioneer-p3812w/reviews" },
        ],
        activeOrders: {
            count: 25,
            value: 12500,
            link: "/marketplace/orders/manage"
        }
    };
    return mockData;
});
exports.getFieldAgentDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    // Returning mock data to power the new dashboard UI
    const mockData = {
        assignedFarmers: [
            { id: 'farmer1', name: 'John Mwangi', lastVisit: '2023-10-15', issues: 2, actionLink: '/profiles/farmer1' },
            { id: 'farmer2', name: 'Grace Adhiambo', lastVisit: '2023-10-22', issues: 0, actionLink: '/profiles/farmer2' },
            { id: 'farmer3', name: 'Samuel Kiprop', lastVisit: '2023-09-30', issues: 1, actionLink: '/profiles/farmer3' },
        ],
        portfolioHealth: {
            overallScore: 88,
            alerts: ['Pest outbreak reported in Rift Valley region.'],
            actionLink: '/reports/portfolio/health'
        },
        pendingReports: 3,
        dataVerificationTasks: {
            count: 5,
            description: 'Harvest logs pending verification.',
            actionLink: '/tasks/verification'
        }
    };
    return mockData;
});
exports.getEnergyProviderDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    // Returning mock data to power the new dashboard UI
    const mockData = {
        projectLeads: [
            { id: 'lead1', entityName: 'Green Valley Farms', location: 'Nakuru, Kenya', estimatedEnergyNeed: 'Solar for irrigation pumps', status: 'New', actionLink: '#' },
            { id: 'lead2', entityName: 'Coastal Processors', location: 'Mombasa, Kenya', estimatedEnergyNeed: 'Biogas from waste products', status: 'Contacted', actionLink: '#' },
        ],
        activeProjects: [
            { id: 'proj1', projectName: 'Sunrise Cooperative Solar Array', solutionType: 'Solar', status: 'In Progress', completionDate: '2024-12-01' },
            { id: 'proj2', projectName: 'AgriWaste Biogas Plant', solutionType: 'Biogas', status: 'Completed', completionDate: '2024-03-15' },
        ],
        impactMetrics: {
            totalInstallations: 15,
            totalEstimatedCarbonReduction: '250 Tons CO2e / year',
        }
    };
    return mockData;
});
exports.getPackagingSupplierDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    const mockData = {
        demandForecast: {
            productType: 'Biodegradable Jute Bags (50kg)',
            unitsNeeded: 15000,
            for: 'Q4 Coffee Bean Exports'
        },
        integrationRequests: [
            { from: 'FreshFoods Processors Ltd.', request: 'Request for custom branded retail pouches.', actionLink: '#' },
            { from: 'GreenValley Organics', request: 'Inquiry for bulk pallet wrap pricing.', actionLink: '#' },
        ],
        sustainableShowcase: {
            views: 2890,
            leads: 45
        }
    };
    return mockData;
});
exports.getRegulatorDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    // Returning mock data to power the new dashboard UI
    const mockData = {
        complianceRiskAlerts: [
            { id: 'alert1', issue: 'Unverified organic claims from Western Region', region: 'Western Region', severity: 'High', actionLink: '/compliance/investigate/alert1' },
            { id: 'alert2', issue: 'High pesticide residue detected in batch VTI-XYZ', region: 'Central Valley', severity: 'Medium', actionLink: '/compliance/investigate/alert2' },
        ],
        pendingCertifications: {
            count: 12,
            actionLink: '/certifications/pending-review',
        },
        supplyChainAnomalies: [
            { id: 'anom1', description: 'Unusual delay between harvest and processing for multiple batches from Eldoret.', level: 'Warning', vtiLink: '/traceability/analysis/eldoret-delay' },
            { id: 'anom2', description: 'VTI log shows transportation event before harvest event for batch VTI-ABC.', level: 'Critical', vtiLink: '/traceability/batches/vti-abc' },
        ]
    };
    return mockData;
});
exports.getQaDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    // Returning mock data for the QA dashboard
    const mockData = {
        pendingInspections: [
            { id: 'insp1', batchId: 'VTI-XYZ-001', productName: 'Organic Hass Avocados', sellerName: 'Green Valley Organics', dueDate: new Date(Date.now() + 3 * 86400000).toISOString(), actionLink: '#' },
            { id: 'insp2', batchId: 'VTI-ABC-007', productName: 'Raw Cashew Nuts', sellerName: 'Coastal Cashews Ltd.', dueDate: new Date(Date.now() + 5 * 86400000).toISOString(), actionLink: '#' },
        ],
        recentResults: [
            { id: 'res1', productName: 'Sun-dried Tomatoes', result: 'Pass', inspectedAt: new Date(Date.now() - 1 * 86400000).toISOString() },
            { id: 'res2', productName: 'Maize Batch MB-04', result: 'Fail', reason: 'Aflatoxin levels exceed limits', inspectedAt: new Date(Date.now() - 2 * 86400000).toISOString() },
        ],
        qualityMetrics: {
            passRate: 98.5,
            averageScore: 9.2,
        }
    };
    return mockData;
});
exports.getCertificationBodyDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    // Returning mock data to power the new dashboard UI
    const mockData = {
        pendingAudits: [
            { id: 'audit1', farmName: 'Green Valley Organics', standard: 'USDA Organic', dueDate: new Date(Date.now() + 14 * 86400000).toISOString(), actionLink: '#' },
            { id: 'audit2', farmName: 'Sunrise Cooperative', standard: 'Fair Trade International', dueDate: new Date(Date.now() + 30 * 86400000).toISOString(), actionLink: '#' },
        ],
        certifiedEntities: [
            { id: 'ent1', name: 'Highland Coffee Co-op', type: 'Farm', certificationStatus: 'Active', actionLink: '#' },
            { id: 'ent2', name: 'Coastal Cashews Ltd.', type: 'Processor', certificationStatus: 'Pending Renewal', actionLink: '#' },
            { id: 'ent3', name: 'Moringa Leaf Exports', type: 'Processor', certificationStatus: 'Expired', actionLink: '#' },
        ],
        standardsMonitoring: [
            { standard: 'USDA Organic', adherenceRate: 98, alerts: 2, actionLink: '#' },
            { standard: 'Fair Trade', adherenceRate: 95, alerts: 5, actionLink: '#' },
        ]
    };
    return mockData;
});
exports.getResearcherDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    const mockData = {
        availableDatasets: [
            { id: 'ds1', name: 'Anonymized Maize Price Data (2022-2023)', dataType: 'Market Data', accessLevel: 'Public', actionLink: '#' },
            { id: 'ds2', name: 'Regional Soil Health Aggregates', dataType: 'Agronomic Data', accessLevel: 'Requires Request', actionLink: '#' },
            { id: 'ds3', name: 'Logistics Delay Hotspot Analysis', dataType: 'Supply Chain Data', accessLevel: 'Requires Request', actionLink: '#' },
        ],
        ongoingProjects: [
            { id: 'proj1', title: 'Impact of Cover Cropping on Soil Moisture', progress: 75, collaborators: ['Dr. Bello', 'Dr. Singh'], actionLink: '#' },
            { id: 'proj2', title: 'Predictive Modeling for Pest Outbreaks', progress: 40, collaborators: ['Dr. Hanson'], actionLink: '#' },
        ],
        knowledgeHubContributions: [
            { id: 'khc1', title: 'A Review of Post-Harvest Loss Technologies', status: 'Published', actionLink: '#' },
            { id: 'khc2', title: 'The Economics of Smallholder Solar Irrigation', status: 'Pending Review', actionLink: '#' },
        ]
    };
    return mockData;
});
exports.getAgronomistDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    // Returning mock data to power the new dashboard UI
    const mockData = {
        assignedFarmersOverview: [
            { id: 'farmer1', name: 'Green Valley Farms', farmLocation: 'Nakuru, Kenya', lastConsultation: new Date(Date.now() - 7 * 86400000).toISOString(), alerts: 2 },
            { id: 'farmer2', name: 'Sunrise Cooperative', farmLocation: 'Kiambu, Kenya', lastConsultation: new Date(Date.now() - 14 * 86400000).toISOString(), alerts: 0 },
        ],
        pendingConsultationRequests: [
            { id: 'req1', farmerName: 'Coastal Cashews Ltd.', issueSummary: 'Suspected fungal infection on new seedlings.', requestDate: new Date(Date.now() - 1 * 86400000).toISOString() },
            { id: 'req2', farmerName: 'Highland Coffee Co-op', issueSummary: 'Need advice on organic pest control for coffee berry borer.', requestDate: new Date(Date.now() - 3 * 86400000).toISOString() },
        ],
        knowledgeBaseContributions: [
            { id: 'kb1', title: 'Integrated Pest Management for Maize', status: 'Published' },
            { id: 'kb2', title: 'Optimizing Drip Irrigation for Tomatoes', status: 'Pending Review' },
        ]
    };
    return mockData;
});
exports.getAgroTourismDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    // Returning mock data to power the new dashboard UI
    const mockData = {
        upcomingBookings: [
            { id: 'booking1', experienceTitle: 'Organic Farm Tour & Tasting', guestName: 'Alice Johnson', date: new Date(Date.now() + 3 * 86400000).toISOString(), actionLink: '#' },
            { id: 'booking2', experienceTitle: 'KNF Workshop', guestName: 'Bob Williams', date: new Date(Date.now() + 7 * 86400000).toISOString(), actionLink: '#' },
        ],
        listedExperiences: [
            { id: 'exp1', title: 'Organic Farm Tour & Tasting', location: 'Nakuru, Kenya', status: 'Published', bookingsCount: 15, actionLink: '#' },
            { id: 'exp2', title: 'KNF Workshop', location: 'Nakuru, Kenya', status: 'Published', bookingsCount: 8, actionLink: '#' },
            { id: 'exp3', title: 'Coffee Plantation Experience', location: 'Kiambu, Kenya', status: 'Draft', bookingsCount: 0, actionLink: '#' },
        ],
        guestReviews: [
            { id: 'rev1', guestName: 'Charlie Brown', experienceTitle: 'Organic Farm Tour & Tasting', rating: 5, comment: 'Amazing and educational experience! The fresh produce was delicious.', actionLink: '#' },
            { id: 'rev2', guestName: 'Diana Prince', experienceTitle: 'KNF Workshop', rating: 4, comment: 'Learned so much about natural farming. Highly recommend.', actionLink: '#' },
        ],
    };
    return mockData;
});
exports.getInsuranceProviderDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    // Returning mock data to power the new dashboard UI
    const mockData = {
        pendingClaims: [
            { id: 'claim1', policyHolderName: 'Green Valley Farms', policyType: 'Crop', claimDate: new Date(Date.now() - 2 * 86400000).toISOString(), status: 'Submitted', actionLink: '#' },
            { id: 'claim2', policyHolderName: 'Sunrise Cooperative', policyType: 'Livestock', claimDate: new Date(Date.now() - 5 * 86400000).toISOString(), status: 'Under Review', actionLink: '#' },
        ],
        riskAssessmentAlerts: [
            { id: 'alert1', policyHolderName: 'Green Valley Farms', alert: 'High probability of drought reported in Nakuru.', severity: 'High', actionLink: '#' },
            { id: 'alert2', policyHolderName: 'Coastal Cashews Ltd.', alert: 'Pest outbreak detected in nearby regions.', severity: 'Medium', actionLink: '#' },
        ],
        activePolicies: [
            { id: 'pol1', policyHolderName: 'Highland Coffee Co-op', policyType: 'Crop Insurance', coverageAmount: 50000, expiryDate: new Date(Date.now() + 150 * 86400000).toISOString(), actionLink: '#' },
            { id: 'pol2', policyHolderName: 'Moringa Leaf Exports', policyType: 'Property Insurance', coverageAmount: 120000, expiryDate: new Date(Date.now() + 200 * 86400000).toISOString(), actionLink: '#' },
        ]
    };
    return mockData;
});
exports.getCrowdfunderDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    // Returning mock data to power the new dashboard UI
    const mockData = {
        portfolioOverview: {
            totalInvested: 7500,
            numberOfInvestments: 3,
            estimatedReturns: 8250,
        },
        suggestedOpportunities: [
            { id: 'proj1', projectName: 'Solar Irrigation for Maasai Mara', category: 'Renewable Energy', fundingGoal: 20000, amountRaised: 5000, actionLink: '#' },
            { id: 'proj2', projectName: 'Women\'s Hibiscus Processing Co-op', category: 'Value Addition', fundingGoal: 15000, amountRaised: 12000, actionLink: '#' },
            { id: 'proj3', projectName: 'Cold Storage for Coastal Fishermen', category: 'Infrastructure', fundingGoal: 50000, amountRaised: 10000, actionLink: '#' },
        ],
        recentTransactions: [
            { id: 'txn1', projectName: 'Solar Irrigation for Maasai Mara', type: 'Investment', amount: 2500, date: new Date(Date.now() - 5 * 86400000).toISOString() },
            { id: 'txn2', projectName: 'Organic Fertilizer Production', type: 'Payout', amount: 1100, date: new Date(Date.now() - 15 * 86400000).toISOString() },
            { id: 'txn3', projectName: 'Women\'s Hibiscus Processing Co-op', type: 'Investment', amount: 5000, date: new Date(Date.now() - 30 * 86400000).toISOString() },
        ],
    };
    return mockData;
});
exports.getProcessingUnitDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    // Returning mock data to power the new dashboard UI
    const mockData = {
        yieldOptimization: {
            currentYield: 85,
            potentialYield: 92,
            suggestion: "AI suggests adjusting blade speed on the primary chopper to reduce fine particle loss by an estimated 3%.",
        },
        inventory: [
            { product: 'Raw Cashew Nuts', quality: 'Grade A', tons: 15.5 },
            { product: 'Dried Mango Cheeks', quality: 'Grade B', tons: 2.1 },
            { product: 'Hibiscus Flower', quality: 'Premium Export', tons: 8.0 },
        ],
        wasteReduction: {
            currentRate: 12,
            insight: "Analysis indicates 4% of waste is recoverable as animal feed. Consider partnering with local livestock farmers.",
        },
        packagingOrders: [
            { id: 'po1', supplierName: 'EcoPack Solutions', deliveryDate: '2023-11-10', status: 'In Transit', actionLink: '#' },
            { id: 'po2', supplierName: 'Bulk Bags Inc.', deliveryDate: '2023-11-15', status: 'Pending', actionLink: '#' },
        ],
        packagingInventory: [
            { packagingType: '5kg Branded Jute Bags', unitsInStock: 2500, reorderLevel: 1000 },
            { packagingType: '100g Retail Foil Pouches', unitsInStock: 15000, reorderLevel: 20000 },
        ]
    };
    return mockData;
});
exports.getWarehouseDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    // Returning mock data to power the new dashboard UI
    const mockData = {
        storageOptimization: {
            utilization: 78,
            suggestion: "Consolidate pallets in Zone C to free up a full row.",
        },
        inventoryLevels: {
            totalItems: 450,
            itemsNeedingAttention: 12,
        },
        predictiveAlerts: [
            { alert: "High humidity detected in Cold Storage Bay 2.", actionLink: "#" },
            { alert: "Maize batch #VTI-123 nearing its expiry date.", actionLink: "#" },
        ]
    };
    return mockData;
});
//# sourceMappingURL=dashboard_data.js.map