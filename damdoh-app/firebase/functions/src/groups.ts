
/**
 * =================================================================
 * Module 5 Sub-Module: Community Groups
 * =================================================================
 * This module handles all functionalities related to user-created
 * community groups, both public and private. It enables stakeholders
 * to form smaller, focused communities around specific topics, regions,
 * or projects.
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

export const getGroups = functions.https.onCall(async (data, context) => {
  try {
    const groupsSnapshot = await db.collection("groups").where("isPublic", "==", true).get();
    const groups = groupsSnapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
    return {groups};
  } catch (error) {
    console.error("Error fetching groups:", error);
    throw new functions.https.HttpsError("internal", "An error occurred while fetching groups.");
  }
});

export const createGroup = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "You must be logged in to create a group.");
  }

  const {name, description, isPublic} = data;

  if (!name || !description) {
    throw new functions.https.HttpsError("invalid-argument", "Name and description are required.");
  }

  const newGroup = {
    name,
    description,
    isPublic: isPublic !== false,
    memberCount: 1,
    ownerId: context.auth.uid,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  try {
    const groupRef = await db.collection("groups").add(newGroup);
    await groupRef.collection("members").doc(context.auth.uid).set({
      role: "owner",
      joinedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return {groupId: groupRef.id, message: "Group created successfully"};
  } catch (error) {
    console.error("Error creating group:", error);
    throw new functions.https.HttpsError("internal", "An error occurred while creating the group.");
  }
});

export const getGroupDetails = functions.https.onCall(async (data, context) => {
  const {groupId} = data;
  if (!groupId) {
    throw new functions.https.HttpsError("invalid-argument", "A groupId must be provided.");
  }

  try {
    const groupDoc = await db.collection("groups").doc(groupId).get();
    if (!groupDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Group not found.");
    }
    const groupData = groupDoc.data()!;
    return {
        id: groupDoc.id, 
        ...groupData,
        createdAt: (groupData.createdAt as admin.firestore.Timestamp)?.toDate ? (groupData.createdAt as admin.firestore.Timestamp).toDate().toISOString() : null,
    };
  } catch (error) {
    console.error(`Error fetching group details for ${groupId}:`, error);
    throw new functions.https.HttpsError("internal", "An error occurred while fetching group details.");
  }
});

export const getGroupMembers = functions.https.onCall(async (data, context) => {
  const {groupId} = data;
  if (!groupId) {
    throw new functions.https.HttpsError("invalid-argument", "A groupId must be provided.");
  }

  try {
    const membersSnapshot = await db.collection(`groups/${groupId}/members`).get();
    const memberIds = membersSnapshot.docs.map((doc) => doc.id);

    if (memberIds.length === 0) {
      return [];
    }

    const userDocs = await db.collection("users").where(admin.firestore.FieldPath.documentId(), "in", memberIds).get();
    const members = userDocs.docs.map((doc) => ({id: doc.id, ...doc.data()}));

    return members;
  } catch (error) {
    console.error(`Error fetching members for group ${groupId}:`, error);
    throw new functions.https.HttpsError("internal", "An error occurred while fetching group members.");
  }
});

export const joinGroup = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "You must be logged in to join a group.");
  }

  const {groupId} = data;
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
      joinedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    await groupRef.update({ memberCount: admin.firestore.FieldValue.increment(1) });

    return {message: "Successfully joined the group."};
  } catch (error: any) {
    if(error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError("internal", "An error occurred while joining the group.");
  }
});

export const leaveGroup = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "You must be logged in to leave a group.");
  }

  const {groupId} = data;
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

    return {message: "Successfully left the group."};
  } catch (error: any) {
    if(error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError("internal", "An error occurred while leaving the group.");
  }
});
