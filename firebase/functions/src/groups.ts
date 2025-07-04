
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import type { UserProfile } from './types';

const db = admin.firestore();

const checkAuth = (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
  }
  return context.auth.uid;
};

export const createGroup = functions.https.onCall(async (data, context) => {
    const uid = checkAuth(context);
    const { name, description, isPublic } = data;

    if (!name || !description) {
        throw new functions.https.HttpsError('invalid-argument', 'Group name and description are required.');
    }

    const userProfileDoc = await db.collection('users').doc(uid).get();
    if (!userProfileDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'User profile not found.');
    }
    const userProfile = userProfileDoc.data() as UserProfile;

    const groupRef = db.collection('groups').doc();
    
    const batch = db.batch();

    batch.set(groupRef, {
        name,
        description,
        isPublic,
        ownerId: uid,
        memberCount: 1,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
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
            
            const userProfileDoc = await db.collection('users').doc(userId).get();
             if (!userProfileDoc.exists) {
                throw new functions.https.HttpsError('not-found', 'Your user profile could not be found.');
            }
            const userProfile = userProfileDoc.data() as UserProfile;

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
