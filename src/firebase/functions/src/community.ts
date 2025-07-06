

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
    const { content, pollOptions } = data; // pollOptions is an array of objects with a 'text' property

    if (pollOptions && (!Array.isArray(pollOptions) || pollOptions.length < 2)) {
        throw new functions.https.HttpsError('invalid-argument', 'A poll must have at least two options.');
    }

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
        pollOptions: pollOptions ? pollOptions.map((opt: { text: string }) => ({ text: opt.text, votes: 0 })) : null,
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
        return { replies: [], lastVisible: null };
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

    return { replies: comments, lastVisible: newLastVisible };
});


export const voteOnPoll = functions.https.onCall(async (data, context) => {
    const uid = checkAuth(context);
    const { postId, optionIndex } = data;

    if (!postId || typeof optionIndex !== 'number') {
        throw new functions.https.HttpsError('invalid-argument', 'Post ID and a valid option index are required.');
    }

    const postRef = db.collection('posts').doc(postId);
    const voteRef = postRef.collection('votes').doc(uid);

    return db.runTransaction(async (transaction) => {
        const postDoc = await transaction.get(postRef);
        if (!postDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Post not found.');
        }

        const voteDoc = await transaction.get(voteRef);
        if (voteDoc.exists) {
            throw new functions.https.HttpsError('already-exists', 'You have already voted on this poll.');
        }

        const postData = postDoc.data()!;
        if (!postData.pollOptions || optionIndex < 0 || optionIndex >= postData.pollOptions.length) {
            throw new functions.https.HttpsError('invalid-argument', 'Invalid poll option.');
        }

        // Atomically update the vote count for the specific option
        const newPollOptions = [...postData.pollOptions];
        newPollOptions[optionIndex].votes = (newPollOptions[optionIndex].votes || 0) + 1;
        
        transaction.update(postRef, { pollOptions: newPollOptions });

        // Record the user's vote to prevent duplicates
        transaction.set(voteRef, {
            optionIndex,
            votedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        return { success: true, pollOptions: newPollOptions };
    });
});
