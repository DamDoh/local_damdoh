import express from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { requireAuth } from '../middleware/requireAuth';

const router = express.Router();
const notificationController = new NotificationController();

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Get user notifications
 *     description: Retrieve notifications for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [unread, read, archived]
 *         description: Filter by notification status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [profile_view, new_connection_request, like, comment, new_order, event_reminder, service_reminder, system, marketplace, community]
 *         description: Filter by notification type
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Maximum number of notifications to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: includeRead
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Whether to include read notifications
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notifications:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       notificationId:
 *                         type: string
 *                       type:
 *                         type: string
 *                       title:
 *                         type: string
 *                       body:
 *                         type: string
 *                       actor:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           displayName:
 *                             type: string
 *                           avatarUrl:
 *                             type: string
 *                       linkedEntity:
 *                         type: object
 *                         properties:
 *                           collection:
 *                             type: string
 *                           documentId:
 *                             type: string
 *                       data:
 *                         type: object
 *                       status:
 *                         type: string
 *                       isRead:
 *                         type: boolean
 *                       createdAt:
 *                         type: string
 *                       readAt:
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
router.get('/', requireAuth(), notificationController.getNotifications);

/**
 * @swagger
 * /api/notifications/mark-read:
 *   post:
 *     tags: [Notifications]
 *     summary: Mark multiple notifications as read
 *     description: Mark multiple notifications as read for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - notificationIds
 *             properties:
 *               notificationIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of notification IDs to mark as read
 *     responses:
 *       200:
 *         description: Notifications marked as read successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/mark-read', requireAuth(), notificationController.markMultipleNotificationsAsRead);

/**
 * @swagger
 * /api/notifications/{notificationId}/read:
 *   put:
 *     tags: [Notifications]
 *     summary: Mark notification as read
 *     description: Mark a specific notification as read for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Notification not found
 */
router.put('/:notificationId/read', requireAuth(), notificationController.markNotificationAsRead);

/**
 * @swagger
 * /api/notifications/{notificationId}/archive:
 *   put:
 *     tags: [Notifications]
 *     summary: Archive notification
 *     description: Archive a specific notification for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification archived successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Notification not found
 */
router.put('/:notificationId/archive', requireAuth(), notificationController.archiveNotification);

/**
 * @swagger
 * /api/notifications/{notificationId}:
 *   delete:
 *     tags: [Notifications]
 *     summary: Delete notification
 *     description: Delete a specific notification for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Notification not found
 */
router.delete('/:notificationId', requireAuth(), notificationController.deleteNotification);

/**
 * @swagger
 * /api/notifications/preferences:
 *   get:
 *     tags: [Notifications]
 *     summary: Get notification preferences
 *     description: Get notification preferences for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notification preferences retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: object
 *                   properties:
 *                     enabled:
 *                       type: boolean
 *                     types:
 *                       type: array
 *                       items:
 *                         type: string
 *                 push:
 *                   type: object
 *                   properties:
 *                     enabled:
 *                       type: boolean
 *                     types:
 *                       type: array
 *                       items:
 *                         type: string
 *                 inApp:
 *                   type: object
 *                   properties:
 *                     enabled:
 *                       type: boolean
 *                     types:
 *                       type: array
 *                       items:
 *                         type: string
 *                 quietHours:
 *                   type: object
 *                   properties:
 *                     enabled:
 *                       type: boolean
 *                     start:
 *                       type: string
 *                     end:
 *                       type: string
 *                     timezone:
 *                       type: string
 *       401:
 *         description: Unauthorized
 */
router.get('/preferences', requireAuth(), notificationController.manageNotificationPreferences);

/**
 * @swagger
 * /api/notifications/preferences:
 *   put:
 *     tags: [Notifications]
 *     summary: Update notification preferences
 *     description: Update notification preferences for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: object
 *                 properties:
 *                   enabled:
 *                     type: boolean
 *                   types:
 *                     type: array
 *                     items:
 *                       type: string
 *                       enum: [profile_view, new_connection_request, like, comment, new_order, event_reminder, service_reminder, system, marketplace, community]
 *               push:
 *                 type: object
 *                 properties:
 *                   enabled:
 *                     type: boolean
 *                   types:
 *                     type: array
 *                     items:
 *                       type: string
 *                       enum: [profile_view, new_connection_request, like, comment, new_order, event_reminder, service_reminder, system, marketplace, community]
 *               inApp:
 *                 type: object
 *                 properties:
 *                   enabled:
 *                     type: boolean
 *                   types:
 *                     type: array
 *                     items:
 *                       type: string
 *                       enum: [profile_view, new_connection_request, like, comment, new_order, event_reminder, service_reminder, system, marketplace, community]
 *               quietHours:
 *                 type: object
 *                 properties:
 *                   enabled:
 *                     type: boolean
 *                   start:
 *                     type: string
 *                     description: Start time in HH:MM format
 *                   end:
 *                     type: string
 *                     description: End time in HH:MM format
 *                   timezone:
 *                     type: string
 *                     description: Timezone identifier
 *     responses:
 *       200:
 *         description: Notification preferences updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.put('/preferences', requireAuth(), notificationController.manageNotificationPreferences);

/**
 * @swagger
 * /api/notifications/stats:
 *   get:
 *     tags: [Notifications]
 *     summary: Get notification statistics
 *     description: Get statistics about notifications for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notification statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalNotifications:
 *                       type: integer
 *                     unreadCount:
 *                       type: integer
 *                     readCount:
 *                       type: integer
 *                     archivedCount:
 *                       type: integer
 *                     notificationsByType:
 *                       type: object
 *                       additionalProperties:
 *                         type: integer
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', requireAuth(), notificationController.getNotificationStats);

/**
 * @swagger
 * /api/notifications/mark-all-read:
 *   post:
 *     tags: [Notifications]
 *     summary: Mark all notifications as read
 *     description: Mark all unread notifications as read for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/mark-all-read', requireAuth(), async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const userId = (req.user as any).userId || (req.user as any).id;

    const result = await require('../models/notification.model').Notification.updateMany(
      { user: userId, status: 'unread' },
      {
        status: 'read',
        isRead: true,
        readAt: new Date(),
      }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

export default router;