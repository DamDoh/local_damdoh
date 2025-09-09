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
exports.upsertStakeholderProfile = exports.onUserDeleteCleanup = exports.onUserCreate = void 0;
exports.getRole = getRole;
exports.getUserDocument = getUserDocument;
exports.getProfileByIdFromDB = getProfileByIdFromDB;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const uuid_1 = require("uuid");
const stakeholder_profile_data_1 = require("./stakeholder-profile-data");
const community_1 = require("./community");
const db = admin.firestore();
/**
 * Triggered on new Firebase Authentication user creation.
 * Creates a corresponding user document in Firestore with default values.
 * This is the secure, server-side way to create user profiles.
 */
exports.onUserCreate = functions.auth.user().onCreate(async (user) => {
    var _a;
    console.log(`New user signed up: ${user.uid}, email: ${user.email}`);
    const userRef = db.collection("users").doc(user.uid);
    const universalId = (0, uuid_1.v4)();
    try {
        await userRef.set({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || ((_a = user.email) === null || _a === void 0 ? void 0 : _a.split('@')[0]) || "New User",
            avatarUrl: user.photoURL || null,
            primaryRole: 'Consumer', // Default role
            profileSummary: "Just joined the DamDoh community!",
            universalId: universalId,
            viewCount: 0,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`Successfully created Firestore profile for user ${user.uid}.`);
        return null;
    }
    catch (error) {
        console.error(`Error creating Firestore profile for user ${user.uid}:`, error);
        // Optional: you could add logic to delete the auth user if the profile creation fails,
        // but this could also be problematic if the function fails for transient reasons.
        return null;
    }
});
/**
 * Triggered when a user deletes their Firebase Authentication account.
 * This function performs a "cascade delete" to remove all of the user's
 * data from the Firestore database, ensuring GDPR/CCPA compliance.
 */
exports.onUserDeleteCleanup = functions.auth.user().onDelete(async (user) => {
    console.log(`User account deleted: ${user.uid}. Starting data cleanup.`);
    const uid = user.uid;
    const batchSize = 200; // Define a batch size for deletions
    const collectionsToDelete = [
        { name: 'posts', userIdField: 'userId' },
        { name: 'marketplaceItems', userIdField: 'sellerId' },
        { name: 'farms', userIdField: 'ownerId' },
        { name: 'crops', userIdField: 'ownerId' },
        // Add other collections and their respective user ID fields here
    ];
    try {
        const promises = [];
        // Delete top-level collections created by the user
        for (const collection of collectionsToDelete) {
            const query = db.collection(collection.name).where(collection.userIdField, '==', uid);
            const snapshot = await query.get();
            if (!snapshot.empty) {
                console.log(`Deleting ${snapshot.size} documents from '${collection.name}' for user ${uid}.`);
                const deletePromise = Promise.all(snapshot.docs.map(doc => doc.ref.delete()));
                promises.push(deletePromise);
            }
        }
        // Delete user's own profile document
        promises.push(db.collection('users').doc(uid).delete());
        // Delete any collections nested under the user document
        const workersPath = `users/${uid}/workers`;
        promises.push((0, community_1.deleteCollectionByPath)(workersPath, batchSize));
        // Delete credit score document
        promises.push(db.collection('credit_scores').doc(uid).delete());
        await Promise.all(promises);
        console.log(`Successfully completed data cleanup for user ${uid}.`);
        return null;
    }
    catch (error) {
        console.error(`Error cleaning up data for user ${uid}:`, error);
        return null;
    }
});
const checkAuth = (context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    return context.auth.uid;
};
/**
 * Validates the structure of profileData based on the stakeholder's role.
 * @param {string} role The primary role of the stakeholder.
 * @param {any} data The profileData object to validate.
 * @throws {functions.https.HttpsError} Throws an error if validation fails.
 */
const validateProfileData = (role, data) => {
    const schemaKey = role;
    const schema = stakeholder_profile_data_1.stakeholderProfileSchemas[schemaKey];
    if (schema) {
        const result = schema.safeParse(data);
        if (!result.success) {
            const errorMessage = result.error.errors.map(e => `${e.path.join('.')} - ${e.message}`).join('; ');
            throw new functions.https.HttpsError("invalid-argument", `Profile data validation failed for role ${role}: ${errorMessage}`);
        }
        return result.data; // Return cleaned/validated data
    }
    return data || {};
};
/**
 * Creates or updates a detailed stakeholder profile. This is the single, secure entry point for all profile modifications.
 * @param {any} data The data for the function call. Must include a primaryRole.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{status: string, message: string}>} A promise that resolves with the status.
 */
exports.upsertStakeholderProfile = functions.https.onCall(async (data, context) => {
    const userId = checkAuth(context);
    const { primaryRole, displayName, profileSummary, bio, location, areasOfInterest, needs, contactInfoPhone, contactInfoWebsite, profileData, } = data;
    // During initial sign-up, only role and display name are required.
    // The onUserCreate trigger handles the base document. This function just merges the initial role info.
    if (!primaryRole) {
        throw new functions.https.HttpsError("invalid-argument", "A primary role must be provided.");
    }
    // Validate the role-specific data if it exists
    const validatedProfileData = profileData ? validateProfileData(primaryRole, profileData) : {};
    try {
        const userRef = db.collection("users").doc(userId);
        const updatePayload = {
            primaryRole,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        if (displayName !== undefined)
            updatePayload.displayName = displayName;
        if (profileSummary !== undefined)
            updatePayload.profileSummary = profileSummary;
        if (bio !== undefined)
            updatePayload.bio = bio;
        if (location !== undefined)
            updatePayload.location = location;
        if (Array.isArray(areasOfInterest))
            updatePayload.areasOfInterest = areasOfInterest;
        if (Array.isArray(needs))
            updatePayload.needs = needs;
        if (contactInfoPhone !== undefined || contactInfoWebsite !== undefined) {
            updatePayload.contactInfo = {
                phone: contactInfoPhone || null,
                website: contactInfoWebsite || null,
            };
        }
        // Add the validated data to the payload
        if (validatedProfileData)
            updatePayload.profileData = validatedProfileData;
        // Use { merge: true } to create or update the document without overwriting existing fields.
        await userRef.set(updatePayload, { merge: true });
        return { status: "success", message: "Profile updated successfully." };
    }
    catch (error) {
        console.error("Error upserting stakeholder profile:", error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "Failed to write to the database. This might be because Firestore is not enabled in your Firebase project.", { originalError: error.message });
    }
});
/**
 * Helper function to get a user's role from Firestore.
 * @param {string | undefined} uid The user's ID.
 * @return {Promise<UserRole | null>} The user's role or null if not found.
 */
async function getRole(uid) {
    var _a;
    if (!uid) {
        return null;
    }
    try {
        const userDoc = await db.collection("users").doc(uid).get();
        const role = (_a = userDoc.data()) === null || _a === void 0 ? void 0 : _a.primaryRole;
        return role ? role : null;
    }
    catch (error) {
        console.error("Error fetching user role:", error);
        return null;
    }
}
/**
 * Helper function to get a user's document from Firestore.
 * @param {string} uid The user's ID.
 * @return {Promise<FirebaseFirestore.DocumentSnapshot | null>} The user's document snapshot or null if not found.
 */
async function getUserDocument(uid) {
    try {
        const userDoc = await db.collection("users").doc(uid).get();
        return userDoc.exists ? userDoc : null;
    }
    catch (error) {
        console.error("Error getting user document:", error);
        return null;
    }
}
/**
 * Helper function to get a user's profile from Firestore by their ID.
 * @param {string} uid The user's ID.
 * @return {Promise<any | null>} The user's profile data or null if not found.
 */
async function getProfileByIdFromDB(uid) {
    var _a, _b;
    if (!uid) {
        return null;
    }
    try {
        const userDoc = await db.collection("users").doc(uid).get();
        if (!userDoc.exists) {
            return null;
        }
        const data = userDoc.data();
        if (!data)
            return null;
        // Ensure timestamps are serialized
        const serializedData = Object.assign(Object.assign({ id: userDoc.id }, data), { createdAt: ((_a = data.createdAt) === null || _a === void 0 ? void 0 : _a.toDate) ? data.createdAt.toDate().toISOString() : new Date().toISOString(), updatedAt: ((_b = data.updatedAt) === null || _b === void 0 ? void 0 : _b.toDate) ? data.updatedAt.toDate().toISOString() : new Date().toISOString() });
        return serializedData;
    }
    catch (error) {
        console.error("Error fetching user profile by ID:", error);
        return null;
    }
}
//# sourceMappingURL=profiles.js.map