

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { logFinancialTransaction } from "./financial-services"; // Assuming this function exists to log expenses
import { checkAuth } from './utils';
import { logError } from './logging';

const db = admin.firestore();

// Add a new worker profile
export const addWorker = functions.https.onCall(async (data, context) => {
  const farmerId = checkAuth(context);
  const { name, contactInfo, payRate, payRateUnit } = data;

  if (!name) {
    throw new functions.https.HttpsError("invalid-argument", "Worker name is required.");
  }
  
  try {
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
  } catch (error) {
      logError("Error adding worker", { farmerId, error });
      throw new functions.https.HttpsError("internal", "Could not add worker.");
  }
});

// Get all workers for a farmer
export const getWorkers = functions.https.onCall(async (data, context) => {
  const farmerId = checkAuth(context);
  try {
    const workersSnapshot = await db.collection(`users/${farmerId}/workers`).orderBy('name').get();
  
    const workers = workersSnapshot.docs.map(doc => {
      const workerData = doc.data();
      return {
        id: doc.id,
        ...workerData,
        createdAt: (workerData.createdAt as admin.firestore.Timestamp)?.toDate?.().toISOString(),
      }
    });

    return { workers };
  } catch (error) {
    logError("Error fetching workers", { farmerId, error });
    throw new functions.https.HttpsError("internal", "Could not retrieve worker list.");
  }
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

// Log a payment made to a worker and automatically create a corresponding expense
export const logPayment = functions.https.onCall(async (data, context) => {
    const farmerId = checkAuth(context);
    const { workerId, amount, date, notes, currency, workLogIds } = data;

    if (!workerId || !amount || !date || !currency) {
        throw new functions.https.HttpsError("invalid-argument", "Worker ID, amount, currency, and date are required.");
    }
    
    const workerRef = db.collection(`users/${farmerId}/workers`).doc(workerId);
    
    try {
        const workerSnap = await workerRef.get();
        if(!workerSnap.exists) {
            throw new functions.https.HttpsError("not-found", "Worker profile not found.");
        }
        const workerName = workerSnap.data()?.name || "a worker";
        
        // --- Automatic Interconnection with Financials Module ---
        // Log this payment as an expense in the "Money Matters" module
        await logFinancialTransaction({
            type: 'expense',
            amount: Number(amount),
            currency: currency,
            description: `Labor payment to ${workerName}`,
            category: 'Labor',
            date,
        }, context);

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

    } catch (error) {
        logError("Failed to log labor payment", { farmerId, workerId, error });
        // Decide if this should be a critical failure or just a warning
        if (error instanceof functions.https.HttpsError) throw error;
        throw new functions.https.HttpsError('internal', 'Could not record the payment.');
    }
});

// Fetch detailed logs for a single worker
export const getWorkerDetails = functions.https.onCall(async (data, context) => {
    const farmerId = checkAuth(context);
    const { workerId } = data;

    if(!workerId) throw new functions.https.HttpsError('invalid-argument', 'A worker ID is required.');
    
    try {
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
            const data = doc.data();
            return { 
                id: doc.id, 
                ...data, 
                date: (data.date as admin.firestore.Timestamp)?.toDate?.().toISOString(),
                createdAt: (data.createdAt as admin.firestore.Timestamp)?.toDate?.().toISOString(),
            }
        });
        const payments = paymentsSnap.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id, 
                ...data, 
                date: (data.date as admin.firestore.Timestamp)?.toDate?.().toISOString(),
                createdAt: (data.createdAt as admin.firestore.Timestamp)?.toDate?.().toISOString(),
            }
        });
        
        const workerData = workerSnap.data();
        return {
            profile: { 
                id: workerSnap.id, 
                ...workerData,
                createdAt: (workerData?.createdAt as admin.firestore.Timestamp)?.toDate?.().toISOString(),
            },
            workLogs,
            payments
        }
    } catch (error) {
        logError("Failed to get worker details", { farmerId, workerId, error });
        if (error instanceof functions.https.HttpsError) throw error;
        throw new functions.https.HttpsError("internal", "Could not retrieve worker details.");
    }
});


// New function to get only unpaid work logs for a worker
export const getUnpaidWorkLogs = functions.https.onCall(async (data, context) => {
    const farmerId = checkAuth(context);
    const { workerId } = data;
    if (!workerId) {
        throw new functions.https.HttpsError("invalid-argument", "A workerId must be provided.");
    }
    
    try {
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
    } catch(error) {
        logError("Failed to get unpaid work logs", { farmerId, workerId, error });
        throw new functions.https.HttpsError("internal", "Could not retrieve unpaid work logs.");
    }
});
