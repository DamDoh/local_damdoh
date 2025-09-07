
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import type { EquipmentSupplierDashboardData } from "@/lib/types";

const db = admin.firestore();

const checkAuth = (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
  }
  return context.auth.uid;
};

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

    