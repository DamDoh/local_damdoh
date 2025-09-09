

'use server';

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { generateProfileSummary } from "@/ai/flows/profile-summary-generator";
import { logInfo, logError } from './logging';

const db = admin.firestore();

/**
 * Triggered when a user's profile is updated. If the primaryRole has been set
 * for the first time or changed, it uses an AI flow to generate a new profile summary.
 */
export const onProfileUpdateEnrich = functions.firestore
  .document("users/{userId}")
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();
    const userId = context.params.userId;

    const roleChanged = beforeData.primaryRole !== afterData.primaryRole;
    const summaryExists = !!afterData.profileSummary;
    
    if (!roleChanged || (summaryExists && !afterData.profileSummary.includes("Just joined"))) {
        logInfo("Skipping summary generation for user", { userId, reason: "Role unchanged or summary already customized." });
        return null;
    }

    try {
      logInfo("Generating profile summary for user", { userId, newRole: afterData.primaryRole });

      const result = await generateProfileSummary({
        stakeholderType: afterData.primaryRole,
        location: afterData.location?.address || 'the community',
        areasOfInterest: Array.isArray(afterData.areasOfInterest) ? afterData.areasOfInterest.join(', ') : '',
        needs: Array.isArray(afterData.needs) ? afterData.needs.join(', ') : '',
        language: 'en', // Defaulting to english for this backend process
      });

      if (result.summary) {
        await db.collection('users').doc(userId).update({
          profileSummary: result.summary,
        });
        logInfo("Successfully updated profile summary for user.", { userId });
      }
    } catch (error) {
      logError("Error generating profile summary for user", { userId, error });
    }

    return null;
  });

    
