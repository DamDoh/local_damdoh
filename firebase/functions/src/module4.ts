import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Assuming admin and db are initialized in index.ts or a shared file
// import { db } from './index';
import * as geofire from 'geofire-common';

// Import Module 8 and Module 9 functions
import { predictMarketPriceWithAI } from './module8'; // Assuming exported predictMarketPriceWithAI
import { recommendContentWithAI } from './module8'; // Assuming exported recommendation function from Module 8
const db = admin.firestore();

// Import helper function to get user role and user/organization document
// import { getRole, getUserDocument, getOrganizationDocumentByContactPerson } from './module2';


// Helper function to get user document (Assuming this is implemented elsewhere or as a placeholder)
async function getUserDocument(uid: string): Promise<FirebaseFirestore.DocumentSnapshot | null> {
    try {
        const userDoc = await db.collection('users').doc(uid).get();
        return userDoc.exists ? userDoc : null;
    } catch (error) {
        console.error('Error getting user document:', error);
        return null;
    }
}

// Helper function to get user role (Assuming this is implemented elsewhere or as a placeholder)
async function getRole(uid: string): Promise<string | null> {
    const userDoc = await getUserDocument(uid);
    return userDoc?.data()?.primaryRole || null;
}

// Helper function to find an organization linked to a contact person
async function getOrganizationDocumentByContactPerson(contactPersonUid: string): Promise<FirebaseFirestore.DocumentSnapshot | null> {
     try {
         const orgsSnapshot = await db.collection('organizations')
             .where('contactPersonRef', '==', db.collection('users').doc(contactPersonUid))
             .limit(1)
             .get();
         return orgsSnapshot.empty ? null : orgsSnapshot.docs[0];
     } catch (error) {
         console.error('Error getting organization by contact person:', error);
         return null;
     }
}

// Helper function to get the seller's DocumentReference (user or organization)
async function getSellerRef(uid: string, isOrganization: boolean = false): Promise<FirebaseFirestore.DocumentReference | null> {
    if (!isOrganization) {
        const userDoc = await getUserDocument(uid);
        return userDoc ? db.collection('users').doc(uid) : null;
    } else {
        const orgDoc = await getOrganizationDocumentByContactPerson(uid);
        return orgDoc ? db.collection('organizations').doc(orgDoc.id) : null;
    }
}

// Callable function to create a new listing
export const createListing = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to create a listing.');
    }

    const callerUid = context.auth.uid;
    const callerRole = await getRole(callerUid);

    // Define roles allowed to create listings
    const allowedRoles = ['farmer', 'processor', 'cooperative', 'admin', 'system']; // Include admin/system if they can create on behalf
    if (!callerRole || !allowedRoles.includes(callerRole)) {
        throw new functions.https.HttpsError('permission-denied', 'User does not have permission to create listings.');
    }

    // Assuming data contains listing details
    const { vtiId = null, productRef = null, price, currency, unit, quantityAvailable, description_en, description_local = {}, photos = [], status = 'active', geoLocation = null, isOrganizationSeller = false } = data; // isOrganizationSeller flag to indicate if seller is an organization

    // Basic validation
    if (price === undefined || typeof price !== 'number' || !currency || typeof currency !== 'string' || !unit || typeof unit !== 'string' || quantityAvailable === undefined || typeof quantityAvailable !== 'number' || !description_en || typeof description_en !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'Required listing details (price, currency, unit, quantityAvailable, description_en) are missing or invalid.');
    }
     if (vtiId && typeof vtiId !== 'string') {
         throw new functions.https.HttpsError('invalid-argument', 'If provided, vtiId must be a string.');
     }
     if (productRef && (typeof productRef !== 'object' || productRef.id === undefined || productRef.path === undefined)) {
          throw new functions.https.HttpsError('invalid-argument', 'If provided, productRef must be a valid DocumentReference object.');
     }
      if (!['active', 'inactive'].includes(status)) { // Allow initial status to be active or inactive
         throw new functions.https.HttpsError('invalid-argument', 'Invalid initial status.');
     }


    try {
        const sellerRef = await getSellerRef(callerUid, isOrganizationSeller);
        if (!sellerRef) {
             throw new functions.https.HttpsError('not-found', `Seller reference not found for user ${callerUid}.`);
        }


        const newListingRef = db.collection('listings').doc(); // Auto-generate document ID
        const listingId = newListingRef.id;

        await newListingRef.set({
            listingId: listingId,
            sellerRef: sellerRef, // Store as DocumentReference
            vtiId: vtiId,
            productRef: productRef ? db.doc(productRef.path) : null, // Convert path string to DocumentReference if needed
            price: price,
            currency: currency,
            unit: unit,
            quantityAvailable: quantityAvailable,
            description_en: description_en,
            description_local: description_local,
            photos: photos,
            status: status,
            geoLocation: geoLocation ? new admin.firestore.GeoPoint(geoLocation.latitude, geoLocation.longitude) : null, // Convert to GeoPoint if needed
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: null,
            // Add other fields from data as needed
        });

        console.log(`Listing created with ID: ${listingId} by seller ${callerUid}`);

        return { listingId, status: 'created' };

    } catch (error) {
        console.error(`Error creating listing for user ${callerUid}:`, error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Unable to create listing.', error);
    }
});

// Callable function to create a listing from a Module 1 batch VTI
export const createListingFromBatch = functions.https.onCall(async (data, context) => {
     if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to create a listing from batch.');
    }

    const callerUid = context.auth.uid;
    const callerRole = await getRole(callerUid);

    // Define roles allowed to create listings from batch
    const allowedRoles = ['farmer', 'processor', 'cooperative', 'admin', 'system']; // Include roles that handle batches
    if (!callerRole || !allowedRoles.includes(callerRole)) {
        throw new functions.https.HttpsError('permission-denied', 'User does not have permission to create listings from batch.');
    }

     const { vtiId, price, currency, description_en, description_local = {}, photos = [], status = 'active', geoLocation = null, isOrganizationSeller = false, // Flag to indicate if seller is an organization
              // Optional overrides for quantity, unit, productRef if needed
              quantityOverride = null, unitOverride = null, productRefOverride = null
            } = data;

    // Basic validation
     if (!vtiId || typeof vtiId !== 'string') {
         throw new functions.https.HttpsError('invalid-argument', 'The "vtiId" parameter is required and must be a string.');
     }
     if (price === undefined || typeof price !== 'number' || !currency || typeof currency !== 'string' || !description_en || typeof description_en !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'Required listing details (price, currency, description_en) are missing or invalid.');
    }
     if (!['active', 'inactive'].includes(status)) {
         throw new functions.https.HttpsError('invalid-argument', 'Invalid initial status.');
     }


    try {
         // 1. Fetch VTI details from Module 1's vti_registry
         const vtiDoc = await db.collection('vti_registry').doc(vtiId).get();
         if (!vtiDoc.exists) {
             throw new functions.https.HttpsError('not-found', `VTI with ID ${vtiId} not found in registry.`);
         }
         const vtiData = vtiDoc.data();

         // Ensure the VTI is of a type that can be listed (e.g., farm_batch, processed_product)
         const allowedVtiTypesForListing = ['farm_batch', 'processed_product'];
         if (!vtiData || !vtiData.type || !allowedVtiTypesForListing.includes(vtiData.type)) {
             throw new functions.https.HttpsError('failed-precondition', `VTI type '${vtiData?.type}' cannot be created as a listing.`);
         }


         // 2. Determine quantity and unit from VTI metadata or overrides
         const quantityAvailable = quantityOverride !== null ? quantityOverride : (vtiData.metadata?.quantity || null); // Assuming quantity is in metadata
         const unit = unitOverride !== null ? unitOverride : (vtiData.metadata?.unit || null); // Assuming unit is in metadata

         if (quantityAvailable === null || typeof quantityAvailable !== 'number' || unit === null || typeof unit !== 'string') {
              throw new functions.https.HttpsError('failed-precondition', 'Quantity and unit could not be determined from VTI metadata or overrides.');
         }

         // 3. Determine productRef from VTI metadata or overrides
         // This might involve looking up master_data based on VTI metadata (e.g., crop type)
         const productRef = productRefOverride !== null ? productRefOverride : (vtiData.metadata?.productRef || null); // Assuming productRef is in metadata

         // Optional: Fetch product details from master_data using productRef if needed for validation or more data


        // 4. Get seller's DocumentReference
        const sellerRef = await getSellerRef(callerUid, isOrganizationSeller);
        if (!sellerRef) {
             throw new functions.https.HttpsError('not-found', `Seller reference not found for user ${callerUid}.`);
        }


        // 5. Create the listing document
        const newListingRef = db.collection('listings').doc(); // Auto-generate document ID
        const listingId = newListingRef.id;

        await newListingRef.set({
            listingId: listingId,
            sellerRef: sellerRef, // Store as DocumentReference
            vtiId: vtiId, // Link to the VTI
            productRef: productRef ? db.doc(productRef.path) : null, // Convert path string to DocumentReference if needed
            price: price,
            currency: currency,
            unit: unit, // Use unit determined earlier
            quantityAvailable: quantityAvailable, // Use quantity determined earlier
            description_en: description_en,
            description_local: description_local,
            photos: photos,
            status: status,
            geoLocation: geoLocation ? new admin.firestore.GeoPoint(geoLocation.latitude, geoLocation.longitude) : null,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: null,
            // Add other fields from data as needed
        });

        console.log(`Listing created from VTI ${vtiId} with ID: ${listingId} by seller ${callerUid}`);

        // TODO: Optionally update the VTI document in Module 1 to indicate it's listed
        // e.g., await db.collection('vti_registry').doc(vtiId).update({ status: 'listed' });


        return { listingId, vtiId, status: 'created' };

    } catch (error) {
        console.error(`Error creating listing from batch ${vtiId} for user ${callerUid}:`, error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Unable to create listing from batch.', error);
    }
});


// Callable function to update an existing listing
export const updateListing = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to update a listing.');
    }

    const callerUid = context.auth.uid;
    const { listingId, ...updates } = data;

    if (!listingId || typeof listingId !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'The "listingId" parameter is required and must be a string.');
    }

    // Prevent updating sensitive or restricted fields
     const disallowedFields = ['listingId', 'sellerRef', 'vtiId', 'createdAt'];
     for (const field of disallowedFields) {
         if (updates.hasOwnProperty(field)) {
             throw new functions.https.HttpsError('invalid-argument', `Updating the '${field}' field is not allowed.`);
         }
     }
     // Allow updating status, but validate it
      if (updates.hasOwnProperty('status') && !['active', 'inactive', 'sold_out'].includes(updates.status)) {
         throw new functions.https.HttpsError('invalid-argument', 'Invalid status.');
     }


    try {
        const listingRef = db.collection('listings').doc(listingId);
        const listingDoc = await listingRef.get();

        if (!listingDoc.exists) {
            throw new functions.https.HttpsError('not-found', `Listing with ID ${listingId} not found.`);
        }

        const listingData = listingDoc.data();

        // Check if the caller is the seller of the listing
        if (!listingData || !listingData.sellerRef || listingData.sellerRef.id !== callerUid) {
             // Also need to check if the caller is the contact person of the organization seller
             let isAuthorizedSeller = false;
             if (listingData?.sellerRef) {
                 const sellerDoc = await listingData.sellerRef.get();
                 if (sellerDoc.exists) {
                     if (sellerDoc.ref.collection.id === 'users' && sellerDoc.id === callerUid) {
                         isAuthorizedSeller = true; // Direct user seller
                     } else if (sellerDoc.ref.collection.id === 'organizations') {
                         const orgContactPersonRef = sellerDoc.data()?.contactPersonRef;
                         if (orgContactPersonRef && orgContactPersonRef.id === callerUid) {
                             isAuthorizedSeller = true; // Contact person of organization seller
                         }
                     }
                 }
             }

            if (!isAuthorizedSeller) {
                 throw new functions.https.HttpsError('permission-denied', 'User is not authorized to update this listing.');
            }
        }

         // Add updatedAt timestamp
         updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();

         // Convert geoLocation to GeoPoint if present
         if (updates.hasOwnProperty('geoLocation') && updates.geoLocation !== null) {
              if (typeof updates.geoLocation.latitude !== 'number' || typeof updates.geoLocation.longitude !== 'number') {
                   throw new functions.https.HttpsError('invalid-argument', 'Invalid geoLocation format.');
              }
              updates.geoLocation = new admin.firestore.GeoPoint(updates.geoLocation.latitude, updates.geoLocation.longitude);
         }


        await listingRef.update(updates);

        console.log(`Listing ${listingId} updated by seller ${callerUid}`);

        return { listingId, status: 'updated' };

    } catch (error) {
        console.error(`Error updating listing ${listingId} for user ${callerUid}:`, error);
         if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Unable to update listing.', error);
    }
});


// Callable function to delete a listing
export const deleteListing = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to delete a listing.');
    }

    const callerUid = context.auth.uid;
    const { listingId } = data;

    if (!listingId || typeof listingId !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'The "listingId" parameter is required and must be a string.');
    }

    try {
        const listingRef = db.collection('listings').doc(listingId);
        const listingDoc = await listingRef.get();

        if (!listingDoc.exists) {
            throw new functions.https.HttpsError('not-found', `Listing with ID ${listingId} not found.`);
        }

         const listingData = listingDoc.data();

         // Check if the caller is the seller of the listing (similar logic as updateListing)
         let isAuthorizedSeller = false;
         if (listingData?.sellerRef) {
             const sellerDoc = await listingData.sellerRef.get();
             if (sellerDoc.exists) {
                 if (sellerDoc.ref.collection.id === 'users' && sellerDoc.id === callerUid) {
                     isAuthorizedSeller = true; // Direct user seller
                 } else if (sellerDoc.ref.collection.id === 'organizations') {
                     const orgContactPersonRef = sellerDoc.data()?.contactPersonRef;
                     if (orgContactPersonRef && orgContactPersonRef.id === callerUid) {
                         isAuthorizedSeller = true; // Contact person of organization seller
                     }
                 }
             }
         }

        if (!isAuthorizedSeller) {
             throw new functions.https.HttpsError('permission-denied', 'User is not authorized to delete this listing.');
        }


        await listingRef.delete();

        console.log(`Listing ${listingId} deleted by seller ${callerUid}`);

        // TODO: Optionally update the VTI document in Module 1 if the listing is deleted
        // e.g., change status back from 'listed' if applicable


        return { listingId, status: 'deleted' };

    } catch (error) {
        console.error(`Error deleting listing ${listingId} for user ${callerUid}:`, error);
         if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Unable to delete listing.', error);
    }
});

// Callable function for buyers to create a new order
export const createOrder = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to create an order.');
    }

    const buyerUid = context.auth.uid;
    const { listingId, quantity } = data;

    // 1. Validate input
    if (!listingId || typeof listingId !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'The "listingId" parameter is required and must be a string.');
    }
    if (quantity === undefined || typeof quantity !== 'number' || quantity <= 0) {
        throw new functions.https.HttpsError('invalid-argument', 'The "quantity" parameter is required and must be a positive number.');
    }

    try {
        // 2. Fetch the listing document and validate
        const listingRef = db.collection('listings').doc(listingId);
        const listingDoc = await listingRef.get();

        if (!listingDoc.exists) {
            throw new functions.https.HttpsError('not-found', `Listing with ID ${listingId} not found.`);
        }

        const listingData = listingDoc.data();

        if (!listingData || listingData.status !== 'active') {
            throw new functions.https.HttpsError('failed-precondition', `Listing ${listingId} is not active.`);
        }

        if (quantity > listingData.quantityAvailable) {
            throw new functions.https.HttpsError('failed-precondition', `Requested quantity (${quantity}) exceeds available quantity (${listingData.quantityAvailable}) for listing ${listingId}.`);
        }

        // Prevent buying from yourself (optional but recommended)
         const buyerRef = db.collection('users').doc(buyerUid); // Assume buyer is always a user for now
         if (listingData.sellerRef && listingData.sellerRef.id === buyerRef.id) {
             throw new functions.https.HttpsError('permission-denied', 'You cannot place an order for your own listing.');
         }
         // TODO: Add check if buyer is part of the selling organization


        // 3. Get buyer's reference
        // As per security rules, buyer is the authenticated user

        // 4. Get seller's reference from the listing data
        const sellerRef = listingData.sellerRef as FirebaseFirestore.DocumentReference;

        // 5. Calculate total amount
        const totalAmount = quantity * listingData.price;

        // 6. Create the order document
        const newOrderRef = db.collection('orders').doc(); // Auto-generate document ID
        const orderId = newOrderRef.id;

        const orderData = {
            orderId: orderId,
            buyerRef: buyerRef, // Document Reference to the buyer's user document
            sellerRef: sellerRef, // Document Reference to the seller (User or Organization)
            listingRef: listingRef, // Document Reference to the listing
            orderItems: [{ // Store details at the time of order
                listingId: listingId,
                vtiId: listingData.vtiId || null, // Link to VTI if present on listing
                quantity: quantity,
                pricePerUnit: listingData.price,
                unit: listingData.unit,
                productRef: listingData.productRef || null,
                description_en: listingData.description_en, // Store description for record
                // Add other relevant listing details copied at order time
            }],
            totalAmount: totalAmount,
            currency: listingData.currency,
            status: 'pending', // Initial status
            paymentStatus: 'pending', // Initial payment status
            shippingAddress: null, // Shipping address to be added during checkout/payment
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: null,
        };

        await newOrderRef.set(orderData);
        console.log(`New order created with ID: ${orderId} for buyer ${buyerUid}`);

        // Note: Decrementing listing quantity will happen in the processOrder trigger
        // Payment initiation will also happen in the processOrder trigger

        return { orderId, status: 'order_created', message: 'Order created successfully. Awaiting processing.' };

    } catch (error) {
        console.error(`Error creating order for buyer ${buyerUid}:`, error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Unable to create order.', error);
    }
});

// Callable function for buyers to create a new order
// (Integrated from orders.ts)
export const createOrder = functions.https.onCall(async (data, context) => {
    // Ensure the user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to create an order.');
    }

    const buyerUid = context.auth.uid;
    const { listingId, quantity } = data;

    // 1. Validate input
    if (!listingId || typeof listingId !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'The "listingId" parameter is required and must be a string.');
    }
    if (quantity === undefined || typeof quantity !== 'number' || quantity <= 0) {
        throw new functions.https.HttpsError('invalid-argument', 'The "quantity" parameter is required and must be a positive number.');
    }

    try {
        // Fetch the listing document and validate (placeholder)
        // In a real application, you would fetch the listing from Firestore
        console.log(`Fetching listing ${listingId} for order creation (placeholder)...`);
        const listingSnapshot = await db.collection('listings').doc(listingId).get();
        if (!listingSnapshot.exists || listingSnapshot.data()?.status !== 'active') {
             throw new functions.https.HttpsError('failed-precondition', `Listing ${listingId} not found or not active.`);
        }
        const listingData = listingSnapshot.data();

         if (quantity > listingData?.quantityAvailable) {
             throw new functions.https.HttpsError('failed-precondition', `Requested quantity (${quantity}) exceeds available quantity (${listingData?.quantityAvailable}).`);
         }

        // Placeholder for creating the order document
        console.log(`Creating order for listing ${listingId} with quantity ${quantity} by user ${buyerUid} (placeholder)...`);
         const newOrderRef = await db.collection('orders').add({
            buyerId: buyerUid, // Link to buyer user
            listingId: listingId, // Link to the listing
            quantity: quantity,
            status: 'pending', // Initial status
             createdAt: admin.firestore.FieldValue.serverTimestamp(),
         });

        return { orderId: newOrderRef.id, status: 'order_created' };

    } catch (error) {
        console.error(`Error creating order for buyer ${buyerUid}:`, error);
        if (error instanceof functions.https.HttpsError) {
             throw error;
        }
        throw new functions.https.HttpsError('internal', 'Unable to create order.', error);
    }
});

// Callable function for sellers or logistics partners to update an order's status
export const updateOrderStatus = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to update an order status.');
    }

    const callerUid = context.auth.uid;
    const { orderId, newStatus } = data;

    // 1. Validate input
    if (!orderId || typeof orderId !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'The "orderId" parameter is required and must be a string.');
    }
    if (!newStatus || typeof newStatus !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'The "newStatus" parameter is required and must be a string.');
    }

    // Validate that the newStatus is a valid order status
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'completed'];
    if (!validStatuses.includes(newStatus)) {
        throw new functions.https.HttpsError('invalid-argument', `Invalid new status: ${newStatus}. Valid statuses are: ${validStatuses.join(', ')}`);
    }

    try {
        const orderRef = db.collection('orders').doc(orderId);
        const orderDoc = await orderRef.get();

        if (!orderDoc.exists) {
            throw new functions.https.HttpsError('not-found', `Order with ID ${orderId} not found.`);
        }

        const orderData = orderDoc.data();

        if (!orderData) {
             throw new functions.https.HttpsError('internal', 'Could not retrieve order data.');
        }

        // 2. Authorization Check: Check if the caller is the seller of the order
        // TODO: Implement logic to check for authorized logistics partners as well.
        let isAuthorized = false;
        const sellerRef = orderData.sellerRef as FirebaseFirestore.DocumentReference;

        if (sellerRef.id === callerUid) {
            isAuthorized = true; // Direct user seller
        } else {
            // Check if the caller is the contact person of the seller organization
            const sellerDoc = await sellerRef.get();
            if (sellerDoc.exists && sellerDoc.ref.collection.id === 'organizations') {
                const contactPersonRef = sellerDoc.data()?.contactPersonRef as FirebaseFirestore.DocumentReference | null;
                if (contactPersonRef && contactPersonRef.id === callerUid) {
                    isAuthorized = true; // Contact person of the organization
                }
            }
            // TODO: Add check here for logistics partners linked to this order or seller
        }

        if (!isAuthorized) {
            throw new functions.https.HttpsError('permission-denied', 'User is not authorized to update this order status.');
        }

        // Prevent updating to the current status
        if (orderData.status === newStatus) {
             return { orderId, status: 'no_change', message: `Order status is already '${newStatus}'.` };
        }

        // Prevent certain status transitions (optional but good practice)
         // Example: Cannot go from 'completed' back to 'shipped'
         // if (orderData.status === 'completed') {
         //      throw new functions.https.HttpsError('failed-precondition', `Cannot change status from 'completed'.`);
         // }


        // 3. Update the order document's status
        console.log(`Updating order ${orderId} status from '${orderData.status}' to '${newStatus}'...`);
        await orderRef.update({
            status: newStatus,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(`Order ${orderId} status updated to '${newStatus}'.`);

        // 4. Trigger Traceability Events (Module 1) based on the new status
        if (newStatus === 'shipped' || newStatus === 'delivered') {
            console.log(`Triggering traceability events for order ${orderId} with status '${newStatus}'...`);

            // Determine the actor VTI for the traceability event
            // This is a placeholder; you need a reliable way to get the VTI of the user/organization performing the action
            // Example: Fetch the VTI from the user/organization document based on callerUid
            let actorVti = `actor-${callerUid}`; // Placeholder actor VTI
             try {
                 const callerDoc = await (isOrganization ? sellerRef.get() : db.collection('users').doc(callerUid).get());
                 actorVti = callerDoc.data()?.vtiId || `actor-${callerUid}`; // Assuming user/org doc has vtiId
             } catch (getActorVtiError) {
                 console.error("Could not get actor VTI for traceability event:", getActorVtiError);
                 // Continue without a proper actor VTI or handle as an error
             }


            const eventType = newStatus === 'shipped' ? 'TRANSPORTED' : 'DELIVERED';
            const payload = {
                orderId: orderId,
                status: newStatus,
                // Add other relevant shipment/delivery details to the payload
                 timestamp: admin.firestore.FieldValue.serverTimestamp(), // Timestamp of the event
            };

            // Iterate through order items and log traceability events for each VTI
            for (const item of orderData.orderItems) {
                if (item.vtiId) {
                    console.log(`Logging trace event '${eventType}' for VTI ${item.vtiId}...`);
                    // TODO: Call Module 1's logTraceEvent function
                    // Example: await logTraceEvent({ vtiId: item.vtiId, eventType: eventType, actorRef: actorVti, payload: payload }, context);
                     console.log(`logTraceEvent called for VTI ${item.vtiId} (placeholder).`);
                }
            }
        }

        return { orderId, status: 'status_updated', newStatus: newStatus };

    } catch (error) {
        console.error(`Error updating order status for order ${orderId} by user ${callerUid}:`, error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Unable to update order status.', error);
    }
});

// Retrieves a specific order document by ID.
// Requires authentication and authorization (user must be buyer, seller, or admin).
// (Integrated from orders.ts)
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

     // Determine seller ID: it could be a user ID or the contact person ID of an organization
     let sellerId = null;
     if (orderData?.sellerRef) {
         const sellerDoc = await (orderData.sellerRef as FirebaseFirestore.DocumentReference).get();
         if (sellerDoc.exists) {
             if (sellerDoc.ref.collection.id === 'users') {
                 sellerId = sellerDoc.id; // Direct user seller
             } else if (sellerDoc.ref.collection.id === 'organizations') {
                  const contactPersonRef = sellerDoc.data()?.contactPersonRef as FirebaseFirestore.DocumentReference | null;
                  sellerId = contactPersonRef?.id; // Contact person of organization seller
             }
         }
     }


    if (!isAdmin && orderData?.buyerRef?.id !== userId && sellerId !== userId) {
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

// Retrieves all orders related to the authenticated user (as buyer or seller).
// Requires authentication.
// (Integrated from orders.ts)
export const getUserOrders = functions.https.onCall(async (data, context) => {
  // Ensure the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The user is not authenticated.');
  }

  const userId = context.auth.uid;

  try {
      // Get the user's potential organization reference if they are a contact person
      const userOrgDoc = await getOrganizationDocumentByContactPerson(userId);
      const userOrgRef = userOrgDoc ? userOrgDoc.ref : null;


    // Query orders where the user is the buyer OR the seller (as user or organization contact)
    // Due to Firestore query limitations (no OR on different fields), we need multiple queries.
    const buyerOrdersSnapshot = await db.collection('orders')
      .where('buyerRef', '==', db.collection('users').doc(userId)) // Assuming buyer is always a user
      .orderBy('createdAt', 'desc') // Optional: order by creation time
      .get();

    const sellerOrdersSnapshot = await db.collection('orders')
      .where('sellerRef', '==', db.collection('users').doc(userId)) // Check if seller is a user
      .orderBy('createdAt', 'desc')
      .get();

      // Check if seller is an organization where the user is the contact person
      const organizationSellerOrdersSnapshot = userOrgRef ? await db.collection('orders')
          .where('sellerRef', '==', userOrgRef)
          .orderBy('createdAt', 'desc')
          .get() : null;

    // Merge and deduplicate the results
    const ordersMap = new Map<string, any>();
    buyerOrdersSnapshot.docs.forEach(doc => ordersMap.set(doc.id, { ...doc.data(), id: doc.id }));
    sellerOrdersSnapshot.docs.forEach(doc => ordersMap.set(doc.id, { ...doc.data(), id: doc.id }));
    if (organizationSellerOrdersSnapshot) {
         organizationSellerOrdersSnapshot.docs.forEach(doc => ordersMap.set(doc.id, { ...doc.data(), id: doc.id }));
    }

    // Convert map values to an array and optionally sort again if needed after merging
    const userOrders = Array.from(ordersMap.values());


// Callable function for buyers to submit a review for a completed order
export const submitReview = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to submit a review.');
    }

    const callerUid = context.auth.uid;
    const { orderId, rating, comment = null } = data; // comment is optional

    // 1. Validate input
    if (!orderId || typeof orderId !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'The "orderId" parameter is required and must be a string.');
    }
    if (rating === undefined || typeof rating !== 'number' || rating < 1 || rating > 5) {
        throw new functions.https.HttpsError('invalid-argument', 'The "rating" parameter is required and must be a number between 1 and 5.');
    }
    if (comment !== null && typeof comment !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'The "comment" parameter must be a string or null.');
    }

    try {
        // 2. Fetch the order document and validate
        const orderRef = db.collection('orders').doc(orderId);
        const orderDoc = await orderRef.get();

        if (!orderDoc.exists) {
            throw new functions.https.HttpsError('not-found', `Order with ID ${orderId} not found.`);
        }

        const orderData = orderDoc.data();

        if (!orderData) {
             throw new functions.https.HttpsError('internal', 'Could not retrieve order data.');
        }

        // 3. Authorization Check: Verify that the caller is the buyer of this order
        const buyerRef = orderData.buyerRef as FirebaseFirestore.DocumentReference;
        if (buyerRef.id !== callerUid) {
            throw new functions.https.HttpsError('permission-denied', 'User is not the buyer of this order and cannot submit a review.');
        }

        // Optional: Check if the order status is 'completed' before allowing review
        // if (orderData.status !== 'completed') {
        //     throw new functions.https.HttpsError('failed-precondition', 'Reviews can only be submitted for completed orders.');
        // }

        // 4. Create the review document
        const newReviewRef = db.collection('reviews').doc(); // Auto-generate document ID
        await newReviewRef.set({
            reviewId: newReviewRef.id,
            orderRef: orderRef, // Document Reference to the order
            reviewerRef: buyerRef, // Document Reference to the buyer (reviewer)
            sellerRef: orderData.sellerRef, // Copy sellerRef from order for easier querying
            rating: rating,
            comment: comment,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(`Review submitted for order ${orderId} by buyer ${callerUid}`);

        // TODO: Optionally update the order document to indicate that a review has been submitted
        // e.g., orderRef.update({ reviewSubmitted: true });

        // TODO: Optionally calculate average rating for the seller (can be a separate triggered function)

        return { reviewId: newReviewRef.id, status: 'review_submitted' };

    } catch (error) {
        console.error(`Error submitting review for order ${orderId} by user ${callerUid}:`, error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Unable to submit review.', error);
    }
});


// Callable function to generate marketplace listing recommendations using Module 8
export const generateMarketRecommendations = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        // Recommendations can potentially be shown to unauthenticated users
        // based on general trends or browsing history (if tracked anonymously),
        // but personalized recommendations require authentication.
        console.log('Generating recommendations for unauthenticated user (limited scope).');
        // For unauthenticated users, you might return popular or trending listings.
        // TODO: Implement fetching popular/trending listings for unauthenticated users.
        return { recommendations: [], message: 'Login for personalized recommendations.' };
    }

    const callerUid = context.auth.uid;
    console.log(`Generating recommendations for user: ${callerUid}`);

    // Assuming data contains optional context like current page, search query, etc.
    const { context: recommendationContext = {} } = data;

    try {
        // 1. Fetch relevant user data and history from Module 2 and Module 4 collections
        // - User profile data (location, preferences if stored)
        // - Past orders (`orders` collection where buyerRef is callerUid)
        // - Viewed listings (if tracking is implemented, e.g., in a user_activity collection)
        // console.log(`Fetching user history for ${callerUid} (placeholder)...`);
        const userHistory = {
            // Example structure:
            // pastOrders: [], // Fetch order documents
            // viewedListings: [], // Fetch viewed listing IDs/details
            // userLocation: null, // Get from user profile
        };

        // 2. Fetch broader market trends (optional, could be pre-calculated)
        // console.log('Fetching market trends (placeholder)...');
        const marketTrends = {};

        // 3. Send data to Module 8's AI models (Placeholder for interaction)
        console.log('Sending data to Module 8 for recommendation generation (placeholder)...');
        // TODO: Call a callable function or interact with an API endpoint provided by Module 8.
        // The input to Module 8 would be `userHistory`, `marketTrends`, and `recommendationContext`.
        // Example: const module8Response = await callModule8AI({ userId: callerUid, history: userHistory, trends: marketTrends, context: recommendationContext });
        // Module 8 would process this data and return a list of recommended listing IDs or data.

        // Simulate a response from Module 8
        const recommendedListingIds = ['listing123', 'listing456', 'listing789']; // Placeholder IDs
        console.log(`Received recommendations from Module 8 (placeholder): ${recommendedListingIds.join(', ')}`);

        // 4. Optionally fetch the full listing data for the recommended IDs
        // This is often better done on the frontend to reduce Cloud Function load,
        // but can be done here if needed.
         const recommendedListings = [];
         // if (recommendedListingIds.length > 0) {
         //     const listingsSnapshot = await db.collection('listings')
         //         .where(admin.firestore.FieldPath.documentId(), 'in', recommendedListingIds)
         //         .get();
         //     recommendedListings = listingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
         //      console.log(`Fetched details for ${recommendedListings.length} recommended listings.`);
         // }


        // 5. Return the recommendations to the frontend
        // Return just IDs if frontend fetches full data, or return full data if fetched here.
        return { recommendations: recommendedListingIds, message: 'Personalized recommendations generated.' };
        // return { recommendations: recommendedListings, message: 'Personalized recommendations generated.' };
    } catch (error) {
        console.error(`Error generating recommendations for user ${callerUid}:`, error);
        // Return an empty list or a default set of recommendations on error
        return { recommendations: [], message: 'Could not generate personalized recommendations at this time.' };
   }
});


/**
 * Searches for marketplace listings within a specified geographical radius.
 * Requires authentication for personalized results, but could allow limited unauthenticated search.
 * (Integrated and merged from geolocation.ts)
 *
 * Request body should contain:
 * - latitude: number (Center latitude for the search)
 * - longitude: number (Center longitude for the search)
 * - radiusInKm: number (Radius in kilometers for the search)
 * - optional: filter by product, seller, etc.
 */
export const searchListingsByLocation = functions.https.onCall(async (data, context) => {
    // Authentication is required for personalized results or if listings contain sensitive info.
    // For public listings, authentication might be optional with rate limiting.
    // if (!context.auth) {
    //     throw new functions.https.HttpsError('unauthenticated', 'Authentication is required to search listings by location.');
    // }

    const { latitude, longitude, radiusInKm, ...filters } = data; // Include filters for future use

    // 1. Validate the input.
    if (
        typeof latitude !== 'number' ||
        typeof longitude !== 'number' ||
        typeof radiusInKm !== 'number' ||
        radiusInKm <= 0
    ) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'The function must be called with valid latitude, longitude, and a positive radiusInKm.'
        );
    }

    const center = [latitude, longitude];
    const radiusInMeters = radiusInKm * 1000; // Convert km to meters

    // 2. Use geofire-common to calculate query bounds.
    const bounds = geofire.geohashQueryBounds(center, radiusInMeters);

    const promises = bounds.map(bound => {
        return db.collection('listings')
            .orderBy('geohash') // Assuming listings have a 'geohash' field
            .startAt(bound[0])
            .endAt(bound[1])
            .get();
    });

    // Collect all the query results
    const snapshots = await Promise.all(promises);

    const matchingListings: FirebaseFirestore.DocumentData[] = [];
    snapshots.forEach(snapshot => {
        snapshot.docs.forEach(doc => {
            const listingData = doc.data();
            // 3. Calculate the actual distance for each document.
            const distance = geofire.distanceBetween([listingData.geoLocation.latitude, listingData.geoLocation.longitude], center);

            // 4. Filter results within the specified radius (distance check confirms results from geohash bounds are within the circle).
            if (distance <= radiusInMeters && listingData.status === 'active') { // Only return active listings
                matchingListings.push({ id: doc.id, distance: distance / 1000, ...listingData }); // Return distance in km
            }
        });
    });

    // 5. Sort the filtered results by distance.
    matchingListings.sort((a, b) => a.distance - b.distance);

    // 6. Return an array of matching listing data.
    return matchingListings;
});