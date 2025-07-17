
/**
 * @fileoverview This is the main entry point for all Firebase Cloud Functions.
 * It initializes the Firebase Admin SDK and exports all the functions from other
 * modules, making them available for deployment.
 */

import * as admin from "firebase-admin";
import { configureGenkit } from "../../src/ai/genkit";

// The 'server.ts' file handles its own initialization.
// We import it to ensure Express routes are registered with Cloud Functions.
import expressApp from "./server";
import * as functions from "firebase-functions";

// We only need to initialize the admin SDK once for all other functions.
if (admin.apps.length === 0) {
  admin.initializeApp();
}

// Initialize the Genkit AI framework
configureGenkit();

// Export all other cloud functions
export * from "./traceability";
export * from "./profiles";
export * from "./farm-management";
export * from "./marketplace";
export * from "./community";
export * from "./ai-and-analytics";
export * from "./financial-services";
export * from "./knowledge-hub";
export * from "./api-gateway";
export * from "./regulatory-and-compliance";
export * from "./insurance";
export * from "./sustainability";
export * from "./notifications";
export * from "./dashboard_data";
export * from "./search";
export * from "./offline_sync";
export * from "./forums";
export * from "./groups";
export * from "./messages";
export * from "./agri-events";
export * from "./universal-id";
export * from "./agro-tourism";
export * from "./network";
export * from "./labor";
export * from "./ai-services";
export * from "./api-keys";
export * from "./geospatial";
export * from "./activity";


// Export the Express app as a Cloud Function
export const api = functions.https.onRequest(expressApp);
