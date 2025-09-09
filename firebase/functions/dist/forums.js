"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.addReplyToPost = exports.getRepliesForPost = exports.createForumPost = exports.getPostsForTopic = exports.createTopic = exports.getTopics = exports.getForumTopicSuggestions = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const profiles_1 = require("./profiles");
const forum_topic_suggestions_1 = require("../../src/ai/flows/forum-topic-suggestions");
const db = admin.firestore();
const checkAuth = (context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    return context.auth.uid;
};
// New function to securely call the AI flow
exports.getForumTopicSuggestions = functions.https.onCall(async (data, context) => {
    checkAuth(context);
    const { existingTopics, language } = data;
    if (!existingTopics) {
        throw new functions.https.HttpsError('invalid-argument', 'Existing topics are required.');
    }
    try {
        const suggestions = await (0, forum_topic_suggestions_1.suggestForumTopics)({ existingTopics, language });
        return suggestions;
    }
    catch (error) {
        console.error("Error calling suggestForumTopics flow:", error);
        throw new functions.https.HttpsError("internal", "Failed to get topic suggestions.");
    }
});
exports.getTopics = functions.https.onCall(async (data, context) => {
    const topicsSnapshot = await db.collection('forums').orderBy('lastActivityAt', 'desc').get();
    const topics = topicsSnapshot.docs.map(doc => {
        var _a, _b, _c, _d;
        return (Object.assign(Object.assign({ id: doc.id }, doc.data()), { createdAt: (_b = (_a = doc.data().createdAt) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a).toISOString(), lastActivityAt: (_d = (_c = doc.data().lastActivityAt) === null || _c === void 0 ? void 0 : _c.toDate) === null || _d === void 0 ? void 0 : _d.call(_c).toISOString() }));
    });
    return { topics };
});
exports.createTopic = functions.https.onCall(async (data, context) => {
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
exports.getPostsForTopic = functions.https.onCall(async (data, context) => {
    const { topicId, lastVisible } = data;
    if (!topicId)
        throw new functions.https.HttpsError('invalid-argument', 'Topic ID is required.');
    const POSTS_PER_PAGE = 10;
    let query = db.collection(`forums/${topicId}/posts`).orderBy('createdAt', 'desc').limit(POSTS_PER_PAGE);
    if (lastVisible) {
        const lastDocSnapshot = await db.collection(`forums/${topicId}/posts`).doc(lastVisible).get();
        if (lastDocSnapshot.exists) {
            query = query.startAfter(lastDocSnapshot);
        }
    }
    const postsSnapshot = await query.get();
    if (postsSnapshot.empty) {
        return { posts: [], lastVisible: null };
    }
    const posts = postsSnapshot.docs.map(doc => {
        var _a, _b;
        const postData = doc.data();
        return Object.assign(Object.assign({ id: doc.id }, postData), { author: {
                id: postData.authorRef,
                name: postData.authorName || "Unknown User",
                avatarUrl: postData.authorAvatarUrl || null
            }, createdAt: (_b = (_a = postData.createdAt) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a).toISOString() });
    });
    const newLastVisible = posts.length > 0 ? posts[posts.length - 1].id : null;
    return { posts, lastVisible: newLastVisible };
});
exports.createForumPost = functions.https.onCall(async (data, context) => {
    const uid = checkAuth(context);
    const { topicId, title, content } = data;
    if (!topicId || !title || !content) {
        throw new functions.https.HttpsError('invalid-argument', 'Topic ID, title, and content are required.');
    }
    const userProfile = await (0, profiles_1.getProfileByIdFromDB)(uid);
    if (!userProfile) {
        throw new functions.https.HttpsError('not-found', 'User profile not found.');
    }
    const postRef = db.collection(`forums/${topicId}/posts`).doc();
    const topicRef = db.collection('forums').doc(topicId);
    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    const batch = db.batch();
    // Denormalize author info on write
    batch.set(postRef, {
        title,
        content,
        authorRef: uid,
        authorName: userProfile.displayName,
        authorAvatarUrl: userProfile.avatarUrl,
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
exports.getRepliesForPost = functions.https.onCall(async (data, context) => {
    const { topicId, postId, lastVisible } = data;
    if (!topicId || !postId)
        throw new functions.https.HttpsError('invalid-argument', 'Topic ID and Post ID are required.');
    const REPLIES_PER_PAGE = 15;
    let query = db.collection(`forums/${topicId}/posts/${postId}/replies`).orderBy('createdAt', 'asc').limit(REPLIES_PER_PAGE);
    if (lastVisible) {
        const lastDocSnapshot = await db.collection(`forums/${topicId}/posts/${postId}/replies`).doc(lastVisible).get();
        if (lastDocSnapshot.exists) {
            query = query.startAfter(lastDocSnapshot);
        }
    }
    const repliesSnapshot = await query.get();
    if (repliesSnapshot.empty) {
        return { replies: [], lastVisible: null };
    }
    const replies = repliesSnapshot.docs.map(doc => {
        var _a, _b;
        const data = doc.data();
        return {
            id: doc.id,
            content: data.content,
            author: {
                id: data.authorRef,
                name: data.authorName || 'Unknown User',
                avatarUrl: data.authorAvatarUrl || null,
            },
            createdAt: (_b = (_a = data.createdAt) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a).toISOString()
        };
    });
    const newLastVisible = replies.length > 0 ? replies[replies.length - 1].id : null;
    return { replies, lastVisible: newLastVisible };
});
exports.addReplyToPost = functions.https.onCall(async (data, context) => {
    const uid = checkAuth(context);
    const { topicId, postId, content } = data;
    if (!topicId || !postId || !content) {
        throw new functions.https.HttpsError('invalid-argument', 'Topic ID, post ID, and content are required.');
    }
    const userProfile = await (0, profiles_1.getProfileByIdFromDB)(uid);
    if (!userProfile) {
        throw new functions.https.HttpsError('not-found', 'User profile not found.');
    }
    const replyRef = db.collection(`forums/${topicId}/posts/${postId}/replies`).doc();
    const postRef = db.collection(`forums/${topicId}/posts`).doc(postId);
    const batch = db.batch();
    // Denormalize author info on write
    batch.set(replyRef, {
        content,
        authorRef: uid,
        authorName: userProfile.displayName,
        authorAvatarUrl: userProfile.avatarUrl,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    batch.update(postRef, {
        replyCount: admin.firestore.FieldValue.increment(1),
    });
    await batch.commit();
    return { replyId: replyRef.id };
});
//# sourceMappingURL=forums.js.map