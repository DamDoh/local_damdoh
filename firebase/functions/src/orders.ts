import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK (only once)
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Creates a new order document in Firestore.
 * This function is intended to be triggered internally, likely by the updateOffer function.
 * @param orderData - The data for the new order, derived from the accepted offer and listing.
 *                    Should include buyerId, sellerId, listingId, price, quantity, category, etc.
 * @returns A Promise resolving with the new order's ID or rejecting with an error.
 */
export const createOrder = functions.https.onCall(async (data, context) => {
  // This function is intended for internal use.
  // Depending on how it's called (e.g., from another Cloud Function),
  // additional internal authorization checks might be needed.
  // For simplicity in this example, we assume the caller (e.g., updateOffer)
  // has already performed user authentication and authorization checks
  // related to the offer acceptance process.

  const orderData = data;

  if (!orderData || !orderData.buyerId || !orderData.sellerId || !orderData.listingId || orderData.price === undefined || orderData.quantity === undefined || !orderData.category) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required order data.');
  }

  try {
    const newOrderRef = await db.collection('orders').add({
      ...orderData,
      status: 'pending_payment', // Initial status
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Return the ID of the newly created order
    return { orderId: newOrderRef.id, message: 'Order created successfully.' };

  } catch (error) {
    console.error('Error creating order:', error);
    throw new functions.https.HttpsError('internal', 'Unable to create order.');
  }
});


/**
 * Retrieves a specific order document by ID.
 * Requires authentication and authorization (user must be buyer, seller, or admin).
 */
export const getOrder = functions.https.onCall(async (data, context) => {
  // Ensure the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The user is not authenticated.');
  }

  const { orderId } = data;

  if (!orderId) {
    throw new functions.https.HttpsError('invalid-argument', 'Order ID is required.');
  }

  try {
    const orderDoc = await db.collection('orders').doc(orderId).get();

    if (!orderDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Order not found.');
    }

    const orderData = orderDoc.data();

    // Authorization check: User must be the buyer, seller, or an admin
    const userId = context.auth.uid;
    const isAdmin = (await admin.auth().getUser(userId)).customClaims?.admin === true; // Example admin check using custom claim

    if (!isAdmin && orderData?.buyerId !== userId && orderData?.sellerId !== userId) {
      throw new functions.https.HttpsError('permission-denied', 'You do not have permission to view this order.');
    }

    return { ...orderData, id: orderDoc.id }; // Include document ID in response

  } catch (error) {
    console.error('Error getting order:', error);
    // Re-throw HttpsErrors to the client, otherwise return a generic internal error
    if (error instanceof functions.https.HttpsError) {
        throw error;
    }
    throw new functions.https.HttpsError('internal', 'Unable to retrieve order.');
  }
});

/**
 * Retrieves all orders related to the authenticated user (as buyer or seller).
 * Requires authentication.
 */
export const getUserOrders = functions.https.onCall(async (data, context) => {
  // Ensure the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The user is not authenticated.');
  }

  const userId = context.auth.uid;

  try {
    // Query orders where the user is the buyer OR the seller
    // Firestore queries are limited, so we need two separate queries and merge results.
    const buyerOrdersSnapshot = await db.collection('orders')
      .where('buyerId', '==', userId)
      .orderBy('createdAt', 'desc') // Optional: order by creation time
      .get();

    const sellerOrdersSnapshot = await db.collection('orders')
      .where('sellerId', '==', userId)
      .orderBy('createdAt', 'desc') // Optional: order by creation time
      .get();

    // Merge and deduplicate the results (although with distinct buyerId/sellerId, duplicates are unlikely for the same order)
    const ordersMap = new Map<string, any>();
    buyerOrdersSnapshot.docs.forEach(doc => ordersMap.set(doc.id, { ...doc.data(), id: doc.id }));
    sellerOrdersSnapshot.docs.forEach(doc => ordersMap.set(doc.id, { ...doc.data(), id: doc.id }));

    // Convert map values to an array and optionally sort again if needed after merging
    const userOrders = Array.from(ordersMap.values());

    // Optional: Sort the merged list again if needed
    userOrders.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));


    return userOrders;

  } catch (error) {
    console.error('Error getting user orders:', error);
    throw new functions.https.HttpsError('internal', 'Unable to retrieve user orders.');
  }
});

/**
 * Updates the status of a specific order.
 * Requires authentication and authorization based on roles and status transitions.
 */
export const updateOrderStatus = functions.https.onCall(async (data, context) => {
  // Ensure the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The user is not authenticated.');
  }

  const { orderId, status } = data;

  if (!orderId || !status) {
    throw new functions.https.HttpsError('invalid-argument', 'Order ID and status are required.');
  }

  const allowedStatuses = ['pending_payment', 'paid', 'shipped', 'delivered', 'cancelled', 'completed']; // Define your valid statuses
  if (!allowedStatuses.includes(status)) {
      throw new functions.https.HttpsError('invalid-argument', `Invalid status: ${status}. Allowed statuses are: ${allowedStatuses.join(', ')}`);
  }

  const userId = context.auth.uid;
  const isAdmin = (await admin.auth().getUser(userId)).customClaims?.admin === true; // Example admin check

  try {
    const orderRef = db.collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Order not found.');
    }

    const orderData = orderDoc.data();

    // Authorization and Status Transition Logic
    // Example logic:
    // - Admin can update to any status.
    // - Seller can update from 'pending_payment' to 'paid' (if handling payment confirmation) or to 'shipped'.
    // - Buyer can update from 'shipped' to 'delivered' or 'completed'.
    // - Buyer or Seller can request 'cancelled' in certain states (might require approval logic).

    const currentStatus = orderData?.status;
    const isBuyer = orderData?.buyerId === userId;
    const isSeller = orderData?.sellerId === userId;

    let allowed = false;

    if (isAdmin) {
        allowed = true; // Admins can change status
    } else if (isSeller) {
        if (status === 'paid' && currentStatus === 'pending_payment') allowed = true; // Seller confirms payment
        if (status === 'shipped' && (currentStatus === 'paid' || currentStatus === 'pending_payment')) allowed = true; // Seller marks as shipped
        // Add other seller-specific transitions
    } else if (isBuyer) {
        if (status === 'delivered' && currentStatus === 'shipped') allowed = true; // Buyer confirms delivery
        if (status === 'completed' && currentStatus === 'delivered') allowed = true; // Buyer completes order
        // Add other buyer-specific transitions
    }

    // Basic cancellation logic example (can be refined with state machine)
    if ((isBuyer || isSeller) && status === 'cancelled') {
        // Allow cancellation if order is in early stage
        if (currentStatus === 'pending_payment') allowed = true;
        // More complex cancellation might involve negotiation/approval
    }


    if (!allowed) {
         throw new functions.https.HttpsError('permission-denied', `You do not have permission to change the status from '${currentStatus}' to '${status}'.`);
    }


    // Update the order status
    await orderRef.update({
      status: status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // TODO: Trigger notifications based on status changes using Communication Service

    return { success: true, message: `Order status updated to ${status}.` };

  } catch (error) {
    console.error('Error updating order status:', error);
    // Re-throw HttpsErrors to the client, otherwise return a generic internal error
    if (error instanceof functions.https.HttpsError) {
        throw error;
    }
    throw new functions.https.HttpsError('internal', 'Unable to update order status.');
  }
});

/*
// Optional: Delete Order function
// Consider carefully if orders should be deletable and under what strict conditions.
// Deleting an order might require rolling back inventory, offers, etc.
export const deleteOrder = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The user is not authenticated.');
    }

    const { orderId } = data;

    if (!orderId) {
        throw new functions.https.HttpsError('invalid-argument', 'Order ID is required.');
    }

    const userId = context.auth.uid;
    const isAdmin = (await admin.auth().getUser(userId)).customClaims?.admin === true; // Example admin check

    try {
        const orderRef = db.collection('orders').doc(orderId);
        const orderDoc = await orderRef.get();

        if (!orderDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Order not found.');
        }

        const orderData = orderDoc.data();

        // Strict authorization check: Only admin, or perhaps buyer/seller in very specific states?
        // For simplicity, only allowing admin to delete in this example.
        if (!isAdmin) {
            throw new functions.https.HttpsError('permission-denied', 'You do not have permission to delete this order.');
        }

        // TODO: Add logic to handle consequences of deleting an order (e.g., restore listing quantity, etc.)
        // This can be complex depending on the order status and category.

        await orderRef.delete();

        return { success: true, message: 'Order deleted successfully.' };

    } catch (error) {
        console.error('Error deleting order:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Unable to delete order.');
    }
});
*/