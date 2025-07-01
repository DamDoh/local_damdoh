/**
 * @fileoverview This is the main entry point for all Firebase Cloud Functions.
 * It initializes the Firebase Admin SDK and exports all the functions from other
 * modules, making them available for deployment.
 */

import * as admin from "firebase-admin";

// Initialize the Firebase Admin SDK.
// This must be done only once, at the entry point of your functions.
admin.initializeApp();

// Now, re-export all the functions from your other modules.
// The Firebase CLI will discover and deploy these exported functions.

export * from "./ai-and-analytics";
export * from "./api-gateway";
export * from "./community";
export * from "./compliance";
export * from "./dashboard_data";
export * from "./events";
export * from "./farm-management";
export * from "./financials";
export * from "./groups";
export * from "./insurance";
export * from "./knowledge-hub";
export * from "./marketplace";
export * from "./messaging";
export * from "./notifications";
export * from "./offline_sync";
export * from "./profiles";
export * from "./search";
export * from "./sustainability";
export * from "./traceability";
export * from "./types";
