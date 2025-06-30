
/**
 * =================================================================
 * Module 2: User & Profile Management
 * =================================================================
 * This module forms the essential identity and access management layer for the
 * DamDoh Super App. It handles user registration, authentication, and comprehensive
 * profile management, enabling personalized experiences and controlled access to
 * platform functionalities for all stakeholder types.
 *
 * @purpose To provide a secure, inclusive, and adaptable system for user
 * registration, authentication, and profile management.
 *
 * @key_concepts
 * - Multi-Modal Registration: Supporting email, phone, and social logins.
 * - Comprehensive Stakeholder Profiles: Tailored data schemas for each stakeholder role.
 * - Role-Based Access Control (RBAC): Central logic for managing user permissions.
 * - KYC/AML Framework Integration: User-facing interface for submitting documentation.
 *
 * @third_party_integrations
 * - SMS Gateway Services (for OTP).
 * - Identity Verification APIs (for KYC).
 * - Social Login Providers (Google, Facebook, etc.).
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {stakeholderProfileSchemas} from "./stakeholder-profile-data";
import { UserRole, UserProfile } from "./types";

const db = admin.firestore();

/**
 * Validates the structure of profileData based on the stakeholder's role.
 * @param {string} role The primary role of the stakeholder.
 * @param {any} data The profileData object to validate.
 * @throws {functions.https.HttpsError} Throws an error if validation fails.
 */
const validateProfileData = (role: string, data: any) => {
  const schema =
    stakeholderProfileSchemas[role as keyof typeof stakeholderProfileSchemas];
  if (schema) {
    const result = schema.safeParse(data);
    if (!result.success) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        `Profile data validation failed for role ${role}: ${result.error.message}`,
      );
    }
  }
};

/**
 * [Conceptual] Triggered on new Firebase Auth user creation.
 * Initializes basic user and user_profile documents in Firestore.
 * @param {admin.auth.UserRecord} user The user record from Firebase Auth.
 * @return {Promise<void>}
 */
export const createUserProfile = functions.auth.user().onCreate(async (user) => {
    console.log(`Creating profile for new user: ${user.uid}`);
    // In a real implementation, you would get the initial role from custom claims
    // or a temporary collection during the sign-up flow.
    const defaultRole: UserRole = "Farmer"; // Defaulting to 'Farmer' for now
    const userRef = db.collection("users").doc(user.uid);
    try {
        await userRef.set({
            uid: user.uid,
            email: user.email || null,
            phoneNumber: user.phoneNumber || null,
            displayName: user.displayName || "New User",
            primaryRole: defaultRole,
            profileStatus: "active",
            kycStatus: "pending_verification",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        console.log(`Profile for user ${user.uid} created successfully.`);
    } catch (error) {
        console.error(`Error creating profile for user ${user.uid}:`, error);
    }
});


/**
 * Creates or updates a detailed stakeholder profile. This is the single, secure entry point for all profile modifications.
 * @param {any} data The data for the function call. Must include a primaryRole.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{status: string, message: string}>} A promise that resolves with the status.
 */
export const upsertStakeholderProfile = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated.",
      );
    }

    const {
      primaryRole,
      displayName,
      profileSummary,
      bio,
      location,
      areasOfInterest,
      needs,
      contactInfoPhone,
      contactInfoWebsite,
      profileData,
    } = data;

    if (!primaryRole) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "A primary role must be provided.",
      );
    }

    if (profileData) {
      validateProfileData(primaryRole, profileData);
    }

    const userId = context.auth.uid;

    try {
      const userRef = db.collection("users").doc(userId);

      const updatePayload: {[key: string]: any} = {
        primaryRole,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      if (displayName) updatePayload.displayName = displayName;
      if (profileSummary) updatePayload.profileSummary = profileSummary;
      if (bio) updatePayload.bio = bio;
      if (location) updatePayload.location = location;
      if (Array.isArray(areasOfInterest)) updatePayload.areasOfInterest = areasOfInterest;
      if (Array.isArray(needs)) updatePayload.needs = needs;
      if (contactInfoPhone || contactInfoWebsite) {
        updatePayload.contactInfo = {
          phone: contactInfoPhone || null,
          website: contactInfoWebsite || null,
        };
      }
      if (profileData) updatePayload.profileData = profileData;

      await userRef.set(updatePayload, {merge: true});

      return {status: "success", message: "Profile updated successfully."};
    } catch (error: any) {
      console.error("Error upserting stakeholder profile:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to write to the database. This might be because Firestore is not enabled in your Firebase project. Please check your project settings.",
        {originalError: error.message},
      );
    }
  },
);


/**
 * Helper function to get a user's role from Firestore.
 * @param {string | undefined} uid The user's ID.
 * @return {Promise<UserRole | null>} The user's role or null if not found.
 */
export async function getRole(uid: string | undefined): Promise<UserRole | null> {
  if (!uid) {
    return null;
  }
  try {
    const userDoc = await db.collection("users").doc(uid).get();
    const role = userDoc.data()?.primaryRole;
    return role ? (role as UserRole) : null;
  } catch (error) {
    console.error("Error fetching user role:", error);
    return null;
  }
}

/**
 * Helper function to get a user's document from Firestore.
 * @param {string} uid The user's ID.
 * @return {Promise<FirebaseFirestore.DocumentSnapshot | null>} The user's document snapshot or null if not found.
 */
export async function getUserDocument(
  uid: string,
): Promise<FirebaseFirestore.DocumentSnapshot | null> {
  try {
    const userDoc = await db.collection("users").doc(uid).get();
    return userDoc.exists ? userDoc : null;
  } catch (error) {
    console.error("Error getting user document:", error);
    return null;
  }
}


/**
 * Helper function to get a user's profile from Firestore by their ID.
 * This is intended for use by other backend functions.
 * @param {string} uid The user's ID.
 * @return {Promise<UserProfile | null>} The user's profile data or null if not found.
 */
export async function getProfileByIdFromDB(uid: string): Promise<UserProfile | null> {
    if (!uid) {
        return null;
    }
    try {
        const userDoc = await db.collection("users").doc(uid).get();
        if (!userDoc.exists) {
            return null;
        }
        
        const data = userDoc.data();
        if (!data) return null;
        
        return {
            uid: userDoc.id,
            ...data
        } as UserProfile;

    } catch (error) {
        console.error(`Error fetching user profile for uid: ${uid}`, error);
        return null;
    }
}


/**
 * [Conceptual] Callable function for a user to initiate their KYC verification process.
 * @param {any} data - Contains document types and URLs to uploaded files in Cloud Storage.
 * @param {functions.https.CallableContext} context - The context of the function call.
 * @return {Promise<{status: string, verificationId: string}>} - A promise resolving with the verification status.
 */
export const requestKYCVerification = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated to request KYC verification.");
    }
    const { documentType, documentUrl } = data;
    if (!documentType || !documentUrl) {
        throw new functions.https.HttpsError("invalid-argument", "Document type and URL are required.");
    }
    console.log(`[Conceptual] User ${context.auth.uid} initiated KYC verification with document type: ${documentType}.`);
    // Placeholder for logic that would send this to a third-party KYC provider or an admin review queue.
    return { status: "verification_pending", verificationId: "kyc_placeholder_123" };
});

/**
 * [Conceptual] Callable function for a user to update their language preference.
 * @param {any} data - Contains the new language code (e.g., 'sw', 'km').
 * @param {functions.https.CallableContext} context - The context of the function call.
 * @return {Promise<{success: boolean}>} - A promise resolving on completion.
 */
export const syncUserLanguagePref = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated to update preferences.");
    }
    const { languageCode } = data;
    if (!languageCode || typeof languageCode !== 'string') {
        throw new functions.https.HttpsError("invalid-argument", "A valid language code is required.");
    }
    const userRef = db.collection("users").doc(context.auth.uid);
    await userRef.update({ preferredLanguage: languageCode });
    console.log(`[Conceptual] User ${context.auth.uid} updated language preference to: ${languageCode}.`);
    return { success: true };
});
