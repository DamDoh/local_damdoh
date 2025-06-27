
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
export * from './module1';
export * from './module3';
export * from './module4';
export * from './module5';
export * from './module6';
export * from './module7';
export * from './module8';
export * from './module9';
export * from './module10';
export * from './module11';
export * from './module12';
export * from './notifications';
export * from './offline_sync';
export * from './search';
export * from './profiles';
export * from './types';

