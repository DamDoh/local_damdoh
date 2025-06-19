import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK if it hasn't been initialized yet
if (admin.apps.length === 0) {
  admin.initializeApp();
}

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

  // Optional: Check for a custom claim or a field in the user document for role
  // For demonstration, let's assume a custom claim 'role' exists and must be 'seller'
  // In a real application, you might check a field in the user's Firestore document
  // const claims = context.auth.token;
  // if (!claims.role || claims.role !== 'seller') {
  //   throw new functions.https.HttpsError(
  //     'permission-denied',
  //     'You do not have permission to create a listing.'
  //   );
  // }

  // For simplicity in this example, we'll proceed assuming authentication is enough
  // or role check is handled elsewhere/less strictly initially.
  // A more robust check would involve fetching the user document and checking their 'stakeholder_type' or 'roles' field.
  const userDoc = await admin.firestore().collection('users').doc(userId).get();
  const userData = userDoc.data();

  if (!userData || !userData.roles || (!userData.roles.includes('seller') && userData.stakeholder_type !== 'farmer')) {
     throw new functions.https.HttpsError(
       'permission-denied',
       'You must have a seller or farmer role to create a listing.'
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
 * Cloud Function to delete an existing digital shopfront or service profile.
 * Ensures the user is authenticated and is the owner of the shop.
 * Deletes the shop document from Firestore and removes the reference from the user's document
 * using a batched write for atomicity.
 * Consideration: Deleting a shop with associated listings, offers, or other data
 * requires careful handling (e.g., deleting or unlinking associated data).
 * This simplified version just deletes the shop document and updates the user.
 */
export const deleteShop = functions.https.onCall(async (data, context) => {
  // 1. Ensure the request is authenticated and authorized (user owns the shop)
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to delete a shop profile.'
    );
  }

  const userId = context.auth.uid;
  const { shopId } = data; // Extract shopId

  if (!shopId || typeof shopId !== 'string') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'A valid shop ID is required to delete a shop profile.'
    );
  }

  const db = admin.firestore();
  const batch = db.batch();

  try {
    const shopRef = db.collection('shops').doc(shopId);
    const shopDoc = await shopRef.get();

    // Check if the shop exists and the authenticated user is the owner
    if (!shopDoc.exists || shopDoc.data()?.userId !== userId) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'You do not have permission to delete this shop profile.'
      );
    }

    // 2. Use the Firebase Admin SDK to delete the shop document
    batch.delete(shopRef);

    // 3. Remove the reference to the shop from the user's document
    // Assuming 'shopId' is a direct field on the user document
    const userRef = db.collection('users').doc(userId);
    // Use FieldValue.delete() if the field might not exist or you are using an array
    batch.update(userRef, {
      shopId: admin.firestore.FieldValue.delete(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Commit the batched write for atomicity
    await batch.commit();

    // 4. Return a success response
    return { id: shopId, message: 'Shop profile deleted successfully!' };

  } catch (error: any) {
    // Implement error handling
    console.error('Error deleting shop profile:', error);
    // Rethrow specific HttpsErrors or catch general errors
    if (error.code) {
      throw error;
    }
    throw new functions.https.HttpsError(
      'internal',
      'Unable to delete shop profile',
      error.message
    );
  }
});

/**
 * Cloud Function to retrieve a specific digital shopfront or service profile by ID.
 * Ensures the user is authenticated (assuming shops are publicly viewable by authenticated users).
 * Retrieves the shop document from the 'shops' collection.
 */
export const getShop = functions.https.onCall(async (data, context) => {
  // 1. Ensure the request is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to view shop profiles.'
    );
  }

  const { shopId } = data;

  if (!shopId || typeof shopId !== 'string') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'A valid shop ID is required to view a shop profile.'
    );
  }

  try {
    // Use the Firebase Admin SDK to retrieve the shop document
    const shopDoc = await admin.firestore().collection('shops').doc(shopId).get();

    // Check if the shop exists
    if (!shopDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Shop profile not found.'
      );
    }

    // Return the shop data
    return { id: shopDoc.id, ...shopDoc.data() };

  } catch (error: any) {
    // Implement error handling
    console.error('Error getting shop profile:', error);
    if (error.code) {
      throw error; // Rethrow HttpsErrors
    }
    throw new functions.https.HttpsError(
      'internal',
      'Unable to retrieve shop profile',
      error.message
    );
  }
});

/**
 * Cloud Function to retrieve all digital shopfronts/service profiles owned by the authenticated user.
 * Ensures the user is authenticated.
 * Queries the 'shops' collection where 'userId' matches the authenticated user's UID.
 */
export const getUserShops = functions.https.onCall(async (data, context) => {
  // 1. Ensure the request is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to view your shop profiles.'
    );
  }

  const userId = context.auth.uid;

  // Query the 'shops' collection for documents where 'userId' is the authenticated user's UID
  const snapshot = await admin.firestore().collection('shops').where('userId', '==', userId).get();

  // Return an array of shop data owned by the user
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
    // Example (conceptual):
    // await admin.firestore().collection('notifications').add({
    //   recipientId: sellerId,
    //   senderId: userId,
    //   type: 'new_offer',
    //   message: `You have a new offer on your listing "${listingData.productName}"`,
    //   offerId: newOfferRef.id,
    //   createdAt: admin.firestore.FieldValue.serverTimestamp(),
    // });

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
 * Cloud Function to create a new digital shopfront or service profile.
 * Ensures the user is authenticated.
 * Validates input data, creates a new document in the 'shops' collection,
 * and updates the user's document with a reference to the shop using a batched write for atomicity.
 */
export const createShop = functions.https.onCall(async (data, context) => {
  // 1. Ensure the request is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to create a shop profile.'
    );
  }

  const userId = context.auth.uid;
  const shopData = data; // Assuming data contains the shop profile details

  // 2. Validate the input shop data
  // Basic validation example - expand this based on your schema in docs/damdoh_architecture.md for the 'shops' collection
  if (!shopData.name || typeof shopData.name !== 'string' || shopData.name.trim() === '') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Shop profile must have a valid name.'
    );
  }
  // Add more validation rules based on your 'shops' schema (e.g., description, contactInfo)

  const db = admin.firestore();
  const batch = db.batch();

  try {
    // Create a new document in the 'shops' collection
    const newShopRef = db.collection('shops').doc(); // Auto-generate a new document ID
    batch.set(newShopRef, {
      ...shopData, // Spread the validated shop data
      userId: userId, // Link to the user
      createdAt: admin.firestore.FieldValue.serverTimestamp(), // Add server timestamp
      // Add other default fields as per your schema (e.g., status, offerings array/map)
    });

    // Update the user's document in the 'users' collection to add the new shop's ID
    const userRef = db.collection('users').doc(userId);
    batch.update(userRef, {
      shopId: newShopRef.id, // Assuming a user has one main shop profile. Use an array if multiple shops are possible per user.
      updatedAt: admin.firestore.FieldValue.serverTimestamp(), // Add update timestamp
    });

    // Commit the batched write for atomicity
    await batch.commit();

    // Return a success response with the new shop's ID
    return { id: newShopRef.id, message: 'Shop profile created successfully!' };

  } catch (error: any) {
    // Implement error handling
    console.error('Error creating shop profile:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Unable to create shop profile',
      error.message
    );
  }
});

/**
 * Cloud Function to update an existing digital shopfront or service profile.
 * Ensures the user is authenticated and is the owner of the shop.
 * Validates input data and updates the shop document in Firestore.
 */
export const updateShop = functions.https.onCall(async (data, context) => {
  // 1. Ensure the request is authenticated and authorized (user owns the shop)
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to update a shop profile.'
    );
  }

  const userId = context.auth.uid;
  const { shopId, ...updatedData } = data; // Extract shopId and updated data

  if (!shopId || typeof shopId !== 'string') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'A valid shop ID is required to update a shop profile.'
    );
  }

  try {
    const shopRef = admin.firestore().collection('shops').doc(shopId);
    const shopDoc = await shopRef.get();

    // Check if the shop exists and the authenticated user is the owner
    if (!shopDoc.exists || shopDoc.data()?.userId !== userId) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'You do not have permission to update this shop profile.'
      );
    }

    // 2. Validate the input data (optional, add specific validation based on your schema)
    // Example: if (updatedData.name !== undefined && typeof updatedData.name !== 'string' || updatedData.name.trim() === '') { ... }

    // 3. Use the Firebase Admin SDK to update the shop document
    await shopRef.update({
      ...updatedData, // Spread the updated data
      updatedAt: admin.firestore.FieldValue.serverTimestamp(), // Add update timestamp
    });

    // 4. Return a success response
    return { id: shopId, message: 'Shop profile updated successfully!' };

  } catch (error: any) {
    // Implement error handling
    console.error('Error updating shop profile:', error);
    // Rethrow specific HttpsErrors or catch general errors
    if (error.code) {
      throw error;
    }
    throw new functions.https.HttpsError(
      'internal',
      'Unable to update shop profile',
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