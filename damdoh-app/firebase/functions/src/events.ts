
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import type { UserProfile, EventCoupon, AgriEvent } from "./types";
import { _internalInitiatePayment } from "./financials";
import { _internalLogTraceEvent } from "./traceability";
import { getProfileByIdFromDB } from "./profiles";

const db = admin.firestore();

// ================== AGRI-BUSINESS EVENTS ==================

export const createAgriEvent = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "You must be logged in to create an event.");
  }

  const {title, description, eventDate, location, eventType} = data;

  if (!title || !description || !eventDate || !location || !eventType) {
    throw new functions.https.HttpsError("invalid-argument", "Missing required event fields.");
  }

  const newEvent = {
    ...data,
    organizerId: context.auth.uid, // Use organizerId for clarity
    createdAt: FieldValue.serverTimestamp(),
    registeredAttendeesCount: 0,
  };

  try {
    const docRef = await db.collection("agri_events").add(newEvent);
    return {eventId: docRef.id, title: title};
  } catch (error) {
    console.error("Error creating agri-event:", error);
    throw new functions.https.HttpsError("internal", "Failed to create event in the database.");
  }
});

export const getAgriEvents = functions.https.onCall(async (data, context) => {
  try {
    const eventsSnapshot = await db.collection("agri_events").orderBy("eventDate", "asc").get();
    const events = eventsSnapshot.docs.map((doc) => {
        const eventData = doc.data();
        return {
            id: doc.id, 
            ...eventData,
            createdAt: (eventData.createdAt as admin.firestore.Timestamp)?.toDate ? (eventData.createdAt as admin.firestore.Timestamp).toDate().toISOString() : null,
            eventDate: eventData.eventDate, // This should already be an ISO string from the client
        };
    });
    return { events };
  } catch (error) {
    console.error("Error fetching agri-events:", error);
    throw new functions.https.HttpsError("internal", "An error occurred while fetching events.");
  }
});


export const getEventDetails = functions.https.onCall(async (data, context) => {
  const {eventId, includeAttendees} = data;
  if (!eventId) {
    throw new functions.https.HttpsError("invalid-argument", "Event ID is required.");
  }

  const eventRef = db.collection("agri_events").doc(eventId);
  const eventSnap = await eventRef.get();

  if (!eventSnap.exists) {
    throw new functions.https.HttpsError("not-found", "Event not found.");
  }

  const eventData = eventSnap.data()!;
  let isRegistered = false;
  let attendees: any[] = [];

  if (context.auth) {
    const registrationRef = eventRef.collection("registrations").doc(context.auth.uid);
    const registrationSnap = await registrationRef.get();
    isRegistered = registrationSnap.exists;
  }
  
  if (includeAttendees && context.auth && context.auth.uid === eventData.organizerId) {
    const registrationsSnap = await eventRef.collection("registrations").get();
    const attendeeIds = registrationsSnap.docs.map((doc) => doc.id);

    if (attendeeIds.length > 0) {
      const userDocs = await db.collection("users").where(admin.firestore.FieldPath.documentId(), "in", attendeeIds).get();
      const profiles: { [key: string]: UserProfile } = {};
      userDocs.forEach((doc) => {
        profiles[doc.id] = doc.data() as UserProfile;
      });

      attendees = registrationsSnap.docs.map((regDoc) => {
        const profile = profiles[regDoc.id];
        const regData = regDoc.data();
        return {
          id: regDoc.id,
          displayName: profile?.displayName || "Unknown User",
          email: profile?.email || "No email",
          avatarUrl: profile?.photoURL || "",
          registeredAt: (regData.registeredAt as admin.firestore.Timestamp)?.toDate().toISOString(),
          checkedIn: regData.checkedIn || false,
          checkedInAt: regData.checkedInAt ? (regData.checkedInAt as admin.firestore.Timestamp).toDate().toISOString() : null,
        };
      });
    }
  }

  return {
      ...eventData,
      id: eventSnap.id,
      isRegistered,
      attendees,
      createdAt: (eventData.createdAt as admin.firestore.Timestamp)?.toDate ? (eventData.createdAt as admin.firestore.Timestamp).toDate().toISOString() : null,
  };
});

export const registerForEvent = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "You must be logged in to register.");
  }

  const {eventId, couponCode} = data;
  if (!eventId) {
    throw new functions.https.HttpsError("invalid-argument", "Event ID is required.");
  }

  const userId = context.auth.uid;
  const eventRef = db.collection("agri_events").doc(eventId);
  const registrationRef = eventRef.collection("registrations").doc(userId);

  return db.runTransaction(async (transaction) => {
    const eventDoc = await transaction.get(eventRef);
    if (!eventDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Event not found.");
    }

    const eventData = eventDoc.data()!;
    if (!eventData.registrationEnabled) {
      throw new functions.https.HttpsError("failed-precondition", "Registration for this event is not open.");
    }

    if (eventData.attendeeLimit && eventData.registeredAttendeesCount >= eventData.attendeeLimit) {
      throw new functions.https.HttpsError("failed-precondition", "This event is full.");
    }

    const registrationDoc = await transaction.get(registrationRef);
    if (registrationDoc.exists) {
      throw new functions.https.HttpsError("already-exists", "You are already registered for this event.");
    }

    let finalPrice = eventData.price || 0;
    let couponRef: FirebaseFirestore.DocumentReference | null = null;
    let discountApplied = 0;

    if (couponCode && typeof couponCode === "string" && finalPrice > 0) {
      const couponsQuery = eventRef.collection("coupons").where("code", "==", couponCode.toUpperCase()).limit(1);
      const couponSnapshot = await transaction.get(couponsQuery);

      if (couponSnapshot.empty) {
        throw new functions.https.HttpsError("not-found", "Invalid coupon code.");
      }

      const couponDoc = couponSnapshot.docs[0];
      const couponData = couponDoc.data() as EventCoupon;
      couponRef = couponDoc.ref;

      if (couponData.usageLimit && couponData.usageCount >= couponData.usageLimit) {
        throw new functions.https.HttpsError("failed-precondition", "Coupon has reached its usage limit.");
      }
      if (couponData.expiresAt && (couponData.expiresAt as any as admin.firestore.Timestamp).toDate() < new Date()) {
        throw new functions.https.HttpsError("failed-precondition", "This coupon has expired.");
      }

      if (couponData.discountType === "percentage") {
        discountApplied = finalPrice * (couponData.discountValue / 100);
      } else if (couponData.discountType === "fixed") {
        discountApplied = couponData.discountValue;
      }

      finalPrice = Math.max(0, finalPrice - discountApplied);
    }

    if (finalPrice > 0) {
      console.log(`Paid event registration for event ${eventId}. Final price after discount: ${finalPrice}. Initiating payment flow.`);
      try {
        await _internalInitiatePayment({
          orderId: `event_${eventId}_${userId}`,
          amount: finalPrice,
          currency: eventData.currency || "USD",
          buyerInfo: {userId},
          sellerInfo: {organizerId: eventData.organizerId},
          description: `Registration for event: ${eventData.title}${discountApplied > 0 ? ` (Discount applied: ${eventData.currency || "USD"} ${discountApplied.toFixed(2)})` : ""}`,
        });
        console.log(`Payment initiated for event ${eventId}. Proceeding with registration.`);
      } catch (paymentError: any) {
        console.error("Payment initiation failed:", paymentError);
        throw new functions.https.HttpsError("aborted", "Payment processing failed. Please try again.");
      }
    }

    transaction.set(registrationRef, {
      userId: userId,
      registeredAt: FieldValue.serverTimestamp(),
      checkedIn: false,
      checkedInAt: null,
      couponUsed: couponCode || null,
      amountPaid: finalPrice,
    });

    transaction.update(eventRef, {
      registeredAttendeesCount: FieldValue.increment(1),
    });

    if (couponRef) {
      transaction.update(couponRef, {usageCount: FieldValue.increment(1)});
    }

    return { success: true, message: "Successfully registered for the event.", finalPrice, discountApplied };
  });
});

export const checkInAttendee = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "You must be an organizer to check in attendees.");
  }

  const {eventId, attendeeId} = data;
  if (!eventId || !attendeeId) {
    throw new functions.https.HttpsError("invalid-argument", "Event ID and Attendee ID are required.");
  }

  const organizerId = context.auth.uid;
  const eventRef = db.collection("agri_events").doc(eventId);
  const registrationRef = eventRef.collection("registrations").doc(attendeeId);

  const eventDoc = await eventRef.get();
  if (!eventDoc.exists || eventDoc.data()?.organizerId !== organizerId) {
    throw new functions.https.HttpsError("permission-denied", "You are not authorized to manage this event.");
  }

  const registrationDoc = await registrationRef.get();
  if (!registrationDoc.exists) {
    throw new functions.https.HttpsError("not-found", "This user is not registered for the event.");
  }

  if (registrationDoc.data()?.checkedIn) {
    throw new functions.https.HttpsError("already-exists", "This attendee has already been checked in.");
  }

  await registrationRef.update({
    checkedIn: true,
    checkedInAt: FieldValue.serverTimestamp(),
  });

  try {
    const eventName = eventDoc.data()?.title || "Unknown Event";
    console.log(`Logging ATTENDED_EVENT for user ${attendeeId} at event "${eventName}"`);
    await _internalLogTraceEvent({
      vtiId: attendeeId, 
      eventType: "ATTENDED_EVENT",
      actorRef: organizerId, 
      geoLocation: null, 
      payload: {
        eventId: eventId,
        eventName: eventName,
        organizerId: organizerId,
        notes: "Attendee checked in by organizer.",
      },
      farmFieldId: `user-credential:${attendeeId}`, 
    });
    console.log(`Successfully logged traceable attendance for user ${attendeeId}`);
  } catch (traceError) {
    console.error(`Failed to log traceability event for user ${attendeeId}'s attendance:`, traceError);
  }


  return {success: true, message: `Attendee ${attendeeId} checked in.`};
});


export const createEventCoupon = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "You must be logged in.");
    }

    const { eventId, code, discountType, discountValue, expiresAt, usageLimit } = data;
    const organizerId = context.auth.uid;

    if (!eventId || !code || !discountType || discountValue === undefined) {
        throw new functions.https.HttpsError("invalid-argument", "Missing required coupon fields.");
    }

    const eventRef = db.collection("agri_events").doc(eventId);
    const eventDoc = await eventRef.get();

    if (!eventDoc.exists || eventDoc.data()?.organizerId !== organizerId) {
        throw new functions.https.HttpsError("permission-denied", "You are not the organizer of this event.");
    }
    
    const couponCode = code.toUpperCase();
    const couponsRef = eventRef.collection('coupons');
    const existingCouponQuery = await couponsRef.where('code', '==', couponCode).get();
    if (!existingCouponQuery.empty) {
        throw new functions.https.HttpsError("already-exists", `A coupon with the code "${couponCode}" already exists for this event.`);
    }

    const newCoupon = {
        code: couponCode,
        discountType,
        discountValue,
        expiresAt: expiresAt ? admin.firestore.Timestamp.fromDate(new Date(expiresAt)) : null,
        usageLimit: usageLimit || null,
        usageCount: 0,
        createdAt: FieldValue.serverTimestamp(),
        organizerId,
    };

    const couponRef = await couponsRef.add(newCoupon);
    
    await eventRef.update({ couponCount: FieldValue.increment(1) });

    return { couponId: couponRef.id, ...newCoupon };
});


export const getEventCoupons = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "You must be logged in.");
    }
    const { eventId } = data;
    const organizerId = context.auth.uid;

    const eventRef = db.collection("agri_events").doc(eventId);
    const eventDoc = await eventRef.get();

    if (!eventDoc.exists || eventDoc.data()?.organizerId !== organizerId) {
        throw new functions.https.HttpsError("permission-denied", "You are not authorized to view coupons for this event.");
    }

    const couponsSnapshot = await eventRef.collection('coupons').orderBy('createdAt', 'desc').get();
    const coupons = couponsSnapshot.docs.map(doc => {
        const couponData = doc.data() as EventCoupon;
        return {
            id: doc.id,
            ...couponData,
            createdAt: (couponData.createdAt as admin.firestore.Timestamp)?.toDate ? (couponData.createdAt as admin.firestore.Timestamp).toDate().toISOString() : null,
            expiresAt: (couponData.expiresAt as admin.firestore.Timestamp)?.toDate ? (couponData.expiresAt as admin.firestore.Timestamp).toDate().toISOString() : null,
        };
    });

    return { coupons };
});
