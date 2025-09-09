"use strict";
/**
 * @fileoverview This is the main entry point for all Firebase Cloud Functions.
 * It initializes the Firebase Admin SDK and exports all the functions from other
 * modules, making them available for deployment.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = exports.geospatial = exports.sustainability = exports.search = exports.regulatory = exports.utils = exports.user = exports.offlineSync = exports.notifications = exports.network = exports.messages = exports.marketplace = exports.logging = exports.labor = exports.knowledgeHub = exports.inventory = exports.insurance = exports.groups = exports.forums = exports.financials = exports.farmManagement = exports.dashboardData = exports.community = exports.assetManagement = exports.apiGateway = exports.apiKeys = exports.aiServices = exports.aiAndAnalytics = exports.agroTourism = exports.agriEvents = exports.activity = void 0;
const admin = __importStar(require("firebase-admin"));
// The 'server.ts' file handles its own initialization.
// We import it to ensure Express routes are registered with Cloud Functions.
const server_1 = __importDefault(require("./server"));
const functions = __importStar(require("firebase-functions"));
// We only need to initialize the admin SDK once for all other functions.
if (admin.apps.length === 0) {
    admin.initializeApp();
}
// Group functions by module for cleaner organization
const activityFunctions = __importStar(require("./activity"));
const agriEventsFunctions = __importStar(require("./agri-events"));
const agroTourismFunctions = __importStar(require("./agro-tourism"));
const aiAndAnalyticsFunctions = __importStar(require("./ai-and-analytics"));
const aiServicesFunctions = __importStar(require("./ai-services"));
const apiKeyFunctions = __importStar(require("./api-keys"));
const apiGatewayFunctions = __importStar(require("./api-gateway"));
const assetManagementFunctions = __importStar(require("./asset-management"));
const communityFunctions = __importStar(require("./community"));
const dashboardDataFunctions = __importStar(require("./dashboard_data"));
const farmManagementFunctions = __importStar(require("./farm-management"));
const financialServicesFunctions = __importStar(require("./financial-services"));
const forumFunctions = __importStar(require("./forums"));
const groupFunctions = __importStar(require("./groups"));
const insuranceFunctions = __importStar(require("./insurance"));
const inventoryFunctions = __importStar(require("./inventory"));
const knowledgeHubFunctions = __importStar(require("./knowledge-hub"));
const laborFunctions = __importStar(require("./labor"));
const loggingFunctions = __importStar(require("./logging"));
const marketplaceFunctions = __importStar(require("./marketplace"));
const messageFunctions = __importStar(require("./messages"));
const networkFunctions = __importStar(require("./network"));
const notificationFunctions = __importStar(require("./notifications"));
const offlineSyncFunctions = __importStar(require("./offline_sync"));
const regulatoryFunctions = __importStar(require("./regulatory-and-compliance"));
const searchFunctions = __importStar(require("./search"));
const sustainabilityFunctions = __importStar(require("./sustainability"));
const userFunctions = __importStar(require("./user"));
const utilsFunctions = __importStar(require("./utils"));
const geospatialFunctions = __importStar(require("./geospatial"));
// Export all cloud functions, grouped by their respective modules
exports.activity = activityFunctions;
exports.agriEvents = agriEventsFunctions;
exports.agroTourism = agroTourismFunctions;
exports.aiAndAnalytics = aiAndAnalyticsFunctions;
exports.aiServices = aiServicesFunctions;
exports.apiKeys = apiKeyFunctions;
exports.apiGateway = apiGatewayFunctions;
exports.assetManagement = assetManagementFunctions;
exports.community = communityFunctions;
exports.dashboardData = dashboardDataFunctions; // Changed from 'dashboard'
exports.farmManagement = farmManagementFunctions;
exports.financials = financialServicesFunctions;
exports.forums = forumFunctions;
exports.groups = groupFunctions;
exports.insurance = insuranceFunctions;
exports.inventory = inventoryFunctions;
exports.knowledgeHub = knowledgeHubFunctions;
exports.labor = laborFunctions;
exports.logging = loggingFunctions;
exports.marketplace = marketplaceFunctions;
exports.messages = messageFunctions;
exports.network = networkFunctions;
exports.notifications = notificationFunctions;
exports.offlineSync = offlineSyncFunctions;
exports.user = userFunctions;
exports.utils = utilsFunctions;
exports.regulatory = regulatoryFunctions;
exports.search = searchFunctions;
exports.sustainability = sustainabilityFunctions;
exports.geospatial = geospatialFunctions;
// Export the Express app as a Cloud Function for Cloud Run services
exports.api = functions.https.onRequest(server_1.default);
//# sourceMappingURL=index.js.map