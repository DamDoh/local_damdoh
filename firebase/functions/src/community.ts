
// Note: The functions related to knowledge hub and courses have been removed
// from this file and are now located in `knowledge-hub.ts`.
// This file should only contain functions related to community and social engagement.
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { getProfileByIdFromDB } from './profiles';

const db = admin.firestore();

// Helper to check for authentication in a consistent way
const checkAuth = (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated.",
    );
  }
  return context.auth.uid;
};


export const getFeed = functions.https.onCall(async (data, context) => {
    // A real-world implementation would involve complex algorithmic sorting.
    // For now, we'll fetch the most recent posts from the 'posts' collection.
    try {
        const postsSnapshot = await db.collection('posts')
            .orderBy('createdAt', 'desc')
            .limit(20) // Limit to the 20 most recent posts
            .get();
        
        const posts = postsSnapshot.docs.map(doc => {
            const postData = doc.data();
            return {
                id: doc.id,
                type: postData.pollOptions ? 'poll' : 'forum_post', // Simple logic to differentiate post types
                timestamp: (postData.createdAt as admin.firestore.Timestamp)?.toDate?.().toISOString() || new Date().toISOString(),
                userId: postData.userId,
                userName: postData.userName,
                userAvatar: postData.userAvatar,
                userHeadline: postData.userHeadline,
                content: postData.content,
                likesCount: postData.likesCount || 0,
                commentsCount: postData.commentsCount || 0,
                pollOptions: postData.pollOptions || null,
                // These are placeholders as we don't store them on this post model yet
                link: `/posts/${doc.id}`, // A conceptual link
                postImage: null, 
                dataAiHint: null, 
            };
        });
        
        return { posts };

    } catch (error) {
        console.error("Error fetching feed posts:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch feed data.");
    }
});


export const createFeedPost = functions.https.onCall(async (data, context) => {
    const uid = checkAuth(context);
    const { content, pollOptions } = data; // pollOptions is an array of strings

    const userProfile = await getProfileByIdFromDB(uid);
    if (!userProfile) {
        throw new functions.https.HttpsError('not-found', 'User profile not found.');
    }
    
    const newPostRef = db.collection('posts').doc();
    await newPostRef.set({
        content,
        userId: uid,
        userName: userProfile.displayName, // Denormalized data
        userAvatar: userProfile.avatarUrl || null, // Denormalized data
        userHeadline: userProfile.profileSummary || '', // Denormalized data
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        likesCount: 0,
        commentsCount: 0,
        pollOptions: pollOptions ? pollOptions.map((opt: string) => ({ text: opt, votes: 0 })) : null,
    });
    
    return { success: true, postId: newPostRef.id };
});

export const likePost = functions.https.onCall(async (data, context) => {
    const uid = checkAuth(context);
    const { postId } = data;

    const postRef = db.collection('posts').doc(postId);
    const likeRef = postRef.collection('likes').doc(uid);
    
    return db.runTransaction(async (transaction) => {
        const likeDoc = await transaction.get(likeRef);
        
        if (likeDoc.exists) {
            // User is unliking the post
            transaction.delete(likeRef);
            transaction.update(postRef, { likesCount: admin.firestore.FieldValue.increment(-1) });
            return { success: true, action: 'unliked' };
        } else {
            // User is liking the post
            transaction.set(likeRef, { createdAt: admin.firestore.FieldValue.serverTimestamp() });
            transaction.update(postRef, { likesCount: admin.firestore.FieldValue.increment(1) });
            return { success: true, action: 'liked' };
        }
    });
});


export const addComment = functions.https.onCall(async (data, context) => {
    const uid = checkAuth(context);
    const { postId, content } = data;

    if (!content || !postId) {
         throw new functions.https.HttpsError('invalid-argument', 'Post ID and content are required.');
    }

    const postRef = db.collection('posts').doc(postId);
    const commentRef = postRef.collection('comments').doc();

    const userProfile = await getProfileByIdFromDB(uid);
     if (!userProfile) {
        throw new functions.https.HttpsError('not-found', 'User profile not found.');
    }

    const batch = db.batch();

    batch.set(commentRef, {
        content,
        userId: uid,
        userName: userProfile.displayName,
        userAvatar: userProfile.avatarUrl || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    batch.update(postRef, { commentsCount: admin.firestore.FieldValue.increment(1) });

    await batch.commit();
    return { success: true, commentId: commentRef.id };
});

// For fetching comments on feed items, which might be different from forum replies
export const getCommentsForPost = functions.https.onCall(async (data, context) => {
    const { postId } = data;
    if (!postId) {
        throw new functions.https.HttpsError("invalid-argument", "Post ID is required.");
    }
    
    const commentsSnapshot = await db.collection(`posts/${postId}/comments`).orderBy('createdAt', 'asc').get();

    const comments = commentsSnapshot.docs.map(doc => {
        const commentData = doc.data();
        return {
            id: doc.id,
            ...commentData,
            createdAt: (commentData.createdAt as admin.firestore.Timestamp)?.toDate?.().toISOString(),
        }
    });

    return { comments };
});
