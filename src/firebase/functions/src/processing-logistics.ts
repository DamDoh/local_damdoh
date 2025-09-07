

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import type { LogisticsDashboardData, ProcessingUnitDashboardData, WarehouseDashboardData } from "@/lib/types";

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
            const deliveryTimestamp = order.expectedDeliveryDate as admin.firestore.Timestamp | undefined;
            return {
                id: doc.id,
                supplierName: sellerProfiles[order.sellerId] || 'Unknown Supplier',
                deliveryDate: deliveryTimestamp?.toDate().toISOString() || new Date(Date.now() + 86400000 * 5).toISOString(),
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
