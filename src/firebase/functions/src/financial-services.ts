

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

const checkAuth = (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
  }
  return context.auth.uid;
};

// --- Internal AI-Driven Functions (moved from ai-and-analytics.ts) ---

/**
 * Internal logic for assessing credit risk.
 * This is an internal function to be called by other modules.
 * @param {any} data The data payload for assessment, typically containing
 * user profile and financial history.
 * @return {Promise<object>} An object with the calculated credit score
 * and contributing risk factors.
 */
export async function _internalAssessCreditRisk(data: any) {
  console.log("_internalAssessCreditRisk called with data:", data);
  const calculatedScore = Math.floor(300 + Math.random() * 550);
  const riskFactors = [
    "Payment history on platform",
    "Farm yield variability",
    "Length of operational history",
  ];
  return {
    score: calculatedScore,
    riskFactors: riskFactors,
    status: "placeholder_analysis_complete",
  };
}

/**
 * Internal logic for matching a user with funding opportunities.
 * This is an internal function to be called by other modules.
 * @param {any} data The data payload, containing user profile and available
 * opportunities.
 * @return {Promise<object>} An object with a list of matched
 * opportunities and their relevance scores.
 */
export async function _internalMatchFundingOpportunities(data: any) {
  console.log("_internalMatchFundingOpportunities called with data:", data);
  const matchedOpportunities = [
    {
      opportunityId: "loan_product_123",
      relevanceScore: 0.85,
      reason: "High credit score and matching crop type.",
    },
    {
      opportunityId: "grant_program_456",
      relevanceScore: 0.70,
      reason: "Matches sustainability practices and location.",
    },
  ];
  return {
    matchedOpportunities: matchedOpportunities,
    status: "placeholder_matching_complete",
  };
}


/**
 * Internal logic for initiating a payment.
 * @param {any} data The data for the payment.
 * @param {functions.https.CallableContext} [context] The context of the function call.
 * @return {Promise<{orderId: string, status: string, transactionId: string}>} A promise that resolves with the payment details.
 */
export async function _internalInitiatePayment(
  data: any,
  context?: functions.https.CallableContext,
) {
  const {orderId, amount, currency} = data;

  if (!orderId || typeof orderId !== "string") {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "error.orderId.required",
    );
  }
  if (amount === undefined || typeof amount !== "number" || amount <= 0) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "error.amount.invalid",
    );
  }
  if (!currency || typeof currency !== "string") {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "error.currency.required",
    );
  }

  console.log(
    `Attempting to initiate payment for order ${orderId} (Amount: ${amount} ${currency})...`,
  );

  console.log("Placeholder for payment gateway API call...");
  const paymentGatewayResponse = {
    success: true,
    transactionId: `pg_txn_${orderId}_${Date.now()}`,
  };

  if (paymentGatewayResponse.success) {
    console.log(
      `Payment initiation successful for order ${orderId}. Transaction ID: ${paymentGatewayResponse.transactionId}`,
    );
    return {
      orderId: orderId,
      status: "payment_initiation_successful",
      transactionId: paymentGatewayResponse.transactionId,
    };
  } else {
    console.error(`Payment initiation failed for order ${orderId}.`);
    throw new functions.https.HttpsError(
      "aborted",
      "error.payment.initiationFailed",
    );
  }
}

// Callable function to initiate a payment
export const initiatePayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "error.unauthenticated",
    );
  }

  try {
    return await _internalInitiatePayment(data, context);
  } catch (error) {
    console.error(`Error during payment initiation for order ${data.orderId}:`, error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
      "internal",
      "error.internal",
      error,
    );
  }
});

// Callable function for users to log manual financial transactions
export const logFinancialTransaction = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "error.unauthenticated",
      );
    }

    const callerUid = context.auth.uid;
    const {type, amount, currency, description, category, date} = data;

    const validTypes = ["income", "expense"];
    if (!type || typeof type !== "string" || !validTypes.includes(type)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "error.type.invalid",
      );
    }
    if (amount === undefined || typeof amount !== "number" || amount <= 0) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "error.amount.invalid",
      );
    }
    if (!currency || typeof currency !== "string") {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "error.currency.required",
      );
    }
    if (!description || typeof description !== "string") {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "error.description.required",
      );
    }

    try {
      console.log(
        `Logging financial transaction for user ${callerUid}: ${type} ${amount} ${currency} - ${description}`,
      );

      const userRef = db.collection("users").doc(callerUid);

      const newTransactionRef = db.collection("financial_transactions").doc();
      const transactionId = newTransactionRef.id;

      await newTransactionRef.set({
        transactionId: transactionId,
        userRef: userRef,
        type: type,
        amount: amount,
        currency: currency,
        description: description,
        category: category || "Uncategorized",
        timestamp: date ? admin.firestore.Timestamp.fromDate(new Date(date)) : admin.firestore.FieldValue.serverTimestamp(),
        linkedOrderId: null,
        linkedLoanApplicationId: null,
        linkedGrantApplicationId: null,
        linkedCrowdfundingProjectId: null,
      });
      console.log(
        `Financial transaction ${transactionId} logged for user ${callerUid}.`,
      );

      return {transactionId, status: "transaction_logged"};
    } catch (error) {
      console.error(
        `Error logging financial transaction for user ${callerUid}:`,
        error,
      );
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      throw new functions.https.HttpsError(
        "internal",
        "error.internal",
        error,
      );
    }
  },
);

/**
 * Fetches financial summary and recent transactions for the authenticated user.
 * @param {any} data The data for the function call.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{summary: any, transactions: any[]}>} A promise that resolves with the financial summary and transactions.
 */
export const getFinancialSummaryAndTransactions = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "error.unauthenticated",
      );
    }

    const userId = context.auth.uid;
    
    try {
      const transactionsRef = db.collection("financial_transactions");
      const userDocRef = db.collection("users").doc(userId);
      // 1. Fetch ALL transactions for the user
      const q = transactionsRef
        .where("userRef", "==", userDocRef)
        .orderBy("timestamp", "desc");

      const allTransactionsSnapshot = await q.get();

      let totalIncome = 0;
      let totalExpense = 0;
      const allTransactions: any[] = [];

      // 2. & 3. Iterate once through all transactions
      allTransactionsSnapshot.forEach((doc) => {
        const tx = doc.data();
        if (tx.type === "income") {
          totalIncome += tx.amount;
        } else if (tx.type === "expense") {
          totalExpense += tx.amount;
        }

        // Convert timestamp for client and add to full list
        allTransactions.push({
          id: doc.id,
          ...tx,
          timestamp: (tx.timestamp as admin.firestore.Timestamp)?.toDate?.().toISOString() ?? null,
        });
      });

      // 4. Create summary object
      const summary = {
        totalIncome,
        totalExpense,
        netFlow: totalIncome - totalExpense,
      };

      // 5. Return summary and sliced list of recent transactions
      return {summary, transactions: allTransactions.slice(0, 10)};
    } catch (error) {
      console.error("Error fetching financial summary:", error);
      throw new functions.https.HttpsError(
        "internal",
        "error.financialData.fetchFailed",
      );
    }
  },
);

const checkFiAuth = async (context: functions.https.CallableContext) => {
    const uid = context.auth?.uid;
    if (!uid) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }

    const userDoc = await db.collection("users").doc(uid).get();
    const userRole = userDoc.data()?.primaryRole;
    
    if (userRole !== 'Financial Institution (Micro-finance/Loans)') {
         throw new functions.https.HttpsError("permission-denied", "You are not authorized to perform this action.");
    }
    
    return uid;
};

export const getFinancialApplicationDetails = functions.https.onCall(async (data, context) => {
    checkAuth(context); // General auth check first
    const { applicationId } = data;
    if (!applicationId) {
        throw new functions.https.HttpsError('invalid-argument', 'Application ID is required.');
    }

    const appRef = db.collection('financial_applications').doc(applicationId);
    const appDoc = await appRef.get();

    if (!appDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Application not found.');
    }

    const appData = appDoc.data()!;
    let applicantProfile = null;

    if (appData.applicantId) {
        const profileDoc = await db.collection('users').doc(appData.applicantId).get();
        if (profileDoc.exists) {
            const profileData = profileDoc.data()!;
            applicantProfile = {
                id: profileDoc.id,
                ...profileData,
                createdAt: (profileData.createdAt as admin.firestore.Timestamp)?.toDate?.().toISOString() ?? null,
                updatedAt: (profileData.updatedAt as admin.firestore.Timestamp)?.toDate?.().toISOString() ?? null,
            };
        }
    }
    
    const serializedAppData = {
        ...appData,
        id: appDoc.id,
        submittedAt: (appData.submittedAt as admin.firestore.Timestamp)?.toDate?.().toISOString() ?? null,
    };

    return { application: serializedAppData, applicant: applicantProfile };
});

export const updateFinancialApplicationStatus = functions.https.onCall(async (data, context) => {
    await checkFiAuth(context);
    const { applicationId, status } = data;

    if (!applicationId || !status) {
        throw new functions.https.HttpsError('invalid-argument', 'Application ID and a new status are required.');
    }
    
    const validStatuses = ['Approved', 'Rejected', 'More Info Required'];
    if (!validStatuses.includes(status)) {
         throw new functions.https.HttpsError('invalid-argument', 'Invalid status provided.');
    }

    const appRef = db.collection('financial_applications').doc(applicationId);
    
    await appRef.update({
        status: status,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true, message: `Application status updated to ${status}.` };
});


export const submitFinancialApplication = functions.https.onCall(async (data, context) => {
    const applicantId = checkAuth(context);
    const { fiId, type, amount, currency, purpose } = data;

    // Basic validation
    if (!fiId || !type || !amount || !purpose) {
        throw new functions.https.HttpsError("invalid-argument", "Missing required application fields.");
    }
    
    const applicantDoc = await db.collection("users").doc(applicantId).get();
    if (!applicantDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Applicant profile not found.");
    }
    const applicantName = applicantDoc.data()?.displayName || "Unknown Applicant";

    const applicationRef = db.collection("financial_applications").doc();
    await applicationRef.set({
        applicantId: applicantId,
        applicantName: applicantName,
        fiId: fiId,
        type: type,
        amount: Number(amount),
        currency: currency || "USD",
        status: "Pending", // Initial status
        purpose: purpose,
        submittedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, applicationId: applicationRef.id };
});

export const createFinancialProduct = functions.https.onCall(async (data, context) => {
    const fiId = await checkFiAuth(context); // Reuse the auth check for FIs
    const { name, type, description, interestRate, maxAmount, targetRoles } = data;

    if (!name || !type || !description) {
        throw new functions.https.HttpsError("invalid-argument", "Name, type, and description are required.");
    }

    const productRef = db.collection("financial_products").doc();
    await productRef.set({
        fiId,
        name,
        type,
        description,
        interestRate: type === 'Loan' ? interestRate : null,
        maxAmount: maxAmount || null,
        targetRoles: targetRoles || [],
        status: 'Active',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, productId: productRef.id };
});

export const getFinancialProducts = functions.https.onCall(async (data, context) => {
    const fiId = await checkFiAuth(context);

    const productsSnapshot = await db.collection("financial_products")
        .where("fiId", "==", fiId)
        .orderBy("createdAt", "desc")
        .get();

    const products = productsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as admin.firestore.Timestamp)?.toDate?.().toISOString(),
            updatedAt: (data.updatedAt as admin.firestore.Timestamp)?.toDate?.().toISOString(),
        }
    });
    
    return { products };
});
    

export const getFinancialInstitutions = functions.https.onCall(async (data, context) => {
    checkAuth(context);
    const fiSnapshot = await db.collection("users").where("primaryRole", "==", "Financial Institution (Micro-finance/Loans)").get();
    
    const fis = fiSnapshot.docs.map(doc => ({
        id: doc.id,
        displayName: doc.data().displayName,
    }));

    return fis;
});

export const getFiApplications = functions.https.onCall(async (data, context) => {
    const fiId = await checkFiAuth(context);
    const { status } = data; // e.g., "Pending", "Approved", "All"

    let query: admin.firestore.Query = db.collection("financial_applications").where("fiId", "==", fiId);

    if (status && status !== 'All') {
        query = query.where("status", "==", status);
    }

    query = query.orderBy("submittedAt", "desc");

    const snapshot = await query.get();
    
    const applications = snapshot.docs.map(doc => {
        const appData = doc.data();
        return {
            ...appData,
            id: doc.id,
            submittedAt: (appData.submittedAt as admin.firestore.Timestamp)?.toDate?.().toISOString() ?? null,
        }
    });

    return { applications };
});

export const getFarmerApplications = functions.https.onCall(async (data, context) => {
    const farmerId = checkAuth(context);
    
    const query = db.collection("financial_applications")
        .where("applicantId", "==", farmerId)
        .orderBy("submittedAt", "desc");

    const snapshot = await query.get();

    const applications = snapshot.docs.map(doc => {
        const appData = doc.data();
        return {
            ...appData,
            id: doc.id,
            submittedAt: (appData.submittedAt as admin.firestore.Timestamp)?.toDate?.().toISOString() ?? null,
        }
    });

    return { applications };
});
