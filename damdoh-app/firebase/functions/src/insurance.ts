
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {
  _internalAssessInsuranceRisk,
  _internalVerifyClaim,
} from "./ai-and-analytics";

const db = admin.firestore();

/**
 * =================================================================
 * Module 11: Insurance Service
 * =================================================================
 */

// --- Main Module Functions ---

export const assessRiskForPolicy = functions.firestore
  .document("insurance_policies/{policyId}")
  .onWrite(async (change, context) => {
    const policyAfter = change.after.data();
    if (
      !policyAfter ||
      (change.before.exists &&
        change.after.data()?.updatedAt?.isEqual(change.before.data()?.updatedAt))
    ) {
      return null;
    }

    const policyId = context.params.policyId;
    const policyholderRef = policyAfter?.policyholderRef as
      | admin.firestore.DocumentReference
      | undefined;
    const insuredAssets = policyAfter?.insuredAssets as
      | Array<{type: string; assetRef: admin.firestore.DocumentReference}>
      | undefined;

    if (!policyholderRef || !insuredAssets || insuredAssets.length === 0) {
      console.log(
        `Policy ${policyId} is missing policyholder or insured assets, skipping risk assessment.`,
      );
      return null;
    }

    const userId = policyholderRef.id;

    console.log(
      `Initiating risk assessment for policy ${policyId} (User/Org: ${userId})...`,
    );

    try {
      const policyholderDetails = (await policyholderRef.get()).data();
      const insuredAssetsDetails = await Promise.all(
        insuredAssets.map(async (asset) => {
          const assetDoc = await asset.assetRef.get();
          return assetDoc.exists ?
            {
              type: asset.type,
              assetId: asset.assetRef.id,
              details: assetDoc.data(),
            } :
            null;
        }),
      ).then((results) => results.filter((r) => r !== null));

      const relevantData = {
        policyDetails: policyAfter,
        policyholderDetails,
        insuredAssetsDetails,
      };

      console.log("Sending data to internal AI for assessment...");
      const assessmentResult = await _internalAssessInsuranceRisk(relevantData);

      const newRiskAssessmentRef = db.collection("risk_assessments").doc();
      await newRiskAssessmentRef.set({
        assessmentId: newRiskAssessmentRef.id,
        userRef: policyholderRef,
        assessmentDate: admin.firestore.FieldValue.serverTimestamp(),
        score: assessmentResult.insuranceRiskScore,
        riskFactors: assessmentResult.riskFactors,
        linkedAssets: insuredAssets.map((asset) => ({
          type: asset.type,
          assetRef: asset.assetRef,
        })),
        aiModelVersion: "v1.0-placeholder",
        recommendations_en: [
          "Improve irrigation systems",
          "Diversify crops",
        ],
        recommendations_local: {
          es: ["Mejorar sistemas de riego", "Diversificar cultivos"],
        },
      });
      console.log(
        `Risk assessment stored with ID: ${newRiskAssessmentRef.id} for policy ${policyId}.`,
      );

      await change.after.ref.set(
        {
          riskAssessmentRef: newRiskAssessmentRef,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        {merge: true},
      );
      console.log(
        `Policy ${policyId} updated with risk assessment reference.`,
      );

      return null;
    } catch (error: any) {
      console.error(
        `Error during risk assessment for policy ${policyId}:`,
        error,
      );
      return null;
    }
  });

export const processInsuranceClaim = functions.firestore
  .document("claims/{claimId}")
  .onCreate(async (snapshot, context) => {
    const claimId = context.params.claimId;
    const claimData = snapshot.data();
    if (!claimData) return null;

    console.log(`Initiating processing for claim ${claimId}...`);

    const policyRef = claimData?.policyRef as
      | admin.firestore.DocumentReference
      | undefined;
    const incidentDate = claimData?.incidentDate as
      | admin.firestore.Timestamp
      | undefined;

    if (!policyRef || !incidentDate) {
      console.error(
        `Claim ${claimId} is missing policy reference or incident date.`,
      );
      return null;
    }

    try {
      const policyDoc = await policyRef.get();
      const policyData = policyDoc.data();

      if (!policyDoc.exists || !policyData) {
        console.error(
          `Policy not found for claim ${claimId}. Policy ID: ${policyRef.id}`,
        );
        return null;
      }

      const insuredAssets = policyData.insuredAssets as
        | Array<{type: string; assetRef: admin.firestore.DocumentReference}>
        | undefined;

      if (!insuredAssets || insuredAssets.length === 0) {
        console.error(
          `Policy ${policyRef.id} linked to claim ${claimId} has no insured assets.`,
        );
        return null;
      }

      const claimVerificationData: {[key: string]: any} = {
        claimDetails: claimData,
        policyDetails: policyData,
        insuredAssetsDetails: await Promise.all(
          insuredAssets.map(async (asset) =>
            (await asset.assetRef.get()).data(),
          ),
        ),
      };

      console.log("Sending data to internal AI for claim verification and payout...");
      const claimResult = await _internalVerifyClaim(claimVerificationData);

      const updateData: any = {
        status: claimResult.status === "approved" ? "approved" : "rejected",
        assessmentDetails: claimResult.assessmentDetails,
      };

      if (
        claimResult.status === "approved" &&
        claimResult.payoutAmount !== undefined
      ) {
        updateData.payoutAmount = claimResult.payoutAmount;
        console.log(
          `Claim ${claimId} approved, triggering payout via Module 7 (placeholder)...`,
        );
      }

      await snapshot.ref.update(updateData);
      console.log(
        `Claim ${claimId} processing complete. Status: ${updateData.status}.`,
      );

      return null;
    } catch (error: any) {
      console.error(`Error during claim processing for claim ${claimId}:`, error);
      await snapshot.ref.update({
        status: "processing_error",
        assessmentDetails: {error: error.message},
      });
      return null;
    }
  });

export const triggerParametricPayout = functions.firestore
  .document("weather_readings/{readingId}")
  .onCreate(
    async (
      snapshot: admin.firestore.DocumentSnapshot,
      context: functions.EventContext,
    ) => {
      const weatherReading = snapshot.data();
      if (!weatherReading) return null;

      const location = weatherReading?.location;
      const readingDate = weatherReading?.timestamp;

      if (!location || !readingDate) {
        console.log(
          `Weather reading ${snapshot.id} missing location or timestamp, skipping parametric check.`,
        );
        return null;
      }

      console.log(
        `Checking for parametric payout triggers based on weather reading at ${
          location.latitude
        }, ${location.longitude} on ${readingDate.toDate()}...`,
      );

      try {
        console.log("Querying for relevant parametric policies (placeholder)...");
        const relevantPolicies: admin.firestore.QuerySnapshot = {
          empty: false,
          docs: [
                {
                  id: "policy123",
                  ref: db.collection("insurance_policies").doc("policy123"),
                  data: () =>
                    ({
                      policyholderRef: db.collection("users").doc("userABC"),
                      insuredAssets: [
                        {assetRef: db.collection("geospatial_assets").doc("geoXYZ")},
                      ],
                      parametricThresholds: {
                        rainfall: {threshold: 100, periodHours: 24, payoutPercentage: 50},
                      },
                      coverageAmount: 10000,
                      currency: "USD",
                    }),
                } as admin.firestore.QueryDocumentSnapshot<any>,
          ],
        } as unknown as admin.firestore.QuerySnapshot;
        const policyCount = relevantPolicies.docs.length;
        console.log(`Found ${policyCount} potentially relevant parametric policies.`);

        if (relevantPolicies.empty) {
          console.log("No relevant parametric policies found for this weather reading.");
          return null;
        }

        for (const policyDoc of relevantPolicies.docs) {
          const policyId = policyDoc.id;
          const policyData = policyDoc.data();
          const parametricThresholds = policyData?.parametricThresholds;

          if (!parametricThresholds) {
            console.log(
              `Policy ${policyId} is missing parametric thresholds, skipping.`,
            );
            continue;
          }

          let triggerMet = false;
          let payoutPercentage = 0;

          if (
            parametricThresholds.rainfall &&
              weatherReading.rainfall !== undefined
          ) {
            console.log(
              `Checking rainfall trigger for policy ${policyId}... Current reading rainfall: ${weatherReading.rainfall}`,
            );
            if (
              weatherReading.rainfall > parametricThresholds.rainfall.threshold
            ) {
              triggerMet = true;
              payoutPercentage =
                  parametricThresholds.rainfall.payoutPercentage;
              console.log(
                `Rainfall trigger met for policy ${policyId}! Payout percentage: ${payoutPercentage}%`,
              );
            }
          }

          if (triggerMet && payoutPercentage > 0) {
            const coverageAmount = policyData.coverageAmount || 0;
            const payoutAmount = (coverageAmount * payoutPercentage) / 100;
            const currency = policyData.currency || "USD";
            const policyholderRef = policyData.policyholderRef as admin.firestore.DocumentReference;

            if (payoutAmount > 0 && policyholderRef) {
              console.log(
                `Triggering parametric payout of ${payoutAmount} ${currency} for policy ${policyId}...`,
              );
              const newClaimRef = db.collection("claims").doc();

              await newClaimRef.set({
                claimId: newClaimRef.id,
                policyRef: policyDoc.ref,
                policyholderRef: policyholderRef,
                insurerRef: policyData.insurerRef,
                submissionDate: admin.firestore.FieldValue.serverTimestamp(),
                status: "approved",
                claimedAmount: payoutAmount,
                currency: currency,
                incidentDate: readingDate,
                description: "Parametric payout triggered by weather event.",
                supportingDocumentsUrls: [snapshot.ref.path],
                assessmentDetails: {
                  trigger: "parametric_weather",
                  weatherReadingId: snapshot.id,
                  details: weatherReading,
                  payoutPercentage: payoutPercentage,
                },
                payoutAmount: payoutAmount,
                payoutDate: admin.firestore.FieldValue.serverTimestamp(),
              });
              console.log(
                `Parametric payout claim created with ID: ${newClaimRef.id} for policy ${policyId}.`,
              );
              console.log(
                `Triggering payout via Module 7 for claim ${newClaimRef.id} (placeholder)...`,
              );
            } else {
              console.log(
                `Calculated payout amount is 0 or policyholder reference is missing for policy ${policyId}, skipping payout.`,
              );
            }
          }
        }

        return null;
      } catch (error: any) {
        console.error(
          `Error during parametric payout trigger for weather reading ${snapshot.id}:`,
          error,
        );
        return null;
      }
    },
  );
