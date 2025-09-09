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
exports.getAgroTourismBookings = exports.removeAgroTourismStaff = exports.getAgroTourismStaff = exports.addAgroTourismStaff = exports.checkInAgroTourismBooking = exports.bookAgroTourismService = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const profiles_1 = require("./profiles");
const db = admin.firestore();
const checkAuth = (context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    return context.auth.uid;
};
// =================================================================
// BOOKING MANAGEMENT
// =================================================================
exports.bookAgroTourismService = functions.https.onCall(async (data, context) => {
    const uid = checkAuth(context);
    const { itemId, bookingDetails } = data; // bookingDetails could contain dates, number of people, etc.
    if (!itemId)
        throw new functions.https.HttpsError('invalid-argument', 'An Item ID for the service is required.');
    const itemRef = db.collection('marketplaceItems').doc(itemId);
    const bookingRef = itemRef.collection('bookings').doc(uid);
    const userProfileDoc = await (0, profiles_1.getProfileByIdFromDB)(uid);
    if (!userProfileDoc) {
        throw new functions.https.HttpsError('not-found', 'User profile not found.');
    }
    return db.runTransaction(async (transaction) => {
        var _a, _b;
        const itemDoc = await transaction.get(itemRef);
        if (!itemDoc.exists || ((_a = itemDoc.data()) === null || _a === void 0 ? void 0 : _a.listingType) !== 'Service' || ((_b = itemDoc.data()) === null || _b === void 0 ? void 0 : _b.category) !== 'agri-tourism-services') {
            throw new functions.https.HttpsError('not-found', 'Valid Agro-Tourism service not found.');
        }
        const bookingDoc = await transaction.get(bookingRef);
        if (bookingDoc.exists) {
            throw new functions.https.HttpsError('already-exists', 'You have already booked this service.');
        }
        // TODO: Add payment processing logic here if the service has a price.
        transaction.set(bookingRef, Object.assign(Object.assign({}, bookingDetails), { userId: uid, displayName: userProfileDoc.displayName, avatarUrl: userProfileDoc.avatarUrl || null, bookedAt: admin.firestore.FieldValue.serverTimestamp(), checkedIn: false, checkedInAt: null }));
        // Optionally, increment a booking counter on the item itself
        transaction.update(itemRef, {
            bookingsCount: admin.firestore.FieldValue.increment(1)
        });
        return { success: true, message: 'Successfully booked the Agro-Tourism service.' };
    });
});
exports.checkInAgroTourismBooking = functions.https.onCall(async (data, context) => {
    var _a;
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
    const organizerId = itemData === null || itemData === void 0 ? void 0 : itemData.sellerId;
    const staffRef = itemRef.collection('staff').doc(callerId);
    const staffDoc = await staffRef.get();
    if (organizerId !== callerId && !staffDoc.exists) {
        throw new functions.https.HttpsError("permission-denied", "You are not authorized to check-in guests for this service.");
    }
    const guestUserDoc = await db.collection('users').doc(attendeeUid).get();
    if (!guestUserDoc.exists) {
        throw new functions.https.HttpsError("not-found", "No user found with this ID.");
    }
    const guestName = ((_a = guestUserDoc.data()) === null || _a === void 0 ? void 0 : _a.displayName) || 'Unknown Guest';
    const bookingRef = itemRef.collection('bookings').doc(attendeeUid);
    return db.runTransaction(async (transaction) => {
        const bookingDoc = await transaction.get(bookingRef);
        if (!bookingDoc.exists) {
            throw new functions.https.HttpsError("not-found", `${guestName} does not have a booking for this service.`);
        }
        const bookingData = bookingDoc.data();
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
exports.addAgroTourismStaff = functions.https.onCall(async (data, context) => {
    var _a;
    const operatorId = checkAuth(context);
    const { itemId, staffUserId, staffDisplayName, staffAvatarUrl } = data;
    if (!itemId || !staffUserId) {
        throw new functions.https.HttpsError("invalid-argument", "Service Item ID and Staff User ID are required.");
    }
    const itemRef = db.collection('marketplaceItems').doc(itemId);
    const itemDoc = await itemRef.get();
    if (!itemDoc.exists || ((_a = itemDoc.data()) === null || _a === void 0 ? void 0 : _a.sellerId) !== operatorId) {
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
exports.getAgroTourismStaff = functions.https.onCall(async (data, context) => {
    var _a;
    const operatorId = checkAuth(context);
    const { itemId } = data;
    if (!itemId) {
        throw new functions.https.HttpsError("invalid-argument", "Item ID is required.");
    }
    const itemRef = db.collection('marketplaceItems').doc(itemId);
    const itemDoc = await itemRef.get();
    if (!itemDoc.exists || ((_a = itemDoc.data()) === null || _a === void 0 ? void 0 : _a.sellerId) !== operatorId) {
        throw new functions.https.HttpsError("permission-denied", "You are not authorized to view staff for this service.");
    }
    const staffSnapshot = await itemRef.collection('staff').get();
    const staffList = staffSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
    return { staff: staffList };
});
exports.removeAgroTourismStaff = functions.https.onCall(async (data, context) => {
    var _a;
    const operatorId = checkAuth(context);
    const { itemId, staffUserId } = data;
    if (!itemId || !staffUserId) {
        throw new functions.https.HttpsError("invalid-argument", "Item ID and Staff User ID are required.");
    }
    const itemRef = db.collection('marketplaceItems').doc(itemId);
    const itemDoc = await itemRef.get();
    if (!itemDoc.exists || ((_a = itemDoc.data()) === null || _a === void 0 ? void 0 : _a.sellerId) !== operatorId) {
        throw new functions.https.HttpsError("permission-denied", "You are not authorized to remove staff from this service.");
    }
    const staffRef = itemRef.collection('staff').doc(staffUserId);
    await staffRef.delete();
    return { success: true, message: "Staff member has been removed." };
});
exports.getAgroTourismBookings = functions.https.onCall(async (data, context) => {
    var _a;
    const operatorId = checkAuth(context);
    const { itemId } = data;
    if (!itemId) {
        throw new functions.https.HttpsError("invalid-argument", "Item ID is required.");
    }
    const itemRef = db.collection('marketplaceItems').doc(itemId);
    const itemDoc = await itemRef.get();
    if (!itemDoc.exists || ((_a = itemDoc.data()) === null || _a === void 0 ? void 0 : _a.sellerId) !== operatorId) {
        throw new functions.https.HttpsError("permission-denied", "You are not authorized to view bookings for this service.");
    }
    const bookingsSnapshot = await itemRef.collection('bookings').orderBy('bookedAt', 'desc').get();
    const bookingsList = bookingsSnapshot.docs.map(doc => {
        var _a, _b, _c, _d;
        const data = doc.data();
        return Object.assign(Object.assign({ id: doc.id }, data), { bookedAt: ((_b = (_a = data.bookedAt) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a).toISOString()) || null, checkedInAt: ((_d = (_c = data.checkedInAt) === null || _c === void 0 ? void 0 : _c.toDate) === null || _d === void 0 ? void 0 : _d.call(_c).toISOString()) || null });
    });
    return { bookings: bookingsList };
});
//# sourceMappingURL=agro-tourism.js.map