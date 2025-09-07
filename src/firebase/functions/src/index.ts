
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
import * as adminFunctions from "./admin";
import * as agriEventsFunctions from "./agri-events";
import * as agronomistFunctions from "./agronomist";
import * as agroTourismFunctions from "./agro-tourism";
import * as aiAndAnalyticsFunctions from "./ai-and-analytics";
import * as aiServicesFunctions from "./ai-services";
import * as apiKeyFunctions from "./api-keys";
import * as apiGatewayFunctions from "./api-gateway";
import * as assetManagementFunctions from "./asset-management";
import * as certificationFunctions from "./certification";
import * as communityFunctions from "./community";
import * as crowdfunderFunctions from "./crowdfunder";
import * as dashboardDataFunctions from "./dashboard_data";
import * as energyProviderFunctions from "./energy-provider";
import * as equipmentSupplierFunctions from "./equipment-supplier";
import * as farmManagementFunctions from "./farm-management";
import * as financialServicesFunctions from "./financial-services";
import * as forumFunctions from "./forums";
import * as geospatialFunctions from "./geospatial";
import * as groupFunctions from "./groups";
import * as inputSupplierFunctions from "./input-supplier";
import * as insuranceProviderFunctions from "./insurance-provider";
import * as insuranceFunctions from "./insurance";
import * as inventoryFunctions from "./inventory";
import * as knowledgeHubFunctions from "./knowledge-hub";
import * as laborFunctions from "./labor";
import * as loggingFunctions from "./logging";
import * as logisticsFunctions from "./logistics";
import * as marketplaceFunctions from "./marketplace";
import * as messageFunctions from "./messages";
import * as networkFunctions from "./network";
import * as notificationFunctions from "./notifications";
import * as offlineSyncFunctions from "./offline_sync";
import * as packagingFunctions from "./packaging";
import * as processingLogisticsFunctions from "./processing-logistics";
import * as profileFunctions from "./profiles";
import * as qaFunctions from "./qa";
import * as regulatoryFunctions from "./regulatory-and-compliance";
import * as researchFunctions from "./research";
import * as searchFunctions from "./search";
import * as sustainabilityFunctions from "./sustainability";
import * as universalIdFunctions from "./universal-id";
import * as utils from "./utils";
import * as wasteManagementFunctions from "./waste-management";

// Export all cloud functions, grouped by their respective modules
export const activity = activityFunctions;
export const admin = adminFunctions;
export const agriEvents = agriEventsFunctions;
export const agronomist = agronomistFunctions;
export const agroTourism = agroTourismFunctions;
export const aiAndAnalytics = aiAndAnalyticsFunctions;
export const aiServices = aiServicesFunctions;
export const apiKeys = apiKeyFunctions;
export const apiGateway = apiGatewayFunctions;
export const assetManagement = assetManagementFunctions;
export const certification = certificationFunctions;
export const community = communityFunctions;
export const crowdfunder = crowdfunderFunctions;
export const dashboardData = dashboardDataFunctions;
export const energyProvider = energyProviderFunctions;
export const equipmentSupplier = equipmentSupplierFunctions;
export const farmManagement = farmManagementFunctions;
export const financials = financialServicesFunctions;
export const forums = forumFunctions;
export const geospatial = geospatialFunctions;
export const groups = groupFunctions;
export const inputSupplier = inputSupplierFunctions;
export const insuranceProvider = insuranceProviderFunctions;
export const insurance = insuranceFunctions;
export const inventory = inventoryFunctions;
export const knowledgeHub = knowledgeHubFunctions;
export const labor = laborFunctions;
export const logging = loggingFunctions;
export const logistics = logisticsFunctions;
export const marketplace = marketplaceFunctions;
export const messages = messageFunctions;
export const network = networkFunctions;
export const notifications = notificationFunctions;
export const offlineSync = offlineSyncFunctions;
export const packaging = packagingFunctions;
export const processingLogistics = processingLogisticsFunctions;
export const profiles = profileFunctions;
export const qa = qaFunctions;
export const regulatory = regulatoryFunctions;
export const research = researchFunctions;
export const search = searchFunctions;
export const sustainability = sustainabilityFunctions;
export const universalId = universalIdFunctions;
export const utilityFunctions = utils;
export const wasteManagement = wasteManagementFunctions;


// Export the Express app as a Cloud Function for Cloud Run services
export const api = functions.https.onRequest(expressApp);
