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
exports.getGroupPostReplies = exports.addGroupPostReply = exports.getGroupPosts = exports.createGroupPost = exports.leaveGroup = exports.joinGroup = exports.getGroupMembers = exports.getGroupDetails = exports.getGroups = exports.createGroup = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
const checkAuth = (context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    return context.auth.uid;
};
exports.createGroup = functions.https.onCall(async (data, context) => {
    const uid = checkAuth(context);
    const { name, description, isPublic } = data;
    if (!name || !description) {
        throw new functions.https.HttpsError('invalid-argument', 'Group name and description are required.');
    }
    const userProfileDoc = await db.collection('users').doc(uid).get();
    if (!userProfileDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'User profile not found.');
    }
    const userProfile = userProfileDoc.data();
    const groupRef = db.collection('groups').doc();
    const batch = db.batch();
    batch.set(groupRef, {
        name,
        description,
        isPublic,
        ownerId: uid,
        memberCount: 1,
        postCount: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastActivityAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    const memberRef = groupRef.collection('members').doc(uid);
    batch.set(memberRef, {
        displayName: userProfile.displayName,
        avatarUrl: userProfile.avatarUrl || null,
        role: 'owner',
        joinedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    await batch.commit();
    return { groupId: groupRef.id };
});
exports.getGroups = functions.https.onCall(async (data, context) => {
    const groupsSnapshot = await db.collection('groups')
        .where('isPublic', '==', true)
        .orderBy('createdAt', 'desc')
        .get();
    const groups = groupsSnapshot.docs.map(doc => {
        var _a, _b;
        return (Object.assign(Object.assign({ id: doc.id }, doc.data()), { createdAt: (_b = (_a = doc.data().createdAt) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a).toISOString() }));
    });
    return { groups };
});
exports.getGroupDetails = functions.https.onCall(async (data, context) => {
    var _a, _b;
    const { groupId } = data;
    if (!groupId) {
        throw new functions.https.HttpsError('invalid-argument', 'A groupId must be provided.');
    }
    const groupRef = db.collection('groups').doc(groupId);
    const groupDoc = await groupRef.get();
    if (!groupDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Group not found.');
    }
    const groupData = groupDoc.data();
    return Object.assign(Object.assign({ id: groupDoc.id }, groupData), { createdAt: (_b = (_a = groupData.createdAt) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a).toISOString() });
});
exports.getGroupMembers = functions.https.onCall(async (data, context) => {
    const { groupId } = data;
    if (!groupId) {
        throw new functions.https.HttpsError('invalid-argument', 'A groupId must be provided.');
    }
    const membersSnapshot = await db.collection(`groups/${groupId}/members`).limit(50).get();
    const members = membersSnapshot.docs.map(doc => {
        var _a, _b;
        const data = doc.data();
        return Object.assign(Object.assign({ id: doc.id }, data), { joinedAt: (_b = (_a = data.joinedAt) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a).toISOString() });
    });
    return { members };
});
const modifyMembership = async (groupId, userId, join) => {
    const groupRef = db.collection('groups').doc(groupId);
    const memberRef = groupRef.collection('members').doc(userId);
    await db.runTransaction(async (transaction) => {
        const groupDoc = await transaction.get(groupRef);
        if (!groupDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Group not found.');
        }
        const memberDoc = await transaction.get(memberRef);
        if (join) {
            if (memberDoc.exists) {
                throw new functions.https.HttpsError('already-exists', 'You are already a member of this group.');
            }
            const userProfileDoc = await db.collection('users').doc(userId).get();
            if (!userProfileDoc.exists) {
                throw new functions.https.HttpsError('not-found', 'Your user profile could not be found.');
            }
            const userProfile = userProfileDoc.data();
            transaction.set(memberRef, {
                displayName: userProfile.displayName,
                avatarUrl: userProfile.avatarUrl || null,
                role: 'member',
                joinedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            transaction.update(groupRef, { memberCount: admin.firestore.FieldValue.increment(1) });
        }
        else {
            if (!memberDoc.exists) {
                throw new functions.https.HttpsError('not-found', 'You are not a member of this group.');
            }
            transaction.delete(memberRef);
            transaction.update(groupRef, { memberCount: admin.firestore.FieldValue.increment(-1) });
        }
    });
};
exports.joinGroup = functions.https.onCall(async (data, context) => {
    const uid = checkAuth(context);
    const { groupId } = data;
    await modifyMembership(groupId, uid, true);
    return { success: true, message: 'Successfully joined the group.' };
});
exports.leaveGroup = functions.https.onCall(async (data, context) => {
    const uid = checkAuth(context);
    const { groupId } = data;
    await modifyMembership(groupId, uid, false);
    return { success: true, message: 'Successfully left the group.' };
});
// --- NEW FUNCTIONS FOR GROUP DISCUSSIONS ---
exports.createGroupPost = functions.https.onCall(async (data, context) => {
    var _a, _b;
    const uid = checkAuth(context);
    const { groupId, title, content } = data;
    if (!groupId || !title || !content) {
        throw new functions.https.HttpsError('invalid-argument', 'Group ID, title, and content are required.');
    }
    const memberRef = db.collection(`groups/${groupId}/members`).doc(uid);
    const memberDoc = await memberRef.get();
    if (!memberDoc.exists) {
        throw new functions.https.HttpsError('permission-denied', 'You must be a member of this group to post.');
    }
    const postRef = db.collection(`groups/${groupId}/posts`).doc();
    const groupRef = db.collection('groups').doc(groupId);
    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    const userProfile = await db.collection('users').doc(uid).get();
    const batch = db.batch();
    batch.set(postRef, {
        title,
        content,
        authorRef: uid,
        authorName: ((_a = userProfile.data()) === null || _a === void 0 ? void 0 : _a.displayName) || 'Unknown User',
        authorAvatarUrl: ((_b = userProfile.data()) === null || _b === void 0 ? void 0 : _b.avatarUrl) || null,
        createdAt: timestamp,
        replyCount: 0,
        likes: 0,
    });
    batch.update(groupRef, {
        postCount: admin.firestore.FieldValue.increment(1),
        lastActivityAt: timestamp
    });
    await batch.commit();
    return { postId: postRef.id };
});
exports.getGroupPosts = functions.https.onCall(async (data, context) => {
    const { groupId, lastVisible } = data;
    if (!groupId)
        throw new functions.https.HttpsError('invalid-argument', 'Group ID is required.');
    const POSTS_PER_PAGE = 10;
    let query = db.collection(`groups/${groupId}/posts`).orderBy('createdAt', 'desc').limit(POSTS_PER_PAGE);
    if (lastVisible) {
        const lastDocSnapshot = await db.collection(`groups/${groupId}/posts`).doc(lastVisible).get();
        if (lastDocSnapshot.exists) {
            query = query.startAfter(lastDocSnapshot);
        }
    }
    const postsSnapshot = await query.get();
    const posts = postsSnapshot.docs.map(doc => {
        var _a, _b;
        return (Object.assign(Object.assign({ id: doc.id }, doc.data()), { createdAt: (_b = (_a = doc.data().createdAt) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a).toISOString() }));
    });
    const newLastVisible = posts.length > 0 ? posts[posts.length - 1].id : null;
    return { posts, lastVisible: newLastVisible };
});
exports.addGroupPostReply = functions.https.onCall(async (data, context) => {
    var _a, _b;
    const uid = checkAuth(context);
    const { groupId, postId, content } = data;
    if (!groupId || !postId || !content) {
        throw new functions.https.HttpsError('invalid-argument', 'Group ID, post ID, and content are required.');
    }
    const memberRef = db.collection(`groups/${groupId}/members`).doc(uid);
    const memberDoc = await memberRef.get();
    if (!memberDoc.exists) {
        throw new functions.https.HttpsError('permission-denied', 'You must be a member of this group to reply.');
    }
    const replyRef = db.collection(`groups/${groupId}/posts/${postId}/replies`).doc();
    const postRef = db.collection(`groups/${groupId}/posts`).doc(postId);
    const batch = db.batch();
    const userProfile = await db.collection('users').doc(uid).get();
    batch.set(replyRef, {
        content,
        authorRef: uid,
        authorName: ((_a = userProfile.data()) === null || _a === void 0 ? void 0 : _a.displayName) || 'Unknown User',
        authorAvatarUrl: ((_b = userProfile.data()) === null || _b === void 0 ? void 0 : _b.avatarUrl) || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    batch.update(postRef, {
        replyCount: admin.firestore.FieldValue.increment(1),
    });
    await batch.commit();
    return { replyId: replyRef.id };
});
exports.getGroupPostReplies = functions.https.onCall(async (data, context) => {
    const { groupId, postId, lastVisible } = data;
    if (!groupId || !postId)
        throw new functions.https.HttpsError('invalid-argument', 'Group ID and Post ID are required.');
    const REPLIES_PER_PAGE = 15;
    let query = db.collection(`groups/${groupId}/posts/${postId}/replies`).orderBy('createdAt', 'asc').limit(REPLIES_PER_PAGE);
    if (lastVisible) {
        const lastDocSnapshot = await db.collection(`groups/${groupId}/posts/${postId}/replies`).doc(lastVisible).get();
        if (lastDocSnapshot.exists) {
            query = query.startAfter(lastDocSnapshot);
        }
    }
    const repliesSnapshot = await query.get();
    const replies = repliesSnapshot.docs.map(doc => {
        var _a, _b;
        return (Object.assign(Object.assign({ id: doc.id }, doc.data()), { createdAt: (_b = (_a = doc.data().createdAt) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a).toISOString() }));
    });
    const newLastVisible = replies.length > 0 ? replies[replies.length - 1].id : null;
    return { replies, lastVisible: newLastVisible };
});
//# sourceMappingURL=groups.js.map