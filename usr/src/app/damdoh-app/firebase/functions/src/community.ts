
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

    