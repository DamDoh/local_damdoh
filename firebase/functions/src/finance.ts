import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK (only once)
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// HTTPS Cloud Function to initiate payment for an order
export const initiatePayment = functions.https.onCall(async (data, context) => {
  // Ensure the request is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const userId = context.auth.uid;
  const orderId = data.orderId;

  if (!orderId) {
    throw new functions.https.HttpsError('invalid-argument', 'The function must be called with an orderId.');
  }

  try {
    // Retrieve the order document
    const orderRef = db.collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();

    // Check if the order exists
    if (!orderDoc.exists) {
      throw new functions.https.HttpsError('not-found', `Order with ID ${orderId} not found.`);
    }

    const orderData = orderDoc.data();

    // Ensure the authenticated user is the buyer and the order status is 'pending_payment'
    if (orderData?.buyerId !== userId) {
      throw new functions.https.HttpsError('permission-denied', 'You do not have permission to initiate payment for this order.');
    }

    if (orderData?.status !== 'pending_payment') {
      throw new functions.https.HttpsError('failed-precondition', `Payment can only be initiated for orders with status 'pending_payment'. Current status: ${orderData?.status}`);
    }

    // Extract necessary details from the order for the payment gateway
    const amount = orderData.price * orderData.quantity; // Example calculation
    const description = `Payment for order ${orderId}`;
    const buyerInfo = { userId: orderData.buyerId, ...orderData.buyerInfo }; // Assuming buyerInfo exists in order
    const sellerInfo = { userId: orderData.sellerId, ...orderData.sellerInfo }; // Assuming sellerInfo exists in order

    // --- Interact with a hypothetical payment gateway API ---
    // Replace this with actual API calls to your chosen payment gateway (e.g., Stripe, PayPal, a local payment provider)
    // This typically involves sending a request to the gateway with order details and expecting a response
    // like a payment URL to redirect the user, or a transaction ID.
    // Example simulated payment gateway interaction:
    console.log(`Simulating payment initiation for order ${orderId} with amount ${amount}`);
    const hypotheticalTransactionId = `txn_${orderId}_${Date.now()}`;
    const hypotheticalPaymentUrl = `https://hypothetical-payment-gateway.com/pay?transaction=${hypotheticalTransactionId}&amount=${amount}&order=${orderId}`;
    console.log(`Hypothetical Transaction ID: ${hypotheticalTransactionId}`);
    console.log(`Hypothetical Payment URL: ${hypotheticalPaymentUrl}`);
    // --- End of hypothetical payment gateway interaction ---

    // Create a new document in the 'transactions' collection to record the payment attempt
    const batch = db.batch();
    const transactionsCollectionRef = db.collection('transactions');
    const newTransactionRef = transactionsCollectionRef.doc(); // Auto-generate transaction ID

    const transactionData = {
      orderId: orderId,
      buyerId: userId,
      sellerId: orderData.sellerId,
      amount: amount,
      currency: orderData.currency || 'USD', // Assuming currency is in order data
      paymentGatewayTransactionId: hypotheticalTransactionId, // Store the ID from the gateway
      status: 'initiated', // Initial status
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      // Add other relevant payment gateway response data
    };

    batch.set(newTransactionRef, transactionData);

    // Update the order status in the 'orders' collection to 'payment_initiated'
    batch.update(orderRef, {
      status: 'payment_initiated',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      // Store the transaction ID in the order for easy lookup
      transactionId: newTransactionRef.id,
    });

    // Commit the batched write to ensure atomicity
    await batch.commit();

    // Return the payment gateway's response data (e.g., payment URL) to the frontend
    return { success: true, paymentUrl: hypotheticalPaymentUrl, transactionId: newTransactionRef.id };

  } catch (error: any) {
    console.error('Error initiating payment:', error);

    // Handle specific HttpsErrors
    if (error.code) {
      throw error;
    }

    // Re-throw as generic HttpsError for unexpected errors
    throw new functions.https.HttpsError('internal', 'An unexpected error occurred while initiating payment.', error.message);
  }
});

// HTTPS Cloud Function to handle payment confirmations from the payment gateway (webhook)
export const handlePaymentConfirmation = functions.https.onRequest(async (req, res) => {
  // Ensure the request method is POST
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  // --- Implement security measures to verify the request is from the legitimate payment gateway ---
  // This is crucial for security. Replace this with your payment gateway's specific verification method.
  // Examples: checking a signature in headers, verifying a shared secret, validating the source IP.
  // For demonstration, we'll add a simple placeholder.
  console.log('Verifying payment confirmation request signature...');
  const isRequestVerified = true; // Replace with actual verification logic

  if (!isRequestVerified) {
    console.warn('Payment confirmation request verification failed.');
    return res.status(403).send('Forbidden - Invalid signature or source.');
  }
  console.log('Payment confirmation request verified.');

  // --- Receive and parse the payment confirmation data from the request body ---
  // The structure of this data depends entirely on the payment gateway.
  // For demonstration, we'll assume a simple JSON body with transactionId and status.
  let gatewayData: any;
  try {
    gatewayData = req.body;
    if (!gatewayData || typeof gatewayData.gatewayTransactionId === 'undefined' || typeof gatewayData.status === 'undefined') {
      console.error('Invalid payment confirmation data received:', gatewayData);
      return res.status(400).send('Bad Request - Missing gatewayTransactionId or status.');
    }
  } catch (error) {
    console.error('Error parsing payment confirmation request body:', error);
    return res.status(400).send('Bad Request - Invalid JSON.');
  }

  const gatewayTransactionId = gatewayData.gatewayTransactionId;
  const paymentStatus = gatewayData.status; // e.g., 'succeeded', 'failed'
  console.log(`Received payment confirmation for Gateway Transaction ID: ${gatewayTransactionId} with status: ${paymentStatus}`);

  try {
    // Query the 'transactions' collection to find the transaction document with the matching gatewayTransactionId
    const transactionsRef = db.collection('transactions');
    const querySnapshot = await transactionsRef.where('paymentGatewayTransactionId', '==', gatewayTransactionId).limit(1).get();

    if (querySnapshot.empty) {
      console.warn(`Transaction with Gateway Transaction ID ${gatewayTransactionId} not found.`);
      // It's often a good idea to return a 200 even if the transaction isn't found to avoid retries from the gateway
      return res.status(200).send('Transaction not found, but acknowledged.');
    }

    const transactionDoc = querySnapshot.docs[0];
    const transactionRef = transactionDoc.ref;
    const transactionData = transactionDoc.data();

    // Use a batched write for atomicity
    const batch = db.batch();

    // Update the transaction document status and potentially other gateway response data
    batch.update(transactionRef, {
      status: paymentStatus,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      gatewayResponseData: gatewayData, // Store the full gateway response
    });

    // Retrieve the linked order document and update its status based on payment status
    const orderRef = db.collection('orders').doc(transactionData.orderId);
    const newOrderStatus = paymentStatus === 'succeeded' ? 'paid' : 'payment_failed';
    batch.update(orderRef, {
      status: newOrderStatus,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Commit the batched write
    await batch.commit();
    console.log(`Transaction ${transactionDoc.id} and Order ${transactionData.orderId} updated to status: ${newOrderStatus}`);

    // Consider triggering notifications here (e.g., using a Pub/Sub topic or calling another function)
    // notifyUser(transactionData.buyerId, `Payment for order ${transactionData.orderId} ${paymentStatus}.`);
    // notifyUser(transactionData.sellerId, `Payment for order ${transactionData.orderId} ${paymentStatus}.`);

    // Return a success response to the payment gateway
    return res.status(200).send('Payment confirmation received and processed.');

  } catch (error) {
    console.error('Error handling payment confirmation:', error);
    // Return an error response to the payment gateway
    return res.status(500).send('Internal Server Error');
  }
});