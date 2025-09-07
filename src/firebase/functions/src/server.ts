

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import * as admin from 'firebase-admin';
import { _internalAssessCreditRisk, _internalMatchFundingOpportunities } from "./financial-services"; 

// Initialize Firebase Admin if it hasn't been already.
// This is important because this file might be the entry point in a Cloud Run environment,
// or it might be imported by `index.ts` where initialization also happens.
if (admin.apps.length === 0) {
    admin.initializeApp();
}

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());

// Authentication Middleware
const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).send({ error: 'Unauthorized', message: 'Bearer token not found.' });
    }

    const split = authorization.split('Bearer ');
    const token = split[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        res.locals = { ...res.locals, uid: decodedToken.uid, token: decodedToken };
        return next();
    } catch (err) {
        console.error('Error while verifying Firebase ID token:', err);
        return res.status(401).send({ error: 'Unauthorized', message: 'Could not verify token.' });
    }
};

// Simple test route to confirm the service is running
app.get('/', (req: Request, res: Response) => {
  res.status(200).send({ status: 'OK', message: 'DamDoh AI Service is running.' });
});

/**
 * Express endpoint for assessing credit risk.
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 */
app.post('/ai/assess-risk', authenticate, async (req: Request, res: Response) => {
  try {
    // We can add more specific validation here using a library like Zod if needed.
    const result = await _internalAssessCreditRisk(req.body);
    res.status(200).json(result);
  } catch (error: any) {
    console.error('Error assessing credit risk:', error);
    // Check if it's a known error type from our internal function
    if (error.code === 'invalid-argument') {
      res.status(400).json({ success: false, error: 'Invalid argument provided.' });
    } else {
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  }
});

/**
 * Express endpoint for matching funding opportunities.
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 */
app.post('/ai/match-funding', authenticate, async (req: Request, res: Response) => {
    try {
        const result = await _internalMatchFundingOpportunities(req.body);
        res.status(200).json(result);
    } catch (error: any) {
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


export default app;
