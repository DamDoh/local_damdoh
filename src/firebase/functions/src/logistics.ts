

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import type { LogisticsDashboardData } from "@/lib/types";

const db = admin.firestore();

const checkAuth = (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "error.unauthenticated");
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
                sellerProfiles[doc.id] = { location: doc.data().location?.address || 'Unknown Origin' };
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
