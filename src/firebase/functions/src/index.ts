
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
import * as aiAndAnalyticsFunctions from "./ai-and-analytics";
import * as aiServicesFunctions from "./ai-services";
import * as apiKeyFunctions from "./api-keys";
import * as apiGatewayFunctions from "./api-gateway";
import * as communityFunctions from "./community";
import * as dashboardDataFunctions from "./dashboard_data";
import * as farmManagementFunctions from "./farm-management";
import * as financialServicesFunctions from "./financial-services";
import * as forumFunctions from "./forums";
import * as groupFunctions from "./groups";
import * as insuranceFunctions from "./insurance";
import * as knowledgeHubFunctions from "./knowledge-hub";
import * as laborFunctions from "./labor";
import * as loggingFunctions from "./logging";
import * as marketplaceFunctions from "./marketplace";
import * as messageFunctions from "./messages";
import * as networkFunctions from "./network";
import * as notificationFunctions from "./notifications";
import * as offlineSyncFunctions from "./offline_sync";
import * as profileFunctions from "./profiles";
import * as regulatoryFunctions from "./regulatory-and-compliance";
import * as searchFunctions from "./search";
import * as sustainabilityFunctions from "./sustainability";
import * as universalIdFunctions from "./universal-id";
import * as geospatialFunctions from "./geospatial";

// Export all cloud functions, grouped by their respective modules
exports.activity = activityFunctions;
exports.agriEvents = agriEventsFunctions;
exports.agroTourism = agroTourismFunctions;
exports.aiAndAnalytics = aiAndAnalyticsFunctions;
exports.aiServices = aiServicesFunctions;
exports.apiKeys = apiKeyFunctions;
exports.apiGateway = apiGatewayFunctions;
exports.community = communityFunctions;
exports.dashboardData = dashboardDataFunctions; // Changed from 'dashboard'
exports.farmManagement = farmManagementFunctions;
exports.financials = financialServicesFunctions;
exports.forums = forumFunctions;
exports.groups = groupFunctions;
exports.insurance = insuranceFunctions;
exports.knowledgeHub = knowledgeHubFunctions;
exports.labor = laborFunctions;
exports.logging = loggingFunctions;
exports.marketplace = marketplaceFunctions;
exports.messages = messageFunctions;
exports.network = networkFunctions;
exports.notifications = notificationFunctions;
exports.offlineSync = offlineSyncFunctions;
exports.profiles = profileFunctions;
exports.regulatory = regulatoryFunctions;
exports.search = searchFunctions;
exports.sustainability = sustainabilityFunctions;
exports.universalId = universalIdFunctions;
exports.geospatial = geospatialFunctions;


// Export the Express app as a Cloud Function for Cloud Run services
exports.api = functions.https.onRequest(expressApp);
