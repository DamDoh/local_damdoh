/**
 * Notification Service - Microservice for managing user notifications
 * Handles fetching, marking as read, and notification preferences
 */

import { apiCall } from '@/lib/api-utils';

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'market' | 'social' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, any>;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  categories: {
    market: boolean;
    social: boolean;
    system: boolean;
    farming: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string;
  };
}

export class NotificationService {
  private static instance: NotificationService;
  private cache: Map<string, { data: Notification[], timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 2 * 60 * 1000; // 2 minutes
  private eventListeners: Map<string, ((notifications: Notification[]) => void)[]> = new Map();

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Fetch user notifications
   */
  async fetchNotifications(userId?: string): Promise<Notification[]> {
    const cacheKey = `notifications_${userId || 'current'}`;

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const response = await apiCall<{ notifications: any[] }>('/notifications');
      const notifications: Notification[] = response.notifications.map(this.transformNotification);

      // Cache the data
      this.cache.set(cacheKey, { data: notifications, timestamp: Date.now() });

      // Notify listeners
      this.notifyListeners('updated', notifications);

      return notifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Return cached data if available
      return cached?.data || [];
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await apiCall(`/notifications/${notificationId}/read`, {
        method: 'POST'
      });

      // Update cache optimistically
      this.updateNotificationInCache(notificationId, notification => ({
        ...notification,
        isRead: true
      }));

      // Notify listeners
      const allNotifications = Array.from(this.cache.values()).flatMap(c => c.data);
      this.notifyListeners('updated', allNotifications);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    try {
      await apiCall('/notifications/mark-all-read', {
        method: 'POST'
      });

      // Update all cached notifications
      for (const [key, cached] of this.cache.entries()) {
        const updatedData = cached.data.map(notification => ({
          ...notification,
          isRead: true
        }));
        this.cache.set(key, { ...cached, data: updatedData });
      }

      // Notify listeners
      const allNotifications = Array.from(this.cache.values()).flatMap(c => c.data);
      this.notifyListeners('updated', allNotifications);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Get unread count
   */
  getUnreadCount(notifications?: Notification[]): number {
    if (notifications) {
      return notifications.filter(n => !n.isRead).length;
    }

    // Count from all cached notifications
    let total = 0;
    for (const cached of this.cache.values()) {
      total += cached.data.filter(n => !n.isRead).length;
    }
    return total;
  }

  /**
   * Get notification preferences
   */
  async getPreferences(): Promise<NotificationPreferences> {
    try {
      const response = await apiCall<NotificationPreferences>('/notifications/preferences');
      return response;
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      // Return default preferences
      return {
        email: true,
        push: true,
        sms: false,
        categories: {
          market: true,
          social: true,
          system: true,
          farming: true
        },
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '08:00'
        }
      };
    }
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<void> {
    try {
      await apiCall('/notifications/preferences', {
        method: 'PUT',
        body: JSON.stringify(preferences)
      });
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }

  /**
   * Subscribe to notification updates
   */
  onNotificationsUpdate(callback: (notifications: Notification[]) => void): () => void {
    if (!this.eventListeners.has('updated')) {
      this.eventListeners.set('updated', []);
    }

    this.eventListeners.get('updated')!.push(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.eventListeners.get('updated') || [];
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }

  /**
   * Transform raw notification data
   */
  private transformNotification(raw: any): Notification {
    return {
      id: raw.id || raw._id,
      type: raw.type || 'info',
      title: raw.title || 'Notification',
      message: raw.message || raw.body || '',
      timestamp: new Date(raw.timestamp || raw.createdAt),
      isRead: raw.isRead || false,
      actionUrl: raw.actionUrl,
      actionText: raw.actionText,
      metadata: raw.metadata || {},
      priority: raw.priority || 'medium'
    };
  }

  /**
   * Update notification in cache
   */
  private updateNotificationInCache(notificationId: string, updater: (notification: Notification) => Notification): void {
    for (const [key, cached] of this.cache.entries()) {
      const updatedData = cached.data.map(notification =>
        notification.id === notificationId ? updater(notification) : notification
      );
      this.cache.set(key, { ...cached, data: updatedData });
    }
  }

  /**
   * Notify event listeners
   */
  private notifyListeners(event: string, data: Notification[]): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in notification listener:', error);
      }
    });
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number, totalNotifications: number } {
    let totalNotifications = 0;
    for (const cached of this.cache.values()) {
      totalNotifications += cached.data.length;
    }

    return {
      size: this.cache.size,
      totalNotifications
    };
  }
}