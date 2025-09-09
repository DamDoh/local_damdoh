

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
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
    KnfBatch,
    UserProfile
} from "@/lib/types";
import { checkAuth } from "./utils";

const db = admin.firestore();

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
                actionLink: `/marketplace/my-sales#${doc.id}`,
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
        
        // Live data for portfolio
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


        return {
            pendingApplications,
            portfolioOverview,
            financialProducts,
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
        const coopDoc = await db.collection('users').doc(cooperativeId).get();
        if (!coopDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Cooperative profile not found.');
        }

        const coopData = coopDoc.data();
        const groupId = coopData?.profileData?.groupId;
        let memberCount = 0;
        let memberIds: string[] = [];
        let pendingMemberApplications = 0;

        if (groupId) {
             const groupRef = db.collection('groups').doc(groupId);
             const groupDoc = await groupRef.get();
             if (groupDoc.exists) {
                 memberCount = groupDoc.data()?.memberCount || 0;
                 const membersSnapshot = await groupRef.collection('members').get();
                 memberIds = membersSnapshot.docs.map(doc => doc.id);
                 
                 // Fetch pending join requests
                 const requestsSnapshot = await groupRef.collection('join_requests').where('status', '==', 'pending').get();
                 pendingMemberApplications = requestsSnapshot.size;
             }
        }
        
        let totalLandArea = 0;
        let aggregatedProduce: CooperativeDashboardData['aggregatedProduce'] = [];
        
        if (memberIds.length > 0) {
            // Firestore 'in' query is limited to 30 items per query.
            // Chunk the memberIds array to handle more than 30 members.
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
            const produceMap = new Map<string, CooperativeDashboardData['aggregatedProduce'][0]>();

            cropSnapshots.forEach(snapshot => {
                snapshot.forEach(doc => {
                    const cropData = doc.data();
                    const produceItem = {
                        id: doc.id,
                        productName: cropData.cropType || 'Unknown Produce',
                        quantity: parseFloat(cropData.expectedYield?.split(' ')[0] || '0'), 
                        quality: 'Grade A', // Placeholder
                        readyBy: (cropData.harvestDate as admin.firestore.Timestamp)?.toDate?.().toISOString() || new Date().toISOString(),
                    };
                    produceMap.set(doc.id, produceItem);
                });
            });

            aggregatedProduce = Array.from(produceMap.values())
                                     .sort((a, b) => new Date(b.readyBy).getTime() - new Date(a.readyBy).getTime())
                                     .slice(0, 10);
        }

        return {
            memberCount,
            totalLandArea,
            aggregatedProduce,
            pendingMemberApplications,
            groupId: groupId || null,
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

        return {
            // These remain mocked as their data sources are complex
            complianceRiskAlerts: [
                { id: 'alert1', issue: 'Unverified organic inputs detected in VTI log', region: 'Rift Valley', severity: 'High', actionLink: '#' },
            ],
            pendingCertifications: { count: 12, actionLink: '#' },
            supplyChainAnomalies,
        };
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
                to: order.buyerLocation?.address || 'Unknown Destination', 
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
                sellerProfiles[doc.id] = { location: doc.data().location?.address || 'Unknown Origin' };
            });
        }

        const incomingJobs = jobsSnapshot.docs.map(doc => {
            const order = doc.data();
            return {
                id: doc.id,
                from: sellerProfiles[order.sellerId]?.location || 'Unknown Origin',
                to: order.buyerLocation?.address || 'Unknown Destination',
                product: `${order.listingName} (${order.quantity} units)`,
                requirements: 'Standard Transport',
                actionLink: `/marketplace/my-sales#${order.id}`
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
        const assignedFarmerIds: string[] = agentData?.profileData?.assignedFarmers || [];
        
        let assignedFarmers: FieldAgentDashboardData['assignedFarmers'] = [];

        if (assignedFarmerIds.length > 0) {
            // Firestore 'in' query is limited to 30 items per query.
            // For a production app, this would need chunking if an agent has > 30 farmers.
            const farmersSnapshot = await db.collection('users').where(admin.firestore.FieldPath.documentId(), 'in', assignedFarmerIds.slice(0, 30)).get();
            
            assignedFarmers = farmersSnapshot.docs.map(doc => {
                const farmerData = doc.data() as UserProfile;
                // Mocking lastVisit and issues for now
                return {
                    id: doc.id,
                    name: farmerData.displayName || 'Unknown Farmer',
                    lastVisit: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
                    issues: Math.floor(Math.random() * 3), // Random number of issues
                    actionLink: `/profiles/${doc.id}`,
                    avatarUrl: farmerData.avatarUrl || null,
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
        link: '/marketplace/my-sales'
      };

      // 2. Keep other sections as mock data for now
      const demandForecast = [
        { id: 'df1', region: 'Rift Valley', product: 'DAP Fertilizer', trend: 'High' as 'High' | 'Steady' | 'Low', reason: 'Planting season approaching' }
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
  async (data, context): Promise<AgroExportDashboardData> => {
    checkAuth(context);
     try {
        const vtisForExportPromise = db.collection('vti_registry')
            .where('metadata.forExport', '==', true)
            // Ideally, we'd have a `documentationStatus` field to query
            .limit(5)
            .get();

        const [vtisSnapshot] = await Promise.all([vtisForExportPromise]);

        const pendingCustomsDocs = vtisSnapshot.docs.map(doc => ({
            id: doc.id,
            vtiLink: `/traceability/batches/${doc.id}`,
            destination: doc.data().metadata.destinationCountry || 'Unknown',
            status: 'Awaiting Phytosanitary Certificate' // Mock status
        }));

        return {
            pendingCustomsDocs,
            // These remain mocked
            trackedShipments: [
                { id: 'ship1', status: 'In Transit', location: 'Indian Ocean', carrier: 'Maersk' }
            ],
            complianceAlerts: [
                { id: 'ca1', content: 'New packaging regulations for EU effective Aug 1.', actionLink: '#' }
            ]
        };
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
        // 1. Fetch incoming raw material orders (where the unit is the buyer)
        const rawMaterialOrdersPromise = db.collection('marketplace_orders')
            .where('buyerId', '==', unitId)
            .orderBy('createdAt', 'desc')
            .limit(5)
            .get();
            
        // 2. Fetch listed finished goods (where the unit is the seller)
        const finishedGoodsPromise = db.collection('marketplaceItems')
            .where('sellerId', '==', unitId)
            .orderBy('createdAt', 'desc')
            .limit(5)
            .get();

        const [ordersSnapshot, inventorySnapshot] = await Promise.all([
            rawMaterialOrdersPromise,
            finishedGoodsPromise,
        ]);
        
        const sellerIds = [...new Set(ordersSnapshot.docs.map(doc => doc.data().sellerId))];
        const sellerProfiles: Record<string, string> = {};
        if (sellerIds.length > 0) {
            const sellerDocs = await db.collection('users').where(admin.firestore.FieldPath.documentId(), 'in', sellerIds).get();
            sellerDocs.forEach(doc => {
                sellerProfiles[doc.id] = doc.data().displayName || 'Unknown Supplier';
            });
        }
        
        // This represents incoming raw materials, so we rename it
        const incomingRawMaterials = ordersSnapshot.docs.map(doc => {
            const order = doc.data();
            return {
                id: doc.id,
                supplierName: sellerProfiles[order.sellerId] || 'Unknown Supplier',
                productName: order.listingName,
                deliveryDate: order.expectedDeliveryDate?.toDate().toISOString() || new Date(Date.now() + 86400000 * 5).toISOString(),
                status: order.status,
                actionLink: `/marketplace/my-purchases#${order.id}`,
            };
        });
        
        // This represents inventory of finished goods for sale
        const finishedGoodsInventory = inventorySnapshot.docs.map(doc => {
            const item = doc.data();
            return {
                product: item.name,
                quality: 'N/A', // Placeholder as it's not on the model
                tons: item.stock || 0, // Assuming stock is in tons
            };
        });

        // --- MOCK DATA for complex analytics ---
        const yieldOptimization = { currentYield: 88, potentialYield: 92, suggestion: 'Adjust blade speed for softer fruits.' };
        const wasteReduction = { currentRate: 12, insight: 'High waste detected from peeling station.' };

        return {
            yieldOptimization,
            inventory: finishedGoodsInventory, // Renamed for clarity
            wasteReduction,
            packagingOrders: incomingRawMaterials, // Renamed for clarity
            packagingInventory: [], // Assuming this is about materials they BUY, which is handled by incomingRawMaterials.
        };
    } catch (error) {
        console.error("Error fetching Processing Unit dashboard data:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch dashboard data.");
    }
  }
);


export const getWarehouseDashboardData = functions.https.onCall(
  async (data, context): Promise<WarehouseDashboardData> => {
    checkAuth(context);
    
    // In a real app, this would perform aggregations on inventory data linked to this warehouse.
    const inventorySnapshot = await db.collection('marketplaceItems').where('listingType', '==', 'Product').limit(500).get();
    
    const inventoryLevels = {
        totalItems: inventorySnapshot.size,
        itemsNeedingAttention: inventorySnapshot.docs.filter(doc => (doc.data().stock || 0) < (doc.data().reorderLevel || 20)).length,
    };
    
    // This would be a more complex calculation based on capacity vs. stored volume.
    const storageOptimization = { 
        utilization: 78, 
        suggestion: 'Consolidate pallets in Zone C.' 
    };
    
    // This would come from an AI model or rule-based system analyzing data streams.
    const predictiveAlerts = [
            { alert: 'High humidity detected in Cold Storage 2. Risk of mold.', actionLink: '#' }
    ];

    return {
        storageOptimization,
        inventoryLevels,
        predictiveAlerts
    };
  }
);


export const getQaDashboardData = functions.https.onCall(
  (data, context): QaDashboardData => {
    checkAuth(context);
    // This dashboard is currently mocked as it requires a more complex data model
    // for inspections and quality logs that doesn't exist yet.
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
  async (data, context): Promise<CertificationBodyDashboardData> => {
    checkAuth(context);
    // In a real app, this would query 'audits' and 'certifications' collections.
    // We are mocking this data for now to represent the intended final state.
    return {
        pendingAudits: [
            { id: 'aud1', farmName: 'Green Valley Farms', standard: 'EU Organic', dueDate: new Date(Date.now() + 15 * 86400000).toISOString(), actionLink: '#' },
            { id: 'aud2', farmName: 'Riverbend Co-op', standard: 'Fair Trade', dueDate: new Date(Date.now() + 30 * 86400000).toISOString(), actionLink: '#' }
        ],
        certifiedEntities: [
            { id: 'ent1', name: 'Riverside Orchards', type: 'Farm', certificationStatus: 'Active', actionLink: '#' },
            { id: 'ent2', name: 'Highland Coffee Collective', type: 'Cooperative', certificationStatus: 'Active', actionLink: '#' },
            { id: 'ent3', name: 'Sunshine Growers', type: 'Farm', certificationStatus: 'Pending Renewal', actionLink: '#' }
        ],
        standardsMonitoring: [
            { standard: 'Fair Trade', adherenceRate: 95, alerts: 2, actionLink: '#' },
            { standard: 'GlobalG.A.P.', adherenceRate: 98, alerts: 0, actionLink: '#' },
            { standard: 'EU Organic', adherenceRate: 92, alerts: 5, actionLink: '#' }
        ]
    };
  }
);

export const getResearcherDashboardData = functions.https.onCall(
    async (data, context): Promise<ResearcherDashboardData> => {
      const { authorId } = data;
      if (!authorId) {
          throw new functions.https.HttpsError('invalid-argument', 'An authorId must be provided.');
      }
      try {
          // Fetch knowledge hub contributions made by this user
          const articlesSnapshot = await db.collection('knowledge_articles')
              .where('authorId', '==', authorId) // Query by UID
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
        const agronomistDoc = await db.collection('users').doc(userId).get();
        if (!agronomistDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Agronomist profile not found.');
        }

        const assignedFarmerIds = agronomistDoc.data()?.profileData?.assignedFarmers || [];
        let assignedFarmersOverview: AgronomistDashboardData['assignedFarmersOverview'] = [];

        if(assignedFarmerIds.length > 0) {
            const farmersSnapshot = await db.collection('users')
                .where(admin.firestore.FieldPath.documentId(), 'in', assignedFarmerIds.slice(0, 30))
                .get();
            
            assignedFarmersOverview = farmersSnapshot.docs.map(doc => {
                const farmerData = doc.data() as UserProfile;
                return {
                    id: doc.id,
                    name: farmerData.displayName || 'Unknown Farmer',
                    farmLocation: farmerData.location?.address || 'Unknown Location',
                    lastConsultation: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(), // Mocked
                    alerts: Math.floor(Math.random() * 3), // Mocked
                    avatarUrl: farmerData.avatarUrl || null,
                };
            });
        }


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
                status: 'Published' as const,
            };
        });

        // Mock data for other sections
        const pendingConsultationRequests = [
            { id: 'req1', farmerName: 'Jane Smith', issueSummary: 'Yellowing leaves on tomato plants.', requestDate: new Date().toISOString(), farmerId: 'farmer1' }
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
                location: item.location.address,
                status: 'Published' as 'Published' | 'Draft', // Assuming all listed items are published for now
                bookingsCount: item.bookingsCount || 0, // A field we can increment
                actionLink: `/marketplace/${item.id}/manage-service`
            };
        });

        // --- Fetch Live Data for Upcoming Bookings ---
        const upcomingBookings: AgroTourismDashboardData['upcomingBookings'] = [];
        for (const experience of listedExperiences) {
            const bookingsSnapshot = await db.collection(`marketplaceItems/${experience.id}/bookings`)
                .where('checkedIn', '==', false) // Only get upcoming/unchecked-in bookings
                .orderBy('bookedAt', 'desc')
                .limit(2) // Limit to a few recent bookings per experience
                .get();

            bookingsSnapshot.forEach(doc => {
                const booking = doc.data();
                upcomingBookings.push({
                    id: doc.id,
                    experienceTitle: experience.title,
                    guestName: booking.displayName,
                    date: booking.bookedAt.toDate().toISOString(), // Use booking date
                    actionLink: `/marketplace/${experience.id}/manage-service?tab=bookings`
                });
            });
        }
        
        // --- Keep Mock Data for reviews ---
        const guestReviews = [
            { id: 'rev1', guestName: 'Bob Williams', experienceTitle: 'Coffee Farm Tour & Tasting', rating: 5, comment: 'Amazing experience, learned so much!', actionLink: '#' }
        ];

        return {
            listedExperiences,
            upcomingBookings: upcomingBookings.slice(0, 5), // Return overall 5 most recent
            guestReviews,
        };

    } catch (error) {
        console.error("Error fetching Agro-Tourism dashboard data:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch dashboard data.");
    }
  }
);

export const getInsuranceProviderDashboardData = functions.https.onCall(
  async (data, context): Promise<InsuranceProviderDashboardData> => {
    const providerId = checkAuth(context);

    try {
        const claimsSnapshot = await db.collection('insurance_applications')
            .where('providerId', '==', providerId)
            .where('status', 'in', ['Submitted', 'Under Review'])
            .limit(10)
            .get();
        
        const pendingClaims = claimsSnapshot.docs.map(doc => {
            const claim = doc.data();
            return {
                id: doc.id,
                policyHolderName: claim.applicantName || 'Unknown Farmer', // Placeholder
                policyType: claim.productName,
                claimDate: (claim.submittedAt as admin.firestore.Timestamp).toDate().toISOString(),
                status: claim.status,
                actionLink: `/insurance/claims/${claim.id}`
            }
        });

        return {
            pendingClaims,
            // These remain mocked as their data sources are complex
            riskAssessmentAlerts: [
                { id: 'risk1', policyHolderName: 'Sunset Farms', alert: 'High flood risk predicted for next month.', severity: 'High', actionLink: '#' }
            ],
            activePolicies: [
                { id: 'pol1', policyHolderName: 'Green Valley Farms', policyType: 'Multi-peril Crop', coverageAmount: 50000, expiryDate: new Date().toISOString() }
            ]
        };
    } catch (error) {
        console.error("Error fetching insurance provider dashboard data:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch dashboard data.");
    }
  }
);

export const getEnergyProviderDashboardData = functions.https.onCall(
  (data, context): EnergyProviderDashboardData => {
    checkAuth(context);
    // This dashboard remains mock data as it requires a more complex data model
    // for projects and leads that doesn't exist yet. This provides a blueprint.
    return {
        projectLeads: [
            { id: 'lead1', entityName: 'Rift Valley Growers Co-op', location: 'Naivasha, Kenya', estimatedEnergyNeed: '150kW Solar for Irrigation', status: 'Proposal Sent', actionLink: '#' },
            { id: 'lead2', entityName: 'Highland Coffee Estate', location: 'Nyeri, Kenya', estimatedEnergyNeed: '50kW Biogas for Processing', status: 'New', actionLink: '#' }
        ],
        activeProjects: [
            { id: 'proj1', projectName: 'Greenhouse Solar Installation', solutionType: 'Solar PV', status: 'In Progress', completionDate: new Date(Date.now() + 30 * 86400000).toISOString() },
            { id: 'proj2', projectName: 'Dairy Farm Biogas Digester', solutionType: 'Biogas', status: 'Completed', completionDate: new Date(Date.now() - 15 * 86400000).toISOString() }
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
        { id: 'opp1', projectName: 'Women-Led Shea Butter Processing Unit', category: 'Value Addition', fundingGoal: 50000, amountRaised: 35000, actionLink: '#' },
        { id: 'opp2', projectName: 'Solar Irrigation for Rural Co-op', category: 'Infrastructure', fundingGoal: 25000, amountRaised: 10000, actionLink: '#' }
      ],
      recentTransactions: [
        { id: 'tx1', projectName: 'Rift Valley Growers Co-op', type: 'Investment', amount: 5000, date: new Date(Date.now() - 5 * 86400000).toISOString() },
        { id: 'tx2', projectName: 'Organic Cashew Farm', type: 'Payout', amount: 1200, date: new Date(Date.now() - 20 * 86400000).toISOString() }
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
        { id: 'waste1', type: 'Maize Stover', source: 'Green Valley Farms', quantity: '10 tons' },
        { id: 'waste2', type: 'Coffee Pulp', source: 'Highland Coffee Collective', quantity: '5 tons' },
        { id: 'waste3', type: 'Animal Manure', source: 'Riverbend Dairies', quantity: '20 tons' },
      ],
      compostBatches: [
        { id: 'comp1', status: 'Active', estimatedCompletion: new Date(Date.now() + 30 * 86400000).toISOString() },
        { id: 'comp2', status: 'Curing', estimatedCompletion: new Date(Date.now() + 10 * 86400000).toISOString() },
        { id: 'comp3', status: 'Ready', estimatedCompletion: new Date(Date.now() - 5 * 86400000).toISOString() },
      ],
      finishedProductInventory: [
        { product: 'Grade A Compost', quantity: '25 tons', actionLink: '/marketplace/create?category=fertilizers-soil' },
        { product: 'Liquid Bio-fertilizer', quantity: '5000 liters', actionLink: '/marketplace/create?category=fertilizers-soil' },
      ]
    };
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

    // In a real app, this data would be pulled from system monitoring tools.
    return {
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
  }
);


export const getAdminDashboardData = functions.https.onCall(async (data, context): Promise<AdminDashboardData> => {
    // Ideally, you'd add an admin role check here.
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

        return {
            totalUsers: usersSnap.size,
            totalFarms: farmsSnap.size,
            totalListings: listingsSnap.size,
            pendingApprovals: pendingApprovalsSnap.size,
            newUsersLastWeek: newUsersSnap.size,
        };
    } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch admin dashboard data.");
    }
});


export const getAdminRecentActivity = functions.https.onCall(async (data, context): Promise<{ activity: AdminActivity[] }> => {
    checkAuth(context);
    try {
        const snapshot = await db.collection('search_index')
            .orderBy('createdAt', 'desc')
            .limit(10)
            .get();
        
        const activities: AdminActivity[] = snapshot.docs.map(doc => {
            const item = doc.data();
            let type = 'New Item';
            let secondaryInfo = item.itemCollection;
            let link = `/`;

            switch (item.itemCollection) {
                case 'users':
                    type = 'New User';
                    secondaryInfo = item.primaryRole;
                    link = `/profiles/${item.itemId}`;
                    break;
                case 'marketplaceItems':
                    type = 'New Listing';
                    secondaryInfo = item.category;
                     link = `/marketplace/${item.itemId}`;
                    break;
                case 'forums':
                    type = 'New Forum';
                    secondaryInfo = item.tags.join(', ');
                     link = `/forums/${item.itemId}`;
                    break;
                 case 'agri_events':
                    type = 'New Event';
                    secondaryInfo = item.tags.join(', ');
                     link = `/agri-events/${item.itemId}`;
                    break;
            }

            return {
                id: doc.id,
                type: type,
                primaryInfo: item.title,
                secondaryInfo: secondaryInfo,
                timestamp: (item.createdAt as admin.firestore.Timestamp).toDate().toISOString(),
                link: link,
                avatarUrl: item.imageUrl,
            };
        });

        return { activity: activities };

    } catch (error) {
         console.error("Error fetching admin recent activity:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch recent activity.");
    }
});



export const getOperationsDashboardData = functions.https.onCall(
  async (data, context): Promise<OperationsDashboardData> => {
    checkAuth(context);

    // This is a placeholder as the real implementation would require more complex
    // logging and data aggregation infrastructure.
    const vtiGenerationRate = {
      rate: 15,
      unit: 'VTIs/hour' as 'VTIs/hour',
      trend: 5,
    };
    const dataPipelineStatus = {
      status: 'Operational' as 'Operational' | 'Degraded' | 'Offline',
      lastChecked: new Date().toISOString(),
    };
    const flaggedEvents = [
        { id: 'evt1', type: 'Anomalous Geolocation' as const, description: 'Large distance between HARVESTED and PROCESSED events.', vtiLink: '#' },
        { id: 'evt2', type: 'Unusual Time Lag' as const, description: '48-hour delay between PROCESSED and SHIPPED for perishable goods.', vtiLink: '#' }
    ];

    return {
        vtiGenerationRate,
        dataPipelineStatus,
        flaggedEvents
    };
  }
);
