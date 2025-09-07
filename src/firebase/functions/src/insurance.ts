

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { getProfileByIdFromDB } from './user';
import type { InsuranceApplication, InsuranceProduct } from "@/lib/types";

const db = admin.firestore();

const checkAuth = (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
  }
  return context.auth.uid;
};

// =================================================================
// Module 11: Insurance Service
// =================================================================


export const createInsuranceProduct = functions.https.onCall(async (data, context) => {
    const providerId = checkAuth(context);
    const { name, type, description, coverageDetails, premium, currency } = data;

    if (!name || !type || !description || !coverageDetails || premium === undefined) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required product fields.');
    }

    const newProductRef = db.collection('insurance_products').doc();
    await newProductRef.set({
        providerId,
        name,
        type,
        description,
        coverageDetails,
        premium,
        currency: currency || 'USD',
        status: 'Active',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true, productId: newProductRef.id };
});

export const getInsuranceProducts = functions.https.onCall(async (data, context) => {
    checkAuth(context);
    const snapshot = await db.collection('insurance_products').where('status', '==', 'Active').get();
    const products = snapshot.docs.map(doc => {
        const productData = doc.data();
        return {
            id: doc.id,
            ...productData,
        }
    });
    return { products };
});


export const getInsuranceProductDetails = functions.https.onCall(async (data, context) => {
    const { productId } = data;
    if (!productId) throw new functions.https.HttpsError('invalid-argument', 'Product ID is required.');
    
    const productDoc = await db.collection('insurance_products').doc(productId).get();
    if (!productDoc.exists) throw new functions.https.HttpsError('not-found', 'Product not found.');
    
    const productData = productDoc.data()!;
    let provider = null;
    
    if (productData.providerId) {
        const providerProfile = (await getProfileByIdFromDB({ uid: productData.providerId })).data;
        if (providerProfile) {
            provider = {
                displayName: providerProfile.displayName,
                avatarUrl: providerProfile.avatarUrl
            };
        }
    }
    
    return {
        product: {
            ...productData,
            id: productDoc.id,
            provider
        }
    };
});


export const submitInsuranceApplication = functions.https.onCall(async (data, context) => {
    const applicantId = checkAuth(context);
    const { productId, farmId, coverageValue } = data;

    if (!productId || !farmId || !coverageValue) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required application fields.');
    }
    
    const productDoc = await db.collection("insurance_products").doc(productId).get();
    if (!productDoc.exists) {
        throw new functions.https.HttpsError("not-found", "The selected insurance product does not exist.");
    }
    const productData = productDoc.data()!;

    const newApplicationRef = db.collection('insurance_applications').doc();
    await newApplicationRef.set({
        applicantId,
        productId,
        productName: productData.name,
        providerId: productData.providerId,
        farmId,
        coverageValue,
        status: 'Submitted',
        submittedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, applicationId: newApplicationRef.id };
});

