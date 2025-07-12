
// A standalone script to populate the 'financial_applications' collection in Firestore.
// To run this:
// 1. Make sure your .env.local file has the correct Firebase project credentials.
// 2. You will need to install ts-node: `npm install -g ts-node`
// 3. From your project root, run: `ts-node ./scripts/populate-financial-apps.ts`

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const APPLICATIONS_DATA = [
    {
      id: 'app1',
      applicantId: 'farmerJoe', // Match ID from dummy-data
      applicantName: 'Joe\'s Family Farm',
      fiId: 'agriBankKenya', // ID of the financial institution
      type: 'Loan',
      amount: 5000,
      currency: 'USD',
      status: 'Pending',
      riskScore: 720,
      purpose: 'Purchase of certified organic seeds and a new irrigation pump for the upcoming season.',
      submittedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: 'app2',
      applicantId: 'quinoaCoopPeru', // Match ID from dummy-data
      applicantName: 'Quinoa Co-op Peru',
      fiId: 'agriBankKenya',
      type: 'Grant',
      amount: 15000,
      currency: 'USD',
      status: 'Under Review',
      riskScore: 810,
      purpose: 'Funding for a community-owned processing unit to add value to quinoa production before export.',
      submittedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'app3',
      applicantId: 'sunnyAcresFarm',
      applicantName: 'Sunny Acres Farm',
      fiId: 'agriBankKenya',
      type: 'Loan',
      amount: 2500,
      currency: 'USD',
      status: 'Pending',
      riskScore: 680,
      purpose: 'Financing for greenhouse repairs and purchase of new soil amendments.',
      submittedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    }
];

// Initialize Firebase Admin SDK
if (!getApps().length) {
    try {
        const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
        if (!serviceAccountEnv) {
            throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.");
        }
        const serviceAccount = JSON.parse(serviceAccountEnv);
        initializeApp({
            credential: cert(serviceAccount),
            databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`
        });
        console.log("Firebase Admin SDK initialized successfully.");
    } catch (error: any) {
        console.error("Firebase Admin SDK initialization failed:", error.message);
        process.exit(1);
    }
}

const db = getFirestore();

async function populateFinancialApps() {
    console.log("Starting to populate 'financial_applications' collection...");

    const collectionRef = db.collection('financial_applications');
    const writeBatch = db.batch();

    APPLICATIONS_DATA.forEach(app => {
        const docRef = collectionRef.doc(app.id);
        const { id, ...appData } = app;
        const firestoreData = {
            ...appData,
            submittedAt: new Date(appData.submittedAt) // Convert ISO string back to Date object for Firestore Timestamp
        };
        writeBatch.set(docRef, firestoreData);
    });

    try {
        await writeBatch.commit();
        console.log(`Successfully populated ${APPLICATIONS_DATA.length} documents into the 'financial_applications' collection.`);
    } catch (error) {
        console.error("Error writing batch to Firestore:", error);
    }
}

populateFinancialApps().then(() => {
    console.log("Script finished.");
    process.exit(0);
}).catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
});
