
/**
 * =================================================================
 * Module 5: Community & Collaboration (The Social Heart of Agriculture)
 * =================================================================
 * This module fosters a vibrant, interconnected ecosystem of trust and
 * knowledge-sharing among all DamDoh stakeholders, transcending geographical
 * boundaries and language barriers. It's designed to facilitate direct
 * communication, group discussions, and content sharing.
 *
 * @purpose To build a global community around agricultural practices, market
 * insights, and shared challenges, enabling farmers and other stakeholders to
 * connect, learn from each other, offer support, and collectively address
 * industry-wide opportunities.
 *
 * @key_concepts
 * - Forums & Discussion Boards: Public, categorized forums for sharing knowledge.
 * - Private Groups & Circles: User-creatable private spaces for collaboration.
 * - Direct Messaging: Secure 1:1 and group chat capabilities.
 * - Main Social Feed: A personalized feed aggregating relevant content from the platform.
 * - Engagement & Moderation: Systems for likes, comments, and maintaining a healthy community.
 *
 * @synergy
 * - Relies on Module 2 (Profiles) for user identity and information.
 * - Triggers Module 13 (Notifications) for new messages, likes, etc.
 * - Can be augmented by Module 6 (AI & Analytics) for content translation and moderation.
 * - Displays shared articles from Module 8 (Knowledge Hub).
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import type { UserProfile, EventCoupon, ForumTopic, ForumPost, PostReply } from "./types";
import { _internalInitiatePayment } from "./financials";
import { _internalLogTraceEvent } from "./traceability";
import { getProfileByIdFromDB } from "./profiles";


const db = admin.firestore();
const POSTS_PER_PAGE = 10;
const REPLIES_PER_PAGE = 15;

// ================== FORUMS ==================

export const getTopics = functions.https.onCall(async (data, context) => {
    try {
        const topicsSnapshot = await db.collection("forums").orderBy("lastActivity", "desc").get();
        const topics = topicsSnapshot.docs.map(doc => {
            const topicData = doc.data() as ForumTopic;
            return {
                id: doc.id,
                ...topicData,
                createdAt: (topicData.createdAt as any)?.toDate ? (topicData.createdAt as any).toDate().toISOString() : new Date().toISOString(),
                lastActivity: (topicData.lastActivity as any)?.toDate ? (topicData.lastActivity as any).toDate().toISOString() : new Date().toISOString(),
            };
        });
        return { topics };
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
        const data = doc.data() as ForumPost;
        return { 
            id: doc.id, 
            ...data,
            timestamp: (data.timestamp as any)?.toDate?.().toISOString() || null,
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
        const data = doc.data() as PostReply;
        return { 
            id: doc.id, 
            ...data,
            timestamp: (data.timestamp as any)?.toDate?.().toISOString() || null,
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
        createdAt: (groupData.createdAt as admin.firestore.Timestamp)?.toDate ? (groupData.createdAt as admin.firestore.Timestamp).toDate().toISOString() : null,
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
    if(error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError("internal", "An error occurred while leaving the group.");
  }
});


// ================== Main Feed Functions ==================

export const getFeed = functions.https.onCall(async (data, context) => {
  try {
    const {lastVisible} = data;
    let query = db.collection("posts")
      .orderBy("createdAt", "desc")
      .limit(POSTS_PER_PAGE);

    if (lastVisible) {
      const lastVisibleDoc = await db.collection("posts").doc(lastVisible).get();
      if (lastVisibleDoc.exists) {
        query = query.startAfter(lastVisibleDoc);
      }
    }

    const snapshot = await query.get();
    const posts = snapshot.docs.map((doc) => {
        const data = doc.data();
        return { 
            id: doc.id, 
            ...data,
            createdAt: (data.createdAt as admin.firestore.Timestamp)?.toDate ? (data.createdAt as admin.firestore.Timestamp).toDate().toISOString() : null,
        };
    });
    const newLastVisible = snapshot.docs[snapshot.docs.length - 1]?.id || null;

    return {posts, lastVisible: newLastVisible};
  } catch (error) {
    console.error("Error fetching feed:", error);
    throw new functions.https.HttpsError("internal", "Could not fetch feed.");
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

// ================== MESSAGING ==================

/**
 * Gets all conversations for the currently authenticated user.
 */
export const getConversationsForUser = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
    }
    const uid = context.auth.uid;

    const conversationsRef = db.collection('conversations');
    const q = conversationsRef.where('participantIds', 'array-contains', uid).orderBy('lastMessageTimestamp', 'desc');

    const snapshot = await q.get();
    if (snapshot.empty) {
        return { conversations: [] };
    }

    const conversations = await Promise.all(snapshot.docs.map(async doc => {
        const data = doc.data();
        const otherParticipantId = data.participantIds.find((pId: string) => pId !== uid);
        const otherParticipantInfo = await getProfileByIdFromDB(otherParticipantId);

        return {
            id: doc.id,
            participant: {
                id: otherParticipantId,
                name: otherParticipantInfo?.displayName || 'Unknown User',
                avatarUrl: otherParticipantInfo?.photoURL || '',
            },
            lastMessage: data.lastMessage,
            lastMessageTimestamp: (data.lastMessageTimestamp as admin.firestore.Timestamp).toDate().toISOString(),
            unreadCount: 0, // Simplified for now
        };
    }));

    return { conversations };
});

/**
 * Gets all messages for a specific conversation.
 */
export const getMessagesForConversation = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
    }
    const { conversationId } = data;
    if (!conversationId) {
        throw new functions.https.HttpsError("invalid-argument", "A conversationId must be provided.");
    }
    
    // Security Check: ensure user is part of the conversation
    const convoRef = db.collection('conversations').doc(conversationId);
    const convoSnap = await convoRef.get();
    if (!convoSnap.exists || !convoSnap.data()?.participantIds.includes(context.auth.uid)) {
        throw new functions.https.HttpsError("permission-denied", "You do not have access to this conversation.");
    }

    const messagesRef = convoRef.collection('messages').orderBy('timestamp', 'asc');
    const snapshot = await messagesRef.get();
    const messages = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            timestamp: (data.timestamp as admin.firestore.Timestamp).toDate().toISOString(),
        };
    });

    return { messages };
});

/**
 * Sends a message to a conversation.
 */
export const sendMessage = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
    }
    const { conversationId, content } = data;
    if (!conversationId || !content) {
        throw new functions.https.HttpsError("invalid-argument", "conversationId and content are required.");
    }

    const uid = context.auth.uid;
    const convoRef = db.collection('conversations').doc(conversationId);

    // Security check
    const convoSnap = await convoRef.get();
    if (!convoSnap.exists || !convoSnap.data()?.participantIds.includes(uid)) {
        throw new functions.https.HttpsError("permission-denied", "You do not have access to this conversation.");
    }

    const message = {
        senderId: uid,
        content: content,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };
    
    await convoRef.collection('messages').add(message);
    await convoRef.update({
        lastMessage: content,
        lastMessageTimestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
});

/**
 * Finds an existing conversation between two users or creates a new one.
 */
export const getOrCreateConversation = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
    }
    const { recipientId } = data;
    if (!recipientId) {
        throw new functions.https.HttpsError("invalid-argument", "A recipientId must be provided.");
    }

    const uid = context.auth.uid;
    if (uid === recipientId) {
         throw new functions.https.HttpsError("invalid-argument", "Cannot start a conversation with yourself.");
    }

    const participantIds = [uid, recipientId].sort(); // Sort to ensure consistent query ID
    
    const conversationsRef = db.collection('conversations');
    const q = conversationsRef.where('participantIds', '==', participantIds);
    
    const snapshot = await q.get();

    if (!snapshot.empty) {
        // Conversation already exists
        const doc = snapshot.docs[0];
        return { conversationId: doc.id, isNew: false };
    } else {
        // Create new conversation
        const [userProfileSnap, recipientProfileSnap] = await Promise.all([
            db.collection('users').doc(uid).get(),
            db.collection('users').doc(recipientId).get()
        ]);
        
        if (!userProfileSnap.exists() || !recipientProfileSnap.exists()) {
            throw new functions.https.HttpsError("not-found", "One or both user profiles not found.");
        }

        const newConversation = {
            participantIds,
            participantInfo: {
                [uid]: { name: userProfileSnap.data()?.displayName, photoURL: userProfileSnap.data()?.photoURL || null },
                [recipientId]: { name: recipientProfileSnap.data()?.displayName, photoURL: recipientProfileSnap.data()?.photoURL || null }
            },
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            lastMessageTimestamp: admin.firestore.FieldValue.serverTimestamp(),
            lastMessage: "Conversation started.",
        };
        const newConvoRef = await conversationsRef.add(newConversation);
        return { conversationId: newConvoRef.id, isNew: true };
    }
});

/**
 * Fetches comments for a specific main feed post.
 */
export const getCommentsForPost = functions.https.onCall(async (data, context) => {
    const { postId } = data;
    if (!postId) {
        throw new functions.https.HttpsError("invalid-argument", "A postId must be provided.");
    }

    try {
        let query = db.collection(`posts/${postId}/comments`)
                      .orderBy("createdAt", "asc")
                      .limit(REPLIES_PER_PAGE); // Reuse reply limit

        const commentsSnapshot = await query.get();
        const comments = commentsSnapshot.docs.map(doc => {
            const commentData = doc.data();
            return {
                id: doc.id,
                ...commentData,
                createdAt: (commentData.createdAt as admin.firestore.Timestamp)?.toDate ? (commentData.createdAt as admin.firestore.Timestamp).toDate().toISOString() : new Date().toISOString(),
            };
        });
        
        return { comments };
    } catch (error) {
        console.error(`Error fetching comments for post ${postId}:`, error);
        throw new functions.https.HttpsError("internal", "An error occurred while fetching comments.");
    }
});

// =================================================================
// CONCEPTUAL FUTURE FUNCTIONS FOR MODULE 5
// =================================================================


/**
 * [Conceptual] Triggered by reported content, routes to moderation queue.
 * Could involve AI for initial screening.
 * This function was moved from ai-services.ts for better modularity.
 */
export const sentimentAnalysisCommunityPosts = functions.firestore.document('posts/{postId}').onCreate(async (snap, context) => {
    const postData = snap.data();
    console.log(`[Conceptual] Performing sentiment analysis on new post: ${context.params.postId}`);
    // 1. Get the text content of the post.
    // 2. Run it through an NLP sentiment analysis model (from Module 6).
    // 3. If sentiment is strongly negative or flags moderation keywords, create a task for the moderation team.
    return null;
});

/**
 * [Conceptual] Triggered by reported content, routes to moderation queue.
 * Could involve AI for initial screening.
 */
export const moderateContent = functions.https.onCall(async (data, context) => {
    // Placeholder logic
    console.log("Conceptual: Moderating content with data:", data);
    return { success: true, message: "[Conceptual] Content has been flagged for review." };
});
