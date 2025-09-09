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
exports.getGeneratedReports = exports.generateRegulatoryReport = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const profiles_1 = require("./profiles");
const ai_and_analytics_1 = require("./ai-and-analytics");
const db = admin.firestore();
const checkAuth = (context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    return context.auth.uid;
};
exports.generateRegulatoryReport = functions.https.onCall(async (data, context) => {
    const callerUid = checkAuth(context);
    const callerRole = await (0, profiles_1.getRole)(callerUid);
    const { reportType, userId, reportPeriod } = data;
    if (!reportType || typeof reportType !== "string") {
        throw new functions.https.HttpsError("invalid-argument", "The 'reportType' parameter is required and must be a string.");
    }
    if (!userId) {
        throw new functions.https.HttpsError("invalid-argument", "A target userId is required.");
    }
    if (!reportPeriod ||
        typeof reportPeriod.startDate !== "number" ||
        typeof reportPeriod.endDate !== "number" ||
        reportPeriod.startDate >= reportPeriod.endDate) {
        throw new functions.https.HttpsError("invalid-argument", "Valid reportPeriod with start and end timestamps is required.");
    }
    // For this implementation, we allow Admins to generate reports.
    // This could be expanded to include 'Regulator' or 'Auditor' roles.
    if (callerRole !== "Admin") {
        throw new functions.https.HttpsError("permission-denied", "User is not authorized to generate regulatory reports.");
    }
    const startDate = admin.firestore.Timestamp.fromMillis(reportPeriod.startDate);
    const endDate = admin.firestore.Timestamp.fromMillis(reportPeriod.endDate);
    const generatedForRef = db.collection("users").doc(userId);
    console.log(`Generating regulatory report type '${reportType}' for ${userId} for period ${startDate.toDate()} to ${endDate.toDate()}...`);
    try {
        let fetchedData = [];
        if (reportType === 'VTI_EVENTS_SUMMARY') {
            const eventsSnapshot = await db.collection("traceability_events")
                .where("actorRef", "==", userId)
                .where("timestamp", ">=", startDate)
                .where("timestamp", "<=", endDate)
                .orderBy("timestamp", "asc")
                .get();
            fetchedData = eventsSnapshot.docs.map(doc => doc.data());
        }
        else {
            throw new functions.https.HttpsError("invalid-argument", `Report type '${reportType}' is not supported.`);
        }
        console.log(`Fetched ${fetchedData.length} records for report.`);
        const processedContent = await (0, ai_and_analytics_1._internalProcessReportData)({
            reportType,
            data: fetchedData,
        });
        const generatedReportRef = db.collection("generated_reports").doc();
        const generatedReportId = generatedReportRef.id;
        await generatedReportRef.set({
            reportId: generatedReportId,
            reportType: reportType,
            generatedForRef: generatedForRef,
            reportPeriod: { startDate, endDate },
            generatedAt: admin.firestore.FieldValue.serverTimestamp(),
            status: "Completed",
            reportContent: {
                summary: processedContent.summary,
                key_findings: processedContent.key_findings,
                raw_data_count: fetchedData.length,
            },
        });
        console.log(`Regulatory report stored with ID: ${generatedReportId}.`);
        return { reportId: generatedReportId, status: "completed" };
    }
    catch (error) {
        console.error(`Error generating regulatory report for ${userId}:`, error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "Unable to generate regulatory report.", error.message);
    }
});
exports.getGeneratedReports = functions.https.onCall(async (data, context) => {
    checkAuth(context);
    // Add role check if necessary
    const reportsSnapshot = await db.collection("generated_reports")
        .orderBy("generatedAt", "desc")
        .limit(20)
        .get();
    const reports = reportsSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
    return { reports };
});
//# sourceMappingURL=regulatory-and-compliance.js.map