'use server';
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
exports.onProfileUpdateEnrich = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const profile_summary_generator_1 = require("@/ai/flows/profile-summary-generator");
const db = admin.firestore();
/**
 * Triggered when a user's profile is updated. If the primaryRole has been set
 * for the first time or changed, it uses an AI flow to generate a new profile summary.
 */
exports.onProfileUpdateEnrich = functions.firestore
    .document("users/{userId}")
    .onUpdate(async (change, context) => {
    var _a;
    const beforeData = change.before.data();
    const afterData = change.after.data();
    const userId = context.params.userId;
    // Exit if the role hasn't changed or if a summary already exists and wasn't just cleared.
    // This prevents running on every profile update.
    const roleChanged = beforeData.primaryRole !== afterData.primaryRole;
    const summaryExists = !!afterData.profileSummary;
    // We only want to generate a summary if the role has meaningfully changed
    // and the user hasn't already written their own custom summary.
    // A simple check is to see if the role changed from the default or is new.
    if (!roleChanged || (summaryExists && !afterData.profileSummary.includes("Just joined"))) {
        console.log(`Skipping summary generation for user ${userId}. Role unchanged or summary already exists.`);
        return null;
    }
    try {
        console.log(`Generating profile summary for user ${userId} with new role: ${afterData.primaryRole}`);
        const result = await (0, profile_summary_generator_1.generateProfileSummary)({
            stakeholderType: afterData.primaryRole,
            location: ((_a = afterData.location) === null || _a === void 0 ? void 0 : _a.address) || 'the community',
            areasOfInterest: Array.isArray(afterData.areasOfInterest) ? afterData.areasOfInterest.join(', ') : '',
            needs: Array.isArray(afterData.needs) ? afterData.needs.join(', ') : '',
            language: 'en', // Defaulting to english for this backend process
        });
        if (result.summary) {
            await db.collection('users').doc(userId).update({
                profileSummary: result.summary,
            });
            console.log(`Successfully updated profile summary for user ${userId}.`);
        }
    }
    catch (error) {
        console.error(`Error generating profile summary for user ${userId}:`, error);
    }
    return null;
});
//# sourceMappingURL=ai-services.js.map