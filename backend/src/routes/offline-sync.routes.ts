import express from 'express';
import { OfflineSyncController } from '../controllers/offline-sync.controller';
import { requireAuth } from '../middleware/requireAuth';

const router = express.Router();
const offlineSyncController = new OfflineSyncController();

/**
 * @swagger
 * /api/offline-sync/upload:
 *   post:
 *     tags: [Offline Sync]
 *     summary: Upload offline changes for processing
 *     description: Upload a batch of offline changes from the client for server-side processing
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - changes
 *             properties:
 *               changes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - collectionPath
 *                     - documentId
 *                     - operation
 *                     - timestamp
 *                   properties:
 *                     collectionPath:
 *                       type: string
 *                       description: The collection name (e.g., 'posts', 'users')
 *                     documentId:
 *                       type: string
 *                       description: The document ID
 *                     operation:
 *                       type: string
 *                       enum: [create, update, delete]
 *                       description: The operation type
 *                     timestamp:
 *                       type: number
 *                       description: Client timestamp in milliseconds
 *                     payload:
 *                       type: object
 *                       description: The data payload for create/update operations
 *                     clientDeviceId:
 *                       type: string
 *                       description: Optional client device identifier
 *     responses:
 *       200:
 *         description: Offline changes uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 uploadedCount:
 *                   type: integer
 *                 uploadedChangeIds:
 *                   type: array
 *                   items:
 *                     type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/upload', requireAuth(), offlineSyncController.uploadOfflineChanges);

/**
 * @swagger
 * /api/offline-sync/status:
 *   get:
 *     tags: [Offline Sync]
 *     summary: Get offline changes status
 *     description: Get the status of offline changes for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, completed, conflict, failed]
 *         description: Filter by change status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of results
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *     responses:
 *       200:
 *         description: Offline changes status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 changes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       changeId:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *                       collectionPath:
 *                         type: string
 *                       documentId:
 *                         type: string
 *                       operation:
 *                         type: string
 *                       status:
 *                         type: string
 *                       processingAttempts:
 *                         type: integer
 *                       errorMessage:
 *                         type: string
 *                       conflictDetails:
 *                         type: object
 *                       createdAt:
 *                         type: string
 *                       processedAt:
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
 */
router.get('/status', requireAuth(), offlineSyncController.getOfflineChangesStatus);

/**
 * @swagger
 * /api/offline-sync/retry:
 *   post:
 *     tags: [Offline Sync]
 *     summary: Retry failed offline changes
 *     description: Retry processing of failed or conflicted offline changes
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - changeIds
 *             properties:
 *               changeIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of change IDs to retry
 *     responses:
 *       200:
 *         description: Failed changes queued for retry successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 modifiedCount:
 *                   type: integer
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/retry', requireAuth(), offlineSyncController.retryFailedChanges);

/**
 * @swagger
 * /api/offline-sync/stats:
 *   get:
 *     tags: [Offline Sync]
 *     summary: Get offline sync statistics
 *     description: Get statistics about offline sync operations for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Offline sync statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalChanges:
 *                       type: integer
 *                     pendingChanges:
 *                       type: integer
 *                     processingChanges:
 *                       type: integer
 *                     completedChanges:
 *                       type: integer
 *                     failedChanges:
 *                       type: integer
 *                     conflictChanges:
 *                       type: integer
 *                     changesByOperation:
 *                       type: object
 *                       additionalProperties:
 *                         type: integer
 *                     changesByCollection:
 *                       type: object
 *                       additionalProperties:
 *                         type: integer
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', requireAuth(), offlineSyncController.getSyncStatistics);

/**
 * @swagger
 * /api/offline-sync/health:
 *   get:
 *     tags: [Offline Sync]
 *     summary: Check offline sync service health
 *     description: Check if the offline sync service is operational
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 service:
 *                   type: string
 *                   example: offline-sync
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'offline-sync'
  });
});

export default router;