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
exports.upsertStakeholderProfile = void 0;
exports.getRole = getRole;
exports.getUserDocument = getUserDocument;
exports.getProfileByIdFromDB = getProfileByIdFromDB;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const stakeholder_profile_data_1 = require("./stakeholder-profile-data");
const db = admin.firestore();
/**
 * Validates the structure of profileData based on the stakeholder's role.
 * @param {string} role The primary role of the stakeholder.
 * @param {any} data The profileData object to validate.
 * @throws {functions.https.HttpsError} Throws an error if validation fails.
 */
const validateProfileData = (role, data) => {
    const schema = stakeholder_profile_data_1.stakeholderProfileSchemas[role];
    if (schema) {
        const result = schema.safeParse(data);
        if (!result.success) {
            throw new functions.https.HttpsError("invalid-argument", `Profile data validation failed for role ${role}: ${result.error.message}`);
        }
    }
};
/**
 * Creates or updates a detailed stakeholder profile. This is the single, secure entry point for all profile modifications.
 * @param {any} data The data for the function call. Must include a primaryRole.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{status: string, message: string}>} A promise that resolves with the status.
 */
exports.upsertStakeholderProfile = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
    }
    const { primaryRole, displayName, profileSummary, bio, location, areasOfInterest, needs, contactInfoPhone, contactInfoWebsite, profileData, } = data;
    if (!primaryRole) {
        throw new functions.https.HttpsError("invalid-argument", "A primary role must be provided.");
    }
    if (profileData) {
        validateProfileData(primaryRole, profileData);
    }
    const userId = context.auth.uid;
    try {
        const userRef = db.collection("users").doc(userId);
        const updatePayload = {
            primaryRole,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        if (displayName)
            updatePayload.displayName = displayName;
        if (profileSummary)
            updatePayload.profileSummary = profileSummary;
        if (bio)
            updatePayload.bio = bio;
        if (location)
            updatePayload.location = location;
        if (Array.isArray(areasOfInterest))
            updatePayload.areasOfInterest = areasOfInterest;
        if (Array.isArray(needs))
            updatePayload.needs = needs;
        if (contactInfoPhone || contactInfoWebsite) {
            updatePayload.contactInfo = {
                phone: contactInfoPhone || null,
                website: contactInfoWebsite || null,
            };
        }
        if (profileData)
            updatePayload.profileData = profileData;
        await userRef.set(updatePayload, { merge: true });
        return { status: "success", message: "Profile updated successfully." };
    }
    catch (error) {
        console.error("Error upserting stakeholder profile:", error);
        throw new functions.https.HttpsError("internal", "Failed to write to the database. This might be because Firestore is not enabled in your Firebase project. Please check your project settings.", { originalError: error.message });
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