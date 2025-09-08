

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { getFunctions, httpsCallable } from 'firebase-functions/v1';

const db = admin.firestore();

const checkAuth = (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
  }
  return context.auth.uid;
};

// =================================================================
// BOOKING MANAGEMENT
// =================================================================

export const bookAgroTourismService = functions.https.onCall(async (data, context) => {
    const uid = checkAuth(context);
    const { itemId, bookingDetails } = data; // bookingDetails could contain dates, number of people, etc.
    if (!itemId) throw new functions.https.HttpsError('invalid-argument', 'An Item ID for the service is required.');

    const itemRef = db.collection('marketplaceItems').doc(itemId);
    const bookingRef = itemRef.collection('bookings').doc(uid);
    
    const getProfile = httpsCallable(getFunctions(), 'user-getProfileByIdFromDB');
    const userProfileResult = await getProfile({ uid });
    const userProfileDoc = userProfileResult.data as any;
    
    if (!userProfileDoc) {
        throw new functions.https.HttpsError('not-found', 'User profile not found.');
    }

    return db.runTransaction(async (transaction) => {
        const itemDoc = await transaction.get(itemRef);
        if (!itemDoc.exists || itemDoc.data()?.listingType !== 'Service' || itemDoc.data()?.category !== 'agri-tourism-services') {
            throw new functions.https.HttpsError('not-found', 'Valid Agro-Tourism service not found.');
        }

        const bookingDoc = await transaction.get(bookingRef);
        if (bookingDoc.exists) {
            throw new functions.https.HttpsError('already-exists', 'You have already booked this service.');
        }

        // TODO: Add payment processing logic here if the service has a price.
        
        transaction.set(bookingRef, {
            ...bookingDetails,
            userId: uid,
            displayName: userProfileDoc.displayName,
            avatarUrl: userProfileDoc.avatarUrl || null,
            bookedAt: admin.firestore.FieldValue.serverTimestamp(),
            checkedIn: false,
            checkedInAt: null
        });
        
        // Optionally, increment a booking counter on the item itself
        transaction.update(itemRef, {
            bookingsCount: admin.firestore.FieldValue.increment(1)
        });
        
        return { success: true, message: 'Successfully booked the Agro-Tourism service.' };
    });
});

export const checkInAgroTourismBooking = functions.https.onCall(async (data, context) => {
    const callerId = checkAuth(context);
    const { itemId, attendeeUid } = data;

    if (!itemId || !attendeeUid) {
        throw new functions.https.HttpsError("invalid-argument", "Item ID and Attendee UID are required.");
    }
    
    const itemRef = db.collection('marketplaceItems').doc(itemId);
    const itemDoc = await itemRef.get();
    const itemData = itemDoc.data();
    if (!itemDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Service not found.");
    }

    const organizerId = itemData?.sellerId;
    const staffRef = itemRef.collection('staff').doc(callerId);
    const staffDoc = await staffRef.get();
    
    if (organizerId !== callerId && !staffDoc.exists) {
        throw new functions.https.HttpsError("permission-denied", "You are not authorized to check-in guests for this service.");
    }

    const guestUserDoc = await db.collection('users').doc(attendeeUid).get();
    if (!guestUserDoc.exists) {
        throw new functions.https.HttpsError("not-found", "No user found with this ID.");
    }
    const guestName = guestUserDoc.data()?.displayName || 'Unknown Guest';

    const bookingRef = itemRef.collection('bookings').doc(attendeeUid);
    return db.runTransaction(async (transaction) => {
        const bookingDoc = await transaction.get(bookingRef);
        if (!bookingDoc.exists) {
            throw new functions.https.HttpsError("not-found", `${guestName} does not have a booking for this service.`);
        }
        
        const bookingData = bookingDoc.data()!;
        if (bookingData.checkedIn) {
            throw new functions.https.HttpsError("already-exists", `${guestName} has already been checked in.`);
        }

        transaction.update(bookingRef, {
            checkedIn: true,
            checkedInAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        return { success: true, message: `Successfully checked in ${guestName}.` };
    });
});


// =================================================================
// STAFF MANAGEMENT FUNCTIONS
// =================================================================

export const addAgroTourismStaff = functions.https.onCall(async (data, context) => {
    const operatorId = checkAuth(context);
    const { itemId, staffUserId, staffDisplayName, staffAvatarUrl } = data;
    if (!itemId || !staffUserId) {
        throw new functions.https.HttpsError("invalid-argument", "Service Item ID and Staff User ID are required.");
    }
    
    const itemRef = db.collection('marketplaceItems').doc(itemId);
    const itemDoc = await itemRef.get();
    if (!itemDoc.exists || itemDoc.data()?.sellerId !== operatorId) {
        throw new functions.https.HttpsError("permission-denied", "You are not authorized to add staff to this service.");
    }

    const staffRef = itemRef.collection('staff').doc(staffUserId);
    await staffRef.set({
        displayName: staffDisplayName || "Unknown Staff",
        avatarUrl: staffAvatarUrl || null,
        addedAt: admin.firestore.FieldValue.serverTimestamp(),
        addedBy: operatorId,
    });

    return { success: true, message: `${staffDisplayName || 'User'} has been added as staff.` };
});


export const getAgroTourismStaff = functions.https.onCall(async (data, context) => {
    const operatorId = checkAuth(context);
    const { itemId } = data;
    if (!itemId) {
        throw new functions.https.HttpsError("invalid-argument", "Item ID is required.");
    }

    const itemRef = db.collection('marketplaceItems').doc(itemId);
    const itemDoc = await itemRef.get();
    if (!itemDoc.exists || itemDoc.data()?.sellerId !== operatorId) {
        throw new functions.https.HttpsError("permission-denied", "You are not authorized to view staff for this service.");
    }
    
    const staffSnapshot = await itemRef.collection('staff').get();
    const staffList = staffSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    }));

    return { staff: staffList };
});


export const removeAgroTourismStaff = functions.https.onCall(async (data, context) => {
    const operatorId = checkAuth(context);
    const { itemId, staffUserId } = data;

    if (!itemId || !staffUserId) {
        throw new functions.https.HttpsError("invalid-argument", "Item ID and Staff User ID are required.");
    }
    
    const itemRef = db.collection('marketplaceItems').doc(itemId);
    const itemDoc = await itemRef.get();
    if (!itemDoc.exists || itemDoc.data()?.sellerId !== operatorId) {
        throw new functions.https.HttpsError("permission-denied", "You are not authorized to remove staff from this service.");
    }

    const staffRef = itemRef.collection('staff').doc(staffUserId);
    await staffRef.delete();
    
    return { success: true, message: "Staff member has been removed." };
});

export const getAgroTourismBookings = functions.https.onCall(async (data, context) => {
    const operatorId = checkAuth(context);
    const { itemId } = data;
    if (!itemId) {
        throw new functions.https.HttpsError("invalid-argument", "Item ID is required.");
    }

    const itemRef = db.collection('marketplaceItems').doc(itemId);
    const itemDoc = await itemRef.get();
    if (!itemDoc.exists || itemDoc.data()?.sellerId !== operatorId) {
        throw new functions.https.HttpsError("permission-denied", "You are not authorized to view bookings for this service.");
    }
    
    const bookingsSnapshot = await itemRef.collection('bookings').orderBy('bookedAt', 'desc').get();
    const bookingsList = bookingsSnapshot.docs.map(doc => {
         const data = doc.data();
        return {
            id: doc.id,
            ...data,
            bookedAt: (data.bookedAt as admin.firestore.Timestamp)?.toDate?.().toISOString() || null,
            checkedInAt: (data.checkedInAt as admin.firestore.Timestamp)?.toDate?.().toISOString() || null,
        }
    });

    return { bookings: bookingsList };
});
