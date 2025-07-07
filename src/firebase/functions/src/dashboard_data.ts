

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
    PackagingSupplierDashboardData,
    FinancialApplication,
    AgriTechInnovatorDashboardData,
    FarmerDashboardAlert,
    OperationsDashboardData,
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
        const cropsPromise = db.collection('crops').where('ownerId', '==', farmerId).orderBy('plantingDate', 'desc').get();
        const knfBatchesPromise = db.collection('knf_batches').where('userId', '==', farmerId).orderBy('createdAt', 'desc').get();
        const financialsPromise = db.collection('financial_transactions').where('userRef', '==', db.collection('users').doc(farmerId)).get();


        const [farmsSnapshot, cropsSnapshot, knfBatchesSnapshot, financialsSnapshot] = await Promise.all([
            farmsPromise,
            cropsPromise,
            knfBatchesPromise,
            financialsPromise,
        ]);
        
        // --- Alerts Logic ---
        const alerts: FarmerDashboardAlert[] = [];
        const now = new Date();
        const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        knfBatchesSnapshot.docs.forEach(doc => {
            const batch = doc.data();
            if (batch.status === 'Fermenting' && batch.nextStepDate.toDate() <= now) {
                alerts.push({
                    id: `knf-${doc.id}`,
                    icon: 'FlaskConical',
                    type: 'info',
                    message: `Your ${batch.typeName} batch is ready for its next step.`,
                    link: '/farm-management/knf-inputs'
                });
            }
        });

        cropsSnapshot.docs.forEach(doc => {
            const crop = doc.data();
            if (crop.harvestDate && crop.harvestDate.toDate() <= sevenDaysFromNow && crop.harvestDate.toDate() >= now) {
                 alerts.push({
                    id: `crop-${doc.id}`,
                    icon: 'Sprout',
                    type: 'warning',
                    message: `Your ${crop.cropType} crop is due for harvest soon.`,
                    link: `/farm-management/farms/${crop.farmId}`
                });
            }
        });


        const farmsMap = new Map(farmsSnapshot.docs.map(doc => [doc.id, doc.data().name]));

        const recentCrops = cropsSnapshot.docs.slice(0, 5).map(doc => {
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

        const activeKnfBatches = knfBatchesSnapshot.docs
            .filter(doc => ['Fermenting', 'Ready'].includes(doc.data().status))
            .slice(0, 5)
            .map(doc => {
                const batchData = doc.data();
                return {
                    id: doc.id,
                    typeName: batchData.typeName,
                    status: batchData.status,
                    nextStepDate: (batchData.nextStepDate as admin.firestore.Timestamp)?.toDate?.().toISOString() || null,
                };
            });

        let totalIncome = 0;
        let totalExpense = 0;
        financialsSnapshot.forEach(doc => {
            const tx = doc.data();
            if (tx.type === 'income') {
                totalIncome += tx.amount;
            } else if (tx.type === 'expense') {
                totalExpense += tx.amount;
            }
        });
        
        const financialSummary = {
            totalIncome,
            totalExpense,
            netFlow: totalIncome - totalExpense,
        };
        
        const certsSnapshot = await db.collection('users').doc(farmerId).collection('certifications').get();
        const certifications = certsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as FarmerDashboardData['certifications'];


        return {
            farmCount: farmsSnapshot.size,
            cropCount: cropsSnapshot.size,
            recentCrops: recentCrops, 
            knfBatches: activeKnfBatches,
            financialSummary: financialSummary,
            alerts: alerts,
            certifications: certifications,
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


export const getFiDashboardData = functions.https.onCall(
  async (data, context): Promise<FiDashboardData> => {
    const fiId = checkAuth(context);
    try {
        // Fetch real pending applications
        const applicationsSnapshot = await db.collection('financial_applications')
            .where('fiId', '==', fiId) // Assuming applications are assigned to an FI
            .where('status', 'in', ['Pending', 'Under Review'])
            .orderBy('submittedAt', 'desc')
            .limit(10)
            .get();
            
        const pendingApplications: FinancialApplication[] = applicationsSnapshot.docs.map(doc => {
            const appData = doc.data();
            return {
                id: doc.id,
                applicantId: appData.applicantId,
                applicantName: appData.applicantName,
                fiId: appData.fiId,
                type: appData.type,
                amount: appData.amount,
                currency: appData.currency,
                status: appData.status,
                riskScore: appData.riskScore,
                purpose: appData.purpose,
                submittedAt: (appData.submittedAt as admin.firestore.Timestamp)?.toDate?.().toISOString() ?? null,
                actionLink: `/fi/applications/${doc.id}`,
            };
        });

        // Mock data for other sections
        const portfolioAtRisk = {
            count: 5,
            value: 25000,
            highestRisk: { name: 'Sunset Farms', reason: 'Drought Alert' },
            actionLink: '#'
        };
        const marketUpdates = [
            { id: 'update1', content: 'Central Bank raises interest rates by 0.25%.', actionLink: '#' }
        ];

        return {
            pendingApplications,
            portfolioAtRisk,
            marketUpdates,
        };
    } catch (error) {
        console.error("Error fetching Financial Institution dashboard data:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch FI dashboard data.");
    }
  }
);


// =================================================================
// DASHBOARDS WITH PARTIAL OR MOCK DATA
// =================================================================


export const getCooperativeDashboardData = functions.https.onCall(
  async (data, context): Promise<CooperativeDashboardData> => {
    const cooperativeId = checkAuth(context);
    
    try {
        // --- Member Data ---
        // In a real app, you'd fetch members from a subcollection on the cooperative's document.
        // For this demo, we'll simulate by finding a few farmers.
        const membersSnapshot = await db.collection('users').where('primaryRole', '==', 'Farmer').limit(5).get();
        const memberIds = membersSnapshot.docs.map(doc => doc.id);
        const memberCount = membersSnapshot.size;
        
        // --- Aggregated Land Area ---
        let totalLandArea = 0;
        if (memberIds.length > 0) {
            const farmsSnapshot = await db.collection('farms').where('ownerId', 'in', memberIds).get();
            farmsSnapshot.forEach(doc => {
                // Assuming 'size' is a string like "50 Hectares", we parse the number.
                const sizeString = doc.data().size || '0';
                const sizeValue = parseFloat(sizeString.split(' ')[0]) || 0;
                totalLandArea += sizeValue;
            });
        }

        // --- Aggregated Produce ---
        const aggregatedProduce: CooperativeDashboardData['aggregatedProduce'] = [];
        if (memberIds.length > 0) {
            const cropsSnapshot = await db.collection('crops')
                .where('ownerId', 'in', memberIds)
                .where('currentStage', 'in', ['Harvesting', 'Post-Harvest'])
                .orderBy('harvestDate', 'desc')
                .limit(5)
                .get();

            cropsSnapshot.forEach(doc => {
                const cropData = doc.data();
                aggregatedProduce.push({
                    id: doc.id,
                    productName: cropData.cropType || 'Unknown Produce',
                    // Assuming yield is stored on the crop document, or would be on the harvest event
                    quantity: parseFloat(cropData.expectedYield?.split(' ')[0] || '0'), 
                    quality: 'Grade A', // Placeholder as it's not on the crop model
                    readyBy: (cropData.harvestDate as admin.firestore.Timestamp)?.toDate?.().toISOString() || new Date().toISOString(),
                });
            });
        }

        // --- Pending Applications ---
        // This remains mocked as the application system is not built yet.
        const pendingMemberApplications = 3;

        return {
            memberCount,
            totalLandArea,
            aggregatedProduce,
            pendingMemberApplications,
        };

    } catch (error) {
        console.error("Error fetching cooperative dashboard data:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch dashboard data.");
    }
  }
);

export const getBuyerDashboardData = functions.https.onCall(
  async (data, context): Promise<BuyerDashboardData> => {
    checkAuth(context);
    
    try {
        // --- Sourcing Recommendations ---
        // Fetch a few highly-rated, verified product listings.
        const recommendationsSnapshot = await db.collection('marketplaceItems')
            .where('listingType', '==', 'Product')
            .where('isSustainable', '==', true) // Example filter for "good" products
            .orderBy('createdAt', 'desc')
            .limit(5)
            .get();
        
        const sellerIds = [...new Set(recommendationsSnapshot.docs.map(doc => doc.data().sellerId))];
        const sellerProfiles: Record<string, string> = {};
        if (sellerIds.length > 0) {
            const sellersSnapshot = await db.collection('users').where(admin.firestore.FieldPath.documentId(), 'in', sellerIds).get();
            sellersSnapshot.forEach(doc => {
                sellerProfiles[doc.id] = doc.data().displayName || 'Unknown Seller';
            });
        }

        const sourcingRecommendations = recommendationsSnapshot.docs.map(doc => {
            const item = doc.data();
            return {
                id: doc.id,
                name: sellerProfiles[item.sellerId] || 'Verified Supplier',
                product: item.name,
                reliability: 85 + Math.floor(Math.random() * 15), // Mock reliability
                vtiVerified: !!item.relatedTraceabilityId,
            };
        });

        // --- Mock Data for other sections ---
        // These sections would require more complex AI/data analysis in a real app.
        const supplyChainRisk = { 
            region: 'East Africa', 
            level: 'Medium', 
            factor: 'Drought conditions affecting coffee bean yields.', 
            action: { label: 'Diversify Sourcing', link: '/network?role=Farmer&region=WestAfrica' }
        };
        const marketPriceIntelligence = { 
            product: 'Coffee Beans', 
            trend: 'up' as 'up' | 'down' | 'stable', 
            forecast: 'Prices expected to rise 5% next month due to weather.', 
            action: { label: 'Secure Forward Contracts', link: '/marketplace?category=fresh-produce-fruits' } // updated link to match a category
        };

        return {
            supplyChainRisk,
            sourcingRecommendations,
            marketPriceIntelligence
        };

    } catch (error) {
        console.error("Error fetching buyer dashboard data:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch dashboard data for buyer.");
    }
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
  async (data, context): Promise<LogisticsDashboardData> => {
    const logisticsProviderId = checkAuth(context);
    
    try {
        const shipmentsSnapshot = await db.collection('marketplace_orders')
            .where('status', '==', 'shipped')
            // In a real app, we'd also filter by logisticsProviderId if that field existed on the order
            .orderBy('updatedAt', 'desc')
            .limit(5)
            .get();

        const itemIdsForVti = [...new Set(shipmentsSnapshot.docs.map(doc => doc.data().itemId))];
        const itemDetails: Record<string, any> = {};
        if (itemIdsForVti.length > 0) {
            const itemsSnapshot = await db.collection('marketplaceItems').where(admin.firestore.FieldPath.documentId(), 'in', itemIdsForVti).get();
            itemsSnapshot.forEach(doc => {
                itemDetails[doc.id] = { relatedTraceabilityId: doc.data().relatedTraceabilityId };
            });
        }

        const activeShipments = shipmentsSnapshot.docs.map(doc => {
            const order = doc.data();
            const relatedVtiId = itemDetails[order.itemId]?.relatedTraceabilityId;
            return {
                id: doc.id,
                to: order.buyerLocation || 'Unknown Destination', 
                status: 'In Transit',
                eta: new Date(Date.now() + Math.random() * 5 * 86400000).toISOString(),
                vtiLink: relatedVtiId ? `/traceability/batches/${relatedVtiId}` : '#'
            };
        });

        const jobsSnapshot = await db.collection('marketplace_orders')
            .where('status', '==', 'confirmed')
            // Filter where no logistics provider is assigned yet
            //.where('logisticsProviderId', '==', null) 
            .orderBy('createdAt', 'desc')
            .limit(5)
            .get();
            
        const sellerIds = [...new Set(jobsSnapshot.docs.map(doc => doc.data().sellerId))];
        const sellerProfiles: Record<string, any> = {};
        if (sellerIds.length > 0) {
            const sellersSnapshot = await db.collection('users').where(admin.firestore.FieldPath.documentId(), 'in', sellerIds).get();
            sellersSnapshot.forEach(doc => {
                sellerProfiles[doc.id] = { location: doc.data().location || 'Unknown Origin' };
            });
        }

        const incomingJobs = jobsSnapshot.docs.map(doc => {
            const order = doc.data();
            return {
                id: doc.id,
                from: sellerProfiles[order.sellerId]?.location || 'Unknown Origin',
                to: order.buyerLocation || 'Unknown Destination',
                product: `${order.listingName} (${order.quantity} units)`,
                requirements: 'Standard Transport',
                actionLink: `/marketplace/my-orders/${order.id}`
            };
        });

        const performanceMetrics = { 
            onTimePercentage: 97, 
            fuelEfficiency: '12km/L', 
            actionLink: '#' 
        };

        return {
            activeShipments,
            incomingJobs,
            performanceMetrics,
        };
    } catch (error) {
        console.error("Error fetching logistics dashboard data:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch dashboard data for logistics.");
    }
  }
);


export const getFieldAgentDashboardData = functions.https.onCall(
  async (data, context): Promise<FieldAgentDashboardData> => {
    const agentId = checkAuth(context);
    
    try {
        const agentDoc = await db.collection('users').doc(agentId).get();
        if (!agentDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Agent profile not found.');
        }
        
        const agentData = agentDoc.data();
        // Assuming assigned farmers are stored in profileData.assignedFarmers
        const assignedFarmerIds = agentData?.profileData?.assignedFarmers || [];
        
        let assignedFarmers: FieldAgentDashboardData['assignedFarmers'] = [];

        if (assignedFarmerIds.length > 0) {
            // Firestore 'in' query is limited to 30 items per query.
            // For a production app, this would need chunking if an agent has > 30 farmers.
            const farmersSnapshot = await db.collection('users').where(admin.firestore.FieldPath.documentId(), 'in', assignedFarmerIds.slice(0, 30)).get();
            
            assignedFarmers = farmersSnapshot.docs.map(doc => {
                const farmerData = doc.data();
                // Mocking lastVisit and issues for now
                return {
                    id: doc.id,
                    name: farmerData.displayName || 'Unknown Farmer',
                    lastVisit: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
                    issues: Math.floor(Math.random() * 3), // Random number of issues
                    actionLink: `/profiles/${doc.id}`
                };
            });
        }
        
        // Keep other parts mocked for this iteration
        const portfolioHealth = {
            overallScore: 85,
            alerts: ['Pest alert in North region'],
            actionLink: '#'
        };
        const pendingReports = 3;
        const dataVerificationTasks = {
            count: 8,
            description: 'Verify harvest logs for maize',
            actionLink: '#'
        };

        return {
            assignedFarmers,
            portfolioHealth,
            pendingReports,
            dataVerificationTasks
        };
        
    } catch (error) {
        console.error("Error fetching field agent dashboard data:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch dashboard data for field agent.");
    }
  }
);


export const getInputSupplierDashboardData = functions.https.onCall(
  async (data, context): Promise<InputSupplierDashboardData> => {
    const supplierId = checkAuth(context);

    try {
      // 1. Fetch active orders
      const ordersSnapshot = await db.collection('marketplace_orders')
        .where('sellerId', '==', supplierId)
        .get();

      const ordersData = ordersSnapshot.docs.map(doc => doc.data());
      const totalValue = ordersData.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

      const activeOrders = {
        count: ordersSnapshot.size,
        value: totalValue,
        link: '/orders/manage' // A conceptual link for now
      };

      // 2. Keep other sections as mock data for now
      const demandForecast = [
        { id: 'df1', region: 'Rift Valley', product: 'DAP Fertilizer', trend: 'High', reason: 'Planting season approaching' }
      ];
      const productPerformance = [
        { id: 'pp1', productName: 'Eco-Fertilizer Plus', rating: 4.5, feedback: 'Great results on maize crops.', link: '#' }
      ];

      return {
        demandForecast,
        productPerformance,
        activeOrders,
      };

    } catch (error) {
        console.error("Error fetching Input Supplier dashboard data:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch dashboard data.");
    }
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
  async (data, context): Promise<ProcessingUnitDashboardData> => {
    const unitId = checkAuth(context);
    try {
        const packagingOrdersPromise = db.collection('marketplace_orders')
            .where('buyerId', '==', unitId)
            .orderBy('createdAt', 'desc')
            .limit(5)
            .get();

        const packagingInventoryPromise = db.collection('marketplaceItems')
            .where('sellerId', '==', unitId)
            .where('category', '==', 'packaging-solutions')
            .get();

        const [ordersSnapshot, inventorySnapshot] = await Promise.all([
            packagingOrdersPromise,
            packagingInventoryPromise,
        ]);
        
        const sellerIds = [...new Set(ordersSnapshot.docs.map(doc => doc.data().sellerId))];
        const sellerProfiles: Record<string, string> = {};
        if (sellerIds.length > 0) {
            const sellerDocs = await db.collection('users').where(admin.firestore.FieldPath.documentId(), 'in', sellerIds).get();
            sellerDocs.forEach(doc => {
                sellerProfiles[doc.id] = doc.data().displayName || 'Unknown Supplier';
            });
        }

        const packagingOrders = ordersSnapshot.docs.map(doc => {
            const order = doc.data();
            return {
                id: doc.id,
                supplierName: sellerProfiles[order.sellerId] || 'Unknown Supplier',
                deliveryDate: order.expectedDeliveryDate?.toDate().toISOString() || new Date(Date.now() + 86400000 * 5).toISOString(),
                status: order.status,
                actionLink: `/marketplace/my-orders/${order.id}`,
            };
        });
        
        const packagingInventory = inventorySnapshot.docs.map(doc => {
            const item = doc.data();
            return {
                packagingType: item.name,
                unitsInStock: item.stock || 0,
                reorderLevel: item.reorderLevel || 100,
            };
        });

        // Mock data for other sections for now
        const yieldOptimization = { currentYield: 88, potentialYield: 92, suggestion: 'Adjust blade speed for softer fruits.' };
        const inventory = [ { product: 'Mango Pulp', quality: 'Grade A', tons: 15 }, { product: 'Pineapple Rings', quality: 'Grade A', tons: 10 } ];
        const wasteReduction = { currentRate: 12, insight: 'High waste detected from peeling station.' };

        return {
            yieldOptimization,
            inventory,
            wasteReduction,
            packagingOrders,
            packagingInventory,
        };
    } catch (error) {
        console.error("Error fetching Processing Unit dashboard data:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch dashboard data.");
    }
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
  async (data, context): Promise<AgronomistDashboardData> => {
    const userId = checkAuth(context);
    try {
        // Fetch knowledge hub contributions made by this user
        const articlesSnapshot = await db.collection('knowledge_articles')
            .where('authorId', '==', userId)
            .orderBy('createdAt', 'desc')
            .limit(10)
            .get();

        const knowledgeHubContributions = articlesSnapshot.docs.map(doc => {
            const article = doc.data();
            return {
                id: doc.id,
                title: article.title_en || article.title_km || "Untitled Article",
                status: article.status || 'Published',
            };
        });

        // Mock data for other sections
        const assignedFarmersOverview = [
            { id: 'farmerJoe', name: 'Joe\'s Family Farm', farmLocation: 'California, USA', lastConsultation: new Date(Date.now() - 86400000 * 7).toISOString(), alerts: 1 },
            { id: 'quinoaCoopPeru', name: 'Quinoa Co-op Peru', farmLocation: 'Andes, Peru', lastConsultation: new Date(Date.now() - 86400000 * 14).toISOString(), alerts: 0 },
        ];
        const pendingConsultationRequests = [
            { id: 'req1', farmerId: 'sunnyAcresFarm', farmerName: 'Sunny Acres Farm', issueSummary: 'Yellowing leaves on tomato plants.', requestDate: new Date().toISOString() }
        ];

        return {
            assignedFarmersOverview,
            pendingConsultationRequests,
            knowledgeHubContributions,
        };
    } catch (error) {
        console.error("Error fetching agronomist dashboard data:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch dashboard data.");
    }
  }
);


export const getAgroTourismDashboardData = functions.https.onCall(
  async (data, context): Promise<AgroTourismDashboardData> => {
    const operatorId = checkAuth(context);
    try {
        // --- Fetch Live Data for Listed Experiences ---
        const experiencesSnapshot = await db.collection('marketplaceItems')
            .where('sellerId', '==', operatorId)
            .where('category', '==', 'agri-tourism-services')
            .orderBy('createdAt', 'desc')
            .get();

        const listedExperiences = experiencesSnapshot.docs.map(doc => {
            const item = doc.data();
            return {
                id: doc.id,
                title: item.name,
                location: item.location,
                status: 'Published' as 'Published' | 'Draft', // Assuming all listed items are published for now
                bookingsCount: item.bookingsCount || 0, // A field we can increment
                actionLink: `/marketplace/${doc.id}/manage-service`
            };
        });

        // --- Keep Mock Data for other sections for now ---
        const upcomingBookings = [
            { id: 'book1', experienceTitle: 'Coffee Farm Tour & Tasting', guestName: 'Alice Johnson', date: new Date().toISOString(), actionLink: '#' }
        ];
        const guestReviews = [
            { id: 'rev1', guestName: 'Bob Williams', experienceTitle: 'Coffee Farm Tour & Tasting', rating: 5, comment: 'Amazing experience, learned so much!', actionLink: '#' }
        ];

        return {
            listedExperiences,
            upcomingBookings,
            guestReviews,
        };

    } catch (error) {
        console.error("Error fetching Agro-Tourism dashboard data:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch dashboard data.");
    }
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

export const getOperationsDashboardData = functions.https.onCall(
  (data, context): OperationsDashboardData => {
    checkAuth(context);
    // In a real app, this data would be pulled from system monitoring tools and data analysis queries.
    return {
      vtiGenerationRate: {
        rate: 150,
        unit: 'VTIs/hour',
        trend: 5,
      },
      dataPipelineStatus: {
        status: 'Operational',
        lastChecked: new Date().toISOString(),
      },
      flaggedEvents: [
        { id: 'flag1', type: 'Unusual Time Lag', description: 'Harvest to Transport delay > 48h for perishable goods.', vtiLink: '#' },
        { id: 'flag2', type: 'Anomalous Geolocation', description: 'Processing event logged 500km from previous event location.', vtiLink: '#' },
      ],
    };
  }
);

export const getAgriTechInnovatorDashboardData = functions.https.onCall(
  (data, context): AgriTechInnovatorDashboardData => {
    checkAuth(context);
    // In a real app, this data would be pulled from a secure datastore.
    return {
      apiKeys: [
        { id: 'key1', key: 'sk_test_..._xyz1', status: 'Active', environment: 'Sandbox', createdAt: new Date(Date.now() - 86400000 * 30).toISOString() },
        { id: 'key2', key: 'sk_prod_..._abc2', status: 'Active', environment: 'Production', createdAt: new Date(Date.now() - 86400000 * 90).toISOString() },
        { id: 'key3', key: 'sk_test_..._pqr3', status: 'Revoked', environment: 'Sandbox', createdAt: new Date(Date.now() - 86400000 * 120).toISOString() },
      ],
      sandboxStatus: {
        status: 'Operational',
        lastReset: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      integrationProjects: [
        { id: 'proj1', title: 'Real-time Cold Chain Monitoring with CoolTech', status: 'Live', partner: 'CoolTech Solutions', actionLink: '#' },
        { id: 'proj2', title: 'Drone-based Crop Scouting API Integration', status: 'In Development', partner: 'SkyAgroScout', actionLink: '#' },
      ],
    };
  }
);
