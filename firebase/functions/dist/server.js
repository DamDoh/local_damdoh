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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const admin = __importStar(require("firebase-admin"));
const financial_services_1 = require("./financial-services");
// Initialize Firebase Admin if it hasn't been already.
// This is important because this file might be the entry point in a Cloud Run environment,
// or it might be imported by `index.ts` where initialization also happens.
if (admin.apps.length === 0) {
    admin.initializeApp();
}
const app = (0, express_1.default)();
const port = process.env.PORT || 8080;
// Middleware
app.use((0, cors_1.default)({ origin: true }));
app.use(express_1.default.json());
// Authentication Middleware
const authenticate = async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).send({ error: 'Unauthorized', message: 'Bearer token not found.' });
    }
    const split = authorization.split('Bearer ');
    const token = split[1];
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        res.locals = Object.assign(Object.assign({}, res.locals), { uid: decodedToken.uid, token: decodedToken });
        return next();
    }
    catch (err) {
        console.error('Error while verifying Firebase ID token:', err);
        return res.status(401).send({ error: 'Unauthorized', message: 'Could not verify token.' });
    }
};
// Simple test route to confirm the service is running
app.get('/', (req, res) => {
    res.status(200).send({ status: 'OK', message: 'DamDoh AI Service is running.' });
});
/**
 * Express endpoint for assessing credit risk.
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 */
app.post('/ai/assess-risk', authenticate, async (req, res) => {
    try {
        // We can add more specific validation here using a library like Zod if needed.
        const result = await (0, financial_services_1._internalAssessCreditRisk)(req.body);
        res.status(200).json(result);
    }
    catch (error) {
        console.error('Error assessing credit risk:', error);
        // Check if it's a known error type from our internal function
        if (error.code === 'invalid-argument') {
            res.status(400).json({ success: false, error: 'Invalid argument provided.' });
        }
        else {
            res.status(500).json({ success: false, error: 'Internal Server Error' });
        }
    }
});
/**
 * Express endpoint for matching funding opportunities.
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 */
app.post('/ai/match-funding', authenticate, async (req, res) => {
    try {
        const result = await (0, financial_services_1._internalMatchFundingOpportunities)(req.body);
        res.status(200).json(result);
    }
    catch (error) {
        console.error("Error matching funding opportunities:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});
// Only start the server if not in a test environment or when running directly
if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        console.log(`DamDoh AI Service listening on port ${port}`);
    });
}
exports.default = app;
//# sourceMappingURL=server.js.map