
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { UserProfile } from "./types";
import { _internalInitiatePayment } from './module7'; // Import payment function
import { _internalLogTraceEvent } from './module1'; // Import trace event logger

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
        const topics = topicsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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

    const { name, description, regionTags } = data;

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
        return { topicId: docRef.id, message: "Topic created successfully" };
    } catch (error) {
        console.error("Error creating topic:", error);
        throw new functions.https.HttpsError("internal", "An error occurred while creating the topic.");
    }
});


export const getPostsForTopic = functions.https.onCall(async (data, context) => {
    const { topicId, lastVisible } = data;
    if (!topicId) {
        throw new functions.https.HttpsError("invalid-argument", "A topicId must be provided.");
    }

    try {
        let query = db.collection(`forums/${topicId}/posts`)
                      .orderBy("timestamp", "desc")
                      .limit(POSTS_PER_PAGE);

        if (lastVisible) {
            const lastVisibleDoc = await db.collection(`forums/${topicId}/posts`).doc(lastVisible).get();
            if(lastVisibleDoc.exists) {
                query = query.startAfter(lastVisibleDoc);
            }
        }

        const postsSnapshot = await query.get();
        const posts = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const newLastVisible = postsSnapshot.docs[postsSnapshot.docs.length - 1]?.id || null;

        return { posts, lastVisible: newLastVisible };
    } catch (error) {
        console.error(`Error fetching posts for topic ${topicId}:`, error);
        throw new functions.https.HttpsError("internal", "An error occurred while fetching posts.");
    }
});

export const createForumPost = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "You must be logged in to create a post.");
    }

    const { topicId, title, content } = data;
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
                lastActivity: admin.firestore.FieldValue.serverTimestamp()
            });
        });

        return { postId: newPostRef.id, message: "Post created successfully" };
    } catch (error) {
        console.error(`Error creating post in topic ${topicId}:`, error);
        throw new functions.https.HttpsError("internal", "An error occurred while creating the post.");
    }
});


export const getRepliesForPost = functions.https.onCall(async (data, context) => {
    const { topicId, postId, lastVisible } = data;
    if (!topicId || !postId) {
        throw new functions.https.HttpsError("invalid-argument", "A topicId and postId must be provided.");
    }

    try {
        let query = db.collection(`forums/${topicId}/posts/${postId}/replies`)
                      .orderBy("timestamp", "asc")
                      .limit(REPLIES_PER_PAGE);

        if (lastVisible) {
            const lastVisibleDoc = await db.collection(`forums/${topicId}/posts/${postId}/replies`).doc(lastVisible).get();
            if(lastVisibleDoc.exists){
                query = query.startAfter(lastVisibleDoc);
            }
        }

        const repliesSnapshot = await query.get();
        const replies = repliesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const newLastVisible = repliesSnapshot.docs[repliesSnapshot.docs.length - 1]?.id || null;

        return { replies, lastVisible: newLastVisible };
    } catch (error) {
        console.error(`Error fetching replies for post ${postId}:`, error);
        throw new functions.https.HttpsError("internal", "An error occurred while fetching replies.");
    }
});

export const addReplyToPost = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "You must be logged in to reply.");
    }

    const { topicId, postId, content } = data;
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
            lastActivity: admin.firestore.FieldValue.serverTimestamp()
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
        const groups = groupsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return { groups };
    } catch (error) {
        console.error("Error fetching groups:", error);
        throw new functions.https.HttpsError("internal", "An error occurred while fetching groups.");
    }
});

export const createGroup = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "You must be logged in to create a group.");
    }

    const { name, description, isPublic } = data;

    if (!name || !description) {
        throw new functions.https.HttpsError("invalid-argument", "Name and description are required.");
    }

    const newGroup = {
        name,
        description,
        isPublic: isPublic || false,
        memberCount: 1,
        ownerId: context.auth.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    try {
        const groupRef = await db.collection("groups").add(newGroup);
        await groupRef.collection("members").doc(context.auth.uid).set({
            role: "owner",
            joinedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return { groupId: groupRef.id, message: "Group created successfully" };
    } catch (error) {
        console.error("Error creating group:", error);
        throw new functions.https.HttpsError("internal", "An error occurred while creating the group.");
    }
});

export const getGroupDetails = functions.https.onCall(async (data, context) => {
    const { groupId } = data;
    if (!groupId) {
        throw new functions.https.HttpsError("invalid-argument", "A groupId must be provided.");
    }

    try {
        const groupDoc = await db.collection("groups").doc(groupId).get();
        if (!groupDoc.exists) {
            throw new functions.https.HttpsError("not-found", "Group not found.");
        }
        return { id: groupDoc.id, ...groupDoc.data() };
    } catch (error) {
        console.error(`Error fetching group details for ${groupId}:`, error);
        throw new functions.https.HttpsError("internal", "An error occurred while fetching group details.");
    }
});

export const getGroupMembers = functions.https.onCall(async (data, context) => {
    const { groupId } = data;
    if (!groupId) {
        throw new functions.https.HttpsError("invalid-argument", "A groupId must be provided.");
    }

    try {
        const membersSnapshot = await db.collection(`groups/${groupId}/members`).get();
        const memberIds = membersSnapshot.docs.map(doc => doc.id);
        
        if (memberIds.length === 0) {
            return [];
        }

        const userDocs = await db.collection("users").where(admin.firestore.FieldPath.documentId(), "in", memberIds).get();
        const members = userDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));

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

    const { groupId } = data;
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
            joinedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        await groupRef.update({ memberCount: admin.firestore.FieldValue.increment(1) });

        return { message: "Successfully joined the group." };
    } catch (error) {
        console.error(`Error joining group ${groupId}:`, error);
        throw new functions.https.HttpsError("internal", "An error occurred while joining the group.");
    }
});

export const leaveGroup = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "You must be logged in to leave a group.");
    }

    const { groupId } = data;
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

        return { message: "Successfully left the group." };
    } catch (error) {
        console.error(`Error leaving group ${groupId}:`, error);
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
        const { lastVisible } = data;
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
        const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const newLastVisible = snapshot.docs[snapshot.docs.length - 1]?.id || null;

        return { posts, lastVisible: newLastVisible };
    } catch (error) {
        console.error("Error fetching feed:", error);
        throw new functions.https.HttpsError("internal", "Could not fetch feed.");
    }
});

export const createFeedPost = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "You must be logged in to create a post.");
    }

    const { content, mediaUrl, pollOptions } = data;
    if (!content && !mediaUrl && !pollOptions) {
        throw new functions.https.HttpsError("invalid-argument", "Post must have content, media, or a poll.");
    }

    const newPost = {
        userId: context.auth.uid,
        content: content || "",
        mediaUrl: mediaUrl || null,
        mediaType: mediaUrl ? (mediaUrl.includes('.mp4') ? 'video' : 'image') : null,
        pollOptions: pollOptions || null,
        likeCount: 0,
        commentCount: 0,
        createdAt: FieldValue.serverTimestamp(),
    };

    try {
        const docRef = await db.collection("posts").add(newPost);
        return { postId: docRef.id, message: "Post created successfully" };
    } catch (error) {
        console.error("Error creating post:", error);
        throw new functions.https.HttpsError("internal", "An error occurred while creating the post.");
    }
});


export const likePost = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "You must be logged in to like a post.");
    }
    const { postId } = data;
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
            return { success: true, message: "Post unliked." };
        } else {
            // Like the post
            await likeRef.set({ createdAt: FieldValue.serverTimestamp() });
            await postRef.update({ likeCount: FieldValue.increment(1) });
            return { success: true, message: "Post liked." };
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
    const { postId, content } = data;
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
        return { success: true, commentId: commentRef.id, message: "Comment added successfully." };
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

    const { title, description, eventDate, location, eventType } = data;

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
        return { eventId: docRef.id, title: title };
    } catch (error) {
        console.error("Error creating agri-event:", error);
        throw new functions.https.HttpsError("internal", "Failed to create event in the database.");
    }
});

export const getAgriEvents = functions.https.onCall(async (data, context) => {
    try {
        const eventsSnapshot = await db.collection("agri_events").orderBy("eventDate", "asc").get();
        const events = eventsSnapshot.docs.map(doc => {
            const eventData = doc.data();
            return {
                id: doc.id,
                ...eventData,
                // Ensure eventDate is sent in a client-friendly format (ISO string)
                eventDate: eventData.eventDate ? (eventData.eventDate.toDate ? eventData.eventDate.toDate().toISOString() : eventData.eventDate) : null,
            };
        });
        return { events };
    } catch (error) {
        console.error("Error fetching agri-events:", error);
        throw new functions.https.HttpsError("internal", "An error occurred while fetching events.");
    }
});


export const getEventDetails = functions.https.onCall(async (data, context) => {
    const { eventId, includeAttendees } = data;
    if (!eventId) {
        throw new functions.https.HttpsError("invalid-argument", "Event ID is required.");
    }

    const eventRef = db.collection('agri_events').doc(eventId);
    const eventSnap = await eventRef.get();

    if (!eventSnap.exists) {
        throw new functions.https.HttpsError("not-found", "Event not found.");
    }

    const eventData = eventSnap.data()!;
    let isRegistered = false;
    let attendees: any[] = [];

    if (context.auth) {
        const registrationRef = eventRef.collection('registrations').doc(context.auth.uid);
        const registrationSnap = await registrationRef.get();
        isRegistered = registrationSnap.exists;
    }
    
    // Security Check: Only return attendee list if the caller is the organizer
    if (includeAttendees && context.auth && context.auth.uid === eventData.organizerId) {
        const registrationsSnap = await eventRef.collection('registrations').get();
        const attendeeIds = registrationsSnap.docs.map(doc => doc.id);

        if (attendeeIds.length > 0) {
            const userDocs = await db.collection('users').where(admin.firestore.FieldPath.documentId(), 'in', attendeeIds).get();
            const profiles: { [key: string]: UserProfile } = {};
            userDocs.forEach(doc => {
                profiles[doc.id] = doc.data() as UserProfile;
            });

            attendees = registrationsSnap.docs.map(regDoc => {
                const profile = profiles[regDoc.id];
                const regData = regDoc.data();
                return {
                    id: regDoc.id,
                    displayName: profile?.name || 'Unknown User',
                    email: profile?.email || 'No email',
                    avatarUrl: profile?.avatarUrl || '',
                    registeredAt: regData.registeredAt.toDate().toISOString(),
                    checkedIn: regData.checkedIn || false,
                    checkedInAt: regData.checkedInAt ? regData.checkedInAt.toDate().toISOString() : null,
                };
            });
        }
    }
    
    const eventResult = {
        ...eventData,
        id: eventSnap.id,
        isRegistered,
        attendees,
        eventDate: eventData.eventDate ? (eventData.eventDate.toDate ? eventData.eventDate.toDate().toISOString() : eventData.eventDate) : null,
    };

    return eventResult;
});


export const registerForEvent = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "You must be logged in to register.");
    }
    
    const { eventId, couponCode } = data;
    if (!eventId) {
        throw new functions.https.HttpsError("invalid-argument", "Event ID is required.");
    }

    const userId = context.auth.uid;
    const eventRef = db.collection('agri_events').doc(eventId);
    const registrationRef = eventRef.collection('registrations').doc(userId);

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

        // --- Coupon Logic ---
        if (couponCode && typeof couponCode === 'string' && finalPrice > 0) {
            const couponsQuery = eventRef.collection('coupons').where('code', '==', couponCode.toUpperCase()).limit(1);
            const couponSnapshot = await transaction.get(couponsQuery);
            
            if (couponSnapshot.empty) {
                throw new functions.https.HttpsError("not-found", "Invalid coupon code.");
            }
            
            const couponDoc = couponSnapshot.docs[0];
            const couponData = couponDoc.data();
            couponRef = couponDoc.ref;

            // Check usage limit
            if (couponData.usageLimit && couponData.usageCount >= couponData.usageLimit) {
                throw new functions.https.HttpsError("failed-precondition", "Coupon has reached its usage limit.");
            }
            // Check expiration
            if (couponData.expiresAt && couponData.expiresAt.toDate() < new Date()) {
                throw new functions.https.HttpsError("failed-precondition", "This coupon has expired.");
            }
            
            // Calculate discounted price
            if (couponData.discountType === 'percentage') {
                discountApplied = finalPrice * (couponData.discountValue / 100);
            } else if (couponData.discountType === 'fixed') {
                discountApplied = couponData.discountValue;
            }
            
            finalPrice = Math.max(0, finalPrice - discountApplied);
        }

        // Synergy: Payment Integration
        if (finalPrice > 0) {
            console.log(`Paid event registration for event ${eventId}. Final price after discount: ${finalPrice}. Initiating payment flow.`);
            try {
                await _internalInitiatePayment({
                    orderId: `event_${eventId}_${userId}`,
                    amount: finalPrice,
                    currency: eventData.currency || 'USD',
                    buyerInfo: { userId },
                    sellerInfo: { organizerId: eventData.organizerId },
                    description: `Registration for event: ${eventData.title}${discountApplied > 0 ? ` (Discount applied: ${eventData.currency || 'USD'} ${discountApplied.toFixed(2)})` : ''}`
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
            amountPaid: finalPrice
        });
        
        transaction.update(eventRef, {
            registeredAttendeesCount: FieldValue.increment(1)
        });
        
        if (couponRef) {
            transaction.update(couponRef, { usageCount: FieldValue.increment(1) });
        }
        
        return { success: true, message: "Successfully registered for the event.", finalPrice, discountApplied };
    });
});

export const checkInAttendee = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "You must be an organizer to check in attendees.");
    }

    const { eventId, attendeeId } = data;
    if (!eventId || !attendeeId) {
        throw new functions.https.HttpsError("invalid-argument", "Event ID and Attendee ID are required.");
    }

    const organizerId = context.auth.uid;
    const eventRef = db.collection('agri_events').doc(eventId);
    const registrationRef = eventRef.collection('registrations').doc(attendeeId);

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
        checkedInAt: FieldValue.serverTimestamp()
    });

    // Synergy: Traceability Integration
    // Log the attendance as a verifiable event on the user's personal VTI log.
    try {
        const eventName = eventDoc.data()?.title || 'Unknown Event';
        console.log(`Logging ATTENDED_EVENT for user ${attendeeId} at event "${eventName}"`);
        await _internalLogTraceEvent({
            vtiId: attendeeId, // The user's ID is their personal VTI
            eventType: 'ATTENDED_EVENT',
            actorRef: organizerId, // The organizer is the actor verifying attendance
            geoLocation: null, // Could add event location here in future
            payload: {
                eventId: eventId,
                eventName: eventName,
                organizerId: organizerId,
                notes: "Attendee checked in by organizer."
            },
            farmFieldId: `user-credential:${attendeeId}` // A way to group user credential events
        });
        console.log(`Successfully logged traceable attendance for user ${attendeeId}`);
    } catch (traceError) {
        // Log the error but don't fail the check-in process
        console.error(`Failed to log traceability event for user ${attendeeId}'s attendance:`, traceError);
    }


    return { success: true, message: `Attendee ${attendeeId} checked in.`};
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
    const coupons = couponsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

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

    const conversations = snapshot.docs.map(doc => {
        const data = doc.data();
        const otherParticipantId = data.participantIds.find((pId: string) => pId !== uid);
        const otherParticipantInfo = data.participantInfo[otherParticipantId] || { name: 'Unknown User', avatarUrl: '' };

        return {
            id: doc.id,
            participant: {
                id: otherParticipantId,
                name: otherParticipantInfo.name,
                avatarUrl: otherParticipantInfo.avatarUrl,
            },
            lastMessage: data.lastMessage,
            timestamp: data.lastMessageTimestamp.toDate().toISOString(),
            unreadCount: 0, // Simplified for now
        };
    });

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
            timestamp: data.timestamp.toDate().toISOString(),
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
                [uid]: { name: userProfileSnap.data()?.name, avatarUrl: userProfileSnap.data()?.avatarUrl || null },
                [recipientId]: { name: recipientProfileSnap.data()?.name, avatarUrl: recipientProfileSnap.data()?.avatarUrl || null }
            },
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            lastMessageTimestamp: admin.firestore.FieldValue.serverTimestamp(),
            lastMessage: "Conversation started.",
        };
        const newConvoRef = await conversationsRef.add(newConversation);
        return { conversationId: newConvoRef.id, isNew: true };
    }
});

```
  </change>
  <change>
    <file>src/app/messages/page.tsx</file>
    <content><![CDATA[
"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Search, MessageSquare, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from '@/lib/utils';
import type { Conversation, Message } from '@/lib/types';
import { useAuth } from '@/lib/auth-utils';
import { useToast } from '@/hooks/use-toast';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';

const functions = getFunctions(firebaseApp);
const getConversationsCallable = httpsCallable(functions, 'getConversationsForUser');
const getMessagesCallable = httpsCallable(functions, 'getMessagesForConversation');
const sendMessageCallable = httpsCallable(functions, 'sendMessage');
const getOrCreateConversationCallable = httpsCallable(functions, 'getOrCreateConversation');

function MessagingContent() {
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoadingConversations, setIsLoadingConversations] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [isSending, setIsSending] = useState(false);

    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const handleConversationSelect = useCallback(async (conversation: Conversation) => {
        if (selectedConversation?.id === conversation.id && messages.length > 0) return;

        setSelectedConversation(conversation);
        setIsLoadingMessages(true);
        setMessages([]);
        try {
            const result = await getMessagesCallable({ conversationId: conversation.id });
            const data = result.data as { messages: Message[] };
            setMessages(data.messages || []);
        } catch (error) {
            console.error("Failed to fetch messages", error);
            toast({ variant: "destructive", title: "Error", description: "Could not load messages for this conversation." });
        } finally {
            setIsLoadingMessages(false);
        }
    }, [selectedConversation?.id, messages.length, toast]);
    
    useEffect(() => {
        if (scrollAreaRef.current) {
          const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
          if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
          }
        }
    }, [messages]);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            setIsLoadingConversations(false);
            return;
        }

        const fetchInitialData = async () => {
            setIsLoadingConversations(true);
            try {
                const convResult = await getConversationsCallable();
                const convos = (convResult.data as { conversations: Conversation[] }).conversations || [];
                setConversations(convo);

                const recipientId = searchParams.get('with');
                if (recipientId) {
                    const existingConvo = convos.find(c => c.participant?.id === recipientId);
                    if (existingConvo) {
                        await handleConversationSelect(existingConvo);
                    } else {
                        const result = await getOrCreateConversationCallable({ recipientId });
                        const { conversationId } = result.data as { conversationId: string };
                        const newConvResult = await getConversationsCallable();
                        const newConvos = (newConvResult.data as { conversations: Conversation[] }).conversations || [];
                        setConversations(newConvos);
                        const newCreatedConvo = newConvos.find(c => c.id === conversationId);
                        if (newCreatedConvo) {
                            await handleConversationSelect(newCreatedConvo);
                        }
                    }
                } else if (convos.length > 0) {
                    await handleConversationSelect(convos[0]);
                }
            } catch (error) {
                console.error("Error fetching initial conversations:", error);
                toast({ variant: "destructive", title: "Error", description: "Could not load your conversations." });
            } finally {
                setIsLoadingConversations(false);
            }
        };

        fetchInitialData();
    }, [user, authLoading, searchParams, toast, handleConversationSelect]);
    
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!newMessage.trim() || !selectedConversation || !user) return;
        
        const tempId = `temp-${Date.now()}`;
        const message: Message = {
            id: tempId,
            conversationId: selectedConversation.id,
            senderId: user.uid,
            content: newMessage,
            timestamp: new Date().toISOString()
        };
        
        const originalMessage = newMessage;
        setMessages(prev => [...prev, message]);
        setNewMessage("");
        setIsSending(true);

        try {
            await sendMessageCallable({ conversationId: selectedConversation.id, content: originalMessage });
        } catch (error) {
            console.error("Failed to send message", error);
            toast({ variant: "destructive", title: "Send Failed", description: "Your message could not be sent." });
            setMessages(prev => prev.filter(m => m.id !== tempId)); // Remove optimistic message on failure
            setNewMessage(originalMessage);
        } finally {
             setIsSending(false);
        }
    };
    
    if (authLoading) {
        return <MessagingSkeleton />;
    }

    if (!user) {
        return (
            <Card className="h-[calc(100vh-8rem)] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-muted-foreground">Please sign in to view your messages.</p>
                    <Button asChild className="mt-4"><Link href="/auth/signin">Sign In</Link></Button>
                </div>
            </Card>
        );
    }

    return (
        <Card className="h-[calc(100vh-8rem)] grid grid-cols-1 md:grid-cols-[300px_1fr] overflow-hidden">
            {/* Conversations List Panel */}
            <div className="flex flex-col border-r h-full">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-semibold">Messages</h2>
                    <div className="relative mt-2">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                         <Input placeholder="Search messages..." className="pl-10"/>
                    </div>
                </div>
                <ScrollArea className="flex-grow">
                    {isLoadingConversations ? (
                        <div className="p-4 space-y-2">
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                        </div>
                    ) : conversations.length > 0 ? (
                        conversations.map(convo => (
                            <div 
                                key={convo.id} 
                                className={cn(
                                    "p-4 flex gap-3 cursor-pointer hover:bg-accent",
                                    selectedConversation?.id === convo.id && "bg-accent"
                                )}
                                onClick={() => handleConversationSelect(convo)}
                            >
                                <Avatar>
                                    <AvatarImage src={convo.participant.avatarUrl} data-ai-hint="profile agriculture" />
                                    <AvatarFallback>{convo.participant.name.substring(0,2)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-grow overflow-hidden">
                                    <div className="flex justify-between">
                                        <h3 className="font-semibold truncate">{convo.participant.name}</h3>
                                        <p className="text-xs text-muted-foreground whitespace-nowrap">
                                            {convo.lastMessageTimestamp ? new Date(convo.lastMessageTimestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                                        </p>
                                    </div>
                                    <p className="text-sm text-muted-foreground truncate">{convo.lastMessage}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-sm text-muted-foreground">No conversations yet.</div>
                    )}
                </ScrollArea>
            </div>

            {/* Active Chat Panel */}
            <div className="flex flex-col h-full bg-muted/30">
                {selectedConversation ? (
                    <>
                        <div className="p-4 border-b flex items-center gap-3 bg-background">
                            <Avatar>
                                <AvatarImage src={selectedConversation.participant.avatarUrl} data-ai-hint="profile person agriculture" />
                                <AvatarFallback>{selectedConversation.participant.name.substring(0,2)}</AvatarFallback>
                            </Avatar>
                            <h3 className="font-semibold">{selectedConversation.participant.name}</h3>
                        </div>
                        <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
                            {isLoadingMessages ? (
                                <div className="flex justify-center items-center h-full">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {messages.map(msg => (
                                        <div key={msg.id} className={cn(
                                            "flex gap-2 items-end",
                                            msg.senderId === user.uid ? "justify-end" : "justify-start"
                                        )}>
                                            {msg.senderId !== user.uid && <Avatar className="h-6 w-6"><AvatarImage src={selectedConversation.participant.avatarUrl}/><AvatarFallback>{selectedConversation.participant.name.substring(0,1)}</AvatarFallback></Avatar>}
                                            <div className={cn(
                                                "p-3 rounded-lg max-w-xs lg:max-w-md shadow-sm",
                                                msg.senderId === user.uid ? "bg-primary text-primary-foreground rounded-br-none" : "bg-background rounded-bl-none"
                                            )}>
                                                {msg.content}
                                            </div>
                                             {msg.senderId === user.uid && <Avatar className="h-6 w-6"><AvatarImage src={user.photoURL || undefined} data-ai-hint="profile person" /><AvatarFallback>ME</AvatarFallback></Avatar>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                        <div className="p-4 border-t bg-background">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <Input 
                                    placeholder="Type your message..." 
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    disabled={isSending}
                                />
                                <Button type="submit" disabled={!newMessage.trim() || isSending}>
                                    {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                </Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        {isLoadingConversations ? (
                            <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                        ) : (
                            <>
                                <MessageSquare className="h-12 w-12 mb-4"/>
                                <p>Select a conversation to start chatting</p>
                            </>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
}

const MessagingSkeleton = () => (
    <Card className="h-[calc(100vh-8rem)] grid grid-cols-1 md:grid-cols-[300px_1fr] overflow-hidden">
        <div className="flex flex-col border-r h-full">
            <div className="p-4 border-b space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-9 w-full" />
            </div>
            <div className="p-4 space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </div>
        </div>
        <div className="flex flex-col h-full bg-muted/30">
             <div className="p-4 border-b flex items-center gap-3 bg-background">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-5 w-32" />
            </div>
            <div className="flex-grow p-4"></div>
            <div className="p-4 border-t bg-background">
                 <Skeleton className="h-10 w-full" />
            </div>
        </div>
    </Card>
)

export default function MessagesPage() {
    return (
        <Suspense fallback={<MessagingSkeleton />}>
            <MessagingContent />
        </Suspense>
    )
}
