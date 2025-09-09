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
exports.getWorkerDetails = exports.logPayment = exports.logHours = exports.getWorkers = exports.addWorker = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const financial_services_1 = require("./financial-services"); // Assuming this function exists to log expenses
const db = admin.firestore();
// Helper to check for authentication
const checkAuth = (context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
    }
    return context.auth.uid;
};
// Add a new worker profile
exports.addWorker = functions.https.onCall(async (data, context) => {
    const farmerId = checkAuth(context);
    const { name, contactInfo, payRate, payRateUnit } = data;
    if (!name) {
        throw new functions.https.HttpsError("invalid-argument", "Worker name is required.");
    }
    const workerRef = db.collection(`users/${farmerId}/workers`).doc();
    await workerRef.set({
        name,
        contactInfo: contactInfo || null,
        payRate: payRate || null,
        payRateUnit: payRateUnit || null,
        totalHoursLogged: 0,
        totalPaid: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { success: true, workerId: workerRef.id };
});
// Get all workers for a farmer
exports.getWorkers = functions.https.onCall(async (data, context) => {
    const farmerId = checkAuth(context);
    const workersSnapshot = await db.collection(`users/${farmerId}/workers`).orderBy('name').get();
    const workers = workersSnapshot.docs.map(doc => (Object.assign(Object.assign({ id: doc.id }, doc.data()), { createdAt: doc.data().createdAt.toDate().toISOString() })));
    return { workers };
});
// Log hours for a worker
exports.logHours = functions.https.onCall(async (data, context) => {
    const farmerId = checkAuth(context);
    const { workerId, hours, date, taskDescription } = data;
    if (!workerId || !hours || !date) {
        throw new functions.https.HttpsError("invalid-argument", "Worker ID, hours, and date are required.");
    }
    const workLogRef = db.collection(`users/${farmerId}/workers/${workerId}/work_logs`).doc();
    const workerRef = db.collection(`users/${farmerId}/workers`).doc(workerId);
    const batch = db.batch();
    batch.set(workLogRef, {
        hours: Number(hours),
        date: admin.firestore.Timestamp.fromDate(new Date(date)),
        taskDescription: taskDescription || 'General farm work',
        isPaid: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    batch.update(workerRef, {
        totalHoursLogged: admin.firestore.FieldValue.increment(Number(hours))
    });
    await batch.commit();
    return { success: true, workLogId: workLogRef.id };
});
// Log a payment made to a worker and automatically create a corresponding expense
exports.logPayment = functions.https.onCall(async (data, context) => {
    var _a;
    const farmerId = checkAuth(context);
    const { workerId, amount, date, notes, currency } = data;
    if (!workerId || !amount || !date || !currency) {
        throw new functions.https.HttpsError("invalid-argument", "Worker ID, amount, currency, and date are required.");
    }
    const workerRef = db.collection(`users/${farmerId}/workers`).doc(workerId);
    const workerSnap = await workerRef.get();
    if (!workerSnap.exists) {
        throw new functions.https.HttpsError("not-found", "Worker profile not found.");
    }
    const workerName = ((_a = workerSnap.data()) === null || _a === void 0 ? void 0 : _a.name) || "a worker";
    // --- Automatic Interconnection with Financials Module ---
    // Log this payment as an expense in the "Money Matters" module
    try {
        await (0, financial_services_1.logFinancialTransaction)({
            type: 'expense',
            amount: Number(amount),
            currency: currency,
            description: `Labor payment to ${workerName}`,
            category: 'Labor'
        }, context);
    }
    catch (error) {
        console.error("Failed to auto-log labor payment as an expense:", error);
        // Decide if this should be a critical failure or just a warning
        // For now, we'll let it fail but a more robust system might queue it for retry
        throw new functions.https.HttpsError('internal', 'Could not record the payment in your financial ledger.');
    }
    const paymentRef = db.collection(`users/${farmerId}/workers/${workerId}/payments`).doc();
    await paymentRef.set({
        amount: Number(amount),
        currency: currency,
        date: admin.firestore.Timestamp.fromDate(new Date(date)),
        notes: notes || `Payment for services rendered.`,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    await workerRef.update({
        totalPaid: admin.firestore.FieldValue.increment(Number(amount)),
    });
    // Note: A more advanced system would link specific unpaid work_logs to this payment
    // and mark them as paid. For simplicity, we are just tracking totals for now.
    return { success: true, paymentId: paymentRef.id };
});
// Fetch detailed logs for a single worker
exports.getWorkerDetails = functions.https.onCall(async (data, context) => {
    var _a;
    const farmerId = checkAuth(context);
    const { workerId } = data;
    if (!workerId)
        throw new functions.https.HttpsError('invalid-argument', 'A worker ID is required.');
    const workerRef = db.collection(`users/${farmerId}/workers`).doc(workerId);
    const workLogsRef = workerRef.collection('work_logs').orderBy('date', 'desc').limit(20);
    const paymentsRef = workerRef.collection('payments').orderBy('date', 'desc').limit(20);
    const [workerSnap, workLogsSnap, paymentsSnap] = await Promise.all([
        workerRef.get(),
        workLogsRef.get(),
        paymentsRef.get()
    ]);
    if (!workerSnap.exists) {
        throw new functions.https.HttpsError('not-found', 'Worker not found.');
    }
    const workLogs = workLogsSnap.docs.map(doc => (Object.assign(Object.assign({ id: doc.id }, doc.data()), { date: doc.data().date.toDate().toISOString(), createdAt: doc.data().createdAt.toDate().toISOString() })));
    const payments = paymentsSnap.docs.map(doc => (Object.assign(Object.assign({ id: doc.id }, doc.data()), { date: doc.data().date.toDate().toISOString(), createdAt: doc.data().createdAt.toDate().toISOString() })));
    return {
        profile: Object.assign(Object.assign({ id: workerSnap.id }, workerSnap.data()), { createdAt: (_a = workerSnap.data()) === null || _a === void 0 ? void 0 : _a.createdAt.toDate().toISOString() }),
        workLogs,
        payments
    };
});
//# sourceMappingURL=labor.js.map