
/**
 * =================================================================
 * Module 5: Community & Collaboration (The Social Heart of Agriculture)
 * =================================================================
 * This module fosters a vibrant, interconnected ecosystem of trust and
 * knowledge-sharing among all DamDoh stakeholders. It now primarily handles
 * the main social feed functionalities.
 *
 * @purpose To provide the backend for the main social feed, allowing users
 * to create posts, comment, and like content.
 *
 * @key_concepts
 * - Main Social Feed: A personalized feed aggregating relevant content from the platform.
 * - Engagement & Moderation: Systems for likes, comments, and maintaining a healthy community.
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

const db = admin.firestore();
const POSTS_PER_PAGE = 10;
const REPLIES_PER_PAGE = 15;


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
