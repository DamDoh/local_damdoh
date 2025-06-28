
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
<<<<<<< HEAD
import { FarmerDashboardData, BuyerDashboardData, LogisticsDashboardData, FiDashboardData, InputSupplierDashboardData, FieldAgentDashboardData, CooperativeDashboardData, ProcessingUnitDashboardData, WarehouseDashboardData, QaDashboardData, CertificationBodyDashboardData, ResearcherDashboardData, AgroTourismDashboardData, InsuranceProviderDashboardData, AgroExportDashboardData, PackagingSupplierDashboardData, RegulatorDashboardData, EnergyProviderDashboardData } from "./types";

const db = admin.firestore();

/**
 * Serializes a Firestore document snapshot, converting Timestamps to ISO strings.
 * @param doc The document snapshot to serialize.
 * @returns A serialized object with the document ID.
 */
function serializeDoc(doc: admin.firestore.DocumentSnapshot) {
    const data = doc.data();
    if (!data) return null;

    const serializedData: { [key: string]: any } = {};
    for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            const value = data[key];
            if (value instanceof admin.firestore.Timestamp) {
                serializedData[key] = value.toDate().toISOString();
            } else {
                serializedData[key] = value;
            }
        }
    }
    return { id: doc.id, ...serializedData };
}

async function getDashboardData(collection: string, context: functions.https.CallableContext) {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    try {
        const snapshot = await db.collection(collection).where("userId", "==", context.auth.uid).get();
        const data = snapshot.docs.map(serializeDoc).filter(d => d !== null);
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

        const farms = farmsSnapshot.docs.map(doc => serializeDoc(doc));
        const crops = cropsSnapshot.docs.map(doc => serializeDoc(doc));

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

export const getAgroExportDashboardData = functions.https.onCall(async (data, context): Promise<AgroExportDashboardData> => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    const mockData: AgroExportDashboardData = {
        pendingCustomsDocs: [
            { id: 'doc1', vtiLink: '/traceability/vti-123', destination: 'Rotterdam, NL', status: 'Awaiting Phytosanitary Certificate' },
            { id: 'doc2', vtiLink: '/traceability/vti-456', destination: 'Hamburg, DE', status: 'Ready for Submission' },
        ],
        trackedShipments: [
            { id: 'ship1', status: 'At Sea', location: 'Indian Ocean', carrier: 'Maersk' },
            { id: 'ship2', status: 'In Port', location: 'Mombasa Port', carrier: 'MSC' },
        ],
        complianceAlerts: [
            { id: 'alert1', content: 'New EU organic labeling requirements effective Q4 2024.', actionLink: '/news/eu-organic-update' }
        ]
    };
    return mockData;
});

export const getInputSupplierDashboardData = functions.https.onCall(async (data, context): Promise<InputSupplierDashboardData> => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    
    const mockData: InputSupplierDashboardData = {
        demandForecast: [
            { id: 'forecast1', region: 'Rift Valley, Kenya', product: 'Drought-Resistant Maize Seed', trend: 'High', reason: 'Below-average rainfall predicted for the upcoming planting season.' },
            { id: 'forecast2', region: 'Western Europe', product: 'Organic Avocado Fertilizer', trend: 'Moderate', reason: 'Increased consumer demand for organic avocados driving farmer investment.' }
        ],
        productPerformance: [
            { id: 'perf1', productName: 'Eco-Gro NPK 10-20-10', rating: 4.5, feedback: 'Good yield results, but packaging needs improvement.', link: '/reviews/eco-gro-1' },
            { id: 'perf2', productName: 'FungiStop Bio-Fungicide', rating: 3.8, feedback: 'Effective for early-stage blight, less so for advanced cases.', link: '/reviews/fungistop-1' }
        ],
        activeOrders: {
            count: 15,
            value: 22500,
            link: '/supplier/orders'
        }
    };
    
    return mockData;
});

export const getFieldAgentDashboardData = functions.https.onCall(async (data, context): Promise<FieldAgentDashboardData> => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    
    const mockData: FieldAgentDashboardData = {
        assignedFarmers: [
            { id: 'farmerA', name: 'Green Valley Organics', lastVisit: '2 weeks ago', issues: 2, actionLink: '/profiles/farmerA' },
            { id: 'farmerB', name: 'Rift Valley Growers', lastVisit: '1 week ago', issues: 0, actionLink: '/profiles/farmerB' },
            { id: 'farmerC', name: 'Coastal Cashews Ltd', lastVisit: '3 days ago', issues: 5, actionLink: '/profiles/farmerC' },
        ],
        portfolioHealth: {
            overallScore: 85,
            alerts: ['Drought warning for Rift Valley region.', 'Pest infestation reported by Coastal Cashews.'],
            actionLink: '/agent-portal/portfolio-health'
        },
        pendingReports: 3,
        dataVerificationTasks: {
            count: 7,
            description: 'VTI events awaiting verification.',
            actionLink: '/agent-portal/verification-queue'
        }
    };
    
    return mockData;
});

export const getCooperativeDashboardData = functions.https.onCall(async (data, context): Promise<CooperativeDashboardData> => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    // This is mock data simulating what would be fetched for a cooperative.
    // In a real app, this would involve complex aggregation queries over member farms.
    const mockData: CooperativeDashboardData = {
        memberCount: 152,
        totalLandArea: 320, // Hectares
        pendingMemberApplications: 3,
        aggregatedProduce: [
            { id: 'agg1', productName: 'Organic Maize', quantity: 250, quality: 'Grade A', readyBy: new Date(Date.now() + 86400000 * 7).toISOString() },
            { id: 'agg2', productName: 'Hass Avocados', quantity: 20, quality: 'Export Grade', readyBy: new Date(Date.now() + 86400000 * 14).toISOString() },
            { id: 'agg3', productName: 'Green Beans', quantity: 15, quality: 'Grade A', readyBy: new Date(Date.now() + 86400000 * 3).toISOString() },
        ]
    };
    
    return mockData;
});

export const getEnergyProviderDashboardData = functions.https.onCall(async (data, context): Promise<EnergyProviderDashboardData> => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    
    const mockData: EnergyProviderDashboardData = {
        projectLeads: [
            { id: 'lead1', entityName: 'Rift Valley Growers', location: 'Nakuru, Kenya', estimatedEnergyNeed: 'High', status: 'New', actionLink: '#' },
            { id: 'lead2', entityName: 'Coastal Processors', location: 'Mombasa, Kenya', estimatedEnergyNeed: 'Medium', status: 'Proposal Sent', actionLink: '#' },
        ],
        activeProjects: [
            { id: 'proj1', entityName: 'Green Valley Organics', location: 'Naivasha, Kenya', solutionType: 'Solar-powered irrigation pump', installationDate: new Date(Date.now() - 86400000 * 30).toISOString(), status: 'Completed', actionLink: '#' },
        ],
        impactMetrics: {
            totalInstallations: 15,
            totalEstimatedCarbonReduction: '120 tons CO2e/year',
            actionLink: '#',
        }
    };

    return mockData;
});

export const getPackagingSupplierDashboardData = functions.https.onCall(async (data, context): Promise<PackagingSupplierDashboardData> => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }

    const mockData: PackagingSupplierDashboardData = {
        demandForecast: {
            productType: "Biodegradable Pouches",
            unitsNeeded: 500000,
            for: "Dried Fruit Exporters",
        },
        integrationRequests: [
            { from: 'Premium Processors', request: 'API access for automated ordering', actionLink: '#' },
        ],
        sustainableShowcase: {
            views: 1250,
            leads: 45,
        }
    };
    
    return mockData;
});

export const getRegulatorDashboardData = functions.https.onCall(async (data, context): Promise<RegulatorDashboardData> => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }

    const mockData: RegulatorDashboardData = {
        complianceRiskAlerts: [
            { id: 'alert1', region: 'East Africa', issue: 'Unverified organic claims on maize exports.', severity: 'High', actionLink: '#' },
        ],
        pendingCertifications: {
            count: 8,
            actionLink: '#',
        },
        supplyChainAnomalies: [
            { id: 'anomaly1', description: "VTI batch #VTI-ABC-123 shows unusually long transport time between farm and processing unit.", level: 'Medium', vtiLink: '/traceability/vti-abc-123' },
        ]
    };
    
    return mockData;
});

export const getQaDashboardData = functions.https.onCall(async (data, context): Promise<QaDashboardData> => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    
    const mockData: QaDashboardData = {
        pendingInspections: [
            { id: 'insp1', batchId: 'VTI-XYZ-123', productName: 'Organic Hass Avocados', sellerName: 'Green Valley Organics', dueDate: new Date(Date.now() + 86400000 * 3).toISOString(), actionLink: '#' },
            { id: 'insp2', batchId: 'VTI-ABC-456', productName: 'Sun-dried Tomatoes', sellerName: 'Coastal Farms', dueDate: new Date(Date.now() + 86400000 * 5).toISOString(), actionLink: '#' },
        ],
        recentResults: [
            { id: 'res1', productName: 'Coffee Beans', result: 'Pass', inspectedAt: new Date(Date.now() - 86400000 * 2).toISOString() },
            { id: 'res2', productName: 'Cashew Nuts', result: 'Fail', reason: 'Aflatoxin levels above acceptable limits.', inspectedAt: new Date(Date.now() - 86400000 * 1).toISOString() },
        ],
        qualityMetrics: {
            passRate: 98.5,
            averageScore: 95.2,
        }
    };
    
    return mockData;
});

export const getCertificationBodyDashboardData = functions.https.onCall(async (data, context): Promise<CertificationBodyDashboardData> => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }

    const mockData: CertificationBodyDashboardData = {
        pendingAudits: [
            { id: 'aud1', farmName: 'Rift Valley Growers', standard: 'GlobalG.A.P.', dueDate: new Date(Date.now() + 86400000 * 14).toISOString(), actionLink: '#' },
            { id: 'aud2', farmName: 'Green Valley Organics', standard: 'USDA Organic', dueDate: new Date(Date.now() + 86400000 * 21).toISOString(), actionLink: '#' },
        ],
        certifiedEntities: [
            { id: 'ent1', name: 'Coastal Farms', type: 'Farmer', certificationStatus: 'Active', actionLink: '#' },
            { id: 'ent2', name: 'Premium Processors', type: 'Processor', certificationStatus: 'Pending Renewal', actionLink: '#' },
        ],
        standardsMonitoring: [
            { standard: 'GlobalG.A.P.', adherenceRate: 95, alerts: 2, actionLink: '#' },
            { standard: 'Fair Trade', adherenceRate: 99, alerts: 0, actionLink: '#' }
        ]
    };
    
    return mockData;
});


export const getResearcherDashboardData = functions.https.onCall(async (data, context): Promise<ResearcherDashboardData> => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    
    const mockData: ResearcherDashboardData = {
        availableDatasets: [
            { id: 'ds1', name: 'Anonymized Maize Yield Data (2022-2023)', description: 'Yield data from over 500 smallholder farms in East Africa.', dataType: 'Tabular', accessLevel: 'Anonymized', actionLink: '#' },
            { id: 'ds2', name: 'Public VTI Events for Coffee', description: 'Traceability events for specialty coffee batches marked as public.', dataType: 'Event Stream', accessLevel: 'Public', actionLink: '#' },
        ],
        ongoingProjects: [
            { id: 'proj1', title: 'Impact of Cover Cropping on Soil Health', progress: 65, collaborators: ['Dr. L. Hanson', 'AgriUniversity'], actionLink: '#' },
        ],
        knowledgeHubContributions: [
            { id: 'kh1', title: 'A Comparative Study of Drip vs. Furrow Irrigation', type: 'Article', status: 'Published', actionLink: '#' },
        ]
    };

    return mockData;
});

export const getAgronomistDashboardData = functions.https.onCall(async (data, context): Promise<any> => { // Changed type to any for simplicity
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
=======
import {FarmerDashboardData, BuyerDashboardData, LogisticsDashboardData, FiDashboardData, InputSupplierDashboardData, AgroExportDashboardData, FieldAgentDashboardData, ProcessingUnitDashboardData, WarehouseDashboardData, PackagingSupplierDashboardData, RegulatorDashboardData, EnergyProviderDashboardData, QaDashboardData, CertificationBodyDashboardData, ResearcherDashboardData, AgronomistDashboardData, AgroTourismDashboardData, InsuranceProviderDashboardData, CrowdfunderDashboardData} from "./types";

const db = admin.firestore();

export const getFarmerDashboardData = functions.https.onCall(
  async (data, context): Promise<FarmerDashboardData> => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated.",
      );
>>>>>>> Market-Place-Traceability
    }
    
    const farmerId = context.auth.uid;

    try {
<<<<<<< HEAD
        // MOCK DATA: In a real app, this would query Firestore
        const mockData: any = {
            assignedFarmersOverview: [
                { id: 'farmerA', name: 'Green Valley Organics', farmLocation: 'Nakuru, Kenya', lastConsultation: new Date(Date.now() - 86400000 * 10).toISOString(), alerts: 1, actionLink: '#' },
                { id: 'farmerB', name: 'Rift Valley Growers', farmLocation: 'Eldoret, Kenya', lastConsultation: new Date(Date.now() - 86400000 * 5).toISOString(), alerts: 0, actionLink: '#' },
            ],
            pendingConsultationRequests: [
                { id: 'req1', farmerName: 'Coastal Cashews Ltd', issueSummary: 'Suspected pest infestation in cashew trees.', requestDate: new Date(Date.now() - 86400000 * 2).toISOString(), actionLink: '#' },
            ],
            knowledgeBaseContributions: [
                { id: 'kh1', title: 'A Comparative Study of Drip vs. Furrow Irrigation', status: 'Published', actionLink: '#' },
                { id: 'kh2', title: 'Managing Fall Armyworm in Maize', status: 'Pending Review', actionLink: '#' },
            ]
=======
        // Fetch farms, recent crops, and KNF batches concurrently
        const farmsPromise = db.collection('farms').where('ownerId', '==', farmerId).limit(5).get();
        const recentCropsPromise = db.collection('crops').where('ownerId', '==', farmerId).orderBy('createdAt', 'desc').limit(5).get();
        const knfBatchesPromise = db.collection('knf_batches').where('userId', '==', farmerId).where('status', 'in', ['Fermenting', 'Ready']).limit(5).get();

        const [farmsSnapshot, recentCropsSnapshot, knfBatchesSnapshot] = await Promise.all([
            farmsPromise,
            recentCropsPromise,
            knfBatchesPromise,
        ]);

        const farms = farmsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        const recentCrops = recentCropsSnapshot.docs.map(doc => {
            const cropData = doc.data();
            return {
                id: doc.id,
                ...cropData,
                plantingDate: cropData.plantingDate?.toDate ? cropData.plantingDate.toDate().toISOString() : null,
            };
        });
        
        const knfBatches = knfBatchesSnapshot.docs.map(doc => {
            const batchData = doc.data();
            return {
                id: doc.id,
                ...batchData,
                nextStepDate: batchData.nextStepDate?.toDate ? batchData.nextStepDate.toDate().toISOString() : null,
            };
        });

        return {
            farmCount: farms.length,
            cropCount: recentCrops.length, 
            recentCrops: recentCrops as any,
            knfBatches: knfBatches as any,
>>>>>>> Market-Place-Traceability
        };
        return mockData;

    } catch (error) {
        console.error("Error fetching farmer dashboard data:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch farmer dashboard data.");
    }
  },
);


<<<<<<< HEAD
export const getAgroTourismDashboardData = functions.https.onCall(async (data, context): Promise<AgroTourismDashboardData> => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    
    const mockData: AgroTourismDashboardData = {
        listedExperiences: [
            { id: 'exp1', title: 'Organic Coffee Farm Tour & Tasting', location: 'Nyeri, Kenya', status: 'Active', bookingsCount: 45, actionLink: '#' },
            { id: 'exp2', title: 'Cheese Making Workshop', location: 'Limuru, Kenya', status: 'Paused', bookingsCount: 120, actionLink: '#' },
        ],
        upcomingBookings: [
            { id: 'book1', experienceTitle: 'Organic Coffee Farm Tour & Tasting', guestName: 'Jane Doe', date: new Date(Date.now() + 86400000 * 3).toISOString(), actionLink: '#' },
            { id: 'book2', experienceTitle: 'Organic Coffee Farm Tour & Tasting', guestName: 'John Smith', date: new Date(Date.now() + 86400000 * 5).toISOString(), actionLink: '#' },
        ],
        guestReviews: [
            { id: 'rev1', guestName: 'Alice', experienceTitle: 'Organic Coffee Farm Tour & Tasting', rating: 5, comment: 'An amazing and educational experience! The coffee was superb.', actionLink: '#' },
            { id: 'rev2', guestName: 'Bob', experienceTitle: 'Cheese Making Workshop', rating: 4, comment: 'Great fun, learned a lot. The host was very knowledgeable.', actionLink: '#' },
        ],
    };

    return mockData;
});

export const getInsuranceProviderDashboardData = functions.https.onCall(async (data, context): Promise<InsuranceProviderDashboardData> => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    
    // MOCK DATA
    const mockData: InsuranceProviderDashboardData = {
        pendingClaims: [
            { id: 'claim1', policyHolderName: 'Green Valley Organics', policyType: 'Crop Failure (Drought)', claimDate: new Date(Date.now() - 86400000 * 5).toISOString(), status: 'Under Review', actionLink: '#' },
        ],
        activePolicies: [
            { id: 'pol1', policyHolderName: 'Rift Valley Growers', policyType: 'Multi-Peril Crop Insurance', coverageAmount: 50000, expiryDate: new Date(Date.now() + 86400000 * 180).toISOString(), actionLink: '#' },
        ],
        riskAssessmentAlerts: [
            { id: 'risk1', policyHolderName: 'Green Valley Organics', alert: 'Projected extended drought in region.', severity: 'High', actionLink: '#' },
        ]
    };
    
    return mockData;
});
=======
export const getBuyerDashboardData = functions.https.onCall(
  async (data, context): Promise<BuyerDashboardData> => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated.",
      );
    }
    
    try {
        // Simulate fetching some farmers as sourcing recommendations
        const farmersSnapshot = await db.collection("users").where("primaryRole", "==", "Farmer").limit(3).get();
        const sourcingRecommendations = farmersSnapshot.docs.map(doc => {
            const farmerData = doc.data();
            return {
                id: doc.id,
                name: farmerData.name || "Unnamed Farm",
                product: farmerData.profileData?.crops?.[0] || "Various Produce", // Get first listed crop
                reliability: Math.floor(Math.random() * (98 - 85 + 1) + 85), // Random reliability
                vtiVerified: Math.random() > 0.3, // Random VTI verification
            };
        });

        // Keep mock data for other sections for now, focusing on one live part
        const liveData: BuyerDashboardData = {
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
    } catch (error) {
        console.error("Error fetching buyer dashboard data:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch buyer dashboard data.");
    }
  },
);
>>>>>>> Market-Place-Traceability

export const getLogisticsDashboardData = functions.https.onCall(
    async (data, context): Promise<LogisticsDashboardData> => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated.",
      );
    }
    // Returning structured, realistic mock data.
    // In a real system, this would come from live queries on 'shipments' and 'jobs' collections.
    const mockData: LogisticsDashboardData = {
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
  },
);

<<<<<<< HEAD
export const getProcessingUnitDashboardData = functions.https.onCall(async (data, context): Promise<ProcessingUnitDashboardData> => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    
    const mockData: ProcessingUnitDashboardData = {
        yieldOptimization: {
            currentYield: 85,
            potentialYield: 92,
            suggestion: "Adjusting blade speed on the primary chopper could increase yield by 7%.",
        },
        inventory: [
            { product: 'Raw Cashew Nuts', tons: 120, quality: 'Grade A' },
            { product: 'Dried Mango Slices', tons: 15, quality: 'Export Ready' },
            { product: 'Hibiscus Flowers', tons: 45, quality: 'Grade B' },
        ],
        wasteReduction: {
            currentRate: 12,
            potentialRate: 8,
            insight: "Repurposing fruit peels for animal feed could reduce waste by 4%.",
        },
        packagingOrders: [
             { id: 'PO-001', supplierName: 'EcoPack Solutions', orderDate: new Date(Date.now() - 86400000 * 5).toISOString(), deliveryDate: new Date(Date.now() + 86400000 * 2).toISOString(), status: 'Shipped', actionLink: '#' },
             { id: 'PO-002', supplierName: 'Bulk Bags Inc.', orderDate: new Date(Date.now() - 86400000 * 2).toISOString(), deliveryDate: new Date(Date.now() + 86400000 * 10).toISOString(), status: 'Pending', actionLink: '#' },
        ],
        packagingInventory: [
            { packagingType: '50kg Jute Bags', unitsInStock: 12000, reorderLevel: 10000 },
            { packagingType: '250g Stand-up Pouches', unitsInStock: 45000, reorderLevel: 50000 },
        ],
        packagingImpactMetrics: [
            { metric: 'Recycled Content Used', value: '35%', actionLink: '#' }
=======
export const getFiDashboardData = functions.https.onCall(
  async (data, context): Promise<FiDashboardData> => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated.",
      );
    }
    // Returning mock data to power the new dashboard UI
    const mockData: FiDashboardData = {
      pendingApplications: [
        { id: "app1", applicantName: "Green Valley Farms", type: "Crop Loan", amount: 25000, riskScore: 720, actionLink: "/applications/app1" },
        { id: "app2", applicantName: "Sunrise Cooperative", type: "Equipment Financing", amount: 150000, riskScore: 680, actionLink: "/applications/app2" },
      ],
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
    return mockData;
  },
);

export const getAgroExportDashboardData = functions.https.onCall(
  async (data, context): Promise<AgroExportDashboardData> => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated.",
      );
    }
    // Returning mock data to power the new dashboard UI
    const mockData: AgroExportDashboardData = {
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
  },
);

export const getInputSupplierDashboardData = functions.https.onCall(
  async (data, context): Promise<InputSupplierDashboardData> => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated.",
      );
    }
    // Returning mock data to power the new dashboard UI
    const mockData: InputSupplierDashboardData = {
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
  },
);

export const getFieldAgentDashboardData = functions.https.onCall(
  async (data, context): Promise<FieldAgentDashboardData> => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated.",
      );
    }
    // Returning mock data to power the new dashboard UI
    const mockData: FieldAgentDashboardData = {
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
  },
);

export const getEnergyProviderDashboardData = functions.https.onCall(
  async (data, context): Promise<EnergyProviderDashboardData> => {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    // Returning mock data to power the new dashboard UI
    const mockData: EnergyProviderDashboardData = {
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
  },
);

export const getPackagingSupplierDashboardData = functions.https.onCall(
  async (data, context): Promise<PackagingSupplierDashboardData> => {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    const mockData: PackagingSupplierDashboardData = {
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
  },
);

export const getRegulatorDashboardData = functions.https.onCall(
  async (data, context): Promise<RegulatorDashboardData> => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated.",
      );
    }
    // Returning mock data to power the new dashboard UI
    const mockData: RegulatorDashboardData = {
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
  },
);

export const getQaDashboardData = functions.https.onCall(
  async (data, context): Promise<QaDashboardData> => {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    // Returning mock data for the QA dashboard
    const mockData: QaDashboardData = {
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
  },
);

export const getCertificationBodyDashboardData = functions.https.onCall(
  async (data, context): Promise<CertificationBodyDashboardData> => {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    // Returning mock data to power the new dashboard UI
    const mockData: CertificationBodyDashboardData = {
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
  },
);

export const getResearcherDashboardData = functions.https.onCall(
  async (data, context): Promise<ResearcherDashboardData> => {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }

    const mockData: ResearcherDashboardData = {
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
  },
);

export const getAgronomistDashboardData = functions.https.onCall(
  async (data, context): Promise<AgronomistDashboardData> => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated.",
      );
    }
    
    // Returning mock data to power the new dashboard UI
    const mockData: AgronomistDashboardData = {
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
>>>>>>> Market-Place-Traceability
        ]
    };

    return mockData;
<<<<<<< HEAD
});

export const getWarehouseDashboardData = functions.https.onCall(async (data, context): Promise<WarehouseDashboardData> => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }

    const mockData: WarehouseDashboardData = {
        storageOptimization: {
            utilization: 78,
            suggestion: "Consolidate pallets from zones A3 and B1 to free up a full row.",
        },
        inventoryLevels: {
            totalItems: 4500,
            itemsNeedingAttention: 12,
        },
        predictiveAlerts: [
            { id: 'alert1', alert: "High humidity detected in Zone C. Risk to stored grains.", actionLink: '#' },
            { id: 'alert2', alert: "Batch #VTI-XYZ-889 nearing its 'best before' date. Prioritize for dispatch.", actionLink: '#' },
        ],
    };
    
    return mockData;
});
=======
  },
);

export const getAgroTourismDashboardData = functions.https.onCall(
  async (data, context): Promise<AgroTourismDashboardData> => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated.",
      );
    }
    // Returning mock data to power the new dashboard UI
    const mockData: AgroTourismDashboardData = {
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
  },
);


export const getInsuranceProviderDashboardData = functions.https.onCall(
  async (data, context): Promise<InsuranceProviderDashboardData> => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated.",
      );
    }
    // Returning mock data to power the new dashboard UI
    const mockData: InsuranceProviderDashboardData = {
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
  },
);


export const getCrowdfunderDashboardData = functions.https.onCall(
  async (data, context): Promise<CrowdfunderDashboardData> => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated.",
      );
    }
    // Returning mock data to power the new dashboard UI
    const mockData: CrowdfunderDashboardData = {
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
  },
);

export const getProcessingUnitDashboardData = functions.https.onCall(
  async (data, context): Promise<ProcessingUnitDashboardData> => {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    // Returning mock data to power the new dashboard UI
    const mockData: ProcessingUnitDashboardData = {
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
  },
);

export const getWarehouseDashboardData = functions.https.onCall(
  async (data, context): Promise<WarehouseDashboardData> => {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    // Returning mock data to power the new dashboard UI
    const mockData: WarehouseDashboardData = {
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
  },
);

>>>>>>> Market-Place-Traceability
