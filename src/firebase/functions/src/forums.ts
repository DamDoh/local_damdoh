

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import type { UserProfile } from "./types";

const db = admin.firestore();

const checkAuth = (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
  }
  return context.auth.uid;
};

export const getTopics = functions.https.onCall(async (data, context) => {
    const topicsSnapshot = await db.collection('forums').orderBy('lastActivityAt', 'desc').get();
    const topics = topicsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as admin.firestore.Timestamp)?.toDate?.().toISOString(),
        lastActivityAt: (doc.data().lastActivityAt as admin.firestore.Timestamp)?.toDate?.().toISOString()
    }));
    return { topics };
});

export const createTopic = functions.https.onCall(async (data, context) => {
    const uid = checkAuth(context);
    const { name, description } = data;

    if (!name || !description) {
        throw new functions.https.HttpsError('invalid-argument', 'Name and description are required.');
    }

    const newTopicRef = db.collection('forums').doc();
    await newTopicRef.set({
        name,
        description,
        creatorId: uid,
        postCount: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastActivityAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { topicId: newTopicRef.id };
});

export const getPostsForTopic = functions.https.onCall(async (data, context) => {
    const { topicId, lastVisible } = data;
    if (!topicId) throw new functions.https.HttpsError('invalid-argument', 'Topic ID is required.');

    const POSTS_PER_PAGE = 10;
    let query = db.collection(`forums/${topicId}/posts`).orderBy('createdAt', 'desc').limit(POSTS_PER_PAGE);

    if (lastVisible) {
        const lastDocSnapshot = await db.collection(`forums/${topicId}/posts`).doc(lastVisible).get();
        if(lastDocSnapshot.exists) {
            query = query.startAfter(lastDocSnapshot);
        }
    }
    
    const postsSnapshot = await query.get();
    
    const posts = postsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        createdAt: (doc.data().createdAt as admin.firestore.Timestamp)?.toDate?.().toISOString()
    }));

    const newLastVisible = posts.length > 0 ? posts[posts.length - 1].id : null;

    return { posts, lastVisible: newLastVisible };
});

export const createForumPost = functions.https.onCall(async (data, context) => {
    const uid = checkAuth(context);
    const { topicId, title, content } = data;
    if (!topicId || !title || !content) {
        throw new functions.https.HttpsError('invalid-argument', 'Topic ID, title, and content are required.');
    }

    const postRef = db.collection(`forums/${topicId}/posts`).doc();
    const topicRef = db.collection('forums').doc(topicId);
    const timestamp = admin.firestore.FieldValue.serverTimestamp();

    const batch = db.batch();

    batch.set(postRef, {
        title,
        content,
        authorRef: uid,
        createdAt: timestamp,
        replyCount: 0,
        likes: 0,
    });
    
    batch.update(topicRef, {
        postCount: admin.firestore.FieldValue.increment(1),
        lastActivityAt: timestamp
    });
    
    await batch.commit();

    return { postId: postRef.id };
});

export const getRepliesForPost = functions.https.onCall(async (data, context) => {
    const { topicId, postId, lastVisible } = data;
    if (!topicId || !postId) throw new functions.https.HttpsError('invalid-argument', 'Topic ID and Post ID are required.');

    const REPLIES_PER_PAGE = 15;
    let query = db.collection(`forums/${topicId}/posts/${postId}/replies`).orderBy('createdAt', 'asc').limit(REPLIES_PER_PAGE);
    
    if (lastVisible) {
        const lastDocSnapshot = await db.collection(`forums/${topicId}/posts/${postId}/replies`).doc(lastVisible).get();
        if(lastDocSnapshot.exists) {
            query = query.startAfter(lastDocSnapshot);
        }
    }

    const repliesSnapshot = await query.get();

    const authorIds = [...new Set(repliesSnapshot.docs.map(doc => doc.data().authorRef).filter(Boolean))];
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

    const replies = repliesSnapshot.docs.map(doc => {
        const data = doc.data();
        const authorProfile = profiles[data.authorRef] || { displayName: 'Unknown User', avatarUrl: null };
        return {
            id: doc.id,
            ...data,
            authorName: authorProfile.displayName,
            authorAvatarUrl: authorProfile.avatarUrl,
            createdAt: (data.createdAt as admin.firestore.Timestamp)?.toDate?.().toISOString(),
        }
    });
    
    const newLastVisible = replies.length > 0 ? replies[replies.length - 1].id : null;
    
    return { replies, lastVisible: newLastVisible };
});

export const addReplyToPost = functions.https.onCall(async (data, context) => {
    const uid = checkAuth(context);
    const { topicId, postId, content } = data;
    if (!topicId || !postId || !content) {
        throw new functions.https.HttpsError('invalid-argument', 'Topic ID, post ID, and content are required.');
    }

    const replyRef = db.collection(`forums/${topicId}/posts/${postId}/replies`).doc();
    const postRef = db.collection(`forums/${topicId}/posts`).doc(postId);
    const userProfileDoc = await db.collection('users').doc(uid).get();
    
    if (!userProfileDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'User profile not found.');
    }
    const userProfile = userProfileDoc.data() as UserProfile;


    const batch = db.batch();

    batch.set(replyRef, {
        content,
        authorRef: uid,
        authorName: userProfile.displayName,
        authorAvatarUrl: userProfile.avatarUrl || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    batch.update(postRef, {
        replyCount: admin.firestore.FieldValue.increment(1),
    });

    await batch.commit();
    return { replyId: replyRef.id };
});
