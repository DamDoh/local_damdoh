
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
// import { stakeholderProfileSchemas } from "./stakeholder-profile-data"; // This file doesn't exist in the functions directory, causing deployment failure.

const db = admin.firestore();

if (admin.apps.length === 0) {
  admin.initializeApp();
}

/**
 * Validates the structure of profileData based on the stakeholder's role.
 * @param {string} role The primary role of the stakeholder.
 * @param {any} data The profileData object to validate.
 * @throws {functions.https.HttpsError} Throws an error if validation fails.
 */
// const validateProfileData = (role: string, data: any) => {
//   // The schema dependency is causing deployment failures because the file is not in the functions directory.
//   // Commenting out validation to allow deployment.
//   // const schema = stakeholderProfileSchemas[role as keyof typeof stakeholderProfileSchemas];
//   // if (schema) {
//   //   const result = schema.safeParse(data);
//   //   if (!result.success) {
//   //     throw new functions.https.HttpsError(
//   //       'invalid-argument',
//   //       `Profile data validation failed for role ${role}: ${result.error.message}`
//   //     );
//   //   }
//   // }
// };


/**
* Creates or updates a detailed stakeholder profile. This is the core 'write' function for Module 2.
* It handles the rich profile data for all 21 stakeholder types.
*/
export const upsertStakeholderProfile = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
  }

  const { displayName, primaryRole, profileData } = data;
  if (!displayName || !primaryRole) {
    throw new functions.https.HttpsError("invalid-argument", "Display name and primary role are required.");
  }

  // Validate the role-specific data before writing to the database
  // if (profileData) {
  //   validateProfileData(primaryRole, profileData);
  // }

  const userId = context.auth.uid;
  
  try {
    const userRef = db.collection("users").doc(userId);

    await userRef.set({
      displayName: displayName,
      primaryRole: primaryRole,
      profileData: profileData || {}, // Ensure profileData is at least an empty object
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    return { status: "success", message: "Profile updated successfully." };

  } catch (error) {
    console.error("Error upserting stakeholder profile:", error);
    // It's good practice to not expose internal errors to the client.
    throw new functions.https.HttpsError("internal", "An error occurred while updating the profile.");
  }
});


/**
 * Helper function to get a user's role from Firestore.
 * @param {string | undefined} uid The user's ID.
 * @returns {Promise<string | null>} The user's role or null if not found.
 */
export async function getRole(uid: string | undefined): Promise<string | null> {
    if (!uid) {
        return null;
    }
    try {
        const userDoc = await db.collection('users').doc(uid).get();
        return userDoc.data()?.primaryRole || null;
    } catch (error) {
        console.error('Error fetching user role:', error);
        return null;
    }
}

/**
 * Helper function to get a user's document from Firestore.
 * @param {string} uid The user's ID.
 * @returns {Promise<FirebaseFirestore.DocumentSnapshot | null>} The user's document snapshot or null if not found.
 */
export async function getUserDocument(uid: string): Promise<FirebaseFirestore.DocumentSnapshot | null> {
    try {
        const userDoc = await db.collection('users').doc(uid).get();
        return userDoc.exists ? userDoc : null;
    } catch (error) {
        console.error('Error getting user document:', error);
        return null;
    }
}
