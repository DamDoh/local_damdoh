import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK (only once)
// This check prevents re-initialization in environments where it might be imported multiple times
if (!admin.apps.length) {
  admin.initializeApp();
}

}

const db = admin.firestore();

// Firestore trigger for new Firebase Authentication users
export const onCreateUserAuth = functions.auth.user().onCreate(async (user) => {
  const { uid, email, phoneNumber, displayName } = user;

  console.log(`New user created in Firebase Auth: ${uid}`);

  // Create a new document in the 'users' collection
 try {
    await db.collection('users').doc(uid).set({
      uid: uid, // Redundant but can be helpful for queries
      email: email || null,
      phone_number: phoneNumber || null,
      displayName: displayName || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      primaryRole: 'pending', // Default role
      kycStatus: 'pending', // Initial KYC status
      onboardingProgress: {
        step1_completed: false,
        farm_mapped: false,
        // Add other initial onboarding steps as needed
      },
      preferredLanguage: 'en', // Default language, can be updated later
      country: null, // Will be set during onboarding
      region: null, // Will be set during onboarding
      // Add other default user fields
      userVti: null, // Initialize userVti as null
    });

    // Generate a VTI for the new user
    const userVtiResult = await generateVTI({ type: 'user', metadata: { userId: uid } }, { auth: { uid: uid } as any }); // Pass a dummy auth context
import { generateVTI } from './module1'; // Import generateVTI from module1
    const userVti = userVtiResult.vtiId;

    // Update the user document with the generated VTI
    await db.collection('users').doc(uid).update({
      userVti: userVti,
 updatedBy: admin.firestore.FieldValue.serverTimestamp(), // Update timestamp
    });

    console.log(`User document created in Firestore for UID: ${uid}`);

    // Optional: Log an internal event or trigger another process
    // e.g., Log this creation event in a system log collection
    // e.g., Send a welcome email via a separate function

    /*
     * TODO: Implement Organization Creation Process
     *
     * When a new organization is created (e.g., via a separate callable function
     * called by an authenticated user, who might become the initial contactPersonRef):
     *
     * 1. Create a new document in the 'organizations' collection.
     * 2. Store initial organization data (orgName, orgType, contactPersonRef, etc.).
     * 3. Call generateVTI to create a new VTI of type 'organization'.
     *    Example:
     *    const orgVtiResult = await generateVTI({ type: 'organization', metadata: { orgId: newOrgId } }, { auth: { uid: creatingUserId } as any });
     *    const orgVti = orgVtiResult.vtiId;
     * 4. Store the generated orgVti in the new organization document.
     * 5. Optionally, update the contactPerson's user document to link to this organization
     *    via the linkedOrganizationRef field.
     * 6. Consider implementing security rules and validation for organization creation.
     */


    return null; // Indicate successful completion
  } catch (error) {
    console.error(`Error creating user document for UID ${uid}:`, error);
    // Depending on your error handling strategy, you might want to alert an admin
    // or log this failure to a dedicated error tracking system.
    return null; // Return null to not block the authentication process
  }
});

// --- User Management Functions (Integrated from users.ts) ---

/**
 * Cloud Function to update a user's profile in Firestore.
 * This function handles updates to the user's general profile fields,
 * the nested `profile_data` map for stakeholder-specific information,
 * and potentially the `roles` array.
 *
 * It ensures that the request is authenticated and authorized.
 * Authorization checks currently only allow users to update their own profiles.
 * A more robust implementation would include admin role checks.
 * This function should be protected to ensure only the user themselves
 * or an authorized admin can update the profile.
 * (Integrated from users.ts)
 */
export const updateUserProfile = functions.https.onCall(async (data, context) => {
  // Ensure the request is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to update their profile.');
  }

  const userIdToUpdate = data.userId; // The ID of the user whose profile is being updated
  const updatedData = data.updatedData; // The data to update the profile with

  // Basic authorization check: User can only update their own profile
  // TODO: Implement a more complex authorization check to include admin roles
  if (context.auth.uid !== userIdToUpdate) {
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
    await userRef.set({
        ...updatedData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(), // Ensure updated timestamp is set
    }, { merge: true });

    console.log(`Profile for user ${userIdToUpdate} updated successfully by user ${context.auth.uid}.`);

    return { message: `Profile for user ${userIdToUpdate} updated successfully.` };

  } catch (error: any) {
    console.error('Error updating user profile:', error);
    // Re-throw HttpsErrors to the client, otherwise return a generic internal error
    if (error instanceof functions.https.HttpsError) {
        throw error;
    }
    throw new functions.https.HttpsError('internal', 'Unable to update user profile.');
  }
});
// Callable function for authenticated users to update their own profile
export const updateUserProfile = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to update their profile.');
    }

    const userId = context.auth.uid;
    const updates = data;

    // Define allowed fields that a user can update on their profile
    const allowedFields = [
        'displayName',
        'preferredLanguage',
        'country',
        'region',
        'profilePictureUrl',
        // Add other fields users are allowed to update
        'onboardingProgress' // Allow users to mark onboarding steps as complete
        // IMPORTANT: Do NOT include sensitive fields like uid, createdAt, primaryRole, kycStatus, linkedOrganizationRef unless handled with specific logic
    ];

    // Filter the incoming data to only include allowed fields
    const filteredUpdates: { [key: string]: any } = {};
    for (const field in updates) {
        if (allowedFields.includes(field)) {
            filteredUpdates[field] = updates[field];
        } else {
            console.warn(`Attempted to update disallowed field: ${field} by user ${userId}`);
            // Optionally throw an error or ignore the field silently
        }
    }

    // Check if there are any valid fields to update after filtering
    if (Object.keys(filteredUpdates).length === 0) {
        throw new functions.https.HttpsError('invalid-argument', 'No valid fields provided for update.');
    }

    try {
        const userRef = db.collection('users').doc(userId);
        await userRef.update({
            ...filteredUpdates,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(), // Update timestamp
        });

        console.log(`User profile updated for UID: ${userId}`);

        return { status: 'success', userId: userId };
    } catch (error) {
        console.error(`Error updating user profile for UID ${userId}:`, error);
        throw new functions.https.HttpsError('internal', 'Unable to update user profile.', error);
    }
});

/**
 * Cloud Function to get a user's profile from Firestore.
 * This function should be protected to control who can view which profile data.
 * (Integrated from users.ts)
 */
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
  // TODO: Implement more complex rules (e.g., viewing limited data for other users, admin access)
  // based on roles and privacy settings.
  // For this example, we'll allow a user to get any profile.
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
    console.log(`Profile for user ${userIdToGet} retrieved by user ${context.auth.uid}.`);
    return userDoc.data();

  } catch (error: any) {
    console.error('Error getting user profile:', error);
    // Re-throw HttpsErrors to the client, otherwise return a generic internal error
    if (error instanceof functions.https.HttpsError) {
        throw error;
    }
    throw new functions.https.HttpsError('internal', 'Unable to retrieve user profile.');
  }
});

// Callable function for the contact person of an organization to update their organization's profile
export const updateOrganizationProfile = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to update organization profile.');
    }

    const callerUid = context.auth.uid;
    const { orgId, updates } = data;

    if (!orgId || typeof orgId !== 'string') {
         throw new functions.https.HttpsError('invalid-argument', 'The "orgId" parameter is required and must be a string.');
    }

    // Define allowed fields that an organization contact person can update
    const allowedFields = [
        'orgName_en',
        'orgName_local', // Assuming this is managed as an object or map
        'address',
        // 'geoLocation', // GeoLocation might require special handling or a separate function
        'country',
        'registrationAuthority',
        // Add other fields allowed for organization updates
        // IMPORTANT: Do NOT include sensitive fields like orgId, createdAt, kycStatus, contactPersonRef (unless changing contact person is a separate allowed action)
    ];

    // Filter the incoming data to only include allowed fields
    const filteredUpdates: { [key: string]: any } = {};
    for (const field in updates) {
        if (allowedFields.includes(field)) {
            filteredUpdates[field] = updates[field];
        } else {
            console.warn(`Attempted to update disallowed field: ${field} for organization ${orgId} by user ${callerUid}`);
            // Optionally throw an error or ignore the field silently
        }
    }

    // Check if there are any valid fields to update after filtering
    if (Object.keys(filteredUpdates).length === 0) {
        throw new functions.https.HttpsError('invalid-argument', 'No valid fields provided for update.');
    }

    try {
        const orgRef = db.collection('organizations').doc(orgId);
        const orgDoc = await orgRef.get();

        if (!orgDoc.exists) {
            throw new functions.https.HttpsError('not-found', `Organization with ID ${orgId} not found.`);
        }

        const orgData = orgDoc.data();

        // Check if the caller is the designated contact person for this organization
        if (!orgData || !orgData.contactPersonRef || orgData.contactPersonRef.id !== callerUid) {
            throw new functions.https.HttpsError('permission-denied', 'User is not authorized to update this organization profile.');
        }

        await orgRef.update({
            ...filteredUpdates,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(), // Update timestamp
        });

        console.log(`Organization profile updated for Org ID: ${orgId} by user ${callerUid}`);

        return { status: 'success', orgId: orgId };

    } catch (error) {
        console.error(`Error updating organization profile for Org ID ${orgId} by user ${callerUid}:`, error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Unable to update organization profile.', error);
    }
});

// Callable function for authenticated users to initiate the KYC submission process
export const submitKYC = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to submit KYC.');
    }

    const callerUid = context.auth.uid;
    const { entityType, entityId, kycDocuments } = data; // entityType can be 'user' or 'organization'

    // Basic validation
    if (!entityType || typeof entityType !== 'string' || !['user', 'organization'].includes(entityType)) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid entity type.');
    }
    if (!entityId || typeof entityId !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'The "entityId" parameter is required and must be a string.');
    }
    // Add more specific validation for kycDocuments (e.g., format, content)
    if (!kycDocuments || !Array.isArray(kycDocuments) || kycDocuments.length === 0) {
         throw new functions.https.HttpsError('invalid-argument', 'KYC documents are required.');
    }

    try {
        let entityRef: FirebaseFirestore.DocumentReference;

        if (entityType === 'user') {
            // User must be submitting KYC for themselves
            if (entityId !== callerUid) {
                 throw new functions.https.HttpsError('permission-denied', 'User can only submit KYC for their own profile.');
            }
            entityRef = db.collection('users').doc(entityId);
        } else { // entityType === 'organization'
            // Check if the caller is the designated contact person for the organization
             const orgDoc = await db.collection('organizations').doc(entityId).get();
             const orgData = orgDoc.data();

             if (!orgDoc.exists || !orgData || !orgData.contactPersonRef || orgData.contactPersonRef.id !== callerUid) {
                 throw new functions.https.HttpsError('permission-denied', 'User is not authorized to submit KYC for this organization.');
             }
            entityRef = db.collection('organizations').doc(entityId);
        }

        const entityDoc = await entityRef.get();
        const entityData = entityDoc.data();

        if (!entityDoc.exists) {
             throw new functions.https.HttpsError('not-found', `${entityType} document with ID ${entityId} not found.`);
        }

        // Ensure the current status allows submission (e.g., not already verified)
        if (entityData?.kycStatus === 'verified') {
             throw new functions.https.HttpsError('failed-precondition', `${entityType} already verified.`);
        }

        // TODO: Integrate with third-party KYC provider here
        // - Upload documents to secure storage (e.g., Cloud Storage)
        // - Send a request to the KYC provider API with document references and entity details
        console.log(`Initiating KYC submission for ${entityType} ${entityId}. Documents provided: ${kycDocuments.length}`);
        // Example: const kycProviderResponse = await callKycProviderApi(entityId, kycDocuments);

        // Update status to 'submitted'
        await entityRef.update({
            kycStatus: 'submitted',
            kycSubmittedAt: admin.firestore.FieldValue.serverTimestamp(),
            // Store references to submitted documents (optional, depending on process)
            // submittedKycDocuments: kycDocuments.map(doc => ({ filename: doc.filename, url: doc.url })) // Example
        });

        console.log(`KYC status updated to 'submitted' for ${entityType} ${entityId}.`);

        return { status: 'submission_initiated', entityId: entityId, entityType: entityType };

    } catch (error) {
        console.error(`Error submitting KYC for ${entityType} ${entityId}:`, error);
         if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', `Unable to submit KYC for ${entityType}.`, error);
    }
});

// Placeholder callable function representing the endpoint for receiving KYC results from a third-party provider
// This function should have restricted access - NOT for general public use.
// Access could be secured via:
// - API Key in the request header/body
// - IP Whitelisting
// - Callable function with App Check enabled (less common for direct webhooks)
// - Using an HTTP trigger and validating a secret in the request
// - Using a Pub/Sub topic the external provider pushes to, and this function is triggered by Pub/Sub.
export const processKYC = functions.https.onCall(async (data, context) => { // Using onCall as a placeholder, consider HTTP trigger for webhooks
    // IMPORTANT: Implement strong security checks here to ensure the request is from a trusted source.
    // This onCall trigger is NOT suitable for direct webhook calls without further security measures.

    // Example input data from a KYC provider webhook:
    // {
    //   entityId: 'user_or_org_id',
    //   entityType: 'user' | 'organization',
    //   verificationStatus: 'verified' | 'rejected',
    //   verificationDetails: { ... }, // Details from the KYC provider
    //   timestamp: '...'
    //   // Add signature/secret validation here!
    // }

    console.log('Received potential KYC result data. IMPORTANT: Validate source security.');
    // TODO: Implement source validation (API key, secret, signature, IP whitelist, etc.)
    // if (!isValidKycProviderRequest(data, context)) {
    //     throw new functions.https.HttpsError('unauthenticated', 'Unauthorized KYC result submission.');
    // }

    const { entityId, entityType, verificationStatus, verificationDetails } = data;

     // Basic validation
     if (!entityType || typeof entityType !== 'string' || !['user', 'organization'].includes(entityType)) {
         console.error('Invalid entity type received in processKYC:', entityType);
         throw new functions.https.HttpsError('invalid-argument', 'Invalid entity type.');
     }
     if (!entityId || typeof entityId !== 'string') {
          console.error('Invalid entity ID received in processKYC:', entityId);
         throw new functions.https.HttpsError('invalid-argument', 'The "entityId" parameter is required and must be a string.');
     }
    if (!verificationStatus || typeof verificationStatus !== 'string' || !['verified', 'rejected'].includes(verificationStatus)) {
         console.error('Invalid verification status received in processKYC:', verificationStatus);
        throw new functions.https.HttpsError('invalid-argument', 'Invalid verification status.');
    }
     // verificationDetails are optional and can be any object

    try {
        let entityRef: FirebaseFirestore.DocumentReference;

        if (entityType === 'user') {
             entityRef = db.collection('users').doc(entityId);
        } else { // entityType === 'organization'
             entityRef = db.collection('organizations').doc(entityId);
        }

        // Update kycStatus and store verification details
        await entityRef.update({
            kycStatus: verificationStatus,
            kycVerifiedAt: admin.firestore.FieldValue.serverTimestamp(),
            verificationDetails: verificationDetails || null, // Store details from provider
        });

        console.log(`KYC status updated to '${verificationStatus}' for ${entityType} ${entityId}.`);

        // TODO: Trigger next steps based on verification status (e.g., unlock features, send notification)
        // if (verificationStatus === 'verified') { triggerOnboardingCompletion(entityId, entityType); }

        return { status: 'kyc_processed', entityId: entityId, entityType: entityType, verificationStatus: verificationStatus };

    } catch (error) {
        console.error(`Error processing KYC result for ${entityType} ${entityId}:`, error);
         // Avoid throwing HttpsError here if this is a webhook listener, just log and potentially return an error status to the provider
         // throw new functions.https.HttpsError('internal', `Unable to process KYC result for ${entityType}.`, error);
         return { status: 'error', message: `Unable to process KYC result: ${error.message}` };
    }
});

/**
 * Cloud Function to assign or remove a role from a user.
 * This function should only be accessible to administrators.
 * (Integrated from users.ts)
 */
export const assignRole = functions.https.onCall(async (data, context) => {
  // Ensure the request is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to manage roles.');
  }

  const callerUid = context.auth.uid;
  const targetUserId = data.targetUserId;
  const role = data.role; // The role to assign or remove
  const action = data.action; // 'assign' or 'remove'

  if (!targetUserId || typeof targetUserId !== 'string' || !role || typeof role !== 'string' || (action !== 'assign' && action !== 'remove')) {
    throw new functions.https.HttpsError('invalid-argument', 'Target user ID, role, and action (assign/remove) are required strings.');
  }

  try {
    // Strong authorization check: Verify that the authenticated user has an 'admin' role.
    // This can be done by checking custom claims set on the user's auth record
    // or by checking a field in their user document in Firestore.
    const callerUserRecord = await admin.auth().getUser(callerUid);
    // TODO: Implement a more robust admin check, potentially using the 'roles' array from the user document or a specific admin flag.
    // Assuming 'admin' custom claim for now as in the original code.
    if (!callerUserRecord.customClaims || !callerUserRecord.customClaims.admin) {
      throw new functions.https.HttpsError('permission-denied', 'Only administrators can manage roles.');
    }

    const userRef = admin.firestore().collection('users').doc(targetUserId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
        throw new functions.https.HttpsError('not-found', `User with ID ${targetUserId} not found.`);
    }

    const currentRoles: string[] = userDoc.data()?.roles || []; // Use 'roles' array as in the original code
    let updatedRoles = [...currentRoles];

    if (action === 'assign') {
      if (!updatedRoles.includes(role)) {
        updatedRoles.push(role);
        // Optional: If managing a 'primaryRole' field as well, update it here.
        // await userRef.update({ primaryRole: role });
      }
    } else if (action === 'remove') {
      updatedRoles = updatedRoles.filter(r => r !== role);
      // Optional: If managing a 'primaryRole' field, reset it if the removed role was primary.
      // if (userDoc.data()?.primaryRole === role) { await userRef.update({ primaryRole: null }); }
    }

    // Update the roles array in the user's Firestore document.
    await userRef.update({
        roles: updatedRoles,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(), // Update timestamp
    });

    // TODO: Consider updating Firebase Authentication custom claims if you rely on them for frontend auth checks.
    // This requires listing all roles in the custom claims, which has size limits.
    // await admin.auth().setCustomUserClaims(targetUserId, { roles: updatedRoles });

    console.log(`Role '${role}' ${action === 'assign' ? 'assigned to' : 'removed from'} user ${targetUserId} by admin ${callerUid}.`);

    return { message: `Role '${role}' ${action === 'assign' ? 'assigned to' : 'removed from'} user ${targetUserId} successfully.` };

  } catch (error: any) {
    console.error('Error assigning/removing role:', error);
    if (error instanceof functions.https.HttpsError) {
        throw error;
    }
    throw new functions.https.HttpsError('internal', 'Unable to manage user role.');
  }
});

// Callable function for administrators to assign/update user roles
export const assignUserRole = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    }

    const callerUid = context.auth.uid;
    // Assume getRole helper function is available (e.g., imported from module1)
    // If not available globally, uncomment and implement/import:
    // const getRole = async (uid: string) => { ... };
    const callerRole = await db.collection('users').doc(callerUid).get().then(doc => doc.data()?.primaryRole); // Simple role check

    // Only allow 'admin' role to assign roles
    if (callerRole !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'User does not have permission to assign roles.');
    }

    const { userId, role } = data;

    // Validate input
    if (!userId || typeof userId !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'The "userId" parameter is required and must be a string.');
    }
    if (!role || typeof role !== 'string') { // Add more specific role validation if needed
        throw new functions.https.HttpsError('invalid-argument', 'The "role" parameter is required and must be a string.');
    }

    try {
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            throw new functions.https.HttpsError('not-found', `User with ID ${userId} not found.`);
        }

        // Update the primaryRole field in the user's Firestore document
        await userRef.update({
            primaryRole: role,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Optional: Update Firebase Authentication custom claims for immediate role enforcement
        await admin.auth().setCustomUserClaims(userId, { role: role });

        console.log(`Assigned role '${role}' to user ${userId} by admin ${callerUid}`);

        return { userId, role, status: 'role_assigned' };

    } catch (error) {
        console.error(`Error assigning role to user ${userId}:`, error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Unable to assign user role.', error);
    }
});