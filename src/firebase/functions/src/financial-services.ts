

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { getProfileByIdFromDB as getProfileByIdFromDBFunction } from "./user";
import { getUserEngagementStats } from "./activity";

const db = admin.firestore();

const checkAuth = (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
  }
  return context.auth.uid;
};

// --- Internal AI-Driven Functions (moved from ai-and-analytics.ts) ---

/**
 * Internal logic for assessing credit risk based on the 5 Cs of Credit.
 * @param {any} data The data payload for assessment.
 * @return {Promise<object>} An object with the calculated credit score
 * and a detailed breakdown of contributing factors.
 */
export async function _internalAssessCreditRisk(data: any) {
  console.log("_internalAssessCreditRisk called with data for user:", data.userId);
  
  const { userData, financialData, assetData, engagementData } = data;

  // --- 1. Character (Weight: 20%) ---
  const characterFactors: string[] = [];
  let characterScore = 0;
  
  const totalEngagements = (engagementData.postLikes || 0) + (engagementData.postComments || 0);
  if (totalEngagements > 50) {
      characterScore += 10;
      characterFactors.push("High community engagement on posts.");
  } else if (totalEngagements > 10) {
      characterScore += 5;
      characterFactors.push("Moderate community engagement.");
  } else {
      characterFactors.push("Limited community engagement.");
  }
  
  if (engagementData.profileViews > 100) {
      characterScore += 10;
      characterFactors.push("High number of profile views, indicating network interest.");
  } else if (engagementData.profileViews > 20) {
      characterScore += 5;
      characterFactors.push("Some profile views from the network.");
  }


  // --- 2. Capacity (Weight: 30%) ---
  // A simple cash flow simulation based on financial transactions.
  const income = financialData.totalIncome || 0;
  const expenses = financialData.totalExpense || 0;
  const netCashFlow = income - expenses;
  let capacityScore = 0;
  const capacityFactors: string[] = [];
  if (netCashFlow > expenses * 0.5 && expenses > 0) { // Healthy margin
      capacityScore = 30;
      capacityFactors.push("Strong positive cash flow from farm operations.");
  } else if (netCashFlow > 0) { // Positive but small margin
      capacityScore = 15;
      capacityFactors.push("Positive cash flow, but with tight margins.");
  } else {
      capacityScore = -10;
      capacityFactors.push("Negative cash flow detected, indicating high risk.");
  }
   capacityFactors.push(`Income: $${income.toFixed(2)}, Expenses: $${expenses.toFixed(2)}`);

  // --- 3. Capital (Weight: 15%) ---
  // Based on the value of owned assets.
  const totalAssetValue = assetData.reduce((sum: number, asset: any) => sum + (asset.value || 0), 0);
  let capitalScore = 0;
  const capitalFactors: string[] = [];
  if (totalAssetValue > 10000) {
      capitalScore = 15;
      capitalFactors.push("Significant capital invested in farm assets.");
  } else if (totalAssetValue > 2000) {
      capitalScore = 10;
      capitalFactors.push("Moderate capital investment in farm assets.");
  } else {
      capitalScore = 0;
      capitalFactors.push("Low level of owned capital assets.");
  }
  capitalFactors.push(`Total Asset Value: $${totalAssetValue.toFixed(2)}`);


  // --- 4. Collateral (Weight: 20%) ---
  // Similar to Capital for this simulation. A real app would differentiate pledgeable assets.
  let collateralScore = 0;
  const collateralFactors: string[] = [];
   if (totalAssetValue > 15000) {
      collateralScore = 20;
      collateralFactors.push("High value of assets available as potential collateral.");
  } else if (totalAssetValue > 5000) {
      collateralScore = 10;
      collateralFactors.push("Some assets available that could serve as collateral.");
  } else {
      collateralScore = 0;
      collateralFactors.push("Limited assets available for collateral.");
  }

  // --- 5. Conditions (Weight: 15%) ---
  // Placeholder: This would analyze market trends for the user's primary crops.
  const conditionsScore = 15;
  const conditionsFactors = ["Farmer is operating in a stable market for their primary crop (e.g., coffee)."];
  
  // --- Final Score Calculation ---
  const finalScore = characterScore + capacityScore + capitalScore + collateralScore + conditionsScore;

  return {
    score: finalScore,
    breakdown: [
        { name: 'Character', score: characterScore, weight: 20, factors: characterFactors },
        { name: 'Capacity', score: capacityScore, weight: 30, factors: capacityFactors },
        { name: 'Capital', score: capitalScore, weight: 15, factors: capitalFactors },
        { name: 'Collateral', score: collateralScore, weight: 20, factors: collateralFactors },
        { name: 'Conditions', score: conditionsScore, weight: 15, factors: conditionsFactors },
    ],
    status: "detailed_analysis_complete",
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
    const {type, amount, currency, description, category, date } = data;

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
    if(!date) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "error.date.required",
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
        timestamp: admin.firestore.Timestamp.fromDate(new Date(date)),
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
    const userId = checkAuth(context);
    
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
    const fiId = await checkFiAuth(context);
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
    // Security check: Make sure the FI is the one assigned to this application
    if (appData.fiId !== fiId) {
        throw new functions.https.HttpsError('permission-denied', 'You are not authorized to view this application.');
    }

    let applicantProfile = null;
    let financialData = null;
    let assetData = null;
    let engagementData = null;

    if (appData.applicantId) {
        // Fetch applicant's profile
        const result = await getProfileByIdFromDBFunction({ uid: appData.applicantId }, context as any);
        applicantProfile = result as any;
        
        // Fetch applicant's financial summary
        const financialSummaryResult = await getFinancialSummaryAndTransactions({ userId: appData.applicantId }, context);
        financialData = financialSummaryResult.summary;
        
        // Fetch applicant's assets
        const assetsSnapshot = await db.collection(`users/${appData.applicantId}/assets`).get();
        assetData = assetsSnapshot.docs.map(doc => doc.data());
        
        // Fetch applicant's engagement stats
        const engagementStatsResult = await getUserEngagementStats({ userId: appData.applicantId }, context);
        engagementData = engagementStatsResult;
    }
    
    // Generate the credit score with all available data
    const creditScore = await _internalAssessCreditRisk({ 
        userId: appData.applicantId,
        userData: applicantProfile,
        financialData: financialData,
        assetData: assetData,
        engagementData: engagementData
    });
    
    const serializedAppData = {
        ...appData,
        id: appDoc.id,
        submittedAt: (appData.submittedAt as admin.firestore.Timestamp)?.toDate?.().toISOString() ?? null,
    };

    return { application: serializedAppData, applicant: applicantProfile, creditScore };
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
