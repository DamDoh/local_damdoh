import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as geofire from 'geofire-common';

import { sendNotification } from './communication'; // Import the sendNotification function
// Initialize Firebase Admin SDK if it hasn't been initialized yet
if (admin.apps.length === 0) {
  admin.initializeApp();
}

// Define the allowed seller roles
const ALLOWED_SELLER_ROLES = [
  'Farmer',
  'Input Supplier',
  'Processing Unit',
  'Packaging Supplier',
  'Warehouse/Storage Provider',
  'Retailer',
  'Agronomist',
  'Consultant',
  'Aggregator',
  'Crowdfunder (Impact Investor, Individual)' // Although crowdfunders might not "sell" physical goods, they might list investment opportunities, which could fall under a "listing" type in the marketplace. Adjust as needed based on your specific listing categories.
];

/**
 * Cloud Function to create a new marketplace listing.
 * Ensures the user is authenticated and has the 'seller' role (or equivalent).
 * Validates input data and saves the listing to Firestore.
 */
export const createListing = functions.https.onCall(async (data, context) => {
  // 1. Ensure the request is authenticated and the user has the necessary role
  if (!context.auth) {
    // User is not authenticated
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to create a listing.'
    );
  }

  const userId = context.auth.uid;

  // Fetch the user document to check their roles
  const userDoc = await admin.firestore().collection('users').doc(userId).get();
  const userData = userDoc.data();

  // Check if the user data exists and if their 'roles' array contains at least one allowed seller role
  const hasAllowedRole = userData?.roles?.some((role: string) => ALLOWED_SELLER_ROLES.includes(role)) ?? false;

  if (!userData || !hasAllowedRole) {
    // If the user document doesn't exist or they don't have an allowed seller role
     throw new functions.https.HttpsError(
       'permission-denied',
       'You do not have the required role to create a marketplace listing. Please ensure your profile specifies an allowed seller role.'
     );
  }


  // Assuming data contains the listing details, including category and category_data
  const listingData = data; // Assuming data contains the listing details

  // 2. Validate the input listing data
  // Basic validation example - expand this based on your schema in docs/damdoh_architecture.md
  if (!listingData.productName || typeof listingData.productName !== 'string') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Listing must have a valid product name.'
    );
  }
  if (typeof listingData.price !== 'number' || listingData.price <= 0) {
     throw new functions.https.HttpsError(
       'invalid-argument',
       'Listing must have a valid price.'
     );
   }
   // Add more validation rules here based on your listing schema

   // 2.1. Validate category and category_data based on the category
  if (!listingData.category || typeof listingData.category !== 'string') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Listing must have a valid category.'
    );
  }

  // Ensure category_data exists and is a map
  if (!listingData.category_data || typeof listingData.category_data !== 'object') {
     throw new functions.https.HttpsError(
       'invalid-argument',
       'Listing must include category_data.'
     );
  }

  // Perform specific validation based on the category
  switch (listingData.category) {
    case 'fresh_produce':
      if (!listingData.category_data.product_type || typeof listingData.category_data.product_type !== 'string') {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Fresh produce listings require a product_type.'
        );
      }
      // Add more specific validation for fresh_produce (e.g., grade, packaging_type, date ranges)
      break;
    case 'agro_inputs':
      if (!listingData.category_data.input_type || typeof listingData.category_data.input_type !== 'string') {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Agro input listings require an input_type.'
        );
      }
      // Add more specific validation for agro_inputs (e.g., brand, specifications)
      break;
    case 'service':
      if (!listingData.category_data.service_type || typeof listingData.category_data.service_type !== 'string') {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Service listings require a service_type.'
        );
      }
       if (!listingData.category_data.pricing_model || typeof listingData.category_data.pricing_model !== 'string') {
         throw new functions.https.HttpsError(
           'invalid-argument',
           'Service listings require a pricing_model.'
         );
       }
      // Add more specific validation for services (e.g., availability, detailed description)
      break;
    // Add cases for other categories as defined in your schema
    default:
      throw new functions.https.HttpsError(
        'invalid-argument',
        `Unsupported listing category: ${listingData.category}`
      );
  }

  // 3. Use the Firebase Admin SDK to add a new document to the 'listings' collection
  try {
    const newListingRef = await admin.firestore().collection('listings').add({
      ...listingData, // Spread the validated listing data
      sellerId: userId, // Include the seller's UID
      createdAt: admin.firestore.FieldValue.serverTimestamp(), // Add server timestamp
      category: listingData.category, // Store the category
      category_data: listingData.category_data, // Store category-specific data
      status: 'active', // Set initial status
      // Add other default fields as per your schema
    });

    // 4. Return a success response with the new listing's ID
    return { id: newListingRef.id, message: 'Listing created successfully!' };

  } catch (error: any) {
    // 4. Implement error handling
    console.error('Error creating listing:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Unable to create listing',
      error.message
    );
  }
});

/**
 * Cloud Function to provide intelligent matchmaking suggestions within the marketplace.
 * Ensures the user is authenticated.
 * Takes optional parameters to specify the type of match and relevant criteria.
 * Retrieves relevant data and integrates with the AI & Analytics Service to get matchmaking suggestions.
 */
export const getMatches = functions.https.onCall(async (data, context) => {
  // 1. Ensure the request is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to get matchmaking suggestions.'
    );
  }

  const userId = context.auth.uid;
  const { matchType, criteria } = data; // Optional parameters: matchType (e.g., 'buyer_to_seller', 'farmer_to_service_provider'), criteria (e.g., product needs, service offerings)
  const db = admin.firestore();

  try {
    // 3. Retrieve relevant user data and listing/service data from Firestore.
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    // Placeholder: Retrieve other relevant data based on matchType and criteria
    // e.g., listings based on buyer needs, service profiles based on farmer location/requirements, farm data, etc.

    // 4. Placeholder for AI Matching Logic:
    // Integrate with the AI & Analytics Service to get matchmaking suggestions.
    // This might involve calling a function in the AI service, passing the retrieved data and the type of match requested.
    // The AI service would use a matching algorithm or model to identify suitable connections.
    // const matchingSuggestions = await callAIServiceForMatching({ userId, userData, matchType, criteria, relevantData }); // Example call
    // Note: The actual implementation of `callAIServiceForMatching` would depend on how the AI service is exposed
    // (e.g., another HTTPS Cloud Function, a deployed Vertex AI Endpoint, etc.).
    // For this placeholder, we assume a conceptual function call exists.
    const matchingSuggestions = await callAIServiceForMatching({ userId, userData, matchType, criteria }); // Example call
    
    // 5. Receive matchmaking suggestions from the AI service.
    const matchingSuggestions: any[] = []; // Placeholder for suggestions received from AI service

    // 6. Return the matchmaking data (e.g., list of suggested users or listings) to the frontend
    return matchingSuggestions;

  } catch (error: any) {
    console.error('Error getting matchmaking suggestions:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Unable to retrieve matchmaking suggestions',
      error.message
    );
  }
});

/**
 * Cloud Function to retrieve AI-powered personalized recommendations for the authenticated user within the marketplace.
 * Ensures the user is authenticated.
 * Retrieves relevant user data and interacts with the AI & Analytics Service to get recommendations.
 */
export const getPersonalizedRecommendations = functions.https.onCall(async (data, context) => {
  // 1. Ensure the request is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to get recommendations.'
    );
  }

  const userId = context.auth.uid;
  const db = admin.firestore();

  try {
    // 2. Retrieve relevant user data (profile, purchase history, browsing history) from Firestore.
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    // Placeholder: Retrieve purchase history, browsing history from other collections/data sources
    // const purchaseHistorySnapshot = await db.collection('orders').where('buyerId', '==', userId).get();
    // const browsingHistory = ...; // Logic to get browsing history

    // 3. Placeholder for AI Recommendation Logic:
    // Integrate with the AI & Analytics Service to get personalized recommendations.
    // This would involve calling a function or endpoint in the AI service,
    // passing user data and potentially context (e.g., current page in the app, category being viewed).
    // The AI service would use a recommendation engine model (trained on marketplace data) to generate
    // recommendations (e.g., product listings, shops, services). This call is to a planned function in the AI & Analytics Service.
    // Note: The actual implementation of `callAIServiceForRecommendations` would depend on how the AI service is exposed
    // (e.g., another HTTPS Cloud Function, a deployed Vertex AI Endpoint, etc.).
    // For this placeholder, we assume a conceptual function call exists.
    const recommendations = await callAIServiceForRecommendations({ userId, userData, context: data.context }); // Example call
    // const recommendations = await callAIServiceForRecommendations({ userId, userData, purchaseHistory, browsingHistory, context: data.context }); // Example call

    // 4. Receive recommendations from the AI service.
    const recommendations: any[] = []; // Placeholder for recommendations received from AI service

    // 5. Return the personalized recommendations data to the frontend
    return recommendations;

  } catch (error: any) {
    console.error('Error getting personalized recommendations:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Unable to retrieve personalized recommendations',
      error.message
    );
  }
});

/**
 * Cloud Function to provide market price information and potential predictions.
 * Ensures the user is authenticated.
 * Takes optional parameters to specify the commodity, region, or time frame.
 * Retrieves historical data and/or integrates with AI for predictions.
 */
export const getMarketPriceInsights = functions.https.onCall(async (data, context) => {
  // 1. Ensure the request is authenticated (assuming market insights are available to authenticated users).
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to view market price insights.'
    );
  }

  const { commodity, region, timeframe } = data; // Optional parameters

  try {
    // 3. Placeholder for AI/Data Retrieval Logic:
    // Implement logic to retrieve historical market price data and potentially
    // integrate with the market price prediction model in the AI & Analytics Service.
    // This might involve querying a data store (Firestore or BigQuery) for historical data
    // and calling the AI service for predictions based on the provided parameters.
    console.log(`Retrieving market insights for commodity: ${commodity}, region: ${region}, timeframe: ${timeframe}`);

    const historicalData: any[] = []; // Placeholder for historical data

    // Call AI Service Function for market price predictions.
    // Note: This is a conceptual call to a function in the AI & Analytics Service.
    const aiResponse = await callAIServiceForPricePrediction({ commodity, region, timeframe }); // Example call
    // 4. Process the retrieved data and predictions into a format suitable for display
    const insights = {
      commodity,
      region,
      timeframe,
      historicalData: historicalData, // Array of historical price points
      prediction: pricePrediction, // Predicted future price or trend
      // Use aiResponse data
    };

    // 5. Return the market price insights data to the frontend
    return insights;

  } catch (error: any) {
    // 5. Implement error handling
    console.error('Error getting market price insights:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Unable to retrieve market price insights',
      error.message
    );
  }
});

/**
 * Cloud Function to retrieve the traceability trail for a given product.
 * Ensures the user is authenticated and authorized to view the traceability data.
 * Takes a product identifier (e.g., listingId or orderId) and traverses linked documents
 * across collections to assemble the traceability report.
 */
export const getProductTraceability = functions.https.onCall(async (data, context) => {
  // 1. Ensure the request is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to view product traceability.'
    );
  }

  const userId = context.auth.uid;
  const { identifier, identifierType } = data; // identifier can be listingId or orderId, identifierType indicates which

  // 2. Get the product identifier and validate input
  if (!identifier || typeof identifier !== 'string' || !identifierType || typeof identifierType !== 'string' || !['listingId', 'orderId'].includes(identifierType)) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'A valid product identifier (listingId or orderId) and identifier type are required.'
    );
  }

  const db = admin.firestore();
  let traceabilityData: any = {};

  try {
    // 3. Start the traversal based on identifier type
    // The exact traversal path depends on the identifierType and your schema.
    // Example (simplified):

    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    const isAdmin = userData?.roles?.includes('admin');

    if (identifierType === 'orderId') {
      const orderDoc = await db.collection('orders').doc(identifier).get();
      if (!orderDoc.exists) throw new functions.https.HttpsError('not-found', 'Order not found.');
      const orderData = orderDoc.data();

      // 8. Implement access control for the order: Only buyer, seller, or admin can view
      if (orderData?.buyerId !== userId && orderData?.sellerId !== userId && !isAdmin) {
         throw new functions.https.HttpsError('permission-denied', 'You do not have permission to view traceability for this order.');
      }

      traceabilityData.order = { id: orderDoc.id, ...orderData };

      // Now traverse from the order to the listing, then crop/service, etc.
      // Example: Get the linked listing
      if (orderData?.listingId) {
         const listingDoc = await db.collection('listings').doc(orderData.listingId).get();
         if (listingDoc.exists) {
            const listingData = listingDoc.data();

            // 8. Implement access control for the listing (e.g., buyer/seller of order, or public status)
            // For simplicity, assuming buyer/seller of the order can see listing details
            traceabilityData.listing = { id: listingDoc.id, ...listingData };

            // 4. From the listing document, identify the product or crop and fetch
            // Continue traversing based on listing type (fresh_produce, service, etc.)
            if (listingData?.category === 'fresh_produce' && listingData.category_data?.cropId) {
                 const cropDoc = await db.collection('crops').doc(listingData.category_data.cropId).get();
                 if (cropDoc.exists) {
                    const cropData = cropDoc.data();

                    // 8. Implement access control for crop data (e.g., only seller, farm owner, or regulator)
                    // Here, assuming buyer/seller of related order can see some crop details for traceability
                    // More granular access control might be needed here.
                    traceabilityData.crop = { id: cropDoc.id, ...cropData };

                    // 5. From the crop document, get farm ID and fetch farm document
                    if (cropData?.farmId) {
                        const farmDoc = await db.collection('farms').doc(cropData.farmId).get();
                        if (farmDoc.exists) {
                            const farmData = farmDoc.data();
                            // 8. Implement access control for farm data (similar to crop)
                            traceabilityData.farm = { id: farmDoc.id, ...farmData };
                        }
                    }

                    // 6. Fetch related data from subcollections or linked collections for the crop
                    // 8. Implement access control for subcollection data (e.g., only specific roles)
                    // For simplicity, including if user can see the crop
                 }
            }
            // Add logic for other categories (agro_inputs, service, etc.) and their linked data (e.g., service execution records)
         }
      }

    } else if (identifierType === 'listingId') {
      // Logic to start from a listingId and traverse forward or backward
      // Starting from listing might involve finding related orders or tracing back to crops/services.
      // This is often more complex than starting from an order.
      const listingDoc = await db.collection('listings').doc(identifier).get();
      if (!listingDoc.exists) throw new functions.https.HttpsError('not-found', 'Listing not found.');
      const listingData = listingDoc.data();

       // 8. Implement appropriate access control for the listing (e.g., seller, or if listing status allows public traceability)
       const isSeller = listingData?.sellerId === userId;

       if (!isAdmin && !isSeller && listingData?.status !== 'active') { // Assuming active listings might have viewable traceability
           // Or implement more granular rules based on your traceability policy
           throw new functions.https.HttpsError('permission-denied', 'You do not have permission to view traceability for this listing.');
       }
       traceabilityData.listing = { id: listingDoc.id, ...listingData };

       // 4. Traverse back to crop/service if linked
       if (listingData.category === 'fresh_produce' && listingData.category_data?.cropId) {
            const cropDoc = await db.collection('crops').doc(listingData.category_data.cropId).get();
            if (cropDoc.exists) {
               traceabilityData.crop = cropDoc.data();
               // Get subcollections for the crop
               const pestsSnapshot = await db.collection('crops').doc(cropDoc.id).collection('pests_diseases_encountered').get();
               traceabilityData.crop.pests_diseases_encountered = pestsSnapshot.docs.map(doc => doc.data());

               const fertilizationSnapshot = await db.collection('crops').doc(cropDoc.id).collection('fertilization_history').get();
               traceabilityData.crop.fertilization_history = fertilizationSnapshot.docs.map(doc => doc.data());
            }
            // 5. From the crop document, get farm ID and fetch farm document
            if (traceabilityData.crop?.farmId) {
                const farmDoc = await db.collection('farms').doc(traceabilityData.crop.farmId).get();
                if (farmDoc.exists) {
                    traceabilityData.farm = { id: farmDoc.id, ...farmDoc.data() };
                }
            }
       }
       // Add logic for other categories and their linked data

       // Optionally find recent orders for this listing if desired
       // 8. Access control: Users might only see orders they are part of, or aggregate data if allowed
       const recentOrdersSnapshot = await db.collection('orders')
           .where('listingId', '==', identifier)
           .orderBy('createdAt', 'desc')
           .limit(5) // Limit to a few recent orders
           .get();
       traceabilityData.recentOrders = recentOrdersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    }

    // 4. Assemble the retrieved data into a structured traceability report format.
    // The traceabilityData object already holds the retrieved linked data.
    // You might want to format this further before returning.

    // 6. Return the traceability report data
    return traceabilityData;

  } catch (error: any) {
    console.error('Error getting product traceability:', error);
    if (error.code) {
      throw error; // Rethrow HttpsErrors
    }
    throw new functions.https.HttpsError(
      'internal',
      'Unable to retrieve product traceability',
      error.message
    );
  }
});

/**
 * Cloud Function to search marketplace listings within a geographical radius.
 * Ensures the user is authenticated.
 * Takes user's location (latitude, longitude) and a radius.
 * Uses geospatial query logic to find listings within the specified radius.
 */
export const searchListingsByLocation = functions.https.onCall(async (data, context) => {
  // 1. Ensure the request is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to search listings by location.'
    );
  }

  const { latitude, longitude, radius } = data;

  // 2. Validate input data
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Valid latitude and longitude are required.'
    );
  }
  if (typeof radius !== 'number' || radius <= 0) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'A valid positive radius is required.'
    );
  }

  const db = admin.firestore();

  try {
    // 3. Implement geospatial query logic using geohashes.
    // Calculate the geohash of the center location and determine the range of geohashes that cover the specified radius.
    const center = [latitude, longitude]; // [lat, lng]
    // geofire-common uses kilometers for radius, convert meters to kilometers
    const radiusInKm = radius / 1000;
    const bounds = geofire.geohashQueryBounds(center, radiusInKm);

    const promises: Promise<FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>>[] = [];
    for (const b of bounds) {
      // Use Firestore collection group queries on the 'listings' collection
      // Query within the calculated geohash range.
      // Assumes listings have a 'geohash' field (string) indexed.
      const q = db.collection('listings')
        .orderBy('geohash')
        .startAt(b[0])
        .endAt(b[1]);

      promises.push(q.get());
    }

    // Collect all the results from the geohash range queries
    const snapshots = await Promise.all(promises);

    let matchingListings: any[] = [];
    for (const snapshot of snapshots) {
      // Perform a secondary, more precise distance check on the results
      for (const doc of snapshot.docs) {
        const data = doc.data();
        // Assumes listings also have a 'location' field (GeoPoint)
        if (data.location) {
          const distanceInKm = geofire.distanceBetween([data.location.latitude, data.location.longitude], center);
          const distanceInMeters = distanceInKm * 1000;
          if (distanceInMeters <= radius) {
            matchingListings.push({ id: doc.id, ...data });
          }
        }
      }
    }

    // 4. Return an array of matching listing data
    // Optional: Remove duplicate listings if a listing's geohash falls into multiple query bounds.
    // A simple way is to use a Set based on listing ID.
    const uniqueListingIds = new Set();
    const uniqueListings = matchingListings.filter(listing => {
        if (uniqueListingIds.has(listing.id)) {
            return false;
        } else {
            uniqueListingIds.add(listing.id);
            return true;
        }
    });

    return uniqueListings;

  } catch (error: any) {
    // 5. Implement error handling
    console.error('Error searching listings by location:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Unable to search listings by location',
      error.message
    );
  }
});

/**
 * Cloud Function to retrieve a specific order by ID.
 * Ensures the user is authenticated and is either the buyer, seller, or an admin for the order.
 * Retrieves the order document from the 'orders' collection.
 */
export const getOrder = functions.https.onCall(async (data, context) => {
  // 1. Ensure the request is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to view orders.'
    );
  }

  const userId = context.auth.uid;
  const { orderId } = data;

  if (!orderId || typeof orderId !== 'string') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'A valid order ID is required to view an order.'
    );
  }

  try {
    const orderRef = admin.firestore().collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();

    // Check if the order exists
    if (!orderDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Order not found.'
      );
    }

    const orderData = orderDoc.data();

    // 2. Ensure the user is authorized (buyer, seller, or admin)
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    const userData = userDoc.data();
    const isAdmin = userData?.roles?.includes('admin');

    if (orderData?.buyerId !== userId && orderData?.sellerId !== userId && !isAdmin) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'You do not have permission to view this order.'
      );
    }

    // Return the order data
    return { id: orderDoc.id, ...orderData };

  } catch (error: any) {
    console.error('Error getting order:', error);
    if (error.code) {
      throw error; // Rethrow HttpsErrors
    }
    throw new functions.https.HttpsError(
      'internal',
      'Unable to retrieve order',
      error.message
    );
  }
});

/**
 * Cloud Function to retrieve all orders associated with the authenticated user (as buyer or seller).
 * Ensures the user is authenticated.
 * Queries the 'orders' collection where either 'buyerId' or 'sellerId' matches the authenticated user's UID.
 */
export const getUserOrders = functions.https.onCall(async (data, context) => {
  // 1. Ensure the request is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to view your orders.'
    );
  }

  const userId = context.auth.uid;
  const db = admin.firestore();

  try {
    // Query for orders where the user is the buyer
    const buyerOrdersSnapshot = await db.collection('orders')
      .where('buyerId', '==', userId)
      .orderBy('createdAt', 'desc') // Order chronologically
      .get();

    // Query for orders where the user is the seller
    const sellerOrdersSnapshot = await db.collection('orders')
      .where('sellerId', '==', userId)
      .orderBy('createdAt', 'desc') // Order chronologically
      .get();

    // Combine and potentially de-duplicate (though unlikely with separate buyer/seller fields)
    const allOrders: any[] = [
      ...buyerOrdersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      ...sellerOrdersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
    ];

    // Return the combined array of order data
    return allOrders; // Frontend can handle sorting/filtering as needed

  } catch (error: any) {
    console.error('Error getting user orders:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Unable to retrieve user orders',
      error.message
    );
  }
});

/**
 * Cloud Function to update the status of an existing order.
 * Ensures the user is authenticated and authorized to update the status based on their role and the current status.
 * Updates the 'status' field in the order document.
 */
export const updateOrderStatus = functions.https.onCall(async (data, context) => {
  // 1. Ensure the request is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to update an order status.'
    );
  }

  const userId = context.auth.uid;
  const { orderId, status: newStatus } = data;

  if (!orderId || typeof orderId !== 'string') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'A valid order ID is required to update the status.'
    );
  }
  if (!newStatus || typeof newStatus !== 'string' || newStatus.trim() === '') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'A valid new status is required.'
    );
  }

  try {
    const orderRef = admin.firestore().collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Order not found.');
    }

    const orderData = orderDoc.data();

    // 2. Implement Authorization Logic:
    // Check if the user is the buyer, seller, or admin.
    // Implement logic based on the current status and the requested new status
    // to determine if the user is allowed to make this transition.
    // Example:
    // const userDoc = await admin.firestore().collection('users').doc(userId).get();
    // const userData = userDoc.data();
    // const isAdmin = userData?.roles?.includes('admin');
    // const isBuyer = orderData?.buyerId === userId;
    // const isSeller = orderData?.sellerId === userId;

    // if (!isAdmin && !isBuyer && !isSeller) {
    //    throw new functions.https.HttpsError('permission-denied', 'You do not have permission to update this order status.');
    // }
    // Add more granular checks based on status transitions (e.g., only seller can mark as 'shipped', only buyer can mark as 'received')

    // For now, a simplified check that the user is somehow involved or an admin:
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    const userData = userDoc.data();
    const isAdmin = userData?.roles?.includes('admin');

    if (orderData?.buyerId !== userId && orderData?.sellerId !== userId && !isAdmin) {
        throw new functions.https.HttpsError('permission-denied', 'You do not have permission to update this order status.');
    }

    // 3. Update the 'status' field in the order document
    await orderRef.update({
      status: newStatus,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 4. Trigger notifications or other actions based on the new status (e.g., notify buyer when shipped)

    // Return a success response
    return { id: orderId, status: newStatus, message: `Order status updated to ${newStatus} successfully!` };

  } catch (error: any) {
    console.error('Error updating order status:', error);
    if (error.code) {
      throw error; // Rethrow HttpsErrors
    }
    throw new functions.https.HttpsError(
      'internal',
      'Unable to update order status',
      error.message
    );
  }
});

/**
 * Cloud Function to create a new offer on a marketplace listing.
 * Ensures the user is authenticated and has the 'buyer' role (or equivalent).
 * Validates input data, checks if the listing is active, and saves the offer to Firestore.
 * Triggers a notification to the seller.
 */
export const createOffer = functions.https.onCall(async (data, context) => {
  // 1. Ensure the request is authenticated and the user has the necessary role
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to create an offer.'
    );
  }

  const userId = context.auth.uid;
  const { listingId, ...offerData } = data; // Extract listingId and offer details

  // Optional: Check for a custom claim or a field in the user document for role (e.g., 'buyer')
  const userDoc = await admin.firestore().collection('users').doc(userId).get();
  const userData = userDoc.data();

  if (!userData || !userData.roles || (!userData.roles.includes('buyer') && userData.stakeholder_type !== 'buyer')) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'You must have a buyer role to create an offer.'
    );
  }

  if (!listingId || typeof listingId !== 'string') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'A valid listing ID is required to create an offer.'
    );
  }

  // 2. Validate the offer data
  // Basic validation example - expand this based on your offer schema
  if (typeof offerData.proposedPrice !== 'number' || offerData.proposedPrice <= 0) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Offer must have a valid proposed price.'
    );
  }
  if (typeof offerData.proposedQuantity !== 'number' || offerData.proposedQuantity <= 0) {
     throw new functions.https.HttpsError(
       'invalid-argument',
       'Offer must have a valid proposed quantity.'
     );
   }
   // Add more validation rules here based on your offer schema

  // 3. Check if the listing is active and retrieve seller ID
  try {
    const listingRef = admin.firestore().collection('listings').doc(listingId);
    const listingDoc = await listingRef.get();

    if (!listingDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Listing not found.'
      );
    }

    const listingData = listingDoc.data();
    if (listingData?.status !== 'active') {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'This listing is not currently active.'
      );
    }

    const sellerId = listingData.sellerId;

    // Prevent user from making an offer on their own listing
    if (sellerId === userId) {
         throw new functions.https.HttpsError(
           'permission-denied',
           'You cannot make an offer on your own listing.'
         );
    }

    // 4. Use the Firebase Admin SDK to add a new document to the 'offers' collection
    const newOfferRef = await admin.firestore().collection('offers').add({
      ...offerData, // Spread the validated offer data
      listingId: listingId,
      buyerId: userId, // Include the buyer's UID
      sellerId: sellerId, // Include the seller's UID
      status: 'pending', // Set initial status
      createdAt: admin.firestore.FieldValue.serverTimestamp(), // Add server timestamp
      // Add other default fields as per your schema
    });

    // 5. Trigger a notification to the seller (Implement this using the Communication Service)
    try {
        await sendNotification({ // Using the imported function directly (assuming it's callable like this)
            targetUserIds: [sellerId],
            title: 'New Offer Received!',
            body: `You have a new offer on your listing: "${listingData.productName}"`,
            data: { offerId: newOfferRef.id, listingId: listingId, type: 'new_offer' }
        });
    //   senderId: userId,
    //   type: 'new_offer',
    //   message: `You have a new offer on your listing "${listingData.productName}"`,
    //   offerId: newOfferRef.id,
    //   createdAt: admin.firestore.FieldValue.serverTimestamp(),
    // });
    }
    } catch (notificationError) {
        console.error('Failed to send new offer notification to seller:', notificationError);
    }

    // 6. Return a success response with the new offer's ID
    return { id: newOfferRef.id, message: 'Offer created successfully!' };

  } catch (error: any) {
    console.error('Error creating offer:', error);
    if (error.code) {
      throw error; // Rethrow HttpsErrors
    }
    throw new functions.https.HttpsError(
      'internal',
      'Unable to create offer',
      error.message
    );
  }
});

/**
 * Cloud Function to retrieve offers for a specific marketplace listing.
 * Ensures the user is authenticated and is the seller of the listing (or an admin).
 * Retrieves offers from the 'offers' collection.
 */
export const getListingOffers = functions.https.onCall(async (data, context) => {
  // 1. Ensure the request is authenticated and authorized (user is seller or admin)
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to view offers.'
    );
  }

  const userId = context.auth.uid;
  const { listingId } = data;

  if (!listingId || typeof listingId !== 'string') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'A valid listing ID is required to view offers.'
    );
  }

  try {
    // Check if the authenticated user is the seller of the listing or has an admin role
    const listingDoc = await admin.firestore().collection('listings').doc(listingId).get();
    const listingData = listingDoc.data();

    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    const userData = userDoc.data();
    const isAdmin = userData?.roles?.includes('admin');

    if (!listingData || (listingData.sellerId !== userId && !isAdmin)) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'You do not have permission to view offers for this listing.'
      );
    }

    // 2. Use the Firebase Admin SDK to query the 'offers' collection for the listing
    const snapshot = await admin.firestore().collection('offers')
      .where('listingId', '==', listingId)
      .orderBy('createdAt', 'asc') // Order offers chronologically
      .get();

    // 3. Return an array of offer data
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  } catch (error: any) {
    console.error('Error getting listing offers:', error);
    if (error.code) {
      throw error; // Rethrow HttpsErrors
    }
    throw new functions.https.HttpsError(
      'internal',
      'Unable to retrieve listing offers',
      error.message
    );
  }
});

/**
 * Cloud Function to update an existing marketplace listing.
 * Ensures the user is authenticated and is the seller of the listing.
 * Validates input data and updates the listing in Firestore.
 */
export const updateListing = functions.https.onCall(async (data, context) => {
  // 1. Ensure the request is authenticated and authorized (user is the seller)
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to update a listing.'
    );
  }

  const userId = context.auth.uid;
  const { listingId, ...updatedData } = data; // Extract listingId and updated data

  if (!listingId || typeof listingId !== 'string') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'A valid listing ID is required to update a listing.'
    );
  }

  try {
    const listingRef = admin.firestore().collection('listings').doc(listingId);
    const listingDoc = await listingRef.get();

    // Check if the listing exists
    if (!listingDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Listing not found.'
      );
    }

    // Check if the authenticated user is the seller of the listing
    if (listingDoc.data()?.sellerId !== userId) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'You do not have permission to update this listing.'
      );
    }

    // 2. Validate the input data (basic validation)
    // Add more specific validation based on your schema
    if (updatedData.price !== undefined && (typeof updatedData.price !== 'number' || updatedData.price <= 0)) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'Listing price must be a positive number if provided.'
        );
    }
    // ... add validation for other fields in updatedData

    // 3. Use the Firebase Admin SDK to update the listing document
    await listingRef.update({
      ...updatedData, // Spread the updated data
      updatedAt: admin.firestore.FieldValue.serverTimestamp(), // Add update timestamp
    });

    // 4. Return a success response
    return { id: listingId, message: 'Listing updated successfully!' };

  } catch (error: any) {
    // 4. Implement error handling
    console.error('Error updating listing:', error);
    // Rethrow specific HttpsErrors or catch general errors
    if (error.code) {
      throw error;
    }
    throw new functions.https.HttpsError(
      'internal',
      'Unable to update listing',
      error.message
    );
  }
});

/**
 * Cloud Function to delete an existing marketplace listing.
 * Ensures the user is authenticated and is the seller of the listing.
 * Deletes the listing from Firestore.
 * Consideration: Deleting a listing with active offers requires careful handling
 * (e.g., cancelling offers, notifying buyers). This simplified version just deletes the listing.
 */
export const deleteListing = functions.https.onCall(async (data, context) => {
  // 1. Ensure the request is authenticated and authorized (user is the seller)
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to delete a listing.'
    );
  }

  const userId = context.auth.uid;
  const { listingId } = data; // Extract listingId

  if (!listingId || typeof listingId !== 'string') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'A valid listing ID is required to delete a listing.'
    );
  }

  try {
    const listingRef = admin.firestore().collection('listings').doc(listingId);
    const listingDoc = await listingRef.get();

    // Check if the listing exists
    if (!listingDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Listing not found.'
      );
    }

    // Check if the authenticated user is the seller of the listing
    if (listingDoc.data()?.sellerId !== userId) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'You do not have permission to delete this listing.'
      );
    }

    // 3. Use the Firebase Admin SDK to delete the listing document
    // Consideration: If there are subcollections or related documents (like offers),
    // you might need to handle those deletions as well, potentially using a recursive delete
    // Cloud Function or a separate process. This simple version just deletes the listing document itself.
    await listingRef.delete();

    // 4. Return a success response
    return { id: listingId, message: 'Listing deleted successfully!' };

  } catch (error: any) {
    // 4. Implement error handling
    console.error('Error deleting listing:', error);
    // Rethrow specific HttpsErrors or catch general errors
    if (error.code) {
      throw error;
    }
    throw new functions.https.HttpsError(
      'internal',
      'Unable to delete listing',
      error.message
    );
  }
});

/**
 * Cloud Function to retrieve a list of marketplace listings.
 * Allows filtering by product type, seller ID, and status, and supports pagination.
 * Ensures the user is authenticated to view listings.
 */
export const getListings = functions.https.onCall(async (data, context) => {
  // 1. Ensure the request is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to view listings.'
    );
  }

  // 2. Implement options to filter listings and 3. Implement basic pagination
  const {
    productType,
    sellerId,
    status = 'active', // Default status to active
    limit = 10, // Default limit for pagination
    startAfter, // Document snapshot or cursor to start after
    orderBy = 'createdAt', // Default ordering
    orderDirection = 'desc', // Default direction
  } = data;

  let query: admin.firestore.Query = admin.firestore().collection('listings');

  // Apply filters
  if (productType) {
    query = query.where('productType', '==', productType);
  }
  if (sellerId) {
    query = query.where('sellerId', '==', sellerId);
  }
  if (status) {
    query = query.where('status', '==', status);
  }

  // Apply ordering
  query = query.orderBy(orderBy, orderDirection);

  // Apply pagination
  if (startAfter) {
    // Assuming startAfter is a field value or document snapshot/reference
    query = query.startAfter(startAfter);
  }
  query = query.limit(limit);

  try {
    // 4. Use the Firebase Admin SDK to execute the query
    const snapshot = await query.get();

    // 6. Return an array of listing data
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error: any) {
    // 6. Implement error handling
    console.error('Error getting listings:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Unable to retrieve listings',
      error.message
    );
  }
});
