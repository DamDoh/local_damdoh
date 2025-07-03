
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import type { ForumGroup, UserProfile } from './types';

const db = admin.firestore();

const checkAuth = (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
  }
  return context.auth.uid;
};

// Placeholder dummy data
const DUMMY_GROUPS: ForumGroup[] = [
    { id: 'group1', name: 'Sustainable Coffee Growers Alliance', description: 'A group for coffee farmers and buyers interested in sustainable and fair trade practices.', isPublic: true, memberCount: 152, ownerId: 'user1', createdAt: new Date().toISOString() },
    { id: 'group2', name: 'West Africa Cashew Exporters', description: 'Private group for coordinating logistics and market info for cashew exports from West Africa.', isPublic: false, memberCount: 45, ownerId: 'user2', createdAt: new Date().toISOString() },
];

const DUMMY_MEMBERS: UserProfile[] = [
    // Add some dummy user profiles if needed for testing
];

export const createGroup = functions.https.onCall(async (data, context) => {
    checkAuth(context);
    console.log("createGroup called with:", data);
    return { groupId: `new-group-${Date.now()}` };
});

export const getGroups = functions.https.onCall(async (data, context) => {
    console.log("getGroups called");
    return { groups: DUMMY_GROUPS };
});

export const getGroupDetails = functions.https.onCall(async (data, context) => {
    const { groupId } = data;
    console.log("getGroupDetails called for:", groupId);
    const group = DUMMY_GROUPS.find(g => g.id === groupId) || DUMMY_GROUPS[0];
    return group;
});

export const getGroupMembers = functions.https.onCall(async (data, context) => {
    const { groupId } = data;
    console.log("getGroupMembers called for:", groupId);
    // Return an object for consistency with other data-fetching functions
    return { members: DUMMY_MEMBERS };
});

export const joinGroup = functions.https.onCall(async (data, context) => {
    checkAuth(context);
    const { groupId } = data;
    console.log(`User trying to join group: ${groupId}`);
    return { success: true };
});

export const leaveGroup = functions.https.onCall(async (data, context) => {
    checkAuth(context);
    const { groupId } = data;
    console.log(`User trying to leave group: ${groupId}`);
    return { success: true };
});
