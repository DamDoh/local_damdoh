"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeEventStaff = exports.getEventStaff = exports.addEventStaff = exports.searchUsersForStaffing = exports.getEventAttendees = exports.checkInAttendee = exports.registerForEvent = exports.getEventDetails = exports.getAgriEvents = exports.createAgriEvent = exports.getEventCoupons = exports.createEventCoupon = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const schemas_1 = require("@/lib/schemas"); // Import from the new single source of truth
const db = admin.firestore();
const checkAuth = (context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    return context.auth.uid;
};
// Internal helper to validate an event coupon
const _validateEventCoupon = async (eventId, couponCode) => {
    if (!couponCode)
        return { valid: false };
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
exports.createEventCoupon = functions.https.onCall(async (data, context) => {
    var _a;
    const uid = checkAuth(context);
    const { eventId, code, discountType, discountValue, expiryDate, usageLimit } = data;
    if (!eventId || !code || !discountType || !discountValue) {
        throw new functions.https.HttpsError("invalid-argument", "Missing required coupon fields.");
    }
    const eventRef = db.collection("agri_events").doc(eventId);
    const eventDoc = await eventRef.get();
    if (!eventDoc.exists || ((_a = eventDoc.data()) === null || _a === void 0 ? void 0 : _a.organizerId) !== uid) {
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
exports.getEventCoupons = functions.https.onCall(async (data, context) => {
    var _a;
    checkAuth(context);
    const { eventId } = data;
    if (!eventId) {
        throw new functions.https.HttpsError("invalid-argument", "An eventId must be provided.");
    }
    const eventRef = db.collection("agri_events").doc(eventId);
    const eventDoc = await eventRef.get();
    if (!eventDoc.exists || ((_a = eventDoc.data()) === null || _a === void 0 ? void 0 : _a.organizerId) !== context.auth.uid) {
        throw new functions.https.HttpsError("permission-denied", "You are not authorized to view coupons for this event.");
    }
    const couponsSnapshot = await eventRef.collection('coupons').orderBy('createdAt', 'desc').get();
    const coupons = couponsSnapshot.docs.map(doc => {
        var _a, _b, _c, _d;
        const couponData = doc.data();
        return Object.assign(Object.assign({ id: doc.id }, couponData), { createdAt: ((_b = (_a = couponData.createdAt) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a).toISOString()) || null, expiresAt: ((_d = (_c = couponData.expiresAt) === null || _c === void 0 ? void 0 : _c.toDate) === null || _d === void 0 ? void 0 : _d.call(_c).toISOString()) || null });
    });
    return { coupons };
});
exports.createAgriEvent = functions.https.onCall(async (data, context) => {
    const uid = checkAuth(context);
    const validation = schemas_1.AgriEventSchema.safeParse(data);
    if (!validation.success) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid event data.', validation.error.format());
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
exports.getAgriEvents = functions.https.onCall(async (data, context) => {
    const snapshot = await db.collection('agri_events').orderBy('eventDate', 'asc').get();
    const events = snapshot.docs.map(doc => {
        var _a, _b, _c, _d;
        const docData = doc.data();
        return Object.assign(Object.assign({ id: doc.id }, docData), { eventDate: (_b = (_a = docData.eventDate) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a).toISOString(), createdAt: (_d = (_c = docData.createdAt) === null || _c === void 0 ? void 0 : _c.toDate) === null || _d === void 0 ? void 0 : _d.call(_c).toISOString() });
    });
    return { events };
});
exports.getEventDetails = functions.https.onCall(async (data, context) => {
    var _a, _b, _c, _d;
    const { eventId } = data;
    if (!eventId)
        throw new functions.https.HttpsError('invalid-argument', 'Event ID is required.');
    const eventDoc = await db.collection('agri_events').doc(eventId).get();
    if (!eventDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Event not found.');
    }
    const eventData = eventDoc.data();
    let isRegistered = false;
    if (context.auth) {
        const attendeeDoc = await db.collection('agri_events').doc(eventId).collection('attendees').doc(context.auth.uid).get();
        isRegistered = attendeeDoc.exists;
    }
    return Object.assign(Object.assign({}, eventData), { id: eventDoc.id, eventDate: (_b = (_a = eventData.eventDate) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a).toISOString(), createdAt: (_d = (_c = eventData.createdAt) === null || _c === void 0 ? void 0 : _c.toDate) === null || _d === void 0 ? void 0 : _d.call(_c).toISOString(), isRegistered: isRegistered });
});
exports.registerForEvent = functions.https.onCall(async (data, context) => {
    const uid = checkAuth(context);
    const { eventId, couponCode } = data;
    if (!eventId)
        throw new functions.https.HttpsError('invalid-argument', 'Event ID is required.');
    const eventRef = db.collection('agri_events').doc(eventId);
    const attendeeRef = eventRef.collection('attendees').doc(uid);
    const userProfileDoc = await db.collection('users').doc(uid).get();
    if (!userProfileDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'User profile not found.');
    }
    const userProfile = userProfileDoc.data();
    return db.runTransaction(async (transaction) => {
        const eventDoc = await transaction.get(eventRef);
        if (!eventDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Event not found.');
        }
        const eventData = eventDoc.data();
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
        let couponDocId;
        if (couponCode && finalPrice > 0) {
            const couponResult = await _validateEventCoupon(eventId, couponCode);
            if (couponResult.valid) {
                couponValid = true;
                couponDocId = couponResult.docId;
                if (couponResult.discountType === 'fixed' && couponResult.discountValue) {
                    discountApplied = couponResult.discountValue;
                    finalPrice = Math.max(0, finalPrice - discountApplied);
                }
                else if (couponResult.discountType === 'percentage' && couponResult.discountValue) {
                    discountApplied = finalPrice * (couponResult.discountValue / 100);
                    finalPrice = finalPrice - discountApplied;
                }
            }
            else {
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
exports.checkInAttendee = functions.https.onCall(async (data, context) => {
    var _a;
    const callerId = checkAuth(context);
    const { eventId, attendeeUid } = data;
    if (!eventId || !attendeeUid) {
        throw new functions.https.HttpsError("invalid-argument", "Event ID and Attendee UID are required.");
    }
    const eventRef = db.collection('agri_events').doc(eventId);
    const eventDoc = await eventRef.get();
    const eventData = eventDoc.data();
    if (!eventDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Event not found.");
    }
    const organizerId = eventData === null || eventData === void 0 ? void 0 : eventData.organizerId;
    const staffRef = db.collection(`agri_events/${eventId}/staff`).doc(callerId);
    const staffDoc = await staffRef.get();
    if (organizerId !== callerId && !staffDoc.exists) {
        throw new functions.https.HttpsError("permission-denied", "You are not authorized to check-in attendees for this event.");
    }
    const attendeeUserDoc = await db.collection('users').doc(attendeeUid).get();
    if (!attendeeUserDoc.exists) {
        throw new functions.https.HttpsError("not-found", "No user found with the provided ID.");
    }
    const attendeeName = ((_a = attendeeUserDoc.data()) === null || _a === void 0 ? void 0 : _a.displayName) || 'Unknown Attendee';
    const attendeeRef = eventRef.collection('attendees').doc(attendeeUid);
    return db.runTransaction(async (transaction) => {
        const attendeeDoc = await transaction.get(attendeeRef);
        if (!attendeeDoc.exists) {
            throw new functions.https.HttpsError("not-found", `${attendeeName} is not registered for this event.`);
        }
        const attendeeData = attendeeDoc.data();
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
exports.getEventAttendees = functions.https.onCall(async (data, context) => {
    var _a;
    const uid = checkAuth(context);
    const { eventId } = data;
    if (!eventId) {
        throw new functions.https.HttpsError("invalid-argument", "An eventId must be provided.");
    }
    const eventRef = db.collection("agri_events").doc(eventId);
    const eventDoc = await eventRef.get();
    if (!eventDoc.exists || ((_a = eventDoc.data()) === null || _a === void 0 ? void 0 : _a.organizerId) !== uid) {
        throw new functions.https.HttpsError("permission-denied", "You are not authorized to view attendees for this event.");
    }
    const attendeesSnapshot = await eventRef.collection('attendees').orderBy('registeredAt', 'desc').get();
    const attendees = attendeesSnapshot.docs.map(doc => {
        var _a, _b, _c, _d;
        const attendeeData = doc.data();
        return Object.assign(Object.assign({ id: doc.id }, attendeeData), { registeredAt: ((_b = (_a = attendeeData.registeredAt) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a).toISOString()) || null, checkedInAt: ((_d = (_c = attendeeData.checkedInAt) === null || _c === void 0 ? void 0 : _c.toDate) === null || _d === void 0 ? void 0 : _d.call(_c).toISOString()) || null });
    });
    return { attendees };
});
// STAFF MANAGEMENT FUNCTIONS
exports.searchUsersForStaffing = functions.https.onCall(async (data, context) => {
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
    const processSnapshot = (snapshot) => {
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
exports.addEventStaff = functions.https.onCall(async (data, context) => {
    var _a;
    const organizerId = checkAuth(context);
    const { eventId, staffUserId, staffDisplayName, staffAvatarUrl } = data;
    if (!eventId || !staffUserId) {
        throw new functions.https.HttpsError("invalid-argument", "Event ID and Staff User ID are required.");
    }
    const eventRef = db.collection('agri_events').doc(eventId);
    const eventDoc = await eventRef.get();
    if (!eventDoc.exists || ((_a = eventDoc.data()) === null || _a === void 0 ? void 0 : _a.organizerId) !== organizerId) {
        throw new functions.https.HttpsError("permission-denied", "You are not authorized to add staff to this event.");
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
exports.getEventStaff = functions.https.onCall(async (data, context) => {
    var _a;
    const organizerId = checkAuth(context);
    const { eventId } = data;
    if (!eventId) {
        throw new functions.https.HttpsError("invalid-argument", "Event ID is required.");
    }
    const eventRef = db.collection('agri_events').doc(eventId);
    const eventDoc = await eventRef.get();
    if (!eventDoc.exists || ((_a = eventDoc.data()) === null || _a === void 0 ? void 0 : _a.organizerId) !== organizerId) {
        throw new functions.https.HttpsError("permission-denied", "You are not authorized to view staff for this event.");
    }
    const staffSnapshot = await eventRef.collection('staff').get();
    const staffList = staffSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
    return { staff: staffList };
});
exports.removeEventStaff = functions.https.onCall(async (data, context) => {
    var _a;
    const organizerId = checkAuth(context);
    const { eventId, staffUserId } = data;
    if (!eventId || !staffUserId) {
        throw new functions.https.HttpsError("invalid-argument", "Event ID and Staff User ID are required.");
    }
    const eventRef = db.collection('agri_events').doc(eventId);
    const eventDoc = await eventRef.get();
    if (!eventDoc.exists || ((_a = eventDoc.data()) === null || _a === void 0 ? void 0 : _a.organizerId) !== organizerId) {
        throw new functions.https.HttpsError("permission-denied", "You are not authorized to remove staff from this event.");
    }
    const staffRef = eventRef.collection('staff').doc(staffUserId);
    await staffRef.delete();
    return { success: true, message: "Staff member has been removed." };
});
//# sourceMappingURL=agri-events.js.map