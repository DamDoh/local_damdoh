
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { logFinancialTransaction } from "./financial-services"; 

const db = admin.firestore();

const checkAuth = (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "error.unauthenticated");
  }
  return context.auth.uid;
};

export const addWorker = functions.https.onCall(async (data, context) => {
  const farmerId = checkAuth(context);
  const { name, contactInfo, payRate, payRateUnit } = data;

  if (!name) throw new functions.https.HttpsError("invalid-argument", "error.worker.nameRequired");

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

export const getWorkers = functions.https.onCall(async (data, context) => {
  const farmerId = checkAuth(context);
  const workersSnapshot = await db.collection(`users/${farmerId}/workers`).orderBy('name').get();
  
  const workers = workersSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: (doc.data().createdAt as admin.firestore.Timestamp)?.toDate?.().toISOString(),
  }));

  return { workers };
});

export const logHours = functions.https.onCall(async (data, context) => {
  const farmerId = checkAuth(context);
  const { workerId, hours, date, taskDescription } = data;

  if (!workerId || !hours || !date) throw new functions.https.HttpsError("invalid-argument", "error.form.missingFields");

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

export const logPayment = functions.https.onCall(async (data, context) => {
    const farmerId = checkAuth(context);
    const { workerId, amount, date, notes, currency } = data;
    if (!workerId || !amount || !date || !currency) throw new functions.https.HttpsError("invalid-argument", "error.form.missingFields");
    
    const workerRef = db.collection(`users/${farmerId}/workers`).doc(workerId);
    const workerSnap = await workerRef.get();
    if(!workerSnap.exists) throw new functions.https.HttpsError("not-found", "error.worker.notFound");
    const workerName = workerSnap.data()?.name || "a worker";
    
    try {
        await logFinancialTransaction({
            type: 'expense',
            amount: Number(amount),
            currency: currency,
            description: `Labor payment to ${workerName}`,
            category: 'Labor'
        }, context);
    } catch (error) {
        console.error("Failed to auto-log labor payment as an expense:", error);
        throw new functions.https.HttpsError('internal', 'error.financial.logFailed');
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

    return { success: true, paymentId: paymentRef.id };
});

export const getWorkerDetails = functions.https.onCall(async (data, context) => {
    const farmerId = checkAuth(context);
    const { workerId } = data;

    if(!workerId) throw new functions.https.HttpsError('invalid-argument', 'error.worker.idRequired');
    
    const workerRef = db.collection(`users/${farmerId}/workers`).doc(workerId);
    const workLogsRef = workerRef.collection('work_logs').orderBy('date', 'desc').limit(20);
    const paymentsRef = workerRef.collection('payments').orderBy('date', 'desc').limit(20);

    const [workerSnap, workLogsSnap, paymentsSnap] = await Promise.all([
        workerRef.get(),
        workLogsRef.get(),
        paymentsRef.get()
    ]);

    if (!workerSnap.exists) throw new functions.https.HttpsError('not-found', 'error.worker.notFound');
    
    const workLogs = workLogsSnap.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(), 
        date: doc.data().date.toDate().toISOString(),
        createdAt: doc.data().createdAt.toDate().toISOString(),
    }));
    const payments = paymentsSnap.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(), 
        date: doc.data().date.toDate().toISOString(),
        createdAt: doc.data().createdAt.toDate().toISOString(),
    }));

    return {
        profile: { 
            id: workerSnap.id, 
            ...workerSnap.data(),
            createdAt: (workerSnap.data()?.createdAt as admin.firestore.Timestamp)?.toDate?.().toISOString(),
        },
        workLogs,
        payments
    }
});
