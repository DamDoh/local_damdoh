

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

// Import all modules
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

// Export all functions with a clear, namespaced naming convention.
// This makes it easier to manage and deploy individual functions.

// ACITIVTY
export const activity_logProfileView = activityFunctions.logProfileView;
export const activity_onNewProfileView = activityFunctions.onNewProfileView;
export const activity_getUserActivity = activityFunctions.getUserActivity;
export const activity_getUserEngagementStats = activityFunctions.getUserEngagementStats;

// AGRI-EVENTS
export const agriEvents_createAgriEvent = agriEventsFunctions.createAgriEvent;
export const agriEvents_getAgriEvents = agriEventsFunctions.getAgriEvents;
export const agriEvents_getEventDetails = agriEventsFunctions.getEventDetails;
export const agriEvents_registerForEvent = agriEventsFunctions.registerForEvent;
export const agriEvents_checkInAttendee = agriEventsFunctions.checkInAttendee;
export const agriEvents_getEventAttendees = agriEventsFunctions.getEventAttendees;
export const agriEvents_createEventCoupon = agriEventsFunctions.createEventCoupon;
export const agriEvents_getEventCoupons = agriEventsFunctions.getEventCoupons;
export const agriEvents_addEventStaff = agriEventsFunctions.addEventStaff;
export const agriEvents_getEventStaff = agriEventsFunctions.getEventStaff;
export const agriEvents_removeEventStaff = agriEventsFunctions.removeEventStaff;
export const agriEvents_searchUsersForStaffing = agriEventsFunctions.searchUsersForStaffing;

// AGRO-TOURISM
export const agroTourism_bookAgroTourismService = agroTourismFunctions.bookAgroTourismService;
export const agroTourism_checkInAgroTourismBooking = agroTourismFunctions.checkInAgroTourismBooking;
export const agroTourism_addAgroTourismStaff = agroTourismFunctions.addAgroTourismStaff;
export const agroTourism_getAgroTourismStaff = agroTourismFunctions.getAgroTourismStaff;
export const agroTourism_removeAgroTourismStaff = agroTourismFunctions.removeAgroTourismStaff;
export const agroTourism_getAgroTourismBookings = agroTourismFunctions.getAgroTourismBookings;


// AI SERVICES
export const aiServices_onProfileUpdateEnrich = aiServicesFunctions.onProfileUpdateEnrich;

// API KEYS
export const apiKeys_generateApiKey = apiKeyFunctions.generateApiKey;
export const apiKeys_getApiKeys = apiKeyFunctions.getApiKeys;
export const apiKeys_revokeApiKey = apiKeyFunctions.revokeApiKey;

// ASSET MANAGEMENT
export const assetManagement_addAsset = assetManagementFunctions.addAsset;
export const assetManagement_getAsset = assetManagementFunctions.getAsset;
export const assetManagement_getUserAssets = assetManagementFunctions.getUserAssets;
export const assetManagement_updateAsset = assetManagementFunctions.updateAsset;

// COMMUNITY
export const community_createFeedPost = communityFunctions.createFeedPost;
export const community_deletePost = communityFunctions.deletePost;
export const community_likePost = communityFunctions.likePost;
export const community_addComment = communityFunctions.addComment;
export const community_getCommentsForPost = communityFunctions.getCommentsForPost;
export const community_voteOnPoll = communityFunctions.voteOnPoll;

// DASHBOARD DATA
export const dashboardData_getFarmerDashboardData = dashboardDataFunctions.getFarmerDashboardData;
export const dashboardData_getPackagingSupplierDashboardData = dashboardDataFunctions.getPackagingSupplierDashboardData;
export const dashboardData_getFiDashboardData = dashboardDataFunctions.getFiDashboardData;
export const dashboardData_getCooperativeDashboardData = dashboardDataFunctions.getCooperativeDashboardData;
export const dashboardData_getBuyerDashboardData = dashboardDataFunctions.getBuyerDashboardData;
export const dashboardData_getRegulatorDashboardData = dashboardDataFunctions.getRegulatorDashboardData;
export const dashboardData_getLogisticsDashboardData = dashboardDataFunctions.getLogisticsDashboardData;
export const dashboardData_getFieldAgentDashboardData = dashboardDataFunctions.getFieldAgentDashboardData;
export const dashboardData_getInputSupplierDashboardData = dashboardDataFunctions.getInputSupplierDashboardData;
export const dashboardData_getAgroExportDashboardData = dashboardDataFunctions.getAgroExportDashboardData;
export const dashboardData_getProcessingUnitDashboardData = dashboardDataFunctions.getProcessingUnitDashboardData;
export const dashboardData_getWarehouseDashboardData = dashboardDataFunctions.getWarehouseDashboardData;
export const dashboardData_getQaDashboardData = dashboardDataFunctions.getQaDashboardData;
export const dashboardData_getCertificationBodyDashboardData = dashboardDataFunctions.getCertificationBodyDashboardData;
export const dashboardData_getResearcherDashboardData = dashboardDataFunctions.getResearcherDashboardData;
export const dashboardData_getAgronomistDashboardData = dashboardDataFunctions.getAgronomistDashboardData;
export const dashboardData_getAgroTourismDashboardData = dashboardDataFunctions.getAgroTourismDashboardData;
export const dashboardData_getInsuranceProviderDashboardData = dashboardDataFunctions.getInsuranceProviderDashboardData;
export const dashboardData_getEnergyProviderDashboardData = dashboardDataFunctions.getEnergyProviderDashboardData;
export const dashboardData_getCrowdfunderDashboardData = dashboardDataFunctions.getCrowdfunderDashboardData;
export const dashboardData_getEquipmentSupplierDashboardData = dashboardDataFunctions.getEquipmentSupplierDashboardData;
export const dashboardData_getWasteManagementDashboardData = dashboardDataFunctions.getWasteManagementDashboardData;
export const dashboardData_getAgriTechInnovatorDashboardData = dashboardDataFunctions.getAgriTechInnovatorDashboardData;
export const dashboardData_getAdminDashboardData = dashboardDataFunctions.getAdminDashboardData;
export const dashboardData_getAdminRecentActivity = dashboardDataFunctions.getAdminRecentActivity;
export const dashboardData_getOperationsDashboardData = dashboardDataFunctions.getOperationsDashboardData;

// FARM MANAGEMENT
export const farmManagement_createFarm = farmManagementFunctions.createFarm;
export const farmManagement_getUserFarms = farmManagementFunctions.getUserFarms;
export const farmManagement_getFarm = farmManagementFunctions.getFarm;
export const farmManagement_updateFarm = farmManagementFunctions.updateFarm;
export const farmManagement_createCrop = farmManagementFunctions.createCrop;
export const farmManagement_updateCrop = farmManagementFunctions.updateCrop;
export const farmManagement_getFarmCrops = farmManagementFunctions.getFarmCrops;
export const farmManagement_getCrop = farmManagementFunctions.getCrop;
export const farmManagement_getProfitabilityInsights = farmManagementFunctions.getProfitabilityInsights;
export const farmManagement_createKnfBatch = farmManagementFunctions.createKnfBatch;
export const farmManagement_getUserKnfBatches = farmManagementFunctions.getUserKnfBatches;
export const farmManagement_updateKnfBatchStatus = farmManagementFunctions.updateKnfBatchStatus;
export const farmManagement_getFarmerApplications = farmManagementFunctions.getFarmerApplications;
export const farmManagement_getTrustScore = farmManagementFunctions.getTrustScore;


// FINANCIALS
export const financials_initiatePayment = financialServicesFunctions.initiatePayment;
// Note: assessCreditRisk and matchFundingOpportunities are internal and exposed via Express API
export const financials_logFinancialTransaction = financialServicesFunctions.logFinancialTransaction;
export const financials_getFinancialSummaryAndTransactions = financialServicesFunctions.getFinancialSummaryAndTransactions;
export const financials_getFinancialApplicationDetails = financialServicesFunctions.getFinancialApplicationDetails;
export const financials_updateFinancialApplicationStatus = financialServicesFunctions.updateFinancialApplicationStatus;
export const financials_submitFinancialApplication = financialServicesFunctions.submitFinancialApplication;
export const financials_createFinancialProduct = financialServicesFunctions.createFinancialProduct;
export const financials_getFinancialProducts = financialServicesFunctions.getFinancialProducts;
export const financials_getFinancialInstitutions = financialServicesFunctions.getFinancialInstitutions;
export const financials_getFiApplications = financialServicesFunctions.getFiApplications;


// FORUMS
export const forums_getForumTopicSuggestions = forumFunctions.getForumTopicSuggestions;
export const forums_getTopics = forumFunctions.getTopics;
export const forums_createTopic = forumFunctions.createTopic;
export const forums_getPostsForTopic = forumFunctions.getPostsForTopic;
export const forums_createForumPost = forumFunctions.createForumPost;
export const forums_getRepliesForPost = forumFunctions.getRepliesForPost;
export const forums_addReplyToPost = forumFunctions.addReplyToPost;

// GROUPS
export const groups_createGroup = groupFunctions.createGroup;
export const groups_getGroups = groupFunctions.getGroups;
export const groups_getGroupDetails = groupFunctions.getGroupDetails;
export const groups_getGroupMembers = groupFunctions.getGroupMembers;
export const groups_joinGroup = groupFunctions.joinGroup;
export const groups_leaveGroup = groupFunctions.leaveGroup;
export const groups_createGroupPost = groupFunctions.createGroupPost;
export const groups_getGroupPosts = groupFunctions.getGroupPosts;
export const groups_addGroupPostReply = groupFunctions.addGroupPostReply;
export const groups_getGroupPostReplies = groupFunctions.getGroupPostReplies;
export const groups_requestToJoinGroup = groupFunctions.requestToJoinGroup;
export const groups_getGroupJoinRequests = groupFunctions.getGroupJoinRequests;
export const groups_respondToJoinRequest = groupFunctions.respondToJoinRequest;
export const groups_inviteUserToGroup = groupFunctions.inviteUserToGroup;


// INSURANCE
export const insurance_assessRiskForPolicy = insuranceFunctions.assessRiskForPolicy;
export const insurance_processInsuranceClaim = insuranceFunctions.processInsuranceClaim;
export const insurance_triggerParametricPayout = insuranceFunctions.triggerParametricPayout;
export const insurance_createInsuranceProduct = insuranceFunctions.createInsuranceProduct;
export const insurance_getInsuranceProducts = insuranceFunctions.getInsuranceProducts;
export const insurance_getInsuranceProductDetails = insuranceFunctions.getInsuranceProductDetails;
export const insurance_submitInsuranceApplication = insuranceFunctions.submitInsuranceApplication;


// INVENTORY
export const inventory_addInventoryItem = inventoryFunctions.addInventoryItem;
export const inventory_getInventory = inventoryFunctions.getInventory;
export const inventory_getInventoryItem = inventoryFunctions.getInventoryItem;
export const inventory_updateInventoryItem = inventoryFunctions.updateInventoryItem;
export const inventory_useInventoryItem = inventoryFunctions.useInventoryItem;

// KNOWLEDGE HUB
export const knowledgeHub_onArticleWriteTranslate = knowledgeHubFunctions.onArticleWriteTranslate;
export const knowledgeHub_createCourse = knowledgeHubFunctions.createCourse;
export const knowledgeHub_createModule = knowledgeHubFunctions.createModule;
export const knowledgeHub_getFeaturedKnowledge = knowledgeHubFunctions.getFeaturedKnowledge;
export const knowledgeHub_createKnowledgeArticle = knowledgeHubFunctions.createKnowledgeArticle;
export const knowledgeHub_getKnowledgeArticles = knowledgeHubFunctions.getKnowledgeArticles;
export const knowledgeHub_getKnowledgeArticleById = knowledgeHubFunctions.getKnowledgeArticleById;
export const knowledgeHub_getAvailableCourses = knowledgeHubFunctions.getAvailableCourses;
export const knowledgeHub_getCourseDetails = knowledgeHubFunctions.getCourseDetails;

// LABOR
export const labor_addWorker = laborFunctions.addWorker;
export const labor_getWorkers = laborFunctions.getWorkers;
export const labor_logHours = laborFunctions.logHours;
export const labor_logPayment = laborFunctions.logPayment;
export const labor_getWorkerDetails = laborFunctions.getWorkerDetails;
export const labor_getUnpaidWorkLogs = laborFunctions.getUnpaidWorkLogs;

// MARKETPLACE
export const marketplace_createShop = marketplaceFunctions.createShop;
export const marketplace_createMarketplaceListing = marketplaceFunctions.createMarketplaceListing;
export const marketplace_createMarketplaceCoupon = marketplaceFunctions.createMarketplaceCoupon;
export const marketplace_getSellerCoupons = marketplaceFunctions.getSellerCoupons;
export const marketplace_validateMarketplaceCoupon = marketplaceFunctions.validateMarketplaceCoupon;
export const marketplace_getShopDetails = marketplaceFunctions.getShopDetails;
export const marketplace_getListingsBySeller = marketplaceFunctions.getListingsBySeller;
export const marketplace_getMarketplaceItemById = marketplaceFunctions.getMarketplaceItemById;
export const marketplace_createMarketplaceOrder = marketplaceFunctions.createMarketplaceOrder;
export const marketplace_getSellerOrders = marketplaceFunctions.getSellerOrders;
export const marketplace_getBuyerOrders = marketplaceFunctions.getBuyerOrders;
export const marketplace_updateOrderStatus = marketplaceFunctions.updateOrderStatus;

// MESSAGES
export const messages_getOrCreateConversation = messageFunctions.getOrCreateConversation;
export const messages_getConversationsForUser = messageFunctions.getConversationsForUser;
export const messages_getMessagesForConversation = messageFunctions.getMessagesForConversation;
export const messages_sendMessage = messageFunctions.sendMessage;

// NETWORK
export const network_sendConnectionRequest = networkFunctions.sendConnectionRequest;
export const network_getPendingRequests = networkFunctions.getPendingRequests;
export const network_respondToConnectionRequest = networkFunctions.respondToConnectionRequest;
export const network_getConnections = networkFunctions.getConnections;
export const network_removeConnection = networkFunctions.removeConnection;
export const network_sendInvite = networkFunctions.sendInvite;
export const network_getProfileConnectionStatuses = networkFunctions.getProfileConnectionStatuses;


// NOTIFICATIONS
export const notifications_onNewProfileView = notificationFunctions.onNewProfileView;
export const notifications_onNewConnectionRequest = notificationFunctions.onNewConnectionRequest;
export const notifications_onPostLike = notificationFunctions.onPostLike;
export const notifications_onPostComment = notificationFunctions.onPostComment;
export const notifications_onNewMarketplaceOrder = notificationFunctions.onNewMarketplaceOrder;
export const notifications_markNotificationAsRead = notificationFunctions.markNotificationAsRead;
export const notifications_manageNotificationPreferences = notificationFunctions.manageNotificationPreferences;
export const notifications_sendEventReminders = notificationFunctions.sendEventReminders;

// OFFLINE SYNC
export const offlineSync_uploadOfflineChanges = offlineSyncFunctions.uploadOfflineChanges;
export const offlineSync_processOfflineChange = offlineSyncFunctions.processOfflineChange;

// USER
export const user_onUserCreate = userFunctions.onUserCreate;
export const user_onUserDeleteCleanup = userFunctions.onUserDeleteCleanup;
export const user_upsertStakeholderProfile = userFunctions.upsertStakeholderProfile;
export const user_getProfileByIdFromDB = userFunctions.getProfileByIdFromDB;
export const user_getAllProfilesFromDB = userFunctions.getAllProfilesFromDB;
export const user_deleteUserAccount = userFunctions.deleteUserAccount;
export const user_requestDataExport = userFunctions.requestDataExport;

// UNIVERSAL ID
export const universalId_generateUniversalIdOnUserCreate = universalIdFunctions.generateUniversalIdOnUserCreate;
export const universalId_getUniversalIdData = universalIdFunctions.getUniversalIdData;
export const universalId_lookupUserByPhone = universalIdFunctions.lookupUserByPhone;
export const universalId_createRecoverySession = universalIdFunctions.createRecoverySession;
export const universalId_scanRecoveryQr = universalIdFunctions.scanRecoveryQr;
export const universalId_completeRecovery = universalIdFunctions.completeRecovery;

// REGULATORY
export const regulatory_generateRegulatoryReport = regulatoryFunctions.generateRegulatoryReport;
export const regulatory_getGeneratedReports = regulatoryFunctions.getGeneratedReports;

// SEARCH
export const search_onSourceDocumentWriteIndex = searchFunctions.onSourceDocumentWriteIndex;
export const search_performSearch = searchFunctions.performSearch;

// SUSTAINABILITY
export const sustainability_calculateCarbonFootprint = sustainabilityFunctions.calculateCarbonFootprint;
export const sustainability_getSustainabilityDashboardData = sustainabilityFunctions.getSustainabilityDashboardData;

// GEOSPATIAL
export const geospatial_onSearchIndexWriteUpdateGeohash = geospatialFunctions.onSearchIndexWriteUpdateGeohash;


// Export the Express app as a Cloud Function for Cloud Run services
export const api = functions.https.onRequest(expressApp);
