import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK (only once)
if (!admin.apps.length) {
 admin.initializeApp();
}

const db = admin.firestore();

// HTTPS Cloud Function to initiate payment for an order
// This function is called by the frontend to start the payment process.
// It interacts with a payment gateway and records the initial transaction details.
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
 // Retrieve the order document to get details and verify authorization
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
 // IMPORTANT: Amount calculation should ideally be verified on the backend to prevent manipulation.
 const amount = orderData.totalAmount; // Assuming a totalAmount field exists in order data
 const description = `Payment for order ${orderId}`;
 // Add other necessary details like currency, line items, etc., depending on the payment gateway

 // --- Placeholder for Interaction with a Payment Gateway API ---
 // This is where you would integrate with your chosen payment gateway (e.g., Stripe, PayPal, a local provider).
 // You would typically use the payment gateway's SDK or make direct HTTP requests to:
 // 1. Create a payment intent, checkout session, or similar object.
 // 2. Pass order details (amount, description, currency, etc.) and potentially customer information.
 // 3. The gateway will return information needed to proceed with the payment on the frontend,
 //    such as a client secret (for Stripe), a redirect URL (for PayPal), or a transaction token.
 // Replace the following simulated interaction with actual payment gateway API calls.
 console.log(`Simulating payment initiation for order ${orderId} with amount ${amount}`);
 const hypotheticalPaymentGatewayResponse = {
 gatewayTransactionId: `gtx_${orderId}_${Date.now()}`, // A unique ID from the payment gateway
 clientSecret: 'simulated_client_secret_for_frontend', // Example for gateways like Stripe
 redirectUrl: `https://simulated-payment-gateway.com/checkout?order=${orderId}&txnid=gtx_${orderId}_${Date.now()}`, // Example for gateways like PayPal
 // ... other relevant data from the gateway response
 };
 console.log('Hypothetical Payment Gateway Response:', hypotheticalPaymentGatewayResponse);
 // --- End of Placeholder ---

 // Create a new document in the 'transactions' collection to record the payment initiation attempt
 // Use a batched write to update the order status and create the transaction atomically.
 const batch = db.batch();
 const transactionsCollectionRef = db.collection('transactions');
 // Use a consistent ID if the payment gateway provides one immediately, otherwise use auto-ID
 const newTransactionRef = transactionsCollectionRef.doc(hypotheticalPaymentGatewayResponse.gatewayTransactionId);

 const transactionData = {
 orderId: orderId,
 buyerId: userId,
 sellerId: orderData.sellerId,
 amount: amount,
 currency: orderData.currency || 'USD', // Ensure currency is in order data or default
 paymentGateway: 'hypothetical-gateway', // Identifier for the payment gateway used
 paymentGatewayTransactionId: hypotheticalPaymentGatewayResponse.gatewayTransactionId,
 status: 'initiated', // Initial status in our system
 createdAt: admin.firestore.FieldValue.serverTimestamp(),
 updatedAt: admin.firestore.FieldValue.serverTimestamp(),
 // Store relevant parts of the gateway response for future reference
 gatewayInitiationResponse: hypotheticalPaymentGatewayResponse,
 };

 batch.set(newTransactionRef, transactionData);

 // Update the order status in the 'orders' collection to indicate payment is in progress
 batch.update(orderRef, {
 status: 'payment_initiated',
 updatedAt: admin.firestore.FieldValue.serverTimestamp(),
 // Store the transaction ID in the order for easy lookup
 transactionId: newTransactionRef.id,
 });

 // Commit the batched write to ensure atomicity
 await batch.commit();
 console.log(`Payment initiation recorded for order ${orderId}. Transaction ID: ${newTransactionRef.id}`);

 // Return necessary data to the frontend to proceed with the payment flow
 return {
 success: true,
 transactionId: newTransactionRef.id,
 ...hypotheticalPaymentGatewayResponse // Return the gateway response data to the frontend
 };

 } catch (error: any) {
 console.error('Error initiating payment:', error);

 // Re-throw as HttpsError for client-side handling
 if (error.code) {
 throw error;
 }

 // Re-throw as generic HttpsError for unexpected errors
 throw new functions.https.HttpsError('internal', 'An unexpected error occurred while initiating payment.', error.message);
 }
});
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
export const handlePaymentWebhook = functions.https.onRequest(async (req, res) => {
  // Ensure the request method is POST
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  // --- Implement security measures to verify the request is from the legitimate payment gateway ---
  // This is crucial for security. Replace this with your payment gateway's specific verification method.
  // Examples: checking a signature in headers, verifying a shared secret, validating the source IP.
  // For demonstration, we'll add a simple placeholder.
  console.log('Verifying payment webhook request signature...');
  const isRequestVerified = true; // Replace with actual verification logic

  if (!isRequestVerified) {
    console.warn('Payment confirmation request verification failed.');
    // Important: Respond quickly with a non-success status code if verification fails.
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
      return res.status(400).send('Bad Request - Missing required payment gateway data.');
    }
  } catch (error) {
    console.error('Error parsing payment confirmation request body:', error);
    return res.status(400).send('Bad Request - Failed to parse JSON body.');
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
      // Or return a specific error code indicating resource not found, depending on gateway requirements.
      return res.status(404).send('Transaction not found.');
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

    // --- Placeholder for Triggering Notifications ---
    // After successfully updating the database, trigger notifications to inform
    // the buyer and seller about the payment status (success or failure).
    // This would typically involve calling functions in the Communication Service.
    console.log(`Payment for order ${transactionData.orderId} status updated to: ${newOrderStatus}. Triggering notifications...`);
    // Example: notifyUser(transactionData.buyerId, `Payment for your order ${transactionData.orderId} is ${paymentStatus}.`);
    // Example: notifyUser(transactionData.sellerId, `Payment received for order ${transactionData.orderId}.`);
    // --- End of Placeholder ---

    // Commit the batched write
    await batch.commit();
    console.log(`Transaction ${transactionDoc.id} and Order ${transactionData.orderId} updated to status: ${newOrderStatus}`);

    return res.status(200).send('OK'); // Standard success response for webhooks
  } catch (error) {
    console.error('Error handling payment confirmation:', error);
    // Return an error response to the payment gateway
    return res.status(500).send('Internal Server Error');
  }
});