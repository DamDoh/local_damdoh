
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as Vision from "@google-cloud/vision";

// Initialize Firebase and Vision API clients
if (admin.apps.length === 0) {
  admin.initializeApp();
}
const visionClient = new Vision.ImageAnnotatorClient();
const db = admin.firestore();

// ... (createPost, moderatePost, getFeed, likePost, addComment, notifyOnLike, notifyOnComment functions are here)
// NOTE: For brevity, I am omitting the existing functions, but they should remain in the file.


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
    moderation: {
        status: 'pending_review', // Default status for all posts
        reviewedAt: null,
    }
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
 * A Firestore trigger that runs when a new post is created for text moderation.
 */
export const moderateText = functions.firestore
    .document('posts/{postId}')
    .onCreate(async (snap, context) => {
        const post = snap.data();
        // Only moderate text if there's no image to moderate, or do it in parallel
        if (post.mediaUrl) {
            console.log(`Post ${context.params.postId} has an image, deferring moderation decision to image moderator.`);
            return null;
        }

        const content = post.content;
        const blocklist = ["badword1", "badword2", "inappropriate"];
        const isExplicit = blocklist.some(word => content.toLowerCase().includes(word));

        return snap.ref.update({
            'moderation.status': isExplicit ? 'rejected' : 'approved',
            'moderation.reviewedAt': admin.firestore.FieldValue.serverTimestamp(),
            'moderation.moderator': 'text-moderator-v1'
        });
    });


/**
 * A Storage trigger that runs when a new image is uploaded for a post.
 * It uses the Cloud Vision API to detect inappropriate content.
 */
export const moderateImage = functions.storage.object().onFinalize(async (object) => {
    // We expect a file path like 'posts/{postId}/{fileName}'
    const filePath = object.name;
    if (!filePath || !filePath.startsWith('posts/')) {
        return console.log('This is not a post image.');
    }

    const bucketName = object.bucket;
    const gcsUri = `gs://${bucketName}/${filePath}`;

    // Extract postId from file path.
    const parts = filePath.split('/');
    const postId = parts[1];

    try {
        const [result] = await visionClient.safeSearchDetection(gcsUri);
        const safeSearch = result.safeSearchAnnotation;

        // Check if the image is likely to be inappropriate
        const isAdult = safeSearch?.adult === 'LIKELY' || safeSearch?.adult === 'VERY_LIKELY';
        const isViolent = safeSearch?.violence === 'LIKELY' || safeSearch?.violence === 'VERY_LIKELY';

        if (isAdult || isViolent) {
            console.log(`Image for post ${postId} flagged as inappropriate.`);
            await db.collection('posts').doc(postId).update({
                'moderation.status': 'rejected',
                'moderation.reason': 'inappropriate_image_content',
                'moderation.reviewedAt': admin.firestore.FieldValue.serverTimestamp(),
                'moderation.moderator': 'vision-api'
            });
        } else {
            console.log(`Image for post ${postId} seems clean.`);
             await db.collection('posts').doc(postId).update({
                'moderation.status': 'approved',
                'moderation.reviewedAt': admin.firestore.FieldValue.serverTimestamp(),
                'moderation.moderator': 'vision-api'
            });
        }
    } catch (error) {
        console.error(`Failed to moderate image for post ${postId}.`, error);
    }
     return null;
});



/**
 * Fetches and personalizes a list of posts for the main feed.
 */
export const getFeed = functions.https.onCall(async (data, context) => {
  try {
    const postsSnapshot = await db.collection("posts")
                                  .where('moderation.status', '==', 'approved')
                                  .orderBy("createdAt", "desc")
                                  .limit(50) 
                                  .get();
    
    let posts = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const personalizedPosts = posts.map(post => {
      let score = 0;
      score += (post.likeCount || 0) * 0.5;
      score += (post.commentCount || 0) * 1.0;
      const hoursOld = (Date.now() - post.createdAt.toDate().getTime()) / (1000 * 60 * 60);
      score -= hoursOld * 0.2;
      return { ...post, score };
    });

    personalizedPosts.sort((a, b) => b.score - a.score);
    return { posts: personalizedPosts.slice(0, 20) };
  } catch (error) {
    console.error("Error fetching and personalizing feed:", error);
    throw new functions.https.HttpsError( "internal", "An error occurred while fetching the feed.");
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
      await likeRef.delete();
      await postRef.update({ likeCount: admin.firestore.FieldValue.increment(-1) });
      return { status: "unliked" };
    } else {
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


/**
 * Creates a notification when a post is liked.
 */
export const notifyOnLike = functions.firestore
    .document('posts/{postId}/likes/{userId}')
    .onCreate(async (snap, context) => {
        const { postId, userId } = context.params;
        const postDoc = await db.collection('posts').doc(postId).get();
        if (!postDoc.exists) return;

        const post = postDoc.data()!;
        const postAuthorId = post.userId;
        if (postAuthorId === userId) return;

        const notification = {
            userId: postAuthorId,
            actorId: userId,
            type: 'like',
            postId: postId,
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };
        return db.collection('notifications').add(notification);
    });

/**
 * Creates a notification when a comment is added to a post.
 */
export const notifyOnComment = functions.firestore
    .document('posts/{postId}/comments/{commentId}')
    .onCreate(async (snap, context) => {
        const { postId } = context.params;
        const comment = snap.data();
        const commenterId = comment.userId;

        const postDoc = await db.collection('posts').doc(postId).get();
        if (!postDoc.exists) return;
        
        const post = postDoc.data()!;
        const postAuthorId = post.userId;
        if (postAuthorId === commenterId) return;

        const notification = {
            userId: postAuthorId,
            actorId: commenterId,
            type: 'comment',
            postId: postId,
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };
        return db.collection('notifications').add(notification);
    });
