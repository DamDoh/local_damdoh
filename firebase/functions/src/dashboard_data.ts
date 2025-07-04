

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import type { 
    FarmerDashboardData,
    CooperativeDashboardData,
    BuyerDashboardData,
    RegulatorDashboardData,
    LogisticsDashboardData,
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
    PackagingSupplierDashboardData
} from "./types";

const db = admin.firestore();

// Helper to check for authentication in a consistent way
const checkAuth = (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated.",
    );
  }
  return context.auth.uid;
};

// =================================================================
// LIVE DATA DASHBOARDS
// =================================================================

export const getFarmerDashboardData = functions.https.onCall(
  async (data, context): Promise<FarmerDashboardData> => {
    const farmerId = checkAuth(context);
    try {
        const farmsPromise = db.collection('farms').where('ownerId', '==', farmerId).get();
        const cropsPromise = db.collection('crops').where('ownerId', '==', farmerId).orderBy('plantingDate', 'desc').limit(5).get();
        const knfBatchesPromise = db.collection('knf_batches').where('userId', '==', farmerId).where('status', 'in', ['Fermenting', 'Ready']).limit(5).get();

        const [farmsSnapshot, cropsSnapshot, knfBatchesSnapshot] = await Promise.all([
            farmsPromise,
            cropsPromise,
            knfBatchesSnapshot,
        ]);

        const farmsMap = new Map(farmsSnapshot.docs.map(doc => [doc.id, doc.data().name]));

        const recentCrops = cropsSnapshot.docs.map(doc => {
            const cropData = doc.data();
            return {
                id: doc.id,
                name: cropData.cropType || "Unknown Crop",
                stage: cropData.currentStage || 'Unknown',
                farmName: farmsMap.get(cropData.farmId) || 'Unknown Farm',
                farmId: cropData.farmId,
                plantingDate: (cropData.plantingDate as admin.firestore.Timestamp)?.toDate?.().toISOString() || null,
            };
        });

        const activeKnfBatches = knfBatchesSnapshot.docs.map(doc => {
            const batchData = doc.data();
            return {
                id: doc.id,
                typeName: batchData.typeName,
                status: batchData.status,
                nextStepDate: (batchData.nextStepDate as admin.firestore.Timestamp)?.toDate?.().toISOString() || null,
            };
        });

        const allCropsSnapshot = await db.collection('crops').where('ownerId', '==', farmerId).get();

        return {
            farmCount: farmsSnapshot.size,
            cropCount: allCropsSnapshot.size,
            recentCrops: recentCrops, 
            knfBatches: activeKnfBatches,
        };

    } catch (error) {
        console.error("Error fetching farmer dashboard data:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch farmer dashboard data.");
    }
  },
);


export const getPackagingSupplierDashboardData = functions.https.onCall(
  async (data, context): Promise<PackagingSupplierDashboardData> => {
    const supplierId = checkAuth(context);
    try {
        // Fetch real inventory data
        const inventorySnapshot = await db.collection('marketplaceItems')
            .where('sellerId', '==', supplierId)
            .where('category', '==', 'packaging-solutions')
            .get();

        const inventory = inventorySnapshot.docs.map(doc => {
            const item = doc.data();
            return {
                id: doc.id,
                item: item.name,
                stock: item.stock || 0, // Assuming a stock field exists
                reorderLevel: item.reorderLevel || 100, // Assuming a reorderLevel field
            };
        });
        
        // Fetch real orders
         const ordersSnapshot = await db.collection('marketplace_orders')
            .where('sellerId', '==', supplierId)
            .orderBy('createdAt', 'desc')
            .limit(10)
            .get();

        const buyerIds = [...new Set(ordersSnapshot.docs.map(doc => doc.data().buyerId))];
        const buyerProfiles: {[key: string]: string} = {};
        if(buyerIds.length > 0) {
            const buyerDocs = await db.collection('users').where(admin.firestore.FieldPath.documentId(), 'in', buyerIds).get();
            buyerDocs.forEach(doc => {
                buyerProfiles[doc.id] = doc.data().displayName || 'Unknown Customer';
            });
        }

        const incomingOrders = ordersSnapshot.docs.map(doc => {
            const order = doc.data();
            return {
                id: doc.id,
                customerName: buyerProfiles[order.buyerId] || 'Unknown Customer',
                product: order.listingName,
                quantity: order.quantity,
                status: order.status,
                actionLink: `/orders/${order.id}`,
            };
        });


        return { incomingOrders, inventory };

    } catch (error) {
        console.error("Error fetching packaging supplier dashboard data:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch dashboard data.");
    }
  }
);


// =================================================================
// PLACEHOLDER DASHBOARDS (to be implemented with real data later)
// =================================================================

export const getCooperativeDashboardData = functions.https.onCall(
  (data, context): CooperativeDashboardData => {
    checkAuth(context);
    return {
        memberCount: 125,
        totalLandArea: 850,
        aggregatedProduce: [
            { id: 'prod1', productName: 'Organic Maize', quantity: 50, quality: 'Grade A', readyBy: new Date(Date.now() + 86400000 * 7).toISOString() },
            { id: 'prod2', productName: 'Hass Avocados', quantity: 20, quality: 'Export Grade', readyBy: new Date(Date.now() + 86400000 * 14).toISOString() }
        ],
        pendingMemberApplications: 3,
    };
  }
);

export const getBuyerDashboardData = functions.https.onCall(
  (data, context): BuyerDashboardData => {
    checkAuth(context);
    return {
        supplyChainRisk: { region: 'East Africa', level: 'Medium', factor: 'Drought conditions affecting yields', action: { label: 'Diversify Sourcing', link: '/network?role=Farmer&region=WestAfrica' }},
        sourcingRecommendations: [
            { id: 'rec1', name: 'Green Valley Farms', product: 'Organic Avocados', reliability: 92, vtiVerified: true },
            { id: 'rec2', name: 'Kenya Coffee Co-op', product: 'AA Coffee Beans', reliability: 88, vtiVerified: true },
        ],
        marketPriceIntelligence: { product: 'Coffee Beans', trend: 'up', forecast: 'Prices expected to rise 5% next month due to weather.', action: { label: 'Secure Forward Contracts', link: '/marketplace?category=coffee' }}
    };
  }
);


export const getRegulatorDashboardData = functions.https.onCall(
  (data, context): RegulatorDashboardData => {
    checkAuth(context);
    return {
        complianceRiskAlerts: [
            { id: 'alert1', issue: 'Unverified organic inputs detected in VTI log', region: 'Rift Valley', severity: 'High', actionLink: '#' },
            { id: 'alert2', issue: 'Potential mislabeling of produce origin', region: 'Central Province', severity: 'Medium', actionLink: '#' }
        ],
        pendingCertifications: { count: 12, actionLink: '#' },
        supplyChainAnomalies: [
             { id: 'anom1', description: 'Unusual delay between harvest and transport logs for perishable goods.', level: 'Critical', vtiLink: '#' }
        ],
    };
  }
);


export const getLogisticsDashboardData = functions.https.onCall(
  (data, context): LogisticsDashboardData => {
    checkAuth(context);
    return {
        activeShipments: [
            { id: 'ship1', to: 'Mombasa Port', status: 'On Time', eta: new Date(Date.now() + 86400000 * 1).toISOString(), vtiLink: '#' },
            { id: 'ship2', to: 'Nairobi Central', status: 'Delayed', eta: new Date(Date.now() + 86400000 * 2).toISOString(), vtiLink: '#' }
        ],
        incomingJobs: [
            { id: 'job1', from: 'Eldoret Farms', to: 'Kampala', product: 'Maize (30 tons)', requirements: 'Standard Transport', actionLink: '#' }
        ],
        performanceMetrics: { onTimePercentage: 97, fuelEfficiency: '12km/L', actionLink: '#' }
    };
  }
);

export const getFiDashboardData = functions.https.onCall(
  (data, context): FiDashboardData => {
    checkAuth(context);
    return {
        pendingApplications: [
            { id: 'app1', applicantName: 'Green Valley Farms', type: 'Loan', amount: 5000, riskScore: 720, actionLink: '#' },
            { id: 'app2', applicantName: 'Sunrise Growers', type: 'Grant', amount: 15000, riskScore: 810, actionLink: '#' }
        ],
        portfolioAtRisk: { count: 5, value: 25000, highestRisk: { name: 'Sunset Farms', reason: 'Drought Alert' }, actionLink: '#' },
        marketUpdates: [
            { id: 'update1', content: 'Central Bank raises interest rates by 0.25%.', actionLink: '#' }
        ]
    };
  }
);

export const getFieldAgentDashboardData = functions.https.onCall(
  (data, context): FieldAgentDashboardData => {
    checkAuth(context);
    return {
        assignedFarmers: [
            { id: 'farmer1', name: 'John Doe', lastVisit: new Date(Date.now() - 86400000 * 3).toISOString(), issues: 2, actionLink: '#' },
            { id: 'farmer2', name: 'Jane Smith', lastVisit: new Date(Date.now() - 86400000 * 5).toISOString(), issues: 0, actionLink: '#' }
        ],
        portfolioHealth: { overallScore: 85, alerts: ['Pest alert in North region'], actionLink: '#' },
        pendingReports: 3,
        dataVerificationTasks: { count: 8, description: 'Verify harvest logs for maize', actionLink: '#' }
    };
  }
);


export const getInputSupplierDashboardData = functions.https.onCall(
  (data, context): InputSupplierDashboardData => {
    checkAuth(context);
    return {
        demandForecast: [
            { id: 'df1', region: 'Rift Valley', product: 'DAP Fertilizer', trend: 'High', reason: 'Planting season approaching' }
        ],
        productPerformance: [
            { id: 'pp1', productName: 'Eco-Fertilizer Plus', rating: 4.5, feedback: 'Great results on maize crops.', link: '#' }
        ],
        activeOrders: { count: 15, value: 12500, link: '#' }
    };
  }
);

export const getAgroExportDashboardData = functions.https.onCall(
  (data, context): AgroExportDashboardData => {
    checkAuth(context);
    return {
        pendingCustomsDocs: [
            { id: 'doc1', vtiLink: '#', destination: 'Rotterdam, NL', status: 'Awaiting Phytosanitary Certificate' }
        ],
        trackedShipments: [
            { id: 'ship1', status: 'In Transit', location: 'Indian Ocean', carrier: 'Maersk' }
        ],
        complianceAlerts: [
            { id: 'ca1', content: 'New packaging regulations for EU effective Aug 1.', actionLink: '#' }
        ]
    };
  }
);

export const getProcessingUnitDashboardData = functions.https.onCall(
  (data, context): ProcessingUnitDashboardData => {
    checkAuth(context);
    return {
        yieldOptimization: { currentYield: 88, potentialYield: 92, suggestion: 'Adjust blade speed for softer fruits.' },
        inventory: [
            { product: 'Mango Pulp', quality: 'Grade A', tons: 15 },
            { product: 'Pineapple Rings', quality: 'Grade A', tons: 10 }
        ],
        wasteReduction: { currentRate: 12, insight: 'High waste detected from peeling station.' },
        packagingOrders: [
            { id: 'po1', supplierName: 'PackRight Ltd.', deliveryDate: new Date(Date.now() + 86400000 * 5).toISOString(), status: 'Shipped', actionLink: '#' }
        ],
        packagingInventory: [
            { packagingType: '5kg Aseptic Bags', unitsInStock: 2500, reorderLevel: 1000 }
        ]
    };
  }
);


export const getWarehouseDashboardData = functions.https.onCall(
  (data, context): WarehouseDashboardData => {
    checkAuth(context);
    return {
        storageOptimization: { utilization: 78, suggestion: 'Consolidate pallets in Zone C.' },
        inventoryLevels: { totalItems: 120, itemsNeedingAttention: 5 },
        predictiveAlerts: [
            { alert: 'High humidity detected in Cold Storage 2. Risk of mold.', actionLink: '#' }
        ]
    };
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
  (data, context): CertificationBodyDashboardData => {
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

export const getResearcherDashboardData = functions.https.onCall(
    async (data, context): Promise<ResearcherDashboardData> => {
      const userId = checkAuth(context);
      try {
          // Fetch knowledge hub contributions made by this user
          const articlesSnapshot = await db.collection('knowledge_articles')
              .where('authorId', '==', userId) // Query by UID
              .orderBy('createdAt', 'desc')
              .limit(10)
              .get();

          const knowledgeHubContributions = articlesSnapshot.docs.map(doc => {
              const article = doc.data();
              return {
                  id: doc.id,
                  title: article.title_en || article.title_km || "Untitled Article",
                  status: 'Published' as const // Placeholder status
              };
          });

          // Mock data for datasets and projects, as these collections don't exist yet
          const availableDatasets = [
              { id: 'set1', name: 'Rift Valley Maize Yields (2020-2023)', dataType: 'CSV', accessLevel: 'Requires Request' as const, actionLink: '#' },
              { id: 'set2', name: 'Regional Soil Health Data (Anonymized)', dataType: 'JSON', accessLevel: 'Public' as const, actionLink: '#' },
          ];
          
          const ongoingProjects = [
              { id: 'proj1', title: 'Impact of KNF on Soil Health in Smallholder Farms', progress: 65, collaborators: ['University of Nairobi'], actionLink: '#' },
              { id: 'proj2', title: 'AI-driven Pest Identification Accuracy Study', progress: 30, collaborators: ['DamDoh AI Team'], actionLink: '#' }
          ];

          return {
              availableDatasets,
              ongoingProjects,
              knowledgeHubContributions,
          };

      } catch (error) {
          console.error("Error fetching researcher dashboard data:", error);
          throw new functions.https.HttpsError("internal", "Failed to fetch dashboard data.");
      }
    }
);


export const getAgronomistDashboardData = functions.https.onCall(
  (data, context): AgronomistDashboardData => {
    checkAuth(context);
    return {
        assignedFarmersOverview: [
            { id: 'farmer1', name: 'John Doe', farmLocation: 'Nakuru', lastConsultation: new Date(Date.now() - 86400000 * 7).toISOString(), alerts: 1 }
        ],
        pendingConsultationRequests: [
            { id: 'req1', farmerName: 'Jane Smith', issueSummary: 'Yellowing leaves on tomato plants.', requestDate: new Date().toISOString() }
        ],
        knowledgeHubContributions: [
            { id: 'kb1', title: 'Identifying Fall Armyworm', status: 'Published' }
        ]
    };
  }
);


export const getAgroTourismDashboardData = functions.https.onCall(
  (data, context): AgroTourismDashboardData => {
    checkAuth(context);
    return {
        upcomingBookings: [
            { id: 'book1', experienceTitle: 'Coffee Farm Tour & Tasting', guestName: 'Alice Johnson', date: new Date().toISOString(), actionLink: '#' }
        ],
        listedExperiences: [
            { id: 'exp1', title: 'Organic Farm Stay', location: 'Limuru', status: 'Published', bookingsCount: 12, actionLink: '#' }
        ],
        guestReviews: [
            { id: 'rev1', guestName: 'Bob Williams', experienceTitle: 'Coffee Farm Tour & Tasting', rating: 5, comment: 'Amazing experience, learned so much!', actionLink: '#' }
        ]
    };
  }
);

export const getInsuranceProviderDashboardData = functions.https.onCall(
  (data, context): InsuranceProviderDashboardData => {
    checkAuth(context);
    return {
        pendingClaims: [
            { id: 'claim1', policyHolderName: 'Green Valley Farms', policyType: 'Crop', claimDate: new Date().toISOString(), status: 'Under Review', actionLink: '#' }
        ],
        riskAssessmentAlerts: [
            { id: 'risk1', policyHolderName: 'Sunset Farms', alert: 'High flood risk predicted for next month.', severity: 'High', actionLink: '#' }
        ],
        activePolicies: [
            { id: 'pol1', policyHolderName: 'Green Valley Farms', policyType: 'Multi-peril Crop', coverageAmount: 50000, expiryDate: new Date().toISOString() }
        ]
    };
  }
);

export const getEnergyProviderDashboardData = functions.https.onCall(
  (data, context): EnergyProviderDashboardData => {
    checkAuth(context);
    return {
        projectLeads: [
            { id: 'lead1', entityName: 'Rift Valley Growers Co-op', location: 'Naivasha', estimatedEnergyNeed: '150kW Solar for Irrigation', status: 'Proposal Sent', actionLink: '#' }
        ],
        activeProjects: [
            { id: 'proj1', projectName: 'Greenhouse Solar Installation', solutionType: 'Solar PV', status: 'In Progress', completionDate: new Date().toISOString() }
        ],
        impactMetrics: { totalInstallations: 45, totalEstimatedCarbonReduction: '1,200 tCO2e/year' }
    };
  }
);


export const getCrowdfunderDashboardData = functions.https.onCall(
  (data, context): CrowdfunderDashboardData => {
    checkAuth(context);
    return {
        portfolioOverview: { totalInvested: 75000, numberOfInvestments: 8, estimatedReturns: 95000 },
        suggestedOpportunities: [
            { id: 'opp1', projectName: 'Women-Led Shea Butter Processing Unit', category: 'Value Addition', fundingGoal: 50000, amountRaised: 35000, actionLink: '#' }
        ],
        recentTransactions: [
            { id: 'tx1', projectName: 'Rift Valley Growers Co-op', type: 'Investment', amount: 5000, date: new Date().toISOString() }
        ]
    };
  }
);

export const getEquipmentSupplierDashboardData = functions.https.onCall(
  async (data, context): Promise<EquipmentSupplierDashboardData> => {
    const supplierId = checkAuth(context);
    try {
        // 1. Fetch listed equipment
        const equipmentSnapshot = await db.collection('marketplaceItems')
            .where('sellerId', '==', supplierId)
            .where('category', 'in', ['heavy-machinery-sale', 'equipment-rental-operation', 'farm-tools-small-equip'])
            .get();

        const listedEquipment = equipmentSnapshot.docs.map(doc => {
            const item = doc.data();
            return {
                id: doc.id,
                name: item.name,
                type: item.category === 'heavy-machinery-sale' ? 'Sale' : 'Rental', // simplified logic
                status: item.availabilityStatus || 'Available',
                actionLink: `/marketplace/${doc.id}`,
            };
        });

        // 2. Fetch rental activity
        const rentalOrdersSnapshot = await db.collection('marketplace_orders')
            .where('sellerId', '==', supplierId)
            // Ideally, we'd also filter by item category being a rental, but that requires a join.
            // We'll count all orders for simplicity in this step.
            .get();
        
        const rentalActivity = {
            totalRentals: rentalOrdersSnapshot.size,
        };

        // 3. Fetch maintenance requests (mocked for now)
        const pendingMaintenanceRequests: any[] = []; // No data source for this yet

        return {
            listedEquipment,
            rentalActivity,
            pendingMaintenanceRequests,
        };
    } catch (error) {
        console.error("Error fetching equipment supplier dashboard data:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch dashboard data.");
    }
  }
);

export const getWasteManagementDashboardData = functions.https.onCall(
  (data, context): WasteManagementDashboardData => {
    checkAuth(context);
    return {
      incomingWasteStreams: [
        { id: 'waste1', type: 'Maize Stover', source: 'Green Valley Farms', quantity: '10 tons' }
      ],
      compostBatches: [
        { id: 'comp1', status: 'Active', estimatedCompletion: new Date(Date.now() + 86400000 * 30).toISOString() },
        { id: 'comp2', status: 'Curing', estimatedCompletion: new Date(Date.now() + 86400000 * 10).toISOString() },
      ],
      finishedProductInventory: [
        { product: 'Grade A Compost', quantity: '25 tons', actionLink: '#' }
      ]
    };
  }
);
    
