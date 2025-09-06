
'use server';

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { generateProfileSummary } from "@/ai/flows/profile-summary-generator";

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
        console.log(`Successfully updated profile summary for user ${userId}.`);
      }
    } catch (error) {
      console.error(`Error generating profile summary for user ${userId}:`, error);
    }

    return null;
  });

    
