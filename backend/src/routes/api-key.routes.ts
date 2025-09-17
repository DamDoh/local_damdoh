import express from 'express';
import { ApiKeyController } from '../controllers/api-key.controller';
import { requireAuth } from '../middleware/requireAuth';

const router = express.Router();
const apiKeyController = new ApiKeyController();

/**
 * @swagger
 * /api/api-keys:
 *   post:
 *     tags: [API Keys]
 *     summary: Generate a new API key
 *     description: Generate a new API key for Agri-Tech Innovators (Sandbox or Production environment)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - description
 *               - environment
 *             properties:
 *               description:
 *                 type: string
 *                 description: Description of the API key usage
 *               environment:
 *                 type: string
 *                 enum: [Sandbox, Production]
 *                 description: Environment for the API key
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *                 description: Optional expiration date
 *     responses:
 *       200:
 *         description: API key generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 key:
 *                   type: string
 *                   description: The full API key (shown only once)
 *                 id:
 *                   type: string
 *                 description:
 *                   type: string
 *                 environment:
 *                   type: string
 *                 status:
 *                   type: string
 *                 keyPrefix:
 *                   type: string
 *                 lastFour:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not Agri-Tech Innovator
 *       400:
 *         description: Bad request
 */
router.post('/', requireAuth(), apiKeyController.generateApiKey);

/**
 * @swagger
 * /api/api-keys:
 *   get:
 *     tags: [API Keys]
 *     summary: Get API keys
 *     description: Get all API keys for the authenticated Agri-Tech Innovator
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: environment
 *         schema:
 *           type: string
 *           enum: [Sandbox, Production]
 *         description: Filter by environment
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Active, Revoked, Expired]
 *         description: Filter by status
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
 *           default: 50
 *         description: Items per page
 *     responses:
 *       200:
 *         description: API keys retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 keys:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       description:
 *                         type: string
 *                       environment:
 *                         type: string
 *                       status:
 *                         type: string
 *                       keyPrefix:
 *                         type: string
 *                       lastFour:
 *                         type: string
 *                       displayKey:
 *                         type: string
 *                       usageCount:
 *                         type: integer
 *                       lastUsedAt:
 *                         type: string
 *                       expiresAt:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                       updatedAt:
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
 *         description: Forbidden - not Agri-Tech Innovator
 */
router.get('/', requireAuth(), apiKeyController.getApiKeys);

/**
 * @swagger
 * /api/api-keys/{keyId}:
 *   put:
 *     tags: [API Keys]
 *     summary: Update API key
 *     description: Update an API key's description or expiration date
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: keyId
 *         required: true
 *         schema:
 *           type: string
 *         description: API Key ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 description: New description
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *                 description: New expiration date
 *     responses:
 *       200:
 *         description: API key updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not Agri-Tech Innovator
 *       404:
 *         description: API key not found
 *       400:
 *         description: Bad request
 */
router.put('/:keyId', requireAuth(), apiKeyController.updateApiKey);

/**
 * @swagger
 * /api/api-keys/{keyId}:
 *   delete:
 *     tags: [API Keys]
 *     summary: Delete API key
 *     description: Permanently delete an API key
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: keyId
 *         required: true
 *         schema:
 *           type: string
 *         description: API Key ID
 *     responses:
 *       200:
 *         description: API key deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not Agri-Tech Innovator
 *       404:
 *         description: API key not found
 */
router.delete('/:keyId', requireAuth(), apiKeyController.deleteApiKey);

/**
 * @swagger
 * /api/api-keys/{keyId}/revoke:
 *   post:
 *     tags: [API Keys]
 *     summary: Revoke API key
 *     description: Revoke an API key (can be undone by updating status)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: keyId
 *         required: true
 *         schema:
 *           type: string
 *         description: API Key ID
 *     responses:
 *       200:
 *         description: API key revoked successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not Agri-Tech Innovator
 *       404:
 *         description: API key not found
 */
router.post('/:keyId/revoke', requireAuth(), apiKeyController.revokeApiKey);

/**
 * @swagger
 * /api/api-keys/stats:
 *   get:
 *     tags: [API Keys]
 *     summary: Get API key statistics
 *     description: Get statistics about API key usage for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: API key statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalKeys:
 *                       type: integer
 *                     activeKeys:
 *                       type: integer
 *                     revokedKeys:
 *                       type: integer
 *                     expiredKeys:
 *                       type: integer
 *                     sandboxKeys:
 *                       type: integer
 *                     productionKeys:
 *                       type: integer
 *                     totalUsage:
 *                       type: integer
 *                     recentlyUsedKeys:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not Agri-Tech Innovator
 */
router.get('/stats', requireAuth(), apiKeyController.getApiKeyStats);

export default router;