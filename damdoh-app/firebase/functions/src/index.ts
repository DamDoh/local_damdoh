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

export * from './dashboard_data';
export * from './traceability';
export * from './farm-management';
export * from './marketplace';
export * from './knowledge-hub';
export * from './community';
export * from './financials';
export * from './ai-services';
export * from './integrations';
export * from './compliance';
export * from './insurance';
export * from './sustainability';
export * from './notifications';
export * from './offline_sync';
export * from './search';
export * from './profiles';
export * from './types';
