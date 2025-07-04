
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

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

// Firestore trigger to calculate the DamDoh Credit Score
export const calculateDamDohCreditScore = functions.firestore
  .document("financial_transactions/{transactionId}")
  .onCreate(async (snapshot, context) => {
    console.log("Triggered calculateDamDohCreditScore (placeholder).");

    const userId = snapshot.data()?.userRef?.id;

    if (!userId) {
      console.warn(
        "Could not identify user from trigger data. Skipping score calculation.",
      );
      return null;
    }

    try {
      console.log(`Calculating DamDoh Credit Score for user ${userId}...`);
      const userRef = db.collection("users").doc(userId);
      const userDoc = await userRef.get();
      const userData = userDoc.exists ? userDoc.data() : null;

      if (!userData) {
        console.warn(
          `User document not found for ${userId}. Skipping score calculation.`,
        );
        return null;
      }

      const relevantData = {
        userData: userData,
      };
      console.log("Sending data to Module 8 AI for score calculation...");
      const scoreResult = await _internalAssessCreditRisk(relevantData);

      const calculatedScore = scoreResult.score;
      const riskFactors = scoreResult.riskFactors;

      await db
        .collection("credit_scores")
        .doc(userId)
        .set(
          {
            userId: userId,
            userRef: userRef,
            score: calculatedScore,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
            riskFactors: riskFactors,
          },
          {merge: true},
        );

      console.log(`Credit score for user ${userId} updated.`);
      return null;
    } catch (error) {
      console.error(`Error calculating credit score for user ${userId}:`, error);
      return null;
    }
  });

// Triggered function to match users with funding opportunities
export const matchFundingOpportunities = functions.firestore
  .document("credit_scores/{userId}")
  .onUpdate(async (change, context) => {
    console.log("Triggered matchFundingOpportunities by credit score update.");
    const relevantUserId = context.params.userId;

    if (!relevantUserId) {
      console.warn(
        "Could not identify relevant entity from trigger data. Skipping matching.",
      );
      return null;
    }

    try {
      console.log(`Matching funding opportunities for user ${relevantUserId}...`);

      console.log("Fetching user data and score...");
      const userDoc = await db.collection("users").doc(relevantUserId).get();
      const userScoreDoc = await db
        .collection("credit_scores")
        .doc(relevantUserId)
        .get();

      if (!userDoc.exists || !userScoreDoc.exists) {
        console.warn(
          `User document or credit score not found for ${relevantUserId}. Skipping matching.`,
        );
        return null;
      }
      const userData = userDoc.data();
      const userCreditScore = userScoreDoc.data()?.score;

      if (userCreditScore === undefined || userCreditScore === null) {
        console.warn(
          `Credit score not available for user ${relevantUserId}. Skipping matching.`,
        );
        return null;
      }

      const userProfileDataForMatching = {
        userId: relevantUserId,
        role: userData?.primaryRole,
        location: userData?.location,
        financialNeeds: userData?.financialNeeds || [],
        creditScore: userCreditScore,
      };
      console.log("User profile data for matching:", userProfileDataForMatching);

      console.log("Fetching available funding opportunities...");
      const loanProductsSnapshot = await db
        .collection("loan_products")
        .where("status", "==", "open")
        .get();
      const grantProgramsSnapshot = await db
        .collection("grant_programs")
        .where("status", "==", "open")
        .get();
      const crowdfundingProjectsSnapshot = await db
        .collection("crowdfunding_projects")
        .where("status", "==", "open")
        .get();

      const availableOpportunities = [
        ...loanProductsSnapshot.docs.map((doc) => ({
          id: doc.id,
          type: "loan_product",
          ...doc.data(),
        })),
        ...grantProgramsSnapshot.docs.map((doc) => ({
          id: doc.id,
          type: "grant_program",
          ...doc.data(),
        })),
        ...crowdfundingProjectsSnapshot.docs.map((doc) => ({
          id: doc.id,
          type: "crowdfunding_project",
          ...doc.data(),
        })),
      ];

      console.log(
        `Found ${availableOpportunities.length} available funding opportunities.`,
      );

      if (availableOpportunities.length === 0) {
        console.log("No available opportunities to match. Skipping matching.");
        await db
          .collection("user_funding_recommendations")
          .doc(relevantUserId)
          .set(
            {
              userId: relevantUserId,
              recommendations: [],
              lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
            },
            {merge: true},
          );
        return null;
      }

      console.log("Sending data to Module 8 AI for matching...");

      const matchedOpportunitiesResult = await _internalMatchFundingOpportunities({
        user: userProfileDataForMatching,
        opportunities: availableOpportunities,
      });

      const matchedOpportunities =
        matchedOpportunitiesResult.matchedOpportunities || [];
      console.log(
        `Received ${matchedOpportunities.length} matched opportunities for ${relevantUserId}.`,
      );
      if (matchedOpportunities.length > 0) {
        console.log(
          `Matched opportunity IDs: ${matchedOpportunities
            .map((opp) => opp.opportunityId)
            .join(", ")}`,
        );
      }

      await db
        .collection("user_funding_recommendations")
        .doc(relevantUserId)
        .set(
          {
            userId: relevantUserId,
            recommendations: matchedOpportunities,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
          },
          {merge: true},
        );
      console.log(
        `Stored ${matchedOpportunities.length} funding recommendations for user ${relevantUserId}.`,
      );

      console.log(
        `Triggered notification for user ${relevantUserId} about new funding opportunities.`,
      );

      return null;
    } catch (error) {
      console.error(
        `Error matching funding opportunities for ${relevantUserId}:`,
        error,
      );
      return null;
    }
  });

// Callable function to process a crowdfunding investment
export const processCrowdfundingInvestment = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "error.unauthenticated",
      );
    }

    const investorUid = context.auth.uid;
    const {projectId, amount, currency} = data;

    if (!projectId || typeof projectId !== "string") {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "error.projectId.required",
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

    try {
      const projectRef = db.collection("crowdfunding_projects").doc(projectId);
      const investorRef = db.collection("users").doc(investorUid);

      console.log(
        `Recording investment for project ${projectId} by user ${investorUid}...`,
      );

      await db.runTransaction(async (transaction) => {
        const projectDoc = await transaction.get(projectRef);

        if (!projectDoc.exists) {
          throw new functions.https.HttpsError(
            "not-found",
            "error.project.notFound",
          );
        }

        const projectData = projectDoc.data();
        const currentRaised = projectData?.currentRaised || 0;
        const targetAmount = projectData?.targetAmount || 0;

        if (
          projectData?.status !== "open" ||
          currentRaised >= targetAmount
        ) {
          throw new functions.https.HttpsError(
            "failed-precondition",
            "error.project.notOpen",
          );
        }

        const newCurrentRaised = currentRaised + amount;

        transaction.update(projectRef, {
          currentRaised: newCurrentRaised,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          status:
            newCurrentRaised >= targetAmount ? "funded" : projectData.status,
        });
        console.log(
          `Transaction: Updated currentRaised for project ${projectId} from ${currentRaised} to ${newCurrentRaised}.`,
        );

        const newInvestmentRef = projectRef.collection("investments").doc();
        transaction.set(newInvestmentRef, {
          investmentId: newInvestmentRef.id,
          investorRef: investorRef,
          amount: amount,
          currency: currency,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(
          `Transaction: Recorded investment ${newInvestmentRef.id} for project ${projectId}.`,
        );
      });

      console.log(
        `Investment of ${amount} ${currency} recorded for project ${projectId} by user ${investorUid}.`,
      );

      console.log("Initiating payment for the investment...");
      await _internalInitiatePayment(
        {
          orderId: `invest_${projectId}_${Date.now()}`,
          amount: amount,
          currency: currency,
          buyerInfo: {userId: investorUid},
          sellerInfo: {projectId: projectId},
          description: `Investment in project ${projectId}`,
          type: "investment_payment",
        },
        context,
      );

      console.log("Payment initiation for investment placeholder completed.");

      return {
        projectId,
        amount,
        status: "investment_recorded_and_payment_initiated",
      };
    } catch (error) {
      console.error(
        `Error processing crowdfunding investment for project ${projectId} by user ${investorUid}:`,
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

// Triggered function to distribute payouts to crowdfunding investors
export const distributeCrowdfundingPayouts = functions.firestore
  .document("crowdfunding_projects/{projectId}")
  .onUpdate(async (change, context) => {
    const projectId = context.params.projectId;
    const projectBefore = change.before.data();
    const projectAfter = change.after.data();

    console.log(
      `Triggered distributeCrowdfundingPayouts for project ${projectId} (placeholder).`,
    );

    const shouldTriggerPayout =
      projectAfter?.status === "completed" &&
      projectBefore?.status !== "completed";

    if (!shouldTriggerPayout) {
      console.log(`Payout trigger conditions not met for project ${projectId}.`);
      return null;
    }

    console.log(`Initiating payout distribution for project ${projectId}...`);

    try {
      console.log(`Fetching investments for project ${projectId}...`);
      const investmentsSnapshot = await db
        .collection("crowdfunding_projects")
        .doc(projectId)
        .collection("investments")
        .get();

      if (investmentsSnapshot.empty) {
        console.log(`No investments found for project ${projectId}. Skipping payout.`);
        return null;
      }

      console.log("Calculating payouts...");
      const totalInvested = investmentsSnapshot.docs.reduce(
        (sum, doc) => sum + (doc.data().amount || 0),
        0,
      );
      const totalPayoutAmount = totalInvested * 1.1;

      const payoutPromises: Promise<any>[] = [];

      investmentsSnapshot.docs.forEach((investmentDoc) => {
        const investmentData = investmentDoc.data();
        const investmentAmount = investmentData.amount || 0;
        const investorRef = investmentData.investorRef as admin.firestore.DocumentReference;
        const investorUid = investorRef.id;

        const individualPayout =
          (investmentAmount / totalInvested) * totalPayoutAmount;

        console.log(
          `Calculating payout for investor ${investorUid}: ${individualPayout} ${investmentData.currency}`,
        );

        console.log(`Initiating payout payment for investor ${investorUid}...`);

        payoutPromises.push(
          _internalInitiatePayment({
            orderId: `payout_${projectId}_${investmentDoc.id}`,
            amount: individualPayout,
            currency: investmentData.currency,
            buyerInfo: {userId: investorUid},
            sellerInfo: {projectId: projectId},
            description: `Payout for investment in project ${projectId}`,
            type: "crowdfunding_payout",
          }),
        );

        console.log(
          `Recording payout transaction for investor ${investorUid}...`,
        );
        const payoutTransactionRef = db.collection("financial_transactions").doc();
        payoutPromises.push(
          payoutTransactionRef.set({
            transactionId: payoutTransactionRef.id,
            userRef: investorRef,
            type: "payout",
            amount: individualPayout,
            currency: investmentData.currency,
            description: `Payout from crowdfunding project ${projectId}`,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            linkedCrowdfundingProjectId: projectId,
            linkedInvestmentId: investmentDoc.id,
          }),
        );
      });

      await Promise.all(payoutPromises);
      console.log(
        `Payout distribution initiated and transactions recorded for project ${projectId}.`,
      );

      return null;
    } catch (error) {
      console.error(
        `Error distributing payouts for project ${projectId}:`,
        error,
      );
      return null;
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
    const {type, amount, currency, description, category} = data;

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
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
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
      const q = transactionsRef
        .where("userRef", "==", userDocRef)
        .orderBy("timestamp", "desc")
        .limit(10); // Limit to the last 10 transactions for the dashboard

      const querySnapshot = await q.get();

      let totalIncome = 0;
      let totalExpense = 0;
      
      // For summary, we need to fetch ALL transactions, not just the last 10
      const allTransactionsSnapshot = await transactionsRef.where("userRef", "==", userDocRef).get();
      allTransactionsSnapshot.forEach((doc) => {
        const tx = doc.data();
        if (tx.type === 'income') {
          totalIncome += tx.amount;
        } else if (tx.type === 'expense') {
          totalExpense += tx.amount;
        }
      });

      const transactions: any[] = [];
      querySnapshot.forEach((doc) => {
        const tx = doc.data();
        // Convert timestamp for client
        transactions.push({
          id: doc.id,
          ...tx,
          timestamp: tx.timestamp?.toDate ? tx.timestamp.toDate().toISOString() : null,
        });
      });

      const summary = {
        totalIncome,
        totalExpense,
        netFlow: totalIncome - totalExpense,
      };

      return {summary, transactions};
    } catch (error) {
      console.error("Error fetching financial summary:", error);
      throw new functions.https.HttpsError(
        "internal",
        "error.financialData.fetchFailed",
      );
    }
  },
);
