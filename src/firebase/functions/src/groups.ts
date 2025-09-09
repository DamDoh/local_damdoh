

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import type { UserProfile, JoinRequest } from '@/lib/types';
import { getUserProfile } from './user';
import { checkAuth } from './utils';

const db = admin.firestore();

export const createGroup = functions.https.onCall(async (data, context) => {
    const uid = checkAuth(context);
    const { name, description, isPublic } = data;

    if (!name || !description) {
        throw new functions.https.HttpsError('invalid-argument', 'Group name and description are required.');
    }

    const userProfile = await getUserProfile(uid);
    if (!userProfile) {
        throw new functions.https.HttpsError('not-found', 'User profile not found.');
    }

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

export const getGroups = functions.https.onCall(async (data, context) => {
    const groupsSnapshot = await db.collection('groups')
        .where('isPublic', '==', true)
        .orderBy('createdAt', 'desc')
        .get();

    const groups = groupsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as admin.firestore.Timestamp)?.toDate?.().toISOString(),
    }));
    return { groups };
});

export const getGroupDetails = functions.https.onCall(async (data, context) => {
    const { groupId } = data;
    if (!groupId) {
        throw new functions.https.HttpsError('invalid-argument', 'A groupId must be provided.');
    }
    
    const groupRef = db.collection('groups').doc(groupId);
    const groupDoc = await groupRef.get();

    if (!groupDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Group not found.');
    }

    const groupData = groupDoc.data()!;

    return {
        id: groupDoc.id,
        ...groupData,
        createdAt: (groupData.createdAt as admin.firestore.Timestamp)?.toDate?.().toISOString(),
    };
});

export const getGroupMembers = functions.https.onCall(async (data, context) => {
    const { groupId } = data;
     if (!groupId) {
        throw new functions.https.HttpsError('invalid-argument', 'A groupId must be provided.');
    }
    
    const membersSnapshot = await db.collection(`groups/${groupId}/members`).limit(50).get();
    
    const members = membersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            joinedAt: (data.joinedAt as admin.firestore.Timestamp)?.toDate?.().toISOString(),
        }
    });

    return { members };
});

const modifyMembership = async (groupId: string, userId: string, join: boolean) => {
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
            
            const userProfile = await getUserProfile(userId);
             if (!userProfile) {
                throw new functions.https.HttpsError('not-found', 'Your user profile could not be found.');
            }

            transaction.set(memberRef, {
                displayName: userProfile.displayName,
                avatarUrl: userProfile.avatarUrl || null,
                role: 'member',
                joinedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            transaction.update(groupRef, { memberCount: admin.firestore.FieldValue.increment(1) });
        } else {
             if (!memberDoc.exists) {
                throw new functions.https.HttpsError('not-found', 'You are not a member of this group.');
            }
            transaction.delete(memberRef);
            transaction.update(groupRef, { memberCount: admin.firestore.FieldValue.increment(-1) });
        }
    });
};


export const joinGroup = functions.https.onCall(async (data, context) => {
    const uid = checkAuth(context);
    const { groupId } = data;
    await modifyMembership(groupId, uid, true);
    return { success: true, message: 'Successfully joined the group.' };
});

export const leaveGroup = functions.https.onCall(async (data, context) => {
    const uid = checkAuth(context);
    const { groupId } = data;
    await modifyMembership(groupId, uid, false);
    return { success: true, message: 'Successfully left the group.' };
});

// --- NEW FUNCTIONS FOR GROUP DISCUSSIONS ---

export const createGroupPost = functions.https.onCall(async (data, context) => {
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

    const userProfile = await getUserProfile(uid);

    const batch = db.batch();

    batch.set(postRef, {
        title,
        content,
        authorRef: uid,
        authorName: userProfile?.displayName || 'Unknown User',
        authorAvatarUrl: userProfile?.avatarUrl || null,
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

export const getGroupPosts = functions.https.onCall(async (data, context) => {
    const { groupId, lastVisible } = data;
    if (!groupId) throw new functions.https.HttpsError('invalid-argument', 'Group ID is required.');

    const POSTS_PER_PAGE = 10;
    let query = db.collection(`groups/${groupId}/posts`).orderBy('createdAt', 'desc').limit(POSTS_PER_PAGE);

    if (lastVisible) {
        const lastDocSnapshot = await db.collection(`groups/${groupId}/posts`).doc(lastVisible).get();
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

export const addGroupPostReply = functions.https.onCall(async (data, context) => {
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
    const userProfile = await getUserProfile(uid);

    batch.set(replyRef, {
        content,
        authorRef: uid,
        authorName: userProfile?.displayName || 'Unknown User',
        authorAvatarUrl: userProfile?.avatarUrl || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    batch.update(postRef, {
        replyCount: admin.firestore.FieldValue.increment(1),
    });

    await batch.commit();
    return { replyId: replyRef.id };
});

export const getGroupPostReplies = functions.https.onCall(async (data, context) => {
    const { groupId, postId, lastVisible } = data;
    if (!groupId || !postId) throw new functions.https.HttpsError('invalid-argument', 'Group ID and Post ID are required.');

    const REPLIES_PER_PAGE = 15;
    let query = db.collection(`groups/${groupId}/posts/${postId}/replies`).orderBy('createdAt', 'asc').limit(REPLIES_PER_PAGE);
    
    if (lastVisible) {
        const lastDocSnapshot = await db.collection(`groups/${groupId}/posts/${postId}/replies`).doc(lastVisible).get();
        if(lastDocSnapshot.exists) {
            query = query.startAfter(lastDocSnapshot);
        }
    }

    const repliesSnapshot = await query.get();

    const replies = repliesSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        createdAt: (doc.data().createdAt as admin.firestore.Timestamp)?.toDate?.().toISOString()
    }));
    
    const newLastVisible = replies.length > 0 ? replies[replies.length - 1].id : null;
    
    return { replies, lastVisible: newLastVisible };
});

export const requestToJoinGroup = functions.https.onCall(async (data, context) => {
    const requesterId = checkAuth(context);
    const { groupId } = data;
    if (!groupId) throw new functions.https.HttpsError('invalid-argument', 'Group ID is required.');
    
    const requestRef = db.collection(`groups/${groupId}/join_requests`).doc(requesterId);
    const doc = await requestRef.get();

    if (doc.exists) {
        throw new functions.https.HttpsError('already-exists', 'You have already sent a request to join this group.');
    }
    
    const userProfile = await getUserProfile(requesterId);

    await requestRef.set({
        requesterId,
        requesterName: userProfile.displayName,
        requesterAvatarUrl: userProfile.avatarUrl,
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true };
});

export const getGroupJoinRequests = functions.https.onCall(async (data, context) => {
    const ownerId = checkAuth(context);
    const { groupId } = data;
    if (!groupId) throw new functions.https.HttpsError('invalid-argument', 'Group ID is required.');
    
    const groupRef = db.collection('groups').doc(groupId);
    const groupDoc = await groupRef.get();
    if (!groupDoc.exists || groupDoc.data()?.ownerId !== ownerId) {
        throw new functions.https.HttpsError('permission-denied', 'You are not the owner of this group.');
    }

    const requestsSnapshot = await groupRef.collection('join_requests').where('status', '==', 'pending').get();
    const requests: JoinRequest[] = requestsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            requesterId: data.requesterId,
            requesterName: data.requesterName,
            requesterAvatarUrl: data.requesterAvatarUrl,
            createdAt: (data.createdAt as admin.firestore.Timestamp).toDate().toISOString()
        }
    });

    return { requests };
});

export const respondToJoinRequest = functions.https.onCall(async (data, context) => {
    const ownerId = checkAuth(context);
    const { groupId, requestId, requesterId, action } = data;

    if (!groupId || !requestId || !requesterId || !action) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required fields.');
    }

    const groupRef = db.collection('groups').doc(groupId);
    const groupDoc = await groupRef.get();
    if (!groupDoc.exists || groupDoc.data()?.ownerId !== ownerId) {
        throw new functions.https.HttpsError('permission-denied', 'You are not the owner of this group.');
    }

    const requestRef = groupRef.collection('join_requests').doc(requestId);
    
    if (action === 'accept') {
        await requestRef.update({ status: 'accepted' });
        await modifyMembership(groupId, requesterId, true);
    } else { // decline
        await requestRef.update({ status: 'declined' });
    }
    
    return { success: true };
});


export const inviteUserToGroup = functions.https.onCall(async (data, context) => {
    const inviterId = checkAuth(context);
    const { groupId, email } = data;
    if (!groupId || !email) {
        throw new functions.https.HttpsError('invalid-argument', 'Group ID and email are required.');
    }

    // In a real app, this would generate a unique invite link and send an email
    // For now, it's a placeholder.
    console.log(`User ${inviterId} invited ${email} to group ${groupId}.`);
    
    return { success: true, message: `An invitation has been sent to ${email}.`};
});
