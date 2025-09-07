

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import type { 
    FarmerDashboardData,
    BuyerDashboardData,
    LogisticsDashboardData,
    FieldAgentDashboardData,
    ProcessingUnitDashboardData,
    WarehouseDashboardData,
    AgroTourismDashboardData,
    OperationsDashboardData,
    KnfBatch,
    FarmerDashboardAlert
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

// =================================================================
// DASHBOARDS WITH PARTIAL OR MOCK DATA
// =================================================================

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
  async (data, context): Promise<WarehouseDashboardData> => {
    checkAuth(context);
    
    // In a real app, this would perform aggregations on inventory data linked to this warehouse.
    const inventorySnapshot = await db.collection('marketplaceItems').limit(100).get();
    
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
