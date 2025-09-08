

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { randomBytes } from 'crypto';
import type { ApiKey } from "@/lib/types";

const db = admin.firestore();

const checkAgriTechAuth = async (context: functions.https.CallableContext) => {
    const uid = context.auth?.uid;
    if (!uid) {
        throw new functions.https.HttpsError("unauthenticated", "error.unauthenticated");
    }
    const userDoc = await db.collection("users").doc(uid).get();
    const userRole = userDoc.data()?.primaryRole;
    if (userRole !== 'Agri-Tech Innovator/Developer') {
         throw new functions.https.HttpsError("permission-denied", "error.permissionDenied");
    }
    return uid;
};

export const generateApiKey = functions.https.onCall(async (data, context) => {
    const innovatorId = await checkAgriTechAuth(context);
    const { description, environment } = data;

    if (!description || typeof description !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'error.apiKey.descriptionRequired');
    }
     if (!['Sandbox', 'Production'].includes(environment)) {
        throw new functions.https.HttpsError('invalid-argument', 'error.apiKey.invalidEnvironment');
    }

    const keyPrefix = `damdoh_${environment.substring(0,4).toLowerCase()}`;
    const secret = randomBytes(24).toString('hex');
    const fullKey = `${keyPrefix}_${secret}`;
    const keyRef = db.collection('users').doc(innovatorId).collection('api_keys').doc();

    // In a real high-security scenario, you'd store a hash of the key (e.g., using bcrypt)
    // instead of the lastFour, but this is a good starting point.
    const newKeyDataToStore: Omit<ApiKey, 'id'|'key'|'createdAt'> = {
        description,
        environment,
        status: 'Active',
        keyPrefix: `${keyPrefix}_...`,
        lastFour: secret.slice(-4),
    };

    await keyRef.set({
        ...newKeyDataToStore,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { 
        success: true, 
        message: 'API Key generated successfully. Please copy it now, you will not be able to see it again.',
        key: fullKey,
        id: keyRef.id,
        ...newKeyDataToStore,
        createdAt: new Date().toISOString(), // Return ISO string for client
    };
});

export const getApiKeys = functions.https.onCall(async (data, context) => {
    const innovatorId = await checkAgriTechAuth(context);

    const keysSnapshot = await db.collection('users').doc(innovatorId).collection('api_keys')
        .orderBy('createdAt', 'desc')
        .get();

    const keys = keysSnapshot.docs.map(doc => {
        const keyData = doc.data();
        return {
            id: doc.id,
            description: keyData.description,
            environment: keyData.environment,
            status: keyData.status,
            keyPrefix: keyData.keyPrefix, 
            createdAt: (keyData.createdAt as admin.firestore.Timestamp).toDate().toISOString(),
            key: `${keyData.keyPrefix}...${keyData.lastFour}` 
        }
    });

    return { keys };
});


export const revokeApiKey = functions.https.onCall(async (data, context) => {
    const innovatorId = await checkAgriTechAuth(context);
    const { keyId } = data;

    if (!keyId) {
        throw new functions.https.HttpsError('invalid-argument', 'error.apiKey.idRequired');
    }
    
    const keyRef = db.collection('users').doc(innovatorId).collection('api_keys').doc(keyId);
    
    const keyDoc = await keyRef.get();
    if (!keyDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'error.apiKey.notFound');
    }

    await keyRef.update({
        status: 'Revoked',
    });

    return { success: true, message: 'API Key has been revoked.' };
});
