

/**
 * @fileoverview This is the main entry point for all Firebase Cloud Functions.
 * It initializes the Firebase Admin SDK and exports all the functions from other
 * modules, making them available for deployment.
 */

import * as admin from "firebase-admin";

// Initialize the Firebase Admin SDK only once
if (admin.apps.length === 0) {
  try {
    // Attempt to initialize with credentials from environment variables
    admin.initializeApp();
    console.log("Firebase Admin SDK initialized successfully.");
  } catch (error) {
    console.warn(
      'Firebase Admin SDK initialization failed. This is expected in a client-only environment. Server-side functions will not be available.'
    );
  }
}

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
export * from "./types";
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
export * from "./api_management";
