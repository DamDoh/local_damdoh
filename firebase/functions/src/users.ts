import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin'; // Import FieldValue from the correct admin namespace

// Initialize Firebase Admin SDK if it hasn't been initialized yet
if (!admin.apps.length) {
  admin.initializeApp();
}

// Cloud Function to update a user's profile in Firestore
// This function handles updates to the user's general profile fields,
// the nested `profile_data` map for stakeholder-specific information,
// and potentially the `roles` array.
//
// It ensures that the request is authenticated and authorized.
// Authorization checks currently only allow users to update their own profiles.
// A more robust implementation would include admin role checks.
// This function should be protected to ensure only the user themselves
// or an authorized admin can update the profile.
export const updateUserProfile = functions.https.onCall(async (data, context) => {
  // Ensure the request is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to update their profile.');
  }

  const userIdToUpdate = data.userId; // The ID of the user whose profile is being updated
  const updatedData = data.updatedData; // The data to update the profile with

  // Basic authorization check: User can only update their own profile
  // A more complex implementation would check for admin roles
  if (context.auth.uid !== userIdToUpdate) {
    // In a real application, you would check if the authenticated user is an admin
    // For now, we'll throw an error if they are not the profile owner
    throw new functions.https.HttpsError('permission-denied', 'User can only update their own profile.');
  }

  if (!userIdToUpdate || !updatedData) {
    throw new functions.https.HttpsError('invalid-argument', 'User ID and updated data are required.');
  }

  // Basic validation: Check if updatedData is an object
  if (typeof updatedData !== 'object' || updatedData === null) {
      throw new functions.https.HttpsError('invalid-argument', 'Updated data must be an object.');
  }

  try {
    const userRef = admin.firestore().collection('users').doc(userIdToUpdate);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
        throw new functions.https.HttpsError('not-found', `User with ID ${userIdToUpdate} not found.`);
    }

    // In a more advanced scenario, you would validate the structure
    // of updatedData, especially profile_data, against the user's stakeholderType.
    // For now, we trust the data structure but use merge: true to prevent
    // overwriting unrelated fields. Updates to profile_data will merge
    // into the existing map. Updates to roles will replace the array.

    // Use set with merge: true to update the user document with the provided data.
    // Use merge: true to update existing fields without overwriting the entire document
    await userRef.set(updatedData, { merge: true });

    return { message: `Profile for user ${userIdToUpdate} updated successfully.` };

  } catch (error: any) {
    functions.logger.error('Error updating user profile:', error);
    throw new functions.https.HttpsError('internal', 'Unable to update user profile.', error.message);
  }
});

// Cloud Function to get a user's profile from Firestore
// This function should be protected to control who can view which profile data.
export const getUserProfile = functions.https.onCall(async (data, context) => {
  // Ensure the request is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to get profile data.');
  }

  const userIdToGet = data.userId; // The ID of the user whose profile is being requested

  if (!userIdToGet) {
    throw new functions.https.HttpsError('invalid-argument', 'User ID is required.');
  }

  // Authorization check: User can view their own profile.
  // More complex rules (e.g., viewing limited data for other users, admin access)
  // should be implemented here based on roles and privacy settings.
  // For this example, we'll allow a user to get their own profile or any profile
  // but a real app needs more granular control.
  // if (context.auth.uid !== userIdToGet && !isAdmin(context.auth.uid)) {
  //   throw new functions.https.HttpsError('permission-denied', 'User is not authorized to view this profile.');
  // }


  try {
    const userRef = admin.firestore().collection('users').doc(userIdToGet);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', `User with ID ${userIdToGet} not found.`);
    }

    // Return the user data. Be mindful of sensitive information.
    // You might want to filter the data based on the authenticated user's role
    // before returning it.
    return userDoc.data();

  } catch (error: any) {
    functions.logger.error('Error getting user profile:', error);
    // Catching specific Firebase errors might provide more detail
    if (error.code) {
       throw new functions.https.HttpsError(error.code, error.message);
    }
    throw new functions.https.HttpsError('internal', 'Unable to get user profile.', error.message);
  }
});

// Cloud Function to assign or remove a role from a user.
// This function should only be accessible to administrators.
export const assignRole = functions.https.onCall(async (data, context) => {
  // Ensure the request is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to manage roles.');
  }

  const callerUid = context.auth.uid;
  const targetUserId = data.targetUserId;
  const role = data.role; // The role to assign or remove
  const action = data.action; // 'assign' or 'remove'

  if (!targetUserId || !role || (action !== 'assign' && action !== 'remove')) {
    throw new functions.https.HttpsError('invalid-argument', 'Target user ID, role, and action (assign/remove) are required.');
  }

  try {
    // Strong authorization check: Verify that the authenticated user has an 'admin' role.
    // This can be done by checking custom claims set on the user's auth record
    // or by checking a field in their user document in Firestore.
    // For this example, we'll assume custom claims are used.
    const callerUserRecord = await admin.auth().getUser(callerUid);
    if (!callerUserRecord.customClaims || !callerUserRecord.customClaims.admin) {
      throw new functions.https.HttpsError('permission-denied', 'Only administrators can manage roles.');
    }

    const userRef = admin.firestore().collection('users').doc(targetUserId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
        throw new functions.https.HttpsError('not-found', `User with ID ${targetUserId} not found.`);
    }

    const currentRoles: string[] = userDoc.data()?.roles || [];
    let updatedRoles = [...currentRoles];

    if (action === 'assign') {
      if (!updatedRoles.includes(role)) {
        updatedRoles.push(role);
      }
    } else if (action === 'remove') {
      updatedRoles = updatedRoles.filter(r => r !== role);
    }

    // Update the roles array in the user's Firestore document.
    await userRef.update({ roles: updatedRoles });

    return { message: `Role '${role}' ${action === 'assign' ? 'assigned to' : 'removed from'} user ${targetUserId} successfully.` };

  } catch (error: any) {
    functions.logger.error('Error assigning/removing role:', error);
    // Catching specific Firebase errors might provide more detail
    throw new functions.https.HttpsError('internal', 'Unable to manage user role.', error.message);
  }
});