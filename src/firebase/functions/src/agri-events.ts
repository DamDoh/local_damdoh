
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

const checkAuth = (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
  }
  return context.auth.uid;
};

// Internal helper to validate an event coupon
const _validateEventCoupon = async (eventId: string, couponCode: string): Promise<{valid: boolean; message?: string; discountType?: 'fixed' | 'percentage'; discountValue?: number; docId?: string}> => {
    if (!couponCode) return { valid: false };
    
    const couponQuery = db.collection(`agri_events/${eventId}/coupons`)
        .where('code', '==', couponCode.toUpperCase())
        .limit(1);

    const snapshot = await couponQuery.get();
    if (snapshot.empty) {
        return { valid: false, message: "Coupon not found." };
    }
    
    const couponDoc = snapshot.docs[0];
    const couponData = couponDoc.data();

    // Check expiry
    if (couponData.expiresAt && couponData.expiresAt.toDate() < new Date()) {
        return { valid: false, message: "This coupon has expired." };
    }
    // Check usage limit
    if (couponData.usageLimit && couponData.usageCount >= couponData.usageLimit) {
        return { valid: false, message: "This coupon has reached its usage limit." };
    }
    
    return {
        valid: true,
        docId: couponDoc.id,
        discountType: couponData.discountType,
        discountValue: couponData.discountValue,
    };
};

// Callable function to create an event coupon
export const createEventCoupon = functions.https.onCall(async (data, context) => {
    const uid = checkAuth(context);
    const { eventId, code, discountType, discountValue, expiryDate, usageLimit } = data;

    if (!eventId || !code || !discountType || !discountValue) {
        throw new functions.https.HttpsError("invalid-argument", "Missing required coupon fields.");
    }
    
    const eventRef = db.collection("agri_events").doc(eventId);
    const eventDoc = await eventRef.get();
    if (!eventDoc.exists || eventDoc.data()?.organizerId !== uid) {
        throw new functions.https.HttpsError("permission-denied", "You are not authorized to create coupons for this event.");
    }

    const newCouponRef = eventRef.collection("coupons").doc();
    await newCouponRef.set({
        code: code.toUpperCase(),
        discountType,
        discountValue,
        expiresAt: expiryDate ? admin.firestore.Timestamp.fromDate(new Date(expiryDate)) : null,
        usageLimit: usageLimit || null,
        usageCount: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { success: true, couponId: newCouponRef.id };
});

export const getEventCoupons = functions.https.onCall(async (data, context) => {
    checkAuth(context);
    const { eventId } = data;
    if (!eventId) {
        throw new functions.https.HttpsError("invalid-argument", "An eventId must be provided.");
    }

    const eventRef = db.collection("agri_events").doc(eventId);
    const eventDoc = await eventRef.get();
    if (!eventDoc.exists || eventDoc.data()?.organizerId !== context.auth!.uid) {
        throw new functions.https.HttpsError("permission-denied", "You are not authorized to view coupons for this event.");
    }

    const couponsSnapshot = await eventRef.collection('coupons').orderBy('createdAt', 'desc').get();
    
    const coupons = couponsSnapshot.docs.map(doc => {
        const couponData = doc.data();
        return {
            id: doc.id,
            ...couponData,
            createdAt: (couponData.createdAt as admin.firestore.Timestamp)?.toDate?.().toISOString() || null,
            expiresAt: (couponData.expiresAt as admin.firestore.Timestamp)?.toDate?.().toISOString() || null,
        }
    });

    return { coupons };
});


export const createAgriEvent = functions.https.onCall(async (data, context) => {
    const uid = checkAuth(context);
    const { title, description, eventDate, eventTime, location, eventType, organizer, websiteLink, imageUrl, registrationEnabled, attendeeLimit, price, currency } = data;
    
    if (!title || !description || !eventDate || !location || !eventType) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required event fields.');
    }

    const newEventRef = db.collection('agri_events').doc();
    
    await newEventRef.set({
        title,
        description,
        eventDate: admin.firestore.Timestamp.fromDate(new Date(eventDate)),
        eventTime: eventTime || null,
        location,
        eventType,
        organizer: organizer || null,
        organizerId: uid,
        listerId: uid, // Can be different from organizer in some models
        websiteLink: websiteLink || null,
        imageUrl: imageUrl || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        registrationEnabled: registrationEnabled || false,
        attendeeLimit: attendeeLimit || null,
        registeredAttendeesCount: 0,
        price: price || 0,
        currency: currency || 'USD',
    });

    return { eventId: newEventRef.id, title: title };
});


export const getAgriEvents = functions.https.onCall(async (data, context) => {
    const snapshot = await db.collection('agri_events').orderBy('eventDate', 'asc').get();
    const events = snapshot.docs.map(doc => {
        const docData = doc.data();
        return {
            id: doc.id,
            ...docData,
            eventDate: (docData.eventDate as admin.firestore.Timestamp)?.toDate?.().toISOString(),
            createdAt: (docData.createdAt as admin.firestore.Timestamp)?.toDate?.().toISOString()
        };
    });
    return { events };
});


export const getEventDetails = functions.https.onCall(async (data, context) => {
    const { eventId } = data;
    if (!eventId) throw new functions.https.HttpsError('invalid-argument', 'Event ID is required.');
    
    const eventDoc = await db.collection('agri_events').doc(eventId).get();
    if (!eventDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Event not found.');
    }
    
    const eventData = eventDoc.data()!;
    let isRegistered = false;

    if (context.auth) {
        const attendeeDoc = await db.collection('agri_events').doc(eventId).collection('attendees').doc(context.auth.uid).get();
        isRegistered = attendeeDoc.exists;
    }

    return {
        ...eventData,
        id: eventDoc.id,
        eventDate: (eventData.eventDate as admin.firestore.Timestamp)?.toDate?.().toISOString(),
        createdAt: (eventData.createdAt as admin.firestore.Timestamp)?.toDate?.().toISOString(),
        isRegistered: isRegistered,
    };
});

export const registerForEvent = functions.https.onCall(async (data, context) => {
    const uid = checkAuth(context);
    const { eventId, couponCode } = data;
    if (!eventId) throw new functions.https.HttpsError('invalid-argument', 'Event ID is required.');
    
    const eventRef = db.collection('agri_events').doc(eventId);
    const attendeeRef = eventRef.collection('attendees').doc(uid);
    const userProfileDoc = await db.collection('users').doc(uid).get();

    if (!userProfileDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'User profile not found.');
    }
    const userProfile = userProfileDoc.data()!;

    return db.runTransaction(async (transaction) => {
        const eventDoc = await transaction.get(eventRef);
        if (!eventDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Event not found.');
        }

        const eventData = eventDoc.data()!;
        if (!eventData.registrationEnabled) {
            throw new functions.https.HttpsError('failed-precondition', 'Registration is not open for this event.');
        }

        const attendeeDoc = await transaction.get(attendeeRef);
        if (attendeeDoc.exists) {
            throw new functions.https.HttpsError('already-exists', 'You are already registered for this event.');
        }

        const currentAttendees = eventData.registeredAttendeesCount || 0;
        if (eventData.attendeeLimit && currentAttendees >= eventData.attendeeLimit) {
             throw new functions.https.HttpsError('resource-exhausted', 'This event is full.');
        }

        let finalPrice = eventData.price || 0;
        let discountApplied = 0;
        let couponValid = false;
        let couponDocId: string | undefined;
        
        if (couponCode && finalPrice > 0) {
            const couponResult = await _validateEventCoupon(eventId, couponCode);
            if(couponResult.valid) {
                couponValid = true;
                couponDocId = couponResult.docId;
                if (couponResult.discountType === 'fixed' && couponResult.discountValue) {
                    discountApplied = couponResult.discountValue;
                    finalPrice = Math.max(0, finalPrice - discountApplied);
                } else if (couponResult.discountType === 'percentage' && couponResult.discountValue) {
                    discountApplied = finalPrice * (couponResult.discountValue / 100);
                    finalPrice = finalPrice - discountApplied;
                }
            } else {
                 throw new functions.https.HttpsError('invalid-argument', couponResult.message || "Invalid coupon code.");
            }
        }
        
        // TODO: Integrate payment gateway call here if finalPrice > 0
        
        transaction.set(attendeeRef, {
            email: userProfile.email,
            displayName: userProfile.displayName,
            avatarUrl: userProfile.avatarUrl || null,
            registeredAt: admin.firestore.FieldValue.serverTimestamp(),
            checkedIn: false,
            checkedInAt: null
        });

        transaction.update(eventRef, {
            registeredAttendeesCount: admin.firestore.FieldValue.increment(1)
        });
        
        if (couponValid && couponDocId) {
            const couponRef = db.collection(`agri_events/${eventId}/coupons`).doc(couponDocId);
            transaction.update(couponRef, {
                usageCount: admin.firestore.FieldValue.increment(1)
            });
        }

        return { success: true, message: 'Successfully registered for the event.', finalPrice, discountApplied };
    });
});

export const checkInAttendee = functions.https.onCall(async (data, context) => {
    const organizerId = checkAuth(context);
    const { eventId, scannedUniversalId } = data;

    if (!eventId || !scannedUniversalId) {
        throw new functions.https.HttpsError("invalid-argument", "Event ID and scanned Universal ID are required.");
    }
    
    // 1. Verify the caller is the event organizer
    const eventRef = db.collection('agri_events').doc(eventId);
    const eventDoc = await eventRef.get();
    if (!eventDoc.exists || eventDoc.data()?.organizerId !== organizerId) {
        throw new functions.https.HttpsError("permission-denied", "You are not authorized to manage this event.");
    }

    // 2. Find the user by their Universal ID
    const usersRef = db.collection('users');
    const userQuery = await usersRef.where('universalId', '==', scannedUniversalId).limit(1).get();
    if (userQuery.empty) {
        throw new functions.https.HttpsError("not-found", "No user found with this Universal ID.");
    }
    const attendeeUserDoc = userQuery.docs[0];
    const attendeeUid = attendeeUserDoc.id;
    const attendeeName = attendeeUserDoc.data().displayName || 'Unknown Attendee';

    // 3. Check registration and update status
    const attendeeRef = eventRef.collection('attendees').doc(attendeeUid);
    return db.runTransaction(async (transaction) => {
        const attendeeDoc = await transaction.get(attendeeRef);
        if (!attendeeDoc.exists) {
            throw new functions.https.HttpsError("not-found", `${attendeeName} is not registered for this event.`);
        }
        
        const attendeeData = attendeeDoc.data()!;
        if (attendeeData.checkedIn) {
            throw new functions.https.HttpsError("already-exists", `${attendeeName} has already been checked in.`);
        }

        transaction.update(attendeeRef, {
            checkedIn: true,
            checkedInAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        return { success: true, message: `Successfully checked in ${attendeeName}.` };
    });
});
