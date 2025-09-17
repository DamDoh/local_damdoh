import express from 'express';
import { ActivityController } from '../controllers/activity.controller';
import { requireAuth } from '../middleware/requireAuth';

const router = express.Router();
const activityController = new ActivityController();

/**
 * @swagger
 * /api/activity/profile-view:
 *   post:
 *     tags: [Activity]
 *     summary: Log a profile view
 *     description: Log when a user views another user's profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - viewedId
 *             properties:
 *               viewedId:
 *                 type: string
 *                 description: ID of the user whose profile was viewed
 *     responses:
 *       200:
 *         description: Profile view logged successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 logId:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad request
 */
router.post('/profile-view', requireAuth(), activityController.logProfileView);

/**
 * @swagger
 * /api/activity/user/{userId}:
 *   get:
 *     tags: [Activity]
 *     summary: Get user activity
 *     description: Get recent activity for a specific user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to get activity for
 *     responses:
 *       200:
 *         description: User activity retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 activities:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       type:
 *                         type: string
 *                       title:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *                       icon:
 *                         type: string
 *                       referenceType:
 *                         type: string
 *                       referenceId:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get('/user/:userId', requireAuth(), activityController.getUserActivity);

/**
 * @swagger
 * /api/activity/stats/{userId}:
 *   get:
 *     tags: [Activity]
 *     summary: Get user engagement statistics
 *     description: Get engagement statistics for a specific user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to get stats for
 *     responses:
 *       200:
 *         description: User engagement stats retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profileViews:
 *                   type: number
 *                 postLikes:
 *                   type: number
 *                 postComments:
 *                   type: number
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get('/stats/:userId', requireAuth(), activityController.getUserEngagementStats);

export default router;