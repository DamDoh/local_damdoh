/**
 * @fileoverview This is the main entry point for all Firebase Cloud Functions.
 * It initializes the Firebase Admin SDK and exports all the functions from other
 * modules, making them available for deployment.
 */

import * as admin from "firebase-admin";

admin.initializeApp();

export * from "./dashboard_data";
export * from "./module1";
export * from "./module3";
export * from "./module4";
export * from "./module5";
export * from "./module6";
export * from "./module7";
export * from "./module8";
export * from "./module9";
export * from "./module10";
export * from "./module11";
export * from "./module12";
export * from "./notifications";
export * from "./offline_sync";
export * from "./search";
export * from "./types";
export * from "./profiles";
