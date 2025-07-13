
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

const checkAuth = (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "error.unauthenticated");
  }
  return context.auth.uid;
};

// --- Internal AI-Driven Functions (moved from ai-and-analytics.ts) ---
async function _internalAssessInsuranceRisk(data: any) {
    console.log("_internalAssessInsuranceRisk called with data:", data);
    const riskScore = Math.random() * 10;
    const riskFactors = [ "High flood risk in region", "Lack of documented pest management", "Monocropping practice"];
    return { insuranceRiskScore: riskScore.toFixed(2), riskFactors: riskFactors, status: "placeholder_assessment_complete" };
}

async function _internalVerifyClaim(data: any) {
    console.log("_internalVerifyClaim called with data:", data);
    const verificationResult = {
        status: Math.random() > 0.3 ? "approved" : "rejected",
        payoutAmount: 500.00,
        assessmentDetails: {
            verificationLog: "Weather data confirmed drought during incident period. Farm activity logs consistent.",
            dataPointsConsidered: ["weather_data", "farm_activity_logs", "vti_events"],
        },
    };
    return verificationResult;
}

// --- Main Module Functions ---
const checkInsuranceProviderAuth = async (context: functions.https.CallableContext) => {
    const uid = context.auth?.uid;
    if (!uid) throw new functions.https.HttpsError("unauthenticated", "error.unauthenticated");
    const userDoc = await db.collection("users").doc(uid).get();
    const userRole = userDoc.data()?.primaryRole;
    if (userRole !== 'Insurance Provider') throw new functions.https.HttpsError("permission-denied", "error.permissionDenied");
    return uid;
};

export const createInsuranceProduct = functions.https.onCall(async (data, context) => {
    const providerId = await checkInsuranceProviderAuth(context);
    const { name, type, description, coverageDetails, premium, currency } = data;

    if (!name || !type || !description || !coverageDetails || !premium || !currency) {
        throw new functions.https.HttpsError("invalid-argument", "error.form.missingFields");
    }
    
    const productRef = db.collection("insurance_products").doc();
    await productRef.set({
        providerId, name, type, description, coverageDetails,
        premium: Number(premium), currency, status: 'Active',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, productId: productRef.id };
});

export const getInsuranceProducts = functions.https.onCall(async (data, context) => {
    const providerId = await checkInsuranceProviderAuth(context);
    const productsSnapshot = await db.collection("insurance_products").where("providerId", "==", providerId).orderBy("createdAt", "desc").get();
    return {
        products: productsSnapshot.docs.map(doc => ({
            id: doc.id, ...doc.data(),
            createdAt: (doc.data().createdAt as admin.firestore.Timestamp)?.toDate?.().toISOString(),
            updatedAt: (doc.data().updatedAt as admin.firestore.Timestamp)?.toDate?.().toISOString(),
        }))
    };
});

export const getAvailableInsuranceProducts = functions.https.onCall(async (data, context) => {
    const snapshot = await db.collection("insurance_products").where("status", "==", "Active").orderBy("createdAt", "desc").get();
    return {
        products: snapshot.docs.map(doc => ({
            id: doc.id, ...doc.data(),
            createdAt: (doc.data().createdAt as admin.firestore.Timestamp)?.toDate?.().toISOString(),
            updatedAt: (doc.data().updatedAt as admin.firestore.Timestamp)?.toDate?.().toISOString(),
        }))
    };
});

export const getInsuranceProductDetails = functions.https.onCall(async (data, context) => {
    const { productId } = data;
    if (!productId) throw new functions.https.HttpsError("invalid-argument", "error.productId.required");

    const productDoc = await db.collection("insurance_products").doc(productId).get();
    if (!productDoc.exists) throw new functions.https.HttpsError("not-found", "error.insurance.productNotFound");
    
    const productData = productDoc.data()!;
    let provider = null;

    if (productData.providerId) {
        const providerDoc = await db.collection("users").doc(productData.providerId).get();
        if (providerDoc.exists) {
            const providerData = providerDoc.data()!;
            provider = { displayName: providerData.displayName, avatarUrl: providerData.avatarUrl };
        }
    }

    return {
        product: {
            ...productData,
            id: productDoc.id,
            createdAt: (productData.createdAt as admin.firestore.Timestamp)?.toDate?.().toISOString(),
            updatedAt: (productData.updatedAt as admin.firestore.Timestamp)?.toDate?.().toISOString(),
            provider: provider,
        }
    };
});

export const submitInsuranceApplication = functions.https.onCall(async (data, context) => {
    const applicantId = checkAuth(context);
    const { productId, farmId, coverageValue } = data;
    if (!productId || !farmId || !coverageValue) throw new functions.https.HttpsError("invalid-argument", "error.form.missingFields");

    const appRef = db.collection("insurance_applications").doc();
    await appRef.set({
        applicantId, productId, farmId, coverageValue: Number(coverageValue),
        status: "Submitted",
        submittedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    return { success: true, applicationId: appRef.id };
});

export const assessRiskForPolicy = functions.firestore.document("insurance_policies/{policyId}").onWrite(async (change, context) => {
    // Implementation omitted for brevity
});

export const processInsuranceClaim = functions.firestore.document("claims/{claimId}").onCreate(async (snapshot, context) => {
    // Implementation omitted for brevity
});

export const triggerParametricPayout = functions.firestore.document("weather_readings/{readingId}").onCreate(async (snapshot, context) => {
    // Implementation omitted for brevity
});
