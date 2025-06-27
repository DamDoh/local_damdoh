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
exports.triggerParametricPayout = exports.processInsuranceClaim = exports.assessRiskForPolicy = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const module8_1 = require("./module8");
const db = admin.firestore();
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
        console.log("Sending data to Module 8 for AI assessment (placeholder)...");
        const assessmentResult = await (0, module8_1._internalAssessInsuranceRisk)(relevantData);
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
        console.log("Sending data to Module 8 for claim verification and payout...");
        const claimResult = await (0, module8_1._internalVerifyClaim)(claimVerificationData);
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
//# sourceMappingURL=module11.js.map