
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();
const USERS_COLLECTION = 'users';

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
        lastActivityAt: (doc.data().lastActivityAt as admin.firestore.Timestamp)?.toDate ? (doc.data().lastActivityAt as admin.firestore.Timestamp).toDate().toISOString() : new Date().toISOString()
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
        const lastDoc = await db.doc(`forums/${topicId}/posts/${lastVisible}`).get();
        query = query.startAfter(lastDoc);
    }
    
    const postsSnapshot = await query.get();
    const posts = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const newLastVisible = posts.length === POSTS_PER_PAGE ? posts[posts.length - 1].id : null;

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

    const REPLIES_PER_PAGE = 10;
    let query = db.collection(`forums/${topicId}/posts/${postId}/replies`).orderBy('createdAt', 'asc').limit(REPLIES_PER_PAGE);
    
    if (lastVisible) {
        const lastDoc = await db.doc(`forums/${topicId}/posts/${postId}/replies/${lastVisible}`).get();
        query = query.startAfter(lastDoc);
    }

    const repliesSnapshot = await query.get();
    const replies = repliesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const newLastVisible = replies.length === REPLIES_PER_PAGE ? replies[replies.length - 1].id : null;
    
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

    const batch = db.batch();

    batch.set(replyRef, {
        content,
        authorRef: uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    batch.update(postRef, {
        replyCount: admin.firestore.FieldValue.increment(1),
    });

    await batch.commit();
    return { replyId: replyRef.id };
});
