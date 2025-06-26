
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { FarmerDashboardData, BuyerDashboardData, LogisticsDashboardData, FiDashboardData } from "lib/types";

const db = admin.firestore();

async function getDashboardData(collection: string, context: functions.https.CallableContext) {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    try {
        const snapshot = await db.collection(collection).where("userId", "==", context.auth.uid).get();
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return { data };
    } catch (error) {
        console.error(`Error fetching ${collection}:`, error);
        throw new functions.https.HttpsError("internal", `Failed to fetch ${collection}.`);
    }
}

export const getFarmerDashboardData = functions.https.onCall(async (data, context): Promise<FarmerDashboardData> => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    const uid = context.auth.uid;

    try {
        // Fetch user's farms and crops in parallel
        const farmsPromise = db.collection('farms').where('owner_id', '==', uid).get();
        const cropsPromise = db.collection('crops').where('owner_id', '==', uid).get();
        const userProfilePromise = db.collection('users').doc(uid).get();

        const [farmsSnapshot, cropsSnapshot, userProfileSnapshot] = await Promise.all([farmsPromise, cropsPromise, userProfilePromise]);

        const farms = farmsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const crops = cropsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const userProfile = userProfileSnapshot.data();
        const certifications = userProfile?.profileData?.certifications || [];
        
        // Simple trust score logic: 80 base + 5 per certification
        const reputationScore = 80 + (certifications.length * 5);

        // This remains mock data as it requires a dedicated AI model
        const matchedBuyers = [
            { id: 'buyer1', name: 'Global Grain Traders', matchScore: 92, request: 'Seeking 500 tons of non-GMO maize', contactId: 'globalGrain' },
            { id: 'buyer2', name: 'Artisan Coffee Roasters', matchScore: 85, request: 'Looking for single-origin specialty coffee beans', contactId: 'artisanCoffee' }
        ];

        const liveData: FarmerDashboardData = {
            farmCount: farms.length,
            cropCount: crops.length,
            recentCrops: crops.slice(0, 5).map((crop: any) => ({ // Ensure type safety
                id: crop.id,
                name: crop.crop_type,
                stage: crop.current_stage || 'Unknown',
                farmName: farms.find(f => f.id === crop.farm_id)?.name || 'Unknown Farm'
            })),
            trustScore: {
                reputation: reputationScore,
                certifications: certifications.map((cert: string, index: number) => ({ id: `cert${index}`, name: cert, issuingBody: 'Self-Reported' }))
            },
            matchedBuyers: matchedBuyers,
        };

        return liveData;

    } catch (error) {
        console.error("Error fetching farmer dashboard data:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch farmer dashboard data.");
    }
});


export const getBuyerDashboardData = functions.https.onCall(async (data, context): Promise<BuyerDashboardData> => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }

    // In a real scenario, we would use the buyer's UID (context.auth.uid) to fetch their
    // preferences and historical data to feed into AI models.
    // For now, we return structured mock data.
    
    const mockData: BuyerDashboardData = {
        supplyChainRisk: {
            region: 'East Africa',
            level: 'Medium',
            factor: 'Unpredictable rainfall patterns affecting maize harvest.',
            action: {
                label: 'View Mitigation Strategies',
                link: '/forums/topic/risk-mitigation-east-africa'
            }
        },
        sourcingRecommendations: [
            { id: 'farmer1', name: 'Green Valley Organics', product: 'Organic Hass Avocados', reliability: 95, vtiVerified: true },
            { id: 'farmer2', name: 'Rift Valley Growers', product: 'Bulk French Beans', reliability: 88, vtiVerified: true },
            { id: 'farmer3', name: 'Coastal Cashews Ltd', product: 'Raw Cashew Nuts', reliability: 82, vtiVerified: false },
        ],
        marketPriceIntelligence: {
            product: 'Coffee Beans (Arabica)',
            trend: 'up',
            forecast: 'Prices expected to increase 5-8% next quarter due to lower-than-expected rainfall in key growing regions.',
            action: {
                label: 'Secure Forward Contracts',
                link: '/marketplace?category=coffee'
            }
        }
    };
    
    return mockData;
});

export const getLogisticsDashboardData = functions.https.onCall(async (data, context): Promise<LogisticsDashboardData> => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }

    // In a real scenario, we would use the logistics provider's UID to fetch their actual data.
    // For now, we return structured mock data.
    const mockData: LogisticsDashboardData = {
        activeShipments: [
            { id: 'SHIP-001', to: 'Nairobi', status: 'In Transit', eta: '3 hours', vtiLink: '/traceability/vti-123' },
            { id: 'SHIP-002', to: 'Mombasa Port', status: 'Delayed', eta: '6 hours', vtiLink: '/traceability/vti-456' },
            { id: 'SHIP-003', to: 'Kampala', status: 'In Transit', eta: '2 days', vtiLink: '/traceability/vti-789' },
        ],
        incomingJobs: [
            { id: 'JOB-A', from: 'Green Valley Organics', to: 'Nairobi Central Market', product: 'Avocados', requirements: 'Refrigerated truck', actionLink: '/jobs/job-a' },
            { id: 'JOB-B', from: 'Rift Valley Growers', to: 'Mombasa Port', product: 'French Beans', requirements: 'Ventilated truck, 10 tons', actionLink: '/jobs/job-b' },
        ],
        performanceMetrics: {
            onTimePercentage: 97,
            fuelEfficiency: '8.2 km/L',
            actionLink: '/logistics/performance-report',
        }
    };
    
    return mockData;
});

export const getFiDashboardData = functions.https.onCall(async (data, context): Promise<FiDashboardData> => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    
    const mockData: FiDashboardData = {
        pendingApplications: [
            { id: 'app1', applicantName: 'Green Valley Organics', type: 'Working Capital Loan', amount: 50000, riskScore: 720, actionLink: '/fi-portal/applications/app1' },
            { id: 'app2', applicantName: 'Rift Valley Growers', type: 'Equipment Financing', amount: 120000, riskScore: 680, actionLink: '/fi-portal/applications/app2' },
        ],
        portfolioAtRisk: {
            count: 5,
            value: 250000,
            highestRisk: {
                name: 'Coastal Cashews Ltd',
                reason: 'Drought conditions affecting harvest projections.',
            },
            actionLink: '/fi-portal/portfolio-risk'
        },
        marketUpdates: [
            { id: 'update1', content: 'Central Bank has issued new guidance on agricultural lending rates for the next quarter.', actionLink: '/news/cbr-rates-update' },
            { id: 'update2', content: 'Policy Update: New government subsidies announced for drought-resistant crop inputs.', actionLink: '/news/gov-subsidies-q3' }
        ]
    };
    
    return mockData;
});

export const getAgroExportDashboardData = functions.https.onCall(async (data, context) => {
    return await getDashboardData("agro-export-dashboard", context);
});

export const getInputSupplierDashboardData = functions.https.onCall(async (data, context) => {
    return await getDashboardData("input-supplier-dashboard", context);
});

export const getFieldAgentDashboardData = functions.https.onCall(async (data, context) => {
    return await getDashboardData("field-agent-dashboard", context);
});

export const getEnergyProviderDashboardData = functions.https.onCall(async (data, context) => {
    return await getDashboardData("energy-provider-dashboard", context);
});

export const getPackagingSupplierDashboardData = functions.https.onCall(async (data, context) => {
    return await getDashboardData("packaging-supplier-dashboard", context);
});

export const getRegulatorDashboardData = functions.https.onCall(async (data, context) => {
    return await getDashboardData("regulator-dashboard", context);
});

export const getQaDashboardData = functions.https.onCall(async (data, context) => {
    return await getDashboardData("qa-dashboard", context);
});

export const getCertificationBodyDashboardData = functions.https.onCall(async (data, context) => {
    return await getDashboardData("certification-body-dashboard", context);
});

export const getResearcherDashboardData = functions.https.onCall(async (data, context) => {
    return await getDashboardData("researcher-dashboard", context);
});

export const getAgronomistDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }

    try {
        const agronomistId = context.auth.uid;

        const assignedFarmersPromise = db.collection('farmers').where('assignedAgronomist', '==', agronomistId).get();
        const consultationRequestsPromise = db.collection('consultationRequests').where('agronomistId', '==', agronomistId).where('status', '==', 'pending').get();
        const knowledgeBasePromise = db.collection('knowledgeBase').where('authorId', '==', agronomistId).get();

        const [assignedFarmersSnapshot, consultationRequestsSnapshot, knowledgeBaseSnapshot] = await Promise.all([
            assignedFarmersPromise,
            consultationRequestsPromise,
            knowledgeBasePromise,
        ]);

        const assignedFarmersOverview = assignedFarmersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const pendingConsultationRequests = consultationRequestsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const knowledgeBaseContributions = knowledgeBaseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        return {
            assignedFarmersOverview,
            pendingConsultationRequests,
            knowledgeBaseContributions,
        };

    } catch (error) {
        console.error("Error fetching Agronomist dashboard data:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch Agronomist dashboard data.");
    }
});


export const getAgroTourismDashboardData = functions.https.onCall(async (data, context) => {
    return await getDashboardData("agro-tourism-dashboard", context);
});

export const getInsuranceProviderDashboardData = functions.https.onCall(async (data, context) => {
    return await getDashboardData("insurance-provider-dashboard", context);
});

export const getCrowdfunderDashboardData = functions.https.onCall(async (data, context) => {
    return await getDashboardData("crowdfunder-dashboard", context);
});

export const getProcessingUnitDashboardData = functions.https.onCall(async (data, context) => {
    return await getDashboardData("processing-unit-dashboard", context);
});

export const getWarehouseDashboardData = functions.https.onCall(async (data, context) => {
    return await getDashboardData("warehouse-dashboard", context);
});
