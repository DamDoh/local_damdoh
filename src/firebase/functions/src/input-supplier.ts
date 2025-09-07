
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import type { InputSupplierDashboardData } from "@/lib/types";

const db = admin.firestore();

const checkAuth = (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
  }
  return context.auth.uid;
};

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
        link: '/marketplace/my-orders'
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
