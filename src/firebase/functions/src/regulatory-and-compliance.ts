
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { getRole } from "./utils";
import {_internalProcessReportData} from "./ai-and-analytics";

const db = admin.firestore();

const checkAuth = (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
  }
  return context.auth.uid;
};

export const generateRegulatoryReport = functions.https.onCall(
  async (data, context) => {
    const callerUid = checkAuth(context);
    const callerRole = await getRole(callerUid);

    const {reportType, userId, reportPeriod} = data;

    if (!reportType || typeof reportType !== "string") {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The 'reportType' parameter is required and must be a string.",
      );
    }
    if (!userId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "A target userId is required.",
      );
    }
    if (
      !reportPeriod ||
      typeof reportPeriod.startDate !== "number" ||
      typeof reportPeriod.endDate !== "number" ||
      reportPeriod.startDate >= reportPeriod.endDate
    ) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Valid reportPeriod with start and end timestamps is required.",
      );
    }
    
    // For this implementation, we allow Admins to generate reports.
    // This could be expanded to include 'Regulator' or 'Auditor' roles.
    if (callerRole !== "Admin") {
      throw new functions.https.HttpsError(
        "permission-denied",
        "User is not authorized to generate regulatory reports.",
      );
    }

    const startDate = admin.firestore.Timestamp.fromMillis(reportPeriod.startDate);
    const endDate = admin.firestore.Timestamp.fromMillis(reportPeriod.endDate);
    const generatedForRef = db.collection("users").doc(userId);

    console.log(
      `Generating regulatory report type '${reportType}' for ${userId} for period ${startDate.toDate()} to ${endDate.toDate()}...`,
    );

    try {
      let fetchedData: any[] = [];
      
      if (reportType === 'VTI_EVENTS_SUMMARY') {
        const eventsSnapshot = await db.collection("traceability_events")
          .where("actorRef", "==", userId)
          .where("timestamp", ">=", startDate)
          .where("timestamp", "<=", endDate)
          .orderBy("timestamp", "asc")
          .get();
        
        fetchedData = eventsSnapshot.docs.map(doc => doc.data());
      } else {
        throw new functions.https.HttpsError("invalid-argument", `Report type '${reportType}' is not supported.`);
      }

      console.log(`Fetched ${fetchedData.length} records for report.`);
      
      const processedContent = await _internalProcessReportData({
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

      return {reportId: generatedReportId, status: "completed"};
    } catch (error: any) {
      console.error(`Error generating regulatory report for ${userId}:`, error);
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      throw new functions.https.HttpsError("internal", "Unable to generate regulatory report.", error.message);
    }
  },
);

export const getGeneratedReports = functions.https.onCall(async (data, context) => {
    checkAuth(context);
    
    // Add role check if necessary
    
    const reportsSnapshot = await db.collection("generated_reports")
        .orderBy("generatedAt", "desc")
        .limit(20)
        .get();
        
    const reports = reportsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
    
    return { reports };
});
