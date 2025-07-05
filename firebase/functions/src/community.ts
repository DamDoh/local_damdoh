
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
                link: `/posts/${doc.id}`, 
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
        userName: userProfile.displayName, 
        userAvatar: userProfile.avatarUrl || null,
        userHeadline: userProfile.profileSummary || '',
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
    const { postId, lastVisible } = data;
    if (!postId) {
        throw new functions.https.HttpsError("invalid-argument", "Post ID is required.");
    }
    
    const COMMENTS_PER_PAGE = 5;
    let query = db.collection(`posts/${postId}/comments`).orderBy('createdAt', 'asc').limit(COMMENTS_PER_PAGE);

    if (lastVisible) {
        const lastDocSnapshot = await db.collection(`posts/${postId}/comments`).doc(lastVisible).get();
        if(lastDocSnapshot.exists) {
            query = query.startAfter(lastDocSnapshot);
        }
    }

    const commentsSnapshot = await query.get();

    if (commentsSnapshot.empty) {
        return { comments: [], lastVisible: null };
    }

    const authorIds = [...new Set(commentsSnapshot.docs.map(doc => doc.data().userId).filter(Boolean))];
    const profiles: Record<string, any> = {};

    if (authorIds.length > 0) {
        const profileChunks: string[][] = [];
        for (let i = 0; i < authorIds.length; i += 30) {
            profileChunks.push(authorIds.slice(i, i + 30));
        }
        for (const chunk of profileChunks) {
            const profileDocs = await db.collection('users').where(admin.firestore.FieldPath.documentId(), 'in', chunk).get();
            profileDocs.forEach(doc => {
                profiles[doc.id] = {
                    displayName: doc.data().displayName || 'Unknown User',
                    avatarUrl: doc.data().avatarUrl || null,
                };
            });
        }
    }

    const comments = commentsSnapshot.docs.map(doc => {
        const commentData = doc.data();
        const authorProfile = profiles[commentData.userId] || { displayName: 'Unknown User', avatarUrl: null };
        return {
            id: doc.id,
            content: commentData.content,
            author: {
                id: commentData.userId,
                name: authorProfile.displayName,
                avatarUrl: authorProfile.avatarUrl,
            },
            timestamp: (commentData.createdAt as admin.firestore.Timestamp)?.toDate?.().toISOString(),
        }
    });
    
    const newLastVisible = comments.length > 0 ? comments[comments.length - 1].id : null;

    return { comments, lastVisible: newLastVisible };
});

    