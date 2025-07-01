
/**
 * =================================================================
 * Module 5 Sub-Module: Community Forums
 * =================================================================
 * This module handles all functionalities related to the public
 * discussion forums. It allows for the creation of topics, posts,
 * and replies, fostering knowledge sharing and discussion.
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import type { ForumTopic, ForumPost, PostReply } from "./types";

const db = admin.firestore();
const POSTS_PER_PAGE = 10;
const REPLIES_PER_PAGE = 15;

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
