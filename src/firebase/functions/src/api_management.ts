
'use server';

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { randomBytes } from 'crypto';

const db = admin.firestore();

const checkAuth = (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
  }
  return context.auth.uid;
};

const checkDeveloperRole = async (uid: string) => {
    const userDoc = await db.collection("users").doc(uid).get();
    const role = userDoc.data()?.primaryRole;
    if (role !== 'Agri-Tech Innovator/Developer') {
         throw new functions.https.HttpsError("permission-denied", "You must be an Agri-Tech Innovator to manage API keys.");
    }
}

export const getApiKeys = functions.https.onCall(async (data, context) => {
    const uid = checkAuth(context);
    await checkDeveloperRole(uid);

    const snapshot = await db.collection('api_keys').where('userId', '==', uid).get();
    
    const keys = snapshot.docs.map(doc => {
        const keyData = doc.data();
        return {
            id: doc.id,
            ...keyData,
            createdAt: (keyData.createdAt as admin.firestore.Timestamp)?.toDate?.().toISOString() || null,
        }
    });
    
    return { keys };
});

export const generateApiKey = functions.https.onCall(async (data, context) => {
    const uid = checkAuth(context);
    await checkDeveloperRole(uid);

    const { environment, description } = data;
    if (!environment || !['Sandbox', 'Production'].includes(environment)) {
        throw new functions.https.HttpsError("invalid-argument", "A valid environment ('Sandbox' or 'Production') is required.");
    }

    const keyPrefix = environment === 'Production' ? 'prod_sk_' : 'test_sk_';
    const secret = randomBytes(24).toString('hex');
    const fullKey = `${keyPrefix}${secret}`;

    const newKeyRef = db.collection('api_keys').doc();
    await newKeyRef.set({
        userId: uid,
        key: fullKey,
        description: description || `${environment} Key`,
        environment: environment,
        status: 'Active',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { id: newKeyRef.id, key: fullKey, message: 'API Key generated successfully.' };
});


export const revokeApiKey = functions.https.onCall(async (data, context) => {
    const uid = checkAuth(context);
    await checkDeveloperRole(uid);
    
    const { keyId } = data;
    if (!keyId) {
         throw new functions.https.HttpsError("invalid-argument", "An API Key ID is required.");
    }
    
    const keyRef = db.collection('api_keys').doc(keyId);
    const keyDoc = await keyRef.get();

    if (!keyDoc.exists || keyDoc.data()?.userId !== uid) {
        throw new functions.https.HttpsError("permission-denied", "You are not authorized to revoke this key.");
    }
    
    await keyRef.update({
        status: 'Revoked',
        // Optional: you might want to keep the key but make it unusable, or delete it entirely
        // For auditing, keeping it with a 'Revoked' status is better.
    });

    return { success: true, message: 'API Key has been revoked.' };
});

