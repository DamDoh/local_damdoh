import express from 'express';
import { RegulatoryController } from '../controllers/regulatory.controller';
import { requireAuth } from '../middleware/requireAuth';

const router = express.Router();
const regulatoryController = new RegulatoryController();

/**
 * @swagger
 * /api/regulatory/reports:
 *   post:
 *     tags: [Regulatory]
 *     summary: Generate a regulatory report
 *     description: Generate a regulatory report for a user (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reportType
 *               - userId
 *               - reportPeriod
 *             properties:
 *               reportType:
 *                 type: string
 *                 enum: [VTI_EVENTS_SUMMARY, FINANCIAL_TRANSACTIONS, USER_ACTIVITY, MARKETPLACE_ACTIVITY, COMPLIANCE_AUDIT]
 *                 description: Type of regulatory report
 *               userId:
 *                 type: string
 *                 description: User ID to generate report for
 *               reportPeriod:
 *                 type: object
 *                 required:
 *                   - startDate
 *                   - endDate
 *                 properties:
 *                   startDate:
 *                     type: number
 *                     description: Start date timestamp in milliseconds
 *                   endDate:
 *                     type: number
 *                     description: End date timestamp in milliseconds
 *     responses:
 *       200:
 *         description: Regulatory report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reportId:
 *                   type: string
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not admin
 *       400:
 *         description: Bad request
 *       404:
 *         description: User not found
 */
router.post('/reports', requireAuth(), regulatoryController.generateRegulatoryReport);

/**
 * @swagger
 * /api/regulatory/reports:
 *   get:
 *     tags: [Regulatory]
 *     summary: Get generated regulatory reports
 *     description: Get list of generated regulatory reports (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: reportType
 *         schema:
 *           type: string
 *           enum: [VTI_EVENTS_SUMMARY, FINANCIAL_TRANSACTIONS, USER_ACTIVITY, MARKETPLACE_ACTIVITY, COMPLIANCE_AUDIT]
 *         description: Filter by report type
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by target user ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, PROCESSING, COMPLETED, FAILED]
 *         description: Filter by report status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Regulatory reports retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reports:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       reportId:
 *                         type: string
 *                       reportType:
 *                         type: string
 *                       generatedFor:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                       generatedBy:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                       reportPeriod:
 *                         type: object
 *                         properties:
 *                           startDate:
 *                             type: string
 *                           endDate:
 *                             type: string
 *                       status:
 *                         type: string
 *                       reportContent:
 *                         type: object
 *                       createdAt:
 *                         type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not admin
 */
router.get('/reports', requireAuth(), regulatoryController.getGeneratedReports);

/**
 * @swagger
 * /api/regulatory/reports/{reportId}:
 *   get:
 *     tags: [Regulatory]
 *     summary: Get regulatory report by ID
 *     description: Get detailed information about a specific regulatory report (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *         description: Report ID
 *     responses:
 *       200:
 *         description: Regulatory report retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 reportId:
 *                   type: string
 *                 reportType:
 *                   type: string
 *                 generatedFor:
 *                   type: object
 *                 generatedBy:
 *                   type: object
 *                 reportPeriod:
 *                   type: object
 *                 status:
 *                   type: string
 *                 reportContent:
 *                   type: object
 *                 fileUrl:
 *                   type: string
 *                 expiresAt:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                 updatedAt:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not admin
 *       404:
 *         description: Report not found
 */
router.get('/reports/:reportId', requireAuth(), regulatoryController.getReportById);

/**
 * @swagger
 * /api/regulatory/reports/{reportId}:
 *   delete:
 *     tags: [Regulatory]
 *     summary: Delete regulatory report
 *     description: Delete a regulatory report (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *         description: Report ID
 *     responses:
 *       200:
 *         description: Regulatory report deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not admin
 *       404:
 *         description: Report not found
 */
router.delete('/reports/:reportId', requireAuth(), regulatoryController.deleteReport);

/**
 * @swagger
 * /api/regulatory/stats:
 *   get:
 *     tags: [Regulatory]
 *     summary: Get regulatory report statistics
 *     description: Get statistics about regulatory reports (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Regulatory report statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalReports:
 *                       type: integer
 *                     completedReports:
 *                       type: integer
 *                     pendingReports:
 *                       type: integer
 *                     failedReports:
 *                       type: integer
 *                     reportsByType:
 *                       type: object
 *                       additionalProperties:
 *                         type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not admin
 */
router.get('/stats', requireAuth(), regulatoryController.getReportStats);

export default router;