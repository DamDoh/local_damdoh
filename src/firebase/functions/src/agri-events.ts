
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { AgriEventSchema } from "@/lib/schemas"; // Import from the new single source of truth

const db = admin.firestore();

const checkAuth = (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "error.unauthenticated");
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
        return { valid: false, message: "error.coupon.notFound" };
    }
    
    const couponDoc = snapshot.docs[0];
    const couponData = couponDoc.data();

    // Check expiry
    if (couponData.expiresAt && couponData.expiresAt.toDate() < new Date()) {
        return { valid: false, message: "error.coupon.expired" };
    }
    // Check usage limit
    if (couponData.usageLimit && couponData.usageCount >= couponData.usageLimit) {
        return { valid: false, message: "error.coupon.limitReached" };
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
        throw new functions.https.HttpsError("invalid-argument", "error.form.missingFields");
    }
    
    const eventRef = db.collection("agri_events").doc(eventId);
    const eventDoc = await eventRef.get();
    if (!eventDoc.exists || eventDoc.data()?.organizerId !== uid) {
        throw new functions.https.HttpsError("permission-denied", "error.permissionDenied");
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
        throw new functions.https.HttpsError("invalid-argument", "error.eventId.required");
    }

    const eventRef = db.collection("agri_events").doc(eventId);
    const eventDoc = await eventRef.get();
    if (!eventDoc.exists || eventDoc.data()?.organizerId !== context.auth!.uid) {
        throw new functions.https.HttpsError("permission-denied", "error.permissionDenied");
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
    
    const validation = AgriEventSchema.omit({dataAiHint: true}).safeParse(data); // Omit client-side only fields
    if (!validation.success) {
      throw new functions.https.HttpsError('invalid-argument', 'error.form.invalidData', validation.error.format());
    }

    const { title, description, eventDate, eventTime, location, eventType, organizer, websiteLink, imageUrl, registrationEnabled, attendeeLimit, price, currency } = validation.data;
    
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
        listerId: uid,
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
    if (!eventId) throw new functions.https.HttpsError('invalid-argument', 'error.eventId.required');
    
    const eventDoc = await db.collection('agri_events').doc(eventId).get();
    if (!eventDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'error.event.notFound');
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
    if (!eventId) throw new functions.https.HttpsError('invalid-argument', 'error.eventId.required');
    
    const eventRef = db.collection('agri_events').doc(eventId);
    const attendeeRef = eventRef.collection('attendees').doc(uid);
    const userProfileDoc = await db.collection('users').doc(uid).get();

    if (!userProfileDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'error.user.notFound');
    }
    const userProfile = userProfileDoc.data()!;

    return db.runTransaction(async (transaction) => {
        const eventDoc = await transaction.get(eventRef);
        if (!eventDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'error.event.notFound');
        }

        const eventData = eventDoc.data()!;
        if (!eventData.registrationEnabled) {
            throw new functions.https.HttpsError('failed-precondition', 'error.event.registrationClosed');
        }

        const attendeeDoc = await transaction.get(attendeeRef);
        if (attendeeDoc.exists) {
            throw new functions.https.HttpsError('already-exists', 'error.event.alreadyRegistered');
        }

        const currentAttendees = eventData.registeredAttendeesCount || 0;
        if (eventData.attendeeLimit && currentAttendees >= eventData.attendeeLimit) {
             throw new functions.https.HttpsError('resource-exhausted', 'error.event.full');
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
                 throw new functions.https.HttpsError('invalid-argument', couponResult.message || "error.coupon.invalid");
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
    const callerId = checkAuth(context);
    const { eventId, attendeeUid } = data;

    if (!eventId || !attendeeUid) {
        throw new functions.https.HttpsError("invalid-argument", "error.form.missingFields");
    }
    
    const eventRef = db.collection('agri_events').doc(eventId);
    const eventDoc = await eventRef.get();
    const eventData = eventDoc.data();
    if (!eventDoc.exists) {
        throw new functions.https.HttpsError("not-found", "error.event.notFound");
    }
    
    const organizerId = eventData?.organizerId;
    const staffRef = db.collection(`agri_events/${eventId}/staff`).doc(callerId);
    const staffDoc = await staffRef.get();

    if (organizerId !== callerId && !staffDoc.exists) {
        throw new functions.https.HttpsError("permission-denied", "error.permissionDenied");
    }

    const attendeeUserDoc = await db.collection('users').doc(attendeeUid).get();
    if (!attendeeUserDoc.exists) {
        throw new functions.https.HttpsError("not-found", "error.user.notFound");
    }
    const attendeeName = attendeeUserDoc.data()?.displayName || 'Unknown Attendee';

    const attendeeRef = eventRef.collection('attendees').doc(attendeeUid);
    return db.runTransaction(async (transaction) => {
        const attendeeDoc = await transaction.get(attendeeRef);
        if (!attendeeDoc.exists) {
            throw new functions.https.HttpsError("not-found", "error.event.notRegistered");
        }
        
        const attendeeData = attendeeDoc.data()!;
        if (attendeeData.checkedIn) {
            throw new functions.https.HttpsError("already-exists", "error.event.alreadyCheckedIn");
        }

        transaction.update(attendeeRef, {
            checkedIn: true,
            checkedInAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        return { success: true, message: `Successfully checked in ${attendeeName}.` };
    });
});

export const getEventAttendees = functions.https.onCall(async (data, context) => {
    const uid = checkAuth(context);
    const { eventId } = data;
    if (!eventId) {
        throw new functions.https.HttpsError("invalid-argument", "error.eventId.required");
    }

    const eventRef = db.collection("agri_events").doc(eventId);
    const eventDoc = await eventRef.get();
    if (!eventDoc.exists || eventDoc.data()?.organizerId !== uid) {
        throw new functions.https.HttpsError("permission-denied", "error.permissionDenied");
    }

    const attendeesSnapshot = await eventRef.collection('attendees').orderBy('registeredAt', 'desc').get();
    
    const attendees = attendeesSnapshot.docs.map(doc => {
        const attendeeData = doc.data();
        return {
            id: doc.id,
            ...attendeeData,
            registeredAt: (attendeeData.registeredAt as admin.firestore.Timestamp)?.toDate?.().toISOString() || null,
            checkedInAt: (attendeeData.checkedInAt as admin.firestore.Timestamp)?.toDate?.().toISOString() || null,
        }
    });

    return { attendees };
});

// STAFF MANAGEMENT FUNCTIONS

export const searchUsersForStaffing = functions.https.onCall(async (data, context) => {
    checkAuth(context);
    const { query } = data;
    if (!query || typeof query !== 'string' || query.length < 3) {
        throw new functions.https.HttpsError("invalid-argument", "A search query of at least 3 characters is required.");
    }
    
    const usersRef = db.collection('users');
    const queryLower = query.toLowerCase();
    
    const nameQuery = usersRef
        .where('displayName', '>=', query)
        .where('displayName', '<=', query + '\uf8ff')
        .limit(10);
        
    const emailQuery = usersRef.where('email', '==', queryLower).limit(10);

    const [nameSnapshot, emailSnapshot] = await Promise.all([nameQuery.get(), emailQuery.get()]);
    
    const results = new Map();
    
    const processSnapshot = (snapshot: admin.firestore.QuerySnapshot) => {
        snapshot.forEach(doc => {
            if (!results.has(doc.id)) {
                const data = doc.data();
                results.set(doc.id, {
                    id: doc.id,
                    displayName: data.displayName,
                    email: data.email,
                    avatarUrl: data.avatarUrl || null,
                });
            }
        });
    };
    
    processSnapshot(nameSnapshot);
    processSnapshot(emailSnapshot);
    
    return { users: Array.from(results.values()) };
});


export const addEventStaff = functions.https.onCall(async (data, context) => {
    const organizerId = checkAuth(context);
    const { eventId, staffUserId, staffDisplayName, staffAvatarUrl } = data;
    if (!eventId || !staffUserId) {
        throw new functions.https.HttpsError("invalid-argument", "Event ID and Staff User ID are required.");
    }
    
    const eventRef = db.collection('agri_events').doc(eventId);
    const eventDoc = await eventRef.get();
    if (!eventDoc.exists || eventDoc.data()?.organizerId !== organizerId) {
        throw new functions.https.HttpsError("permission-denied", "error.permissionDenied");
    }

    const staffRef = eventRef.collection('staff').doc(staffUserId);
    await staffRef.set({
        displayName: staffDisplayName || "Unknown Staff",
        avatarUrl: staffAvatarUrl || null,
        addedAt: admin.firestore.FieldValue.serverTimestamp(),
        addedBy: organizerId,
    });

    return { success: true, message: `${staffDisplayName || 'User'} has been added as staff.` };
});


export const getEventStaff = functions.https.onCall(async (data, context) => {
    const organizerId = checkAuth(context);
    const { eventId } = data;
    if (!eventId) {
        throw new functions.https.HttpsError("invalid-argument", "Event ID is required.");
    }

    const eventRef = db.collection('agri_events').doc(eventId);
    const eventDoc = await eventRef.get();
    if (!eventDoc.exists || eventDoc.data()?.organizerId !== organizerId) {
        throw new functions.https.HttpsError("permission-denied", "error.permissionDenied");
    }
    
    const staffSnapshot = await eventRef.collection('staff').get();
    const staffList = staffSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    }));

    return { staff: staffList };
});


export const removeEventStaff = functions.https.onCall(async (data, context) => {
    const organizerId = checkAuth(context);
    const { eventId, staffUserId } = data;

    if (!eventId || !staffUserId) {
        throw new functions.https.HttpsError("invalid-argument", "Event ID and Staff User ID are required.");
    }
    
    const eventRef = db.collection('agri_events').doc(eventId);
    const eventDoc = await eventRef.get();
    if (!eventDoc.exists || eventDoc.data()?.organizerId !== organizerId) {
        throw new functions.https.HttpsError("permission-denied", "error.permissionDenied");
    }

    const staffRef = eventRef.collection('staff').doc(staffUserId);
    await staffRef.delete();
    
    return { success: true, message: "Staff member has been removed." };
});
