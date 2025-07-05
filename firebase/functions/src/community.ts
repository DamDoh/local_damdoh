

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

export const createFeedPost = functions.https.onCall(async (data, context) => {
    const uid = checkAuth(context);
    const { content } = data;

    const userProfile = await getProfileByIdFromDB(uid);
    if (!userProfile) {
        throw new functions.https.HttpsError('not-found', 'User profile not found.');
    }
    
    const newPostRef = db.collection('posts').doc();
    await newPostRef.set({
        content,
        userId: uid,
        userName: userProfile.displayName, 
        userAvatar: userProfile.avatarUrl || null,
        userHeadline: userProfile.profileSummary || '',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        likesCount: 0,
        commentsCount: 0,
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
            transaction.delete(likeRef);
            transaction.update(postRef, { likesCount: admin.firestore.FieldValue.increment(-1) });
            return { success: true, action: 'unliked' };
        } else {
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

export const getCommentsForPost = functions.https.onCall(async (data, context) => {
    const { postId } = data;
    const query = db.collection(`posts/${postId}/comments`).orderBy('createdAt', 'desc');
    const commentsSnapshot = await query.get();
    
    const comments = commentsSnapshot.docs.map(doc => {
        const commentData = doc.data();
        return {
            id: doc.id,
            content: commentData.content,
            author: {
                id: commentData.userId,
                name: commentData.userName,
                avatarUrl: commentData.userAvatar,
            },
            timestamp: (commentData.createdAt as admin.firestore.Timestamp)?.toDate?.().toISOString(),
        }
    });

    return { comments };
});
