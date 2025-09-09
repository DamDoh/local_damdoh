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
exports.getFiApplications = exports.getFinancialInstitutions = exports.getFinancialProducts = exports.createFinancialProduct = exports.submitFinancialApplication = exports.updateFinancialApplicationStatus = exports.getFinancialApplicationDetails = exports.getFinancialSummaryAndTransactions = exports.logFinancialTransaction = exports.distributeCrowdfundingPayouts = exports.processCrowdfundingInvestment = exports.matchFundingOpportunities = exports.assessCreditRisk = exports.initiatePayment = void 0;
exports._internalAssessCreditRisk = _internalAssessCreditRisk;
exports._internalMatchFundingOpportunities = _internalMatchFundingOpportunities;
exports._internalInitiatePayment = _internalInitiatePayment;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
const checkAuth = (context) => {
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
async function _internalAssessCreditRisk(data) {
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
async function _internalMatchFundingOpportunities(data) {
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
async function _internalInitiatePayment(data, context) {
    const { orderId, amount, currency } = data;
    if (!orderId || typeof orderId !== "string") {
        throw new functions.https.HttpsError("invalid-argument", "error.orderId.required");
    }
    if (amount === undefined || typeof amount !== "number" || amount <= 0) {
        throw new functions.https.HttpsError("invalid-argument", "error.amount.invalid");
    }
    if (!currency || typeof currency !== "string") {
        throw new functions.https.HttpsError("invalid-argument", "error.currency.required");
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
        throw new functions.https.HttpsError("aborted", "error.payment.initiationFailed");
    }
}
// Callable function to initiate a payment
exports.initiatePayment = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "error.unauthenticated");
    }
    try {
        return await _internalInitiatePayment(data, context);
    }
    catch (error) {
        console.error(`Error during payment initiation for order ${data.orderId}:`, error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "error.internal", error);
    }
});
/**
 * Firestore trigger to assess credit risk when a user profile is updated.
 */
exports.assessCreditRisk = functions.firestore
    .document("users/{userId}")
    .onUpdate(async (change, context) => {
    const userId = context.params.userId;
    const beforeData = change.before.data();
    const afterData = change.after.data();
    // To prevent an infinite loop, only run if the profile data relevant to the score has changed.
    // This is a simple check; a more complex system might compare specific fields.
    if (beforeData.updatedAt.isEqual(afterData.updatedAt)) {
        console.log(`Skipping credit risk assessment for user ${userId} as there are no new data changes.`);
        return null;
    }
    console.log(`Credit risk assessment triggered for user ${userId} due to profile update.`);
    try {
        const userRef = db.collection("users").doc(userId);
        const relevantData = {
            userData: afterData,
            // In the future, we could aggregate financial transactions here as well.
        };
        const scoreResult = await _internalAssessCreditRisk(relevantData);
        const { score, riskFactors } = scoreResult;
        await db.collection("credit_scores").doc(userId).set({
            userId,
            userRef,
            score,
            riskFactors,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
            aiModelVersion: "v1.0-placeholder",
        }, { merge: true });
        console.log(`Credit score for user ${userId} updated to ${score}.`);
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
        const matchedOpportunitiesResult = await _internalMatchFundingOpportunities({
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
        throw new functions.https.HttpsError("unauthenticated", "error.unauthenticated");
    }
    const investorUid = context.auth.uid;
    const { projectId, amount, currency } = data;
    if (!projectId || typeof projectId !== "string") {
        throw new functions.https.HttpsError("invalid-argument", "error.projectId.required");
    }
    if (amount === undefined || typeof amount !== "number" || amount <= 0) {
        throw new functions.https.HttpsError("invalid-argument", "error.amount.invalid");
    }
    if (!currency || typeof currency !== "string") {
        throw new functions.https.HttpsError("invalid-argument", "error.currency.required");
    }
    try {
        const projectRef = db.collection("crowdfunding_projects").doc(projectId);
        const investorRef = db.collection("users").doc(investorUid);
        console.log(`Recording investment for project ${projectId} by user ${investorUid}...`);
        await db.runTransaction(async (transaction) => {
            const projectDoc = await transaction.get(projectRef);
            if (!projectDoc.exists) {
                throw new functions.https.HttpsError("not-found", "error.project.notFound");
            }
            const projectData = projectDoc.data();
            const currentRaised = (projectData === null || projectData === void 0 ? void 0 : projectData.currentRaised) || 0;
            const targetAmount = (projectData === null || projectData === void 0 ? void 0 : projectData.targetAmount) || 0;
            if ((projectData === null || projectData === void 0 ? void 0 : projectData.status) !== "open" ||
                currentRaised >= targetAmount) {
                throw new functions.https.HttpsError("failed-precondition", "error.project.notOpen");
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
        throw new functions.https.HttpsError("internal", "error.internal", error);
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
        throw new functions.https.HttpsError("unauthenticated", "error.unauthenticated");
    }
    const callerUid = context.auth.uid;
    const { type, amount, currency, description, category } = data;
    const validTypes = ["income", "expense"];
    if (!type || typeof type !== "string" || !validTypes.includes(type)) {
        throw new functions.https.HttpsError("invalid-argument", "error.type.invalid");
    }
    if (amount === undefined || typeof amount !== "number" || amount <= 0) {
        throw new functions.https.HttpsError("invalid-argument", "error.amount.invalid");
    }
    if (!currency || typeof currency !== "string") {
        throw new functions.https.HttpsError("invalid-argument", "error.currency.required");
    }
    if (!description || typeof description !== "string") {
        throw new functions.https.HttpsError("invalid-argument", "error.description.required");
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
        throw new functions.https.HttpsError("internal", "error.internal", error);
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
        throw new functions.https.HttpsError("unauthenticated", "error.unauthenticated");
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
        const allTransactions = [];
        // 2. & 3. Iterate once through all transactions
        allTransactionsSnapshot.forEach((doc) => {
            var _a, _b, _c;
            const tx = doc.data();
            if (tx.type === "income") {
                totalIncome += tx.amount;
            }
            else if (tx.type === "expense") {
                totalExpense += tx.amount;
            }
            // Convert timestamp for client and add to full list
            allTransactions.push(Object.assign(Object.assign({ id: doc.id }, tx), { timestamp: (_c = (_b = (_a = tx.timestamp) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a).toISOString()) !== null && _c !== void 0 ? _c : null }));
        });
        // 4. Create summary object
        const summary = {
            totalIncome,
            totalExpense,
            netFlow: totalIncome - totalExpense,
        };
        // 5. Return summary and sliced list of recent transactions
        return { summary, transactions: allTransactions.slice(0, 10) };
    }
    catch (error) {
        console.error("Error fetching financial summary:", error);
        throw new functions.https.HttpsError("internal", "error.financialData.fetchFailed");
    }
});
const checkFiAuth = async (context) => {
    var _a, _b;
    const uid = (_a = context.auth) === null || _a === void 0 ? void 0 : _a.uid;
    if (!uid) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    const userDoc = await db.collection("users").doc(uid).get();
    const userRole = (_b = userDoc.data()) === null || _b === void 0 ? void 0 : _b.primaryRole;
    if (userRole !== 'Financial Institution (Micro-finance/Loans)') {
        throw new functions.https.HttpsError("permission-denied", "You are not authorized to perform this action.");
    }
    return uid;
};
exports.getFinancialApplicationDetails = functions.https.onCall(async (data, context) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    await checkFiAuth(context);
    const { applicationId } = data;
    if (!applicationId) {
        throw new functions.https.HttpsError('invalid-argument', 'Application ID is required.');
    }
    const appRef = db.collection('financial_applications').doc(applicationId);
    const appDoc = await appRef.get();
    if (!appDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Application not found.');
    }
    const appData = appDoc.data();
    let applicantProfile = null;
    if (appData.applicantId) {
        const profileDoc = await db.collection('users').doc(appData.applicantId).get();
        if (profileDoc.exists) {
            const profileData = profileDoc.data();
            applicantProfile = Object.assign(Object.assign({ id: profileDoc.id }, profileData), { createdAt: (_c = (_b = (_a = profileData.createdAt) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a).toISOString()) !== null && _c !== void 0 ? _c : null, updatedAt: (_f = (_e = (_d = profileData.updatedAt) === null || _d === void 0 ? void 0 : _d.toDate) === null || _e === void 0 ? void 0 : _e.call(_d).toISOString()) !== null && _f !== void 0 ? _f : null });
        }
    }
    const serializedAppData = Object.assign(Object.assign({}, appData), { id: appDoc.id, submittedAt: (_j = (_h = (_g = appData.submittedAt) === null || _g === void 0 ? void 0 : _g.toDate) === null || _h === void 0 ? void 0 : _h.call(_g).toISOString()) !== null && _j !== void 0 ? _j : null });
    return { application: serializedAppData, applicant: applicantProfile };
});
exports.updateFinancialApplicationStatus = functions.https.onCall(async (data, context) => {
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
exports.submitFinancialApplication = functions.https.onCall(async (data, context) => {
    var _a;
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
    const applicantName = ((_a = applicantDoc.data()) === null || _a === void 0 ? void 0 : _a.displayName) || "Unknown Applicant";
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
exports.createFinancialProduct = functions.https.onCall(async (data, context) => {
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
exports.getFinancialProducts = functions.https.onCall(async (data, context) => {
    const fiId = await checkFiAuth(context);
    const productsSnapshot = await db.collection("financial_products")
        .where("fiId", "==", fiId)
        .orderBy("createdAt", "desc")
        .get();
    const products = productsSnapshot.docs.map(doc => {
        var _a, _b, _c, _d;
        const data = doc.data();
        return Object.assign(Object.assign({ id: doc.id }, data), { createdAt: (_b = (_a = data.createdAt) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a).toISOString(), updatedAt: (_d = (_c = data.updatedAt) === null || _c === void 0 ? void 0 : _c.toDate) === null || _d === void 0 ? void 0 : _d.call(_c).toISOString() });
    });
    return { products };
});
exports.getFinancialInstitutions = functions.https.onCall(async (data, context) => {
    checkAuth(context);
    const fiSnapshot = await db.collection("users").where("primaryRole", "==", "Financial Institution (Micro-finance/Loans)").get();
    const fis = fiSnapshot.docs.map(doc => ({
        id: doc.id,
        displayName: doc.data().displayName,
    }));
    return fis;
});
exports.getFiApplications = functions.https.onCall(async (data, context) => {
    const fiId = await checkFiAuth(context);
    const { status } = data; // e.g., "Pending", "Approved", "All"
    let query = db.collection("financial_applications").where("fiId", "==", fiId);
    if (status && status !== 'All') {
        query = query.where("status", "==", status);
    }
    query = query.orderBy("submittedAt", "desc");
    const snapshot = await query.get();
    const applications = snapshot.docs.map(doc => {
        var _a, _b, _c;
        const appData = doc.data();
        return Object.assign(Object.assign({}, appData), { id: doc.id, submittedAt: (_c = (_b = (_a = appData.submittedAt) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a).toISOString()) !== null && _c !== void 0 ? _c : null });
    });
    return { applications };
});
//# sourceMappingURL=financial-services.js.map