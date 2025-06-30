"use strict";
/**
 * =================================================================
 * Module 11: Insurance Services (Agricultural Risk Mitigation)
 * =================================================================
 * This module provides a dedicated framework within DamDoh for managing and
 * facilitating access to agricultural insurance products, helping farmers and
 * stakeholders mitigate risks associated with unpredictable environmental
 * factors, market fluctuations, and operational challenges.
 *
 * @purpose To connect farmers with relevant and accessible agricultural
 * insurance solutions, streamline the policy management process from risk
 * assessment to claim processing, and ultimately provide financial security
 * against unforeseen events that impact agricultural productivity and income.
 *
 * @key_concepts
 * - Insurance Product Catalog: A curated list of various agricultural
 *   insurance products, including parametric and multi-peril crop insurance.
 * - Risk Assessment & Underwriting Support: Leverages farm data (Module 3)
 *   and environmental data (Module 1) for data-driven risk assessment.
 * - Policy Management: Allows users to browse, apply for, and manage
 *   insurance policies directly within the app.
 * - Claim Processing & Payouts: Streamlined digital claim submission with
 *   support for parametric triggers based on weather/satellite data.
 *
 * @firebase_data_model
 * - insurance_products: Stores available insurance products and their terms.
 * - insurance_policies: Records policies held by users, linked to assets.
 * - insurance_claims: Tracks all claims from submission to settlement.
 * - insurers: A directory of partner insurance providers.
 *
 * @synergy
 * - Relies on Module 1 (Traceability) for weather/satellite data for parametric triggers.
 * - Uses data from Module 3 (Farm Management) for risk assessment.
 * - Integrates with Module 7 (Financials) for premium payments and claim payouts.
 * - Triggers Module 13 (Notifications) for reminders and status updates.
 */
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
exports.initiateClaimPayout = exports.processInsuranceApplication = exports.triggerParametricPayout = exports.processInsuranceClaim = exports.assessRiskForPolicy = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
/**
 * =================================================================
 * Module 11: Insurance Service
 * =================================================================
 */
// --- Internal AI-Driven Functions (moved from ai-services.ts) ---
/**
 * Internal logic for assessing insurance risk for a policy.
 * This is an internal function to be called by other functions within this module.
 *
 * @param {any} data Data payload including policy, policyholder, and asset details.
 * @return {Promise<object>} An object with the insurance risk score
 * and contributing factors.
 */
async function _internalAssessInsuranceRisk(data) {
    console.log("_internalAssessInsuranceRisk called with data:", data);
    const riskScore = Math.random() * 10;
    const riskFactors = [
        "High flood risk in region",
        "Lack of documented pest management",
        "Monocropping practice",
    ];
    return {
        insuranceRiskScore: riskScore.toFixed(2),
        riskFactors: riskFactors,
        status: "placeholder_assessment_complete",
    };
}
/**
 * Internal logic for verifying an insurance claim's validity.
 * This is an internal function to be called by other functions within this module.
 *
 * @param {any} data Data payload including claim details, policy, and other
 * evidence (e.g., weather data).
 * @return {Promise<object>} An object with the verification result, including
 * status and payout amount if approved.
 */
async function _internalVerifyClaim(data) {
    console.log("_internalVerifyClaim called with data:", data);
    const verificationResult = {
        status: Math.random() > 0.3 ? "approved" : "rejected",
        payoutAmount: 500.00,
        assessmentDetails: {
            verificationLog: "Weather data confirmed drought during incident period. Farm activity logs consistent.",
            dataPointsConsidered: [
                "weather_data",
                "farm_activity_logs",
                "vti_events",
            ],
        },
    };
    return verificationResult;
}
// --- Main Module Functions ---
exports.assessRiskForPolicy = functions.firestore
    .document("insurance_policies/{policyId}")
    .onWrite(async (change, context) => {
    var _a, _b, _c;
    const policyAfter = change.after.data();
    if (!policyAfter ||
        (change.before.exists &&
            ((_b = (_a = change.after.data()) === null || _a === void 0 ? void 0 : _a.updatedAt) === null || _b === void 0 ? void 0 : _b.isEqual((_c = change.before.data()) === null || _c === void 0 ? void 0 : _c.updatedAt)))) {
        return null;
    }
    const policyId = context.params.policyId;
    const policyholderRef = policyAfter === null || policyAfter === void 0 ? void 0 : policyAfter.policyholderRef;
    const insuredAssets = policyAfter === null || policyAfter === void 0 ? void 0 : policyAfter.insuredAssets;
    if (!policyholderRef || !insuredAssets || insuredAssets.length === 0) {
        console.log(`Policy ${policyId} is missing policyholder or insured assets, skipping risk assessment.`);
        return null;
    }
    const userId = policyholderRef.id;
    console.log(`Initiating risk assessment for policy ${policyId} (User/Org: ${userId})...`);
    try {
        const policyholderDetails = (await policyholderRef.get()).data();
        const insuredAssetsDetails = await Promise.all(insuredAssets.map(async (asset) => {
            const assetDoc = await asset.assetRef.get();
            return assetDoc.exists ?
                {
                    type: asset.type,
                    assetId: asset.assetRef.id,
                    details: assetDoc.data(),
                } :
                null;
        })).then((results) => results.filter((r) => r !== null));
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
        console.log(`Risk assessment stored with ID: ${newRiskAssessmentRef.id} for policy ${policyId}.`);
        await change.after.ref.set({
            riskAssessmentRef: newRiskAssessmentRef,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        console.log(`Policy ${policyId} updated with risk assessment reference.`);
        return null;
    }
    catch (error) {
        console.error(`Error during risk assessment for policy ${policyId}:`, error);
        return null;
    }
});
exports.processInsuranceClaim = functions.firestore
    .document("claims/{claimId}")
    .onCreate(async (snapshot, context) => {
    const claimId = context.params.claimId;
    const claimData = snapshot.data();
    if (!claimData)
        return null;
    console.log(`Initiating processing for claim ${claimId}...`);
    const policyRef = claimData === null || claimData === void 0 ? void 0 : claimData.policyRef;
    const incidentDate = claimData === null || claimData === void 0 ? void 0 : claimData.incidentDate;
    if (!policyRef || !incidentDate) {
        console.error(`Claim ${claimId} is missing policy reference or incident date.`);
        return null;
    }
    try {
        const policyDoc = await policyRef.get();
        const policyData = policyDoc.data();
        if (!policyDoc.exists || !policyData) {
            console.error(`Policy not found for claim ${claimId}. Policy ID: ${policyRef.id}`);
            return null;
        }
        const insuredAssets = policyData.insuredAssets;
        if (!insuredAssets || insuredAssets.length === 0) {
            console.error(`Policy ${policyRef.id} linked to claim ${claimId} has no insured assets.`);
            return null;
        }
        const claimVerificationData = {
            claimDetails: claimData,
            policyDetails: policyData,
            insuredAssetsDetails: await Promise.all(insuredAssets.map(async (asset) => (await asset.assetRef.get()).data())),
        };
        console.log("Sending data to internal AI for claim verification and payout...");
        const claimResult = await _internalVerifyClaim(claimVerificationData);
        const updateData = {
            status: claimResult.status === "approved" ? "approved" : "rejected",
            assessmentDetails: claimResult.assessmentDetails,
        };
        if (claimResult.status === "approved" &&
            claimResult.payoutAmount !== undefined) {
            updateData.payoutAmount = claimResult.payoutAmount;
            console.log(`Claim ${claimId} approved, triggering payout via Module 7 (placeholder)...`);
        }
        await snapshot.ref.update(updateData);
        console.log(`Claim ${claimId} processing complete. Status: ${updateData.status}.`);
        return null;
    }
    catch (error) {
        console.error(`Error during claim processing for claim ${claimId}:`, error);
        await snapshot.ref.update({
            status: "processing_error",
            assessmentDetails: { error: error.message },
        });
        return null;
    }
});
exports.triggerParametricPayout = functions.firestore
    .document("weather_readings/{readingId}")
    .onCreate(async (snapshot, context) => {
    const weatherReading = snapshot.data();
    if (!weatherReading)
        return null;
    const location = weatherReading === null || weatherReading === void 0 ? void 0 : weatherReading.location;
    const readingDate = weatherReading === null || weatherReading === void 0 ? void 0 : weatherReading.timestamp;
    if (!location || !readingDate) {
        console.log(`Weather reading ${snapshot.id} missing location or timestamp, skipping parametric check.`);
        return null;
    }
    console.log(`Checking for parametric payout triggers based on weather reading at ${location.latitude}, ${location.longitude} on ${readingDate.toDate()}...`);
    try {
        console.log("Querying for relevant parametric policies (placeholder)...");
        const relevantPolicies = {
            empty: false,
            docs: [
                {
                    id: "policy123",
                    ref: db.collection("insurance_policies").doc("policy123"),
                    data: () => ({
                        policyholderRef: db.collection("users").doc("userABC"),
                        insuredAssets: [
                            { assetRef: db.collection("geospatial_assets").doc("geoXYZ") },
                        ],
                        parametricThresholds: {
                            rainfall: { threshold: 100, periodHours: 24, payoutPercentage: 50 },
                        },
                        coverageAmount: 10000,
                        currency: "USD",
                    }),
                },
            ],
        };
        const policyCount = relevantPolicies.docs.length;
        console.log(`Found ${policyCount} potentially relevant parametric policies.`);
        if (relevantPolicies.empty) {
            console.log("No relevant parametric policies found for this weather reading.");
            return null;
        }
        for (const policyDoc of relevantPolicies.docs) {
            const policyId = policyDoc.id;
            const policyData = policyDoc.data();
            const parametricThresholds = policyData === null || policyData === void 0 ? void 0 : policyData.parametricThresholds;
            if (!parametricThresholds) {
                console.log(`Policy ${policyId} is missing parametric thresholds, skipping.`);
                continue;
            }
            let triggerMet = false;
            let payoutPercentage = 0;
            if (parametricThresholds.rainfall &&
                weatherReading.rainfall !== undefined) {
                console.log(`Checking rainfall trigger for policy ${policyId}... Current reading rainfall: ${weatherReading.rainfall}`);
                if (weatherReading.rainfall > parametricThresholds.rainfall.threshold) {
                    triggerMet = true;
                    payoutPercentage =
                        parametricThresholds.rainfall.payoutPercentage;
                    console.log(`Rainfall trigger met for policy ${policyId}! Payout percentage: ${payoutPercentage}%`);
                }
            }
            if (triggerMet && payoutPercentage > 0) {
                const coverageAmount = policyData.coverageAmount || 0;
                const payoutAmount = (coverageAmount * payoutPercentage) / 100;
                const currency = policyData.currency || "USD";
                const policyholderRef = policyData.policyholderRef;
                if (payoutAmount > 0 && policyholderRef) {
                    console.log(`Triggering parametric payout of ${payoutAmount} ${currency} for policy ${policyId}...`);
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
                    console.log(`Parametric payout claim created with ID: ${newClaimRef.id} for policy ${policyId}.`);
                    console.log(`Triggering payout via Module 7 for claim ${newClaimRef.id} (placeholder)...`);
                }
                else {
                    console.log(`Calculated payout amount is 0 or policyholder reference is missing for policy ${policyId}, skipping payout.`);
                }
            }
        }
        return null;
    }
    catch (error) {
        console.error(`Error during parametric payout trigger for weather reading ${snapshot.id}:`, error);
        return null;
    }
});
// =================================================================
// CONCEPTUAL FUTURE FUNCTIONS FOR MODULE 11
// =================================================================
/**
 * [Conceptual] Triggered by a new policy application from a user.
 * This function would send the application details to the relevant insurance partner's API.
 */
exports.processInsuranceApplication = functions.https.onCall(async (data, context) => {
    // Placeholder logic
    console.log("Conceptual: Processing insurance application with data:", data);
    return { success: true, message: "[Conceptual] Application sent to insurer." };
});
/**
 * [Conceptual] Triggered by an approved claim to initiate payment.
 * This function would call the Financial Services module (Module 7) to handle the payout.
 */
exports.initiateClaimPayout = functions.https.onCall(async (data, context) => {
    // Placeholder logic
    console.log("Conceptual: Initiating claim payout with data:", data);
    // 1. Call _internalInitiatePayment from financials.ts with relevant details.
    return { success: true, transactionId: `payout_${Date.now()}` };
});
//# sourceMappingURL=insurance.js.map