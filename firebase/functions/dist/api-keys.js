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
exports.revokeApiKey = exports.getApiKeys = exports.generateApiKey = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const crypto_1 = require("crypto");
const db = admin.firestore();
const checkAgriTechAuth = async (context) => {
    var _a, _b;
    const uid = (_a = context.auth) === null || _a === void 0 ? void 0 : _a.uid;
    if (!uid) {
        throw new functions.https.HttpsError("unauthenticated", "error.unauthenticated");
    }
    const userDoc = await db.collection("users").doc(uid).get();
    const userRole = (_b = userDoc.data()) === null || _b === void 0 ? void 0 : _b.primaryRole;
    if (userRole !== 'Agri-Tech Innovator/Developer') {
        throw new functions.https.HttpsError("permission-denied", "error.permissionDenied");
    }
    return uid;
};
exports.generateApiKey = functions.https.onCall(async (data, context) => {
    const innovatorId = await checkAgriTechAuth(context);
    const { description, environment } = data;
    if (!description || typeof description !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'error.apiKey.descriptionRequired');
    }
    if (!['Sandbox', 'Production'].includes(environment)) {
        throw new functions.https.HttpsError('invalid-argument', 'error.apiKey.invalidEnvironment');
    }
    const keyPrefix = `damdoh_${environment.substring(0, 4).toLowerCase()}`;
    const secret = (0, crypto_1.randomBytes)(24).toString('hex');
    const fullKey = `${keyPrefix}_${secret}`;
    const keyRef = db.collection('users').doc(innovatorId).collection('api_keys').doc();
    // In a real high-security scenario, you'd store a hash of the key (e.g., using bcrypt)
    // instead of the lastFour, but this is a good starting point.
    const newKeyDataToStore = {
        description,
        environment,
        status: 'Active',
        keyPrefix: `${keyPrefix}_...`,
        lastFour: secret.slice(-4),
    };
    await keyRef.set(Object.assign(Object.assign({}, newKeyDataToStore), { createdAt: admin.firestore.FieldValue.serverTimestamp() }));
    return Object.assign(Object.assign({ success: true, message: 'API Key generated successfully. Please copy it now, you will not be able to see it again.', key: fullKey, id: keyRef.id }, newKeyDataToStore), { createdAt: new Date().toISOString() });
});
exports.getApiKeys = functions.https.onCall(async (data, context) => {
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
            createdAt: keyData.createdAt.toDate().toISOString(),
            key: `${keyData.keyPrefix}...${keyData.lastFour}`
        };
    });
    return { keys };
});
exports.revokeApiKey = functions.https.onCall(async (data, context) => {
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
//# sourceMappingURL=api-keys.js.map