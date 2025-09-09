

/**
 * @fileoverview This is the main entry point for all Firebase Cloud Functions.
 * It initializes the Firebase Admin SDK and exports all the functions from other
 * modules, making them available for deployment.
 */

import * as admin from "firebase-admin";

// The 'server.ts' file handles its own initialization.
// We import it to ensure Express routes are registered with Cloud Functions.
import expressApp from "./server";
import * as functions from "firebase-functions";

// We only need to initialize the admin SDK once for all other functions.
if (admin.apps.length === 0) {
  admin.initializeApp();
}

// Group functions by module for cleaner organization
import * as activityFunctions from "./activity";
import * as agriEventsFunctions from "./agri-events";
import * as agroTourismFunctions from "./agro-tourism";
import * as aiServicesFunctions from "./ai-services";
import * as apiKeyFunctions from "./api-keys";
import * as assetManagementFunctions from "./asset-management";
import * as communityFunctions from "./community";
import * as dashboardDataFunctions from "./dashboard_data";
import * as farmManagementFunctions from "./farm-management";
import * as financialServicesFunctions from "./financial-services";
import * as forumFunctions from "./forums";
import * as groupFunctions from "./groups";
import * as insuranceFunctions from "./insurance";
import * as inventoryFunctions from "./inventory";
import * as knowledgeHubFunctions from "./knowledge-hub";
import * as laborFunctions from "./labor";
import * as loggingFunctions from "./logging";
import * as marketplaceFunctions from "./marketplace";
import * as messageFunctions from "./messages";
import * as networkFunctions from "./network";
import * as notificationFunctions from "./notifications";
import * as offlineSyncFunctions from "./offline_sync";
import * as userFunctions from "./user";
import * as utilsFunctions from "./utils";
import * as regulatoryFunctions from "./regulatory-and-compliance";
import * as searchFunctions from "./search";
import * as sustainabilityFunctions from "./sustainability";
import * as geospatialFunctions from "./geospatial";
import * as universalIdFunctions from "./universal-id";

// Export all cloud functions, namespaced by their module name.
// e.g., exports.activity-logProfileView = functions.https.onCall(...)
const exportableFunctions: { [key: string]: any } = {};

Object.entries(activityFunctions).forEach(([key, value]) => { exportableFunctions[`activity-${key}`] = value; });
Object.entries(agriEventsFunctions).forEach(([key, value]) => { exportableFunctions[`agriEvents-${key}`] = value; });
Object.entries(agroTourismFunctions).forEach(([key, value]) => { exportableFunctions[`agroTourism-${key}`] = value; });
Object.entries(aiServicesFunctions).forEach(([key, value]) => { exportableFunctions[`aiServices-${key}`] = value; });
Object.entries(apiKeyFunctions).forEach(([key, value]) => { exportableFunctions[`apiKeys-${key}`] = value; });
Object.entries(assetManagementFunctions).forEach(([key, value]) => { exportableFunctions[`assetManagement-${key}`] = value; });
Object.entries(communityFunctions).forEach(([key, value]) => { exportableFunctions[`community-${key}`] = value; });
Object.entries(dashboardDataFunctions).forEach(([key, value]) => { exportableFunctions[`dashboardData-${key}`] = value; });
Object.entries(farmManagementFunctions).forEach(([key, value]) => { exportableFunctions[`farmManagement-${key}`] = value; });
Object.entries(financialServicesFunctions).forEach(([key, value]) => { exportableFunctions[`financials-${key}`] = value; });
Object.entries(forumFunctions).forEach(([key, value]) => { exportableFunctions[`forums-${key}`] = value; });
Object.entries(groupFunctions).forEach(([key, value]) => { exportableFunctions[`groups-${key}`] = value; });
Object.entries(insuranceFunctions).forEach(([key, value]) => { exportableFunctions[`insurance-${key}`] = value; });
Object.entries(inventoryFunctions).forEach(([key, value]) => { exportableFunctions[`inventory-${key}`] = value; });
Object.entries(knowledgeHubFunctions).forEach(([key, value]) => { exportableFunctions[`knowledgeHub-${key}`] = value; });
Object.entries(laborFunctions).forEach(([key, value]) => { exportableFunctions[`labor-${key}`] = value; });
Object.entries(loggingFunctions).forEach(([key, value]) => { exportableFunctions[`logging-${key}`] = value; });
Object.entries(marketplaceFunctions).forEach(([key, value]) => { exportableFunctions[`marketplace-${key}`] = value; });
Object.entries(messageFunctions).forEach(([key, value]) => { exportableFunctions[`messages-${key}`] = value; });
Object.entries(networkFunctions).forEach(([key, value]) => { exportableFunctions[`network-${key}`] = value; });
Object.entries(notificationFunctions).forEach(([key, value]) => { exportableFunctions[`notifications-${key}`] = value; });
Object.entries(offlineSyncFunctions).forEach(([key, value]) => { exportableFunctions[`offlineSync-${key}`] = value; });
Object.entries(userFunctions).forEach(([key, value]) => { exportableFunctions[`user-${key}`] = value; });
Object.entries(utilsFunctions).forEach(([key, value]) => { exportableFunctions[`utils-${key}`] = value; });
Object.entries(regulatoryFunctions).forEach(([key, value]) => { exportableFunctions[`regulatory-${key}`] = value; });
Object.entries(searchFunctions).forEach(([key, value]) => { exportableFunctions[`search-${key}`] = value; });
Object.entries(sustainabilityFunctions).forEach(([key, value]) => { exportableFunctions[`sustainability-${key}`] = value; });
Object.entries(geospatialFunctions).forEach(([key, value]) => { exportableFunctions[`geospatial-${key}`] = value; });
Object.entries(universalIdFunctions).forEach(([key, value]) => { exportableFunctions[`universalId-${key}`] = value; });

// Export all grouped functions
module.exports = {
  ...exportableFunctions,
  // Export the Express app as a Cloud Function for Cloud Run services
  api: functions.https.onRequest(expressApp)
};

    
