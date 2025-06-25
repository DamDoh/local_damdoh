
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

if (admin.apps.length === 0) {
  admin.initializeApp();
}
const db = admin.firestore();
const POSTS_PER_PAGE = 10; // Define a page size for pagination
const REPLIES_PER_PAGE = 15; // Define a page size for replies

/**
 * =================================================================
 * Module 6: Community & Collaboration Backend
 * =================================================================
 */

// ================== FORUMS ==================

/**
 * Fetches a list of all forum topics.
 */
export const getTopics = functions.https.onCall(async (data, context) => {
    try {
        const topicsSnapshot = await db.collection("forums").orderBy("lastActivity", "desc").get();
        const topics = topicsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return { topics };
    } catch (error) {
        console.error("Error fetching topics:", error);
        throw new functions.https.HttpsError("internal", "An error occurred while fetching forum topics.");
    }
});

/**
 * Creates a new forum topic.
 */
export const createTopic = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "You must be logged in to create a topic.");
    }

    const { name, description, regionTags } = data;

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
        return { topicId: docRef.id, message: "Topic created successfully" };
    } catch (error) {
        console.error("Error creating topic:", error);
        throw new functions.https.HttpsError("internal", "An error occurred while creating the topic.");
    }
});


/**
 * Fetches posts for a specific topic with pagination.
 */
export const getPostsForTopic = functions.https.onCall(async (data, context) => {
    const { topicId, lastVisible } = data;
    if (!topicId) {
        throw new functions.https.HttpsError("invalid-argument", "A topicId must be provided.");
    }

    try {
        let query = db.collection(`forums/${topicId}/posts`)
                      .orderBy("timestamp", "desc")
                      .limit(POSTS_PER_PAGE);

        if (lastVisible) {
            const lastVisibleDoc = await db.collection(`forums/${topicId}/posts`).doc(lastVisible).get();
            if(lastVisibleDoc.exists) {
                query = query.startAfter(lastVisibleDoc);
            }
        }

        const postsSnapshot = await query.get();
        const posts = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const newLastVisible = postsSnapshot.docs[postsSnapshot.docs.length - 1]?.id || null;

        return { posts, lastVisible: newLastVisible };
    } catch (error) {
        console.error(`Error fetching posts for topic ${topicId}:`, error);
        throw new functions.https.HttpsError("internal", "An error occurred while fetching posts.");
    }
});

/**
 * Creates a new post in a topic.
 */
export const createPost = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "You must be logged in to post.");
    }

    const { topicId, title, content } = data;
    if (!topicId || !title || !content) {
        throw new functions.https.HttpsError("invalid-argument", "topicId, title, and content are required.");
    }

    const postData = {
        title,
        content,
        authorRef: context.auth.uid,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        replyCount: 0
    };

    const topicRef = db.collection("forums").doc(topicId);

    try {
        const postRef = await topicRef.collection("posts").add(postData);
        // Update the topic's post count and last activity
        await topicRef.update({
            postCount: admin.firestore.FieldValue.increment(1),
            lastActivity: admin.firestore.FieldValue.serverTimestamp()
        });
        return { postId: postRef.id, message: "Post created successfully" };
    } catch (error) {
        console.error(`Error creating post in topic ${topicId}:`, error);
        throw new functions.https.HttpsError("internal", "An error occurred while creating the post.");
    }
});

/**
 * Fetches replies for a specific post with pagination.
 */
export const getRepliesForPost = functions.https.onCall(async (data, context) => {
    const { topicId, postId, lastVisible } = data;
    if (!topicId || !postId) {
        throw new functions.https.HttpsError("invalid-argument", "topicId and postId must be provided.");
    }

    try {
        let query = db.collection(`forums/${topicId}/posts/${postId}/replies`)
                      .orderBy("timestamp", "asc")
                      .limit(REPLIES_PER_PAGE);

        if (lastVisible) {
            const lastVisibleDoc = await db.collection(`forums/${topicId}/posts/${postId}/replies`).doc(lastVisible).get();
            if(lastVisibleDoc.exists){
                query = query.startAfter(lastVisibleDoc);
            }
        }

        const repliesSnapshot = await query.get();
        const replies = repliesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const newLastVisible = repliesSnapshot.docs[repliesSnapshot.docs.length - 1]?.id || null;

        return { replies, lastVisible: newLastVisible };
    } catch (error) {
        console.error(`Error fetching replies for post ${postId}:`, error);
        throw new functions.https.HttpsError("internal", "An error occurred while fetching replies.");
    }
});

/**
 * Adds a reply to a post.
 */
export const addReplyToPost = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "You must be logged in to reply.");
    }

    const { topicId, postId, content } = data;
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
        // Update the post's reply count and topic's last activity
        await postRef.update({ replyCount: admin.firestore.FieldValue.increment(1) });
        await db.collection("forums").doc(topicId).update({
            lastActivity: admin.firestore.FieldValue.serverTimestamp()
        });

        return { message: "Reply added successfully" };
    } catch (error) {
        console.error(`Error adding reply to post ${postId}:`, error);
        throw new functions.https.HttpsError("internal", "An error occurred while adding the reply.");
    }
});

// ================== GROUPS ==================

/**
 * Fetches all public groups.
 */
export const getGroups = functions.https.onCall(async (data, context) => {
    try {
        const groupsSnapshot = await db.collection("groups").where("isPublic", "==", true).get();
        const groups = groupsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return { groups };
    } catch (error) {
        console.error("Error fetching groups:", error);
        throw new functions.https.HttpsError("internal", "An error occurred while fetching groups.");
    }
});

/**
 * Creates a new group.
 */
export const createGroup = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "You must be logged in to create a group.");
    }

    const { name, description, isPublic } = data;

    if (!name || !description) {
        throw new functions.https.HttpsError("invalid-argument", "Name and description are required.");
    }

    const newGroup = {
        name,
        description,
        isPublic: isPublic || false,
        memberCount: 1,
        ownerId: context.auth.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    try {
        const groupRef = await db.collection("groups").add(newGroup);
        // Automatically add the creator as the first member
        await groupRef.collection("members").doc(context.auth.uid).set({
            role: "owner",
            joinedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return { groupId: groupRef.id, message: "Group created successfully" };
    } catch (error) {
        console.error("Error creating group:", error);
        throw new functions.https.HttpsError("internal", "An error occurred while creating the group.");
    }
});

/**
 * Fetches details for a single group.
 */
export const getGroupDetails = functions.https.onCall(async (data, context) => {
    const { groupId } = data;
    if (!groupId) {
        throw new functions.https.HttpsError("invalid-argument", "A groupId must be provided.");
    }

    try {
        const groupDoc = await db.collection("groups").doc(groupId).get();
        if (!groupDoc.exists) {
            throw new functions.https.HttpsError("not-found", "Group not found.");
        }
        return { id: groupDoc.id, ...groupDoc.data() };
    } catch (error) {
        console.error(`Error fetching group details for ${groupId}:`, error);
        throw new functions.https.HttpsError("internal", "An error occurred while fetching group details.");
    }
});

/**
 * Fetches members of a specific group.
 */
export const getGroupMembers = functions.https.onCall(async (data, context) => {
    const { groupId } = data;
    if (!groupId) {
        throw new functions.https.HttpsError("invalid-argument", "A groupId must be provided.");
    }

    try {
        const membersSnapshot = await db.collection(`groups/${groupId}/members`).get();
        const memberIds = membersSnapshot.docs.map(doc => doc.id);
        
        if (memberIds.length === 0) {
            return [];
        }

        const userDocs = await db.collection("users").where(admin.firestore.FieldPath.documentId(), "in", memberIds).get();
        const members = userDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        return members;
    } catch (error) {
        console.error(`Error fetching members for group ${groupId}:`, error);
        throw new functions.https.HttpsError("internal", "An error occurred while fetching group members.");
    }
});

/**
 * Allows a user to join a group.
 */
export const joinGroup = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "You must be logged in to join a group.");
    }

    const { groupId } = data;
    if (!groupId) {
        throw new functions.https.HttpsError("invalid-argument", "A groupId must be provided.");
    }

    const groupRef = db.collection("groups").doc(groupId);
    const memberRef = groupRef.collection("members").doc(context.auth.uid);

    try {
        const groupDoc = await groupRef.get();
        if (!groupDoc.exists) {
            throw new functions.https.HttpsError("not-found", "Group not found.");
        }
        if (!groupDoc.data()?.isPublic) {
            throw new functions.https.HttpsError("permission-denied", "This is a private group.");
        }

        const memberDoc = await memberRef.get();
        if (memberDoc.exists) {
            throw new functions.https.HttpsError("already-exists", "You are already a member of this group.");
        }

        await memberRef.set({
            role: "member",
            joinedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        await groupRef.update({ memberCount: admin.firestore.FieldValue.increment(1) });

        return { message: "Successfully joined the group." };
    } catch (error) {
        console.error(`Error joining group ${groupId}:`, error);
        throw new functions.https.HttpsError("internal", "An error occurred while joining the group.");
    }
});

/**
 * Allows a user to leave a group.
 */
export const leaveGroup = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "You must be logged in to leave a group.");
    }

    const { groupId } = data;
    if (!groupId) {
        throw new functions.https.HttpsError("invalid-argument", "A groupId must be provided.");
    }

    const groupRef = db.collection("groups").doc(groupId);
    const memberRef = groupRef.collection("members").doc(context.auth.uid);

    try {
        const memberDoc = await memberRef.get();
        if (!memberDoc.exists) {
            throw new functions.https.HttpsError("not-found", "You are not a member of this group.");
        }

        await memberRef.delete();
        await groupRef.update({ memberCount: admin.firestore.FieldValue.increment(-1) });

        return { message: "Successfully left the group." };
    } catch (error) {
        console.error(`Error leaving group ${groupId}:`, error);
        throw new functions.https.HttpsError("internal", "An error occurred while leaving the group.");
    }
});
