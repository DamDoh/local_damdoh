

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { logFinancialTransaction } from "./financials"; // Assuming this function exists to log expenses

const db = admin.firestore();

// Helper to check for authentication
const checkAuth = (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
  }
  return context.auth.uid;
};

// Add a new worker profile
export const addWorker = functions.https.onCall(async (data, context) => {
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
export const getWorkers = functions.https.onCall(async (data, context) => {
  const farmerId = checkAuth(context);
  const workersSnapshot = await db.collection(`users/${farmerId}/workers`).orderBy('name').get();
  
  const workers = workersSnapshot.docs.map(doc => {
    const docData = doc.data();
    return {
        id: doc.id,
        ...docData,
        createdAt: (docData.createdAt as admin.firestore.Timestamp).toDate().toISOString(),
    }
  });

  return { workers };
});


// Log hours for a worker
export const logHours = functions.https.onCall(async (data, context) => {
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

// New function to get only unpaid work logs for a worker
export const getUnpaidWorkLogs = functions.https.onCall(async (data, context) => {
    const farmerId = checkAuth(context);
    const { workerId } = data;
    if (!workerId) {
        throw new functions.https.HttpsError("invalid-argument", "A workerId must be provided.");
    }
    
    const workLogsSnapshot = await db.collection(`users/${farmerId}/workers/${workerId}/work_logs`)
        .where('isPaid', '==', false)
        .orderBy('date', 'asc')
        .get();

    const workLogs = workLogsSnapshot.docs.map(doc => {
        const docData = doc.data();
        return { 
            id: doc.id, 
            ...docData, 
            date: (docData.date as admin.firestore.Timestamp).toDate().toISOString(),
        }
    });

    return { workLogs };
});


// Enhanced function to log a payment made to a worker and mark work logs as paid
export const logPayment = functions.https.onCall(async (data, context) => {
    const farmerId = checkAuth(context);
    const { workerId, amount, date, notes, currency, workLogIds } = data;

    if (!workerId || !amount || !date || !currency) {
        throw new functions.https.HttpsError("invalid-argument", "Worker ID, amount, currency, and date are required.");
    }
    
    const workerRef = db.collection(`users/${farmerId}/workers`).doc(workerId);
    const workerSnap = await workerRef.get();
    if(!workerSnap.exists) {
        throw new functions.https.HttpsError("not-found", "Worker profile not found.");
    }
    const workerName = workerSnap.data()?.name || "a worker";
    
    try {
        await logFinancialTransaction({
            type: 'expense',
            amount: Number(amount),
            currency: currency,
            description: `Labor payment to ${workerName}`,
            category: 'Labor',
            date,
        }, context);
    } catch (error) {
        console.error("Failed to auto-log labor payment as an expense:", error);
        throw new functions.https.HttpsError('internal', 'Could not record the payment in your financial ledger.');
    }

    const paymentRef = db.collection(`users/${farmerId}/workers/${workerId}/payments`).doc();

    const batch = db.batch();

    batch.set(paymentRef, {
        amount: Number(amount),
        currency: currency,
        date: admin.firestore.Timestamp.fromDate(new Date(date)),
        notes: notes || `Payment for services rendered.`,
        paidLogIds: workLogIds || [],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    batch.update(workerRef, {
        totalPaid: admin.firestore.FieldValue.increment(Number(amount)),
    });

    // Mark the selected work logs as paid
    if (Array.isArray(workLogIds) && workLogIds.length > 0) {
        workLogIds.forEach(logId => {
            const logRef = db.collection(`users/${farmerId}/workers/${workerId}/work_logs`).doc(logId);
            batch.update(logRef, { isPaid: true });
        });
    }

    await batch.commit();

    return { success: true, paymentId: paymentRef.id };
});

// Fetch detailed logs for a single worker
export const getWorkerDetails = functions.https.onCall(async (data, context) => {
    const farmerId = checkAuth(context);
    const { workerId } = data;

    if(!workerId) throw new functions.https.HttpsError('invalid-argument', 'A worker ID is required.');
    
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
    
    const workLogs = workLogsSnap.docs.map(doc => { 
      const docData = doc.data();
      return { 
        id: doc.id, 
        ...docData, 
        date: (docData.date as admin.firestore.Timestamp).toDate().toISOString(),
        createdAt: (docData.createdAt as admin.firestore.Timestamp).toDate().toISOString(),
    }});
    const payments = paymentsSnap.docs.map(doc => {
      const docData = doc.data();
      return { 
        id: doc.id, 
        ...docData, 
        date: (docData.date as admin.firestore.Timestamp).toDate().toISOString(),
        createdAt: (docData.createdAt as admin.firestore.Timestamp).toDate().toISOString(),
    }});

    const profileData = workerSnap.data()!;
    return {
        profile: { 
            id: workerSnap.id, 
            ...profileData,
            createdAt: (profileData.createdAt as admin.firestore.Timestamp).toDate().toISOString(),
        },
        workLogs,
        payments
    }
});

    