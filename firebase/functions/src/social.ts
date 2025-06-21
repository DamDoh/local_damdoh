
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Ensure Firebase Admin is initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Creates a new post in the 'posts' collection.
 */
export const createPost = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
  }

  const { content, mediaUrl, mediaType, pollOptions } = data;
  if (typeof content !== "string" || content.trim().length === 0) {
    throw new functions.https.HttpsError("invalid-argument", "The function must be called with a valid 'content' argument.");
  }

  const userId = context.auth.uid;
  const newPost = {
    userId,
    content,
    mediaUrl: mediaUrl || null,
    mediaType: mediaType || null,
    pollOptions: pollOptions || null,
    likeCount: 0,
    commentCount: 0,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  try {
    const postRef = await db.collection("posts").add(newPost);
    return { status: "success", postId: postRef.id };
  } catch (error) {
    console.error("Error creating post:", error);
    throw new functions.https.HttpsError("internal", "An error occurred while creating the post.");
  }
});

/**
 * Fetches a list of posts for the main feed.
 */
export const getFeed = functions.https.onCall(async (data, context) => {
  try {
    const postsSnapshot = await db.collection("posts").orderBy("createdAt", "desc").limit(20).get();
    const posts = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { posts };
  } catch (error) {
    console.error("Error fetching feed:", error);
    throw new functions.https.HttpsError("internal", "An error occurred while fetching the feed.");
  }
});

/**
 * Likes or unlikes a post.
 */
export const likePost = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
  }

  const userId = context.auth.uid;
  const { postId } = data;

  if (typeof postId !== "string" || postId.trim().length === 0) {
    throw new functions.https.HttpsError("invalid-argument", "A valid 'postId' must be provided.");
  }

  const postRef = db.collection("posts").doc(postId);
  const likeRef = postRef.collection("likes").doc(userId);

  try {
    const likeDoc = await likeRef.get();

    if (likeDoc.exists) {
      // User has already liked the post, so unlike it
      await likeRef.delete();
      await postRef.update({ likeCount: admin.firestore.FieldValue.increment(-1) });
      return { status: "unliked" };
    } else {
      // User has not liked the post, so like it
      await likeRef.set({ createdAt: admin.firestore.FieldValue.serverTimestamp() });
      await postRef.update({ likeCount: admin.firestore.FieldValue.increment(1) });
      return { status: "liked" };
    }
  } catch (error) {
    console.error(`Error liking/unliking post ${postId}:`, error);
    throw new functions.https.HttpsError("internal", "An error occurred while processing the like.");
  }
});

/**
 * Adds a comment to a post.
 */
export const addComment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
  }

  const userId = context.auth.uid;
  const { postId, content } = data;

  if (typeof postId !== "string" || postId.trim().length === 0) {
    throw new functions.https.HttpsError("invalid-argument", "A valid 'postId' must be provided.");
  }
  if (typeof content !== "string" || content.trim().length === 0) {
    throw new functions.https.HttpsError("invalid-argument", "A valid 'content' for the comment must be provided.");
  }

  const postRef = db.collection("posts").doc(postId);
  
  const newComment = {
    userId,
    content,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  try {
    await postRef.collection("comments").add(newComment);
    await postRef.update({ commentCount: admin.firestore.FieldValue.increment(1) });
    return { status: "success" };
  } catch (error) {
    console.error(`Error adding comment to post ${postId}:`, error);
    throw new functions.https.HttpsError("internal", "An error occurred while adding the comment.");
  }
});
