"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitReportToAuthority = exports.generateRegulatoryReport = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const profiles_1 = require("./profiles");
const ai_and_analytics_1 = require("./ai-and-analytics");
const db = admin.firestore();
/**
 * Generates a regulatory report based on the provided data.
 * @param {any} data The data for the report.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{reportId: string, status: string}>} A promise that resolves with the report ID and status.
 */
exports.generateRegulatoryReport = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated to generate regulatory reports.");
    }
    const callerUid = context.auth.uid;
    const callerRole = await (0, profiles_1.getRole)(callerUid);
    const { reportType, userId, orgId, reportPeriod } = data;
    if (!reportType || typeof reportType !== "string") {
        throw new functions.https.HttpsError("invalid-argument", "The 'reportType' parameter is required and must be a string.");
    }
    if (!userId && !orgId) {
        throw new functions.https.HttpsError("invalid-argument", "Either userId or orgId is required.");
    }
    if (!reportPeriod ||
        typeof reportPeriod.startDate !== "number" ||
        typeof reportPeriod.endDate !== "number" ||
        reportPeriod.startDate >= reportPeriod.endDate) {
        throw new functions.https.HttpsError("invalid-argument", "Valid reportPeriod with start and end timestamps is required.");
    }
    const startDate = admin.firestore.Timestamp.fromMillis(reportPeriod.startDate);
    const endDate = admin.firestore.Timestamp.fromMillis(reportPeriod.endDate);
    const hasAuthorizedRole = callerRole && ["Admin", "Regulator", "Auditor"].includes(callerRole); // Using UserRole type now
    if (!hasAuthorizedRole) {
        throw new functions.https.HttpsError("permission-denied", "User is not authorized to generate regulatory reports.");
    }
    const generatedForRef = userId ?
        db.collection("users").doc(userId) :
        db.collection("organizations").doc(orgId);
    console.log(`Generating regulatory report type '${reportType}' for ${userId || orgId} for period ${startDate.toDate()} to ${endDate.toDate()}...`);
    try {
        console.log(`Fetching data for report type '${reportType}'...`);
        const fetchedData = {};
        const reportContent = {
            reportType: reportType,
            generatedFor: { userId: userId, orgId: orgId },
            reportPeriod: {
                startDate: startDate.toDate().toISOString(),
                endDate: endDate.toDate().toISOString(),
            },
            data: fetchedData,
        };
        const processedContent = await (0, ai_and_analytics_1._internalProcessReportData)({
            reportType,
            data: reportContent,
        });
        reportContent.processedContent = processedContent;
        console.log("Storing the generated report...");
        const generatedReportRef = db.collection("generated_reports").doc();
        const generatedReportId = generatedReportRef.id;
        await generatedReportRef.set({
            reportId: generatedReportId,
            reportType: reportType,
            generatedForRef: generatedForRef,
            reportPeriod: {
                startDate: startDate,
                endDate: endDate,
            },
            generatedAt: admin.firestore.FieldValue.serverTimestamp(),
            status: "generated",
            reportContent: reportContent,
            submittedTo: null,
            submissionLogRef: null,
        });
        console.log(`Regulatory report generated and stored with ID: ${generatedReportId} for ${userId || orgId}.`);
        return { reportId: generatedReportId, status: "generated" };
    }
    catch (error) {
        console.error(`Error generating regulatory report type '${reportType}' for ${userId || orgId}:`, error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "Unable to generate regulatory report.", error);
    }
});
// OnWrite or Callable function to submit a generated report to an external authority
exports.submitReportToAuthority = functions.firestore
    .document("generated_reports/{reportId}")
    .onUpdate(async (change, context) => {
    var _a;
    const reportAfter = change.after.data();
    const reportBefore = change.before.data();
    const reportId = context.params.reportId;
    if (!reportBefore || !reportAfter) {
        return null;
    }
    if (reportBefore.status !== "ready_for_submission" &&
        reportAfter.status === "ready_for_submission") {
        console.log(`Report ${reportId} status changed to ready_for_submission. Initiating submission process.`);
        try {
            const reportData = reportAfter;
            console.log(`Identifying authority and method for report type '${reportData.reportType}'...`);
            const targetAuthority = "Example Regulatory Body";
            const submissionMethod = "api";
            console.log("Creating submission log entry...");
            const submissionLogRef = db.collection("submission_logs").doc();
            const submissionLogId = submissionLogRef.id;
            await submissionLogRef.set({
                logId: submissionLogId,
                reportRef: change.after.ref,
                submissionTimestamp: admin.firestore.FieldValue.serverTimestamp(),
                authority: targetAuthority,
                method: submissionMethod,
                status: "in_progress",
                responseDetails: {},
                submittedByRef: db.collection("users").doc("system"),
            });
            console.log(`Submission log entry created with ID: ${submissionLogId} for report ${reportId}.`);
            await change.after.ref.update({
                status: "in_progress",
                submissionLogRef: submissionLogRef,
            });
            console.log(`Report ${reportId} status updated to in_progress.`);
            console.log(`Attempting secure submission to ${targetAuthority} via ${submissionMethod}...`);
            const submissionSuccessful = Math.random() > 0.2;
            if (submissionSuccessful) {
                console.log("Submission simulated as successful.");
                await submissionLogRef.update({
                    status: "successful",
                    responseDetails: {
                        message: "Simulated success",
                        timestamp: new Date().toISOString(),
                    },
                });
                await change.after.ref.update({ status: "submitted" });
                console.log(`Submission for report ${reportId} successful. Status updated.`);
            }
            else {
                console.error("Submission simulated as failed.");
                await submissionLogRef.update({
                    status: "failed",
                    responseDetails: { message: "Simulated failure", error: "Connection error" },
                });
                await change.after.ref.update({ status: "submission_failed" });
                console.error(`Submission for report ${reportId} failed. Status updated.`);
            }
        }
        catch (error) {
            console.error(`Error during submission process for report ${reportId}:`, error);
            await change.after.ref.update({ status: "submission_failed" });
            const submissionLogRef = (_a = change.after.data()) === null || _a === void 0 ? void 0 : _a.submissionLogRef;
            if (submissionLogRef) {
                await submissionLogRef.update({
                    status: "failed",
                    responseDetails: { error: error.message || "Unknown error" },
                });
            }
        }
    }
    else {
        console.log(`Report ${reportId} status change (${reportBefore.status} -> ${reportAfter.status}) did not trigger submission.`);
    }
    return null;
});
//# sourceMappingURL=regulatory-and-compliance.js.map