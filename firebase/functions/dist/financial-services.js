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
exports.getFinancialSummaryAndTransactions = exports.logFinancialTransaction = exports.distributeCrowdfundingPayouts = exports.processCrowdfundingInvestment = exports.matchFundingOpportunities = exports.calculateDamDohCreditScore = exports.initiatePayment = void 0;
exports._internalInitiatePayment = _internalInitiatePayment;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const ai_and_analytics_1 = require("./ai-and-analytics");
const db = admin.firestore();
/**
 * Internal logic for initiating a payment.
 * @param {any} data The data for the payment.
 * @param {functions.https.CallableContext} [context] The context of the function call.
 * @return {Promise<{orderId: string, status: string, transactionId: string}>} A promise that resolves with the payment details.
 */
async function _internalInitiatePayment(data, context) {
    const { orderId, amount, currency } = data;
    if (!orderId || typeof orderId !== "string") {
        throw new functions.https.HttpsError("invalid-argument", "The 'orderId' parameter is required.");
    }
    if (amount === undefined || typeof amount !== "number" || amount <= 0) {
        throw new functions.https.HttpsError("invalid-argument", "The 'amount' parameter is required, must be a number, and greater than zero.");
    }
    if (!currency || typeof currency !== "string") {
        throw new functions.https.HttpsError("invalid-argument", "The 'currency' parameter is required.");
    }
    console.log(`Attempting to initiate payment for order ${orderId} (Amount: ${amount} ${currency})...`);
    console.log("Placeholder for payment gateway API call...");
    const paymentGatewayResponse = {
        success: true,
        transactionId: `pg_txn_${orderId}_${Date.now()}`,
    };
    if (paymentGatewayResponse.success) {
        console.log(`Payment initiation successful for order ${orderId}. Transaction ID: ${paymentGatewayResponse.transactionId}`);
        return {
            orderId: orderId,
            status: "payment_initiation_successful",
            transactionId: paymentGatewayResponse.transactionId,
        };
    }
    else {
        console.error(`Payment initiation failed for order ${orderId}.`);
        throw new functions.https.HttpsError("aborted", "Payment initiation failed with gateway.");
    }
}
// Callable function to initiate a payment
exports.initiatePayment = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Caller must be authenticated.");
    }
    try {
        return await _internalInitiatePayment(data, context);
    }
    catch (error) {
        console.error(`Error during payment initiation for order ${data.orderId}:`, error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "An internal error occurred during payment initiation.", error);
    }
});
// Firestore trigger to calculate the DamDoh Credit Score
exports.calculateDamDohCreditScore = functions.firestore
    .document("financial_transactions/{transactionId}")
    .onCreate(async (snapshot, context) => {
    var _a, _b;
    console.log("Triggered calculateDamDohCreditScore (placeholder).");
    const userId = (_b = (_a = snapshot.data()) === null || _a === void 0 ? void 0 : _a.userRef) === null || _b === void 0 ? void 0 : _b.id;
    if (!userId) {
        console.warn("Could not identify user from trigger data. Skipping score calculation.");
        return null;
    }
    try {
        console.log(`Calculating DamDoh Credit Score for user ${userId}...`);
        const userRef = db.collection("users").doc(userId);
        const userDoc = await userRef.get();
        const userData = userDoc.exists ? userDoc.data() : null;
        if (!userData) {
            console.warn(`User document not found for ${userId}. Skipping score calculation.`);
            return null;
        }
        const relevantData = {
            userData: userData,
        };
        console.log("Sending data to Module 8 AI for score calculation...");
        const scoreResult = await (0, ai_and_analytics_1._internalAssessCreditRisk)(relevantData);
        const calculatedScore = scoreResult.score;
        const riskFactors = scoreResult.riskFactors;
        await db
            .collection("credit_scores")
            .doc(userId)
            .set({
            userId: userId,
            userRef: userRef,
            score: calculatedScore,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
            riskFactors: riskFactors,
        }, { merge: true });
        console.log(`Credit score for user ${userId} updated.`);
        return null;
    }
    catch (error) {
        console.error(`Error calculating credit score for user ${userId}:`, error);
        return null;
    }
});
// Triggered function to match users with funding opportunities
exports.matchFundingOpportunities = functions.firestore
    .document("credit_scores/{userId}")
    .onUpdate(async (change, context) => {
    var _a;
    console.log("Triggered matchFundingOpportunities by credit score update.");
    const relevantUserId = context.params.userId;
    if (!relevantUserId) {
        console.warn("Could not identify relevant entity from trigger data. Skipping matching.");
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
            console.warn(`User document or credit score not found for ${relevantUserId}. Skipping matching.`);
            return null;
        }
        const userData = userDoc.data();
        const userCreditScore = (_a = userScoreDoc.data()) === null || _a === void 0 ? void 0 : _a.score;
        if (userCreditScore === undefined || userCreditScore === null) {
            console.warn(`Credit score not available for user ${relevantUserId}. Skipping matching.`);
            return null;
        }
        const userProfileDataForMatching = {
            userId: relevantUserId,
            role: userData === null || userData === void 0 ? void 0 : userData.primaryRole,
            location: userData === null || userData === void 0 ? void 0 : userData.location,
            financialNeeds: (userData === null || userData === void 0 ? void 0 : userData.financialNeeds) || [],
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
            ...loanProductsSnapshot.docs.map((doc) => (Object.assign({ id: doc.id, type: "loan_product" }, doc.data()))),
            ...grantProgramsSnapshot.docs.map((doc) => (Object.assign({ id: doc.id, type: "grant_program" }, doc.data()))),
            ...crowdfundingProjectsSnapshot.docs.map((doc) => (Object.assign({ id: doc.id, type: "crowdfunding_project" }, doc.data()))),
        ];
        console.log(`Found ${availableOpportunities.length} available funding opportunities.`);
        if (availableOpportunities.length === 0) {
            console.log("No available opportunities to match. Skipping matching.");
            await db
                .collection("user_funding_recommendations")
                .doc(relevantUserId)
                .set({
                userId: relevantUserId,
                recommendations: [],
                lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
            }, { merge: true });
            return null;
        }
        console.log("Sending data to Module 8 AI for matching...");
        const matchedOpportunitiesResult = await (0, ai_and_analytics_1._internalMatchFundingOpportunities)({
            user: userProfileDataForMatching,
            opportunities: availableOpportunities,
        });
        const matchedOpportunities = matchedOpportunitiesResult.matchedOpportunities || [];
        console.log(`Received ${matchedOpportunities.length} matched opportunities for ${relevantUserId}.`);
        if (matchedOpportunities.length > 0) {
            console.log(`Matched opportunity IDs: ${matchedOpportunities
                .map((opp) => opp.opportunityId)
                .join(", ")}`);
        }
        await db
            .collection("user_funding_recommendations")
            .doc(relevantUserId)
            .set({
            userId: relevantUserId,
            recommendations: matchedOpportunities,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        console.log(`Stored ${matchedOpportunities.length} funding recommendations for user ${relevantUserId}.`);
        console.log(`Triggered notification for user ${relevantUserId} about new funding opportunities.`);
        return null;
    }
    catch (error) {
        console.error(`Error matching funding opportunities for ${relevantUserId}:`, error);
        return null;
    }
});
// Callable function to process a crowdfunding investment
exports.processCrowdfundingInvestment = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated to invest.");
    }
    const investorUid = context.auth.uid;
    const { projectId, amount, currency } = data;
    if (!projectId || typeof projectId !== "string") {
        throw new functions.https.HttpsError("invalid-argument", "The 'projectId' parameter is required.");
    }
    if (amount === undefined || typeof amount !== "number" || amount <= 0) {
        throw new functions.https.HttpsError("invalid-argument", "The 'amount' parameter is required, must be a number, and greater than zero.");
    }
    if (!currency || typeof currency !== "string") {
        throw new functions.https.HttpsError("invalid-argument", "The 'currency' parameter is required.");
    }
    try {
        const projectRef = db.collection("crowdfunding_projects").doc(projectId);
        const investorRef = db.collection("users").doc(investorUid);
        console.log(`Recording investment for project ${projectId} by user ${investorUid}...`);
        await db.runTransaction(async (transaction) => {
            const projectDoc = await transaction.get(projectRef);
            if (!projectDoc.exists) {
                throw new functions.https.HttpsError("not-found", `Crowdfunding project with ID ${projectId} not found.`);
            }
            const projectData = projectDoc.data();
            const currentRaised = (projectData === null || projectData === void 0 ? void 0 : projectData.currentRaised) || 0;
            const targetAmount = (projectData === null || projectData === void 0 ? void 0 : projectData.targetAmount) || 0;
            if ((projectData === null || projectData === void 0 ? void 0 : projectData.status) !== "open" ||
                currentRaised >= targetAmount) {
                throw new functions.https.HttpsError("failed-precondition", `Project ${projectId} is not open for investment.`);
            }
            const newCurrentRaised = currentRaised + amount;
            transaction.update(projectRef, {
                currentRaised: newCurrentRaised,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                status: newCurrentRaised >= targetAmount ? "funded" : projectData.status,
            });
            console.log(`Transaction: Updated currentRaised for project ${projectId} from ${currentRaised} to ${newCurrentRaised}.`);
            const newInvestmentRef = projectRef.collection("investments").doc();
            transaction.set(newInvestmentRef, {
                investmentId: newInvestmentRef.id,
                investorRef: investorRef,
                amount: amount,
                currency: currency,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
            });
            console.log(`Transaction: Recorded investment ${newInvestmentRef.id} for project ${projectId}.`);
        });
        console.log(`Investment of ${amount} ${currency} recorded for project ${projectId} by user ${investorUid}.`);
        console.log("Initiating payment for the investment...");
        await _internalInitiatePayment({
            orderId: `invest_${projectId}_${Date.now()}`,
            amount: amount,
            currency: currency,
            buyerInfo: { userId: investorUid },
            sellerInfo: { projectId: projectId },
            description: `Investment in project ${projectId}`,
            type: "investment_payment",
        }, context);
        console.log("Payment initiation for investment placeholder completed.");
        return {
            projectId,
            amount,
            status: "investment_recorded_and_payment_initiated",
        };
    }
    catch (error) {
        console.error(`Error processing crowdfunding investment for project ${projectId} by user ${investorUid}:`, error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "Unable to process crowdfunding investment.", error);
    }
});
// Triggered function to distribute payouts to crowdfunding investors
exports.distributeCrowdfundingPayouts = functions.firestore
    .document("crowdfunding_projects/{projectId}")
    .onUpdate(async (change, context) => {
    const projectId = context.params.projectId;
    const projectBefore = change.before.data();
    const projectAfter = change.after.data();
    console.log(`Triggered distributeCrowdfundingPayouts for project ${projectId} (placeholder).`);
    const shouldTriggerPayout = (projectAfter === null || projectAfter === void 0 ? void 0 : projectAfter.status) === "completed" &&
        (projectBefore === null || projectBefore === void 0 ? void 0 : projectBefore.status) !== "completed";
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
        const totalInvested = investmentsSnapshot.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
        const totalPayoutAmount = totalInvested * 1.1;
        const payoutPromises = [];
        investmentsSnapshot.docs.forEach((investmentDoc) => {
            const investmentData = investmentDoc.data();
            const investmentAmount = investmentData.amount || 0;
            const investorRef = investmentData.investorRef;
            const investorUid = investorRef.id;
            const individualPayout = (investmentAmount / totalInvested) * totalPayoutAmount;
            console.log(`Calculating payout for investor ${investorUid}: ${individualPayout} ${investmentData.currency}`);
            console.log(`Initiating payout payment for investor ${investorUid}...`);
            payoutPromises.push(_internalInitiatePayment({
                orderId: `payout_${projectId}_${investmentDoc.id}`,
                amount: individualPayout,
                currency: investmentData.currency,
                buyerInfo: { userId: investorUid },
                sellerInfo: { projectId: projectId },
                description: `Payout for investment in project ${projectId}`,
                type: "crowdfunding_payout",
            }));
            console.log(`Recording payout transaction for investor ${investorUid}...`);
            const payoutTransactionRef = db.collection("financial_transactions").doc();
            payoutPromises.push(payoutTransactionRef.set({
                transactionId: payoutTransactionRef.id,
                userRef: investorRef,
                type: "payout",
                amount: individualPayout,
                currency: investmentData.currency,
                description: `Payout from crowdfunding project ${projectId}`,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                linkedCrowdfundingProjectId: projectId,
                linkedInvestmentId: investmentDoc.id,
            }));
        });
        await Promise.all(payoutPromises);
        console.log(`Payout distribution initiated and transactions recorded for project ${projectId}.`);
        return null;
    }
    catch (error) {
        console.error(`Error distributing payouts for project ${projectId}:`, error);
        return null;
    }
});
// Callable function for users to log manual financial transactions
exports.logFinancialTransaction = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated to log a financial transaction.");
    }
    const callerUid = context.auth.uid;
    const { type, amount, currency, description, category } = data;
    const validTypes = ["income", "expense"];
    if (!type || typeof type !== "string" || !validTypes.includes(type)) {
        throw new functions.https.HttpsError("invalid-argument", `The 'type' parameter is required and must be one of: ${validTypes.join(", ")}.`);
    }
    if (amount === undefined || typeof amount !== "number" || amount <= 0) {
        throw new functions.https.HttpsError("invalid-argument", "The 'amount' parameter is required, must be a number, and greater than zero.");
    }
    if (!currency || typeof currency !== "string") {
        throw new functions.https.HttpsError("invalid-argument", "The 'currency' parameter is required.");
    }
    if (!description || typeof description !== "string") {
        throw new functions.https.HttpsError("invalid-argument", "The 'description' parameter is required.");
    }
    try {
        console.log(`Logging financial transaction for user ${callerUid}: ${type} ${amount} ${currency} - ${description}`);
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
        console.log(`Financial transaction ${transactionId} logged for user ${callerUid}.`);
        return { transactionId, status: "transaction_logged" };
    }
    catch (error) {
        console.error(`Error logging financial transaction for user ${callerUid}:`, error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "Unable to log financial transaction.", error);
    }
});
/**
 * Fetches financial summary and recent transactions for the authenticated user.
 * @param {any} data The data for the function call.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{summary: any, transactions: any[]}>} A promise that resolves with the financial summary and transactions.
 */
exports.getFinancialSummaryAndTransactions = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
    }
    const userId = context.auth.uid;
    try {
        const transactionsRef = db.collection("financial_transactions");
        const userDocRef = db.collection("users").doc(userId);
        const q = transactionsRef
            .where("userRef", "==", userDocRef)
            .orderBy("timestamp", "desc");
        const querySnapshot = await q.get();
        let totalIncome = 0;
        let totalExpense = 0;
        const transactions = [];
        querySnapshot.forEach((doc) => {
            var _a;
            const tx = doc.data();
            if (tx.type === "income") {
                totalIncome += tx.amount;
            }
            else if (tx.type === "expense") {
                totalExpense += tx.amount;
            }
            // Convert timestamp for client
            transactions.push(Object.assign(Object.assign({ id: doc.id }, tx), { timestamp: ((_a = tx.timestamp) === null || _a === void 0 ? void 0 : _a.toDate) ? tx.timestamp.toDate().toISOString() : null }));
        });
        const summary = {
            totalIncome,
            totalExpense,
            netFlow: totalIncome - totalExpense,
        };
        return { summary, transactions: transactions.slice(0, 10) }; // Return summary and last 10 transactions
    }
    catch (error) {
        console.error("Error fetching financial summary:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch financial data.");
    }
});
//# sourceMappingURL=financial-services.js.map