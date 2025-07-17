

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {
    AdminDashboardDataSchema,
    AdminActivitySchema,
    FarmerDashboardDataSchema,
    CooperativeDashboardDataSchema,
    BuyerDashboardDataSchema,
    RegulatorDashboardDataSchema,
    LogisticsDashboardDataSchema,
    FiDashboardDataSchema,
    FieldAgentDashboardDataSchema,
    InputSupplierDashboardDataSchema,
    AgroExportDashboardDataSchema,
    ProcessingUnitDashboardDataSchema,
    WarehouseDashboardDataSchema,
    QaDashboardDataSchema,
    CertificationBodyDashboardDataSchema,
    ResearcherDashboardDataSchema,
    AgronomistDashboardDataSchema,
    AgroTourismDashboardDataSchema,
    InsuranceProviderDashboardDataSchema,
    EnergyProviderDashboardDataSchema,
    CrowdfunderDashboardDataSchema,
    EquipmentSupplierDashboardDataSchema,
    WasteManagementDashboardDataSchema,
    PackagingSupplierDashboardDataSchema,
    AgriTechInnovatorDashboardDataSchema,
    OperationsDashboardDataSchema
} from "@/lib/schemas";
import type { 
    AdminDashboardData,
    AdminActivity,
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
    FinancialProduct,
    KnfBatch
} from "@/lib/types";

const db = admin.firestore();

// Helper to check for authentication in a consistent way
const checkAuth = (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "error.unauthenticated",
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
            if (batch.status === 'Fermenting' && batch.nextStepDate && batch.nextStepDate.toDate() <= now) {
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

        const activeKnfBatches: KnfBatch[] = knfBatchesSnapshot.docs
            .filter(doc => ['Fermenting', 'Ready'].includes(doc.data().status))
            .slice(0, 5)
            .map(doc => {
                const batchData = doc.data();
                return {
                    id: doc.id,
                    userId: batchData.userId,
                    type: batchData.type,
                    typeName: batchData.typeName,
                    ingredients: batchData.ingredients,
                    startDate: (batchData.startDate as admin.firestore.Timestamp)?.toDate?.().toISOString(),
                    nextStepDate: (batchData.nextStepDate as admin.firestore.Timestamp)?.toDate?.().toISOString(),
                    status: batchData.status,
                    nextStep: batchData.nextStep,
                    quantityProduced: batchData.quantityProduced,
                    unit: batchData.unit,
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


        const result: FarmerDashboardData = {
            farmCount: farmsSnapshot.size,
            cropCount: cropsSnapshot.size,
            recentCrops: recentCrops, 
            knfBatches: activeKnfBatches,
            financialSummary: financialSummary,
            alerts: alerts,
            certifications: certifications,
        };

        // Validate the final data structure before returning
        return FarmerDashboardDataSchema.parse(result);

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
        const inventorySnapshot = await db.collection('marketplaceItems')
            .where('sellerId', '==', supplierId)
            .where('category', '==', 'packaging-solutions')
            .get();

        const inventory = inventorySnapshot.docs.map(doc => {
            const item = doc.data();
            return {
                id: doc.id,
                item: item.name,
                stock: item.stock || 0, 
                reorderLevel: item.reorderLevel || 100,
            };
        });
        
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
                actionLink: `/marketplace/my-orders/${doc.id}`,
            };
        });
        
        const result: PackagingSupplierDashboardData = { incomingOrders, inventory };
        return PackagingSupplierDashboardDataSchema.parse(result);

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
        const applicationsSnapshot = await db.collection('financial_applications')
            .where('fiId', '==', fiId)
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
        
        const loansSnapshot = await db.collection('financial_applications')
            .where('fiId', '==', fiId)
            .where('status', '==', 'Approved')
            .get();

        const portfolioOverview = {
            loanCount: loansSnapshot.size,
            totalValue: loansSnapshot.docs.reduce((sum, doc) => sum + doc.data().amount, 0),
        };
        
        const productsSnapshot = await db.collection('financial_products')
            .where('fiId', '==', fiId)
            .get();

        const financialProducts = productsSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()})) as FinancialProduct[];

        const result: FiDashboardData = {
            pendingApplications,
            portfolioOverview,
            financialProducts,
        };
        return FiDashboardDataSchema.parse(result);
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
        const coopDoc = await db.collection('users').doc(cooperativeId).get();
        if (!coopDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Cooperative profile not found.');
        }

        const coopData = coopDoc.data();
        const groupId = coopData?.profileData?.groupId;
        let memberCount = 0;
        let memberIds: string[] = [];

        if (groupId) {
             const groupDoc = await db.collection('groups').doc(groupId).get();
             if (groupDoc.exists) {
                 memberCount = groupDoc.data()?.memberCount || 0;
                 const membersSnapshot = await db.collection(`groups/${groupId}/members`).get();
                 memberIds = membersSnapshot.docs.map(doc => doc.id);
             }
        }
        
        let totalLandArea = 0;
        let aggregatedProduce: CooperativeDashboardData['aggregatedProduce'] = [];
        
        if (memberIds.length > 0) {
            const memberChunks: string[][] = [];
            for (let i = 0; i < memberIds.length; i += 30) {
                memberChunks.push(memberIds.slice(i, i + 30));
            }
            
            const farmPromises = memberChunks.map(chunk => 
                db.collection('farms').where('ownerId', 'in', chunk).get()
            );

            const cropPromises = memberChunks.map(chunk =>
                db.collection('crops')
                  .where('ownerId', 'in', chunk)
                  .where('currentStage', 'in', ['Harvesting', 'Post-Harvest'])
                  .orderBy('harvestDate', 'desc')
                  .limit(10) // Limit per chunk for performance
                  .get()
            );

            const farmSnapshots = await Promise.all(farmPromises);
            farmSnapshots.forEach(snapshot => {
                snapshot.forEach(doc => {
                    const sizeString = doc.data().size || '0';
                    const sizeValue = parseFloat(sizeString.split(' ')[0]) || 0;
                    totalLandArea += sizeValue;
                });
            });

            const cropSnapshots = await Promise.all(cropPromises);
            cropSnapshots.forEach(snapshot => {
                snapshot.forEach(doc => {
                    const cropData = doc.data();
                    aggregatedProduce.push({
                        id: doc.id,
                        productName: cropData.cropType || 'Unknown Produce',
                        quantity: parseFloat(cropData.expectedYield?.split(' ')[0] || '0'), 
                        quality: 'Grade A', // Placeholder as it's not on the crop model
                        readyBy: (cropData.harvestDate as admin.firestore.Timestamp)?.toDate?.().toISOString() || new Date().toISOString(),
                    });
                });
            });
            // Sort and limit final aggregated produce
            aggregatedProduce.sort((a, b) => new Date(b.readyBy).getTime() - new Date(a.readyBy).getTime()).slice(0, 10);
        }

        const pendingMemberApplications = 3; // This remains mocked

        const result: CooperativeDashboardData = {
            memberCount,
            totalLandArea,
            aggregatedProduce,
            pendingMemberApplications,
            groupId: groupId || null,
        };
        return CooperativeDashboardDataSchema.parse(result);

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
        const recommendationsSnapshot = await db.collection('marketplaceItems')
            .where('listingType', '==', 'Product')
            .where('isSustainable', '==', true) 
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
                reliability: 85 + Math.floor(Math.random() * 15),
                vtiVerified: !!item.relatedTraceabilityId,
            };
        });

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
            action: { label: 'Secure Forward Contracts', link: '/marketplace?category=fresh-produce-fruits' }
        };

        const result: BuyerDashboardData = {
            supplyChainRisk,
            sourcingRecommendations,
            marketPriceIntelligence
        };
        return BuyerDashboardDataSchema.parse(result);

    } catch (error) {
        console.error("Error fetching buyer dashboard data:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch dashboard data for buyer.");
    }
  }
);


export const getRegulatorDashboardData = functions.https.onCall(
  async (data, context): Promise<RegulatorDashboardData> => {
    checkAuth(context);

    try {
        const anomaliesPromise = db.collection('traceability_events')
            .where('payload.isAnomaly', '==', true)
            .limit(5)
            .get();

        const [anomaliesSnapshot] = await Promise.all([anomaliesPromise]);
        
        const supplyChainAnomalies = anomaliesSnapshot.docs.map(doc => {
            const event = doc.data();
            return {
                 id: doc.id, 
                 description: event.payload.anomalyDescription || 'Unusual supply chain activity detected.', 
                 level: 'Warning' as 'Critical' | 'Warning', 
                 vtiLink: `/traceability/batches/${event.vtiId}` 
            }
        });

        const result: RegulatorDashboardData = {
            complianceRiskAlerts: [
                { id: 'alert1', issue: 'Unverified organic inputs detected in VTI log', region: 'Rift Valley', severity: 'High', actionLink: '#' },
            ],
            pendingCertifications: { count: 12, actionLink: '#' },
            supplyChainAnomalies,
        };
        return RegulatorDashboardDataSchema.parse(result);
    } catch (error) {
        console.error("Error fetching regulator dashboard data:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch dashboard data.");
    }
  }
);


export const getLogisticsDashboardData = functions.https.onCall(
  async (data, context): Promise<LogisticsDashboardData> => {
    const logisticsProviderId = checkAuth(context);
    
    try {
        const shipmentsSnapshot = await db.collection('marketplace_orders')
            .where('status', '==', 'shipped')
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

        const result: LogisticsDashboardData = {
            activeShipments,
            incomingJobs,
            performanceMetrics,
        };
        return LogisticsDashboardDataSchema.parse(result);
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
        const assignedFarmerIds = agentData?.profileData?.assignedFarmers || [];
        
        let assignedFarmers: FieldAgentDashboardData['assignedFarmers'] = [];

        if (assignedFarmerIds.length > 0) {
            const farmersSnapshot = await db.collection('users').where(admin.firestore.FieldPath.documentId(), 'in', assignedFarmerIds.slice(0, 30)).get();
            
            assignedFarmers = farmersSnapshot.docs.map(doc => {
                const farmerData = doc.data();
                return {
                    id: doc.id,
                    name: farmerData.displayName || 'Unknown Farmer',
                    lastVisit: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
                    issues: Math.floor(Math.random() * 3),
                    actionLink: `/profiles/${doc.id}`
                };
            });
        }
        
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

        const result: FieldAgentDashboardData = {
            assignedFarmers,
            portfolioHealth,
            pendingReports,
            dataVerificationTasks
        };
        return FieldAgentDashboardDataSchema.parse(result);
        
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
      const ordersSnapshot = await db.collection('marketplace_orders')
        .where('sellerId', '==', supplierId)
        .get();

      const ordersData = ordersSnapshot.docs.map(doc => doc.data());
      const totalValue = ordersData.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

      const activeOrders = {
        count: ordersSnapshot.size,
        value: totalValue,
        link: '/marketplace/my-orders'
      };

      const demandForecast = [
        { id: 'df1', region: 'Rift Valley', product: 'DAP Fertilizer', trend: 'High' as const, reason: 'Planting season approaching' }
      ];
      const productPerformance = [
        { id: 'pp1', productName: 'Eco-Fertilizer Plus', rating: 4.5, feedback: 'Great results on maize crops.', link: '#' }
      ];

      const result: InputSupplierDashboardData = {
        demandForecast,
        productPerformance,
        activeOrders,
      };
      return InputSupplierDashboardDataSchema.parse(result);

    } catch (error) {
        console.error("Error fetching Input Supplier dashboard data:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch dashboard data.");
    }
  }
);

export const getAgroExportDashboardData = functions.https.onCall(
  async (data, context): Promise<AgroExportDashboardData> => {
    checkAuth(context);
     try {
        const vtisForExportPromise = db.collection('vti_registry')
            .where('metadata.forExport', '==', true)
            .limit(5)
            .get();

        const [vtisSnapshot] = await Promise.all([vtisForExportPromise]);

        const pendingCustomsDocs = vtisSnapshot.docs.map(doc => ({
            id: doc.id,
            vtiLink: `/traceability/batches/${doc.id}`,
            destination: doc.data().metadata.destinationCountry || 'Unknown',
            status: 'Awaiting Phytosanitary Certificate' // Mock status
        }));
        
        const result: AgroExportDashboardData = {
            pendingCustomsDocs,
            trackedShipments: [
                { id: 'ship1', status: 'In Transit', location: 'Indian Ocean', carrier: 'Maersk' }
            ],
            complianceAlerts: [
                { id: 'ca1', content: 'New packaging regulations for EU effective Aug 1.', actionLink: '#' }
            ]
        };
        return AgroExportDashboardDataSchema.parse(result);
     } catch (error) {
        console.error("Error fetching agro-export dashboard data:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch dashboard data.");
    }
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
                id: doc.id,
                packagingType: item.name,
                unitsInStock: item.stock || 0,
                reorderLevel: item.reorderLevel || 100,
            };
        });

        const yieldOptimization = { currentYield: 88, potentialYield: 92, suggestion: 'Adjust blade speed for softer fruits.' };
        const inventory = [ { product: 'Mango Pulp', quality: 'Grade A', tons: 15 }, { product: 'Pineapple Rings', quality: 'Grade A', tons: 10 } ];
        const wasteReduction = { currentRate: 12, insight: 'High waste detected from peeling station.' };

        const result: ProcessingUnitDashboardData = {
            yieldOptimization,
            inventory,
            wasteReduction,
            packagingOrders,
            packagingInventory,
        };
        return ProcessingUnitDashboardDataSchema.parse(result);
    } catch (error) {
        console.error("Error fetching Processing Unit dashboard data:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch dashboard data.");
    }
  }
);


export const getWarehouseDashboardData = functions.https.onCall(
  async (data, context): Promise<WarehouseDashboardData> => {
    checkAuth(context);
    try {
        const inventoryQuery = db.collection('marketplaceItems').select('stock', 'reorderLevel');
        const totalItemsCount = await db.collection('marketplaceItems').count().get();
        const inventorySnapshot = await inventoryQuery.get();

        const itemsNeedingAttention = inventorySnapshot.docs.filter(doc => (doc.data().stock || 0) < (doc.data().reorderLevel || 20)).length;

        const inventoryLevels = {
            totalItems: totalItemsCount.data().count,
            itemsNeedingAttention: itemsNeedingAttention,
        };

        const storageOptimization = { 
            utilization: 78, 
            suggestion: 'Consolidate pallets in Zone C.' 
        };
        
        const predictiveAlerts = [
            { alert: 'High humidity detected in Cold Storage 2. Risk of mold.', actionLink: '#' }
        ];

        const result: WarehouseDashboardData = {
            storageOptimization,
            inventoryLevels,
            predictiveAlerts
        };
        return WarehouseDashboardDataSchema.parse(result);
    } catch (error) {
        console.error("Error fetching Warehouse dashboard data:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch dashboard data.");
    }
  }
);


export const getQaDashboardData = functions.https.onCall(
  (data, context): QaDashboardData => {
    checkAuth(context);
    const result: QaDashboardData = {
        pendingInspections: [
            { id: 'insp1', batchId: 'vti-xyz-123', productName: 'Avocado Batch', sellerName: 'Green Valley Farms', dueDate: new Date().toISOString(), actionLink: '#'}
        ],
        recentResults: [
            { id: 'res1', productName: 'Maize Batch', result: 'Fail', reason: 'Aflatoxin levels exceed limit.', inspectedAt: new Date().toISOString() }
        ],
        qualityMetrics: { passRate: 98, averageScore: 9.2 }
    };
    return QaDashboardDataSchema.parse(result);
  }
);


export const getCertificationBodyDashboardData = functions.https.onCall(
  async (data, context): Promise<CertificationBodyDashboardData> => {
    checkAuth(context);
     const result: CertificationBodyDashboardData = {
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
    return CertificationBodyDashboardDataSchema.parse(result);
  }
);

export const getResearcherDashboardData = functions.https.onCall(
    async (data, context): Promise<ResearcherDashboardData> => {
      const userId = checkAuth(context);
      try {
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
                  status: article.status || 'Draft'
              };
          });

          const availableDatasets = [
              { id: 'set1', name: 'Rift Valley Maize Yields (2020-2023)', dataType: 'CSV', accessLevel: 'Requires Request' as const, actionLink: '#' },
              { id: 'set2', name: 'Regional Soil Health Data (Anonymized)', dataType: 'JSON', accessLevel: 'Public' as const, actionLink: '#' },
          ];
          
          const ongoingProjects = [
              { id: 'proj1', title: 'Impact of KNF on Soil Health in Smallholder Farms', progress: 65, collaborators: ['University of Nairobi'], actionLink: '#' },
              { id: 'proj2', title: 'AI-driven Pest Identification Accuracy Study', progress: 30, collaborators: ['DamDoh AI Team'], actionLink: '#' }
          ];

          const result: ResearcherDashboardData = {
              availableDatasets,
              ongoingProjects,
              knowledgeHubContributions,
          };
          return ResearcherDashboardDataSchema.parse(result);

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
                status: article.status || 'Draft',
            };
        });

        const assignedFarmersOverview = [
            { id: 'farmer1', name: 'John Doe', farmLocation: 'Nakuru', lastConsultation: new Date(Date.now() - 86400000 * 7).toISOString(), alerts: 1 }
        ];
        const pendingConsultationRequests = [
            { id: 'req1', farmerName: 'Jane Smith', issueSummary: 'Yellowing leaves on tomato plants.', requestDate: new Date().toISOString(), farmerId: 'farmer1' }
        ];
        
        const result: AgronomistDashboardData = {
            assignedFarmersOverview,
            pendingConsultationRequests,
            knowledgeHubContributions,
        };
        return AgronomistDashboardDataSchema.parse(result);
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
                location: item.location.address,
                status: 'Published' as 'Published' | 'Draft',
                bookingsCount: item.bookingsCount || 0, 
                actionLink: `/marketplace/${item.id}/manage-service`
            };
        });

        const upcomingBookings = [
            { id: 'book1', experienceTitle: 'Coffee Farm Tour & Tasting', guestName: 'Alice Johnson', date: new Date().toISOString(), actionLink: '#' }
        ];
        const guestReviews = [
            { id: 'rev1', guestName: 'Bob Williams', experienceTitle: 'Coffee Farm Tour & Tasting', rating: 5, comment: 'Amazing experience, learned so much!', actionLink: '#' }
        ];

        const result: AgroTourismDashboardData = {
            listedExperiences,
            upcomingBookings,
            guestReviews,
        };
        return AgroTourismDashboardDataSchema.parse(result);
    } catch (error) {
        console.error("Error fetching Agro-Tourism dashboard data:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch dashboard data.");
    }
  }
);

export const getInsuranceProviderDashboardData = functions.https.onCall(
  async (data, context): Promise<InsuranceProviderDashboardData> => {
    checkAuth(context);

    try {
        const claimsSnapshot = await db.collection('insurance_applications')
            .where('status', 'in', ['Submitted', 'Under Review'])
            .limit(10)
            .get();
        
        const pendingClaims = claimsSnapshot.docs.map(doc => {
            const claim = doc.data();
            return {
                id: doc.id,
                policyHolderName: claim.applicantName || 'Unknown Farmer',
                policyType: 'Crop' as const,
                claimDate: (claim.submittedAt as admin.firestore.Timestamp).toDate().toISOString(),
                status: claim.status,
                actionLink: '#'
            }
        });
        
        const result: InsuranceProviderDashboardData = {
            pendingClaims,
            riskAssessmentAlerts: [
                { id: 'risk1', policyHolderName: 'Sunset Farms', alert: 'High flood risk predicted for next month.', severity: 'High', actionLink: '#' }
            ],
            activePolicies: [
                { id: 'pol1', policyHolderName: 'Green Valley Farms', policyType: 'Multi-peril Crop', coverageAmount: 50000, expiryDate: new Date().toISOString() }
            ]
        };
        return InsuranceProviderDashboardDataSchema.parse(result);
    } catch (error) {
        console.error("Error fetching insurance provider dashboard data:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch dashboard data.");
    }
  }
);

export const getEnergyProviderDashboardData = functions.https.onCall(
  (data, context): EnergyProviderDashboardData => {
    checkAuth(context);
    const result: EnergyProviderDashboardData = {
        projectLeads: [
            { id: 'lead1', entityName: 'Rift Valley Growers Co-op', location: 'Naivasha', estimatedEnergyNeed: '150kW Solar for Irrigation', status: 'Proposal Sent', actionLink: '#' }
        ],
        activeProjects: [
            { id: 'proj1', projectName: 'Greenhouse Solar Installation', solutionType: 'Solar PV', status: 'In Progress', completionDate: new Date().toISOString() }
        ],
        impactMetrics: { totalInstallations: 45, totalEstimatedCarbonReduction: '1,200 tCO2e/year' }
    };
    return EnergyProviderDashboardDataSchema.parse(result);
  }
);


export const getCrowdfunderDashboardData = functions.https.onCall(
  (data, context): CrowdfunderDashboardData => {
    checkAuth(context);
    const result: CrowdfunderDashboardData = {
        portfolioOverview: { totalInvested: 75000, numberOfInvestments: 8, estimatedReturns: 95000 },
        suggestedOpportunities: [
            { id: 'opp1', projectName: 'Women-Led Shea Butter Processing Unit', category: 'Value Addition', fundingGoal: 50000, amountRaised: 35000, actionLink: '#' }
        ],
        recentTransactions: [
            { id: 'tx1', projectName: 'Rift Valley Growers Co-op', type: 'Investment', amount: 5000, date: new Date().toISOString() }
        ]
    };
    return CrowdfunderDashboardDataSchema.parse(result);
  }
);

export const getEquipmentSupplierDashboardData = functions.https.onCall(
  async (data, context): Promise<EquipmentSupplierDashboardData> => {
    const supplierId = checkAuth(context);
    try {
        const equipmentSnapshot = await db.collection('marketplaceItems')
            .where('sellerId', '==', supplierId)
            .where('category', 'in', ['heavy-machinery-sale', 'equipment-rental-operation', 'farm-tools-small-equip'])
            .get();

        const listedEquipment = equipmentSnapshot.docs.map(doc => {
            const item = doc.data();
            return {
                id: doc.id,
                name: item.name,
                type: item.category === 'heavy-machinery-sale' ? 'Sale' : 'Rental',
                status: item.availabilityStatus || 'Available',
                actionLink: `/marketplace/${doc.id}`,
            };
        });

        const rentalOrdersSnapshot = await db.collection('marketplace_orders')
            .where('sellerId', '==', supplierId)
            .get();
        
        const rentalActivity = {
            totalRentals: rentalOrdersSnapshot.size,
        };

        const pendingMaintenanceRequests: any[] = [];
        
        const result: EquipmentSupplierDashboardData = {
            listedEquipment,
            rentalActivity,
            pendingMaintenanceRequests,
        };
        return EquipmentSupplierDashboardDataSchema.parse(result);
    } catch (error) {
        console.error("Error fetching equipment supplier dashboard data:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch dashboard data.");
    }
  }
);

export const getWasteManagementDashboardData = functions.https.onCall(
  (data, context): WasteManagementDashboardData => {
    checkAuth(context);
    const result: WasteManagementDashboardData = {
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
    return WasteManagementDashboardDataSchema.parse(result);
  }
);

export const getAgriTechInnovatorDashboardData = functions.https.onCall(
  async (data, context): Promise<AgriTechInnovatorDashboardData> => {
    const innovatorId = checkAuth(context);
    
    const keysSnapshot = await db.collection('users').doc(innovatorId).collection('api_keys')
        .orderBy('createdAt', 'desc')
        .get();

    const apiKeys = keysSnapshot.docs.map(doc => {
        const keyData = doc.data();
        return {
            id: doc.id,
            description: keyData.description,
            environment: keyData.environment,
            status: keyData.status,
            keyPrefix: keyData.keyPrefix, 
            createdAt: (keyData.createdAt as admin.firestore.Timestamp).toDate().toISOString(),
            key: `${keyData.keyPrefix}...${keyData.lastFour}` 
        }
    });

    const result: AgriTechInnovatorDashboardData = {
      apiKeys: apiKeys,
      sandboxStatus: {
        status: 'Operational',
        lastReset: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      integrationProjects: [
        { id: 'proj1', title: 'Real-time Cold Chain Monitoring with CoolTech', status: 'Live', partner: 'CoolTech Solutions', actionLink: '#' },
        { id: 'proj2', title: 'Drone-based Crop Scouting API Integration', status: 'In Development', partner: 'SkyAgroScout', actionLink: '#' },
      ],
    };
    return AgriTechInnovatorDashboardDataSchema.parse(result);
  }
);


export const getAdminDashboardData = functions.https.onCall(async (data, context): Promise<AdminDashboardData> => {
    checkAuth(context);
    
    try {
        const usersPromise = db.collection('users').get();
        const farmsPromise = db.collection('farms').get();
        const listingsPromise = db.collection('marketplaceItems').get();
        const pendingApprovalsPromise = db.collection('marketplaceItems').where('status', '==', 'pending_approval').get();

        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const newUsersQuery = db.collection('users').where('createdAt', '>=', sevenDaysAgo).get();

        const [usersSnap, farmsSnap, listingsSnap, newUsersSnap, pendingApprovalsSnap] = await Promise.all([
            usersPromise,
            farmsPromise,
            listingsPromise,
            newUsersQuery,
            pendingApprovalsPromise,
        ]);

        const result: AdminDashboardData = {
            totalUsers: usersSnap.size,
            totalFarms: farmsSnap.size,
            totalListings: listingsSnap.size,
            pendingApprovals: pendingApprovalsSnap.size,
            newUsersLastWeek: newUsersSnap.size,
        };
        return AdminDashboardDataSchema.parse(result);
    } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch admin dashboard data.");
    }
});


export const getAdminRecentActivity = functions.https.onCall(async (data, context): Promise<{ activity: AdminActivity[] }> => {
    checkAuth(context);
    try {
        const newUsersPromise = db.collection('users').orderBy('createdAt', 'desc').limit(5).get();
        const newListingsPromise = db.collection('marketplaceItems').orderBy('createdAt', 'desc').limit(5).get();

        const [usersSnap, listingsSnap] = await Promise.all([newUsersPromise, newListingsPromise]);
        
        let activities: AdminActivity[] = [];
        const toISODate = (timestamp: admin.firestore.Timestamp | undefined) => {
            return timestamp && timestamp.toDate ? timestamp.toDate().toISOString() : new Date().toISOString();
        };

        usersSnap.forEach(doc => {
            const user = doc.data();
            activities.push({
                id: doc.id,
                type: 'New User',
                primaryInfo: user.displayName,
                secondaryInfo: user.primaryRole,
                timestamp: toISODate(user.createdAt),
                link: `/profiles/${doc.id}`,
                avatarUrl: user.avatarUrl,
            });
        });

        listingsSnap.forEach(doc => {
            const listing = doc.data();
            activities.push({
                id: doc.id,
                type: 'New Listing',
                primaryInfo: listing.name,
                secondaryInfo: listing.category,
                timestamp: toISODate(listing.createdAt),
                link: `/marketplace/${doc.id}`,
                avatarUrl: listing.imageUrl,
            });
        });
        
        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        activities = activities.slice(0,10);
        activities.forEach(activity => AdminActivitySchema.parse(activity));

        return { activity: activities };
    } catch (error) {
         console.error("Error fetching admin recent activity:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch recent activity.");
    }
});
