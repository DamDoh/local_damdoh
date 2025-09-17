import express from 'express';
import { FinancialController } from '../controllers/financial.controller';
import { requireAuth } from '../middleware/requireAuth';

const router = express.Router();
const financialController = new FinancialController();

/**
 * @swagger
 * /api/financial/transactions:
 *   post:
 *     tags: [Financial]
 *     summary: Log a financial transaction
 *     description: Log a new income or expense transaction
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - amount
 *               - currency
 *               - description
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *               amount:
 *                 type: number
 *                 minimum: 0
 *               currency:
 *                 type: string
 *                 default: USD
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transaction logged successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad request
 */
router.post('/transactions', requireAuth(), financialController.logFinancialTransaction);

/**
 * @swagger
 * /api/financial/summary:
 *   get:
 *     tags: [Financial]
 *     summary: Get financial summary and transactions
 *     description: Get user's financial summary and recent transactions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Financial data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalIncome:
 *                       type: number
 *                     totalExpense:
 *                       type: number
 *                     netFlow:
 *                       type: number
 *                 transactions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       type:
 *                         type: string
 *                       amount:
 *                         type: number
 *                       currency:
 *                         type: string
 *                       description:
 *                         type: string
 *                       category:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *       401:
 *         description: Unauthorized
 */
router.get('/summary', requireAuth(), financialController.getFinancialSummaryAndTransactions);

/**
 * @swagger
 * /api/financial/applications:
 *   post:
 *     tags: [Financial]
 *     summary: Submit a financial application
 *     description: Submit an application for a financial product
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fiId
 *               - type
 *               - amount
 *               - purpose
 *             properties:
 *               fiId:
 *                 type: string
 *                 description: Financial institution ID
 *               type:
 *                 type: string
 *                 enum: [LOAN, GRANT, INSURANCE, SAVINGS]
 *               amount:
 *                 type: number
 *                 minimum: 0
 *               currency:
 *                 type: string
 *                 default: USD
 *               purpose:
 *                 type: string
 *     responses:
 *       200:
 *         description: Application submitted successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad request
 */
router.post('/applications', requireAuth(), financialController.submitFinancialApplication);

/**
 * @swagger
 * /api/financial/applications/{applicationId}:
 *   get:
 *     tags: [Financial]
 *     summary: Get application details
 *     description: Get detailed information about a financial application
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Application details retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not authorized to view
 *       404:
 *         description: Application not found
 */
router.get('/applications/:applicationId', requireAuth(), financialController.getFinancialApplicationDetails);

/**
 * @swagger
 * /api/financial/applications/{applicationId}/status:
 *   put:
 *     tags: [Financial]
 *     summary: Update application status
 *     description: Update the status of a financial application (FI only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [APPROVED, REJECTED, MORE_INFO_REQUIRED]
 *     responses:
 *       200:
 *         description: Application status updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not authorized
 *       400:
 *         description: Bad request
 */
router.put('/applications/:applicationId/status', requireAuth(), financialController.updateFinancialApplicationStatus);

/**
 * @swagger
 * /api/financial/products:
 *   post:
 *     tags: [Financial]
 *     summary: Create a financial product
 *     description: Create a new financial product (FI only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [LOAN, GRANT, INSURANCE, SAVINGS]
 *               description:
 *                 type: string
 *               interestRate:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *               maxAmount:
 *                 type: number
 *                 minimum: 0
 *               targetRoles:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Product created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not authorized
 *       400:
 *         description: Bad request
 */
router.post('/products', requireAuth(), financialController.createFinancialProduct);

/**
 * @swagger
 * /api/financial/products:
 *   get:
 *     tags: [Financial]
 *     summary: Get financial products
 *     description: Get all financial products for the authenticated FI
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not authorized
 */
router.get('/products', requireAuth(), financialController.getFinancialProducts);

/**
 * @swagger
 * /api/financial/institutions:
 *   get:
 *     tags: [Financial]
 *     summary: Get financial institutions
 *     description: Get all financial institutions in the system
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Financial institutions retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/institutions', requireAuth(), financialController.getFinancialInstitutions);

/**
 * @swagger
 * /api/financial/fi/applications:
 *   get:
 *     tags: [Financial]
 *     summary: Get FI applications
 *     description: Get all applications for the authenticated FI
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED, MORE_INFO_REQUIRED, COMPLETED, All]
 *     responses:
 *       200:
 *         description: Applications retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not authorized
 */
router.get('/fi/applications', requireAuth(), financialController.getFiApplications);

export default router;