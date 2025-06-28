
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {FieldValue} from "firebase-admin/firestore";
import type { UserProfile } from "./types";
import {_internalInitiatePayment} from "./module7"; // Import payment function
import {_internalLogTraceEvent} from "./module1"; // Import trace event logger

const db = admin.firestore();
const POSTS_PER_PAGE = 10;
const REPLIES_PER_PAGE = 15;

/**
 * =================================================================
 * Module 6: Community & Collaboration Backend
 * =================================================================
 */

// ================== FORUMS ==================

export const getTopics = functions.https.onCall(async (data, context) => {
  try {
    const topicsSnapshot = await db.collection("forums").orderBy("lastActivity", "desc").get();
    const topics = topicsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return { 
            id: doc.id, 
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : null,
            lastActivity: data.lastActivity?.toDate ? data.lastActivity.toDate().toISOString() : null,
        };
    });
    return {topics};
  } catch (error) {
    console.error("Error fetching topics:", error);
    throw new functions.https.HttpsError("internal", "An error occurred while fetching forum topics.");
  }
});

export const createTopic = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "You must be logged in to create a topic.");
  }

  const {name, description, regionTags} = data;

  if (!name || !description) {
    throw new functions.https.HttpsError("invalid-argument", "Name and description are required.");
  }

  const newTopic = {
    name,
    description,
    regionTags: regionTags || ["Global"],
    postCount: 0,
    createdBy: context.auth.uid,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    lastActivity: admin.firestore.FieldValue.serverTimestamp(),
  };

  try {
    const docRef = await db.collection("forums").add(newTopic);
    return {topicId: docRef.id, message: "Topic created successfully"};
  } catch (error) {
    console.error("Error creating topic:", error);
    throw new functions.https.HttpsError("internal", "An error occurred while creating the topic.");
  }
});


export const getPostsForTopic = functions.https.onCall(async (data, context) => {
  const {topicId, lastVisible} = data;
  if (!topicId) {
    throw new functions.https.HttpsError("invalid-argument", "A topicId must be provided.");
  }

  try {
    let query = db.collection(`forums/${topicId}/posts`)
      .orderBy("timestamp", "desc")
      .limit(POSTS_PER_PAGE);

    if (lastVisible) {
      const lastVisibleDoc = await db.collection(`forums/${topicId}/posts`).doc(lastVisible).get();
      if (lastVisibleDoc.exists) {
        query = query.startAfter(lastVisibleDoc);
      }
    }

    const postsSnapshot = await query.get();
    const posts = postsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return { 
            id: doc.id, 
            ...data,
            timestamp: data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : null,
        };
    });

    const newLastVisible = postsSnapshot.docs[postsSnapshot.docs.length - 1]?.id || null;

    return {posts, lastVisible: newLastVisible};
  } catch (error) {
    console.error(`Error fetching posts for topic ${topicId}:`, error);
    throw new functions.https.HttpsError("internal", "An error occurred while fetching posts.");
  }
});

export const createForumPost = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "You must be logged in to create a post.");
  }

  const {topicId, title, content} = data;
  if (!topicId || !title || !content) {
    throw new functions.https.HttpsError("invalid-argument", "topicId, title, and content are required.");
  }

  const topicRef = db.collection("forums").doc(topicId);
  const newPostRef = topicRef.collection("posts").doc();

  const newPost = {
    title,
    content,
    authorRef: context.auth.uid,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    replyCount: 0,
    likeCount: 0,
  };

  try {
    await db.runTransaction(async (transaction) => {
      transaction.set(newPostRef, newPost);
      transaction.update(topicRef, {
        postCount: admin.firestore.FieldValue.increment(1),
        lastActivity: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    return {postId: newPostRef.id, message: "Post created successfully"};
  } catch (error) {
    console.error(`Error creating post in topic ${topicId}:`, error);
    throw new functions.https.HttpsError("internal", "An error occurred while creating the post.");
  }
});


export const getRepliesForPost = functions.https.onCall(async (data, context) => {
  const {topicId, postId, lastVisible} = data;
  if (!topicId || !postId) {
    throw new functions.https.HttpsError("invalid-argument", "A topicId and postId must be provided.");
  }

  try {
    let query = db.collection(`forums/${topicId}/posts/${postId}/replies`)
      .orderBy("timestamp", "asc")
      .limit(REPLIES_PER_PAGE);

    if (lastVisible) {
      const lastVisibleDoc = await db.collection(`forums/${topicId}/posts/${postId}/replies`).doc(lastVisible).get();
      if (lastVisibleDoc.exists) {
        query = query.startAfter(lastVisibleDoc);
      }
    }

    const repliesSnapshot = await query.get();
    const replies = repliesSnapshot.docs.map((doc) => {
        const data = doc.data();
        return { 
            id: doc.id, 
            ...data,
            timestamp: data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : null,
        };
    });

    const newLastVisible = repliesSnapshot.docs[repliesSnapshot.docs.length - 1]?.id || null;

    return {replies, lastVisible: newLastVisible};
  } catch (error) {
    console.error(`Error fetching replies for post ${postId}:`, error);
    throw new functions.https.HttpsError("internal", "An error occurred while fetching replies.");
  }
});

export const addReplyToPost = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "You must be logged in to reply.");
  }

  const {topicId, postId, content} = data;
  if (!topicId || !postId || !content) {
    throw new functions.https.HttpsError("invalid-argument", "topicId, postId, and content are required.");
  }

  const replyData = {
    content,
    authorRef: context.auth.uid,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  };

  const postRef = db.collection(`forums/${topicId}/posts`).doc(postId);

  try {
    await postRef.collection("replies").add(replyData);
    await postRef.update({ replyCount: admin.firestore.FieldValue.increment(1) });
    await db.collection("forums").doc(topicId).update({
      lastActivity: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { message: "Reply added successfully" };
  } catch (error) {
    console.error(`Error adding reply to post ${postId}:`, error);
    throw new functions.https.HttpsError("internal", "An error occurred while adding the reply.");
  }
});

// ================== GROUPS ==================

export const getGroups = functions.https.onCall(async (data, context) => {
  try {
    const groupsSnapshot = await db.collection("groups").where("isPublic", "==", true).get();
    const groups = groupsSnapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
    return {groups};
  } catch (error) {
    console.error("Error fetching groups:", error);
    throw new functions.https.HttpsError("internal", "An error occurred while fetching groups.");
  }
});

export const createGroup = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "You must be logged in to create a group.");
  }

  const {name, description, isPublic} = data;

  if (!name || !description) {
    throw new functions.https.HttpsError("invalid-argument", "Name and description are required.");
  }

  const newGroup = {
    name,
    description,
    isPublic: isPublic !== false,
    memberCount: 1,
    ownerId: context.auth.uid,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  try {
    const groupRef = await db.collection("groups").add(newGroup);
    await groupRef.collection("members").doc(context.auth.uid).set({
      role: "owner",
      joinedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return {groupId: groupRef.id, message: "Group created successfully"};
  } catch (error) {
    console.error("Error creating group:", error);
    throw new functions.https.HttpsError("internal", "An error occurred while creating the group.");
  }
});

export const getGroupDetails = functions.https.onCall(async (data, context) => {
  const {groupId} = data;
  if (!groupId) {
    throw new functions.https.HttpsError("invalid-argument", "A groupId must be provided.");
  }

  try {
    const groupDoc = await db.collection("groups").doc(groupId).get();
    if (!groupDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Group not found.");
    }
    const groupData = groupDoc.data()!;
    return {
        id: groupDoc.id, 
        ...groupData,
        createdAt: groupData.createdAt?.toDate ? groupData.createdAt.toDate().toISOString() : null,
    };
  } catch (error) {
    console.error(`Error fetching group details for ${groupId}:`, error);
    throw new functions.https.HttpsError("internal", "An error occurred while fetching group details.");
  }
});

export const getGroupMembers = functions.https.onCall(async (data, context) => {
  const {groupId} = data;
  if (!groupId) {
    throw new functions.https.HttpsError("invalid-argument", "A groupId must be provided.");
  }

  try {
    const membersSnapshot = await db.collection(`groups/${groupId}/members`).get();
    const memberIds = membersSnapshot.docs.map((doc) => doc.id);

    if (memberIds.length === 0) {
      return [];
    }

    const userDocs = await db.collection("users").where(admin.firestore.FieldPath.documentId(), "in", memberIds).get();
    const members = userDocs.docs.map((doc) => ({id: doc.id, ...doc.data()}));

    return members;
  } catch (error) {
    console.error(`Error fetching members for group ${groupId}:`, error);
    throw new functions.https.HttpsError("internal", "An error occurred while fetching group members.");
  }
});

export const joinGroup = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "You must be logged in to join a group.");
  }

  const {groupId} = data;
  if (!groupId) {
    throw new functions.https.HttpsError("invalid-argument", "A groupId must be provided.");
  }

  const groupRef = db.collection("groups").doc(groupId);
  const memberRef = groupRef.collection("members").doc(context.auth.uid);

  try {
    const groupDoc = await groupRef.get();
    if (!groupDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Group not found.");
    }
    if (!groupDoc.data()?.isPublic) {
      throw new functions.https.HttpsError("permission-denied", "This is a private group.");
    }

    const memberDoc = await memberRef.get();
    if (memberDoc.exists) {
      throw new functions.https.HttpsError("already-exists", "You are already a member of this group.");
    }

    await memberRef.set({
      role: "member",
      joinedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    await groupRef.update({ memberCount: admin.firestore.FieldValue.increment(1) });

    return {message: "Successfully joined the group."};
  } catch (error: any) {
    console.error(`Error joining group ${groupId}:`, error);
    if(error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError("internal", "An error occurred while joining the group.");
  }
});

export const leaveGroup = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "You must be logged in to leave a group.");
  }

  const {groupId} = data;
  if (!groupId) {
    throw new functions.https.HttpsError("invalid-argument", "A groupId must be provided.");
  }

  const groupRef = db.collection("groups").doc(groupId);
  const memberRef = groupRef.collection("members").doc(context.auth.uid);

  try {
    const memberDoc = await memberRef.get();
    if (!memberDoc.exists) {
      throw new functions.https.HttpsError("not-found", "You are not a member of this group.");
    }

    await memberRef.delete();
    await groupRef.update({ memberCount: admin.firestore.FieldValue.increment(-1) });

    return {message: "Successfully left the group."};
  } catch (error: any) {
    console.error(`Error leaving group ${groupId}:`, error);
    if(error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError("internal", "An error occurred while leaving the group.");
  }
});


/**
 * =================================================================
 * Module 6: Main Feed Functions
 * =================================================================
 */

export const getFeed = functions.https.onCall(async (data, context) => {
  try {
    // Simplified query without ordering or pagination to ensure stability.
    // This avoids potential 'internal' errors from missing Firestore indexes.
    const query = db.collection("posts").limit(20);
    const snapshot = await query.get();
    
    const posts = snapshot.docs.map((doc) => {
        const docData = doc.data();
        return { 
            id: doc.id, 
            ...docData,
            createdAt: docData.createdAt?.toDate ? docData.createdAt.toDate().toISOString() : null,
        };
    });

    // Pagination is removed for now, so lastVisible is always null.
    return {posts, lastVisible: null};
  } catch (error) {
    console.error("Error fetching feed:", error);
    // The specific message helps in debugging if the error is caught client-side.
    throw new functions.https.HttpsError("internal", "Could not fetch the main feed due to a server-side issue.");
  }
});

export const createFeedPost = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "You must be logged in to create a post.");
  }

  const {content, mediaUrl, pollOptions} = data;
  if (!content && !mediaUrl && !pollOptions) {
    throw new functions.https.HttpsError("invalid-argument", "Post must have content, media, or a poll.");
  }

  const newPost = {
    userId: context.auth.uid,
    content: content || "",
    mediaUrl: mediaUrl || null,
    mediaType: mediaUrl ? (mediaUrl.includes(".mp4") ? "video" : "image") : null,
    pollOptions: pollOptions || null,
    likeCount: 0,
    commentCount: 0,
    createdAt: FieldValue.serverTimestamp(),
  };

  try {
    const docRef = await db.collection("posts").add(newPost);
    return {postId: docRef.id, message: "Post created successfully"};
  } catch (error) {
    console.error("Error creating post:", error);
    throw new functions.https.HttpsError("internal", "An error occurred while creating the post.");
  }
});


export const likePost = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "You must be logged in to like a post.");
  }
  const {postId} = data;
  if (!postId) {
    throw new functions.https.HttpsError("invalid-argument", "postId is required.");
  }

  const postRef = db.collection("posts").doc(postId);
  const likeRef = postRef.collection("likes").doc(context.auth.uid);

  try {
    const likeDoc = await likeRef.get();

    if (likeDoc.exists) {
      // Unlike the post
      await likeRef.delete();
      await postRef.update({ likeCount: FieldValue.increment(-1) });
      return {success: true, message: "Post unliked."};
    } else {
      // Like the post
      await likeRef.set({createdAt: FieldValue.serverTimestamp()});
      await postRef.update({ likeCount: FieldValue.increment(1) });
      return {success: true, message: "Post liked."};
    }
  } catch (error) {
    console.error(`Error liking post ${postId}:`, error);
    throw new functions.https.HttpsError("internal", "An error occurred while liking the post.");
  }
});


export const addComment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "You must be logged in to comment.");
  }
  const {postId, content} = data;
  if (!postId || !content) {
    throw new functions.https.HttpsError("invalid-argument", "postId and content are required.");
  }

  const newComment = {
    userId: context.auth.uid,
    content,
    createdAt: FieldValue.serverTimestamp(),
  };

  const postRef = db.collection("posts").doc(postId);

  try {
    const commentRef = await postRef.collection("comments").add(newComment);
    await postRef.update({ commentCount: FieldValue.increment(1) });
    return {success: true, commentId: commentRef.id, message: "Comment added successfully."};
  } catch (error) {
    console.error(`Error adding comment to post ${postId}:`, error);
    throw new functions.https.HttpsError("internal", "An error occurred while adding the comment.");
  }
});


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
            createdAt: eventData.createdAt?.toDate ? eventData.createdAt.toDate().toISOString() : null,
            eventDate: eventData.eventDate, // This should already be an ISO string from the client
        };
    });
    return events;
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
          registeredAt: regData.registeredAt.toDate().toISOString(),
          checkedIn: regData.checkedIn || false,
          checkedInAt: regData.checkedInAt ? regData.checkedInAt.toDate().toISOString() : null,
        };
      });
    }
  }

  return {
      ...eventData,
      id: eventSnap.id,
      isRegistered,
      attendees,
      createdAt: eventData.createdAt?.toDate ? eventData.createdAt.toDate().toISOString() : null,
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
      const couponData = couponDoc.data();
      couponRef = couponDoc.ref;

      if (couponData.usageLimit && couponData.usageCount >= couponData.usageLimit) {
        throw new functions.https.HttpsError("failed-precondition", "Coupon has reached its usage limit.");
      }
      if (couponData.expiresAt && couponData.expiresAt.toDate() < new Date()) {
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
