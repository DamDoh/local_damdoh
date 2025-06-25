
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Assuming admin and db are initialized in index.ts or a shared file
// import { db } from './index';

const db = admin.firestore();

// Import necessary functions/types from other modules
// Assuming these imports exist or will be added in the respective module files
// import { getFarmActivityLogsForUser } from './module3'; // For fetching farming data
// import { getMarketplaceDataForUser } from './module4'; // For fetching marketplace data
// import { getSustainabilityDataForUser } from './module12'; // For fetching sustainability data
import { _internalAssessCreditRisk, _internalMatchFundingOpportunities } from './module8'; // Import the INTERNAL AI functions

// Helper function to get user role (Assuming this is implemented elsewhere or as a placeholder)
// import { getRole } from './module2';

// import { sendNotification } from './notification_system'; // Assuming a notification function exists

// Callable function to initiate a payment process
// This function is intended to be called by internal processes like Module 4's processOrder.
// Security Note: Callable functions are typically called by authenticated users.
// For inter-service communication, consider using Admin SDK with a service account,
// Pub/Sub, or authenticated HTTPS endpoints with shared secrets for more secure
// communication between Cloud Functions or services. This callable function approach
// assumes a level of trust or that the calling context is sufficiently secured.
export const initiatePayment = functions.https.onCall(async (data, context) => {
    // TODO: Implement strict security checks to ensure this call is from an authorized internal process.
    // This might involve checking the context for service account authentication,
    // validating a shared secret passed in the data (less secure), or ensuring
    // the caller has a specific internal role if using user authentication context.
     if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated.');
    }

    const callerUid = context.auth.uid;
     // Example check if caller is a 'system' role (if using user auth context)
     // const role = await getRole(callerUid);
     // if (role !== 'system') {
     //      throw new functions.https.HttpsError('permission-denied', 'Caller is not authorized.');
     // }


    // Expected input data from calling service (e.g., Module 4's processOrder)
    const { orderId, amount, currency, buyerInfo, sellerInfo, description } = data; // buyerInfo/sellerInfo could be VTIs or references


    // Basic input validation
    if (!orderId || typeof orderId !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'The "orderId" parameter is required.');
    }
     if (amount === undefined || typeof amount !== 'number' || amount <= 0) {
         throw new functions.https.HttpsError('invalid-argument', 'The "amount" parameter is required, must be a number, and greater than zero.');
     }
     if (!currency || typeof currency !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'The "currency" parameter is required.');
     }
     // TODO: Validate buyer/seller info format


    try {
        console.log(`Attempting to initiate payment for order ${orderId} (Amount: ${amount} ${currency})...`);

        // TODO: Implement integration with a global payment gateway API here.
        // This would involve:
        // 1. Calling the payment gateway's API to create a payment intent or transaction.
        // 2. Passing necessary details: amount, currency, orderId (for reference),
        //    buyer/seller information, potentially product details.
        // 3. Handling the response from the payment gateway.
        // 4. The payment gateway will likely notify our system of the payment outcome
        //    via a webhook, which would trigger a *separate* function (e.g., handlePaymentWebhook).


        console.log('Placeholder for payment gateway API call...');
        const paymentGatewayResponse = {
             success: true, // Simulate successful initiation
             transactionId: `pg_txn_${orderId}_${Date.now()}`, // Simulated transaction ID
             // Other relevant data from the gateway (e.g., client secret for frontend confirmation)
        };


        if (paymentGatewayResponse.success) {
             console.log(`Payment initiation successful for order ${orderId}. Transaction ID: ${paymentGatewayResponse.transactionId}`);

             // TODO: Optionally record the payment initiation attempt in a financial_transactions
             // document or update the order document with initiation details.


             return {
                orderId: orderId,
                status: 'payment_initiation_successful',
                transactionId: paymentGatewayResponse.transactionId,
                 // Return data needed by the calling service (e.g., client secret for frontend)
             };
        } else {
             console.error(`Payment initiation failed for order ${orderId}.`);
             // TODO: Log detailed error from payment gateway response.
             throw new functions.https.HttpsError('aborted', 'Payment initiation failed with gateway.');
        }

    } catch (error) {
        console.error(`Error during payment initiation for order ${orderId}:`, error);
         if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'An internal error occurred during payment initiation.', error);
    }
});

// TODO: Implement a separate HTTPS function to handle webhooks from the payment gateway.
// This function would be triggered by the gateway when a payment is confirmed, failed, refunded, etc.
// It should:
// 1. Securely verify the webhook request's origin (signature verification).
// 2. Get the payment outcome and transaction details from the webhook payload.
// 3. Find the corresponding order document in Module 4 using the orderId (or equivalent reference).
// 4. Update the order document's 'paymentStatus' (e.g., 'paid', 'failed').
// 5. Based on payment success, potentially update the overall order 'status' (e.g., to 'processing').
// 6. Log a financial_transactions document in Module 7.
// 7. Trigger further actions (e.g., notify seller, initiate logistics).
/*
export const handlePaymentWebhook = functions.https.onRequest(async (req, res) => {
    // TODO: Implement webhook signature verification for security.
    // Example: verifyWebhookSignature(req);

    try {
        const paymentData = req.body; // Payment data from the gateway webhook payload

        // TODO: Parse paymentData to get orderId, transaction status, amount, etc.
        const orderId = paymentData.orderId; // Example
        const paymentStatus = paymentData.status; // Example ('paid', 'failed')
        const transactionId = paymentData.transactionId; // Example
        const amount = paymentData.amount; // Example
        const currency = paymentData.currency; // Example


        if (!orderId || !paymentStatus || !transactionId) {
            console.error('Invalid payment webhook data received.');
            res.status(400).send('Invalid data');
            return;
        }

        const orderRef = db.collection('orders').doc(orderId);

        await orderRef.update({
            paymentStatus: paymentStatus, // 'paid' or 'failed'
            paymentTransactionId: transactionId, // Store the gateway's transaction ID
            paymentProcessedAt: admin.firestore.FieldValue.serverTimestamp(),
            // Optionally update order status if payment is successful
            // status: paymentStatus === 'paid' ? 'processing' : 'cancelled',
        });
        console.log(`Payment status updated for order ${orderId} to ${paymentStatus}.`);


        // TODO: Log financial_transactions in Module 7 for this payment.
        // This should include details like amount, currency, type ('income' for seller, 'expense' for buyer),
        // link to the order, and the actorRef (buyer/seller VTI).


        // TODO: Trigger further actions based on payment status (e.g., notify seller on success).


        res.status(200).send('OK');

    } catch (error) {
        console.error('Error processing payment webhook:', error);
        res.status(500).send('Error');
    }
});
*/

// Firestore trigger to calculate the DamDoh Credit Score
// Triggered by relevant data updates from other modules (e.g., new traceability event,
// completed farm activity log, completed marketplace order)
// TODO: Define the specific triggers for this function based on data changes
// in Modules 1, 3, and 4 that impact creditworthiness. Examples:
// - onWrite to traceability_events (Module 1)
// - onWrite to farm_activity_logs (Module 3)
// - onUpdate to orders where status becomes 'completed' or 'paid' (Module 4)
export const calculateDamDohCreditScore = functions.firestore
    // Example triggers (replace/add as needed based on specific data structures)
    // This should be a multi-trigger function if possible, or separate functions per trigger source
    // For simplicity in this example, we'll use a single placeholder trigger
    .document('financial_transactions/{transactionId}') // Triggered by financial transactions
    // .document('farm_activity_logs/{logId}') // Triggered by farm activity updates
    // .document('orders/{orderId}') // Triggered by marketplace order updates
    // .document('sustainability_reports/{reportId}') // Triggered by sustainability reports

    .onCreate(async (snapshot, context) => { // Using onCreate as an example, onWrite is more flexible
        console.log('Triggered calculateDamDohCreditScore (placeholder).');

        // TODO: Identify the user (UID) associated with the data change.
        // This depends heavily on the specific trigger.
        const userId = 'placeholder_user_id'; // Extract user ID from the changed document

        if (!userId) {
            console.warn('Could not identify user from trigger data. Skipping score calculation.');
            return null;
        }

        try {
            console.log(`Calculating DamDoh Credit Score for user ${userId}...`);

            // Get the user document reference
            const userRef = db.collection('users').doc(userId);

            // 1. Fetch relevant data from various modules.
            console.log('Fetching data for credit score calculation...');

            // Fetch user document (Module 2) - for KYC, roles, etc.
            const userDoc = await userRef.get();
            const userData = userDoc.exists ? userDoc.data() : null;

            if (!userData) {
                 console.warn(`User document not found for ${userId}. Skipping score calculation.`);
                 return null;
            }

            // Fetch data from other modules (using placeholder functions)
            // These functions would query their respective collections filtered by userId or linked VTIs
            // const farmActivityData = await getFarmActivityLogsForUser(userId); // Module 3
            // const marketplaceData = await getMarketplaceDataForUser(userId); // Module 4 (orders, listings, reviews)
            // const sustainabilityData = await getSustainabilityDataForUser(userId); // Module 12 (reports, practices)
            // const financialTransactionData = await db.collection('financial_transactions').where('userRef', '==', userRef).get(); // Module 7
            // const loanGrantData = await db.collectionGroup('loan_applications').where('applicantRef', '==', userRef).get(); // Example for loan/grant
            // const crowdfundingInvestmentData = await db.collectionGroup('investments').where('investorRef', '==', userRef).get(); // Example for investments
            // TODO: Include traceability data from Module 1 via linked VTIs if applicable.
            // TODO: Consider data from Module 6 (Community) for social credit aspects.


            const relevantData = {
                // Structure of data to be sent to Module 8
                userData: userData,
                // farmActivity: farmActivityData, // Process/format fetched data
                // marketplace: marketplaceData,
                // sustainability: sustainabilityData,
                // financialTransactions: financialTransactionData.docs.map(doc => doc.data()),
                // loansGrants: loanGrantData.docs.map(doc => doc.data()),
                // investments: crowdfundingInvestmentData.docs.map(doc => doc.data()),
            };
            console.log('Sending data to Module 8 AI for score calculation...');
            // CORRECT: Call the internal logic function directly.
            const scoreResult = await _internalAssessCreditRisk(relevantData); 

            // Placeholder result from Module 8
            const calculatedScore = scoreResult.score; // Get the score from Module 8 result
            const riskFactors = scoreResult.riskFactors; // Get risk factors from Module 8 result
            // 2. Send data to Module 8's AI models for calculation.
            // 3. Update the user's document in the 'credit_scores' collection.
            await db.collection('credit_scores').doc(userId).set({
                userId: userId,
                userRef: userRef,
                score: calculatedScore,
                lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
                riskFactors: riskFactors,
                // Add other relevant details from the calculation if needed
            }, { merge: true }); // Use merge to update or create

            console.log(`Credit score for user ${userId} updated.`);

            return null; // Indicate successful completion

        } catch (error) {
            console.error(`Error calculating credit score for user ${userId}:`, error);
            // TODO: Log the error and potentially alert an admin or system monitor.
            return null; // Ensure the function completes without crashing
        }
    });


// Triggered function to match users with funding opportunities
// Triggered by:
// - Updates to 'credit_scores' (when a user's score changes)
// - Creation/Updates to 'loan_applications', 'grant_applications', 'crowdfunding_projects'
// TODO: Define the specific triggers for this function.
export const matchFundingOpportunities = functions.firestore

    .document('credit_scores/{userId}') // Triggered when a user's credit score is updated
    // TODO: Add other triggers, e.g., on creating a new funding opportunity
    // .document('loan_products/{productId}')
    // .document('grant_programs/{programId}')
    // .document('crowdfunding_projects/{projectId}')
    .onUpdate(async (change, context) => { // Use onUpdate for credit_scores trigger

        console.log('Triggered matchFundingOpportunities by credit score update.');
        // TODO: Identify the user(s) or funding opportunity involved based on the trigger.
        // If triggered by credit score update, get the user ID.
        // If triggered by a new opportunity, identify potential matching users.
        const relevantUserId = 'placeholder_user_id'; // Or relevantOpportunityId

        if (!relevantUserId) {
             console.warn('Could not identify relevant entity from trigger data. Skipping matching.');
            return null;
        }

        try {
             console.log(`Matching funding opportunities for user ${relevantUserId}...`);

            // 1. Fetch user data and credit score.
            console.log('Fetching user data and score...');
            const userDoc = await db.collection('users').doc(relevantUserId).get(); // Module 2
            const userScoreDoc = await db.collection('credit_scores').doc(relevantUserId).get(); // Module 7

            if (!userDoc.exists || !userScoreDoc.exists) {
                 console.warn(`User document or credit score not found for ${relevantUserId}. Skipping matching.`);
                return null;
            }
            const userData = userDoc.data();
            const userCreditScore = userScoreDoc.data()?.score;

            if (userCreditScore === undefined || userCreditScore === null) {
                 console.warn(`Credit score not available for user ${relevantUserId}. Skipping matching.`);
                 return null;
            }

             // Extract relevant user profile data for matching (role, location, needs/goals)
             const userProfileDataForMatching = {
                 userId: relevantUserId,
                 role: userData?.primaryRole, // Assuming primaryRole field
                 location: userData?.location, // Assuming location field
                 financialNeeds: userData?.financialNeeds || [], // Assuming array of needs/goals
                 creditScore: userCreditScore,
                 // Add other relevant profile data
             };
             console.log('User profile data for matching:', userProfileDataForMatching);

            // 2. Fetch available funding opportunities.
            console.log('Fetching available funding opportunities...');
            // Fetch all active funding opportunities. Filter by region and target audience where possible.
            const loanProductsSnapshot = await db.collection('loan_products').where('status', '==', 'open').get(); // Assuming 'loan_products' collection
            const grantProgramsSnapshot = await db.collection('grant_programs').where('status', '==', 'open').get(); // Assuming 'grant_programs' collection
            const crowdfundingProjectsSnapshot = await db.collection('crowdfunding_projects').where('status', '==', 'open').get(); // Assuming 'crowdfunding_projects' collection

            const availableOpportunities = [
                ...loanProductsSnapshot.docs.map(doc => ({ id: doc.id, type: 'loan_product', ...doc.data() })),
                ...grantProgramsSnapshot.docs.map(doc => ({ id: doc.id, type: 'grant_program', ...doc.data() })),
                ...crowdfundingProjectsSnapshot.docs.map(doc => ({ id: doc.id, type: 'crowdfunding_project', ...doc.data() })),
            ];

             console.log(`Found ${availableOpportunities.length} available funding opportunities.`);

            if (availableOpportunities.length === 0) {
                 console.log('No available opportunities to match. Skipping matching.');
                 await db.collection('user_funding_recommendations').doc(relevantUserId).set({ userId: relevantUserId, recommendations: [], lastUpdated: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
                 return null;
            }

            // 3. Use Module 8's AI models for matching.
            console.log('Sending data to Module 8 AI for matching...');
            
            // CORRECT: Call the internal logic function directly
             const matchedOpportunitiesResult = await _internalMatchFundingOpportunities({ user: userProfileDataForMatching, opportunities: availableOpportunities });

             // Receive a list of recommended funding opportunity IDs (or objects with match scores)
            const matchedOpportunities = matchedOpportunitiesResult.matchedOpportunities || [];
             console.log(`Received ${matchedOpportunities.length} matched opportunities for ${relevantUserId}.`);
             if (matchedOpportunities.length > 0) {
                console.log(`Matched opportunity IDs: ${matchedOpportunities.map(opp => opp.opportunityId).join(', ')}`); // Assuming result includes IDs
             }

            // 4. Notify the user about matched opportunities.
            // Store the recommendations first
             // Store the recommendations in a user-specific collection
             // Store the recommendations in a user-specific collection in Firestore
             // Assuming Module 8 returns a list of opportunity objects with IDs and maybe match scores
             await db.collection('user_funding_recommendations').doc(relevantUserId).set({
                 userId: relevantUserId,
                 recommendations: matchedOpportunities, // Store the list of matched opportunity IDs or full objects
                 lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
                 // Add other relevant details like match scores if returned by AI
             }, { merge: true });
             console.log(`Stored ${matchedOpportunities.length} funding recommendations for user ${relevantUserId}.`);

             // Trigger a notification to the user
             // Trigger a notification to the user using the Notification System
             // Assuming sendNotification is imported from './notification_system'
             // await sendNotification(relevantUserId, 'new_funding_opportunity', { opportunitiesCount: matchedOpportunities.length, opportunities: matchedOpportunities.slice(0, 3) }); // Send notification with count and maybe first few opportunities
             console.log(`Triggered notification for user ${relevantUserId} about new funding opportunities.`);

            return null; // Indicate successful completion
        } catch (error) {
            console.error(`Error matching funding opportunities for ${relevantUserId}:`, error);
             // TODO: Log the error.
            return null;
        }
    });


// Callable function to process a crowdfunding investment
// Called by the frontend when a user invests in a project.
export const processCrowdfundingInvestment = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to invest.');
    }

    const investorUid = context.auth.uid;
    const { projectId, amount, currency } = data;

    // Basic input validation
    if (!projectId || typeof projectId !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'The "projectId" parameter is required.');
    }
     if (amount === undefined || typeof amount !== 'number' || amount <= 0) {
         throw new functions.https.HttpsError('invalid-argument', 'The "amount" parameter is required, must be a number, and greater than zero.');
     }
     if (!currency || typeof currency !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'The "currency" parameter is required.');
     }

    try {
        const projectRef = db.collection('crowdfunding_projects').doc(projectId);
        const investorRef = db.collection('users').doc(investorUid);

        // 1. Record the investment in the 'investments' subcollection using a transaction.
        console.log(`Recording investment for project ${projectId} by user ${investorUid}...`);

        await db.runTransaction(async (transaction) => {
            const projectDoc = await transaction.get(projectRef);

            if (!projectDoc.exists) {
                 throw new functions.https.HttpsError('not-found', `Crowdfunding project with ID ${projectId} not found.`);
            }

            const projectData = projectDoc.data();
            const currentRaised = projectData?.currentRaised || 0;
            const targetAmount = projectData?.targetAmount || 0;

            // Prevent investing in fully funded or closed projects
            if (projectData?.status !== 'open' || currentRaised >= targetAmount) {
                 throw new functions.https.HttpsError('failed-precondition', `Project ${projectId} is not open for investment.`);
            }

            const newCurrentRaised = currentRaised + amount;

            // Update the project's currentRaised amount
            transaction.update(projectRef, {
                currentRaised: newCurrentRaised,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                // Potentially update status to 'funded' if newCurrentRaised meets/exceeds targetAmount
                 status: newCurrentRaised >= targetAmount ? 'funded' : projectData.status
            });
             console.log(`Transaction: Updated currentRaised for project ${projectId} from ${currentRaised} to ${newCurrentRaised}.`);

            // Add the investment document in the subcollection
            const newInvestmentRef = projectRef.collection('investments').doc();
             transaction.set(newInvestmentRef, {
                investmentId: newInvestmentRef.id,
                investorRef: investorRef,
                amount: amount,
                currency: currency,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                 // Add other relevant details
             });
             console.log(`Transaction: Recorded investment ${newInvestmentRef.id} for project ${projectId}.`);
        });

         console.log(`Investment of ${amount} ${currency} recorded for project ${projectId} by user ${investorUid}.`);

        // 2. Trigger payment processing for the investment amount.
        console.log('Initiating payment for the investment...');
        // TODO: Call the initiatePayment function or a similar internal payment processing function.
        // This might involve transferring funds from the investor's linked payment method to the platform's escrow account.
        // const paymentInitiationResult = await initiatePayment({
        //     orderId: null, // No order ID for an investment
        //     amount: amount,
        //     currency: currency,
        //     buyerInfo: { userId: investorUid }, // Investor is the buyer
        //     sellerInfo: { projectId: projectId, ownerRef: projectRef }, // Project/Owner is the 'seller' of the investment opportunity
        //     description: `Investment in project ${projectId}`,
        //     type: 'investment_payment', // Custom type for internal processing
        // }, context); // Pass context if initiatePayment is callable

        console.log('Payment initiation for investment placeholder completed.');

        // TODO: Handle the outcome of the payment initiation.
        // The actual payment confirmation will likely come via a webhook, similar to marketplace orders.


        return { projectId, amount, status: 'investment_recorded_and_payment_initiated' };

    } catch (error) {
        console.error(`Error processing crowdfunding investment for project ${projectId} by user ${investorUid}:`, error);
         if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Unable to process crowdfunding investment.', error);
    }
});


// Triggered function to distribute payouts to crowdfunding investors
// Triggered by:
// - Crowdfunding project status update to 'completed'.
// - Periodically for projects with ongoing revenue sharing.
// TODO: Define the specific triggers for this function.
export const distributeCrowdfundingPayouts = functions.firestore
    .document('crowdfunding_projects/{projectId}') // Triggered by project completion or update
    .onUpdate(async (change, context) => {
        const projectId = context.params.projectId;
        const projectBefore = change.before.data();
        const projectAfter = change.after.data();

        console.log(`Triggered distributeCrowdfundingPayouts for project ${projectId} (placeholder).`);

        // TODO: Determine if the update warrants a payout distribution.
        // Example: Check if status changed to 'completed'.
        const shouldTriggerPayout = projectAfter?.status === 'completed' && projectBefore?.status !== 'completed';

        // TODO: Or, if implementing ongoing revenue share, check a schedule or revenue update flag.
        // const shouldTriggerRevenueSharePayout = projectAfter?.lastRevenueShareDate !== projectBefore?.lastRevenueShareDate;

        if (!shouldTriggerPayout /* && !shouldTriggerRevenueSharePayout */) {
            console.log(`Payout trigger conditions not met for project ${projectId}.`);
            return null;
        }

        console.log(`Initiating payout distribution for project ${projectId}...`);

        try {
            // 1. Fetch all investments for this project.
            console.log(`Fetching investments for project ${projectId}...`);
            const investmentsSnapshot = await db.collection('crowdfunding_projects').doc(projectId).collection('investments').get();

            if (investmentsSnapshot.empty) {
                console.log(`No investments found for project ${projectId}. Skipping payout.`);
                return null;
            }

            // 2. Calculate payouts for each investor.
            console.log('Calculating payouts...');
            // TODO: Implement payout calculation logic. This depends on the project's
            // funding model (e.g., fixed return, revenue share percentage, profit sharing).
            // Needs to consider total amount raised, project outcome/revenue, investment amount, etc.
            const totalInvested = investmentsSnapshot.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
            // For simplicity, simulate a fixed return payout
            const totalPayoutAmount = totalInvested * 1.1; // Example: 10% return

            const payoutPromises: Promise<any>[] = [];

            investmentsSnapshot.docs.forEach(investmentDoc => {
                const investmentData = investmentDoc.data();
                const investmentAmount = investmentData.amount || 0;
                const investorRef = investmentData.investorRef as admin.firestore.DocumentReference;
                const investorUid = investorRef.id;

                // Calculate individual payout amount
                const individualPayout = (investmentAmount / totalInvested) * totalPayoutAmount; // Proportional payout

                 console.log(`Calculating payout for investor ${investorUid}: ${individualPayout} ${investmentData.currency}`);

                // 3. Initiate payment to each investor.
                console.log(`Initiating payout payment for investor ${investorUid}...`);
                // TODO: Call initiatePayment or a similar function to send money to the investor.
                // This might involve transferring from the platform's escrow/revenue account to the investor's linked payment method.
                // The 'seller' in this case is the platform or project owner, and the 'buyer' is the investor receiving the payout.
                payoutPromises.push(initiatePayment({ // Using the placeholder initiatePayment
                    orderId: null, // No order ID
                    amount: individualPayout,
                    currency: investmentData.currency,
                    buyerInfo: { userId: investorUid }, // Investor receiving payout
                    sellerInfo: { projectId: projectId, ownerRef: projectAfter?.ownerRef }, // Project owner/platform as sender
                    description: `Payout for investment in project ${projectId}`,
                    type: 'crowdfunding_payout', // Custom type
                })); // Pass context if callable

                 // 4. Record the payout transaction.
                 console.log(`Recording payout transaction for investor ${investorUid}...`);
                 // TODO: Create a financial_transactions document for this payout.
                 const payoutTransactionRef = db.collection('financial_transactions').doc();
                 payoutPromises.push(payoutTransactionRef.set({
                     transactionId: payoutTransactionRef.id,
                     userRef: investorRef, // The investor
                     type: 'payout',
                     amount: individualPayout,
                     currency: investmentData.currency,
                     description: `Payout from crowdfunding project ${projectId}`,
                     timestamp: admin.firestore.FieldValue.serverTimestamp(),
                     linkedCrowdfundingProjectId: projectId,
                     linkedInvestmentId: investmentDoc.id,
                     // Add payment gateway transaction ID once confirmed by webhook
                 }));
            });

            await Promise.all(payoutPromises);
             console.log(`Payout distribution initiated and transactions recorded for project ${projectId}.`);

            // TODO: Update project status if needed (e.g., to 'paid_out') and record payout date.

            return null; // Indicate successful completion

        } catch (error) {
            console.error(`Error distributing payouts for project ${projectId}:`, error);
            // TODO: Log the error, and potentially handle partial failures or retry logic.
            // It's critical to avoid double-payouts or missed payouts.
            return null;
        }
    });


// Callable function for users to log manual financial transactions (income/expenses)
export const logFinancialTransaction = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to log a financial transaction.');
    }

    const callerUid = context.auth.uid;
    const { type, amount, currency, description } = data;

    // Basic input validation
    const validTypes = ['income', 'expense']; // Types loggable by users
    if (!type || typeof type !== 'string' || !validTypes.includes(type)) {
         throw new functions.https.HttpsError('invalid-argument', `The "type" parameter is required and must be one of: ${validTypes.join(', ')}.`);
    }
     if (amount === undefined || typeof amount !== 'number' || amount <= 0) {
         throw new functions.https.HttpsError('invalid-argument', 'The "amount" parameter is required, must be a number, and greater than zero.');
     }
     if (!currency || typeof currency !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'The "currency" parameter is required.');
     }
     if (!description || typeof description !== 'string') {
         throw new functions.https.HttpsError('invalid-argument', 'The "description" parameter is required.');
     }

    try {
        console.log(`Logging financial transaction for user ${callerUid}: ${type} ${amount} ${currency} - ${description}`);

        const userRef = db.collection('users').doc(callerUid);

        // Create a new financial_transactions document
        const newTransactionRef = db.collection('financial_transactions').doc();
        const transactionId = newTransactionRef.id;

        await newTransactionRef.set({
            transactionId: transactionId,
            userRef: userRef,
            type: type, // 'income' or 'expense'
            amount: amount,
            currency: currency,
            description: description,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            linkedOrderId: null, // Not linked to a marketplace order
            linkedLoanApplicationId: null,
            linkedGrantApplicationId: null,
            linkedCrowdfundingProjectId: null,
             // Add other relevant details
        });
        console.log(`Financial transaction ${transactionId} logged for user ${callerUid}.`);

        return { transactionId, status: 'transaction_logged' };

    } catch (error) {
        console.error(`Error logging financial transaction for user ${callerUid}:`, error);
         if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Unable to log financial transaction.', error);
    }
});
