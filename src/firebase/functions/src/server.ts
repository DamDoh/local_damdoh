

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import * as admin from 'firebase-admin';
import { _internalAssessCreditRisk, _internalMatchFundingOpportunities } from "./financial-services";
import { logInfo, logError } from './logging';

// Initialize Firebase Admin if it hasn't been already.
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
        logError('Error while verifying Firebase ID token', { error: err });
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
    const result = await _internalAssessCreditRisk(req.body);
    res.status(200).json(result);
  } catch (error: any) {
    logError('Error assessing credit risk in Express endpoint', { error });
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
        logError("Error matching funding opportunities in Express endpoint", { error });
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});


// Only start the server if not in a test environment or when running directly
if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        logInfo(`DamDoh AI Service listening on port ${port}`);
    });
}


export default app;
