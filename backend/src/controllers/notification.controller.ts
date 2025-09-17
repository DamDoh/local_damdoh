import { Request, Response } from 'express';
import { Notification, NotificationPreferences, NotificationType, NotificationStatus } from '../models/notification.model';
import { User } from '../models/user.model';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export class NotificationController {
  private async sendPushNotification(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<void> {
    try {
      // Get user's FCM token
      const user = await User.findById(userId).select('fcmToken').lean();
      const fcmToken = user?.fcmToken;

      if (!fcmToken) {
        logger.info(`No FCM token found for user ${userId}`);
        return;
      }

      // In a real implementation, you would use FCM or another push service
      // For now, we'll just log the push notification
      logger.info(`Push notification would be sent to user ${userId}:`, {
        title,
        body,
        data,
        token: fcmToken.substring(0, 10) + '...' // Log partial token for security
      });

      // TODO: Integrate with actual push notification service
      // Example with Firebase Admin SDK:
      // const message = {
      //   notification: { title, body },
      //   data: data || {},
      //   token: fcmToken
      // };
      // await admin.messaging().send(message);

    } catch (error) {
      logger.error('Error sending push notification:', error);
    }
  }

  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    body: string,
    actorId?: string,
    linkedEntity?: { collection: string; documentId: string },
    additionalData?: Record<string, any>
  ): Promise<void> {
    try {
      // Don't create notification for self-actions
      if (actorId && userId === actorId) {
        logger.info('Skipping notification creation for self-action');
        return;
      }

      logger.info(`Creating notification for user ${userId}, type: ${type}`);

      // Check user preferences
      const preferences = await NotificationPreferences.findOne({ user: userId }).lean();
      if (preferences) {
        // Check if this notification type is enabled for in-app notifications
        if (!preferences.inApp.enabled || !preferences.inApp.types.includes(type)) {
          logger.info(`Notification type ${type} is disabled for user ${userId}`);
          return;
        }

        // Check quiet hours
        if (preferences.quietHours.enabled) {
          const now = new Date();
          const currentTime = now.toLocaleTimeString('en-US', {
            hour12: false,
            timeZone: preferences.quietHours.timezone
          });

          if (this.isInQuietHours(currentTime, preferences.quietHours.start, preferences.quietHours.end)) {
            logger.info(`Skipping notification during quiet hours for user ${userId}`);
            return;
          }
        }
      }

      // Create notification document
      const notificationId = uuidv4();
      const notification = new Notification({
        notificationId,
        user: userId,
        type,
        title,
        body,
        actor: actorId,
        linkedEntity,
        data: additionalData,
        status: NotificationStatus.UNREAD,
        isRead: false,
      });

      await notification.save();
      logger.info(`Notification created: ${notificationId}`);

      // Send push notification if enabled
      if (preferences?.push.enabled && preferences.push.types.includes(type)) {
        await this.sendPushNotification(userId, title, body, {
          notificationId,
          type,
          linkedCollection: linkedEntity?.collection || '',
          linkedDocumentId: linkedEntity?.documentId || '',
          ...additionalData,
        });
      }

    } catch (error) {
      logger.error('Error creating notification:', error);
    }
  }

  private isInQuietHours(currentTime: string, startTime: string, endTime: string): boolean {
    // Convert times to minutes since midnight for comparison
    const current = this.timeToMinutes(currentTime);
    const start = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);

    if (start < end) {
      // Same day range
      return current >= start && current <= end;
    } else {
      // Overnight range
      return current >= start || current <= end;
    }
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  async markNotificationAsRead(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const { notificationId } = req.params;

      if (!notificationId) {
        return res.status(400).json({ error: 'Notification ID is required' });
      }

      const notification = await Notification.findOne({
        notificationId,
        user: userId
      });

      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      if (notification.user.toString() !== userId) {
        return res.status(403).json({ error: 'You do not have permission to update this notification' });
      }

      await Notification.findByIdAndUpdate(notification._id, {
        status: NotificationStatus.READ,
        isRead: true,
        readAt: new Date(),
      });

      res.json({ status: 'success', message: 'Notification marked as read' });
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      res.status(500).json({ error: 'Failed to mark notification as read' });
    }
  }

  async markMultipleNotificationsAsRead(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const { notificationIds } = req.body;

      if (!Array.isArray(notificationIds)) {
        return res.status(400).json({ error: 'notificationIds must be an array' });
      }

      const result = await Notification.updateMany(
        {
          notificationId: { $in: notificationIds },
          user: userId
        },
        {
          status: NotificationStatus.READ,
          isRead: true,
          readAt: new Date(),
        }
      );

      res.json({
        status: 'success',
        message: `${result.modifiedCount} notifications marked as read`,
        modifiedCount: result.modifiedCount
      });
    } catch (error) {
      logger.error('Error marking multiple notifications as read:', error);
      res.status(500).json({ error: 'Failed to mark notifications as read' });
    }
  }

  async getNotifications(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const {
        status,
        type,
        limit = 20,
        page = 1,
        includeRead = true
      } = req.query;

      const query: any = { user: userId };

      if (status) {
        query.status = status;
      }

      if (type) {
        query.type = type;
      }

      if (!includeRead || includeRead === 'false') {
        query.status = NotificationStatus.UNREAD;
      }

      const skip = (Number(page) - 1) * Number(limit);

      const notifications = await Notification.find(query)
        .populate('actor', 'name displayName avatarUrl')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean();

      const total = await Notification.countDocuments(query);

      res.json({
        notifications: notifications.map(notification => ({
          id: notification._id,
          notificationId: notification.notificationId,
          type: notification.type,
          title: notification.title,
          body: notification.body,
          actor: notification.actor,
          linkedEntity: notification.linkedEntity,
          data: notification.data,
          status: notification.status,
          isRead: notification.isRead,
          createdAt: notification.createdAt,
          readAt: notification.readAt,
        })),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      logger.error('Error fetching notifications:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  }

  async manageNotificationPreferences(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const { preferences } = req.body;

      if (preferences) {
        // Update preferences
        await NotificationPreferences.findOneAndUpdate(
          { user: userId },
          { ...preferences, user: userId },
          { upsert: true, new: true }
        );

        res.json({
          success: true,
          message: 'Notification preferences updated successfully'
        });
      } else {
        // Get current preferences
        const userPreferences = await NotificationPreferences.findOne({ user: userId }).lean();

        if (!userPreferences) {
          // Return default preferences
          const defaultPreferences = {
            email: {
              enabled: true,
              types: Object.values(NotificationType),
            },
            push: {
              enabled: true,
              types: Object.values(NotificationType),
            },
            inApp: {
              enabled: true,
              types: Object.values(NotificationType),
            },
            quietHours: {
              enabled: false,
              start: '22:00',
              end: '08:00',
              timezone: 'UTC',
            },
          };

          res.json(defaultPreferences);
        } else {
          res.json({
            email: userPreferences.email,
            push: userPreferences.push,
            inApp: userPreferences.inApp,
            quietHours: userPreferences.quietHours,
          });
        }
      }
    } catch (error) {
      logger.error('Error managing notification preferences:', error);
      res.status(500).json({ error: 'Failed to manage notification preferences' });
    }
  }

  async getNotificationStats(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;

      const stats = await Notification.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            unread: {
              $sum: {
                $cond: [{ $eq: ['$status', NotificationStatus.UNREAD] }, 1, 0]
              }
            },
            read: {
              $sum: {
                $cond: [{ $eq: ['$status', NotificationStatus.READ] }, 1, 0]
              }
            },
            archived: {
              $sum: {
                $cond: [{ $eq: ['$status', NotificationStatus.ARCHIVED] }, 1, 0]
              }
            },
            byType: {
              $push: '$type'
            }
          }
        }
      ]);

      const result = stats[0] || {
        total: 0,
        unread: 0,
        read: 0,
        archived: 0,
        byType: []
      };

      // Count by type
      const typeCounts: Record<string, number> = {};
      result.byType.forEach((type: string) => {
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });

      res.json({
        stats: {
          totalNotifications: result.total,
          unreadCount: result.unread,
          readCount: result.read,
          archivedCount: result.archived,
          notificationsByType: typeCounts,
        }
      });
    } catch (error) {
      logger.error('Error fetching notification stats:', error);
      res.status(500).json({ error: 'Failed to fetch notification statistics' });
    }
  }

  async archiveNotification(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const { notificationId } = req.params;

      if (!notificationId) {
        return res.status(400).json({ error: 'Notification ID is required' });
      }

      const notification = await Notification.findOne({
        notificationId,
        user: userId
      });

      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      await Notification.findByIdAndUpdate(notification._id, {
        status: NotificationStatus.ARCHIVED,
      });

      res.json({ status: 'success', message: 'Notification archived' });
    } catch (error) {
      logger.error('Error archiving notification:', error);
      res.status(500).json({ error: 'Failed to archive notification' });
    }
  }

  async deleteNotification(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const { notificationId } = req.params;

      if (!notificationId) {
        return res.status(400).json({ error: 'Notification ID is required' });
      }

      const result = await Notification.deleteOne({
        notificationId,
        user: userId
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      res.json({ status: 'success', message: 'Notification deleted' });
    } catch (error) {
      logger.error('Error deleting notification:', error);
      res.status(500).json({ error: 'Failed to delete notification' });
    }
  }
}