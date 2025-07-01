
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {
    FarmerDashboardData, BuyerDashboardData, LogisticsDashboardData, FiDashboardData, 
    InputSupplierDashboardData, AgroExportDashboardData, FieldAgentDashboardData, 
    ProcessingUnitDashboardData, WarehouseDashboardData, PackagingSupplierDashboardData, 
    RegulatorDashboardData, EnergyProviderDashboardData, QaDashboardData, 
    CertificationBodyDashboardData, ResearcherDashboardData, AgronomistDashboardData, 
    AgroTourismDashboardData, InsuranceProviderDashboardData, CrowdfunderDashboardData, 
    CooperativeDashboardData, MarketplaceOrder
} from "./types";

const db = admin.firestore();

// Helper for creating mock data endpoints
const createMockDashboardFunction = <T>(mockData: T) => {
    return functions.https.onCall(async (data, context): Promise<T> => {
        if (!context.auth) {
            throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
        }
        return mockData;
    });
};


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


// =================================================================
// Mock Data and Functions
// =================================================================

const mockLogisticsData: LogisticsDashboardData = {
  activeShipments: [
    { id: 'ship1', to: 'Mombasa Port', status: 'On-Time', eta: '2023-10-30', vtiLink: '/traceability/batches/vti-123' },
    { id: 'ship2', to: 'Kampala', status: 'Delayed', eta: '2023-11-02', vtiLink: '/traceability/batches/vti-456' },
  ],
  incomingJobs: [
    { id: 'job1', from: 'Eldoret Farms', to: 'Nairobi', product: '10 tons Maize', requirements: 'Standard Truck', actionLink: '/jobs/1' },
    { id: 'job2', from: 'Coastal Processors', to: 'Mombasa Port', product: '5 tons Cashews', requirements: 'Refrigerated', actionLink: '/jobs/2' },
  ],
  performanceMetrics: { onTimePercentage: 97, fuelEfficiency: '12km/L', actionLink: '/reports/performance/q4' }
};

const mockAgroExportData: AgroExportDashboardData = {
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

const mockFieldAgentData: FieldAgentDashboardData = {
    assignedFarmers: [
        { id: 'farmer1', name: 'John Mwangi', lastVisit: '2023-10-15', issues: 2, actionLink: '/profiles/farmer1' },
        { id: 'farmer2', name: 'Grace Adhiambo', lastVisit: '2023-10-22', issues: 0, actionLink: '/profiles/farmer2' },
    ],
    portfolioHealth: { overallScore: 88, alerts: ['Pest outbreak reported in Rift Valley region.'], actionLink: '/reports/portfolio/health' },
    pendingReports: 3,
    dataVerificationTasks: { count: 5, description: 'Harvest logs pending verification.', actionLink: '/tasks/verification' }
};

const mockEnergyProviderData: EnergyProviderDashboardData = {
    projectLeads: [
        { id: 'lead1', entityName: 'Green Valley Farms', location: 'Nakuru, Kenya', estimatedEnergyNeed: 'Solar for irrigation pumps', status: 'New', actionLink: '#' },
        { id: 'lead2', entityName: 'Coastal Processors', location: 'Mombasa, Kenya', estimatedEnergyNeed: 'Biogas from waste products', status: 'Contacted', actionLink: '#' },
    ],
    activeProjects: [
        { id: 'proj1', projectName: 'Sunrise Cooperative Solar Array', solutionType: 'Solar', status: 'In Progress', completionDate: '2024-12-01' },
    ],
    impactMetrics: { totalInstallations: 15, totalEstimatedCarbonReduction: '250 Tons CO2e / year' }
};

const mockPackagingData: PackagingSupplierDashboardData = {
  demandForecast: { productType: 'Biodegradable Jute Bags (50kg)', unitsNeeded: 15000, for: 'Q4 Coffee Bean Exports' },
  integrationRequests: [
    { from: 'FreshFoods Processors Ltd.', request: 'Request for custom branded retail pouches.', actionLink: '#' },
  ],
  sustainableShowcase: { views: 2890, leads: 45 }
};

const mockRegulatorData: RegulatorDashboardData = {
  complianceRiskAlerts: [
    { id: 'alert1', issue: 'Unverified organic claims from Western Region', region: 'Western Region', severity: 'High', actionLink: '/compliance/investigate/alert1' },
  ],
  pendingCertifications: { count: 12, actionLink: '/certifications/pending-review' },
  supplyChainAnomalies: [
    { id: 'anom1', description: 'VTI log shows transportation event before harvest event for batch VTI-ABC.', level: 'Critical', vtiLink: '/traceability/batches/vti-abc' },
  ]
};

const mockQaData: QaDashboardData = {
  pendingInspections: [
    { id: 'insp1', batchId: 'VTI-XYZ-001', productName: 'Organic Hass Avocados', sellerName: 'Green Valley Organics', dueDate: new Date(Date.now() + 3 * 86400000).toISOString(), actionLink: '#' },
  ],
  recentResults: [
    { id: 'res2', productName: 'Maize Batch MB-04', result: 'Fail', reason: 'Aflatoxin levels exceed limits', inspectedAt: new Date(Date.now() - 2 * 86400000).toISOString() },
  ],
  qualityMetrics: { passRate: 98.5, averageScore: 9.2 }
};

const mockCertificationBodyData: CertificationBodyDashboardData = {
  pendingAudits: [
    { id: 'audit1', farmName: 'Green Valley Organics', standard: 'USDA Organic', dueDate: new Date(Date.now() + 14 * 86400000).toISOString(), actionLink: '#' },
  ],
  certifiedEntities: [
    { id: 'ent2', name: 'Coastal Cashews Ltd.', type: 'Processor', certificationStatus: 'Pending Renewal', actionLink: '#' },
  ],
  standardsMonitoring: [ { standard: 'USDA Organic', adherenceRate: 98, alerts: 2, actionLink: '#' } ]
};

const mockResearcherData: ResearcherDashboardData = {
  availableDatasets: [ { id: 'ds1', name: 'Anonymized Maize Price Data (2022-2023)', dataType: 'Market Data', accessLevel: 'Public', actionLink: '#' } ],
  ongoingProjects: [ { id: 'proj1', title: 'Impact of Cover Cropping on Soil Moisture', progress: 75, collaborators: ['Dr. Bello', 'Dr. Singh'], actionLink: '#' } ],
  knowledgeHubContributions: [ { id: 'khc2', title: 'The Economics of Smallholder Solar Irrigation', status: 'Pending Review', actionLink: '#' } ]
};

const mockAgronomistData: AgronomistDashboardData = {
    assignedFarmersOverview: [ { id: 'farmer1', name: 'Green Valley Farms', farmLocation: 'Nakuru, Kenya', lastConsultation: new Date(Date.now() - 7 * 86400000).toISOString(), alerts: 2 } ],
    pendingConsultationRequests: [ { id: 'req1', farmerName: 'Coastal Cashews Ltd.', issueSummary: 'Suspected fungal infection on new seedlings.', requestDate: new Date(Date.now() - 1 * 86400000).toISOString() } ],
    knowledgeBaseContributions: [ { id: 'kb1', title: 'Integrated Pest Management for Maize', status: 'Published' } ]
};

const mockAgroTourismData: AgroTourismDashboardData = {
  upcomingBookings: [ { id: 'booking1', experienceTitle: 'Organic Farm Tour & Tasting', guestName: 'Alice Johnson', date: new Date(Date.now() + 3 * 86400000).toISOString(), actionLink: '#' } ],
  listedExperiences: [ { id: 'exp1', title: 'Organic Farm Tour & Tasting', location: 'Nakuru, Kenya', status: 'Published', bookingsCount: 15, actionLink: '#' } ],
  guestReviews: [ { id: 'rev1', guestName: 'Charlie Brown', experienceTitle: 'Organic Farm Tour & Tasting', rating: 5, comment: 'Amazing and educational experience!', actionLink: '#' } ],
};

const mockInsuranceData: InsuranceProviderDashboardData = {
  pendingClaims: [ { id: 'claim1', policyHolderName: 'Green Valley Farms', policyType: 'Crop', claimDate: new Date(Date.now() - 2 * 86400000).toISOString(), status: 'Submitted', actionLink: '#' } ],
  riskAssessmentAlerts: [ { id: 'alert1', policyHolderName: 'Green Valley Farms', alert: 'High probability of drought reported in Nakuru.', severity: 'High', actionLink: '#' } ],
  activePolicies: [ { id: 'pol1', policyHolderName: 'Highland Coffee Co-op', policyType: 'Crop Insurance', coverageAmount: 50000, expiryDate: new Date(Date.now() + 150 * 86400000).toISOString(), actionLink: '#' } ]
};

const mockCrowdfunderData: CrowdfunderDashboardData = {
  portfolioOverview: { totalInvested: 7500, numberOfInvestments: 3, estimatedReturns: 8250 },
  suggestedOpportunities: [ { id: 'proj1', projectName: 'Solar Irrigation for Maasai Mara', category: 'Renewable Energy', fundingGoal: 20000, amountRaised: 5000, actionLink: '#' } ],
  recentTransactions: [ { id: 'txn1', projectName: 'Solar Irrigation for Maasai Mara', type: 'Investment', amount: 2500, date: new Date(Date.now() - 5 * 86400000).toISOString() } ]
};

const mockProcessingUnitData: ProcessingUnitDashboardData = {
  yieldOptimization: { currentYield: 85, potentialYield: 92, suggestion: "AI suggests adjusting blade speed on the primary chopper to reduce fine particle loss by an estimated 3%." },
  inventory: [ { product: 'Raw Cashew Nuts', quality: 'Grade A', tons: 15.5 } ],
  wasteReduction: { currentRate: 12, insight: "Analysis indicates 4% of waste is recoverable as animal feed. Consider partnering with local livestock farmers." },
  packagingOrders: [ { id: 'po1', supplierName: 'EcoPack Solutions', deliveryDate: '2023-11-10', status: 'In Transit', actionLink: '#' } ],
  packagingInventory: [ { packagingType: '5kg Branded Jute Bags', unitsInStock: 2500, reorderLevel: 1000 } ]
};

const mockWarehouseData: WarehouseDashboardData = {
  storageOptimization: { utilization: 78, suggestion: "Consolidate pallets in Zone C to free up a full row." },
  inventoryLevels: { totalItems: 450, itemsNeedingAttention: 12 },
  predictiveAlerts: [ { alert: "High humidity detected in Cold Storage Bay 2.", actionLink: "#" } ]
};

const mockCooperativeData: CooperativeDashboardData = {
  memberCount: 150, totalLandArea: 1200,
  aggregatedProduce: [ { id: 'prod1', productName: 'Organic Avocado', quantity: 25, quality: 'Grade A', readyBy: '2023-11-15' } ],
  pendingMemberApplications: 5,
};

// Exports using the helper
export const getLogisticsDashboardData = createMockDashboardFunction(mockLogisticsData);
export const getAgroExportDashboardData = createMockDashboardFunction(mockAgroExportData);
export const getFieldAgentDashboardData = createMockDashboardFunction(mockFieldAgentData);
export const getEnergyProviderDashboardData = createMockDashboardFunction(mockEnergyProviderData);
export const getPackagingSupplierDashboardData = createMockDashboardFunction(mockPackagingData);
export const getRegulatorDashboardData = createMockDashboardFunction(mockRegulatorData);
export const getQaDashboardData = createMockDashboardFunction(mockQaData);
export const getCertificationBodyDashboardData = createMockDashboardFunction(mockCertificationBodyData);
export const getResearcherDashboardData = createMockDashboardFunction(mockResearcherData);
export const getAgronomistDashboardData = createMockDashboardFunction(mockAgronomistData);
export const getAgroTourismDashboardData = createMockDashboardFunction(mockAgroTourismData);
export const getInsuranceProviderDashboardData = createMockDashboardFunction(mockInsuranceData);
export const getCrowdfunderDashboardData = createMockDashboardFunction(mockCrowdfunderData);
export const getProcessingUnitDashboardData = createMockDashboardFunction(mockProcessingUnitData);
export const getWarehouseDashboardData = createMockDashboardFunction(mockWarehouseData);
export const getCooperativeDashboardData = createMockDashboardFunction(mockCooperativeData);
