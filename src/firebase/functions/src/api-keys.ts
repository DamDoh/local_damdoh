
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { randomBytes } from 'crypto';

const db = admin.firestore();

const checkAgriTechAuth = async (context: functions.https.CallableContext) => {
    const uid = context.auth?.uid;
    if (!uid) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    const userDoc = await db.collection("users").doc(uid).get();
    const userRole = userDoc.data()?.primaryRole;
    if (userRole !== 'Agri-Tech Innovator/Developer') {
         throw new functions.https.HttpsError("permission-denied", "You are not authorized to perform this action.");
    }
    return uid;
};

export const generateApiKey = functions.https.onCall(async (data, context) => {
    const innovatorId = await checkAgriTechAuth(context);
    const { description, environment } = data;

    if (!description || typeof description !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'A description for the API key is required.');
    }
     if (!['Sandbox', 'Production'].includes(environment)) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid environment specified.');
    }

    const keyPrefix = `sk_${environment.substring(0,4).toLowerCase()}`;
    const apiKey = `${keyPrefix}_${randomBytes(24).toString('hex')}`;
    const keyRef = db.collection('users').doc(innovatorId).collection('api_keys').doc();

    await keyRef.set({
        description,
        environment,
        status: 'Active',
        // For security, only store a prefix of the key, not the whole thing.
        // The full key is only ever shown to the user once upon creation.
        keyPrefix: apiKey.substring(0, 12), 
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { 
        success: true, 
        message: 'API Key generated successfully. Please copy it now, you will not be able to see it again.',
        key: apiKey, // Return the full key to the user this one time.
        id: keyRef.id,
        description,
        environment,
        status: 'Active',
        keyPrefix: apiKey.substring(0, 12),
        createdAt: new Date().toISOString(),
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
            keyPrefix: keyData.keyPrefix, // Show only the prefix
            createdAt: keyData.createdAt.toDate().toISOString(),
            key: `${keyData.keyPrefix}...` // Placeholder for display
        }
    });

    return { keys };
});


export const revokeApiKey = functions.https.onCall(async (data, context) => {
    const innovatorId = await checkAgriTechAuth(context);
    const { keyId } = data;

    if (!keyId) {
        throw new functions.https.HttpsError('invalid-argument', 'An API Key ID is required.');
    }
    
    const keyRef = db.collection('users').doc(innovatorId).collection('api_keys').doc(keyId);
    
    const keyDoc = await keyRef.get();
    if (!keyDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'API Key not found.');
    }

    await keyRef.update({
        status: 'Revoked',
    });

    return { success: true, message: 'API Key has been revoked.' };
});

